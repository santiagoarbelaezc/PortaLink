import { Component, Input, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { MagneticDirective } from '../../shared/directives/magnetic.directive';
import { MessagesService } from '../../services/messages.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, RevealDirective, MagneticDirective],
  encapsulation: ViewEncapsulation.None,
  template: `
    <section id="contact" class="py-10 md:py-16 px-6">
      <div class="container mx-auto">
        <div class="max-w-[1400px] mx-auto glass-card p-12 md:p-20 relative overflow-hidden border" style="border-color: var(--card-border);" appReveal>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <!-- Left Side: Text -->
            <div class="relative">
              <div class="flex items-center gap-4 mb-4">
                <div class="h-px w-12" style="background-color: var(--text-primary); opacity: 0.4;"></div>
                <span class="text-xs uppercase tracking-[0.4em]" style="color: var(--text-secondary);">{{ getTranslation().subtitle }}</span>
              </div>
              <h2 class="text-4xl sm:text-5xl md:text-[75px] lg:text-[54px] xl:text-[72px] 2xl:text-[80px] font-headline uppercase leading-[0.95] tracking-tighter mb-12 hero-title relative z-10 pointer-events-none" [innerHTML]="getTranslation().title"></h2>
              
              <div class="space-y-8 relative z-20">
                <div>
                  <span class="text-[10px] uppercase tracking-widest block mb-2" style="color: var(--text-secondary); opacity: 0.7;">{{ getTranslation().emailMe }}</span>
                  <a href="mailto:arbelaezz.c11@gmail.com" class="text-2xl transition-colors hover:opacity-80 font-medium" style="color: var(--text-primary);">arbelaezz.c11@gmail.com</a>
                </div>
                
                <div class="flex gap-6 pt-8">
                  <a *ngFor="let social of data?.social || defaultSocials" [href]="social.url" target="_blank"
                     class="w-12 h-12 rounded-full flex items-center justify-center group transition-all contact-social-btn"
                     appMagnetic [appMagnetic]="0.2">
                     <!-- If LinkedIn -->
                     <svg *ngIf="social.platform.toLowerCase() === 'linkedin'" class="w-5 h-5 transition-colors" fill="currentColor" viewBox="0 0 24 24" style="color: var(--text-primary);">
                       <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                     </svg>
                     <!-- If GitHub -->
                     <svg *ngIf="social.platform.toLowerCase() === 'github'" class="w-5 h-5 transition-colors" fill="currentColor" viewBox="0 0 24 24" style="color: var(--text-primary);">
                       <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                     </svg>
                     <!-- Default fallback -->
                     <span *ngIf="social.platform.toLowerCase() !== 'linkedin' && social.platform.toLowerCase() !== 'github'" class="text-[10px] font-bold transition-colors" style="color: var(--text-primary);">
                       {{ social.platform.substring(0, 2).toUpperCase() }}
                     </span>
                  </a>
                </div>
              </div>
            </div>

            <!-- Right Side: Form (Only if active) -->
            <form class="space-y-8 relative z-0" *ngIf="data?.formActive !== false" (ngSubmit)="onSubmit()">
              <div class="relative group">
                <input type="text" name="nombre" [(ngModel)]="formData.nombre" placeholder=" " class="contact-input peer w-full focus:outline-none" required />
                <label class="contact-label">{{ getTranslation().labelName }}</label>
              </div>

              <div class="relative group">
                <input type="email" name="correo" [(ngModel)]="formData.correo" placeholder=" " class="contact-input peer w-full focus:outline-none" required />
                <label class="contact-label">{{ getTranslation().labelEmail }}</label>
              </div>

              <div class="relative group">
                <textarea name="mensaje" [(ngModel)]="formData.mensaje" rows="4" placeholder=" " class="contact-input peer w-full focus:outline-none resize-none" required></textarea>
                <label class="contact-label">{{ getTranslation().labelMessage }}</label>
              </div>

              <button type="submit" [disabled]="isSubmitting" class="btn-primary-custom w-full group disabled:opacity-50">
                <span class="uppercase tracking-[0.3em] font-bold text-xs">
                  {{ isSubmitting ? 'Enviando...' : getTranslation().btnSend }}
                </span>
              </button>
              
              <div *ngIf="showSuccess" class="text-green-500 text-xs font-bold uppercase tracking-widest text-center mt-4">
                ¡Mensaje enviado con éxito!
              </div>
            </form>
            
            <div *ngIf="data?.formActive === false" class="flex items-center justify-center border p-10 rounded-xl" style="border-color: var(--card-border); background: var(--card-bg);">
              <p class="text-center italic text-sm" style="color: var(--text-secondary);">{{ getTranslation().formDisabled }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .glass-card { background: var(--card-bg); backdrop-filter: blur(10px); }
    
    .contact-input {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1.5rem 1.25rem 0.5rem 1.25rem;
      color: var(--text-primary);
      transition: all 0.3s ease;
      font-size: 0.95rem;
    }
    
    .theme-light .contact-input {
      background: rgba(0, 0, 0, 0.02);
    }
    
    .contact-input:focus {
      border-color: var(--text-primary);
      background: rgba(255, 255, 255, 0.04);
    }
    
    .theme-light .contact-input:focus {
      background: rgba(0, 0, 0, 0.04);
    }
    
    .contact-label {
      position: absolute;
      left: 1.25rem;
      top: 1.1rem;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      pointer-events: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      color: var(--text-primary);
      opacity: 0.55;
      font-weight: 600;
    }
    
    .contact-input:focus ~ .contact-label,
    .contact-input:not(:placeholder-shown) ~ .contact-label {
      top: 0.4rem;
      font-size: 8px;
      opacity: 0.9;
      color: var(--text-primary);
    }
    
    .btn-primary-custom {
      background: var(--text-primary);
      color: var(--bg-primary);
      border-radius: 12px;
      padding: 1.25rem;
      transition: opacity 0.3s ease;
      border: 1px solid var(--text-primary);
    }
    
    .btn-primary-custom:hover {
      opacity: 0.85;
    }
    
    .contact-social-btn {
      border-radius: 9999px;
      transition: all 0.3s ease;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
    }
    
    .contact-social-btn:hover {
      background: var(--text-primary);
      border-color: var(--text-primary);
    }
    
    .contact-social-btn:hover svg {
      color: var(--bg-primary) !important;
    }
  `]
})
export class ContactComponent implements OnInit, OnDestroy {
  @Input() data: any;

