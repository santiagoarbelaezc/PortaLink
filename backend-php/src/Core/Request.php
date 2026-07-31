<?php

namespace App\Core;

class Request
{
    public string $method;
    public string $path;
    public array $query = [];
    public array $body = [];
    public array $params = [];
    public array $headers = [];
    public ?object $user = null;

    public function __construct()
    {
        $this->method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        
        // Strip query parameters from URI path
        $position = strpos($uri, '?');
        if ($position !== false) {
            $this->path = substr($uri, 0, $position);
        } else {
            $this->path = $uri;
        }

        // Clean path (remove trailing slash unless it's just '/')
        if (strlen($this->path) > 1) {
            $this->path = rtrim($this->path, '/');
        }

        // Strip subfolder prefix if deployed in a subfolder like /api2
        $scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
        $baseDir = rtrim(dirname($scriptName), '/\\');
        if ($baseDir && $baseDir !== '/' && str_starts_with($this->path, $baseDir)) {
            $this->path = substr($this->path, strlen($baseDir));
            if (empty($this->path)) {
                $this->path = '/';
            }
        }

        // Parse query string ($_GET)
        $this->query = $_GET;

        // Parse headers
        if (function_exists('getallheaders')) {
            $headers = getallheaders();
            foreach ($headers as $key => $value) {
                $this->headers[strtolower($key)] = $value;
            }
        } else {
            foreach ($_SERVER as $key => $value) {
                if (str_starts_with($key, 'HTTP_')) {
                    $headerName = strtolower(str_replace('_', '-', substr($key, 5)));
                    $this->headers[$headerName] = $value;
                } elseif (in_array($key, ['CONTENT_TYPE', 'CONTENT_LENGTH'])) {
                    $headerName = strtolower(str_replace('_', '-', $key));
                    $this->headers[$headerName] = $value;
                }
            }
        }

        // Parse body (JSON input or $_POST)
        $contentType = $this->getHeader('content-type') ?? '';
        if (str_contains($contentType, 'application/json')) {
            $input = file_get_contents('php://input');
            if ($input) {
                $decoded = json_decode($input, true);
                if (is_array($decoded)) {
                    $this->body = $decoded;
                }
            }
        } else {
            // For form data or other content types
            $input = file_get_contents('php://input');
            if (!empty($_POST)) {
                $this->body = $_POST;
            } elseif ($input) {
                $decoded = json_decode($input, true);
                if (is_array($decoded)) {
                    $this->body = $decoded;
                } else {
                    parse_str($input, $this->body);
                }
            }
        }
    }

    public function getHeader(string $name): ?string
    {
        return $this->headers[strtolower($name)] ?? null;
    }
}
