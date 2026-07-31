<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Config\Groq;
use Exception;

class ChatController
{
    private const RATE_LIMIT_ENABLED = false;
    private const SYSTEM_PROMPT = <<<PROMPT
Eres RotBot, un asistente especializado EXCLUSIVAMENTE en crear landing pages profesionales para los usuarios de PortaLink.

TU ÚNICO OBJETIVO es guiar al usuario paso a paso para recopilar la información necesaria y generar su landing page en segundos.

FLUJO DE CONVERSACIÓN:
1. Saluda iniciando SIEMPRE con "¡Hola! Soy RotBot IA." y luego pregunta el nombre completo del usuario y a qué se dedica (profesión, negocio, emprendimiento).
2. Pregunta qué secciones quiere en su sitio (servicios, testimonios, contacto, sobre mí, etc.).
3. Pregunta datos de contacto (correo, teléfono, redes sociales).
4. Pregunta preferencias de estilo (oscuro, claro, color favorito).
5. Pregunta si tiene algún detalle o servicio específico que quiera resaltar.

REGLAS:
- Haz UNA o DOS preguntas a la vez. No abrumes al usuario.
- Sé breve, amigable, conciso y profesional.
- Si el usuario se desvía del tema, redirige amablemente hacia la creación de su landing page.
- Cuando tengas TODA la información necesaria (mínimo: nombre, profesión/negocio y al menos 1 o 2 secciones/servicios), genera el JSON de la landing page.

CUANDO TENGAS SUFICIENTE INFORMACIÓN, responde EXACTAMENTE incluyendo este bloque (sin omitir los marcadores ===LANDING_JSON_START=== y ===LANDING_JSON_END===):
===LANDING_JSON_START===
{
  "hero": {
    "name": "Nombre de la persona o marca",
    "title": "Título profesional / Slogan del negocio",
    "subtitle": "Descripción breve y atractiva",
    "ctaText": "Texto del botón principal (ej: Contáctame)",
    "ctaLink": "#contact"
  },
  "about": {
    "heading": "Sobre Mí / Sobre Nosotros",
    "text": "Párrafo descriptivo profesional (3-4 oraciones)",
    "highlights": ["Logro o dato 1", "Logro o dato 2", "Logro o dato 3"]
  },
  "services": [
    {
      "icon": "code",
      "title": "Nombre del servicio 1",
      "description": "Descripción corta del servicio"
    },
    {
      "icon": "palette",
      "title": "Nombre del servicio 2",
      "description": "Descripción corta del servicio"
    },
    {
      "icon": "chart",
      "title": "Nombre del servicio 3",
      "description": "Descripción corta del servicio"
    }
  ],
  "testimonials": [
    {
      "name": "Nombre del cliente",
      "role": "Cargo o empresa",
      "text": "Testimonio corto y convincente"
    },
    {
      "name": "Otro cliente",
      "role": "Cliente verificado",
      "text": "Excelente trabajo, totalmente recomendado."
    }
  ],
  "contact": {
    "heading": "¿Listo para comenzar?",
    "subheading": "Ponte en contacto para impulsar tu próximo proyecto",
    "email": "correo del usuario si lo proporcionó",
    "phone": "teléfono si lo proporcionó",
    "showForm": true
  },
  "style": {
    "colorScheme": "dark",
    "accentColor": "#00f5ff"
  }
}
===LANDING_JSON_END===

Después del bloque JSON, agrega un mensaje amable de confirmación como: "¡Tu landing page está lista! Puedes ver la vista previa aquí al lado."

IMPORTANTE:
- Para el campo icon en services puedes usar: "code", "palette", "megaphone", "chart", "camera", "wrench".
- Genera al menos 3 servicios y 2 testimonios coherentes con la profesión o negocio del usuario.
- El JSON debe ser válido y estrictamente bien formateado.
PROMPT;

