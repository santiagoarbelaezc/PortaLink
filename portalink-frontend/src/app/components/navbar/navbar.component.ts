import { Component, inject, HostListener, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterModule],
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
    <nav class="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[9000] w-[92%] max-w-[360px]">
      <div #tabBar 
           (touchstart)="onTouchStart($event)"
           (touchmove)="onTouchMove($event)"
           (touchend)="onTouchEnd()"
           (mousedown)="onMouseDown($event)"
           class="relative flex items-center justify-around py-2 px-1.5 rounded-full border shadow-2xl transition-all duration-500 overflow-hidden"
           [style.background]="currentTheme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.88)'"
           [style.borderColor]="currentTheme === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)'">
        
        <!-- Draggable active selection background pill -->
        <div class="absolute top-1/2 -translate-y-1/2 h-[42px] rounded-full pointer-events-none"
             [style.background]="currentTheme === 'light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.12)'"
             [style.width.px]="pillWidth"
             [style.transform]="'translate3d(' + pillOffset + 'px, -50%, 0)'"
             [style.transition]="isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'">
        </div>

        <!-- Tab Items -->
        <a *ngFor="let item of mobileItems; let i = index"
           (click)="scrollTo(item.link, $event)"
           [class.active]="activeSection === item.link"
           class="mobile-nav-item flex flex-col items-center justify-center w-12 h-12 rounded-full cursor-pointer transition-all duration-200 relative z-10">
          
          <!-- Icon -->
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
               [class.text-black]="currentTheme === 'light' && activeSection === item.link"
               [class.text-black\/50]="currentTheme === 'light' && activeSection !== item.link"
               [class.text-white]="currentTheme !== 'light' && activeSection === item.link"
               [class.text-white\/60]="currentTheme !== 'light' && activeSection !== item.link"
               class="transition-colors">
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
          </svg>
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
    .mobile-nav-item:active { transform: scale(0.92); }
  `]
})
export class NavbarComponent implements OnInit {
  private router = inject(Router);

  @ViewChild('tabBar') tabBarElement!: ElementRef;

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
    { name: 'Servicios', link: '#skills',    icon: 'layers' }
  ];

  currentTheme = 'dark';
  activeSection = '#hero';

  // Dragging active pill state
  isDragging = false;
  startX = 0;
  startPillOffset = 0;
  pillOffset = 8;
  pillWidth = 50;
  private containerLeft = 0;
  private containerWidth = 0;

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
      
      // Call multiple times to ensure layout has settled
      setTimeout(() => this.updatePillPosition(), 50);
      setTimeout(() => this.updatePillPosition(), 200);
      setTimeout(() => this.updatePillPosition(), 500);

      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          setTimeout(() => {
            this.onWindowScroll();
            // Trigger pill updates on navigation
            this.updatePillPosition();
            setTimeout(() => this.updatePillPosition(), 200);
          }, 100);
        }
      });
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (typeof window === 'undefined') return;

    if (this.router.url.includes('/links')) {
      this.activeSection = '/links';
      this.updatePillPosition();
      return;
    }

    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    // Default to hero if scrolled close to top
    if (scrollPosition < 100) {
      this.activeSection = '#hero';
      this.updatePillPosition();
      return;
    }

    const sections = ['hero', 'portfolio', 'about', 'skills'];
    for (const section of sections) {
      const el = document.getElementById(section);
      if (el) {
        const top = el.offsetTop - 140; 
        const height = el.offsetHeight;
        if (scrollPosition >= top && scrollPosition < top + height) {
          this.activeSection = '#' + section;
          this.updatePillPosition();
          break;
        }
      }
    }
  }

  updatePillPosition() {
    if (typeof document === 'undefined') return;
    setTimeout(() => {
      const activeItem = document.querySelector('.mobile-nav-item.active') as HTMLElement;
      if (activeItem) {
        this.pillOffset = activeItem.offsetLeft;
        this.pillWidth = activeItem.clientWidth;
      } else {
        const index = this.mobileItems.findIndex(item => item.link === this.activeSection);
        if (index !== -1) {
          const itemWidth = 64; 
          this.pillOffset = 8 + (index * itemWidth);
          this.pillWidth = 50;
        }
      }
    }, 150);
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.handleDrag(event.clientX);
  }

  @HostListener('window:mouseup')
  onMouseUp() {
    this.endDrag();
  }

  @HostListener('window:touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (event.touches.length > 0) {
      this.handleDrag(event.touches[0].clientX);
    }
  }

  @HostListener('window:touchend')
  onTouchEnd() {
    this.endDrag();
  }

  onMouseDown(event: MouseEvent) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.startDrag(event.clientX, rect.left);
  }

  onTouchStart(event: TouchEvent) {
    if (event.touches.length > 0) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      this.startDrag(event.touches[0].clientX, rect.left);
    }
  }

  startDrag(clientX: number, containerLeft: number) {
    if (typeof document === 'undefined') return;
    const container = document.querySelector('.mobile-nav-item.active')?.parentElement as HTMLElement;
    if (!container) return;

    this.isDragging = true;
    this.containerLeft = containerLeft;
    this.containerWidth = container.clientWidth;
    this.startX = clientX - this.containerLeft;
    this.startPillOffset = this.pillOffset;
  }

  handleDrag(clientX: number) {
    if (!this.isDragging) return;
    const currentX = clientX - this.containerLeft;
    const deltaX = currentX - this.startX;
    const maxOffset = this.containerWidth - this.pillWidth - 8;
    this.pillOffset = Math.max(8, Math.min(this.startPillOffset + deltaX, maxOffset));
  }

  endDrag() {
    if (!this.isDragging) return;
    this.isDragging = false;

    if (typeof document === 'undefined') return;
    const items = Array.from(document.querySelectorAll('.mobile-nav-item')) as HTMLElement[];
    if (items.length === 0) return;

    const pillCenter = this.pillOffset + (this.pillWidth / 2);
    let closestIndex = 0;
    let minDistance = Infinity;

    items.forEach((item, index) => {
      const itemCenter = item.offsetLeft + (item.clientWidth / 2);
      const distance = Math.abs(pillCenter - itemCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    const targetItem = this.mobileItems[closestIndex];
    this.scrollTo(targetItem.link, new CustomEvent('dummy') as any);
    this.activeSection = targetItem.link;
    this.updatePillPosition();
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
    if (event) event.preventDefault();
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

