const { Pool } = require('pg');
require('dotenv').config();

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Probar conexión
db.connect()
    .then(client => {
        console.log('✅ Conectado a la base de datos PostgreSQL (Supabase)');
        client.release();
    })
    .catch(err => {
        console.error('❌ Error conectando a la base de datos:', err.message);
    });

module.exports = db;
