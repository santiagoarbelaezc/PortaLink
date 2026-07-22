import { Component, Input, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MagneticDirective } from '../../shared/directives/magnetic.directive';
 
@Component({
    selector: 'app-hero',
    standalone: true,
    imports: [CommonModule],
    encapsulation: ViewEncapsulation.None,
    template: `
    <ng-container *ngIf="!isLoading; else skeleton">
      <section id="hero" class="relative min-h-screen w-full flex items-center justify-center overflow-hidden">

      <div class="container mx-auto px-6 pt-20 pb-28 md:pt-32 md:pb-0 grid grid-cols-1 lg:grid-cols-[42%_58%] gap-8 md:gap-12 items-center relative z-10">
        <!-- Text Content -->
        <div class="w-full">
          <div class="flex items-center gap-4 mb-4">
            <div class="h-px w-10" style="background-color: var(--text-primary); opacity: 0.4;"></div>
            <span class="text-[10px] uppercase tracking-[0.4em] font-bold" style="color: var(--text-secondary);">
              {{ getTranslation().subtitle }}
            </span>
          </div>

          <h1 class="text-5xl sm:text-7xl md:text-[80px] font-headline uppercase leading-[0.95] tracking-tighter mb-6 md:mb-8 hero-title">
            <span class="title-soy">{{ getTranslation().soy }}</span>
            <span class="title-name">Santiago Arbelaez.</span>
          </h1>
          
          <p class="text-base md:text-lg max-w-xl mb-10" style="color: var(--text-secondary); line-height: 1.65;">
            {{ getTranslation().description }}
          </p>
 
          <!-- Offerings List (2x2 Grid of Pills) -->
          <div class="grid grid-cols-2 gap-3 mb-12 w-full max-w-xl">
            <div *ngFor="let offering of getTranslation().offerings" 
                 class="px-4 py-3.5 rounded-xl cursor-default transition-all duration-500 border border-white/10 bg-white/[0.02] backdrop-blur-md hover:bg-white/[0.07] hover:border-white/25 hover:-translate-y-0.5 flex items-center justify-center text-center">
              <span class="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-medium text-white/60 transition-colors">{{ offering }}</span>
            </div>
          </div>
 
          <div class="flex gap-4">
            <a (click)="scrollTo('#portfolio', $event)" 
               class="cta-button group cursor-pointer no-underline">
               <span class="cta-text">{{ getCtaText() }}</span>
               <div class="cta-icon-wrapper">
                 <svg class="cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                   <path d="M7 17L17 7M17 7H7M17 7V17" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                 </svg>
               </div>
            </a>
          </div>
        </div>
 
        <!-- Single Large Featured Showcase Image Column -->
        <div class="w-full py-4 flex flex-col items-center lg:items-start">
          <div class="relative w-full aspect-[16/10] rounded-[28px] sm:rounded-[36px] overflow-hidden border transition-all duration-500 shadow-2xl group border-white/10 hover:border-[#00f5ff]/40">
            <img
               src="assets/images/proyectos/proyecto-0.png"
               alt="Portalink Ecosystem"
               class="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
          </div>
        </div>
      </div>
      </section>
    </ng-container>

    <ng-template #skeleton>
      <section class="relative min-h-screen w-full flex items-center justify-center overflow-hidden animate-pulse">
        <div class="container mx-auto px-6 pt-20 pb-28 md:pt-32 md:pb-0 grid grid-cols-1 lg:grid-cols-[42%_58%] gap-8 md:gap-12 items-center relative z-10">
          
          <!-- Text Skeleton -->
          <div class="w-full space-y-6">
            <div class="flex items-center gap-4">
              <div class="h-px w-10 opacity-20" style="background-color: var(--text-primary);"></div>
              <div class="h-3 w-32 rounded-full opacity-20" style="background-color: var(--text-primary);"></div>
            </div>
            
            <div class="space-y-4">
              <div class="h-16 md:h-20 w-3/4 rounded-2xl opacity-20" style="background-color: var(--text-primary);"></div>
              <div class="h-16 md:h-20 w-1/2 rounded-2xl opacity-20" style="background-color: var(--text-primary);"></div>
            </div>
            
            <div class="space-y-3 pt-4">
              <div class="h-4 w-full rounded-full opacity-10" style="background-color: var(--text-primary);"></div>
              <div class="h-4 w-5/6 rounded-full opacity-10" style="background-color: var(--text-primary);"></div>
              <div class="h-4 w-4/6 rounded-full opacity-10" style="background-color: var(--text-primary);"></div>
            </div>
            
            <div class="grid grid-cols-2 gap-3 pt-6 w-full max-w-xl">
              <div class="h-12 w-full rounded-xl opacity-5" style="background-color: var(--text-primary);"></div>
              <div class="h-12 w-full rounded-xl opacity-5" style="background-color: var(--text-primary);"></div>
              <div class="h-12 w-full rounded-xl opacity-5" style="background-color: var(--text-primary);"></div>
              <div class="h-12 w-full rounded-xl opacity-5" style="background-color: var(--text-primary);"></div>
            </div>
            
            <div class="pt-6">
              <div class="h-16 w-48 rounded-full opacity-20" style="background-color: var(--text-primary);"></div>
            </div>
          </div>
          
          <!-- Cards Skeleton -->
          <div class="w-full py-6 overflow-hidden lg:-ml-8 xl:-ml-14 flex items-center">
            <div class="flex gap-6 pb-6 w-full px-6 md:px-8">
              <div *ngFor="let _ of [1,2,3]" class="shrink-0 w-[270px] sm:w-[310px] space-y-4">
                <div class="w-full aspect-[3/4.2] rounded-[24px] sm:rounded-[32px] opacity-10 shadow-xl" style="background-color: var(--text-primary);"></div>
                
                <div class="flex gap-2 justify-center lg:justify-start">
                  <div class="h-3 w-3 rounded-full opacity-20" style="background-color: var(--text-primary);"></div>
                  <div class="h-3 w-3 rounded-full opacity-20" style="background-color: var(--text-primary);"></div>
                  <div class="h-3 w-3 rounded-full opacity-20" style="background-color: var(--text-primary);"></div>
                </div>
                
                <div class="h-5 w-3/4 rounded-full mx-auto lg:mx-0 opacity-20" style="background-color: var(--text-primary);"></div>
                <div class="h-3 w-full rounded-full mx-auto lg:mx-0 opacity-10" style="background-color: var(--text-primary);"></div>
                <div class="h-3 w-5/6 rounded-full mx-auto lg:mx-0 opacity-10" style="background-color: var(--text-primary);"></div>
              </div>
            </div>
          </div>
          
        </div>
      </section>
    </ng-template>
  `,
    styles: [`
    .hero-title .title-soy {
      color: #a3a3a3;
    }
    .hero-title .title-name {
      color: #ffffff;
    }
    .theme-light .hero-title .title-soy {
      color: #000000;
    }
    .theme-light .hero-title .title-name {
      color: #333333;
    }
    .cta-button {
      display: inline-flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1.25rem 2.5rem;
      background: #000;
      color: #fff;
      border-radius: 9999px;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(255,255,255,0.1);
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    }
 
    .cta-button::before {
      content: '';
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: #FFFFFF;
      transform: translateY(100%);
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 0;
    }
 
    .cta-button:hover::before {
      transform: translateY(0);
    }
 
    .cta-text {
      position: relative;
      z-index: 1;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      font-size: 0.75rem;
      transition: color 0.4s;
    }
 
    .cta-button:hover .cta-text {
      color: #000;
    }
 
    .cta-icon-wrapper {
      position: relative;
      z-index: 1;
      width: 20px; height: 20px;
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
 
    .cta-button:hover .cta-icon-wrapper {
      transform: translate(3px, -3px);
    }
 
    .cta-icon {
      width: 100%; height: 100%;
      stroke: #fff;
      transition: stroke 0.4s;
    }
 
    .cta-button:hover .cta-icon {
      stroke: #000;
    }
 
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `]
})
export class HeroComponent implements OnInit, OnDestroy {
  @Input() data: any;
  isLoading = true;

