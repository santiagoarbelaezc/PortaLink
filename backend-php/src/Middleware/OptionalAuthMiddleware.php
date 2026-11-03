<?php

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;

class OptionalAuthMiddleware
{
    public function handle(Request $request, Response $response): bool
    {
        $authHeader = $request->getHeader('authorization');
        
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            $request->user = null;
            return true;
        }

        $token = substr($authHeader, 7);
        $secret = $_ENV['JWT_SECRET'] ?? getenv('JWT_SECRET');

        if (!$secret) {
            $request->user = null;
            return true;
        }

        try {
            $decoded = JWT::decode($token, new Key($secret, 'HS256'));
            $request->user = $decoded;
        } catch (Exception $e) {
            $request->user = null;
        }

        return true;
    }
}
