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

        // Apply strict CORS whitelist and security headers
        Cors::handle();
        header('Content-Type: application/json; charset=UTF-8');

        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
}
