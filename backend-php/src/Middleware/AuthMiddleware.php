<?php

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;

class AuthMiddleware
{
    public function handle(Request $request, Response $response): bool
    {
        $authHeader = $request->getHeader('authorization');
        
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            $response->status(401)->json(['message' => 'Token no proporcionado']);
            return false;
        }

        $token = substr($authHeader, 7);
        $secret = $_ENV['JWT_SECRET'] ?? getenv('JWT_SECRET');

        if (!$secret) {
            $response->status(500)->json(['message' => 'Error de configuración de seguridad (JWT_SECRET)']);
            return false;
        }

        try {
            $decoded = JWT::decode($token, new Key($secret, 'HS256'));
            $request->user = $decoded;
            return true;
        } catch (Exception $e) {
            $response->status(403)->json(['message' => 'Token inválido o expirado']);
            return false;
        }
    }
}
