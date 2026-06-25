import { Component, OnInit, OnDestroy, AfterViewInit, Inject, PLATFORM_ID, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PortfolioConfigService } from '../../services/portfolio-config.service';
import { AnalyticsService } from '../../services/analytics.service';
import * as AOS from 'aos';

// Dynamic Components
import { DynHeroComponent } from '../../components/components-dynamics/dyn-hero.component';
import { DynAboutComponent } from '../../components/components-dynamics/dyn-about.component';
import { DynPortfolioComponent } from '../../components/components-dynamics/dyn-portfolio.component';
import { DynTextComponent } from '../../components/components-dynamics/dyn-text.component';
import { DynLinktreeComponent } from '../../components/components-dynamics/dyn-linktree.component';

@Component({
    selector: 'app-link',
    standalone: true,
    imports: [
      CommonModule, 
      RouterModule,
      DynHeroComponent,
      DynAboutComponent,
      DynPortfolioComponent,
      DynTextComponent,
      DynLinktreeComponent
    ],
    template: `
    <div class="lt-wrapper">
      <div class="lt-container">
        
        <main class="lt-main-grid min-h-screen items-center py-20 w-full flex flex-col">
          
          <ng-container *ngIf="portfolioData()?.pages?.links?.sections">
            <ng-container *ngFor="let sec of portfolioData().pages.links.sections">
              <ng-container *ngIf="sec.active" [ngSwitch]="sec.type">
                <app-dyn-hero *ngSwitchCase="'hero'" [config]="sec.config" class="w-full"></app-dyn-hero>
                <app-dyn-about *ngSwitchCase="'about'" [config]="sec.config" class="w-full"></app-dyn-about>
                <app-dyn-portfolio *ngSwitchCase="'portfolio'" [config]="sec.config" class="w-full"></app-dyn-portfolio>
                <app-dyn-text *ngSwitchCase="'text'" [config]="sec.config" class="w-full"></app-dyn-text>
                <app-dyn-linktree *ngSwitchCase="'linktree'" [config]="sec.config" class="w-full"></app-dyn-linktree>
              </ng-container>
            </ng-container>
          </ng-container>

          <div *ngIf="!portfolioData()?.pages?.links?.sections?.length" class="text-white text-center text-xl">
            No hay secciones configuradas en esta página.
          </div>

        </main>

        <!-- Premium Footer -->
        <footer class="lt-footer">
          <div class="lt-footer-logo-wrapper">
            <img [src]="getProfileLogo()" alt="Santiago Arbelaez Logo" class="lt-footer-logo" />
          </div>
          
          <div class="lt-footer-contact">
            <a href="tel:+573054078225" class="lt-footer-link">
              <svg class="lt-footer-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>+57 3054078225</span>
            </a>
            <span class="lt-footer-sep">|</span>
            <a href="mailto:arbelaezz.c11@gmail.com" class="lt-footer-link">
              <svg class="lt-footer-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <span>arbelaezz.c11@gmail.com</span>
            </a>
          </div>

          <div class="lt-footer-socials">
            <a href="https://www.instagram.com/santiarbelaezz/" target="_blank" class="lt-footer-social-link">
              Instagram
            </a>
            <span class="lt-footer-dot">•</span>
            <a href="https://www.tiktok.com/@santiarbelaezz" target="_blank" class="lt-footer-social-link">
              TikTok
            </a>
          </div>

          <div class="lt-footer-copy">
            © {{ currentYear }} SANTIAGO ARBELAEZ. ALL RIGHTS RESERVED.
          </div>
        </footer>
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
export class LinkComponent implements OnInit, OnDestroy, AfterViewInit {
  currentYear = new Date().getFullYear();
  deferredPrompt: any;
  showInstallModal = false;
  isIOS = false;
  isStandalone = false;
  currentLanguage = 'es';
  currentTheme = 'dark';

  modelingImages = [
    { src: 'assets/images/model_1.png', alt: 'Editorial Portrait I' },
    { src: 'assets/images/model_2.png', alt: 'Editorial Portrait II' },
    { src: 'assets/images/model_3.png', alt: 'Editorial Portrait III' }
  ];

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
      retratos: 'EDITORIAL / BOOK',
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
      retratos: 'EDITORIAL / PORTRAITS',
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

  private configService = inject(PortfolioConfigService);
  private analyticsService = inject(AnalyticsService);

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

      this.currentTheme = localStorage.getItem('portfolio-theme') || 'dark';
      window.addEventListener('portfolio-theme-change', this.onThemeChange);

      // Track Linktree view
      this.analyticsService.incrementMetric('linktreeViews');
    }
  }

  getLinks() {
    return this.configService.data()?.links?.items || [];
  }

  getProfileAvatar() {
    return this.configService.data()?.links?.avatarImage || 'about-portrait.png';
  }

  getProfileLogo() {
    const configLogo = this.configService.data()?.links?.profileLogo;
    if (configLogo) return configLogo;
    return this.currentTheme === 'dark' ? 'assets/icons/mi-logo-dark.png' : 'assets/icons/mi-logo-light.png';
  }

  getProfileTitle() {
    return this.configService.data()?.links?.profileTitle || 'Digital Creator & Developer';
  }

  getFormattedProfileName() {
    const name = this.configService.data()?.links?.profileName || 'Santiago Arbeláez';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0]}<br/>${parts.slice(1).join(' ')}`;
    }
    return name;
  }

  trackLinkClick(id: string) {
    this.analyticsService.incrementLinkClick(id);
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Initialize AOS (Animate on Scroll)
      setTimeout(() => {
        AOS.init({
          duration: 1000,
          easing: 'ease-out-cubic',
          once: false,
          mirror: true
        });
      }, 50);
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

  onThemeChange = (event: any) => {
    this.currentTheme = event.detail.theme;
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
