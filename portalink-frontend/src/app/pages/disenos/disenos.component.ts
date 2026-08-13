import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import * as AOS from 'aos';

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
  liveUrl?: string;
}

@Component({
  selector: 'app-disenos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-white text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">

      <!-- STICKY HEADER COMPACTO ULTRALIMPIO -->
      <div class="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-neutral-100/90 shadow-sm transition-all duration-300">
        <div class="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-10 py-4 flex items-center justify-between gap-4">
          
          <!-- Back button -->
          <button (click)="goBack()" 
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-headline font-medium text-xs tracking-wide transition-all shadow-sm cursor-pointer border-none">
            <svg class="w-4 h-4 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
            </svg>
            <span>Volver</span>
          </button>

          <!-- Header Center Title -->
          <div class="text-center">
            <h1 class="text-xl sm:text-2xl font-headline font-semibold tracking-tight leading-snug" style="color: #0a0a0a !important;">
              Galería de Diseños & Prototipos
            </h1>
            <p class="text-xs font-sans text-neutral-500 hidden sm:block">
              {{ designList.length }} modelos exclusivos creados a medida · Selecciona uno para explorar
            </p>
          </div>

          <div class="w-16"></div>
        </div>
      </div>

      <!-- MAIN CONTENT: ELEGANT COMPOSITE GRID WITH STACKED CARDS & AOS ANIMATIONS -->
      <main class="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-10 py-8 md:py-12">
        
        <div class="space-y-8 lg:space-y-10" *ngIf="activeCategory() === 'all'">
          
          <!-- 1. HERO SHOWCASE CARD (100% width) -->
          <div *ngIf="getItemById('camascotas') as t">
            <ng-container *ngTemplateOutlet="cardItem; context: { item: t, aspect: 'aspect-[21/9] sm:aspect-[24/9]' }"></ng-container>
          </div>

          <!-- 2. SECTION 1: 2 STACKED CARDS ON LEFT (5 COLS), 1 LARGE CARD ON RIGHT (7 COLS) -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            <!-- LEFT SIDE: 2 CARDS STACKED VERTICALLY -->
            <div class="lg:col-span-5 flex flex-col gap-5 lg:gap-6 justify-between">
              <div *ngIf="getItemById('catalogodigital') as t" class="flex-1">
                <ng-container *ngTemplateOutlet="cardItem; context: { item: t, aspect: 'aspect-[21/9]' }"></ng-container>
              </div>
              <div *ngIf="getItemById('districol') as t" class="flex-1">
                <ng-container *ngTemplateOutlet="cardItem; context: { item: t, aspect: 'aspect-[21/9]' }"></ng-container>
              </div>
            </div>
            <!-- RIGHT SIDE: 1 LARGE HERO CARD -->
            <div class="lg:col-span-7 flex flex-col" *ngIf="getItemById('sysmicon') as t">
              <ng-container *ngTemplateOutlet="cardItem; context: { item: t, aspect: 'h-full min-h-[240px] aspect-[16/9]' }"></ng-container>
            </div>
          </div>

          <!-- 3. SECTION 2: 1 LARGE CARD ON LEFT (7 COLS), 2 STACKED CARDS ON RIGHT (5 COLS) -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            <!-- LEFT SIDE: 1 LARGE HERO CARD -->
            <div class="lg:col-span-7 flex flex-col" *ngIf="getItemById('tiendaintima') as t">
              <ng-container *ngTemplateOutlet="cardItem; context: { item: t, aspect: 'h-full min-h-[240px] aspect-[16/9]' }"></ng-container>
            </div>
            <!-- RIGHT SIDE: 2 CARDS STACKED VERTICALLY -->
            <div class="lg:col-span-5 flex flex-col gap-5 lg:gap-6 justify-between">
              <div *ngIf="getItemById('espumasyplasticos') as t" class="flex-1">
                <ng-container *ngTemplateOutlet="cardItem; context: { item: t, aspect: 'aspect-[21/9]' }"></ng-container>
              </div>
              <div *ngIf="getItemById('plaxtilineas') as t" class="flex-1">
                <ng-container *ngTemplateOutlet="cardItem; context: { item: t, aspect: 'aspect-[21/9]' }"></ng-container>
              </div>
            </div>
          </div>

          <!-- 4. SECTION 3: 2 STACKED CARDS ON LEFT (5 COLS), 1 LARGE CARD ON RIGHT (7 COLS) -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            <!-- LEFT SIDE: 2 CARDS STACKED VERTICALLY -->
            <div class="lg:col-span-5 flex flex-col gap-5 lg:gap-6 justify-between">
              <div *ngIf="getItemById('gym') as t" class="flex-1">
                <ng-container *ngTemplateOutlet="cardItem; context: { item: t, aspect: 'aspect-[21/9]' }"></ng-container>
              </div>
              <div *ngIf="getItemById('restaurante') as t" class="flex-1">
                <ng-container *ngTemplateOutlet="cardItem; context: { item: t, aspect: 'aspect-[21/9]' }"></ng-container>
              </div>
            </div>
            <!-- RIGHT SIDE: 1 LARGE HERO CARD -->
            <div class="lg:col-span-7 flex flex-col" *ngIf="getItemById('abogado') as t">
              <ng-container *ngTemplateOutlet="cardItem; context: { item: t, aspect: 'h-full min-h-[240px] aspect-[16/9]' }"></ng-container>
            </div>
          </div>

          <!-- 5. SECTION 4: 1 LARGE CARD ON LEFT (7 COLS), 2 STACKED CARDS ON RIGHT (5 COLS) -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            <!-- LEFT SIDE: 1 LARGE HERO CARD -->
            <div class="lg:col-span-7 flex flex-col" *ngIf="getItemById('gym2') as t">
              <ng-container *ngTemplateOutlet="cardItem; context: { item: t, aspect: 'h-full min-h-[240px] aspect-[16/9]' }"></ng-container>
            </div>
            <!-- RIGHT SIDE: 2 CARDS STACKED VERTICALLY -->
            <div class="lg:col-span-5 flex flex-col gap-5 lg:gap-6 justify-between">
              <div *ngIf="getItemById('medico') as t" class="flex-1">
                <ng-container *ngTemplateOutlet="cardItem; context: { item: t, aspect: 'aspect-[21/9]' }"></ng-container>
              </div>
              <div *ngIf="getItemById('citas') as t" class="flex-1">
                <ng-container *ngTemplateOutlet="cardItem; context: { item: t, aspect: 'aspect-[21/9]' }"></ng-container>
              </div>
            </div>
          </div>

          <!-- 6. SECTION 5: 2 STACKED CARDS ON LEFT (5 COLS), 1 LARGE CARD ON RIGHT (7 COLS) -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            <!-- LEFT SIDE: 2 CARDS STACKED VERTICALLY -->
            <div class="lg:col-span-5 flex flex-col gap-5 lg:gap-6 justify-between">
              <div *ngIf="getItemById('arquitecto') as t" class="flex-1">
                <ng-container *ngTemplateOutlet="cardItem; context: { item: t, aspect: 'aspect-[21/9]' }"></ng-container>
              </div>
              <div *ngIf="getItemById('catalogocomercial') as t" class="flex-1">
                <ng-container *ngTemplateOutlet="cardItem; context: { item: t, aspect: 'aspect-[21/9]' }"></ng-container>
              </div>
            </div>
            <!-- RIGHT SIDE: 1 LARGE HERO CARD -->
            <div class="lg:col-span-7 flex flex-col" *ngIf="getItemById('construccion') as t">
              <ng-container *ngTemplateOutlet="cardItem; context: { item: t, aspect: 'h-full min-h-[240px] aspect-[16/9]' }"></ng-container>
            </div>
          </div>

          <!-- 7. SECTION 6: 1 LARGE CARD ON LEFT (7 COLS), 2 STACKED CARDS ON RIGHT (5 COLS) -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            <!-- LEFT SIDE: 1 LARGE HERO CARD -->
            <div class="lg:col-span-7 flex flex-col" *ngIf="getItemById('ecommerce') as t">
              <ng-container *ngTemplateOutlet="cardItem; context: { item: t, aspect: 'h-full min-h-[240px] aspect-[16/9]' }"></ng-container>
            </div>
            <!-- RIGHT SIDE: 2 CARDS STACKED VERTICALLY -->
            <div class="lg:col-span-5 flex flex-col gap-5 lg:gap-6 justify-between">
              <div *ngIf="getItemById('emprendimiento') as t" class="flex-1">
                <ng-container *ngTemplateOutlet="cardItem; context: { item: t, aspect: 'aspect-[21/9]' }"></ng-container>
              </div>
              <div *ngIf="getItemById('influencer') as t" class="flex-1">
                <ng-container *ngTemplateOutlet="cardItem; context: { item: t, aspect: 'aspect-[21/9]' }"></ng-container>
              </div>
            </div>
          </div>

          <!-- 8. FOOTER SHOWCASE CARD (100% width) -->
          <div *ngIf="getItemById('personaliza') as t">
            <ng-container *ngTemplateOutlet="cardItem; context: { item: t, aspect: 'aspect-[21/9] sm:aspect-[24/9]' }"></ng-container>
          </div>

        </div>

      </main>

      <!-- CARD REUSABLE NG-TEMPLATE -->
      <ng-template #cardItem let-t="item" let-aspect="aspect">
        <div class="group relative rounded-[24px] sm:rounded-[32px] overflow-hidden border border-neutral-200/80 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.04)] transition-all duration-500 hover:scale-[1.01] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-col justify-between cursor-pointer h-full"
             (click)="openPreview(t, $event)"
             data-aos="fade-up"
             data-aos-duration="900">

          <!-- Card Image Container -->
          <div class="relative w-full overflow-hidden bg-neutral-50 flex-1 min-h-[130px]" [ngClass]="aspect || 'aspect-[21/9]'">
            <img [src]="t.image" [alt]="t.name" 
                 (error)="onImageError($event)"
                 class="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105" 
                 loading="lazy" />
            
            <!-- Category Badge -->
            <div class="absolute top-3.5 right-3.5 z-10">
              <span class="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-neutral-900 text-[10.5px] font-headline font-semibold tracking-wider shadow-sm border border-neutral-200/60">
                + {{ t.categoryName }}
              </span>
            </div>

            <!-- Live Badge (if liveUrl exists) -->
            <div *ngIf="t.liveUrl" class="absolute top-3.5 left-3.5 z-10">
              <a [href]="t.liveUrl" target="_blank" rel="noopener noreferrer" (click)="$event.stopPropagation()"
                 class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-[10.5px] font-headline font-semibold tracking-wider shadow-sm no-underline border-none hover:bg-emerald-600 transition-colors">
                <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                <span>Prototipo en Vivo</span>
              </a>
            </div>
          </div>

          <!-- Card Details Bar Below Image (Pure white, single button, Title Case heading) -->
          <div class="p-4 sm:p-5 flex items-center justify-between gap-3 bg-white border-t border-neutral-100/80">
            
            <h3 class="text-lg sm:text-xl font-headline font-semibold tracking-tight leading-snug" style="color: #0a0a0a !important;">
              {{ t.name }}
            </h3>

            <!-- Button: Ver Prototipo -->
            <button (click)="openPreview(t, $event)"
                    class="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl font-headline font-medium text-xs shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all border-none flex-shrink-0 cursor-pointer"
                    style="background-color: #09090b !important; color: #ffffff !important;">
              <span style="color: #ffffff !important; font-weight: 500;">Ver Prototipo</span>
              <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="color: #ffffff !important;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
              </svg>
            </button>

          </div>

        </div>
      </ng-template>

      <!-- PREVIEW MODAL APPLE-STYLE CLEAN -->
      <div class="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-5 bg-black/65 backdrop-blur-2xl transition-all duration-300 animate-fadeIn"
           *ngIf="previewTemplate()" (click)="closePreview()">
        
        <div class="relative w-full max-w-[1340px] bg-white rounded-[24px] sm:rounded-[32px] overflow-hidden border border-neutral-200/80 shadow-[0_25px_70px_rgba(0,0,0,0.18)] flex flex-col max-h-[96vh] animate-scaleUp"
             (click)="$event.stopPropagation()">
          
          <!-- Modal Header -->
          <div class="px-5 sm:px-7 py-3.5 border-b border-neutral-100/90 flex items-center justify-between gap-4 bg-white/95 backdrop-blur-md sticky top-0 z-20">
            
            <div class="flex items-center gap-3">
              <span class="w-2.5 h-2.5 rounded-full bg-neutral-900"></span>
              <div>
                <h2 class="text-xl sm:text-2xl md:text-3xl font-headline font-semibold tracking-tight leading-snug" style="color: #0a0a0a !important;">
                  {{ previewTemplate()?.name }}
                </h2>
                <div class="flex items-center gap-2 mt-0.5">
                  <span class="text-xs font-headline font-medium text-neutral-500">
                    {{ previewTemplate()?.categoryName }}
                  </span>
                  <span class="text-neutral-300 text-xs">•</span>
                  <span class="text-xs font-sans text-neutral-400">
                    {{ previewTemplate()?.styleName }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <!-- Live Link Button (if exists) -->
              <a *ngIf="previewTemplate()?.liveUrl" [href]="previewTemplate()?.liveUrl" target="_blank" rel="noopener noreferrer"
                 class="hidden sm:inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-emerald-50/90 hover:bg-emerald-100/90 text-emerald-800 font-headline font-semibold text-xs border border-emerald-200/90 shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] no-underline group">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Ver Prototipo en Vivo</span>
                <svg class="w-3.5 h-3.5 text-emerald-700 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                </svg>
              </a>

              <!-- Contact Button -->
              <button (click)="requestCustomProject(previewTemplate()!)"
                      class="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full font-headline font-semibold text-xs shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] border-none cursor-pointer group"
                      style="background-color: #09090b !important; color: #ffffff !important;">
                <span style="color: #ffffff !important; font-weight: 600;">Solicitar este Diseño</span>
                <div class="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5">
                  <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="color: #ffffff !important;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                  </svg>
                </div>
              </button>

              <!-- Close Button -->
              <button (click)="closePreview()" 
                      class="w-10 h-10 rounded-full bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-700 flex items-center justify-center transition-all border-none cursor-pointer">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

          </div>

          <!-- Modal Body Image Preview in Browser Frame -->
          <div class="p-3 sm:p-5 bg-[#f6f7f8] overflow-y-auto flex-1 flex flex-col items-center custom-scrollbar">
            
            <!-- Browser Mockup Window -->
            <div class="w-full max-w-[1240px] rounded-[18px] sm:rounded-[24px] overflow-hidden border border-neutral-200/90 shadow-[0_15px_45px_rgba(0,0,0,0.06)] bg-white flex flex-col">
              
              <!-- Browser Mockup Header Bar with Live Project Link -->
              <div class="px-5 py-3 bg-neutral-100/80 border-b border-neutral-200/70 flex items-center justify-between gap-4">
                <div class="flex items-center gap-2 flex-shrink-0">
                  <span class="w-3 h-3 rounded-full bg-red-400/80"></span>
                  <span class="w-3 h-3 rounded-full bg-amber-400/80"></span>
                  <span class="w-3 h-3 rounded-full bg-emerald-400/80"></span>
                </div>

                <!-- LIVE PROJECT LINK PILL ABOVE IMAGE -->
                <a *ngIf="previewTemplate()?.liveUrl; else defaultUrl" 
                   [href]="previewTemplate()?.liveUrl" target="_blank" rel="noopener noreferrer"
                   class="px-4 py-1.5 rounded-full bg-white hover:bg-emerald-50/80 border border-neutral-200/80 text-xs font-mono text-neutral-700 hover:text-emerald-700 max-w-md sm:max-w-xl w-full text-center truncate shadow-2xs flex items-center justify-center gap-2 no-underline transition-all group cursor-pointer">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
                  <span class="font-medium truncate">{{ previewTemplate()?.liveUrl }}</span>
                  <svg class="w-3.5 h-3.5 text-neutral-400 group-hover:text-emerald-600 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                  </svg>
                </a>
                <ng-template #defaultUrl>
                  <div class="px-4 py-1.5 rounded-full bg-white/90 border border-neutral-200/60 text-xs font-mono text-neutral-400 max-w-md w-full text-center truncate shadow-2xs">
                    https://portalink.co/prototipos/{{ previewTemplate()?.id }}
                  </div>
                </ng-template>

                <div class="w-12 flex-shrink-0"></div>
              </div>

              <!-- Image Content (Taller and Larger View) -->
              <div class="w-full bg-neutral-900/5 flex justify-center items-start p-1.5 sm:p-3 min-h-[350px]">
                <img [src]="previewTemplate()?.image" [alt]="previewTemplate()?.name"
                     (error)="onImageError($event)"
                     class="w-full h-auto max-h-[82vh] object-contain object-top rounded-xl shadow-sm border border-neutral-200/40" />
              </div>

            </div>

          </div>

          <!-- Modal Footer Details Bar -->
          <div class="px-5 sm:px-7 py-3 bg-white border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p class="text-xs font-sans text-neutral-500 m-0 max-w-2xl">
              {{ previewTemplate()?.description }}
            </p>

            <div class="flex items-center gap-2 flex-wrap">
              <span *ngFor="let tag of previewTemplate()?.tags" class="px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 text-[11px] font-headline font-medium">
                #{{ tag }}
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      min-height: 100vh;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleUp {
      from { opacity: 0; transform: scale(0.96) translateY(12px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.25s ease-out forwards;
    }
    .animate-scaleUp {
      animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class DisenosComponent implements OnInit {
  private router = inject(Router);

  activeCategory = signal<string>('all');
  selectedId = signal<string | null>(null);
  previewTemplate = signal<DesignItem | null>(null);

  designList: DesignItem[] = [
    // 1. PROYECTOS PRINCIPALES EN VIVO (MISION Y ORDEN DE LA PÁGINA PRINCIPAL)
    {
      id: 'camascotas',
      name: 'CamasCotas',
      category: 'mascotas',
      categoryName: 'E-COMMERCE',
      styleName: 'Mobiliario Pets & Catálogo',
      description: 'E-commerce completo de muebles y accesorios para mascotas con catálogo, carrito y panel de administración.',
      iconClass: 'fa-solid fa-paw',
      image: 'assets/images/proyectos/proyecto-camascotas.png',
      tags: ['Mascotas', 'E-Commerce', 'En Vivo'],
      liveUrl: 'https://camascotas.com/'
    },
    {
      id: 'catalogodigital',
      name: 'Catálogo Digital Plaxtilíneas',
      category: 'catalogo',
      categoryName: 'SISTEMA + IA',
      styleName: 'Catálogo Digital Inteligente',
      description: 'Plataforma de catálogo digital con IA integrada, analítica en tiempo real e inventario multi-línea.',
      iconClass: 'fa-solid fa-book-open',
      image: 'assets/images/proyectos/proyecto-catalogodigital.png',
      tags: ['Catálogo', 'IA', 'En Vivo'],
      liveUrl: 'https://catalogoplaxtilineas.com/catalogo'
    },
    {
      id: 'districol',
      name: 'Colchones Districol',
      category: 'ecommerce',
      categoryName: 'E-COMMERCE',
      styleName: 'Descanso Premium & WhatsApp',
      description: 'Tienda e-commerce de colchones con catálogo completo, ficha de producto y consulta directa por WhatsApp.',
      iconClass: 'fa-solid fa-store',
      image: 'assets/images/proyectos/proyecto-colchonesdistricol.png',
      tags: ['Colchones', 'E-Commerce', 'En Vivo'],
      liveUrl: 'https://colchonesdistricol.com/'
    },
    {
      id: 'sysmicon',
      name: 'Sysmicon',
      category: 'arquitectura',
      categoryName: 'PLATAFORMA',
      styleName: 'Gestión CAD & Arquitectura',
      description: 'Portal directivo para gestión de proyectos de arquitectura, diseños CAD y cotizaciones.',
      iconClass: 'fa-solid fa-compass-drafting',
      image: 'assets/images/proyectos/proyecto-sysmiconarquitectura.png',
      tags: ['Arquitectura', 'CAD', 'En Vivo'],
      liveUrl: 'https://sysmicon.com/'
    },
    {
      id: 'espumasyplasticos',
      name: 'Espumas y Plásticos',
      category: 'ecommerce',
      categoryName: 'E-COMMERCE',
      styleName: 'Industrial & Comercial',
      description: 'Plataforma de comercio electrónico e industrial para soluciones en espumas y plásticos.',
      iconClass: 'fa-solid fa-store',
      image: 'assets/images/proyectos/proyecto-catalogodigital.png',
      tags: ['Industrial', 'E-Commerce', 'En Vivo'],
      liveUrl: 'https://espumasyplasticos.com/'
    },
    {
      id: 'plaxtilineas',
      name: 'Plaxtilíneas',
      category: 'servicios',
      categoryName: 'PORTAL CORPORATIVO',
      styleName: 'Empaques & Soluciones Plásticas',
      description: 'Portal institucional e industrial para la exhibición de líneas de bolsas y empaques.',
      iconClass: 'fa-solid fa-building',
      image: 'assets/images/proyectos/proyecto-sysmiconarquitectura.png',
      tags: ['Corporativo', 'Plásticos', 'En Vivo'],
      liveUrl: 'https://plaxtilineas.com/'
    },
    {
      id: 'tiendaintima',
      name: 'Tienda Íntima',
      category: 'ropa',
      categoryName: 'TIENDA + IA',
      styleName: 'Boutique & Copiloto IA',
      description: 'Comercio electrónico para moda íntima con asistente inteligente e inventario en tiempo real.',
      iconClass: 'fa-solid fa-shirt',
      image: 'assets/images/proyectos/proyecto-tiendaintima.png',
      tags: ['Moda', 'IA', 'En Vivo'],
      liveUrl: 'https://tiendaintima.com/'
    },

    // 2. MODELOS Y PROTOTIPOS DE DISEÑO ÚNICOS (SIN DUPLICADOS)
    {
      id: 'gym',
      name: 'Gym & Fitness Power',
      category: 'gym',
      categoryName: 'GYM & FITNESS',
      styleName: 'Oscuro & Deportivo',
      description: 'Landing page de alto impacto para gimnasios, entrenadores personales y centros de alto rendimiento.',
      iconClass: 'fa-solid fa-dumbbell',
      image: 'assets/images/diseños/gym.png',
      tags: ['Gimnasio', 'Fitness', 'Deporte']
    },
    {
      id: 'restaurante',
      name: 'Restaurante & Gastronomía',
      category: 'restaurante',
      categoryName: 'RESTAURANTE',
      styleName: 'Gourmet & Moderno',
      description: 'Diseño apetecible para restaurantes, bares y negocios gastronómicos con menú interactivo.',
      iconClass: 'fa-solid fa-utensils',
      image: 'assets/images/diseños/restaurante.png',
      tags: ['Restaurante', 'Gastronomía', 'Menú']
    },
    {
      id: 'abogado',
      name: 'Firma Legal & Abogados',
      category: 'servicios',
      categoryName: 'SERVICIOS LEGALES',
      styleName: 'Corporativo & Serio',
      description: 'Sitio web profesional de alta confianza para firmas de abogados y consultores jurídicos.',
      iconClass: 'fa-solid fa-scale-balanced',
      image: 'assets/images/diseños/abogado.png',
      tags: ['Legal', 'Abogados', 'Consultoría']
    },
    {
      id: 'gym2',
      name: 'Centro Deportivo & Crossfit',
      category: 'gym',
      categoryName: 'GYM & FITNESS',
      styleName: 'Alto Rendimiento',
      description: 'Diseño dinámico para estudios de crossfit, artes marciales y centros deportivos integrales.',
      iconClass: 'fa-solid fa-dumbbell',
      image: 'assets/images/diseños/gym2.png',
      tags: ['Crossfit', 'Deporte', 'Fitness']
    },
    {
      id: 'medico',
      name: 'Centro Médico & Salud',
      category: 'salud',
      categoryName: 'SALUD & MÉDICO',
      styleName: 'Limpio & Clínico',
      description: 'Diseño médico impecable para clínicas, especialistas en salud y consultorios privados.',
      iconClass: 'fa-solid fa-stethoscope',
      image: 'assets/images/diseños/medico.png',
      tags: ['Salud', 'Médico', 'Citas']
    },
    {
      id: 'citas',
      name: 'Sistema de Citas & Agenda',
      category: 'servicios',
      categoryName: 'SERVICIOS & CITAS',
      styleName: 'Agendamiento Inteligente',
      description: 'Portal intuitivo para agendamiento de turnos, gestión de clientes y servicios profesionales.',
      iconClass: 'fa-solid fa-calendar-check',
      image: 'assets/images/diseños/agendamiento-citas.png',
      tags: ['Citas', 'Agenda', 'Servicios']
    },
    {
      id: 'arquitecto',
      name: 'Estudio de Arquitectura & Diseño',
      category: 'arquitectura',
      categoryName: 'ARQUITECTURA',
      styleName: 'Minimalista & Estructural',
      description: 'Showcase visual para estudios de arquitectura, diseño de interiores y portafolios de proyectos.',
      iconClass: 'fa-solid fa-compass-drafting',
      image: 'assets/images/diseños/arquitecto.png',
      tags: ['Arquitectura', 'Diseño', 'Portafolio']
    },
    {
      id: 'catalogocomercial',
      name: 'Catálogo Comercial Interactivo',
      category: 'catalogo',
      categoryName: 'CATÁLOGOS',
      styleName: 'Showcase de Productos',
      description: 'Plantilla de catálogo dinámico para exhibición comercial de productos y pedidos directos.',
      iconClass: 'fa-solid fa-book-open',
      image: 'assets/images/diseños/catalogo-digital.png',
      tags: ['Catálogo', 'Productos', 'Comercial']
    },
    {
      id: 'construccion',
      name: 'Constructora & Obras Civiles',
      category: 'servicios',
      categoryName: 'CONSTRUCCIÓN',
      styleName: 'Industrial & Solidez',
      description: 'Sitio corporativo para empresas de construcción, proyectos inmobiliarios y desarrollo de obras.',
      iconClass: 'fa-solid fa-hard-hat',
      image: 'assets/images/diseños/construccion.png',
      tags: ['Construcción', 'Obras', 'Ingeniería']
    },
    {
      id: 'ecommerce',
      name: 'Plataforma E-Commerce Global',
      category: 'ecommerce',
      categoryName: 'E-COMMERCE',
      styleName: 'Ventas Online & Checkout',
      description: 'E-commerce moderno con carrito multi-moneda, pasarela de pago y pasarela rápida.',
      iconClass: 'fa-solid fa-cart-shopping',
      image: 'assets/images/diseños/e-commerce.png',
      tags: ['E-Commerce', 'Ventas', 'Online']
    },
    {
      id: 'emprendimiento',
      name: 'Agencia de Emprendimiento & Startup',
      category: 'emprendimiento',
      categoryName: 'EMPRENDIMIENTO',
      styleName: 'Innovador & Disruptivo',
      description: 'Landing page para startups, consultoras de innovación y nuevos modelos de negocio.',
      iconClass: 'fa-solid fa-rocket',
      image: 'assets/images/diseños/emprendimiento.png',
      tags: ['Startup', 'Emprendimiento', 'Innovación']
    },
    {
      id: 'influencer',
      name: 'Marca Personal & Influencer',
      category: 'influencer',
      categoryName: 'MARCA PERSONAL',
      styleName: 'Visual & Engagement',
      description: 'Portal de marca personal para creadores de contenido, mentores, coaches y profesionales.',
      iconClass: 'fa-solid fa-star',
      image: 'assets/images/diseños/influencer.png',
      tags: ['Marca Personal', 'Creadores', 'Perfil']
    },
    {
      id: 'personaliza',
      name: 'Servicios & Diseños Personalizados',
      category: 'personalizado',
      categoryName: 'A MEDIDA',
      styleName: 'Exclusivo & A Medida',
      description: 'Plataforma a medida para proyectos con requerimientos especiales y desarrollos únicos.',
      iconClass: 'fa-solid fa-wand-magic-sparkles',
      image: 'assets/images/diseños/personaliza.png',
      tags: ['A Medida', 'Exclusivo', 'Desarrollo']
    }
  ];

  filteredTemplates = computed(() => {
    const cat = this.activeCategory();
    if (cat === 'all') return this.designList;
    return this.designList.filter(t => t.category === cat);
  });

  ngOnInit() {
    if (typeof window !== 'undefined') {
      AOS.init({
        duration: 900,
        once: true,
        easing: 'ease-out-cubic'
      });
    }
  }

  getItemById(id: string): DesignItem | undefined {
    return this.designList.find(t => t.id === id);
  }

  onImageError(event: any) {
    if (event && event.target) {
      event.target.src = 'assets/images/diseños/gym.png';
    }
  }

  selectTemplate(item: DesignItem) {
    this.selectedId.set(item.id);
  }

  openPreview(item: DesignItem, event: Event) {
    event.stopPropagation();
    this.previewTemplate.set(item);
  }

  closePreview() {
    this.previewTemplate.set(null);
  }

  requestCustomProject(item: DesignItem) {
    this.closePreview();
    this.router.navigate(['/'], { fragment: 'contacto' });
  }

  goBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/']);
    }
  }

  trackById(index: number, item: DesignItem): string {
    return item.id;
  }
}
