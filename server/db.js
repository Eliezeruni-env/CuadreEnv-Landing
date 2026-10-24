/**
 * Capa de datos — SQLite nativo de Node (node:sqlite).
 * Un único archivo .db, sin servidor ni compilaciones nativas.
 */
import { DatabaseSync } from 'node:sqlite';

/** Pipeline comercial: nuevo → contactado → calificado → propuesta → ganado/perdido */
export const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];

const SCHEMA = `
CREATE TABLE IF NOT EXISTS leads (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  status          TEXT    NOT NULL DEFAULT 'new',

  -- Contacto
  full_name       TEXT    NOT NULL,
  email           TEXT    NOT NULL,
  phone           TEXT    NOT NULL,
  job_role        TEXT,

  -- Empresa
  company_name    TEXT    NOT NULL,
  rnc             TEXT,
  business_type   TEXT    NOT NULL,
  branches        TEXT,
  registers       TEXT,
  city            TEXT,

  -- Necesidad
  modules         TEXT    NOT NULL DEFAULT '[]',   -- JSON array
  current_system  TEXT,
  timeline        TEXT,
  contact_pref    TEXT,
  message         TEXT,

  -- Seguimiento interno (USM)
  notes           TEXT,
  assigned_to     TEXT,

  -- Metadatos
  source          TEXT,
  utm             TEXT,                            -- JSON object
  ip              TEXT,
  user_agent      TEXT
);
CREATE INDEX IF NOT EXISTS idx_leads_status     ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_email      ON leads(email);
`;

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    jobRole: row.job_role,
    companyName: row.company_name,
    rnc: row.rnc,
    businessType: row.business_type,
    branches: row.branches,
    registers: row.registers,
    city: row.city,
    modules: safeJson(row.modules, []),
    currentSystem: row.current_system,
    timeline: row.timeline,
    contactPref: row.contact_pref,
    message: row.message,
    notes: row.notes,
    assignedTo: row.assigned_to,
    source: row.source,
    utm: safeJson(row.utm, null),
  };
}

function safeJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function openDatabase(filePath) {
  const db = new DatabaseSync(filePath);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(SCHEMA);

  const insertStmt = db.prepare(`
    INSERT INTO leads (
      full_name, email, phone, job_role,
      company_name, rnc, business_type, branches, registers, city,
      modules, current_system, timeline, contact_pref, message,
      source, utm, ip, user_agent
    ) VALUES (
      :fullName, :email, :phone, :jobRole,
      :companyName, :rnc, :businessType, :branches, :registers, :city,
      :modules, :currentSystem, :timeline, :contactPref, :message,
      :source, :utm, :ip, :userAgent
    )
  `);
  const getStmt = db.prepare('SELECT * FROM leads WHERE id = ?');

  return {
    insertLead(lead) {
      const result = insertStmt.run({
        fullName: lead.fullName,
        email: lead.email,
        phone: lead.phone,
        jobRole: lead.jobRole ?? null,
        companyName: lead.companyName,
        rnc: lead.rnc ?? null,
        businessType: lead.businessType,
        branches: lead.branches ?? null,
        registers: lead.registers ?? null,
        city: lead.city ?? null,
        modules: JSON.stringify(lead.modules || []),
        currentSystem: lead.currentSystem ?? null,
        timeline: lead.timeline ?? null,
        contactPref: lead.contactPref ?? null,
        message: lead.message ?? null,
        source: lead.source ?? 'landing',
        utm: lead.utm ? JSON.stringify(lead.utm) : null,
        ip: lead.ip ?? null,
        userAgent: lead.userAgent ?? null,
      });
      return Number(result.lastInsertRowid);
    },

    getLead(id) {
      return mapRow(getStmt.get(id));
    },

    listLeads({ status, search, businessType, page = 1, pageSize = 20 }) {
      const where = [];
      const params = {};
      if (status) {
        where.push('status = :status');
        params.status = status;
      }
      if (businessType) {
        where.push('business_type = :businessType');
        params.businessType = businessType;
      }
      if (search) {
        where.push('(full_name LIKE :q OR email LIKE :q OR company_name LIKE :q OR phone LIKE :q OR city LIKE :q)');
        params.q = `%${search}%`;
      }
      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
      const total = Number(db.prepare(`SELECT COUNT(*) AS c FROM leads ${whereSql}`).get(params).c);
      const rows = db
        .prepare(`SELECT * FROM leads ${whereSql} ORDER BY created_at DESC LIMIT :limit OFFSET :offset`)
        .all({ ...params, limit: pageSize, offset: (page - 1) * pageSize });
      return {
        items: rows.map(mapRow),
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      };
    },

    updateLead(id, patch) {
      const sets = [];
      const params = { id };
      if (patch.status !== undefined) {
        sets.push('status = :status');
        params.status = patch.status;
      }
      if (patch.notes !== undefined) {
        sets.push('notes = :notes');
        params.notes = patch.notes;
      }
      if (patch.assignedTo !== undefined) {
        sets.push('assigned_to = :assignedTo');
        params.assignedTo = patch.assignedTo;
      }
      if (!sets.length) return this.getLead(id);
      sets.push(`updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')`);
      const result = db.prepare(`UPDATE leads SET ${sets.join(', ')} WHERE id = :id`).run(params);
      if (Number(result.changes) === 0) return null;
      return this.getLead(id);
    },

    stats() {
      const byStatus = Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0]));
      for (const r of db.prepare('SELECT status, COUNT(*) AS c FROM leads GROUP BY status').all()) {
        byStatus[r.status] = Number(r.c);
      }
      const byBusinessType = db
        .prepare('SELECT business_type AS type, COUNT(*) AS c FROM leads GROUP BY business_type ORDER BY c DESC')
        .all()
        .map((r) => ({ type: r.type, count: Number(r.c) }));
      const last7Days = Number(
        db.prepare(`SELECT COUNT(*) AS c FROM leads WHERE created_at >= strftime('%Y-%m-%dT%H:%M:%fZ','now','-7 days')`).get().c,
      );
      const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
      return { total, last7Days, byStatus, byBusinessType };
    },
  };
}
