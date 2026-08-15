import { Component, Input, OnInit, OnChanges, SimpleChanges, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FinanceService, Client, Service, Invoice, InvoiceItem } from '../../../services/finance.service';
import { PdfReportService } from '../../../services/pdf-report.service';
import { firstValueFrom } from 'rxjs';

type SubTab = 'resumen' | 'clientes' | 'servicios' | 'facturas' | 'legal';

@Component({
  selector: 'app-dash-finances',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5 tab-enter">

      <!-- Header -->
      <div class="flex items-start justify-between border-b pb-4"
           [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
        <div>
          <p class="text-xs font-headline font-semibold uppercase tracking-[0.25em]"
             [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Gestión Financiera</p>
          <h2 class="text-3xl sm:text-4xl font-headline font-bold uppercase tracking-tight mt-0.5"
              [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Finanzas</h2>
        </div>
        <button *ngIf="subTab === 'facturas'" (click)="openNewInvoice()"
                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-headline font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-[#09090b] text-white hover:bg-neutral-800'">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Nueva Cuenta de Cobro
        </button>
        <button *ngIf="subTab === 'clientes'" (click)="openNewClient()"
                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-headline font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-[#09090b] text-white hover:bg-neutral-800'">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo Cliente
        </button>
        <button *ngIf="subTab === 'servicios'" (click)="openNewService()"
                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-headline font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-[#09090b] text-white hover:bg-neutral-800'">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo Servicio
        </button>
      </div>

      <!-- Sub-tabs -->
      <div class="flex gap-1.5 rounded-full p-1.5 border"
           [ngClass]="isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-neutral-100/80 border-neutral-200/80'">
        <button *ngFor="let t of subTabs" (click)="subTab = t.id"
                class="flex-1 py-2 text-xs font-headline font-semibold uppercase tracking-wider rounded-full transition-all duration-300 cursor-pointer shadow-xs"
                [ngClass]="subTab === t.id
                  ? (isDark ? 'bg-white text-black' : 'bg-[#09090b] text-white')
                  : (isDark ? 'text-neutral-400 hover:text-white hover:bg-white/10' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60')">
          {{ t.label }}
        </button>
      </div>

      <!-- ══════════════════ RESUMEN (Stock Market Theme) ══════════════════ -->
      <ng-container *ngIf="subTab === 'resumen'">
        
        <!-- KPI Header & Quick Filters -->
        <div class="flex justify-between items-end mt-4 mb-2">
           <h3 class="text-xs font-bold uppercase tracking-widest flex items-center gap-2" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">
             <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
             Indicadores
           </h3>
           <div class="flex gap-1 p-1 rounded-lg border" [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-100 border-neutral-200'">
             <button (click)="setKpiPeriod('all')" class="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded transition-colors cursor-pointer" [ngClass]="kpiPeriod === 'all' ? (isDark ? 'bg-white text-black' : 'bg-neutral-900 text-white') : (isDark ? 'text-neutral-500 hover:text-white' : 'text-neutral-500 hover:text-neutral-900')">Todo</button>
             <button (click)="setKpiPeriod('this_month')" class="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded transition-colors cursor-pointer" [ngClass]="kpiPeriod === 'this_month' ? (isDark ? 'bg-white text-black' : 'bg-neutral-900 text-white') : (isDark ? 'text-neutral-500 hover:text-white' : 'text-neutral-500 hover:text-neutral-900')">Este Mes</button>
             <button (click)="setKpiPeriod('last_month')" class="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded transition-colors cursor-pointer" [ngClass]="kpiPeriod === 'last_month' ? (isDark ? 'bg-white text-black' : 'bg-neutral-900 text-white') : (isDark ? 'text-neutral-500 hover:text-white' : 'text-neutral-500 hover:text-neutral-900')">Mes Ant.</button>
           </div>
        </div>

        <!-- Comprehensive Filters -->
        <div class="rounded-2xl border p-4 mb-4 flex flex-wrap gap-4 items-end"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
           <div class="flex flex-col gap-1.5 flex-grow min-w-[200px]">
             <label class="text-[10px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Buscar Empresa o Cliente</label>
             <input type="text" [(ngModel)]="invFilterCompany" (ngModelChange)="buildKpis()" placeholder="Ej: TechCorp"
                    class="w-full px-3 py-2 rounded-xl text-sm border outline-none bg-transparent"
                    [ngClass]="isDark ? 'border-neutral-700 text-white placeholder-neutral-600 focus:border-neutral-500' : 'border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-neutral-500'">
           </div>
           <div class="flex flex-col gap-1.5 w-28">
             <label class="text-[10px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Precio Min</label>
             <input type="number" [(ngModel)]="invFilterMinPrice" (ngModelChange)="buildKpis()" placeholder="0"
                    class="w-full px-3 py-2 rounded-xl text-sm border outline-none bg-transparent"
                    [ngClass]="isDark ? 'border-neutral-700 text-white placeholder-neutral-600 focus:border-neutral-500' : 'border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-neutral-500'">
           </div>
           <div class="flex flex-col gap-1.5 w-28">
             <label class="text-[10px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Precio Max</label>
             <input type="number" [(ngModel)]="invFilterMaxPrice" (ngModelChange)="buildKpis()" placeholder="Múltiplo"
                    class="w-full px-3 py-2 rounded-xl text-sm border outline-none bg-transparent"
                    [ngClass]="isDark ? 'border-neutral-700 text-white placeholder-neutral-600 focus:border-neutral-500' : 'border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-neutral-500'">
           </div>
           <div class="flex flex-col gap-1.5 w-32">
             <label class="text-[10px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Desde (Fecha)</label>
             <input type="date" [(ngModel)]="invFilterStartDate" (ngModelChange)="buildKpis()"
                    class="w-full px-3 py-2 rounded-xl text-sm border outline-none bg-transparent cursor-pointer"
                    [ngClass]="isDark ? 'border-neutral-700 text-white focus:border-neutral-500' : 'border-neutral-300 text-neutral-900 focus:border-neutral-500'">
           </div>
           <div class="flex flex-col gap-1.5 w-32">
             <label class="text-[10px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Hasta (Fecha)</label>
             <input type="date" [(ngModel)]="invFilterEndDate" (ngModelChange)="buildKpis()"
                    class="w-full px-3 py-2 rounded-xl text-sm border outline-none bg-transparent cursor-pointer"
                    [ngClass]="isDark ? 'border-neutral-700 text-white focus:border-neutral-500' : 'border-neutral-300 text-neutral-900 focus:border-neutral-500'">
           </div>
           <div class="flex-shrink-0">
             <button (click)="kpiPeriod='all'; invFilterCompany=''; invFilterMinPrice=null; invFilterMaxPrice=null; invFilterStartDate=''; invFilterEndDate=''; buildKpis()"
                     class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-colors cursor-pointer"
                     [ngClass]="isDark ? 'border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-800' : 'border-neutral-300 text-neutral-500 hover:text-black hover:bg-neutral-100'">
               Limpiar
             </button>
           </div>
        </div>

        <!-- KPI cards (Trading panel style) -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div *ngFor="let kpi of kpis" class="relative rounded-xl border p-5 overflow-hidden group transition-all duration-300 hover:border-neutral-600"
               [ngClass]="isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200'">
            <p class="text-xs font-medium uppercase tracking-wider mb-2 opacity-60"
               [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">{{ kpi.label }}</p>
            <p class="text-xl lg:text-2xl font-bold leading-tight" [ngClass]="kpi.color || (isDark ? 'text-white' : 'text-neutral-900')">{{ kpi.value }}</p>
          </div>
        </div>

        <!-- ══════════════════════════════════════
             MONOCHROMATIC ELEGANT CHARTS SECTION
        ══════════════════════════════════════ -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">

          <!-- Chart 1: Histórico de Facturación & Cobros (2 Cols) -->
          <div class="lg:col-span-2 rounded-2xl border p-6 space-y-6 flex flex-col justify-between transition-all duration-300 hover:border-neutral-600"
               [ngClass]="isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200'">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 class="text-base font-semibold tracking-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                  Histórico de Cobros & Facturación
                </h3>
                <p class="text-xs mt-0.5 opacity-60">Tendencia mensual de recaudos y flujo financiero en COP</p>
              </div>
              <div class="flex items-center gap-4 text-xs font-normal opacity-80">
                <span class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-full bg-white"></span>
                  <span>Facturado</span>
                </span>
                <span class="flex items-center gap-1.5 opacity-50">
                  <span class="w-2.5 h-2.5 rounded-full border border-dashed border-neutral-400"></span>
                  <span>Proyección</span>
                </span>
              </div>
            </div>

            <!-- SVG Monochromatic Bar & Wave Graph -->
            <div class="relative h-56 w-full flex items-end justify-between gap-2 pt-8 pb-2 px-2 border-b"
                 [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
              <div class="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                <div class="border-b border-white w-full"></div>
                <div class="border-b border-white w-full"></div>
                <div class="border-b border-white w-full"></div>
                <div class="border-b border-white w-full"></div>
              </div>

              <!-- Real Monthly Income Bars -->
              <div *ngFor="let m of monthlyIncome; let last = last" class="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative z-10">
                <div class="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity px-2.5 py-1 rounded absolute -top-8 shadow-md whitespace-nowrap z-20 pointer-events-none"
                     [ngClass]="isDark ? 'bg-white text-black' : 'bg-neutral-900 text-white'">
                  {{ formatCOP(m.amount) }}{{ last && m.amount > 0 ? ' 🔥' : '' }}
                </div>
                <div class="w-full max-w-[34px] rounded-t-xl transition-all duration-300 shadow-sm"
                     [ngStyle]="{'height': (m.height || 6) + '%'}"
                     [ngClass]="last ? (isDark ? 'bg-white text-black shadow-white/20' : 'bg-neutral-900 text-white') : (isDark ? 'bg-neutral-700/60 group-hover:bg-neutral-400' : 'bg-neutral-300 group-hover:bg-neutral-500')"></div>
                <span class="text-xs font-semibold" [ngClass]="last ? (isDark ? 'text-emerald-400 font-bold' : 'text-neutral-900 font-bold') : 'opacity-60'">{{ m.month }}</span>
              </div>

              <div *ngIf="monthlyIncome.length === 0" class="absolute inset-0 flex items-center justify-center text-xs opacity-50">
                Sin movimientos registrados aún.
              </div>
            </div>

            <div class="flex items-center justify-between text-xs pt-1 opacity-80">
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-3l3 3 3-3"/>
                </svg>
                <span>Tasa de Recaudo Efectivo: <strong class="font-semibold">{{ keyMetrics.collectionRate || 0 }}%</strong></span>
              </span>
              <span class="font-mono text-[11px] opacity-60">Auditoría en vivo</span>
            </div>
          </div>

          <!-- Chart 2: Estado de Cuentas por Cobrar (1 Col Real Dynamic) -->
          <div class="rounded-2xl border p-6 space-y-6 flex flex-col justify-between transition-all duration-300 hover:border-neutral-600"
               [ngClass]="isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200'">
            <div>
              <h3 class="text-base font-semibold tracking-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                Estado de Cuentas
              </h3>
              <p class="text-xs mt-0.5 opacity-60">Estado actual del Ledger de Cobros</p>
            </div>

            <!-- Monochromatic Donut Simulation -->
            <div class="flex items-center justify-center py-2 relative">
              <div class="w-32 h-32 rounded-full border-8 border-neutral-700 border-t-white flex items-center justify-center relative shadow-inner">
                <div class="text-center">
                  <span class="text-xl font-bold" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ paidPercentage }}%</span>
                  <p class="text-[9px] uppercase tracking-wider opacity-50 font-normal">Cobrado</p>
                </div>
              </div>
            </div>

            <div class="space-y-2.5 text-xs">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-white"></span>
                  <span class="font-medium">Pagadas</span>
                </div>
                <span class="font-semibold">{{ paidPercentage }}%</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-neutral-300"></span>
                  <span class="font-medium">Enviadas / Pendientes</span>
                </div>
                <span class="font-semibold">{{ pendingPercentage }}%</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-neutral-600"></span>
                  <span class="font-medium">Vencidas</span>
                </div>
                <span class="font-semibold">{{ overduePercentage }}%</span>
              </div>
            </div>
          </div>

        </div>

        <!-- Recent invoices (Ledger style) -->
        <div class="rounded-[28px] border overflow-hidden mt-6 shadow-xs transition-all"
             [ngClass]="isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-white border-neutral-200'">
          <div class="px-6 py-4 border-b flex items-center justify-between transition-colors"
               [ngClass]="isDark ? 'bg-black/60 border-neutral-800' : 'bg-neutral-50/80 border-neutral-200'">
            <h3 class="text-xs font-black uppercase tracking-widest flex items-center gap-2"
                [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Últimos Movimientos
            </h3>
            <button (click)="subTab = 'facturas'" class="text-[10px] font-extrabold uppercase tracking-widest cursor-pointer border px-3.5 py-1.5 rounded-xl transition-all shadow-2xs flex items-center gap-1"
                    [ngClass]="isDark ? 'border-neutral-700 bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800' : 'border-neutral-300 bg-white text-neutral-700 hover:text-black hover:bg-neutral-100'">
              <span>Ver Ledger</span>
              <span>→</span>
            </button>
          </div>

          <div class="divide-y" [ngClass]="isDark ? 'divide-neutral-800/60' : 'divide-neutral-100'">
            <ng-container *ngFor="let inv of recentInvoices">
              <div (click)="toggleInvoice(inv.id)" class="grid grid-cols-12 px-6 py-3.5 items-center group cursor-pointer transition-colors"
                   [ngClass]="isDark ? 'hover:bg-neutral-800/30' : 'hover:bg-neutral-50'">
                <div class="col-span-3 flex items-center gap-2">
                  <span class="text-xs font-semibold font-sans" [ngClass]="isDark ? 'text-neutral-400 group-hover:text-white' : 'text-neutral-500 group-hover:text-black'">#{{ inv.invoice_number || inv.id }}</span>
                </div>
                <div class="col-span-3">
                  <p class="text-xs font-bold truncate" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ inv.clientName || 'Cliente' }}</p>
                  <p class="text-[11px] truncate opacity-60">{{ inv.clientCompany || 'Independiente' }}</p>
                </div>
                <div class="col-span-3 text-right">
                  <span class="text-sm font-bold font-sans block" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ formatCOP(inv.total || inv.total_amount || 0) }}</span>
                </div>
                <div class="col-span-3 flex justify-end items-center gap-2">
                  <span class="text-[10px] font-bold uppercase px-3 py-1 rounded-full border transition-all" 
                        [ngClass]="getStatusClass(inv.status)">
                    {{ inv.status === 'Parcial' || inv.status === 'PARCIAL' ? 'Abonada (' + getInvoicePaidPct(inv) + '%)' : inv.status }}
                  </span>
                  <svg class="w-4 h-4 ml-1 transition-transform duration-200" [ngClass]="expandedInvoiceId === inv.id ? 'rotate-180 text-white' : (isDark ? 'text-neutral-500 group-hover:text-white' : 'text-neutral-400 group-hover:text-black')" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
                </div>
              </div>
              
              <!-- Expanded Detail Drawer -->
              <div *ngIf="expandedInvoiceId === inv.id" class="px-6 py-4 border-t-0 border-b transition-colors"
                   [ngClass]="isDark ? 'bg-black/40 border-neutral-800' : 'bg-neutral-50/70 border-neutral-200'">
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div class="space-y-1 p-3.5 rounded-2xl border transition-colors"
                         [ngClass]="isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-neutral-200'">
                      <p class="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Datos del Cliente</p>
                      <p class="text-sm font-extrabold" [ngClass]="isDark ? 'text-white' : 'text-black'">{{ getClient(inv.clientId)?.name || inv.clientName || 'Cliente' }}</p>
                      <p class="text-xs opacity-60">{{ getClient(inv.clientId)?.company || inv.clientCompany || 'Independiente' }}</p>
                      <div class="flex items-center gap-3 text-xs opacity-70 pt-1">
                        <span *ngIf="getClient(inv.clientId)?.email">{{ getClient(inv.clientId)?.email }}</span>
                        <span *ngIf="getClient(inv.clientId)?.phone"> • {{ getClient(inv.clientId)?.phone }}</span>
                      </div>
                    </div>

                    <div class="flex flex-wrap md:justify-end items-center gap-3">
                      <div *ngIf="inv.status === 'Pagada' || inv.status === 'PAGADA'" class="text-right mr-2">
                        <p class="text-[10px] font-black uppercase tracking-widest text-emerald-400">Recaudado el {{ inv.paidAt || 'hoy' }}</p>
                        <p *ngIf="inv.paymentMethod" class="text-xs opacity-60">{{ inv.paymentMethod }} <span *ngIf="inv.paymentNotes">({{ inv.paymentNotes }})</span></p>
                      </div>

                      <button (click)="downloadInvoicePdf(inv); $event.stopPropagation()" [disabled]="pdfLoading" class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
                              [ngClass]="isDark ? 'border-neutral-700 bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 disabled:opacity-50' : 'border-neutral-300 bg-white text-neutral-700 hover:text-black hover:bg-neutral-100 disabled:opacity-50'">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                        </svg>
                        <span>{{ pdfLoading ? 'Generando...' : 'Descargar Cuenta de Cobro' }}</span>
                      </button>
                    </div>
                 </div>
              </div>
            </ng-container>
            <div *ngIf="recentInvoices.length === 0" class="px-6 py-8 text-center text-xs opacity-50">
              No hay movimientos registrados.
            </div>
          </div>
        </div>
      </ng-container>

      <!-- ══════════════════ CLIENTES ══════════════════ -->
      <ng-container *ngIf="subTab === 'clientes'">
        <!-- Form modal -->
        <div *ngIf="showClientForm" class="rounded-2xl border p-6 space-y-4"
             [ngClass]="isDark ? 'bg-neutral-900 border-neutral-700' : 'bg-neutral-50 border-neutral-300'">
          <h3 class="text-sm font-bold uppercase tracking-wide"
              [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
            {{ editingClient?.id ? 'Editar Cliente' : 'Nuevo Cliente' }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div *ngFor="let f of clientFields" class="flex flex-col gap-1.5">
              <label class="text-xs font-bold uppercase tracking-widest"
                     [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">{{ f.label }}<span *ngIf="f.required" class="text-red-500 ml-0.5">*</span></label>
              <input [type]="f.type" [(ngModel)]="$any(editingClient)![f.key]" [style.color-scheme]="isDark ? 'dark' : 'light'" [placeholder]="f.placeholder"
                     class="w-full px-3 py-2.5 rounded-xl text-sm border outline-none transition-all duration-200 focus:ring-2"
                     [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-600 focus:border-neutral-500 focus:ring-neutral-700' : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:ring-neutral-200'">
            </div>
            <div class="md:col-span-2 flex flex-col gap-1.5">
              <label class="text-xs font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Notas</label>
              <textarea [(ngModel)]="editingClient!.notes" rows="2" [style.color-scheme]="isDark ? 'dark' : 'light'" placeholder="Observaciones del cliente..."
                        class="w-full px-3 py-2.5 rounded-xl text-sm border outline-none transition-all duration-200 resize-none"
                        [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-600' : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400'"></textarea>
            </div>
          </div>
          <div class="flex gap-3 justify-end">
            <button (click)="showClientForm = false" class="px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest border cursor-pointer"
                    [ngClass]="isDark ? 'border-neutral-700 text-neutral-400 hover:text-white' : 'border-neutral-300 text-neutral-500 hover:text-neutral-900'">Cancelar</button>
            <button (click)="saveClient()" class="px-5 py-2 rounded-xl text-sm font-bold uppercase tracking-widest cursor-pointer"
                    [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-900 text-white hover:bg-neutral-700'">Guardar</button>
          </div>
        </div>

        <!-- Client Filters -->
        <div *ngIf="!showClientForm" class="rounded-2xl border p-4 mb-4 flex flex-wrap gap-4 items-end"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
           <div class="flex flex-col gap-1.5 flex-grow min-w-[200px]">
             <label class="text-[10px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Buscar Cliente (Nombre, Empresa, Email)</label>
             <div class="relative">
               <input type="text" [(ngModel)]="clientFilterText" placeholder="Buscar..."
                      class="w-full pl-10 pr-3 py-2.5 rounded-xl text-sm border outline-none bg-transparent"
                      [ngClass]="isDark ? 'border-neutral-700 text-white placeholder-neutral-600 focus:border-neutral-500' : 'border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-neutral-500'">
               <svg class="w-4 h-4 absolute left-3.5 top-3" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
             </div>
           </div>
           <div class="flex-shrink-0">
             <button (click)="clientFilterText=''"
                     class="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border transition-colors cursor-pointer"
                     [ngClass]="isDark ? 'border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-800' : 'border-neutral-300 text-neutral-500 hover:text-black hover:bg-neutral-100'">
               Limpiar
             </button>
           </div>
        </div>

        <!-- Client table -->
        <div class="rounded-2xl border overflow-hidden"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <div class="grid grid-cols-12 px-5 py-3 text-[10px] font-bold uppercase tracking-widest border-b"
               [ngClass]="isDark ? 'border-neutral-800 text-neutral-500' : 'border-neutral-200 text-neutral-400'">
            <span class="col-span-3">Nombre</span>
            <span class="col-span-3">Empresa</span>
            <span class="col-span-3">Email / Tel</span>
            <span class="col-span-2 text-center">Facturas</span>
            <span class="col-span-1"></span>
          </div>
          <div class="divide-y" [ngClass]="isDark ? 'divide-neutral-800' : 'divide-neutral-100'">
            <div *ngFor="let c of displayedClients" class="grid grid-cols-12 px-5 py-4 items-center"
                 [ngClass]="isDark ? 'hover:bg-neutral-800/30' : 'hover:bg-neutral-50'">
              <div class="col-span-3">
                <p class="text-sm font-bold" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ c.name }}</p>
                <p class="text-xs" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Desde {{ c.createdAt | date:'MMM yyyy' }}</p>
              </div>
              <div class="col-span-3">
                <p class="text-sm" [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">{{ c.company || '—' }}</p>
              </div>
              <div class="col-span-3">
                <p class="text-xs" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-600'">{{ c.email }}</p>
                <p class="text-xs" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">{{ c.phone }}</p>
              </div>
              <div class="col-span-2 text-center">
                <span class="text-sm font-bold px-2 py-0.5 rounded-full"
                      [ngClass]="isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-700'">
                  {{ getClientInvoiceCount(c.id) }}
                </span>
              </div>
              <div class="col-span-1 flex justify-end gap-1">
                <button (click)="editClient(c)" title="Editar" class="p-1.5 rounded-lg cursor-pointer transition-colors"
                        [ngClass]="isDark ? 'text-neutral-500 hover:text-white hover:bg-neutral-800' : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100'">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </button>
                <button (click)="deleteClient(c.id!)" title="Eliminar" class="p-1.5 rounded-lg cursor-pointer transition-colors"
                        [ngClass]="isDark ? 'text-neutral-500 hover:text-red-400 hover:bg-red-900/20' : 'text-neutral-400 hover:text-red-600 hover:bg-red-50'">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>
            <div *ngIf="displayedClients.length === 0" class="px-5 py-10 text-center text-sm"
                 [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'">
              No se encontraron clientes.
            </div>
          </div>
        </div>
      </ng-container>

      <!-- ══════════════════ SERVICIOS ══════════════════ -->
      <ng-container *ngIf="subTab === 'servicios'">
        
        <!-- Header Controls Bar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[24px] border"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <div>
            <h3 class="text-base font-headline font-bold uppercase tracking-wider" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              Catálogo de Servicios
            </h3>
            <p class="text-xs font-sans font-normal opacity-60">Gestión de tarifas y paquetes de soluciones</p>
          </div>

          <div class="flex items-center gap-3">
            <button (click)="openNewService()"
                    class="px-4 py-2.5 rounded-full text-xs font-headline font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer border shadow-xs flex items-center gap-2"
                    [ngClass]="isDark ? 'bg-white text-black border-white hover:bg-neutral-200' : 'bg-black text-white border-black hover:bg-neutral-800'">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
              <span>Nuevo Servicio</span>
            </button>
          </div>
        </div>

        <!-- Form modal / drawer -->
        <div *ngIf="showServiceForm" class="rounded-[28px] border p-6 space-y-4 shadow-xl transition-all"
             [ngClass]="isDark ? 'bg-neutral-900 border-neutral-700' : 'bg-neutral-50 border-neutral-300'">
          <div class="flex items-center justify-between border-b pb-3" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
            <h3 class="text-sm font-headline font-bold uppercase tracking-wider" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              {{ editingService?.id ? 'Editar Servicio' : 'Crear Nuevo Servicio' }}
            </h3>
            <button (click)="showServiceForm = false" class="p-1 rounded-lg opacity-60 hover:opacity-100"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5 md:col-span-2">
              <label class="text-[10px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Nombre del Servicio *</label>
              <input type="text" [(ngModel)]="editingService!.name" [style.color-scheme]="isDark ? 'dark' : 'light'" placeholder="Ej: Desarrollo de Plataforma Web Enterprise"
                     class="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-colors" [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 focus:border-white' : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-black'">
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Categoría</label>
              <select [(ngModel)]="editingService!.category" [style.color-scheme]="isDark ? 'dark' : 'light'"
                      class="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none cursor-pointer transition-colors font-medium"
                      [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white focus:border-white' : 'bg-white border-neutral-300 text-neutral-900 focus:border-black'">
                <option value="desarrollo">Desarrollo Software</option>
                <option value="diseño">Diseño UI/UX</option>
                <option value="marketing">Marketing & Growth</option>
                <option value="consultoria">Consultoría Estratégica</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Precio Unitario (COP) *</label>
              <input type="number" [(ngModel)]="editingService!.unitPrice" [style.color-scheme]="isDark ? 'dark' : 'light'" placeholder="0"
                     class="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-colors font-mono font-bold" [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 focus:border-white' : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-black'">
              
              <!-- Indicador Dinámico de Precio COP -->
              <div class="mt-1.5 p-3 rounded-xl border flex items-center justify-between transition-all duration-300 shadow-xs"
                   [ngClass]="isDark ? 'bg-neutral-950/90 border-neutral-800' : 'bg-neutral-50 border-neutral-200'">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span class="text-[10px] font-extrabold uppercase tracking-widest opacity-60">Precio servicio</span>
                </div>
                <span class="text-base sm:text-lg font-black font-mono tracking-tight"
                      [ngClass]="isDark ? 'text-emerald-400' : 'text-emerald-600'">
                  {{ formatCOPDisplay(editingService!.unitPrice) }}
                </span>
              </div>
            </div>
            <div class="flex flex-col gap-1.5 md:col-span-2">
              <label class="text-[10px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Descripción Corta</label>
              <textarea [(ngModel)]="editingService!.description" rows="2" [style.color-scheme]="isDark ? 'dark' : 'light'" placeholder="Alcance, entregables y detalles del servicio..."
                        class="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none resize-none transition-colors"
                        [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 focus:border-white' : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-black'"></textarea>
            </div>
          </div>

          <div class="flex gap-3 justify-end pt-2">
            <button (click)="showServiceForm = false" class="px-4 py-2 rounded-xl text-xs font-headline font-bold uppercase tracking-wider border cursor-pointer"
                    [ngClass]="isDark ? 'border-neutral-700 text-neutral-400 hover:text-white' : 'border-neutral-300 text-neutral-600 hover:text-neutral-900'">Cancelar</button>
            <button (click)="saveService()" class="px-5 py-2 rounded-xl text-xs font-headline font-bold uppercase tracking-wider cursor-pointer"
                    [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-900 text-white hover:bg-neutral-700'">Guardar Servicio</button>
          </div>
        </div>

        <!-- Category Filter Pills -->
        <div class="flex gap-2 flex-wrap items-center">
          <button *ngFor="let cat of serviceCategories" (click)="filterCategory = cat.id"
                  class="px-4 py-1.5 rounded-full text-xs font-headline font-semibold uppercase tracking-wider transition-all cursor-pointer border shadow-xs"
                  [ngClass]="filterCategory === cat.id
                    ? (isDark ? 'bg-white text-black border-white' : 'bg-[#09090b] text-white border-[#09090b]')
                    : (isDark ? 'border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white' : 'border-neutral-200 text-neutral-600 bg-neutral-50 hover:bg-neutral-100')">
            {{ cat.label }}
          </button>
        </div>

        <!-- Services Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div *ngFor="let s of filteredServices" class="rounded-[28px] border p-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
               [ngClass]="isDark ? 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700' : 'bg-white border-neutral-200/80 hover:border-neutral-300'">
            
            <div>
              <div class="flex items-start justify-between gap-3 mb-4">
                <div class="flex items-center gap-3">
                  <!-- Category Icon -->
                  <div class="w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0"
                       [ngClass]="isDark ? 'bg-neutral-950 text-white border-neutral-800' : 'bg-neutral-100 text-black border-neutral-200'">
                    
                    <!-- Code for desarrollo -->
                    <svg *ngIf="s.category === 'desarrollo'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"/></svg>
                    <!-- Palette for diseño -->
                    <svg *ngIf="s.category === 'diseño'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072"/></svg>
                    <!-- Megaphone for marketing -->
                    <svg *ngIf="s.category === 'marketing'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H5.25A2.25 2.25 0 013 13.5v-3c0-1.242 1.008-2.25 2.25-2.25h3c.704 0 1.402-.03 2.09-.09l.481-.042A3.748 3.748 0 0113.8 6.16l2.368-1.579A1.125 1.125 0 0118 5.517v12.966a1.125 1.125 0 01-1.832.864l-2.368-1.579a3.748 3.748 0 01-2.979-1.948l-.481-.042z"/></svg>
                    <!-- Briefcase for consultoria -->
                    <svg *ngIf="s.category === 'consultoria'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                    <!-- Cube for otros -->
                    <svg *ngIf="s.category !== 'desarrollo' && s.category !== 'diseño' && s.category !== 'marketing' && s.category !== 'consultoria'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"/></svg>
                  </div>
                  <div>
                    <span class="text-[9px] font-headline font-bold uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full border mb-1 inline-block"
                          [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-300' : 'bg-neutral-100 border-neutral-200 text-neutral-700'">
                      {{ s.category }}
                    </span>
                    <h4 class="text-base font-headline font-bold leading-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                      {{ s.name }}
                    </h4>
                  </div>
                </div>

                <div class="flex items-center gap-1 shrink-0">
                  <button (click)="editService(s)" class="p-2 rounded-xl cursor-pointer transition-colors" [ngClass]="isDark ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-neutral-500 hover:text-black hover:bg-neutral-100'" title="Editar Servicio">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button (click)="deleteService(s.id!)" class="p-2 rounded-xl cursor-pointer transition-colors" [ngClass]="isDark ? 'text-neutral-400 hover:text-red-400 hover:bg-red-900/20' : 'text-neutral-500 hover:text-red-600 hover:bg-red-50'" title="Eliminar Servicio">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </div>

              <p *ngIf="s.description" class="text-xs font-sans font-normal leading-relaxed mb-4 opacity-80" [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-600'">
                {{ s.description }}
              </p>
            </div>

            <div class="pt-4 border-t flex items-center justify-between mt-auto"
                 [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-100'">
              <span class="text-[10px] font-headline font-bold uppercase tracking-widest opacity-60">Tarifa Base</span>
              <span class="text-lg font-headline font-bold" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                {{ formatCOP(s.unitPrice || 0) }}
              </span>
            </div>

          </div>
        </div>

        <div *ngIf="filteredServices.length === 0" class="p-12 text-center text-xs opacity-50 rounded-[28px] border" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
          No se encontraron servicios registrados en esta categoría.
        </div>

      </ng-container>

      <!-- ══════════════════ FACTURAS ══════════════════ -->
      <ng-container *ngIf="subTab === 'facturas'">

        <!-- New / Edit Invoice Form -->
        <div *ngIf="showInvoiceForm && editingInvoice" class="rounded-2xl border p-6 space-y-5"
             [ngClass]="isDark ? 'bg-neutral-900 border-neutral-700' : 'bg-neutral-50 border-neutral-300'">
          <h3 class="text-sm font-bold uppercase tracking-wide" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
            {{ editingInvoice.id ? 'Editar Cuenta #' + editingInvoice.id : 'Nueva Cuenta de Cobro' }}
          </h3>

          <!-- Client + title + dates -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5 md:col-span-2">
              <label class="text-xs font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Nombre / Etiqueta de la Cuenta de Cobro</label>
              <input type="text" [(ngModel)]="editingInvoice.title" [style.color-scheme]="isDark ? 'dark' : 'light'"
                     placeholder="Ej: Desarrollo de Plataforma Web Enterprise, Mantenimiento Mensual, etc."
                     class="w-full px-3 py-2.5 rounded-xl text-sm border outline-none transition-colors font-semibold"
                     [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 focus:border-white focus:ring-1 focus:ring-white' : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black'">
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Cliente *</label>
              <select [(ngModel)]="selectedClientId" (change)="onClientSelect()" [style.color-scheme]="isDark ? 'dark' : 'light'" class="w-full px-3 py-2.5 rounded-xl text-sm border outline-none cursor-pointer transition-colors"
                      [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white focus:border-white focus:ring-1 focus:ring-white' : 'bg-white border-neutral-300 text-neutral-900 focus:border-black focus:ring-1 focus:ring-black'">
                <option value="">— Seleccionar cliente —</option>
                <option *ngFor="let c of clients" [value]="c.id">{{ c.name }}{{ c.company ? ' · ' + c.company : '' }}</option>
              </select>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Fecha de emisión</label>
              <input type="date" [(ngModel)]="editingInvoice.issuedAt" [style.color-scheme]="isDark ? 'dark' : 'light'" class="w-full px-3 py-2.5 rounded-xl text-sm border outline-none cursor-pointer transition-colors"
                     [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white focus:border-white focus:ring-1 focus:ring-white' : 'bg-white border-neutral-300 text-neutral-900 focus:border-black focus:ring-1 focus:ring-black'">
            </div>
            <div class="flex flex-col gap-1.5 md:col-span-2">
              <label class="text-xs font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Fecha de vencimiento</label>
              <input type="date" [(ngModel)]="editingInvoice.dueAt" [style.color-scheme]="isDark ? 'dark' : 'light'" class="w-full px-3 py-2.5 rounded-xl text-sm border outline-none cursor-pointer transition-colors"
                     [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white focus:border-white focus:ring-1 focus:ring-white' : 'bg-white border-neutral-300 text-neutral-900 focus:border-black focus:ring-1 focus:ring-black'">
            </div>
          </div>

          <!-- Add services -->
          <div>
            <label class="text-xs font-bold uppercase tracking-widest block mb-2" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Agregar Servicios</label>
            <div class="flex gap-2">
              <select [(ngModel)]="serviceToAdd" [style.color-scheme]="isDark ? 'dark' : 'light'" class="flex-grow px-3 py-2.5 rounded-xl text-sm border outline-none cursor-pointer transition-colors"
                      [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white focus:border-white focus:ring-1 focus:ring-white' : 'bg-white border-neutral-300 text-neutral-900 focus:border-black focus:ring-1 focus:ring-black'">
                <option value="">— Seleccionar servicio del catálogo —</option>
                <option *ngFor="let s of allServices" [value]="s.id">{{ s.name }} ({{ formatCOP(s.unitPrice || 0) }})</option>
              </select>
              <button (click)="addServiceToInvoice()" class="px-4 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest cursor-pointer shrink-0 transition-colors"
                      [ngClass]="isDark ? 'bg-neutral-700 text-white hover:bg-neutral-600' : 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300'">
                + Agregar
              </button>
            </div>
          </div>

          <!-- Invoice items table -->
          <div *ngIf="editingInvoice.items?.length" class="rounded-xl border overflow-hidden"
               [ngClass]="isDark ? 'border-neutral-700' : 'border-neutral-200'">
            <div class="grid grid-cols-12 px-4 py-2 text-[10px] font-bold uppercase tracking-widest"
                 [ngClass]="isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-100 text-neutral-400'">
              <span class="col-span-5">Servicio</span>
              <span class="col-span-2 text-center">Cant.</span>
              <span class="col-span-2 text-right">P. Unitario</span>
              <span class="col-span-2 text-right">Subtotal</span>
              <span class="col-span-1"></span>
            </div>
            <div *ngFor="let item of editingInvoice.items; let i = index" class="grid grid-cols-12 px-4 py-3 items-center border-t"
                 [ngClass]="isDark ? 'border-neutral-700' : 'border-neutral-200'">
              <div class="col-span-5">
                <p class="text-sm font-semibold" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ item.serviceName }}</p>
                <input type="text" [(ngModel)]="item.description" [style.color-scheme]="isDark ? 'dark' : 'light'" placeholder="Descripción adicional..."
                       class="text-xs mt-0.5 w-full bg-transparent border-0 outline-none"
                       [ngClass]="isDark ? 'text-neutral-400 placeholder-neutral-600 focus:text-white' : 'text-neutral-600 placeholder-neutral-400 focus:text-black'"
                       (change)="recalcInvoice()">
              </div>
              <div class="col-span-2 flex justify-center">
                <input type="number" [(ngModel)]="item.quantity" min="1" (change)="recalcInvoice()" [style.color-scheme]="isDark ? 'dark' : 'light'"
                       class="w-14 text-center px-2 py-1 rounded-lg text-sm border outline-none transition-colors"
                       [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white focus:border-white focus:ring-1 focus:ring-white' : 'bg-white border-neutral-300 text-neutral-900 focus:border-black focus:ring-1 focus:ring-black'">
              </div>
              <div class="col-span-2 flex justify-end">
                <input type="number" [(ngModel)]="item.unitPrice" (change)="recalcInvoice()" [style.color-scheme]="isDark ? 'dark' : 'light'"
                       class="w-28 text-right px-2 py-1 rounded-lg text-sm border outline-none transition-colors"
                       [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white focus:border-white focus:ring-1 focus:ring-white' : 'bg-white border-neutral-300 text-neutral-900 focus:border-black focus:ring-1 focus:ring-black'">
              </div>
              <div class="col-span-2 text-right">
                <span class="text-sm font-bold" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ formatCOP(item.subtotal || 0) }}</span>
              </div>
              <div class="col-span-1 flex justify-end">
                <button (click)="removeInvoiceItem(i)" class="p-1 rounded cursor-pointer transition-colors" [ngClass]="isDark ? 'text-neutral-600 hover:text-red-400' : 'text-neutral-400 hover:text-red-500'">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Totals + tax + notes -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Notas / Términos de pago</label>
              <textarea [(ngModel)]="editingInvoice.notes" rows="3" [style.color-scheme]="isDark ? 'dark' : 'light'" placeholder="Ej: Pago a 15 días, transferencia bancaria..."
                        class="w-full px-3 py-2.5 rounded-xl text-sm border outline-none resize-none transition-colors"
                        [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 focus:border-white focus:ring-1 focus:ring-white' : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black'"></textarea>
            </div>
            <div class="rounded-xl border p-4 space-y-3"
                 [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'">
              <div class="flex justify-between text-sm">
                <span [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Subtotal</span>
                <span class="font-semibold" [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">{{ formatCOP(editingInvoice.subtotal || 0) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-2">
                  <span [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">IVA</span>
                  <input type="number" [(ngModel)]="editingInvoice.taxRate" min="0" max="100" (change)="recalcInvoice()" [style.color-scheme]="isDark ? 'dark' : 'light'"
                         class="w-14 text-center px-2 py-0.5 rounded-lg text-xs border outline-none transition-colors"
                         [ngClass]="isDark ? 'bg-neutral-700 border-neutral-600 text-white focus:border-white focus:ring-1 focus:ring-white' : 'bg-neutral-100 border-neutral-300 text-neutral-900 focus:border-black focus:ring-1 focus:ring-black'">
                  <span [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">%</span>
                </div>
                <span class="font-semibold" [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">{{ formatCOP(editingInvoice.taxAmount || 0) }}</span>
              </div>
              <div class="border-t pt-3 flex justify-between"
                   [ngClass]="isDark ? 'border-neutral-700' : 'border-neutral-200'">
                <span class="text-sm font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Total</span>
                <span class="text-lg font-bold" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ formatCOP(editingInvoice.total || 0) }}</span>
              </div>
            </div>
          </div>

          <div class="flex gap-3 justify-end flex-wrap mt-4">
            <button (click)="generatePreview()" [disabled]="pdfLoading" class="px-5 py-2 rounded-xl text-sm font-bold uppercase tracking-widest border transition-colors cursor-pointer flex items-center gap-2 mr-auto"
                    [ngClass]="isDark ? 'border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800' : 'border-neutral-300 text-neutral-600 hover:text-black hover:bg-neutral-100'">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {{ pdfLoading ? 'Cargando...' : 'Vista Previa' }}
            </button>
            <button (click)="showInvoiceForm = false" class="px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest border cursor-pointer"
                    [ngClass]="isDark ? 'border-neutral-700 text-neutral-400 hover:text-white' : 'border-neutral-300 text-neutral-500 hover:text-neutral-900'">Cancelar</button>
            <!-- Modo Edición: Botón de Actualizar -->
            <ng-container *ngIf="editingInvoice.id">
              <button (click)="saveInvoice(editingInvoice.status || 'Borrador')"
                      class="px-6 py-2 rounded-xl text-sm font-bold uppercase tracking-widest cursor-pointer border transition-all shadow-lg"
                      [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200 border-white shadow-white/10' : 'bg-black text-white hover:bg-neutral-800 border-black shadow-black/10'">
                Actualizar Cuenta
              </button>
            </ng-container>

            <!-- Modo Creación: Botones de Guardar -->
            <ng-container *ngIf="!editingInvoice.id">
              <button (click)="saveInvoice('Borrador')" class="px-5 py-2 rounded-xl text-sm font-bold uppercase tracking-widest border cursor-pointer"
                      [ngClass]="isDark ? 'border-neutral-600 text-neutral-300 hover:bg-neutral-800' : 'border-neutral-300 text-neutral-600 hover:bg-neutral-100'">Guardar Borrador</button>
              <button (click)="saveInvoice('Enviada')" class="px-5 py-2 rounded-xl text-sm font-bold uppercase tracking-widest cursor-pointer border transition-all shadow-lg"
                      [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200 border-white shadow-white/10' : 'bg-black text-white hover:bg-neutral-800 border-black shadow-black/10'">Guardar como Enviada</button>
              <button (click)="saveInvoice('Pagada')" class="px-5 py-2 rounded-xl text-sm font-bold uppercase tracking-widest cursor-pointer border"
                      [ngClass]="isDark ? 'border-neutral-600 bg-neutral-900 text-white hover:bg-neutral-800' : 'border-neutral-300 bg-neutral-100 text-neutral-900 hover:bg-neutral-200'">Guardar y Registrar Pago</button>
            </ng-container>
          </div>
        </div>

        <!-- Invoice Filters -->
        <div class="rounded-2xl border p-4 mb-4 flex flex-wrap gap-4 items-end"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
           <div class="flex flex-col gap-1.5 flex-grow min-w-[200px]">
             <label class="text-[10px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Buscar Empresa o Cliente</label>
             <input type="text" [(ngModel)]="invFilterCompany" placeholder="Ej: TechCorp"
                    class="w-full px-3 py-2 rounded-xl text-sm border outline-none bg-transparent"
                    [ngClass]="isDark ? 'border-neutral-700 text-white placeholder-neutral-600 focus:border-neutral-500' : 'border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-neutral-500'">
           </div>
           <div class="flex flex-col gap-1.5 w-28">
             <label class="text-[10px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Precio Min</label>
             <input type="number" [(ngModel)]="invFilterMinPrice" placeholder="0"
                    class="w-full px-3 py-2 rounded-xl text-sm border outline-none bg-transparent"
                    [ngClass]="isDark ? 'border-neutral-700 text-white placeholder-neutral-600 focus:border-neutral-500' : 'border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-neutral-500'">
           </div>
           <div class="flex flex-col gap-1.5 w-28">
             <label class="text-[10px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Precio Max</label>
             <input type="number" [(ngModel)]="invFilterMaxPrice" placeholder="Múltiplo"
                    class="w-full px-3 py-2 rounded-xl text-sm border outline-none bg-transparent"
                    [ngClass]="isDark ? 'border-neutral-700 text-white placeholder-neutral-600 focus:border-neutral-500' : 'border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-neutral-500'">
           </div>
           <div class="flex flex-col gap-1.5 w-32">
             <label class="text-[10px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Desde (Fecha)</label>
             <input type="date" [(ngModel)]="invFilterStartDate"
                    class="w-full px-3 py-2 rounded-xl text-sm border outline-none bg-transparent cursor-pointer"
                    [ngClass]="isDark ? 'border-neutral-700 text-white focus:border-neutral-500' : 'border-neutral-300 text-neutral-900 focus:border-neutral-500'">
           </div>
           <div class="flex flex-col gap-1.5 w-32">
             <label class="text-[10px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Hasta (Fecha)</label>
             <input type="date" [(ngModel)]="invFilterEndDate"
                    class="w-full px-3 py-2 rounded-xl text-sm border outline-none bg-transparent cursor-pointer"
                    [ngClass]="isDark ? 'border-neutral-700 text-white focus:border-neutral-500' : 'border-neutral-300 text-neutral-900 focus:border-neutral-500'">
           </div>
           <div class="flex-shrink-0">
             <button (click)="invFilterCompany=''; invFilterMinPrice=null; invFilterMaxPrice=null; invFilterStartDate=''; invFilterEndDate=''"
                     class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-colors cursor-pointer"
                     [ngClass]="isDark ? 'border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-800' : 'border-neutral-300 text-neutral-500 hover:text-black hover:bg-neutral-100'">
               Limpiar
             </button>
           </div>
         </div>

        <!-- Batch / Cascade Download Bar -->
        <div class="flex items-center justify-between flex-wrap gap-3 mb-4 p-3.5 rounded-2xl border transition-all"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3"/>
            </svg>
            <span class="text-xs font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">Descarga en Cascada (PDFs en Lote):</span>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <button (click)="downloadCascadeInvoices(['Borrador'])" [disabled]="pdfLoading || batchLoading || getCountByStatus(['Borrador']) === 0"
                    class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all duration-200 cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    [ngClass]="isDark ? 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700' : 'border-neutral-300 bg-neutral-50 text-neutral-700 hover:text-black hover:bg-neutral-100'">
              <svg class="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              {{ batchLoadingStatus === 'Borrador' ? batchProgressText : 'Borradores (' + getCountByStatus(['Borrador']) + ')' }}
            </button>

            <button (click)="downloadCascadeInvoices(['Enviada'])" [disabled]="pdfLoading || batchLoading || getCountByStatus(['Enviada']) === 0"
                    class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all duration-200 cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    [ngClass]="isDark ? 'border-neutral-700 bg-neutral-800 text-blue-400 hover:text-blue-300 hover:bg-neutral-700' : 'border-neutral-300 bg-neutral-50 text-blue-600 hover:text-blue-700 hover:bg-neutral-100'">
              <svg class="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              {{ batchLoadingStatus === 'Enviada' ? batchProgressText : 'Enviadas (' + getCountByStatus(['Enviada']) + ')' }}
            </button>

            <button (click)="downloadCascadeInvoices(['Borrador', 'Enviada'])" [disabled]="pdfLoading || batchLoading || getCountByStatus(['Borrador', 'Enviada']) === 0"
                    class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all duration-200 cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    [ngClass]="isDark ? 'border-white/20 bg-white text-black hover:bg-neutral-200' : 'border-black/20 bg-neutral-900 text-white hover:bg-neutral-800'">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              {{ batchLoadingStatus === 'Ambas' ? batchProgressText : 'Ambas (' + getCountByStatus(['Borrador', 'Enviada']) + ')' }}
            </button>
          </div>
        </div>

        <!-- Inline Payment / Abono Panel (Estilo Registro de Servicio - Monocromático) -->
        <div *ngIf="showPaymentModal && paymentInvoiceTarget" class="rounded-[28px] border p-6 space-y-5 shadow-xl transition-all mb-6 animate-fadeIn"
             [ngClass]="isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-neutral-50 border-neutral-300 text-black'">
          
          <!-- Header Bar -->
          <div class="flex items-center justify-between border-b pb-4 transition-colors"
               [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
            <div class="flex items-center gap-3">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors"
                    [ngClass]="isDark ? 'bg-black text-white border-neutral-700' : 'bg-white text-black border-neutral-300'">
                <span>REGISTRO DE RECAUDO / ABONO</span>
              </span>
              <h3 class="text-sm sm:text-base font-black uppercase tracking-wider truncate" [ngClass]="isDark ? 'text-white' : 'text-black'">
                Abono a Cuenta #{{ paymentInvoiceTarget.invoice_number || paymentInvoiceTarget.id }}
              </h3>
            </div>
            <button (click)="closePaymentModal()" class="p-1.5 rounded-xl border transition-all cursor-pointer"
                    [ngClass]="isDark ? 'border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800' : 'border-neutral-200 text-neutral-500 hover:text-black hover:bg-neutral-100'">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Body Grid (2 Cols) -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            
            <!-- Left Col: Client & Invoice Financial State (Purely Monochromatic) -->
            <div class="md:col-span-5 rounded-[22px] border p-5 flex flex-col justify-between transition-colors"
                 [ngClass]="isDark ? 'bg-black/60 border-neutral-800' : 'bg-white border-neutral-200'">
              <div class="space-y-4">
                <div>
                  <span class="text-[10px] font-black uppercase tracking-widest block mb-1 opacity-50">Total Cuenta de Cobro</span>
                  <p class="text-xl font-bold font-sans" [ngClass]="isDark ? 'text-white' : 'text-black'">
                    {{ formatCOP(paymentInvoiceTarget.total_amount || paymentInvoiceTarget.total || 0) }}
                  </p>
                </div>

                <div class="space-y-2 border-t pt-3" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
                  <div class="flex justify-between items-center text-xs">
                    <span class="opacity-50 font-medium">Recaudado hasta hoy:</span>
                    <span class="font-bold font-sans text-sm" [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">{{ formatCOP(paymentInvoiceTarget.paid_amount || 0) }}</span>
                  </div>

                  <div class="flex justify-between items-center text-xs pt-1">
                    <span class="font-extrabold opacity-70">Saldo Pendiente:</span>
                    <span class="font-bold font-sans text-sm" [ngClass]="isDark ? 'text-white' : 'text-black'">
                      {{ formatCOP(getPendingAmount(paymentInvoiceTarget)) }}
                    </span>
                  </div>
                </div>

                <!-- Recaudo Progress Bar (Monocromático) -->
                <div class="space-y-1.5 pt-1">
                  <div class="h-2 rounded-full overflow-hidden border" [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-200 border-neutral-300'">
                    <div class="h-full rounded-full transition-all duration-500" [ngClass]="isDark ? 'bg-white' : 'bg-black'"
                         [style.width.%]="getInvoicePaidPct(paymentInvoiceTarget)"></div>
                  </div>
                  <div class="flex justify-between items-center text-[10px] font-sans font-bold opacity-60">
                    <span>Progreso Recaudo</span>
                    <span>{{ getInvoicePaidPct(paymentInvoiceTarget) }}%</span>
                  </div>
                </div>
              </div>

              <div class="border-t my-3 transition-colors" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'"></div>

              <div>
                <span class="text-[10px] font-black uppercase tracking-widest block mb-1 opacity-50">TITULAR DE LA CUENTA</span>
                <p class="text-sm font-extrabold truncate" [ngClass]="isDark ? 'text-white' : 'text-black'">{{ paymentInvoiceTarget.clientName || 'Cliente' }}</p>
                <p class="text-xs opacity-50 truncate mt-0.5">{{ paymentInvoiceTarget.clientCompany || 'Sin empresa' }}</p>
              </div>
            </div>

            <!-- Right Col: Form & Formatted Price Preview (Color only on the Price Preview Badge!) -->
            <div class="md:col-span-7 flex flex-col justify-between space-y-4">
              
              <!-- Amount Input + Live Price Preview Badge -->
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest block" [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">
                  MONTO A ABONAR (COP) *
                </label>
                
                <input type="number" [(ngModel)]="paymentForm.amount" min="1" [style.color-scheme]="isDark ? 'dark' : 'light'"
                       placeholder="Ej: 500000"
                       class="w-full px-4 py-2.5 rounded-xl text-base font-sans font-bold border outline-none transition-colors"
                       [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white focus:border-white' : 'bg-white border-neutral-300 text-black focus:border-black'">

                <!-- Indicador del Precio en Color Verde (El único elemento en color de la sección derecha) -->
                <div class="mt-2 p-3.5 rounded-xl border flex items-center justify-between transition-all duration-300 shadow-xs"
                     [ngClass]="isDark ? 'bg-black border-neutral-800' : 'bg-white border-neutral-200'">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span class="text-[10px] font-extrabold uppercase tracking-widest opacity-60">Precio abono</span>
                  </div>
                  <span class="text-lg sm:text-xl font-bold font-sans"
                        [ngClass]="isDark ? 'text-emerald-400' : 'text-emerald-600'">
                    {{ formatCOPDisplay(paymentForm.amount) }}
                  </span>
                </div>

                <!-- Quick Presets (Monocromáticos) -->
                <div class="flex gap-2 pt-1 flex-wrap">
                  <button (click)="setPaymentPreset(0.5)" type="button"
                          class="px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border cursor-pointer transition-colors"
                          [ngClass]="isDark ? 'border-neutral-800 bg-black text-neutral-300 hover:text-white hover:bg-neutral-800' : 'border-neutral-200 bg-white text-neutral-700 hover:text-black hover:bg-neutral-100'">
                    50% del Saldo
                  </button>
                  <button (click)="setPaymentPreset(1.0)" type="button"
                          class="px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border cursor-pointer transition-colors"
                          [ngClass]="isDark ? 'border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700' : 'border-neutral-300 bg-neutral-100 text-black hover:bg-neutral-200'">
                    Liquidar Saldo Total
                  </button>
                </div>
              </div>

              <!-- Date & Method Fields -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col gap-1.5">
                  <label class="text-[10px] font-black uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">FECHA DE ABONO *</label>
                  <input type="date" [(ngModel)]="paymentForm.paidAt" [style.color-scheme]="isDark ? 'dark' : 'light'"
                         class="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border outline-none cursor-pointer transition-colors"
                         [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white focus:border-white' : 'bg-white border-neutral-300 text-black focus:border-black'">
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-[10px] font-black uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">MÉTODO DE PAGO *</label>
                  <select [(ngModel)]="paymentForm.paymentMethod" [style.color-scheme]="isDark ? 'dark' : 'light'"
                          class="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border outline-none cursor-pointer transition-colors"
                          [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white focus:border-white' : 'bg-white border-neutral-300 text-black focus:border-black'">
                    <option *ngFor="let m of paymentMethodsList" [value]="m">{{ m }}</option>
                  </select>
                </div>
              </div>

              <!-- Notes -->
              <div class="flex flex-col gap-1.5">
                <label class="text-[10px] font-black uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">COMPROBANTE / REFERENCIA / NOTAS</label>
                <textarea [(ngModel)]="paymentForm.paymentNotes" rows="2" [style.color-scheme]="isDark ? 'dark' : 'light'"
                          placeholder="Ej: Abono 1 de 2 · Ref Bancolombia #982341..."
                          class="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none resize-none transition-colors font-medium"
                          [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 focus:border-white' : 'bg-white border-neutral-300 text-black placeholder-neutral-400 focus:border-black'"></textarea>
              </div>

            </div>
          </div>

          <!-- Bottom Actions -->
          <div class="flex gap-3 justify-end pt-3 border-t transition-colors" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
            <button (click)="closePaymentModal()"
                    class="px-4 py-2 rounded-xl text-xs font-headline font-bold uppercase tracking-wider border cursor-pointer transition-colors"
                    [ngClass]="isDark ? 'border-neutral-700 text-neutral-400 hover:text-white' : 'border-neutral-300 text-neutral-600 hover:text-black'">
              Cancelar
            </button>
            <button (click)="confirmPayment()" [disabled]="isLoading"
                    class="px-6 py-2 rounded-xl text-xs font-headline font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-2"
                    [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
              <span>{{ isLoading ? 'Guardando Abono...' : 'Guardar Abono' }}</span>
            </button>
          </div>
        </div>

        <!-- Invoice list -->
        <div class="rounded-2xl border overflow-hidden"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <div class="grid grid-cols-12 px-5 py-3 text-[10px] font-bold uppercase tracking-widest border-b gap-2"
               [ngClass]="isDark ? 'border-neutral-800 text-neutral-500' : 'border-neutral-200 text-neutral-400'">
            <span class="col-span-2">ID</span>
            <span class="col-span-3">Cliente / Etiqueta</span>
            <span class="col-span-2 text-right">Monto Total</span>
            <span class="col-span-2 text-right">Falta por Pagar</span>
            <span class="col-span-2 text-center">Estado / Vencimiento</span>
            <span class="col-span-1"></span>
          </div>
          <div class="divide-y" [ngClass]="isDark ? 'divide-neutral-800' : 'divide-neutral-100'">
            <ng-container *ngFor="let inv of displayedInvoices">
              <div class="grid grid-cols-12 px-5 py-4 items-center transition-colors gap-2"
                   [ngClass]="isDark ? 'hover:bg-neutral-800/30' : 'hover:bg-neutral-50'">
                
                <div class="col-span-2 flex items-center gap-2">
                  <button (click)="toggleInvoiceExpand(inv.id || '')" class="p-1 rounded-lg border text-xs font-bold transition-all cursor-pointer shrink-0"
                          [ngClass]="isDark ? 'border-neutral-800 text-neutral-400 hover:text-white' : 'border-neutral-200 text-neutral-600 hover:text-black'" title="Ver historial de abonos">
                    <svg class="w-3.5 h-3.5 transition-transform duration-200" [ngClass]="expandedInvoiceId === inv.id ? 'rotate-90' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                  </button>
                  <span class="text-xs font-semibold font-sans" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">#{{ inv.invoice_number || inv.id }}</span>
                </div>

                <div class="col-span-3">
                  <p *ngIf="inv.title" class="text-sm font-extrabold truncate" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ inv.title }}</p>
                  <p class="text-xs truncate" [ngClass]="inv.title ? (isDark ? 'text-neutral-400 font-medium' : 'text-neutral-600 font-medium') : (isDark ? 'text-white font-bold text-sm' : 'text-neutral-900 font-bold text-sm')">{{ inv.clientName }}</p>
                  <p class="text-[11px] truncate opacity-60" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">{{ inv.clientCompany }}</p>
                </div>

                <!-- Monto Total -->
                <div class="col-span-2 text-right">
                  <span class="text-sm font-bold font-sans block" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ formatCOP(inv.total || inv.total_amount || 0) }}</span>
                  <div *ngIf="inv.paid_amount && inv.paid_amount > 0 && inv.status !== 'Pagada' && inv.status !== 'PAGADA'" class="text-[10px] font-sans mt-0.5">
                    <span class="text-emerald-400 font-semibold">Abonado: {{ formatCOP(inv.paid_amount) }}</span>
                  </div>
                </div>

                <!-- Falta por Pagar (Saldo Pendiente) -->
                <div class="col-span-2 text-right">
                  <span class="text-sm font-bold font-sans block"
                        [ngClass]="getPendingAmount(inv) > 0 ? (isDark ? 'text-amber-400' : 'text-amber-600') : (isDark ? 'text-emerald-400' : 'text-emerald-600')">
                    {{ formatCOP(getPendingAmount(inv)) }}
                  </span>
                  <span class="text-[10px] block opacity-50 uppercase tracking-wider font-medium">
                    {{ getPendingAmount(inv) > 0 ? 'Por cobrar' : 'Al día' }}
                  </span>
                </div>

                <!-- Estado & Vencimiento -->
                <div class="col-span-2 flex flex-col items-center justify-center gap-1">
                  <span class="text-[10px] font-bold uppercase px-3 py-1 rounded-full border" [ngClass]="getStatusClass(inv.status)">
                    {{ inv.status === 'Parcial' || inv.status === 'PARCIAL' ? 'Abonada (' + getInvoicePaidPct(inv) + '%)' : inv.status }}
                  </span>
                  <span class="text-[10px] font-sans opacity-60" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Vence: {{ inv.dueAt | date:'dd MMM yyyy' }}</span>
                </div>

                <div class="col-span-1 flex justify-end gap-1">
                  <button *ngIf="inv.status !== 'Pagada' && inv.status !== 'PAGADA'" (click)="openPaymentModal(inv)" title="Registrar Abono"
                          class="p-1.5 rounded-lg cursor-pointer transition-colors"
                          [ngClass]="isDark ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-emerald-600 hover:bg-emerald-50'">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-6-6h12"/></svg>
                  </button>
                  <button (click)="downloadInvoicePdf(inv)" title="Descargar PDF" [disabled]="pdfLoading"
                          class="p-1.5 rounded-lg cursor-pointer transition-colors"
                          [ngClass]="isDark ? 'text-neutral-500 hover:text-red-400 hover:bg-red-900/20' : 'text-neutral-400 hover:text-red-600 hover:bg-red-50'">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </button>
                  <button (click)="editInvoice(inv)" title="Editar" class="p-1.5 rounded-lg cursor-pointer transition-colors"
                          [ngClass]="isDark ? 'text-neutral-500 hover:text-white hover:bg-neutral-800' : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100'">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button (click)="deleteInvoice(inv.id || '')" title="Eliminar" class="p-1.5 rounded-lg cursor-pointer transition-colors"
                          [ngClass]="isDark ? 'text-neutral-500 hover:text-red-400 hover:bg-red-900/20' : 'text-neutral-400 hover:text-red-600 hover:bg-red-50'">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </div>

              <!-- Expanded Abonos Ledger Drawer -->
              <div *ngIf="expandedInvoiceId === inv.id" class="px-6 py-4 border-t space-y-3 transition-all"
                   [ngClass]="isDark ? 'bg-neutral-950/90 border-neutral-800' : 'bg-neutral-50/90 border-neutral-200'">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <h5 class="text-xs font-headline font-bold uppercase tracking-wider" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                      Historial de Abonos Realizados
                    </h5>
                  </div>
                  <button (click)="openPaymentModal(inv)" class="px-3 py-1 rounded-lg text-xs font-headline font-bold uppercase tracking-wider border cursor-pointer transition-all shadow-xs flex items-center gap-1.5"
                          [ngClass]="isDark ? 'bg-white text-black border-white hover:bg-neutral-200' : 'bg-black text-white border-black hover:bg-neutral-800'">
                    + Registrar Abono
                  </button>
                </div>

                <!-- Recaudo Status Bar (Estilo Texto Proporcional de Servicios) -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div class="rounded-2xl border p-3.5 flex flex-col justify-between transition-colors shadow-2xs"
                       [ngClass]="isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-neutral-200'">
                    <span class="text-[10px] font-bold uppercase tracking-widest block opacity-60 mb-1">Monto Total</span>
                    <p class="text-sm sm:text-base font-bold font-sans" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                      {{ formatCOP(inv.total || inv.total_amount || 0) }}
                    </p>
                  </div>

                  <div class="rounded-2xl border p-3.5 flex flex-col justify-between transition-colors shadow-2xs"
                       [ngClass]="isDark ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50/50 border-emerald-200'">
                    <span class="text-[10px] font-bold uppercase tracking-widest block text-emerald-400/80 mb-1">Recaudado hasta hoy</span>
                    <p class="text-sm sm:text-base font-bold font-sans text-emerald-400">
                      {{ formatCOP(inv.paid_amount || 0) }}
                    </p>
                  </div>

                  <div class="rounded-2xl border p-3.5 flex flex-col justify-between transition-colors shadow-2xs"
                       [ngClass]="isDark ? 'bg-amber-950/20 border-amber-500/30' : 'bg-amber-50/50 border-amber-200'">
                    <span class="text-[10px] font-bold uppercase tracking-widest block text-amber-400/80 mb-1">Saldo Pendiente</span>
                    <p class="text-sm sm:text-base font-bold font-sans text-amber-400">
                      {{ formatCOP(getPendingAmount(inv)) }}
                    </p>
                  </div>
                </div>

                <!-- Payments list table -->
                <div *ngIf="inv.payments && inv.payments.length > 0" class="rounded-xl border overflow-hidden" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
                  <table class="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr class="border-b text-[9px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'border-neutral-800 bg-neutral-900 text-neutral-400' : 'border-neutral-200 bg-neutral-100 text-neutral-500'">
                        <th class="px-3.5 py-2">Fecha</th>
                        <th class="px-3.5 py-2">Método</th>
                        <th class="px-3.5 py-2 text-right">Monto Abono</th>
                        <th class="px-3.5 py-2">Notas / Ref</th>
                        <th class="px-3.5 py-2 text-right"></th>
                      </tr>
                    </thead>
                    <tbody class="divide-y" [ngClass]="isDark ? 'divide-neutral-800' : 'divide-neutral-200'">
                      <tr *ngFor="let pay of inv.payments" [ngClass]="isDark ? 'hover:bg-neutral-900/50' : 'hover:bg-neutral-100/50'">
                        <td class="px-3.5 py-2 font-sans opacity-80">{{ pay.payment_date | date:'dd MMM yyyy' }}</td>
                        <td class="px-3.5 py-2 font-semibold">{{ pay.payment_method }}</td>
                        <td class="px-3.5 py-2 font-sans font-bold text-right text-emerald-400">{{ formatCOP(pay.amount) }}</td>
                        <td class="px-3.5 py-2 opacity-70 truncate max-w-[200px]">{{ pay.notes || '—' }}</td>
                        <td class="px-3.5 py-2 text-right">
                          <button (click)="deletePayment(pay.id!)" class="p-1 rounded text-neutral-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer" title="Anular / Eliminar Abono">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div *ngIf="!inv.payments || inv.payments.length === 0" class="p-4 text-center text-xs opacity-50 border rounded-xl" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
                  No hay abonos registrados para esta cuenta de cobro aún.
                </div>
              </div>
            </ng-container>

            <div *ngIf="invoices.length === 0" class="px-5 py-10 text-center text-sm"
                 [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'">
              No hay cuentas de cobro aún.
            </div>
          </div>
        </div>
      </ng-container>

      <!-- ══════════════════ REPORTES Y MÉTRICAS ══════════════════ -->
      <ng-container *ngIf="subTab === 'legal'">
        
        <!-- Key Metrics Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <div class="rounded-2xl border p-4 flex flex-col justify-center"
               [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
            <p class="text-[10px] font-bold uppercase tracking-widest mb-1" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Tasa de Recaudo</p>
            <p class="text-2xl font-black" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ keyMetrics.collectionRate }}%</p>
          </div>
          <div class="rounded-2xl border p-4 flex flex-col justify-center"
               [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
            <p class="text-[10px] font-bold uppercase tracking-widest mb-1" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Facturas Vencidas</p>
            <p class="text-2xl font-black" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ keyMetrics.overdueCount }}</p>
          </div>
          <div class="rounded-2xl border p-4 flex flex-col justify-center"
               [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
            <p class="text-[10px] font-bold uppercase tracking-widest mb-1" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Monto Vencido</p>
            <p class="text-xl font-black text-red-500">{{ formatCOP(keyMetrics.overdueAmount) }}</p>
          </div>
          <div class="rounded-2xl border p-4 flex flex-col justify-center"
               [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
            <p class="text-[10px] font-bold uppercase tracking-widest mb-1" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Ticket Promedio</p>
            <p class="text-xl font-black" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ formatCOP(keyMetrics.avgInvoiceValue) }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <!-- Ingresos Mensuales -->
          <div class="rounded-2xl border p-6 flex flex-col h-[300px]"
               [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
            <h3 class="text-sm font-bold uppercase tracking-wide mb-6" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Ingresos Mensuales</h3>
            <div class="flex-grow flex items-end gap-2 border-b pb-2 relative"
                 [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
              <!-- Simple CSS Bar Chart -->
              <div *ngFor="let m of monthlyIncome" class="flex-1 flex flex-col items-center justify-end gap-2 group relative">
                <!-- Tooltip -->
                <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-neutral-900 text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                  {{ formatCOP(m.amount) }}
                </div>
                <!-- Bar -->
                <div class="w-full rounded-t-sm transition-all duration-300"
                     [ngStyle]="{'height': m.height + '%'}"
                     [ngClass]="isDark ? 'bg-neutral-700 group-hover:bg-neutral-500' : 'bg-neutral-300 group-hover:bg-neutral-400'"></div>
                <span class="text-[9px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">{{ m.month }}</span>
              </div>
              <div *ngIf="monthlyIncome.length === 0" class="absolute inset-0 flex items-center justify-center text-sm" [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'">
                No hay ingresos registrados aún.
              </div>
            </div>
          </div>

          <!-- Ingresos por Servicio -->
          <div class="rounded-2xl border p-6 flex flex-col h-[300px] overflow-hidden"
               [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
            <h3 class="text-sm font-bold uppercase tracking-wide mb-6" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Ingresos por Servicio</h3>
            <div class="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-grow">
              <div *ngFor="let s of serviceIncome" class="space-y-1">
                <div class="flex justify-between text-xs">
                  <span class="font-bold truncate" [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">{{ s.name }}</span>
                  <span class="font-semibold" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ formatCOP(s.amount) }}</span>
                </div>
                <div class="w-full h-1.5 rounded-full overflow-hidden" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'">
                  <div class="h-full bg-blue-500" [ngStyle]="{'width': s.percent + '%'}"></div>
                </div>
              </div>
              <div *ngIf="serviceIncome.length === 0" class="text-center text-sm py-10" [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'">
                No hay ingresos registrados aún.
              </div>
            </div>
          </div>
        </div>
        
        <!-- Facturas por Estado -->
        <div class="rounded-2xl border p-6"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <h3 class="text-sm font-bold uppercase tracking-wide mb-6" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Distribución de Facturas</h3>
          <div class="space-y-5">
            <div *ngFor="let s of statusIncome" class="space-y-2">
              <div class="flex justify-between items-center text-sm">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full" [ngClass]="s.colorClass"></span>
                  <span class="font-bold uppercase tracking-widest text-[10px]" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">{{ s.status }} ({{ s.count }})</span>
                </div>
                <span class="font-bold" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ formatCOP(s.amount) }}</span>
              </div>
              <div class="w-full h-2 rounded-full overflow-hidden" [ngClass]="isDark ? 'bg-neutral-800' : 'bg-neutral-200'">
                <div class="h-full rounded-full transition-all duration-500" [ngClass]="s.colorClass" [ngStyle]="{'width': s.width + '%'}"></div>
              </div>
            </div>
          </div>
        </div>

      </ng-container>

      <!-- ══════════════════ MODALES GLOBALMENTE DISPONIBLES EN TODAS LAS PESTAÑAS ══════════════════ -->

      <!-- PDF Preview Modal -->
      <div *ngIf="showPdfPreview" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-fadeIn">
        <div class="w-full max-w-4xl h-[90vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl border modal-enter my-auto"
             [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-white shadow-black/80' : 'bg-white border-neutral-200 text-neutral-900 shadow-xl'">
          <div class="px-6 py-4 border-b flex justify-between items-center shrink-0" [ngClass]="isDark ? 'border-neutral-800 bg-neutral-900/90' : 'border-neutral-200 bg-neutral-50/90'">
            <div class="flex items-center gap-3">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h3 class="text-sm font-extrabold uppercase tracking-widest">Vista Previa de Cuenta de Cobro</h3>
            </div>
            <div class="flex items-center gap-2">
              <button (click)="downloadPreviewPdf()" [disabled]="pdfLoading" class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all cursor-pointer flex items-center gap-1.5"
                      [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200 border-white' : 'bg-black text-white hover:bg-neutral-800 border-black'">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                Descargar PDF
              </button>
              <button (click)="printPreviewPdf()" class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all cursor-pointer flex items-center gap-1.5"
                      [ngClass]="isDark ? 'border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800' : 'border-neutral-300 text-neutral-700 hover:text-black hover:bg-neutral-100'">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                Imprimir
              </button>
              <button (click)="closePreview()" class="p-2 rounded-xl transition-all duration-200 cursor-pointer border ml-1"
                      [ngClass]="isDark ? 'border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 hover:border-neutral-700' : 'border-neutral-200 text-neutral-500 hover:text-black hover:bg-neutral-100'">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
          <div class="flex-grow bg-neutral-800/20 relative">
            <iframe *ngIf="previewPdfUrl" [src]="previewPdfUrl" class="w-full h-full border-0"></iframe>
          </div>
        </div>
      </div>

      <!-- Premium Success Gadget Toast -->
      <div *ngIf="gadgetToast && gadgetToast.show" class="fixed bottom-6 right-6 z-[120] flex flex-col min-w-[320px] max-w-[420px] rounded-2xl shadow-2xl font-sans overflow-hidden modal-enter border backdrop-blur-xl transition-all"
           [ngClass]="isDark ? 'bg-neutral-900/95 text-white border-neutral-700/80 shadow-black/60' : 'bg-white/95 text-neutral-900 border-neutral-200/80 shadow-xl'">
        <div class="flex items-center justify-between px-5 py-4 gap-3.5">
          <div class="flex items-center gap-3.5">
            <!-- Icon by type -->
            <div *ngIf="gadgetToast.type === 'create'" class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                 [ngClass]="isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600'">
              <svg class="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
            </div>
            <div *ngIf="gadgetToast.type === 'edit'" class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                 [ngClass]="isDark ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-50 text-blue-600'">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </div>
            <div *ngIf="gadgetToast.type === 'delete'" class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                 [ngClass]="isDark ? 'bg-rose-500/15 text-rose-400' : 'bg-rose-50 text-rose-600'">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </div>
            <div *ngIf="gadgetToast.type === 'success'" class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                 [ngClass]="isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600'">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
            </div>
            <div class="flex flex-col">
              <span class="text-[11px] font-bold uppercase tracking-wider opacity-60">
                {{ gadgetToast.type === 'create' ? 'Creación exitosa' : (gadgetToast.type === 'edit' ? 'Edición guardada' : (gadgetToast.type === 'delete' ? 'Registro eliminado' : 'Operación completada')) }}
              </span>
              <span class="text-sm font-extrabold leading-snug">{{ gadgetToast.message }}</span>
            </div>
          </div>
          <button (click)="gadgetToast = null" class="p-1 rounded-lg opacity-50 hover:opacity-100 transition-opacity">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <!-- Progress Bar -->
        <div class="h-1 w-full bg-neutral-500/10 overflow-hidden">
          <div class="h-full gadget-progress-bar"
               [ngClass]="gadgetToast.type === 'create' || gadgetToast.type === 'success' ? 'bg-emerald-500' : (gadgetToast.type === 'edit' ? 'bg-blue-500' : 'bg-rose-500')"></div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .tab-enter { animation: tabEnter 0.25s ease-out forwards; }
    @keyframes tabEnter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes ticker { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
    .animate-ticker { animation: ticker 25s linear infinite; }
    .animate-fadeIn { animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .modal-enter { animation: modalEnter 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes modalEnter { from { opacity: 0; transform: scale(0.95) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    @keyframes gadgetProgress { from { width: 100%; } to { width: 0%; } }
    .gadget-progress-bar { animation: gadgetProgress 4.2s linear forwards; }
  `]
})
export class DashFinancesComponent implements OnInit, OnChanges {
  @Input() theme = 'light';

  private financeService = inject(FinanceService);
  private pdfService = inject(PdfReportService);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);

  get isDark() { return this.theme === 'dark'; }
  Math = Math;

  getPendingAmount(inv: any): number {
    if (!inv) return 0;
    if (inv.pending_amount !== undefined && inv.pending_amount !== null) return Number(inv.pending_amount);
    const total = Number(inv.total || inv.total_amount || 0);
    const paid = Number(inv.paid_amount || 0);
    return Math.max(0, total - paid);
  }

  formatStatus(rawStatus: string, dueAt?: string, paidAmount?: number, totalAmount?: number): Invoice['status'] {
    if (!rawStatus) return 'Enviada';
    const s = String(rawStatus).toUpperCase();
    if (s === 'PAGADA' || s === 'PAGADO') return 'Pagada';
    if (s === 'PARCIAL' || (paidAmount && paidAmount > 0 && totalAmount && paidAmount < totalAmount)) return 'Parcial';
    if (s === 'DRAFT' || s === 'BORRADOR') return 'Borrador';
    
    if (dueAt) {
      const today = new Date().toISOString().split('T')[0];
      if (dueAt < today) {
        return 'Vencida';
      }
    }

    if (s === 'VENCIDA' || s === 'VENCIDO') return 'Vencida';
    if (s === 'ENVIADA' || s === 'ENVIADO') return 'Enviada';
    return 'Enviada';
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['theme']) {
      this.cdr.detectChanges();
    }
  }

  subTab: SubTab = 'resumen';
  showPdfPreview = false;
  previewPdfUrl: SafeResourceUrl | null = null;
  previewInvoiceTarget: Invoice | null = null;
  subTabs = [
    { id: 'resumen' as SubTab, label: 'Resumen' },
    { id: 'clientes' as SubTab, label: 'Clientes' },
    { id: 'servicios' as SubTab, label: 'Servicios' },
    { id: 'facturas' as SubTab, label: 'Cuentas de Cobro' },
    { id: 'legal' as SubTab, label: 'Reportes y Legal' },
  ];

  clients: Client[] = [];
  allServices: Service[] = [];
  invoices: Invoice[] = [];
  kpis: { label: string; value: string; color?: string }[] = [];
  recentInvoices: Invoice[] = [];
  pdfLoading = false;
  batchLoading = false;
  batchLoadingStatus = '';
  batchProgressText = '';
  expandedInvoiceId: string | null = null;
  kpiPeriod: 'all' | 'this_month' | 'last_month' = 'all';

  // Payment Modal & Abonos State
  showPaymentModal = false;
  paymentInvoiceTarget: Invoice | null = null;
  paymentForm = {
    amount: 0,
    paidAt: new Date().toISOString().split('T')[0],
    paymentMethod: 'Transferencia Bancaria',
    paymentNotes: ''
  };
  paymentMethodsList = [
    'Transferencia Bancaria',
    'Nequi',
    'Daviplata',
    'Tarjeta de Crédito/Débito',
    'Efectivo',
    'Otro'
  ];
  paymentSuccessToast = '';
  gadgetToast: {
    show: boolean;
    message: string;
    type: 'create' | 'edit' | 'delete' | 'success';
  } | null = null;

  openPaymentModal(inv: Invoice) {
    this.paymentInvoiceTarget = { ...inv };
    const total = inv.total_amount || inv.total || 0;
    const paid = inv.paid_amount || (inv.status === 'Pagada' || inv.status === 'PAGADA' ? total : 0);
    const pending = inv.pending_amount !== undefined ? inv.pending_amount : Math.max(0, total - paid);
    
    this.paymentForm = {
      amount: pending > 0 ? pending : total,
      paidAt: new Date().toISOString().split('T')[0],
      paymentMethod: inv.paymentMethod || inv.payment_method || 'Transferencia Bancaria',
      paymentNotes: ''
    };
    this.showPaymentModal = true;
    this.cdr.detectChanges();
  }

  setPaymentPreset(ratio: number) {
    if (!this.paymentInvoiceTarget) return;
    const total = this.paymentInvoiceTarget.total_amount || this.paymentInvoiceTarget.total || 0;
    const paid = this.paymentInvoiceTarget.paid_amount || 0;
    const pending = this.paymentInvoiceTarget.pending_amount !== undefined ? this.paymentInvoiceTarget.pending_amount : Math.max(0, total - paid);
    const base = pending > 0 ? pending : total;
    this.paymentForm.amount = Math.round(base * ratio);
  }

  getInvoicePaidPct(inv: any): number {
    if (!inv) return 0;
    const total = Number(inv.total_amount || inv.total || 0);
    if (!total) return 0;
    if (inv.status === 'PAGADA' || inv.status === 'Pagada') return 100;
    const paid = Number(inv.paid_amount || 0);
    return Math.min(100, Math.round((paid / total) * 100));
  }

  toggleInvoiceExpand(id: string) {
    this.expandedInvoiceId = this.expandedInvoiceId === id ? null : id;
    this.cdr.detectChanges();
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.paymentInvoiceTarget = null;
    this.cdr.detectChanges();
  }

  async confirmPayment() {
    if (!this.paymentInvoiceTarget?.id) return;
    const targetId = this.paymentInvoiceTarget.id;
    const amount = Number(this.paymentForm.amount);
    
    if (!amount || amount <= 0) {
      alert('Por favor ingrese un monto de abono mayor a $0 COP.');
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();
    try {
      const res = await firstValueFrom(this.financeService.addInvoicePayment(
        targetId,
        {
          amount: amount,
          payment_date: this.paymentForm.paidAt,
          payment_method: this.paymentForm.paymentMethod,
          notes: this.paymentForm.paymentNotes
        }
      ));
      
      this.showPaymentModal = false;
      this.paymentInvoiceTarget = null;
      await this.refresh();
      this.showSuccessToast(res.message || `¡Abono de ${this.formatCOP(amount)} registrado con éxito!`);
    } catch (e: any) {
      console.error(e);
      alert(e?.error?.message || 'Error al registrar el abono.');
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  async deletePayment(paymentId: number) {
    if (!confirm('¿Estás seguro de anular/eliminar este abono registrado?')) return;
    this.isLoading = true;
    this.cdr.detectChanges();
    try {
      const res = await firstValueFrom(this.financeService.deleteInvoicePayment(paymentId));
      await this.refresh();
      this.showSuccessToast(res.message || 'Abono eliminado y saldo actualizado.');
    } catch (e: any) {
      console.error(e);
      alert(e?.error?.message || 'Error al eliminar el abono.');
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  showGadget(message: string, type: 'create' | 'edit' | 'delete' | 'success' = 'success') {
    this.gadgetToast = { show: true, message, type };
    this.cdr.detectChanges();
    setTimeout(() => {
      if (this.gadgetToast && this.gadgetToast.message === message) {
        this.gadgetToast = null;
        this.cdr.detectChanges();
      }
    }, 4200);
  }

  showSuccessToast(msg: string) {
    this.showGadget(msg, 'success');
  }

  // Client filters
  clientFilterText = '';

  get displayedClients() {
    if (!this.clientFilterText) return this.clients;
    const term = this.clientFilterText.toLowerCase();
    return this.clients.filter(c => 
      c.name.toLowerCase().includes(term) ||
      (c.company && c.company.toLowerCase().includes(term)) ||
      c.email.toLowerCase().includes(term)
    );
  }

  // Invoice filters
  invFilterCompany = '';
  invFilterMinPrice: number | null = null;
  invFilterMaxPrice: number | null = null;
  invFilterStartDate = '';
  invFilterEndDate = '';

  get displayedInvoices() {
    return this.invoices.filter(i => {
      let match = true;
      if (this.invFilterCompany) {
         const term = this.invFilterCompany.toLowerCase();
         if (!i.clientCompany?.toLowerCase().includes(term) && !(i.clientName || '').toLowerCase().includes(term) && !(i.title || '').toLowerCase().includes(term)) {
           match = false;
         }
      }
      if (this.invFilterMinPrice !== null && (i.total || 0) < this.invFilterMinPrice) match = false;
      if (this.invFilterMaxPrice !== null && (i.total || 0) > this.invFilterMaxPrice) match = false;
      if (this.invFilterStartDate && (i.issuedAt || '') < this.invFilterStartDate) match = false;
      if (this.invFilterEndDate && (i.issuedAt || '') > this.invFilterEndDate) match = false;
      return match;
    });
  }

  get paidPercentage(): number {
    const total = (this.invoices || []).reduce((sum, inv) => sum + (inv.total || inv.total_amount || 0), 0);
    if (!total) return 0;
    const paid = (this.invoices || []).reduce((sum, inv) => {
      if (inv.status === 'Pagada' || inv.status === 'PAGADA') return sum + (inv.total || inv.total_amount || 0);
      return sum + (inv.paid_amount || 0);
    }, 0);
    return Math.min(100, Math.round((paid / total) * 100));
  }

  get pendingPercentage(): number {
    const paidPct = this.paidPercentage;
    const overduePct = this.overduePercentage;
    return Math.max(0, 100 - paidPct - overduePct);
  }

  get overduePercentage(): number {
    const total = (this.invoices || []).reduce((sum, inv) => sum + (inv.total || inv.total_amount || 0), 0);
    if (!total) return 0;
    const overdue = (this.invoices || []).reduce((sum, inv) => {
      if (inv.status === 'Vencida' || inv.status === 'VENCIDA') {
        const pending = inv.pending_amount !== undefined ? inv.pending_amount : Math.max(0, (inv.total || 0) - (inv.paid_amount || 0));
        return sum + pending;
      }
      return sum;
    }, 0);
    return Math.round((overdue / total) * 100);
  }

  monthlyIncome: { month: string; amount: number; height: number }[] = [];
  serviceIncome: { name: string; amount: number; percent: number }[] = [];
  statusIncome: { status: string; count: number; amount: number; colorClass: string; width: number }[] = [];
  keyMetrics = {
    collectionRate: 0,
    overdueCount: 0,
    overdueAmount: 0,
    avgInvoiceValue: 0,
  };

  // Client form
  showClientForm = false;
  editingClient: Partial<Client> | null = null;
  clientFields = [
    { key: 'name', label: 'Nombre completo', type: 'text', placeholder: 'Juan Pérez', required: true },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'juan@empresa.com', required: true },
    { key: 'phone', label: 'Teléfono', type: 'text', placeholder: '+57 300 000 0000', required: false },
    { key: 'company', label: 'Empresa', type: 'text', placeholder: 'Empresa S.A.S.', required: false },
  ] as any[];

  // Service form
  showServiceForm = false;
  editingService: Partial<Service> | null = null;
  filterCategory = 'all';
  serviceCategories = [
    { id: 'all', label: 'Todos' },
    { id: 'desarrollo', label: 'Desarrollo' },
    { id: 'diseño', label: 'Diseño' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'consultoria', label: 'Consultoría' },
    { id: 'otro', label: 'Otro' },
  ];

  // Invoice form
  showInvoiceForm = false;
  editingInvoice: Partial<Invoice> | null = null;
  selectedClientId = '';
  serviceToAdd = '';

  get filteredServices() {
    if (this.filterCategory === 'all') return this.allServices;
    return this.allServices.filter(s => s.category === this.filterCategory);
  }

  isLoading = false;

  ngOnInit() { this.refresh(); }

  async refresh() {
    this.isLoading = true;
    this.cdr.detectChanges();
    try {
      const [clientsRes, servicesRes, invoicesRes] = await Promise.all([
        firstValueFrom(this.financeService.getClients()),
        firstValueFrom(this.financeService.getServices()),
        firstValueFrom(this.financeService.getInvoices())
      ]);

      this.clients = clientsRes.clients.map((c: any) => ({ ...c, createdAt: c.created_at })) || [];
      this.allServices = servicesRes.services.map((s: any) => ({ ...s, unitPrice: Number(s.price) })) || [];
      this.invoices = invoicesRes.invoices.map((i: any) => {
        const total = Number(i.total_amount || i.total || 0);
        const paid = Number(i.paid_amount || 0);
        const dueAt = i.due_date ? i.due_date.split('T')[0] : '';
        return {
          id: i.id,
          invoice_number: i.invoice_number || i.id,
          title: i.title || '',
          clientId: i.client_id,
          clientName: i.client_name,
          clientCompany: i.company || '',
          total: total,
          total_amount: total,
          subtotal: Number(i.subtotal),
          paid_amount: paid,
          pending_amount: Number(i.pending_amount !== undefined ? i.pending_amount : Math.max(0, total - paid)),
          status: this.formatStatus(i.status, dueAt, paid, total),
          issuedAt: i.issue_date ? i.issue_date.split('T')[0] : '',
          dueAt: dueAt,
          paidAt: i.paid_at ? i.paid_at.split('T')[0] : (i.updated_at ? i.updated_at.split('T')[0] : ''),
          paymentMethod: i.payment_method || '',
          paymentNotes: i.payment_notes || '',
          payments: i.payments || [],
          items: []
        };
      }) || [];

      await this.buildKpis();
      this.buildReports();
    } catch (e) {
      console.error('Error fetching finance data:', e);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  async toggleInvoice(id?: string) {
    if (!id) return;
    if (this.expandedInvoiceId === id) {
      this.expandedInvoiceId = null;
      this.cdr.detectChanges();
    } else {
      this.expandedInvoiceId = id;
      this.cdr.detectChanges();
      try {
        const res = await firstValueFrom(this.financeService.getInvoiceDetails(id));
        const invIndex = this.invoices.findIndex(i => i.id === id);
        if (invIndex >= 0 && res?.invoice) {
           this.invoices[invIndex].items = res.invoice.items?.map((it: any) => {
             const qty = Number(it.quantity || 1);
             const uPrice = Number(it.unit_price || it.unitPrice || 0);
             return {
               ...it,
               serviceName: it.service_name || it.description || it.serviceName || 'Servicio',
               description: it.description !== it.service_name ? (it.description || '') : '',
               quantity: qty,
               unitPrice: uPrice,
               subtotal: Number(it.total_price || it.subtotal || (qty * uPrice))
             };
           }) || [];
        }
      } catch (e) {
        console.error('Error fetching invoice details:', e);
      } finally {
        this.cdr.detectChanges();
      }
    }
  }

  getClient(id?: string) {
    if (!id) return undefined;
    return this.clients.find(c => c.id === id);
  }
  setKpiPeriod(period: 'all' | 'this_month' | 'last_month') {
    this.kpiPeriod = period;
    const now = new Date();
    if (period === 'all') {
      this.invFilterStartDate = '';
      this.invFilterEndDate = '';
    } else if (period === 'this_month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      this.invFilterStartDate = `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2, '0')}-01`;
      this.invFilterEndDate = `${end.getFullYear()}-${String(end.getMonth()+1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
    } else if (period === 'last_month') {
      let y = now.getFullYear();
      let m = now.getMonth() - 1;
      if (m < 0) { m = 11; y--; }
      const start = new Date(y, m, 1);
      const end = new Date(y, m + 1, 0);
      this.invFilterStartDate = `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2, '0')}-01`;
      this.invFilterEndDate = `${end.getFullYear()}-${String(end.getMonth()+1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
    }
    this.buildKpis();
    this.cdr.detectChanges();
  }

  async buildKpis() {
    try {
      const filters = {
        search: this.invFilterCompany,
        min_price: this.invFilterMinPrice,
        max_price: this.invFilterMaxPrice,
        date_from: this.invFilterStartDate,
        date_to: this.invFilterEndDate
      };
      const dashboardRes = await firstValueFrom(this.financeService.getDashboard(filters));
      const kpi = dashboardRes?.kpis || {};
      
      this.kpis = [
        { label: 'Total Facturado', value: this.formatCOP(kpi.total_facturado || 0) },
        { label: 'Pagado', value: this.formatCOP(kpi.total_pagado || 0), color: 'text-emerald-500' },
        { label: 'Por Cobrar', value: this.formatCOP(kpi.total_por_cobrar || 0), color: 'text-amber-500' },
        { label: 'Clientes Facturados', value: String(kpi.clientes_facturados || 0) },
      ];

      this.recentInvoices = (dashboardRes?.ledger || []).map((i: any) => {
        const total = Number(i.total_amount || i.total || 0);
        const paid = Number(i.paid_amount || 0);
        const dueAt = i.due_date ? i.due_date.split('T')[0] : '';
        return {
          id: i.id,
          invoice_number: i.invoice_number || i.id,
          title: i.title || '',
          clientId: i.client_id,
          clientName: i.client_name,
          clientCompany: i.company || '',
          total: total,
          total_amount: total,
          paid_amount: paid,
          pending_amount: Math.max(0, total - paid),
          status: this.formatStatus(i.status, dueAt, paid, total),
          paidAt: i.paid_at ? i.paid_at.split('T')[0] : (i.updated_at ? i.updated_at.split('T')[0] : ''),
          paymentMethod: i.payment_method || '',
          paymentNotes: i.payment_notes || ''
        };
      });
    } catch (e) {
      console.error('Error building KPIs:', e);
    } finally {
      this.cdr.detectChanges();
    }
  }

  buildReports() {
    const paidInvoices = this.invoices.filter(i => (i.status === 'Pagada' || i.status === 'PAGADA') && i.paidAt);
    
    // Monthly Income (Inclusión de Abonos Parciales + Facturas Pagadas)
    const months: Record<string, number> = {};
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    // Initialize last 6 months
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const past = new Date(d.getFullYear(), d.getMonth() - i, 1);
      months[`${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, '0')}`] = 0;
    }

    this.invoices.forEach(inv => {
      if (inv.payments && inv.payments.length > 0) {
        inv.payments.forEach((pay: any) => {
          const payDate = pay.payment_date || inv.paidAt || inv.issuedAt;
          if (payDate) {
            const m = payDate.substring(0, 7); // YYYY-MM
            if (months[m] !== undefined) months[m] += Number(pay.amount || 0);
          }
        });
      } else if ((inv.status === 'Pagada' || inv.status === 'PAGADA') && inv.paidAt) {
        const m = inv.paidAt.substring(0, 7);
        if (months[m] !== undefined) months[m] += (inv.total || 0);
      }
    });

    const maxIncome = Math.max(...Object.values(months), 1);
    this.monthlyIncome = Object.keys(months).sort().map(k => {
      const [, m] = k.split('-');
      return {
        month: monthNames[parseInt(m, 10) - 1],
        amount: months[k],
        height: (months[k] / maxIncome) * 100
      };
    });

    // Service Income
    const srvMap: Record<string, number> = {};
    let totalPaid = 0;
    paidInvoices.forEach(inv => {
      totalPaid += inv.subtotal;
      (inv.items || []).forEach(item => {
        srvMap[item.serviceName || ''] = (srvMap[item.serviceName || ''] || 0) + (item.subtotal || 0);
      });
    });

    this.serviceIncome = Object.keys(srvMap)
      .map(k => ({ name: k, amount: srvMap[k], percent: totalPaid ? (srvMap[k] / totalPaid) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); // Top 5

    // Status Income
    let totalAll = 0;
    const statusMap: Record<string, { count: number; amount: number }> = {
      'Pagada': { count: 0, amount: 0 },
      'Parcial': { count: 0, amount: 0 },
      'Enviada': { count: 0, amount: 0 },
      'Vencida': { count: 0, amount: 0 },
      'Borrador': { count: 0, amount: 0 },
    };
    
    this.invoices.forEach(inv => {
      const stKey = statusMap[inv.status] ? inv.status : (inv.status === 'PARCIAL' ? 'Parcial' : (inv.status === 'PAGADA' ? 'Pagada' : (inv.status === 'ENVIADA' ? 'Enviada' : 'Borrador')));
      if (statusMap[stKey]) {
        statusMap[stKey].count++;
        statusMap[stKey].amount += (inv.total || 0);
        totalAll += (inv.total || 0);
      }
    });

    const colors: Record<string, string> = {
      'Pagada': 'bg-green-500',
      'Parcial': 'bg-emerald-400',
      'Enviada': 'bg-blue-500',
      'Vencida': 'bg-red-500',
      'Borrador': 'bg-neutral-500'
    };

    this.statusIncome = Object.keys(statusMap).map(k => ({
      status: k,
      count: statusMap[k].count,
      amount: statusMap[k].amount,
      colorClass: colors[k],
      width: totalAll ? (statusMap[k].amount / totalAll) * 100 : 0
    })).filter(s => s.count > 0);

    // Key Metrics (Recaudo Real con Abonos Incluidos)
    const totalBilled = (this.invoices || []).reduce((sum, inv) => sum + (inv.total || inv.total_amount || 0), 0);
    const totalRecaudado = (this.invoices || []).reduce((sum, inv) => {
      if (inv.status === 'Pagada' || inv.status === 'PAGADA') return sum + (inv.total || inv.total_amount || 0);
      return sum + (inv.paid_amount || 0);
    }, 0);

    this.keyMetrics = {
      collectionRate: totalBilled ? Math.min(100, Math.round((totalRecaudado / totalBilled) * 100)) : 0,
      overdueCount: statusMap['Vencida'] ? statusMap['Vencida'].count : 0,
      overdueAmount: statusMap['Vencida'] ? statusMap['Vencida'].amount : 0,
      avgInvoiceValue: this.invoices.length ? Math.round(totalBilled / this.invoices.length) : 0
    };
  }

  // ─── CLIENTS ───────────────────────────────
  openNewClient() { this.editingClient = { id: '', name: '', email: '', phone: '', company: '', notes: '', createdAt: new Date().toISOString().split('T')[0] }; this.showClientForm = true; this.cdr.detectChanges(); }
  editClient(c: Client) { this.editingClient = { ...c }; this.showClientForm = true; this.cdr.detectChanges(); }
  async saveClient() {
    if (!this.editingClient?.name || !this.editingClient?.email) {
      alert('Por favor completa los campos obligatorios (Nombre, Email).');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.editingClient.email)) {
      alert('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    // Phone validation and extension addition
    if (this.editingClient.phone) {
      let phone = this.editingClient.phone.trim();
      if (/^\d{10}$/.test(phone)) {
        phone = '+57 ' + phone;
      } else if (/^\d+$/.test(phone)) {
        phone = '+57 ' + phone;
      }
      
      const phoneRegex = /^\+?[0-9\s\-]+$/;
      if (!phoneRegex.test(phone)) {
        alert('Por favor, ingresa un número de celular válido.');
        return;
      }
      this.editingClient.phone = phone;
    }

    try {
      const isEdit = !!(this.editingClient?.id && this.editingClient.id !== '');
      await firstValueFrom(this.financeService.saveClient(this.editingClient as Client));
      this.showClientForm = false;
      this.refresh();
      this.showGadget(isEdit ? '¡Cliente actualizado con éxito!' : '¡Cliente creado con éxito!', isEdit ? 'edit' : 'create');
    } catch (e) {
      console.error(e);
      alert('Error al guardar cliente');
    } finally {
      this.cdr.detectChanges();
    }
  }
  async deleteClient(id: string) {
    if (confirm('¿Eliminar este cliente?')) {
      try {
        await firstValueFrom(this.financeService.deleteClient(id));
        this.refresh();
        this.showGadget('¡Cliente eliminado con éxito!', 'delete');
      } catch (e) {
        alert('Error al eliminar cliente. Puede tener facturas asociadas.');
      } finally {
        this.cdr.detectChanges();
      }
    }
  }
  getClientInvoiceCount(id?: string) {
    if (!id) return 0;
    return this.invoices.filter(i => i.clientId === id).length;
  }

  // ─── SERVICES ──────────────────────────────
  openNewService() { this.editingService = { id: '', name: '', description: '', unitPrice: 0, category: 'desarrollo' }; this.showServiceForm = true; this.cdr.detectChanges(); }
  editService(s: Service) { this.editingService = { ...s }; this.showServiceForm = true; this.cdr.detectChanges(); }
  async saveService() {
    if (!this.editingService?.name) {
      alert('El nombre del servicio es obligatorio.');
      return;
    }
    
    const price = this.editingService.unitPrice;
    if (price !== undefined && price !== null) {
      if (price < 0) {
        alert('El precio no puede ser negativo.');
        return;
      }
      if (!Number.isInteger(price)) {
        alert('El precio no puede contener decimales.');
        return;
      }
    }
    try {
      const isEdit = !!(this.editingService?.id && this.editingService.id !== '');
      await firstValueFrom(this.financeService.saveService(this.editingService as Service));
      this.showServiceForm = false;
      this.refresh();
      this.showGadget(isEdit ? '¡Servicio actualizado con éxito!' : '¡Servicio creado con éxito!', isEdit ? 'edit' : 'create');
    } catch (e) {
      console.error(e);
      alert('Error al guardar servicio');
    } finally {
      this.cdr.detectChanges();
    }
  }
  async deleteService(id: string) {
    if (confirm('¿Eliminar este servicio?')) {
      try {
        await firstValueFrom(this.financeService.deleteService(id));
        this.refresh();
        this.showGadget('¡Servicio eliminado con éxito!', 'delete');
      } catch (e) {
        alert('Error al eliminar servicio');
      } finally {
        this.cdr.detectChanges();
      }
    }
  }

  // ─── INVOICES ──────────────────────────────
  openNewInvoice() {
    const today = new Date().toISOString().split('T')[0];
    const due = new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().split('T')[0];
    this.editingInvoice = { id: '', title: '', clientId: '', clientName: '', clientEmail: '', items: [], subtotal: 0, taxRate: 0, taxAmount: 0, total: 0, status: 'Borrador', notes: '', issuedAt: today, dueAt: due };
    this.selectedClientId = '';
    this.serviceToAdd = '';
    this.showInvoiceForm = true;
    this.subTab = 'facturas';
    this.cdr.detectChanges();
  }
  async editInvoice(inv: Invoice) {
    this.subTab = 'facturas';
    this.editingInvoice = {
      ...inv,
      id: String(inv.id),
      title: inv.title || '',
      clientId: inv.clientId || inv.client_id || '',
      items: (inv.items || []).map(i => ({ ...i }))
    };
    this.selectedClientId = String(this.editingInvoice.clientId || '');
    this.showInvoiceForm = true;
    this.isLoading = true;
    this.cdr.detectChanges();
    try {
      const res = await firstValueFrom(this.financeService.getInvoiceDetails(inv.id!));
      if (res && res.invoice) {
        const rawInv: any = res.invoice;
        const subtotal = Number(rawInv.subtotal || 0);
        const taxAmount = Number(rawInv.tax_amount || rawInv.taxAmount || 0);
        const taxRate = subtotal > 0 && taxAmount > 0 ? Math.round((taxAmount / subtotal) * 100) : 0;
        
        this.editingInvoice = {
          ...inv,
          id: String(rawInv.id),
          title: rawInv.title !== null && rawInv.title !== undefined ? rawInv.title : (inv.title || ''),
          clientId: rawInv.client_id || inv.clientId,
          clientName: rawInv.client_name || inv.clientName,
          clientCompany: rawInv.company || inv.clientCompany,
          clientEmail: rawInv.email || inv.clientEmail,
          notes: rawInv.notes !== null && rawInv.notes !== undefined ? rawInv.notes : (inv.notes || ''),
          issuedAt: rawInv.issue_date ? rawInv.issue_date.split('T')[0] : inv.issuedAt,
          dueAt: rawInv.due_date ? rawInv.due_date.split('T')[0] : inv.dueAt,
          subtotal: subtotal,
          taxRate: taxRate,
          taxAmount: taxAmount,
          total: Number(rawInv.total_amount || rawInv.total || 0),
          items: (rawInv.items || []).map((it: any) => {
             const qty = Number(it.quantity || 1);
             const uPrice = Number(it.unit_price || it.unitPrice || 0);
             return {
               ...it,
               service_id: it.service_id ? String(it.service_id) : undefined,
               serviceName: it.service_name || it.description || it.serviceName || 'Servicio',
               description: it.description !== it.service_name ? (it.description || '') : '',
               quantity: qty,
               unitPrice: uPrice,
               unit_price: uPrice,
               subtotal: Number(it.total_price || it.subtotal || (qty * uPrice)),
               total_price: Number(it.total_price || it.subtotal || (qty * uPrice))
             };
          })
        };
        this.selectedClientId = String(this.editingInvoice.clientId || '');
        this.recalcInvoice();
      }
    } catch (e) {
      console.error('Error loading invoice details:', e);
    } finally {
      this.isLoading = false;
      this.serviceToAdd = '';
      this.cdr.detectChanges();
    }
  }
  onClientSelect() {
    const c = this.clients.find(cl => String(cl.id) === String(this.selectedClientId));
    if (c && this.editingInvoice) {
      this.editingInvoice.clientId = c.id;
      this.editingInvoice.clientName = c.name;
      this.editingInvoice.clientEmail = c.email;
      this.editingInvoice.clientCompany = c.company;
    }
  }
  addServiceToInvoice() {
    if (!this.serviceToAdd || !this.editingInvoice) return;
    const svc = this.allServices.find(s => String(s.id) === String(this.serviceToAdd));
    if (!svc) return;
    const item: InvoiceItem = { service_id: String(svc.id), serviceName: svc.name, description: svc.description, quantity: 1, unitPrice: svc.unitPrice || 0, unit_price: svc.unitPrice || 0, subtotal: svc.unitPrice || 0, total_price: svc.unitPrice || 0 };
    this.editingInvoice.items = [...(this.editingInvoice.items || []), item];
    this.serviceToAdd = '';
    this.recalcInvoice();
  }
  removeInvoiceItem(i: number) {
    this.editingInvoice!.items!.splice(i, 1);
    this.recalcInvoice();
  }
  recalcInvoice() {
    if (!this.editingInvoice) return;
    const items = this.editingInvoice.items || [];
    items.forEach(it => it.subtotal = (it.quantity || 1) * (it.unitPrice || it.unit_price || 0));
    const subtotal = items.reduce((a, it) => a + (it.subtotal || 0), 0);
    const taxRate = this.editingInvoice.taxRate || 0;
    const taxAmount = Math.round(subtotal * taxRate / 100);
    this.editingInvoice.subtotal = subtotal;
    this.editingInvoice.taxAmount = taxAmount;
    this.editingInvoice.total = subtotal + taxAmount;
  }
  async saveInvoice(status: Invoice['status']) {
    if (!this.editingInvoice?.clientId) { alert('Selecciona un cliente primero.'); return; }
    if (!this.editingInvoice?.items?.length) { alert('Agrega al menos un servicio.'); return; }
    
    for (const item of this.editingInvoice.items) {
      if (item.quantity === undefined || item.quantity < 1 || !Number.isInteger(item.quantity)) {
        alert(`La cantidad para el servicio "${item.serviceName}" debe ser un número entero mayor a 0.`);
        return;
      }
      if (item.unitPrice === undefined || item.unitPrice < 0 || !Number.isInteger(item.unitPrice)) {
        alert(`El precio unitario para el servicio "${item.serviceName}" no puede ser negativo ni contener decimales.`);
        return;
      }
    }

    if (this.editingInvoice.taxRate !== undefined && this.editingInvoice.taxRate !== null) {
        if (this.editingInvoice.taxRate < 0 || this.editingInvoice.taxRate > 100) {
            alert('El IVA debe estar entre 0 y 100.');
            return;
        }
    }

    const isEdit = !!(this.editingInvoice?.id && this.editingInvoice.id !== '');
    if (!isEdit) {
      const initialStatus = status === 'Pagada' ? 'Enviada' : status;
      this.editingInvoice.status = initialStatus;
    }
    try {
      const res = await firstValueFrom(this.financeService.saveInvoice(this.editingInvoice as Invoice));
      this.showInvoiceForm = false;
      this.refresh();
      if (status === 'Pagada' && res?.invoice) {
        this.openPaymentModal(res.invoice);
      } else {
        this.showGadget(isEdit ? '¡Cuenta de cobro actualizada con éxito!' : '¡Cuenta de cobro creada con éxito!', isEdit ? 'edit' : 'create');
      }
    } catch (e) {
      console.error(e);
      alert('Error al crear cuenta de cobro');
    } finally {
      this.cdr.detectChanges();
    }
  }
  async deleteInvoice(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar esta cuenta de cobro?')) {
      try {
        await firstValueFrom(this.financeService.deleteInvoice(id));
        this.refresh();
        this.showGadget('¡Cuenta de cobro eliminada con éxito!', 'delete');
      } catch (e) {
        console.error(e);
        alert('Error al eliminar la cuenta de cobro.');
      } finally {
        this.cdr.detectChanges();
      }
    }
  }
  async onStatusChange(inv: Invoice) {
    if (inv.status === 'Pagada') {
      this.openPaymentModal(inv);
      return;
    }
    try {
      await firstValueFrom(this.financeService.updateInvoiceStatus(inv.id!, inv.status));
      await this.refresh();
      this.showGadget('¡Estado de cuenta de cobro actualizado!', 'success');
    } catch (e) {
      alert('Error al actualizar estado');
    } finally {
      this.cdr.detectChanges();
    }
  }

  async downloadInvoicePdf(inv: Invoice) {
    this.pdfLoading = true;
    this.cdr.detectChanges();
    try {
      const res = await firstValueFrom(this.financeService.getInvoiceDetails(inv.id!));
      let fullInv = inv;
      if (res?.invoice) {
        const rawInv: any = res.invoice;
        const subtotal = Number(rawInv.subtotal || 0);
        const taxAmount = Number(rawInv.tax_amount || rawInv.taxAmount || 0);
        const taxRate = subtotal > 0 && taxAmount > 0 ? Math.round((taxAmount / subtotal) * 100) : 0;
        fullInv = {
          ...inv,
          id: String(rawInv.id),
          clientId: rawInv.client_id || inv.clientId,
          clientName: rawInv.client_name || inv.clientName,
          clientCompany: rawInv.company || inv.clientCompany,
          clientEmail: rawInv.email || inv.clientEmail,
          notes: rawInv.notes !== null && rawInv.notes !== undefined ? rawInv.notes : (inv.notes || ''),
          issuedAt: rawInv.issue_date ? rawInv.issue_date.split('T')[0] : inv.issuedAt,
          dueAt: rawInv.due_date ? rawInv.due_date.split('T')[0] : inv.dueAt,
          subtotal: subtotal,
          taxRate: taxRate,
          taxAmount: taxAmount,
          total: Number(rawInv.total_amount || rawInv.total || 0),
          items: (rawInv.items || []).map((it: any) => {
             const qty = Number(it.quantity || 1);
             const uPrice = Number(it.unit_price || it.unitPrice || 0);
             return {
               ...it,
               serviceName: it.service_name || it.description || it.serviceName || 'Servicio',
               description: it.description !== it.service_name ? (it.description || '') : '',
               quantity: qty,
               unitPrice: uPrice,
               subtotal: Number(it.total_price || it.subtotal || (qty * uPrice))
             };
          })
        };
      }
      await this.pdfService.downloadInvoicePdf(fullInv);
    } catch (e) {
      console.error(e);
      alert('Error descargando PDF');
    } finally { 
      this.pdfLoading = false; 
      this.cdr.detectChanges();
    }
  }

  getCountByStatus(statuses: string[]): number {
    return this.displayedInvoices.filter(i => statuses.includes(i.status)).length;
  }

  async downloadCascadeInvoices(statuses: string[]) {
    const toDownload = this.displayedInvoices.filter(i => statuses.includes(i.status));
    if (toDownload.length === 0) {
      alert('No hay cuentas de cobro con el/los estado(s) seleccionado(s) para descargar en la lista actual.');
      return;
    }
    this.batchLoading = true;
    this.batchLoadingStatus = statuses.length > 1 ? 'Ambas' : statuses[0];
    this.cdr.detectChanges();

    try {
      for (let i = 0; i < toDownload.length; i++) {
        const inv = toDownload[i];
        this.batchProgressText = `Descargando (${i + 1}/${toDownload.length})...`;
        this.cdr.detectChanges();

        try {
          const res = await firstValueFrom(this.financeService.getInvoiceDetails(inv.id!));
          let fullInv = inv;
          if (res?.invoice) {
            const rawInv: any = res.invoice;
            const subtotal = Number(rawInv.subtotal || 0);
            const taxAmount = Number(rawInv.tax_amount || rawInv.taxAmount || 0);
            const taxRate = subtotal > 0 && taxAmount > 0 ? Math.round((taxAmount / subtotal) * 100) : 0;
            fullInv = {
              ...inv,
              id: String(rawInv.id),
              clientId: rawInv.client_id || inv.clientId,
              clientName: rawInv.client_name || inv.clientName,
              clientCompany: rawInv.company || inv.clientCompany,
              clientEmail: rawInv.email || inv.clientEmail,
              notes: rawInv.notes !== null && rawInv.notes !== undefined ? rawInv.notes : (inv.notes || ''),
              issuedAt: rawInv.issue_date ? rawInv.issue_date.split('T')[0] : inv.issuedAt,
              dueAt: rawInv.due_date ? rawInv.due_date.split('T')[0] : inv.dueAt,
              subtotal: subtotal,
              taxRate: taxRate,
              taxAmount: taxAmount,
              total: Number(rawInv.total_amount || rawInv.total || 0),
              items: (rawInv.items || []).map((it: any) => {
                 const qty = Number(it.quantity || 1);
                 const uPrice = Number(it.unit_price || it.unitPrice || 0);
                 return {
                   ...it,
                   serviceName: it.service_name || it.description || it.serviceName || 'Servicio',
                   description: it.description !== it.service_name ? (it.description || '') : '',
                   quantity: qty,
                   unitPrice: uPrice,
                   subtotal: Number(it.total_price || it.subtotal || (qty * uPrice))
                 };
              })
            };
          }
          await this.pdfService.downloadInvoicePdf(fullInv);
          await new Promise(r => setTimeout(r, 600));
        } catch (e) {
          console.error(`Error descargando factura #${inv.id}:`, e);
        }
      }
    } finally {
      this.batchLoading = false;
      this.batchLoadingStatus = '';
      this.batchProgressText = '';
      this.cdr.detectChanges();
    }
  }

  async generatePreview() {
    if (!this.editingInvoice) return;
    this.pdfLoading = true;
    this.cdr.detectChanges();
    try {
      this.previewInvoiceTarget = this.editingInvoice as Invoice;
      const url = await this.pdfService.downloadInvoicePdf(this.editingInvoice as Invoice, 'bloburl');
      this.previewPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url as string);
      this.showPdfPreview = true;
    } catch (err) {
      console.error(err);
    } finally {
      this.pdfLoading = false;
      this.cdr.detectChanges();
    }
  }

  async downloadPreviewPdf() {
    if (!this.previewInvoiceTarget && !this.editingInvoice) return;
    const inv = this.previewInvoiceTarget || (this.editingInvoice as Invoice);
    this.pdfLoading = true;
    this.cdr.detectChanges();
    try {
      await this.pdfService.downloadInvoicePdf(inv, 'save');
    } catch (err) {
      console.error(err);
      alert('Error descargando PDF');
    } finally {
      this.pdfLoading = false;
      this.cdr.detectChanges();
    }
  }

  printPreviewPdf() {
    const iframe = document.querySelector('iframe[src*="blob:"]') as HTMLIFrameElement;
    try {
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        return;
      }
    } catch (e) {
      console.warn('Iframe print blocked, opening new window:', e);
    }
    if (this.previewInvoiceTarget || this.editingInvoice) {
      const inv = this.previewInvoiceTarget || (this.editingInvoice as Invoice);
      this.pdfService.downloadInvoicePdf(inv, 'bloburl').then(url => {
        if (typeof url === 'string') {
          const win = window.open(url, '_blank');
          if (win) {
            win.addEventListener('load', () => {
              win.focus();
              win.print();
            });
          }
        }
      });
    }
  }

  closePreview() {
    this.showPdfPreview = false;
    this.previewPdfUrl = null;
    this.previewInvoiceTarget = null;
    this.cdr.detectChanges();
  }

  // ─── HELPERS ───────────────────────────────
  formatCOP(v: number) { return this.financeService.formatCOP(v || 0); }

  formatCOPDisplay(v: number | null | undefined): string {
    const val = Math.max(0, Math.round(Number(v || 0)));
    const formatted = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(val);
    return `COP ${formatted}`;
  }

  getStatusClass(status: string): string {
    const st = String(status || '').toUpperCase();
    if (st === 'PAGADA' || st === 'PAGADO') {
      return this.isDark ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-emerald-200 bg-emerald-50 text-emerald-700';
    }
    if (st === 'PARCIAL' || st === 'ABONADA') {
      return this.isDark ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-300' : 'border-emerald-300 bg-emerald-100/60 text-emerald-800';
    }
    if (st === 'ENVIADA' || st === 'ENVIADO') {
      return this.isDark ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' : 'border-blue-200 bg-blue-50 text-blue-700';
    }
    if (st === 'VENCIDA' || st === 'VENCIDO') {
      return this.isDark ? 'border-rose-500/30 bg-rose-500/10 text-rose-400' : 'border-rose-200 bg-rose-50 text-rose-700';
    }
    return this.isDark ? 'border-neutral-700 bg-neutral-800 text-neutral-300' : 'border-neutral-200 bg-neutral-100 text-neutral-700';
  }

  getCategoryClass(cat?: string) {
    if (!cat) return 'bg-neutral-500/20 text-neutral-400';
    const map: Record<string, string> = {
      desarrollo: 'bg-blue-500/20 text-blue-400',
      diseño: 'bg-purple-500/20 text-purple-400',
      marketing: 'bg-orange-500/20 text-orange-400',
      consultoria: 'bg-teal-500/20 text-teal-400',
      otro: 'bg-neutral-500/20 text-neutral-400',
    };
    return map[cat] || 'bg-neutral-500/20 text-neutral-400';
  }
}

