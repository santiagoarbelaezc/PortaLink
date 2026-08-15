import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortfolioConfigService } from '../../../services/portfolio-config.service';

@Component({
  selector: 'app-dash-customize',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 tab-enter">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4"
           [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
        <div>
          <p class="text-xs font-headline font-semibold uppercase tracking-[0.25em]"
             [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Editor del Sitio</p>
          <h2 class="text-3xl sm:text-4xl font-headline font-bold uppercase tracking-tight mt-0.5"
              [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Personalizar</h2>
        </div>
        <div class="flex items-center gap-3">
          <a [href]="getLiveUrl()" target="_blank"
             class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-headline font-semibold uppercase tracking-wider transition-all duration-300 border cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-sm"
             [ngClass]="isDark ? 'border-neutral-700 text-white bg-white/10 hover:bg-white hover:text-black' : 'border-neutral-200 text-neutral-800 bg-neutral-100 hover:bg-neutral-200'">
            <svg class="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Ver en vivo
          </a>
          <a href="/personalizar" target="_blank"
             class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-headline font-semibold uppercase tracking-wider transition-all duration-300 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
             [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-[#09090b] text-white hover:bg-neutral-800'">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Editor Completo
          </a>
        </div>
      </div>

      <!-- Page Tabs -->
      <div class="flex gap-1 p-1 rounded-xl border"
           [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'">
        <button *ngFor="let t of pageTabs"
                (click)="activePageTab = t.id"
                class="flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-200 cursor-pointer"
                [ngClass]="activePageTab === t.id
                  ? (isDark ? 'bg-white text-black' : 'bg-white text-neutral-900 shadow-sm')
                  : (isDark ? 'text-neutral-500 hover:text-neutral-300' : 'text-neutral-400 hover:text-neutral-700')">
          {{ t.label }}
        </button>
      </div>

      <div *ngIf="configDraft?.pages" class="space-y-8">
        
        <!-- Add New Section Palette -->
        <div>
          <h3 class="text-xs font-bold uppercase tracking-widest mb-3" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">+ Añadir nueva sección</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button *ngFor="let block of availableBlocks" (click)="addSection(block.type)"
                    class="p-4 rounded-xl border text-left transition-all duration-200 hover:translate-y-[-2px] cursor-pointer group"
                    [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700' : 'bg-white border-neutral-200 hover:border-neutral-300 hover:shadow-sm'">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                   [ngClass]="isDark ? 'bg-neutral-800 text-blue-400' : 'bg-blue-50 text-blue-600'">
                <!-- Generic Block Icon -->
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </div>
              <p class="text-sm font-bold" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ block.name }}</p>
              <p class="text-[10px] mt-1" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Haga clic para añadir</p>
            </button>
          </div>
        </div>

        <!-- Active Sections List -->
        <div>
          <h3 class="text-xs font-bold uppercase tracking-widest mb-3" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Secciones Activas — Orden de Visualización</h3>
          
          <div class="space-y-3">
            <div *ngIf="getActiveSections().length === 0" class="p-8 text-center border rounded-xl" [ngClass]="isDark ? 'border-neutral-800 text-neutral-600' : 'border-neutral-200 text-neutral-400'">
              No hay secciones en esta página.
            </div>

            <div *ngFor="let sec of getActiveSections(); let i = index"
                 class="flex items-center gap-3 p-3 rounded-xl border transition-all duration-200"
                 [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
              
              <!-- Order Controls -->
              <div class="flex flex-col gap-1">
                <button (click)="moveSection(i, -1)" [disabled]="i === 0"
                        class="p-1 rounded bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/></svg>
                </button>
                <button (click)="moveSection(i, 1)" [disabled]="i === getActiveSections().length - 1"
                        class="p-1 rounded bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
                </button>
              </div>

              <!-- Content Info -->
              <div class="flex-grow flex items-center gap-4 min-w-0">
                <div class="w-12 h-12 rounded-lg border flex items-center justify-center flex-shrink-0"
                     [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-400' : 'bg-neutral-50 border-neutral-200 text-neutral-500'">
                  <span class="text-[9px] font-bold uppercase tracking-wider">{{ sec.type }}</span>
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-bold truncate" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                    Bloque: {{ getBlockName(sec.type) }}
                  </p>
                  <p class="text-[10px] uppercase tracking-wider" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">
                    ID: {{ sec.id }}
                  </p>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2 flex-shrink-0">
                <button (click)="sec.active = !sec.active"
                        class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border transition-all cursor-pointer flex items-center gap-1.5"
                        [ngClass]="sec.active 
                          ? (isDark ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-green-200 text-green-600 bg-green-50')
                          : (isDark ? 'border-neutral-700 text-neutral-500' : 'border-neutral-200 text-neutral-400')">
                  <span class="w-2 h-2 rounded-full" [ngClass]="sec.active ? 'bg-current' : 'bg-transparent border border-current'"></span>
                  {{ sec.active ? 'Activo' : 'Inactivo' }}
                </button>
                <button class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border transition-all cursor-pointer flex items-center gap-1.5"
                        [ngClass]="isDark ? 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10' : 'border-blue-200 text-blue-600 hover:bg-blue-50'">
                  Editar
                </button>
                <button (click)="deleteSection(i)"
                        class="p-2 rounded-lg border transition-all cursor-pointer border-red-500/20 text-red-400 hover:bg-red-500/10">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- No config -->
      <div *ngIf="!configDraft?.pages" class="py-12 text-center text-sm"
           [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'">
        Cargando estructura de páginas...
      </div>

      <!-- Actions -->
      <div *ngIf="configDraft?.pages" class="flex justify-end gap-3 mt-8">
        <button (click)="resetDraft()"
                class="px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest border transition-all duration-200 cursor-pointer"
                [ngClass]="isDark ? 'border-neutral-700 text-neutral-400 hover:text-white' : 'border-neutral-200 text-neutral-500 hover:text-neutral-900'">
          Descartar
        </button>
        <button (click)="saveDraft()"
                class="px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer"
                [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-100' : 'bg-neutral-900 text-white hover:bg-neutral-800'">
          Guardar Cambios
        </button>
      </div>
    </div>
  `,
  styles: [`
    .tab-enter { animation: tabEnter 0.25s ease-out forwards; }
    @keyframes tabEnter {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .input-field { transition: border-color 0.2s; }
    .input-field:focus { border-color: rgba(255,255,255,0.25); }
  `]
})
export class DashCustomizeComponent implements OnInit {
  @Input() theme = 'light';
  private configService = inject(PortfolioConfigService);

  configDraft: any = null;
  activePageTab = 'home';
  pageTabs = [
    { id: 'home', label: 'Inicio' },
    { id: 'links', label: 'Links' },
    { id: 'planes', label: 'Planes' },
  ];

  availableBlocks = [
    { type: 'hero', name: 'Hero (Cabecera)' },
    { type: 'about', name: 'Bloque Sobre Mí' },
    { type: 'portfolio', name: 'Carrusel de Proyectos' },
    { type: 'text', name: 'Bloque de Texto Libre' },
    { type: 'linktree', name: 'Árbol de Enlaces' }
  ];

  get isDark() { return this.theme === 'dark'; }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const data = this.configService.data();
    if (data) {
      this.configDraft = JSON.parse(JSON.stringify(data));
      // Ensure pages structure exists
      if (!this.configDraft.pages) {
        this.configDraft.pages = { home: { sections: [] }, links: { sections: [] }, planes: { sections: [] } };
      }
    } else {
      setTimeout(() => this.loadData(), 500);
    }
  }

  getActiveSections(): any[] {
    if (!this.configDraft?.pages || !this.configDraft.pages[this.activePageTab]) return [];
    return this.configDraft.pages[this.activePageTab].sections || [];
  }

  getBlockName(type: string): string {
    return this.availableBlocks.find(b => b.type === type)?.name || type;
  }

  getLiveUrl() {
    if (this.activePageTab === 'home') return '/proyectos';
    if (this.activePageTab === 'links') return '/links';
    return '/' + this.activePageTab;
  }

  addSection(type: string) {
    const sections = this.getActiveSections();
    sections.push({
      id: type + '-' + Date.now(),
      type: type,
      active: true,
      config: {}
    });
  }

  deleteSection(index: number) {
    if (confirm('¿Eliminar esta sección?')) {
      const sections = this.getActiveSections();
      sections.splice(index, 1);
    }
  }

  moveSection(index: number, direction: number) {
    const sections = this.getActiveSections();
    if (index + direction < 0 || index + direction >= sections.length) return;
    const temp = sections[index];
    sections[index] = sections[index + direction];
    sections[index + direction] = temp;
  }

  saveDraft() {
    // Save pages structure back to config
    this.configService.updateSection('pages', this.configDraft.pages);
    this.configService.save();
  }

  resetDraft() {
    if (confirm('¿Descartar todos los cambios sin guardar?')) {
      this.configService.reset();
      const data = this.configService.data();
      if (data) this.configDraft = JSON.parse(JSON.stringify(data));
    }
  }
}
