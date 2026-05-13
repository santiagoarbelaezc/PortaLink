import { Component, ElementRef, ViewChild, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { trigger, transition, style, animate, state } from '@angular/animations';
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
        class="group relative flex h-16 w-16 items-center justify-center rounded-full bg-black text-white shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95"
        [ngClass]="{'rotate-90': isOpen}"
      >
        <!-- Animated Border -->
        <div class="absolute inset-0 rounded-full bg-gradient-to-tr from-accent-cyan via-white/20 to-accent-cyan opacity-0 transition-opacity duration-500 group-hover:opacity-100 animate-spin-slow"></div>
        
        <div class="relative flex items-center justify-center">
          <!-- Sparkle Icon -->
          <svg *ngIf="!isOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-all duration-500">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            <path d="M5 3v4"/><path d="M3 5h4"/><path d="M21 17v4"/><path d="M19 19h4"/>
          </svg>
          <!-- Close Icon -->
          <svg *ngIf="isOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-all duration-500">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>
      </button>

      <!-- Chat Panel -->
      <div 
        *ngIf="isOpen"
        [@chatAnimation]
        class="absolute bottom-20 right-0 w-[350px] md:w-[400px] overflow-hidden rounded-[32px] border border-white/10 bg-black/80 shadow-2xl backdrop-blur-2xl"
      >
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-white/5 bg-white/5 p-6">
          <div>
            <h3 class="font-headline text-xl uppercase tracking-wider text-white">Assistant AI</h3>
            <p class="text-[10px] uppercase tracking-[0.2em] text-accent-cyan">Powered by PortaLink</p>
          </div>
          <div class="flex h-2 w-2 rounded-full bg-accent-cyan animate-pulse"></div>
        </div>

        <!-- Messages Area -->
        <div #scrollContainer class="h-[400px] overflow-y-auto p-6 space-y-4 scroll-smooth">
          <div *ngFor="let msg of messages" [ngClass]="{'flex justify-end': msg.role === 'user'}">
            <div 
              [ngClass]="{
                'bg-white/5 text-white/80 rounded-2xl rounded-tl-none': msg.role === 'assistant',
                'bg-accent-cyan text-white rounded-2xl rounded-tr-none': msg.role === 'user'
              }"
              class="max-w-[80%] p-4 text-sm leading-relaxed shadow-sm"
            >
              {{ msg.content }}
            </div>
          </div>
          <!-- Typing Indicator -->
          <div *ngIf="isTyping" class="flex items-center gap-1 text-white/20 p-4 bg-white/5 w-fit rounded-2xl">
            <div class="w-1 h-1 bg-current rounded-full animate-bounce"></div>
            <div class="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div class="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0.4s]"></div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="border-top border-white/5 bg-white/5 p-6">
          <form (submit)="sendMessage()" class="relative">
            <input 
              type="text" 
              [(ngModel)]="userInput"
              name="userInput"
              placeholder="Pregúntame por estilos..."
              class="w-full rounded-2xl border border-white/10 bg-black/40 p-4 pr-12 text-sm text-white transition-all focus:border-accent-cyan/50 focus:outline-none focus:ring-1 focus:ring-accent-cyan/50"
            />
            <button 
              type="submit"
              [disabled]="!userInput.trim()"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-accent-cyan disabled:opacity-20"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --accent-cyan: #00F5FF;
    }
    .animate-spin-slow {
      animation: spin 8s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    ::-webkit-scrollbar {
      width: 4px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
    }
  `],
  animations: [
    trigger('chatAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(20px) scale(0.95)', opacity: 0 }),
        animate('400ms cubic-bezier(0.16, 1, 0.3, 1)', style({ transform: 'translateY(0) scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.16, 1, 0.3, 1)', style({ transform: 'translateY(20px) scale(0.95)', opacity: 0 }))
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
    { role: 'assistant', content: '¡Hola! Soy tu asistente de diseño. Escribe un estilo (ej: minimal, luxury, brutalist) para ver la magia.' }
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
        content: `Perfecto. Explorando el estilo ${detectedStyle || 'personalizado'}. ¡Vamos al showcase!` 
      });

      // Redirect after a small delay
      setTimeout(() => {
        this.router.navigate(['/design-showcase'], { 
          queryParams: { style: detectedStyle || 'luxury' } 
        });
        this.isOpen = false;
      }, 1000);
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
