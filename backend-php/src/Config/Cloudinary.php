<?php

namespace App\Config;

use RuntimeException;
use CURLFile;

class Cloudinary
{
    /**
     * Obtener las credenciales de Cloudinary desde variables de entorno o defaults
     */
    public static function getCredentials(): array
    {
        $cloudinaryUrl = $_ENV['CLOUDINARY_URL'] ?? getenv('CLOUDINARY_URL') ?: '';
        
        $cloudName = $_ENV['CLOUDINARY_CLOUD_NAME'] ?? getenv('CLOUDINARY_CLOUD_NAME') ?: '';
        $apiKey = $_ENV['CLOUDINARY_API_KEY'] ?? getenv('CLOUDINARY_API_KEY') ?: '';
        $apiSecret = $_ENV['CLOUDINARY_API_SECRET'] ?? getenv('CLOUDINARY_API_SECRET') ?: '';

        if (!empty($cloudinaryUrl) && (empty($cloudName) || empty($apiKey) || empty($apiSecret))) {
            $parsed = parse_url($cloudinaryUrl);
            if ($parsed && ($parsed['scheme'] ?? '') === 'cloudinary') {
                $apiKey = $apiKey ?: ($parsed['user'] ?? '');
                $apiSecret = $apiSecret ?: ($parsed['pass'] ?? '');
                $cloudName = $cloudName ?: ($parsed['host'] ?? '');
            }
        }

        // Fallbacks de seguridad con las credenciales registradas
        if (empty($cloudName)) $cloudName = 'doxdjiyvi';
        if (empty($apiKey)) $apiKey = '897355973954513';
        if (empty($apiSecret)) $apiSecret = 'qbtdurAEWk46ZoJdJ5WkfryZYi8';

        return [
            'cloud_name' => $cloudName,
            'api_key' => $apiKey,
            'api_secret' => $apiSecret,
        ];
    }

    /**
     * Sube un archivo a Cloudinary
     * 
     * @param string|array $fileInput Ruta a archivo local, Data URI Base64, URL o array de $_FILES
     * @param array $options Opciones como 'folder', 'tags', etc.
     * @return array
     * @throws RuntimeException
     */
    public static function upload(string|array $fileInput, array $options = []): array
    {
        $creds = self::getCredentials();
        $cloudName = $creds['cloud_name'];
        $apiKey = $creds['api_key'];
        $apiSecret = $creds['api_secret'];

        if (empty($cloudName) || empty($apiKey) || empty($apiSecret)) {
            throw new RuntimeException('Configuración de Cloudinary incompleta.');
        }

        $folder = $options['folder'] ?? 'portalink_notes';
        $timestamp = time();

        // Parámetros a firmar (ordenados alfabéticamente)
        $paramsToSign = [
            'folder' => $folder,
            'timestamp' => $timestamp,
        ];

        if (!empty($options['tags'])) {
            $paramsToSign['tags'] = is_array($options['tags']) ? implode(',', $options['tags']) : $options['tags'];
        }

        ksort($paramsToSign);

        $parts = [];
        foreach ($paramsToSign as $key => $val) {
            $parts[] = "{$key}={$val}";
        }
        $toSign = implode('&', $parts) . $apiSecret;
        $signature = sha1($toSign);

        // Preparar payload multipart
        $postFields = [
            'api_key' => $apiKey,
            'timestamp' => $timestamp,
            'folder' => $folder,
            'signature' => $signature,
        ];

        if (!empty($paramsToSign['tags'])) {
            $postFields['tags'] = $paramsToSign['tags'];
        }

        // Determinar tipo de archivo a enviar
        if (is_array($fileInput)) {
            // Caso array $_FILES
            $tmpPath = $fileInput['tmp_name'] ?? '';
            $originalName = $fileInput['name'] ?? 'upload.jpg';
            $mimeType = $fileInput['type'] ?? 'image/jpeg';

            if (!file_exists($tmpPath)) {
                throw new RuntimeException('El archivo temporal a subir no existe o es inválido.');
            }
            $postFields['file'] = new CURLFile($tmpPath, $mimeType, $originalName);
        } elseif (is_string($fileInput)) {
            if (file_exists($fileInput)) {
                // Ruta a archivo en disco
                $mimeType = mime_content_type($fileInput) ?: 'image/jpeg';
                $postFields['file'] = new CURLFile($fileInput, $mimeType, basename($fileInput));
            } else {
                // Base64 Data URI o URL remota
                $postFields['file'] = $fileInput;
            }
        } else {
            throw new RuntimeException('Formato de entrada de archivo no soportado para Cloudinary.');
        }

        $apiUrl = "https://api.cloudinary.com/v1_1/{$cloudName}/image/upload";

        $ch = curl_init($apiUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $postFields,
            CURLOPT_TIMEOUT => 45,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => false, // Compatible con entornos Windows sin bundle CA local
        ]);

        $responseBody = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($responseBody === false || $curlError) {
            error_log('[Cloudinary] cURL error: ' . $curlError);
            throw new RuntimeException('Error de conexión con Cloudinary: ' . $curlError);
        }

        $decoded = json_decode($responseBody, true);

        if ($httpCode !== 200 || !is_array($decoded)) {
            $msg = $decoded['error']['message'] ?? "Código HTTP {$httpCode} recibido de Cloudinary";
            error_log('[Cloudinary] Upload error (' . $httpCode . '): ' . $msg);
            throw new RuntimeException('Error de Cloudinary: ' . $msg, $httpCode);
        }

        return [
            'ok' => true,
            'public_id' => $decoded['public_id'] ?? '',
            'secure_url' => $decoded['secure_url'] ?? $decoded['url'] ?? '',
            'url' => $decoded['url'] ?? '',
            'width' => $decoded['width'] ?? 0,
            'height' => $decoded['height'] ?? 0,
            'format' => $decoded['format'] ?? '',
            'bytes' => $decoded['bytes'] ?? 0,
            'created_at' => $decoded['created_at'] ?? '',
        ];
    }
}
