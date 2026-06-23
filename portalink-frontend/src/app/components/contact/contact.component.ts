import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { MagneticDirective } from '../../shared/directives/magnetic.directive';

@Component({
    selector: 'app-contact',
    standalone: true,
    imports: [CommonModule, RevealDirective, MagneticDirective],
    template: `
    <section id="contact" class="py-20 md:py-32 px-6 pb-32 md:pb-20">
      <div class="container mx-auto">
        <div class="max-w-5xl mx-auto glass-card p-12 md:p-20 relative overflow-hidden border" style="border-color: var(--card-border);" appReveal>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <!-- Left Side: Text -->
            <div>
              <div class="flex items-center gap-4 mb-4">
                <div class="h-px w-12" style="background-color: var(--text-primary); opacity: 0.4;"></div>
                <span class="text-xs uppercase tracking-[0.4em]" style="color: var(--text-secondary);">{{ getTranslation().subtitle }}</span>
              </div>
              <h2 class="text-5xl md:text-7xl mb-12" style="color: var(--text-primary);" [innerHTML]="getTranslation().title"></h2>
              
              <div class="space-y-8">
                <div>
                  <span class="text-[10px] uppercase tracking-widest block mb-2" style="color: var(--text-secondary); opacity: 0.7;">{{ getTranslation().emailMe }}</span>
                  <a [href]="'mailto:' + (data?.email || 'hola@santiago.dev')" class="text-2xl transition-colors hover:opacity-80" style="color: var(--text-primary);">{{ data?.email || 'hola@santiago.dev' }}</a>
                </div>
                
                <div class="flex gap-6 pt-8">
                  <a *ngFor="let social of data?.social || defaultSocials" [href]="social.url" target="_blank"
                     class="w-12 h-12 rounded-none flex items-center justify-center group transition-all border hover:opacity-85"
                     style="border-color: var(--card-border); background: var(--card-bg);"
                     appMagnetic [appMagnetic]="0.2">
                     <span class="text-[10px] font-bold transition-colors" style="color: var(--text-primary);">{{ social.platform.substring(0, 2).toUpperCase() }}</span>
                  </a>
                </div>
              </div>
            </div>

            <!-- Right Side: Form (Only if active) -->
            <form class="space-y-10" *ngIf="data?.formActive !== false">
              <div class="relative group">
                <input type="text" placeholder=" " class="peer w-full bg-transparent border-b py-4 focus:outline-none transition-colors placeholder-transparent" style="border-color: var(--card-border); color: var(--text-primary);" />
                <label class="absolute left-0 top-4 uppercase tracking-widest text-xs pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-[10px] peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-[10px]" style="color: var(--text-secondary);">{{ getTranslation().labelName }}</label>
              </div>

              <div class="relative group">
                <input type="email" placeholder=" " class="peer w-full bg-transparent border-b py-4 focus:outline-none transition-colors placeholder-transparent" style="border-color: var(--card-border); color: var(--text-primary);" />
                <label class="absolute left-0 top-4 uppercase tracking-widest text-xs pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-[10px] peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-[10px]" style="color: var(--text-secondary);">{{ getTranslation().labelEmail }}</label>
              </div>

              <div class="relative group">
                <textarea rows="4" placeholder=" " class="peer w-full bg-transparent border-b py-4 focus:outline-none transition-colors placeholder-transparent resize-none" style="border-color: var(--card-border); color: var(--text-primary);"></textarea>
                <label class="absolute left-0 top-4 uppercase tracking-widest text-xs pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-[10px] peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-[10px]" style="color: var(--text-secondary);">{{ getTranslation().labelMessage }}</label>
              </div>

              <button type="button" class="btn-primary-custom w-full group" appMagnetic [appMagnetic]="0.1">
                <span class="uppercase tracking-[0.3em] font-bold text-xs">{{ getTranslation().btnSend }}</span>
              </button>
            </form>
            
            <div *ngIf="data?.formActive === false" class="flex items-center justify-center border p-10" style="border-color: var(--card-border); background: var(--card-bg);">
              <p class="text-center italic text-sm" style="color: var(--text-secondary);">{{ getTranslation().formDisabled }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
    styles: [`
    .glass-card { background: var(--card-bg); backdrop-filter: blur(10px); }
    .btn-primary-custom {
      background: var(--text-primary); color: var(--bg-primary); border-radius: 0px; padding: 1.25rem; transition: all 0.3s; border: 1px solid var(--text-primary);
    }
    .btn-primary-custom:hover { background: transparent; color: var(--text-primary); transform: scale(1.02); }
  `]
})
export class ContactComponent implements OnInit, OnDestroy {
  @Input() data: any;

  currentLanguage = 'es';

  translations: any = {
    es: {
      subtitle: 'Conectar',
      title: 'Construyamos <br/><span style="color: var(--text-primary);">algo grandioso.</span>',
      emailMe: 'Escríbeme',
      labelName: 'Nombre',
      labelEmail: 'Email',
      labelMessage: 'Mensaje',
      btnSend: 'Enviar mensaje',
      formDisabled: 'El formulario de contacto está temporalmente desactivado. Por favor, usa el email directo.'
    },
    en: {
      subtitle: 'Connect',
      title: "Let's build <br/><span style=\"color: var(--text-primary);\">something great.</span>",
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
}
