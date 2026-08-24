import { Component, inject, signal, OnInit, OnDestroy, effect, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';

import { HeroVideoComponent } from '../../components/hero-video/hero-video.component';
import { HeroDesignComponent } from '../../components/hero-design/hero-design.component';
import { AboutComponent } from '../../components/about/about.component';
import { ContactComponent } from '../../components/contact/contact.component';
import { FooterComponent } from '../../components/footer/footer.component';

import { ScrollColorService } from '../../services/scroll-color.service';
import { PortfolioConfigService } from '../../services/portfolio-config.service';
import { AiChatFloatingComponent } from '../../components/ai-chat-floating/ai-chat-floating.component';
import { Subscription } from 'rxjs';
import { AnalyticsService } from '../../services/analytics.service';

import { Router, RouterModule } from '@angular/router';
import * as AOS from 'aos';

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeroVideoComponent,
    HeroDesignComponent,
    AboutComponent,
    ContactComponent,
    FooterComponent
  ],
  template: `
    <div class="dynamic-bg"></div>
    <main class="relative text-neutral-900">
      <app-hero-design></app-hero-design>
      <!-- <app-hero-video></app-hero-video> -->
      
      <ng-container *ngIf="portfolioData(); else homeSkeleton">
      
      <!-- ═══════════════════════════════════════════════════════════ -->
      <!-- GALERÍA DE PROYECTOS REALIZADOS (ESTILO APPLE ULTRALIMPIO)   -->
      <!-- ═══════════════════════════════════════════════════════════ -->
      <section class="projects-showcase-section relative py-12 md:py-20 px-6 sm:px-12 lg:px-20 overflow-hidden bg-white text-neutral-900 transition-colors duration-500">

        <!-- Encabezado Editorial -->
        <div class="max-w-[1500px] mx-auto mb-12 sm:mb-16">
          <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div class="space-y-2">
              <h2 class="text-4xl sm:text-5xl lg:text-6xl font-headline font-semibold tracking-tight leading-[1.08]" style="color: #0a0a0a !important;">
                Trabajos Realizados
              </h2>
              <p class="text-base sm:text-lg font-sans font-normal text-neutral-600 max-w-xl leading-relaxed">
                Una selección de proyectos construidos a medida: e-commerce, sistemas de gestión y plataformas de alto impacto.
              </p>
            </div>
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <a routerLink="/prototipos" class="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full font-headline font-medium text-xs tracking-wider transition-all duration-300 cursor-pointer shadow-sm border border-neutral-200 bg-neutral-100 hover:bg-neutral-200 text-neutral-900">
                <svg class="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/></svg>
                <span>Prototipos de Diseños</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Grid de Proyectos Creativo Asimétrico con AOS (Estilo Apple) -->
        <div class="max-w-[1500px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">

          <div *ngFor="let p of showcaseProjects; let i = index" 
               [ngClass]="getProjectGridClass(p.id)"
               class="group relative rounded-[28px] sm:rounded-[36px] overflow-hidden border border-neutral-200/80 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.04)] transition-all duration-500 hover:scale-[1.01] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-col justify-between cursor-pointer"
               [routerLink]="['/proyecto', p.id]"
               data-aos="fade-up"
               data-aos-duration="900"
               [attr.data-aos-delay]="(i % 2) * 150">

            <!-- Imagen del proyecto limpia (aspect-ratio dinámico) -->
            <div class="relative w-full overflow-hidden bg-neutral-50" [ngClass]="getProjectAspectClass(p.id)">
              <img [src]="p.image" [alt]="p.title"
                   loading="lazy" decoding="async"
                   class="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105">
            </div>

            <!-- Información Inferior Limpia en Blanco Puro (Sin descripción, sin botón en vivo) -->
            <div class="p-5 sm:p-6 flex items-center justify-between gap-3 bg-white border-t border-neutral-100/80">
              
              <h3 class="text-xl sm:text-2xl font-headline font-semibold tracking-tight leading-snug" style="color: #0a0a0a !important;">
                {{ p.title }}
              </h3>

              <!-- Único Botón: Ver Detalles -->
              <a [routerLink]="['/proyecto', p.id]" 
                 (click)="$event.stopPropagation()"
                 class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-headline font-medium text-xs transition-all duration-300 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98] no-underline border-none flex-shrink-0"
                 style="background-color: #09090b !important; color: #ffffff !important;">
                <span>Ver Detalles</span>
                <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="color: #ffffff !important;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                </svg>
              </a>

            </div>

          </div>

        </div>

        <!-- Mobile Bottom Callout Banner for Prototypes -->
        <div class="max-w-[1500px] mx-auto mt-8 sm:hidden px-2">
          <a routerLink="/prototipos" class="prototipos-mobile-banner flex items-center justify-between p-4 rounded-2xl transition-all duration-200 cursor-pointer">
            <div class="flex items-center gap-3">
              <div class="banner-icon-box w-10 h-10 rounded-xl flex items-center justify-center shadow-sm">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/></svg>
              </div>
              <div class="flex flex-col text-left">
                <span class="banner-title text-xs font-extrabold uppercase tracking-wide">Prototipos de Diseños</span>
                <span class="banner-subtitle text-[10px] font-medium normal-case">Explora maquetas y plantillas interactivas</span>
              </div>
            </div>
            <div class="banner-arrow-box w-7 h-7 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
            </div>
          </a>
        </div>

        <!-- Línea decorativa inferior -->
        <div class="showcase-line absolute bottom-0 left-0 right-0 h-px"></div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════ -->
      <!-- BANNER ROTBOT VIDEO (ESTILO ULTRALIMPIO APPLE)               -->
      <!-- ═══════════════════════════════════════════════════════════ -->
      <section class="rotbot-banner relative overflow-hidden py-16 md:py-24 px-6 sm:px-12 lg:px-20">
        <video #robotVideo autoplay [muted]="true" onvolumechange="this.muted=true; this.volume=0;" volume="0" loop playsinline class="video-bg">
          <source src="assets/videos/video-robot.mp4" type="video/mp4">
        </video>
        <div class="overlay bg-gradient-to-r from-black/90 via-black/70 to-black/85"></div>
        
        <div class="max-w-[1500px] mx-auto relative z-10 w-full flex items-center">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 w-full items-center">
            
            <!-- Encabezado RotBot (Separado Arriba en Móvil) -->
            <div class="rotbot-header text-left lg:col-span-6 space-y-3 sm:space-y-4" data-aos="fade-right" data-aos-duration="900">
              <h2 class="text-3xl sm:text-5xl lg:text-6xl font-headline font-semibold tracking-tight text-white leading-[1.08]">
                Habla con <span class="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">RotBot</span>, tu asistente inteligente
              </h2>

              <p class="text-sm sm:text-lg font-sans font-normal text-neutral-300 max-w-lg leading-relaxed">
                Interactúa en tiempo real con nuestra inteligencia artificial para consultar servicios, agendar citas o cotizar tu proyecto.
              </p>
            </div>
            
            <!-- Botón Único: Habla con RotBot IA (Estilo glass-option-card Original) -->
            <div class="rotbot-options lg:col-span-6 flex flex-col gap-3 sm:gap-4 mt-auto lg:mt-0" data-aos="fade-left" data-aos-duration="900" data-aos-delay="150">
              <a routerLink="/rotbot" 
                 class="glass-option-card border border-white/15 p-5 sm:p-6 rounded-[24px] bg-black/60 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:bg-black/80 flex items-center justify-between group cursor-pointer shadow-lg no-underline">
                <div class="flex items-center gap-4">
                  <div class="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#00f5ff] transition-transform duration-300 group-hover:scale-125"></div>
                  <span class="text-sm sm:text-base font-headline font-medium tracking-wide text-white/95 group-hover:text-white transition-colors">
                    Habla con RotBot IA
                  </span>
                </div>
                <svg class="w-5 h-5 text-white/50 group-hover:text-white transition-all transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            
          </div>
        </div>
      </section>

      <!-- <app-portfolio [projects]="portfolioData().portfolio"></app-portfolio> -->
      <app-about [data]="portfolioData().about"></app-about>
      <app-contact [data]="portfolioData().contact"></app-contact>
      </ng-container>

      <ng-template #homeSkeleton>
        <section class="py-12 md:py-20 px-6 sm:px-12 lg:px-20 bg-white">
          <div class="max-w-[1500px] mx-auto animate-pulse space-y-8">
            <div class="h-12 w-64 bg-neutral-100 rounded-2xl"></div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="h-72 sm:h-96 bg-neutral-100 rounded-3xl"></div>
              <div class="h-72 sm:h-96 bg-neutral-100 rounded-3xl"></div>
            </div>
          </div>
        </section>
      </ng-template>

      <app-footer></app-footer>
    </main>
  `,
  styleUrls: ['./proyectos.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ProyectosComponent implements OnInit, OnDestroy {
  private scrollColorService = inject(ScrollColorService);
  private configService = inject(PortfolioConfigService);
  private analyticsService = inject(AnalyticsService);

  currentBackground = '#000000';
  portfolioData = signal<any>(null);
  currentLanguage = 'es';
  private sub?: Subscription;
  private observer?: IntersectionObserver;
  private videoEl?: HTMLVideoElement;

  showcaseProjects = [
    {
      id: 'camascotas',
      code: 'ECOM_01', badge: 'E-COMMERCE',
      tagline: 'Tienda de mobiliario premium para mascotas con catálogo interactivo.',
      title: 'CamasCotas',
      liveUrl: 'https://camascotas.com/',
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/v1786973369/proyecto-camascotas_qcmstp.png',
      description: 'E-commerce completo de muebles y accesorios para mascotas con catálogo, carrito, panel de administración y diseño responsive.',
      prompt: 'Hola, quiero una tienda E-commerce como CamasCotas con catálogo, carrito de compras y panel de administración para mi negocio.'
    },
    {
      id: 'catalogodigital',
      code: 'SYS_03', badge: 'SISTEMA + IA',
      tagline: 'Catálogo digital inteligente con analítica y asistente IA en tiempo real.',
      title: 'Catálogo Digital Plaxtilíneas',
      liveUrl: 'https://catalogoplaxtilineas.com/catalogo',
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/v1786974186/proyecto-catalogodigital_obh8fu.png',
      description: 'Plataforma de catálogo digital con IA integrada. Gestión de productos, inventario multi-línea y reportes analíticos automáticos.',
      prompt: 'Hola, necesito un sistema de catálogo digital con inteligencia artificial para gestionar mis productos, similar a Catálogo Digital.'
    },
    {
      id: 'districol',
      code: 'ECOM_04', badge: 'E-COMMERCE',
      tagline: 'Tienda de colchones premium con consulta directa por WhatsApp.',
      title: 'Colchones Districol',
      liveUrl: 'https://colchonesdistricol.com/',
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/v1786973662/proyecto-colchonesdistricol_wlk93j.png',
      description: 'E-commerce de colchones y descanso con catálogo completo, ficha de producto, consulta WhatsApp e integración con inventario en vivo.',
      prompt: 'Hola, quiero una tienda E-commerce de productos premium con catálogo, ficha de producto y WhatsApp, similar a Colchones Districol.'
    },
    {
      id: 'sysmicon',
      code: 'SYS_02', badge: 'PLATAFORMA',
      tagline: 'Portal directivo para gestión de proyectos de arquitectura y diseño CAD.',
      title: 'Sysmicon',
      liveUrl: 'https://sysmicon.com/',
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/v1786973770/proyecto-sysmiconarquitectura_jxfoju.png',
      description: 'Plataforma directiva con dashboard de cotizaciones, diseños CAD, galería visual inmersiva y comunidad de profesionales.',
      prompt: 'Hola, necesito una plataforma de gestión de proyectos con dashboard ejecutivo y galería visual, similar a Sysmicon.'
    },
    {
      id: 'espumasyplasticos',
      code: 'ECOM_05', badge: 'E-COMMERCE',
      tagline: 'Plataforma e-commerce e industrial para soluciones de espumas y plásticos.',
      title: 'Espumas y Plásticos',
      liveUrl: 'https://espumasyplasticos.com/',
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/v1786974630/espumas-principal_dzeur0.jpg',
      description: 'Plataforma de comercio electrónico e industrial para soluciones en espumas, plásticos y materiales sintéticos.',
      prompt: 'Hola, quiero una tienda e-commerce como Espumas y Plásticos con catálogo industrial y cotizador.'
    },
    {
      id: 'plaxtilineas',
      code: 'CORP_06', badge: 'PLATAFORMA',
      tagline: 'Portal corporativo e industrial de empaques y soluciones plásticas.',
      title: 'Plaxtilíneas',
      liveUrl: 'https://plaxtilineas.com/',
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/v1786974786/plaxtilineas_lh6eaz.png',
      description: 'Portal institucional e industrial para la exhibición de líneas de bolsas, empaques y plásticos biodegradables.',
      prompt: 'Hola, necesito un portal corporativo como Plaxtilíneas con catálogo industrial y cotización en línea.'
    },
    {
      id: 'tiendaintima',
      code: 'ECOM_07', badge: 'TIENDA + IA',
      tagline: 'E-commerce de moda íntima con panel administrativo y asistente inteligente.',
      title: 'Tienda Íntima',
      liveUrl: 'https://tiendaintima.com/',
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/v1786973903/proyecto-tiendaintima_oahugr.png',
      description: 'Comercio electrónico para moda íntima con IA para gestión de productos, análisis de ventas e inventario en tiempo real.',
      prompt: 'Hola, quiero una tienda E-commerce con panel de administración e inteligencia artificial integrada, similar a TIENDA ÍNTIMA.'
    }
  ];

  translations: any = {
    es: {
      agentLabel: 'AGENTE INTELIGENTE',
      title: 'Habla con ',
      titleAsistente: ', tu asistente, para lo que necesites',
      option1Label: '¿Necesitas asesoría?',
      option1Msg: 'Necesito asesoría',
      option2Label: '¿Necesitas agendar una cita?',
      option2Msg: 'Necesito agendar una cita',
      option3Label: '¿Quieres crear un diseño para tu negocio?',
      option3Msg: 'Quiero crear un diseño para mi negocio'
    },
    en: {
      agentLabel: 'INTELLIGENT AGENT',
      title: 'Speak with ',
      titleAsistente: ', your assistant, for anything you need',
      option1Label: 'Need consultation?',
      option1Msg: 'I need consultation',
      option2Label: 'Need to schedule an appointment?',
      option2Msg: 'I need to schedule an appointment',
      option3Label: 'Want to create a design for your business?',
      option3Msg: 'I want to create a design for my business'
    }
  };

  @ViewChild('robotVideo') set robotVideo(el: ElementRef<HTMLVideoElement> | undefined) {
    if (el && el.nativeElement && !this.videoEl) {
      this.videoEl = el.nativeElement;
      this.setupIntersectionObserver();
    }
  }

  setupIntersectionObserver() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window && this.videoEl) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.videoEl?.play().catch(() => { });
          } else {
            this.videoEl?.pause();
          }
        });
      }, { threshold: 0.05 });
      this.observer.observe(this.videoEl);
    }
  }

  constructor() {
    // Initial sync with service
    effect(() => {
      const data = this.configService.data();
      if (data) {
        this.portfolioData.set(data);
        // Force recalculation after DOM renders
        setTimeout(() => this.scrollColorService.recalculate(), 100);
      }
    });
  }

  ngOnInit() {
    this.sub = this.scrollColorService.currentColor$.subscribe(c => this.currentBackground = c);

    // Listen for live preview updates from parent dashboard
    window.addEventListener('message', this.handleMessage);

    if (typeof window !== 'undefined') {
      AOS.init({
        duration: 900,
        once: true,
        easing: 'ease-out-cubic'
      });

      this.currentLanguage = localStorage.getItem('portfolio-language') || 'es';
      window.addEventListener('portfolio-language-change', this.onLanguageChange);

      // Track page views and load times
      this.analyticsService.incrementMetric('homeViews');

      if (window.performance) {
        setTimeout(() => {
          const t = window.performance.timing;
          if (t) {
            const loadTime = t.loadEventEnd - t.navigationStart;
            if (loadTime > 0) {
              this.analyticsService.recordLoadTime(loadTime);
            } else {
              this.analyticsService.recordLoadTime(Math.round(performance.now()));
            }
          }
        }, 200);
      }
    }
  }

  getProjectGridClass(id: string): string {
    switch (id) {
      case 'camascotas':
      case 'sysmicon':
      case 'tiendaintima':
        return 'col-span-12';
      default:
        return 'col-span-12 lg:col-span-6';
    }
  }

  getProjectAspectClass(id: string): string {
    if (['camascotas', 'sysmicon', 'tiendaintima'].includes(id)) {
      return 'aspect-[16/10] sm:aspect-[21/9]';
    }
    return 'aspect-[21/10]';
  }

  onLanguageChange = (event: any) => {
    this.currentLanguage = event.detail.language;
  };

  getTranslation() {
    return this.translations[this.currentLanguage] || this.translations['es'];
  }

  handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'PORTFOLIO_PREVIEW_UPDATE') {
      this.portfolioData.set(event.data.payload);
      // Force recalculation after preview update
      setTimeout(() => this.scrollColorService.recalculate(), 100);
    }
  }

  openChatWithMessage(message: string) {
    window.dispatchEvent(new CustomEvent('open-ai-chat', { detail: { message } }));
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    window.removeEventListener('message', this.handleMessage);
    if (this.observer) {
      this.observer.disconnect();
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('portfolio-language-change', this.onLanguageChange);
    }
  }
}
