import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

export type RotbotMode = 'charla' | 'ensenanza' | 'escucha' | 'study-plan';
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
export type MaterialCategory = 'grammar' | 'vocabulary' | 'reading' | 'songs' | 'syllabus';

export interface StudyMaterial {
  id: string;
  title: string;
  level: CEFRLevel;
  category: MaterialCategory;
  content: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

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
  private studyPlansUrl = `${environment.apiUrl}/robot/study-plans`;

  private cachedActiveMaterial: StudyMaterial | null = null;

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
    phraseToEvaluate?: string,
    studyPlan?: string
  ): Observable<RobotChatResponse> {
    const payload: any = { message, voice_id: voiceId, history, mode };
    if (phraseToEvaluate) {
      payload.phrase_to_evaluate = phraseToEvaluate;
    }
    const finalPlan = studyPlan ?? this.cachedActiveMaterial?.content;
    if (finalPlan && finalPlan.trim()) {
      payload.study_plan = finalPlan.trim();
    }

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

  // ═══════════════════════ BACKEND STUDY MATERIALS API ═══════════════════════

  fetchMaterials(): Observable<StudyMaterial[]> {
    return this.http.get<{ ok: boolean; data: StudyMaterial[] }>(this.studyPlansUrl).pipe(
      catchError(err => {
        console.warn('[RobotChatService] Could not fetch materials from backend:', err);
        return of({ ok: false, data: [] });
      })
    ).pipe(
      // extract data array
      mapResponse => {
        return (mapResponse as any).data || [];
      }
    ) as any;
  }

  getMaterials(): Observable<StudyMaterial[]> {
    return this.http.get<{ ok: boolean; data: StudyMaterial[] }>(this.studyPlansUrl).pipe(
      catchError(err => {
        console.warn('[RobotChatService] Could not load study plans from backend:', err);
        return of({ ok: false, data: [] });
      })
    ) as any;
  }

  saveMaterial(material: Partial<StudyMaterial>): Observable<{ ok: boolean; data: StudyMaterial }> {
    if (material.id && !material.id.startsWith('mat_temp_') && !material.id.startsWith('new_')) {
      return this.http.put<{ ok: boolean; data: StudyMaterial }>(`${this.studyPlansUrl}/${material.id}`, material);
    } else {
      return this.http.post<{ ok: boolean; data: StudyMaterial }>(this.studyPlansUrl, material);
    }
  }

  deleteMaterial(id: string): Observable<{ ok: boolean; message?: string }> {
    return this.http.delete<{ ok: boolean; message?: string }>(`${this.studyPlansUrl}/${id}`);
  }

  activateMaterial(id: string): Observable<{ ok: boolean; data: StudyMaterial }> {
    return this.http.post<{ ok: boolean; data: StudyMaterial }>(`${this.studyPlansUrl}/${id}/activate`, {});
  }

  fetchActiveMaterial(): Observable<StudyMaterial | null> {
    return this.http.get<{ ok: boolean; data: StudyMaterial | null }>(`${this.studyPlansUrl}/active`).pipe(
      catchError(() => of({ ok: false, data: null }))
    ) as any;
  }

  setCachedActive(material: StudyMaterial | null) {
    this.cachedActiveMaterial = material;
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

  getStudyPlan(): { text: string; active: boolean } {
    if (this.cachedActiveMaterial && this.cachedActiveMaterial.content.trim()) {
      return { text: this.cachedActiveMaterial.content, active: true };
    }
    return { text: '', active: false };
  }
}
