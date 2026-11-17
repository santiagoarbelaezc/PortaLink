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
   * Transforms or enhances a single block of content using backend PHP ChatAdminController (Groq AI)
   */
  transformBlockContent(content: string, blockType: string, instruction: string): Observable<{ success: boolean; result: string; error?: string }> {
    const payload = {
      mode: 'transform_block',
      content,
      block_type: blockType,
      instruction
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
      prompt,
      note_title: noteTitle,
      note_content: noteContent,
      history
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
      prompt,
      note_title: noteTitle,
      note_content: noteContent,
      history
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
