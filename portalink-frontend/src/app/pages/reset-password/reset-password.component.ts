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
    <div class="min-h-screen bg-white text-neutral-900 flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      
      <!-- Subtle Ambient Lighting Backdrop -->
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
            Nueva Contraseña
          </h2>
          <p class="text-xs font-sans text-neutral-500 max-w-xs mx-auto leading-relaxed m-0 pt-1">
            Ingresa tu nueva contraseña para proteger y acceder a tu cuenta.
          </p>
        </div>

        <!-- Success Alert -->
        <div *ngIf="success()" class="py-6 text-center space-y-4 animate-slide-down">
          <div class="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
            </svg>
          </div>
          <h2 class="text-xl font-bold font-headline text-neutral-900 tracking-tight m-0">
            ¡Contraseña Actualizada!
          </h2>
          <p class="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed m-0">
            {{ successMsg() }}
          </p>
          <div class="pt-3">
            <a routerLink="/login"
               class="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-full font-headline font-semibold text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.99] transition-all shadow-sm no-underline cursor-pointer"
               style="background-color: #09090b !important; color: #ffffff !important;">
              <span style="color: #ffffff !important; font-weight: 600;">Iniciar Sesión</span>
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
        <form (ngSubmit)="onSubmit()" *ngIf="!success()" class="space-y-4">
          
          <!-- Nueva Contraseña -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-neutral-700">Nueva Contraseña</label>
            <div class="relative">
              <input [type]="showPassword ? 'text' : 'password'"
                     [(ngModel)]="newPassword"
                     name="newPassword"
                     required
                     placeholder="••••••••"
                     [disabled]="loading()"
                     class="w-full bg-neutral-50 border border-neutral-200/80 rounded-xl pl-3.5 pr-10 py-2.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-all disabled:opacity-50">
              
              <button type="button" (click)="showPassword = !showPassword" tabindex="-1" class="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-800 cursor-pointer border-none bg-transparent">
                <svg *ngIf="!showPassword" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                <svg *ngIf="showPassword" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              </button>
            </div>
          </div>

          <!-- Barra de Progreso y Control de Nivel de Seguridad -->
          <div *ngIf="newPassword" class="space-y-2 pt-0.5 pb-1 animate-slide-down">
            <div class="flex items-center justify-between text-[11px]">
              <span class="text-neutral-500 font-medium">Nivel de seguridad:</span>
              <span class="font-semibold text-xs transition-colors duration-300" [ngClass]="strengthTextColor">
                {{ strengthLabel }}
              </span>
            </div>

            <!-- Segmented Progress Bar -->
            <div class="grid grid-cols-4 gap-1.5 h-1.5 w-full">
              <div class="rounded-full transition-all duration-300"
                   [ngClass]="strengthScore >= 1 ? strengthBgColor : 'bg-neutral-200'"></div>
              <div class="rounded-full transition-all duration-300"
                   [ngClass]="strengthScore >= 2 ? strengthBgColor : 'bg-neutral-200'"></div>
              <div class="rounded-full transition-all duration-300"
                   [ngClass]="strengthScore >= 3 ? strengthBgColor : 'bg-neutral-200'"></div>
              <div class="rounded-full transition-all duration-300"
                   [ngClass]="strengthScore >= 4 ? strengthBgColor : 'bg-neutral-200'"></div>
            </div>

            <!-- Checklist de Requisitos de Seguridad -->
            <div class="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-1.5 text-[11px]">
              <!-- 1. Mínimo 6 caracteres -->
              <div class="flex items-center gap-1.5 transition-colors duration-200"
                   [ngClass]="hasMinLength ? 'text-emerald-700 font-medium' : 'text-neutral-400'">
                <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path *ngIf="hasMinLength" stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                  <circle *ngIf="!hasMinLength" cx="12" cy="12" r="3.5" fill="currentColor"/>
                </svg>
                <span>Mínimo 6 caracteres</span>
              </div>

              <!-- 2. Al menos una mayúscula -->
              <div class="flex items-center gap-1.5 transition-colors duration-200"
                   [ngClass]="hasUppercase ? 'text-emerald-700 font-medium' : 'text-neutral-400'">
                <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path *ngIf="hasUppercase" stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                  <circle *ngIf="!hasUppercase" cx="12" cy="12" r="3.5" fill="currentColor"/>
                </svg>
                <span>Una mayúscula (A-Z)</span>
              </div>

              <!-- 3. Al menos un número -->
              <div class="flex items-center gap-1.5 transition-colors duration-200"
                   [ngClass]="hasNumber ? 'text-emerald-700 font-medium' : 'text-neutral-400'">
                <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path *ngIf="hasNumber" stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                  <circle *ngIf="!hasNumber" cx="12" cy="12" r="3.5" fill="currentColor"/>
                </svg>
                <span>Un número (0-9)</span>
              </div>

              <!-- 4. Al menos un carácter especial -->
              <div class="flex items-center gap-1.5 transition-colors duration-200"
                   [ngClass]="hasSpecial ? 'text-emerald-700 font-medium' : 'text-neutral-400'">
                <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path *ngIf="hasSpecial" stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                  <circle *ngIf="!hasSpecial" cx="12" cy="12" r="3.5" fill="currentColor"/>
                </svg>
                <span>Carácter especial (!@#$)</span>
              </div>
            </div>
          </div>

          <!-- Confirmar Contraseña -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-neutral-700">Confirmar Contraseña</label>
            <div class="relative">
              <input [type]="showConfirmPassword ? 'text' : 'password'"
                     [(ngModel)]="confirmPassword"
                     name="confirmPassword"
                     required
                     placeholder="••••••••"
                     [disabled]="loading()"
                     class="w-full bg-neutral-50 border border-neutral-200/80 rounded-xl pl-3.5 pr-10 py-2.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-all disabled:opacity-50">
              
              <button type="button" (click)="showConfirmPassword = !showConfirmPassword" tabindex="-1" class="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-800 cursor-pointer border-none bg-transparent">
                <svg *ngIf="!showConfirmPassword" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                <svg *ngIf="showConfirmPassword" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              </button>
            </div>

            <p *ngIf="confirmPassword && newPassword !== confirmPassword" class="text-[11px] text-rose-600 font-medium m-0 pt-0.5 animate-slide-down">
              Las contraseñas no coinciden.
            </p>
            <p *ngIf="confirmPassword && newPassword === confirmPassword && isPasswordValid" class="text-[11px] text-emerald-600 font-medium m-0 pt-0.5 animate-slide-down">
              ✓ Las contraseñas coinciden correctamente.
            </p>
          </div>

          <!-- Submit Button -->
          <button type="submit"
                  [disabled]="loading() || !isPasswordValid || newPassword !== confirmPassword"
                  class="w-full py-3.5 rounded-full font-semibold text-xs shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 border-none cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
                  style="background-color: #09090b !important; color: #ffffff !important;">
            <span style="color: #ffffff !important; font-weight: 600;">
              {{ loading() ? 'Guardando nueva contraseña...' : 'Guardar Nueva Contraseña' }}
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
export class ResetPasswordComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  token = '';
  newPassword = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;

  loading = signal(false);
  success = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  // Password Security Criteria
  get hasMinLength(): boolean {
    return this.newPassword.length >= 6;
  }

  get hasUppercase(): boolean {
    return /[A-Z]/.test(this.newPassword);
  }

  get hasNumber(): boolean {
    return /[0-9]/.test(this.newPassword);
  }

  get hasSpecial(): boolean {
    return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`!¡¿]/.test(this.newPassword);
  }

  get strengthScore(): number {
    let score = 0;
    if (this.hasMinLength) score++;
    if (this.hasUppercase) score++;
    if (this.hasNumber) score++;
    if (this.hasSpecial) score++;
    return score;
  }

  get isPasswordValid(): boolean {
    return this.hasMinLength && this.hasUppercase && this.hasNumber && this.hasSpecial;
  }

  get strengthLabel(): string {
    switch (this.strengthScore) {
      case 1: return 'Débil';
      case 2: return 'Media';
      case 3: return 'Buena';
      case 4: return 'Fuerte y Segura ✨';
      default: return 'Muy débil';
    }
  }

  get strengthTextColor(): string {
    switch (this.strengthScore) {
      case 1: return 'text-rose-600';
      case 2: return 'text-amber-600';
      case 3: return 'text-blue-600';
      case 4: return 'text-emerald-600';
      default: return 'text-neutral-400';
    }
  }

  get strengthBgColor(): string {
    switch (this.strengthScore) {
      case 1: return 'bg-rose-500';
      case 2: return 'bg-amber-500';
      case 3: return 'bg-blue-500';
      case 4: return 'bg-emerald-500';
      default: return 'bg-neutral-200';
    }
  }

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

    if (!this.isPasswordValid) {
      this.errorMsg.set('La contraseña debe tener al menos 6 caracteres, una mayúscula, un número y un carácter especial.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMsg.set('Las contraseñas no coinciden.');
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
