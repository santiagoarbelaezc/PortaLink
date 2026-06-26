const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos (para imágenes de productos si es necesario)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas base
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenido a la API de PortaLink', version: '1.0.0' });
});

// Importar rutas
const authRoutes = require('./routes/auth.routes');

// Usar rutas
app.use('/api/auth', authRoutes);

module.exports = app;
