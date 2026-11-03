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
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        header('Pragma: no-cache');

        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
}
