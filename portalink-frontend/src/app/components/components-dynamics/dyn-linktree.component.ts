import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dyn-linktree',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <section class="min-h-screen w-full flex items-center justify-center py-20 px-4 relative overflow-hidden bg-neutral-900">
      <div class="relative z-10 w-full max-w-md mx-auto flex flex-col items-center">
        <!-- Profile -->
        <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-5 border-2 border-white/20">
          <img [src]="(config?.avatarImage || 'assets/images/fotos/link-principal.jpg').startsWith('assets/') ? (config?.avatarImage || 'assets/images/fotos/link-principal.jpg') : 'assets/images/' + (config?.avatarImage || 'assets/images/fotos/link-principal.jpg')" alt="Profile" class="w-full h-full object-cover">
        </div>
        
        <h1 class="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white mb-2 text-center">
          {{ config?.profileName || 'Nombre' }}
        </h1>
        
        <p class="text-sm sm:text-base text-neutral-400 mb-10 text-center font-medium tracking-wide">
          {{ config?.profileTitle || 'Título' }}
        </p>

        <!-- Links -->
        <div class="w-full space-y-4">
          <a *ngFor="let item of config?.items" [href]="item.url" target="_blank"
             class="group relative w-full flex items-center p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all duration-300">
            
            <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white mr-4 group-hover:scale-110 transition-transform">
              <span class="text-xs uppercase">{{ item.icon?.substring(0,2) || 'LK' }}</span>
            </div>
            
            <div class="flex-grow">
              <h2 class="text-base font-bold text-white mb-0.5">{{ item.title }}</h2>
              <p class="text-xs text-neutral-400">{{ item.subtitle }}</p>
            </div>
            
            <svg class="w-5 h-5 text-neutral-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  `,
  styles: []
})
export class DynLinktreeComponent implements OnInit {
  @Input() config: any;

  ngOnInit() {
  }
}
