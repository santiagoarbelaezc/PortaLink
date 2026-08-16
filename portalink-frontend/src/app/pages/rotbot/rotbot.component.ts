import { Component, ElementRef, ViewChild, OnInit, AfterViewChecked, OnDestroy, HostListener, effect, signal } from '@angular/core';
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
    <div class="fixed inset-0 w-full h-full flex flex-col overflow-hidden font-sans bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white page-container">
      
      <!-- CLEAN APPLE-STYLE HEADER -->
      <header class="chat-header bg-white/95 backdrop-blur-xl border-b border-neutral-100 px-6 py-2.5 flex items-center justify-between z-30 flex-shrink-0">
        
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-neutral-100 border border-neutral-200/80 flex items-center justify-center p-1 shadow-2xs">
            <img src="assets/icons/logo-link-light.png" class="w-full h-full object-contain" alt="Rotbot">
          </div>
          <div>
            <h1 class="text-base sm:text-lg font-bold tracking-tight leading-none text-neutral-900">
              RotBot IA
            </h1>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-[10px] font-medium inline-flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Copilot Activo</span>
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2.5">
          <!-- Nuevo Chat -->
          <button (click)="resetChatWithEffect()" 
                  class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-900 font-semibold text-xs tracking-wide transition-all shadow-2xs border-none cursor-pointer" 
                  title="Nuevo Chat">
            <svg class="w-3.5 h-3.5 transition-transform" [class.animate-spin]="isResetting" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l-3.08 2.82"/>
            </svg>
            <span>Nuevo Chat</span>
          </button>

          <!-- Galería de Diseños -->
          <a routerLink="/prototipos" 
             class="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-900 font-semibold text-xs tracking-wide transition-all shadow-2xs no-underline border-none cursor-pointer">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
            </svg>
            <span>Galería de Diseños</span>
          </a>

          <!-- Volver al Inicio -->
          <a routerLink="/" 
             class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-900 font-semibold text-xs tracking-wide transition-all shadow-2xs no-underline border-none cursor-pointer">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
            </svg>
            <span class="hidden sm:inline">Inicio</span>
          </a>

          <!-- Close / Back Button -->
          <button (click)="goBack()" 
                  class="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-700 flex items-center justify-center transition-all border-none cursor-pointer" 
                  title="Cerrar y Volver">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

      </header>
 
      <!-- Main Chat Body Split (3 Columns) -->
      <div class="flex flex-row flex-grow w-full overflow-hidden">
        
        <!-- SIDEBAR IZQUIERDO: ACCESOS RÁPIDOS -->
        <aside *ngIf="!activeDesign" 
               class="chat-sidebar hidden md:flex flex-col w-72 flex-shrink-0 border-r border-neutral-100 bg-neutral-50/60 p-5 space-y-4 overflow-y-auto custom-scrollbar">
          
          <div>
            <h4 class="text-xs font-headline font-bold text-neutral-400 tracking-wider uppercase mb-3">
              Diseños Frecuentes
            </h4>
            <div class="space-y-2">
              <button *ngFor="let item of frequentDesigns"
                      (click)="selectCategoryByItem(item)" 
                      class="w-full text-left p-3 rounded-2xl bg-white border border-neutral-200/80 hover:border-neutral-900 text-xs font-headline font-medium text-neutral-800 shadow-2xs hover:shadow-xs transition-all flex items-center gap-2.5 cursor-pointer hover:bg-neutral-50">
                <i [class]="item.iconClass + ' text-cyan-600 dark:text-cyan-400 text-xs shrink-0'"></i>
                <span class="truncate">{{ item.label }}</span>
              </button>
            </div>
          </div>

        </aside>
 
        <!-- CENTRO: CHAT PRINCIPAL -->
        <main class="flex-grow flex flex-col h-full overflow-hidden bg-white relative">
          
          <!-- Overlay de Reseteo (cubre todo el chat mientras limpia) -->
          <div *ngIf="showOverlay" 
               class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white"
               [style]="'opacity: ' + overlayOpacity + '; transition: opacity 600ms ease-in-out;'">
            <div class="flex flex-col items-center gap-4">
              <div class="w-14 h-14 rounded-2xl bg-neutral-100 border border-neutral-200/80 flex items-center justify-center p-2.5">
                <img src="assets/icons/logo-link-light.png" class="w-full h-full object-contain" alt="Rotbot">
              </div>
              <div class="flex flex-col items-center gap-1.5">
                <span class="text-sm font-semibold text-neutral-700" style="letter-spacing: 0.02em;">Nueva conversación</span>
                <div class="flex gap-1.5 mt-1">
                  <span class="w-2 h-2 rounded-full bg-neutral-300 animate-bounce" style="animation-delay: 0ms"></span>
                  <span class="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style="animation-delay: 150ms"></span>
                  <span class="w-2 h-2 rounded-full bg-neutral-500 animate-bounce" style="animation-delay: 300ms"></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Message Scroll Area -->
          <div #scrollContainer 
               class="flex-grow overflow-y-auto p-4 sm:p-6 custom-scrollbar scroll-smooth">
            
            <ng-container *ngIf="chatService.isLoadingHistory(); else chatContent">
              <!-- Skeleton Loader -->
              <div class="flex flex-col gap-6 px-6 md:px-16 animate-pulse w-full max-w-5xl mx-auto">
                 <!-- Skeleton Assistant -->
                 <div class="flex w-full justify-start items-end">
                    <div class="w-9 h-9 rounded-full bg-neutral-100 mr-2.5 flex-shrink-0"></div>
                    <div class="bg-neutral-100 h-20 w-3/4 max-w-sm rounded-2xl rounded-bl-xs"></div>
                 </div>
                 <!-- Skeleton User -->
                 <div class="flex w-full justify-end items-end">
                    <div class="bg-neutral-900 h-14 w-2/3 max-w-xs rounded-2xl rounded-tr-xs"></div>
                 </div>
              </div>
            </ng-container>

            <ng-template #chatContent>
              <div class="flex flex-col min-h-full justify-center py-2" [ngClass]="{'my-auto justify-center': chatService.messages.length <= 1}">
                <!-- Welcome Intro Section -->
                <div *ngIf="chatService.messages.length <= 1" class="flex flex-col items-center justify-center text-center p-6 my-2 max-w-lg mx-auto rounded-[28px] bg-white border border-neutral-200/80 shadow-2xs space-y-3">
                  <div class="w-36 h-36 sm:w-44 sm:h-44 relative flex items-center justify-center overflow-visible">
                    <img src="assets/images/rotbot4.png" class="w-full h-full object-contain" alt="Rotbot Full">
                  </div>
                  <div class="space-y-1">
                    <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                      Sistemas con RotBot IA
                    </h2>
                    <p class="text-xs sm:text-sm font-sans text-neutral-500 max-w-sm mx-auto leading-relaxed m-0">
                      ¡Hola! Soy RotBot, tu copiloto tecnológico listo para guiarte en el desarrollo de tus proyectos web e Inteligencia Artificial.
                    </p>
                  </div>
                </div>
     
                <!-- Messages List (Always Available for Guests & Authenticated Users) -->
                <ng-container>
                  <div *ngFor="let msg of chatService.messages" class="flex w-full px-6 md:px-16 animate-fade-in my-1.5" [ngClass]="{'justify-end': msg.role === 'user', 'justify-start': msg.role === 'assistant'}">
                    
                    <!-- Assistant Avatar -->
                    <div *ngIf="msg.role === 'assistant'" class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mr-2.5 p-1 border avatar-bg">
                      <img src="assets/icons/logo-link-light.png" class="w-full h-full object-contain" alt="Rotbot">
                    </div>
       
                    <!-- Message Bubble -->
                    <div 
                      [ngClass]="{
                        'assistant-bubble py-3 px-4 sm:px-5 rounded-[22px] text-xs sm:text-sm leading-relaxed max-w-[85%] border shadow-2xs': msg.role === 'assistant',
                        'user-bubble px-4 py-3 rounded-[22px] rounded-tr-xs text-xs sm:text-sm leading-relaxed max-w-[85%] border shadow-sm': msg.role === 'user'
                      }"
                    >
                      <div [innerHTML]="msg.content | markdown"></div>

                      <!-- Design Preview Card inside Assistant Message Bubble -->
                      <div *ngIf="msg.role === 'assistant' && msg.designImage" 
                           class="mt-3.5 pt-3.5 border-t space-y-3"
                           [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200/80'">
                        
                        <!-- Header Badge -->
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                            <span class="text-[11px] font-headline font-bold uppercase tracking-wider"
                                  [ngClass]="isDark ? 'text-cyan-400' : 'text-cyan-800'">
                              Diseño Sugerido
                            </span>
                          </div>
                          <span class="text-[10px] font-headline font-bold uppercase tracking-widest text-neutral-400">
                            RotBot Engine
                          </span>
                        </div>

                        <!-- Preview Image Card with Floating Action Buttons -->
                        <div (click)="openDesignDetailModal(msg)" 
                             class="relative rounded-2xl overflow-hidden border group shadow-md max-h-[300px] flex items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-xl"
                             [ngClass]="isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-200/90 bg-neutral-100'">
                          <img [src]="msg.designImage" alt="Vista previa de diseño" class="w-full h-auto object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105" />
                          
                          <!-- Overlay Action Buttons -->
                          <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end justify-between p-3.5 z-10">
                            <button (click)="openDesignDetailModal(msg); $event.stopPropagation()"
                                    class="px-4 py-2 rounded-full text-xs font-headline font-bold text-white backdrop-blur-md border border-white/20 transition-all flex items-center gap-2 shadow-md cursor-pointer border-none hover:scale-[1.02] active:scale-[0.98]"
                                    style="background-color: rgba(9,9,11,0.85) !important; color: #ffffff !important;">
                              <svg class="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="color: #38bdf8 !important;">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12c.077-.133.152-.27.228-.404a11.58 11.58 0 0119.736 0c.076.134.151.27.228.404a11.58 11.58 0 01-19.736 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span style="color: #ffffff !important;">Ver y Especificar Diseño</span>
                            </button>

                            <a routerLink="/prototipos" (click)="$event.stopPropagation()" class="px-3.5 py-2 rounded-full text-xs font-headline font-bold text-white bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5 no-underline">
                              <span style="color: #ffffff !important;">Galería</span>
                              <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color: #ffffff !important;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                            </a>
                          </div>
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
            </ng-container>
 
            <!-- Typing Indicator -->
            <div *ngIf="chatService.isTyping" class="flex items-center gap-3 w-full px-6 md:px-16">
              <div class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center p-1 border avatar-bg">
                <img src="assets/icons/logo-link-light.png" class="w-full h-full object-contain" alt="Rotbot">
              </div>
              <div class="assistant-bubble py-2 flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 rounded-full bg-current animate-bounce"></div>
                <div class="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0.2s]"></div>
                <div class="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        </ng-template>
      </div>
 
          <!-- Input Area (Permanently Active for Guests & Authenticated Users) -->
          <div class="chat-input-area p-3 sm:p-5 border-t border-neutral-100 bg-white sticky bottom-0 z-20">
            <form (submit)="sendMessage()" class="relative max-w-4xl mx-auto flex items-center gap-3 bg-neutral-50 border border-neutral-200/80 rounded-2xl p-2 sm:p-2.5 focus-within:border-neutral-900 transition-colors shadow-2xs">
              <textarea 
                #chatInputRef
                [(ngModel)]="chatService.userInput"
                (keydown)="onInputKeydown($event)"
                (input)="autoResizeInput($event)"
                [disabled]="chatService.isBlocked()"
                name="userInput"
                rows="1"
                [placeholder]="chatService.isBlocked() ? 'Chat suspendido por términos inapropiados (' + chatService.blockRemainingSeconds() + 's)...' : 'Escribe tu mensaje para RotBot IA...'"
                class="w-full bg-transparent border-none px-3 py-1.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-0 resize-none max-h-32 leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
              ></textarea>

              <button 
                type="submit"
                [disabled]="!chatService.userInput.trim() || chatService.isBlocked()"
                class="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex-shrink-0 border-none shadow-sm"
                style="background-color: #09090b !important; color: #ffffff !important;"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="color: #ffffff !important;">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>

            <!-- Block Warning Badge -->
            <div *ngIf="chatService.isBlocked()" class="max-w-4xl mx-auto mt-2.5 px-4 py-2 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-xs font-headline font-semibold flex items-center justify-between shadow-2xs animate-pulse">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span>Chat suspendido temporalmente por contenido explícito o vulgares</span>
              </div>
              <span class="font-mono font-bold bg-red-100 px-2.5 py-0.5 rounded text-red-800">{{ chatService.blockRemainingSeconds() }}s</span>
            </div>

            <div class="flex justify-center mt-2.5">
               <span class="text-[11px] font-sans font-medium text-neutral-400">Powered by Portalink IA</span>
            </div>
          </div>
        </main>
 
        <!-- SIDEBAR DERECHO (INFO ROTBOT) -->
        <aside class="chat-sidebar hidden lg:flex flex-col w-80 flex-shrink-0 border-l border-neutral-100 bg-neutral-50/60 p-6 space-y-6 overflow-y-auto custom-scrollbar">
          <div>
            <h4 class="text-xs font-semibold text-neutral-400 tracking-wider uppercase mb-3">
              ¿Quién es RotBot?
            </h4>
            
            <div class="p-5 rounded-[24px] bg-white border border-neutral-200/80 shadow-2xs space-y-3">
              <div class="w-16 h-16 rounded-2xl bg-neutral-100 border border-neutral-200/80 p-2 flex items-center justify-center mx-auto">
                <img src="assets/icons/logo-link-dark.png" class="w-full h-full object-contain" alt="Rotbot Logo">
              </div>
              <div class="text-center space-y-2">
                <h5 class="text-sm font-semibold tracking-tight text-neutral-900">
                  Copiloto Tecnológico
                </h5>
                <p class="text-xs font-sans text-neutral-500 leading-relaxed m-0">
                  RotBot es una Inteligencia Artificial diseñada para asesorar y guiar en el desarrollo de soluciones digitales avanzadas, desarrollo a medida y automatizaciones de procesos comerciales.
                </p>
                <button (click)="isInfoModalOpen = true" 
                        class="w-full py-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-semibold text-xs transition-all border-none cursor-pointer mt-2">
                  <span>Info de la IA</span>
                </button>
              </div>
            </div>
          </div>
 
          <div>
            <h4 class="text-xs font-semibold text-neutral-400 tracking-wider uppercase mb-3">
              ¿Tienes un Proyecto?
            </h4>
 
            <button (click)="sendShortcutMessage('Quiero una implementación de IA en mi negocio')" 
                    class="w-full text-left p-5 rounded-[24px] bg-white border border-neutral-200/80 hover:border-neutral-900 shadow-2xs hover:shadow-xs transition-all space-y-2 cursor-pointer border-none">
              <span class="text-[10.5px] font-medium uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-block">
                Oportunidad
              </span>
              <h5 class="text-sm font-semibold tracking-tight m-0 text-neutral-900">
                Quiero IA para mi negocio
              </h5>
              <p class="text-xs font-sans text-neutral-500 leading-relaxed m-0">
                Empieza hoy la transformación digital y automatiza tu negocio con Inteligencia Artificial.
              </p>
            </button>
          </div>
        </aside>
      </div>

      <!-- MODAL DE DESCRIPCIÓN Y ESPECIFICACIÓN DEL PROYECTO (Ultra-Clean Apple Glass) -->
      <div *ngIf="selectedModalDesign()" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xl animate-fade-in" (click)="closeDesignDetailModal()">
        <div class="relative w-full max-w-4xl max-h-[90vh] border rounded-[32px] overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-6 shadow-2xl transition-all duration-300"
             [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200/90 text-neutral-900'"
             (click)="$event.stopPropagation()">
          
          <!-- Modal Header -->
          <div class="flex items-center justify-between border-b pb-4"
               [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-100'">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border"
                   [ngClass]="isDark ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-cyan-50 border-cyan-200/80 text-cyan-700'">
                <i class="fa-solid fa-layer-group text-lg"></i>
              </div>
              <div>
                <h3 class="text-lg sm:text-xl font-headline font-bold tracking-tight m-0"
                    [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                  Descripción y Especificaciones del Proyecto
                </h3>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-xs" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Prototipo sugerido:</span>
                  <span class="text-xs font-headline font-bold px-2.5 py-0.5 rounded-full border"
                        [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-cyan-400' : 'bg-neutral-100 border-neutral-200 text-neutral-900'">
                    {{ selectedModalDesign()?.categoryName }}
                  </span>
                </div>
              </div>
            </div>
            <button (click)="closeDesignDetailModal()"
                    class="w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer border-none"
                    [ngClass]="isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'">
              <i class="fa-solid fa-xmark text-base"></i>
            </button>
          </div>

          <!-- Visor de Imagen Ampliada -->
          <div class="space-y-3">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="text-xs font-headline font-bold uppercase tracking-wider flex items-center gap-2"
                   [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-800'">
                <i class="fa-solid fa-image text-cyan-500"></i>
                <span>Previsualización Ampliada del Prototipo</span>
              </div>

              <!-- Enlace a Prototipo en Vivo si existe -->
              <a *ngIf="selectedModalDesign()?.liveUrl" 
                 [href]="selectedModalDesign()?.liveUrl" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 class="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-headline font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer no-underline">
                <i class="fa-solid fa-globe text-sm"></i>
                <span>Ver Sitio en Vivo</span>
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
              </a>
            </div>

            <div class="relative w-full max-h-[480px] rounded-[24px] overflow-hidden border shadow-lg flex items-center justify-center"
                 [ngClass]="isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-200/90 bg-neutral-100'">
              <img 
                [src]="selectedModalDesign()?.designImage" 
                alt="Vista previa ampliada de diseño" 
                class="w-full h-auto max-h-[480px] object-contain object-top"
              />
            </div>
          </div>

          <!-- Especificaciones por Defecto del Proyecto -->
          <div class="space-y-3 pt-2">
            <div class="text-xs font-headline font-bold uppercase tracking-wider flex items-center gap-2"
                 [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-800'">
              <i class="fa-solid fa-circle-check text-cyan-500"></i>
              <span>Especificaciones y Características por Defecto:</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div class="p-4 rounded-2xl border flex items-start gap-3.5 transition-all duration-200"
                   [ngClass]="isDark ? 'bg-neutral-950/60 border-neutral-800/80' : 'bg-neutral-50/80 border-neutral-200/80'">
                <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm"
                     [ngClass]="isDark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-cyan-50 text-cyan-600'">
                  <i class="fa-solid fa-mobile-screen"></i>
                </div>
                <div>
                  <h4 class="text-xs font-headline font-bold m-0" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Diseño 100% Adaptativo</h4>
                  <p class="text-[11px] leading-relaxed m-0 mt-0.5" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-600'">Optimizado para celulares, tablets y computadoras de escritorio.</p>
                </div>
              </div>

              <div class="p-4 rounded-2xl border flex items-start gap-3.5 transition-all duration-200"
                   [ngClass]="isDark ? 'bg-neutral-950/60 border-neutral-800/80' : 'bg-neutral-50/80 border-neutral-200/80'">
                <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm"
                     [ngClass]="isDark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-cyan-50 text-cyan-600'">
                  <i class="fa-solid fa-bullseye"></i>
                </div>
                <div>
                  <h4 class="text-xs font-headline font-bold m-0" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Estructura para Conversiones</h4>
                  <p class="text-[11px] leading-relaxed m-0 mt-0.5" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-600'">Secciones estratégicas con botones de llamada a la acción (CTA).</p>
                </div>
              </div>

              <div class="p-4 rounded-2xl border flex items-start gap-3.5 transition-all duration-200"
                   [ngClass]="isDark ? 'bg-neutral-950/60 border-neutral-800/80' : 'bg-neutral-50/80 border-neutral-200/80'">
                <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm"
                     [ngClass]="isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'">
                  <i class="fa-brands fa-whatsapp"></i>
                </div>
                <div>
                  <h4 class="text-xs font-headline font-bold m-0" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Conexión Directa a WhatsApp</h4>
                  <p class="text-[11px] leading-relaxed m-0 mt-0.5" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-600'">Botones y formularios con redirección instantánea a tu chat.</p>
                </div>
              </div>

              <div class="p-4 rounded-2xl border flex items-start gap-3.5 transition-all duration-200"
                   [ngClass]="isDark ? 'bg-neutral-950/60 border-neutral-800/80' : 'bg-neutral-50/80 border-neutral-200/80'">
                <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm"
                     [ngClass]="isDark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-cyan-50 text-cyan-600'">
                  <i class="fa-solid fa-gauge-high"></i>
                </div>
                <div>
                  <h4 class="text-xs font-headline font-bold m-0" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Carga Ultrarrápida & SEO</h4>
                  <p class="text-[11px] leading-relaxed m-0 mt-0.5" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-600'">Código optimizado para posicionar en Google y cargar en milisegundos.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Contenedor del Formulario Inferior (Único Input) -->
          <div class="pt-4 border-t space-y-4" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-100'">
            <div class="text-sm font-headline font-bold uppercase tracking-wider flex items-center gap-2.5"
                 [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              <div class="w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 border"
                   [ngClass]="isDark ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-cyan-50 border-cyan-200/80 text-cyan-700'">
                <i class="fa-solid fa-sliders"></i>
              </div>
              <span>Especifica el nombre de tu negocio</span>
            </div>

            <div *ngIf="!selectedModalDesign()?.msg?.formSubmitted" 
                 class="space-y-4 p-5 sm:p-6 rounded-[24px] border"
                 [ngClass]="isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-neutral-50/60 border-neutral-200/80'">
              <div>
                <label class="block text-[11px] font-headline font-bold uppercase tracking-wider mb-1.5"
                       [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">
                  Nombre de tu Negocio / Proyecto
                </label>
                <input type="text" 
                       [(ngModel)]="designFormState.businessName" 
                       (keyup.enter)="submitDesignFormFromModal()"
                       placeholder="Ingresa el nombre de tu negocio..." 
                       class="w-full px-4 py-3.5 rounded-2xl text-xs sm:text-sm font-sans focus:outline-none transition-all duration-200"
                       [ngClass]="isDark
                         ? 'bg-neutral-950 border border-neutral-800 text-white placeholder:text-neutral-500 focus:border-cyan-400'
                         : 'bg-white border border-neutral-200/90 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 shadow-2xs'" />
              </div>

              <button (click)="submitDesignFormFromModal()" 
                      [disabled]="!designFormState.businessName.trim()" 
                      class="w-full py-3.5 rounded-full font-headline font-semibold uppercase text-xs tracking-wider flex items-center justify-center gap-2.5 transition-all duration-200 shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] border-none"
                      [style.background-color]="isDark ? '#ffffff' : '#09090b'"
                      [style.color]="isDark ? '#09090b' : '#ffffff'">
                <i class="fa-brands fa-whatsapp text-base"></i>
                <span [style.color]="isDark ? '#09090b' : '#ffffff'">Enviar Mensaje por WhatsApp</span>
              </button>
            </div>

            <div *ngIf="selectedModalDesign()?.msg?.formSubmitted" class="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 space-y-2">
              <div class="flex items-center gap-2 text-xs font-headline font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                <svg class="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                <span>¡Proyecto Registrado y Redirigido a WhatsApp!</span>
              </div>
              <p class="text-xs text-neutral-600 dark:text-neutral-300 m-0">Se enviaron las especificaciones del proyecto **{{ selectedModalDesign()?.msg?.formData?.businessName }}**. Santiago te responderá de inmediato.</p>
            </div>
          </div>

      <!-- MODAL DE INFO DE LA IA (ESPECIFICACIONES TÉCNICAS Y LEGALES) -->
      <div *ngIf="isInfoModalOpen" class="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in" (click)="isInfoModalOpen = false">
        <div class="relative w-full max-w-2xl max-h-[85vh] bg-white border border-neutral-200/90 rounded-3xl overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-5 shadow-2xl text-neutral-900" (click)="$event.stopPropagation()">
          
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-neutral-100 border border-neutral-200/80 p-2 flex items-center justify-center shrink-0">
                <img src="assets/icons/logo-link-light.png" class="w-full h-full object-contain" alt="Rotbot">
              </div>
              <div>
                <h3 class="text-base sm:text-lg font-bold tracking-tight text-neutral-900 m-0 leading-tight">Acerca de Rotbot IA</h3>
                <p class="text-xs text-neutral-400 font-medium m-0">Especificaciones Técnicas y Legales</p>
              </div>
            </div>
            <button (click)="isInfoModalOpen = false" class="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-600 flex items-center justify-center transition-all border-none cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <!-- Content -->
          <div class="space-y-4 text-xs leading-relaxed text-neutral-600">
            <!-- Motor IA -->
            <div class="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Modelo de IA</span>
                <span class="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200/60">Llama 3.3 70B</span>
              </div>
              <h5 class="text-sm font-bold text-neutral-900 m-0">Motor de Inteligencia Artificial</h5>
              <p class="text-xs m-0 text-neutral-500 leading-relaxed">
                Rotbot es impulsado por <strong>Llama 3.3 70B Versatile</strong>, uno de los modelos de lenguaje de código abierto más avanzados del mundo desarrollados por Meta. Este modelo está altamente optimizado para razonamiento lógico complejo, generación de código estructurado y asesoramiento técnico profesional en diversas áreas del desarrollo de software.
              </p>
            </div>

            <!-- Inferencia GROQ -->
            <div class="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Procesamiento LPU</span>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60">Groq Speed</span>
              </div>
              <h5 class="text-sm font-bold text-neutral-900 m-0">Infraestructura de Inferencia (GROQ)</h5>
              <p class="text-xs m-0 text-neutral-500 leading-relaxed">
                Para garantizar tiempos de respuesta en tiempo real y una latencia ultra baja, utilizamos la revolucionaria infraestructura <strong>LPU (Language Processing Unit)</strong> proporcionada por Groq. Esta tecnología de hardware especializada permite que Rotbot infiera y genere respuestas complejas a velocidades sin precedentes en la industria.
              </p>
            </div>

            <!-- Aviso Legal -->
            <div class="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-3">
              <h5 class="text-xs font-bold text-amber-900 m-0 flex items-center gap-2">
                <svg class="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                Aviso Legal y Privacidad
              </h5>

              <div class="space-y-2.5 text-xs text-amber-950/85 leading-relaxed">
                <p class="m-0">
                  <strong>1. Naturaleza de la Asesoría:</strong> Rotbot es un asistente de IA conversacional diseñado para proporcionar orientación general sobre desarrollo web, e-commerce, integración de sistemas y diseño UI/UX. Las respuestas generadas son sugerencias algorítmicas y no constituyen consultoría técnica definitiva. Siempre valida las decisiones críticas de arquitectura con un ingeniero humano.
                </p>

                <p class="m-0">
                  <strong>2. Manejo de Datos y Privacidad:</strong> Las interacciones con Rotbot son procesadas a través de APIs externas para generar respuestas en tiempo real. Aunque se guarda un registro de contexto en nuestra base de datos para mantener la coherencia de la conversación (solo si estás logueado), no compartas contraseñas, tokens JWT, claves API de producción, ni información confidencial personal o empresarial en este chat.
                </p>

                <p class="m-0">
                  <strong>3. Limitación de Responsabilidad y Alucinaciones:</strong> Como cualquier modelo de lenguaje grande (LLM), la IA puede experimentar "alucinaciones" y generar información inexacta o falsa con tono de seguridad. PortaLink no se hace responsable de posibles imprecisiones, errores de código, vulnerabilidades o pérdidas financieras derivadas de decisiones tomadas basadas exclusivamente en la información proporcionada por Rotbot.
                </p>
              </div>
            </div>

            <div class="pt-2">
              <button (click)="isInfoModalOpen = false" class="w-full py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs transition-all border-none cursor-pointer text-center shadow-md">
                Entendido
              </button>
            </div>
          </div>

        </div>
      </div>
      </div>
  `,
  styles: [`
    .page-container {
      background: #ffffff !important;
      color: #09090b !important;
      z-index: 9999;
    }
    .chat-header {
      border-color: #f4f4f5 !important;
      background: #ffffff !important;
    }
    .icon-btn {
      color: #71717a !important;
    }
    .icon-btn:hover {
      color: #09090b !important;
      background: #f4f4f5 !important;
    }
    .welcome-border {
      border-color: #f4f4f5 !important;
    }
    .avatar-bg {
      background: #f4f4f5 !important;
      border-color: #e4e4e7 !important;
    }
    .assistant-bubble {
      background: #f4f4f5 !important;
      border: 1px solid #e4e4e7 !important;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02) !important;
      color: #09090b !important;
      border-radius: 20px 20px 20px 4px !important;
      padding: 12px 18px !important;
    }
    .assistant-bubble > span,
    .assistant-bubble > p {
      color: #09090b;
    }
    .design-card-container label {
      color: #d4d4d8 !important;
    }
    .design-card-container input,
    .design-card-container select,
    .design-card-container textarea {
      color: #ffffff !important;
      background-color: #09090b !important;
    }
    .user-bubble {
      background: #09090b !important;
      border: 1px solid #09090b !important;
      color: #ffffff !important;
      font-weight: 500 !important;
      border-radius: 20px 20px 4px 20px !important;
      padding: 12px 18px !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
    }
    .user-bubble * {
      color: #ffffff !important;
    }
    .chat-input-area {
      border-color: #f4f4f5 !important;
      background: #ffffff !important;
    }
    .chat-input {
      background: #f4f4f5 !important;
      border-color: #e4e4e7 !important;
      color: #09090b !important;
    }
    .chat-input:focus {
      border-color: #09090b !important;
      background: #ffffff !important;
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.05) !important;
    }
    .chat-submit-btn {
      background: #09090b !important;
      color: #ffffff !important;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(0,0,0,0.02);
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(0,0,0,0.15);
      border-radius: 4px;
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
      background: #fafafa !important;
      border-color: #f4f4f5 !important;
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
    .assistant-bubble a,
    .assistant-bubble a * {
      color: #ffffff !important;
    }
  `]
})
export class RotbotComponent implements OnInit, AfterViewChecked, OnDestroy {
  get isDark(): boolean {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark') || document.body.classList.contains('theme-dark');
    }
    return false;
  }

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @ViewChild('chatInputRef') private chatInputRef?: ElementRef<HTMLTextAreaElement>;

  selectedModalDesign = signal<{ designImage: string; categoryName?: string; liveUrl?: string; msg?: any } | null>(null);

  openDesignDetailModal(msg: any) {
    const categoryName = msg.formData?.categoryName || this.designFormState.categoryName || 'Proyecto Sugerido';
    const foundCat = this.designCategories.find(c =>
      c.image === msg.designImage ||
      c.label.toLowerCase() === categoryName.toLowerCase() ||
      categoryName.toLowerCase().includes(c.id) ||
      (c.label && categoryName.toLowerCase().includes(c.label.toLowerCase()))
    );

    this.selectedModalDesign.set({
      designImage: msg.designImage,
      categoryName: categoryName,
      liveUrl: foundCat?.liveUrl,
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

  currentTheme = 'light';
  isInfoModalOpen = false;
  activeDesign: string | null = null;
  isDesigning: boolean = false;
  generatedSiteData: any = null;
  generatedSlug: string = '';
  isResetting = false;
  showResetBadge = false;
  showOverlay = false;
  overlayOpacity = '1';

  resetChatWithEffect() {
    if (this.isResetting) return;
    this.isResetting = true;
    this.showOverlay = true;
    this.overlayOpacity = '1';

    // Limpiar el chat mientras el overlay lo tapa
    setTimeout(() => {
      this.chatService.clearHistory();
      this.scrollToBottom();
    }, 300);

    // Desvanecer el overlay después de 3.5s
    setTimeout(() => {
      this.overlayOpacity = '0';
      setTimeout(() => {
        this.showOverlay = false;
        this.isResetting = false;
      }, 600);
    }, 2900);
  }

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
      this.currentTheme = localStorage.getItem('portfolio-theme') || 'light';
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
      root.classList.add(`theme-${nextTheme}`);
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

  @HostListener('click', ['$event'])
  onChatClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const anchor = target.closest('a') as HTMLAnchorElement;
    if (anchor) {
      const href = anchor.getAttribute('href');
      if (href && href.startsWith('/')) {
        event.preventDefault();
        this.router.navigateByUrl(href);
      }
    }
  }

  designCategories = [
    { id: 'gym', label: 'Gym & Fitness', iconClass: 'fa-solid fa-dumbbell', keywords: ['gym', 'gimnasio', 'fitness', 'entrenamiento'], image: 'assets/images/diseños/gym.png' },
    { id: 'tiendaropa', label: 'Tienda de Ropa', iconClass: 'fa-solid fa-shirt', keywords: ['ropa', 'moda', 'vestuario', 'indumentaria', 'boutique', 'tiendaropa'], image: 'assets/images/diseños/tiendaropa.png', liveUrl: 'https://tiendaintima.com' },
    { id: 'restaurante', label: 'Restaurante / Comida', iconClass: 'fa-solid fa-utensils', keywords: ['restaurante', 'comida', 'gastronomia', 'bar', 'cafeteria'], image: 'assets/images/diseños/restaurante.png' },
    { id: 'abogado', label: 'Abogado / Legal', iconClass: 'fa-solid fa-scale-balanced', keywords: ['abogado', 'legal', 'juridico', 'leyes', 'firma'], image: 'assets/images/diseños/abogado.png' },
    { id: 'arquitectura', label: 'Arquitectura / Diseño', iconClass: 'fa-solid fa-compass-drafting', keywords: ['arquitectura', 'arquitecto', 'construccion', 'obra', 'diseño interior'], image: 'assets/images/diseños/arquitectura.png', liveUrl: 'https://sysmicon.com' },
    { id: 'medico', label: 'Médico / Salud', iconClass: 'fa-solid fa-stethoscope', keywords: ['medico', 'salud', 'doctor', 'clinica', 'odontologia'], image: 'assets/images/diseños/medico.png' },
    { id: 'mascotas', label: 'Mascotas / Pet Care', iconClass: 'fa-solid fa-paw', keywords: ['mascotas', 'pet', 'perros', 'gatos', 'veterinaria'], image: 'assets/images/diseños/mascotas.png', liveUrl: 'https://camascotas.com' },
    { id: 'catalogodigital', label: 'Catálogo Digital', iconClass: 'fa-solid fa-book-open', keywords: ['catalogo', 'catalogo digital', 'menu digital'], image: 'assets/images/diseños/catalogodigital.png', liveUrl: 'https://catalogoplaxtilineas.com' },
    { id: 'ecommerce', label: 'E-Commerce / Tienda', iconClass: 'fa-solid fa-store', keywords: ['e-commerce', 'ecommerce', 'tienda virtual', 'vender online'], image: 'assets/images/diseños/e-commerce.png' },
    { id: 'agendamiento', label: 'Agendamiento de Citas', iconClass: 'fa-solid fa-calendar-check', keywords: ['agendamiento', 'citas', 'reserva', 'turnos'], image: 'assets/images/diseños/agendamiento-citas.png' },
    { id: 'influencer', label: 'Influencer / Personal', iconClass: 'fa-solid fa-star', keywords: ['influencer', 'marca personal', 'creador', 'streamer'], image: 'assets/images/diseños/influencer.png' },
    { id: 'colchones', label: 'Colchones / Hogar', iconClass: 'fa-solid fa-couch', keywords: ['colchones', 'hogar', 'muebles', 'cama'], image: 'assets/images/diseños/colchones.png' },
    { id: 'emprendimiento', label: 'Emprendimiento', iconClass: 'fa-solid fa-rocket', keywords: ['emprendimiento', 'startup', 'negocio'], image: 'assets/images/diseños/emprendimiento.png' },
    { id: 'otro', label: 'Sistema a Medida (Otro)', iconClass: 'fa-solid fa-wand-magic-sparkles', keywords: ['otro', 'personalizado', 'medida', 'sistema'], image: 'assets/images/diseños/personaliza.png' }
  ];

  frequentDesigns = [
    { id: 'tiendaropa', label: 'Tienda de Ropa / Moda', iconClass: 'fa-solid fa-shirt' },
    { id: 'gym', label: 'Gym & Fitness', iconClass: 'fa-solid fa-dumbbell' },
    { id: 'restaurante', label: 'Restaurante / Comida', iconClass: 'fa-solid fa-utensils' },
    { id: 'ecommerce', label: 'E-Commerce / Tienda', iconClass: 'fa-solid fa-store' },
    { id: 'abogado', label: 'Firma Legal & Abogados', iconClass: 'fa-solid fa-scale-balanced' },
    { id: 'arquitectura', label: 'Arquitectura & Diseño CAD', iconClass: 'fa-solid fa-compass-drafting' },
    { id: 'medico', label: 'Centro Médico & Salud', iconClass: 'fa-solid fa-stethoscope' },
    { id: 'mascotas', label: 'Mascotas & Pet Care', iconClass: 'fa-solid fa-paw' },
    { id: 'catalogodigital', label: 'Catálogo Digital Interactivo', iconClass: 'fa-solid fa-book-open' },
    { id: 'agendamiento', label: 'Sistema de Citas & Agenda', iconClass: 'fa-solid fa-calendar-check' },
    { id: 'construccion', label: 'Constructora & Obras Civiles', iconClass: 'fa-solid fa-hard-hat' },
    { id: 'emprendimiento', label: 'Startup & Emprendimiento', iconClass: 'fa-solid fa-rocket' },
    { id: 'influencer', label: 'Marca Personal / Influencer', iconClass: 'fa-solid fa-star' },
    { id: 'colchones', label: 'Colchones & Descanso', iconClass: 'fa-solid fa-couch' },
    { id: 'otro', label: 'Proyecto A Medida', iconClass: 'fa-solid fa-wand-magic-sparkles' }
  ];

  selectCategoryByItem(item: any) {
    if (!this.authService.hasToken()) {
      this.router.navigate(['/login']);
      return;
    }
    const foundCat = this.designCategories.find(c =>
      c.id === item.id ||
      c.label.toLowerCase() === item.label.toLowerCase() ||
      item.label.toLowerCase().includes(c.id) ||
      c.keywords?.some(k => item.label.toLowerCase().includes(k))
    );

    if (foundCat) {
      this.selectCategory(foundCat);
    } else {
      this.selectCategory({
        id: item.id || 'personalizado',
        label: item.label,
        image: 'assets/images/diseños/personaliza.png'
      });
    }
  }

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

  selectCategory(cat: { id: string; label: string; image: string; liveUrl?: string }) {
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
    if (!this.designFormState.businessName.trim()) return;

    msg.formSubmitted = true;
    msg.formData = { ...this.designFormState };

    const businessName = this.designFormState.businessName.trim();
    const categoryName = this.designFormState.categoryName || msg.formData?.categoryName || 'Proyecto Sugerido';

    const summaryText = `Hola Santiago! Me interesa el diseño a medida para mi negocio: *${businessName}* (Prototipo sugerido: ${categoryName}).`;
    const whatsappUrl = `https://wa.me/573054078225?text=${encodeURIComponent(summaryText)}`;

    this.closeDesignDetailModal();

    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank');
    }

    setTimeout(() => {
      this.chatService.messages.push({
        role: 'assistant',
        content: `¡Perfecto! Te he redirigido a WhatsApp para coordinar los detalles del proyecto a medida para **${businessName}**.\n\n` +
          `[👉 Haz clic aquí si no abrió automáticamente tu WhatsApp](${whatsappUrl})`
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
    if ((lowerText.includes('asesor') || lowerText.includes('consult') || lowerText.includes('automatiz')) && !lowerText.includes('diseño') && !lowerText.includes('dame')) {
      this.chatService.chatMode.set('consulting');
    }

    // Check if user triggers design flow / requests a design
    const isDesignRequest =
      lowerText.includes('diseño') ||
      lowerText.includes('diseños') ||
      lowerText.includes('prototipo') ||
      lowerText.includes('plantilla') ||
      lowerText.includes('dame un') ||
      lowerText.includes('dame otro') ||
      lowerText.includes('quiero uno') ||
      lowerText.includes('quiero otro');

    if (isDesignRequest && !lowerText.includes('asesor') && !lowerText.includes('consult')) {
      this.chatService.chatMode.set('design');
      this.chatService.userInput = '';

      // Check if user mentions a specific category (gym, ropa, etc.)
      const matchedCat = this.designCategories.find(c =>
        c.keywords.some(kw => lowerText.includes(kw)) || lowerText.includes(c.id)
      );

      if (matchedCat) {
        this.selectCategory(matchedCat);
      } else {
        this.startDesignFlow();
      }
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
      } catch (e) { }
    }
    this.router.navigate(['/personalizar'], { state: { siteData: this.generatedSiteData } });
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }
}
