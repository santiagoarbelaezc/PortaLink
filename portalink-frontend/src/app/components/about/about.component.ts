import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
    selector: 'app-about',
    standalone: true,
    imports: [CommonModule, RouterModule, RevealDirective],
    template: `
    <section id="about" class="py-10 md:py-16 px-6 overflow-hidden" *ngIf="data?.visible !== false">
      <div class="container mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-20 items-center">

          <!-- Image Container -->
          <div class="relative w-full" appReveal>
            <div class="aspect-[4/5] overflow-hidden border border-white/20 relative shadow-2xl">
              <div class="absolute top-2 left-2 w-3 h-3 border-t border-l border-white/50 z-10"></div>
              <div class="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-white/50 z-10"></div>
              <img [src]="data?.avatarImage || 'assets/images/fotos/main-link.jpg'" alt="Creative Profile" class="w-full h-full object-cover grayscale brightness-75 hover:brightness-100 hover:grayscale-0 transition-all duration-700" />
            </div>

            <!-- Decorative corner element -->
            <div class="absolute -top-4 -right-4 w-20 h-20 border border-white/10 opacity-40"></div>
          </div>

          <!-- Bio Content -->
          <div class="space-y-6">
            <div appReveal>
              <h2 class="text-4xl md:text-5xl lg:text-6xl font-headline uppercase leading-none tracking-tighter mb-6" [innerHTML]="getTranslation().headline"></h2>
            </div>

            <div class="space-y-4 leading-relaxed" appReveal [delay]="300">
              <p class="text-base md:text-lg max-w-xl font-light" style="color: var(--text-secondary); line-height: 1.65;">
                {{ getTranslation().bioLine1 }}
              </p>
              <p class="text-base md:text-lg max-w-xl font-light" style="color: var(--text-secondary); line-height: 1.65;">
                {{ getTranslation().bioLine2 }}
              </p>
            </div>

            <!-- Action Buttons: Propuesta Digital & Certificados (Hero Button Style) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-lg pt-4" appReveal [delay]="450">
              <!-- Propuesta Digital -->
              <a routerLink="/proposal" class="about-btn-hero group">
                <div class="flex items-center gap-2.5">
                  <svg class="w-4 h-4 text-current opacity-70 group-hover:scale-105 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <span>{{ getTranslation().btnProposal }}</span>
                </div>
                <svg class="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7 17L17 7M17 7H7M17 7V17"/>
                </svg>
              </a>

              <!-- Certificados -->
              <a routerLink="/perfil" class="about-btn-hero group">
                <div class="flex items-center gap-2.5">
                  <svg class="w-4 h-4 text-current opacity-70 group-hover:scale-105 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                  </svg>
                  <span>{{ getTranslation().btnCertificates }}</span>
                </div>
                <svg class="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7 17L17 7M17 7H7M17 7V17"/>
                </svg>
              </a>
            </div>

          </div>
        </div>
      </div>
    </section>
  `,
    styles: [`
    .about-btn-hero {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.95rem 1.35rem;
      border-radius: 1rem;
      background: rgba(255, 255, 255, 0.04);
      color: var(--text-primary, #ffffff);
      border: 1px solid rgba(255, 255, 255, 0.12);
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      text-decoration: none;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      cursor: pointer;
    }
    .theme-light .about-btn-hero {
      background: #ffffff;
      border-color: rgba(0, 0, 0, 0.12);
      color: #111111;
      box-shadow: 0 2px 10px rgba(0,0,0,0.03);
    }
    .about-btn-hero:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-primary, #ffffff);
      border-color: rgba(255, 255, 255, 0.25);
      transform: translateY(-2px);
    }
    .theme-light .about-btn-hero:hover {
      background: rgba(0, 0, 0, 0.06);
      color: #111111;
      border-color: rgba(0, 0, 0, 0.25);
    }
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
      headline: 'Ingeniero de Sistemas, desarrollador web, creador digital',
      bioLine1: 'Diseño y desarrollo soluciones digitales a medida con tecnología moderna e inteligencia artificial, impulsando el crecimiento real de tu negocio.',
      bioLine2: 'Me enfoco en construir arquitecturas sólidas, experiencias de usuario fluidas e interfaces visualmente de alto nivel que convierten visitas en clientes.',
      btnProposal: 'Propuesta Digital',
      btnCertificates: 'Certificados'
    },
    en: {
      philosophy: 'Profile',
      headline: 'Systems Engineer, web developer, digital creator',
      bioLine1: 'I design and develop custom digital solutions with modern technology and artificial intelligence, driving real business growth.',
      bioLine2: 'I focus on building solid architectures, seamless user experiences, and high-level visual interfaces that turn visitors into clients.',
      btnProposal: 'Digital Proposal',
      btnCertificates: 'Certificates'
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
