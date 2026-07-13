import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      <!-- Glow effect -->
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div class="max-w-md w-full bg-[#121217] border border-neutral-800 rounded-2xl p-8 shadow-2xl relative z-10">
        <!-- Header -->
        <div class="text-center mb-8">
          <span class="text-xs font-bold tracking-widest text-amber-500 uppercase">Seguridad PortaLink</span>
          <h1 class="text-2xl font-black text-white mt-1">Recuperar Contraseña</h1>
          <p class="text-xs text-neutral-400 mt-2">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>

        <!-- Success Message -->
        <div *ngIf="submitted()" class="py-4 px-5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs text-center mb-6 leading-relaxed">
          ✓ {{ successMsg() }}
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMsg()" class="py-4 px-5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center mb-6">
          ⚠️ {{ errorMsg() }}
        </div>

        <!-- Form -->
        <form (ngSubmit)="onSubmit()" *ngIf="!submitted()" class="space-y-5">
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">
              Correo Electrónico
            </label>
            <input type="email"
                   [(ngModel)]="email"
                   name="email"
                   placeholder="tucorreo@ejemplo.com"
                   required
                   class="w-full p-3.5 rounded-xl bg-[#181820] border border-neutral-800 text-sm text-white focus:outline-none focus:border-amber-500/60 transition-all">
          </div>

          <button type="submit"
                  [disabled]="loading()"
                  class="w-full py-3.5 rounded-xl bg-amber-500 text-black font-bold text-xs uppercase tracking-wider hover:bg-amber-400 transition-all disabled:opacity-50">
            {{ loading() ? 'Enviando instrucciones...' : 'Enviar enlace de recuperación' }}
          </button>
        </form>

        <!-- Footer link -->
        <div class="mt-6 text-center">
          <a routerLink="/login" class="text-xs text-neutral-400 hover:text-white transition-colors">
            ← Volver al inicio de sesión
          </a>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);

  email = '';
  loading = signal(false);
  submitted = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  onSubmit() {
    if (!this.email.trim() || !this.email.includes('@')) {
      this.errorMsg.set('Ingresa un correo electrónico válido.');
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');

    this.authService.forgotPassword(this.email.trim()).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.submitted.set(true);
        this.successMsg.set(res.message);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message || 'Error al solicitar recuperación.');
      }
    });
  }
}
