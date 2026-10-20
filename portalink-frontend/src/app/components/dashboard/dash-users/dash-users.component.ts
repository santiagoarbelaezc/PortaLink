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
            <h2 class="text-2xl sm:text-3xl lg:text-[32px] font-headline font-black tracking-tight leading-[1.1] text-white m-0 dark-card-white"
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
           MINI-BENTO STAT CARDS (4 CARDS EJECUTIVAS)
      ══════════════════════════════════════════════════════════════ -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

        <!-- Stat 1: Total Usuarios -->
        <div class="rounded-2xl border p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-0.5 card-executive"
             [ngClass]="isDark ? 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700 shadow-[0_4px_20px_rgba(0,0,0,0.3)]' : 'bg-white border-neutral-200/80 hover:border-neutral-300 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[11px] font-headline font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Total Cuentas</span>
            <div class="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                 [ngClass]="isDark ? 'bg-neutral-800/80 text-white border border-neutral-700/60' : 'bg-neutral-100 text-neutral-800 border border-neutral-200'">
              <span class="material-symbols-rounded" style="font-size: 18px;">group</span>
            </div>
          </div>
          <div>
            <p class="text-2xl sm:text-3xl font-headline font-extrabold tracking-tight m-0"
               [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              {{ usersList.length }}
            </p>
            <div class="mt-2.5 pt-2.5 border-t flex items-center justify-between text-xs font-sans"
                 [ngClass]="isDark ? 'border-neutral-800/80' : 'border-neutral-100'">
              <span class="text-neutral-500 flex items-center gap-1.5 text-[11px]">
                <span class="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
                <span>En base de datos</span>
              </span>
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border"
                    [ngClass]="isDark ? 'border-neutral-700 bg-neutral-800/60 text-neutral-300' : 'border-neutral-200 bg-neutral-100 text-neutral-700'">
                100%
              </span>
            </div>
          </div>
        </div>

        <!-- Stat 2: Usuarios Activos (Dot pulso blanco) -->
        <div class="rounded-2xl border p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-0.5 card-executive"
             [ngClass]="isDark ? 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700 shadow-[0_4px_20px_rgba(0,0,0,0.3)]' : 'bg-white border-neutral-200/80 hover:border-neutral-300 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[11px] font-headline font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Usuarios Activos</span>
            <div class="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                 [ngClass]="isDark ? 'bg-neutral-800/80 text-white border border-neutral-700/60' : 'bg-neutral-100 text-neutral-800 border border-neutral-200'">
              <span class="material-symbols-rounded" style="font-size: 18px;">verified_user</span>
            </div>
          </div>
          <div>
            <p class="text-2xl sm:text-3xl font-headline font-extrabold tracking-tight m-0"
               [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              {{ activeUsers }}
            </p>
            <div class="mt-2.5 pt-2.5 border-t flex items-center justify-between text-xs font-sans"
                 [ngClass]="isDark ? 'border-neutral-800/80' : 'border-neutral-100'">
              <span class="text-neutral-500 flex items-center gap-1.5 text-[11px]">
                <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse shadow-[0_0_6px_rgba(255,255,255,0.7)]"></span>
                <span>Operativos</span>
              </span>
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-neutral-700/60"
                    [ngClass]="isDark ? 'bg-neutral-800 text-white' : 'bg-neutral-900 text-white'">
                {{ activityRate }}% Actividad
              </span>
            </div>
          </div>
        </div>

        <!-- Stat 3: Administradores (Acento Rojo Ejecutivo) -->
        <div class="rounded-2xl border p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-0.5 card-executive red-accent-top"
             [ngClass]="isDark ? 'bg-neutral-900/90 border-neutral-800 hover:border-red-900/50 shadow-[0_4px_20px_rgba(0,0,0,0.3)]' : 'bg-white border-neutral-200/80 hover:border-red-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[11px] font-headline font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Administradores</span>
            <div class="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                 [ngClass]="isDark ? 'bg-red-950/40 border border-red-500/30 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-red-50 border border-red-200 text-red-600'">
              <span class="material-symbols-rounded" style="font-size: 18px;">admin_panel_settings</span>
            </div>
          </div>
          <div>
            <p class="text-2xl sm:text-3xl font-headline font-extrabold tracking-tight m-0 text-red-500 dark:text-red-400">
              {{ adminUsersCount }}
            </p>
            <div class="mt-2.5 pt-2.5 border-t flex items-center justify-between text-xs font-sans"
                 [ngClass]="isDark ? 'border-neutral-800/80' : 'border-neutral-100'">
              <span class="text-neutral-500 flex items-center gap-1.5 text-[11px]">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                <span>Superusuarios</span>
              </span>
              <span class="text-[10px] font-headline font-bold px-2 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 dark:text-red-400">
                Rol Admin
              </span>
            </div>
          </div>
        </div>

        <!-- Stat 4: Seguridad & Sesión Actual -->
        <div class="rounded-2xl border p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-0.5 card-executive"
             [ngClass]="isDark ? 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700 shadow-[0_4px_20px_rgba(0,0,0,0.3)]' : 'bg-white border-neutral-200/80 hover:border-neutral-300 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[11px] font-headline font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Seguridad RBAC</span>
            <div class="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                 [ngClass]="isDark ? 'bg-neutral-800/80 text-neutral-300 border border-neutral-700/60' : 'bg-neutral-100 text-neutral-800 border border-neutral-200'">
              <span class="material-symbols-rounded" style="font-size: 18px;">shield</span>
            </div>
          </div>
          <div>
            <p class="text-lg sm:text-xl font-headline font-bold tracking-tight m-0 truncate"
               [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              {{ currentUserEmail ? 'Sesión Activa' : 'Protección ON' }}
            </p>
            <div class="mt-2.5 pt-2.5 border-t flex items-center justify-between text-xs font-sans"
                 [ngClass]="isDark ? 'border-neutral-800/80' : 'border-neutral-100'">
              <span class="text-neutral-500 truncate text-[11px]">
                {{ currentUserEmail || 'Autenticado' }}
              </span>
              <span class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded text-neutral-400">
                🔒 TLS
              </span>
            </div>
          </div>
        </div>

      </div>

      <!-- ══════════════════════════════════════════════════════════════
           BARRA DE HERRAMIENTAS: BÚSQUEDA Y FILTRO RÁPIDO
      ══════════════════════════════════════════════════════════════ -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border"
           [ngClass]="isDark ? 'bg-neutral-900/70 border-neutral-800' : 'bg-white border-neutral-200'">
        
        <!-- Search Input -->
        <div class="relative flex-1">
          <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <span class="material-symbols-rounded" style="font-size: 18px;">search</span>
          </span>
          <input type="text"
                 [(ngModel)]="searchTerm"
                 placeholder="Buscar por nombre o correo electrónico..."
                 class="w-full pl-10 pr-10 py-2 rounded-xl text-xs sm:text-sm font-sans border outline-none transition-all"
                 [ngClass]="isDark 
                   ? 'bg-neutral-950/70 border-neutral-800 text-white placeholder-neutral-500 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30' 
                   : 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20'">
          <button *ngIf="searchTerm"
                  (click)="searchTerm = ''"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white">
            <span class="material-symbols-rounded" style="font-size: 16px;">close</span>
          </button>
        </div>

        <!-- Role Filters -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button (click)="roleFilter = 'all'"
                  class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer whitespace-nowrap"
                  [ngClass]="roleFilter === 'all'
                    ? (isDark ? 'bg-white text-neutral-950 border-white' : 'bg-neutral-900 text-white border-neutral-900')
                    : (isDark ? 'bg-neutral-950/60 text-neutral-400 border-neutral-800 hover:border-neutral-700' : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:border-neutral-300')">
            Todos ({{ usersList.length }})
          </button>
          <button (click)="roleFilter = 'admin'"
                  class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer whitespace-nowrap"
                  [ngClass]="roleFilter === 'admin'
                    ? 'bg-red-600 text-white border-red-600 shadow-sm shadow-red-600/30'
                    : (isDark ? 'bg-neutral-950/60 text-red-400/80 border-neutral-800 hover:border-red-900/50' : 'bg-neutral-100 text-red-600 border-neutral-200 hover:border-red-200')">
            Admins ({{ adminUsersCount }})
          </button>
          <button (click)="roleFilter = 'usuario'"
                  class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer whitespace-nowrap"
                  [ngClass]="roleFilter === 'usuario'
                    ? (isDark ? 'bg-neutral-800 text-white border-neutral-700' : 'bg-neutral-800 text-white border-neutral-800')
                    : (isDark ? 'bg-neutral-950/60 text-neutral-400 border-neutral-800 hover:border-neutral-700' : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:border-neutral-300')">
            Usuarios ({{ standardUsersCount }})
          </button>
          <button (click)="roleFilter = 'activo'"
                  class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer whitespace-nowrap"
                  [ngClass]="roleFilter === 'activo'
                    ? (isDark ? 'bg-neutral-800 text-white border-neutral-700' : 'bg-neutral-800 text-white border-neutral-800')
                    : (isDark ? 'bg-neutral-950/60 text-neutral-400 border-neutral-800 hover:border-neutral-700' : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:border-neutral-300')">
            Activos ({{ activeUsers }})
          </button>
        </div>

      </div>

      <!-- ══════════════════════════════════════════════════════════════
           DESKTOP USERS TABLE (HIDDEN ON MOBILE)
      ══════════════════════════════════════════════════════════════ -->
      <div class="hidden md:block rounded-2xl border overflow-hidden transition-all shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
           [ngClass]="isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-neutral-200/80'">

        <!-- Table Header -->
        <div class="grid grid-cols-12 px-6 py-3.5 text-[10px] font-mono font-bold uppercase tracking-wider border-b"
             [ngClass]="isDark ? 'border-neutral-800 text-neutral-400 bg-neutral-950/40' : 'border-neutral-200 text-neutral-500 bg-neutral-50/50'">
          <span class="col-span-5">Usuario / Identidad</span>
          <span class="col-span-2 text-center">Rol de Acceso</span>
          <span class="col-span-2 text-center">Estado</span>
          <span class="col-span-2">Fecha Registro</span>
          <span class="col-span-1 text-right">Acciones</span>
        </div>

        <!-- Table Rows -->
        <div class="divide-y" [ngClass]="isDark ? 'divide-neutral-800/80' : 'divide-neutral-100'">
          <div *ngFor="let user of filteredUsers"
               class="grid grid-cols-12 px-6 py-4 items-center transition-colors duration-200 group"
               [ngClass]="isDark ? 'hover:bg-neutral-800/30' : 'hover:bg-neutral-50'">

            <!-- User Info: Avatar + Name + Email + 'Tú' Badge -->
            <div class="col-span-5 flex items-center gap-3.5 min-w-0 pr-3">
              <div class="relative shrink-0">
                <img [src]="user.avatar" [alt]="user.name"
                     class="w-10 h-10 rounded-full object-cover border transition-transform group-hover:scale-105"
                     [ngClass]="isCurrentUser(user) 
                       ? 'border-red-500/60 shadow-[0_0_8px_rgba(239,68,68,0.3)]' 
                       : (isDark ? 'border-neutral-700' : 'border-neutral-200')"
                     (error)="onImgError($event, user.name)">
                <span *ngIf="user.role === 'Admin'" 
                      class="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-600 border-2 flex items-center justify-center text-[7px] text-white"
                      [ngClass]="isDark ? 'border-neutral-900' : 'border-white'"
                      title="Administrador">
                  ★
                </span>
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <p class="text-xs sm:text-sm font-bold truncate leading-snug"
                     [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                    {{ user.name }}
                  </p>
                  <span *ngIf="isCurrentUser(user)"
                        class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider"
                        [ngClass]="isDark ? 'bg-red-950/60 text-red-400 border border-red-500/30' : 'bg-red-50 text-red-600 border border-red-200'">
                    Tú
                  </span>
                </div>
                <p class="text-[11px] font-mono truncate opacity-60"
                   [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                  {{ user.email }}
                </p>
              </div>
            </div>

            <!-- Role Selector / Locked Badge -->
            <div class="col-span-2 flex justify-center">
              <span *ngIf="isCurrentUser(user)"
                    class="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full cursor-not-allowed flex items-center gap-1.5 border"
                    [ngClass]="getRoleBadgeClass(user.role)"
                    title="No puedes cambiar tu propio rol">
                <span>{{ user.role }}</span>
                <span class="text-[9px]">🔒</span>
              </span>

              <select *ngIf="!isCurrentUser(user)"
                      [ngModel]="user.role"
                      (ngModelChange)="changeRole(user, $event)"
                      [disabled]="updatingRole[user.id]"
                      class="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border cursor-pointer transition-all duration-200 focus:outline-none"
                      [ngClass]="getRoleSelectClass(user.role)">
                <option value="Admin">ADMIN</option>
                <option value="Usuario">USUARIO</option>
              </select>
            </div>

            <!-- Status Indicator (Interactive toggle if not current user) -->
            <div class="col-span-2 flex justify-center">
              <button *ngIf="!isCurrentUser(user)"
                      (click)="toggleStatus(user.id)"
                      class="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition-all hover:scale-105 active:scale-95"
                      [ngClass]="user.status === 'Activo'
                        ? (isDark ? 'bg-neutral-900 text-white border-neutral-700/80 shadow-[0_0_8px_rgba(255,255,255,0.1)]' : 'bg-neutral-900 text-white border-neutral-800')
                        : (isDark ? 'bg-neutral-950 text-neutral-500 border-neutral-800' : 'bg-neutral-100 text-neutral-500 border-neutral-200')"
                      [title]="user.status === 'Activo' ? 'Clic para desactivar' : 'Clic para activar'">
                <span class="w-1.5 h-1.5 rounded-full"
                      [ngClass]="user.status === 'Activo' ? 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)] animate-pulse' : 'bg-neutral-500'"></span>
                <span class="text-[11px] font-sans font-semibold">{{ user.status }}</span>
              </button>

              <div *ngIf="isCurrentUser(user)"
                   class="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border cursor-default"
                   [ngClass]="isDark ? 'bg-neutral-900 text-white border-neutral-700/80' : 'bg-neutral-900 text-white border-neutral-800'">
                <span class="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]"></span>
                <span class="text-[11px] font-sans font-semibold">Activo</span>
              </div>
            </div>

            <!-- Joined Date -->
            <div class="col-span-2">
              <span class="text-xs font-mono"
                    [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                {{ user.joined }}
              </span>
            </div>

            <!-- Actions Buttons -->
            <div class="col-span-1 flex justify-end items-center gap-1.5">
              <button *ngIf="!isCurrentUser(user)"
                      (click)="toggleStatus(user.id)"
                      class="row-action-btn"
                      [title]="user.status === 'Activo' ? 'Desactivar usuario' : 'Activar usuario'">
                <span class="material-symbols-rounded" style="font-size: 16px;">
                  {{ user.status === 'Activo' ? 'block' : 'check_circle' }}
                </span>
              </button>
              <button *ngIf="!isCurrentUser(user)"
                      (click)="confirmDelete(user)"
                      [disabled]="deletingUser[user.id]"
                      class="row-action-btn row-action-btn--delete"
                      title="Eliminar usuario permanentemente">
                <span *ngIf="!deletingUser[user.id]" class="material-symbols-rounded" style="font-size: 16px;">delete</span>
                <span *ngIf="deletingUser[user.id]" class="material-symbols-rounded animate-spin" style="font-size: 16px;">sync</span>
              </button>
              <span *ngIf="isCurrentUser(user)" 
                    class="p-2 text-xs opacity-40 cursor-not-allowed select-none text-neutral-400"
                    title="Tu cuenta actual está protegida">
                🔒
              </span>
            </div>

          </div>

          <!-- Empty State (No users found in filter) -->
          <div *ngIf="filteredUsers.length === 0" 
               class="px-6 py-12 text-center text-xs opacity-60 flex flex-col items-center gap-2">
            <span class="material-symbols-rounded text-3xl opacity-40">person_off</span>
            <p class="font-headline font-bold">No se encontraron usuarios</p>
            <p class="text-neutral-500">Prueba ajustando el término de búsqueda o el filtro seleccionado.</p>
            <button (click)="searchTerm = ''; roleFilter = 'all'"
                    class="mt-2 text-red-500 hover:underline font-mono text-[11px]">
              Restablecer filtros
            </button>
          </div>
        </div>

      </div>

      <!-- ══════════════════════════════════════════════════════════════
           MOBILE CARDS VIEW (TACTILE & EXECUTIVE)
      ══════════════════════════════════════════════════════════════ -->
      <div class="block md:hidden space-y-3">
        <div *ngFor="let user of filteredUsers"
             class="p-4 rounded-2xl border transition-all shadow-xs card-executive"
             [ngClass]="[
               isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-neutral-200/90',
               user.role === 'Admin' ? 'red-accent-top' : ''
             ]">
          
          <!-- Top Row: Avatar, Name, Email & Status -->
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="relative shrink-0">
                <img [src]="user.avatar" [alt]="user.name"
                     class="w-10 h-10 rounded-full object-cover border"
                     [ngClass]="isCurrentUser(user) ? 'border-red-500' : (isDark ? 'border-neutral-700' : 'border-neutral-200')"
                     (error)="onImgError($event, user.name)">
                <span *ngIf="user.role === 'Admin'" 
                      class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-600 border flex items-center justify-center text-[6px] text-white"
                      [ngClass]="isDark ? 'border-neutral-900' : 'border-white'">
                  ★
                </span>
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-1.5">
                  <p class="text-sm font-bold truncate leading-snug" 
                     [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                    {{ user.name }}
                  </p>
                  <span *ngIf="isCurrentUser(user)"
                        class="px-1 py-0.2 rounded text-[8px] font-mono font-bold uppercase bg-red-600/20 text-red-400 border border-red-500/30">
                    Tú
                  </span>
                </div>
                <p class="text-xs font-mono truncate opacity-60" 
                   [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                  {{ user.email }}
                </p>
              </div>
            </div>
            
            <!-- Status Badge -->
            <button *ngIf="!isCurrentUser(user)"
                    (click)="toggleStatus(user.id)"
                    class="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border cursor-pointer active:scale-95 transition-all"
                    [ngClass]="user.status === 'Activo' 
                      ? (isDark ? 'bg-neutral-800 text-white border-neutral-700' : 'bg-neutral-900 text-white border-neutral-800')
                      : 'bg-neutral-500/10 border-neutral-500/30 text-neutral-400'">
              <span class="w-1.5 h-1.5 rounded-full" 
                    [ngClass]="user.status === 'Activo' ? 'bg-white animate-pulse' : 'bg-neutral-400'"></span>
              {{ user.status }}
            </button>
            <span *ngIf="isCurrentUser(user)"
                  class="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border"
                  [ngClass]="isDark ? 'bg-neutral-800 text-white border-neutral-700' : 'bg-neutral-900 text-white border-neutral-800'">
              <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
              {{ user.status }}
            </span>
          </div>

          <!-- Middle Row: Joined Date -->
          <div class="flex items-center justify-between text-xs py-2 border-t"
               [ngClass]="isDark ? 'border-neutral-800/80 text-neutral-400' : 'border-neutral-100 text-neutral-500'">
            <span class="text-[10px] font-mono uppercase tracking-wider opacity-60">Registrado</span>
            <span class="font-mono text-xs">{{ user.joined }}</span>
          </div>

          <!-- Bottom Control Bar: Role select & Action buttons -->
          <div class="pt-2.5 border-t flex items-center justify-between gap-2"
               [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-100'">
            
            <!-- Role control -->
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-mono font-bold uppercase tracking-wider opacity-50">Rol:</span>
              <span *ngIf="isCurrentUser(user)"
                    class="text-[10px] font-mono font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border flex items-center gap-1"
                    [ngClass]="getRoleBadgeClass(user.role)">
                {{ user.role }} <span class="text-[9px]">🔒</span>
              </span>

              <select *ngIf="!isCurrentUser(user)"
                      [ngModel]="user.role"
                      (ngModelChange)="changeRole(user, $event)"
                      [disabled]="updatingRole[user.id]"
                      class="text-[10px] font-mono font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none"
                      [ngClass]="getRoleSelectClass(user.role)">
                <option value="Admin">ADMIN</option>
                <option value="Usuario">USUARIO</option>
              </select>
            </div>

            <!-- Delete Action -->
            <div class="flex items-center gap-1.5">
              <button *ngIf="!isCurrentUser(user)"
                      (click)="confirmDelete(user)"
                      [disabled]="deletingUser[user.id]"
                      class="p-2 rounded-xl text-xs transition-all active:scale-90 border"
                      [ngClass]="isDark ? 'text-red-400 bg-red-950/30 border-red-500/20 hover:bg-red-900/40' : 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100'"
                      title="Eliminar usuario">
                <span *ngIf="!deletingUser[user.id]" class="material-symbols-rounded" style="font-size: 16px;">delete</span>
                <span *ngIf="deletingUser[user.id]" class="material-symbols-rounded animate-spin" style="font-size: 16px;">sync</span>
              </button>
            </div>

          </div>

        </div>

        <!-- Empty state on mobile -->
        <div *ngIf="filteredUsers.length === 0" 
             class="p-8 text-center text-xs opacity-60 rounded-2xl border"
             [ngClass]="isDark ? 'border-neutral-800 bg-neutral-900/40' : 'border-neutral-200 bg-neutral-50'">
          No se encontraron usuarios con el filtro actual.
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

    /* Red Pulse Dot */
    .red-pulse-dot {
      box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6);
      animation: redPulse 2s infinite cubic-bezier(0.66, 0, 0, 1);
    }
    @keyframes redPulse {
      to {
        box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
      }
    }

    /* Executive Theme Styles (Rojo, Gris y Blanco) */
    .card-executive {
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .card-executive:hover {
      transform: translateY(-2px);
    }
    .red-accent-top {
      position: relative;
      overflow: hidden;
    }
    .red-accent-top::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, #ef4444 0%, rgba(239, 68, 68, 0.4) 60%, transparent 100%);
      opacity: 0.85;
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
        (u.email && u.email.toLowerCase().includes(q))
      );
    }

    return list;
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

