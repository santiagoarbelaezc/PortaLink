import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer id="footer" class="bg-white text-neutral-900 pt-16 pb-12 sm:pt-20 sm:pb-16 px-6 sm:px-12 lg:px-20 border-t border-neutral-100 font-sans selection:bg-neutral-900 selection:text-white">
      <div class="max-w-[1500px] mx-auto">
        
        <!-- Top Grid: 4 Columns (Layout Clásico Restaurado & Pulido) -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-12 sm:pb-16 border-b border-neutral-100">
          
          <!-- Col 1: Brand, Logo & Redes (4 Cols) -->
          <div class="lg:col-span-4 space-y-4">
            <div class="flex items-center gap-3">
              <a routerLink="/" class="inline-flex items-center no-underline group cursor-pointer shrink-0">
                <img [src]="currentTheme === 'light' ? 'assets/icons/navbar-logolight.png' : 'assets/icons/navbar-logodark.png'" 
                     alt="Santiago Arbelaez" 
                     class="h-8 sm:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
              </a>
              <h3 class="text-xl sm:text-2xl font-headline font-bold tracking-tight text-[#0a0a0a] m-0" style="color: #0a0a0a !important;">
                SANTIAGO ARBELAEZ
              </h3>
            </div>
            
            <p class="text-xs font-sans text-neutral-500 leading-relaxed max-w-sm m-0">
              Ingeniería de software a medida, desarrollo e-commerce e Inteligencia Artificial.
            </p>

            <!-- Redes Sociales integradas con la identidad -->
            <div class="pt-2 flex items-center gap-2 flex-wrap">
              <a href="https://www.tiktok.com/@santiarbelaezz" target="_blank" class="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-700 text-xs font-headline font-medium transition-all no-underline">TikTok</a>
              <a href="https://www.instagram.com/santiarbelaezz/" target="_blank" class="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-700 text-xs font-headline font-medium transition-all no-underline">Instagram</a>
              <a href="https://www.linkedin.com/in/santiago-arbelaez-contreras-9830b5290/" target="_blank" class="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-700 text-xs font-headline font-medium transition-all no-underline">LinkedIn</a>
            </div>
          </div>

          <!-- Col 2: Navegación (3 Cols) -->
          <div class="lg:col-span-3">
            <h4 class="text-sm font-headline font-semibold tracking-tight mb-5" style="color: #0a0a0a !important;">
              {{ getTranslation().navTitle }}
            </h4>
            <ul class="space-y-3 text-xs font-headline font-medium text-neutral-500 p-0 m-0 list-none">
              <li><a routerLink="/" class="hover:text-neutral-900 transition-colors no-underline">Inicio</a></li>
              <li><a routerLink="/prototipos" class="hover:text-neutral-900 transition-colors no-underline">Galería de Diseños & Prototipos</a></li>
              <li><a routerLink="/planes" class="hover:text-neutral-900 transition-colors no-underline">Planes & Servicios</a></li>
              <li><a routerLink="/rotbot" class="hover:text-neutral-900 transition-colors no-underline">RotBot IA Copilot</a></li>
            </ul>
          </div>

          <!-- Col 3: Legal & Cumplimiento (3 Cols) -->
          <div class="lg:col-span-3">
            <h4 class="text-sm font-headline font-semibold tracking-tight mb-5" style="color: #0a0a0a !important;">
              {{ getTranslation().legalTitle }}
            </h4>
            <ul class="space-y-3 text-xs font-headline font-medium text-neutral-500 p-0 m-0 list-none">
              <li><a routerLink="/terminos" class="hover:text-neutral-900 transition-colors no-underline">Términos y Condiciones</a></li>
              <li><a routerLink="/privacidad" class="hover:text-neutral-900 transition-colors no-underline">Política de Privacidad</a></li>
              <li><a routerLink="/tratamiento-datos" class="hover:text-neutral-900 transition-colors no-underline">Tratamiento de Datos (Habeas Data)</a></li>
              <li><button (click)="openCookieSettings()" class="hover:text-neutral-900 transition-colors cursor-pointer text-left border-none bg-transparent p-0 text-xs font-headline font-medium text-neutral-500">Configuración de Cookies</button></li>
              <li><a routerLink="/deslinde-ia" class="hover:text-neutral-900 transition-colors no-underline">Exención de Responsabilidad IA</a></li>
            </ul>
          </div>

          <!-- Col 4: Contacto Directo (2 Cols) -->
          <div class="lg:col-span-2 space-y-4">
            <h4 class="text-sm font-headline font-semibold tracking-tight mb-5" style="color: #0a0a0a !important;">
              {{ getTranslation().contactTitle }}
            </h4>
            
            <a href="https://wa.me/573054078225" target="_blank" 
               class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-headline font-semibold text-xs shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all no-underline cursor-pointer border-none"
               style="background-color: #09090b !important; color: #ffffff !important;">
              <span style="color: #ffffff !important; font-weight: 600;">WhatsApp Oficial</span>
              <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="color: #ffffff !important;"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
            </a>
          </div>

        </div>

        <!-- Bottom Legal Bar -->
        <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-neutral-400">
          <div>
            &copy; {{ currentYear }} Santiago Arbelaez. Todos los derechos reservados.
          </div>
          
          <div class="text-center sm:text-right max-w-lg text-[11px] leading-relaxed text-neutral-400">
            RotBot opera mediante modelos de IA generativa (Groq / Llama). Respuestas y cotizaciones son orientativas.
          </div>
        </div>

      </div>
    </footer>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class FooterComponent implements OnInit, OnDestroy {
  currentLanguage = 'es';
  currentTheme = 'light';
  currentYear = new Date().getFullYear();

  translations: any = {
    es: {
      navTitle: 'Navegación',
      legalTitle: 'Legal & Protección',
      contactTitle: 'Contacto',
      handcrafted: 'Hecho a mano con pasión'
    },
    en: {
      navTitle: 'Navigation',
      legalTitle: 'Legal & Protection',
      contactTitle: 'Contact',
      handcrafted: 'Handcrafted with passion'
    }
  };

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.currentLanguage = localStorage.getItem('portfolio-language') || 'es';
      this.currentTheme = localStorage.getItem('portfolio-theme') || 'light';
      window.addEventListener('portfolio-language-change', this.onLanguageChange);
      window.addEventListener('portfolio-theme-change', this.onThemeChange);
    }
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('portfolio-language-change', this.onLanguageChange);
      window.removeEventListener('portfolio-theme-change', this.onThemeChange);
    }
  }

  onLanguageChange = (event: any) => {
    this.currentLanguage = event.detail.language;
  };

  onThemeChange = (event: any) => {
    this.currentTheme = event.detail.theme;
  };

  getTranslation() {
    return this.translations[this.currentLanguage] || this.translations['es'];
  }

  openCookieSettings() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-cookie-settings'));
    }
  }
}
