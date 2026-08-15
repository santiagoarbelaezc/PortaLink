import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Transaction {
  id: string;
  date: string;
  client: string;
  concept: string;
  category: 'Enterprise IA' | 'Desarrollo Web' | 'Retainer SaaS' | 'Consultoría';
  amountCop: number;
  status: 'COMPLETADO' | 'VERIFICADO' | 'EN PROCESO';
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

        <!-- Controls: Currency & Period -->
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

          <!-- Period Filter -->
          <select [(ngModel)]="period"
                  class="px-4 py-2 rounded-full text-xs font-headline font-semibold uppercase tracking-wider border outline-none cursor-pointer"
                  [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'">
            <option value="2026-YTD">Año 2026 (YTD)</option>
            <option value="Q2-2026">Trimestre Q2 2026</option>
            <option value="MES-ACTUAL">Mes Actual</option>
          </select>

          <!-- Export Report Button -->
          <button (click)="exportReport()"
                  class="px-5 py-2 rounded-full text-xs font-headline font-semibold uppercase tracking-wider border transition-all duration-300 cursor-pointer flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                  [ngClass]="isDark ? 'border-neutral-700 text-neutral-200 hover:bg-neutral-800' : 'border-neutral-200 text-neutral-800 bg-neutral-100 hover:bg-neutral-200'">
            <svg class="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span class="hidden sm:inline">Exportar Informe</span>
          </button>
        </div>
      </div>

      <!-- ══════════════════════════════════════
           MODEST REVENUE KPI METRICS GRID (COP)
      ══════════════════════════════════════ -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

        <!-- 1. Total Ingresos Anuales (ARR) -->
        <div class="rounded-[24px] border p-6 space-y-3 relative overflow-hidden transition-all duration-300 group hover:border-neutral-500 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80'">
          <div class="flex items-center justify-between">
            <span class="text-xs font-headline font-semibold uppercase tracking-wider opacity-60">Ingresos Anuales (ARR)</span>
            <span class="text-[10px] font-headline font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30 text-emerald-500 bg-emerald-500/10 tracking-wider">
              +18.5% vs 2025
            </span>
          </div>
          <div class="space-y-1">
            <p class="text-xl sm:text-2xl font-headline font-bold tracking-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              {{ formatValue(48000000) }}
            </p>
            <p class="text-xs opacity-50 font-normal">Facturación anual proyectada</p>
          </div>
          <!-- Sparkline Wave SVG -->
          <div class="pt-2">
            <svg class="w-full h-7 stroke-current text-emerald-500/40 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 100 25">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M0 20 Q 20 18, 40 12 T 80 5 T 100 2" />
            </svg>
          </div>
        </div>

        <!-- 2. Facturación Mensual (MRR) -->
        <div class="rounded-2xl border p-5 space-y-3 relative overflow-hidden transition-all duration-300 group hover:border-neutral-600"
             [ngClass]="isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200'">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium uppercase tracking-wider opacity-60">Facturación Mensual (MRR)</span>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
              +12.0% este mes
            </span>
          </div>
          <div class="space-y-1">
            <p class="text-xl sm:text-2xl font-bold tracking-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              {{ formatValue(4000000) }}
            </p>
            <p class="text-xs opacity-50 font-normal">Promedio mensual de entradas libres</p>
          </div>
          <div class="pt-2">
            <svg class="w-full h-7 stroke-current text-white/40 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 100 25">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M0 22 L 20 18 L 40 14 L 60 8 L 80 5 L 100 2" />
            </svg>
          </div>
        </div>

        <!-- 3. Margen Neto Operativo -->
        <div class="rounded-2xl border p-5 space-y-3 relative overflow-hidden transition-all duration-300 group hover:border-neutral-600"
             [ngClass]="isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200'">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium uppercase tracking-wider opacity-60">Utilidad Neta</span>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-neutral-700 text-neutral-300 bg-neutral-800/50">
              76.0% Margen
            </span>
          </div>
          <div class="space-y-1">
            <p class="text-xl sm:text-2xl font-bold tracking-tight text-emerald-400">
              {{ formatValue(3040000) }}
            </p>
            <p class="text-xs opacity-50 font-normal">Ganancia neta libre de costos</p>
          </div>
          <div class="pt-2">
            <div class="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
              <div class="bg-white h-1.5 rounded-full" style="width: 76%;"></div>
            </div>
          </div>
        </div>

        <!-- 4. Contratos Activos -->
        <div class="rounded-2xl border p-5 space-y-3 relative overflow-hidden transition-all duration-300 group hover:border-neutral-600"
             [ngClass]="isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200'">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium uppercase tracking-wider opacity-60">Contratos Activos</span>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-500/30 text-blue-400 bg-blue-500/10">
              5 Clientes
            </span>
          </div>
          <div class="space-y-1">
            <p class="text-xl sm:text-2xl font-bold tracking-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              {{ formatValue(800000) }} <span class="text-xs font-normal opacity-60">/mes</span>
            </p>
            <p class="text-xs opacity-50 font-normal">Valor promedio por contrato mensual</p>
          </div>
          <div class="pt-2 flex items-center justify-between text-xs font-medium opacity-70">
            <span>Retención: 98.2%</span>
            <span>Churn: 0.0%</span>
          </div>
        </div>

      </div>

      <!-- ══════════════════════════════════════
           MONOCHROMATIC CHARTS ROW 1
      ══════════════════════════════════════ -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <!-- GRAFICA 1: Trayectoria de Ingresos Mensuales (2 Cols) -->
        <div class="lg:col-span-2 rounded-2xl border p-6 space-y-6 flex flex-col justify-between"
             [ngClass]="isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200'">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 class="text-base font-semibold tracking-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                Trayectoria de Ingresos Mensuales
              </h3>
              <p class="text-xs mt-0.5 opacity-60">
                Evolución de entradas en Pesos Colombianos (COP) durante 2026
              </p>
            </div>
            <div class="flex items-center gap-4 text-xs font-normal opacity-80">
              <span class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-white"></span>
                <span>Ingresos Reales</span>
              </span>
              <span class="flex items-center gap-1.5 opacity-50">
                <span class="w-2.5 h-2.5 rounded-full border border-dashed border-neutral-400"></span>
                <span>Proyección Q3</span>
              </span>
            </div>
          </div>

          <!-- SVG Monochromatic Bar & Wave Graph -->
          <div class="relative h-60 w-full flex items-end justify-between gap-2 pt-8 pb-2 px-2 border-b"
               [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
            
            <!-- Background Grid Lines -->
            <div class="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
              <div class="border-b border-white w-full"></div>
              <div class="border-b border-white w-full"></div>
              <div class="border-b border-white w-full"></div>
              <div class="border-b border-white w-full"></div>
            </div>

            <!-- Month 1: Ene ($2.4M COP) -->
            <div class="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative z-10">
              <div class="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-800 text-white px-2 py-1 rounded absolute -top-8 shadow whitespace-nowrap">
                {{ formatValue(2400000) }}
              </div>
              <div class="w-full max-w-[36px] bg-neutral-700/40 group-hover:bg-neutral-600 rounded-t-xl transition-all duration-300" style="height: 52%;"></div>
              <span class="text-xs font-normal opacity-60">Ene</span>
            </div>

            <!-- Month 2: Feb ($2.8M COP) -->
            <div class="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative z-10">
              <div class="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-800 text-white px-2 py-1 rounded absolute -top-8 shadow whitespace-nowrap">
                {{ formatValue(2800000) }}
              </div>
              <div class="w-full max-w-[36px] bg-neutral-700/50 group-hover:bg-neutral-600 rounded-t-xl transition-all duration-300" style="height: 60%;"></div>
              <span class="text-xs font-normal opacity-60">Feb</span>
            </div>

            <!-- Month 3: Mar ($3.1M COP) -->
            <div class="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative z-10">
              <div class="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-800 text-white px-2 py-1 rounded absolute -top-8 shadow whitespace-nowrap">
                {{ formatValue(3100000) }}
              </div>
              <div class="w-full max-w-[36px] bg-neutral-700/60 group-hover:bg-neutral-500 rounded-t-xl transition-all duration-300" style="height: 68%;"></div>
              <span class="text-xs font-normal opacity-60">Mar</span>
            </div>

            <!-- Month 4: Abr ($3.4M COP) -->
            <div class="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative z-10">
              <div class="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-800 text-white px-2 py-1 rounded absolute -top-8 shadow whitespace-nowrap">
                {{ formatValue(3400000) }}
              </div>
              <div class="w-full max-w-[36px] bg-neutral-600/70 group-hover:bg-neutral-400 rounded-t-xl transition-all duration-300" style="height: 74%;"></div>
              <span class="text-xs font-normal opacity-60">Abr</span>
            </div>

            <!-- Month 5: May ($3.7M COP) -->
            <div class="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative z-10">
              <div class="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-800 text-white px-2 py-1 rounded absolute -top-8 shadow whitespace-nowrap">
                {{ formatValue(3700000) }}
              </div>
              <div class="w-full max-w-[36px] bg-neutral-500/80 group-hover:bg-neutral-300 rounded-t-xl transition-all duration-300" style="height: 80%;"></div>
              <span class="text-xs font-normal opacity-60">May</span>
            </div>

            <!-- Month 6: Jun ($4.0M COP) -->
            <div class="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative z-10">
              <div class="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-800 text-white px-2 py-1 rounded absolute -top-8 shadow whitespace-nowrap">
                {{ formatValue(4000000) }}
              </div>
              <div class="w-full max-w-[36px] bg-neutral-300 group-hover:bg-white rounded-t-xl transition-all duration-300 shadow-lg" style="height: 86%;"></div>
              <span class="text-xs font-normal opacity-60">Jun</span>
            </div>

            <!-- Month 7: Jul ($4.5M COP - Récord) -->
            <div class="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative z-10">
              <div class="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black px-2 py-1 rounded absolute -top-8 shadow-xl whitespace-nowrap">
                {{ formatValue(4500000) }} 🔥
              </div>
              <div class="w-full max-w-[36px] bg-white rounded-t-xl transition-all duration-300 shadow-xl" style="height: 95%;"></div>
              <span class="text-xs font-bold text-emerald-400">Jul</span>
            </div>

          </div>

          <!-- Bottom Summary Badge -->
          <div class="flex flex-wrap items-center justify-between text-xs pt-1 opacity-80 gap-3">
            <span class="flex items-center gap-2 font-normal">
              <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-3l3 3 3-3"/>
              </svg>
              <span>Promedio de Crecimiento Compuesto: <strong class="font-semibold">+9.8% Mensual</strong></span>
            </span>
            <span class="font-mono text-[11px] opacity-60">Auditoría en vivo</span>
          </div>

        </div>

        <!-- GRAFICA 2: Distribución de Ingresos Donut (1 Col) -->
        <div class="rounded-2xl border p-6 space-y-6 flex flex-col justify-between"
             [ngClass]="isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200'">
          <div>
            <h3 class="text-base font-semibold tracking-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              Distribución de Ingresos
            </h3>
            <p class="text-xs mt-0.5 opacity-60">Por líneas de negocio</p>
          </div>

          <!-- Circular Donut Graphic Simulation -->
          <div class="flex items-center justify-center py-4 relative">
            <div class="w-36 h-36 rounded-full border-8 border-neutral-700 border-t-white border-r-neutral-300 border-b-neutral-500 flex items-center justify-center relative shadow-inner">
              <div class="text-center">
                <span class="text-2xl font-bold" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">45%</span>
                <p class="text-[10px] uppercase tracking-wider opacity-50 font-normal">Licencias IA</p>
              </div>
            </div>
          </div>

          <!-- Breakdown legend -->
          <div class="space-y-3 text-xs">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-white"></span>
                <span class="font-medium">RotBot IA Enterprise</span>
              </div>
              <span class="font-semibold">{{ formatValue(1800000) }} (45%)</span>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-neutral-300"></span>
                <span class="font-medium">Desarrollo Web SaaS</span>
              </div>
              <span class="font-semibold">{{ formatValue(1400000) }} (35%)</span>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-neutral-600"></span>
                <span class="font-medium">Retainers & Soporte</span>
              </div>
              <span class="font-semibold">{{ formatValue(800000) }} (20%)</span>
            </div>
          </div>

        </div>

      </div>

      <!-- ══════════════════════════════════════
           MONOCHROMATIC CHARTS ROW 2
      ══════════════════════════════════════ -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        <!-- GRAFICA 3: Canales de Captación de Clientes -->
        <div class="rounded-2xl border p-6 space-y-5"
             [ngClass]="isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200'">
          <div>
            <h3 class="text-base font-semibold tracking-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              Canales de Captación
            </h3>
            <p class="text-xs mt-0.5 opacity-60">Origen del volumen de ingresos</p>
          </div>

          <div class="space-y-4 pt-2">
            <!-- Directas -->
            <div class="space-y-1.5">
              <div class="flex justify-between text-xs font-medium">
                <span>Ventas Directas</span>
                <span class="font-semibold">52% ({{ formatValue(2080000) }})</span>
              </div>
              <div class="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                <div class="bg-white h-2 rounded-full" style="width: 52%;"></div>
              </div>
            </div>

            <!-- Inbound RotBot IA -->
            <div class="space-y-1.5">
              <div class="flex justify-between text-xs font-medium">
                <span>Leads Inbound RotBot IA</span>
                <span class="font-semibold">32% ({{ formatValue(1280000) }})</span>
              </div>
              <div class="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                <div class="bg-neutral-300 h-2 rounded-full" style="width: 32%;"></div>
              </div>
            </div>

            <!-- Referidos -->
            <div class="space-y-1.5">
              <div class="flex justify-between text-xs font-medium">
                <span>Referidos & Alianzas</span>
                <span class="font-semibold">16% ({{ formatValue(640000) }})</span>
              </div>
              <div class="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                <div class="bg-neutral-500 h-2 rounded-full" style="width: 16%;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- GRAFICA 4: Proyección Flujo de Caja Q3 / Q4 2026 -->
        <div class="rounded-2xl border p-6 space-y-5"
             [ngClass]="isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200'">
          <div>
            <h3 class="text-base font-semibold tracking-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              Flujo de Caja Proyectado
            </h3>
            <p class="text-xs mt-0.5 opacity-60">Comparativa Entradas vs Costos Operativos</p>
          </div>

          <div class="h-40 flex items-end justify-between gap-3 pt-4 border-b pb-2"
               [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
            <!-- Q1 -->
            <div class="flex-1 flex items-end justify-center gap-1.5 h-full">
              <div class="w-4 bg-neutral-300 rounded-t-md" style="height: 65%;" title="Ingresos Q1"></div>
              <div class="w-4 bg-neutral-700 rounded-t-md" style="height: 25%;" title="Costos Q1"></div>
            </div>
            <!-- Q2 -->
            <div class="flex-1 flex items-end justify-center gap-1.5 h-full">
              <div class="w-4 bg-white rounded-t-md shadow" style="height: 85%;" title="Ingresos Q2"></div>
              <div class="w-4 bg-neutral-600 rounded-t-md" style="height: 28%;" title="Costos Q2"></div>
            </div>
            <!-- Q3 (Est) -->
            <div class="flex-1 flex items-end justify-center gap-1.5 h-full">
              <div class="w-4 bg-neutral-400/80 rounded-t-md" style="height: 92%;" title="Ingresos Q3 Proyectados"></div>
              <div class="w-4 bg-neutral-700/80 rounded-t-md" style="height: 30%;" title="Costos Q3 Proyectados"></div>
            </div>
          </div>

          <div class="flex items-center justify-between text-xs opacity-70">
            <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded bg-white"></span> Entradas</span>
            <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded bg-neutral-600"></span> Egresos</span>
            <span class="font-semibold text-emerald-400">+76% Margen Libre</span>
          </div>
        </div>

        <!-- GRAFICA 5: Margen de Rentabilidad EBITDA por Trimestre -->
        <div class="rounded-2xl border p-6 space-y-5"
             [ngClass]="isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200'">
          <div>
            <h3 class="text-base font-semibold tracking-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              Rentabilidad EBITDA
            </h3>
            <p class="text-xs mt-0.5 opacity-60">Margen porcentual acumulado</p>
          </div>

          <!-- Circular Gauge & Progress -->
          <div class="space-y-4 pt-2">
            <div class="flex items-center justify-between">
              <span class="text-3xl font-bold text-emerald-400">76.0%</span>
              <span class="text-xs font-medium opacity-60">Eficiencia Máxima</span>
            </div>

            <!-- Quarter Progression Bars -->
            <div class="space-y-2 text-xs">
              <div class="flex justify-between opacity-80">
                <span>Q3 2025</span>
                <span>68.5%</span>
              </div>
              <div class="w-full bg-neutral-800 rounded-full h-1.5">
                <div class="bg-neutral-500 h-1.5 rounded-full" style="width: 68.5%;"></div>
              </div>

              <div class="flex justify-between opacity-80">
                <span>Q4 2025</span>
                <span>72.0%</span>
              </div>
              <div class="w-full bg-neutral-800 rounded-full h-1.5">
                <div class="bg-neutral-400 h-1.5 rounded-full" style="width: 72%;"></div>
              </div>

              <div class="flex justify-between font-semibold">
                <span>Q2 2026 (Actual)</span>
                <span class="text-emerald-400">76.0%</span>
              </div>
              <div class="w-full bg-neutral-800 rounded-full h-1.5">
                <div class="bg-emerald-400 h-1.5 rounded-full" style="width: 76%;"></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- ══════════════════════════════════════
           BALANCED EXECUTIVE LEDGER / TRANSACTIONS
      ══════════════════════════════════════ -->
      <div class="rounded-2xl border p-5 sm:p-6 space-y-5"
           [ngClass]="isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200'">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4"
             [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
          <div>
            <h3 class="text-base font-semibold tracking-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              Libro de Entradas & Depósitos Recientes
            </h3>
            <p class="text-xs mt-0.5 opacity-60">Últimos pagos de clientes procesados con éxito</p>
          </div>
          <span class="text-xs font-medium px-3 py-1 rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 self-start sm:self-center">
            Auditoría en tiempo real
          </span>
        </div>

        <!-- Table Container -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b uppercase tracking-wider text-[10px] font-semibold opacity-50"
                  [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
                <th class="py-3 px-3">Fecha</th>
                <th class="py-3 px-3">Cliente / Empresa</th>
                <th class="py-3 px-3">Concepto del Pago</th>
                <th class="py-3 px-3">Categoría</th>
                <th class="py-3 px-3 text-right">Monto Recibido</th>
                <th class="py-3 px-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y" [ngClass]="isDark ? 'divide-neutral-800/60' : 'divide-neutral-100'">
              <tr *ngFor="let tx of transactions" class="hover:bg-white/5 transition-colors">
                <!-- Fecha -->
                <td class="py-3.5 px-3 font-mono opacity-70 whitespace-nowrap">{{ tx.date }}</td>
                <!-- Cliente -->
                <td class="py-3.5 px-3 font-semibold whitespace-nowrap" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                  {{ tx.client }}
                </td>
                <!-- Concepto -->
                <td class="py-3.5 px-3 opacity-80 whitespace-nowrap">{{ tx.concept }}</td>
                <!-- Categoría -->
                <td class="py-3.5 px-3 whitespace-nowrap">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider border"
                        [ngClass]="isDark ? 'bg-neutral-800/80 border-neutral-700 text-neutral-300' : 'bg-neutral-100 border-neutral-200 text-neutral-700'">
                    {{ tx.category }}
                  </span>
                </td>
                <!-- Monto -->
                <td class="py-3.5 px-3 text-right font-bold text-sm text-emerald-400 whitespace-nowrap">
                  +{{ formatValue(tx.amountCop) }}
                </td>
                <!-- Estado -->
                <td class="py-3.5 px-3 text-center whitespace-nowrap">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-semibold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    {{ tx.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
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
export class DashFinancialControlComponent {
  @Input() theme = 'light';

  currency: 'COP' | 'USD' = 'COP';
  period = '2026-YTD';

  get isDark() { return this.theme === 'dark'; }

  // Datos quemados moderados en Pesos Colombianos (COP)
  transactions: Transaction[] = [
    {
      id: 'TX-901',
      date: '01 Ago 2026',
      client: 'Global Banking Corp LatAm',
      concept: 'Licencia Anual IA Rotbot Enterprise Multi-Node',
      category: 'Enterprise IA',
      amountCop: 1500000,
      status: 'VERIFICADO'
    },
    {
      id: 'TX-902',
      date: '30 Jul 2026',
      client: 'Inmobiliaria Capital Group',
      concept: 'Plataforma Web Custom + Integración CRM',
      category: 'Desarrollo Web',
      amountCop: 1200000,
      status: 'COMPLETADO'
    },
    {
      id: 'TX-903',
      date: '28 Jul 2026',
      client: 'TechVentures Holdings',
      concept: 'Consultoría Especializada Arquitectura IA',
      category: 'Consultoría',
      amountCop: 650000,
      status: 'COMPLETADO'
    },
    {
      id: 'TX-904',
      date: '25 Jul 2026',
      client: 'Consorcio Logístico LatAm',
      concept: 'Contrato de Mantenimiento Retainer Q3',
      category: 'Retainer SaaS',
      amountCop: 800000,
      status: 'COMPLETADO'
    },
    {
      id: 'TX-905',
      date: '22 Jul 2026',
      client: 'Fintech Solutions Inc',
      concept: 'Despliegue Multi-Cloud & Seguridad Web',
      category: 'Enterprise IA',
      amountCop: 950000,
      status: 'VERIFICADO'
    }
  ];

  formatValue(copValue: number): string {
    if (this.currency === 'USD') {
      const usdValue = copValue / 4000;
      return '$' + Math.round(usdValue).toLocaleString('en-US') + ' USD';
    }
    return '$ ' + copValue.toLocaleString('es-CO') + ' COP';
  }

  exportReport() {
    alert(`Exportando Informe Ejecutivo de Control Financiero (${this.period} - ${this.currency})...`);
  }
}
