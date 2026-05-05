import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, CdkDragHandle } from '@angular/cdk/drag-drop';
import { PortfolioConfigService } from '../../../../services/portfolio-config.service';

@Component({
  selector: 'app-portfolio-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DragDropModule],
  template: `
    <div class="editor-card animate-fade-in">
      <div class="card-header">
        <div class="header-main">
          <h3>💼 Portfolio Manager</h3>
          <button class="btn-add-project" (click)="addProject()">+ Agregar Proyecto</button>
        </div>
        <p class="subtitle">Gestiona tus trabajos, tecnologías aplicadas y material visual.</p>
      </div>

      <div class="projects-list" cdkDropList (cdkDropListDropped)="drop($event)">
        <div *ngFor="let projectGroup of projectFormArray.controls; let i = index" 
             [formGroup]="getGroup(projectGroup)" 
             class="project-card" cdkDrag>
          
          <div class="project-drag-handle" cdkDragHandle>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
          </div>

          <div class="project-header">
            <div class="title-field">
              <input type="text" formControlName="title" placeholder="Nombre del proyecto" class="inline-title-input">
            </div>
            <div class="header-actions">
              <label class="check-container">
                <input type="checkbox" formControlName="featured">
                <span class="checkmark"></span>
                Destacado
              </label>
              <button type="button" class="btn-delete" (click)="removeProject(i)">Eliminar</button>
            </div>
          </div>

          <div class="project-grid">
            <div class="col-left">
              <div class="form-group">
                <label>Descripción</label>
                <textarea formControlName="description" rows="4" placeholder="Describe brevemente el proyecto..."></textarea>
              </div>

              <div class="form-group">
                <label>Tech Stack (Chips)</label>
                <div class="tech-stack-container">
                  <div class="chip-list">
                    <span *ngFor="let tech of getTechStack(i).value; let ti = index" class="tech-chip">
                      {{ tech }}
                      <button type="button" (click)="removeTech(i, ti)">×</button>
                    </span>
                  </div>
                  <div class="chip-input-wrapper">
                    <input type="text" #techInput 
                           (keyup.enter)="addTech(i, techInput.value); techInput.value=''" 
                           placeholder="Agregar tecnología y presiona Enter">
                  </div>
                </div>
              </div>
            </div>

            <div class="col-right">
              <div class="form-group">
                <label>Imágenes del Proyecto (Max 3)</label>
                <div class="image-manager-grid">
                  <div *ngFor="let img of getImages(i).value; let imgI = index" class="img-preview-box">
                    <img [src]="img">
                    <button type="button" class="remove-img-btn" (click)="removeImage(i, imgI)">×</button>
                  </div>
                  <div *ngIf="getImages(i).value.length < 3" class="add-img-btn" (click)="fileInput.click()">
                    <span>+</span>
                    <input type="file" #fileInput hidden (change)="onImageUpload(i, $event)" accept="image/*">
                  </div>
                </div>
              </div>

              <div class="links-grid">
                <div class="form-group">
                  <label>Live URL</label>
                  <input type="text" formControlName="liveUrl" placeholder="https://...">
                </div>
                <div class="form-group">
                  <label>GitHub URL</label>
                  <input type="text" formControlName="githubUrl" placeholder="https://github.com/...">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="form-footer">
        <button class="btn-primary" (click)="savePortfolio()" [disabled]="portfolioForm.pristine && !hasCustomChanges">
          Sincronizar Portfolio
        </button>
      </div>
    </div>
  `,
  styles: [`
    .editor-card { background: #0a0a0a; border-radius: 1.5rem; padding: 3rem; border: 1px solid #1a1a1a; max-width: 1100px; }
    .card-header { margin-bottom: 3.5rem; }
    .header-main { display: flex; justify-content: space-between; align-items: center; }
    h3 { font-size: 1.8rem; color: #fff; font-weight: 800; margin: 0; }
    .subtitle { color: #666; font-size: 1rem; margin-top: 0.5rem; }
    
    .btn-add-project { background: #fff; color: #000; padding: 0.8rem 1.8rem; border-radius: 0.8rem; border: none; font-weight: 800; cursor: pointer; transition: all 0.2s; }
    .btn-add-project:hover { transform: scale(1.05); }

    .projects-list { display: flex; flex-direction: column; gap: 2.5rem; }
    
    .project-card {
      background: #080808; border-radius: 1.5rem; border: 1px solid #1a1a1a; padding: 2.5rem;
      position: relative; transition: border-color 0.3s;
    }
    .project-card:hover { border-color: #222; }
    
    .project-drag-handle {
      position: absolute; left: 0.8rem; top: 3rem; cursor: grab; color: #333; transition: color 0.2s;
    }
    .project-card:hover .project-drag-handle { color: #555; }
    
    .project-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 2.5rem; padding-left: 1.5rem;
    }
    
    .inline-title-input {
      background: transparent; border: none; border-bottom: 2px solid #1a1a1a;
      font-size: 1.6rem; font-weight: 800; color: #fff; width: 100%; min-width: 300px;
      padding: 0.5rem 0; transition: border-color 0.3s;
    }
    .inline-title-input:focus { outline: none; border-bottom-color: #444; }
    
    .header-actions { display: flex; align-items: center; gap: 2rem; }
    
    .project-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; }
    
    label { font-size: 0.75rem; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.05rem; margin-bottom: 0.8rem; display: block; }
    
    textarea, input[type="text"] {
      width: 100%; background: #000; border: 1px solid #1a1a1a; border-radius: 1rem;
      color: #fff; padding: 1.2rem; font-family: inherit; font-size: 0.95rem; transition: border-color 0.3s;
    }
    textarea:focus, input:focus { outline: none; border-color: #333; }
    
    .tech-stack-container { background: #000; border: 1px solid #111; border-radius: 1.2rem; padding: 1.2rem; }
    .chip-list { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-bottom: 1rem; }
    .tech-chip {
      background: #111; color: #999; padding: 0.4rem 0.8rem; border-radius: 0.6rem;
      font-size: 0.8rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; border: 1px solid #222;
    }
    .tech-chip button { background: transparent; border: none; color: #555; cursor: pointer; font-size: 1.2rem; line-height: 1; }
    .tech-chip button:hover { color: #ff4444; }
    
    .chip-input-wrapper input { border: none; background: transparent; padding: 0.5rem 0; font-size: 0.9rem; border-bottom: 1px solid #222; border-radius: 0; }
    
    .image-manager-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .img-preview-box {
      aspect-ratio: 16/9; background: #000; border-radius: 0.8rem; overflow: hidden;
      border: 1px solid #222; position: relative;
    }
    .img-preview-box img { width: 100%; height: 100%; object-fit: cover; }
    .remove-img-btn {
      position: absolute; top: 0.5rem; right: 0.5rem; background: rgba(255, 68, 68, 0.9);
      color: #fff; border: none; width: 24px; height: 24px; border-radius: 50%;
      cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center;
    }
    
    .add-img-btn {
      aspect-ratio: 16/9; background: #050505; border: 2px dashed #222;
      border-radius: 0.8rem; display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: #222; font-size: 2.5rem; transition: all 0.3s;
    }
    .add-img-btn:hover { border-color: #444; color: #444; }
    
    .links-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1rem; }
    
    .btn-delete { color: #ff4444; background: transparent; border: none; font-weight: 700; font-size: 0.85rem; cursor: pointer; opacity: 0.6; transition: opacity 0.2s; }
    .btn-delete:hover { opacity: 1; text-decoration: underline; }
    
    .form-footer { margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #1a1a1a; display: flex; justify-content: flex-end; }
    .btn-primary { background: #fff; color: #000; padding: 1.2rem 3.5rem; border-radius: 1rem; border: none; font-weight: 800; cursor: pointer; transition: all 0.3s; }
    .btn-primary:disabled { opacity: 0.3; cursor: not-allowed; }

    /* Custom Checkbox */
    .check-container { display: flex; align-items: center; gap: 0.8rem; cursor: pointer; font-size: 0.9rem; color: #888; font-weight: 600; }
    .check-container input { display: none; }
    .checkmark { width: 18px; height: 18px; background: #111; border: 2px solid #333; border-radius: 4px; position: relative; }
    .check-container input:checked ~ .checkmark { background: #fff; border-color: #fff; }
    .check-container input:checked ~ .checkmark:after {
      content: ""; position: absolute; left: 5px; top: 1px; width: 5px; height: 10px;
      border: solid #000; border-width: 0 2px 2px 0; transform: rotate(45deg);
    }
    
    .cdk-drag-preview {
      background: #0a0a0a; border: 1px solid #333; border-radius: 1.5rem;
      box-shadow: 0 15px 40px rgba(0,0,0,0.6); opacity: 0.9;
    }
    .cdk-drag-placeholder { opacity: 0; }
  `]
})
export class PortfolioEditorComponent {
  private fb = inject(FormBuilder);
  private configService = inject(PortfolioConfigService);
  
