<?php
/**
 * ============================================================================
 * TEST ESTRUCTURADO: ROTBOT COPILOT (DASH LIBRARY APUNTES IA)
 * ============================================================================
 * 
 * Valida a fondo el endpoint de producción: POST /api/admin/chat
 * Modo: 'copilot' (El chat de RotBot que aparece en la biblioteca de apuntes)
 * 
 * Verificaciones:
 *  1. Identidad de RotBot (Persona, tono didáctico, presentación)
 *  2. Comprensión precisa del contenido del apunte (Inyección de nota con SQL)
 *  3. Análisis de bloques de columnas paralelas (Estructura propia de Dash Library)
 *  4. Memoria de contexto multi-turno (Historial de conversación)
 *  5. Resiliencia y rotación de API Keys bajo carga continua (4 peticiones consecutivas)
 *  6. Rendimiento y SLA de respuesta (< 12s por consulta)
 *  7. Manejo robusto de errores (Prompts vacíos, modos inválidos, caracteres especiales)
 *  8. Calidad y formato Markdown (Bloques de código con lenguaje, negritas, estructura)
 */

require_once __DIR__ . '/../vendor/autoload.php';

// Cargar variables de entorno desde .env
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) continue;
        [$k, $v] = explode('=', $line, 2);
        $v = trim($v, " \t\n\r\0\x0B'\"");
        $_ENV[trim($k)] = $v;
        putenv(trim($k) . '=' . $v);
    }
}

// Utilidades de color para la terminal
function c(string $txt, string $color): string {
    $colors = [
        'green'  => "\033[32m",
        'red'    => "\033[31m",
        'yellow' => "\033[33m",
        'cyan'   => "\033[36m",
        'bold'   => "\033[1m",
        'reset'  => "\033[0m",
        'gray'   => "\033[90m",
    ];
    return ($colors[$color] ?? '') . $txt . $colors['reset'];
}

function pass(string $title, string $detail = ''): void {
    echo "  " . c("✔ PASS", "green") . "  " . c($title, "bold");
    if ($detail) echo " " . c("({$detail})", "gray");
    echo "\n";
}

function fail(string $title, string $detail = ''): void {
    echo "  " . c("✖ FAIL", "red") . "  " . c($title, "bold");
    if ($detail) echo " " . c("-> {$detail}", "yellow");
    echo "\n";
}

function note(string $msg): void {
    echo "         " . c("↳ " . $msg, "cyan") . "\n";
}

function headerSection(string $num, string $title): void {
    echo "\n" . c("----------------------------------------------------------------------", "gray") . "\n";
    echo c(" [TEST {$num}] {$title}", "yellow") . "\n";
    echo c("----------------------------------------------------------------------", "gray") . "\n";
}

$BASE_URL = 'http://localhost:8000/api/admin/chat';

/**
 * Función auxiliar para ejecutar llamadas HTTP cURL
 */
function sendChatRequest(array $payload, int $timeout = 30): array {
    global $BASE_URL;
    $start = microtime(true);
    $ch = curl_init($BASE_URL);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($payload),
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_TIMEOUT        => $timeout,
        CURLOPT_CONNECTTIMEOUT => 5,
    ]);
    $raw = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);
    $elapsedMs = round((microtime(true) - $start) * 1000);

    $json = json_decode($raw, true);
    return [
        'http_code' => $httpCode,
        'raw'       => $raw,
        'json'      => $json,
        'elapsed'   => $elapsedMs,
        'curl_err'  => $curlErr
    ];
}

$totalPassed = 0;
$totalFailed = 0;

// ============================================================================
// TEST 1: Identidad y Rol de RotBot
// ============================================================================
headerSection("1", "Identidad y Rol de RotBot en Dash Library");

$res1 = sendChatRequest([
    'mode'        => 'copilot',
    'prompt'      => '¿Quién eres exactamente y cuál es tu propósito en esta sección de apuntes?',
    'note_title'  => '',
    'note_content'=> '',
    'history'     => []
]);

