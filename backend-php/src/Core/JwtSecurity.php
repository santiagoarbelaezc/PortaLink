<?php

namespace App\Core;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;
use Firebase\JWT\BeforeValidException;
use Exception;
use RuntimeException;
use UnexpectedValueException;
use stdClass;

/**
 * Gestor Centralizado de Seguridad JWT (RFC 7519 / RFC 7515)
 *
 * Garantiza la integridad y validación estricta de las 3 partes del token:
 *  1. HEADER (Cabecera): alg=HS256, typ=JWT, kid=portalink-hs256-v2
 *  2. PAYLOAD (Cuerpo): iss, aud, sub, iat, nbf, exp, jti + claims de identidad
 *  3. SIGNATURE (Firma): HMAC-SHA256 con clave derivada HKDF de 256 bits (64 bytes hex)
 */
class JwtSecurity
{
    public const ALGORITHM = 'HS256';
    public const TOKEN_TYPE = 'JWT';
    public const KEY_ID = 'portalink-hs256-v2';
    public const ISSUER = 'portalink-api';
    public const AUDIENCE = 'portalink-client';
    public const DEFAULT_TTL = 86400; // 24 horas en segundos
    public const MAX_TOKEN_LENGTH = 4096;
    public const CLOCK_LEEWAY = 5; // 5 segundos de tolerancia NTP

    /**
     * Obtiene el secreto base configurado en el entorno y verifica que exista.
     */
    private static function getRawSecret(): string
    {
        $secret = $_ENV['JWT_SECRET'] ?? $_SERVER['JWT_SECRET'] ?? getenv('JWT_SECRET');
        if (!is_string($secret) || trim($secret) === '') {
            throw new RuntimeException('Error crítico de seguridad: JWT_SECRET no está configurado en el servidor.');
        }
        return trim($secret);
    }

    /**
     * Deriva una llave criptográfica de 512 bits (64 caracteres hex / 256 bits de entropía)
     * mediante HKDF-SHA256 (RFC 5869) a partir del JWT_SECRET del entorno.
     * Esto garantiza que la llave cumpla siempre el tamaño mínimo exigido por RFC 7518 Sección 3.2 para HS256.
     */
    private static function getDerivedSigningKey(string $rawSecret): string
    {
        return hash_hkdf(
            'sha256',
            $rawSecret,
            64,
            'portalink-jwt-signing-key-v2',
            'portalink-hmac-sha256-salt'
        );
    }

    /**
     * Emite un nuevo token JWT firmado con Cabecera, Payload RFC 7519 completo y Firma HMAC-SHA256.
     *
     * @param array $user Datos del usuario autenticado (id, rol, email, telefono)
     * @param int   $ttl  Tiempo de vida en segundos (por defecto 24h)
     * @return array{token: string, payload: array, header: array, expires_in: int}
     */
    public static function issueToken(array $user, int $ttl = self::DEFAULT_TTL): array
    {
        $rawSecret = self::getRawSecret();
        $signingKey = self::getDerivedSigningKey($rawSecret);

        $userId = (int)($user['id'] ?? 0);
        if ($userId <= 0) {
            throw new UnexpectedValueException('No se puede emitir un JWT para un ID de usuario inválido.');
        }

        $now = time();
        $exp = $now + max(60, $ttl);
        $jti = bin2hex(random_bytes(16)); // 128 bits de entropía única por token

        $rol = strtolower(trim((string)($user['rol'] ?? 'usuario')));
        if (!in_array($rol, ['admin', 'administrador', 'usuario'], true)) {
            $rol = 'usuario';
        }

        // 1. CABECERA (Header) explícita según RFC 7515 / RFC 7519
        $header = [
            'alg' => self::ALGORITHM,
            'typ' => self::TOKEN_TYPE,
            'kid' => self::KEY_ID,
        ];

        // 2. PAYLOAD (Registered Claims RFC 7519 + Private Application Claims)
        $payload = [
            // Claims estándar RFC 7519
            'iss'      => self::ISSUER,
            'aud'      => self::AUDIENCE,
            'sub'      => (string)$userId,
            'iat'      => $now,
            'nbf'      => $now,
            'exp'      => $exp,
            'jti'      => $jti,
            // Claims de aplicación (compatibles con Angular AuthService y Controladores)
            'id'       => $userId,
            'rol'      => $rol,
            'email'    => strtolower(trim((string)($user['email'] ?? ''))),
            'telefono' => trim((string)($user['telefono'] ?? '')),
        ];

        // 3. FIRMA (Signature) HMAC-SHA256 sobre base64url(header).base64url(payload)
        $token = JWT::encode($payload, $signingKey, self::ALGORITHM, self::KEY_ID, $header);

        return [
            'token'      => $token,
            'header'     => $header,
            'payload'    => $payload,
            'expires_in' => $exp - $now,
        ];
    }

