import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-erp-diagram',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="erp-diagram-canvas w-full max-w-[1020px] mx-auto bg-white rounded-[24px] sm:rounded-[32px] p-3 sm:p-5 lg:p-6 border border-slate-200/90 shadow-[0_15px_40px_rgba(0,0,0,0.04)] font-sans text-slate-800 relative select-none">
      
      <!-- Main Desktop Multi-Column Flex / Grid with Integrated Vector Connectors -->
      <div class="flex flex-col lg:flex-row items-stretch justify-between gap-2 sm:gap-3 lg:gap-0 relative">
        
        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- COL 1: BASE DE DATOS + LEYENDA (Left Box)                  -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <div class="w-full lg:w-[22%] flex flex-col justify-between gap-3 shrink-0">
          
          <!-- Base de Datos Card -->
          <div class="bg-white rounded-2xl border border-slate-200 p-3 sm:p-3.5 shadow-xs relative">
            <h5 class="text-[10px] sm:text-[11px] font-headline font-bold uppercase tracking-wider text-slate-500 mb-2.5 text-center">
              Base de Datos
            </h5>

            <!-- 3D Vector Cylinder Database Graphic -->
            <div class="w-14 h-18 mx-auto mb-2.5 relative flex flex-col items-center justify-center">
              <svg class="w-full h-full text-slate-400" viewBox="0 0 64 80" fill="none">
                <!-- Top Cap -->
                <ellipse cx="32" cy="16" rx="26" ry="10" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="2"/>
                <ellipse cx="32" cy="16" rx="20" ry="6" fill="#e2e8f0"/>
                
                <!-- Middle Layer 1 -->
                <path d="M6 16v18c0 5.523 11.64 10 26 10s26-4.477 26-10V16" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
                <path d="M6 34c0 5.523 11.64 10 26 10s26-4.477 26-10" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/>
                
                <!-- Middle Layer 2 -->
                <path d="M6 34v18c0 5.523 11.64 10 26 10s26-4.477 26-10V34" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
                <path d="M6 52c0 5.523 11.64 10 26 10s26-4.477 26-10" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/>

                <!-- Bottom Cap -->
                <path d="M6 52v12c0 5.523 11.64 10 26 10s26-4.477 26-10V52" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2"/>
              </svg>
            </div>

            <!-- Bullet List -->
            <ul class="text-[9px] sm:text-[10px] text-slate-600 space-y-1 list-none p-0 m-0">
              <li class="flex items-center gap-1.5"><span class="w-1 h-1 rounded-full bg-slate-400"></span><span>Clientes</span></li>
              <li class="flex items-center gap-1.5"><span class="w-1 h-1 rounded-full bg-slate-400"></span><span>Productos</span></li>
              <li class="flex items-center gap-1.5"><span class="w-1 h-1 rounded-full bg-slate-400"></span><span>Inventario</span></li>
              <li class="flex items-center gap-1.5"><span class="w-1 h-1 rounded-full bg-slate-400"></span><span>Pedidos</span></li>
              <li class="flex items-center gap-1.5"><span class="w-1 h-1 rounded-full bg-slate-400"></span><span>Proveedores</span></li>
              <li class="flex items-center gap-1.5"><span class="w-1 h-1 rounded-full bg-slate-400"></span><span>Usuarios</span></li>
              <li class="flex items-center gap-1.5"><span class="w-1 h-1 rounded-full bg-slate-400"></span><span>Configuraciones</span></li>
            </ul>
          </div>

          <!-- Leyenda Box -->
          <div class="bg-white rounded-xl border border-slate-200 p-2 text-[8px] sm:text-[9px] text-slate-600 space-y-1.5">
            <span class="font-headline font-bold uppercase text-slate-400 tracking-wider block">Leyenda</span>
            <div class="flex items-center gap-1.5">
              <svg class="w-4 h-2.5 text-slate-700 shrink-0" viewBox="0 0 24 12" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 6h14M8 2l-4 4 4 4M16 2l4 4-4 4"/>
              </svg>
              <span class="truncate">Sincronización Bidireccional</span>
            </div>
            <div class="flex items-center gap-1.5">
              <svg class="w-4 h-2.5 text-slate-400 shrink-0" viewBox="0 0 24 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M16 2l4 4-4 4"/>
              </svg>
              <span class="truncate">Conexión / Flujo de datos</span>
            </div>
          </div>

        </div>

        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- CONNECTOR 1: DB <─── Sincronización ───> ERP (Visible LG+) -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <div class="hidden lg:flex w-[6%] flex-col items-center justify-center relative py-4">
          <div class="flex flex-col items-center justify-center gap-1.5 w-full text-center">
            <span class="text-[7.5px] font-medium text-slate-500 bg-white border border-slate-200/90 px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap">
              Sincronización
            </span>
            <!-- Sleek Minimalist Double-Arrow Line -->
            <svg class="w-full h-3 text-slate-400/80" viewBox="0 0 50 12" fill="none">
              <!-- Line -->
              <line x1="6" y1="6" x2="44" y2="6" stroke="#cbd5e1" stroke-width="1.25"/>
              <!-- Left Arrowhead -->
              <path d="M9 3.5L5.5 6L9 8.5" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              <!-- Right Arrowhead -->
              <path d="M41 3.5L44.5 6L41 8.5" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- COL 2: USUARIOS + ERP CORE + ANALÍTICAS (Center Box)       -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <div class="w-full lg:w-[40%] flex flex-col justify-between gap-2.5 relative">
          
          <!-- Box 1: USUARIOS -->
          <div class="bg-white rounded-2xl border border-slate-200 p-2.5 shadow-xs">
            <span class="text-[9px] sm:text-[10px] font-headline font-bold uppercase tracking-wider text-slate-400 block mb-1.5 text-center sm:text-left">
              Usuarios
            </span>
            <div class="grid grid-cols-4 gap-1 text-center">
              <div class="flex flex-col items-center">
                <div class="w-6 h-6 flex items-center justify-center text-slate-700 mb-0.5">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/><circle cx="18" cy="18" r="1.5"/></svg>
                </div>
                <span class="text-[8.5px] sm:text-[9px] font-medium text-slate-700 leading-tight">Admin</span>
              </div>
              <div class="flex flex-col items-center">
                <div class="w-6 h-6 flex items-center justify-center text-slate-700 mb-0.5">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                </div>
                <span class="text-[8.5px] sm:text-[9px] font-medium text-slate-700 leading-tight">Ventas</span>
              </div>
              <div class="flex flex-col items-center">
                <div class="w-6 h-6 flex items-center justify-center text-slate-700 mb-0.5">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                </div>
                <span class="text-[8.5px] sm:text-[9px] font-medium text-slate-700 leading-tight">Inventario</span>
              </div>
              <div class="flex flex-col items-center">
                <div class="w-6 h-6 flex items-center justify-center text-slate-700 mb-0.5">
                  <div class="w-4.5 h-4.5 rounded-full border border-slate-700 flex items-center justify-center text-[9px] font-bold">$</div>
                </div>
                <span class="text-[8.5px] sm:text-[9px] font-medium text-slate-700 leading-tight">Finanzas</span>
              </div>
            </div>
          </div>

          <!-- Vertical Connector Between Users & ERP -->
          <div class="flex items-center justify-center -my-1">
            <svg class="w-3 h-4 text-slate-400" viewBox="0 0 12 16" fill="none">
              <line x1="6" y1="2" x2="6" y2="14" stroke="#cbd5e1" stroke-width="1.2" stroke-dasharray="2 2"/>
              <path d="M3.5 4.5L6 2L8.5 4.5" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3.5 11.5L6 14L8.5 11.5" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

          <!-- Box 2: ERP CORE CONTAINER -->
          <div class="bg-white rounded-2xl border-2 border-slate-300 p-3 sm:p-3.5 shadow-sm relative">
            
            <!-- Header -->
            <div class="flex items-center gap-2 mb-2.5">
              <!-- Blue 4-Grid Icon -->
              <div class="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                </svg>
              </div>
              <div>
                <h4 class="text-xs sm:text-sm font-headline font-extrabold text-slate-900 leading-none m-0">ERP</h4>
                <span class="text-[9px] sm:text-[10px] text-slate-500 font-normal">Gestiona tu empresa</span>
              </div>
            </div>

            <!-- 2 Column Internal Cards (Inventario & Ventas) -->
            <div class="grid grid-cols-2 gap-2 mb-2">
              
              <!-- Inventario Card -->
              <div class="bg-white rounded-xl border border-slate-200 p-2 flex flex-col items-center text-center shadow-2xs hover:border-slate-300 transition-colors">
                <div class="w-6 h-6 flex items-center justify-center text-slate-800 mb-1">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                </div>
                <h6 class="text-[10px] sm:text-[11px] font-headline font-bold text-slate-900 m-0">Inventario</h6>
                <p class="text-[8px] sm:text-[9px] text-slate-500 m-0 mt-0.5 leading-tight">Control de stock en tiempo real</p>
              </div>

              <!-- Ventas Card -->
              <div class="bg-white rounded-xl border border-slate-200 p-2 flex flex-col items-center text-center shadow-2xs hover:border-slate-300 transition-colors">
                <div class="w-6 h-6 flex items-center justify-center text-slate-800 mb-1">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
                <h6 class="text-[10px] sm:text-[11px] font-headline font-bold text-slate-900 m-0">Ventas</h6>
                <p class="text-[8px] sm:text-[9px] text-slate-500 m-0 mt-0.5 leading-tight">Órdenes y facturación</p>
              </div>

            </div>

            <!-- Wide Bottom Card: Clientes -->
            <div class="bg-white rounded-xl border border-slate-200 p-2 flex flex-col items-center text-center shadow-2xs hover:border-slate-300 transition-colors">
              <div class="w-6 h-6 flex items-center justify-center text-slate-800 mb-0.5">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <h6 class="text-[10px] sm:text-[11px] font-headline font-bold text-slate-900 m-0">Clientes</h6>
              <p class="text-[8px] sm:text-[9px] text-slate-500 m-0 mt-0.5 leading-tight">Gestión de clientes y contactos</p>
            </div>

          </div>

          <!-- Box 3: ANALÍTICAS Y REPORTES -->
          <div class="bg-white rounded-2xl border border-slate-200 p-2.5 shadow-xs">
            <span class="text-[9px] sm:text-[10px] font-headline font-bold uppercase tracking-wider text-slate-400 block mb-1.5 text-center sm:text-left">
              Analíticas y Reportes
            </span>
            <div class="grid grid-cols-5 gap-1 text-center">
              
              <div class="flex flex-col items-center">
                <div class="w-5 h-5 flex items-center justify-center text-slate-700 mb-0.5">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
                </div>
                <span class="text-[7.5px] sm:text-[8px] font-bold text-slate-800 block truncate">KPIs</span>
                <span class="text-[6.5px] sm:text-[7px] text-slate-400 block truncate">Métricas</span>
              </div>

              <div class="flex flex-col items-center">
                <div class="w-5 h-5 flex items-center justify-center text-slate-700 mb-0.5">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                </div>
                <span class="text-[7.5px] sm:text-[8px] font-bold text-slate-800 block truncate">Ventas</span>
                <span class="text-[6.5px] sm:text-[7px] text-slate-400 block truncate">Análisis</span>
              </div>

              <div class="flex flex-col items-center">
                <div class="w-5 h-5 flex items-center justify-center text-slate-700 mb-0.5">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                </div>
                <span class="text-[7.5px] sm:text-[8px] font-bold text-slate-800 block truncate">Stock</span>
                <span class="text-[6.5px] sm:text-[7px] text-slate-400 block truncate">Rotación</span>
              </div>

              <div class="flex flex-col items-center">
                <div class="w-5 h-5 flex items-center justify-center text-slate-700 mb-0.5">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </div>
                <span class="text-[7.5px] sm:text-[8px] font-bold text-slate-800 block truncate">Clientes</span>
                <span class="text-[6.5px] sm:text-[7px] text-slate-400 block truncate">Segmentos</span>
              </div>

              <div class="flex flex-col items-center">
                <div class="w-5 h-5 flex items-center justify-center text-slate-700 mb-0.5">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                </div>
                <span class="text-[7.5px] sm:text-[8px] font-bold text-slate-800 block truncate">Export</span>
                <span class="text-[6.5px] sm:text-[7px] text-slate-400 block truncate">PDF, XLS</span>
              </div>

            </div>
          </div>

        </div>

        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- CONNECTOR 2: ERP ───[Vertical Bus]───► Canales (Visible LG+)-->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <div class="hidden lg:flex w-[4%] relative flex-col justify-between py-6">
          <svg class="w-full h-full text-slate-400 overflow-visible" viewBox="0 0 30 380" fill="none">
            <!-- Vertical Main Bus Line -->
            <line x1="8" y1="40" x2="8" y2="340" stroke="#cbd5e1" stroke-width="1.2" />
            
            <!-- Connection 1 to Sitio Web (Top) -->
            <line x1="0" y1="45" x2="26" y2="45" stroke="#cbd5e1" stroke-width="1.2"/>
            <path d="M4 42L1 45L4 48" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 42L25.5 45L22 48" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            
            <!-- Connection 2 to App Móvil -->
            <line x1="0" y1="145" x2="26" y2="145" stroke="#cbd5e1" stroke-width="1.2"/>
            <path d="M4 142L1 145L4 148" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 142L25.5 145L22 148" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            
            <!-- Connection 3 to WhatsApp -->
            <line x1="0" y1="245" x2="26" y2="245" stroke="#cbd5e1" stroke-width="1.2"/>
            <path d="M4 242L1 245L4 248" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 242L25.5 245L22 248" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            
            <!-- Connection 4 to IA Inteligente (Bottom dashed curve) -->
            <path d="M8 340 H25" stroke="#cbd5e1" stroke-width="1.2" stroke-dasharray="2 2"/>
            <path d="M22 337L25.5 340L22 343" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>

        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- COL 3: 4 CANALES CONECTADOS (Right Box)                    -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <div class="w-full lg:w-[28%] flex flex-col justify-between gap-2 sm:gap-2.5">
          
          <!-- Card 1: SITIO WEB -->
          <div class="bg-white rounded-2xl border border-slate-200 p-2.5 shadow-xs flex items-center justify-between gap-2 hover:border-slate-300 transition-all">
            <div class="space-y-0.5">
              <div class="flex items-center gap-1.5">
                <div class="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                </div>
                <div>
                  <h6 class="text-[10px] sm:text-[11px] font-headline font-bold text-slate-900 leading-none m-0">SITIO WEB</h6>
                  <span class="text-[7.5px] sm:text-[8px] text-slate-500">Tu tienda en línea</span>
                </div>
              </div>
              <ul class="text-[7.5px] sm:text-[8px] text-slate-600 space-y-0.5 list-none p-0 m-0 pt-0.5">
                <li>✓ Catálogo de productos</li>
                <li>✓ Carrito de compras</li>
                <li>✓ Órdenes y pagos</li>
                <li>✓ Cuentas de cliente</li>
              </ul>
            </div>
            <!-- Real Screenshot Image -->
            <div class="w-18 sm:w-20 shrink-0">
              <img src="https://res.cloudinary.com/doxdjiyvi/image/upload/q_auto:eco,f_auto,w_400/v1787585847/e_p-heropq_yzeom8.png" 
                   alt="Sitio Web Mockup" 
                   class="w-full h-auto object-contain rounded shadow-2xs border border-slate-200/80" 
                   loading="lazy" />
            </div>
          </div>

          <!-- Card 2: APP MÓVIL -->
          <div class="bg-white rounded-2xl border border-slate-200 p-2.5 shadow-xs flex items-center justify-between gap-2 hover:border-slate-300 transition-all">
            <div class="space-y-0.5">
              <div class="flex items-center gap-1.5">
                <div class="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                </div>
                <div>
                  <h6 class="text-[10px] sm:text-[11px] font-headline font-bold text-slate-900 leading-none m-0">APP MÓVIL</h6>
                  <span class="text-[7.5px] sm:text-[8px] text-slate-500">Tu negocio en la mano</span>
                </div>
              </div>
              <ul class="text-[7.5px] sm:text-[8px] text-slate-600 space-y-0.5 list-none p-0 m-0 pt-0.5">
                <li>✓ Gestiona tu empresa</li>
                <li>✓ Ventas y pedidos</li>
                <li>✓ Inventario en vivo</li>
                <li>✓ Reportes en tiempo real</li>
              </ul>
            </div>
            <!-- Real App Screenshot -->
            <div class="w-10 sm:w-12 shrink-0 flex items-center justify-center">
              <img src="https://res.cloudinary.com/doxdjiyvi/image/upload/q_auto:eco,f_auto,w_250/v1787585921/camascotas-movilpq_l2puqq.png" 
                   alt="App Móvil Mockup" 
                   class="w-full h-auto max-h-14 object-contain rounded shadow-2xs drop-shadow-sm" 
                   loading="lazy" />
            </div>
          </div>

          <!-- Card 3: WHATSAPP -->
          <div class="bg-white rounded-2xl border border-slate-200 p-2.5 shadow-xs flex items-center justify-between gap-2 hover:border-slate-300 transition-all">
            <div class="space-y-0.5">
              <div class="flex items-center gap-1.5">
                <div class="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-2.18-.553-1.637-.677-2.709-2.338-2.791-2.446-.082-.108-.669-.89-.669-1.696 0-.806.42-1.203.57-1.363.144-.155.314-.194.419-.194.105 0 .21.001.302.006.098.005.228-.037.356.27.132.318.452 1.102.492 1.183.04.082.067.177.013.283-.053.106-.08.172-.16.266-.08.093-.169.208-.242.279-.08.079-.163.165-.07.325.093.16.413.682.887 1.104.61.543 1.124.712 1.284.792.16.08.254.067.348-.04.094-.108.4-.467.507-.627.107-.16.214-.134.36-.08.146.054.928.438 1.088.518.16.08.267.12.307.187.04.066.04.385-.104.79z"/></svg>
                </div>
                <div>
                  <h6 class="text-[10px] sm:text-[11px] font-headline font-bold text-slate-900 leading-none m-0">WHATSAPP</h6>
                  <span class="text-[7.5px] sm:text-[8px] text-slate-500">Atención y ventas</span>
                </div>
              </div>
              <ul class="text-[7.5px] sm:text-[8px] text-slate-600 space-y-0.5 list-none p-0 m-0 pt-0.5">
                <li>✓ Atención al cliente</li>
                <li>✓ Consultas y pedidos</li>
                <li>✓ Notificaciones</li>
                <li>✓ Confirmaciones</li>
              </ul>
            </div>
            <!-- Mini WhatsApp Chat Box Mockup -->
            <div class="w-18 bg-slate-50 border border-slate-200 rounded-lg p-1 shrink-0 space-y-0.5">
              <div class="bg-white p-0.5 rounded text-[5.5px] text-slate-700 shadow-2xs leading-tight">¿Tienen disponible?</div>
              <div class="bg-emerald-100 text-emerald-900 p-0.5 rounded text-[5.5px] text-right font-medium shadow-2xs leading-tight">¡Hola! Sí ✅</div>
            </div>
          </div>

          <!-- Card 4: IA INTELIGENTE (With Official Floating Chat Logo) -->
          <div class="bg-white rounded-2xl border border-slate-200 p-2.5 shadow-xs flex items-center justify-between gap-2 hover:border-slate-300 transition-all">
            <div class="space-y-0.5">
              <div class="flex items-center gap-1.5">
                <div class="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center p-0.5">
                  <img src="assets/icons/logo-link-light.png" class="w-full h-full object-contain" alt="RotBot AI">
                </div>
                <div>
                  <h6 class="text-[10px] sm:text-[11px] font-headline font-bold text-slate-900 leading-none m-0">IA INTELIGENTE</h6>
                  <span class="text-[7.5px] sm:text-[8px] text-slate-500">Asistente inteligente</span>
                </div>
              </div>
              <ul class="text-[7.5px] sm:text-[8px] text-slate-600 space-y-0.5 list-none p-0 m-0 pt-0.5">
                <li>✓ Responde consultas</li>
                <li>✓ Análisis de datos</li>
                <li>✓ Recomendaciones</li>
                <li>✓ Automatiza tareas</li>
              </ul>
            </div>
            <!-- Mini AI Insight Graph Card -->
            <div class="w-18 bg-white border border-slate-200 rounded-lg p-1 shrink-0 space-y-0.5 shadow-2xs">
              <span class="text-[5.5px] font-bold text-slate-800 block leading-tight">Análisis Ventas</span>
              <p class="text-[5px] text-slate-500 leading-tight m-0">+18% este mes</p>
              <div class="w-full h-2.5 flex items-end">
                <svg class="w-full h-full text-blue-500" viewBox="0 0 40 15" fill="none">
                  <path d="M0 12 Q 10 14, 20 8 T 40 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  `
})
export class ErpDiagramComponent {}
