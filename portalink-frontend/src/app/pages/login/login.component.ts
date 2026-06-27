import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-screen overflow-hidden bg-neutral-950 font-sans grid grid-cols-1 lg:grid-cols-12">

      <!-- Left Side (Banner Style) -->
      <div class="relative hidden lg:flex flex-col justify-center overflow-hidden bg-[#050505] border-r border-neutral-800/50 pt-[88px] lg:col-span-8 h-full"
           style="--bg-primary: #050505; --bg-secondary: #0a0a0a; --text-primary: #ffffff; --text-secondary: rgba(255, 255, 255, 0.6); --card-border: rgba(255, 255, 255, 0.1);">
        
        <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(0,180,216,0.15)_0%,transparent_60%)] pointer-events-none translate-x-1/4 -translate-y-1/4"></div>

        <div class="relative z-10 w-full flex items-center justify-between h-full">
          
          <!-- Texts and Actions (Left) -->
          <div class="w-full max-w-[350px] md:max-w-[500px] lg:max-w-[650px] xl:max-w-[850px] 2xl:max-w-[1000px] pl-12 pr-4 flex flex-col justify-center pb-24 mt-8">
            <!-- Header small -->
            <div class="flex items-center gap-2 mb-4">
              <span class="text-[11px] md:text-sm font-bold text-neutral-300 uppercase tracking-[0.3em]">¿No tienes cuenta</span>
              <span class="text-[11px] md:text-sm font-bold text-[#00b4d8] uppercase tracking-[0.3em]">?</span>
            </div>

            <!-- Huge Titles -->
            <h2 class="text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black uppercase leading-[1] tracking-tight mb-0 text-white drop-shadow-xl break-words" style="font-family: var(--font-headline, sans-serif);">
              Regístrate
            </h2>
            <h2 class="text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black uppercase leading-[1] tracking-tight mb-8 text-[#00b4d8] drop-shadow-[0_0_20px_rgba(0,180,216,0.4)] break-words" style="font-family: var(--font-headline, sans-serif);">
              Y comienza a personalizar
            </h2>

            <!-- Left Bordered Subtitle -->
            <div class="border-l-2 border-[#00b4d8] pl-5 mb-10">
              <p class="text-xs xl:text-sm text-neutral-300 uppercase tracking-[0.15em] font-medium leading-relaxed max-w-lg">
                Para empezar a personalizar tu sitio<br>y obtener <span class="text-[#00b4d8] font-bold">descuentos especiales</span>
              </p>
            </div>

            <!-- Glowing Button -->
            <button type="button" (click)="switchTab('register')" class="group relative flex items-center gap-6 bg-black/80 border border-[#00b4d8]/50 rounded-2xl px-6 py-4 w-max overflow-hidden hover:border-[#00b4d8] transition-all duration-500 hover:shadow-[0_0_25px_rgba(0,180,216,0.3)] shadow-[0_0_15px_rgba(0,180,216,0.1)] backdrop-blur-sm cursor-pointer">
              <!-- Glow inner -->
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-[#00b4d8]/10 to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-in-out -translate-x-full"></div>
              
              <div class="relative z-10 flex items-center gap-4 border-r border-neutral-700/80 pr-5">
                <svg class="w-6 h-6 text-[#00b4d8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
              <span class="relative z-10 text-white text-[13px] font-bold uppercase tracking-[0.15em] pt-0.5">Crea tu cuenta ahora</span>
              <div class="relative z-10 pl-2">
                <svg class="w-5 h-5 text-[#00b4d8] group-hover:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </div>
            </button>

          </div>

          <!-- Robot Image (Right Absolute) -->
          <div class="absolute bottom-[-10px] right-[-20px] lg:right-[-30px] xl:right-[-50px] 2xl:right-[-70px] w-[350px] lg:w-[450px] xl:w-[550px] 2xl:w-[650px] pointer-events-none z-10">
            <img src="assets/images/rotbot4.png" class="w-full h-auto object-contain object-bottom drop-shadow-[0_10px_30px_rgba(0,180,216,0.2)] scale-x-[-1]" alt="Rotbot">
          </div>

        </div>

        <!-- Bottom Features Bar -->
        <div class="absolute bottom-10 left-12 z-20 flex items-center gap-8 lg:gap-12 xl:gap-16">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-black border border-[#00b4d8]/40 shadow-[0_0_15px_rgba(0,180,216,0.15)]">
              <svg class="w-6 h-6 text-[#00b4d8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <div>
              <h4 class="text-white text-[11px] font-bold uppercase tracking-widest leading-tight">Rápido</h4>
              <p class="text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5 leading-tight">Registro en<br>segundos</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-black border border-[#00b4d8]/40 shadow-[0_0_15px_rgba(0,180,216,0.15)]">
              <svg class="w-6 h-6 text-[#00b4d8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <div>
              <h4 class="text-white text-[11px] font-bold uppercase tracking-widest leading-tight">Seguro</h4>
              <p class="text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5 leading-tight">Tus datos<br>protegidos</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-black border border-[#00b4d8]/40 shadow-[0_0_15px_rgba(0,180,216,0.15)]">
              <svg class="w-6 h-6 text-[#00b4d8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
            </div>
            <div>
              <h4 class="text-white text-[11px] font-bold uppercase tracking-widest leading-tight">Exclusivo</h4>
              <p class="text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5 leading-tight">Accede a descuentos<br>especiales</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side (Forms) -->
      <div class="flex flex-col justify-center px-6 sm:px-12 relative bg-[var(--bg-primary)] pt-[110px] lg:col-span-4 h-full overflow-hidden pb-8 transition-colors duration-500">
        <!-- Mobile Logo -->
        <div class="lg:hidden flex flex-col items-center mb-6">
          <img src="assets/icons/logo-link-dark.png" class="w-14 h-14 object-contain mb-3" alt="PortaLink">
          <h1 class="text-xl font-bold uppercase tracking-[0.2em] text-white">PortaLink</h1>
        </div>

        <!-- Mobile Texts -->
        <div class="lg:hidden mb-10 text-center">
          <h2 class="text-2xl font-bold text-white uppercase leading-[1.2] tracking-[0.05em] mb-4" style="font-family: var(--font-headline, sans-serif);">
            Ingresa con nosotros o regístrate para tener descuentos especiales
          </h2>
          <p class="text-[10px] text-neutral-400 uppercase tracking-[0.3em] font-semibold">
            Empieza a personalizar tu sitio con nosotros
          </p>
        </div>

        <div class="w-full max-w-[450px] mx-auto lg:ml-auto lg:mr-0 mt-4 lg:mt-0">

          <!-- Switch Tabs -->
          <div class="grid grid-cols-2 gap-1 p-1 rounded-2xl border mb-6 relative border-[var(--card-border)] bg-[var(--bg-secondary)]/50">
            <!-- Sliding background indicator -->
            <div class="absolute top-1 bottom-1 rounded-xl transition-all duration-300 ease-out bg-[var(--bg-primary)] shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                 [style.width]="'calc(50% - 4px)'"
                 [style.left]="activeTab === 'login' ? '4px' : 'calc(50% + 0px)'">
            </div>

            <button type="button" (click)="switchTab('login')" 
                    class="py-3 text-[11px] uppercase font-bold tracking-wider rounded-xl transition-all duration-300 cursor-pointer relative z-10"
                    [ngClass]="activeTab === 'login' ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'">
              Ingresar
            </button>
            <button type="button" (click)="switchTab('register')" 
                    class="py-3 text-[11px] uppercase font-bold tracking-wider rounded-xl transition-all duration-300 cursor-pointer relative z-10"
                    [ngClass]="activeTab === 'register' ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'">
              Registrarse
            </button>
          </div>

          <!-- Messages (Error / Success) -->
          <div *ngIf="error" class="mb-6 flex items-center gap-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3.5 animate-shake">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <span class="font-medium">{{ error }}</span>
          </div>
          
          <div *ngIf="successMsg" class="mb-6 flex items-center gap-3 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3.5 animate-slide-down">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="font-medium">{{ successMsg }}</span>
          </div>



          <!-- Slider Container -->
          <div class="relative overflow-hidden w-full">
            <div class="flex w-[200%] transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
                 [style.transform]="activeTab === 'login' ? 'translateX(0)' : 'translateX(-50%)'">
                         <!-- Login Form Container (1/2 width of 200% = 100% of parent) -->
              <div class="w-1/2 px-1">
                <form (submit)="login($event)" class="space-y-4">
                  <!-- Email -->
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Correo Electrónico</label>
                    <div class="relative group">
                      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-[var(--accent-color)] transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path></svg>
                      </div>
                      <input type="email"
                             [(ngModel)]="email" name="email"
                             placeholder="admin@portalink.com"
                             [disabled]="isLoading()"
                             class="w-full bg-[var(--bg-secondary)]/60 border border-[var(--card-border)] rounded-xl pl-11 pr-4 py-3 text-sm text-[var(--text-primary)] placeholder-neutral-600 focus:outline-none focus:border-[var(--accent-color)]/50 focus:ring-1 focus:ring-[var(--accent-color)]/50 transition-all duration-300 disabled:opacity-50">
                    </div>
                  </div>

                  <!-- Password -->
                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <label class="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Contraseña</label>
                      <a href="#" class="text-[10px] text-neutral-500 hover:text-[var(--text-primary)] transition-colors">¿Olvidaste tu contraseña?</a>
                    </div>
                    <div class="relative group">
                      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-[var(--accent-color)] transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                      </div>
                      <input type="password"
                             [(ngModel)]="password" name="password"
                             placeholder="••••••••••"
                             [disabled]="isLoading()"
                             class="w-full bg-[var(--bg-secondary)]/60 border border-[var(--card-border)] rounded-xl pl-11 pr-4 py-3 text-sm text-[var(--text-primary)] placeholder-neutral-600 focus:outline-none focus:border-[var(--accent-color)]/50 focus:ring-1 focus:ring-[var(--accent-color)]/50 transition-all duration-300 disabled:opacity-50">
                    </div>
                  </div>

                  <!-- Submit Login -->
                  <button type="submit"
                          [disabled]="isLoading()"
                          class="w-full py-3.5 mt-2 rounded-xl bg-[var(--text-primary)] hover:opacity-90 text-[var(--bg-primary)] text-[12px] font-bold uppercase tracking-widest active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/50 transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-md">
                    <svg *ngIf="isLoading()" class="animate-spin h-4 w-4 text-[var(--bg-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ isLoading() ? 'Autenticando...' : 'Ingresar' }}
                  </button>
                </form>
              </div>

              <!-- Register Form Container (1/2 width) -->
              <div class="w-1/2 px-1">
                <form (submit)="register($event)" class="space-y-3">
                  <!-- Name -->
                  <div class="space-y-1.5">
                    <label class="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Nombre Completo</label>
                    <div class="relative group">
                      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-[var(--accent-color)] transition-colors">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                      </div>
                      <input type="text"
                             [(ngModel)]="registerName" name="registerName"
                             placeholder="Tu nombre"
                             [disabled]="isLoading()"
                             class="w-full bg-[var(--bg-secondary)]/60 border border-[var(--card-border)] rounded-xl pl-11 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-neutral-600 focus:outline-none focus:border-[var(--accent-color)]/50 focus:ring-1 focus:ring-[var(--accent-color)]/50 transition-all duration-300 disabled:opacity-50">
                    </div>
                  </div>

                  <!-- Email -->
                  <div class="space-y-1.5">
                    <label class="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Correo Electrónico</label>
                    <div class="relative group">
                      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-[var(--accent-color)] transition-colors">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      </div>
                      <input type="email"
                             [(ngModel)]="registerEmail" name="registerEmail"
                             placeholder="correo@ejemplo.com"
                             [disabled]="isLoading()"
                             class="w-full bg-[var(--bg-secondary)]/60 border border-[var(--card-border)] rounded-xl pl-11 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-neutral-600 focus:outline-none focus:border-[var(--accent-color)]/50 focus:ring-1 focus:ring-[var(--accent-color)]/50 transition-all duration-300 disabled:opacity-50">
                    </div>
                  </div>

                  <!-- Passwords Grid -->
                  <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-1.5">
                      <label class="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Contraseña</label>
                      <div class="relative group">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-[var(--accent-color)] transition-colors">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        </div>
                        <input type="password"
                               [(ngModel)]="registerPassword" name="registerPassword"
                               placeholder="••••••••"
                               [disabled]="isLoading()"
                               class="w-full bg-[var(--bg-secondary)]/60 border border-[var(--card-border)] rounded-xl pl-9 pr-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-neutral-600 focus:outline-none focus:border-[var(--accent-color)]/50 focus:ring-1 focus:ring-[var(--accent-color)]/50 transition-all duration-300 disabled:opacity-50">
                      </div>
                    </div>
                    <div class="space-y-1.5">
                      <label class="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Confirmar</label>
                      <div class="relative group">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-[var(--accent-color)] transition-colors">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        </div>
                        <input type="password"
                               [(ngModel)]="registerConfirmPassword" name="registerConfirmPassword"
                               placeholder="••••••••"
                               [disabled]="isLoading()"
                               class="w-full bg-[var(--bg-secondary)]/60 border border-[var(--card-border)] rounded-xl pl-9 pr-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-neutral-600 focus:outline-none focus:border-[var(--accent-color)]/50 focus:ring-1 focus:ring-[var(--accent-color)]/50 transition-all duration-300 disabled:opacity-50">
                      </div>
                    </div>
                  </div>

                  <!-- Submit Register -->
                  <button type="submit"
                          [disabled]="isLoading()"
                          class="w-full py-3.5 mt-2 rounded-xl bg-[var(--text-primary)] hover:opacity-90 text-[var(--bg-primary)] text-[12px] font-bold uppercase tracking-widest active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/50 transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-md">
                    <svg *ngIf="isLoading()" class="animate-spin h-4 w-4 text-[var(--bg-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ isLoading() ? 'Registrando...' : 'Crear Cuenta' }}
                  </button>
                </form>
              </div>

            </div>
          </div>

          <!-- Divider -->
          <div class="relative flex items-center mt-2 mb-2">
            <div class="flex-grow border-t border-[var(--card-border)] opacity-60"></div>
            <span class="flex-shrink-0 mx-4 text-neutral-500 text-[9px] uppercase font-bold tracking-[0.2em] opacity-80">O continuar con</span>
            <div class="flex-grow border-t border-[var(--card-border)] opacity-60"></div>
          </div>

          <!-- Social Login -->
          <div class="flex flex-col gap-2 mb-2">
            <button type="button" class="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-[var(--card-border)] bg-transparent hover:bg-[var(--bg-secondary)]/50 transition-all duration-300 text-[11px] font-bold uppercase tracking-widest text-[var(--text-primary)] shadow-sm hover:border-[var(--text-primary)]/30">
              <svg class="w-4 h-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.409 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"/><path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 01-6.723-4.849L1.24 17.35C3.198 21.302 7.269 24 12 24c3.24 0 5.95-.98 7.91-2.736l-3.87-3.251z"/><path fill="#4A90E2" d="M19.91 21.264C22.28 19.33 24 15.93 24 12c0-.84-.11-1.63-.26-2.39H12v4.71h6.69c-.31 1.76-1.39 3.09-2.78 3.94l3.87 3.25z"/><path fill="#FBBC05" d="M5.266 14.236A7.12 7.12 0 015.01 12c0-.77.16-1.51.41-2.235L1.24 6.65A11.93 11.93 0 000 12c0 1.92.445 3.73 1.237 5.35l4.029-3.114z"/></svg>
              Continuar con Google
            </button>
            
            <div class="grid grid-cols-2 gap-2">
              <button type="button" class="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-[var(--card-border)] bg-transparent hover:bg-[var(--bg-secondary)]/50 transition-all duration-300 text-[11px] font-bold uppercase tracking-widest text-[var(--text-primary)] shadow-sm hover:border-[var(--text-primary)]/30">
                <svg class="w-4 h-4 text-[var(--text-primary)]" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"></path></svg>
                GitHub
              </button>
              <button type="button" class="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-[var(--card-border)] bg-transparent hover:bg-[var(--bg-secondary)]/50 transition-all duration-300 text-[11px] font-bold uppercase tracking-widest text-[var(--text-primary)] shadow-sm hover:border-[var(--text-primary)]/30">
                <svg class="w-4 h-4 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0h.003z"/></svg>
                LinkedIn
              </button>
            </div>
          </div>
          
          <p class="text-center text-[10px] text-[var(--text-secondary)] mt-3 uppercase tracking-widest font-semibold">
            &copy; 2026 PortaLink. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-4px); }
      75% { transform: translateX(4px); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-12px); }
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-slide-down { animation: slideDown 0.3s cubic-bezier(0.16,1,0.3,1) forwards; }
  `]
})
export class LoginComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  activeTab: 'login' | 'register' = 'login';

  // Login
  email = '';
  password = '';
  
  // Register
  registerName = '';
  registerEmail = '';
  registerPassword = '';
  registerConfirmPassword = '';

  error = '';
  successMsg = '';
  isLoading = signal<boolean>(false);

  switchTab(tab: 'login' | 'register') {
    this.activeTab = tab;
    this.error = '';
    this.successMsg = '';
  }

  login(event: Event) {
    event.preventDefault();
    if (!this.email || !this.password) {
      this.showError('Por favor ingresa correo y contraseña.');
      return;
    }

    this.isLoading.set(true);
    this.error = '';
    this.successMsg = '';

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.isLoading.set(false);
        const message = err.error?.message || 'Error al conectar con el servidor. Intenta de nuevo.';
        this.showError(message);
      }
    });
  }

  register(event: Event) {
    event.preventDefault();
    
    if (!this.registerName || !this.registerEmail || !this.registerPassword || !this.registerConfirmPassword) {
      this.showError('Por favor completa todos los campos.');
      return;
    }

    if (this.registerPassword !== this.registerConfirmPassword) {
      this.showError('Las contraseñas no coinciden.');
      return;
    }

    this.isLoading.set(true);
    this.error = '';
    this.successMsg = '';

    // Simular registro exitoso ya que no hay endpoint explícito documentado
    setTimeout(() => {
      this.isLoading.set(false);
      this.successMsg = '¡Cuenta creada exitosamente! Por favor inicia sesión.';
      
      setTimeout(() => {
        this.email = this.registerEmail; // Prellenar correo
        this.registerName = '';
        this.registerEmail = '';
        this.registerPassword = '';
        this.registerConfirmPassword = '';
        this.switchTab('login');
      }, 1500);
      
    }, 1200);
  }

  private showError(msg: string) {
    this.error = msg;
    setTimeout(() => (this.error = ''), 4000);
  }
}
