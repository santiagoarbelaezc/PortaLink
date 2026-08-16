import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, delay } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
  designImage?: string;
  showCategorySelector?: boolean;
  showDesignForm?: boolean;
  showInitialActionButtons?: boolean;
  formSubmitted?: boolean;
  formData?: {
    categoryName?: string;
    businessName?: string;
    style?: string;
    description?: string;
  };
}

export interface ChatSendResponse {
  reply: string;
  session_id: number | null;
  remaining_messages: number | null;
  site_generated?: { slug: string; siteData: any } | null;
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
  content: '¡Hola! Soy RotBot IA, tu copiloto en PortaLink. ¿En qué puedo ayudarte hoy? Puedo recomendarte nuestros proyectos web destacados, orientarte en soluciones a medida o compartirte nuestros canales oficiales.',
  showInitialActionButtons: true
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
  isLoadingHistory = signal<boolean>(false);
  remainingMessages = signal<number | null>(null);
  rateLimitEnabled = signal<boolean>(false);
  limitExceeded = signal<boolean>(false);
  userType = signal<'anonymous' | 'user' | 'admin'>('anonymous');
  lastGeneratedSite = signal<{ slug: string; siteData: any } | null>(null);
  chatMode = signal<'design' | 'consulting' | null>(null);
  rotbotActive = signal<boolean>(true);

  // Moderation & Block signals
  isBlocked = signal<boolean>(false);
  blockRemainingSeconds = signal<number>(0);
  private blockTimerInterval: any = null;

  // Pattern detection for explicit content, profanity, vulgarity, and self-harm
  private readonly BLOCKED_PATTERNS: RegExp[] = [
    /\b(suicid(?:io|iar|iat|arme|arse|ate)|autolesi(?:on|onar)|matarm[ee]|quitarme la vida)\b/i,
    /\b(gonorrea|gonorreas|pirobo|pirobos|hijueputa|hijaputa|hpta|hp|puto|puta|putas|putos)\b/i,
    /\b(malparid[oa]s?|maricon|marica|perra|mierda|pendej[oa]s?|cabron|culer[oa]|mamaguev[oa]|sapo)\b/i,
    /\b(pene|penes|vagina|vaginas|ano|tetas|senos|picha|pico|pinga|chimba|polla|chota|semen|cum|porno|sexo)\b/i
  ];

  private _sessionToken: string | null = null;

  constructor() {
    this._sessionToken = this.getOrCreateSessionToken();
    this.loadRotbotStatus().subscribe();
    this.checkStoredBlock();

    if (typeof window !== 'undefined') {
      window.addEventListener('auth-change', () => {
        if (!this.authService.hasToken()) {
          this.clear();
        } else {
          this.loadHistory().subscribe();
          this.loadUsage();
          this.loadRotbotStatus().subscribe();
        }
      });
    }
  }

  /**
   * Verificar si un texto contiene lenguaje explícito o inapropiado.
   */
  isProfaneOrExplicit(text: string): boolean {
    if (!text) return false;
    
    // Normalizar texto eliminando tildes y caracteres especiales de leetspeak
    const normalized = text.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/@/g, 'a')
      .replace(/3/g, 'e')
      .replace(/1/g, 'i')
      .replace(/!/g, 'i')
      .replace(/0/g, 'o')
      .replace(/\$/g, 's')
      .replace(/5/g, 's')
      .replace(/4/g, 'a');

