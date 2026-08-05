import { Component, ElementRef, ViewChild, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { ChatStateService } from '../../services/chat-state.service';
import { AnalyticsService } from '../../services/analytics.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-ai-chat-floating',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Floating Container -->
    <div class="fixed bottom-8 -right-8 z-[500]">
      
      <!-- Open Chat Button -->
      <button 
        *ngIf="!isOpen"
        [@buttonAnimation]
        (click)="toggleChat()"
        class="group relative flex h-[280px] w-[190px] items-center justify-end bg-transparent border-none overflow-visible shadow-none origin-right"
      >
        <div class="relative flex items-center justify-end w-full h-full">
          <img src="assets/images/robot-izquierda.png" class="h-full w-auto object-contain object-right relative z-10 translate-x-8" alt="Rotbot">
        </div>
      </button>

      <!-- Chat Panel -->
      <div 
        *ngIf="isOpen"
        [@chatAnimation]
        class="chat-panel absolute bottom-0 right-12 md:right-16 w-[90vw] md:w-[440px] overflow-hidden rounded-[24px] border shadow-2xl origin-bottom-right font-sans flex flex-col"
      >
        <!-- Header -->
        <div class="chat-header flex items-center justify-between border-b px-5 py-4 relative overflow-hidden">
          <!-- Cyber Scanner Line -->
          <div class="absolute top-0 left-0 w-full h-[1px] scanner-line"></div>
          
          <div class="flex items-center gap-3 relative z-10">
            <div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center p-1.5 border border-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]">
              <img [src]="currentTheme === 'dark' ? 'assets/icons/logo-link-dark.png' : 'assets/icons/logo-link-light.png'" class="w-full h-full object-contain filter drop-shadow-[0_0_5px_rgba(0,245,255,0.3)]" alt="Rotbot">
            </div>
            <div>
              <h3 class="font-sans text-sm font-bold tracking-wide leading-none" style="color: var(--text-primary);">
                RotBot IA
              </h3>
              <div class="flex items-center gap-1.5 mt-1">
                 <span class="w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_5px_var(--accent-color)]" style="background-color: var(--accent-color);"></span>
                 <p class="text-[8px] uppercase tracking-widest font-sans font-medium" style="color: var(--text-secondary); opacity: 0.7;">System Active</p>
              </div>
            </div>
          </div>
          
          <!-- Actions Container -->
          <div class="flex items-center gap-1.5 relative z-10">
            <!-- New Chat Button -->
            <button (click)="chatService.clearHistory()" class="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all" title="Nuevo Chat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l-3.08 2.82"/>
              </svg>
            </button>
            
            <!-- Fullscreen Toggle Button -->
            <button (click)="toggleFullScreen()" class="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all" title="Pantalla Completa">
              <!-- Maximize Icon -->
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
              </svg>
            </button>
            
            <!-- Close Button -->
            <button (click)="toggleChat()" class="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Messages + Input Container -->
        <div class="flex flex-col flex-grow h-full overflow-hidden">
          <!-- Messages Area -->
          <div #scrollContainer class="h-[430px] overflow-y-auto p-5 space-y-6 scroll-smooth custom-scrollbar" style="overscroll-behavior: contain;">
            
            <!-- Welcome Intro Section -->
            <div class="flex flex-col items-center justify-center text-center pb-6 border-b mt-2 mb-2 welcome-border">
              <div class="w-60 h-60 mb-2 relative flex items-center justify-center overflow-visible">
                <img src="assets/images/rotbot4.png" class="w-52 h-52 object-contain relative z-10" alt="Rotbot Full">
              </div>
              <h2 class="text-base font-bold tracking-tight mb-2" style="color: var(--text-primary);">
                Sistemas con Rotbot IA
              </h2>
              <div class="text-[12px] font-light leading-relaxed px-4 max-w-[95%]" style="color: var(--text-secondary);">
                <p class="mb-2">
                  ¡Hola! Soy RotBot, tu copiloto tecnológico. Estoy listo para guiarte en el diseño y desarrollo de sistemas a medida, e-commerce e integración de Inteligencia Artificial para potenciar tu negocio.
                </p>
              </div>
            </div>

            <!-- Message List -->
            <ng-container *ngIf="authService.hasToken()">
              <div *ngFor="let msg of chatService.messages" class="flex w-full animate-fade-in" [ngClass]="{'justify-end': msg.role === 'user', 'justify-start': msg.role === 'assistant'}">
                
                <!-- Assistant Avatar -->
                <div *ngIf="msg.role === 'assistant'" class="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center mr-2.5 p-1 border avatar-bg">
                  <img [src]="currentTheme === 'dark' ? 'assets/icons/logo-link-dark.png' : 'assets/icons/logo-link-light.png'" class="w-full h-full object-contain" alt="Rotbot">
                </div>
  
                <!-- Message Bubble -->
                <div 
                  [ngClass]="{
                    'assistant-bubble py-2 text-[13.5px] leading-relaxed max-w-[72%]': msg.role === 'assistant',
                    'user-bubble px-4 py-3 rounded-2xl rounded-tr-sm text-[13.5px] leading-relaxed max-w-[85%] border shadow-sm': msg.role === 'user'
                  }"
                >
                  {{ msg.content }}
                </div>
              </div>
            </ng-container>

            <!-- Typing Indicator -->
            <div *ngIf="chatService.isTyping" class="flex items-center gap-3 w-full">
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
          <div class="chat-input-area p-4 pt-3 border-t">
            <ng-container *ngIf="authService.hasToken(); else floatingLoginPrompt">
              <!-- Active Input Form (RotBot Activated) -->
              <form *ngIf="chatService.rotbotActive()" (submit)="sendMessage()" class="relative">
                <input 
                  type="text" 
                  [(ngModel)]="chatService.userInput"
                  name="userInput"
                  placeholder="Pregúntale a Rotbot..."
                  class="chat-input w-full rounded-xl border py-3.5 pl-4 pr-12 text-[14px] font-light tracking-wide transition-all focus:ring-0 focus:outline-none"
                />
                <button 
                  type="submit"
                  [disabled]="!chatService.userInput.trim()"
                  class="chat-submit-btn absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </form>

              <!-- Coming Soon Card (RotBot Deactivated) -->
              <div *ngIf="!chatService.rotbotActive()" class="flex flex-col items-center justify-center p-4 text-center space-y-2 bg-black/60 rounded-xl border border-cyan-500/30">
                <div class="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px] uppercase tracking-wider">
                  <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span>Próximamente</span>
                </div>
                <p class="text-xs font-bold text-white">
                  Pronto estaremos en línea, para que hables conmigo
                </p>
                <a href="https://wa.me/573054078225?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20mi%20proyecto" target="_blank" rel="noopener noreferrer" class="mt-1 px-4 py-2 rounded-lg bg-emerald-500 text-black font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
                  <i class="fa-brands fa-whatsapp text-xs"></i>
                  <span>Hablar por WhatsApp</span>
                </a>
              </div>
            </ng-container>
            <ng-template #floatingLoginPrompt>
              <div class="flex flex-col items-center justify-center text-center">
                 <button (click)="toggleFullScreen()" class="w-full py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]" style="background: var(--accent-color, #00f5ff); color: #000; box-shadow: 0 0 15px rgba(0,245,255,0.2);">
                    Iniciar Sesión para conversar
                 </button>
              </div>
            </ng-template>
            <div class="flex justify-center mt-3">
               <span class="text-[8px] uppercase tracking-widest font-sans font-medium opacity-30" style="color: var(--text-secondary);">Powered by Portalink IA</span>
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
    .chat-panel {
      /* 100% Opacity Solid Background */
      background: rgb(8, 8, 8);
      backdrop-filter: blur(30px);
      -webkit-backdrop-filter: blur(30px);
      border-color: rgba(255, 255, 255, 0.08);
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6), inset 0 0 1px rgba(255, 255, 255, 0.1);
      overscroll-behavior: contain;
    }
    :host-context(.theme-light) .chat-panel {
      background: rgb(255, 255, 255);
      border-color: rgba(0, 0, 0, 0.06);
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.08), inset 0 0 1px rgba(0, 0, 0, 0.05);
      overscroll-behavior: contain;
    }
    .chat-header {
      border-color: rgba(255, 255, 255, 0.08);
    }
    :host-context(.theme-light) .chat-header {
      border-color: rgba(0, 0, 0, 0.06);
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
    .theme-light .assistant-bubble {
      background: transparent;
      border: none !important;
      box-shadow: none !important;
    }
    .user-bubble {
      background: var(--accent-color, #00f5ff);
      border-color: var(--accent-color, #00f5ff);
      color: #000000;
      font-weight: 600;
    }
    .theme-light .user-bubble {
      color: #000000;
    }
    .chat-input-area {
      border-color: rgba(255, 255, 255, 0.08);
    }
    :host-context(.theme-light) .chat-input-area {
      border-color: rgba(0, 0, 0, 0.06);
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

  currentTheme = 'dark';

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
