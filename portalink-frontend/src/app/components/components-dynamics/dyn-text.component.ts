import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dyn-text',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <section class="py-16 md:py-24 px-6 relative">
      <div class="container mx-auto max-w-4xl text-center">
        <h3 *ngIf="config?.title" class="text-3xl md:text-5xl font-bold uppercase tracking-tight text-white mb-6">
          {{ config.title }}
        </h3>
        <div *ngIf="config?.content" class="text-base md:text-xl text-neutral-400 leading-relaxed" [innerHTML]="config.content">
        </div>
      </div>
    </section>
  `,
  styles: []
})
export class DynTextComponent implements OnInit {
  @Input() config: any;

  ngOnInit() {
  }
}
