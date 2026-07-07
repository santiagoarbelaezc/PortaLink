import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChatStateService } from '../../services/chat-state.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat-limit-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Backdrop -->
    <div *ngIf="chatService.limitExceeded()"
         class="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4"
         style="backdrop-filter: blur(12px); background: rgba(0,0,0,0.75);"
         (click)="onBackdropClick($event)">

      <!-- Modal Card -->
      <div class="modal-card w-full max-w-sm rounded-3xl p-7 relative overflow-hidden"
           (click)="$event.stopPropagation()">

        <!-- Glow accent top -->
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 rounded-full"
             style="background: linear-gradient(90deg, transparent, var(--accent-color, #00f5ff), transparent); opacity: 0.8;"></div>

        <!-- Icon -->
        <div class="flex justify-center mb-5 relative">
          <div class="w-20 h-20 rounded-2xl flex items-center justify-center p-2"
               style="background: rgba(0,245,255,0.08); border: 1px solid rgba(0,245,255,0.2); box-shadow: 0 0 20px rgba(0,245,255,0.15);">
            <!-- Rotbot Image -->
            <img src="assets/icons/logo-link-dark.png" class="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(0,245,255,0.4)]" alt="Rotbot">
          </div>
        </div>

        <!-- Content: Anonymous user -->
        <ng-container *ngIf="chatService.userType() === 'anonymous'">
          <h3 class="text-xl font-black uppercase text-center tracking-tight mb-2"
              style="color: var(--text-primary, #fff); font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.05em; font-size: 1.5rem;">
            ¡Ups! Límite<br>alcanzado
          </h3>
          <p class="text-center text-sm font-light leading-relaxed mb-6"
             style="color: var(--text-secondary, rgba(255,255,255,0.6));">
            Alcanzaste el número máximo de mensajes. <strong style="color: var(--accent-color, #00f5ff);">Regístrate para más</strong> conversaciones con RotBot IA.
          </p>

          <button (click)="goToRegister()"
                  class="w-full py-3.5 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] mb-3"
                  style="background: var(--accent-color, #00f5ff); color: #000; box-shadow: 0 0 20px rgba(0,245,255,0.3);">
            Crear cuenta gratis
          </button>
          <button (click)="goToLogin()"
                  class="w-full py-3 rounded-2xl font-medium text-sm uppercase tracking-widest transition-all duration-300 hover:opacity-100 opacity-60"
                  style="background: rgba(255,255,255,0.05); color: var(--text-primary, #fff); border: 1px solid rgba(255,255,255,0.1);">
            Ya tengo cuenta
          </button>
        </ng-container>

        <!-- Content: Logged in user (5 messages used) -->
        <ng-container *ngIf="chatService.userType() !== 'anonymous'">
          <h3 class="text-xl font-black uppercase text-center tracking-tight mb-2"
              style="color: var(--text-primary, #fff); font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.05em; font-size: 1.5rem;">
            Límite diario<br>alcanzado
          </h3>
          <p class="text-center text-sm font-light leading-relaxed mb-3"
             style="color: var(--text-secondary, rgba(255,255,255,0.6));">
            Has usado tus 5 mensajes de hoy. Tu límite se renueva en:
          </p>

          <!-- Countdown timer -->
          <div class="flex justify-center gap-3 mb-6">
            <div class="countdown-block">
              <span class="countdown-value">{{ hoursLeft }}</span>
              <span class="countdown-label">h</span>
            </div>
            <div class="countdown-sep">:</div>
            <div class="countdown-block">
              <span class="countdown-value">{{ minutesLeft }}</span>
              <span class="countdown-label">m</span>
            </div>
            <div class="countdown-sep">:</div>
            <div class="countdown-block">
              <span class="countdown-value">{{ secondsLeft }}</span>
              <span class="countdown-label">s</span>
            </div>
          </div>

          <button (click)="goToPlans()"
                  class="w-full py-3.5 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] mb-3"
                  style="background: var(--accent-color, #00f5ff); color: #000; box-shadow: 0 0 20px rgba(0,245,255,0.3);">
            Ver planes
          </button>
          <button (click)="chatService.dismissLimitModal()"
                  class="w-full py-3 rounded-2xl font-medium text-sm uppercase tracking-widest transition-all duration-300 hover:opacity-100 opacity-60"
                  style="background: rgba(255,255,255,0.05); color: var(--text-primary, #fff); border: 1px solid rgba(255,255,255,0.1);">
            Cerrar
          </button>
        </ng-container>

      </div>
    </div>
  `,
  styles: [`
    .modal-card {
      background: rgba(10, 10, 12, 0.97);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0, 245, 255, 0.05);
      animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    :host-context(.theme-light) .modal-card {
      background: rgba(255, 255, 255, 0.98);
      border: 1px solid rgba(0, 0, 0, 0.08);
    }
    @keyframes slideUp {
      from { transform: translateY(24px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .countdown-block {
      display: flex;
      align-items: baseline;
      gap: 2px;
    }
    .countdown-value {
      font-size: 2rem;
      font-weight: 900;
      font-family: 'Bebas Neue', sans-serif;
      letter-spacing: 0.05em;
      color: var(--accent-color, #00f5ff);
      min-width: 2.5ch;
      text-align: center;
    }
    .countdown-label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--text-secondary, rgba(255,255,255,0.4));
    }
    .countdown-sep {
      font-size: 1.8rem;
      font-weight: 900;
      color: var(--accent-color, #00f5ff);
      opacity: 0.5;
      align-self: center;
      margin-bottom: 4px;
    }
  `]
})
export class ChatLimitModalComponent implements OnInit, OnDestroy {
  public chatService = inject(ChatStateService);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoggedIn = false;
  hoursLeft = '00';
  minutesLeft = '00';
  secondsLeft = '00';
  private countdownInterval?: any;

  ngOnInit() {
    if (this.chatService.userType() !== 'anonymous') {
      this.startCountdown();
    }
  }

  ngOnDestroy() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
  }

  startCountdown() {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setDate(midnight.getDate() + 1);
      midnight.setHours(0, 0, 0, 0);

      const diff = midnight.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      this.hoursLeft = String(hours).padStart(2, '0');
      this.minutesLeft = String(minutes).padStart(2, '0');
      this.secondsLeft = String(seconds).padStart(2, '0');
    };

    updateCountdown();
    this.countdownInterval = setInterval(updateCountdown, 1000);
  }

  onBackdropClick(event: Event) {
    if (this.chatService.userType() !== 'anonymous') {
      this.chatService.dismissLimitModal();
    }
  }

  goToRegister() {
    this.chatService.dismissLimitModal();
    this.router.navigate(['/register']);
  }

  goToLogin() {
    this.chatService.dismissLimitModal();
    this.router.navigate(['/login']);
  }

  goToPlans() {
    this.chatService.dismissLimitModal();
    this.router.navigate(['/personalizar']);
  }
}
