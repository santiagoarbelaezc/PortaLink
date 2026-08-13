import { Component, ElementRef, ViewChild, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { ChatStateService } from '../../services/chat-state.service';
import { AnalyticsService } from '../../services/analytics.service';
import { AuthService } from '../../services/auth.service';
import { MarkdownPipe } from '../../pipes/markdown-pipe';

@Component({
  selector: 'app-ai-chat-floating',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownPipe],
  template: `
    <!-- Floating Container -->
    <div class="fixed bottom-8 -right-8 z-[500]">
      
      <!-- Open Chat Button -->
      <button 
        *ngIf="!isOpen"
        [@buttonAnimation]
        (click)="toggleChat()"
        class="group relative flex h-[280px] w-[190px] items-center justify-end bg-transparent border-none overflow-visible shadow-none origin-right cursor-pointer"
      >
        <div class="relative flex items-center justify-end w-full h-full">
          <img src="assets/images/robot-izquierda.png" class="h-full w-auto object-contain object-right relative z-10 translate-x-8 hover:scale-105 transition-transform" alt="Rotbot">
        </div>
      </button>

      <!-- Chat Panel (Taller & Roomier) -->
      <div 
        *ngIf="isOpen"
        [@chatAnimation]
        class="chat-panel absolute bottom-0 right-6 md:right-12 w-[94vw] md:w-[480px] max-h-[88vh] h-[660px] overflow-hidden rounded-[32px] bg-white border border-neutral-200/90 shadow-[0_30px_70px_rgba(0,0,0,0.16)] origin-bottom-right font-sans flex flex-col z-50 text-neutral-900"
      >
        <!-- Header -->
        <div class="chat-header flex items-center justify-between border-b border-neutral-100 bg-white/95 backdrop-blur-xl px-6 py-3.5 relative overflow-hidden flex-shrink-0">
          
          <div class="flex items-center gap-3 relative z-10">
            <div class="w-9 h-9 rounded-2xl bg-neutral-100 border border-neutral-200/80 flex items-center justify-center p-1 shadow-2xs">
              <img src="assets/icons/logo-link-light.png" class="w-full h-full object-contain" alt="Rotbot">
            </div>
            <div>
              <h3 class="font-sans text-base font-bold tracking-tight text-neutral-900 leading-none">
                RotBot IA
              </h3>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-[9.5px] font-medium inline-flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Copilot Activo</span>
                </span>
              </div>
            </div>
          </div>
          
          <!-- Actions Container -->
          <div class="flex items-center gap-2 relative z-10">
            <!-- New Chat Button -->
            <button (click)="chatService.clearHistory()" 
                    class="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-600 flex items-center justify-center transition-all border-none cursor-pointer" 
                    title="Nuevo Chat">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l-3.08 2.82"/>
              </svg>
            </button>
            
            <!-- Fullscreen Toggle Button -->
            <button (click)="toggleFullScreen()" 
                    class="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-600 flex items-center justify-center transition-all border-none cursor-pointer" 
                    title="Pantalla Completa">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
              </svg>
            </button>
            
            <!-- Close Button -->
            <button (click)="toggleChat()" 
                    class="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-700 flex items-center justify-center transition-all border-none cursor-pointer" 
                    title="Cerrar Chat">
              <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Messages + Input Container -->
        <div class="flex flex-col flex-grow h-full overflow-hidden bg-white">
          
          <!-- Messages Area -->
          <div #scrollContainer class="flex-grow overflow-y-auto p-5 space-y-4 scroll-smooth custom-scrollbar" style="overscroll-behavior: contain;">
            
            <!-- Welcome Intro Section (Compact & Centered) -->
            <div *ngIf="chatService.messages.length <= 1" class="flex flex-col items-center justify-center text-center p-5 my-1 max-w-sm mx-auto rounded-[24px] bg-neutral-50/80 border border-neutral-200/80 shadow-2xs space-y-2">
              <div class="w-20 h-20 sm:w-24 sm:h-24 relative flex items-center justify-center overflow-visible">
                <img src="assets/images/rotbot4.png" class="w-full h-full object-contain" alt="Rotbot Full">
              </div>
              <div class="space-y-1">
                <h2 class="text-base sm:text-lg font-bold tracking-tight text-neutral-900">
                  Sistemas con RotBot IA
                </h2>
                <p class="text-xs font-sans text-neutral-500 max-w-xs mx-auto leading-relaxed m-0">
                  ¡Hola! Soy RotBot, tu copiloto tecnológico listo para guiarte en el desarrollo de tus proyectos web e Inteligencia Artificial.
                </p>
              </div>
            </div>

            <!-- Message List -->
            <ng-container>
              <div *ngFor="let msg of chatService.messages" class="flex w-full animate-fade-in my-1.5" [ngClass]="{'justify-end': msg.role === 'user', 'justify-start': msg.role === 'assistant'}">
                
                <!-- Assistant Avatar -->
                <div *ngIf="msg.role === 'assistant'" class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mr-2.5 p-1 border border-neutral-200/80 bg-neutral-100">
                  <img src="assets/icons/logo-link-light.png" class="w-full h-full object-contain" alt="Rotbot">
                </div>
  
                <!-- Message Bubble -->
                <div 
                  [ngClass]="{
                    'assistant-bubble px-4 py-3 rounded-2xl rounded-tl-xs text-xs sm:text-sm leading-relaxed max-w-[85%] bg-neutral-100 text-neutral-900 shadow-2xs': msg.role === 'assistant',
                    'user-bubble px-4 py-3 rounded-2xl rounded-tr-xs text-xs sm:text-sm leading-relaxed max-w-[85%] text-white font-medium shadow-sm border-none': msg.role === 'user'
                  }"
                  [style.background-color]="msg.role === 'user' ? '#09090b !important' : ''"
                  [style.color]="msg.role === 'user' ? '#ffffff !important' : ''"
                >
                  <span [innerHTML]="msg.content | markdown"></span>

                  <!-- Action Buttons inside assistant greeting -->
                  <div *ngIf="msg.role === 'assistant' && msg.showInitialActionButtons" class="mt-3 flex flex-wrap items-center gap-2">
                    <button 
                      (click)="startDesignFlow()" 
                      class="px-3.5 py-1.5 rounded-full bg-white hover:bg-neutral-900 hover:text-white border border-neutral-200/90 text-xs font-semibold text-neutral-900 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs">
                      <i class="fa-solid fa-palette text-xs"></i>
                      <span>Quiero un Diseño</span>
                    </button>
                    <button 
                      (click)="startConsultingFlow()" 
                      class="px-3.5 py-1.5 rounded-full bg-white hover:bg-neutral-900 hover:text-white border border-neutral-200/90 text-xs font-semibold text-neutral-900 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs">
                      <i class="fa-solid fa-lightbulb text-xs"></i>
                      <span>Quiero Asesoría</span>
                    </button>
                  </div>

                </div>
              </div>
            </ng-container>

            <!-- Typing Indicator -->
            <div *ngIf="chatService.isTyping" class="flex items-center gap-2.5 w-full">
              <div class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center p-1 border border-neutral-200 bg-neutral-100">
                <img src="assets/icons/logo-link-light.png" class="w-full h-full object-contain" alt="Rotbot">
              </div>
              <div class="assistant-bubble px-4 py-2.5 rounded-2xl bg-neutral-100 border border-neutral-200/70 text-neutral-900 flex items-center gap-1.5 shadow-2xs">
                <div class="w-1.5 h-1.5 rounded-full bg-neutral-600 animate-bounce"></div>
                <div class="w-1.5 h-1.5 rounded-full bg-neutral-600 animate-bounce [animation-delay:0.2s]"></div>
                <div class="w-1.5 h-1.5 rounded-full bg-neutral-600 animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>

          <!-- Input Area (Permanently Active) -->
          <div class="chat-input-area p-4 border-t border-neutral-100 bg-white flex-shrink-0">
            <form (submit)="sendMessage()" class="relative flex items-center gap-2 bg-neutral-50 border border-neutral-200/80 rounded-2xl p-2 focus-within:border-neutral-900 transition-colors shadow-2xs">
              <input 
                type="text" 
                [(ngModel)]="chatService.userInput"
                name="userInput"
                placeholder="Escribe tu mensaje para RotBot IA..."
                class="w-full bg-transparent border-none px-3 py-1.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-0"
              />
              <button 
                type="submit"
                [disabled]="!chatService.userInput.trim()"
                class="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex-shrink-0 border-none shadow-sm"
                style="background-color: #09090b !important; color: #ffffff !important;"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: #ffffff !important;">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>

            <div class="flex justify-center mt-2">
               <span class="text-[10.5px] font-sans font-medium text-neutral-400">Powered by Portalink IA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-panel {
      background: #ffffff !important;
      border-color: #e4e4e7 !important;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.14) !important;
    }
    .chat-header {
      background: #ffffff !important;
      border-color: #f4f4f5 !important;
    }
    .assistant-bubble {
      background: #f4f4f5 !important;
      border: none !important;
      outline: none !important;
      border-radius: 20px 20px 20px 4px !important;
      padding: 12px 16px !important;
      color: #09090b !important;
    }
    .assistant-bubble * {
      color: #09090b !important;
    }
    .user-bubble {
      background: #09090b !important;
      border: none !important;
      color: #ffffff !important;
    }
    .user-bubble * {
      color: #ffffff !important;
    }
    .chat-input-area {
      background: #ffffff !important;
      border-color: #f4f4f5 !important;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(0,0,0,0.02);
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.12);
      border-radius: 4px;
    }
  `],
  animations: [
    trigger('chatAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(30px) scale(0.95)', opacity: 0 }),
        animate('400ms cubic-bezier(0.16, 1, 0.3, 1)', style({ transform: 'translateY(0) scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.16, 1, 0.3, 1)', style({ transform: 'translateY(30px) scale(0.95)', opacity: 0 }))
      ])
    ]),
    trigger('buttonAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(100px)', opacity: 0 }),
        animate('400ms 100ms cubic-bezier(0.16, 1, 0.3, 1)', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.16, 1, 0.3, 1)', style({ transform: 'translateX(100px)', opacity: 0 }))
      ])
    ])
  ]
})
export class AiChatFloatingComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  isOpen = false;

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

  constructor(
    public chatService: ChatStateService,
    private router: Router,
    private analyticsService: AnalyticsService,
    public authService: AuthService
  ) { }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.currentTheme = localStorage.getItem('portfolio-theme') || 'light';
      window.addEventListener('portfolio-theme-change', this.onThemeChange);
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

  startDesignFlow() {
    this.chatService.chatMode.set('design');
    this.isOpen = false;
    this.router.navigate(['/rotbot']);
  }

  startConsultingFlow() {
    this.chatService.chatMode.set('consulting');
    this.isOpen = false;
    this.router.navigate(['/rotbot']);
  }

  @HostListener('window:open-ai-chat', ['$event'])
  onOpenAiChat(event: any) {
    this.isOpen = true;
    this.analyticsService.incrementMetric('rotbotOpens');
    if (event.detail && event.detail.message) {
      this.chatService.userInput = event.detail.message;
      this.sendMessage();
    }
    setTimeout(() => {
      try {
        this.scrollContainer.nativeElement.scrollTop = 0;
      } catch (err) { }
    }, 100);
  }

  toggleChat() {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      this.router.navigate(['/rotbot']);
      return;
    }
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.analyticsService.incrementMetric('rotbotOpens');
      setTimeout(() => {
        try {
          this.scrollContainer.nativeElement.scrollTop = 0;
        } catch (err) { }
      }, 100);
    }
  }

  toggleFullScreen() {
    this.isOpen = false;
    this.router.navigate(['/rotbot']);
  }

  sendMessage() {
    if (!this.chatService.userInput.trim()) return;
    if (this.chatService.isTyping) return;

    // Redirigir siempre al chat completo con el mensaje precargado
    this.isOpen = false;
    this.router.navigate(['/rotbot']);
  }

  private detectStyle(text: string): string | null {
    const lowerText = text.toLowerCase();
    for (const [key, value] of Object.entries(this.styleKeywords)) {
      if (lowerText.includes(key)) return value;
    }
    return null;
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }
}
