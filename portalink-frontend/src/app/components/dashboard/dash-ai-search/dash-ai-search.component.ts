import { Component, Input, Output, EventEmitter, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RotbotMode } from '../../../services/robot-chat.service';
import { LibraryService } from '../../../services/library.service';

export type { RotbotMode };

const TAB_LABELS: Record<string, string> = {
  dashboard: 'Inicio',
  rotbot: 'Rotbot English Coach',
  'financial-control': 'Analíticas',
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
              activeTab === 'library' && isNotesView ? 'py-2.5 sm:py-3 min-h-[66px] sm:min-h-[64px]' : 'py-3.5 sm:py-3.5 min-h-[62px] sm:min-h-[56px]'
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

        <!-- C. LIBRARY NOTES VIEW: BREADCRUMBS -->
        <ng-container *ngIf="activeTab === 'library' && isNotesView">
          
          <!-- Migas de pan compactas (Desktop/Tablet) -->
          <div class="hidden sm:flex items-center gap-1.5 text-xs font-headline font-semibold shrink-0 select-none"
               [ngClass]="theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'">
            <button (click)="libraryService.triggerBreadcrumb('root')" 
                    class="transition-colors flex items-center gap-1 cursor-pointer"
                    [ngClass]="theme === 'dark' ? 'hover:text-white' : 'hover:text-black'">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>
              <span>Biblioteca</span>
            </button>
            <span class="opacity-40">/</span>
            <button *ngIf="selectedFolder$ | async as folder" 
                    (click)="libraryService.triggerBreadcrumb('folder')"
                    class="transition-colors truncate max-w-[140px] cursor-pointer"
                    [ngClass]="theme === 'dark' ? 'hover:text-white' : 'hover:text-black'">
              {{ folder.name }}
            </button>
            <span *ngIf="selectedFolder$ | async" class="opacity-40">/</span>
            <span *ngIf="(selectedNotebook$ | async) as notebook"
                  class="font-bold truncate max-w-[220px] flex items-center gap-1.5"
                  [ngClass]="theme === 'dark' ? 'text-white' : 'text-neutral-900'">
              <span class="w-2.5 h-2.5 rounded-full shrink-0" 
                    [style.backgroundColor]="notebook.color || '#3b82f6'"
                    [style.boxShadow]="'0 0 8px ' + (notebook.color || '#3b82f6')"></span>
              {{ notebook.title }}
            </span>
          </div>

          <!-- TÍTULO MÓVIL ELEGANTE (sm:hidden) CON BOTÓN VOLVER -->
          <div class="flex sm:hidden items-center gap-1.5 min-w-0 flex-1">
            <button type="button"
                    (click)="libraryService.triggerBreadcrumb('folder')"
                    title="Volver a los cuadernos"
                    class="w-7 h-7 -ml-1 rounded-xl border flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-90"
                    [ngClass]="theme === 'dark' ? 'border-neutral-800 bg-neutral-900/80 text-neutral-300 active:bg-neutral-800' : 'border-neutral-200 bg-neutral-100 text-neutral-700 active:bg-neutral-200'">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <ng-container *ngIf="(selectedNotebook$ | async) as notebook; else defaultNotesMobileTitle">
              <span class="w-2.5 h-2.5 rounded-full shrink-0"
                    [style.backgroundColor]="notebook.color || '#3b82f6'"
                    [style.boxShadow]="'0 0 8px ' + (notebook.color || '#3b82f6')"></span>
              <span class="font-headline font-bold text-xs tracking-tight truncate max-w-[120px]"
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

        <!-- B. Rotbot Action: Voice Toggle -->
        <ng-container *ngIf="activeTab === 'rotbot'">
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
            <svg *ngIf="rotbotMuted" class="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.414 0-.75-.336-.75-.75V8.25c0-.414.336-.75.75-.75h2.24z" />
            </svg>
            <span class="hidden sm:inline">{{ rotbotMuted ? 'Mudo' : 'Voz activa' }}</span>
          </button>
        </ng-container>

        <!-- C. LIBRARY NOTES VIEW: TOOLBAR DE TAREAS Y ACCIONES DEL BLOQUE (A LA IZQUIERDA DEL BOTON DE TEMA) -->
        <ng-container *ngIf="activeTab === 'library' && isNotesView && (activeBlockMeta$ | async) as currentBlock">
          <div class="relative flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl border backdrop-blur-2xl shadow-xl text-xs sm:text-[13px] font-headline font-bold transition-all max-w-[calc(100vw-130px)] sm:max-w-none overflow-x-auto scrollbar-none select-none shrink-0"
               [ngClass]="theme === 'dark' 
                 ? 'bg-[#121217]/95 border-neutral-800/90 text-neutral-100 shadow-black/60 ring-1 ring-white/[0.08]' 
                 : 'bg-white/95 border-neutral-200/90 text-neutral-800 shadow-neutral-300/50 ring-1 ring-black/[0.05]'">
            
            <!-- BADGE DEL TIPO + ICONO REFINADO -->
            <div class="flex items-center gap-2 h-8.5 sm:h-9 px-3 rounded-xl font-mono uppercase tracking-wider text-xs sm:text-[12px] font-black shrink-0 border transition-all duration-200 shadow-2xs"
                 [ngClass]="getBlockTypeBadgeClass(currentBlock.type)">
              
              <!-- Icono Columnas -->
              <svg *ngIf="currentBlock.type === 'columnas'" class="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                <rect x="3.5" y="4.5" width="7" height="15" rx="2" stroke-linecap="round" stroke-linejoin="round" />
                <rect x="13.5" y="4.5" width="7" height="15" rx="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <!-- Icono Título H1 -->
              <svg *ngIf="currentBlock.type === 'titulo'" class="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 5.5v13M12.75 5.5v13M3.75 12h9M18.75 18.5V9.75l-2.25 1.5" />
              </svg>
              <!-- Icono Subtítulo H2 -->
              <svg *ngIf="currentBlock.type === 'subtitulo'" class="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 5.5v13M12 5.5v13M3.75 12h8.25M17.25 10a2 2 0 114 0c0 1.5-2.25 2.5-4 4.5h4" />
              </svg>
              <!-- Icono Texto -->
              <svg *ngIf="currentBlock.type === 'texto'" class="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h11" />
              </svg>
              <!-- Icono Código -->
              <svg *ngIf="currentBlock.type === 'codigo'" class="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 8l-4.5 4 4.5 4m8-8l4.5 4-4.5 4m-6.5 2l3-12" />
              </svg>
              <!-- Icono Alerta -->
              <svg *ngIf="currentBlock.type === 'alerta'" class="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 3.5h.008M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <!-- Icono Imagen -->
              <svg *ngIf="currentBlock.type === 'imagen'" class="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                <rect x="3" y="4.5" width="18" height="15" rx="3" stroke-linecap="round" stroke-linejoin="round" />
                <circle cx="8.5" cy="9" r="1.5" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 15.5l-5-5L5 20.5" />
              </svg>
              <span class="truncate max-w-[95px] sm:max-w-none">{{ getBlockTypeLabel(currentBlock.type) }}</span>
            </div>

            <!-- BOTÓN CAMBIAR TIPO CON MENÚ DESPLEGABLE -->
            <div class="relative">
              <button type="button"
                      (click)="toggleTypeDropdown($event)"
                      title="Cambiar tipo de bloque"
                      class="flex items-center gap-1.5 h-8.5 sm:h-9 px-3 rounded-xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer hover:scale-102 active:scale-98"
                      [ngClass]="isTypeDropdownOpen 
                        ? (theme === 'dark' ? 'bg-neutral-800 text-white ring-1 ring-neutral-700' : 'bg-neutral-200 text-black ring-1 ring-neutral-300') 
                        : (theme === 'dark' ? 'text-neutral-300 hover:text-white hover:bg-neutral-800/80' : 'text-neutral-700 hover:text-black hover:bg-neutral-100')">
                <span>Cambiar</span>
                <svg class="w-4 h-4 transition-transform duration-200 opacity-70"
                     [class.rotate-180]="isTypeDropdownOpen"
                     fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              <!-- MENÚ FLOTANTE CAMBIAR TIPO -->
              <div *ngIf="isTypeDropdownOpen"
                   (click)="$event.stopPropagation()"
                   class="absolute left-0 sm:right-0 top-full mt-2 w-56 z-50 rounded-2xl border shadow-2xl p-2 backdrop-blur-2xl animate-fade-in font-sans font-medium"
                   [ngClass]="theme === 'dark' ? 'bg-[#18181f]/95 border-neutral-700/80 text-white shadow-black/80 ring-1 ring-white/10' : 'bg-white/95 border-neutral-200 text-neutral-900 shadow-xl ring-1 ring-black/5'">
                <div class="space-y-1 text-xs sm:text-[13px]">
                  <!-- Opción Título H1 -->
                  <button type="button" (click)="changeType('titulo', $event)"
                          class="w-full px-3 py-2 rounded-xl text-left font-bold flex items-center justify-between cursor-pointer transition-colors"
                          [ngClass]="currentBlock.type === 'titulo' 
                            ? (theme === 'dark' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-blue-50 text-blue-800 border border-blue-200') 
                            : (theme === 'dark' ? 'hover:bg-neutral-800/80 text-neutral-300 hover:text-white' : 'hover:bg-neutral-100 text-neutral-700 hover:text-black')">
                    <div class="flex items-center gap-2.5">
                      <span class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 bg-blue-500/15 text-blue-400">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.3"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 5.5v13M12.75 5.5v13M3.75 12h9M18.75 18.5V9.75l-2.25 1.5" /></svg>
                      </span>
                      <span>H1 Título</span>
                    </div>
                    <kbd class="text-[10px] font-mono opacity-60 bg-neutral-500/10 px-1.5 py-0.5 rounded">T</kbd>
                  </button>

                  <!-- Opción Subtítulo H2 -->
                  <button type="button" (click)="changeType('subtitulo', $event)"
                          class="w-full px-3 py-2 rounded-xl text-left font-bold flex items-center justify-between cursor-pointer transition-colors"
                          [ngClass]="currentBlock.type === 'subtitulo' 
                            ? (theme === 'dark' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'bg-sky-50 text-sky-800 border border-sky-200') 
                            : (theme === 'dark' ? 'hover:bg-neutral-800/80 text-neutral-300 hover:text-white' : 'hover:bg-neutral-100 text-neutral-700 hover:text-black')">
                    <div class="flex items-center gap-2.5">
                      <span class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 bg-sky-500/15 text-sky-400">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.3"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 5.5v13M12 5.5v13M3.75 12h8.25M17.25 10a2 2 0 114 0c0 1.5-2.25 2.5-4 4.5h4" /></svg>
                      </span>
                      <span>H2 Subtítulo</span>
                    </div>
                    <kbd class="text-[10px] font-mono opacity-60 bg-neutral-500/10 px-1.5 py-0.5 rounded">S</kbd>
                  </button>

                  <!-- Opción Texto Normal -->
                  <button type="button" (click)="changeType('texto', $event)"
                          class="w-full px-3 py-2 rounded-xl text-left font-bold flex items-center justify-between cursor-pointer transition-colors"
                          [ngClass]="currentBlock.type === 'texto' 
                            ? (theme === 'dark' ? 'bg-neutral-700/60 text-white border border-neutral-600' : 'bg-neutral-200 text-black border border-neutral-300') 
                            : (theme === 'dark' ? 'hover:bg-neutral-800/80 text-neutral-300 hover:text-white' : 'hover:bg-neutral-100 text-neutral-700 hover:text-black')">
                    <div class="flex items-center gap-2.5">
                      <span class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 bg-neutral-500/15 text-neutral-400">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.3"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h11" /></svg>
                      </span>
                      <span>Texto Normal</span>
                    </div>
                    <kbd class="text-[10px] font-mono opacity-60 bg-neutral-500/10 px-1.5 py-0.5 rounded">N</kbd>
                  </button>

                  <!-- Opción Código -->
                  <button type="button" (click)="changeType('codigo', $event)"
                          class="w-full px-3 py-2 rounded-xl text-left font-bold flex items-center justify-between cursor-pointer transition-colors"
                          [ngClass]="currentBlock.type === 'codigo' 
                            ? (theme === 'dark' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-indigo-50 text-indigo-800 border border-indigo-200') 
                            : (theme === 'dark' ? 'hover:bg-neutral-800/80 text-neutral-300 hover:text-white' : 'hover:bg-neutral-100 text-neutral-700 hover:text-black')">
                    <div class="flex items-center gap-2.5">
                      <span class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 bg-indigo-500/15 text-indigo-400">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 8l-4.5 4 4.5 4m8-8l4.5 4-4.5 4m-6.5 2l3-12" /></svg>
                      </span>
                      <span>&lt;/&gt; Código</span>
                    </div>
                    <kbd class="text-[10px] font-mono opacity-60 bg-neutral-500/10 px-1.5 py-0.5 rounded">C</kbd>
                  </button>

                  <!-- Opción Alerta -->
                  <button type="button" (click)="changeType('alerta', $event)"
                          class="w-full px-3 py-2 rounded-xl text-left font-bold flex items-center justify-between cursor-pointer transition-colors"
                          [ngClass]="currentBlock.type === 'alerta' 
                            ? (theme === 'dark' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-50 text-amber-800 border border-amber-200') 
                            : (theme === 'dark' ? 'hover:bg-neutral-800/80 text-neutral-300 hover:text-white' : 'hover:bg-neutral-100 text-neutral-700 hover:text-black')">
                    <div class="flex items-center gap-2.5">
                      <span class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 bg-amber-500/15 text-amber-400">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 3.5h.008M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                      </span>
                      <span>⚠ Alerta</span>
                    </div>
                    <kbd class="text-[10px] font-mono opacity-60 bg-neutral-500/10 px-1.5 py-0.5 rounded">A</kbd>
                  </button>

                  <!-- Opción 2 Columnas -->
                  <button type="button" (click)="changeType('columnas', $event)"
                          class="w-full px-3 py-2 rounded-xl text-left font-bold flex items-center justify-between cursor-pointer transition-colors"
                          [ngClass]="currentBlock.type === 'columnas' 
                            ? (theme === 'dark' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-purple-50 text-purple-800 border border-purple-200') 
                            : (theme === 'dark' ? 'hover:bg-neutral-800/80 text-neutral-300 hover:text-white' : 'hover:bg-neutral-100 text-neutral-700 hover:text-black')">
                    <div class="flex items-center gap-2.5">
                      <span class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 bg-purple-500/15 text-purple-400">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3.5" y="4.5" width="7" height="15" rx="2"/><rect x="13.5" y="4.5" width="7" height="15" rx="2"/></svg>
                      </span>
                      <span>◫ 2 Columnas</span>
                    </div>
                    <kbd class="text-[10px] font-mono opacity-60 bg-neutral-500/10 px-1.5 py-0.5 rounded">2</kbd>
                  </button>

                  <!-- Opción Imagen -->
                  <button type="button" (click)="changeType('imagen', $event)"
                          class="w-full px-3 py-2 rounded-xl text-left font-bold flex items-center justify-between cursor-pointer transition-colors"
                          [ngClass]="currentBlock.type === 'imagen' 
                            ? (theme === 'dark' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-800 border border-emerald-200') 
                            : (theme === 'dark' ? 'hover:bg-neutral-800/80 text-neutral-300 hover:text-white' : 'hover:bg-neutral-100 text-neutral-700 hover:text-black')">
                    <div class="flex items-center gap-2.5">
                      <span class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 bg-emerald-500/15 text-emerald-400">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="4.5" width="18" height="15" rx="3"/><circle cx="8.5" cy="9" r="1.5"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 15.5l-5-5L5 20.5"/></svg>
                      </span>
                      <span>🖼 Imagen</span>
                    </div>
                    <kbd class="text-[10px] font-mono opacity-60 bg-neutral-500/10 px-1.5 py-0.5 rounded">I</kbd>
                  </button>
                </div>
              </div>
            </div>

            <!-- SEPARADOR -->
            <div class="h-5 sm:h-6 w-px mx-0.5 shrink-0" [ngClass]="theme === 'dark' ? 'bg-neutral-800' : 'bg-neutral-200'"></div>

            <!-- BOTÓN IA ROTBOT -->
            <button type="button"
                    (click)="triggerAction('ai', null, $event)"
                    title="Asistente RotBot IA para este bloque"
                    class="h-8.5 sm:h-9 px-3 sm:px-3.5 rounded-xl text-xs sm:text-[13px] font-extrabold transition-all cursor-pointer flex items-center gap-2 border shrink-0 hover:scale-105 active:scale-95 shadow-xs"
                    [ngClass]="theme === 'dark' 
                      ? 'border-purple-500/40 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 text-purple-200 hover:bg-purple-500/30 hover:border-purple-400 ring-1 ring-purple-500/20 shadow-purple-500/20' 
                      : 'border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 hover:bg-purple-100 hover:border-purple-300 shadow-purple-500/10'">
              <svg class="w-4 h-4 fill-current shrink-0 text-purple-400 dark:text-purple-300" viewBox="0 0 24 24">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"/>
              </svg>
              <span>IA</span>
            </button>

            <!-- SEPARADOR -->
            <div class="h-5 sm:h-6 w-px mx-0.5 shrink-0" [ngClass]="theme === 'dark' ? 'bg-neutral-800' : 'bg-neutral-200'"></div>

            <!-- B (Negrilla) -->
            <button type="button"
                    (click)="triggerAction('bold', null, $event)"
                    title="Negrilla (Ctrl + B)"
                    class="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 hover:scale-105 active:scale-95"
                    [ngClass]="theme === 'dark' ? 'text-neutral-200 hover:text-white hover:bg-neutral-800' : 'text-neutral-700 hover:text-black hover:bg-neutral-100'">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4h7a4 4 0 012.83 6.83A4.5 4.5 0 0113.5 20H6V4zm3 3v4h4a1.5 1.5 0 000-3H9zm0 7v4h4.5a1.5 1.5 0 000-3H9z"/>
              </svg>
            </button>

            <!-- I (Cursiva) -->
            <button type="button"
                    (click)="triggerAction('italic', null, $event)"
                    title="Cursiva (Ctrl + I)"
                    class="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 hover:scale-105 active:scale-95"
                    [ngClass]="theme === 'dark' ? 'text-neutral-200 hover:text-white hover:bg-neutral-800' : 'text-neutral-700 hover:text-black hover:bg-neutral-100'">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 4h7v2.5h-2.5l-3 11H14V20H7v-2.5h2.5l3-11H10V4z"/>
              </svg>
            </button>

            <!-- ROJO -->
            <button type="button"
                    (click)="triggerAction('red', null, $event)"
                    title="Colorear en rojo (Ctrl + Shift + D)"
                    class="flex items-center gap-2 h-8.5 sm:h-9 px-3 sm:px-3.5 rounded-xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer shrink-0 border hover:scale-105 active:scale-95"
                    [ngClass]="(libraryService.isRedTextActive$ | async) 
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 ring-2 ring-rose-500/30' 
                      : (theme === 'dark' ? 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:bg-rose-500/15 hover:border-rose-500/30 hover:text-rose-400' : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600')">
              <span class="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 shrink-0 shadow-sm shadow-rose-500/80 ring-2 ring-rose-400/40"></span>
              <span class="hidden sm:inline">Rojo</span>
            </button>

            <!-- LEER CON ROTBOT -->
            <button type="button"
                    (click)="triggerAction('read', null, $event)"
                    [title]="(libraryService.isReadingBlock$ | async) ? 'Detener lectura' : 'Leer en voz alta con RotBot'"
                    class="h-8.5 sm:h-9 px-3 sm:px-3.5 rounded-xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer flex items-center gap-2 border shrink-0 hover:scale-105 active:scale-95 shadow-xs"
                    [ngClass]="(libraryService.isReadingBlock$ | async) 
                      ? 'border-cyan-500 bg-cyan-500/25 text-cyan-200 ring-2 ring-cyan-400/40 shadow-md shadow-cyan-500/30' 
                      : (theme === 'dark' ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50' : 'border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 hover:border-cyan-300')">
              <svg *ngIf="!(libraryService.isReadingBlock$ | async)" class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.414 0-.75-.336-.75-.75V8.25c0-.414.336-.75.75-.75h2.24z" />
              </svg>
              <div *ngIf="libraryService.isReadingBlock$ | async" class="flex items-center gap-0.5 h-3.5 shrink-0">
                <span class="w-0.5 bg-cyan-400 rounded-full animate-voice-bar h-2.5"></span>
                <span class="w-0.5 bg-cyan-400 rounded-full animate-voice-bar h-3.5" style="animation-delay: 0.1s"></span>
                <span class="w-0.5 bg-cyan-400 rounded-full animate-voice-bar h-2" style="animation-delay: 0.2s"></span>
              </div>
              <span>{{ (libraryService.isReadingBlock$ | async) ? 'Parar' : 'Leer' }}</span>
            </button>

            <!-- SEPARADOR -->
            <div class="h-5 sm:h-6 w-px mx-0.5 shrink-0" [ngClass]="theme === 'dark' ? 'bg-neutral-800' : 'bg-neutral-200'"></div>

            <!-- + TEXTO DEBAJO -->
            <button type="button"
                    (click)="triggerAction('addBelow', null, $event)"
                    title="Añadir bloque de texto debajo"
                    class="h-8.5 sm:h-9 px-3 sm:px-3.5 rounded-xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer flex items-center gap-2 border shrink-0 hover:scale-105 active:scale-95 shadow-xs"
                    [ngClass]="theme === 'dark' ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 hover:border-emerald-500/60' : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300'">
              <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span class="hidden sm:inline">Texto debajo</span>
              <span class="sm:hidden">Texto</span>
            </button>

            <!-- SUBIR / BAJAR (AGRUPADOS EN PASTILLA SEGMENTADA) -->
            <div class="flex items-center h-8.5 sm:h-9 rounded-xl border p-0.5 shrink-0"
                 [ngClass]="theme === 'dark' ? 'border-neutral-800 bg-neutral-900/80' : 'border-neutral-200 bg-neutral-100/80'">
              <button type="button"
                      (click)="triggerAction('moveUp', null, $event)"
                      [disabled]="(libraryService.activeBlockIndex$ | async)! <= 0"
                      title="Mover bloque arriba"
                      class="w-7.5 h-7.5 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-neutral-800 hover:text-white disabled:opacity-25 disabled:hover:bg-transparent transition-all cursor-pointer">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button type="button"
                      (click)="triggerAction('moveDown', null, $event)"
                      [disabled]="(libraryService.activeBlockIndex$ | async)! >= ((libraryService.totalBlocksCount$ | async)! - 1)"
                      title="Mover bloque abajo"
                      class="w-7.5 h-7.5 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-neutral-800 hover:text-white disabled:opacity-25 disabled:hover:bg-transparent transition-all cursor-pointer">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <!-- SEPARADOR -->
            <div class="h-5 sm:h-6 w-px mx-0.5 shrink-0" [ngClass]="theme === 'dark' ? 'bg-neutral-800' : 'bg-neutral-200'"></div>

            <!-- DUPLICAR -->
            <button type="button"
                    (click)="triggerAction('duplicate', null, $event)"
                    title="Duplicar bloque"
                    class="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 hover:scale-105 active:scale-95"
                    [ngClass]="theme === 'dark' ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-neutral-600 hover:text-black hover:bg-neutral-100'">
              <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <rect x="8" y="8" width="12" height="12" rx="2.5" stroke-linecap="round" stroke-linejoin="round" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 8V5.5A2.5 2.5 0 0013.5 3h-8A2.5 2.5 0 003 5.5v8A2.5 2.5 0 005.5 16H8" />
              </svg>
            </button>

            <!-- ELIMINAR -->
            <button type="button"
                    (click)="triggerAction('delete', null, $event)"
                    title="Eliminar bloque"
                    class="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 hover:scale-105 active:scale-95"
                    [ngClass]="theme === 'dark' ? 'text-neutral-400 hover:text-rose-400 hover:bg-rose-500/20' : 'text-neutral-500 hover:text-rose-600 hover:bg-rose-50'">
              <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

          </div>
        </ng-container>

        <!-- Theme Toggle Button -->
        <button (click)="themeChange.emit()"
                class="w-10 h-10 sm:w-10.5 sm:h-10.5 rounded-2xl flex items-center justify-center border transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shrink-0"
                [ngClass]="theme === 'dark'
                  ? 'bg-white/5 border-white/10 hover:border-white/20'
                  : 'bg-black/5 border-black/10 hover:border-black/20'"
                title="Cambiar tema">
          <!-- Moon Icon (Light Mode) -->
          <svg *ngIf="theme === 'light'" class="w-4.5 h-4.5 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
          <!-- Sun Icon (Dark Mode) -->
          <svg *ngIf="theme === 'dark'" class="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
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
  styles: [`
    @keyframes voiceBar {
      0%, 100% { height: 4px; }
      50% { height: 14px; }
    }
    .animate-voice-bar {
      animation: voiceBar 0.45s ease-in-out infinite alternate;
    }
  `]
})
export class DashAiSearchComponent {
  public libraryService = inject(LibraryService);

  tabs$ = this.libraryService.tabs$;
  activeTabId$ = this.libraryService.activeTabId$;
  selectedNotebook$ = this.libraryService.selectedNotebook$;
  selectedFolder$ = this.libraryService.selectedFolder$;
  searchQuery$ = this.libraryService.searchQuery$;
  activeBlockMeta$ = this.libraryService.activeBlockMeta$;

  isTypeDropdownOpen = false;

  @Input() theme = 'light';
  @Input() activeTab = 'dashboard';
  @Input() isNotesView: boolean = false;
  @Input() rotbotMode: RotbotMode = 'charla';
  @Output() rotbotModeChange = new EventEmitter<RotbotMode>();
  @Input() rotbotMuted: boolean = false;
  @Output() rotbotMutedChange = new EventEmitter<boolean>();

  @Output() tabChange = new EventEmitter<string>();
  @Output() themeChange = new EventEmitter<void>();
  @Output() toggleSidebar = new EventEmitter<void>();

  @HostListener('document:click')
  onDocumentClick() {
    this.isTypeDropdownOpen = false;
  }

  toggleTypeDropdown(event: Event) {
    event.stopPropagation();
    this.isTypeDropdownOpen = !this.isTypeDropdownOpen;
  }

  changeType(type: any, event: Event) {
    event.stopPropagation();
    this.isTypeDropdownOpen = false;
    this.libraryService.triggerBlockAction('changeType', type);
  }

  triggerAction(action: string, payload?: any, event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.libraryService.triggerBlockAction(action, payload);
  }

  getBlockTypeLabel(type: string): string {
    switch (type) {
      case 'titulo': return 'H1 TÍTULO';
      case 'subtitulo': return 'H2 SUBTÍTULO';
      case 'codigo': return 'CÓDIGO';
      case 'alerta': return 'ALERTA';
      case 'texto': return 'TEXTO NORMAL';
      case 'columnas': return '2 COLUMNAS';
      case 'imagen': return 'IMAGEN';
      default: return 'BLOQUE';
    }
  }

  getBlockTypeBadgeClass(type: string): string {
    if (this.theme === 'dark') {
      switch (type) {
        case 'titulo': return 'bg-blue-500/15 border-blue-500/40 text-blue-300';
        case 'subtitulo': return 'bg-sky-500/15 border-sky-500/40 text-sky-300';
        case 'codigo': return 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300';
        case 'alerta': return 'bg-amber-500/15 border-amber-500/40 text-amber-300';
        case 'columnas': return 'bg-purple-500/15 border-purple-500/40 text-purple-300';
        case 'imagen': return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300';
        default: return 'bg-neutral-800 border-neutral-700 text-neutral-200';
      }
    } else {
      switch (type) {
        case 'titulo': return 'bg-blue-50 border-blue-200 text-blue-700';
        case 'subtitulo': return 'bg-sky-50 border-sky-200 text-sky-700';
        case 'codigo': return 'bg-indigo-50 border-indigo-200 text-indigo-700';
        case 'alerta': return 'bg-amber-50 border-amber-200 text-amber-700';
        case 'columnas': return 'bg-purple-50 border-purple-200 text-purple-700';
        case 'imagen': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
        default: return 'bg-neutral-100 border-neutral-200 text-neutral-800';
      }
    }
  }

  get currentLabel() {
    return TAB_LABELS[this.activeTab] || 'Panel';
  }

  get isMobileScreen(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  }
}
