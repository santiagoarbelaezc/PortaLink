import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AnalyticsService, SystemMetrics } from '../../../services/analytics.service';
import { PortfolioConfigService } from '../../../services/portfolio-config.service';
import { PdfReportService } from '../../../services/pdf-report.service';
import { ReportsService, ActivityLog } from '../../../services/reports.service';
import { AuthService } from '../../../services/auth.service';
import { FinanceService } from '../../../services/finance.service';
import { MessagesService } from '../../../services/messages.service';
import { firstValueFrom } from 'rxjs';

export type PdfType = 'finance' | 'analytics' | 'users' | 'health' | 'contacts';

@Component({
  selector: 'app-dash-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 tab-enter font-sans">

      <!-- ══════════════════════════════════════
           HEADER & EXECUTIVE CONTROLS
      ══════════════════════════════════════ -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5"
           [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <p class="text-xs font-headline font-semibold uppercase tracking-[0.25em]"
               [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Módulo de Exportación & Auditoría</p>
          </div>
          <h2 class="text-2xl sm:text-3xl font-headline font-bold tracking-tight mt-1"
              [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
            Reportes Ejecutivos & PDFs
          </h2>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <button (click)="refreshData()"
                  class="px-4 py-2 rounded-full text-xs font-headline font-semibold uppercase tracking-wider border transition-all duration-300 cursor-pointer flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                  [ngClass]="isDark ? 'border-neutral-700 text-neutral-200 hover:bg-neutral-800 bg-neutral-900/60' : 'border-neutral-200 text-neutral-800 bg-neutral-100 hover:bg-neutral-200'">
            <svg class="w-3.5 h-3.5 opacity-70" [class.animate-spin]="isLoading" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span>Sincronizar Datos</span>
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
           REAL METRICS KPI GRID
      ══════════════════════════════════════ -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

        <!-- 1. Módulos Disponibles -->
        <div class="rounded-[24px] border p-6 space-y-3 relative overflow-hidden transition-all duration-300 group hover:border-neutral-500 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80'">
          <div class="flex items-center justify-between">
            <span class="text-xs font-headline font-semibold uppercase tracking-wider opacity-60">Informes Oficiales</span>
            <span class="text-[10px] font-headline font-semibold px-2.5 py-0.5 rounded-full border border-red-500/30 text-red-400 bg-red-500/10 tracking-wider">
              5 Módulos
            </span>
          </div>
          <div class="space-y-1">
            <p class="text-xl sm:text-2xl font-headline font-bold tracking-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              PDF Premium
            </p>
            <p class="text-xs opacity-50 font-normal">Estilo oficial tipo cuenta de cobro</p>
          </div>
          <div class="pt-2">
            <div class="w-full bg-neutral-800/60 rounded-full h-1.5 overflow-hidden">
              <div class="bg-red-500 h-1.5 rounded-full" style="width: 100%"></div>
            </div>
          </div>
        </div>

        <!-- 2. Rendimiento Promedio -->
        <div class="rounded-[24px] border p-6 space-y-3 relative overflow-hidden transition-all duration-300 group hover:border-neutral-500 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80'">
          <div class="flex items-center justify-between">
            <span class="text-xs font-headline font-semibold uppercase tracking-wider opacity-60">Velocidad Promedio</span>
            <span class="text-[10px] font-headline font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 tracking-wider">
              Óptimo
            </span>
          </div>
          <div class="space-y-1">
            <p class="text-xl sm:text-2xl font-headline font-bold tracking-tight text-emerald-400">
              {{ loadAvg }} ms
            </p>
            <p class="text-xs opacity-50 font-normal">Mín: {{ loadMin }}ms | Máx: {{ loadMax }}ms</p>
          </div>
          <div class="pt-2">
            <div class="w-full bg-neutral-800/60 rounded-full h-1.5 overflow-hidden">
              <div class="bg-emerald-400 h-1.5 rounded-full" [style.width.%]="loadAvg > 0 ? Math.min(100, Math.max(10, 100 - (loadAvg / 30))) : 90"></div>
            </div>
          </div>
        </div>

        <!-- 3. Salud del Sistema -->
        <div class="rounded-[24px] border p-6 space-y-3 relative overflow-hidden transition-all duration-300 group hover:border-neutral-500 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80'">
          <div class="flex items-center justify-between">
            <span class="text-xs font-headline font-semibold uppercase tracking-wider opacity-60">Score de Salud</span>
            <span class="text-[10px] font-headline font-semibold px-2.5 py-0.5 rounded-full border border-blue-500/30 text-blue-400 bg-blue-500/10 tracking-wider">
              En Vivo
            </span>
          </div>
          <div class="space-y-1">
            <p class="text-xl sm:text-2xl font-headline font-bold tracking-tight text-blue-400">
              {{ healthScore }}%
            </p>
            <p class="text-xs opacity-50 font-normal">{{ healthStatus }}</p>
          </div>
          <div class="pt-2">
            <div class="w-full bg-neutral-800/60 rounded-full h-1.5 overflow-hidden">
              <div class="bg-blue-500 h-1.5 rounded-full transition-all duration-700" [style.width.%]="healthScore"></div>
            </div>
          </div>
        </div>

        <!-- 4. Auditoría de Eventos -->
        <div class="rounded-[24px] border p-6 space-y-3 relative overflow-hidden transition-all duration-300 group hover:border-neutral-500 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80'">
          <div class="flex items-center justify-between">
            <span class="text-xs font-headline font-semibold uppercase tracking-wider opacity-60">Log Registrados</span>
            <span class="text-[10px] font-headline font-semibold px-2.5 py-0.5 rounded-full border border-neutral-700 text-neutral-300 bg-neutral-800/40 tracking-wider">
              Auditoría
            </span>
          </div>
          <div class="space-y-1">
            <p class="text-xl sm:text-2xl font-headline font-bold tracking-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              {{ activityLog.length }}
            </p>
            <p class="text-xs opacity-50 font-normal">Eventos del sistema guardados</p>
          </div>
          <div class="pt-2">
            <svg class="w-full h-7 stroke-current text-red-500/40 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 100 25">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M0 22 L 25 15 L 50 18 L 75 5 L 100 2" />
            </svg>
          </div>
        </div>

      </div>

      <!-- ══════════════════════════════════════
           PDF EXPORT SELECTION PANEL (5 REAL MODULES)
      ══════════════════════════════════════ -->
      <div class="rounded-[28px] border p-6 sm:p-7 space-y-5 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
           [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80'">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4"
             [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
          <div>
            <h3 class="text-base font-headline font-bold uppercase tracking-wide"
                [ngClass]="isDark ? 'text-neutral-100' : 'text-neutral-900'">Generador de Reportes PDF Oficiales</h3>
            <p class="text-xs mt-0.5 opacity-60">
              Genera informes formales con datos reales sincronizados en tiempo real
            </p>
          </div>
          <div *ngIf="pdfLoading" class="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold animate-pulse bg-red-500/10 text-red-400 border border-red-500/20">
            <span class="w-2 h-2 rounded-full bg-red-400"></span>
            <span>Generando PDF...</span>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          <!-- 1. PDF: Finanzas -->
          <button (click)="previewPdf('finance')"
                  [disabled]="pdfLoading"
                  class="flex flex-col items-start p-4 rounded-2xl border text-xs font-headline font-bold transition-all duration-300 cursor-pointer group hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  [ngClass]="currentPdfType === 'finance' ? 'border-red-500 bg-red-500/10 text-red-400 shadow-md' : (isDark ? 'border-neutral-800 text-neutral-300 hover:border-neutral-600 bg-neutral-900/40' : 'border-neutral-200 text-neutral-700 hover:border-neutral-400 bg-neutral-50')">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-colors"
                 [ngClass]="currentPdfType === 'finance' ? 'bg-red-500/20 text-red-400' : (isDark ? 'bg-neutral-800 text-neutral-300 group-hover:bg-neutral-700' : 'bg-neutral-200/80 text-neutral-800 group-hover:bg-neutral-300')">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-3l3 3 3-3M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22" />
              </svg>
            </div>
            <span class="text-xs uppercase tracking-wider font-bold">Finanzas</span>
            <span class="text-[10px] font-normal opacity-50 mt-1">ARR, MRR & Facturas</span>
          </button>

          <!-- 2. PDF: Analíticas -->
          <button (click)="previewPdf('analytics')"
                  [disabled]="pdfLoading"
                  class="flex flex-col items-start p-4 rounded-2xl border text-xs font-headline font-bold transition-all duration-300 cursor-pointer group hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  [ngClass]="currentPdfType === 'analytics' ? 'border-red-500 bg-red-500/10 text-red-400 shadow-md' : (isDark ? 'border-neutral-800 text-neutral-300 hover:border-neutral-600 bg-neutral-900/40' : 'border-neutral-200 text-neutral-700 hover:border-neutral-400 bg-neutral-50')">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-colors"
                 [ngClass]="currentPdfType === 'analytics' ? 'bg-red-500/20 text-red-400' : (isDark ? 'bg-neutral-800 text-neutral-300 group-hover:bg-neutral-700' : 'bg-neutral-200/80 text-neutral-800 group-hover:bg-neutral-300')">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <span class="text-xs uppercase tracking-wider font-bold">Analíticas</span>
            <span class="text-[10px] font-normal opacity-50 mt-1">Tráfico & Secciones</span>
          </button>

          <!-- 3. PDF: Usuarios -->
          <button (click)="previewPdf('users')"
                  [disabled]="pdfLoading"
                  class="flex flex-col items-start p-4 rounded-2xl border text-xs font-headline font-bold transition-all duration-300 cursor-pointer group hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  [ngClass]="currentPdfType === 'users' ? 'border-red-500 bg-red-500/10 text-red-400 shadow-md' : (isDark ? 'border-neutral-800 text-neutral-300 hover:border-neutral-600 bg-neutral-900/40' : 'border-neutral-200 text-neutral-700 hover:border-neutral-400 bg-neutral-50')">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-colors"
                 [ngClass]="currentPdfType === 'users' ? 'bg-red-500/20 text-red-400' : (isDark ? 'bg-neutral-800 text-neutral-300 group-hover:bg-neutral-700' : 'bg-neutral-200/80 text-neutral-800 group-hover:bg-neutral-300')">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <span class="text-xs uppercase tracking-wider font-bold">Usuarios</span>
            <span class="text-[10px] font-normal opacity-50 mt-1">Cuentas & Roles</span>
          </button>

          <!-- 4. PDF: Salud del Sistema -->
          <button (click)="previewPdf('health')"
                  [disabled]="pdfLoading"
                  class="flex flex-col items-start p-4 rounded-2xl border text-xs font-headline font-bold transition-all duration-300 cursor-pointer group hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  [ngClass]="currentPdfType === 'health' ? 'border-red-500 bg-red-500/10 text-red-400 shadow-md' : (isDark ? 'border-neutral-800 text-neutral-300 hover:border-neutral-600 bg-neutral-900/40' : 'border-neutral-200 text-neutral-700 hover:border-neutral-400 bg-neutral-50')">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-colors"
                 [ngClass]="currentPdfType === 'health' ? 'bg-red-500/20 text-red-400' : (isDark ? 'bg-neutral-800 text-neutral-300 group-hover:bg-neutral-700' : 'bg-neutral-200/80 text-neutral-800 group-hover:bg-neutral-300')">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <span class="text-xs uppercase tracking-wider font-bold">Salud del Sist.</span>
            <span class="text-[10px] font-normal opacity-50 mt-1">Latencia & Audit</span>
          </button>

          <!-- 5. PDF: Contactos & Mensajes -->
          <button (click)="previewPdf('contacts')"
                  [disabled]="pdfLoading"
                  class="flex flex-col items-start p-4 rounded-2xl border text-xs font-headline font-bold transition-all duration-300 cursor-pointer group hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  [ngClass]="currentPdfType === 'contacts' ? 'border-red-500 bg-red-500/10 text-red-400 shadow-md' : (isDark ? 'border-neutral-800 text-neutral-300 hover:border-neutral-600 bg-neutral-900/40' : 'border-neutral-200 text-neutral-700 hover:border-neutral-400 bg-neutral-50')">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-colors"
                 [ngClass]="currentPdfType === 'contacts' ? 'bg-red-500/20 text-red-400' : (isDark ? 'bg-neutral-800 text-neutral-300 group-hover:bg-neutral-700' : 'bg-neutral-200/80 text-neutral-800 group-hover:bg-neutral-300')">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <span class="text-xs uppercase tracking-wider font-bold">Contactos</span>
            <span class="text-[10px] font-normal opacity-50 mt-1">Bandeja & Envíos</span>
          </button>

        </div>
      </div>

      <!-- ══════════════════════════════════════
           PDF VIEWER IFRAME WITH ACTION BAR
      ══════════════════════════════════════ -->
      <div *ngIf="pdfUrl" class="rounded-[28px] border overflow-hidden flex flex-col transition-all duration-500 shadow-2xl animate-fadeIn"
           [ngClass]="isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-200 bg-white'">
        
        <div class="px-6 py-4 border-b flex justify-between items-center"
             [ngClass]="isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-neutral-50 border-neutral-200'">
          <div class="flex items-center gap-3">
            <span class="w-3 h-3 rounded-full bg-red-500"></span>
            <h3 class="text-xs font-headline font-bold uppercase tracking-wider"
                [ngClass]="isDark ? 'text-neutral-100' : 'text-neutral-900'">
              Previsualización de Documento PDF: <span class="text-red-400 font-bold ml-1">{{ currentPdfName }}</span>
            </h3>
          </div>
          
          <div class="flex items-center gap-3">
            <button (click)="closeViewer()" 
                    class="text-xs font-headline font-semibold uppercase tracking-wider px-3.5 py-2 rounded-xl border transition-all cursor-pointer"
                    [ngClass]="isDark ? 'border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-800' : 'border-neutral-200 text-neutral-600 hover:text-black hover:bg-neutral-100'">
              Cerrar
            </button>
            <button (click)="downloadCurrentPdf()"
                    class="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-headline font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98]"
                    [ngClass]="isDark ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-red-600 hover:bg-red-700 text-white'">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span>Descargar PDF</span>
            </button>
          </div>
        </div>

        <iframe [src]="pdfUrl" class="w-full h-[650px] border-none bg-neutral-200/10"></iframe>
      </div>

      <!-- ══════════════════════════════════════
           EXECUTIVE SUMMARY & RAW DATA EXPORT
      ══════════════════════════════════════ -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">

        <!-- Executive Summary Cards -->
        <div class="lg:col-span-8 rounded-[28px] border p-6 sm:p-7 space-y-5 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80'">
          <h3 class="text-xs font-headline font-bold uppercase tracking-wider"
              [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Resumen Sintético del Sistema</h3>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div *ngFor="let s of executiveSummary; trackBy: trackBySummary"
                 class="rounded-2xl p-4 text-center border transition-all hover:border-neutral-500"
                 [ngClass]="isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200/60'">
              <p class="text-2xl sm:text-3xl font-headline font-bold" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ s.value }}</p>
              <p class="text-[10px] uppercase tracking-widest font-headline font-semibold mt-1.5 opacity-60">{{ s.label }}</p>
            </div>
          </div>
        </div>

        <!-- Raw Exports -->
        <div class="lg:col-span-4 rounded-[28px] border p-6 space-y-4 shadow-[0_10px_35px_rgba(0,0,0,0.03)] flex flex-col justify-between"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80'">
          <div>
            <h3 class="text-xs font-headline font-bold uppercase tracking-wider mb-1"
                [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Exportación Técnica (JSON)</h3>
            <p class="text-xs opacity-50">Descarga de estructuras crudas de datos</p>
          </div>

          <div class="space-y-3">
            <button (click)="exportAnalytics()"
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-headline font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer border hover:scale-[1.01]"
                    [ngClass]="isDark ? 'bg-white text-black border-white hover:bg-neutral-200' : 'bg-black text-white border-black hover:bg-neutral-800'">
              <svg class="w-4 h-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span>Métricas (analytics.json)</span>
            </button>

            <button (click)="exportConfig()"
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-headline font-semibold uppercase tracking-wider border transition-all duration-200 cursor-pointer hover:scale-[1.01]"
                    [ngClass]="isDark ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800 bg-neutral-900/60' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-100 bg-neutral-50'">
              <svg class="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 13.5l3 3m0 0l3-3m-3 3v-6m1.06-4.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
              <span>Portfolio (portfolio.json)</span>
            </button>
          </div>
        </div>

      </div>

      <!-- ══════════════════════════════════════
           ACTIVITY LOG & LOAD TIME STATS
      ══════════════════════════════════════ -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        <!-- Activity Log (7 of 12 cols) -->
        <div class="lg:col-span-7 rounded-[28px] border p-6 space-y-4 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80'">
          <div class="flex items-center justify-between border-b pb-3" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
            <h3 class="text-xs font-headline font-bold uppercase tracking-wider"
                [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Auditoría & Log de Actividad</h3>
            <span class="text-[10px] font-mono opacity-50">Últimos registros</span>
          </div>

          <div class="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-1">
            <div *ngFor="let log of activityLog; trackBy: trackByLog" class="flex items-start gap-3.5">
              <div class="w-8 h-8 rounded-xl flex items-center justify-center border shrink-0"
                   [ngClass]="isDark ? 'bg-neutral-800/80 border-neutral-700 text-neutral-300' : 'bg-neutral-100 border-neutral-200 text-neutral-600'">
                <svg class="w-4 h-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="min-w-0 flex-grow pt-0.5">
                <p class="text-xs font-headline font-bold truncate" [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">{{ log.label }}</p>
                <p class="text-[10px] opacity-50 tracking-wide mt-0.5 font-mono">{{ log.date }}</p>
              </div>
            </div>
            <div *ngIf="activityLog.length === 0" class="py-8 text-center text-xs opacity-50">
              No se registran eventos de actividad aún.
            </div>
          </div>
        </div>

        <!-- Load Times Bar Chart (5 of 12 cols) -->
        <div class="lg:col-span-5 rounded-[28px] border p-6 space-y-4 shadow-[0_10px_35px_rgba(0,0,0,0.03)] flex flex-col justify-between"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80'">
          <div>
            <div class="flex items-center justify-between border-b pb-3" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
              <h3 class="text-xs font-headline font-bold uppercase tracking-wider"
                  [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Tiempos de Respuesta</h3>
              <span class="text-[10px] font-bold text-emerald-400">{{ loadAvg }}ms Promedio</span>
            </div>
            <p class="text-xs opacity-50 mt-2">Muestras de latencia de carga en milisegundos</p>
          </div>

          <div *ngIf="loadTimes.length > 0; else noTimes" class="pt-2">
            <div class="flex items-end gap-1.5 h-24">
              <div *ngFor="let t of loadTimes; trackBy: trackByTime"
                   class="flex-1 rounded-t-lg transition-all duration-500 hover:opacity-100 cursor-pointer"
                   [style.height.%]="loadMax > 0 ? Math.max(12, (t / loadMax) * 100) : 10"
                   [ngClass]="t < 1000 ? 'bg-emerald-500/70' : (t < 2000 ? 'bg-blue-500/70' : 'bg-red-500/70')"
                   [title]="t + ' ms'"></div>
            </div>
          </div>

          <ng-template #noTimes>
            <div class="py-8 text-center text-xs opacity-50">
              No hay mediciones de latencia disponibles.
            </div>
          </ng-template>
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
export class DashReportsComponent implements OnInit {
  @Input() theme = 'light';

  private analyticsService = inject(AnalyticsService);
  private configService = inject(PortfolioConfigService);
  private pdfService = inject(PdfReportService);
  private reportsService = inject(ReportsService);
  private authService = inject(AuthService);
  private financeService = inject(FinanceService);
  private messagesService = inject(MessagesService);
  private sanitizer = inject(DomSanitizer);

  Math = Math;

  metrics!: SystemMetrics;
  executiveSummary: { label: string; value: any }[] = [];
  loadTimes: number[] = [];
  loadMin = 0; loadMax = 0; loadAvg = 0;

  isLoading = false;
  pdfLoading = false;

  toastMessage = '';
  toastType: 'success' | 'error' | 'info' = 'success';

  pdfUrl: SafeResourceUrl | null = null;
  currentPdfType: PdfType | null = null;
  currentPdfName: string = '';

  activityLog: ActivityLog[] = [];

  get isDark() { return this.theme === 'dark'; }

  get healthScore(): number {
    if (this.loadAvg === 0) return 100;
    if (this.loadAvg < 1000) return 98;
    if (this.loadAvg < 2000) return 82;
    if (this.loadAvg < 3000) return 65;
    return 45;
  }

  get healthStatus(): string {
    const score = this.healthScore;
    if (score >= 90) return 'Excelente rendimiento';
    if (score >= 75) return 'Rendimiento adecuado';
    if (score >= 50) return 'Latencia moderada';
    return 'Revisión recomendada';
  }

  ngOnInit() {
    this.refreshData();
  }

  showToast(msg: string, type: 'success' | 'error' | 'info' = 'success') {
    this.toastMessage = msg;
    this.toastType = type;
    setTimeout(() => {
      if (this.toastMessage === msg) this.toastMessage = '';
    }, 3500);
  }

  refreshData() {
    this.isLoading = true;
    this.analyticsService.getMetrics().subscribe({
      next: (m) => {
        this.metrics = m;
        this.buildSummary();
        this.buildLoadStats();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading metrics', err);
        this.isLoading = false;
      }
    });

    this.loadLogs();
  }

  private loadLogs() {
    this.reportsService.getLogs().subscribe({
      next: (logs) => this.activityLog = logs || [],
      error: (err) => console.error('Error loading activity logs', err)
    });
  }

  private trackExport(label: string) {
    this.reportsService.logActivity('export', label).subscribe({
      next: (newLog) => {
        this.activityLog = [newLog, ...this.activityLog];
      }
    });
  }

  private buildSummary() {
    if (!this.metrics) return;
    const totalSectionViews = Object.values(this.metrics.sectionViews || {}).reduce((a, b) => a + b, 0);
    const totalLinkClicks = Object.values(this.metrics.linktreeClicks || {}).reduce((a, b) => a + b, 0);
    this.executiveSummary = [
      { label: 'Vistas del Home', value: this.metrics.homeViews || 0 },
      { label: 'Vistas Linktree', value: this.metrics.linktreeViews || 0 },
      { label: 'Total Secciones', value: totalSectionViews },
      { label: 'Clics Enlaces', value: totalLinkClicks },
    ];
  }

  private buildLoadStats() {
    this.loadTimes = this.metrics?.loadTimes || [];
    if (!this.loadTimes.length) return;
    this.loadMin = Math.min(...this.loadTimes);
    this.loadMax = Math.max(...this.loadTimes);
    this.loadAvg = Math.round(this.loadTimes.reduce((a, b) => a + b, 0) / this.loadTimes.length);
  }

  exportAnalytics() {
    const data = JSON.stringify(this.metrics, null, 2);
    const url = 'data:text/json;charset=utf-8,' + encodeURIComponent(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portalink_analytics.json';
    a.click();
    this.trackExport('Métricas JSON exportadas');
    this.showToast('Métricas exportadas en formato JSON');
  }

  exportConfig() {
    this.configService.exportJSON();
    this.trackExport('portfolio.json exportado');
    this.showToast('Portfolio exportado correctamente');
  }

  closeViewer() {
    this.pdfUrl = null;
    this.currentPdfType = null;
  }

  async previewPdf(type: PdfType) {
    this.pdfLoading = true;
    this.currentPdfType = type;
    
    let rawUrl: string | void = undefined;
    try {
      if (type === 'finance') {
        this.currentPdfName = 'Informe Financiero Oficial';
        const rawSummary: any = await firstValueFrom(this.financeService.getControlSummary()).catch(() => null);
        const summary = rawSummary?.summary || rawSummary || {};
        const rawTx: any = await firstValueFrom(this.financeService.getTransactions()).catch(() => []);
        const transactions = Array.isArray(rawTx) ? rawTx : (rawTx?.transactions || []);
        const rawInv: any = await firstValueFrom(this.financeService.getInvoices()).catch(() => []);
        const invoices = Array.isArray(rawInv) ? rawInv : (rawInv?.invoices || []);
        rawUrl = await this.pdfService.downloadFinancialReport(summary, transactions, invoices, 'bloburl');
      } else if (type === 'analytics') {
        this.currentPdfName = 'Informe de Analíticas del Sitio';
        rawUrl = await this.pdfService.downloadAnalyticsReport(this.metrics, 'bloburl');
      } else if (type === 'users') {
        this.currentPdfName = 'Listado de Usuarios Registrados';
        let users: any[] = [];
        try {
          users = await firstValueFrom(this.authService.getUsers());
        } catch (err) {
          console.error('Error loading users for PDF', err);
        }
        rawUrl = await this.pdfService.downloadUsersReport(users, 'bloburl');
      } else if (type === 'health') {
        this.currentPdfName = 'Informe de Salud del Sistema';
        const legacyActivityLog = (this.activityLog || []).map(log => ({
          icon: '⚙️', label: log.label, date: log.date
        }));
        rawUrl = await this.pdfService.downloadSystemHealthReport(this.metrics, legacyActivityLog, 'bloburl');
      } else if (type === 'contacts') {
        this.currentPdfName = 'Informe de Mensajes y Contactos';
        let messages: any[] = [];
        try {
          messages = await firstValueFrom(this.messagesService.getMessages());
        } catch (err) {
          console.error('Error loading messages for PDF', err);
        }
        rawUrl = await this.pdfService.downloadContactsReport(messages, 'bloburl');
      }

      if (rawUrl) {
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
        this.showToast(`Previsualización cargada: ${this.currentPdfName}`, 'info');
      }
    } catch (err) {
      console.error('Error previewing PDF', err);
      this.showToast('Error al generar la previsualización del PDF', 'error');
    } finally {
      this.pdfLoading = false;
    }
  }

  async downloadCurrentPdf() {
    if (!this.currentPdfType) return;
    this.pdfLoading = true;
    try {
      if (this.currentPdfType === 'finance') {
        const rawSummary: any = await firstValueFrom(this.financeService.getControlSummary()).catch(() => null);
        const summary = rawSummary?.summary || rawSummary || {};
        const rawTx: any = await firstValueFrom(this.financeService.getTransactions()).catch(() => []);
        const transactions = Array.isArray(rawTx) ? rawTx : (rawTx?.transactions || []);
        const rawInv: any = await firstValueFrom(this.financeService.getInvoices()).catch(() => []);
        const invoices = Array.isArray(rawInv) ? rawInv : (rawInv?.invoices || []);
        await this.pdfService.downloadFinancialReport(summary, transactions, invoices, 'save');
      } else if (this.currentPdfType === 'analytics') {
        await this.pdfService.downloadAnalyticsReport(this.metrics, 'save');
      } else if (this.currentPdfType === 'users') {
        let users: any[] = [];
        try {
          users = await firstValueFrom(this.authService.getUsers());
        } catch (err) {
          console.error('Error loading users for PDF', err);
        }
        await this.pdfService.downloadUsersReport(users, 'save');
      } else if (this.currentPdfType === 'health') {
        const legacyActivityLog = (this.activityLog || []).map(log => ({
          icon: '⚙️', label: log.label, date: log.date
        }));
        await this.pdfService.downloadSystemHealthReport(this.metrics, legacyActivityLog, 'save');
      } else if (this.currentPdfType === 'contacts') {
        let messages: any[] = [];
        try {
          messages = await firstValueFrom(this.messagesService.getMessages());
        } catch (err) {
          console.error('Error loading messages for PDF', err);
        }
        await this.pdfService.downloadContactsReport(messages, 'save');
      }

      this.trackExport(`Reporte PDF: ${this.currentPdfName}`);
      this.showToast(`Descargando ${this.currentPdfName}...`);
    } catch (err) {
      console.error('Error downloading PDF', err);
      this.showToast('Error al descargar el PDF', 'error');
    } finally {
      this.pdfLoading = false;
    }
  }

  trackBySummary(index: number, s: any): string {
    return s.label || index.toString();
  }

  trackByLog(index: number, log: ActivityLog): any {
    return log.label ? log.label + '_' + index : index;
  }

  trackByTime(index: number, t: number): number {
    return index;
  }
}
