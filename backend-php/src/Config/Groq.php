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

        $model = $_ENV['GROQ_MODEL'] ?? getenv('GROQ_MODEL') ?: 'openai/gpt-oss-120b';
        $maxTokens = (int)($options['max_tokens'] ?? $_ENV['GROQ_MAX_TOKENS'] ?? getenv('GROQ_MAX_TOKENS') ?: 2048);
        $temperature = (float)($options['temperature'] ?? $_ENV['GROQ_TEMPERATURE'] ?? getenv('GROQ_TEMPERATURE') ?: 1.0);

        $keys = array_filter([$primaryKey, $fallbackKey]);
        if (empty($keys)) {
            throw new RuntimeException("No hay API keys configuradas para Groq.");
        }

        $lastError = null;
        foreach ($keys as $apiKey) {
            try {
                return self::makeGroqRequest($apiKey, $messages, [
                    'model' => $model,
                    'max_tokens' => $maxTokens,
                    'temperature' => $temperature,
                ]);
            } catch (RuntimeException $err) {
                error_log("⚠️ [Groq] Falló con key ..." . substr($apiKey, -8) . ": " . $err->getMessage());
                $lastError = $err;
                
                $code = $err->getCode();
                // Solo hacer failover en errores de rate limit (429), auth (401) o servidor (>=500)
                if ($code === 401 || $code === 429 || $code >= 500) {
                    continue;
                }
                throw $err;
            }
        }

        throw $lastError ?: new RuntimeException("Todas las API keys de Groq fallaron.");
    }

    private static function makeGroqRequest(string $apiKey, array $messages, array $options): array
    {
        $ch = curl_init('https://api.groq.com/openai/v1/chat/completions');

        $payloadData = [
            'model' => $options['model'],
            'messages' => $messages,
            'temperature' => $options['temperature'],
            'max_completion_tokens' => $options['max_tokens'],
            'max_tokens' => $options['max_tokens'],
            'top_p' => 1
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
}
