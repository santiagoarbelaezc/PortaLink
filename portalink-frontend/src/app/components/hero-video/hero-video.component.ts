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
             class="relative w-full min-h-screen flex items-center justify-center overflow-hidden transition-colors duration-500 pt-24 pb-16"
             [ngClass]="currentTheme === 'light' ? 'bg-white text-neutral-900' : 'bg-[#0a0a0a] text-white'">
      
      <!-- Subtle Ambient Accent -->
      <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[550px] rounded-full blur-[140px] opacity-25 transition-all duration-700"
             [ngClass]="currentTheme === 'light' ? 'bg-neutral-200/60' : 'bg-neutral-800/40'"></div>
      </div>

      <!-- Main Container: Apple-Style Split Layout -->
      <div class="relative z-10 w-full max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-16 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14 min-h-[calc(100vh-6rem)]">
        
        <!-- Left Side: Larger Prominent Video Showcase -->
        <div class="w-full lg:w-[57%] flex items-center justify-center"
             data-aos="fade-right"
             data-aos-duration="1000"
             data-aos-easing="ease-out-cubic">
          
          <div class="relative w-full rounded-[32px] sm:rounded-[42px] overflow-hidden transition-all duration-700 border"
               [ngClass]="currentTheme === 'light' 
                 ? 'bg-white border-neutral-200/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.09)]' 
                 : 'bg-neutral-900 border-neutral-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]'">
            
            <!-- Clean Video Element (Larger Size, zero overlays) -->
            <video #heroVideo
                   src="assets/videos/hero/portalink.mp4"
                   class="w-full h-auto object-cover rounded-[32px] sm:rounded-[42px] block transition-transform duration-700 hover:scale-[1.01]"
                   autoplay
                   muted
                   loop
                   playsinline
                   preload="auto"
                   (ended)="onVideoEnded()">
            </video>
          </div>

        </div>

        <!-- Right Side: Perfectly Aligned Content & High-Contrast Button -->
        <div class="w-full lg:w-[43%] flex flex-col items-center lg:items-start text-center lg:text-left space-y-5 lg:pl-4"
             data-aos="fade-up"
             data-aos-duration="1000"
             data-aos-delay="150"
             data-aos-easing="ease-out-cubic">

          <!-- Main Title: Refined Font Weight (font-semibold) -->
          <h1 class="text-4xl sm:text-5xl lg:text-[54px] font-headline font-semibold tracking-tight leading-[1.1]"
              [ngClass]="currentTheme === 'light' ? 'text-neutral-900' : 'text-white'">
            Digitaliza tu negocio
          </h1>

          <!-- Subtitle Description -->
          <p class="text-base sm:text-lg font-sans font-normal leading-relaxed max-w-lg"
             [ngClass]="currentTheme === 'light' ? 'text-neutral-600' : 'text-neutral-300'">
            Explora nuestro catálogo exclusivo de soluciones tecnológicas. Encuentra las últimas novedades en desarrollo web, plataformas e Inteligencia Artificial, todo en un solo lugar.
          </p>

          <!-- High-Contrast Pure White Text Dark Button -->
          <div class="pt-2 w-full flex justify-center lg:justify-start">
            <a (click)="scrollTo('#portfolio', $event)"
               routerLink="/prototipos"
               class="px-8 py-3.5 rounded-xl font-headline font-bold text-sm tracking-wider transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] inline-flex items-center justify-center gap-2.5 no-underline border-none"
               style="background-color: #09090b !important; color: #ffffff !important;">
              <span style="color: #ffffff !important; font-weight: 700;">Ver Productos</span>
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="color: #ffffff !important;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>

        </div>

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

  videoEnded = false;
  currentTheme = 'light';

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
    }

    setTimeout(() => {
      if (this.videoElement && this.videoElement.nativeElement) {
        const video = this.videoElement.nativeElement;
        video.muted = true;
        video.playsInline = true;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.warn('Autoplay prevented by browser:', err);
          });
        }
      }
    }, 200);
  }

  ngOnDestroy() {
    if (this.videoElement && this.videoElement.nativeElement) {
      this.videoElement.nativeElement.pause();
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
