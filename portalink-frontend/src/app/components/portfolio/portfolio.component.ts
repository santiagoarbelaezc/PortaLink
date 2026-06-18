import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
    selector: 'app-portfolio',
    standalone: true,
    imports: [CommonModule, RevealDirective, RouterModule],
    template: `
    <!-- Botón Volver para Móvil -->
    <a [routerLink]="['/']" class="md:hidden fixed top-6 left-6 z-[100] flex items-center gap-3 bg-black/60 backdrop-blur-xl border border-white/10 px-5 py-2.5 rounded-full text-white no-underline shadow-2xl active:scale-90 transition-all duration-300">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="m15 18-6-6 6-6"/>
      </svg>
      <span class="text-[10px] uppercase tracking-[0.2em] font-bold">Volver</span>
    </a>

    <section id="portfolio" class="py-20 md:py-32 px-6">
      <div class="container mx-auto">
        <!-- Section Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8" appReveal>
          <div>
            <div class="flex items-center gap-4 mb-4">
              <div class="h-px w-12 bg-white/50"></div>
              <span class="text-white/50 text-xs uppercase tracking-[0.4em]">Curation</span>
            </div>
            <h2 class="text-5xl md:text-7xl">Selected Works</h2>
          </div>
        </div>

        <!-- Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8">
          <div *ngFor="let project of projects; let i = index" 
               class="flex flex-col group"
               appReveal [delay]="i * 100">
            
            <!-- Image Container -->
            <div class="relative rounded-none overflow-hidden glass border border-white/10 aspect-[16/9] mb-6 md:mb-0">
              <img [src]="project.images && project.images.length > 0 ? project.images[0] : 'project-1.png'" [alt]="project.title" 
                   class="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105 grayscale brightness-75 group-hover:brightness-100 group-hover:grayscale-0" />
              
              <!-- Desktop Overlay (Hidden on mobile) -->
              <div class="hidden md:flex absolute inset-0 bg-black/80 translate-y-full group-hover:translate-y-0 transition-transform duration-500 flex-col justify-between p-10">
                <div class="flex justify-between items-start">
                  <div class="flex gap-2">
                    <span *ngFor="let tech of project.techStack" class="text-[10px] uppercase tracking-widest text-white/60 border border-white/20 px-2 py-1 rounded-none">
                      {{ tech }}
                    </span>
                  </div>
                  <span *ngIf="project.featured" class="text-white/60 text-xs">★ Featured</span>
                </div>
                
                <div>
                  <h3 class="text-4xl mb-4 font-headline uppercase leading-none text-white">{{ project.title }}</h3>
                  <p class="text-white/60 mb-8 text-sm leading-relaxed max-w-xs">
                    {{ project.description }}
                  </p>
                  <div class="flex gap-6">
                    <a *ngIf="project.liveUrl" [href]="project.liveUrl" target="_blank" class="flex items-center gap-3 group/btn no-underline text-white">
                      <span class="text-xs uppercase tracking-widest font-bold">Live Demo</span>
                      <div class="w-8 h-px bg-white group-hover/btn:w-12 transition-all group-hover/btn:bg-white"></div>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mobile Info (Visible only on mobile) -->
            <div class="md:hidden space-y-4 px-2">
              <div class="flex justify-between items-center">
                <h3 class="text-3xl font-headline uppercase text-white">{{ project.title }}</h3>
                <span *ngIf="project.featured" class="text-white/50 text-[10px] uppercase tracking-widest font-bold">Featured</span>
              </div>
              <p class="text-white/60 text-sm leading-relaxed">
                {{ project.description }}
              </p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span *ngFor="let tech of project.techStack" class="text-[9px] uppercase tracking-tighter text-white/40">
                  #{{ tech.replace(' ', '') }}
                </span>
              </div>
              <a *ngIf="project.liveUrl" [href]="project.liveUrl" target="_blank" class="inline-flex items-center gap-4 group/btn no-underline text-white/60">
                <span class="text-xs uppercase tracking-[0.3em] font-bold">Explorar Demo</span>
                <div class="w-10 h-px bg-white/30"></div>
              </a>
            </div>

          </div>
        </div>
      </div>
    </section>
  `,
    styles: [`
    .glass { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); }
  `]
})
export class PortfolioComponent {
  @Input() projects: any[] = [];
}
