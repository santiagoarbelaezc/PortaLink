<?php

// Trigger de despliegue continuo - PortaLink Backend API (Hostinger)
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

// Aplicar CORS estricto con lista blanca y cabeceras de seguridad (después de cargar .env para tomar FRONTEND_URL si aplica)
\App\Core\Cors::handle();

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
use App\Controllers\ConfigController;
use App\Controllers\MessagesController;
use App\Controllers\SiteController;
use App\Controllers\LibraryController;
use App\Controllers\ChatAdminController;
use App\Controllers\CommandCenterController;
use App\Controllers\RobotChatController;

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
//  RUTA DE DIAGNÓSTICO DE BD (PROTEGIDA SOLO PARA ADMINISTRADOR)
// ──────────────────────────────────────────────────────────────
$router->get('/api/setup-db', function (Request $req, Response $res) {
    if (!$req->user || strtolower((string)($req->user->rol ?? '')) !== 'admin') {
        $res->status(403)->json(['ok' => false, 'message' => 'Acceso restringido a administradores']);
        return;
    }
    $log = [];

    try {
        $pdo = \App\Core\Database::getConnection();
        $log[] = "✅ Conexión establecida correctamente desde variables de entorno (.env).";
    } catch (Exception $e) {
        error_log('[SetupDB] Connection error: ' . $e->getMessage());
        $res->status(500)->json([
            'ok' => false,
            'message' => 'No se pudo establecer conexión con la base de datos.'
        ]);
        return;
    }

    // Ejecutar schema_mysql.sql
    $schemaPath = __DIR__ . '/schema_mysql.sql';
    if (!file_exists($schemaPath)) {
        $res->status(500)->json([
            'ok' => false,
            'message' => 'No se encontró el archivo schema_mysql.sql'
        ]);
        return;
    }

    $sqlContent = file_get_contents($schemaPath);

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
                        error_log('[SetupDB] Schema notice: ' . $ex->getMessage());
                    }
                }
            }
        }

        $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
        $log[] = "✅ Script ejecutado ({$executed} sentencias procesadas).";
    } catch (Exception $e) {
        error_log('[SetupDB] Schema error: ' . $e->getMessage());
        $log[] = "❌ Error ejecutando schema.";
    }

    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);

    $res->json([
        'ok' => true,
        'tablas_creadas' => count($tables),
        'log' => $log
    ]);
}, [AuthMiddleware::class]);

// ──────────────────────────────────────────────────────────────
//  RUTAS DE AUTENTICACIÓN (/api/auth)
// ──────────────────────────────────────────────────────────────
$router->post('/api/auth/login', [AuthController::class, 'login']);
$router->post('/api/auth/logout', [AuthController::class, 'logout']);
$router->get('/api/auth/verify', [AuthController::class, 'verifySession'], [AuthMiddleware::class]);
$router->get('/api/auth/captcha', [AuthController::class, 'getCaptcha']);
$router->post('/api/auth/register', [AuthController::class, 'register']);
$router->get('/api/auth/users', [AuthController::class, 'getUsers'], [AuthMiddleware::class]);
$router->put('/api/auth/users/:id/role', [AuthController::class, 'updateUserRole'], [AuthMiddleware::class]);
$router->delete('/api/auth/users/:id', [AuthController::class, 'deleteUser'], [AuthMiddleware::class]);
$router->put('/api/auth/password', [AuthController::class, 'updatePassword'], [AuthMiddleware::class]);
$router->put('/api/auth/profile', [AuthController::class, 'updateProfile'], [AuthMiddleware::class]);
$router->get('/api/auth/verify-email', [AuthController::class, 'verifyEmail']);
$router->post('/api/auth/resend-verification', [AuthController::class, 'resendVerification']);
$router->post('/api/auth/forgot-password', [AuthController::class, 'forgotPassword']);
$router->post('/api/auth/reset-password', [AuthController::class, 'resetPassword']);

