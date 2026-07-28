import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TemplateService, WebTemplate } from '../../services/template.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-disenos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-wrap">

      <!-- HEADER -->
      <header class="page-header">
        <button class="back-btn" (click)="goBack()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div class="header-center">
          <h1 class="header-title">Galería de Diseños</h1>
          <p class="header-sub">{{ filteredTemplates().length }} plantillas disponibles · Selecciona una para previsualizar</p>
        </div>
        <button class="cta-rotbot" (click)="goToRotbot()">
          <span class="live-dot"></span>
          Crear con RotBot IA
        </button>
      </header>

      <!-- FILTROS -->
      <div class="filters-bar">
        <button
          *ngFor="let cat of categories"
          class="filter-chip"
          [class.active]="activeCategory() === cat.id"
          (click)="setCategory(cat.id)">
          {{ cat.icon }} {{ cat.label }}
        </button>
      </div>

      <!-- GRID DE PLANTILLAS -->
      <div class="templates-grid">
        <div
          *ngFor="let t of filteredTemplates(); trackBy: trackById"
          class="template-card"
          [class.selected]="selectedId() === t.id"
          (click)="selectTemplate(t)">

          <!-- Preview miniatura -->
          <div class="card-preview" [style.background]="t.bgGradient">
            <div class="preview-browser">
              <div class="browser-bar">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
                <span class="browser-url">{{ t.id }}.vercel.app</span>
              </div>
              <div class="browser-content" [style.background]="getBgColor(t)">
                <div class="preview-icon">{{ t.icon }}</div>
                <div class="preview-bars">
                  <div class="preview-bar bar-lg" [style.background]="t.primaryColor"></div>
                  <div class="preview-bar bar-md" style="opacity:0.4"></div>
                  <div class="preview-bar bar-sm" style="opacity:0.25"></div>
                </div>
              </div>
            </div>
            <!-- Badge de estilo -->
            <div class="style-badge">{{ t.styleName }}</div>
          </div>

          <!-- Info de tarjeta -->
          <div class="card-body">
            <div class="card-top">
              <h3 class="card-name">{{ t.name }}</h3>
              <span class="card-category">{{ t.categoryName }}</span>
            </div>
            <p class="card-desc">{{ t.description }}</p>
            <div class="card-tags">
              <span class="tag" *ngFor="let tag of t.tags.slice(0,3)">{{ tag }}</span>
            </div>
            <div class="card-actions">
              <button class="btn-preview" (click)="openPreview(t, $event)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                Preview
              </button>
              <button class="btn-use" (click)="useTemplate(t, $event)">
                Usar Diseño
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL PREVIEW -->
      <div class="modal-overlay" *ngIf="previewTemplate()" (click)="closePreview()">
        <div class="modal-container" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-info">
              <span class="modal-icon">{{ previewTemplate()?.icon }}</span>
              <div>
                <h2 class="modal-title">{{ previewTemplate()?.name }}</h2>
                <p class="modal-sub">{{ previewTemplate()?.categoryName }} · {{ previewTemplate()?.styleName }}</p>
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn-use-modal" (click)="useTemplate(previewTemplate()!, $event)">
                Usar este Diseño →
              </button>
              <button class="btn-close" (click)="closePreview()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="modal-iframe-wrap">
            <iframe
              class="preview-iframe"
              [srcdoc]="getPreviewHtml(previewTemplate()!)"
              sandbox="allow-same-origin"
              title="Preview de plantilla">
            </iframe>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }

    .page-wrap {
      min-height: 100vh;
      background: var(--bg-primary, #080808);
      color: var(--text-primary, #ffffff);
    }

    /* HEADER */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 32px;
      border-bottom: 1px solid rgba(255,255,255,0.07);
      background: var(--bg-primary, #080808);
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(10px);
      gap: 16px;
    }
    :host-context(.theme-light) .page-header {
      border-bottom-color: rgba(0,0,0,0.07);
      background: #ffffff;
    }
    .back-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      color: var(--text-secondary, #888);
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.2s;
    }
    .back-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }
    :host-context(.theme-light) .back-btn { background: rgba(0,0,0,0.03); border-color: rgba(0,0,0,0.08); }
    :host-context(.theme-light) .back-btn:hover { background: rgba(0,0,0,0.06); color: #000; }

    .header-center { text-align: center; flex: 1; }
    .header-title {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .header-sub {
      font-size: 13px;
      color: var(--text-secondary, #888);
      margin: 4px 0 0;
    }

    .cta-rotbot {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(0,245,255,0.08);
      border: 1px solid rgba(0,245,255,0.25);
      color: #00f5ff;
      padding: 10px 18px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.2s;
    }
    .cta-rotbot:hover { background: rgba(0,245,255,0.15); }
    .live-dot {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      animation: pulse 2s infinite;
      flex-shrink: 0;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(0.85); }
    }

    /* FILTROS */
    .filters-bar {
      display: flex;
      gap: 10px;
      padding: 20px 32px;
      overflow-x: auto;
      scrollbar-width: none;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .filters-bar::-webkit-scrollbar { display: none; }
    :host-context(.theme-light) .filters-bar { border-bottom-color: rgba(0,0,0,0.05); }

    .filter-chip {
      flex-shrink: 0;
      padding: 8px 18px;
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.03);
      color: var(--text-secondary, #888);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .filter-chip:hover { border-color: rgba(0,245,255,0.3); color: #00f5ff; background: rgba(0,245,255,0.05); }
    .filter-chip.active { background: rgba(0,245,255,0.1); border-color: rgba(0,245,255,0.4); color: #00f5ff; }
    :host-context(.theme-light) .filter-chip { border-color: rgba(0,0,0,0.1); background: rgba(0,0,0,0.03); color: #666; }
    :host-context(.theme-light) .filter-chip.active { background: rgba(0,0,0,0.06); border-color: #111; color: #111; }
    :host-context(.theme-light) .filter-chip:hover { background: rgba(0,0,0,0.05); color: #111; border-color: #111; }

    /* GRID */
    .templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 24px;
      padding: 32px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .template-card {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 20px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.25s ease;
    }
    .template-card:hover {
      border-color: rgba(0,245,255,0.25);
      transform: translateY(-4px);
      box-shadow: 0 16px 40px rgba(0,0,0,0.3);
    }
    .template-card.selected {
      border-color: rgba(0,245,255,0.5);
      box-shadow: 0 0 0 2px rgba(0,245,255,0.15);
    }
    :host-context(.theme-light) .template-card {
      background: #fff;
      border-color: rgba(0,0,0,0.08);
      box-shadow: 0 2px 12px rgba(0,0,0,0.04);
    }
    :host-context(.theme-light) .template-card:hover {
      border-color: #111;
      box-shadow: 0 12px 32px rgba(0,0,0,0.1);
    }

    /* PREVIEW MINIATURA */
    .card-preview {
      position: relative;
      padding: 20px 20px 0;
      min-height: 220px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
    }

    .preview-browser {
      width: 100%;
      max-width: 320px;
      border-radius: 10px 10px 0 0;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      border: 1px solid rgba(255,255,255,0.1);
    }

    .browser-bar {
      background: #1e1e1e;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .dot.red { background: #ff5f57; }
    .dot.yellow { background: #ffbd2e; }
    .dot.green { background: #28c940; }
    .browser-url {
      font-size: 10px;
      color: #666;
      margin-left: 8px;
      font-family: monospace;
    }

    .browser-content {
      padding: 20px;
      min-height: 140px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .preview-icon { font-size: 36px; }
    .preview-bars { width: 100%; display: flex; flex-direction: column; gap: 6px; }
    .preview-bar { height: 6px; background: rgba(255,255,255,0.15); border-radius: 3px; }
    .preview-bar.bar-lg { width: 75%; }
    .preview-bar.bar-md { width: 50%; }
    .preview-bar.bar-sm { width: 66%; }

    .style-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(0,0,0,0.7);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 12px;
      letter-spacing: 0.5px;
      backdrop-filter: blur(4px);
    }

    /* CARD BODY */
    .card-body {
      padding: 20px 22px 22px;
    }

    .card-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 8px;
    }
    .card-name {
      font-size: 16px;
      font-weight: 800;
      margin: 0;
      line-height: 1.3;
    }
    .card-category {
      font-size: 11px;
      font-weight: 700;
      color: #00f5ff;
      background: rgba(0,245,255,0.1);
      border: 1px solid rgba(0,245,255,0.2);
      padding: 3px 10px;
      border-radius: 12px;
      white-space: nowrap;
      flex-shrink: 0;
    }
    :host-context(.theme-light) .card-category { color: #111; background: rgba(0,0,0,0.06); border-color: rgba(0,0,0,0.1); }

    .card-desc {
      font-size: 13px;
      color: var(--text-secondary, #888);
      line-height: 1.6;
      margin-bottom: 14px;
    }

    .card-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 18px; }
    .tag {
      font-size: 11px;
      padding: 3px 10px;
      border-radius: 10px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.06);
      color: var(--text-secondary, #777);
    }
    :host-context(.theme-light) .tag { background: rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.06); }

    .card-actions {
      display: flex;
      gap: 10px;
    }

    .btn-preview {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      padding: 11px;
      border-radius: 10px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      color: var(--text-secondary, #888);
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-preview:hover { background: rgba(255,255,255,0.08); color: #fff; }
    :host-context(.theme-light) .btn-preview { background: rgba(0,0,0,0.03); border-color: rgba(0,0,0,0.1); color: #555; }
    :host-context(.theme-light) .btn-preview:hover { background: rgba(0,0,0,0.07); color: #111; }

    .btn-use {
      flex: 1.4;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      padding: 11px;
      border-radius: 10px;
      background: rgba(0,245,255,0.08);
      border: 1px solid rgba(0,245,255,0.25);
      color: #00f5ff;
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-use:hover { background: rgba(0,245,255,0.18); box-shadow: 0 4px 16px rgba(0,245,255,0.15); }
    :host-context(.theme-light) .btn-use { background: #111; border-color: #111; color: #fff; }
    :host-context(.theme-light) .btn-use:hover { background: #000; }

    /* MODAL */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.85);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      backdrop-filter: blur(8px);
      animation: fadeIn 0.2s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .modal-container {
      background: #101010;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      width: 100%;
      max-width: 1100px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: slideUp 0.25s ease;
    }
    @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
    :host-context(.theme-light) .modal-container { background: #fff; border-color: rgba(0,0,0,0.1); }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 28px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      flex-shrink: 0;
    }
    :host-context(.theme-light) .modal-header { border-bottom-color: rgba(0,0,0,0.08); }

    .modal-info { display: flex; align-items: center; gap: 14px; }
    .modal-icon { font-size: 32px; }
    .modal-title { font-size: 20px; font-weight: 800; margin: 0 0 2px; }
    .modal-sub { font-size: 13px; color: var(--text-secondary, #888); margin: 0; }

    .modal-actions { display: flex; align-items: center; gap: 12px; }

    .btn-use-modal {
      padding: 12px 24px;
      border-radius: 10px;
      background: #00f5ff;
      border: none;
      color: #050811;
      font-weight: 900;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 0 20px rgba(0,245,255,0.25);
    }
    .btn-use-modal:hover { background: #33f7ff; }
    :host-context(.theme-light) .btn-use-modal { background: #111; color: #fff; box-shadow: none; }

    .btn-close {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      color: #888;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .btn-close:hover { background: rgba(255,255,255,0.1); color: #fff; }
    :host-context(.theme-light) .btn-close { background: rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.1); }
    :host-context(.theme-light) .btn-close:hover { background: rgba(0,0,0,0.08); color: #000; }

    .modal-iframe-wrap {
      flex: 1;
      overflow: hidden;
    }
    .preview-iframe {
      width: 100%;
      height: 100%;
      min-height: 580px;
      border: none;
      background: #fff;
    }

    /* RESPONSIVE */
    @media (max-width: 768px) {
      .page-header { padding: 16px 20px; }
      .header-title { font-size: 18px; }
      .cta-rotbot span:not(.live-dot) { display: none; }
      .filters-bar { padding: 16px 20px; }
      .templates-grid { grid-template-columns: 1fr; padding: 20px; gap: 16px; }
      .modal-container { max-height: 95vh; border-radius: 16px; }
      .preview-iframe { min-height: 400px; }
    }
  `]
})
export class DisenosComponent implements OnInit {

  activeCategory = signal<string>('all');
  selectedId = signal<string | null>(null);
  previewTemplate = signal<WebTemplate | null>(null);

  categories = [
    { id: 'all', label: 'Todos', icon: '✨' },
    { id: 'gym', label: 'Gym & Fitness', icon: '🏋️' },
    { id: 'ropa', label: 'Ropa & Moda', icon: '👗' },
    { id: 'restaurante', label: 'Restaurante', icon: '🍽️' },
    { id: 'tecnologia', label: 'Tecnología', icon: '💻' },
    { id: 'salud', label: 'Salud & Spa', icon: '💆' },
    { id: 'ecommerce', label: 'E-commerce', icon: '🛍️' },
    { id: 'consultoria', label: 'Consultoría', icon: '💼' },
    { id: 'fotografia', label: 'Fotografía', icon: '📷' },
    { id: 'educacion', label: 'Educación', icon: '🎓' },
    { id: 'inmobiliaria', label: 'Inmobiliaria', icon: '🏠' },
  ];

  filteredTemplates = computed(() => {
    const cat = this.activeCategory();
    const all = this.templateService.getAllTemplates();
    if (cat === 'all') return all;
    return all.filter(t => t.category === cat);
  });

  constructor(
    private templateService: TemplateService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {}

  setCategory(id: string) {
    this.activeCategory.set(id);
  }

  selectTemplate(t: WebTemplate) {
    this.selectedId.set(t.id);
  }

  trackById(_: number, t: WebTemplate) { return t.id; }

  getBgColor(t: WebTemplate): string {
    const darkIds = ['gym', 'tecnologia', 'fotografia', 'inmobiliaria', 'restaurante', 'ecommerce'];
    return darkIds.includes(t.id) ? '#0c0d10' : '#f8f8f8';
  }

  openPreview(t: WebTemplate, e: Event) {
    e.stopPropagation();
    this.previewTemplate.set(t);
    document.body.style.overflow = 'hidden';
  }

  closePreview() {
    this.previewTemplate.set(null);
    document.body.style.overflow = '';
  }

  getPreviewHtml(t: WebTemplate): string {
    return t.htmlContent('');
  }

  useTemplate(t: WebTemplate, e: Event) {
    e.stopPropagation();
    this.closePreview();
    // Navegar a RotBot con la plantilla pre-seleccionada
    this.router.navigate(['/rotbot'], { state: { selectedTemplate: t.id } });
  }

  goToRotbot() {
    this.router.navigate(['/rotbot']);
  }

  goBack() {
    window.history.back();
  }
}
