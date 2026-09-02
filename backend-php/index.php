<?php

// Cuando el servidor built-in de PHP solicita un archivo que existe en disco, lo sirve directamente
// sin pasar por el router MVC
if (PHP_SAPI === 'cli-server') {
    $filePath = __DIR__ . parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
    if (is_file($filePath) && pathinfo($filePath, PATHINFO_EXTENSION) === 'php' && basename($filePath) !== 'index.php') {
        require $filePath;
        exit;
    }
}

// Autoloader de Composer (o fallback simple si aún no se ha ejecutado composer install)
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require __DIR__ . '/vendor/autoload.php';
} else {
    // Autoloader PSR-4 nativo de respaldo
    spl_autoload_register(function ($class) {
        $prefix = 'App\\';
        $base_dir = __DIR__ . '/src/';
        $len = strlen($prefix);
        if (strncmp($prefix, $class, $len) !== 0) {
            return;
        }
        $relative_class = substr($class, $len);
        $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
        if (file_exists($file)) {
            require $file;
        }
    });
}

// Aplicar CORS estricto con lista blanca y cabeceras de seguridad
\App\Core\Cors::handle();

// Cargar variables de entorno si existe .env
if (file_exists(__DIR__ . '/.env') && class_exists('Dotenv\Dotenv')) {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->safeLoad();
} elseif (file_exists(__DIR__ . '/.env')) {
    // Respaldo simple para leer .env si phpdotenv aún no está instalado vía Composer
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $trimmed = trim($line);
        if (empty($trimmed) || str_starts_with($trimmed, '#')) continue;
        if (str_contains($trimmed, '=')) {
            list($name, $value) = explode('=', $trimmed, 2);
            $name = trim($name);
            $value = trim($value, " \t\n\r\0\x0B\"'");
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
            putenv("{$name}={$value}");
        }
    }
}

use App\Core\Request;
use App\Core\Response;
use App\Core\Router;

// Importar controladores y middlewares
use App\Middleware\AuthMiddleware;
use App\Middleware\OptionalAuthMiddleware;

use App\Controllers\AuthController;
use App\Controllers\ChatController;
use App\Controllers\ItineraryController;
use App\Controllers\FinanceController;
use App\Controllers\AnalyticsController;
use App\Controllers\ReportsController;
use App\Controllers\ConfigController;
use App\Controllers\MessagesController;
use App\Controllers\SiteController;
use App\Controllers\LibraryController;
use App\Controllers\ChatAdminController;
use App\Controllers\CommandCenterController;
use App\Controllers\RobotChatController;
use App\Controllers\StudyPlanController;

$request = new Request();
$response = new Response();
$router = new Router();

// Ruta base
$router->get('/', function (Request $req, Response $res) {
    $res->json([
        'message' => 'Bienvenido a la API de PortaLink (PHP Edition)',
        'version' => '1.0.0',
        'php_version' => PHP_VERSION
    ]);
});

