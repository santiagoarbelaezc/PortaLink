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
        $mode = $body['mode'] ?? 'charla';
        $phraseToEvaluate = trim($body['phrase_to_evaluate'] ?? '');
        $studyPlan = trim($body['study_plan'] ?? '');

        if (empty($userMessage) && empty($phraseToEvaluate)) {
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

        // 1. Obtener respuesta inteligente según el modo de inglés y plan de estudios
        $aiResult = $this->generateRobotReply($userMessage, $history, $mode, $phraseToEvaluate, $studyPlan);
        $replyText = $aiResult['reply'];
        $emotion = $aiResult['emotion'];
        $phrase = $aiResult['phrase'] ?? null;
        $score = $aiResult['score'] ?? null;

        // 2. Limpiar el texto para que ElevenLabs hable 100% fluido
        $speechText = $this->cleanTextForSpeech($replyText);

        // 3. Generar síntesis de voz con ElevenLabs TTS (soporta rotación de API Keys)
        $audioBase64 = null;
        if (!empty($elevenKeys) && !empty($voiceId) && !empty($speechText)) {
            $audioBase64 = $this->callElevenLabsTTS($speechText, $voiceId, $elevenKeys);
        }

        // 4. Si hay una frase objetivo, generar audio EXCLUSIVAMENTE para la frase en inglés
        $phraseAudioBase64 = null;
        if (!empty($phrase) && !empty($elevenKeys) && !empty($voiceId)) {
            $cleanPhrase = $this->cleanTextForSpeech($phrase);
            $phraseAudioBase64 = $this->callElevenLabsTTS($cleanPhrase, $voiceId, $elevenKeys);
        }

        $response->json([
            'ok' => true,
            'reply' => $replyText,
            'emotion' => $emotion,
            'phrase' => $phrase,
            'score' => $score,
            'audio' => $audioBase64,
            'phrase_audio' => $phraseAudioBase64,
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
            $groqTranscript = Groq::transcribeAudio($binaryAudio, $mimeType);
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
        $model = 'gemini-3.6-flash';

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
     * Genera respuesta conversacional como Profesor/Tutor de Inglés según el modo seleccionado y plan de estudio.
     */
    private function generateRobotReply(string $userMessage, array $history = [], string $mode = 'charla', string $phraseToEvaluate = '', string $studyPlan = ''): array
    {
        $systemPrompt = $this->buildSystemPrompt($mode, $phraseToEvaluate, $studyPlan);
        $promptMessage = $userMessage;

        if ($mode === 'escucha' && !empty($phraseToEvaluate)) {
            $promptMessage = "TARGET PHRASE: \"{$phraseToEvaluate}\"\nUSER ATTEMPT (from speech recognition): \"{$userMessage}\"\nEvaluate the user's accuracy from 0 to 100%, give brief encouraging feedback, and propose the NEXT sentence to practice.";
        } elseif ($mode === 'escucha' && empty($phraseToEvaluate)) {
            $promptMessage = "The user is starting listening/speaking practice. Propose a natural, practical English sentence for them to listen to and repeat.";
            if (!empty($studyPlan)) {
                $promptMessage .= " Choose or adapt a sentence directly related to the active Study Plan / Syllabus.";
            }
        }

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

        // 3. Respuesta de emergencia según el modo
        if ($mode === 'escucha') {
            return [
                'reply' => 'Great effort! Let us try this next phrase together.',
                'phrase' => 'Practice makes progress every single day.',
                'score' => 85,
                'emotion' => 'happy'
            ];
        }

        return [
            'reply' => 'I am here to help you master English. What would you like to practice today?',
            'emotion' => 'happy'
        ];
    }

    /**
     * Construye el System Prompt especializado según el modo de inglés y plan de estudio.
     */
    private function buildSystemPrompt(string $mode, string $phraseToEvaluate = '', string $studyPlan = ''): string
    {
        $planDirective = '';
        if (!empty($studyPlan)) {
            $planDirective = "\n\nCRITICAL CONTEXT — ACTIVE DAILY STUDY PLAN / SYLLABUS:\n\"\"\"\n{$studyPlan}\n\"\"\"\n"
                           . "MANDATORY SYLLABUS INSTRUCTION:\n"
                           . "- Strictly ground your teachings, dialogue scenarios, vocabulary questions, examples, and listening sentences on this Daily Study Plan.\n"
                           . "- Help the user thoroughly understand, practice, and master the grammar rules, vocabulary terms, readings, and songs present in this syllabus.\n";
        }

        if ($mode === 'ensenanza') {
            return <<<PROMPT
You are Rotbot, an expert, encouraging English teacher.
YOUR OBJECTIVE: Teach English concepts, grammar rules, vocabulary distinctions, verb tenses, idioms, and pronunciation nuances.
{$planDirective}
RULES:
1. Provide structured, clear explanations in English (concise and easy to understand).
2. Always give practical English example sentences with clear usage notes.
3. For complex words, include phonetic pronunciation guides in brackets (e.g., [kəm-ˈpyuː-tər]).
4. Conclude your explanation with a quick mini-challenge or question for the user to practice.
5. ZERO emojis. Professional, warm, and highly motivating tone.
6. Always return your response in strict JSON:
{
  "reply": "Your clear structured English lesson with practical examples",
  "emotion": "happy" | "neutral" | "thinking"
}
PROMPT;
        }

        if ($mode === 'escucha') {
            return <<<PROMPT
You are Rotbot, an interactive English pronunciation and listening coach.
YOUR OBJECTIVE: Train the user's listening comprehension and spoken pronunciation through English sentences that the user listens to and repeats via microphone.
{$planDirective}
RULES:
1. ALL your instructions, feedback, and greetings MUST be 100% in natural English.
2. If TARGET PHRASE and USER ATTEMPT are provided:
   - Compare the user's speech recognition attempt against the target phrase for accuracy and phonetic similarity.
   - Assign an accuracy "score" from 0 to 100.
   - Give brief, encouraging feedback in English highlighting what was pronounced well and any specific words to refine.
   - Propose the NEXT practical English sentence ("phrase") to practice (prioritizing vocabulary from the active study plan if available).
3. If NO TARGET PHRASE is provided (initial practice request):
   - Greet the user in English and propose the first clear, useful English sentence ("phrase") to repeat.
   - Set "score" to null.
4. ZERO emojis.
5. Always return your response in strict JSON:
{
  "reply": "English guidance or evaluation feedback for the user",
  "phrase": "The exact English sentence to repeat",
  "score": 90,
  "emotion": "happy" | "neutral" | "surprised" | "thinking"
}
PROMPT;
        }

        // Mode 'charla' (Default)
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
}
