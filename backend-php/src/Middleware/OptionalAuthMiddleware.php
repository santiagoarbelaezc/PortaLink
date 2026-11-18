<?php

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Core\JwtSecurity;
use Exception;

class OptionalAuthMiddleware
{
    public function handle(Request $request, Response $response): bool
    {
        $token = JwtSecurity::extractBearerToken($request);

        if (!$token) {
            $request->user = null;
            return true;
        }

        try {
            $decoded = JwtSecurity::verifyToken($token);
            if (JwtSecurity::isTokenRevoked($decoded->jti ?? null)) {
                $request->user = null;
                return true;
            }
            $request->user = $decoded;
        } catch (Exception) {
            $request->user = null;
        }

        return true;
    }
}
