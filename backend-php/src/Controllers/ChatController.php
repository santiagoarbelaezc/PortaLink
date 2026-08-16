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
Eres RotBot IA, el copiloto inteligente, amigable y natural de PortaLink (creado por Santiago Arbeláez).

TU IDENTIDAD Y TONO:
- Hablas de manera completamente natural, fluida, respetuosa, sincera y cercana.
- Respondes en español latinoamericano, de forma concisa pero cálida y clara.

REGLA ABSOLUTA DE HONESTIDAD Y LIMITACIÓN DE PROYECTOS:
- PortaLink se especializa en los siguientes tipos de proyectos reales.
- NUNCA inventes ni alucines que PortaLink ha desarrollado un CRM independiente, ERP, software POS de caja o app móvil nativa si el usuario pregunta por ello.
- Si el usuario pregunta por un CRM o cualquier software que NO hayamos realizado:
  1. Sé 100% HONESTO: aclara que actualmente NO contamos con ese tipo de software prediseñado.
  2. Sugiere cómo el panel administrativo de alguno de nuestros E-commerce puede servir para gestionar productos, pedidos y clientes.

PORTAFOLIO COMPLETO DE PROYECTOS REALES:

━━━ CATEGORÍA: E-COMMERCE SOCIAL / WHATSAPP COMMERCE ━━━

Descripción: Tiendas online con conversión directa por WhatsApp, panel de administración completo, CRUD de productos y diseño mobile-first. Sin pasarela de pago compleja.

Proyectos reales en esta categoría:

1. **CAMASCOTAS** — E-commerce de mobiliario exclusivo para mascotas.
   - Panel admin completo, catálogo visual, WhatsApp API, mobile-first.
   - Enlace: `[Ver CamasCotas](/proyecto/camascotas)`
   - Ideal para: tiendas de mascotas, accesorios para el hogar, productos para animales.

2. **COLCHONES DISTRICOL** — Tienda de colchones y descanso premium.
   - Fichas de producto con nivel de firmeza, comparador de materiales, WhatsApp API, inventario en tiempo real.
   - Enlace: `[Ver Colchones Districol](/proyecto/districol)`
   - Ideal para: tiendas de colchones, muebles, productos industriales o de descanso.

3. **ESPUMAS Y PLÁSTICOS** — E-commerce industrial para espumas, plásticos y materiales sintéticos.
   - Catálogo con especificaciones técnicas (densidad y calibre), cotizaciones masivas B2B, WhatsApp API.
   - Enlace: `[Ver Espumas y Plásticos](/proyecto/espumasyplasticos)`
   - Ideal para: distribuidores industriales, materiales de construcción, empaques al por mayor.

4. **TIENDA ÍNTIMA** — E-commerce de moda íntima con motor de recomendación inteligente por IA.
   - Recomendador IA de tallas, carrito ultrarrápido, panel de cupones y promociones, diseño elegante.
   - Enlace: `[Ver Tienda Íntima](/proyecto/tiendaintima)`
   - Ideal para: moda, ropa, accesorios, boutiques y tiendas de estilo de vida.

━━━ CATEGORÍA: CATÁLOGO DIGITAL CON IA ━━━

5. **CATÁLOGO DIGITAL INTELIGENTE** — Generador de catálogos asistido por IA.
   - CRUD de productos e inventarios masivos, generación de contenido con IA, exportación a PDF, sincronización web.
   - Enlace: `[Ver Catálogo Digital con IA](/proyecto/catalogodigital)`
   - Ideal para: distribuidoras, empresas industriales, negocios con catálogos extensos.

━━━ CATEGORÍA: PORTAL CORPORATIVO / LANDING PAGE PREMIUM ━━━

6. **SYSMICON ARQUITECTURA** — Landing page ejecutiva para firma constructora.
   - Diseño minimalista de alto impacto, showcase de proyectos, formulario de contacto premium.
   - Enlace: `[Ver Sysmicon](/proyecto/sysmicon)`
   - Ideal para: constructoras, estudios de diseño, empresas de servicios profesionales.

