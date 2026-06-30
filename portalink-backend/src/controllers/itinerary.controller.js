const db = require('../config/db');

// ════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════

/**
 * Builds the WHERE clause and param list for optional query filters.
 * Supports: type, completed, date_from, date_to, week_start (ISO date)
 */
function buildFilters(userId, query) {
    const conditions = ['t.user_id = $1'];
    const params = [userId];
    let idx = 2;

    if (query.type && ['work', 'personal', 'urgent'].includes(query.type)) {
        conditions.push(`t.type = $${idx++}`);
        params.push(query.type);
    }

    if (query.completed !== undefined) {
        conditions.push(`t.completed = $${idx++}`);
        params.push(query.completed === 'true');
    }

    if (query.date_from) {
        conditions.push(`t.task_date >= $${idx++}`);
        params.push(query.date_from);
    }

    if (query.date_to) {
        conditions.push(`t.task_date <= $${idx++}`);
        params.push(query.date_to);
    }

    // week_start = ISO date (Monday). Returns Mon–Sun of that week.
    if (query.week_start) {
        conditions.push(`t.task_date >= $${idx++}`);
        params.push(query.week_start);
        const weekEnd = new Date(query.week_start);
        weekEnd.setDate(weekEnd.getDate() + 6);
        conditions.push(`t.task_date <= $${idx++}`);
        params.push(weekEnd.toISOString().slice(0, 10));
    }

    return { where: conditions.join(' AND '), params };
}

// ════════════════════════════════════════════════════════════
// GET /api/itinerary  — All tasks (with optional filters)
// ════════════════════════════════════════════════════════════
exports.getTasks = async (req, res) => {
    try {
        const { where, params } = buildFilters(req.user.id, req.query);

        const result = await db.query(
            `SELECT
                t.id, t.user_id, t.title, t.description,
                t.type, t.task_date, t.task_time, t.completed,
                t.completed_at, t.created_at, t.updated_at
             FROM itinerary_tasks t
             WHERE ${where}
             ORDER BY t.task_date ASC, t.task_time ASC NULLS LAST, t.created_at ASC`,
            params
        );

        res.json({
            ok: true,
            count: result.rowCount,
            tasks: result.rows
        });
    } catch (err) {
        console.error('[Itinerary] getTasks error:', err.message);
        res.status(500).json({ ok: false, message: 'Error al obtener las tareas' });
    }
};

// ════════════════════════════════════════════════════════════
// GET /api/itinerary/week?week_start=YYYY-MM-DD
// Returns the 7 days grouped by date for the kanban view.
// ════════════════════════════════════════════════════════════
exports.getWeek = async (req, res) => {
    const { week_start } = req.query;

    if (!week_start || !/^\d{4}-\d{2}-\d{2}$/.test(week_start)) {
        return res.status(400).json({ ok: false, message: 'Parámetro week_start requerido (YYYY-MM-DD)' });
    }

    try {
        // Safe timezone parsing using midday UTC
        const weekEnd = new Date(week_start + 'T12:00:00Z');
        weekEnd.setDate(weekEnd.getDate() + 6);
        const weekEndStr = weekEnd.toISOString().slice(0, 10);

        const result = await db.query(
            `SELECT
                t.id, t.title, t.description,
                t.type, t.task_date::text AS task_date,
                t.task_time::text AS task_time,
                t.completed, t.completed_at, t.created_at
             FROM itinerary_tasks t
             WHERE t.user_id = $1
               AND t.task_date BETWEEN $2 AND $3
             ORDER BY t.task_date ASC, t.task_time ASC NULLS LAST`,
            [req.user.id, week_start, weekEndStr]
        );

        res.json({ ok: true, week_start, week_end: weekEndStr, tasks: result.rows });
    } catch (err) {
        console.error('[Itinerary] getWeek error:', err.message);
        res.status(500).json({ ok: false, message: 'Error al obtener la semana', details: err.message });
    }
};

