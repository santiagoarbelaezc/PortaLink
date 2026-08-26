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
    { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian (Natural & Tecnológico - Recomendado)', preview: 'Voz estándar de alta fidelidad' },
    { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam (Juvenil & Claro)', preview: 'Voz moderna dinámica' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah (Cálida & Expresiva)', preview: 'Voz femenina natural' },
    { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George (Profesional & Atractivo)', preview: 'Voz ejecutiva' },
    { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum (Energético & Futurista)', preview: 'Voz robótica premium' }
  ];

  sendMessage(message: string, voiceId = 'nPczCjzI2devNBz1zQrb', history: { role: string; content: string }[] = []): Observable<RobotChatResponse> {
    const payload = { message, voice_id: voiceId, history };

    return this.http.post<RobotChatResponse>(this.apiUrl, payload).pipe(
      catchError(err => {
        console.warn('[RobotChatService] Backend error, using local reply:', err);
        return of({
          ok: true,
          reply: '¡Bip bop! Estoy listo para responder tus dudas del dashboard y de los proyectos de PortaLink.',
          emotion: 'happy',
          audio: null
        });
      })
    );
  }
}
