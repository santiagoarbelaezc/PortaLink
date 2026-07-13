import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-landing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full min-h-full font-sans overflow-y-auto overflow-x-hidden selection:bg-cyan-500/30 selection:text-white"
         [ngStyle]="{
           '--accent': siteData?.style?.accentColor || '#00f5ff',
           'background-color': siteData?.style?.colorScheme === 'light' ? '#f8fafc' : '#0a0a0c',
           'color': siteData?.style?.colorScheme === 'light' ? '#0f172a' : '#f8fafc'
         }">
      
      <!-- Top Navigation Bar -->
      <header class="sticky top-0 z-40 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between"
              [ngClass]="siteData?.style?.colorScheme === 'light' ? 'bg-white/80 border-slate-200' : 'bg-black/60 border-white/10'">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full" [ngStyle]="{'background-color': siteData?.style?.accentColor || '#00f5ff'}"></div>
          <span class="font-extrabold tracking-tight text-base">{{ siteData?.hero?.name || 'Mi Marca' }}</span>
        </div>
        <a *ngIf="siteData?.hero?.ctaLink" [href]="siteData?.hero?.ctaLink"
           class="text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-all hover:scale-105"
           [ngStyle]="{
             'background-color': siteData?.style?.accentColor || '#00f5ff',
             'color': getContrastColor(siteData?.style?.accentColor),
             'box-shadow': '0 0 15px ' + (siteData?.style?.accentColor || '#00f5ff') + '40'
           }">
          {{ siteData?.hero?.ctaText || 'Contacto' }}
        </a>
      </header>

      <!-- Hero Section -->
      <section class="relative px-6 py-20 md:py-32 flex flex-col items-center text-center overflow-hidden">
        <!-- Glow background decoration -->
        <div class="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-20"
             [ngStyle]="{'background-color': siteData?.style?.accentColor || '#00f5ff'}"></div>

        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border"
             [ngClass]="siteData?.style?.colorScheme === 'light' ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-white/5 border-white/10 text-slate-300'">
          <span class="w-2 h-2 rounded-full animate-ping" [ngStyle]="{'background-color': siteData?.style?.accentColor || '#00f5ff'}"></span>
          <span>Disponible para proyectos y colaboraciones</span>
        </div>

        <h1 class="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight max-w-3xl mb-6">
          {{ siteData?.hero?.title || 'Innovación & Soluciones Profesionales' }}
        </h1>

        <p class="text-base sm:text-lg md:text-xl max-w-2xl font-light leading-relaxed mb-8 opacity-80">
          {{ siteData?.hero?.subtitle || 'Bienvenido al sitio web oficial.' }}
        </p>

        <div class="flex flex-wrap items-center justify-center gap-4">
          <a *ngIf="siteData?.hero?.ctaLink" [href]="siteData?.hero?.ctaLink"
             class="px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide uppercase transition-all hover:scale-105 active:scale-95 shadow-lg"
             [ngStyle]="{
               'background-color': siteData?.style?.accentColor || '#00f5ff',
               'color': getContrastColor(siteData?.style?.accentColor),
               'box-shadow': '0 10px 25px -5px ' + (siteData?.style?.accentColor || '#00f5ff') + '50'
             }">
            {{ siteData?.hero?.ctaText || 'Comencemos' }}
          </a>
        </div>
      </section>

      <!-- About Section -->
      <section *ngIf="siteData?.about" class="px-6 py-16 max-w-4xl mx-auto">
        <div class="p-8 sm:p-10 rounded-3xl border backdrop-blur-sm"
             [ngClass]="siteData?.style?.colorScheme === 'light' ? 'bg-white/60 border-slate-200' : 'bg-white/[0.03] border-white/10'">
          <span class="text-xs font-bold uppercase tracking-widest opacity-60">Sobre nosotros</span>
          <h2 class="text-2xl sm:text-3xl font-extrabold mt-2 mb-4">
            {{ siteData.about.heading || 'Nuestra historia' }}
          </h2>
          <p class="text-sm sm:text-base leading-relaxed opacity-85 font-normal mb-6">
            {{ siteData.about.text }}
          </p>

          <!-- Highlights Pills -->
          <div *ngIf="siteData.about.highlights?.length" class="flex flex-wrap gap-2.5">
            <span *ngFor="let item of siteData.about.highlights"
                  class="px-3.5 py-1.5 rounded-lg text-xs font-medium border"
                  [ngClass]="siteData?.style?.colorScheme === 'light' ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-white/5 border-white/10 text-slate-200'">
              ✨ {{ item }}
            </span>
          </div>
        </div>
      </section>

      <!-- Services Section -->
      <section *ngIf="siteData?.services?.length" class="px-6 py-16 max-w-5xl mx-auto">
        <div class="text-center mb-12">
          <span class="text-xs font-bold uppercase tracking-widest opacity-60">Servicios</span>
          <h2 class="text-3xl font-black tracking-tight mt-1">Soluciones a Medida</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div *ngFor="let serv of siteData.services"
               class="p-7 rounded-2xl border transition-all duration-300 hover:-translate-y-1"
               [ngClass]="siteData?.style?.colorScheme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/[0.02] border-white/10 hover:border-white/20'">
            
            <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-5 border"
                 [ngClass]="siteData?.style?.colorScheme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'">
              <!-- SVG Icons mapping -->
              <svg *ngIf="serv.icon === 'code'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <svg *ngIf="serv.icon === 'palette'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <svg *ngIf="serv.icon === 'megaphone'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              <svg *ngIf="serv.icon === 'chart'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <svg *ngIf="serv.icon === 'camera'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
              <svg *ngIf="serv.icon !== 'code' && serv.icon !== 'palette' && serv.icon !== 'megaphone' && serv.icon !== 'chart' && serv.icon !== 'camera'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>

            <h3 class="text-lg font-bold mb-2">{{ serv.title }}</h3>
            <p class="text-sm opacity-75 leading-relaxed font-light">{{ serv.description }}</p>
          </div>
        </div>
      </section>

      <!-- Testimonials Section -->
      <section *ngIf="siteData?.testimonials?.length" class="px-6 py-16 max-w-4xl mx-auto">
        <div class="text-center mb-10">
          <span class="text-xs font-bold uppercase tracking-widest opacity-60">Testimonios</span>
          <h2 class="text-3xl font-black tracking-tight mt-1">Lo que dicen nuestros clientes</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div *ngFor="let test of siteData.testimonials"
               class="p-6 rounded-2xl border flex flex-col justify-between"
               [ngClass]="siteData?.style?.colorScheme === 'light' ? 'bg-white border-slate-200' : 'bg-white/[0.03] border-white/10'">
            <p class="text-sm italic opacity-85 leading-relaxed mb-6">"{{ test.text }}"</p>
            <div>
              <p class="font-bold text-sm">{{ test.name }}</p>
              <p class="text-xs opacity-60">{{ test.role }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Contact Section -->
      <section id="contact" *ngIf="siteData?.contact" class="px-6 py-20 max-w-3xl mx-auto text-center">
        <div class="p-8 sm:p-12 rounded-3xl border"
             [ngClass]="siteData?.style?.colorScheme === 'light' ? 'bg-white border-slate-200 shadow-md' : 'bg-white/[0.04] border-white/10'">
          <h2 class="text-3xl font-black mb-3">{{ siteData.contact.heading || 'Contáctanos' }}</h2>
          <p class="text-sm opacity-75 mb-8 max-w-lg mx-auto">{{ siteData.contact.subheading }}</p>

          <div class="flex flex-wrap justify-center gap-6 mb-8 text-sm font-medium">
            <div *ngIf="siteData.contact.email" class="flex items-center gap-2">
              <svg class="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{{ siteData.contact.email }}</span>
            </div>
            <div *ngIf="siteData.contact.phone" class="flex items-center gap-2">
              <svg class="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{{ siteData.contact.phone }}</span>
            </div>
          </div>

          <a *ngIf="siteData.contact.email"
             [href]="'mailto:' + siteData.contact.email"
             class="inline-block px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 shadow-md"
             [ngStyle]="{
               'background-color': siteData?.style?.accentColor || '#00f5ff',
               'color': getContrastColor(siteData?.style?.accentColor)
             }">
            Enviar Correo
          </a>
        </div>
      </section>

      <!-- Footer -->
      <footer class="border-t py-8 text-center text-xs opacity-50"
              [ngClass]="siteData?.style?.colorScheme === 'light' ? 'border-slate-200' : 'border-white/10'">
        <p>© {{ siteData?.hero?.name || 'Creado' }} · Generado con RotBot IA de PortaLink</p>
      </footer>

    </div>
  `
})
export class UserLandingComponent {
  @Input() siteData: any;

  getContrastColor(hexColor?: string): string {
    const hex = (hexColor || '#00f5ff').replace('#', '');
    if (hex.length !== 6) return '#000000';
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
    return luminance < 145 ? '#ffffff' : '#000000';
  }
}
