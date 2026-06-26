import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortfolioConfigService } from '../../../services/portfolio-config.service';

@Component({
  selector: 'app-dash-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 tab-enter">

      <!-- Header -->
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.3em]"
           [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Ajustes del Sistema</p>
        <h2 class="text-4xl font-bold uppercase tracking-tight mt-0.5"
            [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Configuración</h2>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">

        <!-- 1. Preferencias Regionales -->
        <div class="rounded-2xl border p-6 space-y-6 flex flex-col"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <div>
            <h3 class="text-sm font-bold uppercase tracking-wide" [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Preferencias Regionales</h3>
            <p class="text-xs mt-1" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-500'">Configura la moneda, el idioma y el formato de fecha del sistema.</p>
          </div>

          <div class="space-y-4 flex-grow">
            <!-- Moneda -->
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Moneda Preferida</label>
              <select [(ngModel)]="settings.currency" class="px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all cursor-pointer"
                      [ngClass]="isDark ? 'bg-neutral-800/60 border-neutral-700 text-white focus:border-neutral-500' : 'bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-neutral-400'">
                <option value="COP">Peso Colombiano (COP)</option>
                <option value="USD">Dólar Estadounidense (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="MXN">Peso Mexicano (MXN)</option>
              </select>
            </div>
            <!-- Idioma -->
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Idioma del Sistema</label>
              <select [(ngModel)]="settings.language" class="px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all cursor-pointer"
                      [ngClass]="isDark ? 'bg-neutral-800/60 border-neutral-700 text-white focus:border-neutral-500' : 'bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-neutral-400'">
                <option value="es">Español</option>
                <option value="en">Inglés</option>
                <option value="pt">Portugués</option>
              </select>
            </div>
            <!-- Formato Hora -->
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Formato de Hora</label>
              <select [(ngModel)]="settings.timeFormat" class="px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all cursor-pointer"
                      [ngClass]="isDark ? 'bg-neutral-800/60 border-neutral-700 text-white focus:border-neutral-500' : 'bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-neutral-400'">
                <option value="12h">12 Horas (AM/PM)</option>
                <option value="24h">24 Horas</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 2. Notificaciones y Automatización -->
        <div class="rounded-2xl border p-6 space-y-6 flex flex-col"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <div>
            <h3 class="text-sm font-bold uppercase tracking-wide" [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Notificaciones y Automatización</h3>
            <p class="text-xs mt-1" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-500'">Controla las alertas por correo y los ciclos de retroalimentación.</p>
          </div>

          <div class="space-y-5 flex-grow">
            <!-- Recordatorios -->
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-semibold" [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">Recordatorios por correo</p>
                <p class="text-[11px] mt-0.5" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Envía resúmenes semanales a tu correo.</p>
              </div>
              <button (click)="settings.emailReminders = !settings.emailReminders" class="relative w-12 h-6 rounded-full transition-all duration-300 cursor-pointer flex-shrink-0"
                      [ngClass]="settings.emailReminders ? 'bg-green-500' : (isDark ? 'bg-neutral-700' : 'bg-neutral-300')">
                <span class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300" [ngClass]="settings.emailReminders ? 'left-6' : 'left-0.5'"></span>
              </button>
            </div>
            <!-- Feedback loop -->
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-semibold" [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">Ciclo de Retroalimentación</p>
                <p class="text-[11px] mt-0.5" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Pide reseñas automáticas a clientes al pagar.</p>
              </div>
              <button (click)="settings.feedbackLoop = !settings.feedbackLoop" class="relative w-12 h-6 rounded-full transition-all duration-300 cursor-pointer flex-shrink-0"
                      [ngClass]="settings.feedbackLoop ? 'bg-blue-500' : (isDark ? 'bg-neutral-700' : 'bg-neutral-300')">
                <span class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300" [ngClass]="settings.feedbackLoop ? 'left-6' : 'left-0.5'"></span>
              </button>
            </div>
            <!-- Alertas facturas -->
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-semibold" [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">Alertas de Facturas Vencidas</p>
                <p class="text-[11px] mt-0.5" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Notifica al cliente si su factura expiró.</p>
              </div>
              <button (click)="settings.overdueAlerts = !settings.overdueAlerts" class="relative w-12 h-6 rounded-full transition-all duration-300 cursor-pointer flex-shrink-0"
                      [ngClass]="settings.overdueAlerts ? 'bg-red-500' : (isDark ? 'bg-neutral-700' : 'bg-neutral-300')">
                <span class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300" [ngClass]="settings.overdueAlerts ? 'left-6' : 'left-0.5'"></span>
              </button>
            </div>
          </div>
        </div>

        <!-- 3. Asistente IA -->
        <div class="rounded-2xl border p-6 space-y-6 flex flex-col"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <div>
            <h3 class="text-sm font-bold uppercase tracking-wide" [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Asistente de Inteligencia Artificial</h3>
            <p class="text-xs mt-1" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-500'">Personaliza cómo se comunica el bot del portafolio.</p>
          </div>

          <div class="space-y-4 flex-grow">
            <!-- Nombre chatbot -->
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Nombre del Asistente</label>
              <input type="text" [(ngModel)]="settings.chatbotName" placeholder="Ej: Rotbot"
                     class="px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all"
                     [ngClass]="isDark ? 'bg-neutral-800/60 border-neutral-700 text-white placeholder-neutral-600 focus:border-neutral-500' : 'bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-neutral-400'">
            </div>
            <!-- Personalidad -->
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Personalidad del Asistente</label>
              <select [(ngModel)]="settings.assistantPersonality" class="px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all cursor-pointer"
                      [ngClass]="isDark ? 'bg-neutral-800/60 border-neutral-700 text-white focus:border-neutral-500' : 'bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-neutral-400'">
                <option value="formal">Formal y Profesional</option>
                <option value="friendly">Amigable y Cercano</option>
                <option value="concise">Directo y Conciso</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 4. Sistema y Seguridad -->
        <div class="rounded-2xl border p-6 space-y-6 flex flex-col"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <div>
            <h3 class="text-sm font-bold uppercase tracking-wide" [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Sistema y Seguridad</h3>
            <p class="text-xs mt-1" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-500'">Controles de mantenimiento y contraseñas.</p>
          </div>

          <div class="space-y-5 flex-grow">
            <!-- Maintenance Mode -->
            <div class="flex items-center justify-between border-b pb-4" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
              <div>
                <p class="text-sm font-semibold" [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">Modo de Mantenimiento</p>
                <p class="text-[11px] mt-0.5" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Cierra temporalmente el portafolio público.</p>
              </div>
              <button (click)="settings.maintenanceMode = !settings.maintenanceMode" class="relative w-12 h-6 rounded-full transition-all duration-300 cursor-pointer flex-shrink-0"
                      [ngClass]="settings.maintenanceMode ? 'bg-red-500' : (isDark ? 'bg-neutral-700' : 'bg-neutral-300')">
                <span class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300" [ngClass]="settings.maintenanceMode ? 'left-6' : 'left-0.5'"></span>
              </button>
            </div>
            
            <div class="flex flex-col gap-1.5 pt-1">
              <label class="text-[10px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Actualizar Contraseña</label>
              <div class="flex gap-2">
                <input type="password" [(ngModel)]="newPassword" placeholder="Nueva contraseña..."
                       class="flex-grow px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all"
                       [ngClass]="isDark ? 'bg-neutral-800/60 border-neutral-700 text-white placeholder-neutral-600 focus:border-neutral-500' : 'bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-neutral-400'">
                <button (click)="savePassword()" class="px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all cursor-pointer shrink-0"
                        [ngClass]="isDark ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800' : 'border-neutral-300 text-neutral-600 hover:bg-neutral-100'">
                  Cambiar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Acciones Principales -->
        <div class="xl:col-span-2 flex flex-col sm:flex-row gap-4 items-center justify-end mt-4">
          <button (click)="exportConfig()" class="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest border transition-all duration-200 cursor-pointer"
                  [ngClass]="isDark ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800' : 'border-neutral-300 text-neutral-600 hover:bg-neutral-100'">
            Exportar portfolio.json
          </button>
          <button (click)="saveSettings()" class="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer shadow-lg"
                  [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-900 text-white hover:bg-neutral-700'">
            Guardar Configuración
          </button>
        </div>

      </div>

      <!-- Saved feedback -->
      <div *ngIf="savedMsg" class="fixed bottom-6 right-6 px-6 py-4 rounded-2xl text-sm font-bold shadow-2xl animate-fade-up z-50 flex items-center gap-3"
           [ngClass]="isDark ? 'bg-white text-black' : 'bg-neutral-900 text-white'">
        <svg class="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
        {{ savedMsg }}
      </div>
    </div>
  `,
  styles: [`
    .tab-enter { animation: tabEnter 0.25s ease-out forwards; }
    @keyframes tabEnter {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-up { animation: fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
  `]
})
export class DashConfigComponent {
  @Input() theme = 'dark';
  private configService = inject(PortfolioConfigService);

  get isDark() { return this.theme === 'dark'; }

  // Unified settings state
  settings = {
    currency: 'COP',
    language: 'es',
    timeFormat: '12h',
    emailReminders: false,
    feedbackLoop: false,
    overdueAlerts: true,
    chatbotName: 'Rotbot',
    assistantPersonality: 'formal',
    maintenanceMode: false
  };

  newPassword = '';
  savedMsg = '';

  constructor() {
    this.loadSettings();
  }

  loadSettings() {
    const saved = localStorage.getItem('portalink_global_settings');
    if (saved) {
      try {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Error loading settings', e);
      }
    }
  }

  saveSettings() {
    localStorage.setItem('portalink_global_settings', JSON.stringify(this.settings));
    this.showSaved('Configuración global guardada con éxito');
  }

  savePassword() {
    if (!this.newPassword.trim()) return;
    this.newPassword = '';
    this.showSaved('Contraseña actualizada');
  }

  exportConfig() {
    this.configService.exportJSON();
  }

  private showSaved(msg: string) {
    this.savedMsg = msg;
    setTimeout(() => (this.savedMsg = ''), 3000);
  }
}
