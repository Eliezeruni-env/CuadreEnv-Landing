/**
 * CuadreEnv Landing — API ligera de prospectos (leads)
 * ----------------------------------------------------
 * - Cero dependencias: node:http + node:sqlite (Node >= 22.13)
 * - Público:   POST /api/leads            → registra un interesado
 *              GET  /api/health           → estado del servicio
 * - Privado (Authorization: Bearer ADMIN_TOKEN) — pensado para el USM:
 *              GET   /api/leads           → listado paginado y filtrable
 *              GET   /api/leads/stats     → conteos por estado / tipo de negocio
 *              GET   /api/leads/:id       → detalle
 *              PATCH /api/leads/:id       → actualizar estado / notas / asignado
 * - En producción sirve también el build estático de Vite (./dist).
 */
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDatabase, LEAD_STATUSES } from './db.js';
import { validateLead } from './validation.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

const PORT = Number(process.env.API_PORT || process.env.PORT || 8787);
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'cuadreenv-admin-leads-token-2026';
const CORS_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5180,http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
const DB_PATH = path.resolve(ROOT, process.env.DB_PATH || './data/leads.db');

mkdirSync(path.dirname(DB_PATH), { recursive: true });
const repo = openDatabase(DB_PATH);

if (!ADMIN_TOKEN) {
  console.warn('[landing-api] ⚠ ADMIN_TOKEN no está definido: los endpoints privados quedan deshabilitados.');
}

// ---------------------------------------------------------------------------
// Utilidades HTTP
// ---------------------------------------------------------------------------
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (origin && CORS_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '600');
  }
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(body);
}

async function readJsonBody(req, limitBytes = 32 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limitBytes) {
        reject(Object.assign(new Error('Payload demasiado grande'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(Object.assign(new Error('JSON inválido'), { status: 400 }));
      }
    });
    req.on('error', reject);
  });
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return req.socket.remoteAddress || '';
}

function isAuthorized(req) {
  if (!ADMIN_TOKEN) return false;
  const header = req.headers.authorization || '';
  return header === `Bearer ${ADMIN_TOKEN}`;
}

// Rate limit en memoria: máx. 5 envíos por IP cada 10 minutos
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const rateBuckets = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const bucket = (rateBuckets.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (bucket.length >= RATE_MAX) {
    rateBuckets.set(ip, bucket);
    return true;
  }
  bucket.push(now);
  rateBuckets.set(ip, bucket);
  return false;
}
setInterval(() => {
  const now = Date.now();
  for (const [ip, times] of rateBuckets) {
    if (!times.some((t) => now - t < RATE_WINDOW_MS)) rateBuckets.delete(ip);
  }
}, RATE_WINDOW_MS).unref();

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------
async function handleCreateLead(req, res) {
  const ip = clientIp(req);
  const body = await readJsonBody(req);

  // Honeypot anti-bots: el campo "website" está oculto para humanos
  if (body && typeof body.website === 'string' && body.website.trim() !== '') {
    return sendJson(res, 201, { ok: true, id: null });
  }

  if (rateLimited(ip)) {
    return sendJson(res, 429, {
      ok: false,
      message: 'Has enviado varias solicitudes seguidas. Intenta de nuevo en unos minutos.',
    });
  }

  const { data, errors } = validateLead(body);
  if (errors) {
    return sendJson(res, 422, { ok: false, message: 'Revisa los campos marcados.', errors });
  }

  const id = repo.insertLead({
    ...data,
    ip,
    userAgent: String(req.headers['user-agent'] || '').slice(0, 300),
  });

  console.log(`[landing-api] ✔ Nuevo lead #${id}: ${data.companyName} (${data.businessType}) — ${data.email}`);
  return sendJson(res, 201, { ok: true, id });
}

