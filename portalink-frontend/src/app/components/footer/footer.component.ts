import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer id="footer" class="pt-24 pb-12 px-6 sm:px-12 lg:px-20 overflow-hidden relative bg-[#040404] text-white border-t border-white/10">
      <!-- Large Ghost Brand Text -->
      <div class="absolute bottom-0 left-1/2 -translate-x-1/2 select-none pointer-events-none z-0">
        <h2 class="text-[14vw] font-headline leading-none text-white opacity-[0.018] whitespace-nowrap uppercase">
          SANTIAGO ARBELAEZ
        </h2>
      </div>

      <div class="max-w-[1500px] mx-auto relative z-10">
        
        <!-- Top Grid: 4 Columns -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 pb-16 border-b border-white/10">
          
          <!-- Col 1: Brand & Bio -->
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <span class="text-2xl sm:text-3xl font-headline font-black uppercase tracking-tighter text-white">
                SANTIAGO ARBELAEZ<span style="color: var(--accent-color, #00f5ff);">+</span>
              </span>
            </div>
            <p class="text-sm text-white/70 font-light leading-relaxed max-w-sm">
              Plataforma de ingeniería de software a medida, desarrollo de e-commerce de alto rendimiento e integración de Inteligencia Artificial avanzada.
            </p>
            <div class="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/[0.03] border border-white/10 text-xs uppercase tracking-widest text-white/80">
              <span class="w-2 h-2 rounded-full animate-pulse" style="background-color: var(--accent-color, #00f5ff);"></span>
              Sistemas & IA Activos 24/7
            </div>
          </div>

          <!-- Col 2: Navegación & Proyectos -->
          <div>
            <h4 class="text-sm font-mono font-bold uppercase tracking-[0.25em] mb-5" style="color: var(--accent-color, #00f5ff);">
              {{ getTranslation().navTitle }}
            </h4>
            <ul class="space-y-3.5 text-sm font-light text-white/80">
              <li><a routerLink="/" class="hover:text-white transition-colors">Inicio</a></li>
              <li><a routerLink="/planes-galeria" class="hover:text-white transition-colors">Galería de Proyectos</a></li>
              <li><a routerLink="/planes" class="hover:text-white transition-colors">Planes & Servicios</a></li>
              <li><a routerLink="/rotbot" class="hover:text-white transition-colors">Rotbot IA Copilot</a></li>
            </ul>
          </div>

          <!-- Col 3: Legal & Cumplimiento -->
          <div>
            <h4 class="text-sm font-mono font-bold uppercase tracking-[0.25em] mb-5" style="color: var(--accent-color, #00f5ff);">
              {{ getTranslation().legalTitle }}
            </h4>
            <ul class="space-y-3.5 text-sm font-light text-white/80">
              <li><a routerLink="/terminos" class="hover:text-white transition-colors">Términos y Condiciones</a></li>
              <li><a routerLink="/privacidad" class="hover:text-white transition-colors">Política de Privacidad</a></li>
              <li><a routerLink="/tratamiento-datos" class="hover:text-white transition-colors">Tratamiento de Datos (Habeas Data)</a></li>
              <li><a routerLink="/deslinde-ia" class="hover:text-white transition-colors font-medium text-white">Exención de Responsabilidad IA</a></li>
            </ul>
          </div>

          <!-- Col 4: Contacto Directo & Redes -->
          <div class="space-y-4">
            <h4 class="text-sm font-mono font-bold uppercase tracking-[0.25em] mb-5" style="color: var(--accent-color, #00f5ff);">
              {{ getTranslation().contactTitle }}
            </h4>
            <p class="text-sm font-light text-white/80">
              ¿Tienes un proyecto en mente? Desarrollemos tu idea a medida.
            </p>
            <a href="https://wa.me/573054078225" target="_blank" class="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-sm font-bold uppercase tracking-wider text-white transition-all">
              <span>WhatsApp Oficial</span>
              <span>→</span>
            </a>
            <div class="pt-2 flex items-center gap-4 text-white/60 text-sm font-medium">
              <a href="https://www.tiktok.com/@santiagoarbelaezc" target="_blank" class="hover:text-white transition-colors">TikTok</a>
              <a href="https://www.instagram.com/santiagoarbelaezc/" target="_blank" class="hover:text-white transition-colors">Instagram</a>
              <a href="https://www.linkedin.com/in/santiago-arbelaez-contreras-9830b5290/" target="_blank" class="hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>

        </div>

        <!-- Bottom Legal Bar -->
        <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs sm:text-sm font-light text-white/60">
          <div>
            &copy; {{ currentYear }} Santiago Arbeláez — PortaLink. Todos los derechos reservados.
          </div>
          
          <div class="text-center sm:text-right max-w-lg text-xs leading-relaxed text-white/45">
            Rotbot opera mediante modelos de IA generativa (Groq / Llama). Respuestas y cotizaciones son orientativas y no contractuales.
          </div>
        </div>

      </div>
    </footer>
  `,
  styles: [`
    @media (max-width: 768px) {
      #footer {
        padding-bottom: 120px !important;
      }
    }
  `]
})
export class FooterComponent implements OnInit, OnDestroy {
  currentLanguage = 'es';
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

