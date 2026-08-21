import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface CarouselSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  liveUrl?: string;
}

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <main 
      (mouseenter)="pauseAutoPlay()"
      (mouseleave)="resumeAutoPlay()"
      class="hero-wrapper relative w-full min-h-screen lg:h-screen overflow-hidden bg-zinc-950 font-sans text-white select-none">
      
      <!-- CAPA 1: Fondo dinámico con overlay (Efecto Desvanecido Elegante) -->
      <div class="absolute inset-0 z-0 overflow-hidden">
        <img 
          [src]="currentSlide().image" 
          [alt]="currentSlide().title"
          class="w-full h-full object-cover brightness-[0.65] contrast-[1.08] transition-all duration-700 ease-out transform"
          [class.opacity-0]="isFading()"
          [class.opacity-100]="!isFading()"
          [class.scale-110]="isFading()"
          [class.scale-105]="!isFading()"
        />
        <div class="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent"></div>
        <div class="absolute inset-0 bg-black/30"></div>
      </div>

      <!-- CAPA 2: Header / Navegación Superior -->
      <header class="relative z-20 flex items-center justify-between px-6 sm:px-12 py-6 sm:py-8">
        <div class="text-xs sm:text-sm font-bold tracking-[0.25em] uppercase text-white/90 font-headline flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>PORTALINK • PROYECTOS</span>
        </div>
        <nav class="hidden md:flex items-center space-x-6 lg:space-x-8 text-xs font-medium tracking-widest uppercase text-white/70">
          <a routerLink="/" class="text-white hover:text-amber-400 transition-colors no-underline">Inicio</a>
          <a routerLink="/prototipos" class="hover:text-white transition-colors no-underline">Prototipos</a>
          <a routerLink="/planes" class="hover:text-white transition-colors no-underline">Planes</a>
          <a href="#contacto" class="hover:text-white transition-colors no-underline">Contacto</a>
        </nav>
      </header>

      <!-- CAPA 3: Contenido Principal (Hero Text + Cards Rail) -->
      <section class="relative z-10 grid grid-cols-1 md:grid-cols-12 min-h-[calc(100vh-180px)] px-6 sm:px-12 items-center pb-24 md:pb-0">
        
        <!-- Bloque de texto principal (Izquierda) con Desvanecimiento Elegante -->
        <div class="col-span-1 md:col-span-6 lg:col-span-5 flex flex-col justify-center space-y-4 max-w-lg pt-4 md:pt-0 transition-all duration-500 ease-out"
             [class.opacity-0]="isFading()"
             [class.translate-y-4]="isFading()"
             [class.opacity-100]="!isFading()"
             [class.translate-y-0]="!isFading()">
          
          <span class="text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-emerald-400/90 font-headline">
            {{ currentSlide().subtitle }}
          </span>
          
          <h1 class="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] text-white drop-shadow-lg font-headline">
            {{ currentSlide().title }}
          </h1>
          
          <p class="text-xs sm:text-sm text-zinc-300/90 leading-relaxed pt-1 line-clamp-3 font-sans">
            {{ currentSlide().description }}
          </p>

          <div class="pt-4 flex items-center gap-3">
            <a 
              [routerLink]="['/proyecto', currentSlide().id]"
              class="px-6 py-3 rounded-full border border-white/40 text-xs font-headline font-bold uppercase tracking-widest text-white backdrop-blur-md bg-white/10 hover:bg-white hover:text-black transition-all duration-300 no-underline cursor-pointer shadow-lg hover:scale-105 active:scale-95 inline-flex items-center gap-2">
              <span>Ver Proyecto</span>
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Riel de Tarjetas (Derecha) -->
        <div class="col-span-1 md:col-span-6 lg:col-span-7 flex items-center justify-start md:justify-end pl-0 md:pl-8 mt-8 md:mt-0 transition-opacity duration-500"
             [class.opacity-70]="isFading()"
             [class.opacity-100]="!isFading()">
          <div class="flex items-center space-x-4 sm:space-x-5 overflow-x-auto scrollbar-none py-2 max-w-full">
            
            @for (card of upcomingSlides(); track card.id; let i = $index) {
              <div 
                class="group relative w-36 sm:w-48 h-56 sm:h-72 rounded-2xl overflow-hidden shadow-2xl cursor-pointer flex-shrink-0 border border-white/15 hover:scale-[1.04] transition-all duration-500 ease-out"
                (click)="onCardClick(i)"
              >
                <!-- Imagen de la tarjeta -->
                <img 
                  [src]="card.image" 
                  [alt]="card.title" 
                  class="w-full h-full object-cover object-top brightness-90 group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                
                <!-- Gradiente para texto interno -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent"></div>
                
                <!-- Metadata de la tarjeta -->
                <div class="absolute bottom-4 left-4 right-4 text-white">
                  <span class="block text-[9.5px] uppercase tracking-wider text-emerald-400 font-bold mb-0.5">
                    {{ card.subtitle }}
                  </span>
                  <h3 class="text-xs sm:text-sm font-bold uppercase tracking-tight leading-snug line-clamp-2 font-headline">
                    {{ card.title }}
                  </h3>
                </div>
              </div>
            }

          </div>
        </div>

      </section>

      <!-- CAPA 4: Controles Inferiores (Paginación + Flechas) -->
      <footer class="absolute bottom-6 sm:bottom-8 left-6 sm:left-12 right-6 sm:right-12 z-20 flex items-center justify-between">
        
        <!-- Flechas Circulares -->
        <div class="flex items-center space-x-3">
          <button 
            (click)="prev()"
            class="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/20 flex items-center justify-center text-white/80 backdrop-blur-md bg-black/40 hover:bg-white hover:text-black transition-colors duration-300 cursor-pointer shadow-md"
            aria-label="Previous Slide"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <button 
            (click)="next()"
            class="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/20 flex items-center justify-center text-white/80 backdrop-blur-md bg-black/40 hover:bg-white hover:text-black transition-colors duration-300 cursor-pointer shadow-md"
            aria-label="Next Slide"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <!-- Indicador de Slide y Barra -->
        <div class="flex items-center space-x-3 sm:space-x-4">
          <span class="text-lg sm:text-xl font-bold tracking-tighter tabular-nums font-headline text-white">
            {{ formattedCurrentIndex() }}
          </span>
          <div class="w-12 sm:w-20 h-[3px] bg-white/20 rounded-full overflow-hidden">
            <div 
              class="h-full bg-amber-400 transition-all duration-700 ease-out" 
              [style.width.%]="progressPercentage()"
            ></div>
          </div>
          <span class="text-xs font-semibold text-white/50 tracking-tighter tabular-nums">
            {{ formattedTotalSlides() }}
          </span>
        </div>

      </footer>

    </main>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=Plus+Jakarta+Sans:wght@300;400;600;700;800&display=swap');

    .hero-wrapper {
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    .scrollbar-none::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-none {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `]
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
  slides = signal<CarouselSlide[]>([
    {
      id: 'camascotas',
      subtitle: 'E-Commerce Social',
      title: 'CamasCotas',
      description: 'E-commerce completo de mobiliario premium para mascotas con catálogo interactivo, carrito, panel de administración y conversión directa por WhatsApp.',
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/v1786973369/proyecto-camascotas_qcmstp.png',
      liveUrl: 'https://camascotas.com/'
    },
    {
      id: 'catalogodigital',
      subtitle: 'Sistema + IA',
      title: 'Catálogo Digital',
      description: 'Plataforma de catálogo digital inteligente asistido por IA. Gestión de inventarios masivos, generador de contenido y analítica predictiva.',
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/v1786974186/proyecto-catalogodigital_obh8fu.png',
      liveUrl: 'https://catalogoplaxtilineas.com/catalogo'
    },
    {
      id: 'districol',
      subtitle: 'E-Commerce Premium',
      title: 'Colchones Districol',
      description: 'Tienda online de colchones y sistemas de descanso premium con fichas técnicas de firmeza, comparador de materiales y WhatsApp API.',
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/v1786973662/proyecto-colchonesdistricol_wlk93j.png',
      liveUrl: 'https://colchonesdistricol.com/'
    },
    {
      id: 'sysmicon',
      subtitle: 'Plataforma Corporativa',
      title: 'Sysmicon Arquitectura',
      description: 'Portal ejecutivo y directivo para firmas de arquitectura con showcase de proyectos CAD, cotizador en línea y gestión de clientes.',
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/v1786973770/proyecto-sysmiconarquitectura_jxfoju.png',
      liveUrl: 'https://sysmicon.com/'
    },
    {
      id: 'espumasyplasticos',
      subtitle: 'E-Commerce Industrial',
      title: 'Espumas y Plásticos',
      description: 'Plataforma B2B e industrial para la venta de espumas, plásticos y materiales sintéticos con catálogo de calibres y densidad.',
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/v1786974630/espumas-principal_dzeur0.jpg',
      liveUrl: 'https://espumasyplasticos.com/'
    },
    {
      id: 'plaxtilineas',
      subtitle: 'Portal Institucional',
      title: 'Plaxtilíneas',
      description: 'Portal corporativo e industrial para la exhibición de líneas de bolsas, empaques ecológicos y productos biodegradables.',
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/v1786974786/plaxtilineas_lh6eaz.png',
      liveUrl: 'https://plaxtilineas.com/'
    },
    {
      id: 'tiendaintima',
      subtitle: 'Tienda + IA',
      title: 'Tienda Íntima',
      description: 'Comercio electrónico para moda íntima con motor de recomendación de tallas por IA, carrito ultrarrápido y cupones dinámicos.',
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/v1786973903/proyecto-tiendaintima_oahugr.png',
      liveUrl: 'https://tiendaintima.com/'
    }
  ]);

  currentIndex = signal<number>(0);
  isFading = signal<boolean>(false);
  private autoPlayTimer: any = null;

  currentSlide = computed(() => this.slides()[this.currentIndex()]);

  upcomingSlides = computed(() => {
    const list = this.slides();
    const curr = this.currentIndex();
    const result: CarouselSlide[] = [];
    for (let i = 1; i <= Math.min(3, list.length - 1); i++) {
      const idx = (curr + i) % list.length;
      result.push(list[idx]);
    }
    return result;
  });

  formattedCurrentIndex = computed(() => {
    const idx = this.currentIndex() + 1;
    return idx < 10 ? `0${idx}` : `${idx}`;
  });

  formattedTotalSlides = computed(() => {
    const total = this.slides().length;
    return total < 10 ? `0${total}` : `${total}`;
  });

  progressPercentage = computed(() => {
    return ((this.currentIndex() + 1) / this.slides().length) * 100;
  });

  ngOnInit() {
    this.startAutoPlay();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  startAutoPlay() {
    if (typeof window === 'undefined') return;
    this.stopAutoPlay();
    this.autoPlayTimer = setInterval(() => {
      this.next();
    }, 4000); // ⏱️ Cambio cada 4 segundos
  }

  stopAutoPlay() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  pauseAutoPlay() {
    this.stopAutoPlay();
  }

  resumeAutoPlay() {
    this.startAutoPlay();
  }

  changeSlide(newIndex: number) {
    if (this.isFading()) return;
    this.isFading.set(true);
    setTimeout(() => {
      this.currentIndex.set(newIndex);
      this.isFading.set(false);
    }, 280);
    this.startAutoPlay();
  }

  next() {
    const nextIdx = (this.currentIndex() + 1) % this.slides().length;
    this.changeSlide(nextIdx);
  }

  prev() {
    const prevIdx = (this.currentIndex() - 1 + this.slides().length) % this.slides().length;
    this.changeSlide(prevIdx);
  }

  onCardClick(relativeIndex: number) {
    const targetIdx = (this.currentIndex() + relativeIndex + 1) % this.slides().length;
    this.changeSlide(targetIdx);
  }
}
