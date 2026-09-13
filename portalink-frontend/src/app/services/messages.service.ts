import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of, catchError, map } from 'rxjs';

export interface ContactMessage {
  id?: number;
  nombre: string;
  correo: string;
  mensaje: string;
  asunto?: string;
  name?: string;
  email?: string;
  message?: string;
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

  sendMessage(data: { nombre: string; correo: string; mensaje: string; asunto?: string }): Observable<any> {
    const payload = {
      nombre: data.nombre,
      correo: data.correo,
      mensaje: data.mensaje,
      asunto: data.asunto || 'Contacto desde PortaLink Web',
      name: data.nombre,
      email: data.correo,
      message: data.mensaje,
      subject: data.asunto || 'Contacto desde PortaLink Web'
    };
    return this.http.post<any>(this.apiUrl, payload).pipe(
      catchError(() => {
        this.saveLocalMessage(data);
        return of({ success: true, message: 'Mensaje enviado correctamente (local)', fallback: true });
      })
    );
  }

  getMessages(): Observable<ContactMessage[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(remoteMsgs => {
        const localMsgs = this.getLocalMessages();
        const mappedRemote: ContactMessage[] = (remoteMsgs || []).map(m => {
          const rawSt = (m.status || 'unread').toLowerCase();
          const st = rawSt === 'responded' ? 'replied' : rawSt;
          return {
            id: m.id,
            nombre: m.nombre || m.name || 'Anónimo',
            correo: m.correo || m.email || '',
            mensaje: m.mensaje || m.message || '',
            asunto: m.asunto || m.subject || 'Contacto',
            status: st,
            created_at: m.created_at || new Date().toISOString()
          };
        });

        // Sincronizar en segundo plano mensajes que quedaron en localStorage si los hay
        this.syncLocalMessages(localMsgs, mappedRemote);

        const combined = [...localMsgs, ...mappedRemote];
        return this.deduplicateMessages(combined);
      }),
      catchError((err) => {
        console.warn('[MessagesService] Error al obtener mensajes remotos, usando locales:', err);
        return of(this.getLocalMessages());
      })
    );
  }

  updateStatus(id: number, status: 'read' | 'unread' | 'replied'): Observable<any> {
    this.updateLocalStatus(id, status);
    return this.http.put<any>(`${this.apiUrl}/${id}/status`, { status }).pipe(
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
      const parsed = stored ? JSON.parse(stored) : [];
      return (parsed || []).map((m: any) => ({
        id: m.id,
        nombre: m.nombre || m.name || 'Anónimo',
        correo: m.correo || m.email || '',
        mensaje: m.mensaje || m.message || '',
        asunto: m.asunto || m.subject || 'Contacto',
        status: (m.status || 'unread').toLowerCase() === 'responded' ? 'replied' : (m.status || 'unread').toLowerCase(),
        created_at: m.created_at || new Date().toISOString()
      }));
    } catch {
      return [];
    }
  }

  private saveLocalMessage(data: { nombre: string; correo: string; mensaje: string; asunto?: string }) {
    if (typeof localStorage === 'undefined') return;
    try {
      const messages = this.getLocalMessages();
      const newMsg: ContactMessage = {
        id: Date.now(),
        nombre: data.nombre,
        correo: data.correo,
        mensaje: data.mensaje,
        asunto: data.asunto || 'Contacto',
        status: 'unread',
        created_at: new Date().toISOString()
      };
      messages.unshift(newMsg);
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error('Error guardando mensaje local:', e);
    }
  }

  private syncLocalMessages(localMsgs: ContactMessage[], remoteMsgs: ContactMessage[]) {
    const unsynced = localMsgs.filter(lm => typeof lm.id === 'number' && lm.id > 1000000000);
    if (unsynced.length === 0) return;

    for (const msg of unsynced) {
      const alreadyInRemote = remoteMsgs.some(rm =>
        (rm.correo || '').toLowerCase() === (msg.correo || '').toLowerCase() &&
        (rm.mensaje || '').trim() === (msg.mensaje || '').trim()
      );

      if (!alreadyInRemote) {
        this.http.post<any>(this.apiUrl, {
          nombre: msg.nombre,
          correo: msg.correo,
          mensaje: msg.mensaje,
          name: msg.nombre,
          email: msg.correo,
          message: msg.mensaje,
          subject: msg.asunto || 'Contacto desde PortaLink Web'
        }).subscribe({
          next: () => {
            if (msg.id) this.deleteLocalMessage(msg.id);
          },
          error: () => {}
        });
      } else {
        if (msg.id) this.deleteLocalMessage(msg.id);
      }
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
      const email = (m.correo || '').trim().toLowerCase();
      const content = (m.mensaje || '').trim().substring(0, 40).toLowerCase();
      const key = m.id ? `id-${m.id}` : `${email}-${content}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
