import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hero-design',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section id="hero-design" 
             class="relative w-full flex flex-col items-center justify-center overflow-hidden bg-white text-neutral-900 pt-16 sm:pt-20 md:pt-24 pb-6 sm:pb-10 px-4 sm:px-10 lg:px-16">
      
      <!-- Subtle Ambient Accent -->
      <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[550px] rounded-full blur-[140px] opacity-20 bg-neutral-200/60"></div>
      </div>

      <!-- Main Open Space (Tightened & Unified) -->
      <div class="group relative z-10 w-full max-w-[1440px] mx-auto min-h-[500px] sm:min-h-[560px] md:min-h-[610px] lg:min-h-[660px] flex items-center"
           (mouseenter)="pauseAutoplay()"
           (mouseleave)="resumeAutoplay()">

        <!-- Slides -->
        <div *ngFor="let slide of slides; let i = index"
             class="absolute inset-0 flex flex-col items-center justify-between gap-4 sm:gap-6 lg:gap-8 transition-all duration-700 ease-in-out"
             [ngClass]="slide.isReversed ? 'md:flex-row-reverse' : 'md:flex-row'"
             [style.opacity]="activeSlide === i ? '1' : '0'"
             [style.transform]="activeSlide === i ? 'translateX(0) scale(1)' : (i > activeSlide ? 'translateX(20px) scale(0.99)' : 'translateX(-20px) scale(0.99)')"
             [style.pointerEvents]="activeSlide === i ? 'auto' : 'none'"
             [style.zIndex]="activeSlide === i ? '10' : '1'">

          <!-- Content Column -->
          <div class="w-full md:w-[42%] lg:w-[38%] flex flex-col justify-center space-y-3.5 sm:space-y-4 z-10 shrink-0"
               [ngClass]="slide.isReversed ? 'items-start md:items-end text-left md:text-right' : 'items-start text-left'">

            <!-- Big Bold Headline -->
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-headline font-bold uppercase tracking-tight leading-[1.05] text-[#0a0a0a] m-0"
                style="color: #0a0a0a !important;">
              {{ slide.headline }}
            </h2>

            <!-- Subtitle / Tagline -->
            <p class="text-sm sm:text-base text-neutral-600 font-sans font-normal leading-relaxed max-w-md m-0">
              {{ slide.subtext }}
            </p>

            <!-- CTA Button (Smooth Subtle Hover) -->
            <div class="pt-1.5 sm:pt-2">
              <a *ngIf="slide.link"
                 [href]="slide.link"
                 class="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full font-headline font-semibold text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.99] transition-opacity duration-300 shadow-sm no-underline cursor-pointer"
                 style="background-color: #09090b !important; color: #ffffff !important;">
                <span style="color: #ffffff !important; font-weight: 600;">{{ slide.ctaText }}</span>
                <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="color: #ffffff !important;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                </svg>
              </a>
              <a *ngIf="!slide.link"
                 [routerLink]="['/proyecto', slide.projectId]"
                 class="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full font-headline font-semibold text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.99] transition-opacity duration-300 shadow-sm no-underline cursor-pointer"
                 style="background-color: #09090b !important; color: #ffffff !important;">
                <span style="color: #ffffff !important; font-weight: 600;">{{ slide.ctaText }}</span>
                <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="color: #ffffff !important;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Right Showcase Visual Column (Larger & Slightly Taller) -->
          <div class="w-full md:w-[58%] lg:w-[62%] h-[380px] sm:h-[480px] md:h-[570px] lg:h-[640px] relative flex items-center justify-center">
            
            <!-- Case 1: Triple Stacked Mobile Mockups (Taller & Elegant) -->
            <div *ngIf="slide.isMultiMobile" class="relative flex items-center justify-center w-full h-full">
              
              <!-- Phone Screen 1 (Left / Back) -->
              <div class="absolute z-10 w-[150px] sm:w-[190px] md:w-[230px] lg:w-[255px] h-[310px] sm:h-[400px] md:h-[490px] lg:h-[555px] rounded-[24px] sm:rounded-[34px] overflow-hidden border border-neutral-200/80 shadow-md bg-white -translate-x-18 sm:-translate-x-26 md:-translate-x-36 lg:-translate-x-40 -translate-y-3 sm:-translate-y-5 scale-[0.93] transition-transform duration-500">
                <img [src]="slide.mobileImages?.[1]" 
                     alt="Mockup Móvil Secundario"
                     class="w-full h-full object-cover object-top"
                     loading="lazy"
                     decoding="async">
              </div>

              <!-- Phone Screen 2 (Right / Back) -->
              <div class="absolute z-20 w-[150px] sm:w-[190px] md:w-[230px] lg:w-[255px] h-[310px] sm:h-[400px] md:h-[490px] lg:h-[555px] rounded-[24px] sm:rounded-[34px] overflow-hidden border border-neutral-200/80 shadow-lg bg-white translate-x-18 sm:translate-x-26 md:translate-x-36 lg:translate-x-40 -translate-y-2 sm:-translate-y-3 scale-[0.96] transition-transform duration-500">
                <img [src]="slide.mobileImages?.[2]" 
                     alt="Mockup Móvil Métricas"
                     class="w-full h-full object-cover object-top"
                     loading="lazy"
                     decoding="async">
              </div>

              <!-- Phone Screen 3 (Center Hero Foreground - Largest & Tallest) -->
              <div class="relative z-30 w-[155px] sm:w-[200px] md:w-[240px] lg:w-[268px] h-[320px] sm:h-[420px] md:h-[515px] lg:h-[580px] rounded-[26px] sm:rounded-[36px] overflow-hidden border-2 border-neutral-300 shadow-[0_22px_55px_rgba(0,0,0,0.15)] bg-white translate-y-2 sm:translate-y-4 transition-transform duration-500">
                <img [src]="slide.mobileImages?.[0]" 
                     alt="Mockup Móvil Principal"
                     class="w-full h-full object-cover object-top"
                     loading="lazy"
                     decoding="async">
              </div>

            </div>

            <!-- Case 2: Standard Desktop Showcase (Taller & Crisp) -->
            <div *ngIf="!slide.isMultiMobile" class="relative w-full h-full max-h-[600px] rounded-2xl sm:rounded-3xl overflow-hidden border border-neutral-200/80 shadow-md bg-white group/img">
              <img [src]="slide.image" 
                   [alt]="slide.headline"
                   class="w-full h-full object-cover object-center transform group-hover/img:scale-[1.008] transition-transform duration-700"
                   loading="lazy"
                   decoding="async">
            </div>

          </div>

        </div>

        <!-- Bottom Minimalist Dots -->
        <div class="absolute -bottom-2 md:bottom-2 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 z-20 flex items-center gap-2">
          <button *ngFor="let slide of slides; let i = index"
                  (click)="goToSlide(i)"
                  class="transition-all duration-300 rounded-full border-none cursor-pointer p-0"
                  [ngClass]="activeSlide === i
                    ? 'w-7 h-1.5 bg-neutral-900'
                    : 'w-1.5 h-1.5 bg-neutral-300 hover:bg-neutral-600'"
                  [attr.aria-label]="'Slide ' + (i + 1)">
          </button>
        </div>

      </div>

      <!-- Pure Minimalist Borderless < and > Navigation Arrows (Ultra-Subtle Hover) -->
      <button (click)="prevSlide()" 
              class="absolute left-1 sm:left-3 lg:left-5 top-1/2 -translate-y-1/2 z-30 p-2 border-none bg-transparent text-neutral-300 hover:text-neutral-700 flex items-center justify-center cursor-pointer transition-colors duration-300 focus:outline-none"
              aria-label="Anterior">
        <svg class="w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>

      <button (click)="nextSlide()" 
              class="absolute right-1 sm:right-3 lg:right-5 top-1/2 -translate-y-1/2 z-30 p-2 border-none bg-transparent text-neutral-300 hover:text-neutral-700 flex items-center justify-center cursor-pointer transition-colors duration-300 focus:outline-none"
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

  slides = [
    {
      projectId: 'portalink',
      isMultiMobile: true,
      isReversed: false,
      badge: 'Portafolios & Marca Personal',
      headline: 'Comienza tu marca personal',
      subtext: 'Con inteligencia artificial integrada para mejorar tus ventas.',
      mobileImages: [
        'https://res.cloudinary.com/doxdjiyvi/image/upload/q_auto:eco,f_auto,w_600/v1787547651/portalink1_a0jajw.png',
        'https://res.cloudinary.com/doxdjiyvi/image/upload/q_auto:eco,f_auto,w_600/v1787547653/portalink2_ehf9ki.png',
        'https://res.cloudinary.com/doxdjiyvi/image/upload/q_auto:eco,f_auto,w_600/v1787547652/porta-link3_n2paz8.png'
      ],
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/q_auto:eco,f_auto,w_600/v1787547651/portalink1_a0jajw.png',
      ctaText: 'Escríbenos ya',
      link: '#contact',
      badgeBg: 'rgba(147, 51, 234, 0.10)',
      badgeColor: '#7e22ce',
      badgeBorder: 'rgba(147, 51, 234, 0.35)'
    },
    {
      projectId: 'camascotas',
      isMultiMobile: true,
      isReversed: true,
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
      projectId: 'tiendaintima',
      isMultiMobile: false,
      badge: 'Moda Íntima + IA',
      headline: 'Tienda Íntima E-Commerce',
      subtext: 'E-commerce elegante con motor de recomendación inteligente, catálogo interactivo y checkout ágil.',
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/q_auto:eco,f_auto,w_1100/v1786973903/proyecto-tiendaintima_oahugr.png',
      ctaText: 'Ver Proyecto',
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
