import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, tap, of } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginResponse {
  token: string;
  usuario: {
    nombre: string;
    rol: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'portalink_jwt_token';
  private readonly USER_KEY = 'portalink_user';

  // State
  isAuthenticated = signal<boolean>(this.hasToken());
  currentUser = signal<any>(this.getUser());

  constructor() {}

  login(payload: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, payload).pipe(
      tap(res => this.setSession(res.token, res.usuario))
    );
  }

  register(payload: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/register`, payload).pipe(
      tap(res => this.setSession(res.token, res.usuario))
    );
  }

  getCaptcha(): Observable<{ id: string; svg: string }> {
    return this.http.get<{ id: string; svg: string }>(`${environment.apiUrl}/auth/captcha`);
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      window.dispatchEvent(new CustomEvent('auth-change'));
    }
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private setSession(token: string, user: any): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      window.dispatchEvent(new CustomEvent('auth-change'));
    }
    this.isAuthenticated.set(true);
    this.currentUser.set(user);
  }

  getToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  private getUser(): any {
    if (typeof localStorage !== 'undefined') {
      const userStr = localStorage.getItem(this.USER_KEY);
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }

  getTokenExpiry(): number | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      return payload.exp ? payload.exp : null;
    } catch {
      return null;
    }
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/auth/users`);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{message: string}> {
    return this.http.put<{message: string}>(`${environment.apiUrl}/auth/password`, { currentPassword, newPassword });
  }
}
