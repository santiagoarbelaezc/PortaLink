import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PortfolioConfigService {
  private http = inject(HttpClient);
  
  // State Signals
  private _config = signal<any>(null);
  private _originalConfig = signal<any>(null);
  
  // Computed Selectors
  readonly data = computed(() => this._config());
  readonly hasChanges = computed(() => {
    if (!this._config() || !this._originalConfig()) return false;
    return JSON.stringify(this._config()) !== JSON.stringify(this._originalConfig());
  });

  constructor() {
    this.loadUserConfig();
    if (typeof window !== 'undefined') {
      window.addEventListener('auth-change', () => this.loadUserConfig());
    }
  }

  private getConfigKey(): string {
    if (typeof localStorage !== 'undefined') {
      const userStr = localStorage.getItem('portalink_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user && user.nombre) {
            // Reemplazar espacios para evitar problemas en claves
            return `portfolio_config_draft_${user.nombre.replace(/\s+/g, '_')}`;
          }
        } catch {}
      }
    }
    return 'portfolio_config_draft';
  }

  loadUserConfig() {
    const key = this.getConfigKey();
    const savedDraft = localStorage.getItem(key);
    
    this.http.get('/assets/portfolio.json').subscribe({
      next: (originalData) => {
        this._originalConfig.set(originalData);
        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft);
            this._config.set({ ...originalData, ...parsed });
          } catch {
            this._config.set(JSON.parse(JSON.stringify(originalData)));
          }
        } else {
          this._config.set(JSON.parse(JSON.stringify(originalData)));
        }
      },
      error: (err) => console.error('Error loading portfolio config:', err)
    });
  }

  updateSection(section: string, value: any) {
    this._config.update(current => {
      const updated = { ...current, [section]: value };
      localStorage.setItem(this.getConfigKey(), JSON.stringify(updated));
      return updated;
    });
  }

  save() {
    const current = this._config();
    localStorage.setItem(this.getConfigKey(), JSON.stringify(current));
    // Simulate publishing by updating original reference
    this._originalConfig.set(JSON.parse(JSON.stringify(current)));
    alert('Borrador guardado localmente. Recuerda exportar el JSON para aplicar cambios permanentes.');
  }

  reset() {
    const original = JSON.parse(JSON.stringify(this._originalConfig()));
    this._config.set(original);
    localStorage.removeItem(this.getConfigKey());
  }

  exportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this._config(), null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "portfolio.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
}
