import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfReportService } from '../../../services/pdf-report.service';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar: string;
  joined: string;
}

@Component({
  selector: 'app-dash-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 tab-enter">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.3em]"
             [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Gestión de Cuentas</p>
          <h2 class="text-4xl font-bold uppercase tracking-tight mt-0.5"
              [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Usuarios</h2>
        </div>
          <div class="flex gap-3 items-center">
            <button (click)="downloadPdf()"
                    [disabled]="pdfLoading"
                    class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all duration-200 cursor-pointer"
                    [ngClass]="isDark ? 'border-red-900/60 text-red-400 hover:bg-red-950/40 hover:border-red-700' : 'border-red-200 text-red-600 hover:bg-red-50'">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {{ pdfLoading ? 'Generando...' : 'PDF' }}
            </button>
            <div class="text-center px-4 py-2 rounded-xl border"
                 [ngClass]="isDark ? 'border-neutral-800 bg-neutral-900/60' : 'border-neutral-200 bg-white'">
              <p class="text-2xl font-bold" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ activeUsers }}</p>
              <p class="text-[10px] uppercase tracking-wide font-bold text-green-500">Activos</p>
            </div>
            <div class="text-center px-4 py-2 rounded-xl border"
                 [ngClass]="isDark ? 'border-neutral-800 bg-neutral-900/60' : 'border-neutral-200 bg-white'">
              <p class="text-2xl font-bold" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ usersList.length }}</p>
              <p class="text-[10px] uppercase tracking-wide font-bold"
                 [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Total</p>
            </div>
          </div>
      </div>

      <!-- Users table -->
      <div class="rounded-2xl border overflow-hidden"
           [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">

        <!-- Table header -->
        <div class="grid grid-cols-12 px-5 py-3 text-[10px] font-bold uppercase tracking-widest border-b"
             [ngClass]="isDark ? 'border-neutral-800 text-neutral-500' : 'border-neutral-200 text-neutral-400'">
          <span class="col-span-5">Usuario</span>
          <span class="col-span-2 text-center">Rol</span>
          <span class="col-span-2 text-center">Estado</span>
          <span class="col-span-2">Registro</span>
          <span class="col-span-1"></span>
        </div>

        <!-- Rows -->
        <div class="divide-y" [ngClass]="isDark ? 'divide-neutral-800' : 'divide-neutral-100'">
          <div *ngFor="let user of usersList"
               class="grid grid-cols-12 px-5 py-4 items-center transition-all duration-200"
               [ngClass]="isDark ? 'hover:bg-neutral-800/30' : 'hover:bg-neutral-50'">

            <!-- User info -->
            <div class="col-span-5 flex items-center gap-3 min-w-0">
              <img [src]="user.avatar" [alt]="user.name"
                   class="w-9 h-9 rounded-full object-cover flex-shrink-0 border"
                   [ngClass]="isDark ? 'border-neutral-700' : 'border-neutral-200'"
                   (error)="onImgError($event, user.name)">
              <div class="min-w-0">
                <p class="text-sm font-bold truncate" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ user.name }}</p>
                <p class="text-xs truncate" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">{{ user.email }}</p>
              </div>
            </div>

            <!-- Role -->
            <div class="col-span-2 flex justify-center">
              <span class="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
                    [ngClass]="getRoleClass(user.role)">{{ user.role }}</span>
            </div>

            <!-- Status -->
            <div class="col-span-2 flex justify-center">
              <div class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full"
                      [ngClass]="user.status === 'Activo' ? 'bg-green-500' : 'bg-neutral-500'"></span>
                <span class="text-xs font-semibold"
                      [ngClass]="user.status === 'Activo' ? 'text-green-500' : (isDark ? 'text-neutral-500' : 'text-neutral-400')">{{ user.status }}</span>
              </div>
            </div>

            <!-- Joined -->
            <div class="col-span-2">
              <span class="text-xs" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">{{ user.joined }}</span>
            </div>

            <!-- Actions -->
            <div class="col-span-1 flex justify-end">
              <button (click)="toggleStatus(user.id)"
                      class="p-2 rounded-lg text-xs transition-all duration-200 cursor-pointer"
                      [ngClass]="isDark ? 'text-neutral-500 hover:text-white hover:bg-neutral-800' : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100'"
                      [title]="user.status === 'Activo' ? 'Desactivar' : 'Activar'">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path *ngIf="user.status === 'Activo'" stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  <path *ngIf="user.status !== 'Activo'" stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
export class DashUsersComponent implements OnInit {
  @Input() theme = 'dark';
  private pdfService = inject(PdfReportService);
  pdfLoading = false;

  usersList: User[] = [
    { id: 1, name: 'Santiago Arbeláez', email: 'santiago@portalink.com', role: 'Admin', status: 'Activo', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80', joined: 'Jun 2024' },
    { id: 2, name: 'Lucía Fernández', email: 'lucia.f@portalink.com', role: 'Editor', status: 'Activo', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80', joined: 'Ene 2025' },
    { id: 3, name: 'Mateo R.', email: 'mateo@user.com', role: 'Usuario', status: 'Inactivo', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80', joined: 'Mar 2025' },
  ];

  get isDark() { return this.theme === 'dark'; }
  get activeUsers() { return this.usersList.filter(u => u.status === 'Activo').length; }

  ngOnInit() {
    const saved = localStorage.getItem('portalink_admin_users');
    if (saved) {
      try { this.usersList = JSON.parse(saved); } catch { }
    } else {
      localStorage.setItem('portalink_admin_users', JSON.stringify(this.usersList));
    }
  }

  toggleStatus(id: number) {
    const user = this.usersList.find(u => u.id === id);
    if (user) {
      user.status = user.status === 'Activo' ? 'Inactivo' : 'Activo';
      localStorage.setItem('portalink_admin_users', JSON.stringify(this.usersList));
    }
  }

  getRoleClass(role: string): string {
    if (this.isDark) {
      if (role === 'Admin') return 'bg-white/15 text-white';
      if (role === 'Editor') return 'bg-white/8 text-neutral-300';
      return 'bg-neutral-800 text-neutral-500';
    } else {
      if (role === 'Admin') return 'bg-neutral-900 text-white';
      if (role === 'Editor') return 'bg-neutral-200 text-neutral-700';
      return 'bg-neutral-100 text-neutral-500';
    }
  }

  onImgError(event: Event, name: string) {
    const el = event.target as HTMLImageElement;
    el.style.display = 'none';
  }

  async downloadPdf() {
    this.pdfLoading = true;
    try { await this.pdfService.downloadUsersReport(this.usersList); } finally { this.pdfLoading = false; }
  }
}
