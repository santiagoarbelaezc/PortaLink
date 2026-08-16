import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, map } from 'rxjs';

export interface ActivityLog {
  iconType: 'config' | 'message' | 'lead' | 'update' | 'export';
  label: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reports`;

  getLogs(): Observable<ActivityLog[]> {
    return this.http.get<any>(`${this.apiUrl}/activity`).pipe(
      map(res => {
        const rawLogs = Array.isArray(res) ? res : (res?.logs || []);
        return rawLogs.map((l: any) => {
          let details: any = {};
          if (typeof l.details === 'string') {
            try { details = JSON.parse(l.details); } catch (e) {}
          } else if (typeof l.details === 'object' && l.details !== null) {
            details = l.details;
          }

          const iconType = details.iconType || l.iconType || 'export';
          const label = details.label || l.action || l.label || 'Actividad registrada';
          const dateStr = l.created_at || l.date;
          const date = dateStr ? new Date(dateStr).toLocaleString('es-CO', {
            month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'
          }) : 'Reciente';

          return { iconType, label, date } as ActivityLog;
        });
      })
    );
  }

  logActivity(iconType: string, label: string): Observable<ActivityLog> {
    return this.http.post<any>(`${this.apiUrl}/activity`, {
      action: label,
      details: { iconType, label }
    }).pipe(
      map(() => ({
        iconType: iconType as any,
        label,
        date: new Date().toLocaleString('es-CO', {
          month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'
        })
      }))
    );
  }
}
