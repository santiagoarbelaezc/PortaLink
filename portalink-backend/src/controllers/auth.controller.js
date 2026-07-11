const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Generador de Captcha Visual Personalizado (Sin librerías externas)
function generateCaptcha() {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Evitar O, 0, I, 1
    let text = '';
    for (let i = 0; i < 5; i++) {
        text += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    const width = 150;
    const height = 50;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
    
    // Fondo oscuro traslúcido
    svg += `<rect width="100%" height="100%" fill="#0a0a0a" rx="8" />`;
    
    // Líneas de ruido de fondo
    for (let i = 0; i < 6; i++) {
        const x1 = Math.random() * width;
        const y1 = Math.random() * height;
        const x2 = Math.random() * width;
        const y2 = Math.random() * height;
        svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#00b4d8" stroke-width="1.5" opacity="0.3"/>`;
    }
    
    // Renderizado de caracteres distorsionados con fuentes, rotaciones y subrayados aleatorios
    const fonts = ['Arial', 'Courier New', 'Georgia', 'Impact', 'Trebuchet MS', 'Verdana'];
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const fontSize = 24 + Math.random() * 6;
        const angle = -20 + Math.random() * 40;
        const x = 15 + i * 25 + Math.random() * 4;
        const y = 32 + Math.random() * 5;
        const font = fonts[Math.floor(Math.random() * fonts.length)];
        const underline = Math.random() > 0.5 ? 'text-decoration="underline"' : '';
        
        svg += `<text x="${x}" y="${y}" font-family="${font}" font-size="${fontSize}" font-weight="black" fill="#ffffff" transform="rotate(${angle}, ${x}, ${y})" ${underline} opacity="0.95">${char}</text>`;
    }
    
    // Puntos de ruido en el frente
    for (let i = 0; i < 35; i++) {
        const cx = Math.random() * width;
        const cy = Math.random() * height;
        svg += `<circle cx="${cx}" cy="${cy}" r="1" fill="#00b4d8" opacity="0.6"/>`;
    }
    
    svg += '</svg>';
    return { text, svg };
}

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
        // 1. Validar Usuario
        const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const usuario = result.rows[0];
        const passValido = await bcrypt.compare(password, usuario.password);

        if (!passValido) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol, email: usuario.email, telefono: usuario.telefono },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            usuario: {
                nombre: usuario.nombre,
                rol: usuario.rol,
                email: usuario.email,
                telefono: usuario.telefono
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

exports.getCaptcha = async (req, res) => {
    try {
        // Limpiar captchas expirados para mantener la tabla limpia
        await db.query('DELETE FROM captchas WHERE expires_at < NOW()');

        const { text, svg } = generateCaptcha();
        const captchaId = crypto.randomBytes(16).toString('hex');
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Válido por 5 minutos
        
        // Encriptar el código para seguridad (se valida en minúsculas)
        const hashedCode = await bcrypt.hash(text.toLowerCase(), 10);
        
        await db.query(
            'INSERT INTO captchas (id, codigo, expires_at) VALUES ($1, $2, $3)',
            [captchaId, hashedCode, expiresAt]
        );
        
        res.json({
            id: captchaId,
            svg: svg
        });
    } catch (error) {
        console.error('Error al generar captcha:', error);
        res.status(500).json({ message: 'Error al generar el captcha de seguridad' });
    }
};

exports.register = async (req, res) => {
    const { nombre, email, password, telefono, captchaId, captchaCode } = req.body;
    
    if (!nombre || !email || !password || !telefono || !captchaId || !captchaCode) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
    
    try {
        // 1. Limpiar expirados y buscar el captcha
        await db.query('DELETE FROM captchas WHERE expires_at < NOW()');
        const captchaResult = await db.query('SELECT * FROM captchas WHERE id = $1', [captchaId]);
        
        if (captchaResult.rows.length === 0) {
            return res.status(400).json({ message: 'El captcha ha expirado o es inválido' });
        }
        
        const captchaRecord = captchaResult.rows[0];
        
        // Eliminar el captcha inmediatamente para evitar ataques de replay
        await db.query('DELETE FROM captchas WHERE id = $1', [captchaId]);
        
        // 2. Validar coincidencia del captcha (insensible a mayúsculas/minúsculas)
        const captchaValido = await bcrypt.compare(captchaCode.toLowerCase().trim(), captchaRecord.codigo);
        if (!captchaValido) {
            return res.status(400).json({ message: 'El código captcha ingresado es incorrecto' });
        }
        
        // 3. Validar existencia previa del correo
        const userExists = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
        }
        
        // 4. Registrar nuevo administrador/usuario
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            'INSERT INTO usuarios (nombre, email, password, telefono, rol) VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre, email, telefono, rol',
            [nombre, email, hashedPassword, telefono, 'admin']
        );
        
        const nuevoUsuario = result.rows[0];
        
        // 5. Crear token de sesión automático para ingresar directamente tras registrarse
         const token = jwt.sign(
            { id: nuevoUsuario.id, rol: nuevoUsuario.rol, email: nuevoUsuario.email, telefono: nuevoUsuario.telefono },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );
        
        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            usuario: {
                nombre: nuevoUsuario.nombre,
                rol: nuevoUsuario.rol,
                email: nuevoUsuario.email,
                telefono: nuevoUsuario.telefono
            }
        });
        
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ message: 'Error en el servidor al intentar registrarse' });
    }
};

