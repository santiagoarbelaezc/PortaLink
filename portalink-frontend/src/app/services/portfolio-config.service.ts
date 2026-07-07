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

  private normalizeImages(data: any): any {
    if (!data) return data;
    const str = JSON.stringify(data)
      .replace(/about-portrait\.png/g, 'assets/images/fotos/principal.jpg')
      .replace(/hero-portrait\.png/g, 'assets/images/fotos/principal.jpg')
      .replace(/project-1\.png/g, 'assets/images/fotos/photo2.jpg')
      .replace(/project-3\.png/g, 'assets/images/fotos/photo3.jpeg')
      .replace(/project-2\.png/g, 'assets/images/fotos/photo4.jpeg');
    try {
      const parsed = JSON.parse(str);
      if (parsed?.about) {
        parsed.about.avatarImage = 'assets/images/fotos/photo3.jpeg';
      }
      if (parsed?.pages?.home?.sections) {
        parsed.pages.home.sections.forEach((sec: any) => {
          if (sec.id === 'home-about' && sec.config) {
            sec.config.avatarImage = 'assets/images/fotos/photo3.jpeg';
          }
        });
      }
      if (parsed?.links) {
        parsed.links.avatarImage = 'assets/images/fotos/principal.jpg';
      }
      return parsed;
    } catch {
      return data;
    }
  }

  loadUserConfig() {
    const key = this.getConfigKey();
    const savedDraft = localStorage.getItem(key);
    
    this.http.get('/assets/portfolio.json').subscribe({
      next: (originalData) => {
        const normOriginal = this.normalizeImages(originalData);
        this._originalConfig.set(normOriginal);
        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft);
            this._config.set(this.normalizeImages({ ...normOriginal, ...parsed }));
          } catch {
            this._config.set(JSON.parse(JSON.stringify(normOriginal)));
          }
        } else {
          this._config.set(JSON.parse(JSON.stringify(normOriginal)));
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
