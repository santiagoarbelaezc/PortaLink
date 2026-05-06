const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Probar conexión
db.getConnection()
    .then(connection => {
        console.log('✅ Conectado a la base de datos MySQL');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Error conectando a la base de datos:', err.message);
    });

module.exports = db;
