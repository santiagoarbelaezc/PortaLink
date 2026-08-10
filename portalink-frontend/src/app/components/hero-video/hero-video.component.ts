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
             class="relative w-full flex items-center justify-center overflow-hidden transition-colors duration-500 pt-24 pb-6 md:pt-28 md:pb-10 px-6 sm:px-12 lg:px-20"
             [ngClass]="currentTheme === 'light' ? 'bg-white text-neutral-900' : 'bg-[#0a0a0a] text-white'">
      
      <!-- Subtle Ambient Accent -->
      <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[550px] rounded-full blur-[140px] opacity-25 transition-all duration-700"
             [ngClass]="currentTheme === 'light' ? 'bg-neutral-200/60' : 'bg-neutral-800/40'"></div>
      </div>

      <!-- Main Container: 2-Column Layout (Video Left, Text Right) 100% Aligned with Projects Grid -->
      <div class="relative z-10 w-full max-w-[1500px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14">
        
        <!-- Left Side: Clean Video Showcase (Aligned to far-left edge of container) -->
        <div class="w-full lg:w-[65%]"
             data-aos="fade-right"
             data-aos-duration="1000"
             data-aos-easing="ease-out-cubic">
          
          <div class="relative w-full rounded-[28px] sm:rounded-[36px] overflow-hidden transition-all duration-700 border"
               [ngClass]="currentTheme === 'light' 
                 ? 'bg-white border-neutral-200/90 shadow-[0_15px_45px_rgba(0,0,0,0.06)]' 
                 : 'bg-neutral-900 border-neutral-800 shadow-[0_20px_50px_rgba(0,0,0,0.6)]'">
            
            <!-- Clean Video Element -->
            <video #heroVideo
                   src="assets/videos/hero/portalink.mp4"
                   class="w-full h-auto object-cover rounded-[28px] sm:rounded-[36px] block transition-transform duration-700 hover:scale-[1.01]"
                   autoplay
                   muted
                   loop
                   playsinline
                   preload="auto"
                   (ended)="onVideoEnded()">
            </video>
          </div>

        </div>

        <!-- Right Side: Clean Text & Button (35% width) -->
        <div class="w-full lg:w-[35%] flex flex-col items-center lg:items-start text-center lg:text-left space-y-5"
             data-aos="fade-up"
             data-aos-duration="1000"
             data-aos-delay="150"
             data-aos-easing="ease-out-cubic">

          <!-- Main Title -->
          <h1 class="text-4xl sm:text-5xl lg:text-[52px] font-headline font-semibold tracking-tight leading-[1.08]"
              style="color: #0a0a0a !important;">
            Digitaliza tu negocio
          </h1>

          <!-- Subtitle Description -->
          <p class="text-base sm:text-lg font-sans font-normal text-neutral-600 leading-relaxed max-w-lg">
            Explora nuestro catálogo exclusivo de soluciones tecnológicas. Encuentra las últimas novedades en desarrollo web, plataformas e Inteligencia Artificial, todo en un solo lugar.
          </p>

          <!-- Ver Productos Button -->
          <div class="pt-2 w-full flex justify-center lg:justify-start">
            <a (click)="scrollTo('#portfolio', $event)"
               routerLink="/prototipos"
               class="px-8 py-3.5 rounded-xl font-headline font-medium text-xs tracking-wider transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-2.5 no-underline border-none"
               style="background-color: #09090b !important; color: #ffffff !important;">
              <span style="color: #ffffff !important; font-weight: 500;">Ver Productos</span>
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="color: #ffffff !important;">
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

      // Auto-pause when user scrolls past video, resume when visible in viewport
      if ('IntersectionObserver' in window && this.videoElement && this.videoElement.nativeElement) {
        const video = this.videoElement.nativeElement;
        this.observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          });
        }, { threshold: 0.1 });
        this.observer.observe(video);
      }
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
    if (this.observer) {
      this.observer.disconnect();
    }
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
