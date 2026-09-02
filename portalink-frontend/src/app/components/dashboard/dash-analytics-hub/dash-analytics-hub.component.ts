import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashAnalyticsComponent } from '../dash-analytics/dash-analytics.component';
import { DashStatsComponent } from '../dash-stats/dash-stats.component';
import { DashReportsComponent } from '../dash-reports/dash-reports.component';

export type AnalyticsSubTab = 'analytics' | 'stats' | 'reports';

@Component({
  selector: 'app-dash-analytics-hub',
  standalone: true,
  imports: [CommonModule, DashAnalyticsComponent, DashStatsComponent, DashReportsComponent],
  template: `
    <div class="space-y-6 tab-enter font-sans">

      <!-- ══════════════════════════════════════
           TOP TAB SWITCHER (ANALÍTICAS / ESTADÍSTICAS / REPORTES)
      ══════════════════════════════════════ -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 sm:p-2 rounded-2xl border backdrop-blur-xl transition-all"
           [ngClass]="isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-neutral-100/90 border-neutral-200'">
        
        <!-- Tab Selector Buttons -->
        <div class="flex items-center gap-1.5 w-full sm:w-auto flex-wrap">
          <!-- Pestaña Analíticas -->
          <button (click)="setSubTab('analytics')"
                  class="flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                  [ngClass]="activeSubTab === 'analytics'
                    ? (isDark ? 'bg-white text-black font-bold shadow-md' : 'bg-[#09090b] text-white font-bold shadow-md')
                    : (isDark ? 'text-neutral-400 hover:text-white hover:bg-white/5' : 'text-neutral-600 hover:text-black hover:bg-black/5')">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
            <span>Analíticas</span>
          </button>

          <!-- Pestaña Estadísticas -->
          <button (click)="setSubTab('stats')"
                  class="flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                  [ngClass]="activeSubTab === 'stats'
                    ? (isDark ? 'bg-white text-black font-bold shadow-md' : 'bg-[#09090b] text-white font-bold shadow-md')
                    : (isDark ? 'text-neutral-400 hover:text-white hover:bg-white/5' : 'text-neutral-600 hover:text-black hover:bg-black/5')">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            <span>Estadísticas</span>
          </button>

          <!-- Pestaña Reportes -->
          <button (click)="setSubTab('reports')"
                  class="flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                  [ngClass]="activeSubTab === 'reports'
                    ? (isDark ? 'bg-white text-black font-bold shadow-md' : 'bg-[#09090b] text-white font-bold shadow-md')
                    : (isDark ? 'text-neutral-400 hover:text-white hover:bg-white/5' : 'text-neutral-600 hover:text-black hover:bg-black/5')">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <span>Reportes</span>
          </button>
        </div>

        <!-- Explanatory Label -->
        <div class="hidden md:flex items-center gap-2 px-3 text-xs opacity-50 font-medium">
          <span *ngIf="activeSubTab === 'analytics'">Gráficos, KPIs y rendimiento de enlaces</span>
          <span *ngIf="activeSubTab === 'stats'">Auditoría, visitas por sección y métricas comerciales</span>
          <span *ngIf="activeSubTab === 'reports'">Generación de PDFs ejecutivos y bitácora de auditoría</span>
        </div>
      </div>

      <!-- ══════════════════════════════════════
           ACTIVE SUB-VIEW RENDERING
      ══════════════════════════════════════ -->
      <div>
        <app-dash-analytics *ngIf="activeSubTab === 'analytics'" [theme]="theme"></app-dash-analytics>
        <app-dash-stats *ngIf="activeSubTab === 'stats'" [theme]="theme"></app-dash-stats>
        <app-dash-reports *ngIf="activeSubTab === 'reports'" [theme]="theme"></app-dash-reports>
      </div>

    </div>
  `
})
export class DashAnalyticsHubComponent implements OnInit {
  @Input() theme: string = 'light';
  @Input() defaultSubTab: AnalyticsSubTab = 'analytics';

  activeSubTab: AnalyticsSubTab = 'analytics';

  get isDark(): boolean {
    return this.theme === 'dark';
  }

  ngOnInit(): void {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('portalink_analytics_subtab') as AnalyticsSubTab : null;
    if (saved === 'analytics' || saved === 'stats' || saved === 'reports') {
      this.activeSubTab = saved;
    } else {
      this.activeSubTab = this.defaultSubTab;
    }
  }

  setSubTab(subTab: AnalyticsSubTab): void {
    this.activeSubTab = subTab;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('portalink_analytics_subtab', subTab);
    }
  }
}
