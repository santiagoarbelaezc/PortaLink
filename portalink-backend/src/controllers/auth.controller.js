const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // En un caso real, buscaríamos en la base de datos
        // Por ahora, usaremos un usuario de prueba hasta tener tus credenciales
        const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const usuario = rows[0];
        const passValido = await bcrypt.compare(password, usuario.password);

        if (!passValido) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            usuario: {
                nombre: usuario.nombre,
                rol: usuario.rol
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};
