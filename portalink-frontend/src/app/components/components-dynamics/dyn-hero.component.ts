import { Component, Input, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dyn-hero',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <section class="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      <div class="container mx-auto px-6 pt-20 pb-28 md:pt-32 md:pb-0 grid grid-cols-1 lg:grid-cols-[42%_58%] gap-8 md:gap-12 items-center relative z-10">
        <!-- Text Content -->
        <div class="w-full">
          <div class="flex items-center gap-4 mb-4">
            <div class="h-px w-10" style="background-color: var(--text-primary); opacity: 0.4;"></div>
            <span class="text-[10px] uppercase tracking-[0.4em] font-bold" style="color: var(--text-secondary);">
              {{ config?.subtitle || 'SUBTITLE' }}
            </span>
          </div>

          <h1 class="text-5xl sm:text-7xl md:text-[80px] font-headline uppercase leading-[0.95] tracking-tighter mb-6 md:mb-8 hero-title">
            <span class="title-soy">Soy </span>
            <span class="title-name">{{ config?.title || 'Title' }}.</span>
          </h1>
          
          <p class="text-base md:text-lg max-w-xl mb-10" style="color: var(--text-secondary); line-height: 1.65;">
            {{ config?.description || 'Description' }}
          </p>

          <div class="flex gap-4">
            <a class="cta-button group cursor-pointer no-underline">
               <span class="cta-text">{{ config?.ctaText || 'VER MAS' }}</span>
               <div class="cta-icon-wrapper">
                 <svg class="cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                   <path d="M7 17L17 7M17 7H7M17 7V17" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                 </svg>
               </div>
            </a>
          </div>
        </div>

        <!-- Right Side (Visuals) -->
        <div class="w-full py-6 overflow-visible lg:-ml-8 xl:-ml-14 flex justify-center">
          <img *ngIf="config?.backgroundImage" [src]="'assets/images/' + config.backgroundImage" alt="Hero" class="rounded-3xl max-w-full h-auto shadow-2xl object-cover aspect-[3/4] md:aspect-auto">
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero-title .title-soy { color: #a3a3a3; }
    .hero-title .title-name { color: #ffffff; }
    .theme-light .hero-title .title-soy { color: #000000; }
    .theme-light .hero-title .title-name { color: #333333; }
    .cta-button {
      display: inline-flex; align-items: center; gap: 1.5rem;
      padding: 1.25rem 2.5rem; background: #000; color: #fff;
      border-radius: 9999px; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(255,255,255,0.1); position: relative; overflow: hidden;
    }
    .cta-button::before {
      content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: #FFFFFF; transform: translateY(100%); transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); z-index: 0;
    }
    .cta-button:hover::before { transform: translateY(0); }
    .cta-text { position: relative; z-index: 1; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; font-size: 0.75rem; transition: color 0.4s; }
    .cta-button:hover .cta-text { color: #000; }
    .cta-icon-wrapper { position: relative; z-index: 1; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
    .cta-button:hover .cta-icon-wrapper { transform: translate(3px, -3px); }
    .cta-icon { width: 100%; height: 100%; stroke: #fff; transition: stroke 0.4s; }
    .cta-button:hover .cta-icon { stroke: #000; }
  `]
})
export class DynHeroComponent implements OnInit {
  @Input() config: any;

  ngOnInit() {
    // Dynamic logic if necessary
  }
}