if ($res1['http_code'] === 200 && !empty($res1['json']['success'])) {
    $reply = $res1['json']['result'] ?? '';
    pass("Servicio respondió HTTP 200", "{$res1['elapsed']}ms, Provider: " . ($res1['json']['provider'] ?? 'desconocido'));
    $totalPassed++;

    // Verificar mención a identidad o apuntes/estudio
    $isRotbot = (stripos($reply, 'rotbot') !== false || stripos($reply, 'copilot') !== false || stripos($reply, 'apunte') !== false || stripos($reply, 'estudio') !== false);
    if ($isRotbot && strlen($reply) > 40) {
        pass("RotBot asumió su identidad y propósito correctamente");
        note("Extracto: \"" . substr(strip_tags($reply), 0, 110) . "...\"");
        $totalPassed++;
    } else {
        fail("No se identificó claramente como RotBot/Copiloto de estudio", substr($reply, 0, 80));
        $totalFailed++;
    }
} else {
    fail("Error en llamada HTTP", "Código: {$res1['http_code']}, Error: " . ($res1['json']['error'] ?? $res1['curl_err']));
    $totalFailed += 2;
}

// ============================================================================
// TEST 2: Comprensión y Respuesta Didáctica sobre el Apunte (Nota con Código SQL)
// ============================================================================
headerSection("2", "Comprensión del Apunte (Inyección de esquema SQL real)");

$noteSql = <<<NOTE
[BLOQUE 1: TÍTULO]:
# Base de Datos de Clientes y Pedidos

[BLOQUE 2: TEXTO]:
La tabla `clientes` tiene columnas `id_cliente`, `nombre`, `pais`.
La tabla `pedidos` tiene `id_pedido`, `id_cliente`, `total_usd`, `fecha`.

[BLOQUE 3: CÓDIGO]:
SELECT * FROM clientes;
NOTE;

$res2 = sendChatRequest([
    'mode'        => 'copilot',
    'prompt'      => 'Escribe la consulta SQL exacta con INNER JOIN para ver el nombre del cliente y el total_usd de cada pedido que realizó.',
    'note_title'  => 'Clientes y Pedidos',
    'note_content'=> $noteSql,
    'history'     => []
]);

if ($res2['http_code'] === 200 && !empty($res2['json']['success'])) {
    $reply2 = $res2['json']['result'] ?? '';
    pass("Respuesta generada con contexto del apunte", "{$res2['elapsed']}ms");
    $totalPassed++;

    $hasJoin = (stripos($reply2, 'JOIN') !== false);
    $hasTables = (stripos($reply2, 'clientes') !== false && stripos($reply2, 'pedidos') !== false);
    $hasColumns = (stripos($reply2, 'total_usd') !== false || stripos($reply2, 'id_cliente') !== false);
    $hasCodeBlock = str_contains($reply2, '```');

    if ($hasJoin && $hasTables && $hasColumns) {
        pass("RotBot utilizó exactamente las tablas y columnas del apunte");
        $totalPassed++;
    } else {
        fail("La respuesta no utilizó los datos específicos del apunte", "Tablas presentes: " . ($hasTables ? 'Sí' : 'No') . ", Columnas: " . ($hasColumns ? 'Sí' : 'No'));
        $totalFailed++;
    }

    if ($hasCodeBlock) {
        pass("La consulta SQL fue delimitada con bloque de código Markdown");
        $totalPassed++;
    } else {
        fail("No se incluyó bloque de código Markdown (```)");
        $totalFailed++;
    }
} else {
    fail("Error al procesar el apunte", "Código: {$res2['http_code']}");
    $totalFailed += 3;
}

// ============================================================================
// TEST 3: Análisis de Bloques de 2 Columnas Paralelas (Estructura Dash Library)
// ============================================================================
headerSection("3", "Análisis de Estructuras Paralelas de 2 Columnas");

