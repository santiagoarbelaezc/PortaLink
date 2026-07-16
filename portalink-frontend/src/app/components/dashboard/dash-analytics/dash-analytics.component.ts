import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { AnalyticsService, SystemMetrics } from '../../../services/analytics.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PdfReportService } from '../../../services/pdf-report.service';

@Component({
  selector: 'app-dash-analytics',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="space-y-6 tab-enter">

      <!-- Header -->
      <div class="flex items-start justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.3em]"
             [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Métricas Avanzadas</p>
          <h2 class="text-4xl font-bold uppercase tracking-tight mt-0.5"
              [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Analíticas</h2>
        </div>
        <button (click)="downloadPdf()"
                [disabled]="pdfLoading"
                class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all duration-200 cursor-pointer mt-1"
                [ngClass]="isDark ? 'border-red-900/60 text-red-400 hover:bg-red-950/40 hover:border-red-700' : 'border-red-200 text-red-600 hover:bg-red-50'">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {{ pdfLoading ? 'Generando...' : 'Exportar PDF' }}
        </button>
      </div>

      <!-- Link KPIs Summary -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4" *ngIf="metrics">
        <!-- Card 1: Visitas al Link -->
        <div class="rounded-2xl border p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[11px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Visitas al Link</span>
            <div class="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            </div>
          </div>
          <div>
            <h3 class="text-3xl font-extrabold tracking-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ metrics.linktreeViews || 0 }}</h3>
            <p class="text-[11px] mt-1 flex items-center gap-1.5" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">
              <span>Home: {{ metrics.homeViews || 0 }} visitas</span>
            </p>
          </div>
        </div>

        <!-- Card 2: Total Clics -->
        <div class="rounded-2xl border p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[11px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Clics en Enlaces</span>
            <div class="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
            </div>
          </div>
          <div>
            <h3 class="text-3xl font-extrabold tracking-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ metrics.totalClicks || 0 }}</h3>
            <p class="text-[11px] mt-1 flex items-center gap-1.5 text-emerald-500">
              <span>Interacción social y redes</span>
            </p>
          </div>
        </div>

        <!-- Card 3: CTR del Link -->
        <div class="rounded-2xl border p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[11px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Tasa de Clics (CTR)</span>
            <div class="w-8 h-8 rounded-xl flex items-center justify-center bg-purple-500/10 text-purple-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            </div>
          </div>
          <div>
            <h3 class="text-3xl font-extrabold tracking-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ metrics.linkCtr || 0 }}%</h3>
            <p class="text-[11px] mt-1 flex items-center gap-1.5" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">
              <span>Conversión de visitantes</span>
            </p>
          </div>
        </div>

        <!-- Card 4: Enlace Más Popular -->
        <div class="rounded-2xl border p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[11px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Enlace Top</span>
            <div class="w-8 h-8 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
            </div>
          </div>
          <div>
            <h3 class="text-2xl font-extrabold tracking-tight truncate" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'" [title]="metrics.topLink?.name || 'Ninguno'">{{ metrics.topLink?.name || 'Ninguno' }}</h3>
            <p class="text-[11px] mt-1 flex items-center gap-1.5 text-amber-500 font-medium">
              <span>{{ metrics.topLink?.count || 0 }} clics totales</span>
            </p>
          </div>
        </div>
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
              Tendencia de Visitas Reales (7 Días)
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
                <tbody *ngIf="metrics && metrics.dailyTrend && metrics.dailyTrend.length > 0; else defaultWeeklyRows">
                  <tr *ngFor="let item of metrics.dailyTrend" 
                      class="border-b last:border-0 transition-colors"
                      [ngClass]="isDark ? 'border-neutral-700/50 text-neutral-300 hover:bg-neutral-700/30' : 'border-neutral-200 text-neutral-700 hover:bg-white'">
                    <td class="py-3 pl-2">{{ item.day }} <span class="text-xs opacity-50">({{ item.date }})</span></td>
                    <td class="py-3 pr-2 text-right font-medium">{{ item.total }} <span class="text-xs opacity-60">({{ item.linktree }} Link)</span></td>
                  </tr>
                </tbody>
                <ng-template #defaultWeeklyRows>
                  <tbody>
                    <tr *ngFor="let label of lineChartData.labels; let i = index" 
                        class="border-b last:border-0 transition-colors"
                        [ngClass]="isDark ? 'border-neutral-700/50 text-neutral-300 hover:bg-neutral-700/30' : 'border-neutral-200 text-neutral-700 hover:bg-white'">
                      <td class="py-3 pl-2">{{ label }}</td>
                      <td class="py-3 pr-2 text-right font-medium">{{ lineChartData.datasets[0].data[i] }}</td>
                    </tr>
                  </tbody>
                </ng-template>
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
                Clics por Enlace / Red Social
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
                Datos: Clics y Porcentajes
                <svg class="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
              </h4>
              <div class="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                <table class="w-full text-sm text-left">
                  <thead>
                    <tr class="border-b" [ngClass]="isDark ? 'border-neutral-700 text-neutral-400' : 'border-neutral-200 text-neutral-500'">
                      <th class="pb-2 font-semibold">Enlace</th>
                      <th class="pb-2 font-semibold text-right">Clics</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let label of barChartData.labels; let i = index" 
                        class="border-b last:border-0 transition-colors"
                        [ngClass]="isDark ? 'border-neutral-700/50 text-neutral-300 hover:bg-neutral-700/30' : 'border-neutral-200 text-neutral-700 hover:bg-white'">
                      <td class="py-3 pl-2">{{ label }}</td>
                      <td class="py-3 pr-2 text-right font-medium">{{ barChartData.datasets[0].data[i] }} <span class="text-xs opacity-50">({{ getClickPercentage(i) }}%)</span></td>
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
              [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Dispositivos Reales (Sesiones)</h4>

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
  private pdfService = inject(PdfReportService);

  metrics!: SystemMetrics;
  get isDark() { return this.theme === 'dark'; }
  pdfLoading = false;

  themeTotal = 0;

  flippedCards: { [key: string]: boolean } = {
    weekly: false,
    traffic: false,
    radar: false
  };

  toggleFlip(card: string) {
    this.flippedCards[card] = !this.flippedCards[card];
  }

  getClickPercentage(index: number): number {
    const val = Number(this.barChartData.datasets[0].data[index] || 0);
    const total = Number((this.metrics && this.metrics.totalClicks) || 1);
    return Math.round((val / (total || 1)) * 100);
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
    this.analyticsService.getMetrics().subscribe(m => {
      this.metrics = m;
      this.buildRotbotStats();
      this.themeTotal = (this.metrics?.themeSelections?.dark || 0) + (this.metrics?.themeSelections?.light || 0);
      if (this.metrics?.devices && this.metrics.devices.length > 0) {
        this.devices = this.metrics.devices.map(d => {
          let icon = 'desktop';
          let color = '#60a5fa';
          let svg = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>';
          if (d.name.toLowerCase().includes('mobile')) {
            icon = 'mobile';
            color = '#3b82f6';
            svg = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>';
          } else if (d.name.toLowerCase().includes('tablet')) {
            icon = 'tablet';
            color = '#93c5fd';
            svg = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>';
          }
          return {
            icon,
            name: d.name,
            pct: d.pct,
            color,
            svg: this.sanitizer.bypassSecurityTrustHtml(svg)
          };
        });
      }
      this.buildCharts();
    });
  }

  async downloadPdf() {
    this.pdfLoading = true;
    try { await this.pdfService.downloadAnalyticsReport(this.metrics); } finally { this.pdfLoading = false; }
  }

  private buildCharts() {
    // 1. Line Chart (Weekly Trend) - Real Daily Trend from backend
    if (this.metrics.dailyTrend && this.metrics.dailyTrend.length > 0) {
      this.lineChartData = {
        labels: this.metrics.dailyTrend.map(d => d.day),
        datasets: [{
          ...this.lineChartData.datasets[0],
          data: this.metrics.dailyTrend.map(d => d.total || (d.home + d.linktree)),
          label: 'Visitas Reales'
        }]
      };
    } else {
      const totalViews = (this.metrics.homeViews || 0) + (this.metrics.linktreeViews || 0);
      const baseCurve = [0.1, 0.15, 0.1, 0.2, 0.15, 0.1, 0.2];
      const trendData = baseCurve.map(pct => Math.round(totalViews * pct));
      this.lineChartData = {
        ...this.lineChartData,
        datasets: [{ ...this.lineChartData.datasets[0], data: trendData }]
      };
    }

    // 2. Bar Chart (Link Clicks / Sources) - Real Ranking from backend
    const rawLinks = { ...(this.metrics.linktreeClicks || {}) };
    
    // Diccionario de nombres legibles para cada botón del componente link
    const buttonNamesMap: { [key: string]: string } = {
      '1': 'TikTok (Tarjeta)', 'tiktok': 'TikTok (Tarjeta)',
      '2': 'Instagram (Tarjeta)', 'instagram': 'Instagram (Tarjeta)',
      '3': 'WhatsApp (Chat)', 'whatsapp': 'WhatsApp (Chat)',
      '4': 'LinkedIn (Tarjeta)', 'linkedin': 'LinkedIn (Tarjeta)',
      'proyectos': 'Portafolio / Proyectos',
      'telefono': 'Teléfono (+57 3054078225)',
      'email': 'Correo Electrónico',
      'instagram_footer': 'Instagram (Footer)',
      'tiktok_footer': 'TikTok (Footer)',
      'foto_1': 'Foto 1 - Galería',
      'foto_2': 'Foto 2 - Galería',
      'foto_3': 'Foto 3 - Galería',
      'foto_4': 'Foto 4 - Galería',
      'foto_5': 'Foto 5 - Galería',
      'pwa_instalar_btn': 'Botón Instalar App (PWA)',
      'pwa_cerrar': 'Cerrar Modal App (PWA)',
      'pwa_siguiente': 'Siguiente Paso PWA',
      'pwa_atras': 'Atrás Paso PWA',
      'pwa_entendido': 'Entendido Modal PWA'
    };

    // Asegurar que todos los botones principales de la interfaz estén presentes para desglose completo
    const officialKeys = [
      'proyectos', 'tiktok', 'instagram', 'whatsapp', 'linkedin',
      'telefono', 'email', 'instagram_footer', 'tiktok_footer'
    ];
    officialKeys.forEach(k => {
      if (rawLinks[k] === undefined && rawLinks[k === 'tiktok' ? '1' : k === 'instagram' ? '2' : k === 'whatsapp' ? '3' : k === 'linkedin' ? '4' : k] === undefined) {
        rawLinks[k] = 0;
      }
    });

    // Consolidar IDs numéricos antiguos y nombres nuevos
    const consolidated: { [label: string]: number } = {};
    for (const [key, val] of Object.entries(rawLinks)) {
      const label = buttonNamesMap[key] || (key.charAt(0).toUpperCase() + key.slice(1));
      consolidated[label] = (consolidated[label] || 0) + Number(val);
    }

    const entries = Object.entries(consolidated).sort((a, b) => b[1] - a[1]);

    if (entries.length > 0) {
      this.barChartData = {
        labels: entries.map(e => e[0]),
        datasets: [{
          ...this.barChartData.datasets[0],
          data: entries.map(e => e[1]),
          label: 'Clics Registrados'
        }]
      };
    } else {
      this.barChartData = {
        labels: ['TikTok (Tarjeta)', 'Instagram (Tarjeta)', 'WhatsApp (Chat)', 'LinkedIn (Tarjeta)', 'Portafolio / Proyectos'],
        datasets: [{
          ...this.barChartData.datasets[0],
          data: [0, 0, 0, 0, 0]
        }]
      };
    }

    // 3. Radar Chart (Section Views)
    const sections = this.metrics.sectionViews || {};
    const maxView = Math.max(
      sections['skills'] || 0,
      sections['portfolio'] || 0,
      sections['contact'] || 0,
      sections['about'] || 0,
      sections['hero'] || 0,
      sections['retratos'] || 0,
      1
    );
    
    this.radarChartData = {
      labels: ['Skills', 'Proyectos', 'Contacto', 'Sobre Mí', 'Hero', 'Retratos'],
      datasets: [{
        ...this.radarChartData.datasets[0],
        data: [
          Math.round(((sections['skills'] || 0) / maxView) * 100),
          Math.round(((sections['portfolio'] || 0) / maxView) * 100),
          Math.round(((sections['contact'] || 0) / maxView) * 100),
          Math.round(((sections['about'] || 0) / maxView) * 100),
          Math.round(((sections['hero'] || 0) / maxView) * 100),
          Math.round(((sections['retratos'] || 0) / maxView) * 100)
        ]
      }]
    };
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
