import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService, SystemMetrics } from '../../../services/analytics.service';

interface SectionRow {
  name: string;
  views: number;
  pct: number;
}

@Component({
  selector: 'app-dash-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 tab-enter">

      <!-- Header -->
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.3em]"
           [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Vista Detallada</p>
        <h2 class="text-4xl font-bold uppercase tracking-tight mt-0.5"
            [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Estadísticas</h2>
      </div>

      <!-- Summary bar -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div *ngFor="let s of summaryCards"
             class="rounded-xl border p-4"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <p class="text-[10px] uppercase tracking-widest font-bold"
             [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">{{ s.label }}</p>
          <p class="text-3xl font-bold mt-1" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ s.value }}</p>
        </div>
      </div>

      <!-- Table -->
      <div class="rounded-2xl border overflow-hidden"
           [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">

        <!-- Table header -->
        <div class="grid grid-cols-12 px-5 py-3 text-[10px] font-bold uppercase tracking-widest border-b"
             [ngClass]="isDark ? 'border-neutral-800 text-neutral-500' : 'border-neutral-200 text-neutral-400'">
          <span class="col-span-4">Sección</span>
          <span class="col-span-2 text-center">Visitas</span>
          <span class="col-span-3">% del Total</span>
          <span class="col-span-2 text-center">Tendencia</span>
          <span class="col-span-1"></span>
        </div>

        <!-- Table rows -->
        <div class="divide-y" [ngClass]="isDark ? 'divide-neutral-800' : 'divide-neutral-100'">
          <div *ngFor="let row of sectionRows; let i = index">

            <!-- Row -->
            <button (click)="toggleDrill(row.name)"
                    class="w-full grid grid-cols-12 px-5 py-4 text-left transition-all duration-200 cursor-pointer group"
                    [ngClass]="[
                      isDark ? 'hover:bg-neutral-800/50' : 'hover:bg-neutral-50',
                      selectedSection === row.name ? (isDark ? 'bg-neutral-800/40' : 'bg-neutral-50') : ''
                    ]">

              <!-- Name -->
              <div class="col-span-4 flex items-center gap-3">
                <span class="text-sm font-bold capitalize"
                      [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">{{ row.name }}</span>
              </div>

              <!-- Views -->
              <div class="col-span-2 flex items-center justify-center">
                <span class="text-sm font-bold tabular-nums"
                      [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">{{ row.views }}</span>
              </div>

              <!-- Bar -->
              <div class="col-span-3 flex items-center gap-2.5">
                <div class="flex-grow h-1.5 rounded-full overflow-hidden"
                     [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-100'">
                  <div class="h-full rounded-full transition-all duration-700"
                       [style.width.%]="row.pct"
                       [ngClass]="isDark ? 'bg-white' : 'bg-neutral-900'"></div>
                </div>
                <span class="text-xs tabular-nums w-8 text-right"
                      [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">{{ row.pct | number:'1.0-0' }}%</span>
              </div>

              <!-- Trend (mock) -->
              <div class="col-span-2 flex items-center justify-center">
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full"
                      [ngClass]="i % 3 === 0 ? 'text-green-400 bg-green-500/10' : (i % 2 === 0 ? 'text-neutral-400 bg-neutral-500/10' : 'text-red-400 bg-red-500/10')">
                  {{ i % 3 === 0 ? '↑ +12%' : (i % 2 === 0 ? '→ 0%' : '↓ -3%') }}
                </span>
              </div>

              <!-- Expand arrow -->
              <div class="col-span-1 flex items-center justify-end">
                <svg class="w-4 h-4 transition-transform duration-200"
                     [ngClass]="[
                       isDark ? 'text-neutral-600' : 'text-neutral-400',
                       selectedSection === row.name ? 'rotate-180' : ''
                     ]"
                     fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            <!-- Drill-down panel -->
            <div *ngIf="selectedSection === row.name"
                 class="border-t px-5 py-5 animate-drilldown"
                 [ngClass]="isDark ? 'border-neutral-800 bg-neutral-950/40' : 'border-neutral-100 bg-neutral-50'">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

                <!-- Stats -->
                <div class="space-y-3">
                  <h5 class="text-xs font-bold uppercase tracking-widest"
                      [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Detalles de "{{ row.name }}"</h5>
                  <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                      <span [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-500'">Visitas totales</span>
                      <span class="font-bold" [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-700'">{{ row.views }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-500'">% del sitio</span>
                      <span class="font-bold" [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-700'">{{ row.pct | number:'1.1-1' }}%</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-500'">Sem. anterior</span>
                      <span class="font-bold text-neutral-400">— N/D</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-500'">Último acceso</span>
                      <span class="font-bold" [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-700'">Hoy</span>
                    </div>
                  </div>
                </div>

                <!-- Mini sparkline -->
                <div class="md:col-span-2">
                  <h5 class="text-xs font-bold uppercase tracking-widest mb-2"
                      [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Actividad reciente</h5>
                  <svg viewBox="0 0 300 60" class="w-full h-14" preserveAspectRatio="none">
                    <path [attr.d]="getDrillSparkline(i)"
                          fill="none" stroke-width="2" stroke-linecap="round"
                          [attr.stroke]="isDark ? '#ffffff' : '#111827'"></path>
                  </svg>
                  <div class="flex justify-between text-[9px] mt-1 px-1"
                       [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'">
                    <span>7 días atrás</span><span>Hoy</span>
                  </div>
                </div>

              </div>

              <!-- View in site button -->
              <div class="flex justify-end mt-4">
                <a href="/" target="_blank"
                   class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all duration-200 cursor-pointer"
                   [ngClass]="isDark ? 'border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500' : 'border-neutral-300 text-neutral-500 hover:text-neutral-900 hover:border-neutral-400'">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                  Ver en el sitio
                </a>
              </div>
            </div>

          </div>
        </div>

        <!-- Empty state -->
        <div *ngIf="sectionRows.length === 0" class="py-12 text-center text-sm"
             [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'">
          No hay datos de secciones registrados aún.
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
    .animate-drilldown { animation: drillIn 0.2s ease-out forwards; }
    @keyframes drillIn {
      from { opacity: 0; max-height: 0; }
      to   { opacity: 1; max-height: 400px; }
    }
  `]
})
export class DashStatsComponent implements OnInit {
  @Input() theme = 'dark';
  private analyticsService = inject(AnalyticsService);

  metrics!: SystemMetrics;
  sectionRows: SectionRow[] = [];
  selectedSection: string | null = null;
  summaryCards: { label: string; value: any }[] = [];

  get isDark() { return this.theme === 'dark'; }

  ngOnInit() {
    this.metrics = this.analyticsService.getMetrics();
    this.buildRows();
    this.buildSummary();
  }

  private buildRows() {
    const total = Object.values(this.metrics.sectionViews).reduce((a, b) => a + b, 0) || 1;
    this.sectionRows = Object.entries(this.metrics.sectionViews)
      .map(([name, views]) => ({ name, views, pct: Math.round((views / total) * 100 * 10) / 10 }))
      .sort((a, b) => b.views - a.views);
  }

  private buildSummary() {
    const totalViews = Object.values(this.metrics.sectionViews).reduce((a, b) => a + b, 0);
    const topSection = this.sectionRows[0]?.name || '—';
    const avgPerSection = this.sectionRows.length > 0
      ? Math.round(totalViews / this.sectionRows.length) : 0;
    this.summaryCards = [
      { label: 'Vistas totales', value: totalViews },
      { label: 'Secciones', value: this.sectionRows.length },
      { label: 'Sección líder', value: topSection },
      { label: 'Prom. por sección', value: avgPerSection },
    ];
  }

  toggleDrill(name: string) {
    this.selectedSection = this.selectedSection === name ? null : name;
  }

  getDrillSparkline(seed: number): string {
    // Generates a deterministic fake sparkline based on seed
    const pts = [50, 40, 45, 25, 30, 20, 35, 15, 25, 10];
    const shifted = pts.map(p => p + (seed * 7) % 20);
    const max = Math.max(...shifted);
    const coords = shifted.map((v, i) => `${(i / (shifted.length - 1)) * 300},${60 - (v / max) * 50}`);
    return `M ${coords.join(' L ')}`;
  }
}
