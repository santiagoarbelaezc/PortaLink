import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService, Client } from '../../../services/finance.service';
import { Subject, takeUntil } from 'rxjs';

export interface FinancialTransaction {
  id?: number | string;
  type: 'INGRESO' | 'EGRESO';
  concept: string;
  category: string;
  client_id?: number | null;
  client_name?: string;
  amount_cop: number;
  amount_usd?: number;
  currency?: string;
  transaction_date: string;
  status?: string;
  payment_method?: string;
  notes?: string;
}

export interface ControlSummary {
  arr_total: number;
  mrr_promedio: number;
  utilidad_neta: number;
  margen_neto_pct: number;
  egresos_total: number;
  facturas_pagadas_total: number;
  ingresos_manuales_total: number;
  clientes_activos: number;
}

@Component({
  selector: 'app-dash-financial-control',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <ng-container *ngIf="!isLoading; else skeleton">
      <div class="space-y-6 tab-enter font-sans">

        <!-- ══════════════════════════════════════
             HEADER & EXECUTIVE ACTION BAR
        ══════════════════════════════════════ -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4"
             [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <p class="text-xs font-headline font-semibold uppercase tracking-[0.25em]"
                 [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                Control Financiero & Analíticas
              </p>
            </div>
            <div class="flex items-center gap-3 mt-1">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                   [ngClass]="isDark ? 'bg-[#141419] text-white border border-neutral-800' : 'bg-neutral-100 text-neutral-900 border border-neutral-200'">
                <span class="material-symbols-rounded">monitoring</span>
              </div>
              <h2 class="text-2xl sm:text-3xl font-headline font-bold uppercase tracking-tight"
                  [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                Analíticas
              </h2>
            </div>
          </div>

          <!-- Controls: Currency & Actions -->
          <div class="flex flex-wrap items-center gap-2.5">
            <!-- Currency Switcher Segmented Control -->
            <div class="flex items-center gap-1 p-1 rounded-2xl border backdrop-blur-xl"
                 [ngClass]="isDark ? 'bg-[#141419] border-neutral-800' : 'bg-neutral-100 border-neutral-200'">
              <button type="button"
                      (click)="currency = 'COP'"
                      class="px-3.5 py-1.5 rounded-xl text-xs font-headline font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer border flex items-center gap-1.5"
                      [ngClass]="currency === 'COP'
                        ? (isDark ? 'shadow-md border-white' : 'shadow-md border-[#09090b]')
                        : (isDark ? 'border-transparent text-neutral-400 hover:text-white' : 'border-transparent text-neutral-600 hover:text-black')"
                      [style.background-color]="currency === 'COP' ? (isDark ? '#ffffff !important' : '#09090b !important') : 'transparent'"
                      [style.color]="currency === 'COP' ? (isDark ? '#09090b !important' : '#ffffff !important') : (isDark ? '#a1a1aa !important' : '#52525b !important')">
                <span *ngIf="currency === 'COP'" class="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                <span>COP ($)</span>
              </button>
              <button type="button"
                      (click)="currency = 'USD'"
                      class="px-3.5 py-1.5 rounded-xl text-xs font-headline font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer border flex items-center gap-1.5"
                      [ngClass]="currency === 'USD'
                        ? (isDark ? 'shadow-md border-white' : 'shadow-md border-[#09090b]')
                        : (isDark ? 'border-transparent text-neutral-400 hover:text-white' : 'border-transparent text-neutral-600 hover:text-black')"
                      [style.background-color]="currency === 'USD' ? (isDark ? '#ffffff !important' : '#09090b !important') : 'transparent'"
                      [style.color]="currency === 'USD' ? (isDark ? '#09090b !important' : '#ffffff !important') : (isDark ? '#a1a1aa !important' : '#52525b !important')">
                <span *ngIf="currency === 'USD'" class="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                <span>USD ($)</span>
              </button>
            </div>

            <!-- Export Report Button -->
            <button type="button"
                    (click)="exportReport()"
                    class="inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-headline font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer border active:scale-95"
                    [ngClass]="isDark ? 'border-neutral-800 bg-[#141419] text-neutral-300 hover:text-white hover:bg-neutral-800' : 'border-neutral-200 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-black'">
              <span class="material-symbols-rounded" style="font-size: 16px;">file_download</span>
              <span class="hidden sm:inline">Exportar</span>
            </button>

            <!-- + Nueva Transacción Button -->
            <button type="button"
                    (click)="openNewModal()"
                    class="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-headline font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md active:scale-95 border"
                    [ngClass]="isDark ? 'border-white hover:bg-neutral-200' : 'border-[#09090b] hover:bg-neutral-800'"
                    [style.background-color]="isDark ? '#ffffff !important' : '#09090b !important'"
                    [style.color]="isDark ? '#09090b !important' : '#ffffff !important'">
              <span class="material-symbols-rounded" style="font-size: 16px;" [style.color]="isDark ? '#09090b !important' : '#ffffff !important'">add</span>
              <span [style.color]="isDark ? '#09090b !important' : '#ffffff !important'">Nueva Transacción</span>
            </button>
          </div>
        </div>

        <!-- Feedback Toast Notification -->
        <div *ngIf="toastMessage" class="p-4 rounded-2xl border flex items-center justify-between shadow-lg transition-all animate-dropdown"
             [ngClass]="toastType === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'">
          <div class="flex items-center gap-3">
            <span class="w-2 h-2 rounded-full" [ngClass]="toastType === 'error' ? 'bg-red-400' : 'bg-emerald-400'"></span>
            <span class="text-xs font-headline font-bold uppercase tracking-wider">{{ toastMessage }}</span>
          </div>
          <button (click)="toastMessage = ''" class="text-xs opacity-70 hover:opacity-100 cursor-pointer">✕</button>
        </div>

        <!-- ══════════════════════════════════════
             4 KPI STAT CARDS (ULTRA-MINIMALIST SLATE & RED)
        ══════════════════════════════════════ -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-5">

          <!-- Stat 1: Ingresos Anuales (ARR) -->
          <div class="rounded-2xl border p-4 sm:p-5 transition-all duration-200 flex flex-col justify-between"
               [ngClass]="isDark ? 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700' : 'bg-white border-neutral-200/80 hover:border-neutral-300 shadow-[0_2px_12px_rgba(0,0,0,0.02)]'">
            <div class="flex items-center justify-between text-neutral-400 mb-2">
              <span class="text-[11px] font-headline font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Ingresos Anuales (ARR)</span>
              <span class="material-symbols-rounded text-neutral-400" style="font-size: 19px;">trending_up</span>
            </div>
            <div>
              <p class="text-xl sm:text-2xl md:text-3xl font-headline font-extrabold tracking-tight m-0"
                 [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                {{ formatValue(summary.arr_total) }}
              </p>
              <p class="text-xs text-neutral-500 m-0 mt-2 font-sans flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                <span class="text-neutral-400">Facturación & Entradas</span>
              </p>
            </div>
          </div>

          <!-- Stat 2: Promedio Mensual (MRR) -->
          <div class="rounded-2xl border p-4 sm:p-5 transition-all duration-200 flex flex-col justify-between"
               [ngClass]="isDark ? 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700' : 'bg-white border-neutral-200/80 hover:border-neutral-300 shadow-[0_2px_12px_rgba(0,0,0,0.02)]'">
            <div class="flex items-center justify-between text-neutral-400 mb-2">
              <span class="text-[11px] font-headline font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Promedio Mensual (MRR)</span>
              <span class="material-symbols-rounded text-neutral-400" style="font-size: 19px;">calendar_month</span>
            </div>
            <div>
              <p class="text-xl sm:text-2xl md:text-3xl font-headline font-extrabold tracking-tight m-0"
                 [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                {{ formatValue(summary.mrr_promedio) }}
              </p>
              <p class="text-xs text-neutral-500 m-0 mt-2 font-sans flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                <span class="text-neutral-400">Recurrencia proyectada</span>
              </p>
            </div>
          </div>

          <!-- Stat 3: Utilidad Neta (Net Profit) -->
          <div class="rounded-2xl border p-4 sm:p-5 transition-all duration-200 flex flex-col justify-between"
               [ngClass]="isDark ? 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700' : 'bg-white border-neutral-200/80 hover:border-neutral-300 shadow-[0_2px_12px_rgba(0,0,0,0.02)]'">
            <div class="flex items-center justify-between text-neutral-400 mb-2">
              <span class="text-[11px] font-headline font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Utilidad Neta</span>
              <span class="material-symbols-rounded text-neutral-400" style="font-size: 19px;">account_balance_wallet</span>
            </div>
            <div>
              <p class="text-xl sm:text-2xl md:text-3xl font-headline font-extrabold tracking-tight m-0"
                 [ngClass]="summary.utilidad_neta >= 0 ? (isDark ? 'text-white' : 'text-neutral-900') : 'text-rose-500'">
                {{ formatValue(summary.utilidad_neta) }}
              </p>
              <p class="text-xs text-neutral-500 m-0 mt-2 font-sans flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                <span class="text-neutral-400 font-semibold">{{ summary.margen_neto_pct }}% margen neto</span>
              </p>
            </div>
          </div>

          <!-- Stat 4: Egresos Totales -->
          <div class="rounded-2xl border p-4 sm:p-5 transition-all duration-200 flex flex-col justify-between"
               [ngClass]="isDark ? 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700' : 'bg-white border-neutral-200/80 hover:border-neutral-300 shadow-[0_2px_12px_rgba(0,0,0,0.02)]'">
            <div class="flex items-center justify-between text-neutral-400 mb-2">
              <span class="text-[11px] font-headline font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Egresos Totales</span>
              <span class="material-symbols-rounded text-neutral-400" style="font-size: 19px;">outbound</span>
            </div>
            <div>
              <p class="text-xl sm:text-2xl md:text-3xl font-headline font-extrabold tracking-tight m-0 text-rose-500 dark:text-rose-400">
                -{{ formatValue(summary.egresos_total) }}
              </p>
              <p class="text-xs text-neutral-500 m-0 mt-2 font-sans flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                <span class="text-neutral-400">{{ summary.clientes_activos }} clientes activos</span>
              </p>
            </div>
          </div>

        </div>

        <!-- ══════════════════════════════════════
             CHARTS & PERFORMANCE OVERVIEW
        ══════════════════════════════════════ -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4">

          <!-- Card 1: Eficiencia Operativa & Flujo de Caja (2 Cols) -->
          <div class="lg:col-span-2 rounded-[20px] xs:rounded-[24px] sm:rounded-[28px] border p-4 xs:p-5 sm:p-6 md:p-7 flex flex-col justify-between transition-all duration-300"
               [ngClass]="isDark ? 'bg-neutral-900/70 border-neutral-800 shadow-[0_10px_35px_rgba(0,0,0,0.4)]' : 'bg-white border-neutral-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.03)]'">
            
            <div class="space-y-4">
              <!-- Header -->
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  <h3 class="text-sm sm:text-base font-headline font-bold uppercase tracking-tight"
                      [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                    Eficiencia Operativa & Flujo Neto
                  </h3>
                </div>
                <span class="text-[10px] font-headline font-semibold px-2.5 py-0.5 rounded-full border tracking-wider"
                      [ngClass]="isDark ? 'border-neutral-700 bg-neutral-800 text-neutral-300' : 'border-neutral-200 bg-neutral-100 text-neutral-700'">
                  Balance Contable
                </span>
              </div>

              <!-- Flow Comparison Meter -->
              <div class="space-y-2 pt-1">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-headline font-semibold" [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">
                    Ingresos Totales ({{ inflowPercentage }}%)
                  </span>
                  <span class="font-headline font-semibold text-rose-400">
                    Egresos Operativos ({{ outflowPercentage }}%)
                  </span>
                </div>
                <div class="w-full h-3 rounded-full overflow-hidden flex p-0.5 border"
                     [ngClass]="isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-100 border-neutral-200'">
                  <div class="h-full rounded-l-full transition-all duration-700"
                       [style.width.%]="inflowPercentage"
                       [ngClass]="isDark ? 'bg-white' : 'bg-[#09090b]'"></div>
                  <div class="h-full rounded-r-full bg-rose-500 transition-all duration-700"
                       [style.width.%]="outflowPercentage"></div>
                </div>
              </div>

              <!-- 4 Breakdown Pills Matrix -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
                <div class="p-3 rounded-xl border flex flex-col justify-between"
                     [ngClass]="isDark ? 'bg-[#141419] border-neutral-800' : 'bg-neutral-50 border-neutral-200'">
                  <span class="text-[10px] font-headline font-bold uppercase tracking-wider text-neutral-400">Cuentas Cobradas</span>
                  <span class="text-xs sm:text-sm font-headline font-bold mt-1" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                    {{ formatValue(summary.facturas_pagadas_total) }}
                  </span>
                </div>

                <div class="p-3 rounded-xl border flex flex-col justify-between"
                     [ngClass]="isDark ? 'bg-[#141419] border-neutral-800' : 'bg-neutral-50 border-neutral-200'">
                  <span class="text-[10px] font-headline font-bold uppercase tracking-wider text-neutral-400">Ingresos Directos</span>
                  <span class="text-xs sm:text-sm font-headline font-bold mt-1" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                    {{ formatValue(summary.ingresos_manuales_total) }}
                  </span>
                </div>

                <div class="p-3 rounded-xl border flex flex-col justify-between"
                     [ngClass]="isDark ? 'bg-[#141419] border-neutral-800' : 'bg-neutral-50 border-neutral-200'">
                  <span class="text-[10px] font-headline font-bold uppercase tracking-wider text-neutral-400">Gastos & Egresos</span>
                  <span class="text-xs sm:text-sm font-headline font-bold mt-1 text-rose-400">
                    -{{ formatValue(summary.egresos_total) }}
                  </span>
                </div>

                <div class="p-3 rounded-xl border flex flex-col justify-between"
                     [ngClass]="isDark ? 'bg-[#141419] border-neutral-800' : 'bg-neutral-50 border-neutral-200'">
                  <span class="text-[10px] font-headline font-bold uppercase tracking-wider text-neutral-400">Margen EBITDA</span>
                  <span class="text-xs sm:text-sm font-headline font-bold mt-1" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                    {{ summary.margen_neto_pct }}%
                  </span>
                </div>
              </div>
            </div>

            <!-- Footer Status -->
            <div class="pt-4 border-t mt-4 flex items-center justify-between text-xs"
                 [ngClass]="isDark ? 'border-neutral-800 text-neutral-400' : 'border-neutral-200 text-neutral-500'">
              <span class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Flujo de caja positivo y solvente</span>
              </span>
              <span class="font-mono text-[11px] opacity-70">Período: 2026-YTD</span>
            </div>
          </div>

          <!-- Card 2: Desglose por Categoría (1 Col) -->
          <div class="rounded-[20px] xs:rounded-[24px] sm:rounded-[28px] border p-4 xs:p-5 sm:p-6 md:p-7 flex flex-col justify-between transition-all duration-300"
               [ngClass]="isDark ? 'bg-neutral-900/70 border-neutral-800 shadow-[0_10px_35px_rgba(0,0,0,0.4)]' : 'bg-white border-neutral-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.03)]'">
            
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-rounded text-neutral-400" style="font-size: 18px;">pie_chart</span>
                  <h3 class="text-sm sm:text-base font-headline font-bold uppercase tracking-tight"
                      [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                    Por Categoría
                  </h3>
                </div>
                <span class="text-[10px] font-headline font-bold uppercase opacity-60">Top Rubros</span>
              </div>

              <!-- List of Category Items -->
              <div class="space-y-3">
                <div *ngFor="let cat of categoryBreakdown" class="space-y-1.5">
                  <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center gap-1.5 truncate">
                      <span class="w-1.5 h-1.5 rounded-full shrink-0" [ngClass]="cat.type === 'INGRESO' ? 'bg-white' : 'bg-rose-500'"></span>
                      <span class="font-headline font-semibold truncate" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                        {{ cat.name }}
                      </span>
                    </div>
                    <span class="font-mono font-bold shrink-0 ml-2" [ngClass]="cat.type === 'INGRESO' ? (isDark ? 'text-neutral-300' : 'text-neutral-700') : 'text-rose-400'">
                      {{ formatValue(cat.total) }}
                    </span>
                  </div>
                  <div class="w-full h-1.5 rounded-full overflow-hidden" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'">
                    <div class="h-full rounded-full transition-all duration-500"
                         [style.width.%]="cat.percentage"
                         [ngClass]="cat.type === 'INGRESO' ? (isDark ? 'bg-white' : 'bg-[#09090b]') : 'bg-rose-500'"></div>
                  </div>
                </div>

                <div *ngIf="categoryBreakdown.length === 0" class="py-8 text-center text-xs opacity-50 font-headline">
                  Sin categorías registradas en el período.
                </div>
              </div>
            </div>

            <div class="pt-3 border-t text-[11px] opacity-60 text-center font-headline uppercase tracking-wider"
                 [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
              {{ transactions.length }} transacciones analizadas
            </div>
          </div>

        </div>

        <!-- ══════════════════════════════════════
             MODAL / FORM INLINE DE TRANSACCIÓN
        ══════════════════════════════════════ -->
        <div *ngIf="showModal" class="rounded-[20px] xs:rounded-[24px] sm:rounded-[28px] border p-5 sm:p-7 space-y-5 transition-all duration-300 animate-fadeIn shadow-2xl"
             [ngClass]="isDark ? 'bg-[#0c0c0e] border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'">
          
          <!-- Header -->
          <div class="flex items-center justify-between border-b pb-4" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
            <div class="flex items-center gap-2.5">
              <span class="w-2.5 h-2.5 rounded-full" [ngClass]="editingTx.type === 'INGRESO' ? 'bg-white' : 'bg-rose-500'"></span>
              <h3 class="text-sm sm:text-base font-headline font-bold uppercase tracking-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                {{ editingTx.id ? 'Editar Transacción #' + editingTx.id : 'Nueva Transacción Contable' }}
              </h3>
            </div>
            <button (click)="showModal = false" class="p-1.5 rounded-xl border transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                    [ngClass]="isDark ? 'border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800' : 'border-neutral-200 text-neutral-500 hover:text-black hover:bg-neutral-100'">
              <span class="material-symbols-rounded" style="font-size: 18px;">close</span>
            </button>
          </div>

          <!-- Form Fields -->
          <div class="space-y-4 text-xs">
            
            <!-- Type Selector (Ingreso / Egreso) -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-headline font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Tipo de Transacción *</label>
              <div class="grid grid-cols-2 gap-3">
                <button type="button" (click)="editingTx.type = 'INGRESO'"
                        class="px-4 py-2.5 rounded-xl text-xs font-headline font-bold uppercase tracking-wider border transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                        [ngClass]="editingTx.type === 'INGRESO' 
                          ? (isDark ? 'border-white shadow-md' : 'border-[#09090b] shadow-md') 
                          : (isDark ? 'border-neutral-800 bg-[#141419] text-neutral-400 hover:text-white' : 'border-neutral-300 bg-neutral-100 text-neutral-600 hover:text-black')"
                        [style.background-color]="editingTx.type === 'INGRESO' ? (isDark ? '#ffffff !important' : '#09090b !important') : ''"
                        [style.color]="editingTx.type === 'INGRESO' ? (isDark ? '#09090b !important' : '#ffffff !important') : ''">
                  <span *ngIf="editingTx.type === 'INGRESO'" class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <span [style.color]="editingTx.type === 'INGRESO' ? (isDark ? '#09090b !important' : '#ffffff !important') : ''">Ingreso (+)</span>
                </button>
                <button type="button" (click)="editingTx.type = 'EGRESO'"
                        class="px-4 py-2.5 rounded-xl text-xs font-headline font-bold uppercase tracking-wider border transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                        [ngClass]="editingTx.type === 'EGRESO' 
                          ? 'bg-rose-500 text-white border-rose-500 shadow-md font-bold' 
                          : (isDark ? 'border-neutral-800 bg-[#141419] text-neutral-400 hover:text-white' : 'border-neutral-300 bg-neutral-100 text-neutral-600 hover:text-black')">
                  <span *ngIf="editingTx.type === 'EGRESO'" class="w-1.5 h-1.5 rounded-full bg-white"></span>
                  <span>Egreso (-)</span>
                </button>
              </div>
            </div>

            <!-- Concept -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-headline font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Concepto de la Transacción *</label>
              <input type="text" [(ngModel)]="editingTx.concept" [style.color-scheme]="isDark ? 'dark' : 'light'"
                     placeholder="Ej: Pago de Licencia Rotbot Enterprise, Mantenimiento Cloud, etc."
                     class="w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition-colors font-semibold"
                     [ngClass]="isDark ? 'bg-[#141419] border-neutral-800 text-white placeholder-neutral-600 focus:border-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-black'">
            </div>

            <!-- Amount COP & Date -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-headline font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Monto en COP ($) *</label>
                <input type="number" [(ngModel)]="editingTx.amount_cop" [style.color-scheme]="isDark ? 'dark' : 'light'" placeholder="Ej: 1500000"
                       class="w-full px-3.5 py-2.5 rounded-xl text-xs font-sans font-bold border outline-none transition-colors"
                       [ngClass]="isDark ? 'bg-[#141419] border-neutral-800 text-white placeholder-neutral-600 focus:border-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-black'">
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-headline font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Fecha de Transacción *</label>
                <input type="date" [(ngModel)]="editingTx.transaction_date" [style.color-scheme]="isDark ? 'dark' : 'light'"
                       class="w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none cursor-pointer transition-colors font-medium"
                       [ngClass]="isDark ? 'bg-[#141419] border-neutral-800 text-white focus:border-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-black'">
              </div>
            </div>

            <!-- Category & Client -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-headline font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Categoría *</label>
                <select [(ngModel)]="editingTx.category" [style.color-scheme]="isDark ? 'dark' : 'light'"
                        class="w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none cursor-pointer transition-colors font-medium"
                        [ngClass]="isDark ? 'bg-[#141419] border-neutral-800 text-white focus:border-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-black'">
                  <option value="Enterprise IA">Enterprise IA</option>
                  <option value="Desarrollo Web">Desarrollo Web</option>
                  <option value="Retainer SaaS">Retainer SaaS</option>
                  <option value="Consultoría">Consultoría</option>
                  <option value="Infraestructura">Infraestructura & Cloud</option>
                  <option value="Licencias">Licencias & Herramientas</option>
                  <option value="Gastos Operativos">Gastos Operativos</option>
                </select>
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-headline font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Cliente Asociado (Opcional)</label>
                <select [(ngModel)]="editingTx.client_id" [style.color-scheme]="isDark ? 'dark' : 'light'"
                        class="w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none cursor-pointer transition-colors font-medium"
                        [ngClass]="isDark ? 'bg-[#141419] border-neutral-800 text-white focus:border-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-black'">
                  <option [ngValue]="null">— Seleccionar cliente —</option>
                  <option *ngFor="let c of clients" [value]="c.id">{{ c.name }}{{ c.company ? ' · ' + c.company : '' }}</option>
                </select>
              </div>
            </div>

            <!-- Payment Method & Notes -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-headline font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Método de Pago</label>
                <select [(ngModel)]="editingTx.payment_method" [style.color-scheme]="isDark ? 'dark' : 'light'"
                        class="w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none cursor-pointer transition-colors font-medium"
                        [ngClass]="isDark ? 'bg-[#141419] border-neutral-800 text-white focus:border-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-black'">
                  <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                  <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                  <option value="Efectivo / Caja">Efectivo / Caja</option>
                  <option value="Crypto / USDT">Crypto / USDT</option>
                </select>
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-headline font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Notas Adicionales</label>
                <input type="text" [(ngModel)]="editingTx.notes" [style.color-scheme]="isDark ? 'dark' : 'light'" placeholder="Ej: Factura de referencia #1024"
                       class="w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition-colors font-medium"
                       [ngClass]="isDark ? 'bg-[#141419] border-neutral-800 text-white placeholder-neutral-600 focus:border-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-black'">
              </div>
            </div>

          </div>

          <!-- Buttons -->
          <div class="flex gap-3 justify-end pt-3 border-t" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
            <button type="button"
                    (click)="showModal = false"
                    class="px-4 py-2.5 rounded-xl text-xs font-headline font-bold uppercase tracking-wider border cursor-pointer transition-colors"
                    [ngClass]="isDark ? 'border-neutral-800 bg-[#141419] text-neutral-400 hover:text-white' : 'border-neutral-300 text-neutral-600 hover:text-black'">
              Cancelar
            </button>
            <button type="button"
                    (click)="saveTransaction()" [disabled]="isSaving"
                    class="px-6 py-2.5 rounded-xl text-xs font-headline font-bold uppercase tracking-wider cursor-pointer shadow-md transition-all active:scale-95 disabled:opacity-40 border"
                    [ngClass]="isDark ? 'border-white hover:bg-neutral-200' : 'border-[#09090b] hover:bg-neutral-800'"
                    [style.background-color]="isDark ? '#ffffff !important' : '#09090b !important'"
                    [style.color]="isDark ? '#09090b !important' : '#ffffff !important'">
              <span [style.color]="isDark ? '#09090b !important' : '#ffffff !important'">{{ isSaving ? 'Guardando...' : (editingTx.id ? 'Guardar Cambios' : 'Registrar Transacción') }}</span>
            </button>
          </div>

        </div>

        <!-- ══════════════════════════════════════
             TRANSACTIONS LEDGER TABLE (DISEÑO ELEVADO)
        ══════════════════════════════════════ -->
        <div class="rounded-[20px] xs:rounded-[24px] sm:rounded-[28px] border p-4 xs:p-5 sm:p-6 md:p-7 space-y-5 transition-all duration-300"
             [ngClass]="isDark ? 'bg-neutral-900/70 border-neutral-800 shadow-[0_10px_35px_rgba(0,0,0,0.4)]' : 'bg-white border-neutral-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.03)]'">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4"
               [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <h3 class="text-sm sm:text-base font-headline font-bold uppercase tracking-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                  Libro de Movimientos & Transacciones
                </h3>
              </div>
              <p class="text-xs mt-0.5 opacity-60">Historial de ingresos y deducciones registrados en el sistema</p>
            </div>

            <!-- Search & Filter Controls -->
            <div class="flex items-center gap-2 flex-wrap">
              <div class="relative">
                <span class="material-symbols-rounded absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" style="font-size: 16px;">search</span>
                <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="loadTransactions()" placeholder="Buscar concepto o cliente..."
                       class="pl-8 pr-3 py-2 rounded-xl text-xs border outline-none transition-colors"
                       [ngClass]="isDark ? 'bg-[#141419] border-neutral-800 text-white placeholder-neutral-600 focus:border-white' : 'bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-black'">
              </div>

              <select [(ngModel)]="typeFilter" (change)="loadTransactions()"
                      class="px-3.5 py-2 rounded-xl text-xs font-headline font-bold uppercase tracking-wider border outline-none cursor-pointer transition-colors"
                      [ngClass]="isDark ? 'bg-[#141419] border-neutral-800 text-white focus:border-white' : 'bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-black'">
                <option value="">Todos los Tipos</option>
                <option value="INGRESO">Ingresos (+)</option>
                <option value="EGRESO">Egresos (-)</option>
              </select>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="transactions.length === 0" class="py-12 text-center space-y-3">
            <span class="material-symbols-rounded text-neutral-500" style="font-size: 36px;">account_balance</span>
            <p class="text-xs font-headline font-medium opacity-60">No se encontraron transacciones registradas.</p>
            <button (click)="openNewModal()"
                    class="px-5 py-2 rounded-xl text-xs font-headline font-bold uppercase tracking-wider cursor-pointer border shadow-sm transition-all active:scale-95"
                    [ngClass]="isDark ? 'border-white hover:bg-neutral-200' : 'border-[#09090b] hover:bg-neutral-800'"
                    [style.background-color]="isDark ? '#ffffff !important' : '#09090b !important'"
                    [style.color]="isDark ? '#09090b !important' : '#ffffff !important'">
              <span [style.color]="isDark ? '#09090b !important' : '#ffffff !important'">+ Registrar Primera Transacción</span>
            </button>
          </div>

          <!-- Table Container -->
          <div *ngIf="transactions.length > 0" class="overflow-x-auto rounded-xl border" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
            <table class="w-full text-left border-collapse text-xs font-headline">
              <thead>
                <tr class="border-b uppercase tracking-wider text-[10px] font-bold opacity-60"
                    [ngClass]="isDark ? 'border-neutral-800 bg-[#141419] text-neutral-400' : 'border-neutral-200 bg-neutral-50 text-neutral-500'">
                  <th class="py-3 px-3">Fecha</th>
                  <th class="py-3 px-3">Tipo</th>
                  <th class="py-3 px-3">Concepto</th>
                  <th class="py-3 px-3">Categoría</th>
                  <th class="py-3 px-3">Cliente</th>
                  <th class="py-3 px-3 text-right">Monto</th>
                  <th class="py-3 px-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y" [ngClass]="isDark ? 'divide-neutral-800/60' : 'divide-neutral-100'">
                <tr *ngFor="let tx of paginatedTransactions"
                    class="transition-colors group"
                    [ngClass]="isDark ? 'hover:bg-neutral-800/40' : 'hover:bg-neutral-50'">
                  <!-- Fecha -->
                  <td class="py-3.5 px-3 font-mono opacity-80 whitespace-nowrap">{{ tx.transaction_date }}</td>
                  <!-- Tipo Badge -->
                  <td class="py-3.5 px-3 whitespace-nowrap">
                    <span class="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border"
                          [ngClass]="tx.type === 'INGRESO'
                            ? (isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700')
                            : (isDark ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-700')">
                      {{ tx.type }}
                    </span>
                  </td>
                  <!-- Concepto -->
                  <td class="py-3.5 px-3 font-semibold whitespace-nowrap" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                    {{ tx.concept }}
                  </td>
                  <!-- Categoría -->
                  <td class="py-3.5 px-3 whitespace-nowrap">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border"
                          [ngClass]="isDark ? 'bg-[#141419] border-neutral-800 text-neutral-300' : 'bg-neutral-100 border-neutral-200 text-neutral-700'">
                      {{ tx.category }}
                    </span>
                  </td>
                  <!-- Cliente -->
                  <td class="py-3.5 px-3 whitespace-nowrap">
                    <div class="flex items-center gap-1.5">
                      <span class="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                      <span class="opacity-90 font-medium">{{ tx.client_name || 'General' }}</span>
                    </div>
                  </td>
                  <!-- Monto -->
                  <td class="py-3.5 px-3 text-right font-bold text-sm whitespace-nowrap"
                      [ngClass]="tx.type === 'INGRESO' ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-rose-400' : 'text-rose-600')">
                    {{ tx.type === 'INGRESO' ? '+' : '-' }}{{ formatValue(tx.amount_cop) }}
                  </td>
                  <!-- Acciones -->
                  <td class="py-3.5 px-3 text-center whitespace-nowrap">
                    <div class="flex items-center justify-center gap-1.5">
                      <button (click)="openEditModal(tx)"
                              class="p-1.5 rounded-lg border transition-colors cursor-pointer"
                              [ngClass]="isDark ? 'border-neutral-800 bg-[#141419] text-neutral-400 hover:text-white hover:bg-neutral-800' : 'border-neutral-200 bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200'"
                              title="Editar">
                        <span class="material-symbols-rounded" style="font-size: 15px;">edit</span>
                      </button>
                      <button (click)="deleteTransaction(tx)"
                              class="p-1.5 rounded-lg border transition-colors cursor-pointer"
                              [ngClass]="isDark ? 'border-neutral-800 bg-[#141419] text-neutral-400 hover:text-rose-400 hover:border-rose-500/40' : 'border-neutral-200 bg-neutral-100 text-neutral-600 hover:text-rose-600 hover:border-rose-300'"
                              title="Eliminar">
                        <span class="material-symbols-rounded" style="font-size: 15px;">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- TABLE PAGINATION CONTROLS -->
          <div *ngIf="transactions.length > 0" 
               class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t"
               [ngClass]="isDark ? 'border-neutral-800 text-neutral-400' : 'border-neutral-200 text-neutral-600'">
            
            <div class="flex items-center gap-3 text-xs">
              <span>
                Mostrando <span class="font-bold font-sans" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ (currentPage - 1) * pageSize + 1 }}</span> - 
                <span class="font-bold font-sans" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ getMin(currentPage * pageSize, transactions.length) }}</span> de 
                <span class="font-bold font-sans" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ transactions.length }}</span>
              </span>

              <div class="flex items-center gap-1.5 ml-2">
                <span class="text-[11px] opacity-70">Por pág:</span>
                <select [(ngModel)]="pageSize" (change)="currentPage = 1"
                        class="px-2 py-1 rounded-lg text-xs font-semibold border outline-none cursor-pointer"
                        [ngClass]="isDark ? 'border-neutral-800 text-white bg-[#141419]' : 'border-neutral-300 text-neutral-900 bg-white'">
                  <option [value]="5">5</option>
                  <option [value]="10">10</option>
                  <option [value]="25">25</option>
                  <option [value]="50">50</option>
                </select>
              </div>
            </div>

            <div class="flex items-center gap-1.5 self-end sm:self-auto">
              <!-- First Page -->
              <button (click)="currentPage = 1" [disabled]="currentPage === 1"
                      class="p-1.5 rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      [ngClass]="isDark ? 'border-neutral-800 bg-[#141419] hover:bg-neutral-800 text-neutral-300' : 'border-neutral-200 hover:bg-neutral-100 text-neutral-700'"
                      title="Primera página">
                <span class="material-symbols-rounded" style="font-size: 15px;">first_page</span>
              </button>

              <!-- Prev Page -->
              <button (click)="currentPage = currentPage - 1" [disabled]="currentPage === 1"
                      class="px-2.5 py-1 rounded-lg border text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                      [ngClass]="isDark ? 'border-neutral-800 bg-[#141419] hover:bg-neutral-800 text-neutral-300' : 'border-neutral-200 hover:bg-neutral-100 text-neutral-700'">
                <span class="material-symbols-rounded" style="font-size: 14px;">chevron_left</span>
                <span class="hidden sm:inline">Ant</span>
              </button>

              <!-- Page Indicator -->
              <span class="px-3 py-1 text-xs font-mono font-bold rounded-lg border"
                    [ngClass]="isDark ? 'bg-[#141419] border-neutral-800 text-white' : 'bg-neutral-100 border-neutral-300 text-neutral-900'">
                {{ currentPage }} / {{ totalPages }}
              </span>

              <!-- Next Page -->
              <button (click)="currentPage = currentPage + 1" [disabled]="currentPage >= totalPages"
                      class="px-2.5 py-1 rounded-lg border text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                      [ngClass]="isDark ? 'border-neutral-800 bg-[#141419] hover:bg-neutral-800 text-neutral-300' : 'border-neutral-200 hover:bg-neutral-100 text-neutral-700'">
                <span class="hidden sm:inline">Sig</span>
                <span class="material-symbols-rounded" style="font-size: 14px;">chevron_right</span>
              </button>

              <!-- Last Page -->
              <button (click)="currentPage = totalPages" [disabled]="currentPage >= totalPages"
                      class="p-1.5 rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      [ngClass]="isDark ? 'border-neutral-800 bg-[#141419] hover:bg-neutral-800 text-neutral-300' : 'border-neutral-200 hover:bg-neutral-100 text-neutral-700'"
                      title="Última página">
                <span class="material-symbols-rounded" style="font-size: 15px;">last_page</span>
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
            <div class="h-3 w-32 rounded-full" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
            <div class="h-7 w-52 rounded-xl" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
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
              <div class="h-6 sm:h-7 w-24 rounded-lg" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
              <div class="h-2.5 w-20 rounded-full" [ngClass]="isDark ? 'bg-neutral-800/60' : 'bg-neutral-200/60'"></div>
            </div>
          </div>
        </div>

        <!-- Charts Skeleton -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4">
          <div class="lg:col-span-2 rounded-[20px] xs:rounded-[24px] sm:rounded-[28px] border p-6 min-h-[220px]"
               [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800/80' : 'bg-white border-neutral-200/80'">
            <div class="space-y-4">
              <div class="h-4 w-44 rounded-lg" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
              <div class="h-3 w-full rounded-full" [ngClass]="isDark ? 'bg-neutral-800/60' : 'bg-neutral-200/60'"></div>
              <div class="grid grid-cols-4 gap-2 pt-2">
                <div *ngFor="let _ of [1,2,3,4]" class="h-12 rounded-xl" [ngClass]="isDark ? 'bg-neutral-800/40' : 'bg-neutral-100'"></div>
              </div>
            </div>
          </div>

          <div class="rounded-[20px] xs:rounded-[24px] sm:rounded-[28px] border p-6 min-h-[220px]"
               [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800/80' : 'bg-white border-neutral-200/80'">
            <div class="space-y-4">
              <div class="h-4 w-32 rounded-lg" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
              <div *ngFor="let _ of [1,2,3]" class="space-y-1.5">
                <div class="h-3 w-28 rounded-full" [ngClass]="isDark ? 'bg-neutral-800/60' : 'bg-neutral-200/60'"></div>
                <div class="h-1.5 w-full rounded-full" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'"></div>
              </div>
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
  `]
})
export class DashFinancialControlComponent implements OnInit, OnDestroy {
  @Input() theme = 'dark';
  private financeService = inject(FinanceService);
  private destroy$ = new Subject<void>();

  currency: 'COP' | 'USD' = 'COP';
  period = '2026-YTD';
  isLoading = true;
  isSaving = false;
  showModal = false;
  searchTerm = '';
  typeFilter = '';

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  // Pagination
  currentPage = 1;
  pageSize = 10;

  get totalPages(): number {
    return Math.ceil(this.transactions.length / this.pageSize) || 1;
  }

  get paginatedTransactions(): FinancialTransaction[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.transactions.slice(start, start + this.pageSize);
  }

  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  summary: ControlSummary = {
    arr_total: 0,
    mrr_promedio: 0,
    utilidad_neta: 0,
    margen_neto_pct: 0,
    egresos_total: 0,
    facturas_pagadas_total: 0,
    ingresos_manuales_total: 0,
    clientes_activos: 0
  };

  transactions: FinancialTransaction[] = [];
  clients: Client[] = [];

  editingTx: FinancialTransaction = {
    type: 'INGRESO',
    concept: '',
    category: 'Enterprise IA',
    client_id: null,
    amount_cop: 0,
    transaction_date: new Date().toISOString().substring(0, 10),
    payment_method: 'Transferencia Bancaria'
  };

  get isDark(): boolean {
    return this.theme === 'dark';
  }

  get inflowPercentage(): number {
    const totalIn = (this.summary.facturas_pagadas_total || 0) + (this.summary.ingresos_manuales_total || 0);
    const totalOut = this.summary.egresos_total || 0;
    const grand = totalIn + totalOut;
    if (grand === 0) return 100;
    return Math.round((totalIn / grand) * 100);
  }

  get outflowPercentage(): number {
    return Math.max(0, 100 - this.inflowPercentage);
  }

  get categoryBreakdown(): { name: string; count: number; total: number; percentage: number; type: 'INGRESO' | 'EGRESO' }[] {
    if (!this.transactions || this.transactions.length === 0) return [];
    const map = new Map<string, { total: number; count: number; type: 'INGRESO' | 'EGRESO' }>();
    let grandTotal = 0;
    for (const tx of this.transactions) {
      const cat = tx.category || 'General';
      const current = map.get(cat) || { total: 0, count: 0, type: tx.type };
      current.total += Number(tx.amount_cop) || 0;
      current.count += 1;
      map.set(cat, current);
      grandTotal += Number(tx.amount_cop) || 0;
    }
    return Array.from(map.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      total: data.total,
      percentage: grandTotal > 0 ? Math.min(100, Math.round((data.total / grandTotal) * 100)) : 0,
      type: data.type
    })).sort((a, b) => b.total - a.total).slice(0, 5);
  }

  ngOnInit() {
    this.loadControlData();
    this.loadClients();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadControlData() {
    this.isLoading = true;
    this.financeService.getControlSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res && res.ok && res.summary) {
            this.summary = res.summary;
          }
          this.loadTransactions();
        },
        error: () => {
          this.loadTransactions();
        }
      });
  }

  loadTransactions() {
    this.financeService.getTransactions(this.searchTerm, this.typeFilter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res && res.ok && Array.isArray(res.transactions)) {
            this.transactions = res.transactions;
            if (this.currentPage > this.totalPages) {
              this.currentPage = 1;
            }
          } else {
            this.transactions = [];
            this.currentPage = 1;
          }
          this.isLoading = false;
        },
        error: () => {
          this.transactions = [];
          this.currentPage = 1;
          this.isLoading = false;
        }
      });
  }

  loadClients() {
    this.financeService.getClients()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res && res.ok && res.clients) {
            this.clients = res.clients;
          }
        },
        error: () => {}
      });
  }

  openNewModal() {
    this.editingTx = {
      type: 'INGRESO',
      concept: '',
      category: 'Enterprise IA',
      client_id: null,
      amount_cop: 0,
      transaction_date: new Date().toISOString().substring(0, 10),
      payment_method: 'Transferencia Bancaria'
    };
    this.showModal = true;
  }

  openEditModal(tx: FinancialTransaction) {
    this.editingTx = { ...tx };
    this.showModal = true;
  }

  saveTransaction() {
    if (!this.editingTx.concept || !this.editingTx.concept.trim()) {
      this.showToast('El concepto es obligatorio', 'error');
      return;
    }
    if (!this.editingTx.amount_cop || Number(this.editingTx.amount_cop) <= 0) {
      this.showToast('El monto en COP debe ser mayor a cero', 'error');
      return;
    }

    this.isSaving = true;
    this.financeService.saveTransaction(this.editingTx)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.isSaving = false;
          if (res && res.ok) {
            this.showToast(res.message || 'Transacción guardada exitosamente', 'success');
            this.showModal = false;
            this.loadControlData();
          } else {
            this.showToast(res?.message || 'Error al guardar la transacción', 'error');
          }
        },
        error: (err) => {
          this.isSaving = false;
          const msg = err?.error?.message || 'Error de conexión al guardar transacción';
            this.showToast(msg, 'error');
        }
      });
  }

  deleteTransaction(tx: FinancialTransaction) {
    if (!tx.id) return;
    if (!confirm(`¿Eliminar la transacción "${tx.concept}"?`)) return;

    this.financeService.deleteTransaction(tx.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res && res.ok) {
            this.showToast('Transacción eliminada exitosamente', 'success');
            this.loadControlData();
          } else {
            this.showToast(res?.message || 'Error al eliminar', 'error');
          }
        },
        error: () => {
          this.showToast('Error de conexión al eliminar', 'error');
        }
      });
  }

  formatValue(copValue: any): string {
    const val = Number(copValue) || 0;
    if (this.currency === 'USD') {
      const usdValue = val / 4000;
      return '$' + Math.round(usdValue).toLocaleString('en-US') + ' USD';
    }
    return '$ ' + Math.round(val).toLocaleString('es-CO') + ' COP';
  }

  showToast(msg: string, type: 'success' | 'error') {
    this.toastMessage = msg;
    this.toastType = type;
    setTimeout(() => {
      this.toastMessage = '';
    }, 4000);
  }

  exportReport() {
    alert(`Exportando Informe Ejecutivo de Control Financiero (${this.period} - ${this.currency})...`);
  }
}
