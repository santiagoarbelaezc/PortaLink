<?php
/**
 * Test Suite: Groq Failover & Optimización
 * Verifica: rotación de keys, timeouts, max_tokens global y endpoint /api/robot/chat
 */

require_once __DIR__ . '/../vendor/autoload.php';

// Cargar .env manualmente
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) continue;
        [$key, $val] = explode('=', $line, 2);
        $val = trim($val, " \t\n\r\0\x0B'\"");
        $_ENV[trim($key)] = $val;
        putenv(trim($key) . '=' . $val);
    }
}

use App\Config\Groq;

// Helpers de output
function ok(string $msg): void   { echo "\033[32m  PASS\033[0m  {$msg}\n"; }
function fail(string $msg): void  { echo "\033[31m  FAIL\033[0m  {$msg}\n"; }
function info(string $msg): void  { echo "\033[36m  INFO\033[0m  {$msg}\n"; }
function section(string $title): void {
    echo "\n\033[1;33m==============================================\033[0m\n";
    echo "\033[1;33m  {$title}\033[0m\n";
    echo "\033[1;33m==============================================\033[0m\n";
}

$passed = 0;
$failed = 0;

// TEST 1: Variables de entorno
section("TEST 1 - Variables de entorno");
$keysToCheck = [
    'GROQ_API_KEY_PRIMARY', 'GROQ_API_KEY_COPILOT',
    'GROQ_API_KEY_FALLBACK', 'GROQ_API_KEY_2', 'GROQ_MAX_TOKENS'
];
foreach ($keysToCheck as $key) {
    $val = $_ENV[$key] ?? '';
    if (!empty($val)) {
        $display = strlen($val) > 12 ? substr($val, 0, 6) . '...' . substr($val, -4) : $val;
        ok("{$key} = {$display}");
        $passed++;
    } else {
        fail("{$key} no esta configurada en .env");
        $failed++;
    }
}
$maxTokens = (int)($_ENV['GROQ_MAX_TOKENS'] ?? 0);
if ($maxTokens === 8192) {
    ok("GROQ_MAX_TOKENS = 8192 (limite ampliado correctamente)");
    $passed++;
} else {
    fail("GROQ_MAX_TOKENS = {$maxTokens} (esperado: 8192)");
    $failed++;
}

// TEST 2: Pool de keys
section("TEST 2 - Pool de API Keys (unicidad)");
$rawKeys = array_values(array_unique(array_filter([
    $_ENV['GROQ_API_KEY_CODE_CHECK']  ?? '',
    $_ENV['GROQ_API_KEY_PRIMARY']     ?? '',
    $_ENV['GROQ_API_KEY_COPILOT']     ?? '',
    $_ENV['GROQ_API_KEY']             ?? '',
    $_ENV['GROQ_API_KEY_1']           ?? '',
    $_ENV['GROQ_API_KEY_2']           ?? '',
    $_ENV['GROQ_API_KEY_FALLBACK']    ?? '',
    $_ENV['GROQ_API_KEY_3']           ?? '',
])));
$uniqueCount = count($rawKeys);
info("Keys unicas detectadas en el pool: {$uniqueCount}");
foreach ($rawKeys as $i => $k) {
    info("  Key " . ($i+1) . ": ..." . substr($k, -6));
}
if ($uniqueCount >= 3) {
    ok("Pool tiene {$uniqueCount} keys distintas - rotacion activa");
    $passed++;
} elseif ($uniqueCount === 2) {
    fail("Solo 2 keys distintas - revisar duplicados en .env");
    $failed++;
} else {
    fail("Solo {$uniqueCount} key(s) - rotacion insuficiente");
    $failed++;
}

