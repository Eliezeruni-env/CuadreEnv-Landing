/**
 * Validación y normalización del formulario de soporte / interés.
 * Devuelve { data } si es válido o { errors: { campo: mensaje } }.
 */

export const BUSINESS_TYPES = [
  'colmado',
  'supermercado',
  'ferreteria',
  'farmacia',
  'restaurante',
  'tienda',
  'salon',
  'servicios',
  'distribuidora',
  'otro',
];

export const MODULES = [
  'pos',
  'pos-movil',
  'caja',
  'inventario',
  'facturacion',
  'cxc',
  'servicios',
  'reportes',
  'antifraude',
  'multi-sucursal',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(value, max = 200) {
  if (value === undefined || value === null) return '';
  return String(value).replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max);
}

export function validateLead(input = {}) {
  const errors = {};

  const data = {
    fullName: clean(input.fullName, 120),
    email: clean(input.email, 160).toLowerCase(),
    phone: clean(input.phone, 30),
    jobRole: clean(input.jobRole, 80) || null,
    companyName: clean(input.companyName, 160),
    rnc: clean(input.rnc, 20) || null,
    businessType: clean(input.businessType, 40),
    branches: clean(input.branches, 20) || null,
    registers: clean(input.registers, 20) || null,
    city: clean(input.city, 80) || null,
    modules: Array.isArray(input.modules) ? input.modules.map((m) => clean(m, 40)).filter((m) => MODULES.includes(m)) : [],
    currentSystem: clean(input.currentSystem, 80) || null,
    timeline: clean(input.timeline, 40) || null,
    contactPref: clean(input.contactPref, 20) || null,
    message: clean(input.message, 2000) || null,
    source: clean(input.source, 60) || 'landing',
    utm: null,
  };

  if (input.utm && typeof input.utm === 'object') {
    const utm = {};
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'referrer']) {
      if (input.utm[key]) utm[key] = clean(input.utm[key], 200);
    }
    data.utm = Object.keys(utm).length ? utm : null;
  }

  if (data.fullName.length < 3) errors.fullName = 'Escribe tu nombre completo.';
  if (!EMAIL_RE.test(data.email)) errors.email = 'Escribe un correo válido.';
  const digits = data.phone.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) errors.phone = 'Escribe un teléfono válido (ej. 809-555-1234).';
  if (data.companyName.length < 2) errors.companyName = 'Escribe el nombre de tu negocio.';
  if (!BUSINESS_TYPES.includes(data.businessType)) errors.businessType = 'Selecciona el tipo de negocio.';
  if (data.rnc && !/^[\d-]{9,13}$/.test(data.rnc)) errors.rnc = 'El RNC/Cédula debe tener 9 u 11 dígitos.';
  if (input.consent !== true) errors.consent = 'Necesitamos tu autorización para contactarte.';

  return Object.keys(errors).length ? { errors } : { data };
}
