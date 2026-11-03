import { Component, Input, OnInit, OnDestroy, Output, EventEmitter, inject, ChangeDetectionStrategy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsService, SystemMetrics } from '../../../services/analytics.service';
import { SessionTimerService } from '../../../services/session-timer.service';
import { FinanceService } from '../../../services/finance.service';
import { CommandCenterService, CommandCenterResponse, RadarResponse, RadarInsight, RecentAccess } from '../../../services/command-center.service';
import { AudioRecorderService, RecordedAudio } from '../../../services/audio-recorder.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MessagesService } from '../../../services/messages.service';
@Component({
  selector: 'app-dash-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *ngIf="!isLoading; else skeleton">
      <!-- ═══════════════════════ VISTA NATIVA APP MÓVIL (< lg) ═══════════════════════ -->
      <div class="block lg:hidden mobile-home-app space-y-3.5 pb-12 tab-enter font-sans select-none">

        <!-- 1. PANEL NEGRO HERO MÓVIL CON ROTBOT -->
        <div class="bg-[#09090b] text-white rounded-[24px] border border-neutral-800 p-5 relative overflow-hidden flex flex-col justify-between min-h-[260px] shadow-xl">
          <!-- Círculos concéntricos sutiles de fondo -->
          <div class="absolute -right-12 -bottom-12 w-56 h-56 rounded-full border border-neutral-800/40 pointer-events-none"></div>
          <div class="absolute -right-6 -bottom-6 w-44 h-44 rounded-full border border-neutral-800/30 pointer-events-none"></div>

          <div class="relative z-10 max-w-[62%] flex flex-col justify-between h-full">
            <div>
              <!-- Pill Saludo -->
              <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-neutral-800 bg-neutral-900/90 text-[10px] font-sans text-neutral-300 mb-3">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span>{{ greetingPillText }}</span>
              </div>

              <!-- Título -->
              <h2 class="text-2xl font-headline font-bold tracking-tight leading-[1.1] text-white m-0 mb-2">
                Bienvenido,<br>
                Santiago!
              </h2>

              <!-- Párrafo -->
              <p class="text-[11px] font-sans text-neutral-400 leading-relaxed m-0 mb-4">
                Gestión centralizada de catálogo, inventario y finanzas de PortaLink.
              </p>
            </div>

            <!-- Fila Fecha con ícono de calendario rojo -->
            <div class="flex items-center gap-1.5 text-[11px] font-sans text-neutral-400">
              <span class="material-symbols-rounded text-sm text-red-500">calendar_today</span>
              <span>{{ formattedHeroDate }}</span>
            </div>
          </div>

          <!-- Imagen Rotbot 3D en móvil -->
          <div class="absolute right-1 bottom-0 top-0 flex items-center justify-center pointer-events-none z-10">
            <img src="assets/images/rotbot4.png"
                 alt="RotBot Copilot"
                 class="w-36 h-auto max-h-[220px] object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]">
          </div>
        </div>

        <!-- 3. ACCESO RÁPIDO MÓVIL (TARJETA BLANCA / GRIS) -->
        <div class="rounded-[24px] border p-4 transition-all duration-200"
             [ngClass]="isDark ? 'bg-[#0e0e13] border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900 shadow-sm'">
          <div class="text-[10px] font-headline font-extrabold uppercase tracking-widest text-neutral-500 mb-2.5">
            Acceso Rápido
          </div>
          <div class="space-y-1">
            <!-- 1. Inventario & Finanzas -->
            <div (click)="navigateToTab('finances')"
                 class="flex items-center justify-between p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900/60 transition-colors cursor-pointer group">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl border flex items-center justify-center"
                     [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-neutral-100 border-neutral-200 text-neutral-800'">
                  <span class="material-symbols-rounded text-lg">payments</span>
                </div>
                <div>
                  <p class="text-xs font-headline font-bold m-0" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Gestión de Finanzas</p>
                  <p class="text-[10px] text-neutral-400 m-0">Cuentas de cobro y pagos</p>
                </div>
              </div>
              <span class="material-symbols-rounded text-neutral-400 text-base">chevron_right</span>
            </div>

            <!-- 2. Analíticas (Rojo) -->
            <div (click)="navigateToTab('rotbot')"
                 class="flex items-center justify-between p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900/60 transition-colors cursor-pointer group">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl border flex items-center justify-center bg-red-500/10 border-red-500/25 text-red-500">
                  <span class="material-symbols-rounded text-lg">monitoring</span>
                </div>
                <div>
                  <p class="text-xs font-headline font-bold m-0" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Analíticas & Métricas</p>
                  <p class="text-[10px] text-neutral-400 m-0">Diagnóstico en tiempo real</p>
                </div>
              </div>
              <span class="material-symbols-rounded text-neutral-400 text-base">chevron_right</span>
            </div>

            <!-- 3. Biblioteca & SQL (Rojo) -->
            <div (click)="navigateToTab('library')"
                 class="flex items-center justify-between p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900/60 transition-colors cursor-pointer group">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl border flex items-center justify-center bg-red-500/10 border-red-500/25 text-red-500">
                  <span class="material-symbols-rounded text-lg">category</span>
                </div>
                <div>
                  <p class="text-xs font-headline font-bold m-0" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Biblioteca & SQL</p>
                  <p class="text-[10px] text-neutral-400 m-0">Tablas y cuadernos</p>
                </div>
              </div>
              <span class="material-symbols-rounded text-neutral-400 text-base">chevron_right</span>
            </div>

            <!-- 4. Itinerario & Agenda -->
            <div (click)="navigateToTab('itinerary')"
                 class="flex items-center justify-between p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900/60 transition-colors cursor-pointer group">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl border flex items-center justify-center"
                     [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-neutral-100 border-neutral-200 text-neutral-800'">
                  <span class="material-symbols-rounded text-lg">layers</span>
                </div>
                <div>
                  <p class="text-xs font-headline font-bold m-0" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Itinerario & Agenda</p>
                  <p class="text-[10px] text-neutral-400 m-0">Tareas y eventos</p>
                </div>
              </div>
              <span class="material-symbols-rounded text-neutral-400 text-base">chevron_right</span>
            </div>

            <!-- 5. Buzón de Mensajes -->
            <div (click)="navigateToTab('messages')"
                 class="flex items-center justify-between p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900/60 transition-colors cursor-pointer group">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl border flex items-center justify-center"
                     [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-neutral-100 border-neutral-200 text-neutral-800'">
                  <span class="material-symbols-rounded text-lg">storefront</span>
                </div>
                <div>
                  <p class="text-xs font-headline font-bold m-0" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Buzón de Mensajes</p>
                  <p class="text-[10px] text-neutral-400 m-0">{{ unreadMessages > 0 ? (unreadMessages + ' sin leer') : 'Canal directo' }}</p>
                </div>
              </div>
              <span class="material-symbols-rounded text-neutral-400 text-base">chevron_right</span>
            </div>
          </div>
        </div>

        <!-- 3. COMANDO IA MÓVIL (INPUT FLUIDO + VOZ + CHIPS) -->
        <div class="rounded-3xl border p-4 transition-all duration-300 space-y-3"
             [ngClass]="isDark ? 'bg-[#0d0d11] border-neutral-800/90 text-white' : 'bg-white border-neutral-200/90 text-neutral-900 shadow-sm'">
          
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-rounded text-red-500 text-lg">auto_awesome</span>
              <span class="text-xs font-headline font-bold uppercase tracking-wider">Comando Gemini IA</span>
            </div>
            <span class="text-[9px] font-mono px-2 py-0.5 rounded-full border"
                  [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : 'bg-neutral-100 border-neutral-200 text-neutral-600'">
              Flash 2.0
            </span>
          </div>

          <!-- Input Pill con Micrófono y Botón de Envío -->
          <div class="relative flex items-center">
            <input type="text"
                   [(ngModel)]="aiQuery"
                   (keyup.enter)="askGeminiCommand()"
                   [disabled]="isAiSearching"
                   [placeholder]="isAiSearching ? 'Consultando Gemini...' : 'Pregunta o comando rápido...'"
                   class="w-full pl-3.5 pr-20 py-2.5 rounded-xl border text-xs outline-none transition-all font-sans"
                   [ngClass]="isDark ? 'bg-neutral-950 border-neutral-800 text-white placeholder-neutral-500 focus:border-red-500/60' : 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-red-500/60'">
            
            <div class="absolute right-1.5 flex items-center gap-1">
              <!-- Micrófono -->
              <button (click)="toggleVoiceInput()"
                      [disabled]="isAiSearching || isAiVoiceProcessing"
                      class="w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer"
                      [ngClass]="isVoiceRecording 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : (isDark ? 'text-neutral-400 hover:text-white hover:bg-neutral-900' : 'text-neutral-500 hover:text-black hover:bg-neutral-200')">
                <span class="material-symbols-rounded text-base">mic</span>
              </button>

              <!-- Botón Enviar -->
              <button (click)="askGeminiCommand()"
                      [disabled]="isAiSearching || !aiQuery.trim() || isVoiceRecording"
                      class="w-7 h-7 rounded-lg flex items-center justify-center bg-red-600 text-white hover:bg-red-500 transition-all cursor-pointer disabled:opacity-40 active:scale-90">
                <span class="material-symbols-rounded text-base">arrow_upward</span>
              </button>
            </div>
          </div>

          <!-- Estado de grabación o error -->
          <div *ngIf="isVoiceRecording" class="flex items-center gap-2 py-1 text-xs text-red-500 animate-pulse font-sans">
            <span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>Escuchando audio... pulsa el micro de nuevo para procesar</span>
          </div>
          <div *ngIf="voiceErrorMessage" class="text-[11px] text-red-400 bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/20 font-sans">
            {{ voiceErrorMessage }}
          </div>

          <!-- Carrusel de Sugerencias Rápidas -->
          <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            <button *ngFor="let sug of quickSuggestions"
                    (click)="selectSuggestion(sug)"
                    class="shrink-0 px-2.5 py-1 rounded-full border text-[10px] font-sans transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                    [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700' : 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:border-neutral-300'">
              {{ sug }}
            </button>
          </div>

          <!-- Tarjeta de Respuesta IA Móvil (si está activa) -->
          <div *ngIf="activeAiResponse"
               class="rounded-2xl border p-3.5 space-y-2.5 animate-dropdown"
               [ngClass]="isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-900'">
            <div class="flex items-center justify-between pb-2 border-b"
                 [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
              <div class="flex items-center gap-1.5 text-xs font-headline font-bold text-red-500">
                <span class="material-symbols-rounded text-base">bolt</span>
                Respuesta Gemini
              </div>
              <button (click)="activeAiResponse = null" class="text-neutral-400 hover:text-white p-1">
                <span class="material-symbols-rounded text-sm">close</span>
              </button>
            </div>
            <p class="text-xs font-sans leading-relaxed m-0 opacity-90">{{ activeAiResponse.data?.summary || activeAiResponse.query }}</p>
            <div *ngIf="activeAiResponse.data?.targetTab" class="pt-1">
              <button (click)="navigateToTab(activeAiResponse.data.targetTab)"
                      class="w-full py-2 px-3 rounded-xl bg-red-600 text-white text-xs font-headline font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 shadow-md">
                <span>{{ activeAiResponse.data.actionText || 'Ver en Módulo' }}</span>
                <span class="material-symbols-rounded text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 4. GRID DE 5 MÓDULOS MÓVIL (2 NEGROS + 3 BLANCOS) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <!-- Card 1: Black Card (Gestionar Finanzas) -->
          <div (click)="navigateToTab('finances')"
               class="rounded-2xl p-4 flex flex-col justify-between cursor-pointer border"
               [ngClass]="isDark ? 'bg-[#09090b] border-neutral-800 text-white' : 'bg-[#0a0a0d] border-neutral-900 text-white shadow-md'">
            <div>
              <div class="w-9 h-9 rounded-xl border flex items-center justify-center bg-neutral-900 border-neutral-800 mb-3"
                   style="color: #ffffff !important;">
                <span class="material-symbols-rounded text-lg" style="color: #ffffff !important;">payments</span>
              </div>
              <h3 class="text-sm font-headline font-bold m-0 mb-1 leading-tight dark-card-white"
                   style="color: #ffffff !important;">Gestionar Finanzas</h3>
              <p class="text-[11px] font-sans text-neutral-400 leading-relaxed m-0 mb-4">Control integral de cuentas de cobro, facturación, clientes y pagos en tiempo real.</p>
            </div>
            <div class="text-[11px] font-headline font-bold inline-flex items-center gap-1 dark-card-white"
                 style="color: #ffffff !important;">
              <span style="color: #ffffff !important;">Entrar al módulo</span>
              <span class="material-symbols-rounded text-xs" style="color: #ffffff !important;">arrow_forward</span>
            </div>
          </div>

          <!-- Card 2: Black Card (Reporte y Analíticas) -->
          <div (click)="navigateToTab('rotbot')"
               class="rounded-2xl p-4 flex flex-col justify-between cursor-pointer border"
               [ngClass]="isDark ? 'bg-[#09090b] border-neutral-800 text-white' : 'bg-[#0a0a0d] border-neutral-900 text-white shadow-md'">
            <div>
              <div class="w-9 h-9 rounded-xl border flex items-center justify-center bg-red-500/15 border-red-500/30 text-red-500 mb-3">
                <span class="material-symbols-rounded text-lg text-red-500">monitoring</span>
              </div>
              <h3 class="text-sm font-headline font-bold m-0 mb-1 leading-tight dark-card-white"
                   style="color: #ffffff !important;">Reporte y Analíticas</h3>
              <p class="text-[11px] font-sans text-neutral-400 leading-relaxed m-0 mb-4">Diagnóstico de calidad, gráficos y métricas en tiempo real.</p>
            </div>
            <div class="text-[11px] font-headline font-bold text-red-500 inline-flex items-center gap-1">
              <span>Entrar al módulo</span>
              <span class="material-symbols-rounded text-xs">arrow_forward</span>
            </div>
          </div>

          <!-- Card 3: White Card (Biblioteca & SQL) -->
          <div (click)="navigateToTab('library')"
               class="rounded-2xl p-4 flex flex-col justify-between cursor-pointer border"
               [ngClass]="isDark ? 'bg-[#111116] border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900 shadow-xs'">
            <div>
              <div class="w-9 h-9 rounded-xl border flex items-center justify-center mb-3"
                   [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-neutral-100 border-neutral-200 text-neutral-800'">
                <span class="material-symbols-rounded text-lg">category</span>
              </div>
              <h3 class="text-sm font-headline font-bold m-0 mb-1 leading-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Biblioteca & SQL</h3>
              <p class="text-[11px] font-sans leading-relaxed m-0 mb-4" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Administra las categorías, esquemas y consultas del sistema.</p>
            </div>
            <div class="text-[11px] font-headline font-bold inline-flex items-center gap-1" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              <span>Entrar al módulo</span>
              <span class="material-symbols-rounded text-xs">arrow_forward</span>
            </div>
          </div>

          <!-- Card 4: White Card (Itinerario & Agenda) -->
          <div (click)="navigateToTab('itinerary')"
               class="rounded-2xl p-4 flex flex-col justify-between cursor-pointer border"
               [ngClass]="isDark ? 'bg-[#111116] border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900 shadow-xs'">
            <div>
              <div class="w-9 h-9 rounded-xl border flex items-center justify-center mb-3"
                   [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-neutral-100 border-neutral-200 text-neutral-800'">
                <span class="material-symbols-rounded text-lg">layers</span>
              </div>
              <h3 class="text-sm font-headline font-bold m-0 mb-1 leading-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Itinerario & Agenda</h3>
              <p class="text-[11px] font-sans leading-relaxed m-0 mb-4" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Administra citas, tareas pendientes y cronograma diario.</p>
            </div>
            <div class="text-[11px] font-headline font-bold inline-flex items-center gap-1" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              <span>Entrar al módulo</span>
              <span class="material-symbols-rounded text-xs">arrow_forward</span>
            </div>
          </div>

          <!-- Card 5: White Card (Buzón de Mensajes) -->
          <div (click)="navigateToTab('messages')"
               class="rounded-2xl p-4 flex flex-col justify-between cursor-pointer border sm:col-span-2"
               [ngClass]="isDark ? 'bg-[#111116] border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900 shadow-xs'">
            <div>
              <div class="w-9 h-9 rounded-xl border flex items-center justify-center mb-3"
                   [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-neutral-100 border-neutral-200 text-neutral-800'">
                <span class="material-symbols-rounded text-lg">storefront</span>
              </div>
              <h3 class="text-sm font-headline font-bold m-0 mb-1 leading-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Buzón de Mensajes</h3>
              <p class="text-[11px] font-sans leading-relaxed m-0 mb-4" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Administra solicitudes directas, mensajes y avisos del catálogo.</p>
            </div>
            <div class="text-[11px] font-headline font-bold inline-flex items-center gap-1" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              <span>Entrar al módulo</span>
              <span class="material-symbols-rounded text-xs">arrow_forward</span>
            </div>
          </div>
        </div>

        <!-- 4. GRID DE 4 MÉTRICAS CLAVE (2x2) -->
        <div class="grid grid-cols-2 gap-2.5">
          <!-- Métrica 1: Tráfico -->
          <div class="p-3.5 rounded-2xl border flex flex-col justify-between"
               [ngClass]="isDark ? 'bg-[#111116] border-neutral-800/90 text-white' : 'bg-white border-neutral-200/90 text-neutral-900 shadow-sm'">
            <div class="flex items-center justify-between text-neutral-400 mb-2">
              <span class="text-[10px] font-headline font-bold uppercase tracking-wider">Tráfico Global</span>
              <span class="material-symbols-rounded text-neutral-400 text-base">visibility</span>
            </div>
            <div>
              <p class="text-xl font-headline font-extrabold tracking-tight m-0 leading-tight">
                {{ (metrics.homeViews || 0) + (metrics.linktreeViews || 0) | number }}
              </p>
              <span class="text-[10px] font-bold text-red-500 flex items-center gap-1 mt-1 font-sans">
                +18.4% <span class="text-neutral-400 font-normal">esta semana</span>
              </span>
            </div>
          </div>

          <!-- Métrica 2: Facturación -->
          <div (click)="navigateToTab('finances')"
               class="p-3.5 rounded-2xl border flex flex-col justify-between cursor-pointer active:scale-95 transition-all"
               [ngClass]="isDark ? 'bg-[#111116] border-neutral-800/90 text-white' : 'bg-white border-neutral-200/90 text-neutral-900 shadow-sm'">
            <div class="flex items-center justify-between text-neutral-400 mb-2">
              <span class="text-[10px] font-headline font-bold uppercase tracking-wider">Facturación</span>
              <span class="material-symbols-rounded text-red-500 text-base">payments</span>
            </div>
            <div>
              <p class="text-xl font-headline font-extrabold tracking-tight m-0 leading-tight">
                {{ formatCurrency(financeTotalPaid) }}
              </p>
              <span class="text-[10px] text-red-400 flex items-center gap-1 mt-1 font-sans truncate">
                Pend: {{ formatCurrency(financeTotalPending) }}
              </span>
            </div>
          </div>

          <!-- Métrica 3: Clientes -->
          <div (click)="navigateToTab('finances')"
               class="p-3.5 rounded-2xl border flex flex-col justify-between cursor-pointer active:scale-95 transition-all"
               [ngClass]="isDark ? 'bg-[#111116] border-neutral-800/90 text-white' : 'bg-white border-neutral-200/90 text-neutral-900 shadow-sm'">
            <div class="flex items-center justify-between text-neutral-400 mb-2">
              <span class="text-[10px] font-headline font-bold uppercase tracking-wider">Clientes</span>
              <span class="material-symbols-rounded text-neutral-400 text-base">group</span>
            </div>
            <div>
              <p class="text-xl font-headline font-extrabold tracking-tight m-0 leading-tight">
                {{ totalClientsCount }}
              </p>
              <span class="text-[10px] text-neutral-400 flex items-center gap-1 mt-1 font-sans">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                Activos registrados
              </span>
            </div>
          </div>

          <!-- Métrica 4: Sistema -->
          <div (click)="navigateToTab('stats')"
               class="p-3.5 rounded-2xl border flex flex-col justify-between cursor-pointer active:scale-95 transition-all"
               [ngClass]="isDark ? 'bg-[#111116] border-neutral-800/90 text-white' : 'bg-white border-neutral-200/90 text-neutral-900 shadow-sm'">
            <div class="flex items-center justify-between text-neutral-400 mb-2">
              <span class="text-[10px] font-headline font-bold uppercase tracking-wider">Sistema</span>
              <span class="material-symbols-rounded text-red-500 text-base">verified</span>
            </div>
            <div>
              <p class="text-xl font-headline font-extrabold tracking-tight m-0 leading-tight">
                99.9%
              </p>
              <span class="text-[10px] text-neutral-400 flex items-center gap-1 mt-1 font-sans">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                Latencia: 42ms
              </span>
            </div>
          </div>
        </div>





      </div>

      <!-- ═══════════════════════ VISTA ESCRITORIO ARCHITECTURE (>= lg) ═══════════════════════ -->
      <div class="hidden lg:flex flex-col gap-5 tab-enter font-sans">

        <!-- ════ 1. HERO PRINCIPAL: PANEL NEGRO CON ROTBOT + ACCESO RÁPIDO ════ -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          <!-- PANEL NEGRO HERO (COL-SPAN-8) -->
          <div class="lg:col-span-8 bg-[#09090b] text-white rounded-[26px] border border-neutral-800 p-7 sm:p-9 relative overflow-hidden flex flex-col justify-between min-h-[340px] shadow-xl">
            
            <!-- Círculos concéntricos sutiles de fondo (igual que la captura) -->
            <div class="absolute -right-16 -bottom-16 w-80 h-80 rounded-full border border-neutral-800/40 pointer-events-none"></div>
            <div class="absolute -right-8 -bottom-8 w-64 h-64 rounded-full border border-neutral-800/30 pointer-events-none"></div>
            <div class="absolute right-8 bottom-8 w-48 h-48 rounded-full border border-neutral-800/20 pointer-events-none"></div>

            <!-- Contenido textual a la izquierda -->
            <div class="relative z-10 max-w-[60%] flex flex-col justify-between h-full">
              <div>
                <!-- Pill Saludo con Punto Rojo -->
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/90 text-xs font-sans text-neutral-300 mb-5">
                  <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <span>{{ greetingPillText }}</span>
                </div>

                <!-- Título Bienvenido Santiago en blanco puro, sin degradados -->
                <h2 class="text-3xl sm:text-4xl lg:text-[42px] font-headline font-bold tracking-tight leading-[1.08] text-white m-0 mb-3">
                  Bienvenido,<br>
                  Santiago!
                </h2>

                <!-- Subtítulo en gris claro -->
                <p class="text-xs sm:text-sm font-sans text-neutral-400 leading-relaxed m-0 mb-6 max-w-md">
                  Gestión centralizada de catálogo, inventario, finanzas y operaciones de PortaLink.
                </p>
              </div>

              <!-- Fila Fecha con ícono de calendario rojo -->
              <div class="flex items-center gap-2 text-xs font-sans text-neutral-400 pt-2">
                <span class="material-symbols-rounded text-base text-red-500">calendar_today</span>
                <span>{{ formattedHeroDate }}</span>
              </div>
            </div>

            <!-- Imagen 3D Rotbot a la derecha del panel negro -->
            <div class="absolute right-4 sm:right-8 lg:right-10 bottom-0 top-0 flex items-center justify-center pointer-events-none z-10">
              <img src="assets/images/rotbot4.png"
                   alt="RotBot Copilot"
                   class="w-48 sm:w-56 lg:w-64 h-auto max-h-[300px] object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] transform transition-transform duration-500 hover:scale-105">
            </div>

          </div>

          <!-- TARJETA ACCESO RÁPIDO (COL-SPAN-4) -->
          <div class="lg:col-span-4 rounded-[26px] border p-6 flex flex-col justify-between transition-all duration-200"
               [ngClass]="isDark ? 'bg-[#0e0e13] border-neutral-800 text-white shadow-sm' : 'bg-white border-neutral-200 text-neutral-900 shadow-sm'">
            
            <div>
              <div class="text-[11px] font-headline font-extrabold uppercase tracking-widest text-neutral-500 mb-4">
                Acceso Rápido
              </div>

              <div class="space-y-1">
                <!-- 1. Inventario & Finanzas -->
                <div (click)="navigateToTab('finances')"
                     class="flex items-center justify-between p-2 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-900/60 transition-colors cursor-pointer group">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-2xl border flex items-center justify-center transition-colors"
                         [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-neutral-100 border-neutral-200 text-neutral-800'">
                      <span class="material-symbols-rounded text-xl">payments</span>
                    </div>
                    <div>
                      <p class="text-xs font-headline font-bold m-0 group-hover:text-red-500 transition-colors"
                         [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Gestión de Finanzas</p>
                      <p class="text-[11px] text-neutral-400 m-0">Cuentas de cobro, clientes y pagos</p>
                    </div>
                  </div>
                  <span class="material-symbols-rounded text-neutral-400 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all text-base">chevron_right</span>
                </div>

                <!-- 2. Analíticas con acento rojo -->
                <div (click)="navigateToTab('rotbot')"
                     class="flex items-center justify-between p-2 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-900/60 transition-colors cursor-pointer group">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-2xl border flex items-center justify-center bg-red-500/10 border-red-500/25 text-red-500">
                      <span class="material-symbols-rounded text-xl">monitoring</span>
                    </div>
                    <div>
                      <p class="text-xs font-headline font-bold m-0 group-hover:text-red-500 transition-colors"
                         [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Analíticas & Métricas</p>
                      <p class="text-[11px] text-neutral-400 m-0">Diagnóstico en tiempo real</p>
                    </div>
                  </div>
                  <span class="material-symbols-rounded text-neutral-400 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all text-base">chevron_right</span>
                </div>

                <!-- 3. Biblioteca & SQL con acento rojo -->
                <div (click)="navigateToTab('library')"
                     class="flex items-center justify-between p-2 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-900/60 transition-colors cursor-pointer group">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-2xl border flex items-center justify-center bg-red-500/10 border-red-500/25 text-red-500">
                      <span class="material-symbols-rounded text-xl">category</span>
                    </div>
                    <div>
                      <p class="text-xs font-headline font-bold m-0 group-hover:text-red-500 transition-colors"
                         [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Biblioteca & SQL</p>
                      <p class="text-[11px] text-neutral-400 m-0">Consultas, tablas y apuntes</p>
                    </div>
                  </div>
                  <span class="material-symbols-rounded text-neutral-400 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all text-base">chevron_right</span>
                </div>

                <!-- 4. Itinerario & Agenda -->
                <div (click)="navigateToTab('itinerary')"
                     class="flex items-center justify-between p-2 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-900/60 transition-colors cursor-pointer group">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-2xl border flex items-center justify-center transition-colors"
                         [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-neutral-100 border-neutral-200 text-neutral-800'">
                      <span class="material-symbols-rounded text-xl">layers</span>
                    </div>
                    <div>
                      <p class="text-xs font-headline font-bold m-0 group-hover:text-red-500 transition-colors"
                         [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Itinerario & Agenda</p>
                      <p class="text-[11px] text-neutral-400 m-0">Tareas y eventos del día</p>
                    </div>
                  </div>
                  <span class="material-symbols-rounded text-neutral-400 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all text-base">chevron_right</span>
                </div>

                <!-- 5. Buzón de Mensajes -->
                <div (click)="navigateToTab('messages')"
                     class="flex items-center justify-between p-2 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-900/60 transition-colors cursor-pointer group">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-2xl border flex items-center justify-center transition-colors"
                         [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-neutral-100 border-neutral-200 text-neutral-800'">
                      <span class="material-symbols-rounded text-xl">storefront</span>
                    </div>
                    <div>
                      <p class="text-xs font-headline font-bold m-0 group-hover:text-red-500 transition-colors"
                         [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Buzón de Mensajes</p>
                      <p class="text-[11px] text-neutral-400 m-0">{{ unreadMessages > 0 ? (unreadMessages + ' mensajes sin leer') : 'Canal directo de contacto' }}</p>
                    </div>
                  </div>
                  <span class="material-symbols-rounded text-neutral-400 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all text-base">chevron_right</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        <!-- ════ 3. BUSCADOR INTELIGENTE GEMINI IA & COMANDOS POR VOZ ════ -->
        <section class="rounded-2xl border p-4 transition-all duration-200 mb-5"
                 [ngClass]="isDark ? 'bg-[#0e0e13] border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'">
          <div class="filter-inputs-row">
            <div class="search-input-box">
              <span class="material-symbols-rounded search-icon">search</span>
              <input type="text"
                     [(ngModel)]="aiQuery"
                     (keyup.enter)="askGeminiCommand()"
                     [disabled]="isAiSearching"
                     [placeholder]="isAiSearching ? 'Consultando Gemini Flash...' : displayPlaceholder"
                     class="search-field">
              
              <div class="absolute right-2 flex items-center gap-1.5 z-10">
                <button *ngIf="aiQuery && !isAiSearching && !isVoiceRecording"
                        (click)="aiQuery = ''; activeAiResponse = null;"
                        class="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                        title="Borrar texto">
                  <span class="material-symbols-rounded text-sm">close</span>
                </button>

                <!-- Micrófono Voz Gemini -->
                <button (click)="toggleVoiceInput()"
                        [disabled]="isAiSearching || isAiVoiceProcessing"
                        class="p-1.5 rounded-lg transition-all cursor-pointer"
                        [ngClass]="isVoiceRecording 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'"
                        title="Comando por voz universal">
                  <span class="material-symbols-rounded text-base">mic</span>
                </button>

                <!-- Botón Enviar -->
                <button (click)="askGeminiCommand()"
                        [disabled]="isAiSearching || !aiQuery.trim() || isVoiceRecording"
                        class="btn-action-primary text-xs !h-8 !px-3.5 !rounded-lg cursor-pointer">
                  <span>{{ isAiSearching ? '...' : 'Preguntar' }}</span>
                </button>
              </div>
            </div>

            <!-- Sugerencias rápidas tipo pill -->
            <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              <button *ngFor="let sug of quickSuggestions"
                      (click)="selectSuggestion(sug)"
                      class="px-2.5 py-1.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer whitespace-nowrap"
                      [ngClass]="isDark ? 'border-neutral-800 bg-neutral-900/80 text-neutral-300 hover:border-neutral-700' : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-300'">
                {{ sug }}
              </button>
            </div>
          </div>

          <!-- Visualizador de Onda de Audio en Vivo -->
          <div *ngIf="isVoiceRecording" class="flex items-center gap-2 py-1 text-xs text-red-500 animate-pulse font-sans">
            <span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>Escuchando audio... pulsa el micrófono nuevamente para interpretar con Gemini</span>
          </div>

          <div *ngIf="voiceErrorMessage" class="text-xs text-red-500 bg-red-500/10 px-3 py-1 rounded-xl border border-red-500/20 font-sans">
            {{ voiceErrorMessage }}
          </div>

          <!-- Tarjeta de Respuesta IA Dinámica -->
          <div *ngIf="activeAiResponse"
               class="rounded-2xl border p-4 sm:p-5 mt-2 space-y-3 animate-dropdown"
               [ngClass]="isDark ? 'bg-neutral-950/90 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-900'">
            <div class="flex items-center justify-between pb-2.5 border-b"
                 [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
              <div class="flex items-center gap-2">
                <span class="material-symbols-rounded text-red-500">auto_awesome</span>
                <span class="text-sm font-headline font-bold">Respuesta Gemini Flash</span>
                <span class="text-xs text-neutral-400 font-sans">· {{ activeAiResponse.query }}</span>
              </div>
              <button (click)="activeAiResponse = null" class="text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-1">
                <span class="material-symbols-rounded text-base">close</span>
              </button>
            </div>

            <p class="text-xs sm:text-sm font-sans leading-relaxed m-0">{{ activeAiResponse.data.summary || activeAiResponse.data.analysis }}</p>

            <div *ngIf="activeAiResponse.data.targetTab" class="pt-1 flex justify-end">
              <button (click)="navigateToTab(activeAiResponse.data.targetTab)"
                      class="btn-action-primary text-xs !h-8 !px-4">
                <span>{{ activeAiResponse.data.actionText || 'Ver en Módulo' }}</span>
                <span class="material-symbols-rounded text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>

        <!-- ════ 4. GRID DE 5 MÓDULOS (2 NEGROS + 3 BLANCOS SEGÚN LA CAPTURA) ════ -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          <!-- Card 1: Black Card (Gestionar Finanzas) -->
          <div (click)="navigateToTab('finances')"
               class="rounded-[22px] p-5 flex flex-col justify-between cursor-pointer group transition-all duration-200 hover:-translate-y-1 shadow-sm border"
               [ngClass]="isDark ? 'bg-[#09090b] border-neutral-800 text-white hover:border-neutral-700' : 'bg-[#0a0a0d] border-neutral-900 text-white shadow-md'">
            <div>
              <div class="w-11 h-11 rounded-2xl border flex items-center justify-center bg-neutral-900/90 border-neutral-800 mb-4"
                   style="color: #ffffff !important;">
                <span class="material-symbols-rounded text-xl" style="color: #ffffff !important;">payments</span>
              </div>
              <h3 class="text-base font-headline font-bold m-0 mb-2 leading-tight dark-card-white"
                  style="color: #ffffff !important;">
                Gestionar Finanzas
              </h3>
              <p class="text-xs font-sans text-neutral-400 leading-relaxed m-0 mb-6">
                Control integral de cuentas de cobro, facturación, clientes y estados de pago en tiempo real.
              </p>
            </div>
            <div class="text-xs font-headline font-bold inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-transform dark-card-white"
                 style="color: #ffffff !important;">
              <span style="color: #ffffff !important;">Entrar al módulo</span>
              <span class="material-symbols-rounded text-sm" style="color: #ffffff !important;">arrow_forward</span>
            </div>
          </div>

          <!-- Card 2: Black Card with Red Accent (Reporte y Analíticas) -->
          <div (click)="navigateToTab('rotbot')"
               class="rounded-[22px] p-5 flex flex-col justify-between cursor-pointer group transition-all duration-200 hover:-translate-y-1 shadow-sm border"
               [ngClass]="isDark ? 'bg-[#09090b] border-neutral-800 text-white hover:border-red-500/40' : 'bg-[#0a0a0d] border-neutral-900 text-white shadow-md'">
            <div>
              <div class="w-11 h-11 rounded-2xl border flex items-center justify-center bg-red-500/15 border-red-500/30 text-red-500 mb-4">
                <span class="material-symbols-rounded text-xl text-red-500">monitoring</span>
              </div>
              <h3 class="text-base font-headline font-bold m-0 mb-2 leading-tight dark-card-white"
                  style="color: #ffffff !important;">
                Reporte y Analíticas
              </h3>
              <p class="text-xs font-sans text-neutral-400 leading-relaxed m-0 mb-6">
                Diagnóstico de calidad, gráficos de distribución y métricas clave en tiempo real.
              </p>
            </div>
            <div class="text-xs font-headline font-bold text-red-500 inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
              <span>Entrar al módulo</span>
              <span class="material-symbols-rounded text-sm">arrow_forward</span>
            </div>
          </div>

          <!-- Card 3: White Card (Biblioteca & SQL) -->
          <div (click)="navigateToTab('library')"
               class="rounded-[22px] p-5 flex flex-col justify-between cursor-pointer group transition-all duration-200 hover:-translate-y-1 shadow-sm border"
               [ngClass]="isDark ? 'bg-[#111116] border-neutral-800 text-white hover:border-neutral-700' : 'bg-white border-neutral-200 text-neutral-900 hover:border-neutral-300'">
            <div>
              <div class="w-11 h-11 rounded-2xl border flex items-center justify-center mb-4 transition-colors"
                   [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-neutral-100 border-neutral-200 text-neutral-800'">
                <span class="material-symbols-rounded text-xl">category</span>
              </div>
              <h3 class="text-base font-headline font-bold m-0 mb-2 leading-tight"
                  [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                Biblioteca & SQL
              </h3>
              <p class="text-xs font-sans leading-relaxed m-0 mb-6"
                  [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                Administra las categorías, esquemas y consultas de bases de datos del sistema.
              </p>
            </div>
            <div class="text-xs font-headline font-bold inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-transform"
                 [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              <span>Entrar al módulo</span>
              <span class="material-symbols-rounded text-sm">arrow_forward</span>
            </div>
          </div>

          <!-- Card 4: White Card (Itinerario & Agenda) -->
          <div (click)="navigateToTab('itinerary')"
               class="rounded-[22px] p-5 flex flex-col justify-between cursor-pointer group transition-all duration-200 hover:-translate-y-1 shadow-sm border"
               [ngClass]="isDark ? 'bg-[#111116] border-neutral-800 text-white hover:border-neutral-700' : 'bg-white border-neutral-200 text-neutral-900 hover:border-neutral-300'">
            <div>
              <div class="w-11 h-11 rounded-2xl border flex items-center justify-center mb-4 transition-colors"
                   [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-neutral-100 border-neutral-200 text-neutral-800'">
                <span class="material-symbols-rounded text-xl">layers</span>
              </div>
              <h3 class="text-base font-headline font-bold m-0 mb-2 leading-tight"
                  [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                Itinerario & Agenda
              </h3>
              <p class="text-xs font-sans leading-relaxed m-0 mb-6"
                  [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                Administra las actividades programadas, citas y tareas pendientes del itinerario.
              </p>
            </div>
            <div class="text-xs font-headline font-bold inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-transform"
                 [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              <span>Entrar al módulo</span>
              <span class="material-symbols-rounded text-sm">arrow_forward</span>
            </div>
          </div>

          <!-- Card 5: White Card (Buzón de Mensajes) -->
          <div (click)="navigateToTab('messages')"
               class="rounded-[22px] p-5 flex flex-col justify-between cursor-pointer group transition-all duration-200 hover:-translate-y-1 shadow-sm border"
               [ngClass]="isDark ? 'bg-[#111116] border-neutral-800 text-white hover:border-neutral-700' : 'bg-white border-neutral-200 text-neutral-900 hover:border-neutral-300'">
            <div>
              <div class="w-11 h-11 rounded-2xl border flex items-center justify-center mb-4 transition-colors"
                   [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-neutral-100 border-neutral-200 text-neutral-800'">
                <span class="material-symbols-rounded text-xl">storefront</span>
              </div>
              <h3 class="text-base font-headline font-bold m-0 mb-2 leading-tight"
                  [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                Buzón de Mensajes
              </h3>
              <p class="text-xs font-sans leading-relaxed m-0 mb-6"
                  [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                Administra solicitudes de clientes, mensajes entrantes y alertas del catálogo.
              </p>
            </div>
            <div class="text-xs font-headline font-bold inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-transform"
                 [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              <span>Entrar al módulo</span>
              <span class="material-symbols-rounded text-sm">arrow_forward</span>
            </div>
          </div>

        </div>

      </div>

      <!-- Modal de Sesión Expirada -->
      <div *ngIf="showSessionExpiredModal" class="modal-backdrop fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
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
                  class="w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest text-white bg-red-600 hover:bg-red-500 active:bg-red-700 transition-all duration-200 cursor-pointer shadow-lg shadow-red-500/25">
            Iniciar sesión de nuevo
          </button>
        </div>
      </div>
    </ng-container>

    <!-- ═══════════════════════ SKELETON LOADER (1:1 PIXEL-PERFECT MATCH) ═══════════════════════ -->
    <ng-template #skeleton>
      <div class="space-y-6 font-sans">

        <!-- 1. Hero 2-Column Grid Skeleton (Black Panel + Quick Access) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <!-- Black Hero Panel Skeleton -->
          <div class="lg:col-span-8 rounded-[26px] p-7 sm:p-9 min-h-[340px] flex flex-col justify-between"
               [ngClass]="isDark ? 'bg-[#09090b] border border-neutral-800' : 'bg-neutral-900 border border-neutral-900'">
            <div class="space-y-3 max-w-[60%]">
              <div class="h-5 w-24 rounded-full skeleton-shimmer opacity-40"></div>
              <div class="h-10 w-64 rounded-xl skeleton-shimmer opacity-40"></div>
              <div class="h-10 w-44 rounded-xl skeleton-shimmer opacity-40"></div>
              <div class="h-4 w-72 rounded-full skeleton-shimmer opacity-30"></div>
            </div>
            <div class="h-4 w-40 rounded-full skeleton-shimmer opacity-30"></div>
          </div>

          <!-- Quick Access Card Skeleton -->
          <div class="lg:col-span-4 rounded-[26px] border p-6 flex flex-col justify-between"
               [ngClass]="isDark ? 'bg-[#0e0e13] border-neutral-800' : 'bg-white border-neutral-200'">
            <div class="h-3.5 w-28 rounded-full skeleton-shimmer mb-4"></div>
            <div class="space-y-3">
              <div *ngFor="let _ of [1,2,3,4,5]" class="flex items-center justify-between p-1.5">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-2xl skeleton-shimmer"></div>
                  <div class="space-y-1.5">
                    <div class="h-3 w-28 rounded-full skeleton-shimmer"></div>
                    <div class="h-2.5 w-36 rounded-full skeleton-shimmer opacity-60"></div>
                  </div>
                </div>
                <div class="w-4 h-4 rounded skeleton-shimmer"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Controls / Search Skeleton -->
        <div class="rounded-2xl border p-4"
             [ngClass]="isDark ? 'bg-[#111116] border-neutral-800' : 'bg-white border-neutral-200'">
          <div class="h-10 w-full rounded-xl skeleton-shimmer"></div>
        </div>

        <!-- 3. 5 Module Cards Grid Skeleton -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div *ngFor="let _ of [1,2,3,4,5]" 
               class="rounded-[22px] border p-5 flex flex-col justify-between h-48"
               [ngClass]="isDark ? 'bg-[#111116] border-neutral-800' : 'bg-white border-neutral-200'">
            <div class="space-y-3">
              <div class="w-11 h-11 rounded-2xl skeleton-shimmer"></div>
              <div class="h-4 w-32 rounded-lg skeleton-shimmer"></div>
              <div class="h-3 w-40 rounded-full skeleton-shimmer"></div>
            </div>
            <div class="h-3 w-24 rounded-full skeleton-shimmer"></div>
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
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.98); }
      to   { opacity: 1; transform: scale(1); }
    }
    .animate-fadeIn { animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    /* Modo Claro: Líneas Divisoras y Bordes Definidos */
    :host-context(.theme-light) .border-neutral-100,
    :host-context(:root:not(.theme-dark)) .border-neutral-100 {
      border-color: #d4d4d8 !important;
    }
    :host-context(.theme-light) .divide-neutral-100 > :not([hidden]) ~ :not([hidden]),
    :host-context(:root:not(.theme-dark)) .divide-neutral-100 > :not([hidden]) ~ :not([hidden]) {
      border-color: #d4d4d8 !important;
    }
    :host-context(.theme-light) .border-neutral-200,
    :host-context(.theme-light) [class*="border-neutral-200"],
    :host-context(:root:not(.theme-dark)) .border-neutral-200,
    :host-context(:root:not(.theme-dark)) [class*="border-neutral-200"] {
      border-color: #d4d4d8 !important;
    }
    :host-context(.theme-light) .divide-neutral-200 > :not([hidden]) ~ :not([hidden]),
    :host-context(:root:not(.theme-dark)) .divide-neutral-200 > :not([hidden]) ~ :not([hidden]) {
      border-color: #d4d4d8 !important;
    }
    .dark-card-white,
    .dark-card-white * {
      color: #ffffff !important;
    }
  `]
})
export class DashHomeComponent implements OnInit, OnDestroy {
  @Input() theme = 'light';
  @Output() tabChange = new EventEmitter<string>();

  private analyticsService = inject(AnalyticsService);
  private sessionTimer = inject(SessionTimerService);
  private financeService = inject(FinanceService);
  private commandCenterService = inject(CommandCenterService);
  private audioRecorder = inject(AudioRecorderService);
  private router = inject(Router);
  private messagesService = inject(MessagesService);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

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
  currentDateShort = '';
  currentTimeShort = '';

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

  get formattedCurrentDate(): string {
    const now = new Date();
    const weekday = now.toLocaleDateString('es-ES', { weekday: 'long' });
    const day = now.getDate();
    const month = now.toLocaleDateString('es-ES', { month: 'long' });
    const year = now.getFullYear();
    const capWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    const capMonth = month.charAt(0).toUpperCase() + month.slice(1);
    return `${capWeekday}, ${day} de ${capMonth} de ${year}`;
  }

  get greetingPillText(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Buenos días';
    if (hour >= 12 && hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }

  get formattedHeroDate(): string {
    const now = new Date();
    const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
    const day = now.getDate();
    const month = now.toLocaleDateString('en-US', { month: 'long' });
    const year = now.getFullYear();
    return `${weekday}, ${day} ${month} ${year}`;
  }

  rotatingPhrases: string[] = [
    '¿qué haremos hoy?',
    '¿ya estudiaste sql?',
    '¿ya estudiaste inglés?',
    '¿ya leíste arquitectura?',
    '¿y las finanzas?'
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

  get isDark() { return this.theme === 'dark'; }

  ngOnInit() {
    this.updateClock();
    this.ngZone.runOutsideAngular(() => {
      this.clockInterval = setInterval(() => {
        this.updateClock();
        this.cdr.markForCheck();
      }, 1000);
    });

    // Timeout de seguridad: asegura que la UI nunca quede bloqueada en skeleton
    setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    }, 1200);

    // 1. Cargar Radar y Accesos Recientes
    this.loadRadarData();

    // 2. Cargar Analíticas
    this.analyticsService.getMetrics().subscribe({
      next: (m) => {
        this.metrics = m || this.metrics;
        this.checkLoadingState();
      },
      error: () => {
        this.checkLoadingState();
      }
    });

    // 3. Cargar Finanzas Reales
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
          this.cdr.markForCheck();
        }),
        this.audioRecorder.audioVolume$.subscribe(vol => {
          this.audioVolume = vol;
          this.cdr.markForCheck();
        }),
        this.audioRecorder.recordedAudio$.subscribe(audio => {
          this.processRecordedVoiceAudio(audio);
        }),
        this.audioRecorder.error$.subscribe(errMsg => {
          this.voiceErrorMessage = errMsg;
          this.cdr.markForCheck();
          setTimeout(() => {
            this.voiceErrorMessage = '';
            this.cdr.markForCheck();
          }, 5000);
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
      this.cdr.markForCheck();
    });

    this.sessionExpiredSub = this.sessionTimer.sessionExpired$.subscribe(() => {
      this.showSessionExpiredModal = true;
      this.cdr.markForCheck();
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
    this.isLoading = false;
    this.cdr.markForCheck();
  }

  loadRadarData() {
    this.isRadarLoading = true;
    this.cdr.markForCheck();
    this.commandCenterService.getRadar().subscribe({
      next: (res) => {
        this.isRadarLoading = false;
        if (res && res.ok) {
          this.radarData = res;
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.isRadarLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadDynamicSuggestions() {
    this.commandCenterService.getSuggestions().subscribe({
      next: (suggs) => {
        if (suggs && suggs.length > 0) {
          this.quickSuggestions = suggs;
          this.cdr.markForCheck();
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
    if (color === 'red') {
      return 'bg-red-500/10 text-red-500 border border-red-500/20';
    }
    return 'bg-neutral-500/10 text-neutral-400 border border-neutral-500/20';
  }

  getSectionDotColor(section: string): string {
    switch (section) {
      case 'finances': return 'bg-red-500';
      case 'rotbot': return 'bg-red-500';
      case 'messages': return 'bg-red-500';
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
    const rawShort = now.toLocaleDateString('es-CO', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
    this.currentDateShort = rawShort.charAt(0).toUpperCase() + rawShort.slice(1);
    this.currentTimeShort = now.toLocaleTimeString('es-CO', {
      hour: '2-digit', minute: '2-digit'
    });
  }

  /**
   * Carga los contadores e insignias del panel (leads pendientes y mensajes no leídos).
   * Implementa fallback en caso de fallo de red consultando el almacenamiento local.
   */
  private loadBadges() {
    try {
      // 1. Conteo de prospectos/leads pendientes en almacenamiento local
      const leads = JSON.parse(localStorage.getItem('portalink_admin_leads') || '[]');
      this.pendingLeads = leads.filter((l: any) => l.status === 'Pendiente').length;
    } catch { }

    // 2. Consulta de mensajes no leídos desde el servicio de mensajes
    this.messagesService.getMessages().subscribe({
      next: (msgs) => {
        const list = msgs || [];
        // Filtra los mensajes cuyo estado sea 'unread'
        this.unreadMessages = list.filter(m => (m.status || '').toLowerCase() === 'unread').length;
      },
      error: () => {
        // Fallback resiliente: lee mensajes en caché local si la API remota no responde
        try {
          const local = JSON.parse(localStorage.getItem('portalink_contact_messages') || '[]');
          this.unreadMessages = local.filter((m: any) => (m.status || '').toLowerCase() === 'unread').length;
        } catch {
          this.unreadMessages = 0;
        }
      }
    });
  }

  refreshAll() {
    this.isLoading = true;
    this.loadFinanceSummary();
    this.loadBadges();
    this.loadRadarData();
    this.loadDynamicSuggestions();
    this.analyticsService.getMetrics().subscribe({
      next: (m) => {
        this.metrics = m || this.metrics;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
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
    this.ngZone.runOutsideAngular(() => {
      this.typeInterval = setInterval(() => {
        if (this.aiQuery || this.isAiSearching || this.activeAiResponse) return;
        const target = this.placeholders[this.placeholderIdx];
        if (this.charIdx < target.length) {
          this.displayPlaceholder = target.substring(0, this.charIdx + 1);
          this.charIdx++;
          this.cdr.markForCheck();
        } else {
          clearInterval(this.typeInterval);
          this.pauseTimeout = setTimeout(() => {
            const eraseInterval = setInterval(() => {
              if (this.charIdx > 0) {
                this.charIdx--;
                this.displayPlaceholder = target.substring(0, this.charIdx);
                this.cdr.markForCheck();
              } else {
                clearInterval(eraseInterval);
                this.placeholderIdx = (this.placeholderIdx + 1) % this.placeholders.length;
                this.startTypewriter();
              }
            }, 25);
          }, 2200);
        }
      }, 60);
    });
  }

  private startPhraseRotation() {
    this.ngZone.runOutsideAngular(() => {
      this.phraseInterval = setInterval(() => {
        this.isPhraseFading = true;
        this.cdr.markForCheck();
        this.phraseTimeout = setTimeout(() => {
          this.currentPhraseIndex = (this.currentPhraseIndex + 1) % this.rotatingPhrases.length;
          this.isPhraseFading = false;
          this.cdr.markForCheck();
        }, 300);
      }, 10000);
    });
  }
}
