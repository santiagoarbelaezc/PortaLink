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
    <div class="min-h-screen lg:h-screen pt-[68px] overflow-y-auto lg:overflow-hidden bg-white text-neutral-900 font-sans grid grid-cols-1 lg:grid-cols-12">

      <!-- Left Side (Showcase Visual Estilo Apple - Alineado Seamless con Navbar) -->
      <div class="relative hidden lg:flex flex-col justify-center overflow-hidden bg-neutral-50/70 border-r border-neutral-200/80 px-10 lg:px-14 xl:px-16 py-6 lg:py-8 lg:col-span-7 xl:col-span-7 h-[calc(100vh-68px)]">

        <!-- Center Main Content Showcase (Full Width Spanning) -->
        <div class="my-auto py-2 z-10 space-y-4 w-full max-w-2xl xl:max-w-3xl mx-auto">
          
          <!-- Headlines Requested by User -->
          <div class="space-y-2">
            <h1 class="text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-neutral-900 leading-[1.15]">
              Regístrate y obtén descuentos
            </h1>
            <p class="text-lg lg:text-2xl font-semibold tracking-tight text-neutral-600 leading-snug">
              Empieza la digitalización de tu negocio hoy
            </p>
          </div>

          <!-- Description -->
          <p class="text-xs sm:text-sm font-sans text-neutral-600 leading-relaxed m-0 w-full max-w-2xl">
            Soluciones completas, conectadas y escalables que ofrecen la mejor experiencia en cualquier dispositivo para potenciar tus clientes.
          </p>

          <!-- Single Project Showcase Image (proyecto-0.png) -->
          <div class="relative pt-1 pb-1 w-full">
            <div class="relative w-full rounded-2xl border border-neutral-200/90 bg-white p-2.5 shadow-md overflow-hidden">
              <img src="assets/images/proyecto-0.png" class="w-full h-auto max-h-[340px] xl:max-h-[380px] object-cover object-top rounded-xl border border-neutral-100" alt="Proyecto Showcase">
            </div>
          </div>

        </div>

      </div>

      <!-- Right Side (Forms Panel - Seamlessly Touches Navbar Line) -->
      <div class="flex flex-col justify-start px-6 sm:px-12 lg:px-14 xl:px-16 relative bg-white lg:col-span-5 xl:col-span-5 h-[calc(100vh-68px)] overflow-y-auto py-6 lg:py-8">
        <div class="w-full max-w-sm xl:max-w-md mx-auto">

          <!-- Mobile Header Back Link -->
          <div class="lg:hidden flex items-center justify-between mb-8">
            <a routerLink="/" class="inline-flex items-center gap-2 text-xs font-semibold text-neutral-800 no-underline">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
              </svg>
              <span>Volver al Inicio</span>
            </a>
          </div>

          <!-- Title Header Group -->
          <div class="text-center mb-6 space-y-1">
            <span class="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
              {{ activeTab === 'login' ? 'Bienvenido de nuevo' : 'Comienza hoy' }}
            </span>
            <h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
              {{ activeTab === 'login' ? 'Conéctate a tu cuenta' : 'Crea tu cuenta' }}
            </h2>
            <p class="text-xs font-sans text-neutral-500 max-w-xs mx-auto leading-relaxed m-0">
              {{ activeTab === 'login' ? 'Ingresa tus credenciales para gestionar y personalizar tu sitio.' : 'Regístrate en segundos para empezar a diseñar tu plataforma única.' }}
            </p>
          </div>

          <!-- Switch Tabs (Capsule Bar with Explicit Style Color) -->
          <div class="grid grid-cols-2 gap-1.5 p-1.5 rounded-full bg-neutral-100 border border-neutral-200/80 mb-6">
            <button type="button" (click)="switchTab('login')" 
                    class="py-2.5 text-xs font-semibold rounded-full transition-all duration-300 cursor-pointer border-none shadow-2xs"
                    [style.background-color]="activeTab === 'login' ? '#09090b' : 'transparent'">
              <span [style.color]="activeTab === 'login' ? '#ffffff !important' : '#52525b !important'" style="font-weight: 600;">Ingresar</span>
            </button>
            <button type="button" (click)="switchTab('register')" 
                    class="py-2.5 text-xs font-semibold rounded-full transition-all duration-300 cursor-pointer border-none shadow-2xs"
                    [style.background-color]="activeTab === 'register' ? '#09090b' : 'transparent'">
              <span [style.color]="activeTab === 'register' ? '#ffffff !important' : '#52525b !important'" style="font-weight: 600;">Registrarse</span>
            </button>
          </div>

          <!-- Messages (Error / Success) -->
          <div *ngIf="error" class="mb-5 flex items-center gap-2.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 animate-shake">
            <svg class="w-4 h-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <span class="font-medium">{{ error }}</span>
          </div>
          
          <div *ngIf="successMsg" class="mb-5 flex items-center gap-2.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 animate-slide-down">
            <svg class="w-4 h-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="font-medium">{{ successMsg }}</span>
          </div>

          <!-- Login / Register Slider Container -->
          <div class="relative overflow-hidden w-full transition-[height] duration-300 ease-out"
               [style.height]="activeTab === 'login' ? '280px' : '520px'">
            <div class="flex w-[200%] transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
                 [style.transform]="activeTab === 'login' ? 'translateX(0)' : 'translateX(-50%)'">
              
              <!-- Login Form (1/2 width) -->
              <div class="w-1/2 pr-2">
                <form (submit)="login($event)" class="space-y-4">
                  <!-- Email -->
                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-neutral-700">Correo Electrónico</label>
                    <div class="relative">
                      <input type="email"
                             [(ngModel)]="email" name="email"
                             placeholder="usuario@ejemplo.com"
                             [disabled]="isLoading()"
                             class="w-full bg-neutral-50 border border-neutral-200/80 rounded-xl px-4 py-3 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-all disabled:opacity-50">
                    </div>
                  </div>

                  <!-- Password -->
                  <div class="space-y-1.5">
                    <div class="flex justify-between items-center">
                      <label class="text-xs font-semibold text-neutral-700">Contraseña</label>
                      <a routerLink="/forgot-password" class="text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors no-underline">¿Olvidaste tu contraseña?</a>
                    </div>
                    <div class="relative">
                      <input [type]="showLoginPassword ? 'text' : 'password'"
                             [(ngModel)]="password" name="password"
                             placeholder="••••••••••••"
                             [disabled]="isLoading()"
                             class="w-full bg-neutral-50 border border-neutral-200/80 rounded-xl pl-4 pr-11 py-3 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-all disabled:opacity-50">
                      <button type="button" (click)="showLoginPassword = !showLoginPassword" tabindex="-1" class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-800 transition-colors cursor-pointer border-none bg-transparent">
                        <svg *ngIf="!showLoginPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        <svg *ngIf="showLoginPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      </button>
                    </div>
                  </div>

                  <!-- Submit Login Button -->
                  <button type="submit"
                          [disabled]="isLoading()"
                          class="w-full py-3.5 mt-2 rounded-full font-semibold text-xs shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 border-none cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                          style="background-color: #09090b !important; color: #ffffff !important;">
                    <svg *ngIf="isLoading()" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span style="color: #ffffff !important; font-weight: 600;">{{ isLoading() ? 'Autenticando...' : 'Iniciar sesión' }}</span>
                  </button>
                </form>
              </div>

              <!-- Register Form (1/2 width) -->
              <div class="w-1/2 pl-2">
                <form (submit)="register($event)" class="space-y-3">
                  <!-- Name -->
                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-neutral-700">Nombre Completo</label>
                    <input type="text"
                           [(ngModel)]="registerName" name="registerName"
                           placeholder="Tu nombre completo"
                           [disabled]="isLoading()"
                           class="w-full bg-neutral-50 border border-neutral-200/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-all disabled:opacity-50">
                  </div>

                  <!-- Email -->
                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-neutral-700">Correo Electrónico</label>
                    <input type="email"
                           [(ngModel)]="registerEmail" name="registerEmail"
                           placeholder="usuario@ejemplo.com"
                           [disabled]="isLoading()"
                           class="w-full bg-neutral-50 border border-neutral-200/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-all disabled:opacity-50">
                  </div>

                  <!-- Phone Number -->
                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-neutral-700">Número de Teléfono</label>
                    <input type="text"
                           [(ngModel)]="registerPhone" name="registerPhone"
                           placeholder="3054078225"
                           [disabled]="isLoading()"
                           class="w-full bg-neutral-50 border border-neutral-200/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-all disabled:opacity-50">
                  </div>

                  <!-- Passwords Grid -->
                  <div class="grid grid-cols-2 gap-2.5">
                    <div class="space-y-1.5">
                      <label class="text-xs font-semibold text-neutral-700">Contraseña</label>
                      <div class="relative">
                        <input [type]="showRegisterPassword ? 'text' : 'password'"
                               [(ngModel)]="registerPassword" name="registerPassword"
                               placeholder="••••••••"
                               [disabled]="isLoading()"
                               class="w-full bg-neutral-50 border border-neutral-200/80 rounded-xl pl-3 pr-8 py-2.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-all disabled:opacity-50">
                        <button type="button" (click)="showRegisterPassword = !showRegisterPassword" tabindex="-1" class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-neutral-400 hover:text-neutral-800 cursor-pointer border-none bg-transparent">
                          <svg *ngIf="!showRegisterPassword" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          <svg *ngIf="showRegisterPassword" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        </button>
                      </div>
                    </div>
                    
                    <div class="space-y-1.5">
                      <label class="text-xs font-semibold text-neutral-700">Confirmar</label>
                      <div class="relative">
                        <input [type]="showRegisterConfirmPassword ? 'text' : 'password'"
                               [(ngModel)]="registerConfirmPassword" name="registerConfirmPassword"
                               placeholder="••••••••"
                               [disabled]="isLoading()"
                               class="w-full bg-neutral-50 border border-neutral-200/80 rounded-xl pl-3 pr-8 py-2.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-all disabled:opacity-50">
                        <button type="button" (click)="showRegisterConfirmPassword = !showRegisterConfirmPassword" tabindex="-1" class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-neutral-400 hover:text-neutral-800 cursor-pointer border-none bg-transparent">
                          <svg *ngIf="!showRegisterConfirmPassword" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          <svg *ngIf="showRegisterConfirmPassword" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Captcha de Seguridad -->
                  <div class="space-y-1.5 pt-1">
                    <label class="text-xs font-semibold text-neutral-700">Código de Seguridad</label>
                    <div class="flex items-center gap-2">
                      <div class="h-10 border border-neutral-200/80 bg-neutral-50 rounded-xl overflow-hidden flex items-center justify-center select-none shrink-0" 
                           [innerHTML]="captchaSvg" style="width: 120px;">
                      </div>
                      <button type="button" (click)="loadCaptcha()" class="p-2 rounded-xl border border-neutral-200/80 bg-white hover:bg-neutral-100 transition-colors text-neutral-700 cursor-pointer flex items-center justify-center h-10 w-10 shrink-0" title="Regenerar Captcha">
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
                             class="flex-grow h-10 bg-neutral-50 border border-neutral-200/80 rounded-xl px-2 text-xs font-bold text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white transition-all disabled:opacity-50 text-center uppercase tracking-widest">
                    </div>
                  </div>

                  <!-- Submit Register Button -->
                  <button type="submit"
                          [disabled]="isLoading()"
                          class="w-full py-3.5 mt-2 rounded-full font-semibold text-xs shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 border-none cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                          style="background-color: #09090b !important; color: #ffffff !important;">
                    <svg *ngIf="isLoading()" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span style="color: #ffffff !important; font-weight: 600;">{{ isLoading() ? 'Registrando...' : 'Crear mi cuenta' }}</span>
                  </button>
                </form>
              </div>

            </div>
          </div>

          <p class="text-center text-[11px] font-sans text-neutral-400 mt-6">
            &copy; 2026 PortaLink. Todos los derechos reservados.
          </p>

        </div>
      </div>

      <!-- MODAL DE VERIFICACIÓN DE CORREO (ESTILO APPLE) -->
      <div *ngIf="showVerificationModal" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-md animate-fade-in">
        <div class="relative w-full max-w-md bg-white border border-neutral-200/80 rounded-[28px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.12)] text-center overflow-hidden animate-slide-down space-y-4">
          
          <!-- Icono de correo -->
          <div class="w-14 h-14 rounded-full bg-neutral-100 border border-neutral-200/80 flex items-center justify-center mx-auto text-neutral-900 shadow-2xs">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>

          <div class="space-y-1.5">
            <span class="inline-block px-3 py-0.5 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/60 rounded-full">
              Verificación requerida
            </span>
            <h3 class="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
              ¡Revisa tu correo!
            </h3>
          </div>

          <p class="text-xs sm:text-sm font-sans text-neutral-600 leading-relaxed max-w-xs mx-auto">
            Hemos enviado un enlace de confirmación a <strong class="text-neutral-900 font-semibold">{{ registeredEmailDisplay }}</strong>.
          </p>

          <div class="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-xs text-neutral-600 text-left space-y-1">
            <p class="font-bold text-neutral-900 m-0">⚠️ Revisa tu carpeta de Spam</p>
            <p class="m-0 text-[11px] leading-relaxed">Sin la verificación tu cuenta no estará activa. Si no lo ves en tu bandeja principal, revisa la carpeta de Spam o Correo No Deseado.</p>
          </div>

          <button type="button" (click)="closeVerificationModal()"
                  class="w-full py-3.5 rounded-full font-semibold text-xs shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border-none cursor-pointer text-center"
                  style="background-color: #09090b !important; color: #ffffff !important;">
            <span style="color: #ffffff !important; font-weight: 600;">Entendido, ir a Iniciar sesión</span>
          </button>

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
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
    .animate-slide-down { animation: slideDown 0.3s cubic-bezier(0.16,1,0.3,1) forwards; }
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

  showVerificationModal = false;
  registeredEmailDisplay = '';

  closeVerificationModal() {
    this.showVerificationModal = false;
    this.switchTab('login');
  }

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
        const user = this.authService.currentUser();
        if (user && (user.rol?.toLowerCase() === 'admin' || user.rol?.toLowerCase() === 'administrador')) {
          localStorage.setItem('portalink_admin_tab', 'dashboard');
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/personalizar']);
        }
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
          this.registeredEmailDisplay = this.registerEmail;
          this.showVerificationModal = true;
          this.registerPassword = '';
          this.registerConfirmPassword = '';
          this.loadCaptcha();
          this.captchaCode = '';
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
