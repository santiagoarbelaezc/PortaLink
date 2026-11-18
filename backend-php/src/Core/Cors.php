<?php

namespace App\Core;

class Cors
{
    /**
     * Lista blanca estricta de orígenes autorizados
     */
    private static array $allowedOrigins = [
        'https://santiagoarbelaez.me',
        'https://santiagoarbelaezc.github.io',
        'https://colchonesdistricol.com',
        'http://localhost:4200',
        'http://127.0.0.1:4200',
        'http://localhost:8000',
        'http://127.0.0.1:8000'
    ];

    /**
     * Aplica cabeceras de CORS y seguridad HTTP
     */
    public static function handle(): void
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        
        // Agregar origen configurado en .env si existe
        $frontendUrl = $_ENV['FRONTEND_URL'] ?? getenv('FRONTEND_URL');
        if (!empty($frontendUrl)) {
            $normalizedFrontendUrl = rtrim($frontendUrl, '/');
            if (!in_array($normalizedFrontendUrl, self::$allowedOrigins, true)) {
                self::$allowedOrigins[] = $normalizedFrontendUrl;
            }
        }

        // Validar contra la lista blanca
        if (!empty($origin) && in_array($origin, self::$allowedOrigins, true)) {
            header("Access-Control-Allow-Origin: {$origin}");
            header('Access-Control-Allow-Credentials: true');
        }

        // Métodos y cabeceras permitidas
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');
        header('Vary: Origin');

        // Cabeceras de seguridad HTTP y transporte seguro (HSTS, CSP, No-Sniff, Anti-Clickjacking)
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
        header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'");
        header('Permissions-Policy: geolocation=(), camera=(), usb=()');

        // Responder inmediatamente a peticiones preflight (OPTIONS)
        if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}
