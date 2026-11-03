import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  type: 'work' | 'personal' | 'urgent';
  task_date: string; // YYYY-MM-DD
  task_time?: string; // HH:MM
  reminder_email?: string;
  reminder_sent?: boolean;
  completed: boolean;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Notification {
  notif_id: number;
  task_id: number;
  title: string;
  type: string;
  task_date: string;
  task_time: string;
  completed: boolean;
  seen: boolean;
  sent_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ItineraryService {
  private apiUrl = `${environment.apiUrl}/itinerary`;

  constructor(private http: HttpClient) {}

  // ── Task CRUD ──────────────────────────────────────────────

  getTasks(filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get(`${this.apiUrl}`, { params });
  }

  getWeek(weekStart: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/week`, { params: { week_start: weekStart } });
  }

  createTask(data: Partial<Task>): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data);
  }

  updateTask(id: number, data: Partial<Task>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  toggleTask(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/toggle`, {});
  }

  deleteTask(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ── Reminders & Notifications ──────────────────────────────

  checkReminders(): Observable<any> {
    return this.http.post(`${this.apiUrl}/reminders/check`, {});
  }

  getToday(): Observable<any> {
    return this.http.get(`${this.apiUrl}/today`);
  }

  getNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/notifications`);
  }

  markNotificationSeen(taskId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/notifications/${taskId}/seen`, {});
  }
}
