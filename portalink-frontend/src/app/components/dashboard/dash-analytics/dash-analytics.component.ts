import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService, SystemMetrics } from '../../../services/analytics.service';

@Component({
  selector: 'app-dash-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 tab-enter">

      <!-- Header -->
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.3em]"
           [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Métricas Avanzadas</p>
        <h2 class="text-4xl font-bold uppercase tracking-tight mt-0.5"
            [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Analíticas</h2>
      </div>

      <!-- Row 1: Donut + Theme Distribution -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <!-- Donut: Distribución de Secciones -->
        <div class="rounded-2xl border p-6"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <h4 class="text-sm font-bold uppercase tracking-wide mb-5"
              [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Distribución de Tráfico</h4>

          <div class="flex items-center gap-8">
            <!-- SVG Donut -->
            <svg viewBox="0 0 120 120" class="w-28 h-28 flex-shrink-0" style="transform: rotate(-90deg)">
              <circle cx="60" cy="60" r="46" fill="none" stroke-width="18"
                      [attr.stroke]="isDark ? '#1f1f1f' : '#f3f4f6'"></circle>
              <circle *ngFor="let seg of donutSegments"
                      cx="60" cy="60" r="46" fill="none" stroke-width="18"
                      [attr.stroke]="seg.color"
                      [attr.stroke-dasharray]="seg.dash + ' ' + (289 - seg.dash)"
                      [attr.stroke-dashoffset]="-seg.offset"></circle>
            </svg>

            <!-- Legend -->
            <div class="flex-grow space-y-2">
              <div *ngFor="let seg of donutSegments; let i = index"
                   class="flex items-center gap-2.5">
                <span class="w-2.5 h-2.5 rounded-sm flex-shrink-0" [style.background]="seg.color"></span>
                <span class="text-xs font-semibold flex-grow capitalize"
                      [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-600'">{{ seg.name }}</span>
                <span class="text-xs font-bold tabular-nums"
                      [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">{{ seg.pct }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tema Preferido -->
        <div class="rounded-2xl border p-6"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <h4 class="text-sm font-bold uppercase tracking-wide mb-5"
              [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Tema Preferido</h4>

          <div class="space-y-4">
            <!-- Dark -->
            <div class="space-y-1.5">
              <div class="flex justify-between text-xs font-bold uppercase tracking-wide"
                   [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                <span>🌙 Tema Oscuro</span>
                <span [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-700'">{{ themeTotal === 0 ? 0 : ((metrics.themeSelections.dark / themeTotal) * 100 | number:'1.0-0') }}%</span>
              </div>
              <div class="h-2 rounded-full overflow-hidden" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-100'">
                <div class="h-full rounded-full transition-all duration-1000"
                     [style.width.%]="themeTotal === 0 ? 0 : (metrics.themeSelections.dark / themeTotal) * 100"
                     [ngClass]="isDark ? 'bg-white' : 'bg-neutral-900'"></div>
              </div>
              <p class="text-xs" [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'">{{ metrics.themeSelections.dark }} selecciones</p>
            </div>
            <!-- Light -->
            <div class="space-y-1.5">
              <div class="flex justify-between text-xs font-bold uppercase tracking-wide"
                   [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                <span>☀️ Tema Claro</span>
                <span [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-700'">{{ themeTotal === 0 ? 0 : ((metrics.themeSelections.light / themeTotal) * 100 | number:'1.0-0') }}%</span>
              </div>
              <div class="h-2 rounded-full overflow-hidden" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-100'">
                <div class="h-full rounded-full transition-all duration-1000"
                     [style.width.%]="themeTotal === 0 ? 0 : (metrics.themeSelections.light / themeTotal) * 100"
                     [ngClass]="isDark ? 'bg-neutral-400' : 'bg-neutral-500'"></div>
              </div>
              <p class="text-xs" [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'">{{ metrics.themeSelections.light }} selecciones</p>
            </div>
          </div>
        </div>

      </div>

      <!-- Row 2: Carga histórica + Dispositivos -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <!-- Load Times -->
        <div class="rounded-2xl border p-6"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <h4 class="text-sm font-bold uppercase tracking-wide mb-5"
              [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Tiempos de Carga (ms)</h4>

          <div class="flex items-end gap-1.5 h-24">
            <div *ngFor="let t of loadTimesBars"
                 class="flex-1 rounded-t-sm transition-all duration-500"
                 [style.height.%]="t.pct"
                 [ngClass]="isDark ? 'bg-neutral-400' : 'bg-neutral-500'"
                 [title]="t.val + 'ms'"></div>
            <div *ngIf="loadTimesBars.length === 0"
                 class="w-full flex items-center justify-center text-xs"
                 [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'">
              Sin datos de carga aún
            </div>
          </div>

          <div class="flex justify-between mt-3 text-xs"
               [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">
            <span>Mín: {{ loadMin }}ms</span>
            <span>Prom: {{ loadAvg }}ms</span>
            <span>Máx: {{ loadMax }}ms</span>
          </div>
        </div>

        <!-- Dispositivos -->
        <div class="rounded-2xl border p-6"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <h4 class="text-sm font-bold uppercase tracking-wide mb-5"
              [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Dispositivos (estimados)</h4>

          <div class="space-y-4">
            <div *ngFor="let dev of devices" class="space-y-1.5">
              <div class="flex justify-between text-xs font-bold uppercase tracking-wide"
                   [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                <span>{{ dev.icon }} {{ dev.name }}</span>
                <span [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-700'">{{ dev.pct }}%</span>
              </div>
              <div class="h-2 rounded-full overflow-hidden" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-100'">
                <div class="h-full rounded-full transition-all duration-700"
                     [style.width.%]="dev.pct"
                     [style.background]="dev.color"></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Row 3: Rotbot Stats -->
      <div class="rounded-2xl border p-6"
           [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
        <h4 class="text-sm font-bold uppercase tracking-wide mb-5"
            [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Actividad de Rotbot IA</h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div *ngFor="let stat of rotbotStats"
               class="rounded-xl p-4 text-center"
               [ngClass]="isDark ? 'bg-neutral-800/60' : 'bg-neutral-50'">
            <p class="text-3xl font-bold" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ stat.value }}</p>
            <p class="text-[10px] uppercase tracking-widest font-bold mt-1"
               [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">{{ stat.label }}</p>
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
export class DashAnalyticsComponent implements OnInit {
  @Input() theme = 'dark';
  private analyticsService = inject(AnalyticsService);

  metrics!: SystemMetrics;
  get isDark() { return this.theme === 'dark'; }

  donutSegments: { name: string; color: string; pct: number; dash: number; offset: number }[] = [];
  themeTotal = 0;
  loadTimesBars: { val: number; pct: number }[] = [];
  loadMin = 0; loadMax = 0; loadAvg = 0;

  devices = [
    { icon: '📱', name: 'Mobile', pct: 58, color: '#ffffff' },
    { icon: '🖥', name: 'Desktop', pct: 35, color: '#9ca3af' },
    { icon: '📟', name: 'Tablet', pct: 7, color: '#525252' },
  ];

  rotbotStats: { label: string; value: any }[] = [];

  ngOnInit() {
    this.metrics = this.analyticsService.getMetrics();
    this.buildDonut();
    this.buildLoadChart();
    this.buildRotbotStats();
    this.themeTotal = this.metrics.themeSelections.dark + this.metrics.themeSelections.light;
  }

  private buildDonut() {
    const entries = Object.entries(this.metrics.sectionViews);
    const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
    const greys = ['#ffffff', '#d4d4d4', '#a3a3a3', '#737373', '#404040'];
    const circumference = 289; // 2 * PI * 46

    let offset = 0;
    this.donutSegments = entries.map(([name, views], i) => {
      const pct = Math.round((views / total) * 100);
      const dash = (views / total) * circumference;
      const seg = { name, color: greys[i % greys.length], pct, dash, offset };
      offset += dash;
      return seg;
    });
  }

  private buildLoadChart() {
    const times = this.metrics.loadTimes || [];
    if (!times.length) return;
    const max = Math.max(...times);
    this.loadMin = Math.min(...times);
    this.loadMax = max;
    this.loadAvg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    this.loadTimesBars = times.map(t => ({ val: t, pct: (t / (max || 1)) * 100 }));
  }

  private buildRotbotStats() {
    const avgMsg = this.metrics.rotbotOpens > 0
      ? (this.metrics.rotbotMessagesSent / this.metrics.rotbotOpens).toFixed(1)
      : '0';
    this.rotbotStats = [
      { label: 'Sesiones iniciadas', value: this.metrics.rotbotOpens },
      { label: 'Mensajes enviados', value: this.metrics.rotbotMessagesSent },
      { label: 'Msg. por sesión', value: avgMsg },
      { label: 'Tasa de uso', value: this.metrics.homeViews > 0 ? Math.round((this.metrics.rotbotOpens / this.metrics.homeViews) * 100) + '%' : '0%' },
    ];
  }
}
