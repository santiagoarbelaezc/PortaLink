import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      <!-- Glow effect -->
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div class="max-w-md w-full bg-[#121217] border border-neutral-800 rounded-2xl p-8 shadow-2xl relative z-10">
        <!-- Header -->
        <div class="text-center mb-8">
          <span class="text-xs font-bold tracking-widest text-cyan-400 uppercase">Seguridad PortaLink</span>
          <h1 class="text-2xl font-black text-white mt-1">Nueva Contraseña</h1>
          <p class="text-xs text-neutral-400 mt-2">
            Ingresa tu nueva contraseña para proteger tu cuenta.
          </p>
        </div>

        <!-- Success Alert -->
        <div *ngIf="success()" class="py-6 text-center">
          <div class="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-5 text-2xl">
            ✓
          </div>
          <h2 class="text-xl font-bold text-white">¡Contraseña Actualizada!</h2>
          <p class="text-xs text-neutral-400 mt-2">
            {{ successMsg() }}
          </p>
          <a routerLink="/login"
             class="mt-6 block w-full py-3.5 rounded-xl bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider hover:bg-cyan-300 transition-all">
            Iniciar Sesión
          </a>
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMsg()" class="py-4 px-5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center mb-6">
          ⚠️ {{ errorMsg() }}
        </div>

        <!-- Form -->
        <form (ngSubmit)="onSubmit()" *ngIf="!success()" class="space-y-5">
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">
              Nueva Contraseña
            </label>
            <input type="password"
                   [(ngModel)]="newPassword"
                   name="newPassword"
                   required
                   minlength="6"
                   placeholder="Mínimo 6 caracteres"
                   class="w-full p-3.5 rounded-xl bg-[#181820] border border-neutral-800 text-sm text-white focus:outline-none focus:border-cyan-400/60 transition-all">
          </div>

          <div>
            <label class="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">
              Confirmar Contraseña
            </label>
            <input type="password"
                   [(ngModel)]="confirmPassword"
                   name="confirmPassword"
                   required
                   placeholder="Repite tu contraseña"
                   class="w-full p-3.5 rounded-xl bg-[#181820] border border-neutral-800 text-sm text-white focus:outline-none focus:border-cyan-400/60 transition-all">
          </div>

          <button type="submit"
                  [disabled]="loading()"
                  class="w-full py-3.5 rounded-xl bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider hover:bg-cyan-300 transition-all disabled:opacity-50">
            {{ loading() ? 'Restableciendo...' : 'Guardar Nueva Contraseña' }}
          </button>
        </form>
      </div>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  token = '';
  newPassword = '';
  confirmPassword = '';

  loading = signal(false);
  success = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.errorMsg.set('Enlace incompleto o sin token de recuperación.');
    }
  }

  onSubmit() {
    if (!this.token) {
      this.errorMsg.set('Token ausente o enlace no válido.');
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMsg.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMsg.set('Las contraseñas no coinciden.');
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');

    this.authService.resetPassword({
      token: this.token,
      newPassword: this.newPassword
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.success.set(true);
        this.successMsg.set(res.message);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message || 'Error al restablecer contraseña.');
      }
    });
  }
}
