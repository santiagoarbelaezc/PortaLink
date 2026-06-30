const db = require('../config/db');

// 1. Recibir eventos desde el frontend (público)
exports.trackEvent = async (req, res) => {
    try {
        const events = Array.isArray(req.body) ? req.body : [req.body];
        
        // Basic batch insert
        if (events.length > 0) {
            const client = await db.connect();
            try {
                await client.query('BEGIN');
                
                for (const ev of events) {
                    await client.query(
                        `INSERT INTO analytics_events (session_id, event_category, event_label, event_value) 
                         VALUES ($1, $2, $3, $4)`,
                        [ev.sessionId || null, ev.category, ev.label || null, ev.value || null]
                    );
                }
                
                await client.query('COMMIT');
            } catch (err) {
                await client.query('ROLLBACK');
                throw err;
            } finally {
                client.release();
            }
        }
        
        res.status(200).json({ ok: true });
    } catch (error) {
        console.error('[Analytics] Error tracking event:', error);
        res.status(500).json({ ok: false, message: 'Error tracking events' });
    }
};

// 2. Obtener métricas para el dashboard (protegido)
exports.getDashboardMetrics = async (req, res) => {
    try {
        // Consultar agregados
        const query = `
            SELECT event_category, event_label, COUNT(*) as count, AVG(event_value) as avg_val
            FROM analytics_events
            GROUP BY event_category, event_label
        `;
        const result = await db.query(query);
        const rows = result.rows;

        // Estructura esperada por el frontend
        const metrics = {
            homeViews: 0,
            linktreeViews: 0,
            rotbotOpens: 0,
            rotbotMessagesSent: 0,
            sectionViews: {},
            linktreeClicks: {},
            loadTimes: [],
            themeSelections: { light: 0, dark: 0 }
        };

        // Popular la estructura
        for (const row of rows) {
            const { event_category, event_label, count, avg_val } = row;
            const c = parseInt(count, 10);

            if (event_category === 'page_view') {
                if (event_label === 'home') metrics.homeViews += c;
                if (event_label === 'linktree') metrics.linktreeViews += c;
            }
            else if (event_category === 'rotbot') {
                if (event_label === 'open') metrics.rotbotOpens += c;
                if (event_label === 'message_sent') metrics.rotbotMessagesSent += c;
            }
            else if (event_category === 'section_view') {
                metrics.sectionViews[event_label] = (metrics.sectionViews[event_label] || 0) + c;
            }
            else if (event_category === 'link_click') {
                metrics.linktreeClicks[event_label] = (metrics.linktreeClicks[event_label] || 0) + c;
            }
            else if (event_category === 'theme') {
                if (event_label === 'light') metrics.themeSelections.light += c;
                if (event_label === 'dark') metrics.themeSelections.dark += c;
            }
        }

        // Obtener ultimos 20 load times
        const loadTimesResult = await db.query(
            `SELECT event_value FROM analytics_events 
             WHERE event_category = 'performance' AND event_label = 'load_time' 
             ORDER BY created_at DESC LIMIT 20`
        );
        metrics.loadTimes = loadTimesResult.rows.map(r => parseFloat(r.event_value));

        res.json({ ok: true, metrics });
    } catch (error) {
        console.error('[Analytics] Error getting metrics:', error);
        res.status(500).json({ ok: false, message: 'Error getting metrics' });
    }
};
