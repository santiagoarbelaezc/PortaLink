import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsService } from '../../../services/analytics.service';



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
      <div class="flex items-center gap-3 min-w-0">
        <!-- Sidebar Toggle -->
        <button (click)="toggleSidebar.emit()" class="p-2 -ml-2 rounded-xl transition-colors"
                [ngClass]="theme === 'dark' ? 'hover:bg-white/10 text-neutral-400 hover:text-white' : 'hover:bg-black/5 text-neutral-500 hover:text-black'">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span class="text-xs font-semibold uppercase tracking-widest"
              [ngClass]="theme === 'dark' ? 'text-neutral-500' : 'text-neutral-400'">Consola</span>
        <svg class="w-3 h-3 flex-shrink-0" [ngClass]="theme === 'dark' ? 'text-neutral-700' : 'text-neutral-300'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span class="text-xs font-bold uppercase tracking-widest"
              [ngClass]="theme === 'dark' ? 'text-neutral-200' : 'text-neutral-700'">{{ currentLabel }}</span>
      </div>

      <!-- Right Actions -->
      <div class="flex items-center gap-2">
        <!-- Theme Toggle -->
        <button (click)="themeChange.emit()"
                class="w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
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
  @Input() theme = 'dark';
  @Input() activeTab = 'dashboard';
  @Output() tabChange = new EventEmitter<string>();
  @Output() themeChange = new EventEmitter<void>();
  @Output() toggleSidebar = new EventEmitter<void>();

  get currentLabel() {
    return TAB_LABELS[this.activeTab] || 'Panel';
  }
}
