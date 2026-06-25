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
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.3em]"
             [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Editor del Sitio</p>
          <h2 class="text-4xl font-bold uppercase tracking-tight mt-0.5"
              [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Personalizar</h2>
        </div>
        <a href="/personalizar" target="_blank"
           class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-200"
           [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-100' : 'bg-neutral-900 text-white hover:bg-neutral-800'">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
          Abrir Editor Completo
        </a>
      </div>

      <!-- Sub-tabs -->
      <div class="flex gap-1 p-1 rounded-xl border"
           [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'">
        <button *ngFor="let t of subTabs"
                (click)="activeSubTab = t.id"
                class="flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-200 cursor-pointer"
                [ngClass]="activeSubTab === t.id
                  ? (isDark ? 'bg-white text-black' : 'bg-white text-neutral-900 shadow-sm')
                  : (isDark ? 'text-neutral-500 hover:text-neutral-300' : 'text-neutral-400 hover:text-neutral-700')">
          {{ t.label }}
        </button>
      </div>

      <!-- Content area -->
      <div *ngIf="configDraft" class="rounded-2xl border p-6 md:p-8 space-y-6"
           [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">

        <!-- HERO Tab -->
        <div *ngIf="activeSubTab === 'hero'" class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-bold uppercase tracking-widest"
                     [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Nombre del Autor</label>
              <input type="text" [(ngModel)]="configDraft.general.authorName"
                     class="input-field px-4 py-3 rounded-xl border text-sm focus:outline-none"
                     [ngClass]="isDark ? 'bg-neutral-800/60 border-neutral-700 text-white placeholder-neutral-600' : 'bg-neutral-50 border-neutral-200 text-neutral-900'">
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-bold uppercase tracking-widest"
                     [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Título Hero</label>
              <input type="text" [(ngModel)]="configDraft.hero.title"
                     class="input-field px-4 py-3 rounded-xl border text-sm focus:outline-none"
                     [ngClass]="isDark ? 'bg-neutral-800/60 border-neutral-700 text-white placeholder-neutral-600' : 'bg-neutral-50 border-neutral-200 text-neutral-900'">
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-bold uppercase tracking-widest"
                     [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Subtítulo Hero</label>
              <input type="text" [(ngModel)]="configDraft.hero.subtitle"
                     class="input-field px-4 py-3 rounded-xl border text-sm focus:outline-none"
                     [ngClass]="isDark ? 'bg-neutral-800/60 border-neutral-700 text-white placeholder-neutral-600' : 'bg-neutral-50 border-neutral-200 text-neutral-900'">
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-bold uppercase tracking-widest"
                     [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Texto CTA</label>
              <input type="text" [(ngModel)]="configDraft.hero.ctaText"
                     class="input-field px-4 py-3 rounded-xl border text-sm focus:outline-none"
                     [ngClass]="isDark ? 'bg-neutral-800/60 border-neutral-700 text-white placeholder-neutral-600' : 'bg-neutral-50 border-neutral-200 text-neutral-900'">
            </div>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-bold uppercase tracking-widest"
                   [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Descripción Hero</label>
            <textarea rows="3" [(ngModel)]="configDraft.hero.description"
                      class="input-field px-4 py-3 rounded-xl border text-sm focus:outline-none resize-none"
                      [ngClass]="isDark ? 'bg-neutral-800/60 border-neutral-700 text-white placeholder-neutral-600' : 'bg-neutral-50 border-neutral-200 text-neutral-900'"></textarea>
          </div>
        </div>

        <!-- ABOUT Tab -->
        <div *ngIf="activeSubTab === 'about'" class="space-y-5">
          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-bold uppercase tracking-widest"
                   [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Descripción Sobre Mí</label>
            <textarea rows="6" [(ngModel)]="configDraft.about.text"
                      class="input-field px-4 py-3 rounded-xl border text-sm focus:outline-none resize-none"
                      [ngClass]="isDark ? 'bg-neutral-800/60 border-neutral-700 text-white placeholder-neutral-600' : 'bg-neutral-50 border-neutral-200 text-neutral-900'"></textarea>
          </div>
        </div>

        <!-- CONTACT Tab -->
        <div *ngIf="activeSubTab === 'contact'" class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-bold uppercase tracking-widest"
                     [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Email de Contacto</label>
              <input type="email" [(ngModel)]="configDraft.contact.email"
                     class="input-field px-4 py-3 rounded-xl border text-sm focus:outline-none"
                     [ngClass]="isDark ? 'bg-neutral-800/60 border-neutral-700 text-white placeholder-neutral-600' : 'bg-neutral-50 border-neutral-200 text-neutral-900'">
            </div>
          </div>
        </div>

        <!-- LINKTREE Tab -->
        <div *ngIf="activeSubTab === 'links'" class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-bold uppercase tracking-widest"
                     [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Nombre del Perfil</label>
              <input type="text" [(ngModel)]="configDraft.links.profileName"
                     class="input-field px-4 py-3 rounded-xl border text-sm focus:outline-none"
                     [ngClass]="isDark ? 'bg-neutral-800/60 border-neutral-700 text-white placeholder-neutral-600' : 'bg-neutral-50 border-neutral-200 text-neutral-900'">
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-bold uppercase tracking-widest"
                     [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Título del Perfil</label>
              <input type="text" [(ngModel)]="configDraft.links.profileTitle"
                     class="input-field px-4 py-3 rounded-xl border text-sm focus:outline-none"
                     [ngClass]="isDark ? 'bg-neutral-800/60 border-neutral-700 text-white placeholder-neutral-600' : 'bg-neutral-50 border-neutral-200 text-neutral-900'">
            </div>
          </div>

          <!-- Link items -->
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <h4 class="text-xs font-bold uppercase tracking-widest"
                  [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Links registrados</h4>
              <button (click)="addLink()"
                      class="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer"
                      [ngClass]="isDark ? 'border-neutral-700 text-neutral-400 hover:text-white' : 'border-neutral-300 text-neutral-500 hover:text-neutral-900'">
                + Agregar
              </button>
            </div>
            <div *ngFor="let item of configDraft.links.items; let i = index"
                 class="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl border"
                 [ngClass]="isDark ? 'border-neutral-800 bg-neutral-800/30' : 'border-neutral-200 bg-neutral-50'">
              <input type="text" [(ngModel)]="item.title" placeholder="Título"
                     class="input-field px-3 py-2 rounded-lg border text-sm focus:outline-none"
                     [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-600' : 'bg-white border-neutral-200 text-neutral-900'">
              <input type="text" [(ngModel)]="item.url" placeholder="https://"
                     class="input-field px-3 py-2 rounded-lg border text-sm focus:outline-none"
                     [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-600' : 'bg-white border-neutral-200 text-neutral-900'">
              <div class="flex gap-2">
                <select [(ngModel)]="item.icon"
                        class="flex-grow input-field px-3 py-2 rounded-lg border text-sm focus:outline-none"
                        [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-200 text-neutral-900'">
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="link">Otro</option>
                </select>
                <button (click)="removeLink(i)"
                        class="px-3 py-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs cursor-pointer transition-all">×</button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- No config -->
      <div *ngIf="!configDraft" class="py-12 text-center text-sm"
           [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'">
        Cargando configuración...
      </div>

      <!-- Actions -->
      <div *ngIf="configDraft" class="flex justify-end gap-3">
        <button (click)="resetDraft()"
                class="px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest border transition-all duration-200 cursor-pointer"
                [ngClass]="isDark ? 'border-neutral-700 text-neutral-400 hover:text-white' : 'border-neutral-200 text-neutral-500 hover:text-neutral-900'">
          Descartar
        </button>
        <button (click)="saveDraft()"
                class="px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer"
                [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-100' : 'bg-neutral-900 text-white hover:bg-neutral-800'">
          Guardar y Publicar
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
  @Input() theme = 'dark';
  private configService = inject(PortfolioConfigService);

  configDraft: any = null;
  activeSubTab = 'hero';

  subTabs = [
    { id: 'hero', label: 'Hero' },
    { id: 'about', label: 'Sobre Mí' },
    { id: 'contact', label: 'Contacto' },
    { id: 'links', label: 'Linktree' },
  ];

  get isDark() { return this.theme === 'dark'; }

  ngOnInit() {
    const data = this.configService.data();
    if (data) {
      this.configDraft = JSON.parse(JSON.stringify(data));
    } else {
      // Wait a tick for async config load
      setTimeout(() => {
        const d = this.configService.data();
        if (d) this.configDraft = JSON.parse(JSON.stringify(d));
      }, 800);
    }
  }

  addLink() {
    if (!this.configDraft?.links?.items) return;
    this.configDraft.links.items.push({ id: Date.now().toString(), title: 'Nuevo Enlace', subtitle: '', url: 'https://', icon: 'link' });
  }

  removeLink(i: number) {
    this.configDraft.links.items.splice(i, 1);
  }

  saveDraft() {
    this.configService.updateSection('general', this.configDraft.general);
    this.configService.updateSection('hero', this.configDraft.hero);
    this.configService.updateSection('about', this.configDraft.about);
    this.configService.updateSection('contact', this.configDraft.contact);
    this.configService.updateSection('links', this.configDraft.links);
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
