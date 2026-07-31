<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Config\Mailer;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;

class AuthController
{
    private static bool $schemaEnsured = false;

    private static function ensureAuthSchema(): void
    {
        if (self::$schemaEnsured) return;
        try {
            Database::query("
                CREATE TABLE IF NOT EXISTS usuarios (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  nombre VARCHAR(255) NOT NULL,
                  email VARCHAR(255) NOT NULL UNIQUE,
                  password VARCHAR(255) NOT NULL,
                  telefono VARCHAR(50) NULL,
                  rol VARCHAR(50) DEFAULT 'usuario',
                  verified TINYINT(1) DEFAULT 1,
                  avatar VARCHAR(500) NULL,
                  bio TEXT NULL,
                  reset_token VARCHAR(255) NULL,
                  reset_token_expires DATETIME NULL,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");
            Database::query("
                CREATE TABLE IF NOT EXISTS email_verifications (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  user_id INT NOT NULL,
                  token VARCHAR(255) NOT NULL,
                  expires_at DATETIME NOT NULL,
                  used TINYINT(1) DEFAULT 0,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  INDEX (user_id),
                  INDEX (token),
                  CONSTRAINT fk_email_verif_usuario FOREIGN KEY (user_id) REFERENCES usuarios (id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");
            self::$schemaEnsured = true;
        } catch (Exception $err) {
            error_log('[AuthController] Error ensuring schema: ' . $err->getMessage());
        }
    }

    private function generateCaptcha(): array
    {
        $characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        $text = '';
        $len = strlen($characters);
        for ($i = 0; $i < 5; $i++) {
            $text .= $characters[random_int(0, $len - 1)];
        }

        $width = 150;
        $height = 50;
        $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' . $width . '" height="' . $height . '" viewBox="0 0 ' . $width . ' ' . $height . '">';
        
        // Fondo oscuro traslúcido
        $svg .= '<rect width="100%" height="100%" fill="#0a0a0a" rx="8" />';
        
        // Líneas de ruido de fondo
        for ($i = 0; $i < 6; $i++) {
            $x1 = random_int(0, $width);
            $y1 = random_int(0, $height);
            $x2 = random_int(0, $width);
            $y2 = random_int(0, $height);
            $svg .= '<line x1="' . $x1 . '" y1="' . $y1 . '" x2="' . $x2 . '" y2="' . $y2 . '" stroke="#00b4d8" stroke-width="1.5" opacity="0.3"/>';
        }
        
        $fonts = ['Arial', 'Courier New', 'Georgia', 'Impact', 'Trebuchet MS', 'Verdana'];
        for ($i = 0; $i < strlen($text); $i++) {
            $char = $text[$i];
            $fontSize = 24 + random_int(0, 6);
            $angle = -20 + random_int(0, 40);
            $x = 15 + $i * 25 + random_int(0, 4);
            $y = 32 + random_int(0, 5);
            $font = $fonts[random_int(0, count($fonts) - 1)];
            $underline = random_int(0, 1) === 1 ? 'text-decoration="underline"' : '';
            
            $svg .= '<text x="' . $x . '" y="' . $y . '" font-family="' . $font . '" font-size="' . $fontSize . '" font-weight="black" fill="#ffffff" transform="rotate(' . $angle . ', ' . $x . ', ' . $y . ')" ' . $underline . ' opacity="0.95">' . $char . '</text>';
        }
        
        // Puntos de ruido en el frente
        for ($i = 0; $i < 35; $i++) {
            $cx = random_int(0, $width);
            $cy = random_int(0, $height);
            $svg .= '<circle cx="' . $cx . '" cy="' . $cy . '" r="1" fill="#00b4d8" opacity="0.6"/>';
        }
        
        $svg .= '</svg>';
        return ['text' => $text, 'svg' => $svg];
    }

    public function login(Request $request, Response $response): void
    {
        self::ensureAuthSchema();
        $email = $request->body['email'] ?? null;
        $password = $request->body['password'] ?? null;

        if (!$email || !$password) {
            $response->status(400)->json(['message' => 'Todos los campos son obligatorios']);
            return;
        }

        try {
            $stmt = Database::query('SELECT * FROM usuarios WHERE email = $1', [$email]);
            $usuario = $stmt->fetch();

            if (!$usuario || !password_verify($password, $usuario['password'])) {
                $response->status(401)->json(['message' => 'Credenciales inválidas']);
                return;
            }

            if (isset($usuario['verified']) && ((int)$usuario['verified'] === 0 || $usuario['verified'] === false || $usuario['verified'] === '0')) {
                $response->status(403)->json(['message' => 'Tu cuenta aún no está verificada. Revisa tu correo electrónico para verificar tu cuenta.']);
                return;
            }

            $secret = $_ENV['JWT_SECRET'] ?? getenv('JWT_SECRET');
            $payload = [
                'id' => $usuario['id'],
                'rol' => $usuario['rol'],
                'email' => $usuario['email'],
                'telefono' => $usuario['telefono'],
                'exp' => time() + (8 * 3600)
            ];

            $token = JWT::encode($payload, $secret, 'HS256');

            $response->json([
                'token' => $token,
                'usuario' => [
                    'nombre' => $usuario['nombre'],
                    'rol' => $usuario['rol'],
                    'email' => $usuario['email'],
                    'telefono' => $usuario['telefono']
                ]
            ]);
        } catch (Exception $e) {
            error_log("Error en login: " . $e->getMessage());
            $response->status(500)->json(['message' => 'Error en el servidor']);
        }
    }

    public function getCaptcha(Request $request, Response $response): void
    {
        try {
            Database::query('DELETE FROM captchas WHERE expires_at < NOW()');

            $captchaData = $this->generateCaptcha();
            $text = $captchaData['text'];
            $svg = $captchaData['svg'];

            $captchaId = bin2hex(random_bytes(16));
            $expiresAt = date('Y-m-d H:i:s', time() + 300);
            $hashedCode = password_hash(strtolower(trim($text)), PASSWORD_BCRYPT);

            Database::query(
                'INSERT INTO captchas (id, codigo, expires_at) VALUES ($1, $2, $3)',
                [$captchaId, $hashedCode, $expiresAt]
            );

            $response->json([
                'id' => $captchaId,
                'svg' => $svg
            ]);
        } catch (Exception $e) {
            error_log('Error al generar captcha: ' . $e->getMessage());
            $response->status(500)->json(['message' => 'Error al generar el captcha de seguridad']);
        }
    }

    public function register(Request $request, Response $response): void
    {
        $nombre = $request->body['nombre'] ?? null;
        $email = $request->body['email'] ?? null;
        $password = $request->body['password'] ?? null;
        $telefono = $request->body['telefono'] ?? null;
        $captchaId = $request->body['captchaId'] ?? null;
        $captchaCode = $request->body['captchaCode'] ?? null;

        if (!$nombre || !$email || !$password || !$telefono || !$captchaId || !$captchaCode) {
            $response->status(400)->json(['message' => 'Todos los campos son obligatorios']);
            return;
        }

        try {
            Database::query('DELETE FROM captchas WHERE expires_at < NOW()');
            $stmt = Database::query('SELECT * FROM captchas WHERE id = $1', [$captchaId]);
            $captchaRecord = $stmt->fetch();

            if (!$captchaRecord) {
                $response->status(400)->json(['message' => 'El captcha ha expirado o es inválido']);
                return;
            }

            Database::query('DELETE FROM captchas WHERE id = $1', [$captchaId]);

            if (!password_verify(strtolower(trim($captchaCode)), $captchaRecord['codigo'])) {
                $response->status(400)->json(['message' => 'El código captcha ingresado es incorrecto']);
                return;
            }

            $userCheck = Database::query('SELECT * FROM usuarios WHERE email = $1', [$email]);
            if ($userCheck->fetch()) {
                $response->status(400)->json(['message' => 'El correo electrónico ya está registrado']);
                return;
            }

            self::ensureAuthSchema();
            $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
            Database::query(
                'INSERT INTO usuarios (nombre, email, password, telefono, rol, verified) VALUES ($1, $2, $3, $4, $5, 0)',
                [$nombre, $email, $hashedPassword, $telefono, 'usuario']
            );
            $nuevoUsuarioId = (int)Database::getConnection()->lastInsertId();

            $verificationToken = bin2hex(random_bytes(32));
            $expiresAt = date('Y-m-d H:i:s', time() + (24 * 3600));

            Database::query(
                'INSERT INTO email_verifications (user_id, token, expires_at) VALUES ($1, $2, $3)',
                [$nuevoUsuarioId, $verificationToken, $expiresAt]
            );

            try {
                Mailer::sendVerificationEmail($email, $nombre, $verificationToken);
            } catch (Exception $mailErr) {
                error_log('Error al enviar correo de verificación: ' . $mailErr->getMessage());
            }

            $response->status(201)->json([
                'message' => 'Registro exitoso. Revisa tu correo electrónico para verificar tu cuenta.',
                'requireVerification' => true
            ]);
        } catch (Exception $e) {
            error_log('Error en registro: ' . $e->getMessage());
            $response->status(500)->json(['message' => 'Error en el servidor al intentar registrarse']);
        }
    }

    public function getUsers(Request $request, Response $response): void
    {
        $authHeader = $request->getHeader('authorization');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            $response->status(401)->json(['message' => 'No autorizado']);
            return;
        }

        $token = substr($authHeader, 7);
        $secret = $_ENV['JWT_SECRET'] ?? getenv('JWT_SECRET');

        try {
            $decoded = JWT::decode($token, new Key($secret, 'HS256'));
            if ($decoded->rol !== 'admin') {
                $response->status(403)->json(['message' => 'Acceso denegado']);
                return;
            }

            $stmt = Database::query('SELECT id, nombre, email, rol, created_at FROM usuarios ORDER BY id ASC');
            $response->json($stmt->fetchAll());
        } catch (Exception $e) {
            error_log('Error al obtener usuarios: ' . $e->getMessage());
            $response->status(401)->json(['message' => 'Sesión inválida o expirada']);
        }
    }

    public function updatePassword(Request $request, Response $response): void
    {
        $currentPassword = $request->body['currentPassword'] ?? null;
        $newPassword = $request->body['newPassword'] ?? null;
        $userId = $request->user->id ?? null;

        if (!$currentPassword || !$newPassword || !$userId) {
            $response->status(400)->json(['message' => 'Datos incompletos para actualizar contraseña']);
            return;
        }

        try {
            $stmt = Database::query('SELECT * FROM usuarios WHERE id = $1', [$userId]);
            $user = $stmt->fetch();

            if (!$user) {
                $response->status(404)->json(['message' => 'Usuario no encontrado']);
                return;
            }

            if (!password_verify($currentPassword, $user['password'])) {
                $response->status(401)->json(['message' => 'La contraseña actual es incorrecta']);
                return;
            }

            $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
            Database::query('UPDATE usuarios SET password = $1 WHERE id = $2', [$hashedPassword, $userId]);

            $response->json(['message' => 'Contraseña actualizada exitosamente']);
        } catch (Exception $e) {
            error_log('Error al actualizar contraseña: ' . $e->getMessage());
            $response->status(500)->json(['message' => 'Error en el servidor al actualizar la contraseña']);
        }
    }

    public function updateProfile(Request $request, Response $response): void
    {
        $nombre = $request->body['nombre'] ?? null;
        $email = $request->body['email'] ?? null;
        $telefono = $request->body['telefono'] ?? null;
        $userId = $request->user->id ?? null;

        if (!$nombre || !$email || !$telefono || !$userId) {
            $response->status(400)->json(['message' => 'Nombre, correo y teléfono son obligatorios']);
            return;
        }

        try {
            $cleanedEmail = strtolower(trim($email));
            if (!str_contains($cleanedEmail, '@')) {
                $response->status(400)->json(['message' => 'El correo electrónico debe contener un "@"']);
                return;
            }

            $allowedDomains = '/@(gmail|hotmail|outlook|live|msn|yahoo|icloud|protonmail|proton|aol|zoho|gmx|yandex)\.[a-zA-Z]{2,}/i';
            if (!preg_match($allowedDomains, $cleanedEmail)) {
                $response->status(400)->json(['message' => 'El proveedor de correo no es válido o común']);
                return;
            }

            $cleanedPhone = trim($telefono);
            if (!preg_match('/^[0-9+() -]{7,15}$/', $cleanedPhone)) {
                $response->status(400)->json(['message' => 'El número de teléfono debe tener entre 7 y 15 dígitos numéricos']);
                return;
            }

            $stmtCheck = Database::query('SELECT id FROM usuarios WHERE email = $1 AND id <> $2', [$cleanedEmail, $userId]);
            if ($stmtCheck->fetch()) {
                $response->status(400)->json(['message' => 'El correo electrónico ingresado ya pertenece a otra cuenta']);
                return;
            }

            $stmtUpdate = Database::query(
                'UPDATE usuarios SET nombre = $1, email = $2, telefono = $3 WHERE id = $4 RETURNING id, nombre, email, telefono, rol',
                [trim($nombre), $cleanedEmail, $cleanedPhone, $userId]
            );
            $updatedUser = $stmtUpdate->fetch();

            $secret = $_ENV['JWT_SECRET'] ?? getenv('JWT_SECRET');
            $payload = [
                'id' => $updatedUser['id'],
                'rol' => $updatedUser['rol'],
                'email' => $updatedUser['email'],
                'telefono' => $updatedUser['telefono'],
                'exp' => time() + (8 * 3600)
            ];
            $token = JWT::encode($payload, $secret, 'HS256');

            $response->json([
                'message' => 'Perfil actualizado exitosamente',
                'token' => $token,
                'usuario' => [
                    'nombre' => $updatedUser['nombre'],
                    'rol' => $updatedUser['rol'],
                    'email' => $updatedUser['email'],
                    'telefono' => $updatedUser['telefono']
                ]
            ]);
        } catch (Exception $e) {
            error_log('Error al actualizar perfil: ' . $e->getMessage());
            $response->status(500)->json(['message' => 'Error en el servidor al actualizar el perfil']);
        }
    }

    public function verifyEmail(Request $request, Response $response): void
    {
        self::ensureAuthSchema();
        $token = $request->query['token'] ?? null;
        if (!$token) {
            $response->status(400)->json(['message' => 'Token de verificación faltante']);
            return;
        }

        try {
            $stmt = Database::query('SELECT * FROM email_verifications WHERE token = $1', [$token]);
            $verification = $stmt->fetch();

            if (!$verification) {
                $response->status(400)->json(['message' => 'El enlace de verificación es inválido o no existe.']);
                return;
            }

            if (!empty($verification['used'])) {
                $response->status(400)->json(['message' => 'Este correo ya fue verificado previamente.']);
                return;
            }

            if (strtotime($verification['expires_at']) < time()) {
                $response->status(400)->json(['message' => 'El enlace de verificación ha expirado.']);
                return;
            }

            Database::query('UPDATE usuarios SET verified = true WHERE id = $1', [$verification['user_id']]);
            Database::query('UPDATE email_verifications SET used = true WHERE id = $1', [$verification['id']]);

            $response->json(['message' => '¡Cuenta verificada exitosamente! Ya puedes iniciar sesión.']);
        } catch (Exception $e) {
            error_log('Error al verificar email: ' . $e->getMessage());
            $response->status(500)->json(['message' => 'Error al procesar la verificación del correo']);
        }
    }

    public function forgotPassword(Request $request, Response $response): void
    {
        $email = $request->body['email'] ?? null;
        if (!$email) {
            $response->status(400)->json(['message' => 'Por favor ingresa tu correo electrónico']);
            return;
        }

        try {
            $cleanedEmail = strtolower(trim($email));
            $stmt = Database::query('SELECT * FROM usuarios WHERE email = $1', [$cleanedEmail]);
            $user = $stmt->fetch();

            if (!$user) {
                $response->json(['message' => 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña en minutos.']);
                return;
            }

            $resetToken = bin2hex(random_bytes(32));
            $expiresAt = date('Y-m-d H:i:s', time() + 3600);

            Database::query(
                'INSERT INTO password_resets (email, token, expires_at) VALUES ($1, $2, $3)',
                [$user['email'], $resetToken, $expiresAt]
            );

            try {
                Mailer::sendPasswordResetEmail($user['email'], $user['nombre'], $resetToken);
            } catch (Exception $mailErr) {
                error_log('Error al enviar correo de recuperación: ' . $mailErr->getMessage());
                $response->status(500)->json(['message' => 'No pudimos enviar el correo en este momento. Inténtalo de nuevo más tarde.']);
                return;
            }

            $response->json(['message' => 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña en minutos.']);
        } catch (Exception $e) {
            error_log('Error en forgotPassword: ' . $e->getMessage());
            $response->status(500)->json(['message' => 'Error al procesar la solicitud de recuperación']);
        }
    }

    public function resetPassword(Request $request, Response $response): void
    {
        $token = $request->body['token'] ?? null;
        $newPassword = $request->body['newPassword'] ?? null;

        if (!$token || !$newPassword) {
            $response->status(400)->json(['message' => 'Datos incompletos para restablecer la contraseña']);
            return;
        }

        if (strlen($newPassword) < 6) {
            $response->status(400)->json(['message' => 'La nueva contraseña debe tener al menos 6 caracteres']);
            return;
        }

        try {
            $stmt = Database::query('SELECT * FROM password_resets WHERE token = $1', [$token]);
            $resetRecord = $stmt->fetch();

            if (!$resetRecord) {
                $response->status(400)->json(['message' => 'El enlace de recuperación es inválido.']);
                return;
            }

            if (!empty($resetRecord['used'])) {
                $response->status(400)->json(['message' => 'Este enlace ya fue utilizado para cambiar la contraseña.']);
                return;
            }

            if (strtotime($resetRecord['expires_at']) < time()) {
                $response->status(400)->json(['message' => 'El enlace de recuperación ha expirado.']);
                return;
            }

            $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
            Database::query('UPDATE usuarios SET password = $1 WHERE email = $2', [$hashedPassword, $resetRecord['email']]);
            Database::query('UPDATE password_resets SET used = true WHERE id = $1', [$resetRecord['id']]);

            $response->json(['message' => '¡Contraseña actualizada con éxito! Ya puedes iniciar sesión con tu nueva contraseña.']);
        } catch (Exception $e) {
            error_log('Error al restablecer contraseña: ' . $e->getMessage());
            $response->status(500)->json(['message' => 'Error al restablecer la contraseña']);
        }
    }

    public function updateUserRole(Request $request, Response $response): void
    {
        try {
            if (!$request->user || strtolower($request->user->rol ?? '') !== 'admin') {
                $response->status(403)->json(['message' => 'No tienes permisos de administrador']);
                return;
            }

            $targetId = (int)($request->params['id'] ?? 0);
            if ($targetId === (int)($request->user->id ?? 0)) {
                $response->status(400)->json(['message' => 'No puedes cambiar tu propio rol']);
                return;
            }

            $rol = $request->body['rol'] ?? 'usuario';
            $newRol = strtolower($rol) === 'admin' ? 'admin' : 'usuario';

            Database::query('UPDATE usuarios SET rol = $1 WHERE id = $2', [$newRol, $targetId]);
            $stmt = Database::query('SELECT id, nombre, email, rol FROM usuarios WHERE id = $1', [$targetId]);
            $user = $stmt->fetch();

            if (!$user) {
                $response->status(404)->json(['message' => 'Usuario no encontrado']);
                return;
            }

            $response->json(['message' => 'Rol actualizado correctamente', 'user' => $user]);
        } catch (Exception $e) {
            error_log('Error al actualizar rol: ' . $e->getMessage());
            $response->status(500)->json(['message' => 'Error en el servidor al cambiar rol']);
        }
    }

    public function deleteUser(Request $request, Response $response): void
    {
        try {
            if (!$request->user || strtolower($request->user->rol ?? '') !== 'admin') {
                $response->status(403)->json(['message' => 'No tienes permisos de administrador']);
                return;
            }

            $targetId = (int)($request->params['id'] ?? 0);
            if ($targetId <= 0) {
                $response->status(400)->json(['message' => 'ID de usuario inválido']);
                return;
            }

            if ($targetId === (int)($request->user->id ?? 0)) {
                $response->status(400)->json(['message' => 'No puedes eliminar tu propia cuenta de administrador']);
                return;
            }

            $pdo = Database::getConnection();
            $pdo->beginTransaction();

            // Verificar si el usuario existe antes de eliminar
            $stmtCheck = $pdo->prepare('SELECT id FROM usuarios WHERE id = ?');
            $stmtCheck->execute([$targetId]);
            if (!$stmtCheck->fetch()) {
                $pdo->rollBack();
                $response->status(404)->json(['message' => 'Usuario no encontrado']);
                return;
            }

            // Eliminar registros secundarios o relacionados en otras tablas para evitar errores de clave foránea en MySQL
            $tablesToClean = [
                'email_verifications',
                'user_sites',
                'finance_clients',
                'finance_services',
                'finance_invoices',
                'itinerary_tasks',
                'itinerary_notifications',
                'chat_sessions',
                'messages',
                'system_activity_logs'
            ];
            foreach ($tablesToClean as $tbl) {
                try {
                    $pdo->exec("DELETE FROM `{$tbl}` WHERE user_id = " . (int)$targetId);
                } catch (Exception $ex) {
                    // Si la tabla no existe o no tiene columna user_id en esta instalación, ignoramos el error
                }
            }

            // Ahora eliminar de la tabla usuarios
            $stmtDel = $pdo->prepare('DELETE FROM usuarios WHERE id = ?');
            $stmtDel->execute([$targetId]);

            $pdo->commit();
            $response->json(['message' => 'Usuario eliminado exitosamente']);
        } catch (Exception $e) {
            if (isset($pdo) && $pdo->inTransaction()) {
                $pdo->rollBack();
            }
            error_log('Error al eliminar usuario: ' . $e->getMessage());
            $response->status(500)->json(['message' => 'Error en el servidor al eliminar el usuario']);
        }
    }
}
