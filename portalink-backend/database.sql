-- 1. Usuarios del Dashboard
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Datos iniciales
INSERT INTO usuarios (nombre, email, password, rol) 
VALUES ('Santiago Arbelaez Contreras', 'santiarco2611@gmail.com', '$2b$10$3l/AvzwQZLbrK5MjvQfDEueIA6bPkIt3csRtTC.M1duxjDggU57oC', 'admin')
ON CONFLICT (email) DO NOTHING;
