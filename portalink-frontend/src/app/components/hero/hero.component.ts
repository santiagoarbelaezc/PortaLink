import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MagneticDirective } from '../../shared/directives/magnetic.directive';

@Component({
    selector: 'app-hero',
    standalone: true,
    imports: [CommonModule, MagneticDirective],
    template: `
    <section id="hero" class="relative min-h-screen w-full flex items-center justify-center overflow-hidden">

      <div class="container mx-auto px-6 pt-20 pb-28 md:pt-32 md:pb-0 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
        <!-- Text Content -->
        <div class="order-2 lg:order-1">
          <div class="overflow-hidden mb-4">
            <h2 class="text-accent-cyan font-sans text-sm tracking-[0.3em] uppercase opacity-0 animate-fade-up" style="animation-delay: 0.8s;">
              {{ data?.title || 'Digital Visionary & Developer' }}
            </h2>
          </div>

          <h1 class="text-5xl sm:text-7xl md:text-9xl font-headline leading-none mb-6 md:mb-8" style="letter-spacing: -0.04em;">
            <span class="block overflow-hidden">
              <span class="block animate-fade-up text-black" style="animation-delay: 1.0s;">{{ data?.subtitle || 'SANTIAGO' }}</span>
            </span>
          </h1>
          
          <p class="text-lg md:text-xl text-black/60 max-w-md animate-fade-up mb-12" style="animation-delay: 1.4s;">
            {{ data?.description }}
          </p>

          <div class="flex gap-4 opacity-0 animate-fade-up" style="animation-delay: 1.8s;">
            <a (click)="scrollTo('#portfolio', $event)" 
               class="cta-button group cursor-pointer no-underline" 
               appMagnetic [appMagnetic]="0.2">
              <span class="cta-text">{{ data?.ctaText || 'View Portfolio' }}</span>
              <div class="cta-icon-wrapper">
                <svg class="cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </a>
          </div>
        </div>

        <!-- Photo -->
        <div class="order-1 lg:order-2 flex justify-center" style="perspective: 1000px;">
          <div
            class="relative w-[240px] h-[320px] sm:w-[300px] sm:h-[400px] md:w-[450px] md:h-[600px] transition-transform duration-200 ease-out"
            [style.transform]="parallaxTransform"
            (mousemove)="onImageMove($event)"
            (mouseleave)="onImageLeave()">

            <div class="absolute -inset-4 rounded-3xl -z-10" style="background: rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.08);"></div>

            <div class="w-full h-full rounded-2xl overflow-hidden border shadow-xl group" style="border-color: rgba(0,0,0,0.10);">
              <img
                [src]="data?.backgroundImage || 'hero-portrait.png'"
                alt="Santiago"
                class="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
            </div>

          </div>
        </div>
      </div>

      <div class="hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 flex-col items-center gap-2" style="opacity: 0.35;">
        <span class="text-[10px] uppercase tracking-[0.3em] text-black">Scroll</span>
        <div class="w-px h-12 bg-gradient-to-b from-black to-transparent"></div>
      </div>
    </section>
  `,
    styles: [`
    .cta-button {
      display: inline-flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1.25rem 2.5rem;
      background: #000;
      color: #fff;
      border-radius: 9999px;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(255,255,255,0.1);
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    }

    .cta-button::before {
      content: '';
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: #00e5ff; /* Cyan accent */
      transform: translateY(100%);
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 0;
    }

    .cta-button:hover::before {
      transform: translateY(0);
    }

    .cta-text {
      position: relative;
      z-index: 1;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      font-size: 0.75rem;
      transition: color 0.4s;
    }

    .cta-button:hover .cta-text {
      color: #000;
    }

    .cta-icon-wrapper {
      position: relative;
      z-index: 1;
      width: 20px; height: 20px;
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .cta-button:hover .cta-icon-wrapper {
      transform: translate(3px, -3px);
    }

    .cta-icon {
      width: 100%; height: 100%;
      stroke: #fff;
      transition: stroke 0.4s;
    }

    .cta-button:hover .cta-icon {
      stroke: #000;
    }

    .animate-bounce-slow {
      animation: bounce-slow 4s infinite ease-in-out;
    }
    @keyframes bounce-slow {
      0%, 100% { transform: translateY(0) rotate(-5deg); }
      50% { transform: translateY(-12px) rotate(-2deg); }
    }
  `]
})
export class HeroComponent {
  @Input() data: any;
  parallaxTransform = '';

  onImageMove(e: MouseEvent) {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateX = (y - 0.5) * -16;
    const rotateY = (x - 0.5) * 16;
    this.parallaxTransform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }

  onImageLeave() {
    this.parallaxTransform = 'rotateX(0deg) rotateY(0deg)';
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
