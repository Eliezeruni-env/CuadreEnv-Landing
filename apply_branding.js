import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================================================
// 1. UPDATE index.html
// ============================================================================
const htmlPath = path.resolve(__dirname, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// A. Head meta and favicons
html = html.replace(
  '<meta name="theme-color" content="#2563eb" />',
  `<meta name="theme-color" content="#0B132B" />
    <meta property="og:image" content="/brand/cuadreEnv-logo-original.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/brand/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/brand/favicon-16x16.png" />
    <link rel="apple-touch-icon" href="/brand/apple-touch-icon.png" />`
);
html = html.replace('<link rel="icon" href="/favicon.svg" type="image/svg+xml" />', '');

// B. Nav Brand
const oldNav = `<a href="#inicio" class="brand" aria-label="CuadreEnv, ir al inicio">
          <span class="brand-mark"><svg class="icon" stroke-width="3"><use href="#i-logo" /></svg></span>
          <span>Cuadre<em>Env</em></span>
        </a>`;

const newNav = `<a href="#inicio" class="brand" aria-label="CuadreEnv, ir al inicio">
          <img
            src="/brand/cuadreEnv-logo-white.png"
            srcset="/brand/cuadreEnv-logo-white.png 1x, /brand/cuadreEnv-logo-white@2x.png 2x"
            alt="CuadreEnv · Inventario • Control • Eficiencia"
            class="brand-logo-img"
            width="180"
            height="62"
          />
        </a>`;

if (html.includes(oldNav)) {
  html = html.replace(oldNav, newNav);
}

// C. Mobile Menu Header Brand
if (!html.includes('class="mobile-menu-brand"')) {
  html = html.replace(
    '<div class="mobile-menu" id="mobile-menu">',
    `<div class="mobile-menu" id="mobile-menu">
      <div class="mobile-menu-brand">
        <img src="/brand/cuadreEnv-logo-white.png" alt="CuadreEnv" class="brand-logo-img" style="height: 38px; width: auto;" />
      </div>`
  );
}

// D. Hero Mockup Sidebar Signet Logo
if (!html.includes('mock-side-logo')) {
  html = html.replace(
    '<div class="mock-side">',
    `<div class="mock-side">
                  <div class="mock-side-logo">
                    <img src="/brand/cuadreEnv-signet-white.png" alt="CuadreEnv" style="width: 28px; height: 28px; object-fit: contain;" />
                  </div>`
  );
}

// E. Footer Brand
const oldFooter = `<div class="footer-brand">
            <a href="#inicio" class="brand">
              <span class="brand-mark"><svg class="icon" stroke-width="3"><use href="#i-logo" /></svg></span>
              <span>Cuadre<em>Env</em></span>
            </a>
            <p>Punto de venta, caja, inventario y facturación con NCF para negocios dominicanos.</p>
          </div>`;

const newFooter = `<div class="footer-brand">
            <a href="#inicio" class="brand" aria-label="CuadreEnv">
              <img
                src="/brand/cuadreEnv-logo-white.png"
                srcset="/brand/cuadreEnv-logo-white.png 1x, /brand/cuadreEnv-logo-white@2x.png 2x"
                alt="CuadreEnv · Inventario • Control • Eficiencia"
                class="brand-logo-img"
                width="190"
                height="66"
              />
            </a>
            <p>Punto de venta táctil, arqueo ciego, inventario multi-almacén y facturación NCF/DGII para negocios dominicanos.</p>
          </div>`;

if (html.includes(oldFooter)) {
  html = html.replace(oldFooter, newFooter);
}

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('1. index.html updated successfully with official branding and logos');

// ============================================================================
// 2. UPDATE src/styles.css with Dark Navy & Crimson Brand Aesthetic
// ============================================================================
const cssPath = path.resolve(__dirname, 'src/styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace Root Tokens with the Dark Navy & CuadreEnv Red Palette
const oldRootRegex = /:root\s*\{[\s\S]*?--nav-h:\s*72px;\s*\}/;

const newRootTokens = `:root {
  /* ---- Marca CuadreEnv (Alineada con CuadreEnv-web) ---- */
  /* Rojo CuadreEnv Oficial (de "Env" y el lazo del logo) */
  --rose-700: #be123c;
  --rose-600: #e11d48;
  --rose-500: #f43f5e;
  --rose-400: #fb7185;
  --rose-200: #fecdd3;
  --rose-100: rgba(225, 29, 72, 0.22);
  --rose-50: rgba(225, 29, 72, 0.12);

  /* Azul Eléctrico / Índigo (Items activos del POS) */
  --brand-800: #312e81;
  --brand-700: #3730a3;
  --brand-600: #4f46e5;
  --brand-500: #6366f1;
  --brand-400: #818cf8;
  --brand-200: #c7d2fe;
  --brand-100: rgba(79, 70, 229, 0.22);
  --brand-50: rgba(79, 70, 229, 0.12);

  /* Menta / Esmeralda (Ventas, Caja Cuadrada y Status POS) */
  --mint-700: #047857;
  --mint-600: #059669;
  --mint-500: #10b981;
  --mint-400: #34d399;
  --mint-100: rgba(16, 185, 129, 0.22);
  --mint-50: rgba(16, 185, 129, 0.1);

  /* Ámbar / Alertas */
  --amber-600: #d97706;
  --amber-500: #f59e0b;
  --amber-50: rgba(245, 158, 11, 0.12);

  --violet-600: #7c3aed;
  --violet-50: rgba(124, 58, 237, 0.12);

  /* ---- Paleta Midnight Slate / Dark Navy (Exacta al Sidebar POS) ---- */
  --ink-950: #030712;        /* Negro fondo profundo */
  --ink-900: #f8fafc;        /* Encabezados y títulos principales (blanco limpio) */
  --ink-800: #f1f5f9;        /* Texto destacado */
  --ink-700: #cbd5e1;        /* Texto de lectura */
  --ink-600: #94a3b8;        /* Texto secundario / iconos */
  --ink-500: #64748b;        /* Subtítulos y etiquetas muted */
  --ink-400: #475569;        /* Bordes activos */
  --ink-300: #334155;        /* Bordes medios */
  --ink-200: #1e293b;        /* Líneas y divisores oficiales (#1e293b en web) */
  --ink-100: #131f37;        /* Superficie elevada / hover */
  --ink-50: #0e172a;         /* Superficie de tarjeta (#0f172a en web) */
  --white: #ffffff;

  /* ---- Tokens Semánticos para Dark Mode ---- */
  --bg: #070d18;             /* Canvas global azul noche ultra-profundo */
  --surface: #0e172a;        /* Fondo tarjetas y módulos (igual a sidebar web) */
  --surface-raised: #142036; /* Tarjetas elevadas, modales y popovers */
  --surface-alt: #0a1120;    /* Secciones alternas */
  --surface-input: #080e1a;  /* Campos de formulario */
  --text: #f8fafc;           /* Blanco puro de alto contraste */
  --text-body: #cbd5e1;      /* Slate 300 legible */
  --text-muted: #8292a6;     /* Slate 400 */
  --line: #1e293b;           /* Borde dark navy oficial */
  --line-strong: #334155;
  --line-subtle: rgba(255, 255, 255, 0.08);
  --focus: var(--rose-500);

  /* ---- Tipografía ---- */
  --font: 'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --fs-xs: 0.75rem;
  --fs-sm: 0.875rem;
  --fs-base: 1rem;
  --fs-md: 1.125rem;
  --fs-lg: 1.25rem;
  --fs-xl: clamp(1.5rem, 1.2rem + 1vw, 1.875rem);
  --fs-2xl: clamp(1.875rem, 1.4rem + 1.8vw, 2.75rem);
  --fs-hero: clamp(2.4rem, 1.6rem + 3.4vw, 4.25rem);

  /* ---- Espaciado (8pt) ---- */
  --s-1: 4px;
  --s-2: 8px;
  --s-3: 12px;
  --s-4: 16px;
  --s-5: 20px;
  --s-6: 24px;
  --s-8: 32px;
  --s-10: 40px;
  --s-12: 48px;
  --s-16: 64px;
  --s-20: 80px;
  --s-24: 96px;
  --section-y: clamp(72px, 6vw + 40px, 128px);

  /* ---- Radios ---- */
  --r-sm: 8px;
  --r-md: 12px;
  --r-lg: 16px;
  --r-xl: 20px;
  --r-2xl: 28px;
  --r-pill: 999px;

  /* ---- Sombras & Resplandores Dark Mode ---- */
  --sh-xs: 0 1px 3px rgba(0, 0, 0, 0.4);
  --sh-sm: 0 4px 14px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.04);
  --sh-md: 0 16px 36px -8px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.07);
  --sh-lg: 0 28px 72px -16px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.09);
  --sh-brand: 0 10px 28px -6px rgba(225, 29, 72, 0.55);
  --sh-indigo: 0 10px 28px -6px rgba(79, 70, 229, 0.5);

  /* ---- Motion ---- */
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  --t-fast: 160ms;
  --t-med: 320ms;
  --t-slow: 700ms;

  --container: 1200px;
  --nav-h: 76px;
}`;

css = css.replace(oldRootRegex, newRootTokens);

// Additional Dark Mode Overrides & Brand Alignment
const customBrandOverrides = `
/* ==========================================================================
   CuadreEnv Brand & Dark Theme Overrides (Synced with CuadreEnv-web)
   ========================================================================== */

/* Brand Logo Image in Navbar and Footer */
.brand {
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 12px;
}
.brand-logo-img {
  height: 42px;
  width: auto;
  max-width: 210px;
  object-fit: contain;
  display: block;
  transition: transform var(--t-fast) var(--ease), opacity var(--t-fast) var(--ease);
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4));
}
.brand:hover .brand-logo-img {
  transform: scale(1.02);
  opacity: 0.95;
}
.footer-brand .brand-logo-img {
  height: 46px;
}
.mobile-menu-brand {
  padding: var(--s-3) var(--s-4);
  border-bottom: 1px solid var(--line);
  margin-bottom: var(--s-2);
}

/* Navbar glass & link states */
.nav {
  background: rgba(7, 13, 24, 0.75);
  backdrop-filter: saturate(180%) blur(16px);
  -webkit-backdrop-filter: saturate(180%) blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.nav.is-scrolled {
  background: rgba(7, 13, 24, 0.92);
  border-bottom-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5);
}
.nav-links {
  background: rgba(14, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 4px;
}
.nav-links a {
  color: #94a3b8;
}
.nav-links a:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
}
.nav-links a.is-active {
  color: #ffffff;
  background: #4f46e5;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.45);
}

/* Hero Section Blobs & Background */
.hero-bg::before {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
}
.blob-1 {
  background: #3730a3;
  opacity: 0.45;
  filter: blur(95px);
}
.blob-2 {
  background: #9f1239;
  opacity: 0.35;
  filter: blur(95px);
}
.blob-3 {
  background: #0284c7;
  opacity: 0.25;
  filter: blur(90px);
}

/* Primary Button in CuadreEnv Red */
.btn-primary {
  --btn-bg: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
  --btn-fg: #ffffff;
  --btn-bd: transparent;
  background: var(--btn-bg);
  color: var(--btn-fg);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 24px -4px rgba(225, 29, 72, 0.55);
  transition: all var(--t-fast) var(--ease);
}
.btn-primary:hover {
  --btn-bg: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
  box-shadow: 0 12px 30px -4px rgba(225, 29, 72, 0.7);
  transform: translateY(-2px);
}

/* Secondary outline button */
.btn:not(.btn-primary) {
  background: rgba(255, 255, 255, 0.06);
  color: #f8fafc;
  border: 1px solid rgba(255, 255, 255, 0.12);
}
.btn:not(.btn-primary):hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

/* Hero Badge */
.hero-badge {
  background: rgba(225, 29, 72, 0.12);
  border: 1px solid rgba(225, 29, 72, 0.35);
  color: #fecdd3;
  box-shadow: 0 4px 16px rgba(225, 29, 72, 0.2);
}
.hero-badge .dot {
  background: #e11d48;
  box-shadow: 0 0 10px #e11d48;
}

/* Hero Mockup Dark Window Styling (Matches CuadreEnv-web) */
.mock-window {
  background: #0b132b;
  border: 1px solid #1e293b;
  box-shadow:
    0 32px 80px -16px rgba(0, 0, 0, 0.8),
    0 0 48px -10px rgba(79, 70, 229, 0.3);
}
.mock-bar {
  background: #070c1a;
  border-bottom: 1px solid #1e293b;
}
.mock-bar i:nth-child(1) { background: #ef4444; }
.mock-bar i:nth-child(2) { background: #f59e0b; }
.mock-bar i:nth-child(3) { background: #10b981; }
.mock-url {
  background: #0e172a;
  border: 1px solid #1e293b;
  color: #94a3b8;
}
.mock-side {
  background: #0f172a;
  border-right: 1px solid #1e293b;
}
.mock-side-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 0 14px;
  border-bottom: 1px solid #1e293b;
  margin-bottom: 8px;
}
.mock-side span {
  color: #64748b;
  transition: all var(--t-fast) var(--ease);
}
.mock-side span:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.06);
}
.mock-side span.on {
  background: #1e293b;
  color: #ffffff;
  border: 1px solid rgba(99, 102, 241, 0.45);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}
.mock-main {
  background: #080e1c;
}
.mock-head {
  border-bottom: 1px solid #1e293b;
}
.mock-pill {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.35);
}
.mock-kpi {
  background: #0e172a;
  border: 1px solid #1e293b;
}
.mock-kpi small {
  color: #8292a6;
}
.mock-kpi b {
  color: #f8fafc;
}
.mock-chart {
  background: #0e172a;
  border: 1px solid #1e293b;
}
.mock-chart-head {
  color: #cbd5e1;
}
.bars i {
  background: #1e293b;
}
.bars i.hi {
  background: linear-gradient(180deg, #e11d48, #4f46e5);
  box-shadow: 0 0 12px rgba(225, 29, 72, 0.4);
}
.mock-row {
  background: #0e172a;
  border: 1px solid #1e293b;
  color: #e2e8f0;
}
.mock-phone {
  background: #0f172a;
  border-color: #1e293b;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
}
.float-card {
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid #334155;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
  color: #f8fafc;
}
.float-card small {
  color: #94a3b8;
}

/* Cards & Bento Grid */
.bento-card, .module-card, .step, .stat-card, .faq-item, .contact-card {
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: var(--sh-sm);
  transition: all var(--t-fast) var(--ease);
}
.bento-card:hover, .module-card:hover, .step:hover, .stat-card:hover {
  background: var(--surface-raised);
  border-color: rgba(99, 102, 241, 0.4);
  transform: translateY(-3px);
  box-shadow: var(--sh-md), 0 0 24px -6px rgba(79, 70, 229, 0.2);
}
.section-alt {
  background: var(--surface-alt);
  border-block: 1px solid var(--line);
}

/* Category Eyebrows (like OPERACIONES COMERCIALES) */
.section-tag {
  color: #818cf8;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.8rem;
}

/* Forms & Inputs in Contact Section */
.form-card {
  background: #0e172a;
  border: 1px solid #1e293b;
  box-shadow: 0 24px 64px -12px rgba(0, 0, 0, 0.7);
}
.form-group input,
.form-group select,
.form-group textarea {
  background: var(--surface-input);
  border: 1px solid var(--line);
  color: #f8fafc;
  transition: all var(--t-fast) var(--ease);
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  background: #0c1424;
  border-color: #e11d48;
  box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.25);
  color: #ffffff;
}
.checkbox-tag {
  background: var(--surface-input);
  border: 1px solid var(--line);
  color: #94a3b8;
  transition: all var(--t-fast) var(--ease);
}
.checkbox-tag:hover {
  background: var(--surface-raised);
  border-color: #334155;
  color: #f8fafc;
}
.checkbox-tag input:checked + span {
  background: rgba(225, 29, 72, 0.18);
  border-color: #e11d48;
  color: #ffffff;
  font-weight: 700;
}

/* CTA Band */
.cta-band {
  background: radial-gradient(ellipse 70% 80% at 50% 50%, rgba(225, 29, 72, 0.22) 0%, rgba(79, 70, 229, 0.25) 50%, #070d18 100%), #070d18;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

/* Footer */
.footer {
  background: #040813;
  border-top: 1px solid var(--line);
  color: #94a3b8;
}
.footer a {
  color: #94a3b8;
  transition: color var(--t-fast);
}
.footer a:hover {
  color: #ffffff;
}
.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  color: #64748b;
}

/* Scroll progress bar */
.scroll-progress {
  background: linear-gradient(90deg, #e11d48, #4f46e5, #10b981);
}
`;

if (!css.includes('CuadreEnv Brand & Dark Theme Overrides')) {
  css += '\n' + customBrandOverrides;
}

fs.writeFileSync(cssPath, css, 'utf8');
console.log('2. src/styles.css updated with dark navy and red brand aesthetic');
