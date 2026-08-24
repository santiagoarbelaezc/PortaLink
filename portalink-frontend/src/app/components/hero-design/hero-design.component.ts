import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ErpDiagramComponent } from '../erp-diagram/erp-diagram.component';

@Component({
  selector: 'app-hero-design',
  standalone: true,
  imports: [CommonModule, RouterModule, ErpDiagramComponent],
  template: `
    <section id="hero" 
             class="relative w-full flex flex-col items-center justify-center overflow-hidden bg-white text-neutral-900 pt-14 xs:pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-10 px-3 xs:px-4 sm:px-8 lg:px-16 select-none">
      
      <!-- Subtle Ambient Accent -->
      <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[550px] rounded-full blur-[140px] opacity-20 bg-neutral-200/60"></div>
      </div>

      <!-- Main Open Space (Tightened & Unified) -->
      <div class="group relative z-10 w-full max-w-[1500px] mx-auto min-h-[560px] xs:min-h-[600px] sm:min-h-[680px] md:min-h-[640px] lg:min-h-[700px] flex items-center"
           (mouseenter)="pauseAutoplay()"
           (mouseleave)="resumeAutoplay()"
           (touchstart)="onTouchStart($event)"
           (touchend)="onTouchEnd($event)">

        <!-- Slides -->
        <div *ngFor="let slide of slides; let i = index"
             class="absolute inset-0 flex flex-col items-center justify-between md:justify-between gap-4 sm:gap-6 lg:gap-8 transition-all duration-700 ease-in-out"
             [ngClass]="slide.isReversed ? 'md:flex-row-reverse' : 'md:flex-row'"
             [style.opacity]="activeSlide === i ? '1' : '0'"
             [style.transform]="activeSlide === i ? 'translateX(0) scale(1)' : (i > activeSlide ? 'translateX(20px) scale(0.99)' : 'translateX(-20px) scale(0.99)')"
             [style.pointerEvents]="activeSlide === i ? 'auto' : 'none'"
             [style.zIndex]="activeSlide === i ? '10' : '1'">

          <!-- Content Column (Adaptive Mobile Centering / Desktop Directional) -->
          <div class="w-full flex flex-col justify-center space-y-3 xs:space-y-3.5 sm:space-y-4 md:space-y-5 z-10 shrink-0 text-center md:text-left"
               [ngClass]="[
                 slide.isMultiMobile ? 'md:w-[46%] lg:w-[44%]' : 'md:w-[40%] lg:w-[38%]',
                 slide.isReversed ? 'items-center md:items-end md:text-right' : 'items-center md:items-start md:text-left'
               ]">

            <!-- Editorial Headline (Matching Trabajos Realizados Style) -->
            <h2 class="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-headline font-semibold tracking-tight leading-[1.08] text-[#0a0a0a] m-0"
                style="color: #0a0a0a !important;">
              {{ slide.headline }}
            </h2>

            <!-- Subtitle / Tagline (Responsive Scaling) -->
            <p class="text-xs xs:text-sm sm:text-base lg:text-xl text-neutral-600 font-sans font-normal leading-relaxed max-w-xl m-0 px-1 xs:px-2 md:px-0">
              {{ slide.subtext }}
            </p>

            <!-- Action Buttons -->
            <div class="pt-1.5 xs:pt-2 sm:pt-3 w-full">
              
              <!-- Case A: Multiple Buttons (Slide 1) -->
              <div *ngIf="slide.buttons && slide.buttons.length > 0" 
                   class="flex flex-wrap items-center justify-center gap-2 xs:gap-2.5 sm:gap-3"
                   [ngClass]="slide.isReversed ? 'md:justify-end' : 'md:justify-start'">
                <ng-container *ngFor="let btn of slide.buttons">
                  <a *ngIf="btn.isRouter"
                     [routerLink]="btn.link"
                     class="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 xs:px-4 sm:px-6 py-2.5 xs:py-3 sm:py-3.5 rounded-full font-headline font-semibold text-[11px] xs:text-xs uppercase tracking-wider transition-all duration-300 shadow-sm no-underline cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                     [style.backgroundColor]="btn.isPrimary ? '#09090b' : '#f4f4f5'"
                     [style.color]="btn.isPrimary ? '#ffffff !important' : '#18181b !important'"
                     [style.border]="btn.isPrimary ? '1px solid #09090b' : '1px solid rgba(0,0,0,0.1)'">
                    <span [style.color]="btn.isPrimary ? '#ffffff !important' : '#18181b !important'" style="font-weight: 600;">{{ btn.text }}</span>
                    <svg *ngIf="btn.isPrimary" class="w-3 xs:w-3.5 h-3 xs:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="color: #ffffff !important;">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                    </svg>
                  </a>
                  <a *ngIf="!btn.isRouter"
                     [href]="btn.link"
                     class="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 xs:px-4 sm:px-6 py-2.5 xs:py-3 sm:py-3.5 rounded-full font-headline font-semibold text-[11px] xs:text-xs uppercase tracking-wider transition-all duration-300 shadow-sm no-underline cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                     [style.backgroundColor]="btn.isPrimary ? '#09090b' : '#f4f4f5'"
                     [style.color]="btn.isPrimary ? '#ffffff !important' : '#18181b !important'"
                     [style.border]="btn.isPrimary ? '1px solid #09090b' : '1px solid rgba(0,0,0,0.1)'">
                    <span [style.color]="btn.isPrimary ? '#ffffff !important' : '#18181b !important'" style="font-weight: 600;">{{ btn.text }}</span>
                    <svg *ngIf="btn.isPrimary" class="w-3 xs:w-3.5 h-3 xs:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="color: #ffffff !important;">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                    </svg>
                  </a>
                </ng-container>
              </div>

              <!-- Case B: Single CTA Button -->
              <div *ngIf="!slide.buttons || slide.buttons.length === 0"
                   class="flex items-center justify-center"
                   [ngClass]="slide.isReversed ? 'md:justify-end' : 'md:justify-start'">
                <a *ngIf="slide.link"
                   [href]="slide.link"
                   class="inline-flex items-center gap-2 px-6 xs:px-7 sm:px-8 py-3 sm:py-3.5 rounded-full font-headline font-semibold text-[11px] xs:text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.99] transition-opacity duration-300 shadow-sm no-underline cursor-pointer"
                   style="background-color: #09090b !important; color: #ffffff !important;">
                  <span style="color: #ffffff !important; font-weight: 600;">{{ slide.ctaText }}</span>
                  <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="color: #ffffff !important;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                  </svg>
                </a>
                <a *ngIf="!slide.link"
                   [routerLink]="['/proyecto', slide.projectId]"
                   class="inline-flex items-center gap-2 px-6 xs:px-7 sm:px-8 py-3 sm:py-3.5 rounded-full font-headline font-semibold text-[11px] xs:text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.99] transition-opacity duration-300 shadow-sm no-underline cursor-pointer"
                   style="background-color: #09090b !important; color: #ffffff !important;">
                  <span style="color: #ffffff !important; font-weight: 600;">{{ slide.ctaText }}</span>
                  <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="color: #ffffff !important;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                  </svg>
                </a>
              </div>

            </div>
          </div>

          <!-- Right Showcase Visual Column (Perfect Mobile & Desktop Scaling) -->
          <div class="w-full h-[250px] xs:h-[290px] sm:h-[400px] md:h-[600px] lg:h-[680px] relative flex items-center justify-center"
               [ngClass]="slide.isMultiMobile ? 'md:w-[54%] lg:w-[56%]' : 'md:w-[60%] lg:w-[62%]'">
            
            <!-- Case 1: Triple Stacked Mobile Mockups (Proportional Mobile Sizing) -->
            <div *ngIf="slide.isMultiMobile" class="relative flex items-center justify-center w-full h-full">
              
              <!-- Phone Screen 1 (Left / Back) -->
              <div class="absolute z-10 w-[100px] xs:w-[120px] sm:w-[170px] md:w-[230px] lg:w-[255px] h-[205px] xs:h-[250px] sm:h-[350px] md:h-[490px] lg:h-[555px] rounded-[18px] xs:rounded-[22px] sm:rounded-[34px] overflow-hidden border border-neutral-200/80 shadow-md bg-white -translate-x-12 xs:-translate-x-15 sm:-translate-x-24 md:-translate-x-36 -translate-y-2 sm:-translate-y-5 scale-[0.93] transition-transform duration-500">
                <img [src]="slide.mobileImages?.[1]" 
                     alt="Mockup Móvil Secundario"
                     class="w-full h-full object-cover object-top"
                     loading="lazy"
                     decoding="async">
              </div>

              <!-- Phone Screen 2 (Right / Back) -->
              <div class="absolute z-20 w-[100px] xs:w-[120px] sm:w-[170px] md:w-[230px] lg:w-[255px] h-[205px] xs:h-[250px] sm:h-[350px] md:h-[490px] lg:h-[555px] rounded-[18px] xs:rounded-[22px] sm:rounded-[34px] overflow-hidden border border-neutral-200/80 shadow-lg bg-white translate-x-12 xs:translate-x-15 sm:translate-x-24 md:translate-x-36 -translate-y-1.5 sm:-translate-y-3 scale-[0.96] transition-transform duration-500">
                <img [src]="slide.mobileImages?.[2]" 
                     alt="Mockup Móvil Métricas"
                     class="w-full h-full object-cover object-top"
                     loading="lazy"
                     decoding="async">
              </div>

              <!-- Phone Screen 3 (Center Hero Foreground - Largest & Tallest) -->
              <div class="relative z-30 w-[108px] xs:w-[130px] sm:w-[185px] md:w-[240px] lg:w-[268px] h-[220px] xs:h-[270px] sm:h-[370px] md:h-[515px] lg:h-[580px] rounded-[20px] xs:rounded-[24px] sm:rounded-[36px] overflow-hidden border-2 border-neutral-300 shadow-[0_15px_35px_rgba(0,0,0,0.12)] sm:shadow-[0_22px_55px_rgba(0,0,0,0.15)] bg-white translate-y-1.5 sm:translate-y-4 transition-transform duration-500">
                <img [src]="slide.mobileImages?.[0]" 
                     alt="Mockup Móvil Principal"
                     class="w-full h-full object-cover object-top"
                     loading="lazy"
                     decoding="async">
              </div>

            </div>

            <!-- Case 2: Interactive Pure-Code Vector ERP Diagram (Slide 2) -->
            <div *ngIf="slide.projectId === 'erp-ecosystem'" class="relative w-full h-full flex items-center justify-center">
              <app-erp-diagram class="w-full"></app-erp-diagram>
            </div>

            <!-- Case 3: Standard Desktop Showcase (Slide 4 - Sysmicon) -->
            <div *ngIf="!slide.isMultiMobile && slide.projectId !== 'erp-ecosystem'" class="relative w-full h-full max-h-[250px] xs:max-h-[290px] sm:max-h-[400px] md:max-h-[680px] flex items-center justify-center group/img px-2 sm:px-0">
              <img [src]="slide.image" 
                   [alt]="slide.headline"
                   class="w-full h-full max-h-[250px] xs:max-h-[290px] sm:max-h-[400px] md:max-h-[680px] object-contain object-center drop-shadow-xl md:drop-shadow-2xl transform transition-transform duration-700 hover:scale-[1.015]"
                   loading="lazy"
                   decoding="async">
            </div>

          </div>

        </div>

        <!-- Bottom Minimalist Dots (Touch-Optimized) -->
        <div class="absolute -bottom-3 sm:-bottom-2 md:bottom-2 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 z-20 flex items-center gap-1.5 sm:gap-2">
          <button *ngFor="let slide of slides; let i = index"
                  (click)="goToSlide(i)"
                  class="transition-all duration-300 rounded-full border-none cursor-pointer p-0"
                  [ngClass]="activeSlide === i
                    ? 'w-6 sm:w-7 h-1.5 bg-neutral-900'
                    : 'w-1.5 h-1.5 bg-neutral-300 hover:bg-neutral-600'"
                  [attr.aria-label]="'Slide ' + (i + 1)">
          </button>
        </div>

      </div>

      <!-- Pure Minimalist Borderless < and > Navigation Arrows (Hidden on small mobile for cleaner UX, visible sm+) -->
      <button (click)="prevSlide()" 
              class="hidden sm:flex absolute left-1 sm:left-3 lg:left-5 top-1/2 -translate-y-1/2 z-30 p-2 border-none bg-transparent text-neutral-300 hover:text-neutral-700 items-center justify-center cursor-pointer transition-colors duration-300 focus:outline-none"
              aria-label="Anterior">
        <svg class="w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>

      <button (click)="nextSlide()" 
              class="hidden sm:flex absolute right-1 sm:right-3 lg:right-5 top-1/2 -translate-y-1/2 z-30 p-2 border-none bg-transparent text-neutral-300 hover:text-neutral-700 items-center justify-center cursor-pointer transition-colors duration-300 focus:outline-none"
              aria-label="Siguiente">
        <svg class="w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>

    </section>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class HeroDesignComponent implements OnInit, OnDestroy {
  activeSlide = 0;
  autoplayDuration = 6000;
  isAutoplayPaused = false;
  private autoplayTimer: any;

  private touchStartX = 0;
  private touchEndX = 0;

  slides = [
    {
      projectId: 'portalink',
      isMultiMobile: true,
      isReversed: false,
      badge: 'Portafolios & Marca Personal',
      headline: 'Comienza tu marca personal',
      subtext: 'Con inteligencia artificial integrada para potenciar tus ventas, automatizar la atención a tus clientes y posicionar tus proyectos con presencia digital de alto impacto.',
      buttons: [
        { text: 'Proyectos realizados', link: '/prototipos', isRouter: true, isPrimary: false },
        { text: 'Contacto', link: '#contact', isRouter: false, isPrimary: false },
        { text: 'Escríbeme ya', link: '#contact', isRouter: false, isPrimary: true }
      ],
      mobileImages: [
        'https://res.cloudinary.com/doxdjiyvi/image/upload/q_auto:eco,f_auto,w_600/v1787579497/portalink1_xxzxts.png',
        'https://res.cloudinary.com/doxdjiyvi/image/upload/q_auto:eco,f_auto,w_600/v1787547653/portalink2_ehf9ki.png',
        'https://res.cloudinary.com/doxdjiyvi/image/upload/q_auto:eco,f_auto,w_600/v1787547652/porta-link3_n2paz8.png'
      ],
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/q_auto:eco,f_auto,w_600/v1787579497/portalink1_xxzxts.png',
      ctaText: 'Escríbenos ya',
      link: '#contact',
      badgeBg: 'rgba(147, 51, 234, 0.10)',
      badgeColor: '#7e22ce',
      badgeBorder: 'rgba(147, 51, 234, 0.35)'
    },
    {
      projectId: 'erp-ecosystem',
      isMultiMobile: false,
      isReversed: true,
      badge: 'ERP & Ecosistema Digital',
      headline: 'Sistema integral para tu negocio',
      subtext: 'Centraliza la gestión de tu empresa con ERP a medida, sincronización con tienda web, app móvil, facturación e inteligencia artificial.',
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/q_auto:eco,f_auto,w_1300/v1787584352/erp-beta_x5vnul.png',
      ctaText: 'Escríbenos ya',
      link: '#contact',
      badgeBg: 'rgba(59, 130, 246, 0.10)',
      badgeColor: '#2563eb',
      badgeBorder: 'rgba(59, 130, 246, 0.35)'
    },
    {
      projectId: 'camascotas',
      isMultiMobile: true,
      isReversed: false,
      badge: 'E-Commerce & Mobile App',
      headline: 'Obtén tu aplicación web y móvil',
      subtext: 'Diseñamos soluciones para tu negocio o emprendimiento con una aplicación web y móvil, panel administrativo con las secciones que necesites.',
      mobileImages: [
        'https://res.cloudinary.com/doxdjiyvi/image/upload/q_auto:eco,f_auto,w_600/v1786973239/camascotas-movil_z1awlf.png',
        'https://res.cloudinary.com/doxdjiyvi/image/upload/q_auto:eco,f_auto,w_600/v1786973239/camascotas-movil2_xhewzt.png',
        'https://res.cloudinary.com/doxdjiyvi/image/upload/q_auto:eco,f_auto,w_600/v1786973240/analiticas-movil_qr3dcw.png'
      ],
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/q_auto:eco,f_auto,w_600/v1786973239/camascotas-movil_z1awlf.png',
      ctaText: 'Escríbenos ya',
      link: '#contact',
      badgeBg: 'rgba(6, 182, 212, 0.10)',
      badgeColor: '#0e7490',
      badgeBorder: 'rgba(6, 182, 212, 0.35)'
    },
    {
      projectId: 'sysmicon',
      isMultiMobile: false,
      isReversed: true,
      badge: 'Plataformas Web & Software',
      headline: 'Digitaliza tu empresa y servicios',
      subtext: 'Desarrollamos plataformas web corporativas, sistemas de administración y software escalable adaptado a tus necesidades.',
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/q_auto:eco,f_auto,w_1200/v1787580641/sysmicon-hero1_ehlafz.png',
      ctaText: 'Escríbenos ya',
      link: '#contact',
      badgeBg: 'rgba(217, 119, 6, 0.10)',
      badgeColor: '#b45309',
      badgeBorder: 'rgba(217, 119, 6, 0.35)'
    }
  ];

  ngOnInit() {
    this.startAutoplay();
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  onTouchStart(e: TouchEvent) {
    if (e.changedTouches && e.changedTouches.length > 0) {
      this.touchStartX = e.changedTouches[0].screenX;
      this.pauseAutoplay();
    }
  }

  onTouchEnd(e: TouchEvent) {
    if (e.changedTouches && e.changedTouches.length > 0) {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
      this.resumeAutoplay();
    }
  }

  private handleSwipe() {
    const diff = this.touchStartX - this.touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        this.nextSlide();
      } else {
        this.prevSlide();
      }
    }
  }

  goToSlide(index: number) {
    this.activeSlide = index;
    this.restartAutoplay();
  }

  nextSlide() {
    this.activeSlide = (this.activeSlide + 1) % this.slides.length;
    this.restartAutoplay();
  }

  prevSlide() {
    this.activeSlide = (this.activeSlide - 1 + this.slides.length) % this.slides.length;
    this.restartAutoplay();
  }

  pauseAutoplay() {
    this.isAutoplayPaused = true;
    this.stopAutoplay();
  }

  resumeAutoplay() {
    this.isAutoplayPaused = false;
    this.startAutoplay();
  }

  private startAutoplay() {
    this.autoplayTimer = setTimeout(() => {
      this.nextSlide();
    }, this.autoplayDuration);
  }

  private stopAutoplay() {
    if (this.autoplayTimer) {
      clearTimeout(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  private restartAutoplay() {
    this.stopAutoplay();
    if (!this.isAutoplayPaused) {
      this.startAutoplay();
    }
  }
}