  currentLanguage = 'es';

  translations: any = {
    es: {
      subtitle: 'Conectar',
      title: '<span class="title-soy font-light">Construyamos</span> <br/><span class="title-name font-bold italic">tu negocio digital</span>',
      emailMe: 'Escríbeme',
      labelName: 'Nombre',
      labelEmail: 'Email',
      labelMessage: 'Mensaje',
      btnSend: 'Enviar mensaje',
      formDisabled: 'El formulario de contacto está temporalmente desactivado. Por favor, usa el email directo.'
    },
    en: {
      subtitle: 'Connect',
      title: '<span class="title-soy font-light">Let\'s build</span> <br/><span class="title-name font-bold italic">your digital business</span>',
      emailMe: 'Email me',
      labelName: 'Name',
      labelEmail: 'Email',
      labelMessage: 'Message',
      btnSend: 'Send Message',
      formDisabled: 'The contact form is temporarily disabled. Please use the direct email.'
    }
  };

  defaultSocials = [
    { platform: 'LinkedIn', url: '#' },
    { platform: 'GitHub', url: '#' }
  ];

  formData = { nombre: '', correo: '', mensaje: '' };
  isSubmitting = false;
  showSuccess = false;

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
    if (!this.formData.nombre || !this.formData.correo || !this.formData.mensaje) {
      return;
    }

    const email = this.formData.correo.trim().toLowerCase();

    // 1. Validar que contenga @
    if (!email.includes('@')) {
      alert(this.currentLanguage === 'es' ? 'El correo electrónico debe contener un "@".' : 'Email must contain "@".');
      return;
    }

    // 2. Validar que use un dominio de correo válido/común (gmail, hotmail, outlook, etc.)
    const allowedDomains = /@(gmail|hotmail|outlook|live|msn|yahoo|icloud|protonmail|proton|aol|zoho|gmx|yandex)\.[a-zA-Z]{2,}/;
    if (!allowedDomains.test(email)) {
      alert(this.currentLanguage === 'es' ? 
        'Por favor ingresa un correo con un proveedor válido (ej: gmail, hotmail, outlook, yahoo).' : 
        'Please enter an email with a valid provider (e.g. gmail, hotmail, outlook, yahoo).');
      return;
    }
    
    this.isSubmitting = true;
    this.messagesService.sendMessage(this.formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showSuccess = true;
        this.formData = { nombre: '', correo: '', mensaje: '' };
        setTimeout(() => this.showSuccess = false, 5000);
      },
      error: (err) => {
        console.error('Error enviando mensaje', err);
        this.isSubmitting = false;
        alert('Hubo un error al enviar el mensaje. Inténtalo de nuevo más tarde.');
      }
    });
  }
}
