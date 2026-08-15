import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagesService, ContactMessage } from '../../../services/messages.service';

@Component({
  selector: 'app-dash-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [DatePipe],
  template: `
    <div class="space-y-6 tab-enter">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4"
           [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
        <div>
          <p class="text-xs font-headline font-semibold uppercase tracking-[0.25em]"
             [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Bandeja de Entrada</p>
          <h2 class="text-3xl sm:text-4xl font-headline font-bold uppercase tracking-tight mt-0.5"
              [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Mensajes</h2>
        </div>

        <!-- Filter tabs -->
        <div class="flex flex-wrap gap-2">
          <button *ngFor="let f of filterOptions"
                  (click)="activeFilter = f.id"
                  class="px-4.5 py-2 rounded-full text-xs font-headline font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-xs"
                  [ngClass]="activeFilter === f.id
                    ? (isDark ? 'bg-white text-black' : 'bg-[#09090b] text-white')
                    : (isDark ? 'border border-neutral-800 text-neutral-400 hover:text-white hover:bg-white/10' : 'border border-neutral-200 text-neutral-600 bg-neutral-100 hover:bg-neutral-200')">
            {{ f.label }}
            <span *ngIf="getCount(f.id) > 0" class="ml-1 opacity-60">({{ getCount(f.id) }})</span>
          </button>
        </div>
      </div>

      <!-- Messages list -->
      <div class="space-y-3">
        <div *ngIf="filtered.length === 0"
             class="py-16 text-center rounded-[24px] border"
             [ngClass]="isDark ? 'border-neutral-800 text-neutral-500' : 'border-neutral-200 text-neutral-400'">
          <svg class="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          <p class="text-sm font-headline font-medium">No hay mensajes en esta vista</p>
        </div>

        <div *ngFor="let msg of filtered"
             class="rounded-[24px] border p-5 transition-all duration-300 hover:scale-[1.005] shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
             [ngClass]="[
               isDark ? 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700' : 'bg-white border-neutral-200 hover:border-neutral-300',
               msg.status === 'unread' ? (isDark ? 'border-l-2 border-l-blue-500' : 'border-l-2 border-l-blue-500') : '',
               msg.status === 'replied' ? (isDark ? 'border-l-2 border-l-green-500/50' : 'border-l-2 border-l-green-500/50') : ''
             ]">

          <div class="flex items-start justify-between gap-4">
            <!-- Content -->
            <div class="flex-grow min-w-0">
              <div class="flex items-center gap-3 mb-2 flex-wrap">
                <!-- Avatar initials -->
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                     [ngClass]="isDark ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-100 text-neutral-700'">
                  {{ msg.nombre ? msg.nombre.charAt(0).toUpperCase() : 'U' }}
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-sm font-bold" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ msg.nombre }}</span>
                    <span class="text-xs" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">{{ msg.correo }}</span>
                    <span *ngIf="msg.status === 'unread'"
                          class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                          [ngClass]="isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'">
                      Nuevo
                    </span>
                    <span *ngIf="msg.status === 'replied'"
                          class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                          [ngClass]="isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'">
                      Respondido
                    </span>
                  </div>
                </div>
              </div>
              <p class="text-sm leading-relaxed pl-11 whitespace-pre-wrap" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-600'">{{ msg.mensaje }}</p>
              <p class="text-xs mt-2 pl-11" [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'">{{ msg.created_at | date:'medium' }}</p>
            </div>

            <!-- Actions -->
            <div class="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0 mt-3 sm:mt-0">
              <button *ngIf="msg.status !== 'replied'" (click)="msg.id && openReply(msg.id)"
                      class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                      [ngClass]="isDark ? 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10' : 'border-blue-200 text-blue-600 hover:bg-blue-50'">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
                Responder
              </button>
              <button *ngIf="msg.status === 'replied'" disabled
                      class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border border-transparent opacity-60 flex items-center gap-1.5 cursor-default"
                      [ngClass]="isDark ? 'text-green-400' : 'text-green-600'">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                Respondido
              </button>
              <button (click)="msg.id && toggleRead(msg.id)"
                      class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border transition-all duration-200 cursor-pointer"
                      [ngClass]="isDark ? 'border-neutral-700 text-neutral-500 hover:text-white hover:border-neutral-500' : 'border-neutral-200 text-neutral-400 hover:text-neutral-900 hover:border-neutral-400'">
                {{ msg.status === 'read' || msg.status === 'replied' ? 'Marcar no leído' : 'Marcar leído' }}
              </button>
              <button (click)="msg.id && deleteMessage(msg.id)"
                      class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border transition-all duration-200 cursor-pointer border-red-500/20 text-red-400 hover:bg-red-500/10"
                      title="Eliminar mensaje">
                ×
              </button>
            </div>
          </div>

          <!-- Inline Reply Box -->
          <div *ngIf="replyingTo === msg.id" class="mt-4 pt-4 border-t animate-fade-in" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
            <textarea [(ngModel)]="replyText"
                      rows="3"
                      class="w-full bg-transparent border rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                      [ngClass]="isDark ? 'border-neutral-700 text-white placeholder-neutral-600 focus:border-blue-500' : 'border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-blue-500'"
                      placeholder="Escribe tu respuesta a {{ msg.nombre }}..."></textarea>
            <div class="flex justify-end gap-2 mt-3">
              <button (click)="cancelReply()"
                      class="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all"
                      [ngClass]="isDark ? 'text-neutral-500 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'">
                Cancelar
              </button>
              <button (click)="sendReply(msg)"
                      [disabled]="!replyText.trim()"
                      class="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                Enviar
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
    .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class DashMessagesComponent implements OnInit {
  @Input() theme = 'light';
  @Output() dataChange = new EventEmitter<void>();

  activeFilter = 'all';
  filterOptions = [
    { id: 'all', label: 'Todos' },
    { id: 'unread', label: 'Nuevos' },
    { id: 'read', label: 'Leídos' },
    { id: 'replied', label: 'Respondidos' },
  ];

  messagesList: ContactMessage[] = [];

  replyingTo: number | null = null;
  replyText = '';

  constructor(private messagesService: MessagesService) {}

  get isDark() { return this.theme === 'dark'; }

  get filtered(): ContactMessage[] {
    if (this.activeFilter === 'unread') return this.messagesList.filter(m => m.status === 'unread');
    if (this.activeFilter === 'read') return this.messagesList.filter(m => m.status === 'read');
    if (this.activeFilter === 'replied') return this.messagesList.filter(m => m.status === 'replied');
    return this.messagesList;
  }

  getCount(filterId: string): number {
    if (filterId === 'all') return this.messagesList.length;
    if (filterId === 'unread') return this.messagesList.filter(m => m.status === 'unread').length;
    if (filterId === 'replied') return this.messagesList.filter(m => m.status === 'replied').length;
    return this.messagesList.filter(m => m.status === 'read').length;
  }

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages() {
    this.messagesService.getMessages().subscribe({
      next: (msgs) => {
        this.messagesList = msgs;
      },
      error: (err) => console.error('Error loading messages', err)
    });
  }

  toggleRead(id: number) {
    const msg = this.messagesList.find(m => m.id === id);
    if (msg) {
      const newStatus = msg.status === 'unread' ? 'read' : 'unread';
      // Optimistic UI update
      const originalStatus = msg.status;
      msg.status = newStatus;
      
      this.messagesService.updateStatus(id, newStatus).subscribe({
        next: () => this.dataChange.emit(),
        error: (err) => {
          console.error('Error updating status', err);
          msg.status = originalStatus; // revert on error
        }
      });
    }
  }

  deleteMessage(id: number) {
    if (confirm('¿Eliminar este mensaje de forma permanente?')) {
      this.messagesService.deleteMessage(id).subscribe({
        next: () => {
          this.messagesList = this.messagesList.filter(m => m.id !== id);
          this.dataChange.emit();
        },
        error: (err) => console.error('Error deleting message', err)
      });
    }
  }

  openReply(id: number) {
    this.replyingTo = id;
    this.replyText = '';
  }

  cancelReply() {
    this.replyingTo = null;
    this.replyText = '';
  }

  sendReply(msg: ContactMessage) {
    if (!this.replyText.trim() || !msg.id) return;
    
    // Aquí podrías agregar la lógica real de envío de correo en el backend
    // Por ahora solo actualizamos el estado a 'replied'
    this.messagesService.updateStatus(msg.id, 'replied').subscribe({
      next: () => {
        msg.status = 'replied';
        this.cancelReply();
        this.dataChange.emit();
      },
      error: (err) => console.error('Error marking as replied', err)
    });
  }
}