  currentLanguage = 'es';

  translations: any = {
    es: {
      subtitle: 'CREADOR DIGITAL',
      soy: 'Soy ',
      description: 'Creador de contenido, diseñador y desarrollador. Ayudo a negocios a comunicar mejor lo que hacen y a construir su presencia digital desde cero.',
      offerings: [
        'e-commerce desde 0',
        'integración con IA',
        'aplicaciones móviles',
        'dashboard administrativo'
      ],
      ctaText: 'Ver Proyectos',
      featured: {
        title: 'Portalink Ecosystem',
        description: 'Plataforma integral multinegocio a medida con diseño exclusivo e Inteligencia Artificial.'
      },
      cards: [
        {
          title: 'E-commerce desde 0',
          description: 'Plataformas de venta online a medida, rápidas y optimizadas para conversión.'
        },
        {
          title: 'Integración IA Copiloto',
          description: 'Automatización de procesos, catálogos inteligentes y asistentes virtuales 24/7.'
        },
        {
          title: 'Camascotas Pet Store',
          description: 'E-commerce de muebles para mascotas con catálogo interactivo y carrito dinámico.'
        },
        {
          title: 'Sysmicon Catálogo IA',
          description: 'Catálogo digital inteligente con gestión multilinea y reportes en tiempo real.'
        },
        {
          title: 'Tiendaíntima Moda & IA',
          description: 'Comercio electrónico con análisis de ventas, tienda pública y asistente inteligente.'
        }
      ]
    },
    en: {
      subtitle: 'DIGITAL CREATOR',
      soy: 'I am ',
      description: 'Content creator, designer, and developer. I help businesses communicate better what they do and build their digital presence from scratch.',
      offerings: [
        'e-commerce from scratch',
        'AI integration',
        'mobile applications',
        'admin dashboard'
      ],
      ctaText: 'View Projects',
      featured: {
        title: 'Portalink Ecosystem',
        description: 'Custom all-in-one platform with bespoke design and artificial intelligence.'
      },
      cards: [
        {
          title: 'E-commerce from scratch',
          description: 'Custom online sales platforms, fast and optimized for conversion.'
        },
        {
          title: 'AI Integration',
          description: 'Process automation, smart catalogs, and 24/7 virtual assistants.'
        },
        {
          title: 'Camascotas Pet Store',
          description: 'Pet furniture e-commerce with interactive catalog and dynamic cart.'
        },
        {
          title: 'Sysmicon AI Catalog',
          description: 'Smart digital catalog with multi-line management and real-time reports.'
        },
        {
          title: 'Tiendaíntima Fashion & AI',
          description: 'E-commerce with sales analytics, public store, and AI assistant.'
        }
      ]
    }
  };