// ════════════════════════════════════════════════════════════
// GET /api/itinerary/today — Today's tasks for notifications
// Also auto-generates notification records for any new tasks.
// ════════════════════════════════════════════════════════════
exports.getToday = async (req, res) => {
    const userId = req.user.id;
    try {
        // Fetch today's pending tasks
        const result = await db.query(
            `SELECT
                t.id, t.title, t.description, t.type,
                t.task_date::text AS task_date,
                t.task_time::text AS task_time,
                t.completed
             FROM itinerary_tasks t
             WHERE t.user_id = $1
               AND t.task_date = CURRENT_DATE
             ORDER BY t.task_time ASC NULLS LAST`,
            [userId]
        );

        const tasks = result.rows;

        // Auto-create notification records for today's tasks (no duplicates)
        if (tasks.length > 0) {
            const taskIds = tasks.map(t => t.id);
            const insertValues = taskIds
                .map((_, i) => `($1, $${i + 2})`)
                .join(', ');

            await db.query(
                `INSERT INTO itinerary_notifications (user_id, task_id)
                 VALUES ${insertValues}
                 ON CONFLICT (user_id, task_id) DO NOTHING`,
                [userId, ...taskIds]
            );
        }

        // Classify tasks for the notification panel
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();

        const classify = (task) => {
            if (!task.task_time) return 'no_time';
            const [h, m] = task.task_time.split(':').map(Number);
            const taskMin = h * 60 + m;
            if (task.completed) return 'completed';
            if (taskMin <= nowMinutes && nowMinutes < taskMin + 60) return 'current';
            if (taskMin < nowMinutes) return 'overdue';
            return 'upcoming';
        };

        const classified = {
            current:   tasks.filter(t => classify(t) === 'current'),
            upcoming:  tasks.filter(t => classify(t) === 'upcoming'),
            overdue:   tasks.filter(t => classify(t) === 'overdue'),
            no_time:   tasks.filter(t => classify(t) === 'no_time'),
            completed: tasks.filter(t => classify(t) === 'completed'),
        };

        // Unseen notification count
        const unseenResult = await db.query(
            `SELECT COUNT(*) AS unseen
             FROM itinerary_notifications n
             INNER JOIN itinerary_tasks t ON t.id = n.task_id
             WHERE n.user_id = $1
               AND n.seen = FALSE
               AND t.task_date = CURRENT_DATE
               AND t.completed = FALSE`,
            [userId]
        );

        res.json({
            ok: true,
            date: now.toISOString().slice(0, 10),
            unseen: parseInt(unseenResult.rows[0].unseen, 10),
            ...classified
        });
    } catch (err) {
        console.error('[Itinerary] getToday error:', err.message);
        res.status(500).json({ ok: false, message: 'Error al obtener las tareas de hoy' });
    }
};

// ════════════════════════════════════════════════════════════
// GET /api/itinerary/notifications — Unseen notifications badge
// ════════════════════════════════════════════════════════════
exports.getNotifications = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await db.query(
            `SELECT
                n.id AS notif_id, n.seen, n.sent_at,
                t.id AS task_id, t.title, t.type,
                t.task_date::text AS task_date,
                t.task_time::text AS task_time,
                t.completed
             FROM itinerary_notifications n
             INNER JOIN itinerary_tasks t ON t.id = n.task_id
             WHERE n.user_id = $1
               AND t.task_date = CURRENT_DATE
             ORDER BY t.task_time ASC NULLS LAST`,
            [userId]
        );

        const unseen = result.rows.filter(r => !r.seen && !r.completed).length;

        res.json({
            ok: true,
            unseen,
            notifications: result.rows
        });
    } catch (err) {
        console.error('[Itinerary] getNotifications error:', err.message);
        res.status(500).json({ ok: false, message: 'Error al obtener notificaciones' });
    }
};

// ════════════════════════════════════════════════════════════
// POST /api/itinerary/notifications/:taskId/seen
// ════════════════════════════════════════════════════════════
exports.markNotificationSeen = async (req, res) => {
    const userId = req.user.id;
    const { taskId } = req.params;
    try {
        await db.query(
            `UPDATE itinerary_notifications
             SET seen = TRUE, seen_at = NOW()
             WHERE user_id = $1 AND task_id = $2`,
            [userId, taskId]
        );
        res.json({ ok: true, message: 'Notificación marcada como vista' });
    } catch (err) {
        console.error('[Itinerary] markNotificationSeen error:', err.message);
        res.status(500).json({ ok: false, message: 'Error al actualizar notificación' });
    }
};

