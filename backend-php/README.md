<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=120&section=header&animation=fadeIn" />
</div>

<h1 align="center">⚙️ PortaLink — Backend API (PHP 8.2+)</h1>

<h3 align="center">🚀 API RESTful moderna, ligera y de alto rendimiento para el ecosistema PortaLink</h3>

<p align="center">
  Backend de alto rendimiento construido con <b>PHP 8.2</b> y arquitectura limpia <b>PSR-4</b> sin sobrecarga de frameworks pesados.<br>
  Integra autenticación segura mediante JWT, base de datos relacional MySQL (PDO), procesamiento de Inteligencia Artificial (Groq y Gemini), síntesis/transcripción de voz (ElevenLabs y Whisper), almacenamiento multimedia en la nube (Cloudinary) y mensajería transaccional (PHPMailer).
</p>

---

## 📋 **Descripción del Proyecto**

**PortaLink Backend** es el núcleo de servicios web que alimenta tanto el portafolio público como el sistema operativo administrativo (**PortaLink OS**). Diseñado originalmente para entornos de hosting compartido y VPS (Hostinger, cPanel, Apache/LiteSpeed), proporciona endpoints rápidos y seguros para manejar finanzas, apuntes con bloques enriquecidos, tareas, itinerarios, inteligencia artificial y mensajería.

> 🔒 **Seguridad Garantizada:** Todas las variables sensibles (`.env`), bibliotecas (`vendor/`) y lógica de negocio (`src/`) se despliegan de forma aislada, protegidas contra accesos web directos mediante un **API Gateway**.

---

## 🏗️ **Arquitectura del Backend**

El backend implementa un patrón **MVC / Action-Domain-Responder** desacoplado, ligero y sin dependencias de frameworks masivos:

```
backend-php/
├── src/
│   ├── Config/         # Conectores para servicios externos (Cloudinary, Gemini, Groq, Mailer)
│   ├── Controllers/    # Controladores de negocio por dominio
│   ├── Core/           # Motor central: Router HTTP, Request, Response, CORS y Conexión PDO
│   ├── Middleware/     # Middlewares de seguridad (AuthMiddleware, OptionalAuthMiddleware)
│   └── Utils/          # Utilidades auxiliares (AiLogger, formateadores)
├── backups/            # Copias de seguridad de la base de datos
├── index.php           # Front Controller y definición declarativa de rutas
├── composer.json       # Manifiesto de paquetes PHP y mapeo PSR-4
└── schema_mysql.sql    # Estructura DDL completa de la base de datos MySQL
```

