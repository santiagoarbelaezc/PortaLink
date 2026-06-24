import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

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
  private storageKey = 'portalink_analytics_metrics';

  private defaultMetrics(): SystemMetrics {
    return {
      homeViews: 0,
      linktreeViews: 0,
      rotbotOpens: 0,
      rotbotMessagesSent: 0,
      sectionViews: {
        hero: 0,
        portfolio: 0,
        about: 0,
        skills: 0,
        contact: 0
      },
      linktreeClicks: {
        tiktok: 0,
        instagram: 0,
        whatsapp: 0,
        linkedin: 0,
        proyectos: 0
      },
      loadTimes: [],
      themeSelections: { light: 0, dark: 0 }
    };
  }

  getMetrics(): SystemMetrics {
    if (!isPlatformBrowser(this.platformId)) {
      return this.defaultMetrics();
    }
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      const initial = this.defaultMetrics();
      this.saveMetrics(initial);
      return initial;
    }
    try {
      const parsed = JSON.parse(stored);
      // Ensure all fields exist
      return {
        ...this.defaultMetrics(),
        ...parsed,
        sectionViews: { ...this.defaultMetrics().sectionViews, ...parsed.sectionViews },
        linktreeClicks: { ...this.defaultMetrics().linktreeClicks, ...parsed.linktreeClicks },
        themeSelections: { ...this.defaultMetrics().themeSelections, ...parsed.themeSelections }
      };
    } catch {
      return this.defaultMetrics();
    }
  }

  private saveMetrics(metrics: SystemMetrics): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.storageKey, JSON.stringify(metrics));
    }
  }

  incrementMetric(key: keyof Omit<SystemMetrics, 'sectionViews' | 'linktreeClicks' | 'loadTimes' | 'themeSelections'>): void {
    const metrics = this.getMetrics();
    (metrics[key] as number)++;
    this.saveMetrics(metrics);
  }

  incrementSectionView(sectionId: string): void {
    const cleanId = sectionId.replace('#', '');
    const metrics = this.getMetrics();
    if (!metrics.sectionViews[cleanId]) {
      metrics.sectionViews[cleanId] = 0;
    }
    metrics.sectionViews[cleanId]++;
    this.saveMetrics(metrics);
  }

  incrementLinkClick(linkId: string): void {
    const cleanId = linkId.toLowerCase();
    const metrics = this.getMetrics();
    if (!metrics.linktreeClicks[cleanId]) {
      metrics.linktreeClicks[cleanId] = 0;
    }
    metrics.linktreeClicks[cleanId]++;
    this.saveMetrics(metrics);
  }

  recordLoadTime(timeMs: number): void {
    const metrics = this.getMetrics();
    metrics.loadTimes.push(timeMs);
    // Keep only last 20 entries
    if (metrics.loadTimes.length > 20) {
      metrics.loadTimes.shift();
    }
    this.saveMetrics(metrics);
  }

  recordThemeSelection(theme: string): void {
    const metrics = this.getMetrics();
    if (theme === 'light') {
      metrics.themeSelections.light++;
    } else {
      metrics.themeSelections.dark++;
    }
    this.saveMetrics(metrics);
  }

  resetMetrics(): void {
    this.saveMetrics(this.defaultMetrics());
  }
}
