import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

export interface GalleryProject {
  id: string;
  code: string;
  badge: string;
  tagline: string;
  title: string;
  category: 'Landing Page' | 'E-commerce' | 'E-commerce + IA' | 'Sistemas';
  client: string;
  image: string;
  gradient: string;
  description: string;
  highlights: string[];
  technologies: string[];
  stats: { label: string; value: string };
  rotbotPrompt: string;
}

@Component({
  selector: 'app-planes-galeria',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="h-screen w-full flex flex-col overflow-hidden font-sans page-wrapper bg-[#0a0a0a]">
      <div class="flex-grow w-full pt-20 overflow-y-auto custom-scrollbar relative">
        <!-- Fondo de color sólido optimizado (Sin desenfoques pesados para un rendimiento 60 FPS) -->
        <div class="max-w-[1760px] w-full mx-auto px-6 sm:px-12 lg:px-20 pt-8 pb-32 relative z-10">
          
          <!-- Botón Volver a Planes -->
          <div class="mb-8 flex items-center justify-between">
            <a routerLink="/planes" 
               class="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold uppercase tracking-widest text-white/80 hover:text-white transition duration-200 cursor-pointer">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <span>Volver a Paquetes</span>
            </a>

            <div class="hidden sm:flex items-center gap-2 text-xs font-mono text-white/40 uppercase tracking-widest">
              <span>PORTALINK // ARCHITECTURAL SHOWCASE</span>
            </div>
          </div>

          <!-- Encabezado de la Galería -->
          <div class="max-w-4xl mb-14">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#00f5ff]/10 border border-[#00f5ff]/30 text-[10px] uppercase tracking-[0.25em] font-mono font-bold text-[#00f5ff] mb-4">
              <span class="w-1.5 h-1.5 rounded-full bg-[#00f5ff]"></span>
              SHOWCASE DE EXCELENCIA & DISEÑO
            </div>
            <h1 class="text-4xl sm:text-6xl font-headline font-black uppercase tracking-tight text-white leading-[1.05]">
              Galería de Proyectos <span class="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-[#00f5ff]">Realizados</span>
            </h1>
            <p class="text-xs sm:text-sm text-white/60 mt-4 leading-relaxed max-w-2xl font-light">
              Explora nuestra colección de desarrollos web de alto nivel. Desde estructuras de una sola página con geometría minimalista hasta complejos sistemas de comercio electrónico impulsados por inteligencia artificial.
            </p>
          </div>

          <!-- Botones de Filtro (Categorías con Iconos SVG Premium) -->
          <div class="flex flex-wrap items-center gap-2.5 mb-14 border-b border-white/10 pb-6">
            <button *ngFor="let cat of categories; trackBy: trackByCatId"
                    (click)="setFilter(cat.id)"
                    [class.active-filter]="activeCategory === cat.id"
                    class="filter-pill px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition duration-200 cursor-pointer flex items-center gap-2.5 border">
              
              <!-- Icono SVG según categoría -->
              <span class="flex-shrink-0" [ngSwitch]="cat.id">
                <!-- Todos (Grid / Sparkles) -->
                <svg *ngSwitchCase="'Todos'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                <!-- Landing Page (Lightning / Browser) -->
                <svg *ngSwitchCase="'Landing Page'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
                <!-- E-commerce (Store / Shopping Bag) -->
                <svg *ngSwitchCase="'E-commerce'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <!-- E-commerce + IA (Brain / AI Sparkles) -->
                <svg *ngSwitchCase="'E-commerce + IA'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                </svg>
                <!-- Sistemas (CPU / Code Gears) -->
                <svg *ngSwitchCase="'Sistemas'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                </svg>
              </span>

              <span>{{ cat.label }}</span>
              
              <span *ngIf="cat.id !== 'Todos'" class="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-white/80 font-mono">
                {{ getCount(cat.id) }}
              </span>
            </button>
          </div>

          <!-- GRID ARQUITECTÓNICO VERTICAL (Exactamente 2 por nivel y más amplias) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 xl:gap-16 items-stretch">
            <div *ngFor="let project of filteredProjects; trackBy: trackById" 
                 class="group flex flex-col justify-between transition-transform duration-300 ease-out hover:-translate-y-2">
              
              <!-- CAJA DE IMAGEN VERTICAL / SHOWCASE (Más ancha y majestuosa) -->
              <div class="relative h-[480px] sm:h-[540px] lg:h-[580px] rounded-[32px] overflow-hidden border border-white/10 bg-[#0d0d0d] shadow-2xl flex flex-col justify-between p-7 sm:p-9 transition-colors duration-300 group-hover:border-[#00f5ff]/60 cursor-pointer"
                   (click)="openPreview(project)">
                
                <!-- Imagen de Fondo (Panorámica en alta definición y acelerada por GPU) -->
                <img [src]="project.image" 
                     (error)="onImgError($event)"
                     [alt]="project.title"
                     loading="lazy"
                     decoding="async" 
                     class="absolute inset-0 w-full h-full object-cover opacity-65 group-hover:opacity-90 group-hover:scale-105 transition duration-500 ease-out transform-gpu mix-blend-normal">
                
                <!-- Gradiente Cinematográfico Oscuro -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/95 sm:from-black/90 via-black/40 to-black/70 pointer-events-none"></div>
                <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent pointer-events-none"></div>

                <!-- Parte Superior del Card: #CÓDIGO y BADGE -->
                <div class="relative z-10 flex items-center justify-between w-full">
                  <span class="font-mono text-xs font-bold uppercase tracking-[0.25em] text-white/70 group-hover:text-[#00f5ff] transition-colors duration-200">
                    #{{ project.code }}
                  </span>

                  <div class="px-3.5 py-1.5 bg-white text-black font-extrabold text-[11px] uppercase tracking-widest rounded-lg shadow-md flex items-center gap-1">
                    <span>+ {{ project.badge }}</span>
                  </div>
                </div>

                <!-- Parte Inferior del Card: Tagline Poético & Título Grande -->
                <div class="relative z-10 mt-auto pt-8">
                  <!-- Tagline con línea vertical cyan -->
                  <div class="flex items-start gap-3 mb-3">
                    <div class="w-0.5 h-8 bg-[#00f5ff] flex-shrink-0 rounded-full mt-0.5"></div>
                    <p class="text-xs sm:text-sm text-white/80 font-light tracking-wide leading-relaxed">
                      {{ project.tagline }}
                    </p>
                  </div>

                  <!-- Título Grande (Proporción ampliada y majestuosa) -->
                  <h3 class="text-3xl sm:text-4xl lg:text-5xl font-headline font-black uppercase tracking-tight text-white group-hover:text-[#00f5ff] transition-colors duration-200 leading-none drop-shadow-md">
                    {{ project.title }}
                  </h3>
                </div>

                <!-- Indicador Flotante al Hover -->
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                  <div class="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[#00f5ff] text-black flex items-center justify-center shadow-[0_0_40px_rgba(0,245,255,0.8)] transform scale-90 group-hover:scale-100 transition duration-200">
                    <svg class="w-8 h-8 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>
              </div>

              <!-- ÁREA INFERIOR DE DESCRIPCIÓN Y ACCIÓN (Proporción ancha y legible) -->
              <div class="pt-6 px-2 flex flex-col justify-between flex-grow">
                <!-- Descripción detallada -->
                <p class="text-sm sm:text-[14.5px] text-white/65 font-light leading-relaxed mb-5 line-clamp-3">
                  {{ project.description }}
                </p>

                <!-- Botón minimalista de CONOCE MÁS + -->
                <div class="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
                  <button (click)="openPreview(project)"
                          class="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#00f5ff] group-hover:text-white transition-colors duration-200 flex items-center gap-2 cursor-pointer py-1">
                    <span>CONOCE MÁS</span>
                    <span class="text-lg font-extrabold">+</span>
                  </button>

                  <button (click)="selectDesign(project); $event.stopPropagation()"
                          class="px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-[#00f5ff] hover:text-black text-white/80 text-xs font-bold uppercase tracking-widest border border-white/10 transition duration-200 cursor-pointer">
                    Elegir Estilo
                  </button>
                </div>
              </div>

            </div>
          </div>

          <!-- Estado si no hay proyectos por el filtro -->
          <div *ngIf="filteredProjects.length === 0" class="text-center py-20 border border-dashed border-white/15 rounded-3xl mt-12">
            <svg class="w-12 h-12 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <h4 class="text-lg font-bold text-white">No se encontraron proyectos</h4>
            <p class="text-xs text-white/50 mt-1">Prueba seleccionando otra categoría para explorar más desarrollos.</p>
          </div>

        </div>

        <!-- MODAL DE PREVISUALIZACIÓN INTERACTIVA -->
        <div *ngIf="previewModalProject" 
             class="fixed inset-0 z-[250] flex items-center justify-center p-4 sm:p-6 bg-black/90 animate-fade-in">
          <div class="relative w-full max-w-4xl bg-[#0d0d0d] border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-up">
            
            <!-- Modal Header -->
            <div class="px-6 py-4 bg-white/[0.03] border-b border-white/10 flex items-center justify-between flex-shrink-0">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
                <span class="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
                <span class="w-3 h-3 rounded-full bg-green-500/80 inline-block"></span>
                <span class="ml-3 text-xs font-mono font-bold text-white/70 uppercase tracking-widest">
                  #{{ previewModalProject.code }} // {{ previewModalProject.category }}
                </span>
              </div>
              <button (click)="closePreview()" 
                      class="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-8">
              <!-- Showcase Header -->
              <div class="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-8 items-center">
                <div class="rounded-2xl overflow-hidden border border-white/10 h-64 sm:h-80 relative" [ngStyle]="{'background': previewModalProject.gradient}">
                  <img [src]="previewModalProject.image" 
                       (error)="onImgError($event)"
                       [alt]="previewModalProject.title"
                       loading="lazy" 
                       class="w-full h-full object-cover mix-blend-normal opacity-90">
                  <div class="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent"></div>
                  
                  <div class="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <div>
                      <span class="text-[10px] uppercase tracking-widest text-[#00f5ff] font-bold">{{ previewModalProject.client }}</span>
                      <h3 class="text-2xl sm:text-3xl font-headline font-black text-white uppercase">{{ previewModalProject.title }}</h3>
                    </div>
                  </div>
                </div>

                <div class="space-y-5">
                  <div>
                    <h4 class="text-xs uppercase tracking-widest font-bold text-white/40 mb-2">Concepto del Proyecto</h4>
                    <p class="text-sm sm:text-base text-white/80 leading-relaxed font-light">{{ previewModalProject.description }}</p>
                  </div>

                  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                    <div>
                      <span class="text-[11px] text-white/50 block font-light">Métrica de Éxito y Rendimiento</span>
                      <span class="text-base font-bold text-white">{{ previewModalProject.stats.label }}</span>
                    </div>
                    <span class="text-2xl sm:text-3xl font-headline font-extrabold text-[#00f5ff]">{{ previewModalProject.stats.value }}</span>
                  </div>

                  <div>
                    <h4 class="text-xs uppercase tracking-widest font-bold text-white/40 mb-2">Pila Tecnológica & Arquitectura</h4>
                    <div class="flex flex-wrap gap-2">
                      <span *ngFor="let tech of previewModalProject.technologies" 
                            class="px-3 py-1 rounded-xl bg-[#00f5ff]/10 border border-[#00f5ff]/30 text-xs font-semibold text-[#00f5ff]">
                        {{ tech }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Lista de Características Detallada -->
              <div class="border-t border-white/10 pt-6">
                <h4 class="text-xs uppercase tracking-widest font-bold text-white/60 mb-4">Especificaciones & Módulos Implementados</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div *ngFor="let hl of previewModalProject.highlights" class="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
                    <div class="w-6 h-6 rounded-lg bg-[#00f5ff]/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-[#00f5ff]">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <span class="text-xs sm:text-sm text-white/80 font-normal leading-snug">{{ hl }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="px-6 py-5 bg-white/[0.02] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">
              <span class="text-xs text-white/50 text-center sm:text-left font-light">
                ¿Te inspira este diseño? Podemos usarlo como base y adaptarlo al 100% con las reglas de tu negocio.
              </span>
              <div class="flex items-center gap-3 w-full sm:w-auto">
                <button (click)="closePreview()" 
                        class="px-6 py-3 rounded-xl border border-white/15 hover:bg-white/5 text-white font-bold text-xs uppercase tracking-widest transition-all cursor-pointer w-full sm:w-auto">
                  Cerrar
                </button>
                <button (click)="selectDesign(previewModalProject)" 
                        class="px-7 py-3 rounded-xl bg-[#00f5ff] hover:bg-[#00f5ff]/90 text-black font-extrabold text-xs uppercase tracking-widest transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto">
                  <span>Solicitar este Estilo</span>
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filter-pill {
      background: rgba(255, 255, 255, 0.03);
      border-color: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.7);
    }
    .filter-pill:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(0, 245, 255, 0.4);
      color: #ffffff;
    }
    .active-filter {
      background: #00f5ff !important;
      color: #000000 !important;
      border-color: #00f5ff !important;
      box-shadow: 0 0 25px rgba(0, 245, 255, 0.35);
    }
    @keyframes scaleUp {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-scale-up {
      animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class PlanesGaleriaComponent implements OnInit {
  activeCategory: string = 'Todos';
  previewModalProject: GalleryProject | null = null;

  categories = [
    { id: 'Todos', label: 'Todos los Proyectos' },
    { id: 'Landing Page', label: 'Landing Pages' },
    { id: 'E-commerce', label: 'E-commerce' },
    { id: 'E-commerce + IA', label: 'IA & Tiendas Smart' },
    { id: 'Sistemas', label: 'Sistemas & POS' }
  ];

  projects: GalleryProject[] = [
    {
      id: 'luxe-arch',
      code: 'LANDING_01',
      badge: 'DESTACADO',
      tagline: 'Geometría minimalista e intimidad visual en alta definición.',
      title: 'LUXE STUDIO',
      category: 'Landing Page',
      client: 'Estudio Luxe SA',
      image: 'assets/images/fotos/photo2.jpg',
      gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      description: 'Landing page inmersiva de una sola página diseñada para presentar proyectos arquitectónicos y creativos de alta gama con transiciones fluidas y velocidad subsegundo.',
      highlights: [
        'Sección Hero con video de alta definición de fondo y tipografía editorial',
        'Portafolio visual filtrable con cuadrícula asimétrica y modal interactivo',
        'Formulario de cotización de proyectos multi-paso con validación en vivo',
        'Optimización extrema de carga y rendimiento (Google PageSpeed 99/100)'
      ],
      technologies: ['Angular 19', 'Tailwind CSS', 'GSAP Motion', 'Stripe Ready'],
      stats: { label: 'Tasa de Conversión', value: '+54%' },
      rotbotPrompt: 'Hola, quiero desarrollar una Landing Page estilo "LUXE STUDIO" con diseño minimalista, portafolio arquitectónico y formulario de cotización para mi negocio.'
    },
    {
      id: 'aura-boutique',
      code: 'STORE_02',
      badge: 'EDITOR EN VIVO',
      tagline: 'Autogestión total y diseño modular en tiempo real.',
      title: 'AURA BOUTIQUE',
      category: 'E-commerce',
      client: 'Aura Moda & Belleza',
      image: 'assets/images/fotos/photo3.jpeg',
      gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
      description: 'Tienda en línea autopersonalizable que otorga al propietario la libertad de alterar banners, colores, tipografías y secciones estacionales sin tocar una sola línea de código.',
      highlights: [
        'Editor Visual Interactivo en tiempo real para personalizar la apariencia',
        'Catálogo de productos inteligente con filtros dinámicos por talla y color',
        'Carrito lateral deslizable optimizado para compras exprés desde móviles',
        'Panel administrativo completo para inventario, envíos y descuentos'
      ],
      technologies: ['Editor Visual', 'Angular 19', 'PHP 8.5 Backend', 'MySQL DB'],
      stats: { label: 'Ventas en Móvil', value: '78%' },
      rotbotPrompt: 'Hola, me interesa adquirir una tienda E-commerce Autopersonalizable estilo "AURA BOUTIQUE" con editor visual en vivo y carrito de compras ágil.'
    },
    {
      id: 'autoparts-ai',
      code: 'COPILOT_03',
      badge: 'IA COPILOTO',
      tagline: 'Búsqueda predictiva con asistencia guiada por inteligencia artificial.',
      title: 'MOTORSMART AI',
      category: 'E-commerce + IA',
      client: 'Grupo MotorSmart',
      image: 'assets/images/fotos/photo4.jpeg',
      gradient: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
      description: 'Comercio electrónico de alta complejidad equipado con un Copiloto Rotbot IA 24/7 que asiste a los clientes a localizar el repuesto o producto exacto en segundos.',
      highlights: [
        'Copiloto Rotbot IA que dialoga, asesora e identifica ítems por VIN o descripción',
        'Motor de búsqueda semántica con autocompletado y sugerencias inteligentes',
        'Integración con bases de datos masivas con actualización de stock en vivo',
        'Cierre de ventas asistido e inmediato vía WhatsApp o pasarela de pago'
      ],
      technologies: ['Rotbot IA 24/7', 'Angular', 'REST API', 'Smart Search'],
      stats: { label: 'Atención Automática', value: '94%' },
      rotbotPrompt: 'Hola, quiero una tienda E-commerce + IA estilo "MOTORSMART AI" con un asistente de inteligencia artificial 24/7 que recomiende y venda mis productos.'
    },
    {
      id: 'fitpulse-gym',
      code: 'LANDING_04',
      badge: 'ALTA CONVERSIÓN',
      tagline: 'Interfaz motivadora enfocada en captación y reservas directas.',
      title: 'FITPULSE GYM',
      category: 'Landing Page',
      client: 'FitPulse Club',
      image: 'assets/images/fotos/principal.jpg',
      gradient: 'linear-gradient(135deg, #cb2d3e 0%, #ef476f 100%)',
      description: 'Sitio web de alto impacto para centros deportivos, spas o consultorios, incorporando herramientas de cálculo en vivo y agendamiento directo de citas o clases.',
      highlights: [
        'Diseño visual enérgico con modo oscuro nativo y alto contraste lumínico',
        'Calculadora de objetivos fitness / IMC interactiva para el visitante',
        'Grilla de clases en vivo y reserva inmediata conectada a WhatsApp y calendario',
        'Sección audiovisual de testimonios e historias de éxito verificadas'
      ],
      technologies: ['Angular 19', 'Responsive Mobile', 'WhatsApp API', 'SEO Score 100'],
      stats: { label: 'Nuevos Clientes/Mes', value: '+120' },
      rotbotPrompt: 'Hola, me gustaría tener una Landing Page estilo "FITPULSE GYM" enfocada en captar prospectos, mostrar servicios y permitir reservas directas.'
    },
    {
      id: 'nova-bio',
      code: 'SMART_05',
      badge: 'TEST IA',
      tagline: 'Diagnosticador facial y rutina de compra personalizada por IA.',
      title: 'NOVA COSMETICS',
      category: 'E-commerce + IA',
      client: 'Nova Bio Lab',
      image: 'assets/images/fotos/link-principal.jpg',
      gradient: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
      description: 'Plataforma de comercio electrónico con inteligencia artificial que realiza un diagnóstico virtual a los clientes para construir y recomendarles una rutina a su medida.',
      highlights: [
        'Cuestionario interactivo guiado por IA para recomendar productos precisos',
        'Editor autopersonalizable para campañas de lanzamiento y promociones',
        'Módulo de suscripción de entregas mensuales con cobro automático recurrente',
        'Analítica avanzada del comportamiento de compra y fidelización'
      ],
      technologies: ['Rotbot IA', 'Suscripciones', 'Autopersonalizable', 'UX Premium'],
      stats: { label: 'Ticket Promedio', value: '+38%' },
      rotbotPrompt: 'Hola, quiero crear una tienda E-commerce + IA estilo "NOVA COSMETICS" con diagnóstico guiado y recomendaciones personalizadas por inteligencia artificial.'
    },
    {
      id: 'restaurant-pos',
      code: 'SYSTEM_06',
      badge: 'SISTEMA POS',
      tagline: 'Control total de comandas, menú digital QR y cocina en vivo.',
      title: 'ROTBOT POS & KDS',
      category: 'Sistemas',
      client: 'Gourmet Tech Holdings',
      image: 'assets/images/rotbot.png',
      gradient: 'linear-gradient(135deg, #b92b27 0%, #1565C0 100%)',
      description: 'Sistema integral de gestión para restaurantes y franquicias. Integra menú digital interactivo, toma de pedidos en mesa por tablet, pantalla de cocina (KDS) y facturación.',
      highlights: [
        'Menú digital QR autogestionable con fotografías HD, alérgenos y precios en vivo',
        'App para mozos con envío instantáneo de comandas a la pantalla de cocina (KDS)',
        'Facturación rápida, control de mesas, división de cuentas y cuadre de caja',
        'Arquitectura robusta con soporte local offline por si falla la conexión'
      ],
      technologies: ['POS Sistema', 'Real-Time KDS', 'QR Dinámico', 'PHP/MySQL'],
      stats: { label: 'Tiempo de Pedido', value: '-65%' },
      rotbotPrompt: 'Hola, necesito una solución de Sistema a Medida o POS estilo "ROTBOT POS & KDS" para gestionar mesas, pedidos, menú digital y ventas de mi negocio.'
    }
  ];

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['categoria']) {
        this.activeCategory = params['categoria'];
      }
    });
  }

  get filteredProjects(): GalleryProject[] {
    if (this.activeCategory === 'Todos') {
      return this.projects;
    }
    return this.projects.filter(p => p.category === this.activeCategory);
  }

  getCount(categoryId: string): number {
    if (categoryId === 'Todos') return this.projects.length;
    return this.projects.filter(p => p.category === categoryId).length;
  }

  setFilter(categoryId: string) {
    this.activeCategory = categoryId;
  }

  openPreview(project: GalleryProject) {
    this.previewModalProject = project;
    document.body.style.overflow = 'hidden';
  }

  closePreview() {
    this.previewModalProject = null;
    document.body.style.overflow = 'auto';
  }

  selectDesign(project: GalleryProject) {
    this.closePreview();
    if (project.category === 'E-commerce') {
      this.router.navigate(['/personalizar']);
    } else {
      this.router.navigate(['/rotbot']).then(() => {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('open-ai-chat', { detail: { message: project.rotbotPrompt } }));
        }, 500);
      });
    }
  }

  onImgError(event: Event) {
    const el = event.target as HTMLImageElement;
    el.style.display = 'none';
  }

  trackById(index: number, item: GalleryProject): string {
    return item.id;
  }

  trackByCatId(index: number, item: any): string {
    return item.id;
  }
}
