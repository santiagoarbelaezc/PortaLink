import { Component, OnInit, OnDestroy, AfterViewInit, Inject, PLATFORM_ID, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PortfolioConfigService } from '../../services/portfolio-config.service';
import { AnalyticsService } from '../../services/analytics.service';
import { ImageOptimizerService } from '../../services/image-optimizer.service';
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
    <div class="min-h-screen bg-white text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white pt-24 sm:pt-28 pb-16 px-6 sm:px-12 lg:px-20">
      <div class="max-w-[1340px] mx-auto">
        
        <!-- SKELETON LOADER FOR LINKS -->
        <ng-container *ngIf="isLoading">
          <div class="animate-pulse grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center min-h-[70vh]">
            <div class="lg:col-span-5 h-[500px] rounded-[32px] bg-neutral-100"></div>
            <div class="lg:col-span-7 space-y-6">
              <div class="h-12 w-2/3 bg-neutral-100 rounded-xl"></div>
              <div class="h-4 w-1/3 bg-neutral-100 rounded-full"></div>
              <div class="space-y-4 pt-4">
                <div class="h-24 w-full bg-neutral-100 rounded-2xl"></div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="h-28 bg-neutral-100 rounded-2xl"></div>
                  <div class="h-28 bg-neutral-100 rounded-2xl"></div>
                  <div class="h-28 bg-neutral-100 rounded-2xl"></div>
                  <div class="h-28 bg-neutral-100 rounded-2xl"></div>
                </div>
              </div>
            </div>
          </div>
        </ng-container>

        <!-- MAIN CONTENT -->
        <div *ngIf="!isLoading" class="animate-fadeIn">
          <main class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            <!-- LEFT COLUMN: PORTRAIT IMAGE CARD (5 COLS) -->
            <aside class="lg:col-span-5 lg:sticky lg:top-28">
              <div class="group relative rounded-[28px] sm:rounded-[36px] overflow-hidden border border-neutral-200/90 bg-neutral-50 shadow-[0_15px_45px_rgba(0,0,0,0.06)] transition-all duration-500 hover:scale-[1.01]">
                <div class="relative w-full aspect-[4/5] sm:aspect-[4/5] overflow-hidden bg-neutral-100">
                  <img [src]="getProfileAvatar()" alt="Santiago Arbeláez" 
                       class="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105" />
                  
                  <!-- Clean Badge Top Right -->
                  <div class="absolute top-4 right-4 z-10">
                    <span class="px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-neutral-900 text-[11px] font-headline font-semibold tracking-wider shadow-sm border border-neutral-200/60">
                      PORTALINK
                    </span>
                  </div>

                  <!-- Profile Logo Badge Bottom Left -->
                  <div class="absolute bottom-5 left-5 z-10 flex items-center gap-3">
                    <div class="w-11 h-11 rounded-full bg-white/95 backdrop-blur-md p-2 border border-neutral-200/80 shadow-md flex items-center justify-center">
                      <img [src]="getProfileLogo()" alt="Logo" class="w-full h-full object-contain" />
                    </div>
                    <div class="bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-neutral-200/60 shadow-sm">
                      <span class="text-xs font-headline font-semibold text-neutral-900">Santiago Arbeláez</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <!-- RIGHT COLUMN: PROFILE INFO & LINKS STACK (7 COLS) -->
            <section class="lg:col-span-7 space-y-8">
              
              <!-- Header Profile Info -->
              <div class="space-y-3">
                <h1 class="text-3xl sm:text-5xl font-headline font-semibold tracking-tight leading-none" style="color: #0a0a0a !important;">
                  Santiago Arbeláez
                </h1>
                <div class="flex items-center gap-2">
                  <span class="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-xs font-headline font-medium inline-flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{{ getProfileTitle() }}</span>
                  </span>
                </div>
                <p class="text-xs sm:text-sm font-sans text-neutral-500 leading-relaxed max-w-xl">
                  {{ getTranslation().bioDesc }}
                </p>
              </div>

              <!-- Links Grid Container -->
              <div class="space-y-4">
                
                <!-- Main CTA Link (Obsidian Dark) -->
                <a routerLink="/" (click)="trackLinkClick('proyectos')" 
                   class="group relative rounded-2xl sm:rounded-3xl p-6 sm:p-7 flex items-center justify-between gap-4 transition-all duration-300 hover:scale-[1.01] shadow-md hover:shadow-lg no-underline cursor-pointer border-none"
                   style="background-color: #09090b !important; color: #ffffff !important;">
                  
                  <div class="flex items-center gap-4 sm:gap-5">
                    <div class="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                      <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="color: #ffffff !important;">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-xl sm:text-2xl font-headline font-semibold tracking-tight text-white m-0" style="color: #ffffff !important;">
                        {{ getTranslation().descubre }}
                      </h3>
                      <p class="text-xs font-sans text-neutral-400 m-0 mt-1">
                        {{ getTranslation().ingenieria }}
                      </p>
                    </div>
                  </div>

                  <div class="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1 flex-shrink-0">
                    <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="color: #ffffff !important;">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                    </svg>
                  </div>

                </a>

                <!-- Social Links Grid (2-columns on desktop) -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <a *ngFor="let link of getLinks()" [href]="link.url" target="_blank" (click)="trackLinkClick(link)"
                     class="group rounded-2xl p-5 bg-white border border-neutral-200/80 shadow-sm hover:shadow-md hover:border-neutral-900 hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between gap-4 no-underline cursor-pointer">
                    
                    <div class="flex items-center justify-between">
                      <div class="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 transition-colors group-hover:bg-neutral-900 group-hover:text-white">
                        <svg *ngIf="link.icon === 'tiktok'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                        </svg>
                        <svg *ngIf="link.icon === 'instagram'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                        <svg *ngIf="link.icon === 'whatsapp'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                        </svg>
                        <svg *ngIf="link.icon === 'linkedin'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                          <rect x="2" y="9" width="4" height="12"></rect>
                          <circle cx="4" cy="4" r="2"></circle>
                        </svg>
                        <svg *ngIf="link.icon !== 'tiktok' && link.icon !== 'instagram' && link.icon !== 'whatsapp' && link.icon !== 'linkedin'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                      </div>

                      <svg class="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                      </svg>
                    </div>

                    <div>
                      <h4 class="text-base font-headline font-semibold tracking-tight text-neutral-900 m-0" style="color: #0a0a0a !important;">
                        {{ link.title }}
                      </h4>
                      <p class="text-xs font-sans text-neutral-500 m-0 mt-0.5">
                        {{ link.subtitle }}
                      </p>
                    </div>

                  </a>

                </div>

              </div>

              <!-- Mobile Modeling Book Gallery -->
              <div class="block md:hidden pt-8 border-t border-neutral-100">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h3 class="text-xs font-headline font-semibold text-neutral-900 tracking-wider m-0">
                      {{ getTranslation().retratos }}
                    </h3>
                  </div>
                  <span class="text-xs font-sans text-neutral-400">{{ modelingImages.length }} Fotos</span>
                </div>
                
                <div class="grid grid-cols-2 gap-3">
                  <div *ngFor="let img of modelingImages; let i = index" 
                       (click)="trackSectionView('retratos'); trackLinkClick('foto_' + (i + 1))"
                       class="relative rounded-xl overflow-hidden border border-neutral-200/80 bg-neutral-50 aspect-[3/4] shadow-xs cursor-pointer group">
                    <img [src]="getLowQualityImage(img.src)" 
                         [alt]="img.alt" 
                         loading="lazy" 
                         class="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                  </div>
                </div>
              </div>

            </section>

          </main>

          <!-- Clean Footer -->
          <footer class="mt-16 pt-8 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-neutral-500">
            <div class="flex items-center gap-4">
              <a href="tel:+573054078225" (click)="trackLinkClick('telefono')" class="hover:text-neutral-900 transition-colors no-underline">
                +57 3054078225
              </a>
              <span>•</span>
              <a href="mailto:arbelaezz.c11@gmail.com" (click)="trackLinkClick('email')" class="hover:text-neutral-900 transition-colors no-underline">
                arbelaezz.c11@gmail.com
              </a>
            </div>

            <div>
              &copy; {{ currentYear }} Santiago Arbeláez. Todos los derechos reservados.
            </div>
          </footer>

        </div>

      </div>
    </div>

    <!-- PWA Install Modal -->
    <div *ngIf="showInstallModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/60 backdrop-blur-2xl animate-fadeIn" (click)="closeModal(); $event.stopPropagation()">
      <div class="bg-white border border-neutral-200/90 rounded-[28px] w-full max-w-sm p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl" (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <span class="text-xs font-headline font-semibold text-emerald-700 tracking-wider">{{ getTranslation().instalarTitulo }}</span>
          <button type="button" (click)="trackLinkClick('pwa_cerrar'); closeModal(); $event.stopPropagation()" class="text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer p-1 border-none bg-transparent">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Carousel Step Content -->
        <div class="min-h-[170px] flex flex-col items-center text-center justify-center py-2 relative z-10">
          <div class="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200/80 flex items-center justify-center mb-4 text-neutral-900" 
               [innerHTML]="installSteps[currentInstallStep]?.icon">
          </div>
          
          <h3 class="text-sm font-headline font-semibold text-neutral-900 tracking-wide mb-1" style="color: #0a0a0a !important;">
            {{ installSteps[currentInstallStep]?.title }}
          </h3>
          <p class="text-neutral-500 text-xs leading-relaxed px-2" 
             [innerHTML]="installSteps[currentInstallStep]?.desc">
          </p>
        </div>

        <!-- Dots Indicator -->
        <div class="flex justify-center gap-1.5 mt-3">
          <span *ngFor="let step of installSteps; let idx = index" 
                (click)="trackLinkClick('pwa_paso_' + (idx + 1)); currentInstallStep = idx; $event.stopPropagation()"
                class="h-1 rounded-full cursor-pointer transition-all duration-300"
                [ngClass]="currentInstallStep === idx ? 'bg-neutral-900 w-5' : 'bg-neutral-200 hover:bg-neutral-300 w-1.5'">
          </span>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-between mt-5 border-t border-neutral-100 pt-3">
          <button type="button" (click)="trackLinkClick(currentInstallStep === 0 ? 'pwa_cerrar' : 'pwa_atras'); currentInstallStep === 0 ? closeModal() : prevStep(); $event.stopPropagation()" 
                  class="px-3 py-1.5 text-xs font-headline font-medium text-neutral-400 hover:text-neutral-900 cursor-pointer transition-all border-none bg-transparent">
            {{ currentInstallStep === 0 ? (currentLanguage === 'es' ? 'Cerrar' : 'Close') : (currentLanguage === 'es' ? 'Atrás' : 'Back') }}
          </button>
          
          <button type="button" *ngIf="currentInstallStep < installSteps.length - 1"
                  (click)="trackLinkClick('pwa_siguiente'); nextStep(); $event.stopPropagation()" 
                  class="px-4 py-2 rounded-xl font-headline font-medium text-xs shadow-sm hover:scale-[1.02] cursor-pointer transition-all border-none"
                  style="background-color: #09090b !important; color: #ffffff !important;">
            {{ currentLanguage === 'es' ? 'Siguiente' : 'Next' }}
          </button>
          
          <button type="button" *ngIf="currentInstallStep === installSteps.length - 1 && !isIOS"
                  (click)="trackLinkClick('pwa_instalar_btn'); installPWA(); $event.stopPropagation()" 
                  class="px-4 py-2 rounded-xl font-headline font-medium text-xs shadow-sm hover:scale-[1.02] cursor-pointer transition-all border-none"
                  style="background-color: #09090b !important; color: #ffffff !important;">
            {{ getTranslation().instalarBtn }}
          </button>
          
          <button type="button" *ngIf="currentInstallStep === installSteps.length - 1 && isIOS"
                  (click)="trackLinkClick('pwa_entendido'); closeModal(); $event.stopPropagation()" 
                  class="px-4 py-2 rounded-xl font-headline font-medium text-xs shadow-sm hover:scale-[1.02] cursor-pointer transition-all border-none"
                  style="background-color: #09090b !important; color: #ffffff !important;">
            {{ getTranslation().entendido }}
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out forwards;
    }
  `],
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
  currentTheme = 'light';

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
          icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-6 h-6 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>`)
        },
        {
          title: isEs ? 'Paso 2: Añadir a Inicio' : 'Step 2: Add to Home',
          desc: isEs ? 'Desplázate hacia abajo en el menú de opciones de Safari y selecciona <b>Añadir a la pantalla de inicio</b>.' : 'Scroll down the options menu and select <b>Add to Home Screen</b>.',
          icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-6 h-6 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="4" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>`)
        },
        {
          title: isEs ? 'Paso 3: Confirmar' : 'Step 3: Confirm',
          desc: isEs ? 'Haz clic en <b>Añadir</b> en la esquina superior derecha para completar la instalación en tu dispositivo.' : 'Click <b>Add</b> in the top right corner to complete the installation on your device.',
          icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-6 h-6 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`)
        }
      ];
    } else {
      this.installSteps = [
        {
          title: isEs ? 'Paso 1: Abrir Menú' : 'Step 1: Open Menu',
          desc: isEs ? 'Haz clic en el botón de instalar al final de este carrusel, o abre las opciones de tu navegador (los tres puntos verticales).' : 'Click the install button at the end of this carousel, or open your browser options menu (three vertical dots).',
          icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-6 h-6 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>`)
        },
        {
          title: isEs ? 'Paso 2: Seleccionar Instalar' : 'Step 2: Select Install',
          desc: isEs ? 'Presiona en <b>Instalar aplicación</b> o <b>Añadir a la pantalla de inicio</b> dentro del menú desplegado.' : 'Press <b>Install app</b> or <b>Add to Home Screen</b> in the dropdown menu.',
          icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-6 h-6 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="4" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>`)
        },
        {
          title: isEs ? 'Paso 3: Disfrutar' : 'Step 3: Enjoy',
          desc: isEs ? 'Confirma la instalación y disfruta de PortaLink en pantalla completa, acceso directo en tu escritorio y soporte offline.' : 'Confirm the installation and enjoy PortaLink in full screen, desktop shortcut, and offline support.',
          icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-6 h-6 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L11 3z" /></svg>`)
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
    { src: 'assets/images/fotos/color-1.jpg', alt: 'Editorial Portrait I', isColor: true },
    { src: 'assets/images/fotos/blanco-negro-1.jpg', alt: 'Editorial Portrait II', isColor: false },
    { src: 'assets/images/fotos/color-2 (2).jpg', alt: 'Editorial Portrait III', isColor: true },
    { src: 'assets/images/fotos/blanco-negro-2 (2).jpg', alt: 'Editorial Portrait IV', isColor: false },
    { src: 'assets/images/fotos/color-3.jpg', alt: 'Editorial Portrait V', isColor: true },
    { src: 'assets/images/fotos/blanco-negro-3.jpg', alt: 'Editorial Portrait VI', isColor: false },
    { src: 'assets/images/fotos/color-4.jpg', alt: 'Editorial Portrait VII', isColor: true },
    { src: 'assets/images/fotos/blanco-negro3.jpg', alt: 'Editorial Portrait VIII', isColor: false },
    { src: 'assets/images/fotos/color5.JPG', alt: 'Editorial Portrait IX', isColor: true },
    { src: 'assets/images/fotos/color6.jpg', alt: 'Editorial Portrait X', isColor: true }
  ];

  translations: any = {
    es: {
      soy: 'Soy ',
      creador: 'Creador',
      digital: 'Digital',
      desarrollador: '& Desarrollador',
      bioDesc: 'Desarrollador y creador digital enfocado en construir experiencias interactivas y escalables. Combinando arquitectura de software robusta, diseño moderno y alto rendimiento para potenciar marcas y negocios en el mundo digital.',
      descubre: 'Descubre mi Portafolio',
      ingenieria: 'Ingeniería & Desarrollo de Software',
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
      descubre: 'Discover my Portfolio',
      ingenieria: 'Software Engineering & Development',
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
  private imageOptimizer = inject(ImageOptimizerService);
  
  portfolioData = this.configService.data;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    setTimeout(() => {
      this.isLoading = false;
    }, 400);
    this.initInstallSteps();
    if (isPlatformBrowser(this.platformId)) {
      this.checkPWAStatus();
      this.initInstallSteps();
      
      window.addEventListener('beforeinstallprompt', (e) => {
        if (!this.isStandalone && !localStorage.getItem('pwa_dismissed')) {
          e.preventDefault();
          this.deferredPrompt = e;
          this.showInstallModal = true;
        }
      });

      this.currentLanguage = localStorage.getItem('portfolio-language') || 'es';
      window.addEventListener('portfolio-language-change', this.onLanguageChange);

      this.currentTheme = localStorage.getItem('portfolio-theme') || 'light';
      window.addEventListener('portfolio-theme-change', this.onThemeChange);

      this.analyticsService.incrementMetric('linktreeViews');
    }
  }

  getLinks() {
    return this.configService.data()?.links?.items || [];
  }

  getProfileAvatar() {
    const rawUrl = this.configService.data()?.links?.avatarImage || 'assets/images/fotos/main-link.jpg';
    return this.imageOptimizer.getCachedOrOriginal(rawUrl, 950, 0.75);
  }

  getProfileLogo() {
    const rawUrl = 'assets/icons/navbar-logolight.png';
    return this.imageOptimizer.getCachedOrOriginal(rawUrl, 250, 0.8);
  }

  getLowQualityImage(src: string): string {
    return this.imageOptimizer.getCachedOrOriginal(src, 800, 0.7);
  }

  getProfileTitle() {
    const customTitle = this.configService.data()?.links?.profileTitle;
    if (customTitle && customTitle !== 'Digital Creator & Developer' && customTitle !== 'Creador Digital & Desarrollador') {
      return customTitle;
    }
    return this.currentLanguage === 'es' ? 'Creador Digital & Desarrollador' : 'Digital Creator & Developer';
  }

  trackLinkClick(idOrLink: any) {
    let id = typeof idOrLink === 'string' ? idOrLink : (idOrLink?.icon || idOrLink?.title?.toLowerCase()?.replace(/\s+/g, '_') || idOrLink?.id || 'enlace');
    const defaultMap: { [key: string]: string } = { '1': 'tiktok', '2': 'instagram', '3': 'whatsapp', '4': 'linkedin' };
    if (defaultMap[id]) {
      id = defaultMap[id];
    }
    this.analyticsService.incrementLinkClick(id);
  }

  trackSectionView(section: string) {
    this.analyticsService.incrementSectionView(section);
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        AOS.init({
          duration: 900,
          easing: 'ease-out-cubic',
          once: true
        });
      }, 50);
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('portfolio-language-change', this.onLanguageChange);
      window.removeEventListener('portfolio-theme-change', this.onThemeChange);
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
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    this.isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (navigator as any).standalone === true;
    
    if (this.isStandalone) {
      this.showInstallModal = false;
      return;
    }
    
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
    localStorage.setItem('pwa_dismissed', 'true');
  }
}
