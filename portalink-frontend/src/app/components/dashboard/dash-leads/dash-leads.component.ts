import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Lead {
  id: number;
  name: string;
  email: string;
  plan: string;
  price: string;
  date: string;
  status: string;
}

@Component({
  selector: 'app-dash-leads',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 tab-enter">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.3em]"
             [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Clientes Interesados</p>
          <h2 class="text-4xl font-bold uppercase tracking-tight mt-0.5"
              [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Solicitudes</h2>
        </div>

        <!-- Summary chips -->
        <div class="flex gap-2 flex-wrap">
          <span *ngFor="let s of statusSummary"
                class="text-xs font-bold px-3 py-1.5 rounded-full border"
                [ngClass]="isDark ? 'border-neutral-700 text-neutral-400' : 'border-neutral-200 text-neutral-500'">
            {{ s.label }}: {{ s.count }}
          </span>
        </div>
      </div>

      <!-- Leads list -->
      <div class="space-y-3">
        <div *ngIf="leadsList.length === 0"
             class="py-16 text-center rounded-2xl border text-sm"
             [ngClass]="isDark ? 'border-neutral-800 text-neutral-600' : 'border-neutral-200 text-neutral-400'">
          No hay solicitudes de planes registradas.
        </div>

        <div *ngFor="let lead of leadsList"
             class="rounded-2xl border p-5 transition-all duration-200"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700' : 'bg-white border-neutral-200 hover:border-neutral-300'">

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <!-- Info -->
            <div class="space-y-2">
              <div class="flex items-center gap-3 flex-wrap">
                <span class="text-sm font-bold" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ lead.name }}</span>
                <span class="text-xs" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">{{ lead.email }}</span>
              </div>
              <div class="flex items-center gap-2.5 flex-wrap">
                <span class="text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg"
                      [ngClass]="isDark ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-100 text-neutral-700'">
                  {{ lead.plan }}
                </span>
                <span class="text-xs font-semibold" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">{{ lead.price }}</span>
                <span class="text-[10px]" [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'">{{ lead.date }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-3">
              <select [(ngModel)]="lead.status" (change)="updateStatus(lead)"
                      class="text-xs font-bold uppercase tracking-wide px-3 py-2 rounded-xl border focus:outline-none cursor-pointer transition-all duration-200"
                      [ngClass]="[
                        isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-200' : 'bg-neutral-50 border-neutral-200 text-neutral-700',
                        getStatusClass(lead.status)
                      ]">
                <option value="Pendiente">Pendiente</option>
                <option value="Contactado">Contactado</option>
                <option value="Completado">Completado</option>
              </select>

              <button (click)="deleteLead(lead.id)"
                      class="p-2 rounded-xl text-xs border transition-all duration-200 cursor-pointer border-red-500/20 text-red-400 hover:bg-red-500/10">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tab-enter { animation: tabEnter 0.25s ease-out forwards; }
    @keyframes tabEnter {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class DashLeadsComponent implements OnInit {
  @Input() theme = 'dark';
  @Output() dataChange = new EventEmitter<void>();

  leadsList: Lead[] = [
    { id: 1, name: 'Carlos Mendoza', email: 'carlos@mendoza.co', plan: 'Plan Premium', price: '$299 USD', date: 'Hace 4 horas', status: 'Pendiente' },
    { id: 2, name: 'Ana Sofía Silva', email: 'ana.silva@techcorp.io', plan: 'Plan Custom (IA)', price: 'Cotización', date: 'Hace 1 día', status: 'Contactado' },
    { id: 3, name: 'Diego Torres', email: 'diego@torres.es', plan: 'Plan Starter', price: '$99 USD', date: 'Hace 5 días', status: 'Completado' },
  ];

  get isDark() { return this.theme === 'dark'; }

  get statusSummary() {
    const statuses = ['Pendiente', 'Contactado', 'Completado'];
    return statuses.map(s => ({ label: s, count: this.leadsList.filter(l => l.status === s).length }));
  }

  ngOnInit() {
    const saved = localStorage.getItem('portalink_admin_leads');
    if (saved) {
      try { this.leadsList = JSON.parse(saved); } catch { }
    } else {
      localStorage.setItem('portalink_admin_leads', JSON.stringify(this.leadsList));
    }
  }

  updateStatus(lead: Lead) {
    this.save();
  }

  deleteLead(id: number) {
    if (confirm('¿Eliminar esta solicitud?')) {
      this.leadsList = this.leadsList.filter(l => l.id !== id);
      this.save();
    }
  }

  getStatusClass(status: string): string {
    if (status === 'Pendiente') return '';
    if (status === 'Contactado') return '';
    return '';
  }

  private save() {
    localStorage.setItem('portalink_admin_leads', JSON.stringify(this.leadsList));
    this.dataChange.emit();
  }
}
