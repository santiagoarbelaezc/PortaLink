import { Component, inject, signal, OnInit, OnDestroy, effect, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';

import { HeroComponent } from '../../components/hero/hero.component';
import { PortfolioComponent } from '../../components/portfolio/portfolio.component';
import { AboutComponent } from '../../components/about/about.component';
import { SkillsComponent } from '../../components/skills/skills.component';
import { ContactComponent } from '../../components/contact/contact.component';
import { FooterComponent } from '../../components/footer/footer.component';



import { ScrollColorService } from '../../services/scroll-color.service';
import { PortfolioConfigService } from '../../services/portfolio-config.service';
import { AiChatFloatingComponent } from '../../components/ai-chat-floating/ai-chat-floating.component';
import { Subscription } from 'rxjs';
import { AnalyticsService } from '../../services/analytics.service';

import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeroComponent,
    PortfolioComponent,
    AboutComponent,
    SkillsComponent,
    ContactComponent,
    FooterComponent
  ],
  template: `
    <div class="dynamic-bg"></div>
    <main class="relative text-white" *ngIf="portfolioData()">
      <app-hero [data]="portfolioData().hero"></app-hero>
      
      <!-- ═══════════════════════════════════════════════════════════ -->
      <!-- GALERÍA DE PROYECTOS REALIZADOS                            -->
      <!-- ═══════════════════════════════════════════════════════════ -->
      <section class="projects-showcase-section relative bg-[#080808] py-24 px-6 sm:px-12 lg:px-20 overflow-hidden">

        <!-- Línea decorativa superior -->
        <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

        <!-- Encabezado editorial -->
        <div class="max-w-[1500px] mx-auto mb-16">
          <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/30 text-[10px] uppercase tracking-[0.25em] font-mono font-bold text-[var(--accent-color)] mb-4">
                <span class="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] animate-pulse"></span>
                SHOWCASE DE PROYECTOS
              </div>
              <h2 class="text-4xl sm:text-5xl lg:text-6xl font-headline font-black uppercase tracking-tight text-white leading-[1.05]">
                Trabajos Realizados
              </h2>
              <p class="text-sm text-white/50 mt-3 font-light max-w-lg leading-relaxed">
                Una selección de proyectos construidos a medida: e-commerce, sistemas de gestión y plataformas con inteligencia artificial.
              </p>
            </div>
            <a routerLink="/planes-galeria" class="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-[var(--accent-color)]/10 hover:border-[var(--accent-color)]/40 text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white transition-all duration-200 flex-shrink-0 whitespace-nowrap">
              Ver galería completa
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
            </a>
          </div>
        </div>

        <!-- Grid 2 columnas -->
        <div class="max-w-[1500px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

          <div *ngFor="let p of showcaseProjects" 
               class="project-card group relative rounded-[28px] overflow-hidden cursor-pointer"
               (click)="openChatWithMessage(p.prompt)">

            <!-- Imagen de fondo en proporción 16:9 -->
            <div class="relative w-full overflow-hidden" style="aspect-ratio: 16/9;">
              <img [src]="p.image" [alt]="p.title"
                   loading="lazy" decoding="async"
                   class="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105">

              <!-- Gradiente sobre imagen -->
              <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
              <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent"></div>

              <!-- Badge superior izquierdo -->
              <div class="absolute top-4 left-4">
                <span class="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/60 group-hover:text-[var(--accent-color)] transition-colors">#{{ p.code }}</span>
              </div>

              <!-- Badge superior derecho -->
              <div class="absolute top-4 right-4">
                <span class="px-3 py-1 rounded-lg bg-white text-black text-[10px] font-extrabold uppercase tracking-widest shadow-md">
                  + {{ p.badge }}
                </span>
              </div>

              <!-- Contenido inferior sobre la imagen -->
              <div class="absolute bottom-0 left-0 right-0 p-6">
                <!-- Tagline -->
                <div class="flex items-start gap-2.5 mb-2">
                  <div class="w-0.5 h-6 bg-[var(--accent-color)] flex-shrink-0 rounded-full mt-0.5"></div>
                  <p class="text-xs text-white/70 font-light leading-relaxed">{{ p.tagline }}</p>
                </div>
                <!-- Título -->
                <h3 class="text-3xl sm:text-4xl font-headline font-black uppercase tracking-tight text-white group-hover:text-[var(--accent-color)] transition-colors duration-200 leading-none">
                  {{ p.title }}
                </h3>
              </div>

              <!-- Overlay hover central -->
              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div class="w-16 h-16 rounded-full bg-[var(--accent-color)] text-black flex items-center justify-center shadow-[0_0_40px_rgba(0,245,255,0.6)] scale-90 group-hover:scale-100 transition-transform duration-300">
                  <svg class="w-7 h-7 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Zona inferior: descripción + acción -->
            <div class="px-2 pt-5 pb-2 flex items-start justify-between gap-4">
              <p class="text-xs sm:text-[13px] text-white/55 font-light leading-relaxed line-clamp-2 flex-1">
                {{ p.description }}
              </p>
              <button (click)="openChatWithMessage(p.prompt); $event.stopPropagation()"
                      class="flex-shrink-0 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent-color)] flex items-center gap-1.5 hover:gap-3 transition-all duration-200 whitespace-nowrap mt-0.5">
                CONOCE MÁS
                <span class="text-base font-extrabold">+</span>
              </button>
            </div>

          </div>

        </div>

        <!-- Línea decorativa inferior -->
        <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </section>

      <section class="rotbot-banner relative">
        <video #robotVideo autoplay [muted]="true" onvolumechange="this.muted=true; this.volume=0;" volume="0" loop playsinline class="video-bg">
          <source src="assets/videos/video-robot.mp4" type="video/mp4">
        </video>
        <div class="overlay"></div>
        
        <div class="container mx-auto px-6 relative z-10 w-full h-full flex items-center py-16 md:py-24">
          <div class="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-12 lg:gap-20 w-full items-center">
            
            <!-- Left Side: Header -->
            <div class="text-left max-w-xl">
              <span class="text-[10px] uppercase tracking-[0.4em] font-bold block mb-4" style="color: var(--text-secondary);">
                {{ getTranslation().agentLabel }}
              </span>
              <h2 class="text-4xl sm:text-5xl md:text-6xl font-headline uppercase leading-[1.05] tracking-tighter mb-4 text-white">
                {{ getTranslation().title }}<span style="color: var(--accent-color);">Rotbot</span>{{ getTranslation().titleAsistente }}
              </h2>
            </div>
            
            <!-- Right Side: Interaction Grid -->
            <div class="flex flex-col gap-6 lg:items-end">
              <div class="w-full lg:max-w-xl flex flex-col gap-4 text-left">
                
                <!-- Option Card 1 -->
                <div (click)="openChatWithMessage(getTranslation().option1Msg)" 
                     class="glass-option-card border p-6 rounded-[24px] transition-all duration-300 hover:translate-x-2 flex items-center justify-between group cursor-pointer"
                     style="border-color: var(--card-border); background: rgba(0,0,0,0.45);">
                  <div class="flex items-center gap-4">
                    <div class="w-2.5 h-2.5 rounded-full transition-all duration-300 group-hover:scale-150 shadow-[0_0_8px_var(--accent-color)]" style="background-color: var(--accent-color);"></div>
                    <span class="text-sm sm:text-base font-bold tracking-wide uppercase text-white opacity-85 group-hover:opacity-100 transition-opacity">
                      {{ getTranslation().option1Label }}
                    </span>
                  </div>
                  <svg class="w-5 h-5 text-white/50 group-hover:text-white transition-all transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
                
                <!-- Option Card 2 -->
                <div (click)="openChatWithMessage(getTranslation().option2Msg)" 
                     class="glass-option-card border p-6 rounded-[24px] transition-all duration-300 hover:translate-x-2 flex items-center justify-between group cursor-pointer"
                     style="border-color: var(--card-border); background: rgba(0,0,0,0.45);">
                  <div class="flex items-center gap-4">
                    <div class="w-2.5 h-2.5 rounded-full transition-all duration-300 group-hover:scale-150 shadow-[0_0_8px_var(--accent-color)]" style="background-color: var(--accent-color);"></div>
                    <span class="text-sm sm:text-base font-bold tracking-wide uppercase text-white opacity-85 group-hover:opacity-100 transition-opacity">
                      {{ getTranslation().option2Label }}
                    </span>
                  </div>
                  <svg class="w-5 h-5 text-white/50 group-hover:text-white transition-all transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
                
                <!-- Option Card 3 -->
                <div (click)="openChatWithMessage(getTranslation().option3Msg)" 
                     class="glass-option-card border p-6 rounded-[24px] transition-all duration-300 hover:translate-x-2 flex items-center justify-between group cursor-pointer"
                     style="border-color: var(--card-border); background: rgba(0,0,0,0.45);">
                  <div class="flex items-center gap-4">
                    <div class="w-2.5 h-2.5 rounded-full transition-all duration-300 group-hover:scale-150 shadow-[0_0_8px_var(--accent-color)]" style="background-color: var(--accent-color);"></div>
                    <span class="text-sm sm:text-base font-bold tracking-wide uppercase text-white opacity-85 group-hover:opacity-100 transition-opacity">
                      {{ getTranslation().option3Label }}
                    </span>
                  </div>
                  <svg class="w-5 h-5 text-white/50 group-hover:text-white transition-all transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
                
              </div>
            </div>
            
          </div>
        </div>
      </section>

      <app-portfolio [projects]="portfolioData().portfolio"></app-portfolio>
      <app-about [data]="portfolioData().about"></app-about>
      <app-skills [skills]="portfolioData().skills"></app-skills>
      <app-contact [data]="portfolioData().contact"></app-contact>
      


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
      code: 'ECOM_01', badge: 'E-COMMERCE',
      tagline: 'Tienda de mobiliario premium para mascotas con catálogo interactivo.',
      title: 'CAMASCOTAS',
      image: 'assets/images/proyectos/proyecto1.png',
      description: 'E-commerce completo de muebles y accesorios para mascotas con catálogo, carrito, panel de administración y diseño responsive.',
      prompt: 'Hola, quiero una tienda E-commerce como CAMASCOTAS con catálogo, carrito de compras y panel de administración para mi negocio.'
    },
    {
      code: 'SYS_02', badge: 'SISTEMA + IA',
      tagline: 'Catálogo digital inteligente con analítica y asistente IA en tiempo real.',
      title: 'SYSMICON',
      image: 'assets/images/proyectos/proyecto2.png',
      description: 'Plataforma de catálogo digital con IA integrada. Gestión de productos, inventario multi-línea y reportes analíticos automáticos.',
      prompt: 'Hola, necesito un sistema de catálogo digital con inteligencia artificial para gestionar mis productos, similar a SYSMICON.'
    },
    {
      code: 'ECOM_03', badge: 'TIENDA + IA',
      tagline: 'E-commerce de moda íntima con panel administrativo y asistente inteligente.',
      title: 'TIENDAÍNTIMA',
      image: 'assets/images/proyectos/proyecto3.png',
      description: 'Comercio electrónico para moda íntima con IA para gestión de productos, análisis de ventas e inventario en tiempo real.',
      prompt: 'Hola, quiero una tienda E-commerce con panel de administración e inteligencia artificial integrada, similar a TIENDAÍNTIMA.'
    },
    {
      code: 'SYS_04', badge: 'IA COPILOTO',
      tagline: 'Sistema de gestión empresarial con copiloto de inteligencia artificial.',
      title: 'ASISTENTE IA',
      image: 'assets/images/proyectos/proyecto4.png',
      description: 'Panel de administración empresarial con copiloto IA que responde consultas, analiza inventarios y apoya decisiones en tiempo real.',
      prompt: 'Hola, necesito un sistema de gestión con copiloto de inteligencia artificial integrado, como ASISTENTE IA.'
    },
    {
      code: 'ECOM_05', badge: 'E-COMMERCE',
      tagline: 'Tienda de colchones premium con consulta directa por WhatsApp.',
      title: 'DISTRICOL',
      image: 'assets/images/proyectos/proyecto5.png',
      description: 'E-commerce de colchones y descanso con catálogo HD, ficha de producto, consulta WhatsApp e integración con inventario en vivo.',
      prompt: 'Hola, quiero una tienda E-commerce de productos premium con catálogo, ficha de producto y WhatsApp, similar a DISTRICOL.'
    },
    {
      code: 'SYS_06', badge: 'PLATAFORMA',
      tagline: 'Portal directivo para gestión de proyectos de arquitectura y diseño CAD.',
      title: 'SYSMICON PORTAL',
      image: 'assets/images/proyectos/proyecto6.png',
      description: 'Plataforma directiva con dashboard de cotizaciones, diseños CAD, galería visual inmersiva y comunidad de +500 profesionales.',
      prompt: 'Hola, necesito una plataforma de gestión de proyectos con dashboard ejecutivo y galería visual, similar a SYSMICON PORTAL.'
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