// ──────────────────────────────────────────────────────────────
//  RUTA TEMPORAL: TEST DE CONEXIÓN + CARGA DEL SCHEMA MYSQL
//  Acceder en: http://localhost:8000/api/setup-db
//  ⚠️  ELIMINAR ANTES DE PRODUCCIÓN
// ──────────────────────────────────────────────────────────────
$router->get('/api/setup-db', function (Request $req, Response $res) {
    $log = [];
    $error = null;

    // 1. Recopilar configuración del entorno
    $dbConnection = $_ENV['DB_CONNECTION'] ?? getenv('DB_CONNECTION') ?? 'mysql';
    $host = $_ENV['DB_HOST'] ?? getenv('DB_HOST') ?? 'srv1660.hstgr.io';
    $port = $_ENV['DB_PORT'] ?? getenv('DB_PORT') ?? '3306';
    $dbname = $_ENV['DB_DATABASE'] ?? getenv('DB_DATABASE') ?? '';
    $user = $_ENV['DB_USERNAME'] ?? getenv('DB_USERNAME') ?? '';
    $pass = $_ENV['DB_PASSWORD'] ?? getenv('DB_PASSWORD') ?? '';

    // Limpiar comillas del .env si las hay
    $pass = trim($pass, '"\'');

    $log[] = "📋 Configuración cargada desde .env:";
    $log[] = "   DB_CONNECTION = {$dbConnection}";
    $log[] = "   DB_HOST = {$host}";
    $log[] = "   DB_PORT = {$port}";
    $log[] = "   DB_DATABASE = {$dbname}";
    $log[] = "   DB_USERNAME = {$user}";
    $log[] = "   DB_PASSWORD = " . (strlen($pass) > 0 ? str_repeat('*', strlen($pass)) : '(vacía)');

    // 2. Probar conexión
    $pdo = null;
    $hostsToTry = [$host, 'srv1660.hstgr.io', 'auth-db1660.hstgr.io', 'sql1660.main-hosting.eu'];
    $hostsToTry = array_unique($hostsToTry);
    $connectedHost = null;

    $log[] = "";
    $log[] = "🔌 Probando conexión a MySQL...";

    foreach ($hostsToTry as $h) {
        $log[] = "   → Intentando host: {$h}:{$port} ...";
        try {
            $dsn = "mysql:host={$h};port={$port};dbname={$dbname};charset=utf8mb4";
            $pdo = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            $connectedHost = $h;
            $log[] = "   ✅ ¡CONEXIÓN EXITOSA con host: {$h}!";
            break;
        } catch (Exception $e) {
            $log[] = "   ❌ Falló en {$h}: " . $e->getMessage();
        }
    }

    if (!$pdo) {
        $res->status(500)->json([
            'ok' => false,
            'message' => 'No se pudo establecer conexión con MySQL de Hostinger.',
            'log' => $log
        ]);
        return;
    }

    // Actualizar DB_HOST en .env si el host que funcionó es diferente al configurado
    if ($connectedHost !== $host) {
        $log[] = "";
        $log[] = "⚙️  Actualizando DB_HOST en .env a: {$connectedHost}";
        $envPath = __DIR__ . '/.env';
        if (file_exists($envPath)) {
            $envContent = file_get_contents($envPath);
            $envContent = preg_replace('/^DB_HOST=.*$/m', "DB_HOST={$connectedHost}", $envContent);
            file_put_contents($envPath, $envContent);
        }
    }

    // 3. Ejecutar schema_mysql.sql
    $schemaPath = __DIR__ . '/schema_mysql.sql';
    $log[] = "";
    $log[] = "📄 Cargando schema_mysql.sql...";

    if (!file_exists($schemaPath)) {
        $res->status(500)->json([
            'ok' => false,
            'message' => 'No se encontró el archivo schema_mysql.sql en ' . $schemaPath,
            'log' => $log
        ]);
        return;
    }

    $sqlContent = file_get_contents($schemaPath);
    $log[] = "   Archivo cargado (" . strlen($sqlContent) . " bytes). Ejecutando sentencias...";

    try {
        $pdo->exec("SET NAMES utf8mb4");
        $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");

        $statements = array_filter(array_map('trim', explode(';', $sqlContent)));
        $executed = 0;
        foreach ($statements as $stmt) {
            if (!empty($stmt) && !preg_match('/^\s*--/', $stmt)) {
                try {
                    $pdo->exec($stmt);
                    $executed++;
                } catch (PDOException $ex) {
                    if (!str_contains($ex->getMessage(), 'Query was empty')) {
                        $log[] = "   ⚠️  Nota: " . $ex->getMessage();
                    }
                }
            }
        }

        $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
        $log[] = "   ✅ Script ejecutado ({$executed} sentencias procesadas).";
    } catch (Exception $e) {
        $log[] = "   ❌ Error ejecutando schema: " . $e->getMessage();
    }

    // 4. Verificar tablas y usuario admin
    $log[] = "";
    $log[] = "🔍 Verificando resultado...";

    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    $log[] = "   Tablas encontradas (" . count($tables) . "): " . implode(', ', $tables);

    $adminStmt = $pdo->prepare("SELECT id, nombre, email, telefono, rol, verified FROM usuarios WHERE email = ?");
    $adminStmt->execute(['santiarco2611@gmail.com']);
    $admin = $adminStmt->fetch();

    if ($admin) {
        $log[] = "   ✅ Usuario admin verificado: [{$admin['rol']}] {$admin['nombre']} <{$admin['email']}>";
    } else {
        $log[] = "   ⚠️  Usuario administrador no encontrado en la tabla 'usuarios'.";
    }

    $log[] = "";
    $log[] = "🎉 ¡Proceso completado exitosamente! Elimina /api/setup-db antes de producción.";

    $res->json([
        'ok' => true,
        'host_conectado' => $connectedHost,
        'tablas_creadas' => count($tables),
        'tablas' => $tables,
        'admin' => $admin ?: null,
        'log' => $log
    ]);
});

