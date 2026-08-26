import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

export type RotbotMode = 'charla' | 'ensenanza' | 'escucha';

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
    mode: RotbotMode = 'charla',
    phraseToEvaluate?: string
  ): Observable<RobotChatResponse> {
    const payload: any = { message, voice_id: voiceId, history, mode };
    if (phraseToEvaluate) {
      payload.phrase_to_evaluate = phraseToEvaluate;
    }

    return this.http.post<RobotChatResponse>(this.apiUrl, payload).pipe(
      catchError(err => {
        console.warn('[RobotChatService] Backend error, using local reply:', err);
        return of({
          ok: true,
          reply: mode === 'charla' 
            ? 'Connection hiccup, but I am still here! Try again.' 
            : 'Hubo un problema con la conexión. Intenta de nuevo.',
          emotion: 'happy',
          audio: null
        });
      })
    );
  }
}
