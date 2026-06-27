import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-neutral-950 font-sans grid grid-cols-1 lg:grid-cols-12">

      <!-- Left Side (Branding & Robot) -->
      <div class="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-neutral-900 to-black border-r border-neutral-800/50 pt-[88px] lg:col-span-5">
        <!-- Glow background only (Grid removed) -->
        <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.08)_0%,transparent_60%)] pointer-events-none"></div>
        
        <!-- Logo (Top Left) -->
        <div class="relative z-10 px-12 pt-6">
          <div class="flex items-center gap-3 mb-2">
            <img src="assets/icons/logo-link-dark.png" class="w-10 h-10 object-contain" alt="PortaLink">
            <h1 class="text-2xl font-bold uppercase tracking-[0.2em] text-white">PortaLink</h1>
          </div>
          <p class="text-[11px] text-neutral-400 uppercase tracking-[0.3em] font-semibold">Panel Administrativo Avanzado</p>
        </div>

        <!-- Robot Image (Center/Bottom) -->
        <div class="relative z-10 flex-1 flex items-end justify-center px-12 pb-12">
          <div class="relative w-full max-w-[400px]">
            <div class="absolute inset-0 bg-white/5 blur-[100px] rounded-full pointer-events-none"></div>
            <img src="assets/images/rotbot4.png" class="w-full object-contain drop-shadow-2xl animate-float relative z-10" alt="Rotbot">
          </div>
        </div>
      </div>

      <!-- Right Side (Forms) -->
      <div class="flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 relative bg-neutral-950 pt-[100px] lg:pt-[40px] lg:col-span-7">
        <!-- Mobile Logo -->
        <div class="lg:hidden flex flex-col items-center mb-10">
          <img src="assets/icons/logo-link-dark.png" class="w-14 h-14 object-contain mb-4" alt="PortaLink">
          <h1 class="text-xl font-bold uppercase tracking-[0.2em] text-white">PortaLink</h1>
        </div>

        <div class="w-full max-w-[500px] mx-auto">
          <div class="mb-10 text-left">
            <h2 class="text-2xl md:text-3xl font-bold text-white uppercase leading-[1.2] tracking-[0.05em] mb-4" style="font-family: var(--font-headline, sans-serif);">
              Ingresa con nosotros o regístrate para tener descuentos especiales
            </h2>
            <p class="text-[10px] md:text-xs text-neutral-400 uppercase tracking-[0.3em] font-semibold">
              Empieza a personalizar tu sitio con nosotros
            </p>
          </div>

          <!-- Switch Tabs -->
          <div class="grid grid-cols-2 gap-1 p-1 rounded-2xl border mb-8 relative border-neutral-800 bg-neutral-900/40">
            <!-- Sliding background indicator -->
            <div class="absolute top-1 bottom-1 rounded-xl transition-all duration-300 ease-out bg-neutral-800 shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                 [style.width]="'calc(50% - 4px)'"
                 [style.left]="activeTab === 'login' ? '4px' : 'calc(50% + 0px)'">
            </div>

            <button type="button" (click)="switchTab('login')" 
                    class="py-3 text-[11px] uppercase font-bold tracking-wider rounded-xl transition-all duration-300 cursor-pointer relative z-10"
                    [ngClass]="activeTab === 'login' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'">
              Ingresar
            </button>
            <button type="button" (click)="switchTab('register')" 
                    class="py-3 text-[11px] uppercase font-bold tracking-wider rounded-xl transition-all duration-300 cursor-pointer relative z-10"
                    [ngClass]="activeTab === 'register' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'">
              Registrarse
            </button>
          </div>

          <!-- Messages (Error / Success) -->
          <div *ngIf="error" class="mb-6 flex items-center gap-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3.5 animate-shake">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <span class="font-medium">{{ error }}</span>
          </div>
          
          <div *ngIf="successMsg" class="mb-6 flex items-center gap-3 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3.5 animate-slide-down">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="font-medium">{{ successMsg }}</span>
          </div>

          <!-- Slider Container -->
          <div class="relative overflow-hidden w-full">
            <div class="flex w-[200%] transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
                 [style.transform]="activeTab === 'login' ? 'translateX(0)' : 'translateX(-50%)'">
              
              <!-- Login Form Container (1/2 width of 200% = 100% of parent) -->
              <div class="w-1/2 px-1">
                <form (submit)="login($event)" class="space-y-5">
                  <!-- Email -->
                  <div class="space-y-2.5">
                    <label class="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Correo Electrónico</label>
                    <div class="relative group">
                      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-blue-400 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path></svg>
                      </div>
                      <input type="email"
                             [(ngModel)]="email" name="email"
                             placeholder="admin@portalink.com"
                             [disabled]="isLoading()"
                             class="w-full bg-neutral-950/60 border border-neutral-800 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all duration-300 disabled:opacity-50">
                    </div>
                  </div>

                  <!-- Password -->
                  <div class="space-y-2.5">
                    <div class="flex justify-between items-center">
                      <label class="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Contraseña</label>
                      <a href="#" class="text-[10px] text-neutral-500 hover:text-white transition-colors">¿Olvidaste tu contraseña?</a>
                    </div>
                    <div class="relative group">
                      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-blue-400 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                      </div>
                      <input type="password"
                             [(ngModel)]="password" name="password"
                             placeholder="••••••••••"
                             [disabled]="isLoading()"
                             class="w-full bg-neutral-950/60 border border-neutral-800 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all duration-300 disabled:opacity-50">
                    </div>
                  </div>

                  <!-- Submit Login -->
                  <button type="submit"
                          [disabled]="isLoading()"
                          class="w-full py-3.5 mt-4 rounded-xl bg-white hover:bg-neutral-200 text-black text-[12px] font-bold uppercase tracking-widest active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]">
                    <svg *ngIf="isLoading()" class="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ isLoading() ? 'Autenticando...' : 'Acceder al Panel' }}
                  </button>
                </form>
              </div>

              <!-- Register Form Container (1/2 width) -->
              <div class="w-1/2 px-1">
                <form (submit)="register($event)" class="space-y-4">
                  <!-- Name -->
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Nombre Completo</label>
                    <div class="relative group">
                      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-blue-400 transition-colors">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                      </div>
                      <input type="text"
                             [(ngModel)]="registerName" name="registerName"
                             placeholder="Tu nombre"
                             [disabled]="isLoading()"
                             class="w-full bg-neutral-950/60 border border-neutral-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all duration-300 disabled:opacity-50">
                    </div>
                  </div>

                  <!-- Email -->
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Correo Electrónico</label>
                    <div class="relative group">
                      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-blue-400 transition-colors">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      </div>
                      <input type="email"
                             [(ngModel)]="registerEmail" name="registerEmail"
                             placeholder="correo@ejemplo.com"
                             [disabled]="isLoading()"
                             class="w-full bg-neutral-950/60 border border-neutral-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all duration-300 disabled:opacity-50">
                    </div>
                  </div>

                  <!-- Passwords Grid -->
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                      <label class="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Contraseña</label>
                      <div class="relative group">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-blue-400 transition-colors">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        </div>
                        <input type="password"
                               [(ngModel)]="registerPassword" name="registerPassword"
                               placeholder="••••••••"
                               [disabled]="isLoading()"
                               class="w-full bg-neutral-950/60 border border-neutral-800 rounded-xl pl-9 pr-3 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all duration-300 disabled:opacity-50">
                      </div>
                    </div>
                    <div class="space-y-2">
                      <label class="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Confirmar</label>
                      <div class="relative group">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-blue-400 transition-colors">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        </div>
                        <input type="password"
                               [(ngModel)]="registerConfirmPassword" name="registerConfirmPassword"
                               placeholder="••••••••"
                               [disabled]="isLoading()"
                               class="w-full bg-neutral-950/60 border border-neutral-800 rounded-xl pl-9 pr-3 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all duration-300 disabled:opacity-50">
                      </div>
                    </div>
                  </div>

                  <!-- Submit Register -->
                  <button type="submit"
                          [disabled]="isLoading()"
                          class="w-full py-3.5 mt-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-[12px] font-bold uppercase tracking-widest active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]">
                    <svg *ngIf="isLoading()" class="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ isLoading() ? 'Registrando...' : 'Crear Cuenta' }}
                  </button>
                </form>
              </div>

            </div>
          </div>
          
          <p class="text-center text-[10px] text-neutral-600 mt-14 uppercase tracking-widest font-semibold">
            &copy; 2026 PortaLink. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-4px); }
      75% { transform: translateX(4px); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-12px); }
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-slide-down { animation: slideDown 0.3s cubic-bezier(0.16,1,0.3,1) forwards; }
  `]
})
export class LoginComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  activeTab: 'login' | 'register' = 'login';

  // Login
  email = '';
  password = '';
  
  // Register
  registerName = '';
  registerEmail = '';
  registerPassword = '';
  registerConfirmPassword = '';

  error = '';
  successMsg = '';
  isLoading = signal<boolean>(false);

  switchTab(tab: 'login' | 'register') {
    this.activeTab = tab;
    this.error = '';
    this.successMsg = '';
  }

  login(event: Event) {
    event.preventDefault();
    if (!this.email || !this.password) {
      this.showError('Por favor ingresa correo y contraseña.');
      return;
    }

    this.isLoading.set(true);
    this.error = '';
    this.successMsg = '';

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.isLoading.set(false);
        const message = err.error?.message || 'Error al conectar con el servidor. Intenta de nuevo.';
        this.showError(message);
      }
    });
  }

  register(event: Event) {
    event.preventDefault();
    
    if (!this.registerName || !this.registerEmail || !this.registerPassword || !this.registerConfirmPassword) {
      this.showError('Por favor completa todos los campos.');
      return;
    }

    if (this.registerPassword !== this.registerConfirmPassword) {
      this.showError('Las contraseñas no coinciden.');
      return;
    }

    this.isLoading.set(true);
    this.error = '';
    this.successMsg = '';

    // Simular registro exitoso ya que no hay endpoint explícito documentado
    setTimeout(() => {
      this.isLoading.set(false);
      this.successMsg = '¡Cuenta creada exitosamente! Por favor inicia sesión.';
      
      setTimeout(() => {
        this.email = this.registerEmail; // Prellenar correo
        this.registerName = '';
        this.registerEmail = '';
        this.registerPassword = '';
        this.registerConfirmPassword = '';
        this.switchTab('login');
      }, 1500);
      
    }, 1200);
  }

  private showError(msg: string) {
    this.error = msg;
    setTimeout(() => (this.error = ''), 4000);
  }
}
