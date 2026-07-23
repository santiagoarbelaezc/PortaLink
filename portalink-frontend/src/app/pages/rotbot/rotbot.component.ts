import { Component, ElementRef, ViewChild, OnInit, AfterViewChecked, OnDestroy, effect } from '@angular/core';
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
          <h4 class="sidebar-title text-[11px] font-bold uppercase tracking-widest mb-1" style="color: var(--text-secondary); opacity: 0.6;">Accesos Rápidos</h4>
          
          <button (click)="sendShortcutMessage('Hola, quiero crear una Landing Page profesional para mi negocio')" class="shortcut-btn flex items-center gap-2.5 px-4 py-3 rounded-xl text-left border transition-all duration-300">
            <span class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: var(--accent-color);"></span>
            <span class="text-[13px] sm:text-[14px] font-medium leading-snug" style="color: var(--text-primary);">Landing para mi negocio</span>
          </button>
          
          <button (click)="sendShortcutMessage('Hola, soy fotógrafo y quiero una Landing Page para mostrar mis servicios')" class="shortcut-btn flex items-center gap-2.5 px-4 py-3 rounded-xl text-left border transition-all duration-300">
            <span class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: var(--accent-color);"></span>
            <span class="text-[13px] sm:text-[14px] font-medium leading-snug" style="color: var(--text-primary);">Landing para Fotógrafo</span>
          </button>
          
          <button (click)="sendShortcutMessage('Hola, quiero una Landing Page para consultoría profesional y servicios')" class="shortcut-btn flex items-center gap-2.5 px-4 py-3 rounded-xl text-left border transition-all duration-300">
            <span class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: var(--accent-color);"></span>
            <span class="text-[13px] sm:text-[14px] font-medium leading-snug" style="color: var(--text-primary);">Consultoría y Servicios</span>
          </button>
          
          <button (click)="sendShortcutMessage('Hola, soy desarrollador y quiero un Portafolio Web con mis servicios')" class="shortcut-btn flex items-center gap-2.5 px-4 py-3 rounded-xl text-left border transition-all duration-300">
            <span class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: var(--accent-color);"></span>
            <span class="text-[13px] sm:text-[14px] font-medium leading-snug" style="color: var(--text-primary);">Portafolio de Servicios</span>
          </button>

          <h4 class="sidebar-title text-[11px] font-bold uppercase tracking-widest mt-3 mb-1" style="color: var(--text-secondary); opacity: 0.6;">Estilos y Temas</h4>

          <button (click)="sendShortcutMessage('Quiero que mi Landing Page tenga un estilo oscuro elegante con acentos cian')" class="shortcut-btn flex items-center gap-2.5 px-4 py-3 rounded-xl text-left border transition-all duration-300">
            <span class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: var(--accent-color);"></span>
            <span class="text-[13px] sm:text-[14px] font-medium leading-snug" style="color: var(--text-primary);">Estilo Oscuro Premium</span>
          </button>

          <button (click)="sendShortcutMessage('Quiero que mi Landing Page tenga un estilo claro moderno y minimalista')" class="shortcut-btn flex items-center gap-2.5 px-4 py-3 rounded-xl text-left border transition-all duration-300">
            <span class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: var(--accent-color);"></span>
            <span class="text-[13px] sm:text-[14px] font-medium leading-snug" style="color: var(--text-primary);">Estilo Claro Minimalista</span>
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
                <img src="assets/images/rotbot4.png" class="w-full h-full object-contain relative z-10 filter drop-shadow-[0_10px_25px_rgba(0,245,255,0.25)]" alt="Rotbot Full">
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
                    'assistant-bubble py-2 text-[17px] sm:text-[18px] leading-relaxed max-w-[75%]': msg.role === 'assistant',
                    'user-bubble px-5 py-3.5 rounded-2xl rounded-tr-sm text-[17px] sm:text-[18px] leading-relaxed max-w-[85%] border shadow-sm': msg.role === 'user'
                  }"
                >
                  <span [innerHTML]="msg.content | markdown"></span>

                  <!-- Botones de selección de modo (Solo primer mensaje) -->
                  <div *ngIf="msg.role === 'assistant' && chatService.messages.length === 1 && !chatService.chatMode()" class="mt-4 flex flex-col sm:flex-row gap-3">
                    <button (click)="selectMode('design')" class="px-5 py-2.5 rounded-xl border border-[var(--accent-color)] bg-[var(--accent-color)]/10 hover:bg-[var(--accent-color)]/20 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2">
                      <svg class="w-5 h-5 text-[var(--accent-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                      </svg>
                      Quiero un Diseño
                    </button>
                    <button (click)="selectMode('consulting')" class="px-5 py-2.5 rounded-xl border border-purple-500 bg-purple-500/10 hover:bg-purple-500/20 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2">
                      <svg class="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.516 0c.85.493 1.509 1.333 1.509 2.316V18" />
                      </svg>
                      Necesito Asesoramiento
                    </button>
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

  sendShortcutMessage(msg: string) {
    if (!this.authService.hasToken()) {
      this.router.navigate(['/login']);
      return;
    }
    // If chat is new, set mode implicitly to design for these shortcuts
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
    const firstMsg = mode === 'design' 
      ? 'Quiero crear mi landing page a medida.' 
      : 'Necesito asesoramiento estratégico para mi proyecto.';
    this.chatService.userInput = firstMsg;
    this.sendMessage();
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

    this.analyticsService.incrementMetric('rotbotMessagesSent');
    const userText = this.chatService.userInput.trim();
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
