import { Component, ElementRef, ViewChild, OnInit, AfterViewChecked, OnDestroy, effect, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChatStateService } from '../../services/chat-state.service';
import { AnalyticsService } from '../../services/analytics.service';
import { ChatLimitModalComponent } from '../../components/chat-limit-modal/chat-limit-modal.component';
import { AiInfoModalComponent } from '../../components/ai-info-modal/ai-info-modal.component';
import { MarkdownPipe } from '../../pipes/markdown-pipe';
import { AuthService } from '../../services/auth.service';
import { SiteService } from '../../services/site.service';

@Component({
  selector: 'app-rotbot-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ChatLimitModalComponent, AiInfoModalComponent, MarkdownPipe],
  template: `
    <app-chat-limit-modal></app-chat-limit-modal>
    <app-ai-info-modal [isOpen]="isInfoModalOpen" (closeEvent)="isInfoModalOpen = false"></app-ai-info-modal>
    <div class="fixed inset-0 w-full h-full flex flex-col overflow-hidden font-sans page-container">
      <!-- Header -->
      <div class="chat-header flex items-center justify-between border-b px-6 py-5 relative overflow-hidden">
        <!-- Cyber Scanner Line -->
        <div class="absolute top-0 left-0 w-full h-[1px] scanner-line"></div>
        
        <div class="flex items-center gap-3 relative z-10">
          <div class="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center p-1.5 border border-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]">
            <img [src]="currentTheme === 'dark' ? 'assets/icons/logo-link-dark.png' : 'assets/icons/logo-link-light.png'" class="w-full h-full object-contain filter drop-shadow-[0_0_5px_rgba(0,245,255,0.3)]" alt="Rotbot">
          </div>
          <div>
            <h3 class="font-sans text-[18px] font-bold tracking-wide leading-none" style="color: var(--text-primary);">
              RotBot IA
            </h3>
            <div class="flex items-center gap-1.5 mt-1.5">
               <span class="w-2 h-2 rounded-full animate-pulse shadow-[0_0_5px_var(--accent-color)]" style="background-color: var(--accent-color);"></span>
               <p class="text-[11px] uppercase tracking-widest font-sans font-semibold" style="color: var(--text-secondary); opacity: 0.75;">System Active</p>
            </div>
          </div>
        </div>
        
        <!-- Actions Container -->
        <div class="flex items-center gap-4 relative z-10">
          <!-- Nuevo Chat -->
          <button (click)="chatService.clearHistory()" 
                  [disabled]="!authService.hasToken()"
                  [ngClass]="{'opacity-30 cursor-not-allowed': !authService.hasToken(), 'hover:opacity-100 opacity-60': authService.hasToken()}"
                  class="text-sm font-semibold uppercase tracking-wider flex items-center gap-2 transition-all mr-2" style="color: var(--text-primary);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l-3.08 2.82"/>
            </svg>
            <span class="hidden sm:inline">Nuevo Chat</span>
          </button>

          <!-- Volver al Inicio -->
          <a routerLink="/" class="text-sm font-semibold uppercase tracking-wider flex items-center gap-2 hover:opacity-100 opacity-60 transition-all mr-2" style="color: var(--text-primary);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span class="hidden sm:inline">Volver al Inicio</span>
          </a>

          <!-- Galería de Diseños -->
          <a routerLink="/prototipos" class="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all" style="color: var(--accent-color); border-color: rgba(0,245,255,0.25); background: rgba(0,245,255,0.06);" title="Ver Galería de Diseños">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span>Galería de Diseños</span>
          </a>

          <!-- Theme Toggle -->
          <button (click)="toggleTheme()" class="p-2 rounded-lg transition-all icon-btn mr-1" title="Cambiar Tema">
            <svg *ngIf="currentTheme === 'dark'" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            <svg *ngIf="currentTheme !== 'dark'" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </button>
 
          <!-- Back / Close Button -->
          <button (click)="goBack()" class="p-2 rounded-lg transition-all icon-btn" title="Cerrar y Volver">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
 
      <!-- Main Chat Body Split (3 Columns) -->
      <div class="flex flex-row flex-grow w-full overflow-hidden">
        
        <!-- Sidebar Izquierdo (Accesos Rápidos) -->
        <div *ngIf="!activeDesign" 
             [ngClass]="{'opacity-40 pointer-events-none grayscale': !authService.hasToken()}"
             class="chat-sidebar no-scrollbar hidden md:flex flex-col w-72 flex-shrink-0 border-r py-6 px-5 gap-3 overflow-y-auto animate-fade-in transition-all duration-500" style="border-color: var(--card-border);">
          <h4 class="sidebar-title text-[11px] font-bold uppercase tracking-widest mb-1" style="color: var(--text-secondary); opacity: 0.6;">Principales</h4>
          
          <button (click)="startDesignFlow()" class="shortcut-btn flex items-center gap-2.5 px-4 py-3 rounded-xl text-left border transition-all duration-300">
            <i class="fa-solid fa-palette text-cyan-400 text-xs"></i>
            <span class="text-[13px] sm:text-[14px] font-medium leading-snug" style="color: var(--text-primary);">Quiero un Diseño</span>
          </button>
          
          <button (click)="startConsultingFlow()" class="shortcut-btn flex items-center gap-2.5 px-4 py-3 rounded-xl text-left border transition-all duration-300">
            <i class="fa-solid fa-lightbulb text-purple-400 text-xs"></i>
            <span class="text-[13px] sm:text-[14px] font-medium leading-snug" style="color: var(--text-primary);">Quiero Asesoría</span>
          </button>

          <h4 class="sidebar-title text-[11px] font-bold uppercase tracking-widest mt-3 mb-1" style="color: var(--text-secondary); opacity: 0.6;">Diseños Frecuentes</h4>

          <button (click)="sendShortcutMessage('Quiero un diseño para mi tienda de ropa')" class="shortcut-btn flex items-center gap-2.5 px-4 py-3 rounded-xl text-left border transition-all duration-300">
            <i class="fa-solid fa-shirt text-cyan-400 text-xs shrink-0"></i>
            <span class="text-[13px] sm:text-[14px] font-medium leading-snug" style="color: var(--text-primary);">Diseño Tienda de Ropa</span>
          </button>

          <button (click)="sendShortcutMessage('Quiero un diseño para mi gimnasio')" class="shortcut-btn flex items-center gap-2.5 px-4 py-3 rounded-xl text-left border transition-all duration-300">
            <i class="fa-solid fa-dumbbell text-cyan-400 text-xs shrink-0"></i>
            <span class="text-[13px] sm:text-[14px] font-medium leading-snug" style="color: var(--text-primary);">Diseño para Gym / Fitness</span>
          </button>

          <button (click)="sendShortcutMessage('Quiero un catálogo digital para mis productos')" class="shortcut-btn flex items-center gap-2.5 px-4 py-3 rounded-xl text-left border transition-all duration-300">
            <i class="fa-solid fa-book-open text-cyan-400 text-xs shrink-0"></i>
            <span class="text-[13px] sm:text-[14px] font-medium leading-snug" style="color: var(--text-primary);">Catálogo Digital</span>
          </button>

          <button (click)="sendShortcutMessage('Quiero un sistema para agendamiento de citas')" class="shortcut-btn flex items-center gap-2.5 px-4 py-3 rounded-xl text-left border transition-all duration-300">
            <i class="fa-solid fa-calendar-check text-cyan-400 text-xs shrink-0"></i>
            <span class="text-[13px] sm:text-[14px] font-medium leading-snug" style="color: var(--text-primary);">Sistema de Agendamiento</span>
          </button>

          <button (click)="sendShortcutMessage('Quiero un diseño a medida para mi empresa')" class="shortcut-btn flex items-center gap-2.5 px-4 py-3 rounded-xl text-left border transition-all duration-300">
            <i class="fa-solid fa-wand-magic-sparkles text-cyan-400 text-xs shrink-0"></i>
            <span class="text-[13px] sm:text-[14px] font-medium leading-snug" style="color: var(--text-primary);">Sistema a Medida</span>
          </button>
        </div>
 
        <!-- Messages + Input Container (Centro o Izquierda en modo diseño) -->
        <div class="flex flex-col h-full overflow-hidden transition-all duration-500 relative"
             [ngClass]="activeDesign ? 'w-full lg:w-[65%] flex-shrink-0 border-r border-white/5' : 'flex-grow'">
          <!-- Messages Area -->
          <div #scrollContainer 
               [ngClass]="authService.hasToken() ? 'overflow-y-auto' : 'overflow-hidden'"
               class="flex-grow scroll-smooth custom-scrollbar messages-area space-y-6" style="overscroll-behavior: contain;">
            
            <ng-container *ngIf="chatService.isLoadingHistory(); else chatContent">
              <!-- Skeleton Loader -->
              <div class="flex flex-col gap-6 px-6 md:px-16 animate-pulse w-full max-w-5xl mx-auto">
                 <!-- Skeleton Assistant -->
                 <div class="flex w-full justify-start items-end">
                    <div class="w-9 h-9 rounded-full bg-white/5 mr-2.5 flex-shrink-0"></div>
                    <div class="bg-white/5 h-20 w-3/4 max-w-sm rounded-2xl rounded-bl-sm"></div>
                 </div>
                 <!-- Skeleton User -->
                 <div class="flex w-full justify-end items-end">
                    <div class="bg-white/10 h-14 w-2/3 max-w-xs rounded-2xl rounded-tr-sm"></div>
                 </div>
                 <!-- Skeleton Assistant -->
                 <div class="flex w-full justify-start items-end">
                    <div class="w-9 h-9 rounded-full bg-white/5 mr-2.5 flex-shrink-0"></div>
                    <div class="bg-white/5 h-32 w-4/5 max-w-md rounded-2xl rounded-bl-sm"></div>
                 </div>
              </div>
            </ng-container>

            <ng-template #chatContent>
              <!-- Welcome Intro Section (Shifted higher up) -->
            <div *ngIf="chatService.messages.length <= 1" class="flex flex-col items-center justify-center text-center pb-4 border-b pt-1 sm:pt-2 mb-2 welcome-border">
              <div class="w-44 h-44 sm:w-56 sm:h-56 mb-3 relative flex items-center justify-center overflow-visible transition-transform duration-500 hover:scale-105">
                <img src="assets/images/rotbot4.png" class="w-full h-full object-contain relative z-10" alt="Rotbot Full">
              </div>
              <h2 class="text-xl sm:text-2xl font-bold tracking-tight mb-2 font-sans" style="color: var(--text-primary);">
                Sistemas con Rotbot IA
              </h2>
              <div class="text-[14px] sm:text-[15px] font-light leading-relaxed px-4 max-w-lg" style="color: var(--text-secondary);">
                <p>
                  ¡Hola! Soy RotBot, tu copiloto tecnológico listo para guiarte en el desarrollo de tus proyectos web e Inteligencia Artificial.
                </p>
              </div>
            </div>
 
            <!-- Messages List -->
            <ng-container *ngIf="authService.hasToken()">
              <div *ngFor="let msg of chatService.messages" class="flex w-full px-6 md:px-16 animate-fade-in" [ngClass]="{'justify-end': msg.role === 'user', 'justify-start': msg.role === 'assistant'}">
                
                <!-- Assistant Avatar -->
                <div *ngIf="msg.role === 'assistant'" class="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center mr-2.5 p-1 border avatar-bg">
                  <img [src]="currentTheme === 'dark' ? 'assets/icons/logo-link-dark.png' : 'assets/icons/logo-link-light.png'" class="w-full h-full object-contain" alt="Rotbot">
                </div>
   
                <!-- Message Bubble -->
                <div 
                  [ngClass]="{
                    'assistant-bubble py-2 text-[14px] sm:text-[15px] leading-relaxed max-w-[80%]': msg.role === 'assistant',
                    'user-bubble px-4 py-3 rounded-2xl rounded-tr-sm text-[14px] sm:text-[15px] leading-relaxed max-w-[85%] border shadow-sm': msg.role === 'user'
                  }"
                >
                  <span [innerHTML]="msg.content | markdown"></span>

                  <!-- Initial Action Buttons -->
                  <div *ngIf="msg.role === 'assistant' && msg.showInitialActionButtons" class="mt-4 flex flex-wrap items-center gap-3">
                    <button 
                      (click)="startDesignFlow()" 
                      class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-400/40 hover:border-cyan-400 text-xs sm:text-sm font-bold text-white transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95">
                      <i class="fa-solid fa-wand-magic-sparkles text-cyan-400 text-sm"></i>
                      <span>Quiero un Diseño</span>
                    </button>
                    <button 
                      (click)="startConsultingFlow()" 
                      class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-400/40 hover:border-purple-400 text-xs sm:text-sm font-bold text-white transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95">
                      <i class="fa-solid fa-lightbulb text-purple-400 text-sm"></i>
                      <span>Quiero Asesoría</span>
                    </button>
                  </div>

                  <!-- Category Selector Chips -->
                  <div *ngIf="msg.role === 'assistant' && msg.showCategorySelector" class="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                    <button *ngFor="let cat of designCategories" 
                            (click)="selectCategory(cat)" 
                            class="px-3.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-cyan-400/20 border border-white/10 hover:border-cyan-400/50 text-xs font-semibold text-white transition-all text-left flex items-center gap-2.5 cursor-pointer shadow-sm active:scale-95">
                      <i [class]="cat.iconClass + ' text-cyan-400 text-xs shrink-0'"></i>
                      <span class="leading-tight">{{ cat.label }}</span>
                    </button>
                  </div>

                  <!-- Design Card Preview & Interactive System Form -->
                  <div *ngIf="msg.role === 'assistant' && msg.designImage" class="mt-4 rounded-2xl border border-white/15 bg-black/70 p-4 sm:p-5 space-y-4 shadow-2xl backdrop-blur-md">
                    <!-- Header Badge -->
                    <div class="flex items-center justify-between pb-2 border-b border-white/10">
                      <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                        <span class="text-xs font-bold uppercase tracking-wider text-cyan-300">Diseño Sugerido</span>
                      </div>
                      <span class="text-[10px] text-neutral-400 font-mono">RotBot Design Engine</span>
                    </div>

                    <!-- Preview Image -->
                    <div (click)="openDesignDetailModal(msg)" class="relative rounded-xl overflow-hidden border border-white/10 group shadow-lg max-h-[350px] bg-neutral-950 flex items-center justify-center cursor-pointer">
                      <img [src]="msg.designImage" alt="Vista previa de diseño" class="w-full h-auto object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-3">
                        <span class="text-xs font-bold text-white bg-cyan-500/20 backdrop-blur-md border border-cyan-400/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md">
                          <i class="fa-solid fa-magnifying-glass-plus text-cyan-400"></i>
                          <span>Ampliar y Especificar Proyecto</span>
                        </span>
                        <a routerLink="/prototipos" (click)="$event.stopPropagation()" class="text-xs font-bold text-white bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-all flex items-center gap-1.5">
                          <span>Galería</span>
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                        </a>
                      </div>
                    </div>

                    <!-- Interactive Form Component -->
                    <div *ngIf="msg.showDesignForm" class="pt-2 space-y-3.5">
                      <div class="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                        <span>📝 Especifica cómo quieres tu Sistema a Medida:</span>
                      </div>

                      <div *ngIf="!msg.formSubmitted" class="space-y-3">
                        <div>
                          <label class="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1">Nombre de tu Negocio / Proyecto</label>
                          <input type="text" [(ngModel)]="designFormState.businessName" placeholder="Ej: Sparta Gym / Mi Marca" class="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-sm text-white focus:outline-none focus:border-cyan-400 transition-all placeholder:text-neutral-500" />
                        </div>

                        <div>
                          <label class="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1">Diseño y Estilo del Sitio</label>
                          <select [(ngModel)]="designFormState.style" class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-sm text-white focus:outline-none focus:border-cyan-400 transition-all">
                            <option value="Minimalista y Elegante">Minimalista & Elegante</option>
                            <option value="Moderno y Dinámico">Moderno & Dinámico</option>
                            <option value="Futurista / Dark Cyber">Futurista / Dark Cyber</option>
                            <option value="Limpio y Profesional">Limpio & Profesional</option>
                            <option value="Editorial / Creativo">Editorial / Creativo</option>
                          </select>
                        </div>

                        <div>
                          <label class="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1">Descripción de tu Sistema a Medida</label>
                          <textarea [(ngModel)]="designFormState.description" rows="3" placeholder="Escribe un mensaje especificando cómo debe ser tu proyecto, qué funcionalidades o secciones necesitas..." class="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-sm text-white focus:outline-none focus:border-cyan-400 transition-all resize-none placeholder:text-neutral-500"></textarea>
                        </div>

                        <button (click)="submitDesignForm(msg)" 
                                [disabled]="!designFormState.description.trim()" 
                                class="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer disabled:opacity-50 active:scale-95">
                          <span>Enviar Mensaje de Mi Proyecto</span>
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3 21l18-9L3 3l3 9zm0 0h7.5"/></svg>
                        </button>
                      </div>

                      <div *ngIf="msg.formSubmitted" class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2">
                        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                          <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                          <span>¡Mensaje de Proyecto Registrado!</span>
                        </div>
                        <p class="text-xs text-neutral-200">Se enviaron las especificaciones de tu proyecto. Santiago te contactará pronto para coordinar los detalles.</p>
                      </div>
                    </div>
                  </div>

                  <!-- Tarjeta interactiva para ir a personalizar con el JSON devuelto -->
                  <div *ngIf="msg.role === 'assistant' && hasGeneratedSite(msg.content)" 
                       class="mt-4 p-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg animate-fade-in">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300 text-lg">
                        ✨
                      </div>
                      <div>
                        <h4 class="text-sm font-bold text-white">¡Tu Landing Page está lista!</h4>
                        <p class="text-xs text-neutral-300">Hemos estructurado tu sitio con los datos que nos diste.</p>
                      </div>
                    </div>
                    <button (click)="customizeSiteFromMessage(msg.content)"
                            class="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer whitespace-nowrap">
                      <span>Personalizar Mi Sitio</span>
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </ng-container>
 
            <!-- Typing Indicator -->
            <div *ngIf="chatService.isTyping" class="flex items-center gap-3 w-full px-6 md:px-16">
              <div class="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center p-1 border avatar-bg">
                <img [src]="currentTheme === 'dark' ? 'assets/icons/logo-link-dark.png' : 'assets/icons/logo-link-light.png'" class="w-full h-full object-contain" alt="Rotbot">
              </div>
              <div class="assistant-bubble py-2 flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 rounded-full bg-current animate-bounce"></div>
                <div class="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0.2s]"></div>
                <div class="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0.4s]"></div>
              </div>
              </div>
            </ng-template>
          </div>
 
          <!-- Input Area -->
          <div class="chat-input-area p-3 sm:p-6 border-t">
            <ng-container *ngIf="authService.hasToken(); else loginPrompt">
              <form (submit)="sendMessage()" class="relative max-w-4xl mx-auto">
                <textarea 
                  #chatInputRef
                  [(ngModel)]="chatService.userInput"
                  (keydown)="onInputKeydown($event)"
                  (input)="autoResizeInput($event)"
                  name="userInput"
                  rows="1"
                  placeholder="Pregúntale a Rotbot..."
                  class="chat-input w-full rounded-xl border py-4 pl-5 pr-14 text-[17px] font-light tracking-wide transition-all focus:ring-0 focus:outline-none resize-none overflow-y-auto leading-normal max-h-36 block"
                ></textarea>
                <button 
                  type="submit"
                  [disabled]="!chatService.userInput.trim()"
                  class="chat-submit-btn absolute right-3 bottom-3 p-2 rounded-lg transition-all"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </form>
            </ng-container>
            <ng-template #loginPrompt>
              <div class="flex flex-col items-center justify-center py-7 px-8 w-full max-w-2xl sm:max-w-3xl mx-auto rounded-2xl border mb-2 relative overflow-hidden backdrop-blur-xl transition-all duration-300 shadow-md login-prompt-card"
                   style="border-color: var(--card-border, rgba(255, 255, 255, 0.1)); background: var(--card-bg, rgba(255, 255, 255, 0.03));">
                
                <!-- Subtle Icon Badge -->
                <div class="w-11 h-11 rounded-xl flex items-center justify-center mb-3 border shadow-sm" style="background: rgba(255,255,255,0.04); border-color: var(--card-border, rgba(255,255,255,0.1));">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-80" style="color: var(--text-primary);">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                
                <h3 class="text-base sm:text-lg font-bold tracking-wide mb-1 font-sans text-center" style="color: var(--text-primary);">
                  Desbloquea RotBot IA
                </h3>
                
                <p class="text-xs sm:text-[13.5px] font-light mb-5 text-center leading-relaxed max-w-md" style="color: var(--text-secondary);">
                  Inicia sesión o regístrate para conversar sin límites y potenciar tu proyecto.
                </p>
                
                <div class="flex flex-row gap-3 w-full sm:w-auto items-center justify-center">
                  <!-- White Button -->
                  <button routerLink="/register" class="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 hover:bg-neutral-200 active:scale-95 text-center cursor-pointer shadow-md bg-white text-black">
                    Crear Cuenta Gratis
                  </button>
                  <!-- Secondary Glass Button -->
                  <button routerLink="/login" class="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:bg-white/10 border border-white/20 text-center cursor-pointer" style="color: var(--text-primary);">
                    Iniciar Sesión
                  </button>
                </div>
              </div>
            </ng-template>
            <div class="flex justify-center mt-3">
               <span class="text-[11px] uppercase tracking-widest font-sans font-medium opacity-40" style="color: var(--text-secondary);">Powered by Portalink IA</span>
            </div>
          </div>
        </div>
 
        <!-- Sidebar Derecho (Info Rotbot) -->
        <div class="chat-sidebar no-scrollbar hidden md:flex flex-col w-80 flex-shrink-0 border-l py-8 px-6 gap-6 overflow-y-auto animate-fade-in" style="border-color: var(--card-border);">
          <h4 class="sidebar-title mb-2">¿Quién es Rotbot?</h4>
          
          <div class="flex flex-col items-center text-center gap-4 p-5 rounded-2xl border right-sidebar-card" style="border-color: var(--card-border);">
            <div class="w-24 h-24 rounded-2xl flex items-center justify-center p-2 border right-sidebar-icon shadow-inner">
              <img [src]="currentTheme === 'dark' ? 'assets/icons/logo-link-dark.png' : 'assets/icons/logo-link-light.png'" class="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(0,245,255,0.4)]" alt="Rotbot Logo">
            </div>
            <div>
              <h5 class="text-base font-bold tracking-wide" style="color: var(--text-primary);">Copiloto Tecnológico</h5>
              <p class="text-[14px] font-normal mt-2 leading-relaxed opacity-95" style="color: var(--text-secondary);">
                Rotbot es una inteligencia artificial diseñada para asesorar y guiar en el desarrollo de soluciones digitales avanzadas, desarrollo a medida y automatizaciones de procesos comerciales.
              </p>
              <button (click)="isInfoModalOpen = true" class="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all group">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-cyan-400 group-hover:scale-110 transition-transform">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span class="text-xs sm:text-sm font-bold uppercase tracking-wider" style="color: var(--text-primary);">Info de la IA</span>
              </button>
            </div>
          </div>
 
          <h4 class="sidebar-title mt-2 mb-2">¿Tienes un Proyecto?</h4>
 
          <button (click)="sendShortcutMessage('Quiero una implementación de IA en mi negocio')" class="shortcut-btn flex flex-col gap-2 p-5 rounded-xl text-left border transition-all duration-300 shadow-sm hover:shadow-md">
            <span class="text-xs font-bold uppercase tracking-widest" style="color: var(--accent-color);">Oportunidad</span>
            <span class="text-[17px] font-bold leading-snug" style="color: var(--text-primary);">Quiero mi IA para mi negocio</span>
            <span class="text-[13.5px] font-normal opacity-95 leading-normal block" style="color: var(--text-secondary);">
              Empieza hoy la transformación digital y automatiza tu negocio con Inteligencia Artificial.
            </span>
          </button>
        </div>
      </div>

      <!-- MODAL DE DESCRIPCIÓN Y ESPECIFICACIÓN DEL PROYECTO -->
      <div *ngIf="selectedModalDesign()" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in" (click)="closeDesignDetailModal()">
        <div class="relative w-full max-w-4xl max-h-[90vh] bg-neutral-900 border border-white/15 rounded-3xl overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-6 shadow-2xl" (click)="$event.stopPropagation()">
          
          <!-- Modal Header -->
          <div class="flex items-center justify-between border-b border-white/10 pb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                <i class="fa-solid fa-layer-group text-lg"></i>
              </div>
              <div>
                <h3 class="text-lg font-bold text-white tracking-tight">Descripción y Especificaciones del Proyecto</h3>
                <p class="text-xs text-neutral-400">Prototipo sugerido: <span class="text-cyan-400 font-semibold">{{ selectedModalDesign()?.categoryName }}</span></p>
              </div>
            </div>
            <button (click)="closeDesignDetailModal()" class="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-all cursor-pointer">
              <i class="fa-solid fa-xmark text-base"></i>
            </button>
          </div>

          <!-- Visor de Imagen Ampliada -->
          <div class="space-y-2">
            <div class="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <i class="fa-solid fa-image text-cyan-400"></i>
              <span>Previsualización Ampliada del Prototipo</span>
            </div>

            <div class="relative w-full max-h-[500px] rounded-2xl overflow-hidden border border-white/15 bg-black shadow-2xl flex items-center justify-center">
              <img 
                [src]="selectedModalDesign()?.designImage" 
                alt="Vista previa ampliada de diseño" 
                class="w-full h-auto max-h-[500px] object-contain object-top"
              />
            </div>
          </div>

          <!-- Especificaciones por Defecto del Proyecto -->
          <div class="space-y-3 pt-2">
            <div class="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <i class="fa-solid fa-circle-check text-cyan-400"></i>
              <span>Especificaciones y Características por Defecto:</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                <i class="fa-solid fa-mobile-screen text-cyan-400 text-base mt-0.5 shrink-0"></i>
                <div>
                  <h4 class="text-xs font-bold text-white">Diseño 100% Adaptativo</h4>
                  <p class="text-[11px] text-neutral-400 leading-normal">Optimizado para celulares, tablets y computadoras de escritorio.</p>
                </div>
              </div>

              <div class="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                <i class="fa-solid fa-bullseye text-cyan-400 text-base mt-0.5 shrink-0"></i>
                <div>
                  <h4 class="text-xs font-bold text-white">Estructura para Conversiones</h4>
                  <p class="text-[11px] text-neutral-400 leading-normal">Secciones estratégicas con botones de llamada a la acción (CTA).</p>
                </div>
              </div>

              <div class="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                <i class="fa-brands fa-whatsapp text-emerald-400 text-base mt-0.5 shrink-0"></i>
                <div>
                  <h4 class="text-xs font-bold text-white">Conexión Directa a WhatsApp</h4>
                  <p class="text-[11px] text-neutral-400 leading-normal">Botones y formularios con redirección instantánea a tu chat.</p>
                </div>
              </div>

              <div class="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                <i class="fa-solid fa-gauge-high text-cyan-400 text-base mt-0.5 shrink-0"></i>
                <div>
                  <h4 class="text-xs font-bold text-white">Carga Ultrarrápida & SEO</h4>
                  <p class="text-[11px] text-neutral-400 leading-normal">Código optimizado para posicionar en Google y cargar en milisegundos.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Contenedor del Formulario Inferior -->
          <div class="pt-4 border-t border-white/10 space-y-4">
            <div class="text-sm font-extrabold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
              <span>📝 Especifica cómo quieres tu Sistema a Medida:</span>
            </div>

            <div *ngIf="!selectedModalDesign()?.msg?.formSubmitted" class="space-y-4 bg-white/[0.02] border border-white/10 p-5 rounded-2xl">
              <div>
                <label class="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1.5">Nombre de tu Negocio / Proyecto</label>
                <input type="text" [(ngModel)]="designFormState.businessName" placeholder="Ej: Sparta Gym / Mi Marca" class="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:outline-none focus:border-cyan-400 transition-all placeholder:text-neutral-500" />
              </div>

              <div>
                <label class="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1.5">Diseño y Estilo del Sitio</label>
                <select [(ngModel)]="designFormState.style" class="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-white/15 text-sm text-white focus:outline-none focus:border-cyan-400 transition-all">
                  <option value="Minimalista y Elegante">Minimalista & Elegante</option>
                  <option value="Moderno y Dinámico">Moderno & Dinámico</option>
                  <option value="Futurista / Dark Cyber">Futurista / Dark Cyber</option>
                  <option value="Limpio y Profesional">Limpio & Profesional</option>
                  <option value="Editorial / Creativo">Editorial / Creativo</option>
                </select>
              </div>

              <div>
                <label class="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1.5">Descripción de tu Sistema a Medida</label>
                <textarea [(ngModel)]="designFormState.description" rows="4" placeholder="Escribe un mensaje especificando cómo debe ser tu proyecto, qué funcionalidades o secciones necesitas..." class="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:outline-none focus:border-cyan-400 transition-all resize-none placeholder:text-neutral-500"></textarea>
              </div>

              <button (click)="submitDesignFormFromModal()" 
                      [disabled]="!designFormState.description.trim()" 
                      class="w-full py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl cursor-pointer disabled:opacity-50 active:scale-95">
                <span>Enviar Mensaje de Mi Proyecto</span>
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3 21l18-9L3 3l3 9zm0 0h7.5"/></svg>
              </button>
            </div>

            <div *ngIf="selectedModalDesign()?.msg?.formSubmitted" class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2">
              <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                <span>¡Mensaje de Proyecto Registrado!</span>
              </div>
              <p class="text-xs text-neutral-200">Se enviaron las especificaciones de tu proyecto. Santiago te contactará pronto para coordinar los detalles.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --font-headline: 'Bebas Neue', sans-serif;
    }
    .font-headline {
      font-family: var(--font-headline);
    }
    .page-container {
      /* 100% Opacity Background */
      background: rgb(8, 8, 8);
      z-index: 9999;
    }
    :host-context(.theme-light) .page-container {
      background: rgb(255, 255, 255);
    }
    .chat-header {
      border-color: rgba(255, 255, 255, 0.08);
      background: rgb(8, 8, 8);
    }
    :host-context(.theme-light) .chat-header {
      border-color: rgba(0, 0, 0, 0.06);
      background: rgb(255, 255, 255);
    }
    .icon-btn {
      color: var(--text-secondary);
    }
    .icon-btn:hover {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.05);
    }
    :host-context(.theme-light) .icon-btn:hover {
      background: rgba(0, 0, 0, 0.05);
    }
    .scanner-line {
      background: linear-gradient(90deg, transparent, var(--accent-color, #00f5ff), transparent);
      animation: scan 3s linear infinite;
      opacity: 0.8;
    }
    @keyframes scan {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    .welcome-border {
      border-color: rgba(255, 255, 255, 0.08);
    }
    :host-context(.theme-light) .welcome-border {
      border-color: rgba(0, 0, 0, 0.06);
    }
    .avatar-bg {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.08);
    }
    :host-context(.theme-light) .avatar-bg {
      background: rgba(0, 0, 0, 0.02);
      border-color: rgba(0, 0, 0, 0.05);
    }
    .assistant-bubble {
      background: transparent;
      border: none !important;
      box-shadow: none !important;
      color: var(--text-primary, #ffffff);
      padding: 8px 0 !important;
    }
    .user-bubble {
      background: var(--accent-color, #00f5ff);
      border-color: var(--accent-color, #00f5ff);
      color: #000000;
      font-weight: 600;
    }
    .chat-input-area {
      border-color: rgba(255, 255, 255, 0.08);
      background: rgb(8, 8, 8);
    }
    :host-context(.theme-light) .chat-input-area {
      border-color: rgba(0, 0, 0, 0.06);
      background: rgb(255, 255, 255);
    }
    .chat-input {
      background: rgba(255, 255, 255, 0.02);
      border-color: rgba(255, 255, 255, 0.08);
      color: var(--text-primary, #ffffff);
    }
    :host-context(.theme-light) .chat-input {
      background: rgba(0, 0, 0, 0.01);
      border-color: rgba(0, 0, 0, 0.06);
    }
    .chat-input:focus {
      border-color: var(--accent-color, #00f5ff);
      background: rgba(255, 255, 255, 0.04);
      box-shadow: 0 0 15px rgba(0, 245, 255, 0.08);
    }
    .chat-submit-btn {
      color: var(--accent-color, #00f5ff);
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
    :host-context(.theme-light) .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.08);
    }
    .messages-area {
      padding-top: 1rem !important;
      padding-bottom: 1rem !important;
    }
    @media (min-width: 768px) {
      .messages-area {
        padding-top: 1.5rem !important;
        padding-bottom: 1rem !important;
      }
    }
    .chat-sidebar {
      background: rgba(0, 0, 0, 0.15);
    }
    :host-context(.theme-light) .chat-sidebar {
      background: rgba(0, 0, 0, 0.02);
      border-color: rgba(0, 0, 0, 0.06) !important;
    }
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .shortcut-btn {
      background: rgba(255, 255, 255, 0.02);
      border-color: rgba(255, 255, 255, 0.06);
    }
    :host-context(.theme-light) .shortcut-btn {
      background: rgba(0, 0, 0, 0.01);
      border-color: rgba(0, 0, 0, 0.04);
    }
    .shortcut-btn:hover {
      border-color: var(--accent-color, #00f5ff) !important;
      background: rgba(255, 255, 255, 0.05);
      transform: translateY(-1px);
    }
    :host-context(.theme-light) .shortcut-btn:hover {
      background: rgba(0, 0, 0, 0.02);
    }
    .right-sidebar-card {
      background: rgba(255, 255, 255, 0.02);
    }
    :host-context(.theme-light) .right-sidebar-card {
      background: rgba(0, 0, 0, 0.015);
    }
    .right-sidebar-icon {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.1);
    }
    :host-context(.theme-light) .right-sidebar-icon {
      background: rgba(0, 0, 0, 0.03);
      border-color: rgba(0, 0, 0, 0.05);
      box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.02);
    }
    .sidebar-title {
      font-size: 13.5px;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      font-family: var(--font-sans, sans-serif);
      font-weight: 700;
      color: var(--text-secondary);
      opacity: 0.65;
    }
    :host-context(.theme-light) .sidebar-title {
      color: var(--text-primary);
      opacity: 0.8;
      font-weight: 700;
    }
    :host-context(.theme-light) .login-prompt-card {
      background: #ffffff !important;
      border-color: rgba(0, 0, 0, 0.08) !important;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04) !important;
    }
  `]
})
export class RotbotComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @ViewChild('chatInputRef') private chatInputRef?: ElementRef<HTMLTextAreaElement>;

  selectedModalDesign = signal<{ designImage: string; categoryName?: string; msg?: any } | null>(null);

  openDesignDetailModal(msg: any) {
    this.selectedModalDesign.set({
      designImage: msg.designImage,
      categoryName: msg.formData?.categoryName || this.designFormState.categoryName || 'Proyecto Sugerido',
      msg: msg
    });
  }

  closeDesignDetailModal() {
    this.selectedModalDesign.set(null);
  }

  submitDesignFormFromModal() {
    const currentModal = this.selectedModalDesign();
    if (currentModal && currentModal.msg) {
      this.submitDesignForm(currentModal.msg);
    }
  }

  private styleKeywords: { [key: string]: string } = {
    'elegante': 'elegant',
    'luxury': 'luxury',
    'minimalista': 'minimal',
    'minimal': 'minimal',
    'brutal': 'brutalist',
    'brutalista': 'brutalist',
    'retro': 'retro',
    'oscuro': 'dark',
    'colorful': 'colorful',
    'colorido': 'colorful',
    'futurista': 'futuristic',
    'editorial': 'editorial',
    'organico': 'organic',
    'orgánico': 'organic'
  };

  currentTheme = 'dark';
  isInfoModalOpen = false;
  activeDesign: string | null = null;
  isDesigning: boolean = false;
  generatedSiteData: any = null;
  generatedSlug: string = '';

  private previousMessageCount = 0;
  private wasTyping = false;

  constructor(
    public chatService: ChatStateService,
    private router: Router,
    private location: Location,
    private analyticsService: AnalyticsService,
    public authService: AuthService,
    private siteService: SiteService
  ) {
    effect(() => {
      const site = this.chatService.lastGeneratedSite();
      if (site) {
        this.generatedSiteData = site.siteData;
        this.generatedSlug = site.slug;
      }
    });
  }

  ngOnInit() {
    this.analyticsService.incrementMetric('rotbotOpens');
    this.scrollToBottom();

    if (typeof window !== 'undefined') {
      this.currentTheme = localStorage.getItem('portfolio-theme') || 'dark';
      window.addEventListener('portfolio-theme-change', this.onThemeChange);
    }

    // Cargar historial persistido (si está logueado) y el uso de mensajes del día
    this.chatService.loadHistory().subscribe(() => this.scrollToBottom());
    this.chatService.loadUsage();

    // Si venía con un mensaje pre-cargado (desde el home o el chat flotante), enviarlo solo si está logueado
    if (this.chatService.userInput.trim()) {
      if (this.authService.hasToken()) {
        setTimeout(() => this.sendMessage(), 400);
      } else {
        // Si no está logueado, limpiamos el input para evitar que quede el texto "trabado" o que intente mandarlo
        this.chatService.userInput = '';
      }
    }
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('portfolio-theme-change', this.onThemeChange);
    }
  }

  onThemeChange = (event: any) => {
    this.currentTheme = event.detail.theme;
  };

  toggleTheme() {
    const nextTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.currentTheme = nextTheme;
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('theme-dark', 'theme-light', 'theme-red');
      if (nextTheme !== 'dark') {
        root.classList.add(`theme-${nextTheme}`);
      }
      localStorage.setItem('portfolio-theme', nextTheme);
      window.dispatchEvent(new CustomEvent('portfolio-theme-change', { detail: { theme: nextTheme } }));
    }
  }

  ngAfterViewChecked() {
    const currentMessageCount = this.chatService.messages.length;
    const isTyping = this.chatService.isTyping;
    
    if (currentMessageCount !== this.previousMessageCount || isTyping !== this.wasTyping) {
      this.scrollToBottom();
      this.previousMessageCount = currentMessageCount;
      this.wasTyping = isTyping;
    }
  }

  goBack() {
    this.location.back();
  }

  designCategories = [
    { id: 'gym', label: 'Gym & Fitness', iconClass: 'fa-solid fa-dumbbell', keywords: ['gym', 'gimnasio', 'fitness', 'entrenamiento'], image: 'assets/images/diseños/gym.png' },
    { id: 'tiendaropa', label: 'Tienda de Ropa', iconClass: 'fa-solid fa-shirt', keywords: ['ropa', 'moda', 'vestuario', 'indumentaria', 'boutique', 'tiendaropa'], image: 'assets/images/diseños/tiendaropa.png' },
    { id: 'restaurante', label: 'Restaurante / Comida', iconClass: 'fa-solid fa-utensils', keywords: ['restaurante', 'comida', 'gastronomia', 'bar', 'cafeteria'], image: 'assets/images/diseños/restaurante.png' },
    { id: 'abogado', label: 'Abogado / Legal', iconClass: 'fa-solid fa-scale-balanced', keywords: ['abogado', 'legal', 'juridico', 'leyes', 'firma'], image: 'assets/images/diseños/abogado.png' },
    { id: 'arquitectura', label: 'Arquitectura / Diseño', iconClass: 'fa-solid fa-compass-drafting', keywords: ['arquitectura', 'arquitecto', 'construccion', 'obra', 'diseño interior'], image: 'assets/images/diseños/arquitectura.png' },
    { id: 'medico', label: 'Médico / Salud', iconClass: 'fa-solid fa-stethoscope', keywords: ['medico', 'salud', 'doctor', 'clinica', 'odontologia'], image: 'assets/images/diseños/medico.png' },
    { id: 'mascotas', label: 'Mascotas / Pet Care', iconClass: 'fa-solid fa-paw', keywords: ['mascotas', 'pet', 'perros', 'gatos', 'veterinaria'], image: 'assets/images/diseños/mascotas.png' },
    { id: 'catalogodigital', label: 'Catálogo Digital', iconClass: 'fa-solid fa-book-open', keywords: ['catalogo', 'catalogo digital', 'menu digital'], image: 'assets/images/diseños/catalogodigital.png' },
    { id: 'ecommerce', label: 'E-Commerce / Tienda', iconClass: 'fa-solid fa-store', keywords: ['e-commerce', 'ecommerce', 'tienda virtual', 'vender online'], image: 'assets/images/diseños/e-commerce.png' },
    { id: 'agendamiento', label: 'Agendamiento de Citas', iconClass: 'fa-solid fa-calendar-check', keywords: ['agendamiento', 'citas', 'reserva', 'turnos'], image: 'assets/images/diseños/agendamiento-citas.png' },
    { id: 'influencer', label: 'Influencer / Personal', iconClass: 'fa-solid fa-star', keywords: ['influencer', 'marca personal', 'creador', 'streamer'], image: 'assets/images/diseños/influencer.png' },
    { id: 'colchones', label: 'Colchones / Hogar', iconClass: 'fa-solid fa-couch', keywords: ['colchones', 'hogar', 'muebles', 'cama'], image: 'assets/images/diseños/colchones.png' },
    { id: 'emprendimiento', label: 'Emprendimiento', iconClass: 'fa-solid fa-rocket', keywords: ['emprendimiento', 'startup', 'negocio'], image: 'assets/images/diseños/emprendimiento.png' },
    { id: 'otro', label: 'Sistema a Medida (Otro)', iconClass: 'fa-solid fa-wand-magic-sparkles', keywords: ['otro', 'personalizado', 'medida', 'sistema'], image: 'assets/images/diseños/personaliza.png' }
  ];

  designFormState = {
    categoryName: '',
    businessName: '',
    style: 'Minimalista y Elegante',
    description: ''
  };

  sendShortcutMessage(msg: string) {
    if (!this.authService.hasToken()) {
      this.router.navigate(['/login']);
      return;
    }
    if (this.chatService.messages.length === 1 && !this.chatService.chatMode()) {
      this.chatService.chatMode.set('design');
    }
    this.chatService.userInput = msg;
    this.sendMessage();
  }

  selectMode(mode: 'design' | 'consulting') {
    if (!this.authService.hasToken()) {
      this.router.navigate(['/login']);
      return;
    }
    this.chatService.chatMode.set(mode);
    if (mode === 'design') {
      this.startDesignFlow();
    } else {
      this.chatService.userInput = 'Necesito asesoramiento estratégico para mi proyecto.';
      this.sendMessage();
    }
  }

  startDesignFlow() {
    this.chatService.messages.push({
      role: 'user',
      content: 'Quiero un Diseño'
    });

    setTimeout(() => {
      this.chatService.messages.push({
        role: 'assistant',
        content: '¡Excelente! Me encantará ayudarte a proyectar tu diseño web a medida. **¿De qué es tu negocio o proyecto?** Puedes seleccionar una opción abajo o escribírmelo directamente:',
        showCategorySelector: true
      });
      this.scrollToBottom();
    }, 350);
  }

  startConsultingFlow() {
    this.chatService.chatMode.set('consulting');
    this.chatService.sendMessage('Quiero Asesoría');
    setTimeout(() => this.scrollToBottom(), 80);
  }

  selectCategory(cat: { id: string; label: string; image: string }) {
    this.designFormState.categoryName = cat.label;

    this.chatService.messages.push({
      role: 'user',
      content: `Mi negocio es de: ${cat.label}`
    });

    setTimeout(() => {
      this.chatService.messages.push({
        role: 'assistant',
        content: `¡Genial! He preparado una sugerencia de prototipo para **${cat.label}**.\n\nA continuación puedes revisar la propuesta visual. Por favor, especifica los requerimientos de tu proyecto a medida:`,
        designImage: cat.image,
        showDesignForm: true
      });
      this.scrollToBottom();
    }, 450);
  }

  submitDesignForm(msg: any) {
    if (!this.designFormState.description.trim()) return;

    msg.formSubmitted = true;
    msg.formData = { ...this.designFormState };

    const summaryText = `*Solicitud de Proyecto a Medida*\n` +
      `📌 *Categoría:* ${this.designFormState.categoryName || 'General'}\n` +
      `🏢 *Negocio:* ${this.designFormState.businessName || 'No especificado'}\n` +
      `🎨 *Estilo:* ${this.designFormState.style}\n` +
      `📝 *Descripción del sistema:* ${this.designFormState.description}`;

    const whatsappUrl = `https://wa.me/573054078225?text=${encodeURIComponent(summaryText)}`;

    setTimeout(() => {
      this.chatService.messages.push({
        role: 'assistant',
        content: `¡Perfecto! He recibido la especificación de tu proyecto **${this.designFormState.businessName || 'a medida'}**.\n\n` +
          `📋 **Resumen registrado:**\n` +
          `- **Categoría:** ${this.designFormState.categoryName || 'General'}\n` +
          `- **Estilo:** ${this.designFormState.style}\n` +
          `- **Requerimiento:** ${this.designFormState.description}\n\n` +
          `[👉 Enviar mensaje por WhatsApp a Santiago](${whatsappUrl})`
      });
      this.scrollToBottom();
    }, 400);
  }

  onInputKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      if (event.shiftKey) {
        setTimeout(() => {
          if (this.chatInputRef?.nativeElement) {
            this.autoResizeInput({ target: this.chatInputRef.nativeElement });
          }
        }, 10);
        return;
      } else {
        event.preventDefault();
        this.sendMessage();
      }
    }
  }

  autoResizeInput(event: any) {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 144) + 'px';
  }

  sendMessage() {
    if (!this.chatService.userInput.trim()) return;
    if (this.chatService.isTyping) return;

    const userText = this.chatService.userInput.trim();
    const lowerText = userText.toLowerCase();

    // Check if user requests consulting / asesoría
    if (lowerText.includes('asesor') || lowerText.includes('consult') || lowerText.includes('automatiz')) {
      this.chatService.chatMode.set('consulting');
    }

    // Check if user triggers design flow
    if (lowerText.includes('quiero un diseño') || lowerText.includes('quiero diseño') || lowerText === 'diseño') {
      this.chatService.userInput = '';
      this.startDesignFlow();
      return;
    }

    // Check if user is responding to category selector
    const lastMsg = this.chatService.messages[this.chatService.messages.length - 1];
    if (lastMsg && lastMsg.role === 'assistant' && lastMsg.showCategorySelector) {
      this.chatService.userInput = '';
      
      const matchedCat = this.designCategories.find(c => 
        c.keywords.some(kw => lowerText.includes(kw)) || lowerText.includes(c.id)
      );

      const targetCat = matchedCat || this.designCategories.find(c => c.id === 'otro')!;
      this.selectCategory(targetCat);
      return;
    }

    this.analyticsService.incrementMetric('rotbotMessagesSent');
    this.chatService.userInput = '';

    if (this.chatInputRef?.nativeElement) {
      this.chatInputRef.nativeElement.style.height = 'auto';
    }

    this.chatService.sendMessage(userText);
    setTimeout(() => this.scrollToBottom(), 80);
  }

  hasGeneratedSite(content: string): boolean {
    return !!content && content.includes('===LANDING_JSON_START===');
  }

  customizeSiteFromMessage(content: string) {
    try {
      const match = content.match(/===LANDING_JSON_START===([\s\S]*?)===LANDING_JSON_END===/);
      if (match && match[1]) {
        const siteData = JSON.parse(match[1].trim());
        localStorage.setItem('portalink_generated_site', JSON.stringify(siteData));
        if (this.authService.hasToken()) {
          this.siteService.saveMySite(siteData).subscribe();
        }
        this.router.navigate(['/personalizar'], { state: { siteData } });
        return;
      }
    } catch (e) {
      console.error('Error procesando JSON de landing page:', e);
    }
    this.customizeGeneratedSite();
  }

  customizeGeneratedSite() {
    if (this.generatedSiteData) {
      try {
        localStorage.setItem('portalink_generated_site', JSON.stringify(this.generatedSiteData));
        if (this.authService.hasToken()) {
          this.siteService.saveMySite(this.generatedSiteData).subscribe();
        }
      } catch (e) {}
    }
    this.router.navigate(['/personalizar'], { state: { siteData: this.generatedSiteData } });
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }
}
