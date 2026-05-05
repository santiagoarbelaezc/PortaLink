import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
    selector: 'app-portfolio',
    standalone: true,
    imports: [CommonModule, RevealDirective],
    template: `
    <section id="portfolio" class="py-20 md:py-32 px-6">
      <div class="container mx-auto">
        <!-- Section Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8" appReveal>
          <div>
            <div class="flex items-center gap-4 mb-4">
              <div class="h-px w-12 bg-accent-cyan"></div>
              <span class="text-accent-cyan text-xs uppercase tracking-[0.4em]">Curation</span>
            </div>
            <h2 class="text-5xl md:text-7xl">Selected Works</h2>
          </div>
        </div>

        <!-- Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div *ngFor="let project of projects; let i = index" 
               class="relative group rounded-3xl overflow-hidden glass border border-white/10 aspect-[16/9]"
               appReveal [delay]="i * 100">
            
            <!-- Image -->
            <img [src]="project.images && project.images.length > 0 ? project.images[0] : 'project-1.png'" [alt]="project.title" 
                 class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
            
            <!-- Overlay -->
            <div class="absolute inset-0 bg-black/80 translate-y-full group-hover:translate-y-0 transition-transform duration-500 flex flex-col justify-between p-10">
              <div class="flex justify-between items-start">
                <div class="flex gap-2">
                  <span *ngFor="let tech of project.techStack" class="text-[10px] uppercase tracking-widest text-accent-cyan border border-accent-cyan/30 px-2 py-1 rounded">
                    {{ tech }}
                  </span>
                </div>
                <span *ngIf="project.featured" class="text-accent-cyan text-xs">★ Featured</span>
              </div>
              
              <div>
                <h3 class="text-4xl mb-4 font-headline uppercase leading-none text-white">{{ project.title }}</h3>
                <p class="text-white/60 mb-8 text-sm leading-relaxed max-w-xs">
                  {{ project.description }}
                </p>
                <div class="flex gap-6">
                  <a *ngIf="project.liveUrl" [href]="project.liveUrl" target="_blank" class="flex items-center gap-3 group/btn no-underline text-white">
                    <span class="text-xs uppercase tracking-widest font-bold">Live Demo</span>
                    <div class="w-8 h-px bg-white group-hover/btn:w-12 transition-all group-hover/btn:bg-accent-cyan"></div>
                  </a>
                  <a *ngIf="project.githubUrl" [href]="project.githubUrl" target="_blank" class="flex items-center gap-3 group/btn no-underline text-white/50 hover:text-white">
                    <span class="text-xs uppercase tracking-widest font-bold">GitHub</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
    styles: [`
    .glass { background: rgba(0,0,0,0.05); backdrop-filter: blur(10px); }
  `]
})
export class PortfolioComponent {
  @Input() projects: any[] = [];
}
