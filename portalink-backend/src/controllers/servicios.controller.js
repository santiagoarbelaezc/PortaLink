const db = require('../config/db');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM servicios ORDER BY orden ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener servicios' });
    }
};

exports.create = async (req, res) => {
    const { titulo, descripcion, area, tags, icon, orden } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO servicios (titulo, descripcion, area, tags, icon, orden) VALUES (?, ?, ?, ?, ?, ?)',
            [titulo, descripcion, area, JSON.stringify(tags), icon, orden]
        );
        res.status(201).json({ id: result.insertId, message: 'Servicio creado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear servicio' });
    }
};

exports.update = async (req, res) => {
    const { titulo, descripcion, area, tags, icon, orden } = req.body;
    try {
        await db.query(
            'UPDATE servicios SET titulo=?, descripcion=?, area=?, tags=?, icon=?, orden=? WHERE id=?',
            [titulo, descripcion, area, JSON.stringify(tags), icon, orden, req.params.id]
        );
        res.json({ message: 'Servicio actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar servicio' });
    }
};

exports.delete = async (req, res) => {
    try {
        await db.query('DELETE FROM servicios WHERE id = ?', [req.params.id]);
        res.json({ message: 'Servicio eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar servicio' });
    }
};
