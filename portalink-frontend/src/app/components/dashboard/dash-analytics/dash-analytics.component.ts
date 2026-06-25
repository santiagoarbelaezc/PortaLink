import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { AnalyticsService, SystemMetrics } from '../../../services/analytics.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
      <div class="perspective-1000 bg-transparent h-[400px]">
        <div class="relative w-full h-full transition-transform duration-700 preserve-3d"
             [class.rotate-y-180]="flippedCards['weekly']">
          
          <!-- Front -->
          <div class="absolute inset-0 backface-hidden rounded-2xl border p-6 cursor-pointer flex flex-col shadow-sm hover:shadow-md transition-shadow"
               [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'"
               (click)="toggleFlip('weekly')" title="Clic para ver datos">
            <h4 class="text-sm font-bold uppercase tracking-wide mb-5 flex justify-between items-center"
                [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">
              Tendencia de Visitas (7 Días)
              <svg class="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            </h4>
            <div class="w-full relative flex-grow min-h-[280px]">
              <canvas baseChart
                [data]="lineChartData"
                [options]="lineChartOptions"
                [type]="lineChartType"></canvas>
            </div>
          </div>

          <!-- Back -->
          <div class="absolute inset-0 backface-hidden rounded-2xl border p-6 cursor-pointer rotate-y-180 flex flex-col shadow-sm hover:shadow-md transition-shadow"
               [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-neutral-50 border-neutral-300'"
               (click)="toggleFlip('weekly')" title="Clic para volver al gráfico">
            <h4 class="text-sm font-bold uppercase tracking-wide mb-5 flex justify-between items-center"
                [ngClass]="isDark ? 'text-blue-400' : 'text-blue-600'">
              Datos: Tendencia Semanal
              <svg class="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
            </h4>
            <div class="flex-grow overflow-y-auto pr-2 custom-scrollbar">
              <table class="w-full text-sm text-left">
                <thead>
                  <tr class="border-b" [ngClass]="isDark ? 'border-neutral-700 text-neutral-400' : 'border-neutral-200 text-neutral-500'">
                    <th class="pb-2 font-semibold">Día</th>
                    <th class="pb-2 font-semibold text-right">Visitas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let label of lineChartData.labels; let i = index" 
                      class="border-b last:border-0 transition-colors"
                      [ngClass]="isDark ? 'border-neutral-700/50 text-neutral-300 hover:bg-neutral-700/30' : 'border-neutral-200 text-neutral-700 hover:bg-white'">
                    <td class="py-3 pl-2">{{ label }}</td>
                    <td class="py-3 pr-2 text-right font-medium">{{ lineChartData.datasets[0].data[i] }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 2: Fuentes + Radar -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        <!-- Fuentes de Tráfico -->
        <div class="perspective-1000 bg-transparent h-[340px]">
          <div class="relative w-full h-full transition-transform duration-700 preserve-3d"
               [class.rotate-y-180]="flippedCards['traffic']">
            <!-- Front -->
            <div class="absolute inset-0 backface-hidden rounded-2xl border p-6 flex flex-col cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                 [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'"
                 (click)="toggleFlip('traffic')">
              <h4 class="text-sm font-bold uppercase tracking-wide mb-5 flex justify-between items-center"
                  [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">
                Fuentes de Tráfico
                <svg class="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              </h4>
              <div class="w-full relative flex-grow">
                <canvas baseChart
                  [data]="barChartData"
                  [options]="barChartOptions"
                  [type]="'bar'"></canvas>
              </div>
            </div>
            <!-- Back -->
            <div class="absolute inset-0 backface-hidden rounded-2xl border p-6 cursor-pointer rotate-y-180 flex flex-col shadow-sm hover:shadow-md transition-shadow"
                 [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-neutral-50 border-neutral-300'"
                 (click)="toggleFlip('traffic')">
              <h4 class="text-sm font-bold uppercase tracking-wide mb-5 flex justify-between items-center"
                  [ngClass]="isDark ? 'text-blue-400' : 'text-blue-600'">
                Datos: Fuentes
                <svg class="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
              </h4>
              <div class="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                <table class="w-full text-sm text-left">
                  <thead>
                    <tr class="border-b" [ngClass]="isDark ? 'border-neutral-700 text-neutral-400' : 'border-neutral-200 text-neutral-500'">
                      <th class="pb-2 font-semibold">Fuente</th>
                      <th class="pb-2 font-semibold text-right">Sesiones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let label of barChartData.labels; let i = index" 
                        class="border-b last:border-0 transition-colors"
                        [ngClass]="isDark ? 'border-neutral-700/50 text-neutral-300 hover:bg-neutral-700/30' : 'border-neutral-200 text-neutral-700 hover:bg-white'">
                      <td class="py-3 pl-2">{{ label }}</td>
                      <td class="py-3 pr-2 text-right font-medium">{{ barChartData.datasets[0].data[i] }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Radar Engagement -->
        <div class="perspective-1000 bg-transparent h-[340px]">
          <div class="relative w-full h-full transition-transform duration-700 preserve-3d"
               [class.rotate-y-180]="flippedCards['radar']">
            <!-- Front -->
            <div class="absolute inset-0 backface-hidden rounded-2xl border p-6 flex flex-col cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                 [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'"
                 (click)="toggleFlip('radar')">
              <h4 class="text-sm font-bold uppercase tracking-wide mb-2 flex justify-between items-center"
                  [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">
                Interés por Sección
                <svg class="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              </h4>
              <div class="w-full relative flex-grow flex justify-center items-center">
                <canvas baseChart
                  [data]="radarChartData"
                  [options]="radarChartOptions"
                  [type]="'radar'"></canvas>
              </div>
            </div>
            <!-- Back -->
            <div class="absolute inset-0 backface-hidden rounded-2xl border p-6 cursor-pointer rotate-y-180 flex flex-col shadow-sm hover:shadow-md transition-shadow"
                 [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-neutral-50 border-neutral-300'"
                 (click)="toggleFlip('radar')">
              <h4 class="text-sm font-bold uppercase tracking-wide mb-5 flex justify-between items-center"
                  [ngClass]="isDark ? 'text-blue-400' : 'text-blue-600'">
                Datos: Interés
                <svg class="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
              </h4>
              <div class="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                <table class="w-full text-sm text-left">
                  <thead>
                    <tr class="border-b" [ngClass]="isDark ? 'border-neutral-700 text-neutral-400' : 'border-neutral-200 text-neutral-500'">
                      <th class="pb-2 font-semibold">Sección</th>
                      <th class="pb-2 font-semibold text-right">Puntaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let label of radarChartData.labels; let i = index" 
                        class="border-b last:border-0 transition-colors"
                        [ngClass]="isDark ? 'border-neutral-700/50 text-neutral-300 hover:bg-neutral-700/30' : 'border-neutral-200 text-neutral-700 hover:bg-white'">
                      <td class="py-3 pl-2">{{ label }}</td>
                      <td class="py-3 pr-2 text-right font-medium">{{ radarChartData.datasets[0].data[i] }}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
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
    .perspective-1000 { perspective: 1000px; }
    .preserve-3d { transform-style: preserve-3d; }
    .backface-hidden { backface-visibility: hidden; }
    .rotate-y-180 { transform: rotateY(180deg); }
    
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.5); border-radius: 10px; }
  `]
})
export class DashAnalyticsComponent implements OnInit {
  @Input() theme = 'dark';
  private analyticsService = inject(AnalyticsService);

  metrics!: SystemMetrics;
  get isDark() { return this.theme === 'dark'; }

  themeTotal = 0;

  flippedCards: { [key: string]: boolean } = {
    weekly: false,
    traffic: false,
    radar: false
  };

  toggleFlip(card: string) {
    this.flippedCards[card] = !this.flippedCards[card];
  }

  private sanitizer = inject(DomSanitizer);

  devices = [
    { 
      icon: 'mobile', 
      name: 'Mobile', 
      pct: 58, 
      color: '#3b82f6',
      svg: this.sanitizer.bypassSecurityTrustHtml('<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>')
    },
    { 
      icon: 'desktop', 
      name: 'Desktop', 
      pct: 35, 
      color: '#60a5fa',
      svg: this.sanitizer.bypassSecurityTrustHtml('<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>')
    },
    { 
      icon: 'tablet', 
      name: 'Tablet', 
      pct: 7, 
      color: '#93c5fd',
      svg: this.sanitizer.bypassSecurityTrustHtml('<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>')
    },
  ];

  rotbotStats: { label: string; value: any; icon: SafeHtml }[] = [];

  // --- CHART.JS CONFIGURATIONS --- //

  // 1. Line Chart (Weekly Trend)
  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [120, 280, 190, 460, 310, 580, 790], // Datos simulados más dramáticos
        label: 'Visitas',
        backgroundColor: 'rgba(59, 130, 246, 0.25)', // Más opacidad
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
      { label: 'Sesiones iniciadas', value: this.metrics.rotbotOpens, icon: this.sanitizer.bypassSecurityTrustHtml(iconSession) },
      { label: 'Mensajes enviados', value: this.metrics.rotbotMessagesSent, icon: this.sanitizer.bypassSecurityTrustHtml(iconMessages) },
      { label: 'Msg. por sesión', value: avgMsg, icon: this.sanitizer.bypassSecurityTrustHtml(iconAvg) },
      { label: 'Tasa de uso', value: this.metrics.homeViews > 0 ? Math.round((this.metrics.rotbotOpens / this.metrics.homeViews) * 100) + '%' : '0%', icon: this.sanitizer.bypassSecurityTrustHtml(iconRate) },
    ];
  }
}