  featuredCard = {
    activeIndex: 0,
    options: [
      { src: 'assets/images/proyectos/proyecto-0.png', color: '#00f5ff' },
      { src: 'assets/images/proyectos/card1.png', color: '#3B82F6' },
      { src: 'assets/images/proyectos/card2.png', color: '#8B5CF6' }
    ]
  };

  cards = [
    {
      activeIndex: 0,
      options: [
        { src: 'assets/images/proyectos/card1.png', color: '#3B82F6' },
        { src: 'assets/images/proyectos/proyecto1.png', color: '#10B981' },
        { src: 'assets/images/proyectos/proyecto2.png', color: '#F59E0B' }
      ]
    },
    {
      activeIndex: 0,
      options: [
        { src: 'assets/images/proyectos/card2.png', color: '#8B5CF6' },
        { src: 'assets/images/proyectos/proyecto3.png', color: '#EC4899' },
        { src: 'assets/images/proyectos/proyecto4.png', color: '#14B8A6' }
      ]
    },
    {
      activeIndex: 0,
      options: [
        { src: 'assets/images/proyectos/proyecto1.png', color: '#10B981' },
        { src: 'assets/images/proyectos/proyecto5.png', color: '#3B82F6' },
        { src: 'assets/images/proyectos/proyecto6.png', color: '#00f5ff' }
      ]
    },
    {
      activeIndex: 0,
      options: [
        { src: 'assets/images/proyectos/proyecto2.png', color: '#F59E0B' },
        { src: 'assets/images/proyectos/proyecto3.png', color: '#EC4899' },
        { src: 'assets/images/proyectos/proyecto-0.png', color: '#00f5ff' }
      ]
    },
    {
      activeIndex: 0,
      options: [
        { src: 'assets/images/proyectos/proyecto3.png', color: '#EC4899' },
        { src: 'assets/images/proyectos/proyecto4.png', color: '#14B8A6' },
        { src: 'assets/images/proyectos/card1.png', color: '#3B82F6' }
      ]
    }
  ];

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

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('portfolio-language-change', this.onLanguageChange);
    }
  }

  onLanguageChange = (event: any) => {
    this.currentLanguage = event.detail.language;
  };

  getTranslation() {
    return this.translations[this.currentLanguage] || this.translations['es'];
  }

  getCtaText() {
    if (this.data && this.data.ctaText) {
      if (this.currentLanguage === 'en' && this.data.ctaText === 'Ver Proyectos') {
        return 'View Projects';
      }
      return this.data.ctaText;
    }
    return this.getTranslation().ctaText;
  }

  getFeaturedTitle() {
    const t = this.getTranslation();
    return t.featured?.title || 'Portalink Ecosystem';
  }

  getFeaturedDescription() {
    const t = this.getTranslation();
    return t.featured?.description || '';
  }

  getCardTitle(index: number) {
    const t = this.getTranslation();
    return t.cards[index]?.title || '';
  }

  getCardDescription(index: number) {
    const t = this.getTranslation();
    return t.cards[index]?.description || '';
  }

  scrollTo(link: string, event: Event) {
    event.preventDefault();
    const element = document.getElementById(link.replace('#', ''));
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }
}