  portfolioForm: FormGroup;
  hasCustomChanges = false;

  constructor() {
    this.portfolioForm = this.fb.group({
      projects: this.fb.array([])
    });

    effect(() => {
      const data = this.configService.data();
      if (data?.portfolio) {
        this.setProjects(data.portfolio);
      }
    });
  }

  get projectFormArray(): FormArray {
    return this.portfolioForm.get('projects') as FormArray;
  }

  getGroup(control: any): FormGroup {
    return control as FormGroup;
  }

  getTechStack(index: number): FormArray {
    return this.projectFormArray.at(index).get('techStack') as FormArray;
  }

  getImages(index: number): FormArray {
    return this.projectFormArray.at(index).get('images') as FormArray;
  }

  private setProjects(projects: any[]) {
    const sorted = [...projects].sort((a, b) => a.order - b.order);
    this.projectFormArray.clear();
    sorted.forEach(p => {
      this.projectFormArray.push(this.fb.group({
        id: [p.id],
        title: [p.title],
        description: [p.description],
        techStack: this.fb.array(p.techStack || []),
        images: this.fb.array(p.images || []),
        liveUrl: [p.liveUrl],
        githubUrl: [p.githubUrl],
        featured: [p.featured],
        order: [p.order]
      }));
    });
    this.portfolioForm.markAsPristine();
    this.hasCustomChanges = false;
  }