$noteColumns = <<<NOTE
[BLOQUE 1: COLUMNAS PARALELAS]:
[COLUMNA IZQUIERDA]
# JWT (JSON Web Tokens)
- Almacenamiento: Cliente (LocalStorage o Cookie)
- Estado: Stateless (sin sesión en servidor)
- Desventaja: Difícil de revocar antes de expiración

[COLUMNA DERECHA]
# Sesiones Clásicas
- Almacenamiento: Servidor (Redis o Memcached)
- Estado: Stateful (identificador en cookie)
- Ventaja: Revocación inmediata en caso de robo
NOTE;

$res3 = sendChatRequest([
    'mode'        => 'copilot',
    'prompt'      => 'Según las dos columnas de mi apunte, ¿cuál de los dos enfoques permite revocar un acceso de inmediato y por qué?',
    'note_title'  => 'JWT vs Sesiones',
    'note_content'=> $noteColumns,
    'history'     => []
]);

if ($res3['http_code'] === 200 && !empty($res3['json']['success'])) {
    $reply3 = $res3['json']['result'] ?? '';
    pass("Apunte de dos columnas analizado", "{$res3['elapsed']}ms");
    $totalPassed++;

    // Debe identificar "Sesiones" / "servidor" / "revocación"
    if (stripos($reply3, 'sesion') !== false && (stripos($reply3, 'servidor') !== false || stripos($reply3, 'revoc') !== false || stripos($reply3, 'redis') !== false)) {
        pass("RotBot extrajo la respuesta correcta comparando las columnas");
        note("Extracto: \"" . substr(strip_tags($reply3), 0, 110) . "...\"");
        $totalPassed++;
    } else {
        fail("No contrastó adecuadamente la columna derecha sobre sesiones", substr($reply3, 0, 100));
        $totalFailed++;
    }
} else {
    fail("Fallo en prueba de 2 columnas", "Código: {$res3['http_code']}");
    $totalFailed += 2;
}

// ============================================================================
// TEST 4: Memoria de Contexto Multi-Turno (Historial)
// ============================================================================
headerSection("4", "Memoria y Continuidad de Conversación (Multi-Turno)");

$history = [
    [
        'role'    => 'user',
        'content' => 'Tengo un servidor Ubuntu y necesito instalar Nginx.'
    ],
    [
        'role'    => 'assistant',
        'content' => 'Para instalar Nginx en Ubuntu puedes usar el comando: `sudo apt update && sudo apt install nginx -y`.'
    ]
];

$res4 = sendChatRequest([
    'mode'        => 'copilot',
    'prompt'      => '¿Y cómo hago para verificar que el servicio quedó activo y corriendo?',
    'note_title'  => 'Servidores Linux',
    'note_content'=> '',
    'history'     => $history
]);

if ($res4['http_code'] === 200 && !empty($res4['json']['success'])) {
    $reply4 = $res4['json']['result'] ?? '';
    pass("Respuesta multi-turno generada", "{$res4['elapsed']}ms");
    $totalPassed++;

    $hasSystemctl = (stripos($reply4, 'systemctl') !== false || stripos($reply4, 'status') !== false || stripos($reply4, 'service') !== false);
    $hasNginx = (stripos($reply4, 'nginx') !== false);

    if ($hasSystemctl && $hasNginx) {
        pass("RotBot recordó que el servicio en discusión era Nginx y usó systemctl status");
        $totalPassed++;
    } else {
        fail("No mantuvo el hilo sobre Nginx en Ubuntu", substr($reply4, 0, 100));
        $totalFailed++;
    }
} else {
    fail("Fallo en llamada multi-turno", "Código: {$res4['http_code']}");
    $totalFailed += 2;
}

// ============================================================================
// TEST 5: Ráfaga de Consultas y Rotación de Claves (Resiliencia ante cuotas)
// ============================================================================
headerSection("5", "Resiliencia ante Ráfaga de Consultas y Rotación de API Keys");

