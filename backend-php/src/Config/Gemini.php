<?php

namespace App\Config;

use App\Utils\AiLogger;
use Exception;
use Throwable;

class Gemini
{
    /**
     * Ejecuta una llamada a la API REST de Google Gemini con pool de claves, reintento automático y respaldo a Groq
     */
    public static function callGemini(string $prompt, string $systemPrompt = '', array $history = []): array
    {
        @set_time_limit(120);

        // Pool de API Keys de Google Gemini
        $keys = array_values(array_unique(array_filter([
            $_ENV['GEMINI_API_KEY'] ?? getenv('GEMINI_API_KEY') ?: '',
            $_ENV['GEMINI_API_KEY_1'] ?? getenv('GEMINI_API_KEY_1') ?: '',
            $_ENV['GEMINI_API_KEY_2'] ?? getenv('GEMINI_API_KEY_2') ?: '',
            $_ENV['GEMINI_API_KEY_3'] ?? getenv('GEMINI_API_KEY_3') ?: '',
            $_ENV['GEMINI_API_KEY_4'] ?? getenv('GEMINI_API_KEY_4') ?: '',
            $_ENV['GEMINI_API_KEY_5'] ?? getenv('GEMINI_API_KEY_5') ?: ''
        ])));
        
        // Modelos soportados de Google Gemini en orden de preferencia y velocidad
        $modelsToTry = [
            'gemini-3.6-flash',
            'gemini-flash-latest',
            'gemini-3.1-pro-preview',
            'gemini-2.5-flash',
            'gemini-pro-latest'
        ];

        $lastError = null;
        $failedKeysCount = 0;

        if (!empty($keys)) {
            foreach ($keys as $keyIndex => $apiKey) {
                $keySuffix = substr($apiKey, -6);
                $keyQuotaExceeded = false;

                foreach ($modelsToTry as $model) {
                    if ($keyQuotaExceeded) {
                        break; // Pasar a la siguiente API Key si esta ya excedió su cuota
                    }

                    try {
                        $response = self::requestGeminiModel($model, $apiKey, $prompt, $systemPrompt, $history);
                        AiLogger::info('Gemini', "Respuesta exitosa con modelo {$model} (Key ...{$keySuffix})");
                        return $response;
                    } catch (Throwable $e) {
                        $lastError = $e->getMessage();
                        AiLogger::warning('Gemini', "Fallo con modelo {$model} (Key ...{$keySuffix}): {$lastError}");
                        
                        // Si la cuota de la key está agotada (HTTP 429 / Quota exceeded / Resource Exhausted), saltar al siguiente key
                        if (stripos($lastError, 'quota') !== false || 
                            stripos($lastError, 'exceeded') !== false || 
                            stripos($lastError, '429') !== false ||
                            stripos($lastError, 'RESOURCE_EXHAUSTED') !== false) {
                            AiLogger::warning('Gemini', "Cuota agotada en Key ...{$keySuffix}. Rotando a la siguiente API Key...");
                            $keyQuotaExceeded = true;
                        }
                        continue;
                    }
                }
                $failedKeysCount++;
            }
        } else {
            AiLogger::warning('Gemini', 'No se encontraron GEMINI_API_KEY en el entorno. Pasando directamente a Groq de respaldo.');
        }

        // Si todos los modelos/keys de Gemini fallaron o están sin cuota, recurrir a Groq AI inmediatamente
        AiLogger::info('Gemini', 'Activando motor de respaldo con Groq AI...');
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

            AiLogger::info('Groq', 'Respuesta exitosa obtenida desde motor de respaldo Groq.');

            return [
                'content' => trim($groqRes['content'] ?? ''),
                'raw' => $groqRes,
                'fallback' => true,
                'provider' => 'groq'
            ];
        } catch (Throwable $fallbackErr) {
            $fatalMsg = "Servicios de IA no disponibles. Gemini: " . ($lastError ?: 'Sin claves válidas') . " | Groq: " . $fallbackErr->getMessage();
            AiLogger::error('Gemini', $fatalMsg);
            throw new Exception($fatalMsg);
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
            if (stripos($result['error'] ?? '', 'quota') !== false || 
                stripos($result['error'] ?? '', 'exceeded') !== false ||
                stripos($result['error'] ?? '', '429') !== false) {
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
            'wasGrounded'   => !empty($groundingChunks),
            'provider'      => 'gemini'
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
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 25,
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
