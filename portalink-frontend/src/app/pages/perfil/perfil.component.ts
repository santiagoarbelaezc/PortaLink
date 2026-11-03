import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="h-screen overflow-hidden flex flex-col md:flex-row font-sans relative"
         [ngClass]="isDark ? 'bg-neutral-950 text-neutral-100' : 'bg-white text-neutral-900'">

      <!-- ══════════════════════════════════════
           MOBILE BACKDROP OVERLAY
      ══════════════════════════════════════ -->
      <div *ngIf="isMobileDrawerOpen"
           (click)="isMobileDrawerOpen = false"
           class="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300">
      </div>

      <!-- ══════════════════════════════════════
           LEFT SIDEBAR / MOBILE DRAWER
      ══════════════════════════════════════ -->
      <aside class="fixed md:static inset-y-0 left-0 z-50 shrink-0 flex flex-col h-full border-r overflow-hidden transition-transform md:transition-all duration-300 w-64"
             [ngClass]="[
               isDark ? 'bg-[#07070a] border-neutral-800' : 'bg-neutral-50 border-neutral-200',
               isMobileDrawerOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
             ]">

        <!-- Logo Header -->
        <div class="py-4 md:py-5 border-b flex items-center justify-between shrink-0 px-5 gap-3"
             [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
          <div class="flex items-center gap-3">
            <img [src]="isDark ? 'assets/icons/navbar-logodark.png' : 'assets/icons/navbar-logolight.png'" class="w-9 h-9 md:w-10 md:h-10 object-contain flex-shrink-0" alt="PortaLink">
            <div class="min-w-0">
              <h1 class="text-sm font-bold tracking-widest uppercase truncate"
                  [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">PortaLink</h1>
              <span class="text-[9px] uppercase tracking-[0.25em] font-bold"
                    [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'">Ajustes</span>
            </div>
          </div>
          <button (click)="isMobileDrawerOpen = false" class="md:hidden p-2 rounded-xl text-neutral-400 hover:text-white">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- User Profile Info Card in Sidebar -->
        <div class="p-5 border-b flex flex-col items-center text-center shrink-0"
             [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200/80'">
          <div class="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xl font-headline font-bold text-white shadow-md mb-3">
            {{ getUserInitials() }}
          </div>
          <h2 class="text-sm font-headline font-bold truncate w-full" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ authService.currentUser()?.nombre }}</h2>
          <span class="text-[9px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border mt-1.5"
                [ngClass]="isDark ? 'border-neutral-800 bg-neutral-900 text-neutral-400' : 'border-neutral-200/80 bg-neutral-100 text-neutral-700'">
            {{ authService.currentUser()?.rol }}
          </span>
        </div>

        <!-- Navigation Tabs -->
        <nav class="flex-grow p-3 space-y-1 overflow-y-auto sidebar-nav overflow-x-hidden">
          <!-- Mi Perfil tab -->
          <button (click)="setTab('profile')"
                  class="flex items-center rounded-2xl text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer w-full px-3.5 py-2.5 gap-3 border-none"
                  [ngClass]="getTabClass('profile')">
            <svg class="w-[18px] h-[18px] flex-shrink-0" [style.color]="activeTab === 'profile' ? '#ffffff' : (isDark ? '#a3a3a3' : '#374151')" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span class="text-left text-[13px] font-headline font-semibold"
                  [style.color]="activeTab === 'profile' ? '#ffffff' : (isDark ? '#a3a3a3' : '#374151')">Mi Perfil</span>
          </button>

          <!-- Cambiar contraseña tab -->
          <button (click)="setTab('password')"
                  class="flex items-center rounded-2xl text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer w-full px-3.5 py-2.5 gap-3 border-none"
                  [ngClass]="getTabClass('password')">
            <svg class="w-[18px] h-[18px] flex-shrink-0" [style.color]="activeTab === 'password' ? '#ffffff' : (isDark ? '#a3a3a3' : '#374151')" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span class="text-left text-[13px] font-headline font-semibold"
                  [style.color]="activeTab === 'password' ? '#ffffff' : (isDark ? '#a3a3a3' : '#374151')">Cambiar Contraseña</span>
          </button>

          <!-- Certificados Acreditados link -->
          <a [routerLink]="['/certificados']"
             (click)="goToCertificados($event)"
             class="flex items-center rounded-2xl text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer w-full px-3.5 py-2.5 gap-3 border-none no-underline"
             [ngClass]="isDark ? 'text-neutral-400 hover:text-white hover:bg-neutral-900' : 'text-neutral-700 hover:text-black hover:bg-neutral-100'">
            <svg class="w-[18px] h-[18px] flex-shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path d="M12 15l-2 5l-3 -2l-3 2l2 -5"></path>
              <circle cx="12" cy="9" r="6"></circle>
            </svg>
            <span class="text-left text-[13px] font-headline font-semibold"
                  [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">Certificados</span>
          </a>
        </nav>

        <!-- Bottom: Logout -->
        <div class="p-3 border-t shrink-0 mb-14 md:mb-0" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200/80'">
          <button (click)="logout()"
                  class="flex items-center rounded-2xl text-[13px] font-semibold transition-all duration-200 cursor-pointer w-full px-3.5 py-2.5 gap-3 border-none"
                  [ngClass]="isDark ? 'text-neutral-500 hover:text-red-400 hover:bg-red-500/10' : 'text-neutral-500 hover:text-red-600 hover:bg-red-50'">
            <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            <span class="font-headline font-semibold">Salir</span>
          </button>
        </div>
      </aside>

      <!-- ══════════════════════════════════════
           MAIN CONTENT AREA
      ══════════════════════════════════════ -->
      <div class="flex-grow flex flex-col h-full overflow-hidden w-full">
        
        <!-- Top Bar (Title & Back Options) -->
        <header class="h-16 sm:h-20 shrink-0 border-b flex items-center justify-between px-3.5 sm:px-6 md:px-8 z-20 transition-all duration-300 backdrop-blur-xl"
                [ngClass]="isDark ? 'bg-[#07070a]/90 border-neutral-800/80' : 'bg-white/90 border-neutral-200/80'">
          
          <div class="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <!-- Mobile Menu Toggle -->
            <button (click)="isMobileDrawerOpen = !isMobileDrawerOpen"
                    class="md:hidden p-2 rounded-xl transition-all cursor-pointer border flex items-center justify-center shrink-0 active:scale-95"
                    [ngClass]="isDark ? 'bg-white/5 border-neutral-800 text-neutral-300 hover:text-white' : 'bg-neutral-100/80 border-neutral-200 text-neutral-700 hover:text-black'"
                    title="Abrir menú">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <!-- Mobile Title -->
            <div class="md:hidden flex items-center gap-1.5 min-w-0">
              <h1 class="text-sm font-headline font-bold tracking-tight truncate m-0"
                  [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                {{ activeTab === 'profile' ? 'Mi Perfil' : 'Seguridad' }}
              </h1>
            </div>

            <!-- Desktop Breadcrumb -->
            <div class="hidden md:flex items-center gap-2 text-xs sm:text-sm font-headline font-bold uppercase tracking-wider truncate">
              <span [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Ajustes</span>
              <span class="opacity-40">/</span>
              <span class="font-extrabold truncate tracking-widest"
                    [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ activeTab === 'profile' ? 'Mi Perfil' : 'Seguridad' }}</span>
            </div>
          </div>

          <!-- Quick Navigation Buttons -->
          <div class="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            <!-- Dashboard Button -->
            <a *ngIf="authService.currentUser()?.rol?.toLowerCase() === 'admin'"
               [routerLink]="['/admin']"
               class="px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-headline font-semibold uppercase tracking-wider border transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-2xs no-underline active:scale-95"
               [ngClass]="isDark 
                 ? 'border-neutral-800 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200' 
                 : 'border-neutral-200/90 bg-neutral-100 hover:bg-neutral-200 text-neutral-800'">
              <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25-2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              <span class="hidden sm:inline">Dashboard</span>
              <span class="sm:hidden">Panel</span>
            </a>

            <!-- Back to live website home (Obsidian Button) -->
            <a [routerLink]="['/']"
               class="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-headline font-semibold uppercase tracking-wider transition-all duration-200 border-none cursor-pointer shadow-sm no-underline active:scale-95 shrink-0"
               style="background-color: #09090b !important; color: #ffffff !important;">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span class="hidden sm:inline" style="color: #ffffff !important;">Ver sitio</span>
              <span class="sm:hidden" style="color: #ffffff !important;">Sitio</span>
              <svg class="w-3 h-3 opacity-80 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="color: #ffffff !important;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H18m0 0v4.5M18 6l-7.5 7.5M6 18h12"/>
              </svg>
            </a>
          </div>
        </header>

        <!-- Scrollable content area with ample bottom clearance on mobile -->
        <main class="flex-grow overflow-y-auto overflow-x-hidden p-3.5 sm:p-6 md:p-8 pb-36 sm:pb-32 md:pb-8 no-scrollbar"
              [ngClass]="isDark ? 'bg-[#030305]' : 'bg-[#fbfbfd]'">
          <div class="max-w-3xl mx-auto w-full">

            <!-- ══════════════ TAB CONTENT: PROFILE ══════════════ -->
            <div *ngIf="activeTab === 'profile'" class="tab-enter space-y-4 sm:space-y-6 relative z-10">
              
              <!-- Section Header -->
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-[10px] sm:text-xs font-headline font-bold uppercase tracking-[0.2em]"
                     [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Resumen de Cuenta</p>
                  <h2 class="text-xl sm:text-3xl font-headline font-bold tracking-tight mt-0.5"
                      [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Información Personal</h2>
                </div>
                <span class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                      [ngClass]="isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Sesión Activa
                </span>
              </div>

              <!-- 1. Executive Profile Identity Hero Card -->
              <div class="rounded-3xl border p-4 sm:p-6 transition-all duration-300 relative overflow-hidden shadow-xs"
                   [ngClass]="isDark ? 'bg-[#0d0d12] border-neutral-800/80 text-white' : 'bg-white border-neutral-200/90 text-neutral-900'">
                
                <!-- Ambient background glow -->
                <div class="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20"
                     [ngClass]="isDark ? 'bg-indigo-500' : 'bg-blue-400'"></div>

                <div class="flex items-center gap-3.5 sm:gap-5 relative z-10">
                  <!-- Avatar with gradient ring -->
                  <div class="relative shrink-0">
                    <div class="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center text-lg sm:text-2xl font-headline font-extrabold shadow-md border-2"
                         [ngClass]="isDark ? 'border-neutral-800' : 'border-white'">
                      {{ getUserInitials() }}
                    </div>
                    <!-- Verified badge indicator -->
                    <div class="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 border-2 text-white flex items-center justify-center shadow-xs"
                         [ngClass]="isDark ? 'border-[#0d0d12]' : 'border-white'"
                         title="Cuenta Verificada">
                      <svg class="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                  </div>

                  <!-- Identity Details -->
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 flex-wrap mb-0.5">
                      <h3 class="text-base sm:text-xl font-headline font-bold tracking-tight truncate m-0"
                          [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                        {{ authService.currentUser()?.nombre || 'Usuario PortaLink' }}
                      </h3>
                    </div>
                    <p class="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 truncate m-0 mb-2 font-medium">
                      {{ authService.currentUser()?.email || 'Sin correo asociado' }}
                    </p>

                    <!-- Chips row -->
                    <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-headline font-bold uppercase tracking-wider border"
                            [ngClass]="isDark ? 'bg-white/5 border-white/10 text-neutral-300' : 'bg-neutral-100 border-neutral-200 text-neutral-700'">
                        <svg class="w-3 h-3 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                        {{ authService.currentUser()?.rol?.toLowerCase() === 'admin' ? 'Administrador' : 'Usuario' }}
                      </span>

                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Verificado
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 2. Compact & Sleek Certificaciones Banner -->
              <div class="rounded-2xl sm:rounded-3xl border p-3.5 sm:p-5 transition-all duration-300 relative overflow-hidden group shadow-xs"
                   [ngClass]="isDark ? 'bg-[#0d0d12] border-neutral-800/80' : 'bg-white border-neutral-200/90'">
                
                <div class="flex items-center justify-between gap-3 relative z-10">
                  <div class="flex items-center gap-3 sm:gap-4 min-w-0">
                    <!-- Icon badge -->
                    <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                         [ngClass]="isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border border-emerald-200/80'">
                      <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path d="M12 15l-2 5l-3 -2l-3 2l2 -5"></path>
                        <circle cx="12" cy="9" r="6"></circle>
                      </svg>
                    </div>

                    <!-- Texts -->
                    <div class="min-w-0">
                      <div class="flex items-center gap-1.5">
                        <span class="text-[9px] sm:text-[10px] font-headline font-bold uppercase tracking-wider px-2 py-0.5 rounded-md inline-block"
                              [ngClass]="isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100/70 text-emerald-800'">
                          freeCodeCamp Oficial
                        </span>
                      </div>
                      <h4 class="text-xs sm:text-base font-headline font-bold tracking-tight m-0 mt-0.5 truncate"
                          [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                        Certificaciones de Desarrollo
                      </h4>
                      <p class="text-[11px] sm:text-xs m-0 truncate hidden sm:block"
                         [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                        Credenciales técnicas oficiales verificables.
                      </p>
                    </div>
                  </div>

                  <!-- CTA button -->
                  <a [routerLink]="['/certificados']"
                     (click)="goToCertificados($event)"
                     class="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-full font-headline font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all shadow-xs flex items-center gap-1.5 no-underline cursor-pointer shrink-0 active:scale-95"
                     [ngClass]="isDark ? 'btn-contrast-action-dark' : 'btn-contrast-action'"
                     [style.background-color]="isDark ? '#ffffff !important' : '#09090b !important'"
                     [style.color]="isDark ? '#09090b !important' : '#ffffff !important'">
                    <span [style.color]="isDark ? '#09090b !important' : '#ffffff !important'">Ver</span>
                    <span class="hidden sm:inline" [style.color]="isDark ? '#09090b !important' : '#ffffff !important'">Certificados</span>
                    <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"
                         [style.color]="isDark ? '#09090b !important' : '#ffffff !important'"
                         [style.stroke]="isDark ? '#09090b !important' : '#ffffff !important'">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                    </svg>
                  </a>
                </div>
              </div>

              <!-- 3. Personal Information Form Card (Ultra-Clean Modern Style) -->
              <div class="rounded-3xl border p-4 sm:p-7 transition-all duration-300 shadow-xs"
                   [ngClass]="isDark ? 'bg-[#0d0d12] border-neutral-800/80 text-white' : 'bg-white border-neutral-200/90 text-neutral-900'">
                
                <div class="flex items-center justify-between pb-3.5 mb-4 sm:mb-6 border-b"
                     [ngClass]="isDark ? 'border-neutral-800/80' : 'border-neutral-100'">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    <h3 class="text-sm sm:text-base font-headline font-bold tracking-tight m-0"
                        [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                      Datos de Contacto
                    </h3>
                  </div>
                  <span class="text-[11px] font-medium" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Editable</span>
                </div>

                <!-- Alert Messages -->
                <div *ngIf="profileSuccess" 
                     class="mb-4 sm:mb-6 p-3.5 sm:p-4 rounded-2xl border text-xs font-semibold bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <svg class="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>{{ profileSuccess }}</span>
                </div>
                <div *ngIf="profileError" 
                     class="mb-4 sm:mb-6 p-3.5 sm:p-4 rounded-2xl border text-xs font-semibold bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400 flex items-center gap-2">
                  <svg class="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <span>{{ profileError }}</span>
                </div>

                <form (submit)="onProfileSubmit($event)" class="space-y-4 sm:space-y-5">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    
                    <!-- Nombre Completo -->
                    <div>
                      <label class="block text-[11px] font-headline font-bold uppercase tracking-wider mb-1.5"
                             [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">
                        Nombre Completo
                      </label>
                      <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <svg class="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                        </div>
                        <input type="text" [(ngModel)]="nombre" name="nombre" required
                               class="w-full text-xs sm:text-sm font-semibold pl-10 pr-4 py-3 sm:py-3.5 rounded-xl border transition-all shadow-2xs focus:outline-none"
                               [ngClass]="isDark
                                 ? 'bg-neutral-900/80 border-neutral-800 text-white focus:border-white focus:bg-neutral-900'
                                 : 'bg-neutral-50/90 border-neutral-200/90 text-neutral-900 focus:border-neutral-900 focus:bg-white'">
                      </div>
                    </div>

                    <!-- Correo Electrónico -->
                    <div>
                      <label class="block text-[11px] font-headline font-bold uppercase tracking-wider mb-1.5"
                             [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">
                        Correo Electrónico
                      </label>
                      <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <svg class="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                          </svg>
                        </div>
                        <input type="email" [(ngModel)]="email" name="email" required
                               class="w-full text-xs sm:text-sm font-semibold pl-10 pr-4 py-3 sm:py-3.5 rounded-xl border transition-all shadow-2xs focus:outline-none"
                               [ngClass]="isDark
                                 ? 'bg-neutral-900/80 border-neutral-800 text-white focus:border-white focus:bg-neutral-900'
                                 : 'bg-neutral-50/90 border-neutral-200/90 text-neutral-900 focus:border-neutral-900 focus:bg-white'">
                      </div>
                    </div>

                    <!-- Teléfono -->
                    <div>
                      <label class="block text-[11px] font-headline font-bold uppercase tracking-wider mb-1.5"
                             [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">
                        Número de Teléfono
                      </label>
                      <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <svg class="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                          </svg>
                        </div>
                        <input type="text" [(ngModel)]="telefono" name="telefono" required
                               class="w-full text-xs sm:text-sm font-semibold pl-10 pr-4 py-3 sm:py-3.5 rounded-xl border transition-all shadow-2xs focus:outline-none"
                               [ngClass]="isDark
                                 ? 'bg-neutral-900/80 border-neutral-800 text-white focus:border-white focus:bg-neutral-900'
                                 : 'bg-neutral-50/90 border-neutral-200/90 text-neutral-900 focus:border-neutral-900 focus:bg-white'">
                      </div>
                    </div>

                    <!-- Rol de Cuenta (Read-only status card) -->
                    <div>
                      <label class="block text-[11px] font-headline font-bold uppercase tracking-wider mb-1.5"
                             [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">
                        Nivel de Acceso
                      </label>
                      <div class="w-full text-xs sm:text-sm font-semibold px-4 py-3 sm:py-3.5 rounded-xl border flex items-center justify-between select-none"
                           [ngClass]="isDark ? 'bg-neutral-900/50 border-neutral-800 text-neutral-300' : 'bg-neutral-100/80 border-neutral-200/80 text-neutral-700'">
                        <div class="flex items-center gap-2">
                          <svg class="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                          </svg>
                          <span>{{ authService.currentUser()?.rol?.toLowerCase() === 'admin' ? 'Administrador del Sistema' : 'Usuario General' }}</span>
                        </div>
                        <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          Activo
                        </span>
                      </div>
                    </div>

                  </div>

                  <!-- Submit Button -->
                  <div class="pt-3 flex justify-end">
                    <button type="submit" [disabled]="submittingProfile"
                            class="w-full sm:w-auto px-8 py-3.5 rounded-2xl sm:rounded-full text-xs font-headline font-bold uppercase tracking-wider shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all border-none cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                            [ngClass]="isDark ? 'btn-contrast-action-dark' : 'btn-contrast-action'"
                            [style.background-color]="isDark ? '#ffffff !important' : '#09090b !important'"
                            [style.color]="isDark ? '#09090b !important' : '#ffffff !important'">
                      <svg *ngIf="!submittingProfile" class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"
                           [style.color]="isDark ? '#09090b !important' : '#ffffff !important'"
                           [style.stroke]="isDark ? '#09090b !important' : '#ffffff !important'">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <svg *ngIf="submittingProfile" class="animate-spin w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24"
                           [style.color]="isDark ? '#09090b !important' : '#ffffff !important'">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      <span [style.color]="isDark ? '#09090b !important' : '#ffffff !important'">{{ submittingProfile ? 'Guardando Cambios...' : 'Guardar Cambios' }}</span>
                    </button>
                  </div>

                </form>
              </div>
            </div>

            <!-- ══════════════ TAB CONTENT: PASSWORD ══════════════ -->
            <div *ngIf="activeTab === 'password'" class="tab-enter space-y-4 sm:space-y-6 relative z-10">
              
              <!-- Section Header -->
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-[10px] sm:text-xs font-headline font-bold uppercase tracking-[0.2em]"
                     [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Seguridad de la Cuenta</p>
                  <h2 class="text-xl sm:text-3xl font-headline font-bold tracking-tight mt-0.5"
                      [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Cambiar Contraseña</h2>
                </div>
              </div>

              <!-- Security Tips Banner -->
              <div class="rounded-2xl border p-4 transition-all duration-300 flex items-center gap-3.5 shadow-xs"
                   [ngClass]="isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-amber-50/80 border-amber-200/70 text-amber-900'">
                <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-amber-500/15 border border-amber-500/30 text-amber-500">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <p class="text-xs m-0 leading-relaxed font-medium">
                  Usa una contraseña segura de al menos 6 caracteres para proteger tu cuenta y tus proyectos.
                </p>
              </div>

              <!-- Password Form Card -->
              <div class="rounded-3xl border p-4 sm:p-7 max-w-xl shadow-xs transition-all duration-300"
                   [ngClass]="isDark ? 'bg-[#0d0d12] border-neutral-800/80 text-white' : 'bg-white border-neutral-200/90 text-neutral-900'">

                <!-- Alert Messages -->
                <div *ngIf="successMessage" 
                     class="mb-4 sm:mb-6 p-3.5 sm:p-4 rounded-2xl border text-xs font-semibold bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <svg class="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>{{ successMessage }}</span>
                </div>
                <div *ngIf="errorMessage" 
                     class="mb-4 sm:mb-6 p-3.5 sm:p-4 rounded-2xl border text-xs font-semibold bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400 flex items-center gap-2">
                  <svg class="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <span>{{ errorMessage }}</span>
                </div>

                <form (submit)="onPasswordSubmit()" class="space-y-4 sm:space-y-5">
                  <div>
                    <label class="block text-[11px] font-headline font-bold uppercase tracking-wider mb-1.5"
                           [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">
                      Contraseña Actual
                    </label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <svg class="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                        </svg>
                      </div>
                      <input type="password" name="currentPassword" [(ngModel)]="currentPassword" required placeholder="••••••••"
                             class="w-full text-xs sm:text-sm font-semibold pl-10 pr-4 py-3 sm:py-3.5 rounded-xl border transition-all shadow-2xs focus:outline-none"
                             [ngClass]="isDark
                               ? 'bg-neutral-900/80 border-neutral-800 text-white focus:border-white focus:bg-neutral-900'
                               : 'bg-neutral-50/90 border-neutral-200/90 text-neutral-900 focus:border-neutral-900 focus:bg-white'">
                    </div>
                  </div>

                  <div>
                    <label class="block text-[11px] font-headline font-bold uppercase tracking-wider mb-1.5"
                           [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">
                      Nueva Contraseña
                    </label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <svg class="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                      </div>
                      <input type="password" name="newPassword" [(ngModel)]="newPassword" required placeholder="Mínimo 6 caracteres"
                             class="w-full text-xs sm:text-sm font-semibold pl-10 pr-4 py-3 sm:py-3.5 rounded-xl border transition-all shadow-2xs focus:outline-none"
                             [ngClass]="isDark
                               ? 'bg-neutral-900/80 border-neutral-800 text-white focus:border-white focus:bg-neutral-900'
                               : 'bg-neutral-50/90 border-neutral-200/90 text-neutral-900 focus:border-neutral-900 focus:bg-white'">
                    </div>
                  </div>

                  <div>
                    <label class="block text-[11px] font-headline font-bold uppercase tracking-wider mb-1.5"
                           [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">
                      Confirmar Nueva Contraseña
                    </label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <svg class="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                      </div>
                      <input type="password" name="confirmPassword" [(ngModel)]="confirmPassword" required placeholder="Repetir contraseña"
                             class="w-full text-xs sm:text-sm font-semibold pl-10 pr-4 py-3 sm:py-3.5 rounded-xl border transition-all shadow-2xs focus:outline-none"
                             [ngClass]="isDark
                               ? 'bg-neutral-900/80 border-neutral-800 text-white focus:border-white focus:bg-neutral-900'
                               : 'bg-neutral-50/90 border-neutral-200/90 text-neutral-900 focus:border-neutral-900 focus:bg-white'">
                    </div>
                  </div>

                  <div class="pt-2">
                    <button type="submit" [disabled]="submittingPassword"
                            class="w-full py-3.5 rounded-2xl sm:rounded-full text-xs font-headline font-bold uppercase tracking-wider shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all border-none cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                            [ngClass]="isDark ? 'btn-contrast-action-dark' : 'btn-contrast-action'"
                            [style.background-color]="isDark ? '#ffffff !important' : '#09090b !important'"
                            [style.color]="isDark ? '#09090b !important' : '#ffffff !important'">
                      <svg *ngIf="!submittingPassword" class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"
                           [style.color]="isDark ? '#09090b !important' : '#ffffff !important'"
                           [style.stroke]="isDark ? '#09090b !important' : '#ffffff !important'">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                      <svg *ngIf="submittingPassword" class="animate-spin w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24"
                           [style.color]="isDark ? '#09090b !important' : '#ffffff !important'">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      <span [style.color]="isDark ? '#09090b !important' : '#ffffff !important'">{{ submittingPassword ? 'Actualizando...' : 'Actualizar Contraseña' }}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </main>
      </div>

      <!-- ══════════════════════════════════════
           MODERN MOBILE DOCKED BOTTOM NAV BAR
      ══════════════════════════════════════ -->
      <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-2xl select-none px-4 pt-2 transition-all duration-300 shadow-[0_-8px_30px_rgba(0,0,0,0.06)]"
           [ngClass]="isDark ? 'bg-[#0a0a0f]/95 border-neutral-800/80 text-neutral-400' : 'bg-white/95 border-neutral-200/90 text-neutral-600'"
           style="padding-bottom: calc(0.8rem + env(safe-area-inset-bottom, 0px));">
        <div class="flex items-center justify-around max-w-sm mx-auto">
          
          <!-- Mi Perfil -->
          <button (click)="setTab('profile')"
                  class="flex flex-col items-center justify-center py-1 px-3 transition-all duration-200 active:scale-90 cursor-pointer border-none bg-transparent">
            <div class="w-12 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                 [ngClass]="activeTab === 'profile'
                   ? (isDark ? 'bg-emerald-500/20 text-emerald-400 font-bold scale-105' : 'bg-emerald-500/15 text-emerald-600 font-bold scale-105')
                   : (isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900')">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.25">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <span class="text-[10.5px] font-headline font-semibold transition-colors mt-1"
                  [ngClass]="activeTab === 'profile'
                    ? (isDark ? 'text-emerald-400 font-bold' : 'text-emerald-600 font-bold')
                    : (isDark ? 'text-neutral-500' : 'text-neutral-500')">Perfil</span>
          </button>

          <!-- Seguridad / Contraseña -->
          <button (click)="setTab('password')"
                  class="flex flex-col items-center justify-center py-1 px-3 transition-all duration-200 active:scale-90 cursor-pointer border-none bg-transparent">
            <div class="w-12 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                 [ngClass]="activeTab === 'password'
                   ? (isDark ? 'bg-emerald-500/20 text-emerald-400 font-bold scale-105' : 'bg-emerald-500/15 text-emerald-600 font-bold scale-105')
                   : (isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900')">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.25">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <span class="text-[10.5px] font-headline font-semibold transition-colors mt-1"
                  [ngClass]="activeTab === 'password'
                    ? (isDark ? 'text-emerald-400 font-bold' : 'text-emerald-600 font-bold')
                    : (isDark ? 'text-neutral-500' : 'text-neutral-500')">Seguridad</span>
          </button>

          <!-- Certificados / Diplomas -->
          <a [routerLink]="['/certificados']"
             (click)="goToCertificados($event)"
             class="flex flex-col items-center justify-center py-1 px-3 transition-all duration-200 active:scale-90 cursor-pointer border-none bg-transparent no-underline">
            <div class="w-12 h-8 rounded-full flex items-center justify-center transition-all duration-200 text-emerald-600 dark:text-emerald-400">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.25">
                <path d="M12 15l-2 5l-3 -2l-3 2l2 -5"></path>
                <circle cx="12" cy="9" r="6"></circle>
              </svg>
            </div>
            <span class="text-[10.5px] font-headline font-semibold text-neutral-500 dark:text-neutral-400 mt-1">Diplomas</span>
          </a>

          <!-- Dashboard (Admin) -->
          <a *ngIf="authService.currentUser()?.rol?.toLowerCase() === 'admin'"
             [routerLink]="['/admin']"
             class="flex flex-col items-center justify-center py-1 px-3 transition-all duration-200 active:scale-90 cursor-pointer border-none bg-transparent no-underline">
            <div class="w-12 h-8 rounded-full flex items-center justify-center transition-all duration-200 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.25">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25-2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </div>
            <span class="text-[10.5px] font-headline font-semibold text-neutral-500 dark:text-neutral-400 mt-1">Admin</span>
          </a>

        </div>
      </nav>

    </div>
  `,
  styles: [`
    .tab-enter { animation: tabEnter 0.2s ease-out forwards; }
    @keyframes tabEnter {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .btn-contrast-action {
      background-color: #09090b !important;
      color: #ffffff !important;
    }
    .btn-contrast-action * {
      color: #ffffff !important;
      stroke: #ffffff !important;
    }
    .btn-contrast-action:hover {
      background-color: #18181b !important;
    }
    .btn-contrast-action-dark {
      background-color: #ffffff !important;
      color: #09090b !important;
    }
    .btn-contrast-action-dark * {
      color: #09090b !important;
      stroke: #09090b !important;
    }
    .btn-contrast-action-dark:hover {
      background-color: #f4f4f5 !important;
    }
  `]
})
export class PerfilComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private querySub!: Subscription;

  activeTab: 'profile' | 'password' = 'profile';
  isMobileDrawerOpen = false;

  // Form Fields (Password)
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  // Form Fields (Profile)
  nombre = '';
  email = '';
  telefono = '';

  // Password submission UI state
  submittingPassword = false;
  successMessage = '';
  errorMessage = '';

  // Profile submission UI state
  submittingProfile = false;
  profileSuccess = '';
  profileError = '';

  get isDark(): boolean {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('portfolio-theme') === 'dark';
    }
    return false;
  }

  ngOnInit() {
    this.querySub = this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'password') {
        this.activeTab = 'password';
      } else {
        this.activeTab = 'profile';
      }
    });

    // Initialize profile fields
    const user = this.authService.currentUser();
    if (user) {
      this.nombre = user.nombre || '';
      this.email = user.email || '';
      this.telefono = user.telefono || '';
    }
  }

  goToCertificados(event?: Event) {
    console.log('🟢 goToCertificados CALLED');
    console.log('🟢 Current URL:', this.router.url);
    console.log('🟢 Has token:', this.authService.hasToken());
    console.log('🟢 Is authenticated:', this.authService.isAuthenticated());
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      console.log('🟢 Event prevented + stopped');
    }
    this.isMobileDrawerOpen = false;
    console.log('🟢 About to navigateByUrl /certificados');
    this.router.navigateByUrl('/certificados').then(
      (success) => console.log('🟢 Navigation result:', success),
      (err) => console.error('🔴 Navigation error:', err)
    );
    console.log('🟢 navigateByUrl called');
  }

  ngOnDestroy() {
    if (this.querySub) {
      this.querySub.unsubscribe();
    }
  }

  setTab(tab: 'profile' | 'password') {
    this.activeTab = tab;
    this.isMobileDrawerOpen = false;
    // Clear query params silently so activeTab takes local control
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab === 'password' ? 'password' : null },
      queryParamsHandling: 'merge'
    });
  }

  getTabClass(tabId: 'profile' | 'password'): string {
    const isActive = this.activeTab === tabId;
    if (this.isDark) {
      return isActive
        ? 'bg-white text-black font-bold shadow-sm'
        : 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/60 font-semibold';
    } else {
      return isActive
        ? 'bg-neutral-900 text-white font-bold shadow-sm'
        : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 font-semibold';
    }
  }

  getUserInitials(): string {
    const user = this.authService.currentUser();
    if (!user || !user.nombre) return 'U';
    const parts = user.nombre.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return user.nombre[0].toUpperCase();
  }

  onPasswordSubmit() {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Por favor completa todos los campos.';
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage = 'La nueva contraseña debe tener al menos 6 caracteres.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas nuevas no coinciden.';
      return;
    }

    this.submittingPassword = true;
    this.authService.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: (res) => {
        this.submittingPassword = false;
        this.successMessage = 'Contraseña actualizada exitosamente.';
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        
        setTimeout(() => {
          this.successMessage = '';
          this.setTab('profile');
        }, 2000);
      },
      error: (err) => {
        this.submittingPassword = false;
        this.errorMessage = err.error?.message || 'Error al intentar actualizar la contraseña.';
      }
    });
  }

  onProfileSubmit(event: Event) {
    event.preventDefault();
    this.profileSuccess = '';
    this.profileError = '';

    if (!this.nombre.trim() || !this.email.trim() || !this.telefono.trim()) {
      this.profileError = 'Por favor completa todos los campos.';
      return;
    }

    // 1. Validar Correo
    const emailVal = this.email.trim().toLowerCase();
    if (!emailVal.includes('@')) {
      this.profileError = 'El correo electrónico debe contener un "@".';
      return;
    }
    const allowedDomains = /@(gmail|hotmail|outlook|live|msn|yahoo|icloud|protonmail|proton|aol|zoho|gmx|yandex)\.[a-zA-Z]{2,}/;
    if (!allowedDomains.test(emailVal)) {
      this.profileError = 'Proveedor de correo inválido o no soportado (ej: gmail, hotmail, yahoo).';
      return;
    }

    // 2. Validar Teléfono
    const phoneVal = this.telefono.trim();
    const phoneRegex = /^[0-9+() -]{7,15}$/;
    if (!phoneRegex.test(phoneVal)) {
      this.profileError = 'Número de teléfono inválido (debe tener entre 7 y 15 dígitos numéricos).';
      return;
    }

    this.submittingProfile = true;
    this.authService.updateProfile(this.nombre, this.email, this.telefono).subscribe({
      next: (res) => {
        this.submittingProfile = false;
        this.profileSuccess = 'Perfil actualizado correctamente.';
        // Update local bound states
        if (res.usuario) {
          this.nombre = res.usuario.nombre || '';
          this.email = res.usuario.email || '';
          this.telefono = res.usuario.telefono || '';
        }
        setTimeout(() => (this.profileSuccess = ''), 3000);
      },
      error: (err) => {
        this.submittingProfile = false;
        this.profileError = err.error?.message || 'Error al intentar actualizar el perfil.';
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
