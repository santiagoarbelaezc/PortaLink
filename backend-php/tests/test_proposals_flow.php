<?php
require __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->safeLoad();

use App\Core\Database;
use App\Core\Request;
use App\Core\Response;
use App\Controllers\FinanceController;

$pdo = Database::getConnection();

// Create mock user
$mockUser = (object)['id' => 1];

$controller = new FinanceController();

echo "========================================\n";
echo "TEST SUITE: Software Proposals & Deliverables\n";
echo "========================================\n\n";

$passed = 0;
$failed = 0;

function assertTest($condition, $message) {
    global $passed, $failed;
    if ($condition) {
        echo "  [PASS] $message\n";
        $passed++;
    } else {
        echo "  [FAIL] $message\n";
        $failed++;
    }
}

// ──────────────────────────────────────────────
// TEST 1: Create a proposal with comma-rich items
// ──────────────────────────────────────────────
echo "--- TEST 1: Creation of proposal with comma-rich items ---\n";

$initialItems = [
    [
        'title' => 'Bases de datos, una para uso, otra de respaldo',
        'description' => 'Alta disponibilidad con replicación MySQL en tiempo real.',
        'included' => true
    ],
    [
        'title' => 'Infraestructura Cloud, Hosting & Certificado SSL',
        'description' => 'Servidor dedicado en la nube con cifrado HTTPS.',
        'included' => true
    ],
    [
        'title' => 'Panel Administrativo Directivo (Dashboard)',
        'description' => 'Control de usuarios y métricas.',
        'included' => true
    ],
    [
        'title' => 'Módulo de Facturación Electrónica',
        'description' => 'Integración DIAN.',
        'included' => false
    ]
];

$reqBody = [
    'projectTitle' => 'Test Portalink ERP & CRM',
    'clientName' => 'Empresa Prueba SAS',
    'clientCompany' => 'Grupo Empresarial',
    'clientEmail' => 'contacto@prueba.com',
    'clientPhone' => '+57 300 123 4567',
    'totalAmount' => 4500000,
    'paymentTerms' => '50% anticipo, 50% contra entrega',
    'deliveryTime' => '4 semanas',
    'warranty' => '12 meses',
    'items' => $initialItems
];

// Mock Request & Response
class MockResponse extends Response {
    public int $statusCode = 200;
    public $data = null;
    public function status(int $code): self {
        $this->statusCode = $code;
        return $this;
    }
    public function json($data): void {
        $this->data = $data;
    }
}

$req1 = new Request();
$req1->user = $mockUser;
$req1->body = $reqBody;
$res1 = new MockResponse();

$controller->createSoftwareProposal($req1, $res1);

assertTest($res1->statusCode === 201, "Controller returns HTTP 201 on creation");
assertTest(isset($res1->data['proposalId']), "Proposal ID is returned: " . ($res1->data['proposalId'] ?? 'none'));
assertTest(isset($res1->data['serviceId']), "Service ID is returned: " . ($res1->data['serviceId'] ?? 'none'));

$proposalId = $res1->data['proposalId'];
$serviceId = $res1->data['serviceId'];

// Verify in DB
$stmt = $pdo->prepare("SELECT * FROM finance_software_proposals WHERE id = ?");
$stmt->execute([$proposalId]);
$dbProp = $stmt->fetch(PDO::FETCH_ASSOC);
$savedItems = json_decode($dbProp['items'], true);

assertTest(count($savedItems) === 4, "DB contains exactly 4 items (no split or duplication)");
assertTest($savedItems[0]['title'] === 'Bases de datos, una para uso, otra de respaldo', "Item with commas in title is intact");
assertTest($savedItems[3]['included'] === false, "Unchecked deliverable preserves included = false");

// Verify service description uses ' | ' delimiter
$stmtS = $pdo->prepare("SELECT * FROM finance_services WHERE id = ?");
$stmtS->execute([$serviceId]);
$dbService = $stmtS->fetch(PDO::FETCH_ASSOC);
assertTest(str_contains($dbService['description'], ' • Entregables: '), "Service description contains deliverables header");
assertTest(str_contains($dbService['description'], 'Bases de datos, una para uso, otra de respaldo | Infraestructura Cloud, Hosting & Certificado SSL'), "Service description separates items with ' | '");


// ──────────────────────────────────────────────
// TEST 2: Update proposal multiple times (simulate editing cycle)
// ──────────────────────────────────────────────
echo "\n--- TEST 2: Multiple Update Cycles without Duplication ---\n";

