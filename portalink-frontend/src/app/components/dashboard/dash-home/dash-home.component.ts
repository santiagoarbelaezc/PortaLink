import { Component, Input, OnInit, OnDestroy, Output, EventEmitter, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsService, SystemMetrics } from '../../../services/analytics.service';
import { ItineraryService } from '../../../services/itinerary.service';
import { SessionTimerService } from '../../../services/session-timer.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dash-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <ng-container *ngIf="!isLoading; else skeleton">
      <div class="space-y-6 tab-enter">

        <!-- ═══════════════════════ WELCOME BANNER ═══════════════════════ -->
      <div class="relative overflow-hidden rounded-[28px] border p-6 md:p-10 min-h-[260px] flex flex-col justify-center transition-all duration-400"
           [ngClass]="isDark ? 'bg-neutral-900/80 border-neutral-800 shadow-[0_10px_35px_rgba(0,0,0,0.4)]' : 'bg-white border-neutral-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.04)]'">

        <!-- Rotbot flotando -->
        <div class="absolute right-0 md:right-8 top-0 bottom-0 hidden sm:flex items-center justify-center pointer-events-none select-none py-6 w-[220px] md:w-[350px]">
          <img src="assets/images/rotbot4.png" class="h-full w-full object-contain opacity-40 sm:opacity-95" alt="Rotbot">
        </div>

        <div class="relative z-10 max-w-full sm:max-w-[75%] md:max-w-[60%]">
          <p class="text-xs font-headline font-semibold uppercase tracking-[0.25em] mb-1.5"
             [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Panel de Control</p>
          <h2 class="text-3xl sm:text-4xl font-headline font-bold leading-tight tracking-tight"
              [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
            Bienvenido, Santiago
          </h2>
          <p class="text-xs sm:text-sm mt-1.5 mb-5 flex items-baseline gap-2 font-headline"
             [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
             <span>{{ currentDate }}</span>
             <span class="text-sm md:text-base font-semibold" [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-700'">{{ currentTime }}</span>
          </p>

          <!-- Quick chips -->
          <div class="flex flex-wrap gap-2 relative z-10">
            <span class="text-xs font-headline font-semibold px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 tracking-wider"
                  [ngClass]="isDark ? 'border-neutral-700 text-neutral-300 bg-neutral-800/50' : 'border-neutral-200 text-neutral-700 bg-neutral-100/80'">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              {{ metrics.homeViews }} Vistas
            </span>
            <span class="text-xs font-headline font-semibold px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 tracking-wider"
                  [ngClass]="isDark ? 'border-neutral-700 text-neutral-300 bg-neutral-800/50' : 'border-neutral-200 text-neutral-700 bg-neutral-100/80'">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              {{ unreadMessages }} Mensajes nuevos
            </span>
            <span class="text-xs font-headline font-semibold px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 tracking-wider"
                  [ngClass]="isDark ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' : 'border-blue-200 text-blue-700 bg-blue-50'">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
              Servidor Online
            </span>
            <!-- Expiration Countdown Chip -->
            <span class="text-xs font-headline font-semibold px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 tracking-wider transition-all duration-300"
                  [ngClass]="sessionIsWarning ? 
                    (isDark ? 'border-amber-500/40 text-amber-400 bg-amber-500/10 animate-pulse' : 'border-amber-300 text-amber-800 bg-amber-50/80 animate-pulse') : 
                    (isDark ? 'border-neutral-700 text-neutral-300 bg-neutral-800/50' : 'border-neutral-200 text-neutral-700 bg-neutral-100/80')">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Sesión: {{ sessionTimeFormatted }}
            </span>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════ AI COMMAND CENTER ═══════════════════════ -->
      <div class="rounded-[28px] border p-6 transition-all duration-300 relative overflow-hidden"
           [ngClass]="isDark ? 'bg-neutral-900/50 border-blue-500/20' : 'bg-white border-blue-200/60 shadow-[0_10px_35px_rgba(0,0,0,0.03)]'">
        <!-- Background subtle glow -->
        <div class="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div class="relative z-10 flex flex-col md:flex-row gap-6">
          <div class="flex-1 space-y-4">
            
            <div class="flex items-center gap-3">
              <img [src]="isDark ? 'assets/icons/logo-link-dark.png' : 'assets/icons/logo-link-light.png'" alt="AI Icon" class="w-7 h-7 object-contain">
              <h3 class="text-xl font-headline font-bold tracking-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                Centro de Comando IA
              </h3>
            </div>
            
            <p class="text-xs sm:text-sm font-sans font-normal" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-600'">
              Pregúntale a nuestro motor inteligente para analizar o navegar el dashboard
            </p>
            
            <div class="relative flex flex-col gap-3 pt-1 w-full">
              <div class="flex flex-col sm:flex-row gap-3 w-full">
                <div class="relative flex-1 group ai-search-container">
                  <span class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300"
                        [ngClass]="isDark ? 'text-neutral-500 group-focus-within:text-blue-400' : 'text-neutral-400 group-focus-within:text-blue-600'">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input type="text"
                         [(ngModel)]="aiQuery"
                         (input)="onSearch()"
                         (focus)="searchFocused = true"
                         (blur)="onBlur()"
                         [placeholder]="displayPlaceholder"
                         class="w-full py-3.5 pl-12 pr-10 rounded-2xl border text-sm focus:outline-none transition-all duration-300 font-medium"
                         [ngClass]="isDark ? 'bg-neutral-950/60 border-neutral-800 text-white placeholder-neutral-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 hover:border-neutral-700' : 'bg-neutral-50/80 border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:border-neutral-300'">
                  
                  <!-- Clear button -->
                  <button *ngIf="aiQuery" (click)="clearSearch()"
                          class="absolute inset-y-0 right-0 pr-4 flex items-center transition-opacity cursor-pointer"
                          [ngClass]="isDark ? 'text-neutral-500 hover:text-neutral-300' : 'text-neutral-400 hover:text-neutral-600'">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <!-- Results Dropdown -->
                  <div *ngIf="aiOpen && aiResults.length > 0"
                       class="absolute top-full left-0 right-0 mt-2 rounded-2xl border shadow-2xl z-50 overflow-hidden animate-dropdown"
                       [ngClass]="isDark ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-neutral-200'">
                    <div class="p-2">
                      <p class="text-[10px] font-headline font-semibold uppercase tracking-widest px-2 py-1.5"
                         [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'">Resultados del sistema</p>
                      <button *ngFor="let result of aiResults"
                              (click)="selectResult(result)"
                              class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer group"
                              [ngClass]="isDark ? 'hover:bg-neutral-800' : 'hover:bg-neutral-50'">
                        <span class="text-base flex-shrink-0">{{ result.emoji }}</span>
                        <div class="flex-grow min-w-0">
                          <p class="text-sm font-headline font-semibold truncate"
                             [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">{{ result.title }}</p>
                          <p class="text-xs truncate"
                             [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-500'">{{ result.value }}</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
                
                <button class="px-7 py-3.5 rounded-full font-headline font-semibold text-xs uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-sm hover:shadow-md border-none"
                        [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-[#09090b] text-white hover:bg-neutral-800'">
                  Consultar IA
                </button>
              </div>
              
              <div class="flex flex-wrap items-center gap-2.5 pt-2">
                <span class="text-[10px] font-headline font-semibold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-500'">
                  Sugerencias rápidas:
                </span>
                <button (click)="aiQuery = 'mensajes'; onSearch()" class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-headline font-semibold tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                        [ngClass]="isDark ? 'border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:border-neutral-700' : 'border-neutral-200 text-neutral-700 bg-neutral-50 hover:bg-white hover:border-neutral-300 hover:shadow-sm'">
                  <svg class="w-3.5 h-3.5" [ngClass]="isDark ? 'text-blue-500' : 'text-blue-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  Mensajes nuevos
                </button>
                <button (click)="aiQuery = 'usuarios'; onSearch()" class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-headline font-semibold tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                        [ngClass]="isDark ? 'border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:border-neutral-700' : 'border-neutral-200 text-neutral-700 bg-neutral-50 hover:bg-white hover:border-neutral-300 hover:shadow-sm'">
                  <svg class="w-3.5 h-3.5" [ngClass]="isDark ? 'text-blue-500' : 'text-blue-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  Usuarios registrados
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      <!-- ═══════════════════════ METRIC CARDS ═══════════════════════ -->
      <div class="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">

        <div *ngFor="let card of metricCards"
             class="rounded-[24px] border p-6 transition-all duration-300 hover:scale-[1.01]"
             [ngClass]="isDark ? 'bg-neutral-900/70 border-neutral-800 hover:border-neutral-700 shadow-[0_10px_30px_rgba(0,0,0,0.3)]' : 'bg-white border-neutral-200/80 hover:border-neutral-300 shadow-[0_10px_35px_rgba(0,0,0,0.03)]'">
          <div class="flex justify-between items-start mb-4">
            <p class="text-xs font-headline font-semibold uppercase tracking-wider"
               [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">{{ card.label }}</p>
            <span class="p-2.5 rounded-2xl border flex items-center justify-center shadow-xs"
                  [ngClass]="isDark ? 'bg-neutral-800/80 border-neutral-700 text-neutral-200' : 'bg-neutral-100/80 border-neutral-200/80 text-neutral-800'">
              <!-- Eye icon — Vistas Home -->
              <svg *ngIf="card.iconPath === 'eye'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <!-- Link icon — Linktree -->
              <svg *ngIf="card.iconPath === 'link'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
              <!-- Chat icon — Rotbot -->
              <svg *ngIf="card.iconPath === 'chat'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              <!-- Bolt icon — Carga -->
              <svg *ngIf="card.iconPath === 'bolt'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </span>
          </div>
          <p class="text-4xl sm:text-5xl font-headline font-bold tracking-tight leading-none"
             [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ card.value }}</p>
          <p class="text-xs mt-2.5 font-headline font-semibold"
             [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">{{ card.sublabel }}</p>
        </div>

      </div>

      <!-- ═══════════════════════ NOTIFICACIONES ITINERARIO ═══════════════════════ -->
      <div *ngIf="itineraryNotifs.current.length || itineraryNotifs.upcoming.length || itineraryNotifs.overdue.length || itineraryNotifs.no_time.length"
           class="rounded-[28px] border p-6 transition-all duration-300"
           [ngClass]="isDark ? 'bg-[#111116] border-neutral-800 shadow-[0_10px_35px_rgba(0,0,0,0.3)]' : 'bg-white border-neutral-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.03)]'">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div class="flex items-center gap-3">
            <div class="w-2.5 h-2.5 rounded-full animate-pulse" [ngClass]="itineraryNotifs.unseen > 0 ? 'bg-red-500' : 'bg-blue-500'"></div>
            <h3 class="text-lg font-headline font-bold tracking-tight uppercase" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Tareas de Hoy</h3>
            <span *ngIf="itineraryNotifs.unseen > 0" class="px-2.5 py-0.5 rounded-full text-[10px] font-headline font-semibold bg-red-500/10 text-red-500 border border-red-500/20 tracking-wider">
              {{ itineraryNotifs.unseen }} SIN VER
            </span>
          </div>
          <button (click)="goToItinerary()" class="flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-headline font-semibold tracking-wider transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                  [ngClass]="isDark ? 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-700' : 'border-neutral-200 bg-neutral-100 text-neutral-800 hover:border-neutral-300 hover:bg-neutral-200'">
            Ver Itinerario Completo
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Current Tasks -->
          <div *ngFor="let task of itineraryNotifs.current"
               class="rounded-2xl border p-4 relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
               [ngClass]="isDark ? 'bg-neutral-900/80 border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'bg-white border-blue-300 shadow-[0_4px_20px_rgba(59,130,246,0.12)]'">
            <div class="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
            <div class="flex justify-between items-start mb-2.5">
              <span class="text-[9px] font-headline font-semibold uppercase tracking-widest text-blue-500 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">En Progreso</span>
              <span class="text-[10px] font-headline font-bold text-blue-500 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-full">{{ task.task_time?.substring(0,5) }}</span>
            </div>
            <h4 class="font-headline font-bold text-sm leading-tight mb-1" [ngClass]="isDark ? 'text-neutral-100' : 'text-neutral-900'">{{ task.title }}</h4>
            <p *ngIf="task.description" class="text-xs truncate font-sans" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">{{ task.description }}</p>
          </div>

          <!-- Overdue Tasks -->
          <div *ngFor="let task of itineraryNotifs.overdue"
               class="rounded-2xl border p-4 relative overflow-hidden transition-all duration-300 hover:scale-[1.01]"
               [ngClass]="isDark ? 'bg-neutral-900/90 border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'bg-red-50/60 border-red-200 shadow-sm'">
            <div class="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
            <div class="flex justify-between items-start mb-2.5">
              <span class="text-[9px] font-headline font-semibold uppercase tracking-widest text-red-500 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20">Atrasada</span>
              <span class="text-[10px] font-headline font-bold text-red-500 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full">{{ task.task_time?.substring(0,5) }}</span>
            </div>
            <h4 class="font-headline font-bold text-sm leading-tight mb-1" [ngClass]="isDark ? 'text-neutral-100' : 'text-neutral-900'">{{ task.title }}</h4>
          </div>

          <!-- Upcoming Tasks -->
          <div *ngFor="let task of itineraryNotifs.upcoming"
               class="rounded-2xl border p-4 relative overflow-hidden transition-all duration-300 hover:scale-[1.01]"
               [ngClass]="isDark ? 'bg-neutral-900/70 border-neutral-700/80 shadow-sm' : 'bg-white border-neutral-200/80 shadow-sm'">
            <div class="absolute top-0 left-0 w-1.5 h-full" [ngClass]="isDark ? 'bg-neutral-600' : 'bg-neutral-400'"></div>
            <div class="flex justify-between items-start mb-2.5">
              <span class="text-[9px] font-headline font-semibold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Próxima</span>
              <span class="text-[10px] font-headline font-bold border px-2 py-0.5 rounded-full" [ngClass]="isDark ? 'text-neutral-300 border-neutral-700 bg-neutral-800' : 'text-neutral-700 border-neutral-200 bg-neutral-100'">{{ task.task_time?.substring(0,5) }}</span>
            </div>
            <h4 class="font-headline font-bold text-sm leading-tight mb-1" [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">{{ task.title }}</h4>
          </div>

          <!-- No Time Tasks -->
          <div *ngFor="let task of itineraryNotifs.no_time"
               class="rounded-2xl border p-4 relative overflow-hidden transition-all duration-300 hover:scale-[1.01] border-dashed"
               [ngClass]="isDark ? 'bg-neutral-900/30 border-neutral-800' : 'bg-neutral-50/50 border-neutral-300'">
            <div class="flex justify-between items-start mb-2.5">
              <span class="text-[9px] font-headline font-semibold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Durante el día</span>
            </div>
            <h4 class="font-headline font-bold text-sm leading-tight" [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">{{ task.title }}</h4>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════ CHARTS ROW 1 ═══════════════════════ -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <!-- Section Traffic -->
        <div class="rounded-[28px] border p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 shadow-[0_10px_35px_rgba(0,0,0,0.03)] min-h-[300px]"
             [ngClass]="isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-neutral-200/80'">
          <div>
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-2.5">
                <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                <h4 class="text-xs sm:text-sm font-headline font-bold uppercase tracking-wider"
                    [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Tráfico por Sección</h4>
              </div>
              <span class="text-[10px] font-headline font-semibold uppercase tracking-wider px-3 py-1 rounded-full border"
                    [ngClass]="isDark ? 'border-neutral-800 text-neutral-400 bg-neutral-950/80' : 'border-neutral-200 text-neutral-600 bg-neutral-100/80'">
                En Tiempo Real
              </span>
            </div>

            <div class="space-y-3">
              <div *ngFor="let sec of paginatedSectionViews" class="space-y-1">
                <div class="flex justify-between items-center text-xs sm:text-sm font-sans font-normal">
                  <span [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-600'">{{ sec.name }}</span>
                  <span [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-600'">{{ sec.views }} visitas</span>
                </div>
                <div class="h-1.5 rounded-full overflow-hidden p-0"
                     [ngClass]="isDark ? 'bg-neutral-800/80' : 'bg-neutral-200/60'">
                  <div class="h-full rounded-full transition-all duration-800 ease-out"
                       [style.width.%]="getSectionPct(sec.views)"
                       [ngClass]="isDark ? 'bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)]' : 'bg-neutral-900'"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination Bar -->
          <div *ngIf="totalSectionPages > 1" class="flex items-center justify-between pt-3 mt-3 border-t"
               [ngClass]="isDark ? 'border-neutral-800/80 text-white' : 'border-neutral-100 text-neutral-700'">
            <span class="text-xs font-sans font-normal"
                  [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-600'">
              Página {{ sectionPage }} de {{ totalSectionPages }}
            </span>
            <div class="flex items-center gap-1.5">
              <button (click)="prevSectionPage()" [disabled]="sectionPage === 1"
                      class="w-6 h-6 rounded-full flex items-center justify-center border text-xs font-sans font-normal transition-all duration-200 disabled:opacity-30 cursor-pointer shadow-xs"
                      [ngClass]="isDark ? 'border-neutral-700 text-neutral-300 hover:bg-white hover:text-black' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-100'">
                ‹
              </button>
              <button (click)="nextSectionPage()" [disabled]="sectionPage === totalSectionPages"
                      class="w-6 h-6 rounded-full flex items-center justify-center border text-xs font-sans font-normal transition-all duration-200 disabled:opacity-30 cursor-pointer shadow-xs"
                      [ngClass]="isDark ? 'border-neutral-700 text-neutral-300 hover:bg-white hover:text-black' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-100'">
                ›
              </button>
            </div>
          </div>
        </div>

        <!-- Linktree Clicks -->
        <div class="rounded-[28px] border p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 shadow-[0_10px_35px_rgba(0,0,0,0.03)] min-h-[300px]"
             [ngClass]="isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-neutral-200/80'">
          <div>
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-2.5">
                <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                <h4 class="text-xs sm:text-sm font-headline font-bold uppercase tracking-wider"
                    [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Clics en Linktree</h4>
              </div>
              <span class="text-[10px] font-headline font-semibold uppercase tracking-wider px-3 py-1 rounded-full border"
                    [ngClass]="isDark ? 'border-neutral-800 text-neutral-400 bg-neutral-950/80' : 'border-neutral-200 text-neutral-600 bg-neutral-100/80'">
                Enlaces Activos
              </span>
            </div>

            <div class="space-y-3">
              <div *ngFor="let link of paginatedLinkClicks" class="space-y-1">
                <div class="flex justify-between items-center text-xs sm:text-sm font-sans font-normal">
                  <span [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-600'">{{ link.name }}</span>
                  <span [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-600'">{{ link.count }} clics</span>
                </div>
                <div class="h-1.5 rounded-full overflow-hidden p-0"
                     [ngClass]="isDark ? 'bg-neutral-800/80' : 'bg-neutral-200/60'">
                  <div class="h-full rounded-full transition-all duration-800 ease-out"
                       [style.width.%]="getLinkPct(link.count)"
                       [ngClass]="isDark ? 'bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)]' : 'bg-neutral-900'"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination Bar -->
          <div *ngIf="totalLinkPages > 1" class="flex items-center justify-between pt-3 mt-3 border-t"
               [ngClass]="isDark ? 'border-neutral-800/80 text-white' : 'border-neutral-100 text-neutral-700'">
            <span class="text-xs font-sans font-normal"
                  [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-600'">
              Página {{ linkPage }} de {{ totalLinkPages }}
            </span>
            <div class="flex items-center gap-1.5">
              <button (click)="prevLinkPage()" [disabled]="linkPage === 1"
                      class="w-6 h-6 rounded-full flex items-center justify-center border text-xs font-sans font-normal transition-all duration-200 disabled:opacity-30 cursor-pointer shadow-xs"
                      [ngClass]="isDark ? 'border-neutral-700 text-neutral-300 hover:bg-white hover:text-black' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-100'">
                ‹
              </button>
              <button (click)="nextLinkPage()" [disabled]="linkPage === totalLinkPages"
                      class="w-6 h-6 rounded-full flex items-center justify-center border text-xs font-sans font-normal transition-all duration-200 disabled:opacity-30 cursor-pointer shadow-xs"
                      [ngClass]="isDark ? 'border-neutral-700 text-neutral-300 hover:bg-white hover:text-black' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-100'">
                ›
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- ═══════════════════════ CHARTS ROW 2 ═══════════════════════ -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <!-- Weekly Sparkline -->
        <div class="rounded-[28px] border p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
             [ngClass]="isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-neutral-200/80'">
          <div>
            <div class="flex justify-between items-center mb-6">
              <div class="flex items-center gap-2.5">
                <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                <h4 class="text-xs sm:text-sm font-headline font-bold uppercase tracking-wider"
                    [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Tendencia Semanal</h4>
              </div>
              <span class="text-[10px] font-headline font-semibold uppercase tracking-wider px-3 py-1 rounded-full border border-blue-500/30 text-blue-400 bg-blue-500/10">
                Actividad Reciente
              </span>
            </div>
            <div class="w-full h-36 relative">
              <svg class="w-full h-full" viewBox="0 0 600 120" preserveAspectRatio="none">
                <!-- Grid lines -->
                <line x1="0" y1="20" x2="600" y2="20" stroke-width="1" [attr.stroke]="isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'"></line>
                <line x1="0" y1="60" x2="600" y2="60" stroke-width="1" [attr.stroke]="isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'"></line>
                <line x1="0" y1="100" x2="600" y2="100" stroke-width="1" [attr.stroke]="isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'"></line>
                <!-- Area fill -->
                <path d="M0,90 C80,55 140,35 200,70 C260,105 320,20 390,20 C450,20 510,80 600,50 L600,120 L0,120 Z"
                      [attr.fill]="isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'"></path>
                <!-- Line -->
                <path d="M0,90 C80,55 140,35 200,70 C260,105 320,20 390,20 C450,20 510,80 600,50"
                      fill="none" stroke-width="3" stroke-linecap="round"
                      [attr.stroke]="isDark ? '#ffffff' : '#09090b'"></path>
              </svg>
            </div>
            <div class="flex justify-between text-[10px] font-headline font-semibold uppercase tracking-wider mt-3 px-2"
                 [ngClass]="isDark ? 'text-white/80' : 'text-neutral-500'">
              <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
            </div>
          </div>
        </div>

        <!-- Server Status -->
        <div class="rounded-[28px] border p-6 sm:p-7 transition-all duration-300 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
             [ngClass]="isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-neutral-200/80'">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-2.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <h4 class="text-xs sm:text-sm font-headline font-bold uppercase tracking-wider"
                  [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Estado del Servidor</h4>
            </div>
            <span class="text-[10px] font-headline font-semibold uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
              Operacional
            </span>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div *ngFor="let stat of serverStats"
                 class="rounded-2xl p-3.5 sm:p-4 border transition-all duration-300 hover:scale-[1.01] shadow-xs"
                 [ngClass]="isDark ? 'bg-neutral-950/80 border-neutral-800/90' : 'bg-neutral-50 border-neutral-200/80'">
              <p class="text-xs font-sans font-normal mb-1"
                 [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-600'">{{ stat.label }}</p>
              <div class="flex items-center gap-1.5">
                <span *ngIf="stat.dot" class="w-2 h-2 rounded-full bg-blue-500 animate-pulse flex-shrink-0"></span>
                <p class="text-xs sm:text-sm font-sans font-normal"
                   [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-600'">{{ stat.value }}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Actions -->
      <div class="flex justify-end pt-2">
        <button (click)="resetMetrics()"
                class="px-6 py-2.5 rounded-full text-xs font-headline font-semibold uppercase tracking-wider border transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
                [ngClass]="isDark ? 'border-neutral-800 text-neutral-400 hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/10' : 'border-neutral-200 text-neutral-600 hover:border-red-300 hover:text-red-600 hover:bg-red-50'">
          Reiniciar Métricas
        </button>
      </div>
    </div>

    <!-- Modal de Sesión Expirada (sin botón de cierre) -->
    <div *ngIf="showSessionExpiredModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
      <div class="w-full max-w-md rounded-2xl border p-6 md:p-8 text-center shadow-2xl scale-in"
           [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'">
        <div class="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold tracking-tight mb-2">Tu sesión ha expirado</h3>
        <p class="text-sm mb-6 opacity-75 animate-pulse" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
          Por seguridad, tu sesión ha sido cerrada automáticamente. Por favor, inicia sesión nuevamente para continuar administrando tu portafolio.
        </p>
        <button (click)="goToLogin()"
                class="w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-all duration-200 cursor-pointer shadow-lg shadow-blue-500/25">
          Iniciar sesión de nuevo
        </button>
      </div>
    </div>
    </ng-container>

    <!-- ═══════════════════════ SKELETON LOADER ═══════════════════════ -->
    <ng-template #skeleton>
      <div class="space-y-6">
        
        <!-- Skeleton Banner -->
        <div class="rounded-2xl border p-6 md:p-10 min-h-[280px] flex flex-col justify-center animate-pulse"
             [ngClass]="isDark ? 'bg-neutral-900/40 border-neutral-800/50' : 'bg-neutral-100/50 border-neutral-200/50'">
          <div class="max-w-[75%] md:max-w-[60%] space-y-4">
            <div class="h-3 w-24 rounded-full" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-300'"></div>
            <div class="h-8 md:h-10 w-3/4 rounded-lg" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-300'"></div>
            <div class="h-5 w-48 rounded-md" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-300'"></div>
            <div class="flex flex-wrap gap-2 pt-4">
              <div class="h-8 w-28 rounded-full" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-300'"></div>
              <div class="h-8 w-36 rounded-full" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-300'"></div>
              <div class="h-8 w-32 rounded-full" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-300'"></div>
            </div>
          </div>
        </div>

        <!-- Skeleton AI Command Center -->
        <div class="rounded-2xl border p-6 animate-pulse"
             [ngClass]="isDark ? 'bg-neutral-900/40 border-neutral-800/50' : 'bg-neutral-100/50 border-neutral-200/50'">
          <div class="flex gap-3 mb-4">
            <div class="w-7 h-7 rounded-full" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-300'"></div>
            <div class="h-6 w-48 rounded-lg" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-300'"></div>
          </div>
          <div class="h-4 w-3/4 rounded-md mb-4" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-300'"></div>
          <div class="h-12 w-full rounded-xl" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-300'"></div>
          <div class="flex gap-2 mt-4">
            <div class="h-6 w-24 rounded-full" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-300'"></div>
            <div class="h-6 w-32 rounded-full" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-300'"></div>
            <div class="h-6 w-32 rounded-full" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-300'"></div>
          </div>
        </div>

        <!-- Skeleton Metric Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div *ngFor="let _ of [1,2,3,4]" class="rounded-2xl border p-5 animate-pulse h-32"
               [ngClass]="isDark ? 'bg-neutral-900/40 border-neutral-800/50' : 'bg-neutral-100/50 border-neutral-200/50'">
            <div class="flex justify-between items-start mb-3">
              <div class="h-3 w-20 rounded-full" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-300'"></div>
              <div class="h-8 w-8 rounded-xl" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-300'"></div>
            </div>
            <div class="h-10 w-24 rounded-lg mt-2" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-300'"></div>
            <div class="h-3 w-32 rounded-full mt-3" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-300'"></div>
          </div>
        </div>
        
      </div>
    </ng-template>
  `,
  styles: [`
    .tab-enter { animation: tabEnter 0.25s ease-out forwards; }
    @keyframes tabEnter {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .animate-dropdown {
      animation: dropdownIn 0.15s ease-out forwards;
    }
    @keyframes dropdownIn {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .scale-in {
      animation: scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    @keyframes scaleIn {
      from { transform: scale(0.95); opacity: 0; }
      to   { transform: scale(1); opacity: 1; }
    }
  `]
})
export class DashHomeComponent implements OnInit, OnDestroy {
  @Input() theme = 'light';
  @Output() tabChange = new EventEmitter<string>();

  private analyticsService = inject(AnalyticsService);
  private itineraryService = inject(ItineraryService);
  private sessionTimer = inject(SessionTimerService);
  private router = inject(Router);

  metrics!: SystemMetrics;
  currentDate = '';
  currentTime = '';
  isLoading = true;
  private metricsLoaded = false;
  private itineraryLoaded = false;
  unreadMessages = 0;
  pendingLeads = 0;
  private clockInterval: any;

  // Session Expire Properties
  sessionTimeFormatted = '';
  sessionIsWarning = false;
  showSessionExpiredModal = false;
  private sessionSub!: Subscription;
  private sessionExpiredSub!: Subscription;

  itineraryNotifs: any = { unseen: 0, current: [], upcoming: [], overdue: [], no_time: [] };

  get isDark() { return this.theme === 'dark'; }

  // AI Search & Typewriter State
  aiQuery = '';
  aiResults: any[] = [];
  aiOpen = false;
  searchFocused = false;
  displayPlaceholder = '';

  private placeholders = [
    'Buscar vistas del sistema...',
    'Buscar mensajes pendientes...',
    'Consultar estado del servidor...',
    'Buscar usuarios registrados...',
    'Consultar métricas de tráfico...',
  ];
  private placeholderIdx = 0;
  private charIdx = 0;
  private typeInterval: any;
  private pauseTimeout: any;

  metricCards: any[] = [];
  sectionViewsArray: { name: string; views: number }[] = [];
  linkClicksArray: { name: string; count: number }[] = [];

  // Paginación Sobria
  sectionPage = 1;
  linkPage = 1;
  itemsPerPage = 4;

  get totalSectionPages(): number {
    return Math.max(1, Math.ceil((this.sectionViewsArray.length || 0) / this.itemsPerPage));
  }

  get paginatedSectionViews() {
    const start = (this.sectionPage - 1) * this.itemsPerPage;
    return this.sectionViewsArray.slice(start, start + this.itemsPerPage);
  }

  get totalLinkPages(): number {
    return Math.max(1, Math.ceil((this.linkClicksArray.length || 0) / this.itemsPerPage));
  }

  get paginatedLinkClicks() {
    const start = (this.linkPage - 1) * this.itemsPerPage;
    return this.linkClicksArray.slice(start, start + this.itemsPerPage);
  }

  nextSectionPage() {
    if (this.sectionPage < this.totalSectionPages) this.sectionPage++;
  }

  prevSectionPage() {
    if (this.sectionPage > 1) this.sectionPage--;
  }

  nextLinkPage() {
    if (this.linkPage < this.totalLinkPages) this.linkPage++;
  }

  prevLinkPage() {
    if (this.linkPage > 1) this.linkPage--;
  }

  serverStats = [
    { label: 'Estado de API', value: '99.98% ONLINE', dot: true },
    { label: 'Uso de Memoria', value: '242 MB / 512 MB', dot: false },
    { label: 'Ping de Red', value: '42 ms', dot: false },
    { label: 'Sesiones Activas', value: '4 Concurrentes', dot: false },
  ];

  ngOnInit() {
    this.analyticsService.getMetrics().subscribe({
      next: (m) => {
        if (m) {
          this.metrics = m;
          this.buildCards();
          this.buildArrays();
        }
        this.metricsLoaded = true;
        this.checkLoading();
      },
      error: () => {
        this.metricsLoaded = true;
        this.checkLoading();
      }
    });
    this.loadBadges();
    this.loadItineraryToday();
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);

    // Start typewriter
    this.startTypewriter();

    // Session Countdown subscription
    this.sessionSub = this.sessionTimer.sessionTimeLeft$.subscribe(seconds => {
      if (seconds <= 0) {
        this.sessionTimeFormatted = 'Expirada';
        this.sessionIsWarning = true;
      } else {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        this.sessionTimeFormatted = h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
        this.sessionIsWarning = seconds < 900; // Warning a falta de 15 minutos
      }
    });

    // Session Expired Event subscription
    this.sessionExpiredSub = this.sessionTimer.sessionExpired$.subscribe(() => {
      this.showSessionExpiredModal = true;
    });
  }

  ngOnDestroy() {
    clearInterval(this.clockInterval);
    clearInterval(this.typeInterval);
    clearTimeout(this.pauseTimeout);
    if (this.sessionSub) this.sessionSub.unsubscribe();
    if (this.sessionExpiredSub) this.sessionExpiredSub.unsubscribe();
  }

  goToLogin() {
    this.showSessionExpiredModal = false;
    this.router.navigate(['/login']);
  }

  private updateClock() {
    const now = new Date();
    this.currentDate = now.toLocaleDateString('es-CO', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    this.currentTime = now.toLocaleTimeString('es-CO', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }

  private buildCards() {
    if (!this.metrics) return;
    const avgLoad = this.getAvgLoad();
    this.metricCards = [
      { label: 'Vistas del Home', value: this.metrics.homeViews || 0, sublabel: 'Página Principal', iconPath: 'eye' },
      { label: 'Vistas Linktree', value: this.metrics.linktreeViews || 0, sublabel: 'Sección /links', iconPath: 'link' },
      { label: 'Consultas Rotbot', value: this.metrics.rotbotOpens || 0, sublabel: `${this.metrics.rotbotMessagesSent || 0} mensajes`, iconPath: 'chat' },
      { label: 'Carga Promedio', value: `${avgLoad}ms`, sublabel: 'Tiempo de respuesta', iconPath: 'bolt' },
    ];
  }

  private buildArrays() {
    if (!this.metrics) return;
    const secViews = this.metrics.sectionViews || {};
    this.sectionViewsArray = Object.entries(secViews)
      .map(([name, views]) => ({ name, views: Number(views) || 0 }))
      .sort((a, b) => b.views - a.views);

    const linkClicks = this.metrics.linktreeClicks || {};
    this.linkClicksArray = Object.entries(linkClicks)
      .map(([name, count]) => ({ name, count: Number(count) || 0 }))
      .sort((a, b) => b.count - a.count);
  }

  private loadBadges() {
    try {
      const msgs = JSON.parse(localStorage.getItem('portalink_admin_messages') || '[]');
      const leads = JSON.parse(localStorage.getItem('portalink_admin_leads') || '[]');
      this.unreadMessages = msgs.filter((m: any) => !m.read).length;
      this.pendingLeads = leads.filter((l: any) => l.status === 'Pendiente').length;
    } catch { }
  }

  private getAvgLoad() {
    if (!this.metrics.loadTimes?.length) return 150;
    const sum = this.metrics.loadTimes.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.metrics.loadTimes.length);
  }

  getSectionPct(views: number) {
    const total = this.sectionViewsArray.reduce((s, i) => s + i.views, 0);
    return total === 0 ? 0 : (views / total) * 100;
  }

  getLinkPct(count: number) {
    const total = this.linkClicksArray.reduce((s, i) => s + i.count, 0);
    return total === 0 ? 0 : (count / total) * 100;
  }

  resetMetrics() {
    if (confirm('¿Estás seguro de que deseas reiniciar todas las métricas?')) {
      this.analyticsService.resetMetrics();
      this.analyticsService.getMetrics().subscribe(m => {
          this.metrics = m;
          this.buildCards();
          this.buildArrays();
      });
    }
  }

  // --- AI Search Logic ---
  private startTypewriter() {
    this.typeInterval = setInterval(() => {
      if (this.aiQuery || this.searchFocused) return;
      const target = this.placeholders[this.placeholderIdx];
      if (this.charIdx < target.length) {
        this.displayPlaceholder = target.substring(0, this.charIdx + 1);
        this.charIdx++;
      } else {
        clearInterval(this.typeInterval);
        this.pauseTimeout = setTimeout(() => {
          const eraseInterval = setInterval(() => {
            if (this.charIdx > 0) {
              this.charIdx--;
              this.displayPlaceholder = target.substring(0, this.charIdx);
            } else {
              clearInterval(eraseInterval);
              this.placeholderIdx = (this.placeholderIdx + 1) % this.placeholders.length;
              this.startTypewriter();
            }
          }, 25);
        }, 1800);
      }
    }, 65);
  }

  onSearch() {
    const q = this.aiQuery.toLowerCase().trim();
    if (!q) {
      this.aiResults = [];
      this.aiOpen = false;
      return;
    }

    const messages = JSON.parse(localStorage.getItem('portalink_admin_messages') || '[]');
    const leads = JSON.parse(localStorage.getItem('portalink_admin_leads') || '[]');
    const users = JSON.parse(localStorage.getItem('portalink_admin_users') || '[]');

    const unread = messages.filter((m: any) => !m.read).length;
    const pending = leads.filter((l: any) => l.status === 'Pendiente').length;

    const results: any[] = [];

    if (/vista|home|inicio|portafolio|principal/.test(q))
      results.push({ emoji: '👁', title: 'Vistas del Home', value: `${this.metrics.homeViews} visitas totales`, tab: 'dashboard' });

    if (/linktree|enlace|link/.test(q))
      results.push({ emoji: '🔗', title: 'Vistas Linktree', value: `${this.metrics.linktreeViews} visitas`, tab: 'dashboard' });

    if (/mensaje|correo|bandeja|mail/.test(q))
      results.push({ emoji: '✉️', title: 'Mensajes recibidos', value: `${unread} sin leer de ${messages.length} totales`, tab: 'messages' });

    if (/solicitud|plan|lead|cliente/.test(q))
      results.push({ emoji: '📋', title: 'Solicitudes de planes', value: `${pending} pendientes de respuesta`, tab: 'leads' });

    if (/usuario|user|registro/.test(q))
      results.push({ emoji: '👥', title: 'Usuarios registrados', value: `${users.length} usuarios en el sistema`, tab: 'users' });

    if (/server|servidor|salud|estado|online/.test(q))
      results.push({ emoji: '💚', title: 'Estado del Servidor', value: 'ONLINE · 99.98% uptime · Ping 42ms', tab: 'dashboard' });

    if (/rotbot|chat|ia|asistente|consulta/.test(q))
      results.push({ emoji: '🤖', title: 'Rotbot IA', value: `${this.metrics.rotbotOpens} sesiones · ${this.metrics.rotbotMessagesSent} mensajes`, tab: 'dashboard' });

    if (/analiti|tendencia|trafico|tráfico/.test(q))
      results.push({ emoji: '📈', title: 'Analíticas avanzadas', value: 'Distribución de tráfico y tendencias', tab: 'analytics' });

    if (/estadistic|sección|seccion|drill/.test(q))
      results.push({ emoji: '📊', title: 'Estadísticas por sección', value: 'Vista detallada con drill-down', tab: 'stats' });

    if (/reporte|export|resumen/.test(q))
      results.push({ emoji: '📄', title: 'Reportes', value: 'Exportar métricas y configuración', tab: 'reports' });

    if (results.length === 0 && q.length >= 2)
      results.push({ emoji: '🔍', title: 'Sin coincidencias', value: 'Prueba: vistas, mensajes, usuarios, servidor...' });

    this.aiResults = results;
    this.aiOpen = true;
  }

  onBlur() {
    setTimeout(() => {
      this.searchFocused = false;
      this.aiOpen = false;
    }, 200);
  }

  clearSearch() {
    this.aiQuery = '';
    this.aiResults = [];
    this.aiOpen = false;
  }

  selectResult(result: any) {
    if (result.tab) {
      this.tabChange.emit(result.tab);
    }
    this.clearSearch();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: Event) {
    const t = e.target as HTMLElement;
    if (!t.closest('.ai-search-container')) {
      this.aiOpen = false;
    }
  }

  loadItineraryToday() {
    this.itineraryService.getToday().subscribe({
      next: (res) => {
        if (res.ok) {
          this.itineraryNotifs = res;
          // Si hay notificaciones unseen, podríamos marcarlas todas como vistas
          // ya que el usuario abrió el dashboard. O dejarlas hasta que vaya al tab.
          if (res.unseen > 0) {
            // Optional: Auto-clear logic can go here.
          }
        }
        this.itineraryLoaded = true;
        this.checkLoading();
      },
      error: (err) => {
        console.error('Error loading itinerary notifs', err);
        this.itineraryLoaded = true;
        this.checkLoading();
      }
    });
  }

  private checkLoading() {
    if (this.metricsLoaded && this.itineraryLoaded) {
      // Un pequeño retraso para que la animación se aprecie (opcional pero hace que se sienta premium)
      setTimeout(() => {
        this.isLoading = false;
      }, 300);
    }
  }

  goToItinerary() {
    this.tabChange.emit('itinerary');
  }
}
