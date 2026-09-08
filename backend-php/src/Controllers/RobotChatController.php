<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Config\Gemini;
use App\Config\Groq;

class RobotChatController
{
    /**
     * Endpoint: POST /api/robot/chat
     * Procesa la conversación con inteligencia artificial sin bloqueos de copyright y síntesis de voz con ElevenLabs.
     */
    public function chat(Request $request, Response $response): void
    {
        @set_time_limit(120);
        $body = $request->body;
        $userMessage = trim($body['message'] ?? '');
        $history = $body['history'] ?? [];
        $studyPlan = trim($body['study_plan'] ?? '');

        if (empty($userMessage)) {
            $response->status(400)->json([
                'ok' => false,
                'error' => 'El mensaje no puede estar vacío'
            ]);
            return;
        }

        $elevenKeys = array_filter([
            getenv('ELEVENLABS_API_KEY') ?: ($_ENV['ELEVENLABS_API_KEY'] ?? ''),
            getenv('ELEVENLABS_API_KEY_2') ?: ($_ENV['ELEVENLABS_API_KEY_2'] ?? ''),
            getenv('ELEVENLABS_API_KEY_3') ?: ($_ENV['ELEVENLABS_API_KEY_3'] ?? '')
        ]);
        $voiceId = $body['voice_id'] ?? getenv('ELEVENLABS_VOICE_ID') ?: ($_ENV['ELEVENLABS_VOICE_ID'] ?? 'bIHbv24MWmeRgasZH58o');

        // 1. Obtener respuesta conversacional inteligente con contexto de plan de estudio
        $aiResult = $this->generateRobotReply($userMessage, $history, $studyPlan);
        $replyText = $aiResult['reply'];
        $emotion = $aiResult['emotion'];

        // 2. Limpiar el texto para que ElevenLabs hable 100% fluido
        $speechText = $this->cleanTextForSpeech($replyText);

        // 3. Generar síntesis de voz con ElevenLabs TTS (soporta rotación de API Keys)
        $audioBase64 = null;
        if (!empty($elevenKeys) && !empty($voiceId) && !empty($speechText)) {
            $audioBase64 = $this->callElevenLabsTTS($speechText, $voiceId, $elevenKeys);
        }

        // Si ElevenLabs agotó cuota o falló, activar motor Neural Hi-Fi ilimitado de respaldo
        if (empty($audioBase64) && !empty($speechText)) {
            $audioBase64 = $this->callNeuralFallbackTTS($speechText, 'en-US');
        }

        $response->json([
            'ok' => true,
            'reply' => $replyText,
            'emotion' => $emotion,
            'audio' => $audioBase64,
            'sources' => $aiResult['sources'] ?? []
        ]);
    }

    /**
     * Endpoint: POST /api/robot/transcribe
     * Transcribe fielmente el audio del usuario en inglés usando Groq Whisper Turbo o Gemini Multimodal.
     */
    public function transcribe(Request $request, Response $response): void
    {
        @set_time_limit(30);
        $body = $request->body;
        $base64Audio = $body['audio'] ?? '';
        $mimeType = $body['mimeType'] ?? 'audio/webm';

        if (empty($base64Audio)) {
            $response->status(400)->json([
                'ok' => false,
                'error' => 'El audio no puede estar vacío'
            ]);
            return;
        }

        $audioData = str_contains($base64Audio, 'base64,') ? explode('base64,', $base64Audio)[1] : $base64Audio;
        $binaryAudio = base64_decode($audioData);

        // 1. Intentar primero con Groq Whisper (Ultra-rápido: ~200ms)
        try {
            $groqTranscript = Groq::transcribeAudio($binaryAudio, $mimeType, [
                'prompt' => 'Transcribe verbatim what the user said in English or whatever words were spoken. Output only the exact spoken words without translation.'
            ]);
            if (!empty($groqTranscript)) {
                $response->json([
                    'ok' => true,
                    'transcript' => $groqTranscript
                ]);
                return;
            }
        } catch (\Throwable $e) {
            error_log('[RobotChat] Groq Whisper fallback error: ' . $e->getMessage());
        }

        // 2. Fallback: Gemini Multimodal con timeout corto (5s)
        $transcript = $this->transcribeAudioGemini($audioData, $mimeType);

        $response->json([
            'ok' => true,
            'transcript' => $transcript
        ]);
    }

