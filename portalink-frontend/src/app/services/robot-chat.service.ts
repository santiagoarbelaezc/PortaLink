import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RobotChatResponse {
  ok: boolean;
  reply: string;
  emotion: 'happy' | 'neutral' | 'thinking' | 'surprised' | 'talking' | string;
  audio?: string | null;
  error?: string;
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

  sendMessage(message: string, voiceId = 'iP95p4xoKVk53GoZ742B', history: { role: string; content: string }[] = []): Observable<RobotChatResponse> {
    const payload = { message, voice_id: voiceId, history };

    return this.http.post<RobotChatResponse>(this.apiUrl, payload).pipe(
      catchError(err => {
        console.warn('[RobotChatService] Backend error, using local reply:', err);
        return of({
          ok: true,
          reply: 'Hubo un problema con la conexión, pero aquí sigo. Intenta de nuevo.',
          emotion: 'happy',
          audio: null
        });
      })
    );
  }
}