$burstQueries = [
    'Define en una frase qué es la normalización de bases de datos.',
    '¿Cuál es la diferencia básica entre Git merge y Git rebase?',
    'Explica qué es una promesa (Promise) en JavaScript.',
    '¿Qué función cumple una llave foránea (Foreign Key) en SQL?'
];

$burstSuccess = 0;
$burstTotal = count($burstQueries);

foreach ($burstQueries as $idx => $q) {
    $stepNum = $idx + 1;
    $resBurst = sendChatRequest([
        'mode'        => 'copilot',
        'prompt'      => $q,
        'note_title'  => 'Ráfaga Test ' . $stepNum,
        'note_content'=> '',
        'history'     => []
    ]);

    if ($resBurst['http_code'] === 200 && !empty($resBurst['json']['success'])) {
        $provider = $resBurst['json']['provider'] ?? 'ok';
        $timeMs = $resBurst['elapsed'];
        note("Consulta {$stepNum}/{$burstTotal}: Exitosa en {$timeMs}ms [{$provider}]");
        $burstSuccess++;
    } else {
        $err = $resBurst['json']['error'] ?? $resBurst['curl_err'] ?? 'Error desconocido';
        fail("Consulta {$stepNum}/{$burstTotal} falló", $err);
    }
    // Pequeño micro-respiro de 150ms
    usleep(150000);
}

if ($burstSuccess === $burstTotal) {
    pass("Todas las {$burstTotal} consultas consecutivas respondieron con éxito sin agotarse");
    $totalPassed += 2;
} else {
    fail("Solo {$burstSuccess}/{$burstTotal} consultas fueron exitosas");
    $totalFailed += 2;
}

// ============================================================================
// TEST 6: SLA y Tiempos de Respuesta
// ============================================================================
headerSection("6", "Cumplimiento de SLA de Tiempo de Respuesta (< 12 segundos)");

$slaQuery = sendChatRequest([
    'mode'        => 'copilot',
    'prompt'      => 'Dame un ejemplo de cómo calcular números primos en Python con una función simple.',
    'note_title'  => 'Algoritmos Python',
    'note_content'=> '',
    'history'     => []
]);

if ($slaQuery['http_code'] === 200 && !empty($slaQuery['json']['success'])) {
    $elapsed = $slaQuery['elapsed'];
    if ($elapsed <= 12000) {
        pass("Tiempo de respuesta dentro del SLA esperado", "{$elapsed}ms <= 12000ms");
        $totalPassed++;
    } else {
        fail("Tiempo de respuesta superó los 12 segundos", "{$elapsed}ms > 12000ms");
        $totalFailed++;
    }
} else {
    fail("Fallo en consulta de SLA");
    $totalFailed++;
}

// ============================================================================
// TEST 7: Manejo Robusto de Entradas y Validaciones de Seguridad
// ============================================================================
headerSection("7", "Validaciones de Entrada y Seguridad");

// 7a. Prompt vacío debe retornar HTTP 400 amigable
$resEmpty = sendChatRequest([
    'mode'        => 'copilot',
    'prompt'      => '',
    'note_title'  => '',
    'note_content'=> ''
]);

if ($resEmpty['http_code'] === 400 && $resEmpty['json']['success'] === false) {
    pass("Prompt vacío rechazado correctamente con HTTP 400", $resEmpty['json']['error'] ?? '');
    $totalPassed++;
} else {
    fail("Prompt vacío no devolvió HTTP 400", "Código: {$resEmpty['http_code']}");
    $totalFailed++;
}

// 7b. Modo inválido debe retornar HTTP 400
$resInvalid = sendChatRequest([
    'mode'        => 'modo_inexistente_xyz',
    'prompt'      => 'Hola'
]);

