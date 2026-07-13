import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      <!-- Glow effect -->
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div class="max-w-md w-full bg-[#121217] border border-neutral-800 rounded-2xl p-8 text-center shadow-2xl relative z-10">
        <!-- Logo -->
        <div class="flex items-center justify-center gap-2 mb-6">
          <span class="text-xl font-black tracking-widest text-white uppercase">PORTALINK</span>
        </div>

        <!-- Estado: Cargando -->
        <div *ngIf="status() === 'loading'" class="py-8">
          <div class="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 class="text-lg font-bold">Verificando tu cuenta...</h2>
          <p class="text-xs text-neutral-400 mt-2">Por favor espera un momento mientras validamos tu enlace.</p>
        </div>

        <!-- Estado: Éxito -->
        <div *ngIf="status() === 'success'" class="py-6">
          <div class="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-5 text-2xl">
            ✓
          </div>
          <h2 class="text-xl font-black text-white">¡Cuenta Verificada!</h2>
          <p class="text-sm text-neutral-400 mt-2 leading-relaxed">
            {{ message() }}
          </p>
          <a routerLink="/login"
             class="mt-8 block w-full py-3.5 rounded-xl bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider hover:bg-cyan-300 transition-all shadow-lg shadow-cyan-400/20">
            Ir a Iniciar Sesión
          </a>
        </div>

        <!-- Estado: Error -->
        <div *ngIf="status() === 'error'" class="py-6">
          <div class="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-5 text-2xl">
            ✕
          </div>
          <h2 class="text-xl font-black text-white">No se pudo verificar</h2>
          <p class="text-sm text-neutral-400 mt-2 leading-relaxed">
            {{ message() }}
          </p>
          <a routerLink="/login"
             class="mt-8 block w-full py-3.5 rounded-xl border border-neutral-700 text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-all">
            Volver al Login
          </a>
        </div>
      </div>
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
