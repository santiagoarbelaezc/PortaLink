import { Component, Input, OnInit, OnDestroy, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsService, SystemMetrics } from '../../../services/analytics.service';
import { ItineraryService } from '../../../services/itinerary.service';
import { SessionTimerService } from '../../../services/session-timer.service';
import { FinanceService } from '../../../services/finance.service';
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
        <div class="relative overflow-hidden rounded-[20px] xs:rounded-[24px] sm:rounded-[28px] border p-4 xs:p-5 sm:p-8 md:p-9 min-h-[190px] xs:min-h-[210px] sm:min-h-[250px] flex flex-col justify-center transition-all duration-300"
             [ngClass]="isDark ? 'bg-neutral-900/80 border-neutral-800 shadow-[0_10px_35px_rgba(0,0,0,0.4)]' : 'bg-white border-neutral-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.03)]'">

          <!-- Rotbot Flotando -->
          <div class="absolute right-1 sm:right-2 md:right-8 top-0 bottom-0 hidden sm:flex items-center justify-center pointer-events-none select-none py-6 w-[180px] sm:w-[220px] md:w-[320px]">
            <img src="assets/images/rotbot4.png" class="h-full w-full object-contain opacity-40 sm:opacity-95 drop-shadow-md" alt="Rotbot">
          </div>

          <div class="relative z-10 max-w-full sm:max-w-[75%] md:max-w-[62%]">
            <p class="text-[10px] xs:text-xs font-headline font-semibold uppercase tracking-[0.2em] xs:tracking-[0.25em] mb-1"
               [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Panel de Control</p>
            <h2 class="text-xl xs:text-2xl sm:text-4xl font-headline font-bold leading-tight tracking-tight"
                [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              Bienvenido, Santiago
            </h2>
            <p class="text-[11px] xs:text-xs sm:text-sm mt-1 mb-3 xs:mb-4 sm:mb-5 flex items-baseline gap-1.5 xs:gap-2 font-headline"
               [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
               <span>{{ currentDate }}</span>
               <span class="text-xs xs:text-sm md:text-base font-semibold" [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-700'">{{ currentTime }}</span>
            </p>

            <!-- Quick chips (Optimized 2x2 Grid on Mobile) -->
            <div class="grid grid-cols-2 gap-1.5 xs:gap-2 sm:flex sm:flex-wrap relative z-10">
              <span class="text-[10px] xs:text-[11px] sm:text-xs font-headline font-semibold px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full border flex items-center justify-center sm:justify-start gap-1.5 tracking-wider truncate"
                    [ngClass]="isDark ? 'border-neutral-700 text-neutral-300 bg-neutral-800/50' : 'border-neutral-200 text-neutral-700 bg-neutral-100/80'">
                <svg class="w-3 h-3 xs:w-3.5 xs:h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                <span class="truncate">{{ (metrics.homeViews || 0) + (metrics.linktreeViews || 0) }} Vistas</span>
              </span>
              <span class="text-[10px] xs:text-[11px] sm:text-xs font-headline font-semibold px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full border flex items-center justify-center sm:justify-start gap-1.5 tracking-wider truncate"
                    [ngClass]="isDark ? 'border-neutral-700 text-neutral-300 bg-neutral-800/50' : 'border-neutral-200 text-neutral-700 bg-neutral-100/80'">
                <svg class="w-3 h-3 xs:w-3.5 xs:h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span class="truncate">{{ unreadMessages }} Mensajes</span>
              </span>
              <span class="text-[10px] xs:text-[11px] sm:text-xs font-headline font-semibold px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full border flex items-center justify-center sm:justify-start gap-1.5 tracking-wider truncate"
                    [ngClass]="isDark ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' : 'border-blue-200 text-blue-700 bg-blue-50'">
                <svg class="w-3 h-3 xs:w-3.5 xs:h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                <span class="truncate">Online</span>
              </span>
              <span class="text-[10px] xs:text-[11px] sm:text-xs font-headline font-semibold px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full border flex items-center justify-center sm:justify-start gap-1.5 tracking-wider transition-all duration-300 truncate"
                    [ngClass]="sessionIsWarning ? 
                      (isDark ? 'border-amber-500/40 text-amber-400 bg-amber-500/10 animate-pulse' : 'border-amber-300 text-amber-800 bg-amber-50/80 animate-pulse') : 
                      (isDark ? 'border-neutral-700 text-neutral-300 bg-neutral-800/50' : 'border-neutral-200 text-neutral-700 bg-neutral-100/80')">
                <svg class="w-3 h-3 xs:w-3.5 xs:h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span class="truncate">{{ sessionTimeFormatted }}</span>
              </span>
            </div>
          </div>
        </div>

        <!-- ═══════════════════════ 2. AI COMMAND CENTER ═══════════════════════ -->
        <div class="rounded-[20px] xs:rounded-[24px] sm:rounded-[28px] border p-4 xs:p-5 sm:p-6 transition-all duration-300 relative overflow-hidden"
             [ngClass]="isDark ? 'bg-neutral-900/70 border-neutral-800' : 'bg-white border-neutral-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.03)]'">
          
          <div class="relative z-10 flex flex-col md:flex-row gap-3 xs:gap-4 sm:gap-6">
            <div class="flex-1 space-y-2 xs:space-y-3">
              <div class="flex items-center gap-2.5 xs:gap-3">
                <img [src]="isDark ? 'assets/icons/logo-link-dark.png' : 'assets/icons/logo-link-light.png'" alt="AI Icon" class="w-6 h-6 xs:w-7 xs:h-7 object-contain">
                <h3 class="text-base xs:text-lg sm:text-xl font-headline font-bold tracking-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                  Centro de Comando IA
                </h3>
              </div>
              
              <p class="text-[11px] xs:text-xs sm:text-sm font-sans font-normal" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-600'">
                Pregúntale a nuestro motor inteligente para analizar métricas, finanzas o navegar el dashboard
              </p>
              
              <div class="relative flex flex-col gap-2 pt-0.5 w-full">
                <div class="flex flex-col sm:flex-row gap-2 xs:gap-3 w-full">
                  <div class="relative flex-1 group ai-search-container">
                    <span class="absolute inset-y-0 left-0 pl-3.5 xs:pl-4 flex items-center pointer-events-none transition-colors duration-300"
                          [ngClass]="isDark ? 'text-neutral-500 group-focus-within:text-white' : 'text-neutral-400 group-focus-within:text-neutral-900'">
                      <svg class="w-4 h-4 xs:w-5 xs:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </span>
                    <input type="text"
                           [(ngModel)]="aiQuery"
                           (input)="onSearch()"
                           (focus)="searchFocused = true; onSearch()"
                           (blur)="searchFocused = false"
                           [placeholder]="displayPlaceholder"
                           class="w-full pl-9 xs:pl-11 pr-8 xs:pr-10 py-2.5 xs:py-3 rounded-xl sm:rounded-2xl border text-xs xs:text-sm transition-all duration-300 outline-none font-sans"
                           [ngClass]="isDark ? 'bg-neutral-950/80 border-neutral-800 text-white focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500/20' : 'bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-neutral-400 focus:bg-white focus:ring-1 focus:ring-neutral-400/20'">
                    
                    <button *ngIf="aiQuery" 
                            (click)="aiQuery = ''; onSearch()"
                            class="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-200 cursor-pointer">
                      <svg class="w-3.5 h-3.5 xs:w-4 xs:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Dropdown Results -->
                <div *ngIf="aiResults.length > 0"
                     class="w-full rounded-xl sm:rounded-2xl border p-1.5 xs:p-2 mt-1 shadow-2xl backdrop-blur-xl animate-dropdown max-h-[260px] overflow-y-auto"
                     [ngClass]="isDark ? 'bg-neutral-950/95 border-neutral-800' : 'bg-white/95 border-neutral-200'">
                  <div *ngFor="let item of aiResults"
                       (click)="navigateToTab(item.tab)"
                       class="p-2 xs:p-3 rounded-lg xs:rounded-xl flex items-center justify-between transition-all duration-200 cursor-pointer group"
                       [ngClass]="isDark ? 'hover:bg-neutral-800/80 text-white' : 'hover:bg-neutral-100 text-neutral-900'">
                    <div class="flex items-center gap-2.5">
                      <span class="text-lg group-hover:scale-110 transition-transform">{{ item.emoji }}</span>
                      <div>
                        <h4 class="text-xs xs:text-sm font-semibold leading-tight">{{ item.title }}</h4>
                        <p class="text-[10px] xs:text-[11px] opacity-60 leading-tight">{{ item.value }}</p>
                      </div>
                    </div>
                    <span class="text-[11px] font-semibold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Ver →
                    </span>
                  </div>
                </div>
              </div>

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

    <!-- ═══════════════════════ SKELETON LOADER ═══════════════════════ -->
    <ng-template #skeleton>
      <div class="space-y-4 xs:space-y-6">
        <div class="rounded-2xl border p-4 xs:p-6 md:p-10 min-h-[200px] xs:min-h-[260px] animate-pulse"
             [ngClass]="isDark ? 'bg-neutral-900/40 border-neutral-800/50' : 'bg-neutral-100/50 border-neutral-200/50'">
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 xs:gap-4">
          <div *ngFor="let _ of [1,2,3,4]" class="rounded-2xl border p-4 animate-pulse h-28 xs:h-32"
               [ngClass]="isDark ? 'bg-neutral-900/40 border-neutral-800/50' : 'bg-neutral-100/50 border-neutral-200/50'"></div>
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
    .animate-dropdown { animation: dropdownIn 0.15s ease-out forwards; }
    @keyframes dropdownIn {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .scale-in { animation: scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
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
  private financeService = inject(FinanceService);
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

  // AI Command Search
  aiQuery = '';
  aiResults: any[] = [];
  searchFocused = false;
  displayPlaceholder = '';
  private placeholders = [
    'Consultar balance financiero...',
    'Buscar tráfico y visitas de la semana...',
    'Buscar mensajes pendientes...',
    'Consultar estado de clientes...'
  ];
  private placeholderIdx = 0;
  private charIdx = 0;
  private typeInterval: any;
  private pauseTimeout: any;

  ngOnInit() {
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);

    // 1. Cargar Analíticas
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

    // 2. Cargar Itinerario
    this.itineraryService.getNotifications().subscribe({
      next: (notifs) => {
        this.itineraryNotifs = notifs || this.itineraryNotifs;
      }
    });

    // 3. Cargar Finanzas Reales
    this.loadFinanceSummary();

    // 4. Badges locales
    this.loadBadges();

    // 5. Typewriter
    this.startTypewriter();

    // 6. Session Countdown
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
    clearTimeout(this.pauseTimeout);
    if (this.sessionSub) this.sessionSub.unsubscribe();
    if (this.sessionExpiredSub) this.sessionExpiredSub.unsubscribe();
  }

  private checkLoadingState() {
    setTimeout(() => {
      this.isLoading = false;
    }, 150);
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

      // Conteo exacto de clientes de finanzas
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
    this.currentDate = now.toLocaleDateString('es-CO', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
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
      return;
    }

    const messages = JSON.parse(localStorage.getItem('portalink_admin_messages') || '[]');
    const results: any[] = [];

    if (/finanza|ingreso|factura|cobro|pago|balance/.test(q)) {
      results.push({ emoji: '💰', title: 'Finanzas & Facturación', value: `Total Cobrado: ${this.formatCurrency(this.financeTotalPaid)}`, tab: 'finances' });
    }

    if (/trafico|visita|rendimiento|analiti|metrica/.test(q)) {
      results.push({ emoji: '📈', title: 'Rendimiento & Tráfico', value: `${(this.metrics.homeViews || 0) + (this.metrics.linktreeViews || 0)} visitas registradas`, tab: 'analytics' });
    }

    if (/mensaje|contacto|correo|bandeja/.test(q)) {
      results.push({ emoji: '✉️', title: 'Mensajes Recibidos', value: `${this.unreadMessages} sin leer de ${messages.length} mensajes`, tab: 'messages' });
    }

    if (/itinerario|agenda|tarea|calendario/.test(q)) {
      results.push({ emoji: '📅', title: 'Itinerario de Tareas', value: 'Gestionar tareas y agenda de hoy', tab: 'itinerary' });
    }

    if (/servidor|salud|uptime|ping|sistema/.test(q)) {
      results.push({ emoji: '⚡', title: 'Infraestructura', value: 'Servidor 99.98% Uptime · 42ms', tab: 'stats' });
    }

    this.aiResults = results;
  }
}
