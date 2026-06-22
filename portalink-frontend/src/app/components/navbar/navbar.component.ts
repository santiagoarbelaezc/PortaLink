import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MagneticDirective } from '../../shared/directives/magnetic.directive';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, MagneticDirective, RouterModule],
    template: `
    <!-- ═══════════════════════════════════════════ -->
    <!-- DESKTOP: Top pill navbar (md+)              -->
    <!-- ═══════════════════════════════════════════ -->
    <nav class="hidden md:block fixed top-0 left-0 w-full z-[9000] px-12 py-5 backdrop-blur-xl transition-all duration-500"
         style="background: var(--nav-bg); border-bottom: 1px solid var(--card-border);">
      <div class="w-full flex items-center justify-between">

        <!-- Left: Branding metadata -->
        <div class="flex items-center gap-4">
          <span class="text-[9px] uppercase tracking-[0.4em] font-bold transition-colors duration-500" style="color: var(--text-secondary);">S.A. // PORTFOLIO</span>
        </div>

        <!-- Center: Nav Links -->
        <div class="flex items-center gap-8 justify-center">
          <a *ngFor="let item of desktopItems"
             (click)="scrollTo(item.link, $event)"
             class="nav-link text-xs font-bold tracking-widest uppercase cursor-pointer hover:text-white transition-colors"
             style="color: var(--text-secondary);"
             appMagnetic [appMagnetic]="0.2">
            {{ item.name }}
          </a>
        </div>

        <!-- Right: Theme Selector & Contact CTA -->
        <div class="flex items-center gap-6">
          <!-- Theme Switcher Desktop (Sharp Architectural Squares) -->
          <div class="flex items-center gap-2 border px-3 py-1.5 rounded-none transition-all duration-500"
               style="border-color: var(--card-border); background: var(--card-bg);">
            <button (click)="setTheme('dark')" 
                    class="w-3.5 h-3.5 rounded-none bg-black border border-white/20 transition-all hover:scale-110 focus:outline-none cursor-pointer"
                    [class.ring-1]="currentTheme === 'dark'"
                    [class.ring-white]="currentTheme === 'dark'"
                    title="Tema Negro"></button>
            <button (click)="setTheme('light')" 
                    class="w-3.5 h-3.5 rounded-none bg-white border border-black/20 transition-all hover:scale-110 focus:outline-none cursor-pointer"
                    [class.ring-1]="currentTheme === 'light'"
                    [class.ring-blue-500]="currentTheme === 'light'"
                    title="Tema Blanco"></button>
            <button (click)="setTheme('red')" 
                    class="w-3.5 h-3.5 rounded-none bg-red-600 border border-white/20 transition-all hover:scale-110 focus:outline-none cursor-pointer"
                    [class.ring-1]="currentTheme === 'red'"
                    [class.ring-yellow-400]="currentTheme === 'red'"
                    title="Tema Rojo"></button>
          </div>

          <button (click)="scrollTo('#contact', $event)" 
                  class="flex items-center gap-2 px-7 py-3 rounded-none text-white border transition-all duration-300 hover:bg-white/10"
                  style="border-color: var(--card-border); color: var(--text-primary); background: transparent;"
                  appMagnetic [appMagnetic]="0.1">
            <span class="text-xs font-bold tracking-widest uppercase">Contacto</span>
            <div class="w-1.5 h-1.5 bg-white" style="background-color: var(--text-primary);"></div>
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobile floating Theme Switcher (top right) -->
    <div class="md:hidden fixed top-6 right-6 z-[9000] flex items-center gap-2.5 border px-3.5 py-2.5 rounded-none backdrop-blur-xl shadow-2xl transition-all duration-500"
         style="background: var(--nav-bg); border-color: var(--card-border);">
      <button (click)="setTheme('dark')" class="w-3.5 h-3.5 rounded-none bg-black border border-white/20 cursor-pointer focus:outline-none" [class.ring-1]="currentTheme === 'dark'" [class.ring-white]="currentTheme === 'dark'"></button>
      <button (click)="setTheme('light')" class="w-3.5 h-3.5 rounded-none bg-white border border-black/20 cursor-pointer focus:outline-none" [class.ring-1]="currentTheme === 'light'" [class.ring-blue-500]="currentTheme === 'light'"></button>
      <button (click)="setTheme('red')" class="w-3.5 h-3.5 rounded-none bg-red-600 border border-white/20 cursor-pointer focus:outline-none" [class.ring-1]="currentTheme === 'red'" [class.ring-yellow-400]="currentTheme === 'red'"></button>
    </div>

    <!-- ═══════════════════════════════════════════ -->
    <!-- MOBILE: Bottom app-style tab bar           -->
    <!-- ═══════════════════════════════════════════ -->
    <nav class="md:hidden fixed bottom-4 left-4 right-4 z-[9000]">
      <div class="flex items-center justify-around py-2 px-1 rounded-none backdrop-blur-xl border shadow-2xl transition-all duration-500"
           style="background: var(--nav-bg); border-color: var(--card-border);">
        <a *ngFor="let item of mobileItems"
           (click)="scrollTo(item.link, $event)"
           class="mobile-nav-item flex flex-col items-center gap-1 px-4 py-2 rounded-none cursor-pointer transition-all duration-200">
          <!-- Icon -->
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
               class="text-white/60">
            <ng-container *ngIf="item.icon === 'home'">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </ng-container>
            <ng-container *ngIf="item.icon === 'link'">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </ng-container>
            <ng-container *ngIf="item.icon === 'grid'">
              <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
            </ng-container>
            <ng-container *ngIf="item.icon === 'user'">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </ng-container>
            <ng-container *ngIf="item.icon === 'layers'">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </ng-container>
            <ng-container *ngIf="item.icon === 'mail'">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </ng-container>
          </svg>
          <span class="text-[9px] font-bold uppercase tracking-wider text-white/50">
            {{ item.name }}
          </span>
        </a>
      </div>
    </nav>
  `,
    styles: [`
    .nav-link { position: relative; }
    .nav-link::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 0;
      height: 1px;
      background: var(--text-primary);
      transition: width 0.3s ease;
    }
    .nav-link:hover::after { width: 100%; }
    .mobile-nav-item:active { transform: scale(0.95); }
  `]
})
export class NavbarComponent {
  private router = inject(Router);