function handleListLeads(req, res, url) {
  const q = url.searchParams;
  const result = repo.listLeads({
    status: q.get('status') || undefined,
    search: q.get('q') || undefined,
    businessType: q.get('businessType') || undefined,
    page: Math.max(1, Number(q.get('page') || 1)),
    pageSize: Math.min(100, Math.max(1, Number(q.get('pageSize') || 20))),
  });
  return sendJson(res, 200, { ok: true, ...result });
}

async function handlePatchLead(req, res, id) {
  const body = await readJsonBody(req);
  const patch = {};
  if (body.status !== undefined) {
    if (!LEAD_STATUSES.includes(body.status)) {
      return sendJson(res, 422, { ok: false, message: `Estado inválido. Usa: ${LEAD_STATUSES.join(', ')}` });
    }
    patch.status = body.status;
  }
  if (body.notes !== undefined) patch.notes = String(body.notes).slice(0, 4000);
  if (body.assignedTo !== undefined) patch.assignedTo = String(body.assignedTo).slice(0, 120);

  const updated = repo.updateLead(id, patch);
  if (!updated) return sendJson(res, 404, { ok: false, message: 'Lead no encontrado' });
  return sendJson(res, 200, { ok: true, data: updated });
}

async function serveStatic(req, res, pathname) {
  if (!existsSync(DIST)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Build no encontrado. En desarrollo usa "npm run dev" (Vite en http://localhost:5180).');
  }
  const safePath = path.normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, '');
  let filePath = path.join(DIST, safePath);
  if (!filePath.startsWith(DIST)) {
    res.writeHead(403);
    return res.end();
  }
  try {
    const info = await stat(filePath);
    if (info.isDirectory()) filePath = path.join(filePath, 'index.html');
  } catch {
    filePath = path.join(DIST, 'index.html'); // fallback SPA
  }
  try {
    const content = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const isAsset = filePath.includes(`${path.sep}assets${path.sep}`);
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': isAsset ? 'public, max-age=31536000, immutable' : 'no-cache',
    });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const { pathname } = url;

  try {
    if (pathname.startsWith('/api/')) {
      applyCors(req, res);
      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
      }

      if (pathname === '/api/health' && req.method === 'GET') {
        return sendJson(res, 200, { ok: true, service: 'cuadreenv-landing-api', time: new Date().toISOString() });
      }

      if (pathname === '/api/leads' && req.method === 'POST') {
        return await handleCreateLead(req, res);
      }

      // ---- Endpoints privados (USM) ----
      if (pathname === '/api/leads' || pathname.startsWith('/api/leads/')) {
        if (!isAuthorized(req)) return sendJson(res, 401, { ok: false, message: 'No autorizado' });

        if (pathname === '/api/leads' && req.method === 'GET') return handleListLeads(req, res, url);
        if (pathname === '/api/leads/stats' && req.method === 'GET') {
          return sendJson(res, 200, { ok: true, data: repo.stats() });
        }

        const match = pathname.match(/^\/api\/leads\/(\d+)$/);
        if (match) {
          const id = Number(match[1]);
          if (req.method === 'GET') {
            const lead = repo.getLead(id);
            return lead
              ? sendJson(res, 200, { ok: true, data: lead })
              : sendJson(res, 404, { ok: false, message: 'Lead no encontrado' });
          }
          if (req.method === 'PATCH') return await handlePatchLead(req, res, id);
        }
      }

      return sendJson(res, 404, { ok: false, message: 'Ruta no encontrada' });
    }

    if (req.method === 'GET' || req.method === 'HEAD') return await serveStatic(req, res, pathname);
    res.writeHead(405);
    res.end();
  } catch (err) {
    const status = err.status || 500;
    if (status === 500) console.error('[landing-api] Error:', err);
    if (!res.headersSent) sendJson(res, status, { ok: false, message: status === 500 ? 'Error interno' : err.message });
  }
});

server.listen(PORT, () => {
  console.log(`[landing-api] 🚀 Escuchando en http://localhost:${PORT}  (DB: ${path.relative(ROOT, DB_PATH)})`);
});
