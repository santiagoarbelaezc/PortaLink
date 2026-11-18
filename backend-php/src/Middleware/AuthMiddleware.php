<?php

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Core\JwtSecurity;
use Firebase\JWT\ExpiredException;
use RuntimeException;
use Exception;

class AuthMiddleware
{
    public function handle(Request $request, Response $response): bool
    {
        $token = JwtSecurity::extractBearerToken($request);

        if (!$token) {
            $response->status(401)->json([
                'message' => 'Token de autenticación no proporcionado o formato Bearer inválido'
            ]);
            return false;
        }

        try {
            $decoded = JwtSecurity::verifyToken($token);

            if (JwtSecurity::isTokenRevoked($decoded->jti ?? null)) {
                $response->status(401)->json([
                    'message' => 'La sesión ha sido cerrada o revocada. Inicia sesión nuevamente.',
                    'expired' => true
                ]);
                return false;
            }

            $request->user = $decoded;
            return true;
        } catch (RuntimeException $e) {
            error_log('[AuthMiddleware] Error de configuración JWT: ' . $e->getMessage());
            $response->status(500)->json([
                'message' => 'Error de configuración de seguridad en el servidor (JWT_SECRET)'
            ]);
            return false;
        } catch (ExpiredException $e) {
            $response->status(401)->json([
                'message' => 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
                'expired' => true
            ]);
            return false;
        } catch (Exception $e) {
            $response->status(401)->json([
                'message' => 'Token JWT inválido, manipulado o expirado',
                'expired' => true
            ]);
            return false;
        }
    }
}
