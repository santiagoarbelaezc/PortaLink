import { Component, inject, HostListener, OnInit } from '@angular/core';
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

        <!-- Left Side: Elegant borderless Theme Switcher with color indicators -->
        <div class="flex items-center gap-4 flex-1">
          <button (click)="setTheme('dark')" 
                  class="relative w-5 h-5 flex items-center justify-center focus:outline-none cursor-pointer group"
                  title="Tema Negro">
            <span class="w-2.5 h-2.5 rounded-full bg-black border border-white/20 transition-transform duration-300 group-hover:scale-125"></span>
            <span *ngIf="currentTheme === 'dark'" class="absolute inset-0 rounded-full border border-white/50"></span>
          </button>
          <button (click)="setTheme('light')" 
                  class="relative w-5 h-5 flex items-center justify-center focus:outline-none cursor-pointer group"
                  title="Tema Blanco">
            <span class="w-2.5 h-2.5 rounded-full bg-white border border-black/20 transition-transform duration-300 group-hover:scale-125"></span>
            <span *ngIf="currentTheme === 'light'" class="absolute inset-0 rounded-full border border-black/50"></span>
          </button>
        </div>

        <!-- Center: Nav Links with typography from Links component -->
        <div class="flex items-center gap-16 justify-center">
          <a *ngFor="let item of desktopItems"
             (click)="scrollTo(item.link, $event)"
             class="nav-link font-headline text-sm font-medium tracking-[0.08em] uppercase cursor-pointer py-1 flex items-center gap-2.5"
             [class.active]="activeSection === item.link">
            <i [class]="item.icon + ' text-xs opacity-75'"></i>
            <span>{{ item.name }}</span>
          </a>
        </div>

        <!-- Right Side: Minimal Contact CTA -->
        <div class="flex items-center justify-end flex-1">
          <!-- Clean Solid Contact Button -->
          <button (click)="scrollTo('#contact', $event)" 
                  class="px-6 py-2.5 rounded-none font-bold text-xs uppercase tracking-widest transition-all duration-300 hover:opacity-80 cursor-pointer"
                  style="background: var(--text-primary); color: var(--bg-primary);">
            Contacto
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobile floating Theme Switcher (top right) with Color Squares -->
    <div class="md:hidden fixed top-6 right-6 z-[9000] flex items-center border rounded-none backdrop-blur-xl shadow-2xl transition-all duration-500"
         style="background: var(--nav-bg); border-color: var(--card-border);">
      <button (click)="setTheme('dark')" 
              class="w-9 h-9 flex items-center justify-center transition-all duration-300 focus:outline-none cursor-pointer"
              [style.background]="currentTheme === 'dark' ? 'var(--text-primary)' : 'transparent'">
        <span class="w-3 h-3 rounded-none bg-black border border-white/20"></span>
      </button>
      <button (click)="setTheme('light')" 
              class="w-9 h-9 flex items-center justify-center transition-all duration-300 focus:outline-none cursor-pointer"
              [style.background]="currentTheme === 'light' ? 'var(--text-primary)' : 'transparent'">
        <span class="w-3 h-3 rounded-none bg-white border border-black/20"></span>
      </button>
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
    .nav-link { 
      position: relative; 
      color: var(--text-secondary);
      transition: color 0.25s ease;
    }
    .nav-link:hover, .nav-link.active {
      color: var(--text-primary) !important;
    }
    .nav-link i {
      transition: color 0.25s ease;
    }
    .nav-link:hover i, .nav-link.active i {
      color: var(--text-primary) !important;
    }
    .nav-link::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 50%;
      width: 3px;
      height: 3px;
      background: var(--text-primary);
      border-radius: 50%;
      opacity: 0;
      transform: translateX(-50%) scale(0.5);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .nav-link:hover::after, .nav-link.active::after { 
      opacity: 1;
      transform: translateX(-50%) scale(1);
    }
    .mobile-nav-item:active { transform: scale(0.95); }
  `]
})
export class NavbarComponent implements OnInit {
  private router = inject(Router);

  desktopItems = [
    { name: 'Inicio',    link: '#hero',      icon: 'fa-solid fa-shapes' },
    { name: 'Links',     link: '/links',     icon: 'fa-solid fa-compass' },
    { name: 'Proyectos', link: '#portfolio', icon: 'fa-solid fa-folder-open' },
    { name: 'Perfil',    link: '#about',     icon: 'fa-solid fa-id-card' },
    { name: 'Servicios', link: '#skills',    icon: 'fa-solid fa-sliders' }
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
  activeSection = '#hero';

  constructor() {
    if (typeof window !== 'undefined') {
      let savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
      if (savedTheme === 'red') {
        savedTheme = 'dark';
      }
      this.setTheme(savedTheme);
    }
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.onWindowScroll();
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (typeof window === 'undefined') return;

    // Detect if we are on the links route
    if (this.router.url.includes('/links')) {
      this.activeSection = '/links';
      return;
    }

    const sections = ['hero', 'portfolio', 'about', 'skills'];
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    for (const section of sections) {
      const el = document.getElementById(section);
      if (el) {
        const top = el.offsetTop - 140; // navbar offset
        const height = el.offsetHeight;
        if (scrollPosition >= top && scrollPosition < top + height) {
          this.activeSection = '#' + section;
          break;
        }
      }
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

