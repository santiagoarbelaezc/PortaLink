import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
    selector: 'app-portfolio',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <ng-container *ngIf="!isLoading; else skeleton">
      <section id="portfolio" class="py-12 md:py-20 overflow-hidden relative bg-white text-neutral-900 transition-colors duration-500">
      <div class="container mx-auto px-6 max-w-[1500px]">
        <!-- Section Header -->
        <div class="mb-8 md:mb-12">
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-headline font-semibold tracking-tight leading-snug" style="color: #0a0a0a !important;">
            {{ getTranslation().title }}
          </h2>
        </div>

        <!-- Native Smooth Horizontal Scroll Container -->
        <div #carouselTrack
             (scroll)="onTrackScroll()"
             class="carousel-scroll-track flex items-stretch gap-6 md:gap-10 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar py-4 px-2 -mx-2 select-none overscroll-x-contain">
          
          <div *ngFor="let project of projects; let i = index"
               (click)="onProjectClick(project, i)"
               [class.active-card]="i === currentIndex"
               [class.inactive-card]="i !== currentIndex"
               class="carousel-card snap-center relative flex-shrink-0 w-[88vw] sm:w-[75vw] lg:w-[780px] rounded-[28px] sm:rounded-[36px] overflow-hidden border border-neutral-200/80 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.04)] transition-all duration-500 cursor-pointer flex flex-col justify-between">
            
            <!-- Image Showcase (Aspect ratio 16/10) -->
            <div class="relative w-full overflow-hidden bg-neutral-50 aspect-[16/10]">
              <img [src]="project.images && project.images.length > 0 ? project.images[0] : 'assets/images/fotos/photo2.jpg'" 
                   [alt]="getProjectTitle(project)" 
                   class="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 hover:scale-105 card-bg-img" />
              
              <!-- Badge superior derecho -->
              <div class="absolute top-4 right-4 z-10">
                <span class="px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-neutral-900 text-[11px] font-headline font-semibold tracking-wider shadow-sm border border-neutral-200/60">
                  PORTALINK
                </span>
              </div>
            </div>

            <!-- Content Details Container Below Image (Pure white, single button, no description) -->
            <div class="p-6 sm:p-7 flex items-center justify-between gap-4 bg-white border-t border-neutral-100/80">
              
              <h3 class="font-headline font-semibold tracking-tight text-2xl sm:text-3xl leading-snug" style="color: #0a0a0a !important;">
                {{ getProjectTitle(project) }}
              </h3>

              <!-- Único Botón: Ver Detalles -->
              <a [routerLink]="['/proyecto', getProjectId(project)]"
                 (click)="$event.stopPropagation()"
                 class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-headline font-medium text-xs shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all no-underline border-none flex-shrink-0"
                 style="background-color: #09090b !important; color: #ffffff !important;">
                <span style="color: #ffffff !important;">Ver Detalles</span>
                <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="color: #ffffff !important;"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
              </a>

            </div>

          </div>
        </div>

        <!-- Indicator Dots -->
        <div class="flex justify-center gap-2 mt-8 sm:mt-12 z-20 relative">
          <button *ngFor="let dot of projects; let i = index"
                  (click)="goTo(i)"
                  [class.active-dot]="i === currentIndex"
                  class="w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer border border-neutral-300 dark:border-white/20"
                  [ngClass]="i === currentIndex ? 'bg-neutral-900 dark:bg-white w-6' : 'bg-neutral-300 dark:bg-white/20'"></button>
        </div>
      </div>
      </section>
    </ng-container>

    <ng-template #skeleton>
      <section class="py-20 md:py-32 overflow-hidden relative animate-pulse">
        <div class="container mx-auto px-6">
          <div class="mb-4 md:mb-6">
            <div class="flex items-center gap-4 mb-4">
              <div class="h-px w-12 opacity-20" style="background-color: var(--text-primary);"></div>
              <div class="h-3 w-32 rounded-full opacity-20" style="background-color: var(--text-primary);"></div>
            </div>
            <div class="h-10 md:h-14 w-3/4 max-w-md rounded-2xl opacity-20" style="background-color: var(--text-primary);"></div>
          </div>

          <div class="flex items-center gap-6 overflow-hidden py-6">
            <div class="flex-shrink-0 w-[85vw] lg:w-[850px] aspect-[16/9] rounded-[36px] border border-white/10 opacity-20 bg-white/10"></div>
            <div class="flex-shrink-0 w-[85vw] lg:w-[850px] aspect-[16/9] rounded-[36px] border border-white/10 opacity-10 bg-white/10"></div>
          </div>
        </div>
      </section>
    </ng-template>
  `,
    styles: [`
    .carousel-scroll-track {
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior-x: contain;
    }
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }

    .carousel-card {
      scroll-snap-align: center;
      transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      transform: scale(0.94);
      opacity: 0.45;
      filter: blur(1px);
    }
    .carousel-card.active-card {
      transform: scale(1);
      opacity: 1;
      filter: blur(0);
      box-shadow: none !important;
      border-color: rgba(255, 255, 255, 0.25);
    }
    .carousel-card.inactive-card:hover {
      opacity: 0.75;
      filter: blur(0);
      transform: scale(0.97);
    }

    /* Content detail animations */
    .content-details {
      opacity: 0;
      transform: translateY(20px);
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
      opacity: 0.25;
    }

    .btn-portfolio-main {
      background: #00f5ff;
      color: #000000;
    }
    .btn-portfolio-sub {
      background: rgba(0, 0, 0, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #ffffff;
      backdrop-filter: blur(8px);
    }
    .btn-portfolio-sub:hover {
      background: #ffffff;
      color: #000000;
    }

    .title-accent-color {
      color: #ffffff;
      text-shadow: 0 2px 12px rgba(0, 0, 0, 0.8);
    }

    .active-dot {
      background-color: var(--text-primary, #ffffff) !important;
      opacity: 1 !important;
      width: 24px;
    }

    .card-bg-img {
      transform: scale(1.02);
    }
    .active-card:hover .card-bg-img {
      transform: scale(1.05);
    }

    :host-context(.theme-light) .carousel-card.active-card {
      border-color: rgba(0, 0, 0, 0.12);
    }

    :host-context(.theme-light) .content-details h3 {
      color: #ffffff !important;
      text-shadow: 0 2px 14px rgba(0, 0, 0, 0.9);
    }

    :host-context(.theme-light) .btn-portfolio-main {
      background: #000000;
      color: #ffffff;
    }
    :host-context(.theme-light) .btn-portfolio-main:hover {
      background: #1f2937;
    }

    :host-context(.theme-light) .btn-portfolio-sub {
      background: rgba(255, 255, 255, 0.9);
      border-color: rgba(0, 0, 0, 0.2);
      color: #111111;
      backdrop-filter: blur(8px);
    }
    :host-context(.theme-light) .btn-portfolio-sub:hover {
      background: #000000;
      color: #ffffff;
    }
  `]
})
export class PortfolioComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  @Input() projects: any[] = [];
  isLoading = true;
  currentIndex = 0;
  currentLanguage = 'es';

  onProjectClick(project: any, index: number) {
    this.goTo(index);
    const id = this.getProjectId(project);
    this.router.navigate(['/proyecto', id]);
  }

  @ViewChild('carouselTrack', { static: false }) carouselTrack?: ElementRef<HTMLDivElement>;

  translations: any = {
    es: {
      subtitle: 'Portafolio',
      title: 'Proyectos Destacados',
      viewNow: 'Ver ahora',
      defaultTag: 'Diseño Web & Sistemas',
      projectTitles: {
        'Camascotas': 'Camascotas',
        'Sysmicon': 'Sysmicon',
        'Catálogo Digital IA': 'Catálogo Digital IA',
        'Asistente IA Copiloto': 'Asistente IA Copiloto'
      },
      projectDescriptions: {
        'E-commerce de muebles y accesorios para mascotas con catálogo interactivo de productos, carrito de compras, panel de administración y diseño responsive.': 'E-commerce de muebles y accesorios para mascotas con catálogo interactivo de productos, carrito de compras, panel de administración y diseño responsive.',
        'Plataforma de gestión de proyectos de arquitectura y diseño CAD con dashboard de cotizaciones, galería visual inmersiva y comunidad profesional.': 'Plataforma de gestión de proyectos de arquitectura y diseño CAD con dashboard de cotizaciones, galería visual inmersiva y comunidad profesional.',
        'Plataforma de catálogo digital inteligente con inteligencia artificial integrada. Gestiona productos, categorías e inventario multilinea con analítica en tiempo real.': 'Plataforma de catálogo digital inteligente con inteligencia artificial integrada. Gestiona productos, categorías e inventario multilinea con analítica en tiempo real.',
        'Plataforma de administración empresarial con copiloto de inteligencia artificial integrado para responder consultas, analizar inventarios y apoyar la toma de decisiones.': 'Plataforma de administración empresarial con copiloto de inteligencia artificial integrado para responder consultas, analizar inventarios y apoyar la toma de decisiones.'
      }
    },
    en: {
      subtitle: 'Portfolio',
      title: 'Featured Projects',
      viewNow: 'View now',
      defaultTag: 'Web & Systems Design',
      projectTitles: {
        'Camascotas': 'Camascotas Pet Store',
        'Sysmicon': 'Sysmicon CAD & Architecture',
        'Catálogo Digital IA': 'Smart Digital Catalog & AI',
        'Asistente IA Copiloto': 'AI Assistant Copilot'
      },
      projectDescriptions: {
        'E-commerce de muebles y accesorios para mascotas con catálogo interactivo de productos, carrito de compras, panel de administración y diseño responsive.': 'Pet furniture e-commerce with interactive catalog, shopping cart, admin panel, and responsive design.',
        'Plataforma de gestión de proyectos de arquitectura y diseño CAD con dashboard de cotizaciones, galería visual inmersiva y comunidad profesional.': 'Architecture & CAD project management platform with quote dashboard, visual gallery, and professional community.',
        'Plataforma de catálogo digital inteligente con inteligencia artificial integrada. Gestiona productos, categorías e inventario multilinea con analítica en tiempo real.': 'Smart digital catalog platform with integrated AI. Manages multi-line products, categories, and inventory with real-time analytics.',
        'Plataforma de administración empresarial con copiloto de inteligencia artificial integrado para responder consultas, analizar inventarios y apoyar la toma de decisiones.': 'Business management platform with integrated AI copilot to answer queries, analyze inventory, and support decision making.'
      }
    }
  };

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.currentLanguage = localStorage.getItem('portfolio-language') || 'es';
      window.addEventListener('portfolio-language-change', this.onLanguageChange);
    }
    
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

  getProjectId(project: any): string {
    if (project.id) return project.id;
    const title = (project.title || '').toLowerCase();
    if (title.includes('camascotas')) return 'camascotas';
    if (title.includes('sysmicon')) return 'sysmicon';
    if (title.includes('catálogo') || title.includes('catalogo')) return 'catalogodigital';
    if (title.includes('colchones') || title.includes('districol')) return 'districol';
    if (title.includes('asistente') || title.includes('copiloto')) return 'asistente-ia';
    if (title.includes('íntima') || title.includes('intima')) return 'tiendaintima';
    return 'camascotas';
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('portfolio-language-change', this.onLanguageChange);
    }
  }

  onTrackScroll() {
    if (!this.carouselTrack) return;
    const track = this.carouselTrack.nativeElement;
    const cardElements = track.querySelectorAll('.carousel-card');
    if (!cardElements || cardElements.length === 0) return;

    const trackCenter = track.scrollLeft + track.clientWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    cardElements.forEach((cardNode, idx) => {
      const card = cardNode as HTMLElement;
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const distance = Math.abs(trackCenter - cardCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = idx;
      }
    });

    if (this.currentIndex !== closestIndex) {
      this.currentIndex = closestIndex;
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.goTo(this.currentIndex - 1);
    }
  }

  next() {
    if (this.currentIndex < this.projects.length - 1) {
      this.goTo(this.currentIndex + 1);
    }
  }

  goTo(index: number) {
    this.currentIndex = index;
    if (!this.carouselTrack) return;
    const track = this.carouselTrack.nativeElement;
    const cardElements = track.querySelectorAll('.carousel-card');
    if (cardElements && cardElements[index]) {
      const card = cardElements[index] as HTMLElement;
      const targetLeft = card.offsetLeft - (track.clientWidth - card.clientWidth) / 2;
      track.scrollTo({
        left: targetLeft,
        behavior: 'smooth'
      });
    }
  }
}
