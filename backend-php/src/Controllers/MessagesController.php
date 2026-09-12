<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use Exception;

class MessagesController
{
    private static bool $tableEnsured = false;

    private function ensureMessagesTable(): void
    {
        // Ya creado por schema_mysql.sql
    }

    public function sendMessage(Request $request, Response $response): void
    {
        $name = trim($request->body['name'] ?? $request->body['nombre'] ?? '');
        $email = trim($request->body['email'] ?? $request->body['correo'] ?? '');
        $subject = trim($request->body['subject'] ?? $request->body['asunto'] ?? 'Contacto desde PortaLink Web');
        $message = trim($request->body['message'] ?? $request->body['mensaje'] ?? '');

        if (!$name || !$email || !$message) {
            $response->status(400)->json([
                'ok' => false,
                'message' => 'Por favor completa todos los campos obligatorios'
            ]);
            return;
        }

        if (mb_strlen($name) < 2) {
            $response->status(400)->json([
                'ok' => false,
                'message' => 'El nombre debe tener al menos 2 caracteres'
            ]);
            return;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $response->status(400)->json([
                'ok' => false,
                'message' => 'El formato del correo electrónico es inválido'
            ]);
            return;
        }

        $domain = strtolower(substr(strrchr($email, "@"), 1));
        $allowedDomains = ['gmail.com', 'hotmail.com', 'hotmail.es', 'outlook.com', 'outlook.es', 'yahoo.com', 'yahoo.es', 'icloud.com', 'live.com'];
        if (!in_array($domain, $allowedDomains, true)) {
            $response->status(400)->json([
                'ok' => false,
                'message' => 'Solo se admiten correos con dominios válidos (@gmail.com, @hotmail.com, @outlook.com, etc.)'
            ]);
            return;
        }

        if (mb_strlen($message) < 10) {
            $response->status(400)->json([
                'ok' => false,
                'message' => 'El mensaje debe tener al menos 10 caracteres'
            ]);
            return;
        }

        try {
            $this->ensureMessagesTable();
            $stmt = Database::query(
                "INSERT INTO contact_messages (name, email, subject, message, status) 
                 VALUES ($1, $2, $3, $4, 'UNREAD')",
                [$name, $email, $subject, $message]
            );

            $response->status(201)->json([
                'ok' => true,
                'message' => 'Mensaje enviado correctamente'
            ]);
        } catch (Exception $err) {
            error_log('[Messages] sendMessage error: ' . $err->getMessage());
            $response->status(500)->json([
                'ok' => false,
                'message' => 'Error al enviar el mensaje'
            ]);
        }
    }

    public function getMessages(Request $request, Response $response): void
    {
        try {
            $user = $request->user;
            if (!$user || strtolower($user->rol ?? '') !== 'admin') {
                $response->status(403)->json(['ok' => false, 'message' => 'Acceso denegado. Se requieren permisos de administrador.']);
                return;
            }

            $this->ensureMessagesTable();
            $stmt = Database::query("SELECT * FROM contact_messages ORDER BY created_at DESC");
            $response->json($stmt->fetchAll());
        } catch (Exception $err) {
            error_log('[Messages] getMessages error: ' . $err->getMessage());
            $response->status(500)->json([]);
        }
    }

    public function updateStatus(Request $request, Response $response): void
    {
        try {
            $user = $request->user;
            if (!$user || strtolower($user->rol ?? '') !== 'admin') {
                $response->status(403)->json(['ok' => false, 'message' => 'Acceso denegado']);
                return;
            }

            $id = (int)($request->params['id'] ?? 0);
            $status = $request->body['status'] ?? null;

            if (!$status || !in_array($status, ['UNREAD', 'READ', 'RESPONDED', 'ARCHIVED'])) {
                $response->status(400)->json(['ok' => false, 'message' => 'Estado inválido']);
                return;
            }

            $this->ensureMessagesTable();
            $stmt = Database::query(
                "UPDATE contact_messages SET status = $1 WHERE id = $2 RETURNING *",
                [$status, $id]
            );
            $msg = $stmt->fetch();

            if (!$msg) {
                $response->status(404)->json(['ok' => false, 'message' => 'Mensaje no encontrado']);
                return;
            }

            $response->json([
                'ok' => true,
                'message' => 'Estado actualizado',
                'data' => $msg
            ]);
        } catch (Exception $err) {
            error_log('[Messages] updateStatus error: ' . $err->getMessage());
            $response->status(500)->json([
                'ok' => false,
                'message' => 'Error al actualizar el mensaje'
            ]);
        }
    }

    public function deleteMessage(Request $request, Response $response): void
    {
        try {
            $user = $request->user;
            if (!$user || strtolower($user->rol ?? '') !== 'admin') {
                $response->status(403)->json(['ok' => false, 'message' => 'Acceso denegado']);
                return;
            }

            $id = (int)($request->params['id'] ?? 0);
            $this->ensureMessagesTable();
            $stmt = Database::query("DELETE FROM contact_messages WHERE id = $1 RETURNING id", [$id]);

            if (!$stmt->fetch()) {
                $response->status(404)->json(['ok' => false, 'message' => 'Mensaje no encontrado']);
                return;
            }

            $response->json([
                'ok' => true,
                'message' => 'Mensaje eliminado'
            ]);
        } catch (Exception $err) {
            error_log('[Messages] deleteMessage error: ' . $err->getMessage());
            $response->status(500)->json([
                'ok' => false,
                'message' => 'Error al eliminar el mensaje'
            ]);
        }
    }
}
