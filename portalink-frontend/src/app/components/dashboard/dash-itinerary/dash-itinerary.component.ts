import { Component, Input, HostListener, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
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
  template: `
    <div class="animate-fade-in space-y-5 relative font-sans" (click)="onRootClick($event)">

      <!-- ══════════ HEADER & EXECUTIVE CONTROLS (MONOCROMÁTICO) ══════════ -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5"
           [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
        
        <div>
          <!-- EYEBROW MONOCROMÁTICO -->
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-neutral-400 animate-pulse"></span>
            <p class="text-xs font-headline font-semibold uppercase tracking-[0.25em]"
               [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">
              Módulo de Planificación & Agenda
            </p>
          </div>

          <!-- TITLE & ICON -->
          <div class="flex items-center gap-3 mt-1 flex-wrap">
            <h2 class="text-2xl sm:text-3xl font-headline font-bold tracking-tight flex items-center gap-3"
                [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              <span class="w-9 h-9 rounded-xl bg-white/5 border border-neutral-700/80 text-white flex items-center justify-center shrink-0"
                    [ngClass]="isDark ? 'bg-white/5 border-neutral-700/80 text-white' : 'bg-neutral-100 border-neutral-300 text-neutral-900'">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </span>
              <span>Calendario Semanal</span>
            </h2>
          </div>

          <!-- BREADCRUMB & LIVE CLOCK TRAIL (MONOCROMÁTICO) -->
          <div class="flex items-center gap-2 text-xs font-semibold mt-2"
               [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="font-mono" [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">{{ currentTime }}</span>
            </div>
            <span>•</span>
            <span class="capitalize">{{ currentDateStr }}</span>
            <span>•</span>
            <span class="font-bold" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ weekRangeLabel }}</span>
          </div>
        </div>

        <!-- CONTROLS & ACTIONS (MONOCROMÁTICO) -->
        <div class="flex items-center gap-3 flex-wrap">
          <!-- Calendar Picker Dropdown (Monocromático) -->
          <div class="relative">
            <button (click)="toggleCalendar($event)"
                    class="group relative flex items-center gap-2.5 px-4 py-2 sm:py-2.5 rounded-full border text-xs font-headline font-semibold transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-2xs select-none"
                    [ngClass]="[
                      showCalendar
                        ? (isDark ? 'bg-neutral-800 border-neutral-500 text-white ring-1 ring-white/10' : 'bg-neutral-100 border-neutral-800 text-neutral-950 ring-1 ring-neutral-900/10')
                        : (isDark
                            ? 'border-neutral-800 bg-[#0c0c0e]/90 hover:bg-neutral-900 hover:border-neutral-700 text-neutral-300 hover:text-white'
                            : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 hover:text-neutral-950 hover:border-neutral-300')
                    ]">
              <!-- Icon Container -->
              <span class="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 shrink-0"
                    [ngClass]="showCalendar
                      ? 'bg-white/15 text-white'
                      : (isDark ? 'bg-white/5 border border-neutral-700/60 text-neutral-300 group-hover:text-white' : 'bg-neutral-100 border border-neutral-200 text-neutral-700')">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </span>

              <!-- Label -->
              <span class="tracking-wide">Ir a fecha</span>

              <!-- Dropdown Chevron with Rotation -->
              <svg class="w-3.5 h-3.5 transition-transform duration-200 opacity-60 group-hover:opacity-100"
                   [class.rotate-180]="showCalendar"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            <!-- Calendar Dropdown (Monocromático) -->
            <div *ngIf="showCalendar"
                 class="calendar-dropdown absolute right-0 top-12 z-[200] w-80 rounded-2xl border shadow-2xl overflow-hidden backdrop-blur-xl"
                 [ngClass]="isDark ? 'bg-[#0c0c0e] border-neutral-800' : 'bg-white border-neutral-200'"
                 (click)="$event.stopPropagation()">

              <!-- Calendar Header -->
              <div class="flex items-center justify-between px-5 py-3.5 border-b"
                   [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-100'">
                <button (click)="prevCalMonth()" class="p-1.5 rounded-lg transition-colors cursor-pointer"
                        [ngClass]="isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-500'">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
                </button>
                <span class="text-xs font-headline font-bold uppercase tracking-wider" [ngClass]="isDark ? 'text-neutral-100' : 'text-neutral-800'">
                  {{ calMonthName }} {{ calYear }}
                </span>
                <button (click)="nextCalMonth()" class="p-1.5 rounded-lg transition-colors cursor-pointer"
                        [ngClass]="isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-500'">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>

              <!-- Day Labels -->
              <div class="grid grid-cols-7 px-3 pt-3 pb-1">
                <div *ngFor="let d of ['L','M','X','J','V','S','D']"
                     class="text-center text-[10px] font-bold uppercase tracking-widest py-1"
                     [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">{{ d }}</div>
              </div>

              <!-- Day Grid (Monocromático) -->
              <div class="grid grid-cols-7 gap-0.5 px-3 pb-3">
                <button *ngFor="let day of calendarDays; trackBy: trackByCalendarDay"
                        (click)="day.dateKey && jumpToDate(day.dateKey)"
                        [disabled]="!day.dateKey"
                        class="relative aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-semibold transition-all cursor-pointer"
                        [ngClass]="[
                          !day.dateKey ? 'opacity-0 cursor-default' : 'cursor-pointer',
                          day.inWeekView && day.dateKey ? (isDark ? 'bg-white/15 text-white font-bold' : 'bg-neutral-200 text-neutral-900 font-bold') : '',
                          day.isToday && day.dateKey ? (isDark ? 'ring-1 ring-white font-extrabold text-white' : 'ring-1 ring-neutral-900 font-extrabold text-neutral-900') : '',
                          !day.inWeekView && !day.isToday && day.dateKey ? (isDark ? 'text-neutral-300 hover:bg-neutral-800' : 'text-neutral-600 hover:bg-neutral-100') : ''
                        ]">
                  <span>{{ day.date }}</span>
                  <div *ngIf="day.hasTask && day.dateKey"
                       class="absolute bottom-1 w-1 h-1 rounded-full bg-white"></div>
                </button>
              </div>

              <!-- Quick links -->
              <div class="flex gap-2 px-4 pb-4">
                <button (click)="goToToday()"
                        class="flex-1 py-2 rounded-xl text-[10px] font-headline font-bold uppercase tracking-widest border transition-colors cursor-pointer"
                        [ngClass]="isDark ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-black'">
                  Hoy
                </button>
                <button (click)="changeWeek(1); showCalendar=false"
                        class="flex-1 py-2 rounded-xl text-[10px] font-headline font-bold uppercase tracking-widest border transition-colors cursor-pointer"
                        [ngClass]="isDark ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-black'">
                  Próx. semana
                </button>
              </div>
            </div>
          </div>

          <!-- BOTÓN NUEVA TAREA (MONOCROMÁTICO) -->
          <button (click)="openModal()"
                  class="px-5 py-2.5 rounded-full text-xs font-headline font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-2 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                  [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-[#09090b] text-white hover:bg-neutral-800'">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Nueva Tarea</span>
          </button>
        </div>
      </div>

      <!-- CURRENT TASK STATUS BANNER (MONOCROMÁTICO) -->
      <div>
        <div *ngIf="currentTask; else noCurrentTask"
             class="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border backdrop-blur-md"
             [ngClass]="isDark ? 'border-neutral-700/80 bg-neutral-900/70 text-neutral-200' : 'border-neutral-300 bg-neutral-100 text-neutral-800'">
          <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
          <span class="text-[10px] font-headline font-bold uppercase tracking-wider opacity-70">Ahora:</span>
          <span class="text-xs font-semibold truncate max-w-[220px]">{{ currentTask.title }}</span>
          <span class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10">{{ currentTask.time }}</span>
        </div>
        <ng-template #noCurrentTask>
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-dashed text-xs"
               [ngClass]="isDark ? 'border-neutral-800 bg-neutral-900/30 text-neutral-500' : 'border-neutral-300 bg-neutral-50 text-neutral-400'">
            <svg class="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Sin tarea activa programada ahora</span>
          </div>
        </ng-template>
      </div>

      <!-- ══════════ DOCK BAR DE FILTROS (MONOCROMÁTICO) ══════════ -->
      <div class="rounded-2xl border p-1.5 flex items-center justify-between gap-2.5 select-none transition-all shadow-lg backdrop-blur-xl"
           [ngClass]="isDark ? 'bg-[#0c0c0e]/90 border-neutral-800/80' : 'bg-neutral-100/80 border-neutral-200/90'">
        
        <!-- Contenedor desplazable de filtros -->
        <div class="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none flex-1 min-w-0">
          <!-- Icono discreto de filtros -->
          <div class="pl-2 pr-1 hidden sm:flex items-center text-neutral-500 shrink-0">
            <svg class="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.539.092.917.55.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.546.378-1.004.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
          </div>

          <!-- Filtros individuales estilo pestaña Biblioteca (Monocromáticos) -->
          <button *ngFor="let f of filters; trackBy: trackByFilter"
                  (click)="activeFilter = f.key"
                  class="group/tab relative flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-headline font-semibold transition-all duration-150 cursor-pointer shrink-0"
                  [ngClass]="activeFilter === f.key
                    ? (isDark ? 'bg-[#18181d] border-neutral-700/90 text-white shadow-md shadow-black/40 ring-1 ring-white/10' : 'bg-white border-neutral-300 text-neutral-950 shadow-sm ring-1 ring-neutral-900/10')
                    : (isDark ? 'bg-transparent border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40 hover:border-neutral-800' : 'bg-transparent border-transparent text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60 hover:border-neutral-300')">
            
            <!-- Indicador activo blanco monocromático -->
            <span class="w-2 h-2 rounded-full shrink-0 transition-all"
                  [ngClass]="activeFilter === f.key ? 'bg-white animate-pulse' : 'bg-neutral-600'"
                  [style.boxShadow]="activeFilter === f.key ? '0 0 8px rgba(255,255,255,0.4)' : 'none'"></span>
            
            <span class="truncate min-w-0 tracking-tight">{{ f.label }}</span>

            <!-- Badge numérico monocromático -->
            <span class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                  [ngClass]="activeFilter === f.key
                    ? (isDark ? 'bg-white/15 text-white' : 'bg-neutral-900 text-white')
                    : (isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-200 text-neutral-600')">
              {{ f.key === 'all' ? totalTasks : f.key === 'work' ? workTasks : f.key === 'personal' ? personalTasks : f.key === 'urgent' ? urgentTasks : f.key === 'completed' ? completedTasks : pendingTasks }}
            </span>
          </button>
        </div>

        <!-- Total de tareas activo -->
        <div class="flex items-center gap-1.5 shrink-0 pl-1 border-l"
             [ngClass]="isDark ? 'border-neutral-800/80' : 'border-neutral-200/80'">
          <span class="text-[10px] font-headline font-bold px-2 py-0.5 rounded-lg tracking-wider"
                [ngClass]="isDark ? 'bg-neutral-900/80 text-neutral-400 border border-neutral-800' : 'bg-neutral-200/80 text-neutral-600 border border-neutral-300'">
            {{ totalTasks }} {{ totalTasks === 1 ? 'tarea' : 'tareas' }}
          </span>
        </div>
      </div>

      <!-- ══════════ WEEK NAV & PROGRESO (MONOCROMÁTICO) ══════════ -->
      <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <!-- Control de Navegación de Semana -->
        <div class="flex items-center gap-1.5 p-1 rounded-2xl border backdrop-blur-md"
             [ngClass]="isDark ? 'bg-[#0c0c0e]/90 border-neutral-800/80' : 'bg-white border-neutral-200 shadow-xs'">
          <!-- Semana anterior -->
          <button (click)="changeWeek(-1)"
                  title="Semana anterior"
                  class="p-2 rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  [ngClass]="isDark ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white' : 'hover:bg-neutral-100 text-neutral-500 hover:text-black'">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
          
          <!-- Botón Hoy si está en otra semana (Monocromático) -->
          <button *ngIf="weekOffset !== 0"
                  (click)="goToToday()"
                  title="Ir a semana actual"
                  class="px-2.5 py-1 rounded-lg text-[10px] font-headline font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
            Hoy
          </button>

          <!-- Rango de fecha -->
          <span class="px-3 text-xs font-semibold tracking-wide flex items-center gap-2"
                [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-700'">
            <svg class="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            {{ weekRangeLabel }}
          </span>

          <!-- Semana siguiente -->
          <button (click)="changeWeek(1)"
                  [disabled]="weekOffset >= maxWeekOffset"
                  title="Semana siguiente"
                  class="p-2 rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                  [ngClass]="isDark ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white' : 'hover:bg-neutral-100 text-neutral-500 hover:text-black'">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>

        <!-- Mini Métricas y Barra de Progreso (Monocromático) -->
        <div class="flex items-center gap-4 flex-wrap p-1.5 px-3 rounded-2xl border backdrop-blur-md"
             [ngClass]="isDark ? 'bg-[#0c0c0e]/90 border-neutral-800/80' : 'bg-white border-neutral-200 shadow-xs'">
          <div class="flex items-center gap-3">
            <div *ngFor="let stat of miniStats; trackBy: trackByFilter" class="flex items-center gap-1.5 text-xs">
              <div class="w-2 h-2 rounded-full"
                   [ngClass]="stat.label === 'Completadas' ? 'bg-white' : 'bg-neutral-500'"></div>
              <span class="text-[11px] font-medium opacity-60">{{ stat.label }}:</span>
              <span class="font-bold font-mono" [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">{{ stat.value }}</span>
            </div>
          </div>

          <div class="h-4 w-px bg-neutral-500/20"></div>

          <!-- Barra de Progreso Monocromática -->
          <div class="flex items-center gap-2">
            <div class="w-24 sm:w-28 h-2 rounded-full overflow-hidden" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'">
              <div class="h-full rounded-full transition-all duration-700 bg-white"
                   [style.width]="progressPercent + '%'"></div>
            </div>
            <span class="text-xs font-bold font-mono" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ progressPercent }}%</span>
          </div>
        </div>
      </div>

      <!-- ══════════ KANBAN BOARD (MONOCROMÁTICO CON TAGS DE COLOR) ══════════ -->
      <div class="flex gap-4 overflow-x-auto pb-4 kanban-scroll" style="min-height: 55vh;">
        <div *ngFor="let day of weekPlan; trackBy: trackByDay"
             class="flex-shrink-0 w-72 sm:w-80 flex flex-col rounded-2xl sm:rounded-[24px] border transition-all duration-300 shadow-[0_10px_35px_rgba(0,0,0,0.03)] group"
             [ngClass]="[
               day.isToday
                 ? (isDark ? 'bg-[#0c0c0e]/95 border-neutral-600/80 ring-1 ring-white/10' : 'bg-white border-neutral-900 ring-1 ring-neutral-900/15')
                 : (isDark ? 'bg-[#0c0c0e]/90 border-neutral-800/80 hover:border-neutral-700' : 'bg-white border-neutral-200/80 hover:border-neutral-300')
             ]">

          <!-- Encabezado de Columna de Día -->
          <div class="p-3.5 px-4 border-b flex justify-between items-center rounded-t-2xl sm:rounded-t-[24px]"
               [ngClass]="[
                 day.isToday
                   ? (isDark ? 'border-neutral-700/80 bg-white/[0.03]' : 'border-neutral-200 bg-neutral-100/70')
                   : (isDark ? 'border-neutral-800/80 bg-neutral-900/30' : 'border-neutral-100 bg-neutral-50/50')
               ]">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-headline font-bold text-sm capitalize"
                    [ngClass]="day.isToday ? (isDark ? 'text-white' : 'text-neutral-950') : (isDark ? 'text-neutral-200' : 'text-neutral-800')">
                  {{ day.dayName }}
                </h3>
                <span *ngIf="day.isToday"
                      class="text-[9px] font-headline font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/20 text-white bg-white/10 animate-pulse">
                  Hoy
                </span>
              </div>
              <p class="text-[11px] font-medium mt-0.5"
                 [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">{{ day.dateStr }}</p>
            </div>
            
            <!-- Contador de tareas -->
            <div class="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-headline font-bold border transition-all"
                 [ngClass]="day.isToday
                   ? (isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-neutral-900 border-neutral-900 text-white')
                   : (isDark ? 'bg-neutral-900/80 border-neutral-800 text-neutral-400' : 'bg-neutral-100 border-neutral-200 text-neutral-600')">
              {{ day.tasks.length }}
            </div>
          </div>

          <!-- Lista de Tareas -->
          <div class="p-3 flex-grow overflow-y-auto space-y-2.5">
            <div *ngFor="let task of day.tasks; trackBy: trackByTask"
                 class="group/task p-3.5 rounded-2xl border relative transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-default"
                 [ngClass]="[
                   isDark
                     ? 'bg-[#141419] border-neutral-800/90 hover:border-neutral-700'
                     : 'bg-white border-neutral-200 hover:border-neutral-300',
                   task.completed ? 'opacity-60' : 'opacity-100'
                 ]">

              <!-- Fila de Categoría (CON COLOR ESPECÍFICO) y Menú Contextual -->
              <div class="flex justify-between items-center mb-2">
                <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-headline font-bold uppercase tracking-wider"
                     [ngClass]="[
                       task.type === 'work' ? (isDark ? 'bg-blue-500/10 border-blue-500/25 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700') : '',
                       task.type === 'personal' ? (isDark ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700') : '',
                       task.type === 'urgent' ? (isDark ? 'bg-rose-500/10 border-rose-500/25 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-700') : ''
                     ]">
                  <svg *ngIf="task.type === 'work'" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"/></svg>
                  <svg *ngIf="task.type === 'personal'" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>
                  <svg *ngIf="task.type === 'urgent'" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>
                  <span>{{ task.type === 'work' ? 'Trabajo' : task.type === 'personal' ? 'Personal' : 'Urgente' }}</span>
                </div>

                <!-- Botón de Menú Contextual (Monocromático) -->
                <div class="relative">
                  <button (click)="toggleContextMenu(task.id, $event)"
                          class="p-1 rounded-lg transition-all text-neutral-400 hover:text-white hover:bg-neutral-800/80 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"/></svg>
                  </button>
                  <div *ngIf="contextMenuTaskId === task.id"
                       class="absolute right-0 top-8 z-50 w-36 rounded-xl border shadow-2xl overflow-hidden context-menu backdrop-blur-xl"
                       [ngClass]="isDark ? 'bg-[#18181d] border-neutral-700/90' : 'bg-white border-neutral-200'"
                       (click)="$event.stopPropagation()">
                    <button (click)="editTask(task)"
                            class="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold transition-colors cursor-pointer"
                            [ngClass]="isDark ? 'text-neutral-200 hover:bg-neutral-800' : 'text-neutral-700 hover:bg-neutral-50'">
                      <svg class="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/></svg>
                      Editar
                    </button>
                    <div class="mx-2 border-t" [ngClass]="isDark ? 'border-neutral-700/60' : 'border-neutral-100'"></div>
                    <button (click)="deleteTask(task.id)"
                            class="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold transition-colors cursor-pointer"
                            [ngClass]="isDark ? 'text-rose-400 hover:bg-rose-900/20' : 'text-rose-500 hover:bg-rose-50'">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>

              <!-- Título de Tarea y Nota -->
              <h4 class="text-sm font-semibold leading-snug"
                  [ngClass]="[isDark ? 'text-neutral-100' : 'text-neutral-800', task.completed ? 'line-through opacity-70' : '']">
                {{ task.title }}
              </h4>
              <p *ngIf="task.description" class="text-xs mt-1 leading-relaxed line-clamp-2"
                 [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">{{ task.description }}</p>

              <!-- Footer: Hora + Botón Marcar (Monocromático) -->
              <div class="flex items-center justify-between mt-3 pt-2.5 border-t"
                   [ngClass]="isDark ? 'border-neutral-800/80' : 'border-neutral-100'">
                <div class="flex items-center gap-1.5 text-xs font-medium font-mono"
                     [ngClass]="task.time ? (isDark ? 'text-neutral-400' : 'text-neutral-600') : 'opacity-40'">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <span>{{ task.time || '--:--' }}</span>
                </div>

                <!-- Botón Completada / Marcar -->
                <button (click)="toggleCompleted(task)"
                        class="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer active:scale-95"
                        [ngClass]="task.completed
                          ? (isDark ? 'border-neutral-600 bg-white/10 text-white' : 'border-neutral-800 bg-neutral-900 text-white')
                          : (isDark ? 'border-neutral-700/80 bg-neutral-800/40 hover:bg-neutral-800 hover:text-white text-neutral-300' : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700')">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                  <span>{{ task.completed ? 'Completada' : 'Marcar' }}</span>
                </button>
              </div>
            </div>

            <!-- Estado vacío con filtro -->
            <div *ngIf="day.tasks.length === 0 && activeFilter !== 'all'"
                 class="text-center py-6">
              <p class="text-[11px] font-medium"
                 [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Sin tareas con este filtro</p>
            </div>

            <!-- Botón Añadir tarea al día (Monocromático) -->
            <button (click)="openModal(day.dateKey)"
                    class="w-full py-2.5 mt-1 rounded-xl flex items-center justify-center gap-2 transition-all border border-dashed group cursor-pointer"
                    [ngClass]="isDark
                      ? 'border-neutral-800 hover:border-neutral-600 hover:bg-white/[0.02] text-neutral-400 hover:text-white'
                      : 'border-neutral-300 hover:border-neutral-600 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900'">
              <div class="w-5 h-5 rounded-full border flex items-center justify-center group-hover:scale-110 transition-all"
                   [ngClass]="isDark ? 'border-neutral-700 group-hover:border-neutral-500 text-neutral-400 group-hover:text-white' : 'border-neutral-300 group-hover:border-neutral-500 text-neutral-500 group-hover:text-neutral-900'">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
              </div>
              <span class="text-xs font-semibold">Añadir tarea</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ══════════ MODAL (MONOCROMÁTICO CON COLOR SOLO EN CATEGORÍAS) ══════════ -->
      <div *ngIf="showModal"
           appTeleportToBody
           class="modal-backdrop fixed inset-0 w-screen h-screen z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xl"
           (click)="closeModal()">
        <div class="modal-card w-full max-w-3xl rounded-t-[28px] sm:rounded-2xl border shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[85vh] flex flex-col transition-all duration-300 sm:-translate-y-8 md:-translate-y-10"
             [ngClass]="isDark ? 'bg-[#111116] border-neutral-800' : 'bg-white border-neutral-200'"
             (click)="$event.stopPropagation()">

          <!-- Mobile Drag Pill -->
          <div class="w-10 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700 mx-auto mt-2.5 sm:hidden"></div>

          <!-- Header (Monocromático) -->
          <div class="flex items-center justify-between px-5 py-3.5 sm:p-6 border-b shrink-0"
               [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-100'">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center"
                   [ngClass]="isDark ? 'border-neutral-700 bg-neutral-900 text-neutral-300' : 'border-neutral-200 bg-neutral-50 text-neutral-700'">
                <svg *ngIf="!editingTaskId" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>
                <svg *ngIf="editingTaskId" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/></svg>
              </div>
              <div>
                <h3 class="text-xs sm:text-sm font-headline font-bold uppercase tracking-widest leading-tight" [ngClass]="isDark ? 'text-neutral-100' : 'text-neutral-800'">
                  {{ editingTaskId ? 'Editar Tarea' : 'Nueva Tarea' }}
                </h3>
                <p class="text-[10px] mt-0.5" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Completa los campos</p>
              </div>
            </div>
            <button (click)="closeModal()" class="w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                    [ngClass]="isDark ? 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800' : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100'">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Body split in 2 columns with scroll -->
          <div class="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 overflow-y-auto flex-grow" (click)="closeDropdowns()">
            
            <!-- Column 1: Info (Title, Category, Note) -->
            <div class="space-y-4 sm:space-y-5" (click)="$event.stopPropagation()">
              <!-- Title -->
              <div>
                <label class="block text-[10px] font-headline font-bold uppercase tracking-widest mb-1.5"
                       [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Título *</label>
                <input type="text" [(ngModel)]="form.title" placeholder="Ej: Despliegue de Landing Page..."
                       class="w-full rounded-xl border px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm font-medium focus:outline-none transition-all"
                       [ngClass]="[isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-100 placeholder-neutral-600 focus:border-neutral-500' : 'bg-neutral-50 border-neutral-200 text-neutral-800 placeholder-neutral-400 focus:border-neutral-400', titleError ? 'border-red-500 shake' : '']">
                <p *ngIf="titleError" class="text-[10px] text-red-400 mt-1.5 font-medium">El título es obligatorio.</p>
              </div>

              <!-- Category Cards (SOLO AQUÍ TIENEN COLOR TRABAJO, PERSONAL, URGENTE) -->
              <div>
                <label class="block text-[10px] font-headline font-bold uppercase tracking-widest mb-1.5"
                       [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Categoría</label>
                <div class="grid grid-cols-3 gap-2">
                  <button *ngFor="let cat of categories" type="button" (click)="form.type = cat.key"
                          class="flex flex-col items-center gap-1.5 py-3 sm:py-4 rounded-xl border transition-all cursor-pointer"
                          [ngClass]="[
                            form.type === cat.key && cat.key === 'work' ? (isDark ? 'border-blue-500 bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30 font-bold' : 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600/30 font-bold') : '',
                            form.type === cat.key && cat.key === 'personal' ? (isDark ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30 font-bold' : 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/30 font-bold') : '',
                            form.type === cat.key && cat.key === 'urgent' ? (isDark ? 'border-rose-500 bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30 font-bold' : 'border-rose-600 bg-rose-50 text-rose-700 ring-1 ring-rose-600/30 font-bold') : '',
                            form.type !== cat.key ? (isDark ? 'border-neutral-800 hover:border-neutral-700 bg-neutral-900 text-neutral-400 hover:text-neutral-200' : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50 text-neutral-600 hover:text-neutral-900') : ''
                          ]">
                    <svg class="w-4 h-4 sm:w-5 sm:h-5 transition-colors"
                         [ngClass]="[
                           form.type === cat.key && cat.key === 'work' ? 'text-blue-400' : '',
                           form.type === cat.key && cat.key === 'personal' ? 'text-emerald-400' : '',
                           form.type === cat.key && cat.key === 'urgent' ? 'text-rose-400' : '',
                           form.type !== cat.key ? (isDark ? 'text-neutral-500' : 'text-neutral-400') : ''
                         ]"
                         fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                      <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="cat.icon"/>
                    </svg>
                    <span class="text-[9px] font-headline font-bold uppercase tracking-widest transition-colors">
                      {{ cat.label }}
                    </span>
                  </button>
                </div>
              </div>

              <!-- Description -->
              <div>
                <label class="block text-[10px] font-headline font-bold uppercase tracking-widest mb-1.5"
                       [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Nota (opcional)</label>
                <textarea [(ngModel)]="form.description" rows="2" maxlength="120"
                          placeholder="Ej: Coordinar con el equipo antes..."
                          class="w-full rounded-xl border px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm font-medium focus:outline-none transition-all resize-none"
                          [ngClass]="isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-100 placeholder-neutral-600 focus:border-neutral-500' : 'bg-neutral-50 border-neutral-200 text-neutral-800 placeholder-neutral-400 focus:border-neutral-400'">
                </textarea>
                <p class="text-[10px] mt-1 text-right" [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'">
                  {{ form.description.length || 0 }}/120
                </p>
              </div>
            </div>

            <!-- Column 2: Date & Time Scheduler (Monocromático) -->
            <div class="space-y-4 sm:space-y-5" (click)="$event.stopPropagation()">
              <!-- Date -->
              <div>
                <label class="block text-[10px] font-headline font-bold uppercase tracking-widest mb-1.5"
                       [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Fecha *</label>
                <!-- Quick Dates Pills (Monocromático) -->
                <div class="flex gap-1.5 sm:gap-2 mb-2.5 overflow-x-auto pb-1 no-scrollbar flex-nowrap sm:flex-wrap">
                  <button *ngFor="let qd of quickDates; trackBy: trackByDay" type="button" (click)="selectModalDate(qd.dateKey)"
                          class="px-2.5 sm:px-3 py-1.5 rounded-lg border text-[10px] font-headline font-bold uppercase tracking-widest transition-all shrink-0 cursor-pointer"
                          [ngClass]="form.date === qd.dateKey
                            ? (isDark ? 'bg-white text-black border-white' : 'bg-neutral-900 text-white border-neutral-900')
                            : (isDark ? 'border-neutral-800 text-neutral-400 bg-[#0a0a0d] hover:border-neutral-600' : 'border-neutral-200 text-neutral-600 bg-neutral-50 hover:border-neutral-300')">
                    {{ qd.label }} <span class="opacity-60">({{ qd.display }})</span>
                  </button>
                </div>

                <!-- Custom Date Dropdown -->
                <div class="relative">
                  <button type="button" (click)="toggleDatePicker($event)"
                          class="w-full rounded-xl border px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm font-medium flex items-center justify-between transition-all text-left cursor-pointer"
                          [ngClass]="isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-100 hover:border-neutral-500' : 'bg-neutral-50 border-neutral-200 text-neutral-800 hover:border-neutral-400'">
                    <span>{{ formatDisplayDate(form.date) }}</span>
                    <svg class="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>

                  <!-- Custom Date Picker Dropdown (Monocromático) -->
                  <div *ngIf="showDatePicker" (click)="$event.stopPropagation()"
                       class="absolute left-0 right-0 top-12 sm:top-13 z-[150] w-full rounded-2xl border shadow-2xl overflow-hidden"
                       [ngClass]="isDark ? 'bg-[#15151a] border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'">
                    
                    <!-- Month Navigation -->
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

                    <!-- Day Labels -->
                    <div class="grid grid-cols-7 px-2 pt-2 text-[9px] font-headline font-bold uppercase tracking-widest text-center text-neutral-500">
                      <div *ngFor="let day of ['L','M','X','J','V','S','D']">{{ day }}</div>
                    </div>

                    <!-- Day Grid -->
                    <div class="grid grid-cols-7 gap-0.5 px-2 pb-3">
                      <button *ngFor="let day of modalCalendarDays; trackBy: trackByCalendarDay" type="button"
                              [disabled]="!day.dateKey || isDateDisabled(day.dateKey)"
                              (click)="selectModalDate(day.dateKey)"
                              class="relative aspect-square flex items-center justify-center rounded-lg text-xs font-semibold transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                              [ngClass]="[
                                !day.dateKey ? 'opacity-0 cursor-default' : 'cursor-pointer',
                                form.date === day.dateKey ? (isDark ? 'bg-white text-black font-bold' : 'bg-neutral-900 text-white font-bold') : '',
                                form.date !== day.dateKey && day.dateKey ? (isDark ? 'text-neutral-300 hover:bg-neutral-800' : 'text-neutral-600 hover:bg-neutral-100') : ''
                              ]">
                        {{ day.date }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Time -->
              <div>
                <div class="flex justify-between items-center mb-1.5">
                  <label class="text-[10px] font-headline font-bold uppercase tracking-widest"
                         [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Hora (opcional)</label>
                  <button *ngIf="form.time" type="button" (click)="clearTime()"
                          class="text-[9px] font-headline font-bold uppercase tracking-widest text-neutral-400 hover:text-white cursor-pointer">
                    Quitar hora
                  </button>
                </div>
                <!-- Quick Hours Pills -->
                <div class="flex gap-1.5 mb-2.5 overflow-x-auto pb-1 no-scrollbar flex-nowrap">
                  <button *ngFor="let qh of quickHours" type="button" (click)="selectQuickHour(qh)"
                          class="px-2.5 py-1 rounded-lg border text-[10px] font-headline font-bold tracking-wide transition-all shrink-0 cursor-pointer"
                          [ngClass]="form.time === qh
                            ? (isDark ? 'bg-white text-black border-white' : 'bg-neutral-900 text-white border-neutral-900')
                            : (isDark ? 'border-neutral-800 text-neutral-400 bg-[#0a0a0d] hover:border-neutral-600' : 'border-neutral-200 text-neutral-600 bg-neutral-50 hover:border-neutral-300')">
                    {{ qh }}
                  </button>
                </div>

                <!-- Custom Time Dropdown -->
                <div class="relative">
                  <button type="button" (click)="toggleTimePicker($event)"
                          class="w-full rounded-xl border px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm font-medium flex items-center justify-between transition-all text-left cursor-pointer"
                          [ngClass]="isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-100 hover:border-neutral-500' : 'bg-neutral-50 border-neutral-200 text-neutral-800 hover:border-neutral-400'">
                    <span>{{ form.time ? form.time : 'Sin hora asignada' }}</span>
                    <svg class="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>

                  <!-- Custom Time Picker Dropdown -->
                  <div *ngIf="showTimePicker" (click)="$event.stopPropagation()"
                       class="absolute left-0 right-0 top-12 sm:top-13 z-[150] rounded-2xl border shadow-2xl p-4 flex flex-col gap-3"
                       [ngClass]="isDark ? 'bg-[#15151a] border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'">
                    
                    <div class="grid grid-cols-2 gap-3 sm:gap-4">
                      <!-- Hours Column -->
                      <div>
                        <p class="text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5 text-center">Hora</p>
                        <div class="h-36 sm:h-40 overflow-y-auto pr-1 scrollbar-thin flex flex-col gap-1">
                          <button *ngFor="let h of hoursList" type="button" (click)="selectHour(h)"
                                  class="w-full py-1.5 text-center text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                                  [ngClass]="selectedHour === h
                                    ? (isDark ? 'bg-white text-black' : 'bg-neutral-900 text-white')
                                    : (isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600')">
                            {{ h }}
                          </button>
                        </div>
                      </div>
                      
                      <!-- Minutes Column -->
                      <div>
                        <p class="text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5 text-center">Minuto</p>
                        <div class="h-36 sm:h-40 overflow-y-auto pr-1 scrollbar-thin flex flex-col gap-1">
                          <button *ngFor="let m of minutesList" type="button" (click)="selectMinute(m)"
                                  class="w-full py-1.5 text-center text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                                  [ngClass]="selectedMinute === m
                                    ? (isDark ? 'bg-white text-black' : 'bg-neutral-900 text-white')
                                    : (isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600')">
                            {{ m }}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div class="flex gap-2 border-t pt-3" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-100'">
                      <button type="button" (click)="confirmCustomTime()"
                              class="flex-1 py-2 text-center text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                              [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-900 text-white hover:bg-black'">
                        Aceptar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Email Reminder Notice -->
              <div class="p-3 sm:p-3.5 rounded-xl border flex items-center gap-3 transition-all"
                   [ngClass]="isDark ? 'border-neutral-800 bg-neutral-900/50 text-neutral-300' : 'border-neutral-200 bg-neutral-50 text-neutral-700'">
                <div class="w-8 h-8 rounded-lg border flex items-center justify-center shrink-0"
                     [ngClass]="isDark ? 'border-neutral-700 bg-white/5 text-white' : 'border-neutral-300 bg-white text-neutral-800'">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div class="min-w-0 flex-1 text-xs">
                  <div class="flex items-center gap-1.5">
                    <span class="font-headline font-bold uppercase tracking-wider text-[10px]" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Recordatorio por Correo</span>
                    <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  </div>
                  <p class="text-[11px] opacity-75 truncate mt-0.5">
                    Aviso 2h antes a <strong class="font-mono" [ngClass]="isDark ? 'text-neutral-100' : 'text-neutral-900'">arbelaezz.c11@gmail.com</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer (Sticky bottom) -->
          <div class="flex gap-2.5 sm:gap-3 px-5 py-3.5 sm:px-6 sm:pb-6 sm:pt-4 border-t shrink-0"
               [ngClass]="isDark ? 'border-neutral-800 bg-[#111116]' : 'border-neutral-100 bg-white'">
            <button (click)="closeModal()" class="flex-1 py-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-widest border transition-all cursor-pointer"
                    [ngClass]="isDark ? 'border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200' : 'border-neutral-200 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'">
              Cancelar
            </button>
            <button (click)="saveTask()" class="flex-1 py-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer"
                    [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-900 text-white hover:bg-black'">
              <span>{{ editingTaskId ? 'Guardar' : 'Crear Tarea' }}</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .kanban-scroll::-webkit-scrollbar { height: 6px; }
    .kanban-scroll::-webkit-scrollbar-track { background: transparent; }
    .kanban-scroll::-webkit-scrollbar-thumb { background-color: #2a2a2a; border-radius: 20px; }
    .scrollbar-thin::-webkit-scrollbar { width: 4px; }
    .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
    .today-col {
      border-color: rgba(255, 255, 255, 0.25) !important;
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5) !important;
    }
    .modal-backdrop { background: rgba(0,0,0,0.8); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
    .modal-card, .calendar-dropdown { animation: popIn 0.2s cubic-bezier(0.16,1,0.3,1) forwards; }
    .context-menu { animation: popIn 0.15s cubic-bezier(0.16,1,0.3,1) forwards; }
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
  @Input() theme: string = 'light';
  get isDark() { return this.theme === 'dark'; }

  // ── Clock ──
  private clockInterval: any;
  currentTime = '';
  currentDateStr = '';

  // ── Week Navigation ──
  weekOffset = 0;
  readonly maxWeekOffset = 8; // ~2 months ahead

  // ── Calendar Picker ──
  showCalendar = false;
  calMonth = new Date().getMonth();
  calYear = new Date().getFullYear();

  // ── Filters ──
  activeFilter: FilterType = 'all';
  filters = [
    { key: 'all' as FilterType,       label: 'Todas',      icon: 'M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z' },
    { key: 'work' as FilterType,      label: 'Trabajo',    icon: 'M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5' },
    { key: 'personal' as FilterType,  label: 'Personal',   icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z' },
    { key: 'urgent' as FilterType,    label: 'Urgente',    icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' },
    { key: 'pending' as FilterType,   label: 'Pendientes', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
    { key: 'completed' as FilterType, label: 'Completadas',icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
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
  private reminderInterval: any;

  // ── Lifecycle ──
  ngOnInit() {
    this.tick();
    this.clockInterval = setInterval(() => this.tick(), 1000);
    this.loadWeekTasks();
    this.checkPendingReminders();
    // Verificación periódica de recordatorios cada 5 minutos
    this.reminderInterval = setInterval(() => this.checkPendingReminders(), 300000);
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
      { label: 'Mañ.', dateKey: this.toDateKey(tomorrow), display: formatQuick(tomorrow) },
      { label: 'Próx. Lun', dateKey: this.toDateKey(nextMonday), display: formatQuick(nextMonday) }
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
    startDow = startDow === 0 ? 6 : startDow - 1; // Mon is 0, Sun is 6
    
    const days: CalendarDay[] = [];
    // empty paddings
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
      return {
        dayName: dayNames[i],
        dateStr: `${d.getDate()} ${months[d.getMonth()]}`,
        dateKey,
        isToday: dateKey === todayKey,
        tasks: this.getFilteredTasksForDate(dateKey),
      };
    });
  }

  getFilteredTasksForDate(dateKey: string): Task[] {
    return this.allTasks
      .filter(t => t.date === dateKey)
      .filter(t => {
        if (this.activeFilter === 'all') return true;
        if (this.activeFilter === 'completed') return t.completed;
        if (this.activeFilter === 'pending') return !t.completed;
        return t.type === this.activeFilter;
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
        }
      },
      error: (err) => console.error('Error deleting task', err)
    });
  }

  toggleCompleted(task: Task) {
    const originalState = task.completed;
    task.completed = !task.completed; // Optimistic update
    this.itineraryService.toggleTask(task.id).subscribe({
      next: (res) => {
        if (res.ok) {
          task.completed = res.task.completed;
        } else {
          task.completed = originalState; // Revert on failure
        }
      },
      error: (err) => {
        console.error('Error toggling task', err);
        task.completed = originalState;
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
