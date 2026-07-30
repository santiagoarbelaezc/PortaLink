import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface DesignItem {
  id: string;
  name: string;
  category: string;
  categoryName: string;
  styleName: string;
  description: string;
  iconClass: string;
  image: string;
  tags: string[];
}

@Component({
  selector: 'app-disenos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-wrap">

      <!-- HEADER -->
      <header class="page-header">
        <button class="back-btn" (click)="goBack()" title="Volver atrás">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div class="header-center">
          <h1 class="header-title">Galería de Diseños</h1>
          <p class="header-sub">{{ filteredTemplates().length }} modelos de proyectos listos · Selecciona uno para tu prototipo</p>
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
          <i [class]="cat.iconClass + ' icon-style'"></i>
          <span>{{ cat.label }}</span>
        </button>
      </div>

      <!-- GRID DE DISEÑOS -->
      <div class="templates-grid">
        <div
          *ngFor="let t of filteredTemplates(); trackBy: trackById"
          class="template-card group"
          [class.selected]="selectedId() === t.id"
          (click)="selectTemplate(t)">

          <!-- Preview Imagen Real del Proyecto -->
          <div class="card-preview relative overflow-hidden bg-neutral-900 border-b border-white/10 aspect-[16/9] flex items-center justify-center">
            <img [src]="t.image" [alt]="t.name" class="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
            
            <!-- Badge de estilo -->
            <div class="style-badge">{{ t.styleName }}</div>
          </div>

          <!-- Info de tarjeta -->
          <div class="card-body">
            <div class="card-top">
              <h3 class="card-name">{{ t.name }}</h3>
              <span class="card-category">
                <i [class]="t.iconClass + ' mr-1 text-[10px]'"></i>
                {{ t.categoryName }}
              </span>
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
                Ver Imagen
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

      <!-- MODAL PREVIEW DE IMAGEN -->
      <div class="modal-overlay" *ngIf="previewTemplate()" (click)="closePreview()">
        <div class="modal-container" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-info">
              <div class="modal-icon-badge">
                <i [class]="previewTemplate()?.iconClass"></i>
              </div>
              <div>
                <h2 class="modal-title">{{ previewTemplate()?.name }}</h2>
                <p class="modal-sub">{{ previewTemplate()?.categoryName }} · {{ previewTemplate()?.styleName }}</p>
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn-use-modal" (click)="useTemplate(previewTemplate()!, $event)">
                Usar este Diseño en RotBot →
              </button>
              <button class="btn-close" (click)="closePreview()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="modal-image-wrap p-4 bg-neutral-950 flex justify-center items-center overflow-y-auto max-h-[80vh]">
            <img [src]="previewTemplate()?.image" [alt]="previewTemplate()?.name" class="w-full h-auto max-w-5xl object-contain rounded-xl shadow-2xl border border-white/10" />
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
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 20px;
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
    .icon-style {
      font-size: 13px;
      color: var(--accent-color, #00f5ff);
      opacity: 0.85;
    }
    .filter-chip:hover { border-color: rgba(0,245,255,0.3); color: #00f5ff; background: rgba(0,245,255,0.05); }
    .filter-chip.active { background: rgba(0,245,255,0.1); border-color: rgba(0,245,255,0.4); color: #00f5ff; }
    .filter-chip.active .icon-style { opacity: 1; color: #00f5ff; }
    :host-context(.theme-light) .filter-chip { border-color: rgba(0,0,0,0.1); background: rgba(0,0,0,0.03); color: #666; }
    :host-context(.theme-light) .filter-chip.active { background: rgba(0,0,0,0.06); border-color: #111; color: #111; }
    :host-context(.theme-light) .filter-chip:hover { background: rgba(0,0,0,0.05); color: #111; border-color: #111; }

    /* GRID */
    .templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(440px, 1fr));
      gap: 32px;
      padding: 40px 48px;
      max-width: 1720px;
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

    .style-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(0,0,0,0.75);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 12px;
      letter-spacing: 0.5px;
      backdrop-filter: blur(4px);
      border: 1px solid rgba(255,255,255,0.15);
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
      display: inline-flex;
      align-items: center;
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
    .modal-icon-badge {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: rgba(0,245,255,0.1);
      border: 1px solid rgba(0,245,255,0.25);
      color: #00f5ff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
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

    /* RESPONSIVE */
    @media (max-width: 768px) {
      .page-header { padding: 16px 20px; }
      .header-title { font-size: 18px; }
      .cta-rotbot span:not(.live-dot) { display: none; }
      .filters-bar { padding: 16px 20px; }
      .templates-grid { grid-template-columns: 1fr; padding: 20px; gap: 20px; }
      .modal-container { max-height: 95vh; border-radius: 16px; }
    }
  `]
})
export class DisenosComponent implements OnInit {

  activeCategory = signal<string>('all');
  selectedId = signal<string | null>(null);
  previewTemplate = signal<DesignItem | null>(null);

  categories = [
    { id: 'all', label: 'Todos los Diseños', iconClass: 'fa-solid fa-layer-group' },
    { id: 'gym', label: 'Gym & Fitness', iconClass: 'fa-solid fa-dumbbell' },
    { id: 'ropa', label: 'Ropa & Moda', iconClass: 'fa-solid fa-shirt' },
    { id: 'restaurante', label: 'Restaurante', iconClass: 'fa-solid fa-utensils' },
    { id: 'servicios', label: 'Servicios & Citas', iconClass: 'fa-solid fa-scale-balanced' },
    { id: 'arquitectura', label: 'Arquitectura & Obras', iconClass: 'fa-solid fa-compass-drafting' },
    { id: 'salud', label: 'Salud & Médico', iconClass: 'fa-solid fa-stethoscope' },
    { id: 'mascotas', label: 'Mascotas', iconClass: 'fa-solid fa-paw' },
    { id: 'catalogo', label: 'Catálogos Digitales', iconClass: 'fa-solid fa-book-open' },
    { id: 'ecommerce', label: 'E-Commerce', iconClass: 'fa-solid fa-store' },
    { id: 'emprendimiento', label: 'Emprendimientos', iconClass: 'fa-solid fa-rocket' },
    { id: 'influencer', label: 'Marca Personal', iconClass: 'fa-solid fa-star' },
    { id: 'hogar', label: 'Hogar & Muebles', iconClass: 'fa-solid fa-couch' },
    { id: 'personalizado', label: 'A Medida', iconClass: 'fa-solid fa-wand-magic-sparkles' }
  ];

  designList: DesignItem[] = [
    {
      id: 'gym',
      name: 'Gym & Fitness Power',
      category: 'gym',
      categoryName: 'Gym & Fitness',
      styleName: 'Oscuro & Deportivo',
      description: 'Landing page de alto impacto para gimnasios, entrenadores personales y centros de alto rendimiento.',
      iconClass: 'fa-solid fa-dumbbell',
      image: 'assets/images/diseños/gym.png',
      tags: ['Gimnasio', 'Fitness', 'Deporte', 'Entrenamiento']
    },
    {
      id: 'gym2',
      name: 'Centro Deportivo & Crossfit',
      category: 'gym',
      categoryName: 'Gym & Fitness',
      styleName: 'Alto Rendimiento',
      description: 'Diseño dinámico para estudios de crossfit, artes marciales y centros deportivos integrales.',
      iconClass: 'fa-solid fa-[#ff5500]',
      image: 'assets/images/diseños/gym2.png',
      tags: ['Crossfit', 'Deporte', 'Fitness', 'Wellness']
    },
    {
      id: 'tiendaropa',
      name: 'Fashion Boutique & Moda',
      category: 'ropa',
      categoryName: 'Ropa & Moda',
      styleName: 'Elegante & Editorial',
      description: 'Plataforma visual de alto nivel para marcas de ropa, colecciones exclusivas y boutiques de moda.',
      iconClass: 'fa-solid fa-shirt',
      image: 'assets/images/diseños/tiendaropa.png',
      tags: ['Moda', 'Boutique', 'Ropa', 'Tendencias']
    },
    {
      id: 'restaurante',
      name: 'Restaurante & Gastronomía',
      category: 'restaurante',
      categoryName: 'Restaurante',
      styleName: 'Gourmet & Moderno',
      description: 'Diseño apetecible para restaurantes, bares y negocios gastronómicos con menú interactivo.',
      iconClass: 'fa-solid fa-utensils',
      image: 'assets/images/diseños/restaurante.png',
      tags: ['Restaurante', 'Gastronomía', 'Menú', 'Gourmet']
    },
    {
      id: 'abogado',
      name: 'Firma Legal & Abogados',
      category: 'servicios',
      categoryName: 'Servicios Legales',
      styleName: 'Corporativo & Serio',
      description: 'Sitio web profesional de alta confianza para firmas de abogados y consultores jurídicos.',
      iconClass: 'fa-solid fa-scale-balanced',
      image: 'assets/images/diseños/abogado.png',
      tags: ['Legal', 'Abogados', 'Derecho', 'Consultoría']
    },
    {
      id: 'arquitectura',
      name: 'Estudio de Arquitectura Premium',
      category: 'arquitectura',
      categoryName: 'Arquitectura & Obras',
      styleName: 'Minimalista & Estructural',
      description: 'Portafolio de proyectos arquitectónicos, maquetas y diseño de espacios interiores.',
      iconClass: 'fa-solid fa-compass-drafting',
      image: 'assets/images/diseños/arquitectura.png',
      tags: ['Arquitectura', 'Diseño', 'Construcción', 'Proyectos']
    },
    {
      id: 'arquitecto',
      name: 'Arquitecto & Diseñador de Interiores',
      category: 'arquitectura',
      categoryName: 'Arquitectura & Obras',
      styleName: 'Vanguardista',
      description: 'Presentación elegante para arquitectos independientes y despachos creativos.',
      iconClass: 'fa-solid fa-building-columns',
      image: 'assets/images/diseños/arquitecto.png',
      tags: ['Arquitecto', 'Interiores', 'Diseño', 'Planos']
    },
    {
      id: 'construccion',
      name: 'Construcción Civil & Reformas',
      category: 'arquitectura',
      categoryName: 'Arquitectura & Obras',
      styleName: 'Industrial & Sólido',
      description: 'Sitio institucional para empresas de construcción, contratistas y reformas estructurales.',
      iconClass: 'fa-solid fa-[#ff8800]',
      image: 'assets/images/diseños/construccion.png',
      tags: ['Construcción', 'Obras', 'Reformas', 'Ingeniería']
    },
    {
      id: 'medico',
      name: 'Clínica & Servicios Médicos',
      category: 'salud',
      categoryName: 'Salud & Médico',
      styleName: 'Limpio & Confiable',
      description: 'Plataforma médica para consultorios, clínicas de especialidades y agendamiento de pacientes.',
      iconClass: 'fa-solid fa-stethoscope',
      image: 'assets/images/diseños/medico.png',
      tags: ['Médico', 'Salud', 'Clínica', 'Doctores']
    },
    {
      id: 'mascotas',
      name: 'Pet Care & Veterinaria',
      category: 'mascotas',
      categoryName: 'Mascotas',
      styleName: 'Fresco & Amigable',
      description: 'Plataforma para clínicas veterinarias, peluquerías caninas y tiendas de accesorios para mascotas.',
      iconClass: 'fa-solid fa-paw',
      image: 'assets/images/diseños/mascotas.png',
      tags: ['Mascotas', 'Veterinaria', 'Pet Shop', 'Cuidado']
    },
    {
      id: 'catalogodigital',
      name: 'Catálogo Digital Express',
      category: 'catalogo',
      categoryName: 'Catálogo Digital',
      styleName: 'Interactivo & Rápido',
      description: 'Menú y catálogo de productos con pedidos instantáneos directamente a WhatsApp.',
      iconClass: 'fa-solid fa-book-open',
      image: 'assets/images/diseños/catalogodigital.png',
      tags: ['Catálogo', 'Productos', 'WhatsApp', 'Menú']
    },
    {
      id: 'catalogo-digital',
      name: 'Catálogo Pro Interactivo',
      category: 'catalogo',
      categoryName: 'Catálogo Digital',
      styleName: 'Visual & Dinámico',
      description: 'Presentación de colecciones e inventario digital optimizado para dispositivos móviles.',
      iconClass: 'fa-solid fa-mobile-screen',
      image: 'assets/images/diseños/catalogo-digital.png',
      tags: ['Catálogo', 'Ventas', 'Digital', 'Móvil']
    },
    {
      id: 'agendamiento-citas',
      name: 'Sistema de Agendamiento de Citas',
      category: 'servicios',
      categoryName: 'Servicios & Citas',
      styleName: 'Automatizado 24/7',
      description: 'Landing page integrada con reservas automáticas, agendas online y confirmación inmediata.',
      iconClass: 'fa-solid fa-calendar-check',
      image: 'assets/images/diseños/agendamiento-citas.png',
      tags: ['Citas', 'Reservas', 'Agendamiento', 'Automatización']
    },
    {
      id: 'ecommerce',
      name: 'Tienda Virtual & E-Commerce',
      category: 'ecommerce',
      categoryName: 'E-Commerce',
      styleName: 'Comercial & Escalable',
      description: 'Tienda online completa con carrito de compras, pasarela de pago e inventario.',
      iconClass: 'fa-solid fa-store',
      image: 'assets/images/diseños/e-commerce.png',
      tags: ['Tienda', 'E-Commerce', 'Compras', 'Ventas']
    },
    {
      id: 'colchones',
      name: 'Colchones & Muebles de Hogar',
      category: 'hogar',
      categoryName: 'Hogar & Muebles',
      styleName: 'Confort & Calidez',
      description: 'Diseño para tiendas de descanso, artículos del hogar, muebles y decoración.',
      iconClass: 'fa-solid fa-couch',
      image: 'assets/images/diseños/colchones.png',
      tags: ['Colchones', 'Hogar', 'Muebles', 'Descanso']
    },
    {
      id: 'emprendimiento',
      name: 'Startup & Emprendimiento Tech',
      category: 'emprendimiento',
      categoryName: 'Emprendimientos',
      styleName: 'Innovador & Futurista',
      description: 'Landing page moderna para startups de tecnología, nuevos modelos de negocio y servicios.',
      iconClass: 'fa-solid fa-rocket',
      image: 'assets/images/diseños/emprendimiento.png',
      tags: ['Startup', 'Emprendimiento', 'Tech', 'Innovación']
    },
    {
      id: 'influencer',
      name: 'Marca Personal & Influencer',
      category: 'influencer',
      categoryName: 'Marca Personal',
      styleName: 'Vibrante & Atractivo',
      description: 'Sitio personal para creadores de contenido, figuras públicas, artistas y consultores.',
      iconClass: 'fa-solid fa-star',
      image: 'assets/images/diseños/influencer.png',
      tags: ['Influencer', 'Creador', 'Marca Personal', 'Bio']
    },
    {
      id: 'personaliza',
      name: 'Sistema a Medida Personalizado',
      category: 'personalizado',
      categoryName: 'A Medida',
      styleName: '100% Personalizado',
      description: 'Desarrollo web exclusivo construido desde cero según las especificaciones de tu empresa.',
      iconClass: 'fa-solid fa-wand-magic-sparkles',
      image: 'assets/images/diseños/personaliza.png',
      tags: ['A Medida', 'Personalizado', 'Ingeniería', 'Software']
    }
  ];

  filteredTemplates = computed(() => {
    const cat = this.activeCategory();
    if (cat === 'all') return this.designList;
    return this.designList.filter(t => t.category === cat);
  });

  constructor(private router: Router) {}

  ngOnInit() {}

  setCategory(id: string) {
    this.activeCategory.set(id);
  }

  selectTemplate(t: DesignItem) {
    this.selectedId.set(t.id);
  }

  trackById(_: number, t: DesignItem) { return t.id; }

  openPreview(t: DesignItem, e: Event) {
    e.stopPropagation();
    this.previewTemplate.set(t);
    document.body.style.overflow = 'hidden';
  }

  closePreview() {
    this.previewTemplate.set(null);
    document.body.style.overflow = '';
  }

  useTemplate(t: DesignItem, e: Event) {
    e.stopPropagation();
    this.closePreview();
    this.router.navigate(['/rotbot'], { state: { selectedDesign: t.id, selectedDesignName: t.name } });
  }

  goToRotbot() {
    this.router.navigate(['/rotbot']);
  }

  goBack() {
    window.history.back();
  }
}
