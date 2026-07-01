import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
}

export interface ChatSendResponse {
  reply: string;
  session_id: number | null;
  remaining_messages: number | null;
}

export interface ChatUsageResponse {
  rate_limit_enabled: boolean;
  messages_sent: number;
  limit: number | null;
  remaining: number | null;
  resets_at: string;
}

const INITIAL_MESSAGE: ChatMessage = {
  role: 'assistant',
  content: '¡Hola! Cuéntame qué tipo de sistema tienes en mente, o pregúntame cómo podemos integrar IA en tu próximo proyecto. ¿En qué te puedo ayudar hoy?'
};

const SESSION_TOKEN_KEY = 'rotbot_session_token';

@Injectable({
  providedIn: 'root'
})
export class ChatStateService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  messages: ChatMessage[] = [{ ...INITIAL_MESSAGE }];
  isTyping = false;
  userInput = '';

  // State signals
  remainingMessages = signal<number | null>(null);
  rateLimitEnabled = signal<boolean>(false);
  limitExceeded = signal<boolean>(false);
  userType = signal<'anonymous' | 'user' | 'admin'>('anonymous');

  private _sessionToken: string | null = null;

  constructor() {
    this._sessionToken = this.getOrCreateSessionToken();

    if (typeof window !== 'undefined') {
      window.addEventListener('auth-change', () => {
        if (!this.authService.hasToken()) {
          this.clear();
        } else {
          this.loadHistory().subscribe();
          this.loadUsage();
        }
      });
    }
  }

  /**
   * Enviar mensaje al backend de RotBot y obtener respuesta real de la IA.
   */
  sendMessage(userText: string): void {
    if (!userText.trim()) return;

    this.addMessage('user', userText);
    this.isTyping = true;

    const body: any = { 
      message: userText.trim(),
      session_token: this._sessionToken 
    };

    this.http.post<ChatSendResponse>(
      `${environment.apiUrl}/chat/send`,
      body,
      { headers: this.buildHeaders() }
    ).subscribe({
      next: (res) => {
        this.isTyping = false;
        this.addMessage('assistant', res.reply);
        if (res.remaining_messages !== null) {
          this.remainingMessages.set(res.remaining_messages);
        }
      },
      error: (err) => {
        this.isTyping = false;
        if (err.status === 429) {
          // Límite alcanzado
          if (err.error && typeof err.error === 'object' && err.error.user_type) {
            this.userType.set(err.error.user_type);
          } else if (!this.authService.hasToken()) {
            this.userType.set('anonymous');
          }
          this.limitExceeded.set(true);
        } else {
          this.addMessage('assistant', 'Lo siento, ocurrió un error al procesar tu mensaje. Por favor intenta de nuevo en un momento.');
        }
      }
    });
  }

  /**
   * Cargar historial persistido del usuario logueado.
   */
  loadHistory(): Observable<{ messages: ChatMessage[]; session_id: number | null }> {
    if (!this.authService.hasToken()) {
      return of({ messages: [], session_id: null });
    }

    return this.http.get<{ messages: ChatMessage[]; session_id: number | null }>(
      `${environment.apiUrl}/chat/history`,
      { headers: this.buildHeaders() }
    ).pipe(
      tap(res => {
        if (res.messages && res.messages.length > 0) {
          this.messages = [{ ...INITIAL_MESSAGE }, ...res.messages];
        }
      }),
      catchError(() => of({ messages: [], session_id: null }))
    );
  }

  /**
   * Consultar cuántos mensajes le quedan al usuario.
   */
  loadUsage(): void {
    const params: any = { session_token: this._sessionToken };

    this.http.get<ChatUsageResponse>(
      `${environment.apiUrl}/chat/usage`,
      { headers: this.buildHeaders(), params }
    ).pipe(
      catchError(() => of(null))
    ).subscribe((res: ChatUsageResponse | null) => {
      if (!res) return;
      this.rateLimitEnabled.set(res.rate_limit_enabled);
      if (res.rate_limit_enabled && res.remaining !== null) {
        this.remainingMessages.set(res.remaining);
        this.limitExceeded.set(res.remaining <= 0);
      }
      // Detectar tipo de usuario
      if (this.authService.hasToken()) {
        const user = this.authService.currentUser();
        this.userType.set(user?.rol === 'admin' ? 'admin' : 'user');
      } else {
        this.userType.set('anonymous');
      }
    });

  }

  /**
   * Limpiar historial y empezar nueva conversación.
   */
  clearHistory(): void {
    if (!this.authService.hasToken()) {
      // Para anónimos: solo limpiamos la UI y generamos un nuevo token
      this.clear();
      this._sessionToken = this.generateToken();
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(SESSION_TOKEN_KEY, this._sessionToken);
      }
      return;
    }

    // Para logueados: llamar al backend para crear nueva sesión
    this.http.delete(`${environment.apiUrl}/chat/clear`, {
      headers: this.buildHeaders()
    }).subscribe({
      next: () => this.clear(),
      error: () => this.clear()
    });
  }

  addMessage(role: 'assistant' | 'user', content: string) {
    this.messages.push({ role, content });
  }

  clear() {
    this.messages = [{ ...INITIAL_MESSAGE }];
    this.isTyping = false;
    this.userInput = '';
    this.limitExceeded.set(false);
  }

  dismissLimitModal() {
    this.limitExceeded.set(false);
  }

  private buildHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (token) {
      return new HttpHeaders({ Authorization: `Bearer ${token}` });
    }
    return new HttpHeaders();
  }

  private getOrCreateSessionToken(): string {
    if (typeof sessionStorage === 'undefined') return this.generateToken();
    let token = sessionStorage.getItem(SESSION_TOKEN_KEY);
    if (!token) {
      token = this.generateToken();
      sessionStorage.setItem(SESSION_TOKEN_KEY, token);
    }
    return token;
  }

  private generateToken(): string {
    return 'anon_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}
