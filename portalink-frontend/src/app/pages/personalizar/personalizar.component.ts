import { Component, OnInit, DoCheck, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SiteService } from '../../services/site.service';
import { AuthService } from '../../services/auth.service';

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
            <!-- Volver a Vista de Planes -->
            <button routerLink="/planes" class="text-[10px] text-white/40 hover:text-white/80 transition-colors uppercase tracking-wider font-bold mb-4 flex items-center gap-2 focus:outline-none">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"></path></svg>
              Volver a Planes
            </button>
            <span class="text-[9px] font-bold uppercase tracking-[0.25em] text-[#00f5ff]" style="color: var(--accent-color);">Editor Visual Premium</span>
            <h1 class="text-2xl font-bold uppercase tracking-tight text-white mt-1">{{ getTranslation('editorTitle') }}</h1>
            <p class="text-xs text-white/50 mt-1.5 leading-relaxed">
              {{ getTranslation('editorSubtitle') }}
            </p>
          </div>

          <!-- Collapsible Accordion sections (scrollable) -->
          <div class="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-4">
            
            <!-- SECTION 1: ESTILO & APARIENCIA -->
            <div class="accordion-item border rounded-2xl overflow-hidden" [class.open]="activeAccordion === 'style'">
              <button (click)="toggleAccordion('style')" class="w-full flex items-center justify-between p-4 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                <span class="text-xs font-bold uppercase tracking-widest text-white/80 flex items-center gap-2.5">
                  <svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 0 1-4-4V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v12a4 4 0 0 1-4 4zm0 0h12a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 0 1 2.828 0l2.829 2.829a2 2 0 0 1 0 2.828l-8.486 8.485M7 17h.01"></path></svg>
                  {{ getTranslation('tabStyle') }}
                </span>
                <svg class="w-3.5 h-3.5 text-white/40 transition-transform duration-300" [class.rotate-180]="activeAccordion === 'style'" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"></path>
                </svg>
              </button>
              
              <div class="accordion-content p-4 border-t flex flex-col gap-4" *ngIf="activeAccordion === 'style'">
                <!-- Language Changer Toggle -->
                <div class="flex flex-col gap-2">
                  <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">{{ getTranslation('languageLabel') }}</label>
                  <div class="grid grid-cols-2 gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                    <button (click)="changeLanguage('es')" [class.active-btn-shape]="currentLanguage === 'es'" class="py-2 text-[10px] uppercase font-bold text-white/60 hover:text-white rounded-lg transition-all">
                      ES (Español)
                    </button>
                    <button (click)="changeLanguage('en')" [class.active-btn-shape]="currentLanguage === 'en'" class="py-2 text-[10px] uppercase font-bold text-white/60 hover:text-white rounded-lg transition-all">
                      EN (English)
                    </button>
                  </div>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">{{ getTranslation('palettes') }}</label>
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
                  <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">{{ getTranslation('typography') }}</label>
                  <select [(ngModel)]="selectedFont" class="custom-select p-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none">
                    <option value="font-sans">Inter (Sans-serif moderno)</option>
                    <option value="font-serif">Playfair (Serif elegante)</option>
                    <option value="font-mono">Fira Code (Monospace tecnológico)</option>
                  </select>
                </div>

                <!-- Button Roundness Selector -->
                <div class="flex flex-col gap-2">
                  <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">{{ getTranslation('buttonShape') }}</label>
                  <div class="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                    <button (click)="buttonStyle = 'rounded-none'" [class.active-btn-shape]="buttonStyle === 'rounded-none'" class="py-2 text-[10px] uppercase font-bold text-white/60 hover:text-white rounded-lg transition-all">
                      Square
                    </button>
                    <button (click)="buttonStyle = 'rounded-xl'" [class.active-btn-shape]="buttonStyle === 'rounded-xl'" class="py-2 text-[10px] uppercase font-bold text-white/60 hover:text-white rounded-lg transition-all">
                      Rounded
                    </button>
                    <button (click)="buttonStyle = 'rounded-full'" [class.active-btn-shape]="buttonStyle === 'rounded-full'" class="py-2 text-[10px] uppercase font-bold text-white/60 hover:text-white rounded-lg transition-all">
                      Pill
                    </button>
                  </div>
                </div>

                <!-- Card Border Glow Selector -->
                <div class="flex flex-col gap-2">
                  <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">{{ getTranslation('cardBorders') }}</label>
                  <select [(ngModel)]="cardBorderStyle" class="custom-select p-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none">
                    <option value="border-minimal">Fino Minimalista</option>
                    <option value="border-glow">Neon Glow (Brillo)</option>
                    <option value="border-glass">Efecto Glassmorphic</option>
                  </select>
                </div>

                <!-- Title Font Size Slider -->
                <div class="flex flex-col gap-2">
                  <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">{{ getTranslation('titleSize') }} ({{ titleFontSize }}px)</label>
                  <input type="range" min="32" max="72" [(ngModel)]="titleFontSize" class="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00f5ff]" />
                </div>

                <!-- Body Font Size Slider -->
                <div class="flex flex-col gap-2">
                  <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">{{ getTranslation('bodySize') }} ({{ bodyFontSize }}px)</label>
                  <input type="range" min="11" max="18" [(ngModel)]="bodyFontSize" class="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00f5ff]" />
                </div>
              </div>
            </div>

            <!-- SECTION 2: CABECERA (NAVBAR) -->
            <div class="accordion-item border rounded-2xl overflow-hidden" [class.open]="activeAccordion === 'navbar'">
              <button (click)="toggleAccordion('navbar')" class="w-full flex items-center justify-between p-4 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                <span class="text-xs font-bold uppercase tracking-widest text-white/80 flex items-center gap-2.5">
                  <svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="5" rx="1"></rect><rect x="3" y="11" width="18" height="10" rx="1"></rect></svg>
                  {{ getTranslation('tabNavbar') }}
                </span>
                <svg class="w-3.5 h-3.5 text-white/40 transition-transform duration-300" [class.rotate-180]="activeAccordion === 'navbar'" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"></path>
                </svg>
              </button>
              
              <div class="accordion-content p-4 border-t flex flex-col gap-4" *ngIf="activeAccordion === 'navbar'">
                <div class="flex items-center justify-between toggle-row p-3 rounded-xl border" (click)="includeNavbar = !includeNavbar">
                  <span class="text-xs font-semibold text-white">{{ getTranslation('showNavbar') }}</span>
                  <div class="custom-switch" [class.on]="includeNavbar"></div>
                </div>

                <div *ngIf="includeNavbar" class="flex flex-col gap-3">
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">{{ getTranslation('logoTitle') }}</label>
                    <input type="text" [(ngModel)]="siteTitle" class="custom-input py-2.5 px-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none" />
                  </div>

                  <!-- Brand Icon Selection -->
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">{{ getTranslation('brandIconLabel') }}</label>
                    <div class="grid grid-cols-4 gap-2">
                      <button *ngFor="let iconOpt of brandIconOptions" (click)="brandIcon = iconOpt.id"
                              [class.border-cyan-500]="brandIcon === iconOpt.id"
                              [class.bg-white/5]="brandIcon === iconOpt.id"
                              class="p-2.5 border border-white/10 rounded-xl flex flex-col items-center gap-1 hover:bg-white/5 transition-all text-white">
                        <span class="opacity-80" [innerHTML]="iconOpt.svg"></span>
                        <span class="text-[8px] uppercase font-bold tracking-tight opacity-55 mt-1">{{ iconOpt.name }}</span>
                      </button>
                    </div>
                  </div>

                  <div class="flex items-center justify-between toggle-row p-3 rounded-xl border" (click)="showLoginBtn = !showLoginBtn">
                    <span class="text-xs font-semibold text-white">{{ getTranslation('showLogin') }}</span>
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
                  {{ getTranslation('tabHero') }}
                </span>
                <svg class="w-3.5 h-3.5 text-white/40 transition-transform duration-300" [class.rotate-180]="activeAccordion === 'hero'" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"></path>
                </svg>
              </button>
              
              <div class="accordion-content p-4 border-t flex flex-col gap-4" *ngIf="activeAccordion === 'hero'">
                <div class="flex items-center justify-between toggle-row p-3 rounded-xl border" (click)="includeHero = !includeHero">
                  <span class="text-xs font-semibold text-white">{{ getTranslation('activateHero') }}</span>
                  <div class="custom-switch" [class.on]="includeHero"></div>
                </div>

                <div *ngIf="includeHero" class="flex flex-col gap-3">
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">{{ getTranslation('heroSubtitleLbl') }}</label>
                    <input type="text" [(ngModel)]="heroSubtitle" class="custom-input py-2.5 px-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none" />
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">{{ getTranslation('heroTitleLbl') }}</label>
                    <textarea rows="3" [(ngModel)]="heroTitle" class="custom-input py-2.5 px-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none resize-none"></textarea>
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">{{ getTranslation('heroDescLbl') }}</label>
                    <textarea rows="3" [(ngModel)]="heroDescription" class="custom-input py-2.5 px-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none resize-none"></textarea>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div class="flex flex-col gap-1.5">
                      <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">{{ getTranslation('btn1Lbl') }}</label>
                      <input type="text" [(ngModel)]="heroCta1" class="custom-input py-2.5 px-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none" />
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">{{ getTranslation('btn2Lbl') }}</label>
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
                  {{ getTranslation('tabAbout') }}
                </span>
                <svg class="w-3.5 h-3.5 text-white/40 transition-transform duration-300" [class.rotate-180]="activeAccordion === 'about'" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"></path>
                </svg>
              </button>
              
              <div class="accordion-content p-4 border-t flex flex-col gap-4" *ngIf="activeAccordion === 'about'">
                <div class="flex items-center justify-between toggle-row p-3 rounded-xl border" (click)="includeAbout = !includeAbout">
                  <span class="text-xs font-semibold text-white">{{ getTranslation('activateAbout') }}</span>
                  <div class="custom-switch" [class.on]="includeAbout"></div>
                </div>

                <div *ngIf="includeAbout" class="flex flex-col gap-3">
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">{{ getTranslation('sectionTitle') }}</label>
                    <input type="text" [(ngModel)]="aboutTitle" class="custom-input py-2.5 px-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none" />
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">{{ getTranslation('descText') }}</label>
                    <textarea rows="4" [(ngModel)]="aboutText" class="custom-input py-2.5 px-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none resize-none"></textarea>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-2 mt-2">
                    <div class="flex flex-col gap-1.5">
                      <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">{{ getTranslation('successStat1') }}</label>
                      <input type="text" [(ngModel)]="aboutStat1Val" placeholder="Ej: 5+" class="custom-input py-2 px-2.5 rounded-xl border text-xs text-white bg-transparent focus:outline-none" />
                      <input type="text" [(ngModel)]="aboutStat1Lbl" placeholder="Años exp" class="custom-input py-2 px-2.5 rounded-xl border text-[10px] text-white bg-transparent focus:outline-none" />
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">{{ getTranslation('successStat2') }}</label>
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
                  {{ getTranslation('tabServices') }}
                </span>
                <svg class="w-3.5 h-3.5 text-white/40 transition-transform duration-300" [class.rotate-180]="activeAccordion === 'services'" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"></path>
                </svg>
              </button>
              
              <div class="accordion-content p-4 border-t flex flex-col gap-4" *ngIf="activeAccordion === 'services'">
                <div class="flex items-center justify-between toggle-row p-3 rounded-xl border" (click)="includeServices = !includeServices">
                  <span class="text-xs font-semibold text-white">{{ getTranslation('activateServices') }}</span>
                  <div class="custom-switch" [class.on]="includeServices"></div>
                </div>

                <div *ngIf="includeServices" class="flex flex-col gap-3">
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">{{ getTranslation('sectionTitle') }}</label>
                    <input type="text" [(ngModel)]="servicesTitle" class="custom-input py-2.5 px-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none" />
                  </div>

                  <!-- Services Items Editor -->
                  <div class="flex flex-col gap-3 mt-2">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">{{ getTranslation('servicesListLbl') }}</label>
                    
                    <div *ngFor="let srv of servicesList; let index = index" class="p-3 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-2">
                      <div class="flex items-center justify-between">
                        <span class="text-[10px] font-bold text-white/50">{{ getTranslation('serviceLabel') }} #{{ index + 1 }}</span>
                        <button (click)="removeService(srv.id)" class="text-red-500 hover:text-red-400 text-[10px] uppercase font-bold">{{ getTranslation('deleteBtn') }}</button>
                      </div>
                      <input type="text" [(ngModel)]="srv.title" class="custom-input py-1.5 px-2.5 rounded-lg border text-xs text-white focus:outline-none" />
                      <textarea rows="2" [(ngModel)]="srv.description" class="custom-input py-1.5 px-2.5 rounded-lg border text-[11px] text-white focus:outline-none resize-none"></textarea>
                    </div>

                    <button (click)="addService()" class="py-2.5 rounded-xl border border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors text-xs font-semibold mt-1">
                      {{ getTranslation('addServiceBtn') }}
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
                  {{ getTranslation('tabCarousel') }}
                </span>
                <svg class="w-3.5 h-3.5 text-white/40 transition-transform duration-300" [class.rotate-180]="activeAccordion === 'carousel'" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"></path>
                </svg>
              </button>
              
              <div class="accordion-content p-4 border-t flex flex-col gap-4" *ngIf="activeAccordion === 'carousel'">
                <div class="flex items-center justify-between toggle-row p-3 rounded-xl border" (click)="includeCarousel = !includeCarousel">
                  <span class="text-xs font-semibold text-white">{{ getTranslation('activateCarousel') }}</span>
                  <div class="custom-switch" [class.on]="includeCarousel"></div>
                </div>

                <div *ngIf="includeCarousel" class="flex flex-col gap-3">
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">{{ getTranslation('sectionTitle') }}</label>
                    <input type="text" [(ngModel)]="carouselTitle" class="custom-input py-2.5 px-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none" />
                  </div>

                  <!-- Product Items Editor -->
                  <div class="flex flex-col gap-3 mt-2">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">{{ getTranslation('productsListLbl') }}</label>
                    
                    <div *ngFor="let prod of productsList; let index = index" class="p-3 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-2">
                      <div class="flex items-center justify-between">
                        <span class="text-[10px] font-bold text-white/50">{{ getTranslation('productLabel') }} #{{ index + 1 }}</span>
                        <button (click)="removeProduct(prod.id)" class="text-red-500 hover:text-red-400 text-[10px] uppercase font-bold">{{ getTranslation('deleteBtn') }}</button>
                      </div>
                      <div class="grid grid-cols-3 gap-2">
                        <input type="text" [(ngModel)]="prod.title" class="col-span-2 custom-input py-1.5 px-2 rounded-lg border text-xs text-white focus:outline-none" />
                        <input type="text" [(ngModel)]="prod.price" class="col-span-1 custom-input py-1.5 px-2 rounded-lg border text-xs text-white focus:outline-none" />
                      </div>
                    </div>

                    <button (click)="addProduct()" class="py-2.5 rounded-xl border border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors text-xs font-semibold mt-1">
                      {{ getTranslation('addProductBtn') }}
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
                  {{ getTranslation('tabBanner') }}
                </span>
                <svg class="w-3.5 h-3.5 text-white/40 transition-transform duration-300" [class.rotate-180]="activeAccordion === 'banner'" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"></path>
                </svg>
              </button>
              
              <div class="accordion-content p-4 border-t flex flex-col gap-4" *ngIf="activeAccordion === 'banner'">
                <div class="flex items-center justify-between toggle-row p-3 rounded-xl border" (click)="includeBanner = !includeBanner">
                  <span class="text-xs font-semibold text-white">{{ getTranslation('activateBanner') }}</span>
                  <div class="custom-switch" [class.on]="includeBanner"></div>
                </div>

                <div *ngIf="includeBanner" class="flex flex-col gap-3">
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">{{ getTranslation('bannerTextLbl') }}</label>
                    <input type="text" [(ngModel)]="bannerText" class="custom-input py-2.5 px-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none" />
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">{{ getTranslation('bannerCtaLbl') }}</label>
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
                  {{ getTranslation('tabContact') }}
                </span>
                <svg class="w-3.5 h-3.5 text-white/40 transition-transform duration-300" [class.rotate-180]="activeAccordion === 'contact'" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"></path>
                </svg>
              </button>
              
              <div class="accordion-content p-4 border-t flex flex-col gap-4" *ngIf="activeAccordion === 'contact'">
                <div class="flex items-center justify-between toggle-row p-3 rounded-xl border" (click)="includeContact = !includeContact">
                  <span class="text-xs font-semibold text-white">{{ getTranslation('activateContact') }}</span>
                  <div class="custom-switch" [class.on]="includeContact"></div>
                </div>

                <div *ngIf="includeContact" class="flex flex-col gap-3">
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">{{ getTranslation('sectionTitle') }}</label>
                    <input type="text" [(ngModel)]="contactTitle" class="custom-input py-2.5 px-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none" />
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">{{ getTranslation('emailLbl') }}</label>
                    <input type="email" [(ngModel)]="contactEmail" class="custom-input py-2.5 px-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none" />
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">{{ getTranslation('phoneLbl') }}</label>
                    <input type="text" [(ngModel)]="contactPhone" class="custom-input py-2.5 px-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>

            <!-- SECTION 9: REDES SOCIALES -->
            <div class="accordion-item border rounded-2xl overflow-hidden" [class.open]="activeAccordion === 'socials'">
              <button (click)="toggleAccordion('socials')" class="w-full flex items-center justify-between p-4 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                <span class="text-xs font-bold uppercase tracking-widest text-white/80 flex items-center gap-2.5">
                  <svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-.778.099-1.533.284-2.253"></path></svg>
                  {{ getTranslation('tabSocials') }}
                </span>
                <svg class="w-3.5 h-3.5 text-white/40 transition-transform duration-300" [class.rotate-180]="activeAccordion === 'socials'" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"></path>
                </svg>
              </button>
              
              <div class="accordion-content p-4 border-t flex flex-col gap-4" *ngIf="activeAccordion === 'socials'">
                <!-- Instagram Link -->
                <div class="flex flex-col gap-2 p-3 rounded-xl border border-white/5 bg-white/[0.01]">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold text-white">Instagram</span>
                    <div class="custom-switch" [class.on]="showInstagram" (click)="showInstagram = !showInstagram"></div>
                  </div>
                  <input *ngIf="showInstagram" type="text" [(ngModel)]="instagramLink" placeholder="https://instagram.com/tu_perfil" class="custom-input py-2 px-3 rounded-lg border text-xs text-white bg-transparent focus:outline-none" />
                </div>

                <!-- TikTok Link -->
                <div class="flex flex-col gap-2 p-3 rounded-xl border border-white/5 bg-white/[0.01]">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold text-white">TikTok</span>
                    <div class="custom-switch" [class.on]="showTiktok" (click)="showTiktok = !showTiktok"></div>
                  </div>
                  <input *ngIf="showTiktok" type="text" [(ngModel)]="tiktokLink" placeholder="https://tiktok.com/@tu_perfil" class="custom-input py-2 px-3 rounded-lg border text-xs text-white bg-transparent focus:outline-none" />
                </div>

                <!-- WhatsApp Link -->
                <div class="flex flex-col gap-2 p-3 rounded-xl border border-white/5 bg-white/[0.01]">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold text-white">WhatsApp</span>
                    <div class="custom-switch" [class.on]="showWhatsapp" (click)="showWhatsapp = !showWhatsapp"></div>
                  </div>
                  <input *ngIf="showWhatsapp" type="text" [(ngModel)]="whatsappLink" placeholder="https://wa.me/573000000000" class="custom-input py-2 px-3 rounded-lg border text-xs text-white bg-transparent focus:outline-none" />
                </div>

                <!-- LinkedIn Link -->
                <div class="flex flex-col gap-2 p-3 rounded-xl border border-white/5 bg-white/[0.01]">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold text-white">LinkedIn</span>
                    <div class="custom-switch" [class.on]="showLinkedin" (click)="showLinkedin = !showLinkedin"></div>
                  </div>
                  <input *ngIf="showLinkedin" type="text" [(ngModel)]="linkedinLink" placeholder="https://linkedin.com/in/tu_perfil" class="custom-input py-2 px-3 rounded-lg border text-xs text-white bg-transparent focus:outline-none" />
                </div>
              </div>
            </div>

            <!-- SECTION 10: FOOTER -->
            <div class="accordion-item border rounded-2xl overflow-hidden" [class.open]="activeAccordion === 'footer'">
              <button (click)="toggleAccordion('footer')" class="w-full flex items-center justify-between p-4 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                <span class="text-xs font-bold uppercase tracking-widest text-white/80 flex items-center gap-2.5">
                  <svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                  {{ getTranslation('tabFooter') }}
                </span>
                <svg class="w-3.5 h-3.5 text-white/40 transition-transform duration-300" [class.rotate-180]="activeAccordion === 'footer'" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"></path>
                </svg>
              </button>
              
              <div class="accordion-content p-4 border-t flex flex-col gap-4" *ngIf="activeAccordion === 'footer'">
                <div class="flex items-center justify-between toggle-row p-3 rounded-xl border" (click)="includeFooter = !includeFooter">
                  <span class="text-xs font-semibold text-white">{{ getTranslation('activateFooter') }}</span>
                  <div class="custom-switch" [class.on]="includeFooter"></div>
                </div>

                <div *ngIf="includeFooter" class="flex flex-col gap-3">
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[9px] uppercase tracking-widest font-bold text-white/40">{{ getTranslation('copyrightLbl') }}</label>
                    <input type="text" [(ngModel)]="footerCopy" class="custom-input py-2.5 px-3 rounded-xl border text-xs text-white bg-transparent focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Bottom Panel Action -->
          <div class="p-6 border-t border-white/10 bg-[#07070a] flex flex-col gap-2.5">
            <button (click)="openLiveSite()" class="launch-btn w-full py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-600 text-black shadow-lg shadow-cyan-500/20">
              <span>👁️ Ver Sitio Desplegado</span>
            </button>
            <button (click)="submitDesign()" class="w-full py-2 rounded-xl text-[11px] text-neutral-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 font-medium">
              <span>💬 Consultar con Rotbot IA</span>
            </button>
          </div>
        </aside>

        <!-- RIGHT PANEL: Giant Live Preview -->
        <main class="flex-grow h-full bg-[#0d0d0f] overflow-hidden p-10 flex flex-col items-center">
          <div class="w-full max-w-[1000px] flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <h2 class="text-xs font-bold uppercase tracking-[0.2em] text-white/30">{{ getTranslation('livePreviewTitle') }}</h2>
              <span *ngIf="isSaving" class="text-[10px] bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-2.5 py-0.5 rounded-full font-medium animate-pulse flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Sincronizando...
              </span>
              <span *ngIf="!isSaving" class="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Desplegado en vivo
              </span>
            </div>
            <div class="flex items-center gap-2">
              <button (click)="openLiveSite()"
                      class="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95">
                <span>👁️ Ver Sitio</span>
              </button>
              <span class="text-[10px] text-white/40 bg-white/5 border border-white/10 px-3 py-1 rounded-full uppercase tracking-wider font-semibold">{{ getTranslation('responsiveBadge') }}</span>
              <div class="flex gap-1.5 items-center">
                <span class="w-2.5 h-2.5 rounded-full bg-red-500/75"></span>
                <span class="w-2.5 h-2.5 rounded-full bg-yellow-500/75"></span>
                <span class="w-2.5 h-2.5 rounded-full bg-green-500/75"></span>
              </div>
            </div>
          </div>

          <!-- The Live Web Mockup Page -->
          <div class="w-full max-w-[1000px] h-[calc(100vh-180px)] bg-white rounded-3xl border shadow-2xl overflow-y-auto custom-scrollbar transition-all duration-500 flex flex-col justify-start web-mockup-container {{ selectedFont }}"
               [style.background]="selectedTheme.bg"
               [style.borderColor]="selectedTheme.accent + '22'"
               [style.color]="selectedTheme.primary">
            
            <!-- 1. NAVBAR MOCKUP -->
            <nav *ngIf="includeNavbar" class="flex items-center justify-between px-8 py-5 border-b sticky top-0 backdrop-blur-md z-[10]"
                 [style.background]="selectedTheme.bg + 'ee'"
                 [style.borderColor]="selectedTheme.primary + '11'">
              <div class="flex items-center gap-2">
                <!-- Selected Brand Icon SVG -->
                <span *ngIf="brandIcon" [style.color]="selectedTheme.accent" class="flex items-center" [ngSwitch]="brandIcon">
                  <span *ngSwitchCase="'sparkles'" [innerHTML]="getBrandIconSvg('sparkles')"></span>
                  <span *ngSwitchCase="'bolt'" [innerHTML]="getBrandIconSvg('bolt')"></span>
                  <span *ngSwitchCase="'star'" [innerHTML]="getBrandIconSvg('star')"></span>
                  <span *ngSwitchCase="'code'" [innerHTML]="getBrandIconSvg('code')"></span>
                </span>
                <span class="text-sm font-bold tracking-wider uppercase">{{ siteTitle || 'MI NEGOCIO' }}</span>
              </div>
              
              <div class="flex gap-6 items-center">
                <a href="#" (click)="scrollToMockupSection('prev-hero', $event)" *ngIf="includeHero" class="text-[10px] uppercase tracking-widest font-semibold opacity-70 hover:opacity-100 transition-opacity">{{ getTranslation('navHome') }}</a>
                <a href="#" (click)="scrollToMockupSection('prev-about', $event)" *ngIf="includeAbout" class="text-[10px] uppercase tracking-widest font-semibold opacity-70 hover:opacity-100 transition-opacity">{{ getTranslation('navAbout') }}</a>
                <a href="#" (click)="scrollToMockupSection('prev-services', $event)" *ngIf="includeServices" class="text-[10px] uppercase tracking-widest font-semibold opacity-70 hover:opacity-100 transition-opacity">{{ getTranslation('navServices') }}</a>
                <a href="#" (click)="scrollToMockupSection('prev-carousel', $event)" *ngIf="includeCarousel" class="text-[10px] uppercase tracking-widest font-semibold opacity-70 hover:opacity-100 transition-opacity">{{ getTranslation('navProducts') }}</a>
                <a href="#" (click)="scrollToMockupSection('prev-contact', $event)" *ngIf="includeContact" class="text-[10px] uppercase tracking-widest font-semibold opacity-70 hover:opacity-100 transition-opacity">{{ getTranslation('navContact') }}</a>
              </div>
              <div class="flex items-center gap-3">
                <button *ngIf="showLoginBtn" (click)="openLoginModal()" 
                        [class]="buttonStyle"
                        class="px-4 py-2 text-[10px] uppercase tracking-wider font-semibold border transition-all hover:bg-white/5"
                        [style.borderColor]="selectedTheme.primary + '22'"
                        [style.color]="selectedTheme.primary">
                  {{ getTranslation('loginBtn') }}
                </button>
                <button [class]="buttonStyle"
                        (click)="scrollToMockupSection('prev-contact', $event)"
                        class="px-4 py-2 text-[10px] uppercase tracking-wider font-bold transition-all hover:scale-105 active:scale-95"
                        [style.background]="selectedTheme.accent"
                        [style.color]="getAccentTextColor()">
                  {{ getTranslation('navContact') }}
                </button>
              </div>
            </nav>

            <!-- 2. HERO MOCKUP -->
            <section id="prev-hero" *ngIf="includeHero" class="px-8 md:px-16 py-20 flex flex-col gap-6 justify-center text-center md:text-left min-h-[500px]">
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
                <button [class]="buttonStyle"
                        class="px-7 py-3.5 text-xs font-bold uppercase tracking-widest transition-all hover:scale-105"
                        [style.background]="selectedTheme.accent"
                        [style.color]="getAccentTextColor()">
                  {{ heroCta1 || 'Empezar' }}
                </button>
                <button [class]="buttonStyle"
                        class="px-7 py-3.5 text-xs font-bold uppercase tracking-widest border transition-all hover:bg-white/5"
                        [style.borderColor]="selectedTheme.primary + '22'"
                        [style.color]="selectedTheme.primary">
                  {{ heroCta2 || 'Ver Más' }}
                </button>
              </div>
            </section>

            <!-- 3. ABOUT MOCKUP -->
            <section id="prev-about" *ngIf="includeAbout" class="px-8 md:px-16 py-16 border-t border-b grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
                     [style.borderColor]="selectedTheme.primary + '11'"
                     [style.background]="selectedTheme.lightTheme ? 'rgba(0,0,0,0.01)' : 'rgba(255,255,255,0.01)'">
              <div class="md:col-span-7 flex flex-col gap-4">
                <span class="text-[10px] font-bold uppercase tracking-widest opacity-40">{{ getTranslation('aboutUsTag') }}</span>
                <h3 class="font-bold uppercase tracking-tight" [style.fontSize.px]="titleFontSize * 0.6">{{ aboutTitle || 'Trayectoria & Propósito' }}</h3>
                <p class="font-light leading-relaxed opacity-75 whitespace-pre-line" [style.fontSize.px]="bodyFontSize">
                  {{ aboutText || 'Explicación detallada del valor que tu negocio ofrece y la experiencia que respalda tu trabajo.' }}
                </p>
              </div>
              
              <div class="md:col-span-5 grid grid-cols-2 gap-4">
                <div class="p-6 rounded-2xl border text-center flex flex-col gap-2 transition-all"
                     [style.background]="getCardStyles().background"
                     [style.border-color]="getCardStyles()['border-color']"
                     [style.box-shadow]="getCardStyles()['box-shadow']"
                     [style.backdrop-filter]="getCardStyles()['backdrop-filter']">
                  <span class="text-3xl font-bold" [style.color]="selectedTheme.accent">{{ aboutStat1Val || '10+' }}</span>
                  <span class="text-[9px] uppercase tracking-widest opacity-60 font-semibold">{{ aboutStat1Lbl || 'Éxito' }}</span>
                </div>
                <div class="p-6 rounded-2xl border text-center flex flex-col gap-2 transition-all"
                     [style.background]="getCardStyles().background"
                     [style.border-color]="getCardStyles()['border-color']"
                     [style.box-shadow]="getCardStyles()['box-shadow']"
                     [style.backdrop-filter]="getCardStyles()['backdrop-filter']">
                  <span class="text-3xl font-bold" [style.color]="selectedTheme.accent">{{ aboutStat2Val || '100%' }}</span>
                  <span class="text-[9px] uppercase tracking-widest opacity-60 font-semibold">{{ aboutStat2Lbl || 'Garantizado' }}</span>
                </div>
              </div>
            </section>

            <!-- 4. SERVICES MOCKUP -->
            <section id="prev-services" *ngIf="includeServices" class="px-8 md:px-16 py-20 flex flex-col gap-10">
              <div class="text-center flex flex-col gap-2 max-w-xl mx-auto">
                <span class="text-[10px] font-bold uppercase tracking-widest opacity-40">{{ getTranslation('portfolioTag') }}</span>
                <h3 class="font-bold uppercase tracking-tight" [style.fontSize.px]="titleFontSize * 0.6">{{ servicesTitle || 'Nuestros Servicios' }}</h3>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div *ngFor="let srv of servicesList" class="p-6 rounded-2xl border flex flex-col gap-3 transition-all hover:scale-[1.02]"
                     [style.background]="getCardStyles().background"
                     [style.border-color]="getCardStyles()['border-color']"
                     [style.box-shadow]="getCardStyles()['box-shadow']"
                     [style.backdrop-filter]="getCardStyles()['backdrop-filter']">
                  <span class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10" [style.borderColor]="selectedTheme.accent + '33'">
                    <span [style.color]="selectedTheme.accent">★</span>
                  </span>
                  <h4 class="text-sm font-bold uppercase tracking-wide">{{ srv.title }}</h4>
                  <p class="font-light opacity-70 leading-relaxed" [style.fontSize.px]="bodyFontSize">{{ srv.description }}</p>
                </div>
              </div>
            </section>

            <!-- 5. PRODUCTS CAROUSEL MOCKUP -->
            <section id="prev-carousel" *ngIf="includeCarousel" class="px-8 md:px-16 py-20 border-t border-b flex flex-col gap-8 overflow-hidden"
                     [style.borderColor]="selectedTheme.primary + '11'"
                     [style.background]="selectedTheme.lightTheme ? 'rgba(0,0,0,0.01)' : 'rgba(255,255,255,0.01)'">
              <div class="flex items-center justify-between">
                <div class="flex flex-col gap-2">
                  <span class="text-[10px] font-bold uppercase tracking-widest opacity-40">{{ getTranslation('catalogTag') }}</span>
                  <h3 class="font-bold uppercase tracking-tight" [style.fontSize.px]="titleFontSize * 0.6">{{ carouselTitle || 'Productos Destacados' }}</h3>
                </div>
                <div class="flex gap-2">
                  <button (click)="slidePrev()" class="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-white/5 text-xs" [style.borderColor]="selectedTheme.primary + '22'">◀</button>
                  <button (click)="slideNext()" class="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-white/5 text-xs" [style.borderColor]="selectedTheme.primary + '22'">▶</button>
                </div>
              </div>

              <div class="relative w-full overflow-hidden">
                <div class="flex gap-6 transition-transform duration-500" [style.transform]="'translateX(-' + (carouselIndex * 280) + 'px)'">
                  <div *ngFor="let prod of productsList" class="w-[260px] flex-shrink-0 p-4 rounded-2xl border flex flex-col gap-3 transition-all"
                       [style.background]="getCardStyles().background"
                       [style.border-color]="getCardStyles()['border-color']"
                       [style.box-shadow]="getCardStyles()['box-shadow']"
                       [style.backdrop-filter]="getCardStyles()['backdrop-filter']">
                    <div class="w-full h-40 rounded-xl bg-white/5 flex items-center justify-center relative overflow-hidden">
                      <span class="text-2xl opacity-40">📦</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <h4 class="text-xs font-bold uppercase tracking-wide max-w-[70%] truncate">{{ prod.title }}</h4>
                      <span class="text-xs font-semibold" [style.color]="selectedTheme.accent">{{ prod.price }}</span>
                    </div>
                    <button [class]="buttonStyle"
                            class="w-full py-2 text-[10px] uppercase font-bold tracking-widest text-center transition-all"
                            [style.background]="selectedTheme.accent"
                            [style.color]="getAccentTextColor()">
                      {{ getTranslation('buyNow') }}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <!-- 6. PROMO BANNERS MOCKUP -->
            <section *ngIf="includeBanner" class="px-8 md:px-16 py-12 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left"
                     [style.background]="selectedTheme.accent"
                     [style.color]="getAccentTextColor()">
              <h3 class="font-bold uppercase tracking-wide max-w-2xl" [style.fontSize.px]="titleFontSize * 0.5">
                {{ bannerText || '¿Quieres cotizar tu proyecto a medida?' }}
              </h3>
              <button [class]="buttonStyle"
                      class="px-6 py-3.5 text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 border"
                      [style.background]="getAccentTextColor() === '#ffffff' ? '#ffffff' : '#000000'"
                      [style.color]="getAccentTextColor() === '#ffffff' ? '#0f172a' : '#ffffff'">
                {{ bannerCta || 'Hablemos Hoy' }}
              </button>
            </section>

            <!-- 7. CONTACT MOCKUP -->
            <section id="prev-contact" *ngIf="includeContact" class="px-8 md:px-16 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              <div class="flex flex-col gap-4">
                <span class="text-[10px] font-bold uppercase tracking-widest opacity-40">{{ getTranslation('contactTag') }}</span>
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
              <div class="p-6 rounded-2xl border flex flex-col gap-3 transition-all font-sans"
                   [style.background]="getCardStyles().background"
                   [style.border-color]="getCardStyles()['border-color']"
                   [style.box-shadow]="getCardStyles()['box-shadow']"
                   [style.backdrop-filter]="getCardStyles()['backdrop-filter']">
                <input type="text" placeholder="Nombre completo" class="p-3 rounded-lg border text-xs bg-transparent focus:outline-none" [style.borderColor]="selectedTheme.primary + '11'" />
                <input type="email" placeholder="Correo electrónico" class="p-3 rounded-lg border text-xs bg-transparent focus:outline-none" [style.borderColor]="selectedTheme.primary + '11'" />
                <textarea rows="3" placeholder="Mensaje" class="p-3 rounded-lg border text-xs bg-transparent focus:outline-none resize-none" [style.borderColor]="selectedTheme.primary + '11'"></textarea>
                <button [class]="buttonStyle"
                        class="w-full py-3 text-xs font-bold uppercase tracking-widest transition-all"
                        [style.background]="selectedTheme.accent"
                        [style.color]="getAccentTextColor()">
                  {{ getTranslation('sendMsg') }}
                </button>
              </div>
            </section>

            <!-- 8. FOOTER MOCKUP -->
            <footer *ngIf="includeFooter" class="px-8 py-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-xs"
                    [style.borderColor]="selectedTheme.primary + '11'"
                    [style.background]="selectedTheme.cardBg">
              <span class="opacity-60" [style.fontSize.px]="bodyFontSize - 2">{{ footerCopy || '© 2026 Todos los derechos reservados.' }}</span>
              
              <!-- Social Networks Mockup Links -->
              <div class="flex items-center gap-4">
                <a *ngIf="showInstagram && instagramLink" [href]="instagramLink" target="_blank" class="hover:opacity-100 opacity-60 transition-opacity" [style.color]="selectedTheme.accent">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a *ngIf="showTiktok && tiktokLink" [href]="tiktokLink" target="_blank" class="hover:opacity-100 opacity-60 transition-opacity" [style.color]="selectedTheme.accent">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 18c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3v-9h4v4"></path>
                  </svg>
                </a>
                <a *ngIf="showWhatsapp && whatsappLink" [href]="whatsappLink" target="_blank" class="hover:opacity-100 opacity-60 transition-opacity" [style.color]="selectedTheme.accent">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 12a9 9 0 0 1 15-6.7L21 3l-2.3 3A9 9 0 1 1 3 12z"></path>
                  </svg>
                </a>
                <a *ngIf="showLinkedin && linkedinLink" [href]="linkedinLink" target="_blank" class="hover:opacity-100 opacity-60 transition-opacity" [style.color]="selectedTheme.accent">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"></path>
                  </svg>
                </a>
              </div>

              <div class="flex gap-6 opacity-60">
                <span>{{ getTranslation('terms') }}</span>
                <span>{{ getTranslation('privacy') }}</span>
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
            <h4 class="text-xl font-bold text-white">{{ getTranslation('modalTitle') }}</h4>
            <p class="text-sm font-light text-white/60 leading-relaxed mt-2">
              {{ getTranslation('modalText') }}
            </p>
          </div>
          <button (click)="confirmLaunch()" class="w-full py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs bg-white text-black hover:bg-white/95 transition-all">
            {{ getTranslation('modalBtn') }}
          </button>
        </div>
      </div>

      <!-- LOGIN MOCKUP MODAL -->
      <div *ngIf="showLoginModal" class="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
        <div class="bg-white text-neutral-900 p-8 max-w-sm w-full rounded-3xl shadow-2xl flex flex-col gap-4 relative animate-scale-up">
          <button (click)="closeLoginModal()" class="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 text-lg">✕</button>
          <div class="flex flex-col gap-1">
            <span class="text-[9px] font-bold uppercase tracking-widest text-[#00f5ff]" [style.color]="selectedTheme.accent">{{ getTranslation('loginModalTitle') }}</span>
            <h4 class="text-lg font-bold uppercase">{{ getTranslation('loginBtn') }}</h4>
          </div>
          <div class="flex flex-col gap-3 mt-2">
            <input type="email" placeholder="Email" class="p-3 border rounded-xl text-xs focus:outline-none" />
            <input type="password" placeholder="Contraseña" class="p-3 border rounded-xl text-xs focus:outline-none" />
            <button class="w-full py-3 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors">
              {{ getTranslation('loginBtn') }}
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .web-mockup-container h1,
    .web-mockup-container h2,
    .web-mockup-container h3,
    .web-mockup-container h4 {
      color: inherit;
    }
    .page-wrapper {
      background-color: var(--bg-primary, #07070a);
      transition: background-color 0.8s ease;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.25);
    }
    .accordion-item {
      border-color: rgba(255, 255, 255, 0.06);
      background: rgba(255, 255, 255, 0.01);
      transition: all 0.3s ease;
    }
    .accordion-item.open {
      border-color: rgba(255, 255, 255, 0.15);
      background: rgba(255, 255, 255, 0.03);
    }
    .accordion-content {
      border-color: rgba(255, 255, 255, 0.06);
    }
    .custom-input {
      background: rgba(255, 255, 255, 0.02);
      border-color: rgba(255, 255, 255, 0.08);
      transition: all 0.25s;
    }
    .custom-input:focus {
      border-color: rgba(255, 255, 255, 0.25);
      background: rgba(255, 255, 255, 0.05);
    }
    .custom-select {
      background: rgba(255, 255, 255, 0.02);
      border-color: rgba(255, 255, 255, 0.08);
    }
    .custom-select option {
      background: #0d0d12;
      color: #ffffff;
    }
    .theme-preset-btn {
      background: rgba(255, 255, 255, 0.01);
      border-color: rgba(255, 255, 255, 0.06);
    }
    .theme-preset-btn:hover {
      background: rgba(255, 255, 255, 0.03);
      border-color: rgba(255, 255, 255, 0.15);
    }
    .theme-preset-btn.active-theme {
      border-color: #00f5ff;
      background: rgba(0, 245, 255, 0.03);
    }
    .active-btn-shape {
      background: rgba(255, 255, 255, 0.15) !important;
      color: #ffffff !important;
    }
    .toggle-row {
      border-color: rgba(255, 255, 255, 0.06);
      background: rgba(255, 255, 255, 0.01);
      cursor: pointer;
      transition: all 0.2s;
    }
    .toggle-row:hover {
      background: rgba(255, 255, 255, 0.03);
      border-color: rgba(255, 255, 255, 0.12);
    }
    .custom-switch {
      width: 32px;
      height: 18px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.1);
      position: relative;
      transition: background 0.3s;
    }
    .custom-switch::after {
      content: '';
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #ffffff;
      position: absolute;
      top: 2px;
      left: 2px;
      transition: left 0.3s;
    }
    .custom-switch.on {
      background: #00f5ff;
    }
    .custom-switch.on::after {
      left: 16px;
    }
    .launch-btn {
      background: #ffffff;
      color: #000000;
    }
    .launch-btn:hover {
      box-shadow: 0 0 25px rgba(255, 255, 255, 0.2);
    }
    @keyframes scaleUp {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .animate-scale-up {
      animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .plan-card {
      border: 1px solid var(--card-border);
      background: var(--card-bg);
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .plan-card:hover {
      transform: translateY(-8px);
      border-color: var(--accent-color) !important;
      box-shadow: 0 20px 40px rgba(0, 245, 255, 0.05);
    }
    .plan-btn-outlined {
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #ffffff;
      background: transparent;
      transition: all 0.3s ease;
    }
    .plan-btn-outlined:hover {
      background: #ffffff !important;
      color: #000000 !important;
      border-color: #ffffff !important;
    }
    .plan-btn-filled {
      transition: all 0.3s ease;
    }
    .plan-btn-filled:hover {
      background: #ffffff !important;
      color: #000000 !important;
    }
    .service-card {
      border: 1px solid var(--card-border);
      background: var(--card-bg);
      transition: all 0.3s ease;
    }
    .service-card:hover {
      border-color: var(--accent-color) !important;
      background: var(--card-border) !important;
      transform: translateY(-4px);
    }
    .btn-primary-theme {
      background: var(--text-primary);
      color: var(--bg-primary);
      border: 1px solid var(--text-primary);
    }
    .btn-primary-theme:hover {
      background: var(--accent-color);
      color: #000000;
      border-color: var(--accent-color);
    }
    .btn-secondary-theme {
      border: 1px solid var(--card-border);
      color: var(--text-primary);
    }
    .btn-secondary-theme:hover {
      background: var(--text-primary);
      color: var(--bg-primary);
      border-color: var(--text-primary);
    }
  `]
})
export class PersonalizarComponent implements OnInit, DoCheck {
  isLoading = true;
  isSaving = false;
  currentSiteSlug: string = '';
  private autoSaveTimeout: any;
  private lastSavedJsonString: string = '';

  // General & Styling States
  activeAccordion = 'style';
  selectedFont = 'font-sans';
  titleFontSize = 48;
  bodyFontSize = 14;
  siteTitle = 'PORTALINK STUDIO';
  showModal = false;
  showLoginModal = false;

  // New Button and Card Style Variables
  buttonStyle = 'rounded-xl';
  cardBorderStyle = 'border-minimal';

  // New Brand Icon Option (sparkles, bolt, star, code)
  brandIcon = 'sparkles';
  brandIconOptions = [
    { id: 'sparkles', name: 'Sparkles', svg: '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.096L15 15l-5.187.904zM18 5.25L17.25 9 16.5 5.25 12.75 4.5 16.5 3.75 17.25 0l.75 3.75L21.75 4.5 18 5.25z"></path></svg>' },
    { id: 'bolt', name: 'Rayo', svg: '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"></path></svg>' },
    { id: 'star', name: 'Estrella', svg: '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499c.195-.39.771-.39.966 0l2.3 4.699 5.188.755c.43.063.602.583.291.89l-3.754 3.66.887 5.168c.074.43-.378.757-.76.552L12 16.782l-4.638 2.44c-.381.205-.833-.122-.76-.552l.887-5.168L3.733 13.5a.75.75 0 01.291-.89l5.188-.755 2.3-4.7z"></path></svg>' },
    { id: 'code', name: 'Código', svg: '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"></path></svg>' }
  ];

  // New Social Networks Variables
  showInstagram = true;
  instagramLink = 'https://instagram.com/portalink';
  showTiktok = true;
  tiktokLink = 'https://tiktok.com/@portalink';
  showHighlight = true;
  showWhatsapp = true;
  whatsappLink = 'https://wa.me/573001234567';
  showLinkedin = false;
  linkedinLink = 'https://linkedin.com/company/portalink';

  // Navbar section state
  includeNavbar = true;
  showLoginBtn = true;

  // Language Variables
  currentLanguage: 'es' | 'en' = 'es';

  // Translation dictionary for editor UI labels
  editorTranslations: any = {
    es: {
      editorTitle: 'Personalizar Sitio',
      editorSubtitle: 'Modifica la estructura, los contenidos y el estilo visual de tu landing page.',
      tabStyle: 'Estilo & Temas',
      palettes: 'Paleta de Colores',
      typography: 'Tipografía Global',
      buttonShape: 'Forma de Botones',
      cardBorders: 'Bordes de Tarjeta',
      titleSize: 'Tamaño del Título',
      bodySize: 'Tamaño del Cuerpo',
      languageLabel: 'Idioma de Interfaz y Contenido',
      
      tabNavbar: 'Cabecera (Navbar)',
      showNavbar: 'Mostrar Barra Superior',
      logoTitle: 'Título del Logo',
      brandIconLabel: 'Icono de la Marca',
      showLogin: 'Botones Ingreso/Registro',
      
      tabHero: 'Portada (Hero)',
      activateHero: 'Activar Sección Hero',
      heroSubtitleLbl: 'Línea Superior (Especialidad)',
      heroTitleLbl: 'Título Principal',
      heroDescLbl: 'Descripción de Apoyo',
      btn1Lbl: 'Botón 1 (Principal)',
      btn2Lbl: 'Botón 2 (Secundario)',
      
      tabAbout: 'Información (About)',
      activateAbout: 'Activar Sección About',
      sectionTitle: 'Título de Sección',
      descText: 'Texto Descriptivo',
      successStat1: 'Dato de Éxito 1',
      successStat2: 'Dato de Éxito 2',
      
      tabServices: 'Servicios',
      activateServices: 'Activar Sección Servicios',
      servicesListLbl: 'Lista de Servicios',
      serviceLabel: 'Servicio',
      deleteBtn: 'Eliminar',
      addServiceBtn: '+ Agregar Servicio',
      
      tabCarousel: 'Carrusel de Productos',
      activateCarousel: 'Activar Carrusel',
      productsListLbl: 'Lista de Productos',
      productLabel: 'Producto',
      addProductBtn: '+ Agregar Producto',
      
      tabBanner: 'Banner Publicitario',
      activateBanner: 'Activar Banner',
      bannerTextLbl: 'Texto de Llamado',
      bannerCtaLbl: 'Texto del Botón',
      
      tabContact: 'Contacto',
      activateContact: 'Activar Sección Contacto',
      emailLbl: 'Correo Electrónico',
      phoneLbl: 'Número de Teléfono',
      
      tabSocials: 'Redes Sociales',
      
      tabFooter: 'Footer (Pie de Página)',
      activateFooter: 'Activar Footer',
      copyrightLbl: 'Texto del Copyright',
      
      deployBtn: 'Desplegar Sitio Demo',
      modalTitle: '¡Estructura de Sitio Guardada!',
      modalText: 'Rotbot tiene toda la información de diseño, secciones y colores elegidos. Conversemos en pantalla completa para afinar el demo en vivo.',
      modalBtn: 'Iniciar Chat de Despliegue',
      
      loginModalTitle: 'Área Privada',
      loginBtn: 'Ingresar',
      loginClose: '✕',
      
      responsiveBadge: '100% Responsivo',
      livePreviewTitle: 'Previsualización del Sitio en Vivo',
      navHome: 'Inicio',
      navAbout: 'Nosotros',
      navServices: 'Servicios',
      navProducts: 'Productos',
      navContact: 'Contacto',
      
      aboutUsTag: 'Quiénes Somos',
      portfolioTag: 'Portafolio de Soluciones',
      catalogTag: 'Catálogo de Venta',
      contactTag: 'Resolvamos tus Dudas',
      terms: 'Términos',
      privacy: 'Privacidad',
      buyNow: 'Comprar Ahora',
      sendMsg: 'Enviar Consulta'
    },
    en: {
      editorTitle: 'Customize Site',
      editorSubtitle: 'Modify the structure, content, and visual style of your landing page.',
      tabStyle: 'Style & Themes',
      palettes: 'Color Palette',
      typography: 'Global Typography',
      buttonShape: 'Button Shape',
      cardBorders: 'Card Borders',
      titleSize: 'Title Font Size',
      bodySize: 'Body Font Size',
      languageLabel: 'Interface & Content Language',
      
      tabNavbar: 'Header (Navbar)',
      showNavbar: 'Show Top Bar',
      logoTitle: 'Logo Title',
      brandIconLabel: 'Brand Icon',
      showLogin: 'Login/Register Buttons',
      
      tabHero: 'Cover (Hero)',
      activateHero: 'Activate Hero Section',
      heroSubtitleLbl: 'Top Line (Specialty)',
      heroTitleLbl: 'Main Title',
      heroDescLbl: 'Supporting Description',
      btn1Lbl: 'Button 1 (Primary)',
      btn2Lbl: 'Button 2 (Secondary)',
      
      tabAbout: 'About Us',
      activateAbout: 'Activate About Section',
      sectionTitle: 'Section Title',
      descText: 'Descriptive Text',
      successStat1: 'Success Stat 1',
      successStat2: 'Success Stat 2',
      
      tabServices: 'Services',
      activateServices: 'Activate Services Section',
      servicesListLbl: 'Services List',
      serviceLabel: 'Service',
      deleteBtn: 'Delete',
      addServiceBtn: '+ Add Service',
      
      tabCarousel: 'Product Carousel',
      activateCarousel: 'Activate Carousel',
      productsListLbl: 'Products List',
      productLabel: 'Product',
      addProductBtn: '+ Add Product',
      
      tabBanner: 'Promo Banner',
      activateBanner: 'Activate Banner',
      bannerTextLbl: 'Callout Text',
      bannerCtaLbl: 'Button Text',
      
      tabContact: 'Contact',
      activateContact: 'Activate Contact Section',
      emailLbl: 'Email Address',
      phoneLbl: 'Phone Number',
      
      tabSocials: 'Social Networks',
      
      tabFooter: 'Footer',
      activateFooter: 'Activate Footer',
      copyrightLbl: 'Copyright Text',
      
      deployBtn: 'Deploy Demo Site',
      modalTitle: 'Site Structure Saved!',
      modalText: 'Rotbot has all the chosen design, sections, and color information. Let\'s chat in full screen to fine-tune the live demo.',
      modalBtn: 'Start Deployment Chat',
      
      loginModalTitle: 'Private Area',
      loginBtn: 'Login',
      loginClose: '✕',
      
      responsiveBadge: '100% Responsive',
      livePreviewTitle: 'Live Site Preview',
      navHome: 'Home',
      navAbout: 'About Us',
      navServices: 'Services',
      navProducts: 'Products',
      navContact: 'Contact',
      
      aboutUsTag: 'Who We Are',
      portfolioTag: 'Solutions Portfolio',
      catalogTag: 'Sales Catalog',
      contactTag: 'Resolving Your Doubts',
      terms: 'Terms',
      privacy: 'Privacy',
      buyNow: 'Buy Now',
      sendMsg: 'Send Inquiry'
    }
  };

  defaultMockupTexts: any = {
    es: {
      siteTitle: 'PORTALINK STUDIO',
      heroSubtitle: 'DISEÑO WEB PREMIUM & SISTEMAS INTELIGENTES',
      heroTitle: 'Creamos Plataformas\nQue Hacen Crecer\nTu Negocio.',
      heroDescription: 'Desarrollo web a medida, integraciones de IA, y sistemas optimizados para conversiones rápidas y alto rendimiento.',
      heroCta1: 'Ver Proyectos',
      heroCta2: 'Contáctanos',
      aboutTitle: 'Desarrollo con Propósito',
      aboutText: 'Soy un desarrollador comprometido con el éxito de mis clientes. Ofrezco experiencia combinando estética moderna con arquitecturas web de alto nivel, permitiendo digitalizar y automatizar tus procesos comerciales.',
      aboutStat1Val: '10+',
      aboutStat1Lbl: 'Proyectos Demo',
      aboutStat2Val: '100%',
      aboutStat2Lbl: 'Soporte Premium',
      servicesTitle: 'Servicios Disponibles',
      servicesList: [
        { id: 1, title: 'E-commerce a Medida', description: 'Plataformas de venta online rápidas, seguras y autogestionables para maximizar conversiones.' },
        { id: 2, title: 'Sistemas de IA', description: 'Automatización de chat y flujos operativos mediante inteligencia artificial para tu negocio.' },
        { id: 3, title: 'Aplicaciones Móviles', description: 'Desarrollo móvil nativo y PWAs instalables para una experiencia inmersiva.' }
      ],
      carouselTitle: 'Catálogo de Diseños',
      productsList: [
        { id: 1, title: 'Langing page Minimal', price: '$299', image: '📦' },
        { id: 2, title: 'E-commerce Premium', price: '$599', image: '📦' },
        { id: 3, title: 'Sistema Web ERP', price: '$999', image: '📦' },
        { id: 4, title: 'Soporte DevOps', price: '$150', image: '📦' }
      ],
      bannerText: '¿Listo para llevar tu marca al siguiente nivel digital?',
      bannerCta: '¡Solicitar Demo!',
      contactTitle: 'Contáctanos',
      contactEmail: 'santiago@portalink.co',
      contactPhone: '+57 300 123 4567',
      footerCopy: '© 2026 Portalink Studio. Todos los derechos reservados.'
    },
    en: {
      siteTitle: 'PORTALINK STUDIO',
      heroSubtitle: 'PREMIUM WEB DESIGN & INTELLIGENT SYSTEMS',
      heroTitle: 'We Build Platforms\nThat Grow\nYour Business.',
      heroDescription: 'Tailor-made web development, AI integrations, and high-performance systems optimized for fast conversions.',
      heroCta1: 'View Projects',
      heroCta2: 'Contact Us',
      aboutTitle: 'Development with Purpose',
      aboutText: 'I am a developer committed to my clients\' success. I offer experience combining modern aesthetics with high-level web architectures, allowing you to digitize and automate your business processes.',
      aboutStat1Val: '10+',
      aboutStat1Lbl: 'Demo Projects',
      aboutStat2Val: '100%',
      aboutStat2Lbl: 'Premium Support',
      servicesTitle: 'Available Services',
      servicesList: [
        { id: 1, title: 'Custom E-commerce', description: 'Fast, secure, and self-managed online sales platforms to maximize conversions.' },
        { id: 2, title: 'AI Systems', description: 'Chat automation and operational workflows using artificial intelligence for your business.' },
        { id: 3, title: 'Mobile Applications', description: 'Native mobile development and installable PWAs for an immersive experience.' }
      ],
      carouselTitle: 'Design Catalog',
      productsList: [
        { id: 1, title: 'Minimal Landing Page', price: '$299', image: '📦' },
        { id: 2, title: 'Premium E-commerce', price: '$599', image: '📦' },
        { id: 3, title: 'ERP Web System', price: '$999', image: '📦' },
        { id: 4, title: 'DevOps Support', price: '$150', image: '📦' }
      ],
      bannerText: 'Ready to take your brand to the next digital level?',
      bannerCta: 'Request Demo!',
      contactTitle: 'Contact Us',
      contactEmail: 'santiago@portalink.co',
      contactPhone: '+57 300 123 4567',
      footerCopy: '© 2026 Portalink Studio. All rights reserved.'
    }
  };

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
    { id: 'white-minimal', name: 'White Executive', primary: '#111827', bg: '#ffffff', cardBg: '#f8fafc', accent: '#0f172a', lightTheme: true },
    { id: 'white-gold', name: 'White & Gold Luxury', primary: '#18181b', bg: '#ffffff', cardBg: '#faf9f6', accent: '#c5a059', lightTheme: true },
    { id: 'white-sapphire', name: 'White & Sapphire', primary: '#0f172a', bg: '#ffffff', cardBg: '#f1f5f9', accent: '#2563eb', lightTheme: true },
    { id: 'white-monochrome', name: 'Snow Monochrome', primary: '#09090b', bg: '#ffffff', cardBg: '#f4f4f5', accent: '#3f3f46', lightTheme: true },
    { id: 'white-emerald', name: 'White Emerald', primary: '#1e293b', bg: '#ffffff', cardBg: '#f0fdf4', accent: '#059669', lightTheme: true },
    { id: 'dark-cyber', name: 'Cyber Glow', primary: '#ffffff', bg: '#08080c', cardBg: '#111118', accent: '#00f5ff', lightTheme: false },
    { id: 'minimal-luxury', name: 'Luxury Minimal', primary: '#ffffff', bg: '#050505', cardBg: '#121212', accent: '#e5c158', lightTheme: false },
    { id: 'ocean-glass', name: 'Ocean Glass', primary: '#ffffff', bg: '#0a192f', cardBg: '#112240', accent: '#64ffda', lightTheme: false },
    { id: 'editorial-warm', name: 'Editorial Warm', primary: '#2d2d2d', bg: '#ffffff', cardBg: '#f8f9fa', accent: '#d97706', lightTheme: true },
    { id: 'emerald-forest', name: 'Emerald Forest', primary: '#ffffff', bg: '#051610', cardBg: '#0b241c', accent: '#10b981', lightTheme: false },
    { id: 'sunset-peach', name: 'Sunset Peach', primary: '#2d2d2d', bg: '#fffaf5', cardBg: '#fef0e6', accent: '#f97316', lightTheme: true },
    { id: 'orchid-purple', name: 'Orchid Purple', primary: '#ffffff', bg: '#0d0516', cardBg: '#180a29', accent: '#a855f7', lightTheme: false },
    { id: 'carbon-slate', name: 'Carbon Slate', primary: '#ffffff', bg: '#0f172a', cardBg: '#1e293b', accent: '#94a3b8', lightTheme: false }
  ];

  selectedTheme = this.themes[0];

  private siteService = inject(SiteService);
  private authService = inject(AuthService);

  constructor(private router: Router) {}

  ngOnInit() {
    // 1. Verificar si vienen datos del sitio web generados por Rotbot en history.state
    const stateData = history.state?.siteData;
    if (stateData) {
      this.applySiteData(stateData);
    } else {
      // 2. Si no están en state, revisar si Rotbot los guardó en localStorage
      const savedLocal = localStorage.getItem('portalink_generated_site');
      if (savedLocal) {
        try {
          const parsed = JSON.parse(savedLocal);
          this.applySiteData(parsed);
        } catch (e) {}
      }
    }

    // 3. Si el usuario está autenticado, intentar cargar su landing de la base de datos
    if (this.authService.hasToken()) {
      this.siteService.getMySite().subscribe({
        next: (res) => {
          if (res.site) {
            if (res.site.slug) {
              this.currentSiteSlug = res.site.slug;
            }
            if (res.site.site_data) {
              this.applySiteData(res.site.site_data);
            }
          }
        },
        error: () => {}
      });
    }

    setTimeout(() => {
      this.isLoading = false;
      this.lastSavedJsonString = JSON.stringify(this.getCurrentSiteDataPayload());
    }, 850);
  }

  applySiteData(data: any) {
    if (!data) return;

    // 1. Título y Subtítulo / Hero
    const name = data.hero?.name || data.name;
    const title = data.hero?.title || data.hero?.headline || data.title;
    const subtitle = data.hero?.subtitle || data.hero?.subheadline || data.subtitle || data.hero?.bio || data.hero?.description;

    if (name) this.siteTitle = name.toUpperCase();
    if (title && name) {
      this.heroTitle = `${name}\n${title}`;
    } else if (title) {
      this.heroTitle = title;
    } else if (name) {
      this.heroTitle = name;
    }
    if (subtitle) {
      this.heroSubtitle = subtitle.toUpperCase();
      this.heroDescription = subtitle;
    }

    if (data.hero?.ctaText) {
      this.heroCta1 = data.hero.ctaText;
    }

    // 2. Sobre Mí (About)
    if (data.about?.heading || data.about?.title) {
      this.aboutTitle = data.about.heading || data.about.title;
    }
    if (data.about?.text || data.about?.description || data.about?.bio) {
      this.aboutText = data.about.text || data.about.description || data.about.bio;
    } else if (subtitle) {
      this.aboutText = subtitle;
    }

    // 3. Servicios
    if (Array.isArray(data.services) && data.services.length > 0) {
      this.servicesList = data.services.map((s: any, idx: number) => ({
        id: idx + 1,
        title: s.title || s.name || `Servicio ${idx + 1}`,
        description: s.description || s.desc || 'Desarrollo web y soluciones digitales profesionales.'
      }));
    }

    // 4. Contacto
    if (data.contact?.email) {
      this.contactEmail = data.contact.email;
    }
    if (data.contact?.phone) {
      this.contactPhone = data.contact.phone;
    }

    // 5. Tema Visual
    const styleOrScheme = `${data.theme?.style || ''} ${data.theme?.colorScheme || ''}`.toLowerCase();
    if (styleOrScheme.includes('blanco') || styleOrScheme.includes('white') || styleOrScheme.includes('claro') || styleOrScheme.includes('light')) {
      const whiteTheme = this.themes.find(t => t.id === 'white-minimal' || t.id === 'white-gold');
      if (whiteTheme) this.selectedTheme = whiteTheme;
    } else if (styleOrScheme.includes('minimal') || styleOrScheme.includes('negro') || styleOrScheme.includes('black') || styleOrScheme.includes('dark')) {
      const minimalTheme = this.themes.find(t => t.id === 'minimal-luxury' || t.id === 'dark-cyber');
      if (minimalTheme) this.selectedTheme = minimalTheme;
    }
  }

  routerToRotbot(message: string) {
    this.router.navigate(['/rotbot']).then(() => {
      setTimeout(() => {
        const event = new CustomEvent('open-ai-chat', {
          detail: { message }
        });
        window.dispatchEvent(event);
      }, 500);
    });
  }

  toggleAccordion(section: string) {
    if (this.activeAccordion === section) {
      this.activeAccordion = '';
    } else {
      this.activeAccordion = section;
    }
  }

  selectTheme(theme: ThemePreset) {
    this.selectedTheme = theme;
    this.saveCurrentDesignToProfile();
  }

  ngDoCheck() {
    if (this.isLoading) return;
    try {
      const currentPayload = this.getCurrentSiteDataPayload();
      const currentJson = JSON.stringify(currentPayload);
      if (this.lastSavedJsonString && currentJson !== this.lastSavedJsonString) {
        this.triggerAutoSave();
      }
    } catch (e) {}
  }

  triggerAutoSave() {
    clearTimeout(this.autoSaveTimeout);
    this.isSaving = true;
    this.autoSaveTimeout = setTimeout(() => {
      this.saveCurrentDesignToProfile();
    }, 450);
  }

  getCurrentSiteDataPayload(): any {
    return {
      hero: {
        name: this.siteTitle,
        title: this.heroTitle,
        subtitle: this.heroSubtitle,
        description: this.heroDescription,
        ctaText: this.heroCta1,
        ctaText2: this.heroCta2,
        ctaLink: '#contact'
      },
      about: {
        heading: this.aboutTitle,
        text: this.aboutText,
        stats: [
          { value: this.aboutStat1Val, label: this.aboutStat1Lbl },
          { value: this.aboutStat2Val, label: this.aboutStat2Lbl }
        ]
      },
      services: this.servicesList,
      products: this.productsList,
      banner: {
        text: this.bannerText,
        cta: this.bannerCta
      },
      contact: {
        title: this.contactTitle,
        email: this.contactEmail,
        phone: this.contactPhone
      },
      socials: {
        instagram: this.showInstagram ? this.instagramLink : null,
        tiktok: this.showTiktok ? this.tiktokLink : null,
        whatsapp: this.showWhatsapp ? this.whatsappLink : null,
        linkedin: this.showLinkedin ? this.linkedinLink : null
      },
      footer: {
        copy: this.footerCopy
      },
      themePreset: this.selectedTheme,
      customizations: {
        selectedFont: this.selectedFont,
        buttonStyle: this.buttonStyle,
        cardBorderStyle: this.cardBorderStyle,
        brandIcon: this.brandIcon,
        includeNavbar: this.includeNavbar,
        includeHero: this.includeHero,
        includeAbout: this.includeAbout,
        includeServices: this.includeServices,
        includeCarousel: this.includeCarousel,
        includeBanner: this.includeBanner,
        includeContact: this.includeContact,
        includeFooter: this.includeFooter,
        showLoginBtn: this.showLoginBtn
      },
      theme: {
        style: this.selectedTheme.name,
        colorScheme: this.selectedTheme.lightTheme ? 'light' : 'dark',
        accentColor: this.selectedTheme.accent
      },
      style: {
        accentColor: this.selectedTheme.accent,
        colorScheme: this.selectedTheme.lightTheme ? 'light' : 'dark'
      }
    };
  }

  saveCurrentDesignToProfile() {
    const updatedSiteData = this.getCurrentSiteDataPayload();
    const jsonString = JSON.stringify(updatedSiteData);
    this.lastSavedJsonString = jsonString;

    try {
      localStorage.setItem('portalink_generated_site', jsonString);
    } catch (e) {}

    if (this.authService.hasToken()) {
      this.siteService.saveMySite(updatedSiteData).subscribe({
        next: (res) => {
          this.isSaving = false;
          if (res && res.site && res.site.slug) {
            this.currentSiteSlug = res.site.slug;
          }
        },
        error: (err) => {
          this.isSaving = false;
          console.error('❌ Error en autoguardado:', err);
        }
      });
    } else {
      this.isSaving = false;
    }
  }

  openLiveSite() {
    this.saveCurrentDesignToProfile();
    if (this.currentSiteSlug) {
      window.open(`/site/${this.currentSiteSlug}`, '_blank');
    } else if (this.authService.hasToken()) {
      this.siteService.getMySite().subscribe({
        next: (res) => {
          if (res.site && res.site.slug) {
            this.currentSiteSlug = res.site.slug;
            window.open(`/site/${this.currentSiteSlug}`, '_blank');
          } else {
            const fallbackSlug = (this.siteTitle || 'santiago-arbelaez').toLowerCase().replace(/[^a-z0-9-]/g, '-');
            window.open(`/site/${fallbackSlug}`, '_blank');
          }
        },
        error: () => {
          const fallbackSlug = (this.siteTitle || 'santiago-arbelaez').toLowerCase().replace(/[^a-z0-9-]/g, '-');
          window.open(`/site/${fallbackSlug}`, '_blank');
        }
      });
    } else {
      const fallbackSlug = (this.siteTitle || 'santiago-arbelaez').toLowerCase().replace(/[^a-z0-9-]/g, '-');
      window.open(`/site/${fallbackSlug}`, '_blank');
    }
  }

  // Get localized editor text
  getTranslation(key: string): string {
    return this.editorTranslations[this.currentLanguage][key] || key;
  }

  // Change active language and translate untouched fields
  changeLanguage(lang: 'es' | 'en') {
    const prevLang = this.currentLanguage;
    this.currentLanguage = lang;

    const prevDefaults = this.defaultMockupTexts[prevLang];
    const newDefaults = this.defaultMockupTexts[lang];

    // Check and translate navbar logo title
    if (this.siteTitle === prevDefaults.siteTitle) {
      this.siteTitle = newDefaults.siteTitle;
    }

    // Check and translate Hero section
    if (this.heroSubtitle === prevDefaults.heroSubtitle) {
      this.heroSubtitle = newDefaults.heroSubtitle;
    }
    if (this.heroTitle === prevDefaults.heroTitle) {
      this.heroTitle = newDefaults.heroTitle;
    }
    if (this.heroDescription === prevDefaults.heroDescription) {
      this.heroDescription = newDefaults.heroDescription;
    }
    if (this.heroCta1 === prevDefaults.heroCta1) {
      this.heroCta1 = newDefaults.heroCta1;
    }
    if (this.heroCta2 === prevDefaults.heroCta2) {
      this.heroCta2 = newDefaults.heroCta2;
    }

    // Check and translate About section
    if (this.aboutTitle === prevDefaults.aboutTitle) {
      this.aboutTitle = newDefaults.aboutTitle;
    }
    if (this.aboutText === prevDefaults.aboutText) {
      this.aboutText = newDefaults.aboutText;
    }
    if (this.aboutStat1Val === prevDefaults.aboutStat1Val) {
      this.aboutStat1Val = newDefaults.aboutStat1Val;
    }
    if (this.aboutStat1Lbl === prevDefaults.aboutStat1Lbl) {
      this.aboutStat1Lbl = newDefaults.aboutStat1Lbl;
    }
    if (this.aboutStat2Val === prevDefaults.aboutStat2Val) {
      this.aboutStat2Val = newDefaults.aboutStat2Val;
    }
    if (this.aboutStat2Lbl === prevDefaults.aboutStat2Lbl) {
      this.aboutStat2Lbl = newDefaults.aboutStat2Lbl;
    }

    // Check and translate Services section
    if (this.servicesTitle === prevDefaults.servicesTitle) {
      this.servicesTitle = newDefaults.servicesTitle;
    }
    this.servicesList.forEach(srv => {
      const match = prevDefaults.servicesList.find((s: any) => s.id === srv.id);
      if (match) {
        if (srv.title === match.title) {
          const newMatch = newDefaults.servicesList.find((s: any) => s.id === srv.id);
          if (newMatch) srv.title = newMatch.title;
        }
        if (srv.description === match.description) {
          const newMatch = newDefaults.servicesList.find((s: any) => s.id === srv.id);
          if (newMatch) srv.description = newMatch.description;
        }
      }
    });

    // Check and translate Carousel section
    if (this.carouselTitle === prevDefaults.carouselTitle) {
      this.carouselTitle = newDefaults.carouselTitle;
    }
    this.productsList.forEach(prod => {
      const match = prevDefaults.productsList.find((p: any) => p.id === prod.id);
      if (match && prod.title === match.title) {
        const newMatch = newDefaults.productsList.find((p: any) => p.id === prod.id);
        if (newMatch) prod.title = newMatch.title;
      }
    });

    // Check and translate Banner section
    if (this.bannerText === prevDefaults.bannerText) {
      this.bannerText = newDefaults.bannerText;
    }
    if (this.bannerCta === prevDefaults.bannerCta) {
      this.bannerCta = newDefaults.bannerCta;
    }

    // Check and translate Contact section
    if (this.contactTitle === prevDefaults.contactTitle) {
      this.contactTitle = newDefaults.contactTitle;
    }
    if (this.contactEmail === prevDefaults.contactEmail) {
      this.contactEmail = newDefaults.contactEmail;
    }
    if (this.contactPhone === prevDefaults.contactPhone) {
      this.contactPhone = newDefaults.contactPhone;
    }

    // Check and translate Footer section
    if (this.footerCopy === prevDefaults.footerCopy) {
      this.footerCopy = newDefaults.footerCopy;
    }
  }

  // Card dynamic styles based on setting
  getCardStyles() {
    if (this.cardBorderStyle === 'border-glow') {
      return {
        'background': this.selectedTheme.cardBg,
        'border-color': this.selectedTheme.accent + '66',
        'box-shadow': `0 0 16px ${this.selectedTheme.accent}22`,
        'backdrop-filter': 'blur(12px)'
      };
    } else if (this.cardBorderStyle === 'border-glass') {
      return {
        'background': this.selectedTheme.lightTheme ? 'rgba(255, 255, 255, 0.4)' : 'rgba(17, 17, 24, 0.35)',
        'border-color': this.selectedTheme.lightTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.08)',
        'backdrop-filter': 'blur(24px)',
        '-webkit-backdrop-filter': 'blur(24px)',
        'box-shadow': '0 8px 32px 0 rgba(0, 0, 0, 0.1)'
      };
    } else {
      // border-minimal
      return {
        'background': this.selectedTheme.cardBg,
        'border-color': this.selectedTheme.primary + '11',
        'backdrop-filter': 'blur(4px)'
      };
    }
  }

  // Returns white text color when the button background (accent) is dark, or black when light
  getAccentTextColor(): string {
    const hex = (this.selectedTheme?.accent || '#00f5ff').replace('#', '');
    if (hex.length !== 6) return '#000000';
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
    return luminance < 145 ? '#ffffff' : '#000000';
  }

  // Returns raw SVG paths for the Brand Icon
  getBrandIconSvg(icon: string): string {
    switch (icon) {
      case 'sparkles':
        return '<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.096L15 15l-5.187.904zM18 5.25L17.25 9 16.5 5.25 12.75 4.5 16.5 3.75 17.25 0l.75 3.75L21.75 4.5 18 5.25z"></path></svg>';
      case 'bolt':
        return '<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"></path></svg>';
      case 'star':
        return '<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499c.195-.39.771-.39.966 0l2.3 4.699 5.188.755c.43.063.602.583.291.89l-3.754 3.66.887 5.168c.074.43-.378.757-.76.552L12 16.782l-4.638 2.44c-.381.205-.833-.122-.76-.552l.887-5.168L3.733 13.5a.75.75 0 01.291-.89l5.188-.755 2.3-4.7z"></path></svg>';
      case 'code':
        return '<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"></path></svg>';
      default:
        return '';
    }
  }

  // Scroll to a specific section inside the live preview
  scrollToMockupSection(sectionId: string, event: Event) {
    event.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
    this.saveCurrentDesignToProfile();

    // Build the customization payload message for Rotbot
    let payload = `¡Hola! Quiero iniciar el desarrollo de mi landing page personalizada. Estos son mis requerimientos:\n\n`;
    payload += `🌐 **Idioma Seleccionado:** ${this.currentLanguage.toUpperCase()}\n`;
    payload += `🎨 **Estilo & Tema:** ${this.selectedTheme.name} (${this.selectedTheme.id})\n`;
    payload += `🔤 **Tipografía:** ${this.selectedFont}\n`;
    payload += `🔘 **Estilo de Botones:** ${this.buttonStyle}\n`;
    payload += `🗂️ **Estilo de Bordes:** ${this.cardBorderStyle}\n`;
    payload += `🏷️ **Icono de Marca:** ${this.brandIcon}\n\n`;
    
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
    
    // Social links summary
    let activeSocials = [];
    if (this.showInstagram && this.instagramLink) activeSocials.push(`Instagram: ${this.instagramLink}`);
    if (this.showTiktok && this.tiktokLink) activeSocials.push(`TikTok: ${this.tiktokLink}`);
    if (this.showWhatsapp && this.whatsappLink) activeSocials.push(`WhatsApp: ${this.whatsappLink}`);
    if (this.showLinkedin && this.linkedinLink) activeSocials.push(`LinkedIn: ${this.linkedinLink}`);
    if (activeSocials.length) {
      payload += `- **Redes Sociales:** ${activeSocials.join(', ')}\n`;
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
