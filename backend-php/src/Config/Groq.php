<?php

namespace App\Config;

use RuntimeException;

class Groq
{
    /**
     * Llama a la API de Groq con failover automático entre dos API keys via cURL.
     * @param array $messages Array de mensajes en formato OpenAI [['role' => 'user', 'content' => '...']]
     * @param array $options Opciones adicionales (temperature, max_tokens)
     * @return array {content: string, tokens: int}
     * @throws RuntimeException
     */
    public static function callGroq(array $messages, array $options = []): array
    {
        $keyType = $options['key_type'] ?? 'design';
        
        if ($keyType === 'consulting') {
            $primaryKey = $_ENV['GROQ_API_KEY_CONSULTING'] ?? getenv('GROQ_API_KEY_CONSULTING');
            $fallbackKey = null; // No fallback for consulting yet
        } else {
            $primaryKey = $_ENV['GROQ_API_KEY_PRIMARY'] ?? getenv('GROQ_API_KEY_PRIMARY');
            $fallbackKey = $_ENV['GROQ_API_KEY_FALLBACK'] ?? getenv('GROQ_API_KEY_FALLBACK');
        }

        $modelsToTry = array_unique(array_filter([
            $_ENV['GROQ_MODEL'] ?? getenv('GROQ_MODEL') ?: 'llama-3.3-70b-versatile',
            'llama-3.3-70b-versatile',
            'llama-3.1-8b-instant',
            'openai/gpt-oss-120b'
        ]));
        $maxTokens = (int)($options['max_tokens'] ?? $_ENV['GROQ_MAX_TOKENS'] ?? getenv('GROQ_MAX_TOKENS') ?: 2048);
        $temperature = (float)($options['temperature'] ?? $_ENV['GROQ_TEMPERATURE'] ?? getenv('GROQ_TEMPERATURE') ?: 0.7);

        $keys = array_filter([$primaryKey, $fallbackKey]);
        if (empty($keys)) {
            throw new RuntimeException("No hay API keys configuradas para Groq.");
        }

        $lastError = null;
        foreach ($keys as $apiKey) {
            foreach ($modelsToTry as $model) {
                try {
                    return self::makeGroqRequest($apiKey, $messages, [
                        'model' => $model,
                        'max_tokens' => $maxTokens,
                        'temperature' => $temperature,
                    ]);
                } catch (RuntimeException $err) {
                    error_log("⚠️ [Groq] Falló con key ..." . substr($apiKey, -8) . " modelo {$model}: " . $err->getMessage());
                    $lastError = $err;
                    continue;
                }
            }
        }

        throw $lastError ?: new RuntimeException("Todas las API keys y modelos de Groq fallaron.");
    }

    private static function makeGroqRequest(string $apiKey, array $messages, array $options): array
    {
        $ch = curl_init('https://api.groq.com/openai/v1/chat/completions');

        $payloadData = [
            'model' => $options['model'],
            'messages' => $messages,
            'temperature' => (float)$options['temperature'],
            'max_completion_tokens' => (int)$options['max_tokens'],
            'top_p' => 1,
            'reasoning_effort' => 'medium'
        ];

        $payload = json_encode($payloadData, JSON_UNESCAPED_UNICODE);

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $apiKey,
                'Content-Type: application/json',
                'Content-Length: ' . strlen($payload)
            ],
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => false,
        ]);

        $responseBody = curl_exec($ch);
        $curlError = curl_error($ch);
        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($responseBody === false || $curlError) {
            throw new RuntimeException("Error de red al llamar a Groq: " . $curlError, 0);
        }

        $parsed = json_decode($responseBody, true);
        if ($statusCode !== 200) {
            $errorMsg = $parsed['error']['message'] ?? ("Error HTTP " . $statusCode);
            throw new RuntimeException($errorMsg, $statusCode);
        }

        $content = $parsed['choices'][0]['message']['content'] ?? '';
        $tokens = (int)($parsed['usage']['completion_tokens'] ?? 0);

        return [
            'content' => $content,
            'tokens' => $tokens
        ];
    }

    /**
     * Transcribe audio a texto en menos de 300ms usando Whisper Large v3 Turbo en Groq.
     */
    public static function transcribeAudio(string $binaryAudio, string $mimeType = 'audio/webm'): string
    {
        $primaryKey = $_ENV['GROQ_API_KEY_PRIMARY'] ?? getenv('GROQ_API_KEY_PRIMARY');
        $fallbackKey = $_ENV['GROQ_API_KEY_FALLBACK'] ?? getenv('GROQ_API_KEY_FALLBACK');
        $keys = array_values(array_unique(array_filter([$primaryKey, $fallbackKey])));

        if (empty($keys) || empty($binaryAudio)) return '';

        $ext = 'webm';
        if (str_contains($mimeType, 'mp4') || str_contains($mimeType, 'm4a')) $ext = 'm4a';
        elseif (str_contains($mimeType, 'ogg')) $ext = 'ogg';
        elseif (str_contains($mimeType, 'wav')) $ext = 'wav';

        $tmpFile = tempnam(sys_get_temp_dir(), 'rotbot_') . '.' . $ext;
        file_put_contents($tmpFile, $binaryAudio);

        foreach ($keys as $apiKey) {
            try {
                $cfile = new \CURLFile($tmpFile, $mimeType, 'recording.' . $ext);
                $postData = [
                    'file' => $cfile,
                    'model' => 'whisper-large-v3-turbo',
                    'language' => 'en',
                    'response_format' => 'json',
                    'temperature' => '0.0'
                ];

                $ch = curl_init('https://api.groq.com/openai/v1/audio/transcriptions');
                curl_setopt_array($ch, [
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_POST => true,
                    CURLOPT_POSTFIELDS => $postData,
                    CURLOPT_HTTPHEADER => [
                        'Authorization: Bearer ' . $apiKey
                    ],
                    CURLOPT_TIMEOUT => 8,
                    CURLOPT_SSL_VERIFYPEER => false,
                    CURLOPT_SSL_VERIFYHOST => 0
                ]);

                $res = curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);

                if ($httpCode === 200 && $res) {
                    $json = json_decode($res, true);
                    if (!empty($json['text'])) {
                        @unlink($tmpFile);
                        return trim($json['text']);
                    }
                }
            } catch (\Throwable $e) {
                error_log('[Groq Whisper] Error: ' . $e->getMessage());
            }
        }

        @unlink($tmpFile);
        return '';
    }
}
