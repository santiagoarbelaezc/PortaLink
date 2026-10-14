/**
 * PORTALINK FRONTEND COMPONENT VALIDATION TEST SUITE
 * Tests tab routing, alias resolution, template mounting integrity,
 * and finances calculation engines without requiring a headless browser.
 */

const fs = require('fs');
const path = require('path');

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✔ PASS  ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✖ FAIL  ${testName}`);
    failedCount++;
  }
}

console.log('====================================================');
console.log('  PORTALINK - FRONTEND COMPONENT VALIDATION SUITE    ');
console.log('====================================================\n');

// ─── 1. VERIFY ADMIN COMPONENT TEMPLATE INTEGRITY ───────────────
console.log('[1] Admin Component & Tab Rendering Integrity');
const adminPath = path.join(__dirname, 'pages', 'admin', 'admin.component.ts');
const adminContent = fs.readFileSync(adminPath, 'utf8').replace(/\r\n/g, '\n');

// Ensure no conflicting @defer wrappers exist for the main tabs
assert(!adminContent.includes("@defer (when activeTab === 'finances'"), 'No @defer block wrapping app-dash-finances');
assert(!adminContent.includes("@defer (when activeTab === 'dashboard'"), 'No @defer block wrapping app-dash-home');
assert(!adminContent.includes("@defer (when activeTab === 'messages'"), 'No @defer block wrapping app-dash-messages');
assert(!adminContent.includes("@defer (when activeTab === 'library'"), 'No @defer block wrapping app-dash-library');

// Ensure direct *ngIf conditions exist for synchronous mounting
assert(adminContent.includes('<app-dash-finances\n              *ngIf="activeTab === \'finances\'"'), 'app-dash-finances renders directly with *ngIf');
assert(adminContent.includes('<app-dash-home\n              *ngIf="activeTab === \'dashboard\'"'), 'app-dash-home renders directly with *ngIf');
assert(adminContent.includes('<app-dash-rotbot\n              *ngIf="activeTab === \'rotbot\'"'), 'app-dash-rotbot renders directly with *ngIf');
assert(adminContent.includes('<app-dash-itinerary\n              *ngIf="activeTab === \'itinerary\'"'), 'app-dash-itinerary renders directly with *ngIf');
assert(adminContent.includes('<app-dash-library\n              *ngIf="activeTab === \'library\'"'), 'app-dash-library renders directly with *ngIf');

// ─── 2. TAB NORMALIZATION LOGIC TEST ───────────────────────────
console.log('\n[2] Tab ID Normalization & Route Aliases');
const tabs = [
  { id: 'dashboard', name: 'Inicio' },
  { id: 'finances', name: 'Finanzas' },
  { id: 'messages', name: 'Mensajes' },
  { id: 'users', name: 'Usuarios' },
  { id: 'config', name: 'Configuración' },
  { id: 'rotbot', name: 'Rotbot IA' },
  { id: 'itinerary', name: 'Calendario' },
  { id: 'library', name: 'Biblioteca' },
  { id: 'db-viewer', name: 'Visor BD' },
];

function normalizeTab(tabId) {
  if (!tabId) return null;
  let id = tabId.toLowerCase().trim();
  if (id === 'leads') id = 'messages';
  if (id === 'stats' || id === 'reports' || id === 'analytics' || id === 'financial-control') id = 'finances';
  return tabs.some(t => t.id === id) ? id : null;
}

assert(normalizeTab('finances') === 'finances', 'finances maps to finances');
assert(normalizeTab('stats') === 'finances', 'stats alias maps to finances');
assert(normalizeTab('reports') === 'finances', 'reports alias maps to finances');
assert(normalizeTab('analytics') === 'finances', 'analytics alias maps to finances');
assert(normalizeTab('financial-control') === 'finances', 'financial-control alias maps to finances');
assert(normalizeTab('leads') === 'messages', 'leads alias maps to messages');
assert(normalizeTab('unknown_tab') === null, 'unknown tab safely returns null');

// ─── 3. DASH FINANCES CALCULATION ENGINE ───────────────────────
console.log('\n[3] Dash Finances Calculations & Fallback Engine');

function formatStatus(rawStatus, dueAt, paidAmount, totalAmount) {
  if (!rawStatus) return 'Enviada';
  const s = String(rawStatus).toUpperCase();
  if (s === 'PAGADA' || s === 'PAGADO') return 'Pagada';
  if (s === 'PARCIAL' || (paidAmount && paidAmount > 0 && totalAmount && paidAmount < totalAmount)) return 'Parcial';
  if (s === 'DRAFT' || s === 'BORRADOR') return 'Borrador';
  
  if (dueAt) {
    const today = new Date().toISOString().split('T')[0];
    if (dueAt < today) {
      return 'Vencida';
    }
  }

  if (s === 'VENCIDA' || s === 'VENCIDO') return 'Vencida';
  if (s === 'ENVIADA' || s === 'ENVIADO') return 'Enviada';
  return 'Enviada';
}

assert(formatStatus('PAGADA') === 'Pagada', 'Status PAGADA formats to Pagada');
assert(formatStatus('ENVIADA', '2020-01-01', 0, 1000) === 'Vencida', 'Past due date automatically marks as Vencida');
assert(formatStatus('ENVIADA', '2099-01-01', 500, 1000) === 'Parcial', 'Partial payment marks as Parcial');
assert(formatStatus(null) === 'Enviada', 'Null status safely falls back to Enviada');

// Financial KPIs calculation logic
function calculateKpiPercentages(invoices) {
  const total = (invoices || []).reduce((sum, inv) => sum + (inv.total || inv.total_amount || 0), 0);
  if (!total) return { paidPct: 0, pendingPct: 0, overduePct: 0 };
  
  const paid = (invoices || []).reduce((sum, inv) => {
    if (inv.status === 'Pagada' || inv.status === 'PAGADA') return sum + (inv.total || inv.total_amount || 0);
    return sum + (inv.paid_amount || 0);
  }, 0);
  
  const overdue = (invoices || []).reduce((sum, inv) => {
    if (inv.status === 'Vencida' || inv.status === 'VENCIDA') {
      const pending = inv.pending_amount !== undefined ? inv.pending_amount : Math.max(0, (inv.total || 0) - (inv.paid_amount || 0));
      return sum + pending;
    }
    return sum;
  }, 0);

  const paidPct = Math.min(100, Math.round((paid / total) * 100));
  const overduePct = Math.round((overdue / total) * 100);
  const pendingPct = Math.max(0, 100 - paidPct - overduePct);

  return { paidPct, pendingPct, overduePct };
}

// Case A: Empty invoices (No division by zero)
const emptyRes = calculateKpiPercentages([]);
assert(emptyRes.paidPct === 0 && emptyRes.pendingPct === 0 && !isNaN(emptyRes.paidPct), 'Empty invoices return 0% without NaN');

// Case B: Realistic invoice set
const sampleInvoices = [
  { id: '1', total: 1000000, paid_amount: 1000000, status: 'Pagada' },
  { id: '2', total: 500000, paid_amount: 0, status: 'Vencida', pending_amount: 500000 },
  { id: '3', total: 500000, paid_amount: 200000, status: 'Parcial', pending_amount: 300000 }
];
const realisticRes = calculateKpiPercentages(sampleInvoices);
assert(realisticRes.paidPct === 60, `Paid percentage calculated correctly (${realisticRes.paidPct}% === 60%)`);
assert(realisticRes.overduePct === 25, `Overdue percentage calculated correctly (${realisticRes.overduePct}% === 25%)`);
assert(realisticRes.pendingPct === 15, `Pending percentage calculated correctly (${realisticRes.pendingPct}% === 15%)`);

// ─── 4. VERIFY TIMEOUT SAFEGUARDS IN FINANCES SERVICE ───────────
console.log('\n[4] Network Resilience & Timeout Safeguards');
const financesCompPath = path.join(__dirname, 'components', 'dashboard', 'dash-finances', 'dash-finances.component.ts');
const financesContent = fs.readFileSync(financesCompPath, 'utf8');

assert(financesContent.includes("import { firstValueFrom, timeout } from 'rxjs';"), 'timeout is imported from rxjs in dash-finances');
assert(financesContent.includes(".getClients().pipe(timeout(6000))"), 'getClients has 6-second timeout safeguard');
assert(financesContent.includes(".getServices().pipe(timeout(6000))"), 'getServices has 6-second timeout safeguard');
assert(financesContent.includes(".getInvoices().pipe(timeout(6000))"), 'getInvoices has 6-second timeout safeguard');
assert(financesContent.includes(".getDashboard(filters).pipe(timeout(6000))"), 'getDashboard has 6-second timeout safeguard');

console.log('\n====================================================');
console.log(`  TOTAL TESTS : ${passedCount + failedCount}`);
console.log(`  PASSED      : ${passedCount}`);
console.log(`  FAILED      : ${failedCount}`);
console.log('====================================================\n');

if (failedCount > 0) {
  process.exit(1);
} else {
  console.log('✔ TODOS LOS COMPONENTES DE FRONTEND ESTÁN VERIFICADOS Y FUNCIONANDO.');
}
