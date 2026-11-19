<?php

/**
 * Suite de Pruebas de Seguridad e Integridad Contable para Finanzas y Cuentas de Cobro
 */

require_once __DIR__ . '/../src/Core/VaultCrypto.php';
require_once __DIR__ . '/../src/Core/Database.php';
require_once __DIR__ . '/../src/Core/Request.php';
require_once __DIR__ . '/../src/Core/Response.php';
require_once __DIR__ . '/../src/Controllers/FinanceController.php';

use App\Core\VaultCrypto;
use App\Core\Database;
use App\Controllers\FinanceController;

$_ENV['JWT_SECRET'] = 'test_finance_vault_master_secret_2026_high_entropy_key_99887766';

$passed = 0;
$failed = 0;

function assertFinSec(bool $condition, string $label): void
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

echo "=== 1. PRUEBAS DE PREVENCIÓN DE EXFILTRACIÓN IDOR EN EMULADOR RETURNING (Database.php) ===\n";

$sampleUpdateSql = "UPDATE finance_clients SET name = :pg_p_1_1, tax_id = :pg_p_5_1 WHERE id = :pg_p_8_1 AND user_id = :pg_p_9_1";
$sampleParams = [
    ':pg_p_1_1' => 'Attacked Name',
    ':pg_p_5_1' => '900123456-1',
    ':pg_p_8_1' => 42,
    ':pg_p_9_1' => 99
];

$extracted = Database::extractWhereClauseAndParams($sampleUpdateSql, $sampleParams);
assertFinSec($extracted !== null, 'Database::extractWhereClauseAndParams extrae correctamente la cláusula WHERE');
assertFinSec(
    str_contains($extracted['where'], 'id = :pg_p_8_1') && str_contains($extracted['where'], 'user_id = :pg_p_9_1'),
    'La cláusula WHERE extraída preserva tanto id como user_id (impide lectura cross-tenant)'
);
assertFinSec(
    isset($extracted['params'][':pg_p_8_1'], $extracted['params'][':pg_p_9_1']) &&
    $extracted['params'][':pg_p_8_1'] === 42 &&
    $extracted['params'][':pg_p_9_1'] === 99 &&
    count($extracted['params']) === 2,
    'Los parámetros extraídos para la verificación previa contienen exactamente id y user_id'
);

echo "\n=== 2. PRUEBAS DE CIFRADO AES-256-GCM EN DATOS TRIBUTARIOS Y NOTAS DE CUENTAS DE COBRO ===\n";

$rawClient = [
    'id' => 10,
    'name' => 'Corporación Bancaria S.A.S.',
    'tax_id' => FinanceController::encryptField('901.456.789-4'),
    'address' => FinanceController::encryptField('Calle 100 # 8A-55 Torre A Oficina 702'),
    'notes' => FinanceController::encryptField('Cuenta bancaria convenio recaudo: 0045-9988-7711')
];

assertFinSec(VaultCrypto::isEncrypted($rawClient['tax_id']), 'El NIT/RUT (tax_id) del cliente se almacena cifrado con AES-256-GCM');
assertFinSec(!str_contains($rawClient['tax_id'], '901.456.789-4'), 'El ciphertext del NIT/RUT no expone el documento tributario en texto plano');
assertFinSec(VaultCrypto::isEncrypted($rawClient['address']), 'La dirección física del cliente se almacena cifrada con AES-256-GCM');
assertFinSec(VaultCrypto::isEncrypted($rawClient['notes']), 'Las notas confidenciales del cliente se almacenan cifradas con AES-256-GCM');

$decryptedClient = FinanceController::decryptClientRow($rawClient);
assertFinSec($decryptedClient['tax_id'] === '901.456.789-4', 'decryptClientRow recupera el NIT/RUT exacto en memoria');
assertFinSec($decryptedClient['address'] === 'Calle 100 # 8A-55 Torre A Oficina 702', 'decryptClientRow recupera la dirección exacta');
assertFinSec($decryptedClient['notes'] === 'Cuenta bancaria convenio recaudo: 0045-9988-7711', 'decryptClientRow recupera las notas confidenciales');

$rawInvoice = [
    'id' => 55,
    'invoice_number' => 'PL-2026-8801',
    'notes' => FinanceController::encryptField('Pagar a cuenta ahorros Bancolombia #123-456789-00'),
    'payment_notes' => FinanceController::encryptField('Comprobante PSE #99441122'),
    'tax_id' => FinanceController::encryptField('901.456.789-4'),
    'payments' => [
        [
            'id' => 1,
            'amount' => 1500000,
            'notes' => FinanceController::encryptField('Primer abono 50% anticipo')
        ]
    ]
];

assertFinSec(VaultCrypto::isEncrypted($rawInvoice['notes']), 'Las notas de la cuenta de cobro se cifran con AES-256-GCM');
assertFinSec(VaultCrypto::isEncrypted($rawInvoice['payment_notes']), 'Las notas de pago de la cuenta de cobro se cifran con AES-256-GCM');

$decryptedInvoice = FinanceController::decryptInvoiceRow($rawInvoice);
assertFinSec($decryptedInvoice['notes'] === 'Pagar a cuenta ahorros Bancolombia #123-456789-00', 'decryptInvoiceRow descifra notas de factura');
assertFinSec($decryptedInvoice['payment_notes'] === 'Comprobante PSE #99441122', 'decryptInvoiceRow descifra payment_notes de factura');
assertFinSec($decryptedInvoice['payments'][0]['notes'] === 'Primer abono 50% anticipo', 'decryptInvoiceRow descifra las notas de cada abono parcial');

echo "\n=== 3. PRUEBAS DE INTEGRIDAD CONTABLE Y VALIDACIÓN DE MONTOS EN CUENTAS DE COBRO ===\n";

