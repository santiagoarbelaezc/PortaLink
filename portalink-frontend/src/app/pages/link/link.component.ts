import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AiChatFloatingComponent } from '../../components/ai-chat-floating/ai-chat-floating.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
    selector: 'app-link',
    standalone: true,
    imports: [CommonModule, RouterModule, AiChatFloatingComponent, NavbarComponent],
    template: `
    <div class="lt-wrapper">
      <app-navbar></app-navbar>
      <app-ai-chat-floating></app-ai-chat-floating>
      <div class="lt-container">
        
        <main class="lt-main-grid">
          
          <!-- COLUMN 1: PORTRAIT -->
          <aside class="lt-col-photo">
            <div class="lt-portrait-wrapper">
              <div class="lt-image-container">
                <img src="about-portrait.png" alt="Santiago Arbelaez" class="lt-main-img" />
              </div>
            </div>
          </aside>

          <!-- COLUMN 2: INFO & LINKS -->
          <section class="lt-col-info">
            <header class="lt-info-header">
              <div class="flex items-center gap-4 mb-4">
                <div class="h-px w-10 lt-line-accent"></div>
                <span class="lt-label-accent text-[10px] uppercase tracking-[0.4em] font-bold">Santiago Arbeláez</span>
              </div>
              <h1 class="text-3xl md:text-7xl font-headline uppercase leading-[0.9] tracking-tighter">
                <span class="lt-title-main">Creador<br/>Digital</span><br/>
                <span class="lt-title-accent">& Desarrollador</span>
              </h1>
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
                    <h3 class="text-2xl md:text-3xl font-headline uppercase text-white">Descubre más</h3>
                    <p class="text-[8px] uppercase tracking-[0.3em] text-white/50 mt-1">Ingeniería & Desarrollo</p>
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
      </div>

      <footer class="lt-footer">
         <p class="lt-copy tracking-[0.3em] uppercase">© {{ currentYear }} S.A. PORTFOLIO — Digital Architecture</p>
      </footer>

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
    styleUrls: ['./link.component.css']
})
export class LinkComponent implements OnInit {
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
