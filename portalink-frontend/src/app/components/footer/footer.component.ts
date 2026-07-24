import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer id="footer" class="pt-24 pb-12 px-6 sm:px-12 lg:px-20 overflow-hidden relative border-t transition-colors duration-500 footer-container" style="background-color: var(--bg-primary); color: var(--text-primary); border-color: var(--card-border);">
      <!-- Large Ghost Brand Text -->
      <div class="absolute bottom-0 left-1/2 -translate-x-1/2 select-none pointer-events-none z-0">
        <h2 class="text-[14vw] font-headline leading-none whitespace-nowrap uppercase footer-ghost-text" style="color: var(--text-primary); opacity: 0.025;">
          SANTIAGO ARBELAEZ
        </h2>
      </div>

      <div class="max-w-[1500px] mx-auto relative z-10">
        
        <!-- Top Grid: 4 Columns -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 pb-16 border-b footer-border-grid" style="border-color: var(--card-border);">
          
          <!-- Col 1: Brand & Bio -->
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <span class="text-2xl sm:text-3xl font-headline font-black uppercase tracking-tighter footer-brand-title" style="color: var(--text-primary);">
                SANTIAGO ARBELAEZ<span style="color: var(--accent-color, #00f5ff);">+</span>
              </span>
            </div>
            <p class="text-sm font-light leading-relaxed max-w-sm" style="color: var(--text-secondary);">
              Plataforma de ingeniería de software a medida, desarrollo de e-commerce de alto rendimiento e integración de Inteligencia Artificial avanzada.
            </p>
            <div class="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs uppercase tracking-widest footer-pill-badge" style="background: var(--card-bg); border-color: var(--card-border); color: var(--text-secondary);">
              <span class="w-2 h-2 rounded-full animate-pulse" style="background-color: var(--accent-color, #00f5ff);"></span>
              Sistemas & IA Activos 24/7
            </div>
          </div>

          <!-- Col 2: Navegación & Proyectos -->
          <div>
            <h4 class="text-sm font-mono font-bold uppercase tracking-[0.25em] mb-5" style="color: var(--accent-color, #00f5ff);">
              {{ getTranslation().navTitle }}
            </h4>
            <ul class="space-y-3.5 text-sm font-light">
              <li><a routerLink="/" class="footer-link transition-colors" style="color: var(--text-secondary);">Inicio</a></li>
              <li><a routerLink="/proposal" class="footer-link transition-colors" style="color: var(--text-secondary);">Propuesta Digital</a></li>
              <li><a routerLink="/planes-galeria" class="footer-link transition-colors" style="color: var(--text-secondary);">Galería de Proyectos</a></li>
              <li><a routerLink="/planes" class="footer-link transition-colors" style="color: var(--text-secondary);">Planes & Servicios</a></li>
              <li><a routerLink="/rotbot" class="footer-link transition-colors" style="color: var(--text-secondary);">Rotbot IA Copilot</a></li>
            </ul>
          </div>

          <!-- Col 3: Legal & Cumplimiento -->
          <div>
            <h4 class="text-sm font-mono font-bold uppercase tracking-[0.25em] mb-5" style="color: var(--accent-color, #00f5ff);">
              {{ getTranslation().legalTitle }}
            </h4>
            <ul class="space-y-3.5 text-sm font-light">
              <li><a routerLink="/terminos" class="footer-link transition-colors" style="color: var(--text-secondary);">Términos y Condiciones</a></li>
              <li><a routerLink="/privacidad" class="footer-link transition-colors" style="color: var(--text-secondary);">Política de Privacidad</a></li>
              <li><a routerLink="/tratamiento-datos" class="footer-link transition-colors" style="color: var(--text-secondary);">Tratamiento de Datos (Habeas Data)</a></li>
              <li><a routerLink="/deslinde-ia" class="footer-link transition-colors font-medium" style="color: var(--text-primary);">Exención de Responsabilidad IA</a></li>
            </ul>
          </div>

          <!-- Col 4: Contacto Directo & Redes -->
          <div class="space-y-4">
            <h4 class="text-sm font-mono font-bold uppercase tracking-[0.25em] mb-5" style="color: var(--accent-color, #00f5ff);">
              {{ getTranslation().contactTitle }}
            </h4>
            <p class="text-sm font-light" style="color: var(--text-secondary);">
              ¿Tienes un proyecto en mente? Desarrollemos tu idea a medida.
            </p>
            <a href="https://wa.me/573054078225" target="_blank" class="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl border text-sm font-bold uppercase tracking-wider transition-all footer-btn" style="background: var(--card-bg); border-color: var(--card-border); color: var(--text-primary);">
              <span>WhatsApp Oficial</span>
              <span>→</span>
            </a>
            <div class="pt-2 flex items-center gap-4 text-sm font-medium">
              <a href="https://www.tiktok.com/@santiagoarbelaezc" target="_blank" class="footer-link transition-colors" style="color: var(--text-secondary);">TikTok</a>
              <a href="https://www.instagram.com/santiagoarbelaezc/" target="_blank" class="footer-link transition-colors" style="color: var(--text-secondary);">Instagram</a>
              <a href="https://www.linkedin.com/in/santiago-arbelaez-contreras-9830b5290/" target="_blank" class="footer-link transition-colors" style="color: var(--text-secondary);">LinkedIn</a>
            </div>
          </div>

        </div>

        <!-- Bottom Legal Bar -->
        <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs sm:text-sm font-light" style="color: var(--text-secondary);">
          <div>
            &copy; {{ currentYear }} Santiago Arbeláez — PortaLink. Todos los derechos reservados.
          </div>
          
          <div class="text-center sm:text-right max-w-lg text-xs leading-relaxed opacity-75" style="color: var(--text-secondary);">
            Rotbot opera mediante modelos de IA generativa (Groq / Llama). Respuestas y cotizaciones son orientativas y no contractuales.
          </div>
        </div>

      </div>
    </footer>
  `,
  styles: [`
    .footer-link:hover {
      color: var(--text-primary) !important;
    }
    .footer-btn:hover {
      background: var(--text-primary) !important;
      color: var(--bg-primary) !important;
      border-color: var(--text-primary) !important;
    }
    :host-context(.theme-light) #footer {
      background-color: #f9fafb !important;
      color: #111827 !important;
      border-color: rgba(0, 0, 0, 0.08) !important;
    }
    :host-context(.theme-light) .footer-border-grid {
      border-color: rgba(0, 0, 0, 0.08) !important;
    }
    :host-context(.theme-light) .footer-ghost-text {
      color: #000000 !important;
      opacity: 0.03 !important;
    }
    :host-context(.theme-light) .footer-brand-title {
      color: #111827 !important;
    }
    :host-context(.theme-light) .footer-pill-badge {
      background: rgba(0, 0, 0, 0.04) !important;
      border-color: rgba(0, 0, 0, 0.08) !important;
      color: #4b5563 !important;
    }
    :host-context(.theme-light) .footer-link {
      color: #4b5563 !important;
    }
    :host-context(.theme-light) .footer-link:hover {
      color: #000000 !important;
    }
    :host-context(.theme-light) .footer-btn {
      background: rgba(0, 0, 0, 0.04) !important;
      border-color: rgba(0, 0, 0, 0.12) !important;
      color: #111827 !important;
    }
    :host-context(.theme-light) .footer-btn:hover {
      background: #111827 !important;
      color: #ffffff !important;
      border-color: #111827 !important;
    }

    @media (max-width: 768px) {
      #footer {
        padding-bottom: 120px !important;
      }
    }
  `]
})
export class FooterComponent implements OnInit, OnDestroy {
  currentLanguage = 'es';
  currentTheme = 'dark';
  currentYear = new Date().getFullYear();

  translations: any = {
    es: {
      navTitle: 'Navegación',
      legalTitle: 'Legal & Protección',
      contactTitle: 'Contacto Directo',
      handcrafted: 'Hecho a mano con pasión'
    },
    en: {
      navTitle: 'Navigation',
      legalTitle: 'Legal & Protection',
      contactTitle: 'Direct Contact',
      handcrafted: 'Handcrafted with passion'
    }
  };

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.currentLanguage = localStorage.getItem('portfolio-language') || 'es';
      this.currentTheme = localStorage.getItem('portfolio-theme') || 'dark';
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
}
