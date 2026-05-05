import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
    selector: 'app-about',
    standalone: true,
    imports: [CommonModule, RevealDirective],
    template: `
    <section id="about" class="py-20 md:py-32 px-6 overflow-hidden" *ngIf="data?.visible !== false">
      <div class="container mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          <!-- Image with Clip-path -->
          <div class="relative" appReveal>
            <div class="aspect-[4/5] overflow-hidden rounded-3xl" style="clip-path: polygon(10% 0, 100% 0, 90% 100%, 0% 100%);">
              <img [src]="data?.avatarImage || 'about-portrait.png'" alt="Creative Profile" class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
            </div>

            <!-- Decorative corner element -->
            <div class="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-40" style="border: 1px solid rgba(0,0,0,0.15);"></div>
            <div class="absolute -bottom-6 left-1/4 px-6 py-3 rounded-full flex items-center gap-3"
                 style="background: rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.10); backdrop-filter: blur(8px);">
              <div class="w-2 h-2 rounded-full bg-accent-cyan animate-ping"></div>
              <span class="text-[10px] uppercase tracking-widest text-black/60">Open for collaboration</span>
            </div>
          </div>

          <!-- Bio Content -->
          <div class="space-y-8">
            <div appReveal>
              <div class="flex items-center gap-4 mb-4">
                <div class="h-px w-12 bg-accent-cyan"></div>
                <span class="text-accent-cyan text-xs uppercase tracking-[0.4em]">Philosophy</span>
              </div>
              <h2 class="text-5xl md:text-7xl mb-8 text-black">Designing the Future, <br/><span class="font-light italic text-accent-cyan" style="letter-spacing: -0.02em;">One Pixel at a Time.</span></h2>
            </div>

            <div class="space-y-6 leading-relaxed text-black/55" appReveal [delay]="400">
              <p class="whitespace-pre-line text-xl leading-relaxed">
                {{ data?.text || 'As a multi-disciplinary creator based in the digital space, I blend clean frontend architecture with high-end aesthetic vision.' }}
              </p>
            </div>

            <!-- Skills pills -->
            <div class="flex flex-wrap gap-3 pt-8" appReveal [delay]="600">
              <div *ngFor="let skill of highlightSkills"
                   class="px-5 py-2 rounded-full cursor-default transition-colors"
                   style="border: 1px solid rgba(0,0,0,0.15); background: rgba(0,0,0,0.04);">
                <span class="text-xs uppercase tracking-widest text-black/70">{{ skill }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
    styles: [`
    .animate-spin-slow { animation: spin 15s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `]
})
export class AboutComponent {
  @Input() data: any;
  highlightSkills = ['Creative Direction', 'Senior Frontend', 'UI/UX Design', 'Visual Storytelling'];
}
