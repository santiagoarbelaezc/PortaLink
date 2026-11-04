<?php
/**
 * PortaLink API Gateway
 * ---------------------------------------------------------------------------
 * Este archivo vive en  public_html/api/index.php  y NO contiene lógica de
 * negocio: únicamente redirige internamente (sin cambiar la URL) todas las
 * peticiones hacia el backend real, que está desplegado FUERA de public_html:
 *
 *   <raíz del dominio>/
 *   ├── public_html/
 *   │   └── api/            <-- este gateway
 *   └── backend-portalink/  <-- backend PHP (src, vendor, .env, index.php ...)
 *
 * Así el código fuente, vendor/ y el .env nunca quedan expuestos por la web.
 */

$backendDir = realpath(__DIR__ . '/../../backend-portalink');

if ($backendDir === false || !is_file($backendDir . '/index.php')) {
    http_response_code(503);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'ok' => false,
        'message' => 'Backend no disponible: no se encontró el directorio backend-portalink.'
    ]);
    exit;
}

// Hace que el router del backend elimine el prefijo "/api" del gateway
// (Request.php usa dirname(SCRIPT_NAME) como base) y luego lo reponga.
$_SERVER['SCRIPT_NAME'] = '/api/index.php';
$_SERVER['PHP_SELF']    = '/api/index.php';

// Rutas relativas del backend (uploads, logs, etc.) se resuelven desde su carpeta
chdir($backendDir);

require $backendDir . '/index.php';

