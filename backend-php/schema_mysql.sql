-- ============================================================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS Y TABLAS PARA PORTALINK (MYSQL / MARIADB)
-- Servidor Hostinger: u941842000_portalink
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- 1. Tabla: usuarios
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `telefono` VARCHAR(50) NULL,
  `rol` VARCHAR(50) DEFAULT 'user',
  `verified` TINYINT(1) DEFAULT 1,
  `reset_token` VARCHAR(255) NULL,
  `reset_token_expires` DATETIME NULL,
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 1.1 Tabla: email_verifications
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `email_verifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `used` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (`user_id`),
  INDEX (`token`),
  CONSTRAINT `fk_email_verif_usuario` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. Tabla: captchas
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `captchas` (
  `id` VARCHAR(100) PRIMARY KEY,
  `codigo` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  INDEX (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. Tabla: user_sites
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_sites` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNIQUE NOT NULL,
  `site_data` JSON NULL,
  `slug` VARCHAR(255) UNIQUE NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_user_sites_usuario` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. Tabla: chat_sessions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `chat_sessions` (
  `id` VARCHAR(100) PRIMARY KEY,
  `user_id` INT NULL,
  `session_token` VARCHAR(255) NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `chat_mode` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (`user_id`, `is_active`),
  INDEX (`session_token`),
  CONSTRAINT `fk_chat_sessions_usuario` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. Tabla: chat_messages
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `session_id` VARCHAR(100) NOT NULL,
  `role` VARCHAR(50) NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (`session_id`),
  CONSTRAINT `fk_chat_messages_session` FOREIGN KEY (`session_id`) REFERENCES `chat_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. Tabla: chat_usage_daily
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `chat_usage_daily` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `session_token` VARCHAR(255) NULL,
  `ip_address` VARCHAR(100) NULL,
  `usage_date` DATE NOT NULL,
  `message_count` INT DEFAULT 1,
  UNIQUE KEY `uniq_user_date` (`user_id`, `usage_date`),
  UNIQUE KEY `uniq_ip_date` (`ip_address`, `usage_date`),
  INDEX (`session_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. Tabla: finance_clients
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `finance_clients` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NULL,
  `phone` VARCHAR(100) NULL,
  `company` VARCHAR(255) NULL,
  `tax_id` VARCHAR(100) NULL,
  `address` TEXT NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (`user_id`),
  CONSTRAINT `fk_finance_clients_usuario` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. Tabla: finance_services
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `finance_services` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `price` DECIMAL(15, 2) DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (`user_id`),
  CONSTRAINT `fk_finance_services_usuario` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 9. Tabla: finance_invoices
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `finance_invoices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `client_id` INT NULL,
  `invoice_number` VARCHAR(100) NOT NULL,
  `title` VARCHAR(255) NULL,
  `issue_date` DATE NULL,
  `due_date` DATE NULL,
  `status` VARCHAR(50) DEFAULT 'DRAFT',
  `subtotal` DECIMAL(15, 2) DEFAULT 0.00,
  `tax_amount` DECIMAL(15, 2) DEFAULT 0.00,
  `total_amount` DECIMAL(15, 2) DEFAULT 0.00,
  `notes` TEXT NULL,
  `paid_at` DATETIME NULL,
  `payment_method` VARCHAR(100) NULL,
  `payment_notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (`user_id`),
  INDEX (`client_id`),
  CONSTRAINT `fk_finance_invoices_usuario` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_finance_invoices_client` FOREIGN KEY (`client_id`) REFERENCES `finance_clients` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 10. Tabla: finance_invoice_items
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `finance_invoice_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `invoice_id` INT NOT NULL,
  `service_id` INT NULL,
  `description` TEXT NULL,
  `quantity` DECIMAL(10, 2) DEFAULT 1.00,
  `unit_price` DECIMAL(15, 2) DEFAULT 0.00,
  `total_price` DECIMAL(15, 2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 10.1 Tabla: finance_invoice_payments (Abonos Parciales)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `finance_invoice_payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `invoice_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `payment_date` DATE NOT NULL,
  `payment_method` VARCHAR(100) NOT NULL,
  `notes` TEXT NULL,
  `transaction_id` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (`invoice_id`),
  INDEX (`user_id`),
  CONSTRAINT `fk_inv_payments_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `finance_invoices` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_inv_payments_usuario` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 10.1 Tabla: finance_transactions (Control Financiero)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `finance_transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `type` VARCHAR(20) NOT NULL DEFAULT 'INGRESO',
  `concept` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `client_id` INT NULL,
  `amount_cop` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `amount_usd` DECIMAL(15, 2) NULL DEFAULT 0.00,
  `currency` VARCHAR(10) DEFAULT 'COP',
  `transaction_date` DATE NOT NULL,
  `status` VARCHAR(50) DEFAULT 'COMPLETADO',
  `payment_method` VARCHAR(100) NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (`user_id`),
  INDEX (`transaction_date`),
  INDEX (`type`),
  CONSTRAINT `fk_finance_tx_usuario` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_finance_tx_client` FOREIGN KEY (`client_id`) REFERENCES `finance_clients` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 11. Tabla: itinerary_tasks
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `itinerary_tasks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `type` VARCHAR(50) DEFAULT 'general',
  `task_date` DATE NOT NULL,
  `task_time` TIME NULL,
  `status` VARCHAR(50) DEFAULT 'pending',
  `completed` TINYINT(1) DEFAULT 0,
  `completed_at` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (`user_id`),
  INDEX (`task_date`),
  CONSTRAINT `fk_itinerary_tasks_usuario` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 12. Tabla: itinerary_notifications
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `itinerary_notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `task_id` INT NULL,
  `type` VARCHAR(100) DEFAULT 'reminder',
  `title` VARCHAR(255) NULL,
  `message` TEXT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `seen` TINYINT(1) DEFAULT 0,
  `seen_at` DATETIME NULL,
  `sent_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (`user_id`),
  CONSTRAINT `fk_itinerary_notif_usuario` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_itinerary_notif_task` FOREIGN KEY (`task_id`) REFERENCES `itinerary_tasks` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 13. Tabla: analytics_events
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `analytics_events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `session_id` VARCHAR(100) NULL,
  `event_category` VARCHAR(100) NOT NULL,
  `event_label` VARCHAR(255) NULL,
  `event_value` VARCHAR(100) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (`event_category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 14. Tabla: system_activity_logs
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `system_activity_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `action` VARCHAR(255) NOT NULL,
  `details` JSON NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (`user_id`),
  CONSTRAINT `fk_activity_logs_usuario` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 15. Tabla: system_settings
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(100) UNIQUE NOT NULL,
  `value` TEXT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 16. Tabla: contact_messages
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `status` VARCHAR(50) DEFAULT 'UNREAD',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- ----------------------------------------------------------------------------
-- 17. Tabla: notebook_folders (Carpetas de Área de Estudio)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notebook_folders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `color` VARCHAR(50) NOT NULL DEFAULT '#2563eb',
  `icon` VARCHAR(50) NOT NULL DEFAULT 'folder',
  `order_index` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (`user_id`),
  CONSTRAINT `fk_notebook_folder_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 18. Tabla: notebook_modules (Cuadernos / Módulos de Estudio)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notebook_modules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `folder_id` INT NOT NULL,
  `user_id` INT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `color` VARCHAR(50) NOT NULL DEFAULT '#3b82f6',
  `icon` VARCHAR(50) NOT NULL DEFAULT 'book',
  `is_favorite` TINYINT(1) NOT NULL DEFAULT 0,
  `order_index` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (`folder_id`),
  INDEX (`user_id`),
  CONSTRAINT `fk_notebook_module_folder` FOREIGN KEY (`folder_id`) REFERENCES `notebook_folders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notebook_module_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 19. Tabla: notebook_pages (Apuntes / Lecciones de Estudio)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notebook_pages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `notebook_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NULL,
  `content` LONGTEXT NULL,
  `tags` VARCHAR(255) NULL,
  `is_pinned` TINYINT(1) NOT NULL DEFAULT 0,
  `order_index` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (`notebook_id`),
  CONSTRAINT `fk_notebook_page_notebook` FOREIGN KEY (`notebook_id`) REFERENCES `notebook_modules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
