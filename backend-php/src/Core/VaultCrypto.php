<?php

namespace App\Core;

use RuntimeException;

/**
 * VaultCrypto — Cifrado Autenticado en Reposo (AES-256-GCM) y Prevención de Fuga de Secretos (DLP)
 *
 * 1. Protege el contenido de apuntes (incluyendo archivos .env, contraseñas y llaves) en la base de datos
 *    mediante AES-256-GCM con subclaves derivadas por HKDF-SHA256 (RFC 5869).
 * 2. Enmascara automáticamente secretos (.env, API keys, tokens JWT, claves privadas y contraseñas)
 *    antes de transmitir cualquier contexto a proveedores externos de IA (Gemini / Groq).
 */
class VaultCrypto
{
    public const CIPHER_ALGO = 'aes-256-gcm';
    public const PREFIX = 'ENCv1:';
    public const IV_LENGTH = 12;  // 96 bits recomendados por NIST SP 800-38D para GCM
    public const TAG_LENGTH = 16; // 128 bits de etiqueta de autenticación GCM

    /**
     * Obtiene el secreto maestro del servidor desde el entorno.
     */
    private static function getMasterSecret(): string
    {
        $secret = $_ENV['LIBRARY_VAULT_KEY']
            ?? $_SERVER['LIBRARY_VAULT_KEY']
            ?? getenv('LIBRARY_VAULT_KEY')
            ?: ($_ENV['JWT_SECRET'] ?? $_SERVER['JWT_SECRET'] ?? getenv('JWT_SECRET'));

        if (!is_string($secret) || trim($secret) === '') {
            throw new RuntimeException('Error crítico de seguridad: No se encontró clave maestra (JWT_SECRET / LIBRARY_VAULT_KEY) para el cifrado de la biblioteca.');
        }

        return trim($secret);
    }

    /**
     * Deriva una clave binaria de 256 bits (32 bytes) exclusiva para el cifrado de apuntes
     * usando HKDF-SHA256 (aislada criptográficamente de la clave de firma JWT).
     */
    private static function getEncryptionKey(): string
    {
        return hash_hkdf(
            'sha256',
            self::getMasterSecret(),
            32,
            'portalink-library-vault-aes256gcm-v1',
            'portalink-vault-salt-2026'
        );
    }

    /**
     * Determina si una cadena ya se encuentra cifrada con el formato ENCv1.
     */
    public static function isEncrypted(?string $value): bool
    {
        if (!is_string($value) || $value === '') {
            return false;
        }
        return str_starts_with($value, self::PREFIX);
    }

    /**
     * Cifra el contenido de un apunte mediante AES-256-GCM.
     * Formato de salida: ENCv1:<base64_iv>:<base64_tag>:<base64_ciphertext>
     */
    public static function encryptContent(?string $plaintext): string
    {
        if ($plaintext === null || $plaintext === '') {
            return '';
        }

        if (self::isEncrypted($plaintext)) {
            return $plaintext;
        }

        $key = self::getEncryptionKey();
        $iv = random_bytes(self::IV_LENGTH);
        $tag = '';

        $ciphertext = openssl_encrypt(
            $plaintext,
            self::CIPHER_ALGO,
            $key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag,
            '',
            self::TAG_LENGTH
        );

        if ($ciphertext === false || strlen($tag) !== self::TAG_LENGTH) {
            throw new RuntimeException('Error al cifrar el contenido con AES-256-GCM.');
        }

        return self::PREFIX
            . base64_encode($iv) . ':'
            . base64_encode($tag) . ':'
            . base64_encode($ciphertext);
    }

