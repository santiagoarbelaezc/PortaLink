import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-personalizar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="personalizar-page h-screen w-full flex items-center justify-center pt-16 pb-8 px-6 sm:px-12 lg:px-20 overflow-hidden transition-colors duration-500" style="background-color: var(--bg-primary, #050508); color: var(--text-primary, #ffffff);">
      
      <div class="max-w-[1300px] w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center relative z-10">

        <!-- Left Column: Enlarged RotBot Feature Image -->
        <div class="md:col-span-6 relative flex justify-center items-center">
          <div class="absolute inset-0 bg-cyan-500/10 rounded-full blur-3xl scale-95 pointer-events-none"></div>
          <img src="assets/images/rotbot-señalandoizquierda.png"
               alt="RotBot IA Mantenimiento"
               class="relative z-10 w-full max-w-[300px] sm:max-w-[400px] md:max-w-[480px] lg:max-w-[540px] max-h-[75vh] object-contain hover:scale-105 transition-transform duration-500 drop-shadow-2xl" />
        </div>

        <!-- Right Column: Text & Actions -->
        <div class="md:col-span-6 space-y-6 text-center md:text-left">

          <!-- Status Badge -->
          <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold uppercase tracking-[0.2em]">
            <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Plataforma En Mantenimiento</span>
          </div>

          <!-- Main Title & Subtitle -->
          <div class="space-y-3">
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-headline font-black uppercase tracking-tight text-white leading-[0.98]" style="font-family: var(--font-headline, sans-serif);">
              PRÓXIMAMENTE MÓDULO DISPONIBLE
            </h1>

            <p class="text-sm sm:text-base font-light leading-relaxed max-w-xl" style="color: var(--text-secondary, rgba(255,255,255,0.7));">
              Este módulo de creación y personalización de sitios web se encuentra actualmente en mantenimiento y optimización para brindarte una mejor experiencia.
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
            <a routerLink="/"
               class="inline-flex items-center gap-3 px-7 py-3.5 rounded-2xl bg-white hover:bg-neutral-200 text-black font-bold uppercase text-xs sm:text-sm tracking-wider transition-all duration-300 shadow-[0_10px_30px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 cursor-pointer">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
              </svg>
              <span>Volver al Inicio</span>
            </a>

            <a routerLink="/rotbot"
               class="inline-flex items-center gap-3 px-7 py-3.5 rounded-2xl border border-white/15 bg-white/[0.04] hover:bg-white/10 text-white font-bold uppercase text-xs sm:text-sm tracking-wider transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
              <span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span>Consultar con RotBot IA</span>
            </a>
          </div>

        </div>

      </div>

    </div>
  `,
  styles: [`
    :host-context(.theme-light) .personalizar-page {
      background-color: #ffffff !important;
      color: #111827 !important;
    }
  `]
})
export class PersonalizarComponent implements OnInit {
  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }
}
