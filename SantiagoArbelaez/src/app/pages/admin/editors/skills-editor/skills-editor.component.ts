import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, CdkDragHandle } from '@angular/cdk/drag-drop';
import { PortfolioConfigService } from '../../../../services/portfolio-config.service';

@Component({
  selector: 'app-skills-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DragDropModule],
  template: `
    <div class="editor-card animate-fade-in">
      <div class="card-header">
        <h3>⚡ Skills Manager</h3>
        <p class="subtitle">Gestiona tus habilidades técnicas, niveles de dominio y el orden en que aparecen.</p>
      </div>

      <!-- Formulario para agregar Skill -->
      <div class="add-skill-section">
        <form [formGroup]="skillForm" (ngSubmit)="addSkill()">
          <div class="form-row">
            <div class="form-group flex-2">
              <label>Tecnología / Habilidad</label>
              <input type="text" formControlName="name" placeholder="Ej: Angular, TypeScript...">
            </div>
            <div class="form-group flex-1">
              <label>Dominio (%)</label>
              <div class="range-wrapper">
                <input type="range" formControlName="percentage" min="0" max="100">
                <span class="range-val">{{ skillForm.value.percentage }}%</span>
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group flex-2">
              <label>Icon Class / Identifier</label>
              <input type="text" formControlName="icon" placeholder="Ej: fab fa-angular">
            </div>
            <div class="form-actions flex-1">
              <button type="submit" class="btn-add" [disabled]="skillForm.invalid">
                Agregar Habilidad
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- Lista de Skills con Drag & Drop -->
      <div class="skills-list-container">
        <div class="list-header">
          <span>Habilidad</span>
          <span>Nivel</span>
          <span>Acciones</span>
        </div>
        
        <div class="skills-list" cdkDropList (cdkDropListDropped)="drop($event)">
          <div class="skill-row" *ngFor="let skill of skills(); let i = index" cdkDrag>
            <div class="drag-handle" cdkDragHandle>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10,13c0.55,0,1,0.45,1,1v2c0,0.55-0.45,1-1,1s-1-0.45-1-1v-2C9,13.45,9.45,13,10,13z M14,13c0.55,0,1,0.45,1,1v2 c0,0.55-0.45,1-1,1s-1-0.45-1-1v-2C13,13.45,13.45,13,14,13z M10,7c0.55,0,1,0.45,1,1v2c0,0.55-0.45,1-1,1s-1-0.45-1-1V8 C9,7.45,9.45,7,10,7z M14,7c0.55,0,1,0.45,1,1v2c0,0.55-0.45,1-1,1s-1-0.45-1-1V8C13,7.45,13.45,7,14,7z M10,19c0.55,0,1,0.45,1,1v2 c0,0.55-0.45,1-1,1s-1-0.45-1-1v-2C9,19.45,9.45,19,10,19z M14,19c0.55,0,1,0.45,1,1v2c0,0.55-0.45,1-1,1s-1-0.45-1-1v-2 C13,19.45,13.45,19,14,19z"/>
              </svg>
            </div>
            
            <div class="skill-name-col">
              <span class="skill-icon" *ngIf="skill.icon"><i [class]="skill.icon"></i></span>
              <strong>{{ skill.name }}</strong>
            </div>

            <div class="skill-level-col">
              <div class="level-bar-bg">
                <div class="level-bar-fill" [style.width]="skill.percentage + '%'"></div>
              </div>
              <span class="percentage-txt">{{ skill.percentage }}%</span>
            </div>

            <div class="skill-actions-col">
              <button class="btn-icon btn-delete" (click)="removeSkill(i)" title="Eliminar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>

            <!-- Placeholder for drag -->
            <div class="row-placeholder" *cdkDragPlaceholder></div>
          </div>
        </div>
      </div>

      <div class="form-footer">
        <div class="info-tag" *ngIf="hasChanges()">Cambios detectados en la lista</div>
        <button class="btn-primary" (click)="saveSkills()" [disabled]="!hasChanges()">
          Guardar Cambios de Habilidades
        </button>
      </div>
    </div>
  `,
  styles: [`
    .editor-card {
      background: #0a0a0a;
      border-radius: 1.5rem;
      padding: 3rem;
      border: 1px solid #1a1a1a;
      max-width: 900px;
    }
    
    .card-header { margin-bottom: 2.5rem; }
    h3 { font-size: 1.8rem; color: #fff; font-weight: 800; margin: 0; }
    .subtitle { color: #666; font-size: 1rem; margin-top: 0.5rem; }

    .add-skill-section {
      background: #080808;
      padding: 2rem;
      border-radius: 1.2rem;
      border: 1px solid #1a1a1a;
      margin-bottom: 3rem;
    }
    
    .form-row { display: flex; gap: 1.5rem; margin-bottom: 1.5rem; }
    .form-row:last-child { margin-bottom: 0; }
    .flex-2 { flex: 2; }
    .flex-1 { flex: 1; }
    
    .form-group { display: flex; flex-direction: column; gap: 0.6rem; }
    label { font-size: 0.75rem; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.05rem; }
    
    input[type="text"], input[type="number"] {
      padding: 1rem;
      background: #000;
      border: 1px solid #222;
      border-radius: 0.8rem;
      color: #fff;
      font-size: 0.95rem;
    }
    
    .range-wrapper {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.8rem 1rem;
      background: #000;
      border-radius: 0.8rem;
      border: 1px solid #222;
    }
    
    input[type="range"] {
      flex: 1;
      accent-color: #fff;
    }
    
    .range-val { font-size: 0.9rem; font-weight: 700; color: #fff; min-width: 40px; }
    
    .form-actions { display: flex; align-items: flex-end; }
    
    .btn-add {
      width: 100%;
      padding: 1rem;
      background: #111;
      color: #fff;
      border: 1px solid #333;
      border-radius: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-add:hover:not(:disabled) { background: #fff; color: #000; }
    .btn-add:disabled { opacity: 0.3; cursor: not-allowed; }

    .skills-list-container {
      background: #050505;
      border-radius: 1.2rem;
      border: 1px solid #111;
      overflow: hidden;
    }
    
    .list-header {
      display: grid;
      grid-template-columns: 50px 2fr 3fr 100px;
      padding: 1rem 1.5rem;
      background: #0a0a0a;
      border-bottom: 1px solid #1a1a1a;
      font-size: 0.7rem;
      font-weight: 800;
      color: #444;
      text-transform: uppercase;
      letter-spacing: 0.1rem;
    }
    
    .skills-list { min-height: 100px; }
    
    .skill-row {
      display: grid;
      grid-template-columns: 50px 2fr 3fr 100px;
      align-items: center;
      padding: 1.2rem 1.5rem;
      border-bottom: 1px solid #111;
      background: #050505;
      transition: background 0.2s;
    }
    
    .skill-row:last-child { border-bottom: none; }
    .skill-row:hover { background: #080808; }
    
    .drag-handle {
      cursor: grab;
      color: #333;
      display: flex;
      align-items: center;
      transition: color 0.2s;
    }
    
    .skill-row:hover .drag-handle { color: #666; }
    
    .skill-name-col { display: flex; align-items: center; gap: 1rem; }
    .skill-icon { font-size: 1.2rem; color: #888; }
    
    .skill-level-col { display: flex; align-items: center; gap: 1rem; }
    .level-bar-bg { flex: 1; height: 6px; background: #1a1a1a; border-radius: 3px; overflow: hidden; }
    .level-bar-fill { height: 100%; background: #fff; border-radius: 3px; transition: width 1s ease-out; }
    .percentage-txt { font-size: 0.85rem; color: #666; font-weight: 600; min-width: 40px; }
    
    .btn-icon {
      background: transparent;
      border: none;
      color: #444;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.4rem;
      transition: all 0.2s;
    }
    
    .btn-delete:hover { color: #ff4444; background: rgba(255, 68, 68, 0.1); }
    
    .cdk-drag-preview {
      display: grid;
      grid-template-columns: 50px 2fr 3fr 100px;
      align-items: center;
      padding: 1.2rem 1.5rem;
      background: #111;
      border: 1px solid #333;
      border-radius: 1rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      color: #fff;
    }
    
    .row-placeholder { opacity: 0.2; }
    
    .form-footer {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid #1a1a1a;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 1.5rem;
    }
    
    .info-tag { font-size: 0.8rem; color: #ff9800; font-weight: 600; }
    
    .btn-primary {
      background: #fff;
      color: #000;
      padding: 1.2rem 3rem;
      border-radius: 1rem;
      border: none;
      font-weight: 800;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-primary:disabled { opacity: 0.3; cursor: not-allowed; }
    
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class SkillsEditorComponent {
  private fb = inject(FormBuilder);
  private configService = inject(PortfolioConfigService);

  skills = signal<any[]>([]);
  hasChanges = signal(false);
  skillForm: FormGroup;

  constructor() {
    this.skillForm = this.fb.group({
      name: ['', Validators.required],
      percentage: [80, [Validators.required, Validators.min(0), Validators.max(100)]],
      icon: ['']
    });

    effect(() => {
      const data = this.configService.data();
      if (data?.skills) {
        // Only set if we haven't modified locally yet or to reset
        this.skills.set([...data.skills].sort((a, b) => a.order - b.order));
      }
    });
  }

  addSkill() {
    if (this.skillForm.valid) {
      const newSkill = { 
        ...this.skillForm.value, 
        order: this.skills().length + 1 
      };
      this.skills.update(s => [...s, newSkill]);
      this.hasChanges.set(true);
      this.skillForm.reset({ percentage: 80 });
    }
  }

  removeSkill(index: number) {
    this.skills.update(s => s.filter((_, i) => i !== index));
    this.hasChanges.set(true);
  }

  drop(event: CdkDragDrop<any[]>) {
    const currentSkills = [...this.skills()];
    moveItemInArray(currentSkills, event.previousIndex, event.currentIndex);
    
    // Update orders based on new positions
    const reorderedSkills = currentSkills.map((skill, index) => ({
      ...skill,
      order: index + 1
    }));
    
    this.skills.set(reorderedSkills);
    this.hasChanges.set(true);
  }

  saveSkills() {
    this.configService.updateSection('skills', this.skills());
    this.hasChanges.set(false);
  }
}
