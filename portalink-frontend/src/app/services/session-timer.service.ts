import { Injectable, inject, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SessionTimerService implements OnDestroy {
  private authService = inject(AuthService);
  private timerInterval: any;

  sessionTimeLeft$ = new BehaviorSubject<number>(0);
  sessionExpired$ = new Subject<void>();

  constructor() {
    this.start();
  }

  start(): void {
    this.stop();
    this.checkSession();
    this.timerInterval = setInterval(() => {
      this.checkSession();
    }, 1000);
  }

  stop(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private checkSession(): void {
    if (!this.authService.hasToken()) {
      this.sessionTimeLeft$.next(0);
      return;
    }

    const exp = this.authService.getTokenExpiry();
    if (!exp) {
      this.sessionTimeLeft$.next(0);
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const timeLeft = exp - now;

    if (timeLeft <= 0) {
      this.sessionTimeLeft$.next(0);
      this.stop();
      this.authService.logout();
      this.sessionExpired$.next();
    } else {
      this.sessionTimeLeft$.next(timeLeft);
    }
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