// ──────────────────────────────────────────────────────────────
//  RUTAS DE CHAT & IA (/api/chat)
// ──────────────────────────────────────────────────────────────
$router->post('/api/chat/send', [ChatController::class, 'sendMessage'], [OptionalAuthMiddleware::class]);
$router->post('/api/admin/chat', [ChatAdminController::class, 'handle'], [AuthMiddleware::class]);
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
$router->get('/api/finance/software-proposals', [FinanceController::class, 'getSoftwareProposals'], [AuthMiddleware::class]);
$router->post('/api/finance/software-proposals', [FinanceController::class, 'createSoftwareProposal'], [AuthMiddleware::class]);
$router->put('/api/finance/software-proposals/:id', [FinanceController::class, 'updateSoftwareProposal'], [AuthMiddleware::class]);
$router->delete('/api/finance/software-proposals/:id', [FinanceController::class, 'deleteSoftwareProposal'], [AuthMiddleware::class]);
$router->get('/api/finance/invoices', [FinanceController::class, 'getInvoices'], [AuthMiddleware::class]);
$router->get('/api/finance/invoices/:id', [FinanceController::class, 'getInvoiceDetails'], [AuthMiddleware::class]);
$router->post('/api/finance/invoices', [FinanceController::class, 'createInvoice'], [AuthMiddleware::class]);
$router->put('/api/finance/invoices/:id', [FinanceController::class, 'updateInvoice'], [AuthMiddleware::class]);
$router->patch('/api/finance/invoices/:id/status', [FinanceController::class, 'updateInvoiceStatus'], [AuthMiddleware::class]);
$router->put('/api/finance/invoices/:id/status', [FinanceController::class, 'updateInvoiceStatus'], [AuthMiddleware::class]);
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
//  RUTAS DE CONFIGURACIÓN DEL SISTEMA (/api/config)
// ──────────────────────────────────────────────────────────────
$router->get('/api/config/settings', [ConfigController::class, 'getSettings']);
$router->put('/api/config/settings', [ConfigController::class, 'updateSettings'], [AuthMiddleware::class]);

// ──────────────────────────────────────────────────────────────
//  RUTAS DE MENSAJES DE CONTACTO (/api/messages)
// ──────────────────────────────────────────────────────────────
$router->post('/api/messages/send', [MessagesController::class, 'sendMessage']);
$router->post('/api/messages', [MessagesController::class, 'sendMessage']);
$router->get('/api/messages', [MessagesController::class, 'getMessages'], [AuthMiddleware::class]);
$router->put('/api/messages/:id/status', [MessagesController::class, 'updateStatus'], [AuthMiddleware::class]);
$router->put('/api/messages/:id/read', [MessagesController::class, 'updateStatus'], [AuthMiddleware::class]);
$router->put('/api/messages/:id', [MessagesController::class, 'updateStatus'], [AuthMiddleware::class]);
$router->delete('/api/messages/:id', [MessagesController::class, 'deleteMessage'], [AuthMiddleware::class]);

// ──────────────────────────────────────────────────────────────
//  RUTAS DE LANDING PAGES (USER SITES) (/api/site)
// ──────────────────────────────────────────────────────────────
$router->get('/api/site/my', [SiteController::class, 'getMySite'], [AuthMiddleware::class]);
$router->post('/api/site/save', [SiteController::class, 'saveMySite'], [AuthMiddleware::class]);
$router->get('/api/site/:slug', [SiteController::class, 'getBySlug']);

// ──────────────────────────────────────────────────────────────
//  RUTAS DE BIBLIOTECA DE ESTUDIO (/api/library) — PROTEGIDAS CON JWT ESTRICTO
// ──────────────────────────────────────────────────────────────
// Carpetas (Nivel 1)
$router->get('/api/library/folders', [LibraryController::class, 'getFolders'], [AuthMiddleware::class]);
$router->post('/api/library/folders', [LibraryController::class, 'createFolder'], [AuthMiddleware::class]);
$router->put('/api/library/folders/:id', [LibraryController::class, 'updateFolder'], [AuthMiddleware::class]);
$router->delete('/api/library/folders/:id', [LibraryController::class, 'deleteFolder'], [AuthMiddleware::class]);

