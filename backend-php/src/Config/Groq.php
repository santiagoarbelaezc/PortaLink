<?php

namespace App\Config;

use App\Utils\AiLogger;
use RuntimeException;
use Throwable;

class Groq
{
    /**
     * Llama a la API de Groq con failover automático entre múltiples API keys via cURL.
     * @param array $messages Array de mensajes en formato OpenAI [['role' => 'user', 'content' => '...']]
     * @param array $options Opciones adicionales (temperature, max_tokens)
     * @return array {content: string, tokens: int}
     * @throws RuntimeException
     */
    public static function callGroq(array $messages, array $options = []): array
    {
        // Pool de API Keys de Groq soportando nombres estándar y alternativas
        $keys = array_values(array_unique(array_filter([
            $_ENV['GROQ_API_KEY_COPILOT'] ?? getenv('GROQ_API_KEY_COPILOT') ?: '',
            $_ENV['GROQ_API_KEY_PRIMARY'] ?? getenv('GROQ_API_KEY_PRIMARY') ?: '',
            $_ENV['GROQ_API_KEY'] ?? getenv('GROQ_API_KEY') ?: '',
            $_ENV['GROQ_API_KEY_1'] ?? getenv('GROQ_API_KEY_1') ?: '',
            $_ENV['GROQ_API_KEY_2'] ?? getenv('GROQ_API_KEY_2') ?: '',
            $_ENV['GROQ_API_KEY_FALLBACK'] ?? getenv('GROQ_API_KEY_FALLBACK') ?: '',
            $_ENV['GROQ_API_KEY_3'] ?? getenv('GROQ_API_KEY_3') ?: ''
        ])));

        $preferredModel = $options['model'] ?? null;
        $modelsToTry = array_values(array_unique(array_filter([
            $preferredModel,
            $_ENV['GROQ_MODEL'] ?? getenv('GROQ_MODEL') ?: 'openai/gpt-oss-120b',
            'openai/gpt-oss-120b',
            'llama-3.3-70b-versatile',
            'llama-3.1-8b-instant'
        ])));

        $maxTokens = (int)($options['max_tokens'] ?? $_ENV['GROQ_MAX_TOKENS'] ?? getenv('GROQ_MAX_TOKENS') ?: 2048);
        $temperature = (float)($options['temperature'] ?? $_ENV['GROQ_TEMPERATURE'] ?? getenv('GROQ_TEMPERATURE') ?: 1.0);

        if (empty($keys)) {
            AiLogger::error('Groq', 'No hay API keys configuradas para Groq en .env');
            throw new RuntimeException("No hay API keys configuradas para Groq.");
        }

        $lastError = null;
        foreach ($keys as $apiKey) {
            $keySuffix = substr($apiKey, -6);
            $keyQuotaExceeded = false;

            foreach ($modelsToTry as $model) {
                if ($keyQuotaExceeded) {
                    break;
                }

                try {
                    $result = self::makeGroqRequest($apiKey, $messages, [
                        'model' => $model,
                        'max_tokens' => $maxTokens,
                        'temperature' => $temperature,
                    ]);
                    AiLogger::info('Groq', "Llamada exitosa con modelo {$model} (Key ...{$keySuffix})");
                    return $result;
                } catch (Throwable $err) {
                    $lastError = $err->getMessage();
                    AiLogger::warning('Groq', "Fallo con modelo {$model} (Key ...{$keySuffix}): {$lastError}");
                    
                    if (stripos($lastError, 'rate_limit') !== false || 
                        stripos($lastError, 'quota') !== false || 
                        stripos($lastError, '429') !== false ||
                        stripos($lastError, 'exceeded') !== false) {
                        AiLogger::warning('Groq', "Rate limit / Cuota alcanzada en Key ...{$keySuffix}. Rotando...");
                        $keyQuotaExceeded = true;
                    }
                    continue;
                }
            }
        }

        $finalMsg = "Todas las API keys y modelos de Groq fallaron. Detalle: " . ($lastError ?: 'Error desconocido');
        AiLogger::error('Groq', $finalMsg);
        throw new RuntimeException($finalMsg);
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
            CURLOPT_TIMEOUT => 25,
            CURLOPT_CONNECTTIMEOUT => 5,
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
            $errMsg = $parsed['error']['message'] ?? "Error HTTP {$statusCode} desde Groq";
            throw new RuntimeException("Groq Error ({$statusCode}): {$errMsg}", $statusCode);
        }

        $content = $parsed['choices'][0]['message']['content'] ?? '';
        $tokens = (int)($parsed['usage']['total_tokens'] ?? 0);

        if (empty($content)) {
            throw new RuntimeException("Groq respondió sin contenido en el mensaje.");
        }

