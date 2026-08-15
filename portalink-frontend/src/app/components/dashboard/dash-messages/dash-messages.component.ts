import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagesService, ContactMessage } from '../../../services/messages.service';

@Component({
  selector: 'app-dash-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [DatePipe],
  template: `
    <div class="space-y-6 tab-enter font-sans">

      <!-- ══════════════════════════════════════
           HEADER & METRICS SUMMARY
      ══════════════════════════════════════ -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5"
           [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <p class="text-xs font-headline font-semibold uppercase tracking-[0.25em]"
               [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Bandeja de Entrada</p>
          </div>
          <h2 class="text-2xl sm:text-3xl font-headline font-bold tracking-tight mt-1"
              [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
            Mensajes & Contactos
          </h2>
        </div>

        <!-- Metric Counter Pills -->
        <div class="flex items-center gap-2 flex-wrap">
          <div class="px-3.5 py-1.5 rounded-full text-xs font-headline font-semibold border flex items-center gap-2"
               [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-300' : 'bg-neutral-100 border-neutral-200 text-neutral-700'">
            <span class="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>Nuevos: <strong class="font-bold text-white">{{ unreadCount }}</strong></span>
          </div>
          <div class="px-3.5 py-1.5 rounded-full text-xs font-headline font-semibold border flex items-center gap-2"
               [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-300' : 'bg-neutral-100 border-neutral-200 text-neutral-700'">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Respondidos: <strong class="font-bold text-white">{{ repliedCount }}</strong></span>
          </div>
          <div class="px-3.5 py-1.5 rounded-full text-xs font-headline font-semibold border flex items-center gap-2"
               [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-300' : 'bg-neutral-100 border-neutral-200 text-neutral-700'">
            <span>Total: <strong class="font-bold text-white">{{ messagesList.length }}</strong></span>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════
           SEARCH & FILTER BAR
      ══════════════════════════════════════ -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <!-- Search Input -->
        <div class="md:col-span-7 relative">
          <input type="text" [(ngModel)]="searchQuery" placeholder="Buscar por remitente, correo o contenido..."
                 class="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs font-headline border outline-none transition-all duration-200"
                 [ngClass]="isDark ? 'bg-neutral-900/80 border-neutral-800 text-white placeholder-neutral-500 focus:border-neutral-600' : 'bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400'">
          <svg class="w-4 h-4 absolute left-3.5 top-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>

        <!-- Filter Options -->
        <div class="md:col-span-5 flex items-center justify-start md:justify-end gap-1.5 flex-wrap">
          <button *ngFor="let f of filterOptions"
                  (click)="activeFilter = f.id"
                  class="px-3.5 py-2 rounded-xl text-[11px] font-headline font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer border"
                  [ngClass]="activeFilter === f.id
                    ? (isDark ? 'bg-white text-black border-white' : 'bg-[#09090b] text-white border-[#09090b]')
                    : (isDark ? 'border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800' : 'border-neutral-200 text-neutral-600 bg-neutral-50 hover:bg-neutral-100')">
            {{ f.label }}
          </button>
        </div>
      </div>

      <!-- ══════════════════════════════════════
           SPLIT INBOX LAYOUT (List + Detail Pane)
      ══════════════════════════════════════ -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        <!-- LEFT COLUMN: Messages Feed (5 of 12 cols) -->
        <div class="lg:col-span-5 rounded-[28px] border overflow-hidden flex flex-col max-h-[680px] shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          
          <div class="px-5 py-3 border-b flex items-center justify-between text-xs font-headline font-bold uppercase tracking-wider"
               [ngClass]="isDark ? 'border-neutral-800 text-neutral-400 bg-neutral-950/40' : 'border-neutral-200 text-neutral-500 bg-neutral-50'">
            <span>Mensajes ({{ filtered.length }})</span>
            <span class="font-mono text-[10px] opacity-60">Ordenados por fecha</span>
          </div>

          <div class="divide-y overflow-y-auto custom-scrollbar flex-grow" [ngClass]="isDark ? 'divide-neutral-800/80' : 'divide-neutral-100'">
            
            <div *ngFor="let msg of filtered"
                 (click)="selectMessage(msg)"
                 class="p-4 transition-all duration-200 cursor-pointer relative group"
                 [ngClass]="[
                   selectedMessage?.id === msg.id 
                     ? (isDark ? 'bg-neutral-800/90' : 'bg-neutral-100') 
                     : (isDark ? 'hover:bg-neutral-800/40' : 'hover:bg-neutral-50'),
                   msg.status === 'unread' ? (isDark ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-blue-600') : 'border-l-4 border-l-transparent'
                 ]">

              <div class="flex items-start gap-3">
                <!-- Avatar Initials -->
                <div class="w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold shrink-0 border"
                     [ngClass]="msg.status === 'unread' 
                       ? (isDark ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'bg-blue-50 text-blue-700 border-blue-200')
                       : (isDark ? 'bg-neutral-800 text-neutral-300 border-neutral-700' : 'bg-neutral-100 text-neutral-700 border-neutral-200')">
                  {{ msg.nombre ? msg.nombre.charAt(0).toUpperCase() : 'U' }}
                </div>

                <!-- Text & Meta -->
                <div class="min-w-0 flex-grow">
                  <div class="flex items-center justify-between gap-1 mb-1">
                    <h4 class="text-xs font-headline font-bold truncate" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                      {{ msg.nombre || 'Anónimo' }}
                    </h4>
                    <span class="text-[10px] opacity-50 shrink-0 font-mono">
                      {{ msg.created_at | date:'shortTime' }}
                    </span>
                  </div>

                  <p class="text-[11px] truncate mb-1" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-600'">
                    {{ msg.correo }}
                  </p>

                  <p class="text-xs line-clamp-2 leading-relaxed opacity-80" [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">
                    {{ msg.mensaje }}
                  </p>

                  <!-- Status badges -->
                  <div class="flex items-center gap-2 mt-2">
                    <span *ngIf="msg.status === 'unread'" class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Nuevo
                    </span>
                    <span *ngIf="msg.status === 'replied'" class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Respondido
                    </span>
                    <span *ngIf="msg.status === 'read'" class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
                      Leído
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div *ngIf="filtered.length === 0" class="p-12 text-center text-xs opacity-50 space-y-2">
              <svg class="w-8 h-8 mx-auto opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
              <p>No se encontraron mensajes en esta vista.</p>
            </div>

          </div>
        </div>

        <!-- RIGHT COLUMN: Message Detail & Reply Reader (7 of 12 cols) -->
        <div class="lg:col-span-7 rounded-[28px] border p-6 flex flex-col space-y-6 shadow-[0_10px_35px_rgba(0,0,0,0.03)] min-h-[520px]"
             [ngClass]="isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-white border-neutral-200'">
          
          <ng-container *ngIf="selectedMessage; else noSelection">
            
            <!-- Message Reader Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4"
                 [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-bold shrink-0 border"
                     [ngClass]="isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'">
                  {{ selectedMessage.nombre ? selectedMessage.nombre.charAt(0).toUpperCase() : 'U' }}
                </div>
                <div>
                  <h3 class="text-base font-headline font-bold" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                    {{ selectedMessage.nombre }}
                  </h3>
                  <p class="text-xs font-mono opacity-70">{{ selectedMessage.correo }}</p>
                  <p class="text-[10px] opacity-40 mt-0.5">{{ selectedMessage.created_at | date:'fullDate' }} · {{ selectedMessage.created_at | date:'shortTime' }}</p>
                </div>
              </div>

              <!-- Quick Contact Actions -->
              <div class="flex items-center gap-2">
                <button (click)="copyEmail(selectedMessage.correo)"
                        class="px-3 py-1.5 rounded-xl text-xs font-headline font-semibold border transition-all cursor-pointer"
                        [ngClass]="isDark ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-100'"
                        title="Copiar Correo">
                  Copiar Email
                </button>

                <a [href]="'mailto:' + selectedMessage.correo"
                   class="px-3 py-1.5 rounded-xl text-xs font-headline font-semibold border transition-all cursor-pointer inline-flex items-center gap-1"
                   [ngClass]="isDark ? 'bg-white text-black border-white hover:bg-neutral-200' : 'bg-black text-white border-black hover:bg-neutral-800'">
                  Redactar
                </a>

                <button (click)="selectedMessage.id && deleteMessage(selectedMessage.id)"
                        class="p-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 cursor-pointer transition-all"
                        title="Eliminar Mensaje">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>

            <!-- Message Content Box -->
            <div class="rounded-2xl p-5 border flex-grow space-y-3 leading-relaxed text-sm whitespace-pre-wrap font-sans"
                 [ngClass]="isDark ? 'bg-neutral-950/60 border-neutral-800 text-neutral-200' : 'bg-neutral-50 border-neutral-200 text-neutral-800'">
              <p>{{ selectedMessage.mensaje }}</p>
            </div>

            <!-- Response / Reply Area -->
            <div class="border-t pt-4 space-y-3" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
              
              <!-- Quick Response Templates -->
              <div class="flex items-center gap-2 flex-wrap text-xs">
                <span class="text-[10px] font-bold uppercase tracking-wider opacity-50">Plantillas:</span>
                <button (click)="applyTemplate('Gracias por contactarnos. Hemos recibido tu mensaje y nos pondremos en contacto a la brevedad.')"
                        class="px-2.5 py-1 rounded-lg border text-[10px] transition-all cursor-pointer"
                        [ngClass]="isDark ? 'border-neutral-800 text-neutral-400 hover:text-white' : 'border-neutral-200 text-neutral-600 hover:text-black'">
                  Agradecimiento
                </button>
                <button (click)="applyTemplate('Hola, con gusto podemos agendar una reunión o llamada para revisar los detalles del proyecto.')"
                        class="px-2.5 py-1 rounded-lg border text-[10px] transition-all cursor-pointer"
                        [ngClass]="isDark ? 'border-neutral-800 text-neutral-400 hover:text-white' : 'border-neutral-200 text-neutral-600 hover:text-black'">
                  Agendar Llamada
                </button>
              </div>

              <textarea [(ngModel)]="replyText" rows="3"
                        placeholder="Escribe una respuesta o nota interna..."
                        class="w-full px-4 py-3 rounded-2xl text-xs font-sans border outline-none transition-all resize-none"
                        [ngClass]="isDark ? 'bg-neutral-950 border-neutral-800 text-white placeholder-neutral-600 focus:border-neutral-600' : 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400'"></textarea>

              <div class="flex items-center justify-between">
                <button (click)="toggleRead(selectedMessage.id!)"
                        class="text-xs font-headline font-semibold border px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                        [ngClass]="isDark ? 'border-neutral-800 text-neutral-400 hover:text-white' : 'border-neutral-200 text-neutral-600 hover:text-black'">
                  {{ selectedMessage.status === 'read' || selectedMessage.status === 'replied' ? 'Marcar como no leído' : 'Marcar como leído' }}
                </button>

                <button (click)="sendReply(selectedMessage)" [disabled]="!replyText.trim()"
                        class="px-5 py-2 rounded-xl text-xs font-headline font-bold uppercase tracking-wider transition-all cursor-pointer border shadow-sm disabled:opacity-50"
                        [ngClass]="isDark ? 'bg-white text-black border-white hover:bg-neutral-200' : 'bg-black text-white border-black hover:bg-neutral-800'">
                  Registrar Respuesta
                </button>
              </div>

            </div>

          </ng-container>

          <ng-template #noSelection>
            <div class="my-auto text-center py-16 space-y-3 opacity-50">
              <svg class="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>
              <h4 class="text-sm font-headline font-bold">Selecciona un mensaje</h4>
              <p class="text-xs">Haz clic en un remitente de la lista para leer el contenido y responder.</p>
            </div>
          </ng-template>

        </div>

      </div>

    </div>
  `,
  styles: [`
    .tab-enter { animation: tabEnter 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes tabEnter {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class DashMessagesComponent implements OnInit {
  @Input() theme = 'light';
  @Output() dataChange = new EventEmitter<void>();

  private messagesService = inject(MessagesService);

  messagesList: ContactMessage[] = [];
  selectedMessage: ContactMessage | null = null;
  searchQuery = '';

  activeFilter = 'all';
  filterOptions = [
    { id: 'all', label: 'Todos' },
    { id: 'unread', label: 'Nuevos' },
    { id: 'read', label: 'Leídos' },
    { id: 'replied', label: 'Respondidos' },
  ];

  replyText = '';

  get isDark() { return this.theme === 'dark'; }

  get unreadCount(): number {
    return this.messagesList.filter(m => m.status === 'unread').length;
  }

  get repliedCount(): number {
    return this.messagesList.filter(m => m.status === 'replied').length;
  }

  get filtered(): ContactMessage[] {
    return this.messagesList.filter(m => {
      let matchFilter = true;
      if (this.activeFilter === 'unread') matchFilter = m.status === 'unread';
      if (this.activeFilter === 'read') matchFilter = m.status === 'read';
      if (this.activeFilter === 'replied') matchFilter = m.status === 'replied';

      if (!matchFilter) return false;

      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        const nameMatch = (m.nombre || '').toLowerCase().includes(q);
        const emailMatch = (m.correo || '').toLowerCase().includes(q);
        const msgMatch = (m.mensaje || '').toLowerCase().includes(q);
        return nameMatch || emailMatch || msgMatch;
      }

      return true;
    });
  }

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages() {
    this.messagesService.getMessages().subscribe({
      next: (msgs) => {
        this.messagesList = msgs;
        if (this.messagesList.length > 0 && !this.selectedMessage) {
          this.selectedMessage = this.messagesList[0];
        }
      },
      error: (err) => console.error('Error loading messages', err)
    });
  }

  selectMessage(msg: ContactMessage) {
    this.selectedMessage = msg;
    if (msg.status === 'unread' && msg.id) {
      this.toggleRead(msg.id, 'read');
    }
  }

  toggleRead(id: number, forceStatus?: 'read' | 'unread') {
    const msg = this.messagesList.find(m => m.id === id);
    if (msg) {
      const newStatus = forceStatus || (msg.status === 'unread' ? 'read' : 'unread');
      msg.status = newStatus;
      this.messagesService.updateStatus(id, newStatus).subscribe({
        next: () => this.dataChange.emit(),
        error: (err) => console.error('Error updating status', err)
      });
    }
  }

  deleteMessage(id: number) {
    if (confirm('¿Eliminar este mensaje de forma permanente?')) {
      this.messagesService.deleteMessage(id).subscribe({
        next: () => {
          this.messagesList = this.messagesList.filter(m => m.id !== id);
          if (this.selectedMessage?.id === id) {
            this.selectedMessage = this.messagesList[0] || null;
          }
          this.dataChange.emit();
        },
        error: (err) => console.error('Error deleting message', err)
      });
    }
  }

  applyTemplate(text: string) {
    this.replyText = text;
  }

  copyEmail(email: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email);
      alert('Correo copiado al portapapeles: ' + email);
    }
  }

  sendReply(msg: ContactMessage) {
    if (!this.replyText.trim() || !msg.id) return;
    
    this.messagesService.updateStatus(msg.id, 'replied').subscribe({
      next: () => {
        msg.status = 'replied';
        this.replyText = '';
        this.dataChange.emit();
      },
      error: (err) => console.error('Error marking as replied', err)
    });
  }
}
