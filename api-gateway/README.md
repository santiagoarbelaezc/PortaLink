<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=120&section=header&animation=fadeIn" />
</div>

<h1 align="center">🛡️ PortaLink — API Gateway</h1>

<h3 align="center">🚀 Pasarela de Entrada Segura & Proxy Inverso Interno para Entornos de Hosting</h3>

<p align="center">
  Módulo de enrutamiento y blindaje de seguridad diseñado para servidores web <b>Apache</b> y <b>LiteSpeed</b> (Hostinger, cPanel).<br>
  Actúa como el único punto de contacto público hacia la API, aislando completamente el código fuente, dependencias y variables de entorno fuera del árbol web público (<code>public_html</code>).
</p>

---

## 📋 **Descripción del Proyecto**

En servidores de hosting compartido o VPS con paneles cPanel/Hostinger, colocar todo el código backend dentro de `public_html` representa un riesgo crítico de fuga de información (exposición potencial de archivos `.env`, directorios `vendor/`, backups o archivos `.git`).

**PortaLink API Gateway** resuelve este problema mediante un patrón de **Proxy Inverso Interno (Zero-Overhead)**:
1. El cliente (navegador, aplicación Angular o app móvil) envía sus peticiones a `https://tudominio.com/api-gateway/...`.
2. El servidor web entrega la petición a `public_html/api-gateway/index.php`.
3. El Gateway preserva las cabeceras de autorización (`Authorization: Bearer <JWT>`), ajusta los punteros de script y delega la ejecución internamente hacia `backend-portalink/index.php`, situado **un nivel por encima** de `public_html`.
4. El backend procesa la petición y responde directamente al cliente sin redirecciones externas ni saltos HTTP adicionales.

> 🔒 **Blindaje Total:** El código fuente del backend, sus dependencias y las claves de entorno nunca son accesibles de forma directa mediante peticiones HTTP.

---

## 🏗️ **Topología de Despliegue en el Servidor**

```
/home/u123456789/ (Raíz del Servidor / Hosting)
│
├── public_html/                     <-- Raíz web pública accesible por internet
│   ├── .htaccess
│   └── api-gateway/                 <-- [ESTE COMPONENTE] Único punto de entrada a la API
│       ├── .htaccess                # Reescritura, protección de cabeceras y dotfiles
│       └── index.php                # Delegador interno y resolución de rutas
│
└── backend-portalink/               <-- FUERA DEL ALCANCE PÚBLICO (Inaccesible por navegador)
    ├── .env                         # Claves secretas y credenciales de BD
    ├── src/                         # Código fuente PHP (Controladores, Core, etc.)
    ├── vendor/                      # Paquetes de Composer
    ├── schema_mysql.sql             # Scripts DDL de base de datos
    └── index.php                    # Front Controller real de la API
```

---

## 🔧 **Stack Tecnológico**

### **Tecnologías & Servidores Soportados**
<div align="center">
  <img src="https://img.shields.io/badge/PHP_8.2+-777BB4?style=for-the-badge&logo=php&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/Apache_HTTP_Server-D22128?style=for-the-badge&logo=apache&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/LiteSpeed-003B5C?style=for-the-badge&logo=litespeed&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/Hostinger_cPanel-673DE6?style=for-the-badge&logo=hostinger&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/Mod_Rewrite-333333?style=for-the-badge&logo=web&logoColor=white" />
</div>

---

## 🚀 **Estado Actual de Despliegue**

| Componente | Ubicación en Servidor | Estado | Propósito |
| :--- | :--- | :--- | :--- |
| **Punto de Enlace** | `public_html/api-gateway/` | ✅ Activo | Recibir peticiones web y CORS |
| **Backend Aislado** | `../backend-portalink/` | ✅ Blindado | Procesar lógica de negocio y BD |
| **Cabecera JWT** | Apache mod_rewrite Pass-Through | ✅ Habilitado | Transmisión íntegra de tokens |
| **Archivos Ocultos** | Regla de denegación automática | ✅ Protegido | Bloqueo estricto de accesos maliciosos |

---

## 🛡️ **Mecanismos de Blindaje & Seguridad**

### 1. **Preservación de Tokens de Autenticación (`Authorization`)**
Por defecto, muchos entornos Apache / LiteSpeed que ejecutan PHP bajo CGI o FastCGI descartan la cabecera `Authorization`. El archivo `.htaccess` del Gateway fuerza la persistencia de dicha cabecera:
```apache
# Conservar el header Authorization (JWT) para PHP en Apache/LiteSpeed
RewriteCond %{HTTP:Authorization} .
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
```

### 2. **Bloqueo de Archivos Ocultos (Dotfiles)**
Impide que escaneos automatizados intenten acceder a archivos sensibles o de configuración:
```apache
# No exponer archivos ocultos
RewriteRule (^|/)\.(?!well-known) - [F,L]
```

### 3. **Búsqueda Dinámica del Directorio Backend**
El archivo `index.php` analiza múltiples rutas canónicas para ubicar la carpeta segura del backend de manera flexible:
```php
$candidates = [
    __DIR__ . '/../../backend-portalink',
    dirname(__DIR__, 2) . '/backend-portalink',
    __DIR__ . '/../backend-portalink',
];
```
Si por mantenimiento o actualización el backend no está disponible, el Gateway emite una respuesta JSON estandarizada con código `503 Service Unavailable`:
```json
{
  "ok": false,
  "message": "Backend no disponible: no se encontró el directorio backend-portalink."
}
```

### 4. **Normalización de Rutas para el Router**
Para que el router del backend no reciba paths desfasados por el prefijo `/api-gateway`, el script normaliza:
```php
$_SERVER['SCRIPT_NAME'] = '/api-gateway/index.php';
$_SERVER['PHP_SELF']    = '/api-gateway/index.php';
chdir($backendDir);
require $backendDir . '/index.php';
```

---

## 📁 **Estructura del Módulo**

```
api-gateway/
├── .htaccess       # Reglas de reescritura, CORS preflight y variables de entorno HTTP
├── index.php       # Controlador del gateway, resolución de rutas y delegación
└── README.md       # Documentación técnica de arquitectura y seguridad
```

---

## 💻 **Guía de Despliegue en Servidor**

### 1. Preparar la estructura en el servidor
Accede a tu servidor vía SSH o Administrador de Archivos de cPanel:
```bash
# Navegar a la raíz del hosting (un nivel arriba de public_html)
cd /home/u123456789/

# Subir y extraer los archivos del backend en la carpeta privada
mkdir backend-portalink
# (Copiar aquí el contenido de backend-php: src/, vendor/, .env, index.php)
```

### 2. Desplegar el API Gateway dentro de `public_html`
```bash
cd /home/u123456789/public_html/
mkdir api-gateway
# (Copiar aquí .htaccess e index.php de este módulo)
```

### 3. Verificar permisos de lectura/ejecución
Asegúrate de que los archivos tengan los permisos recomendados en Linux/cPanel:
- Carpetas: `755`
- Archivos (`.htaccess`, `index.php`): `644`

### 4. Probar el funcionamiento
Envía una petición de prueba mediante curl o navegador:
```bash
curl -I https://tudominio.com/api-gateway/
```
Deberías recibir la respuesta JSON de bienvenida del backend:
```json
{
  "message": "Bienvenido a la API de PortaLink (PHP Edition)",
  "version": "1.0.0",
  "php_version": "8.2.x"
}
```

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