    /**
     * Extrae el token Bearer de la petición HTTP de forma segura.
     */
    public static function extractBearerToken(Request $request): ?string
    {
        $authHeader = $request->getHeader('authorization');

        // Respaldo adicional para entornos Apache / LiteSpeed / CGI / FastCGI
        if (!$authHeader) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION']
                ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
                ?? null;
        }

        if (!$authHeader || !is_string($authHeader)) {
            return null;
        }

        $authHeader = trim($authHeader);
        if (!preg_match('/^Bearer\s+(\S+)$/i', $authHeader, $matches)) {
            return null;
        }

        return $matches[1];
    }

    /**
     * Verifica y decodifica un token JWT validando estrictamente:
     *  - Estructura de 3 partes Base64URL (Header.Payload.Signature)
     *  - Cabecera (alg === HS256, typ === JWT, prevención de alg=none)
     *  - Firma criptográfica HMAC-SHA256 en tiempo constante (hash_equals)
     *  - Claims temporales (exp, iat, nbf) y de identidad (iss, aud, sub, id, rol)
     *
     * @param string $token Token JWT en bruto
     * @return stdClass Objeto con los claims validados del payload
     * @throws Exception Si cualquiera de las validaciones falla
     */
    public static function verifyToken(string $token): stdClass
    {
        $token = trim($token);

        // 1. Control de longitud y formato estructural (3 segmentos Base64URL)
        if ($token === '' || strlen($token) > self::MAX_TOKEN_LENGTH) {
            throw new UnexpectedValueException('Longitud de token JWT inválida.');
        }

        if (!preg_match('/^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/', $token)) {
            throw new UnexpectedValueException('Formato estructural de JWT inválido (debe contener cabecera, payload y firma).');
        }

        $segments = explode('.', $token);
        if (count($segments) !== 3) {
            throw new UnexpectedValueException('El token JWT debe contener exactamente 3 segmentos.');
        }

        [$headB64, $payloadB64, $sigB64] = $segments;
        if ($headB64 === '' || $payloadB64 === '' || $sigB64 === '') {
            throw new UnexpectedValueException('Uno de los segmentos del JWT (cabecera, payload o firma) está vacío.');
        }

        // 2. Pre-inspección estricta de la CABECERA (Header) antes de procesar la firma
        $rawHeaderJson = JWT::urlsafeB64Decode($headB64);
        $preHeader = json_decode($rawHeaderJson, false);

        if (!$preHeader instanceof stdClass) {
            throw new UnexpectedValueException('La cabecera (Header) del JWT no es un objeto JSON válido.');
        }

        // Prevención absoluta contra ataques "alg: none" o confusión de algoritmo
        $headerAlg = isset($preHeader->alg) && is_string($preHeader->alg) ? $preHeader->alg : '';
        if (!hash_equals(self::ALGORITHM, $headerAlg)) {
            throw new UnexpectedValueException('Algoritmo de firma en cabecera JWT no permitido o inseguro.');
        }

        $headerTyp = isset($preHeader->typ) && is_string($preHeader->typ) ? strtoupper($preHeader->typ) : '';
        if ($headerTyp !== '' && !hash_equals(self::TOKEN_TYPE, $headerTyp)) {
            throw new UnexpectedValueException('Tipo de cabecera (typ) inválido en el JWT.');
        }

        // 3. Selección de llave de verificación y validación de FIRMA (Signature)
        $rawSecret = self::getRawSecret();
        $isV2Key = isset($preHeader->kid) && is_string($preHeader->kid) && hash_equals(self::KEY_ID, $preHeader->kid);
        $verificationKey = $isV2Key ? self::getDerivedSigningKey($rawSecret) : $rawSecret;

        JWT::$leeway = self::CLOCK_LEEWAY;
        $decodedHeaders = new stdClass();

        $decoded = JWT::decode($token, new Key($verificationKey, self::ALGORITHM), $decodedHeaders);

        // 4. Validación post-decodificación de los Claims del PAYLOAD
        if (!isset($decoded->exp) || !is_numeric($decoded->exp)) {
            throw new ExpiredException('El payload del JWT no contiene fecha de expiración (exp) válida.');
        }

        $now = time();
        if ((int)$decoded->exp <= ($now - self::CLOCK_LEEWAY)) {
            throw new ExpiredException('El token JWT ha expirado.');
        }

        if (isset($decoded->iat) && is_numeric($decoded->iat) && (int)$decoded->iat > ($now + self::CLOCK_LEEWAY + 60)) {
            throw new BeforeValidException('El token JWT tiene una fecha de emisión (iat) futura inválida.');
        }

        // Validar emisor (iss) y audiencia (aud) si están presentes o si es un token v2
        if ($isV2Key || isset($decoded->iss)) {
            if (!isset($decoded->iss) || !is_string($decoded->iss) || !hash_equals(self::ISSUER, $decoded->iss)) {
                throw new UnexpectedValueException('Emisor (iss) del JWT inválido.');
            }
        }

        if ($isV2Key || isset($decoded->aud)) {
            if (!isset($decoded->aud) || !is_string($decoded->aud) || !hash_equals(self::AUDIENCE, $decoded->aud)) {
                throw new UnexpectedValueException('Audiencia (aud) del JWT inválida.');
            }
        }

        // Resolver ID de usuario desde 'id' o 'sub'
        $userId = isset($decoded->id) ? (int)$decoded->id : (isset($decoded->sub) ? (int)$decoded->sub : 0);
        if ($userId <= 0) {
            throw new UnexpectedValueException('El payload del JWT no contiene un identificador de usuario válido.');
        }
        $decoded->id = $userId;
        $decoded->sub = (string)$userId;

        if ($isV2Key) {
            if (empty($decoded->jti) || !is_string($decoded->jti) || !preg_match('/^[a-f0-9]{32}$/', $decoded->jti)) {
                throw new UnexpectedValueException('Identificador único de token (jti) inválido.');
            }
        }

        if (empty($decoded->rol) || !is_string($decoded->rol)) {
            throw new UnexpectedValueException('El payload del JWT no contiene un rol de usuario válido.');
        }

        // Adjuntar metadatos de cabecera verificada para inspección si se requiere
        $decoded->_jwt_header = [
            'alg' => $decodedHeaders->alg ?? self::ALGORITHM,
            'typ' => $decodedHeaders->typ ?? self::TOKEN_TYPE,
            'kid' => $decodedHeaders->kid ?? 'legacy',
        ];

        return $decoded;
    }

    /**
     * Verifica si un identificador único de token (jti) ha sido revocado explícitamente (ej. en logout).
     */
    public static function isTokenRevoked(?string $jti): bool
    {
        if (empty($jti)) {
            return false;
        }

        try {
            $stmt = Database::query(
                'SELECT 1 FROM jwt_revoked_tokens WHERE jti = $1 AND expires_at > NOW() LIMIT 1',
                [$jti]
            );
            return (bool)$stmt->fetchColumn();
        } catch (Exception) {
            return false;
        }
    }

    /**
     * Revoca un token JWT activo almacenando su jti hasta su fecha de expiración natural.
     */
    public static function revokeToken(stdClass $decoded): void
    {
        $jti = isset($decoded->jti) && is_string($decoded->jti) ? $decoded->jti : '';
        if ($jti === '') {
            return;
        }

        $exp = isset($decoded->exp) && is_numeric($decoded->exp)
            ? (int)$decoded->exp
            : (time() + self::DEFAULT_TTL);

        $userId = isset($decoded->id) ? (int)$decoded->id : 0;

        try {
            Database::query('DELETE FROM jwt_revoked_tokens WHERE expires_at <= NOW()');
            Database::query(
                'INSERT INTO jwt_revoked_tokens (jti, user_id, expires_at) VALUES ($1, $2, $3)',
                [$jti, $userId, date('Y-m-d H:i:s', $exp)]
            );
        } catch (Exception $e) {
            error_log('[JwtSecurity] Aviso al revocar token: ' . $e->getMessage());
        }
    }
}
