const db = require('../config/db');

exports.registrarVisita = async (req, res) => {
    const { pagina, referencia } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    try {
        await db.query(
            'INSERT INTO visitas (pagina_visitada, referencia, ip_address) VALUES (?, ?, ?)',
            [pagina, referencia, ip]
        );
        res.status(201).json({ message: 'Visita registrada' });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar visita' });
    }
};

exports.getResumen = async (req, res) => {
    try {
        const [hoy] = await db.query('SELECT COUNT(*) as total FROM visitas WHERE DATE(fecha_visita) = CURDATE()');
        const [unicos] = await db.query('SELECT COUNT(DISTINCT ip_address) as total FROM visitas');
        const [total] = await db.query('SELECT COUNT(*) as total FROM visitas');

        res.json({
            hoy: hoy[0].total,
            unicos: unicos[0].total,
            total: total[0].total
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener resumen' });
    }
};

exports.getGrafica = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT DATE_FORMAT(fecha_visita, '%Y-%m-%d') as fecha, COUNT(*) as cantidad 
            FROM visitas 
            WHERE fecha_visita >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY fecha 
            ORDER BY fecha ASC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener datos de gráfica' });
    }
};

exports.getLogs = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM visitas ORDER BY fecha_visita DESC LIMIT 50');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener logs' });
    }
};

exports.getTopProductos = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT nombre, vistas FROM productos ORDER BY vistas DESC LIMIT 10');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener top productos' });
    }
};
