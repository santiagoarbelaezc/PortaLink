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
    <div class="min-h-screen bg-white text-neutral-900 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      <!-- Ambient Lighting Backdrop -->
      <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[140px] opacity-35 bg-neutral-200/70"></div>
      </div>

      <div class="max-w-md w-full bg-white/90 backdrop-blur-md border border-neutral-200/90 rounded-[28px] sm:rounded-[36px] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)] relative z-10">
        
        <!-- Header / Logo -->
        <div class="text-center mb-7">
          <div class="flex items-center justify-center gap-1.5 mb-1">
            <span class="text-xl sm:text-2xl font-black tracking-widest text-[#0a0a0a] uppercase font-headline">PORTALINK</span>
          </div>
          <span class="text-[10px] font-bold uppercase tracking-[0.20em] text-neutral-400 block mb-3">Seguridad y Acceso</span>
          <h1 class="text-2xl font-bold font-headline text-neutral-900 tracking-tight m-0">Recuperar Contraseña</h1>
          <p class="text-xs sm:text-sm text-neutral-500 mt-2 font-normal leading-relaxed">
            Ingresa tu correo y te enviaremos un enlace seguro para restablecer tu contraseña.
          </p>
        </div>

        <!-- Success Message -->
        <div *ngIf="submitted()" class="py-4 px-5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs text-center mb-6 leading-relaxed font-medium">
          ✓ {{ successMsg() }}
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMsg()" class="py-4 px-5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs text-center mb-6 font-medium">
          ⚠️ {{ errorMsg() }}
        </div>

        <!-- Form -->
        <form (ngSubmit)="onSubmit()" *ngIf="!submitted()" class="space-y-4">
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-2 font-headline">
              Correo Electrónico
            </label>
            <input type="email"
                   [(ngModel)]="email"
                   name="email"
                   placeholder="tucorreo@ejemplo.com"
                   required
                   class="w-full px-4 py-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/90 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-all shadow-xs">
          </div>

          <button type="submit"
                  [disabled]="loading()"
                  class="w-full py-3.5 px-6 rounded-full font-headline font-semibold text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.99] transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                  style="background-color: #09090b !important; color: #ffffff !important;">
            {{ loading() ? 'Enviando instrucciones...' : 'Enviar enlace de recuperación' }}
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
export class ForgotPasswordComponent {
  private authService = inject(AuthService);

  email = '';
  loading = signal(false);
  submitted = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  onSubmit(): void {
    if (!this.email) return;

    this.loading.set(true);
    this.errorMsg.set('');

    this.authService.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.submitted.set(true);
        this.successMsg.set(res.message || 'Se ha enviado un enlace a tu correo.');
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message || 'Ocurrió un error al procesar tu solicitud.');
      }
    });
  }
}
