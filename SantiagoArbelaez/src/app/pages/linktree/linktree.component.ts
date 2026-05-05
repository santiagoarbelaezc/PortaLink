import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MagneticDirective } from '../../shared/directives/magnetic.directive';

declare var AOS: any;

@Component({
    selector: 'app-linktree',
    standalone: true,
    imports: [CommonModule, RouterModule, MagneticDirective],
    template: `
    <div class="lt-wrapper">
      <div class="lt-container">
        
        <main class="lt-main-grid">
          
          <!-- COLUMN 1: PROTEIN / LARGE PHOTO -->
          <aside class="lt-col-photo" data-aos="fade-right" data-aos-duration="1200">
            <div class="lt-portrait-wrapper" appMagnetic [appMagnetic]="0.15">
              <img src="about-portrait.png" alt="Santiago Arbelaez" class="lt-main-img shadow-2xl" />
              <div class="lt-photo-decoration" style="border-color: #8B5E3C;"></div>
              <div class="lt-photo-tag">S.A. 2025</div>
            </div>
          </aside>

          <!-- COLUMN 2: INFO & ALL LINKS -->
          <section class="lt-col-info">
            <header class="lt-info-header" data-aos="fade-down" data-aos-delay="200">
              <h1 class="font-headline text-6xl md:text-8xl text-black leading-[0.85] tracking-tighter">
                SANTIAGO<br/><span style="color: #8B5E3C;">ARBELAEZ</span>
              </h1>
              <p class="text-sm uppercase tracking-[0.4em] text-black/40 mt-6 font-medium">Digital Creator & Full Stack</p>
            </header>

            <div class="lt-links-container" data-aos="fade-up" data-aos-delay="600">
              <!-- Primary CTA -->
              <a routerLink="/portfolio" class="lt-btn-full black-card rounded-2xl mb-6" appMagnetic [appMagnetic]="0.1">
                <span class="lt-btn-tag uppercase">¡Hola!</span>
                <div class="lt-btn-content">
                  <h3 class="text-3xl font-bold">SOBRE MÍ</h3>
                  <p class="text-[12px] text-white/40 tracking-[0.2em] uppercase mt-2">Descubre mi trabajo</p>
                </div>
                <div class="lt-btn-arrow text-4xl">→</div>
              </a>

              <!-- Social Grid/Stack -->
              <div class="lt-social-grid">
                <a href="https://www.instagram.com/santiagoarbelaezc/" target="_blank" class="lt-social-card rounded-2xl" appMagnetic [appMagnetic]="0.05">
                  <div class="lt-social-body">
                    <span class="text-[10px] text-black/30 tracking-widest uppercase block mb-1">Social</span>
                    <h3 class="text-xl font-bold uppercase">Instagram</h3>
                  </div>
                  <div class="coffee-text text-2xl">↗</div>
                </a>

                <a href="https://www.tiktok.com/@santiagoarbelaezc" target="_blank" class="lt-social-card rounded-2xl" appMagnetic [appMagnetic]="0.05">
                  <div class="lt-social-body">
                    <span class="text-[10px] text-black/30 tracking-widest uppercase block mb-1">Video</span>
                    <h3 class="text-xl font-bold uppercase">TikTok</h3>
                  </div>
                  <div class="coffee-text text-2xl">↗</div>
                </a>

                <a href="https://wa.me/573000000000" target="_blank" class="lt-social-card coffee-card rounded-2xl" appMagnetic [appMagnetic]="0.05">
                  <div class="lt-social-body">
                    <span class="text-[10px] text-white/40 tracking-widest uppercase block mb-1">Chat</span>
                    <h3 class="text-xl font-bold text-white uppercase">WhatsApp</h3>
                  </div>
                  <div class="text-white text-2xl">↗</div>
                </a>

                <a href="https://www.linkedin.com/in/santiago-arbelaez-contreras-9830b5290/" target="_blank" class="lt-social-card rounded-2xl" appMagnetic [appMagnetic]="0.05">
                  <div class="lt-social-body">
                    <span class="text-[10px] text-black/30 tracking-widest uppercase block mb-1">Work</span>
                    <h3 class="text-xl font-bold uppercase">LinkedIn</h3>
                  </div>
                  <div class="coffee-text text-2xl">↗</div>
                </a>
              </div>
            </div>
          </section>

        </main>

        <footer class="lt-footer-minimal" data-aos="fade-in" data-aos-delay="1200">
           <div class="lt-footer-sep"></div>
           <div class="lt-footer-flex">
             <p class="lt-copy">© {{ currentYear }} SANTIAGO ARBELAEZ. ALL RIGHTS RESERVED.</p>
             <div class="lt-footer-links">
               <a href="https://facebook.com" target="_blank" class="lt-footer-link mr-6">FB</a>
               <a href="https://x.com" target="_blank" class="lt-footer-link">X</a>
             </div>
           </div>
        </footer>

      </div>
    </div>
  `,
    styles: [`
    :host {
      --coffee: #8B5E3C;
      --black: #0a0a0a;
      --white: #ffffff;
    }

    .lt-wrapper {
      min-height: 100vh;
      background: var(--white);
      padding: 60px 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: 'Roboto', sans-serif;
      overflow-x: hidden;
    }

    .lt-container {
      width: 100%;
      max-width: 1200px;
    }

    /* MAIN GRID */
    .lt-main-grid {
      display: grid;
      grid-template-columns: 1fr 1.4fr;
      gap: 80px;
      align-items: center;
    }

    /* COLUMN 1: LARGE PHOTO */
    .lt-col-photo {
      position: relative;
    }
    .lt-main-img {
      width: 100%;
      aspect-ratio: 4/5.5;
      object-fit: cover;
      border-radius: 40px;
      filter: grayscale(100%);
      transition: all 1s cubic-bezier(0.23, 1, 0.32, 1);
      border: 1px solid rgba(0,0,0,0.08);
    }
    .lt-portrait-wrapper:hover .lt-main-img {
      filter: grayscale(0%);
      transform: scale(1.02);
    }
    .lt-photo-decoration {
      position: absolute;
      top: -12px; right: -12px;
      width: 60px; height: 60px;
      border-right: 3px solid;
      border-top: 3px solid;
      pointer-events: none;
    }
    .lt-photo-tag {
      position: absolute;
      bottom: 24px; left: -12px;
      background: var(--coffee);
      color: var(--white);
      font-size: 10px;
      font-weight: 800;
      padding: 6px 12px;
      letter-spacing: 0.2em;
      transform: rotate(-90deg);
      transform-origin: left bottom;
    }

    /* COLUMN 2: INFO */
    .lt-col-info {
      padding-top: 0;
    }
    .lt-links-container {
      margin-top: 40px;
    }
    .lt-btn-full {
      display: flex;
      align-items: center;
      justify-content: space-between;
      text-decoration: none;
      padding: 30px 40px;
      transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(0,0,0,0.08);
    }
    .lt-btn-tag {
      position: absolute;
      top: 0; right: 0;
      font-size: 9px;
      font-weight: 900;
      color: var(--white);
      background: var(--coffee);
      padding: 4px 12px;
    }
    .black-card { background: var(--black); color: var(--white); }
    .lt-btn-full:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }

    .lt-social-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .lt-social-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      text-decoration: none;
      color: var(--black);
      background: var(--white);
      border: 1px solid rgba(0,0,0,0.08);
      transition: all 0.3s ease;
    }
    .lt-social-card:hover {
      background: #fafafa;
      transform: translateY(-3px);
    }
    .coffee-card { background: var(--coffee); border: none; }
    .coffee-card:hover { background: #9c6c4a; }
    .coffee-text { color: var(--coffee); }

    /* FOOTER */
    .lt-footer-minimal {
      margin-top: 80px;
    }
    .lt-footer-sep {
      width: 100%; height: 1px;
      background: rgba(0,0,0,0.06);
      margin-bottom: 24px;
    }
    .lt-footer-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .lt-copy {
      font-size: 10px;
      font-weight: 400;
      color: rgba(0,0,0,0.3);
      letter-spacing: 0.2em;
    }
    .lt-footer-link {
      font-size: 10px;
      font-weight: 700;
      color: var(--black);
      text-decoration: none;
      letter-spacing: 0.1em;
    }

    /* RESPONSIVE */
    @media (max-width: 768px) {
      .lt-wrapper { padding: 40px 20px; }
      .lt-main-grid { grid-template-columns: 1fr; gap: 40px; }
      
      .lt-portrait-wrapper {
        width: 60%;
        max-width: 260px;
        margin: 0 auto;
      }
      .lt-main-img {
        aspect-ratio: 4/5;
        border-radius: 30px;
      }

      .lt-col-info { text-align: center; }
      .lt-info-header h1 { font-size: 4rem; }
      
      .lt-social-grid { grid-template-columns: 1fr; }
      .lt-social-card { padding: 18px 20px; }
    }
  `]
})
export class LinktreeComponent implements OnInit, AfterViewInit {
  currentYear = new Date().getFullYear();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {}

  ngAfterViewInit() {
    if (this.isBrowser) {
      setTimeout(() => {
        if (typeof AOS !== 'undefined') {
          AOS.init({
            once: true,
            offset: 50
          });
        }
      }, 500);
    }
  }
}
