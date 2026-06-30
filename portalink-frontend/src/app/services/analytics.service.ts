import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface SectionMetrics {
  [key: string]: number;
}

export interface LinkClicks {
  [key: string]: number;
}

export interface SystemMetrics {
  homeViews: number;
  linktreeViews: number;
  rotbotOpens: number;
  rotbotMessagesSent: number;
  sectionViews: SectionMetrics;
  linktreeClicks: LinkClicks;
  loadTimes: number[];
  themeSelections: { light: number; dark: number };
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/analytics`;
  
  private sessionId = '';
  private eventQueue: any[] = [];
  private batchInterval: any;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initSession();
      // Enviar eventos cada 5 segundos
      this.batchInterval = setInterval(() => this.flushEvents(), 5000);
      
      // Enviar eventos antes de cerrar
      window.addEventListener('beforeunload', () => this.flushEvents());
    }
  }

  private initSession() {
    const key = 'portalink_session_id';
    let sid = sessionStorage.getItem(key);
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      sessionStorage.setItem(key, sid);
    }
    this.sessionId = sid;
  }

  private queueEvent(category: string, label?: string, value?: number) {
    if (!isPlatformBrowser(this.platformId)) return;
    this.eventQueue.push({
      sessionId: this.sessionId,
      category,
      label,
      value
    });
  }

  private flushEvents() {
    if (this.eventQueue.length === 0) return;
    
    const batch = [...this.eventQueue];
    this.eventQueue = []; // clear queue immediately

    // Send to backend
    this.http.post(`${this.apiUrl}/track`, batch).subscribe({
      error: (err) => console.error('[Analytics] Failed to send batch', err)
    });
  }

  getMetrics(): Observable<SystemMetrics> {
    return this.http.get<{ok: boolean, metrics: SystemMetrics}>(`${this.apiUrl}/metrics`).pipe(
      map(res => res.metrics),
      catchError(err => {
        console.error('Error fetching metrics', err);
        return of(this.defaultMetrics());
      })
    );
  }

  private defaultMetrics(): SystemMetrics {
    return {
      homeViews: 0,
      linktreeViews: 0,
      rotbotOpens: 0,
      rotbotMessagesSent: 0,
      sectionViews: { hero: 0, portfolio: 0, about: 0, skills: 0, contact: 0 },
      linktreeClicks: { tiktok: 0, instagram: 0, whatsapp: 0, linkedin: 0, proyectos: 0 },
      loadTimes: [],
      themeSelections: { light: 0, dark: 0 }
    };
  }

  incrementMetric(key: keyof Omit<SystemMetrics, 'sectionViews' | 'linktreeClicks' | 'loadTimes' | 'themeSelections'>): void {
    if (key === 'homeViews') this.queueEvent('page_view', 'home');
    else if (key === 'linktreeViews') this.queueEvent('page_view', 'linktree');
    else if (key === 'rotbotOpens') this.queueEvent('rotbot', 'open');
    else if (key === 'rotbotMessagesSent') this.queueEvent('rotbot', 'message_sent');
  }

  incrementSectionView(sectionId: string): void {
    const cleanId = sectionId.replace('#', '');
    this.queueEvent('section_view', cleanId);
  }

  incrementLinkClick(linkId: string): void {
    const cleanId = linkId.toLowerCase();
    this.queueEvent('link_click', cleanId);
  }

  recordLoadTime(timeMs: number): void {
    this.queueEvent('performance', 'load_time', timeMs);
  }

  recordThemeSelection(theme: string): void {
    this.queueEvent('theme', theme);
  }

  resetMetrics(): void {
    // Only visual reset or admin function? 
    // Usually we don't reset DB analytics.
  }
}
