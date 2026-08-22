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
        $apiKey = $_ENV['GEMINI_API_KEY'] ?? '';
        
        // Lista de modelos de Gemini en orden de preferencia
        $modelsToTry = [
            'gemini-2.0-flash',
            'gemini-1.5-flash',
            'gemini-flash-latest',
            'gemini-1.5-pro'
        ];

        $lastError = null;

        foreach ($modelsToTry as $model) {
            try {
                return self::requestGeminiModel($model, $apiKey, $prompt, $systemPrompt, $history);
            } catch (Throwable $e) {
                $lastError = $e->getMessage();
                // Si el modelo está ocupado o en alta demanda, probar el siguiente modelo automáticamente
                if (str_contains(strtolower($lastError), 'demand') || str_contains(strtolower($lastError), '429') || str_contains(strtolower($lastError), '503') || str_contains(strtolower($lastError), 'not found')) {
                    continue;
                } else {
                    // Si es un error de API Key u otro error crítico, romper o reintentar
                    continue;
                }
            }
        }

        // Si todos los modelos de Gemini están saturados, recurrir a Groq AI como respaldo de seguridad
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
            'contents' => $contents
        ];

        if (!empty($systemPrompt)) {
            $payload['systemInstruction'] = [
                'parts' => [
                    ['text' => $systemPrompt]
                ]
            ];
        }

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
            CURLOPT_CONNECTTIMEOUT => 8,
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
            throw new Exception("cURL Error ({$model}): " . $error);
        }

        if ($httpCode !== 200) {
            $errData = json_decode($response, true);
            $errMsg = $errData['error']['message'] ?? "HTTP {$httpCode} de Gemini ({$model})";
            throw new Exception($errMsg);
        }

        $result = json_decode($response, true);
        $text = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';

        if (empty($text)) {
            throw new Exception("Gemini ({$model}) no retornó texto.");
        }

        return [
            'content' => $text,
            'raw' => $result,
            'model' => $model
        ];
    }
}
