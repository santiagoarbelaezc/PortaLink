const pool = require('../config/db');

exports.sendMessage = async (req, res) => {
  try {
    const { nombre, correo, mensaje } = req.body;

    if (!nombre || !correo || !mensaje) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const query = `
      INSERT INTO contact_messages (nombre, correo, mensaje)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [nombre, correo, mensaje];

    const result = await pool.query(query, values);
    res.status(201).json({ message: 'Mensaje enviado con éxito', data: result.rows[0] });
  } catch (error) {
    console.error('Error enviando mensaje:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'read', 'unread', or 'replied'

    if (!['read', 'unread', 'replied'].includes(status)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    const result = await pool.query(
      'UPDATE contact_messages SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Mensaje no encontrado' });
    }

    res.json({ message: 'Estado actualizado', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM contact_messages WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Mensaje no encontrado' });
    }

    res.json({ message: 'Mensaje eliminado' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
