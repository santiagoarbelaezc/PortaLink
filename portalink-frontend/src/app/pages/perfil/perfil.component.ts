import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SiteService, UserSite } from '../../services/site.service';
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
             [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
          <div class="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xl font-extrabold text-white shadow-md mb-3">
            {{ getUserInitials() }}
          </div>
          <h2 class="text-sm font-bold truncate w-full">{{ authService.currentUser()?.nombre }}</h2>
          <span class="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border mt-1.5"
                [ngClass]="isDark ? 'border-neutral-800 bg-neutral-950/60 text-neutral-500' : 'border-neutral-200 bg-neutral-100 text-neutral-600'">
            {{ authService.currentUser()?.rol }}
          </span>
        </div>

        <!-- Navigation Tabs -->
        <nav class="flex-grow p-3 space-y-1 overflow-y-auto sidebar-nav overflow-x-hidden">
          <!-- Mi Perfil tab -->
          <button (click)="setTab('profile')"
                  class="flex items-center rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer w-full px-3 py-2.5 gap-3"
                  [ngClass]="getTabClass('profile')">
            <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span class="text-left text-[13px]">Mi Perfil</span>
          </button>

          <!-- Cambiar contraseña tab -->
          <button (click)="setTab('password')"
                  class="flex items-center rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer w-full px-3 py-2.5 gap-3"
                  [ngClass]="getTabClass('password')">
            <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span class="text-left text-[13px]">Cambiar Contraseña</span>
          </button>

          <!-- Personalizar mi sitio link -->
          <button (click)="goToPersonalizar()"
                  class="flex items-center rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer w-full px-3 py-2.5 gap-3"
                  [ngClass]="isDark ? 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/60' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'">
            <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <span class="text-left text-[13px]">Personalizar mi sitio</span>
          </button>
        </nav>

        <!-- Bottom: Logout -->
        <div class="p-3 border-t shrink-0 mb-14 md:mb-0" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
          <button (click)="logout()"
                  class="flex items-center rounded-xl text-[13px] font-semibold transition-all duration-200 cursor-pointer w-full px-3 py-2.5 gap-3"
                  [ngClass]="isDark ? 'text-neutral-600 hover:text-red-400 hover:bg-red-500/5' : 'text-neutral-400 hover:text-red-500 hover:bg-red-50'">
            <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            <span>Salir</span>
          </button>
        </div>
      </aside>

      <!-- ══════════════════════════════════════
           MAIN CONTENT AREA
      ══════════════════════════════════════ -->
      <div class="flex-grow flex flex-col h-full overflow-hidden w-full">
        
        <!-- Top Bar (Title & Back Options) -->
        <header class="h-16 sm:h-20 shrink-0 border-b flex items-center justify-between px-4 sm:px-6 md:px-8 z-20 transition-all duration-300"
                [ngClass]="isDark ? 'bg-[#07070a] border-neutral-800' : 'bg-white border-neutral-200'">
          
          <div class="flex items-center gap-3 sm:gap-4 min-w-0">
            <!-- Mobile Menu Toggle -->
            <button (click)="isMobileDrawerOpen = !isMobileDrawerOpen"
                    class="md:hidden p-2.5 -ml-2 rounded-xl transition-colors cursor-pointer"
                    [ngClass]="isDark ? 'hover:bg-white/10 text-neutral-300 hover:text-white' : 'hover:bg-black/5 text-neutral-600 hover:text-black'">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>



            <!-- Breadcrumb (hidden on mobile for clean header spacing) -->
            <div class="hidden sm:flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider truncate">
              <span [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Ajustes</span>
              <span class="opacity-40">/</span>
              <span class="text-blue-500 font-extrabold truncate tracking-widest">{{ activeTab === 'profile' ? 'Mi Perfil' : 'Seguridad' }}</span>
            </div>
          </div>

          <!-- Quick Navigation Buttons -->
          <div class="flex items-center gap-2 sm:gap-4 shrink-0">
            
            <!-- Dashboard Button -->
            <a *ngIf="authService.currentUser()?.rol?.toLowerCase() === 'admin'"
               [routerLink]="['/admin']"
               class="px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider border transition-all duration-200 flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
               [ngClass]="isDark ? 'bg-blue-600/10 border-blue-500/30 text-blue-400 hover:bg-blue-600/20 hover:border-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'">
              <svg class="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              <span class="hidden sm:inline">Volver al Dashboard</span>
              <span class="sm:hidden">Dashboard</span>
            </a>

            <!-- Back to live website home -->
            <a [routerLink]="['/']"
               class="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 border cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-sm"
               [ngClass]="isDark
                 ? 'bg-white/10 hover:bg-white text-white hover:text-black border-white/20 hover:border-white'
                 : 'bg-black/5 hover:bg-black text-neutral-800 hover:text-white border-black/15 hover:border-black'">
              <span class="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-emerald-500"></span>
              </span>
              <span class="hidden sm:inline">Ver sitio en vivo</span>
              <span class="sm:hidden">Sitio</span>
              <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H18m0 0v4.5M18 6l-7.5 7.5M6 18h12"/>
              </svg>
            </a>
          </div>
        </header>

        <!-- Scrollable content area -->
        <main class="flex-grow overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8 pb-20 md:pb-8"
              [ngClass]="isDark ? 'bg-[#020204]' : 'bg-white'">
          <div class="max-w-screen-2xl mx-auto w-full">

            <!-- Decorative lights in main section -->
            <div class="absolute inset-0 pointer-events-none overflow-hidden z-0">
              <div class="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]"></div>
            </div>

            <!-- Tab Content: Profile -->
            <div *ngIf="activeTab === 'profile'" class="tab-enter space-y-5 sm:space-y-6 relative z-10">
              <!-- Header -->
              <div>
                <p class="text-xs font-bold uppercase tracking-[0.3em]"
                   [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Resumen</p>
                <h2 class="text-2xl sm:text-3xl font-bold uppercase tracking-tight mt-0.5">Información Personal</h2>
              </div>

              <!-- Landing Page Status Card -->
              <div class="rounded-2xl border p-4 sm:p-6 md:p-8 shadow-sm transition-all duration-300 relative overflow-hidden"
                   [ngClass]="isDark ? 'bg-gradient-to-r from-neutral-900/80 to-cyan-950/20 border-cyan-500/30' : 'bg-gradient-to-r from-white to-cyan-50 border-cyan-200'">
                <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <span class="text-[10px] font-bold uppercase tracking-widest text-cyan-400">RotBot IA Landing Page</span>
                    <h3 class="text-lg sm:text-xl font-bold mt-1">Tu Página Web Personal</h3>
                    <p *ngIf="mySite" class="text-xs opacity-75 mt-1">
                      Tu sitio está publicado y disponible en tu dirección personalizada: <span class="font-mono text-cyan-400">/site/{{ mySite.slug }}</span>
                    </p>
                    <p *ngIf="!mySite" class="text-xs opacity-75 mt-1">
                      Crea tu landing page en segundos hablando con RotBot, el asistente de inteligencia artificial.
                    </p>
                  </div>

                  <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto">
                    <a *ngIf="mySite" [routerLink]="['/site', mySite.slug]" target="_blank"
                       class="px-5 py-2.5 rounded-xl bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider hover:bg-cyan-300 transition-all shadow-md flex items-center justify-center gap-2">
                      <span>Ver página pública</span>
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                    </a>

                    <a routerLink="/rotbot"
                       class="px-5 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                       [ngClass]="isDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-neutral-300 hover:bg-neutral-100 text-neutral-900'">
                      <span>{{ mySite ? 'Modificar con RotBot' : 'Crear Landing con RotBot' }}</span>
                      <span>🤖</span>
                    </a>
                  </div>
                </div>
              </div>

              <!-- Content Card -->
              <div class="rounded-2xl border p-6 md:p-8 shadow-sm transition-all duration-300"
                   [ngClass]="isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-white border-neutral-200'">
                
                <!-- Profile Alert Messages -->
                <div *ngIf="profileSuccess" 
                     class="mb-6 p-4 rounded-xl border text-xs font-semibold bg-green-500/10 border-green-500/20 text-green-400 flex items-center gap-2">
                  <span>✅</span> {{ profileSuccess }}
                </div>
                <div *ngIf="profileError" 
                     class="mb-6 p-4 rounded-xl border text-xs font-semibold bg-red-500/10 border-red-500/20 text-red-400 flex items-center gap-2">
                  <span>⚠️</span> {{ profileError }}
                </div>

                <form (submit)="onProfileSubmit($event)">
                  <div class="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <!-- Gigantic Avatar with dynamic initials -->
                    <div class="shrink-0 relative group">
                      <div class="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600 via-purple-600 to-indigo-600 blur-[6px] opacity-60"></div>
                      <div class="relative w-28 h-28 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-4xl font-extrabold text-white shadow-lg">
                        {{ getUserInitials() }}
                      </div>
                    </div>

                    <!-- Details Grid -->
                    <div class="flex-grow space-y-5 w-full">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label class="block text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1.5">Nombre Completo</label>
                          <input type="text" [(ngModel)]="nombre" name="nombre"
                                 class="w-full text-sm font-semibold p-3.5 rounded-xl border focus:outline-none transition-all duration-300"
                                 [ngClass]="isDark ? 'bg-neutral-950/40 border-neutral-800/80 text-white focus:border-blue-500/50' : 'bg-neutral-50 border-neutral-100 text-neutral-900 focus:border-blue-500'">
                        </div>

                        <div>
                          <label class="block text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1.5">Correo Electrónico</label>
                          <input type="email" [(ngModel)]="email" name="email"
                                 class="w-full text-sm font-semibold p-3.5 rounded-xl border focus:outline-none transition-all duration-300"
                                 [ngClass]="isDark ? 'bg-neutral-950/40 border-neutral-800/80 text-white focus:border-blue-500/50' : 'bg-neutral-50 border-neutral-100 text-neutral-900 focus:border-blue-500'">
                        </div>
                      </div>

                      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label class="block text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1.5">Número de Teléfono</label>
                          <input type="text" [(ngModel)]="telefono" name="telefono"
                                 class="w-full text-sm font-semibold p-3.5 rounded-xl border focus:outline-none transition-all duration-300"
                                 [ngClass]="isDark ? 'bg-neutral-950/40 border-neutral-800/80 text-white focus:border-blue-500/50' : 'bg-neutral-50 border-neutral-100 text-neutral-900 focus:border-blue-500'">
                        </div>

                        <div>
                          <label class="block text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1.5">Rol de Cuenta</label>
                          <p class="text-sm font-semibold p-3.5 rounded-xl border capitalize opacity-70 cursor-not-allowed select-none"
                             [ngClass]="isDark ? 'bg-neutral-950/40 border-neutral-800/80' : 'bg-neutral-50 border-neutral-100'">
                            {{ authService.currentUser()?.rol?.toLowerCase() === 'admin' ? 'Administrador' : 'Usuario General' }}
                          </p>
                        </div>
                      </div>

                      <!-- Save Profile Button -->
                      <div class="pt-4 flex justify-end">
                        <button type="submit" [disabled]="submittingProfile"
                                class="px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-500 transition-colors duration-200 cursor-pointer shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2">
                          {{ submittingProfile ? 'Guardando...' : 'Guardar Cambios' }}
                        </button>
                      </div>

                    </div>
                  </div>
                </form>
              </div>
            </div>

            <!-- Tab Content: Password -->
            <div *ngIf="activeTab === 'password'" class="tab-enter space-y-6 relative z-10">
              <!-- Header -->
              <div>
                <p class="text-xs font-bold uppercase tracking-[0.3em]"
                   [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Seguridad</p>
                <h2 class="text-3xl font-bold uppercase tracking-tight mt-0.5">Cambiar Contraseña</h2>
              </div>

              <!-- Form Card -->
              <div class="rounded-2xl border p-6 md:p-8 max-w-xl shadow-sm transition-all duration-300"
                   [ngClass]="isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-white border-neutral-200'">

                <!-- Alert Messages -->
                <div *ngIf="successMessage" 
                     class="mb-6 p-4 rounded-xl border text-xs font-semibold bg-green-500/10 border-green-500/20 text-green-400 flex items-center gap-2">
                  <span>✅</span> {{ successMessage }}
                </div>
                <div *ngIf="errorMessage" 
                     class="mb-6 p-4 rounded-xl border text-xs font-semibold bg-red-500/10 border-red-500/20 text-red-400 flex items-center gap-2">
                  <span>⚠️</span> {{ errorMessage }}
                </div>

                <form (submit)="onPasswordSubmit()" class="space-y-5">
                  <!-- Current Password -->
                  <div>
                    <label class="block text-[10px] font-bold uppercase tracking-widest mb-2 opacity-70">Contraseña Actual</label>
                    <input type="password" 
                           name="currentPassword" 
                           [(ngModel)]="currentPassword"
                           required
                           placeholder="••••••••"
                           class="w-full py-3.5 px-4 rounded-xl border text-sm focus:outline-none transition-all duration-300 font-medium"
                           [ngClass]="isDark ? 'bg-neutral-950/60 border-neutral-800 text-white placeholder-neutral-700 focus:border-blue-500/50 hover:border-neutral-700' : 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-blue-500 hover:border-neutral-300'">
                  </div>

                  <!-- New Password -->
                  <div>
                    <label class="block text-[10px] font-bold uppercase tracking-widest mb-2 opacity-70">Nueva Contraseña</label>
                    <input type="password" 
                           name="newPassword" 
                           [(ngModel)]="newPassword"
                           required
                           placeholder="Mínimo 6 caracteres"
                           class="w-full py-3.5 px-4 rounded-xl border text-sm focus:outline-none transition-all duration-300 font-medium"
                           [ngClass]="isDark ? 'bg-neutral-950/60 border-neutral-800 text-white placeholder-neutral-700 focus:border-blue-500/50 hover:border-neutral-700' : 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-blue-500 hover:border-neutral-300'">
                  </div>

                  <!-- Confirm Password -->
                  <div>
                    <label class="block text-[10px] font-bold uppercase tracking-widest mb-2 opacity-70">Confirmar Nueva Contraseña</label>
                    <input type="password" 
                           name="confirmPassword" 
                           [(ngModel)]="confirmPassword"
                           required
                           placeholder="Confirmar contraseña"
                           class="w-full py-3.5 px-4 rounded-xl border text-sm focus:outline-none transition-all duration-300 font-medium"
                           [ngClass]="isDark ? 'bg-neutral-950/60 border-neutral-800 text-white placeholder-neutral-700 focus:border-blue-500/50 hover:border-neutral-700' : 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-blue-500 hover:border-neutral-300'">
                  </div>

                  <!-- Submit Button -->
                  <button type="submit" 
                          [disabled]="submittingPassword"
                          class="w-full py-3.5 px-4 rounded-2xl text-xs font-bold uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-500 transition-colors duration-200 cursor-pointer shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50">
                    {{ submittingPassword ? 'Guardando...' : 'Actualizar Contraseña' }}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </main>
      </div>

      <!-- ══════════════════════════════════════
           MOBILE BOTTOM NAVIGATION BAR
      ══════════════════════════════════════ -->
      <nav class="fixed bottom-0 left-0 right-0 z-30 md:hidden border-t backdrop-blur-xl px-2 py-1.5 flex items-center justify-around shadow-lg"
           [ngClass]="isDark ? 'bg-[#07070a]/90 border-neutral-800 text-neutral-400' : 'bg-white/90 border-neutral-200 text-neutral-500'">
        
        <!-- Mi Perfil -->
        <button (click)="setTab('profile')"
                class="flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-[10px] font-bold uppercase transition-all"
                [ngClass]="activeTab === 'profile' ? (isDark ? 'text-white' : 'text-neutral-900') : 'opacity-60'">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Perfil</span>
        </button>

        <!-- Cambiar Contraseña -->
        <button (click)="setTab('password')"
                class="flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-[10px] font-bold uppercase transition-all"
                [ngClass]="activeTab === 'password' ? (isDark ? 'text-white' : 'text-neutral-900') : 'opacity-60'">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Seguridad</span>
        </button>

        <!-- Personalizar -->
        <button (click)="goToPersonalizar()"
                class="flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-[10px] font-bold uppercase transition-all opacity-60">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          <span>Diseño</span>
        </button>

        <!-- Dashboard (Admin) -->
        <a *ngIf="authService.currentUser()?.rol?.toLowerCase() === 'admin'"
           [routerLink]="['/admin']"
           class="flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-[10px] font-bold uppercase transition-all opacity-60">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
          </svg>
          <span>Admin</span>
        </a>

        <!-- Menú Drawer -->
        <button (click)="isMobileDrawerOpen = !isMobileDrawerOpen"
                class="flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-[10px] font-bold uppercase transition-all"
                [ngClass]="isMobileDrawerOpen ? (isDark ? 'text-white' : 'text-neutral-900') : 'opacity-60'">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
          <span>Menú</span>
        </button>
      </nav>

    </div>
  `,
  styles: [`
    .tab-enter { animation: tabEnter 0.2s ease-out forwards; }
    @keyframes tabEnter {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class PerfilComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  private siteService = inject(SiteService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private querySub!: Subscription;

  activeTab: 'profile' | 'password' = 'profile';
  isMobileDrawerOpen = false;
  mySite: UserSite | null = null;

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

    this.siteService.getMySite().subscribe({
      next: (res) => {
        if (res && res.site) {
          this.mySite = res.site;
        }
      },
      error: () => {
        this.mySite = null;
      }
    });
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
        ? 'bg-white text-black'
        : 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/60';
    } else {
      return isActive
        ? 'bg-neutral-900 text-white'
        : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100';
    }
  }

  goToPersonalizar() {
    this.router.navigate(['/personalizar']);
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
