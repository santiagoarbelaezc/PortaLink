import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AnalyticsService, SystemMetrics } from '../../../services/analytics.service';
import { PortfolioConfigService } from '../../../services/portfolio-config.service';
import { PdfReportService } from '../../../services/pdf-report.service';

interface ActivityLog {
  iconType: 'config' | 'message' | 'lead' | 'update' | 'export';
  label: string;
  date: string;
}

@Component({
  selector: 'app-dash-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 tab-enter">

      <!-- Header -->
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.3em]"
           [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Resumen y Exportación</p>
        <h2 class="text-4xl font-bold uppercase tracking-tight mt-0.5"
            [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">Reportes</h2>
      </div>

      <!-- ══════════════════════════════════════
           PDF EXPORT SECTION (MOVED TO TOP)
      ══════════════════════════════════════ -->
      <div class="rounded-2xl border p-6"
           [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
        <div class="mb-5 flex justify-between items-end">
          <div>
            <h3 class="text-sm font-bold uppercase tracking-wide"
                [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Generación de Reportes PDF</h3>
            <p class="text-xs mt-1" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">
              Previsualiza y descarga los informes oficiales de la plataforma
            </p>
          </div>
          <p *ngIf="pdfLoading" class="text-xs font-bold animate-pulse"
             [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">⏳ Generando PDF...</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- PDF: Analytics -->
          <button (click)="previewPdf('analytics')"
                  [disabled]="pdfLoading"
                  class="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest border transition-all duration-200 cursor-pointer group"
                  [ngClass]="currentPdfType === 'analytics' ? (isDark ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-red-500 bg-red-50 text-red-600') : (isDark ? 'border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200' : 'border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-900')">
            <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                 [ngClass]="currentPdfType === 'analytics' ? (isDark ? 'bg-red-500/20' : 'bg-red-200') : (isDark ? 'bg-neutral-800 group-hover:bg-neutral-700' : 'bg-neutral-100 group-hover:bg-neutral-200')">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <span class="flex-grow text-left">Analíticas</span>
          </button>

          <!-- PDF: Users -->
          <button (click)="previewPdf('users')"
                  [disabled]="pdfLoading"
                  class="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest border transition-all duration-200 cursor-pointer group"
                  [ngClass]="currentPdfType === 'users' ? (isDark ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-red-500 bg-red-50 text-red-600') : (isDark ? 'border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200' : 'border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-900')">
            <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                 [ngClass]="currentPdfType === 'users' ? (isDark ? 'bg-red-500/20' : 'bg-red-200') : (isDark ? 'bg-neutral-800 group-hover:bg-neutral-700' : 'bg-neutral-100 group-hover:bg-neutral-200')">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <span class="flex-grow text-left">Usuarios</span>
          </button>

          <!-- PDF: System Health -->
          <button (click)="previewPdf('health')"
                  [disabled]="pdfLoading"
                  class="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest border transition-all duration-200 cursor-pointer group"
                  [ngClass]="currentPdfType === 'health' ? (isDark ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-red-500 bg-red-50 text-red-600') : (isDark ? 'border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200' : 'border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-900')">
            <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                 [ngClass]="currentPdfType === 'health' ? (isDark ? 'bg-red-500/20' : 'bg-red-200') : (isDark ? 'bg-neutral-800 group-hover:bg-neutral-700' : 'bg-neutral-100 group-hover:bg-neutral-200')">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <span class="flex-grow text-left">Salud del Sist.</span>
          </button>
        </div>
      </div>

      <!-- ══════════════════════════════════════
           PDF VIEWER IFRAME
      ══════════════════════════════════════ -->
      <div *ngIf="pdfUrl" class="rounded-2xl border overflow-hidden flex flex-col transition-all duration-500"
           [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
        
        <div class="px-5 py-4 border-b flex justify-between items-center"
             [ngClass]="isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-neutral-50 border-neutral-200'">
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5" [ngClass]="isDark ? 'text-red-400' : 'text-red-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <h3 class="text-sm font-bold uppercase tracking-wide"
                [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Visor de Reporte: {{ currentPdfName }}</h3>
          </div>
          
          <div class="flex items-center gap-3">
            <button (click)="closeViewer()" 
                    class="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors"
                    [ngClass]="isDark ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-neutral-500 hover:text-black hover:bg-neutral-200'">
              Cerrar
            </button>
            <button (click)="downloadCurrentPdf()"
                    class="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer"
                    [ngClass]="isDark ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-red-600 hover:bg-red-700 text-white'">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descargar
            </button>
          </div>
        </div>

        <iframe [src]="pdfUrl" class="w-full h-[600px] border-none bg-neutral-200/20"></iframe>
      </div>

      <!-- Executive Summary -->
      <div class="rounded-2xl border p-6 md:p-8"
           [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
        <h3 class="text-sm font-bold uppercase tracking-wide mb-5"
            [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Resumen Ejecutivo</h3>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div *ngFor="let s of executiveSummary"
               class="rounded-xl p-4 text-center"
               [ngClass]="isDark ? 'bg-neutral-800/60' : 'bg-neutral-50'">
            <p class="text-4xl font-bold" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">{{ s.value }}</p>
            <p class="text-[10px] uppercase tracking-widest font-bold mt-1.5"
               [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">{{ s.label }}</p>
          </div>
        </div>
      </div>

      <!-- Export Buttons + Activity Log row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <!-- Exports -->
        <div class="rounded-2xl border p-6 space-y-4"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <h3 class="text-sm font-bold uppercase tracking-wide"
              [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Exportar Datos</h3>

          <button (click)="exportAnalytics()"
                  class="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer group"
                  [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-100' : 'bg-neutral-900 text-white hover:bg-neutral-800'">
            <svg class="w-6 h-6 opacity-75 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            Descargar Métricas JSON
          </button>

          <button (click)="exportConfig()"
                  class="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest border transition-all duration-200 cursor-pointer group"
                  [ngClass]="isDark ? 'border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 hover:bg-neutral-800/50' : 'border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 hover:bg-neutral-50'">
            <svg class="w-6 h-6 opacity-75 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 13.5l3 3m0 0l3-3m-3 3v-6m1.06-4.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
            Descargar portfolio.json
          </button>
        </div>

        <!-- Activity Log -->
        <div class="rounded-2xl border p-6"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">
          <h3 class="text-sm font-bold uppercase tracking-wide mb-4"
              [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Log de Actividad</h3>
          <div class="space-y-3">
            <div *ngFor="let log of activityLog"
                 class="flex items-start gap-4">
              <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border"
                   [ngClass]="isDark ? 'bg-neutral-800/80 border-neutral-700 text-neutral-300' : 'bg-neutral-100 border-neutral-200 text-neutral-600'">
                <!-- Config -->
                <svg *ngIf="log.iconType === 'config'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <!-- Message -->
                <svg *ngIf="log.iconType === 'message'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <!-- Lead -->
                <svg *ngIf="log.iconType === 'lead'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" />
                </svg>
                <!-- Update -->
                <svg *ngIf="log.iconType === 'update'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <!-- Export -->
                <svg *ngIf="log.iconType === 'export'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <div class="min-w-0 flex-grow pt-0.5">
                <p class="text-sm font-bold truncate" [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">{{ log.label }}</p>
                <p class="text-xs tracking-wide mt-0.5" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">{{ log.date }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Load Times Table -->
      <div *ngIf="loadTimes.length > 0"
           class="rounded-2xl border overflow-hidden"
           [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'">

        <div class="px-5 py-4 border-b flex justify-between items-center"
             [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
          <h3 class="text-sm font-bold uppercase tracking-wide"
              [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">Tiempos de Carga (últimas {{ loadTimes.length }} mediciones)</h3>
          <div class="flex gap-4 text-xs font-bold uppercase tracking-widest"
               [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">
            <span>Mín: <span [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-700'">{{ loadMin }}ms</span></span>
            <span>Prom: <span [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-700'">{{ loadAvg }}ms</span></span>
            <span>Máx: <span [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-700'">{{ loadMax }}ms</span></span>
          </div>
        </div>

        <div class="px-5 py-4">
          <div class="flex items-end gap-1 h-16">
            <div *ngFor="let t of loadTimes"
                 class="flex-1 rounded-t-sm transition-all duration-500"
                 [style.height.%]="loadMax > 0 ? (t / loadMax) * 100 : 10"
                 [ngClass]="isDark ? 'bg-neutral-500' : 'bg-neutral-300'"
                 [title]="t + 'ms'"></div>
          </div>
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
  `]
})
export class DashReportsComponent implements OnInit {
  @Input() theme = 'dark';
  private analyticsService = inject(AnalyticsService);
  private configService = inject(PortfolioConfigService);
  private pdfService = inject(PdfReportService);

  private sanitizer = inject(DomSanitizer);

  metrics!: SystemMetrics;
  executiveSummary: { label: string; value: any }[] = [];
  loadTimes: number[] = [];
  loadMin = 0; loadMax = 0; loadAvg = 0;
  pdfLoading = false;

  pdfUrl: SafeResourceUrl | null = null;
  currentPdfType: 'analytics' | 'users' | 'health' | null = null;
  currentPdfName: string = '';

  activityLog: ActivityLog[] = [
    { iconType: 'config', label: 'Configuración del sistema actualizada', date: 'Hoy — 11:03 am' },
    { iconType: 'message', label: '3 mensajes nuevos recibidos', date: 'Hoy — 09:45 am' },
    { iconType: 'lead', label: 'Nueva solicitud de Plan Premium', date: 'Ayer — 4:22 pm' },
    { iconType: 'update', label: 'Métricas actualizadas automáticamente', date: 'Hace 3 días' },
    { iconType: 'export', label: 'portfolio.json exportado', date: 'Hace 5 días' },
  ];

  get isDark() { return this.theme === 'dark'; }

  ngOnInit() {
    this.metrics = this.analyticsService.getMetrics();
    this.buildSummary();
    this.buildLoadStats();
  }

  private buildSummary() {
    const totalSectionViews = Object.values(this.metrics.sectionViews).reduce((a, b) => a + b, 0);
    const totalLinkClicks = Object.values(this.metrics.linktreeClicks).reduce((a, b) => a + b, 0);
    this.executiveSummary = [
      { label: 'Vistas del Home', value: this.metrics.homeViews },
      { label: 'Vistas Linktree', value: this.metrics.linktreeViews },
      { label: 'Total Secciones', value: totalSectionViews },
      { label: 'Clics en Links', value: totalLinkClicks },
    ];
  }

  private buildLoadStats() {
    this.loadTimes = this.metrics.loadTimes || [];
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
  }

  exportConfig() {
    this.configService.exportJSON();
  }

  closeViewer() {
    this.pdfUrl = null;
    this.currentPdfType = null;
  }

  async previewPdf(type: 'analytics' | 'users' | 'health') {
    this.pdfLoading = true;
    this.currentPdfType = type;
    
    let rawUrl: string | void = undefined;
    try {
      if (type === 'analytics') {
        this.currentPdfName = 'Analíticas del Sistema';
        rawUrl = await this.pdfService.downloadAnalyticsReport(this.metrics, 'bloburl');
      } else if (type === 'users') {
        this.currentPdfName = 'Listado de Usuarios';
        const saved = localStorage.getItem('portalink_admin_users');
        const users = saved ? JSON.parse(saved) : [];
        rawUrl = await this.pdfService.downloadUsersReport(users, 'bloburl');
      } else if (type === 'health') {
        this.currentPdfName = 'Salud del Sistema';
        const legacyActivityLog = this.activityLog.map(log => {
          let icon = '⚙️';
          if (log.iconType === 'message') icon = '✉️';
          else if (log.iconType === 'lead') icon = '📋';
          else if (log.iconType === 'update') icon = '🔄';
          else if (log.iconType === 'export') icon = '📤';
          return { icon, label: log.label, date: log.date };
        });
        rawUrl = await this.pdfService.downloadSystemHealthReport(this.metrics, legacyActivityLog, 'bloburl');
      }

      if (rawUrl) {
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
      }
    } finally {
      this.pdfLoading = false;
    }
  }

  async downloadCurrentPdf() {
    if (!this.currentPdfType) return;
    this.pdfLoading = true;
    try {
      if (this.currentPdfType === 'analytics') {
        await this.pdfService.downloadAnalyticsReport(this.metrics, 'save');
      } else if (this.currentPdfType === 'users') {
        const saved = localStorage.getItem('portalink_admin_users');
        const users = saved ? JSON.parse(saved) : [];
        await this.pdfService.downloadUsersReport(users, 'save');
      } else if (this.currentPdfType === 'health') {
        const legacyActivityLog = this.activityLog.map(log => {
          let icon = '⚙️';
          if (log.iconType === 'message') icon = '✉️';
          else if (log.iconType === 'lead') icon = '📋';
          else if (log.iconType === 'update') icon = '🔄';
          else if (log.iconType === 'export') icon = '📤';
          return { icon, label: log.label, date: log.date };
        });
        await this.pdfService.downloadSystemHealthReport(this.metrics, legacyActivityLog, 'save');
      }
    } finally {
      this.pdfLoading = false;
    }
  }
}