        return [
            'content' => $content,
            'tokens' => $tokens,
            'model' => $options['model']
        ];
    }

    /**
     * Transcribe un archivo de audio binario usando Groq Whisper (whisper-large-v3-turbo / whisper-large-v3)
     * @param string $binaryAudio Datos de audio binarios
     * @param string $mimeType Tipo MIME (e.g. audio/webm, audio/mp4, audio/wav, audio/m4a)
     * @param array $options Opciones adicionales (language, prompt)
     * @return string Transcripción en texto
     */
    public static function transcribeAudio(string $binaryAudio, string $mimeType = 'audio/webm', array $options = []): string
    {
        $keys = array_values(array_unique(array_filter([
            $_ENV['GROQ_API_KEY_COPILOT'] ?? getenv('GROQ_API_KEY_COPILOT') ?: '',
            $_ENV['GROQ_API_KEY_PRIMARY'] ?? getenv('GROQ_API_KEY_PRIMARY') ?: '',
            $_ENV['GROQ_API_KEY'] ?? getenv('GROQ_API_KEY') ?: '',
            $_ENV['GROQ_API_KEY_1'] ?? getenv('GROQ_API_KEY_1') ?: '',
            $_ENV['GROQ_API_KEY_2'] ?? getenv('GROQ_API_KEY_2') ?: '',
            $_ENV['GROQ_API_KEY_FALLBACK'] ?? getenv('GROQ_API_KEY_FALLBACK') ?: '',
            $_ENV['GROQ_API_KEY_3'] ?? getenv('GROQ_API_KEY_3') ?: ''
        ])));

        if (empty($keys)) {
            throw new RuntimeException("No hay API keys configuradas para Groq.");
        }

        $cleanMime = explode(';', $mimeType)[0] ?: 'audio/webm';
        $ext = 'webm';
        if (str_contains($cleanMime, 'mp4') || str_contains($cleanMime, 'm4a') || str_contains($cleanMime, 'aac')) {
            $ext = 'm4a';
        } elseif (str_contains($cleanMime, 'wav')) {
            $ext = 'wav';
        } elseif (str_contains($cleanMime, 'mp3') || str_contains($cleanMime, 'mpeg')) {
            $ext = 'mp3';
        } elseif (str_contains($cleanMime, 'ogg')) {
            $ext = 'ogg';
        }

        $tmpBase = tempnam(sys_get_temp_dir(), 'groq_stt_');
        $tmpFilePath = $tmpBase . '.' . $ext;
        @unlink($tmpBase);
        file_put_contents($tmpFilePath, $binaryAudio);

        $models = ['whisper-large-v3-turbo', 'whisper-large-v3'];
        $lastError = null;

        try {
            foreach ($keys as $apiKey) {
                $keySuffix = substr($apiKey, -6);
                foreach ($models as $model) {
                    try {
                        $ch = curl_init('https://api.groq.com/openai/v1/audio/transcriptions');
                        $cFile = new \CURLFile($tmpFilePath, $cleanMime, 'audio.' . $ext);
                        $postData = [
                            'file' => $cFile,
                            'model' => $model,
                            'response_format' => 'json',
                            'temperature' => 0.0
                        ];

                        if (!empty($options['language'])) {
                            $postData['language'] = $options['language'];
                        }
                        $postData['prompt'] = $options['prompt'] ?? 'Transcribe verbatim the exact words spoken by the user in English or Spanish. Output exact words and do not translate.';

                        curl_setopt_array($ch, [
                            CURLOPT_RETURNTRANSFER => true,
                            CURLOPT_POST => true,
                            CURLOPT_POSTFIELDS => $postData,
                            CURLOPT_HTTPHEADER => [
                                'Authorization: Bearer ' . $apiKey
                            ],
                            CURLOPT_TIMEOUT => 20,
                            CURLOPT_CONNECTTIMEOUT => 5,
                            CURLOPT_SSL_VERIFYPEER => false,
                        ]);

                        $responseBody = curl_exec($ch);
                        $curlError = curl_error($ch);
                        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                        curl_close($ch);

                        if ($responseBody === false || $curlError) {
                            throw new RuntimeException("Error cURL en Groq Whisper: " . $curlError);
                        }

                        $parsed = json_decode($responseBody, true);
                        if ($statusCode !== 200) {
                            $errMsg = $parsed['error']['message'] ?? "Error HTTP {$statusCode}";
                            throw new RuntimeException("Groq Whisper Error ({$statusCode}): {$errMsg}");
                        }

                        $text = trim($parsed['text'] ?? '');
                        if ($text !== '') {
                            AiLogger::info('GroqWhisper', "Audio transcrito con éxito usando {$model} (Key ...{$keySuffix})");
                            return $text;
                        }
                    } catch (Throwable $err) {
                        $lastError = $err->getMessage();
                        AiLogger::warning('GroqWhisper', "Fallo con {$model} (Key ...{$keySuffix}): {$lastError}");
                        continue;
                    }
                }
            }
        } finally {
            if (file_exists($tmpFilePath)) {
                @unlink($tmpFilePath);
            }
        }

        throw new RuntimeException("No se pudo transcribir el audio con Groq Whisper. Detalle: " . ($lastError ?: 'Error desconocido'));
    }
}
