# CuadreEnv — Landing Page & Portal de Captura de Prospectos

Landing page oficial de **CuadreEnv** (Software POS, Facturación Fiscal DGII, Control de Inventario y Cuadre de Caja para República Dominicana), diseñada para maximizar la conversión de prospectos interesados a través de una experiencia interactiva de alta velocidad y un formulario multi-paso de solicitud de demostraciones.

---

## 🚀 Tecnologías y Filosofía de Diseño

- **Core Frontend:** HTML5 Semántico + CSS3 Vanilla (Tokens & Custom Properties) + JavaScript ES Modules.
- **Herramienta de Construcción:** [Vite 7](https://vite.dev/) (empaquetado ultra-rápido y optimización de activos).
- **Estilo Visual:** *Soft Flat Premium* (inspirado en Stripe y Linear) con modo Claro / Oscuro dinámico.
- **Cero Dependencias Pesadas:** Sin React, sin Vue, sin Bootstrap o Tailwind para garantizar un peso pluma, tiempos de carga inferiores a 1 segundo y puntuación máxima en Google Lighthouse.
- **Despliegue de Producción:** [Cloudflare Pages](https://pages.cloudflare.com/) (distribución global en el Edge con SSL automático).
- **Backend Opcional / Mocking Local:** Servidor ligero Node.js nativo (`server/index.js`) con base de datos SQLite embebida (`node:sqlite`).

---

## 📁 Estructura del Repositorio

```text
CuadreEnv-Landing/
├── public/                     # Archivos estáticos servidos directamente
│   ├── brand/                  # Logotipos e isotipos oficiales (Dark / Light / @2x)
│   └── favicon.ico             # Ícono de la pestaña del navegador
│
├── src/                        # Código fuente de la aplicación cliente
│   ├── main.js                 # Lógica interactiva del cliente:
│   │                           #  - Cambio de tema (Claro / Oscuro) y swap de logos
│   │                           #  - Observador de animaciones al scroll (IntersectionObserver)
│   │                           #  - Menú móvil responsive y barra de progreso de scroll
│   │                           #  - Pestañas interactivas de módulos y contadores animados
│   │                           #  - Stepper de 3 pasos y envío asíncrono del formulario a la API
│   └── styles.css              # Sistema de diseño integral:
│                               #  - Tokens CSS (colores, espaciados, tipografía, sombras)
│                               #  - Reglas de Modo Claro y Modo Oscuro
│                               #  - Componentes (Botones, Tarjetas, Bento Grid, Stepper)
│                               #  - Media queries responsivas (Desktop, Tablet, Mobile)
│
├── server/                     # API auxiliar ligera en Node.js (opcional para desarrollo offline)
│   ├── index.js                # Servidor HTTP nativo con soporte CORS y rate limiting
│   ├── db.js                   # Repositorio SQLite nativo (node:sqlite) para leads locales
│   └── validation.js           # Validación y saneamiento de campos del prospecto
│
├── data/                       # Almacén de base de datos local (SQLite leads.db)
├── dist/                       # Artefactos compilados listos para producción (generados por Vite)
│
├── .env                        # Variables de entorno locales
├── .env.example                # Plantilla de variables de entorno de referencia
├── .gitignore                  # Exclusión de node_modules, dist, .env y bases de datos
├── DESIGN.md                   # Manual de identidad visual, tipografía y tokens de diseño
├── SISTEMA.md                  # Descripción técnica y arquitectura de todo el ecosistema CuadreEnv
├── index.html                  # Plantilla HTML principal con SVG Sprites y metadatos SEO
├── package.json                # Dependencias, scripts de construcción y motores de Node
└── vite.config.js              # Configuración de servidor de desarrollo, puerto y proxy
```

---

## 📋 Flujo del Formulario de Prospectos (Lead Stepper)

El formulario de captación (`#lead-form`) guía al interesado a través de tres pasos validados en tiempo real:

1. **Paso 1: Contacto Principal:** Nombre completo, correo electrónico corporativo o personal, teléfono (mínimo 10 dígitos) y cargo en la empresa.
2. **Paso 2: Datos del Comercio:** Nombre de la empresa, RNC (opcional), tipo de negocio (Farmacia, Supermercado, Ferretería, Retail, Restaurante, Servicios, etc.), cantidad de sucursales, cajas registradoras y ciudad.
3. **Paso 3: Necesidades & Autorización:** Módulos de interés (POS, Caja, Inventario, Facturación DGII, CxC, Multi-Sucursal, POS Móvil), sistema actual utilizado, tiempo estimado de implementación, canal de contacto preferido (WhatsApp, Teléfono o Correo) y consentimiento de contacto.

### Integración con la API
Al enviar el formulario, el cliente realiza una petición `POST` al endpoint:
```text
https://cuadreenv-api-86ef5ddf9650.herokuapp.com/v1/api/leads
```
La petición almacena el interesado directamente en la base de datos PostgreSQL de **Supabase**, donde el equipo comercial lo visualiza al instante desde el **USM (User Management System)**.

---

## ⚙️ Configuración y Variables de Entorno

Copia el archivo `.env.example` a `.env` para personalizar la configuración local:

```bash
cp .env.example .env
```

| Variable | Descripción | Valor por defecto |
| :--- | :--- | :--- |
| `API_PORT` | Puerto de escucha del servidor local de Node.js | `8787` |
| `ADMIN_TOKEN` | Token Bearer para endpoints protegidos de la API local | `cuadreenv-admin-leads-token-2026` |
| `CORS_ORIGINS` | Orígenes autorizados para llamadas cruzadas en local | `http://localhost:5173,http://localhost:5180` |
| `DB_PATH` | Ubicación del archivo de base de datos SQLite local | `./data/leads.db` |
| `VITE_API_URL` *(Opcional)* | Sobrescribe la URL de destino de los leads en el frontend | `https://cuadreenv-api-86ef5ddf9650.herokuapp.com/v1/api/leads` |

---

## 🛠️ Comandos de Desarrollo

Asegúrate de contar con **Node.js >= 22.13** instalado en tu entorno.

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar en modo desarrollo
Inicia el servidor local de Vite en `http://localhost:5180` con recarga en caliente (*Hot Module Replacement*):
```bash
npm run dev:web
```

Si deseas levantar simultáneamente el servidor web y la API local de Node:
```bash
npm run dev
```

### 3. Compilar para producción
Genera el paquete optimizado y minificado en la carpeta `dist/`:
```bash
npm run build
```

### 4. Previsualizar el build de producción
Prueba localmente los archivos compilados en `dist/`:
```bash
npm run preview
```

---

## ☁️ Despliegue en Cloudflare Pages

El proyecto está configurado para despliegue continuo mediante Git en **Cloudflare Pages**:

- **Framework preset:** `None` / `Vite`
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** `/`
- **Production Branch:** `main`

### Purgado de Caché en Cloudflare:
Si actualizas código del frontend y tu dominio muestra una versión anterior debido a la CDN:
1. Accede a tu panel en Cloudflare Dashboard.
2. Ve a tu dominio > **Caching** > **Configuration**.
3. Haz clic en **Purge Everything** y realiza un refresco forzado en tu navegador (`Ctrl + Shift + R`).

---

## 📄 Documentación Adicional

- [SISTEMA.md](./SISTEMA.md): Explicación exhaustiva de la arquitectura del ecosistema completo de CuadreEnv (Landing, Heroku API, Supabase DB, USM y Web POS).
- [DESIGN.md](./DESIGN.md): Guía de estilo, paleta de colores oficial, tipografía y manual de identidad visual.

