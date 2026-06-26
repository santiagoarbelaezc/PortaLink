import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService, SystemMetrics } from '../../../services/analytics.service';
import { PortfolioConfigService } from '../../../services/portfolio-config.service';
import { PdfReportService } from '../../../services/pdf-report.service';

interface ActivityLog {
  icon: string;
  label: string;
  date: string;
}

@Component({
  selector: 'app-dash-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 tab-enter">

      <!-- Header -->
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.3em]"
           [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Resumen y Exportación</p>
        <h2 class="text-4xl font-bold uppercase tracking-tight mt-0.5"
            [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Reportes</h2>
      </div>

      <!-- Executive Summary -->
      <div class="rounded-2xl border p-6 md:p-8"
           [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
        <h3 class="text-sm font-bold uppercase tracking-wide mb-5"
            [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Resumen Ejecutivo</h3>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div *ngFor="let s of executiveSummary"
               class="rounded-xl p-4 text-center"
               [ngClass]="isDark ? 'bg-neutral-800/60' : 'bg-neutral-50'">
            <p class="text-4xl font-bold" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ s.value }}</p>
            <p class="text-[10px] uppercase tracking-widest font-bold mt-1.5"
               [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">{{ s.label }}</p>
          </div>
        </div>
      </div>

      <!-- Export Buttons + Activity Log row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <!-- Exports -->
        <div class="rounded-2xl border p-6 space-y-4"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <h3 class="text-sm font-bold uppercase tracking-wide"
              [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Exportar Datos</h3>

          <button (click)="exportAnalytics()"
                  class="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer"
                  [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-100' : 'bg-neutral-900 text-white hover:bg-neutral-800'">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Descargar Métricas JSON
          </button>

          <button (click)="exportConfig()"
                  class="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest border transition-all duration-200 cursor-pointer"
                  [ngClass]="isDark ? 'border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500' : 'border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-400'">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            Descargar portfolio.json
          </button>
        </div>

        <!-- Activity Log -->
        <div class="rounded-2xl border p-6"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <h3 class="text-sm font-bold uppercase tracking-wide mb-4"
              [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Log de Actividad</h3>
          <div class="space-y-3">
            <div *ngFor="let log of activityLog"
                 class="flex items-start gap-3">
              <span class="text-base flex-shrink-0">{{ log.icon }}</span>
              <div class="min-w-0 flex-grow">
                <p class="text-sm font-semibold truncate" [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">{{ log.label }}</p>
                <p class="text-xs" [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'">{{ log.date }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- PDF Export Section -->
        <div class="rounded-2xl border p-6 space-y-4"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <div>
            <h3 class="text-sm font-bold uppercase tracking-wide"
                [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Exportar PDF</h3>
            <p class="text-xs mt-1" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">
              Reportes completos en formato PDF listo para imprimir
            </p>
          </div>

          <!-- PDF: Analytics -->
          <button (click)="downloadAnalyticsPdf()"
                  [disabled]="pdfLoading"
                  class="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest border transition-all duration-200 cursor-pointer group"
                  [ngClass]="isDark ? 'border-red-900/60 text-red-400 hover:bg-red-950/40 hover:border-red-700' : 'border-red-200 text-red-600 hover:bg-red-50'">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="flex-grow text-left">Reporte de Analíticas</span>
            <span class="text-[10px] px-2 py-0.5 rounded uppercase tracking-widest font-bold"
                  [ngClass]="isDark ? 'bg-red-900/40 text-red-400' : 'bg-red-100 text-red-600'">PDF</span>
          </button>

          <!-- PDF: Users -->
          <button (click)="downloadUsersPdf()"
                  [disabled]="pdfLoading"
                  class="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest border transition-all duration-200 cursor-pointer group"
                  [ngClass]="isDark ? 'border-red-900/60 text-red-400 hover:bg-red-950/40 hover:border-red-700' : 'border-red-200 text-red-600 hover:bg-red-50'">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="flex-grow text-left">Listado de Usuarios</span>
            <span class="text-[10px] px-2 py-0.5 rounded uppercase tracking-widest font-bold"
                  [ngClass]="isDark ? 'bg-red-900/40 text-red-400' : 'bg-red-100 text-red-600'">PDF</span>
          </button>

          <!-- PDF: System Health -->
          <button (click)="downloadHealthPdf()"
                  [disabled]="pdfLoading"
                  class="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest border transition-all duration-200 cursor-pointer group"
                  [ngClass]="isDark ? 'border-red-900/60 text-red-400 hover:bg-red-950/40 hover:border-red-700' : 'border-red-200 text-red-600 hover:bg-red-50'">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
            </svg>
            <span class="flex-grow text-left">Salud del Sistema</span>
            <span class="text-[10px] px-2 py-0.5 rounded uppercase tracking-widest font-bold"
                  [ngClass]="isDark ? 'bg-red-900/40 text-red-400' : 'bg-red-100 text-red-600'">PDF</span>
          </button>

          <p *ngIf="pdfLoading" class="text-xs text-center"
             [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">
            ⏳ Generando PDF...
          </p>
        </div>

      </div>

      <!-- Load Times Table -->
      <div *ngIf="loadTimes.length > 0"
           class="rounded-2xl border overflow-hidden"
           [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">

        <div class="px-5 py-4 border-b flex justify-between items-center"
             [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
          <h3 class="text-sm font-bold uppercase tracking-wide"
              [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Tiempos de Carga (últimas {{ loadTimes.length }} mediciones)</h3>
          <div class="flex gap-4 text-xs font-bold uppercase tracking-widest"
               [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">
            <span>Mín: <span [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-700'">{{ loadMin }}ms</span></span>
            <span>Prom: <span [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-700'">{{ loadAvg }}ms</span></span>
            <span>Máx: <span [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-700'">{{ loadMax }}ms</span></span>
          </div>
        </div>

        <div class="px-5 py-4">
          <div class="flex items-end gap-1 h-16">
            <div *ngFor="let t of loadTimes"
                 class="flex-1 rounded-t-sm transition-all duration-500"
                 [style.height.%]="loadMax > 0 ? (t / loadMax) * 100 : 10"
                 [ngClass]="isDark ? 'bg-neutral-500' : 'bg-neutral-300'"
                 [title]="t + 'ms'"></div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .tab-enter { animation: tabEnter 0.25s ease-out forwards; }
    @keyframes tabEnter {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class DashReportsComponent implements OnInit {
  @Input() theme = 'dark';
  private analyticsService = inject(AnalyticsService);
  private configService = inject(PortfolioConfigService);
  private pdfService = inject(PdfReportService);

  metrics!: SystemMetrics;
  executiveSummary: { label: string; value: any }[] = [];
  loadTimes: number[] = [];
  loadMin = 0; loadMax = 0; loadAvg = 0;
  pdfLoading = false;

  activityLog: ActivityLog[] = [
    { icon: '⚙️', label: 'Configuración del sistema actualizada', date: 'Hoy — 11:03 am' },
    { icon: '✉️', label: '3 mensajes nuevos recibidos', date: 'Hoy — 09:45 am' },
    { icon: '📋', label: 'Nueva solicitud de Plan Premium', date: 'Ayer — 4:22 pm' },
    { icon: '🔄', label: 'Métricas actualizadas automáticamente', date: 'Hace 3 días' },
    { icon: '📤', label: 'portfolio.json exportado', date: 'Hace 5 días' },
  ];

  get isDark() { return this.theme === 'dark'; }

  ngOnInit() {
    this.metrics = this.analyticsService.getMetrics();
    this.buildSummary();
    this.buildLoadStats();
  }

  private buildSummary() {
    const totalSectionViews = Object.values(this.metrics.sectionViews).reduce((a, b) => a + b, 0);
    const totalLinkClicks = Object.values(this.metrics.linktreeClicks).reduce((a, b) => a + b, 0);
    this.executiveSummary = [
      { label: 'Vistas del Home', value: this.metrics.homeViews },
      { label: 'Vistas Linktree', value: this.metrics.linktreeViews },
      { label: 'Total Secciones', value: totalSectionViews },
      { label: 'Clics en Links', value: totalLinkClicks },
    ];
  }

  private buildLoadStats() {
    this.loadTimes = this.metrics.loadTimes || [];
    if (!this.loadTimes.length) return;
    this.loadMin = Math.min(...this.loadTimes);
    this.loadMax = Math.max(...this.loadTimes);
    this.loadAvg = Math.round(this.loadTimes.reduce((a, b) => a + b, 0) / this.loadTimes.length);
  }

  exportAnalytics() {
    const data = JSON.stringify(this.metrics, null, 2);
    const url = 'data:text/json;charset=utf-8,' + encodeURIComponent(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portalink_analytics.json';
    a.click();
  }

  exportConfig() {
    this.configService.exportJSON();
  }

  async downloadAnalyticsPdf() {
    this.pdfLoading = true;
    try { await this.pdfService.downloadAnalyticsReport(this.metrics); } finally { this.pdfLoading = false; }
  }

  async downloadUsersPdf() {
    this.pdfLoading = true;
    const saved = localStorage.getItem('portalink_admin_users');
    const users = saved ? JSON.parse(saved) : [];
    try { await this.pdfService.downloadUsersReport(users); } finally { this.pdfLoading = false; }
  }

  async downloadHealthPdf() {
    this.pdfLoading = true;
    try { await this.pdfService.downloadSystemHealthReport(this.metrics, this.activityLog); } finally { this.pdfLoading = false; }
  }
}