// ════════════════════════════════════════════════════════════
// POST /api/itinerary — Create task
// ════════════════════════════════════════════════════════════
exports.createTask = async (req, res) => {
    const { title, description, type = 'work', task_date, task_time } = req.body;

    if (!title || !task_date) {
        return res.status(400).json({ ok: false, message: 'Los campos title y task_date son obligatorios' });
    }

    // Validate date range: today to today + 65 days (using strings to avoid timezone shifts)
    const now = new Date();
    const todayStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    const maxObj = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    maxObj.setDate(maxObj.getDate() + 65);
    const maxStr = maxObj.toISOString().slice(0, 10);

    if (task_date < todayStr || task_date > maxStr) {
        return res.status(400).json({ ok: false, message: 'La fecha debe estar entre hoy y los próximos 65 días' });
    }

    try {
        const result = await db.query(
            `INSERT INTO itinerary_tasks (user_id, title, description, type, task_date, task_time)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, title, description, type,
                       task_date::text AS task_date,
                       task_time::text AS task_time,
                       completed, created_at`,
            [req.user.id, title.trim(), description?.trim() || null, type, task_date, task_time || null]
        );

        res.status(201).json({ ok: true, task: result.rows[0] });
    } catch (err) {
        console.error('[Itinerary] createTask error:', err.message);
        res.status(500).json({ ok: false, message: 'Error al crear la tarea' });
    }
};

// ════════════════════════════════════════════════════════════
// PUT /api/itinerary/:id — Full update of a task
// ════════════════════════════════════════════════════════════
exports.updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, description, type, task_date, task_time } = req.body;

    if (!title || !task_date) {
        return res.status(400).json({ ok: false, message: 'title y task_date son obligatorios' });
    }

    try {
        // Verify ownership
        const ownership = await db.query(
            'SELECT id FROM itinerary_tasks WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );
        if (ownership.rowCount === 0) {
            return res.status(404).json({ ok: false, message: 'Tarea no encontrada' });
        }

        const result = await db.query(
            `UPDATE itinerary_tasks
             SET title = $1, description = $2, type = $3,
                 task_date = $4, task_time = $5
             WHERE id = $6 AND user_id = $7
             RETURNING id, title, description, type,
                       task_date::text AS task_date,
                       task_time::text AS task_time,
                       completed, updated_at`,
            [title.trim(), description?.trim() || null, type, task_date, task_time || null, id, req.user.id]
        );

        res.json({ ok: true, task: result.rows[0] });
    } catch (err) {
        console.error('[Itinerary] updateTask error:', err.message);
        res.status(500).json({ ok: false, message: 'Error al actualizar la tarea' });
    }
};

// ════════════════════════════════════════════════════════════
// PATCH /api/itinerary/:id/toggle — Toggle completed status
// ════════════════════════════════════════════════════════════
exports.toggleTask = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(
            `UPDATE itinerary_tasks
             SET
                 completed    = NOT completed,
                 completed_at = CASE WHEN NOT completed THEN NOW() ELSE NULL END
             WHERE id = $1 AND user_id = $2
             RETURNING id, completed, completed_at`,
            [id, req.user.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ ok: false, message: 'Tarea no encontrada' });
        }

        res.json({ ok: true, task: result.rows[0] });
    } catch (err) {
        console.error('[Itinerary] toggleTask error:', err.message);
        res.status(500).json({ ok: false, message: 'Error al cambiar el estado de la tarea' });
    }
};

// ════════════════════════════════════════════════════════════
// DELETE /api/itinerary/:id
// ════════════════════════════════════════════════════════════
exports.deleteTask = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(
            'DELETE FROM itinerary_tasks WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, req.user.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ ok: false, message: 'Tarea no encontrada o no tienes permiso para eliminarla' });
        }

        res.json({ ok: true, message: 'Tarea eliminada correctamente', id: result.rows[0].id });
    } catch (err) {
        console.error('[Itinerary] deleteTask error:', err.message);
        res.status(500).json({ ok: false, message: 'Error al eliminar la tarea' });
    }
};
