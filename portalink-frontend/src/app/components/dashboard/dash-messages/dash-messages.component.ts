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
      <div class="space-y-3.5 tab-enter font-sans">

        <!-- ══════════════════════════════════════
             HEADER: CONTENEDOR NEGRO SLIM & EXECUTIVE CONTROLS
        ══════════════════════════════════════ -->
        <div class="bg-[#09090b] text-white rounded-[20px] border border-neutral-800 px-4 py-3.5 sm:px-5 sm:py-4 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
          <!-- Círculos concéntricos decorativos sutiles de fondo -->
          <div class="absolute -right-8 -bottom-8 w-36 h-36 rounded-full border border-neutral-800/40 pointer-events-none"></div>
          <div class="absolute -right-4 -bottom-4 w-24 h-24 rounded-full border border-neutral-800/25 pointer-events-none"></div>

          <div class="relative z-10 flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl border flex items-center justify-center bg-neutral-900/90 border-neutral-800 shrink-0"
                 style="color: #ffffff !important;">
              <span class="material-symbols-rounded text-lg" style="color: #ffffff !important;">chat</span>
            </div>
            <div>
              <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-neutral-800 bg-neutral-900/90 text-[9px] font-sans text-neutral-300 mb-0.5">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span>Centro de Comunicación & Mensajería</span>
              </div>
              <h2 class="text-xl sm:text-2xl font-headline font-bold tracking-tight leading-none text-white m-0 dark-card-white"
                  style="color: #ffffff !important;">
                Mensajes
              </h2>
            </div>
          </div>

          <!-- Controls: Refresh & Bulk Actions -->
          <div class="relative z-10 flex flex-wrap items-center gap-2">
            <button type="button"
                    (click)="loadMessages()"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-headline font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer border active:scale-95 border-neutral-800 bg-[#141419] text-neutral-300 hover:text-white hover:bg-neutral-800"
                    title="Actualizar bandeja">
              <span class="material-symbols-rounded" [class.animate-spin]="isLoading" style="font-size: 15px;">refresh</span>
              <span>Actualizar</span>
            </button>

            <button *ngIf="unreadCount > 0"
                    type="button"
                    (click)="markAllAsRead()"
                    class="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-headline font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md active:scale-95 border border-white hover:bg-neutral-200"
                    style="background-color: #ffffff !important; color: #09090b !important;">
              <span class="material-symbols-rounded" style="font-size: 15px; color: #09090b !important;">done_all</span>
              <span style="color: #09090b !important;">Marcar Leídos ({{ unreadCount }})</span>
            </button>
          </div>
        </div>

        <!-- Feedback Toast Notification -->
        <div *ngIf="toastMessage" class="px-4 py-2.5 rounded-xl border flex items-center justify-between shadow-lg transition-all animate-dropdown"
             [ngClass]="toastType === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : (toastType === 'info' ? 'bg-neutral-800 border-neutral-700 text-neutral-200' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400')">
          <div class="flex items-center gap-2.5">
            <span class="w-2 h-2 rounded-full" [ngClass]="toastType === 'error' ? 'bg-red-400' : (toastType === 'info' ? 'bg-neutral-400' : 'bg-emerald-400')"></span>
            <span class="text-xs font-headline font-semibold uppercase tracking-wider">{{ toastMessage }}</span>
          </div>
          <button (click)="toastMessage = ''" class="text-xs opacity-70 hover:opacity-100 p-1 cursor-pointer">✕</button>
        </div>

        <!-- ══════════════════════════════════════
             4 KPI STAT CARDS (COMPACT MINIMALIST FINTECH STYLE)
        ══════════════════════════════════════ -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">

          <!-- Stat 1: Nuevos Sin Leer -->
          <div (click)="activeFilter = 'unread'"
               class="rounded-2xl border p-3.5 sm:p-4 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-0.5 cursor-pointer"
               [ngClass]="isDark ? 'bg-neutral-900/80 border-neutral-800 hover:border-red-900/40 shadow-[0_2px_12px_rgba(0,0,0,0.2)]' : 'bg-white border-neutral-200/80 hover:border-red-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[10px] sm:text-[11px] font-headline font-semibold uppercase tracking-wider text-neutral-400">Mensajes Nuevos</span>
              <div class="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                   [ngClass]="unreadCount > 0
                     ? (isDark ? 'bg-red-950/30 border border-red-500/25 text-red-400' : 'bg-red-50 border border-red-200 text-red-600')
                     : (isDark ? 'bg-neutral-800/80 text-neutral-300 group-hover:text-white' : 'bg-neutral-100 text-neutral-600 group-hover:text-neutral-900')">
                <span class="material-symbols-rounded" style="font-size: 16px;">mark_email_unread</span>
              </div>
            </div>
            <div>
              <p class="text-xl sm:text-2xl font-headline font-semibold tracking-tight leading-none m-0"
                 [ngClass]="unreadCount > 0 ? 'text-red-500 dark:text-red-400' : (isDark ? 'text-white' : 'text-neutral-900')">
                {{ unreadCount }}
              </p>
              <div class="mt-2 pt-2 border-t flex items-center justify-between text-[11px]"
                   [ngClass]="isDark ? 'border-neutral-800/80' : 'border-neutral-100'">
                <span class="text-neutral-500 flex items-center gap-1.5 truncate">
                  <span class="w-1.5 h-1.5 rounded-full shrink-0" [ngClass]="unreadCount > 0 ? 'bg-red-500' : 'bg-neutral-400'"></span>
                  <span class="truncate">{{ unreadCount > 0 ? 'Por atender' : 'Bandeja al día' }}</span>
                </span>
                <span class="text-[10px] font-headline font-semibold px-2 py-0.5 rounded-full border shrink-0"
                      [ngClass]="unreadCount > 0
                        ? 'border-red-500/30 bg-red-500/10 text-red-500 dark:text-red-400'
                        : (isDark ? 'bg-neutral-950/60 border-neutral-800 text-neutral-400' : 'bg-neutral-50 border-neutral-200 text-neutral-600')">
                  {{ unreadCount > 0 ? 'Pendientes' : '0 sin leer' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Stat 2: Tasa de Respuesta -->
          <div class="rounded-2xl border p-3.5 sm:p-4 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-0.5 relative overflow-hidden"
               [ngClass]="isDark ? 'bg-neutral-900/80 border-neutral-800 hover:border-red-900/30 shadow-[0_2px_12px_rgba(0,0,0,0.2)]' : 'bg-white border-neutral-200/80 hover:border-red-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'">
            <div class="absolute top-0 left-0 right-0 h-[2px] bg-red-500 opacity-80"></div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[10px] sm:text-[11px] font-headline font-semibold uppercase tracking-wider text-neutral-400">Tasa de Respuesta</span>
              <div class="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                   [ngClass]="isDark ? 'bg-red-950/30 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-100 text-red-600'">
                <span class="material-symbols-rounded" style="font-size: 16px;">speed</span>
              </div>
            </div>
            <div>
              <p class="text-xl sm:text-2xl font-headline font-semibold tracking-tight leading-none m-0"
                 [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                {{ responseRate }}%
              </p>
              <div class="mt-2 pt-2 border-t flex items-center justify-between text-[11px]"
                   [ngClass]="isDark ? 'border-neutral-800/80' : 'border-neutral-100'">
                <span class="text-neutral-500 flex items-center gap-1.5 truncate">
                  <span class="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                  <span class="truncate"><strong class="font-medium" [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">{{ repliedCount }}</strong> de <strong class="font-medium" [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">{{ messagesList.length }}</strong></span>
                </span>
                <span class="text-[10px] font-headline font-semibold px-2 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 dark:text-red-400 shrink-0">
                  {{ responseRate }}% Atendido
                </span>
              </div>
            </div>
          </div>

          <!-- Stat 3: Mensajes Respondidos -->
          <div (click)="activeFilter = 'replied'"
               class="rounded-2xl border p-3.5 sm:p-4 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-0.5 cursor-pointer"
               [ngClass]="isDark ? 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 shadow-[0_2px_12px_rgba(0,0,0,0.2)]' : 'bg-white border-neutral-200/80 hover:border-neutral-300 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[10px] sm:text-[11px] font-headline font-semibold uppercase tracking-wider text-neutral-400">Atendidos</span>
              <div class="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                   [ngClass]="isDark ? 'bg-neutral-800/80 text-neutral-300 group-hover:text-white' : 'bg-neutral-100 text-neutral-600 group-hover:text-neutral-900'">
                <span class="material-symbols-rounded" style="font-size: 16px;">check_circle</span>
              </div>
            </div>
            <div>
              <p class="text-xl sm:text-2xl font-headline font-semibold tracking-tight leading-none m-0"
                 [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                {{ repliedCount }}
              </p>
              <div class="mt-2 pt-2 border-t flex items-center justify-between text-[11px]"
                   [ngClass]="isDark ? 'border-neutral-800/80' : 'border-neutral-100'">
                <span class="text-neutral-500 flex items-center gap-1.5 truncate">
                  <span class="w-1.5 h-1.5 rounded-full bg-neutral-400 shrink-0"></span>
                  <span class="truncate">Respuestas enviadas</span>
                </span>
                <span class="text-[10px] font-sans font-medium px-2 py-0.5 rounded-full border shrink-0"
                      [ngClass]="isDark ? 'bg-neutral-950/60 border-neutral-800 text-neutral-400' : 'bg-neutral-50 border-neutral-200 text-neutral-600'">
                  Gestionados
                </span>
              </div>
            </div>
          </div>

          <!-- Stat 4: Total Mensajes -->
          <div (click)="activeFilter = 'all'"
               class="rounded-2xl border p-3.5 sm:p-4 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-0.5 cursor-pointer"
               [ngClass]="isDark ? 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 shadow-[0_2px_12px_rgba(0,0,0,0.2)]' : 'bg-white border-neutral-200/80 hover:border-neutral-300 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[10px] sm:text-[11px] font-headline font-semibold uppercase tracking-wider text-neutral-400">Total Recibidos</span>
              <div class="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                   [ngClass]="isDark ? 'bg-neutral-800/80 text-neutral-300 group-hover:text-red-400' : 'bg-neutral-100 text-neutral-600 group-hover:text-red-600'">
                <span class="material-symbols-rounded" style="font-size: 16px;">inbox</span>
              </div>
            </div>
            <div>
              <p class="text-xl sm:text-2xl font-headline font-semibold tracking-tight leading-none m-0"
                 [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                {{ messagesList.length }}
              </p>
              <div class="mt-2 pt-2 border-t flex items-center justify-between text-[11px]"
                   [ngClass]="isDark ? 'border-neutral-800/80' : 'border-neutral-100'">
                <span class="text-neutral-500 flex items-center gap-1.5 truncate">
                  <span class="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                  <span class="truncate"><strong class="font-medium" [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">{{ readCount }}</strong> leídos</span>
                </span>
                <span class="text-[10px] font-sans font-medium px-2 py-0.5 rounded-full border shrink-0"
                      [ngClass]="isDark ? 'bg-neutral-950/60 border-neutral-800 text-neutral-400' : 'bg-neutral-50 border-neutral-200 text-neutral-600'">
                  Bandeja global
                </span>
              </div>
            </div>
          </div>

        </div>

        <!-- ══════════════════════════════════════
             UNIFIED WORKSPACE: SPLIT INBOX + READER (ZERO-SCROLL VIEWPORT FIT)
        ══════════════════════════════════════ -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch lg:h-[calc(100vh-285px)] lg:min-h-[430px] lg:max-h-[580px]">
          
          <!-- LEFT COLUMN: Search, Filters & Messages Feed (5 of 12 cols) -->
          <div class="lg:col-span-5 rounded-2xl border overflow-hidden flex flex-col h-[420px] lg:h-full transition-all duration-300"
               [ngClass]="isDark ? 'bg-neutral-900/80 border-neutral-800 shadow-[0_2px_12px_rgba(0,0,0,0.2)]' : 'bg-white border-neutral-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'">
            
            <!-- Integrated Search & Filter Header inside Left Pane -->
            <div class="p-3 border-b space-y-2.5 shrink-0"
                 [ngClass]="isDark ? 'border-neutral-800 bg-neutral-950/40' : 'border-neutral-200/80 bg-neutral-50/60'">
              
              <!-- Search Input + Counter -->
              <div class="flex items-center gap-2">
                <div class="relative flex-1">
                  <span class="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" style="font-size: 15px;">search</span>
                  <input type="text" [(ngModel)]="searchQuery" placeholder="Buscar remitente, correo o texto..."
                         class="w-full pl-8 pr-7 py-1.5 rounded-xl text-xs font-sans border outline-none transition-colors"
                         [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500 focus:border-red-500/60' : 'bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400'">
                  <button *ngIf="searchQuery" (click)="searchQuery = ''"
                          class="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-[11px] cursor-pointer">
                    ✕
                  </button>
                </div>
                <span class="text-[10px] font-headline font-semibold px-2.5 py-1.5 rounded-xl border shrink-0"
                      [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-300' : 'bg-white border-neutral-200 text-neutral-700'"
                      title="Mensajes en lista">
                  {{ filtered.length }}
                </span>
              </div>

              <!-- Compact Filter Tabs -->
              <div class="flex items-center gap-1 p-0.5 rounded-xl border overflow-x-auto no-scrollbar"
                   [ngClass]="isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-neutral-100 border-neutral-200'">
                <button *ngFor="let f of filterOptions; trackBy: trackByFilter"
                        (click)="activeFilter = f.id"
                        class="flex-1 px-2.5 py-1 rounded-lg text-[10px] font-headline font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap"
                        [ngClass]="activeFilter === f.id
                          ? (isDark ? 'bg-white text-neutral-900 shadow-xs' : 'bg-neutral-900 text-white shadow-xs')
                          : (isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900')">
                  <span *ngIf="activeFilter === f.id" class="w-1 h-1 rounded-full bg-red-500 shrink-0"></span>
                  <span>{{ f.label }}</span>
                  <span *ngIf="f.id === 'unread' && unreadCount > 0"
                        class="text-[9px] font-headline font-semibold px-1.5 py-0.2 rounded-full"
                        [ngClass]="activeFilter === 'unread' ? 'bg-red-500 text-white' : 'bg-red-500/15 text-red-500 dark:text-red-400'">
                    {{ unreadCount }}
                  </span>
                </button>
              </div>
            </div>

            <!-- Feed Items List (Scrolls internally) -->
            <div class="divide-y overflow-y-auto custom-scrollbar flex-1 min-h-0" [ngClass]="isDark ? 'divide-neutral-800/70' : 'divide-neutral-100'">
              
              <div *ngFor="let msg of filtered; trackBy: trackByMsg"
                   (click)="selectMessage(msg)"
                   class="px-3.5 py-3 transition-all duration-150 cursor-pointer relative group"
                   [ngClass]="[
                     selectedMessage?.id === msg.id 
                       ? (isDark ? 'bg-neutral-800/80' : 'bg-neutral-100/90') 
                       : (isDark ? 'hover:bg-neutral-800/35' : 'hover:bg-neutral-50'),
                     msg.status === 'unread' ? 'border-l-[3px] border-l-red-500' : 'border-l-[3px] border-l-transparent'
                   ]">

                <div class="flex items-start gap-2.5">
                  <!-- Avatar Initials -->
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-headline font-semibold shrink-0 border mt-0.5"
                       [ngClass]="msg.status === 'unread' 
                         ? (isDark ? 'bg-red-500/15 text-red-400 border-red-500/30' : 'bg-red-50 text-red-600 border-red-200')
                         : (isDark ? 'bg-neutral-950 text-neutral-300 border-neutral-800' : 'bg-neutral-100 text-neutral-700 border-neutral-200')">
                    {{ msg.nombre ? msg.nombre.charAt(0).toUpperCase() : 'U' }}
                  </div>

                  <!-- Text & Meta -->
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between gap-1.5">
                      <div class="flex items-center gap-1.5 min-w-0">
                        <h4 class="text-xs font-headline font-semibold truncate m-0" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                          {{ msg.nombre || 'Anónimo' }}
                        </h4>
                        <span *ngIf="msg.status === 'unread'" class="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" title="Nuevo"></span>
                        <span *ngIf="msg.status === 'replied'" class="text-[9px] font-headline font-semibold px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                          Respondido
                        </span>
                      </div>
                      <span class="text-[10px] text-neutral-400 shrink-0 font-mono">
                        {{ msg.created_at | date:'dd/MM HH:mm' }}
                      </span>
                    </div>

                    <p class="text-[11px] truncate m-0 mt-0.5 text-neutral-400 font-mono">
                      {{ msg.correo }}
                    </p>

                    <p class="text-xs line-clamp-1 leading-snug m-0 mt-1" [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-600'">
                      {{ msg.mensaje }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div *ngIf="filtered.length === 0" class="p-10 text-center text-xs opacity-50 space-y-1.5">
                <span class="material-symbols-rounded text-neutral-500" style="font-size: 28px;">inbox</span>
                <p class="font-headline font-medium m-0">No se encontraron mensajes en esta vista.</p>
              </div>

            </div>
          </div>

          <!-- RIGHT COLUMN: Message Detail & Reply Reader (7 of 12 cols) -->
          <div class="lg:col-span-7 rounded-2xl border flex flex-col h-[460px] lg:h-full overflow-hidden transition-all duration-300"
               [ngClass]="isDark ? 'bg-neutral-900/80 border-neutral-800 shadow-[0_2px_12px_rgba(0,0,0,0.2)]' : 'bg-white border-neutral-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'">
            
            <ng-container *ngIf="selectedMessage; else noSelection">
              
              <!-- Message Reader Header (Compact & Fixed at Top) -->
              <div class="px-4 py-3 sm:px-5 sm:py-3.5 border-b flex flex-wrap items-center justify-between gap-3 shrink-0"
                   [ngClass]="isDark ? 'border-neutral-800 bg-neutral-950/30' : 'border-neutral-200/80 bg-neutral-50/50'">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-headline font-semibold shrink-0 border shadow-xs"
                       [ngClass]="isDark ? 'border-white' : 'border-[#09090b]'"
                       [style.background-color]="isDark ? '#ffffff !important' : '#09090b !important'"
                       [style.color]="isDark ? '#09090b !important' : '#ffffff !important'">
                    <span [style.color]="isDark ? '#09090b !important' : '#ffffff !important'">
                      {{ selectedMessage.nombre ? selectedMessage.nombre.charAt(0).toUpperCase() : 'U' }}
                    </span>
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <h3 class="text-sm font-headline font-semibold truncate m-0" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                        {{ selectedMessage.nombre }}
                      </h3>
                      <span class="text-[9px] font-headline font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0"
                            [ngClass]="selectedMessage.status === 'unread'
                              ? 'bg-red-500/10 text-red-500 border-red-500/30'
                              : (selectedMessage.status === 'replied'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : (isDark ? 'bg-neutral-800 text-neutral-400 border-neutral-700' : 'bg-neutral-100 text-neutral-600 border-neutral-200'))">
                        {{ selectedMessage.status === 'unread' ? 'Nuevo' : (selectedMessage.status === 'replied' ? 'Respondido' : 'Leído') }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2 text-[11px] text-neutral-400 truncate mt-0.5">
                      <span class="font-mono truncate">{{ selectedMessage.correo }}</span>
                      <span>·</span>
                      <span class="font-sans shrink-0">{{ selectedMessage.created_at | date:'dd MMM yyyy, HH:mm' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Quick Contact Actions Toolbar -->
                <div class="flex items-center gap-1.5 shrink-0">
                  <button type="button"
                          (click)="toggleRead(selectedMessage.id!)"
                          class="p-1.5 rounded-lg border transition-all cursor-pointer active:scale-95"
                          [ngClass]="isDark ? 'border-neutral-800 text-neutral-400 hover:text-white bg-neutral-900' : 'border-neutral-200 text-neutral-600 hover:text-black bg-white'"
                          [title]="selectedMessage.status === 'read' || selectedMessage.status === 'replied' ? 'Marcar como no leído' : 'Marcar como leído'">
                    <span class="material-symbols-rounded" style="font-size: 16px;">
                      {{ selectedMessage.status === 'unread' ? 'mark_email_read' : 'mark_email_unread' }}
                    </span>
                  </button>

                  <button type="button"
                          (click)="copyEmail(selectedMessage.correo)"
                          class="px-2.5 py-1.5 rounded-lg text-[11px] font-headline font-semibold border transition-all duration-200 cursor-pointer flex items-center gap-1 active:scale-95"
                          [ngClass]="isDark ? 'border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 bg-neutral-900' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-100 bg-white'"
                          title="Copiar Correo">
                    <span class="material-symbols-rounded" style="font-size: 14px;">content_copy</span>
                    <span class="hidden sm:inline">Copiar</span>
                  </button>

                  <a [href]="'mailto:' + selectedMessage.correo"
                     class="px-3 py-1.5 rounded-lg text-[11px] font-headline font-semibold uppercase tracking-wider border transition-all duration-200 cursor-pointer inline-flex items-center gap-1 active:scale-95 shadow-xs"
                     [ngClass]="isDark ? 'border-white hover:bg-neutral-200' : 'border-[#09090b] hover:bg-neutral-800'"
                     [style.background-color]="isDark ? '#ffffff !important' : '#09090b !important'"
                     [style.color]="isDark ? '#09090b !important' : '#ffffff !important'">
                    <span class="material-symbols-rounded" style="font-size: 14px;" [style.color]="isDark ? '#09090b !important' : '#ffffff !important'">mail</span>
                    <span [style.color]="isDark ? '#09090b !important' : '#ffffff !important'">Correo</span>
                  </a>

                  <button type="button"
                          (click)="selectedMessage.id && confirmDelete(selectedMessage.id)"
                          class="p-1.5 rounded-lg border border-red-500/25 text-red-400 hover:bg-red-500/10 cursor-pointer transition-all duration-200 active:scale-95"
                          title="Eliminar Mensaje">
                    <span class="material-symbols-rounded" style="font-size: 16px;">delete</span>
                  </button>
                </div>
              </div>

              <!-- Message Content Box (Scrolls internally without stretching page) -->
              <div class="p-4 sm:p-5 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                <div class="rounded-xl p-4 border leading-relaxed text-xs sm:text-sm whitespace-pre-wrap font-sans"
                     [ngClass]="isDark ? 'bg-neutral-950/60 border-neutral-800/80 text-neutral-200' : 'bg-neutral-50/80 border-neutral-200/80 text-neutral-800'">
                  <p class="m-0">{{ selectedMessage.mensaje }}</p>
                </div>
              </div>

              <!-- Compact Response / Reply Area (Docked at Bottom) -->
              <div class="px-4 py-3 sm:px-5 sm:py-3.5 border-t space-y-2.5 shrink-0"
                   [ngClass]="isDark ? 'border-neutral-800 bg-neutral-950/40' : 'border-neutral-200/80 bg-neutral-50/40'">
                
                <!-- Quick Response Templates -->
                <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
                  <span class="text-[10px] font-headline font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1 shrink-0 mr-1">
                    <span class="material-symbols-rounded text-red-500" style="font-size: 13px;">bolt</span>
                    <span>Plantillas:</span>
                  </span>
                  
                  <button type="button"
                          (click)="applyTemplate('Gracias por contactarnos. Hemos recibido tu mensaje y nos pondremos en contacto a la brevedad.')"
                          class="px-2.5 py-1 rounded-lg border text-[10px] font-headline font-medium transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
                          [ngClass]="isDark ? 'border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 bg-neutral-900' : 'border-neutral-200 text-neutral-600 hover:text-black bg-white'">
                    Agradecimiento
                  </button>

                  <button type="button"
                          (click)="applyTemplate('Hola, con gusto podemos agendar una reunión o llamada para revisar los detalles del proyecto.')"
                          class="px-2.5 py-1 rounded-lg border text-[10px] font-headline font-medium transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
                          [ngClass]="isDark ? 'border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 bg-neutral-900' : 'border-neutral-200 text-neutral-600 hover:text-black bg-white'">
                    Agendar Llamada
                  </button>

                  <button type="button"
                          (click)="applyTemplate('Hemos revisado tu requerimiento. Adjuntamos la información solicitada para tu consulta.')"
                          class="px-2.5 py-1 rounded-lg border text-[10px] font-headline font-medium transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
                          [ngClass]="isDark ? 'border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 bg-neutral-900' : 'border-neutral-200 text-neutral-600 hover:text-black bg-white'">
                    Info Solicitada
                  </button>

                  <button type="button"
                          (click)="applyTemplate('Con gusto podemos preparar una propuesta formal a la medida de tus necesidades.')"
                          class="px-2.5 py-1 rounded-lg border text-[10px] font-headline font-medium transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
                          [ngClass]="isDark ? 'border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 bg-neutral-900' : 'border-neutral-200 text-neutral-600 hover:text-black bg-white'">
                    Cotización
                  </button>
                </div>

                <!-- Inline Textarea + Submit Button -->
                <div class="flex items-end gap-2">
                  <textarea [(ngModel)]="replyText" rows="2"
                            placeholder="Escribe una respuesta o nota interna para registrar..."
                            class="flex-1 px-3.5 py-2 rounded-xl text-xs font-sans border outline-none transition-all resize-none"
                            [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500 focus:border-red-500/60' : 'bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400'"></textarea>

                  <button type="button"
                          (click)="sendReply(selectedMessage)" [disabled]="!replyText.trim()"
                          class="px-4 py-2.5 rounded-xl text-xs font-headline font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer border shadow-xs disabled:opacity-40 flex items-center gap-1.5 active:scale-95 shrink-0 h-[54px]"
                          [ngClass]="isDark ? 'border-white hover:bg-neutral-200' : 'border-[#09090b] hover:bg-neutral-800'"
                          [style.background-color]="isDark ? '#ffffff !important' : '#09090b !important'"
                          [style.color]="isDark ? '#09090b !important' : '#ffffff !important'">
                    <span class="material-symbols-rounded" style="font-size: 16px;" [style.color]="isDark ? '#09090b !important' : '#ffffff !important'">send</span>
                    <span class="hidden sm:inline" [style.color]="isDark ? '#09090b !important' : '#ffffff !important'">Responder</span>
                  </button>
                </div>

              </div>

            </ng-container>

            <ng-template #noSelection>
              <div class="my-auto text-center p-10 space-y-2 opacity-50">
                <span class="material-symbols-rounded text-neutral-400" style="font-size: 36px;">mark_chat_unread</span>
                <h4 class="text-sm font-headline font-semibold m-0">Selecciona un mensaje</h4>
                <p class="text-xs m-0">Haz clic en un remitente de la lista izquierda para leer el mensaje y responder.</p>
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
      <div class="space-y-3.5 animate-pulse font-sans">
        
        <!-- Header Skeleton -->
        <div class="h-16 w-full rounded-[20px] border px-5 flex items-center justify-between"
             [ngClass]="isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-neutral-900 border-neutral-800'">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-neutral-800"></div>
            <div class="space-y-1.5">
              <div class="h-2.5 w-32 rounded-full bg-neutral-800"></div>
              <div class="h-5 w-28 rounded-lg bg-neutral-800"></div>
            </div>
          </div>
          <div class="h-8 w-28 rounded-xl bg-neutral-800"></div>
        </div>

        <!-- 4 KPI Stat Cards Skeleton -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div *ngFor="let _ of [1,2,3,4]" 
               class="rounded-2xl border p-3.5 sm:p-4 flex flex-col justify-between h-24 sm:h-28"
               [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800/80' : 'bg-white border-neutral-200/80'">
            <div class="flex items-center justify-between">
              <div class="h-2.5 w-20 rounded-full" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
              <div class="w-7 h-7 rounded-lg" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
            </div>
            <div class="space-y-1.5">
              <div class="h-6 w-16 rounded-lg" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
              <div class="h-2 w-24 rounded-full" [ngClass]="isDark ? 'bg-neutral-800/60' : 'bg-neutral-200/60'"></div>
            </div>
          </div>
        </div>

        <!-- Split Layout Skeleton -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 lg:h-[calc(100vh-285px)] lg:min-h-[430px] lg:max-h-[580px]">
          <div class="lg:col-span-5 rounded-2xl border p-3.5 h-[420px] lg:h-full" [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
            <div class="space-y-2.5">
              <div class="h-8 w-full rounded-xl" [ngClass]="isDark ? 'bg-neutral-800/60' : 'bg-neutral-100'"></div>
              <div class="h-7 w-full rounded-xl" [ngClass]="isDark ? 'bg-neutral-800/40' : 'bg-neutral-100'"></div>
              <div *ngFor="let _ of [1,2,3,4]" class="h-16 rounded-xl" [ngClass]="isDark ? 'bg-neutral-800/50' : 'bg-neutral-100'"></div>
            </div>
          </div>
          <div class="lg:col-span-7 rounded-2xl border p-5 h-[460px] lg:h-full" [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
            <div class="space-y-4">
              <div class="h-11 w-48 rounded-xl" [ngClass]="isDark ? 'bg-neutral-800/60' : 'bg-neutral-200/60'"></div>
              <div class="h-40 w-full rounded-xl" [ngClass]="isDark ? 'bg-neutral-800/40' : 'bg-neutral-100'"></div>
              <div class="h-20 w-full rounded-xl" [ngClass]="isDark ? 'bg-neutral-800/40' : 'bg-neutral-100'"></div>
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
