import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
    selector: 'app-portfolio',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <ng-container *ngIf="!isLoading; else skeleton">
      <section id="portfolio" class="py-20 md:py-32 overflow-hidden relative">
      <div class="container mx-auto px-6">
        <!-- Section Header -->
        <div class="mb-4 md:mb-6">
          <div class="flex items-center gap-4 mb-4">
            <div class="h-px w-12 bg-white/50"></div>
            <span class="text-white/50 text-xs uppercase tracking-[0.4em]">{{ getTranslation().subtitle }}</span>
          </div>
          <h2 class="text-4xl md:text-5xl font-headline uppercase leading-none tracking-tighter">{{ getTranslation().title }}</h2>
        </div>

        <!-- Carousel Container -->
        <div #carouselContainer
             (touchstart)="onTouchStart($event)"
             (touchmove)="onTouchMove($event)"
             (touchend)="onTouchEnd()"
             class="relative w-full h-[calc(var(--card-w)+40px)] sm:h-[450px] lg:h-[600px] flex items-center justify-start select-none overflow-visible">
          
          <!-- Cards Track -->
          <div class="flex items-center gap-[var(--card-gap)] transition-transform duration-700 ease-out"
               [style.transform]="getTransform()">
            
            <div *ngFor="let project of projects; let i = index"
                 (click)="goTo(i)"
                 [class.active-card]="i === currentIndex"
                 [class.inactive-card]="i !== currentIndex"
                 class="carousel-card relative flex-shrink-0 w-[var(--card-w)] aspect-square sm:aspect-[16/9] rounded-[24px] sm:rounded-[36px] overflow-hidden border border-white/10 transition-all duration-700 cursor-pointer">
              
              <!-- Background Image -->
              <img [src]="project.images && project.images.length > 0 ? project.images[0] : 'project-1.png'" 
                   [alt]="getProjectTitle(project)" 
                   class="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 card-bg-img" />
              
              <!-- Cinematic Gradient Vignette -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/10 sm:bg-gradient-to-r sm:from-black/95 sm:via-black/55 sm:to-transparent transition-opacity duration-700 content-overlay"></div>

              <!-- Active Card Content (Only fully visible on active card) -->
              <div class="absolute inset-0 flex flex-col justify-end p-5 sm:p-12 lg:p-14 text-left transition-all duration-700 content-details">
                
                 <!-- Tag / Category -->
                <span class="text-[10px] sm:text-[11px] uppercase tracking-[0.4em] font-bold block mb-2 sm:mb-4" style="color: rgba(255, 255, 255, 0.6);">
                  {{ getTranslation().defaultTag }}
                </span>

                <!-- Massive Bold Headline (Apple TV+ Style) -->
                <h3 class="font-headline uppercase leading-[0.9] tracking-tighter text-2xl sm:text-4xl lg:text-[54px] max-w-3xl mb-3 sm:mb-6 title-accent-color title-glow">
                  {{ getProjectTitle(project) }}
                </h3>

                <!-- Description & CTAs -->
                <div class="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mt-2">
                  <!-- Ver Ahora Button -->
                  <a *ngIf="project.liveUrl" [href]="project.liveUrl" target="_blank"
                     (click)="$event.stopPropagation()"
                     class="inline-flex items-center justify-center px-6 py-3 sm:px-9 sm:py-4 rounded-full bg-white text-black font-bold text-[10px] sm:text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all w-fit">
                    {{ getTranslation().viewNow }}
                  </a>

                  <!-- Meta/Tech stack & short description -->
                  <p class="text-xs md:text-sm font-medium leading-relaxed max-w-md sm:max-w-2xl hidden sm:block" style="color: rgba(255, 255, 255, 0.85);">
                    {{ getProjectDescription(project) }}
                  </p>
                </div>

              </div>

              <!-- Custom Logo Overlay on top right (Aesthetic detail) -->
              <div class="absolute top-4 right-4 sm:top-6 sm:right-6 opacity-60 text-white flex items-center gap-1 text-[10px] sm:text-xs font-semibold tracking-wider">
                <span>PORTALINK</span>
                <span style="color: var(--accent-color, #00f5ff);">+</span>
              </div>

            </div>
          </div>
        </div>

        <!-- Indicator Dots -->
        <div class="flex justify-center gap-2 mt-8 sm:mt-12 z-20 relative">
          <button *ngFor="let dot of projects; let i = index"
                  (click)="goTo(i)"
                  [class.active-dot]="i === currentIndex"
                  class="w-2 h-2 rounded-full transition-all duration-300 cursor-pointer"
                  style="background-color: var(--text-primary, #ffffff); opacity: 0.25;"></button>
        </div>
      </div>
      </section>
    </ng-container>

    <ng-template #skeleton>
      <section class="py-20 md:py-32 overflow-hidden relative animate-pulse">
        <div class="container mx-auto px-6">
          <!-- Header Skeleton -->
          <div class="mb-4 md:mb-6">
            <div class="flex items-center gap-4 mb-4">
              <div class="h-px w-12 opacity-20" style="background-color: var(--text-primary);"></div>
              <div class="h-3 w-32 rounded-full opacity-20" style="background-color: var(--text-primary);"></div>
            </div>
            <div class="h-10 md:h-14 w-3/4 max-w-md rounded-2xl opacity-20" style="background-color: var(--text-primary);"></div>
          </div>

          <!-- Carousel Skeleton -->
          <div class="relative w-full h-[calc(var(--card-w)+40px)] sm:h-[450px] lg:h-[600px] flex items-center justify-start overflow-hidden">
            <div class="flex items-center gap-[var(--card-gap)] w-full">
              
              <!-- Active Card Skeleton -->
              <div class="flex-shrink-0 w-[var(--card-w)] aspect-square sm:aspect-[16/9] rounded-[24px] sm:rounded-[36px] overflow-hidden border border-white/10 relative" style="background-color: rgba(128,128,128,0.1);">
                <div class="absolute inset-0 flex flex-col justify-end p-5 sm:p-12 lg:p-14 text-left">
                  <div class="h-3 w-24 rounded-full opacity-20 mb-3 sm:mb-5" style="background-color: var(--text-primary);"></div>
                  <div class="h-10 sm:h-14 lg:h-16 w-3/4 rounded-2xl opacity-20 mb-4 sm:mb-8" style="background-color: var(--text-primary);"></div>
                  <div class="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mt-2">
                    <div class="h-10 sm:h-12 w-32 rounded-full opacity-20" style="background-color: var(--text-primary);"></div>
                    <div class="space-y-2 hidden sm:block w-1/2">
                      <div class="h-3 w-full rounded-full opacity-10" style="background-color: var(--text-primary);"></div>
                      <div class="h-3 w-4/5 rounded-full opacity-10" style="background-color: var(--text-primary);"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Inactive Card Skeleton -->
              <div class="flex-shrink-0 w-[var(--card-w)] aspect-square sm:aspect-[16/9] rounded-[24px] sm:rounded-[36px] overflow-hidden border border-white/10 opacity-35 scale-90" style="background-color: rgba(128,128,128,0.1);"></div>
              
            </div>
          </div>

          <!-- Indicator Dots Skeleton -->
          <div class="flex justify-center gap-2 mt-8 sm:mt-12 z-20 relative">
             <div *ngFor="let _ of [1,2,3]" class="w-2 h-2 rounded-full opacity-20" style="background-color: var(--text-primary);"></div>
          </div>
        </div>
      </section>
    </ng-template>
  `,
    styles: [`
    :host {
      --card-w: 92vw;
      --card-gap: 16px;
    }
    @media (min-width: 640px) {
      :host {
        --card-w: 86vw;
        --card-gap: 20px;
      }
    }
    @media (min-width: 1024px) {
      :host {
        --card-w: 82vw;
        --card-gap: 24px;
        max-width: 1200px;
      }
    }

    .carousel-card {
      transform: scale(0.9);
      opacity: 0.35;
      filter: blur(2px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      max-width: 1000px;
    }
    .carousel-card.active-card {
      transform: scale(1);
      opacity: 1;
      filter: blur(0);
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 245, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.15);
    }
    .carousel-card.inactive-card:hover {
      opacity: 0.6;
      filter: blur(0.5px);
    }

    /* Content detail animations */
    .content-details {
      opacity: 0;
      transform: translateY(30px);
      pointer-events: none;
    }
    .active-card .content-details {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }
    .content-overlay {
      opacity: 0;
    }
    .active-card .content-overlay {
      opacity: 1;
    }

    /* Accent color dynamic mapping for title */
    .title-accent-color {
      color: #ffffff;
    }

    /* Apple-style massive title glow */
    .title-glow {
      text-shadow: 0 0 35px rgba(255, 255, 255, 0.1);
    }

    /* Indicator dots */
    .active-dot {
      background-color: var(--text-primary, #ffffff) !important;
      opacity: 1 !important;
      width: 24px;
    }

    .card-bg-img {
      transform: scale(1.05);
    }
    .active-card:hover .card-bg-img {
      transform: scale(1.08);
    }
  `]
})
export class PortfolioComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() projects: any[] = [];
  isLoading = true;
  currentIndex = 0;
  currentLanguage = 'es';
  private lastWheelTime = 0;
  private accumulatedDeltaX = 0;
  private wheelListener = (e: WheelEvent) => this.onWheel(e);

  @ViewChild('carouselContainer', { static: false }) containerRef?: ElementRef;

  // Touch Swiping variables
  private touchStartX = 0;
  private touchEndX = 0;

  translations: any = {
    es: {
      subtitle: 'Portafolio',
      title: 'Proyectos Destacados',
      viewNow: 'Ver ahora',
      defaultTag: 'Diseño Web',
      projectTitles: {
        'Portfolio Personal': 'Portfolio Personal',
        'PortaLink AI Vision': 'PortaLink AI Vision',
        'E-Commerce Premium': 'E-Commerce Premium'
      },
      projectDescriptions: {
        'Diseño y desarrollo de un espacio digital cinematográfico interactivo de presentación profesional. Incorpora un selector de paletas de color en tiempo real, efectos avanzados de desenfoque de fondo y un asistente inteligente conversacional para guiar a los visitantes, logrando una experiencia completamente inmersiva y fluida.': 'Diseño y desarrollo de un espacio digital cinematográfico interactivo de presentación profesional. Incorpora un selector de paletas de color en tiempo real, efectos avanzados de desenfoque de fondo y un asistente inteligente conversacional para guiar a los visitantes, logrando una experiencia completamente inmersiva y fluida.',
        'Plataforma avanzada de procesamiento y análisis visual mediante modelos inteligentes de visión por computadora. Especializada en la detección automática de elementos, segmentación de objetos en tiempo real y el análisis detallado de planos y estructuras complejas con representación gráfica interactiva.': 'Plataforma avanzada de procesamiento y análisis visual mediante modelos inteligentes de visión por computadora. Especializada en la detección automática de elementos, segmentación de objetos en tiempo real y el análisis detallado de planos y estructuras complejas con representación gráfica interactiva.',
        'Solución integral de comercio electrónico de alto rendimiento diseñada para la venta en línea automatizada. Cuenta con catálogo autogestionable de productos, carrito de compras optimizado, procesamiento seguro de pagos digitales y un completo panel administrativo para control de stock y pedidos.': 'Solución integral de comercio electrónico de alto rendimiento diseñada para la venta en línea automatizada. Cuenta con catálogo autogestionable de productos, carrito de compras optimizado, procesamiento seguro de pagos digitales y un completo panel administrativo para control de stock y pedidos.'
      }
    },
    en: {
      subtitle: 'Portfolio',
      title: 'Featured Projects',
      viewNow: 'View now',
      defaultTag: 'Web Design',
      projectTitles: {
        'Portfolio Personal': 'Personal Portfolio',
        'PortaLink AI Vision': 'PortaLink AI Vision',
        'E-Commerce Premium': 'Premium E-Commerce'
      },
      projectDescriptions: {
        'Diseño y desarrollo de un espacio digital cinematográfico interactivo de presentación profesional. Incorpora un selector de paletas de color en tiempo real, efectos avanzados de desenfoque de fondo y un asistente inteligente conversacional para guiar a los visitantes, logrando una experiencia completamente inmersiva y fluida.': 'Design and development of an interactive cinematic digital space for professional presentation. Features real-time color palette selector, backdrop blur effects, and an intelligent assistant to guide the visitor for a fully immersive and smooth experience.',
        'Plataforma avanzada de procesamiento y análisis visual mediante modelos inteligentes de visión por computadora. Especializada en la detección automática de elementos, segmentación de objetos en tiempo real y el análisis detallado de planos y estructuras complejas con representación gráfica interactiva.': 'Advanced visual processing and analysis platform using intelligent computer vision models. Specialized in automatic element detection, real-time object segmentation, and detailed analysis of complex diagrams and structures with interactive graphical representation.',
        'Solución integral de comercio electrónico de alto rendimiento diseñada para la venta en línea automatizada. Cuenta con catálogo autogestionable de productos, carrito de compras optimizado, procesamiento seguro de pagos digitales y un completo panel administrativo para control de stock y pedidos.': 'Comprehensive high-performance e-commerce solution designed for automated online sales. Features self-managed product catalog, optimized shopping cart, secure digital payment processing, and a full admin dashboard for stock and order control.'
      }
    }
  };

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.currentLanguage = localStorage.getItem('portfolio-language') || 'es';
      window.addEventListener('portfolio-language-change', this.onLanguageChange);
    }
    
    // Fake loading delay to mimic the dashboard shimmer experience smoothly
    setTimeout(() => {
      this.isLoading = false;
    }, 800);
  }

  onLanguageChange = (event: any) => {
    this.currentLanguage = event.detail.language;
  };

  getTranslation() {
    return this.translations[this.currentLanguage] || this.translations['es'];
  }

  getProjectTitle(project: any) {
    const t = this.getTranslation();
    return t.projectTitles[project.title] || project.title;
  }

  getProjectDescription(project: any) {
    const t = this.getTranslation();
    return t.projectDescriptions[project.description] || project.description;
  }

  getProjectCategory(project: any) {
    if (project.techStack && project.techStack.length > 0) {
      return project.techStack[0];
    }
    return this.getTranslation().defaultTag;
  }

  ngAfterViewInit() {
    if (this.containerRef) {
      this.containerRef.nativeElement.addEventListener('wheel', this.wheelListener, { passive: false });
    }
  }

  ngOnDestroy() {
    if (this.containerRef) {
      this.containerRef.nativeElement.removeEventListener('wheel', this.wheelListener);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('portfolio-language-change', this.onLanguageChange);
    }
  }

  @HostListener('window:resize')
  onResize() {
    // Triggers change detection on window resize to recalculate computed transform
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  next() {
    if (this.currentIndex < this.projects.length - 1) {
      this.currentIndex++;
    }
  }

  goTo(index: number) {
    this.currentIndex = index;
  }

  // Touch handlers for mobile swipe navigation
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
    this.touchEndX = event.touches[0].clientX;
  }

  onTouchMove(event: TouchEvent) {
    this.touchEndX = event.touches[0].clientX;
  }

  onTouchEnd() {
    const diffX = this.touchStartX - this.touchEndX;
    if (Math.abs(diffX) > 50) { // 50px swipe threshold
      if (diffX > 0) {
        this.next();
      } else {
        this.prev();
      }
    }
    this.touchStartX = 0;
    this.touchEndX = 0;
  }

  // Returns the exact CSS transform string to center/align cards properly
  getTransform(): string {
    if (typeof window === 'undefined') {
      return `translateX(0px)`;
    }

    // Determine sizes matching CSS media queries
    const width = window.innerWidth;
    let cardW = width * 0.92;
    let gap = 16;

    if (width >= 640 && width < 1024) {
      cardW = width * 0.86;
      gap = 20;
    } else if (width >= 1024) {
      cardW = Math.min(1000, width * 0.82);
      gap = 24;
    }

    const containerWidth = Math.min(1280, width - 48); // container mx-auto px-6 (48px padding total)
    const totalTrackWidth = this.projects.length * cardW + (this.projects.length - 1) * gap;
    
    // Target translation for alignment
    let tx = -this.currentIndex * (cardW + gap);

    // Clamp translation so the last card aligns perfectly with the right edge of the container
    const maxTx = containerWidth - totalTrackWidth;
    if (tx < maxTx && totalTrackWidth > containerWidth) {
      tx = maxTx;
    }

    // Never translate positively to the right
    if (tx > 0) {
      tx = 0;
    }

    return `translateX(${tx}px)`;
  }

  onWheel(event: WheelEvent) {
    const deltaX = event.deltaX;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(event.deltaY);
    
    // Reaccionar solo a gestos puramente horizontales
    if (absX > absY && absX > 2) {
      event.preventDefault();
      
      const now = Date.now();
      // Si ha pasado mucho tiempo desde el último scroll, reiniciar el acumulador
      if (now - this.lastWheelTime > 300) { 
        this.accumulatedDeltaX = 0;
      }
      this.lastWheelTime = now;
      
      this.accumulatedDeltaX += deltaX;
      
      // Umbral intermedio (130px)
      if (Math.abs(this.accumulatedDeltaX) > 130) {
        if (this.accumulatedDeltaX > 0) {
          this.next();
        } else {
          this.prev();
        }
        // Reseteamos el acumulador después de mover
        this.accumulatedDeltaX = 0;
      }
    }
  }
}
