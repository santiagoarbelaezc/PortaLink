<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=120&section=header&animation=fadeIn" />
</div>

<h1 align="center">🌌 PortaLink — Frontend</h1>

<h3 align="center">🚀 Plataforma Web Full-Stack & Sistema Operativo Personal (PortaLink OS)</h3>

<p align="center">
  Aplicación web de una sola página (SPA) y Progressive Web App (PWA) de alto rendimiento construida con <b>Angular 21</b> y <b>Tailwind CSS</b>.<br>
  Integra un portafolio interactivo de servicios tecnológicos y un robusto panel de control administrativo (Dashboard) para gestión de finanzas, biblioteca de apuntes con IA, itinerario de actividades, mensajería y asistente robótico.
</p>

---

## 📋 **Descripción del Proyecto**

**PortaLink Frontend** es la interfaz de usuario moderna de la plataforma PortaLink. Ofrece una doble experiencia:
1. **Cara Pública (Portafolio & Servicios):** Experiencia interactiva y estética inspirada en *Luxury Tech*, con navegación suave, animaciones AOS, vitrina de proyectos de software, cotizaciones de planes y contacto directo.
2. **Cara Privada (PortaLink OS / Dashboard Administrativo):** Sistema centralizado para gestionar el flujo de trabajo del desarrollador: finanzas profesionales, biblioteca de conocimiento jerárquica con asistente IA (Copilot), itinerario dinámico de tareas y asistente conversacional RotBot.

> ⚡ **Estado del Proyecto:** En producción activa y desarrollo continuo — desplegado en Firebase Hosting y consumiendo APIs RESTful seguras.

---

## 🏗️ **Módulos del Sistema (Dashboard)**

El panel administrativo de PortaLink está dividido en componentes modulares de alto nivel:

```
dashboard/
├── dash-home/          # Resumen general, métricas clave y radar de actividad
├── dash-library/       # Biblioteca de apuntes Pro (Carpetas > Cuadernos > Notas Notion-style)
│   └── copilot-chat/   # Asistente de IA para código, validación y explicaciones
├── dash-finances/      # Control de ingresos, egresos, clientes, propuestas y facturas PDF
├── dash-itinerary/     # Planificador de tareas semanales, metas diarias y recordatorios
├── dash-messages/      # Bandeja de entrada de contactos y prospectos con gestión de estados
├── dash-rotbot/        # Asistente con IA conversacional, síntesis de voz (TTS) y animaciones
├── dash-ai-search/     # Motor de búsqueda semántica transversal en toda la plataforma
├── dash-db-viewer/     # Monitor de estado y estructura de base de datos
├── dash-users/         # Gestión de usuarios, roles y permisos de acceso
└── dash-config/        # Configuración general de perfil y personalización
```

### 📚 **Biblioteca de Apuntes Pro (Dash-Library)**
- **Estructura Jerárquica:** Organización de 3 niveles (*Carpetas ➔ Cuadernos ➔ Apuntes*).
- **Editor Notion-Style:** Bloques de texto enriquecido, listas de tareas, llamadas (callouts) y bloques de código con sintaxis resaltada y botón de copiado.
- **Experiencia Móvil Nativa:** Rediseño responsivo enfocado en usabilidad móvil (barra de herramientas inferior sticky, menú hamburguesa flotante y gestos táctiles).
- **Copilot de IA:** Asistencia contextual integrada para analizar, explicar o autocompletar fragmentos de código.

### 💰 **Gestión Financiera Integral (Dash-Finances)**
- **Flujo de Caja:** Control estricto de ingresos y egresos categorizados con gráficos interactivos (`Chart.js`).
- **Cotizaciones y Facturación:** Generación de propuestas de software y emisión de facturas profesionales exportables en formato PDF de alta resolución (`jsPDF` y `jspdf-autotable`).
- **Control de Abonos:** Registro de pagos parciales por cliente con cálculo automático de saldos pendientes.

### 🤖 **Asistente Inteligente (Dash-RotBot & AI Floating Chat)**
- **Chat Flotante y Dashboard:** Comunicación fluida con modelos de lenguaje avanzados.
- **Voz y Expresividad:** Soporte para transcripción y síntesis de voz (TTS), sincronizado con animaciones visuales de ojos OLED.

---

## 🔧 **Stack Tecnológico**

### **Framework & Lenguajes**
<div align="center">
  <img src="https://img.shields.io/badge/Angular_21-DD0031?style=for-the-badge&logo=angular&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/TypeScript_5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/RxJS_7.8-B7178C?style=for-the-badge&logo=reactivex&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
</div>