// Cuadernos (Nivel 2)
$router->get('/api/library/notebooks', [LibraryController::class, 'getNotebooks'], [AuthMiddleware::class]);
$router->post('/api/library/notebooks', [LibraryController::class, 'createNotebook'], [AuthMiddleware::class]);
$router->put('/api/library/notebooks/:id', [LibraryController::class, 'updateNotebook'], [AuthMiddleware::class]);
$router->delete('/api/library/notebooks/:id', [LibraryController::class, 'deleteNotebook'], [AuthMiddleware::class]);

// Apuntes / Páginas (Nivel 3)
$router->get('/api/library/pages', [LibraryController::class, 'getPages'], [AuthMiddleware::class]);
$router->post('/api/library/pages', [LibraryController::class, 'createPage'], [AuthMiddleware::class]);
$router->put('/api/library/pages/:id', [LibraryController::class, 'updatePage'], [AuthMiddleware::class]);
$router->delete('/api/library/pages/:id', [LibraryController::class, 'deletePage'], [AuthMiddleware::class]);

// Buscador Global
$router->get('/api/library/search', [LibraryController::class, 'searchLibrary'], [AuthMiddleware::class]);

// Subida de imágenes a Cloudinary para notas
$router->post('/api/library/upload-image', [LibraryController::class, 'uploadImage'], [AuthMiddleware::class]);

// Validación e inspección de código con IA
$router->post('/api/library/validate-code', [LibraryController::class, 'validateCode'], [AuthMiddleware::class]);

// ──────────────────────────────────────────────────────────────
//  RUTAS DE CENTRO DE COMANDO IA (/api/command-center) — PROTEGIDAS CON JWT ESTRICTO
// ──────────────────────────────────────────────────────────────
$router->post('/api/command-center/query', [CommandCenterController::class, 'query'], [AuthMiddleware::class]);
$router->post('/api/command-center/query-audio', [CommandCenterController::class, 'queryAudio'], [AuthMiddleware::class]);
$router->post('/api/command-center/activity', [CommandCenterController::class, 'logActivity'], [AuthMiddleware::class]);
$router->get('/api/command-center/radar', [CommandCenterController::class, 'getRadar'], [AuthMiddleware::class]);
$router->get('/api/command-center/suggestions', [CommandCenterController::class, 'getSuggestions'], [AuthMiddleware::class]);
$router->get('/api/command-center/recent-activities', [CommandCenterController::class, 'getRecentActivities'], [AuthMiddleware::class]);

// ──────────────────────────────────────────────────────────────
//  RUTAS DE ROTBOT IA CON ELEVENLABS & OJOS OLED (/api/robot)
// ──────────────────────────────────────────────────────────────
$router->post('/api/robot/chat', [RobotChatController::class, 'chat'], [OptionalAuthMiddleware::class]);
$router->post('/api/robot_chat.php', [RobotChatController::class, 'chat'], [OptionalAuthMiddleware::class]);
$router->post('/api/robot/tts', [RobotChatController::class, 'generateTts'], [OptionalAuthMiddleware::class]);
$router->post('/api/robot/transcribe', [RobotChatController::class, 'transcribe'], [OptionalAuthMiddleware::class]);

// Despachar la petición protegido contra errores fatales no capturados
try {
    $router->dispatch($request, $response);
} catch (\Throwable $e) {
    error_log('[Global Dispatch Error] ' . $e->getMessage() . ' en ' . $e->getFile() . ':' . $e->getLine());
    $response->status(500)->json([
        'ok' => false,
        'message' => 'Error interno del servidor'
    ]);
}
