import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

export type RotbotMode = 'charla';

export interface RobotChatResponse {
  ok: boolean;
  reply: string;
  emotion: 'happy' | 'neutral' | 'thinking' | 'surprised' | 'talking' | string;
  audio?: string | null;
  phrase?: string | null;
  phrase_audio?: string | null;
  score?: number | null;
  sources?: any[];
  error?: string;
  provider?: 'gemini' | 'groq' | 'contingency' | string;
  chat_too_long?: boolean;
  suggest_restart?: boolean;
}

export interface VoiceOption {
  id: string;
  name: string;
  preview: string;
}

@Injectable({
  providedIn: 'root'
})
export class RobotChatService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/robot/chat`;

  readonly voices: VoiceOption[] = [
    { id: 'iP95p4xoKVk53GoZ742B', name: 'Chris (Conversacional & Natural - Recomendado)', preview: 'Tono cercano y relajado' },
    { id: 'cjVigY5qzO86Huf0OWal', name: 'Eric (Suave & Confiable)', preview: 'Voz clara y directa' },
    { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger (Relajado & Casual)', preview: 'Tono calmado y natural' },
    { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel (Locutor Estable)', preview: 'Voz profesional y clara' },
    { id: 'bIHbv24MWmeRgasZH58o', name: 'Will (Optimista & Relajado)', preview: 'Tono amigable y cálido' }
  ];

  sendMessage(
    message: string,
    voiceId = 'iP95p4xoKVk53GoZ742B',
    history: { role: string; content: string }[] = [],
    mode: RotbotMode = 'charla'
  ): Observable<RobotChatResponse> {
    const payload: any = { message, voice_id: voiceId, history, mode };

    return this.http.post<RobotChatResponse>(this.apiUrl, payload).pipe(
      catchError(err => {
        console.warn('[RobotChatService] Backend error, using local reply:', err);
        return of({
          ok: true,
          reply: 'Connection hiccup, but I am still here! Try again in a moment.',
          emotion: 'happy',
          audio: null
        });
      })
    );
  }

  transcribeAudio(base64Audio: string, mimeType = 'audio/webm'): Observable<{ ok: boolean; transcript: string }> {
    return this.http.post<{ ok: boolean; transcript: string }>(`${environment.apiUrl}/robot/transcribe`, {
      audio: base64Audio,
      mimeType
    }).pipe(
      catchError(err => {
        console.warn('[RobotChatService] Transcribe error:', err);
        return of({ ok: false, transcript: '' });
      })
    );
  }
}
