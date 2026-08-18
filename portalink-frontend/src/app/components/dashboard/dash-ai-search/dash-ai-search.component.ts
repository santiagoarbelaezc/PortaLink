import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AnalyticsService } from '../../../services/analytics.service';

const TAB_LABELS: Record<string, string> = {
  dashboard: 'Inicio',
  'financial-control': 'Control Financiero',
  finances: 'Finanzas',
  itinerary: 'Calendario',
  analytics: 'Analíticas',
  stats: 'Estadísticas',
  messages: 'Mensajes',
  users: 'Usuarios',
  reports: 'Reportes',
  config: 'Configuración',
};

@Component({
  selector: 'app-dash-ai-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <header class="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 md:px-8 py-2 sm:py-5 border-b sticky top-0 z-30 transition-all duration-300"
            style="padding-top: calc(env(safe-area-inset-top, 0px) + 0.35rem);"
            [ngClass]="theme === 'dark' ? 'bg-[#07070a]/95 backdrop-blur-xl border-neutral-800' : 'bg-white/95 backdrop-blur-xl border-neutral-200'">

      <!-- Breadcrumb -->
      <div class="flex items-center gap-3 min-w-0">
        <!-- Sidebar Toggle (Hamburguesa) -->
        <button (click)="toggleSidebar.emit()" class="p-2 sm:p-2.5 -ml-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
                [ngClass]="theme === 'dark' ? 'hover:bg-white/10 text-neutral-200 hover:text-white' : 'hover:bg-black/5 text-neutral-700 hover:text-black'">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span class="text-xs font-headline font-semibold uppercase tracking-widest hidden sm:inline-block"
              [ngClass]="theme === 'dark' ? 'text-neutral-500' : 'text-neutral-400'">Consola</span>
        <svg class="w-3.5 h-3.5 flex-shrink-0 hidden sm:inline-block" [ngClass]="theme === 'dark' ? 'text-neutral-700' : 'text-neutral-300'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span class="text-xs sm:text-sm font-headline font-bold uppercase tracking-wider truncate"
              [ngClass]="theme === 'dark' ? 'text-neutral-200' : 'text-neutral-800'">{{ currentLabel }}</span>
      </div>

      <!-- Right Actions -->
      <div class="flex items-center gap-2.5 sm:gap-4">
        <!-- Botón Ver sitio en vivo -->
        <a routerLink="/"
           class="inline-flex items-center gap-2 px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-full font-headline font-semibold text-xs uppercase tracking-wider transition-all duration-300 border cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-sm"
           [ngClass]="theme === 'dark'
             ? 'bg-white/10 hover:bg-white text-white hover:text-black border-white/20 hover:border-white'
             : 'bg-[#09090b] hover:bg-neutral-800 text-white border-transparent'">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span class="hidden sm:inline">Ver sitio en vivo</span>
          <span class="sm:hidden">Sitio</span>
          <svg class="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H18m0 0v4.5M18 6l-7.5 7.5M6 18h12"/>
          </svg>
        </a>

        <!-- Theme Toggle -->
        <button (click)="themeChange.emit()"
                class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
                [ngClass]="theme === 'dark'
                  ? 'bg-white/5 border-white/10 hover:border-white/20'
                  : 'bg-black/5 border-black/10 hover:border-black/20'">
          <!-- Moon Icon (Light Mode - click to go Dark) -->
          <svg *ngIf="theme === 'light'" class="w-4 h-4 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
          <!-- Sun Icon (Dark Mode - click to go Light) -->
          <svg *ngIf="theme === 'dark'" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        </button>
      </div>
    </header>
  `,
  styles: []
})
export class DashAiSearchComponent {
  @Input() theme = 'light';
  @Input() activeTab = 'dashboard';
  @Output() tabChange = new EventEmitter<string>();
  @Output() themeChange = new EventEmitter<void>();
  @Output() toggleSidebar = new EventEmitter<void>();

  get currentLabel() {
    return TAB_LABELS[this.activeTab] || 'Panel';
  }
}