### **Estilos & Librerías de UI**
<div align="center">
  <img src="https://img.shields.io/badge/Tailwind_CSS_3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/AOS_Animations-000000?style=for-the-badge&logo=scrollreveal&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/Chart.js_4.5-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/jsPDF-FF0000?style=for-the-badge&logo=adobeacrobatreader&logoColor=white" />
</div>

### **Infraestructura & Despliegue**
<div align="center">
  <img src="https://img.shields.io/badge/Firebase_Hosting-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img width="8" />
  <img src="https://img.shields.io/badge/PWA_Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" />
</div>

---

## 🚀 **Estado Actual de Despliegue**

| Componente | Plataforma | Estado | Entorno / URL |
| :--- | :--- | :--- | :--- |
| **Frontend SPA / PWA** | Firebase Hosting | ✅ Desplegado | `https://portfolio-santiagoa.web.app` |
| **Consumo de API** | Hostinger (API Gateway) | ✅ Conectado | Endpoint seguro vía Gateway reverso |
| **Dominio Personalizado** | DNS Configurado | 📝 Planificado | Dominio productivo enrutado |

---

## 🏛️ **Arquitectura del Frontend**

- **Componentes Standalone:** Arquitectura moderna sin módulos innecesarios (`NgModule`), maximizando la carga diferida (*Lazy Loading*) y optimizando el bundle de producción.
- **Autenticación JWT:** Interceptores HTTP (`AuthInterceptor`) que inyectan el encabezado `Authorization: Bearer <token>` de forma transparente en peticiones protegidas.
- **Guardias de Ruta:** Protección de rutas mediante `AuthGuard` para restringir el acceso no autorizado a áreas administrativas.
- **Gestión de Entornos Dinámica:** Script `set-env.js` para compilar variables de entorno desde `.env` hacia `src/environments/environment.ts` durante el build.

---

## 📁 **Estructura de Directorios**

```
portalink-frontend/
├── src/
│   ├── app/
│   │   ├── components/         # Componentes UI transversales (Navbar, Footer, Hero, Chat)
│   │   │   └── dashboard/      # Módulos del PortaLink OS (Library, Finances, Itinerary, etc.)
│   │   ├── core/               # Guards de seguridad e Interceptores HTTP
│   │   ├── models/             # Interfaces y tipos de TypeScript
│   │   ├── pages/              # Vistas principales y rutas públicas (Login, Proyectos, CV Web)
│   │   ├── pipes/              # Pipes para formateo de datos
│   │   ├── services/           # Servicios de negocio y comunicación con la API REST
│   │   └── shared/             # Directivas y utilidades compartidas
│   ├── assets/                 # Recursos estáticos (imágenes, iconos, audios)
│   └── environments/           # Archivos de configuración de entorno
├── angular.json                # Configuración del workspace de Angular
├── firebase.json               # Reglas de despliegue y reescritura para Firebase Hosting
├── ngsw-config.json            # Configuración de Service Worker y caché PWA
├── package.json                # Dependencias y scripts de npm
├── set-env.js                  # Inyector de variables de entorno para CI/CD
└── tailwind.config.js          # Configuración de paleta de colores y plugins Tailwind
```

---

## 💻 **Cómo Ejecutar el Proyecto Localmente**

### 1. Clonar e ingresar al directorio
```bash
git clone https://github.com/santiagoarbelaezc/PortaLink.git
cd PortaLink/portalink-frontend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz de `portalink-frontend` tomando como referencia `.env.example`:

```env
API_URL=http://localhost:8000
NODE_ENV=development
```

Genera los archivos de entorno de Angular ejecutando:
```bash
node set-env.js
```

### 4. Iniciar servidor de desarrollo
```bash
npm start
```
La aplicación estará disponible en `http://localhost:4200/`.

### 5. Compilar para producción
```bash
npm run build
```
Los archivos de distribución se generarán en la carpeta `dist/`.

---

## 👨‍💻 **Desarrollador**

<div align="center">
Santiago Arbelaez Contreras  
Junior Full Stack Developer  
Estudiante de Ingeniería de Sistemas – Universidad del Quindío

<br>
<a href="https://github.com/santiagoarbelaezc">
  <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" />
</a>
<img width="10" />
<a href="https://www.linkedin.com/in/santiago-arbelaez-contreras-9830b5290/">
  <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" />
</a>
<img width="10" />
<a href="https://portfolio-santiagoa.web.app/portfolio">
  <img src="https://img.shields.io/badge/Portfolio-6C63FF?style=for-the-badge&logo=sparkles&logoColor=white" />
</a>
</div>

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=90&section=footer&animation=fadeIn" />
</div>
