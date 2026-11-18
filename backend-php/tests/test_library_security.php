<?php

/**
 * Suite de Pruebas de Seguridad para Biblioteca (VaultCrypto AES-256-GCM, DLP Redactor y Rutas JWT)
 */

require_once __DIR__ . '/../src/Core/VaultCrypto.php';

use App\Core\VaultCrypto;

$_ENV['JWT_SECRET'] = 'test_master_secret_key_for_vault_crypto_2026_high_entropy_99887766';

$passed = 0;
$failed = 0;

function assertSec(bool $condition, string $label): void
{
    global $passed, $failed;
    if ($condition) {
        echo "  [PASS] {$label}\n";
        $passed++;
    } else {
        echo "  [FAIL] {$label}\n";
        $failed++;
    }
}

echo "=== 1. PRUEBAS DE CIFRADO AUTENTICADO AES-256-GCM (EN REPOSO) ===\n";

$sampleEnvNote = <<<ENV
### TITULO: Credenciales de Producción (.env)
```env
DB_HOST=srv1660.hstgr.io
DB_USER=u123456_admin
DB_PASS="SuperSecretPassword2026!#$"
JWT_SECRET=a8f9d0e1c2b3a4f5e6d7c8b9a0f1e2d3c4b5a6f7
GEMINI_API_KEY=AIzaSyD1234567890abcdefghijklmnopqrstuvwx
GROQ_API_KEY=gsk_1234567890abcdefghijklmnopqrstuvwxyzABCD
DATABASE_URL=mysql://root:MiClaveSecreta99@127.0.0.1:3306/portalink
```
ENV;

$encrypted1 = VaultCrypto::encryptContent($sampleEnvNote);
$encrypted2 = VaultCrypto::encryptContent($sampleEnvNote);

assertSec(VaultCrypto::isEncrypted($encrypted1), 'El contenido cifrado tiene el prefijo ENCv1:');
assertSec(!str_contains($encrypted1, 'SuperSecretPassword2026'), 'El ciphertext NO expone la contraseña en texto plano');
assertSec(!str_contains($encrypted1, 'AIzaSyD1234567890'), 'El ciphertext NO expone la API key de Gemini en texto plano');
assertSec($encrypted1 !== $encrypted2, 'Dos cifrados del mismo .env generan ciphertexts distintos (IV aleatorio de 96 bits)');

$decrypted = VaultCrypto::decryptContent($encrypted1);
assertSec($decrypted === $sampleEnvNote, 'El descifrado recupera el 100% del apunte .env original sin pérdida');

// Idempotencia y retrocompatibilidad
assertSec(VaultCrypto::encryptContent($encrypted1) === $encrypted1, 'encryptContent es idempotente si el texto ya está cifrado');
assertSec(VaultCrypto::decryptContent('Texto plano antiguo') === 'Texto plano antiguo', 'decryptContent soporta notas antiguas en texto plano');

// Prueba de manipulación (Tampering)
$parts = explode(':', $encrypted1);
$tamperedCipher = $parts[0] . ':' . $parts[1] . ':' . $parts[2] . ':' . substr($parts[3], 0, -2) . 'AA';
$tamperDetected = false;
try {
    VaultCrypto::decryptContent($tamperedCipher);
} catch (RuntimeException $e) {
    $tamperDetected = true;
}
assertSec($tamperDetected, 'AES-256-GCM detecta y bloquea cualquier alteración de 1 byte en la base de datos');

echo "\n=== 2. PRUEBAS DE ENMASCARAMIENTO DLP HACIA PROVEEDORES DE IA ===\n";

$redactedForAi = VaultCrypto::redactSecretsForAi($sampleEnvNote . "\nSELECT id, nombre FROM usuarios WHERE verified = 1;");

assertSec(!str_contains($redactedForAi, 'SuperSecretPassword2026'), 'Redactor oculta DB_PASS antes de enviar a Gemini/Groq');
assertSec(!str_contains($redactedForAi, 'a8f9d0e1c2b3a4f5e6d7c8b9a0f1e2d3c4b5a6f7'), 'Redactor oculta JWT_SECRET antes de enviar a Gemini/Groq');
assertSec(!str_contains($redactedForAi, 'AIzaSyD1234567890'), 'Redactor oculta GEMINI_API_KEY antes de enviar a Gemini/Groq');
assertSec(!str_contains($redactedForAi, 'gsk_1234567890'), 'Redactor oculta GROQ_API_KEY antes de enviar a Gemini/Groq');
assertSec(!str_contains($redactedForAi, 'MiClaveSecreta99'), 'Redactor oculta contraseña en DATABASE_URL mysql://...');
assertSec(str_contains($redactedForAi, 'SELECT id, nombre FROM usuarios WHERE verified = 1;'), 'Redactor preserva consultas SQL de estudio intactas');

echo "\n=== 3. AUDITORÍA DE RUTAS PROTEGIDAS EN INDEX.PHP ===\n";

$indexContent = file_get_contents(__DIR__ . '/../index.php');
preg_match_all('/\$router->(?:get|post|put|patch|delete)\(\'\/api\/library\/[^\']+\'.*?\);/', $indexContent, $libRoutes);
assertSec(count($libRoutes[0]) === 15, 'Existen las 15 rutas de /api/library/* registradas');

$allLibProtected = true;
foreach ($libRoutes[0] as $routeLine) {
    if (!str_contains($routeLine, 'AuthMiddleware::class') || str_contains($routeLine, 'OptionalAuthMiddleware')) {
        $allLibProtected = false;
        echo "  [!] Ruta desprotegida: {$routeLine}\n";
    }
}
assertSec($allLibProtected, 'Las 15 rutas de /api/library/* exigen AuthMiddleware::class estricto');

preg_match_all('/\$router->(?:get|post|put|patch|delete)\(\'\/api\/command-center\/[^\']+\'.*?\);/', $indexContent, $ccRoutes);
$allCcProtected = count($ccRoutes[0]) === 6;
foreach ($ccRoutes[0] as $routeLine) {
    if (!str_contains($routeLine, 'AuthMiddleware::class') || str_contains($routeLine, 'OptionalAuthMiddleware')) {
        $allCcProtected = false;
    }
}
assertSec($allCcProtected, 'Las 6 rutas de /api/command-center/* exigen AuthMiddleware::class estricto');

echo "\n==================================================\n";
echo "RESULTADO FINAL: {$passed} PASARON, {$failed} FALLARON\n";
echo "==================================================\n";

exit($failed > 0 ? 1 : 0);
