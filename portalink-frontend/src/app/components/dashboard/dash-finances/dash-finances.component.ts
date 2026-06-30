import { Component, Input, OnInit, inject } from '@angular/core';
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
      <div class="flex items-start justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.3em]"
             [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Gestión Financiera</p>
          <h2 class="text-4xl font-bold uppercase tracking-tight mt-0.5"
              [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Finanzas</h2>
        </div>
        <button *ngIf="subTab === 'facturas'" (click)="openNewInvoice()"
                class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer"
                [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-900 text-white hover:bg-neutral-700'">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Nueva Cuenta de Cobro
        </button>
        <button *ngIf="subTab === 'clientes'" (click)="openNewClient()"
                class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer"
                [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-900 text-white hover:bg-neutral-700'">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo Cliente
        </button>
        <button *ngIf="subTab === 'servicios'" (click)="openNewService()"
                class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer"
                [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-900 text-white hover:bg-neutral-700'">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo Servicio
        </button>
      </div>

      <!-- Sub-tabs -->
      <div class="flex gap-1 rounded-xl p-1 border"
           [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-100 border-neutral-200'">
        <button *ngFor="let t of subTabs" (click)="subTab = t.id"
                class="flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-200 cursor-pointer"
                [ngClass]="subTab === t.id
                  ? (isDark ? 'bg-white text-black' : 'bg-neutral-900 text-white')
                  : (isDark ? 'text-neutral-500 hover:text-neutral-200' : 'text-neutral-400 hover:text-neutral-700')">
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
          <div *ngFor="let kpi of kpis" class="relative rounded-xl border p-5 overflow-hidden group"
               [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'">
            <p class="text-[10px] font-bold uppercase tracking-widest mb-2"
               [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">{{ kpi.label }}</p>
            <p class="text-2xl lg:text-3xl font-bold leading-tight" [ngClass]="kpi.color || (isDark ? 'text-white' : 'text-neutral-900')">{{ kpi.value }}</p>
          </div>
        </div>

        <!-- Recent invoices (Ledger style) -->
        <div class="rounded-2xl border overflow-hidden mt-6"
             [ngClass]="isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-white border-neutral-200'">
          <div class="px-5 py-4 border-b flex items-center justify-between"
               [ngClass]="isDark ? 'bg-neutral-950/50 border-neutral-800' : 'bg-neutral-50 border-neutral-200'">
            <h3 class="text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">
              <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Últimos Movimientos
            </h3>
            <button (click)="subTab = 'facturas'" class="text-[10px] font-bold uppercase tracking-widest cursor-pointer border px-3 py-1 rounded-md transition-colors"
                    [ngClass]="isDark ? 'border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-800' : 'border-neutral-300 text-neutral-500 hover:text-black hover:bg-neutral-100'">
              Ver Ledger →
            </button>
          </div>
          <div class="divide-y" [ngClass]="isDark ? 'divide-neutral-800/50' : 'divide-neutral-100'">
            <ng-container *ngFor="let inv of recentInvoices">
              <div (click)="toggleInvoice(inv.id)" class="grid grid-cols-12 px-5 py-3 items-center group cursor-pointer transition-colors"
                   [ngClass]="isDark ? 'hover:bg-neutral-800/40' : 'hover:bg-neutral-50'">
                <div class="col-span-3 flex items-center gap-2">
                  <span class="text-xs font-bold" [ngClass]="isDark ? 'text-neutral-500 group-hover:text-neutral-300' : 'text-neutral-400 group-hover:text-neutral-600'">{{ inv.id }}</span>
                </div>
                <div class="col-span-3">
                  <p class="text-xs font-bold uppercase tracking-widest truncate" [ngClass]="isDark ? 'text-neutral-300' : 'text-neutral-700'">{{ inv.clientName }}</p>
                </div>
                <div class="col-span-3 text-right">
                  <span class="text-sm font-bold" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ formatCOP(inv.total || 0) }}</span>
                </div>
                <div class="col-span-3 flex justify-end items-center gap-2">
                  <span class="text-xs" [ngClass]="inv.status === 'Pagada' ? 'text-emerald-500' : (inv.status === 'Enviada' ? 'text-blue-500' : 'text-amber-500')">
                    {{ inv.status === 'Pagada' ? '▲' : (inv.status === 'Enviada' ? '►' : '▼') }}
                  </span>
                  <span class="text-[9px] font-bold uppercase px-2 py-0.5 rounded-sm border" 
                        [ngClass]="inv.status === 'Pagada' ? (isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600') : (inv.status === 'Vencida' ? (isDark ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-600') : (isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-400' : 'bg-neutral-100 border-neutral-200 text-neutral-600'))">
                    {{ inv.status }}
                  </span>
                  <svg class="w-3 h-3 ml-2 transition-transform duration-200" [ngClass]="expandedInvoiceId === inv.id ? 'rotate-180 text-white' : (isDark ? 'text-neutral-500 group-hover:text-white' : 'text-neutral-400 group-hover:text-black')" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
                </div>
              </div>
              
              <!-- Expanded View -->
              <div *ngIf="expandedInvoiceId === inv.id" class="px-5 py-4 border-t-0 border-b overflow-hidden"
                   [ngClass]="isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-neutral-50 border-neutral-200'">
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div>
                      <p class="text-[10px] font-bold uppercase tracking-widest mb-1.5" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Datos del Cliente</p>
                      <p class="text-sm font-semibold uppercase tracking-wide" [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">{{ getClient(inv.clientId)?.name }}</p>
                      <p class="text-xs uppercase tracking-widest mt-0.5" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">{{ getClient(inv.clientId)?.company || 'Independiente' }}</p>
                      <p class="text-xs mt-1" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-600'">{{ getClient(inv.clientId)?.email }} &nbsp;•&nbsp; {{ getClient(inv.clientId)?.phone || 'Sin teléfono' }}</p>
                    </div>
                    <div class="flex md:justify-end">
                      <button (click)="downloadInvoicePdf(inv)" [disabled]="pdfLoading" class="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border transition-colors cursor-pointer flex items-center gap-2"
                              [ngClass]="isDark ? 'border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800 disabled:opacity-50' : 'border-neutral-300 text-neutral-600 hover:text-black hover:bg-neutral-100 disabled:opacity-50'">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                        </svg>
                        {{ pdfLoading ? 'Generando...' : 'Descargar Cuenta de Cobro' }}
                      </button>
                    </div>
                 </div>
              </div>
            </ng-container>
            <div *ngIf="recentInvoices.length === 0" class="px-5 py-8 text-center text-xs"
                 [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'">
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
              <input [type]="f.type" [(ngModel)]="$any(editingClient)![f.key]" [placeholder]="f.placeholder"
                     class="w-full px-3 py-2.5 rounded-xl text-sm border outline-none transition-all duration-200 focus:ring-2"
                     [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-600 focus:border-neutral-500 focus:ring-neutral-700' : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:ring-neutral-200'">
            </div>
            <div class="md:col-span-2 flex flex-col gap-1.5">
              <label class="text-xs font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Notas</label>
              <textarea [(ngModel)]="editingClient!.notes" rows="2" placeholder="Observaciones del cliente..."
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
        <!-- Form -->
        <div *ngIf="showServiceForm" class="rounded-2xl border p-6 space-y-4"
             [ngClass]="isDark ? 'bg-neutral-900 border-neutral-700' : 'bg-neutral-50 border-neutral-300'">
          <h3 class="text-sm font-bold uppercase tracking-wide" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
            {{ editingService?.id ? 'Editar Servicio' : 'Nuevo Servicio' }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5 md:col-span-2">
              <label class="text-xs font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Nombre *</label>
              <input type="text" [(ngModel)]="editingService!.name" placeholder="Nombre del servicio"
                     class="w-full px-3 py-2.5 rounded-xl text-sm border outline-none" [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-600' : 'bg-white border-neutral-300 text-neutral-900'">
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Categoría</label>
              <select [(ngModel)]="editingService!.category"
                      class="w-full px-3 py-2.5 rounded-xl text-sm border outline-none cursor-pointer"
                      [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'">
                <option value="desarrollo">Desarrollo</option>
                <option value="diseño">Diseño</option>
                <option value="marketing">Marketing</option>
                <option value="consultoria">Consultoría</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Precio Unitario (COP) *</label>
              <input type="number" [(ngModel)]="editingService!.unitPrice" placeholder="0"
                     class="w-full px-3 py-2.5 rounded-xl text-sm border outline-none" [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-600' : 'bg-white border-neutral-300 text-neutral-900'">
            </div>
            <div class="flex flex-col gap-1.5 md:col-span-2">
              <label class="text-xs font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Descripción</label>
              <textarea [(ngModel)]="editingService!.description" rows="2" placeholder="Descripción del servicio..."
                        class="w-full px-3 py-2.5 rounded-xl text-sm border outline-none resize-none"
                        [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-600' : 'bg-white border-neutral-300 text-neutral-900'"></textarea>
            </div>
          </div>
          <div class="flex gap-3 justify-end">
            <button (click)="showServiceForm = false" class="px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest border cursor-pointer"
                    [ngClass]="isDark ? 'border-neutral-700 text-neutral-400 hover:text-white' : 'border-neutral-300 text-neutral-500 hover:text-neutral-900'">Cancelar</button>
            <button (click)="saveService()" class="px-5 py-2 rounded-xl text-sm font-bold uppercase tracking-widest cursor-pointer"
                    [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-900 text-white hover:bg-neutral-700'">Guardar</button>
          </div>
        </div>

        <!-- Category filter -->
        <div class="flex gap-2 flex-wrap">
          <button *ngFor="let cat of serviceCategories" (click)="filterCategory = cat.id"
                  class="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer border"
                  [ngClass]="filterCategory === cat.id
                    ? (isDark ? 'bg-white text-black border-white' : 'bg-neutral-900 text-white border-neutral-900')
                    : (isDark ? 'border-neutral-700 text-neutral-400 hover:border-neutral-500' : 'border-neutral-300 text-neutral-500 hover:border-neutral-400')">
            {{ cat.label }}
          </button>
        </div>

        <!-- Services grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div *ngFor="let s of filteredServices" class="rounded-2xl border p-5 flex flex-col gap-3"
               [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
            <div class="flex items-start justify-between gap-2">
              <div class="flex-grow min-w-0">
                <span class="text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-full mb-2 inline-block"
                      [ngClass]="getCategoryClass(s.category)">{{ s.category }}</span>
                <h4 class="text-sm font-bold leading-snug" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ s.name }}</h4>
                <p class="text-xs mt-1 leading-relaxed" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">{{ s.description }}</p>
              </div>
              <div class="flex gap-1 flex-shrink-0">
                <button (click)="editService(s)" class="p-1.5 rounded-lg cursor-pointer" [ngClass]="isDark ? 'text-neutral-500 hover:text-white hover:bg-neutral-800' : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100'">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </button>
                <button (click)="deleteService(s.id!)" class="p-1.5 rounded-lg cursor-pointer" [ngClass]="isDark ? 'text-neutral-500 hover:text-red-400 hover:bg-red-900/20' : 'text-neutral-400 hover:text-red-600 hover:bg-red-50'">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>
            <div class="mt-auto pt-3 border-t flex items-center justify-between"
                 [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-100'">
              <span class="text-xs font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Precio base</span>
              <span class="text-base font-bold" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ formatCOP(s.unitPrice || 0) }}</span>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- ══════════════════ FACTURAS ══════════════════ -->
      <ng-container *ngIf="subTab === 'facturas'">

        <!-- New Invoice Form -->
        <div *ngIf="showInvoiceForm" class="rounded-2xl border p-6 space-y-5"
             [ngClass]="isDark ? 'bg-neutral-900 border-neutral-700' : 'bg-neutral-50 border-neutral-300'">
          <h3 class="text-sm font-bold uppercase tracking-wide" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
            {{ editingInvoice?.id ? 'Editar Cuenta #' + editingInvoice?.id : 'Nueva Cuenta de Cobro' }}
          </h3>

          <!-- Client + dates -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Cliente *</label>
              <select [(ngModel)]="selectedClientId" (change)="onClientSelect()" class="w-full px-3 py-2.5 rounded-xl text-sm border outline-none cursor-pointer"
                      [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'">
                <option value="">— Seleccionar cliente —</option>
                <option *ngFor="let c of clients" [value]="c.id">{{ c.name }}{{ c.company ? ' · ' + c.company : '' }}</option>
              </select>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Fecha de emisión</label>
              <input type="date" [(ngModel)]="editingInvoice!.issuedAt" class="w-full px-3 py-2.5 rounded-xl text-sm border outline-none"
                     [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'">
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Fecha de vencimiento</label>
              <input type="date" [(ngModel)]="editingInvoice!.dueAt" class="w-full px-3 py-2.5 rounded-xl text-sm border outline-none"
                     [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'">
            </div>
          </div>

          <!-- Add services -->
          <div>
            <label class="text-xs font-bold uppercase tracking-widest block mb-2" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Agregar Servicios</label>
            <div class="flex gap-2">
              <select [(ngModel)]="serviceToAdd" class="flex-grow px-3 py-2.5 rounded-xl text-sm border outline-none cursor-pointer"
                      [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'">
                <option value="">— Seleccionar servicio del catálogo —</option>
                <option *ngFor="let s of allServices" [value]="s.id">{{ s.name }} ({{ formatCOP(s.unitPrice || 0) }})</option>
              </select>
              <button (click)="addServiceToInvoice()" class="px-4 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest cursor-pointer shrink-0"
                      [ngClass]="isDark ? 'bg-neutral-700 text-white hover:bg-neutral-600' : 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300'">
                + Agregar
              </button>
            </div>
          </div>

          <!-- Invoice items table -->
          <div *ngIf="editingInvoice!.items?.length" class="rounded-xl border overflow-hidden"
               [ngClass]="isDark ? 'border-neutral-700' : 'border-neutral-200'">
            <div class="grid grid-cols-12 px-4 py-2 text-[10px] font-bold uppercase tracking-widest"
                 [ngClass]="isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-100 text-neutral-400'">
              <span class="col-span-5">Servicio</span>
              <span class="col-span-2 text-center">Cant.</span>
              <span class="col-span-2 text-right">P. Unitario</span>
              <span class="col-span-2 text-right">Subtotal</span>
              <span class="col-span-1"></span>
            </div>
            <div *ngFor="let item of editingInvoice!.items; let i = index" class="grid grid-cols-12 px-4 py-3 items-center border-t"
                 [ngClass]="isDark ? 'border-neutral-700' : 'border-neutral-200'">
              <div class="col-span-5">
                <p class="text-sm font-semibold" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ item.serviceName }}</p>
                <input type="text" [(ngModel)]="item.description" placeholder="Descripción adicional..."
                       class="text-xs mt-0.5 w-full bg-transparent border-0 outline-none"
                       [ngClass]="isDark ? 'text-neutral-500 placeholder-neutral-700' : 'text-neutral-400 placeholder-neutral-300'"
                       (change)="recalcInvoice()">
              </div>
              <div class="col-span-2 flex justify-center">
                <input type="number" [(ngModel)]="item.quantity" min="1" (change)="recalcInvoice()"
                       class="w-14 text-center px-2 py-1 rounded-lg text-sm border outline-none"
                       [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'">
              </div>
              <div class="col-span-2 flex justify-end">
                <input type="number" [(ngModel)]="item.unitPrice" (change)="recalcInvoice()"
                       class="w-28 text-right px-2 py-1 rounded-lg text-sm border outline-none"
                       [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'">
              </div>
              <div class="col-span-2 text-right">
                <span class="text-sm font-bold" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ formatCOP(item.subtotal || 0) }}</span>
              </div>
              <div class="col-span-1 flex justify-end">
                <button (click)="removeInvoiceItem(i)" class="p-1 rounded cursor-pointer" [ngClass]="isDark ? 'text-neutral-600 hover:text-red-400' : 'text-neutral-400 hover:text-red-500'">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Totals + tax + notes -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Notas / Términos de pago</label>
              <textarea [(ngModel)]="editingInvoice!.notes" rows="3" placeholder="Ej: Pago a 15 días, transferencia bancaria..."
                        class="w-full px-3 py-2.5 rounded-xl text-sm border outline-none resize-none"
                        [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-600' : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400'"></textarea>
            </div>
            <div class="rounded-xl border p-4 space-y-3"
                 [ngClass]="isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'">
              <div class="flex justify-between text-sm">
                <span [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">Subtotal</span>
                <span class="font-semibold" [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">{{ formatCOP(editingInvoice!.subtotal || 0) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-2">
                  <span [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">IVA</span>
                  <input type="number" [(ngModel)]="editingInvoice!.taxRate" min="0" max="100" (change)="recalcInvoice()"
                         class="w-14 text-center px-2 py-0.5 rounded-lg text-xs border outline-none"
                         [ngClass]="isDark ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-neutral-100 border-neutral-300 text-neutral-900'">
                  <span [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">%</span>
                </div>
                <span class="font-semibold" [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">{{ formatCOP(editingInvoice!.taxAmount || 0) }}</span>
              </div>
              <div class="border-t pt-3 flex justify-between"
                   [ngClass]="isDark ? 'border-neutral-700' : 'border-neutral-200'">
                <span class="text-sm font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Total</span>
                <span class="text-lg font-bold" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ formatCOP(editingInvoice!.total || 0) }}</span>
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
            <button (click)="saveInvoice('Borrador')" class="px-5 py-2 rounded-xl text-sm font-bold uppercase tracking-widest border cursor-pointer"
                    [ngClass]="isDark ? 'border-neutral-600 text-neutral-300 hover:bg-neutral-800' : 'border-neutral-300 text-neutral-600 hover:bg-neutral-100'">Guardar Borrador</button>
            <button (click)="saveInvoice('Enviada')" class="px-5 py-2 rounded-xl text-sm font-bold uppercase tracking-widest cursor-pointer"
                    [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-900 text-white hover:bg-neutral-700'">Guardar y Marcar como Enviada</button>
          </div>
        </div>

        <!-- PDF Preview Modal -->
        <div *ngIf="showPdfPreview" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div class="w-full max-w-4xl h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl border"
               [ngClass]="isDark ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-neutral-300'">
            <div class="px-4 py-3 border-b flex justify-between items-center" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
              <h3 class="text-sm font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Vista Previa de Cuenta de Cobro</h3>
              <button (click)="closePreview()" class="p-1 rounded-lg transition-colors cursor-pointer"
                      [ngClass]="isDark ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-neutral-500 hover:text-black hover:bg-neutral-100'">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div class="flex-grow bg-neutral-800/20 relative">
              <iframe *ngIf="previewPdfUrl" [src]="previewPdfUrl" class="w-full h-full border-0"></iframe>
            </div>
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

        <!-- Invoice list -->
        <div class="rounded-2xl border overflow-hidden"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <div class="grid grid-cols-12 px-5 py-3 text-[10px] font-bold uppercase tracking-widest border-b"
               [ngClass]="isDark ? 'border-neutral-800 text-neutral-500' : 'border-neutral-200 text-neutral-400'">
            <span class="col-span-2">ID</span>
            <span class="col-span-3">Cliente</span>
            <span class="col-span-2 text-right">Total</span>
            <span class="col-span-2 text-center">Estado</span>
            <span class="col-span-2">Vencimiento</span>
            <span class="col-span-1"></span>
          </div>
          <div class="divide-y" [ngClass]="isDark ? 'divide-neutral-800' : 'divide-neutral-100'">
            <div *ngFor="let inv of displayedInvoices" class="grid grid-cols-12 px-5 py-4 items-center"
                 [ngClass]="isDark ? 'hover:bg-neutral-800/30' : 'hover:bg-neutral-50'">
              <div class="col-span-2">
                <span class="text-xs font-bold font-mono" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">{{ inv.id }}</span>
              </div>
              <div class="col-span-3">
                <p class="text-sm font-semibold truncate" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ inv.clientName }}</p>
                <p class="text-xs truncate" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">{{ inv.clientCompany }}</p>
              </div>
              <div class="col-span-2 text-right">
                <span class="text-sm font-bold" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ formatCOP(inv.total || 0) }}</span>
              </div>
              <div class="col-span-2 flex justify-center">
                <select [(ngModel)]="inv.status" (change)="onStatusChange(inv)"
                        class="text-[10px] font-bold uppercase px-2 py-1 rounded-full border-0 outline-none cursor-pointer"
                        [ngClass]="getStatusClass(inv.status)">
                  <option value="Borrador">Borrador</option>
                  <option value="Enviada">Enviada</option>
                  <option value="Pagada">Pagada</option>
                  <option value="Vencida">Vencida</option>
                </select>
              </div>
              <div class="col-span-2">
                <span class="text-xs" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">{{ inv.dueAt | date:'dd MMM yyyy' }}</span>
              </div>
              <div class="col-span-1 flex justify-end gap-1">
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

    </div>
  `,
  styles: [`
    .tab-enter { animation: tabEnter 0.25s ease-out forwards; }
    @keyframes tabEnter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes ticker { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
    .animate-ticker { animation: ticker 25s linear infinite; }
  `]
})
export class DashFinancesComponent implements OnInit {
  @Input() theme = 'dark';

  private financeService = inject(FinanceService);
  private pdfService = inject(PdfReportService);
  private sanitizer = inject(DomSanitizer);

  get isDark() { return this.theme === 'dark'; }

  subTab: SubTab = 'resumen';
  showPdfPreview = false;
  previewPdfUrl: SafeResourceUrl | null = null;
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
  expandedInvoiceId: string | null = null;
  kpiPeriod: 'all' | 'this_month' | 'last_month' = 'all';

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
         if (!i.clientCompany?.toLowerCase().includes(term) && !(i.clientName || '').toLowerCase().includes(term)) {
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
    try {
      const [clientsRes, servicesRes, invoicesRes] = await Promise.all([
        firstValueFrom(this.financeService.getClients()),
        firstValueFrom(this.financeService.getServices()),
        firstValueFrom(this.financeService.getInvoices())
      ]);

      this.clients = clientsRes.clients.map((c: any) => ({ ...c, createdAt: c.created_at })) || [];
      this.allServices = servicesRes.services.map((s: any) => ({ ...s, unitPrice: Number(s.price) })) || [];
      this.invoices = invoicesRes.invoices.map((i: any) => ({
        id: i.id,
        clientId: i.client_id,
        clientName: i.client_name,
        total: Number(i.total_amount),
        subtotal: Number(i.subtotal),
        status: i.status === 'DRAFT' ? 'Borrador' : (i.status === 'ENVIADA' ? 'Enviada' : (i.status === 'PAGADA' ? 'Pagada' : 'Vencida')),
        issuedAt: i.issue_date ? i.issue_date.split('T')[0] : '',
        dueAt: i.due_date ? i.due_date.split('T')[0] : '',
        paidAt: i.updated_at ? i.updated_at.split('T')[0] : '',
        items: []
      })) || [];

      this.buildKpis();
      this.buildReports();
    } catch (e) {
      console.error('Error fetching finance data:', e);
    } finally {
      this.isLoading = false;
    }
  }

  async toggleInvoice(id?: string) {
    if (!id) return;
    if (this.expandedInvoiceId === id) {
      this.expandedInvoiceId = null;
    } else {
      this.expandedInvoiceId = id;
      try {
        const res = await firstValueFrom(this.financeService.getInvoiceDetails(id));
        const invIndex = this.invoices.findIndex(i => i.id === id);
        if (invIndex >= 0 && res?.invoice) {
           this.invoices[invIndex].items = res.invoice.items?.map((it: any) => ({
             ...it,
             serviceName: it.description, // fallback if no name joined
             unitPrice: Number(it.unit_price),
             subtotal: Number(it.total_price)
           })) || [];
        }
      } catch (e) {
        console.error('Error fetching invoice details:', e);
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

      this.recentInvoices = (dashboardRes?.ledger || []).map((i: any) => ({
        id: i.id,
        clientId: i.client_id,
        clientName: i.client_name,
        total: Number(i.total_amount),
        status: i.status === 'DRAFT' ? 'Borrador' : (i.status === 'ENVIADA' ? 'Enviada' : (i.status === 'PAGADA' ? 'Pagada' : 'Vencida'))
      }));
    } catch (e) {
      console.error('Error building KPIs:', e);
    }
  }

  buildReports() {
    const paidInvoices = this.invoices.filter(i => i.status === 'Pagada' && i.paidAt);
    
    // Monthly Income
    const months: Record<string, number> = {};
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    // Initialize last 6 months
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const past = new Date(d.getFullYear(), d.getMonth() - i, 1);
      months[`${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, '0')}`] = 0;
    }

    paidInvoices.forEach(inv => {
      const m = inv.paidAt!.substring(0, 7); // YYYY-MM
      if (months[m] !== undefined) months[m] += (inv.total || 0);
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
      'Enviada': { count: 0, amount: 0 },
      'Vencida': { count: 0, amount: 0 },
      'Borrador': { count: 0, amount: 0 },
    };
    
    this.invoices.forEach(inv => {
      if (statusMap[inv.status]) {
        statusMap[inv.status].count++;
        statusMap[inv.status].amount += (inv.total || 0);
        totalAll += (inv.total || 0);
      }
    });

    const colors: Record<string, string> = {
      'Pagada': 'bg-green-500',
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

    // Key Metrics
    const paidAmount = statusMap['Pagada'].amount;
    const expectedTotal = statusMap['Pagada'].amount + statusMap['Enviada'].amount + statusMap['Vencida'].amount;
    this.keyMetrics = {
      collectionRate: expectedTotal ? Math.round((paidAmount / expectedTotal) * 100) : 0,
      overdueCount: statusMap['Vencida'].count,
      overdueAmount: statusMap['Vencida'].amount,
      avgInvoiceValue: this.invoices.length ? Math.round(totalAll / this.invoices.length) : 0
    };
  }

  // ─── CLIENTS ───────────────────────────────
  openNewClient() { this.editingClient = { id: '', name: '', email: '', phone: '', company: '', notes: '', createdAt: new Date().toISOString().split('T')[0] }; this.showClientForm = true; }
  editClient(c: Client) { this.editingClient = { ...c }; this.showClientForm = true; }
  async saveClient() {
    if (!this.editingClient?.name || !this.editingClient?.email) return;
    try {
      await firstValueFrom(this.financeService.saveClient(this.editingClient as Client));
      this.showClientForm = false;
      this.refresh();
    } catch (e) {
      console.error(e);
      alert('Error al guardar cliente');
    }
  }
  async deleteClient(id: string) {
    if (confirm('¿Eliminar este cliente?')) {
      try {
        await firstValueFrom(this.financeService.deleteClient(id));
        this.refresh();
      } catch (e) {
        alert('Error al eliminar cliente. Puede tener facturas asociadas.');
      }
    }
  }
  getClientInvoiceCount(id?: string) {
    if (!id) return 0;
    return this.invoices.filter(i => i.clientId === id).length;
  }

  // ─── SERVICES ──────────────────────────────
  openNewService() { this.editingService = { id: '', name: '', description: '', unitPrice: 0, category: 'desarrollo' }; this.showServiceForm = true; }
  editService(s: Service) { this.editingService = { ...s }; this.showServiceForm = true; }
  async saveService() {
    if (!this.editingService?.name) return;
    try {
      await firstValueFrom(this.financeService.saveService(this.editingService as Service));
      this.showServiceForm = false;
      this.refresh();
    } catch (e) {
      console.error(e);
      alert('Error al guardar servicio');
    }
  }
  async deleteService(id: string) {
    if (confirm('¿Eliminar este servicio?')) {
      try {
        await firstValueFrom(this.financeService.deleteService(id));
        this.refresh();
      } catch (e) {
        alert('Error al eliminar servicio');
      }
    }
  }

  // ─── INVOICES ──────────────────────────────
  openNewInvoice() {
    const today = new Date().toISOString().split('T')[0];
    const due = new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().split('T')[0];
    this.editingInvoice = { id: '', clientId: '', clientName: '', clientEmail: '', items: [], subtotal: 0, taxRate: 0, taxAmount: 0, total: 0, status: 'Borrador', notes: '', issuedAt: today, dueAt: due };
    this.selectedClientId = '';
    this.serviceToAdd = '';
    this.showInvoiceForm = true;
    this.subTab = 'facturas';
  }
  editInvoice(inv: Invoice) {
    this.editingInvoice = { ...inv, items: (inv.items || []).map(i => ({ ...i })) };
    this.selectedClientId = inv.clientId || '';
    this.serviceToAdd = '';
    this.showInvoiceForm = true;
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
    this.editingInvoice.status = status;
    try {
      await firstValueFrom(this.financeService.saveInvoice(this.editingInvoice as Invoice));
      this.showInvoiceForm = false;
      this.refresh();
    } catch (e) {
      console.error(e);
      alert('Error al crear cuenta de cobro');
    }
  }
  deleteInvoice(id: string) {
    alert('Esta función aún no está disponible por seguridad.');
  }
  async onStatusChange(inv: Invoice) {
    try {
      await firstValueFrom(this.financeService.updateInvoiceStatus(inv.id!, inv.status));
      this.buildKpis();
    } catch (e) {
      alert('Error al actualizar estado');
    }
  }

  async downloadInvoicePdf(inv: Invoice) {
    this.pdfLoading = true;
    try {
      const res = await firstValueFrom(this.financeService.getInvoiceDetails(inv.id!));
      let fullInv = inv;
      if (res?.invoice) {
        const rawInv: any = res.invoice;
        fullInv = {
          ...inv,
          notes: rawInv.notes || inv.notes,
          clientName: rawInv.client_name || inv.clientName,
          clientCompany: rawInv.company || inv.clientCompany,
          clientEmail: rawInv.email || inv.clientEmail,
          issuedAt: rawInv.issue_date ? rawInv.issue_date.split('T')[0] : inv.issuedAt,
          dueAt: rawInv.due_date ? rawInv.due_date.split('T')[0] : inv.dueAt,
          subtotal: Number(rawInv.subtotal),
          total: Number(rawInv.total_amount),
          items: (rawInv.items || []).map((it: any) => ({
             ...it,
             serviceName: it.description,
             unitPrice: Number(it.unit_price),
             subtotal: Number(it.total_price)
          }))
        };
      }
      await this.pdfService.downloadInvoicePdf(fullInv);
    } catch (e) {
      console.error(e);
      alert('Error descargando PDF');
    } finally { 
      this.pdfLoading = false; 
    }
  }

  async generatePreview() {
    if (!this.editingInvoice) return;
    this.pdfLoading = true;
    try {
      const url = await this.pdfService.downloadInvoicePdf(this.editingInvoice as Invoice, 'bloburl');
      this.previewPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url as string);
      this.showPdfPreview = true;
    } catch (err) {
      console.error(err);
    } finally {
      this.pdfLoading = false;
    }
  }

  closePreview() {
    this.showPdfPreview = false;
    this.previewPdfUrl = null;
  }

  // ─── HELPERS ───────────────────────────────
  formatCOP(v: number) { return this.financeService.formatCOP(v || 0); }

  getStatusClass(status: string) {
    const map: Record<string, string> = {
      'Borrador': 'bg-neutral-500/20 text-neutral-400',
      'Enviada': 'bg-blue-500/20 text-blue-400',
      'Pagada': 'bg-green-500/20 text-green-400',
      'Vencida': 'bg-red-500/20 text-red-400',
    };
    return map[status] || 'bg-neutral-500/20 text-neutral-400';
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

