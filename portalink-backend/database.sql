-- 1. Usuarios del Dashboard
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'cliente') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Configuración Global del Portafolio (Hero, About, Contacto)
CREATE TABLE IF NOT EXISTS portafolio_config (
    id INT PRIMARY KEY DEFAULT 1,
    seccion VARCHAR(50) NOT NULL,
    contenido JSON NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Servicios Profesionales (Ingeniería, Marketing, etc.)
CREATE TABLE IF NOT EXISTS servicios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    area VARCHAR(100),
    tags JSON,
    icon VARCHAR(50),
    orden INT DEFAULT 0
);

-- 4. Skills / Habilidades
CREATE TABLE IF NOT EXISTS skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    porcentaje INT DEFAULT 0,
    icon VARCHAR(50),
    orden INT DEFAULT 0
);

-- 5. Proyectos Destacados
CREATE TABLE IF NOT EXISTS proyectos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tech_stack JSON,
    imagenes JSON,
    live_url VARCHAR(255),
    github_url VARCHAR(255),
    destacado BOOLEAN DEFAULT FALSE,
    orden INT DEFAULT 0
);

-- 6. Visitas (Analíticas)
CREATE TABLE IF NOT EXISTS visitas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pagina_visitada VARCHAR(255) NOT NULL,
    referencia VARCHAR(255),
    ip_address VARCHAR(45),
    fecha_visita TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos iniciales (admin123)
INSERT INTO usuarios (nombre, email, password, rol) 
VALUES ('Santiago Arbeláez', 'admin@portalink.com', '$2a$10$7rXjO6qW/vXzW4X0Q8Z2Y.G.6Y6Y6Y6Y6Y6Y6Y6Y6Y6Y6Y6Y6Y6Y6', 'admin');
