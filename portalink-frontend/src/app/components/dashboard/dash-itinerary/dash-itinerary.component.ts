import { Component, Input, HostListener, OnInit, OnDestroy, ViewChild, ElementRef, inject, ChangeDetectorRef, ChangeDetectionStrategy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItineraryService, Task as ApiTask } from '../../../services/itinerary.service';
import { TeleportToBodyDirective } from '../../../shared/directives/teleport-to-body.directive';

export interface Task {
  id: number;
  title: string;
  description?: string;
  type: 'work' | 'personal' | 'urgent';
  time?: string;   // HH:MM (mapped from task_time)
  date: string;    // YYYY-MM-DD (mapped from task_date)
  completed: boolean;
  reminder_email?: string;
}

interface DayPlan {
  dayName: string;
  dateStr: string;  // e.g. "29 Jun"
  dateKey: string;  // YYYY-MM-DD
  isToday: boolean;
  tasks: Task[];
  completedCount: number;
}

interface CalendarDay {
  date: number | null;
  dateKey: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasTask: boolean;
  inWeekView: boolean;
}

type FilterType = 'all' | 'work' | 'personal' | 'urgent' | 'pending' | 'completed';

@Component({
  selector: 'app-dash-itinerary',
  standalone: true,
  imports: [CommonModule, FormsModule, TeleportToBodyDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
  template: `
    <div class="library-page dash-itinerary-root w-full max-w-full min-w-0 space-y-4 sm:space-y-6 tab-enter font-sans"
         (click)="onRootClick($event)">

      <!-- ══════════════════════════════════════════════════════════════
           1. BARRA DOCK SUPERIOR DE FILTROS (ESTILO PESTAÑAS BIBLIOTECA)
      ══════════════════════════════════════════════════════════════ -->
      <div class="library-tabs rounded-2xl border p-1.5 flex items-center justify-between gap-2.5 select-none transition-all shadow-lg backdrop-blur-xl"
           [ngClass]="isDark ? 'bg-[#121215] border-[#222226]' : 'bg-neutral-100/80 border-neutral-200/90'">

        <!-- Contenedor desplazable de pestañas de filtro -->
        <div class="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none flex-1 min-w-0">

          <div class="pl-1.5 pr-1 hidden sm:flex items-center text-neutral-500 shrink-0"
               title="Filtros de visualización de agenda">
            <svg class="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>

          <!-- PESTAÑAS DE FILTRO (IDÉNTICAS A DASH LIBRARY TABS) -->
          <button *ngFor="let f of filters; trackBy: trackByFilter"
                  type="button"
                  (click)="activeFilter = f.key"
                  class="group/tab relative flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-headline font-semibold transition-all duration-150 cursor-pointer shrink-0"
                  [ngClass]="activeFilter === f.key
                    ? (isDark ? 'bg-[#18181c] border-[#2e2e36] text-white shadow-md shadow-black/40 ring-1 ring-white/10' : 'bg-white border-neutral-300 text-neutral-950 shadow-sm ring-1 ring-neutral-900/10')
                    : (isDark ? 'bg-transparent border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.05] hover:border-[#222226]' : 'bg-transparent border-transparent text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60 hover:border-neutral-300')">

            <!-- Indicador activo con glow y color de la categoría -->
            <span class="w-2 h-2 rounded-full shrink-0 transition-all"
                  [style.backgroundColor]="f.color"
                  [style.boxShadow]="activeFilter === f.key ? '0 0 8px ' + f.color : 'none'"
                  [class.animate-pulse]="activeFilter === f.key"></span>

            <!-- Título del filtro -->
            <span class="truncate min-w-0 tracking-tight">{{ f.label }}</span>

            <!-- Contador numérico discreto -->
            <span class="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md transition-colors"
                  [ngClass]="activeFilter === f.key
                    ? (isDark ? 'bg-white/10 text-white' : 'bg-neutral-900 text-white force-white')
                    : (isDark ? 'bg-neutral-800/80 text-neutral-400' : 'bg-neutral-200/80 text-neutral-600')">
              {{ getFilterCount(f.key) }}
            </span>
          </button>
        </div>

        <!-- Controles laterales derechos del Dock: Progreso Semanal -->
        <div class="flex items-center gap-2 shrink-0 pl-2 border-l"
             [ngClass]="isDark ? 'border-neutral-800/80' : 'border-neutral-200/80'">

          <!-- Barra de progreso compacta -->
          <div class="hidden md:flex items-center gap-2">
            <div class="w-20 h-1.5 rounded-full overflow-hidden"
                 [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'">
              <div class="h-full rounded-full transition-all duration-500"
                   [ngClass]="isDark ? 'bg-white' : 'bg-neutral-950'"
                   [style.width]="progressPercent + '%'"></div>
            </div>
            <span class="text-[10px] font-mono font-bold"
                  [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">
              {{ progressPercent }}%
            </span>
          </div>

          <!-- Badge de tareas en la semana -->
          <span class="text-[10px] font-headline font-bold px-2 py-0.5 rounded-lg tracking-wider"
                [ngClass]="isDark ? 'bg-neutral-900/80 text-neutral-400 border border-neutral-800' : 'bg-neutral-200/80 text-neutral-600 border border-neutral-300'">
            {{ totalTasks }} {{ totalTasks === 1 ? 'tarea' : 'tareas' }}
          </span>
        </div>

      </div>

      <!-- ══════════════════════════════════════════════════════════════
           2. HEADER MINIMALISTA: TÍTULO GRANDE Y CONTROLES ORGANIZADOS
              (MISMO DISEÑO EDITORIAL DE DASH LIBRARY)
      ══════════════════════════════════════════════════════════════ -->
      <div class="pt-2 pb-4 border-b flex flex-col lg:flex-row lg:items-end justify-between gap-5 transition-colors"
           [ngClass]="isDark ? 'border-neutral-800/80' : 'border-neutral-200/80'">

        <div class="space-y-2 min-w-0">
          <!-- BREADCRUMB PATH TRAIL MINIMALISTA -->
          <div class="flex items-center gap-2 text-xs font-sans flex-wrap"
               [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
            <button type="button"
                    (click)="goToToday()"
                    class="cursor-pointer inline-flex items-center gap-1.5 transition-colors font-medium"
                    [ngClass]="isDark ? 'hover:text-white' : 'hover:text-neutral-950'">
              <svg class="w-3.5 h-3.5 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <span>Planificación</span>
            </button>

            <span class="opacity-40">/</span>

            <span class="inline-flex items-center gap-1.5 font-semibold"
                  [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">
              <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              <span>{{ weekRangeLabel }}</span>
            </span>

            <span class="opacity-40 hidden sm:inline">•</span>

            <span class="hidden sm:inline-flex items-center gap-1.5 font-mono text-[11px]"
                  [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
              <span>{{ currentDateStr }}</span>
              <span class="opacity-50">—</span>
              <span [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">{{ currentTime }}</span>
            </span>
          </div>

          <!-- TÍTULO PRINCIPAL GRANDE Y MINIMALISTA (IDÉNTICO A BIBLIOTECA & CUADERNOS) -->
          <h2 class="text-3xl sm:text-4xl lg:text-[42px] font-headline font-extrabold tracking-tight leading-[1.06] m-0 truncate"
              [ngClass]="isDark ? 'text-white' : 'text-neutral-950'">
            Calendario & Agenda
          </h2>
        </div>

        <!-- CONTROLES Y ACCIONES ORGANIZADOS (BUSCADOR + IR A FECHA + NUEVA TAREA) -->
        <div class="flex items-center gap-2.5 sm:gap-3 flex-wrap sm:flex-nowrap shrink-0">

          <!-- BUSCADOR MINIMALISTA (ESTILO DASH LIBRARY) -->
          <div class="relative flex-1 sm:flex-initial min-w-[200px] sm:min-w-[250px]">
            <input type="text"
                   [(ngModel)]="searchQuery"
                   spellcheck="false"
                   autocorrect="off"
                   autocapitalize="off"
                   placeholder="Buscar tarea o nota..."
                   class="w-full pl-9 pr-8 py-2.5 text-xs rounded-full border transition-all duration-200 focus:outline-none"
                   [ngClass]="isDark
                     ? 'bg-[#121215] border-[#222226] text-white placeholder:text-neutral-500 focus:border-neutral-600'
                     : 'bg-white border-neutral-200/90 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 shadow-2xs'" />
            <svg class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                 [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>

            <button *ngIf="searchQuery"
                    type="button"
                    (click)="searchQuery = ''"
                    title="Limpiar búsqueda"
                    class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full opacity-60 hover:opacity-100 cursor-pointer text-xs transition-opacity"
                    [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-600'">
              ✕
            </button>
          </div>

          <!-- SELECTOR DE FECHA (CALENDAR PICKER MINIMALISTA) -->
          <div class="relative">
            <button type="button"
                    (click)="toggleCalendar($event)"
                    class="px-4 py-2.5 rounded-full border text-xs font-headline font-semibold tracking-wide transition-all duration-200 cursor-pointer inline-flex items-center gap-2 shrink-0 active:scale-95 select-none"
                    [ngClass]="showCalendar
                      ? (isDark ? 'bg-[#18181c] border-neutral-600 text-white' : 'bg-neutral-900 border-neutral-900 text-white force-white')
                      : (isDark ? 'bg-[#121215] border-[#222226] text-neutral-300 hover:text-white hover:border-neutral-600' : 'bg-white border-neutral-200/90 text-neutral-700 hover:text-black hover:border-neutral-400 shadow-2xs')">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <span>Ir a fecha</span>
              <svg class="w-3 h-3 transition-transform duration-200 opacity-60"
                   [class.rotate-180]="showCalendar"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            <!-- Dropdown de Calendario Mensual -->
            <div *ngIf="showCalendar"
                 class="calendar-dropdown absolute right-0 top-12 z-[200] w-80 rounded-[24px] border shadow-2xl overflow-hidden backdrop-blur-xl"
                 [ngClass]="isDark ? 'bg-[#121215] border-[#222226]' : 'bg-white border-neutral-200/95'"
                 (click)="$event.stopPropagation()">

              <!-- Header del Calendario -->
              <div class="flex items-center justify-between px-5 py-3.5 border-b"
                   [ngClass]="isDark ? 'border-neutral-800/80' : 'border-neutral-100'">
                <button type="button" (click)="prevCalMonth()" class="p-1.5 rounded-lg transition-colors cursor-pointer"
                        [ngClass]="isDark ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white' : 'hover:bg-neutral-100 text-neutral-500 hover:text-black'">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
                </button>
                <span class="text-xs font-headline font-bold uppercase tracking-wider"
                      [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                  {{ calMonthName }} {{ calYear }}
                </span>
                <button type="button" (click)="nextCalMonth()" class="p-1.5 rounded-lg transition-colors cursor-pointer"
                        [ngClass]="isDark ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white' : 'hover:bg-neutral-100 text-neutral-500 hover:text-black'">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>

              <!-- Días de la semana -->
              <div class="grid grid-cols-7 px-3 pt-3 pb-1">
                <div *ngFor="let d of ['L','M','X','J','V','S','D']"
                     class="text-center text-[10px] font-headline font-bold uppercase tracking-widest py-1"
                     [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">{{ d }}</div>
              </div>

              <!-- Cuadrícula de días -->
              <div class="grid grid-cols-7 gap-0.5 px-3 pb-3">
                <button *ngFor="let day of calendarDays; trackBy: trackByCalendarDay"
                        type="button"
                        (click)="day.dateKey && jumpToDate(day.dateKey)"
                        [disabled]="!day.dateKey"
                        class="relative aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-semibold transition-all"
                        [ngClass]="[
                          !day.dateKey ? 'opacity-0 cursor-default' : 'cursor-pointer',
                          day.inWeekView && day.dateKey ? (isDark ? 'bg-white/15 text-white font-bold' : 'bg-neutral-200/80 text-neutral-950 font-bold') : '',
                          day.isToday && day.dateKey ? (isDark ? 'ring-1 ring-red-500 font-extrabold text-white' : 'ring-1 ring-red-500 font-extrabold text-neutral-950') : '',
                          !day.inWeekView && !day.isToday && day.dateKey ? (isDark ? 'text-neutral-300 hover:bg-neutral-800' : 'text-neutral-600 hover:bg-neutral-100') : ''
                        ]">
                  <span>{{ day.date }}</span>
                  <div *ngIf="day.hasTask && day.dateKey"
                       class="absolute bottom-1 w-1 h-1 rounded-full bg-red-500"></div>
                </button>
              </div>

              <!-- Accesos rápidos -->
              <div class="flex gap-2 px-4 pb-4">
                <button type="button" (click)="goToToday()"
                        class="flex-1 py-2 rounded-xl text-[10px] font-headline font-bold uppercase tracking-widest border transition-colors cursor-pointer"
                        [ngClass]="isDark ? 'border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-black'">
                  Hoy
                </button>
                <button type="button" (click)="changeWeek(1); showCalendar=false"
                        class="flex-1 py-2 rounded-xl text-[10px] font-headline font-bold uppercase tracking-widest border transition-colors cursor-pointer"
                        [ngClass]="isDark ? 'border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-black'">
                  Próx. semana
                </button>
              </div>
            </div>
          </div>

          <!-- BOTÓN NUEVA TAREA (IDÉNTICO AL BOTÓN NUEVA CARPETA DE DASH LIBRARY) -->
          <button type="button"
                  (click)="openModal()"
                  class="px-5 py-2.5 rounded-full text-xs font-headline font-bold tracking-wide transition-all duration-200 cursor-pointer inline-flex items-center gap-2 shrink-0 active:scale-95"
                  [ngClass]="isDark
                    ? 'bg-white text-black hover:bg-neutral-200 shadow-sm'
                    : 'bg-[#09090b] text-white hover:bg-neutral-800 shadow-sm force-white'">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Nueva Tarea</span>
          </button>

        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════
           3. BARRA DE SUB-CONTROLES Y NAVEGACIÓN (ESTILO LIBRARY SECTION HEADING)
      ══════════════════════════════════════════════════════════════ -->
      <div class="library-section-heading flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">

        <!-- Izquierda: Tarea activa / Resumen de estado + Selector de semana -->
        <div class="flex items-center gap-2.5 flex-wrap min-w-0">

          <!-- Selector compacto de semana (Anterior / Rango / Siguiente) -->
          <div class="inline-flex items-center gap-1 p-1 rounded-full border"
               [ngClass]="isDark ? 'bg-[#121215] border-[#222226]' : 'bg-white border-neutral-200/90 shadow-2xs'">
            <button type="button"
                    (click)="changeWeek(-1)"
                    title="Semana anterior"
                    class="w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                    [ngClass]="isDark ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white' : 'hover:bg-neutral-100 text-neutral-600 hover:text-black'">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.25">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            <span class="px-2.5 text-xs font-headline font-bold tracking-tight"
                  [ngClass]="isDark ? 'text-white' : 'text-neutral-950'">
              {{ weekRangeLabel }}
            </span>

            <button type="button"
                    (click)="changeWeek(1)"
                    [disabled]="weekOffset >= maxWeekOffset"
                    title="Semana siguiente"
                    class="w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                    [ngClass]="isDark ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white' : 'hover:bg-neutral-100 text-neutral-600 hover:text-black'">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.25">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>

          <!-- Botón volver a Hoy cuando se navega a otra semana -->
          <button *ngIf="weekOffset !== 0"
                  type="button"
                  (click)="goToToday()"
                  class="px-3 py-1.5 rounded-full text-[11px] font-headline font-bold tracking-wide border transition-all cursor-pointer inline-flex items-center gap-1.5"
                  [ngClass]="isDark ? 'bg-[#18181c] border-neutral-700 text-white hover:bg-neutral-800' : 'bg-neutral-900 border-neutral-900 text-white force-white'">
            <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            <span>Volver a Hoy</span>
          </button>

          <!-- Estado en vivo: Tarea programada para ahora -->
          <div *ngIf="currentTask"
               class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border"
               [ngClass]="isDark ? 'bg-[#121215] border-[#222226] text-neutral-200' : 'bg-white border-neutral-200/90 text-neutral-800 shadow-2xs'">
            <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span class="text-[10px] font-headline font-bold uppercase tracking-wider opacity-60">Próxima:</span>
            <span class="text-xs font-headline font-bold truncate max-w-[190px]"
                  [ngClass]="isDark ? 'text-white' : 'text-neutral-950'">{{ currentTask.title }}</span>
            <span class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border"
                  [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-300' : 'bg-neutral-100 border-neutral-200 text-neutral-700'">
              {{ currentTask.time }}
            </span>
          </div>
        </div>

        <!-- Derecha: Métricas Rápidas + Botones Redondos de Desplazamiento del Carrusel (Idénticos a Dash Library) -->
        <div class="flex items-center gap-2.5 self-end sm:self-auto shrink-0">

          <!-- Resumen de completadas / pendientes -->
          <div class="hidden sm:flex items-center gap-3 px-3.5 py-1.5 rounded-full border text-[11px]"
               [ngClass]="isDark ? 'bg-[#121215] border-[#222226] text-neutral-400' : 'bg-white border-neutral-200/90 text-neutral-600 shadow-2xs'">
            <span class="inline-flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Completadas:</span>
              <strong class="font-headline font-extrabold" [ngClass]="isDark ? 'text-white' : 'text-neutral-950'">{{ completedTasks }}</strong>
            </span>
            <span class="opacity-30">|</span>
            <span class="inline-flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>Pendientes:</span>
              <strong class="font-headline font-extrabold" [ngClass]="isDark ? 'text-white' : 'text-neutral-950'">{{ pendingTasks }}</strong>
            </span>
          </div>

          <!-- Flechas de desplazamiento horizontal del carrusel de días (Idénticas a Dash Library) -->
          <div class="flex items-center gap-1.5">
            <button type="button"
                    (click)="scrollDaysCarousel('left')"
                    title="Desplazar días a la izquierda"
                    class="w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-90"
                    [ngClass]="isDark
                      ? 'bg-[#121215] border-[#222226] text-neutral-400 hover:text-white hover:border-neutral-600'
                      : 'bg-white border-neutral-200/90 text-neutral-600 hover:text-black hover:border-neutral-400 shadow-2xs'">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.25">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button type="button"
                    (click)="scrollDaysCarousel('right')"
                    title="Desplazar días a la derecha"
                    class="w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-90"
                    [ngClass]="isDark
                      ? 'bg-[#121215] border-[#222226] text-neutral-400 hover:text-white hover:border-neutral-600'
                      : 'bg-white border-neutral-200/90 text-neutral-600 hover:text-black hover:border-neutral-400 shadow-2xs'">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.25">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>

        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════
           4. SKELETON LOADER CARRUSEL SEMANAL (MISMO ESTILO QUE DASH LIBRARY)
      ══════════════════════════════════════════════════════════════ -->
      <div *ngIf="isLoading && allTasks.length === 0"
           class="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 my-1 no-scrollbar">
        <div *ngFor="let _ of [1,2,3,4,5,6,7]"
             class="w-[285px] sm:w-[305px] lg:w-[320px] h-[490px] shrink-0 rounded-[28px] border p-6 flex flex-col justify-between"
             [ngClass]="isDark ? 'bg-[#121215] border-[#222226]' : 'bg-white border-neutral-200/90'">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="w-10 h-10 rounded-2xl skeleton-shimmer"></div>
              <div class="w-8 h-5 rounded-full skeleton-shimmer"></div>
            </div>
            <div class="h-6 w-32 rounded-xl skeleton-shimmer mt-2"></div>
            <div class="h-3.5 w-24 rounded-lg skeleton-shimmer"></div>
          </div>
          <div class="space-y-3 my-4">
            <div *ngFor="let _ of [1,2]" class="h-24 w-full rounded-2xl skeleton-shimmer"></div>
          </div>
          <div class="h-8 w-full rounded-xl skeleton-shimmer"></div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════
           5. CARRUSEL SEMANAL DE TARJETAS ALTAS (DISEÑO EDITORIAL DASH LIBRARY)
      ══════════════════════════════════════════════════════════════ -->
      <div *ngIf="!isLoading || allTasks.length > 0" class="relative">
        <div #daysCarousel
             class="library-carousel-track flex items-stretch gap-5 overflow-x-auto overflow-y-hidden snap-x snap-mandatory pt-2 pb-5 px-0.5">

          <!-- TARJETA ALTA DE DÍA (ESTÉTICA LIBRARY FOLDER CARD) -->
          <div *ngFor="let day of weekPlan; let i = index; trackBy: trackByDay"
               class="library-folder-card group relative w-[290px] sm:w-[310px] lg:w-[325px] min-h-[470px] shrink-0 snap-start rounded-[28px] border flex flex-col justify-between overflow-hidden select-none"
               [ngClass]="[
                 isDark
                   ? (day.isToday
                       ? 'bg-[#121215] border-neutral-600 hover:border-neutral-500 shadow-[0_12px_36px_rgba(0,0,0,0.6)] ring-1 ring-white/10'
                       : 'bg-[#121215] border-[#222226] hover:border-neutral-600 shadow-[0_10px_30px_rgba(0,0,0,0.45)] hover:shadow-[0_22px_48px_rgba(0,0,0,0.7)]')
                   : (day.isToday
                       ? 'bg-white border-neutral-900 shadow-[0_12px_32px_-6px_rgba(0,0,0,0.12)] ring-1 ring-neutral-900/10'
                       : 'bg-white border-neutral-300 hover:border-neutral-900/50 shadow-[0_6px_22px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_22px_44px_-12px_rgba(0,0,0,0.12)]')
               ]">

            <!-- ACENTO SUPERIOR SUTIL (ROJO EN HOY, Y EN LOS DEMÁS APARECE AL PASAR EL CURSOR) -->
            <div class="absolute top-0 inset-x-0 h-[3px] transition-opacity duration-300"
                 [ngClass]="day.isToday
                   ? 'bg-red-500 opacity-100'
                   : (isDark ? 'bg-white opacity-0 group-hover:opacity-60' : 'bg-neutral-950 opacity-0 group-hover:opacity-80')"></div>

            <!-- RESPLANDOR AMBIENTAL MINIMALISTA EN CABECERA -->
            <div class="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 opacity-10 group-hover:opacity-20"
                 [style.backgroundColor]="day.isToday ? '#dc2626' : '#737373'"></div>

            <!-- ─── CABECERA EDITORIAL DEL DÍA (ICONO + TÍTULO GRANDE + FECHA) ─── -->
            <div class="relative z-10 p-6 pb-4 border-b"
                 [ngClass]="isDark ? 'border-neutral-800/80' : 'border-neutral-200/80'">

              <!-- Top Row: Icono de Calendario + Badge HOY / Índice Numérico -->
              <div class="flex items-start justify-between gap-3 mb-4">
                <div class="w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105"
                     [ngClass]="day.isToday
                       ? (isDark ? 'bg-red-500/15 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-600')
                       : (isDark ? 'bg-neutral-900/90 border-neutral-800 text-neutral-300' : 'bg-neutral-100 border-neutral-200/90 text-neutral-700')">
                  <span class="font-headline font-extrabold text-sm tracking-tight">
                    {{ day.dateStr.split(' ')[0] }}
                  </span>
                </div>

                <div class="flex items-center gap-1.5">
                  <span *ngIf="day.isToday"
                        class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-headline font-bold uppercase tracking-wider border"
                        [ngClass]="isDark ? 'bg-red-500/15 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-600'">
                    <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    <span>Hoy</span>
                  </span>

                  <span class="font-mono text-[11px] font-semibold tracking-widest px-2 py-1 rounded-lg"
                        [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">
                    0{{ i + 1 }}
                  </span>
                </div>
              </div>

              <!-- Píldora de acento corta sobre el título (Igual que en Dash Library) -->
              <div class="w-6 h-1 rounded-full mb-2.5"
                   [ngClass]="day.isToday ? 'bg-red-500' : (isDark ? 'bg-neutral-700' : 'bg-neutral-300')"></div>

              <!-- Título del Día (Misma tipografía grande y pesada que las carpetas de Dash Library) -->
              <div class="flex items-baseline justify-between gap-2">
                <h3 class="text-2xl sm:text-[25px] font-headline font-extrabold tracking-tight leading-[1.12] m-0"
                    [ngClass]="isDark ? 'text-white' : 'text-neutral-950'">
                  {{ day.dayName }}
                </h3>
                <span class="text-xs font-mono font-semibold"
                      [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                  {{ day.dateStr }}
                </span>
              </div>

              <!-- Subtítulo descriptivo del día -->
              <p class="mt-1.5 text-xs leading-relaxed m-0"
                 [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                {{ day.tasks.length === 0
                   ? 'Sin actividades programadas'
                   : (day.completedCount + ' de ' + day.tasks.length + (day.tasks.length === 1 ? ' tarea completada' : ' tareas completadas')) }}
              </p>
            </div>

            <!-- ─── CUERPO INTERMEDIO: LISTA DE TAREAS DEL DÍA ─── -->
            <div class="relative z-10 px-5 py-4 flex-1 overflow-y-auto space-y-3 max-h-[340px] scrollbar-thin">

              <!-- TARJETA DE TAREA INDIVIDUAL -->
              <div *ngFor="let task of day.tasks; trackBy: trackByTask"
                   class="group/task rounded-[20px] border p-4 relative transition-all duration-200 hover:-translate-y-0.5 cursor-default"
                   [ngClass]="[
                     isDark
                       ? 'bg-[#17171c] border-[#26262c] hover:border-neutral-600 hover:shadow-lg'
                       : 'bg-neutral-50/80 hover:bg-white border-neutral-200/90 hover:border-neutral-400 shadow-2xs hover:shadow-md',
                     task.completed ? 'opacity-60' : 'opacity-100'
                   ]">

                <!-- Fila Superior: Categoría con Punto de Color + Menú Contextual -->
                <div class="flex items-center justify-between gap-2 mb-2.5">
                  <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-headline font-bold uppercase tracking-wider"
                       [ngClass]="[
                         task.type === 'work' ? (isDark ? 'bg-blue-500/10 border-blue-500/25 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700') : '',
                         task.type === 'personal' ? (isDark ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700') : '',
                         task.type === 'urgent' ? (isDark ? 'bg-rose-500/10 border-rose-500/25 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-700') : ''
                       ]">
                    <span class="w-1.5 h-1.5 rounded-full"
                          [ngClass]="[
                            task.type === 'work' ? 'bg-blue-500' : '',
                            task.type === 'personal' ? 'bg-emerald-500' : '',
                            task.type === 'urgent' ? 'bg-rose-500' : ''
                          ]"></span>
                    <span>{{ task.type === 'work' ? 'Trabajo' : task.type === 'personal' ? 'Personal' : 'Urgente' }}</span>
                  </div>

                  <!-- Acciones Rápidas (Editar / Eliminar / Menú) -->
                  <div class="relative flex items-center gap-0.5">
                    <button type="button"
                            (click)="editTask(task)"
                            title="Editar tarea"
                            class="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover/task:opacity-100 transition-all cursor-pointer"
                            [ngClass]="isDark ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-neutral-500 hover:text-black hover:bg-neutral-200/70'">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/>
                      </svg>
                    </button>
                    <button type="button"
                            (click)="deleteTask(task.id)"
                            title="Eliminar tarea"
                            class="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover/task:opacity-100 transition-all cursor-pointer text-neutral-400 hover:text-red-500"
                            [ngClass]="isDark ? 'hover:bg-red-950/30' : 'hover:bg-red-50'">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Título de la Tarea (Tipografía Editorial Headline) -->
                <h4 class="text-[15px] font-headline font-bold tracking-tight leading-snug m-0"
                    [ngClass]="[
                      isDark ? 'text-white' : 'text-neutral-950',
                      task.completed ? 'line-through opacity-60' : ''
                    ]">
                  {{ task.title }}
                </h4>

                <!-- Descripción / Nota de la Tarea -->
                <p *ngIf="task.description"
                   class="text-xs mt-1.5 leading-relaxed line-clamp-2 m-0"
                   [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                  {{ task.description }}
                </p>

                <!-- Footer de la Tarea: Hora + Botón Marcar -->
                <div class="flex items-center justify-between mt-3.5 pt-2.5 border-t"
                     [ngClass]="isDark ? 'border-neutral-800/80' : 'border-neutral-200/70'">
                  <div class="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold"
                       [ngClass]="task.time ? (isDark ? 'text-neutral-300' : 'text-neutral-700') : 'opacity-45'">
                    <svg class="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>{{ task.time || 'Todo el día' }}</span>
                  </div>

                  <button type="button"
                          (click)="toggleCompleted(task)"
                          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-headline font-bold tracking-tight border transition-all cursor-pointer active:scale-95"
                          [ngClass]="task.completed
                            ? (isDark ? 'bg-white text-black border-white' : 'bg-[#09090b] text-white border-[#09090b] force-white')
                            : (isDark ? 'border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white' : 'border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700 hover:text-neutral-950')">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                    </svg>
                    <span>{{ task.completed ? 'Completada' : 'Completar' }}</span>
                  </button>
                </div>
              </div>

              <!-- Estado vacío del día (Diseño limpio estilo Dash Library) -->
              <div *ngIf="day.tasks.length === 0"
                   (click)="openModal(day.dateKey)"
                   class="h-44 rounded-[22px] border border-dashed p-5 flex flex-col items-center justify-center text-center gap-2.5 transition-all cursor-pointer group/empty"
                   [ngClass]="isDark
                     ? 'border-[#222226] hover:border-neutral-700 bg-neutral-900/20 hover:bg-neutral-900/50 text-neutral-500 hover:text-neutral-300'
                     : 'border-neutral-200 hover:border-neutral-400 bg-neutral-50/50 hover:bg-neutral-50 text-neutral-400 hover:text-neutral-700'">
                <div class="w-10 h-10 rounded-full border flex items-center justify-center transition-transform duration-300 group-hover/empty:scale-110"
                     [ngClass]="isDark ? 'border-neutral-800 bg-[#121215] text-neutral-400' : 'border-neutral-200 bg-white text-neutral-500 shadow-2xs'">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <div class="space-y-0.5">
                  <span class="block text-xs font-headline font-bold"
                        [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">
                    {{ activeFilter === 'all' && !searchQuery ? 'Día libre de tareas' : 'Sin coincidencias' }}
                  </span>
                  <span class="block text-[11px] opacity-75">
                    Clic para programar una actividad
                  </span>
                </div>
              </div>

            </div>

            <!-- ─── FOOTER DE LA TARJETA DEL DÍA (IDÉNTICO AL FOOTER DE TARJETAS DE DASH LIBRARY) ─── -->
            <div class="relative z-10 p-6 pt-3 space-y-3 border-t"
                 [ngClass]="isDark ? 'border-neutral-800/80' : 'border-neutral-200/80'">

              <button type="button"
                      (click)="openModal(day.dateKey)"
                      class="w-full flex items-center justify-between pt-0.5 group/btn cursor-pointer bg-transparent border-0 p-0 text-left">
                <span class="text-xs font-headline font-semibold tracking-tight transition-colors"
                      [ngClass]="isDark ? 'text-neutral-400 group-hover/btn:text-white' : 'text-neutral-600 group-hover/btn:text-neutral-950'">
                  Añadir tarea al {{ day.dayName | lowercase }}
                </span>
                <div class="w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 group-hover/btn:translate-x-1"
                     [ngClass]="isDark
                       ? 'border-neutral-800 bg-neutral-900 text-neutral-300 group-hover/btn:bg-white group-hover/btn:text-black group-hover/btn:border-white'
                       : 'border-neutral-200 bg-neutral-100 text-neutral-700 group-hover/btn:bg-neutral-950 group-hover/btn:text-white group-hover/btn:border-neutral-950'">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.25">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
              </button>

            </div>

          </div>

        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════
           6. MODAL DE CREACIÓN / EDICIÓN DE TAREA
      ══════════════════════════════════════════════════════════════ -->
      <div *ngIf="showModal"
           appTeleportToBody
           class="modal-backdrop fixed inset-0 w-screen h-screen z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xl"
           (click)="closeModal()">
        <div class="modal-card w-full max-w-3xl rounded-t-[28px] sm:rounded-[28px] border shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[85vh] flex flex-col transition-all duration-300 sm:-translate-y-6"
             [ngClass]="isDark ? 'bg-[#121215] border-[#222226]' : 'bg-white border-neutral-200'"
             (click)="$event.stopPropagation()">

          <!-- Mobile Drag Pill -->
          <div class="w-10 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700 mx-auto mt-2.5 sm:hidden"></div>

          <!-- Header del Modal (Estilo Editorial Dash Library) -->
          <div class="flex items-center justify-between px-6 py-5 border-b shrink-0"
               [ngClass]="isDark ? 'border-neutral-800/80' : 'border-neutral-100'">
            <div class="space-y-1">
              <div class="flex items-center gap-2 text-[11px] font-sans"
                   [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span>Calendario & Agenda</span>
              </div>
              <h3 class="text-xl sm:text-2xl font-headline font-extrabold tracking-tight m-0"
                  [ngClass]="isDark ? 'text-white' : 'text-neutral-950'">
                {{ editingTaskId ? 'Editar Tarea' : 'Nueva Tarea Programada' }}
              </h3>
            </div>
            <button type="button"
                    (click)="closeModal()"
                    class="w-9 h-9 rounded-full border flex items-center justify-center transition-colors cursor-pointer"
                    [ngClass]="isDark ? 'border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800' : 'border-neutral-200 text-neutral-500 hover:text-black hover:bg-neutral-100'">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Cuerpo del Modal en 2 Columnas -->
          <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto flex-grow" (click)="closeDropdowns()">

            <!-- Columna 1: Título, Categoría y Nota -->
            <div class="space-y-5" (click)="$event.stopPropagation()">
              <!-- Título -->
              <div>
                <label class="block text-[11px] font-headline font-bold uppercase tracking-wider mb-2"
                       [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-600'">Título de la actividad *</label>
                <input type="text"
                       [(ngModel)]="form.title"
                       placeholder="Ej: Estudiar consultas SQL o despliegue..."
                       class="w-full rounded-2xl border px-4 py-3 text-sm font-medium focus:outline-none transition-all"
                       [ngClass]="[
                         isDark ? 'bg-neutral-950 border-neutral-800 text-white placeholder-neutral-600 focus:border-neutral-600' : 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-900',
                         titleError ? 'border-red-500 shake' : ''
                       ]">
                <p *ngIf="titleError" class="text-[11px] text-red-400 mt-1.5 font-medium">El título es obligatorio.</p>
              </div>

              <!-- Categoría -->
              <div>
                <label class="block text-[11px] font-headline font-bold uppercase tracking-wider mb-2"
                       [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-600'">Categoría</label>
                <div class="grid grid-cols-3 gap-2.5">
                  <button *ngFor="let cat of categories"
                          type="button"
                          (click)="form.type = cat.key"
                          class="flex flex-col items-center gap-2 py-3.5 rounded-2xl border transition-all cursor-pointer"
                          [ngClass]="[
                            form.type === cat.key && cat.key === 'work' ? (isDark ? 'border-blue-500 bg-blue-500/15 text-blue-300 font-bold' : 'border-blue-600 bg-blue-50 text-blue-700 font-bold') : '',
                            form.type === cat.key && cat.key === 'personal' ? (isDark ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 font-bold' : 'border-emerald-600 bg-emerald-50 text-emerald-700 font-bold') : '',
                            form.type === cat.key && cat.key === 'urgent' ? (isDark ? 'border-rose-500 bg-rose-500/15 text-rose-300 font-bold' : 'border-rose-600 bg-rose-50 text-rose-700 font-bold') : '',
                            form.type !== cat.key ? (isDark ? 'border-neutral-800 hover:border-neutral-700 bg-neutral-950 text-neutral-400 hover:text-neutral-200' : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50 text-neutral-600 hover:text-neutral-900') : ''
                          ]">
                    <svg class="w-4 h-4 transition-colors"
                         [ngClass]="[
                           form.type === cat.key && cat.key === 'work' ? 'text-blue-400' : '',
                           form.type === cat.key && cat.key === 'personal' ? 'text-emerald-400' : '',
                           form.type === cat.key && cat.key === 'urgent' ? 'text-rose-400' : '',
                           form.type !== cat.key ? (isDark ? 'text-neutral-500' : 'text-neutral-400') : ''
                         ]"
                         fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="cat.icon"/>
                    </svg>
                    <span class="text-[10px] font-headline font-bold uppercase tracking-wider">
                      {{ cat.label }}
                    </span>
                  </button>
                </div>
              </div>

              <!-- Descripción / Nota -->
              <div>
                <label class="block text-[11px] font-headline font-bold uppercase tracking-wider mb-2"
                       [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-600'">Nota o descripción (opcional)</label>
                <textarea [(ngModel)]="form.description"
                          rows="3"
                          maxlength="120"
                          placeholder="Detalles clave o recordatorio adicional..."
                          class="w-full rounded-2xl border px-4 py-3 text-sm font-medium focus:outline-none transition-all resize-none"
                          [ngClass]="isDark ? 'bg-neutral-950 border-neutral-800 text-white placeholder-neutral-600 focus:border-neutral-600' : 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-900'">
                </textarea>
                <p class="text-[10px] mt-1 text-right font-mono" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">
                  {{ form.description.length || 0 }}/120
                </p>
              </div>
            </div>

            <!-- Columna 2: Fecha, Hora y Recordatorio -->
            <div class="space-y-5" (click)="$event.stopPropagation()">
              <!-- Fecha -->
              <div>
                <label class="block text-[11px] font-headline font-bold uppercase tracking-wider mb-2"
                       [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-600'">Fecha programada *</label>
                <!-- Píldoras rápidas de fecha -->
                <div class="flex gap-1.5 mb-2.5 overflow-x-auto pb-1 no-scrollbar">
                  <button *ngFor="let qd of quickDates; trackBy: trackByDay"
                          type="button"
                          (click)="selectModalDate(qd.dateKey)"
                          class="px-3 py-1.5 rounded-full border text-[11px] font-headline font-bold tracking-tight transition-all shrink-0 cursor-pointer"
                          [ngClass]="form.date === qd.dateKey
                            ? (isDark ? 'bg-white text-black border-white' : 'bg-[#09090b] text-white border-[#09090b] force-white')
                            : (isDark ? 'border-neutral-800 text-neutral-400 bg-neutral-950 hover:border-neutral-600' : 'border-neutral-200 text-neutral-600 bg-neutral-50 hover:border-neutral-400')">
                    {{ qd.label }} <span class="opacity-65 font-mono text-[10px]">({{ qd.display }})</span>
                  </button>
                </div>

                <!-- Selector desplegable de fecha -->
                <div class="relative">
                  <button type="button"
                          (click)="toggleDatePicker($event)"
                          class="w-full rounded-2xl border px-4 py-3 text-sm font-medium flex items-center justify-between transition-all text-left cursor-pointer"
                          [ngClass]="isDark ? 'bg-neutral-950 border-neutral-800 text-white hover:border-neutral-600' : 'bg-neutral-50 border-neutral-200 text-neutral-900 hover:border-neutral-400'">
                    <span>{{ formatDisplayDate(form.date) }}</span>
                    <svg class="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>

                  <!-- Calendario desplegable del modal -->
                  <div *ngIf="showDatePicker"
                       (click)="$event.stopPropagation()"
                       class="absolute left-0 right-0 top-13 z-[150] w-full rounded-2xl border shadow-2xl overflow-hidden"
                       [ngClass]="isDark ? 'bg-[#15151a] border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'">

                    <div class="flex items-center justify-between px-4 py-3 border-b"
                         [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-100'">
                      <button type="button" (click)="prevModalMonth()" class="p-1.5 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer">
                        <svg class="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
                      </button>
                      <span class="text-xs font-headline font-bold uppercase tracking-wider">{{ modalMonthName }} {{ modalYear }}</span>
                      <button type="button" (click)="nextModalMonth()" class="p-1.5 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer">
                        <svg class="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                      </button>
                    </div>

                    <div class="grid grid-cols-7 px-2 pt-2 text-[9px] font-headline font-bold uppercase tracking-widest text-center text-neutral-500">
                      <div *ngFor="let day of ['L','M','X','J','V','S','D']">{{ day }}</div>
                    </div>

                    <div class="grid grid-cols-7 gap-0.5 px-2 pb-3">
                      <button *ngFor="let day of modalCalendarDays; trackBy: trackByCalendarDay"
                              type="button"
                              [disabled]="!day.dateKey || isDateDisabled(day.dateKey)"
                              (click)="selectModalDate(day.dateKey)"
                              class="relative aspect-square flex items-center justify-center rounded-lg text-xs font-semibold transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                              [ngClass]="[
                                !day.dateKey ? 'opacity-0 cursor-default' : 'cursor-pointer',
                                form.date === day.dateKey ? (isDark ? 'bg-white text-black font-bold' : 'bg-neutral-900 text-white font-bold force-white') : '',
                                form.date !== day.dateKey && day.dateKey ? (isDark ? 'text-neutral-300 hover:bg-neutral-800' : 'text-neutral-600 hover:bg-neutral-100') : ''
                              ]">
                        {{ day.date }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Hora -->
              <div>
                <div class="flex justify-between items-center mb-2">
                  <label class="text-[11px] font-headline font-bold uppercase tracking-wider"
                         [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-600'">Hora (opcional)</label>
                  <button *ngIf="form.time"
                          type="button"
                          (click)="clearTime()"
                          class="text-[10px] font-headline font-semibold text-neutral-400 hover:text-red-400 cursor-pointer">
                    Quitar hora
                  </button>
                </div>

                <!-- Píldoras rápidas de hora -->
                <div class="flex gap-1.5 mb-2.5 overflow-x-auto pb-1 no-scrollbar">
                  <button *ngFor="let qh of quickHours"
                          type="button"
                          (click)="selectQuickHour(qh)"
                          class="px-2.5 py-1 rounded-full border text-[11px] font-mono font-semibold transition-all shrink-0 cursor-pointer"
                          [ngClass]="form.time === qh
                            ? (isDark ? 'bg-white text-black border-white' : 'bg-[#09090b] text-white border-[#09090b] force-white')
                            : (isDark ? 'border-neutral-800 text-neutral-400 bg-neutral-950 hover:border-neutral-600' : 'border-neutral-200 text-neutral-600 bg-neutral-50 hover:border-neutral-400')">
                    {{ qh }}
                  </button>
                </div>

                <!-- Selector desplegable de hora -->
                <div class="relative">
                  <button type="button"
                          (click)="toggleTimePicker($event)"
                          class="w-full rounded-2xl border px-4 py-3 text-sm font-medium flex items-center justify-between transition-all text-left cursor-pointer"
                          [ngClass]="isDark ? 'bg-neutral-950 border-neutral-800 text-white hover:border-neutral-600' : 'bg-neutral-50 border-neutral-200 text-neutral-900 hover:border-neutral-400'">
                    <span class="font-mono text-xs">{{ form.time ? form.time : 'Sin hora específica asignada' }}</span>
                    <svg class="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>

                  <div *ngIf="showTimePicker"
                       (click)="$event.stopPropagation()"
                       class="absolute left-0 right-0 top-13 z-[150] rounded-2xl border shadow-2xl p-4 flex flex-col gap-3"
                       [ngClass]="isDark ? 'bg-[#15151a] border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'">

                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <p class="text-[9px] font-headline font-bold uppercase tracking-widest text-neutral-500 mb-1.5 text-center">Hora</p>
                        <div class="h-36 overflow-y-auto pr-1 scrollbar-thin flex flex-col gap-1">
                          <button *ngFor="let h of hoursList"
                                  type="button"
                                  (click)="selectHour(h)"
                                  class="w-full py-1.5 text-center text-xs font-mono font-semibold rounded-lg transition-colors cursor-pointer"
                                  [ngClass]="selectedHour === h
                                    ? (isDark ? 'bg-white text-black' : 'bg-neutral-900 text-white force-white')
                                    : (isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600')">
                            {{ h }}
                          </button>
                        </div>
                      </div>

                      <div>
                        <p class="text-[9px] font-headline font-bold uppercase tracking-widest text-neutral-500 mb-1.5 text-center">Minuto</p>
                        <div class="h-36 overflow-y-auto pr-1 scrollbar-thin flex flex-col gap-1">
                          <button *ngFor="let m of minutesList"
                                  type="button"
                                  (click)="selectMinute(m)"
                                  class="w-full py-1.5 text-center text-xs font-mono font-semibold rounded-lg transition-colors cursor-pointer"
                                  [ngClass]="selectedMinute === m
                                    ? (isDark ? 'bg-white text-black' : 'bg-neutral-900 text-white force-white')
                                    : (isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600')">
                            {{ m }}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div class="flex gap-2 border-t pt-3" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-100'">
                      <button type="button"
                              (click)="confirmCustomTime()"
                              class="flex-1 py-2 text-center text-xs font-headline font-bold rounded-full transition-all cursor-pointer"
                              [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-[#09090b] text-white hover:bg-black force-white'">
                        Confirmar hora
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Aviso de Recordatorio por Correo -->
              <div class="p-3.5 rounded-2xl border flex items-center gap-3"
                   [ngClass]="isDark ? 'border-neutral-800 bg-neutral-950/70 text-neutral-300' : 'border-neutral-200/90 bg-neutral-50 text-neutral-700'">
                <div class="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0"
                     [ngClass]="isDark ? 'border-neutral-800 bg-[#121215] text-white' : 'border-neutral-200 bg-white text-neutral-900'">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div class="min-w-0 flex-1 text-xs">
                  <div class="flex items-center gap-1.5">
                    <span class="font-headline font-bold text-xs" [ngClass]="isDark ? 'text-white' : 'text-neutral-950'">Notificación automática</span>
                    <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  </div>
                  <p class="text-[11px] opacity-75 truncate mt-0.5 m-0">
                    Recordatorio 2h antes a <strong class="font-mono">{{ form.reminder_email }}</strong>
                  </p>
                </div>
              </div>
            </div>

          </div>

          <!-- Footer del Modal (Botones Pastilla Estilo Dash Library) -->
          <div class="flex items-center justify-end gap-3 px-6 py-4 border-t shrink-0"
               [ngClass]="isDark ? 'border-neutral-800/80 bg-[#121215]' : 'border-neutral-100 bg-white'">
            <button type="button"
                    (click)="closeModal()"
                    class="px-5 py-2.5 rounded-full text-xs font-headline font-semibold border transition-all cursor-pointer"
                    [ngClass]="isDark ? 'border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-black'">
              Cancelar
            </button>
            <button type="button"
                    (click)="saveTask()"
                    class="px-6 py-2.5 rounded-full text-xs font-headline font-bold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-[#09090b] text-white hover:bg-neutral-800 force-white'">
              <span>{{ editingTaskId ? 'Guardar Cambios' : 'Crear Tarea' }}</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      max-width: 100%;
      min-width: 0;
      overflow-x: clip;
    }

    .library-page {
      --library-red: #dc2626;
      --library-ink: #09090b;
      position: relative;
      isolation: isolate;
    }

    .library-tabs {
      box-shadow: 0 4px 20px rgba(9, 9, 11, 0.04);
    }

    .library-section-heading {
      min-height: 38px;
      padding: 0.25rem 0;
    }

    .library-carousel-track {
      overflow-x: auto;
      overflow-y: hidden;
      overscroll-behavior-x: contain;
      overscroll-behavior-y: auto;
      touch-action: pan-x pan-y;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .library-carousel-track::-webkit-scrollbar {
      display: none;
    }

    .library-folder-card {
      transform: translateY(0);
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                  box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                  border-color 0.25s ease;
    }

    .library-folder-card:hover {
      transform: translateY(-4px);
    }

    .scrollbar-thin::-webkit-scrollbar { width: 4px; }
    .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
    .scrollbar-thin::-webkit-scrollbar-thumb { background-color: rgba(120, 120, 130, 0.25); border-radius: 20px; }

    .modal-backdrop { background: rgba(0,0,0,0.8); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
    .modal-card, .calendar-dropdown { animation: popIn 0.2s cubic-bezier(0.16,1,0.3,1) forwards; }
    @keyframes popIn {
      from { opacity: 0; transform: scale(0.95) translateY(8px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      25% { transform: translateX(-4px); }
      75% { transform: translateX(4px); }
    }
    .shake { animation: shake 0.35s cubic-bezier(0.36,0.07,0.19,0.97); }
  `]
})
export class DashItineraryComponent implements OnInit, OnDestroy {
  @ViewChild('daysCarousel') daysCarousel?: ElementRef<HTMLDivElement>;

