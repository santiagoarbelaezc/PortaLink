import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-erp-diagram',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="erp-diagram-canvas w-full max-w-[1000px] mx-auto bg-white rounded-[24px] sm:rounded-[32px] p-3 sm:p-6 border border-slate-200/90 shadow-[0_15px_40px_rgba(0,0,0,0.04)] font-sans text-slate-800 relative select-none">
      
      <!-- Grid Container: 3 Columns on Desktop (Base de Datos | Core ERP & Users | Canales) -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 lg:gap-5 items-start">
        
        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- COL 1: BASE DE DATOS + LEYENDA (2.5 Cols on MD+)           -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <div class="col-span-12 md:col-span-3 lg:col-span-3 flex flex-col gap-3">
          
          <!-- Base de Datos Card -->
          <div class="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-xs relative">
            <h5 class="text-[10px] sm:text-[11px] font-headline font-bold uppercase tracking-wider text-slate-500 mb-3 text-center">
              Base de Datos
            </h5>

            <!-- 3D Vector Cylinder Database Graphic -->
            <div class="w-16 h-20 mx-auto mb-3 relative flex flex-col items-center justify-center">
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
            <ul class="text-[10px] sm:text-[11px] text-slate-600 space-y-1.5 list-none p-0 m-0">
              <li class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                <span>Clientes</span>
              </li>
              <li class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                <span>Productos</span>
              </li>
              <li class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                <span>Inventario</span>
              </li>
              <li class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                <span>Pedidos</span>
              </li>
              <li class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                <span>Proveedores</span>
              </li>
              <li class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                <span>Usuarios</span>
              </li>
              <li class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                <span>Configuraciones</span>
              </li>
            </ul>
          </div>

          <!-- Leyenda Box -->
          <div class="bg-white rounded-xl border border-slate-200 p-2.5 sm:p-3 text-[9px] sm:text-[10px] text-slate-600 space-y-2">
            <span class="font-headline font-bold uppercase text-slate-400 tracking-wider block">Leyenda</span>
            <div class="flex items-center gap-2">
              <span class="text-slate-700 font-bold">⟷</span>
              <span>Sincronización Bidireccional</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-slate-400 font-bold">⇠⇢</span>
              <span>Conexión / Flujo de información</span>
            </div>
          </div>

        </div>

        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- COL 2: USUARIOS + ERP CENTRAL + ANALÍTICAS (5.5 Cols)      -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <div class="col-span-12 md:col-span-5 lg:col-span-5 flex flex-col gap-3 relative">
          
          <!-- Box 1: USUARIOS -->
          <div class="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs">
            <span class="text-[10px] font-headline font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center sm:text-left">
              Usuarios
            </span>
            <div class="grid grid-cols-4 gap-1 text-center">
              <div class="flex flex-col items-center">
                <div class="w-7 h-7 flex items-center justify-center text-slate-700 mb-1">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/><circle cx="18" cy="18" r="2"/></svg>
                </div>
                <span class="text-[9px] sm:text-[10px] font-medium text-slate-700 leading-tight">Admin</span>
              </div>
              <div class="flex flex-col items-center">
                <div class="w-7 h-7 flex items-center justify-center text-slate-700 mb-1">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                </div>
                <span class="text-[9px] sm:text-[10px] font-medium text-slate-700 leading-tight">Ventas</span>
              </div>
              <div class="flex flex-col items-center">
                <div class="w-7 h-7 flex items-center justify-center text-slate-700 mb-1">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                </div>
                <span class="text-[9px] sm:text-[10px] font-medium text-slate-700 leading-tight">Inventario</span>
              </div>
              <div class="flex flex-col items-center">
                <div class="w-7 h-7 flex items-center justify-center text-slate-700 mb-1">
                  <div class="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[10px] font-bold">$</div>
                </div>
                <span class="text-[9px] sm:text-[10px] font-medium text-slate-700 leading-tight">Finanzas</span>
              </div>
            </div>
          </div>

          <!-- Vertical Bidirectional Flow Indicator -->
          <div class="flex items-center justify-center -my-1">
            <span class="text-slate-400 font-bold text-xs">↕</span>
          </div>

          <!-- Box 2: ERP CORE CONTAINER -->
          <div class="bg-white rounded-2xl border-2 border-slate-300 p-3.5 sm:p-4 shadow-sm relative">
            
            <!-- Header -->
            <div class="flex items-center gap-2.5 mb-3.5">
              <!-- Blue 4-Grid Icon -->
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

            <!-- 2 Column Internal Cards (Inventario & Ventas) -->
            <div class="grid grid-cols-2 gap-2.5 mb-2.5">
              
              <!-- Inventario Card -->
              <div class="bg-white rounded-xl border border-slate-200 p-2.5 sm:p-3 flex flex-col items-center text-center shadow-2xs hover:border-slate-300 transition-colors">
                <div class="w-8 h-8 flex items-center justify-center text-slate-800 mb-1.5">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                </div>
                <h6 class="text-[11px] sm:text-xs font-headline font-bold text-slate-900 m-0">Inventario</h6>
                <p class="text-[9px] sm:text-[10px] text-slate-500 m-0 mt-0.5 leading-tight">Control de stock en tiempo real</p>
              </div>

              <!-- Ventas Card -->
              <div class="bg-white rounded-xl border border-slate-200 p-2.5 sm:p-3 flex flex-col items-center text-center shadow-2xs hover:border-slate-300 transition-colors">
                <div class="w-8 h-8 flex items-center justify-center text-slate-800 mb-1.5">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
                <h6 class="text-[11px] sm:text-xs font-headline font-bold text-slate-900 m-0">Ventas</h6>
                <p class="text-[9px] sm:text-[10px] text-slate-500 m-0 mt-0.5 leading-tight">Órdenes, cotizaciones y facturación</p>
              </div>

            </div>

            <!-- Wide Bottom Card: Clientes -->
            <div class="bg-white rounded-xl border border-slate-200 p-2.5 sm:p-3 flex flex-col items-center text-center shadow-2xs hover:border-slate-300 transition-colors">
              <div class="w-8 h-8 flex items-center justify-center text-slate-800 mb-1">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <h6 class="text-[11px] sm:text-xs font-headline font-bold text-slate-900 m-0">Clientes</h6>
              <p class="text-[9px] sm:text-[10px] text-slate-500 m-0 mt-0.5 leading-tight">Gestión de clientes y contactos</p>
            </div>

          </div>

          <!-- Box 3: ANALÍTICAS Y REPORTES -->
          <div class="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs">
            <span class="text-[10px] font-headline font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center sm:text-left">
              Analíticas y Reportes
            </span>
            <div class="grid grid-cols-5 gap-1 text-center">
              
              <div class="flex flex-col items-center">
                <div class="w-6 h-6 flex items-center justify-center text-slate-700 mb-0.5">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
                </div>
                <span class="text-[8px] sm:text-[9px] font-bold text-slate-800 block truncate">Dashboard</span>
                <span class="text-[7px] sm:text-[8px] text-slate-400 block truncate">Indicadores</span>
              </div>

              <div class="flex flex-col items-center">
                <div class="w-6 h-6 flex items-center justify-center text-slate-700 mb-0.5">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                </div>
                <span class="text-[8px] sm:text-[9px] font-bold text-slate-800 block truncate">Ventas</span>
                <span class="text-[7px] sm:text-[8px] text-slate-400 block truncate">Análisis</span>
              </div>

              <div class="flex flex-col items-center">
                <div class="w-6 h-6 flex items-center justify-center text-slate-700 mb-0.5">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                </div>
                <span class="text-[8px] sm:text-[9px] font-bold text-slate-800 block truncate">Inventario</span>
                <span class="text-[7px] sm:text-[8px] text-slate-400 block truncate">Rotación</span>
              </div>

              <div class="flex flex-col items-center">
                <div class="w-6 h-6 flex items-center justify-center text-slate-700 mb-0.5">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </div>
                <span class="text-[8px] sm:text-[9px] font-bold text-slate-800 block truncate">Clientes</span>
                <span class="text-[7px] sm:text-[8px] text-slate-400 block truncate">Comportamiento</span>
              </div>

              <div class="flex flex-col items-center">
                <div class="w-6 h-6 flex items-center justify-center text-slate-700 mb-0.5">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                </div>
                <span class="text-[8px] sm:text-[9px] font-bold text-slate-800 block truncate">Exportación</span>
                <span class="text-[7px] sm:text-[8px] text-slate-400 block truncate">PDF, Excel</span>
              </div>

            </div>
          </div>

        </div>

        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- COL 3: 4 CANALES CONECTADOS (4 Cols)                        -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <div class="col-span-12 md:col-span-4 lg:col-span-4 flex flex-col gap-2.5 sm:gap-3">
          
          <!-- Card 1: SITIO WEB -->
          <div class="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex items-center justify-between gap-2 hover:border-slate-300 transition-all">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                </div>
                <div>
                  <h6 class="text-[11px] sm:text-xs font-headline font-bold text-slate-900 leading-none m-0">SITIO WEB</h6>
                  <span class="text-[8px] sm:text-[9px] text-slate-500">Tu tienda en línea</span>
                </div>
              </div>
              <ul class="text-[8px] sm:text-[9px] text-slate-600 space-y-0.5 list-none p-0 m-0 pt-1">
                <li>✓ Catálogo de productos</li>
                <li>✓ Carrito de compras</li>
                <li>✓ Órdenes y pagos</li>
                <li>✓ Cuentas de cliente</li>
              </ul>
            </div>
            <!-- Real Screenshot Image Provided by User -->
            <div class="w-20 sm:w-24 flex-shrink-0">
              <img src="https://res.cloudinary.com/doxdjiyvi/image/upload/q_auto:eco,f_auto,w_400/v1787585847/e_p-heropq_yzeom8.png" 
                   alt="Sitio Web Mockup" 
                   class="w-full h-auto object-contain rounded-md shadow-xs border border-slate-200/80" 
                   loading="lazy" />
            </div>
          </div>

          <!-- Card 2: APP MÓVIL -->
          <div class="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex items-center justify-between gap-2 hover:border-slate-300 transition-all">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                </div>
                <div>
                  <h6 class="text-[11px] sm:text-xs font-headline font-bold text-slate-900 leading-none m-0">APP MÓVIL</h6>
                  <span class="text-[8px] sm:text-[9px] text-slate-500">Tu negocio en la mano</span>
                </div>
              </div>
              <ul class="text-[8px] sm:text-[9px] text-slate-600 space-y-0.5 list-none p-0 m-0 pt-1">
                <li>✓ Gestiona tu empresa</li>
                <li>✓ Ventas y pedidos</li>
                <li>✓ Inventario</li>
                <li>✓ Reportes en tiempo real</li>
              </ul>
            </div>
            <!-- Real App Screenshot Provided by User -->
            <div class="w-12 sm:w-14 flex-shrink-0 flex items-center justify-center">
              <img src="https://res.cloudinary.com/doxdjiyvi/image/upload/q_auto:eco,f_auto,w_250/v1787585921/camascotas-movilpq_l2puqq.png" 
                   alt="App Móvil Mockup" 
                   class="w-full h-auto max-h-16 object-contain rounded-md shadow-2xs drop-shadow-sm" 
                   loading="lazy" />
            </div>
          </div>

          <!-- Card 3: WHATSAPP -->
          <div class="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex items-center justify-between gap-2 hover:border-slate-300 transition-all">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-2.18-.553-1.637-.677-2.709-2.338-2.791-2.446-.082-.108-.669-.89-.669-1.696 0-.806.42-1.203.57-1.363.144-.155.314-.194.419-.194.105 0 .21.001.302.006.098.005.228-.037.356.27.132.318.452 1.102.492 1.183.04.082.067.177.013.283-.053.106-.08.172-.16.266-.08.093-.169.208-.242.279-.08.079-.163.165-.07.325.093.16.413.682.887 1.104.61.543 1.124.712 1.284.792.16.08.254.067.348-.04.094-.108.4-.467.507-.627.107-.16.214-.134.36-.08.146.054.928.438 1.088.518.16.08.267.12.307.187.04.066.04.385-.104.79z"/></svg>
                </div>
                <div>
                  <h6 class="text-[11px] sm:text-xs font-headline font-bold text-slate-900 leading-none m-0">WHATSAPP</h6>
                  <span class="text-[8px] sm:text-[9px] text-slate-500">Atención y ventas</span>
                </div>
              </div>
              <ul class="text-[8px] sm:text-[9px] text-slate-600 space-y-0.5 list-none p-0 m-0 pt-1">
                <li>✓ Atención al cliente</li>
                <li>✓ Consultas y pedidos</li>
                <li>✓ Notificaciones</li>
                <li>✓ Confirmaciones</li>
              </ul>
            </div>
            <!-- Mini WhatsApp Chat Box Mockup -->
            <div class="w-20 bg-slate-50 border border-slate-200 rounded-lg p-1.5 flex-shrink-0 space-y-1">
              <div class="bg-white p-1 rounded text-[6px] text-slate-700 shadow-2xs">¿Tienen disponible?</div>
              <div class="bg-emerald-100 text-emerald-900 p-1 rounded text-[6px] text-right font-medium shadow-2xs">¡Hola! Sí ✅</div>
            </div>
          </div>

          <!-- Card 4: IA INTELIGENTE (With Official Floating Chat Logo) -->
          <div class="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex items-center justify-between gap-2 hover:border-slate-300 transition-all">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center p-1">
                  <img src="assets/icons/logo-link-light.png" class="w-full h-full object-contain" alt="RotBot AI">
                </div>
                <div>
                  <h6 class="text-[11px] sm:text-xs font-headline font-bold text-slate-900 leading-none m-0">IA INTELIGENTE</h6>
                  <span class="text-[8px] sm:text-[9px] text-slate-500">Asistente inteligente</span>
                </div>
              </div>
              <ul class="text-[8px] sm:text-[9px] text-slate-600 space-y-0.5 list-none p-0 m-0 pt-1">
                <li>✓ Responde consultas</li>
                <li>✓ Análisis de datos</li>
                <li>✓ Recomendaciones</li>
                <li>✓ Automatiza tareas</li>
              </ul>
            </div>
            <!-- Mini AI Insight Graph Card -->
            <div class="w-20 bg-white border border-slate-200 rounded-lg p-1.5 flex-shrink-0 space-y-1 shadow-2xs">
              <span class="text-[6px] font-bold text-slate-800 block">Análisis Ventas</span>
              <p class="text-[5.5px] text-slate-500 leading-tight m-0">+18% este mes</p>
              <div class="w-full h-3 flex items-end">
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