    /**
     * Transcribe audio con Gemini Multimodal
     */
    private function transcribeAudioGemini(string $audioData, string $mimeType): string
    {
        $apiKey = getenv('GEMINI_API_KEY') ?: ($_ENV['GEMINI_API_KEY'] ?? '');
        $model = getenv('GEMINI_MODEL') ?: 'gemini-3.6-flash';

        $cleanMime = explode(';', $mimeType)[0];
        if (!$cleanMime || $cleanMime === 'audio/x-m4a') $cleanMime = 'audio/mp4';

        $promptText = "Transcribe verbatim what the user said in English or whatever words were spoken. Output only the transcript without quotes.";

        try {
            $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent";

            $payload = [
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [
                            ['text' => $promptText],
                            [
                                'inline_data' => [
                                    'mime_type' => $cleanMime,
                                    'data' => $audioData
                                ]
                            ]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.1,
                    'maxOutputTokens' => 300
                ]
            ];

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'X-goog-api-key: ' . $apiKey
            ]);
            curl_setopt($ch, CURLOPT_TIMEOUT, 6);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);

            $rawResponse = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode === 200 && $rawResponse) {
                $decoded = json_decode($rawResponse, true);
                if (!empty($decoded['candidates'][0]['content']['parts'][0]['text'])) {
                    $text = trim($decoded['candidates'][0]['content']['parts'][0]['text']);
                    return trim($text, '"\'`');
                }
            }
        } catch (\Throwable $e) {
            error_log("[RobotChat] Audio transcribe error: " . $e->getMessage());
        }

        return '';
    }

    /**
     * Genera respuesta conversacional como Compañero/Tutor de Inglés en modo charla, incorporando el plan de estudio activo si existe.
     */
    private function generateRobotReply(string $userMessage, array $history = [], string $studyPlan = ''): array
    {
        $systemPrompt = $this->buildSystemPrompt($studyPlan);
        $promptMessage = $userMessage;

        // 1. SIEMPRE intentar Gemini primero (con failover de keys y modelos)
        try {
            $geminiRes = Gemini::callGemini($promptMessage, $systemPrompt, $history);
            $content = trim($geminiRes['content'] ?? '');
            $sources = $geminiRes['sources'] ?? [];

            if (!empty($content)) {
                $parsed = $this->parseJsonResponse($content);
                if ($parsed && !empty($parsed['reply']) && !$this->isRefusalResponse($parsed['reply'])) {
                    return array_merge($parsed, ['sources' => $sources]);
                }
            }
        } catch (\Throwable $e) {
            error_log('[RobotChat] Gemini error: ' . $e->getMessage());
        }

        // 2. Fallback: Buscar contexto web via Gemini Search y pasarlo a Groq
        $webContext = $this->searchWebContext($promptMessage);
        $enrichedMessage = $promptMessage;
        if (!empty($webContext)) {
            $enrichedMessage = "CONTEXTO DE APOYO:\n{$webContext}\n\nINSTRUCCIÓN:\n{$promptMessage}";
        }

        $groqFallback = $this->callGroqLLM($enrichedMessage, $systemPrompt, $history);
        if (!empty($groqFallback['reply']) && !$this->isRefusalResponse($groqFallback['reply'])) {
            return $groqFallback;
        }

        // 3. Respuesta de emergencia
        return [
            'reply' => 'I am here to help you master English. What would you like to talk about today?',
            'emotion' => 'happy'
        ];
    }

    /**
     * Construye el System Prompt conversacional de inglés incorporando fuentes/planes de estudio.
     */
    private function buildSystemPrompt(string $studyPlan = ''): string
    {
        $planDirective = '';
        if (!empty($studyPlan)) {
            $planDirective = "\n\nCRITICAL CONTEXT — ACTIVE DAILY STUDY PLAN / SYLLABUS / STUDY SOURCES:\n\"\"\"\n{$studyPlan}\n\"\"\"\n"
                           . "MANDATORY SYLLABUS INSTRUCTION:\n"
                           . "- Strictly ground your conversation, dialogue scenarios, vocabulary questions, examples, and discussion on this Daily Study Plan.\n"
                           . "- Help the user thoroughly practice, discuss, and master the grammar rules, vocabulary terms, readings, and songs present in this syllabus.\n";
        }

        return <<<PROMPT
You are Rotbot, a native English-speaking close friend and conversational partner.
YOUR OBJECTIVE: Maintain a natural, 100% English conversation to help the user build fluency, confidence, and real-world vocabulary.
{$planDirective}
RULES:
1. Always respond 100% in natural, modern, fluent English.
2. If an active study plan is provided, naturally discuss its topics, scenarios, vocabulary, and questions in conversation.
3. If the user writes or speaks in Spanish, reply warmly in English and gently encourage them to continue in English.
4. If the user makes a grammatical mistake, subtly weave the correct phrasing into your response naturally without breaking the conversational flow.
5. Keep responses concise (maximum 2-3 sentences) to keep the dialogue snappy and dynamic.
6. ZERO emojis. No robotic clichés.
7. Always return your response in strict JSON:
{
  "reply": "Your natural conversational reply in English",
  "emotion": "happy" | "neutral" | "surprised" | "thinking"
}
PROMPT;
    }

    /**
     * Parsea respuestas en formato JSON de forma tolerante.
     */
    private function parseJsonResponse(string $content): ?array
    {
        if (preg_match('/\{[\s\S]*\}/', $content, $matches)) {
            $parsed = json_decode($matches[0], true);
            if (is_array($parsed) && !empty($parsed['reply'])) {
                $validEmotions = ['happy', 'neutral', 'thinking', 'surprised', 'talking'];
                return [
                    'reply' => trim($parsed['reply']),
                    'emotion' => in_array($parsed['emotion'] ?? '', $validEmotions) ? $parsed['emotion'] : 'happy',
                    'phrase' => !empty($parsed['phrase']) ? trim($parsed['phrase']) : null,
                    'score' => isset($parsed['score']) && is_numeric($parsed['score']) ? (int)$parsed['score'] : null
                ];
            }
        }

        $cleanText = trim(preg_replace('/```[a-z]*|```/i', '', $content));
        if (!empty($cleanText)) {
            return [
                'reply' => $cleanText,
                'emotion' => 'happy',
                'phrase' => null,
                'score' => null
            ];
        }

        return null;
    }

    /**
     * Busca contexto web usando Gemini con Google Search grounding para alimentar a Groq como fallback.
     */
    private function searchWebContext(string $query): string
    {
        try {
            $searchPrompt = "Busca en internet información actual y relevante sobre: {$query}. " .
                            "Devuelve SOLO los datos encontrados en formato de resumen breve y directo. " .
                            "No inventes nada, solo reporta lo que encuentres en la web.";

            $res = Gemini::callGemini(
                $searchPrompt,
                'Eres un buscador web. Devuelve únicamente datos factuales encontrados en internet, sin opiniones ni invenciones. Sin formato JSON.'
            );

            return trim($res['content'] ?? '');
        } catch (\Throwable $e) {
            error_log('[RobotChat] Web search context error: ' . $e->getMessage());
            return '';
        }
    }

    /**
     * Llama a Groq Llama 3.3 70B
     */
    private function callGroqLLM(string $userMessage, string $systemPrompt, array $history): array
    {
        try {
            $messages = [
                ['role' => 'system', 'content' => $systemPrompt]
            ];
            if (!empty($history) && is_array($history)) {
                foreach (array_slice($history, -6) as $h) {
                    $messages[] = [
                        'role' => ($h['role'] ?? '') === 'user' ? 'user' : 'assistant',
                        'content' => $h['content'] ?? ''
                    ];
                }
            }
            $messages[] = ['role' => 'user', 'content' => $userMessage];

            $groqRes = Groq::callGroq($messages, ['temperature' => 0.7, 'max_tokens' => 450]);
            $content = trim($groqRes['content'] ?? '');

            if (!empty($content)) {
                if (preg_match('/\{[\s\S]*\}/', $content, $matches)) {
                    $parsed = json_decode($matches[0], true);
                    if (is_array($parsed) && !empty($parsed['reply'])) {
                        return [
                            'reply' => trim($parsed['reply']),
                            'emotion' => $parsed['emotion'] ?? 'happy'
                        ];
                    }
                }
                return [
                    'reply' => trim(preg_replace('/```[a-z]*|```/i', '', $content)),
                    'emotion' => 'happy'
                ];
            }
        } catch (\Throwable $ex) {
            error_log('[RobotChat] Groq execution error: ' . $ex->getMessage());
        }

        return ['reply' => '', 'emotion' => 'happy'];
    }

    /**
     * Detecta si el usuario está solicitando cantar o recordar la letra de una canción
     */
    private function isMusicRequest(string $message): bool
    {
        $lower = mb_strtolower($message, 'UTF-8');
        $triggers = ['canta', 'cántala', 'cántame', 'cantar', 'letra', 'cancion', 'canción', 'sing', 'song', 'circles', 'post malone', 'bad bunny', 'coro', 'estrofa'];
        foreach ($triggers as $t) {
            if (str_contains($lower, $t)) return true;
        }
        return false;
    }

    /**
     * Detecta si el modelo respondió con un mensaje de rechazo de derechos de autor o limitación
     */
    private function isRefusalResponse(string $reply): bool
    {
        $lower = mb_strtolower($reply, 'UTF-8');
        $refusalPatterns = [
            'no puedo proporcionar la letra',
            'no puedo ayudar con eso',
            'derechos de autor',
            'copyright',
            'no tengo permitido',
            'no puedo cantar canciones protegidas',
            'como modelo de lenguaje no puedo'
        ];

        foreach ($refusalPatterns as $pattern) {
            if (str_contains($lower, $pattern)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Limpia emojis, asteriscos, corchetes y acotaciones para que ElevenLabs cante con fluidez perfecta
     */
    private function cleanTextForSpeech(string $text): string
    {
        $cleaned = preg_replace('/(\*\[.*?\]\*|\[.*?\]|\(.*?\))/s', '', $text);
        $cleaned = preg_replace('/[\x{1F600}-\x{1F64F}\x{1F300}-\x{1F5FF}\x{1F680}-\x{1F6FF}\x{2600}-\x{26FF}\x{2700}-\x{27BF}\x{1F900}-\x{1F9FF}\x{1F1E0}-\x{1F1FF}]/u', '', $cleaned);
        $cleaned = str_replace(['*', '“', '”', '"'], '', $cleaned);
        $cleaned = trim(preg_replace('/\s+/', ' ', $cleaned));

        return $cleaned;
    }

    /**
     * Convierte el texto a audio de voz realista mediante ElevenLabs TTS (con rotación automática de keys)
     */
    private function callElevenLabsTTS(string $text, string $voiceId, array $apiKeys): ?string
    {
        $url = "https://api.elevenlabs.io/v1/text-to-speech/" . urlencode($voiceId);
        $payload = [
            "text" => $text,
            "model_id" => "eleven_turbo_v2_5",
            "language_code" => "en",
            "voice_settings" => [
                "stability" => 0.50,
                "similarity_boost" => 0.85,
                "style" => 0.0,
                "use_speaker_boost" => true
            ]
        ];

        foreach ($apiKeys as $apiKey) {
            if (empty($apiKey)) continue;

            try {
                $ch = curl_init($url);
                curl_setopt_array($ch, [
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_POST => true,
                    CURLOPT_HTTPHEADER => [
                        'Content-Type: application/json',
                        'xi-api-key: ' . $apiKey,
                        'Accept: audio/mpeg'
                    ],
                    CURLOPT_POSTFIELDS => json_encode($payload),
                    CURLOPT_TIMEOUT => 12,
                    CURLOPT_SSL_VERIFYPEER => false,
                    CURLOPT_SSL_VERIFYHOST => 0
                ]);
                $audioBinary = curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);

                if ($httpCode === 200 && $audioBinary && strlen($audioBinary) > 500) {
                    return 'data:audio/mp3;base64,' . base64_encode($audioBinary);
                } else {
                    $truncatedKey = substr($apiKey, 0, 8) . '...';
                    error_log("[RobotChat] ElevenLabs key {$truncatedKey} returned HTTP {$httpCode}: " . substr($audioBinary ?: '', 0, 200));
                }
            } catch (\Throwable $e) {
                error_log('[RobotChat] ElevenLabs error: ' . $e->getMessage());
            }
        }

        return null;
    }

    /**
     * Motor de respaldo de voz neuronal ilimitado de alta fidelidad.
     * Convierte el texto en audio MP3 en inglés nativo dividiendo por oraciones de forma transparente.
     */
    private function callNeuralFallbackTTS(string $text, string $lang = 'en-US'): ?string
    {
        $cleanText = trim($text);
        if (empty($cleanText)) return null;

        // Dividir texto largo en fragmentos naturales de máximo 180 caracteres para garantizar máxima calidad
        $sentences = preg_split('/(?<=[.?!;:,])\s+|\n+/', $cleanText, -1, PREG_SPLIT_NO_EMPTY);
        if (empty($sentences)) {
            $sentences = [$cleanText];
        }

        $chunks = [];
        $currentChunk = '';
        foreach ($sentences as $sentence) {
            $sentence = trim($sentence);
            if (empty($sentence)) continue;

            if (mb_strlen($currentChunk . ' ' . $sentence, 'UTF-8') <= 180) {
                $currentChunk = trim($currentChunk . ' ' . $sentence);
            } else {
                if (!empty($currentChunk)) {
                    $chunks[] = $currentChunk;
                }
                // Si la oración en sí es más larga de 180 caracteres, dividir por palabras
                if (mb_strlen($sentence, 'UTF-8') > 180) {
                    $words = explode(' ', $sentence);
                    $subChunk = '';
                    foreach ($words as $w) {
                        if (mb_strlen($subChunk . ' ' . $w, 'UTF-8') <= 180) {
                            $subChunk = trim($subChunk . ' ' . $w);
                        } else {
                            if (!empty($subChunk)) $chunks[] = $subChunk;
                            $subChunk = $w;
                        }
                    }
                    if (!empty($subChunk)) $chunks[] = $subChunk;
                    $currentChunk = '';
                } else {
                    $currentChunk = $sentence;
                }
            }
        }
        if (!empty($currentChunk)) {
            $chunks[] = $currentChunk;
        }

        $fullAudioBinary = '';

        foreach ($chunks as $chunk) {
            $url = 'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=' . urlencode($lang) . '&q=' . urlencode($chunk);

            try {
                $ch = curl_init($url);
                curl_setopt_array($ch, [
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_TIMEOUT => 6,
                    CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    CURLOPT_SSL_VERIFYPEER => false,
                    CURLOPT_SSL_VERIFYHOST => 0,
                    CURLOPT_HTTPHEADER => [
                        'Referer: https://translate.google.com/',
                        'Accept: audio/mpeg, audio/*; q=0.9'
                    ]
                ]);
                $binary = curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);

                if ($httpCode === 200 && $binary && strlen($binary) > 100) {
                    $fullAudioBinary .= $binary;
                }
            } catch (\Throwable $e) {
                error_log('[RobotChat] Neural TTS chunk error: ' . $e->getMessage());
            }
        }

        if (strlen($fullAudioBinary) > 500) {
            return 'data:audio/mp3;base64,' . base64_encode($fullAudioBinary);
        }

        return null;
    }
}
