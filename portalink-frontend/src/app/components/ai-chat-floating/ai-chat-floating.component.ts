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
    <div class="fixed bottom-3 -right-8 z-[500]">
      
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
            <!-- Info IA Button -->
            <button (click)="isInfoModalOpen = true" 
                    class="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-600 flex items-center justify-center transition-all border-none cursor-pointer" 
                    title="Info de la IA">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </button>

            <!-- New Chat Button -->
            <button (click)="resetChatWithEffect()" 
                    class="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-600 flex items-center justify-center transition-all border-none cursor-pointer" 
                    title="Nuevo Chat">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" [class.animate-spin]="isResetting">
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
        <div class="flex flex-col flex-grow h-full overflow-hidden bg-white relative">
          
          <!-- Modal de Info de la IA (Especificaciones Técnicas y Legales) -->
          <div *ngIf="isInfoModalOpen" 
               class="absolute inset-0 z-[100] flex flex-col bg-white animate-fade-in p-5 overflow-y-auto custom-scrollbar">
            
            <!-- Modal Header -->
            <div class="flex items-center justify-between pb-3.5 border-b border-neutral-100 flex-shrink-0">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-neutral-100 border border-neutral-200/80 flex items-center justify-center p-1.5 shrink-0">
                  <img src="assets/icons/logo-link-light.png" class="w-full h-full object-contain" alt="Rotbot">
                </div>
                <div>
                  <h4 class="text-xs font-bold text-neutral-900 leading-none m-0">Acerca de Rotbot IA</h4>
                  <span class="text-[10px] text-neutral-400 font-medium">Especificaciones Técnicas y Legales</span>
                </div>
              </div>
              <button (click)="isInfoModalOpen = false" class="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-600 flex items-center justify-center transition-all border-none cursor-pointer">
                <svg width="12" height="12" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <!-- Modal Content -->
            <div class="space-y-3.5 pt-3.5 text-xs leading-relaxed text-neutral-600">
              
              <!-- Motor IA -->
              <div class="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-[9.5px] uppercase font-bold tracking-wider text-neutral-400">Modelo de IA</span>
                  <span class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[9px] font-semibold border border-blue-200/60">Llama 3.3 70B</span>
                </div>
                <h5 class="text-xs font-bold text-neutral-900 m-0">Motor de Inteligencia Artificial</h5>
                <p class="text-[11px] m-0 text-neutral-500 leading-normal">
                  Rotbot es impulsado por <strong>Llama 3.3 70B Versatile</strong>, uno de los modelos de lenguaje de código abierto más avanzados del mundo desarrollados por Meta. Este modelo está altamente optimizado para razonamiento lógico complejo, generación de código estructurado y asesoramiento técnico profesional en diversas áreas del desarrollo de software.
                </p>
              </div>

              <!-- Inferencia GROQ -->
              <div class="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-[9.5px] uppercase font-bold tracking-wider text-neutral-400">Procesamiento LPU</span>
                  <span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-semibold border border-emerald-200/60">Groq Speed</span>
                </div>
                <h5 class="text-xs font-bold text-neutral-900 m-0">Infraestructura de Inferencia</h5>
                <p class="text-[11px] m-0 text-neutral-500 leading-normal">
                  Para garantizar tiempos de respuesta en tiempo real y una latencia ultra baja, utilizamos la revolucionaria infraestructura <strong>LPU (Language Processing Unit)</strong> proporcionada por Groq. Esta tecnología de hardware especializada permite que Rotbot infiera y genere respuestas complejas a velocidades sin precedentes en la industria.
                </p>
              </div>

              <!-- Aviso Legal y Privacidad -->
              <div class="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-2.5">
                <h5 class="text-xs font-bold text-amber-900 m-0 flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  Aviso Legal y Privacidad
                </h5>

                <div class="space-y-2 text-[10.5px] text-amber-950/80 leading-normal">
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

              <div class="pt-1 pb-2">
                <button (click)="isInfoModalOpen = false" class="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs transition-all border-none cursor-pointer text-center">
                  Entendido
                </button>
              </div>

            </div>
          </div>

          <!-- Overlay de Reseteo (cubre todo el chat mientras limpia) -->
          <div *ngIf="showOverlay" 
               class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white"
               [style]="'opacity: ' + overlayOpacity + '; transition: opacity 600ms ease-in-out;'">
            <div class="flex flex-col items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200/80 flex items-center justify-center p-2">
                <img src="assets/icons/logo-link-light.png" class="w-full h-full object-contain" alt="Rotbot">
              </div>
              <div class="flex flex-col items-center gap-1">
                <span class="text-xs font-semibold text-neutral-700" style="letter-spacing: 0.02em;">Nueva conversación</span>
                <div class="flex gap-1 mt-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-neutral-300 animate-bounce" style="animation-delay: 0ms"></span>
                  <span class="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style="animation-delay: 150ms"></span>
                  <span class="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce" style="animation-delay: 300ms"></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Messages Area -->
          <div #scrollContainer 
               class="flex-grow overflow-y-auto p-5 space-y-4 scroll-smooth custom-scrollbar" 
               style="overscroll-behavior: contain;">
            
            <!-- Welcome Intro Section (Compact & Centered) -->
            <div *ngIf="chatService.messages.length <= 1" class="flex flex-col items-center justify-center text-center p-5 my-1 max-w-sm mx-auto rounded-[24px] bg-neutral-50/80 border border-neutral-200/80 shadow-2xs space-y-2">
              <div class="w-28 h-28 sm:w-32 sm:h-32 relative flex items-center justify-center overflow-visible">
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
                [disabled]="chatService.isBlocked()"
                name="userInput"
                [placeholder]="chatService.isBlocked() ? 'Chat suspendido (' + chatService.blockRemainingSeconds() + 's)...' : 'Escribe tu mensaje para RotBot IA...'"
                class="w-full bg-transparent border-none px-3 py-1.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button 
                type="submit"
                [disabled]="!chatService.userInput.trim() || chatService.isBlocked()"
                class="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex-shrink-0 border-none shadow-sm"
                style="background-color: #09090b !important; color: #ffffff !important;"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: #ffffff !important;">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>

            <!-- Block Warning Badge -->
            <div *ngIf="chatService.isBlocked()" class="mt-2 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-[11px] font-headline font-semibold flex items-center justify-between shadow-2xs animate-pulse">
              <span class="truncate">Chat suspendido por contenido explícito</span>
              <span class="font-mono font-bold bg-red-100 px-2 py-0.5 rounded text-red-800 flex-shrink-0">{{ chatService.blockRemainingSeconds() }}s</span>
            </div>

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
    .assistant-bubble a,
    .assistant-bubble a * {
      color: #ffffff !important;
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
  isResetting = false;
  showResetBadge = false;
  showOverlay = false;
  overlayOpacity = '1';
  isInfoModalOpen = false;

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
    const prompt = 'Quiero un diseño web a medida para mi proyecto.';
    this.chatService.userInput = '';
    this.chatService.sendMessage(prompt);
    this.analyticsService.incrementMetric('rotbotMessagesSent');
    this.scrollToBottom();
  }

  startConsultingFlow() {
    this.chatService.chatMode.set('consulting');
    const prompt = 'Quiero asesoría estratégica para mi proyecto.';
    this.chatService.userInput = '';
    this.chatService.sendMessage(prompt);
    this.analyticsService.incrementMetric('rotbotMessagesSent');
    this.scrollToBottom();
  }

  @HostListener('window:open-ai-chat', ['$event'])
  onOpenAiChat(event: any) {
    this.isOpen = true;
    this.analyticsService.incrementMetric('rotbotOpens');
    if (event.detail && event.detail.message) {
      this.chatService.userInput = event.detail.message;
      this.sendMessage();
    }
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.analyticsService.incrementMetric('rotbotOpens');
      this.scrollToBottom();
    }
  }

  toggleFullScreen() {
    this.isOpen = false;
    this.router.navigate(['/rotbot']);
  }

  sendMessage() {
    const text = this.chatService.userInput.trim();
    if (!text) return;
    if (this.chatService.isTyping) return;

    this.chatService.userInput = '';
    this.chatService.sendMessage(text);
    this.analyticsService.incrementMetric('rotbotMessagesSent');
    this.scrollToBottom();
  }

  @HostListener('click', ['$event'])
  onChatClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const anchor = target.closest('a') as HTMLAnchorElement;
    if (anchor) {
      const href = anchor.getAttribute('href');
      if (href && href.startsWith('/')) {
        event.preventDefault();
        this.isOpen = false;
        this.router.navigateByUrl(href);
      }
    }
  }

  private detectStyle(text: string): string | null {
    const lowerText = text.toLowerCase();
    for (const [key, value] of Object.entries(this.styleKeywords)) {
      if (lowerText.includes(key)) return value;
    }
    return null;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      try {
        if (this.scrollContainer?.nativeElement) {
          this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        }
      } catch (err) { }
    }, 100);
  }
}
