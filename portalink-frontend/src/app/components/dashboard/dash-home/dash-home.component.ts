import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService, SystemMetrics } from '../../../services/analytics.service';

@Component({
  selector: 'app-dash-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 tab-enter">

      <!-- ═══════════════════════ WELCOME BANNER ═══════════════════════ -->
      <div class="relative overflow-hidden rounded-2xl border p-6 md:p-8"
           [ngClass]="isDark ? 'bg-neutral-900/70 border-neutral-800' : 'bg-neutral-50 border-neutral-200'">

        <!-- Rotbot flotando -->
        <div class="absolute right-0 bottom-0 top-0 flex items-end overflow-hidden pointer-events-none select-none"
             style="width: 200px;">
          <img src="assets/images/rotbot4.png" class="h-full object-contain object-bottom opacity-20 translate-x-8" alt="">
        </div>

        <div class="relative z-10 max-w-[75%]">
          <p class="text-xs font-bold uppercase tracking-[0.3em] mb-1"
             [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Panel de Control</p>
          <h2 class="text-3xl font-bold leading-tight"
              [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
            Bienvenido, Santiago 👋
          </h2>
          <p class="text-sm mt-1 mb-5"
             [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">{{ currentDateTime }}</p>

          <!-- Quick chips -->
          <div class="flex flex-wrap gap-2">
            <span class="text-xs font-semibold px-3 py-1.5 rounded-full border"
                  [ngClass]="isDark ? 'border-neutral-700 text-neutral-300' : 'border-neutral-300 text-neutral-600'">
              👁 {{ metrics.homeViews }} Vistas
            </span>
            <span class="text-xs font-semibold px-3 py-1.5 rounded-full border"
                  [ngClass]="isDark ? 'border-neutral-700 text-neutral-300' : 'border-neutral-300 text-neutral-600'">
              ✉ {{ unreadMessages }} Mensajes nuevos
            </span>
            <span class="text-xs font-semibold px-3 py-1.5 rounded-full border"
                  [ngClass]="isDark ? 'border-neutral-700 text-neutral-300' : 'border-neutral-300 text-neutral-600'">
              📋 {{ pendingLeads }} Solicitudes
            </span>
            <span class="text-xs font-semibold px-3 py-1.5 rounded-full border text-green-500 border-green-500/20"
                  [ngClass]="isDark ? 'bg-green-500/5' : 'bg-green-50'">
              💚 Servidor Online
            </span>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════ METRIC CARDS ═══════════════════════ -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        <div *ngFor="let card of metricCards"
             class="rounded-2xl border p-5 transition-all duration-200 hover:translate-y-[-2px]"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700' : 'bg-white border-neutral-200 hover:border-neutral-300'">
          <div class="flex justify-between items-start mb-3">
            <p class="text-xs font-bold uppercase tracking-widest"
               [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">{{ card.label }}</p>
            <span class="p-2 rounded-xl border flex items-center justify-center"
                  [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-300' : 'bg-neutral-50 border-neutral-200 text-neutral-600'">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"
                   [innerHTML]="card.iconPath | sanitized">
              </svg>
            </span>
          </div>
          <p class="text-5xl font-bold tracking-tight leading-none"
             [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ card.value }}</p>
          <p class="text-xs mt-2.5 font-semibold"
             [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'">{{ card.sublabel }}</p>
        </div>

      </div>

      <!-- ═══════════════════════ CHARTS ROW 1 ═══════════════════════ -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <!-- Section Traffic -->
        <div class="rounded-2xl border p-6"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <h4 class="text-sm font-bold uppercase tracking-wide mb-5"
              [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Tráfico por Sección</h4>
          <div class="space-y-3.5">
            <div *ngFor="let sec of sectionViewsArray" class="space-y-1.5">
              <div class="flex justify-between text-xs font-semibold uppercase tracking-wide"
                   [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                <span>{{ sec.name }}</span>
                <span [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-700'">{{ sec.views }}</span>
              </div>
              <div class="h-1.5 rounded-full overflow-hidden"
                   [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-100'">
                <div class="h-full rounded-full transition-all duration-1000 ease-out"
                     [style.width.%]="getSectionPct(sec.views)"
                     [ngClass]="isDark ? 'bg-white' : 'bg-neutral-900'"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Linktree Clicks -->
        <div class="rounded-2xl border p-6"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <h4 class="text-sm font-bold uppercase tracking-wide mb-5"
              [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Clics en Linktree</h4>
          <div class="space-y-3.5">
            <div *ngFor="let link of linkClicksArray" class="space-y-1.5">
              <div class="flex justify-between text-xs font-semibold uppercase tracking-wide"
                   [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                <span>{{ link.name }}</span>
                <span [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-700'">{{ link.count }}</span>
              </div>
              <div class="h-1.5 rounded-full overflow-hidden"
                   [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-100'">
                <div class="h-full rounded-full transition-all duration-1000 ease-out"
                     [style.width.%]="getLinkPct(link.count)"
                     [ngClass]="isDark ? 'bg-neutral-400' : 'bg-neutral-500'"></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- ═══════════════════════ CHARTS ROW 2 ═══════════════════════ -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <!-- Weekly Sparkline -->
        <div class="rounded-2xl border p-6"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <div class="flex justify-between items-center mb-5">
            <h4 class="text-sm font-bold uppercase tracking-wide"
                [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Tendencia Semanal</h4>
            <span class="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full"
                  [ngClass]="isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-100 text-neutral-500'">En vivo</span>
          </div>
          <div class="w-full h-32 relative">
            <svg class="w-full h-full" viewBox="0 0 600 120" preserveAspectRatio="none">
              <!-- Grid lines -->
              <line x1="0" y1="20" x2="600" y2="20" stroke-width="1" [attr.stroke]="isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'"></line>
              <line x1="0" y1="60" x2="600" y2="60" stroke-width="1" [attr.stroke]="isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'"></line>
              <line x1="0" y1="100" x2="600" y2="100" stroke-width="1" [attr.stroke]="isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'"></line>
              <!-- Area fill -->
              <path d="M0,90 C80,55 140,35 200,70 C260,105 320,20 390,20 C450,20 510,80 600,50 L600,120 L0,120 Z"
                    [attr.fill]="isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'"></path>
              <!-- Line -->
              <path d="M0,90 C80,55 140,35 200,70 C260,105 320,20 390,20 C450,20 510,80 600,50"
                    fill="none" stroke-width="2.5" stroke-linecap="round"
                    [attr.stroke]="isDark ? '#ffffff' : '#111827'"></path>
            </svg>
          </div>
          <div class="flex justify-between text-[9px] uppercase tracking-widest mt-3 px-1"
               [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'">
            <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
          </div>
        </div>

        <!-- Server Status -->
        <div class="rounded-2xl border p-6"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <h4 class="text-sm font-bold uppercase tracking-wide mb-5"
              [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Estado del Servidor</h4>
          <div class="grid grid-cols-2 gap-4">
            <div *ngFor="let stat of serverStats"
                 class="rounded-xl p-4"
                 [ngClass]="isDark ? 'bg-neutral-800/60' : 'bg-neutral-50'">
              <p class="text-[10px] uppercase tracking-widest font-bold mb-1.5"
                 [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">{{ stat.label }}</p>
              <div class="flex items-center gap-2">
                <span *ngIf="stat.dot" class="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0"></span>
                <p class="text-sm font-bold"
                   [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-700'">{{ stat.value }}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Actions -->
      <div class="flex justify-end pt-2">
        <button (click)="resetMetrics()"
                class="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all duration-200 cursor-pointer hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/5"
                [ngClass]="isDark ? 'border-neutral-800 text-neutral-500' : 'border-neutral-200 text-neutral-500'">
          Reiniciar Métricas
        </button>
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
export class DashHomeComponent implements OnInit, OnDestroy {
  @Input() theme = 'dark';

  private analyticsService = inject(AnalyticsService);

  metrics!: SystemMetrics;
  currentDateTime = '';
  unreadMessages = 0;
  pendingLeads = 0;
  private clockInterval: any;

  get isDark() { return this.theme === 'dark'; }

  metricCards: any[] = [];
  sectionViewsArray: { name: string; views: number }[] = [];
  linkClicksArray: { name: string; count: number }[] = [];

  serverStats = [
    { label: 'Estado de API', value: '99.98% ONLINE', dot: true },
    { label: 'Uso de Memoria', value: '242 MB / 512 MB', dot: false },
    { label: 'Ping de Red', value: '42 ms', dot: false },
    { label: 'Sesiones Activas', value: '4 Concurrentes', dot: false },
  ];

  ngOnInit() {
    this.metrics = this.analyticsService.getMetrics();
    this.buildCards();
    this.buildArrays();
    this.loadBadges();
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
  }

  ngOnDestroy() {
    clearInterval(this.clockInterval);
  }

  private updateClock() {
    this.currentDateTime = new Date().toLocaleString('es-CO', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }

  private buildCards() {
    const avgLoad = this.getAvgLoad();
    this.metricCards = [
      { label: 'Vistas del Home', value: this.metrics.homeViews, sublabel: 'Página Principal', iconPath: 'eye' },
      { label: 'Vistas Linktree', value: this.metrics.linktreeViews, sublabel: 'Sección /links', iconPath: 'link' },
      { label: 'Consultas Rotbot', value: this.metrics.rotbotOpens, sublabel: `${this.metrics.rotbotMessagesSent} mensajes`, iconPath: 'chat' },
      { label: 'Carga Promedio', value: `${avgLoad}ms`, sublabel: 'Tiempo de respuesta', iconPath: 'bolt' },
    ];
  }

  private buildArrays() {
    this.sectionViewsArray = Object.entries(this.metrics.sectionViews)
      .map(([name, views]) => ({ name, views }))
      .sort((a, b) => b.views - a.views);

    this.linkClicksArray = Object.entries(this.metrics.linktreeClicks)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  private loadBadges() {
    try {
      const msgs = JSON.parse(localStorage.getItem('portalink_admin_messages') || '[]');
      const leads = JSON.parse(localStorage.getItem('portalink_admin_leads') || '[]');
      this.unreadMessages = msgs.filter((m: any) => !m.read).length;
      this.pendingLeads = leads.filter((l: any) => l.status === 'Pendiente').length;
    } catch { }
  }

  private getAvgLoad() {
    if (!this.metrics.loadTimes?.length) return 150;
    const sum = this.metrics.loadTimes.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.metrics.loadTimes.length);
  }

  getSectionPct(views: number) {
    const total = this.sectionViewsArray.reduce((s, i) => s + i.views, 0);
    return total === 0 ? 0 : (views / total) * 100;
  }

  getLinkPct(count: number) {
    const total = this.linkClicksArray.reduce((s, i) => s + i.count, 0);
    return total === 0 ? 0 : (count / total) * 100;
  }

  resetMetrics() {
    if (confirm('¿Estás seguro de que deseas reiniciar todas las métricas?')) {
      this.analyticsService.resetMetrics();
      this.metrics = this.analyticsService.getMetrics();
      this.buildCards();
      this.buildArrays();
    }
  }
}
