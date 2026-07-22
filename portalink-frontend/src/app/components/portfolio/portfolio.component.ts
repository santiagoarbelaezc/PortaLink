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

        <!-- Native Smooth Horizontal Scroll Container -->
        <div #carouselTrack
             (scroll)="onTrackScroll()"
             class="carousel-scroll-track flex items-center gap-4 sm:gap-6 md:gap-8 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar py-6 px-2 -mx-2 select-none overscroll-x-contain">
          
          <div *ngFor="let project of projects; let i = index"
               (click)="goTo(i)"
               [class.active-card]="i === currentIndex"
               [class.inactive-card]="i !== currentIndex"
               class="carousel-card snap-center relative flex-shrink-0 w-[88vw] sm:w-[78vw] lg:w-[850px] aspect-[4/3] sm:aspect-[16/9] rounded-[24px] sm:rounded-[36px] overflow-hidden border border-white/10 transition-all duration-500 cursor-pointer">
            
            <!-- Background Image -->
            <img [src]="project.images && project.images.length > 0 ? project.images[0] : 'assets/images/fotos/photo2.jpg'" 
                 [alt]="getProjectTitle(project)" 
                 class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 card-bg-img" />
            
            <!-- Cinematic Gradient Vignette (Lighter) -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent sm:bg-gradient-to-r sm:from-black/75 sm:via-black/30 sm:to-transparent transition-opacity duration-700 content-overlay"></div>

            <!-- Active Card Content (Only fully visible on active card) -->
            <div class="absolute inset-0 flex flex-col justify-end p-5 sm:p-12 lg:p-14 text-left transition-all duration-700 content-details">
              
               <!-- Tag / Category -->
              <span class="text-[10px] sm:text-[11px] uppercase tracking-[0.4em] font-bold block mb-2 sm:mb-4" style="color: rgba(255, 255, 255, 0.6);">
                {{ getTranslation().defaultTag }}
              </span>

              <!-- Massive Bold Headline -->
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
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25), 0 0 25px rgba(0, 245, 255, 0.12);
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
      opacity: 1;
    }

    .title-accent-color {
      color: #ffffff;
    }
    .title-glow {
      text-shadow: 0 0 35px rgba(255, 255, 255, 0.1);
    }

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
export class PortfolioComponent implements OnInit, OnDestroy {
  @Input() projects: any[] = [];
  isLoading = true;
  currentIndex = 0;
  currentLanguage = 'es';

  @ViewChild('carouselTrack', { static: false }) carouselTrack?: ElementRef<HTMLDivElement>;

  translations: any = {
    es: {
      subtitle: 'Portafolio',
      title: 'Proyectos Destacados',
      viewNow: 'Ver ahora',
      defaultTag: 'Diseño Web & Sistemas',
      projectTitles: {
        'Camascotas': 'Camascotas',
        'Sysmicon Portal IA': 'Sysmicon Portal IA',
        'Sysmicon Catálogo IA': 'Sysmicon Portal IA',
        'Asistente IA Copiloto': 'Asistente IA Copiloto'
      },
      projectDescriptions: {
        'E-commerce de muebles y accesorios para mascotas con catálogo interactivo de productos, carrito de compras, panel de administración y diseño responsive.': 'E-commerce de muebles y accesorios para mascotas con catálogo interactivo de productos, carrito de compras, panel de administración y diseño responsive.',
        'Plataforma de catálogo digital inteligente y portal empresarial con inteligencia artificial integrada. Gestiona productos, categorías e inventario multilinea con analítica en tiempo real.': 'Plataforma de catálogo digital inteligente y portal empresarial con inteligencia artificial integrada. Gestiona productos, categorías e inventario multilinea con analítica en tiempo real.',
        'Plataforma de catálogo digital inteligente con inteligencia artificial integrada. Gestiona productos, categorías e inventario multilinea con analítica en tiempo real.': 'Plataforma de catálogo digital inteligente y portal empresarial con inteligencia artificial integrada. Gestiona productos, categorías e inventario multilinea con analítica en tiempo real.',
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
        'Sysmicon Portal IA': 'Sysmicon Portal & AI Catalog',
        'Sysmicon Catálogo IA': 'Sysmicon Portal & AI Catalog',
        'Asistente IA Copiloto': 'AI Assistant Copilot'
      },
      projectDescriptions: {
        'E-commerce de muebles y accesorios para mascotas con catálogo interactivo de productos, carrito de compras, panel de administración y diseño responsive.': 'Pet furniture e-commerce with interactive catalog, shopping cart, admin panel, and responsive design.',
        'Plataforma de catálogo digital inteligente y portal empresarial con inteligencia artificial integrada. Gestiona productos, categorías e inventario multilinea con analítica en tiempo real.': 'Smart digital catalog & business portal with integrated AI. Manages multi-line products, categories, and inventory with real-time analytics.',
        'Plataforma de catálogo digital inteligente con inteligencia artificial integrada. Gestiona productos, categorías e inventario multilinea con analítica en tiempo real.': 'Smart digital catalog & business portal with integrated AI. Manages multi-line products, categories, and inventory with real-time analytics.',
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
