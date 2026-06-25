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

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

        <!-- Chatbot Settings -->
        <div class="rounded-2xl border p-6 space-y-5"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <h3 class="text-sm font-bold uppercase tracking-wide"
              [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Asistente IA</h3>

          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-bold uppercase tracking-widest"
                   [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Nombre del Asistente</label>
            <input type="text" [(ngModel)]="chatbotName"
                   class="px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all"
                   [ngClass]="isDark ? 'bg-neutral-800/60 border-neutral-700 text-white placeholder-neutral-600 focus:border-neutral-500' : 'bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-neutral-400'">
          </div>

          <button (click)="saveChatbotName()"
                  class="w-full py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer"
                  [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-100' : 'bg-neutral-900 text-white hover:bg-neutral-800'">
            Guardar Nombre
          </button>
        </div>

        <!-- Maintenance Mode -->
        <div class="rounded-2xl border p-6 space-y-5"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <h3 class="text-sm font-bold uppercase tracking-wide"
              [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Modo de Mantenimiento</h3>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold" [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">
                {{ maintenanceMode ? 'Activado' : 'Desactivado' }}
              </p>
              <p class="text-xs mt-0.5" [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'">
                Simula cierre temporal del sitio
              </p>
            </div>
            <!-- Toggle switch -->
            <button (click)="maintenanceMode = !maintenanceMode"
                    class="relative w-12 h-6 rounded-full transition-all duration-300 cursor-pointer flex-shrink-0"
                    [ngClass]="maintenanceMode ? 'bg-red-500' : (isDark ? 'bg-neutral-700' : 'bg-neutral-200')">
              <span class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300"
                    [ngClass]="maintenanceMode ? 'left-6' : 'left-0.5'"></span>
            </button>
          </div>

          <div *ngIf="maintenanceMode"
               class="text-xs font-semibold px-3 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
            ⚠ Modo mantenimiento activo — el sitio muestra página de espera
          </div>
        </div>

        <!-- Security -->
        <div class="rounded-2xl border p-6 space-y-5"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <h3 class="text-sm font-bold uppercase tracking-wide"
              [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Seguridad</h3>

          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-bold uppercase tracking-widest"
                   [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Nueva Contraseña (mock)</label>
            <input type="password" [(ngModel)]="newPassword" placeholder="••••••••"
                   class="px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all"
                   [ngClass]="isDark ? 'bg-neutral-800/60 border-neutral-700 text-white placeholder-neutral-600 focus:border-neutral-500' : 'bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-neutral-400'">
          </div>

          <button (click)="savePassword()"
                  class="w-full py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest border transition-all duration-200 cursor-pointer"
                  [ngClass]="isDark ? 'border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500' : 'border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-400'">
            Actualizar Contraseña
          </button>
        </div>

        <!-- Export -->
        <div class="rounded-2xl border p-6 space-y-5"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <h3 class="text-sm font-bold uppercase tracking-wide"
              [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Exportar Configuración</h3>

          <p class="text-sm" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-500'">
            Descarga el archivo <code class="text-xs px-1.5 py-0.5 rounded" [ngClass]="isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-700'">portfolio.json</code> para aplicar cambios permanentes en el sitio.
          </p>

          <button (click)="exportConfig()"
                  class="w-full py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer"
                  [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-100' : 'bg-neutral-900 text-white hover:bg-neutral-800'">
            <svg class="w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Descargar portfolio.json
          </button>
        </div>

      </div>

      <!-- Saved feedback -->
      <div *ngIf="savedMsg" class="fixed bottom-6 right-6 px-5 py-3 rounded-xl text-sm font-bold shadow-xl animate-fade-up z-50"
           [ngClass]="isDark ? 'bg-white text-black' : 'bg-neutral-900 text-white'">
        ✓ {{ savedMsg }}
      </div>
    </div>
  `,
  styles: [`
    .tab-enter { animation: tabEnter 0.25s ease-out forwards; }
    @keyframes tabEnter {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-up { animation: fadeUp 0.3s ease-out forwards; }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class DashConfigComponent {
  @Input() theme = 'dark';
  private configService = inject(PortfolioConfigService);

  chatbotName = localStorage.getItem('portalink_chatbot_name') || 'Rotbot';
  maintenanceMode = false;
  newPassword = '';
  savedMsg = '';

  get isDark() { return this.theme === 'dark'; }

  saveChatbotName() {
    localStorage.setItem('portalink_chatbot_name', this.chatbotName);
    this.showSaved('Nombre del asistente guardado');
  }

  savePassword() {
    if (!this.newPassword.trim()) return;
    // Mock: just clear field and show success
    this.newPassword = '';
    this.showSaved('Contraseña actualizada');
  }

  exportConfig() {
    this.configService.exportJSON();
  }

  private showSaved(msg: string) {
    this.savedMsg = msg;
    setTimeout(() => (this.savedMsg = ''), 2500);
  }
}
