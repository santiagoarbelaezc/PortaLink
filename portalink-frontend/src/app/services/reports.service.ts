import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

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
    return this.http.get<ActivityLog[]>(`${this.apiUrl}/logs`);
  }

  logActivity(iconType: string, label: string): Observable<ActivityLog> {
    return this.http.post<ActivityLog>(`${this.apiUrl}/logs`, { iconType, label });
  }
}