// TEST 3: Llamada real a Groq
section("TEST 3 - Llamada real a Groq (velocidad + contenido)");
$messages = [
    ['role' => 'system', 'content' => 'You are a test assistant. Reply with exactly one sentence.'],
    ['role' => 'user',   'content' => 'Say "Groq test OK" and nothing else.']
];
$start = microtime(true);
try {
    $result = Groq::callGroq($messages, ['temperature' => 0.1]);
    $elapsed = round((microtime(true) - $start) * 1000);
    if (!empty($result['content'])) {
        ok("Respuesta recibida en {$elapsed}ms: \"" . substr($result['content'], 0, 60) . "\"");
        ok("Modelo: " . ($result['model'] ?? 'desconocido'));
        ok("Tokens: " . ($result['tokens'] ?? 0));
        $passed += 3;
    } else {
        fail("Respuesta vacia de Groq");
        $failed++;
    }
    if ($elapsed < 8000) {
        ok("Latencia OK ({$elapsed}ms < 8000ms)");
        $passed++;
    } else {
        fail("Latencia alta ({$elapsed}ms) - posible cuello de botella");
        $failed++;
    }
} catch (Throwable $e) {
    $elapsed = round((microtime(true) - $start) * 1000);
    fail("Groq::callGroq fallo ({$elapsed}ms): " . $e->getMessage());
    $failed++;
}

// TEST 4: Failover con key invalida
section("TEST 4 - Failover rapido desde key invalida");
$start = microtime(true);
try {
    $result = Groq::callGroq($messages, [
        'api_key'     => 'gsk_INVALID_KEY_THAT_WILL_FAIL_NOW',
        'temperature' => 0.1
    ]);
    $elapsed = round((microtime(true) - $start) * 1000);
    if (!empty($result['content'])) {
        ok("Failover exitoso desde key invalida en {$elapsed}ms - rotacion funciono");
        $passed++;
        if ($elapsed < 15000) {
            ok("Tiempo de failover rapido ({$elapsed}ms < 15s)");
            $passed++;
        } else {
            fail("Failover demasiado lento: {$elapsed}ms (revisar timeout)");
            $failed++;
        }
    } else {
        fail("Failover completo pero sin contenido ({$elapsed}ms)");
        $failed++;
    }
} catch (Throwable $e) {
    $elapsed = round((microtime(true) - $start) * 1000);
    fail("Failover fallo despues de {$elapsed}ms: " . $e->getMessage());
    $failed++;
}

// TEST 5: Endpoint HTTP /api/robot/chat
section("TEST 5 - Endpoint HTTP POST /api/robot/chat");
$payload = json_encode([
    'message'    => 'Hello! Reply with exactly one short sentence saying you are online.',
    'history'    => [],
    'study_plan' => ''
]);
$start = microtime(true);
$ch = curl_init('http://localhost:8000/api/robot/chat');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    CURLOPT_TIMEOUT        => 35,
]);
$rawResponse = curl_exec($ch);
$httpCode    = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr     = curl_error($ch);
curl_close($ch);
$elapsed = round((microtime(true) - $start) * 1000);

if ($curlErr) {
    fail("cURL error: {$curlErr}");
    $failed++;
} elseif ($httpCode === 200) {
    $body = json_decode($rawResponse, true);
    if (!empty($body['ok']) && !empty($body['reply'])) {
        ok("HTTP 200 en {$elapsed}ms");
        ok("reply: \"" . substr($body['reply'], 0, 80) . "\"");
        ok("provider: " . ($body['provider'] ?? '?'));
        ok("emotion: "  . ($body['emotion']  ?? '?'));
        $passed += 4;
        if (!empty($body['audio'])) {
            ok("Audio TTS generado correctamente");
            $passed++;
        } else {
            info("Audio TTS no generado (ElevenLabs puede estar inactivo - normal)");
        }
    } else {
        fail("HTTP 200 pero respuesta invalida: " . substr($rawResponse, 0, 200));
        $failed++;
    }
} else {
    fail("HTTP {$httpCode} despues de {$elapsed}ms: " . substr($rawResponse, 0, 300));
    $failed++;
}

// Resumen
section("RESUMEN FINAL");
$total = $passed + $failed;
echo "  Tests ejecutados : {$total}\n";
echo "  \033[32mPassed\033[0m           : {$passed}\n";
echo "  \033[31mFailed\033[0m           : {$failed}\n";
if ($failed === 0) {
    echo "\n\033[1;32m  Todos los tests pasaron correctamente.\033[0m\n\n";
    exit(0);
} else {
    echo "\n\033[1;31m  {$failed} test(s) fallaron. Revisar output arriba.\033[0m\n\n";
    exit(1);
}
