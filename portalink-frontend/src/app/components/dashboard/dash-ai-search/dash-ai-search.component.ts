import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RotbotMode } from '../../../services/robot-chat.service';

export type { RotbotMode };

const TAB_LABELS: Record<string, string> = {
  dashboard: 'Inicio',
  rotbot: 'Rotbot English Coach',
  'financial-control': 'Control Financiero',
  finances: 'Finanzas',
  itinerary: 'Calendario',
  library: 'Biblioteca',
  analytics: 'Analíticas',
  stats: 'Analíticas',
  messages: 'Mensajes',
  users: 'Usuarios',
  reports: 'Analíticas',
  config: 'Configuración',
  'db-viewer': 'Visor de Base de Datos',
};

@Component({
  selector: 'app-dash-ai-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <header class="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 md:px-8 py-2.5 sm:py-3.5 border-b sticky top-0 z-30 transition-all duration-300 gap-3"
            [style.padding-top]="isMobileScreen ? 'calc(env(safe-area-inset-top, 0px) + 0.35rem)' : null"
            [ngClass]="theme === 'dark' ? 'bg-[#07070a]/95 backdrop-blur-xl border-neutral-800' : 'bg-white/95 backdrop-blur-xl border-neutral-200'">

      <!-- ═══════════════════════ LEFT: IDENTITY / BREADCRUMB ═══════════════════════ -->
      <div class="flex items-center gap-3 min-w-0">
        
        <!-- Sidebar Toggle (Hamburguesa) -->
        <button (click)="toggleSidebar.emit()" class="p-2 sm:p-2.5 -ml-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0"
                [ngClass]="theme === 'dark' ? 'hover:bg-white/10 text-neutral-200 hover:text-white' : 'hover:bg-black/5 text-neutral-700 hover:text-black'">
          <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- A. Standard Breadcrumb (Non-Rotbot Tabs) -->
        <ng-container *ngIf="activeTab !== 'rotbot'">
          <span class="text-xs font-headline font-semibold uppercase tracking-widest hidden sm:inline-block"
                [ngClass]="theme === 'dark' ? 'text-neutral-500' : 'text-neutral-400'">Consola</span>
          <svg class="w-3.5 h-3.5 flex-shrink-0 hidden sm:inline-block" [ngClass]="theme === 'dark' ? 'text-neutral-700' : 'text-neutral-300'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span class="text-xs sm:text-sm font-headline font-bold uppercase tracking-wider truncate"
                [ngClass]="theme === 'dark' ? 'text-neutral-200' : 'text-neutral-800'">{{ currentLabel }}</span>
        </ng-container>

        <!-- B. Rotbot English Coach Identity in Top Header -->
        <ng-container *ngIf="activeTab === 'rotbot'">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                 [ngClass]="theme === 'dark' ? 'bg-[#141419] border border-neutral-800 text-white' : 'bg-neutral-100 border border-neutral-200 text-neutral-900'">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <div class="min-w-0">
              <h1 class="text-sm sm:text-base font-headline font-bold tracking-tight truncate leading-none"
                  [ngClass]="theme === 'dark' ? 'text-white' : 'text-neutral-900'">
                Rotbot IA
              </h1>
              <p class="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 truncate mt-1 leading-none hidden sm:block">
                Coach de Idiomas & Tutor Inteligente
              </p>
            </div>
          </div>
        </ng-container>

      </div>

      <!-- ═══════════════════════ RIGHT: ACTIONS & CONTROLS ═══════════════════════ -->
      <div class="flex items-center gap-2 sm:gap-3 shrink-0">
        
        <!-- A. Non-Rotbot Action: Ver Sitio en Vivo -->
        <ng-container *ngIf="activeTab !== 'rotbot'">
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
        </ng-container>

        <!-- B. Rotbot Action: Mode Tabs & Voice Toggle -->
        <ng-container *ngIf="activeTab === 'rotbot'">
          
          <!-- Mode Tabs (Chat, Learn, Listening, Study Plan) -->
          <div class="flex items-center gap-1 p-1 rounded-2xl border backdrop-blur-md"
               [ngClass]="theme === 'dark' ? 'bg-[#141419] border-neutral-800' : 'bg-neutral-100 border-neutral-200'">
            
            <!-- Chat Tab -->
            <button (click)="rotbotModeChange.emit('charla')"
                    class="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                    [ngClass]="rotbotMode === 'charla'
                      ? (theme === 'dark' ? 'bg-white text-black shadow-md font-bold' : 'bg-neutral-900 text-white shadow-md font-bold')
                      : (theme === 'dark' ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-neutral-600 hover:text-black hover:bg-white')">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span class="hidden sm:inline">Chat</span>
            </button>

            <!-- Learn Tab -->
            <button (click)="rotbotModeChange.emit('ensenanza')"
                    class="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                    [ngClass]="rotbotMode === 'ensenanza'
                      ? (theme === 'dark' ? 'bg-white text-black shadow-md font-bold' : 'bg-neutral-900 text-white shadow-md font-bold')
                      : (theme === 'dark' ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-neutral-600 hover:text-black hover:bg-white')">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                <path d="M8 7h8"/>
                <path d="M8 11h6"/>
              </svg>
              <span class="hidden sm:inline">Learn</span>
            </button>

            <!-- Listening Tab -->
            <button (click)="rotbotModeChange.emit('escucha')"
                    class="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                    [ngClass]="rotbotMode === 'escucha'
                      ? (theme === 'dark' ? 'bg-white text-black shadow-md font-bold' : 'bg-neutral-900 text-white shadow-md font-bold')
                      : (theme === 'dark' ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-neutral-600 hover:text-black hover:bg-white')">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>
              </svg>
              <span class="hidden sm:inline">Listening</span>
            </button>

            <!-- Study Plan Tab -->
            <button (click)="rotbotModeChange.emit('study-plan')"
                    class="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 relative"
                    [ngClass]="rotbotMode === 'study-plan'
                      ? (theme === 'dark' ? 'bg-white text-black shadow-md font-bold' : 'bg-neutral-900 text-white shadow-md font-bold')
                      : (theme === 'dark' ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-neutral-600 hover:text-black hover:bg-white')">
              <span class="relative flex h-2 w-2" *ngIf="isStudyPlanActive">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              <span class="hidden sm:inline">Study Plan</span>
            </button>

          </div>

          <!-- Mute / Voice Active Toggle -->
          <button (click)="rotbotMutedChange.emit(!rotbotMuted)"
                  class="px-3 py-2 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center gap-1.5 text-xs sm:text-sm font-semibold"
                  [ngClass]="rotbotMuted 
                    ? 'bg-red-500/10 border-red-500/30 text-red-500' 
                    : (theme === 'dark' ? 'bg-[#141419] border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700' : 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:text-black')"
                  [title]="rotbotMuted ? 'Desactivar silencio' : 'Silenciar voz'">
            <svg *ngIf="!rotbotMuted" class="w-4 h-4 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.414 0-.75-.336-.75-.75V8.25c0-.414.336-.75.75-.75h2.24z" />
            </svg>
            <svg *ngIf="rotbotMuted" class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-1.5l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.414 0-.75-.336-.75-.75V8.25c0-.414.336-.75.75-.75h2.24z" />
            </svg>
            <span class="hidden md:inline">{{ rotbotMuted ? 'Muted' : 'Voice Active' }}</span>
          </button>
        </ng-container>

        <!-- Theme Toggle Button -->
        <button (click)="themeChange.emit()"
                class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shrink-0"
                [ngClass]="theme === 'dark'
                  ? 'bg-white/5 border-white/10 hover:border-white/20'
                  : 'bg-black/5 border-black/10 hover:border-black/20'">
          <!-- Moon Icon (Light Mode) -->
          <svg *ngIf="theme === 'light'" class="w-4 h-4 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
          <!-- Sun Icon (Dark Mode) -->
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
  @Input() rotbotMode: RotbotMode = 'charla';
  @Output() rotbotModeChange = new EventEmitter<RotbotMode>();
  @Input() rotbotMuted: boolean = false;
  @Output() rotbotMutedChange = new EventEmitter<boolean>();
  @Input() isStudyPlanActive: boolean = false;
  @Output() openStudyPlanModal = new EventEmitter<void>();

  @Output() tabChange = new EventEmitter<string>();
  @Output() themeChange = new EventEmitter<void>();
  @Output() toggleSidebar = new EventEmitter<void>();

  get currentLabel() {
    return TAB_LABELS[this.activeTab] || 'Panel';
  }

  get isMobileScreen(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  }
}