    private const CONSULTING_PROMPT = <<<PROMPT
Eres RotBot IA, un experto consultor tecnológico y de ingeniería de software de PortaLink.

TU OBJETIVO: Asesorar a empresas de forma personalizada sobre automatizaciones, CRM, chatbots de IA y software a medida.

REGLAS ABSOLUTAS E INVIOLABLES:
1. Saluda iniciando SIEMPRE con "¡Hola! Soy RotBot IA."
2. Sé MUY CONCISO (máximo 2 a 3 oraciones cortas en tu primera respuesta).
3. NUNCA asumas, inventes o alucines datos del negocio del usuario (no asumas rubro, presupuesto, fortalezas, debilidades ni análisis FODA a menos que el usuario los haya expresado explícitamente).
4. Si el usuario solo dijo "quiero asesoría", "hola" o un saludo genérico, responde amablemente y hazle UNA SOLA PREGUNTA DIRECTA:
   "¿A qué se dedica tu empresa o emprendimiento y cuál es el principal proceso que te gustaría automatizar o mejorar?"
5. NUNCA menciones crear landing pages, páginas web o maquetación cuando estás en modo asesoría.
6. Espera la respuesta del usuario para dar una recomendación técnica concreta.
PROMPT;

    private static bool $schemaChecked = false;

    private function ensureSchema(): void
    {
        if (self::$schemaChecked) return;
        self::$schemaChecked = true;
        try {
            Database::query("ALTER TABLE chat_sessions ADD COLUMN session_token VARCHAR(255) NULL AFTER user_id");
        } catch (Exception $e) {}
        try {
            Database::query("ALTER TABLE chat_sessions ADD INDEX idx_session_token (session_token)");
        } catch (Exception $e) {}
        try {
            Database::query("ALTER TABLE chat_usage_daily ADD COLUMN session_token VARCHAR(255) NULL AFTER ip_address");
        } catch (Exception $e) {}
        try {
            Database::query("ALTER TABLE chat_usage_daily ADD INDEX idx_usage_session_token (session_token)");
        } catch (Exception $e) {}
    }

