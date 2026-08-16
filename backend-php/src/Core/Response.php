<?php

namespace App\Core;

class Response
{
    private int $statusCode = 200;

    public function status(int $code): self
    {
        $this->statusCode = $code;
        return $this;
    }

    public function json(mixed $data): void
    {
        // Send status header
        http_response_code($this->statusCode);

        // Send CORS headers and content type
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
        header("Access-Control-Allow-Origin: {$origin}");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Content-Type: application/json; charset=UTF-8');

        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
}
