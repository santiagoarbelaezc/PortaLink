<?php
/**
 * Test especifico: Chat Copilot de Dash Library (/api/admin/chat mode=copilot)
 */

require_once __DIR__ . '/../vendor/autoload.php';

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

function ok(string $msg): void   { echo "\033[32m  PASS\033[0m  {$msg}\n"; }
function fail(string $msg): void  { echo "\033[31m  FAIL\033[0m  {$msg}\n"; }
function info(string $msg): void  { echo "\033[36m  INFO\033[0m  {$msg}\n"; }
function section(string $t): void {
    echo "\n\033[1;33m==============================================\033[0m\n";
    echo "\033[1;33m  {$t}\033[0m\n";
    echo "\033[1;33m==============================================\033[0m\n";
}

$passed = 0; $failed = 0;

// ─── TEST 1: Copilot de apuntes con nota real ──────────────────────────────
section("TEST 1 - Copilot modo apuntes (con contenido de nota)");

$payload = json_encode([
    'mode'        => 'copilot',
    'prompt'      => 'Explica brevemente que es un JOIN en SQL con un ejemplo simple.',
    'noteContent' => "# SQL JOIN\nUn JOIN combina filas de dos o mas tablas basandose en una columna relacionada.",
    'noteTitle'   => 'SQL JOIN',
    'history'     => []
]);

$start = microtime(true);
$ch = curl_init('http://localhost:8000/api/admin/chat');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    CURLOPT_TIMEOUT        => 30,
]);
$raw  = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err  = curl_error($ch);
curl_close($ch);
$elapsed = round((microtime(true) - $start) * 1000);

if ($err) {
    fail("cURL error: {$err}");
    $failed++;
} elseif ($code === 200) {
    $body = json_decode($raw, true);
    if (!empty($body['success']) && !empty($body['result'])) {
        ok("HTTP 200 en {$elapsed}ms");
        ok("provider: " . ($body['provider'] ?? '?'));
        ok("reply preview: \"" . substr($body['result'], 0, 100) . "...\"");
        $passed += 3;
        // Verificar que contiene contenido SQL (no respuesta genérica)
        if (stripos($body['result'], 'join') !== false || stripos($body['result'], 'sql') !== false || stripos($body['result'], 'tabla') !== false || stripos($body['result'], 'table') !== false) {
            ok("Contenido relacionado con SQL detectado - IA respondio correctamente");
            $passed++;
        } else {
            info("Respuesta valida pero no menciona SQL/JOIN directamente");
        }
        if ($elapsed < 15000) {
            ok("Tiempo de respuesta aceptable ({$elapsed}ms)");
            $passed++;
        } else {
            fail("Respuesta lenta ({$elapsed}ms > 15s)");
            $failed++;
        }
    } else {
        fail("HTTP 200 pero respuesta invalida: " . substr($raw, 0, 200));
        $failed++;
    }
} else {
    fail("HTTP {$code} ({$elapsed}ms): " . substr($raw, 0, 300));
    $failed++;
}

// ─── TEST 2: Copilot sin contenido de nota ─────────────────────────────────
section("TEST 2 - Copilot sin contenido de nota (consulta libre)");

$payload2 = json_encode([
    'mode'        => 'copilot',
    'prompt'      => 'Que es la programacion orientada a objetos en 2 oraciones?',
    'noteContent' => '',
    'noteTitle'   => '',
    'history'     => []
]);

$start = microtime(true);
$ch = curl_init('http://localhost:8000/api/admin/chat');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload2,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    CURLOPT_TIMEOUT        => 30,
]);
$raw2  = curl_exec($ch);
$code2 = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err2  = curl_error($ch);
curl_close($ch);
$elapsed2 = round((microtime(true) - $start) * 1000);

if ($err2) {
    fail("cURL error: {$err2}");
    $failed++;
} elseif ($code2 === 200) {
    $body2 = json_decode($raw2, true);
    if (!empty($body2['success']) && !empty($body2['result'])) {
        ok("HTTP 200 en {$elapsed2}ms");
        ok("provider: " . ($body2['provider'] ?? '?'));
        ok("reply preview: \"" . substr($body2['result'], 0, 100) . "...\"");
        $passed += 3;
    } else {
        fail("HTTP 200 pero sin contenido valido: " . substr($raw2, 0, 200));
        $failed++;
    }
} else {
    fail("HTTP {$code2} ({$elapsed2}ms): " . substr($raw2, 0, 300));
    $failed++;
}

// ─── TEST 3: Conversacion multi-turno (historial) ─────────────────────────
section("TEST 3 - Conversacion con historial (multi-turno)");

$payload3 = json_encode([
    'mode'        => 'copilot',
    'prompt'      => 'Dame un ejemplo de eso en Python.',
    'noteContent' => '',
    'noteTitle'   => '',
    'history'     => [
        ['role' => 'user',      'content' => 'Que es la programacion orientada a objetos?'],
        ['role' => 'assistant', 'content' => 'La POO es un paradigma basado en objetos que encapsulan datos y comportamiento.']
    ]
]);

$start = microtime(true);
$ch = curl_init('http://localhost:8000/api/admin/chat');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload3,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    CURLOPT_TIMEOUT        => 30,
]);
$raw3  = curl_exec($ch);
$code3 = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
$elapsed3 = round((microtime(true) - $start) * 1000);

if ($code3 === 200) {
    $body3 = json_decode($raw3, true);
    if (!empty($body3['success']) && !empty($body3['result'])) {
        ok("HTTP 200 en {$elapsed3}ms con historial");
        // Verificar que responde algo relacionado con Python o codigo
        if (stripos($body3['result'], 'python') !== false || stripos($body3['result'], 'class') !== false || stripos($body3['result'], 'def ') !== false || str_contains($body3['result'], '```')) {
            ok("Contexto del historial respetado (menciona Python o codigo)");
            $passed++;
        } else {
            info("Respuesta valida pero no menciona Python directamente");
        }
        ok("Multi-turno funciona correctamente");
        $passed += 2;
    } else {
        fail("HTTP 200 pero sin contenido: " . substr($raw3, 0, 200));
        $failed++;
    }
} else {
    fail("HTTP {$code3} ({$elapsed3}ms)");
    $failed++;
}

// Resumen
section("RESUMEN - DASH LIBRARY CHAT COPILOT");
$total = $passed + $failed;
echo "  Tests ejecutados : {$total}\n";
echo "  \033[32mPassed\033[0m           : {$passed}\n";
echo "  \033[31mFailed\033[0m           : {$failed}\n";
if ($failed === 0) {
    echo "\n\033[1;32m  El chat de Dash Library esta funcionando correctamente.\033[0m\n\n";
    exit(0);
} else {
    echo "\n\033[1;31m  {$failed} test(s) fallaron. Revisar output.\033[0m\n\n";
    exit(1);
}
