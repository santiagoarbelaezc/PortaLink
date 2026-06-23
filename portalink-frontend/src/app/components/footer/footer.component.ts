import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [CommonModule],
    template: `
    <footer id="footer" class="pt-32 pb-12 px-6 overflow-hidden relative">
      <!-- Large Ghost Text -->
      <div class="absolute bottom-0 left-1/2 -translate-x-1/2 select-none pointer-events-none">
        <h2 class="text-[25vw] font-headline leading-none text-white opacity-[0.02] whitespace-nowrap">
          SANTIAGO 2025
        </h2>
      </div>

      <div class="container mx-auto relative z-10">
        <div class="flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/5 pt-12">
          <div class="text-xs uppercase tracking-[0.4em] text-white/30">
            &copy; 2025 {{ getTranslation().handcrafted }}
          </div>
          
          <div class="flex gap-8">
            <a href="#" class="text-[10px] uppercase tracking-widest hover:text-white transition-colors">{{ getTranslation().privacy }}</a>
            <a href="#" class="text-[10px] uppercase tracking-widest hover:text-white transition-colors">{{ getTranslation().terms }}</a>
            <a href="#" class="text-[10px] uppercase tracking-widest hover:text-white transition-colors">{{ getTranslation().backToTop }}</a>
          </div>

          <div class="flex items-center gap-3">
             <div class="w-1.5 h-1.5 bg-white/50"></div>
             <span class="text-xs uppercase tracking-widest italic font-editorial">{{ getTranslation().luxuryText }}</span>
          </div>
        </div>
      </div>
    </footer>
  `,
    styles: [`
    @media (max-width: 768px) {
      #footer {
        padding-bottom: 140px !important;
      }
    }
  `]
})
export class FooterComponent implements OnInit, OnDestroy {
  currentLanguage = 'es';

  translations: any = {
    es: {
      handcrafted: 'Hecho a mano con pasión',
      privacy: 'Privacidad',
      terms: 'Términos',
      backToTop: 'Volver arriba',
      luxuryText: 'Tecnología de Lujo & Diseño'
    },
    en: {
      handcrafted: 'Handcrafted with passion',
      privacy: 'Privacy',
      terms: 'Terms',
      backToTop: 'Back to top',
      luxuryText: 'Luxury Tech & Design'
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
