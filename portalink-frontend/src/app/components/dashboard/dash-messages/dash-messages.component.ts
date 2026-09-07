import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagesService, ContactMessage } from '../../../services/messages.service';
import { TeleportToBodyDirective } from '../../../shared/directives/teleport-to-body.directive';

@Component({
  selector: 'app-dash-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, TeleportToBodyDirective],
  providers: [DatePipe],
  template: `
    <div class="space-y-6 tab-enter font-sans">

      <!-- ══════════════════════════════════════
           HEADER & EXECUTIVE CONTROLS
      ══════════════════════════════════════ -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5"
           [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <p class="text-xs font-headline font-semibold uppercase tracking-[0.25em]"
               [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Módulo de Comunicación</p>
          </div>
          <h2 class="text-2xl sm:text-3xl font-headline font-bold tracking-tight mt-1"
              [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
            Mensajes & Contactos
          </h2>
        </div>

        <!-- Controls: Refresh & Bulk Actions -->
        <div class="flex flex-wrap items-center gap-3">
          <button (click)="loadMessages()"
                  class="px-4 py-2 rounded-full text-xs font-headline font-semibold uppercase tracking-wider border transition-all duration-300 cursor-pointer flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                  [ngClass]="isDark ? 'border-neutral-700 text-neutral-200 hover:bg-neutral-800 bg-neutral-900/60' : 'border-neutral-200 text-neutral-800 bg-neutral-100 hover:bg-neutral-200'">
            <svg class="w-3.5 h-3.5 opacity-70" [class.animate-spin]="isLoading" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span>Actualizar</span>
          </button>

          <button *ngIf="unreadCount > 0" (click)="markAllAsRead()"
                  class="px-4.5 py-2 rounded-full text-xs font-headline font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-2 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                  [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-[#09090b] text-white hover:bg-neutral-800'">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span>Marcar Leídos ({{ unreadCount }})</span>
          </button>
        </div>
      </div>

      <!-- Feedback Toast Notification -->
      <div *ngIf="toastMessage" class="p-4 rounded-2xl border flex items-center justify-between shadow-lg transition-all animate-fadeIn"
           [ngClass]="toastType === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : (toastType === 'info' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400')">
        <div class="flex items-center gap-3">
          <span class="w-2 h-2 rounded-full" [ngClass]="toastType === 'error' ? 'bg-red-400' : (toastType === 'info' ? 'bg-blue-400' : 'bg-emerald-400')"></span>
          <span class="text-xs font-headline font-bold uppercase tracking-wider">{{ toastMessage }}</span>
        </div>
        <button (click)="toastMessage = ''" class="text-xs opacity-70 hover:opacity-100 p-1">✕</button>
      </div>

      <!-- ══════════════════════════════════════
           EXECUTIVE METRICS KPI GRID
      ══════════════════════════════════════ -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

        <!-- 1. Nuevos Sin Leer -->
        <div class="rounded-[24px] border p-6 space-y-3 relative overflow-hidden transition-all duration-300 group hover:border-neutral-500 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80'">
          <div class="flex items-center justify-between">
            <span class="text-xs font-headline font-semibold uppercase tracking-wider opacity-60">Mensajes Nuevos</span>
            <span class="text-[10px] font-headline font-semibold px-2.5 py-0.5 rounded-full border tracking-wider"
                  [ngClass]="unreadCount > 0 ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' : 'border-neutral-700 text-neutral-400 bg-neutral-800/40'">
              {{ unreadCount > 0 ? 'Pendientes' : 'Al Día' }}
            </span>
          </div>
          <div class="space-y-1">
            <p class="text-xl sm:text-2xl font-headline font-bold tracking-tight"
               [ngClass]="unreadCount > 0 ? 'text-blue-400' : (isDark ? 'text-white' : 'text-neutral-900')">
              {{ unreadCount }}
            </p>
            <p class="text-xs opacity-50 font-normal">Requieren atención o lectura</p>
          </div>
          <div class="pt-2">
            <div class="w-full bg-neutral-800/60 rounded-full h-1.5 overflow-hidden">
              <div class="bg-blue-500 h-1.5 rounded-full transition-all duration-700" [style.width.%]="(unreadCount / (messagesList.length || 1)) * 100"></div>
            </div>
          </div>
        </div>

        <!-- 2. Tasa de Respuesta -->
        <div class="rounded-[24px] border p-6 space-y-3 relative overflow-hidden transition-all duration-300 group hover:border-neutral-500 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80'">
          <div class="flex items-center justify-between">
            <span class="text-xs font-headline font-semibold uppercase tracking-wider opacity-60">Tasa de Respuesta</span>
            <span class="text-[10px] font-headline font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 tracking-wider">
              {{ responseRate }}% Eficiencia
            </span>
          </div>
          <div class="space-y-1">
            <p class="text-xl sm:text-2xl font-headline font-bold tracking-tight text-emerald-400">
              {{ responseRate }}%
            </p>
            <p class="text-xs opacity-50 font-normal">Mensajes contestados</p>
          </div>
          <div class="pt-2">
            <div class="w-full bg-neutral-800/60 rounded-full h-1.5 overflow-hidden">
              <div class="bg-emerald-400 h-1.5 rounded-full transition-all duration-700" [style.width.%]="responseRate"></div>
            </div>
          </div>
        </div>

        <!-- 3. Mensajes Respondidos -->
        <div class="rounded-[24px] border p-6 space-y-3 relative overflow-hidden transition-all duration-300 group hover:border-neutral-500 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80'">
          <div class="flex items-center justify-between">
            <span class="text-xs font-headline font-semibold uppercase tracking-wider opacity-60">Respondidos</span>
            <span class="text-[10px] font-headline font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 tracking-wider">
              Completados
            </span>
          </div>
          <div class="space-y-1">
            <p class="text-xl sm:text-2xl font-headline font-bold tracking-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              {{ repliedCount }}
            </p>
            <p class="text-xs opacity-50 font-normal">Con seguimiento o respuesta enviada</p>
          </div>
          <div class="pt-2">
            <svg class="w-full h-7 stroke-current text-emerald-400/40 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 100 25">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M0 20 Q 25 5, 50 12 T 100 2" />
            </svg>
          </div>
        </div>

        <!-- 4. Total Mensajes -->
        <div class="rounded-[24px] border p-6 space-y-3 relative overflow-hidden transition-all duration-300 group hover:border-neutral-500 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80'">
          <div class="flex items-center justify-between">
            <span class="text-xs font-headline font-semibold uppercase tracking-wider opacity-60">Total Recibidos</span>
            <span class="text-[10px] font-headline font-semibold px-2.5 py-0.5 rounded-full border border-neutral-700 text-neutral-300 bg-neutral-800/40 tracking-wider">
              Bandeja General
            </span>
          </div>
          <div class="space-y-1">
            <p class="text-xl sm:text-2xl font-headline font-bold tracking-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              {{ messagesList.length }}
            </p>
            <p class="text-xs opacity-50 font-normal">Contactos almacenados en sistema</p>
          </div>
          <div class="pt-2 flex items-center justify-between text-xs font-medium opacity-70">
            <span>Leídos: {{ readCount }}</span>
            <span>Nuevos: {{ unreadCount }}</span>
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
                 class="w-full pl-10 pr-4 py-3 rounded-2xl text-xs font-headline border outline-none transition-all duration-200"
                 [ngClass]="isDark ? 'bg-neutral-900/80 border-neutral-800 text-white placeholder-neutral-500 focus:border-neutral-600' : 'bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400'">
          <svg class="w-4 h-4 absolute left-3.5 top-3.5 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>

        <!-- Filter Options Pills -->
        <div class="md:col-span-5 flex items-center justify-start md:justify-end gap-1.5 flex-wrap">
          <button *ngFor="let f of filterOptions; trackBy: trackByFilter"
                  (click)="activeFilter = f.id"
                  class="px-4 py-2 rounded-xl text-[11px] font-headline font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer border"
                  [ngClass]="activeFilter === f.id
                    ? (isDark ? 'bg-white text-black border-white shadow-sm' : 'bg-[#09090b] text-white border-[#09090b] shadow-sm')
                    : (isDark ? 'border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 bg-neutral-900/60' : 'border-neutral-200 text-neutral-600 bg-neutral-50 hover:bg-neutral-100')">
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
          
          <div class="px-5 py-3.5 border-b flex items-center justify-between text-xs font-headline font-bold uppercase tracking-wider"
               [ngClass]="isDark ? 'border-neutral-800 text-neutral-400 bg-neutral-950/40' : 'border-neutral-200 text-neutral-500 bg-neutral-50'">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Mensajes ({{ filtered.length }})</span>
            </div>
            <span class="font-mono text-[10px] opacity-60">Más recientes primero</span>
          </div>

          <div class="divide-y overflow-y-auto custom-scrollbar flex-grow" [ngClass]="isDark ? 'divide-neutral-800/80' : 'divide-neutral-100'">
            
            <div *ngFor="let msg of filtered; trackBy: trackByMsg"
                 (click)="selectMessage(msg)"
                 class="p-4 transition-all duration-200 cursor-pointer relative group"
                 [ngClass]="[
                   selectedMessage?.id === msg.id 
                     ? (isDark ? 'bg-neutral-800/90' : 'bg-neutral-100') 
                     : (isDark ? 'hover:bg-neutral-800/40' : 'hover:bg-neutral-50'),
                   msg.status === 'unread' ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'
                 ]">

              <div class="flex items-start gap-3">
                <!-- Avatar Initials -->
                <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold shrink-0 border"
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

                  <p class="text-[11px] truncate mb-1 opacity-70" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-600'">
                    {{ msg.correo }}
                  </p>

                  <p class="text-xs line-clamp-2 leading-relaxed opacity-80" [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">
                    {{ msg.mensaje }}
                  </p>

                  <!-- Status badges -->
                  <div class="flex items-center gap-2 mt-2.5">
                    <span *ngIf="msg.status === 'unread'" class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Nuevo
                    </span>
                    <span *ngIf="msg.status === 'replied'" class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Respondido
                    </span>
                    <span *ngIf="msg.status === 'read'" class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-800/80 text-neutral-400 border border-neutral-700">
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
        <div class="lg:col-span-7 rounded-[28px] border p-6 flex flex-col space-y-6 shadow-[0_10px_35px_rgba(0,0,0,0.03)] min-h-[550px]"
             [ngClass]="isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-white border-neutral-200'">
          
          <ng-container *ngIf="selectedMessage; else noSelection">
            
            <!-- Message Reader Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5"
                 [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
              <div class="flex items-center gap-3.5">
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

              <!-- Quick Contact Actions Toolbar -->
              <div class="flex items-center gap-2 flex-wrap">
                <button (click)="copyEmail(selectedMessage.correo)"
                        class="px-3.5 py-2 rounded-xl text-xs font-headline font-semibold border transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                        [ngClass]="isDark ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800 bg-neutral-900/60' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-100 bg-neutral-50'"
                        title="Copiar Correo">
                  <svg class="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.757c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                  <span>Copiar Email</span>
                </button>

                <a [href]="'mailto:' + selectedMessage.correo"
                   class="px-3.5 py-2 rounded-xl text-xs font-headline font-semibold border transition-all duration-200 cursor-pointer inline-flex items-center gap-1.5"
                   [ngClass]="isDark ? 'bg-white text-black border-white hover:bg-neutral-200' : 'bg-black text-white border-black hover:bg-neutral-800'">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <span>Redactar</span>
                </a>

                <button (click)="selectedMessage.id && confirmDelete(selectedMessage.id)"
                        class="p-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 cursor-pointer transition-all duration-200"
                        title="Eliminar Mensaje">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>

            <!-- Message Content Box -->
            <div class="rounded-2xl p-5 border flex-grow space-y-3 leading-relaxed text-sm whitespace-pre-wrap font-sans shadow-inner"
                 [ngClass]="isDark ? 'bg-neutral-950/60 border-neutral-800 text-neutral-200' : 'bg-neutral-50/80 border-neutral-200 text-neutral-800'">
              <p>{{ selectedMessage.mensaje }}</p>
            </div>

            <!-- Response / Reply Area -->
            <div class="border-t pt-4 space-y-3.5" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
              
              <!-- Quick Response Templates -->
              <div class="flex items-center gap-2 flex-wrap text-xs">
                <span class="text-[10px] font-headline font-bold uppercase tracking-wider opacity-50">Plantillas Rápidas:</span>
                
                <button (click)="applyTemplate('Gracias por contactarnos. Hemos recibido tu mensaje y nos pondremos en contacto a la brevedad.')"
                        class="px-3 py-1 rounded-lg border text-[10px] font-headline font-medium transition-all duration-200 cursor-pointer hover:scale-[1.02]"
                        [ngClass]="isDark ? 'border-neutral-800 text-neutral-400 hover:text-white bg-neutral-900/60' : 'border-neutral-200 text-neutral-600 hover:text-black bg-neutral-50'">
                  Agradecimiento
                </button>

                <button (click)="applyTemplate('Hola, con gusto podemos agendar una reunión o llamada para revisar los detalles del proyecto.')"
                        class="px-3 py-1 rounded-lg border text-[10px] font-headline font-medium transition-all duration-200 cursor-pointer hover:scale-[1.02]"
                        [ngClass]="isDark ? 'border-neutral-800 text-neutral-400 hover:text-white bg-neutral-900/60' : 'border-neutral-200 text-neutral-600 hover:text-black bg-neutral-50'">
                  Agendar Llamada
                </button>

                <button (click)="applyTemplate('Hemos revisado tu requerimiento. Adjuntamos la información solicitada para tu consulta.')"
                        class="px-3 py-1 rounded-lg border text-[10px] font-headline font-medium transition-all duration-200 cursor-pointer hover:scale-[1.02]"
                        [ngClass]="isDark ? 'border-neutral-800 text-neutral-400 hover:text-white bg-neutral-900/60' : 'border-neutral-200 text-neutral-600 hover:text-black bg-neutral-50'">
                  Info Solicitada
                </button>

                <button (click)="applyTemplate('Con gusto podemos preparar una propuesta formal a la medida de tus necesidades.')"
                        class="px-3 py-1 rounded-lg border text-[10px] font-headline font-medium transition-all duration-200 cursor-pointer hover:scale-[1.02]"
                        [ngClass]="isDark ? 'border-neutral-800 text-neutral-400 hover:text-white bg-neutral-900/60' : 'border-neutral-200 text-neutral-600 hover:text-black bg-neutral-50'">
                  Enviar Cotización
                </button>
              </div>

              <textarea [(ngModel)]="replyText" rows="3"
                        placeholder="Escribe una respuesta o nota interna..."
                        class="w-full px-4 py-3 rounded-2xl text-xs font-sans border outline-none transition-all resize-none"
                        [ngClass]="isDark ? 'bg-neutral-950 border-neutral-800 text-white placeholder-neutral-600 focus:border-neutral-600' : 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400'"></textarea>

              <div class="flex items-center justify-between">
                <button (click)="toggleRead(selectedMessage.id!)"
                        class="text-xs font-headline font-semibold border px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                        [ngClass]="isDark ? 'border-neutral-800 text-neutral-400 hover:text-white bg-neutral-900/60' : 'border-neutral-200 text-neutral-600 hover:text-black bg-neutral-50'">
                  {{ selectedMessage.status === 'read' || selectedMessage.status === 'replied' ? 'Marcar como no leído' : 'Marcar como leído' }}
                </button>

                <button (click)="sendReply(selectedMessage)" [disabled]="!replyText.trim()"
                        class="px-5 py-2.5 rounded-xl text-xs font-headline font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer border shadow-sm disabled:opacity-50 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                        [ngClass]="isDark ? 'bg-white text-black border-white hover:bg-neutral-200' : 'bg-black text-white border-black hover:bg-neutral-800'">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                  <span>Registrar Respuesta</span>
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

      <!-- ══════════════════════════════════════
           MODAL DE CONFIRMACIÓN DE ELIMINACIÓN
      ══════════════════════════════════════ -->
      <div *ngIf="showDeleteModal" appTeleportToBody class="modal-backdrop fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
        <div class="w-full max-w-md rounded-[28px] border p-6 space-y-5 shadow-2xl transition-all sm:-translate-y-6 md:-translate-y-8"
             [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'">
          
          <div class="flex items-center gap-3 text-red-400">
            <div class="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-headline font-bold uppercase tracking-wider">¿Eliminar mensaje?</h3>
              <p class="text-xs opacity-60">Esta acción no se puede deshacer.</p>
            </div>
          </div>

          <p class="text-xs leading-relaxed opacity-80">
            Se eliminará el mensaje permanentemente de la base de datos de mensajes y contactos.
          </p>

          <div class="flex items-center justify-end gap-3 border-t pt-4" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
            <button (click)="cancelDelete()"
                    class="px-4 py-2 rounded-xl text-xs font-headline font-semibold uppercase tracking-wider border transition-all"
                    [ngClass]="isDark ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-100'">
              Cancelar
            </button>
            <button (click)="executeDelete()"
                    class="px-4 py-2 rounded-xl text-xs font-headline font-bold uppercase tracking-wider bg-red-500 text-white hover:bg-red-600 transition-all shadow-sm">
              Eliminar Definitivamente
            </button>
          </div>
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
  isLoading = false;

  toastMessage = '';
  toastType: 'success' | 'error' | 'info' = 'success';

  showDeleteModal = false;
  pendingDeleteId: number | null = null;

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

  get readCount(): number {
    return this.messagesList.filter(m => m.status === 'read').length;
  }

  get repliedCount(): number {
    return this.messagesList.filter(m => m.status === 'replied').length;
  }

  get responseRate(): number {
    if (this.messagesList.length === 0) return 100;
    return Math.round((this.repliedCount / this.messagesList.length) * 100);
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

  showToast(msg: string, type: 'success' | 'error' | 'info' = 'success') {
    this.toastMessage = msg;
    this.toastType = type;
    setTimeout(() => {
      if (this.toastMessage === msg) {
        this.toastMessage = '';
      }
    }, 3500);
  }

  loadMessages() {
    this.isLoading = true;
    this.messagesService.getMessages().subscribe({
      next: (msgs) => {
        this.messagesList = msgs || [];
        if (this.messagesList.length > 0 && !this.selectedMessage) {
          this.selectedMessage = this.messagesList[0];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading messages', err);
        this.isLoading = false;
        this.showToast('Error al cargar mensajes', 'error');
      }
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
        next: () => {
          this.dataChange.emit();
          if (forceStatus !== 'read') {
            this.showToast(`Mensaje marcado como ${newStatus === 'read' ? 'leído' : 'no leído'}`);
          }
        },
        error: (err) => console.error('Error updating status', err)
      });
    }
  }

  markAllAsRead() {
    const unread = this.messagesList.filter(m => m.status === 'unread');
    if (unread.length === 0) return;

    let completed = 0;
    unread.forEach(m => {
      if (m.id) {
        m.status = 'read';
        this.messagesService.updateStatus(m.id, 'read').subscribe({
          next: () => {
            completed++;
            if (completed === unread.length) {
              this.dataChange.emit();
              this.showToast('Todos los mensajes han sido marcados como leídos');
            }
          }
        });
      }
    });
  }

  confirmDelete(id: number) {
    this.pendingDeleteId = id;
    this.showDeleteModal = true;
  }

  cancelDelete() {
    this.pendingDeleteId = null;
    this.showDeleteModal = false;
  }

  executeDelete() {
    if (!this.pendingDeleteId) return;
    const id = this.pendingDeleteId;
    this.messagesService.deleteMessage(id).subscribe({
      next: () => {
        this.messagesList = this.messagesList.filter(m => m.id !== id);
        if (this.selectedMessage?.id === id) {
          this.selectedMessage = this.messagesList[0] || null;
        }
        this.dataChange.emit();
        this.showToast('Mensaje eliminado correctamente', 'info');
        this.cancelDelete();
      },
      error: (err) => {
        console.error('Error deleting message', err);
        this.showToast('Error al eliminar mensaje', 'error');
        this.cancelDelete();
      }
    });
  }

  applyTemplate(text: string) {
    this.replyText = text;
  }

  copyEmail(email: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email);
      this.showToast(`Correo copiado: ${email}`, 'info');
    }
  }

  sendReply(msg: ContactMessage) {
    if (!this.replyText.trim() || !msg.id) return;
    
    this.messagesService.updateStatus(msg.id, 'replied').subscribe({
      next: () => {
        msg.status = 'replied';
        this.replyText = '';
        this.dataChange.emit();
        this.showToast('Respuesta registrada correctamente');
      },
      error: (err) => {
        console.error('Error marking as replied', err);
        this.showToast('Error al registrar respuesta', 'error');
      }
    });
  }

  trackByMsg(index: number, msg: ContactMessage): number {
    return msg.id || index;
  }

  trackByFilter(index: number, f: any): string {
    return f.id || index.toString();
  }
}
