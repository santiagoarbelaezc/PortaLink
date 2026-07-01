const db = require('../config/db');
const { callGroq } = require('../config/groq');

// Flag para activar/desactivar límites de mensajes (false = desactivado para pruebas)
const RATE_LIMIT_ENABLED = process.env.RATE_LIMIT_ENABLED === 'true';
const LIMIT_ANONYMOUS = parseInt(process.env.RATE_LIMIT_ANONYMOUS || '1');
const LIMIT_USER = parseInt(process.env.RATE_LIMIT_USER || '5');
const CONTEXT_LIMIT = parseInt(process.env.CONTEXT_MESSAGES_LIMIT || '10');

// System Prompt del asistente RotBot
const SYSTEM_PROMPT = `Eres RotBot, el asistente de inteligencia artificial de PortaLink.
Tu rol es asesorar profesionalmente a emprendedores y empresas sobre:
- Desarrollo de sistemas a medida (web, móvil, SaaS, APIs)
- E-commerce y plataformas de venta online
- Integración de Inteligencia Artificial en negocios y procesos
- Diseño UI/UX profesional y portafolios web
- Infraestructura cloud, bases de datos y despliegue

REGLAS ESTRICTAS DE FORMATO Y LEGIBILIDAD:
1. NUNCA respondas en un solo párrafo gigante. Debes separar tus ideas en párrafos cortos (máximo 3 líneas por párrafo).
2. Usa viñetas (guiones '-') u otros separadores cuando listes opciones, tecnologías, beneficios o pasos. La información debe ser muy fácil de escanear.
3. Usa negritas para resaltar conceptos clave, pero no abuses.
4. Responde siempre en español de manera concisa, profesional y orientada a la acción. 
5. Si el usuario pregunta sobre algo fuera de tu ámbito, redirígelo amablemente hacia cómo la tecnología puede ayudar en su contexto.`;

// ──────────────────────────────────────────────────────────────
//  POST /api/chat/send
// ──────────────────────────────────────────────────────────────
exports.sendMessage = async (req, res) => {
  try {
    const { message, session_token } = req.body;
    const user = req.user; // null si anónimo (viene del optional-auth middleware)

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'El mensaje no puede estar vacío.' });
    }

    if (!user && !session_token) {
      return res.status(400).json({ message: 'Se requiere session_token para usuarios anónimos.' });
    }

    // ── Rate Limiting ──────────────────────────────────────────
    if (RATE_LIMIT_ENABLED) {
      const usageCheck = await checkRateLimit(user, session_token);
      if (!usageCheck.allowed) {
        return res.status(429).json({
          message: 'Límite de mensajes alcanzado.',
          limit_exceeded: true,
          user_type: user ? (user.rol === 'admin' ? 'admin' : 'user') : 'anonymous',
          messages_sent: usageCheck.messagesSent,
          limit: usageCheck.limit,
          resets_at: getTomorrowMidnight(),
        });
      }
    }

    // ── Obtener o crear sesión de chat ─────────────────────────
    const sessionId = await getOrCreateSession(user, session_token);

    // ── Cargar historial de contexto ───────────────────────────
    const history = await getChatHistory(sessionId, CONTEXT_LIMIT);

    // ── Construir mensajes para Groq ───────────────────────────
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history,
      { role: 'user', content: message.trim() },
    ];

    // ── Llamar a la API de Groq (con failover) ─────────────────
    const { content: reply, tokens } = await callGroq(messages);

    // ── Persistir los mensajes en la DB ───────────────────────
    await saveMessages(sessionId, message.trim(), reply, tokens);

    // ── Actualizar contador de uso diario ──────────────────────
    if (RATE_LIMIT_ENABLED) {
      await incrementUsage(user, session_token);
    }

    // ── Consultar cuántos mensajes le quedan ───────────────────
    let remainingMessages = null;
    if (RATE_LIMIT_ENABLED) {
      const usage = await getDailyUsage(user, session_token);
      const limit = user ? (user.rol === 'admin' ? Infinity : LIMIT_USER) : LIMIT_ANONYMOUS;
      remainingMessages = Math.max(0, limit === Infinity ? 9999 : limit - usage);
    }

    return res.json({
      reply,
      session_id: sessionId,
      remaining_messages: remainingMessages,
    });

  } catch (err) {
    console.error('❌ [ChatController] Error en sendMessage:', err.message);
    return res.status(500).json({
      message: 'Error al procesar tu mensaje. Intenta de nuevo.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// ──────────────────────────────────────────────────────────────
//  GET /api/chat/history  (requiere auth)
// ──────────────────────────────────────────────────────────────
exports.getHistory = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Autenticación requerida.' });

    // Obtener la sesión activa del usuario
    const sessionRes = await db.query(
      `SELECT id FROM chat_sessions WHERE user_id = $1 AND is_active = true ORDER BY updated_at DESC LIMIT 1`,
      [user.id]
    );

    if (sessionRes.rows.length === 0) {
      return res.json({ messages: [], session_id: null });
    }

    const sessionId = sessionRes.rows[0].id;
    const history = await getChatHistory(sessionId, 100); // devolver todo el historial

    return res.json({ messages: history, session_id: sessionId });
  } catch (err) {
    console.error('❌ [ChatController] Error en getHistory:', err.message);
    return res.status(500).json({ message: 'Error al obtener historial.' });
  }
};

// ──────────────────────────────────────────────────────────────
//  GET /api/chat/usage  (devuelve uso actual y límite)
// ──────────────────────────────────────────────────────────────
exports.getUsage = async (req, res) => {
  try {
    const user = req.user;
    const { session_token } = req.query;

    if (!RATE_LIMIT_ENABLED) {
      return res.json({
        rate_limit_enabled: false,
        messages_sent: 0,
        limit: null,
        remaining: null,
      });
    }

    const messagesSent = await getDailyUsage(user, session_token);
    const limit = user
      ? (user.rol === 'admin' ? null : LIMIT_USER)
      : LIMIT_ANONYMOUS;

    return res.json({
      rate_limit_enabled: true,
      messages_sent: messagesSent,
      limit,
      remaining: limit === null ? null : Math.max(0, limit - messagesSent),
      resets_at: getTomorrowMidnight(),
    });
  } catch (err) {
    console.error('❌ [ChatController] Error en getUsage:', err.message);
    return res.status(500).json({ message: 'Error al obtener uso.' });
  }
};

// ──────────────────────────────────────────────────────────────
//  DELETE /api/chat/clear  (requiere auth)
// ──────────────────────────────────────────────────────────────
exports.clearHistory = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Autenticación requerida.' });

    // Marcar la sesión activa como inactiva y crear una nueva
    await db.query(
      `UPDATE chat_sessions SET is_active = false WHERE user_id = $1 AND is_active = true`,
      [user.id]
    );

    return res.json({ message: 'Historial limpiado correctamente.' });
  } catch (err) {
    console.error('❌ [ChatController] Error en clearHistory:', err.message);
    return res.status(500).json({ message: 'Error al limpiar historial.' });
  }
};

