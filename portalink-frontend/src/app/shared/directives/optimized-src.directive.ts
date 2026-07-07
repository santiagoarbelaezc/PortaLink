import { Directive, ElementRef, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { ImageOptimizerService } from '../../services/image-optimizer.service';

@Directive({
  selector: 'img[appOptimizedSrc]',
  standalone: true
})
export class OptimizedSrcDirective implements OnChanges {
  @Input() appOptimizedSrc: string = '';
  @Input() maxWidth: number = 1200;
  @Input() quality: number = 0.75;

  private el = inject(ElementRef<HTMLImageElement>);
  private optimizer = inject(ImageOptimizerService);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appOptimizedSrc'] && this.appOptimizedSrc) {
      // Configurar imagen inicial o desde caché
      this.el.nativeElement.src = this.optimizer.getCachedOrOriginal(
        this.appOptimizedSrc,
        this.maxWidth,
        this.quality
      );
      
      this.optimizer.optimize(this.appOptimizedSrc, this.maxWidth, this.quality).subscribe({
        next: (optimizedUrl) => {
          if (optimizedUrl && optimizedUrl !== this.el.nativeElement.src) {
            this.el.nativeElement.src = optimizedUrl;
          }
        },
        error: () => {
          this.el.nativeElement.src = this.appOptimizedSrc;
        }
      });
    }
  }
}
