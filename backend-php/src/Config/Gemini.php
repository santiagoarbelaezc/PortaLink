<?php

namespace App\Config;

use Exception;
use Throwable;

class Gemini
{
    /**
     * Ejecuta una llamada a la API REST de Google Gemini con reintento automático y respaldo de modelos
     */
    public static function callGemini(string $prompt, string $systemPrompt = '', array $history = []): array
    {
        @set_time_limit(120);

        $keys = array_filter([
            $_ENV['GEMINI_API_KEY'] ?? getenv('GEMINI_API_KEY') ?: '',
            $_ENV['GEMINI_API_KEY_2'] ?? getenv('GEMINI_API_KEY_2') ?: '',
            $_ENV['GEMINI_API_KEY_3'] ?? getenv('GEMINI_API_KEY_3') ?: ''
        ]);
        
        // Lista de modelos oficiales y activos de Gemini según la API de Google
        $modelsToTry = [
            'gemini-3.6-flash',
            'gemini-3.1-pro-preview',
            'gemini-flash-latest',
            'gemini-pro-latest'
        ];

        $lastError = null;

        foreach ($keys as $apiKey) {
            $keyQuotaExceeded = false;

            foreach ($modelsToTry as $model) {
                if ($keyQuotaExceeded) {
                    break; // Pasar a la siguiente API Key si esta ya excedió su cuota
                }

                try {
                    return self::requestGeminiModel($model, $apiKey, $prompt, $systemPrompt, $history);
                } catch (Throwable $e) {
                    $lastError = $e->getMessage();
                    error_log("⚠️ [Gemini] Key ...".substr($apiKey, -8)." con modelo {$model} falló: {$lastError}");
                    
                    // Si la cuota de la key está agotada (HTTP 429 / Quota exceeded), saltar al siguiente key directamente
                    if (stripos($lastError, 'quota') !== false || stripos($lastError, 'exceeded') !== false || stripos($lastError, '429') !== false) {
                        $keyQuotaExceeded = true;
                    }
                    continue;
                }
            }
        }

        // Si todos los modelos/keys de Gemini fallaron o están sin cuota, recurrir a Groq AI inmediatamente
        error_log("ℹ️ [Gemini] Todas las keys/modelos de Gemini no disponibles. Activando respaldo ultrarrápido con Groq AI...");
        try {
            $messages = [];
            if (!empty($systemPrompt)) {
                $messages[] = ['role' => 'system', 'content' => $systemPrompt];
            }
            if (!empty($history) && is_array($history)) {
                foreach ($history as $h) {
                    $messages[] = [
                        'role' => ($h['role'] === 'user') ? 'user' : 'assistant',
                        'content' => $h['content'] ?? ''
                    ];
                }
            }
            $messages[] = ['role' => 'user', 'content' => $prompt];

            $groqRes = Groq::callGroq($messages, [
                'temperature' => 0.6,
                'max_tokens' => 2048
            ]);

            return [
                'content' => trim($groqRes['content'] ?? ''),
                'raw' => $groqRes,
                'fallback' => true
            ];
        } catch (Throwable $fallbackErr) {
            throw new Exception("Gemini e IA de respaldo saturados. Detalle: " . ($lastError ?: $fallbackErr->getMessage()));
        }
    }

    private static function requestGeminiModel(string $model, string $apiKey, string $prompt, string $systemPrompt, array $history): array
    {
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

        $contents = [];

        if (!empty($history) && is_array($history)) {
            foreach ($history as $msg) {
                $role = ($msg['role'] === 'user') ? 'user' : 'model';
                $text = trim($msg['content'] ?? '');
                if (!empty($text)) {
                    $contents[] = [
                        'role' => $role,
                        'parts' => [
                            ['text' => $text]
                        ]
                    ];
                }
            }
        }

        $contents[] = [
            'role' => 'user',
            'parts' => [
                ['text' => $prompt]
            ]
        ];

        $payload = [
            'contents' => $contents,
            'tools' => [
                ['google_search' => (object)[]]
            ]
        ];

        if (!empty($systemPrompt)) {
            $payload['systemInstruction'] = [
                'parts' => [
                    ['text' => $systemPrompt]
                ]
            ];
        }

        $result = self::executeGeminiCurl($url, $apiKey, $payload, $model);
        
        // Si falló por tools o rate limit de grounding, reintentar sin tools
        if (!$result['ok']) {
            // Si fue error de cuota / rate limit, propagar error de inmediato
            if (stripos($result['error'] ?? '', 'quota') !== false || stripos($result['error'] ?? '', 'exceeded') !== false) {
                throw new Exception($result['error']);
            }

            unset($payload['tools']);
            $result = self::executeGeminiCurl($url, $apiKey, $payload, $model);
            if (!$result['ok']) {
                throw new Exception($result['error']);
            }
        }

        $resData = $result['data'];
        $text = $resData['candidates'][0]['content']['parts'][0]['text'] ?? '';

        if (empty($text)) {
            throw new Exception("Gemini ({$model}) no retornó texto.");
        }

        // Extraer metadata de Google Search grounding si existe
        $groundingMeta = $resData['candidates'][0]['groundingMetadata'] ?? null;
        $searchQueries = $groundingMeta['webSearchQueries'] ?? [];
        $groundingChunks = $groundingMeta['groundingChunks'] ?? [];

        $sources = [];
        foreach ($groundingChunks as $chunk) {
            if (isset($chunk['web'])) {
                $sources[] = [
                    'title' => $chunk['web']['title'] ?? '',
                    'url'   => $chunk['web']['uri'] ?? ''
                ];
            }
        }

        return [
            'content'       => $text,
            'raw'           => $result,
            'model'         => $model,
            'searchQueries' => $searchQueries,
            'sources'       => $sources,
            'wasGrounded'   => !empty($groundingChunks)
        ];
    }

    private static function executeGeminiCurl(string $url, string $apiKey, array $payload, string $model): array
    {
        $jsonPayload = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'X-goog-api-key: ' . $apiKey
            ],
            CURLOPT_POSTFIELDS => $jsonPayload,
            CURLOPT_CONNECTTIMEOUT => 3,
            CURLOPT_TIMEOUT => 6,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => 0,
            CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4
        ]);

        $response = curl_exec($ch);
        $error = curl_error($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($error) {
            return ['ok' => false, 'error' => "cURL Error ({$model}): " . $error];
        }

        if ($httpCode !== 200) {
            $errData = json_decode($response, true);
            $errMsg = $errData['error']['message'] ?? "HTTP {$httpCode} de Gemini ({$model})";
            return ['ok' => false, 'error' => $errMsg];
        }

        $resData = json_decode($response, true);
        return ['ok' => true, 'data' => $resData];
    }
}