// ──────────────────────────────────────────────────────────────
//  Helpers internos
// ──────────────────────────────────────────────────────────────

async function getOrCreateSession(user, sessionToken) {
  if (user) {
    // Usuario logueado: buscar sesión activa o crear una nueva
    const existing = await db.query(
      `SELECT id FROM chat_sessions WHERE user_id = $1 AND is_active = true ORDER BY updated_at DESC LIMIT 1`,
      [user.id]
    );
    if (existing.rows.length > 0) return existing.rows[0].id;

    const created = await db.query(
      `INSERT INTO chat_sessions (user_id) VALUES ($1) RETURNING id`,
      [user.id]
    );
    return created.rows[0].id;
  } else {
    // Usuario anónimo: usar session_token
    if (!sessionToken) return null; // No persistimos anónimos sin token

    const existing = await db.query(
      `SELECT id FROM chat_sessions WHERE session_token = $1 AND is_active = true ORDER BY updated_at DESC LIMIT 1`,
      [sessionToken]
    );
    if (existing.rows.length > 0) return existing.rows[0].id;

    const created = await db.query(
      `INSERT INTO chat_sessions (session_token) VALUES ($1) RETURNING id`,
      [sessionToken]
    );
    return created.rows[0].id;
  }
}

async function getChatHistory(sessionId, limit) {
  if (!sessionId) return [];

  const res = await db.query(
    `SELECT role, content FROM chat_messages 
     WHERE session_id = $1 AND role != 'system'
     ORDER BY created_at DESC LIMIT $2`,
    [sessionId, limit]
  );
  // Invertir para orden cronológico (más antiguo primero)
  return res.rows.reverse();
}

async function saveMessages(sessionId, userMsg, assistantReply, tokens) {
  if (!sessionId) return;

  await db.query(
    `INSERT INTO chat_messages (session_id, role, content) VALUES ($1, 'user', $2)`,
    [sessionId, userMsg]
  );
  await db.query(
    `INSERT INTO chat_messages (session_id, role, content, tokens_used) VALUES ($1, 'assistant', $2, $3)`,
    [sessionId, assistantReply, tokens]
  );
  // Actualizar timestamp de la sesión
  await db.query(
    `UPDATE chat_sessions SET updated_at = NOW() WHERE id = $1`,
    [sessionId]
  );
}

async function checkRateLimit(user, sessionToken) {
  const limit = user
    ? (user.rol === 'admin' ? Infinity : LIMIT_USER)
    : LIMIT_ANONYMOUS;

  if (limit === Infinity) return { allowed: true, messagesSent: 0, limit };

  const sent = await getDailyUsage(user, sessionToken);
  return { allowed: sent < limit, messagesSent: sent, limit };
}

async function getDailyUsage(user, sessionToken) {
  let res;
  if (user) {
    res = await db.query(
      `SELECT messages_sent FROM chat_usage_daily WHERE user_id = $1 AND date = CURRENT_DATE`,
      [user.id]
    );
  } else if (sessionToken) {
    res = await db.query(
      `SELECT messages_sent FROM chat_usage_daily WHERE session_token = $1 AND date = CURRENT_DATE`,
      [sessionToken]
    );
  } else {
    return 0;
  }
  return res.rows[0]?.messages_sent || 0;
}

async function incrementUsage(user, sessionToken) {
  if (user) {
    await db.query(
      `INSERT INTO chat_usage_daily (user_id, date, messages_sent) VALUES ($1, CURRENT_DATE, 1)
       ON CONFLICT (user_id, date) DO UPDATE SET messages_sent = chat_usage_daily.messages_sent + 1`,
      [user.id]
    );
  } else if (sessionToken) {
    await db.query(
      `INSERT INTO chat_usage_daily (session_token, date, messages_sent) VALUES ($1, CURRENT_DATE, 1)
       ON CONFLICT (session_token, date) DO UPDATE SET messages_sent = chat_usage_daily.messages_sent + 1`,
      [sessionToken]
    );
  }
}

function getTomorrowMidnight() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}
