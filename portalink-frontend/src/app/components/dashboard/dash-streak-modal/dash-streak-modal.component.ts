import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StreakService, DailyStreakData } from '../../../services/streak.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dash-streak-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" 
         class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/80 backdrop-blur-md transition-all duration-300 animate-fadeIn"
         (click)="onBackdropClick($event)">
      
      <!-- Modal Card (max-w-3xl, limpio, elegante y equilibrado) -->
      <div class="relative w-full max-w-3xl rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 md:p-9 border shadow-2xl overflow-hidden transition-all duration-300 transform animate-scaleUp"
           [ngClass]="isDark ? 'bg-[#0c0c10] border-neutral-800 text-white shadow-[0_30px_70px_rgba(0,0,0,0.9)]' : 'bg-white border-neutral-200 text-neutral-900 shadow-[0_30px_70px_rgba(0,0,0,0.14)]'"
           (click)="$event.stopPropagation()">
        
        <!-- Close Button -->
        <button type="button" 
                (click)="close()"
                class="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer border border-transparent z-20"
                [ngClass]="isDark ? 'text-neutral-400 hover:text-white hover:bg-white/10' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'"
                title="Cerrar">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Main 2-Column Responsive Layout -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-stretch relative z-10">
          
          <!-- Left Column (5 cols): Hero Celebration, Perfectly Centered Icon, Racha Activa Badge & Stats -->
          <div class="md:col-span-5 flex flex-col items-center text-center justify-between space-y-6 pr-0 md:pr-6 border-b md:border-b-0 md:border-r pb-6 md:pb-0"
               [ngClass]="isDark ? 'border-neutral-800/80' : 'border-neutral-200/80'">
            
            <div class="flex flex-col items-center w-full space-y-4">
              <!-- Flame Icon Container (Centrado, estético y con resplandor sutil) -->
              <div class="relative flex items-center justify-center">
                <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center bg-gradient-to-b from-amber-500/20 via-orange-500/10 to-transparent border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.18)]">
                  <span class="text-5xl sm:text-6xl select-none leading-none inline-flex items-center justify-center filter drop-shadow-[0_4px_12px_rgba(245,158,11,0.4)]">🔥</span>
                </div>
              </div>

              <!-- Racha Activa Badge (Estilo refinado, bordes y glow elegante) -->
              <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-headline font-bold uppercase tracking-wider transition-all duration-300"
                   [ngClass]="isDark ? 'bg-amber-500/15 border border-amber-500/35 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'bg-amber-50 border border-amber-300 text-amber-700 shadow-2xs'">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span>Racha Activa</span>
              </div>
              
              <!-- Header Text (Centrado) -->
              <div class="space-y-1.5 px-1 sm:px-2">
                <h2 class="text-2xl sm:text-[26px] font-headline font-bold tracking-tight leading-tight m-0"
                    [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                  ¡Activaste tu Racha!
                </h2>
                
                <p class="text-xs sm:text-[13px] font-sans leading-relaxed m-0"
                   [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-600'">
                  Has iniciado sesión correctamente. La consistencia diaria construye maestría y enfoque.
                </p>
              </div>
            </div>

            <!-- Mini Highlight Stat Cards -->
            <div class="w-full grid grid-cols-2 gap-2.5 pt-2">
              <div class="p-3 rounded-2xl border text-center transition-colors"
                   [ngClass]="isDark ? 'bg-[#14141a] border-neutral-800' : 'bg-neutral-50 border-neutral-200/90'">
                <span class="text-[9px] font-mono uppercase tracking-wider text-neutral-400 block mb-0.5">Racha Actual</span>
                <div class="text-xl sm:text-2xl font-headline font-extrabold text-amber-500 flex items-center justify-center gap-1">
                  <span>{{ streakData?.streakCount || 1 }}</span>
                  <span class="text-[11px] font-sans font-semibold text-neutral-400">d</span>
                </div>
              </div>

              <div class="p-3 rounded-2xl border text-center transition-colors"
                   [ngClass]="isDark ? 'bg-[#14141a] border-neutral-800' : 'bg-neutral-50 border-neutral-200/90'">
                <span class="text-[9px] font-mono uppercase tracking-wider text-neutral-400 block mb-0.5">Récord</span>
                <div class="text-xl sm:text-2xl font-headline font-extrabold flex items-center justify-center gap-1"
                     [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-700'">
                  <span>{{ streakData?.longestStreak || 1 }}</span>
                  <span class="text-[11px] font-sans font-semibold text-neutral-400">d</span>
                </div>
              </div>
            </div>

          </div>

          <!-- Right Column (7 cols): Goals Checklist, Progress & Main CTA Button -->
          <div class="md:col-span-7 flex flex-col justify-between space-y-5 pl-0 md:pl-2">
            
            <div class="space-y-3.5">
              <!-- Goals Progress Header -->
              <div class="flex items-center justify-between px-0.5">
                <div>
                  <h4 class="text-xs font-headline font-bold uppercase tracking-wider m-0"
                      [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">
                    Tus 3 Metas de Hoy
                  </h4>
                  <p class="text-[11px] font-sans text-neutral-400 m-0">Completa cada actividad para maximizar tu avance</p>
                </div>
                <span class="text-xs font-mono font-bold shrink-0 ml-2 px-2.5 py-0.5 rounded-full border"
                      [ngClass]="completedCount === 3 ? 
                        (isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-300 text-emerald-700') : 
                        (isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-300 text-amber-700')">
                  {{ completedCount }}/3 Completadas
                </span>
              </div>

              <!-- Progress Bar -->
              <div class="w-full h-2 rounded-full overflow-hidden" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-100'">
                <div class="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-400 shadow-xs"
                     [style.width.%]="(completedCount / 3) * 100"></div>
              </div>

              <!-- Goals List -->
              <div class="space-y-2.5 pt-1">
                
                <!-- Goal 1: Login (Completed) -->
                <div class="flex items-center justify-between p-3.5 rounded-2xl border transition-all"
                     [ngClass]="isDark ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                      </svg>
                    </div>
                    <div class="min-w-0">
                      <p class="text-xs font-headline font-semibold truncate m-0">1. Primer ingreso al Dashboard</p>
                      <p class="text-[10px] opacity-75 m-0 font-sans">Registrado automáticamente hoy</p>
                    </div>
                  </div>
                  <span class="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                    ¡Completado!
                  </span>
                </div>

                <!-- Goal 2: Rotbot IA -->
                <div class="flex items-center justify-between p-3.5 rounded-2xl border transition-all"
                     [ngClass]="streakData?.actions?.robot ? 
                       (isDark ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800') : 
                       (isDark ? 'bg-[#14141a] border-neutral-800 text-neutral-300' : 'bg-neutral-50 border-neutral-200 text-neutral-700')">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                         [ngClass]="streakData?.actions?.robot ? 'bg-emerald-500 text-white shadow-2xs' : (isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-200 text-neutral-500')">
                      <svg *ngIf="streakData?.actions?.robot" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                      </svg>
                      <svg *ngIf="!streakData?.actions?.robot" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                      </svg>
                    </div>
                    <div class="min-w-0">
                      <p class="text-xs font-headline font-semibold truncate m-0">2. Conversación con Rotbot IA</p>
                      <p class="text-[10px] opacity-75 m-0 font-sans">Practica inglés o haz una consulta</p>
                    </div>
                  </div>
                  <span class="text-[10px] font-mono px-2.5 py-1 rounded-full shrink-0"
                        [ngClass]="streakData?.actions?.robot ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30' : (isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-200 text-neutral-600')">
                    {{ streakData?.actions?.robot ? '¡Completado!' : 'Pendiente' }}
                  </span>
                </div>

                <!-- Goal 3: Biblioteca -->
                <div class="flex items-center justify-between p-3.5 rounded-2xl border transition-all"
                     [ngClass]="streakData?.actions?.library ? 
                       (isDark ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800') : 
                       (isDark ? 'bg-[#14141a] border-neutral-800 text-neutral-300' : 'bg-neutral-50 border-neutral-200 text-neutral-700')">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                         [ngClass]="streakData?.actions?.library ? 'bg-emerald-500 text-white shadow-2xs' : (isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-200 text-neutral-500')">
                      <svg *ngIf="streakData?.actions?.library" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                      </svg>
                      <svg *ngIf="!streakData?.actions?.library" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                      </svg>
                    </div>
                    <div class="min-w-0">
                      <p class="text-xs font-headline font-semibold truncate m-0">3. Estudiar o escribir en Biblioteca</p>
                      <p class="text-[10px] opacity-75 m-0 font-sans">Guarda o repasa apuntes de hoy</p>
                    </div>
                  </div>
                  <span class="text-[10px] font-mono px-2.5 py-1 rounded-full shrink-0"
                        [ngClass]="streakData?.actions?.library ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30' : (isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-200 text-neutral-600')">
                    {{ streakData?.actions?.library ? '¡Completado!' : 'Pendiente' }}
                  </span>
                </div>

              </div>
            </div>

            <!-- Main CTA Button (Elegante, contrastado y responsivo) -->
            <div class="pt-2">
              <button type="button" 
                      (click)="close()"
                      class="w-full h-12 rounded-2xl font-headline font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border-none hover:scale-[1.01] active:scale-[0.99]"
                      [ngClass]="isDark ? 'bg-white text-neutral-950 hover:bg-neutral-100 shadow-[0_4px_20px_rgba(255,255,255,0.12)]' : 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-md'">
                <span>¡Continuar al Dashboard!</span>
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
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
    .animate-fadeIn {
      animation: fadeIn 0.25s ease-out forwards;
    }
    .animate-scaleUp {
      animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class DashStreakModalComponent implements OnInit, OnDestroy {
  @Input() theme: any = 'dark';

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