    return this.BLOCKED_PATTERNS.some(pattern => pattern.test(normalized) || pattern.test(text));
  }

  /**
   * Iniciar bloqueo del chat por 1 minuto (60 segundos).
   */
  triggerProfanityBlock(durationSeconds: number = 60): void {
    const expiresAt = Date.now() + (durationSeconds * 1000);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('rotbot_blocked_until', expiresAt.toString());
    }

    this.addMessage(
      'assistant',
      '⚠️ Tu mensaje contiene términos explícitos, groseros o inapropiados. Por políticas de convivencia y respeto, el chat se ha bloqueado temporalmente durante 1 minuto (60s).'
    );

    this.startBlockCountdown(durationSeconds);
  }

  /**
   * Restaurar estado de bloqueo si existe en localStorage al iniciar.
   */
  checkStoredBlock(): void {
    if (typeof localStorage === 'undefined') return;
    const stored = localStorage.getItem('rotbot_blocked_until');
    if (stored) {
      const expiresAt = parseInt(stored, 10);
      const remainingMs = expiresAt - Date.now();
      if (remainingMs > 0) {
        const seconds = Math.ceil(remainingMs / 1000);
        this.startBlockCountdown(seconds);
      } else {
        localStorage.removeItem('rotbot_blocked_until');
      }
    }
  }

  private startBlockCountdown(seconds: number): void {
    if (this.blockTimerInterval) {
      clearInterval(this.blockTimerInterval);
    }

    this.isBlocked.set(true);
    this.blockRemainingSeconds.set(seconds);

    this.blockTimerInterval = setInterval(() => {
      const nextSec = this.blockRemainingSeconds() - 1;
      if (nextSec <= 0) {
        clearInterval(this.blockTimerInterval);
        this.blockTimerInterval = null;
        this.isBlocked.set(false);
        this.blockRemainingSeconds.set(0);
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('rotbot_blocked_until');
        }
        this.addMessage('assistant', '✅ El periodo de suspensión ha finalizado. Puedes continuar conversando con RotBot de forma respetuosa.');
      } else {
        this.blockRemainingSeconds.set(nextSec);
      }
    }, 1000);
  }

  loadRotbotStatus(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/config/settings`).pipe(
      tap(res => {
        const activeVal = res?.settings?.rotbot_active;
        if (activeVal !== undefined && activeVal !== null) {
          this.rotbotActive.set(activeVal === 'true' || activeVal === true);
        } else {
          this.rotbotActive.set(true);
        }
      }),
      catchError(() => of(null))
    );
  }

  updateRotbotStatus(active: boolean): Observable<any> {
    const valueStr = active ? 'true' : 'false';
    return this.http.put<any>(
      `${environment.apiUrl}/config/settings`,
      { settings: { rotbot_active: valueStr } },
      { headers: this.buildHeaders() }
    ).pipe(
      tap(() => this.rotbotActive.set(active))
    );
  }

  /**
   * Enviar mensaje al backend de RotBot y obtener respuesta real de la IA.
   */
  sendMessage(userText: string): void {
    if (!userText.trim()) return;

    if (this.isBlocked()) return;

    if (this.isProfaneOrExplicit(userText)) {
      this.userInput = '';
      this.triggerProfanityBlock(60);
      return;
    }

    this.addMessage('user', userText);
    this.isTyping = true;

    const body: any = {
      message: userText.trim(),
      session_token: this._sessionToken,
      chat_mode: this.chatMode()
    };

    this.http.post<ChatSendResponse>(
      `${environment.apiUrl}/chat/send`,
      body,
      { headers: this.buildHeaders() }
    ).subscribe({
      next: (res) => {
        this.isTyping = false;
        if (res.site_generated) {
          this.lastGeneratedSite.set(res.site_generated);
          try {
            localStorage.setItem('portalink_generated_site', JSON.stringify(res.site_generated.siteData));
          } catch (e) { }
        }
        this.addMessage('assistant', res.reply);
        if (res.remaining_messages !== null && res.remaining_messages !== undefined) {
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

    this.isLoadingHistory.set(true);

    return this.http.get<{ messages: ChatMessage[]; session_id: number | null }>(
      `${environment.apiUrl}/chat/history`,
      { headers: this.buildHeaders() }
    ).pipe(
      delay(800), // Agregado para que se aprecie el skeleton loader (efecto visual)
      tap(res => {
        if (res.messages && res.messages.length > 0) {
          this.messages = [{ ...INITIAL_MESSAGE }, ...res.messages];
        }
        this.isLoadingHistory.set(false);
      }),
      catchError((err) => {
        this.isLoadingHistory.set(false);
        if (err.status === 401 || err.status === 403) {
          this.clear();
        }
        return of({ messages: [], session_id: null });
      })
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
      } else {
        this.limitExceeded.set(false);
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
    const options = {
      headers: this.buildHeaders(),
      body: { session_token: this._sessionToken }
    };

    this.http.request('delete', `${environment.apiUrl}/chat/clear`, options).subscribe({
      next: () => this.clear(),
      error: () => this.clear()
    });

    if (!this.authService.hasToken()) {
      this._sessionToken = this.generateToken();
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(SESSION_TOKEN_KEY, this._sessionToken);
      }
    }
  }

  addMessage(role: 'assistant' | 'user', content: string) {
    this.messages.push({ role, content });
  }

  clear() {
    this.messages = [{ ...INITIAL_MESSAGE }];
    this.isTyping = false;
    this.userInput = '';
    this.limitExceeded.set(false);
    this.lastGeneratedSite.set(null);
    this.chatMode.set(null);
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
