import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-neutral-950 flex items-center justify-center relative overflow-hidden font-sans">

      <!-- Grid background -->
      <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>
      <!-- Radial glow center -->
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04)_0%,transparent_65%)] pointer-events-none"></div>

      <!-- Rotbot decorativo fondo -->
      <div class="absolute bottom-0 right-0 opacity-[0.06] pointer-events-none select-none">
        <img src="assets/images/rotbot4.png" class="h-[420px] object-contain object-bottom" alt="">
      </div>

      <!-- Card de login -->
      <div class="relative z-10 w-full max-w-[400px] px-6">

        <!-- Logo -->
        <div class="flex flex-col items-center mb-10">
          <div class="relative mb-5">
            <img src="assets/icons/mi-logo2.png" class="w-14 h-14 object-contain" alt="PortaLink">
          </div>
          <h1 class="text-2xl font-bold uppercase tracking-[0.2em] text-white">PortaLink</h1>
          <p class="text-[11px] text-neutral-500 mt-1.5 uppercase tracking-[0.3em] font-semibold">Panel Administrativo</p>
        </div>

        <!-- Form Card -->
        <div class="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
          <div class="mb-6">
            <h2 class="text-base font-bold text-white tracking-wide">Iniciar Sesión</h2>
            <p class="text-xs text-neutral-500 mt-1">Ingresa tus credenciales para continuar</p>
          </div>

          <form (submit)="login($event)" class="space-y-4">

            <!-- Email -->
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Usuario</label>
              <input type="text"
                     [(ngModel)]="username" name="username"
                     placeholder="admin"
                     class="w-full bg-neutral-800/70 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-all duration-200">
            </div>

            <!-- Password -->
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Contraseña</label>
              <input type="password"
                     [(ngModel)]="password" name="password"
                     placeholder="••••••••••"
                     class="w-full bg-neutral-800/70 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-all duration-200">
            </div>

            <!-- Error -->
            <div *ngIf="error"
                 class="flex items-center gap-2 text-sm text-red-400 bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 animate-shake">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              {{ error }}
            </div>

            <!-- Submit -->
            <button type="submit"
                    class="w-full py-3 mt-2 rounded-xl bg-white text-black text-sm font-bold uppercase tracking-widest hover:bg-neutral-100 active:scale-[0.98] transition-all duration-200 cursor-pointer">
              Acceder al Panel
            </button>

          </form>
        </div>

        <!-- Footer -->
        <p class="text-center text-[10px] text-neutral-700 mt-6 uppercase tracking-widest">
          PortaLink · Sistema de Gestión Privado
        </p>
      </div>
    </div>
  `,
  styles: [`
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-4px); }
      75% { transform: translateX(4px); }
    }
    .animate-shake { animation: shake 0.3s ease-in-out; }
  `]
})
export class LoginComponent {
  private router = inject(Router);

  username = '';
  password = '';
  error = '';

  login(event: Event) {
    event.preventDefault();
    if (this.username.trim() === 'admin' && this.password === 'portalink2025') {
      localStorage.setItem('portalink_admin_auth', 'true');
      this.router.navigate(['/admin']);
    } else {
      this.error = 'Credenciales incorrectas. Intenta de nuevo.';
      setTimeout(() => (this.error = ''), 3500);
    }
  }
}
