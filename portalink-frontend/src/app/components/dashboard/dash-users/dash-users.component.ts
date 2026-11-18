import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfReportService } from '../../../services/pdf-report.service';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';

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
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 tab-enter">

      <!-- ══════════════════════════════════════════════════════════════
           HEADER: CONTENEDOR NEGRO SLIM & GESTIÓN DE USUARIOS
      ══════════════════════════════════════════════════════════════ -->
      <div class="bg-[#09090b] text-white rounded-[22px] border border-neutral-800 p-5 sm:p-6 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <!-- Círculos concéntricos decorativos sutiles de fondo -->
        <div class="absolute -right-8 -bottom-8 w-44 h-44 rounded-full border border-neutral-800/40 pointer-events-none"></div>
        <div class="absolute -right-4 -bottom-4 w-32 h-32 rounded-full border border-neutral-800/25 pointer-events-none"></div>

        <div class="relative z-10">
          <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-neutral-800 bg-neutral-900/90 text-[10px] font-sans text-neutral-300 mb-2">
            <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            <span>Control de Accesos & Seguridad</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl border flex items-center justify-center bg-neutral-900/90 border-neutral-800 mb-0 shrink-0"
                 style="color: #ffffff !important;">
              <span class="material-symbols-rounded text-xl" style="color: #ffffff !important;">group</span>
            </div>
            <h2 class="text-2xl sm:text-3xl lg:text-[32px] font-headline font-bold tracking-tight leading-[1.1] text-white m-0 dark-card-white"
                style="color: #ffffff !important;">
              Usuarios del Sistema
            </h2>
          </div>
        </div>

        <div class="relative z-10 flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <button (click)="downloadPdf()"
                  [disabled]="pdfLoading || usersList.length === 0"
                  class="btn-action-primary flex-1 sm:flex-initial">
            <span *ngIf="!pdfLoading" class="material-symbols-rounded" style="font-size: 16px;">picture_as_pdf</span>
            <span *ngIf="pdfLoading" class="material-symbols-rounded animate-spin" style="font-size: 16px;">sync</span>
            <span>{{ pdfLoading ? 'Generando...' : 'Exportar PDF' }}</span>
          </button>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════
           4 KPI STAT CARDS (MINIMALIST FINTECH STYLE - INTERACTIVE)
      ══════════════════════════════════════════════════════════════ -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mt-2">

        <!-- Stat 1: Total Usuarios -->
        <div (click)="roleFilter = 'all'"
             class="rounded-2xl border p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between group user-kpi-float cursor-pointer"
             [ngClass]="isDark ? 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 shadow-[0_2px_12px_rgba(0,0,0,0.2)]' : 'bg-white border-neutral-200/80 hover:border-neutral-300 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[11px] font-headline font-semibold uppercase tracking-wider text-neutral-400">Total Cuentas</span>
            <div class="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                 [ngClass]="isDark ? 'bg-neutral-800/80 text-neutral-300 group-hover:text-white' : 'bg-neutral-100 text-neutral-600 group-hover:text-neutral-900'">
              <span class="material-symbols-rounded" style="font-size: 18px;">group</span>
            </div>
          </div>
          <div>
            <p class="text-2xl sm:text-[28px] font-headline font-semibold tracking-tight m-0"
               [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              {{ usersList.length }}
            </p>
            <div class="mt-3 pt-2.5 border-t flex items-center justify-between text-xs"
                 [ngClass]="isDark ? 'border-neutral-800/80' : 'border-neutral-100'">
              <span class="text-neutral-500 flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
                <span><strong class="font-medium" [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">{{ usersList.length }}</strong> registrados</span>
              </span>
              <span class="text-[10px] font-sans font-medium px-2 py-0.5 rounded-full border"
                    [ngClass]="isDark ? 'bg-neutral-950/60 border-neutral-800 text-neutral-400' : 'bg-neutral-50 border-neutral-200 text-neutral-600'">
                Base global
              </span>
            </div>
          </div>
        </div>

        <!-- Stat 2: Usuarios Activos -->
        <div (click)="roleFilter = 'activo'"
             class="rounded-2xl border p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between group user-kpi-float cursor-pointer relative overflow-hidden"
             [ngClass]="isDark ? 'bg-neutral-900/80 border-neutral-800 hover:border-red-900/30 shadow-[0_2px_12px_rgba(0,0,0,0.2)]' : 'bg-white border-neutral-200/80 hover:border-red-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'">
          <div class="absolute top-0 left-0 right-0 h-[2px] bg-red-500 opacity-80"></div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-[11px] font-headline font-semibold uppercase tracking-wider text-neutral-400">Usuarios Activos</span>
            <div class="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                 [ngClass]="isDark ? 'bg-red-950/30 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-100 text-red-600'">
              <span class="material-symbols-rounded" style="font-size: 18px;">verified_user</span>
            </div>
          </div>
          <div>
            <p class="text-2xl sm:text-[28px] font-headline font-semibold tracking-tight m-0"
               [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              {{ activeUsers }}
            </p>
            <div class="mt-3 pt-2.5 border-t flex items-center justify-between text-xs"
                 [ngClass]="isDark ? 'border-neutral-800/80' : 'border-neutral-100'">
              <span class="text-neutral-500 flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span>Operativos</span>
              </span>
              <span class="text-[10px] font-headline font-semibold px-2 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 dark:text-red-400">
                {{ activityRate }}% Actividad
              </span>
            </div>
          </div>
        </div>

        <!-- Stat 3: Administradores -->
        <div (click)="roleFilter = 'admin'"
             class="rounded-2xl border p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between group user-kpi-float cursor-pointer"
             [ngClass]="isDark ? 'bg-neutral-900/80 border-neutral-800 hover:border-red-900/40 shadow-[0_2px_12px_rgba(0,0,0,0.2)]' : 'bg-white border-neutral-200/80 hover:border-red-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[11px] font-headline font-semibold uppercase tracking-wider text-neutral-400">Administradores</span>
            <div class="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                 [ngClass]="isDark ? 'bg-red-950/30 border border-red-500/25 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'">
              <span class="material-symbols-rounded" style="font-size: 18px;">admin_panel_settings</span>
            </div>
          </div>
          <div>
            <p class="text-2xl sm:text-[28px] font-headline font-semibold tracking-tight m-0 text-red-500 dark:text-red-400">
              {{ adminUsersCount }}
            </p>
            <div class="mt-3 pt-2.5 border-t flex items-center justify-between text-xs"
                 [ngClass]="isDark ? 'border-neutral-800/80' : 'border-neutral-100'">
              <span class="text-neutral-500 flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span>Superusuarios</span>
              </span>
              <span class="text-[10px] font-headline font-semibold px-2 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 dark:text-red-400">
                Rol Admin
              </span>
            </div>
          </div>
        </div>

        <!-- Stat 4: Usuarios Estándar & Seguridad RBAC -->
        <div (click)="roleFilter = 'usuario'"
             class="rounded-2xl border p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between group user-kpi-float cursor-pointer"
             [ngClass]="isDark ? 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 shadow-[0_2px_12px_rgba(0,0,0,0.2)]' : 'bg-white border-neutral-200/80 hover:border-neutral-300 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[11px] font-headline font-semibold uppercase tracking-wider text-neutral-400">Cuentas Estándar</span>
            <div class="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                 [ngClass]="isDark ? 'bg-neutral-800/80 text-neutral-300 group-hover:text-red-400' : 'bg-neutral-100 text-neutral-600 group-hover:text-red-600'">
              <span class="material-symbols-rounded" style="font-size: 18px;">shield</span>
            </div>
          </div>
          <div>
            <p class="text-2xl sm:text-[28px] font-headline font-semibold tracking-tight m-0"
               [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              {{ standardUsersCount }}
            </p>
            <div class="mt-3 pt-2.5 border-t flex items-center justify-between text-xs"
                 [ngClass]="isDark ? 'border-neutral-800/80' : 'border-neutral-100'">
              <span class="text-neutral-500 flex items-center gap-1.5 truncate max-w-[140px]">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                <span class="truncate">{{ currentUserEmail || 'Protección RBAC' }}</span>
              </span>
              <span class="text-[10px] font-sans font-medium px-2 py-0.5 rounded-full border shrink-0"
                    [ngClass]="isDark ? 'bg-neutral-950/60 border-neutral-800 text-neutral-400' : 'bg-neutral-50 border-neutral-200 text-neutral-600'">
                JWT Activo
              </span>
            </div>
          </div>
        </div>

      </div>

      <!-- ══════════════════════════════════════════════════════════════
           BARRA DE HERRAMIENTAS: BÚSQUEDA Y FILTRO RÁPIDO
      ══════════════════════════════════════════════════════════════ -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border"
           [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'">
        
        <!-- Search Input -->
        <div class="relative flex-1">
          <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <span class="material-symbols-rounded" style="font-size: 16px;">search</span>
          </span>
          <input type="text"
                 [(ngModel)]="searchTerm"
                 placeholder="Buscar usuario por nombre, correo o ID..."
                 class="w-full pl-10 pr-10 py-2 rounded-xl text-xs font-sans border outline-none transition-all"
                 [ngClass]="isDark 
                   ? 'bg-neutral-950/60 border-neutral-800 text-neutral-200 placeholder-neutral-500 focus:border-red-500/60' 
                   : 'bg-neutral-50/80 border-neutral-200 text-neutral-800 placeholder-neutral-400 focus:border-neutral-400'">
          <button *ngIf="searchTerm"
                  (click)="searchTerm = ''"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white cursor-pointer">
            <span class="material-symbols-rounded" style="font-size: 16px;">close</span>
          </button>
        </div>

        <!-- Role Filters (Monochromatic with subtle red dot) -->
        <div class="flex items-center gap-1 p-1 rounded-xl border overflow-x-auto no-scrollbar"
             [ngClass]="isDark ? 'bg-neutral-950/80 border-neutral-800' : 'bg-neutral-100 border-neutral-200'">
          <button (click)="roleFilter = 'all'"
                  class="px-3 py-1.5 rounded-lg text-[11px] font-headline font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                  [ngClass]="roleFilter === 'all'
                    ? (isDark ? 'bg-white text-neutral-950 shadow-xs' : 'bg-[#09090b] text-white shadow-xs')
                    : (isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900')">
            <span *ngIf="roleFilter === 'all'" class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            <span>Todos</span>
            <span class="text-[10px] font-headline font-semibold opacity-75">({{ usersList.length }})</span>
          </button>
          <button (click)="roleFilter = 'admin'"
                  class="px-3 py-1.5 rounded-lg text-[11px] font-headline font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                  [ngClass]="roleFilter === 'admin'
                    ? (isDark ? 'bg-white text-neutral-950 shadow-xs' : 'bg-[#09090b] text-white shadow-xs')
                    : (isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900')">
            <span *ngIf="roleFilter === 'admin'" class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            <span>Admins</span>
            <span class="text-[10px] font-headline font-semibold opacity-75">({{ adminUsersCount }})</span>
          </button>
          <button (click)="roleFilter = 'usuario'"
                  class="px-3 py-1.5 rounded-lg text-[11px] font-headline font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                  [ngClass]="roleFilter === 'usuario'
                    ? (isDark ? 'bg-white text-neutral-950 shadow-xs' : 'bg-[#09090b] text-white shadow-xs')
                    : (isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900')">
            <span *ngIf="roleFilter === 'usuario'" class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            <span>Usuarios</span>
            <span class="text-[10px] font-headline font-semibold opacity-75">({{ standardUsersCount }})</span>
          </button>
          <button (click)="roleFilter = 'activo'"
                  class="px-3 py-1.5 rounded-lg text-[11px] font-headline font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                  [ngClass]="roleFilter === 'activo'
                    ? (isDark ? 'bg-white text-neutral-950 shadow-xs' : 'bg-[#09090b] text-white shadow-xs')
                    : (isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900')">
            <span *ngIf="roleFilter === 'activo'" class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            <span>Activos</span>
            <span class="text-[10px] font-headline font-semibold opacity-75">({{ activeUsers }})</span>
          </button>
        </div>

      </div>

      <!-- ══════════════════════════════════════════════════════════════
           CREATIVE IDENTITY CARDS GRID (MONOCHROMATIC + SUBTLE RED LINES & DOT)
      ══════════════════════════════════════════════════════════════ -->
      <div *ngIf="filteredUsers.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 pt-1">

        <div *ngFor="let user of filteredUsers; let idx = index"
             class="user-identity-card group relative rounded-[20px] border p-5 flex flex-col justify-between overflow-hidden"
             [ngClass]="isDark
               ? 'bg-neutral-900/85 border-neutral-800 hover:border-neutral-700'
               : 'bg-white border-neutral-200/90 hover:border-neutral-300'">

          <!-- Línea superior roja sutil (fija en Admin/Actual, y se despliega suavemente al pasar el cursor en las demás) -->
          <div class="absolute top-0 left-0 right-0 h-[2px] bg-red-500 transition-transform duration-300 origin-left"
               [ngClass]="(user.role === 'Admin' || isCurrentUser(user))
                 ? 'scale-x-100 opacity-85'
                 : 'scale-x-0 group-hover:scale-x-100 opacity-75'"></div>

          <!-- ─── TOP SECTION: CLEAN MONOGRAM AVATAR + IDENTITY + STATUS ─── -->
          <div class="relative z-10">
            <div class="flex items-start justify-between gap-3">
              
              <!-- Avatar Monograma Monocromático Perfectamente Centrado -->
              <div class="flex items-center gap-3.5 min-w-0">
                <div class="relative w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 select-none"
                     [ngClass]="(user.role === 'Admin' || isCurrentUser(user))
                       ? (isDark ? 'bg-white text-neutral-950 border-white shadow-xs' : 'bg-[#09090b] text-white border-[#09090b] shadow-xs')
                       : (isDark ? 'bg-neutral-950 text-neutral-200 border-neutral-800 group-hover:border-neutral-700' : 'bg-neutral-100 text-neutral-800 border-neutral-200 group-hover:border-neutral-300')">
                  <span class="font-headline font-semibold text-xs tracking-wider leading-none"
                        [style.color]="(user.role === 'Admin' || isCurrentUser(user)) ? (isDark ? '#09090b' : '#ffffff') : ''">
                    {{ getInitials(user.name) }}
                  </span>
                  <!-- Punto rojo sutil indicador en la esquina del avatar -->
                  <span *ngIf="user.role === 'Admin' || isCurrentUser(user)"
                        class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2"
                        [ngClass]="isDark ? 'border-neutral-900' : 'border-white'"></span>
                </div>

                <!-- Nombre Monocromático & Correo -->
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h3 class="text-sm sm:text-[15px] font-headline font-semibold tracking-tight truncate m-0"
                        [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                      {{ user.name }}
                    </h3>

                    <span *ngIf="isCurrentUser(user)"
                          class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-headline font-semibold uppercase tracking-wider border shrink-0"
                          [ngClass]="isDark ? 'bg-neutral-800 text-neutral-200 border-neutral-700' : 'bg-neutral-100 text-neutral-800 border-neutral-200'">
                      <span class="w-1 h-1 rounded-full bg-red-500"></span>
                      <span>Tú</span>
                    </span>
                  </div>

                  <!-- Email con copiado al clic -->
                  <button type="button"
                          (click)="copyUserEmail(user.email)"
                          class="mt-1 group/mail inline-flex items-center gap-1 text-[11px] font-mono text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors max-w-full truncate cursor-pointer bg-transparent border-0 p-0"
                          title="Clic para copiar correo">
                    <span class="truncate">{{ user.email }}</span>
                    <span class="material-symbols-rounded opacity-0 group-hover/mail:opacity-100 transition-opacity shrink-0" style="font-size: 12px;">
                      {{ copiedEmail === user.email ? 'check' : 'content_copy' }}
                    </span>
                  </button>
                </div>
              </div>

              <!-- Chip de ID numérico + Píldora Monocromática de Estado con Punto Rojo -->
              <div class="flex flex-col items-end gap-1.5 shrink-0">
                <span class="text-[10px] font-headline font-semibold tracking-tight px-2 py-0.5 rounded-full border"
                      [ngClass]="isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-400' : 'bg-neutral-50 border-neutral-200 text-neutral-500'">
                  #{{ user.id < 10 ? '0' + user.id : user.id }}
                </span>

                <button *ngIf="!isCurrentUser(user)"
                        type="button"
                        (click)="toggleStatus(user.id)"
                        class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-headline font-semibold uppercase tracking-wider border cursor-pointer transition-all active:scale-95"
                        [ngClass]="user.status === 'Activo'
                          ? (isDark ? 'bg-neutral-950 text-neutral-200 border-neutral-800 hover:border-neutral-700' : 'bg-[#09090b] text-white border-[#09090b]')
                          : (isDark ? 'bg-neutral-950/50 text-neutral-500 border-neutral-800' : 'bg-neutral-100 text-neutral-500 border-neutral-200')"
                        [title]="user.status === 'Activo' ? 'Clic para cambiar a Inactivo' : 'Clic para activar cuenta'">
                  <span class="w-1.5 h-1.5 rounded-full"
                        [ngClass]="user.status === 'Activo' ? 'bg-red-500' : 'bg-neutral-400'"></span>
                  <span>{{ user.status }}</span>
                </button>

                <span *ngIf="isCurrentUser(user)"
                      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-headline font-semibold uppercase tracking-wider border"
                      [ngClass]="isDark ? 'bg-neutral-950 text-neutral-200 border-neutral-800' : 'bg-[#09090b] text-white border-[#09090b]'">
                  <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <span>Activo</span>
                </span>
              </div>

            </div>

            <!-- ─── MIDDLE SECTION: MONOCHROMATIC METADATA BLOCK WITH SUBTLE RED LINE ─── -->
            <div class="grid grid-cols-2 gap-3 mt-4 p-3 rounded-xl border transition-colors"
                 [ngClass]="isDark
                   ? 'bg-neutral-950/50 border-neutral-800/80'
                   : 'bg-neutral-50/70 border-neutral-200/70'">
              
              <!-- Col 1: Nivel de Acceso con línea vertical sutil roja -->
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="w-[2px] h-6 rounded-full shrink-0"
                      [ngClass]="user.role === 'Admin' ? 'bg-red-500' : (isDark ? 'bg-neutral-700 group-hover:bg-red-500/70 transition-colors' : 'bg-neutral-300 group-hover:bg-red-500/70 transition-colors')"></span>
                <div class="min-w-0">
                  <span class="text-[9px] font-headline font-semibold uppercase tracking-wider text-neutral-400 block leading-none">
                    Credencial
                  </span>
                  <span class="text-xs font-headline font-semibold tracking-tight truncate block mt-1"
                        [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                    {{ user.role === 'Admin' ? 'Control Total' : 'Estándar' }}
                  </span>
                </div>
              </div>

              <!-- Col 2: Fecha de Registro -->
              <div class="flex items-center gap-2.5 min-w-0 border-l pl-3"
                   [ngClass]="isDark ? 'border-neutral-800/80' : 'border-neutral-200/80'">
                <span class="material-symbols-rounded text-neutral-400 shrink-0" style="font-size: 15px;">calendar_today</span>
                <div class="min-w-0">
                  <span class="text-[9px] font-headline font-semibold uppercase tracking-wider text-neutral-400 block leading-none">
                    Registro
                  </span>
                  <span class="text-xs font-headline font-semibold tracking-tight truncate block mt-1"
                        [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                    {{ user.joined }}
                  </span>
                </div>
              </div>

            </div>
          </div>

          <!-- ─── BOTTOM SECTION: MONOCHROMATIC ROLE SWITCHER & QUICK ACTIONS ─── -->
          <div class="relative z-10 mt-4 pt-3 border-t flex items-center justify-between gap-2"
               [ngClass]="isDark ? 'border-neutral-800/80' : 'border-neutral-100'">
            
            <!-- Selector de Rol Monocromático con Punto Rojo -->
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-headline font-semibold uppercase tracking-wider text-neutral-400">Rol:</span>

              <!-- Si es el usuario actual: badge monocromático con punto rojo -->
              <span *ngIf="isCurrentUser(user)"
                    class="text-[10px] font-headline font-semibold uppercase tracking-wider px-2.5 py-1 rounded-xl border inline-flex items-center gap-1.5 cursor-not-allowed"
                    [ngClass]="isDark ? 'bg-neutral-950 text-white border-neutral-800' : 'bg-neutral-100 text-neutral-900 border-neutral-200'"
                    title="Tu propia cuenta de administrador está protegida">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span>{{ user.role }}</span>
                <span class="material-symbols-rounded text-neutral-400" style="font-size: 12px;">lock</span>
              </span>

              <!-- Si es otro usuario: conmutador monocromático con punto rojo en la opción activa -->
              <div *ngIf="!isCurrentUser(user)"
                   class="inline-flex items-center p-0.5 rounded-xl border"
                   [ngClass]="isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-100 border-neutral-200'">
                <button type="button"
                        (click)="user.role !== 'Admin' && changeRole(user, 'Admin')"
                        [disabled]="updatingRole[user.id]"
                        class="px-2.5 py-1 rounded-lg text-[10px] font-headline font-semibold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1"
                        [ngClass]="user.role === 'Admin'
                          ? (isDark ? 'bg-white text-neutral-950 shadow-xs' : 'bg-[#09090b] text-white shadow-xs')
                          : (isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900')">
                  <span *ngIf="user.role === 'Admin'" class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <span>Admin</span>
                </button>
                <button type="button"
                        (click)="user.role !== 'Usuario' && changeRole(user, 'Usuario')"
                        [disabled]="updatingRole[user.id]"
                        class="px-2.5 py-1 rounded-lg text-[10px] font-headline font-semibold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1"
                        [ngClass]="user.role === 'Usuario'
                          ? (isDark ? 'bg-white text-neutral-950 shadow-xs' : 'bg-[#09090b] text-white shadow-xs')
                          : (isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900')">
                  <span *ngIf="user.role === 'Usuario'" class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <span>Usuario</span>
                </button>
              </div>
            </div>

            <!-- Botones de Acción Rápida Monocromáticos -->
            <div class="flex items-center gap-1.5">
              <button type="button"
                      (click)="copyUserEmail(user.email)"
                      class="p-1.5 rounded-xl border transition-all cursor-pointer active:scale-95"
                      [ngClass]="copiedEmail === user.email
                        ? (isDark ? 'border-white bg-white text-neutral-950' : 'border-neutral-900 bg-neutral-900 text-white')
                        : (isDark ? 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:border-neutral-700' : 'border-neutral-200 bg-neutral-50 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100')"
                      title="Copiar correo electrónico">
                <span class="material-symbols-rounded" style="font-size: 15px;">
                  {{ copiedEmail === user.email ? 'check' : 'content_copy' }}
                </span>
              </button>

              <button *ngIf="!isCurrentUser(user)"
                      type="button"
                      (click)="toggleStatus(user.id)"
                      class="p-1.5 rounded-xl border transition-all cursor-pointer active:scale-95"
                      [ngClass]="isDark ? 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:border-neutral-700' : 'border-neutral-200 bg-neutral-50 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'"
                      [title]="user.status === 'Activo' ? 'Desactivar acceso' : 'Reactivar acceso'">
                <span class="material-symbols-rounded" style="font-size: 15px;">
                  {{ user.status === 'Activo' ? 'person_off' : 'person_check' }}
                </span>
              </button>

              <button *ngIf="!isCurrentUser(user)"
                      type="button"
                      (click)="confirmDelete(user)"
                      [disabled]="deletingUser[user.id]"
                      class="p-1.5 rounded-xl border transition-all cursor-pointer active:scale-95"
                      [ngClass]="isDark ? 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-red-400 hover:border-red-500/40' : 'border-neutral-200 bg-neutral-50 text-neutral-500 hover:text-red-600 hover:border-red-300'"
                      title="Eliminar usuario permanentemente">
                <span *ngIf="!deletingUser[user.id]" class="material-symbols-rounded" style="font-size: 15px;">delete</span>
                <span *ngIf="deletingUser[user.id]" class="material-symbols-rounded animate-spin" style="font-size: 15px;">sync</span>
              </button>

              <span *ngIf="isCurrentUser(user)"
                    class="px-2.5 py-1 rounded-xl border text-[10px] font-headline font-semibold text-neutral-400 select-none inline-flex items-center gap-1.5"
                    [ngClass]="isDark ? 'border-neutral-800 bg-neutral-950/60' : 'border-neutral-200 bg-neutral-50'"
                    title="Sesión actual activa">
                <span class="w-1 h-1 rounded-full bg-red-500"></span>
                <span>Sesión actual</span>
              </span>
            </div>

          </div>

        </div>

      </div>

      <!-- Empty State (Cuando ningún usuario coincide con el filtro) -->
      <div *ngIf="filteredUsers.length === 0"
           class="rounded-2xl border px-6 py-14 text-center flex flex-col items-center gap-2.5 transition-all"
           [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800 text-neutral-400' : 'bg-white border-neutral-200/80 text-neutral-500'">
        <div class="w-12 h-12 rounded-2xl border flex items-center justify-center mb-1"
             [ngClass]="isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-500' : 'bg-neutral-50 border-neutral-200 text-neutral-400'">
          <span class="material-symbols-rounded" style="font-size: 24px;">person_off</span>
        </div>
        <p class="text-sm font-headline font-semibold m-0" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
          No se encontraron usuarios
        </p>
        <p class="text-xs text-neutral-400 m-0 max-w-xs">
          Prueba ajustando el término de búsqueda o cambiando el filtro de rol seleccionado.
        </p>
        <button (click)="searchTerm = ''; roleFilter = 'all'"
                class="mt-2 px-3.5 py-1.5 rounded-xl text-xs font-headline font-semibold border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all cursor-pointer">
          Restablecer filtros
        </button>
      </div>

    </div>
  `,
  styles: [`
    .tab-enter { animation: tabEnter 0.25s ease-out forwards; }
    @keyframes tabEnter {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Efecto de flotación en las KPI Cards */
    .user-kpi-float {
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                  box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                  border-color 0.25s ease;
      will-change: transform;
    }
    .user-kpi-float:hover {
      transform: translateY(-4px);
    }

    /* Efecto de flotación / levitación creativa en las tarjetas de usuario */
    .user-identity-card {
      transition: transform 0.38s cubic-bezier(0.16, 1, 0.3, 1),
                  box-shadow 0.38s cubic-bezier(0.16, 1, 0.3, 1),
                  border-color 0.3s ease;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
      will-change: transform, box-shadow;
    }

    :host-context(.theme-dark) .user-identity-card {
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.28);
    }

    .user-identity-card:hover {
      transform: translateY(-7px) scale(1.008);
      box-shadow: 0 18px 38px -10px rgba(0, 0, 0, 0.12),
                  0 8px 20px -6px rgba(239, 68, 68, 0.08);
    }

    :host-context(.theme-dark) .user-identity-card:hover {
      box-shadow: 0 22px 44px -10px rgba(0, 0, 0, 0.65),
                  0 8px 24px -6px rgba(239, 68, 68, 0.14);
    }

    .user-identity-card--admin:hover {
      border-color: rgba(239, 68, 68, 0.45) !important;
      box-shadow: 0 20px 42px -10px rgba(239, 68, 68, 0.16),
                  0 8px 20px -6px rgba(0, 0, 0, 0.15);
    }

    :host-context(.theme-dark) .user-identity-card--admin:hover {
      border-color: rgba(239, 68, 68, 0.45) !important;
      box-shadow: 0 22px 46px -10px rgba(0, 0, 0, 0.72),
                  0 0 28px -4px rgba(239, 68, 68, 0.22);
    }
  `]
})
export class DashUsersComponent implements OnInit {
  @Input() theme = 'light';
  private pdfService = inject(PdfReportService);
  private authService = inject(AuthService);
  pdfLoading = false;

  searchTerm = '';
  roleFilter = 'all';
  copiedEmail: string | null = null;

  usersList: User[] = [];
  updatingRole: { [key: number]: boolean } = {};
  deletingUser: { [key: number]: boolean } = {};

  get isDark() { return this.theme === 'dark'; }
  get activeUsers() { return this.usersList.filter(u => u.status === 'Activo').length; }
  get adminUsersCount() { return this.usersList.filter(u => u.role === 'Admin').length; }
  get standardUsersCount() { return this.usersList.filter(u => u.role !== 'Admin').length; }
  
  get activityRate(): number {
    if (!this.usersList.length) return 0;
    return Math.round((this.activeUsers / this.usersList.length) * 100);
  }

  get filteredUsers(): User[] {
    let list = this.usersList;

    if (this.roleFilter === 'admin') {
      list = list.filter(u => u.role === 'Admin');
    } else if (this.roleFilter === 'usuario') {
      list = list.filter(u => u.role !== 'Admin');
    } else if (this.roleFilter === 'activo') {
      list = list.filter(u => u.status === 'Activo');
    }

    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase().trim();
      list = list.filter(u => 
        (u.name && u.name.toLowerCase().includes(q)) || 
        (u.email && u.email.toLowerCase().includes(q)) ||
        String(u.id).includes(q)
      );
    }

    return list;
  }

  getInitials(name: string): string {
    if (!name || !name.trim()) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }

  copyUserEmail(email: string) {
    if (!email || typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(email);
    this.copiedEmail = email;
    setTimeout(() => {
      if (this.copiedEmail === email) {
        this.copiedEmail = null;
      }
    }, 2000);
  }

  get currentUserId() {
    return this.authService.currentUser()?.id;
  }

  get currentUserEmail() {
    return this.authService.currentUser()?.email;
  }

  isCurrentUser(user: User): boolean {
    if (this.currentUserId && user.id === Number(this.currentUserId)) return true;
    if (this.currentUserEmail && user.email === this.currentUserEmail) return true;
    return false;
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.authService.getUsers().subscribe({
      next: (data) => {
        this.usersList = data.map((u: any) => ({
          id: u.id,
          name: u.nombre,
          email: u.email,
          role: u.rol?.toLowerCase() === 'admin' ? 'Admin' : 'Usuario',
          status: 'Activo',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.nombre)}&background=18181b&color=ef4444&bold=true&size=128`,
          joined: u.created_at ? new Date(u.created_at).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }) : 'N/A'
        }));
      },
      error: (err) => {
        console.error('Error al cargar usuarios de la base de datos:', err);
        const saved = localStorage.getItem('portalink_admin_users');
        if (saved) {
          try { this.usersList = JSON.parse(saved); } catch { }
        }
      }
    });
  }

  changeRole(user: User, newRole: string) {
    if (this.isCurrentUser(user)) return;
    const oldRole = user.role;
    user.role = newRole;
    this.updatingRole[user.id] = true;

    this.authService.updateUserRole(user.id, newRole.toLowerCase()).subscribe({
      next: () => {
        this.updatingRole[user.id] = false;
        localStorage.setItem('portalink_admin_users', JSON.stringify(this.usersList));
      },
      error: (err) => {
        console.error('Error actualizando rol en backend:', err);
        user.role = oldRole;
        this.updatingRole[user.id] = false;
      }
    });
  }

  toggleStatus(id: number) {
    const user = this.usersList.find(u => u.id === id);
    if (user && !this.isCurrentUser(user)) {
      user.status = user.status === 'Activo' ? 'Inactivo' : 'Activo';
      localStorage.setItem('portalink_admin_users', JSON.stringify(this.usersList));
    }
  }

  getRoleBadgeClass(role: string): string {
    if (this.isDark) {
      if (role === 'Admin') return 'bg-red-950/40 text-red-400 border-red-500/30';
      return 'bg-neutral-900 text-neutral-300 border-neutral-700/60';
    } else {
      if (role === 'Admin') return 'bg-red-50 text-red-600 border-red-200';
      return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  }

  getRoleSelectClass(role: string): string {
    if (this.isDark) {
      if (role === 'Admin') return 'bg-neutral-900 text-red-400 border-red-500/40 hover:border-red-400';
      return 'bg-neutral-900 text-neutral-300 border-neutral-700/80 hover:border-neutral-500';
    } else {
      if (role === 'Admin') return 'bg-white text-red-600 border-red-200 hover:border-red-300';
      return 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400';
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

  confirmDelete(user: User) {
    if (this.isCurrentUser(user)) return;
    if (confirm(`¿Estás seguro de que deseas eliminar permanentemente a "${user.name}" (${user.email})? Esta acción no se puede deshacer.`)) {
      this.deleteUser(user);
    }
  }

  deleteUser(user: User) {
    this.deletingUser[user.id] = true;
    this.authService.deleteUser(user.id).subscribe({
      next: () => {
        this.deletingUser[user.id] = false;
        this.usersList = this.usersList.filter(u => u.id !== user.id);
        localStorage.setItem('portalink_admin_users', JSON.stringify(this.usersList));
      },
      error: (err) => {
        this.deletingUser[user.id] = false;
        console.error('Error al eliminar usuario en backend:', err);
        alert(err.error?.message || 'Hubo un error al intentar eliminar el usuario.');
      }
    });
  }
}