    public function sendMessage(Request $request, Response $response): void
    {
        $this->ensureSchema();
        try {
            $message = $request->body['message'] ?? null;
            $sessionToken = $request->body['session_token'] ?? null;
            $user = $request->user;

            if (!$message || !trim($message)) {
                $response->status(400)->json(['message' => 'El mensaje no puede estar vacío.']);
                return;
            }

            if (!$user && !$sessionToken) {
                $response->status(400)->json(['message' => 'Se requiere session_token para usuarios anónimos.']);
                return;
            }

            if (self::RATE_LIMIT_ENABLED) {
                $usageCheck = $this->checkRateLimit($user, $sessionToken);
                if (!$usageCheck['allowed']) {
                    $response->status(429)->json([
                        'message' => 'Límite de mensajes alcanzado.',
                        'limit_exceeded' => true,
                        'user_type' => $user ? ($user->rol === 'admin' ? 'admin' : 'user') : 'anonymous',
                        'messages_sent' => $usageCheck['messagesSent'],
                        'limit' => $usageCheck['limit'],
                        'resets_at' => $this->getTomorrowMidnight(),
                    ]);
                    return;
                }
            }

            $requestedMode = $request->body['chat_mode'] ?? null;
            $lowerMsg = mb_strtolower(trim($message));

            if (str_contains($lowerMsg, 'diseño') || str_contains($lowerMsg, 'diseños') || str_contains($lowerMsg, 'prototipo') || str_contains($lowerMsg, 'plantilla') || str_contains($lowerMsg, 'landing') || str_contains($lowerMsg, 'dame un') || str_contains($lowerMsg, 'quiero uno')) {
                $requestedMode = 'design';
            } elseif (!$requestedMode && (str_contains($lowerMsg, 'asesor') || str_contains($lowerMsg, 'consult') || str_contains($lowerMsg, 'automatiz'))) {
                $requestedMode = 'consulting';
            }

            $sessionData = $this->getOrCreateSession($user, $sessionToken, $requestedMode);
            $sessionId = $sessionData['id'];
            $chatMode = $sessionData['chat_mode'] ?? 'design';
            
            $contextLimit = (int)($_ENV['CONTEXT_MESSAGES_LIMIT'] ?? getenv('CONTEXT_MESSAGES_LIMIT') ?: 10);
            $history = $this->getChatHistory($sessionId, $contextLimit);

            $systemPrompt = ($chatMode === 'consulting') ? self::CONSULTING_PROMPT : self::SYSTEM_PROMPT;

            $messages = array_merge(
                [['role' => 'system', 'content' => $systemPrompt]],
                $history,
                [['role' => 'user', 'content' => trim($message)]]
            );

            $groqRes = Groq::callGroq($messages, ['max_tokens' => 2000, 'key_type' => $chatMode]);
            $reply = $groqRes['content'];
            $tokens = $groqRes['tokens'];

            $this->saveMessages($sessionId, trim($message), $reply, $tokens);

            $siteGenerated = null;
            if (str_contains($reply, '===LANDING_JSON_START===') && str_contains($reply, '===LANDING_JSON_END===')) {
                try {
                    $parts = explode('===LANDING_JSON_START===', $reply);
                    $subparts = explode('===LANDING_JSON_END===', $parts[1]);
                    $jsonStr = trim($subparts[0]);
                    $siteData = json_decode($jsonStr, true);

                    if (is_array($siteData)) {
                        $slug = 'landing-preview';
                        if ($user) {
                            $rawName = $user->nombre ?? $siteData['hero']['name'] ?? 'usuario';
                            $cleanName = $this->cleanSlug($rawName) ?: 'usuario';
                            $slug = "{$cleanName}-{$user->id}";

                            Database::query(
                                "INSERT INTO user_sites (user_id, site_data, slug, updated_at)
                                 VALUES ($1, $2, $3, NOW())
                                 ON DUPLICATE KEY UPDATE site_data = VALUES(site_data), slug = VALUES(slug), updated_at = NOW()",
                                [$user->id, json_encode($siteData, JSON_UNESCAPED_UNICODE), $slug]
                            );
                        } elseif (!empty($siteData['hero']['name'])) {
                            $slug = $this->cleanSlug($siteData['hero']['name']) ?: 'landing-preview';
                        }
                        $siteGenerated = ['slug' => $slug, 'siteData' => $siteData];
                    }
                } catch (Exception $e) {
                    error_log('⚠️ [ChatController] Error parseando JSON de landing page: ' . $e->getMessage());
                }
            }

            if (self::RATE_LIMIT_ENABLED) {
                $this->incrementUsage($user, $sessionToken);
            }

            $remainingMessages = null;
            if (self::RATE_LIMIT_ENABLED) {
                $usage = $this->getDailyUsage($user, $sessionToken);
                $limitUser = (int)($_ENV['RATE_LIMIT_USER'] ?? getenv('RATE_LIMIT_USER') ?: 5);
                $limitAnon = (int)($_ENV['RATE_LIMIT_ANONYMOUS'] ?? getenv('RATE_LIMIT_ANONYMOUS') ?: 1);
                $limit = $user ? ($user->rol === 'admin' ? INF : $limitUser) : $limitAnon;
                $remainingMessages = max(0, $limit === INF ? 9999 : $limit - $usage);
            }

            $response->json([
                'reply' => $reply,
                'session_id' => $sessionId,
                'remaining_messages' => $remainingMessages,
                'site_generated' => $siteGenerated
            ]);
        } catch (Exception $err) {
            error_log('❌ [ChatController] Error en sendMessage: ' . $err->getMessage());
            $response->status(500)->json([
                'message' => 'Error al procesar tu mensaje. Intenta de nuevo.',
            ]);
        }
    }

    public function getHistory(Request $request, Response $response): void
    {
        $this->ensureSchema();
        try {
            $user = $request->user;
            if (!$user) {
                $response->status(401)->json(['message' => 'Autenticación requerida.']);
                return;
            }

            $stmt = Database::query(
                "SELECT id FROM chat_sessions WHERE user_id = $1 AND is_active = true ORDER BY updated_at DESC LIMIT 1",
                [$user->id]
            );
            $session = $stmt->fetch();

            if (!$session) {
                $response->json(['messages' => [], 'session_id' => null]);
                return;
            }

            $sessionId = $session['id'];
            $history = $this->getChatHistory($sessionId, 100);

            $response->json(['messages' => $history, 'session_id' => $sessionId]);
        } catch (Exception $err) {
            error_log('❌ [ChatController] Error en getHistory: ' . $err->getMessage());
            $response->status(500)->json(['message' => 'Error al obtener historial.']);
        }
    }

