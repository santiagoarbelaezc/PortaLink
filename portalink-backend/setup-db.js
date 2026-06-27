const db = require('./src/config/db');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function setup() {
    try {
        console.log('Creando tabla de usuarios...');
        const sql = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');
        await db.query(sql);
        console.log('Tabla creada con éxito.');

        console.log('Verificando si el usuario admin ya existe...');
        const res = await db.query('SELECT * FROM usuarios WHERE email = $1', ['admin@portalink.com']);
        
        if (res.rows.length === 0) {
            console.log('Creando usuario administrador...');
            const hash = await bcrypt.hash('admin', 10);
            await db.query(
                'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4)',
                ['Admin', 'admin@portalink.com', hash, 'admin']
            );
            console.log('Usuario admin@portalink.com creado exitosamente con contraseña "admin"');
        } else {
            console.log('El usuario admin ya existe.');
        }

    } catch (err) {
        console.error('Error configurando la base de datos:', err);
    } finally {
        // Salir para no dejar el proceso colgado
        process.exit();
    }
}

setup();
