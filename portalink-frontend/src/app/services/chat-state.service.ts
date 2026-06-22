import { Injectable } from '@angular/core';

export interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatStateService {
  messages: ChatMessage[] = [
    { role: 'assistant', content: '¡Hola! Cuéntame qué tipo de sistema tienes en mente, o pregúntame cómo podemos integrar IA en tu próximo proyecto. ¿En qué te puedo ayudar hoy?' }
  ];
  isTyping = false;
  userInput = '';

  addMessage(role: 'assistant' | 'user', content: string) {
    this.messages.push({ role, content });
  }

  clear() {
    this.messages = [
      { role: 'assistant', content: '¡Hola! Cuéntame qué tipo de sistema tienes en mente, o pregúntame cómo podemos integrar IA en tu próximo proyecto. ¿En qué te puedo ayudar hoy?' }
    ];
    this.isTyping = false;
    this.userInput = '';
  }
}
