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
    <div class="space-y-6 tab-enter font-sans">

      <!-- ══════════════════════════════════════
           HEADER & EXECUTIVE CONTROLS
      ══════════════════════════════════════ -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5"
           [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <p class="text-xs font-headline font-semibold uppercase tracking-[0.25em]"
               [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Módulo Ejecutivo</p>
          </div>
          <h2 class="text-2xl sm:text-3xl font-headline font-bold tracking-tight mt-1"
              [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
            Control Financiero
          </h2>
        </div>

        <!-- Controls: Currency, Period & Actions -->
        <div class="flex flex-wrap items-center gap-3">
          <!-- Currency Toggle -->
          <div class="flex items-center rounded-full p-1 border"
               [ngClass]="isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-neutral-100/80 border-neutral-200'">
            <button (click)="currency = 'COP'"
                    class="px-4 py-1.5 rounded-full text-xs font-headline font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer"
                    [ngClass]="currency === 'COP' ? (isDark ? 'bg-white text-black shadow-sm' : 'bg-[#09090b] text-white shadow-sm') : 'opacity-50'">
              COP ($)
            </button>
            <button (click)="currency = 'USD'"
                    class="px-4 py-1.5 rounded-full text-xs font-headline font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer"
                    [ngClass]="currency === 'USD' ? (isDark ? 'bg-white text-black shadow-sm' : 'bg-[#09090b] text-white shadow-sm') : 'opacity-50'">
              USD ($)
            </button>
          </div>

          <!-- + Nueva Transacción Button -->
          <button (click)="openNewModal()"
                  class="px-5 py-2.5 rounded-full text-xs font-headline font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-2 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                  [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-[#09090b] text-white hover:bg-neutral-800'">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>+ Nueva Transacción</span>
          </button>

          <!-- Export Report Button -->
          <button (click)="exportReport()"
                  class="px-4 py-2 rounded-full text-xs font-headline font-semibold uppercase tracking-wider border transition-all duration-300 cursor-pointer flex items-center gap-2 hover:scale-[1.02]"
                  [ngClass]="isDark ? 'border-neutral-700 text-neutral-200 hover:bg-neutral-800' : 'border-neutral-200 text-neutral-800 bg-neutral-100 hover:bg-neutral-200'">
            <svg class="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span class="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </div>

      <!-- Feedback Toast Notification -->
      <div *ngIf="toastMessage" class="p-4 rounded-2xl border flex items-center justify-between shadow-lg transition-all"
           [ngClass]="toastType === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'">
        <div class="flex items-center gap-3">
          <span class="w-2 h-2 rounded-full" [ngClass]="toastType === 'error' ? 'bg-red-400' : 'bg-emerald-400'"></span>
          <span class="text-xs font-headline font-bold uppercase tracking-wider">{{ toastMessage }}</span>
        </div>
        <button (click)="toastMessage = ''" class="text-xs opacity-70 hover:opacity-100">✕</button>
      </div>

      <!-- ══════════════════════════════════════
           REAL DYNAMIC REVENUE KPI GRID
      ══════════════════════════════════════ -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

        <!-- 1. Total Ingresos Anuales (ARR) -->
        <div class="rounded-[24px] border p-6 space-y-3 relative overflow-hidden transition-all duration-300 group hover:border-neutral-500 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80'">
          <div class="flex items-center justify-between">
            <span class="text-xs font-headline font-semibold uppercase tracking-wider opacity-60">Ingresos Anuales (ARR)</span>
            <span class="text-[10px] font-headline font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 tracking-wider">
              Real Sincronizado
            </span>
          </div>
          <div class="space-y-1">
            <p class="text-xl sm:text-2xl font-headline font-bold tracking-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              {{ formatValue(summary.arr_total) }}
            </p>
            <p class="text-xs opacity-50 font-normal">Facturas pagadas + entradas directas</p>
          </div>
          <div class="pt-2">
            <svg class="w-full h-7 stroke-current text-emerald-500/40 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 100 25">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M0 20 Q 20 18, 40 12 T 80 5 T 100 2" />
            </svg>
          </div>
        </div>

        <!-- 2. Facturación Mensual (MRR) -->
        <div class="rounded-[24px] border p-6 space-y-3 relative overflow-hidden transition-all duration-300 group hover:border-neutral-500 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80'">
          <div class="flex items-center justify-between">
            <span class="text-xs font-headline font-semibold uppercase tracking-wider opacity-60">Promedio Mensual (MRR)</span>
            <span class="text-[10px] font-headline font-semibold px-2.5 py-0.5 rounded-full border border-blue-500/30 text-blue-400 bg-blue-500/10 tracking-wider">
              En Tiempo Real
            </span>
          </div>
          <div class="space-y-1">
            <p class="text-xl sm:text-2xl font-headline font-bold tracking-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              {{ formatValue(summary.mrr_promedio) }}
            </p>
            <p class="text-xs opacity-50 font-normal">Promedio de ingresos mensuales</p>
          </div>
          <div class="pt-2">
            <svg class="w-full h-7 stroke-current text-blue-400/40 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 100 25">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M0 22 L 20 18 L 40 14 L 60 8 L 80 5 L 100 2" />
            </svg>
          </div>
        </div>

        <!-- 3. Utilidad Neta & Margen -->
        <div class="rounded-[24px] border p-6 space-y-3 relative overflow-hidden transition-all duration-300 group hover:border-neutral-500 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80'">
          <div class="flex items-center justify-between">
            <span class="text-xs font-headline font-semibold uppercase tracking-wider opacity-60">Utilidad Neta</span>
            <span class="text-[10px] font-headline font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 tracking-wider">
              {{ summary.margen_neto_pct }}% Margen
            </span>
          </div>
          <div class="space-y-1">
            <p class="text-xl sm:text-2xl font-headline font-bold tracking-tight text-emerald-400">
              {{ formatValue(summary.utilidad_neta) }}
            </p>
            <p class="text-xs opacity-50 font-normal">Deducción de egresos acumulados</p>
          </div>
          <div class="pt-2">
            <div class="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
              <div class="bg-emerald-400 h-1.5 rounded-full transition-all duration-700" [style.width.%]="summary.margen_neto_pct || 0"></div>
            </div>
          </div>
        </div>

        <!-- 4. Egresos y Gastos -->
        <div class="rounded-[24px] border p-6 space-y-3 relative overflow-hidden transition-all duration-300 group hover:border-neutral-500 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80'">
          <div class="flex items-center justify-between">
            <span class="text-xs font-headline font-semibold uppercase tracking-wider opacity-60">Egresos Totales</span>
            <span class="text-[10px] font-headline font-semibold px-2.5 py-0.5 rounded-full border border-red-500/30 text-red-400 bg-red-500/10 tracking-wider">
              Gastos
            </span>
          </div>
          <div class="space-y-1">
            <p class="text-xl sm:text-2xl font-headline font-bold tracking-tight text-red-400">
              -{{ formatValue(summary.egresos_total) }}
            </p>
            <p class="text-xs opacity-50 font-normal">Licencias, hosting y operaciones</p>
          </div>
          <div class="pt-2 flex items-center justify-between text-xs font-medium opacity-70">
            <span>Clientes Activos: {{ summary.clientes_activos }}</span>
            <span>Facturas: {{ formatValue(summary.facturas_pagadas_total) }}</span>
          </div>
        </div>

      </div>

      <!-- ══════════════════════════════════════
           SECCIÓN DESPLEGABLE INLINE DE CREACIÓN / EDICIÓN DE TRANSACCIÓN
      ══════════════════════════════════════ -->
      <div *ngIf="showModal" class="rounded-2xl border p-5 sm:p-6 space-y-5 transition-all duration-300 animate-fadeIn"
           [ngClass]="isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900'">
        
        <!-- Header (Coincide con Nueva Cuenta de Cobro) -->
        <div class="flex items-center justify-between border-b pb-4" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
          <div class="flex items-center gap-2.5">
            <span class="w-2.5 h-2.5 rounded-full" [ngClass]="editingTx.type === 'INGRESO' ? 'bg-emerald-400' : 'bg-red-400'"></span>
            <h3 class="text-sm font-bold uppercase tracking-wide" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              {{ editingTx.id ? 'Editar Transacción #' + editingTx.id : 'Nueva Transacción' }}
            </h3>
          </div>
          <button (click)="showModal = false" class="p-1.5 rounded-xl border transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                  [ngClass]="isDark ? 'border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800' : 'border-neutral-200 text-neutral-500 hover:text-black hover:bg-neutral-100'">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Form Fields (Misma tipografía, bordes e inputs de Cuenta de Cobro) -->
        <div class="space-y-4 text-xs">
          
          <!-- Type Selector (Ingreso / Egreso) -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Tipo de Transacción *</label>
            <div class="grid grid-cols-2 gap-3">
              <button type="button" (click)="editingTx.type = 'INGRESO'"
                      class="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                      [ngClass]="editingTx.type === 'INGRESO' 
                        ? (isDark ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 font-extrabold' : 'bg-emerald-500 border-emerald-600 text-black font-extrabold') 
                        : (isDark ? 'border-neutral-700 bg-neutral-800/40 text-neutral-400 hover:text-white' : 'border-neutral-300 bg-white text-neutral-600 hover:text-black')">
                <span>Ingreso (+)</span>
              </button>
              <button type="button" (click)="editingTx.type = 'EGRESO'"
                      class="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                      [ngClass]="editingTx.type === 'EGRESO' 
                        ? (isDark ? 'bg-red-500/20 border-red-500/50 text-red-400 font-extrabold' : 'bg-red-500 border-red-600 text-white font-extrabold') 
                        : (isDark ? 'border-neutral-700 bg-neutral-800/40 text-neutral-400 hover:text-white' : 'border-neutral-300 bg-white text-neutral-600 hover:text-black')">
                <span>Egreso (-)</span>
              </button>
            </div>
          </div>

          <!-- Concept -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Concepto de la Transacción *</label>
            <input type="text" [(ngModel)]="editingTx.concept" [style.color-scheme]="isDark ? 'dark' : 'light'"
                   placeholder="Ej: Pago de Licencia Rotbot Enterprise, Mantenimiento Cloud, etc."
                   class="w-full px-3 py-2.5 rounded-xl text-sm border outline-none transition-colors font-semibold"
                   [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 focus:border-white focus:ring-1 focus:ring-white' : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black'">
          </div>

          <!-- Amount COP & Date -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Monto en COP ($) *</label>
              <input type="number" [(ngModel)]="editingTx.amount_cop" [style.color-scheme]="isDark ? 'dark' : 'light'" placeholder="Ej: 1500000"
                     class="w-full px-3 py-2.5 rounded-xl text-sm font-sans font-bold border outline-none transition-colors"
                     [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 focus:border-white focus:ring-1 focus:ring-white' : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black'">
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Fecha de Transacción *</label>
              <input type="date" [(ngModel)]="editingTx.transaction_date" [style.color-scheme]="isDark ? 'dark' : 'light'"
                     class="w-full px-3 py-2.5 rounded-xl text-sm border outline-none cursor-pointer transition-colors font-medium"
                     [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white focus:border-white focus:ring-1 focus:ring-white' : 'bg-white border-neutral-300 text-neutral-900 focus:border-black focus:ring-1 focus:ring-black'">
            </div>
          </div>

          <!-- Category & Client -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Categoría *</label>
              <select [(ngModel)]="editingTx.category" [style.color-scheme]="isDark ? 'dark' : 'light'"
                      class="w-full px-3 py-2.5 rounded-xl text-sm border outline-none cursor-pointer transition-colors font-medium"
                      [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white focus:border-white focus:ring-1 focus:ring-white' : 'bg-white border-neutral-300 text-neutral-900 focus:border-black focus:ring-1 focus:ring-black'">
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
              <label class="text-xs font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Cliente Asociado (Opcional)</label>
              <select [(ngModel)]="editingTx.client_id" [style.color-scheme]="isDark ? 'dark' : 'light'"
                      class="w-full px-3 py-2.5 rounded-xl text-sm border outline-none cursor-pointer transition-colors font-medium"
                      [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white focus:border-white focus:ring-1 focus:ring-white' : 'bg-white border-neutral-300 text-neutral-900 focus:border-black focus:ring-1 focus:ring-black'">
                <option [ngValue]="null">— Seleccionar cliente —</option>
                <option *ngFor="let c of clients" [value]="c.id">{{ c.name }}{{ c.company ? ' · ' + c.company : '' }}</option>
              </select>
            </div>
          </div>

          <!-- Payment Method & Notes -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Método de Pago</label>
              <select [(ngModel)]="editingTx.payment_method" [style.color-scheme]="isDark ? 'dark' : 'light'"
                      class="w-full px-3 py-2.5 rounded-xl text-sm border outline-none cursor-pointer transition-colors font-medium"
                      [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white focus:border-white focus:ring-1 focus:ring-white' : 'bg-white border-neutral-300 text-neutral-900 focus:border-black focus:ring-1 focus:ring-black'">
                <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                <option value="Efectivo / Caja">Efectivo / Caja</option>
                <option value="Crypto / USDT">Crypto / USDT</option>
              </select>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Notas Adicionales</label>
              <input type="text" [(ngModel)]="editingTx.notes" [style.color-scheme]="isDark ? 'dark' : 'light'" placeholder="Ej: Factura de referencia #1024"
                     class="w-full px-3 py-2.5 rounded-xl text-sm border outline-none transition-colors font-medium"
                     [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 focus:border-white focus:ring-1 focus:ring-white' : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black'">
            </div>
          </div>

        </div>

        <!-- Buttons (Coincide con el estilo de botones de Nueva Cuenta de Cobro) -->
        <div class="flex gap-3 justify-end pt-3 border-t" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
          <button (click)="showModal = false"
                  class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border cursor-pointer transition-colors"
                  [ngClass]="isDark ? 'border-neutral-700 text-neutral-400 hover:text-white' : 'border-neutral-300 text-neutral-500 hover:text-neutral-900'">
            Cancelar
          </button>
          <button (click)="saveTransaction()" [disabled]="isSaving"
                  class="px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer border transition-all shadow-lg disabled:opacity-40"
                  [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200 border-white shadow-white/10' : 'bg-black text-white hover:bg-neutral-800 border-black shadow-black/10'">
            {{ isSaving ? 'Guardando...' : (editingTx.id ? 'Guardar Cambios' : 'Registrar Transacción') }}
          </button>
        </div>

      </div>

      <!-- ══════════════════════════════════════
           BALANCED TRANSACTIONS LEDGER TABLE
      ══════════════════════════════════════ -->
      <div class="rounded-[28px] border p-5 sm:p-6 space-y-5 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
           [ngClass]="isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-white border-neutral-200'">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4"
             [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              <h3 class="text-base font-headline font-bold uppercase tracking-wider" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                Libro de Transacciones Reales
              </h3>
            </div>
            <p class="text-xs mt-0.5 opacity-60">Movimientos de ingresos y egresos registrados en base de datos</p>
          </div>

          <!-- Search & Filter Controls -->
          <div class="flex items-center gap-2">
            <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="loadTransactions()" placeholder="Buscar concepto o cliente..."
                   class="px-3.5 py-1.5 rounded-full text-xs border outline-none bg-transparent"
                   [ngClass]="isDark ? 'border-neutral-800 text-white placeholder-neutral-500' : 'border-neutral-200 text-neutral-900'">

            <select [(ngModel)]="typeFilter" (change)="loadTransactions()"
                    class="px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border outline-none cursor-pointer"
                    [ngClass]="isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-900'">
              <option value="">Todos los Tipos</option>
              <option value="INGRESO">Ingresos (+)</option>
              <option value="EGRESO">Egresos (-)</option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="py-12 text-center text-xs font-headline font-semibold uppercase tracking-widest opacity-60">
          Cargando datos financieros reales...
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && transactions.length === 0" class="py-12 text-center space-y-3">
          <p class="text-xs font-headline font-medium opacity-60">No se encontraron transacciones registradas.</p>
          <button (click)="openNewModal()" class="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-white text-black hover:bg-neutral-200 transition-all">
            + Crear Primera Transacción
          </button>
        </div>

        <!-- Table Container -->
        <div *ngIf="!isLoading && transactions.length > 0" class="overflow-x-auto">
          <table class="w-full text-left text-xs font-headline">
            <thead>
              <tr class="border-b uppercase tracking-wider text-[10px] font-bold opacity-60"
                  [ngClass]="isDark ? 'border-neutral-800 text-neutral-400' : 'border-neutral-200 text-neutral-500'">
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
              <tr *ngFor="let tx of paginatedTransactions" class="hover:bg-white/5 transition-colors">
                <!-- Fecha -->
                <td class="py-3.5 px-3 font-mono opacity-80 whitespace-nowrap">{{ tx.transaction_date }}</td>
                <!-- Tipo Badge -->
                <td class="py-3.5 px-3 whitespace-nowrap">
                  <span class="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border"
                        [ngClass]="tx.type === 'INGRESO' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'">
                    {{ tx.type }}
                  </span>
                </td>
                <!-- Concepto -->
                <td class="py-3.5 px-3 font-medium whitespace-nowrap" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                  {{ tx.concept }}
                </td>
                <!-- Categoría -->
                <td class="py-3.5 px-3 whitespace-nowrap">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider border"
                        [ngClass]="isDark ? 'bg-neutral-800/80 border-neutral-700 text-neutral-300' : 'bg-neutral-100 border-neutral-200 text-neutral-700'">
                    {{ tx.category }}
                  </span>
                </td>
                <!-- Cliente -->
                <td class="py-3.5 px-3 opacity-80 whitespace-nowrap">
                  {{ tx.client_name || 'General' }}
                </td>
                <!-- Monto -->
                <td class="py-3.5 px-3 text-right font-bold text-sm whitespace-nowrap"
                    [ngClass]="tx.type === 'INGRESO' ? 'text-emerald-400' : 'text-red-400'">
                  {{ tx.type === 'INGRESO' ? '+' : '-' }}{{ formatValue(tx.amount_cop) }}
                </td>
                <!-- Acciones -->
                <td class="py-3.5 px-3 text-center whitespace-nowrap flex items-center justify-center gap-2">
                  <button (click)="openEditModal(tx)" class="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer transition-colors" title="Editar">
                    ✎
                  </button>
                  <button (click)="deleteTransaction(tx)" class="p-1.5 rounded-full hover:bg-red-500/20 text-neutral-400 hover:text-red-400 cursor-pointer transition-colors" title="Eliminar">
                    ✕
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 📄 TABLE PAGINATION CONTROLS -->
        <div *ngIf="!isLoading && transactions.length > 0" 
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
                      [ngClass]="isDark ? 'border-neutral-700 text-white bg-neutral-950' : 'border-neutral-300 text-neutral-900 bg-white'">
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
                    [ngClass]="isDark ? 'border-neutral-800 hover:bg-neutral-800 text-neutral-300' : 'border-neutral-200 hover:bg-neutral-100 text-neutral-700'"
                    title="Primera página">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" /></svg>
            </button>

            <!-- Prev Page -->
            <button (click)="currentPage = currentPage - 1" [disabled]="currentPage === 1"
                    class="px-2.5 py-1 rounded-lg border text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                    [ngClass]="isDark ? 'border-neutral-800 hover:bg-neutral-800 text-neutral-300' : 'border-neutral-200 hover:bg-neutral-100 text-neutral-700'">
              <span>‹</span>
              <span class="hidden sm:inline">Ant</span>
            </button>

            <!-- Page Indicator -->
            <span class="px-3 py-1 text-xs font-mono font-bold rounded-lg border"
                  [ngClass]="isDark ? 'bg-neutral-950 border-neutral-700 text-white' : 'bg-neutral-100 border-neutral-300 text-neutral-900'">
              {{ currentPage }} / {{ totalPages }}
            </span>

            <!-- Next Page -->
            <button (click)="currentPage = currentPage + 1" [disabled]="currentPage >= totalPages"
                    class="px-2.5 py-1 rounded-lg border text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                    [ngClass]="isDark ? 'border-neutral-800 hover:bg-neutral-800 text-neutral-300' : 'border-neutral-200 hover:bg-neutral-100 text-neutral-700'">
              <span class="hidden sm:inline">Sig</span>
              <span>›</span>
            </button>

            <!-- Last Page -->
            <button (click)="currentPage = totalPages" [disabled]="currentPage >= totalPages"
                    class="p-1.5 rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    [ngClass]="isDark ? 'border-neutral-800 hover:bg-neutral-800 text-neutral-300' : 'border-neutral-200 hover:bg-neutral-100 text-neutral-700'"
                    title="Última página">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" /></svg>
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
export class DashFinancialControlComponent implements OnInit, OnDestroy {
  @Input() theme = 'light';
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
  pageSize = 5;

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

  get isDark() { return this.theme === 'dark'; }

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