  @Input() theme: string = 'light';
  get isDark() { return this.theme === 'dark'; }

  // ── Clock ──
  private clockInterval: any;
  currentTime = '';
  currentDateStr = '';

  // ── Search ──
  searchQuery = '';

  // ── Week Navigation ──
  weekOffset = 0;
  readonly maxWeekOffset = 8; // ~2 months ahead

  // ── Calendar Picker ──
  showCalendar = false;
  calMonth = new Date().getMonth();
  calYear = new Date().getFullYear();

  // ── Filters (Estilo Pestañas Biblioteca) ──
  activeFilter: FilterType = 'all';
  filters = [
    { key: 'all' as FilterType,       label: 'Todas',       color: '#dc2626', icon: 'M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z' },
    { key: 'work' as FilterType,      label: 'Trabajo',     color: '#3b82f6', icon: 'M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5' },
    { key: 'personal' as FilterType,  label: 'Personal',    color: '#10b981', icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z' },
    { key: 'urgent' as FilterType,    label: 'Urgente',     color: '#f43f5e', icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' },
    { key: 'pending' as FilterType,   label: 'Pendientes',  color: '#f59e0b', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
    { key: 'completed' as FilterType, label: 'Completadas', color: '#737373', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  // ── Category definitions ──
  categories = [
    { key: 'work' as const,     label: 'Trabajo',  icon: 'M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5' },
    { key: 'personal' as const, label: 'Personal', icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z' },
    { key: 'urgent' as const,   label: 'Urgente',  icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' },
  ];

  // ── Modal ──
  showModal = false;
  editingTaskId: number | null = null;
  titleError = false;
  form: { title: string; description: string; type: 'work' | 'personal' | 'urgent'; time: string; date: string; reminder_email: string } = {
    title: '',
    description: '',
    type: 'work',
    time: '',
    date: '',
    reminder_email: 'arbelaezz.c11@gmail.com'
  };

  // ── Context Menu ──
  contextMenuTaskId: number | null = null;

  // ── Tasks Storage ──
  allTasks: Task[] = [];
  isLoading = true;
  private itineraryService = inject(ItineraryService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  private reminderInterval: any;

  scrollDaysCarousel(direction: 'left' | 'right') {
    const el = this.daysCarousel?.nativeElement;
    if (!el) return;
    const scrollAmount = Math.max(el.clientWidth * 0.72, 320);
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }

  getFilterCount(key: FilterType): number {
    switch (key) {
      case 'all': return this.totalTasks;
      case 'work': return this.workTasks;
      case 'personal': return this.personalTasks;
      case 'urgent': return this.urgentTasks;
      case 'completed': return this.completedTasks;
      case 'pending': return this.pendingTasks;
      default: return 0;
    }
  }

  // ── Lifecycle ──
  ngOnInit() {
    this.tick();
    this.ngZone.runOutsideAngular(() => {
      this.clockInterval = setInterval(() => {
        this.tick();
        this.cdr.markForCheck();
      }, 1000);
      this.reminderInterval = setInterval(() => this.checkPendingReminders(), 300000);
    });

    setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    }, 1200);

    this.loadWeekTasks();
    this.checkPendingReminders();
  }

  ngOnDestroy() {
    if (this.clockInterval) clearInterval(this.clockInterval);
    if (this.reminderInterval) clearInterval(this.reminderInterval);
  }

  checkPendingReminders() {
    this.itineraryService.checkReminders().subscribe({
      next: (res) => {
        if (res?.processed?.length > 0) {
          console.log(`[PortaLink] ${res.processed.length} recordatorio(s) de 2h enviado(s) a arbelaezz.c11@gmail.com`);
        }
      },
      error: () => {}
    });
  }

  // ── Clock ──
  tick() {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    this.currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const days = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    this.currentDateStr = `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    try { this.cdr.markForCheck(); } catch {}
  }

  // ── Date helpers ──
  toDateKey(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  get quickDates() {
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const nextMonday = new Date(today);
    const dow = today.getDay();
    const daysToMonday = dow === 0 ? 1 : 8 - dow;
    nextMonday.setDate(today.getDate() + daysToMonday);

    const formatQuick = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`;
    
    return [
      { label: 'Hoy', dateKey: this.toDateKey(today), display: formatQuick(today) },
      { label: 'Mañana', dateKey: this.toDateKey(tomorrow), display: formatQuick(tomorrow) },
      { label: 'Próx. Lunes', dateKey: this.toDateKey(nextMonday), display: formatQuick(nextMonday) }
    ];
  }

  quickHours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

  // Custom Time Selection Helpers
  showTimePicker = false;
  hoursList = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  minutesList = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));
  selectedHour = '09';
  selectedMinute = '00';

  // Custom Date Selection Helpers
  showDatePicker = false;
  modalMonth = new Date().getMonth();
  modalYear = new Date().getFullYear();

  get modalMonthName(): string {
    return ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][this.modalMonth];
  }

  get modalCalendarDays(): CalendarDay[] {
    const todayKey = this.todayKey;
    const firstDay = new Date(this.modalYear, this.modalMonth, 1);
    const lastDay = new Date(this.modalYear, this.modalMonth + 1, 0);
    
    let startDow = firstDay.getDay();
    startDow = startDow === 0 ? 6 : startDow - 1;
    
    const days: CalendarDay[] = [];
    for (let i = 0; i < startDow; i++) {
      days.push({ date: null, dateKey: '', isCurrentMonth: false, isToday: false, hasTask: false, inWeekView: false });
    }
    
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(this.modalYear, this.modalMonth, d);
      const dateKey = this.toDateKey(date);
      days.push({
        date: d,
        dateKey,
        isCurrentMonth: true,
        isToday: dateKey === todayKey,
        hasTask: false,
        inWeekView: false
      });
    }
    return days;
  }

  parseFormTime() {
    if (this.form.time) {
      const [h, m] = this.form.time.split(':');
      this.selectedHour = h;
      this.selectedMinute = m;
    } else {
      const now = new Date();
      this.selectedHour = now.getHours().toString().padStart(2, '0');
      this.selectedMinute = '00';
    }
  }

  parseFormDate() {
    const targetDate = this.form.date ? new Date(this.form.date + 'T00:00:00') : new Date();
    this.modalMonth = targetDate.getMonth();
    this.modalYear = targetDate.getFullYear();
  }

  formatDisplayDate(dateKey: string): string {
    if (!dateKey) return 'Seleccionar fecha';
    const parts = dateKey.split('-').map(Number);
    if (parts.length !== 3 || parts.some(n => isNaN(n))) return 'Seleccionar fecha';
    const [y, m, d] = parts;
    const date = new Date(y, m - 1, d);
    if (isNaN(date.getTime())) return 'Seleccionar fecha';
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]}`;
  }

  isDateDisabled(dateKey: string): boolean {
    if (!dateKey) return true;
    const today = new Date(); today.setHours(0,0,0,0);
    const max = new Date(today); max.setDate(today.getDate() + 65);
    const d = new Date(dateKey + 'T00:00:00');
    if (isNaN(d.getTime())) return true;
    return d < today || d > max;
  }

  toggleTimePicker(e: Event) {
    e.stopPropagation();
    this.showDatePicker = false;
    this.showTimePicker = !this.showTimePicker;
  }

  toggleDatePicker(e: Event) {
    e.stopPropagation();
    this.showTimePicker = false;
    this.showDatePicker = !this.showDatePicker;
  }

  selectHour(h: string) {
    this.selectedHour = h;
    this.updateFormTime();
  }

  selectMinute(m: string) {
    this.selectedMinute = m;
    this.updateFormTime();
  }

  updateFormTime() {
    this.form.time = `${this.selectedHour}:${this.selectedMinute}`;
  }

  confirmCustomTime() {
    this.showTimePicker = false;
  }

  selectQuickHour(qh: string) {
    this.form.time = qh;
    const [h, m] = qh.split(':');
    this.selectedHour = h;
    this.selectedMinute = m;
  }

  clearTime() {
    this.form.time = '';
    this.selectedHour = '09';
    this.selectedMinute = '00';
  }

  prevModalMonth() {
    if (this.modalMonth === 0) {
      this.modalMonth = 11;
      this.modalYear--;
    } else {
      this.modalMonth--;
    }
  }

  nextModalMonth() {
    if (this.modalMonth === 11) {
      this.modalMonth = 0;
      this.modalYear++;
    } else {
      this.modalMonth++;
    }
  }

  selectModalDate(dateKey: string) {
    this.form.date = dateKey;
    this.showDatePicker = false;
    this.parseFormDate();
  }

  get todayKey(): string { return this.toDateKey(new Date()); }
  get minDate(): string { return this.todayKey; }
  get maxDate(): string {
    const d = new Date(); d.setDate(d.getDate() + 65); return this.toDateKey(d);
  }

  getWeekStart(): Date {
    const today = new Date();
    const dow = today.getDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    const offset = isNaN(this.weekOffset) ? 0 : this.weekOffset;
    const mon = new Date(today);
    mon.setDate(today.getDate() + diff + offset * 7);
    mon.setHours(0, 0, 0, 0);
    return mon;
  }

  get weekRangeLabel(): string {
    const start = this.getWeekStart();
    const end = new Date(start); end.setDate(start.getDate() + 6);
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} – ${end.getDate()} ${months[end.getMonth()]}`;
    }
    return `${start.getDate()} ${months[start.getMonth()]} – ${end.getDate()} ${months[end.getMonth()]}`;
  }

  // ── Computed week plan ──
  get weekPlan(): DayPlan[] {
    const start = this.getWeekStart();
    const dayNames = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const todayKey = this.todayKey;

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const dateKey = this.toDateKey(d);
      const tasks = this.getFilteredTasksForDate(dateKey);
      return {
        dayName: dayNames[i],
        dateStr: `${d.getDate()} ${months[d.getMonth()]}`,
        dateKey,
        isToday: dateKey === todayKey,
        tasks,
        completedCount: tasks.filter(t => t.completed).length,
      };
    });
  }

  getFilteredTasksForDate(dateKey: string): Task[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.allTasks
      .filter(t => t.date === dateKey)
      .filter(t => {
        if (this.activeFilter === 'all') return true;
        if (this.activeFilter === 'completed') return t.completed;
        if (this.activeFilter === 'pending') return !t.completed;
        return t.type === this.activeFilter;
      })
      .filter(t => {
        if (!q) return true;
        return (t.title && t.title.toLowerCase().includes(q)) ||
               (t.description && t.description.toLowerCase().includes(q));
      })
      .sort((a, b) => {
        if (!a.time && !b.time) return 0;
        if (!a.time) return 1;
        if (!b.time) return -1;
        return a.time.localeCompare(b.time);
      });
  }

  // ── Stats ──
  get totalTasks() { return this.allTasks.length; }
  get workTasks() { return this.allTasks.filter(t => t.type === 'work').length; }
  get personalTasks() { return this.allTasks.filter(t => t.type === 'personal').length; }
  get urgentTasks() { return this.allTasks.filter(t => t.type === 'urgent').length; }
  get completedTasks() { return this.allTasks.filter(t => t.completed).length; }
  get pendingTasks() { return this.allTasks.filter(t => !t.completed).length; }
  get progressPercent() {
    return this.totalTasks === 0 ? 0 : Math.round((this.completedTasks / this.totalTasks) * 100);
  }
  get miniStats() {
    return [
      { label: 'Total', value: this.totalTasks },
      { label: 'Completadas', value: this.completedTasks },
      { label: 'Pendientes', value: this.pendingTasks },
    ];
  }

  // ── Current task ──
  get currentTask(): Task | null {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const todayTasks = this.allTasks
      .filter(t => t.date === this.todayKey && t.time && !t.completed)
      .sort((a, b) => a.time!.localeCompare(b.time!));
    return todayTasks.find(t => {
      const [h, m] = t.time!.split(':').map(Number);
      const tm = h * 60 + m;
      return nowMin >= tm && nowMin < tm + 60;
    }) || todayTasks.find(t => {
      const [h, m] = t.time!.split(':').map(Number);
      return (h * 60 + m) > nowMin;
    }) || null;
  }

  // ── Calendar ──
  get calMonthName() {
    return ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][this.calMonth];
  }

  get calendarDays(): CalendarDay[] {
    const weekStart = this.getWeekStart();
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6);
    const todayKey = this.todayKey;
    const firstDay = new Date(this.calYear, this.calMonth, 1);
    const lastDay = new Date(this.calYear, this.calMonth + 1, 0);
    let startDow = firstDay.getDay();
    startDow = startDow === 0 ? 6 : startDow - 1;
    const days: CalendarDay[] = [];
    for (let i = 0; i < startDow; i++) {
      days.push({ date: null, dateKey: '', isCurrentMonth: false, isToday: false, hasTask: false, inWeekView: false });
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(this.calYear, this.calMonth, d);
      const dateKey = this.toDateKey(date);
      days.push({
        date: d, dateKey,
        isCurrentMonth: true,
        isToday: dateKey === todayKey,
        hasTask: this.allTasks.some(t => t.date === dateKey),
        inWeekView: date >= weekStart && date <= weekEnd,
      });
    }
    return days;
  }

  toggleCalendar(e: Event) {
    e.stopPropagation();
    this.showCalendar = !this.showCalendar;
  }
  prevCalMonth() { if (this.calMonth === 0) { this.calMonth = 11; this.calYear--; } else this.calMonth--; }
  nextCalMonth() { if (this.calMonth === 11) { this.calMonth = 0; this.calYear++; } else this.calMonth++; }

  jumpToDate(dateKey: string) {
    if (!dateKey) return;
    const parts = dateKey.split('-').map(Number);
    if (parts.length !== 3 || parts.some(n => isNaN(n))) return;
    const [y, m, d] = parts;
    const target = new Date(y, m - 1, d);
    if (isNaN(target.getTime())) return;
    const today = new Date();
    const todayDow = today.getDay();
    const todayMondayDiff = todayDow === 0 ? -6 : 1 - todayDow;
    const thisMonday = new Date(today);
    thisMonday.setDate(today.getDate() + todayMondayDiff);
    thisMonday.setHours(0, 0, 0, 0);
    const targetDow = target.getDay();
    const targetMondayDiff = targetDow === 0 ? -6 : 1 - targetDow;
    const targetMonday = new Date(target);
    targetMonday.setDate(target.getDate() + targetMondayDiff);
    targetMonday.setHours(0, 0, 0, 0);
    const diffMs = targetMonday.getTime() - thisMonday.getTime();
    const calculatedOffset = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
    this.weekOffset = isNaN(calculatedOffset) ? 0 : calculatedOffset;
    this.showCalendar = false;
    this.loadWeekTasks();
  }

  goToToday() { this.weekOffset = 0; this.showCalendar = false; this.loadWeekTasks(); }
  changeWeek(dir: number) {
    const next = this.weekOffset + dir;
    if (next >= 0 && next <= this.maxWeekOffset) {
      this.weekOffset = next;
      this.loadWeekTasks();
    } else if (next < 0 && this.weekOffset !== 0) {
      this.weekOffset = 0;
      this.loadWeekTasks();
    }
  }

  // ── Modal ──
  openModal(dateKey?: string) {
    this.editingTaskId = null;
    this.titleError = false;
    this.showTimePicker = false;
    this.showDatePicker = false;
    this.form = { title: '', description: '', type: 'work', time: '', date: dateKey || this.todayKey, reminder_email: 'arbelaezz.c11@gmail.com' };
    this.parseFormTime();
    this.parseFormDate();
    this.showModal = true;
  }

  editTask(task: Task) {
    this.contextMenuTaskId = null;
    this.editingTaskId = task.id;
    this.titleError = false;
    this.showTimePicker = false;
    this.showDatePicker = false;
    this.form = { title: task.title, description: task.description || '', type: task.type, time: task.time || '', date: task.date, reminder_email: 'arbelaezz.c11@gmail.com' };
    this.parseFormTime();
    this.parseFormDate();
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingTaskId = null;
    this.showTimePicker = false;
    this.showDatePicker = false;
  }

  saveTask() {
    if (!this.form.title.trim()) {
      this.titleError = true; setTimeout(() => this.titleError = false, 1500); return;
    }

    const payload = {
      title: this.form.title.trim(),
      description: this.form.description || undefined,
      type: this.form.type,
      task_date: this.form.date,
      task_time: this.form.time || undefined,
      reminder_email: 'arbelaezz.c11@gmail.com'
    };

    if (this.editingTaskId !== null) {
      this.itineraryService.updateTask(this.editingTaskId, payload).subscribe({
        next: (res) => {
          if (res.ok) {
            const apiTask = res.task;
            const idx = this.allTasks.findIndex(t => t.id === this.editingTaskId);
            if (idx >= 0) {
              this.allTasks[idx] = {
                id: apiTask.id,
                title: apiTask.title,
                description: apiTask.description,
                type: apiTask.type,
                date: apiTask.task_date,
                time: apiTask.task_time ? apiTask.task_time.substring(0,5) : undefined,
                completed: apiTask.completed,
                reminder_email: apiTask.reminder_email
              };
            }
            this.cdr.markForCheck();
          }
        },
        error: (err) => console.error('Error updating task', err)
      });
    } else {
      this.itineraryService.createTask(payload).subscribe({
        next: (res) => {
          if (res.ok) {
            const apiTask = res.task;
            this.allTasks.push({
              id: apiTask.id,
              title: apiTask.title,
              description: apiTask.description,
              type: apiTask.type,
              date: apiTask.task_date,
              time: apiTask.task_time ? apiTask.task_time.substring(0,5) : undefined,
              completed: apiTask.completed,
              reminder_email: apiTask.reminder_email
            });
            this.checkPendingReminders();
            this.cdr.markForCheck();
          }
        },
        error: (err) => console.error('Error creating task', err)
      });
    }
    this.closeModal();
  }

  deleteTask(id: number) {
    this.itineraryService.deleteTask(id).subscribe({
      next: (res) => {
        if (res.ok) {
          this.allTasks = this.allTasks.filter(t => t.id !== id);
          this.contextMenuTaskId = null;
          this.cdr.markForCheck();
        }
      },
      error: (err) => console.error('Error deleting task', err)
    });
  }

  toggleCompleted(task: Task) {
    const originalState = task.completed;
    task.completed = !task.completed;
    this.itineraryService.toggleTask(task.id).subscribe({
      next: (res) => {
        if (res.ok) {
          task.completed = res.task.completed;
        } else {
          task.completed = originalState;
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error toggling task', err);
        task.completed = originalState;
        this.cdr.markForCheck();
      }
    });
  }

  toggleContextMenu(id: number, e: Event) { e.stopPropagation(); this.contextMenuTaskId = this.contextMenuTaskId === id ? null : id; }

  onRootClick(_e: Event) {
    this.contextMenuTaskId = null;
    this.showCalendar = false;
    this.showTimePicker = false;
    this.showDatePicker = false;
  }

  closeDropdowns() {
    this.showTimePicker = false;
    this.showDatePicker = false;
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeModal();
    this.contextMenuTaskId = null;
    this.showCalendar = false;
    this.showTimePicker = false;
    this.showDatePicker = false;
  }

  // ── TrackBy Functions ──
  trackByDay(index: number, day: any): string {
    return day?.dateKey || index.toString();
  }

  trackByTask(index: number, task: Task): number {
    return task.id;
  }

  trackByFilter(index: number, f: any): string {
    return f.key || index.toString();
  }

  trackByCalendarDay(index: number, day: CalendarDay): string {
    return day.dateKey || index.toString();
  }

  // ── API Loading ──
  private loadWeekTasks() {
    this.isLoading = true;
    const weekStart = this.toDateKey(this.getWeekStart());
    
    this.itineraryService.getWeek(weekStart).subscribe({
      next: (res) => {
        if (res && res.ok && Array.isArray(res.tasks)) {
          this.allTasks = res.tasks.map((apiTask: ApiTask) => ({
            id: apiTask.id,
            title: apiTask.title || 'Sin título',
            description: apiTask.description,
            type: apiTask.type || 'work',
            date: apiTask.task_date,
            time: apiTask.task_time ? apiTask.task_time.substring(0,5) : undefined,
            completed: Boolean(apiTask.completed)
          }));
        } else {
          this.allTasks = [];
        }
        this.isLoading = false;
        try { this.cdr.markForCheck(); } catch {}
      },
      error: (err) => {
        console.error('Error loading week tasks', err);
        this.isLoading = false;
        this.allTasks = [];
        try { this.cdr.markForCheck(); } catch {}
      }
    });
  }
}
