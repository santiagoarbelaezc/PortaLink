import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-personalizar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="personalizar-page min-h-screen w-full flex items-center justify-center pt-24 pb-16 px-6 sm:px-12 lg:px-20 relative overflow-hidden transition-colors duration-500"
         [ngClass]="isDark ? 'bg-[#020204] text-white' : 'bg-neutral-50/50 text-neutral-900'">
      
      <!-- Ambient Glow in Background -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div class="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[140px]"
             [ngClass]="isDark ? 'bg-cyan-500/10' : 'bg-cyan-500/15'"></div>
      </div>

      <div class="max-w-[1300px] w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center relative z-10">

        <!-- Left Column: Enlarged RotBot Feature Image -->
        <div class="md:col-span-6 relative flex justify-center items-center">
          <div class="absolute inset-0 rounded-full blur-3xl scale-95 pointer-events-none"
               [ngClass]="isDark ? 'bg-cyan-500/15' : 'bg-cyan-400/20'"></div>
          <img src="assets/images/rotbot-señalandoderecha.png"
               alt="RotBot IA Mantenimiento"
               class="relative z-10 w-full max-w-[280px] sm:max-w-[380px] md:max-w-[460px] lg:max-w-[500px] max-h-[70vh] object-contain hover:scale-[1.02] transition-transform duration-500 drop-shadow-2xl" />
        </div>

        <!-- Right Column: Text & Actions (Ultra-Clean Apple Style) -->
        <div class="md:col-span-6 space-y-6 text-center md:text-left">

          <!-- Status Badge -->
          <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border text-xs font-headline font-bold uppercase tracking-[0.2em]"
               [ngClass]="isDark
                 ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                 : 'border-cyan-500/30 bg-cyan-500/15 text-cyan-800'">
            <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Plataforma En Mantenimiento</span>
          </div>

          <!-- Main Title & Subtitle -->
          <div class="space-y-3">
            <h1 class="text-3xl sm:text-5xl lg:text-6xl font-headline font-black uppercase tracking-tight leading-[1.02]"
                [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              PRÓXIMAMENTE MÓDULO DISPONIBLE
            </h1>

            <p class="text-sm sm:text-base font-normal leading-relaxed max-w-xl"
               [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-600'">
              Este módulo de creación y personalización de sitios web se encuentra actualmente en mantenimiento y optimización para brindarte una mejor experiencia.
            </p>
          </div>

          <!-- Action Buttons (Ultra-Clean Apple Style) -->
          <div class="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
            <!-- Volver al Inicio Button (Obsidian Black) -->
            <a routerLink="/"
               class="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-headline font-semibold uppercase text-xs sm:text-sm tracking-wider transition-all duration-200 shadow-md no-underline border-none cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
               style="background-color: #09090b !important; color: #ffffff !important;">
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="color: #ffffff !important;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
              </svg>
              <span style="color: #ffffff !important;">Volver al Inicio</span>
            </a>

            <!-- Consultar con RotBot IA Button -->
            <a routerLink="/rotbot"
               class="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-headline font-semibold uppercase text-xs sm:text-sm tracking-wider transition-all duration-200 border cursor-pointer no-underline hover:scale-[1.01] active:scale-[0.99]"
               [ngClass]="isDark
                 ? 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                 : 'border-neutral-200/90 bg-white text-neutral-900 hover:bg-neutral-100 shadow-2xs'">
              <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 flex-shrink-0"></span>
              <span>Consultar con RotBot IA</span>
            </a>
          </div>

        </div>

      </div>

    </div>
  `
})
export class PersonalizarComponent implements OnInit {
  get isDark(): boolean {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark') || document.body.classList.contains('theme-dark');
    }
    return false;
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }
}
