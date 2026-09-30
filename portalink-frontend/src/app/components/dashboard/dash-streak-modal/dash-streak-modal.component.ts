import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StreakService, DailyStreakData } from '../../../services/streak.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dash-streak-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" 
         class="fixed inset-0 z-[9999] flex flex-col items-center justify-start sm:justify-center p-3 sm:p-6 md:p-8 lg:p-10 pt-4 pb-6 bg-black/85 backdrop-blur-md transition-all duration-300 animate-fadeIn overflow-y-auto"
         (click)="onBackdropClick($event)">
      
      <!-- Modal Card (Ultra refinado en Desktop: max-w-4xl / max-w-5xl, halo ámbar y proporciones de lujo) -->
      <div class="relative w-full max-w-3xl md:max-w-4xl lg:max-w-5xl rounded-[22px] sm:rounded-[32px] md:rounded-[40px] p-3.5 sm:p-7 md:p-9 lg:p-11 border shadow-2xl transition-all duration-300 transform animate-scaleUp max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto my-auto relative overflow-hidden"
           [ngClass]="isDark ? 'bg-[#0c0c11] border-neutral-800 text-white shadow-[0_35px_80px_rgba(0,0,0,0.95)]' : 'bg-white border-neutral-200 text-neutral-900 shadow-[0_35px_80px_rgba(0,0,0,0.18)]'"
           (click)="$event.stopPropagation()">
        
        <!-- Ambient Decorative Glows (Solo visibles en Desktop) -->
        <div class="hidden md:block absolute -top-24 -left-24 w-96 h-96 bg-amber-500/12 rounded-full blur-3xl pointer-events-none"></div>
        <div class="hidden md:block absolute -bottom-24 -right-24 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="hidden md:block absolute top-1/2 left-1/3 w-64 h-64 bg-amber-400/5 rounded-full blur-2xl pointer-events-none"></div>

        <!-- Close Button (Siempre visible, más cómodo y con hover en desktop) -->
        <button type="button" 
                (click)="close()"
                class="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 md:top-6 md:right-6 w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all cursor-pointer border z-50 shadow-md active:scale-90 md:hover:scale-105"
                [ngClass]="isDark ? 'bg-neutral-900/90 text-neutral-300 hover:text-white hover:bg-neutral-800 border-neutral-700' : 'bg-neutral-100 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200 border-neutral-300'"
                title="Cerrar modal"
                aria-label="Cerrar modal">
          <svg class="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Main 2-Column Responsive Layout -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-6 md:gap-8 lg:gap-10 items-stretch relative z-10">
          
          <!-- Left Column (5 cols): Hero Celebration, Flame Icon, Racha Activa Badge & Stats -->
          <div class="md:col-span-5 flex flex-col items-center text-center justify-between space-y-2 sm:space-y-4 md:space-y-6 pr-0 md:pr-6 lg:pr-8 border-b md:border-b-0 md:border-r pb-3 md:pb-0"
               [ngClass]="isDark ? 'border-neutral-800/80' : 'border-neutral-200/80'">
            
            <div class="flex flex-col items-center w-full space-y-1.5 sm:space-y-3.5 md:space-y-5">
              
              <!-- Flame Icon Container (En desktop es amplio, con pedestal luminoso y halo) -->
              <div class="relative flex items-center justify-center pt-1 md:pt-2">
                <!-- Halo de resplandor suave en desktop -->
                <div class="hidden md:block absolute inset-0 rounded-[36px] bg-gradient-to-tr from-amber-500/25 to-orange-500/20 blur-xl animate-pulse"></div>
                
                <div class="relative w-12 h-12 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-2xl sm:rounded-3xl md:rounded-[32px] flex items-center justify-center bg-gradient-to-b from-amber-500/20 via-orange-500/10 to-transparent border border-amber-500/35 shadow-[0_0_25px_rgba(245,158,11,0.22)] md:shadow-[0_0_45px_rgba(245,158,11,0.28)] transition-transform duration-300 md:hover:scale-105">
                  <span class="text-2xl sm:text-4xl md:text-5xl lg:text-6xl select-none leading-none inline-flex items-center justify-center filter drop-shadow-[0_4px_14px_rgba(245,158,11,0.45)] animate-float">🔥</span>
                </div>
              </div>

              <!-- Racha Activa Badge -->
              <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 md:px-3.5 md:py-1 rounded-full text-[10px] sm:text-[11px] md:text-xs font-headline font-bold uppercase tracking-wider transition-all duration-300"
                   [ngClass]="isDark ? 'bg-amber-500/15 border border-amber-500/40 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]' : 'bg-amber-50 border border-amber-300 text-amber-700 shadow-2xs'">
                <span class="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-amber-500"></span>
                </span>
                <span>Racha Activa</span>
              </div>
              
              <!-- Header Text (Centrado, con mayor impacto tipográfico en Desktop) -->
              <div class="space-y-0.5 sm:space-y-1 md:space-y-2 px-1 sm:px-2">
                <h2 class="text-base sm:text-2xl md:text-2xl lg:text-[28px] font-headline font-extrabold tracking-tight leading-tight m-0"
                    [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                  ¡Activaste tu Racha!
                </h2>
                
                <p class="text-[11px] sm:text-[13px] md:text-sm font-sans leading-relaxed m-0 line-clamp-2 sm:line-clamp-none"
                   [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-600'">
                  Has iniciado sesión correctamente. La consistencia diaria construye maestría profesional.
                </p>
              </div>
            </div>

            <!-- Mini Highlight Stat Cards (Diseño enriquecido en Desktop) -->
            <div class="w-full grid grid-cols-2 gap-2 sm:gap-2.5 md:gap-3.5 pt-1 sm:pt-2 md:pt-4">
              <div class="p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl md:rounded-[22px] border text-center transition-all duration-300 md:hover:border-amber-500/40 md:hover:shadow-md"
                   [ngClass]="isDark ? 'bg-[#14141d]/90 border-neutral-800' : 'bg-neutral-50/90 border-neutral-200/90'">
                <span class="text-[9px] md:text-[10.5px] font-mono uppercase tracking-wider text-neutral-400 block mb-0.5">Racha Actual</span>
                <div class="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-headline font-black text-amber-500 flex items-center justify-center gap-1">
                  <span>{{ streakData?.streakCount || 1 }}</span>
                  <span class="text-[10px] sm:text-[11px] md:text-xs font-sans font-semibold text-neutral-400">d</span>
                </div>
                <span class="hidden md:inline-block text-[10px] font-mono text-neutral-500 mt-0.5">Días seguidos 🔥</span>
              </div>

              <div class="p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl md:rounded-[22px] border text-center transition-all duration-300 md:hover:border-neutral-700 md:hover:shadow-md"
                   [ngClass]="isDark ? 'bg-[#14141d]/90 border-neutral-800' : 'bg-neutral-50/90 border-neutral-200/90'">
                <span class="text-[9px] md:text-[10.5px] font-mono uppercase tracking-wider text-neutral-400 block mb-0.5">Récord</span>
                <div class="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-headline font-black flex items-center justify-center gap-1"
                     [ngClass]="isDark ? 'text-neutral-100' : 'text-neutral-800'">
                  <span>{{ streakData?.longestStreak || 1 }}</span>
                  <span class="text-[10px] sm:text-[11px] md:text-xs font-sans font-semibold text-neutral-400">d</span>
                </div>
                <span class="hidden md:inline-block text-[10px] font-mono text-neutral-500 mt-0.5">Récord histórico 🏆</span>
              </div>
            </div>

            <!-- Próximo Hito (Exclusivo en Desktop para motivar la continuidad) -->
            <div class="hidden md:flex w-full items-center justify-between p-3 rounded-2xl border text-xs"
                 [ngClass]="isDark ? 'bg-amber-500/5 border-amber-500/20 text-neutral-300' : 'bg-amber-50/70 border-amber-200 text-neutral-700'">
              <div class="flex items-center gap-2">
                <span class="text-base select-none">🎯</span>
                <div class="text-left">
                  <p class="font-headline font-bold text-[11.5px] m-0" [ngClass]="isDark ? 'text-amber-400' : 'text-amber-700'">Próximo Hito: 7 Días</p>
                  <p class="text-[10px] opacity-75 m-0 font-sans">Desbloquea insignia dorada de constancia</p>
                </div>
              </div>
              <span class="font-mono font-bold text-[11px] px-2 py-0.5 rounded-md border"
                    [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-amber-400' : 'bg-white border-amber-200 text-amber-700'">
                {{ getMilestoneDaysLeft() }}d restantes
              </span>
            </div>

          </div>

          <!-- Right Column (7 cols): Goals Checklist, Progress & Main CTA Button -->
          <div class="md:col-span-7 flex flex-col justify-between space-y-3 sm:space-y-4 md:space-y-5 pl-0 md:pl-2">
            
            <div class="space-y-2 sm:space-y-3 md:space-y-4">
              <!-- Goals Progress Header -->
              <div class="px-0.5">
                <h4 class="text-xs sm:text-sm font-headline font-bold uppercase tracking-wider m-0"
                    [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">
                  Tus 3 Metas de Hoy
                </h4>
                <p class="text-[10.5px] sm:text-[11.5px] font-sans text-neutral-400 m-0">Completa cada actividad diaria para maximizar tu progreso</p>
              </div>

              <!-- Progress Bar (Con halo suave en desktop) -->
              <div class="w-full h-1.5 sm:h-2 md:h-2.5 rounded-full overflow-hidden" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-100'">
                <div class="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                     [style.width.%]="(completedCount / 3) * 100"></div>
              </div>

              <!-- Goals List (En desktop cuenta con tarjetas más amplias, micro-hover y acciones directas) -->
              <div class="space-y-1.5 sm:space-y-2.5 md:space-y-3 pt-0.5">
                
                <!-- Goal 1: Login (Completed) -->
                <div class="flex items-center justify-between p-2.5 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl border transition-all duration-200 md:hover:border-emerald-500/40"
                     [ngClass]="isDark ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'">
                  <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div class="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                      <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                      </svg>
                    </div>
                    <div class="min-w-0">
                      <p class="text-xs sm:text-[13px] font-headline font-semibold truncate m-0">1. Primer ingreso al Dashboard</p>
                      <p class="hidden sm:block text-[10px] md:text-[11px] opacity-75 m-0 font-sans">Registrado automáticamente hoy</p>
                    </div>
                  </div>
                  <span class="text-[9.5px] sm:text-[10px] md:text-[11px] font-mono font-bold px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/35 shrink-0">
                    ¡Completado!
                  </span>
                </div>

                <!-- Goal 2: Rotbot IA -->
                <div class="flex items-center justify-between p-2.5 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl border transition-all duration-200"
                     [ngClass]="streakData?.actions?.robot ? 
                       (isDark ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300 md:hover:border-emerald-500/40' : 'bg-emerald-50 border-emerald-200 text-emerald-800') : 
                       (isDark ? 'bg-[#14141d]/90 border-neutral-800 text-neutral-300 md:hover:border-neutral-700' : 'bg-neutral-50 border-neutral-200 text-neutral-700')">
                  <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div class="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center shrink-0"
                         [ngClass]="streakData?.actions?.robot ? 'bg-emerald-500 text-white shadow-md' : (isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-200 text-neutral-500')">
                      <svg *ngIf="streakData?.actions?.robot" class="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                      </svg>
                      <svg *ngIf="!streakData?.actions?.robot" class="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                      </svg>
                    </div>
                    <div class="min-w-0">
                      <p class="text-xs sm:text-[13px] font-headline font-semibold truncate m-0">2. Conversación con Rotbot IA</p>
                      <p class="hidden sm:block text-[10px] md:text-[11px] opacity-75 m-0 font-sans">Practica inglés o haz una consulta técnica</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-2 shrink-0">
                    <button *ngIf="!streakData?.actions?.robot" 
                            type="button"
                            (click)="goToTab('rotbot')"
                            class="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-headline font-bold uppercase tracking-wider transition-all cursor-pointer border"
                            [ngClass]="isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700' : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-900 border-neutral-300'"
                            title="Ir a conversar con Rotbot">
                      <span>Ir ahora</span>
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
                      </svg>
                    </button>

                    <span class="text-[9.5px] sm:text-[10px] md:text-[11px] font-mono px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 rounded-full shrink-0"
                          [ngClass]="streakData?.actions?.robot ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/35' : (isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-200 text-neutral-600')">
                      {{ streakData?.actions?.robot ? '¡Completado!' : 'Pendiente' }}
                    </span>
                  </div>
                </div>

                <!-- Goal 3: Biblioteca -->
                <div class="flex items-center justify-between p-2.5 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl border transition-all duration-200"
                     [ngClass]="streakData?.actions?.library ? 
                       (isDark ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300 md:hover:border-emerald-500/40' : 'bg-emerald-50 border-emerald-200 text-emerald-800') : 
                       (isDark ? 'bg-[#14141d]/90 border-neutral-800 text-neutral-300 md:hover:border-neutral-700' : 'bg-neutral-50 border-neutral-200 text-neutral-700')">
                  <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div class="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center shrink-0"
                         [ngClass]="streakData?.actions?.library ? 'bg-emerald-500 text-white shadow-md' : (isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-200 text-neutral-500')">
                      <svg *ngIf="streakData?.actions?.library" class="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                      </svg>
                      <svg *ngIf="!streakData?.actions?.library" class="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                      </svg>
                    </div>
                    <div class="min-w-0">
                      <p class="text-xs sm:text-[13px] font-headline font-semibold truncate m-0">3. Estudiar en Biblioteca</p>
                      <p class="hidden sm:block text-[10px] md:text-[11px] opacity-75 m-0 font-sans">Guarda o repasa apuntes de hoy</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-2 shrink-0">
                    <button *ngIf="!streakData?.actions?.library" 
                            type="button"
                            (click)="goToTab('library')"
                            class="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-headline font-bold uppercase tracking-wider transition-all cursor-pointer border"
                            [ngClass]="isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700' : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-900 border-neutral-300'"
                            title="Abrir la Biblioteca">
                      <span>Ir ahora</span>
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
                      </svg>
                    </button>

                    <span class="text-[9.5px] sm:text-[10px] md:text-[11px] font-mono px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 rounded-full shrink-0"
                          [ngClass]="streakData?.actions?.library ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/35' : (isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-200 text-neutral-600')">
                      {{ streakData?.actions?.library ? '¡Completado!' : 'Pendiente' }}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            <!-- Tip de Productividad (Exclusivo en Desktop) -->
            <div class="hidden md:flex items-center gap-2.5 p-3 rounded-2xl border text-xs"
                 [ngClass]="isDark ? 'bg-neutral-900/50 border-neutral-800/80 text-neutral-400' : 'bg-neutral-50 border-neutral-200/80 text-neutral-600'">
              <span class="text-sm select-none">💡</span>
              <p class="m-0 font-sans text-[11px] leading-tight">
                Mantener tu racha activa todos los días aumenta tu retención de aprendizaje y ritmo de trabajo en un 80%.
              </p>
            </div>

            <!-- Main CTA Button (Amplio, elegante y táctil) -->
            <div class="pt-1.5 sm:pt-2">
              <button type="button" 
                      (click)="close()"
                      class="w-full h-10 sm:h-12 md:h-13 rounded-xl sm:rounded-2xl md:rounded-[20px] font-headline font-bold text-xs md:text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border-none hover:scale-[1.01] active:scale-[0.99] shadow-md md:hover:shadow-[0_10px_25px_rgba(245,158,11,0.2)]"
                      [ngClass]="isDark ? 'bg-white text-neutral-950 hover:bg-neutral-100 shadow-[0_4px_20px_rgba(255,255,255,0.15)]' : 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-lg'">
                <span>¡Continuar al Dashboard!</span>
                <svg class="w-4 h-4 md:w-4.5 md:h-4.5 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes scaleUp {
      from { opacity: 0; transform: scale(0.96); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-4px); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.25s ease-out forwards;
    }
    .animate-scaleUp {
      animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .animate-float {
      animation: float 2.8s ease-in-out infinite;
    }
  `]
})
export class DashStreakModalComponent implements OnInit, OnDestroy {
  @Input() theme: any = 'dark';
  @Output() navigateTab = new EventEmitter<string>();

  private streakService = inject(StreakService);
  private sub = new Subscription();

  isOpen = false;
  streakData: DailyStreakData | null = null;

  get isDark(): boolean {
    return this.theme === 'dark';
  }

  get completedCount(): number {
    return this.streakService.getCompletedActionsCount();
  }

  getMilestoneDaysLeft(): number {
    const current = this.streakData?.streakCount || 1;
    if (current < 7) return 7 - current;
    if (current < 14) return 14 - current;
    if (current < 30) return 30 - current;
    return Math.max(1, 7 - (current % 7));
  }

  goToTab(tabId: string) {
    this.close();
    this.navigateTab.emit(tabId);
  }

  ngOnInit() {
    this.sub.add(
      this.streakService.showModal$.subscribe(show => {
        this.isOpen = show;
        if (show) {
          this.playStreakSound();
        }
      })
    );

    this.sub.add(
      this.streakService.streak$.subscribe(data => {
        this.streakData = data;
      })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  close() {
    this.streakService.closeModal();
  }

  onBackdropClick(event: MouseEvent) {
    this.close();
  }

  /**
   * Efecto de sonido armónico y elegante al activar la racha diaria
   */
  private playStreakSound(): void {
    if (typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      // Arpegio ascendente armónico brillante (C5 -> E5 -> G5 -> C6)
      const chords = [
        { freq: 523.25, time: 0.0, dur: 0.14 },
        { freq: 659.25, time: 0.09, dur: 0.16 },
        { freq: 783.99, time: 0.18, dur: 0.22 },
        { freq: 1046.50, time: 0.28, dur: 0.55 }
      ];

      chords.forEach(note => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.time);

        gain.gain.setValueAtTime(0, ctx.currentTime + note.time);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + note.time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + note.time + note.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + note.time);
        osc.stop(ctx.currentTime + note.time + note.dur);
      });
    } catch (e) {
      console.warn('[DashStreakModal] Audio chime error:', e);
    }
  }
}
