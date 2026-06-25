import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dyn-about',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <section class="py-20 md:py-32 px-6 overflow-hidden">
      <div class="container mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          <!-- Image with Clip-path -->
          <div class="relative">
            <div class="aspect-[4/5] overflow-hidden border border-white/20 relative">
              <div class="absolute top-2 left-2 w-3 h-3 border-t border-l border-white/50 z-10"></div>
              <div class="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-white/50 z-10"></div>
              <img [src]="'assets/images/' + (config?.avatarImage || 'about-portrait.png')" alt="Profile" class="w-full h-full object-cover grayscale brightness-75 hover:brightness-100 hover:grayscale-0 transition-all duration-700" />
            </div>
            <div class="absolute -top-4 -right-4 w-20 h-20 border border-white/10 opacity-40"></div>
          </div>

          <!-- Bio Content -->
          <div class="space-y-8">
            <div>
              <div class="flex items-center gap-4 mb-4">
                <div class="h-px w-10" style="background-color: var(--text-primary); opacity: 0.4;"></div>
                <span class="text-[10px] uppercase tracking-[0.4em] font-bold" style="color: var(--text-secondary);">
                  {{ config?.subtitle || 'PERFIL' }}
                </span>
              </div>
              <h2 class="text-5xl sm:text-6xl md:text-[72px] font-headline uppercase leading-[0.95] tracking-tighter mb-6 md:mb-8" [innerHTML]="config?.headline || 'SOBRE MI'"></h2>
            </div>

            <div class="space-y-6 leading-relaxed">
              <p class="text-base md:text-lg max-w-xl mb-10" style="color: var(--text-secondary); line-height: 1.65;">
                {{ config?.text || 'Mi descripción' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: []
})
export class DynAboutComponent implements OnInit {
  @Input() config: any;

  ngOnInit() {
  }
}