// ──────────────────────────────────────────────────────────────
//  RUTAS DE AUTENTICACIÓN (/api/auth)
// ──────────────────────────────────────────────────────────────
$router->post('/api/auth/login', [AuthController::class, 'login']);
$router->get('/api/auth/captcha', [AuthController::class, 'getCaptcha']);
$router->post('/api/auth/register', [AuthController::class, 'register']);
$router->get('/api/auth/users', [AuthController::class, 'getUsers']);
$router->put('/api/auth/users/:id/role', [AuthController::class, 'updateUserRole'], [AuthMiddleware::class]);
$router->delete('/api/auth/users/:id', [AuthController::class, 'deleteUser'], [AuthMiddleware::class]);
$router->put('/api/auth/password', [AuthController::class, 'updatePassword'], [AuthMiddleware::class]);
$router->put('/api/auth/profile', [AuthController::class, 'updateProfile'], [AuthMiddleware::class]);
$router->get('/api/auth/verify-email', [AuthController::class, 'verifyEmail']);
$router->post('/api/auth/forgot-password', [AuthController::class, 'forgotPassword']);
$router->post('/api/auth/reset-password', [AuthController::class, 'resetPassword']);

// ──────────────────────────────────────────────────────────────
//  RUTAS DE CHAT & IA (/api/chat)
// ──────────────────────────────────────────────────────────────
$router->post('/api/chat/send', [ChatController::class, 'sendMessage'], [OptionalAuthMiddleware::class]);
$router->post('/api/admin/chat', [ChatAdminController::class, 'handle'], [OptionalAuthMiddleware::class]);
$router->get('/api/chat/history', [ChatController::class, 'getHistory'], [AuthMiddleware::class]);
$router->get('/api/chat/usage', [ChatController::class, 'getUsage'], [OptionalAuthMiddleware::class]);
$router->delete('/api/chat/clear', [ChatController::class, 'clearHistory'], [OptionalAuthMiddleware::class]);

// ──────────────────────────────────────────────────────────────
//  RUTAS DE ITINERARIO (/api/itinerary)
// ──────────────────────────────────────────────────────────────
$router->get('/api/itinerary', [ItineraryController::class, 'getTasks'], [AuthMiddleware::class]);
$router->get('/api/itinerary/week', [ItineraryController::class, 'getWeek'], [AuthMiddleware::class]);
$router->get('/api/itinerary/today', [ItineraryController::class, 'getToday'], [AuthMiddleware::class]);
$router->get('/api/itinerary/notifications', [ItineraryController::class, 'getNotifications'], [AuthMiddleware::class]);
$router->post('/api/itinerary/notifications/:taskId/seen', [ItineraryController::class, 'markNotificationSeen'], [AuthMiddleware::class]);
$router->post('/api/itinerary', [ItineraryController::class, 'createTask'], [AuthMiddleware::class]);
$router->post('/api/itinerary/reminders/check', [ItineraryController::class, 'checkReminders'], [AuthMiddleware::class]);
$router->get('/api/itinerary/reminders/check', [ItineraryController::class, 'checkReminders'], [AuthMiddleware::class]);
$router->put('/api/itinerary/:id', [ItineraryController::class, 'updateTask'], [AuthMiddleware::class]);
$router->patch('/api/itinerary/:id/toggle', [ItineraryController::class, 'toggleTask'], [AuthMiddleware::class]);
$router->delete('/api/itinerary/:id', [ItineraryController::class, 'deleteTask'], [AuthMiddleware::class]);

