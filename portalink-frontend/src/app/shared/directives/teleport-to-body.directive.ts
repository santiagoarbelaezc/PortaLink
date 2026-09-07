import { Directive, ElementRef, OnInit, OnDestroy, inject, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTeleportToBody]',
  standalone: true
})
export class TeleportToBodyDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  ngOnInit() {
    if (typeof document !== 'undefined' && document.body && this.el.nativeElement) {
      this.renderer.appendChild(document.body, this.el.nativeElement);
    }
  }

  ngOnDestroy() {
    if (typeof document !== 'undefined' && document.body && this.el.nativeElement) {
      if (this.el.nativeElement.parentNode === document.body) {
        this.renderer.removeChild(document.body, this.el.nativeElement);
      }
    }
  }
}
