import { Component, inject, HostListener, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AnalyticsService } from '../../services/analytics.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <!-- ═══════════════════════════════════════════ -->
    <!-- DESKTOP: Top pill navbar (md+)              -->
    <!-- ═══════════════════════════════════════════ -->
    <nav class="hidden md:block fixed top-0 left-0 w-full z-[9000] px-10 lg:px-20 py-3.5 backdrop-blur-xl transition-all duration-500"
         [ngClass]="[
           currentTheme === 'light' 
             ? 'bg-white/90 border-b border-neutral-200/80 text-neutral-900 shadow-sm' 
             : 'bg-black/90 border-b border-neutral-800/80 text-white shadow-md',
           isNavbarHiddenAtTop ? 'opacity-0 pointer-events-none -translate-y-full' : 'opacity-100 pointer-events-auto translate-y-0'
         ]">
      <div class="w-full flex items-center justify-between">

        <!-- Left Side: Brand Logo -->
        <div class="flex items-center flex-1">
          <a (click)="scrollTo('#hero', $event)" routerLink="/" class="flex items-center cursor-pointer group no-underline">
            <img [src]="currentTheme === 'light' ? 'assets/icons/navbar-logolight.png' : 'assets/icons/navbar-logodark.png'" 
                 alt="Portalink" 
                 class="h-8 sm:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
          </a>
        </div>

        <!-- Center: Pure Minimalist Nav Links with Active Underline -->
        <div class="flex items-center gap-10 lg:gap-14 justify-center">
          <a *ngFor="let item of desktopItems"
             (click)="scrollTo(item.link, $event)"
             class="relative py-2 font-headline font-semibold text-sm tracking-tight cursor-pointer transition-all duration-300 group"
             [ngClass]="activeSection === item.link 
               ? (currentTheme === 'light' ? 'text-neutral-950 font-bold' : 'text-white font-bold') 
               : (currentTheme === 'light' ? 'text-neutral-600 hover:text-neutral-950' : 'text-neutral-400 hover:text-white')">
            
            <span>{{ item.name }}</span>

            <!-- Sleek Minimalist Active Underline Bar -->
            <span [ngClass]="activeSection === item.link ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-40 group-hover:scale-x-75'"
                  class="absolute -bottom-1 left-0 w-full h-[2px] rounded-full transition-all duration-300 origin-center"
                  [style.background]="currentTheme === 'light' ? '#000000' : '#ffffff'">
            </span>
          </a>
        </div>

        <!-- Right Side: Ingresar & Registrarse Button / User Dropdown -->
        <div class="flex items-center justify-end flex-1 gap-6 sm:gap-8">

          <!-- Ingresar Text Link (When not authenticated) -->
          <button *ngIf="!authService.isAuthenticated()" 
                  (click)="openLoginModal()" 
                  class="font-headline font-medium text-xs uppercase tracking-[0.15em] transition-opacity duration-300 opacity-70 hover:opacity-100 cursor-pointer bg-transparent border-none p-0"
                  [style.color]="currentTheme === 'light' ? '#111827' : '#ffffff'">
            {{ getLoginLabel() }}
          </button>

          <!-- Registrarse Minimal Pill Button (When not authenticated) -->
          <button *ngIf="!authService.isAuthenticated()" 
                  (click)="openRegisterModal()" 
                  class="px-5 py-1.5 rounded-full font-headline font-medium text-xs uppercase tracking-[0.15em] transition-all duration-300 border cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
                  [ngClass]="currentTheme === 'light' 
                    ? 'border-neutral-900/80 text-neutral-900 hover:bg-neutral-900 hover:text-white' 
                    : 'border-white/80 text-white hover:bg-white hover:text-black'">
            {{ currentLanguage === 'es' ? 'REGISTRARSE' : 'REGISTER' }}
          </button>

          <!-- User Dropdown (When authenticated) -->
          <div *ngIf="authService.isAuthenticated()" class="relative user-dropdown-container">
            <button (click)="toggleUserDropdown($event)"
                    class="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full transition-all duration-300 border hover:bg-white/5 cursor-pointer"
                    [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)'"
                    [style.color]="currentTheme === 'light' ? '#1f2937' : '#ffffff'">
              <div class="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-[9px] font-semibold text-white shadow-md">
                {{ getUserInitials() }}
              </div>
              <span class="font-headline text-xs font-semibold uppercase tracking-[0.12em] truncate max-w-[100px]">{{ authService.currentUser()?.nombre }}</span>
              <svg class="w-3.5 h-3.5 opacity-60 transition-transform duration-300" [class.rotate-180]="showUserDropdown" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown Card -->
            <div *ngIf="showUserDropdown" 
                 class="absolute right-0 top-full mt-2 w-56 rounded-2xl border p-2 shadow-2xl backdrop-blur-xl transition-all duration-200 animate-dropdown"
                 [ngClass]="currentTheme === 'light' ? 'bg-white/95 border-neutral-200/80 text-neutral-800' : 'bg-neutral-900/95 border-neutral-800 text-white'"
                 style="z-index: 10000;">
              <!-- User Info Header -->
              <div class="px-3 py-3 border-b mb-1" [ngClass]="currentTheme === 'light' ? 'border-neutral-100' : 'border-neutral-800'">
                <p class="text-xs font-bold truncate">{{ authService.currentUser()?.nombre }}</p>
                <p class="text-[9px] uppercase tracking-widest opacity-50 font-semibold truncate">{{ authService.currentUser()?.rol }}</p>
              </div>

              <!-- Menu Items -->
              <div class="space-y-0.5">
                <a *ngIf="authService.currentUser()?.rol === 'admin'" (click)="goToPage('/admin')" class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors cursor-pointer border border-cyan-500/30 mb-1">
                  <svg class="w-4 h-4 text-cyan-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                  <span>{{ currentLanguage === 'es' ? 'Dashboard Admin' : 'Admin Dashboard' }}</span>
                </a>

                <a (click)="goToPage('/rotbot')" class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer hover:bg-neutral-500/10 transition-colors">
                  <svg class="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2zM9 10h.01M15 10h.01" />
                  </svg>
                  <span>{{ currentLanguage === 'es' ? 'Hablar con Rotbot' : 'Talk to Rotbot' }}</span>
                </a>
                <a (click)="goToPage('/perfil')" class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer hover:bg-neutral-500/10 transition-colors">
                  <svg class="w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{{ currentLanguage === 'es' ? 'Mi Perfil' : 'My Profile' }}</span>
                </a>
                <a (click)="goToPage('/certificados')" class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer hover:bg-neutral-500/10 transition-colors">
                  <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path d="M12 15l-2 5l-3 -2l-3 2l2 -5"></path>
                    <circle cx="12" cy="9" r="6"></circle>
                  </svg>
                  <span>{{ currentLanguage === 'es' ? 'Certificados' : 'Certificates' }}</span>
                </a>
                <a (click)="goToPage('/perfil?tab=password')" class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer hover:bg-neutral-500/10 transition-colors">
                  <svg class="w-4 h-4 text-neutral-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{{ currentLanguage === 'es' ? 'Configuración' : 'Settings' }}</span>
                </a>
              </div>

              <!-- Logout Separator -->
              <div class="border-t mt-1.5 pt-1.5" [ngClass]="currentTheme === 'light' ? 'border-neutral-100' : 'border-neutral-800'">
                <button (click)="logoutUser()" 
                        class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer text-left border-none bg-transparent">
                  <svg class="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>{{ currentLanguage === 'es' ? 'Cerrar Sesión' : 'Sign Out' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- ═══════════════════════════════════════════ -->
    <!-- MOBILE: Bottom app-style tab bar           -->
    <!-- ═══════════════════════════════════════════ -->
    <nav class="md:hidden fixed left-1/2 -translate-x-1/2 z-[9000] w-[92%] max-w-[360px]"
         [style.bottom]="'calc(1.25rem + env(safe-area-inset-bottom, 0px))'">
      <div #tabBar 
           (touchstart)="onTouchStart($event)"
           (touchmove)="onTouchMove($event)"
           (touchend)="onTouchEnd()"
           (mousedown)="onMouseDown($event)"
           class="relative flex items-center justify-around py-2 px-1.5 rounded-full border shadow-2xl transition-all duration-500 overflow-hidden"
           [style.background]="currentTheme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.88)'"
           [style.borderColor]="currentTheme === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)'">
        

        
        <!-- Draggable active selection background pill -->
        <div class="absolute left-0 top-1/2 -translate-y-1/2 h-[42px] rounded-full pointer-events-none"
             [style.background]="currentTheme === 'light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.12)'"
             [style.width.px]="pillWidth"
             [style.transform]="'translate3d(' + pillOffset + 'px, -50%, 0)'"
             [style.transition]="isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'">
        </div>

        <!-- Tab Items -->
        <a *ngFor="let item of mobileItems; let i = index"
           (click)="scrollTo(item.link, $event)"
           [class.active]="activeSection === item.link"
           class="mobile-nav-item flex flex-col items-center justify-center w-12 h-12 rounded-full cursor-pointer transition-all duration-200 relative z-10 group">
          
          <!-- Image Icon for RotBot (Chat) -->
          <img *ngIf="item.icon === 'chat'" 
               [src]="currentTheme === 'light' ? 'assets/icons/logo-link-light.png' : 'assets/icons/logo-link-dark.png'" 
               alt="RotBot" 
               width="20"
               height="20"
               class="w-5 h-5 object-contain transition-all duration-300 group-hover:scale-110" 
               [class.opacity-100]="activeSection === item.link"
               [class.opacity-60]="activeSection !== item.link" />

          <!-- SVG Icon for standard items -->
          <svg *ngIf="item.icon !== 'chat'" 
               width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
               [class.text-black]="currentTheme === 'light' && activeSection === item.link"
               [class.text-black\/50]="currentTheme === 'light' && activeSection !== item.link"
               [class.text-white]="currentTheme !== 'light' && activeSection === item.link"
               [class.text-white\/60]="currentTheme !== 'light' && activeSection !== item.link"
               class="transition-all duration-300 group-hover:scale-110">
            <ng-container *ngIf="item.icon === 'home'">
              <path d="M3 10.5L12 3l9 7.5v9a2 2 0 0 1-2 2h-4a1 1 0 0 1-1-1v-4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v4a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2v-9z"></path>
            </ng-container>

            <ng-container *ngIf="item.icon === 'link'">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </ng-container>
            <ng-container *ngIf="item.icon === 'planes'">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </ng-container>
            <ng-container *ngIf="item.icon === 'disenos'">
              <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
              <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
              <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
              <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
            </ng-container>
            <ng-container *ngIf="item.icon === 'certificate'">
              <path d="M12 15l-2 5l-3 -2l-3 2l2 -5"></path>
              <circle cx="12" cy="9" r="6"></circle>
            </ng-container>
            <ng-container *ngIf="item.icon === 'user'">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </ng-container>
          </svg>
        </a>
      </div>
    </nav>

    <!-- ELEGANT LOGIN/REGISTER MODAL -->
    <div *ngIf="showLoginModal" 
         class="fixed inset-0 z-[10000] flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in"
         (click)="closeLoginModal()">
      
      <!-- Modal Container (Solid White or Solid Black depending on currentTheme) -->
      <div class="elegant-modal-box w-full max-w-[440px] rounded-3xl border overflow-hidden relative shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] transition-all duration-500"
           (click)="$event.stopPropagation()"
           [style.background]="currentTheme === 'light' ? '#ffffff' : '#000000'"
           [style.borderColor]="currentTheme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'">
        


        <!-- Close Button -->
        <button (click)="closeLoginModal()" 
                class="absolute top-6 right-6 w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 hover:rotate-90 active:scale-95 cursor-pointer z-50 hover:bg-black/5 dark:hover:bg-white/5"
                [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)'"
                [style.color]="currentTheme === 'light' ? '#1f2937' : '#ffffff'">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <div class="px-8 pt-10 pb-8 relative z-10">
          
          <!-- Logo & Header -->
          <div class="flex flex-col items-center text-center mb-8">
            <img [src]="currentTheme === 'dark' ? 'assets/icons/navbar-logodark.png' : 'assets/icons/navbar-logolight.png'" class="w-16 h-16 object-contain mb-4" alt="Logo">
            <h4 class="text-xl font-bold uppercase tracking-wide" [style.color]="currentTheme === 'light' ? '#111827' : '#ffffff'">
              {{ activeTab === 'signin' ? getLoginTranslation('title') : getLoginTranslation('signUpTab') }}
            </h4>
            <p class="text-xs mt-1.5 opacity-60" [style.color]="currentTheme === 'light' ? '#4b5563' : '#9ca3af'">
              {{ activeTab === 'signin' ? getLoginTranslation('subtitle') : '' }}
            </p>
          </div>

          <!-- Switch Tabs -->
          <div class="grid grid-cols-2 gap-1 p-1 rounded-2xl border mb-6 relative"
               [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'"
               [style.background]="currentTheme === 'light' ? '#f3f4f6' : '#121212'">
            
            <!-- Sliding background indicator for tabs -->
            <div class="absolute top-1 bottom-1 rounded-xl transition-all duration-300 ease-out"
                 [style.width]="'calc(50% - 4px)'"
                 [style.left]="activeTab === 'signin' ? '4px' : 'calc(50% + 0px)'"
                 [style.background]="currentTheme === 'light' ? '#ffffff' : '#222222'"
                 [style.boxShadow]="currentTheme === 'light' ? '0 4px 12px rgba(0,0,0,0.06)' : '0 4px 12px rgba(0,0,0,0.2)'">
            </div>

            <button type="button" (click)="activeTab = 'signin'" 
                    class="py-2.5 text-xs uppercase font-bold tracking-wider rounded-xl transition-all duration-300 cursor-pointer relative z-10"
                    [style.color]="activeTab === 'signin' ? (currentTheme === 'light' ? '#111827' : '#ffffff') : (currentTheme === 'light' ? '#9ca3af' : '#6b7280')">
              {{ getLoginTranslation('signInTab') }}
            </button>
            <button type="button" (click)="activeTab = 'signup'" 
                    class="py-2.5 text-xs uppercase font-bold tracking-wider rounded-xl transition-all duration-300 cursor-pointer relative z-10"
                    [style.color]="activeTab === 'signup' ? (currentTheme === 'light' ? '#111827' : '#ffffff') : (currentTheme === 'light' ? '#9ca3af' : '#6b7280')">
              {{ getLoginTranslation('signUpTab') }}
            </button>
          </div>

          <!-- Forms -->
          <form class="space-y-4">
            <!-- Register Name (Only signup) -->
            <div *ngIf="activeTab === 'signup'" class="relative flex flex-col gap-1.5 animate-slide-down">
              <label class="text-[9px] uppercase tracking-widest font-bold opacity-60" [style.color]="currentTheme === 'light' ? '#1f2937' : '#ffffff'">{{ getLoginTranslation('nameLabel') }}</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </span>
                <input type="text" 
                       class="login-input w-full py-3.5 pl-11 pr-4 rounded-xl border text-xs focus:outline-none transition-all duration-300"
                       [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'"
                       [style.background]="currentTheme === 'light' ? '#f9fafb' : '#0d0d0d'"
                       [style.color]="currentTheme === 'light' ? '#111827' : '#ffffff'" />
              </div>
            </div>

            <!-- Email -->
            <div class="relative flex flex-col gap-1.5">
              <label class="text-[9px] uppercase tracking-widest font-bold opacity-60" [style.color]="currentTheme === 'light' ? '#1f2937' : '#ffffff'">{{ getLoginTranslation('emailLabel') }}</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </span>
                <input type="email" 
                       class="login-input w-full py-3.5 pl-11 pr-4 rounded-xl border text-xs focus:outline-none transition-all duration-300"
                       [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'"
                       [style.background]="currentTheme === 'light' ? '#f9fafb' : '#0d0d0d'"
                       [style.color]="currentTheme === 'light' ? '#111827' : '#ffffff'" />
              </div>
            </div>

            <!-- Password -->
            <div class="relative flex flex-col gap-1.5">
              <div class="flex justify-between items-center">
                <label class="text-[9px] uppercase tracking-widest font-bold opacity-60" [style.color]="currentTheme === 'light' ? '#1f2937' : '#ffffff'">{{ getLoginTranslation('passwordLabel') }}</label>
                <a *ngIf="activeTab === 'signin'" href="#" class="text-[10px] hover:underline" [style.color]="currentTheme === 'light' ? '#4b5563' : '#9ca3af'">
                  {{ getLoginTranslation('forgotPassword') }}
                </a>
              </div>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </span>
                <input type="password" 
                       class="login-input w-full py-3.5 pl-11 pr-4 rounded-xl border text-xs focus:outline-none transition-all duration-300"
                       [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'"
                       [style.background]="currentTheme === 'light' ? '#f9fafb' : '#0d0d0d'"
                       [style.color]="currentTheme === 'light' ? '#111827' : '#ffffff'" />
              </div>
            </div>

            <!-- Confirm Password (Only signup) -->
            <div *ngIf="activeTab === 'signup'" class="relative flex flex-col gap-1.5 animate-slide-down">
              <label class="text-[9px] uppercase tracking-widest font-bold opacity-60" [style.color]="currentTheme === 'light' ? '#1f2937' : '#ffffff'">{{ getLoginTranslation('confirmPasswordLabel') }}</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </span>
                <input type="password" 
                       class="login-input w-full py-3.5 pl-11 pr-4 rounded-xl border text-xs focus:outline-none transition-all duration-300"
                       [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'"
                       [style.background]="currentTheme === 'light' ? '#f9fafb' : '#0d0d0d'"
                       [style.color]="currentTheme === 'light' ? '#111827' : '#ffffff'" />
              </div>
            </div>

            <!-- Submit Button -->
            <button type="button" 
                    (click)="submitLogin()"
                    class="w-full py-3.5 mt-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-lg hover:shadow-xl"
                    style="background: var(--text-primary); color: var(--bg-primary); font-family: var(--font-headline);">
              {{ activeTab === 'signin' ? getLoginTranslation('submitLogin') : getLoginTranslation('submitRegister') }}
            </button>
          </form>

          <!-- Divider & Social Logins (Temporarily disabled) -->
          <!--
          <div class="flex items-center gap-4 my-6">
            <div class="h-px flex-grow" [style.background]="currentTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'"></div>
            <span class="text-[9px] uppercase tracking-widest opacity-40">Or</span>
            <div class="h-px flex-grow" [style.background]="currentTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'"></div>
          </div>

          <div class="space-y-2.5">
            <button class="w-full py-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-3 transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                    [style.background]="currentTheme === 'light' ? '#ffffff' : '#000000'"
                    [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)'"
                    [style.color]="currentTheme === 'light' ? '#111827' : '#ffffff'">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              {{ getLoginTranslation('googleLogin') }}
            </button>
            
            <button class="w-full py-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-3 transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                    [style.background]="currentTheme === 'light' ? '#ffffff' : '#000000'"
                    [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)'"
                    [style.color]="currentTheme === 'light' ? '#111827' : '#ffffff'">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              {{ getLoginTranslation('githubLogin') }}
            </button>
          </div>
          -->

        </div>
      </div>
    </div>
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

    .login-input {
      outline: none;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .login-input:focus {
      border-color: var(--text-primary) !important;
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.05);
      background: rgba(255, 255, 255, 0.04) !important;
    }
    .theme-light .login-input:focus {
      box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.03);
      background: rgba(0, 0, 0, 0.01) !important;
    }
    
    .animate-fade-in {
      animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; backdrop-filter: blur(0px); background: rgba(0,0,0,0); }
      to { opacity: 1; backdrop-filter: blur(20px); background: rgba(0,0,0,0.65); }
    }

    .elegant-modal-box {
      animation: modalSlideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes modalSlideUp {
      from { transform: translateY(24px) scale(0.97); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }

    .animate-slide-down {
      animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Autofill Overrides para que el navegador no ponga los inputs blancos */
    :host ::ng-deep input:-webkit-autofill,
    :host ::ng-deep input:-webkit-autofill:hover, 
    :host ::ng-deep input:-webkit-autofill:focus, 
    :host ::ng-deep input:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 30px #0a0a0a inset !important;
      -webkit-text-fill-color: var(--text-primary) !important;
      background-color: #0a0a0a !important;
      transition: background-color 5000s ease-in-out 0s;
      caret-color: var(--text-primary) !important;
    }
    
    :host ::ng-deep input[type="email"],
    :host ::ng-deep input[type="password"],
    :host ::ng-deep input[type="text"] {
      color: var(--text-primary) !important;
    }
  `]
})
export class NavbarComponent implements OnInit {
  public router = inject(Router);
  private analyticsService = inject(AnalyticsService);
  private lastTrackedSection = '';

  @ViewChild('tabBar') tabBarElement!: ElementRef;

  desktopItems: any[] = [];
  mobileItems: any[] = [];

  navItemsTranslations: any = {
    es: [
      { name: 'Inicio',       link: '#hero',          icon: 'home'     },
      { name: 'Diseños',      link: '/prototipos',    icon: 'disenos'  },
      { name: 'Links',        link: '/links',         icon: 'link'     },
      { name: 'RotBot',       link: '/rotbot',        icon: 'chat'     }
    ],
    en: [
      { name: 'Home',         link: '#hero',          icon: 'home'     },
      { name: 'Designs',      link: '/prototipos',    icon: 'disenos'  },
      { name: 'Links',        link: '/links',         icon: 'link'     },
      { name: 'RotBot',       link: '/rotbot',        icon: 'chat'     }
    ]
  };

  currentLanguage = 'es';
  currentTheme = 'light';
  activeSection = '#hero';

  isNavbarHiddenAtTop = false;
  isMouseNearTop = false;

  showLoginModal = false;
  activeTab = 'signin';

  loginTranslations: any = {
    es: {
      loginBtn: 'Ingresar',
      title: 'Bienvenido de nuevo',
      subtitle: 'Accede a tu cuenta de PortaLink',
      emailLabel: 'Correo Electrónico',
      passwordLabel: 'Contraseña',
      forgotPassword: '¿Olvidaste tu contraseña?',
      submitLogin: 'Iniciar Sesión',
      noAccount: '¿No tienes una cuenta?',
      signUp: 'Registrarse',
      signInTab: 'Ingresar',
      signUpTab: 'Registrarse',
      nameLabel: 'Nombre Completo',
      confirmPasswordLabel: 'Confirmar Contraseña',
      submitRegister: 'Crear Cuenta',
      alreadyAccount: '¿Ya tienes una cuenta?',
      googleLogin: 'Continuar con Google',
      githubLogin: 'Continuar con GitHub'
    },
    en: {
      loginBtn: 'Login',
      title: 'Welcome Back',
      subtitle: 'Access your PortaLink account',
      emailLabel: 'Email Address',
      passwordLabel: 'Password',
      forgotPassword: 'Forgot your password?',
      submitLogin: 'Sign In',
      noAccount: 'Don\'t have an account?',
      signUp: 'Sign Up',
      signInTab: 'Sign In',
      signUpTab: 'Sign Up',
      nameLabel: 'Full Name',
      confirmPasswordLabel: 'Confirm Password',
      submitRegister: 'Create Account',
      alreadyAccount: 'Already have an account?',
      googleLogin: 'Continue with Google',
      githubLogin: 'Continue with GitHub'
    }
  };

  openLoginModal() {
    this.router.navigate(['/login']);
  }

  openRegisterModal() {
    this.router.navigate(['/register']);
  }

  closeLoginModal() {
    this.showLoginModal = false;
  }

  submitLogin() {
    this.closeLoginModal();
    this.router.navigate(['/admin']);
  }

  getLoginTranslation(key: string): string {
    return this.loginTranslations[this.currentLanguage][key] || key;
  }

  getLoginLabel() {
    return this.currentLanguage === 'es' ? 'Ingresar' : 'Login';
  }

  // Dragging active pill state
  isDragging = false;
  hasDragged = false;
  startX = 0;
  startPillOffset = 0;
  pillOffset = 8;
  pillWidth = 50;
  private containerLeft = 0;
  private containerWidth = 0;

  isManualScroll = false; // Prevents scroll listener from reverting the pill during smooth scroll

  authService = inject(AuthService);
  showUserDropdown = false;

  getUserInitials(): string {
    const user = this.authService.currentUser();
    if (!user || !user.nombre) return 'U';
    const parts = user.nombre.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return user.nombre[0].toUpperCase();
  }

  toggleUserDropdown(event: Event) {
    event.stopPropagation();
    this.showUserDropdown = !this.showUserDropdown;
  }

  goToPage(url: string) {
    this.showUserDropdown = false;
    this.router.navigateByUrl(url);
  }

  logoutUser() {
    this.showUserDropdown = false;
    this.authService.logout();
  }

  @HostListener('document:click', ['$event'])
  closeDropdowns(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-dropdown-container')) {
      this.showUserDropdown = false;
    }
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.setTheme('light');
      this.currentLanguage = localStorage.getItem('portfolio-language') || 'es';

      // Listen to auth changes to update navigation links (especially mobile profile link)
      window.addEventListener('auth-change', () => {
        this.updateNavItems();
      });
    }
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.updateNavItems();
      this.onWindowScroll();
      
      // Call multiple times to ensure layout has settled
      setTimeout(() => this.updatePillPosition(), 50);
      setTimeout(() => this.updatePillPosition(), 200);
      setTimeout(() => this.updatePillPosition(), 500);

      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          setTimeout(() => {
            if (!this.isManualScroll) this.onWindowScroll();
            // Trigger pill updates on navigation
            this.updatePillPosition();
            setTimeout(() => this.updatePillPosition(), 200);
          }, 100);
        }
      });
    }
  }

  updateNavbarVisibility() {
    if (typeof window === 'undefined') return;
    this.isNavbarHiddenAtTop = false;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (typeof window === 'undefined') return;
    this.updateNavbarVisibility();
    if (this.isManualScroll) return;

    if (this.router.url.includes('/login') || this.router.url.includes('/register')) {
      this.activeSection = '/login';
      this.updatePillPosition();
      return;
    }

    if (this.router.url.includes('/prototipos') || this.router.url.includes('/disenos') || this.router.url.includes('/descripcion-proyecto') || this.router.url.includes('/proyecto')) {
      this.activeSection = '/prototipos';
      this.updatePillPosition();
      return;
    }

    if (this.router.url.includes('/certificados')) {
      this.activeSection = '/certificados';
      this.updatePillPosition();
      return;
    }



    if (this.router.url.includes('/links')) {
      this.activeSection = '/links';
      this.updatePillPosition();
      return;
    }

    if (this.router.url.includes('/rotbot')) {
      this.activeSection = '/rotbot';
      this.updatePillPosition();
      return;
    }

    if (this.router.url.includes('/planes')) {
      this.activeSection = '/planes';
      this.updatePillPosition();
      return;
    }

    if (this.router.url.includes('/personalizar')) {
      this.activeSection = '/personalizar';
      this.updatePillPosition();
      return;
    }

    if (this.router.url.includes('/perfil')) {
      this.activeSection = '/perfil';
      this.updatePillPosition();
      return;
    }

    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    // Default to hero if scrolled close to top
    if (scrollPosition < 100) {
      this.activeSection = '#hero';
      this.updatePillPosition();
      this.trackSectionView();
      return;
    }

    const sections = ['hero', 'portfolio', 'about', 'skills', 'contact'];
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
    this.trackSectionView();
  }

  private trackSectionView() {
    if (this.activeSection && this.activeSection.startsWith('#')) {
      const cleanSection = this.activeSection;
      if (cleanSection !== this.lastTrackedSection) {
        this.lastTrackedSection = cleanSection;
        this.analyticsService.incrementSectionView(cleanSection);
      }
    }
  }

  updatePillPosition() {
    if (typeof document === 'undefined') return;
    setTimeout(() => {
      let activeItem: HTMLElement | null = null;
      if (this.tabBarElement && this.tabBarElement.nativeElement) {
        activeItem = this.tabBarElement.nativeElement.querySelector('.mobile-nav-item.active') as HTMLElement;
      } else {
        activeItem = document.querySelector('.mobile-nav-item.active') as HTMLElement;
      }

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
    if (typeof window === 'undefined') return;
    this.isMouseNearTop = event.clientY < 90;
    this.updateNavbarVisibility();
    if (this.isDragging) {
      this.handleDrag(event.clientX);
    }
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
    const container = this.tabBarElement?.nativeElement || document.querySelector('.mobile-nav-item.active')?.parentElement;
    if (!container) return;

    this.isDragging = true;
    this.hasDragged = false;
    this.containerLeft = containerLeft;
    this.containerWidth = container.clientWidth;
    this.startX = clientX - this.containerLeft;
    this.startPillOffset = this.pillOffset;
  }

  handleDrag(clientX: number) {
    if (!this.isDragging) return;
    const currentX = clientX - this.containerLeft;
    const deltaX = currentX - this.startX;

    if (Math.abs(deltaX) > 8) {
      this.hasDragged = true;
    }

    const maxOffset = this.containerWidth - this.pillWidth - 8;
    this.pillOffset = Math.max(8, Math.min(this.startPillOffset + deltaX, maxOffset));
  }

  endDrag() {
    if (!this.isDragging) return;
    this.isDragging = false;

    // If it was a simple click/tap without drag distance, let normal click logic proceed
    if (!this.hasDragged) {
      this.updatePillPosition();
      return;
    }

    if (typeof document === 'undefined') return;
    const container = this.tabBarElement?.nativeElement;
    if (!container) return;
    const items = Array.from(container.querySelectorAll('.mobile-nav-item')) as HTMLElement[];
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

  setTheme(theme: string = 'light') {
    this.currentTheme = 'light';
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('theme-dark', 'theme-red');
      root.classList.add('theme-light');
      localStorage.setItem('portfolio-theme', 'light');
      window.dispatchEvent(new CustomEvent('portfolio-theme-change', { detail: { theme: 'light' } }));
    }
  }

  toggleTheme() {
    this.setTheme('light');
  }

  toggleLanguage() {
    const nextLang = this.currentLanguage === 'es' ? 'en' : 'es';
    this.setLanguage(nextLang);
  }

  setLanguage(lang: string) {
    this.currentLanguage = lang;
    localStorage.setItem('portfolio-language', lang);
    this.updateNavItems();
    window.dispatchEvent(new CustomEvent('portfolio-language-change', { detail: { language: lang } }));
  }

  updateNavItems() {
    const items = this.navItemsTranslations[this.currentLanguage] || this.navItemsTranslations['es'];
    this.desktopItems = [...items];
    
    const isEs = this.currentLanguage === 'es';
    this.mobileItems = [
      { name: isEs ? 'Inicio' : 'Home',         link: '#hero',          icon: 'home' },
      { name: isEs ? 'Diseños' : 'Designs',     link: '/prototipos',    icon: 'disenos' },
      { name: 'Links',                          link: '/links',         icon: 'link' },
      { name: 'Chat',                           link: '/rotbot',        icon: 'chat' },
      { name: isEs ? 'Cuenta' : 'Account',      link: this.authService.isAuthenticated() ? '/perfil' : '/login', icon: 'user' }
    ];
    setTimeout(() => this.updatePillPosition(), 100);
  }

  getContactLabel() {
    return this.currentLanguage === 'es' ? 'Contacto' : 'Contact';
  }

  private scrollIntoView(id: string, retries = 8) {
    if (id === 'hero' || id === 'hero-design') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } else if (retries > 0) {
      setTimeout(() => this.scrollIntoView(id, retries - 1), 150);
    }
  }

  scrollTo(link: string, event: Event) {
    if (event) event.preventDefault();

    this.activeSection = link;
    this.updatePillPosition();

    this.isManualScroll = true;
    setTimeout(() => { this.isManualScroll = false; }, 800);

    if (link.startsWith('#')) {
      this.analyticsService.incrementSectionView(link);
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
