# CuadreEnv — Manual de Identidad Visual, Tokens y Guía de Estilo

Este documento detalla los fundamentos visuales, paleta de colores, tipografía, reglas de UI/UX y la arquitectura creada para la **Landing Page Promocional y Captura de Leads** de **CuadreEnv**.

---

## 1. Filosofía de Diseño: "Soft Flat Premium"

Para CuadreEnv se seleccionó la estética **Soft Flat Premium**, inspirada en los estándares de interfaces de clase mundial (como *Stripe*, *Linear* y *Raycast*):
- **Cero Fatiga Visual:** Fondos neutros limpios y aireados (`#F8FAFC` y blanco puro), alternados con bandas de alto contraste Deep Navy (`#0B1220`).
- **Claridad Estricta:** Bordes finos (`1px solid #E2E8F0`) con elevaciones sutiles y micro-sombras.
- **Micro-interacciones Fluidas:** Transiciones con curvas bezier orgánicas (`cubic-bezier(0.22, 1, 0.36, 1)`) que dan sensación de producto vivo y pulido.
- **Accesibilidad Garantizada (WCAG AA):** Ratios de contraste superiores a 12:1 en textos principales y más de 4.5:1 en textos secundarios.

---

## 2. Paleta de Colores Oficial

### A. Color de Marca Principal (Dominio y Confianza)
- **Primary / Blue 600:** `#2563EB` *(Acciones principales, enlaces destacados, acentos)*
- **Primary Hover / Blue 700:** `#1D4ED8`
- **Primary Light / Blue 50:** `#EFF6FF` *(Fondos de chips, tags activos)*
- **Primary Border / Blue 200:** `#BFDBFE`

### B. Colores Semánticos (Salud del Negocio)
- **Success / Emerald 500:** `#10B981` *(Caja cuadrada, diferencia RD$ 0.00, estados positivos)*
- **Success Hover / Emerald 600:** `#059669`
- **Success Light / Emerald 50:** `#ECFDF5`
- **Warning / Amber 500:** `#F59E0B` *(Secuencias de NCF por agotarse, alertas leves)*
- **Danger / Rose 600:** `#E11D48` *(Diferencias de caja, facturas anuladas)*

### C. Escala de Neutros (Deep Navy & Slate)
- **Ink 950:** `#020617` *(Fondo más profundo)*
- **Ink 900:** `#0B1220` *(Banda oscura, footer, tarjetas dark)*
- **Ink 800:** `#1E293B` *(Títulos principales)*
- **Ink 700:** `#334155` *(Cuerpo de texto regular)*
- **Ink 500 / 600:** `#64748B` / `#475569` *(Subtítulos y notas aclaratorias)*
- **Ink 200:** `#E2E8F0` *(Líneas divisorias y bordes)*
- **Ink 50:** `#F8FAFC` *(Fondo base de la página)*
- **White:** `#FFFFFF` *(Tarjetas y superficies)*

---

## 3. Tipografía

- **Fuente Primaria:** `Plus Jakarta Sans` (Google Fonts).
  - Pesos: **400** (Regular), **500** (Medium), **600** (SemiBold), **700** (Bold), **800** (ExtraBold).
- **Cifras y Datos Financieros:** `font-variant-numeric: tabular-nums` (asegura que las columnas de montos en DOP no bailen y se alineen perfectamente).
- **Escala de Tamaños:**
  - `Hero Title`: `clamp(2.4rem, 1.6rem + 3.4vw, 4.25rem)` — *Tracking -0.04em, Line-height 1.04*
  - `Heading 2`: `clamp(1.875rem, 1.4rem + 1.8vw, 2.75rem)`
  - `Heading 3`: `1.25rem` a `1.5rem`
  - `Body`: `1rem` (16px) — *Line-height 1.6*
  - `Small / Captions`: `0.75rem` - `0.875rem` (12px - 14px)

---

## 4. Estructura de la Landing Page

