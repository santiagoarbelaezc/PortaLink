import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagesService, ContactMessage } from '../../../services/messages.service';
import { TeleportToBodyDirective } from '../../../shared/directives/teleport-to-body.directive';

@Component({
  selector: 'app-dash-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [DatePipe],
  template: `
    <ng-container *ngIf="!isLoading || messagesList.length > 0; else skeleton">
      <div class="space-y-6 tab-enter font-sans">

        <!-- ══════════════════════════════════════
             HEADER: CONTENEDOR NEGRO SLIM & EXECUTIVE CONTROLS
        ══════════════════════════════════════ -->
        <div class="bg-[#09090b] text-white rounded-[22px] border border-neutral-800 p-5 sm:p-6 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <!-- Círculos concéntricos decorativos sutiles de fondo -->
          <div class="absolute -right-8 -bottom-8 w-44 h-44 rounded-full border border-neutral-800/40 pointer-events-none"></div>
          <div class="absolute -right-4 -bottom-4 w-32 h-32 rounded-full border border-neutral-800/25 pointer-events-none"></div>

          <div class="relative z-10">
            <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-neutral-800 bg-neutral-900/90 text-[10px] font-sans text-neutral-300 mb-2">
              <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              <span>Centro de Comunicación & Mensajería</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl border flex items-center justify-center bg-neutral-900/90 border-neutral-800 mb-0 shrink-0"
                   style="color: #ffffff !important;">
                <span class="material-symbols-rounded text-xl" style="color: #ffffff !important;">chat</span>
              </div>
              <h2 class="text-2xl sm:text-3xl lg:text-[32px] font-headline font-black tracking-tight leading-[1.1] text-white m-0 dark-card-white"
                  style="color: #ffffff !important;">
                Mensajes
              </h2>
            </div>
          </div>

          <!-- Controls: Refresh & Bulk Actions -->
          <div class="relative z-10 flex flex-wrap items-center gap-2.5">
            <!-- Refresh Button -->
            <button type="button"
                    (click)="loadMessages()"
                    class="inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-headline font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer border active:scale-95 border-neutral-800 bg-[#141419] text-neutral-300 hover:text-white hover:bg-neutral-800"
                    title="Actualizar bandeja">
              <span class="material-symbols-rounded" [class.animate-spin]="isLoading" style="font-size: 16px;">refresh</span>
              <span>Actualizar</span>
            </button>

            <!-- Mark all as read button -->
            <button *ngIf="unreadCount > 0"
                    type="button"
                    (click)="markAllAsRead()"
                    class="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-headline font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md active:scale-95 border border-white hover:bg-neutral-200"
                    style="background-color: #ffffff !important; color: #09090b !important;">
              <span class="material-symbols-rounded" style="font-size: 16px; color: #09090b !important;">done_all</span>
              <span style="color: #09090b !important;">Marcar Leídos ({{ unreadCount }})</span>
            </button>
          </div>
        </div>

        <!-- Feedback Toast Notification -->
        <div *ngIf="toastMessage" class="p-4 rounded-2xl border flex items-center justify-between shadow-lg transition-all animate-dropdown"
             [ngClass]="toastType === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : (toastType === 'info' ? 'bg-neutral-800 border-neutral-700 text-neutral-200' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400')">
          <div class="flex items-center gap-3">
            <span class="w-2 h-2 rounded-full" [ngClass]="toastType === 'error' ? 'bg-red-400' : (toastType === 'info' ? 'bg-neutral-400' : 'bg-emerald-400')"></span>
            <span class="text-xs font-headline font-bold uppercase tracking-wider">{{ toastMessage }}</span>
          </div>
          <button (click)="toastMessage = ''" class="text-xs opacity-70 hover:opacity-100 p-1 cursor-pointer">✕</button>
        </div>

        <!-- ══════════════════════════════════════
             4 KPI STAT CARDS (ULTRA-MINIMALIST SLATE & RED)
        ══════════════════════════════════════ -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-5">

          <!-- Stat 1: Nuevos Sin Leer -->
          <div class="rounded-2xl border p-4 sm:p-5 transition-all duration-200 flex flex-col justify-between"
               [ngClass]="isDark ? 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700' : 'bg-white border-neutral-200/80 hover:border-neutral-300 shadow-[0_2px_12px_rgba(0,0,0,0.02)]'">
            <div class="flex items-center justify-between text-neutral-400 mb-2">
              <span class="text-[11px] font-headline font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Mensajes Nuevos</span>
              <span class="material-symbols-rounded text-neutral-400" style="font-size: 19px;">mark_email_unread</span>
            </div>
            <div>
              <p class="text-xl sm:text-2xl md:text-3xl font-headline font-extrabold tracking-tight m-0"
                 [ngClass]="unreadCount > 0 ? (isDark ? 'text-white' : 'text-neutral-900') : (isDark ? 'text-neutral-400' : 'text-neutral-500')">
                {{ unreadCount }}
              </p>
              <p class="text-xs text-neutral-500 m-0 mt-2 font-sans flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                <span class="text-neutral-400">{{ unreadCount > 0 ? 'Requieren atención' : 'Bandeja al día' }}</span>
              </p>
            </div>
          </div>

          <!-- Stat 2: Tasa de Respuesta -->
          <div class="rounded-2xl border p-4 sm:p-5 transition-all duration-200 flex flex-col justify-between"
               [ngClass]="isDark ? 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700' : 'bg-white border-neutral-200/80 hover:border-neutral-300 shadow-[0_2px_12px_rgba(0,0,0,0.02)]'">
            <div class="flex items-center justify-between text-neutral-400 mb-2">
              <span class="text-[11px] font-headline font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Tasa de Respuesta</span>
              <span class="material-symbols-rounded text-neutral-400" style="font-size: 19px;">speed</span>
            </div>
            <div>
              <p class="text-xl sm:text-2xl md:text-3xl font-headline font-extrabold tracking-tight m-0"
                 [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                {{ responseRate }}%
              </p>
              <p class="text-xs text-neutral-500 m-0 mt-2 font-sans flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                <span class="text-neutral-400">{{ repliedCount }} de {{ messagesList.length }} atendidos</span>
              </p>
            </div>
          </div>

          <!-- Stat 3: Mensajes Respondidos -->
          <div class="rounded-2xl border p-4 sm:p-5 transition-all duration-200 flex flex-col justify-between"
               [ngClass]="isDark ? 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700' : 'bg-white border-neutral-200/80 hover:border-neutral-300 shadow-[0_2px_12px_rgba(0,0,0,0.02)]'">
            <div class="flex items-center justify-between text-neutral-400 mb-2">
              <span class="text-[11px] font-headline font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Atendidos</span>
              <span class="material-symbols-rounded text-neutral-400" style="font-size: 19px;">check_circle</span>
            </div>
            <div>
              <p class="text-xl sm:text-2xl md:text-3xl font-headline font-extrabold tracking-tight m-0"
                 [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                {{ repliedCount }}
              </p>
              <p class="text-xs text-neutral-500 m-0 mt-2 font-sans flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                <span class="text-neutral-400">Respuestas gestionadas</span>
              </p>
            </div>
          </div>

          <!-- Stat 4: Total Mensajes -->
          <div class="rounded-2xl border p-4 sm:p-5 transition-all duration-200 flex flex-col justify-between"
               [ngClass]="isDark ? 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700' : 'bg-white border-neutral-200/80 hover:border-neutral-300 shadow-[0_2px_12px_rgba(0,0,0,0.02)]'">
            <div class="flex items-center justify-between text-neutral-400 mb-2">
              <span class="text-[11px] font-headline font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Total Recibidos</span>
              <span class="material-symbols-rounded text-neutral-400" style="font-size: 19px;">inbox</span>
            </div>
            <div>
              <p class="text-xl sm:text-2xl md:text-3xl font-headline font-extrabold tracking-tight m-0"
                 [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                {{ messagesList.length }}
              </p>
              <p class="text-xs text-neutral-500 m-0 mt-2 font-sans flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                <span class="text-neutral-400">{{ readCount }} leídos en sistema</span>
              </p>
            </div>
          </div>

        </div>

        <!-- ══════════════════════════════════════
             SEARCH & FILTER DOCK
        ══════════════════════════════════════ -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <!-- Search Input -->
          <div class="relative flex-1">
            <span class="material-symbols-rounded absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" style="font-size: 18px;">search</span>
            <input type="text" [(ngModel)]="searchQuery" placeholder="Buscar por remitente, correo o contenido..."
                   class="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs font-sans border outline-none transition-colors"
                   [ngClass]="isDark ? 'bg-[#141419] border-neutral-800 text-white placeholder-neutral-500 focus:border-white' : 'bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-black'">
            <button *ngIf="searchQuery" (click)="searchQuery = ''"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs cursor-pointer">
              ✕
            </button>
          </div>

          <!-- Filter Options Dock -->
          <div class="flex items-center gap-1 p-1 rounded-2xl border backdrop-blur-xl overflow-x-auto no-scrollbar shrink-0"
               [ngClass]="isDark ? 'bg-[#141419] border-neutral-800' : 'bg-neutral-100 border-neutral-200'">
            <button *ngFor="let f of filterOptions; trackBy: trackByFilter"
                    (click)="activeFilter = f.id"
                    class="px-3.5 py-1.5 rounded-xl text-xs font-headline font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer border flex items-center gap-1.5 whitespace-nowrap shrink-0"
                    [ngClass]="activeFilter === f.id
                      ? (isDark ? 'shadow-md border-white' : 'shadow-md border-[#09090b]')
                      : (isDark ? 'border-transparent text-neutral-400 hover:text-white' : 'border-transparent text-neutral-600 hover:text-black')"
                    [style.background-color]="activeFilter === f.id ? (isDark ? '#ffffff !important' : '#09090b !important') : 'transparent'"
                    [style.color]="activeFilter === f.id ? (isDark ? '#09090b !important' : '#ffffff !important') : (isDark ? '#a1a1aa !important' : '#52525b !important')">
              <span *ngIf="activeFilter === f.id" class="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
              <span>{{ f.label }}</span>
              <span *ngIf="f.id === 'unread' && unreadCount > 0" class="text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5"
                    [ngClass]="activeFilter === 'unread' ? 'bg-red-500 text-white' : 'bg-red-500/20 text-red-400'">
                {{ unreadCount }}
              </span>
            </button>
          </div>
        </div>

        <!-- ══════════════════════════════════════
             SPLIT INBOX LAYOUT (List + Detail Pane)
        ══════════════════════════════════════ -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
          
          <!-- LEFT COLUMN: Messages Feed (5 of 12 cols) -->
          <div class="lg:col-span-5 rounded-[20px] xs:rounded-[24px] sm:rounded-[28px] border overflow-hidden flex flex-col max-h-[680px] transition-all duration-300"
               [ngClass]="isDark ? 'bg-neutral-900/70 border-neutral-800 shadow-[0_10px_35px_rgba(0,0,0,0.4)]' : 'bg-white border-neutral-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.03)]'">
            
            <!-- Feed Header -->
            <div class="px-5 py-3.5 border-b flex items-center justify-between text-xs font-headline font-bold uppercase tracking-wider"
                 [ngClass]="isDark ? 'border-neutral-800 text-neutral-400 bg-neutral-950/40' : 'border-neutral-200 text-neutral-500 bg-neutral-50'">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span>Bandeja ({{ filtered.length }})</span>
              </div>
              <span class="font-mono text-[10px] opacity-60">Recientes</span>
            </div>

            <!-- Feed Items List -->
            <div class="divide-y overflow-y-auto custom-scrollbar flex-grow" [ngClass]="isDark ? 'divide-neutral-800/80' : 'divide-neutral-100'">
              
              <div *ngFor="let msg of filtered; trackBy: trackByMsg"
                   (click)="selectMessage(msg)"
                   class="p-4 transition-all duration-200 cursor-pointer relative group"
                   [ngClass]="[
                     selectedMessage?.id === msg.id 
                       ? (isDark ? 'bg-neutral-800/90' : 'bg-neutral-100') 
                       : (isDark ? 'hover:bg-neutral-800/40' : 'hover:bg-neutral-50'),
                     msg.status === 'unread' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-transparent'
                   ]">

                <div class="flex items-start gap-3">
                  <!-- Avatar Initials -->
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 border"
                       [ngClass]="msg.status === 'unread' 
                         ? (isDark ? 'bg-red-500/15 text-red-400 border-red-500/30' : 'bg-red-50 text-red-600 border-red-200')
                         : (isDark ? 'bg-[#141419] text-neutral-300 border-neutral-800' : 'bg-neutral-100 text-neutral-700 border-neutral-200')">
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
                      <span *ngIf="msg.status === 'unread'" class="text-[9px] font-headline font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500 text-white shadow-xs">
                        Nuevo
                      </span>
                      <span *ngIf="msg.status === 'replied'" class="text-[9px] font-headline font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Respondido
                      </span>
                      <span *ngIf="msg.status === 'read'" class="text-[9px] font-headline font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
                        Leído
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div *ngIf="filtered.length === 0" class="p-12 text-center text-xs opacity-50 space-y-2">
                <span class="material-symbols-rounded text-neutral-500" style="font-size: 32px;">inbox</span>
                <p class="font-headline font-medium">No se encontraron mensajes en esta vista.</p>
              </div>

            </div>
          </div>

          <!-- RIGHT COLUMN: Message Detail & Reply Reader (7 of 12 cols) -->
          <div class="lg:col-span-7 rounded-[20px] xs:rounded-[24px] sm:rounded-[28px] border p-5 sm:p-7 flex flex-col space-y-6 transition-all duration-300 min-h-[550px]"
               [ngClass]="isDark ? 'bg-neutral-900/70 border-neutral-800 shadow-[0_10px_35px_rgba(0,0,0,0.4)]' : 'bg-white border-neutral-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.03)]'">
            
            <ng-container *ngIf="selectedMessage; else noSelection">
              
              <!-- Message Reader Header -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4"
                   [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
                <div class="flex items-center gap-3.5">
                  <div class="w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold shrink-0 border shadow-xs"
                       [ngClass]="isDark ? 'border-white' : 'border-[#09090b]'"
                       [style.background-color]="isDark ? '#ffffff !important' : '#09090b !important'"
                       [style.color]="isDark ? '#09090b !important' : '#ffffff !important'">
                    <span [style.color]="isDark ? '#09090b !important' : '#ffffff !important'">
                      {{ selectedMessage.nombre ? selectedMessage.nombre.charAt(0).toUpperCase() : 'U' }}
                    </span>
                  </div>
                  <div>
                    <h3 class="text-base font-headline font-bold" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                      {{ selectedMessage.nombre }}
                    </h3>
                    <p class="text-xs font-mono opacity-70">{{ selectedMessage.correo }}</p>
                    <p class="text-[10px] opacity-40 mt-0.5 font-sans">{{ selectedMessage.created_at | date:'fullDate' }} · {{ selectedMessage.created_at | date:'shortTime' }}</p>
                  </div>
                </div>

                <!-- Quick Contact Actions Toolbar -->
                <div class="flex items-center gap-2 flex-wrap">
                  <button type="button"
                          (click)="copyEmail(selectedMessage.correo)"
                          class="px-3 py-1.5 rounded-xl text-xs font-headline font-semibold border transition-all duration-200 cursor-pointer flex items-center gap-1.5 active:scale-95"
                          [ngClass]="isDark ? 'border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 bg-[#141419]' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-100 bg-neutral-50'"
                          title="Copiar Correo">
                    <span class="material-symbols-rounded" style="font-size: 15px;">content_copy</span>
                    <span>Copiar Email</span>
                  </button>

                  <a [href]="'mailto:' + selectedMessage.correo"
                     class="px-3.5 py-1.5 rounded-xl text-xs font-headline font-bold uppercase tracking-wider border transition-all duration-200 cursor-pointer inline-flex items-center gap-1.5 active:scale-95 shadow-sm"
                     [ngClass]="isDark ? 'border-white hover:bg-neutral-200' : 'border-[#09090b] hover:bg-neutral-800'"
                     [style.background-color]="isDark ? '#ffffff !important' : '#09090b !important'"
                     [style.color]="isDark ? '#09090b !important' : '#ffffff !important'">
                    <span class="material-symbols-rounded" style="font-size: 15px;" [style.color]="isDark ? '#09090b !important' : '#ffffff !important'">mail</span>
                    <span [style.color]="isDark ? '#09090b !important' : '#ffffff !important'">Redactar</span>
                  </a>

                  <button type="button"
                          (click)="selectedMessage.id && confirmDelete(selectedMessage.id)"
                          class="p-2 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-all duration-200 active:scale-95"
                          title="Eliminar Mensaje">
                    <span class="material-symbols-rounded" style="font-size: 16px;">delete</span>
                  </button>
                </div>
              </div>

              <!-- Message Content Box -->
              <div class="rounded-2xl p-5 border flex-grow space-y-3 leading-relaxed text-sm whitespace-pre-wrap font-sans"
                   [ngClass]="isDark ? 'bg-neutral-950/60 border-neutral-800 text-neutral-200' : 'bg-neutral-50 border-neutral-200 text-neutral-800'">
                <p>{{ selectedMessage.mensaje }}</p>
              </div>

              <!-- Response / Reply Area -->
              <div class="border-t pt-4 space-y-3.5" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
                
                <!-- Quick Response Templates -->
                <div class="flex items-center gap-2 flex-wrap text-xs">
                  <span class="text-[10px] font-headline font-bold uppercase tracking-wider opacity-50 flex items-center gap-1">
                    <span class="material-symbols-rounded" style="font-size: 14px;">bolt</span>
                    Plantillas:
                  </span>
                  
                  <button type="button"
                          (click)="applyTemplate('Gracias por contactarnos. Hemos recibido tu mensaje y nos pondremos en contacto a la brevedad.')"
                          class="px-3 py-1 rounded-xl border text-[10px] font-headline font-semibold transition-all duration-200 cursor-pointer active:scale-95"
                          [ngClass]="isDark ? 'border-neutral-800 text-neutral-400 hover:text-white bg-[#141419]' : 'border-neutral-200 text-neutral-600 hover:text-black bg-neutral-50'">
                    Agradecimiento
                  </button>

                  <button type="button"
                          (click)="applyTemplate('Hola, con gusto podemos agendar una reunión o llamada para revisar los detalles del proyecto.')"
                          class="px-3 py-1 rounded-xl border text-[10px] font-headline font-semibold transition-all duration-200 cursor-pointer active:scale-95"
                          [ngClass]="isDark ? 'border-neutral-800 text-neutral-400 hover:text-white bg-[#141419]' : 'border-neutral-200 text-neutral-600 hover:text-black bg-neutral-50'">
                    Agendar Llamada
                  </button>

                  <button type="button"
                          (click)="applyTemplate('Hemos revisado tu requerimiento. Adjuntamos la información solicitada para tu consulta.')"
                          class="px-3 py-1 rounded-xl border text-[10px] font-headline font-semibold transition-all duration-200 cursor-pointer active:scale-95"
                          [ngClass]="isDark ? 'border-neutral-800 text-neutral-400 hover:text-white bg-[#141419]' : 'border-neutral-200 text-neutral-600 hover:text-black bg-neutral-50'">
                    Info Solicitada
                  </button>

                  <button type="button"
                          (click)="applyTemplate('Con gusto podemos preparar una propuesta formal a la medida de tus necesidades.')"
                          class="px-3 py-1 rounded-xl border text-[10px] font-headline font-semibold transition-all duration-200 cursor-pointer active:scale-95"
                          [ngClass]="isDark ? 'border-neutral-800 text-neutral-400 hover:text-white bg-[#141419]' : 'border-neutral-200 text-neutral-600 hover:text-black bg-neutral-50'">
                    Cotización
                  </button>
                </div>

                <textarea [(ngModel)]="replyText" rows="3"
                          placeholder="Escribe una respuesta o nota interna registrada en sistema..."
                          class="w-full px-4 py-3 rounded-2xl text-xs font-sans border outline-none transition-all resize-none"
                          [ngClass]="isDark ? 'bg-neutral-950 border-neutral-800 text-white placeholder-neutral-600 focus:border-white' : 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-black'"></textarea>

                <div class="flex items-center justify-between gap-3 flex-wrap">
                  <button type="button"
                          (click)="toggleRead(selectedMessage.id!)"
                          class="text-xs font-headline font-semibold border px-3.5 py-2 rounded-xl transition-all cursor-pointer active:scale-95"
                          [ngClass]="isDark ? 'border-neutral-800 text-neutral-400 hover:text-white bg-[#141419]' : 'border-neutral-200 text-neutral-600 hover:text-black bg-neutral-50'">
                    {{ selectedMessage.status === 'read' || selectedMessage.status === 'replied' ? 'Marcar como no leído' : 'Marcar como leído' }}
                  </button>

                  <button type="button"
                          (click)="sendReply(selectedMessage)" [disabled]="!replyText.trim()"
                          class="px-5 py-2.5 rounded-xl text-xs font-headline font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer border shadow-sm disabled:opacity-40 flex items-center gap-2 active:scale-95"
                          [ngClass]="isDark ? 'border-white hover:bg-neutral-200' : 'border-[#09090b] hover:bg-neutral-800'"
                          [style.background-color]="isDark ? '#ffffff !important' : '#09090b !important'"
                          [style.color]="isDark ? '#09090b !important' : '#ffffff !important'">
                    <span class="material-symbols-rounded" style="font-size: 16px;" [style.color]="isDark ? '#09090b !important' : '#ffffff !important'">send</span>
                    <span [style.color]="isDark ? '#09090b !important' : '#ffffff !important'">Registrar Respuesta</span>
                  </button>
                </div>

              </div>

            </ng-container>

            <ng-template #noSelection>
              <div class="my-auto text-center py-16 space-y-3 opacity-50">
                <span class="material-symbols-rounded text-neutral-400" style="font-size: 44px;">mark_chat_unread</span>
                <h4 class="text-sm font-headline font-bold">Selecciona un mensaje</h4>
                <p class="text-xs">Haz clic en un remitente de la lista lateral para leer el contenido y registrar respuestas.</p>
              </div>
            </ng-template>

          </div>

        </div>

        <!-- ══════════════════════════════════════
             MODAL DE CONFIRMACIÓN DE ELIMINACIÓN
        ══════════════════════════════════════ -->
        <div *ngIf="showDeleteModal" appTeleportToBody class="modal-backdrop fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
          <div class="w-full max-w-md rounded-[28px] border p-6 space-y-5 shadow-2xl transition-all"
               [ngClass]="isDark ? 'bg-[#0c0c0e] border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'">
            
            <div class="flex items-center gap-3 text-rose-500">
              <div class="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <span class="material-symbols-rounded text-rose-500" style="font-size: 20px;">warning</span>
              </div>
              <div>
                <h3 class="text-sm font-headline font-bold uppercase tracking-wider">¿Eliminar mensaje?</h3>
                <p class="text-xs opacity-60 font-sans">Esta acción no se puede deshacer.</p>
              </div>
            </div>

            <p class="text-xs leading-relaxed opacity-80 font-sans">
              Se eliminará el mensaje permanentemente de la base de datos de mensajes y contactos de PortaLink.
            </p>

            <div class="flex items-center justify-end gap-3 border-t pt-4" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
              <button type="button"
                      (click)="cancelDelete()"
                      class="px-4 py-2 rounded-xl text-xs font-headline font-bold uppercase tracking-wider border transition-all cursor-pointer"
                      [ngClass]="isDark ? 'border-neutral-800 text-neutral-400 hover:text-white bg-[#141419]' : 'border-neutral-200 text-neutral-600 hover:text-black bg-neutral-50'">
                Cancelar
              </button>
              <button type="button"
                      (click)="executeDelete()"
                      class="px-4 py-2 rounded-xl text-xs font-headline font-bold uppercase tracking-wider bg-rose-600 text-white hover:bg-rose-700 transition-all shadow-sm cursor-pointer border border-rose-600">
                Eliminar Definitivamente
              </button>
            </div>
          </div>
        </div>

      </div>
    </ng-container>

    <!-- ══════════════════════════════════════
         SKELETON LOADER
    ══════════════════════════════════════ -->
    <ng-template #skeleton>
      <div class="space-y-6 animate-pulse font-sans">
        
        <!-- Header Skeleton -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4"
             [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
          <div class="space-y-2">
            <div class="h-3 w-36 rounded-full" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
            <div class="h-7 w-48 rounded-xl" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
          </div>
          <div class="flex items-center gap-2">
            <div class="h-10 w-28 rounded-xl" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
            <div class="h-10 w-36 rounded-xl" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
          </div>
        </div>

        <!-- 4 KPI Stat Cards Skeleton -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-5">
          <div *ngFor="let _ of [1,2,3,4]" 
               class="rounded-2xl border p-4 sm:p-5 flex flex-col justify-between h-28 xs:h-32 sm:h-36"
               [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800/80' : 'bg-white border-neutral-200/80'">
            <div class="flex items-center justify-between">
              <div class="h-3 w-20 rounded-full" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
              <div class="w-6 h-6 rounded-lg" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
            </div>
            <div class="space-y-1.5">
              <div class="h-6 sm:h-7 w-20 rounded-lg" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
              <div class="h-2.5 w-24 rounded-full" [ngClass]="isDark ? 'bg-neutral-800/60' : 'bg-neutral-200/60'"></div>
            </div>
          </div>
        </div>

        <!-- Search & Filter Skeleton -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="h-10 w-full sm:w-80 rounded-2xl" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
          <div class="h-10 w-64 rounded-2xl" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
        </div>

        <!-- Split Layout Skeleton -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div class="lg:col-span-5 rounded-[24px] border p-4 h-[500px]" [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
            <div class="space-y-3">
              <div *ngFor="let _ of [1,2,3,4]" class="h-20 rounded-xl" [ngClass]="isDark ? 'bg-neutral-800/50' : 'bg-neutral-100'"></div>
            </div>
          </div>
          <div class="lg:col-span-7 rounded-[24px] border p-6 h-[500px]" [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
            <div class="space-y-4">
              <div class="h-12 w-48 rounded-xl" [ngClass]="isDark ? 'bg-neutral-800/60' : 'bg-neutral-200/60'"></div>
              <div class="h-44 w-full rounded-2xl" [ngClass]="isDark ? 'bg-neutral-800/40' : 'bg-neutral-100'"></div>
              <div class="h-24 w-full rounded-2xl" [ngClass]="isDark ? 'bg-neutral-800/40' : 'bg-neutral-100'"></div>
            </div>
          </div>
        </div>

      </div>
    </ng-template>
  `,
  styles: [`
    .tab-enter { animation: tabEnter 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes tabEnter {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.98); }
      to   { opacity: 1; transform: scale(1); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(150, 150, 150, 0.2);
      border-radius: 999px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(150, 150, 150, 0.4);
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

  get isDark(): boolean {
    return this.theme === 'dark';
  }

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