    /**
     * Descifra y verifica la autenticidad del contenido almacenado en base de datos.
     * Si el contenido proviene de una versión previa en texto plano, lo devuelve de forma compatible.
     */
    public static function decryptContent(?string $stored): string
    {
        if ($stored === null || $stored === '') {
            return '';
        }

        if (!self::isEncrypted($stored)) {
            return $stored;
        }

        $payload = substr($stored, strlen(self::PREFIX));
        $parts = explode(':', $payload, 3);
        if (count($parts) !== 3) {
            throw new RuntimeException('Formato de paquete cifrado ENCv1 inválido.');
        }

        [$ivB64, $tagB64, $cipherB64] = $parts;
        $iv = base64_decode($ivB64, true);
        $tag = base64_decode($tagB64, true);
        $ciphertext = base64_decode($cipherB64, true);

        if ($iv === false || $tag === false || $ciphertext === false
            || strlen($iv) !== self::IV_LENGTH
            || strlen($tag) !== self::TAG_LENGTH) {
            throw new RuntimeException('Metadatos criptográficos corruptos en el apunte.');
        }

        $key = self::getEncryptionKey();
        $decrypted = openssl_decrypt(
            $ciphertext,
            self::CIPHER_ALGO,
            $key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );

        if ($decrypted === false) {
            throw new RuntimeException('Fallo de autenticación GCM: el contenido cifrado o la llave no coinciden.');
        }

        return $decrypted;
    }

    /**
     * Sanitiza y enmascara credenciales (.env, contraseñas, API keys, tokens JWT y llaves privadas)
     * antes de enviar texto a APIs externas de IA (Google Gemini, Groq, etc.).
     */
    public static function redactSecretsForAi(?string $text): string
    {
        if ($text === null || $text === '') {
            return '';
        }

        $redacted = $text;

        // 1. Claves privadas PEM / SSH (RSA, EC, OPENSSH, PRIVATE KEY)
        $redacted = preg_replace(
            '/-----BEGIN [A-Z0-9\s]*PRIVATE KEY-----[\s\S]*?-----END [A-Z0-9\s]*PRIVATE KEY-----/i',
            '[PRIVATE_KEY_REDACTED]',
            $redacted
        );

        // 2. Variables estilo .env y asignaciones de configuración con nombres sensibles
        $envSecretPattern = '/\b([A-Z0-9_]*(?:PASS|PASSWORD|PWD|SECRET|KEY|TOKEN|AUTH|CREDENTIAL|PRIVATE|HASH|SALT|DSN|CLOUDINARY_URL|DATABASE_URL|SMTP_PASS)[A-Z0-9_]*)\s*([:=])\s*("[^"\r\n]*"|\'[^\'\r\n]*\'|[^\s#"\'\r\n]+)/i';
        $redacted = preg_replace_callback($envSecretPattern, function (array $m) {
            $varName = $m[1];
            $sep = $m[2];
            $val = trim($m[3]);
            if ($val === '' || $val === 'null' || $val === '""' || $val === "''" || str_contains($val, '[SECRET_REDACTED]')) {
                return $m[0];
            }
            return "{$varName}{$sep}[SECRET_REDACTED]";
        }, $redacted);

        // 3. URLs de conexión con usuario:contraseña@host (MySQL, Postgres, MongoDB, Redis, Cloudinary, etc.)
        $redacted = preg_replace(
            '/((?:mysql|pgsql|postgres|postgresql|mongodb(?:\+srv)?|redis|rediss|amqp|ftp|sftp|cloudinary):\/\/[^:\s\/]+:)([^@\s\/]+)(@)/i',
            '$1[SECRET_REDACTED]$3',
            $redacted
        );

        // 4. Tokens JWT (Header.Payload.Signature)
        $redacted = preg_replace(
            '/\beyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{16,}\b/',
            '[JWT_TOKEN_REDACTED]',
            $redacted
        );

        // 5. Patrones estándar de API Keys (OpenAI sk-, Groq gsk_, Google AIza, GitHub ghp_/github_pat_, Slack xox, AWS AKIA)
        $redacted = preg_replace(
            '/\b(?:sk-[A-Za-z0-9_-]{20,}|gsk_[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{30,}|gh[pousr]_[A-Za-z0-9]{25,}|github_pat_[A-Za-z0-9_]{25,}|xox[baprs]-[A-Za-z0-9-]{15,})\b/',
            '[API_KEY_REDACTED]',
            $redacted
        );

        return $redacted;
    }
}
