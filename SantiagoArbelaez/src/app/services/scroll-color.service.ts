import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ScrollColorService {

  // Define the intended background color for each section
  private readonly palette = [
    { id: 'hero',      color: '#FFFFFF' },
    { id: 'portfolio', color: '#080808' },
    { id: 'about',     color: '#F5F5F5' },
    { id: 'skills',    color: '#000000' },
    { id: 'contact',   color: '#080808' },
    { id: 'footer',    color: '#000000' },
  ];

  private positions: { start: number; end: number; color: string }[] = [];

  /** Emits the current interpolated hex color */
  currentColor$ = new BehaviorSubject<string>('#FFFFFF');

  /** Emits true when the current background is dark (needs light text/ui) */
  isDark$ = new BehaviorSubject<boolean>(false);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      // Use setTimeout(0) to defer to next event loop tick after DOM renders
      setTimeout(() => this.init(), 0);
    }
  }

  private init(): void {
    this.recalculate();
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    window.addEventListener('resize', () => this.recalculate(), { passive: true });
  }

  /** Re-measure section positions (call after dynamic content loads) */
  recalculate(): void {
    this.positions = [];
    for (const entry of this.palette) {
      const el = document.getElementById(entry.id);
      if (!el) continue;
      const top = el.getBoundingClientRect().top + window.pageYOffset;
      this.positions.push({ start: top, end: top + el.offsetHeight, color: entry.color });
    }
    if (this.positions.length > 0) {
      this.positions[0].start = 0; // Force hero to start at very top
    }
    this.onScroll();
  }

  /** Transition zone size in pixels — only this many px before section boundary trigger blending */
  private readonly ZONE_PX = 350;

  private onScroll(): void {
    if (!this.positions.length) return;

    // Use the TOP of the viewport + a small nudge as the anchor.
    // This guarantees: at scrollY=0, we are solidly inside section[0] → pure white.
    const Y = window.pageYOffset + window.innerHeight * 0.3;

    for (let i = 0; i < this.positions.length; i++) {
      const curr = this.positions[i];
      const next = this.positions[i + 1];
      const sectionEnd = next ? next.start : Infinity;

      if (Y >= curr.start && Y < sectionEnd) {
        if (!next) {
          // Last section — solid color
          this.emit(curr.color);
          return;
        }

        // Transition zone starts ZONE_PX before the next section boundary
        const transStart = sectionEnd - this.ZONE_PX;

        if (Y < transStart) {
          // Solidly inside current section — pure color, NO grey
          this.emit(curr.color);
        } else {
          // Inside the transition zone — blend to next section's color
          const t = this.easeInOut((Y - transStart) / this.ZONE_PX);
          this.emit(this.interpolate(curr.color, next.color, t));
        }
        return;
      }
    }

    // Fallback: first section color
    this.emit(this.positions[0]?.color ?? '#FFFFFF');
  }

  private emit(color: string): void {
    this.currentColor$.next(color);
    this.isDark$.next(this.getBrightness(color) < 140);
  }

  /** Smooth step easing for more elegant transitions */
  private easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  /** Linear RGB interpolation between two hex colors */
  private interpolate(c1: string, c2: string, t: number): string {
    const r1 = parseInt(c1.slice(1, 3), 16);
    const g1 = parseInt(c1.slice(3, 5), 16);
    const b1 = parseInt(c1.slice(5, 7), 16);
    const r2 = parseInt(c2.slice(1, 3), 16);
    const g2 = parseInt(c2.slice(3, 5), 16);
    const b2 = parseInt(c2.slice(5, 7), 16);
    const r = Math.round(r1 + (r2 - r1) * t).toString(16).padStart(2, '0');
    const g = Math.round(g1 + (g2 - g1) * t).toString(16).padStart(2, '0');
    const b = Math.round(b1 + (b2 - b1) * t).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  /** Calculate perceived brightness (0-255) of a hex color */
  private getBrightness(hex: string): number {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
  }
}
