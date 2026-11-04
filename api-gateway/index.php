<?php
/**
 * PortaLink API Gateway
 * ---------------------------------------------------------------------------
 * Este archivo vive en  public_html/api-gateway/index.php  y NO contiene lógica de
 * negocio: únicamente redirige internamente (sin cambiar la URL) todas las
 * peticiones hacia el backend real, que está desplegado FUERA de public_html:
 *
 *   <raíz del dominio>/
 *   ├── public_html/
 *   │   └── api-gateway/    <-- este gateway
 *   └── backend-portalink/  <-- backend PHP (src, vendor, .env, index.php ...)
 *
 * Así el código fuente, vendor/ y el .env nunca quedan expuestos por la web.
 */

$candidates = [
    __DIR__ . '/../../backend-portalink',
    dirname(__DIR__, 2) . '/backend-portalink',
    __DIR__ . '/../backend-portalink',
];

$backendDir = false;
foreach ($candidates as $cand) {
    $real = realpath($cand);
    if ($real !== false && is_file($real . '/index.php')) {
        $backendDir = $real;
        break;
    }
}

if ($backendDir === false) {
    http_response_code(503);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'ok' => false,
        'message' => 'Backend no disponible: no se encontró el directorio backend-portalink.'
    ]);
    exit;
}

// Hace que el router del backend elimine el prefijo "/api-gateway"
// (Request.php usa dirname(SCRIPT_NAME) como base) y luego reponga "/api".
$_SERVER['SCRIPT_NAME'] = '/api-gateway/index.php';
$_SERVER['PHP_SELF']    = '/api-gateway/index.php';

// Rutas relativas del backend (uploads, logs, etc.) se resuelven desde su carpeta
chdir($backendDir);

require $backendDir . '/index.php';
