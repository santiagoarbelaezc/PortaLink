import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MagneticDirective } from '../../shared/directives/magnetic.directive';

@Component({
    selector: 'app-hero',
    standalone: true,
    imports: [CommonModule, MagneticDirective],
    template: `
    <section id="hero" class="relative min-h-screen w-full flex items-center justify-center overflow-hidden">

      <div class="container mx-auto px-6 pt-20 pb-28 md:pt-32 md:pb-0 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
        <!-- Text Content -->
        <div class="order-2 lg:order-1">
          <div class="flex items-center gap-4 mb-4">
            <div class="h-px w-10" style="background-color: var(--text-primary); opacity: 0.4;"></div>
            <span class="text-[10px] uppercase tracking-[0.4em] font-bold" style="color: var(--text-secondary);">
              CREATIVE DEVELOPER
            </span>
          </div>

          <h1 class="text-5xl sm:text-7xl md:text-[80px] font-headline uppercase leading-[0.95] tracking-tighter mb-6 md:mb-8">
            <span style="color: var(--text-primary);">Soy </span>
            <span style="color: var(--text-secondary);">Santiago Arbelaez.</span>
          </h1>
          
          <p class="text-base md:text-lg max-w-xl mb-10" style="color: var(--text-secondary); line-height: 1.65;">
            Creador de contenido, diseñador y desarrollador. Ayudo a negocios a comunicar mejor lo que hacen y a construir su presencia digital desde cero.
          </p>

          <!-- Offerings List (2x2 Grid) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-12">
            <div class="flex items-center gap-3 font-headline uppercase text-[11px] font-extrabold tracking-widest" style="color: var(--text-secondary);">
              <span class="w-1.5 h-1.5 rounded-none flex-shrink-0" style="background-color: var(--accent-color);"></span>
              <span>e-commerce desde 0</span>
            </div>
            <div class="flex items-center gap-3 font-headline uppercase text-[11px] font-extrabold tracking-widest" style="color: var(--text-secondary);">
              <span class="w-1.5 h-1.5 rounded-none flex-shrink-0" style="background-color: var(--accent-color);"></span>
              <span>integración con IA</span>
            </div>
            <div class="flex items-center gap-3 font-headline uppercase text-[11px] font-extrabold tracking-widest" style="color: var(--text-secondary);">
              <span class="w-1.5 h-1.5 rounded-none flex-shrink-0" style="background-color: var(--accent-color);"></span>
              <span>aplicaciones móviles</span>
            </div>
            <div class="flex items-center gap-3 font-headline uppercase text-[11px] font-extrabold tracking-widest" style="color: var(--text-secondary);">
              <span class="w-1.5 h-1.5 rounded-none flex-shrink-0" style="background-color: var(--accent-color);"></span>
              <span>dashboard administrativo</span>
            </div>
          </div>

          <div class="flex gap-4">
            <a (click)="scrollTo('#portfolio', $event)" 
               class="cta-button group cursor-pointer no-underline">
               <span class="cta-text">{{ data?.ctaText || 'Ver Proyectos' }}</span>
               <div class="cta-icon-wrapper">
                 <svg class="cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                   <path d="M7 17L17 7M17 7H7M17 7V17" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                 </svg>
               </div>
            </a>
          </div>
        </div>

        <!-- Apple Product Cards Column -->
        <div class="order-1 lg:order-2 w-full py-6 overflow-visible">
          <!-- Horizontal Scroll Wrapper -->
          <div class="flex gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-6 w-full px-6 md:px-8 scroll-pl-6 md:scroll-pl-8">
            <!-- Card Loop -->
            <div *ngFor="let card of cards" 
                 class="snap-start shrink-0 w-[290px] sm:w-[330px] flex flex-col items-center text-center lg:items-start lg:text-left">
              <!-- Card Image Box (Taller and Larger) -->
              <div class="relative w-full aspect-[3/4.2] rounded-[24px] sm:rounded-[32px] overflow-hidden border transition-all duration-500 shadow-xl group"
                   [style.background]="'var(--card-bg)'"
                   [style.borderColor]="'var(--card-border)'">
                <img
                  [src]="card.options[card.activeIndex].src"
                  [alt]="card.title"
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
              </div>
              
              <!-- Color Selector Dots -->
              <div class="flex justify-center lg:justify-start items-center gap-2 mt-4 mb-3 h-5">
                <button *ngFor="let opt of card.options; let oIdx = index"
                        (click)="card.activeIndex = oIdx"
                        class="w-4 h-4 rounded-full transition-all duration-300 focus:outline-none flex items-center justify-center relative cursor-pointer"
                        [class.scale-110]="card.activeIndex === oIdx">
                  <!-- The color dot itself -->
                  <span class="w-2.5 h-2.5 rounded-full block" [style.backgroundColor]="opt.color"></span>
                  <!-- Apple-style outer ring if selected -->
                  <span *ngIf="card.activeIndex === oIdx" 
                        class="absolute -inset-0.5 rounded-full border border-gray-400 dark:border-gray-500">
                  </span>
                </button>
              </div>

              <!-- Product Details -->
              <h3 class="text-lg md:text-xl font-sans font-bold tracking-tight mb-2" style="color: var(--text-primary);">
                {{ card.title }}
              </h3>
              <p class="text-xs md:text-sm leading-relaxed" style="color: var(--text-secondary);">
                {{ card.description }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 flex-col items-center gap-2" style="opacity: 0.35;">
        <span class="text-[10px] uppercase tracking-[0.3em]" style="color: var(--text-secondary);">Scroll</span>
        <div class="w-px h-12" style="background: linear-gradient(to bottom, var(--text-secondary), transparent);"></div>
      </div>
    </section>
  `,
    styles: [`
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
export class HeroComponent {
  @Input() data: any;

  cards = [
    {
      title: 'E-commerce desde 0',
      description: 'Plataformas de venta online a medida, rápidas y optimizadas para conversión.',
      activeIndex: 0,
      options: [
        { src: 'project-1.png', color: '#E36B2B' }, // Orange-ish
        { src: 'project-2.png', color: '#1E3A8A' }, // Dark Blue
        { src: 'project-3.png', color: '#3B82F6' }  // Light Blue
      ]
    },
    {
      title: 'Integración IA',
      description: 'Automatización de procesos y agentes inteligentes con modelos de lenguaje.',
      activeIndex: 0,
      options: [
        { src: 'about-portrait.png', color: '#3B82F6' }, // Light Blue
        { src: 'hero-portrait.png', color: '#E2E8F0' },  // White/Silver
        { src: 'project-1.png', color: '#0F172A' }       // Dark Gray/Black
      ]
    },
    {
      title: 'Aplicaciones Móviles',
      description: 'Experiencias nativas e híbridas fluidas con soporte multiplataforma.',
      activeIndex: 0,
      options: [
        { src: 'project-3.png', color: '#A78BFA' }, // Light Purple
        { src: 'project-2.png', color: '#86EFAC' }, // Light Green
        { src: 'project-1.png', color: '#93C5FD' }  // Soft Blue
      ]
    },
    {
      title: 'Dashboard Administrativo',
      description: 'Paneles de control modernos para gestionar tu negocio en tiempo real.',
      activeIndex: 0,
      options: [
        { src: 'project-2.png', color: '#F43F5E' }, // Rose
        { src: 'project-3.png', color: '#14B8A6' }, // Teal
        { src: 'hero-portrait.png', color: '#1E293B' } // Dark Slate
      ]
    },
    {
      title: 'Diseño UI/UX',
      description: 'Interfaces interactivas y flujos de usuario diseñados para enamorar.',
      activeIndex: 0,
      options: [
        { src: 'about-portrait.png', color: '#EC4899' }, // Pink
        { src: 'project-1.png', color: '#F59E0B' }, // Amber
        { src: 'project-2.png', color: '#10B981' }  // Green
      ]
    },
    {
      title: 'Optimización SEO',
      description: 'Estrategias de posicionamiento web para maximizar tu tráfico orgánico.',
      activeIndex: 0,
      options: [
        { src: 'project-3.png', color: '#6366F1' }, // Indigo
        { src: 'about-portrait.png', color: '#8B5CF6' }, // Violet
        { src: 'hero-portrait.png', color: '#6B7280' }  // Gray
      ]
    }
  ];

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