$validCalc = FinanceController::validateInvoiceItemsAndAmounts([
    ['quantity' => 2, 'unit_price' => 1250000],
    ['quantity' => 1, 'unit_price' => 500000],
], 570000);
assertFinSec(
    $validCalc['ok'] === true && $validCalc['subtotal'] === 3000000.0 && $validCalc['total_amount'] === 3570000.0,
    'Cálculo contable exacto para ítems e impuestos válidos ($3.000.000 + $570.000 = $3.570.000)'
);

$negQty = FinanceController::validateInvoiceItemsAndAmounts([
    ['quantity' => -3, 'unit_price' => 1000000]
], 0);
assertFinSec($negQty['ok'] === false, 'Rechaza ítems con cantidad negativa (quantity: -3)');

$zeroQty = FinanceController::validateInvoiceItemsAndAmounts([
    ['quantity' => 0, 'unit_price' => 1000000]
], 0);
assertFinSec($zeroQty['ok'] === false, 'Rechaza ítems con cantidad cero (quantity: 0)');

$negPrice = FinanceController::validateInvoiceItemsAndAmounts([
    ['quantity' => 1, 'unit_price' => -500000]
], 0);
assertFinSec($negPrice['ok'] === false, 'Rechaza ítems con precio unitario negativo (unit_price: -500000)');

$negTax = FinanceController::validateInvoiceItemsAndAmounts([
    ['quantity' => 1, 'unit_price' => 1000000]
], -190000);
assertFinSec($negTax['ok'] === false, 'Rechaza cuentas de cobro con impuesto negativo (tax_amount: -190000)');

echo "\n=== 4. AUDITORÍA ESTÁTICA DE RUTAS, ANTI-IDOR, CWE-209 Y CONTABILIDAD ===\n";

$indexContent = file_get_contents(__DIR__ . '/../index.php');
preg_match_all('/\$router->(?:get|post|put|patch|delete)\(\'\/api\/finance\/[^\']+\'.*?\);/', $indexContent, $finRoutes);
assertFinSec(count($finRoutes[0]) === 28, 'Existen las 28 rutas de /api/finance/* registradas (incluyendo PATCH y PUT para status)');

$allFinProtected = true;
foreach ($finRoutes[0] as $routeLine) {
    if (!str_contains($routeLine, 'AuthMiddleware::class') || str_contains($routeLine, 'OptionalAuthMiddleware')) {
        $allFinProtected = false;
        echo "  [!] Ruta financiera desprotegida: {$routeLine}\n";
    }
}
assertFinSec($allFinProtected, 'Las 28 rutas de /api/finance/* exigen AuthMiddleware::class estricto');

$finCtrlContent = file_get_contents(__DIR__ . '/../src/Controllers/FinanceController.php');
assertFinSec(
    !preg_match('/\$response->status\(500\)->json\(\[[^\]]*getMessage\(\)/', $finCtrlContent),
    'FinanceController no expone $error->getMessage() en ninguna respuesta JSON HTTP 500 (CWE-209 mitigado)'
);
assertFinSec(
    str_contains($finCtrlContent, '$this->userOwnsClient($clientId, $userId)') &&
    str_contains($finCtrlContent, '$this->userOwnsService($srvId, $userId)'),
    'FinanceController valida pertenencia Anti-IDOR de client_id y service_id antes de insertar/actualizar facturas'
);
assertFinSec(
    str_contains($finCtrlContent, 'DELETE FROM finance_invoice_payments WHERE invoice_id = ? AND user_id = ?') &&
    str_contains($finCtrlContent, 'SELECT transaction_id FROM finance_invoice_payments WHERE invoice_id = ? AND user_id = ?'),
    'deleteInvoice elimina en cascada los abonos y las transacciones asociadas sin dejar registros huérfanos'
);
assertFinSec(
    str_contains($finCtrlContent, 'NOT EXISTS') && str_contains($finCtrlContent, 'WHERE p.transaction_id = t.id'),
    'getControlSummary previene la doble contabilización entre facturas pagadas y transacciones de abonos'
);

$ccCtrlContent = file_get_contents(__DIR__ . '/../src/Controllers/CommandCenterController.php');
assertFinSec(
    str_contains($ccCtrlContent, 'FROM finance_clients') &&
    preg_match('/FROM finance_clients\s+WHERE user_id = \$1/s', $ccCtrlContent) === 1 &&
    preg_match('/FROM finance_invoices i\s+LEFT JOIN finance_clients c ON i\.client_id = c\.id AND c\.user_id = i\.user_id\s+WHERE i\.user_id = \$1/s', $ccCtrlContent) === 1,
    'CommandCenterController aísla estrictamente finance_clients y finance_invoices por user_id = $1'
);

$cloudinaryContent = file_get_contents(__DIR__ . '/../src/Config/Cloudinary.php');
assertFinSec(
    !str_contains($cloudinaryContent, 'qbtdurAEWk46ZoJdJ5WkfryZYi8') &&
    !str_contains($cloudinaryContent, '897355973954513'),
    'Cloudinary.php no contiene API_KEY ni API_SECRET quemados en el código fuente'
);

assertFinSec(
    !str_contains($indexContent, 'srv1660.hstgr.io') &&
    !str_contains($indexContent, 'DB_PASSWORD / DB_PASS ='),
    'index.php (/api/setup-db) no expone hosts internos de BD ni metadatos de contraseñas'
);

echo "\n==================================================\n";
echo "RESULTADO FINAL: {$passed} PASARON, {$failed} FALLARON\n";
echo "==================================================\n";

exit($failed > 0 ? 1 : 0);
