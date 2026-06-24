import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AnalyticsService, SystemMetrics } from '../../services/analytics.service';
import { PortfolioConfigService } from '../../services/portfolio-config.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="admin-wrapper h-screen overflow-hidden font-sans flex text-neutral-100" [class.light-admin]="currentTheme === 'light'">
      
      <!-- LEFT SIDEBAR -->
      <aside class="w-64 border-r flex flex-col shrink-0 relative z-10 h-full overflow-y-auto"
             [style.background]="currentTheme === 'light' ? '#f9fafb' : '#07070a'"
             [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'">
        
        <!-- Header -->
        <div class="p-6 border-b flex items-center gap-3"
             [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'">
          <img src="assets/icons/mi-logo2.png" class="w-8 h-8 object-contain" alt="PortaLink">
          <div>
            <h1 class="text-sm font-bold tracking-wider uppercase">PortaLink</h1>
            <span class="text-[9px] uppercase tracking-widest text-[#00f5ff] font-bold">Admin Panel</span>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-grow p-4 space-y-1.5 mt-4">
          <button *ngFor="let tab of tabs" 
                  (click)="activeTab = tab.id"
                  class="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs uppercase font-bold tracking-widest transition-all duration-300 cursor-pointer"
                  [class.active-nav]="activeTab === tab.id"
                  [style.color]="activeTab === tab.id ? '#000000' : (currentTheme === 'light' ? '#4b5563' : '#9ca3af')">
            <span class="w-5 h-5 flex items-center justify-center">
              <svg *ngIf="tab.id === 'dashboard'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="9" rx="1"></rect>
                <rect x="14" y="3" width="7" height="5" rx="1"></rect>
                <rect x="14" y="12" width="7" height="9" rx="1"></rect>
                <rect x="3" y="16" width="7" height="5" rx="1"></rect>
              </svg>
              <svg *ngIf="tab.id === 'messages'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <svg *ngIf="tab.id === 'leads'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 14l2-2 4 4m0-7l-3-3-3 3M3 12h18M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
              </svg>
              <svg *ngIf="tab.id === 'users'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg *ngIf="tab.id === 'home'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <svg *ngIf="tab.id === 'linktree'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <svg *ngIf="tab.id === 'config'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <span>{{ tab.name }}</span>
          </button>
        </nav>

        <!-- Footer / Return Home -->
        <div class="p-6 border-t"
             [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'">
          <a routerLink="/" 
             class="w-full py-3 rounded-xl border text-center text-xs uppercase font-bold tracking-wider hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 block">
            Volver al Sitio
          </a>
        </div>
      </aside>

      <!-- MAIN CONTENT AREA -->
      <main class="flex-grow overflow-y-auto p-8 relative md:p-12 h-full"
            [style.background]="currentTheme === 'light' ? '#ffffff' : '#020204'">
        
        <!-- GLOW ACCENTS (Dark theme only) -->
        <div *ngIf="currentTheme !== 'light'" class="absolute -top-[200px] -right-[200px] w-[500px] h-[500px] rounded-full blur-[150px] opacity-10 pointer-events-none" style="background: #00f5ff;"></div>
        
        <!-- HEADER TOP BAR -->
        <header class="flex justify-between items-center mb-10 relative z-10">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-[0.25em] text-[#00f5ff]">Consola</span>
            <h2 class="text-3xl font-bold uppercase tracking-tight mt-1">{{ getTabTitle() }}</h2>
          </div>
          
          <!-- Theme Switcher -->
          <button (click)="toggleTheme()" 
                  class="w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 active:scale-95"
                  [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)'">
            <span *ngIf="currentTheme === 'light'">🌙</span>
            <span *ngIf="currentTheme === 'dark'">☀️</span>
          </button>
        </header>

        <!-- ROUTED CONTENT -->
        <div class="relative z-10">
          
          <!-- ═══════════════════════════════════════════ -->
          <!-- 1. DASHBOARD & METRICS                      -->
          <!-- ═══════════════════════════════════════════ -->
          <div *ngIf="activeTab === 'dashboard'" class="space-y-8 animate-fade-in">
            
            <!-- Cards Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div class="stat-card p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden"
                   [style.background]="currentTheme === 'light' ? '#f9fafb' : '#0d0d11'"
                   [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'">
                <div class="flex justify-between items-start">
                  <div class="flex flex-col">
                    <span class="text-[9px] uppercase tracking-widest opacity-60">Vistas del Home</span>
                    <h3 class="text-3xl font-bold mt-2 font-headline">{{ metrics.homeViews }}</h3>
                  </div>
                  <span class="p-2.5 rounded-xl bg-cyan-500/10 text-[#00f5ff] flex items-center justify-center">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </span>
                </div>
                <div class="text-[9px] text-[#00f5ff] font-bold mt-3.5 uppercase tracking-wider">Página Principal</div>
              </div>

              <div class="stat-card p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden"
                   [style.background]="currentTheme === 'light' ? '#f9fafb' : '#0d0d11'"
                   [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'">
                <div class="flex justify-between items-start">
                  <div class="flex flex-col">
                    <span class="text-[9px] uppercase tracking-widest opacity-60">Vistas Linktree</span>
                    <h3 class="text-3xl font-bold mt-2 font-headline">{{ metrics.linktreeViews }}</h3>
                  </div>
                  <span class="p-2.5 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </span>
                </div>
                <div class="text-[9px] text-green-400 font-bold mt-3.5 uppercase tracking-wider">Enlaces (/links)</div>
              </div>

              <div class="stat-card p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden"
                   [style.background]="currentTheme === 'light' ? '#f9fafb' : '#0d0d11'"
                   [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'">
                <div class="flex justify-between items-start">
                  <div class="flex flex-col">
                    <span class="text-[9px] uppercase tracking-widest opacity-60">Consultas a Rotbot</span>
                    <h3 class="text-3xl font-bold mt-2 font-headline">{{ metrics.rotbotOpens }}</h3>
                  </div>
                  <span class="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </span>
                </div>
                <div class="text-[9px] text-purple-400 font-bold mt-3.5 uppercase tracking-wider">{{ metrics.rotbotMessagesSent }} Mensajes</div>
              </div>

              <div class="stat-card p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden"
                   [style.background]="currentTheme === 'light' ? '#f9fafb' : '#0d0d11'"
                   [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'">
                <div class="flex justify-between items-start">
                  <div class="flex flex-col">
                    <span class="text-[9px] uppercase tracking-widest opacity-60">Velocidad Promedio</span>
                    <h3 class="text-3xl font-bold mt-2 font-headline">{{ getAverageLoadTime() }} ms</h3>
                  </div>
                  <span class="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </span>
                </div>
                <div class="text-[9px] text-amber-400 font-bold mt-3.5 uppercase tracking-wider">Carga de Recursos</div>
              </div>

            </div>

            <!-- Charts Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              <!-- Section Views Bar Chart (SVG) -->
              <div class="p-6 rounded-2xl border"
                   [style.background]="currentTheme === 'light' ? '#ffffff' : '#07070a'"
                   [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'">
                <h4 class="text-xs uppercase font-bold tracking-wider mb-6">Tráfico por Sección (Home)</h4>
                
                <div class="space-y-4">
                  <div *ngFor="let sec of getSectionViewsArray()" class="space-y-1.5">
                    <div class="flex justify-between text-[10px] uppercase font-bold tracking-wider">
                      <span class="opacity-70">{{ sec.name }}</span>
                      <span>{{ sec.views }} Visitas</span>
                    </div>
                    <div class="w-full h-2 rounded-full overflow-hidden bg-neutral-800/40 border border-white/5">
                      <div class="h-full rounded-full transition-all duration-1000 ease-out" 
                           [style.width.%]="getSectionPercentage(sec.views)"
                           style="background: linear-gradient(90deg, #00f5ff, #0099ff);"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Linktree Clicks distribution -->
              <div class="p-6 rounded-2xl border"
                   [style.background]="currentTheme === 'light' ? '#ffffff' : '#07070a'"
                   [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'">
                <h4 class="text-xs uppercase font-bold tracking-wider mb-6">Clics en Enlaces (Linktree)</h4>
                
                <div class="space-y-4">
                  <div *ngFor="let click of getLinkClicksArray()" class="space-y-1.5">
                    <div class="flex justify-between text-[10px] uppercase font-bold tracking-wider">
                      <span class="opacity-70">{{ click.name }}</span>
                      <span>{{ click.count }} clics</span>
                    </div>
                    <div class="w-full h-2 rounded-full overflow-hidden bg-neutral-800/40 border border-white/5">
                      <div class="h-full rounded-full transition-all duration-1000 ease-out" 
                           [style.width.%]="getLinkClickPercentage(click.count)"
                           style="background: linear-gradient(90deg, #10b981, #34d399);"></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <!-- Weekly Traffic Trend (SVG Sparkline) & Server Status Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              
              <!-- Weekly Traffic Trend -->
              <div class="p-6 rounded-2xl border"
                   [style.background]="currentTheme === 'light' ? '#ffffff' : '#07070a'"
                   [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'">
                <div class="flex justify-between items-center mb-6">
                  <h4 class="text-xs uppercase font-bold tracking-wider">Tendencia de Tráfico Semanal</h4>
                  <span class="text-[9px] uppercase tracking-widest bg-cyan-500/10 text-[#00f5ff] px-2.5 py-1 rounded-full font-bold">En Tiempo Real</span>
                </div>
                
                <!-- SVG Sparkline Area -->
                <div class="w-full h-40 relative flex items-end">
                  <svg class="w-full h-full" viewBox="0 0 600 150" preserveAspectRatio="none">
                    <!-- Grid Lines -->
                    <line x1="0" y1="30" x2="600" y2="30" stroke="rgba(255,255,255,0.03)" stroke-width="1"></line>
                    <line x1="0" y1="75" x2="600" y2="75" stroke="rgba(255,255,255,0.03)" stroke-width="1"></line>
                    <line x1="0" y1="120" x2="600" y2="120" stroke="rgba(255,255,255,0.03)" stroke-width="1"></line>
                    
                    <!-- Line Path -->
                    <path d="M 0,110 Q 75,40 150,90 T 300,30 T 450,110 T 600,40" 
                          fill="none" stroke="url(#cyanGlow)" stroke-width="3" 
                          stroke-linecap="round"></path>
                    
                    <!-- Area under path -->
                    <path d="M 0,110 Q 75,40 150,90 T 300,30 T 450,110 T 600,40 L 600,150 L 0,150 Z" 
                          fill="url(#cyanArea)" opacity="0.15"></path>
                    
                    <!-- Definitions -->
                    <defs>
                      <linearGradient id="cyanGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#00f5ff"></stop>
                        <stop offset="100%" stop-color="#0099ff"></stop>
                      </linearGradient>
                      <linearGradient id="cyanArea" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#00f5ff"></stop>
                        <stop offset="100%" stop-color="#000000" stop-opacity="0"></stop>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                
                <!-- Axis Labels -->
                <div class="flex justify-between text-[8px] uppercase tracking-widest opacity-50 mt-4 px-2">
                  <span>Lun</span>
                  <span>Mar</span>
                  <span>Mié</span>
                  <span>Jue</span>
                  <span>Vie</span>
                  <span>Sáb</span>
                  <span>Dom</span>
                </div>
              </div>

              <!-- Server Health & Live Sessions -->
              <div class="p-6 rounded-2xl border flex flex-col justify-between gap-6"
                   [style.background]="currentTheme === 'light' ? '#ffffff' : '#07070a'"
                   [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'">
                <h4 class="text-xs uppercase font-bold tracking-wider">Estado del Servidor</h4>
                
                <div class="grid grid-cols-2 gap-6 flex-grow">
                  <div class="flex flex-col justify-center border-r border-white/5 pr-4">
                    <span class="text-[9px] uppercase tracking-widest opacity-50">Estado de API</span>
                    <div class="flex items-center gap-2 mt-2">
                      <span class="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                      <span class="text-xs font-bold">99.98% ONLINE</span>
                    </div>
                  </div>

                  <div class="flex flex-col justify-center pl-4">
                    <span class="text-[9px] uppercase tracking-widest opacity-50">Uso de Memoria</span>
                    <span class="text-xs font-bold mt-2">242 MB / 512 MB</span>
                  </div>

                  <div class="flex flex-col justify-center border-r border-white/5 pr-4 border-t pt-4">
                    <span class="text-[9px] uppercase tracking-widest opacity-50">Ping de Red</span>
                    <span class="text-xs font-bold mt-2">42 ms</span>
                  </div>

                  <div class="flex flex-col justify-center pl-4 border-t pt-4">
                    <span class="text-[9px] uppercase tracking-widest opacity-50">Sesiones Activas</span>
                    <span class="text-xs font-bold mt-2">4 Concurrentes</span>
                  </div>
                </div>
              </div>

            </div>

            <!-- Actions Bar -->
            <div class="flex justify-end gap-4 border-t pt-6 mt-8"
                 [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'">
              <button (click)="resetMetrics()" 
                      class="px-5 py-2.5 rounded-xl border text-xs uppercase font-bold tracking-widest hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all duration-300 cursor-pointer">
                Reiniciar Métricas
              </button>
            </div>

          </div>

          <!-- ═══════════════════════════════════════════ -->
          <!-- 2. HOME CUSTOMIZATION                       -->
          <!-- ═══════════════════════════════════════════ -->
          <div *ngIf="activeTab === 'home'" class="space-y-8 animate-fade-in">
            <div class="p-8 rounded-2xl border space-y-6"
                 [style.background]="currentTheme === 'light' ? '#ffffff' : '#07070a'"
                 [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'">
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Author Name -->
                <div class="flex flex-col gap-2">
                  <label class="text-[10px] uppercase tracking-widest font-bold opacity-60">Nombre del Autor</label>
                  <input type="text" [(ngModel)]="configDraft.general.authorName" 
                         class="admin-input p-3.5 rounded-xl border text-xs focus:outline-none"
                         [style.background]="currentTheme === 'light' ? '#f9fafb' : '#0d0d11'"
                         [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'" />
                </div>
                
                <!-- Primary Color -->
                <div class="flex flex-col gap-2">
                  <label class="text-[10px] uppercase tracking-widest font-bold opacity-60">Color de Acento Base</label>
                  <div class="flex gap-3">
                    <input type="color" [(ngModel)]="configDraft.general.primaryColor" 
                           class="w-12 h-12 rounded-xl border overflow-hidden p-0 cursor-pointer"
                           [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'" />
                    <input type="text" [(ngModel)]="configDraft.general.primaryColor" 
                           class="admin-input flex-grow p-3.5 rounded-xl border text-xs focus:outline-none"
                           [style.background]="currentTheme === 'light' ? '#f9fafb' : '#0d0d11'"
                           [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'" />
                  </div>
                </div>

                <!-- Hero Title -->
                <div class="flex flex-col gap-2">
                  <label class="text-[10px] uppercase tracking-widest font-bold opacity-60">Título Hero (Desktop)</label>
                  <input type="text" [(ngModel)]="configDraft.hero.title" 
                         class="admin-input p-3.5 rounded-xl border text-xs focus:outline-none"
                         [style.background]="currentTheme === 'light' ? '#f9fafb' : '#0d0d11'"
                         [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'" />
                </div>

                <!-- Hero Subtitle -->
                <div class="flex flex-col gap-2">
                  <label class="text-[10px] uppercase tracking-widest font-bold opacity-60">Subtítulo Hero</label>
                  <input type="text" [(ngModel)]="configDraft.hero.subtitle" 
                         class="admin-input p-3.5 rounded-xl border text-xs focus:outline-none"
                         [style.background]="currentTheme === 'light' ? '#f9fafb' : '#0d0d11'"
                         [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'" />
                </div>
              </div>

              <!-- Hero Description -->
              <div class="flex flex-col gap-2">
                <label class="text-[10px] uppercase tracking-widest font-bold opacity-60">Descripción Hero</label>
                <textarea rows="3" [(ngModel)]="configDraft.hero.description" 
                          class="admin-input p-3.5 rounded-xl border text-xs focus:outline-none"
                          [style.background]="currentTheme === 'light' ? '#f9fafb' : '#0d0d11'"
                          [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'"></textarea>
              </div>

              <!-- About Text -->
              <div class="flex flex-col gap-2">
                <label class="text-[10px] uppercase tracking-widest font-bold opacity-60">Sobre Mí (Descripción)</label>
                <textarea rows="4" [(ngModel)]="configDraft.about.text" 
                          class="admin-input p-3.5 rounded-xl border text-xs focus:outline-none"
                          [style.background]="currentTheme === 'light' ? '#f9fafb' : '#0d0d11'"
                          [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'"></textarea>
              </div>

              <!-- Contact Info -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="flex flex-col gap-2">
                  <label class="text-[10px] uppercase tracking-widest font-bold opacity-60">Email de Contacto</label>
                  <input type="email" [(ngModel)]="configDraft.contact.email" 
                         class="admin-input p-3.5 rounded-xl border text-xs focus:outline-none"
                         [style.background]="currentTheme === 'light' ? '#f9fafb' : '#0d0d11'"
                         [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'" />
                </div>
                
                <div class="flex flex-col gap-2">
                  <label class="text-[10px] uppercase tracking-widest font-bold opacity-60">Texto del Botón CTA (Hero)</label>
                  <input type="text" [(ngModel)]="configDraft.hero.ctaText" 
                         class="admin-input p-3.5 rounded-xl border text-xs focus:outline-none"
                         [style.background]="currentTheme === 'light' ? '#f9fafb' : '#0d0d11'"
                         [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'" />
                </div>
              </div>

            </div>

            <!-- Actions Bar -->
            <div class="flex justify-end gap-4">
              <button (click)="resetDraft()" 
                      class="px-5 py-2.5 rounded-xl border text-xs uppercase font-bold tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 cursor-pointer">
                Descartar Borrador
              </button>
              <button (click)="saveDraft()" 
                      class="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 hover:opacity-85 cursor-pointer"
                      style="background: var(--text-primary); color: var(--bg-primary);">
                Guardar y Publicar
              </button>
            </div>
          </div>

          <!-- ═══════════════════════════════════════════ -->
          <!-- 3. LINKTREE CUSTOMIZATION                   -->
          <!-- ═══════════════════════════════════════════ -->
          <div *ngIf="activeTab === 'linktree'" class="space-y-8 animate-fade-in">
            <div class="p-8 rounded-2xl border space-y-6"
                 [style.background]="currentTheme === 'light' ? '#ffffff' : '#07070a'"
                 [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'">
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Profile Name -->
                <div class="flex flex-col gap-2">
                  <label class="text-[10px] uppercase tracking-widest font-bold opacity-60">Nombre del Perfil</label>
                  <input type="text" [(ngModel)]="configDraft.links.profileName" 
                         class="admin-input p-3.5 rounded-xl border text-xs focus:outline-none"
                         [style.background]="currentTheme === 'light' ? '#f9fafb' : '#0d0d11'"
                         [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'" />
                </div>
                
                <!-- Profile Title -->
                <div class="flex flex-col gap-2">
                  <label class="text-[10px] uppercase tracking-widest font-bold opacity-60">Título / Subtítulo</label>
                  <input type="text" [(ngModel)]="configDraft.links.profileTitle" 
                         class="admin-input p-3.5 rounded-xl border text-xs focus:outline-none"
                         [style.background]="currentTheme === 'light' ? '#f9fafb' : '#0d0d11'"
                         [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'" />
                </div>
              </div>

              <!-- List of Custom Links -->
              <div class="space-y-4">
                <div class="flex justify-between items-center mb-2">
                  <h4 class="text-xs uppercase font-bold tracking-wider">Enlaces Registrados</h4>
                  <button (click)="addLinkItem()" 
                          class="px-3.5 py-1.5 border rounded-lg text-[10px] uppercase font-bold tracking-wider hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer">
                    + Agregar Enlace
                  </button>
                </div>

                <div class="space-y-4">
                  <div *ngFor="let item of configDraft.links.items; let i = index" 
                       class="p-5 rounded-xl border flex flex-col gap-4 relative"
                       [style.background]="currentTheme === 'light' ? '#f9fafb' : '#0c0c0e'"
                       [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'">
                    
                    <!-- Remove Link button -->
                    <button (click)="removeLinkItem(i)" 
                            class="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-500/10 text-red-400 border border-red-500/10 hover:border-red-500/20 text-xs cursor-pointer">
                      ✕
                    </button>

                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <!-- Link Title -->
                      <div class="flex flex-col gap-1.5">
                        <label class="text-[9px] uppercase tracking-widest font-bold opacity-60">Título</label>
                        <input type="text" [(ngModel)]="item.title" 
                               class="admin-input p-2.5 rounded-lg border text-xs focus:outline-none"
                               [style.background]="currentTheme === 'light' ? '#ffffff' : '#141418'"
                               [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'" />
                      </div>
                      
                      <!-- Link Subtitle -->
                      <div class="flex flex-col gap-1.5">
                        <label class="text-[9px] uppercase tracking-widest font-bold opacity-60">Subtítulo</label>
                        <input type="text" [(ngModel)]="item.subtitle" 
                               class="admin-input p-2.5 rounded-lg border text-xs focus:outline-none"
                               [style.background]="currentTheme === 'light' ? '#ffffff' : '#141418'"
                               [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'" />
                      </div>

                      <!-- Link URL -->
                      <div class="flex flex-col gap-1.5 md:col-span-2">
                        <label class="text-[9px] uppercase tracking-widest font-bold opacity-60">Dirección (URL)</label>
                        <input type="text" [(ngModel)]="item.url" 
                               class="admin-input p-2.5 rounded-lg border text-xs focus:outline-none"
                               [style.background]="currentTheme === 'light' ? '#ffffff' : '#141418'"
                               [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'" />
                      </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <!-- Icon selector -->
                      <div class="flex flex-col gap-1.5">
                        <label class="text-[9px] uppercase tracking-widest font-bold opacity-60">Ícono</label>
                        <select [(ngModel)]="item.icon" 
                                class="admin-input p-2.5 rounded-lg border text-xs focus:outline-none"
                                [style.background]="currentTheme === 'light' ? '#ffffff' : '#141418'"
                                [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'">
                          <option value="tiktok">TikTok</option>
                          <option value="instagram">Instagram</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="portfolio">Portafolio</option>
                          <option value="link">Otro Enlace</option>
                        </select>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </div>

            <!-- Actions Bar -->
            <div class="flex justify-end gap-4">
              <button (click)="resetDraft()" 
                      class="px-5 py-2.5 rounded-xl border text-xs uppercase font-bold tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 cursor-pointer">
                Descartar Borrador
              </button>
              <button (click)="saveDraft()" 
                      class="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 hover:opacity-85 cursor-pointer"
                      style="background: var(--text-primary); color: var(--bg-primary);">
                Guardar y Publicar
              </button>
            </div>
          </div>

          <!-- ═══════════════════════════════════════════ -->
          <!-- 4. SYSTEM CONFIGURATION                     -->
          <!-- ═══════════════════════════════════════════ -->
          <div *ngIf="activeTab === 'config'" class="space-y-8 animate-fade-in">
            <div class="p-8 rounded-2xl border space-y-6"
                 [style.background]="currentTheme === 'light' ? '#ffffff' : '#07070a'"
                 [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'">
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Chatbot Name -->
                <div class="flex flex-col gap-2">
                  <label class="text-[10px] uppercase tracking-widest font-bold opacity-60">Nombre del Asistente (IA)</label>
                  <input type="text" [(ngModel)]="chatbotName" 
                         class="admin-input p-3.5 rounded-xl border text-xs focus:outline-none"
                         [style.background]="currentTheme === 'light' ? '#f9fafb' : '#0d0d11'"
                         [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'" />
                </div>
                
                <!-- System Maintenance Mode -->
                <div class="flex flex-col gap-2">
                  <label class="text-[10px] uppercase tracking-widest font-bold opacity-60">Modo de Mantenimiento</label>
                  <div class="flex items-center gap-3 mt-2">
                    <button (click)="maintenanceMode = !maintenanceMode"
                            class="px-4 py-2 border rounded-xl text-xs uppercase font-bold transition-all cursor-pointer"
                            [class.bg-red-500]="maintenanceMode"
                            [class.text-white]="maintenanceMode"
                            [style.borderColor]="maintenanceMode ? 'red' : 'rgba(255,255,255,0.1)'">
                      {{ maintenanceMode ? 'Activado' : 'Desactivado' }}
                    </button>
                    <span class="text-[10px] opacity-60">Simula cierre temporal de servicios</span>
                  </div>
                </div>
              </div>

              <!-- JSON Export Section -->
              <div class="border-t pt-6"
                   [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'">
                <h4 class="text-xs uppercase font-bold tracking-wider mb-2">Exportar Configuración Completa</h4>
                <p class="text-xs opacity-60 mb-4">Exporta el archivo de datos actual <code>portfolio.json</code> para aplicarlo de forma permanente en la carpeta de activos del frontend.</p>
                <button (click)="exportConfig()" 
                        class="px-5 py-2.5 rounded-xl text-xs uppercase font-bold tracking-widest transition-all duration-300 cursor-pointer"
                        style="background: var(--text-primary); color: var(--bg-primary);">
                  Descargar portfolio.json
                </button>
              </div>

            </div>
          </div>

          <!-- ═══════════════════════════════════════════ -->
          <!-- 5. MENSAJES RECIBIDOS                       -->
          <!-- ═══════════════════════════════════════════ -->
          <div *ngIf="activeTab === 'messages'" class="space-y-6 animate-fade-in">
            <div class="p-6 rounded-2xl border space-y-4"
                 [style.background]="currentTheme === 'light' ? '#ffffff' : '#07070a'"
                 [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'">
              
              <div *ngIf="messagesList.length === 0" class="p-12 text-center text-sm opacity-55">
                No hay mensajes recibidos en este momento.
              </div>

              <div *ngIf="messagesList.length > 0" class="space-y-4">
                <div *ngFor="let msg of messagesList" 
                     class="p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300"
                     [style.background]="currentTheme === 'light' ? '#f9fafb' : '#0c0c0e'"
                     [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'">
                  
                  <div class="space-y-1.5 max-w-2xl">
                    <div class="flex items-center gap-3">
                      <span class="text-xs font-bold" [style.color]="currentTheme === 'light' ? '#111827' : '#ffffff'">{{ msg.name }}</span>
                      <span class="text-[10px] opacity-50">{{ msg.email }}</span>
                      <span class="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full" 
                            [class.bg-cyan-500\/10]="!msg.read" [class.text-[#00f5ff]]="!msg.read"
                            [class.bg-neutral-500\/10]="msg.read" [class.text-neutral-400]="msg.read">
                        {{ msg.read ? 'Leído' : 'Nuevo' }}
                      </span>
                    </div>
                    <p class="text-xs opacity-75 leading-relaxed">{{ msg.message }}</p>
                    <span class="text-[9px] opacity-45 block">{{ msg.date }}</span>
                  </div>

                  <div class="flex items-center gap-3 self-end md:self-center">
                    <button (click)="toggleMessageRead(msg.id)" 
                            class="px-4 py-2 border rounded-xl text-[10px] uppercase font-bold tracking-wider hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer">
                      {{ msg.read ? 'Marcar No Leído' : 'Marcar Leído' }}
                    </button>
                    <button (click)="deleteMessage(msg.id)" 
                            class="px-4 py-2 border border-red-500/20 text-red-400 rounded-xl text-[10px] uppercase font-bold tracking-wider hover:bg-red-500/10 transition-all cursor-pointer">
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- ═══════════════════════════════════════════ -->
          <!-- 6. SOLICITUDES DE PLANES (LEADS)            -->
          <!-- ═══════════════════════════════════════════ -->
          <div *ngIf="activeTab === 'leads'" class="space-y-6 animate-fade-in">
            <div class="p-6 rounded-2xl border space-y-4"
                 [style.background]="currentTheme === 'light' ? '#ffffff' : '#07070a'"
                 [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'">
              
              <div *ngIf="leadsList.length === 0" class="p-12 text-center text-sm opacity-55">
                No hay solicitudes de planes registradas.
              </div>

              <div *ngIf="leadsList.length > 0" class="space-y-4">
                <div *ngFor="let lead of leadsList" 
                     class="p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300"
                     [style.background]="currentTheme === 'light' ? '#f9fafb' : '#0c0c0e'"
                     [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'">
                  
                  <div class="space-y-1.5">
                    <div class="flex items-center gap-3">
                      <span class="text-xs font-bold" [style.color]="currentTheme === 'light' ? '#111827' : '#ffffff'">{{ lead.name }}</span>
                      <span class="text-[10px] opacity-50">{{ lead.email }}</span>
                    </div>
                    <div class="flex items-center gap-2.5 text-xs">
                      <span class="text-[10px] uppercase tracking-wider font-bold text-amber-400">{{ lead.plan }}</span>
                      <span class="opacity-40">•</span>
                      <span class="opacity-70 font-semibold">{{ lead.price }}</span>
                      <span class="opacity-40">•</span>
                      <span class="text-[9px] opacity-45">{{ lead.date }}</span>
                    </div>
                  </div>

                  <div class="flex items-center gap-3 self-end md:self-center">
                    <select [ngModel]="lead.status" (ngModelChange)="changeLeadStatus(lead.id, $event)" 
                            class="admin-input p-2.5 rounded-xl border text-[10px] uppercase font-bold tracking-wider focus:outline-none"
                            [style.background]="currentTheme === 'light' ? '#ffffff' : '#141418'"
                            [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'">
                      <option value="Pendiente">Pendiente</option>
                      <option value="Contactado">Contactado</option>
                      <option value="Completado">Completado</option>
                    </select>
                    
                    <button (click)="deleteLead(lead.id)" 
                            class="px-4 py-2 border border-red-500/20 text-red-400 rounded-xl text-[10px] uppercase font-bold tracking-wider hover:bg-red-500/10 transition-all cursor-pointer">
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- ═══════════════════════════════════════════ -->
          <!-- 7. USUARIOS REGISTRADOS                     -->
          <!-- ═══════════════════════════════════════════ -->
          <div *ngIf="activeTab === 'users'" class="space-y-6 animate-fade-in">
            <div class="p-6 rounded-2xl border space-y-4"
                 [style.background]="currentTheme === 'light' ? '#ffffff' : '#07070a'"
                 [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'">
              
              <div class="space-y-4">
                <div *ngFor="let user of usersList" 
                     class="p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300"
                     [style.background]="currentTheme === 'light' ? '#f9fafb' : '#0c0c0e'"
                     [style.borderColor]="currentTheme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'">
                  
                  <div class="flex items-center gap-4">
                    <img [src]="user.avatar" class="w-10 h-10 rounded-full object-cover border" style="border-color: rgba(255,255,255,0.1)" alt="Avatar" />
                    <div class="space-y-1">
                      <h4 class="text-xs font-bold" [style.color]="currentTheme === 'light' ? '#111827' : '#ffffff'">{{ user.name }}</h4>
                      <p class="text-[10px] opacity-60">{{ user.email }}</p>
                      <div class="flex items-center gap-2">
                        <span class="text-[9px] uppercase tracking-wider font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">{{ user.role }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-4 self-end md:self-center">
                    <span class="text-[9px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full"
                          [class.bg-green-500\/10]="user.status === 'Activo'" [class.text-green-400]="user.status === 'Activo'"
                          [class.bg-red-500\/10]="user.status === 'Inactivo'" [class.text-red-400]="user.status === 'Inactivo'">
                      {{ user.status }}
                    </span>
                    
                    <button (click)="toggleUserStatus(user.id)" 
                            class="px-4 py-2 border rounded-xl text-[10px] uppercase font-bold tracking-wider hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer">
                      {{ user.status === 'Activo' ? 'Desactivar' : 'Activar' }}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </main>
    </div>
  `,
  styles: [`
    .admin-wrapper {
      --bg-primary: #020204;
      --text-primary: #ffffff;
      background-color: #020204;
    }
    .light-admin {
      --bg-primary: #ffffff;
      --text-primary: #1f2937;
      background-color: #ffffff;
      color: #111827;
    }
    
    .active-nav {
      background: #00f5ff !important;
      box-shadow: 0 4px 20px rgba(0, 245, 255, 0.25);
    }
    
    .admin-input {
      outline: none;
      transition: all 0.3s ease;
    }
    .admin-input:focus {
      border-color: #00f5ff !important;
      box-shadow: 0 0 0 2px rgba(0, 245, 255, 0.05);
    }
    
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class AdminComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private configService = inject(PortfolioConfigService);
  private router = inject(Router);

  currentTheme = 'dark';
  currentLanguage = 'es';
  activeTab = 'dashboard';
  
  metrics!: SystemMetrics;
  configDraft: any = null;
  
  chatbotName = 'Rotbot';
  maintenanceMode = false;

  // Mock lists
  messagesList = [
    { id: 1, name: 'Juan Pérez', email: 'juan.perez@example.com', message: 'Hola Santiago, me interesa un portafolio web para mi agencia de marketing. ¿Cuánto costaría?', date: 'Hace 2 horas', read: false },
    { id: 2, name: 'María Gómez', email: 'maria.gomez@company.com', message: 'Excelente trabajo con PortaLink AI Vision, ¿es posible integrarlo con Shopify?', date: 'Ayer', read: true },
    { id: 3, name: 'Robert C.', email: 'robert@designstudio.us', message: 'Would love to discuss a potential co-op development project.', date: 'Hace 3 días', read: true }
  ];

  leadsList = [
    { id: 1, name: 'Carlos Mendoza', email: 'carlos@mendoza.co', plan: 'Plan Premium', price: '$299 USD', date: 'Hace 4 horas', status: 'Pendiente' },
    { id: 2, name: 'Ana Sofía Silva', email: 'ana.silva@techcorp.io', plan: 'Plan Custom (IA)', price: 'Cotización', date: 'Hace 1 día', status: 'Contactado' },
    { id: 3, name: 'Diego Torres', email: 'diego@torres.es', plan: 'Plan Starter', price: '$99 USD', date: 'Hace 5 días', status: 'Completado' }
  ];

  usersList = [
    { id: 1, name: 'Santiago Arbeláez', email: 'santiago@portalink.com', role: 'Administrador', status: 'Activo', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80' },
    { id: 2, name: 'Lucía Fernández', email: 'lucia.f@portalink.com', role: 'Editor', status: 'Activo', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80' },
    { id: 3, name: 'Mateo R.', email: 'mateo@user.com', role: 'Usuario', status: 'Inactivo', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80' }
  ];

  tabs = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'messages', name: 'Mensajes Recibidos' },
    { id: 'leads', name: 'Solicitudes de Planes' },
    { id: 'users', name: 'Usuarios Registrados' },
    { id: 'home', name: 'Personalizar Home' },
    { id: 'linktree', name: 'Configurar Links' },
    { id: 'config', name: 'Sistema' }
  ];

  ngOnInit() {
    this.metrics = this.analyticsService.getMetrics();
    
    if (typeof window !== 'undefined') {
      this.currentTheme = localStorage.getItem('portfolio-theme') || 'dark';
      this.currentLanguage = localStorage.getItem('portfolio-language') || 'es';
      
      const savedBot = localStorage.getItem('portalink_chatbot_name');
      if (savedBot) {
        this.chatbotName = savedBot;
      }

      // Load interactive lists
      const savedMessages = localStorage.getItem('portalink_admin_messages');
      if (savedMessages) {
        this.messagesList = JSON.parse(savedMessages);
      } else {
        localStorage.setItem('portalink_admin_messages', JSON.stringify(this.messagesList));
      }

      const savedLeads = localStorage.getItem('portalink_admin_leads');
      if (savedLeads) {
        this.leadsList = JSON.parse(savedLeads);
      } else {
        localStorage.setItem('portalink_admin_leads', JSON.stringify(this.leadsList));
      }

      const savedUsers = localStorage.getItem('portalink_admin_users');
      if (savedUsers) {
        this.usersList = JSON.parse(savedUsers);
      } else {
        localStorage.setItem('portalink_admin_users', JSON.stringify(this.usersList));
      }
    }
    
    // Subscribe to config updates
    const currentData = this.configService.data();
    if (currentData) {
      this.configDraft = JSON.parse(JSON.stringify(currentData));
    }
  }

  getTabTitle() {
    switch (this.activeTab) {
      case 'dashboard': return 'Métricas del Sistema';
      case 'messages': return 'Mensajes Recibidos';
      case 'leads': return 'Solicitudes de Planes';
      case 'users': return 'Usuarios Registrados';
      case 'home': return 'Personalización del Home';
      case 'linktree': return 'Personalización de Linktree';
      case 'config': return 'Ajustes del Sistema';
      default: return '';
    }
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('portfolio-theme', this.currentTheme);
    const root = document.documentElement;
    root.classList.remove('theme-dark', 'theme-light');
    root.classList.add(`theme-${this.currentTheme}`);
    this.analyticsService.recordThemeSelection(this.currentTheme);
  }

  // Analytics getters
  getAverageLoadTime() {
    if (!this.metrics.loadTimes || this.metrics.loadTimes.length === 0) {
      return 150; // fallback standard response
    }
    const sum = this.metrics.loadTimes.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.metrics.loadTimes.length);
  }

  getSectionViewsArray() {
    const list = [];
    for (const key of Object.keys(this.metrics.sectionViews)) {
      list.push({ name: key, views: this.metrics.sectionViews[key] });
    }
    return list;
  }

  getSectionPercentage(views: number) {
    const total = Object.values(this.metrics.sectionViews).reduce((a, b) => a + b, 0);
    if (total === 0) return 0;
    return (views / total) * 100;
  }

  getLinkClicksArray() {
    const list = [];
    for (const key of Object.keys(this.metrics.linktreeClicks)) {
      list.push({ name: key, count: this.metrics.linktreeClicks[key] });
    }
    return list;
  }

  getLinkClickPercentage(count: number) {
    const total = Object.values(this.metrics.linktreeClicks).reduce((a, b) => a + b, 0);
    if (total === 0) return 0;
    return (count / total) * 100;
  }

  resetMetrics() {
    if (confirm('¿Estás seguro de que deseas restablecer todas las métricas de rendimiento y visibilidad?')) {
      this.analyticsService.resetMetrics();
      this.metrics = this.analyticsService.getMetrics();
    }
  }

  // Linktree Operations
  addLinkItem() {
    if (!this.configDraft.links.items) {
      this.configDraft.links.items = [];
    }
    const newId = (this.configDraft.links.items.length + 1).toString();
    this.configDraft.links.items.push({
      id: newId,
      title: 'Nuevo Enlace',
      subtitle: 'Descripción corta',
      url: 'https://',
      icon: 'link'
    });
  }

  removeLinkItem(index: number) {
    this.configDraft.links.items.splice(index, 1);
  }

  // Draft operations
  saveDraft() {
    this.configService.updateSection('general', this.configDraft.general);
    this.configService.updateSection('hero', this.configDraft.hero);
    this.configService.updateSection('about', this.configDraft.about);
    this.configService.updateSection('contact', this.configDraft.contact);
    this.configService.updateSection('links', this.configDraft.links);
    
    // chatbot configuration
    localStorage.setItem('portalink_chatbot_name', this.chatbotName);
    
    this.configService.save();
    alert('Configuración guardada y publicada exitosamente en el borrador local.');
  }

  resetDraft() {
    if (confirm('¿Estás seguro de que deseas descartar todos los cambios no guardados?')) {
      this.configService.reset();
      const currentData = this.configService.data();
      if (currentData) {
        this.configDraft = JSON.parse(JSON.stringify(currentData));
      }
    }
  }

  // List interactions
  toggleMessageRead(id: number) {
    const msg = this.messagesList.find(m => m.id === id);
    if (msg) {
      msg.read = !msg.read;
      localStorage.setItem('portalink_admin_messages', JSON.stringify(this.messagesList));
    }
  }

  deleteMessage(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este mensaje?')) {
      this.messagesList = this.messagesList.filter(m => m.id !== id);
      localStorage.setItem('portalink_admin_messages', JSON.stringify(this.messagesList));
    }
  }

  changeLeadStatus(id: number, nextStatus: string) {
    const lead = this.leadsList.find(l => l.id === id);
    if (lead) {
      lead.status = nextStatus;
      localStorage.setItem('portalink_admin_leads', JSON.stringify(this.leadsList));
    }
  }

  deleteLead(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar esta solicitud?')) {
      this.leadsList = this.leadsList.filter(l => l.id !== id);
      localStorage.setItem('portalink_admin_leads', JSON.stringify(this.leadsList));
    }
  }

  toggleUserStatus(id: number) {
    const user = this.usersList.find(u => u.id === id);
    if (user) {
      user.status = user.status === 'Activo' ? 'Inactivo' : 'Activo';
      localStorage.setItem('portalink_admin_users', JSON.stringify(this.usersList));
    }
  }

  exportConfig() {
    this.configService.exportJSON();
  }
}
