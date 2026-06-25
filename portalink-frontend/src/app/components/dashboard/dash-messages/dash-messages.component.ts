import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Message {
  id: number;
  name: string;
  email: string;
  message: string;
  date: string;
  read: boolean;
}

@Component({
  selector: 'app-dash-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 tab-enter">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.3em]"
             [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Bandeja de Entrada</p>
          <h2 class="text-4xl font-bold uppercase tracking-tight mt-0.5"
              [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Mensajes</h2>
        </div>

        <!-- Filter tabs -->
        <div class="flex gap-2">
          <button *ngFor="let f of filterOptions"
                  (click)="activeFilter = f.id"
                  class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all duration-200 cursor-pointer"
                  [ngClass]="activeFilter === f.id
                    ? (isDark ? 'bg-white text-black' : 'bg-neutral-900 text-white')
                    : (isDark ? 'border border-neutral-800 text-neutral-500 hover:text-neutral-300' : 'border border-neutral-200 text-neutral-400 hover:text-neutral-700')">
            {{ f.label }}
            <span *ngIf="getCount(f.id) > 0" class="ml-1 opacity-60">({{ getCount(f.id) }})</span>
          </button>
        </div>
      </div>

      <!-- Messages list -->
      <div class="space-y-3">
        <div *ngIf="filtered.length === 0"
             class="py-16 text-center rounded-2xl border"
             [ngClass]="isDark ? 'border-neutral-800 text-neutral-600' : 'border-neutral-200 text-neutral-400'">
          <svg class="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          <p class="text-sm">No hay mensajes en esta vista</p>
        </div>

        <div *ngFor="let msg of filtered"
             class="rounded-2xl border p-5 transition-all duration-200"
             [ngClass]="[
               isDark ? 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700' : 'bg-white border-neutral-200 hover:border-neutral-300',
               !msg.read ? (isDark ? 'border-l-2 border-l-white/30' : 'border-l-2 border-l-neutral-400') : ''
             ]">

          <div class="flex items-start justify-between gap-4">
            <!-- Content -->
            <div class="flex-grow min-w-0">
              <div class="flex items-center gap-3 mb-2 flex-wrap">
                <!-- Avatar initials -->
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                     [ngClass]="isDark ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-100 text-neutral-700'">
                  {{ msg.name.charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-sm font-bold" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ msg.name }}</span>
                    <span class="text-xs" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">{{ msg.email }}</span>
                    <span *ngIf="!msg.read"
                          class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                          [ngClass]="isDark ? 'bg-white/10 text-white' : 'bg-neutral-900/10 text-neutral-700'">
                      Nuevo
                    </span>
                  </div>
                </div>
              </div>
              <p class="text-sm leading-relaxed pl-11" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-600'">{{ msg.message }}</p>
              <p class="text-xs mt-2 pl-11" [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'">{{ msg.date }}</p>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <button (click)="toggleRead(msg.id)"
                      class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border transition-all duration-200 cursor-pointer"
                      [ngClass]="isDark ? 'border-neutral-700 text-neutral-500 hover:text-white hover:border-neutral-500' : 'border-neutral-200 text-neutral-400 hover:text-neutral-900 hover:border-neutral-400'">
                {{ msg.read ? 'Sin leer' : 'Leído' }}
              </button>
              <button (click)="deleteMessage(msg.id)"
                      class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border transition-all duration-200 cursor-pointer border-red-500/20 text-red-400 hover:bg-red-500/10">
                ×
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
export class DashMessagesComponent implements OnInit {
  @Input() theme = 'dark';
  @Output() dataChange = new EventEmitter<void>();

  activeFilter = 'all';
  filterOptions = [
    { id: 'all', label: 'Todos' },
    { id: 'unread', label: 'Nuevos' },
    { id: 'read', label: 'Leídos' },
  ];

  messagesList: Message[] = [
    { id: 1, name: 'Juan Pérez', email: 'juan@example.com', message: 'Hola Santiago, me interesa un portafolio web para mi agencia de marketing. ¿Cuánto costaría?', date: 'Hace 2 horas', read: false },
    { id: 2, name: 'María Gómez', email: 'maria@company.com', message: 'Excelente trabajo con PortaLink AI Vision, ¿es posible integrarlo con Shopify?', date: 'Ayer', read: true },
    { id: 3, name: 'Robert C.', email: 'robert@designstudio.us', message: 'Would love to discuss a potential co-op development project for our startup.', date: 'Hace 3 días', read: true },
  ];

  get isDark() { return this.theme === 'dark'; }

  get filtered(): Message[] {
    if (this.activeFilter === 'unread') return this.messagesList.filter(m => !m.read);
    if (this.activeFilter === 'read') return this.messagesList.filter(m => m.read);
    return this.messagesList;
  }

  getCount(filterId: string): number {
    if (filterId === 'all') return this.messagesList.length;
    if (filterId === 'unread') return this.messagesList.filter(m => !m.read).length;
    return this.messagesList.filter(m => m.read).length;
  }

  ngOnInit() {
    const saved = localStorage.getItem('portalink_admin_messages');
    if (saved) {
      try { this.messagesList = JSON.parse(saved); } catch { }
    } else {
      localStorage.setItem('portalink_admin_messages', JSON.stringify(this.messagesList));
    }
  }

  toggleRead(id: number) {
    const msg = this.messagesList.find(m => m.id === id);
    if (msg) {
      msg.read = !msg.read;
      this.save();
    }
  }

  deleteMessage(id: number) {
    if (confirm('¿Eliminar este mensaje?')) {
      this.messagesList = this.messagesList.filter(m => m.id !== id);
      this.save();
    }
  }

  private save() {
    localStorage.setItem('portalink_admin_messages', JSON.stringify(this.messagesList));
    this.dataChange.emit();
  }
}
