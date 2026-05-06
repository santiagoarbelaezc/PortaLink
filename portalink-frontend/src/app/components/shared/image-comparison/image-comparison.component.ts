import { Component, Input, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MagneticDirective } from '../../../shared/directives/magnetic.directive';

@Component({
  selector: 'app-image-comparison',
  standalone: true,
  imports: [CommonModule, MagneticDirective],
  template: `
    <div class="comparison-container rounded-3xl" #container>
      <!-- After Image (Background) -->
      <div class="image-after">
        <img [src]="afterImage" [alt]="afterLabel" class="w-full h-full object-cover" />
        <span class="label after">{{ afterLabel }}</span>
      </div>

      <!-- Before Image (Overlay with clip-path) -->
      <div class="image-before" [style.clip-path]="'inset(0 ' + (100 - sliderPos) + '% 0 0)'">
        <img [src]="beforeImage" [alt]="beforeLabel" class="w-full h-full object-cover" />
        <span class="label before">{{ beforeLabel }}</span>
      </div>

      <!-- Slider Handle -->
      <div class="slider-handle" [style.left.%]="sliderPos" appMagnetic [appMagnetic]="0.2">
        <div class="slider-line"></div>
        <div class="slider-button shadow-2xl">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8L22 12L18 16" />
            <path d="M6 8L2 12L6 16" />
          </svg>
        </div>
      </div>

      <!-- Invisible Range Input for accessibility and control -->
      <input 
        type="range" 
        min="0" 
        max="100" 
        [value]="sliderPos" 
        (input)="onInputChange($event)"
        class="slider-input" 
      />
    </div>
  `,
  styles: [`
    .comparison-container {
      position: relative;
      width: 100%;
      aspect-ratio: 16/9;
      overflow: hidden;
      background: #f0f0f0;
      border: 1px solid rgba(0,0,0,0.1);
      cursor: ew-resize;
    }

    .image-after, .image-before {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none;
    }

    .image-before {
      z-index: 1;
    }

    .label {
      position: absolute;
      bottom: 20px;
      padding: 6px 14px;
      background: rgba(0,0,0,0.6);
      color: white;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      border-radius: 4px;
      backdrop-filter: blur(4px);
    }

    .label.before { left: 20px; }
    .label.after { right: 20px; }

    .slider-handle {
      position: absolute;
      top: 0;
      width: 4px;
      height: 100%;
      background: white;
      z-index: 10;
      pointer-events: none;
      transform: translateX(-50%);
    }

    .slider-line {
      width: 2px;
      height: 100%;
      background: rgba(255,255,255,0.5);
      margin: 0 auto;
    }

    .slider-button {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 48px;
      height: 48px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #8B5E3C;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    .slider-input {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      opacity: 0;
      cursor: ew-resize;
      z-index: 20;
    }

    @media (max-width: 768px) {
      .comparison-container {
        aspect-ratio: 4/3;
      }
      .slider-button {
        width: 38px;
        height: 38px;
      }
    }
  `]
})
export class ImageComparisonComponent {
  @Input() beforeImage: string = '';
  @Input() afterImage: string = '';
  @Input() beforeLabel: string = 'BEFORE';
  @Input() afterLabel: string = 'AFTER';
  
  sliderPos: number = 50;

  onInputChange(event: any) {
    this.sliderPos = event.target.value;
  }
}
