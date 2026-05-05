import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { PortfolioConfigService } from '../../../../services/portfolio-config.service';

@Component({
  selector: 'app-contact-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="editor-card animate-fade-in">
      <div class="card-header">
        <h3>📧 Contact Editor</h3>
        <p class="subtitle">Gestiona tus canales de comunicación y enlaces a redes sociales profesionales.</p>
      </div>

      <form [formGroup]="contactForm" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <div class="form-group">
            <label>Email de Contacto Principal</label>
            <input type="email" formControlName="email" placeholder="ejemplo@correo.com">
          </div>

          <div class="form-group">
            <label>Estado del Formulario</label>
            <div class="toggle-card">
              <div class="toggle-info">
                <strong>Habilitar Formulario</strong>
                <p>Permite a los usuarios enviarte mensajes directos.</p>
              </div>
              <label class="switch">
                <input type="checkbox" formControlName="formActive">
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div class="social-section">
          <div class="section-header">
            <label>Redes Sociales & Enlaces Externos</label>
            <button type="button" class="btn-add-social" (click)="addSocial()">
              + Agregar Red Social
            </button>
          </div>

          <div formArrayName="social" class="social-list">
            <div *ngFor="let socialGroup of socialArray.controls; let i = index" 
                 [formGroupName]="i" 
                 class="social-item">
              <div class="social-inputs">
                <div class="input-with-label">
                  <span class="small-label">Plataforma</span>
                  <input type="text" formControlName="platform" placeholder="LinkedIn, GitHub, Twitter...">
                </div>
                <div class="input-with-label flex-grow">
                  <span class="small-label">URL del Perfil</span>
                  <input type="text" formControlName="url" placeholder="https://...">
                </div>
              </div>
              <button type="button" class="btn-remove-social" (click)="removeSocial(i)" title="Eliminar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div *ngIf="socialArray.length === 0" class="empty-state">
              No hay redes sociales configuradas.
            </div>
          </div>
        </div>

        <div class="form-footer">
          <button type="submit" class="btn-primary" [disabled]="contactForm.pristine">
            Actualizar Datos de Contacto
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
    h3 { font-size: 1.8rem; color: #fff; font-weight: 800; margin: 0; }
    .subtitle { color: #666; font-size: 1rem; margin-top: 0.5rem; }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2.5rem;
      margin-bottom: 3.5rem;
    }

    .form-group { display: flex; flex-direction: column; gap: 0.8rem; }
    
    label {
      display: block;
      font-weight: 700;
      color: #888;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1rem;
    }
    
    input[type="email"], input[type="text"] {
      width: 100%;
      padding: 1.2rem;
      background: #000;
      border: 1px solid #222;
      border-radius: 1rem;
      color: #fff;
      font-size: 1rem;
      transition: all 0.3s;
    }
    
    input:focus { border-color: #444; background: #050505; outline: none; }

    .toggle-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #080808;
      padding: 1.5rem;
      border-radius: 1.2rem;
      border: 1px solid #1a1a1a;
    }
    
    .toggle-info strong { display: block; color: #fff; font-size: 0.9rem; margin-bottom: 0.2rem; }
    .toggle-info p { color: #555; font-size: 0.8rem; margin: 0; }

    .social-section { margin-top: 2rem; }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #111;
    }
    
    .btn-add-social {
      background: #111;
      color: #eee;
      border: 1px solid #222;
      padding: 0.6rem 1.2rem;
      border-radius: 0.6rem;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.8rem;
      transition: all 0.2s;
    }
    
    .btn-add-social:hover { background: #fff; color: #000; border-color: #fff; }
    
    .social-list { display: flex; flex-direction: column; gap: 1rem; }
    
    .social-item {
      display: flex;
      gap: 1.5rem;
      align-items: center;
      background: #080808;
      padding: 1.5rem;
      border-radius: 1.2rem;
      border: 1px solid #1a1a1a;
      transition: border-color 0.3s;
    }
    
    .social-item:hover { border-color: #222; }
    
    .social-inputs { flex: 1; display: flex; gap: 1.5rem; }
    
    .input-with-label { display: flex; flex-direction: column; gap: 0.4rem; }
    .flex-grow { flex: 1; }
    
    .small-label { font-size: 0.65rem; color: #444; font-weight: 800; text-transform: uppercase; }
    
    .social-inputs input { padding: 0.8rem 1rem; font-size: 0.9rem; }
    
    .btn-remove-social {
      background: rgba(255, 68, 68, 0.1);
      color: #ff4444;
      border: 1px solid rgba(255, 68, 68, 0.2);
      width: 40px;
      height: 40px;
      border-radius: 0.8rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-remove-social:hover { background: #ff4444; color: #fff; }
    
    .empty-state {
      padding: 3rem;
      text-align: center;
      color: #333;
      font-style: italic;
      border: 1px dashed #222;
      border-radius: 1.2rem;
    }

    /* Switch Component */
    .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider {
      position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
      background-color: #1a1a1a; transition: .4s; border-radius: 34px; border: 1px solid #333;
    }
    .slider:before {
      position: absolute; content: ""; height: 18px; width: 18px; left: 2px; bottom: 2px;
      background-color: #444; transition: .4s; border-radius: 50%;
    }
    input:checked + .slider { background-color: #fff; border-color: #fff; }
    input:checked + .slider:before { transform: translateX(20px); background-color: #000; }

    .form-footer {
      margin-top: 3.5rem;
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
      transition: all 0.3s;
    }
    
    .btn-primary:disabled { opacity: 0.3; cursor: not-allowed; }
    
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ContactEditorComponent {
  private fb = inject(FormBuilder);
  private configService = inject(PortfolioConfigService);
  
  contactForm: FormGroup;

  constructor() {
    this.contactForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      formActive: [true],
      social: this.fb.array([])
    });

    effect(() => {
      const data = this.configService.data();
      if (data?.contact) {
        this.contactForm.patchValue({
          email: data.contact.email,
          formActive: data.contact.formActive
        }, { emitEvent: false });
        
        this.setSocial(data.contact.social || []);
      }
    });
  }

  get socialArray(): FormArray {
    return this.contactForm.get('social') as FormArray;
  }

  private setSocial(socials: any[]) {
    this.socialArray.clear();
    socials.forEach(s => {
      this.socialArray.push(this.fb.group({
        platform: [s.platform, Validators.required],
        url: [s.url, Validators.required]
      }));
    });
    this.contactForm.markAsPristine();
  }

  addSocial() {
    this.socialArray.push(this.fb.group({
      platform: ['', Validators.required],
      url: ['', Validators.required]
    }));
  }

  removeSocial(index: number) {
    this.socialArray.removeAt(index);
    this.contactForm.markAsDirty();
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.configService.updateSection('contact', this.contactForm.value);
      this.contactForm.markAsPristine();
    }
  }
}
