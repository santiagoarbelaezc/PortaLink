<?php

require_once __DIR__ . '/../vendor/autoload.php';

use App\Core\JwtSecurity;
use App\Core\Request;
use Firebase\JWT\JWT;

$_ENV['JWT_SECRET'] = 'test_ultra_secret_portalink_key_2026';

$passed = 0;
$failed = 0;

function assertTest(bool $condition, string $name): void
{
    global $passed, $failed;
    if ($condition) {
        echo "  ✅ PASS: {$name}\n";
        $passed++;
    } else {
        echo "  ❌ FAIL: {$name}\n";
        $failed++;
    }
}

echo "==============================================================\n";
echo "  SUITE DE PRUEBAS DE SEGURIDAD JWT (CABECERA, PAYLOAD, FIRMA)\n";
echo "==============================================================\n\n";

// 1. Emisión de token y verificación de estructura de 3 segmentos
$sampleUser = [
    'id'       => 42,
    'nombre'   => 'Santiago Arbeláez',
    'rol'      => 'admin',
    'email'    => 'Santiago@PortaLink.com ',
    'telefono' => '+57 3001234567'
];

$issued = JwtSecurity::issueToken($sampleUser, 3600);
$token = $issued['token'];
$parts = explode('.', $token);

assertTest(count($parts) === 3, 'El JWT emitido consta de exactamente 3 segmentos (Header.Payload.Signature)');

// 2. Inspección de la CABECERA (Header)
$rawHeader = json_decode(JWT::urlsafeB64Decode($parts[0]), true);
assertTest(is_array($rawHeader), 'El segmento 1 (Header) es un JSON válido codificado en Base64URL');
assertTest(($rawHeader['alg'] ?? '') === 'HS256', 'Header incluye alg = HS256');
assertTest(($rawHeader['typ'] ?? '') === 'JWT', 'Header incluye typ = JWT');
assertTest(($rawHeader['kid'] ?? '') === 'portalink-hs256-v2', 'Header incluye kid = portalink-hs256-v2');

// 3. Inspección del PAYLOAD (Claims RFC 7519 + Identidad)
$rawPayload = json_decode(JWT::urlsafeB64Decode($parts[1]), true);
assertTest(is_array($rawPayload), 'El segmento 2 (Payload) es un JSON válido codificado en Base64URL');
assertTest(($rawPayload['iss'] ?? '') === 'portalink-api', 'Payload incluye claim estándar iss (Issuer)');
assertTest(($rawPayload['aud'] ?? '') === 'portalink-client', 'Payload incluye claim estándar aud (Audience)');
assertTest(($rawPayload['sub'] ?? '') === '42', 'Payload incluye claim estándar sub (Subject)');
assertTest(isset($rawPayload['iat']) && is_int($rawPayload['iat']), 'Payload incluye claim estándar iat (Issued At)');
assertTest(isset($rawPayload['nbf']) && is_int($rawPayload['nbf']), 'Payload incluye claim estándar nbf (Not Before)');
assertTest(isset($rawPayload['exp']) && ($rawPayload['exp'] - $rawPayload['iat']) === 3600, 'Payload incluye claim estándar exp exacto');
assertTest(isset($rawPayload['jti']) && preg_match('/^[a-f0-9]{32}$/', $rawPayload['jti']) === 1, 'Payload incluye jti criptográfico único de 128 bits');
assertTest(($rawPayload['id'] ?? 0) === 42, 'Payload incluye id numérico del usuario');
assertTest(($rawPayload['rol'] ?? '') === 'admin', 'Payload incluye rol normalizado');
assertTest(($rawPayload['email'] ?? '') === 'santiago@portalink.com', 'Payload incluye email normalizado en minúsculas');

// 4. Inspección de la FIRMA (Signature)
$rawSig = JWT::urlsafeB64Decode($parts[2]);
assertTest(strlen($rawSig) === 32, 'El segmento 3 (Signature) tiene exactamente 32 bytes (256 bits HMAC-SHA256)');

// 5. Decodificación y verificación completa
$decoded = JwtSecurity::verifyToken($token);
assertTest((int)$decoded->id === 42 && $decoded->rol === 'admin', 'JwtSecurity::verifyToken valida firma, cabecera y payload correctamente');

