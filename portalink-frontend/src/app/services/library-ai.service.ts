import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { QuizData, normalizeQuizData } from '../components/dashboard/dash-library/quiz.utils';

@Injectable({
  providedIn: 'root'
})
export class LibraryAiService {
  private http = inject(HttpClient);

  private readonly API_ENDPOINT = `${environment.apiUrl}/admin/chat`;

  /**
   * Enmascara en el navegador (Client-Side DLP) cualquier credencial, .env, contraseña, token JWT
   * o llave privada de la pizarra antes de que viaje por la red hacia el backend o la IA.
   */
  public redactSecretsClientSide(text?: string): string {
    if (!text) return '';
    let redacted = text;

    // 1. Claves privadas PEM / SSH
    redacted = redacted.replace(
      /-----BEGIN [A-Z0-9\s]*PRIVATE KEY-----[\s\S]*?-----END [A-Z0-9\s]*PRIVATE KEY-----/gi,
      '[PRIVATE_KEY_REDACTED]'
    );

    // 2. Variables .env y asignaciones con nombres sensibles
    redacted = redacted.replace(
      /\b([A-Z0-9_]*(?:PASS|PASSWORD|PWD|SECRET|KEY|TOKEN|AUTH|CREDENTIAL|PRIVATE|HASH|SALT|DSN|CLOUDINARY_URL|DATABASE_URL|SMTP_PASS|CONTRASENA|CLAVE)[A-Z0-9_]*)\s*([:=])\s*("[^"\r\n]*"|'[^'\r\n]*'|[^\s#"'\r\n,;]+)/gi,
      (full, varName, sep, val) => {
        const cleanVal = String(val || '').trim().replace(/^["']|["']$/g, '').toLowerCase();
        if (!cleanVal || ['null', 'true', 'false', 'none', 'primary', 'foreign', 'unique', 'index'].includes(cleanVal) || cleanVal.includes('secret_redacted')) {
          return full;
        }
        return `${varName}${sep}[SECRET_REDACTED]`;
      }
    );

    // 3. Cabeceras y comandos CLI con secretos
    redacted = redacted.replace(
      /\b(Authorization\s*:\s*Bearer|xi-api-key\s*:|X-goog-api-key\s*:|sshpass\s+-p)\s+([^\s"'\r\n]+)/gi,
      '$1 [SECRET_REDACTED]'
    );

    // 4. URLs de conexión con credenciales
    redacted = redacted.replace(
      /((?:mysql|pgsql|postgres|postgresql|mongodb(?:\+srv)?|redis|rediss|amqp|ftp|sftp|cloudinary):\/\/[^:\s/]+:)([^@\s/]+)(@)/gi,
      '$1[SECRET_REDACTED]$3'
    );

    // 5. Tokens JWT
    redacted = redacted.replace(
      /\beyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{16,}\b/g,
      '[JWT_TOKEN_REDACTED]'
    );

    // 6. Patrones de API Keys (Groq, Gemini, OpenAI, Anthropic, GitHub, GitLab, Stripe, Slack)
    redacted = redacted.replace(
      /\b(?:sk-(?:proj-|ant-)?[A-Za-z0-9_-]{20,}|(?:sk|rk)_live_[A-Za-z0-9]{20,}|gsk_[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{30,}|gh[pousr]_[A-Za-z0-9]{25,}|github_pat_[A-Za-z0-9_]{25,}|glpat-[A-Za-z0-9_-]{20,}|xox[baprs]-[A-Za-z0-9-]{15,})\b/g,
      '[API_KEY_REDACTED]'
    );

    return redacted;
  }

  private sanitizeHistoryClientSide(history: any[] = []): any[] {
    if (!Array.isArray(history)) return [];
    return history.map(msg => ({
      ...msg,
      content: typeof msg?.content === 'string' ? this.redactSecretsClientSide(msg.content) : ''
    }));
  }

  /**
   * Transforms or enhances a single block of content using backend PHP ChatAdminController (Groq AI)
   */
  transformBlockContent(content: string, blockType: string, instruction: string): Observable<{ success: boolean; result: string; error?: string }> {
    const payload = {
      mode: 'transform_block',
      content: this.redactSecretsClientSide(content),
      block_type: blockType,
      instruction: this.redactSecretsClientSide(instruction)
    };

    return this.http.post<any>(this.API_ENDPOINT, payload).pipe(
      map(res => {
        if (res && res.success) {
          return { success: true, result: (res.result || '').trim() };
        } else {
          return { success: false, result: '', error: res?.error || 'Error procesando solicitud.' };
        }
      }),
      catchError(err => {
        console.error('Error enviando solicitud a backend PHP AI:', err);
        return of({
          success: false,
          result: '',
          error: err?.error?.error || err?.message || 'No se pudo conectar con el servidor backend de IA.'
        });
      })
    );
  }

  /**
   * General Copilot for Notes / Library study assistant powered exclusively by Google Gemini API via backend PHP ChatAdminController
   */
  askCopilot(prompt: string, noteTitle?: string, history: any[] = [], noteContent?: string): Observable<{ success: boolean; result: string; error?: string }> {
    const payload = {
      mode: 'copilot',
      prompt: this.redactSecretsClientSide(prompt),
      note_title: this.redactSecretsClientSide(noteTitle),
      note_content: this.redactSecretsClientSide(noteContent),
      history: this.sanitizeHistoryClientSide(history)
    };

    return this.http.post<any>(this.API_ENDPOINT, payload).pipe(
      map(res => {
        if (res && res.success) {
          return { success: true, result: (res.result || '').trim() };
        } else {
          return { success: false, result: '', error: res?.error || 'Error del copiloto.' };
        }
      }),
      catchError(err => {
        console.error('Error enviando solicitud a backend PHP Copilot (Gemini):', err);
        return of({
          success: false,
          result: '',
          error: err?.error?.error || err?.message || 'Error de conexión con el copiloto Gemini en el backend.'
        });
      })
    );
  }

  /**
   * Genera un cuestionario interactivo (por defecto 5 preguntas con 3 opciones) para la pizarra del apunte
   */
  generateQuiz(
    prompt: string,
    noteTitle?: string,
    history: any[] = [],
    noteContent?: string,
    numQuestions?: number | null
  ): Observable<{ success: boolean; quiz?: QuizData; error?: string }> {
    const payload: any = {
      mode: 'quiz',
      prompt: this.redactSecretsClientSide(prompt),
      note_title: this.redactSecretsClientSide(noteTitle),
      note_content: this.redactSecretsClientSide(noteContent),
      history: this.sanitizeHistoryClientSide(history)
    };
    if (numQuestions && numQuestions >= 1 && numQuestions <= 10) {
      payload.num_questions = numQuestions;
    }

    return this.http.post<any>(this.API_ENDPOINT, payload).pipe(
      map(res => {
        if (res && res.success && res.quiz) {
          const normalized = normalizeQuizData(res.quiz);
          if (normalized) {
            return { success: true, quiz: normalized };
          }
          return { success: false, error: 'El cuestionario recibido no tiene el formato esperado.' };
        }
        return { success: false, error: res?.error || 'No se pudo generar el cuestionario.' };
      }),
      catchError(err => {
        console.error('Error generando cuestionario con IA:', err);
        return of({
          success: false,
          error: err?.error?.error || err?.message || 'Error de conexión al generar el cuestionario.'
        });
      })
    );
  }
}
