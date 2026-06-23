import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
    selector: 'app-skills',
    standalone: true,
    imports: [CommonModule],
    template: `
    <section id="skills" class="py-20 border-y overflow-hidden" style="border-color: var(--card-border);">
      <!-- Marquee Wrapper -->
      <div class="relative flex overflow-hidden">
        <div class="flex animate-marquee whitespace-nowrap gap-12 py-10">
          <div *ngFor="let tech of (skills || defaultSkills).concat(skills || defaultSkills)" 
               class="flex items-center gap-4 px-8 py-4 glass-card group cursor-default hover:border-white/50">
            <div class="w-10 h-10 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
              <i *ngIf="tech.icon" [class]="tech.icon" class="text-2xl" style="color: var(--text-primary);"></i>
              <svg *ngIf="!tech.icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color: var(--text-primary);" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            </div>
            <div class="flex flex-col">
              <span class="font-headline text-3xl uppercase tracking-tighter" style="color: var(--text-primary);">{{ tech.name }}</span>
              <span class="text-[10px] tracking-widest" style="color: var(--text-secondary);">{{ tech.percentage }}% {{ getTranslation().mastery }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Secondary Marquee (Reverse) -->
      <div class="relative flex overflow-hidden mt-4">
        <div class="flex animate-marquee-reverse whitespace-nowrap gap-12 py-10">
          <div *ngFor="let skill of getTranslation().softSkills.concat(getTranslation().softSkills)" 
               class="flex items-center gap-4 px-8 py-4 border rounded-none group cursor-default transition-colors hover:bg-black/5 dark:hover:bg-white/5"
               style="border-color: var(--card-border);">
            <span class="text-xs uppercase tracking-[0.4em] transition-colors" style="color: var(--text-secondary);">{{ skill }}</span>
            <div class="w-1.5 h-1.5 rounded-none" style="background-color: var(--text-secondary); opacity: 0.35;"></div>
          </div>
        </div>
      </div>
    </section>
  `,
    styles: [`
    .animate-marquee { animation: marquee 40s linear infinite; }
    .animate-marquee-reverse { animation: marquee 40s linear infinite reverse; }
    @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    .glass-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 0; }
  `]
})
export class SkillsComponent implements OnInit, OnDestroy {
  @Input() skills: any[] = [];
  
  currentLanguage = 'es';

  translations: any = {
    es: {
      mastery: 'Dominio',
      softSkills: [
        'Dirección Creativa', 'Estrategia de Marca', 'Diseño de Producto', 'Experiencia de Usuario', 
        'Liderazgo Ágil', 'Arquitectura de Sistemas', 'Diseño Visual', 'Animación Gráfica'
      ]
    },
    en: {
      mastery: 'Mastery',
      softSkills: [
        'Creative Direction', 'Brand Strategy', 'Product Design', 'User Experience', 
        'Agile Leadership', 'System Architecture', 'Visual Design', 'Motion Graphics'
      ]
    }
  };

  defaultSkills = [
    { name: 'Angular', icon: 'fab fa-angular', percentage: 95 },
    { name: 'TypeScript', icon: 'fab fa-js', percentage: 90 },
    { name: 'SCSS', icon: 'fab fa-sass', percentage: 85 }
  ];

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
