import { Component, ElementRef, ViewChild, OnInit, AfterViewChecked, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChatStateService } from '../../services/chat-state.service';
import { AnalyticsService } from '../../services/analytics.service';
import { ChatLimitModalComponent } from '../../components/chat-limit-modal/chat-limit-modal.component';
import { AiInfoModalComponent } from '../../components/ai-info-modal/ai-info-modal.component';
import { RestaurantPosComponent } from '../../components/rotbot-designs/restaurant-pos/restaurant-pos.component';
import { MarkdownPipe } from '../../pipes/markdown-pipe';

@Component({
  selector: 'app-rotbot-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ChatLimitModalComponent, AiInfoModalComponent, RestaurantPosComponent, MarkdownPipe],
  template: `
    <app-chat-limit-modal></app-chat-limit-modal>
    <app-ai-info-modal [isOpen]="isInfoModalOpen" (closeEvent)="isInfoModalOpen = false"></app-ai-info-modal>
    <div class="fixed inset-0 w-full h-full flex flex-col overflow-hidden font-sans page-container">
      <!-- Header -->
      <div class="chat-header flex items-center justify-between border-b px-6 py-5 relative overflow-hidden">
        <!-- Cyber Scanner Line -->
        <div class="absolute top-0 left-0 w-full h-[1px] scanner-line"></div>
        
        <div class="flex items-center gap-3 relative z-10">
          <div class="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center p-1.5 border border-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]">
            <img [src]="currentTheme === 'dark' ? 'assets/icons/logo-link-dark.png' : 'assets/icons/logo-link-light.png'" class="w-full h-full object-contain filter drop-shadow-[0_0_5px_rgba(0,245,255,0.3)]" alt="Rotbot">
          </div>
          <div>
            <h3 class="font-sans text-[15px] font-bold tracking-wide leading-none" style="color: var(--text-primary);">
              RotBot IA
            </h3>
            <div class="flex items-center gap-1.5 mt-1.5">
               <span class="w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_5px_var(--accent-color)]" style="background-color: var(--accent-color);"></span>
               <p class="text-[9px] uppercase tracking-widest font-sans font-medium" style="color: var(--text-secondary); opacity: 0.7;">System Active</p>
            </div>
          </div>
        </div>
        
        <!-- Actions Container -->
        <div class="flex items-center gap-4 relative z-10">
          <!-- Nuevo Chat -->
          <button (click)="chatService.clearHistory()" class="text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:opacity-100 opacity-60 transition-all mr-2" style="color: var(--text-primary);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l-3.08 2.82"/>
            </svg>
            <span class="hidden sm:inline">Nuevo Chat</span>
          </button>

          <!-- Volver al Inicio -->
          <a routerLink="/" class="text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:opacity-100 opacity-60 transition-all mr-2" style="color: var(--text-primary);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span class="hidden sm:inline">Volver al Inicio</span>
          </a>

          <!-- Theme Toggle -->
          <button (click)="toggleTheme()" class="p-2 rounded-lg transition-all icon-btn mr-1" title="Cambiar Tema">
            <svg *ngIf="currentTheme === 'dark'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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
            <svg *ngIf="currentTheme !== 'dark'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </button>
 
          <!-- Back / Close Button -->
          <button (click)="goBack()" class="p-2 rounded-lg transition-all icon-btn" title="Cerrar y Volver">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
 
      <!-- Main Chat Body Split (3 Columns) -->
      <div class="flex flex-row flex-grow w-full overflow-hidden">
        
        <!-- Sidebar Izquierdo (Accesos Rápidos) -->
        <div *ngIf="!activeDesign" class="chat-sidebar no-scrollbar hidden md:flex flex-col w-80 flex-shrink-0 border-r py-8 px-6 gap-4 overflow-y-auto animate-fade-in" style="border-color: var(--card-border);">
          <h4 class="sidebar-title mb-2">Accesos Rápidos</h4>
          
          <button (click)="sendShortcutMessage('Quiero E-commerce')" class="shortcut-btn flex items-center gap-3 px-5 py-4 rounded-xl text-left border transition-all duration-300">
            <span class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: var(--accent-color);"></span>
            <span class="text-[14px] font-medium leading-snug" style="color: var(--text-primary);">Quiero un E-commerce</span>
          </button>
          
          <button (click)="sendShortcutMessage('Muéstrame diseños móviles')" class="shortcut-btn flex items-center gap-3 px-5 py-4 rounded-xl text-left border transition-all duration-300">
            <span class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: var(--accent-color);"></span>
            <span class="text-[14px] font-medium leading-snug" style="color: var(--text-primary);">Ver diseños móviles</span>
          </button>
          
          <button (click)="sendShortcutMessage('Necesito un sistema para mi negocio')" class="shortcut-btn flex items-center gap-3 px-5 py-4 rounded-xl text-left border transition-all duration-300">
            <span class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: var(--accent-color);"></span>
            <span class="text-[14px] font-medium leading-snug" style="color: var(--text-primary);">Sistema para mi negocio</span>
          </button>
          
          <button (click)="sendShortcutMessage('Quiero una implementación de IA en mi negocio')" class="shortcut-btn flex items-center gap-3 px-5 py-4 rounded-xl text-left border transition-all duration-300">
            <span class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: var(--accent-color);"></span>
            <span class="text-[14px] font-medium leading-snug" style="color: var(--text-primary);">Implementación de IA</span>
          </button>
 
          <h4 class="sidebar-title mt-4 mb-2">Recomendaciones</h4>
 
          <button (click)="sendShortcutMessage('Diseño de portafolio web premium')" class="shortcut-btn flex items-center gap-3 px-5 py-4 rounded-xl text-left border transition-all duration-300">
            <span class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: var(--accent-color);"></span>
            <span class="text-[14px] font-medium leading-snug" style="color: var(--text-primary);">Portafolio web premium</span>
          </button>
 
          <button (click)="sendShortcutMessage('Optimización SEO y rendimiento')" class="shortcut-btn flex items-center gap-3 px-5 py-4 rounded-xl text-left border transition-all duration-300">
            <span class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: var(--accent-color);"></span>
            <span class="text-[14px] font-medium leading-snug" style="color: var(--text-primary);">Optimización SEO</span>
          </button>
 
          <button (click)="sendShortcutMessage('Diseño UI/UX a medida')" class="shortcut-btn flex items-center gap-3 px-5 py-4 rounded-xl text-left border transition-all duration-300">
            <span class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: var(--accent-color);"></span>
            <span class="text-[14px] font-medium leading-snug" style="color: var(--text-primary);">Diseño UI/UX a medida</span>
          </button>
 
          <button (click)="sendShortcutMessage('Infraestructura Cloud y bases de datos')" class="shortcut-btn flex items-center gap-3 px-5 py-4 rounded-xl text-left border transition-all duration-300">
            <span class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: var(--accent-color);"></span>
            <span class="text-[14px] font-medium leading-snug" style="color: var(--text-primary);">Infraestructura Cloud</span>
          </button>
        </div>
 
        <!-- Messages + Input Container (Centro o Izquierda en modo diseño) -->
        <div class="flex flex-col h-full overflow-hidden transition-all duration-500 relative"
             [ngClass]="activeDesign ? 'w-full lg:w-[65%] flex-shrink-0 border-r border-white/5' : 'flex-grow'">
          <!-- Messages Area -->
          <div #scrollContainer class="flex-grow overflow-y-auto scroll-smooth custom-scrollbar messages-area space-y-6" style="overscroll-behavior: contain;">
            
            <!-- Welcome Intro Section -->
            <div *ngIf="chatService.messages.length <= 1" class="flex flex-col items-center justify-center text-center pb-4 border-b mt-0 mb-2 welcome-border">
              <div class="w-48 h-48 sm:w-60 sm:h-60 mb-2 relative flex items-center justify-center overflow-visible">
                <img src="assets/images/rotbot4.png" class="w-full h-full object-contain relative z-10" alt="Rotbot Full">
              </div>
              <h2 class="text-lg sm:text-xl font-headline uppercase tracking-wider mb-2" style="color: var(--text-primary);">
                Sistemas con Rotbot IA
              </h2>
              <div class="text-[13px] sm:text-[13.5px] font-light leading-relaxed px-4 max-w-[95%]" style="color: var(--text-secondary);">
                <p class="mb-2">
                  ¡Hola! Soy RotBot, tu copiloto tecnológico. Estoy listo para guiarte en el diseño y desarrollo de sistemas a medida, e-commerce e integración de Inteligencia Artificial para potenciar tu negocio.
                </p>
              </div>
            </div>
 
            <!-- Messages List -->
            <div *ngFor="let msg of chatService.messages" class="flex w-full px-6 md:px-16 animate-fade-in" [ngClass]="{'justify-end': msg.role === 'user', 'justify-start': msg.role === 'assistant'}">
              
              <!-- Assistant Avatar -->
              <div *ngIf="msg.role === 'assistant'" class="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center mr-2.5 p-1 border avatar-bg">
                <img [src]="currentTheme === 'dark' ? 'assets/icons/logo-link-dark.png' : 'assets/icons/logo-link-light.png'" class="w-full h-full object-contain" alt="Rotbot">
              </div>
 
              <!-- Message Bubble -->
              <div 
                [ngClass]="{
                  'assistant-bubble py-2 text-[15px] leading-relaxed max-w-[72%]': msg.role === 'assistant',
                  'user-bubble px-4 py-3 rounded-2xl rounded-tr-sm text-[15px] leading-relaxed max-w-[85%] border shadow-sm': msg.role === 'user'
                }"
              >
                <span [innerHTML]="msg.content | markdown"></span>
              </div>
            </div>
 
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
          </div>
 
          <!-- Input Area -->
          <div class="chat-input-area p-3 sm:p-6 border-t">
            <form (submit)="sendMessage()" class="relative max-w-4xl mx-auto">
              <input 
                type="text" 
                [(ngModel)]="chatService.userInput"
                name="userInput"
                placeholder="Pregúntale a Rotbot..."
                class="chat-input w-full rounded-xl border py-4 pl-5 pr-14 text-[15px] font-light tracking-wide transition-all focus:ring-0 focus:outline-none"
              />
              <button 
                type="submit"
                [disabled]="!chatService.userInput.trim()"
                class="chat-submit-btn absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
            <div class="flex justify-center mt-3">
               <span class="text-[9px] uppercase tracking-widest font-sans font-medium opacity-30" style="color: var(--text-secondary);">Powered by Portalink IA</span>
            </div>
          </div>
        </div>
 
        <!-- Sidebar Derecho (Info Rotbot) -->
        <div *ngIf="!activeDesign" class="chat-sidebar no-scrollbar hidden md:flex flex-col w-80 flex-shrink-0 border-l py-8 px-6 gap-6 overflow-y-auto animate-fade-in" style="border-color: var(--card-border);">
          <h4 class="sidebar-title mb-2">¿Quién es Rotbot?</h4>
          
          <div class="flex flex-col items-center text-center gap-4 p-5 rounded-2xl border right-sidebar-card" style="border-color: var(--card-border);">
            <div class="w-24 h-24 rounded-2xl flex items-center justify-center p-2 border right-sidebar-icon shadow-inner">
              <img [src]="currentTheme === 'dark' ? 'assets/icons/logo-link-dark.png' : 'assets/icons/logo-link-light.png'" class="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(0,245,255,0.4)]" alt="Rotbot Logo">
            </div>
            <div>
              <h5 class="text-sm font-bold tracking-wide" style="color: var(--text-primary);">Copiloto Tecnológico</h5>
              <p class="text-[11.5px] font-normal mt-2 leading-relaxed opacity-95" style="color: var(--text-secondary);">
                Rotbot es una inteligencia artificial diseñada para asesorar y guiar en el desarrollo de soluciones digitales avanzadas, desarrollo a medida y automatizaciones de procesos comerciales.
              </p>
              <button (click)="isInfoModalOpen = true" class="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all group">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-cyan-400 group-hover:scale-110 transition-transform">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span class="text-[11px] font-bold uppercase tracking-wider" style="color: var(--text-primary);">Info de la IA</span>
              </button>
            </div>
          </div>
 
          <h4 class="sidebar-title mt-2 mb-2">¿Tienes un Proyecto?</h4>
 
          <button (click)="sendShortcutMessage('Quiero una implementación de IA en mi negocio')" class="shortcut-btn flex flex-col gap-2 p-5 rounded-xl text-left border transition-all duration-300 shadow-sm hover:shadow-md">
            <span class="text-[10px] font-bold uppercase tracking-widest" style="color: var(--accent-color);">Oportunidad</span>
            <span class="text-[14.5px] font-semibold leading-snug" style="color: var(--text-primary);">Quiero mi IA para mi negocio</span>
            <span class="text-[11px] font-normal opacity-95 leading-normal block" style="color: var(--text-secondary);">
              Empieza hoy la transformación digital y automatiza tu negocio con Inteligencia Artificial.
            </span>
          </button>
        </div>

        <!-- Componente Interactivo Dinámico (Diseños en Formato Móvil) -->
        <div *ngIf="activeDesign || isDesigning" class="hidden lg:flex flex-col flex-grow h-full overflow-hidden relative animate-fade-in z-10 items-center justify-center bg-[var(--bg-primary)]/50 p-6">
          
          <!-- Botón Cerrar Diseño -->
          <button (click)="activeDesign = null; isDesigning = false" class="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 transition-colors z-20 text-neutral-400 hover:text-white">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          <!-- Mobile Phone Frame -->
          <div class="w-[330px] h-[715px] bg-white rounded-[2.5rem] border-[12px] border-[#1a1a1a] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col transform origin-center transition-transform hover:scale-[1.02] duration-500 ring-1 ring-white/10">
            <!-- Dynamic Island / Notch Mock -->
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#1a1a1a] rounded-b-2xl z-50"></div>
            
            <!-- Loading State -->
            <div *ngIf="isDesigning" class="absolute inset-0 z-40 bg-[#f8f9fa] flex flex-col items-center justify-center animate-fade-in p-6 text-center">
              <div class="relative w-16 h-16 mb-6">
                <div class="absolute inset-0 border-4 border-neutral-200 rounded-full"></div>
                <div class="absolute inset-0 border-4 border-black rounded-full border-t-transparent animate-spin"></div>
              </div>
              <h3 class="font-bold text-black mb-1">RotBot está diseñando...</h3>
              <p class="text-[11px] text-neutral-500">Renderizando componentes nativos y ajustando la interfaz ultra-premium.</p>
            </div>

            <!-- App Render -->
            <app-restaurant-pos *ngIf="activeDesign === 'restaurant-pos'" class="w-full h-full animate-fade-in"></app-restaurant-pos>
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
      padding-top: 2rem !important;
      padding-bottom: 2rem !important;
    }
    @media (min-width: 768px) {
      .messages-area {
        padding-top: 4rem !important;
        padding-bottom: 2rem !important;
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
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      font-family: var(--font-sans, sans-serif);
      font-weight: 600;
      color: var(--text-secondary);
      opacity: 0.5;
    }
    :host-context(.theme-light) .sidebar-title {
      color: var(--text-primary);
      opacity: 0.65;
      font-weight: 700;
    }
  `]
})
export class RotbotComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

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

  constructor(
    public chatService: ChatStateService,
    private router: Router,
    private location: Location,
    private analyticsService: AnalyticsService
  ) {}

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

    // Si venía con un mensaje pre-cargado (desde el home), enviarlo
    if (this.chatService.userInput.trim()) {
      setTimeout(() => this.sendMessage(), 400);
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
    this.scrollToBottom();
  }

  goBack() {
    this.location.back();
  }

  sendShortcutMessage(text: string) {
    this.chatService.userInput = text;
    this.sendMessage();
  }

  sendMessage() {
    if (!this.chatService.userInput.trim()) return;
    if (this.chatService.isTyping) return;

    this.analyticsService.incrementMetric('rotbotMessagesSent');
    const userText = this.chatService.userInput.trim();
    this.chatService.userInput = '';

    const textLower = userText.toLowerCase();
    if (textLower.includes('restaurante') || textLower.includes('caja')) {
      this.isDesigning = true;
      this.activeDesign = null;
      setTimeout(() => {
        this.isDesigning = false;
        this.activeDesign = 'restaurant-pos';
      }, 3000);
    }

    this.chatService.sendMessage(userText);
    setTimeout(() => this.scrollToBottom(), 80);
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }
}
