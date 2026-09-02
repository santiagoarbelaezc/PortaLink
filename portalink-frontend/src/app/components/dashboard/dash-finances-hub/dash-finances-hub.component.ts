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
        <div class="flex items-center gap-1.5 w-full sm:w-auto flex-wrap">
          <!-- Pestaña Finanzas (Cuentas, Clientes, Servicios, Facturas) -->
          <button (click)="setSubTab('finances')"
                  class="flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                  [ngClass]="activeSubTab === 'finances'
                    ? (isDark ? 'bg-white text-black font-bold shadow-md' : 'bg-[#09090b] text-white font-bold shadow-md')
                    : (isDark ? 'text-neutral-400 hover:text-white hover:bg-neutral-800/40' : 'text-neutral-600 hover:text-black hover:bg-black/5')">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
            <span>Finanzas</span>
          </button>

          <!-- Pestaña Control Financiero -->
          <button (click)="setSubTab('control')"
                  class="flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                  [ngClass]="activeSubTab === 'control'
                    ? (isDark ? 'bg-white text-black font-bold shadow-md' : 'bg-[#09090b] text-white font-bold shadow-md')
                    : (isDark ? 'text-neutral-400 hover:text-white hover:bg-neutral-800/40' : 'text-neutral-600 hover:text-black hover:bg-black/5')">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-3l3 3 3-3M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22" />
            </svg>
            <span>Control Financiero</span>
          </button>
        </div>

        <!-- Explanatory Label -->
        <div class="hidden md:flex items-center gap-2 px-3 text-xs opacity-50 font-medium">
          <span *ngIf="activeSubTab === 'finances'">Cuentas de cobro, clientes, catálogo de servicios y recaudo</span>
          <span *ngIf="activeSubTab === 'control'">Métricas ARR/MRR, libro de ingresos/egresos y flujo neto</span>
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
  @Input() theme: string = 'light';
  @Input() defaultSubTab: FinancesSubTab = 'finances';

  activeSubTab: FinancesSubTab = 'finances';

  get isDark(): boolean {
    return this.theme === 'dark';
  }

  ngOnInit(): void {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('portalink_finances_subtab') as FinancesSubTab : null;
    if (saved === 'finances' || saved === 'control') {
      this.activeSubTab = saved;
    } else {
      this.activeSubTab = this.defaultSubTab;
    }
  }

  setSubTab(subTab: FinancesSubTab): void {
    this.activeSubTab = subTab;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('portalink_finances_subtab', subTab);
    }
  }
}
