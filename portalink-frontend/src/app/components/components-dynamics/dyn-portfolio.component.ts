import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dyn-portfolio',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <section class="py-20 overflow-hidden bg-neutral-900">
      <div class="container mx-auto px-6 mb-12">
        <h2 class="text-4xl md:text-5xl font-bold uppercase tracking-tight text-white mb-4">
          {{ config?.title || 'Proyectos' }}
        </h2>
        <p class="text-neutral-400 max-w-2xl">
          {{ config?.description || 'Una selección de mis trabajos más recientes.' }}
        </p>
      </div>
      
      <!-- Fake Carousel -->
      <div class="flex gap-6 overflow-x-auto no-scrollbar px-6 pb-8">
        <div *ngFor="let item of [1,2,3]" class="w-[300px] h-[400px] bg-neutral-800 rounded-2xl shrink-0 flex items-center justify-center border border-neutral-700">
          <span class="text-neutral-500 uppercase tracking-widest text-sm">Proyecto {{ item }}</span>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class DynPortfolioComponent implements OnInit {
  @Input() config: any;

  ngOnInit() {
  }
}
