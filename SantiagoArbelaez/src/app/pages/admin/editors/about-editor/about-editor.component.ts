import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PortfolioConfigService } from '../../../../services/portfolio-config.service';

@Component({
  selector: 'app-about-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="editor-card animate-fade-in">
      <div class="card-header">
        <div class="title-with-toggle">
          <h3>👤 About Section</h3>
          <div class="toggle-container">
            <label class="switch">
              <input type="checkbox" [checked]="isVisible()" (change)="toggleVisibility()">
              <span class="slider"></span>
            </label>
            <span class="toggle-label" [class.active]="isVisible()">{{ isVisible() ? 'Público' : 'Oculto' }}</span>
          </div>
        </div>
        <p class="subtitle">Cuéntale al mundo quién eres y qué haces profesionalmente.</p>
      </div>

      <form [formGroup]="aboutForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Biografía / Descripción Profesional</label>
          <textarea formControlName="text" rows="10" placeholder="Escribe tu historia aquí..."></textarea>
          <p class="char-count">Usa párrafos cortos para mejor legibilidad en web.</p>
        </div>

        <div class="form-group">
          <label>Avatar / Fotografía de Perfil</label>
          <div class="avatar-upload-zone">
            <div class="avatar-preview" [style.backgroundImage]="avatarPreview() ? 'url(' + avatarPreview() + ')' : 'none'">
              <span *ngIf="!avatarPreview()">No Image</span>
            </div>
            <div class="upload-info">
              <input type="file" (change)="onFileSelected($event)" accept="image/*" #fileInput hidden>
              <button type="button" class="btn-secondary" (click)="fileInput.click()">
                Cambiar Fotografía
              </button>
              <p class="hint-text">Recomendado: <code>500x500px</code>, fondo neutro.</p>
              <p class="hint-text">Sugerencia: <code>about-portrait.png</code></p>
            </div>
          </div>
        </div>

        <div class="form-footer">
          <button type="submit" class="btn-primary" [disabled]="!aboutForm.dirty && !imageChanged && !visibilityChanged">
            Actualizar sección About
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
    
    .card-header { margin-bottom: 3.5rem; }
    
    .title-with-toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.8rem;
    }
    
    h3 { font-size: 1.8rem; color: #fff; font-weight: 800; margin: 0; }
    .subtitle { color: #666; font-size: 1rem; }
    
    .form-group { margin-bottom: 3rem; }
    
    label {
      display: block;
      margin-bottom: 1rem;
      font-weight: 700;
      color: #888;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1rem;
    }
    
    textarea {
      width: 100%;
      padding: 1.5rem;
      background: #000;
      border: 1px solid #222;
      border-radius: 1.2rem;
      color: #fff;
      font-size: 1rem;
      line-height: 1.6;
      font-family: inherit;
      transition: all 0.3s;
      resize: vertical;
    }
    
    textarea:focus {
      outline: none;
      border-color: #444;
      background: #050505;
    }
    
    .char-count {
      font-size: 0.75rem;
      color: #444;
      margin-top: 0.8rem;
      text-align: right;
    }
    
    .avatar-upload-zone {
      display: flex;
      gap: 3rem;
      align-items: center;
      background: #080808;
      padding: 2.5rem;
      border-radius: 1.5rem;
      border: 1px dashed #333;
    }
    
    .avatar-preview {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      background-size: cover;
      background-position: center;
      background-color: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #333;
      font-size: 0.8rem;
      border: 2px solid #222;
      flex-shrink: 0;
      box-shadow: 0 10px 20px rgba(0,0,0,0.3);
    }
    
    .upload-info { display: flex; flex-direction: column; gap: 0.5rem; }
    
    .btn-secondary {
      background: #1a1a1a;
      color: #fff;
      padding: 0.8rem 1.8rem;
      border-radius: 0.8rem;
      border: 1px solid #333;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    
    .btn-secondary:hover { background: #252525; }
    
    .hint-text { font-size: 0.75rem; color: #555; }
    code { color: #888; background: #111; padding: 0.2rem 0.4rem; border-radius: 0.3rem; }
    
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
      padding: 1.2rem 3.5rem;
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
    
    .btn-primary:disabled { opacity: 0.3; cursor: not-allowed; }
    
    /* Toggle Switch */
    .toggle-container { display: flex; align-items: center; gap: 1rem; }
    .toggle-label { font-size: 0.85rem; font-weight: 700; color: #444; text-transform: uppercase; letter-spacing: 0.05rem; }
    .toggle-label.active { color: #fff; }
    
    .switch { position: relative; display: inline-block; width: 50px; height: 26px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider {
      position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
      background-color: #1a1a1a; transition: .4s; border-radius: 34px; border: 1px solid #333;
    }
    .slider:before {
      position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px;
      background-color: #555; transition: .4s; border-radius: 50%;
    }
    input:checked + .slider { background-color: #fff; border-color: #fff; }
    input:checked + .slider:before { transform: translateX(24px); background-color: #000; }
    
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AboutEditorComponent {
  private fb = inject(FormBuilder);
  private configService = inject(PortfolioConfigService);
  
  aboutForm: FormGroup;
  avatarPreview = signal<string | null>(null);
  isVisible = signal<boolean>(true);
  imageChanged = false;
  visibilityChanged = false;

  constructor() {
    this.aboutForm = this.fb.group({
      text: ['']
    });

    effect(() => {
      const data = this.configService.data();
      if (data?.about) {
        this.aboutForm.patchValue({ text: data.about.text }, { emitEvent: false });
        this.avatarPreview.set(data.about.avatarImage);
        this.isVisible.set(data.about.visible);
      }
    });
  }

  toggleVisibility() {
    this.isVisible.update(v => !v);
    this.visibilityChanged = true;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarPreview.set(e.target.result);
        this.imageChanged = true;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.aboutForm.valid) {
      const updatedAbout = {
        text: this.aboutForm.value.text,
        avatarImage: this.avatarPreview(),
        visible: this.isVisible()
      };
      this.configService.updateSection('about', updatedAbout);
      this.aboutForm.markAsPristine();
      this.imageChanged = false;
      this.visibilityChanged = false;
    }
  }
}
