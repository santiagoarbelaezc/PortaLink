const pool = require('../config/db');

exports.getSettings = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM system_settings WHERE id = 1');
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    
    const settings = result.rows[0];
    
    // Map snake_case db columns to camelCase for the frontend
    const mappedSettings = {
      currency: settings.currency,
      language: settings.language,
      timeFormat: settings.time_format,
      emailReminders: settings.email_reminders,
      feedbackLoop: settings.feedback_loop,
      overdueAlerts: settings.overdue_alerts,
      chatbotName: settings.chatbot_name,
      assistantPersonality: settings.assistant_personality,
      maintenanceMode: settings.maintenance_mode
    };
    
    res.json(mappedSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const {
      currency, language, timeFormat,
      emailReminders, feedbackLoop, overdueAlerts,
      chatbotName, assistantPersonality, maintenanceMode
    } = req.body;

    const query = `
      UPDATE system_settings
      SET 
        currency = $1,
        language = $2,
        time_format = $3,
        email_reminders = $4,
        feedback_loop = $5,
        overdue_alerts = $6,
        chatbot_name = $7,
        assistant_personality = $8,
        maintenance_mode = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
      RETURNING *
    `;

    const values = [
      currency, language, timeFormat,
      emailReminders, feedbackLoop, overdueAlerts,
      chatbotName, assistantPersonality, maintenanceMode
    ];

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Settings not found to update' });
    }

    const settings = result.rows[0];
    const mappedSettings = {
      currency: settings.currency,
      language: settings.language,
      timeFormat: settings.time_format,
      emailReminders: settings.email_reminders,
      feedbackLoop: settings.feedback_loop,
      overdueAlerts: settings.overdue_alerts,
      chatbotName: settings.chatbot_name,
      assistantPersonality: settings.assistant_personality,
      maintenanceMode: settings.maintenance_mode
    };

    res.json(mappedSettings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