exports.getUsers = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No autorizado' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.rol !== 'admin') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }

        const result = await db.query(
            'SELECT id, nombre, email, rol, created_at FROM usuarios ORDER BY id ASC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Sesión inválida o expirada' });
        }
        res.status(500).json({ message: 'Error en el servidor al obtener usuarios' });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id; // from verifyToken middleware
        
        // 1. Obtener usuario
        const result = await db.query('SELECT * FROM usuarios WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        const user = result.rows[0];

        // 2. Verificar contraseña actual
        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'La contraseña actual es incorrecta' });
        }

        // 3. Encriptar y actualizar nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE usuarios SET password = $1 WHERE id = $2', [hashedPassword, userId]);

        res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar contraseña:', error);
        res.status(500).json({ message: 'Error en el servidor al actualizar la contraseña' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { nombre, email, telefono } = req.body;
        const userId = req.user.id;

        if (!nombre || !email || !telefono) {
            return res.status(400).json({ message: 'Nombre, correo y teléfono son obligatorios' });
        }

        // 1. Validar correo electrónico
        const cleanedEmail = email.trim().toLowerCase();
        if (!cleanedEmail.includes('@')) {
            return res.status(400).json({ message: 'El correo electrónico debe contener un "@"' });
        }
        const allowedDomains = /@(gmail|hotmail|outlook|live|msn|yahoo|icloud|protonmail|proton|aol|zoho|gmx|yandex)\.[a-zA-Z]{2,}/;
        if (!allowedDomains.test(cleanedEmail)) {
            return res.status(400).json({ message: 'El proveedor de correo no es válido o común' });
        }

        // 2. Validar teléfono
        const cleanedPhone = telefono.trim();
        const phoneRegex = /^[0-9+() -]{7,15}$/;
        if (!phoneRegex.test(cleanedPhone)) {
            return res.status(400).json({ message: 'El número de teléfono debe tener entre 7 y 15 dígitos numéricos' });
        }

        // 3. Validar duplicado de correo electrónico
        const emailCheck = await db.query('SELECT id FROM usuarios WHERE email = $1 AND id <> $2', [cleanedEmail, userId]);
        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ message: 'El correo electrónico ingresado ya pertenece a otra cuenta' });
        }

        // 4. Actualizar perfil
        const updateResult = await db.query(
            'UPDATE usuarios SET nombre = $1, email = $2, telefono = $3 WHERE id = $4 RETURNING id, nombre, email, telefono, rol',
            [nombre.trim(), cleanedEmail, cleanedPhone, userId]
        );

        const updatedUser = updateResult.rows[0];

        // 5. Regenerar el JWT
        const token = jwt.sign(
            { id: updatedUser.id, rol: updatedUser.rol, email: updatedUser.email, telefono: updatedUser.telefono },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            message: 'Perfil actualizado exitosamente',
            token,
            usuario: {
                nombre: updatedUser.nombre,
                rol: updatedUser.rol,
                email: updatedUser.email,
                telefono: updatedUser.telefono
            }
        });
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ message: 'Error en el servidor al actualizar el perfil' });
    }
};