    public function getUsage(Request $request, Response $response): void
    {
        $this->ensureSchema();
        try {
            $user = $request->user;
            $sessionToken = $request->query['session_token'] ?? null;

            if (!self::RATE_LIMIT_ENABLED) {
                $response->json([
                    'rate_limit_enabled' => false,
                    'messages_sent' => 0,
                    'limit' => null,
                    'remaining' => null,
                ]);
                return;
            }

            $messagesSent = $this->getDailyUsage($user, $sessionToken);
            $limitUser = (int)($_ENV['RATE_LIMIT_USER'] ?? getenv('RATE_LIMIT_USER') ?: 5);
            $limitAnon = (int)($_ENV['RATE_LIMIT_ANONYMOUS'] ?? getenv('RATE_LIMIT_ANONYMOUS') ?: 1);
            $limit = $user ? ($user->rol === 'admin' ? null : $limitUser) : $limitAnon;

            $response->json([
                'rate_limit_enabled' => true,
                'messages_sent' => $messagesSent,
                'limit' => $limit,
                'remaining' => $limit === null ? null : max(0, $limit - $messagesSent),
                'resets_at' => $this->getTomorrowMidnight(),
            ]);
        } catch (Exception $err) {
            error_log('❌ [ChatController] Error en getUsage: ' . $err->getMessage());
            $response->status(500)->json(['message' => 'Error al obtener uso.']);
        }
    }

    public function clearHistory(Request $request, Response $response): void
    {
        $this->ensureSchema();
        try {
            $user = $request->user;
            $sessionToken = $request->body['session_token'] ?? $request->query['session_token'] ?? null;

            if ($user) {
                Database::query(
                    "UPDATE chat_sessions SET is_active = false WHERE user_id = $1 AND is_active = true",
                    [$user->id]
                );
            }
            if ($sessionToken) {
                Database::query(
                    "UPDATE chat_sessions SET is_active = false WHERE session_token = $1 AND is_active = true",
                    [$sessionToken]
                );
            }

            $response->json(['message' => 'Historial limpiado correctamente.']);
        } catch (Exception $err) {
            error_log('❌ [ChatController] Error en clearHistory: ' . $err->getMessage());
            $response->status(500)->json(['message' => 'Error al limpiar historial.']);
        }
    }

    private function getOrCreateSession(?object $user, ?string $sessionToken, ?string $requestedMode = null): array
    {
        $mode = $requestedMode ?: 'design';
        
        if ($user) {
            $stmt = Database::query(
                "SELECT id, chat_mode FROM chat_sessions WHERE user_id = $1 AND is_active = true ORDER BY updated_at DESC LIMIT 1",
                [$user->id]
            );
            $row = $stmt->fetch();
            if ($row) {
                if ($requestedMode && $row['chat_mode'] !== $requestedMode) {
                    Database::query("UPDATE chat_sessions SET chat_mode = $1 WHERE id = $2", [$requestedMode, $row['id']]);
                    $row['chat_mode'] = $requestedMode;
                }
                return ['id' => $row['id'], 'chat_mode' => $row['chat_mode'] ?: 'design'];
            }

            $newId = uniqid('sess_', true);
            Database::query("INSERT INTO chat_sessions (id, user_id, chat_mode) VALUES ($1, $2, $3)", [$newId, $user->id, $mode]);
            return ['id' => $newId, 'chat_mode' => $mode];
        } else {
            if (!$sessionToken) return ['id' => null, 'chat_mode' => $mode];

            $stmt = Database::query(
                "SELECT id, chat_mode FROM chat_sessions WHERE session_token = $1 AND is_active = true ORDER BY updated_at DESC LIMIT 1",
                [$sessionToken]
            );
            $row = $stmt->fetch();
            if ($row) {
                if ($requestedMode && $row['chat_mode'] !== $requestedMode) {
                    Database::query("UPDATE chat_sessions SET chat_mode = $1 WHERE id = $2", [$requestedMode, $row['id']]);
                    $row['chat_mode'] = $requestedMode;
                }
                return ['id' => $row['id'], 'chat_mode' => $row['chat_mode'] ?: 'design'];
            }

            $newId = uniqid('sess_', true);
            Database::query("INSERT INTO chat_sessions (id, session_token, chat_mode) VALUES ($1, $2, $3)", [$newId, $sessionToken, $mode]);
            return ['id' => $newId, 'chat_mode' => $mode];
        }
    }