for ($cycle = 1; $cycle <= 3; $cycle++) {
    // Simulate user editing: keeping the 4 items
    $updateBody = [
        'projectTitle' => 'Test Portalink ERP & CRM (Rev ' . $cycle . ')',
        'clientName' => 'Empresa Prueba SAS',
        'clientCompany' => 'Grupo Empresarial',
        'totalAmount' => 4500000 + ($cycle * 100000),
        'paymentTerms' => '50% anticipo, 50% contra entrega',
        'deliveryTime' => '4 semanas',
        'warranty' => '12 meses',
        'items' => $savedItems // Send current items back
    ];

    $reqUp = new Request();
    $reqUp->user = $mockUser;
    $reqUp->params = ['id' => $proposalId];
    $reqUp->body = $updateBody;
    $resUp = new MockResponse();

    $controller->updateSoftwareProposal($reqUp, $resUp);

    $stmtCheck = $pdo->prepare("SELECT * FROM finance_software_proposals WHERE id = ?");
    $stmtCheck->execute([$proposalId]);
    $reloadedProp = $stmtCheck->fetch(PDO::FETCH_ASSOC);
    $reloadedItems = json_decode($reloadedProp['items'], true);

    assertTest(count($reloadedItems) === 4, "Cycle $cycle: Item count strictly remains 4 (zero duplicates)");
}


// ──────────────────────────────────────────────
// TEST 3: Attempting to send duplicate items
// ──────────────────────────────────────────────
echo "\n--- TEST 3: Deduplication when sending duplicates ---\n";

$itemsWithDuplicates = $savedItems;
// Add duplicate of item 0
$itemsWithDuplicates[] = [
    'title' => 'bases de datos, UNA para uso, otra de respaldo ', // Different casing/spacing
    'description' => 'Duplicate attempt',
    'included' => true
];
// Add duplicate of item 1
$itemsWithDuplicates[] = [
    'title' => 'Infraestructura Cloud, Hosting & Certificado SSL',
    'description' => 'Another duplicate',
    'included' => true
];

$reqDup = new Request();
$reqDup->user = $mockUser;
$reqDup->params = ['id' => $proposalId];
$reqDup->body = [
    'projectTitle' => 'Test Portalink ERP',
    'clientName' => 'Empresa SAS',
    'totalAmount' => 5000000,
    'items' => $itemsWithDuplicates
];
$resDup = new MockResponse();
$controller->updateSoftwareProposal($reqDup, $resDup);

$stmtDup = $pdo->prepare("SELECT * FROM finance_software_proposals WHERE id = ?");
$stmtDup->execute([$proposalId]);
$afterDupItems = json_decode($stmtDup->fetch(PDO::FETCH_ASSOC)['items'], true);

assertTest(count($afterDupItems) === 4, "Backend automatically stripped case-insensitive duplicates (retains exactly 4)");


// ──────────────────────────────────────────────
// TEST 4: getServices correctly returns proposal_items
// ──────────────────────────────────────────────
echo "\n--- TEST 4: getServices Joins and Parses proposal_items ---\n";

$reqGet = new Request();
$reqGet->user = $mockUser;
$resGet = new MockResponse();

$controller->getServices($reqGet, $resGet);
$services = $resGet->data['services'] ?? [];

$found = null;
foreach ($services as $s) {
    if ((int)$s['id'] === (int)$serviceId) {
        $found = $s;
        break;
    }
}

assertTest($found !== null, "Found service in getServices list");
assertTest(is_array($found['proposal_items']), "proposal_items is decoded as PHP array");
assertTest(count($found['proposal_items']) === 4, "proposal_items count in service matches exactly 4");


// ──────────────────────────────────────────────
// CLEANUP TEST DATA
// ──────────────────────────────────────────────
echo "\n--- CLEANUP ---\n";
$del1 = $pdo->prepare("DELETE FROM finance_software_proposals WHERE id = ?");
$del1->execute([$proposalId]);
$del2 = $pdo->prepare("DELETE FROM finance_services WHERE id = ?");
$del2->execute([$serviceId]);
echo "Test data removed successfully.\n";

echo "\n========================================\n";
echo "SUMMARY: Passed: $passed | Failed: $failed\n";
echo "========================================\n";

if ($failed > 0) {
    exit(1);
}
