-- 1. Usuarios del Dashboard
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla para validación de Captchas Temporales
CREATE TABLE IF NOT EXISTS captchas (
    id VARCHAR(100) PRIMARY KEY,
    codigo VARCHAR(100) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 3. Sesiones de chat (una por conversación)
CREATE TABLE IF NOT EXISTS chat_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    session_token VARCHAR(255),  -- para usuarios anónimos
    title VARCHAR(255) DEFAULT 'Nueva conversación',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Mensajes de cada sesión de chat
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Uso diario de mensajes (para rate limiting)
CREATE TABLE IF NOT EXISTS chat_usage_daily (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    session_token VARCHAR(255),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    messages_sent INTEGER DEFAULT 0,
    UNIQUE NULLS NOT DISTINCT (user_id, date),
    UNIQUE NULLS NOT DISTINCT (session_token, date)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_token ON chat_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_usage_user_date ON chat_usage_daily(user_id, date);
CREATE INDEX IF NOT EXISTS idx_chat_usage_token_date ON chat_usage_daily(session_token, date);

-- ══════════════════════════════════════════════════════════
-- ITINERARIO SEMANAL
-- ══════════════════════════════════════════════════════════

-- 6. Tareas del itinerario
CREATE TABLE IF NOT EXISTS itinerary_tasks (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    type            VARCHAR(20) NOT NULL DEFAULT 'work'
                        CHECK (type IN ('work', 'personal', 'urgent')),
    task_date       DATE NOT NULL,
    task_time       TIME,                                   -- NULL = sin hora específica
    completed       BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at    TIMESTAMP WITH TIME ZONE,               -- auditoría: cuándo fue completada
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Notificaciones de tareas del día
CREATE TABLE IF NOT EXISTS itinerary_notifications (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    task_id     INTEGER NOT NULL REFERENCES itinerary_tasks(id) ON DELETE CASCADE,
    seen        BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    seen_at     TIMESTAMP WITH TIME ZONE,
    UNIQUE (user_id, task_id)   -- una notificación por tarea por usuario
);

-- Índices para performance del itinerario
CREATE INDEX IF NOT EXISTS idx_tasks_user_date  ON itinerary_tasks(user_id, task_date);
CREATE INDEX IF NOT EXISTS idx_tasks_date_time  ON itinerary_tasks(task_date, task_time);
CREATE INDEX IF NOT EXISTS idx_tasks_completed  ON itinerary_tasks(user_id, completed);
CREATE INDEX IF NOT EXISTS idx_notif_user_seen  ON itinerary_notifications(user_id, seen);

-- Función para auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger en itinerary_tasks
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_itinerary_tasks_updated_at'
    ) THEN
        CREATE TRIGGER trg_itinerary_tasks_updated_at
        BEFORE UPDATE ON itinerary_tasks
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;




-- ══════════════════════════════════════════════════════════
-- ANALYTICS
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS analytics_events (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255),
    event_category VARCHAR(100) NOT NULL,
    event_label VARCHAR(255),
    event_value NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_category ON analytics_events(event_category);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);


-- ==========================================
-- 4. ACTIVITY LOGS (Registro de Acciones)
-- ==========================================
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    icon_type VARCHAR(50) NOT NULL,
    label VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);



-- ==========================================
-- 5. SYSTEM SETTINGS (Configuraci�n Global)
-- ==========================================
CREATE TABLE IF NOT EXISTS system_settings (
    id INT PRIMARY KEY DEFAULT 1,
    currency VARCHAR(10) DEFAULT 'COP',
    language VARCHAR(10) DEFAULT 'es',
    time_format VARCHAR(10) DEFAULT '12h',
    email_reminders BOOLEAN DEFAULT false,
    feedback_loop BOOLEAN DEFAULT false,
    overdue_alerts BOOLEAN DEFAULT true,
    chatbot_name VARCHAR(255) DEFAULT 'Rotbot',
    assistant_personality VARCHAR(50) DEFAULT 'formal',
    maintenance_mode BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



-- ==========================================
-- 6. CONTACT MESSAGES (Formulario de Contacto)
-- ==========================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'unread',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono VARCHAR(20);
