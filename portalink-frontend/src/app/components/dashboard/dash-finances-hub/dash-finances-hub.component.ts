import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashFinancesComponent } from '../dash-finances/dash-finances.component';
import { DashFinancialControlComponent } from '../dash-financial-control/dash-financial-control.component';

export type FinancesSubTab = 'finances' | 'control';

@Component({
  selector: 'app-dash-finances-hub',
  standalone: true,
  imports: [CommonModule, DashFinancesComponent, DashFinancialControlComponent],
  template: `
    <div class="space-y-6 tab-enter font-sans">

      <!-- ══════════════════════════════════════
           TOP TAB SWITCHER (FINANZAS / CONTROL FINANCIERO)
      ══════════════════════════════════════ -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 sm:p-2 rounded-2xl border backdrop-blur-xl transition-all shadow-sm"
           [ngClass]="isDark ? 'bg-[#0c0c0e] border-neutral-800' : 'bg-neutral-100/90 border-neutral-200'">
        
        <!-- Tab Selector Buttons -->
        <div class="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <!-- Pestaña Finanzas (Cuentas, Clientes, Servicios, Facturas) -->
          <button type="button"
                  (click)="setSubTab('finances')"
                  class="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-headline font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 border"
                  [ngClass]="activeSubTab === 'finances'
                    ? (isDark ? 'shadow-lg border-white' : 'shadow-lg border-[#09090b]')
                    : (isDark ? 'border-transparent hover:bg-neutral-800/60' : 'border-transparent hover:bg-neutral-200/60')"
                  [style.background-color]="activeSubTab === 'finances' ? (isDark ? '#ffffff !important' : '#09090b !important') : 'transparent'"
                  [style.color]="activeSubTab === 'finances' ? (isDark ? '#09090b !important' : '#ffffff !important') : (isDark ? '#a1a1aa !important' : '#52525b !important')">
            <span class="material-symbols-rounded"
                  style="font-size: 19px;"
                  [style.color]="activeSubTab === 'finances' ? (isDark ? '#09090b !important' : '#ffffff !important') : (isDark ? '#a1a1aa !important' : '#52525b !important')">payments</span>
            <span [style.color]="activeSubTab === 'finances' ? (isDark ? '#09090b !important' : '#ffffff !important') : (isDark ? '#a1a1aa !important' : '#52525b !important')">Finanzas</span>
            <span *ngIf="activeSubTab === 'finances'" class="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
          </button>

          <!-- Pestaña Analíticas (Control Financiero) -->
          <button type="button"
                  (click)="setSubTab('control')"
                  class="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-headline font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 border"
                  [ngClass]="activeSubTab === 'control'
                    ? (isDark ? 'shadow-lg border-white' : 'shadow-lg border-[#09090b]')
                    : (isDark ? 'border-transparent hover:bg-neutral-800/60' : 'border-transparent hover:bg-neutral-200/60')"
                  [style.background-color]="activeSubTab === 'control' ? (isDark ? '#ffffff !important' : '#09090b !important') : 'transparent'"
                  [style.color]="activeSubTab === 'control' ? (isDark ? '#09090b !important' : '#ffffff !important') : (isDark ? '#a1a1aa !important' : '#52525b !important')">
            <span class="material-symbols-rounded"
                  style="font-size: 19px;"
                  [style.color]="activeSubTab === 'control' ? (isDark ? '#09090b !important' : '#ffffff !important') : (isDark ? '#a1a1aa !important' : '#52525b !important')">monitoring</span>
            <span [style.color]="activeSubTab === 'control' ? (isDark ? '#09090b !important' : '#ffffff !important') : (isDark ? '#a1a1aa !important' : '#52525b !important')">Analíticas</span>
            <span *ngIf="activeSubTab === 'control'" class="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
          </button>
        </div>

        <!-- Explanatory Label -->
        <div class="hidden md:flex items-center gap-2 px-3 text-xs opacity-50 font-medium">
          <span *ngIf="activeSubTab === 'finances'">Cuentas de cobro, clientes, catálogo de servicios y recaudo</span>
          <span *ngIf="activeSubTab === 'control'">Analíticas de ingresos/egresos, métricas ARR/MRR y flujo neto</span>
        </div>
      </div>

      <!-- ══════════════════════════════════════
           ACTIVE SUB-VIEW RENDERING
      ══════════════════════════════════════ -->
      <div>
        <app-dash-finances *ngIf="activeSubTab === 'finances'" [theme]="theme"></app-dash-finances>
        <app-dash-financial-control *ngIf="activeSubTab === 'control'" [theme]="theme"></app-dash-financial-control>
      </div>

    </div>
  `
})
export class DashFinancesHubComponent implements OnInit {
  @Input() theme: string = 'dark';
  
  private _defaultSubTab: FinancesSubTab = 'finances';
  @Input()
  set defaultSubTab(val: FinancesSubTab) {
    this._defaultSubTab = val;
    if (val === 'finances' || val === 'control') {
      this.activeSubTab = val;
    }
  }
  get defaultSubTab(): FinancesSubTab {
    return this._defaultSubTab;
  }

  activeSubTab: FinancesSubTab = 'finances';

  get isDark(): boolean {
    return this.theme === 'dark';
  }

  ngOnInit(): void {
    if (this._defaultSubTab) {
      this.activeSubTab = this._defaultSubTab;
    } else {
      const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('portalink_finances_subtab') as FinancesSubTab : null;
      if (saved === 'finances' || saved === 'control') {
        this.activeSubTab = saved;
      }
    }
  }

  setSubTab(subTab: FinancesSubTab): void {
    this.activeSubTab = subTab;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('portalink_finances_subtab', subTab);
    }
  }
}
