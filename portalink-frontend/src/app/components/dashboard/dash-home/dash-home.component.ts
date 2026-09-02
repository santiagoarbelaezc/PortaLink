import { Component, Input, OnInit, OnDestroy, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsService, SystemMetrics } from '../../../services/analytics.service';
import { ItineraryService } from '../../../services/itinerary.service';
import { SessionTimerService } from '../../../services/session-timer.service';
import { FinanceService } from '../../../services/finance.service';
import { CommandCenterService, CommandCenterResponse, RadarResponse, RadarInsight, RecentAccess } from '../../../services/command-center.service';
import { AudioRecorderService, RecordedAudio } from '../../../services/audio-recorder.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dash-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <ng-container *ngIf="!isLoading; else skeleton">
      <div class="space-y-4 xs:space-y-5 sm:space-y-6 tab-enter font-sans">

        <!-- ═══════════════════════ 1. WELCOME BANNER ═══════════════════════ -->
        <div class="relative overflow-hidden rounded-2xl sm:rounded-3xl border p-5 xs:p-6 sm:p-8 md:p-9 min-h-[200px] xs:min-h-[220px] sm:min-h-[240px] flex flex-col justify-center transition-all duration-300 shadow-sm group"
             [ngClass]="isDark ? 'bg-[#0c0c0e] border-neutral-800' : 'bg-white border-neutral-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.03)]'">

          <!-- Subtle Background Ambient Glow -->
          <div *ngIf="isDark" class="absolute -top-24 -left-24 w-80 h-80 bg-white/[0.02] rounded-full blur-3xl pointer-events-none"></div>
          <div *ngIf="isDark" class="absolute -bottom-24 right-1/4 w-80 h-80 bg-white/[0.015] rounded-full blur-3xl pointer-events-none"></div>

          <!-- Rotbot 3D Flotando con efecto premium -->
          <div class="absolute right-1 sm:right-2 md:right-8 top-0 bottom-0 hidden sm:flex items-center justify-center pointer-events-none select-none py-4 sm:py-6 w-[180px] sm:w-[220px] md:w-[320px]">
            <img src="assets/images/rotbot4.png" class="h-full w-full object-contain opacity-60 sm:opacity-95 transition-transform duration-500 group-hover:scale-[1.02]" alt="Rotbot">
          </div>

          <div class="relative z-10 max-w-full sm:max-w-[75%] md:max-w-[62%] space-y-3">
            
            <!-- Top Tag: Panel de Control -->
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              <p class="text-[10px] xs:text-xs font-mono font-semibold uppercase tracking-[0.25em]"
                 [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                Panel de Control
              </p>
            </div>

            <!-- Greeting H2 (Buenos Días Santi / Buenas Tardes Santi / Buenas Noches Santi, + Frase Rotativa) -->
            <h2 class="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-headline font-bold leading-tight tracking-tight"
                [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              <span>{{ greetingText }}, </span>
              <span class="inline-block transition-all duration-300 ease-out"
                    [class.opacity-0]="isPhraseFading"
                    [class.-translate-y-1]="isPhraseFading"
                    [class.opacity-100]="!isPhraseFading"
                    [class.translate-y-0]="!isPhraseFading">
                {{ currentRotatingPhrase }}
              </span>
            </h2>

            <!-- Fecha y Hora: Estilo de texto original sin cápsula -->
            <p class="text-[11px] xs:text-xs sm:text-sm mt-1 mb-3 xs:mb-4 sm:mb-5 flex items-baseline gap-1.5 xs:gap-2 font-headline"
               [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
               <span>{{ currentDate }}</span>
               <span class="text-xs xs:text-sm md:text-base font-semibold" [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-700'">{{ currentTime }}</span>
            </p>

            <!-- Quick Chips (Vistas, Mensajes, Online, Sesión) perfectamente alineados -->
            <div class="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap items-center relative z-10">
              <!-- 1. Vistas -->
              <span class="h-8 px-3.5 rounded-full border inline-flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold tracking-wide transition-all select-none"
                    [ngClass]="isDark ? 'bg-[#141419] border-neutral-800 text-neutral-300' : 'border-neutral-200 text-neutral-700 bg-neutral-100/80'">
                <svg class="w-3.5 h-3.5 shrink-0 opacity-70 block" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span class="leading-none whitespace-nowrap">{{ (metrics.homeViews || 0) + (metrics.linktreeViews || 0) }} Vistas</span>
              </span>

              <!-- 2. Mensajes -->
              <span class="h-8 px-3.5 rounded-full border inline-flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold tracking-wide transition-all select-none"
                    [ngClass]="isDark ? 'bg-[#141419] border-neutral-800 text-neutral-300' : 'border-neutral-200 text-neutral-700 bg-neutral-100/80'">
                <svg class="w-3.5 h-3.5 shrink-0 opacity-70 block" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span class="leading-none whitespace-nowrap">{{ unreadMessages }} Mensajes</span>
              </span>

              <!-- 3. Online -->
              <span class="h-8 px-3.5 rounded-full border inline-flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold tracking-wide transition-all select-none"
                    [ngClass]="isDark ? 'bg-[#141419] border-neutral-800 text-neutral-200' : 'border-emerald-200 text-emerald-800 bg-emerald-50/80'">
                <span class="w-2 h-2 rounded-full bg-emerald-400 shrink-0 block"></span>
                <span class="leading-none whitespace-nowrap">Online</span>
              </span>

              <!-- 4. Sesión -->
              <span class="h-8 px-3.5 rounded-full border inline-flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold tracking-wide transition-all select-none"
                    [ngClass]="sessionIsWarning ? 
                      (isDark ? 'border-amber-500/40 text-amber-400 bg-amber-500/10 animate-pulse' : 'border-amber-300 text-amber-800 bg-amber-50/80 animate-pulse') : 
                      (isDark ? 'bg-[#141419] border-neutral-800 text-neutral-300' : 'border-neutral-200 text-neutral-700 bg-neutral-100/80')">
                <svg class="w-3.5 h-3.5 shrink-0 opacity-70 block" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="leading-none whitespace-nowrap">{{ sessionTimeFormatted }}</span>
              </span>
            </div>

          </div>
        </div>

        <!-- ═══════════════════════ 2. CENTRO DE COMANDO IA (DISEÑO ORIGINAL ELEVADO) ═══════════════════════ -->
        <div class="rounded-[20px] xs:rounded-[24px] sm:rounded-[28px] border p-4 xs:p-5 sm:p-6 md:p-7 transition-all duration-300 relative overflow-hidden space-y-4"
             [ngClass]="isDark ? 'bg-neutral-900/70 border-neutral-800 shadow-[0_10px_35px_rgba(0,0,0,0.4)]' : 'bg-white border-neutral-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.03)]'">
          
          <!-- Header Clásico (Equilibrado & Elegante) -->
          <div class="flex items-center justify-between flex-wrap gap-2.5">
            <div class="flex items-center gap-2.5 xs:gap-3">
              <img [src]="isDark ? 'assets/icons/logo-link-dark.png' : 'assets/icons/logo-link-light.png'" alt="AI Icon" class="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0">
              <div>
                <h3 class="text-base xs:text-lg sm:text-xl font-headline font-bold tracking-tight m-0 leading-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                  Centro de Comando IA
                </h3>
                <p class="text-[11px] xs:text-xs sm:text-[13px] font-sans text-neutral-400 dark:text-neutral-500 m-0 mt-0.5">
                  Pregúntale a nuestro motor inteligente para analizar métricas, finanzas o navegar el dashboard
                </p>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-headline font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 shadow-2xs">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Gemini Flash
              </span>
            </div>
          </div>

          <!-- Barra de Búsqueda Principal (Equilibrada con Lupa Visible) -->
          <div class="relative flex items-center w-full">
            <div class="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none z-10"
                 [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
              <svg *ngIf="!isAiSearching" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <svg *ngIf="isAiSearching" class="animate-spin w-5 h-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>

            <input type="text"
                   [(ngModel)]="aiQuery"
                   (keyup.enter)="askGeminiCommand()"
                   [disabled]="isAiSearching"
                   [placeholder]="isAiSearching ? 'Analizando el sistema con Gemini...' : displayPlaceholder"
                   class="w-full pl-11 sm:pl-12 pr-32 sm:pr-40 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl border text-xs sm:text-sm transition-all duration-300 outline-none font-sans"
                   [ngClass]="isDark ? 'bg-neutral-950/85 border-neutral-800 text-white focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600/20' : 'bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-neutral-400 focus:bg-white focus:ring-1 focus:ring-neutral-400/20'">
            
            <div class="absolute right-1.5 sm:right-2 flex items-center gap-1">
              <button *ngIf="aiQuery && !isAiSearching && !isVoiceRecording"
                      (click)="aiQuery = ''; activeAiResponse = null;"
                      class="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <!-- Botón de Micrófono (Voz Universal con Gemini) -->
              <button (click)="toggleVoiceInput()"
                      [disabled]="isAiSearching || isAiVoiceProcessing"
                      class="relative p-2 sm:p-2.5 rounded-xl transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      [ngClass]="isVoiceRecording
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/40 scale-110'
                        : isAiVoiceProcessing
                          ? 'bg-blue-500 text-white animate-pulse'
                          : isDark ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'"
                      [title]="isVoiceRecording ? 'Detener y procesar audio' : 'Activar comando de voz con Gemini'">
                
                <!-- Ondas de pulso concéntricas cuando graba -->
                <span *ngIf="isVoiceRecording" class="absolute inset-0 rounded-xl animate-ping bg-red-500/40"></span>

                <!-- Ícono de micrófono o spinner procesando -->
                <svg *ngIf="!isAiVoiceProcessing" class="w-4 h-4 sm:w-4.5 sm:h-4.5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <svg *ngIf="isAiVoiceProcessing" class="animate-spin w-4 h-4 sm:w-4.5 sm:h-4.5 text-white relative z-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </button>

              <button (click)="askGeminiCommand()"
                      [disabled]="isAiSearching || !aiQuery.trim() || isVoiceRecording || isAiVoiceProcessing"
                      class="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-headline font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs active:scale-95"
                      [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-900 text-white hover:bg-neutral-800'">
                {{ (isAiSearching || isAiVoiceProcessing) ? '...' : 'Preguntar' }}
              </button>
            </div>

            <!-- Visualizador de Onda de Audio en Tiempo Real (Micrófono Activo) -->
            <div *ngIf="isVoiceRecording" 
                 class="absolute -bottom-8 left-0 right-0 flex items-center justify-center gap-2.5 animate-dropdown">
              <div class="flex items-end gap-[3px] h-5 px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                <span class="w-1 rounded-full bg-red-500 transition-all duration-75" [style.height.px]="getWaveBarHeight(0)"></span>
                <span class="w-1 rounded-full bg-red-500 transition-all duration-75" [style.height.px]="getWaveBarHeight(1)"></span>
                <span class="w-1 rounded-full bg-red-500 transition-all duration-75" [style.height.px]="getWaveBarHeight(2)"></span>
                <span class="w-1 rounded-full bg-red-500 transition-all duration-75" [style.height.px]="getWaveBarHeight(3)"></span>
                <span class="w-1 rounded-full bg-red-500 transition-all duration-75" [style.height.px]="getWaveBarHeight(4)"></span>
              </div>
              <span class="text-[10px] sm:text-[11px] font-headline font-semibold text-red-500 uppercase tracking-wider animate-pulse">
                Escuchando audio... (habla o pulsa para enviar)
              </span>
            </div>

            <!-- Indicador de Procesamiento IA del Audio -->
            <div *ngIf="isAiVoiceProcessing" 
                 class="absolute -bottom-8 left-0 right-0 flex items-center justify-center gap-2 animate-dropdown">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
              <span class="text-[10px] sm:text-[11px] font-headline font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wider">
                Gemini interpretando tu audio...
              </span>
            </div>

            <!-- Toast de Error de Voz -->
            <div *ngIf="voiceErrorMessage"
                 class="absolute -bottom-8 left-0 right-0 flex items-center justify-center animate-dropdown">
              <span class="text-[10px] sm:text-[11px] font-sans text-amber-500 dark:text-amber-400 bg-amber-500/10 px-3 py-0.5 rounded-full border border-amber-500/20">
                ⚠ {{ voiceErrorMessage }}
              </span>
            </div>
          </div>

          <!-- ══════ TARJETAS MONOCROMÁTICAS DE ACCESOS & MÓDULOS (ESTILO EJECUTIVO) ══════ -->
          <div *ngIf="!activeAiResponse" class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-4 pt-1">
            
            <!-- Card 1: Finanzas -->
            <div (click)="navigateToTab('finances')"
                 class="group rounded-[18px] xs:rounded-[20px] sm:rounded-[22px] border p-3.5 xs:p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:border-neutral-400 dark:hover:border-neutral-600 hover:shadow-md cursor-pointer active:scale-98"
                 [ngClass]="isDark ? 'bg-neutral-950/70 border-neutral-800' : 'bg-white border-neutral-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.02)]'">
              <div class="flex items-center justify-between">
                <span class="text-[9px] xs:text-[10px] sm:text-[11px] font-headline font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 truncate">
                  Finanzas & Cobros
                </span>
                <div class="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 border"
                     [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-300' : 'bg-neutral-100 border-neutral-200 text-neutral-700'">
                  <svg class="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div class="mt-2.5 mb-1.5">
                <h4 class="text-base xs:text-lg sm:text-xl font-headline font-bold tracking-tight m-0 leading-tight truncate"
                    [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                  Finanzas
                </h4>
              </div>
              <div class="flex items-center justify-between text-[10px] sm:text-[11px] text-neutral-400 dark:text-neutral-500 font-sans pt-1 border-t"
                   [ngClass]="isDark ? 'border-neutral-800/80' : 'border-neutral-100'">
                <span class="truncate">Cartera & Facturación</span>
                <span class="font-headline font-bold text-neutral-900 dark:text-white group-hover:translate-x-0.5 transition-transform ml-1">→</span>
              </div>
            </div>

            <!-- Card 2: Biblioteca -->
            <div (click)="navigateToTab('library')"
                 class="group rounded-[18px] xs:rounded-[20px] sm:rounded-[22px] border p-3.5 xs:p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:border-neutral-400 dark:hover:border-neutral-600 hover:shadow-md cursor-pointer active:scale-98"
                 [ngClass]="isDark ? 'bg-neutral-950/70 border-neutral-800' : 'bg-white border-neutral-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.02)]'">
              <div class="flex items-center justify-between">
                <span class="text-[9px] xs:text-[10px] sm:text-[11px] font-headline font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 truncate">
                  Biblioteca
                </span>
                <div class="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 border"
                     [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-300' : 'bg-neutral-100 border-neutral-200 text-neutral-700'">
                  <svg class="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <div class="mt-2.5 mb-1.5">
                <h4 class="text-base xs:text-lg sm:text-xl font-headline font-bold tracking-tight m-0 leading-tight truncate"
                    [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                  Biblioteca
                </h4>
              </div>
              <div class="flex items-center justify-between text-[10px] sm:text-[11px] text-neutral-400 dark:text-neutral-500 font-sans pt-1 border-t"
                   [ngClass]="isDark ? 'border-neutral-800/80' : 'border-neutral-100'">
                <span class="truncate">Cuadernos & Apuntes</span>
                <span class="font-headline font-bold text-neutral-900 dark:text-white group-hover:translate-x-0.5 transition-transform ml-1">→</span>
              </div>
            </div>

            <!-- Card 3: Itinerario -->
            <div (click)="navigateToTab('itinerary')"
                 class="group rounded-[18px] xs:rounded-[20px] sm:rounded-[22px] border p-3.5 xs:p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:border-neutral-400 dark:hover:border-neutral-600 hover:shadow-md cursor-pointer active:scale-98"
                 [ngClass]="isDark ? 'bg-neutral-950/70 border-neutral-800' : 'bg-white border-neutral-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.02)]'">
              <div class="flex items-center justify-between">
                <span class="text-[9px] xs:text-[10px] sm:text-[11px] font-headline font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 truncate">
                  Agenda & Tareas
                </span>
                <div class="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 border"
                     [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-300' : 'bg-neutral-100 border-neutral-200 text-neutral-700'">
                  <svg class="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div class="mt-2.5 mb-1.5">
                <h4 class="text-base xs:text-lg sm:text-xl font-headline font-bold tracking-tight m-0 leading-tight truncate"
                    [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                  Itinerario
                </h4>
              </div>
              <div class="flex items-center justify-between text-[10px] sm:text-[11px] text-neutral-400 dark:text-neutral-500 font-sans pt-1 border-t"
                   [ngClass]="isDark ? 'border-neutral-800/80' : 'border-neutral-100'">
                <span class="truncate">Tareas & Calendario</span>
                <span class="font-headline font-bold text-neutral-900 dark:text-white group-hover:translate-x-0.5 transition-transform ml-1">→</span>
              </div>
            </div>

            <!-- Card 4: Analíticas -->
            <div (click)="navigateToTab('analytics')"
                 class="group rounded-[18px] xs:rounded-[20px] sm:rounded-[22px] border p-3.5 xs:p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:border-neutral-400 dark:hover:border-neutral-600 hover:shadow-md cursor-pointer active:scale-98"
                 [ngClass]="isDark ? 'bg-neutral-950/70 border-neutral-800' : 'bg-white border-neutral-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.02)]'">
              <div class="flex items-center justify-between">
                <span class="text-[9px] xs:text-[10px] sm:text-[11px] font-headline font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 truncate">
                  Analíticas & Tráfico
                </span>
                <div class="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 border"
                     [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-300' : 'bg-neutral-100 border-neutral-200 text-neutral-700'">
                  <svg class="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div class="mt-2.5 mb-1.5">
                <h4 class="text-base xs:text-lg sm:text-xl font-headline font-bold tracking-tight m-0 leading-tight truncate"
                    [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                  Analíticas
                </h4>
              </div>
              <div class="flex items-center justify-between text-[10px] sm:text-[11px] text-neutral-400 dark:text-neutral-500 font-sans pt-1 border-t"
                   [ngClass]="isDark ? 'border-neutral-800/80' : 'border-neutral-100'">
                <span class="truncate">Métricas & Visitas</span>
                <span class="font-headline font-bold text-neutral-900 dark:text-white group-hover:translate-x-0.5 transition-transform ml-1">→</span>
              </div>
            </div>

          </div>

          <!-- ══════ RESPUESTA INTELIGENTE GEMINI (DISEÑO EJECUTIVO ELEVADO) ══════ -->
          <div *ngIf="activeAiResponse"
               class="rounded-[22px] sm:rounded-[26px] border p-4 sm:p-6 md:p-7 mt-2 animate-dropdown transition-all duration-300 shadow-xl space-y-4"
               [ngClass]="isDark ? 'bg-neutral-950/95 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900 shadow-[0_12px_45px_rgba(0,0,0,0.05)]'">
            
            <!-- Header de Respuesta -->
            <div class="flex items-center justify-between gap-3 pb-3 border-b"
                 [ngClass]="isDark ? 'border-neutral-800/80' : 'border-neutral-100'">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shadow-xs border"
                     [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-blue-400' : 'bg-neutral-100 border-neutral-200 text-neutral-900'">
                  <svg class="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h5 class="text-xs sm:text-sm md:text-base font-headline font-bold m-0 leading-tight">
                      Análisis de RotBot IA
                    </h5>
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-headline font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Gemini Flash
                    </span>
                  </div>
                  <span class="text-[11px] opacity-50 block mt-0.5 font-sans">Consulta: "{{ activeAiResponse.query }}"</span>
                </div>
              </div>

              <button (click)="activeAiResponse = null" 
                      class="p-1.5 rounded-xl border transition-colors cursor-pointer"
                      [ngClass]="isDark ? 'border-neutral-800 text-neutral-400 hover:bg-neutral-900 hover:text-white' : 'border-neutral-200 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'"
                      title="Cerrar análisis">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- 1. Resumen Ejecutivo (Callout Banner) -->
            <div *ngIf="activeAiResponse.data.summary"
                 class="rounded-xl border p-3.5 sm:p-4 flex items-start gap-3 border-l-4 border-l-blue-500 shadow-2xs"
                 [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800/90' : 'bg-neutral-50/90 border-neutral-200/90'">
              <div class="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p class="text-xs sm:text-sm font-headline font-semibold leading-relaxed m-0"
                 [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">
                {{ activeAiResponse.data.summary }}
              </p>
            </div>

            <!-- 2. Análisis Detallado de la IA -->
            <div class="rounded-xl border p-3.5 sm:p-4 relative overflow-hidden"
                 [ngClass]="isDark ? 'bg-neutral-900/40 border-neutral-800/80 text-neutral-300' : 'bg-neutral-50/50 border-neutral-200/80 text-neutral-700'">
              <div class="flex items-center gap-1.5 mb-2 text-[10px] sm:text-[11px] font-headline font-bold uppercase tracking-wider text-neutral-500">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Evaluación de la Base de Datos</span>
              </div>
              <p class="text-xs sm:text-sm font-sans font-normal leading-relaxed m-0 whitespace-pre-line">
                {{ activeAiResponse.data.analysis || activeAiResponse.data.reply }}
              </p>
            </div>

            <!-- 3. Métricas Clave (si aplican) -->
            <div *ngIf="activeAiResponse.data.metrics && activeAiResponse.data.metrics.length > 0"
                 class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div *ngFor="let m of activeAiResponse.data.metrics"
                   class="rounded-xl border p-2.5 text-center shadow-2xs"
                   [ngClass]="isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-white border-neutral-200'">
                <span class="text-[10px] opacity-50 block uppercase font-headline font-semibold truncate">{{ m.label }}</span>
                <span class="text-xs sm:text-sm font-headline font-bold truncate block mt-0.5"
                      [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ m.value }}</span>
              </div>
            </div>

            <!-- 4. Resultados Encontrados (Tarjetas Monocromáticas con Íconos Dedicados) -->
            <div *ngIf="activeAiResponse.data.items && activeAiResponse.data.items.length > 0" class="space-y-2 pt-1">
              <div class="flex items-center justify-between">
                <span class="text-[10px] sm:text-[11px] font-headline font-bold uppercase tracking-wider opacity-60">
                  Resultados Encontrados ({{ activeAiResponse.data.items.length }})
                </span>
                <span class="text-[10px] opacity-40 hidden sm:inline">Haz clic en una tarjeta para abrirla</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div *ngFor="let item of activeAiResponse.data.items"
                     (click)="navigateToTab(item.targetTab || activeAiResponse.data.targetTab)"
                     class="group rounded-2xl border p-3 sm:p-3.5 flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 hover:shadow-md active:scale-98 shadow-2xs"
                     [ngClass]="isDark ? 'bg-neutral-950/70 border-neutral-800' : 'bg-white border-neutral-200/90'">
                  
                  <div class="flex items-center gap-3 min-w-0">
                    <!-- Icono según tipo de resultado -->
                    <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border"
                         [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-300' : 'bg-neutral-100 border-neutral-200 text-neutral-700'">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="getItemIconPath(item)" />
                      </svg>
                    </div>

                    <div class="min-w-0">
                      <h6 class="text-xs sm:text-sm font-headline font-bold m-0 truncate leading-tight group-hover:text-blue-500 transition-colors"
                          [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                        {{ item.title }}
                      </h6>
                      <p class="text-[10px] sm:text-[11px] opacity-60 m-0 truncate leading-tight mt-1 font-sans">
                        {{ item.subtitle || item.details || 'Registro verificado' }}
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 shrink-0">
                    <span *ngIf="item.badge" 
                          class="text-[9px] sm:text-[10px] font-headline font-semibold px-2 py-0.5 rounded-full border shadow-2xs"
                          [ngClass]="getBadgeColorClass(item.badgeColor)">
                      {{ item.badge }}
                    </span>
                    <span class="text-xs font-bold text-neutral-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all">
                      →
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 5. Barra de Acción Principal / Redirección -->
            <div class="flex items-center justify-between pt-3 border-t flex-wrap gap-2.5"
                 [ngClass]="isDark ? 'border-neutral-800/80' : 'border-neutral-100'">
              <span class="text-[11px] opacity-50 font-sans">Acción recomendada:</span>
              <button (click)="navigateToTab(activeAiResponse.data.targetTab)"
                      class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-headline font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md hover:scale-102 active:scale-95"
                      [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-900 text-white hover:bg-neutral-800'">
                <span>{{ activeAiResponse.data.actionText || 'Ver en el Módulo' }}</span>
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>

          </div>

        </div>

        <!-- ═══════════════════════ 3. EXECUTIVE KPIS (2x2 GRID ON MOBILE) ═══════════════════════ -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-5">
          
          <!-- Card 1: Tráfico & Visitas -->
          <div (click)="navigateToTab('analytics')" 
               class="group rounded-[18px] xs:rounded-[20px] sm:rounded-[24px] border p-3.5 xs:p-4 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:border-neutral-500 shadow-[0_10px_35px_rgba(0,0,0,0.03)] cursor-pointer active:scale-98"
               [ngClass]="isDark ? 'bg-neutral-900/70 border-neutral-800 hover:bg-neutral-900' : 'bg-white border-neutral-200/80 hover:bg-neutral-50/50'">
            <div class="flex items-center justify-between mb-2 xs:mb-3 sm:mb-4">
              <span class="text-[10px] xs:text-xs font-headline font-semibold uppercase tracking-wider opacity-60 truncate">Tráfico Global</span>
              <div class="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-500 shrink-0">
                <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
              </div>
            </div>
            <div>
              <div class="flex items-baseline gap-1.5 xs:gap-2 flex-wrap">
                <h3 class="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-headline font-bold tracking-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                  {{ (metrics.homeViews || 0) + (metrics.linktreeViews || 0) }}
                </h3>
                <span class="text-[9px] xs:text-[10px] sm:text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-1 xs:px-1.5 py-0.5 rounded-full">+18.4%</span>
              </div>
              <p class="text-[10px] xs:text-xs mt-0.5 xs:mt-1 opacity-50 font-normal truncate">Visitas registradas</p>
            </div>
          </div>

          <!-- Card 2: Resumen Financiero -->
          <div (click)="navigateToTab('finances')" 
               class="group rounded-[18px] xs:rounded-[20px] sm:rounded-[24px] border p-3.5 xs:p-4 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:border-emerald-500/50 shadow-[0_10px_35px_rgba(0,0,0,0.03)] cursor-pointer active:scale-98"
               [ngClass]="isDark ? 'bg-neutral-900/70 border-neutral-800 hover:bg-neutral-900' : 'bg-white border-neutral-200/80 hover:bg-neutral-50/50'">
            <div class="flex items-center justify-between mb-2 xs:mb-3 sm:mb-4">
              <span class="text-[10px] xs:text-xs font-headline font-semibold uppercase tracking-wider opacity-60 truncate">Facturación</span>
              <div class="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-500 shrink-0">
                <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
            </div>
            <div>
              <div class="flex items-baseline gap-1.5 xs:gap-2 flex-wrap">
                <h3 class="text-base xs:text-lg sm:text-xl font-headline font-bold tracking-tight truncate text-emerald-500">
                  {{ formatCurrency(financeTotalPaid) }}
                </h3>
              </div>
              <p class="text-[10px] xs:text-xs mt-0.5 xs:mt-1 opacity-60 font-normal truncate">
                Pend: <span class="font-semibold text-amber-500">{{ formatCurrency(financeTotalPending) }}</span>
              </p>
            </div>
          </div>

          <!-- Card 3: Clientes Activos (Finanzas) -->
          <div (click)="navigateToTab('finances')" 
               class="group rounded-[18px] xs:rounded-[20px] sm:rounded-[24px] border p-3.5 xs:p-4 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:border-purple-500/50 shadow-[0_10px_35px_rgba(0,0,0,0.03)] cursor-pointer active:scale-98"
               [ngClass]="isDark ? 'bg-neutral-900/70 border-neutral-800 hover:bg-neutral-900' : 'bg-white border-neutral-200/80 hover:bg-neutral-50/50'">
            <div class="flex items-center justify-between mb-2 xs:mb-3 sm:mb-4">
              <span class="text-[10px] xs:text-xs font-headline font-semibold uppercase tracking-wider opacity-60 truncate">Clientes</span>
              <div class="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center bg-purple-500/10 text-purple-400 shrink-0">
                <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              </div>
            </div>
            <div>
              <div class="flex items-baseline gap-1.5 xs:gap-2 flex-wrap">
                <h3 class="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-headline font-bold tracking-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                  {{ totalClientsCount }}
                </h3>
                <span class="text-[9px] xs:text-[10px] sm:text-[11px] font-medium text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded-full">Finanzas</span>
              </div>
              <p class="text-[10px] xs:text-xs mt-0.5 xs:mt-1 opacity-50 font-normal truncate">Cartera en Finanzas</p>
            </div>
          </div>

          <!-- Card 4: Salud del Sistema -->
          <div (click)="navigateToTab('stats')" 
               class="group rounded-[18px] xs:rounded-[20px] sm:rounded-[24px] border p-3.5 xs:p-4 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:border-neutral-500 shadow-[0_10px_35px_rgba(0,0,0,0.03)] cursor-pointer active:scale-98"
               [ngClass]="isDark ? 'bg-neutral-900/70 border-neutral-800 hover:bg-neutral-900' : 'bg-white border-neutral-200/80 hover:bg-neutral-50/50'">
            <div class="flex items-center justify-between mb-2 xs:mb-3 sm:mb-4">
              <span class="text-[10px] xs:text-xs font-headline font-semibold uppercase tracking-wider opacity-60 truncate">Sistema</span>
              <div class="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center bg-cyan-500/10 text-cyan-400 shrink-0">
                <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
            </div>
            <div>
              <div class="flex items-baseline gap-1.5 xs:gap-2 flex-wrap">
                <h3 class="text-lg xs:text-xl sm:text-2xl font-headline font-bold tracking-tight text-cyan-400">
                  99.9%
                </h3>
                <span class="text-[9px] xs:text-[10px] opacity-60">Uptime</span>
              </div>
              <p class="text-[10px] xs:text-xs mt-0.5 xs:mt-1 opacity-50 font-normal truncate">Latencia: 42ms</p>
            </div>
          </div>

        </div>

        <!-- ═══════════════════════ 4. HIGH-PERFORMANCE CHARTS ROW ═══════════════════════ -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-5">

          <!-- Gráfica 1: Rendimiento & Tráfico Semanal -->
          <div class="rounded-[20px] xs:rounded-[24px] sm:rounded-[28px] border p-4 xs:p-5 sm:p-7 flex flex-col justify-between transition-all duration-300 shadow-[0_10px_35px_rgba(0,0,0,0.03)] min-h-[320px] xs:min-h-[340px] sm:min-h-[360px]"
               [ngClass]="isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-neutral-200/80'">
            <div>
              <div class="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <div class="flex items-center gap-2 mb-0.5">
                    <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <h4 class="text-xs sm:text-sm font-headline font-bold uppercase tracking-wider"
                        [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Rendimiento & Tráfico</h4>
                  </div>
                  <p class="text-[10px] xs:text-xs opacity-60">Últimos 7 días</p>
                </div>
                <button (click)="navigateToTab('analytics')" 
                        class="text-[9px] xs:text-[10px] font-headline font-semibold uppercase tracking-wider px-2.5 xs:px-3 py-1 rounded-full border transition-colors hover:scale-105 cursor-pointer shrink-0"
                        [ngClass]="isDark ? 'border-neutral-700 text-neutral-300 hover:bg-white hover:text-black' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-100'">
                  Analíticas →
                </button>
              </div>

              <!-- Vector Line Chart with Gradient Fill & Data Nodes -->
              <div class="w-full h-36 xs:h-40 sm:h-44 relative mt-1 xs:mt-2">
                <svg class="w-full h-full" viewBox="0 0 500 140" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.35"/>
                      <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.0"/>
                    </linearGradient>
                  </defs>
                  
                  <line x1="0" y1="25" x2="500" y2="25" stroke-width="1" [attr.stroke]="isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'"/>
                  <line x1="0" y1="65" x2="500" y2="65" stroke-width="1" [attr.stroke]="isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'"/>
                  <line x1="0" y1="105" x2="500" y2="105" stroke-width="1" [attr.stroke]="isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'"/>

                  <path [attr.d]="trafficAreaPath" fill="url(#trafficGrad)"/>
                  <path [attr.d]="trafficLinePath" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>

                  <circle *ngFor="let pt of trafficPoints" 
                          [attr.cx]="pt.x" 
                          [attr.cy]="pt.y" 
                          r="4" 
                          [attr.fill]="isDark ? '#0f172a' : '#ffffff'" 
                          stroke="#3b82f6" 
                          stroke-width="2.5"/>
                </svg>
              </div>

              <!-- Days Labels -->
              <div class="flex justify-between text-[9px] xs:text-[10px] sm:text-[11px] font-headline font-semibold uppercase tracking-wider mt-2 sm:mt-3 px-1"
                   [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                <span *ngFor="let day of weekDays">{{ day }}</span>
              </div>
            </div>

            <!-- Bottom Highlights -->
            <div class="grid grid-cols-3 gap-1.5 xs:gap-2 pt-3 mt-3 sm:pt-4 sm:mt-4 border-t"
                 [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-100'">
              <div class="text-center">
                <span class="text-[9px] xs:text-[10px] opacity-50 block uppercase">Promedio</span>
                <span class="text-xs sm:text-sm font-bold" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ avgDailyTraffic }}</span>
              </div>
              <div class="text-center">
                <span class="text-[9px] xs:text-[10px] opacity-50 block uppercase">Pico</span>
                <span class="text-xs sm:text-sm font-bold text-blue-500">{{ maxTraffic }}</span>
              </div>
              <div class="text-center">
                <span class="text-[9px] xs:text-[10px] opacity-50 block uppercase">Conversión</span>
                <span class="text-xs sm:text-sm font-bold text-emerald-500">{{ conversionRate }}%</span>
              </div>
            </div>

          </div>

          <!-- Gráfica 2: Flujo Financiero & Ingresos Mensuales -->
          <div class="rounded-[20px] xs:rounded-[24px] sm:rounded-[28px] border p-4 xs:p-5 sm:p-7 flex flex-col justify-between transition-all duration-300 shadow-[0_10px_35px_rgba(0,0,0,0.03)] min-h-[320px] xs:min-h-[340px] sm:min-h-[360px]"
               [ngClass]="isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-neutral-200/80'">
            <div>
              <div class="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <div class="flex items-center gap-2 mb-0.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <h4 class="text-xs sm:text-sm font-headline font-bold uppercase tracking-wider"
                        [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Flujo Financiero</h4>
                  </div>
                  <p class="text-[10px] xs:text-xs opacity-60">Histórico de facturación mensual</p>
                </div>
                <button (click)="navigateToTab('finances')" 
                        class="text-[9px] xs:text-[10px] font-headline font-semibold uppercase tracking-wider px-2.5 xs:px-3 py-1 rounded-full border transition-colors hover:scale-105 cursor-pointer shrink-0"
                        [ngClass]="isDark ? 'border-neutral-700 text-neutral-300 hover:bg-white hover:text-black' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-100'">
                  Finanzas →
                </button>
              </div>

              <!-- Bar Chart of Monthly Revenue & Payments -->
              <div class="w-full h-36 xs:h-40 sm:h-44 flex items-end justify-between gap-1.5 xs:gap-2.5 sm:gap-4 px-1 xs:px-2 pt-2 xs:pt-4 relative">
                <div *ngFor="let item of financialMonthlyBars" class="flex-1 flex flex-col items-center gap-1 xs:gap-1.5 h-full justify-end group">
                  <span class="text-[8px] xs:text-[9px] font-bold text-emerald-500 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    {{ item.formattedShort }}
                  </span>
                  <div class="w-full max-w-[22px] xs:max-w-[28px] rounded-t-md xs:rounded-t-lg transition-all duration-500 ease-out relative"
                       [style.height.%]="item.heightPct"
                       [ngClass]="isDark ? 'bg-emerald-500/80 group-hover:bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'bg-emerald-600 group-hover:bg-emerald-500'">
                  </div>
                  <span class="text-[9px] xs:text-[10px] font-headline font-semibold uppercase tracking-wider"
                        [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-600'">
                    {{ item.month }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Financial Summary Bar -->
            <div class="grid grid-cols-3 gap-1.5 xs:gap-2 pt-3 mt-3 sm:pt-4 sm:mt-4 border-t"
                 [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-100'">
              <div class="text-center">
                <span class="text-[9px] xs:text-[10px] opacity-50 block uppercase">Facturas</span>
                <span class="text-xs sm:text-sm font-bold" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ totalInvoicesCount }}</span>
              </div>
              <div class="text-center">
                <span class="text-[9px] xs:text-[10px] opacity-50 block uppercase">Tasa Cobro</span>
                <span class="text-xs sm:text-sm font-bold text-emerald-500">{{ collectionRate }}%</span>
              </div>
              <div class="text-center">
                <span class="text-[9px] xs:text-[10px] opacity-50 block uppercase">Balance</span>
                <span class="text-xs sm:text-sm font-bold text-emerald-400 truncate block">{{ formatCurrency(financeTotalPaid) }}</span>
              </div>
            </div>

          </div>

        </div>

        <!-- ═══════════════════════ 5. SERVER STATUS & ITINERARY ROW ═══════════════════════ -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-5">

          <!-- Server Status & CDN -->
          <div class="rounded-[20px] xs:rounded-[24px] sm:rounded-[28px] border p-4 xs:p-5 sm:p-7 transition-all duration-300 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
               [ngClass]="isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-neutral-200/80'">
            <div class="flex items-center justify-between mb-4 sm:mb-6">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <h4 class="text-xs sm:text-sm font-headline font-bold uppercase tracking-wider"
                    [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Infraestructura</h4>
              </div>
              <span class="text-[9px] xs:text-[10px] font-headline font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                100% Operacional
              </span>
            </div>
            
            <div class="grid grid-cols-2 gap-2 xs:gap-2.5 sm:gap-3">
              <div *ngFor="let stat of serverStats"
                   class="rounded-xl xs:rounded-2xl p-2.5 xs:p-3 sm:p-4 border transition-all duration-300 hover:scale-[1.01] shadow-xs"
                   [ngClass]="isDark ? 'bg-neutral-950/80 border-neutral-800/90' : 'bg-neutral-50 border-neutral-200/80'">
                <p class="text-[10px] xs:text-xs font-sans font-normal mb-0.5 opacity-60 truncate">{{ stat.label }}</p>
                <div class="flex items-center gap-1.5">
                  <span *ngIf="stat.dot" class="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
                  <p class="text-xs xs:text-sm font-headline font-bold truncate" [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">
                    {{ stat.value }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Agenda & Pending Tasks -->
          <div (click)="navigateToTab('itinerary')"
               class="rounded-[20px] xs:rounded-[24px] sm:rounded-[28px] border p-4 xs:p-5 sm:p-7 flex flex-col justify-between transition-all duration-300 shadow-[0_10px_35px_rgba(0,0,0,0.03)] cursor-pointer group hover:border-neutral-500 active:scale-99"
               [ngClass]="isDark ? 'bg-neutral-900/90 border-neutral-800 hover:bg-neutral-900' : 'bg-white border-neutral-200/80 hover:bg-neutral-50/50'">
            <div>
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                  <h4 class="text-xs sm:text-sm font-headline font-bold uppercase tracking-wider"
                      [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Agenda de Hoy</h4>
                </div>
                <span class="text-[9px] xs:text-[10px] font-headline font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
                      [ngClass]="isDark ? 'border-neutral-800 text-neutral-400 bg-neutral-950' : 'border-neutral-200 text-neutral-600 bg-neutral-100'">
                  Calendario →
                </span>
              </div>

              <!-- Tasks List Preview -->
              <div class="space-y-2">
                <div *ngIf="itineraryNotifs.current?.length > 0">
                  <div *ngFor="let task of itineraryNotifs.current.slice(0, 2)"
                       class="rounded-lg xs:rounded-xl border p-2.5 xs:p-3 flex items-center justify-between bg-blue-500/10 border-blue-500/30 text-blue-400">
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping shrink-0"></span>
                      <span class="text-xs font-semibold truncate">{{ task.title }}</span>
                    </div>
                    <span class="text-[10px] opacity-75 font-mono shrink-0 ml-2">{{ task.time }}</span>
                  </div>
                </div>

                <div *ngIf="itineraryNotifs.upcoming?.length > 0">
                  <div *ngFor="let task of itineraryNotifs.upcoming.slice(0, 2)"
                       class="rounded-lg xs:rounded-xl border p-2.5 xs:p-3 flex items-center justify-between"
                       [ngClass]="isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-300' : 'bg-neutral-50 border-neutral-200 text-neutral-700'">
                    <span class="text-xs font-medium truncate">{{ task.title }}</span>
                    <span class="text-[10px] opacity-50 font-mono shrink-0 ml-2">{{ task.time }}</span>
                  </div>
                </div>

                <div *ngIf="!itineraryNotifs.current?.length && !itineraryNotifs.upcoming?.length"
                     class="rounded-xl border p-3.5 text-center"
                     [ngClass]="isDark ? 'bg-neutral-950/60 border-neutral-800/80 text-neutral-400' : 'bg-neutral-50 border-neutral-200/80 text-neutral-600'">
                  <p class="text-xs font-medium m-0">No hay tareas pendientes para hoy</p>
                  <span class="text-[10px] opacity-60">¡Todo al día en tu itinerario!</span>
                </div>
              </div>
            </div>

            <div class="pt-3 mt-3 border-t flex items-center justify-between text-[11px] xs:text-xs"
                 [ngClass]="isDark ? 'border-neutral-800 text-neutral-400' : 'border-neutral-100 text-neutral-600'">
              <span class="truncate">Prioridades del día</span>
              <span class="font-bold text-purple-400 group-hover:translate-x-1 transition-transform shrink-0 ml-2">Abrir →</span>
            </div>
          </div>

        </div>

        <!-- ═══════════════════════ 6. FOOTER ACTIONS ═══════════════════════ -->
        <div class="flex justify-end pt-1 sm:pt-2">
          <button (click)="resetMetrics()"
                  class="px-5 xs:px-6 py-2 xs:py-2.5 rounded-full text-[10px] xs:text-xs font-headline font-semibold uppercase tracking-wider border transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
                  [ngClass]="isDark ? 'border-neutral-800 text-neutral-400 hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/10' : 'border-neutral-200 text-neutral-600 hover:border-red-300 hover:text-red-600 hover:bg-red-50'">
            Reiniciar Métricas
          </button>
        </div>

      </div>

      <!-- Modal de Sesión Expirada -->
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

    <!-- ═══════════════════════ SKELETON LOADER (1:1 PIXEL-PERFECT MATCH) ═══════════════════════ -->
    <ng-template #skeleton>
      <div class="space-y-4 xs:space-y-5 sm:space-y-6 animate-pulse font-sans">
        
        <!-- 1. Welcome Banner Skeleton -->
        <div class="relative overflow-hidden rounded-2xl sm:rounded-3xl border p-5 xs:p-6 sm:p-8 md:p-9 min-h-[200px] xs:min-h-[220px] sm:min-h-[240px] flex flex-col justify-center"
             [ngClass]="isDark ? 'bg-[#0c0c0e] border-neutral-800' : 'bg-white border-neutral-200/80'">
          <div class="space-y-3 max-w-[65%]">
            <div class="h-3 w-28 rounded-full" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
            <div class="h-8 sm:h-10 w-52 sm:w-80 rounded-xl" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
            <div class="h-4 w-44 rounded-full" [ngClass]="isDark ? 'bg-neutral-800/70' : 'bg-neutral-200/70'"></div>
            
            <div class="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap pt-2">
              <div *ngFor="let _ of [1,2,3,4]" class="h-8 w-24 sm:w-28 rounded-xl" [ngClass]="isDark ? 'bg-[#141419] border border-neutral-800' : 'bg-neutral-100'"></div>
            </div>
          </div>
          <div class="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:block w-36 h-36 rounded-full" [ngClass]="isDark ? 'bg-neutral-800/20' : 'bg-neutral-100'"></div>
        </div>

        <!-- 2. AI Command Center Skeleton -->
        <div class="rounded-[20px] xs:rounded-[24px] sm:rounded-[28px] border p-4 xs:p-5 sm:p-6 space-y-3"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800/80' : 'bg-white border-neutral-200/80'">
          <div class="flex items-center gap-3">
            <div class="w-7 h-7 rounded-lg" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
            <div class="h-5 w-44 rounded-lg" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
          </div>
          <div class="h-3 w-72 rounded-full" [ngClass]="isDark ? 'bg-neutral-800/70' : 'bg-neutral-200/70'"></div>
          <div class="h-11 sm:h-12 w-full rounded-xl sm:rounded-2xl" [ngClass]="isDark ? 'bg-neutral-950/80 border border-neutral-800' : 'bg-neutral-100 border border-neutral-200'"></div>
          <div class="flex items-center gap-2 pt-1 flex-wrap">
            <div class="h-3 w-16 rounded-full" [ngClass]="isDark ? 'bg-neutral-800/60' : 'bg-neutral-200/60'"></div>
            <div *ngFor="let _ of [1,2,3,4]" class="h-6 w-28 sm:w-36 rounded-full" [ngClass]="isDark ? 'bg-neutral-800/70' : 'bg-neutral-200/70'"></div>
          </div>
        </div>

        <!-- 3. KPI Cards Skeleton (2x2 Mobile / 4 Desktop) -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-5">
          <div *ngFor="let _ of [1,2,3,4]" 
               class="rounded-[18px] xs:rounded-[20px] sm:rounded-[24px] border p-3.5 xs:p-4 sm:p-6 flex flex-col justify-between h-28 xs:h-32 sm:h-36"
               [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800/80' : 'bg-white border-neutral-200/80'">
            <div class="flex items-center justify-between">
              <div class="h-3 w-16 sm:w-24 rounded-full" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
              <div class="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
            </div>
            <div class="space-y-1.5">
              <div class="h-6 sm:h-8 w-20 sm:w-28 rounded-lg" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
              <div class="h-2.5 w-24 rounded-full" [ngClass]="isDark ? 'bg-neutral-800/60' : 'bg-neutral-200/60'"></div>
            </div>
          </div>
        </div>

        <!-- 4. High-Performance Charts Skeleton -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-5">
          <div *ngFor="let _ of [1,2]" 
               class="rounded-[20px] xs:rounded-[24px] sm:rounded-[28px] border p-4 xs:p-5 sm:p-7 flex flex-col justify-between min-h-[320px] xs:min-h-[340px] sm:min-h-[360px]"
               [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800/80' : 'bg-white border-neutral-200/80'">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="space-y-1.5">
                  <div class="h-4 w-36 rounded-lg" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
                  <div class="h-2.5 w-24 rounded-full" [ngClass]="isDark ? 'bg-neutral-800/60' : 'bg-neutral-200/60'"></div>
                </div>
                <div class="h-6 w-20 rounded-full" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
              </div>
              <div class="h-36 sm:h-44 w-full rounded-xl flex items-end justify-between p-2 gap-2" [ngClass]="isDark ? 'bg-neutral-950/40' : 'bg-neutral-50'">
                <div *ngFor="let h of [30, 60, 45, 80, 70, 95]" class="flex-1 rounded-t-md" [style.height.%]="h" [ngClass]="isDark ? 'bg-neutral-800/60' : 'bg-neutral-200/60'"></div>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-2 pt-3 border-t" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-100'">
              <div *ngFor="let _ of [1,2,3]" class="space-y-1 text-center flex flex-col items-center">
                <div class="h-2 w-12 rounded-full" [ngClass]="isDark ? 'bg-neutral-800/60' : 'bg-neutral-200/60'"></div>
                <div class="h-3.5 w-14 rounded-lg" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 5. Infrastructure & Agenda Skeleton -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-5">
          <div class="rounded-[20px] xs:rounded-[24px] sm:rounded-[28px] border p-4 xs:p-5 sm:p-7 space-y-4"
               [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800/80' : 'bg-white border-neutral-200/80'">
            <div class="flex items-center justify-between">
              <div class="h-4 w-32 rounded-lg" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
              <div class="h-5 w-24 rounded-full" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
            </div>
            <div class="grid grid-cols-2 gap-2.5">
              <div *ngFor="let _ of [1,2,3,4]" class="h-16 rounded-xl sm:rounded-2xl p-3 border"
                   [ngClass]="isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'"></div>
            </div>
          </div>

          <div class="rounded-[20px] xs:rounded-[24px] sm:rounded-[28px] border p-4 xs:p-5 sm:p-7 space-y-4"
               [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800/80' : 'bg-white border-neutral-200/80'">
            <div class="flex items-center justify-between">
              <div class="h-4 w-32 rounded-lg" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
              <div class="h-5 w-20 rounded-full" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
            </div>
            <div class="space-y-2">
              <div *ngFor="let _ of [1,2]" class="h-11 rounded-lg sm:rounded-xl border p-2.5"
                   [ngClass]="isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'"></div>
            </div>
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
    .animate-dropdown { animation: dropdownIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes dropdownIn {
      from { opacity: 0; transform: translateY(-8px) scale(0.99); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .scale-in { animation: scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
    @keyframes scaleIn {
      from { transform: scale(0.95); opacity: 0; }
      to   { transform: scale(1); opacity: 1; }
    }
    .voice-wave span {
      display: inline-block;
      width: 3px;
      border-radius: 3px;
      animation: voiceWave 1.2s ease-in-out infinite;
    }
    @keyframes voiceWave {
      0%, 100% { height: 6px; opacity: 0.4; }
      50% { height: 18px; opacity: 1; }
    }
  `]
})
export class DashHomeComponent implements OnInit, OnDestroy {
  @Input() theme = 'light';
  @Output() tabChange = new EventEmitter<string>();

  private analyticsService = inject(AnalyticsService);
  private itineraryService = inject(ItineraryService);
  private sessionTimer = inject(SessionTimerService);
  private financeService = inject(FinanceService);
  private commandCenterService = inject(CommandCenterService);
  private audioRecorder = inject(AudioRecorderService);
  private router = inject(Router);

  metrics: SystemMetrics = {
    homeViews: 0,
    linktreeViews: 0,
    rotbotOpens: 0,
    rotbotMessagesSent: 0,
    sectionViews: {},
    linktreeClicks: {},
    totalClicks: 0,
    linkCtr: 0,
    dailyTrend: [],
    loadTimes: [],
    themeSelections: { light: 0, dark: 0 }
  };

  currentDate = '';
  currentTime = '';

  get greetingText(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'Buenos Días Santi';
    } else if (hour >= 12 && hour < 19) {
      return 'Buenas Tardes Santi';
    } else {
      return 'Buenas Noches Santi';
    }
  }

  get greetingPeriod(): 'morning' | 'afternoon' | 'night' {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 19) return 'afternoon';
    return 'night';
  }

  rotatingPhrases: string[] = [
    '¿qué haremos hoy?',
    '¿ya estudiaste sql?',
    '¿ya estudiaste inglés?',
    '¿ya leíste arquitectura?',
    '¿cómo van las finanzas?'
  ];
  currentPhraseIndex = 0;
  isPhraseFading = false;
  private phraseInterval: any;
  private phraseTimeout: any;

  get currentRotatingPhrase(): string {
    return this.rotatingPhrases[this.currentPhraseIndex];
  }

  isLoading = true;
  unreadMessages = 0;
  pendingLeads = 0;
  totalClientsCount = 0;
  totalInvoicesCount = 0;
  financeTotalPaid = 0;
  financeTotalPending = 0;
  collectionRate = 85;
  conversionRate = 12.8;
  avgDailyTraffic = 0;
  maxTraffic = 0;

  // Radar Proactivo State
  radarData: RadarResponse | null = null;
  isRadarLoading = false;

  // AI Command Search State
  aiQuery = '';
  isAiSearching = false;
  activeAiResponse: CommandCenterResponse | null = null;
  displayPlaceholder = 'Pregúntale a Gemini o consulta finanzas, clientes, biblioteca...';

  // Voice Recording & Multimodal AI State
  isVoiceRecording = false;
  isAiVoiceProcessing = false;
  audioVolume = 0;
  voiceErrorMessage = '';
  private voiceSubs: Subscription[] = [];

  quickSuggestions = [
    'Dame los clientes actuales',
    'Pagos pendientes en finanzas',
    'Cuaderno de SQL en biblioteca',
    'Agenda y tareas de hoy',
    'Reporte de finanzas'
  ];

  private placeholders = [
    'Consultar balance de cobro y pagos...',
    'Buscar clientes activos...',
    'Consultar notas de SQL en biblioteca...',
    'Revisar agenda de hoy...'
  ];
  private placeholderIdx = 0;
  private charIdx = 0;
  private typeInterval: any;
  private pauseTimeout: any;

  // Traffic SVG Path Data
  weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  trafficPoints: { x: number; y: number }[] = [];
  trafficLinePath = '';
  trafficAreaPath = '';

  // Financial Monthly Bars Data
  financialMonthlyBars = [
    { month: 'Ene', amount: 2400000, formattedShort: '$2.4M', heightPct: 45 },
    { month: 'Feb', amount: 3200000, formattedShort: '$3.2M', heightPct: 60 },
    { month: 'Mar', amount: 2800000, formattedShort: '$2.8M', heightPct: 52 },
    { month: 'Abr', amount: 4100000, formattedShort: '$4.1M', heightPct: 78 },
    { month: 'May', amount: 3900000, formattedShort: '$3.9M', heightPct: 74 },
    { month: 'Jun', amount: 5200000, formattedShort: '$5.2M', heightPct: 100 },
  ];

  // Server Stats
  serverStats = [
    { label: 'Estado API', value: 'Online', dot: true },
    { label: 'Latencia', value: '42ms' },
    { label: 'Cloud DB', value: 'Sync' },
    { label: 'Uptime', value: '99.98%' }
  ];

  private clockInterval: any;
  sessionTimeFormatted = '';
  sessionIsWarning = false;
  showSessionExpiredModal = false;
  private sessionSub!: Subscription;
  private sessionExpiredSub!: Subscription;

  itineraryNotifs: any = { unseen: 0, current: [], upcoming: [], overdue: [], no_time: [] };

  get isDark() { return this.theme === 'dark'; }

  ngOnInit() {
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);

    // 1. Cargar Radar y Accesos Recientes
    this.loadRadarData();

    // 2. Cargar Analíticas
    this.analyticsService.getMetrics().subscribe({
      next: (m) => {
        this.metrics = m || this.metrics;
        this.computeTrafficGraph();
        this.checkLoadingState();
      },
      error: () => {
        this.computeTrafficGraph();
        this.checkLoadingState();
      }
    });

    // 3. Cargar Itinerario
    this.itineraryService.getNotifications().subscribe({
      next: (notifs) => {
        this.itineraryNotifs = notifs || this.itineraryNotifs;
      }
    });

    // 4. Cargar Finanzas Reales
    this.loadFinanceSummary();

    // 5. Badges locales
    this.loadBadges();

    // 6. Sugerencias dinámicas
    this.loadDynamicSuggestions();

    // 7. Universal Voice Recording Setup
    if (this.audioRecorder.isSupported) {
      this.voiceSubs.push(
        this.audioRecorder.isRecording$.subscribe(rec => {
          this.isVoiceRecording = rec;
        }),
        this.audioRecorder.audioVolume$.subscribe(vol => {
          this.audioVolume = vol;
        }),
        this.audioRecorder.recordedAudio$.subscribe(audio => {
          this.processRecordedVoiceAudio(audio);
        }),
        this.audioRecorder.error$.subscribe(errMsg => {
          this.voiceErrorMessage = errMsg;
          setTimeout(() => this.voiceErrorMessage = '', 5000);
        })
      );
    }

    // 8. Typewriter
    this.startTypewriter();

    // 9. Phrase Rotation (Inicio aleatorio para variar en cada visita)
    this.currentPhraseIndex = Math.floor(Math.random() * this.rotatingPhrases.length);
    this.startPhraseRotation();

    // 10. Session Countdown
    this.sessionSub = this.sessionTimer.sessionTimeLeft$.subscribe(seconds => {
      if (seconds <= 0) {
        this.sessionTimeFormatted = 'Expirada';
        this.sessionIsWarning = true;
      } else {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        this.sessionTimeFormatted = h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
        this.sessionIsWarning = seconds < 900;
      }
    });

    this.sessionExpiredSub = this.sessionTimer.sessionExpired$.subscribe(() => {
      this.showSessionExpiredModal = true;
    });
  }

  ngOnDestroy() {
    clearInterval(this.clockInterval);
    clearInterval(this.typeInterval);
    clearInterval(this.phraseInterval);
    clearTimeout(this.pauseTimeout);
    clearTimeout(this.phraseTimeout);
    if (this.sessionSub) this.sessionSub.unsubscribe();
    if (this.sessionExpiredSub) this.sessionExpiredSub.unsubscribe();
    this.voiceSubs.forEach(s => s.unsubscribe());
    if (this.isVoiceRecording) this.audioRecorder.stopRecording();
  }

  private checkLoadingState() {
    setTimeout(() => {
      this.isLoading = false;
    }, 150);
  }

  loadRadarData() {
    this.isRadarLoading = true;
    this.commandCenterService.getRadar().subscribe({
      next: (res) => {
        this.isRadarLoading = false;
        if (res && res.ok) {
          this.radarData = res;
        }
      },
      error: () => {
        this.isRadarLoading = false;
      }
    });
  }

  loadDynamicSuggestions() {
    this.commandCenterService.getSuggestions().subscribe({
      next: (suggs) => {
        if (suggs && suggs.length > 0) {
          this.quickSuggestions = suggs;
        }
      },
      error: () => {}
    });
  }

  selectSuggestion(prompt: string) {
    this.aiQuery = prompt;
    this.askGeminiCommand();
  }

  private loadFinanceSummary() {
    try {
      this.financeService.getDashboard().subscribe({
        next: (res: any) => {
          const summary = res?.summary || res?.dashboard || res;
          if (summary) {
            this.financeTotalPaid = summary.totalPaid || summary.total_paid || summary.totalBilled || 8450000;
            this.financeTotalPending = summary.totalPending || summary.total_pending || 1250000;
            this.totalInvoicesCount = summary.invoicesCount || summary.total_invoices || 14;
            if (summary.clientsCount !== undefined || summary.total_clients !== undefined) {
              this.totalClientsCount = summary.clientsCount || summary.total_clients;
            }
            if (summary.totalBilled && summary.totalPaid) {
              this.collectionRate = Math.round((summary.totalPaid / summary.totalBilled) * 100) || 85;
            }
          }
        },
        error: () => {}
      });

      this.financeService.getClients().subscribe({
        next: (res: any) => {
          if (res && Array.isArray(res.clients)) {
            this.totalClientsCount = res.clients.length;
          }
        },
        error: () => {}
      });
    } catch {
      this.financeTotalPaid = 8450000;
      this.financeTotalPending = 1250000;
      this.totalInvoicesCount = 14;
      this.totalClientsCount = 8;
    }
  }

  private computeTrafficGraph() {
    const rawData = this.metrics?.dailyTrend || [];
    let values = rawData.map(d => (d.total || (d.home + (d.linktree || 0))) || 0);

    if (!values.length || values.every(v => v === 0)) {
      values = [42, 68, 55, 89, 110, 95, 128];
    } else if (values.length < 7) {
      while (values.length < 7) values.unshift(Math.max(10, Math.round(values[0] * 0.8)));
    } else if (values.length > 7) {
      values = values.slice(-7);
    }

    const maxVal = Math.max(...values, 10);
    this.maxTraffic = maxVal;
    const sum = values.reduce((a, b) => a + b, 0);
    this.avgDailyTraffic = Math.round(sum / values.length);
    this.conversionRate = Math.min(24.5, Number(((sum > 0 ? (this.unreadMessages + 4) / sum : 0.12) * 100).toFixed(1)));

    const width = 500;
    const height = 120;
    const topMargin = 20;
    const bottomMargin = 15;
    const step = width / (values.length - 1);

    this.trafficPoints = values.map((val, idx) => {
      const x = Math.round(idx * step);
      const ratio = val / maxVal;
      const y = Math.round((height - bottomMargin) - ratio * (height - topMargin - bottomMargin));
      return { x, y };
    });

    if (this.trafficPoints.length > 0) {
      let d = `M ${this.trafficPoints[0].x} ${this.trafficPoints[0].y}`;
      for (let i = 0; i < this.trafficPoints.length - 1; i++) {
        const p0 = this.trafficPoints[i];
        const p1 = this.trafficPoints[i + 1];
        const cx = (p0.x + p1.x) / 2;
        d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
      }
      this.trafficLinePath = d;
      this.trafficAreaPath = `${d} L ${width} 140 L 0 140 Z`;
    }
  }

  // ═══════════════ UNIVERSAL VOICE CAPTURE & GEMINI MULTIMODAL ═══════════════

  toggleVoiceInput() {
    if (this.isAiSearching || this.isAiVoiceProcessing) return;

    if (this.isVoiceRecording) {
      this.audioRecorder.stopRecording();
    } else {
      this.activeAiResponse = null;
      this.voiceErrorMessage = '';
      this.audioRecorder.startRecording();
    }
  }

  getWaveBarHeight(index: number): number {
    const base = 4;
    const max = 22;
    // Variación según el índice y el volumen actual capturado por el micrófono
    const factors = [0.6, 0.9, 1.2, 0.8, 0.5];
    const computed = base + (this.audioVolume / 100) * (max - base) * factors[index];
    return Math.min(max, Math.max(base, Math.round(computed)));
  }

  private processRecordedVoiceAudio(audio: RecordedAudio) {
    this.isAiVoiceProcessing = true;
    this.voiceErrorMessage = '';

    this.commandCenterService.queryVoiceAudio(audio.base64, audio.mimeType).subscribe({
      next: (res) => {
        this.isAiVoiceProcessing = false;

        if (res && res.transcript) {
          this.aiQuery = res.transcript;
        }

        // Si es navegación directa (ej: "biblioteca", "finanzas", "agenda")
        if (res.intent === 'navigate' && res.targetTab && res.targetTab !== 'dashboard') {
          this.navigateToTab(res.targetTab);
        } else if (res.data) {
          // Si es una consulta compleja con análisis o listado de registros
          this.activeAiResponse = {
            ok: true,
            query: res.transcript || 'Comando de voz',
            data: res.data
          };
          this.loadRadarData();
          this.loadDynamicSuggestions();
        }
      },
      error: () => {
        this.isAiVoiceProcessing = false;
        this.voiceErrorMessage = 'No se pudo interpretar el audio. Intenta de nuevo.';
        setTimeout(() => this.voiceErrorMessage = '', 4000);
      }
    });
  }

  // ═══════════════ AI COMMAND EXECUTION ═══════════════

  askGeminiCommand() {
    const q = this.aiQuery.trim();
    if (!q || this.isAiSearching) return;

    this.isAiSearching = true;
    this.activeAiResponse = null;

    this.commandCenterService.query(q).subscribe({
      next: (res) => {
        this.isAiSearching = false;
        if (res && res.data) {
          this.activeAiResponse = res;
          this.loadRadarData();
          this.loadDynamicSuggestions();
        }
      },
      error: () => {
        this.isAiSearching = false;
      }
    });
  }

  getBadgeColorClass(color?: string): string {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'blue':
        return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'amber':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'purple':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'red':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default:
        return 'bg-neutral-500/10 text-neutral-400 border border-neutral-500/20';
    }
  }

  getSectionDotColor(section: string): string {
    switch (section) {
      case 'finances': return 'bg-amber-500';
      case 'library': return 'bg-purple-500';
      case 'itinerary': return 'bg-blue-500';
      case 'analytics': return 'bg-emerald-500';
      case 'messages': return 'bg-cyan-400';
      default: return 'bg-neutral-400';
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value || 0);
  }

  navigateToTab(tab: string) {
    this.tabChange.emit(tab);
  }

  private updateClock() {
    const now = new Date();
    const rawDate = now.toLocaleDateString('es-CO', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    this.currentDate = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);
    this.currentTime = now.toLocaleTimeString('es-CO', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }

  private loadBadges() {
    try {
      const msgs = JSON.parse(localStorage.getItem('portalink_admin_messages') || '[]');
      const leads = JSON.parse(localStorage.getItem('portalink_admin_leads') || '[]');
      this.unreadMessages = msgs.filter((m: any) => !m.read).length;
      this.pendingLeads = leads.filter((l: any) => l.status === 'Pendiente').length;
    } catch { }
  }

  resetMetrics() {
    if (confirm('¿Estás seguro de que deseas reiniciar todas las métricas?')) {
      this.analyticsService.resetMetrics();
      this.analyticsService.getMetrics().subscribe(m => {
        this.metrics = m;
        this.computeTrafficGraph();
      });
    }
  }

  goToLogin() {
    this.showSessionExpiredModal = false;
    this.router.navigate(['/login']);
  }

  getItemIconPath(item: any): string {
    const text = ((item?.title || '') + ' ' + (item?.subtitle || '') + ' ' + (item?.targetTab || '')).toLowerCase();
    
    if (text.includes('cliente') || text.includes('contacto') || text.includes('usuario') || text.includes('@') || item?.targetTab === 'users') {
      return 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z';
    }
    if (text.includes('factura') || text.includes('pago') || text.includes('cop') || text.includes('cobro') || text.includes('ingreso') || item?.targetTab === 'finances') {
      return 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
    if (text.includes('cuaderno') || text.includes('apunte') || text.includes('sql') || text.includes('nota') || item?.targetTab === 'library') {
      return 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253';
    }
    if (text.includes('tarea') || text.includes('agenda') || text.includes('itinerario') || item?.targetTab === 'itinerary') {
      return 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z';
    }
    if (text.includes('mensaje') || text.includes('correo') || item?.targetTab === 'messages') {
      return 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z';
    }
    if (text.includes('tráfico') || text.includes('visita') || item?.targetTab === 'analytics') {
      return 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z';
    }
    return 'M13 10V3L4 14h7v7l9-11h-7z';
  }

  private startTypewriter() {
    this.typeInterval = setInterval(() => {
      if (this.aiQuery || this.isAiSearching || this.activeAiResponse) return;
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
        }, 2200);
      }
    }, 60);
  }

  private startPhraseRotation() {
    this.phraseInterval = setInterval(() => {
      this.isPhraseFading = true;
      this.phraseTimeout = setTimeout(() => {
        this.currentPhraseIndex = (this.currentPhraseIndex + 1) % this.rotatingPhrases.length;
        this.isPhraseFading = false;
      }, 300);
    }, 10000);
  }
}
