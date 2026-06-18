import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AiChatFloatingComponent } from '../../components/ai-chat-floating/ai-chat-floating.component';

declare var AOS: any;

@Component({
    selector: 'app-linktree',
    standalone: true,
    imports: [CommonModule, RouterModule, AiChatFloatingComponent],
    template: `
    <div class="lt-wrapper">
      <app-ai-chat-floating></app-ai-chat-floating>
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
                <div class="h-px w-10 lt-line-accent"></div>
                <span class="lt-label-accent text-[10px] uppercase tracking-[0.4em] font-bold">Santiago Arbeláez</span>
              </div>
              <h1 class="text-3xl md:text-7xl font-headline uppercase leading-[0.9] tracking-tighter">
                <span class="lt-title-main">Creador<br/>Digital</span><br/>
                <span class="lt-title-accent">& Desarrollador</span>
              </h1>
            </header>

            <div class="lt-links-container" data-aos="fade-up">

              <!-- TikTok -->
              <a href="https://www.tiktok.com/@santiagoarbelaezc" target="_blank" class="lt-card-social group lt-item-tiktok">
                <div class="flex justify-between w-full mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-white/40 group-hover:text-white transition-colors">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                  </svg>
                  <span class="text-white/20 group-hover:text-white transition-colors">↗</span>
                </div>
                <div>
                  <h4 class="text-base md:text-xl font-headline uppercase text-white/50 group-hover:text-white transition-colors">TikTok</h4>
                  <span class="text-[8px] uppercase tracking-[0.2em] text-white/30 group-hover:text-white transition-colors mt-1 block">Videos</span>
                </div>
              </a>

              <!-- Instagram -->
              <a href="https://www.instagram.com/santiagoarbelaezc/" target="_blank" class="lt-card-social group lt-item-insta">
                <div class="flex justify-between w-full mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-white/40 group-hover:text-white transition-colors">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                  <span class="text-white/20 group-hover:text-white transition-colors">↗</span>
                </div>
                <div>
                  <h4 class="text-base md:text-xl font-headline uppercase text-white/50 group-hover:text-white transition-colors">Instagram</h4>
                  <span class="text-[8px] uppercase tracking-[0.2em] text-white/30 group-hover:text-white transition-colors mt-1 block">Photos</span>
                </div>
              </a>

              <!-- Portafolio Main CTA -->
              <a routerLink="/portfolio" class="lt-card-main group lt-item-portfolio">
                <div class="flex items-center gap-6">
                  <div class="lt-icon-wrapper">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-white/80 group-hover:text-white transition-colors">
                      <rect x="2" y="7" width="20" height="14" rx="0" ry="0"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                  </div>
                  <div class="lt-card-body">
                    <h3 class="text-2xl md:text-3xl font-headline uppercase text-white">Proyectos</h3>
                    <p class="text-[8px] uppercase tracking-[0.3em] text-white/50 mt-1">Ingeniería & Desarrollo</p>
                  </div>
                </div>
                <div class="lt-action-line hidden md:flex">
                  <div class="w-10 h-px bg-white/30 group-hover:w-20 group-hover:bg-white transition-all duration-700"></div>
                  <span class="text-white/30 group-hover:text-white transition-colors text-xl">↗</span>
                </div>
                <span class="md:hidden text-white/30 group-hover:text-white transition-colors">↗</span>
              </a>

              <!-- WhatsApp -->
              <a href="https://wa.me/573000000000" target="_blank" class="lt-card-social group lt-item-wa">
                <div class="flex justify-between w-full mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-white/40 group-hover:text-white transition-colors">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                  <span class="text-white/20 group-hover:text-white transition-colors">↗</span>
                </div>
                <div>
                  <h4 class="text-base md:text-xl font-headline uppercase text-white/50 group-hover:text-white transition-colors">WhatsApp</h4>
                  <span class="text-[8px] uppercase tracking-[0.2em] text-white/30 group-hover:text-white transition-colors mt-1 block">Chat</span>
                </div>
              </a>

              <!-- LinkedIn -->
              <a href="https://www.linkedin.com/in/santiago-arbelaez-contreras-9830b5290/" target="_blank" class="lt-card-social group lt-item-linkedin">
                <div class="flex justify-between w-full mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-white/40 group-hover:text-white transition-colors">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                  <span class="text-white/20 group-hover:text-white transition-colors">↗</span>
                </div>
                <div>
                  <h4 class="text-base md:text-xl font-headline uppercase text-white/50 group-hover:text-white transition-colors">LinkedIn</h4>
                  <span class="text-[8px] uppercase tracking-[0.2em] text-white/30 group-hover:text-white transition-colors mt-1 block">Work</span>
                </div>
              </a>

            </div>
          </section>

        </main>

        <footer class="lt-footer" data-aos="fade-in">
           <p class="lt-copy tracking-[0.3em] uppercase">© {{ currentYear }} S.A. PORTFOLIO — Digital Architecture</p>
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
        
        <h2 class="text-2xl font-headline uppercase text-white text-center mb-2">Instalar PortaLink</h2>
        <p class="text-white/60 text-center text-sm mb-8 leading-relaxed">
          {{ isIOS ? 'Añade esta aplicación a tu pantalla de inicio para acceder rápidamente a mi portafolio y redes.' : 'Instala la aplicación para una experiencia más rápida y sin distracciones.' }}
        </p>

        <!-- Android Button -->
        <button *ngIf="!isIOS" (click)="installPWA()" class="w-full bg-white text-black py-4 font-bold uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors mb-4 border border-white">
          Instalar Ahora
        </button>

        <!-- iOS Instructions -->
        <div *ngIf="isIOS" class="space-y-4">
          <div class="flex items-center gap-4 bg-white/5 p-4 border border-white/20">
            <div class="w-8 h-8 bg-white/10 flex items-center justify-center text-white text-[10px] font-bold">1</div>
            <p class="text-white/80 text-[11px]">Pulsa el botón <b>Compartir</b> en Safari.</p>
          </div>
          <div class="flex items-center gap-4 bg-white/5 p-4 border border-white/20">
            <div class="w-8 h-8 bg-white/10 flex items-center justify-center text-white text-[10px] font-bold">2</div>
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
      --accent-main: #FFFFFF;
      --accent-secondary: #AAAAAA;
      --bg-dark: #000000;
      --card-bg: rgba(255, 255, 255, 0.02);
      --card-border: rgba(255, 255, 255, 0.2);
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
      position: relative;
    }

    /* Elegant Grid Background with Mask */
    .lt-wrapper::before {
      content: '';
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background-image: 
        linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
      background-size: 40px 40px;
      background-position: center center;
      mask-image: radial-gradient(ellipse at 50% 50%, black 10%, transparent 80%);
      -webkit-mask-image: radial-gradient(ellipse at 50% 50%, black 10%, transparent 80%);
      z-index: 0;
      pointer-events: none;
    }

    /* Vertical architectural line */
    .lt-wrapper::after {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 1px;
      height: 100%;
      background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.05) 15%, rgba(255, 255, 255, 0.05) 85%, transparent);
      z-index: 0;
      pointer-events: none;
    }

    .lt-container {
      width: 100%;
      max-width: 1200px;
      position: relative;
      z-index: 1;
    }

    .lt-main-grid {
      display: grid;
      grid-template-columns: 1fr 1.4fr;
      gap: 80px;
      align-items: flex-start;
    }

    /* TITLE ACCENT CLASSES */
    .lt-title-main {
      color: #ffffff;
    }
    .lt-title-accent {
      color: var(--accent-secondary);
    }
    .lt-label-accent {
      color: var(--accent-secondary);
    }
    .lt-line-accent {
      background: var(--accent-main);
      height: 1px;
      width: 60px;
    }

    .lt-image-container {
      overflow: hidden;
      aspect-ratio: 4/5.5;
      border: 1px solid var(--card-border);
      background: #050505;
      position: relative;
    }
    /* Architectural corner markers for image */
    .lt-image-container::before, .lt-image-container::after {
      content: '';
      position: absolute;
      width: 15px;
      height: 15px;
      border: 1px solid #fff;
      z-index: 2;
      transition: var(--transition);
    }
    .lt-image-container::before {
      top: 10px; left: 10px;
      border-right: none; border-bottom: none;
    }
    .lt-image-container::after {
      bottom: 10px; right: 10px;
      border-left: none; border-top: none;
    }
    .lt-portrait-wrapper:hover .lt-image-container::before {
      top: 5px; left: 5px;
    }
    .lt-portrait-wrapper:hover .lt-image-container::after {
      bottom: 5px; right: 5px;
    }

    .lt-main-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: grayscale(100%) brightness(0.6) contrast(1.2);
      transition: var(--transition);
    }
    .lt-portrait-wrapper:hover .lt-main-img {
      filter: grayscale(100%) brightness(0.9) contrast(1.1);
      transform: scale(1.02);
    }

    /* CARDS */
    .lt-links-container { 
      margin-top: 60px; 
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .lt-item-portfolio { grid-column: span 2; order: 1; }
    .lt-item-tiktok { grid-column: span 1; order: 2; }
    .lt-item-insta { grid-column: span 1; order: 3; }
    .lt-item-wa { grid-column: span 1; order: 4; }
    .lt-item-linkedin { grid-column: span 1; order: 5; }

    .lt-card-main {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 25px 40px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--card-border);
      text-decoration: none;
      transition: var(--transition);
      position: relative;
    }
    .lt-card-main::before {
      content: '';
      position: absolute;
      top: 0; left: 0; width: 0%; height: 100%;
      background: rgba(255, 255, 255, 0.05);
      transition: var(--transition);
      z-index: 0;
    }
    .lt-card-main:hover::before {
      width: 100%;
    }
    .lt-card-main > * {
      position: relative;
      z-index: 1;
    }
    .lt-card-main:hover {
      border-color: var(--accent-main);
    }

    .lt-card-social {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: space-between;
      padding: 20px 24px;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      text-decoration: none;
      transition: var(--transition);
      position: relative;
    }
    .lt-card-social::after {
      content: '+';
      position: absolute;
      bottom: 8px; right: 12px;
      color: rgba(255,255,255,0.1);
      font-size: 14px;
      font-weight: 300;
      transition: var(--transition);
    }
    .lt-card-social:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: var(--accent-main);
    }
    .lt-card-social:hover::after {
      color: var(--accent-main);
    }

    .lt-action-line {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    /* FOOTER */
    .lt-footer { 
      margin-top: 80px; 
      border-top: 1px solid rgba(255,255,255,0.1); 
      padding-top: 30px; 
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .lt-copy { font-size: 9px; color: rgba(255,255,255,0.4); letter-spacing: 0.2em; }

    @media (max-width: 768px) {
      .lt-wrapper { padding: 40px 20px; height: auto; overflow: visible; }
      .lt-main-grid { grid-template-columns: 1fr; gap: 40px; }
      .lt-image-container { max-width: 220px; margin: 0 auto; }
      .lt-main-img { filter: grayscale(100%) brightness(0.9); } 
      
      .lt-info-header { text-align: center; }
      .lt-info-header .flex { justify-content: center; }
      
      .lt-links-container {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-top: 40px;
      }

      /* Mobile Order: 2 links, 1 link, 2 links */
      .lt-item-tiktok { order: 1; grid-column: span 1; }
      .lt-item-insta { order: 2; grid-column: span 1; }
      .lt-item-portfolio { order: 3; grid-column: span 2; }
      .lt-item-wa { order: 4; grid-column: span 1; }
      .lt-item-linkedin { order: 5; grid-column: span 1; }
      
      .lt-card-social { 
        padding: 16px 20px; 
        background: rgba(255, 255, 255, 0.03);
      }
      .lt-card-social:active {
        background: rgba(255,255,255,0.08);
      }
      .lt-card-social h4 { color: white; opacity: 0.9; }
      .lt-card-social span { opacity: 0.6; }
      
      .lt-card-main { padding: 20px; }

      .lt-footer { justify-content: center; text-align: center; margin-top: 60px; }
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
