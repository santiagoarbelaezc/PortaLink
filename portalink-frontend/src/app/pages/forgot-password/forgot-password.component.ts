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
    <div class="min-h-screen bg-white text-neutral-900 flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      
      <!-- Ambient Lighting Backdrop -->
      <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[140px] opacity-35 bg-neutral-200/70"></div>
        <div class="absolute -bottom-32 right-1/4 w-[600px] h-[400px] rounded-full blur-[120px] opacity-25 bg-neutral-200/50"></div>
      </div>

      <!-- Main Container Card -->
      <div class="max-w-md w-full bg-white/95 backdrop-blur-md border border-neutral-200/80 rounded-[28px] sm:rounded-[36px] p-7 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.06)] relative z-10 transition-all duration-500">
        
        <!-- Header Back Link -->
        <div class="flex items-center justify-between mb-4 shrink-0">
          <a routerLink="/login" class="inline-flex items-center gap-2 text-xs font-semibold text-neutral-700 hover:text-black transition-colors no-underline cursor-pointer group">
            <span class="w-7 h-7 rounded-full bg-neutral-100 group-hover:bg-neutral-200 flex items-center justify-center transition-colors">
              <svg class="w-3.5 h-3.5 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
              </svg>
            </span>
            <span class="font-semibold text-neutral-800">Volver al inicio de sesión</span>
          </a>
        </div>

        <!-- Title Header Group (Estilo exacto del Login) -->
        <div class="text-center mb-6 space-y-1">
          <h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 m-0">
            Recuperar Contraseña
          </h2>
          <p class="text-xs font-sans text-neutral-500 max-w-xs mx-auto leading-relaxed m-0 pt-1">
            Ingresa tu correo y te enviaremos un enlace seguro para restablecer tu contraseña.
          </p>
        </div>

        <!-- Success Message -->
        <div *ngIf="submitted()" class="py-6 text-center space-y-4 animate-slide-down">
          <div class="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-neutral-900 tracking-tight m-0">
            ¡Enlace Enviado!
          </h2>
          <p class="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed m-0">
            {{ successMsg() }}
          </p>
          <div class="pt-3">
            <a routerLink="/login"
               class="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-full font-semibold text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.99] transition-all shadow-sm no-underline cursor-pointer"
               style="background-color: #09090b !important; color: #ffffff !important;">
              <span style="color: #ffffff !important; font-weight: 600;">Volver a Iniciar Sesión</span>
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="color: #ffffff !important;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMsg()" class="mb-5 flex items-center gap-2.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 animate-shake">
          <svg class="w-4 h-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <span class="font-medium">{{ errorMsg() }}</span>
        </div>

        <!-- Form -->
        <form (ngSubmit)="onSubmit()" *ngIf="!submitted()" class="space-y-4">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-neutral-700">
              Correo Electrónico
            </label>
            <input type="email"
                   [(ngModel)]="email"
                   name="email"
                   placeholder="tucorreo@ejemplo.com"
                   required
                   [disabled]="loading()"
                   class="w-full bg-neutral-50 border border-neutral-200/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-all disabled:opacity-50">
          </div>

          <button type="submit"
                  [disabled]="loading() || !email"
                  class="w-full py-3.5 rounded-full font-semibold text-xs shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 border-none cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
                  style="background-color: #09090b !important; color: #ffffff !important;">
            <span style="color: #ffffff !important; font-weight: 600;">
              {{ loading() ? 'Enviando instrucciones...' : 'Enviar enlace de recuperación' }}
            </span>
          </button>
        </form>

      </div>

      <!-- Footer Note -->
      <p class="text-xs text-neutral-400 font-normal mt-6 relative z-10 text-center m-0">
        © 2026 PortaLink. Todos los derechos reservados.
      </p>

    </div>
  `,
  styles: [`
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-4px); }
      75% { transform: translateX(4px); }
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
    .animate-slide-down { animation: slideDown 0.3s cubic-bezier(0.16,1,0.3,1) forwards; }
  `]
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
