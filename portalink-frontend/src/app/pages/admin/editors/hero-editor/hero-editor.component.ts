import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PortfolioConfigService } from '../../../../services/portfolio-config.service';

@Component({
  selector: 'app-hero-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="editor-card animate-fade-in">
      <div class="card-header">
        <h3>🚀 Hero Section</h3>
        <p class="subtitle">Personaliza la primera impresión de tu portafolio.</p>
      </div>
      
      <form [formGroup]="heroForm" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <div class="form-group">
            <label>Título Principal</label>
            <input type="text" formControlName="title" placeholder="Ej: Creative Developer">
          </div>

          <div class="form-group">
            <label>Subtítulo / Nombre</label>
            <input type="text" formControlName="subtitle" placeholder="Tu nombre">
          </div>
        </div>

        <div class="form-group">
          <label>Descripción corta</label>
          <textarea formControlName="description" rows="3" placeholder="Una breve introducción sobre ti..."></textarea>
        </div>

        <div class="form-group">
          <label>Texto del Botón (CTA)</label>
          <input type="text" formControlName="ctaText" placeholder="Ej: Ver Proyectos">
        </div>

        <div class="form-group">
          <label>Imagen de Fondo / Portada</label>
          <div class="image-upload-zone">
            <div class="preview-box" [style.backgroundImage]="imagePreview() ? 'url(' + imagePreview() + ')' : 'none'">
              <span *ngIf="!imagePreview()">No Image</span>
            </div>
            <div class="upload-info">
              <input type="file" (change)="onFileSelected($event)" accept="image/*" #fileInput hidden>
              <button type="button" class="btn-secondary" (click)="fileInput.click()">
                Elegir Nueva Imagen
              </button>
              <p class="hint-text">Archivo sugerido: <code>hero-portrait.png</code></p>
            </div>
          </div>
        </div>

        <div class="form-footer">
          <button type="submit" class="btn-primary" [disabled]="!heroForm.dirty && !imageChanged">
            Sincronizar cambios
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .editor-card {
      background: #0a0a0a;
      border-radius: 1.5rem;
      padding: 3rem;
      border: 1px solid #1a1a1a;
      max-width: 900px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    
    .card-header { margin-bottom: 3rem; }
    h3 { font-size: 1.8rem; margin-bottom: 0.5rem; color: #fff; font-weight: 800; }
    .subtitle { color: #666; font-size: 1rem; }
    
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }
    
    .form-group { margin-bottom: 2.5rem; }
    
    label {
      display: block;
      margin-bottom: 0.8rem;
      font-weight: 700;
      color: #888;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1rem;
    }
    
    input, textarea {
      width: 100%;
      padding: 1.2rem;
      background: #000;
      border: 1px solid #222;
      border-radius: 1rem;
      color: #fff;
      font-size: 1rem;
      font-family: inherit;
      transition: all 0.3s;
    }
    
    input:focus, textarea:focus {
      outline: none;
      border-color: #444;
      background: #050505;
      box-shadow: 0 0 0 4px rgba(255,255,255,0.02);
    }
    
    .image-upload-zone {
      display: flex;
      gap: 2rem;
      align-items: center;
      background: #080808;
      padding: 2rem;
      border-radius: 1.2rem;
      border: 1px dashed #333;
    }
    
    .preview-box {
      width: 160px;
      height: 100px;
      background-size: cover;
      background-position: center;
      border-radius: 0.8rem;
      background-color: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #333;
      font-size: 0.8rem;
      border: 1px solid #222;
      flex-shrink: 0;
    }
    
    .btn-secondary {
      background: #1a1a1a;
      color: #fff;
      padding: 0.8rem 1.5rem;
      border-radius: 0.8rem;
      border: 1px solid #333;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    
    .btn-secondary:hover { background: #252525; }
    
    .hint-text {
      font-size: 0.75rem;
      color: #444;
      margin-top: 0.8rem;
    }
    
    code {
      color: #888;
      background: #111;
      padding: 0.2rem 0.4rem;
      border-radius: 0.3rem;
    }
    
    .form-footer {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #1a1a1a;
      display: flex;
      justify-content: flex-end;
    }
    
    .btn-primary {
      background: #fff;
      color: #000;
      padding: 1.2rem 3rem;
      border-radius: 1rem;
      border: none;
      font-weight: 800;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(255,255,255,0.15);
    }
    
    .btn-primary:active:not(:disabled) {
      transform: translateY(0);
    }
    
    .btn-primary:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    
    .animate-fade-in {
      animation: fadeIn 0.5s ease-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class HeroEditorComponent {
  private fb = inject(FormBuilder);
  private configService = inject(PortfolioConfigService);
  
  heroForm: FormGroup;
  imagePreview = signal<string | null>(null);
  imageChanged = false;

  constructor() {
    this.heroForm = this.fb.group({
      title: [''],
      subtitle: [''],
      description: [''],
      ctaText: ['']
    });

    effect(() => {
      const data = this.configService.data();
      if (data?.hero) {
        this.heroForm.patchValue(data.hero, { emitEvent: false });
        this.imagePreview.set(data.hero.backgroundImage);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview.set(e.target.result);
        this.imageChanged = true;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.heroForm.valid) {
      const updatedHero = {
        ...this.heroForm.value,
        backgroundImage: this.imagePreview()
      };
      this.configService.updateSection('hero', updatedHero);
      this.heroForm.markAsPristine();
      this.imageChanged = false;
    }
  }
}
