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
    this.loadInitialConfig();
  }

  private loadInitialConfig() {
    const savedDraft = localStorage.getItem('portfolio_config_draft');
    
    this.http.get('/assets/portfolio.json').subscribe({
      next: (originalData) => {
        this._originalConfig.set(originalData);
        if (savedDraft) {
          this._config.set(JSON.parse(savedDraft));
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
      localStorage.setItem('portfolio_config_draft', JSON.stringify(updated));
      return updated;
    });
  }

  save() {
    const current = this._config();
    localStorage.setItem('portfolio_config_draft', JSON.stringify(current));
    // Simulate publishing by updating original reference
    this._originalConfig.set(JSON.parse(JSON.stringify(current)));
    alert('Borrador guardado localmente. Recuerda exportar el JSON para aplicar cambios permanentes.');
  }

  reset() {
    const original = JSON.parse(JSON.stringify(this._originalConfig()));
    this._config.set(original);
    localStorage.removeItem('portfolio_config_draft');
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
