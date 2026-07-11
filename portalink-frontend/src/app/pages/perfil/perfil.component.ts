import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen pt-28 pb-16 flex flex-col items-center justify-center transition-colors duration-500"
         [ngClass]="isDark ? 'bg-[#07070a] text-white' : 'bg-neutral-50 text-neutral-900'">
      
      <!-- Background Decorative Glows -->
      <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div class="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"></div>
        <div class="absolute top-1/2 -right-40 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[150px]"></div>
      </div>

      <!-- Main Profile Card Container -->
      <div class="relative z-10 w-full max-w-lg mx-auto px-4">
        <div class="rounded-3xl border p-8 md:p-10 shadow-2xl backdrop-blur-xl transition-all duration-300 scale-up"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          
          <!-- Title -->
          <div class="text-center mb-8">
            <p class="text-[10px] font-bold uppercase tracking-[0.3em]"
               [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Mi Cuenta</p>
            <h2 class="text-3xl font-bold uppercase tracking-tight mt-1">Perfil de Usuario</h2>
          </div>

          <!-- Avatar Section -->
          <div class="flex flex-col items-center mb-8">
            <div class="relative group">
              <!-- Animated gradient border ring -->
              <div class="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600 via-purple-600 to-indigo-600 blur-[8px] opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
              <!-- Real Avatar -->
              <div class="relative w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-3xl font-extrabold text-white shadow-inner">
                {{ getUserInitials() }}
              </div>
            </div>
            <h3 class="text-xl font-bold mt-4">{{ authService.currentUser()?.nombre }}</h3>
            <span class="text-xs px-3 py-1 rounded-full border mt-1.5 font-semibold capitalize shadow-sm"
                  [ngClass]="isDark ? 'border-neutral-800 bg-neutral-950/60 text-neutral-400' : 'border-neutral-200 bg-neutral-100 text-neutral-600'">
              {{ authService.currentUser()?.rol }}
            </span>
          </div>

          <!-- Info Details Grid -->
          <div class="space-y-4 mb-8">
            <div class="flex justify-between items-center py-3 border-b"
                 [ngClass]="isDark ? 'border-neutral-800/60' : 'border-neutral-100'">
              <span class="text-xs font-bold uppercase tracking-wider opacity-60">Nombre Completo</span>
              <span class="text-sm font-medium">{{ authService.currentUser()?.nombre }}</span>
            </div>
            
            <div class="flex justify-between items-center py-3 border-b"
                 [ngClass]="isDark ? 'border-neutral-800/60' : 'border-neutral-100'">
              <span class="text-xs font-bold uppercase tracking-wider opacity-60">Correo Electrónico</span>
              <span class="text-sm font-medium truncate max-w-[240px]">{{ authService.currentUser()?.email || 'N/A' }}</span>
            </div>

            <div class="flex justify-between items-center py-3 border-b"
                 [ngClass]="isDark ? 'border-neutral-800/60' : 'border-neutral-100'">
              <span class="text-xs font-bold uppercase tracking-wider opacity-60">Tipo de Cuenta</span>
              <span class="text-sm font-medium capitalize">{{ authService.currentUser()?.rol === 'admin' ? 'Administrador' : 'Usuario General' }}</span>
            </div>
          </div>

          <!-- Actions Group -->
          <div class="space-y-3">
            <button [routerLink]="['/configuracion']"
                    class="w-full py-3.5 px-4 rounded-2xl text-xs font-bold uppercase tracking-widest border transition-all duration-200 cursor-pointer text-center hover:bg-neutral-500/10 flex items-center justify-center gap-2"
                    [ngClass]="isDark ? 'border-neutral-800 text-neutral-300' : 'border-neutral-200 text-neutral-700'">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Configuración de Cuenta
            </button>

            <!-- Admin specific action -->
            <button *ngIf="authService.currentUser()?.rol === 'admin'"
                    [routerLink]="['/admin']"
                    class="w-full py-3.5 px-4 rounded-2xl text-xs font-bold uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-500 transition-colors duration-200 cursor-pointer shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Volver al Panel Administrador
            </button>

            <!-- Log Out Button -->
            <button (click)="logout()"
                    class="w-full py-3.5 px-4 rounded-2xl text-xs font-bold uppercase tracking-widest border transition-all duration-200 cursor-pointer text-center border-red-500/30 text-red-500 hover:bg-red-500/5 flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </button>
          </div>

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
export class PerfilComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  get isDark(): boolean {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('portfolio-theme') !== 'light';
    }
    return true;
  }

  getUserInitials(): string {
    const user = this.authService.currentUser();
    if (!user || !user.nombre) return 'U';
    const parts = user.nombre.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return user.nombre[0].toUpperCase();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
