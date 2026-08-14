import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface GalleryProject {
  id: string;
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
  selector: 'app-planes-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="planes-gallery" class="w-full pt-16 pb-24 px-4 sm:px-6 relative overflow-hidden">
      <!-- Brillos de Fondo -->
      <div class="absolute top-1/3 left-1/4 w-96 h-96 bg-[#00f5ff]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div class="max-w-7xl mx-auto relative z-10">
        <!-- Encabezado de la Galería -->
        <div class="text-center max-w-3xl mx-auto mb-12">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-[0.25em] font-bold text-[#00f5ff] mb-4">
            <span class="w-2 h-2 rounded-full bg-[#00f5ff] animate-ping"></span>
            Showcase de Excelencia
          </div>
          <h2 class="text-3xl sm:text-5xl font-headline uppercase tracking-tight text-white leading-tight">
            Galería de Proyectos Realizados
          </h2>
          <p class="text-xs sm:text-sm text-white/60 mt-3 leading-relaxed">
            Explora maquetas, tiendas autopersonalizables y sistemas inteligentes creados con el estándar PortaLink. Inspírate y selecciona el punto de partida perfecto para tu próximo desarrollo.
          </p>
        </div>

        <!-- Botones de Filtro (Categorías) -->
        <div class="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
          <button *ngFor="let cat of categories"
                  (click)="setFilter(cat.id)"
                  [class.active-filter]="activeCategory === cat.id"
                  class="filter-pill px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-2 border">
            <span>{{ cat.icon }}</span>
            <span>{{ cat.label }}</span>
            <span *ngIf="cat.id !== 'Todos'" class="px-1.5 py-0.5 rounded-full text-[10px] bg-white/10 text-white/80">
              {{ getCount(cat.id) }}
            </span>
          </button>
        </div>

        <!-- Grid de Proyectos -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          <div *ngFor="let project of filteredProjects" 
               class="project-card group rounded-3xl overflow-hidden border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 flex flex-col justify-between relative">
            
            <!-- Contenedor Superior con Imagen/Gradiente y Badges -->
            <div class="relative h-56 sm:h-64 overflow-hidden w-full" [ngStyle]="{'background': project.gradient}">
              <img [src]="project.image" 
                   (error)="onImgError($event)"
                   [alt]="project.title" 
                   class="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 mix-blend-overlay">
              
              <div class="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/30"></div>

              <!-- Categoría Tag & Stat -->
              <div class="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <span class="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-bold uppercase tracking-wider text-[#00f5ff]">
                  {{ project.category }}
                </span>
                <div class="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white flex items-center gap-1.5">
                  <span class="text-white/60">{{ project.stats.label }}:</span>
                  <span class="text-[#00f5ff]">{{ project.stats.value }}</span>
                </div>
              </div>

              <!-- Overlay al Hover con Acción Rápida -->
              <div class="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 p-4">
                <button (click)="openPreview(project)" 
                        class="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:scale-105 transition-transform shadow-lg cursor-pointer flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Ver Demo & Detalles
                </button>
              </div>
            </div>

            <!-- Contenido Informativo -->
            <div class="p-6 sm:p-7 flex-grow flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-[11px] uppercase tracking-widest text-white/40 font-semibold">{{ project.client }}</span>
                </div>
                <h3 class="text-xl sm:text-2xl font-headline font-bold text-white uppercase tracking-tight group-hover:text-[#00f5ff] transition-colors mb-3">
                  {{ project.title }}
                </h3>
                <p class="text-xs sm:text-[13px] text-white/60 leading-relaxed mb-6">
                  {{ project.description }}
                </p>

                <!-- Puntos Destacados -->
                <div class="space-y-2 mb-6">
                  <div *ngFor="let hl of project.highlights" class="flex items-center gap-2.5 text-xs text-white/75">
                    <div class="w-1.5 h-1.5 rounded-full bg-[#00f5ff]"></div>
                    <span>{{ hl }}</span>
                  </div>
                </div>
              </div>

              <div>
                <div class="h-px w-full bg-white/10 mb-5"></div>

                <!-- Tecnologías -->
                <div class="flex flex-wrap items-center gap-1.5 mb-6">
                  <span *ngFor="let tech of project.technologies" 
                        class="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-medium text-white/70">
                    {{ tech }}
                  </span>
                </div>

                <!-- Botones de Acción -->
                <div class="grid grid-cols-2 gap-3">
                  <button (click)="openPreview(project)" 
                          class="w-full py-3 rounded-xl border border-white/15 hover:border-white/40 text-white font-bold text-[11px] uppercase tracking-widest transition-all text-center cursor-pointer">
                    Detalles
                  </button>
                  <button (click)="selectDesign(project)" 
                          class="w-full py-3 rounded-xl bg-[#00f5ff] hover:bg-[#00f5ff]/90 text-black font-bold text-[11px] uppercase tracking-widest transition-all text-center shadow-md cursor-pointer flex items-center justify-center gap-1.5">
                    <span>Elegir Estilo</span>
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Estado si no hay proyectos por el filtro -->
        <div *ngIf="filteredProjects.length === 0" class="text-center py-20 border border-dashed border-white/15 rounded-3xl mt-6">
          <svg class="w-12 h-12 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <h4 class="text-lg font-bold text-white">No se encontraron proyectos</h4>
          <p class="text-xs text-white/50 mt-1">Prueba seleccionando otra categoría para explorar más trabajos.</p>
        </div>

      </div>

      <!-- MODAL DE PREVISUALIZACIÓN INTERACTIVA -->
      <div *ngIf="previewModalProject" 
           class="fixed inset-0 z-[250] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in">
        <div class="relative w-full max-w-4xl bg-[#0d0d12] border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-up">
          
          <!-- Modal Header (Mac OS Window Style) -->
          <div class="px-6 py-4 bg-white/[0.03] border-b border-white/10 flex items-center justify-between flex-shrink-0">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
              <span class="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
              <span class="w-3 h-3 rounded-full bg-green-500/80 inline-block"></span>
              <span class="ml-3 text-xs font-mono font-bold text-white/70 uppercase tracking-widest">{{ previewModalProject.category }} // DEMO INTERACTIVA</span>
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
                     class="w-full h-full object-cover mix-blend-overlay opacity-90">
                <div class="absolute inset-0 bg-gradient-to-t from-[#0d0d12] via-transparent to-transparent"></div>
                
                <div class="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <div>
                    <span class="text-[10px] uppercase tracking-widest text-[#00f5ff] font-bold">{{ previewModalProject.client }}</span>
                    <h3 class="text-2xl sm:text-3xl font-headline font-bold text-white uppercase">{{ previewModalProject.title }}</h3>
                  </div>
                </div>
              </div>

              <div class="space-y-5">
                <div>
                  <h4 class="text-xs uppercase tracking-widest font-bold text-white/40 mb-2">Descripción del Proyecto</h4>
                  <p class="text-sm sm:text-base text-white/80 leading-relaxed">{{ previewModalProject.description }}</p>
                </div>

                <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div>
                    <span class="text-[11px] text-white/50 block">Métrica de Éxito Comercial</span>
                    <span class="text-lg font-bold text-white">{{ previewModalProject.stats.label }}</span>
                  </div>
                  <span class="text-2xl sm:text-3xl font-headline font-bold text-[#00f5ff]">{{ previewModalProject.stats.value }}</span>
                </div>

                <div>
                  <h4 class="text-xs uppercase tracking-widest font-bold text-white/40 mb-2">Especificaciones Técnicas</h4>
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
              <h4 class="text-xs uppercase tracking-widest font-bold text-white/60 mb-4">Módulos & Características Implementadas</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div *ngFor="let hl of previewModalProject.highlights" class="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
                  <div class="w-6 h-6 rounded-lg bg-[#00f5ff]/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-[#00f5ff]">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <span class="text-xs sm:text-sm text-white/80 font-medium">{{ hl }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-5 bg-white/[0.02] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">
            <span class="text-xs text-white/50 text-center sm:text-left">
              ¿Te gusta este enfoque? Podemos configurarlo para tu marca o personalizarlo al 100%.
            </span>
            <div class="flex items-center gap-3 w-full sm:w-auto">
              <button (click)="closePreview()" 
                      class="px-6 py-3 rounded-xl border border-white/15 hover:bg-white/5 text-white font-bold text-xs uppercase tracking-widest transition-all cursor-pointer w-full sm:w-auto">
                Cerrar
              </button>
              <button (click)="selectDesign(previewModalProject)" 
                      class="px-7 py-3 rounded-xl bg-[#00f5ff] hover:bg-[#00f5ff]/90 text-black font-bold text-xs uppercase tracking-widest transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto">
                <span>Solicitar este Diseño</span>
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  `,
  styles: [`
    .filter-pill {
      background: rgba(255, 255, 255, 0.02);
      border-color: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.7);
    }
    .filter-pill:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.25);
      color: #ffffff;
    }
    .active-filter {
      background: var(--text-primary) !important;
      color: var(--bg-primary) !important;
      border-color: var(--text-primary) !important;
      box-shadow: 0 0 20px rgba(0, 245, 255, 0.25);
    }
    .project-card:hover {
      border-color: var(--accent-color, #00f5ff);
      transform: translateY(-6px);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
    }
    @keyframes scaleUp {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-scale-up {
      animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class PlanesGalleryComponent implements OnInit, OnChanges {
  @Input() selectedCategory: string = 'Todos';

  activeCategory: string = 'Todos';
  previewModalProject: GalleryProject | null = null;

  categories = [
    { id: 'Todos', label: 'Todos los Proyectos', icon: '⭐' },
    { id: 'Landing Page', label: 'Landing Pages', icon: '🚀' },
    { id: 'E-commerce', label: 'E-commerce', icon: '🛍️' },
    { id: 'E-commerce + IA', label: 'IA & Tiendas Smart', icon: '🤖' },
    { id: 'Sistemas', label: 'Sistemas & POS', icon: '⚙️' }
  ];

  projects: GalleryProject[] = [
    {
      id: 'luxe-arch',
      title: 'Luxe Architecture Studio',
      category: 'Landing Page',
      client: 'Estudio Luxe SA',
      image: 'assets/images/fotos/photo2.jpg',
      gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      description: 'Landing page inmersiva de una sola página diseñada para presentar proyectos arquitectónicos de alta gama con transiciones fluidas e interactividad 3D.',
      highlights: [
        'Sección Hero con video de alta definición de fondo',
        'Portafolio interactivo filtrable por tipo de obra',
        'Formulario de cotización de proyectos multi-paso integrado',
        'Optimización extrema subsegundo (Google PageSpeed 99/100)'
      ],
      technologies: ['Angular 19', 'Tailwind CSS', 'GSAP Animations', 'Stripe Ready'],
      stats: { label: 'Tasa de Conversión', value: '+54%' },
      rotbotPrompt: 'Hola, quiero desarrollar una Landing Page estilo "Luxe Architecture Studio" con diseño elegante, portafolio visual y formulario de cotización para mi negocio.'
    },
    {
      id: 'aura-boutique',
      title: 'Aura Fashion Boutique',
      category: 'E-commerce',
      client: 'Aura Moda & Belleza',
      image: 'assets/images/fotos/photo3.jpeg',
      gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
      description: 'Tienda en línea autopersonalizable con editor visual en vivo que permite al cliente cambiar banners, colores de temporada y secciones en tiempo real sin tocar código.',
      highlights: [
        'Editor Visual Interactivo en vivo para cambios de diseño',
        'Catálogo de prendas con filtros por talla, color y precio',
        'Carrito lateral deslizable y pasarela de pago optimizada',
        'Panel de administración con control total de inventario'
      ],
      technologies: ['Editor en Vivo', 'Angular', 'PHP 8.5 Backend', 'MySQL'],
      stats: { label: 'Ventas Móviles', value: '78%' },
      rotbotPrompt: 'Hola, me interesa adquirir una tienda E-commerce Autopersonalizable estilo "Aura Fashion Boutique" con editor en vivo y carrito inteligente.'
    },
    {
      id: 'autoparts-ai',
      title: 'Rotbot AutoParts AI Store',
      category: 'E-commerce + IA',
      client: 'Grupo MotorSmart',
      image: 'assets/images/fotos/photo4.jpeg',
      gradient: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
      description: 'Comercio electrónico avanzado con Copiloto Rotbot IA 24/7 que asiste a mecánicos y conductores a encontrar el repuesto exacto según el número de chasis (VIN) y año.',
      highlights: [
        'Copiloto Rotbot IA que dialoga y recomienda repuestos en vivo',
        'Búsqueda predictiva e inteligente por VIN o patente',
        'Integración con catálogo automatizado de más de 10,000 ítems',
        'Cierre de ventas asistido por IA directamente en WhatsApp o Carrito'
      ],
      technologies: ['Rotbot IA 24/7', 'Angular 19', 'REST API', 'Smart Search'],
      stats: { label: 'Atención Automática', value: '94%' },
      rotbotPrompt: 'Hola, quiero una tienda E-commerce + IA estilo "Rotbot AutoParts AI Store" con un asistente de inteligencia artificial 24/7 que recomiende productos a mis clientes.'
    },
    {
      id: 'fitpulse-gym',
      title: 'FitPulse Gym & Coaching',
      category: 'Landing Page',
      client: 'FitPulse Club',
      image: 'assets/images/fotos/principal.jpg',
      gradient: 'linear-gradient(135deg, #cb2d3e 0%, #ef476f 100%)',
      description: 'Sitio web de alto impacto para centro de entrenamiento con calculadora de índice de masa corporal (IMC), horarios interactivos y reserva directa con entrenadores.',
      highlights: [
        'Diseño enérgico y motivador con modo oscuro nativo',
        'Calculadora fitness interactiva para clientes potenciales',
        'Grilla de clases y reserva directa por WhatsApp / Calendario',
        'Sección de testimonios y transformaciones en video'
      ],
      technologies: ['Angular', 'Responsive Mobile', 'WhatsApp Link', 'SEO Ready'],
      stats: { label: 'Nuevos Socios / Mes', value: '+120' },
      rotbotPrompt: 'Hola, me gustaría tener una Landing Page estilo "FitPulse Gym & Coaching" enfocada en captar clientes, mostrar servicios y permitir reservas directas.'
    },
    {
      id: 'nova-bio',
      title: 'Nova Bio Cosmetics',
      category: 'E-commerce + IA',
      client: 'Nova Bio Lab',
      image: 'assets/images/fotos/link-principal.jpg',
      gradient: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
      description: 'Plataforma de cosmética orgánica equipada con un diagnosticador virtual por IA que analiza el tipo de piel de los clientes y construye una rutina personalizada.',
      highlights: [
        'Test facial interactivo guiado por inteligencia artificial',
        'Editor autopersonalizable para campañas ecológicas estacionales',
        'Suscripción recurrente (cajas de rutina mensual) integrada',
        'Estadísticas avanzadas de retención y compras repetidas'
      ],
      technologies: ['Rotbot IA', 'E-commerce', 'Suscripciones', 'UX Premium'],
      stats: { label: 'Ticket Promedio', value: '+38%' },
      rotbotPrompt: 'Hola, quiero crear una tienda E-commerce + IA estilo "Nova Bio Cosmetics" con recomendaciones personalizadas y diseño moderno.'
    },
    {
      id: 'restaurant-pos',
      title: 'Rotbot Restaurant POS & Menu',
      category: 'Sistemas',
      client: 'Gourmet Tech Holdings',
      image: 'assets/images/rotbot.png',
      gradient: 'linear-gradient(135deg, #b92b27 0%, #1565C0 100%)',
      description: 'Sistema integral de gestión para restaurantes y cafeterías. Incluye menú digital QR, toma de pedidos en mesa desde tablets, pantalla de cocina (KDS) y facturación.',
      highlights: [
        'Menú digital interactivo autogestionable con fotos de alta calidad y alérgenos',
        'Módulo de toma de pedidos para mozos y sincronización con cocina',
        'Facturación rápida, cuadre de caja e informes de ventas diarios',
        'Soporte offline-first para no detener operaciones si falla el internet'
      ],
      technologies: ['POS Sistema', 'Real-Time KDS', 'QR Dinámico', 'PHP/MySQL'],
      stats: { label: 'Tiempo de Pedido', value: '-65%' },
      rotbotPrompt: 'Hola, necesito una solución de Sistema a Medida o POS estilo "Rotbot Restaurant POS" para gestionar pedidos, menú digital y ventas de mi negocio.'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.activeCategory = this.selectedCategory || 'Todos';
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedCategory'] && changes['selectedCategory'].currentValue) {
      this.activeCategory = changes['selectedCategory'].currentValue;
    }
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
    const designName = project?.title || 'Personalizado';
    const messageText = `Hola, me interesa solicitar el diseño: ${designName}`;
    const whatsappUrl = `https://wa.me/573054078225?text=${encodeURIComponent(messageText)}`;
    window.open(whatsappUrl, '_blank');
  }

  onImgError(event: Event) {
    const el = event.target as HTMLImageElement;
    el.style.display = 'none';
  }
}
