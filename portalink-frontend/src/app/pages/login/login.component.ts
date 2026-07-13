import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen lg:h-screen overflow-y-auto lg:overflow-hidden bg-neutral-950 font-sans grid grid-cols-1 lg:grid-cols-12">

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
      <div class="flex flex-col justify-start px-6 sm:px-12 relative bg-[var(--bg-primary)] lg:col-span-4 h-full overflow-y-auto transition-all duration-500 pb-32 lg:pb-12">
        <div class="w-full max-w-[450px] mx-auto lg:ml-auto lg:mr-0 mt-[100px] lg:mt-[120px]">

          <!-- Section Title Group (Centered & Premium) -->
          <div class="text-center mb-5 flex flex-col items-center">
            <span class="text-[11px] md:text-[12px] font-bold text-[#00b4d8] uppercase tracking-[0.25em] mb-1.5">
              {{ activeTab === 'login' ? 'Bienvenido de nuevo' : 'Comienza hoy' }}
            </span>
            <h3 class="text-2xl md:text-[26px] font-black uppercase leading-tight tracking-[-0.04em] text-[var(--text-primary)]" style="font-family: var(--font-headline, sans-serif);">
              {{ activeTab === 'login' ? 'Conéctate a tu cuenta' : 'Crea tu cuenta' }}
            </h3>
            <p class="text-[12px] md:text-[13px] text-[var(--text-secondary)] mt-1.5 font-medium max-w-[340px] leading-relaxed">
              {{ activeTab === 'login' ? 'Ingresa tus credenciales para gestionar y personalizar tu sitio' : 'Regístrate en segundos para empezar a diseñar tu portafolio único' }}
            </p>
          </div>

          <!-- Switch Tabs -->
          <div class="grid grid-cols-2 gap-1 p-1 rounded-2xl border mb-5 relative border-[var(--card-border)] bg-[var(--bg-secondary)]/50">
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
          <div class="relative overflow-hidden w-full transition-[height] duration-300 ease-out"
               [style.height]="activeTab === 'login' ? '270px' : '470px'">
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
                             placeholder="usuario@example.com"
                             [disabled]="isLoading()"
                             class="w-full bg-transparent border border-[var(--card-border)] rounded-xl pl-11 pr-4 py-3 text-sm text-[var(--text-primary)] placeholder-neutral-600 focus:outline-none focus:border-[var(--accent-color)]/50 focus:ring-1 focus:ring-[var(--accent-color)]/50 transition-all duration-300 disabled:opacity-50">
                    </div>
                  </div>

                  <!-- Password -->
                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <label class="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Contraseña</label>
                      <a routerLink="/forgot-password" class="text-[10px] text-neutral-500 hover:text-[var(--text-primary)] transition-colors">¿Olvidaste tu contraseña?</a>
                    </div>
                    <div class="relative group">
                      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-[var(--accent-color)] transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                      </div>
                      <input [type]="showLoginPassword ? 'text' : 'password'"
                             [(ngModel)]="password" name="password"
                             placeholder="••••••••••"
                             [disabled]="isLoading()"
                             class="w-full bg-transparent border border-[var(--card-border)] rounded-xl pl-11 pr-12 py-3 text-sm text-[var(--text-primary)] placeholder-neutral-600 focus:outline-none focus:border-[var(--accent-color)]/50 focus:ring-1 focus:ring-[var(--accent-color)]/50 transition-all duration-300 disabled:opacity-50">
                      <button type="button" (click)="showLoginPassword = !showLoginPassword" tabindex="-1" class="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-500 hover:text-[var(--accent-color)] transition-colors cursor-pointer">
                        <svg *ngIf="!showLoginPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        <svg *ngIf="showLoginPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      </button>
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
                             class="w-full bg-transparent border border-[var(--card-border)] rounded-xl pl-11 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-neutral-600 focus:outline-none focus:border-[var(--accent-color)]/50 focus:ring-1 focus:ring-[var(--accent-color)]/50 transition-all duration-300 disabled:opacity-50">
                    </div>
                  </div>

                  <!-- Email -->
                  <div class="space-y-1.5">
                    <label class="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Correo Electrónico</label>
                    <div class="relative group">
                       <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-[var(--accent-color)] transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path></svg>
                      </div>
                      <input type="email"
                             [(ngModel)]="registerEmail" name="registerEmail"
                             placeholder="usuario@example.com"
                             [disabled]="isLoading()"
                             class="w-full bg-transparent border border-[var(--card-border)] rounded-xl pl-11 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-neutral-600 focus:outline-none focus:border-[var(--accent-color)]/50 focus:ring-1 focus:ring-[var(--accent-color)]/50 transition-all duration-300 disabled:opacity-50">
                    </div>
                  </div>

                  <!-- Phone Number -->
                  <div class="space-y-1.5">
                    <label class="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Número de Teléfono</label>
                    <div class="relative group">
                      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-[var(--accent-color)] transition-colors">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      </div>
                      <input type="text"
                             [(ngModel)]="registerPhone" name="registerPhone"
                             placeholder="123456789"
                             [disabled]="isLoading()"
                             class="w-full bg-transparent border border-[var(--card-border)] rounded-xl pl-11 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-neutral-600 focus:outline-none focus:border-[var(--accent-color)]/50 focus:ring-1 focus:ring-[var(--accent-color)]/50 transition-all duration-300 disabled:opacity-50">
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
                        <input [type]="showRegisterPassword ? 'text' : 'password'"
                               [(ngModel)]="registerPassword" name="registerPassword"
                               placeholder="••••••••"
                               [disabled]="isLoading()"
                               class="w-full bg-transparent border border-[var(--card-border)] rounded-xl pl-9 pr-10 py-2.5 text-sm text-[var(--text-primary)] placeholder-neutral-600 focus:outline-none focus:border-[var(--accent-color)]/50 focus:ring-1 focus:ring-[var(--accent-color)]/50 transition-all duration-300 disabled:opacity-50">
                        <button type="button" (click)="showRegisterPassword = !showRegisterPassword" tabindex="-1" class="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-[var(--accent-color)] transition-colors cursor-pointer">
                          <svg *ngIf="!showRegisterPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          <svg *ngIf="showRegisterPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        </button>
                      </div>
                    </div>
                    <div class="space-y-1.5">
                      <label class="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Confirmar</label>
                      <div class="relative group">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-[var(--accent-color)] transition-colors">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        </div>
                        <input [type]="showRegisterConfirmPassword ? 'text' : 'password'"
                               [(ngModel)]="registerConfirmPassword" name="registerConfirmPassword"
                               placeholder="••••••••"
                               [disabled]="isLoading()"
                               class="w-full bg-transparent border border-[var(--card-border)] rounded-xl pl-9 pr-10 py-2.5 text-sm text-[var(--text-primary)] placeholder-neutral-600 focus:outline-none focus:border-[var(--accent-color)]/50 focus:ring-1 focus:ring-[var(--accent-color)]/50 transition-all duration-300 disabled:opacity-50">
                        <button type="button" (click)="showRegisterConfirmPassword = !showRegisterConfirmPassword" tabindex="-1" class="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-[var(--accent-color)] transition-colors cursor-pointer">
                          <svg *ngIf="!showRegisterConfirmPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          <svg *ngIf="showRegisterConfirmPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Captcha de Seguridad -->
                  <div class="space-y-1.5 mt-2">
                    <label class="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Código de Seguridad</label>
                    <div class="flex items-center gap-2">
                      <div class="h-10 border border-[var(--card-border)] bg-[#050505] rounded-xl overflow-hidden flex items-center justify-center select-none" 
                           [innerHTML]="captchaSvg" style="width: 125px;">
                      </div>
                      <button type="button" (click)="loadCaptcha()" class="p-2.5 rounded-xl border border-[var(--card-border)] bg-transparent/50 hover:bg-[var(--card-border)]/50 transition-colors text-[var(--text-primary)] hover:border-[var(--text-primary)]/30 cursor-pointer flex items-center justify-center h-10" title="Regenerar Captcha">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                      </button>
                      <input type="text"
                             [(ngModel)]="captchaCode" name="captchaCode"
                             placeholder="CÓDIGO"
                             autocomplete="off"
                             [disabled]="isLoading()"
                             maxlength="5"
                             class="flex-grow h-10 bg-[#121217] border border-neutral-700 rounded-xl px-2 py-2 text-sm text-cyan-400 placeholder-neutral-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300 disabled:opacity-50 text-center uppercase tracking-widest font-black">
                    </div>
                  </div>

                  <!-- Submit Register -->
                  <button type="submit"
                          [disabled]="isLoading()"
                          class="w-full py-3.5 rounded-xl bg-[var(--text-primary)] hover:opacity-90 text-[var(--bg-primary)] text-[12px] font-bold uppercase tracking-widest active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/50 transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-md">
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
    
    /* Autofill and Caret Overrides */
    :host ::ng-deep input:-webkit-autofill,
    :host ::ng-deep input:-webkit-autofill:hover, 
    :host ::ng-deep input:-webkit-autofill:focus,
    :host ::ng-deep input:-webkit-autofill:active {
      -webkit-text-fill-color: var(--text-primary) !important;
      -webkit-box-shadow: 0 0 0px 1000px #0a0a0a inset !important;
      background-color: #0a0a0a !important;
      transition: background-color 5000s ease-in-out 0s;
      caret-color: var(--text-primary) !important;
    }
    
    /* Anti-extension overrides */
    :host ::ng-deep input[type="email"],
    :host ::ng-deep input[type="password"],
    :host ::ng-deep input[type="text"] {
      color: var(--text-primary) !important;
    }
  `]
})
export class LoginComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private sanitizer = inject(DomSanitizer);

  activeTab: 'login' | 'register' = 'login';

  // Login
  email = '';
  password = '';
  loginCaptchaCode = '';
  
  // Register
  registerName = '';
  registerEmail = '';
  registerPassword = '';
  registerConfirmPassword = '';
  registerPhone = '';

  // Captcha
  captchaId = '';
  captchaSvg: SafeHtml = '';
  captchaCode = '';

  error = '';
  successMsg = '';
  isLoading = signal<boolean>(false);
  
  showLoginPassword = false;
  showRegisterPassword = false;
  showRegisterConfirmPassword = false;

  ngOnInit() {
    this.route.url.subscribe(urlSegments => {
      const path = urlSegments[0]?.path || '';
      const queryTab = this.route.snapshot.queryParams['tab'];
      const targetTab: 'login' | 'register' = (path === 'register' || queryTab === 'register') ? 'register' : 'login';

      if (queryTab === 'register' && path === 'login') {
        this.router.navigate(['/register'], { replaceUrl: true });
        return;
      }

      if (this.activeTab !== targetTab || !this.captchaId) {
        this.activeTab = targetTab;
        this.error = '';
        this.successMsg = '';
        this.captchaCode = '';
        this.loginCaptchaCode = '';
        this.loadCaptcha();
      }
    });
  }

  loadCaptcha() {
    this.authService.getCaptcha().subscribe({
      next: (res) => {
        this.captchaId = res.id;
        this.captchaSvg = this.sanitizer.bypassSecurityTrustHtml(res.svg);
      },
      error: () => {
        this.showError('Error al cargar la verificación de seguridad.');
      }
    });
  }

  switchTab(tab: 'login' | 'register') {
    if (this.activeTab !== tab) {
      this.activeTab = tab;
      this.error = '';
      this.successMsg = '';
      this.captchaCode = '';
      this.loginCaptchaCode = '';
      this.loadCaptcha();
      this.router.navigate([`/${tab}`]);
    }
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

    const payload = {
      email: this.email,
      password: this.password
    };

    this.authService.login(payload).subscribe({
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
    
    if (!this.registerName || !this.registerEmail || !this.registerPassword || !this.registerConfirmPassword || !this.registerPhone || !this.captchaCode) {
      this.showError('Por favor completa todos los campos.');
      return;
    }

    const email = this.registerEmail.trim().toLowerCase();
    if (!email.includes('@')) {
      this.showError('El correo electrónico debe contener un "@".');
      return;
    }

    const allowedDomains = /@(gmail|hotmail|outlook|live|msn|yahoo|icloud|protonmail|proton|aol|zoho|gmx|yandex)\.[a-zA-Z]{2,}/;
    if (!allowedDomains.test(email)) {
      this.showError('Proveedor de correo inválido (ej: gmail, hotmail, yahoo).');
      return;
    }

    const phone = this.registerPhone.trim();
    const phoneRegex = /^[0-9+() -]{7,15}$/;
    if (!phoneRegex.test(phone)) {
      this.showError('Número de teléfono inválido (debe tener entre 7 y 15 dígitos).');
      return;
    }

    if (this.registerPassword !== this.registerConfirmPassword) {
      this.showError('Las contraseñas no coinciden.');
      return;
    }

    this.isLoading.set(true);
    this.error = '';
    this.successMsg = '';

    const payload = {
      nombre: this.registerName,
      email: this.registerEmail,
      password: this.registerPassword,
      telefono: this.registerPhone,
      captchaId: this.captchaId,
      captchaCode: this.captchaCode
    };

    this.authService.register(payload).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        if (res?.requireVerification) {
          this.successMsg = res.message || 'Te hemos enviado un correo de verificación. Revisa tu bandeja de entrada.';
          setTimeout(() => {
            this.switchTab('login');
          }, 4000);
        } else {
          this.successMsg = '¡Cuenta creada exitosamente! Redirigiendo...';
          setTimeout(() => {
            this.router.navigate(['/admin']);
          }, 1500);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        const message = err.error?.message || 'Error al registrarse. Intenta de nuevo.';
        this.showError(message);
        this.loadCaptcha();
        this.captchaCode = '';
      }
    });
  }

  private showError(msg: string) {
    this.error = msg;
    setTimeout(() => (this.error = ''), 4000);
  }
}