  addProject() {
    const newProject = this.fb.group({
      id: [Date.now().toString()],
      title: ['Nuevo Proyecto'],
      description: [''],
      techStack: this.fb.array([]),
      images: this.fb.array([]),
      liveUrl: [''],
      githubUrl: [''],
      featured: [false],
      order: [this.projectFormArray.length + 1]
    });
    this.projectFormArray.insert(0, newProject);
    this.hasCustomChanges = true;
  }

  removeProject(index: number) {
    if (confirm('¿Eliminar este proyecto?')) {
      this.projectFormArray.removeAt(index);
      this.hasCustomChanges = true;
    }
  }

  addTech(pIndex: number, tech: string) {
    if (tech.trim()) {
      this.getTechStack(pIndex).push(this.fb.control(tech.trim()));
      this.hasCustomChanges = true;
    }
  }

  removeTech(pIndex: number, tIndex: number) {
    this.getTechStack(pIndex).removeAt(tIndex);
    this.hasCustomChanges = true;
  }

  onImageUpload(pIndex: number, event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.getImages(pIndex).push(this.fb.control(e.target.result));
        this.hasCustomChanges = true;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(pIndex: number, imgI: number) {
    this.getImages(pIndex).removeAt(imgI);
    this.hasCustomChanges = true;
  }

  drop(event: CdkDragDrop<any[]>) {
    const controls = this.projectFormArray.controls;
    moveItemInArray(controls, event.previousIndex, event.currentIndex);
    
    // Update order values
    controls.forEach((control, index) => {
      control.patchValue({ order: index + 1 });
    });
    
    this.hasCustomChanges = true;
  }

  savePortfolio() {
    const projects = this.portfolioForm.value.projects;
    this.configService.updateSection('portfolio', projects);
    this.portfolioForm.markAsPristine();
    this.hasCustomChanges = false;
  }
}
