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
    <!-- Floating Bottom Banner -->
    <div *ngIf="showBanner && !showModal" 
         class="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-[9990] animate-slide-up">
      <div class="p-5 rounded-2xl border backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-4 transition-all duration-300"
           style="background: rgba(10, 10, 10, 0.92); border-color: rgba(0, 245, 255, 0.25);">
        
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>

          <div class="flex-grow">
            <h4 class="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span>Uso de Cookies y Privacidad</span>
              <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            </h4>
            <p class="text-xs text-white/70 mt-1 leading-relaxed font-light">
              Utilizamos cookies propias y de terceros para garantizar el correcto funcionamiento del portal, personalizar la experiencia del asistente RotBot IA y realizar analítica. Cumplimos con la Ley 1581 de 2012 (Habeas Data) y el RGPD.
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2 pt-1">
          <button (click)="acceptAll()" 
                  class="flex-1 px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-200 shadow-md cursor-pointer text-center">
            Aceptar Todas
          </button>
          
          <button (click)="acceptEssential()" 
                  class="flex-1 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/15 transition-all duration-200 cursor-pointer text-center">
            Solo Esenciales
          </button>

          <button (click)="openModal()" 
                  class="px-3 py-2.5 rounded-xl text-xs font-semibold text-cyan-400 hover:underline cursor-pointer">
            Configurar
          </button>
        </div>
      </div>
    </div>

    <!-- Complete Legal Cookie Modal -->
    <div *ngIf="showModal" 
         class="fixed inset-0 z-[10000] flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in"
         (click)="closeModal()">
      
      <div class="w-full max-w-2xl max-h-[90vh] rounded-3xl border overflow-hidden relative shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col transition-all duration-300"
           (click)="$event.stopPropagation()"
           style="background: #09090b; border-color: rgba(255, 255, 255, 0.15);">
        
        <!-- Header -->
        <div class="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <h3 class="text-base font-extrabold uppercase tracking-wide text-white">Configuración y Política de Cookies</h3>
              <p class="text-xs text-white/50 font-light">PortaLink Soluciones Tecnológicas IA</p>
            </div>
          </div>

          <button (click)="closeModal()" 
                  class="w-8 h-8 rounded-full flex items-center justify-center border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
            ✕
          </button>
        </div>

        <!-- Scrollable Legal Content & Preferences -->
        <div class="p-6 overflow-y-auto custom-scrollbar space-y-6 text-xs text-white/80 leading-relaxed font-light">
          
          <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
            <h4 class="font-bold text-white uppercase text-[11px] tracking-wider text-cyan-400">1. Compromiso de Protección Legal de Datos</h4>
            <p>
              En cumplimiento del Artículo 15 de la Constitución Política de Colombia, la <strong>Ley Estatutaria 1581 de 2012</strong> (Habeas Data), el Reglamento General de Protección de Datos de la UE (<strong>RGPD 2016/679</strong>) y la Directiva ePrivacy, <strong>PortaLink</strong> garantiza el tratamiento transparente, seguro y confidencial de la información recolectada mediante cookies y almacenamiento local.
            </p>
          </div>

          <!-- Preferences Categories -->
          <div class="space-y-4">
            <h4 class="font-bold text-white uppercase text-[11px] tracking-wider text-white/90">2. Gestión de Categorías de Cookies</h4>

            <!-- Essential Cookies -->
            <div class="p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex items-start justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-white text-xs">Cookies Estrictamente Necesarias</span>
                  <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">OBLIGATORIAS</span>
                </div>
                <p class="text-[11px] text-white/60">
                  Imprescindibles para autenticar al usuario (JWT), garantizar la seguridad contra ataques CSRF, mantener la preferencia de tema (claro/oscuro) y navegación fluida. No pueden desactivarse.
                </p>
              </div>
              <div class="pt-1">
                <input type="checkbox" checked disabled class="accent-cyan-400 cursor-not-allowed w-4 h-4">
              </div>
            </div>

            <!-- Functional / RotBot AI Cookies -->
            <div class="p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex items-start justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-white text-xs">Funcionalidad y Asistente IA (RotBot)</span>
                  <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">RECOMENDADO</span>
                </div>
                <p class="text-[11px] text-white/60">
                  Permiten recordar el estado del chat con RotBot IA, sugerencias personalizadas de proyectos y mantener la continuidad de consultas sin perder información.
                </p>
              </div>
              <div class="pt-1">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" [(ngModel)]="prefFunctional" class="sr-only peer">
                  <div class="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-400"></div>
                </label>
              </div>
            </div>

            <!-- Analytics Cookies -->
            <div class="p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex items-start justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-white text-xs">Analítica y Rendimiento</span>
                  <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">ANÓNIMO</span>
                </div>
                <p class="text-[11px] text-white/60">
                  Nos ayudan a entender cómo interactúan los usuarios con las plantillas y servicios para optimizar la velocidad y corregir errores técnicos. No recogen datos identificables.
                </p>
              </div>
              <div class="pt-1">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" [(ngModel)]="prefAnalytics" class="sr-only peer">
                  <div class="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-400"></div>
                </label>
              </div>
            </div>
          </div>

          <!-- Browser Management Legal Text -->
          <div class="space-y-2 pt-2 border-t border-white/10">
            <h4 class="font-bold text-white uppercase text-[11px] tracking-wider text-cyan-400">3. Control y Eliminación desde el Navegador</h4>
            <p>
              El usuario puede en cualquier momento restringir, bloquear o borrar las cookies de PortaLink o de cualquier otra página web utilizando su navegador:
            </p>
            <ul class="list-disc pl-5 space-y-1 text-white/70">
              <li><strong>Chrome:</strong> Configuración ➔ Privacidad y seguridad ➔ Cookies y otros datos de sitios.</li>
              <li><strong>Firefox:</strong> Ajustes ➔ Privacidad & Seguridad ➔ Cookies y datos del sitio.</li>
              <li><strong>Safari:</strong> Preferencias ➔ Privacidad ➔ Bloquear todas las cookies.</li>
              <li><strong>Edge:</strong> Configuración ➔ Permisos del sitio ➔ Cookies y datos del sitio.</li>
            </ul>
          </div>

          <div class="space-y-1 text-[11px] text-white/50 pt-2 border-t border-white/10">
            <p>Para consultas sobre privacidad y ejercicio de derechos ARCO, contáctenos en: <a href="mailto:portalinkmessage@gmail.com" class="text-cyan-400 underline">portalinkmessage&#64;gmail.com</a> o WhatsApp: +57 3054078225.</p>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="p-6 border-t border-white/10 bg-white/[0.02] flex flex-wrap items-center justify-between gap-3">
          <button (click)="acceptEssential()" 
                  class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/15 transition-all cursor-pointer">
            Rechazar Opcionales
          </button>

          <div class="flex items-center gap-2">
            <button (click)="savePreferences()" 
                    class="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer">
              Guardar Mi Selección
            </button>

            <button (click)="acceptAll()" 
                    class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer">
              Aceptar Todas
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

    // Listen for custom event to open preferences modal anytime (e.g. from footer)
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
