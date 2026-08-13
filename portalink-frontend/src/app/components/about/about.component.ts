import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule, RevealDirective],
  template: `
    <section id="about" class="relative py-16 md:py-24 px-6 sm:px-12 lg:px-20 bg-white text-neutral-900 transition-colors duration-500" *ngIf="data?.visible !== false">
      <div class="max-w-[1500px] mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          <!-- Left Side: Profile Image Showcase (Matching Hero Video & Project Cards style) -->
          <div class="lg:col-span-5 w-full" appReveal>
            <div class="relative w-full rounded-[28px] sm:rounded-[36px] overflow-hidden border border-neutral-200/80 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.04)] transition-all duration-500 hover:scale-[1.01] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] group">
              <div class="aspect-[4/5] w-full overflow-hidden bg-neutral-50">
                <img [src]="data?.avatarImage || 'assets/images/fotos/main-link.jpg'" 
                     alt="Perfil Profesional" 
                     class="w-full h-full object-cover object-[center_25%] transition-transform duration-700 ease-out group-hover:scale-105" />
              </div>
            </div>
          </div>

          <!-- Right Side: Bio & Action CTAs -->
          <div class="lg:col-span-7 space-y-6 lg:pl-4">
            <div appReveal>
              <!-- Category Pill -->
              <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100 text-neutral-900 text-xs font-headline font-semibold tracking-wider mb-4 border border-neutral-200/60">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Sobre mí</span>
              </div>

              <h2 class="text-3xl sm:text-4xl lg:text-5xl font-headline font-semibold tracking-tight leading-[1.12]" 
                  style="color: #0a0a0a !important;">
                Ingeniero de Sistemas, desarrollador web & creador digital
              </h2>
            </div>

            <div class="space-y-4 font-sans font-normal text-neutral-600 text-base sm:text-lg leading-relaxed" appReveal [delay]="200">
              <p>
                {{ getTranslation().bioLine1 }}
              </p>
              <p>
                {{ getTranslation().bioLine2 }}
              </p>
            </div>

            <!-- Action CTAs -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-4" appReveal [delay]="350">
              
              <!-- Primary CTA: Propuesta Digital -->
              <a routerLink="/proposal" 
                 class="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-headline font-medium text-xs tracking-wide transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] no-underline border-none"
                 style="background-color: #09090b !important; color: #ffffff !important;">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="color: #ffffff !important;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <span style="color: #ffffff !important; font-weight: 500;">{{ getTranslation().btnProposal }}</span>
              </a>

              <!-- Secondary CTA: Certificados -->
              <a routerLink="/perfil" 
                 class="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-headline font-medium text-xs tracking-wide transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] no-underline border border-neutral-200 bg-neutral-100 hover:bg-neutral-200 text-neutral-900">
                <svg class="w-4 h-4 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                </svg>
                <span>{{ getTranslation().btnCertificates }}</span>
              </a>

            </div>

          </div>

        </div>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class AboutComponent implements OnInit, OnDestroy {
  @Input() data: any;

  currentLanguage = 'es';

  translations: any = {
    es: {
      philosophy: 'Perfil',
      headline: 'Ingeniero de Sistemas, desarrollador web & creador digital',
      bioLine1: 'Diseño y desarrollo soluciones digitales a medida con tecnología moderna e inteligencia artificial, impulsando el crecimiento real de tu negocio.',
      bioLine2: 'Me enfoco en construir arquitecturas sólidas, experiencias de usuario fluidas e interfaces visualmente de alto nivel que convierten visitas en clientes.',
      btnProposal: 'Propuesta Digital',
      btnCertificates: 'Certificados'
    },
    en: {
      philosophy: 'Profile',
      headline: 'Systems Engineer, web developer & digital creator',
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
