import { Component, Input } from '@angular/core';
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
        <div class="max-w-5xl mx-auto glass-card p-12 md:p-20 relative overflow-hidden border border-white/10" appReveal>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <!-- Left Side: Text -->
            <div>
              <div class="flex items-center gap-4 mb-4">
                <div class="h-px w-12 bg-white/50"></div>
                <span class="text-white/50 text-xs uppercase tracking-[0.4em]">Connect</span>
              </div>
              <h2 class="text-5xl md:text-7xl mb-12">Let's build <br/><span class="text-white">something great.</span></h2>
              
              <div class="space-y-8">
                <div>
                  <span class="text-[10px] uppercase tracking-widest text-white/30 block mb-2">Email me</span>
                  <a [href]="'mailto:' + (data?.email || 'hola@santiago.dev')" class="text-2xl hover:text-white/80 transition-colors">{{ data?.email || 'hola@santiago.dev' }}</a>
                </div>
                
                <div class="flex gap-6 pt-8">
                  <a *ngFor="let social of data?.social || defaultSocials" [href]="social.url" target="_blank"
                     class="w-12 h-12 rounded-none glass flex items-center justify-center group hover:border-white transition-all border border-white/10"
                     appMagnetic [appMagnetic]="0.2">
                    <span class="text-[10px] font-bold group-hover:text-white transition-colors">{{ social.platform.substring(0, 2).toUpperCase() }}</span>
                  </a>
                </div>
              </div>
            </div>

            <!-- Right Side: Form (Only if active) -->
            <form class="space-y-10" *ngIf="data?.formActive !== false">
              <div class="relative group">
                <input type="text" placeholder=" " class="peer w-full bg-transparent border-b border-white/10 py-4 focus:outline-none focus:border-white transition-colors placeholder-transparent" />
                <label class="absolute left-0 top-4 text-white/30 uppercase tracking-widest text-xs pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-[10px] peer-focus:text-white peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-[10px]">Name</label>
              </div>

              <div class="relative group">
                <input type="email" placeholder=" " class="peer w-full bg-transparent border-b border-white/10 py-4 focus:outline-none focus:border-white transition-colors placeholder-transparent" />
                <label class="absolute left-0 top-4 text-white/30 uppercase tracking-widest text-xs pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-[10px] peer-focus:text-white peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-[10px]">Email</label>
              </div>

              <div class="relative group">
                <textarea rows="4" placeholder=" " class="peer w-full bg-transparent border-b border-white/10 py-4 focus:outline-none focus:border-white transition-colors placeholder-transparent resize-none"></textarea>
                <label class="absolute left-0 top-4 text-white/30 uppercase tracking-widest text-xs pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-[10px] peer-focus:text-white peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-[10px]">Message</label>
              </div>

              <button type="button" class="btn-primary-custom w-full group" appMagnetic [appMagnetic]="0.1">
                <span class="uppercase tracking-[0.3em] font-bold text-xs">Send Message</span>
              </button>
            </form>
            
            <div *ngIf="data?.formActive === false" class="flex items-center justify-center border border-white/5 rounded-2xl p-10 bg-white/5">
              <p class="text-white/40 text-center italic">El formulario de contacto está temporalmente desactivado. Por favor, usa el email directo.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
    styles: [`
    .glass-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); }
    .btn-primary-custom {
      background: white; color: black; border-radius: 0px; padding: 1.25rem; transition: all 0.3s; border: 1px solid white;
    }
    .btn-primary-custom:hover { background: transparent; color: white; transform: scale(1.02); }
  `]
})
export class ContactComponent {
  @Input() data: any;
  
  defaultSocials = [
    { platform: 'LinkedIn', url: '#' },
    { platform: 'GitHub', url: '#' }
  ];
}
