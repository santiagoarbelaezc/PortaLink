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
    <div class="min-h-screen bg-white text-neutral-900 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      <!-- Ambient Lighting Backdrop -->
      <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[140px] opacity-35 bg-neutral-200/70"></div>
      </div>

      <div class="max-w-md w-full bg-white/90 backdrop-blur-md border border-neutral-200/90 rounded-[28px] sm:rounded-[36px] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)] relative z-10">
        
        <!-- Header -->
        <div class="text-center mb-7">
          <div class="flex items-center justify-center gap-1.5 mb-1">
            <span class="text-xl sm:text-2xl font-black tracking-widest text-[#0a0a0a] uppercase font-headline">PORTALINK</span>
          </div>
          <span class="text-[10px] font-bold uppercase tracking-[0.20em] text-neutral-400 block mb-3">Seguridad de la Cuenta</span>
          <h1 class="text-2xl font-bold font-headline text-neutral-900 tracking-tight m-0">Nueva Contraseña</h1>
          <p class="text-xs sm:text-sm text-neutral-500 mt-2 font-normal leading-relaxed">
            Ingresa tu nueva contraseña para proteger y acceder a tu cuenta.
          </p>
        </div>

        <!-- Success Alert -->
        <div *ngIf="success()" class="py-6 text-center space-y-4">
          <div class="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
            </svg>
          </div>
          <h2 class="text-xl font-bold font-headline text-neutral-900 tracking-tight m-0">¡Contraseña Actualizada!</h2>
          <p class="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
            {{ successMsg() }}
          </p>
          <div class="pt-2">
            <a routerLink="/login"
               class="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-full font-headline font-semibold text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.99] transition-all shadow-sm no-underline cursor-pointer"
               style="background-color: #09090b !important; color: #ffffff !important;">
              <span style="color: #ffffff !important; font-weight: 600;">Iniciar Sesión</span>
            </a>
          </div>
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMsg()" class="py-4 px-5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs text-center mb-6 font-medium">
          ⚠️ {{ errorMsg() }}
        </div>

        <!-- Form -->
        <form (ngSubmit)="onSubmit()" *ngIf="!success()" class="space-y-4">
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-2 font-headline">
              Nueva Contraseña
            </label>
            <input type="password"
                   [(ngModel)]="newPassword"
                   name="newPassword"
                   required
                   minlength="6"
                   placeholder="Mínimo 6 caracteres"
                   class="w-full px-4 py-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/90 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-all shadow-xs">
          </div>

          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-2 font-headline">
              Confirmar Contraseña
            </label>
            <input type="password"
                   [(ngModel)]="confirmPassword"
                   name="confirmPassword"
                   required
                   minlength="6"
                   placeholder="Repite la contraseña"
                   class="w-full px-4 py-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/90 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-all shadow-xs">
          </div>

          <button type="submit"
                  [disabled]="loading()"
                  class="w-full py-3.5 px-6 rounded-full font-headline font-semibold text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.99] transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                  style="background-color: #09090b !important; color: #ffffff !important;">
            {{ loading() ? 'Actualizando contraseña...' : 'Guardar Nueva Contraseña' }}
          </button>
        </form>

        <!-- Footer link -->
        <div class="mt-6 pt-4 border-t border-neutral-100 text-center">
          <a routerLink="/login" class="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-black transition-colors no-underline">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
            </svg>
            <span>Volver al inicio de sesión</span>
          </a>
        </div>

      </div>

      <p class="text-xs text-neutral-400 font-normal mt-6 relative z-10 text-center m-0">
        © 2026 PortaLink. Todos los derechos reservados.
      </p>

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
      this.errorMsg.set('Token de recuperación no válido o ausente.');
    }
  }

  onSubmit(): void {
    if (!this.newPassword || !this.confirmPassword) {
      this.errorMsg.set('Por favor completa todos los campos.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMsg.set('Las contraseñas no coinciden.');
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMsg.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');

    this.authService.resetPassword({ token: this.token, newPassword: this.newPassword }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.success.set(true);
        this.successMsg.set(res.message || 'Tu contraseña ha sido restablecida exitosamente.');
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message || 'El enlace de recuperación es inválido o ha expirado.');
      }
    });
  }
}
