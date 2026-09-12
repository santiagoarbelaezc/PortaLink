import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule, RevealDirective],
  template: `
    <section id="about" class="relative py-10 md:py-16 px-6 sm:px-12 lg:px-20 bg-white text-neutral-900 transition-colors duration-500" *ngIf="data?.visible !== false">
      <div class="max-w-[1500px] mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          <!-- Left Side: Profile Image Showcase (Matching Hero Video & Project Cards style) -->
          <div class="lg:col-span-5 w-full" appReveal>
            <div class="relative w-full rounded-[28px] sm:rounded-[36px] overflow-hidden border border-neutral-200/80 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.04)] transition-all duration-500 hover:scale-[1.01] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] group">
              <div class="aspect-[4/5] w-full overflow-hidden bg-neutral-50">
                <img [src]="data?.avatarImage || 'https://res.cloudinary.com/doxdjiyvi/image/upload/v1786975015/principal_bunphx.jpg'" 
                     alt="Perfil Profesional" 
                     class="w-full h-full object-cover object-[center_25%] transition-transform duration-700 ease-out group-hover:scale-105" />
              </div>
            </div>
          </div>

          <!-- Right Side: Bio & Action CTAs -->
          <div class="lg:col-span-7 space-y-6 lg:pl-4">
            <div appReveal>
              <h2 class="text-3xl sm:text-4xl lg:text-5xl font-headline font-semibold tracking-tight leading-[1.12]" 
                  style="color: #0a0a0a !important;">
                Ingeniero de Sistemas, desarrollador web & creador digital
              </h2>
            </div>

            <div class="space-y-4 font-sans font-normal text-neutral-600 text-base sm:text-lg leading-relaxed" appReveal [delay]="200">
              <p>
                {{ getTranslation().bioLine1 }}
              </p>
              <p>
                {{ getTranslation().bioLine2 }}
              </p>
            </div>

            <!-- Action CTAs -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 flex-wrap" appReveal [delay]="350">
              
              <!-- Primary CTA: Galería de Diseños -->
              <a routerLink="/prototipos" 
                 class="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-headline font-medium text-xs tracking-wide transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] no-underline border-none"
                 style="background-color: #09090b !important; color: #ffffff !important;">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="color: #ffffff !important;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/>
                </svg>
                <span style="color: #ffffff !important; font-weight: 500;">{{ getTranslation().btnProposal }}</span>
              </a>

              <!-- Secondary CTA: Certificados (Abre Modal) -->
              <button type="button" 
                      (click)="openCertModal()"
                      class="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-headline font-medium text-xs tracking-wide transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] border border-neutral-200 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 cursor-pointer">
                <svg class="w-4 h-4 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                </svg>
                <span>{{ getTranslation().btnCertificates }}</span>
              </button>

              <!-- Tertiary CTA: Tecnologías (Abre Modal) -->
              <button type="button" 
                      (click)="openTechModal()"
                      class="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-headline font-medium text-xs tracking-wide transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] border border-neutral-200 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 cursor-pointer">
                <svg class="w-4 h-4 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
                <span>{{ getTranslation().btnTech }}</span>
              </button>

            </div>

          </div>

        </div>
      </div>

      <!-- ═══════════════════════ MODAL DE TECNOLOGÍAS ═══════════════════════ -->
      <div *ngIf="isTechModalOpen" 
           class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/80 backdrop-blur-md transition-all duration-300 animate-fadeIn"
           (click)="closeTechModal()">
        
        <div class="relative w-full max-w-3xl rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 md:p-9 border shadow-2xl overflow-hidden transition-all duration-300 transform animate-scaleUp bg-white text-neutral-900 border-neutral-200 max-h-[90vh] overflow-y-auto"
             (click)="$event.stopPropagation()">
          
          <!-- Botón de Cerrar (X) -->
          <button type="button" 
                  (click)="closeTechModal()"
                  class="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer border border-transparent z-20"
                  title="Cerrar">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Header del Modal -->
          <div class="space-y-2.5 mb-6 text-center sm:text-left pr-6">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-headline font-bold uppercase tracking-wider bg-neutral-100 text-neutral-800 border border-neutral-200">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Stack Tecnológico & Habilidades</span>
            </div>

            <h3 class="text-2xl sm:text-3xl font-headline font-bold tracking-tight text-neutral-900 m-0">
              Tecnologías que utilizo
            </h3>

            <p class="text-xs sm:text-sm font-sans text-neutral-600 leading-relaxed max-w-xl m-0">
              Herramientas, frameworks y entornos de infraestructura con los que diseño y construyo plataformas robustas, escalables e interactivas.
            </p>
          </div>

          <!-- Grupos de Tecnologías -->
          <div class="space-y-5">
            
            <!-- 1. FRONTEND -->
            <div class="p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-neutral-200/80 bg-neutral-50/70 space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
                    </svg>
                  </div>
                  <h4 class="text-xs sm:text-sm font-headline font-bold uppercase tracking-wider text-neutral-800 m-0">
                    Frontend
                  </h4>
                </div>
                <span class="text-[10px] font-mono uppercase tracking-widest text-neutral-400">4 Tecnologías</span>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div *ngFor="let t of frontendTech" 
                     class="p-3 rounded-xl sm:rounded-2xl border border-neutral-200 bg-white hover:border-neutral-900 transition-all hover:scale-[1.02] shadow-2xs group flex flex-col justify-between">
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="w-2 h-2 rounded-full" [style.backgroundColor]="t.color"></span>
                    <span class="text-[10px] font-mono text-neutral-400 font-semibold">{{ t.tag }}</span>
                  </div>
                  <div>
                    <h5 class="text-xs sm:text-sm font-headline font-bold text-neutral-900 m-0 group-hover:text-neutral-950">
                      {{ t.name }}
                    </h5>
                    <p class="text-[10px] font-sans text-neutral-500 m-0 leading-tight mt-0.5">
                      {{ t.desc }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. BACKEND -->
            <div class="p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-neutral-200/80 bg-neutral-50/70 space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.75 5.1a3 3 0 012.4-1.1h7.7a3 3 0 012.4 1.1l2.25 3.45a4.5 4.5 0 01.9 2.7" />
                    </svg>
                  </div>
                  <h4 class="text-xs sm:text-sm font-headline font-bold uppercase tracking-wider text-neutral-800 m-0">
                    Backend
                  </h4>
                </div>
                <span class="text-[10px] font-mono uppercase tracking-widest text-neutral-400">3 Tecnologías</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div *ngFor="let t of backendTech" 
                     class="p-3 rounded-xl sm:rounded-2xl border border-neutral-200 bg-white hover:border-neutral-900 transition-all hover:scale-[1.02] shadow-2xs group flex flex-col justify-between">
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="w-2 h-2 rounded-full" [style.backgroundColor]="t.color"></span>
                    <span class="text-[10px] font-mono text-neutral-400 font-semibold">{{ t.tag }}</span>
                  </div>
                  <div>
                    <h5 class="text-xs sm:text-sm font-headline font-bold text-neutral-900 m-0 group-hover:text-neutral-950">
                      {{ t.name }}
                    </h5>
                    <p class="text-[10px] font-sans text-neutral-500 m-0 leading-tight mt-0.5">
                      {{ t.desc }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. DATABASE & CLOUD -->
            <div class="p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-neutral-200/80 bg-neutral-50/70 space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                    </svg>
                  </div>
                  <h4 class="text-xs sm:text-sm font-headline font-bold uppercase tracking-wider text-neutral-800 m-0">
                    Database & Cloud
                  </h4>
                </div>
                <span class="text-[10px] font-mono uppercase tracking-widest text-neutral-400">5 Tecnologías</span>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div *ngFor="let t of databaseCloudTech" 
                     class="p-3 rounded-xl sm:rounded-2xl border border-neutral-200 bg-white hover:border-neutral-900 transition-all hover:scale-[1.02] shadow-2xs group flex flex-col justify-between">
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="w-2 h-2 rounded-full" [style.backgroundColor]="t.color"></span>
                    <span class="text-[10px] font-mono text-neutral-400 font-semibold">{{ t.tag }}</span>
                  </div>
                  <div>
                    <h5 class="text-xs sm:text-sm font-headline font-bold text-neutral-900 m-0 group-hover:text-neutral-950">
                      {{ t.name }}
                    </h5>
                    <p class="text-[10px] font-sans text-neutral-500 m-0 leading-tight mt-0.5">
                      {{ t.desc }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Bottom CTA -->
          <div class="mt-6 pt-4 border-t border-neutral-200 flex items-center justify-end">
            <button type="button" 
                    (click)="closeTechModal()"
                    class="px-6 py-2.5 rounded-xl font-headline font-semibold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99] border-none"
                    style="background-color: #09090b !important; color: #ffffff !important;">
              <span style="color: #ffffff !important; font-weight: 600;">Entendido</span>
            </button>
          </div>

        </div>

      </div>

      <!-- ═══════════════════════ MODAL DE CERTIFICADOS ═══════════════════════ -->
      <div *ngIf="isCertModalOpen" 
           class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/80 backdrop-blur-md transition-all duration-300 animate-fadeIn"
           (click)="closeCertModal()">
        
        <div class="relative w-full max-w-5xl rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 md:p-9 border shadow-2xl overflow-hidden transition-all duration-300 transform animate-scaleUp bg-white text-neutral-900 border-neutral-200 max-h-[92vh] overflow-y-auto"
             (click)="$event.stopPropagation()">
          
          <!-- Botón de Cerrar (X) -->
          <button type="button" 
                  (click)="closeCertModal()"
                  class="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer border border-transparent z-20"
                  title="Cerrar">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Header del Modal -->
          <div class="space-y-2.5 mb-6 text-center sm:text-left pr-6">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-headline font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>freeCodeCamp.org · Verificado</span>
            </div>

            <h3 class="text-2xl sm:text-3xl font-headline font-bold tracking-tight text-neutral-900 m-0">
              Certificaciones Acreditadas
            </h3>

            <p class="text-xs sm:text-sm font-sans text-neutral-600 leading-relaxed max-w-xl m-0">
              Titulaciones oficiales en Ingeniería de Software acreditadas internacionalmente por freeCodeCamp.org con credenciales verificables en tiempo real.
            </p>
          </div>

          <!-- Grid de Certificados (3 Columnas en Desktop) -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            
            <div *ngFor="let cert of certificates" 
                 class="group rounded-2xl sm:rounded-3xl border border-neutral-200/90 bg-neutral-50/50 hover:bg-white hover:border-neutral-900 transition-all duration-300 shadow-2xs hover:shadow-lg flex flex-col justify-between overflow-hidden">
              
              <!-- Imagen del Certificado con Hover Preview -->
              <div class="relative w-full aspect-[16/10] overflow-hidden bg-neutral-100 border-b border-neutral-200/80 cursor-pointer"
                   (click)="openFullImage(cert)"
                   title="Clic para ver en pantalla completa">
                <img [src]="cert.image" 
                     [alt]="cert.name" 
                     class="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105" 
                     loading="lazy" />
                
                <!-- Insignias Flotantes -->
                <div class="absolute top-2.5 left-2.5 z-10">
                  <span class="px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-white text-[10px] font-headline font-semibold">
                    freeCodeCamp
                  </span>
                </div>
                <div class="absolute top-2.5 right-2.5 z-10">
                  <span class="px-2.5 py-0.5 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-headline font-semibold flex items-center gap-1">
                    <span class="w-1 h-1 rounded-full bg-white animate-pulse"></span>
                    <span>Oficial</span>
                  </span>
                </div>
              </div>

              <!-- Info y Botón Verificar -->
              <div class="p-4 sm:p-5 flex flex-col justify-between flex-grow space-y-3">
                <div>
                  <h4 class="text-xs sm:text-sm font-headline font-bold text-neutral-900 m-0 leading-snug">
                    {{ cert.shortTitle }}
                  </h4>
                  <p class="text-[11px] font-sans text-neutral-500 m-0 leading-relaxed mt-1 line-clamp-2">
                    {{ cert.description }}
                  </p>
                </div>

                <!-- Botón de Verificación Externa -->
                <a [href]="cert.verificationUrl" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   class="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-headline font-semibold transition-all duration-300 no-underline shadow-2xs border-none cursor-pointer hover:opacity-90"
                   style="background-color: #09090b !important; color: #ffffff !important;">
                  <span style="color: #ffffff !important;">Verificar Credencial</span>
                  <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="color: #ffffff !important;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H18m0 0v4.5M18 6l-7.5 7.5M6 18h12" />
                  </svg>
                </a>
              </div>

            </div>

          </div>

          <!-- Bottom CTA -->
          <div class="mt-6 pt-4 border-t border-neutral-200 flex items-center justify-end">
            <button type="button" 
                    (click)="closeCertModal()"
                    class="px-6 py-2.5 rounded-xl font-headline font-semibold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99] border-none"
                    style="background-color: #09090b !important; color: #ffffff !important;">
              <span style="color: #ffffff !important; font-weight: 600;">Entendido</span>
            </button>
          </div>

        </div>

      </div>

      <!-- LIGHTBOX PARA VER IMAGEN EN ALTA RESOLUCIÓN -->
      <div *ngIf="previewCertImage" 
           class="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl animate-fadeIn cursor-pointer"
           (click)="previewCertImage = null">
        <div class="relative max-w-4xl w-full rounded-2xl overflow-hidden shadow-2xl border border-white/20"
             (click)="$event.stopPropagation()">
          <button type="button" 
                  (click)="previewCertImage = null"
                  class="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-colors border-none cursor-pointer z-20">
            ✕
          </button>
          <img [src]="previewCertImage" alt="Certificado en Alta Resolución" class="w-full h-auto object-contain max-h-[85vh] bg-neutral-900" />
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
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
export class AboutComponent implements OnInit, OnDestroy {
  @Input() data: any;

  currentLanguage = 'es';
  isTechModalOpen = false;
  isCertModalOpen = false;
  previewCertImage: string | null = null;

  readonly certificates = [
    {
      id: 'js-algorithms-v8',
      name: 'JavaScript Algorithms and Data Structures (v8)',
      shortTitle: 'JavaScript Algorithms (v8)',
      issuer: 'freeCodeCamp',
      verificationUrl: 'https://www.freecodecamp.org/certification/santiagoarbelaezc/javascript-algorithms-and-data-structures-v8',
      description: 'Certificación oficial en algoritmos ES6+, estructuras de datos complejas, OOP y programación funcional pura.',
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/v1787530609/javascript_semsts.png'
    },
    {
      id: 'python-scientific-v7',
      name: 'Scientific Computing with Python (v7)',
      shortTitle: 'Scientific Computing Python (v7)',
      issuer: 'freeCodeCamp',
      verificationUrl: 'https://www.freecodecamp.org/certification/santiagoarbelaezc/scientific-computing-with-python-v7',
      description: 'Competencia en Python 3 para computación científica, procesamiento numérico y resolución algorítmica.',
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/v1787530609/python_qvlktw.png'
    },
    {
      id: 'backend-apis',
      name: 'Back End Development and APIs',
      shortTitle: 'Back End Development & APIs',
      issuer: 'freeCodeCamp',
      verificationUrl: 'https://www.freecodecamp.org/certification/santiagoarbelaezc/back-end-development-and-apis',
      description: 'Desarrollo backend y APIs RESTful con Node.js, Express.js y modelado de datos NoSQL con MongoDB.',
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/v1787530609/backend_z0lrlo.png'
    }
  ];

  readonly frontendTech = [
    { name: 'Angular', desc: 'Framework SPA & Signals', tag: 'FW', color: '#DD0031' },
    { name: 'CSS', desc: 'Modern & Responsive', tag: 'STYLE', color: '#264DE4' },
    { name: 'TypeScript', desc: 'Tipado estricto & robusto', tag: 'LANG', color: '#3178C6' },
    { name: 'HTML', desc: 'Semántica & Accesibilidad', tag: 'MARKUP', color: '#E34F26' }
  ];

  readonly backendTech = [
    { name: 'Spring Boot', desc: 'Java Enterprise & APIs', tag: 'ENTERPRISE', color: '#6DB33F' },
    { name: 'Node.js', desc: 'Servicios Asíncronos', tag: 'RUNTIME', color: '#339933' },
    { name: 'Python', desc: 'IA, Scripts & Backend', tag: 'AI / BACK', color: '#3776AB' }
  ];

  readonly databaseCloudTech = [
    { name: 'MySQL', desc: 'Base de datos relacional', tag: 'SQL', color: '#4479A1' },
    { name: 'AWS', desc: 'Cloud & Computación', tag: 'CLOUD', color: '#FF9900' },
    { name: 'Hostinger', desc: 'Hosting VPS & Servidores', tag: 'HOST', color: '#673AB7' },
    { name: 'Firebase', desc: 'BaaS & Realtime sync', tag: 'SYNC', color: '#FFA611' },
    { name: 'Docker', desc: 'Contenedores & CI/CD', tag: 'DEVOPS', color: '#2496ED' }
  ];

  translations: any = {
    es: {
      philosophy: 'Perfil',
      headline: 'Ingeniero de Sistemas, desarrollador web & creador digital',
      bioLine1: 'Diseño y desarrollo soluciones digitales a medida con tecnología moderna e inteligencia artificial, impulsando el crecimiento real de tu negocio.',
      bioLine2: 'Me enfoco en construir arquitecturas sólidas, experiencias de usuario fluidas e interfaces visualmente de alto nivel que convierten visitas en clientes.',
      btnProposal: 'Galería de Diseños',
      btnCertificates: 'Certificados',
      btnTech: 'Tecnologías'
    },
    en: {
      philosophy: 'Profile',
      headline: 'Systems Engineer, web developer & digital creator',
      bioLine1: 'I design and develop custom digital solutions with modern technology and artificial intelligence, driving real business growth.',
      bioLine2: 'I focus on building solid architectures, seamless user experiences, and high-level visual interfaces that turn visitors into clients.',
      btnProposal: 'Design Gallery',
      btnCertificates: 'Certificates',
      btnTech: 'Technologies'
    }
  };

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.currentLanguage = localStorage.getItem('portfolio-language') || 'es';
      window.addEventListener('portfolio-language-change', this.onLanguageChange);
    }
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('portfolio-language-change', this.onLanguageChange);
    }
  }

  onLanguageChange = (event: any) => {
    this.currentLanguage = event.detail.language;
  };

  getTranslation() {
    return this.translations[this.currentLanguage] || this.translations['es'];
  }

  openTechModal() {
    this.isTechModalOpen = true;
  }

  closeTechModal() {
    this.isTechModalOpen = false;
  }

  openCertModal() {
    this.isCertModalOpen = true;
  }

  closeCertModal() {
    this.isCertModalOpen = false;
    this.previewCertImage = null;
  }

  openFullImage(cert: any) {
    this.previewCertImage = cert.image;
  }
}

