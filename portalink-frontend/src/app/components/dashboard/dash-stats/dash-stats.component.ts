import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService, SystemMetrics } from '../../../services/analytics.service';
import { FinanceService } from '../../../services/finance.service';
import { Subject, takeUntil } from 'rxjs';

interface SectionRow {
  name: string;
  views: number;
  pct: number;
}

export interface SalesStatsSummary {
  arr_total: number;
  mrr_promedio: number;
  utilidad_neta: number;
  margen_neto_pct: number;
  egresos_total: number;
  facturas_pagadas_total: number;
  ingresos_manuales_total: number;
  clientes_activos: number;
}

@Component({
  selector: 'app-dash-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 tab-enter font-sans">

      <!-- ══════════════════════════════════════
           HEADER & SECTION FILTER CONTROLS
      ══════════════════════════════════════ -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5"
           [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <p class="text-xs font-headline font-semibold uppercase tracking-[0.25em]"
               [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Auditoría & Desempeño</p>
          </div>
          <h2 class="text-2xl sm:text-3xl font-headline font-bold tracking-tight mt-1"
              [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
            Estadísticas & Analíticas Reales
          </h2>
        </div>

        <!-- Filter View Switcher -->
        <div class="flex items-center rounded-full p-1 border"
             [ngClass]="isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-neutral-100/80 border-neutral-200'">
          <button (click)="activeSectionFilter = 'all'"
                  class="px-4 py-1.5 rounded-full text-xs font-headline font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer"
                  [ngClass]="activeSectionFilter === 'all' ? (isDark ? 'bg-white text-black shadow-sm' : 'bg-[#09090b] text-white shadow-sm') : 'opacity-60'">
            Todas
          </button>
          <button (click)="activeSectionFilter = 'site'"
                  class="px-4 py-1.5 rounded-full text-xs font-headline font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer"
                  [ngClass]="activeSectionFilter === 'site' ? (isDark ? 'bg-white text-black shadow-sm' : 'bg-[#09090b] text-white shadow-sm') : 'opacity-60'">
            Sitio Web
          </button>
          <button (click)="activeSectionFilter = 'sales'"
                  class="px-4 py-1.5 rounded-full text-xs font-headline font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer"
                  [ngClass]="activeSectionFilter === 'sales' ? (isDark ? 'bg-white text-black shadow-sm' : 'bg-[#09090b] text-white shadow-sm') : 'opacity-60'">
            Ventas & Finanzas
          </button>
        </div>
      </div>

      <!-- ══════════════════════════════════════
           SECCIÓN 1: ESTADÍSTICAS DEL SITIO WEB
      ══════════════════════════════════════ -->
      <div *ngIf="activeSectionFilter === 'all' || activeSectionFilter === 'site'" class="space-y-5">
        <div class="flex items-center justify-between border-b pb-3" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-blue-400"></span>
            <h3 class="text-base font-headline font-bold uppercase tracking-wider" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              Tráfico & Enganche del Sitio Web
            </h3>
          </div>
          <span class="text-xs font-mono opacity-50">Sincronizado con API</span>
        </div>

        <!-- Site Metrics KPI Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
          <div class="rounded-[24px] border p-5 space-y-2 transition-all duration-300 hover:border-neutral-500 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
               [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80'">
            <p class="text-[10px] font-headline font-semibold uppercase tracking-wider opacity-60">Visitas Totales</p>
            <p class="text-2xl sm:text-3xl font-headline font-bold tracking-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              {{ (metrics.homeViews || 0) + (metrics.linktreeViews || 0) }}
            </p>
            <p class="text-[11px] opacity-50">Home: {{ metrics.homeViews || 0 }} | Links: {{ metrics.linktreeViews || 0 }}</p>
          </div>

          <div class="rounded-[24px] border p-5 space-y-2 transition-all duration-300 hover:border-neutral-500 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
               [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80'">
            <p class="text-[10px] font-headline font-semibold uppercase tracking-wider opacity-60">Clics en Enlaces</p>
            <p class="text-2xl sm:text-3xl font-headline font-bold tracking-tight text-blue-400">
              {{ metrics.totalClicks || 0 }}
            </p>
            <p class="text-[11px] opacity-50">Interacción en canales sociales</p>
          </div>

          <div class="rounded-[24px] border p-5 space-y-2 transition-all duration-300 hover:border-neutral-500 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
               [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80'">
            <p class="text-[10px] font-headline font-semibold uppercase tracking-wider opacity-60">Tasa de Clics (CTR)</p>
            <p class="text-2xl sm:text-3xl font-headline font-bold tracking-tight text-emerald-400">
              {{ metrics.linkCtr || 0 }}%
            </p>
            <p class="text-[11px] opacity-50">Conversión de visitantes a clics</p>
          </div>

          <div class="rounded-[24px] border p-5 space-y-2 transition-all duration-300 hover:border-neutral-500 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
               [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80'">
            <p class="text-[10px] font-headline font-semibold uppercase tracking-wider opacity-60">Consultas IA Rotbot</p>
            <p class="text-2xl sm:text-3xl font-headline font-bold tracking-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              {{ metrics.rotbotOpens || 0 }}
            </p>
            <p class="text-[11px] opacity-50">{{ metrics.rotbotMessagesSent || 0 }} mensajes enviados</p>
          </div>
        </div>

        <!-- Section Views Table -->
        <div class="rounded-[28px] border overflow-hidden shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80'">
          
          <div class="grid grid-cols-12 px-5 py-3 text-[10px] font-bold uppercase tracking-widest border-b"
               [ngClass]="isDark ? 'border-neutral-800 text-neutral-500' : 'border-neutral-200 text-neutral-400'">
            <span class="col-span-5">Sección del Sitio</span>
            <span class="col-span-2 text-center">Visitas Reales</span>
            <span class="col-span-3">% del Tráfico</span>
            <span class="col-span-2 text-center">Estado</span>
          </div>

          <div class="divide-y" [ngClass]="isDark ? 'divide-neutral-800' : 'divide-neutral-100'">
            <div *ngFor="let row of sectionRows; let i = index">
              <button (click)="toggleDrill(row.name)"
                      class="w-full grid grid-cols-12 px-5 py-4 text-left transition-all duration-200 cursor-pointer group items-center"
                      [ngClass]="isDark ? 'hover:bg-neutral-800/50' : 'hover:bg-neutral-50'">
                
                <div class="col-span-5 flex items-center gap-3">
                  <span class="text-sm font-bold capitalize" [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">
                    {{ translateName(row.name) }}
                  </span>
                </div>

                <div class="col-span-2 text-center text-sm font-bold font-mono" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                  {{ row.views }}
                </div>

                <div class="col-span-3 flex items-center gap-3">
                  <div class="flex-grow h-1.5 rounded-full overflow-hidden" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-100'">
                    <div class="h-full rounded-full transition-all duration-700" [style.width.%]="row.pct"
                         [ngClass]="isDark ? 'bg-white' : 'bg-neutral-900'"></div>
                  </div>
                  <span class="text-xs font-mono opacity-60 w-9 text-right">{{ row.pct | number:'1.0-0' }}%</span>
                </div>

                <div class="col-span-2 text-center">
                  <span class="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border"
                        [ngClass]="i === 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-neutral-500/10 border-neutral-500/30 text-neutral-400'">
                    {{ i === 0 ? 'Líder' : 'Activo' }}
                  </span>
                </div>
              </button>

              <!-- Drilldown details -->
              <div *ngIf="selectedSection === row.name"
                   class="border-t px-5 py-4 text-xs font-headline"
                   [ngClass]="isDark ? 'border-neutral-800 bg-neutral-950/40' : 'border-neutral-100 bg-neutral-50'">
                <div class="flex items-center justify-between">
                  <span>Auditoría de Tráfico para "{{ translateName(row.name) }}":</span>
                  <span class="font-mono font-bold">{{ row.views }} Impresiones Registradas</span>
                </div>
              </div>
            </div>

            <div *ngIf="sectionRows.length === 0" class="py-8 text-center text-xs opacity-50">
              No hay métricas de secciones disponibles aún.
            </div>
          </div>

        </div>
      </div>

      <!-- ══════════════════════════════════════
           SECCIÓN 2: ESTADÍSTICAS DE VENTAS & FINANZAS
      ══════════════════════════════════════ -->
      <div *ngIf="activeSectionFilter === 'all' || activeSectionFilter === 'sales'" class="space-y-5">
        <div class="flex items-center justify-between border-b pb-3" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <h3 class="text-base font-headline font-bold uppercase tracking-wider" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              Estadísticas de Ventas & Flujo Financiero
            </h3>
          </div>
          <span class="text-xs font-mono opacity-50">Módulo Contable Real</span>
        </div>

        <!-- Sales Metrics KPI Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          <!-- Facturación Bruta -->
          <div class="rounded-[24px] border p-5 space-y-2 transition-all duration-300 hover:border-neutral-500 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
               [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80'">
            <p class="text-[10px] font-headline font-semibold uppercase tracking-wider opacity-60">Facturación Acumulada</p>
            <p class="text-xl sm:text-2xl font-headline font-bold tracking-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              {{ formatCOP(salesSummary.arr_total) }}
            </p>
            <p class="text-[11px] opacity-50">Suma total de facturas y ventas directas</p>
          </div>

          <!-- Recaudo Efectivo -->
          <div class="rounded-[24px] border p-5 space-y-2 transition-all duration-300 hover:border-neutral-500 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
               [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80'">
            <p class="text-[10px] font-headline font-semibold uppercase tracking-wider opacity-60">Recaudo Efectivo</p>
            <p class="text-xl sm:text-2xl font-headline font-bold tracking-tight text-emerald-400">
              {{ formatCOP(salesSummary.facturas_pagadas_total + salesSummary.ingresos_manuales_total) }}
            </p>
            <p class="text-[11px] opacity-50">Pagos completados y liquidados</p>
          </div>

          <!-- Utilidad y Margen -->
          <div class="rounded-[24px] border p-5 space-y-2 transition-all duration-300 hover:border-neutral-500 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
               [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80'">
            <p class="text-[10px] font-headline font-semibold uppercase tracking-wider opacity-60">Margen de Utilidad</p>
            <p class="text-xl sm:text-2xl font-headline font-bold tracking-tight text-emerald-400">
              {{ salesSummary.margen_neto_pct }}%
            </p>
            <p class="text-[11px] opacity-50">Utilidad Neta: {{ formatCOP(salesSummary.utilidad_neta) }}</p>
          </div>

          <!-- Egresos Operativos -->
          <div class="rounded-[24px] border p-5 space-y-2 transition-all duration-300 hover:border-neutral-500 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
               [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80'">
            <p class="text-[10px] font-headline font-semibold uppercase tracking-wider opacity-60">Egresos Totales</p>
            <p class="text-xl sm:text-2xl font-headline font-bold tracking-tight text-red-400">
              -{{ formatCOP(salesSummary.egresos_total) }}
            </p>
            <p class="text-[11px] opacity-50">Clientes Activos: {{ salesSummary.clientes_activos }}</p>
          </div>

        </div>

        <!-- Visual Distribution Cards (Sales Ledger Breakdown) -->
        <div class="rounded-[28px] border p-6 space-y-6 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
             [ngClass]="isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-white border-neutral-200'">
          
          <div class="flex items-center justify-between border-b pb-4" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
            <div>
              <h4 class="text-sm font-headline font-bold uppercase tracking-wider" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                Distribución de Recaudos por Estado
              </h4>
              <p class="text-xs opacity-60 mt-0.5">Indicador de salud financiera y liquidez de cartera</p>
            </div>
            <span class="text-xs font-mono font-bold" [ngClass]="isDark ? 'text-emerald-400' : 'text-emerald-600'">
              {{ salesCollectionRate }}% Tasa de Cobro
            </span>
          </div>

          <!-- Progress Bars Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <!-- Pagadas -->
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="font-medium opacity-70">Pagadas (Completadas)</span>
                <span class="font-bold text-emerald-400">{{ salesPaidPct }}%</span>
              </div>
              <div class="w-full h-2 rounded-full overflow-hidden bg-neutral-800">
                <div class="bg-emerald-400 h-full rounded-full transition-all duration-700" [style.width.%]="salesPaidPct"></div>
              </div>
            </div>

            <!-- Pendientes -->
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="font-medium opacity-70">Enviadas / Pendientes</span>
                <span class="font-bold text-blue-400">{{ salesPendingPct }}%</span>
              </div>
              <div class="w-full h-2 rounded-full overflow-hidden bg-neutral-800">
                <div class="bg-blue-400 h-full rounded-full transition-all duration-700" [style.width.%]="salesPendingPct"></div>
              </div>
            </div>

            <!-- Vencidas -->
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="font-medium opacity-70">Vencidas (En Riesgo)</span>
                <span class="font-bold text-red-400">{{ salesOverduePct }}%</span>
              </div>
              <div class="w-full h-2 rounded-full overflow-hidden bg-neutral-800">
                <div class="bg-red-400 h-full rounded-full transition-all duration-700" [style.width.%]="salesOverduePct"></div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  `,
  styles: [`
    .tab-enter { animation: tabEnter 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes tabEnter {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class DashStatsComponent implements OnInit, OnDestroy {
  @Input() theme = 'light';
  private analyticsService = inject(AnalyticsService);
  private financeService = inject(FinanceService);
  private destroy$ = new Subject<void>();

  activeSectionFilter: 'all' | 'site' | 'sales' = 'all';

  metrics: SystemMetrics = {
    homeViews: 0,
    linktreeViews: 0,
    rotbotOpens: 0,
    rotbotMessagesSent: 0,
    sectionViews: {},
    linktreeClicks: {},
    loadTimes: [],
    themeSelections: { light: 0, dark: 0 },
    dailyTrend: [],
    devices: [],
    totalClicks: 0,
    linkCtr: 0
  };

  salesSummary: SalesStatsSummary = {
    arr_total: 0,
    mrr_promedio: 0,
    utilidad_neta: 0,
    margen_neto_pct: 0,
    egresos_total: 0,
    facturas_pagadas_total: 0,
    ingresos_manuales_total: 0,
    clientes_activos: 0
  };

  sectionRows: SectionRow[] = [];
  selectedSection: string | null = null;

  salesPaidPct = 0;
  salesPendingPct = 0;
  salesOverduePct = 0;
  salesCollectionRate = 0;

  get isDark() { return this.theme === 'dark'; }

  ngOnInit() {
    this.loadSiteStats();
    this.loadSalesStats();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSiteStats() {
    this.analyticsService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (m) => {
          if (m) {
            this.metrics = m;
            this.buildSectionRows();
          }
        },
        error: () => {
          this.buildSectionRows();
        }
      });
  }

  loadSalesStats() {
    this.financeService.getControlSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res && res.ok && res.summary) {
            this.salesSummary = res.summary;
            this.computeSalesLedgerPercentages();
          }
        },
        error: () => {}
      });
  }

  private buildSectionRows() {
    const views = this.metrics.sectionViews || {};
    const total = Object.values(views).reduce((a, b) => a + b, 0) || 1;
    this.sectionRows = Object.entries(views)
      .map(([name, v]) => ({ name, views: v, pct: Math.round((v / total) * 100 * 10) / 10 }))
      .sort((a, b) => b.views - a.views);
  }

  private computeSalesLedgerPercentages() {
    const totalInvoiced = Number(this.salesSummary.arr_total) || 0;
    const paidAmount = Number(this.salesSummary.facturas_pagadas_total + this.salesSummary.ingresos_manuales_total) || 0;
    const expensesAmount = Number(this.salesSummary.egresos_total) || 0;

    if (totalInvoiced > 0) {
      this.salesPaidPct = Math.min(100, Math.round((paidAmount / totalInvoiced) * 100));
      this.salesOverduePct = Math.min(100, Math.round((expensesAmount / totalInvoiced) * 100));
      this.salesPendingPct = Math.max(0, 100 - this.salesPaidPct - this.salesOverduePct);
      this.salesCollectionRate = this.salesPaidPct;
    } else {
      this.salesPaidPct = 0;
      this.salesPendingPct = 0;
      this.salesOverduePct = 0;
      this.salesCollectionRate = 0;
    }
  }

  toggleDrill(name: string) {
    this.selectedSection = this.selectedSection === name ? null : name;
  }

  formatCOP(value: number): string {
    const val = Number(value) || 0;
    return '$ ' + Math.round(val).toLocaleString('es-CO') + ' COP';
  }

  translateName(name: string): string {
    const map: Record<string, string> = {
      hero: 'Inicio (Cabecera)',
      skills: 'Habilidades',
      portfolio: 'Portafolio & Proyectos',
      about: 'Sobre Mí',
      contact: 'Contacto',
      text: 'Texto Libre',
      linktree: 'Árbol de Enlaces (Linktree)',
      retratos: 'Sección Retratos'
    };
    return map[name.toLowerCase()] || name;
  }
}
