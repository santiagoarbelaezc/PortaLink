import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MagneticDirective } from '../../shared/directives/magnetic.directive';

@Component({
    selector: 'app-navbar',
    imports: [CommonModule, MagneticDirective, RouterModule],
    template: `
    <!-- ═══════════════════════════════════════════ -->
    <!-- DESKTOP: Top pill navbar (md+)              -->
    <!-- ═══════════════════════════════════════════ -->
    <nav class="hidden md:block fixed top-0 left-0 w-full z-[9000] px-6 py-5">
      <div class="max-w-7xl mx-auto flex items-center justify-between px-8 py-3 rounded-full"
           style="background: #ffffff; border: 1px solid rgba(0,0,0,0.10); box-shadow: 0 2px 20px rgba(0,0,0,0.08);">

        <!-- Logo -->
        <div class="flex items-center gap-2 cursor-pointer" appMagnetic [appMagnetic]="0.2" routerLink="/">
          <svg width="36" height="36" viewBox="0 0 40 40">
            <path d="M10 30V10H20C25 10 25 15 20 15H10" stroke="#000000" stroke-width="2" fill="none" />
            <path d="M25 30V10" stroke="var(--accent-cyan)" stroke-width="2" fill="none" />
          </svg>
        </div>

        <!-- Nav Links -->
        <div class="flex items-center gap-8">

          <a *ngFor="let item of desktopItems"
             (click)="scrollTo(item.link, $event)"
             class="nav-link text-sm font-medium tracking-widest uppercase cursor-pointer hover:text-accent-cyan transition-colors"
             style="color: rgba(0,0,0,0.65);"
             appMagnetic [appMagnetic]="0.3">
            {{ item.name }}
          </a>
        </div>

        <!-- CTA -->
        <button (click)="scrollTo('#contact', $event)" class="flex items-center gap-2 px-7 py-3 rounded-full text-black hover:border-accent-cyan transition-all duration-300"
                style="border: 1px solid rgba(0,0,0,0.20);"
                appMagnetic [appMagnetic]="0.1">
          <span class="text-xs font-bold tracking-widest uppercase">Contacto</span>
          <div class="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse"></div>
        </button>
      </div>
    </nav>

    <!-- ═══════════════════════════════════════════ -->
    <!-- MOBILE: Bottom app-style tab bar           -->
    <!-- ═══════════════════════════════════════════ -->
    <nav class="md:hidden fixed bottom-4 left-4 right-4 z-[9000]">
      <div class="flex items-center justify-around py-2 px-1 rounded-2xl"
           style="background: #ffffff; border: 1px solid rgba(0,0,0,0.10); box-shadow: 0 8px 32px rgba(0,0,0,0.14);">

        <a *ngFor="let item of mobileItems"
           (click)="scrollTo(item.link, $event)"
           class="mobile-nav-item flex flex-col items-center gap-1 px-4 py-2 rounded-xl cursor-pointer transition-all duration-200 hover:bg-black/5">
          <!-- Icon -->
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
               class="text-black/60" style="color: rgba(0,0,0,0.6);">
            <ng-container *ngIf="item.icon === 'home'">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </ng-container>
            <ng-container *ngIf="item.icon === 'grid'">
              <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
            </ng-container>
            <ng-container *ngIf="item.icon === 'user'">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </ng-container>
            <ng-container *ngIf="item.icon === 'code'">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
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
          <span class="text-[9px] font-medium uppercase tracking-wider" style="color: rgba(0,0,0,0.55);">
            {{ item.name }}
          </span>
        </a>

      </div>
    </nav>
  `,
    styles: [`
    .nav-link {
      position: relative;
    }
    .nav-link::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 0;
      height: 1px;
      background: var(--accent-cyan);
      transition: width 0.3s ease;
    }
    .nav-link:hover::after {
      width: 100%;
    }
    .mobile-nav-item:active {
      transform: scale(0.94);
    }
  `]
})
export class NavbarComponent {
  desktopItems = [
    { name: 'Proyectos', link: '#portfolio' },
    { name: 'Acerca de mi', link: '#about' },
    { name: 'Servicios', link: '#skills' }
  ];

  mobileItems = [
    { name: 'Inicio',     link: '#hero',      icon: 'home'  },
    { name: 'Proyectos', link: '#portfolio', icon: 'grid'  },
    { name: 'Acerca de mi', link: '#about',     icon: 'user'  },
    { name: 'Servicios', link: '#skills',  icon: 'layers' },
    { name: 'Contacto',  link: '#contact',   icon: 'mail'  },
  ];

  scrollTo(link: string, event: Event) {
    event.preventDefault();
    const element = document.getElementById(link.replace('#', ''));
    if (element) {
      const offset = 100; // Account for fixed navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }
}
