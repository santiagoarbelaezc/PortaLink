import { Component, Input, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-skills',
    standalone: true,
    imports: [CommonModule],
    encapsulation: ViewEncapsulation.None,
    template: `
    <section id="skills" class="py-12 border-y overflow-hidden" style="border-color: var(--card-border);">
      <!-- Marquee Wrapper -->
      <div class="relative flex overflow-hidden">
        <div class="flex animate-marquee whitespace-nowrap gap-12 py-6">
          <ng-container *ngFor="let item of repeatItems; let idx = index">
            <!-- Logo Only Card -->
            <div *ngIf="idx % 2 === 0" 
                 class="flex items-center justify-center px-10 py-4 glass-card group cursor-default hover:border-white/50 transition-all duration-300">
              <img src="assets/icons/mi-logo2.png" alt="Logo" class="w-12 h-12 object-contain opacity-70 group-hover:opacity-100 transition-all duration-350" />
            </div>
            
            <!-- Name Only Card -->
            <div *ngIf="idx % 2 !== 0" 
                 class="flex items-center px-10 py-5 glass-card group cursor-default hover:border-white/50 transition-all duration-300">
              <div class="flex flex-col justify-center">
                <span class="font-headline text-xs md:text-sm uppercase tracking-wider mb-1 leading-none" style="color: var(--text-primary);">Santiago Arbeláez</span>
                <span class="text-[6px] md:text-[7px] tracking-[0.3em] uppercase opacity-75 leading-none" style="color: var(--text-secondary);">{{ getTranslation().tagline }}</span>
              </div>
            </div>
          </ng-container>
        </div>
      </div>

      <!-- Secondary Marquee (Reverse) -->
      <div class="relative flex overflow-hidden mt-2">
        <div class="flex animate-marquee-reverse whitespace-nowrap gap-12 py-6">
          <div *ngFor="let skill of getTranslation().softSkills.concat(getTranslation().softSkills)" 
               class="flex items-center gap-4 px-8 py-4 border rounded-xl group cursor-default transition-colors hover:bg-black/5 dark:hover:bg-white/5"
               style="border-color: var(--card-border);">
            <span class="text-xs uppercase tracking-[0.4em] transition-colors" style="color: var(--text-secondary);">{{ skill }}</span>
            <div class="w-1.5 h-1.5 rounded-full" style="background-color: var(--text-secondary); opacity: 0.35;"></div>
          </div>
        </div>
      </div>
    </section>
  `,
    styles: [`
    .animate-marquee { animation: marquee 35s linear infinite; }
    .animate-marquee-reverse { animation: marquee 35s linear infinite reverse; }
    @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    .glass-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; }
  `]
})
export class SkillsComponent implements OnInit, OnDestroy {
  @Input() skills: any[] = [];
  currentLanguage = 'es';
  
  repeatItems = Array(12).fill(0);

  translations: any = {
    es: {
      tagline: 'Creador Digital & Desarrollador',
      softSkills: [
        'Dirección Creativa', 'Estrategia de Marca', 'Diseño de Producto', 'Experiencia de Usuario', 
        'Liderazgo Ágil', 'Arquitectura de Sistemas', 'Diseño Visual', 'Animación Gráfica'
      ]
    },
    en: {
      tagline: 'Digital Creator & Developer',
      softSkills: [
        'Creative Direction', 'Brand Strategy', 'Product Design', 'User Experience', 
        'Agile Leadership', 'System Architecture', 'Visual Design', 'Motion Graphics'
      ]
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
}
