<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Config\Groq;
use App\Config\Gemini;
use Exception;

class ChatAdminController
{
    /**
     * Endpoint POST /api/admin/chat
     * Procesa solicitudes de IA para la Consola de Administración y Editor de Apuntes de la Biblioteca.
     */
    public function handle(Request $req, Response $res): void
    {
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
        $noteTitle = trim($body['note_title'] ?? '');
        $history = $body['history'] ?? [];

        try {
            if ($mode === 'transform_block') {
                $systemPrompt = <<<PROMPT
Eres un editor de texto profesional, elegante, directo y altamente conciso.

REGLAS ABSOLUTAS:
1. Responde ÚNICAMENTE con el resultado exacto solicitado. Ve directo al grano sin introducciones, saludos, resúmenes ni despedidas.
2. Si se solicita dar formato a una tabla, responde EXCLUSIVAMENTE con la tabla Markdown formateada y alineada de forma impecable.
3. Si se solicita traducir, responde ÚNICAMENTE con la traducción profesional.
4. Si se solicita corregir o mejorar redacción, responde ÚNICAMENTE con el texto final corregido.
5. NO agregues íconos, emojis innecesarios, explicaciones metodológicas ni secciones adicionales.
PROMPT;

                $userPrompt = "Tipo de Bloque Actual: [{$blockType}]\nContenido Actual:\n\"\"\"\n{$content}\n\"\"\"\n\nInstrucción: {$instruction}";

                $messages = [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $userPrompt]
                ];

                $groqRes = Groq::callGroq($messages, [
                    'temperature' => 0.2,
                    'max_tokens' => 2048
                ]);

                $reply = trim($groqRes['content'] ?? '');

                $res->json([
                    'success' => true,
                    'result' => $reply
                ]);
                return;
            } elseif ($mode === 'copilot') {
                // 🚀 CHAT FLOTANTE ROTBOT: ALIMENTADO EXCLUSIVAMENTE POR GOOGLE GEMINI (gemini-flash-latest)
                $systemPrompt = <<<PROMPT
Eres RotBot Apuntes IA, un copiloto ejecutivo de estudio y aprendizaje altamente inteligente, refinado y natural.

REGLAS DE RESPUESTA:
1. RESPUESTAS DE ALTA CALIDAD: Brinda información precisa, perspicaz y bien estructurada.
2. FORMATO IMPECABLE: Destaca conceptos clave y términos relevantes con negritas (**concepto**). No utilices asteriscos sueltos ni símbolos de formato sin cerrar.
3. CONCISIÓN DIRECTA: Ve directo al punto sin introducciones vacías ni despedidas repetitivas.
4. TONO PROFESIONAL Y MODERNO: Mantén una redacción profesional, elegante, clara y pulida.
PROMPT;

                $userPrompt = $noteTitle ? "[Apunte Actual: {$noteTitle}]\n\nConsulta del Usuario: {$prompt}" : $prompt;

                $geminiRes = Gemini::callGemini($userPrompt, $systemPrompt, $history);

                $reply = trim($geminiRes['content'] ?? '');

                $res->json([
                    'success' => true,
                    'result' => $reply
                ]);
                return;
            } else {
                $res->status(400)->json([
                    'success' => false,
                    'error' => 'Modo de IA no válido.'
                ]);
            }
        } catch (\Throwable $e) {
            error_log("❌ [ChatAdminController] Error procesando solicitud IA: " . $e->getMessage());
            $res->status(200)->json([
                'success' => false,
                'error' => 'Error de la IA: ' . $e->getMessage()
            ]);
        }
    }
}
