import { Component, OnInit, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

export interface ProjectDetail {
  id: string;
  code: string;
  badge: string;
  title: string;
  tagline: string;
  category: string;
  client: string;
  year: string;
  liveUrl: string;
  image: string;
  images: string[];
  video?: string;
  mobileImages?: string[];
  description: string;
  longDescription: string;
  highlights: string[];
  features: { icon: string; title: string; desc: string }[];
  technologies: string[];
  stats: { label: string; value: string }[];
  rotbotPrompt: string;
}

@Component({
  selector: 'app-descripcion-proyecto',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="min-h-screen w-full flex flex-col font-sans page-wrapper project-detail-wrapper">
      <!-- Standard Navigation Bar -->
      <app-navbar></app-navbar>

      <!-- Main Project Content -->
      <main class="flex-grow w-full pt-14 sm:pt-24 md:pt-28 pb-20 relative z-10" *ngIf="project">
        
        <!-- Top Breadcrumb & Back Navigation -->
        <div class="max-w-[1400px] mx-auto px-4 sm:px-10 mb-4 sm:mb-8">
          <div class="flex items-center justify-between gap-4 flex-wrap">
            <a (click)="goBack()" class="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-[0.2em] cursor-pointer nav-back-btn transition-colors">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
              </svg>
              <span>Volver a Proyectos</span>
            </a>

            <div class="flex items-center gap-3">
              <span class="text-[10px] font-mono font-bold uppercase tracking-[0.25em] px-3 py-1 rounded-full badge-code border">
                #{{ project.code }}
              </span>
              <span class="text-[10px] font-mono font-bold uppercase tracking-[0.25em] px-3 py-1 rounded-full badge-category border">
                {{ project.badge }}
              </span>
            </div>
          </div>
        </div>

        <!-- Hero Section Header -->
        <section class="max-w-[1400px] mx-auto px-4 sm:px-10 mb-6 sm:mb-12">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-end">
            <div class="lg:col-span-8">
              <div class="inline-flex items-center gap-2 mb-2 sm:mb-3">
                <span class="w-2 h-2 rounded-full bg-[var(--accent-color,#00f5ff)] animate-pulse"></span>
                <span class="text-xs uppercase tracking-[0.3em] font-mono font-bold text-[var(--accent-color,#00f5ff)]">
                  {{ project.category }} — {{ project.year }}
                </span>
              </div>
              
              <h1 class="text-3xl sm:text-6xl lg:text-7xl font-headline font-black uppercase tracking-tight leading-[0.95] mb-3 sm:mb-4 project-title">
                {{ project.title }}
              </h1>

              <p class="text-sm sm:text-xl font-light leading-relaxed max-w-2xl project-tagline">
                {{ project.tagline }}
              </p>
            </div>

            <!-- Client & Live Domain Action Card -->
            <div class="lg:col-span-4 flex flex-col gap-4">
              <div class="p-5 sm:p-6 rounded-2xl border client-card backdrop-blur-md">
                <div class="flex items-center justify-between mb-3 text-xs font-mono uppercase tracking-wider text-muted">
                  <span>Cliente</span>
                  <span>Dominio en Vivo</span>
                </div>
                <div class="text-base sm:text-lg font-bold font-headline mb-4">{{ project.client }}</div>

                <a [href]="project.liveUrl" target="_blank" rel="noopener noreferrer"
                   class="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest live-domain-btn transition-all duration-300 shadow-lg group">
                  <span>Visitar Proyecto en Vivo</span>
                  <svg class="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H18m0 0v4.5M18 6l-7.5 7.5M6 18h12"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>

        <!-- Main Interactive Media Showcase (Unified Gallery Carousel with Video) -->
        <section class="max-w-[1400px] mx-auto px-4 sm:px-10 mb-12 sm:mb-16">
          
          <!-- Main Display Container (Image or Video with Fixed Uniform Height) -->
          <div class="main-image-container relative rounded-[20px] sm:rounded-[36px] overflow-hidden border border-white/15 bg-black shadow-2xl group h-[240px] sm:h-[560px] lg:h-[650px] flex items-center justify-center">
            
            <!-- Minimalist Left Navigation Arrow -->
            <button *ngIf="project.images && project.images.length > 1"
                    (click)="prevMedia()"
                    aria-label="Imagen anterior"
                    class="absolute left-3 sm:left-6 z-30 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/80 border border-white/20 hover:border-white/50 text-white backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-xl hover:scale-110 active:scale-95 group/navbtn cursor-pointer">
              <svg class="w-4 h-4 sm:w-6 sm:h-6 -ml-0.5 transition-transform group-hover/navbtn:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            <!-- Video Player (when Video thumbnail is selected) -->
            <ng-container *ngIf="activeMediaType === 'video' && project.video; else mainImageBlock">
              <video [src]="project.video" controls autoplay loop muted playsinline
                     class="w-full h-full object-contain mx-auto">
              </video>
              <div class="absolute top-4 left-4 backdrop-blur-md bg-emerald-500/20 border border-emerald-500/40 px-3.5 py-1.5 rounded-full text-emerald-300 text-xs font-mono font-bold flex items-center gap-2 z-20">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Reproduciendo Video</span>
              </div>
            </ng-container>

            <!-- Main Image (Uniform Height across all desktop slides) -->
            <ng-template #mainImageBlock>
              <img [src]="activeImage" (error)="onImgError($event)" [alt]="project.title"
                   class="w-full h-full object-contain sm:object-cover sm:object-top transition-all duration-500">
              <div class="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 backdrop-blur-md bg-black/60 border border-white/10 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-white text-[10px] sm:text-xs font-mono z-20 pointer-events-none">
                Visualización de Alta Calidad
              </div>
            </ng-template>

            <!-- Minimalist Right Navigation Arrow -->
            <button *ngIf="project.images && project.images.length > 1"
                    (click)="nextMedia()"
                    aria-label="Siguiente imagen"
                    class="absolute right-3 sm:right-6 z-30 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/80 border border-white/20 hover:border-white/50 text-white backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-xl hover:scale-110 active:scale-95 group/navbtn cursor-pointer">
              <svg class="w-4 h-4 sm:w-6 sm:h-6 ml-0.5 transition-transform group-hover/navbtn:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>

          <!-- Thumbnail Gallery & Video Switcher -->
          <div class="flex items-center gap-4 mt-6 overflow-x-auto pb-2 no-scrollbar">
            
            <!-- 1. Main Cover Image Thumbnail -->
            <button (click)="selectMedia('image', project.images[0])"
                    class="relative flex-shrink-0 w-32 sm:w-44 aspect-[16/10] rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer group/thumb"
                    [class.border-[var(--accent-color,#00f5ff)]]="activeMediaType === 'image' && activeImage === project.images[0]"
                    [class.ring-2]="activeMediaType === 'image' && activeImage === project.images[0]"
                    [class.ring-[var(--accent-color,#00f5ff)]]="activeMediaType === 'image' && activeImage === project.images[0]"
                    [class.scale-105]="activeMediaType === 'image' && activeImage === project.images[0]"
                    [class.opacity-50]="activeMediaType !== 'image' || activeImage !== project.images[0]">
              <img [src]="project.images[0]" (error)="onImgError($event)" [alt]="project.title + ' Cover'" class="w-full h-full object-cover object-top">
              <span class="absolute bottom-1.5 left-1.5 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-black/70 text-white border border-white/10">Portada</span>
            </button>

            <!-- 2. Video Thumbnail (2nd Position if video exists) -->
            <button *ngIf="project.video"
                    (click)="selectMedia('video')"
                    class="relative flex-shrink-0 w-32 sm:w-44 aspect-[16/10] rounded-2xl overflow-hidden border bg-neutral-950 transition-all duration-300 cursor-pointer flex items-center justify-center group/vthumb"
                    [class.border-emerald-400]="activeMediaType === 'video'"
                    [class.ring-2]="activeMediaType === 'video'"
                    [class.ring-emerald-400]="activeMediaType === 'video'"
                    [class.scale-105]="activeMediaType === 'video'"
                    [class.opacity-50]="activeMediaType !== 'video'">
              <img [src]="project.images[0]" (error)="onImgError($event)" [alt]="project.title + ' Video'" class="w-full h-full object-cover opacity-40 blur-[1px]">
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col items-center justify-center gap-1">
                <div class="w-10 h-10 rounded-full bg-emerald-400 text-black flex items-center justify-center shadow-lg group-hover/vthumb:scale-110 transition-transform">
                  <svg class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <span class="text-[10px] font-mono font-extrabold uppercase text-emerald-300 tracking-wider">Video Demo</span>
              </div>
            </button>

            <!-- 3+. Other Screenshots -->
            <ng-container *ngFor="let img of project.images.slice(1); let i = index">
              <button (click)="selectMedia('image', img)"
                      class="relative flex-shrink-0 w-32 sm:w-44 aspect-[16/10] rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer"
                      [class.border-[var(--accent-color,#00f5ff)]]="activeMediaType === 'image' && activeImage === img"
                      [class.ring-2]="activeMediaType === 'image' && activeImage === img"
                      [class.ring-[var(--accent-color,#00f5ff)]]="activeMediaType === 'image' && activeImage === img"
                      [class.scale-105]="activeMediaType === 'image' && activeImage === img"
                      [class.opacity-50]="activeMediaType !== 'image' || activeImage !== img">
                <img [src]="img" (error)="onImgError($event)" [alt]="'Captura ' + (i + 2)" class="w-full h-full object-cover object-top">
              </button>
            </ng-container>

          </div>
        </section>

        <!-- Deep Dive Description & Highlights -->
        <section class="max-w-[1400px] mx-auto px-6 sm:px-10 mb-16">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <!-- Left: Detailed Narrative -->
            <div class="lg:col-span-7 space-y-6">
              <h2 class="text-2xl sm:text-3xl font-headline font-bold uppercase tracking-tight section-h2">
                Descripción Detallada del Desarrollo
              </h2>
              <p class="text-base sm:text-lg font-light leading-relaxed body-text whitespace-pre-line">
                {{ project.longDescription }}
              </p>
            </div>

            <!-- Right: Project Highlights Checklist -->
            <div class="lg:col-span-5">
              <div class="p-8 rounded-3xl border highlights-card">
                <h3 class="text-xl font-headline font-bold uppercase tracking-wider mb-6 text-[var(--accent-color,#00f5ff)] flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>Aspectos Clave</span>
                </h3>

                <ul class="space-y-4">
                  <li *ngFor="let h of project.highlights" class="flex items-start gap-3 text-sm font-light leading-relaxed highlight-item">
                    <div class="w-2 h-2 rounded-full bg-[var(--accent-color,#00f5ff)] flex-shrink-0 mt-2"></div>
                    <span>{{ h }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <!-- "LO QUE INCLUYE EL PROYECTO" (Features Grid) -->
        <section class="max-w-[1400px] mx-auto px-6 sm:px-10 mb-20">
          <div class="text-center max-w-2xl mx-auto mb-12">
            <span class="text-xs uppercase tracking-[0.3em] font-mono font-bold text-[var(--accent-color,#00f5ff)] block mb-2">
              ARQUITECTURA & MÓDULOS
            </span>
            <h2 class="text-3xl sm:text-4xl font-headline font-black uppercase tracking-tight section-h2">
              Lo que Incluye este Proyecto
            </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div *ngFor="let f of project.features" class="p-6 rounded-2xl border feature-card hover:border-[var(--accent-color,#00f5ff)]/40 transition-all duration-300">
              <div class="w-12 h-12 rounded-xl bg-[var(--accent-color,#00f5ff)]/10 text-[var(--accent-color,#00f5ff)] flex items-center justify-center mb-4">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="f.icon"/>
                </svg>
              </div>
              <h4 class="text-lg font-headline font-bold uppercase mb-2 feature-title">{{ f.title }}</h4>
              <p class="text-xs font-light leading-relaxed feature-desc">{{ f.desc }}</p>
            </div>
          </div>
        </section>

        <!-- Mobile Devices Showcase Section (for tall mobile screenshots) -->
        <section class="max-w-[1400px] mx-auto px-6 sm:px-10 mb-24" *ngIf="project.mobileImages && project.mobileImages.length > 0">
          <div class="text-center max-w-2xl mx-auto mb-12">
            <div class="inline-flex items-center gap-2 mb-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="text-xs uppercase tracking-[0.3em] font-mono font-bold text-emerald-400">
                DISEÑO RESPONSIVO MÓVIL
              </span>
            </div>
            <h2 class="text-3xl sm:text-4xl font-headline font-black uppercase tracking-tight section-h2">
              Experiencia en Dispositivos Móviles
            </h2>
            <p class="text-sm sm:text-base font-light text-muted mt-2">
              Vistas en formato teléfono inteligente optimizadas para navegación táctil y conversión inmediata.
            </p>
          </div>

          <!-- Mobile Images Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 items-start justify-center">
            <div *ngFor="let mImg of project.mobileImages; let idx = index"
                 class="relative mx-auto w-full max-w-[320px] rounded-2xl overflow-hidden shadow-xl border border-white/10 group hover:-translate-y-1 transition-all duration-300">
              <img [src]="mImg" (error)="onImgError($event)" [alt]="'Vista Móvil ' + (idx + 1)"
                   class="w-full h-auto object-cover rounded-2xl shadow-md transition-transform duration-500 group-hover:scale-[1.02]">
            </div>
          </div>
        </section>

        <!-- Bottom Call-To-Action Banner -->
        <section class="max-w-[1400px] mx-auto px-6 sm:px-10 mb-12">
          <div class="p-8 sm:p-12 rounded-3xl border cta-banner relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 class="text-2xl sm:text-4xl font-headline font-black uppercase mb-3 cta-title">
                ¿Quieres un Proyecto Similar a {{ project.title }}?
              </h3>
              <p class="text-sm font-light max-w-xl cta-desc">
                Diseñamos y desarrollamos plataformas web exclusivas adaptadas a los objetivos de tu empresa.
              </p>
            </div>

            <div class="flex items-center gap-4 flex-wrap flex-shrink-0">
              <button (click)="openWhatsappQuote()"
                      class="px-6 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg flex items-center gap-2 cursor-pointer">
                <i class="fa-brands fa-whatsapp text-sm"></i>
                <span>Cotiza tu proyecto</span>
              </button>

              <a [href]="project.liveUrl" target="_blank" rel="noopener noreferrer"
                 class="px-6 py-4 rounded-xl border font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                <span>Ver Sitio Web</span>
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
              </a>
            </div>
          </div>
        </section>

      </main>

      <!-- Footer -->
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .project-detail-wrapper {
      background: var(--bg-primary, #080808);
      color: var(--text-primary, #ffffff);
      transition: background 0.4s ease, color 0.4s ease;
    }

    .nav-back-btn {
      color: var(--text-secondary, rgba(255, 255, 255, 0.7));
    }
    .nav-back-btn:hover {
      color: var(--accent-color, #00f5ff);
    }

    .badge-code, .badge-category {
      background: var(--card-bg, rgba(255, 255, 255, 0.04));
      border-color: var(--card-border, rgba(255, 255, 255, 0.12));
      color: var(--text-primary, #ffffff);
    }

    .project-title {
      color: var(--text-primary, #ffffff);
    }

    .project-tagline {
      color: var(--text-secondary, rgba(255, 255, 255, 0.7));
    }

    .client-card, .stat-card, .highlights-card, .feature-card, .cta-banner {
      background: var(--card-bg, rgba(255, 255, 255, 0.03));
      border-color: var(--card-border, rgba(255, 255, 255, 0.1));
    }

    .text-muted {
      color: var(--text-secondary, rgba(255, 255, 255, 0.5));
    }

    .live-domain-btn {
      background: var(--accent-color, #00f5ff);
      color: #000000;
    }
    .live-domain-btn:hover {
      filter: brightness(1.1);
      transform: translateY(-2px);
    }

    .main-image-container {
      border-color: var(--card-border, rgba(255, 255, 255, 0.12));
    }

    .section-h2, .feature-title, .cta-title {
      color: var(--text-primary, #ffffff);
    }

    .body-text, .feature-desc, .cta-desc, .highlight-item {
      color: var(--text-secondary, rgba(255, 255, 255, 0.75));
    }

    .tech-pill {
      background: var(--card-bg, rgba(255, 255, 255, 0.04));
      border-color: var(--card-border, rgba(255, 255, 255, 0.12));
      color: var(--text-primary, #ffffff);
    }

    /* Light Theme Overrides */
    .theme-light .project-detail-wrapper {
      background: #f4f5f7;
      color: #111111;
    }

    .theme-light .project-title,
    .theme-light .section-h2,
    .theme-light .feature-title,
    .theme-light .cta-title {
      color: #111111;
    }

    .theme-light .project-tagline,
    .theme-light .body-text,
    .theme-light .feature-desc,
    .theme-light .cta-desc,
    .theme-light .highlight-item,
    .theme-light .text-muted {
      color: #4b5563;
    }

    .theme-light .client-card,
    .theme-light .stat-card,
    .theme-light .highlights-card,
    .theme-light .feature-card,
    .theme-light .cta-banner,
    .theme-light .badge-code,
    .theme-light .badge-category,
    .theme-light .tech-pill {
      background: #ffffff;
      border-color: rgba(0, 0, 0, 0.08);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
    }
  `]
})
export class DescripcionProyectoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  project?: ProjectDetail;
  activeImage = '';
  activeMediaType: 'image' | 'video' = 'image';

  selectMedia(type: 'image' | 'video', url?: string) {
    this.activeMediaType = type;
    if (type === 'image' && url) {
      this.activeImage = url;
    }
  }

  onImgError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target && !target.src.includes('proyecto-sysmiconarquitectura.png')) {
      target.src = 'assets/images/proyectos/proyecto-sysmiconarquitectura.png';
    }
  }

  prevMedia() {
    if (!this.project || !this.project.images || this.project.images.length === 0) return;
    const currentIndex = this.project.images.indexOf(this.activeImage);
    if (currentIndex > 0) {
      this.selectMedia('image', this.project.images[currentIndex - 1]);
    } else {
      this.selectMedia('image', this.project.images[this.project.images.length - 1]);
    }
  }

  nextMedia() {
    if (!this.project || !this.project.images || this.project.images.length === 0) return;
    const currentIndex = this.project.images.indexOf(this.activeImage);
    if (currentIndex >= 0 && currentIndex < this.project.images.length - 1) {
      this.selectMedia('image', this.project.images[currentIndex + 1]);
    } else {
      this.selectMedia('image', this.project.images[0]);
    }
  }

  // Dataset Completo de Proyectos
  projectsData: ProjectDetail[] = [
    {
      id: 'camascotas',
      code: 'ECOM_01',
      badge: 'E-COMMERCE',
      title: 'CAMASCOTAS',
      tagline: 'Tienda de mobiliario premium para mascotas con catálogo interactivo y personalización.',
      category: 'E-commerce & Retail',
      client: 'Camascotas Colombia',
      year: '2026',
      liveUrl: 'https://camascotas.com/',
      image: 'assets/images/proyectos/proyecto-camascotas.png',
      images: [
        'assets/images/proyectos/proyecto-camascotas.png',
        'assets/images/proyectos/camascotas/camascotas-home.png',
        'assets/images/proyectos/camascotas/camascotas-detalle.png',
        'assets/images/proyectos/camascotas/camascotas-contacto.png',
        'assets/images/proyectos/camascotas/login-camascotas.png'
      ],
      mobileImages: [
        'assets/images/proyectos/camascotas/camascotas-movil.png',
        'assets/images/proyectos/camascotas/camascotas-movil2.png',
        'assets/images/proyectos/camascotas/analiticas-movil.png'
      ],
      description: 'E-commerce completo de muebles y accesorios para mascotas con catálogo interactivo y atención por WhatsApp.',
      longDescription: `Camascotas es una plataforma E-commerce de vanguardia concebida para la comercialización de mobiliario exclusivo para mascotas.

El proyecto destaca por su arquitectura ágil, catálogo dinámico de productos, diseño visual de alta estética y una integración fluida con WhatsApp para cerrar ventas de forma directa e inmediata.

Incluye además un completo panel administrativo donde la marca puede gestionar categorías, promociones, inventario y métricas de pedidos en tiempo real.`,
      highlights: [
        'Catálogo interactivo con filtrado dinámico por categorías de producto',
        'Diseño responsivo optimizado para navegación en teléfonos inteligentes',
        'Integración directa de pedidos a WhatsApp con resumen formateado',
        'Panel administrativo de control de inventarios y métricas de venta'
      ],
      features: [
        {
          icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
          title: 'Catálogo de Muebles',
          desc: 'Exhibición visual de mobiliario para mascotas por categorías y especificaciones de tamaño.'
        },
        {
          icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
          title: 'Navegación Móvil Fluida',
          desc: 'Experiencia ligera, intuitiva y rápida adaptada a cualquier dispositivo móvil.'
        },
        {
          icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z',
          title: 'Checkout WhatsApp API',
          desc: 'Conversión inmediata enviando la orden directamente al asesor comercial.'
        },
        {
          icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
          title: 'Dashboard de Administración',
          desc: 'Control de ventas, gestión de catálogo, precios y órdenes de trabajo.'
        }
      ],
      technologies: ['Angular 19', 'PHP 8.5', 'MySQL', 'TailwindCSS', 'PWA Support'],
      stats: [
        { label: 'Satisfacción', value: '99%' },
        { label: 'Procesamiento', value: '< 200ms' },
        { label: 'Dispositivos', value: '100% Mobile' },
        { label: 'Disponibilidad', value: '99.9%' }
      ],
      rotbotPrompt: 'Hola, quiero una tienda E-commerce como CAMASCOTAS con catálogo y atención por WhatsApp.'
    },
    {
      id: 'sysmicon',
      code: 'SYS_02',
      badge: 'PLATAFORMA WEB',
      title: 'SYSMICON ARQUITECTURA',
      tagline: 'Portal directivo para gestión y exposición de proyectos de arquitectura.',
      category: 'Sistemas Corporativos',
      client: 'Sysmicon Constructora',
      year: '2026',
      liveUrl: 'https://sysmicon.com/',
      image: 'assets/images/proyectos/proyecto-sysmiconarquitectura.png',
      images: [
        'assets/images/proyectos/proyecto-sysmiconarquitectura.png',
        'assets/images/proyectos/sysmicon/sysmi-1.png',
        'assets/images/proyectos/sysmicon/sysmi2.png',
        'assets/images/proyectos/sysmicon/sysmi-3.png'
      ],
      mobileImages: [
        'assets/images/proyectos/sysmicon/movil-sysmicon.jpeg',
        'assets/images/proyectos/sysmicon/movil-sysmicon2.jpeg',
        'assets/images/proyectos/sysmicon/movil-sysmicon4.jpeg'
      ],
      description: 'Plataforma directiva con dashboard de estadísticas, exposición de proyectos y registro de usuarios.',
      longDescription: `SYSMICON ARQUITECTURA es un portal ejecutivo y operativo desarrollado para firmas constructoras y estudios de diseño arquitectónico.

Integra una suite de herramientas avanzadas: exposición interactiva de proyectos habitacionales, dashboard analítico de flujo de usuarios y módulo de registro seguro para clientes.`,
      highlights: [
        'Sitio web exclusivo para la exposición y exhibición de proyectos arquitectónicos de la empresa',
        'Dashboard interactivo con métricas y estadísticas para analizar el flujo y comportamiento de usuarios',
        'Módulo completo de registro de usuarios y autenticación de clientes'
      ],
      features: [
        {
          icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
          title: 'Exposición de Proyectos',
          desc: 'Showcase visual e interactivo de obras y proyectos habitacionales.'
        },
        {
          icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10',
          title: 'Dashboard de Estadísticas',
          desc: 'Monitoreo de métricas, análisis de tráfico y flujo de usuarios en tiempo real.'
        },
        {
          icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
          title: 'Registro de Usuarios',
          desc: 'Autenticación segura y panel de control para clientes.'
        },
        {
          icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
          title: 'Galería de Renders',
          desc: 'Presentación inmersiva para clientes exigentes con vistas panorámicas.'
        }
      ],
      technologies: ['Angular 19', 'PHP 8.5', 'MySQL', 'TailwindCSS', 'WebSockets'],
      stats: [
        { label: 'Proyectos', value: '+50' },
        { label: 'Tiempo de Carga', value: '< 300ms' },
        { label: 'Seguridad', value: 'SSL 256bit' },
        { label: 'Disponibilidad', value: '99.9%' }
      ],
      rotbotPrompt: 'Hola, necesito una plataforma de gestión de proyectos con dashboard ejecutivo y galería visual, similar a SYSMICON.'
    },
    {
      id: 'catalogodigital',
      code: 'SYS_03',
      badge: 'SISTEMA + IA',
      title: 'CATÁLOGO DIGITAL PLAXTILÍNEAS',
      tagline: 'Catálogo digital inteligente con analítica de inventario y asistente IA.',
      category: 'Sistemas + IA',
      client: 'Plastilíneas & Districol Group',
      year: '2026',
      liveUrl: 'https://catalogoplaxtilineas.com/catalogo',
      image: 'assets/images/proyectos/proyecto-catalogodigital.png',
      images: [
        'assets/images/proyectos/proyecto-catalogodigital.png',
        'assets/images/proyectos/catalogo/catalogo-1.png',
        'assets/images/proyectos/catalogo/catalogo-2.png',
        'assets/images/proyectos/catalogo/catalogo-3.png',
        'assets/images/proyectos/catalogo/catalogo-4.png'
      ],

      description: 'Plataforma de catálogo digital con IA para gestión de productos, inventario y analítica.',
      longDescription: `CATÁLOGO DIGITAL PLAXTILÍNEAS es un ecosistema inteligente concebido para empresas con amplios volúmenes de productos y múltiples líneas de negocio.

Integra modelos de Inteligencia Artificial (Groq / Llama 3) para automatizar la generación de descripciones técnicas, detectar productos sin fotografía o información incompleta y emitir reportes de inventario en tiempo real.`,
      highlights: [
        'Copiloto de IA para clasificación y etiquetado automático de productos',
        'Métricas en tiempo real de porcentaje de completitud del catálogo',
        'Soporte multi-marca: Plastilíneas, Espumas y Districol unificados',
        'Exportación rápida de catálogos en PDF y listas de precios'
      ],
      features: [
        {
          icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
          title: 'Asistente IA de Productos',
          desc: 'Optimiza títulos, redacta características y clasifica automáticamente.'
        },
        {
          icon: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
          title: 'Analítica de Inventarios',
          desc: 'Visualización de stock bajo, rotación de líneas y valor comercial.'
        },
        {
          icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
          title: 'Multilínea de Negocio',
          desc: 'Manejo independiente de marcas dentro de un solo panel maestro.'
        },
        {
          icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
          title: 'Exportación a PDF / Excel',
          desc: 'Generación instantánea de portafolios digitales listos para envío.'
        }
      ],
      technologies: ['Angular 19', 'PHP 8.5', 'MySQL', 'Groq AI', 'Chart.js'],
      stats: [
        { label: 'Productos', value: '119+' },
        { label: 'Ahorro Tiempo', value: '75%' },
        { label: 'Respuesta IA', value: '< 400ms' },
        { label: 'Disponibilidad', value: '99.9%' }
      ],
      rotbotPrompt: 'Hola, necesito un sistema de catálogo digital con inteligencia artificial para gestionar mis productos, similar a CATÁLOGO DIGITAL.'
    },
    {
      id: 'districol',
      code: 'ECOM_04',
      badge: 'E-COMMERCE',
      title: 'COLCHONES DISTRICOL',
      tagline: 'Tienda de colchones y descanso premium con catálogo completo y atención personalizada.',
      category: 'E-commerce & Retail',
      client: 'Districol Armenia',
      year: '2026',
      liveUrl: 'https://colchonesdistricol.com/',
      image: 'assets/images/proyectos/proyecto-colchonesdistricol.png',
      images: [
        'assets/images/proyectos/proyecto-colchonesdistricol.png',
        'assets/images/proyectos/card2.png'
      ],
      description: 'E-commerce de colchones premium con catálogo, ficha de producto y WhatsApp API.',
      longDescription: `COLCHONES DISTRICOL es una tienda virtual de alto nivel enfocada en productos de descanso y confort.

Diseñada con un estándar visual premium, ofrece fichas fisiológicas de producto con nivel de firmeza, composición de espuma/resortes y asesoría personalizada inmediata por WhatsApp.`,
      highlights: [
        'Catálogo visual con comparador de firmeza y materiales',
        'Ficha detallada con recomendación de uso y garantía de fábrica',
        'Cotización y asesoría rápida a un clic mediante WhatsApp API',
        'Integración completa con el inventario físico en tiempo real'
      ],
      features: [
        {
          icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
          title: 'Guía de Confort',
          desc: 'Selector asistido según peso, posición al dormir y preferencias.'
        },
        {
          icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z',
          title: 'Atención WhatsApp API',
          desc: 'Conexión inmediata con ejecutivos comerciales de descanso.'
        },
        {
          icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
          title: 'Fotografía de Alta Calidad',
          desc: 'Fichas con galerías detalladas de costuras, resortes y telas.'
        },
        {
          icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
          title: 'Garantía & Respaldo',
          desc: 'Módulo informativo de certificaciones de fábrica e higiene.'
        }
      ],
      technologies: ['Angular 19', 'PHP 8.5', 'MySQL', 'WhatsApp API', 'TailwindCSS'],
      stats: [
        { label: 'Clientes', value: '+500' },
        { label: 'Conversión', value: '4.8%' },
        { label: 'Carga Móvil', value: '< 250ms' },
        { label: 'Satisfacción', value: '98%' }
      ],
      rotbotPrompt: 'Hola, quiero una tienda E-commerce de productos premium con catálogo, ficha de producto y WhatsApp, similar a COLCHONES DISTRICOL.'
    },
    {
      id: 'espumasyplasticos',
      code: 'ECOM_05',
      badge: 'E-COMMERCE & INDUSTRIA',
      title: 'ESPUMAS Y PLÁSTICOS',
      tagline: 'Plataforma e-commerce y catálogo industrial para espumas y productos plásticos.',
      category: 'E-commerce & Industria',
      client: 'Espumas y Plásticos S.A.S.',
      year: '2026',
      liveUrl: 'https://espumasyplasticos.com/',
      image: 'assets/images/proyectos/espumasyplasticos/espuma-1.png',
      images: [
        'assets/images/proyectos/espumasyplasticos/espuma-1.png',
        'assets/images/proyectos/espumasyplasticos/espuma-2.png',
        'assets/images/proyectos/espumasyplasticos/espuma-3.png',
        'assets/images/proyectos/espumasyplasticos/espuma-4.png',
        'assets/images/proyectos/espumasyplasticos/espuma-5.png'
      ],

      description: 'Plataforma de comercio electrónico e industrial para soluciones en espumas, plásticos y materiales sintéticos.',
      longDescription: `ESPUMAS Y PLÁSTICOS es una plataforma e-commerce de especificación industrial concebida para la distribución de láminas de espuma, plásticos técnicos y accesorios de empaque.

Cuenta con calculadora de volumen y densidad, cotización en lote para distribuidores e integración con WhatsApp para ventas consultivas a medida.`,
      highlights: [
        'Catálogo industrial con especificaciones técnicas de densidad y calibre',
        'Módulo de cotizaciones masivas para empresas y distribuidores',
        'Navegación ultrarrápida adaptable a móviles y escritorios',
        'Integración con pasarelas de pago y soporte vía WhatsApp'
      ],
      features: [
        {
          icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
          title: 'Catálogo de Especificación',
          desc: 'Fichas técnicas de calibre, dimensiones y usos recomendados.'
        },
        {
          icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10',
          title: 'Cotización B2B',
          desc: 'Precios especiales para ventas al por mayor y despachos.'
        },
        {
          icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z',
          title: 'Atención WhatsApp API',
          desc: 'Consultoría técnica directa con asesores comerciales.'
        },
        {
          icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
          title: 'Diseño Responsivo',
          desc: 'Experiencia perfecta de navegación desde dispositivos móviles.'
        }
      ],
      technologies: ['Angular 19', 'PHP 8.5', 'MySQL', 'TailwindCSS'],
      stats: [
        { label: 'Materiales', value: '+300' },
        { label: 'Atención', value: '24/7' },
        { label: 'Carga Móvil', value: '< 250ms' },
        { label: 'Disponibilidad', value: '99.9%' }
      ],
      rotbotPrompt: 'Hola, quiero una tienda e-commerce como ESPUMAS Y PLÁSTICOS con catálogo industrial y cotizador.'
    },
    {
      id: 'plaxtilineas',
      code: 'CORP_06',
      badge: 'PORTAL CORPORATIVO',
      title: 'PLAXTILÍNEAS',
      tagline: 'Portal corporativo e industrial de empaques y soluciones plásticas avanzadas.',
      category: 'Sistemas Corporativos',
      client: 'Plaxtilíneas Colombia',
      year: '2026',
      liveUrl: 'https://plaxtilineas.com/',
      image: 'assets/images/proyectos/plaxtilineas/plaxti-1.png',
      images: [
        'assets/images/proyectos/plaxtilineas/plaxti-1.png',
        'assets/images/proyectos/plaxtilineas/plaxti-2.png',
        'assets/images/proyectos/plaxtilineas/plaxti-3.png',
        'assets/images/proyectos/plaxtilineas/plaxti-4.png',
        'assets/images/proyectos/plaxtilineas/plaxti-5.png'
      ],
      mobileImages: [
        'assets/images/proyectos/plaxtilineas/plaxti-1movil.jpeg',
        'assets/images/proyectos/plaxtilineas/plaxti-2movil.jpeg',
        'assets/images/proyectos/plaxtilineas/plaxti-3movil.jpeg'
      ],
      description: 'Portal institucional e industrial para la exhibición de líneas de bolsas, empaques y plásticos biodegradables.',
      longDescription: `PLAXTILÍNEAS es el portal corporativo maestro para una firma líder en fabricación y distribución de empaques sintéticos e industriales.

Destaca por su presentación visual de alto impacto, catálogo interactivo de líneas de producción y canal directo de cotizaciones para clientes corporativos.`,
      highlights: [
        'Exhibición corporativa de líneas de producción y certificados de calidad',
        'Formulario interactivo de cotización según especificaciones de fábrica',
        'Galería de aplicaciones en la industria de alimentos, comercio y logística',
        'Optimización SEO de alto rendimiento para búsqueda orgánica'
      ],
      features: [
        {
          icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
          title: 'Showcase Industrial',
          desc: 'Demostración visual de productos y capacidades de producción.'
        },
        {
          icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10',
          title: 'Generador de Presupuestos',
          desc: 'Solicitud asistida de cotizaciones por millares o toneladas.'
        },
        {
          icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z',
          title: 'WhatsApp Empresarial',
          desc: 'Enlace directo con ingenieros de producto.'
        },
        {
          icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
          title: 'Velocidad & SEO',
          desc: 'Posicionamiento Google optimizado y carga bajo 200ms.'
        }
      ],
      technologies: ['Angular 19', 'PHP 8.5', 'MySQL', 'SEO Pro'],
      stats: [
        { label: 'Capacidad', value: 'Industrial' },
        { label: 'Carga', value: '< 200ms' },
        { label: 'Seguridad', value: 'SSL 256bit' },
        { label: 'Disponibilidad', value: '99.9%' }
      ],
      rotbotPrompt: 'Hola, necesito un portal corporativo como PLAXTILÍNEAS con catálogo industrial y cotización en línea.'
    },
    {
      id: 'tiendaintima',
      code: 'ECOM_07',
      badge: 'TIENDA + IA',
      title: 'TIENDA ÍNTIMA',
      tagline: 'E-commerce de moda íntima con motor de recomendación inteligente.',
      category: 'E-commerce + IA',
      client: 'Boutique Íntima Boutique',
      year: '2026',
      liveUrl: 'https://tiendaintima.com/',
      image: 'assets/images/proyectos/proyecto-tiendaintima.png',
      images: [
        'assets/images/proyectos/proyecto-tiendaintima.png',
        'assets/images/proyectos/tiendaintima/tienda-1.png',
        'assets/images/proyectos/tiendaintima/tienda2.png',
        'assets/images/proyectos/tiendaintima/tienda3.png',
        'assets/images/proyectos/tiendaintima/tienda4.png',
        'assets/images/proyectos/tiendaintima/tienda5.png',
        'assets/images/proyectos/tiendaintima/tienda-5.png'
      ],
      mobileImages: [
        'assets/images/proyectos/tiendaintima/tienda-movil.jpeg',
        'assets/images/proyectos/tiendaintima/tienda-movil2.jpeg',
        'assets/images/proyectos/tiendaintima/tienda-movil3.jpeg'
      ],
      description: 'E-commerce para moda íntima con IA para gestión de productos y recomendaciones.',
      longDescription: `TIENDA ÍNTIMA combina elegancia, privacidad y tecnología de personalización avanzada.

Ofrece un catálogo refinado con recomendador inteligente de tallas y combinaciones, carrito ultrarrápido y un panel administrativo completo para monitorear tendencias de compra e inventario en vivo.`,
      highlights: [
        'Motor de recomendación de tallas y conjuntos por inteligencia artificial',
        'Proceso de compra discreto y ultrarrápido optimizado para teléfonos',
        'Panel administrativo de ofertas relámpago y cupones personalizados',
        'Diseño visual de alta estética con transiciones cinemáticas'
      ],
      features: [
        {
          icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
          title: 'Recomendador IA',
          desc: 'Sugerencias personalizadas según preferencias de estilo y medidas.'
        },
        {
          icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
          title: 'Carrito Expreso',
          desc: 'Experiencia de pago en menos de 3 pasos con confirmación instantánea.'
        },
        {
          icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
          title: 'Despacho Discreto',
          desc: 'Empaque neutro garantizado y trazabilidad en tiempo real.'
        },
        {
          icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10',
          title: 'Panel de Promociones',
          desc: 'Módulo de ofertas relámpago, combos e incentivos de recompra.'
        }
      ],
      technologies: ['Angular 19', 'PHP 8.5', 'MySQL', 'TailwindCSS', 'AI Recommender'],
      stats: [
        { label: 'Ventas Mensuales', value: '+850' },
        { label: 'Recompra', value: '38%' },
        { label: 'Satisfacción', value: '99%' },
        { label: 'Disponibilidad', value: '99.9%' }
      ],
      rotbotPrompt: 'Hola, quiero una tienda E-commerce con panel de administración e inteligencia artificial integrada, similar a TIENDA ÍNTIMA.'
    },
    {
      id: 'asistente-ia',
      code: 'SYS_08',
      badge: 'IA COPILOTO',
      title: 'ASISTENTE IA',
      tagline: 'Sistema de gestión empresarial con copiloto de inteligencia artificial.',
      category: 'Sistemas + IA',
      client: 'PortaLink AI Ecosystem',
      year: '2026',
      liveUrl: 'https://espumasyplasticos.com/',
      image: 'assets/images/proyectos/proyecto-asistenteia.png',
      images: [
        'assets/images/proyectos/proyecto-asistenteia.png',
        'assets/images/proyectos/proyecto-0.png'
      ],
      description: 'Panel de administración empresarial con copiloto IA que responde consultas en tiempo real.',
      longDescription: `ASISTENTE IA es la máxima expresión de asistencia corporativa basada en Inteligencia Artificial.

Conectado a la base de datos empresarial, este copiloto comprende instrucciones en lenguaje natural, redacta informes, calcula ticket promedio, proyecta metas de ventas y aconseja acciones comerciales para optimizar inventarios.`,
      highlights: [
        'Consultas directas a la base de datos en tiempo real mediante chat inteligente',
        'Dashboard ejecutivo interactivo con métricas dinámicas y gráficos analíticos',
        'Control de acceso con roles de usuario y permisos personalizados',
        'Soporte completo PWA para ser consultado como App móvil en teléfonos'
      ],
      features: [
        {
          icon: 'M13 10V3L4 14h7v7l9-11h-7z',
          title: 'Motor de IA RotBot',
          desc: 'Respuestas ejecutivas inmediatas fundamentadas en datos reales.'
        },
        {
          icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10',
          title: 'Analítica Predictiva',
          desc: 'Tendencias de consumo, patrones de compra y proyección de ventas.'
        },
        {
          icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
          title: 'Seguridad Multi-Rol',
          desc: 'Niveles de privacidad strictly para ejecutivos y vendedores.'
        },
        {
          icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
          title: 'App Móvil PWA',
          desc: 'Acceso corporativo seguro desde cualquier smartphone o tablet.'
        }
      ],
      technologies: ['Angular 19', 'PHP 8.5', 'Groq AI (Llama 3)', 'MySQL', 'SSE'],
      stats: [
        { label: 'Automatización', value: '94%' },
        { label: 'Tiempo Resp.', value: '< 400ms' },
        { label: 'Precisión IA', value: '99.2%' },
        { label: 'Disponibilidad', value: '99.9%' }
      ],
      rotbotPrompt: 'Hola, necesito un sistema de gestión con copiloto de inteligencia artificial integrado, como ASISTENTE IA.'
    }
  ];

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'] || 'camascotas';
      this.loadProject(id);
    });

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  loadProject(id: string) {
    const found = this.projectsData.find(p => p.id.toLowerCase() === id.toLowerCase());
    if (found) {
      this.project = found;
      this.activeImage = found.images && found.images.length > 0 ? found.images[0] : found.image;
      this.activeMediaType = 'image';
    } else {
      // Default fallback
      this.project = this.projectsData[0];
      this.activeImage = this.projectsData[0].images && this.projectsData[0].images.length > 0 ? this.projectsData[0].images[0] : this.projectsData[0].image;
      this.activeMediaType = 'image';
    }
  }

  goBack() {
    this.router.navigate(['/proyectos']);
  }

  openWhatsappQuote() {
    if (this.project) {
      const messageText = `Hola, quiero un proyecto como el de ${this.project.title}`;
      const whatsappUrl = `https://wa.me/573054078225?text=${encodeURIComponent(messageText)}`;
      window.open(whatsappUrl, '_blank');
    }
  }
}
