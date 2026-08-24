import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-erp-diagram',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="erp-diagram-canvas w-full max-w-[1150px] mx-auto bg-white rounded-[20px] sm:rounded-[32px] p-2.5 xs:p-3 sm:p-5 lg:p-6 border border-slate-200/90 shadow-[0_15px_40px_rgba(0,0,0,0.06)] font-sans text-slate-800 relative select-none">
      
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- MOBILE DESIGN (< LG) — Streamlined, Modern, Touch-Friendly     -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <div class="flex lg:hidden flex-col gap-2.5 xs:gap-3 w-full">
        
        <!-- 1. Central Core Header & Modules -->
        <div class="bg-white rounded-2xl border-2 border-slate-200/90 p-3 shadow-xs">
          
          <div class="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                </svg>
              </div>
              <div>
                <h4 class="text-xs xs:text-sm font-headline font-extrabold text-slate-900 leading-none m-0">ERP PortaLink</h4>
                <span class="text-[9px] text-slate-500 font-normal">Gestiona tu empresa en tiempo real</span>
              </div>
            </div>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/60">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              En Vivo
            </span>
          </div>

          <!-- 3 Internal Modules Grid -->
          <div class="grid grid-cols-3 gap-1.5">
            <div class="bg-slate-50/80 rounded-xl p-2 text-center border border-slate-100 flex flex-col items-center">
              <div class="w-5 h-5 flex items-center justify-center text-slate-800 mb-1">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
              </div>
              <h6 class="text-[9.5px] font-headline font-bold text-slate-900 m-0">Inventario</h6>
              <span class="text-[7.5px] text-slate-500 leading-tight block">Stock activo</span>
            </div>

            <div class="bg-slate-50/80 rounded-xl p-2 text-center border border-slate-100 flex flex-col items-center">
              <div class="w-5 h-5 flex items-center justify-center text-slate-800 mb-1">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              </div>
              <h6 class="text-[9.5px] font-headline font-bold text-slate-900 m-0">Ventas</h6>
              <span class="text-[7.5px] text-slate-500 leading-tight block">Facturación</span>
            </div>

            <div class="bg-slate-50/80 rounded-xl p-2 text-center border border-slate-100 flex flex-col items-center">
              <div class="w-5 h-5 flex items-center justify-center text-slate-800 mb-1">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              </div>
              <h6 class="text-[9.5px] font-headline font-bold text-slate-900 m-0">Clientes</h6>
              <span class="text-[7.5px] text-slate-500 leading-tight block">CRM & Fidelidad</span>
            </div>
          </div>

        </div>

        <!-- 2. Integrated Channels 2x2 Grid -->
        <div class="grid grid-cols-2 gap-2">
          
          <!-- Sitio Web -->
          <div class="bg-white rounded-2xl border border-slate-200 p-2.5 shadow-xs flex flex-col justify-between">
            <div class="flex items-center justify-between mb-1.5">
              <div class="flex items-center gap-1.5">
                <div class="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                </div>
                <h6 class="text-[10px] font-headline font-bold text-slate-900 m-0">Sitio Web</h6>
              </div>
            </div>
            <div class="w-full h-12 flex items-center justify-center bg-slate-50 rounded-lg p-1 mb-1 border border-slate-100 overflow-hidden">
              <img src="https://res.cloudinary.com/doxdjiyvi/image/upload/q_auto:eco,f_auto,w_300/v1787585847/e_p-heropq_yzeom8.png" alt="Sitio Web" class="h-full w-auto object-contain" loading="lazy"/>
            </div>
            <span class="text-[7.5px] text-slate-500 text-center block">Catálogo & Checkout</span>
          </div>

          <!-- App Móvil -->
          <div class="bg-white rounded-2xl border border-slate-200 p-2.5 shadow-xs flex flex-col justify-between">
            <div class="flex items-center justify-between mb-1.5">
              <div class="flex items-center gap-1.5">
                <div class="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                </div>
                <h6 class="text-[10px] font-headline font-bold text-slate-900 m-0">App Móvil</h6>
              </div>
            </div>
            <div class="w-full h-12 flex items-center justify-center bg-slate-50 rounded-lg p-1 mb-1 border border-slate-100 overflow-hidden">
              <img src="https://res.cloudinary.com/doxdjiyvi/image/upload/q_auto:eco,f_auto,w_200/v1787585921/camascotas-movilpq_l2puqq.png" alt="App Móvil" class="h-full w-auto object-contain" loading="lazy"/>
            </div>
            <span class="text-[7.5px] text-slate-500 text-center block">iOS & Android</span>
          </div>

          <!-- WhatsApp CRM -->
          <div class="bg-white rounded-2xl border border-slate-200 p-2.5 shadow-xs flex flex-col justify-between">
            <div class="flex items-center gap-1.5 mb-1.5">
              <div class="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-2.18-.553-1.637-.677-2.709-2.338-2.791-2.446-.082-.108-.669-.89-.669-1.696 0-.806.42-1.203.57-1.363.144-.155.314-.194.419-.194.105 0 .21.001.302.006.098.005.228-.037.356.27.132.318.452 1.102.492 1.183.04.082.067.177.013.283-.053.106-.08.172-.16.266-.08.093-.169.208-.242.279-.08.079-.163.165-.07.325.093.16.413.682.887 1.104.61.543 1.124.712 1.284.792.16.08.254.067.348-.04.094-.108.4-.467.507-.627.107-.16.214-.134.36-.08.146.054.928.438 1.088.518.16.08.267.12.307.187.04.066.04.385-.104.79z"/></svg>
              </div>
              <h6 class="text-[10px] font-headline font-bold text-slate-900 m-0">WhatsApp</h6>
            </div>
            <div class="bg-emerald-50/60 border border-emerald-100 rounded-lg p-1 text-[7px] text-emerald-900 mb-1">
              "¡Pedido #104 confirmado! ✅"
            </div>
            <span class="text-[7.5px] text-slate-500 text-center block">Atención 24/7</span>
          </div>

          <!-- IA Inteligente -->
          <div class="bg-white rounded-2xl border border-slate-200 p-2.5 shadow-xs flex flex-col justify-between">
            <div class="flex items-center gap-1.5 mb-1.5">
              <div class="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center p-0.5 shrink-0">
                <img src="assets/icons/logo-link-light.png" class="w-full h-full object-contain" alt="IA">
              </div>
              <h6 class="text-[10px] font-headline font-bold text-slate-900 m-0">IA Asistente</h6>
            </div>
            <div class="bg-blue-50/60 border border-blue-100 rounded-lg p-1 text-[7px] text-blue-900 mb-1">
              +18% ventas proyectadas 📈
            </div>
            <span class="text-[7.5px] text-slate-500 text-center block">Automatizaciones</span>
          </div>

        </div>

        <!-- 3. Base de Datos Cloud Bar -->
        <div class="bg-white rounded-2xl border border-slate-200 p-2.5 shadow-xs flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <ellipse cx="12" cy="5" rx="9" ry="3"/>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
              </svg>
            </div>
            <div>
              <h6 class="text-[9.5px] font-headline font-bold text-slate-900 m-0 leading-none">Base de Datos Centralizada</h6>
              <span class="text-[7.5px] text-slate-500">Sincronización en la nube en tiempo real</span>
            </div>
          </div>
          <span class="text-[8px] font-semibold text-blue-600 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full shrink-0">
            100% Sync
          </span>
        </div>

      </div>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- DESKTOP DESIGN (LG+) — Full 3-Column Architectural Network     -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <div class="hidden lg:flex flex-row items-stretch gap-0">
        
        <!-- ═══════════════════════════════════ -->
        <!-- COL 1: BASE DE DATOS + LEYENDA     -->
        <!-- ═══════════════════════════════════ -->
        <div class="w-[22%] flex flex-col justify-between gap-3 shrink-0">
          
          <div class="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-xs">
            <h5 class="text-[11px] sm:text-xs font-headline font-bold uppercase tracking-wider text-slate-500 mb-3 text-center">Base de Datos</h5>
            <div class="w-16 h-20 mx-auto mb-3">
              <svg class="w-full h-full" viewBox="0 0 64 80" fill="none">
                <ellipse cx="32" cy="16" rx="26" ry="10" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="2"/>
                <ellipse cx="32" cy="16" rx="20" ry="6" fill="#e2e8f0"/>
                <path d="M6 16v18c0 5.523 11.64 10 26 10s26-4.477 26-10V16" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
                <path d="M6 34c0 5.523 11.64 10 26 10s26-4.477 26-10" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/>
                <path d="M6 34v18c0 5.523 11.64 10 26 10s26-4.477 26-10V34" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
                <path d="M6 52c0 5.523 11.64 10 26 10s26-4.477 26-10" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/>
                <path d="M6 52v12c0 5.523 11.64 10 26 10s26-4.477 26-10V52" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2"/>
              </svg>
            </div>
            <ul class="text-[10px] sm:text-[11px] text-slate-600 space-y-1.5 list-none p-0 m-0">
              <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>Clientes</li>
              <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>Productos</li>
              <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>Inventario</li>
              <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>Pedidos</li>
              <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>Proveedores</li>
              <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>Usuarios</li>
              <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>Configuraciones</li>
            </ul>
          </div>

          <div class="bg-white rounded-xl border border-slate-200 p-2.5 text-[9px] sm:text-[10px] text-slate-600 space-y-1.5 shadow-2xs">
            <span class="font-headline font-bold uppercase text-slate-400 tracking-wider block text-[9.5px]">Leyenda</span>
            <div class="flex items-center gap-2">
              <svg class="w-6 h-2.5 shrink-0" viewBox="0 0 24 8" fill="none">
                <line x1="3" y1="4" x2="21" y2="4" stroke="#94a3b8" stroke-width="1.2"/>
                <path d="M6 1.5L3 4L6 6.5" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18 1.5L21 4L18 6.5" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>Sincronización Bidireccional</span>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-6 h-2.5 shrink-0" viewBox="0 0 24 8" fill="none">
                <line x1="3" y1="4" x2="21" y2="4" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="2.5 2"/>
                <path d="M18 1.5L21 4L18 6.5" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>Flujo de datos</span>
            </div>
          </div>

        </div>

        <!-- ══════════════════════════════════════════════════════════ -->
        <!-- CONNECTOR A: DB ←─── Sincronización ───→ ERP             -->
        <!-- ══════════════════════════════════════════════════════════ -->
        <div class="flex w-[5%] shrink-0 items-center justify-center relative">
          <div class="flex flex-col items-center gap-1.5 w-full" style="margin-top: -60px;">
            <span class="text-[8px] font-medium text-slate-500 bg-white border border-slate-200/90 px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap leading-tight">Sincronización</span>
            <svg class="w-full h-3" viewBox="0 0 40 10" fill="none">
              <line x1="4" y1="5" x2="36" y2="5" stroke="#cbd5e1" stroke-width="1.25"/>
              <path d="M7 2.5L3.5 5L7 7.5" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M33 2.5L36.5 5L33 7.5" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- COL 2: USUARIOS + ERP CORE + ANALÍTICAS                    -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <div class="w-[41%] flex flex-col justify-between gap-2.5 shrink-0">
          
          <!-- USUARIOS -->
          <div class="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs">
            <span class="text-[10px] sm:text-[11px] font-headline font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center sm:text-left">Usuarios</span>
            <div class="grid grid-cols-4 gap-1 text-center">
              <div class="flex flex-col items-center">
                <div class="w-7 h-7 flex items-center justify-center text-slate-700 mb-0.5">
                  <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </div>
                <span class="text-[9px] sm:text-[10px] font-medium text-slate-700">Admin</span>
              </div>
              <div class="flex flex-col items-center">
                <div class="w-7 h-7 flex items-center justify-center text-slate-700 mb-0.5">
                  <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                </div>
                <span class="text-[9px] sm:text-[10px] font-medium text-slate-700">Ventas</span>
              </div>
              <div class="flex flex-col items-center">
                <div class="w-7 h-7 flex items-center justify-center text-slate-700 mb-0.5">
                  <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                </div>
                <span class="text-[9px] sm:text-[10px] font-medium text-slate-700">Inventario</span>
              </div>
              <div class="flex flex-col items-center">
                <div class="w-7 h-7 flex items-center justify-center text-slate-700 mb-0.5">
                  <div class="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[9px] font-bold">$</div>
                </div>
                <span class="text-[9px] sm:text-[10px] font-medium text-slate-700">Finanzas</span>
              </div>
            </div>
          </div>

          <!-- Vertical connector: Users ↕ ERP -->
          <div class="flex justify-center -my-1">
            <svg class="w-3 h-5" viewBox="0 0 10 20" fill="none">
              <line x1="5" y1="1" x2="5" y2="19" stroke="#e2e8f0" stroke-width="1.25" stroke-dasharray="2.5 1.5"/>
              <path d="M2.5 4L5 1L7.5 4" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2.5 16L5 19L7.5 16" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

          <!-- ERP CORE -->
          <div class="bg-white rounded-2xl border-2 border-slate-200 p-3.5 sm:p-4 shadow-sm">
            <div class="flex items-center gap-2.5 mb-3">
              <div class="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                </svg>
              </div>
              <div>
                <h4 class="text-sm sm:text-base font-headline font-extrabold text-slate-900 leading-none m-0">ERP</h4>
                <span class="text-[10px] sm:text-[11px] text-slate-500 font-normal">Gestiona tu empresa</span>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2.5 mb-2.5">
              <div class="bg-white rounded-xl border border-slate-200 p-2.5 flex flex-col items-center text-center shadow-2xs hover:border-slate-300 transition-colors">
                <div class="w-7 h-7 flex items-center justify-center text-slate-800 mb-1">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                </div>
                <h6 class="text-[11px] sm:text-xs font-headline font-bold text-slate-900 m-0">Inventario</h6>
                <p class="text-[9px] sm:text-[10px] text-slate-500 m-0 mt-0.5 leading-tight">Control de stock en tiempo real</p>
              </div>
              <div class="bg-white rounded-xl border border-slate-200 p-2.5 flex flex-col items-center text-center shadow-2xs hover:border-slate-300 transition-colors">
                <div class="w-7 h-7 flex items-center justify-center text-slate-800 mb-1">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                </div>
                <h6 class="text-[11px] sm:text-xs font-headline font-bold text-slate-900 m-0">Ventas</h6>
                <p class="text-[9px] sm:text-[10px] text-slate-500 m-0 mt-0.5 leading-tight">Órdenes y facturación</p>
              </div>
            </div>
            <div class="bg-white rounded-xl border border-slate-200 p-2.5 flex flex-col items-center text-center shadow-2xs hover:border-slate-300 transition-colors">
              <div class="w-7 h-7 flex items-center justify-center text-slate-800 mb-0.5">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              </div>
              <h6 class="text-[11px] sm:text-xs font-headline font-bold text-slate-900 m-0">Clientes</h6>
              <p class="text-[9px] sm:text-[10px] text-slate-500 m-0 mt-0.5 leading-tight">Gestión de clientes y contactos</p>
            </div>
          </div>

          <!-- ANALÍTICAS -->
          <div class="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs">
            <span class="text-[10px] sm:text-[11px] font-headline font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center sm:text-left">Analíticas y Reportes</span>
            <div class="grid grid-cols-5 gap-1 text-center">
              <div class="flex flex-col items-center">
                <div class="w-6 h-6 flex items-center justify-center text-slate-700 mb-0.5">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
                </div>
                <span class="text-[8px] sm:text-[9px] font-bold text-slate-800 block">KPIs</span>
                <span class="text-[7px] sm:text-[8px] text-slate-400 block">Métricas</span>
              </div>
              <div class="flex flex-col items-center">
                <div class="w-6 h-6 flex items-center justify-center text-slate-700 mb-0.5">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                </div>
                <span class="text-[8px] sm:text-[9px] font-bold text-slate-800 block">Ventas</span>
                <span class="text-[7px] sm:text-[8px] text-slate-400 block">Análisis</span>
              </div>
              <div class="flex flex-col items-center">
                <div class="w-6 h-6 flex items-center justify-center text-slate-700 mb-0.5">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                </div>
                <span class="text-[8px] sm:text-[9px] font-bold text-slate-800 block">Stock</span>
                <span class="text-[7px] sm:text-[8px] text-slate-400 block">Rotación</span>
              </div>
              <div class="flex flex-col items-center">
                <div class="w-6 h-6 flex items-center justify-center text-slate-700 mb-0.5">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </div>
                <span class="text-[8px] sm:text-[9px] font-bold text-slate-800 block">Clientes</span>
                <span class="text-[7px] sm:text-[8px] text-slate-400 block">Segmentos</span>
              </div>
              <div class="flex flex-col items-center">
                <div class="w-6 h-6 flex items-center justify-center text-slate-700 mb-0.5">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                </div>
                <span class="text-[8px] sm:text-[9px] font-bold text-slate-800 block">Export</span>
                <span class="text-[7px] sm:text-[8px] text-slate-400 block">PDF, XLS</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- CONNECTOR B: ERP ── CSS Bus ──► 4 Canales                      -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <div class="flex w-[5%] shrink-0 flex-col justify-between py-0 relative">
          <!-- Vertical spine that stretches full height -->
          <div class="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-slate-200"></div>

          <!-- 4 arms distributed via flex justify-around -->
          <div class="flex flex-col justify-around h-full relative z-10 py-5">
            
            <!-- Arm 1 → Sitio Web -->
            <div class="flex items-center w-full">
              <svg class="w-full h-3" viewBox="0 0 40 10" fill="none" preserveAspectRatio="none">
                <line x1="0" y1="5" x2="40" y2="5" stroke="#e2e8f0" stroke-width="1.25"/>
                <path d="M4 2.5L1 5L4 7.5" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M36 2.5L39 5L36 7.5" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>

            <!-- Arm 2 → App Móvil -->
            <div class="flex items-center w-full">
              <svg class="w-full h-3" viewBox="0 0 40 10" fill="none" preserveAspectRatio="none">
                <line x1="0" y1="5" x2="40" y2="5" stroke="#e2e8f0" stroke-width="1.25"/>
                <path d="M4 2.5L1 5L4 7.5" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M36 2.5L39 5L36 7.5" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>

            <!-- Arm 3 → WhatsApp -->
            <div class="flex items-center w-full">
              <svg class="w-full h-3" viewBox="0 0 40 10" fill="none" preserveAspectRatio="none">
                <line x1="0" y1="5" x2="40" y2="5" stroke="#e2e8f0" stroke-width="1.25"/>
                <path d="M4 2.5L1 5L4 7.5" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M36 2.5L39 5L36 7.5" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>

            <!-- Arm 4 → IA Inteligente (dashed) -->
            <div class="flex items-center w-full">
              <svg class="w-full h-3" viewBox="0 0 40 10" fill="none" preserveAspectRatio="none">
                <line x1="0" y1="5" x2="40" y2="5" stroke="#e2e8f0" stroke-width="1.25" stroke-dasharray="2.5 2"/>
                <path d="M36 2.5L39 5L36 7.5" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>

          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- COL 3: 4 CANALES CONECTADOS                                -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <div class="w-[27%] flex flex-col justify-between gap-2.5">
          
          <!-- Card 1: SITIO WEB -->
          <div class="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex items-center justify-between gap-2 hover:border-slate-300 transition-colors flex-1">
            <div class="space-y-0.5 min-w-0">
              <div class="flex items-center gap-1.5">
                <div class="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                </div>
                <div>
                  <h6 class="text-[11px] sm:text-xs font-headline font-bold text-slate-900 leading-none m-0">SITIO WEB</h6>
                  <span class="text-[8px] sm:text-[8.5px] text-slate-500">Tu tienda en línea</span>
                </div>
              </div>
              <ul class="text-[8px] sm:text-[8.5px] text-slate-600 space-y-0.5 list-none p-0 m-0 pt-0.5">
                <li>✓ Catálogo de productos</li>
                <li>✓ Carrito de compras</li>
                <li>✓ Órdenes y pagos</li>
                <li>✓ Cuentas de cliente</li>
              </ul>
            </div>
            <div class="w-18 sm:w-20 shrink-0">
              <img src="https://res.cloudinary.com/doxdjiyvi/image/upload/q_auto:eco,f_auto,w_300/v1787585847/e_p-heropq_yzeom8.png" alt="Sitio Web" class="w-full h-auto object-contain rounded shadow-2xs border border-slate-100" loading="lazy"/>
            </div>
          </div>

          <!-- Card 2: APP MÓVIL -->
          <div class="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex items-center justify-between gap-2 hover:border-slate-300 transition-colors flex-1">
            <div class="space-y-0.5 min-w-0">
              <div class="flex items-center gap-1.5">
                <div class="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                </div>
                <div>
                  <h6 class="text-[11px] sm:text-xs font-headline font-bold text-slate-900 leading-none m-0">APP MÓVIL</h6>
                  <span class="text-[8px] sm:text-[8.5px] text-slate-500">Tu negocio en la mano</span>
                </div>
              </div>
              <ul class="text-[8px] sm:text-[8.5px] text-slate-600 space-y-0.5 list-none p-0 m-0 pt-0.5">
                <li>✓ Gestiona tu empresa</li>
                <li>✓ Ventas y pedidos</li>
                <li>✓ Inventario en vivo</li>
                <li>✓ Reportes en tiempo real</li>
              </ul>
            </div>
            <div class="w-10 sm:w-12 shrink-0 flex items-center justify-center">
              <img src="https://res.cloudinary.com/doxdjiyvi/image/upload/q_auto:eco,f_auto,w_200/v1787585921/camascotas-movilpq_l2puqq.png" alt="App Móvil" class="w-full h-auto max-h-16 object-contain drop-shadow-sm" loading="lazy"/>
            </div>
          </div>

          <!-- Card 3: WHATSAPP -->
          <div class="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex items-center justify-between gap-2 hover:border-slate-300 transition-colors flex-1">
            <div class="space-y-0.5 min-w-0">
              <div class="flex items-center gap-1.5">
                <div class="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-2.18-.553-1.637-.677-2.709-2.338-2.791-2.446-.082-.108-.669-.89-.669-1.696 0-.806.42-1.203.57-1.363.144-.155.314-.194.419-.194.105 0 .21.001.302.006.098.005.228-.037.356.27.132.318.452 1.102.492 1.183.04.082.067.177.013.283-.053.106-.08.172-.16.266-.08.093-.169.208-.242.279-.08.079-.163.165-.07.325.093.16.413.682.887 1.104.61.543 1.124.712 1.284.792.16.08.254.067.348-.04.094-.108.4-.467.507-.627.107-.16.214-.134.36-.08.146.054.928.438 1.088.518.16.08.267.12.307.187.04.066.04.385-.104.79z"/></svg>
                </div>
                <div>
                  <h6 class="text-[11px] sm:text-xs font-headline font-bold text-slate-900 leading-none m-0">WHATSAPP</h6>
                  <span class="text-[8px] sm:text-[8.5px] text-slate-500">Atención y ventas</span>
                </div>
              </div>
              <ul class="text-[8px] sm:text-[8.5px] text-slate-600 space-y-0.5 list-none p-0 m-0 pt-0.5">
                <li>✓ Atención al cliente</li>
                <li>✓ Consultas y pedidos</li>
                <li>✓ Notificaciones</li>
                <li>✓ Confirmaciones</li>
              </ul>
            </div>
            <div class="w-18 bg-slate-50 border border-slate-100 rounded-lg p-1.5 shrink-0 space-y-0.5">
              <div class="bg-white p-0.5 rounded text-[6px] text-slate-700 shadow-2xs leading-tight">¿Tienen disponible?</div>
              <div class="bg-emerald-100 text-emerald-900 p-0.5 rounded text-[6px] text-right leading-tight font-medium">¡Hola! Sí ✅</div>
            </div>
          </div>

          <!-- Card 4: IA INTELIGENTE -->
          <div class="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex items-center justify-between gap-2 hover:border-slate-300 transition-colors flex-1">
            <div class="space-y-0.5 min-w-0">
              <div class="flex items-center gap-1.5">
                <div class="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center p-0.5 shrink-0">
                  <img src="assets/icons/logo-link-light.png" class="w-full h-full object-contain" alt="RotBot AI">
                </div>
                <div>
                  <h6 class="text-[11px] sm:text-xs font-headline font-bold text-slate-900 leading-none m-0">IA INTELIGENTE</h6>
                  <span class="text-[8px] sm:text-[8.5px] text-slate-500">Asistente inteligente</span>
                </div>
              </div>
              <ul class="text-[8px] sm:text-[8.5px] text-slate-600 space-y-0.5 list-none p-0 m-0 pt-0.5">
                <li>✓ Responde consultas</li>
                <li>✓ Análisis de datos</li>
                <li>✓ Recomendaciones</li>
                <li>✓ Automatiza tareas</li>
              </ul>
            </div>
            <div class="w-18 bg-white border border-slate-100 rounded-lg p-1.5 shrink-0 shadow-2xs">
              <span class="text-[6px] font-bold text-slate-800 block leading-tight">Análisis Ventas</span>
              <p class="text-[5.5px] text-slate-400 leading-tight m-0">+18% este mes</p>
              <svg class="w-full h-3 mt-0.5 text-blue-400" viewBox="0 0 40 12" fill="none">
                <path d="M0 10 Q10 11, 20 6 T40 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class ErpDiagramComponent {}
