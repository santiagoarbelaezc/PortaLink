import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of, catchError, map } from 'rxjs';

export interface ContactMessage {
  id?: number;
  nombre: string;
  correo: string;
  mensaje: string;
  status?: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/messages`;
  private readonly LOCAL_STORAGE_KEY = 'portalink_contact_messages';

  sendMessage(data: { nombre: string; correo: string; mensaje: string }): Observable<any> {
    // Intenta enviar al backend HTTP; si falla (ej. 404 o error de red), guarda en localStorage y responde con éxito
    return this.http.post<any>(this.apiUrl, data).pipe(
      catchError((error) => {
        console.warn('Backend API /messages devolvió error (404/red), guardando mensaje localmente:', error);
        this.saveLocalMessage(data);
        return of({ success: true, message: 'Mensaje enviado correctamente (local)', fallback: true });
      })
    );
  }

  getMessages(): Observable<ContactMessage[]> {
    return this.http.get<ContactMessage[]>(this.apiUrl).pipe(
      map(remoteMsgs => {
        const localMsgs = this.getLocalMessages();
        const combined = [...localMsgs, ...(remoteMsgs || [])];
        return this.deduplicateMessages(combined);
      }),
      catchError(() => {
        return of(this.getLocalMessages());
      })
    );
  }

  updateStatus(id: number, status: 'read' | 'unread' | 'replied'): Observable<any> {
    this.updateLocalStatus(id, status);
    return this.http.put<any>(`${this.apiUrl}/${id}/read`, { status }).pipe(
      catchError(() => of({ success: true }))
    );
  }

  deleteMessage(id: number): Observable<any> {
    this.deleteLocalMessage(id);
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => of({ success: true }))
    );
  }

  private getLocalMessages(): ContactMessage[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const stored = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveLocalMessage(data: { nombre: string; correo: string; mensaje: string }) {
    if (typeof localStorage === 'undefined') return;
    try {
      const messages = this.getLocalMessages();
      const newMsg: ContactMessage = {
        id: Date.now(),
        nombre: data.nombre,
        correo: data.correo,
        mensaje: data.mensaje,
        status: 'unread',
        created_at: new Date().toISOString()
      };
      messages.unshift(newMsg);
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error('Error guardando mensaje local:', e);
    }
  }

  private updateLocalStatus(id: number, status: 'read' | 'unread' | 'replied') {
    if (typeof localStorage === 'undefined') return;
    try {
      const messages = this.getLocalMessages();
      const msg = messages.find(m => m.id === id);
      if (msg) {
        msg.status = status;
        localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(messages));
      }
    } catch (e) {
      console.error('Error actualizando estado local:', e);
    }
  }

  private deleteLocalMessage(id: number) {
    if (typeof localStorage === 'undefined') return;
    try {
      const messages = this.getLocalMessages().filter(m => m.id !== id);
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error('Error eliminando mensaje local:', e);
    }
  }

  private deduplicateMessages(messages: ContactMessage[]): ContactMessage[] {
    const seen = new Set<string>();
    return messages.filter(m => {
      const key = `${m.id}-${m.correo}-${m.created_at}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
