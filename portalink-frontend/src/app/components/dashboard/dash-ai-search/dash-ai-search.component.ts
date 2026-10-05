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
          <div class="relative flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border backdrop-blur-2xl shadow-sm text-xs font-headline font-bold transition-all max-w-[calc(100vw-120px)] sm:max-w-none overflow-x-auto scrollbar-none select-none shrink-0"
               [ngClass]="theme === 'dark' ? 'bg-[#121215]/95 border-neutral-800 text-neutral-200 shadow-black/40' : 'bg-white/95 border-neutral-200 text-neutral-800 shadow-neutral-200/50'">
            
            <!-- BADGE DEL TIPO + ICONO -->
            <div class="flex items-center gap-1.5 font-mono uppercase tracking-wider text-[11px] font-extrabold pr-2 border-r"
                 [ngClass]="theme === 'dark' ? 'text-neutral-400 border-neutral-800' : 'text-neutral-600 border-neutral-200'">
              <span *ngIf="currentBlock.type === 'columnas'" class="text-sm">◫</span>
              <svg *ngIf="currentBlock.type === 'titulo'" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m0-15l-6 6m6-6l6 6M4.5 19.5h15" /></svg>
              <svg *ngIf="currentBlock.type === 'subtitulo'" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h12m-12 5.25h9" /></svg>
              <svg *ngIf="currentBlock.type === 'texto'" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
              <svg *ngIf="currentBlock.type === 'codigo'" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>
              <svg *ngIf="currentBlock.type === 'alerta'" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.438a3.75 3.75 0 01-7.5 0m7.5 0v1.875a1.875 1.875 0 01-1.875 1.875h-3.75A1.875 1.875 0 018.25 21.75V19.875m3.75-14.625a6.002 6.002 0 00-5.467 3.527C6.082 9.879 6 10.932 6 12c0 2.257.94 4.3 2.457 5.74m7.086 0A8.966 8.966 0 0018 12c0-1.068-.082-2.121-.533-3.223a6.002 6.002 0 00-5.467-3.527z" /></svg>
              <svg *ngIf="currentBlock.type === 'imagen'" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
              <span class="truncate max-w-[70px] sm:max-w-none">{{ getBlockTypeLabel(currentBlock.type) }}</span>
            </div>

            <!-- BOTÓN CAMBIAR TIPO CON MENÚ DESPLEGABLE -->
            <div class="relative">
              <button type="button"
                      (click)="toggleTypeDropdown($event)"
                      title="Cambiar tipo de bloque"
                      class="flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      [ngClass]="theme === 'dark' ? 'text-neutral-300 hover:text-white hover:bg-neutral-800' : 'text-neutral-700 hover:text-black hover:bg-neutral-100'">
                <span>Cambiar</span>
                <svg class="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              <!-- MENÚ FLOTANTE CAMBIAR TIPO -->
              <div *ngIf="isTypeDropdownOpen"
                   (click)="$event.stopPropagation()"
                   class="absolute left-0 sm:right-0 top-full mt-2 w-44 z-50 rounded-2xl border shadow-2xl p-1.5 backdrop-blur-2xl animate-fade-in font-sans font-medium"
                   [ngClass]="theme === 'dark' ? 'bg-[#18181b] border-neutral-700 text-white shadow-black/80' : 'bg-white border-neutral-200 text-neutral-900 shadow-xl'">
                <div class="space-y-0.5 text-xs">
                  <button type="button" (click)="changeType('titulo', $event)"
                          class="w-full px-2.5 py-1.5 rounded-xl text-left font-bold flex items-center justify-between hover:bg-neutral-800/80 cursor-pointer"
                          [ngClass]="currentBlock.type === 'titulo' ? (theme === 'dark' ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-black') : ''">
                    <span>H1 Título</span>
                    <kbd class="text-[9px] font-mono opacity-60">T</kbd>
                  </button>
                  <button type="button" (click)="changeType('subtitulo', $event)"
                          class="w-full px-2.5 py-1.5 rounded-xl text-left font-bold flex items-center justify-between hover:bg-neutral-800/80 cursor-pointer"
                          [ngClass]="currentBlock.type === 'subtitulo' ? (theme === 'dark' ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-black') : ''">
                    <span>H2 Subtítulo</span>
                    <kbd class="text-[9px] font-mono opacity-60">S</kbd>
                  </button>
                  <button type="button" (click)="changeType('texto', $event)"
                          class="w-full px-2.5 py-1.5 rounded-xl text-left font-bold flex items-center justify-between hover:bg-neutral-800/80 cursor-pointer"
                          [ngClass]="currentBlock.type === 'texto' ? (theme === 'dark' ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-black') : ''">
                    <span>≡ Texto Normal</span>
                    <kbd class="text-[9px] font-mono opacity-60">N</kbd>
                  </button>
                  <button type="button" (click)="changeType('codigo', $event)"
                          class="w-full px-2.5 py-1.5 rounded-xl text-left font-bold flex items-center justify-between hover:bg-neutral-800/80 cursor-pointer"
                          [ngClass]="currentBlock.type === 'codigo' ? (theme === 'dark' ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-black') : ''">
                    <span>&lt;/&gt; Código</span>
                    <kbd class="text-[9px] font-mono opacity-60">C</kbd>
                  </button>
                  <button type="button" (click)="changeType('alerta', $event)"
                          class="w-full px-2.5 py-1.5 rounded-xl text-left font-bold flex items-center justify-between hover:bg-neutral-800/80 cursor-pointer"
                          [ngClass]="currentBlock.type === 'alerta' ? (theme === 'dark' ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-black') : ''">
                    <span>⚠ Alerta</span>
                    <kbd class="text-[9px] font-mono opacity-60">A</kbd>
                  </button>
                  <button type="button" (click)="changeType('columnas', $event)"
                          class="w-full px-2.5 py-1.5 rounded-xl text-left font-bold flex items-center justify-between hover:bg-neutral-800/80 cursor-pointer"
                          [ngClass]="currentBlock.type === 'columnas' ? (theme === 'dark' ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-black') : ''">
                    <span>◫ 2 Columnas</span>
                    <kbd class="text-[9px] font-mono opacity-60">2</kbd>
                  </button>
                  <button type="button" (click)="changeType('imagen', $event)"
                          class="w-full px-2.5 py-1.5 rounded-xl text-left font-bold flex items-center justify-between hover:bg-neutral-800/80 cursor-pointer"
                          [ngClass]="currentBlock.type === 'imagen' ? (theme === 'dark' ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-black') : ''">
                    <span>🖼 Imagen</span>
                    <kbd class="text-[9px] font-mono opacity-60">I</kbd>
                  </button>
                </div>
              </div>
            </div>

            <span class="opacity-25 text-xs shrink-0">|</span>

            <!-- BOTÓN IA -->
            <button type="button"
                    (click)="triggerAction('ai', null, $event)"
                    title="Asistente RotBot IA para este bloque"
                    class="px-2 py-0.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border shrink-0 hover:scale-105 active:scale-95"
                    [ngClass]="theme === 'dark' ? 'border-neutral-700 bg-neutral-800/90 text-white hover:bg-neutral-700' : 'border-neutral-300 bg-neutral-100 text-neutral-900 hover:bg-neutral-200'">
              <span class="text-xs">✨</span>
              <span>IA</span>
            </button>

            <span class="opacity-25 text-xs shrink-0">|</span>

            <!-- B (Negrilla) -->
            <button type="button"
                    (click)="triggerAction('bold', null, $event)"
                    title="Negrilla (Ctrl + B)"
                    class="w-6 h-6 rounded-md flex items-center justify-center transition-all cursor-pointer shrink-0 font-serif font-black text-xs"
                    [ngClass]="theme === 'dark' ? 'text-neutral-300 hover:text-white hover:bg-neutral-800' : 'text-neutral-700 hover:text-black hover:bg-neutral-100'">
              B
            </button>

            <!-- I (Cursiva) -->
            <button type="button"
                    (click)="triggerAction('italic', null, $event)"
                    title="Cursiva (Ctrl + I)"
                    class="w-6 h-6 rounded-md flex items-center justify-center transition-all cursor-pointer shrink-0 font-serif italic font-bold text-xs"
                    [ngClass]="theme === 'dark' ? 'text-neutral-300 hover:text-white hover:bg-neutral-800' : 'text-neutral-700 hover:text-black hover:bg-neutral-100'">
              I
            </button>

            <!-- ROJO -->
            <button type="button"
                    (click)="triggerAction('red', null, $event)"
                    title="Colorear en rojo (Ctrl + Shift + D)"
                    class="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-bold transition-all cursor-pointer shrink-0"
                    [ngClass]="(libraryService.isRedTextActive$ | async) ? 'bg-red-500/25 text-red-300 ring-1 ring-red-500' : 'hover:bg-red-500/15 text-red-400'">
              <span class="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
              <span class="hidden sm:inline">Rojo</span>
            </button>

            <span class="opacity-25 text-xs shrink-0">|</span>

            <!-- LEER CON ROTBOT -->
            <button type="button"
                    (click)="triggerAction('read', null, $event)"
                    [title]="(libraryService.isReadingBlock$ | async) ? 'Detener lectura' : 'Leer en voz alta con RotBot'"
                    class="px-2 py-0.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border shrink-0 hover:scale-105 active:scale-95"
                    [ngClass]="(libraryService.isReadingBlock$ | async) 
                      ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400 animate-pulse'
                      : (theme === 'dark' ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20' : 'border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100')">
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.757 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
              <span>{{ (libraryService.isReadingBlock$ | async) ? 'Parar' : 'Leer' }}</span>
            </button>

            <span class="opacity-25 text-xs shrink-0">|</span>

            <!-- + TEXTO DEBAJO -->
            <button type="button"
                    (click)="triggerAction('addBelow', null, $event)"
                    title="Añadir texto debajo"
                    class="px-2 py-0.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border shrink-0 hover:scale-105 active:scale-95"
                    [ngClass]="theme === 'dark' ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25' : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'">
              <span class="text-xs">+</span>
              <span class="hidden sm:inline">Texto debajo</span>
              <span class="sm:hidden">Texto</span>
            </button>

            <span class="opacity-25 text-xs shrink-0">|</span>

            <!-- SUBIR / BAJAR -->
            <div class="flex items-center gap-0.5 shrink-0">
              <button type="button"
                      (click)="triggerAction('moveUp', null, $event)"
                      [disabled]="(libraryService.activeBlockIndex$ | async)! <= 0"
                      title="Mover bloque arriba"
                      class="p-1 rounded hover:bg-neutral-800 disabled:opacity-30 cursor-pointer">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg>
              </button>
              <button type="button"
                      (click)="triggerAction('moveDown', null, $event)"
                      [disabled]="(libraryService.activeBlockIndex$ | async)! >= ((libraryService.totalBlocksCount$ | async)! - 1)"
                      title="Mover bloque abajo"
                      class="p-1 rounded hover:bg-neutral-800 disabled:opacity-30 cursor-pointer">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            </div>

            <span class="opacity-25 text-xs shrink-0">|</span>

            <!-- DUPLICAR -->
            <button type="button"
                    (click)="triggerAction('duplicate', null, $event)"
                    title="Duplicar bloque"
                    class="p-1 rounded hover:bg-neutral-800 cursor-pointer shrink-0">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v9.25c0 .621-.504 1.125-1.125 1.125z" />
              </svg>
            </button>

            <!-- ELIMINAR -->
            <button type="button"
                    (click)="triggerAction('delete', null, $event)"
                    title="Eliminar bloque"
                    class="p-1 rounded hover:bg-red-500/20 text-neutral-400 hover:text-red-400 cursor-pointer shrink-0">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>

          </div>
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

  `,
  styles: []
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

  get currentLabel() {
    return TAB_LABELS[this.activeTab] || 'Panel';
  }

  get isMobileScreen(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  }
}
