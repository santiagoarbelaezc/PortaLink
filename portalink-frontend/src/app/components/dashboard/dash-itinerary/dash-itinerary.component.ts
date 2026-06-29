import { Component, Input, HostListener, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItineraryService, Task as ApiTask } from '../../../services/itinerary.service';

export interface Task {
  id: number;
  title: string;
  description?: string;
  type: 'work' | 'personal' | 'urgent';
  time?: string;   // HH:MM (mapped from task_time)
  date: string;    // YYYY-MM-DD (mapped from task_date)
  completed: boolean;
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
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in space-y-5 relative" (click)="onRootClick($event)">

      <!-- ══════════ HEADER ══════════ -->
      <div class="flex flex-col gap-3">
        <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div class="flex flex-col gap-3">
            <!-- Title + Clock -->
            <div class="flex items-center gap-4 flex-wrap">
              <h2 class="text-3xl font-bold uppercase tracking-tight"
                  [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                Itinerario Semanal
              </h2>
              <div class="flex items-center gap-2 px-4 py-2 rounded-xl border"
                   [ngClass]="isDark ? 'border-neutral-800 bg-[#0f0f13]' : 'border-neutral-200 bg-neutral-50'">
                <svg class="w-3.5 h-3.5" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-xs font-bold tabular-nums tracking-wider"
                      [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-700'">{{ currentTime }}</span>
                <span class="text-[10px] font-semibold uppercase tracking-widest"
                      [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">— {{ currentDateStr }}</span>
              </div>
            </div>

            <!-- Current Task Banner -->
            <div>
              <div *ngIf="currentTask; else noCurrentTask"
                   class="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl border"
                   [ngClass]="isDark ? 'border-neutral-700 bg-neutral-900/60' : 'border-neutral-300 bg-white'">
                <div class="w-2 h-2 rounded-full animate-pulse" [ngClass]="isDark ? 'bg-white' : 'bg-neutral-900'"></div>
                <span class="text-[10px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Ahora:</span>
                <span class="text-xs font-bold" [ngClass]="isDark ? 'text-neutral-100' : 'text-neutral-800'">{{ currentTask.title }}</span>
                <span class="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border"
                      [ngClass]="isDark ? 'border-neutral-700 text-neutral-400' : 'border-neutral-300 text-neutral-500'">{{ currentTask.time }}</span>
              </div>
              <ng-template #noCurrentTask>
                <div class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed"
                     [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-300'">
                  <svg class="w-3.5 h-3.5" [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  <span class="text-[10px] font-semibold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'">Sin tarea programada ahora</span>
                </div>
              </ng-template>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3 shrink-0">
            <!-- Calendar Picker Button -->
            <div class="relative">
              <button (click)="toggleCalendar($event)"
                      class="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold tracking-wide transition-all"
                      [ngClass]="isDark ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100'">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                Ir a fecha
              </button>

              <!-- Calendar Dropdown -->
              <div *ngIf="showCalendar"
                   class="calendar-dropdown absolute right-0 top-12 z-[200] w-80 rounded-2xl border shadow-2xl overflow-hidden"
                   [ngClass]="isDark ? 'bg-[#111116] border-neutral-800' : 'bg-white border-neutral-200'"
                   (click)="$event.stopPropagation()">

                <!-- Calendar Header -->
                <div class="flex items-center justify-between px-5 py-4 border-b"
                     [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-100'">
                  <button (click)="prevCalMonth()" class="p-1.5 rounded-lg transition-colors"
                          [ngClass]="isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-500'">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
                  </button>
                  <span class="text-sm font-bold uppercase tracking-wider" [ngClass]="isDark ? 'text-neutral-100' : 'text-neutral-800'">
                    {{ calMonthName }} {{ calYear }}
                  </span>
                  <button (click)="nextCalMonth()" class="p-1.5 rounded-lg transition-colors"
                          [ngClass]="isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-500'">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                  </button>
                </div>

                <!-- Day Labels -->
                <div class="grid grid-cols-7 px-3 pt-3 pb-1">
                  <div *ngFor="let d of ['L','M','X','J','V','S','D']"
                       class="text-center text-[9px] font-bold uppercase tracking-widest py-1"
                       [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'">{{ d }}</div>
                </div>

                <!-- Day Grid -->
                <div class="grid grid-cols-7 gap-0.5 px-3 pb-4">
                  <button *ngFor="let day of calendarDays"
                          (click)="day.dateKey && jumpToDate(day.dateKey)"
                          [disabled]="!day.dateKey"
                          class="relative aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-semibold transition-all"
                          [ngClass]="[
                            !day.dateKey ? 'opacity-0 cursor-default' : 'cursor-pointer',
                            day.inWeekView && day.dateKey ? (isDark ? 'bg-white/10 text-white' : 'bg-neutral-900/8 text-neutral-900') : '',
                            day.isToday && day.dateKey ? (isDark ? 'ring-1 ring-white ring-offset-0 font-black text-white' : 'ring-1 ring-neutral-900 font-black text-neutral-900') : '',
                            !day.inWeekView && !day.isToday && day.dateKey ? (isDark ? 'text-neutral-300 hover:bg-neutral-800' : 'text-neutral-600 hover:bg-neutral-100') : ''
                          ]">
                    <span>{{ day.date }}</span>
                    <div *ngIf="day.hasTask && day.dateKey"
                         class="absolute bottom-1 w-1 h-1 rounded-full"
                         [ngClass]="isDark ? 'bg-neutral-400' : 'bg-neutral-500'"></div>
                  </button>
                </div>

                <!-- Quick links -->
                <div class="flex gap-2 px-4 pb-4">
                  <button (click)="goToToday()"
                          class="flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-colors"
                          [ngClass]="isDark ? 'border-neutral-700 text-neutral-400 hover:bg-neutral-800' : 'border-neutral-200 text-neutral-500 hover:bg-neutral-100'">
                    Hoy
                  </button>
                  <button (click)="changeWeek(1); showCalendar=false"
                          class="flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-colors"
                          [ngClass]="isDark ? 'border-neutral-700 text-neutral-400 hover:bg-neutral-800' : 'border-neutral-200 text-neutral-500 hover:bg-neutral-100'">
                    Próx. semana
                  </button>
                </div>
              </div>
            </div>

            <!-- Nueva Tarea -->
            <button (click)="openModal()"
                    class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all shadow-sm"
                    [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-900 text-white hover:bg-black'">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
              Nueva Tarea
            </button>
          </div>
        </div>
      </div>

      <!-- ══════════ FILTER PILLS ══════════ -->
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-[10px] font-bold uppercase tracking-widest mr-1"
              [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'">Filtrar:</span>
        <button *ngFor="let f of filters" (click)="activeFilter = f.key"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all"
                [ngClass]="activeFilter === f.key
                  ? (isDark ? 'bg-white text-black border-white' : 'bg-neutral-900 text-white border-neutral-900')
                  : (isDark ? 'border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200' : 'border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-700')">
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="f.icon"/>
          </svg>
          {{ f.label }}
          <span class="px-1.5 py-0.5 rounded-full text-[8px] font-black"
                [ngClass]="activeFilter === f.key ? (isDark ? 'bg-black/20' : 'bg-white/30') : (isDark ? 'bg-neutral-800' : 'bg-neutral-100')">
            {{ f.key === 'all' ? totalTasks : f.key === 'work' ? workTasks : f.key === 'personal' ? personalTasks : f.key === 'urgent' ? urgentTasks : f.key === 'completed' ? completedTasks : pendingTasks }}
          </span>
        </button>
      </div>

      <!-- ══════════ WEEK NAV + STATS ══════════ -->
      <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <!-- Week Navigation -->
        <div class="flex items-center gap-1 rounded-xl border overflow-hidden"
             [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
          <button (click)="changeWeek(-1)" class="p-2.5 transition-colors"
                  [ngClass]="isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-500'">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <span class="px-4 text-xs font-bold uppercase tracking-widest"
                [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-600'">{{ weekRangeLabel }}</span>
          <button (click)="changeWeek(1)" [disabled]="weekOffset >= maxWeekOffset"
                  class="p-2.5 transition-colors disabled:opacity-30"
                  [ngClass]="isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-500'">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>

        <!-- Mini Stats + Progress -->
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-3">
            <div *ngFor="let stat of miniStats" class="flex items-center gap-1.5">
              <div class="w-1.5 h-1.5 rounded-full" [ngClass]="isDark ? 'bg-neutral-400' : 'bg-neutral-500'"></div>
              <span class="text-[10px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">{{ stat.label }}</span>
              <span class="text-xs font-black" [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-700'">{{ stat.value }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-24 h-1.5 rounded-full overflow-hidden" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'">
              <div class="h-full rounded-full transition-all duration-700"
                   [ngClass]="isDark ? 'bg-white' : 'bg-neutral-900'"
                   [style.width]="progressPercent + '%'"></div>
            </div>
            <span class="text-[10px] font-bold" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">{{ progressPercent }}%</span>
          </div>
        </div>
      </div>

      <!-- ══════════ KANBAN BOARD ══════════ -->
      <div class="flex gap-4 overflow-x-auto pb-4 kanban-scroll" style="min-height: 55vh;">
        <div *ngFor="let day of weekPlan"
             class="flex-shrink-0 w-72 flex flex-col rounded-2xl border overflow-hidden transition-all duration-300"
             [class.today-col]="day.isToday"
             [ngClass]="isDark ? 'bg-[#0a0a0d] border-neutral-800/60' : 'bg-neutral-50/50 border-neutral-200'">

          <!-- Day Header -->
          <div class="p-4 border-b flex justify-between items-center"
               [ngClass]="isDark ? 'border-neutral-800/60 bg-[#111116]' : 'border-neutral-200 bg-white'">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-bold uppercase tracking-wider text-sm"
                    [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">{{ day.dayName }}</h3>
                <span *ngIf="day.isToday"
                      class="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border"
                      [ngClass]="isDark ? 'border-white/20 text-white bg-white/10' : 'border-black/20 text-black bg-black/5'">HOY</span>
              </div>
              <p class="text-[10px] font-semibold tracking-widest mt-0.5"
                 [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">{{ day.dateStr }}</p>
            </div>
            <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border"
                 [ngClass]="isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-300' : 'bg-neutral-100 border-neutral-200 text-neutral-600'">
              {{ day.tasks.length }}
            </div>
          </div>

          <!-- Tasks -->
          <div class="p-3 flex-grow overflow-y-auto space-y-3">
            <div *ngFor="let task of day.tasks"
                 class="group p-4 rounded-xl border relative transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                 [ngClass]="[
                   isDark ? 'bg-[#15151a] border-neutral-800/80 hover:border-neutral-600' : 'bg-white border-neutral-200 hover:border-neutral-400',
                   task.completed ? 'opacity-50' : 'opacity-100'
                 ]">

              <!-- Badge row -->
              <div class="flex justify-between items-center mb-3">
                <div class="flex items-center gap-1.5 px-2 py-1 rounded-lg border"
                     [ngClass]="isDark ? 'border-neutral-700 bg-neutral-900' : 'border-neutral-200 bg-neutral-50'">
                  <svg *ngIf="task.type === 'work'" class="w-3.5 h-3.5" [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"/></svg>
                  <svg *ngIf="task.type === 'personal'" class="w-3.5 h-3.5" [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>
                  <svg *ngIf="task.type === 'urgent'" class="w-3.5 h-3.5" [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>
                  <span class="text-[9px] font-bold uppercase tracking-widest"
                        [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                    {{ task.type === 'work' ? 'Trabajo' : task.type === 'personal' ? 'Personal' : 'Urgente' }}
                  </span>
                </div>
                <!-- Context Menu -->
                <div class="relative">
                  <button (click)="toggleContextMenu(task.id, $event)"
                          class="p-1 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          [ngClass]="isDark ? 'hover:bg-neutral-800 text-neutral-500 hover:text-neutral-200' : 'hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700'">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"/></svg>
                  </button>
                  <div *ngIf="contextMenuTaskId === task.id"
                       class="absolute right-0 top-8 z-50 w-36 rounded-xl border shadow-2xl overflow-hidden context-menu"
                       [ngClass]="isDark ? 'bg-[#1a1a22] border-neutral-700' : 'bg-white border-neutral-200'"
                       (click)="$event.stopPropagation()">
                    <button (click)="editTask(task)"
                            class="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-semibold transition-colors"
                            [ngClass]="isDark ? 'text-neutral-300 hover:bg-neutral-800' : 'text-neutral-700 hover:bg-neutral-50'">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/></svg>
                      Editar
                    </button>
                    <div class="mx-3 border-t" [ngClass]="isDark ? 'border-neutral-700' : 'border-neutral-100'"></div>
                    <button (click)="deleteTask(task.id)"
                            class="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-semibold transition-colors"
                            [ngClass]="isDark ? 'text-red-400 hover:bg-red-900/20' : 'text-red-500 hover:bg-red-50'">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>

              <h4 class="text-sm font-semibold leading-snug"
                  [ngClass]="[isDark ? 'text-neutral-100' : 'text-neutral-800', task.completed ? 'line-through' : '']">
                {{ task.title }}
              </h4>
              <p *ngIf="task.description" class="text-xs mt-1 leading-relaxed"
                 [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">{{ task.description }}</p>

              <!-- Footer -->
              <div class="flex items-center justify-between mt-3 pt-3 border-t"
                   [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-100'">
                <div class="flex items-center gap-1.5">
                  <svg *ngIf="task.time" class="w-3.5 h-3.5" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <span class="text-[10px] font-bold uppercase tracking-widest"
                        [ngClass]="task.time ? (isDark ? 'text-neutral-500' : 'text-neutral-400') : (isDark ? 'text-neutral-700' : 'text-neutral-300')">
                    {{ task.time || 'sin hora' }}
                  </span>
                </div>
                <button (click)="toggleCompleted(task)"
                        class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all"
                        [ngClass]="task.completed
                          ? (isDark ? 'border-white/20 bg-white/10 text-white' : 'border-black/20 bg-black/5 text-black')
                          : (isDark ? 'border-neutral-700 text-neutral-500 hover:border-neutral-500 hover:text-neutral-300' : 'border-neutral-200 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600')">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                  {{ task.completed ? 'Hecho' : 'Marcar' }}
                </button>
              </div>
            </div>

            <!-- Empty state for filter -->
            <div *ngIf="day.tasks.length === 0 && activeFilter !== 'all'"
                 class="text-center py-6">
              <p class="text-[10px] font-semibold uppercase tracking-widest"
                 [ngClass]="isDark ? 'text-neutral-700' : 'text-neutral-400'">Sin resultados</p>
            </div>

            <!-- Add for this day -->
            <button (click)="openModal(day.dateKey)"
                    class="add-day-btn w-full py-3.5 mt-1 rounded-xl flex items-center justify-center gap-2 transition-all border border-dashed group"
                    [ngClass]="isDark ? 'border-neutral-800 hover:border-neutral-600 hover:bg-neutral-800/30' : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-100/50'">
              <div class="w-5 h-5 rounded-full border flex items-center justify-center group-hover:scale-110 transition-all"
                   [ngClass]="isDark ? 'border-neutral-700 group-hover:border-neutral-400' : 'border-neutral-300 group-hover:border-neutral-500'">
                <svg class="w-3 h-3" [ngClass]="isDark ? 'text-neutral-600 group-hover:text-neutral-300' : 'text-neutral-400 group-hover:text-neutral-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
              </div>
              <span class="text-[10px] font-bold uppercase tracking-widest"
                    [ngClass]="isDark ? 'text-neutral-600 group-hover:text-neutral-400' : 'text-neutral-400 group-hover:text-neutral-600'">Añadir tarea</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ══════════ MODAL ══════════ -->
      <div *ngIf="showModal"
           class="modal-backdrop fixed inset-0 z-[100] flex items-center justify-center p-4"
           (click)="closeModal()">
        <div class="modal-card w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden"
             [ngClass]="isDark ? 'bg-[#111116] border-neutral-800' : 'bg-white border-neutral-200'"
             (click)="$event.stopPropagation()">

          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b"
               [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-100'">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl border flex items-center justify-center"
                   [ngClass]="isDark ? 'border-neutral-700 bg-neutral-900' : 'border-neutral-200 bg-neutral-50'">
                <svg *ngIf="!editingTaskId" class="w-4 h-4" [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>
                <svg *ngIf="editingTaskId" class="w-4 h-4" [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/></svg>
              </div>
              <div>
                <h3 class="text-sm font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-100' : 'text-neutral-800'">
                  {{ editingTaskId ? 'Editar Tarea' : 'Nueva Tarea' }}
                </h3>
                <p class="text-[10px] mt-0.5" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Completa los campos</p>
              </div>
            </div>
            <button (click)="closeModal()" class="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                    [ngClass]="isDark ? 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800' : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100'">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-5">
            <!-- Title -->
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest mb-2"
                     [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Título *</label>
              <input type="text" [(ngModel)]="form.title" placeholder="Ej: Despliegue de Landing Page..."
                     class="w-full rounded-xl border px-4 py-3 text-sm font-medium focus:outline-none transition-all"
                     [ngClass]="[isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-100 placeholder-neutral-600 focus:border-neutral-500' : 'bg-neutral-50 border-neutral-200 text-neutral-800 placeholder-neutral-400 focus:border-neutral-400', titleError ? 'border-red-500 shake' : '']">
              <p *ngIf="titleError" class="text-[10px] text-red-400 mt-1.5 font-medium">El título es obligatorio.</p>
            </div>

            <!-- Date -->
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest mb-2"
                     [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Fecha *</label>
              <input type="date" [(ngModel)]="form.date"
                     [min]="minDate" [max]="maxDate"
                     class="w-full rounded-xl border px-4 py-3 text-sm font-medium focus:outline-none transition-all"
                     [ngClass]="isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-100 focus:border-neutral-500 [color-scheme:dark]' : 'bg-neutral-50 border-neutral-200 text-neutral-800 focus:border-neutral-400'">
            </div>

            <!-- Time -->
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest mb-2"
                     [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Hora (opcional)</label>
              <input type="time" [(ngModel)]="form.time"
                     class="w-full rounded-xl border px-4 py-3 text-sm font-medium focus:outline-none transition-all"
                     [ngClass]="isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-100 focus:border-neutral-500 [color-scheme:dark]' : 'bg-neutral-50 border-neutral-200 text-neutral-800 focus:border-neutral-400'">
            </div>

            <!-- Category Cards -->
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest mb-2"
                     [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Categoría</label>
              <div class="grid grid-cols-3 gap-2">
                <button *ngFor="let cat of categories" type="button" (click)="form.type = cat.key"
                        class="flex flex-col items-center gap-2 py-4 rounded-xl border transition-all"
                        [ngClass]="form.type === cat.key
                          ? (isDark ? 'border-white bg-white/10' : 'border-neutral-900 bg-neutral-900/5')
                          : (isDark ? 'border-neutral-800 hover:border-neutral-600 bg-neutral-900' : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50')">
                  <svg class="w-5 h-5 transition-colors"
                       [ngClass]="form.type === cat.key ? (isDark ? 'text-white' : 'text-neutral-900') : (isDark ? 'text-neutral-500' : 'text-neutral-400')"
                       fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="cat.icon"/>
                  </svg>
                  <span class="text-[9px] font-bold uppercase tracking-widest transition-colors"
                        [ngClass]="form.type === cat.key ? (isDark ? 'text-white' : 'text-neutral-900') : (isDark ? 'text-neutral-500' : 'text-neutral-400')">
                    {{ cat.label }}
                  </span>
                </button>
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest mb-2"
                     [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Nota (opcional)</label>
              <textarea [(ngModel)]="form.description" rows="2" maxlength="120"
                        placeholder="Ej: Coordinar con el equipo antes..."
                        class="w-full rounded-xl border px-4 py-3 text-sm font-medium focus:outline-none transition-all resize-none"
                        [ngClass]="isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-100 placeholder-neutral-600 focus:border-neutral-500' : 'bg-neutral-50 border-neutral-200 text-neutral-800 placeholder-neutral-400 focus:border-neutral-400'">
              </textarea>
              <p class="text-[10px] mt-1 text-right" [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'">
                {{ form.description.length || 0 }}/120
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex gap-3 px-6 pb-6">
            <button (click)="closeModal()" class="flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-widest border transition-all"
                    [ngClass]="isDark ? 'border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200' : 'border-neutral-200 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'">
              Cancelar
            </button>
            <button (click)="saveTask()" class="flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-900 text-white hover:bg-black'">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
              {{ editingTaskId ? 'Guardar' : 'Crear Tarea' }}
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
    .today-col { border-top: 2px solid rgba(255,255,255,0.12) !important; }
    .modal-backdrop { background: rgba(0,0,0,0.65); backdrop-filter: blur(8px); }
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
  @Input() theme: string = 'dark';
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
  form: { title: string; description: string; type: 'work' | 'personal' | 'urgent'; time: string; date: string } = { title: '', description: '', type: 'work', time: '', date: '' };

  // ── Context Menu ──
  contextMenuTaskId: number | null = null;

  // ── Tasks Storage ──
  allTasks: Task[] = [];
  isLoading = true;
  private itineraryService = inject(ItineraryService);

  // ── Lifecycle ──
  ngOnInit() {
    this.tick();
    this.clockInterval = setInterval(() => this.tick(), 1000);
    this.loadWeekTasks();
  }

  ngOnDestroy() { if (this.clockInterval) clearInterval(this.clockInterval); }

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

  get todayKey(): string { return this.toDateKey(new Date()); }
  get minDate(): string { return this.todayKey; }
  get maxDate(): string {
    const d = new Date(); d.setDate(d.getDate() + 65); return this.toDateKey(d);
  }

  getWeekStart(): Date {
    const today = new Date();
    const dow = today.getDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    const mon = new Date(today);
    mon.setDate(today.getDate() + diff + this.weekOffset * 7);
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
        if (!a.time) return 1; if (!b.time) return -1;
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
    const [y, m, d] = dateKey.split('-').map(Number);
    const target = new Date(y, m - 1, d);
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
    this.weekOffset = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
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
    this.form = { title: '', description: '', type: 'work', time: '', date: dateKey || this.todayKey };
    this.showModal = true;
  }

  editTask(task: Task) {
    this.contextMenuTaskId = null;
    this.editingTaskId = task.id;
    this.titleError = false;
    this.form = { title: task.title, description: task.description || '', type: task.type, time: task.time || '', date: task.date };
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.editingTaskId = null; }

  saveTask() {
    if (!this.form.title.trim()) {
      this.titleError = true; setTimeout(() => this.titleError = false, 1500); return;
    }

    const payload = {
      title: this.form.title.trim(),
      description: this.form.description || undefined,
      type: this.form.type,
      task_date: this.form.date,
      task_time: this.form.time || undefined
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
                completed: apiTask.completed
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
              completed: apiTask.completed
            });
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

  onRootClick(_e: Event) { this.contextMenuTaskId = null; this.showCalendar = false; }

  @HostListener('document:keydown.escape')
  onEscape() { this.closeModal(); this.contextMenuTaskId = null; this.showCalendar = false; }

  // ── API Loading ──
  private loadWeekTasks() {
    this.isLoading = true;
    const weekStart = this.toDateKey(this.getWeekStart());
    
    this.itineraryService.getWeek(weekStart).subscribe({
      next: (res) => {
        if (res.ok) {
          this.allTasks = res.tasks.map((apiTask: ApiTask) => ({
            id: apiTask.id,
            title: apiTask.title,
            description: apiTask.description,
            type: apiTask.type,
            date: apiTask.task_date,
            time: apiTask.task_time ? apiTask.task_time.substring(0,5) : undefined, // Convert HH:MM:SS to HH:MM
            completed: apiTask.completed
          }));
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading week tasks', err);
        this.isLoading = false;
        // Fallback to empty state on error so it doesn't break the UI
        this.allTasks = [];
      }
    });
  }
}
