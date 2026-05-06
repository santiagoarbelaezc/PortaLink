const db = require('../config/db');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query(\`
            SELECT p.*, s.nombre as subcategoria_nombre, c.nombre as categoria_nombre 
            FROM productos p 
            LEFT JOIN subcategorias s ON p.subcategoria_id = s.id 
            LEFT JOIN categorias c ON s.categoria_id = c.id 
            ORDER BY p.created_at DESC
        \`);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener productos' });
    }
};

exports.create = async (req, res) => {
    const { nombre, descripcion, precio, desde, subcategoria_id, tipo, imagen, imagenes, colores, stock } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO productos (nombre, descripcion, precio, desde, subcategoria_id, tipo, imagen, imagenes, colores, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, descripcion, precio, desde, subcategoria_id, tipo, imagen, JSON.stringify(imagenes), JSON.stringify(colores), stock]
        );
        res.status(201).json({ id: result.insertId, message: 'Producto creado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear producto' });
    }
};

exports.update = async (req, res) => {
    const { nombre, descripcion, precio, desde, subcategoria_id, tipo, imagen, imagenes, colores, stock } = req.body;
    try {
        await db.query(
            'UPDATE productos SET nombre=?, descripcion=?, precio=?, desde=?, subcategoria_id=?, tipo=?, imagen=?, imagenes=?, colores=?, stock=? WHERE id=?',
            [nombre, descripcion, precio, desde, subcategoria_id, tipo, imagen, JSON.stringify(imagenes), JSON.stringify(colores), stock, req.params.id]
        );
        res.json({ message: 'Producto actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar producto' });
    }
};

exports.delete = async (req, res) => {
    try {
        await db.query('DELETE FROM productos WHERE id = ?', [req.params.id]);
        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar producto' });
    }
};
