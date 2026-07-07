import { Component, OnInit, OnDestroy, AfterViewInit, Inject, PLATFORM_ID, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PortfolioConfigService } from '../../services/portfolio-config.service';
import { AnalyticsService } from '../../services/analytics.service';
import * as AOS from 'aos';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
@Component({
    selector: 'app-link',
    standalone: true,
    imports: [
      CommonModule, 
      RouterModule
    ],
    template: `
    <div class="lt-wrapper">
      <!-- SKELETON LOADER FOR LINKS -->
      <ng-container *ngIf="isLoading">
        <div class="lt-container">
          <main class="lt-main-grid animate-pulse w-full pt-16 md:pt-20 pb-20">
            <!-- COLUMN 1: PORTRAIT SKELETON -->
            <aside class="lt-col-photo flex items-center justify-center relative w-full h-[500px] md:h-[80vh] overflow-hidden" style="background-color: rgba(255,255,255,0.02); border-radius: 30px; border: 1px solid rgba(255,255,255,0.05);">
               <div class="w-32 h-32 rounded-full opacity-10" style="background-color: var(--text-primary, #fff);"></div>
            </aside>
            <!-- COLUMN 2: INFO & LINKS SKELETON -->
            <section class="lt-col-info flex flex-col justify-center">
              <header class="lt-info-header mb-12">
                <div class="h-16 w-3/4 rounded-xl opacity-20 mb-4" style="background-color: var(--text-primary, #fff);"></div>
                <div class="h-16 w-1/2 rounded-xl opacity-20" style="background-color: var(--text-primary, #fff);"></div>
                <div class="h-3 w-40 rounded-full opacity-10 mt-8" style="background-color: var(--text-primary, #fff);"></div>
              </header>

              <div class="lt-links-container flex flex-col gap-4">
                <div class="h-28 w-full rounded-2xl opacity-10" style="background-color: var(--text-primary, #fff);"></div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <div *ngFor="let _ of [1,2,3,4]" class="h-32 w-full rounded-2xl opacity-10" style="background-color: var(--text-primary, #fff);"></div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </ng-container>

      <div class="lt-container animate-fade-in" *ngIf="!isLoading">
        
        <main class="lt-main-grid">
          
          <!-- COLUMN 1: PORTRAIT -->
          <aside class="lt-col-photo">
            <div class="lt-portrait-wrapper">
              <div class="lt-image-container">
                <img [src]="getProfileAvatar()" alt="Profile Avatar" class="lt-main-img" />
                <div class="lt-corner-tr"></div>
                <div class="lt-corner-bl"></div>
                <div class="lt-profile-overlay">
                  <img [src]="getProfileLogo()" alt="Profile Logo" class="lt-profile-logo" />
                </div>
              </div>
            </div>
          </aside>

          <!-- COLUMN 2: INFO & LINKS -->
          <section class="lt-col-info">
            <header class="lt-info-header">
              <h1 class="text-5xl md:text-[80px] font-headline uppercase leading-[0.9] tracking-[0.1em]" style="color: var(--text-primary);" [innerHTML]="getFormattedProfileName()">
              </h1>
              <p class="text-[10px] md:text-xs uppercase tracking-[0.4em] mt-3 md:mt-4 opacity-60 font-headline" style="color: var(--text-secondary);">
                {{ getProfileTitle() }}
              </p>

              <!-- Desktop-only bio description to fill vertical gap -->
              <div class="hidden md:block mt-8 max-w-lg border-l-2 pl-6 py-2" style="border-color: var(--accent-main); background: linear-gradient(90deg, rgba(255,255,255,0.03) 0%, transparent 100%);">
                <p class="text-xs md:text-sm leading-relaxed font-light opacity-80" style="color: var(--text-secondary);">
                  {{ getTranslation().bioDesc }}
                </p>
                <div class="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
                  <span class="text-[9px] uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-white/5 border border-white/10 opacity-70" style="color: var(--text-primary);">Full-Stack Engineering</span>
                  <span class="text-[9px] uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-white/5 border border-white/10 opacity-70" style="color: var(--text-primary);">Creative UX / UI</span>
                </div>
              </div>
            </header>

            <div class="lt-links-container">

              <!-- Portafolio Main CTA -->
              <a routerLink="/proyectos" (click)="trackLinkClick('proyectos')" class="lt-card-main group lt-item-portfolio">
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

              <!-- Dynamic Links from Config Service -->
              <a *ngFor="let link of getLinks()" [href]="link.url" target="_blank" (click)="trackLinkClick(link.id)"
                 class="lt-card-social group" [ngClass]="'lt-item-' + link.icon">
                <div class="flex justify-between w-full mb-2">
                  <svg *ngIf="link.icon === 'tiktok'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-white/40 group-hover:text-white transition-colors">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                  </svg>
                  <svg *ngIf="link.icon === 'instagram'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-white/40 group-hover:text-white transition-colors">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                  <svg *ngIf="link.icon === 'whatsapp'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-white/40 group-hover:text-white transition-colors">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                  <svg *ngIf="link.icon === 'linkedin'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-white/40 group-hover:text-white transition-colors">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                  <svg *ngIf="link.icon !== 'tiktok' && link.icon !== 'instagram' && link.icon !== 'whatsapp' && link.icon !== 'linkedin'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-white/40 group-hover:text-white transition-colors">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                  <span class="text-white/20 group-hover:text-white transition-colors">↗</span>
                </div>
                <div class="w-full h-px bg-white/10 group-hover:bg-white/20 transition-colors my-3"></div>
                <div>
                  <h4 class="text-base md:text-xl font-headline uppercase text-white/50 group-hover:text-white transition-colors">{{ link.title }}</h4>
                  <span class="text-[8px] uppercase tracking-[0.2em] text-white/30 group-hover:text-white transition-colors mt-1 block">{{ link.subtitle }}</span>
                </div>
              </a>

            </div>

            <!-- Mobile Modeling Book Gallery -->
            <div class="block md:hidden mt-14 lt-gallery-section">
              <div class="flex items-center justify-between mb-6 px-1">
                <h3 class="text-sm font-headline uppercase tracking-[0.25em]" style="color: var(--text-primary);">{{ getTranslation().retratos }}</h3>
                <span class="text-[9px] uppercase tracking-[0.1em]" style="color: var(--text-secondary);">{{ modelingImages.length }} Photos</span>
              </div>
              <div class="space-y-6">
                <div *ngFor="let img of modelingImages; let i = index" 
                     data-aos="fade-up"
                     [attr.data-aos-delay]="i * 150"
                     class="lt-reveal-item overflow-hidden relative border aspect-[3/4]" 
                     style="border-color: var(--card-border);">
                  <img [src]="img.src" [alt]="img.alt" class="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700" />
                  <div class="absolute inset-0 bg-gradient-to-t from-[#000000]/70 via-transparent to-transparent flex items-end p-4">
                    <span class="text-[9px] font-headline uppercase tracking-[0.3em] text-white/50">{{ img.alt }}</span>
                  </div>
                </div>
              </div>
            </div>

          </section>

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
    <div *ngIf="showInstallModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/85 backdrop-blur-md animate-fade-in" (click)="closeModal(); $event.stopPropagation()">
      <div class="bg-neutral-950/90 border border-white/10 rounded-3xl w-full max-w-sm p-8 shadow-[0_0_50px_rgba(0,180,216,0.15)] animate-slide-up relative overflow-hidden backdrop-blur-xl" (click)="$event.stopPropagation()">
        
        <!-- Ambient radial glow -->
        <div class="absolute -top-12 -left-12 w-48 h-48 bg-[#00b4d8]/10 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Header -->
        <div class="flex items-center justify-between mb-4 relative z-10">
          <span class="text-[10px] font-bold text-[#00b4d8] uppercase tracking-[0.2em]">{{ getTranslation().instalarTitulo }}</span>
          <button type="button" (click)="closeModal(); $event.stopPropagation()" class="text-white/40 hover:text-white transition-colors cursor-pointer p-1">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Carousel Step Content -->
        <div class="min-h-[190px] flex flex-col items-center text-center justify-center py-2 relative z-10">
          <!-- Step Icon container -->
          <div class="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 shadow-inner" 
               [innerHTML]="installSteps[currentInstallStep]?.icon">
          </div>
          
          <h3 class="text-base font-headline uppercase text-white tracking-wide mb-2">
            {{ installSteps[currentInstallStep]?.title }}
          </h3>
          <p class="text-white/60 text-[11px] leading-relaxed px-2" 
             [innerHTML]="installSteps[currentInstallStep]?.desc">
          </p>
        </div>

        <!-- Dots Indicator -->
        <div class="flex justify-center gap-2 mt-4 relative z-10">
          <span *ngFor="let step of installSteps; let idx = index" 
                (click)="currentInstallStep = idx; $event.stopPropagation()"
                class="h-1 rounded-full cursor-pointer transition-all duration-300"
                [ngClass]="currentInstallStep === idx ? 'bg-[#00b4d8] w-5' : 'bg-white/20 hover:bg-white/40 w-1.5'">
          </span>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-between mt-6 border-t border-white/5 pt-4 relative z-10">
          <button type="button" (click)="currentInstallStep === 0 ? closeModal() : prevStep(); $event.stopPropagation()" 
                  class="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white/40 hover:text-white cursor-pointer transition-all">
            {{ currentInstallStep === 0 ? (currentLanguage === 'es' ? 'Cerrar' : 'Close') : (currentLanguage === 'es' ? 'Atrás' : 'Back') }}
          </button>
          
          <button type="button" *ngIf="currentInstallStep < installSteps.length - 1"
                  (click)="nextStep(); $event.stopPropagation()" 
                  class="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 cursor-pointer transition-all shadow-md">
            {{ currentLanguage === 'es' ? 'Siguiente' : 'Next' }}
          </button>
          
          <button type="button" *ngIf="currentInstallStep === installSteps.length - 1 && !isIOS"
                  (click)="installPWA(); $event.stopPropagation()" 
                  class="px-5 py-2.5 rounded-xl bg-[#00b4d8] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#0077b6] cursor-pointer transition-all shadow-md">
            {{ getTranslation().instalarBtn }}
          </button>
          
          <button type="button" *ngIf="currentInstallStep === installSteps.length - 1 && isIOS"
                  (click)="closeModal(); $event.stopPropagation()" 
                  class="px-5 py-2.5 rounded-xl bg-[#00b4d8] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#0077b6] cursor-pointer transition-all shadow-md">
            {{ getTranslation().entendido }}
          </button>
        </div>

      </div>
    </div>
  `,
    styleUrls: ['./link.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class LinkComponent implements OnInit, OnDestroy, AfterViewInit {
  isLoading = true;
  currentYear = new Date().getFullYear();
  deferredPrompt: any;
  showInstallModal = false;
  isIOS = false;
  isStandalone = false;
  currentLanguage = 'es';
  currentTheme = 'dark';

  currentInstallStep = 0;
  private sanitizer = inject(DomSanitizer);
  installSteps: any[] = [];

  initInstallSteps() {
    const isEs = this.currentLanguage === 'es';
    if (this.isIOS) {
      this.installSteps = [
        {
          title: isEs ? 'Paso 1: Abrir Compartir' : 'Step 1: Open Share',
          desc: isEs ? 'Pulsa el botón <b>Compartir</b> (el ícono con una flecha hacia arriba) en la barra inferior de tu navegador Safari.' : 'Press the <b>Share</b> button (arrow pointing up) in the bottom bar of your Safari browser.',
          icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-8 h-8 text-[#00b4d8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>`)
        },
        {
          title: isEs ? 'Paso 2: Añadir a Inicio' : 'Step 2: Add to Home',
          desc: isEs ? 'Desplázate hacia abajo en el menú de opciones de Safari y selecciona <b>Añadir a la pantalla de inicio</b>.' : 'Scroll down the options menu and select <b>Add to Home Screen</b>.',
          icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-8 h-8 text-[#00b4d8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="4" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>`)
        },
        {
          title: isEs ? 'Paso 3: Confirmar' : 'Step 3: Confirm',
          desc: isEs ? 'Haz clic en <b>Añadir</b> en la esquina superior derecha para completar la instalación en tu dispositivo.' : 'Click <b>Add</b> in the top right corner to complete the installation on your device.',
          icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-8 h-8 text-[#00b4d8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`)
        }
      ];
    } else {
      this.installSteps = [
        {
          title: isEs ? 'Paso 1: Abrir Menú' : 'Step 1: Open Menu',
          desc: isEs ? 'Haz clic en el botón de instalar al final de este carrusel, o abre las opciones de tu navegador (los tres puntos verticales).' : 'Click the install button at the end of this carousel, or open your browser options menu (three vertical dots).',
          icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-8 h-8 text-[#00b4d8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>`)
        },
        {
          title: isEs ? 'Paso 2: Seleccionar Instalar' : 'Step 2: Select Install',
          desc: isEs ? 'Presiona en <b>Instalar aplicación</b> o <b>Añadir a la pantalla de inicio</b> dentro del menú desplegado.' : 'Press <b>Install app</b> or <b>Add to Home Screen</b> in the dropdown menu.',
          icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-8 h-8 text-[#00b4d8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="4" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>`)
        },
        {
          title: isEs ? 'Paso 3: Disfrutar' : 'Step 3: Enjoy',
          desc: isEs ? 'Confirma la instalación y disfruta de PortaLink en pantalla completa, acceso directo en tu escritorio y soporte offline.' : 'Confirm the installation and enjoy PortaLink in full screen, desktop shortcut, and offline support.',
          icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-8 h-8 text-[#00b4d8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L11 3z" /></svg>`)
        }
      ];
    }
  }

  prevStep() {
    if (this.currentInstallStep > 0) {
      this.currentInstallStep--;
    }
  }

  nextStep() {
    if (this.currentInstallStep < this.installSteps.length - 1) {
      this.currentInstallStep++;
    }
  }

  modelingImages = [
    { src: 'assets/images/fotos/link-principal.jpg', alt: 'Retrato Principal Link' },
    { src: 'assets/images/fotos/principal.jpg', alt: 'Retrato Principal' },
    { src: 'assets/images/fotos/photo2.jpg', alt: 'Editorial Portrait I' },
    { src: 'assets/images/fotos/photo3.jpeg', alt: 'Editorial Portrait II' },
    { src: 'assets/images/fotos/photo4.jpeg', alt: 'Editorial Portrait III' }
  ];

  translations: any = {
    es: {
      soy: 'Soy ',
      creador: 'Creador',
      digital: 'Digital',
      desarrollador: '& Desarrollador',
      bioDesc: 'Desarrollador y creador digital enfocado en construir experiencias interactivas y escalables. Combinando arquitectura de software robusta, diseño moderno y alto rendimiento para potenciar marcas y negocios en el mundo digital.',
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
      bioDesc: 'Digital creator and developer focused on building scalable, interactive web experiences. Combining robust software architecture, modern aesthetics, and high performance to empower brands and businesses.',
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
  
  portfolioData = this.configService.data;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    setTimeout(() => {
      this.isLoading = false;
    }, 800);
    this.initInstallSteps();
    if (isPlatformBrowser(this.platformId)) {
      this.checkPWAStatus();
      this.initInstallSteps();
      
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
    return this.configService.data()?.links?.avatarImage || 'assets/images/fotos/link-principal.jpg';
  }

  getProfileLogo() {
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
    this.initInstallSteps();
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
