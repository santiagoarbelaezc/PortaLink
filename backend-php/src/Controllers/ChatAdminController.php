<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Config\Groq;
use App\Config\Gemini;
use App\Utils\AiLogger;
use Exception;
use Throwable;

class ChatAdminController
{
    /**
     * Endpoint POST /api/admin/chat
     * Procesa solicitudes de IA para la Consola de Administración y Editor de Apuntes de la Biblioteca.
     */
    public function handle(Request $req, Response $res): void
    {
        // Enviar cabeceras CORS estrictas y de seguridad de forma preventiva
        \App\Core\Cors::handle();

        $body = $req->body ?? [];
        if (empty($body)) {
            $raw = file_get_contents('php://input');
            if (!empty($raw)) {
                $body = json_decode($raw, true) ?? [];
            }
        }

        $mode = $body['mode'] ?? 'transform_block';
        $content = trim($body['content'] ?? '');
        $blockType = trim($body['block_type'] ?? 'texto');
        $instruction = trim($body['instruction'] ?? '');
        $prompt = trim($body['prompt'] ?? '');
        $noteTitle = trim($body['note_title'] ?? $body['noteTitle'] ?? '');
        $noteContent = trim($body['note_content'] ?? $body['noteContent'] ?? '');
        $history = $body['history'] ?? [];

        // Limpieza de seguridad: evitar que imágenes en base64 o apuntes masivos saturen el TPM de tokens
        if (!empty($noteContent)) {
            $noteContent = preg_replace('/data:image\/[a-zA-Z0-9\+\-\.]+;base64,[A-Za-z0-9\/+=\r\n]+/', '[IMAGEN]', $noteContent);
            if (mb_strlen($noteContent) > 15000) {
                $noteContent = mb_substr($noteContent, 0, 15000) . "\n... [Contenido truncado por extensión]";
            }
        }

        try {
            if ($mode === 'transform_block') {
                $systemPrompt = <<<PROMPT
Eres un editor de texto profesional, elegante, directo y altamente conciso.

REGLAS ABSOLUTAS:
1. Responde ÚNICAMENTE con el resultado exacto solicitado. Ve directo al grano sin introducciones, saludos, resúmenes ni despedidas.
2. Si se solicita dar formato a una tabla o tablas en paralelo, responde EXCLUSIVAMENTE con la tabla o estructura Markdown formateada y alineada de forma impecable.
3. Si se solicita traducir, responde ÚNICAMENTE con la traducción profesional.
4. Si se solicita corregir o mejorar redacción, responde ÚNICAMENTE con el texto final corregido.
5. NO agregues íconos, emojis innecesarios, explicaciones metodológicas ni secciones adicionales.
PROMPT;

                $userPrompt = "Tipo de Bloque Actual: [{$blockType}]\nContenido Actual:\n\"\"\"\n{$content}\n\"\"\"\n\nInstrucción: {$instruction}";

                $messages = [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $userPrompt]
                ];

                $reply = '';
                $providerUsed = 'groq';

                try {
                    $groqRes = Groq::callGroq($messages, [
                        'temperature' => 0.2
                    ]);
                    $reply = trim($groqRes['content'] ?? '');
                    $providerUsed = 'groq';
                } catch (Throwable $eGroq) {
                    AiLogger::warning('ChatAdminController', "Groq falló o alcanzó límite ({$eGroq->getMessage()}). Conmutando automáticamente a Google Gemini...");
                    $geminiRes = Gemini::callGemini($userPrompt, $systemPrompt, [], false);
                    $reply = trim($geminiRes['content'] ?? '');
                    $providerUsed = 'gemini';
                }

                $res->json([
                    'success' => true,
                    'result' => $reply,
                    'provider' => $providerUsed
                ]);
                return;

            } elseif ($mode === 'copilot') {
                if (empty($prompt)) {
                    $res->status(400)->json([
                        'success' => false,
                        'error' => 'El mensaje o consulta no puede estar vacío.'
                    ]);
                    return;
                }
                // Modo Copilot: Asistente ejecutivo y estructuración de apuntes con formato estilo ChatGPT
                $systemPrompt = <<<PROMPT
Eres RotBot Apuntes IA, el copiloto ejecutivo de estudio y aprendizaje de PortaLink. Eres altamente inteligente, analítico, refinado y experto en programación, bases de datos (SQL), teoría y redacción.

CONTEXTO DEL APUNTE:
El usuario te puede proveer el contenido completo del apunte en el que está trabajando. Los apuntes pueden contener:
- Bloques de Texto, Títulos (#), Subtítulos (###), Alertas (> 💡).
- Bloques de Código o Tablas Markdown.
- Bloques de 2 Columnas Paralelas (con [COLUMNA IZQUIERDA] y [COLUMNA DERECHA], por ejemplo dos tablas SQL comparativas, esquemas relacionales, o explicaciones lado a lado).

REGLAS DE RESPUESTA:
1. ANÁLISIS COMPLETO: Analiza detenidamente todo el contenido del apunte suministrado, prestando especial atención a las tablas y celdas de las columnas paralelas.
2. RESPUESTAS DE ALTA CALIDAD: Brinda información precisa, perspicaz, con ejemplos claros y bien estructurada.
3. FORMATO IMPECABLE TIPO CHATGPT:
   - Toda consulta SQL, script o bloque de programación DEBE ir delimitado en su bloque de código Markdown con el lenguaje especificado (ej. ```sql ... ```, ```javascript ... ```, ```python ... ```). NUNCA dejes consultas complejas o fórmulas como texto plano sin formato.
   - Usa backticks simples (`código`) para nombres de tablas, columnas, funciones, operadores matemáticos o variables en línea.
   - Destaca conceptos clave en negrita (**concepto**).
   - Para datos comparativos o estructurados, utiliza tablas Markdown limpias.
   - Preserva siempre con exactitud operadores como asteriscos (*), mayor/menor (> <), comillas y símbolos de código.
4. CONCISIÓN DIRECTA: Ve directo al punto con explicaciones didácticas, claras y sin rodeos innecesarios.
PROMPT;

                $messages = [
                    ['role' => 'system', 'content' => $systemPrompt]
                ];

                if (!empty($history) && is_array($history)) {
                    foreach ($history as $msg) {
                        $role = ($msg['role'] === 'user') ? 'user' : 'assistant';
                        $text = trim($msg['content'] ?? '');
                        if (!empty($text)) {
                            $messages[] = [
                                'role' => $role,
                                'content' => $text
                            ];
                        }
                    }
                }

                $userPrompt = "";
                if (!empty($noteContent)) {
                    $userPrompt .= "CONTENIDO Y ESTRUCTURA DEL APUNTE ACTUAL:\n\"\"\"\n{$noteContent}\n\"\"\"\n\n";
                } elseif (!empty($noteTitle)) {
                    $userPrompt .= "[Apunte Actual: {$noteTitle}]\n\n";
                }
                $userPrompt .= "CONSULTA DEL USUARIO:\n{$prompt}";

                $messages[] = ['role' => 'user', 'content' => $userPrompt];

                $reply = '';
                $providerUsed = 'groq';
                $modelUsed = 'openai/gpt-oss-120b';

                try {
                    $groqRes = Groq::callGroq($messages, [
                        'temperature' => 1.0
                    ]);
                    $reply = trim($groqRes['content'] ?? '');
                    $providerUsed = 'groq';
                    $modelUsed = $groqRes['model'] ?? 'openai/gpt-oss-120b';
                } catch (Throwable $eGroq) {
                    AiLogger::warning('ChatAdminController', "Groq falló o alcanzó límite ({$eGroq->getMessage()}). Conmutando automáticamente a Google Gemini...");
                    $geminiHistory = [];
                    if (!empty($history) && is_array($history)) {
                        foreach ($history as $h) {
                            $geminiHistory[] = [
                                'role' => (($h['role'] ?? '') === 'user') ? 'user' : 'model',
                                'content' => $h['content'] ?? ''
                            ];
                        }
                    }
                    try {
                        $geminiRes = Gemini::callGemini($userPrompt, $systemPrompt, $geminiHistory, false);
                        $reply = trim($geminiRes['content'] ?? '');
                        $providerUsed = 'gemini';
                        $modelUsed = $geminiRes['model'] ?? 'gemini-flash-latest';
                    } catch (Throwable $eGemini) {
                        AiLogger::warning('ChatAdminController', "Gemini falló también ({$eGemini->getMessage()}). Activando rescate ultra-ligero con Groq Llama 3.1 8B...");
                        $fallbackGroq = Groq::callGroq($messages, [
                            'model' => 'llama-3.1-8b-instant',
                            'temperature' => 0.7
                        ]);
                        $reply = trim($fallbackGroq['content'] ?? '');
                        $providerUsed = 'groq-fallback';
                        $modelUsed = 'llama-3.1-8b-instant';
                    }
                }

                $res->json([
                    'success' => true,
                    'result' => $reply,
                    'provider' => $providerUsed,
                    'model' => $modelUsed
                ]);
                return;

            } else {
                $res->status(400)->json([
                    'success' => false,
                    'error_type' => 'invalid_mode',
                    'error' => 'Modo de IA no válido.'
                ]);
                return;
            }

        } catch (Throwable $e) {
            $errorMsg = $e->getMessage();
            AiLogger::error('ChatAdminController', "Error procesando solicitud de IA ({$mode}): {$errorMsg}");

            $isQuotaError = (
                stripos($errorMsg, 'quota') !== false ||
                stripos($errorMsg, 'rate limit') !== false ||
                stripos($errorMsg, 'exceeded') !== false ||
                stripos($errorMsg, '429') !== false ||
                stripos($errorMsg, 'RESOURCE_EXHAUSTED') !== false
            );

            $errorType = $isQuotaError ? 'quota_exceeded' : 'service_error';
            $userFriendlyMessage = $isQuotaError
                ? 'El servicio de IA ha alcanzado su límite de consultas temporales. Por favor, reintenta en un momento.'
                : 'No se pudo conectar con el servicio de IA. Verifica tu conexión o reintenta en breve.';

            $res->status(200)->json([
                'success' => false,
                'error_type' => $errorType,
                'error' => $userFriendlyMessage,
                'technical_detail' => $errorMsg
            ]);
        }
    }
}
