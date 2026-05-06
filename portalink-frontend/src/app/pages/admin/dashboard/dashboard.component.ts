import { Component, inject, viewChild, ElementRef, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { PortfolioConfigService } from '../../../services/portfolio-config.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-layout" [class.preview-active]="showPreview()">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo-box">
            <span class="logo-icon">SA</span>
            <div class="logo-text">
              <h3>Santiago</h3>
              <p>Admin Dashboard</p>
            </div>
          </div>
        </div>

        <nav class="nav-links">
          <div class="nav-group">
            <span class="group-label">Contenido Principal</span>
            <a routerLink="hero" routerLinkActive="active" (click)="scrollToTop()">
              <span class="nav-icon">🚀</span> Hero Section
            </a>
            <a routerLink="about" routerLinkActive="active" (click)="scrollToTop()">
              <span class="nav-icon">👤</span> About Me
            </a>
          </div>

          <div class="nav-group">
            <span class="group-label">Gestión de Datos</span>
            <a routerLink="skills" routerLinkActive="active" (click)="scrollToTop()">
              <span class="nav-icon">⚡</span> Skills Manager
            </a>
            <a routerLink="portfolio" routerLinkActive="active" (click)="scrollToTop()">
              <span class="nav-icon">💼</span> Portfolio
            </a>
            <a routerLink="contact" routerLinkActive="active" (click)="scrollToTop()">
              <span class="nav-icon">📧</span> Contacto
            </a>
          </div>
        </nav>

        <div class="sidebar-footer">
          <button class="btn-logout" (click)="logout()">
            <span class="btn-icon">↩</span> Cerrar Sesión
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="main-wrapper">
        <header class="top-bar">
          <div class="page-info">
            <div class="status-pill" [class.has-changes]="configService.hasChanges()">
              <span class="status-dot"></span>
              {{ configService.hasChanges() ? 'Cambios sin guardar' : 'Sincronizado' }}
            </div>
          </div>

          <div class="top-actions">
            <button class="btn-preview-toggle" (click)="togglePreview()" [class.active]="showPreview()">
              {{ showPreview() ? 'Ocultar Preview' : 'Live Preview' }}
            </button>
            <div class="action-divider"></div>
            <button class="btn-save" [disabled]="!configService.hasChanges()" (click)="configService.save()">
              Guardar Borrador
            </button>
            <button class="btn-publish" (click)="configService.exportJSON()">
              Exportar JSON
            </button>
          </div>
        </header>

        <div class="workspace">
          <section class="editor-pane" #editorScrollContainer>
            <div class="editor-content">
              <router-outlet></router-outlet>
            </div>
          </section>

          <!-- Floating Preview Panel -->
          <aside class="preview-panel" *ngIf="showPreview()">
            <div class="preview-toolbar">
              <div class="device-selectors">
                <button class="active">Desktop</button>
                <button>Mobile</button>
              </div>
              <span class="preview-url">santiago.dev/preview</span>
            </div>
            <div class="iframe-container">
              <iframe #previewIframe src="/portfolio" frameborder="0"></iframe>
            </div>
          </aside>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { --sidebar-width: 280px; --top-bar-height: 80px; --bg-main: #050505; --bg-card: #0a0a0a; --accent: #fff; --text-muted: #666; --border: #1a1a1a; }

    .admin-layout { display: flex; height: 100vh; background: var(--bg-main); color: #fff; font-family: 'Inter', sans-serif; overflow: hidden; }

    /* Sidebar Styles */
    .sidebar { width: var(--sidebar-width); background: var(--bg-card); border-right: 1px solid var(--border); display: flex; flex-direction: column; z-index: 100; }
    .sidebar-header { padding: 2.5rem 1.5rem; }
    .logo-box { display: flex; align-items: center; gap: 1rem; }
    .logo-icon { width: 40px; height: 40px; background: #fff; color: #000; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.2rem; }
    .logo-text h3 { font-size: 1rem; margin: 0; font-weight: 800; letter-spacing: -0.02em; }
    .logo-text p { font-size: 0.7rem; color: var(--text-muted); margin: 0; text-transform: uppercase; letter-spacing: 0.05rem; }

    .nav-links { flex: 1; padding: 0 1rem; overflow-y: auto; }
    .nav-group { margin-bottom: 2.5rem; }
    .group-label { display: block; padding-left: 1rem; margin-bottom: 1rem; font-size: 0.65rem; font-weight: 800; color: #444; text-transform: uppercase; letter-spacing: 0.1rem; }
    
    nav a { display: flex; align-items: center; gap: 1rem; padding: 0.8rem 1rem; border-radius: 12px; color: #888; text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: all 0.2s; margin-bottom: 0.2rem; }
    nav a:hover { background: #111; color: #fff; }
    nav a.active { background: #fff; color: #000; font-weight: 700; box-shadow: 0 4px 15px rgba(255,255,255,0.1); }
    .nav-icon { font-size: 1.1rem; filter: grayscale(1); transition: filter 0.2s; }
    nav a.active .nav-icon { filter: grayscale(0); }

    .sidebar-footer { padding: 1.5rem; border-top: 1px solid var(--border); }
    .btn-logout { width: 100%; padding: 0.8rem; background: transparent; color: #ff4444; border: 1px solid rgba(255, 68, 68, 0.2); border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.2s; }
    .btn-logout:hover { background: rgba(255, 68, 68, 0.1); border-color: #ff4444; }

    /* Main Area */
    .main-wrapper { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .top-bar { height: var(--top-bar-height); padding: 0 2.5rem; display: flex; align-items: center; justify-content: space-between; background: var(--bg-main); border-bottom: 1px solid var(--border); }

    .status-pill { display: flex; align-items: center; gap: 0.6rem; background: #080808; padding: 0.5rem 1rem; border-radius: 30px; border: 1px solid var(--border); font-size: 0.75rem; color: var(--text-muted); font-weight: 600; }
    .status-dot { width: 8px; height: 8px; background: #333; border-radius: 50%; }
    .status-pill.has-changes { color: #ff9800; border-color: rgba(255, 152, 0, 0.2); }
    .status-pill.has-changes .status-dot { background: #ff9800; box-shadow: 0 0 10px rgba(255, 152, 0, 0.5); }

    .top-actions { display: flex; align-items: center; gap: 1rem; }
    .action-divider { width: 1px; height: 24px; background: var(--border); margin: 0 0.5rem; }

    .btn-preview-toggle { background: #111; color: #fff; border: 1px solid #222; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-preview-toggle.active { background: #fff; color: #000; border-color: #fff; }
    .btn-save { background: transparent; color: #eee; border: 1px solid #333; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-save:disabled { opacity: 0.3; cursor: not-allowed; }
    .btn-publish { background: #fff; color: #000; border: none; padding: 0.6rem 1.5rem; border-radius: 8px; font-weight: 800; cursor: pointer; }

    /* Workspace */
    .workspace { flex: 1; display: flex; overflow: hidden; }
    .editor-pane { flex: 1; overflow-y: auto; scroll-behavior: smooth; }
    .editor-content { max-width: 1200px; margin: 0 auto; padding: 3rem 2.5rem; }

    /* Preview Panel */
    .preview-panel { width: 500px; border-left: 1px solid var(--border); background: #000; display: flex; flex-direction: column; animation: slideIn 0.3s ease-out; }
    @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
    
    .preview-toolbar { height: 50px; background: #0a0a0a; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 1.5rem; }
    .device-selectors { display: flex; gap: 0.5rem; }
    .device-selectors button { background: transparent; border: none; color: #444; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; cursor: pointer; }
    .device-selectors button.active { color: #fff; }
    .preview-url { font-size: 0.7rem; color: #333; font-family: monospace; }

    .iframe-container { flex: 1; padding: 1.5rem; background: #050505; }
    iframe { width: 100%; height: 100%; background: #fff; border-radius: 12px; border: 1px solid #111; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }

    /* Custom Scrollbar */
    .editor-pane::-webkit-scrollbar { width: 8px; }
    .editor-pane::-webkit-scrollbar-track { background: transparent; }
    .editor-pane::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 10px; }
    .editor-pane::-webkit-scrollbar-thumb:hover { background: #222; }
  `]
})
export class DashboardComponent {
  configService = inject(PortfolioConfigService);
  private router = inject(Router);
  
  previewIframe = viewChild<ElementRef<HTMLIFrameElement>>('previewIframe');
  editorScrollContainer = viewChild<ElementRef<HTMLElement>>('editorScrollContainer');
  showPreview = signal(false);

  constructor() {
    // Sincronizar previsualización con cambios
    effect(() => {
      const data = this.configService.data();
      const iframe = this.previewIframe();
      if (data && iframe?.nativeElement?.contentWindow) {
        iframe.nativeElement.contentWindow.postMessage({
          type: 'PORTFOLIO_PREVIEW_UPDATE',
          payload: data
        }, '*');
      }
    });

    // Asegurar scroll al top en cada navegación
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.scrollToTop();
    });
  }

  togglePreview() {
    this.showPreview.update(v => !v);
  }

  scrollToTop() {
    const container = this.editorScrollContainer();
    if (container) {
      container.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  logout() {
    localStorage.removeItem('admin_session');
    this.router.navigate(['/admin/login']);
  }
}
