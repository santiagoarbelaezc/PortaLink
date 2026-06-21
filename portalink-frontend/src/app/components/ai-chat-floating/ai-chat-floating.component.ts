import { Component, ElementRef, ViewChild, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormsModule } from '@angular/forms';

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
        class="group relative flex h-[320px] w-[220px] items-center justify-end bg-transparent transition-all duration-500 hover:scale-110 active:scale-95 border-none overflow-visible shadow-none origin-right"
      >
        <div class="relative flex items-center justify-end w-full h-full">
          <img src="assets/images/robot-izquierda.png" class="h-full w-auto object-contain object-right relative z-10 translate-x-10" alt="Rotbot">
        </div>
      </button>

      <!-- Chat Panel -->
      <div 
        *ngIf="isOpen"
        [@chatAnimation]
        class="absolute bottom-0 right-12 md:right-16 w-[90vw] md:w-[450px] overflow-hidden rounded-2xl border border-cyan-500/30 bg-black shadow-[0_0_40px_rgba(34,211,238,0.15)] origin-bottom-right font-sans"
      >
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-cyan-500/20 bg-black px-5 py-4 relative overflow-hidden">
          <!-- Cyber Scanner Line -->
          <div class="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>
          
          <div class="flex items-center gap-3 relative z-10">
            <div class="w-8 h-8 rounded-md bg-cyan-500/10 flex items-center justify-center p-1 border border-cyan-500/30 shadow-[inset_0_0_10px_rgba(34,211,238,0.1)]">
              <img src="assets/images/rotbot.png" class="w-full h-full object-contain filter drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" alt="Rotbot">
            </div>
            <div>
              <h3 class="font-sans text-base font-bold text-white tracking-wide leading-none">RotBot <span class="text-cyan-400 font-medium">IA</span></h3>
              <div class="flex items-center gap-1.5 mt-1">
                 <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_5px_rgba(34,211,238,0.8)]"></span>
                 <p class="text-[9px] uppercase tracking-widest text-cyan-400/70 font-sans font-medium">System Active</p>
              </div>
            </div>
          </div>
          
          <!-- Close Button -->
          <button (click)="toggleChat()" class="relative z-10 p-2 text-cyan-400/50 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-md transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Messages Area -->
        <div #scrollContainer class="h-[450px] overflow-y-auto p-5 space-y-6 scroll-smooth bg-black custom-scrollbar">
          
          <!-- Welcome Intro Section -->
          <div class="flex flex-col items-center justify-center text-center pb-8 border-b border-cyan-500/10 mt-2 mb-2">
            <div class="w-64 h-64 mb-6 relative">
              <div class="absolute inset-0 bg-cyan-500/10 rounded-full blur-3xl"></div>
              <img src="assets/images/rotbot.png" class="w-full h-full object-contain relative z-10 drop-shadow-[0_0_20px_rgba(34,211,238,0.2)] scale-110" alt="Rotbot Full">
            </div>
            <h2 class="text-2xl font-bold text-white mb-3 tracking-wide">RotBot <span class="text-cyan-400">IA</span></h2>
            <div class="text-[14px] text-white/70 font-light leading-relaxed px-2 max-w-[95%]">
              <p class="mb-3">
                Soy tu asistente virtual inteligente. Más allá de explorar diseños visuales, estoy aquí para guiarte en la construcción de <strong>sistemas completamente funcionales</strong>. 
              </p>
              <p class="mb-2 text-cyan-400/80">Puedo ayudarte a implementar:</p>
              <ul class="text-left list-disc list-inside space-y-1.5 text-[13px] text-white/60 mx-auto w-fit">
                <li>Sistemas para restaurantes.</li>
                <li>Software para llevar las ventas de tu negocio.</li>
                <li>E-commerce para vender en línea.</li>
                <li>Personalización de tu propia landing page.</li>
                <li>Integración de tu propia Inteligencia Artificial.</li>
              </ul>
            </div>
          </div>

          <div *ngFor="let msg of messages" class="flex w-full" [ngClass]="{'justify-end': msg.role === 'user', 'justify-start': msg.role === 'assistant'}">
            
            <!-- Assistant Avatar in message -->
            <div *ngIf="msg.role === 'assistant'" class="w-8 h-8 rounded-md bg-cyan-500/10 flex-shrink-0 flex items-center justify-center mr-3 p-1 border border-cyan-500/20">
              <img src="assets/images/rotbot.png" class="w-full h-full object-contain" alt="Rotbot">
            </div>

            <!-- Message Bubble -->
            <div 
              [ngClass]="{
                'text-white/90 text-[15px] font-light tracking-wide leading-relaxed': msg.role === 'assistant',
                'bg-cyan-500/10 border border-cyan-500/20 text-white font-light tracking-wide rounded-xl rounded-tr-sm px-4 py-3 text-[15px] leading-relaxed max-w-[85%] backdrop-blur-sm shadow-[0_0_15px_rgba(34,211,238,0.05)]': msg.role === 'user'
              }"
            >
              {{ msg.content }}
            </div>
          </div>

          <!-- Typing Indicator -->
          <div *ngIf="isTyping" class="flex items-center gap-3 w-full">
            <div class="w-8 h-8 rounded-md bg-cyan-500/10 flex-shrink-0 flex items-center justify-center p-1 border border-cyan-500/20">
              <img src="assets/images/rotbot.png" class="w-full h-full object-contain" alt="Rotbot">
            </div>
            <div class="flex items-center gap-1 text-cyan-400/50">
              <div class="w-1 h-3 bg-current animate-pulse"></div>
              <div class="w-1 h-3 bg-current animate-pulse [animation-delay:0.2s]"></div>
              <div class="w-1 h-3 bg-current animate-pulse [animation-delay:0.4s]"></div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="bg-black p-4 pt-3 border-t border-cyan-500/20">
          <form (submit)="sendMessage()" class="relative">
            <input 
              type="text" 
              [(ngModel)]="userInput"
              name="userInput"
              placeholder="Escribe tu mensaje..."
              class="w-full rounded-lg border border-cyan-500/20 bg-transparent py-3 pl-4 pr-12 text-[15px] text-white font-light tracking-wide transition-all focus:ring-0 focus:outline-none focus:border-cyan-400 focus:bg-cyan-500/5 focus:shadow-[0_0_10px_rgba(34,211,238,0.15)] placeholder:text-cyan-200/30"
            />
            <button 
              type="submit"
              [disabled]="!userInput.trim()"
              class="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-500/10 text-cyan-400 rounded-md transition-all hover:bg-cyan-500/30 disabled:opacity-30 disabled:hover:bg-cyan-500/10 border border-cyan-500/20"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
          <div class="flex justify-center mt-3">
             <span class="text-[9px] uppercase tracking-widest text-cyan-400/30 font-sans font-medium">Powered by Portalink</span>
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
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(0,0,0,0.2);
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(59, 130, 246, 0.2);
      border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(59, 130, 246, 0.4);
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
export class AiChatFloatingComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  isOpen = false;
  userInput = '';
  isTyping = false;
  messages: { role: 'assistant' | 'user'; content: string }[] = [
    { role: 'assistant', content: '¡Hola! Cuéntame qué tipo de sistema tienes en mente, o pregúntame cómo podemos integrar IA en tu próximo proyecto. ¿En qué te puedo ayudar hoy?' }
  ];

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

  constructor(private router: Router) {}

  ngOnInit() {}

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    const userText = this.userInput.trim();
    this.messages.push({ role: 'user', content: userText });
    this.userInput = '';
    this.isTyping = true;

    // Simulate thinking
    setTimeout(() => {
      this.isTyping = false;
      const detectedStyle = this.detectStyle(userText);
      
      this.messages.push({ 
        role: 'assistant', 
        content: `¡Entendido! Preparando la interfaz ${detectedStyle ? detectedStyle.toUpperCase() : 'PERSONALIZADA'}. Accediendo al sistema...` 
      });

      // Redirect after a small delay
      setTimeout(() => {
        this.router.navigate(['/design-showcase'], { 
          queryParams: { style: detectedStyle || 'luxury' } 
        });
        this.isOpen = false;
      }, 1200);
    }, 1500);
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
    } catch (err) {}
  }
}