// 6. Prueba contra ataque "alg: none"
$noneHeader = JWT::urlsafeB64Encode(json_encode(['alg' => 'none', 'typ' => 'JWT']));
$forgedNoneToken = $noneHeader . '.' . $parts[1] . '.' . $parts[2];
$algNoneRejected = false;
try {
    JwtSecurity::verifyToken($forgedNoneToken);
} catch (Exception) {
    $algNoneRejected = true;
}
assertTest($algNoneRejected, 'Bloquea ataque alg="none" en la cabecera');

// 7. Prueba contra manipulación del Payload (Escalación de privilegios usuario -> admin)
$tamperedPayloadData = $rawPayload;
$tamperedPayloadData['rol'] = 'admin';
$tamperedPayloadData['id'] = 1;
$tamperedPayloadB64 = JWT::urlsafeB64Encode(json_encode($tamperedPayloadData));
$tamperedToken = $parts[0] . '.' . $tamperedPayloadB64 . '.' . $parts[2];
$tamperedRejected = false;
try {
    JwtSecurity::verifyToken($tamperedToken);
} catch (Exception) {
    $tamperedRejected = true;
}
assertTest($tamperedRejected, 'Bloquea alteración de Payload sin firma válida (escalación de rol/id)');

// 8. Prueba contra alteración de 1 carácter en la Firma
$corruptedSig = substr($parts[2], 0, -2) . (substr($parts[2], -2) === 'AA' ? 'BB' : 'AA');
$corruptedSigToken = $parts[0] . '.' . $parts[1] . '.' . $corruptedSig;
$sigRejected = false;
try {
    JwtSecurity::verifyToken($corruptedSigToken);
} catch (Exception) {
    $sigRejected = true;
}
assertTest($sigRejected, 'Bloquea token con firma alterada en 1 byte');

// 9. Prueba contra firma vacía (header.payload.)
$emptySigRejected = false;
try {
    JwtSecurity::verifyToken($parts[0] . '.' . $parts[1] . '.');
} catch (Exception) {
    $emptySigRejected = true;
}
assertTest($emptySigRejected, 'Bloquea token sin firma (segmento 3 vacío)');

// 10. Prueba contra token firmado con otra clave secreta
$wrongSecretToken = JWT::encode($rawPayload, 'clave_atacante_falsa_1234567890', 'HS256', 'portalink-hs256-v2');
$wrongKeyRejected = false;
try {
    JwtSecurity::verifyToken($wrongSecretToken);
} catch (Exception) {
    $wrongKeyRejected = true;
}
assertTest($wrongKeyRejected, 'Bloquea token firmado con clave secreta distinta');

// 11. Prueba de expiración (exp vencido)
$expiredToken = JWT::encode(
    array_merge($rawPayload, ['iat' => time() - 7200, 'nbf' => time() - 7200, 'exp' => time() - 3600]),
    hash_hkdf('sha256', $_ENV['JWT_SECRET'], 64, 'portalink-jwt-signing-key-v2', 'portalink-hmac-sha256-salt'),
    'HS256',
    'portalink-hs256-v2'
);
$expiredRejected = false;
try {
    JwtSecurity::verifyToken($expiredToken);
} catch (Exception) {
    $expiredRejected = true;
}
assertTest($expiredRejected, 'Bloquea token expirado (exp en el pasado)');

// 12. Prueba de emisor (iss) inválido
$badIssToken = JWT::encode(
    array_merge($rawPayload, ['iss' => 'atacante-api']),
    hash_hkdf('sha256', $_ENV['JWT_SECRET'], 64, 'portalink-jwt-signing-key-v2', 'portalink-hmac-sha256-salt'),
    'HS256',
    'portalink-hs256-v2'
);
$badIssRejected = false;
try {
    JwtSecurity::verifyToken($badIssToken);
} catch (Exception) {
    $badIssRejected = true;
}
assertTest($badIssRejected, 'Bloquea token con emisor (iss) no autorizado');

// 13. Prueba de extracción de Bearer Token desde cabeceras HTTP
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . $token;
$req = new Request();
$extracted = JwtSecurity::extractBearerToken($req);
assertTest($extracted === $token, 'Extrae correctamente el token Bearer desde HTTP_AUTHORIZATION');

echo "\n==============================================================\n";
echo "  RESULTADO: {$passed} pasaron, {$failed} fallaron\n";
echo "==============================================================\n";

exit($failed > 0 ? 1 : 0);
