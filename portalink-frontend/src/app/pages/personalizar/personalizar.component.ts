import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface ThemePreset {
  id: string;
  name: string;
  primary: string;
  bg: string;
  cardBg: string;
  accent: string;
  lightTheme: boolean;
}

interface ServiceItem {
  id: number;
  title: string;
  description: string;
}

interface ProductItem {
  id: number;
  title: string;
  price: string;
  image: string;
}

@Component({
  selector: 'app-personalizar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="h-screen w-full flex flex-col overflow-hidden font-sans page-wrapper">
      
      <!-- Main Dashboard Container -->
      <div class="flex flex-row flex-grow w-full h-full pt-20 overflow-hidden">
        
        <!-- LEFT PANEL: Editor Controls -->
        <aside class="w-[420px] h-full border-r border-white/10 flex flex-col overflow-hidden bg-[#07070a]/95 backdrop-blur-xl">
          <div class="p-6 border-b border-white/10">
            <span class="text-[9px] font-bold uppercase tracking-[0.25em] text-[#00f5ff]" style="color: var(--accent-color);">Editor Visual Premium</span>
            <h1 class="text-2xl font-bold uppercase tracking-tight text-white mt-1">Personalizar Sitio</h1>
            <p class="text-xs text-white/50 mt-1.5 leading-relaxed">
              Modifica la estructura, los contenidos y el estilo visual de tu landing page.
            </p>
          </div>

          <!-- Collapsible Accordion sections (scrollable) -->
          <div class="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-4">
            
            <!-- SECTION 1: ESTILO & APARIENCIA -->
            <div class="accordion-item border rounded-2xl overflow-hidden" [class.open]="activeAccordion === 'style'">
              <button (click)="toggleAccordion('style')" class="w-full flex items-center justify-between p-4 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                <span class="text-xs font-bold uppercase tracking-widest text-white/80 flex items-center gap-2.5">
                  <svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 0 1-4-4V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v12a4 4 0 0 1-4 4zm0 0h12a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 0 1 2.828 0l2.829 2.829a2 2 0 0 1 0 2.828l-8.486 8.485M7 17h.01"></path></svg>
                  Estilo & Temas
                </span>
                <span class="text-xs text-white/40">{{ activeAccordion === 'style' ? '▲' : '▼' }}</span>
              </button>
              
              <div class="accordion-content p-4 border-t flex flex-col gap-4" *ngIf="activeAccordion === 'style'">
                <div class="flex flex-col gap-2">
                  <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">Paleta de Colores</label>
                  <div class="grid grid-cols-2 gap-2">
                    <button *ngFor="let theme of themes" (click)="selectTheme(theme)" 
                            [class.active-theme]="selectedTheme.id === theme.id"
                            class="theme-preset-btn p-3 rounded-xl border text-left flex flex-col gap-2 transition-all duration-300">
                      <span class="text-[11px] font-semibold text-white">{{ theme.name }}</span>
                      <div class="flex gap-1.5">
                        <span class="w-4 h-4 rounded-full border border-white/10" [style.background]="theme.bg"></span>
                        <span class="w-4 h-4 rounded-full border border-white/10" [style.background]="theme.primary"></span>
                        <span class="w-4 h-4 rounded-full border border-white/10" [style.background]="theme.accent"></span>
                      </div>
                    </button>
                  </div>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">Tipografía Global</label>
                  <select [(ngModel)]="selectedFont" class="custom-select p-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none">
                    <option value="font-sans">Inter (Sans-serif moderno)</option>
                    <option value="font-serif">Playfair (Serif elegante)</option>
                    <option value="font-mono">Fira Code (Monospace tecnológico)</option>
                  </select>
                </div>

                <!-- Title Font Size Slider -->
                <div class="flex flex-col gap-2">
                  <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">Tamaño del Título ({{ titleFontSize }}px)</label>
                  <input type="range" min="32" max="72" [(ngModel)]="titleFontSize" class="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00f5ff]" />
                </div>

                <!-- Body Font Size Slider -->
                <div class="flex flex-col gap-2">
                  <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">Tamaño del Cuerpo ({{ bodyFontSize }}px)</label>
                  <input type="range" min="11" max="18" [(ngModel)]="bodyFontSize" class="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00f5ff]" />
                </div>
              </div>
            </div>

            <!-- SECTION 2: CABECERA (NAVBAR) -->
            <div class="accordion-item border rounded-2xl overflow-hidden" [class.open]="activeAccordion === 'navbar'">
              <button (click)="toggleAccordion('navbar')" class="w-full flex items-center justify-between p-4 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                <span class="text-xs font-bold uppercase tracking-widest text-white/80 flex items-center gap-2.5">
                  <svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="5" rx="1"></rect><rect x="3" y="11" width="18" height="10" rx="1"></rect></svg>
                  Cabecera (Navbar)
                </span>
                <span class="text-xs text-white/40">{{ activeAccordion === 'navbar' ? '▲' : '▼' }}</span>
              </button>
              
              <div class="accordion-content p-4 border-t flex flex-col gap-4" *ngIf="activeAccordion === 'navbar'">
                <div class="flex items-center justify-between toggle-row p-3 rounded-xl border" (click)="includeNavbar = !includeNavbar">
                  <span class="text-xs font-semibold text-white">Mostrar Barra Superior</span>
                  <div class="custom-switch" [class.on]="includeNavbar"></div>
                </div>

                <div *ngIf="includeNavbar" class="flex flex-col gap-3">
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">Título del Logo</label>
                    <input type="text" [(ngModel)]="siteTitle" class="custom-input py-2.5 px-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none" />
                  </div>

                  <div class="flex items-center justify-between toggle-row p-3 rounded-xl border" (click)="showLoginBtn = !showLoginBtn">
                    <span class="text-xs font-semibold text-white">Botones Ingreso/Registro</span>
                    <div class="custom-switch" [class.on]="showLoginBtn"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- SECTION 3: HERO SECTION -->
            <div class="accordion-item border rounded-2xl overflow-hidden" [class.open]="activeAccordion === 'hero'">
              <button (click)="toggleAccordion('hero')" class="w-full flex items-center justify-between p-4 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                <span class="text-xs font-bold uppercase tracking-widest text-white/80 flex items-center gap-2.5">
                  <svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  Portada (Hero)
                </span>
                <span class="text-xs text-white/40">{{ activeAccordion === 'hero' ? '▲' : '▼' }}</span>
              </button>
              
              <div class="accordion-content p-4 border-t flex flex-col gap-4" *ngIf="activeAccordion === 'hero'">
                <div class="flex items-center justify-between toggle-row p-3 rounded-xl border" (click)="includeHero = !includeHero">
                  <span class="text-xs font-semibold text-white">Activar Sección Hero</span>
                  <div class="custom-switch" [class.on]="includeHero"></div>
                </div>

                <div *ngIf="includeHero" class="flex flex-col gap-3">
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">Línea Superior (Especialidad)</label>
                    <input type="text" [(ngModel)]="heroSubtitle" class="custom-input py-2.5 px-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none" />
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">Título Principal</label>
                    <textarea rows="3" [(ngModel)]="heroTitle" class="custom-input py-2.5 px-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none resize-none"></textarea>
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">Descripción de Apoyo</label>
                    <textarea rows="3" [(ngModel)]="heroDescription" class="custom-input py-2.5 px-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none resize-none"></textarea>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div class="flex flex-col gap-1.5">
                      <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">Botón 1 (Principal)</label>
                      <input type="text" [(ngModel)]="heroCta1" class="custom-input py-2.5 px-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none" />
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">Botón 2 (Secundario)</label>
                      <input type="text" [(ngModel)]="heroCta2" class="custom-input py-2.5 px-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- SECTION 4: SOBRE MÍ / EMPRESA -->
            <div class="accordion-item border rounded-2xl overflow-hidden" [class.open]="activeAccordion === 'about'">
              <button (click)="toggleAccordion('about')" class="w-full flex items-center justify-between p-4 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                <span class="text-xs font-bold uppercase tracking-widest text-white/80 flex items-center gap-2.5">
                  <svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path></svg>
                  Información (About)
                </span>
                <span class="text-xs text-white/40">{{ activeAccordion === 'about' ? '▲' : '▼' }}</span>
              </button>
              
              <div class="accordion-content p-4 border-t flex flex-col gap-4" *ngIf="activeAccordion === 'about'">
                <div class="flex items-center justify-between toggle-row p-3 rounded-xl border" (click)="includeAbout = !includeAbout">
                  <span class="text-xs font-semibold text-white">Activar Sección About</span>
                  <div class="custom-switch" [class.on]="includeAbout"></div>
                </div>

                <div *ngIf="includeAbout" class="flex flex-col gap-3">
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">Título de Sección</label>
                    <input type="text" [(ngModel)]="aboutTitle" class="custom-input py-2.5 px-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none" />
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">Texto Descriptivo</label>
                    <textarea rows="4" [(ngModel)]="aboutText" class="custom-input py-2.5 px-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none resize-none"></textarea>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-2 mt-2">
                    <div class="flex flex-col gap-1.5">
                      <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">Dato de Éxito 1</label>
                      <input type="text" [(ngModel)]="aboutStat1Val" placeholder="Ej: 5+" class="custom-input py-2 px-2.5 rounded-xl border text-xs text-white bg-transparent focus:outline-none" />
                      <input type="text" [(ngModel)]="aboutStat1Lbl" placeholder="Años exp" class="custom-input py-2 px-2.5 rounded-xl border text-[10px] text-white bg-transparent focus:outline-none" />
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">Dato de Éxito 2</label>
                      <input type="text" [(ngModel)]="aboutStat2Val" placeholder="Ej: 50+" class="custom-input py-2 px-2.5 rounded-xl border text-xs text-white bg-transparent focus:outline-none" />
                      <input type="text" [(ngModel)]="aboutStat2Lbl" placeholder="Proyectos" class="custom-input py-2 px-2.5 rounded-xl border text-[10px] text-white bg-transparent focus:outline-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- SECTION 5: SERVICIOS -->
            <div class="accordion-item border rounded-2xl overflow-hidden" [class.open]="activeAccordion === 'services'">
              <button (click)="toggleAccordion('services')" class="w-full flex items-center justify-between p-4 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                <span class="text-xs font-bold uppercase tracking-widest text-white/80 flex items-center gap-2.5">
                  <svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 13.255A23.931 23.931 0 0 1 12 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2m4 6h.01M5 20h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"></path></svg>
                  Servicios
                </span>
                <span class="text-xs text-white/40">{{ activeAccordion === 'services' ? '▲' : '▼' }}</span>
              </button>
              
              <div class="accordion-content p-4 border-t flex flex-col gap-4" *ngIf="activeAccordion === 'services'">
                <div class="flex items-center justify-between toggle-row p-3 rounded-xl border" (click)="includeServices = !includeServices">
                  <span class="text-xs font-semibold text-white">Activar Sección Servicios</span>
                  <div class="custom-switch" [class.on]="includeServices"></div>
                </div>

                <div *ngIf="includeServices" class="flex flex-col gap-3">
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">Título de Sección</label>
                    <input type="text" [(ngModel)]="servicesTitle" class="custom-input py-2.5 px-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none" />
                  </div>

                  <!-- Services Items Editor -->
                  <div class="flex flex-col gap-3 mt-2">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">Lista de Servicios</label>
                    
                    <div *ngFor="let srv of servicesList; let index = index" class="p-3 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-2">
                      <div class="flex items-center justify-between">
                        <span class="text-[10px] font-bold text-white/50">Servicio #{{ index + 1 }}</span>
                        <button (click)="removeService(srv.id)" class="text-red-500 hover:text-red-400 text-[10px] uppercase font-bold">Eliminar</button>
                      </div>
                      <input type="text" [(ngModel)]="srv.title" class="custom-input py-1.5 px-2.5 rounded-lg border text-xs text-white focus:outline-none" />
                      <textarea rows="2" [(ngModel)]="srv.description" class="custom-input py-1.5 px-2.5 rounded-lg border text-[11px] text-white focus:outline-none resize-none"></textarea>
                    </div>

                    <button (click)="addService()" class="py-2.5 rounded-xl border border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors text-xs font-semibold mt-1">
                      + Agregar Servicio
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- SECTION 6: CARRUSEL DE PRODUCTOS -->
            <div class="accordion-item border rounded-2xl overflow-hidden" [class.open]="activeAccordion === 'carousel'">
              <button (click)="toggleAccordion('carousel')" class="w-full flex items-center justify-between p-4 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                <span class="text-xs font-bold uppercase tracking-widest text-white/80 flex items-center gap-2.5">
                  <svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"></path></svg>
                  Carrusel de Productos
                </span>
                <span class="text-xs text-white/40">{{ activeAccordion === 'carousel' ? '▲' : '▼' }}</span>
              </button>
              
              <div class="accordion-content p-4 border-t flex flex-col gap-4" *ngIf="activeAccordion === 'carousel'">
                <div class="flex items-center justify-between toggle-row p-3 rounded-xl border" (click)="includeCarousel = !includeCarousel">
                  <span class="text-xs font-semibold text-white">Activar Carrusel</span>
                  <div class="custom-switch" [class.on]="includeCarousel"></div>
                </div>

                <div *ngIf="includeCarousel" class="flex flex-col gap-3">
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">Título de Sección</label>
                    <input type="text" [(ngModel)]="carouselTitle" class="custom-input py-2.5 px-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none" />
                  </div>

                  <!-- Product Items Editor -->
                  <div class="flex flex-col gap-3 mt-2">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">Lista de Productos</label>
                    
                    <div *ngFor="let prod of productsList; let index = index" class="p-3 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-2">
                      <div class="flex items-center justify-between">
                        <span class="text-[10px] font-bold text-white/50">Producto #{{ index + 1 }}</span>
                        <button (click)="removeProduct(prod.id)" class="text-red-500 hover:text-red-400 text-[10px] uppercase font-bold">Eliminar</button>
                      </div>
                      <div class="grid grid-cols-3 gap-2">
                        <input type="text" [(ngModel)]="prod.title" class="col-span-2 custom-input py-1.5 px-2 rounded-lg border text-xs text-white focus:outline-none" />
                        <input type="text" [(ngModel)]="prod.price" class="col-span-1 custom-input py-1.5 px-2 rounded-lg border text-xs text-white focus:outline-none" />
                      </div>
                    </div>

                    <button (click)="addProduct()" class="py-2.5 rounded-xl border border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors text-xs font-semibold mt-1">
                      + Agregar Producto
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- SECTION 7: PROMO BANNERS -->
            <div class="accordion-item border rounded-2xl overflow-hidden" [class.open]="activeAccordion === 'banner'">
              <button (click)="toggleAccordion('banner')" class="w-full flex items-center justify-between p-4 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                <span class="text-xs font-bold uppercase tracking-widest text-white/80 flex items-center gap-2.5">
                  <svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5.882V19.24a1.76 1.76 0 0 1-3.417.592l-2.147-6.15M18 13a3 3 0 1 0 0-6M5.436 13.683A4.001 4.001 0 0 1 7 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 0 1-1.564-.317z"></path></svg>
                  Banner Publicitario
                </span>
                <span class="text-xs text-white/40">{{ activeAccordion === 'banner' ? '▲' : '▼' }}</span>
              </button>
              
              <div class="accordion-content p-4 border-t flex flex-col gap-4" *ngIf="activeAccordion === 'banner'">
                <div class="flex items-center justify-between toggle-row p-3 rounded-xl border" (click)="includeBanner = !includeBanner">
                  <span class="text-xs font-semibold text-white">Activar Banner</span>
                  <div class="custom-switch" [class.on]="includeBanner"></div>
                </div>

                <div *ngIf="includeBanner" class="flex flex-col gap-3">
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">Texto de Llamado</label>
                    <input type="text" [(ngModel)]="bannerText" class="custom-input py-2.5 px-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none" />
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">Texto del Botón</label>
                    <input type="text" [(ngModel)]="bannerCta" class="custom-input py-2.5 px-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>

            <!-- SECTION 8: CONTACTO -->
            <div class="accordion-item border rounded-2xl overflow-hidden" [class.open]="activeAccordion === 'contact'">
              <button (click)="toggleAccordion('contact')" class="w-full flex items-center justify-between p-4 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                <span class="text-xs font-bold uppercase tracking-widest text-white/80 flex items-center gap-2.5">
                  <svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .94.725l.548 2.2a1 1 0 0 1-.321.988l-1.305.98a10.582 10.582 0 0 0 4.872 4.872l.98-1.305a1 1 0 0 1 .988-.321l2.2.548a1 1 0 0 1 .725.94V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  Contacto
                </span>
                <span class="text-xs text-white/40">{{ activeAccordion === 'contact' ? '▲' : '▼' }}</span>
              </button>
              
              <div class="accordion-content p-4 border-t flex flex-col gap-4" *ngIf="activeAccordion === 'contact'">
                <div class="flex items-center justify-between toggle-row p-3 rounded-xl border" (click)="includeContact = !includeContact">
                  <span class="text-xs font-semibold text-white">Activar Sección Contacto</span>
                  <div class="custom-switch" [class.on]="includeContact"></div>
                </div>

                <div *ngIf="includeContact" class="flex flex-col gap-3">
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">Título de Sección</label>
                    <input type="text" [(ngModel)]="contactTitle" class="custom-input py-2.5 px-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none" />
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">Correo Electrónico</label>
                    <input type="email" [(ngModel)]="contactEmail" class="custom-input py-2.5 px-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none" />
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">Número de Teléfono</label>
                    <input type="text" [(ngModel)]="contactPhone" class="custom-input py-2.5 px-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>

            <!-- SECTION 9: FOOTER -->
            <div class="accordion-item border rounded-2xl overflow-hidden" [class.open]="activeAccordion === 'footer'">
              <button (click)="toggleAccordion('footer')" class="w-full flex items-center justify-between p-4 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                <span class="text-xs font-bold uppercase tracking-widest text-white/80 flex items-center gap-2.5">
                  <svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                  Footer (Pie de Página)
                </span>
                <span class="text-xs text-white/40">{{ activeAccordion === 'footer' ? '▲' : '▼' }}</span>
              </button>
              
              <div class="accordion-content p-4 border-t flex flex-col gap-4" *ngIf="activeAccordion === 'footer'">
                <div class="flex items-center justify-between toggle-row p-3 rounded-xl border" (click)="includeFooter = !includeFooter">
                  <span class="text-xs font-semibold text-white">Activar Footer</span>
                  <div class="custom-switch" [class.on]="includeFooter"></div>
                </div>

                <div *ngIf="includeFooter" class="flex flex-col gap-3">
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">Texto del Copyright</label>
                    <input type="text" [(ngModel)]="footerCopy" class="custom-input py-2.5 px-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Bottom Panel Action -->
          <div class="p-6 border-t border-white/10 bg-[#07070a]">
            <button (click)="submitDesign()" class="launch-btn w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
              Desplegar Sitio Demo
            </button>
          </div>
        </aside>

        <!-- RIGHT PANEL: Giant Live Preview -->
        <main class="flex-grow h-full bg-[#0d0d0f] overflow-y-auto p-10 flex flex-col items-center">
          <div class="w-full max-w-[1000px] flex items-center justify-between mb-4">
            <h2 class="text-xs font-bold uppercase tracking-[0.2em] text-white/30">Previsualización del Sitio en Vivo</h2>
            <div class="flex gap-2">
              <span class="text-[10px] text-white/40 bg-white/5 border border-white/10 px-3 py-1 rounded-full uppercase tracking-wider font-semibold">100% Responsivo</span>
              <div class="flex gap-1.5 items-center">
                <span class="w-2.5 h-2.5 rounded-full bg-red-500/75"></span>
                <span class="w-2.5 h-2.5 rounded-full bg-yellow-500/75"></span>
                <span class="w-2.5 h-2.5 rounded-full bg-green-500/75"></span>
              </div>
            </div>
          </div>

          <!-- The Live Web Mockup Page -->
          <div class="w-full max-w-[1000px] bg-white rounded-3xl border shadow-2xl overflow-hidden transition-all duration-500 flex flex-col justify-start min-h-[90%] {{ selectedFont }}"
               [style.background]="selectedTheme.bg"
               [style.borderColor]="selectedTheme.accent + '22'"
               [style.color]="selectedTheme.primary">
            
            <!-- 1. NAVBAR MOCKUP -->
            <nav *ngIf="includeNavbar" class="flex items-center justify-between px-8 py-5 border-b sticky top-0 backdrop-blur-md z-[10]"
                 [style.background]="selectedTheme.bg + 'ee'"
                 [style.borderColor]="selectedTheme.primary + '11'">
              <span class="text-sm font-bold tracking-wider uppercase">{{ siteTitle || 'MI NEGOCIO' }}</span>
              <div class="flex gap-6 items-center">
                <span *ngIf="includeHero" class="text-[10px] uppercase tracking-widest font-semibold opacity-70">Inicio</span>
                <span *ngIf="includeAbout" class="text-[10px] uppercase tracking-widest font-semibold opacity-70">Nosotros</span>
                <span *ngIf="includeServices" class="text-[10px] uppercase tracking-widest font-semibold opacity-70">Servicios</span>
                <span *ngIf="includeCarousel" class="text-[10px] uppercase tracking-widest font-semibold opacity-70">Productos</span>
                <span *ngIf="includeContact" class="text-[10px] uppercase tracking-widest font-semibold opacity-70">Contacto</span>
              </div>
              <div class="flex items-center gap-3">
                <button *ngIf="showLoginBtn" (click)="openLoginModal()" 
                        class="px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider font-semibold border transition-all hover:bg-white/5"
                        [style.borderColor]="selectedTheme.primary + '22'"
                        [style.color]="selectedTheme.primary">
                  Ingresar
                </button>
                <button class="px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider font-bold transition-all hover:scale-105 active:scale-95"
                        [style.background]="selectedTheme.accent"
                        style="color: #000000;">
                  Contacto
                </button>
              </div>
            </nav>

            <!-- 2. HERO MOCKUP -->
            <section *ngIf="includeHero" class="px-8 md:px-16 py-20 flex flex-col gap-6 justify-center text-center md:text-left min-h-[500px]">
              <span class="text-xs font-bold uppercase tracking-[0.25em]" [style.color]="selectedTheme.accent" [style.fontSize.px]="bodyFontSize">
                {{ heroSubtitle || 'ESPECIALIDAD DEL NEGOCIO' }}
              </span>
              <h1 class="font-bold tracking-tight uppercase leading-[0.9] whitespace-pre-line max-w-3xl" [style.fontSize.px]="titleFontSize">
                {{ heroTitle || 'TITULO DE LA PAGINA' }}
              </h1>
              <p class="font-light max-w-xl opacity-70 leading-relaxed mx-auto md:mx-0" [style.fontSize.px]="bodyFontSize">
                {{ heroDescription || 'Descripción corta para capturar la atención de tus clientes y convencerlos.' }}
              </p>
              <div class="flex gap-4 items-center justify-center md:justify-start mt-4">
                <button class="px-7 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:scale-105"
                        [style.background]="selectedTheme.accent"
                        style="color: #000000;">
                  {{ heroCta1 || 'Empezar' }}
                </button>
                <button class="px-7 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all hover:bg-white/5"
                        [style.borderColor]="selectedTheme.primary + '22'"
                        [style.color]="selectedTheme.primary">
                  {{ heroCta2 || 'Ver Más' }}
                </button>
              </div>
            </section>

            <!-- 3. ABOUT MOCKUP -->
            <section *ngIf="includeAbout" class="px-8 md:px-16 py-16 border-t border-b grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
                     [style.borderColor]="selectedTheme.primary + '11'"
                     [style.background]="selectedTheme.lightTheme ? 'rgba(0,0,0,0.01)' : 'rgba(255,255,255,0.01)'">
              <div class="md:col-span-7 flex flex-col gap-4">
                <span class="text-[10px] font-bold uppercase tracking-widest opacity-40">Quiénes Somos</span>
                <h3 class="font-bold uppercase tracking-tight" [style.fontSize.px]="titleFontSize * 0.6">{{ aboutTitle || 'Trayectoria & Propósito' }}</h3>
                <p class="font-light leading-relaxed opacity-75 whitespace-pre-line" [style.fontSize.px]="bodyFontSize">
                  {{ aboutText || 'Explicación detallada del valor que tu negocio ofrece y la experiencia que respalda tu trabajo.' }}
                </p>
              </div>
              
              <div class="md:col-span-5 grid grid-cols-2 gap-4">
                <div class="p-6 rounded-2xl border text-center flex flex-col gap-2"
                     [style.background]="selectedTheme.cardBg"
                     [style.borderColor]="selectedTheme.primary + '11'">
                  <span class="text-3xl font-bold" [style.color]="selectedTheme.accent">{{ aboutStat1Val || '10+' }}</span>
                  <span class="text-[9px] uppercase tracking-widest opacity-60 font-semibold">{{ aboutStat1Lbl || 'Éxito' }}</span>
                </div>
                <div class="p-6 rounded-2xl border text-center flex flex-col gap-2"
                     [style.background]="selectedTheme.cardBg"
                     [style.borderColor]="selectedTheme.primary + '11'">
                  <span class="text-3xl font-bold" [style.color]="selectedTheme.accent">{{ aboutStat2Val || '100%' }}</span>
                  <span class="text-[9px] uppercase tracking-widest opacity-60 font-semibold">{{ aboutStat2Lbl || 'Garantizado' }}</span>
                </div>
              </div>
            </section>

            <!-- 4. SERVICES MOCKUP -->
            <section *ngIf="includeServices" class="px-8 md:px-16 py-20 flex flex-col gap-10">
              <div class="text-center flex flex-col gap-2 max-w-xl mx-auto">
                <span class="text-[10px] font-bold uppercase tracking-widest opacity-40">Portafolio de Soluciones</span>
                <h3 class="font-bold uppercase tracking-tight" [style.fontSize.px]="titleFontSize * 0.6">{{ servicesTitle || 'Nuestros Servicios' }}</h3>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div *ngFor="let srv of servicesList" class="p-6 rounded-2xl border flex flex-col gap-3 transition-all hover:scale-[1.02]"
                     [style.background]="selectedTheme.cardBg"
                     [style.borderColor]="selectedTheme.primary + '11'">
                  <span class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10" [style.borderColor]="selectedTheme.accent + '33'">
                    <span [style.color]="selectedTheme.accent">★</span>
                  </span>
                  <h4 class="text-sm font-bold uppercase tracking-wide">{{ srv.title }}</h4>
                  <p class="font-light opacity-70 leading-relaxed" [style.fontSize.px]="bodyFontSize">{{ srv.description }}</p>
                </div>
              </div>
            </section>

            <!-- 5. PRODUCTS CAROUSEL MOCKUP -->
            <section *ngIf="includeCarousel" class="px-8 md:px-16 py-20 border-t border-b flex flex-col gap-8 overflow-hidden"
                     [style.borderColor]="selectedTheme.primary + '11'"
                     [style.background]="selectedTheme.lightTheme ? 'rgba(0,0,0,0.01)' : 'rgba(255,255,255,0.01)'">
              <div class="flex items-center justify-between">
                <div class="flex flex-col gap-2">
                  <span class="text-[10px] font-bold uppercase tracking-widest opacity-40">Catálogo de Venta</span>
                  <h3 class="font-bold uppercase tracking-tight" [style.fontSize.px]="titleFontSize * 0.6">{{ carouselTitle || 'Productos Destacados' }}</h3>
                </div>
                <div class="flex gap-2">
                  <button (click)="slidePrev()" class="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-white/5 text-xs" [style.borderColor]="selectedTheme.primary + '22'">◀</button>
                  <button (click)="slideNext()" class="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-white/5 text-xs" [style.borderColor]="selectedTheme.primary + '22'">▶</button>
                </div>
              </div>

              <div class="relative w-full overflow-hidden">
                <div class="flex gap-6 transition-transform duration-500" [style.transform]="'translateX(-' + (carouselIndex * 280) + 'px)'">
                  <div *ngFor="let prod of productsList" class="w-[260px] flex-shrink-0 p-4 rounded-2xl border flex flex-col gap-3"
                       [style.background]="selectedTheme.cardBg"
                       [style.borderColor]="selectedTheme.primary + '11'">
                    <div class="w-full h-40 rounded-xl bg-white/5 flex items-center justify-center relative overflow-hidden">
                      <span class="text-2xl opacity-40">📦</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <h4 class="text-xs font-bold uppercase tracking-wide max-w-[70%] truncate">{{ prod.title }}</h4>
                      <span class="text-xs font-semibold" [style.color]="selectedTheme.accent">{{ prod.price }}</span>
                    </div>
                    <button class="w-full py-2 rounded-xl text-[10px] uppercase font-bold tracking-widest text-center"
                            [style.background]="selectedTheme.accent"
                            style="color: #000000;">
                      Comprar Ahora
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <!-- 6. PROMO BANNERS MOCKUP -->
            <section *ngIf="includeBanner" class="px-8 md:px-16 py-12 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left"
                     [style.background]="selectedTheme.accent"
                     style="color: #000000;">
              <h3 class="font-bold uppercase tracking-wide max-w-2xl" [style.fontSize.px]="titleFontSize * 0.5">
                {{ bannerText || '¿Quieres cotizar tu proyecto a medida?' }}
              </h3>
              <button class="px-6 py-3.5 bg-black text-white hover:bg-neutral-900 rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:scale-105">
                {{ bannerCta || 'Hablemos Hoy' }}
              </button>
            </section>

            <!-- 7. CONTACT MOCKUP -->
            <section *ngIf="includeContact" class="px-8 md:px-16 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              <div class="flex flex-col gap-4">
                <span class="text-[10px] font-bold uppercase tracking-widest opacity-40">Resolvamos tus Dudas</span>
                <h3 class="font-bold uppercase tracking-tight" [style.fontSize.px]="titleFontSize * 0.6">{{ contactTitle || 'Contáctanos' }}</h3>
                <p class="font-light leading-relaxed opacity-75" [style.fontSize.px]="bodyFontSize">
                  ¿Listo para comenzar? Rellena el formulario o comunícate por nuestras líneas directas.
                </p>
                <div class="flex flex-col gap-2 mt-4 text-xs font-semibold">
                  <div class="flex items-center gap-2">
                    <span class="opacity-60">✉</span>
                    <span>{{ contactEmail || 'contacto@marca.com' }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="opacity-60">📞</span>
                    <span>{{ contactPhone || '+57 300 000 0000' }}</span>
                  </div>
                </div>
              </div>

              <!-- Contact Form Mockup -->
              <div class="p-6 rounded-2xl border flex flex-col gap-3"
                   [style.background]="selectedTheme.cardBg"
                   [style.borderColor]="selectedTheme.primary + '11'">
                <input type="text" placeholder="Nombre completo" class="p-3 rounded-lg border text-xs bg-transparent focus:outline-none" [style.borderColor]="selectedTheme.primary + '11'" />
                <input type="email" placeholder="Correo electrónico" class="p-3 rounded-lg border text-xs bg-transparent focus:outline-none" [style.borderColor]="selectedTheme.primary + '11'" />
                <textarea rows="3" placeholder="Mensaje" class="p-3 rounded-lg border text-xs bg-transparent focus:outline-none resize-none" [style.borderColor]="selectedTheme.primary + '11'"></textarea>
                <button class="w-full py-3 rounded-lg text-xs font-bold uppercase tracking-widest"
                        [style.background]="selectedTheme.accent"
                        style="color: #000000;">
                  Enviar Consulta
                </button>
              </div>
            </section>

            <!-- 8. FOOTER MOCKUP -->
            <footer *ngIf="includeFooter" class="px-8 py-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-xs"
                    [style.borderColor]="selectedTheme.primary + '11'"
                    [style.background]="selectedTheme.cardBg">
              <span class="opacity-60" [style.fontSize.px]="bodyFontSize - 2">{{ footerCopy || '© 2026 Todos los derechos reservados.' }}</span>
              <div class="flex gap-6 opacity-60">
                <span>Términos</span>
                <span>Privacidad</span>
              </div>
            </footer>

          </div>
        </main>
      </div>

      <!-- CONFIRMATION OVERLAY MODAL -->
      <div *ngIf="showModal" class="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
        <div class="bg-[#08080c] border border-white/10 p-8 max-w-md w-full rounded-3xl shadow-2xl flex flex-col items-center text-center gap-6 animate-scale-up">
          <div class="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl" [style.borderColor]="selectedTheme.accent">
            🚀
          </div>
          <div>
            <h4 class="text-xl font-bold text-white">¡Estructura de Sitio Guardada!</h4>
            <p class="text-sm font-light text-white/60 leading-relaxed mt-2">
              Rotbot tiene toda la información de diseño, secciones y colores elegidos. Conversemos en pantalla completa para afinar el demo en vivo.
            </p>
          </div>
          <button (click)="confirmLaunch()" class="w-full py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs bg-white text-black hover:bg-white/95 transition-all">
            Iniciar Chat de Despliegue
          </button>
        </div>
      </div>

      <!-- LOGIN MOCKUP MODAL -->
      <div *ngIf="showLoginModal" class="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm" (click)="closeLoginModal()">
        <div class="bg-[#0c0c0e] border border-white/10 p-8 max-w-sm w-full rounded-2xl shadow-2xl flex flex-col gap-4 animate-scale-up" (click)="$event.stopPropagation()">
          <div class="flex justify-between items-center">
            <h4 class="text-lg font-bold text-white uppercase tracking-wide">Ingreso de Clientes</h4>
            <button (click)="closeLoginModal()" class="text-white/40 hover:text-white text-lg">×</button>
          </div>
          <div class="flex flex-col gap-3 mt-2">
            <input type="email" placeholder="Usuario / Correo" class="p-3 rounded-lg border border-white/10 text-xs text-white bg-transparent focus:outline-none" />
            <input type="password" placeholder="Contraseña" class="p-3 rounded-lg border border-white/10 text-xs text-white bg-transparent focus:outline-none" />
            <button class="w-full py-3 rounded-lg text-xs font-bold uppercase tracking-widest text-black bg-[#00f5ff]" [style.background]="selectedTheme.accent">
              Entrar
            </button>
          </div>
          <div class="flex justify-center text-[10px] text-white/40 uppercase tracking-widest gap-2">
            <span>¿Olvidaste tu contraseña?</span>
            <span>·</span>
            <span>Registrarse</span>
          </div>
        </div>
      </div>
      
    </div>
  `,
  styles: [`
    .page-wrapper {
      background: var(--bg-primary, #050505);
      color: var(--text-primary, #ffffff);
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(0,0,0,0.1);
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
    }
    .custom-select {
      background: rgba(255, 255, 255, 0.02);
      border-color: rgba(255, 255, 255, 0.08);
      color: var(--text-primary);
    }
    .custom-select option {
      background: #0d0d0f;
      color: white;
    }
    .custom-input {
      background: rgba(255, 255, 255, 0.02);
      border-color: rgba(255, 255, 255, 0.08);
      color: var(--text-primary);
    }
    .custom-input:focus {
      border-color: var(--accent-color, #00f5ff);
      box-shadow: 0 0 15px rgba(0, 245, 255, 0.08);
    }
    .theme-preset-btn {
      background: rgba(255, 255, 255, 0.01);
      border-color: rgba(255, 255, 255, 0.06);
    }
    .theme-preset-btn:hover {
      border-color: rgba(255, 255, 255, 0.15);
      background: rgba(255, 255, 255, 0.02);
    }
    .theme-preset-btn.active-theme {
      border-color: var(--accent-color, #00f5ff) !important;
      background: rgba(0, 245, 255, 0.03);
    }
    .toggle-row {
      background: rgba(255, 255, 255, 0.01);
      border-color: rgba(255, 255, 255, 0.06);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .toggle-row:hover {
      background: rgba(255, 255, 255, 0.02);
      border-color: rgba(255, 255, 255, 0.12);
    }
    .custom-switch {
      width: 42px;
      height: 24px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.1);
      position: relative;
      transition: background 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    .custom-switch::after {
      content: '';
      position: absolute;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: white;
      top: 3px;
      left: 3px;
      transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    .custom-switch.on {
      background: var(--accent-color, #00f5ff);
    }
    .custom-switch.on::after {
      transform: translateX(18px);
      background: #000000;
    }
    .launch-btn {
      background: var(--accent-color, #00f5ff);
      color: #000000;
    }
    .launch-btn:hover {
      box-shadow: 0 10px 25px rgba(0, 245, 255, 0.25);
    }
    .accordion-item {
      border-color: rgba(255, 255, 255, 0.06);
      background: rgba(255, 255, 255, 0.01);
    }
    .accordion-item.open {
      border-color: rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.02);
    }
    .accordion-content {
      border-color: rgba(255, 255, 255, 0.06);
    }
    @keyframes scaleUp {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .animate-scale-up {
      animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class PersonalizarComponent implements OnInit {
  // General & Styling States
  activeAccordion = 'style';
  selectedFont = 'font-sans';
  titleFontSize = 48;
  bodyFontSize = 14;
  siteTitle = 'PORTALINK STUDIO';
  showModal = false;
  showLoginModal = false;

  // Navbar section state
  includeNavbar = true;
  showLoginBtn = true;

  // Hero section state
  includeHero = true;
  heroSubtitle = 'DISEÑO WEB PREMIUM & SISTEMAS INTELIGENTES';
  heroTitle = 'Creamos Plataformas\nQue Hacen Crecer\nTu Negocio.';
  heroDescription = 'Desarrollo web a medida, integraciones de IA, y sistemas optimizados para conversiones rápidas y alto rendimiento.';
  heroCta1 = 'Ver Proyectos';
  heroCta2 = 'Contáctanos';

  // About section state
  includeAbout = true;
  aboutTitle = 'Desarrollo con Propósito';
  aboutText = 'Soy un desarrollador comprometido con el éxito de mis clientes. Ofrezco experiencia combinando estética moderna con arquitecturas web de alto nivel, permitiendo digitalizar y automatizar tus procesos comerciales.';
  aboutStat1Val = '10+';
  aboutStat1Lbl = 'Proyectos Demo';
  aboutStat2Val = '100%';
  aboutStat2Lbl = 'Soporte Premium';

  // Services section state
  includeServices = true;
  servicesTitle = 'Servicios Disponibles';
  servicesList: ServiceItem[] = [
    { id: 1, title: 'E-commerce a Medida', description: 'Plataformas de venta online rápidas, seguras y autogestionables para maximizar conversiones.' },
    { id: 2, title: 'Sistemas de IA', description: 'Automatización de chat y flujos operativos mediante inteligencia artificial para tu negocio.' },
    { id: 3, title: 'Aplicaciones Móviles', description: 'Desarrollo móvil nativo y PWAs instalables para una experiencia inmersiva.' }
  ];

  // Carousel section state
  includeCarousel = true;
  carouselTitle = 'Catálogo de Diseños';
  carouselIndex = 0;
  productsList: ProductItem[] = [
    { id: 1, title: 'Langing page Minimal', price: '$299', image: '📦' },
    { id: 2, title: 'E-commerce Premium', price: '$599', image: '📦' },
    { id: 3, title: 'Sistema Web ERP', price: '$999', image: '📦' },
    { id: 4, title: 'Soporte DevOps', price: '$150', image: '📦' }
  ];

  // Banner section state
  includeBanner = true;
  bannerText = '¿Listo para llevar tu marca al siguiente nivel digital?';
  bannerCta = '¡Solicitar Demo!';

  // Contact section state
  includeContact = true;
  contactTitle = 'Contáctanos';
  contactEmail = 'santiago@portalink.co';
  contactPhone = '+57 300 123 4567';

  // Footer section state
  includeFooter = true;
  footerCopy = '© 2026 Portalink Studio. Todos los derechos reservados.';

  // Theme presets
  themes: ThemePreset[] = [
    { id: 'dark-cyber', name: 'Cyber Glow', primary: '#ffffff', bg: '#08080c', cardBg: '#111118', accent: '#00f5ff', lightTheme: false },
    { id: 'minimal-luxury', name: 'Luxury Minimal', primary: '#ffffff', bg: '#050505', cardBg: '#121212', accent: '#e5c158', lightTheme: false },
    { id: 'ocean-glass', name: 'Ocean Glass', primary: '#ffffff', bg: '#0a192f', cardBg: '#112240', accent: '#64ffda', lightTheme: false },
    { id: 'editorial-warm', name: 'Editorial Warm', primary: '#2d2d2d', bg: '#fbf9f4', cardBg: '#f2eee3', accent: '#e05a47', lightTheme: true },
    { id: 'emerald-forest', name: 'Emerald Forest', primary: '#ffffff', bg: '#051610', cardBg: '#0b241c', accent: '#10b981', lightTheme: false },
    { id: 'sunset-peach', name: 'Sunset Peach', primary: '#2d2d2d', bg: '#fffaf5', cardBg: '#fef0e6', accent: '#f97316', lightTheme: true },
    { id: 'orchid-purple', name: 'Orchid Purple', primary: '#ffffff', bg: '#0d0516', cardBg: '#180a29', accent: '#a855f7', lightTheme: false },
    { id: 'carbon-slate', name: 'Carbon Slate', primary: '#ffffff', bg: '#0f172a', cardBg: '#1e293b', accent: '#94a3b8', lightTheme: false }
  ];

  selectedTheme = this.themes[0];

  constructor(private router: Router) {}

  ngOnInit() {}

  toggleAccordion(section: string) {
    if (this.activeAccordion === section) {
      this.activeAccordion = '';
    } else {
      this.activeAccordion = section;
    }
  }

  selectTheme(theme: ThemePreset) {
    this.selectedTheme = theme;
  }

  // Services Helpers
  addService() {
    const nextId = this.servicesList.length ? Math.max(...this.servicesList.map(s => s.id)) + 1 : 1;
    this.servicesList.push({
      id: nextId,
      title: 'Nuevo Servicio',
      description: 'Descripción breve de la solución y características.'
    });
  }

  removeService(id: number) {
    this.servicesList = this.servicesList.filter(s => s.id !== id);
  }

  // Product Helpers
  addProduct() {
    const nextId = this.productsList.length ? Math.max(...this.productsList.map(p => p.id)) + 1 : 1;
    this.productsList.push({
      id: nextId,
      title: 'Nuevo Producto',
      price: '$99',
      image: '📦'
    });
  }

  removeProduct(id: number) {
    this.productsList = this.productsList.filter(p => p.id !== id);
  }

  // Carousel slider helper
  slidePrev() {
    if (this.carouselIndex > 0) {
      this.carouselIndex--;
    }
  }

  slideNext() {
    if (this.carouselIndex < this.productsList.length - 2) {
      this.carouselIndex++;
    }
  }

  // Login simulation helpers
  openLoginModal() {
    this.showLoginModal = true;
  }

  closeLoginModal() {
    this.showLoginModal = false;
  }

  // Launch Design
  submitDesign() {
    this.showModal = true;
  }

  confirmLaunch() {
    this.showModal = false;

    // Build the customization payload message for Rotbot
    let payload = `¡Hola! Quiero iniciar el desarrollo de mi landing page personalizada. Estos son mis requerimientos:\n\n`;
    payload += `🎨 **Estilo & Tema:** ${this.selectedTheme.name} (${this.selectedTheme.id})\n`;
    payload += `🔤 **Tipografía:** ${this.selectedFont}\n\n`;
    payload += `**Secciones Configuradas:**\n`;
    
    if (this.includeNavbar) {
      payload += `- **Cabecera:** Logo: "${this.siteTitle}" ${this.showLoginBtn ? '(Con Login)' : ''}\n`;
    }
    if (this.includeHero) {
      payload += `- **Portada (Hero):** Subtítulo: "${this.heroSubtitle}", Título: "${this.heroTitle.replace(/\n/g, ' ')}"\n`;
    }
    if (this.includeAbout) {
      payload += `- **Nosotros:** Título: "${this.aboutTitle}", Stats: [${this.aboutStat1Val} ${this.aboutStat1Lbl}] [${this.aboutStat2Val} ${this.aboutStat2Lbl}]\n`;
    }
    if (this.includeServices) {
      payload += `- **Servicios (${this.servicesList.length}):** ${this.servicesList.map(s => s.title).join(', ')}\n`;
    }
    if (this.includeCarousel) {
      payload += `- **Catálogo/Carrusel (${this.productsList.length}):** ${this.productsList.map(p => `${p.title} (${p.price})`).join(', ')}\n`;
    }
    if (this.includeBanner) {
      payload += `- **Banner Promocional:** "${this.bannerText}" [${this.bannerCta}]\n`;
    }
    if (this.includeContact) {
      payload += `- **Contacto:** Título: "${this.contactTitle}", Email: "${this.contactEmail}", Tel: "${this.contactPhone}"\n`;
    }
    if (this.includeFooter) {
      payload += `- **Pie de Página (Footer):** "${this.footerCopy}"\n`;
    }

    // Redirect to rotbot page component and load it as a shared conversation input
    this.router.navigate(['/rotbot']).then(() => {
      // Dispatch standard window trigger event with the details payload
      setTimeout(() => {
        const event = new CustomEvent('open-ai-chat', {
          detail: { message: payload }
        });
        window.dispatchEvent(event);
      }, 500);
    });
  }
}
