import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ViewEncapsulation } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-link',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="lt-wrapper">
      <div class="lt-container">
        
        <main class="lt-main-grid">
          
          <!-- COLUMN 1: PORTRAIT -->
          <aside class="lt-col-photo">
            <div class="lt-portrait-wrapper">
              <div class="lt-image-container">
                <img src="about-portrait.png" alt="Santiago Arbelaez" class="lt-main-img lt-bg-blur" />
                <div class="lt-profile-overlay">
                  <img src="assets/icons/mi-logo.png" alt="Santiago Arbelaez" class="lt-profile-logo" />
                </div>
              </div>
            </div>
          </aside>

          <!-- COLUMN 2: INFO & LINKS -->
          <section class="lt-col-info">
            <header class="lt-info-header">
              <h1 class="text-5xl md:text-[80px] font-headline uppercase leading-[0.9] tracking-[0.1em]" style="color: var(--text-primary);">
                Santiago<br/>Arbelaez
              </h1>
              <p class="text-[10px] md:text-xs uppercase tracking-[0.4em] mt-3 md:mt-4 opacity-60 font-headline" style="color: var(--text-secondary);">
                {{ getTranslation().creador }} {{ getTranslation().digital }} {{ getTranslation().desarrollador }}
              </p>
            </header>

            <div class="lt-links-container">

              <!-- Portafolio Main CTA -->
              <a routerLink="/proyectos" class="lt-card-main group lt-item-portfolio">
                <div class="flex items-center gap-6">
                  <div class="lt-icon-wrapper">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-white/80 group-hover:text-white transition-colors">
                      <rect x="2" y="7" width="20" height="14" rx="0" ry="0"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                  </div>
                  <div class="lt-card-body">
                    <h3 class="text-2xl md:text-3xl font-headline uppercase text-white">{{ getTranslation().descubre }}</h3>
                    <p class="text-[8px] uppercase tracking-[0.3em] text-white/50 mt-1">{{ getTranslation().ingenieria }}</p>
                  </div>
                </div>
                <div class="lt-action-line hidden md:flex">
                  <div class="w-10 h-px bg-white/30 group-hover:w-20 group-hover:bg-white transition-all duration-700"></div>
                  <span class="text-white/30 group-hover:text-white transition-colors text-xl">↗</span>
                </div>
                <span class="md:hidden text-white/30 group-hover:text-white transition-colors">↗</span>
              </a>

              <!-- TikTok -->
              <a href="https://www.tiktok.com/@santiagoarbelaezc" target="_blank" class="lt-card-social group lt-item-tiktok">
                <div class="flex justify-between w-full mb-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-white/40 group-hover:text-white transition-colors">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                  </svg>
                  <span class="text-white/20 group-hover:text-white transition-colors">↗</span>
                </div>
                <div class="w-full h-px bg-white/10 group-hover:bg-white/20 transition-colors my-3"></div>
                <div>
                  <h4 class="text-base md:text-xl font-headline uppercase text-white/50 group-hover:text-white transition-colors">TikTok</h4>
                  <span class="text-[8px] uppercase tracking-[0.2em] text-white/30 group-hover:text-white transition-colors mt-1 block">{{ getTranslation().videos }}</span>
                </div>
              </a>

              <!-- Instagram -->
              <a href="https://www.instagram.com/santiagoarbelaezc/" target="_blank" class="lt-card-social group lt-item-insta">
                <div class="flex justify-between w-full mb-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-white/40 group-hover:text-white transition-colors">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                  <span class="text-white/20 group-hover:text-white transition-colors">↗</span>
                </div>
                <div class="w-full h-px bg-white/10 group-hover:bg-white/20 transition-colors my-3"></div>
                <div>
                  <h4 class="text-base md:text-xl font-headline uppercase text-white/50 group-hover:text-white transition-colors">Instagram</h4>
                  <span class="text-[8px] uppercase tracking-[0.2em] text-white/30 group-hover:text-white transition-colors mt-1 block">{{ getTranslation().fotos }}</span>
                </div>
              </a>

              <!-- WhatsApp -->
              <a href="https://wa.me/573000000000" target="_blank" class="lt-card-social group lt-item-wa">
                <div class="flex justify-between w-full mb-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-white/40 group-hover:text-white transition-colors">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                  <span class="text-white/20 group-hover:text-white transition-colors">↗</span>
                </div>
                <div class="w-full h-px bg-white/10 group-hover:bg-white/20 transition-colors my-3"></div>
                <div>
                  <h4 class="text-base md:text-xl font-headline uppercase text-white/50 group-hover:text-white transition-colors">WhatsApp</h4>
                  <span class="text-[8px] uppercase tracking-[0.2em] text-white/30 group-hover:text-white transition-colors mt-1 block">{{ getTranslation().chat }}</span>
                </div>
              </a>

              <!-- LinkedIn -->
              <a href="https://www.linkedin.com/in/santiago-arbelaez-contreras-9830b5290/" target="_blank" class="lt-card-social group lt-item-linkedin">
                <div class="flex justify-between w-full mb-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-white/40 group-hover:text-white transition-colors">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                  <span class="text-white/20 group-hover:text-white transition-colors">↗</span>
                </div>
                <div class="w-full h-px bg-white/10 group-hover:bg-white/20 transition-colors my-3"></div>
                <div>
                  <h4 class="text-base md:text-xl font-headline uppercase text-white/50 group-hover:text-white transition-colors">LinkedIn</h4>
                  <span class="text-[8px] uppercase tracking-[0.2em] text-white/30 group-hover:text-white transition-colors mt-1 block">{{ getTranslation().empleo }}</span>
                </div>
              </a>

            </div>
          </section>

        </main>
      </div>
    </div>

    <!-- PWA Install Modal -->
    <div *ngIf="showInstallModal" class="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-6 bg-black/90 backdrop-blur-md" (click)="closeModal()">
      <div class="bg-[#050505] border border-white/20 rounded-none w-full max-w-md p-8 shadow-2xl animate-slide-up" (click)="$event.stopPropagation()">
        <div class="flex justify-center mb-6">
          <div class="w-16 h-16 bg-white flex items-center justify-center shadow-none">
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </div>
        </div>
        
        <h2 class="text-2xl font-headline uppercase text-white text-center mb-2">{{ getTranslation().instalarTitulo }}</h2>
        <p class="text-white/60 text-center text-sm mb-8 leading-relaxed">
          {{ isIOS ? getTranslation().instalarDescIOS : getTranslation().instalarDescOther }}
        </p>

        <!-- Android Button -->
        <button *ngIf="!isIOS" (click)="installPWA()" class="w-full bg-white text-black py-4 font-bold uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors mb-4 border border-white">
          {{ getTranslation().instalarBtn }}
        </button>

        <!-- iOS Instructions -->
        <div *ngIf="isIOS" class="space-y-4">
          <div class="flex items-center gap-4 bg-white/5 p-4 border border-white/20">
            <div class="w-8 h-8 bg-white/10 flex items-center justify-center text-white text-[10px] font-bold">1</div>
            <p class="text-white/80 text-[11px]" [innerHTML]="getTranslation().instalarIos1"></p>
          </div>
          <div class="flex items-center gap-4 bg-white/5 p-4 border border-white/20">
            <div class="w-8 h-8 bg-white/10 flex items-center justify-center text-white text-[10px] font-bold">2</div>
            <p class="text-white/80 text-[11px]" [innerHTML]="getTranslation().instalarIos2"></p>
          </div>
        </div>

        <button (click)="closeModal()" class="w-full text-white/40 py-2 text-[10px] uppercase tracking-widest hover:text-white transition-colors mt-4">
          {{ isIOS ? getTranslation().entendido : getTranslation().ahoraNo }}
        </button>
      </div>
    </div>
  `,
    styleUrls: ['./link.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class LinkComponent implements OnInit, OnDestroy {
  currentYear = new Date().getFullYear();
  deferredPrompt: any;
  showInstallModal = false;
  isIOS = false;
  isStandalone = false;
  currentLanguage = 'es';

  translations: any = {
    es: {
      soy: 'Soy ',
      creador: 'Creador',
      digital: 'Digital',
      desarrollador: '& Desarrollador',
      descubre: 'Descubre más',
      ingenieria: 'Ingeniería & Desarrollo',
      videos: 'Videos',
      fotos: 'Fotos',
      chat: 'Chat',
      empleo: 'Profesional',
      instalarTitulo: 'Instalar PortaLink',
      instalarDescIOS: 'Añade esta aplicación a tu pantalla de inicio para acceder rápidamente a mi portafolio y redes.',
      instalarDescOther: 'Instala la aplicación para una experiencia más rápida y sin distracciones.',
      instalarBtn: 'Instalar Ahora',
      instalarIos1: 'Pulsa el botón <b>Compartir</b> en Safari.',
      instalarIos2: 'Selecciona <b>"Añadir a la pantalla de inicio"</b>.',
      entendido: 'Entendido',
      ahoraNo: 'Ahora no'
    },
    en: {
      soy: 'I am ',
      creador: 'Digital',
      digital: 'Creator',
      desarrollador: '& Developer',
      descubre: 'Discover more',
      ingenieria: 'Engineering & Development',
      videos: 'Videos',
      fotos: 'Photos',
      chat: 'Chat',
      empleo: 'Work',
      instalarTitulo: 'Install PortaLink',
      instalarDescIOS: 'Add this application to your home screen to quickly access my portfolio and networks.',
      instalarDescOther: 'Install the application for a faster experience without distractions.',
      instalarBtn: 'Install Now',
      instalarIos1: 'Press the <b>Share</b> button in Safari.',
      instalarIos2: 'Select <b>"Add to Home Screen"</b>.',
      entendido: 'Got it',
      ahoraNo: 'Not now'
    }
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkPWAStatus();
      
      // Solo capturar el evento si NO estamos ya en modo instalada
      window.addEventListener('beforeinstallprompt', (e) => {
        if (!this.isStandalone && !localStorage.getItem('pwa_dismissed')) {
          e.preventDefault();
          this.deferredPrompt = e;
          this.showInstallModal = true;
        }
      });

      this.currentLanguage = localStorage.getItem('portfolio-language') || 'es';
      window.addEventListener('portfolio-language-change', this.onLanguageChange);
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('portfolio-language-change', this.onLanguageChange);
    }
  }

  onLanguageChange = (event: any) => {
    this.currentLanguage = event.detail.language;
  };

  getTranslation() {
    return this.translations[this.currentLanguage] || this.translations['es'];
  }

  checkPWAStatus() {
    // Detectar iOS
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    // Detectar si ya está instalada (Android o iOS)
    this.isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (navigator as any).standalone === true;
    
    // Si ya está instalada, nos aseguramos de que el modal esté cerrado
    if (this.isStandalone) {
      this.showInstallModal = false;
      return;
    }
    
    // Mostrar modal en iOS después de un delay si no está instalada y no fue descartada
    if (this.isIOS && !this.isStandalone && !localStorage.getItem('pwa_dismissed')) {
      setTimeout(() => {
        if (!this.isStandalone) this.showInstallModal = true;
      }, 4000);
    }
  }

  installPWA() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          this.showInstallModal = false;
        }
        this.deferredPrompt = null;
      });
    }
  }

  closeModal() {
    this.showInstallModal = false;
    // Guardamos en localStorage que el usuario lo descartó para no molestar más
    localStorage.setItem('pwa_dismissed', 'true');
  }
}
