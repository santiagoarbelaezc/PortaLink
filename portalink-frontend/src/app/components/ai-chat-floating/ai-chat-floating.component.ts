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
    <!-- Floating Button -->
    <div class="fixed bottom-8 right-8 z-[500]">
      <button 
        (click)="toggleChat()"
        class="group relative flex h-24 w-24 items-center justify-center rounded-full bg-transparent transition-all duration-500 hover:scale-110 active:scale-95 border-none overflow-visible shadow-none"
        [ngClass]="{'rotate-90': isOpen}"
      >
        <div class="relative flex items-center justify-center w-full h-full">
          <!-- Robot Icon/Avatar (Larger and no container) -->
          <img *ngIf="!isOpen" src="assets/images/rotbot4.png" class="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" alt="Rotbot">
          
          <!-- Close Icon -->
          <div *ngIf="isOpen" class="w-16 h-16 bg-black rounded-full flex items-center justify-center border-2 border-white shadow-2xl">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
        </div>
      </button>

      <!-- Chat Panel -->
      <div 
        *ngIf="isOpen"
        [@chatAnimation]
        class="absolute bottom-20 right-0 w-[350px] md:w-[400px] overflow-hidden rounded-[32px] border-2 border-black bg-white shadow-[0_30px_60px_rgba(0,0,0,0.25)]"
      >
        <!-- Header -->
        <div class="flex items-center gap-4 border-b-2 border-black bg-white p-5">
          <div class="relative">
            <div class="w-12 h-12 rounded-full border-2 border-black bg-gray-50 overflow-hidden flex items-center justify-center p-1">
              <img src="assets/images/rotbot4.png" class="w-full h-full object-contain" alt="Rotbot">
            </div>
            <div class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-black"></div>
          </div>
          <div>
            <h3 class="font-headline text-2xl uppercase tracking-widest text-black leading-none">Rotbot Assistant</h3>
            <div class="flex items-center gap-1.5 mt-1">
               <span class="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></span>
               <p class="text-[9px] uppercase tracking-[0.2em] text-black/60">En línea ahora</p>
            </div>
          </div>
        </div>

        <!-- Messages Area -->
        <div #scrollContainer class="h-[380px] overflow-y-auto p-6 space-y-6 scroll-smooth bg-[#fdfdfd]">
          <div *ngFor="let msg of messages" [ngClass]="{'flex justify-end': msg.role === 'user'}">
            <div 
              [ngClass]="{
                'bg-white border-2 border-black text-black rounded-[24px] rounded-tl-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]': msg.role === 'assistant',
                'bg-black text-white rounded-[24px] rounded-tr-none shadow-lg': msg.role === 'user'
              }"
              class="max-w-[85%] p-4 text-[13px] font-medium leading-relaxed tracking-tight"
            >
              {{ msg.content }}
            </div>
          </div>
          <!-- Typing Indicator -->
          <div *ngIf="isTyping" class="flex items-center gap-1 text-black p-4 bg-white border-2 border-black w-fit rounded-[24px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div class="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></div>
            <div class="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div class="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:0.4s]"></div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="border-t-2 border-black bg-white p-6">
          <form (submit)="sendMessage()" class="relative">
            <input 
              type="text" 
              [(ngModel)]="userInput"
              name="userInput"
              placeholder="Pregúntale algo a Rotbot..."
              class="w-full rounded-[18px] border-2 border-black bg-white p-4 pr-12 text-sm text-black font-bold transition-all focus:ring-0 focus:outline-none placeholder:text-black/30 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
            <button 
              type="submit"
              [disabled]="!userInput.trim()"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-black transition-transform hover:scale-110 disabled:opacity-20"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
          <div class="flex justify-center mt-4">
             <span class="text-[8px] uppercase tracking-[0.4em] text-black/40">Powered by PortaLink & Rotbot AI</span>
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
    ::-webkit-scrollbar {
      width: 6px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.2);
    }
  `],
  animations: [
    trigger('chatAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(30px) scale(0.9)', opacity: 0 }),
        animate('600ms cubic-bezier(0.16, 1, 0.3, 1)', style({ transform: 'translateY(0) scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('400ms cubic-bezier(0.16, 1, 0.3, 1)', style({ transform: 'translateY(30px) scale(0.9)', opacity: 0 }))
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
    { role: 'assistant', content: '¡Hola! Soy Rotbot, tu asistente personal. ¿Quieres ver un estilo de portafolio específico? Prueba escribiendo "luxury", "minimal" o "brutalist".' }
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