1. **Header Fijo Inteligente:** Con barra de progreso de scroll en tiempo real, isotipo en degradado y CTA directo.
2. **Hero Section Impactante:**
   - Titular con acento gradiente: *"Cuadra tu caja sin estrés. Vende sin límites."*
   - Maqueta interactiva CSS del POS y Dashboard en vivo (sin imágenes pesadas).
   - Mockup de teléfono celular con escáner de códigos de barras animado mediante cámara.
   - Tarjetas flotantes dinámicas ("Caja cuadrada ✓ RD$ 0.00" y "NCF B02 emitido").
3. **Marquee de Tipos de Negocio:** Cinta continua con iconos para colmados, supermercados, ferreterías, farmacias, restaurantes, salones, tiendas y distribuidoras.
4. **Cifras Clave (Métricas Animadas):** Cuatro estadísticas que animan sus números automáticamente al entrar en pantalla.
5. **Bento Grid de Funciones:** 10 tarjetas que explican visualmente el POS rápido, cuadre de caja, POS móvil, NCF/ITBIS, multi-almacén, guardián antifraude y modo sin internet.
6. **Cómo Funciona en 3 Pasos:** Proceso transparente y simple desde la solicitud hasta la venta.
7. **Pestañas Interactivas de Módulos (Tabs):** Ventas, Caja, Inventario y Facturación con demostraciones visuales de interfaces.
8. **Comparativa Antes vs. Con CuadreEnv:** Enfoque en la eliminación del estrés y la libreta de fiao.
9. **Preguntas Frecuentes (FAQ Acordeón):** Respuestas a dudas típicas (NCF, impresoras, internet, catálogo).
10. **Formulario de Soporte / Interés Multi-Paso (3 Pasos):**
    - **Paso 1: Tus datos:** Nombre, correo, teléfono y rol.
    - **Paso 2: Tu negocio:** Nombre comercial, RNC opcional, selector de tipo de negocio con tarjetas, sucursales y ciudad.
    - **Paso 3: Lo que necesitas:** Módulos de interés (chips multi-select), sistema actual, tiempo estimado de implementación, preferencia de contacto (WhatsApp/Llamada/Email) y mensaje libre.
    - **Honeypot + Rate Limiting:** Protección anti-spam integrada.
11. **Banda de Conversión Final + Footer:** Con enlaces institucionales y botón flotante de retorno arriba.

---

## 5. Arquitectura del Proyecto y Backend de Leads

El proyecto se encuentra ubicado en:
`C:\Users\pelie\source\repos\MyDev\cuadreEnv\CuadreEnv-Landing`

### Tecnologías Utilizadas:
- **Frontend:** Vite + Vanilla JavaScript moderno (ES Modules) + HTML semántico + CSS nativo con variables personalizadas. Cero sobrecarga de frameworks.
- **Backend Ligero:** Node.js nativo (servidor HTTP con `node:http`) sin frameworks pesados.
- **Base de Datos:** SQLite nativo de Node.js (`node:sqlite`, mediante `DatabaseSync`), generando un archivo único en `./data/leads.db`.

### Endpoints de la API:
- `POST /api/leads` (Público): Registra el lead desde el formulario con validación estricta y honeypot.
- `GET /api/health` (Público): Chequeo de estado.
- `GET /api/leads` (Protegido por Bearer Token): Listado paginado y filtrable por estado/búsqueda.
- `GET /api/leads/stats` (Protegido por Bearer Token): Métricas consolidadas por estado y tipo de negocio.
- `PATCH /api/leads/:id` (Protegido por Bearer Token): Permite actualizar el estado del prospecto (`new`, `contacted`, `qualified`, `proposal`, `won`, `lost`), notas internas y asignación a un asesor comercial.

---

## 6. Comandos para Ejecución

Desde la carpeta `CuadreEnv-Landing`:

```bash
# Iniciar frontend y backend juntos en desarrollo:
npm run dev

# O por separado:
npm run dev:web   # Vite en http://localhost:5180
npm run dev:api   # API de Leads en http://localhost:8787

# Compilar para producción:
npm run build
```
