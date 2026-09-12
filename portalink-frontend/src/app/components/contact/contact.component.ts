import { Component, Input, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { MessagesService } from '../../services/messages.service';

interface SocialLink {
  platform: string;
  url: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, RevealDirective],
  encapsulation: ViewEncapsulation.None,
  template: `
    <section id="contact" class="relative py-16 md:py-24 px-6 sm:px-12 lg:px-20 bg-white text-neutral-900 transition-colors duration-500">
      <div class="max-w-[1500px] mx-auto">
        
        <!-- Grand Showcase Container -->
        <div class="w-full rounded-[28px] sm:rounded-[40px] border border-neutral-200/80 bg-white p-8 sm:p-14 lg:p-20 shadow-[0_10px_35px_rgba(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] relative overflow-hidden" appReveal>
          
          <form *ngIf="isFormActive" (ngSubmit)="onSubmit()" novalidate class="w-full m-0 p-0">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-x-12 lg:gap-x-16 gap-y-8 lg:gap-y-10 items-end">
              
              <!-- 1. Left Upper: Title, Description, Direct Email -->
              <div class="lg:col-span-5 order-1 self-start space-y-6">
                <div>
                  <h2 class="text-3xl sm:text-4xl lg:text-5xl font-headline font-semibold tracking-tight leading-[1.1]" style="color: #0a0a0a !important;">
                    {{ t.title }}
                  </h2>
                </div>

                <p class="text-base sm:text-lg font-sans font-normal text-neutral-600 leading-relaxed">
                  {{ t.description }}
                </p>

                <div class="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-5 transition-all duration-300 hover:border-neutral-300">
                  <span class="text-xs font-headline font-semibold uppercase tracking-wider text-neutral-400 block mb-1.5">
                    {{ t.emailMe }}
                  </span>
                  <div class="flex items-center justify-between gap-3 flex-wrap">
                    <a href="mailto:arbelaezz.c11@gmail.com" 
                       class="text-lg sm:text-xl font-headline font-medium text-neutral-900 hover:text-emerald-600 transition-colors no-underline break-all" 
                       style="color: #0a0a0a !important;">
                      arbelaezz.c11@gmail.com
                    </a>
                    <button type="button" (click)="copyEmail('arbelaezz.c11@gmail.com')"
                            class="px-3 py-1.5 rounded-lg text-xs font-headline font-semibold bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs"
                            [title]="copiedEmail ? '¡Copiado!' : 'Copiar correo'">
                      <svg *ngIf="!copiedEmail" class="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.757c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                      </svg>
                      <svg *ngIf="copiedEmail" class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span>{{ copiedEmail ? '¡Copiado!' : 'Copiar' }}</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- 2. Right Upper: Interactive Form Fields -->
              <div class="lg:col-span-7 order-2 space-y-5">
                <!-- 1. Campo Nombre -->
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <label class="block text-xs font-headline font-semibold uppercase tracking-wider text-neutral-500">
                      {{ t.labelName }} <span class="text-rose-500">*</span>
                    </label>
                    <span *ngIf="touched.nombre && !errors.nombre && isNameFieldFilled" class="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                      Válido
                    </span>
                  </div>
                  <div class="relative">
                    <input type="text" name="nombre" [(ngModel)]="formData.nombre" 
                           (blur)="onBlur('nombre')"
                           (input)="onInput('nombre')"
                           placeholder="Ej. Carlos Mendoza" 
                           [class.border-rose-400]="touched.nombre && !!errors.nombre"
                           [class.bg-rose-50/20]="touched.nombre && !!errors.nombre"
                           [class.border-emerald-500]="touched.nombre && !errors.nombre && isNameFieldFilled"
                           class="w-full rounded-xl border border-neutral-200/90 bg-neutral-50 px-4 py-3.5 text-sm font-sans text-neutral-900 focus:bg-white focus:border-neutral-900 focus:outline-none transition-all placeholder:text-neutral-400" />
                  </div>
                  <p *ngIf="touched.nombre && !!errors.nombre" class="mt-1.5 text-xs text-rose-600 font-sans flex items-center gap-1.5 animate-dropdown">
                    <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
                    <span>{{ errors.nombre }}</span>
                  </p>
                </div>

                <!-- 2. Campo Correo -->
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <label class="block text-xs font-headline font-semibold uppercase tracking-wider text-neutral-500">
                      {{ t.labelEmail }} <span class="text-rose-500">*</span>
                    </label>
                    <span *ngIf="touched.correo && !errors.correo && isEmailFieldFilled" class="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                      Válido
                    </span>
                  </div>
                  <div class="relative">
                    <input type="email" name="correo" [(ngModel)]="formData.correo" 
                           (blur)="onBlur('correo')"
                           (input)="onInput('correo')"
                           placeholder="usuario@gmail.com, @hotmail.com, @outlook.com" 
                           [class.border-rose-400]="touched.correo && !!errors.correo"
                           [class.bg-rose-50/20]="touched.correo && !!errors.correo"
                           [class.border-emerald-500]="touched.correo && !errors.correo && isEmailFieldFilled"
                           class="w-full rounded-xl border border-neutral-200/90 bg-neutral-50 px-4 py-3.5 text-sm font-sans text-neutral-900 focus:bg-white focus:border-neutral-900 focus:outline-none transition-all placeholder:text-neutral-400" />
                  </div>
                  <p *ngIf="touched.correo && !!errors.correo" class="mt-1.5 text-xs text-rose-600 font-sans flex items-center gap-1.5 animate-dropdown m-0">
                    <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
                    <span>{{ errors.correo }}</span>
                  </p>
                </div>

                <!-- 3. Campo Mensaje -->
                <div>
                  <div class="mb-2">
                    <label class="block text-xs font-headline font-semibold uppercase tracking-wider text-neutral-500">
                      {{ t.labelMessage }} <span class="text-rose-500">*</span>
                    </label>
                  </div>
                  <div class="relative">
                    <textarea name="mensaje" [(ngModel)]="formData.mensaje" rows="4" 
                              (blur)="onBlur('mensaje')"
                              (input)="onInput('mensaje')"
                              placeholder="Cuéntanos los detalles de tu proyecto o idea (mínimo 10 caracteres)..." 
                              [class.border-rose-400]="touched.mensaje && !!errors.mensaje"
                              [class.bg-rose-50/20]="touched.mensaje && !!errors.mensaje"
                              [class.border-emerald-500]="touched.mensaje && !errors.mensaje && messageLength >= 10"
                              class="w-full rounded-xl border border-neutral-200/90 bg-neutral-50 px-4 py-3.5 text-sm font-sans text-neutral-900 focus:bg-white focus:border-neutral-900 focus:outline-none transition-all placeholder:text-neutral-400 resize-none"></textarea>
                  </div>
                  <p *ngIf="touched.mensaje && !!errors.mensaje" class="mt-1.5 text-xs text-rose-600 font-sans flex items-center gap-1.5 animate-dropdown">
                    <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
                    <span>{{ errors.mensaje }}</span>
                  </p>
                </div>
              </div>

              <!-- 3. Left Lower: Social Links Buttons (Row 2 on Desktop) -->
              <div class="lg:col-span-5 order-4 lg:order-3 self-end">
                <span class="text-xs font-headline font-semibold uppercase tracking-wider text-neutral-400 block mb-2.5">
                  Redes & Perfiles
                </span>
                <div class="grid grid-cols-2 gap-3 w-full">
                  <a *ngFor="let social of socialLinks; trackBy: trackSocial" [href]="social.url" target="_blank" rel="noopener noreferrer"
                     class="h-12 w-full rounded-xl border border-neutral-200/90 bg-neutral-50 text-neutral-900 hover:bg-[#09090b] hover:text-white hover:border-[#09090b] flex items-center justify-center gap-2.5 transition-all duration-300 shadow-2xs hover:scale-[1.02] no-underline group"
                     [title]="social.platform">
                     <svg *ngIf="social.platform.toLowerCase() === 'linkedin'" class="w-5 h-5 text-neutral-800 group-hover:text-white transition-colors shrink-0" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                     </svg>
                     <svg *ngIf="social.platform.toLowerCase() === 'github'" class="w-5 h-5 text-neutral-800 group-hover:text-white transition-colors shrink-0" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                     </svg>
                     <span class="text-xs font-headline font-semibold">{{ social.platform }}</span>
                     <svg class="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                       <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H18m0 0v4.5M18 6l-7.5 7.5M6 18h12" />
                     </svg>
                  </a>
                </div>
              </div>

              <!-- 4. Right Lower: Submit Button & Feedback (Row 2 on Desktop) -->
              <div class="lg:col-span-7 order-3 lg:order-4 self-end">
                <span class="text-xs font-headline font-semibold uppercase tracking-wider text-transparent select-none hidden lg:block mb-2.5 pointer-events-none" aria-hidden="true">&nbsp;</span>
                <button type="submit" [disabled]="!isFormValid || isSubmitting" 
                        class="h-12 w-full px-8 rounded-xl font-headline font-semibold text-xs uppercase tracking-wider transition-all duration-300 shadow-sm flex items-center justify-center gap-2.5 border-none disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
                        style="background-color: #09090b !important; color: #ffffff !important;">
                  
                  <svg *ngIf="isSubmitting" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>

                  <span style="color: #ffffff !important; font-weight: 600;">
                    {{ isSubmitting ? 'Enviando mensaje...' : t.btnSend }}
                  </span>

                  <svg *ngIf="!isSubmitting" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="color: #ffffff !important;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                  </svg>
                </button>
                
                <!-- Banner de Éxito -->
                <div *ngIf="showSuccess" class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-headline flex items-center justify-between gap-3 animate-dropdown mt-3">
                  <div class="flex items-center gap-2.5">
                    <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                      </svg>
                    </div>
                    <span class="font-medium">¡Mensaje enviado con éxito! Nos pondremos en contacto contigo lo antes posible para hacer realidad tu visión digital.</span>
                  </div>
                  <button type="button" (click)="showSuccess = false" class="text-emerald-700 hover:text-emerald-900 cursor-pointer border-none bg-transparent p-1">
                    ✕
                  </button>
                </div>

                <!-- Banner de Error -->
                <div *ngIf="serverError" class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-headline flex items-center justify-between gap-3 animate-dropdown mt-3">
                  <div class="flex items-center gap-2.5">
                    <svg class="w-5 h-5 shrink-0 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <span class="font-medium">{{ serverError }}</span>
                  </div>
                  <button type="button" (click)="serverError = ''" class="text-rose-700 hover:text-rose-900 cursor-pointer border-none bg-transparent p-1">
                    ✕
                  </button>
                </div>
              </div>

            </div>
          </form>
          
          <div *ngIf="!isFormActive" class="flex items-center justify-center p-10 rounded-2xl border border-neutral-200 bg-neutral-50">
            <p class="text-center italic text-sm text-neutral-600">{{ t.formDisabled }}</p>
          </div>

        </div>

      </div>

      <!-- ═══════════════════════ MODAL DE ÉXITO DE MENSAJE ENVIADO ═══════════════════════ -->
      <div *ngIf="showSuccessModal" 
           class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/80 backdrop-blur-md transition-all duration-300 animate-fadeIn"
           (click)="closeSuccessModal()">
        
        <div class="relative w-full max-w-lg sm:max-w-xl rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 md:p-9 border shadow-2xl overflow-hidden transition-all duration-300 transform animate-scaleUp bg-white text-neutral-900 border-neutral-200"
             (click)="$event.stopPropagation()">
          
          <!-- Botón de Cerrar (X) -->
          <button type="button" 
                  (click)="closeSuccessModal()"
                  class="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer border border-transparent z-20"
                  title="Cerrar">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Hero Celebration Header -->
          <div class="text-center space-y-3 mb-6">
            <!-- Animated Success Badge / Icon -->
            <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl mx-auto flex items-center justify-center bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.2)] text-emerald-600">
              <svg class="w-8 h-8 sm:w-10 sm:h-10 animate-scaleUp" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>

            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-headline font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>¡Mensaje Enviado con Éxito!</span>
            </div>

            <h3 class="text-2xl sm:text-3xl font-headline font-bold tracking-tight text-neutral-900 m-0">
              ¡Gracias por escribirnos!
            </h3>

            <p class="text-xs sm:text-sm font-sans text-neutral-600 leading-relaxed max-w-md mx-auto m-0">
              He recibido tu mensaje correctamente. Revisaré cada detalle de tu solicitud y te responderé lo antes posible a tu correo.
            </p>
          </div>

          <!-- Botones Sociales: GitHub y LinkedIn -->
          <div class="space-y-2.5 mb-6">
            <span class="text-[11px] font-headline font-bold uppercase tracking-wider text-neutral-400 block text-center">
              Conectemos en mis Redes
            </span>
            <div class="grid grid-cols-2 gap-3">
              <!-- LinkedIn -->
              <a href="https://www.linkedin.com/in/santiago-arbelaez-contreras-9830b5290/" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 class="h-12 rounded-2xl border border-neutral-200 bg-neutral-50 hover:bg-[#0077b5] hover:border-[#0077b5] text-neutral-800 hover:text-white flex items-center justify-center gap-2.5 transition-all duration-300 shadow-2xs hover:scale-[1.02] active:scale-[0.98] no-underline group">
                <svg class="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                <span class="text-xs font-headline font-semibold">LinkedIn</span>
                <svg class="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H18m0 0v4.5M18 6l-7.5 7.5M6 18h12" />
                </svg>
              </a>

              <!-- GitHub -->
              <a href="https://github.com/santiagoarbelaezc" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 class="h-12 rounded-2xl border border-neutral-200 bg-neutral-50 hover:bg-[#09090b] hover:border-[#09090b] text-neutral-800 hover:text-white flex items-center justify-center gap-2.5 transition-all duration-300 shadow-2xs hover:scale-[1.02] active:scale-[0.98] no-underline group">
                <svg class="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span class="text-xs font-headline font-semibold">GitHub</span>
                <svg class="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H18m0 0v4.5M18 6l-7.5 7.5M6 18h12" />
                </svg>
              </a>
            </div>
          </div>

          <!-- Redirección: Proyectos, Links y Sobre Mí -->
          <div class="space-y-2.5 mb-6">
            <span class="text-[11px] font-headline font-bold uppercase tracking-wider text-neutral-400 block text-center">
              Sigue explorando el sitio
            </span>
            <div class="grid grid-cols-3 gap-2 sm:gap-2.5">
              <!-- Proyectos -->
              <button type="button" 
                      (click)="navigateTo('proyectos')"
                      class="p-3 rounded-2xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 group">
                <div class="w-8 h-8 rounded-xl bg-neutral-200/70 group-hover:bg-neutral-900 group-hover:text-white flex items-center justify-center transition-colors">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </div>
                <span class="text-xs font-headline font-semibold">Proyectos</span>
              </button>

              <!-- Links -->
              <button type="button" 
                      (click)="navigateTo('links')"
                      class="p-3 rounded-2xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 group">
                <div class="w-8 h-8 rounded-xl bg-neutral-200/70 group-hover:bg-neutral-900 group-hover:text-white flex items-center justify-center transition-colors">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                </div>
                <span class="text-xs font-headline font-semibold">Links</span>
              </button>

              <!-- Sobre Mí -->
              <button type="button" 
                      (click)="navigateTo('sobre-mi')"
                      class="p-3 rounded-2xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 group">
                <div class="w-8 h-8 rounded-xl bg-neutral-200/70 group-hover:bg-neutral-900 group-hover:text-white flex items-center justify-center transition-colors">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <span class="text-xs font-headline font-semibold">Sobre Mí</span>
              </button>
            </div>
          </div>

          <!-- Main CTA Button -->
          <div>
            <button type="button" 
                    (click)="closeSuccessModal()"
                    class="w-full h-12 rounded-2xl font-headline font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99] border-none hover:opacity-90"
                    style="background-color: #09090b !important; color: #ffffff !important;">
              <span style="color: #ffffff !important; font-weight: 700;">Continuar en el Sitio</span>
              <svg class="w-4 h-4" style="color: #ffffff !important;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>

        </div>

      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .animate-dropdown {
      animation: dropDownFade 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes dropDownFade {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes scaleUp {
      from { opacity: 0; transform: scale(0.96); }
      to   { opacity: 1; transform: scale(1); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.25s ease-out forwards;
    }
    .animate-scaleUp {
      animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class ContactComponent implements OnInit, OnDestroy {
  @Input() data: any;

  currentLanguage = 'es';

  formData = {
    nombre: '',
    correo: '',
    mensaje: ''
  };

  touched = {
    nombre: false,
    correo: false,
    mensaje: false
  };

  errors = {
    nombre: '',
    correo: '',
    mensaje: ''
  };

  isSubmitting = false;
  showSuccess = false;
  showSuccessModal = false;
  serverError = '';
  submitAttempted = false;
  copiedEmail = false;

  readonly socialLinks: SocialLink[] = [
    { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/santiago-arbelaez-contreras-9830b5290/' },
    { platform: 'GitHub', url: 'https://github.com/santiagoarbelaezc' }
  ];

  readonly allowedDomains: string[] = [
    'gmail.com',
    'hotmail.com',
    'hotmail.es',
    'outlook.com',
    'outlook.es',
    'yahoo.com',
    'yahoo.es',
    'icloud.com',
    'live.com',
    'proton.me',
    'protonmail.com'
  ];

  readonly translations: Record<string, any> = {
    es: {
      subtitle: 'Contacto',
      title: 'Hablemos de tu próximo proyecto',
      description: 'Déjanos tu mensaje y nos pondremos en contacto contigo lo antes posible para hacer realidad tu visión digital.',
      emailMe: 'Escríbeme directamente:',
      labelName: 'Tu nombre',
      labelEmail: 'Correo electrónico',
      labelMessage: '¿En qué podemos ayudarte?',
      btnSend: 'Enviar mensaje',
      formDisabled: 'El formulario de contacto está temporalmente desactivado. Por favor, usa el email directo.'
    },
    en: {
      subtitle: 'Contact',
      title: "Let's talk about your next project",
      description: 'Leave us a message and we will get back to you as soon as possible to bring your digital vision to life.',
      emailMe: 'Email me directly:',
      labelName: 'Your name',
      labelEmail: 'Email address',
      labelMessage: 'How can we help you?',
      btnSend: 'Send message',
      formDisabled: 'The contact form is temporarily disabled. Please use direct email.'
    }
  };

  currentTranslations = this.translations['es'];

  constructor(
    private messagesService: MessagesService,
    private router: Router
  ) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.currentLanguage = localStorage.getItem('portfolio-language') || 'es';
      this.updateTranslations();
      window.addEventListener('portfolio-language-change', this.onLanguageChange);
    }
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('portfolio-language-change', this.onLanguageChange);
    }
  }

  get t(): any {
    return this.currentTranslations;
  }

  get isFormActive(): boolean {
    return this.data?.formActive !== false;
  }

  get isNameFieldFilled(): boolean {
    return !!(this.formData.nombre && this.formData.nombre.trim());
  }

  get isEmailFieldFilled(): boolean {
    return !!(this.formData.correo && this.formData.correo.trim());
  }

  get messageLength(): number {
    return (this.formData.mensaje || '').trim().length;
  }

  get isFormValid(): boolean {
    const name = (this.formData.nombre || '').trim();
    if (name.length < 2 || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]+$/.test(name)) {
      return false;
    }

    const email = (this.formData.correo || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return false;
    }

    const parts = email.split('@');
    const domain = parts[1] || '';
    if (!this.allowedDomains.includes(domain)) {
      return false;
    }

    const message = (this.formData.mensaje || '').trim();
    if (message.length < 10) {
      return false;
    }

    return true;
  }

  trackSocial(_index: number, item: SocialLink): string {
    return item.platform;
  }

  onLanguageChange = (event: any) => {
    this.currentLanguage = event?.detail?.language || 'es';
    this.updateTranslations();
  };

  private updateTranslations() {
    this.currentTranslations = this.translations[this.currentLanguage] || this.translations['es'];
  }

  copyEmail(email: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(email);
      this.copiedEmail = true;
      setTimeout(() => this.copiedEmail = false, 2500);
    }
  }

  onBlur(field: 'nombre' | 'correo' | 'mensaje') {
    this.touched[field] = true;
    this.validateField(field);
  }

  onInput(field: 'nombre' | 'correo' | 'mensaje') {
    if (this.touched[field] || this.submitAttempted) {
      this.validateField(field);
    }
  }

  validateField(field: 'nombre' | 'correo' | 'mensaje'): boolean {
    if (field === 'nombre') {
      const val = (this.formData.nombre || '').trim();
      if (!val) {
        this.errors.nombre = 'Por favor ingresa tu nombre completo.';
        return false;
      }
      if (val.length < 2) {
        this.errors.nombre = 'El nombre debe tener al menos 2 caracteres.';
        return false;
      }
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]+$/.test(val)) {
        this.errors.nombre = 'El nombre solo debe contener letras.';
        return false;
      }
      this.errors.nombre = '';
      return true;
    }

    if (field === 'correo') {
      const val = (this.formData.correo || '').trim().toLowerCase();
      if (!val) {
        this.errors.correo = 'Por favor ingresa tu correo electrónico.';
        return false;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        this.errors.correo = 'Ingresa un formato de correo válido (ej. usuario@gmail.com).';
        return false;
      }

      const parts = val.split('@');
      const domain = parts[1] || '';
      if (!this.allowedDomains.includes(domain)) {
        this.errors.correo = 'Solo se admiten correos @gmail.com, @hotmail.com, @outlook.com o @yahoo.com.';
        return false;
      }

      this.errors.correo = '';
      return true;
    }

    if (field === 'mensaje') {
      const val = (this.formData.mensaje || '').trim();
      if (!val) {
        this.errors.mensaje = 'Por favor cuéntanos sobre tu proyecto o idea.';
        return false;
      }
      if (val.length < 10) {
        this.errors.mensaje = `El mensaje debe tener al menos 10 caracteres (llevas ${val.length}).`;
        return false;
      }
      this.errors.mensaje = '';
      return true;
    }

    return true;
  }

  validateAll(): boolean {
    this.touched.nombre = true;
    this.touched.correo = true;
    this.touched.mensaje = true;

    const isNameValid = this.validateField('nombre');
    const isEmailValid = this.validateField('correo');
    const isMessageValid = this.validateField('mensaje');

    return isNameValid && isEmailValid && isMessageValid;
  }

  onSubmit() {
    this.submitAttempted = true;
    this.serverError = '';

    if (!this.validateAll()) {
      return;
    }

    this.isSubmitting = true;
    this.showSuccess = false;

    const payload = {
      nombre: this.formData.nombre.trim(),
      correo: this.formData.correo.trim().toLowerCase(),
      mensaje: this.formData.mensaje.trim()
    };

    this.messagesService.sendMessage(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showSuccess = true;
        this.showSuccessModal = true;
        this.submitAttempted = false;
        this.formData = { nombre: '', correo: '', mensaje: '' };
        this.touched = { nombre: false, correo: false, mensaje: false };
        this.errors = { nombre: '', correo: '', mensaje: '' };
        setTimeout(() => this.showSuccess = false, 7000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.serverError = err.error?.message || 'Error al enviar el mensaje. Por favor intenta nuevamente.';
      }
    });
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
  }

  navigateTo(destination: 'proyectos' | 'links' | 'sobre-mi') {
    this.closeSuccessModal();
    if (destination === 'links') {
      this.router.navigate(['/links']);
    } else if (destination === 'proyectos') {
      if (typeof document !== 'undefined') {
        const el = document.getElementById('proyectos');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
      this.router.navigate(['/prototipos']);
    } else if (destination === 'sobre-mi') {
      if (typeof document !== 'undefined') {
        const el = document.getElementById('about');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }
}