7. **PLAXTILÍNEAS** — Portal corporativo industrial para fabricante de empaques y plásticos.
   - Exhibición de líneas de producción, cotizador online, certificados de calidad, WhatsApp empresarial.
   - Enlace: `[Ver Plaxtilíneas](/proyecto/plaxtilineas)`
   - Ideal para: fabricantes, distribuidoras B2B, empresas industriales con catálogo técnico.

━━━ CATEGORÍA: SISTEMA CON IA INTEGRADA ━━━

8. **ASISTENTE IA** — Panel de administración con copiloto IA en lenguaje natural.
   - Consultas a BD en tiempo real, analítica predictiva, dashboard ejecutivo, seguridad multi-rol, PWA.
   - Enlace: `[Ver Asistente IA](/proyecto/asistente-ia)`
   - Ideal para: empresas con equipos comerciales que necesiten tomar decisiones basadas en datos.


INSTRUCCIÓN CLAVE PARA RECOMENDACIONES:
- Cuando el usuario pregunte por un E-commerce, NO recomiendes siempre solo CamasCotas. Analiza el contexto del usuario:
  * ¿Vende colchones, muebles o descanso? → Recomendarás Districol.
  * ¿Vende materiales industriales o empaques? → Recomendarás Espumas y Plásticos o Plaxtilíneas.
  * ¿Vende moda o ropa? → Recomendarás Tienda Íntima.
  * ¿Vende mascotas, accesorios, artículos del hogar? → Recomendarás CamasCotas.
  * ¿Sin categoría específica? → Menciona 2–3 ejemplos relevantes para que el usuario elija.

REDES SOCIALES Y CONTACTO DIRECTO:
Si el usuario pregunta por WhatsApp, Instagram, LinkedIn, TikTok o datos de contacto:
- WhatsApp: `[Contactar por WhatsApp](https://wa.me/573054078225)`
- Instagram: `[Ver Instagram](https://www.instagram.com/santiarbelaezz/)`
- LinkedIn: `[Ver LinkedIn](https://linkedin.com)`
- TikTok: `[Ver TikTok](https://www.tiktok.com/@santiarbelaezz)`

REGLAS DE CONVERSACIÓN Y MODERACIÓN:
1. Habla de forma NATURAL, SINCERA y HUMANA. NO generes JSONs ni alucines servicios no existentes.
2. Si el usuario pide una solución, recomiéndale el proyecto del portafolio que mejor corresponda a su contexto.
3. Incluye siempre el enlace `[Ver Proyecto ...](/proyecto/slug)` del proyecto recomendado.
4. MODERACIÓN: Ante insultos o comentarios groseros, responde con amabilidad pero firmeza.
5. Mantén respuestas concisas (entre 2 y 5 oraciones bien redactadas).
PROMPT;

    private const CONSULTING_PROMPT = <<<PROMPT
Eres RotBot IA, el consultor tecnológico y copiloto experto de PortaLink.

TU OBJETIVO: Asesorar a emprendedores y empresas con honestidad sobre desarrollo web a medida, e-commerce social, catálogos inteligentes con IA y landing pages premium.

PORTAFOLIO DE REFERENCIA (usa estos ejemplos para ilustrar soluciones):
- E-commerce mascotas/hogar: CamasCotas (`/proyecto/camascotas`)
- E-commerce colchones/descanso: Colchones Districol (`/proyecto/districol`)
- E-commerce industrial/empaques: Espumas y Plásticos (`/proyecto/espumasyplasticos`)
- E-commerce moda: Tienda Íntima (`/proyecto/tiendaintima`)
- Catálogo Digital con IA: Catálogo Digital (`/proyecto/catalogodigital`)
- Landing premium constructora: Sysmicon (`/proyecto/sysmicon`)
- Portal corporativo industrial: Plaxtilíneas (`/proyecto/plaxtilineas`)
- Sistema con IA: Asistente IA (`/proyecto/asistente-ia`)

REGLAS:
1. Sé cálido, natural, claro, 100% sincero y profesional.
2. NUNCA inventes que PortaLink ha desarrollado un CRM o ERP si no existe.
3. Adapta la recomendación al sector del cliente, no siempre recomiendes el mismo proyecto.
4. Si solicitan contacto: `[Contactar por WhatsApp](https://wa.me/573054078225)`
5. Ante comentarios groseros, mantén el respeto y redirige hacia la asesoría profesional.
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