// ──────────────────────────────────────────────────────────────
//  RUTAS DE FINANZAS (/api/finance)
// ──────────────────────────────────────────────────────────────
$router->get('/api/finance/dashboard', [FinanceController::class, 'getDashboard'], [AuthMiddleware::class]);
$router->get('/api/finance/clients', [FinanceController::class, 'getClients'], [AuthMiddleware::class]);
$router->post('/api/finance/clients', [FinanceController::class, 'createClient'], [AuthMiddleware::class]);
$router->put('/api/finance/clients/:id', [FinanceController::class, 'updateClient'], [AuthMiddleware::class]);
$router->delete('/api/finance/clients/:id', [FinanceController::class, 'deleteClient'], [AuthMiddleware::class]);
$router->get('/api/finance/services', [FinanceController::class, 'getServices'], [AuthMiddleware::class]);
$router->post('/api/finance/services', [FinanceController::class, 'createService'], [AuthMiddleware::class]);
$router->put('/api/finance/services/:id', [FinanceController::class, 'updateService'], [AuthMiddleware::class]);
$router->delete('/api/finance/services/:id', [FinanceController::class, 'deleteService'], [AuthMiddleware::class]);
$router->get('/api/finance/invoices', [FinanceController::class, 'getInvoices'], [AuthMiddleware::class]);
$router->get('/api/finance/invoices/:id', [FinanceController::class, 'getInvoiceDetails'], [AuthMiddleware::class]);
$router->post('/api/finance/invoices', [FinanceController::class, 'createInvoice'], [AuthMiddleware::class]);
$router->put('/api/finance/invoices/:id', [FinanceController::class, 'updateInvoice'], [AuthMiddleware::class]);
$router->patch('/api/finance/invoices/:id/status', [FinanceController::class, 'updateInvoiceStatus'], [AuthMiddleware::class]);
$router->post('/api/finance/invoices/:id/payments', [FinanceController::class, 'addInvoicePayment'], [AuthMiddleware::class]);
$router->get('/api/finance/invoices/:id/payments', [FinanceController::class, 'getInvoicePayments'], [AuthMiddleware::class]);
$router->delete('/api/finance/invoices/payments/:paymentId', [FinanceController::class, 'deleteInvoicePayment'], [AuthMiddleware::class]);
$router->delete('/api/finance/invoices/:id', [FinanceController::class, 'deleteInvoice'], [AuthMiddleware::class]);
$router->get('/api/finance/control-summary', [FinanceController::class, 'getControlSummary'], [AuthMiddleware::class]);
$router->get('/api/finance/transactions', [FinanceController::class, 'getTransactions'], [AuthMiddleware::class]);
$router->post('/api/finance/transactions', [FinanceController::class, 'createTransaction'], [AuthMiddleware::class]);
$router->put('/api/finance/transactions/:id', [FinanceController::class, 'updateTransaction'], [AuthMiddleware::class]);
$router->delete('/api/finance/transactions/:id', [FinanceController::class, 'deleteTransaction'], [AuthMiddleware::class]);

// ──────────────────────────────────────────────────────────────
//  RUTAS DE ANALYTICS (/api/analytics)
// ──────────────────────────────────────────────────────────────
$router->post('/api/analytics/track', [AnalyticsController::class, 'trackEvent']);
$router->get('/api/analytics/metrics', [AnalyticsController::class, 'getDashboardMetrics'], [AuthMiddleware::class]);

// ──────────────────────────────────────────────────────────────
//  RUTAS DE REPORTES (/api/reports)
// ──────────────────────────────────────────────────────────────
$router->get('/api/reports/activity', [ReportsController::class, 'getActivityLogs'], [AuthMiddleware::class]);
$router->post('/api/reports/activity', [ReportsController::class, 'logActivity'], [AuthMiddleware::class]);
$router->get('/api/reports/logs', [ReportsController::class, 'getActivityLogs'], [AuthMiddleware::class]);
$router->post('/api/reports/logs', [ReportsController::class, 'logActivity'], [AuthMiddleware::class]);

// ──────────────────────────────────────────────────────────────
//  RUTAS DE CONFIGURACIÓN DEL SISTEMA (/api/config)
// ──────────────────────────────────────────────────────────────
$router->get('/api/config/settings', [ConfigController::class, 'getSettings']);
$router->put('/api/config/settings', [ConfigController::class, 'updateSettings'], [AuthMiddleware::class]);

// ──────────────────────────────────────────────────────────────
//  RUTAS DE MENSAJES DE CONTACTO (/api/messages)
// ──────────────────────────────────────────────────────────────
$router->post('/api/messages/send', [MessagesController::class, 'sendMessage']);
$router->get('/api/messages', [MessagesController::class, 'getMessages'], [AuthMiddleware::class]);
$router->put('/api/messages/:id/status', [MessagesController::class, 'updateStatus'], [AuthMiddleware::class]);
$router->delete('/api/messages/:id', [MessagesController::class, 'deleteMessage'], [AuthMiddleware::class]);

// ──────────────────────────────────────────────────────────────
//  RUTAS DE LANDING PAGES (USER SITES) (/api/site)
// ──────────────────────────────────────────────────────────────
$router->get('/api/site/my', [SiteController::class, 'getMySite'], [AuthMiddleware::class]);
$router->post('/api/site/save', [SiteController::class, 'saveMySite'], [AuthMiddleware::class]);
$router->get('/api/site/:slug', [SiteController::class, 'getBySlug']);

// ──────────────────────────────────────────────────────────────
//  RUTAS DE BIBLIOTECA DE ESTUDIO (/api/library)
// ──────────────────────────────────────────────────────────────
// Carpetas (Nivel 1)
$router->get('/api/library/folders', [LibraryController::class, 'getFolders'], [OptionalAuthMiddleware::class]);
$router->post('/api/library/folders', [LibraryController::class, 'createFolder'], [OptionalAuthMiddleware::class]);
$router->put('/api/library/folders/:id', [LibraryController::class, 'updateFolder'], [OptionalAuthMiddleware::class]);
$router->delete('/api/library/folders/:id', [LibraryController::class, 'deleteFolder'], [OptionalAuthMiddleware::class]);