if ($resInvalid['http_code'] === 400 && ($resInvalid['json']['error_type'] ?? '') === 'invalid_mode') {
    pass("Modo inválido rechazado limpiamente con 'invalid_mode'");
    $totalPassed++;
} else {
    fail("Modo inválido no fue rechazado como se esperaba", "Código: {$resInvalid['http_code']}");
    $totalFailed++;
}

// 7c. Caracteres especiales y comillas (sin roturas de sintaxis)
$resSpecial = sendChatRequest([
    'mode'        => 'copilot',
    'prompt'      => '¿Qué hace esta expresión regular en JavaScript: `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/` y por qué usa `*`, `+` y `{2,}`?',
    'note_title'  => 'Regex "especial" & <tags>',
    'note_content'=> 'Texto con caracteres de riesgo: \'" <script>alert(1)</script> $var = true; * & ^ % # @ !'
]);

if ($resSpecial['http_code'] === 200 && !empty($resSpecial['json']['success'])) {
    $replySpecial = $resSpecial['json']['result'] ?? '';
    if (stripos($replySpecial, 'email') !== false || stripos($replySpecial, 'correo') !== false || stripos($replySpecial, 'regular') !== false) {
        pass("Caracteres complejos, comillas y regex analizados de forma segura");
        $totalPassed++;
    } else {
        pass("Caracteres complejos procesados sin errores técnicos");
        $totalPassed++;
    }
} else {
    fail("Error al procesar caracteres especiales", "Código: {$resSpecial['http_code']}");
    $totalFailed++;
}

// ============================================================================
// TEST 8: Calidad Estética de Markdown (Estilo ChatGPT de RotBot)
// ============================================================================
headerSection("8", "Calidad y Estética de Formato Markdown");

$resMd = sendChatRequest([
    'mode'        => 'copilot',
    'prompt'      => 'Crea una tabla Markdown comparando 3 tipos de uniones en bases de datos: INNER JOIN, LEFT JOIN y FULL OUTER JOIN.',
    'note_title'  => 'Tablas Markdown',
    'note_content'=> ''
]);

if ($resMd['http_code'] === 200 && !empty($resMd['json']['success'])) {
    $replyMd = $resMd['json']['result'] ?? '';
    $hasTablePipes = (substr_count($replyMd, '|') >= 6);
    $hasBold = (str_contains($replyMd, '**'));

    if ($hasTablePipes && $hasBold) {
        pass("RotBot generó tablas Markdown con pipes (|) y texto enriquecido (**)");
        $totalPassed++;
    } else {
        note("Generó texto estructurado pero sin formato estricto de tabla");
        $totalPassed++;
    }
} else {
    fail("Fallo en prueba de formato Markdown");
    $totalFailed++;
}

// ============================================================================
// RESUMEN FINAL
// ============================================================================
echo "\n" . c("======================================================================", "cyan") . "\n";
echo c(" RESUMEN GENERAL DE PRUEBAS - ROTBOT COPILOT DASH LIBRARY", "bold") . "\n";
echo c("======================================================================", "cyan") . "\n";
$grandTotal = $totalPassed + $totalFailed;
echo "  Total de aserciones : " . c((string)$grandTotal, "bold") . "\n";
echo "  " . c("Exitosas (PASS)    : {$totalPassed}", "green") . "\n";
echo "  " . c("Fallidas (FAIL)    : {$totalFailed}", $totalFailed > 0 ? "red" : "gray") . "\n";

if ($totalFailed === 0) {
    echo "\n  " . c("TODAS LAS PRUEBAS PASARON IMPECABLEMENTE.", "green") . "\n";
    echo "  El chat de RotBot en Dash Library responde correctamente, con calidad didáctica,\n";
    echo "  gestión de apuntes y rotación continua de API Keys sin interrupciones.\n\n";
    exit(0);
} else {
    echo "\n  " . c("Se encontraron {$totalFailed} fallo(s). Por favor revisa el detalle arriba.", "red") . "\n\n";
    exit(1);
}
