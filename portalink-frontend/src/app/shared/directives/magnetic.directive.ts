import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appMagnetic]',
  standalone: true
})
export class MagneticDirective {
  @Input('appMagnetic') strength: number | string = 0.5; // Accept string from template if not bound with []

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)');
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    const s = typeof this.strength === 'string' ? parseFloat(this.strength) : this.strength;
    
    const rect = this.el.nativeElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * s;
    const deltaY = (e.clientY - centerY) * s;

    this.renderer.setStyle(this.el.nativeElement, 'transform', `translate(${deltaX}px, ${deltaY}px)`);
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'translate(0, 0)');
  }
}
