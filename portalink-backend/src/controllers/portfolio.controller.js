const db = require('../config/db');

// Obtener toda la configuración del portafolio
exports.getConfig = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM portafolio_config');
        const config = {};
        rows.forEach(row => {
            config[row.seccion] = row.contenido;
        });
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener configuración' });
    }
};

// Actualizar una sección específica (hero, about, etc.)
exports.updateSection = async (req, res) => {
    const { seccion } = req.params;
    const contenido = req.body;

    try {
        await db.query(
            'INSERT INTO portafolio_config (seccion, contenido) VALUES (?, ?) ON DUPLICATE KEY UPDATE contenido = ?',
            [seccion, JSON.stringify(contenido), JSON.stringify(contenido)]
        );
        res.json({ message: `Sección ${seccion} actualizada correctamente` });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar sección' });
    }
};

// --- GESTIÓN DE SKILLS ---
exports.getSkills = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM skills ORDER BY orden ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener skills' });
    }
};

exports.addSkill = async (req, res) => {
    const { nombre, porcentaje, icon, orden } = req.body;
    try {
        const [result] = await db.query('INSERT INTO skills (nombre, porcentaje, icon, orden) VALUES (?, ?, ?, ?)', [nombre, porcentaje, icon, orden]);
        res.status(201).json({ id: result.insertId, message: 'Skill añadida' });
    } catch (error) {
        res.status(500).json({ message: 'Error al añadir skill' });
    }
};

// --- GESTIÓN DE PROYECTOS ---
exports.getProyectos = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM proyectos ORDER BY orden ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener proyectos' });
    }
};

exports.addProyecto = async (req, res) => {
    const { titulo, descripcion, tech_stack, imagenes, live_url, github_url, destacado, orden } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO proyectos (titulo, descripcion, tech_stack, imagenes, live_url, github_url, destacado, orden) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [titulo, descripcion, JSON.stringify(tech_stack), JSON.stringify(imagenes), live_url, github_url, destacado, orden]
        );
        res.status(201).json({ id: result.insertId, message: 'Proyecto añadido' });
    } catch (error) {
        res.status(500).json({ message: 'Error al añadir proyecto' });
    }
};
