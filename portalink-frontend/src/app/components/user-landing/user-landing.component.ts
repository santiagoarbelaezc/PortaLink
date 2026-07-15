import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-landing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full min-h-screen transition-all duration-500 flex flex-col justify-start {{ getFontClass() }}"
         [style.background]="getTheme().bg"
         [style.color]="getTheme().primary">
      
      <!-- 1. NAVBAR -->
      <nav *ngIf="shouldShow('includeNavbar')" class="flex items-center justify-between px-6 sm:px-10 py-5 border-b sticky top-0 backdrop-blur-md z-[20]"
           [style.background]="getTheme().bg + 'ee'"
           [style.borderColor]="getTheme().primary + '15'">
        <div class="flex items-center gap-2">
          <span class="text-sm font-bold tracking-wider uppercase">{{ siteData?.hero?.name || siteData?.hero?.title || 'PORTALINK STUDIO' }}</span>
        </div>
        
        <div class="hidden md:flex gap-6 items-center">
          <a *ngIf="shouldShow('includeHero')" href="#hero" class="text-[10px] uppercase tracking-widest font-semibold opacity-70 hover:opacity-100 transition-opacity">INICIO</a>
          <a *ngIf="shouldShow('includeAbout')" href="#about" class="text-[10px] uppercase tracking-widest font-semibold opacity-70 hover:opacity-100 transition-opacity">NOSOTROS</a>
          <a *ngIf="shouldShow('includeServices')" href="#services" class="text-[10px] uppercase tracking-widest font-semibold opacity-70 hover:opacity-100 transition-opacity">SERVICIOS</a>
          <a *ngIf="shouldShow('includeCarousel')" href="#products" class="text-[10px] uppercase tracking-widest font-semibold opacity-70 hover:opacity-100 transition-opacity">PRODUCTOS</a>
          <a *ngIf="shouldShow('includeContact')" href="#contact" class="text-[10px] uppercase tracking-widest font-semibold opacity-70 hover:opacity-100 transition-opacity">CONTACTO</a>
        </div>
        <div class="flex items-center gap-3">
          <a href="#contact" [class]="getButtonStyle()"
                  class="px-5 py-2 text-[10px] uppercase tracking-wider font-bold transition-all hover:scale-105 active:scale-95 shadow-md"
                  [style.background]="getTheme().accent"
                  [style.color]="getAccentTextColor()">
            {{ siteData?.hero?.ctaText || 'Contacto' }}
          </a>
        </div>
      </nav>

      <!-- 2. HERO SECTION -->
      <header *ngIf="shouldShow('includeHero')" id="hero" class="px-6 sm:px-10 py-24 md:py-32 flex flex-col items-center text-center max-w-4xl mx-auto">
        <!-- Subtitle Top Line -->
        <div *ngIf="siteData?.hero?.subtitle" class="inline-block px-4 py-1.5 rounded-full border text-[11px] font-semibold tracking-widest uppercase mb-8"
             [style.borderColor]="getTheme().primary + '25'"
             [style.color]="getTheme().primary">
          {{ siteData?.hero?.subtitle }}
        </div>
        
        <!-- Main Title -->
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight mb-6"
            [style.color]="getTheme().primary">
          {{ siteData?.hero?.title || siteData?.hero?.name || 'INNOVACIÓN & SOLUCIONES PROFESIONALES' }}
        </h1>
        
        <!-- Supporting Description -->
        <p *ngIf="siteData?.hero?.description" class="text-base sm:text-lg max-w-2xl opacity-75 font-light leading-relaxed mb-10"
           [style.color]="getTheme().primary">
          {{ siteData?.hero?.description }}
        </p>

        <!-- Buttons -->
        <div class="flex flex-wrap items-center justify-center gap-4">
          <a href="#contact" [class]="getButtonStyle()"
                  class="px-8 py-4 text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-lg"
                  [style.background]="getTheme().accent"
                  [style.color]="getAccentTextColor()">
            {{ siteData?.hero?.ctaText || 'CONTÁCTAME' }}
          </a>
          <a *ngIf="siteData?.hero?.ctaText2" href="#about" [class]="getButtonStyle()"
                  class="px-8 py-4 text-xs font-bold uppercase tracking-wider border transition-all hover:scale-105 active:scale-95"
                  [style.borderColor]="getTheme().primary + '35'"
                  [style.color]="getTheme().primary">
            {{ siteData?.hero?.ctaText2 }}
          </a>
        </div>
      </header>

      <!-- 3. ABOUT US SECTION -->
      <section *ngIf="shouldShow('includeAbout')" id="about" class="px-6 sm:px-10 py-20 max-w-5xl mx-auto w-full">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span class="text-xs font-bold uppercase tracking-widest opacity-60">NOSOTROS</span>
            <h2 class="text-3xl sm:text-4xl font-extrabold mt-2 mb-6" [style.color]="getTheme().primary">
              {{ siteData?.about?.heading || 'Nuestra Historia & Visión' }}
            </h2>
            <p class="text-sm sm:text-base leading-relaxed opacity-80 mb-6">
              {{ siteData?.about?.text || 'Desarrollando soluciones de software de alto impacto con un diseño excepcional.' }}
            </p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div *ngFor="let stat of getAboutStats()" class="p-6 rounded-2xl border text-center transition-transform hover:-translate-y-1"
                 [ngStyle]="getCardStyles()">
              <span class="text-3xl font-black block mb-1" [style.color]="getTheme().accent">{{ stat.value }}</span>
              <span class="text-xs opacity-70 uppercase tracking-wider">{{ stat.label }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. SERVICES SECTION -->
      <section *ngIf="shouldShow('includeServices') && getServices().length > 0" id="services" class="px-6 sm:px-10 py-20 max-w-6xl mx-auto w-full">
        <div class="text-center mb-16">
          <span class="text-xs font-bold uppercase tracking-widest opacity-60">LO QUE HACEMOS</span>
          <h2 class="text-3xl sm:text-4xl font-black mt-2" [style.color]="getTheme().primary">NUESTROS SERVICIOS</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div *ngFor="let service of getServices()" class="p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
               [ngStyle]="getCardStyles()">
            <div>
              <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-6 font-bold text-lg"
                   [style.background]="getTheme().accent + '22'"
                   [style.color]="getTheme().accent">
                ✨
              </div>
              <h3 class="text-lg font-bold mb-3" [style.color]="getTheme().primary">{{ service.title }}</h3>
              <p class="text-xs leading-relaxed opacity-75">{{ service.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. PRODUCTS / CAROUSEL SECTION -->
      <section *ngIf="shouldShow('includeCarousel') && getProducts().length > 0" id="products" class="px-6 sm:px-10 py-20 max-w-6xl mx-auto w-full">
        <div class="text-center mb-16">
          <span class="text-xs font-bold uppercase tracking-widest opacity-60">EXPLORA NUESTRAS OPCIONES</span>
          <h2 class="text-3xl sm:text-4xl font-black mt-2" [style.color]="getTheme().primary">CATÁLOGO DE PRODUCTOS</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div *ngFor="let prod of getProducts()" class="p-6 rounded-2xl border flex flex-col justify-between"
               [ngStyle]="getCardStyles()">
            <div>
              <span class="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border mb-4 inline-block"
                    [style.borderColor]="getTheme().primary + '25'">
                {{ prod.category || 'Catálogo' }}
              </span>
              <h3 class="text-lg font-bold mb-2" [style.color]="getTheme().primary">{{ prod.title }}</h3>
              <span class="text-xl font-extrabold block mb-4" [style.color]="getTheme().accent">{{ prod.price }}</span>
            </div>
            <a href="#contact" [class]="getButtonStyle()"
                    class="w-full py-2.5 text-center text-[10px] font-bold uppercase tracking-widest border transition-all hover:opacity-90 block"
                    [style.borderColor]="getTheme().primary + '30'"
                    [style.color]="getTheme().primary">
              Comprar Ahora
            </a>
          </div>
        </div>
      </section>

      <!-- 6. PROMOTIONAL BANNER -->
      <section *ngIf="shouldShow('includeBanner') && siteData?.banner?.text" class="px-6 sm:px-10 py-12">
        <div class="max-w-5xl mx-auto p-10 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-6"
             [ngStyle]="getCardStyles()">
          <h3 class="text-xl sm:text-2xl font-bold max-w-xl" [style.color]="getTheme().primary">
            {{ siteData?.banner?.text }}
          </h3>
          <a href="#contact" [class]="getButtonStyle()"
                  class="px-6 py-3 text-xs font-bold uppercase tracking-wider transition-transform hover:scale-105"
                  [style.background]="getTheme().accent"
                  [style.color]="getAccentTextColor()">
            {{ siteData?.banner?.cta || 'Acceder' }}
          </a>
        </div>
      </section>

      <!-- 7. CONTACT SECTION -->
      <section *ngIf="shouldShow('includeContact')" id="contact" class="px-6 sm:px-10 py-20 max-w-4xl mx-auto w-full">
        <div class="p-10 rounded-3xl border" [ngStyle]="getCardStyles()">
          <div class="text-center mb-10">
            <span class="text-xs font-bold uppercase tracking-widest opacity-60">ESCRIBENOS</span>
            <h2 class="text-3xl font-black mt-2" [style.color]="getTheme().primary">
              {{ siteData?.contact?.title || 'Contacto' }}
            </h2>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div *ngIf="siteData?.contact?.email" class="p-5 rounded-2xl border border-neutral-500/20 flex flex-col">
              <span class="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-1">Correo Electrónico</span>
              <a [href]="'mailto:' + siteData.contact.email" class="text-sm font-semibold underline break-all" [style.color]="getTheme().primary">
                {{ siteData.contact.email }}
              </a>
            </div>
            <div *ngIf="siteData?.contact?.phone" class="p-5 rounded-2xl border border-neutral-500/20 flex flex-col">
              <span class="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-1">Teléfono / WhatsApp</span>
              <a [href]="'tel:' + siteData.contact.phone" class="text-sm font-semibold" [style.color]="getTheme().primary">
                {{ siteData.contact.phone }}
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- 8. FOOTER -->
      <footer *ngIf="shouldShow('includeFooter')" class="py-12 border-t text-center px-6"
              [style.borderColor]="getTheme().primary + '15'">
        <p class="text-xs opacity-60 font-medium">
          {{ siteData?.footer?.copy || ('© ' + (siteData?.hero?.name || 'Creado') + ' · Todos los derechos reservados') }}
        </p>
      </footer>
    </div>
  `
})
export class UserLandingComponent {
  @Input() siteData: any;

  shouldShow(key: string): boolean {
    if (this.siteData?.customizations && this.siteData.customizations[key] !== undefined) {
      return !!this.siteData.customizations[key];
    }
    return true;
  }

  getTheme(): any {
    if (this.siteData?.themePreset) {
      return this.siteData.themePreset;
    }
    const styleOrScheme = `${this.siteData?.theme?.style || ''} ${this.siteData?.style?.colorScheme || ''}`.toLowerCase();
    const isLight = styleOrScheme.includes('blanco') || styleOrScheme.includes('white') || styleOrScheme.includes('claro') || styleOrScheme.includes('light') || this.siteData?.style?.colorScheme === 'light';
    const accent = this.siteData?.style?.accentColor || this.siteData?.theme?.accentColor || (isLight ? '#0f172a' : '#00f5ff');

    if (isLight) {
      return {
        id: 'white-minimal',
        name: 'White Executive',
        primary: '#111827',
        bg: '#ffffff',
        cardBg: '#f8fafc',
        accent: accent,
        lightTheme: true
      };
    }

    return {
      id: 'dark-cyber',
      name: 'Cyber Glow',
      primary: '#ffffff',
      bg: '#08080c',
      cardBg: '#111118',
      accent: accent,
      lightTheme: false
    };
  }

  getContrastColor(hexColor?: string): string {
    const hex = (hexColor || '#00f5ff').replace('#', '');
    if (hex.length !== 6) return '#000000';
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
    return luminance < 145 ? '#ffffff' : '#000000';
  }

  getAccentTextColor(): string {
    const theme = this.getTheme();
    return this.getContrastColor(theme?.accent);
  }

  getCardStyles(): any {
    const theme = this.getTheme();
    const borderStyle = this.siteData?.customizations?.cardBorderStyle || 'border-minimal';
    if (borderStyle === 'border-glass') {
      return {
        'background': theme.lightTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(17, 17, 24, 0.65)',
        'border-color': theme.lightTheme ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
        'backdrop-filter': 'blur(24px)'
      };
    }
    return {
      'background': theme.cardBg,
      'border-color': theme.primary + '15',
      'backdrop-filter': 'blur(4px)'
    };
  }

  getButtonStyle(): string {
    return this.siteData?.customizations?.buttonStyle || 'rounded-full';
  }

  getFontClass(): string {
    return this.siteData?.customizations?.selectedFont || 'font-sans';
  }

  getServices(): any[] {
    if (Array.isArray(this.siteData?.services)) {
      return this.siteData.services;
    }
    return [];
  }

  getProducts(): any[] {
    if (Array.isArray(this.siteData?.products)) {
      return this.siteData.products;
    }
    return [];
  }

  getAboutStats(): any[] {
    if (Array.isArray(this.siteData?.about?.stats) && this.siteData.about.stats.length > 0) {
      return this.siteData.about.stats;
    }
    return [
      { value: '100%', label: 'Satisfacción garantizada' },
      { value: '+5', label: 'Años de experiencia' }
    ];
  }
}