  desktopItems = [
    { name: 'Inicio',    link: '#hero' },
    { name: 'Links',     link: '/links' },
    { name: 'Proyectos', link: '#portfolio' },
    { name: 'Perfil',    link: '#about' },
    { name: 'Servicios', link: '#skills' }
  ];

  mobileItems = [
    { name: 'Inicio',    link: '#hero',      icon: 'home'   },
    { name: 'Links',     link: '/links',     icon: 'link'   },
    { name: 'Proyectos', link: '#portfolio', icon: 'grid'   },
    { name: 'Perfil',    link: '#about',     icon: 'user'   },
    { name: 'Servicios', link: '#skills',    icon: 'layers' },
    { name: 'Contacto',  link: '#contact',   icon: 'mail'   },
  ];

  currentTheme = 'dark';

  constructor() {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
      this.setTheme(savedTheme);
    }
  }

  setTheme(theme: string) {
    this.currentTheme = theme;
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('theme-dark', 'theme-light', 'theme-red');
      if (theme !== 'dark') {
        root.classList.add(`theme-${theme}`);
      }
      localStorage.setItem('portfolio-theme', theme);
    }
  }

  private scrollIntoView(id: string) {
    const element = document.getElementById(id);
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

  scrollTo(link: string, event: Event) {
    event.preventDefault();
    if (link.startsWith('#')) {
      const targetId = link.replace('#', '');
      const isRoot = this.router.url === '/' || this.router.url === '/proyectos';
      if (isRoot) {
        this.scrollIntoView(targetId);
      } else {
        this.router.navigate(['/']).then(() => {
          setTimeout(() => this.scrollIntoView(targetId), 200);
        });
      }
    } else {
      this.router.navigateByUrl(link);
    }
  }
}

