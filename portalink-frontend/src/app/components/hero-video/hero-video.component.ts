import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import * as AOS from 'aos';

@Component({
  selector: 'app-hero-video',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section id="hero" 
             class="relative w-full flex flex-col items-center justify-center overflow-hidden transition-colors duration-500 pt-12 pb-2 sm:pt-20 md:pt-28 md:pb-4 px-4 sm:px-12 lg:px-20"
             [ngClass]="currentTheme === 'light' ? 'bg-white text-neutral-900' : 'bg-[#0a0a0a] text-white'">
      
      <!-- Subtle Ambient Accent -->
      <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[550px] rounded-full blur-[140px] opacity-25 transition-all duration-700"
             [ngClass]="currentTheme === 'light' ? 'bg-neutral-200/60' : 'bg-neutral-800/40'"></div>
      </div>

      <!-- Main Container: 2-Column Layout (Video Left, Text Right) 100% Aligned with Projects Grid -->
      <div class="relative z-10 w-full max-w-[1500px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-3.5 sm:gap-8 lg:gap-14">
        
        <!-- Text Column (Order 1 in mobile, Order 2 in desktop) -->
        <div class="w-full lg:w-[35%] order-1 lg:order-2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-2.5 sm:space-y-5"
             data-aos="fade-up"
             data-aos-duration="1000"
             data-aos-delay="100"
             data-aos-easing="ease-out-cubic">

          <!-- Main Title -->
          <h1 class="text-4xl sm:text-6xl lg:text-[56px] font-headline font-bold tracking-tight leading-[1.05]"
              style="color: #0a0a0a !important;">
            Digitaliza tu negocio
          </h1>

          <!-- Subtitle Description -->
          <p class="text-sm sm:text-lg font-sans font-normal text-neutral-600 leading-relaxed max-w-lg">
            Explora nuestro catálogo exclusivo de soluciones tecnológicas. Encuentra las últimas novedades en desarrollo web, plataformas e Inteligencia Artificial, todo en un solo lugar.
          </p>

          <!-- Ver Productos Button -->
          <div class="pt-1 sm:pt-2 w-full flex justify-center lg:justify-start">
            <a (click)="scrollTo('#portfolio', $event)"
               routerLink="/prototipos"
               class="px-7 py-3 sm:px-8 sm:py-3.5 rounded-xl font-headline font-medium text-xs tracking-wider transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-2.5 no-underline border-none"
               style="background-color: #09090b !important; color: #ffffff !important;">
              <span style="color: #ffffff !important; font-weight: 500;">Ver Productos</span>
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="color: #ffffff !important;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>

        </div>

        <!-- Video Column (Order 2 in mobile, Order 1 in desktop) -->
        <div class="w-full lg:w-[65%] order-2 lg:order-1 mt-0 sm:mt-0"
             data-aos="fade-right"
             data-aos-duration="1000"
             data-aos-easing="ease-out-cubic">
          
          <div class="relative w-full rounded-[20px] sm:rounded-[36px] overflow-hidden transition-all duration-700 border shadow-md"
               [ngClass]="currentTheme === 'light' 
                 ? 'bg-white border-neutral-200/90 shadow-[0_15px_45px_rgba(0,0,0,0.06)]' 
                 : 'bg-neutral-900 border-neutral-800 shadow-[0_20px_50px_rgba(0,0,0,0.6)]'">
                        <!-- Mobile Video Element (portalink-movil.mp4 con poster de precarga instantánea) -->
             <video #mobileHeroVideo
                    class="block md:hidden w-full h-auto object-cover rounded-[20px] transition-transform duration-700 hover:scale-[1.01] bg-neutral-100 min-h-[220px]"
                    autoplay
                    muted
                    [muted]="true"
                    loop
                    playsinline
                    webkit-playsinline
                    preload="auto"
                    poster="assets/images/proyectos/proyecto-0.png">
               <source src="https://res.cloudinary.com/doxdjiyvi/video/upload/v1786974908/portalink-movil_thu5si.mp4" type="video/mp4">
             </video>

             <!-- Desktop Video Element (portalink.mp4) -->
             <video #heroVideo
                    class="hidden md:block w-full h-auto object-cover rounded-[36px] transition-transform duration-700 hover:scale-[1.01]"
                    autoplay
                    muted
                    [muted]="true"
                    loop
                    playsinline
                    webkit-playsinline
                    preload="auto"
                    (ended)="onVideoEnded()">
               <source src="https://res.cloudinary.com/doxdjiyvi/video/upload/v1786974918/portalink_vat2xb.mp4" type="video/mp4">
             </video>
          </div>

        </div>

      </div>

      <!-- Animated Scroll Indicator Pill (Moved higher up) -->
      <div (click)="scrollTo('#portfolio', $event)" 
           class="relative z-10 flex flex-col items-center justify-center mt-3 sm:mt-8 pt-1 pb-1 text-neutral-400 animate-bounce cursor-pointer" 
           data-aos="fade-up" 
           data-aos-delay="300">
        <span class="text-[10px] font-headline font-semibold uppercase tracking-[0.2em] text-neutral-400">DESLIZA PARA EXPLORAR</span>
        <svg class="w-4 h-4 text-neutral-400 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class HeroVideoComponent implements OnInit, AfterViewInit, OnDestroy {
  private router = inject(Router);

  @ViewChild('heroVideo') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('mobileHeroVideo') mobileVideoElement!: ElementRef<HTMLVideoElement>;

  videoEnded = false;
  currentTheme = 'light';
  private observer?: IntersectionObserver;

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('portfolio-theme') || 'light';
      this.currentTheme = savedTheme === 'red' ? 'dark' : savedTheme;

      window.addEventListener('portfolio-theme-change', (e: any) => {
        if (e.detail && e.detail.theme) {
          this.currentTheme = e.detail.theme;
        }
      });
    }
  }

  ngAfterViewInit() {
    if (typeof window !== 'undefined') {
      AOS.init({
        duration: 900,
        once: true,
        easing: 'ease-out-cubic'
      });

      // Mute all video elements programmatically
      const videos = document.querySelectorAll<HTMLVideoElement>('section#hero video, video');
      videos.forEach(video => {
        video.muted = true;
        video.defaultMuted = true;
        video.volume = 0;
        video.playsInline = true;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.setAttribute('muted', 'true');
      });

      // Observe both mobile and desktop videos
      if ('IntersectionObserver' in window) {
        const targetVideos = [
          this.videoElement?.nativeElement,
          this.mobileVideoElement?.nativeElement
        ].filter((v): v is HTMLVideoElement => !!v);

        this.observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            const v = entry.target as HTMLVideoElement;
            if (entry.isIntersecting) {
              v.muted = true;
              v.defaultMuted = true;
              v.volume = 0;
              v.play().catch(() => {});
            } else {
              v.pause();
            }
          });
        }, { threshold: 0.1 });

        targetVideos.forEach(v => this.observer?.observe(v));
      }
    }

    setTimeout(() => {
      const videos = document.querySelectorAll<HTMLVideoElement>('section#hero video, video');
      videos.forEach(video => {
        video.muted = true;
        video.defaultMuted = true;
        video.volume = 0;
        video.playsInline = true;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.warn('Autoplay prevented by browser:', err);
          });
        }
      });
    }, 150);
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.videoElement && this.videoElement.nativeElement) {
      this.videoElement.nativeElement.pause();
    }
    if (this.mobileVideoElement && this.mobileVideoElement.nativeElement) {
      this.mobileVideoElement.nativeElement.pause();
    }
  }

  onVideoEnded() {
    this.videoEnded = true;
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        AOS.refreshHard();
      }
    }, 100);
  }

  scrollTo(link: string, event: Event) {
    if (event) event.preventDefault();
    if (link.startsWith('#')) {
      const targetId = link.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      this.router.navigateByUrl(link);
    }
  }
}
