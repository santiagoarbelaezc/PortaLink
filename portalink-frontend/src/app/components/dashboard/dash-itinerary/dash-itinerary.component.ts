import { Component, Input, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Task {
  id: number;
  title: string;
  description?: string;
  type: 'work' | 'personal' | 'urgent';
  time?: string;
  completed: boolean;
}

interface DayPlan {
  day: string;
  date: string;
  dayIndex: number; // 0=Mon, 6=Sun
  tasks: Task[];
}

@Component({
  selector: 'app-dash-itinerary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in space-y-6 relative" (click)="onBackdropClick($event)">

      <!-- ════════════════════════════════════
           HEADER
      ════════════════════════════════════ -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-4 flex-wrap">
            <h2 class="text-3xl font-bold uppercase tracking-tight"
                [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              Itinerario Semanal
            </h2>
            <!-- Live Clock -->
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
          <div class="flex items-center gap-3">
            <div *ngIf="currentTask; else noCurrentTask"
                 class="flex items-center gap-3 px-4 py-2.5 rounded-xl border"
                 [ngClass]="isDark ? 'border-neutral-700 bg-neutral-900/60' : 'border-neutral-300 bg-white'">
              <div class="w-2 h-2 rounded-full animate-pulse"
                   [ngClass]="isDark ? 'bg-white' : 'bg-neutral-900'"></div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold uppercase tracking-widest"
                      [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Tarea actual:</span>
                <span class="text-xs font-bold"
                      [ngClass]="isDark ? 'text-neutral-100' : 'text-neutral-800'">{{ currentTask.title }}</span>
                <span class="text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border"
                      [ngClass]="isDark ? 'border-neutral-700 text-neutral-400' : 'border-neutral-300 text-neutral-500'">{{ currentTask.time }}</span>
              </div>
            </div>
            <ng-template #noCurrentTask>
              <div class="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed"
                   [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-300'">
                <svg class="w-3.5 h-3.5" [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <span class="text-[10px] font-semibold uppercase tracking-widest"
                      [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'">Sin tarea programada ahora</span>
              </div>
            </ng-template>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Week Navigation -->
          <div class="flex items-center gap-1 rounded-xl border overflow-hidden"
               [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
            <button (click)="changeWeek(-1)"
                    class="p-2.5 transition-colors"
                    [ngClass]="isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-500'">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span class="px-3 text-xs font-bold uppercase tracking-widest"
                  [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-600'">
              Sem. {{ weekOffset === 0 ? 'actual' : (weekOffset > 0 ? '+' + weekOffset : weekOffset) }}
            </span>
            <button (click)="changeWeek(1)"
                    class="p-2.5 transition-colors"
                    [ngClass]="isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-500'">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <!-- New Task Button -->
          <button (click)="openModal()"
                  class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all shadow-sm"
                  [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-900 text-white hover:bg-black'">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
            </svg>
            Nueva Tarea
          </button>
        </div>
      </div>

      <!-- ════════════════════════════════════
           STATS (Dinámicos)
      ════════════════════════════════════ -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div class="p-4 rounded-2xl border col-span-1"
             [ngClass]="isDark ? 'bg-[#0f0f13] border-neutral-800' : 'bg-neutral-50 border-neutral-200'">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-4 h-4" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
            </svg>
            <span class="text-[10px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Total</span>
          </div>
          <p class="text-2xl font-black" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ totalTasks }}</p>
        </div>
        <div class="p-4 rounded-2xl border"
             [ngClass]="isDark ? 'bg-[#0f0f13] border-neutral-800' : 'bg-neutral-50 border-neutral-200'">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-4 h-4" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
            <span class="text-[10px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Trabajo</span>
          </div>
          <p class="text-2xl font-black" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ workTasks }}</p>
        </div>
        <div class="p-4 rounded-2xl border"
             [ngClass]="isDark ? 'bg-[#0f0f13] border-neutral-800' : 'bg-neutral-50 border-neutral-200'">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-4 h-4" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <span class="text-[10px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Personal</span>
          </div>
          <p class="text-2xl font-black" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ personalTasks }}</p>
        </div>
        <div class="p-4 rounded-2xl border"
             [ngClass]="isDark ? 'bg-[#0f0f13] border-neutral-800' : 'bg-neutral-50 border-neutral-200'">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-4 h-4" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            <span class="text-[10px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Urgente</span>
          </div>
          <p class="text-2xl font-black" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ urgentTasks }}</p>
        </div>
        <div class="p-4 rounded-2xl border"
             [ngClass]="isDark ? 'bg-[#0f0f13] border-neutral-800' : 'bg-neutral-50 border-neutral-200'">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-4 h-4" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-[10px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Completadas</span>
          </div>
          <p class="text-2xl font-black" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ completedTasks }}</p>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="flex items-center gap-3">
        <div class="flex-grow h-1.5 rounded-full overflow-hidden" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'">
          <div class="h-full rounded-full transition-all duration-700"
               [ngClass]="isDark ? 'bg-white' : 'bg-neutral-900'"
               [style.width]="progressPercent + '%'">
          </div>
        </div>
        <span class="text-[10px] font-bold uppercase tracking-widest shrink-0"
              [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">
          {{ progressPercent }}% semana
        </span>
      </div>

      <!-- ════════════════════════════════════
           KANBAN BOARD
      ════════════════════════════════════ -->
      <div class="flex gap-4 overflow-x-auto pb-4 kanban-scroll" style="min-height: 55vh;">

        <div *ngFor="let day of weekPlan"
             class="flex-shrink-0 w-72 flex flex-col rounded-2xl border overflow-hidden transition-all duration-300"
             [class.today-col]="day.dayIndex === todayIndex && weekOffset === 0"
             [ngClass]="isDark ? 'bg-[#0a0a0d] border-neutral-800/60' : 'bg-neutral-50/50 border-neutral-200'">

          <!-- Day Header -->
          <div class="p-4 border-b flex justify-between items-center"
               [ngClass]="isDark ? 'border-neutral-800/60 bg-[#111116]' : 'border-neutral-200 bg-white'">
            <div class="flex items-center gap-2">
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-bold uppercase tracking-wider text-sm"
                      [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">
                    {{ day.day }}
                  </h3>
                  <span *ngIf="day.dayIndex === todayIndex && weekOffset === 0"
                        class="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border"
                        [ngClass]="isDark ? 'border-white/20 text-white bg-white/10' : 'border-black/20 text-black bg-black/5'">
                    HOY
                  </span>
                </div>
                <p class="text-[10px] font-semibold tracking-widest mt-0.5"
                   [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">
                  {{ day.date }}
                </p>
              </div>
            </div>
            <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border"
                 [ngClass]="isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-300' : 'bg-neutral-100 border-neutral-200 text-neutral-600'">
              {{ day.tasks.length }}
            </div>
          </div>

          <!-- Tasks List -->
          <div class="p-3 flex-grow overflow-y-auto space-y-3">
            <div *ngFor="let task of day.tasks"
                 class="group p-4 rounded-xl border relative transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                 [ngClass]="[
                   isDark ? 'bg-[#15151a] border-neutral-800/80 hover:border-neutral-600' : 'bg-white border-neutral-200 hover:border-neutral-400',
                   task.completed ? 'opacity-50' : 'opacity-100'
                 ]">

              <!-- Task top row: icon badge + 3 dots menu -->
              <div class="flex justify-between items-center mb-3">

                <!-- Type icon badge (monochrome) -->
                <div class="flex items-center gap-1.5 px-2 py-1 rounded-lg border"
                     [ngClass]="isDark ? 'border-neutral-700 bg-neutral-900' : 'border-neutral-200 bg-neutral-50'">
                  <!-- Work icon: code brackets -->
                  <svg *ngIf="task.type === 'work'" class="w-3.5 h-3.5" [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                  <!-- Personal icon: heart -->
                  <svg *ngIf="task.type === 'personal'" class="w-3.5 h-3.5" [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                  <!-- Urgent icon: bolt -->
                  <svg *ngIf="task.type === 'urgent'" class="w-3.5 h-3.5" [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                  <span class="text-[9px] font-bold uppercase tracking-widest"
                        [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                    {{ task.type === 'work' ? 'Trabajo' : task.type === 'personal' ? 'Personal' : 'Urgente' }}
                  </span>
                </div>

                <!-- Context menu trigger -->
                <div class="relative">
                  <button (click)="toggleContextMenu(task.id, $event)"
                          class="p-1 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          [ngClass]="isDark ? 'hover:bg-neutral-800 text-neutral-500 hover:text-neutral-200' : 'hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700'">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                    </svg>
                  </button>
                  <!-- Dropdown Menu -->
                  <div *ngIf="contextMenuTaskId === task.id"
                       class="absolute right-0 top-8 z-50 w-36 rounded-xl border shadow-2xl overflow-hidden context-menu"
                       [ngClass]="isDark ? 'bg-[#1a1a22] border-neutral-700' : 'bg-white border-neutral-200'">
                    <button (click)="editTask(task, day)"
                            class="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-semibold transition-colors"
                            [ngClass]="isDark ? 'text-neutral-300 hover:bg-neutral-800' : 'text-neutral-700 hover:bg-neutral-50'">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </svg>
                      Editar
                    </button>
                    <div class="mx-3 border-t" [ngClass]="isDark ? 'border-neutral-700' : 'border-neutral-100'"></div>
                    <button (click)="deleteTask(task.id, day)"
                            class="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-semibold transition-colors"
                            [ngClass]="isDark ? 'text-red-400 hover:bg-red-900/20' : 'text-red-500 hover:bg-red-50'">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>

              <!-- Task title -->
              <h4 class="text-sm font-semibold leading-snug"
                  [ngClass]="[
                    isDark ? 'text-neutral-100' : 'text-neutral-800',
                    task.completed ? 'line-through' : ''
                  ]">
                {{ task.title }}
              </h4>

              <!-- Description (if any) -->
              <p *ngIf="task.description"
                 class="text-xs mt-1 leading-relaxed"
                 [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">
                {{ task.description }}
              </p>

              <!-- Footer: time + complete toggle -->
              <div class="flex items-center justify-between mt-3 pt-3 border-t"
                   [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-100'">
                <div class="flex items-center gap-1.5" *ngIf="task.time; else noTime">
                  <svg class="w-3.5 h-3.5" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-[10px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">
                    {{ task.time }}
                  </span>
                </div>
                <ng-template #noTime>
                  <span class="text-[10px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-700' : 'text-neutral-300'">sin hora</span>
                </ng-template>

                <!-- Complete toggle button -->
                <button (click)="toggleCompleted(task)"
                        class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all"
                        [ngClass]="task.completed
                          ? (isDark ? 'border-white/20 bg-white/10 text-white' : 'border-black/20 bg-black/5 text-black')
                          : (isDark ? 'border-neutral-700 text-neutral-500 hover:border-neutral-500 hover:text-neutral-300' : 'border-neutral-200 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600')">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {{ task.completed ? 'Hecho' : 'Marcar' }}
                </button>
              </div>

            </div>

            <!-- Add Task for this day -->
            <button (click)="openModal(day)"
                    class="add-day-btn w-full py-3.5 mt-1 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 border border-dashed group"
                    [ngClass]="isDark ? 'border-neutral-800 hover:border-neutral-600 hover:bg-neutral-800/30' : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-100/50'">
              <div class="w-5 h-5 rounded-full border flex items-center justify-center transition-all group-hover:scale-110"
                   [ngClass]="isDark ? 'border-neutral-700 group-hover:border-neutral-400' : 'border-neutral-300 group-hover:border-neutral-500'">
                <svg class="w-3 h-3" [ngClass]="isDark ? 'text-neutral-600 group-hover:text-neutral-300' : 'text-neutral-400 group-hover:text-neutral-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <span class="text-[10px] font-bold uppercase tracking-widest transition-colors"
                    [ngClass]="isDark ? 'text-neutral-600 group-hover:text-neutral-400' : 'text-neutral-400 group-hover:text-neutral-600'">
                Añadir tarea
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- ════════════════════════════════════
           MODAL DE CREACIÓN / EDICIÓN
      ════════════════════════════════════ -->
      <div *ngIf="showModal"
           class="modal-backdrop fixed inset-0 z-[100] flex items-center justify-center p-4"
           (click)="closeModal()">
        <div class="modal-card w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden"
             [ngClass]="isDark ? 'bg-[#111116] border-neutral-800' : 'bg-white border-neutral-200'"
             (click)="$event.stopPropagation()">

          <!-- Modal Header -->
          <div class="flex items-center justify-between p-6 border-b"
               [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-100'">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl border flex items-center justify-center"
                   [ngClass]="isDark ? 'border-neutral-700 bg-neutral-900' : 'border-neutral-200 bg-neutral-50'">
                <svg *ngIf="!editingTask" class="w-4 h-4" [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                </svg>
                <svg *ngIf="editingTask" class="w-4 h-4" [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
              </div>
              <div>
                <h3 class="text-sm font-bold uppercase tracking-widest"
                    [ngClass]="isDark ? 'text-neutral-100' : 'text-neutral-800'">
                  {{ editingTask ? 'Editar Tarea' : 'Nueva Tarea' }}
                </h3>
                <p class="text-[10px] mt-0.5" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">
                  Completa los campos a continuación
                </p>
              </div>
            </div>
            <button (click)="closeModal()"
                    class="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                    [ngClass]="isDark ? 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800' : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100'">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-5">

            <!-- Title -->
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest mb-2"
                     [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                Título *
              </label>
              <input type="text"
                     [(ngModel)]="form.title"
                     placeholder="Ej: Despliegue de Landing Page..."
                     class="w-full rounded-xl border px-4 py-3 text-sm font-medium focus:outline-none transition-all"
                     [ngClass]="[
                       isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-100 placeholder-neutral-600 focus:border-neutral-500' : 'bg-neutral-50 border-neutral-200 text-neutral-800 placeholder-neutral-400 focus:border-neutral-400',
                       titleError ? 'border-red-500 shake' : ''
                     ]">
              <p *ngIf="titleError" class="text-[10px] text-red-400 mt-1.5 font-medium">El título es obligatorio.</p>
            </div>

            <!-- Day selector -->
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest mb-2"
                     [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                Día de la semana
              </label>
              <select [(ngModel)]="form.dayIndex"
                      class="w-full rounded-xl border px-4 py-3 text-sm font-medium focus:outline-none transition-all appearance-none cursor-pointer"
                      [ngClass]="isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-100 focus:border-neutral-500' : 'bg-neutral-50 border-neutral-200 text-neutral-800 focus:border-neutral-400'">
                <option *ngFor="let day of weekPlan" [value]="day.dayIndex">
                  {{ day.day }} — {{ day.date }}
                </option>
              </select>
            </div>

            <!-- Time -->
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest mb-2"
                     [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                Hora (opcional)
              </label>
              <input type="time"
                     [(ngModel)]="form.time"
                     class="w-full rounded-xl border px-4 py-3 text-sm font-medium focus:outline-none transition-all"
                     [ngClass]="isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-100 focus:border-neutral-500 [color-scheme:dark]' : 'bg-neutral-50 border-neutral-200 text-neutral-800 focus:border-neutral-400'">
            </div>

            <!-- Type selector — Monochrome Cards -->
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest mb-2"
                     [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                Categoría
              </label>
              <div class="grid grid-cols-3 gap-2">

                <!-- Work -->
                <button type="button" (click)="form.type = 'work'"
                        class="flex flex-col items-center gap-2 py-4 rounded-xl border transition-all"
                        [ngClass]="form.type === 'work'
                          ? (isDark ? 'border-white bg-white/10' : 'border-neutral-900 bg-neutral-900/5')
                          : (isDark ? 'border-neutral-800 hover:border-neutral-600 bg-neutral-900' : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50')">
                  <svg class="w-5 h-5 transition-colors" [ngClass]="form.type === 'work' ? (isDark ? 'text-white' : 'text-neutral-900') : (isDark ? 'text-neutral-500' : 'text-neutral-400')" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                  <span class="text-[9px] font-bold uppercase tracking-widest transition-colors"
                        [ngClass]="form.type === 'work' ? (isDark ? 'text-white' : 'text-neutral-900') : (isDark ? 'text-neutral-500' : 'text-neutral-400')">
                    Trabajo
                  </span>
                </button>

                <!-- Personal -->
                <button type="button" (click)="form.type = 'personal'"
                        class="flex flex-col items-center gap-2 py-4 rounded-xl border transition-all"
                        [ngClass]="form.type === 'personal'
                          ? (isDark ? 'border-white bg-white/10' : 'border-neutral-900 bg-neutral-900/5')
                          : (isDark ? 'border-neutral-800 hover:border-neutral-600 bg-neutral-900' : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50')">
                  <svg class="w-5 h-5 transition-colors" [ngClass]="form.type === 'personal' ? (isDark ? 'text-white' : 'text-neutral-900') : (isDark ? 'text-neutral-500' : 'text-neutral-400')" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                  <span class="text-[9px] font-bold uppercase tracking-widest transition-colors"
                        [ngClass]="form.type === 'personal' ? (isDark ? 'text-white' : 'text-neutral-900') : (isDark ? 'text-neutral-500' : 'text-neutral-400')">
                    Personal
                  </span>
                </button>

                <!-- Urgent -->
                <button type="button" (click)="form.type = 'urgent'"
                        class="flex flex-col items-center gap-2 py-4 rounded-xl border transition-all"
                        [ngClass]="form.type === 'urgent'
                          ? (isDark ? 'border-white bg-white/10' : 'border-neutral-900 bg-neutral-900/5')
                          : (isDark ? 'border-neutral-800 hover:border-neutral-600 bg-neutral-900' : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50')">
                  <svg class="w-5 h-5 transition-colors" [ngClass]="form.type === 'urgent' ? (isDark ? 'text-white' : 'text-neutral-900') : (isDark ? 'text-neutral-500' : 'text-neutral-400')" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                  <span class="text-[9px] font-bold uppercase tracking-widest transition-colors"
                        [ngClass]="form.type === 'urgent' ? (isDark ? 'text-white' : 'text-neutral-900') : (isDark ? 'text-neutral-500' : 'text-neutral-400')">
                    Urgente
                  </span>
                </button>

              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest mb-2"
                     [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                Nota (opcional)
              </label>
              <textarea [(ngModel)]="form.description"
                        rows="2"
                        maxlength="120"
                        placeholder="Ej: Coordinar con el equipo antes..."
                        class="w-full rounded-xl border px-4 py-3 text-sm font-medium focus:outline-none transition-all resize-none"
                        [ngClass]="isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-100 placeholder-neutral-600 focus:border-neutral-500' : 'bg-neutral-50 border-neutral-200 text-neutral-800 placeholder-neutral-400 focus:border-neutral-400'">
              </textarea>
              <p class="text-[10px] mt-1 text-right" [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'">
                {{ form.description?.length || 0 }}/120
              </p>
            </div>

          </div>

          <!-- Modal Footer -->
          <div class="flex gap-3 px-6 pb-6">
            <button (click)="closeModal()"
                    class="flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-widest border transition-all"
                    [ngClass]="isDark ? 'border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200' : 'border-neutral-200 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'">
              Cancelar
            </button>
            <button (click)="saveTask()"
                    class="flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-900 text-white hover:bg-black'">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {{ editingTask ? 'Guardar Cambios' : 'Crear Tarea' }}
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    /* Kanban scrollbar */
    .kanban-scroll::-webkit-scrollbar { height: 6px; }
    .kanban-scroll::-webkit-scrollbar-track { background: transparent; }
    .kanban-scroll::-webkit-scrollbar-thumb { background-color: #2a2a2a; border-radius: 20px; }

    /* Today column highlight */
    .today-col { border-top: 2px solid rgba(255,255,255,0.15) !important; }

    /* Modal backdrop blur */
    .modal-backdrop { background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); }
    .modal-card { animation: modalIn 0.25s cubic-bezier(0.16,1,0.3,1) forwards; }
    @keyframes modalIn {
      from { opacity: 0; transform: scale(0.95) translateY(12px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }

    /* Context menu */
    .context-menu { animation: ctxIn 0.15s cubic-bezier(0.16,1,0.3,1) forwards; }
    @keyframes ctxIn {
      from { opacity: 0; transform: scale(0.95) translateY(-4px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }

    /* Shake validation */
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      25% { transform: translateX(-4px); }
      75% { transform: translateX(4px); }
    }
    .shake { animation: shake 0.35s cubic-bezier(0.36,0.07,0.19,0.97); }
  `]
})
export class DashItineraryComponent implements OnInit, OnDestroy {
  private clockInterval: any;
  @Input() theme: string = 'dark';

  get isDark(): boolean { return this.theme === 'dark'; }

  currentTime = '';
  currentDateStr = '';

  ngOnInit() {
    this.tick();
    this.clockInterval = setInterval(() => this.tick(), 1000);
  }

  ngOnDestroy() {
    if (this.clockInterval) clearInterval(this.clockInterval);
  }

  tick() {
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, '0');
    const mm = now.getMinutes().toString().padStart(2, '0');
    const ss = now.getSeconds().toString().padStart(2, '0');
    this.currentTime = `${hh}:${mm}:${ss}`;
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    this.currentDateStr = `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  }

  get currentTask(): Task | null {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const todayTasks = this.weekPlan.find(d => d.dayIndex === this.todayIndex);
    if (!todayTasks) return null;

    const sorted = todayTasks.tasks
      .filter(t => t.time && !t.completed)
      .sort((a, b) => {
        const [ah, am] = (a.time!).split(':').map(Number);
        const [bh, bm] = (b.time!).split(':').map(Number);
        return (ah * 60 + am) - (bh * 60 + bm);
      });

    // Find a task within 60 minutes of its scheduled time
    return sorted.find(t => {
      const [h, m] = (t.time!).split(':').map(Number);
      const taskMin = h * 60 + m;
      return nowMinutes >= taskMin && nowMinutes < taskMin + 60;
    }) || sorted.find(t => {
      // Next upcoming task of the day
      const [h, m] = (t.time!).split(':').map(Number);
      return (h * 60 + m) > nowMinutes;
    }) || null;
  }

  weekOffset = 0;
  showModal = false;
  editingTask: Task | null = null;
  editingDayIndex: number | null = null;
  contextMenuTaskId: number | null = null;
  titleError = false;
  nextId = 100;

  form: {
    title: string;
    description: string;
    type: 'work' | 'personal' | 'urgent';
    time: string;
    dayIndex: number;
  } = { title: '', description: '', type: 'work', time: '', dayIndex: 0 };

  get todayIndex(): number {
    const d = new Date().getDay(); // 0=Sun … 6=Sat
    return d === 0 ? 6 : d - 1;   // map to 0=Mon … 6=Sun
  }

  get totalTasks(): number {
    return this.weekPlan.reduce((s, d) => s + d.tasks.length, 0);
  }
  get workTasks(): number {
    return this.weekPlan.reduce((s, d) => s + d.tasks.filter(t => t.type === 'work').length, 0);
  }
  get personalTasks(): number {
    return this.weekPlan.reduce((s, d) => s + d.tasks.filter(t => t.type === 'personal').length, 0);
  }
  get urgentTasks(): number {
    return this.weekPlan.reduce((s, d) => s + d.tasks.filter(t => t.type === 'urgent').length, 0);
  }
  get completedTasks(): number {
    return this.weekPlan.reduce((s, d) => s + d.tasks.filter(t => t.completed).length, 0);
  }
  get progressPercent(): number {
    return this.totalTasks === 0 ? 0 : Math.round((this.completedTasks / this.totalTasks) * 100);
  }

  @HostListener('document:keydown.escape')
  onEscape() { this.closeModal(); this.contextMenuTaskId = null; }

  onBackdropClick(e: Event) {
    const target = e.target as HTMLElement;
    if (!target.closest('.context-menu') && !target.closest('button')) {
      this.contextMenuTaskId = null;
    }
  }

  changeWeek(dir: number) { this.weekOffset += dir; }

  openModal(day?: DayPlan) {
    this.editingTask = null;
    this.titleError = false;
    this.form = {
      title: '',
      description: '',
      type: 'work',
      time: '',
      dayIndex: day ? day.dayIndex : this.todayIndex
    };
    this.showModal = true;
  }

  editTask(task: Task, day: DayPlan) {
    this.contextMenuTaskId = null;
    this.editingTask = task;
    this.titleError = false;
    this.form = {
      title: task.title,
      description: task.description || '',
      type: task.type,
      time: task.time || '',
      dayIndex: day.dayIndex
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingTask = null;
  }

  saveTask() {
    if (!this.form.title.trim()) {
      this.titleError = true;
      setTimeout(() => this.titleError = false, 1500);
      return;
    }
    const targetDay = this.weekPlan.find(d => d.dayIndex === this.form.dayIndex);
    if (!targetDay) return;

    if (this.editingTask) {
      // Update existing
      const task = this.editingTask;
      const oldDay = this.weekPlan.find(d => d.tasks.some(t => t.id === task.id));
      if (oldDay && oldDay.dayIndex !== this.form.dayIndex) {
        oldDay.tasks = oldDay.tasks.filter(t => t.id !== task.id);
        targetDay.tasks.push({ ...task, title: this.form.title, description: this.form.description, type: this.form.type, time: this.form.time });
      } else {
        const idx = targetDay.tasks.findIndex(t => t.id === task.id);
        if (idx >= 0) {
          targetDay.tasks[idx] = { ...task, title: this.form.title, description: this.form.description, type: this.form.type, time: this.form.time };
        }
      }
    } else {
      // Create new
      targetDay.tasks.push({
        id: this.nextId++,
        title: this.form.title.trim(),
        description: this.form.description || undefined,
        type: this.form.type,
        time: this.form.time || undefined,
        completed: false
      });
    }
    this.closeModal();
  }

  deleteTask(taskId: number, day: DayPlan) {
    day.tasks = day.tasks.filter(t => t.id !== taskId);
    this.contextMenuTaskId = null;
  }

  toggleCompleted(task: Task) { task.completed = !task.completed; }

  toggleContextMenu(taskId: number, event: Event) {
    event.stopPropagation();
    this.contextMenuTaskId = this.contextMenuTaskId === taskId ? null : taskId;
  }

  weekPlan: DayPlan[] = [
    {
      day: 'Lunes', date: '29 Jun', dayIndex: 0,
      tasks: [
        { id: 1, title: 'Despliegue de Landing Page "TechNova"', type: 'urgent', time: '09:00', completed: false },
        { id: 2, title: 'Reunión de planificación sprint', type: 'work', time: '11:30', completed: false },
        { id: 3, title: 'Gym — Pecho y Tríceps', type: 'personal', time: '18:00', completed: false }
      ]
    },
    {
      day: 'Martes', date: '30 Jun', dayIndex: 1,
      tasks: [
        { id: 4, title: 'Desarrollo de empresa "Soluciones XYZ"', type: 'work', time: '08:30', completed: false },
        { id: 5, title: 'Revisión de diseño UI/UX', type: 'work', time: '14:00', completed: false },
        { id: 6, title: 'Lectura / Estudio Angular', type: 'personal', time: '20:00', completed: false }
      ]
    },
    {
      day: 'Miércoles', date: '1 Jul', dayIndex: 2,
      tasks: [
        { id: 7, title: 'Optimización de SEO del portafolio', type: 'work', time: '10:00', completed: true },
        { id: 8, title: 'Gym — Espalda y Bíceps', type: 'personal', time: '18:00', completed: false }
      ]
    },
    {
      day: 'Jueves', date: '2 Jul', dayIndex: 3,
      tasks: [
        { id: 9, title: 'Llamada con cliente (Propuesta)', type: 'urgent', time: '09:30', completed: false },
        { id: 10, title: 'Desarrollo de API Backend', type: 'work', time: '13:00', completed: false },
        { id: 11, title: 'Compras de supermercado', type: 'personal', completed: false }
      ]
    },
    {
      day: 'Viernes', date: '3 Jul', dayIndex: 4,
      tasks: [
        { id: 12, title: 'Testeo y fixes de bugs', type: 'work', time: '09:00', completed: false },
        { id: 13, title: 'Gym — Pierna', type: 'personal', time: '17:00', completed: false },
        { id: 14, title: 'Cena con amigos', type: 'personal', time: '20:30', completed: false }
      ]
    },
    {
      day: 'Sábado', date: '4 Jul', dayIndex: 5,
      tasks: [
        { id: 15, title: 'Mantenimiento del servidor', type: 'work', time: '10:00', completed: false },
        { id: 16, title: 'Descanso / Series', type: 'personal', completed: false }
      ]
    },
    {
      day: 'Domingo', date: '5 Jul', dayIndex: 6,
      tasks: [
        { id: 17, title: 'Planificar la próxima semana', type: 'work', time: '19:00', completed: false }
      ]
    }
  ];
}
