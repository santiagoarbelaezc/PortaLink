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
                <div class="h-px w-10" style="background-color: var(--text-primary); opacity: 0.4;"></div>
                <span class="text-[10px] uppercase tracking-[0.4em] font-bold" style="color: var(--text-secondary);">
                  {{ getTranslation().philosophy }}
                </span>
              </div>
              <h2 class="text-5xl sm:text-6xl md:text-[72px] font-headline uppercase leading-[0.95] tracking-tighter mb-6 md:mb-8 hero-title" [innerHTML]="getTranslation().headline"></h2>
            </div>

            <div class="space-y-6 leading-relaxed" appReveal [delay]="400">
              <p class="text-base md:text-lg max-w-xl mb-10" style="color: var(--text-secondary); line-height: 1.65;">
                {{ getBioText() }}
              </p>
            </div>

            <!-- Skills pills -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-8 w-full max-w-xl" appReveal [delay]="600">
              <div *ngFor="let skill of getTranslation().highlightSkills"
                   class="px-4 py-3.5 rounded-xl cursor-default transition-all duration-500 border border-white/10 bg-white/[0.02] backdrop-blur-md hover:bg-white/[0.07] hover:border-white/25 hover:-translate-y-0.5 flex items-center justify-center text-center">
                <span class="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-medium text-white/60 transition-colors">{{ skill }}</span>
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
      philosophy: 'Perfil',
      headline: '<span class="title-soy text-[#a3a3a3]">Creador digital, desarrollador, </span><br/><span class="title-name font-light italic" style="letter-spacing: -0.02em; color: #ffffff;">y creador de negocios digitales.</span>',
      defaultBio: 'Transformo ideas abstractas en realidades interactivas que conectan con las personas, impulsando el crecimiento real de los negocios.',
      bioMap: {
        'Transformo ideas abstractas en realidades interactivas que conectan con las personas. Ayudo a marcas y emprendedores a conceptualizar, diseñar y lanzar plataformas digitales atractivas y fáciles de usar, impulsando el crecimiento real de sus negocios.': 'Transformo ideas abstractas en realidades interactivas que conectan con las personas. Ayudo a marcas y emprendedores a conceptualizar, diseñar y lanzar plataformas digitales atractivas y fáciles de usar, impulsando el crecimiento real de sus negocios.'
      },
      highlightSkills: ['Dirección Creativa', 'Diseño de Negocios', 'Desarrollo Visual', 'Aplicaciones Móviles', 'Catálogo Digital', 'Integración con IA']
    },
    en: {
      philosophy: 'Profile',
      headline: '<span class="title-soy text-[#a3a3a3]">Digital creator, developer, </span><br/><span class="title-name font-light italic" style="letter-spacing: -0.02em; color: #ffffff;">and digital business builder.</span>',
      defaultBio: 'I transform abstract ideas into interactive realities that connect with people, driving real business growth.',
      bioMap: {
        'Transformo ideas abstractas en realidades interactivas que conectan con las personas. Ayudo a marcas y emprendedores a conceptualizar, diseñar y lanzar plataformas digitales atractivas y fáciles de usar, impulsando el crecimiento real de sus negocios.': 'I transform abstract ideas into interactive realities that connect with people. I help brands and entrepreneurs conceptualize, design, and launch attractive, easy-to-use digital platforms, driving real growth for their businesses.'
      },
      highlightSkills: ['Creative Direction', 'Business Design', 'Visual Development', 'Mobile Applications', 'Digital Catalog', 'AI Integration']
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
