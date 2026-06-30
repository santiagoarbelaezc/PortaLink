import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

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

  sendMessage(data: { nombre: string; correo: string; mensaje: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  getMessages(): Observable<ContactMessage[]> {
    return this.http.get<ContactMessage[]>(this.apiUrl);
  }

  updateStatus(id: number, status: 'read' | 'unread' | 'replied'): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/read`, { status });
  }

  deleteMessage(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
