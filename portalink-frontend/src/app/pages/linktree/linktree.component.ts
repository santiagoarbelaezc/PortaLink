import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MagneticDirective } from '../../shared/directives/magnetic.directive';

declare var AOS: any;

@Component({
    selector: 'app-linktree',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="lt-wrapper">
      <div class="lt-container">
        
        <main class="lt-main-grid">
          
          <!-- COLUMN 1: PORTRAIT -->
          <aside class="lt-col-photo" data-aos="fade-right">
            <div class="lt-portrait-wrapper">
              <div class="lt-image-container">
                <img src="about-portrait.png" alt="Santiago Arbelaez" class="lt-main-img" />
              </div>
            </div>
          </aside>

          <!-- COLUMN 2: INFO & LINKS -->
          <section class="lt-col-info">
            <header class="lt-info-header" data-aos="fade-down">
              <div class="flex items-center gap-4 mb-4">
                <div class="h-px w-10 bg-accent-cyan"></div>
                <span class="text-accent-cyan text-[10px] uppercase tracking-[0.4em] font-bold">Santiago Arbeláez</span>
              </div>
              <h1 class="text-5xl md:text-7xl font-headline uppercase leading-[0.9] tracking-tighter text-white">
                Creador<br/>Digital<br/>
                <span class="text-accent-cyan">& Desarrollador</span>
              </h1>
            </header>

            <div class="lt-links-container" data-aos="fade-up">
              <!-- Main CTA -->
              <a routerLink="/portfolio" class="lt-card-main group mb-6">
                <div class="flex items-center gap-6">
                  <div class="lt-icon-wrapper">
                    <!-- Icono Profesional Vectorial de Portafolio -->
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-white/80 group-hover:text-white transition-colors">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                  </div>
                  <div class="lt-card-body">
                    <h3 class="text-3xl font-headline uppercase text-white">Portafolio</h3>
                    <p class="text-[8px] uppercase tracking-[0.3em] text-white/40 mt-1">Ingeniería & Proyectos</p>
                  </div>
                </div>
                <div class="lt-action-line">
                  <div class="w-10 h-px bg-white/20 group-hover:w-20 group-hover:bg-white transition-all duration-700"></div>
                  <span class="text-white/20 group-hover:text-white transition-colors text-xl">↗</span>
                </div>
              </a>

              <!-- Social Grid -->
              <div class="lt-social-grid">
                <a href="https://www.tiktok.com/@santiagoarbelaezc" target="_blank" class="lt-card-social group">
                  <div class="flex items-center gap-5">
                    <img src="assets/icons/tiktok.png" alt="TikTok" class="lt-social-icon" />
                    <div>
                      <h4 class="text-xl font-headline uppercase text-white/40 group-hover:text-white transition-colors">TikTok</h4>
                      <span class="text-[8px] uppercase tracking-widest text-white/20 group-hover:text-accent-cyan transition-colors mt-1">Videos</span>
                    </div>
                  </div>
                  <span class="text-white/5 group-hover:text-accent-cyan group-hover:translate-x-1 transition-all">↗</span>
                </a>

                <a href="https://www.instagram.com/santiagoarbelaezc/" target="_blank" class="lt-card-social group">
                  <div class="flex items-center gap-5">
                    <img src="assets/icons/instagram.png" alt="Instagram" class="lt-social-icon" />
                    <div>
                      <h4 class="text-xl font-headline uppercase text-white/40 group-hover:text-white transition-colors">Instagram</h4>
                      <span class="text-[8px] uppercase tracking-widest text-white/20 group-hover:text-accent-cyan transition-colors mt-1">Photos</span>
                    </div>
                  </div>
                  <span class="text-white/5 group-hover:text-accent-cyan group-hover:translate-x-1 transition-all">↗</span>
                </a>

                <a href="https://wa.me/573000000000" target="_blank" class="lt-card-social group">
                  <div class="flex items-center gap-5">
                    <img src="assets/icons/whatsapp.png" alt="WhatsApp" class="lt-social-icon" />
                    <div>
                      <h4 class="text-xl font-headline uppercase text-white/40 group-hover:text-white transition-colors">WhatsApp</h4>
                      <span class="text-[8px] uppercase tracking-widest text-white/20 group-hover:text-accent-cyan transition-colors mt-1">Chat</span>
                    </div>
                  </div>
                  <span class="text-white/5 group-hover:text-accent-cyan group-hover:translate-x-1 transition-all">↗</span>
                </a>

                <a href="https://www.linkedin.com/in/santiago-arbelaez-contreras-9830b5290/" target="_blank" class="lt-card-social group">
                  <div class="flex items-center gap-5">
                    <img src="assets/icons/linkedin.png" alt="LinkedIn" class="lt-social-icon" />
                    <div>
                      <h4 class="text-xl font-headline uppercase text-white/40 group-hover:text-white transition-colors">LinkedIn</h4>
                      <span class="text-[8px] uppercase tracking-widest text-white/20 group-hover:text-accent-cyan transition-colors mt-1">Work</span>
                    </div>
                  </div>
                  <span class="text-white/5 group-hover:text-accent-cyan group-hover:translate-x-1 transition-all">↗</span>
                </a>
              </div>
            </div>
          </section>

        </main>

        <footer class="lt-footer" data-aos="fade-in">
           <p class="lt-copy tracking-[0.3em] uppercase">© {{ currentYear }} S.A. PORTFOLIO — Digital Architecture</p>
        </footer>

      </div>
    </div>

    <!-- PWA Install Modal -->
    <div *ngIf="showInstallModal" class="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-6 bg-black/80 backdrop-blur-sm" (click)="closeModal()">
      <div class="bg-[#111] border border-white/10 rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-slide-up" (click)="$event.stopPropagation()">
        <div class="flex justify-center mb-6">
          <div class="w-16 h-16 bg-accent-cyan rounded-2xl flex items-center justify-center shadow-lg shadow-accent-cyan/20">
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </div>
        </div>
        
        <h2 class="text-2xl font-headline uppercase text-white text-center mb-2">Instalar PortaLink</h2>
        <p class="text-white/60 text-center text-sm mb-8 leading-relaxed">
          {{ isIOS ? 'Añade esta aplicación a tu pantalla de inicio para acceder rápidamente a mi portafolio y redes.' : 'Instala la aplicación para una experiencia más rápida y sin distracciones.' }}
        </p>

        <!-- Android Button -->
        <button *ngIf="!isIOS" (click)="installPWA()" class="w-full bg-accent-cyan text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:brightness-110 transition-all mb-4">
          Instalar Ahora
        </button>

        <!-- iOS Instructions -->
        <div *ngIf="isIOS" class="space-y-4">
          <div class="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
            <div class="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white text-[10px] font-bold">1</div>
            <p class="text-white/80 text-[11px]">Pulsa el botón <b>Compartir</b> en Safari.</p>
          </div>
          <div class="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
            <div class="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white text-[10px] font-bold">2</div>
            <p class="text-white/80 text-[11px]">Selecciona <b>"Añadir a la pantalla de inicio"</b>.</p>
          </div>
        </div>

        <button (click)="closeModal()" class="w-full text-white/40 py-2 text-[10px] uppercase tracking-widest hover:text-white transition-colors mt-4">
          {{ isIOS ? 'Entendido' : 'Ahora no' }}
        </button>
      </div>
    </div>
  `,
    styles: [`
    :host {
      --accent-cyan: #8B5E3C;
      --bg-dark: #070707;
      --card-bg: rgba(255,255,255,0.02);
      --transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .lt-wrapper {
      min-height: 100vh;
      background: var(--bg-dark);
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 60px 40px;
      overflow-y: auto;
    }

    .lt-container {
      width: 100%;
      max-width: 1200px;
    }

    .lt-main-grid {
      display: grid;
      grid-template-columns: 1fr 1.4fr;
      gap: 80px;
      align-items: flex-start;
    }

    /* IMAGE */
    .lt-image-container {
      border-radius: 40px;
      overflow: hidden;
      aspect-ratio: 4/5.5;
      border: 1px solid rgba(255,255,255,0.05);
      background: #111;
    }
    .lt-main-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: grayscale(100%) brightness(0.6);
      transition: var(--transition);
    }
    .lt-portrait-wrapper:hover .lt-main-img {
      filter: grayscale(0%) brightness(0.9);
      transform: scale(1.03);
    }

    /* CARDS */
    .lt-links-container { margin-top: 60px; }

    .lt-card-main {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 25px 40px;
      background: var(--accent-cyan);
      border-radius: 24px;
      text-decoration: none;
      transition: var(--transition);
    }
    .lt-card-main:hover {
      transform: translateY(-5px);
      filter: brightness(1.1);
      box-shadow: 0 20px 40px rgba(139, 94, 60, 0.15);
    }

    .lt-btn-icon {
      width: 45px;
      height: 45px;
      object-fit: contain;
      opacity: 0.8;
    }

    .lt-social-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .lt-card-social {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 30px;
      background: var(--card-bg);
      border-radius: 20px;
      text-decoration: none;
      border: 1px solid rgba(255,255,255,0.03);
      transition: var(--transition);
    }
    .lt-card-social:hover {
      background: rgba(255,255,255,0.05);
      border-color: var(--accent-cyan);
      transform: translateY(-4px);
    }

    .lt-social-icon {
      width: 32px;
      height: 32px;
      object-fit: contain;
      filter: grayscale(100%) invert(1);
      opacity: 0.2;
      transition: var(--transition);
    }
    .lt-card-social:hover .lt-social-icon {
      filter: grayscale(0%) invert(0);
      opacity: 1;
      transform: scale(1.1);
    }

    .lt-action-line {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    /* FOOTER */
    .lt-footer { margin-top: 80px; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 30px; }
    .lt-copy { font-size: 8px; color: rgba(255,255,255,0.1); }

    @media (max-width: 768px) {
      .lt-wrapper { padding: 40px 20px; height: auto; overflow: visible; }
      .lt-main-grid { grid-template-columns: 1fr; gap: 40px; }
      .lt-image-container { max-width: 280px; margin: 0 auto; }
      .lt-main-img { filter: grayscale(0%) brightness(1); } /* Brillo total en móvil */
      
      .lt-info-header { text-align: center; }
      .lt-info-header .flex { justify-content: center; }
      
      .lt-social-grid { grid-template-columns: 1fr; gap: 12px; }
      
      /* Botones vibrantes en móvil */
      .lt-card-social { 
        padding: 20px 25px; 
        background: rgba(255,255,255,0.04); 
        border-color: rgba(255,255,255,0.08);
      }
      .lt-card-social:active {
        background: rgba(255,255,255,0.08);
        transform: scale(0.98);
      }
      .lt-card-social h4 { color: white; opacity: 0.9; }
      .lt-card-social span { opacity: 0.6; }
      
      .lt-social-icon { 
        filter: grayscale(0%) invert(0); 
        opacity: 0.9; 
        transform: scale(1);
      }
      
      .lt-card-main { padding: 25px; }
      .lt-card-main:active { transform: scale(0.98); }

      .lt-footer { text-align: center; margin-top: 60px; }
    }

    @keyframes slide-up {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .animate-slide-up {
      animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
  `]
})
export class LinktreeComponent implements OnInit {
  currentYear = new Date().getFullYear();
  deferredPrompt: any;
  showInstallModal = false;
  isIOS = false;
  isStandalone = false;

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

      if (typeof AOS !== 'undefined') {
        setTimeout(() => {
          AOS.init({
            duration: 1000,
            once: true,
            mirror: true
          });
          AOS.refresh();
        }, 100);
      }
    }
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