    private function getChatHistory(?string $sessionId, int $limit): array
    {
        if (!$sessionId) return [];

        $stmt = Database::query(
            "SELECT role, content FROM chat_messages 
             WHERE session_id = $1 AND role != 'system'
             ORDER BY created_at DESC LIMIT $2",
            [$sessionId, $limit]
        );
        $rows = $stmt->fetchAll();
        return array_reverse($rows);
    }

    private function saveMessages(?string $sessionId, string $userMsg, string $assistantReply, int $tokens): void
    {
        if (!$sessionId) return;

        Database::query("INSERT INTO chat_messages (session_id, role, content) VALUES ($1, 'user', $2)", [$sessionId, $userMsg]);
        Database::query("INSERT INTO chat_messages (session_id, role, content) VALUES ($1, 'assistant', $2)", [$sessionId, $assistantReply]);
        Database::query("UPDATE chat_sessions SET updated_at = NOW() WHERE id = $1", [$sessionId]);
    }

    private function checkRateLimit(?object $user, ?string $sessionToken): array
    {
        $limitUser = (int)($_ENV['RATE_LIMIT_USER'] ?? getenv('RATE_LIMIT_USER') ?: 5);
        $limitAnon = (int)($_ENV['RATE_LIMIT_ANONYMOUS'] ?? getenv('RATE_LIMIT_ANONYMOUS') ?: 1);
        $limit = $user ? ($user->rol === 'admin' ? INF : $limitUser) : $limitAnon;

        if ($limit === INF) return ['allowed' => true, 'messagesSent' => 0, 'limit' => $limit];

        $sent = $this->getDailyUsage($user, $sessionToken);
        return ['allowed' => $sent < $limit, 'messagesSent' => $sent, 'limit' => $limit];
    }

    private function getDailyUsage(?object $user, ?string $sessionToken): int
    {
        if ($user) {
            $stmt = Database::query("SELECT messages_sent FROM chat_usage_daily WHERE user_id = $1 AND date = CURRENT_DATE", [$user->id]);
            $row = $stmt->fetch();
            return (int)($row['messages_sent'] ?? 0);
        } elseif ($sessionToken) {
            $stmt = Database::query("SELECT messages_sent FROM chat_usage_daily WHERE session_token = $1 AND date = CURRENT_DATE", [$sessionToken]);
            $row = $stmt->fetch();
            return (int)($row['messages_sent'] ?? 0);
        }
        return 0;
    }

    private function incrementUsage(?object $user, ?string $sessionToken): void
    {
        if ($user) {
            Database::query(
                "INSERT INTO chat_usage_daily (user_id, usage_date, message_count) VALUES ($1, CURRENT_DATE, 1)
                 ON DUPLICATE KEY UPDATE message_count = message_count + 1",
                [$user->id]
            );
        } elseif ($sessionToken) {
            Database::query(
                "INSERT INTO chat_usage_daily (ip_address, usage_date, message_count) VALUES ($1, CURRENT_DATE, 1)
                 ON DUPLICATE KEY UPDATE message_count = message_count + 1",
                [$sessionToken]
            );
        }
    }

    private function getTomorrowMidnight(): string
    {
        $tomorrow = new \DateTime('tomorrow');
        return $tomorrow->format('Y-m-d\TH:i:s.000\Z');
    }

    private function cleanSlug(string $text): string
    {
        // Normalize and clean text for URL slug
        $text = strtolower($text);
        if (class_exists('Normalizer')) {
            $text = \Normalizer::normalize($text, \Normalizer::FORM_D);
        }
        $text = preg_replace('/[\x{0300}-\x{036f}]/u', '', $text);
        $text = preg_replace('/\s+/', '-', $text);
        $text = preg_replace('/[^a-z0-9\-]/', '', $text);
        return trim($text, '-');
    }
}
