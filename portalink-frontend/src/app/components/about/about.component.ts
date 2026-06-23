import { Component, Input, OnInit, OnDestroy } from '@angular/core';
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
            <div class="aspect-[4/5] overflow-hidden border border-white/20 relative">
              <div class="absolute top-2 left-2 w-3 h-3 border-t border-l border-white/50 z-10"></div>
              <div class="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-white/50 z-10"></div>
              <img [src]="data?.avatarImage || 'about-portrait.png'" alt="Creative Profile" class="w-full h-full object-cover grayscale brightness-75 hover:brightness-100 hover:grayscale-0 transition-all duration-700" />
            </div>

            <!-- Decorative corner element -->
            <div class="absolute -top-4 -right-4 w-20 h-20 border border-white/10 opacity-40"></div>
          </div>

          <!-- Bio Content -->
          <div class="space-y-8">
            <div appReveal>
              <div class="flex items-center gap-4 mb-4">
                <div class="h-px w-12 bg-white/50"></div>
                <span class="text-white/50 text-xs uppercase tracking-[0.4em]">{{ getTranslation().philosophy }}</span>
              </div>
              <h2 class="text-5xl md:text-7xl mb-8 text-white" [innerHTML]="getTranslation().headline"></h2>
            </div>

            <div class="space-y-6 leading-relaxed text-white/70" appReveal [delay]="400">
              <p class="whitespace-pre-line text-xl leading-relaxed">
                {{ getBioText() }}
              </p>
            </div>

            <!-- Skills pills -->
            <div class="flex flex-wrap gap-3 pt-8" appReveal [delay]="600">
              <div *ngFor="let skill of getTranslation().highlightSkills"
                   class="px-5 py-2 rounded-none cursor-default transition-colors border border-white/20 bg-white/5 hover:bg-white group">
                <span class="text-xs uppercase tracking-widest text-white/70 group-hover:text-black">{{ skill }}</span>
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
export class AboutComponent implements OnInit, OnDestroy {
  @Input() data: any;

  currentLanguage = 'es';

  translations: any = {
    es: {
      philosophy: 'Filosofía',
      headline: 'Diseñando el Futuro, <br/><span class="font-light italic text-white/80" style="letter-spacing: -0.02em;">un píxel a la vez.</span>',
      defaultBio: 'As a multi-disciplinary creator based in the digital space, I blend clean frontend architecture with high-end aesthetic vision.',
      bioMap: {
        'Desarrollador apasionado con experiencia en Angular y diseño UI/UX.': 'Desarrollador apasionado con experiencia en Angular y diseño UI/UX.'
      },
      highlightSkills: ['Dirección Creativa', 'Frontend Senior', 'Diseño UI/UX', 'Narrativa Visual']
    },
    en: {
      philosophy: 'Philosophy',
      headline: 'Designing the Future, <br/><span class="font-light italic text-white/80" style="letter-spacing: -0.02em;">One Pixel at a Time.</span>',
      defaultBio: 'As a multi-disciplinary creator based in the digital space, I blend clean frontend architecture with high-end aesthetic vision.',
      bioMap: {
        'Desarrollador apasionado con experiencia en Angular y diseño UI/UX.': 'Passionate developer with experience in Angular and UI/UX design.'
      },
      highlightSkills: ['Creative Direction', 'Senior Frontend', 'UI/UX Design', 'Visual Storytelling']
    }
  };

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.currentLanguage = localStorage.getItem('portfolio-language') || 'es';
      window.addEventListener('portfolio-language-change', this.onLanguageChange);
    }
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('portfolio-language-change', this.onLanguageChange);
    }
  }

  onLanguageChange = (event: any) => {
    this.currentLanguage = event.detail.language;
  };

  getTranslation() {
    return this.translations[this.currentLanguage] || this.translations['es'];
  }

  getBioText() {
    if (!this.data || !this.data.text) {
      return this.getTranslation().defaultBio;
    }
    const val = this.data.text;
    const t = this.getTranslation();
    return t.bioMap[val] || val;
  }
}
