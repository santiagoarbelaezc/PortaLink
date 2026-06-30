require('dotenv').config();

const https = require('https');

/**
 * Llama a la API de Groq con failover automático entre dos keys.
 * @param {Array} messages - Array de mensajes en formato OpenAI [{role, content}]
 * @param {object} options - Opciones adicionales (temperature, max_tokens)
 * @returns {Promise<{content: string, tokens: number}>}
 */
async function callGroq(messages, options = {}) {
  const primaryKey = process.env.GROQ_API_KEY_PRIMARY;
  const fallbackKey = process.env.GROQ_API_KEY_FALLBACK;
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  const maxTokens = parseInt(process.env.GROQ_MAX_TOKENS || '500');
  const temperature = options.temperature ?? parseFloat(process.env.GROQ_TEMPERATURE || '0.7');

  // Intentar con la key principal primero, luego con la de fallback
  const keys = [primaryKey, fallbackKey].filter(Boolean);

  let lastError;
  for (const apiKey of keys) {
    try {
      const result = await makeGroqRequest(apiKey, messages, {
        model,
        max_tokens: maxTokens,
        temperature,
      });
      return result;
    } catch (err) {
      console.warn(`⚠️  [Groq] Falló con key ...${apiKey.slice(-8)}: ${err.message}`);
      lastError = err;
      // Solo hacer fallover en errores de autenticación o rate limit
      if (err.statusCode === 401 || err.statusCode === 429 || err.statusCode >= 500) {
        continue;
      }
      throw err; // Para otros errores no hacemos fallover
    }
  }

  throw lastError || new Error('Todas las API keys de Groq fallaron');
}

/**
 * Realiza la petición HTTP a la API de Groq.
 */
function makeGroqRequest(apiKey, messages, options) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: options.model,
      messages,
      temperature: options.temperature,
      max_tokens: options.max_tokens,
    });

    const reqOptions = {
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode !== 200) {
            const error = new Error(parsed.error?.message || `Error HTTP ${res.statusCode}`);
            error.statusCode = res.statusCode;
            return reject(error);
          }
          const content = parsed.choices?.[0]?.message?.content || '';
          const tokens = parsed.usage?.completion_tokens || 0;
          resolve({ content, tokens });
        } catch (e) {
          reject(new Error('Error al parsear respuesta de Groq: ' + e.message));
        }
      });
    });

    req.on('error', (e) => reject(new Error('Error de red al llamar a Groq: ' + e.message)));
    req.write(payload);
    req.end();
  });
}

module.exports = { callGroq };
