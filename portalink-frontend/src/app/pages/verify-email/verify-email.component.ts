import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-white text-neutral-900 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      <!-- Subtle Ambient Lighting Backdrop -->
      <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[140px] opacity-35 bg-neutral-200/70"></div>
        <div class="absolute -bottom-32 right-1/4 w-[600px] h-[400px] rounded-full blur-[120px] opacity-25 bg-neutral-200/50"></div>
      </div>

      <!-- Main Card Container -->
      <div class="max-w-md w-full bg-white/90 backdrop-blur-md border border-neutral-200/90 rounded-[28px] sm:rounded-[36px] p-8 sm:p-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.06)] relative z-10 transition-all duration-500">
        
        <!-- Header / Logo -->
        <div class="flex flex-col items-center justify-center gap-1.5 mb-6">
          <span class="text-xl sm:text-2xl font-black tracking-widest text-[#0a0a0a] uppercase font-headline">
            PORTALINK
          </span>
          <span class="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-400">
            Verificación de Cuenta
          </span>
        </div>

        <!-- Estado: Cargando -->
        <div *ngIf="status() === 'loading'" class="py-8 space-y-4">
          <div class="w-12 h-12 border-3 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 class="text-xl font-bold text-neutral-900 font-headline tracking-tight m-0">
            Verificando tu cuenta...
          </h2>
          <p class="text-sm text-neutral-500 font-normal leading-relaxed max-w-xs mx-auto m-0">
            Estamos validando tu enlace de seguridad. Esto solo tomará un momento.
          </p>
        </div>

        <!-- Estado: Éxito -->
        <div *ngIf="status() === 'success'" class="py-4 space-y-4">
          <div class="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
            </svg>
          </div>

          <h2 class="text-2xl font-bold text-neutral-900 font-headline tracking-tight m-0">
            ¡Cuenta Verificada!
          </h2>
          
          <p class="text-sm text-neutral-600 font-normal leading-relaxed max-w-xs mx-auto m-0">
            {{ message() || 'Tu dirección de correo electrónico ha sido confirmada con éxito. Ya puedes acceder a todas las funciones de tu cuenta.' }}
          </p>

          <div class="pt-4">
            <a routerLink="/login"
               class="inline-flex items-center justify-center gap-2.5 w-full py-3.5 px-6 rounded-full font-headline font-semibold text-xs uppercase tracking-wider shadow-sm hover:opacity-90 active:scale-[0.99] transition-all no-underline cursor-pointer"
               style="background-color: #09090b !important; color: #ffffff !important;">
              <span style="color: #ffffff !important; font-weight: 600;">Iniciar Sesión</span>
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="color: #ffffff !important;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Estado: Error -->
        <div *ngIf="status() === 'error'" class="py-4 space-y-4">
          <div class="w-16 h-16 rounded-full bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </div>

          <h2 class="text-2xl font-bold text-neutral-900 font-headline tracking-tight m-0">
            No se pudo verificar
          </h2>

          <p class="text-sm text-neutral-600 font-normal leading-relaxed max-w-xs mx-auto m-0">
            {{ message() || 'El enlace de verificación es inválido o ha expirado.' }}
          </p>

          <div class="pt-4 flex flex-col gap-2.5">
            <a routerLink="/login"
               class="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-full font-headline font-semibold text-xs uppercase tracking-wider shadow-sm hover:opacity-90 active:scale-[0.99] transition-all no-underline cursor-pointer"
               style="background-color: #09090b !important; color: #ffffff !important;">
              <span style="color: #ffffff !important; font-weight: 600;">Ir al Inicio de Sesión</span>
            </a>
            <a routerLink="/"
               class="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-full font-headline font-semibold text-xs uppercase tracking-wider text-neutral-700 hover:text-black bg-neutral-100 hover:bg-neutral-200 transition-all no-underline cursor-pointer">
              <span>Volver a la Página Principal</span>
            </a>
          </div>
        </div>

      </div>

      <!-- Bottom Footer Note -->
      <p class="text-xs text-neutral-400 font-normal mt-6 relative z-10 text-center m-0">
        © 2026 PortaLink. Todos los derechos reservados.
      </p>

    </div>
  `
})
export class VerifyEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  status = signal<'loading' | 'success' | 'error'>('loading');
  message = signal<string>('');

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.status.set('error');
      this.message.set('Enlace incompleto o sin token de verificación.');
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: (res) => {
        this.status.set('success');
        this.message.set(res.message || 'Tu cuenta ha sido activada correctamente.');
      },
      error: (err) => {
        this.status.set('error');
        this.message.set(err.error?.message || 'El enlace de verificación expiró o es inválido.');
      }
    });
  }
}
