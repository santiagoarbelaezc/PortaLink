import { Component, Input, OnInit, ElementRef, ViewChild, ChangeDetectorRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';
import { DbSchemaParser } from './db-schema-parser';
import { DbColumn, DbRelation, DbSchema, DbTable, SampleTemplate } from './db-viewer.models';

interface VisualConnector {
  relation: DbRelation;
  path: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  midX: number;
  midY: number;
  cardinality: string;
  strokeColor: string;
  strokeDash?: string;
  tooltipText: string;
}

@Component({
  selector: 'app-dash-db-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  template: `
    <div class="space-y-6 tab-enter font-sans select-none">

      <!-- ══════════════════════════════════════
           HEADER & CONTROL BAR
      ══════════════════════════════════════ -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-5"
           [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <p class="text-xs font-headline font-semibold uppercase tracking-[0.25em]"
               [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
              Herramientas de Desarrollo & Arquitectura
            </p>
          </div>
          <div class="flex items-center gap-3 mt-1">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                 [ngClass]="isDark ? 'bg-[#141419] text-white border border-neutral-800' : 'bg-neutral-100 text-neutral-900 border border-neutral-200'">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"></path>
                <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"></path>
              </svg>
            </div>
            <div>
              <h2 class="text-2xl sm:text-3xl font-headline font-bold tracking-tight"
                  [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                Visor de Base de Datos
              </h2>
            </div>
          </div>
        </div>

        <!-- Metrics Badges & Controls -->
        <div class="flex flex-wrap items-center gap-2.5">
          <!-- Summary Metrics Chips (Monocromático Refinado) -->
          <div class="flex items-center gap-1.5 p-1 rounded-2xl border text-xs font-medium"
               [ngClass]="isDark ? 'bg-[#141419] border-neutral-800 text-neutral-300' : 'bg-neutral-50 border-neutral-200 text-neutral-700'">
            <span class="px-2.5 py-1 rounded-xl flex items-center gap-1.5 font-bold"
                  [ngClass]="isDark ? 'bg-neutral-900 border border-neutral-700 text-white' : 'bg-white text-neutral-900 shadow-xs'">
              <svg class="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              {{ schema.summary.totalTables }} <span class="font-normal opacity-70">tablas</span>
            </span>

            <span class="px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-[11px] font-mono font-semibold transition-colors"
                  [ngClass]="isDark ? 'text-sky-300 bg-sky-500/10 border border-sky-500/25' : 'text-sky-700 bg-sky-50 border border-sky-200'">
              <span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
              {{ schema.summary.oneToOneCount }} (1:1)
            </span>

            <span class="px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-[11px] font-mono font-semibold transition-colors"
                  [ngClass]="isDark ? 'text-rose-300 bg-rose-500/10 border border-rose-500/25' : 'text-rose-700 bg-rose-50 border border-rose-200'">
              <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              {{ schema.summary.oneToManyCount }} (1:N)
            </span>

            <span class="px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-[11px] font-mono font-semibold transition-colors"
                  [ngClass]="isDark ? 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/25' : 'text-emerald-700 bg-emerald-50 border border-emerald-200'">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {{ schema.summary.manyToManyCount }} (N:M)
            </span>
          </div>

          <!-- View Selector Tabs (Estilo Dash Calendar Filter Dock) -->
          <div class="flex items-center gap-1 p-1 rounded-2xl border backdrop-blur-md"
               [ngClass]="isDark ? 'bg-[#141419] border-neutral-800' : 'bg-neutral-100 border-neutral-200'">
            <button (click)="activeSubView = 'diagram'"
                    class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                    [ngClass]="activeSubView === 'diagram'
                      ? (isDark ? 'bg-white text-black shadow-md font-bold' : 'bg-neutral-900 text-white shadow-md font-bold')
                      : (isDark ? 'text-neutral-400 hover:text-white hover:bg-neutral-800/60' : 'text-neutral-600 hover:text-black hover:bg-white')">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
              <span>Diagrama ERD</span>
            </button>

            <button (click)="activeSubView = 'dictionary'"
                    class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                    [ngClass]="activeSubView === 'dictionary'
                      ? (isDark ? 'bg-white text-black shadow-md font-bold' : 'bg-neutral-900 text-white shadow-md font-bold')
                      : (isDark ? 'text-neutral-400 hover:text-white hover:bg-neutral-800/60' : 'text-neutral-600 hover:text-black hover:bg-white')">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
              </svg>
              <span>Diccionario</span>
            </button>

            <button (click)="activeSubView = 'relations'"
                    class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                    [ngClass]="activeSubView === 'relations'
                      ? (isDark ? 'bg-white text-black shadow-md font-bold' : 'bg-neutral-900 text-white shadow-md font-bold')
                      : (isDark ? 'text-neutral-400 hover:text-white hover:bg-neutral-800/60' : 'text-neutral-600 hover:text-black hover:bg-white')">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
              <span>Relaciones ({{ schema.relations.length }})</span>
            </button>
          </div>

          <!-- Toggle SQL Editor Button (Estilo Píldora Ejecutiva) -->
          <button (click)="isEditorOpen = !isEditorOpen"
                  class="px-3.5 py-2 rounded-xl text-xs font-headline font-bold uppercase tracking-wider transition-all duration-200 border flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
                  [ngClass]="isEditorOpen
                    ? (isDark ? 'bg-white text-black border-white shadow-md' : 'bg-neutral-900 text-white border-neutral-900 shadow-md')
                    : (isDark ? 'bg-neutral-900 border-neutral-700/80 text-neutral-300 hover:text-white hover:bg-neutral-800' : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50')">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            <span>{{ isEditorOpen ? 'Ocultar Entrada SQL' : 'Editar SQL / Entrada' }}</span>
          </button>
        </div>
      </div>

      <!-- ══════════════════════════════════════
           SQL INPUT / EDITOR PANEL (COLLAPSIBLE)
      ══════════════════════════════════════ -->
      <div *ngIf="isEditorOpen"
           class="rounded-2xl border p-4 sm:p-5 transition-all duration-300 shadow-xl"
           [ngClass]="isDark ? 'bg-[#0c0c0e] border-neutral-800' : 'bg-white border-neutral-200'">
        
        <!-- Panel Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b"
             [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-100'">
          <div class="flex items-center gap-2">
            <span class="p-1.5 rounded-lg text-white bg-neutral-900 border border-neutral-800">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
              </svg>
            </span>
            <span class="text-sm font-bold" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              Editor de Esquema SQL DDL
            </span>
            <span class="text-[11px] px-2 py-0.5 rounded-full font-mono"
                  [ngClass]="isDark ? 'bg-neutral-900 border border-neutral-800 text-neutral-400' : 'bg-neutral-100 text-neutral-600'">
              MySQL / PostgreSQL / SQLite / JSON
            </span>
          </div>

          <!-- Template Quick Selectors -->
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-semibold opacity-60">Ejemplos Rápidos:</span>
            <button *ngFor="let sample of sampleTemplates"
                    (click)="loadTemplate(sample)"
                    class="px-2.5 py-1 rounded-xl text-xs font-medium transition-all duration-150 border cursor-pointer hover:scale-105 active:scale-95"
                    [ngClass]="isDark ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border-neutral-700/80' : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border-neutral-200'">
              {{ sample.name }}
            </button>
          </div>
        </div>

        <!-- Textarea Code Editor -->
        <div class="mt-3 relative">
          <textarea
            [(ngModel)]="sqlInput"
            rows="10"
            spellcheck="false"
            placeholder="Pega aquí tus sentencias CREATE TABLE... o haz clic en uno de los Ejemplos Rápidos arriba"
            class="w-full font-mono text-xs sm:text-sm p-4 rounded-xl border focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500/20 transition-all resize-y leading-relaxed"
            [ngClass]="isDark
              ? 'bg-[#111116] border-neutral-800 text-neutral-100 placeholder-neutral-600'
              : 'bg-neutral-50 border-neutral-200 text-neutral-800 placeholder-neutral-400'">
          </textarea>
        </div>

        <!-- Editor Action Buttons -->
        <div class="flex flex-wrap items-center justify-end gap-2.5 mt-3 pt-3 border-t"
             [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-100'">
          <div class="flex items-center gap-2.5">
            <button (click)="clearInput()"
                    class="px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer hover:bg-neutral-800 hover:text-white"
                    [ngClass]="isDark ? 'border-neutral-800 text-neutral-400' : 'border-neutral-200 text-neutral-600'">
              Limpiar
            </button>

            <button (click)="applySchema()"
                    class="px-5 py-2 rounded-xl text-xs font-headline font-bold uppercase tracking-wider text-black bg-white hover:bg-neutral-200 shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              <span>Generar Diagrama & Relaciones</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════
           VIEW 1: INTERACTIVE ERD CANVAS
      ══════════════════════════════════════ -->
      <div #diagramContainer
           *ngIf="activeSubView === 'diagram'"
           class="relative transition-all duration-300 shadow-2xl"
           [ngClass]="[
             isDark ? 'bg-[#0c0c0e]' : 'bg-neutral-100/90',
             isFullscreen
               ? 'fixed inset-0 z-50 w-screen h-screen rounded-none border-none overflow-hidden'
               : 'rounded-2xl border overflow-hidden ' + (isDark ? 'border-neutral-800' : 'border-neutral-300')
           ]">

        <!-- Canvas Floating Toolbar (Monocromático Refinado) -->
        <div class="absolute top-4 left-4 z-30 flex items-center gap-2 p-1.5 rounded-2xl border backdrop-blur-xl shadow-2xl"
             [ngClass]="isDark ? 'bg-[#141419]/95 border-neutral-700/80 text-white' : 'bg-white/95 border-neutral-200 text-neutral-900'">
          
          <!-- Zoom Out -->
          <button (click)="zoomOut()" title="Alejar (-)" class="p-2 rounded-xl hover:bg-neutral-800 active:scale-90 transition-all cursor-pointer">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
            </svg>
          </button>

          <span class="text-xs font-mono font-bold px-1 min-w-[42px] text-center">
            {{ (zoomScale * 100) | number:'1.0-0' }}%
          </span>

          <!-- Zoom In -->
          <button (click)="zoomIn()" title="Acercar (+)" class="p-2 rounded-xl hover:bg-neutral-800 active:scale-90 transition-all cursor-pointer">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>

          <div class="h-4 w-px bg-neutral-700/60 mx-0.5"></div>

          <!-- Auto-Layout -->
          <button (click)="autoLayout()" title="Reorganizar tablas automáticamente"
                  class="px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer">
            <svg class="w-3.5 h-3.5 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            <span class="hidden sm:inline">Auto-organizar</span>
          </button>

          <!-- Reset Fit View -->
          <button (click)="resetView()" title="Centrar y reajustar lienzo"
                  class="px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
            <span class="hidden sm:inline">Ajustar</span>
          </button>

          <!-- Fullscreen Toggle -->
          <button (click)="toggleFullscreen()"
                  [title]="isFullscreen ? 'Salir de pantalla completa (Esc)' : 'Pantalla completa'"
                  class="px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer"
                  [ngClass]="isFullscreen ? 'text-white bg-neutral-800 border border-neutral-700 font-bold' : ''">
            <svg *ngIf="!isFullscreen" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
            <svg *ngIf="isFullscreen" class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
            </svg>
            <span class="hidden sm:inline">{{ isFullscreen ? 'Salir' : 'Pantalla Completa' }}</span>
          </button>

          <!-- Selected Table Clear Chip -->
          <button *ngIf="selectedTableName"
                  (click)="clearSelection($event)"
                  title="Deseleccionar y ver todas las tablas normales"
                  class="px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-neutral-800 text-white border border-neutral-700 hover:bg-neutral-700 transition-all cursor-pointer">
            <span class="truncate max-w-[110px]">Enfoque: {{ selectedTableName }}</span>
            <span class="font-bold text-xs ml-0.5">✕</span>
          </button>
        </div>

        <!-- Search Table Filter (Floating Right) -->
        <div class="absolute top-4 right-4 z-30 flex items-center gap-2">
          <div class="relative">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Buscar tabla o campo..."
              class="w-40 sm:w-56 px-3 py-1.5 pl-8 rounded-xl text-xs font-medium border backdrop-blur-xl transition-all focus:w-64 focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-500/20"
              [ngClass]="isDark ? 'bg-[#141419]/95 border-neutral-700/80 text-white placeholder-neutral-500' : 'bg-white/95 border-neutral-200 text-neutral-900 placeholder-neutral-400'">
            <svg class="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <button *ngIf="searchQuery" (click)="searchQuery = ''" class="absolute right-2 top-2 text-neutral-400 hover:text-white text-xs font-bold">×</button>
          </div>
        </div>

        <!-- Legend Overlay (Bottom Left con Colores Semánticos) -->
        <div class="absolute bottom-4 left-4 z-30 hidden sm:flex items-center gap-3.5 px-3.5 py-2 rounded-xl border backdrop-blur-xl text-[11px]"
             [ngClass]="isDark ? 'bg-[#141419]/95 border-neutral-800 text-neutral-300' : 'bg-white/90 border-neutral-200 text-neutral-700'">
          <span class="font-bold uppercase tracking-wider opacity-60">Tipos de Enlace:</span>
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-sky-400"></span>
            <b class="text-sky-400">1:1</b> Uno a Uno
          </span>
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-rose-400"></span>
            <b class="text-rose-400">1:N</b> Uno a Muchos
          </span>
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <b class="text-emerald-400">N:M</b> Muchos a Muchos
          </span>
        </div>

        <!-- CANVAS VIEWPORT (PAN & ZOOM CONTAINER) -->
        <div #canvasViewport
             (mousedown)="startPan($event)"
             (click)="onCanvasClick($event)"
             class="w-full overflow-hidden relative cursor-grab active:cursor-grabbing grid-canvas"
             [ngClass]="[
               isDark ? 'bg-[#0c0c0e]' : 'bg-neutral-100',
               isFullscreen ? 'h-full w-full min-h-screen' : 'h-[680px]'
             ]">

          <!-- TRANSFORMABLE CANVAS SURFACE -->
          <div [style.transform]="'translate(' + panX + 'px, ' + panY + 'px) scale(' + zoomScale + ')'"
               [style.transform-origin]="'0 0'"
               class="w-[4000px] h-[3000px] absolute top-0 left-0 transition-transform duration-75">

            <!-- SVG RELATIONSHIP CONNECTORS LAYER -->
            <svg class="w-full h-full absolute inset-0 pointer-events-none z-10">
              <defs>
                <!-- Marker for Standard 1:1 (Azul) -->
                <marker id="marker-arrow-cyan" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#38bdf8" />
                </marker>
                <!-- Marker for Standard 1:N (Rojo) -->
                <marker id="marker-arrow-indigo" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#f43f5e" />
                </marker>
                <!-- Marker for Standard N:M (Verde) -->
                <marker id="marker-arrow-amber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#10b981" />
                </marker>
              </defs>

              <g *ngFor="let conn of connectors">
                <!-- Outer Glow Line (When Highlighted) -->
                <path [attr.d]="conn.path"
                      fill="none"
                      [attr.stroke]="conn.strokeColor"
                      stroke-width="7"
                      stroke-opacity="0.18" />

                <!-- Main Bézier Curve Line -->
                <path [attr.d]="conn.path"
                      fill="none"
                      [attr.stroke]="conn.strokeColor"
                      stroke-width="2"
                      [attr.stroke-dasharray]="conn.strokeDash || null"
                      class="transition-all duration-150" />

                <!-- Badge on the connection midpoint -->
                <g [attr.transform]="'translate(' + conn.midX + ',' + conn.midY + ')'">
                  <rect x="-18" y="-10" width="36" height="20" rx="6"
                        [attr.fill]="isDark ? '#141419' : '#ffffff'"
                        [attr.stroke]="conn.strokeColor"
                        stroke-width="1.5" />
                  <text x="0" y="4"
                        text-anchor="middle"
                        font-family="monospace"
                        font-size="9"
                        font-weight="bold"
                        [attr.fill]="conn.strokeColor">
                    {{ conn.cardinality }}
                  </text>
                </g>
              </g>
            </svg>

            <!-- DRAGGABLE TABLES LAYER -->
            <div *ngFor="let table of schema.tables"
                 cdkDrag
                 [style.left.px]="table.x"
                 [style.top.px]="table.y"
                 (cdkDragStarted)="onTableDragStarted()"
                 (cdkDragMoved)="onTableDragMoved($event, table)"
                 (cdkDragEnded)="onTableDragEnded($event, table)"
                 (click)="selectPinTable(table.name, $event)"
                 class="absolute z-20 w-[280px] rounded-2xl border shadow-xl cursor-default select-none transition-shadow duration-200"
                 [ngClass]="[
                   table.isJunctionTable
                     ? (isDark ? 'bg-[#111116] border-rose-500/30 text-neutral-100' : 'bg-white border-rose-300 text-neutral-900')
                     : (isDark ? 'bg-[#111116] border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'),
                   isTableHighlighted(table.name) ? 'ring-2 ring-white/90 shadow-[0_0_25px_rgba(255,255,255,0.15)]' : '',
                   isTableDimmed(table.name) ? 'opacity-30' : 'opacity-100'
                 ]">

              <!-- Table Card Header (Drag Handle) -->
              <div cdkDragHandle
                   class="px-4 py-3 border-b flex items-center justify-between cursor-grab active:cursor-grabbing select-none rounded-t-2xl"
                   [ngClass]="table.isJunctionTable
                     ? (isDark ? 'bg-rose-500/10 border-rose-500/25' : 'bg-rose-50 border-rose-200')
                     : (isDark ? 'bg-[#18181f] border-neutral-800' : 'bg-neutral-50 border-neutral-200')">
                
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                       [ngClass]="table.isJunctionTable
                         ? (isDark ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-rose-100 text-rose-700')
                         : (isDark ? 'bg-neutral-900 text-white border border-neutral-700' : 'bg-neutral-200 text-neutral-800')">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                  </div>
                  <div class="min-w-0">
                    <h3 class="text-xs font-mono font-bold tracking-tight truncate"
                        [title]="table.name">
                      {{ table.name }}
                    </h3>
                    <span *ngIf="table.isJunctionTable"
                          class="text-[9px] uppercase font-bold text-rose-400 tracking-wider">
                      Tabla Pivote (N:M)
                    </span>
                  </div>
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                  <span class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full"
                        [ngClass]="isDark ? 'bg-neutral-900 border border-neutral-700 text-neutral-300' : 'bg-neutral-200 text-neutral-700'">
                    {{ table.columns.length }}
                  </span>
                </div>
              </div>

              <!-- Columns Rows -->
              <div class="p-2 space-y-0.5 max-h-[380px] overflow-y-auto no-scrollbar font-mono text-xs">
                <div *ngFor="let col of table.columns"
                     class="flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors group"
                     [ngClass]="[
                       isDark ? 'hover:bg-neutral-800/60' : 'hover:bg-neutral-100',
                       isColumnMatched(table.name, col.name) ? 'bg-sky-500/20 text-sky-300 font-bold' : ''
                     ]">
                  
                  <!-- Left: Badges + Column Name -->
                  <div class="flex items-center gap-2 min-w-0">
                    <!-- Key Badge: PK / FK -->
                    <span *ngIf="col.isPrimaryKey"
                          title="Primary Key"
                          class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      PK
                    </span>
                    <span *ngIf="col.isForeignKey"
                          title="Foreign Key"
                          class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                      FK
                    </span>
                    <span *ngIf="!col.isPrimaryKey && !col.isForeignKey"
                          class="w-4 h-4 flex items-center justify-center opacity-30 text-[10px]">
                      •
                    </span>

                    <span class="truncate font-mono" [ngClass]="col.isPrimaryKey ? 'font-bold text-amber-200' : ''">
                      {{ col.name }}
                    </span>
                  </div>

                  <!-- Right: Type Pill & Nullability -->
                  <div class="flex items-center gap-1.5 shrink-0">
                    <span class="text-[10px] opacity-70 truncate max-w-[85px] font-mono text-neutral-300" [title]="col.type">
                      {{ col.type }}
                    </span>
                    <span *ngIf="!col.isNullable"
                          title="NOT NULL"
                          class="text-[9px] text-rose-400 font-bold uppercase">
                      *
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      <!-- ══════════════════════════════════════
           VIEW 2: DATA DICTIONARY (TABULAR)
      ══════════════════════════════════════ -->
      <div *ngIf="activeSubView === 'dictionary'" class="space-y-5">
        <div *ngFor="let table of filteredTables"
             class="rounded-2xl border overflow-hidden shadow-sm"
             [ngClass]="isDark ? 'bg-[#0c0c0e] border-neutral-800' : 'bg-white border-neutral-200'">
          
          <!-- Table Title Bar -->
          <div class="px-5 py-3.5 border-b flex items-center justify-between"
               [ngClass]="isDark ? 'bg-[#141419] border-neutral-800' : 'bg-neutral-50 border-neutral-200'">
            <div class="flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              <h3 class="text-sm font-mono font-bold" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                {{ table.name }}
              </h3>
              <span *ngIf="table.isJunctionTable"
                    class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                Tabla Intermedia (N:M)
              </span>
            </div>
            <span class="text-xs opacity-60 font-mono">{{ table.columns.length }} campos definidos</span>
          </div>

          <!-- Dictionary Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs font-mono">
              <thead class="uppercase tracking-wider text-[10px] border-b"
                     [ngClass]="isDark ? 'border-neutral-800 text-neutral-400 bg-[#111116]' : 'border-neutral-100 text-neutral-500 bg-neutral-100/50'">
                <tr>
                  <th class="px-4 py-2.5">Campo</th>
                  <th class="px-4 py-2.5">Tipo de Dato</th>
                  <th class="px-4 py-2.5">Claves</th>
                  <th class="px-4 py-2.5">Único</th>
                  <th class="px-4 py-2.5">Nulo</th>
                  <th class="px-4 py-2.5">Por Defecto</th>
                  <th class="px-4 py-2.5">Referencias</th>
                </tr>
              </thead>
              <tbody class="divide-y" [ngClass]="isDark ? 'divide-neutral-800/60 text-neutral-200' : 'divide-neutral-100 text-neutral-800'">
                <tr *ngFor="let col of table.columns"
                    class="hover:bg-neutral-800/40 transition-colors">
                  <td class="px-4 py-3 font-bold" [ngClass]="col.isPrimaryKey ? 'text-amber-300' : (col.isForeignKey ? 'text-sky-300' : '')">
                    {{ col.name }}
                  </td>
                  <td class="px-4 py-3 text-sky-400 font-semibold">{{ col.type }}</td>
                  <td class="px-4 py-3">
                    <span *ngIf="col.isPrimaryKey" class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 mr-1.5">PK</span>
                    <span *ngIf="col.isForeignKey" class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">FK</span>
                    <span *ngIf="!col.isPrimaryKey && !col.isForeignKey" class="opacity-30">—</span>
                  </td>
                  <td class="px-4 py-3">
                    <span *ngIf="col.isUnique" class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">SÍ</span>
                    <span *ngIf="!col.isUnique" class="opacity-30">—</span>
                  </td>
                  <td class="px-4 py-3">
                    <span [ngClass]="col.isNullable ? 'opacity-50 text-neutral-400' : 'font-bold text-rose-400'">
                      {{ col.isNullable ? 'NULL' : 'NOT NULL' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 opacity-70">{{ col.defaultValue || '—' }}</td>
                  <td class="px-4 py-3">
                    <span *ngIf="col.references" class="text-emerald-400 font-bold flex items-center gap-1">
                      <span class="text-xs">➔</span> {{ col.references.table }}.{{ col.references.column }}
                    </span>
                    <span *ngIf="!col.references" class="opacity-30">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>

      <!-- ══════════════════════════════════════
           VIEW 3: RELATIONS MATRIX & SUMMARY
      ══════════════════════════════════════ -->
      <div *ngIf="activeSubView === 'relations'" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <div *ngFor="let rel of schema.relations"
               class="rounded-2xl border p-4 transition-all duration-200 hover:border-neutral-700"
               [ngClass]="isDark ? 'bg-[#0c0c0e] border-neutral-800' : 'bg-white border-neutral-200'">
            
            <!-- Cardinality Header -->
            <div class="flex items-center justify-between pb-3 border-b"
                 [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-100'">
              <span class="px-2.5 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5"
                    [ngClass]="getCardinalityBadgeClass(rel.cardinality)">
                <span class="w-1.5 h-1.5 rounded-full"
                      [ngClass]="rel.cardinality === '1:1' ? 'bg-sky-400' : (rel.cardinality === '1:N' ? 'bg-rose-400' : 'bg-emerald-400')"></span>
                {{ rel.cardinality }} {{ getCardinalityTitle(rel.cardinality) }}
              </span>
              <span *ngIf="rel.junctionTable" class="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/25">
                Pivote: {{ rel.junctionTable }}
              </span>
            </div>

            <!-- Path Connection Display -->
            <div class="py-3 flex items-center justify-between gap-2 font-mono text-xs">
              <div class="p-2.5 rounded-xl border flex-1 text-center truncate"
                   [ngClass]="isDark ? 'bg-[#141419] border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-900'">
                <p class="text-[10px] opacity-60 uppercase font-sans">Origen</p>
                <p class="font-bold truncate text-neutral-200 mt-0.5" [title]="rel.sourceTable + '.' + rel.sourceColumn">
                  {{ rel.sourceTable }}.<span class="text-sky-400 font-bold">{{ rel.sourceColumn }}</span>
                </p>
              </div>

              <div class="text-neutral-500 font-bold shrink-0">➔</div>

              <div class="p-2.5 rounded-xl border flex-1 text-center truncate"
                   [ngClass]="isDark ? 'bg-[#141419] border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-900'">
                <p class="text-[10px] opacity-60 uppercase font-sans">Destino</p>
                <p class="font-bold truncate text-neutral-200 mt-0.5" [title]="rel.targetTable + '.' + rel.targetColumn">
                  {{ rel.targetTable }}.<span class="font-bold" [ngClass]="rel.cardinality === '1:N' ? 'text-rose-400' : (rel.cardinality === '1:1' ? 'text-sky-400' : 'text-emerald-400')">{{ rel.targetColumn }}</span>
                </p>
              </div>
            </div>

            <p class="text-xs opacity-75 leading-relaxed font-sans text-neutral-400">
              {{ rel.description }}
            </p>
          </div>
        </div>

        <div *ngIf="schema.relations.length === 0"
             class="p-12 text-center rounded-2xl border border-dashed text-neutral-400"
             [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
          No se encontraron relaciones explícitas (FOREIGN KEY) en el script ingresado.
        </div>
      </div>

    </div>
  `,
  styles: [`
    .grid-canvas {
      background-size: 24px 24px;
      background-image: 
        radial-gradient(rgba(255, 255, 255, 0.08) 1.2px, transparent 1.2px);
    }
  `]
})
export class DashDbViewerComponent implements OnInit {
  @Input() theme: string = 'dark';

  @ViewChild('canvasViewport') canvasViewport!: ElementRef<HTMLDivElement>;
  @ViewChild('diagramContainer') diagramContainer!: ElementRef<HTMLDivElement>;

  get isDark(): boolean {
    return this.theme === 'dark';
  }

  // Fullscreen toggle state
  isFullscreen: boolean = false;

  // Active subview: 'diagram' | 'dictionary' | 'relations'
  activeSubView: 'diagram' | 'dictionary' | 'relations' = 'diagram';

  // Code editor visibility & input
  isEditorOpen: boolean = false;
  sqlInput: string = '';

  // Schema state
  schema: DbSchema = {
    tables: [],
    relations: [],
    summary: {
      totalTables: 0,
      totalColumns: 0,
      totalRelations: 0,
      oneToOneCount: 0,
      oneToManyCount: 0,
      manyToManyCount: 0
    }
  };

  // Pre-loaded template samples
  sampleTemplates: SampleTemplate[] = DbSchemaParser.getSampleTemplates();

  // Canvas pan & zoom state
  zoomScale: number = 0.9;
  panX: number = 40;
  panY: number = 30;
  isPanning: boolean = false;
  startPanMouseX: number = 0;
  startPanMouseY: number = 0;

  // Search filter
  searchQuery: string = '';

  // Selection / Highlight state
  selectedTableName: string | null = null;

  // SVG Visual Connectors cache
  connectors: VisualConnector[] = [];

  // Storage Keys for persistence
  private readonly STORAGE_SQL_KEY = 'portalink_db_viewer_sql';
  private readonly STORAGE_POSITIONS_KEY = 'portalink_db_viewer_positions';

  ngOnInit(): void {
    const savedSql = typeof localStorage !== 'undefined' ? localStorage.getItem(this.STORAGE_SQL_KEY) : null;
    if (savedSql && savedSql.trim()) {
      this.sqlInput = savedSql;
      this.schema = DbSchemaParser.parse(this.sqlInput);
      this.restoreTablePositions();
      this.recalculateConnectors();
    } else if (this.sampleTemplates.length > 0) {
      this.loadTemplate(this.sampleTemplates[0]);
    }
  }

  /**
   * Applies and re-parses the current SQL input and saves to localStorage
   */
  applySchema(): void {
    this.schema = DbSchemaParser.parse(this.sqlInput);
    this.saveSqlToStorage();
    this.restoreTablePositions();
    this.isEditorOpen = false;
    this.recalculateConnectors();
  }

  /**
   * Loads one of the pre-packaged sample templates
   */
  loadTemplate(sample: SampleTemplate): void {
    this.sqlInput = sample.sql;
    this.schema = DbSchemaParser.parse(this.sqlInput);
    this.saveSqlToStorage();
    this.recalculateConnectors();
  }

  /**
   * Clears editor input, canvas and localStorage
   */
  clearInput(): void {
    this.sqlInput = '';
    this.schema = DbSchemaParser.parse('');
    this.connectors = [];
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.STORAGE_SQL_KEY);
      localStorage.removeItem(this.STORAGE_POSITIONS_KEY);
    }
  }

  /**
   * Reorganizes tables using smart layout
   */
  autoLayout(): void {
    DbSchemaParser.computeAutoLayout(this.schema.tables);
    this.saveTablePositions();
    this.recalculateConnectors();
    this.resetView();
  }

  /**
   * Storage helpers
   */
  private saveSqlToStorage(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_SQL_KEY, this.sqlInput);
    }
  }

  private saveTablePositions(): void {
    if (typeof localStorage !== 'undefined') {
      const positions: Record<string, { x: number; y: number }> = {};
      this.schema.tables.forEach(t => {
        positions[t.name.toLowerCase()] = { x: t.x, y: t.y };
      });
      localStorage.setItem(this.STORAGE_POSITIONS_KEY, JSON.stringify(positions));
    }
  }

  private restoreTablePositions(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(this.STORAGE_POSITIONS_KEY);
        if (raw) {
          const positions = JSON.parse(raw);
          this.schema.tables.forEach(t => {
            const saved = positions[t.name.toLowerCase()];
            if (saved && typeof saved.x === 'number' && typeof saved.y === 'number') {
              t.x = saved.x;
              t.y = saved.y;
            }
          });
        }
      } catch (e) {
        console.warn('[DashDbViewer] Error restoring table positions:', e);
      }
    }
  }

  /**
   * Resets zoom and pan to initial comfortable position
   */
  resetView(): void {
    this.zoomScale = 0.9;
    this.panX = 40;
    this.panY = 30;
  }

  zoomIn(): void {
    this.zoomScale = Math.min(2.0, +(this.zoomScale + 0.1).toFixed(2));
  }

  zoomOut(): void {
    this.zoomScale = Math.max(0.3, +(this.zoomScale - 0.1).toFixed(2));
  }

  // Drag state flag to prevent click toggle during dragging
  isDraggingTable: boolean = false;

  /**
   * Mouse Pan Dragging handlers
   */
  startPan(event: MouseEvent): void {
    // Only pan if clicking on canvas background directly, not on a table card
    const target = event.target as HTMLElement;
    if (target.closest('.cdk-drag') || target.closest('button') || target.closest('input')) {
      return;
    }
    // Clicking on canvas background automatically deselects any pinned table
    this.selectedTableName = null;

    this.isPanning = true;
    this.startPanMouseX = event.clientX - this.panX;
    this.startPanMouseY = event.clientY - this.panY;
  }

  onCanvasClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.cdk-drag') && !target.closest('button') && !target.closest('input')) {
      this.selectedTableName = null;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    // If click is outside any table card and not on a toolbar button or input, deselect table
    if (!target.closest('.cdk-drag') && !target.closest('button') && !target.closest('input')) {
      this.selectedTableName = null;
    }
  }

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;

    if (typeof document !== 'undefined') {
      if (this.isFullscreen) {
        const el = this.diagramContainer?.nativeElement || document.documentElement;
        if (el && el.requestFullscreen && !document.fullscreenElement) {
          el.requestFullscreen().catch(() => {});
        }
      } else {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    }
  }

  @HostListener('document:fullscreenchange')
  onFullscreenChange(): void {
    if (typeof document !== 'undefined') {
      this.isFullscreen = !!document.fullscreenElement;
    }
  }

  @HostListener('window:keydown.escape')
  onEscapePress(): void {
    if (this.isFullscreen) {
      this.toggleFullscreen();
      return;
    }
    this.selectedTableName = null;
    this.searchQuery = '';
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isPanning) return;
    this.panX = event.clientX - this.startPanMouseX;
    this.panY = event.clientY - this.startPanMouseY;
  }

  @HostListener('window:mouseup')
  onMouseUp(): void {
    this.isPanning = false;
  }

  /**
   * Table drag-drop updates
   */
  onTableDragStarted(): void {
    this.isDraggingTable = true;
  }

  onTableDragMoved(event: CdkDragMove, table: DbTable): void {
    const dx = event.distance.x / this.zoomScale;
    const dy = event.distance.y / this.zoomScale;
    this.recalculateConnectors(table.name, table.x + dx, table.y + dy);
  }

  onTableDragEnded(event: CdkDragEnd, table: DbTable): void {
    const dx = event.distance.x / this.zoomScale;
    const dy = event.distance.y / this.zoomScale;
    table.x = Math.max(10, Math.round(table.x + dx));
    table.y = Math.max(10, Math.round(table.y + dy));

    // Reset CDK's internal transform so it stays precisely positioned via [style.left/top]
    event.source.reset();

    this.recalculateConnectors();
    this.saveTablePositions();

    // Delay resetting flag slightly so click event doesn't fire as table selection
    setTimeout(() => {
      this.isDraggingTable = false;
    }, 80);
  }

  /**
   * Calculates smooth cubic Bézier curves for all table relationships
   */
  recalculateConnectors(tempTableName?: string, tempX?: number, tempY?: number): void {
    const tableMap = new Map<string, DbTable>();
    this.schema.tables.forEach(t => tableMap.set(t.name.toLowerCase(), t));

    const newConnectors: VisualConnector[] = [];
    const cardWidth = 280;

    const getX = (t: DbTable) => {
      if (tempTableName && t.name.toLowerCase() === tempTableName.toLowerCase() && tempX !== undefined) {
        return tempX;
      }
      return t.x;
    };

    const getY = (t: DbTable) => {
      if (tempTableName && t.name.toLowerCase() === tempTableName.toLowerCase() && tempY !== undefined) {
        return tempY;
      }
      return t.y;
    };

    for (const rel of this.schema.relations) {
      const srcTable = tableMap.get(rel.sourceTable.toLowerCase());
      const tgtTable = tableMap.get(rel.targetTable.toLowerCase());

      if (!srcTable || !tgtTable) continue;

      const srcTableX = getX(srcTable);
      const srcTableY = getY(srcTable);
      const tgtTableX = getX(tgtTable);
      const tgtTableY = getY(tgtTable);

      // Calculate approximate Y position of the columns inside each table card
      const srcColIdx = srcTable.columns.findIndex(c => c.name.toLowerCase() === rel.sourceColumn.toLowerCase());
      const tgtColIdx = tgtTable.columns.findIndex(c => c.name.toLowerCase() === rel.targetColumn.toLowerCase());

      // Header is ~48px tall, each column row is ~34px tall
      const srcColY = srcTableY + 48 + (srcColIdx >= 0 ? srcColIdx * 34 + 17 : 20);
      const tgtColY = tgtTableY + 48 + (tgtColIdx >= 0 ? tgtColIdx * 34 + 17 : 20);

      // Determine which sides of the cards are closest
      let srcX = 0;
      let tgtX = 0;

      if (srcTable.name.toLowerCase() === tgtTable.name.toLowerCase()) {
        // Relación auto-referencial (ej. categorias.id_padre -> categorias.id)
        srcX = srcTableX + cardWidth;
        tgtX = srcTableX + cardWidth;
      } else if (srcTableX + cardWidth < tgtTableX) {
        // Source is to the left of Target: exit right side of source, enter left side of target
        srcX = srcTableX + cardWidth;
        tgtX = tgtTableX;
      } else if (tgtTableX + cardWidth < srcTableX) {
        // Target is to the left of Source: exit left side of source, enter right side of target
        srcX = srcTableX;
        tgtX = tgtTableX + cardWidth;
      } else {
        // Overlapping horizontally: connect on right sides
        srcX = srcTableX + cardWidth;
        tgtX = tgtTableX + cardWidth;
      }

      const srcY = srcColY;
      const tgtY = tgtColY;

      // Control points for cubic Bézier curve
      let cp1X: number;
      let cp1Y = srcY;
      let cp2X: number;
      let cp2Y = tgtY;

      if (srcTable.name.toLowerCase() === tgtTable.name.toLowerCase()) {
        const loopOffset = 50;
        cp1X = srcX + loopOffset;
        cp2X = tgtX + loopOffset;
      } else {
        const dx = Math.abs(tgtX - srcX) * 0.5;
        cp1X = srcX < tgtX ? srcX + Math.max(dx, 60) : srcX - Math.max(dx, 60);
        cp2X = srcX < tgtX ? tgtX - Math.max(dx, 60) : tgtX + Math.max(dx, 60);
      }

      const path = `M ${srcX} ${srcY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${tgtX} ${tgtY}`;

      // Midpoint on Bézier curve at t = 0.5
      const midX = 0.125 * srcX + 0.375 * cp1X + 0.375 * cp2X + 0.125 * tgtX;
      const midY = 0.125 * srcY + 0.375 * cp1Y + 0.375 * cp2Y + 0.125 * tgtY;

      // Styling based on cardinality (Azul 1:1, Rojo 1:N, Verde N:M)
      let strokeColor = '#f43f5e'; // 1:N default (Rojo)
      let strokeDash: string | undefined = undefined;

      if (rel.cardinality === '1:1') {
        strokeColor = '#38bdf8'; // 1:1 (Azul)
      } else if (rel.cardinality === 'N:M') {
        strokeColor = '#10b981'; // N:M (Verde)
        strokeDash = '5,4';
      }

      newConnectors.push({
        relation: rel,
        path,
        sourceX: srcX,
        sourceY: srcY,
        targetX: tgtX,
        targetY: tgtY,
        midX: Math.round(midX),
        midY: Math.round(midY),
        cardinality: rel.cardinality,
        strokeColor,
        strokeDash,
        tooltipText: rel.description || ''
      });
    }

    this.connectors = newConnectors;
  }

  /**
   * Search and selection helpers
   */
  get filteredTables(): DbTable[] {
    if (!this.searchQuery.trim()) return this.schema.tables;
    const q = this.searchQuery.toLowerCase();
    return this.schema.tables.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.columns.some(c => c.name.toLowerCase().includes(q))
    );
  }

  selectPinTable(name: string, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.isDraggingTable) return;

    if (this.selectedTableName === name) {
      this.selectedTableName = null;
    } else {
      this.selectedTableName = name;
    }
  }

  clearSelection(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.selectedTableName = null;
  }

  isTableHighlighted(name: string): boolean {
    if (this.selectedTableName === name) return true;
    if (this.searchQuery && name.toLowerCase().includes(this.searchQuery.toLowerCase())) return true;
    return false;
  }

  isTableDimmed(name: string): boolean {
    if (!this.selectedTableName) return false;
    if (this.selectedTableName === name) return false;

    // Check if this table has a relation with selected table
    const hasRelation = this.schema.relations.some(r =>
      (r.sourceTable.toLowerCase() === this.selectedTableName?.toLowerCase() && r.targetTable.toLowerCase() === name.toLowerCase()) ||
      (r.targetTable.toLowerCase() === this.selectedTableName?.toLowerCase() && r.sourceTable.toLowerCase() === name.toLowerCase())
    );
    return !hasRelation;
  }

  isColumnMatched(tableName: string, colName: string): boolean {
    if (!this.searchQuery.trim()) return false;
    return colName.toLowerCase().includes(this.searchQuery.toLowerCase());
  }

  getCardinalityBadgeClass(card: string): string {
    if (card === '1:1') {
      return this.isDark
        ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
        : 'bg-sky-50 text-sky-700 border border-sky-200';
    }
    if (card === '1:N') {
      return this.isDark
        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
        : 'bg-rose-50 text-rose-700 border border-rose-200';
    }
    return this.isDark
      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
      : 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  }

  getCardinalityTitle(card: string): string {
    if (card === '1:1') return 'Uno a Uno';
    if (card === '1:N') return 'Uno a Muchos';
    return 'Muchos a Muchos';
  }
}
