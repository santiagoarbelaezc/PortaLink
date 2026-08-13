import { Component, Input, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { MessagesService } from '../../services/messages.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, RevealDirective],
  encapsulation: ViewEncapsulation.None,
  template: `
    <section id="contact" class="relative py-16 md:py-24 px-6 sm:px-12 lg:px-20 bg-white text-neutral-900 transition-colors duration-500">
      <div class="max-w-[1500px] mx-auto">
        
        <!-- Grand Showcase Container (Matching Hero Video & Project Showcase cards width & style) -->
        <div class="w-full rounded-[28px] sm:rounded-[40px] border border-neutral-200/80 bg-white p-8 sm:p-14 lg:p-20 shadow-[0_10px_35px_rgba(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] relative overflow-hidden" appReveal>
          
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            <!-- Left Column: Title, Description, Direct Email & Social Buttons -->
            <div class="lg:col-span-5 space-y-6">
              
              <div>
                <h2 class="text-3xl sm:text-4xl lg:text-5xl font-headline font-semibold tracking-tight leading-[1.1]" style="color: #0a0a0a !important;">
                  {{ getTranslation().title }}
                </h2>
              </div>

              <p class="text-base sm:text-lg font-sans font-normal text-neutral-600 leading-relaxed">
                {{ getTranslation().description }}
              </p>

              <div class="pt-4 space-y-6">
                <div>
                  <span class="text-xs font-headline font-semibold uppercase tracking-wider text-neutral-400 block mb-2">
                    {{ getTranslation().emailMe }}
                  </span>
                  <a href="mailto:arbelaezz.c11@gmail.com" class="text-xl sm:text-2xl font-headline font-medium text-neutral-900 hover:text-neutral-600 transition-colors no-underline" style="color: #0a0a0a !important;">
                    arbelaezz.c11@gmail.com
                  </a>
                </div>

                <!-- Social Links Buttons -->
                <div class="flex items-center gap-3 pt-2">
                  <a *ngFor="let social of data?.social || defaultSocials" [href]="social.url" target="_blank"
                     class="w-12 h-12 rounded-xl border border-neutral-200/80 bg-neutral-100 text-neutral-900 hover:bg-[#09090b] hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm hover:scale-105"
                     [title]="social.platform">
                     <svg *ngIf="social.platform.toLowerCase() === 'linkedin'" class="w-5 h-5 text-current" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                     </svg>
                     <svg *ngIf="social.platform.toLowerCase() === 'github'" class="w-5 h-5 text-current" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                     </svg>
                     <span *ngIf="social.platform.toLowerCase() !== 'linkedin' && social.platform.toLowerCase() !== 'github'" class="text-xs font-headline font-semibold text-current">
                       {{ social.platform.substring(0, 2).toUpperCase() }}
                     </span>
                  </a>
                </div>
              </div>

            </div>

            <!-- Right Column: Interactive Form -->
            <div class="lg:col-span-7 w-full">
              <form class="space-y-5" *ngIf="data?.formActive !== false" (ngSubmit)="onSubmit()">
                
                <div>
                  <label class="block text-xs font-headline font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                    {{ getTranslation().labelName }}
                  </label>
                  <input type="text" name="nombre" [(ngModel)]="formData.nombre" 
                         placeholder="Ej. Carlos Mendoza" 
                         class="w-full rounded-xl border border-neutral-200/90 bg-neutral-50 px-4 py-3.5 text-sm font-sans text-neutral-900 focus:bg-white focus:border-neutral-900 focus:outline-none transition-all placeholder:text-neutral-400" required />
                </div>

                <div>
                  <label class="block text-xs font-headline font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                    {{ getTranslation().labelEmail }}
                  </label>
                  <input type="email" name="correo" [(ngModel)]="formData.correo" 
                         placeholder="carlos@ejemplo.com" 
                         class="w-full rounded-xl border border-neutral-200/90 bg-neutral-50 px-4 py-3.5 text-sm font-sans text-neutral-900 focus:bg-white focus:border-neutral-900 focus:outline-none transition-all placeholder:text-neutral-400" required />
                </div>

                <div>
                  <label class="block text-xs font-headline font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                    {{ getTranslation().labelMessage }}
                  </label>
                  <textarea name="mensaje" [(ngModel)]="formData.mensaje" rows="4" 
                            placeholder="Cuéntanos los detalles de tu proyecto o idea..." 
                            class="w-full rounded-xl border border-neutral-200/90 bg-neutral-50 px-4 py-3.5 text-sm font-sans text-neutral-900 focus:bg-white focus:border-neutral-900 focus:outline-none transition-all placeholder:text-neutral-400 resize-none" required></textarea>
                </div>

                <button type="submit" [disabled]="isSubmitting" 
                        class="w-full py-4 px-8 rounded-xl font-headline font-medium text-xs tracking-wider transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 border-none disabled:opacity-50"
                        style="background-color: #09090b !important; color: #ffffff !important;">
                  <span style="color: #ffffff !important; font-weight: 500;">
                    {{ isSubmitting ? 'Enviando...' : getTranslation().btnSend }}
                  </span>
                  <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="color: #ffffff !important;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                  </svg>
                </button>
                
                <div *ngIf="showSuccess" class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-headline font-semibold text-center mt-3">
                  ¡Mensaje enviado con éxito! Nos pondremos en contacto muy pronto.
                </div>

              </form>
              
              <div *ngIf="data?.formActive === false" class="flex items-center justify-center p-10 rounded-2xl border border-neutral-200 bg-neutral-50">
                <p class="text-center italic text-sm text-neutral-600">{{ getTranslation().formDisabled }}</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class ContactComponent implements OnInit, OnDestroy {
  @Input() data: any;

  currentLanguage = 'es';

  formData = {
    nombre: '',
    correo: '',
    mensaje: ''
  };

  isSubmitting = false;
  showSuccess = false;

  translations: any = {
    es: {
      subtitle: 'Contacto',
      title: 'Hablemos de tu próximo proyecto',
      description: 'Déjanos tu mensaje y nos pondremos en contacto contigo lo antes posible para hacer realidad tu visión digital.',
      emailMe: 'Escríbeme directamente:',
      labelName: 'Tu nombre',
      labelEmail: 'Correo electrónico',
      labelMessage: '¿En qué podemos ayudarte?',
      btnSend: 'Enviar mensaje',
      formDisabled: 'El formulario de contacto está temporalmente desactivado. Por favor, usa el email directo.'
    },
    en: {
      subtitle: 'Contact',
      title: "Let's talk about your next project",
      description: 'Leave us a message and we will get back to you as soon as possible to bring your digital vision to life.',
      emailMe: 'Email me directly:',
      labelName: 'Your name',
      labelEmail: 'Email address',
      labelMessage: 'How can we help you?',
      btnSend: 'Send message',
      formDisabled: 'The contact form is temporarily disabled. Please use direct email.'
    }
  };

  defaultSocials = [
    { platform: 'LinkedIn', url: '#' },
    { platform: 'GitHub', url: '#' }
  ];

  constructor(private messagesService: MessagesService) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.currentLanguage = localStorage.getItem('portfolio-language') || 'es';
      window.addEventListener('portfolio-language-change', this.onLanguageChange);
    }
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('portfolio-language-change', this.onLanguageChange);
    }
  }

  onLanguageChange = (event: any) => {
    this.currentLanguage = event.detail.language;
  };

  getTranslation() {
    return this.translations[this.currentLanguage] || this.translations['es'];
  }

  onSubmit() {
    if (!this.formData.nombre || !this.formData.correo || !this.formData.mensaje) return;

    this.isSubmitting = true;
    this.showSuccess = false;

    this.messagesService.sendMessage(this.formData).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.showSuccess = true;
        this.formData = { nombre: '', correo: '', mensaje: '' };
        setTimeout(() => this.showSuccess = false, 5000);
      },
      error: (err) => {
        this.isSubmitting = false;
        alert('Error al enviar el mensaje. Inténtalo nuevamente.');
      }
    });
  }
}
