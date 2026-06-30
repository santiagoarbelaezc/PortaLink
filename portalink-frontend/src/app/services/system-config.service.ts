import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface SystemSettings {
  currency: string;
  language: string;
  timeFormat: string;
  emailReminders: boolean;
  feedbackLoop: boolean;
  overdueAlerts: boolean;
  chatbotName: string;
  assistantPersonality: string;
  maintenanceMode: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SystemConfigService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/config`;

  getSettings(): Observable<SystemSettings> {
    return this.http.get<SystemSettings>(this.apiUrl);
  }

  updateSettings(settings: SystemSettings): Observable<SystemSettings> {
    return this.http.put<SystemSettings>(this.apiUrl, settings);
  }
}
