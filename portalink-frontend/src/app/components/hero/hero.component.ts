import { Component, Input, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-hero',
    standalone: true,
    imports: [CommonModule, RouterModule],
    encapsulation: ViewEncapsulation.None,
    template: `
    <ng-container *ngIf="!isLoading; else skeleton">
      <section id="hero" class="relative min-h-screen w-full flex items-center justify-center overflow-hidden">

      <div class="container mx-auto px-6 pt-24 pb-28 md:pt-32 md:pb-12 grid grid-cols-1 lg:grid-cols-[45%_55%] gap-8 md:gap-12 items-center relative z-10">
        <!-- Text Content -->
        <div class="w-full">
          <!-- Author / Brand Tag -->
          <div class="flex items-center gap-4 mb-4 hero-animate-1">
            <div class="h-px w-12" style="background-color: var(--text-primary); opacity: 0.4;"></div>
            <span class="text-xs sm:text-sm font-mono font-bold uppercase tracking-[0.4em] hero-author-text">
              {{ getTranslation().author }}
            </span>
          </div>

          <!-- Main Title -->
          <h1 class="text-4xl sm:text-6xl md:text-[68px] font-headline uppercase leading-[0.96] tracking-tight mb-4 hero-title hero-animate-2">
            <span class="title-name">{{ getTranslation().mainTitle }}</span>
          </h1>
          
          <!-- Role Subtitle -->
          <div class="flex items-center gap-4 mb-8 hero-animate-3">
            <div class="h-px w-12 bg-[var(--accent-color,#00f5ff)]" style="opacity: 0.8;"></div>
            <span class="text-xs sm:text-sm font-mono font-extrabold uppercase tracking-[0.35em] text-[var(--accent-color,#00f5ff)]">
              {{ getTranslation().role }}
            </span>
          </div>

          <!-- 3 Minimalist Action Buttons -->
          <div class="flex flex-col gap-3.5 w-full max-w-xl mt-8 hero-animate-4">
            
            <!-- Button 1: Rotbot AI -->
            <a routerLink="/rotbot" class="hero-btn-rotbot group cursor-pointer">
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-[var(--accent-color,#00f5ff)] group-hover:scale-105 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                <span class="text-xs sm:text-sm font-bold uppercase tracking-wider">
                  {{ getTranslation().btnRotbot }}
                </span>
              </div>
              <svg class="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </a>

            <!-- Buttons 2 & 3 Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
              <!-- Button 2: Conoce mis proyectos -->
              <a (click)="scrollTo('#portfolio', $event)" 
                 routerLink="/planes-galeria"
                 class="hero-btn-sub group">
                <div class="flex items-center gap-2.5">
                  <svg class="w-4 h-4 text-current opacity-70 group-hover:scale-105 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                    <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                  </svg>
                  <span>{{ getTranslation().btnProyectos }}</span>
                </div>
                <svg class="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </a>

              <!-- Button 3: Comunícate conmigo (Green Button) -->
              <a href="https://wa.me/573054078225" 
                 target="_blank"
                 class="hero-btn-green group">
                <div class="flex items-center gap-2.5">
                  <svg class="w-4 h-4 text-black group-hover:scale-105 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.151 4.207 4.294-1.127z"/>
                  </svg>
                  <span>{{ getTranslation().btnContacto }}</span>
                </div>
                <svg class="w-4 h-4 text-black opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7 17L17 7M17 7H7M17 7V17"/>
                </svg>
              </a>
            </div>

          </div>
        </div>

        <!-- Single Large Featured Showcase Image Column -->
        <div class="w-full py-4 flex flex-col items-center lg:items-start hero-animate-5">
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
          <div class="w-full space-y-6">
            <div class="flex items-center gap-4">
              <div class="h-px w-10 opacity-20" style="background-color: var(--text-primary);"></div>
              <div class="h-3 w-32 rounded-full opacity-20" style="background-color: var(--text-primary);"></div>
            </div>
            <div class="space-y-4">
              <div class="h-16 md:h-20 w-3/4 rounded-2xl opacity-20" style="background-color: var(--text-primary);"></div>
            </div>
          </div>
        </div>
      </section>
    </ng-template>
  `,
    styles: [`
    .hero-title .title-name {
      color: var(--text-primary, #ffffff);
    }
    .theme-light .hero-title .title-name {
      color: #0d0d0d;
    }
    .hero-author-text {
      color: var(--text-secondary, rgba(255,255,255,0.7));
    }
    .theme-light .hero-author-text {
      color: #555555;
    }
    .hero-author-badge {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.12);
    }
    .theme-light .hero-author-badge {
      background: rgba(0, 0, 0, 0.04);
      border-color: rgba(0, 0, 0, 0.1);
    }
    .hero-role-badge {
      background: rgba(0, 245, 255, 0.06);
      border-color: rgba(0, 245, 255, 0.25);
    }
    .theme-light .hero-role-badge {
      background: rgba(0, 180, 216, 0.08);
      border-color: rgba(0, 180, 216, 0.25);
    }
    .hero-btn-rotbot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.1rem 1.5rem;
      border-radius: 1rem;
      background: #0d0d0d;
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.12);
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
      text-decoration: none;
    }
    .theme-light .hero-btn-rotbot {
      background: #000000;
      color: #ffffff;
      border-color: rgba(0, 0, 0, 0.15);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
    }
    .hero-btn-rotbot:hover {
      background: #141414;
      border-color: rgba(255, 255, 255, 0.25);
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    }
    .theme-light .hero-btn-rotbot:hover {
      background: #1a1a1a;
      border-color: rgba(0, 0, 0, 0.25);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
    }

    .hero-btn-sub {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.35rem;
      border-radius: 1rem;
      background: transparent;
      color: var(--text-primary, #ffffff);
      border: 1px solid var(--card-border, rgba(255, 255, 255, 0.14));
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      text-decoration: none;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      cursor: pointer;
    }
    .theme-light .hero-btn-sub {
      background: #ffffff;
      border-color: rgba(0, 0, 0, 0.12);
      color: #111111;
      box-shadow: 0 2px 10px rgba(0,0,0,0.03);
    }
    .hero-btn-sub:hover {
      background: var(--text-primary, #ffffff);
      color: var(--bg-primary, #050505);
      border-color: var(--text-primary, #ffffff);
      transform: translateY(-2px);
    }
    .theme-light .hero-btn-sub:hover {
      background: #000000;
      color: #ffffff;
      border-color: #000000;
    }

    .hero-btn-green {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.35rem;
      border-radius: 1rem;
      background: #25D366;
      color: #000000;
      border: 1px solid #25D366;
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      text-decoration: none;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      box-shadow: 0 4px 15px rgba(37, 211, 102, 0.2);
      cursor: pointer;
    }
    .hero-btn-green:hover {
      background: #20bd5a;
      border-color: #20bd5a;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(37, 211, 102, 0.35);
    }
    .theme-light .hero-btn-green {
      background: #25D366;
      color: #000000;
      border-color: #25D366;
      box-shadow: 0 4px 15px rgba(37, 211, 102, 0.25);
    }
    .theme-light .hero-btn-green:hover {
      background: #20bd5a;
      border-color: #20bd5a;
    }
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }

    @keyframes heroFadeUp {
      from {
        opacity: 0;
        transform: translateY(28px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .hero-animate-1 {
      animation: heroFadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      animation-delay: 0.05s;
      opacity: 0;
    }
    .hero-animate-2 {
      animation: heroFadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      animation-delay: 0.18s;
      opacity: 0;
    }
    .hero-animate-3 {
      animation: heroFadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      animation-delay: 0.32s;
      opacity: 0;
    }
    .hero-animate-4 {
      animation: heroFadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      animation-delay: 0.46s;
      opacity: 0;
    }
    .hero-animate-5 {
      animation: heroFadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      animation-delay: 0.6s;
      opacity: 0;
    }
  `]
})
export class HeroComponent implements OnInit, OnDestroy {
  @Input() data: any;
  isLoading = true;

  currentLanguage = 'es';

  translations: any = {
    es: {
      author: 'Santiago Arbelaez Contreras',
      mainTitle: 'TRANSFORMA TU NEGOCIO DIGITALMENTE',
      role: 'desarrollador web — creador digital',
      btnRotbot: '¿Tienes una idea? Transforma esa idea con Rotbot',
      btnProyectos: 'Conoce mis proyectos',
      btnContacto: 'Comunícate conmigo',
      ctaText: 'Ver Proyectos',
      featured: {
        title: 'Portalink Ecosystem',
        description: 'Plataforma integral multinegocio a medida con diseño exclusivo e Inteligencia Artificial.'
      }
    },
    en: {
      author: 'Santiago Arbelaez Contreras',
      mainTitle: 'TRANSFORM YOUR BUSINESS DIGITALLY',
      role: 'web developer — digital creator',
      btnRotbot: 'Have an idea? Transform it with Rotbot',
      btnProyectos: 'Discover my projects',
      btnContacto: 'Get in touch with me',
      ctaText: 'View Projects',
      featured: {
        title: 'Portalink Ecosystem',
        description: 'Custom all-in-one platform with bespoke design and artificial intelligence.'
      }
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
