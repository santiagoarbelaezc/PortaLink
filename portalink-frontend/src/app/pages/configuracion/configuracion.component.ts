import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen pt-28 pb-16 flex flex-col items-center justify-center transition-colors duration-500"
         [ngClass]="isDark ? 'bg-[#07070a] text-white' : 'bg-neutral-50 text-neutral-900'">
      
      <!-- Background Decorative Glows -->
      <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div class="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]"></div>
        <div class="absolute bottom-10 -left-40 w-[450px] h-[450px] bg-blue-500/10 rounded-full blur-[150px]"></div>
      </div>

      <!-- Main Config Card Container -->
      <div class="relative z-10 w-full max-w-lg mx-auto px-4">
        <div class="rounded-3xl border p-8 md:p-10 shadow-2xl backdrop-blur-xl transition-all duration-300 scale-up"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          
          <!-- Back Link -->
          <a [routerLink]="['/perfil']" 
             class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-6 cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Perfil
          </a>

          <!-- Title -->
          <div class="mb-8">
            <p class="text-[10px] font-bold uppercase tracking-[0.3em]"
               [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Seguridad</p>
            <h2 class="text-3xl font-bold uppercase tracking-tight mt-1">Configuración</h2>
          </div>

          <!-- Alert Messages -->
          <div *ngIf="successMessage" 
               class="mb-6 p-4 rounded-xl border text-xs font-semibold bg-green-500/10 border-green-500/20 text-green-400 flex items-center gap-2">
            <span>✅</span> {{ successMessage }}
          </div>
          <div *ngIf="errorMessage" 
               class="mb-6 p-4 rounded-xl border text-xs font-semibold bg-red-500/10 border-red-500/20 text-red-400 flex items-center gap-2">
            <span>⚠️</span> {{ errorMessage }}
          </div>

          <!-- Password Form -->
          <form (submit)="onSubmit()" class="space-y-5">
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
                    [disabled]="submitting"
                    class="w-full py-3.5 px-4 rounded-2xl text-xs font-bold uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-500 transition-colors duration-200 cursor-pointer shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50">
              {{ submitting ? 'Guardando...' : 'Actualizar Contraseña' }}
            </button>
          </form>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .scale-up {
      animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    @keyframes scaleUp {
      from { transform: scale(0.96); opacity: 0; }
      to   { transform: scale(1); opacity: 1; }
    }
  `]
})
export class ConfiguracionComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  // Form Fields
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  // UI state
  submitting = false;
  successMessage = '';
  errorMessage = '';

  get isDark(): boolean {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('portfolio-theme') !== 'light';
    }
    return true;
  }

  onSubmit() {
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

    this.submitting = true;
    this.authService.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: (res) => {
        this.submitting = false;
        this.successMessage = 'Contraseña actualizada exitosamente.';
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        
        // Redirección al perfil tras 2 segundos
        setTimeout(() => {
          this.router.navigate(['/perfil']);
        }, 2000);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.message || 'Error al intentar actualizar la contraseña.';
      }
    });
  }
}
