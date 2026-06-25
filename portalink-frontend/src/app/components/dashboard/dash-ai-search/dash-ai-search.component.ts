import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsService } from '../../../services/analytics.service';

interface AiResult {
  emoji: string;
  title: string;
  value: string;
  tab?: string;
}

const TAB_LABELS: Record<string, string> = {
  dashboard: 'Inicio',
  analytics: 'Analíticas',
  stats: 'Estadísticas',
  messages: 'Mensajes',
  leads: 'Solicitudes',
  users: 'Usuarios',
  home: 'Personalizar',
  config: 'Configuración',
  reports: 'Reportes',
};

@Component({
  selector: 'app-dash-ai-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="flex-shrink-0 flex items-center justify-between px-6 md:px-8 py-4 border-b relative"
            [ngClass]="theme === 'dark' ? 'bg-[#07070a] border-neutral-800' : 'bg-white border-neutral-200'">

      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 min-w-0">
        <span class="text-xs font-semibold uppercase tracking-widest"
              [ngClass]="theme === 'dark' ? 'text-neutral-500' : 'text-neutral-400'">Consola</span>
        <svg class="w-3 h-3 flex-shrink-0" [ngClass]="theme === 'dark' ? 'text-neutral-700' : 'text-neutral-300'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span class="text-xs font-bold uppercase tracking-widest"
              [ngClass]="theme === 'dark' ? 'text-neutral-200' : 'text-neutral-700'">{{ currentLabel }}</span>
      </div>

      <!-- AI Search Bar -->
      <div class="relative ai-search-container mx-4 flex-grow max-w-sm">
        <div class="flex items-center rounded-xl border overflow-hidden transition-all duration-300"
             [ngClass]="[
               theme === 'dark' ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200',
               searchFocused ? (theme === 'dark' ? 'border-neutral-600 shadow-[0_0_0_2px_rgba(255,255,255,0.04)]' : 'border-neutral-400') : ''
             ]">
          <!-- Logo-link icon -->
          <div class="pl-3 flex-shrink-0 flex items-center">
            <img src="assets/icons/logo-link.png" class="w-5 h-5 object-contain opacity-60" alt="AI">
          </div>

          <!-- Input -->
          <input type="text"
                 [(ngModel)]="aiQuery"
                 (input)="onSearch()"
                 (focus)="searchFocused = true"
                 (blur)="onBlur()"
                 class="flex-grow bg-transparent px-3 py-2.5 text-sm focus:outline-none"
                 [ngClass]="theme === 'dark' ? 'text-white placeholder-neutral-600' : 'text-neutral-900 placeholder-neutral-400'"
                 [placeholder]="displayPlaceholder">

          <!-- Clear -->
          <button *ngIf="aiQuery" (click)="clearSearch()"
                  class="pr-3 flex-shrink-0 transition-opacity cursor-pointer"
                  [ngClass]="theme === 'dark' ? 'text-neutral-500 hover:text-neutral-300' : 'text-neutral-400 hover:text-neutral-600'">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Typing cursor (when no query) -->
          <span *ngIf="!aiQuery && !searchFocused" class="pr-3 text-sm typing-cursor"
                [ngClass]="theme === 'dark' ? 'text-neutral-600' : 'text-neutral-400'">|</span>
        </div>

        <!-- Results Dropdown -->
        <div *ngIf="aiOpen && aiResults.length > 0"
             class="absolute top-full left-0 right-0 mt-1.5 rounded-xl border shadow-2xl z-50 overflow-hidden animate-dropdown"
             [ngClass]="theme === 'dark' ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-neutral-200'">
          <div class="p-2">
            <p class="text-[10px] font-bold uppercase tracking-widest px-2 py-1.5"
               [ngClass]="theme === 'dark' ? 'text-neutral-600' : 'text-neutral-400'">Resultados del sistema</p>
            <button *ngFor="let result of aiResults"
                    (click)="selectResult(result)"
                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 cursor-pointer group"
                    [ngClass]="theme === 'dark' ? 'hover:bg-neutral-800' : 'hover:bg-neutral-50'">
              <span class="text-base flex-shrink-0">{{ result.emoji }}</span>
              <div class="flex-grow min-w-0">
                <p class="text-sm font-semibold truncate"
                   [ngClass]="theme === 'dark' ? 'text-neutral-200' : 'text-neutral-800'">{{ result.title }}</p>
                <p class="text-xs truncate"
                   [ngClass]="theme === 'dark' ? 'text-neutral-500' : 'text-neutral-500'">{{ result.value }}</p>
              </div>
              <svg *ngIf="result.tab" class="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-60 transition-opacity"
                   [ngClass]="theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Right Actions -->
      <div class="flex items-center gap-2">
        <!-- Theme Toggle -->
        <button (click)="themeChange.emit()"
                class="w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-200 cursor-pointer"
                [ngClass]="theme === 'dark'
                  ? 'border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                  : 'border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-300'">
          <span class="text-base" [ngClass]="theme === 'dark' ? '' : 'filter'">
            {{ theme === 'dark' ? '☀️' : '🌙' }}
          </span>
        </button>

        <!-- Admin avatar badge -->
        <div class="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold uppercase cursor-default"
             [ngClass]="theme === 'dark' ? 'bg-white text-black' : 'bg-neutral-900 text-white'">
          A
        </div>
      </div>
    </header>
  `,
  styles: [`
    .typing-cursor {
      animation: blink 1s step-end infinite;
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    .animate-dropdown {
      animation: dropdownIn 0.15s ease-out forwards;
    }
    @keyframes dropdownIn {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class DashAiSearchComponent implements OnInit, OnDestroy {
  @Input() theme = 'dark';
  @Input() activeTab = 'dashboard';
  @Output() tabChange = new EventEmitter<string>();
  @Output() themeChange = new EventEmitter<void>();

  private analyticsService = inject(AnalyticsService);

  aiQuery = '';
  aiResults: AiResult[] = [];
  aiOpen = false;
  searchFocused = false;

  // Typewriter
  displayPlaceholder = '';
  private placeholders = [
    'Buscar vistas del sistema...',
    'Buscar mensajes pendientes...',
    'Consultar estado del servidor...',
    'Buscar usuarios registrados...',
    'Consultar métricas de tráfico...',
  ];
  private placeholderIdx = 0;
  private charIdx = 0;
  private typeInterval: any;
  private pauseTimeout: any;

  get currentLabel() {
    return TAB_LABELS[this.activeTab] || 'Panel';
  }

  ngOnInit() {
    this.startTypewriter();
  }

  ngOnDestroy() {
    clearInterval(this.typeInterval);
    clearTimeout(this.pauseTimeout);
  }

  private startTypewriter() {
    this.typeInterval = setInterval(() => {
      if (this.aiQuery || this.searchFocused) return;
      const target = this.placeholders[this.placeholderIdx];
      if (this.charIdx < target.length) {
        this.displayPlaceholder = target.substring(0, this.charIdx + 1);
        this.charIdx++;
      } else {
        clearInterval(this.typeInterval);
        this.pauseTimeout = setTimeout(() => {
          // Erase
          const eraseInterval = setInterval(() => {
            if (this.charIdx > 0) {
              this.charIdx--;
              this.displayPlaceholder = target.substring(0, this.charIdx);
            } else {
              clearInterval(eraseInterval);
              this.placeholderIdx = (this.placeholderIdx + 1) % this.placeholders.length;
              this.startTypewriter();
            }
          }, 25);
        }, 1800);
      }
    }, 65);
  }

  onSearch() {
    const q = this.aiQuery.toLowerCase().trim();
    if (!q) {
      this.aiResults = [];
      this.aiOpen = false;
      return;
    }

    const metrics = this.analyticsService.getMetrics();
    const msgRaw = localStorage.getItem('portalink_admin_messages');
    const leadsRaw = localStorage.getItem('portalink_admin_leads');
    const usersRaw = localStorage.getItem('portalink_admin_users');

    const messages = msgRaw ? JSON.parse(msgRaw) : [];
    const leads = leadsRaw ? JSON.parse(leadsRaw) : [];
    const users = usersRaw ? JSON.parse(usersRaw) : [];

    const unread = messages.filter((m: any) => !m.read).length;
    const pending = leads.filter((l: any) => l.status === 'Pendiente').length;

    const results: AiResult[] = [];

    if (/vista|home|inicio|portafolio|principal/.test(q))
      results.push({ emoji: '👁', title: 'Vistas del Home', value: `${metrics.homeViews} visitas totales`, tab: 'dashboard' });

    if (/linktree|enlace|link/.test(q))
      results.push({ emoji: '🔗', title: 'Vistas Linktree', value: `${metrics.linktreeViews} visitas`, tab: 'dashboard' });

    if (/mensaje|correo|bandeja|mail/.test(q))
      results.push({ emoji: '✉️', title: 'Mensajes recibidos', value: `${unread} sin leer de ${messages.length} totales`, tab: 'messages' });

    if (/solicitud|plan|lead|cliente/.test(q))
      results.push({ emoji: '📋', title: 'Solicitudes de planes', value: `${pending} pendientes de respuesta`, tab: 'leads' });

    if (/usuario|user|registro/.test(q))
      results.push({ emoji: '👥', title: 'Usuarios registrados', value: `${users.length} usuarios en el sistema`, tab: 'users' });

    if (/server|servidor|salud|estado|online/.test(q))
      results.push({ emoji: '💚', title: 'Estado del Servidor', value: 'ONLINE · 99.98% uptime · Ping 42ms', tab: 'dashboard' });

    if (/rotbot|chat|ia|asistente|consulta/.test(q))
      results.push({ emoji: '🤖', title: 'Rotbot IA', value: `${metrics.rotbotOpens} sesiones · ${metrics.rotbotMessagesSent} mensajes`, tab: 'dashboard' });

    if (/analiti|tendencia|trafico|tráfico/.test(q))
      results.push({ emoji: '📈', title: 'Analíticas avanzadas', value: 'Distribución de tráfico y tendencias', tab: 'analytics' });

    if (/estadistic|sección|seccion|drill/.test(q))
      results.push({ emoji: '📊', title: 'Estadísticas por sección', value: 'Vista detallada con drill-down', tab: 'stats' });

    if (/reporte|export|resumen/.test(q))
      results.push({ emoji: '📄', title: 'Reportes', value: 'Exportar métricas y configuración', tab: 'reports' });

    if (results.length === 0 && q.length >= 2)
      results.push({ emoji: '🔍', title: 'Sin coincidencias', value: 'Prueba: vistas, mensajes, usuarios, servidor...' });

    this.aiResults = results;
    this.aiOpen = true;
  }

  onBlur() {
    setTimeout(() => {
      this.searchFocused = false;
      this.aiOpen = false;
    }, 200);
  }

  clearSearch() {
    this.aiQuery = '';
    this.aiResults = [];
    this.aiOpen = false;
  }

  selectResult(result: AiResult) {
    if (result.tab) {
      this.tabChange.emit(result.tab);
    }
    this.clearSearch();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: Event) {
    const t = e.target as HTMLElement;
    if (!t.closest('.ai-search-container')) {
      this.aiOpen = false;
    }
  }
}
