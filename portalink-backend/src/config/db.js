const { Pool } = require('pg');
require('dotenv').config();

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Probar conexión detallada
db.connect()
    .then(async client => {
        try {
            const res = await client.query('SELECT NOW() as time');
            console.log('✅ [Supabase] Conexión establecida con éxito.');
            console.log(`⏱️ Hora del servidor DB: ${res.rows[0].time}`);
        } catch (queryErr) {
            console.error('❌ [Supabase] Conectado, pero falló la prueba de consulta:', queryErr.message);
        } finally {
            client.release();
        }
    })
    .catch(err => {
        console.error('❌ [Supabase] Error conectando a la base de datos:');
        console.error(`   Detalle: ${err.message}`);
    });

module.exports = db;
