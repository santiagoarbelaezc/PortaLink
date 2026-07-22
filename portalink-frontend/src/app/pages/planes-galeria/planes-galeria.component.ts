import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

export interface GalleryProject {
  id: string;
  code: string;
  badge: string;
  tagline: string;
  title: string;
  category: 'Landing Page' | 'E-commerce' | 'E-commerce + IA' | 'Sistemas' | 'Sistemas + IA';
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
              Galería de Proyectos Realizados
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
                <!-- Todos (Grid) -->
                <svg *ngSwitchCase="'Todos'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                <!-- E-commerce (Shopping Bag) -->
                <svg *ngSwitchCase="'E-commerce'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <!-- E-commerce + IA (Sparkles) -->
                <svg *ngSwitchCase="'E-commerce + IA'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                </svg>
                <!-- Sistemas & Portales (Server / CPU) -->
                <svg *ngSwitchCase="'Sistemas'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
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
                
                <!-- Imagen de Fondo (Screenshot del proyecto - Proporcional como el referente) -->
                 <img [src]="project.image" 
                      (error)="onImgError($event)"
                      [alt]="project.title"
                      loading="lazy"
                      decoding="async" 
                      class="absolute inset-0 w-full h-full object-cover object-top opacity-75 group-hover:opacity-100 group-hover:scale-105 transition duration-500 ease-out transform-gpu">
                
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
    { id: 'E-commerce', label: 'E-commerce' },
    { id: 'E-commerce + IA', label: 'IA & Smart Stores' },
    { id: 'Sistemas', label: 'Sistemas & Portales' }
  ];

  projects: GalleryProject[] = [
    {
      id: 'camascotas',
      code: 'ECOM_01',
      badge: 'E-COMMERCE',
      tagline: 'Tienda de mobiliario premium para mascotas con catálogo interactivo.',
      title: 'CAMASCOTAS',
      category: 'E-commerce',
      client: 'Camascotas Pet Premium',
      image: 'assets/images/proyectos/proyecto-camascotas.png',
      gradient: 'linear-gradient(135deg, #0a2e1a 0%, #1a4a2e 100%)',
      description: 'E-commerce de muebles y accesorios para mascotas con catálogo de productos, carrito de compras, panel de administración y diseño responsive. Desarrollado con Angular + PHP/MySQL.',
      highlights: [
        'Catálogo de productos filtrable por categorías (perros, gatos, accesorios)',
        'Carrito de compras lateral optimizado para conversión en móvil',
        'Panel de administración completo para inventario y pedidos',
        'Hero animado con colecciones destacadas y llamadas a la acción'
      ],
      technologies: ['Angular 19', 'PHP 8.5', 'MySQL', 'Responsive'],
      stats: { label: 'Productos en Catálogo', value: '+120' },
      rotbotPrompt: 'Hola, quiero una tienda E-commerce como CAMASCOTAS con catálogo de productos, carrito de compras y panel de administración para mi negocio.'
    },
    {
      id: 'sysmicon-catalogo',
      code: 'SYS_02',
      badge: 'PLATAFORMA',
      tagline: 'Portal directivo para gestión de proyectos de arquitectura y diseño CAD.',
      title: 'SYSMICON',
      category: 'Sistemas',
      client: 'Sysmicon / Plataforma de Arquitectura',
      image: 'assets/images/proyectos/proyecto-sysmiconarquitectura.png',
      gradient: 'linear-gradient(135deg, #0d1f0d 0%, #1a3a1a 100%)',
      description: 'Plataforma directiva para estudios de arquitectura con dashboard de cotizaciones, diseños CAD 2D, galería de proyectos visual y módulo de mensajería.',
      highlights: [
        'Dashboard directivo con métricas de cotizaciones, diseños y pipeline estimado',
        'Galería de proyectos inmersiva con cards de casas y edificios en construcción',
        'Módulo CAD 2D con seguimiento de diseños y actividad en tiempo real',
        'Comunidad de arquitectos con perfiles, mensajería y colaboración'
      ],
      technologies: ['Angular 19', 'PHP 8.5', 'MySQL', 'CAD Studio'],
      stats: { label: 'Proyectos Gestionados', value: '+50' },
      rotbotPrompt: 'Hola, necesito una plataforma de gestión de proyectos con dashboard ejecutivo y galería visual, similar a SYSMICON.'
    },
    {
      id: 'catalogodigital',
      code: 'SYS_03',
      badge: 'SISTEMA + IA',
      tagline: 'Catálogo digital inteligente con gestión de productos y analítica en tiempo real.',
      title: 'CATÁLOGO DIGITAL',
      category: 'Sistemas + IA',
      client: 'Plastilíneas / Districol',
      image: 'assets/images/proyectos/proyecto-catalogodigital.png',
      gradient: 'linear-gradient(135deg, #0d1f0d 0%, #1a3a1a 100%)',
      description: 'Plataforma de catálogo digital con inteligencia artificial integrada. Gestiona productos, categorías e inventario para múltiples líneas de negocio con reportes analíticos y asistente IA.',
      highlights: [
        'Asistente IA para generar descripciones y clasificar productos automáticamente',
        'Dashboard con analítica de completitud del catálogo en tiempo real',
        'Gestión multilinea: Plastilineas, Espumas y Districol unificados',
        'Control de calidad con métricas de productos incompletos o sin imagen'
      ],
      technologies: ['Angular 19', 'PHP 8.5', 'MySQL', 'Groq IA'],
      stats: { label: 'Productos Gestionados', value: '119+' },
      rotbotPrompt: 'Hola, necesito un sistema de catálogo digital con inteligencia artificial para gestionar mis productos, similar a CATÁLOGO DIGITAL.'
    },
    {
      id: 'districol',
      code: 'ECOM_04',
      badge: 'E-COMMERCE',
      tagline: 'Tienda de colchones premium con gestión de catálogo y consulta por WhatsApp.',
      title: 'COLCHONES DISTRICOL',
      category: 'E-commerce',
      client: 'Districol / Colchones Armenia',
      image: 'assets/images/proyectos/proyecto-colchonesdistricol.png',
      gradient: 'linear-gradient(135deg, #0a1a2a 0%, #1a3a4a 100%)',
      description: 'E-commerce de colchones y muebles de descanso premium para Armenia con catálogo completo, detalle de productos, consulta por WhatsApp e integración con el sistema administrativo de inventario.',
      highlights: [
        'Catálogo visual de colchones con fotografías HD y especificaciones técnicas',
        'Detalle de producto con precio, stock disponible y consulta directa por WhatsApp',
        'Integración con sistema administrativo para sincronización de inventario en vivo',
        'Diseño elegante con hero de video y navegación premium'
      ],
      technologies: ['Angular 19', 'PHP 8.5', 'MySQL', 'WhatsApp API'],
      stats: { label: 'Clientes Satisfechos', value: '+500' },
      rotbotPrompt: 'Hola, quiero una tienda E-commerce de productos premium con catálogo, ficha de producto y consulta por WhatsApp, similar a COLCHONES DISTRICOL.'
    },
    {
      id: 'asistente-ia',
      code: 'SYS_05',
      badge: 'IA COPILOTO',
      tagline: 'Sistema de gestión empresarial con copiloto de inteligencia artificial.',
      title: 'ASISTENTE IA',
      category: 'E-commerce + IA',
      client: 'Asistente IA / Negocios Inteligentes',
      image: 'assets/images/proyectos/proyecto-asistenteia.png',
      gradient: 'linear-gradient(135deg, #0a1f0a 0%, #1a3a1a 100%)',
      description: 'Plataforma de administración empresarial con asistente de inteligencia artificial integrado que responde consultas, analiza inventarios, genera cotizaciones y apoya la toma de decisiones en tiempo real.',
      highlights: [
        'Copiloto IA que responde preguntas sobre stock, ventas y reportes',
        'Dashboard con métricas clave: ventas, pedidos, usuarios y ticket promedio',
        'Gestión completa de productos, categorías, pedidos e inventario',
        'Interfaz móvil nativa para consultar el negocio desde cualquier lugar'
      ],
      technologies: ['Angular 19', 'PHP 8.5', 'Groq IA', 'Real-Time'],
      stats: { label: 'Atención Automática', value: '94%' },
      rotbotPrompt: 'Hola, necesito un sistema de gestión empresarial con copiloto de inteligencia artificial integrado, como ASISTENTE IA.'
    },
    {
      id: 'tiendaintima',
      code: 'ECOM_06',
      badge: 'TIENDA + IA',
      tagline: 'E-commerce de moda íntima con panel administrativo y asistente inteligente.',
      title: 'TIENDA ÍNTIMA',
      category: 'E-commerce + IA',
      client: 'Tiendaíntima / Moda & Descanso',
      image: 'assets/images/proyectos/proyecto-tiendaintima.png',
      gradient: 'linear-gradient(135deg, #2a0a1a 0%, #4a1a30 100%)',
      description: 'Plataforma de comercio electrónico para moda íntima y descanso con IA integrada para gestión de productos, análisis de ventas, inventario y experiencia de compra personalizada.',
      highlights: [
        'Panel de administración con resumen de ventas, pedidos y usuarios en vivo',
        'Asistente IA para clasificar y optimizar descripciones de productos',
        'Tienda pública responsive con catálogo de pijamas, ropa interior y más',
        'Reportes de evolución de ventas con gráficos y tendencias'
      ],
      technologies: ['Angular 19', 'PHP 8.5', 'MySQL', 'IA Integrada'],
      stats: { label: 'Ventas del Mes', value: '$4.85M' },
      rotbotPrompt: 'Hola, quiero una tienda E-commerce con panel de administración e inteligencia artificial integrada, similar a TIENDA ÍNTIMA.'
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
