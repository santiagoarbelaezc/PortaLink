import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-footer',
    imports: [CommonModule],
    template: `
    <footer id="footer" class="pt-32 pb-12 px-6 overflow-hidden relative">
      <!-- Large Ghost Text -->
      <div class="absolute bottom-0 left-1/2 -translate-x-1/2 select-none pointer-events-none">
        <h2 class="text-[25vw] font-headline leading-none text-white opacity-[0.02] whitespace-nowrap">
          SANTIAGO 2025
        </h2>
      </div>

      <div class="container mx-auto relative z-10">
        <div class="flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/5 pt-12">
          <div class="text-xs uppercase tracking-[0.4em] text-white/30">
            &copy; 2025 Handcrafted with passion
          </div>
          
          <div class="flex gap-8">
            <a href="#" class="text-[10px] uppercase tracking-widest hover:text-accent-cyan transition-colors">Privacy</a>
            <a href="#" class="text-[10px] uppercase tracking-widest hover:text-accent-cyan transition-colors">Terms</a>
            <a href="#" class="text-[10px] uppercase tracking-widest hover:text-accent-cyan transition-colors">Back to top</a>
          </div>

          <div class="flex items-center gap-3">
             <div class="w-1.5 h-1.5 rounded-full bg-accent-gold"></div>
             <span class="text-xs uppercase tracking-widest italic font-editorial">Luxury Tech & Design</span>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
