import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';

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
}
