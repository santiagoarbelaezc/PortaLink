import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { AnalyticsService, SystemMetrics } from '../../../services/analytics.service';

@Component({
  selector: 'app-dash-analytics',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="space-y-6 tab-enter">

      <!-- Header -->
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.3em]"
           [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Métricas Avanzadas</p>
        <h2 class="text-4xl font-bold uppercase tracking-tight mt-0.5"
            [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Analíticas</h2>
      </div>

      <!-- Row 1: Tendencia Semanal -->
      <div class="rounded-2xl border p-6"
           [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
        <h4 class="text-sm font-bold uppercase tracking-wide mb-5"
            [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Tendencia de Visitas (7 Días)</h4>
        <div class="w-full relative h-64 md:h-80">
          <canvas baseChart
            [data]="lineChartData"
            [options]="lineChartOptions"
            [type]="lineChartType"></canvas>
        </div>
      </div>

      <!-- Row 2: Fuentes + Radar -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        <!-- Fuentes de Tráfico -->
        <div class="rounded-2xl border p-6 flex flex-col"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <h4 class="text-sm font-bold uppercase tracking-wide mb-5"
              [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Fuentes de Tráfico</h4>
          <div class="w-full relative flex-grow min-h-[250px]">
            <canvas baseChart
              [data]="barChartData"
              [options]="barChartOptions"
              [type]="'bar'"></canvas>
          </div>
        </div>

        <!-- Radar Engagement -->
        <div class="rounded-2xl border p-6 flex flex-col"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <h4 class="text-sm font-bold uppercase tracking-wide mb-5"
              [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Interés por Sección</h4>
          <div class="w-full relative flex-grow min-h-[250px] flex justify-center items-center">
            <canvas baseChart
              [data]="radarChartData"
              [options]="radarChartOptions"
              [type]="'radar'"></canvas>
          </div>
        </div>

      </div>

      <!-- Row 3: Dispositivos + Tema Preferido -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <!-- Dispositivos -->
        <div class="rounded-2xl border p-6"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <h4 class="text-sm font-bold uppercase tracking-wide mb-5"
              [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Dispositivos (estimados)</h4>

          <div class="space-y-4">
            <div *ngFor="let dev of devices" class="space-y-1.5">
              <div class="flex justify-between items-center text-xs font-bold uppercase tracking-wide"
                   [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4 flex items-center justify-center" [innerHTML]="dev.svg"></div>
                  <span>{{ dev.name }}</span>
                </div>
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
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                  <span>Tema Oscuro</span>
                </div>
                <span [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-700'">{{ themeTotal === 0 ? 0 : ((metrics.themeSelections.dark / themeTotal) * 100 | number:'1.0-0') }}%</span>
              </div>
              <div class="h-2 rounded-full overflow-hidden" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-100'">
                <div class="h-full rounded-full transition-all duration-1000"
                     [style.width.%]="themeTotal === 0 ? 0 : (metrics.themeSelections.dark / themeTotal) * 100"
                     [ngClass]="isDark ? 'bg-blue-500' : 'bg-blue-600'"></div>
              </div>
              <p class="text-xs" [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'">{{ metrics.themeSelections.dark }} selecciones</p>
            </div>
            <!-- Light -->
            <div class="space-y-1.5">
              <div class="flex justify-between text-xs font-bold uppercase tracking-wide"
                   [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  <span>Tema Claro</span>
                </div>
                <span [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-700'">{{ themeTotal === 0 ? 0 : ((metrics.themeSelections.light / themeTotal) * 100 | number:'1.0-0') }}%</span>
              </div>
              <div class="h-2 rounded-full overflow-hidden" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-100'">
                <div class="h-full rounded-full transition-all duration-1000"
                     [style.width.%]="themeTotal === 0 ? 0 : (metrics.themeSelections.light / themeTotal) * 100"
                     [ngClass]="isDark ? 'bg-neutral-400' : 'bg-neutral-300'"></div>
              </div>
              <p class="text-xs" [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'">{{ metrics.themeSelections.light }} selecciones</p>
            </div>
          </div>
        </div>

      </div>

      <!-- Row 4: Rotbot Stats -->
      <div class="rounded-2xl border p-6"
           [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
        <h4 class="text-sm font-bold uppercase tracking-wide mb-5"
            [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Actividad de Rotbot IA</h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div *ngFor="let stat of rotbotStats"
               class="rounded-xl p-4 flex flex-col items-center justify-center text-center"
               [ngClass]="isDark ? 'bg-neutral-800/60' : 'bg-neutral-50'">
            <div class="w-8 h-8 mb-2 flex items-center justify-center rounded-full"
                 [ngClass]="isDark ? 'bg-neutral-700 text-blue-400' : 'bg-neutral-200 text-blue-600'"
                 [innerHTML]="stat.icon"></div>
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

  themeTotal = 0;

  devices = [
    { 
      icon: 'mobile', 
      name: 'Mobile', 
      pct: 58, 
      color: '#3b82f6',
      svg: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>'
    },
    { 
      icon: 'desktop', 
      name: 'Desktop', 
      pct: 35, 
      color: '#60a5fa',
      svg: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>'
    },
    { 
      icon: 'tablet', 
      name: 'Tablet', 
      pct: 7, 
      color: '#93c5fd',
      svg: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>'
    },
  ];

  rotbotStats: { label: string; value: any; icon: string }[] = [];

  // --- CHART.JS CONFIGURATIONS --- //

  // 1. Line Chart (Weekly Trend)
  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [120, 150, 180, 140, 210, 250, 310], // Mocked data
        label: 'Visitas',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3b82f6',
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#3b82f6',
        fill: 'origin',
        tension: 0.4
      }
    ],
    labels: [ 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom' ]
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: { tension: 0.5 }
    },
    scales: {
      y: { 
        beginAtZero: true,
        grid: { color: 'rgba(150, 150, 150, 0.1)' },
        ticks: { color: '#9ca3af' }
      },
      x: { 
        grid: { display: false },
        ticks: { color: '#9ca3af' }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };
  public lineChartType: ChartType = 'line';

  // 2. Bar Chart (Traffic Sources)
  public barChartData: ChartData<'bar'> = {
    labels: [ 'Directo', 'Google', 'LinkedIn', 'Instagram', 'Otros' ],
    datasets: [
      { 
        data: [ 450, 320, 210, 150, 80 ], // Mocked data
        label: 'Sesiones',
        backgroundColor: '#3b82f6',
        borderRadius: 4
      }
    ]
  };
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // horizontal bar chart
    scales: {
      y: { 
        grid: { display: false },
        ticks: { color: '#9ca3af' }
      },
      x: { 
        beginAtZero: true,
        grid: { color: 'rgba(150, 150, 150, 0.1)' },
        ticks: { color: '#9ca3af' }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  // 3. Radar Chart (Engagement)
  public radarChartData: ChartData<'radar'> = {
    labels: [ 'Skills', 'Proyectos', 'Contacto', 'Sobre Mí', 'Experiencia' ],
    datasets: [
      { 
        data: [ 85, 95, 70, 80, 60 ], // Mocked data
        label: 'Nivel de Interés',
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
      }
    ]
  };
  public radarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        max: 100,
        angleLines: { color: 'rgba(150, 150, 150, 0.1)' },
        grid: { color: 'rgba(150, 150, 150, 0.1)' },
        pointLabels: { color: '#9ca3af', font: { size: 11 } },
        ticks: { display: false }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  ngOnInit() {
    this.metrics = this.analyticsService.getMetrics();
    this.buildRotbotStats();
    this.themeTotal = this.metrics.themeSelections.dark + this.metrics.themeSelections.light;
  }

  private buildRotbotStats() {
    const avgMsg = this.metrics.rotbotOpens > 0
      ? (this.metrics.rotbotMessagesSent / this.metrics.rotbotOpens).toFixed(1)
      : '0';

    const iconSession = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>';
    const iconMessages = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>';
    const iconAvg = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>';
    const iconRate = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>';

    this.rotbotStats = [
      { label: 'Sesiones iniciadas', value: this.metrics.rotbotOpens, icon: iconSession },
      { label: 'Mensajes enviados', value: this.metrics.rotbotMessagesSent, icon: iconMessages },
      { label: 'Msg. por sesión', value: avgMsg, icon: iconAvg },
      { label: 'Tasa de uso', value: this.metrics.homeViews > 0 ? Math.round((this.metrics.rotbotOpens / this.metrics.homeViews) * 100) + '%' : '0%', icon: iconRate },
    ];
  }
}