// Cuadernos (Nivel 2)
$router->get('/api/library/notebooks', [LibraryController::class, 'getNotebooks'], [OptionalAuthMiddleware::class]);
$router->post('/api/library/notebooks', [LibraryController::class, 'createNotebook'], [OptionalAuthMiddleware::class]);
$router->put('/api/library/notebooks/:id', [LibraryController::class, 'updateNotebook'], [OptionalAuthMiddleware::class]);
$router->delete('/api/library/notebooks/:id', [LibraryController::class, 'deleteNotebook'], [OptionalAuthMiddleware::class]);

// Apuntes / Páginas (Nivel 3)
$router->get('/api/library/pages', [LibraryController::class, 'getPages'], [OptionalAuthMiddleware::class]);
$router->post('/api/library/pages', [LibraryController::class, 'createPage'], [OptionalAuthMiddleware::class]);
$router->put('/api/library/pages/:id', [LibraryController::class, 'updatePage'], [OptionalAuthMiddleware::class]);
$router->delete('/api/library/pages/:id', [LibraryController::class, 'deletePage'], [OptionalAuthMiddleware::class]);

// Buscador Global
$router->get('/api/library/search', [LibraryController::class, 'searchLibrary'], [OptionalAuthMiddleware::class]);

// ──────────────────────────────────────────────────────────────
//  RUTAS DE CENTRO DE COMANDO IA (/api/command-center)
// ──────────────────────────────────────────────────────────────
$router->post('/api/command-center/query', [CommandCenterController::class, 'query'], [OptionalAuthMiddleware::class]);
$router->post('/api/command-center/query-audio', [CommandCenterController::class, 'queryAudio'], [OptionalAuthMiddleware::class]);
$router->post('/api/command-center/activity', [CommandCenterController::class, 'logActivity'], [OptionalAuthMiddleware::class]);
$router->get('/api/command-center/radar', [CommandCenterController::class, 'getRadar'], [OptionalAuthMiddleware::class]);
$router->get('/api/command-center/suggestions', [CommandCenterController::class, 'getSuggestions'], [OptionalAuthMiddleware::class]);
$router->get('/api/command-center/recent-activities', [CommandCenterController::class, 'getRecentActivities'], [OptionalAuthMiddleware::class]);

// ──────────────────────────────────────────────────────────────
//  RUTAS DE ROTBOT IA CON ELEVENLABS & OJOS OLED (/api/robot)
// ──────────────────────────────────────────────────────────────
$router->post('/api/robot/chat', [RobotChatController::class, 'chat'], [OptionalAuthMiddleware::class]);
$router->post('/api/robot_chat.php', [RobotChatController::class, 'chat'], [OptionalAuthMiddleware::class]);
$router->post('/api/robot/transcribe', [RobotChatController::class, 'transcribe'], [OptionalAuthMiddleware::class]);

// ──────────────────────────────────────────────────────────────
//  RUTAS DE PLANES DE ESTUDIO DE ROTBOT (/api/robot/study-plans)
// ──────────────────────────────────────────────────────────────
$router->get('/api/robot/study-plans', [StudyPlanController::class, 'getAll'], [OptionalAuthMiddleware::class]);
$router->post('/api/robot/study-plans', [StudyPlanController::class, 'create'], [OptionalAuthMiddleware::class]);
$router->put('/api/robot/study-plans/:id', [StudyPlanController::class, 'update'], [OptionalAuthMiddleware::class]);
$router->delete('/api/robot/study-plans/:id', [StudyPlanController::class, 'delete'], [OptionalAuthMiddleware::class]);
$router->post('/api/robot/study-plans/:id/activate', [StudyPlanController::class, 'activate'], [OptionalAuthMiddleware::class]);
$router->get('/api/robot/study-plans/active', [StudyPlanController::class, 'getActive'], [OptionalAuthMiddleware::class]);

// Despachar la petición protegido contra errores fatales no capturados
try {
    $router->dispatch($request, $response);
} catch (\Throwable $e) {
    error_log('[Global Dispatch Error] ' . $e->getMessage() . ' en ' . $e->getFile() . ':' . $e->getLine());
    $response->status(500)->json([
        'ok' => false,
        'message' => 'Error interno del servidor',
        'error' => $e->getMessage()
    ]);
}