### 🛡️ **Seguridad y Core**
- **Router Nativo:** Manejo rápido de métodos HTTP (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`) con soporte de parámetros de ruta dinámicos (`:id`, `:slug`).
- **Autenticación JWT:** Emisión y validación de tokens Bearer (`firebase/php-jwt`) con expiración y verificación de firma criptográfica.
- **Acceso a Datos Seguro:** Capa `Database` basada en `PDO` con modo de error por excepción y sentencias preparadas contra inyecciones SQL.
- **CORS Estricto:** Control de orígenes permitidos con manejo automático de peticiones preflight (`OPTIONS`).

---

## 🔧 **Stack Tecnológico**

### **Lenguaje & Dependencias Principales**
<div align="center">
  <img src="https://img.shields.io/badge/PHP_8.2+-777BB4?style=for-the-badge&logo=php&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/Composer-885630?style=for-the-badge&logo=composer&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/PHPMailer-005571?style=for-the-badge&logo=gmail&logoColor=white" />
</div>

### **Base de Datos & Almacenamiento**
<div align="center">
  <img src="https://img.shields.io/badge/MySQL_8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" />
</div>

### **Inteligencia Artificial & Audio**
<div align="center">
  <img src="https://img.shields.io/badge/Groq_API-F55036?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/Google_Gemini-4E86E4?style=for-the-badge&logo=google&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/ElevenLabs_TTS-000000?style=for-the-badge&logo=audioboom&logoColor=white" />
</div>

### **Infraestructura**
<div align="center">
  <img src="https://img.shields.io/badge/Hostinger_VPS_/_Cloud-673DE6?style=for-the-badge&logo=hostinger&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/LiteSpeed_/_Apache-E03C11?style=for-the-badge&logo=apache&logoColor=white" />
</div>

---

## 🚀 **Estado Actual de Despliegue**

| Componente | Plataforma | Estado | Protocolo / Acceso |
| :--- | :--- | :--- | :--- |
| **API RESTful** | Hostinger (Aislado fuera de public_html) | ✅ En Producción | HTTPS vía API Gateway |
| **Base de Datos** | MySQL Server (Hostinger Cloud) | ✅ Activo | PDO con UTF-8mb4 |
| **Servicios IA** | Groq (`llama-3.3-70b-versatile`) + Gemini | ✅ Activo | Fallback automático |
| **Multimedia** | Cloudinary CDN | ✅ Activo | Subidas optimizadas para notas |

---

## 📡 **Catálogo de Endpoints de la API**

### 🔐 **Autenticación (`/api/auth`)**
| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Iniciar sesión y obtener token JWT | Público |
| `POST` | `/api/auth/register` | Registro de nuevos usuarios con rol asignado | Público |
| `GET` | `/api/auth/captcha` | Generar captcha para prevención de spam | Público |
| `GET` | `/api/auth/users` | Listar usuarios registrados | Público |
| `PUT` | `/api/auth/users/:id/role` | Actualizar rol y privilegios de usuario | Privado (JWT) |
| `DELETE` | `/api/auth/users/:id` | Eliminar usuario del sistema | Privado (JWT) |
| `PUT` | `/api/auth/profile` | Actualizar información de perfil | Privado (JWT) |
| `PUT` | `/api/auth/password` | Cambiar contraseña del usuario activo | Privado (JWT) |
| `POST` | `/api/auth/forgot-password` | Solicitar correo de restablecimiento | Público |
| `POST` | `/api/auth/reset-password` | Restablecer contraseña mediante token de correo | Público |

### 💰 **Finanzas & Facturación (`/api/finance`)**
| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/finance/dashboard` | Resumen de ingresos, egresos y balances | Privado (JWT) |
| `GET` / `POST` | `/api/finance/clients` | Listar y registrar clientes comerciales | Privado (JWT) |
| `GET` / `POST` | `/api/finance/services` | Catálogo de servicios tecnológicos | Privado (JWT) |
| `GET` / `POST` | `/api/finance/software-proposals` | Gestión de cotizaciones y propuestas | Privado (JWT) |
| `GET` / `POST` | `/api/finance/invoices` | Listar y emitir facturas | Privado (JWT) |
| `POST` | `/api/finance/invoices/:id/payments` | Registrar abonos y pagos parciales | Privado (JWT) |
| `GET` / `POST` | `/api/finance/transactions` | Registro de movimientos contables | Privado (JWT) |

### 📚 **Biblioteca de Apuntes (`/api/library`)**
| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `GET` / `POST` | `/api/library/folders` | Carpetas de primer nivel | Opcional / JWT |
| `GET` / `POST` | `/api/library/notebooks` | Cuadernos de estudio por carpeta | Opcional / JWT |
| `GET` / `POST` | `/api/library/pages` | Apuntes y páginas enriquecidas | Opcional / JWT |
| `GET` | `/api/library/search` | Búsqueda global en toda la biblioteca | Opcional / JWT |
| `POST` | `/api/library/upload-image` | Subida de imágenes a Cloudinary | Opcional / JWT |
| `POST` | `/api/library/validate-code` | Validación de código asistida por IA | Opcional / JWT |

### 📅 **Itinerario & Productividad (`/api/itinerary`)**
| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `GET` / `POST` | `/api/itinerary` | Listar y crear tareas | Privado (JWT) |
| `GET` | `/api/itinerary/week` | Consulta de actividades semanales | Privado (JWT) |
| `GET` | `/api/itinerary/today` | Agenda y prioridades del día actual | Privado (JWT) |
| `PATCH` | `/api/itinerary/:id/toggle` | Alternar estado completado/pendiente | Privado (JWT) |
| `GET` / `POST` | `/api/itinerary/notifications` | Recordatorios y alertas automáticas | Privado (JWT) |

### 🤖 **Inteligencia Artificial & RotBot (`/api/chat` & `/api/robot`)**
| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/chat/send` | Envío de mensajes al modelo de IA | Opcional / JWT |
| `GET` | `/api/chat/history` | Consulta del historial de conversación | Privado (JWT) |
| `POST` | `/api/robot/chat` | Endpoint de interacción con RotBot | Opcional / JWT |
| `POST` | `/api/robot/tts` | Conversión texto a audio con ElevenLabs | Opcional / JWT |
| `POST` | `/api/robot/transcribe` | Transcripción de audio a texto vía Whisper | Opcional / JWT |

---

## 💻 **Instalación y Configuración Local**

### 1. Clonar e ingresar al directorio
```bash
git clone https://github.com/santiagoarbelaezc/PortaLink.git
cd PortaLink/backend-php
```

### 2. Instalar dependencias mediante Composer
```bash
composer install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz de `backend-php` tomando como plantilla el siguiente esquema (sin credenciales reales):

```env
# Servidor
PORT=8000
FRONTEND_URL=http://localhost:4200

# Base de Datos MySQL
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=portalink_db
DB_USER=root
DB_PASS=tu_clave_de_base_de_datos

# Seguridad JWT
JWT_SECRET=tu_secreto_super_seguro_jwt

# Inteligencia Artificial (Groq & Gemini)
GROQ_API_KEY_PRIMARY=gsk_tu_clave_primaria
GROQ_API_KEY_FALLBACK=gsk_tu_clave_secundaria
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_MAX_TOKENS=500
GROQ_TEMPERATURE=0.7

# Correo Transaccional (PHPMailer / SMTP)
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_clave_de_aplicacion_smtp
EMAIL_FROM="PortaLink <notificaciones@tu_dominio.com>"

# Cloudinary (Multimedia)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### 4. Inicializar la Base de Datos
Importa la estructura inicial incluida en el archivo DDL:
```bash
mysql -u root -p portalink_db < schema_mysql.sql
```

### 5. Iniciar el servidor local
```bash
php -S localhost:8000 index.php
```
La API estará escuchando en `http://localhost:8000/`.

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

