import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

export interface CookiePreferences {
  essential: boolean;     // Siempre true (técnicas, autenticación, tema)
  functional: boolean;    // RotBot IA, preferencias de chat y personalización
  analytics: boolean;     // Rendimiento y métricas anónimas
  timestamp?: string;
}

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <!-- Floating Bottom Banner (Apple Style Clean Glass) -->
    <div *ngIf="showBanner && !showModal" 
         class="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-[9990] animate-slide-up">
      <div class="p-5 sm:p-6 rounded-[24px] border border-neutral-200/90 bg-white/95 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.14)] flex flex-col gap-4 transition-all duration-300 text-neutral-900">
        
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-neutral-100 border border-neutral-200/80 text-neutral-900 shadow-2xs">
            <svg class="w-5 h-5 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>

          <div class="flex-grow">
            <h4 class="text-sm font-headline font-bold tracking-tight text-neutral-900 flex items-center gap-2 m-0">
              <span>Uso de Cookies y Privacidad</span>
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h4>
            <p class="text-xs font-sans text-neutral-500 mt-1 leading-relaxed m-0">
              Garantizamos el correcto funcionamiento del portal, la experiencia de RotBot IA y la protección de datos en cumplimiento de la Ley 1581 de 2012 y RGPD.
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2 pt-1">
          <button (click)="acceptAll()" 
                  class="flex-1 px-4 py-2.5 rounded-xl font-headline font-semibold text-xs transition-all duration-200 shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-center border-none"
                  style="background-color: #09090b !important; color: #ffffff !important;">
            <span style="color: #ffffff !important; font-weight: 600;">Aceptar Todas</span>
          </button>
          
          <button (click)="acceptEssential()" 
                  class="flex-1 px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-headline font-semibold text-xs border border-neutral-200/80 transition-all duration-200 cursor-pointer text-center">
            Esenciales
          </button>

          <button (click)="openModal()" 
                  class="px-3 py-2.5 rounded-xl text-xs font-headline font-semibold text-neutral-600 hover:text-neutral-900 hover:underline cursor-pointer bg-transparent border-none">
            Configurar
          </button>
        </div>
      </div>
    </div>

    <!-- Complete Legal Cookie Modal -->
    <div *ngIf="showModal" 
         class="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/65 backdrop-blur-2xl animate-fade-in"
         (click)="closeModal()">
      
      <div class="w-full max-w-2xl max-h-[90vh] rounded-[28px] sm:rounded-[36px] border border-neutral-200/90 bg-white shadow-[0_25px_70px_rgba(0,0,0,0.22)] flex flex-col transition-all duration-300 text-neutral-900 overflow-hidden"
           (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-neutral-100 border border-neutral-200/80 flex items-center justify-center text-neutral-900 shadow-2xs">
              <svg class="w-5 h-5 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-headline font-bold tracking-tight text-neutral-900 m-0">Configuración y Política de Cookies</h3>
              <p class="text-xs font-sans text-neutral-500 m-0">PortaLink Soluciones Tecnológicas IA</p>
            </div>
          </div>

          <button (click)="closeModal()" 
                  class="w-9 h-9 rounded-full flex items-center justify-center border border-neutral-200/80 bg-neutral-100 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200 transition-all cursor-pointer">
            ✕
          </button>
        </div>

        <!-- Scrollable Legal Content & Preferences -->
        <div class="p-6 overflow-y-auto custom-scrollbar space-y-6 text-xs text-neutral-600 leading-relaxed font-sans">
          
          <div class="p-4 sm:p-5 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2">
            <h4 class="font-headline font-bold text-neutral-900 text-xs tracking-wide uppercase m-0">1. Protección Legal de Datos (Habeas Data)</h4>
            <p class="m-0">
              En cumplimiento del Artículo 15 de la Constitución Política de Colombia, la <strong>Ley Estatutaria 1581 de 2012</strong>, el Reglamento General de Protección de Datos (<strong>RGPD 2016/679</strong>) y la Directiva ePrivacy, <strong>PortaLink</strong> garantiza el tratamiento transparente y seguro de su información.
            </p>
          </div>

          <!-- Preferences Categories -->
          <div class="space-y-4">
            <h4 class="font-headline font-bold text-neutral-900 text-xs tracking-wide uppercase m-0">2. Categorías de Cookies</h4>

            <!-- Essential Cookies -->
            <div class="p-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/70 flex items-start justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-headline font-bold text-neutral-900 text-xs">Cookies Estrictamente Necesarias</span>
                  <span class="px-2 py-0.5 rounded-full text-[9px] font-headline font-semibold bg-neutral-900 text-white">OBLIGATORIAS</span>
                </div>
                <p class="text-[11px] text-neutral-500 m-0">
                  Imprescindibles para autenticar la sesión (JWT), garantizar la seguridad contra ataques CSRF, mantener la navegación fluida y recordar sus preferencias.
                </p>
              </div>
              <div class="pt-1">
                <input type="checkbox" checked disabled class="w-4 h-4 accent-neutral-900 cursor-not-allowed">
              </div>
            </div>

            <!-- Functional / RotBot AI Cookies -->
            <div class="p-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/70 flex items-start justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-headline font-bold text-neutral-900 text-xs">Funcionalidad y Asistente IA (RotBot)</span>
                  <span class="px-2 py-0.5 rounded-full text-[9px] font-headline font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">RECOMENDADO</span>
                </div>
                <p class="text-[11px] text-neutral-500 m-0">
                  Permiten recordar el estado del chat con RotBot IA, sugerencias personalizadas de proyectos y mantener la continuidad de sus consultas.
                </p>
              </div>
              <div class="pt-1">
                <input type="checkbox" [(ngModel)]="prefFunctional" class="w-4 h-4 accent-neutral-900 cursor-pointer">
              </div>
            </div>

            <!-- Analytics Cookies -->
            <div class="p-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/70 flex items-start justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-headline font-bold text-neutral-900 text-xs">Analítica y Rendimiento</span>
                  <span class="px-2 py-0.5 rounded-full text-[9px] font-headline font-semibold bg-neutral-200 text-neutral-700">ANÓNIMO</span>
                </div>
                <p class="text-[11px] text-neutral-500 m-0">
                  Nos ayudan a entender cómo interactúan los usuarios con las plantillas para optimizar la velocidad y corregir errores técnicos de forma anónima.
                </p>
              </div>
              <div class="pt-1">
                <input type="checkbox" [(ngModel)]="prefAnalytics" class="w-4 h-4 accent-neutral-900 cursor-pointer">
              </div>
            </div>
          </div>

          <!-- Browser Management Legal Text -->
          <div class="space-y-2 pt-2 border-t border-neutral-100">
            <h4 class="font-headline font-bold text-neutral-900 text-xs tracking-wide uppercase m-0">3. Control desde el Navegador</h4>
            <p class="m-0">
              El usuario puede restringir, bloquear o borrar las cookies en cualquier momento a través de la configuración de su navegador (Chrome, Safari, Firefox o Edge).
            </p>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="p-5 border-t border-neutral-100 bg-white flex flex-wrap items-center justify-between gap-3">
          <button (click)="acceptEssential()" 
                  class="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-headline font-semibold text-xs border border-neutral-200/80 transition-all cursor-pointer">
            Rechazar Opcionales
          </button>

          <div class="flex items-center gap-2">
            <button (click)="savePreferences()" 
                    class="px-5 py-2.5 rounded-xl font-headline font-semibold text-xs transition-all shadow-sm cursor-pointer border-none"
                    style="background-color: #09090b !important; color: #ffffff !important;">
              <span style="color: #ffffff !important; font-weight: 600;">Guardar Selección</span>
            </button>

            <button (click)="acceptAll()" 
                    class="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white font-headline font-semibold text-xs transition-all shadow-sm cursor-pointer border-none"
                    style="background-color: #09090b !important; color: #ffffff !important;">
              <span style="color: #ffffff !important; font-weight: 600;">Aceptar Todas</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .animate-slide-up {
      animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes slideUp {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class CookieConsentComponent implements OnInit {
  showBanner = false;
  showModal = false;

  prefFunctional = true;
  prefAnalytics = true;

  ngOnInit() {
    this.checkConsent();

    if (typeof window !== 'undefined') {
      window.addEventListener('open-cookie-settings', () => {
        this.openModal();
      });
    }
  }

  checkConsent() {
    if (typeof localStorage === 'undefined') return;
    const consent = localStorage.getItem('portalink_cookie_consent');
    if (!consent) {
      this.showBanner = true;
    } else {
      try {
        const parsed: CookiePreferences = JSON.parse(consent);
        this.prefFunctional = parsed.functional ?? true;
        this.prefAnalytics = parsed.analytics ?? true;
      } catch (e) {}
    }
  }

  acceptAll() {
    this.saveConsent({
      essential: true,
      functional: true,
      analytics: true
    });
  }

  acceptEssential() {
    this.saveConsent({
      essential: true,
      functional: false,
      analytics: false
    });
  }

  savePreferences() {
    this.saveConsent({
      essential: true,
      functional: this.prefFunctional,
      analytics: this.prefAnalytics
    });
  }

  saveConsent(prefs: CookiePreferences) {
    prefs.timestamp = new Date().toISOString();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('portalink_cookie_consent', JSON.stringify(prefs));
    }
    this.showBanner = false;
    this.showModal = false;
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
}
