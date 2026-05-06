const db = require('../config/db');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categorias ORDER BY nombre ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener categorías' });
    }
};

exports.create = async (req, res) => {
    const { nombre } = req.body;
    try {
        const [result] = await db.query('INSERT INTO categorias (nombre) VALUES (?)', [nombre]);
        res.status(201).json({ id: result.insertId, message: 'Categoría creada' });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear categoría' });
    }
};

exports.update = async (req, res) => {
    const { nombre } = req.body;
    try {
        await db.query('UPDATE categorias SET nombre=? WHERE id=?', [nombre, req.params.id]);
        res.json({ message: 'Categoría actualizada' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar categoría' });
    }
};

exports.delete = async (req, res) => {
    try {
        await db.query('DELETE FROM categorias WHERE id = ?', [req.params.id]);
        res.json({ message: 'Categoría eliminada' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar categoría' });
    }
};
