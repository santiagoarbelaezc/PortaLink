const pool = require('../config/db');

/**
 * Obtener los últimos registros de actividad
 */
exports.getActivityLogs = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT icon_type AS "iconType", label, created_at AS date FROM activity_logs ORDER BY created_at DESC LIMIT 50'
    );
    
    // Formatear la fecha para que se vea bonita en el frontend (opcional, el front puede hacerlo también)
    const logs = result.rows.map(row => {
      return {
        iconType: row.iconType,
        label: row.label,
        date: new Date(row.date).toLocaleString('es-ES', { 
          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
        })
      };
    });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Insertar un nuevo registro de actividad
 */
exports.logActivity = async (req, res) => {
  try {
    const { iconType, label } = req.body;
    
    if (!iconType || !label) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const result = await pool.query(
      'INSERT INTO activity_logs (icon_type, label) VALUES ($1, $2) RETURNING icon_type AS "iconType", label, created_at AS date',
      [iconType, label]
    );

    const newLog = result.rows[0];
    newLog.date = new Date(newLog.date).toLocaleString('es-ES', { 
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    });

    res.status(201).json(newLog);
  } catch (error) {
    console.error('Error inserting activity log:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
