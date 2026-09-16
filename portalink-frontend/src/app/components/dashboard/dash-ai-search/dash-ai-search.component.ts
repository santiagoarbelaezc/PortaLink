import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RotbotMode } from '../../../services/robot-chat.service';
import { LibraryService } from '../../../services/library.service';

export type { RotbotMode };

const TAB_LABELS: Record<string, string> = {
  dashboard: 'Inicio',
  rotbot: 'Rotbot English Coach',
  'financial-control': 'Finanzas',
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
    <header class="flex-shrink-0 flex items-center justify-between px-3.5 sm:px-5 md:px-7 border-b relative z-30 transition-all duration-300 gap-2 sm:gap-3"
            [style.padding-top]="isMobileScreen ? 'calc(env(safe-area-inset-top, 0px) + 0.45rem)' : null"
            [ngClass]="[
              theme === 'dark' ? 'bg-[#07070a]/95 backdrop-blur-xl border-neutral-800' : 'bg-white/95 backdrop-blur-xl border-neutral-200',
              activeTab === 'library' && isNotesView ? 'py-3 sm:py-2 min-h-[56px] sm:min-h-[48px]' : 'py-3.5 sm:py-3.5 min-h-[62px] sm:min-h-[56px]'
            ]">

      <!-- ═══════════════════════ LEFT: IDENTITY / BREADCRUMB / LIBRARY TABS ═══════════════════════ -->
      <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        
        <!-- Sidebar Toggle (Hamburguesa) -->
        <button (click)="toggleSidebar.emit()" class="w-10 h-10 sm:w-auto sm:h-auto p-2 sm:p-2.5 -ml-1 sm:-ml-1.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0"
                [ngClass]="theme === 'dark' ? 'hover:bg-white/10 text-neutral-200 hover:text-white' : 'hover:bg-black/5 text-neutral-700 hover:text-black'"
                title="Alternar menú lateral">
          <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- A. Standard Breadcrumb (Non-Rotbot Tabs & Non-Notes-View) -->
        <ng-container *ngIf="activeTab !== 'rotbot' && !(activeTab === 'library' && isNotesView)">
          <span class="text-xs font-headline font-semibold uppercase tracking-widest hidden sm:inline-block"
                [ngClass]="theme === 'dark' ? 'text-neutral-500' : 'text-neutral-400'">Consola</span>
          <svg class="w-3.5 h-3.5 flex-shrink-0 hidden sm:inline-block" [ngClass]="theme === 'dark' ? 'text-neutral-700' : 'text-neutral-300'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span class="text-sm font-headline font-bold uppercase tracking-wider truncate"
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

        <!-- C. LIBRARY NOTES VIEW: BREADCRUMBS & WORKSPACE TABS DOCK -->
        <ng-container *ngIf="activeTab === 'library' && isNotesView">
          
          <!-- Migas de pan compactas (Desktop grande) -->
          <div class="hidden xl:flex items-center gap-1.5 text-xs font-headline font-semibold text-neutral-400 shrink-0 pr-1 select-none">
            <button (click)="libraryService.triggerBreadcrumb('root')" 
                    class="hover:text-white transition-colors flex items-center gap-1 cursor-pointer">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>
              <span>Biblioteca</span>
            </button>
            <span class="opacity-40">/</span>
            <button *ngIf="selectedFolder$ | async as folder" 
                    (click)="libraryService.triggerBreadcrumb('folder')"
                    class="hover:text-white transition-colors truncate max-w-[120px] cursor-pointer">
              {{ folder.name }}
            </button>
            <span *ngIf="selectedFolder$ | async" class="opacity-40">/</span>
          </div>

          <!-- Separador vertical -->
          <div class="h-4 w-px bg-neutral-800 shrink-0 hidden xl:block"></div>

          <!-- DOCK HORIZONTAL DE PESTAÑAS SIMULTÁNEAS (Visible only on desktop/tablet sm:flex) -->
          <div class="hidden sm:flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none min-w-0 flex-1 max-w-[500px] lg:max-w-[650px] xl:max-w-[750px]">
            <div *ngFor="let tab of tabs$ | async"
                 (click)="libraryService.triggerSwitchTab(tab.id)"
                 class="group/tab relative flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-headline font-semibold transition-all duration-150 cursor-pointer shrink-0 max-w-[170px] sm:max-w-[210px] select-none"
                 [ngClass]="(activeTabId$ | async) === tab.id 
                   ? (theme === 'dark' ? 'bg-[#18181d] border-neutral-700/90 text-white shadow-md shadow-black/40 ring-1 ring-white/10' : 'bg-neutral-100 border-neutral-300 text-neutral-950 shadow-xs ring-1 ring-neutral-900/10') 
                   : (theme === 'dark' ? 'bg-transparent border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40 hover:border-neutral-800' : 'bg-transparent border-transparent text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60 hover:border-neutral-300')">
              
              <span class="w-2 h-2 rounded-full shrink-0 transition-all"
                    [style.backgroundColor]="tab.color || '#737373'"
                    [style.boxShadow]="(activeTabId$ | async) === tab.id ? '0 0 8px ' + (tab.color || '#737373') : 'none'"
                    [class.animate-pulse]="(activeTabId$ | async) === tab.id"></span>

              <span class="truncate min-w-0 tracking-tight">{{ tab.title || 'Biblioteca' }}</span>

              <button type="button"
                      (click)="libraryService.triggerCloseTab(tab.id, $event)"
                      title="Cerrar pestaña"
                      class="w-4 h-4 rounded-md flex items-center justify-center transition-all ml-0.5 shrink-0 cursor-pointer"
                      [ngClass]="(activeTabId$ | async) === tab.id ? 'text-neutral-400 hover:text-red-400 hover:bg-red-500/20 opacity-70 hover:opacity-100' : 'text-neutral-500 hover:text-red-400 hover:bg-red-500/20 opacity-0 group-hover/tab:opacity-100'">
                <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <!-- Botón nueva pestaña -->
            <button type="button"
                    (click)="libraryService.triggerOpenNewTab()"
                    title="Abrir nueva pestaña de trabajo"
                    class="w-7 h-7 rounded-xl border flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-2xs"
                    [ngClass]="theme === 'dark' ? 'border-neutral-800/90 bg-neutral-900/60 hover:bg-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700' : 'border-neutral-300/90 bg-white/70 hover:bg-white text-neutral-600 hover:text-black hover:border-neutral-400'">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
            </button>
          </div>

          <!-- TÍTULO MÓVIL ELEGANTE (sm:hidden) -->
          <div class="flex sm:hidden items-center gap-2 min-w-0 flex-1">
            <ng-container *ngIf="(selectedNotebook$ | async) as notebook; else defaultNotesMobileTitle">
              <span class="w-2.5 h-2.5 rounded-full shrink-0"
                    [style.backgroundColor]="notebook.color || '#3b82f6'"
                    [style.boxShadow]="'0 0 8px ' + (notebook.color || '#3b82f6')"></span>
              <span class="font-headline font-bold text-xs tracking-tight truncate max-w-[130px]"
                    [ngClass]="theme === 'dark' ? 'text-white' : 'text-neutral-900'">
                {{ notebook.title }}
              </span>
            </ng-container>
            <ng-template #defaultNotesMobileTitle>
              <span class="w-2 h-2 rounded-full shrink-0 bg-blue-500"></span>
              <span class="font-headline font-bold text-xs tracking-tight truncate"
                    [ngClass]="theme === 'dark' ? 'text-white' : 'text-neutral-900'">
                Apuntes
              </span>
            </ng-template>
          </div>

        </ng-container>

      </div>

      <!-- ═══════════════════════ RIGHT: ACTIONS & CONTROLS ═══════════════════════ -->
      <div class="flex items-center gap-2 sm:gap-2.5 shrink-0">
        
        <!-- A. Non-Rotbot & Non-Notes Action: Ver Sitio en Vivo -->
        <ng-container *ngIf="activeTab !== 'rotbot' && !(activeTab === 'library' && isNotesView)">
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
          
          <!-- Mode Tabs (Chat & Study Plan) -->
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

        <!-- C. LIBRARY NOTES VIEW: BUSCADOR & NUEVO APUNTE -->
        <ng-container *ngIf="activeTab === 'library' && isNotesView">
          
          <!-- Botón Buscador en Móvil (toggle) -->
          <button type="button"
                  (click)="isMobileSearchOpen = !isMobileSearchOpen"
                  class="sm:hidden w-8 h-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer shrink-0"
                  [ngClass]="isMobileSearchOpen || (searchQuery$ | async)
                    ? (theme === 'dark' ? 'bg-white text-black border-white shadow-xs' : 'bg-neutral-900 text-white border-neutral-900 shadow-xs')
                    : (theme === 'dark' ? 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:border-white/20' : 'bg-black/5 border-black/10 text-neutral-600 hover:text-black hover:border-black/20')"
                  title="Buscar apuntes">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>

          <!-- Buscador Desktop/Tablet -->
          <div class="relative hidden sm:block w-[180px] md:w-[250px]">
            <input 
              type="text"
              [ngModel]="searchQuery$ | async"
              (ngModelChange)="libraryService.setSearchQuery($event)"
              spellcheck="false"
              autocorrect="off"
              autocapitalize="off"
              placeholder="Buscar apunte..."
              class="w-full pl-8 pr-7 py-1.5 text-xs rounded-full border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-neutral-400/50"
              [ngClass]="theme === 'dark' ? 'bg-neutral-900/80 border-neutral-800 text-white placeholder:text-neutral-500' : 'bg-neutral-100/80 border-neutral-200 text-neutral-900 placeholder:text-neutral-400'"
            />
            <svg class="w-3.5 h-3.5 absolute left-2.5 top-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <button *ngIf="(searchQuery$ | async)" (click)="libraryService.setSearchQuery('')"
                    class="absolute right-2 top-1.5 w-3.5 h-3.5 flex items-center justify-center opacity-60 hover:opacity-100 cursor-pointer text-xs"
                    title="Limpiar búsqueda">
              ✕
            </button>
          </div>

          <!-- Botón + Nuevo Apunte -->
          <button 
            (click)="libraryService.triggerCreateNewNote()"
            class="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-headline font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1 sm:gap-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98] shrink-0"
            [ngClass]="theme === 'dark' ? 'bg-white text-black hover:bg-neutral-200' : 'bg-[#09090b] text-white hover:bg-neutral-800'"
            title="Crear nuevo apunte"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
            <span class="hidden sm:inline">Nuevo Apunte</span>
            <span class="sm:hidden text-[11px]">Apunte</span>
          </button>

          <div class="h-4 w-px bg-neutral-800 shrink-0 hidden sm:block"></div>
        </ng-container>

        <!-- Theme Toggle Button -->
        <button (click)="themeChange.emit()"
                class="w-9 h-9 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shrink-0"
                [ngClass]="theme === 'dark'
                  ? 'bg-white/5 border-white/10 hover:border-white/20'
                  : 'bg-black/5 border-black/10 hover:border-black/20'"
                title="Cambiar tema">
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

    <!-- Barra de Búsqueda Desplegable en Móvil (iOS Style) -->
    <div *ngIf="isMobileSearchOpen && activeTab === 'library' && isNotesView"
         class="sm:hidden px-3 py-2 border-b flex items-center gap-2 relative z-30 transition-all duration-200"
         [ngClass]="theme === 'dark' ? 'bg-[#0b0b10] border-neutral-800/90' : 'bg-neutral-50 border-neutral-200'">
      <div class="relative flex-1">
        <input 
          type="text"
          [ngModel]="searchQuery$ | async"
          (ngModelChange)="libraryService.setSearchQuery($event)"
          spellcheck="false"
          autocorrect="off"
          autocapitalize="off"
          placeholder="Buscar en apuntes..."
          class="w-full pl-8 pr-7 py-1.5 text-xs rounded-full border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-neutral-400/50"
          [ngClass]="theme === 'dark' ? 'bg-neutral-900/90 border-neutral-800 text-white placeholder:text-neutral-500' : 'bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400'"
          autofocus
        />
        <svg class="w-3.5 h-3.5 absolute left-2.5 top-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <button *ngIf="(searchQuery$ | async)" (click)="libraryService.setSearchQuery('')"
                class="absolute right-2.5 top-2 w-3.5 h-3.5 flex items-center justify-center opacity-60 hover:opacity-100 cursor-pointer text-xs"
                title="Limpiar búsqueda">
          ✕
        </button>
      </div>
      <button (click)="isMobileSearchOpen = false" 
              class="text-xs font-semibold px-2 py-1 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0">
        Listo
      </button>
    </div>
  `,
  styles: []
})
export class DashAiSearchComponent {
  public libraryService = inject(LibraryService);

  isMobileSearchOpen: boolean = false;

  tabs$ = this.libraryService.tabs$;
  activeTabId$ = this.libraryService.activeTabId$;
  selectedNotebook$ = this.libraryService.selectedNotebook$;
  selectedFolder$ = this.libraryService.selectedFolder$;
  searchQuery$ = this.libraryService.searchQuery$;

  @Input() theme = 'light';
  @Input() activeTab = 'dashboard';
  @Input() isNotesView: boolean = false;
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
