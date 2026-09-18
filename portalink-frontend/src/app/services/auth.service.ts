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
    email?: string;
    telefono?: string;
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

  private isRedirectingToLogin = false;

  // State
  isAuthenticated = signal<boolean>(this.hasToken());
  currentUser = signal<any>(this.getUser());

  constructor() {
    this.validateSessionOnBoot();
  }

  /** Ensures invalid or expired tokens in localStorage are cleared upon app startup */
  private validateSessionOnBoot(): void {
    const rawToken = this.getRawToken();
    if (rawToken && this.isTokenExpired(rawToken)) {
      this.clearSession(false);
    }
  }

  login(payload: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, payload).pipe(
      tap(res => this.setSession(res.token, res.usuario))
    );
  }

  register(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/register`, payload).pipe(
      tap(res => {
        if (res && res.token && res.usuario) {
          this.setSession(res.token, res.usuario);
        }
      })
    );
  }

  verifyEmail(token: string): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(`${environment.apiUrl}/auth/verify-email?token=${token}`);
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(payload: { token: string; newPassword: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/reset-password`, payload);
  }

  getCaptcha(): Observable<{ id: string; svg: string }> {
    return this.http.get<{ id: string; svg: string }>(`${environment.apiUrl}/auth/captcha`);
  }

  logout(redirect = true, queryParams?: any): void {
    this.clearSession(true);
    if (redirect) {
      this.router.navigate(['/login'], queryParams ? { queryParams } : undefined);
    }
  }

  /** Clears auth state and storage without forcing navigation */
  logoutSilent(): void {
    this.clearSession(true);
  }

  /** Clears token and user state from localStorage and reactive signals */
  clearSession(notify = true): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      if (notify) {
        window.dispatchEvent(new CustomEvent('auth-change'));
      }
    }
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
  }

  /** Handles session expiration with debounced redirection when in protected views */
  handleSessionExpiration(): void {
    this.clearSession(true);
    const currentUrl = this.router.url;

    if (this.isProtectedRoute(currentUrl) && !this.isRedirectingToLogin) {
      this.isRedirectingToLogin = true;
      this.router.navigate(['/login'], {
        queryParams: { expired: '1', returnUrl: currentUrl }
      }).finally(() => {
        setTimeout(() => {
          this.isRedirectingToLogin = false;
        }, 1200);
      });
    }
  }

  isProtectedRoute(url?: string): boolean {
    const checkUrl = url || this.router.url;
    return checkUrl.includes('/admin') || checkUrl.includes('/perfil');
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

  /** Direct read from localStorage without validation */
  getRawToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  /** Returns valid JWT token or null if missing/expired (auto-purges if expired) */
  getToken(): string | null {
    const token = this.getRawToken();
    if (!token) {
      return null;
    }
    if (this.isTokenExpired(token)) {
      this.clearSession(false);
      return null;
    }
    return token;
  }

  /** Checks whether a valid, non-expired token exists */
  hasToken(): boolean {
    return !!this.getToken();
  }

  /** Alias for hasToken with explicit name */
  hasValidToken(): boolean {
    return this.hasToken();
  }

  private getUser(): any {
    if (!this.hasToken()) {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.USER_KEY);
      }
      return null;
    }
    if (typeof localStorage !== 'undefined') {
      const userStr = localStorage.getItem(this.USER_KEY);
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (!user.email || !user.telefono) {
            const token = this.getToken();
            if (token) {
              const parts = token.split('.');
              if (parts.length >= 2) {
                const base64Url = parts[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const decoded = JSON.parse(atob(base64));
                if (decoded) {
                  let updated = false;
                  if (decoded.email && !user.email) {
                    user.email = decoded.email;
                    updated = true;
                  }
                  if (decoded.telefono && !user.telefono) {
                    user.telefono = decoded.telefono;
                    updated = true;
                  }
                  if (updated) {
                    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
                  }
                }
              }
            }
          }
          return user;
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }

  getTokenExpiry(rawToken?: string | null): number | null {
    const token = rawToken !== undefined ? rawToken : this.getRawToken();
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
      return typeof payload.exp === 'number' ? payload.exp : null;
    } catch {
      return null;
    }
  }

  isTokenExpired(rawToken?: string | null): boolean {
    const token = rawToken !== undefined ? rawToken : this.getRawToken();
    if (!token) return true;
    const exp = this.getTokenExpiry(token);
    if (!exp) return true;
    const now = Math.floor(Date.now() / 1000);
    // Buffer de 5 segundos para prevenir condiciones de carrera en tránsito
    return exp <= (now + 5);
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/auth/users`);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{message: string}> {
    return this.http.put<{message: string}>(`${environment.apiUrl}/auth/password`, { currentPassword, newPassword });
  }

  updateProfile(nombre: string, email: string, telefono: string): Observable<LoginResponse> {
    return this.http.put<LoginResponse>(`${environment.apiUrl}/auth/profile`, { nombre, email, telefono }).pipe(
      tap(res => this.setSession(res.token, res.usuario))
    );
  }

  updateUserRole(userId: number, rol: string): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/auth/users/${userId}/role`, { rol });
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/auth/users/${userId}`);
  }
}
