import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-planes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="h-screen w-full flex flex-col overflow-hidden font-sans page-wrapper">
      
      <!-- SKELETON LOADER FOR PLANES -->
      <ng-container *ngIf="isLoading">
        <div class="flex-grow w-full pt-20 overflow-y-auto custom-scrollbar flex flex-col items-center animate-pulse">
           <!-- Header Skeleton -->
           <div class="w-full max-w-7xl px-6 py-12 md:py-16 text-center flex flex-col items-center">
             <div class="h-3 w-40 rounded-full opacity-20 mb-3" style="background-color: var(--text-primary, #fff);"></div>
             <div class="h-10 md:h-14 w-3/4 max-w-3xl rounded-2xl opacity-20 mb-4" style="background-color: var(--text-primary, #fff);"></div>
             <div class="h-4 w-2/3 max-w-2xl rounded-full opacity-10 mb-2" style="background-color: var(--text-primary, #fff);"></div>
             <div class="h-4 w-1/2 max-w-xl rounded-full opacity-10" style="background-color: var(--text-primary, #fff);"></div>
           </div>

           <!-- Grid Skeleton -->
           <div class="w-full max-w-[96%] mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 items-stretch">
             <div *ngFor="let _ of [1,2,3,4]" class="rounded-3xl border border-white/10 pt-10 px-8 pb-10 h-[500px] flex flex-col justify-between" style="background-color: rgba(255,255,255,0.02);">
               <div class="flex flex-col">
                 <div class="h-8 w-3/4 rounded-xl opacity-20 mb-3" style="background-color: var(--text-primary, #fff);"></div>
                 <div class="h-3 w-full rounded-full opacity-10 mb-2" style="background-color: var(--text-primary, #fff);"></div>
                 <div class="h-3 w-5/6 rounded-full opacity-10 mb-6" style="background-color: var(--text-primary, #fff);"></div>
                 <div class="h-px w-full opacity-20 mb-6" style="background-color: var(--text-primary, #fff);"></div>
                 
                 <div class="space-y-4">
                   <div *ngFor="let _ of [1,2,3,4]" class="flex items-center gap-3">
                     <div class="w-4 h-4 rounded-full opacity-20" style="background-color: var(--text-primary, #fff);"></div>
                     <div class="h-3 w-2/3 rounded-full opacity-10" style="background-color: var(--text-primary, #fff);"></div>
                   </div>
                 </div>
               </div>
               <div class="h-12 w-full rounded-xl opacity-10 mt-8" style="background-color: var(--text-primary, #fff);"></div>
             </div>
           </div>
        </div>
      </ng-container>

      <!-- Vista de Planes & Servicios -->
      <div *ngIf="!isLoading" class="flex-grow w-full pt-20 overflow-y-auto custom-scrollbar flex flex-col items-center">
        
        <!-- Hero/Banner Paquetes -->
        <div class="w-full max-w-7xl px-6 py-12 md:py-16 text-center">
          <span class="text-[10px] font-bold uppercase tracking-[0.3em] text-[#00f5ff]" style="color: var(--accent-color, #00f5ff);">Especialidades Portalink</span>
          <h1 class="text-4xl md:text-6xl font-headline uppercase tracking-tight text-white mt-3">Paquetes de Desarrollo & Sistemas</h1>
          <p class="text-sm md:text-base text-white/60 mt-4 max-w-2xl mx-auto leading-relaxed">
            Elige la solución que mejor se adapte a tu negocio. Configura tu landing page premium en tiempo real o implementa integraciones inteligentes a medida.
          </p>
        </div>        
        <!-- Grid de Paquetes -->
        <div class="w-full max-w-[96%] mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 items-stretch">
          
          <!-- Paquete 1: Landing Page -->
          <div class="plan-card rounded-3xl flex flex-col justify-between group overflow-hidden relative pt-10 px-8 pb-10 h-full transition-all duration-300">
            <!-- Top Content -->
            <div class="flex flex-col">
              <h3 class="text-2xl font-bold uppercase tracking-wide text-white mb-3 min-h-[56px] flex items-center">Landing Page</h3>
              <p class="text-xs text-white/55 mb-6 leading-relaxed min-h-[54px]">Sitio web de una sola página con todas las secciones que requieras, diseñado para captar clientes y presentar tu negocio de forma directa.</p>
              
              <div class="h-px w-full bg-white/10 mb-6"></div>
              
              <ul class="space-y-4 mb-8">
                <li class="text-[13px] text-white/70 flex items-center gap-3">
                  <svg class="w-4 h-4 flex-shrink-0" style="color: var(--accent-color, #00f5ff);" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Sitio de una sola página
                </li>
                <li class="text-[13px] text-white/70 flex items-center gap-3">
                  <svg class="w-4 h-4 flex-shrink-0" style="color: var(--accent-color, #00f5ff);" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Diseño móvil al gusto
                </li>
                <li class="text-[13px] text-white/70 flex items-center gap-3">
                  <svg class="w-4 h-4 flex-shrink-0" style="color: var(--accent-color, #00f5ff);" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Formulario de contacto
                </li>
                <li class="text-[13px] text-white/70 flex items-center gap-3">
                  <svg class="w-4 h-4 flex-shrink-0" style="color: var(--accent-color, #00f5ff);" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Hosting y SSL incluidos
                </li>
              </ul>
            </div>
            
            <!-- Bottom Action to Gallery -->
            <div class="mt-auto">
              <button (click)="exploreProjects('Landing Page', $event)" 
                      class="plan-btn-outlined w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer">
                <span>Explorar Proyectos →</span>
              </button>
            </div>
          </div>

          <!-- Paquete 3: E-commerce Autopersonalizable -->
          <div class="plan-card rounded-3xl flex flex-col justify-between group overflow-hidden relative pt-10 px-8 pb-10 h-full transition-all duration-300">
            <!-- Top Content -->
            <div class="flex flex-col">
              <h3 class="text-xl font-bold uppercase tracking-wide text-white mb-3 min-h-[56px] flex items-center">E-commerce Autopersonalizable</h3>
              <p class="text-xs text-white/55 mb-6 leading-relaxed min-h-[54px]">Tu tienda online con la libertad de cambiar el diseño, colores, fuentes y secciones en tiempo real con nuestro editor interactivo.</p>
              
              <div class="h-px w-full bg-white/10 mb-6"></div>
              
              <ul class="space-y-4 mb-8">
                <li class="text-[13px] text-white/70 flex items-center gap-3">
                  <svg class="w-4 h-4 flex-shrink-0" style="color: var(--accent-color, #00f5ff);" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Editor Visual Interactivo
                </li>
                <li class="text-[13px] text-white/70 flex items-center gap-3">
                  <svg class="w-4 h-4 flex-shrink-0" style="color: var(--accent-color, #00f5ff);" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Diseño móvil al gusto
                </li>
                <li class="text-[13px] text-white/70 flex items-center gap-3">
                  <svg class="w-4 h-4 flex-shrink-0" style="color: var(--accent-color, #00f5ff);" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Secciones premium en vivo
                </li>
                <li class="text-[13px] text-white/70 flex items-center gap-3">
                  <svg class="w-4 h-4 flex-shrink-0" style="color: var(--accent-color, #00f5ff);" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Autogestión de catálogo
                </li>
              </ul>
            </div>
            
            <!-- Bottom Action to Gallery -->
            <div class="mt-auto">
              <button (click)="exploreProjects('E-commerce', $event)" 
                      class="plan-btn-outlined w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer">
                <span>Explorar Proyectos →</span>
              </button>
            </div>
          </div>

          <!-- Paquete 4: E-commerce + IA + Autopersonalizable (MÁS VENDIDO) -->
          <div class="plan-card rounded-3xl flex flex-col justify-between group overflow-hidden relative h-full border-2 transition-all duration-300"
               style="border-color: var(--accent-color, #00f5ff);">
            <!-- Header Popular -->
            <div class="text-white text-[10px] font-bold uppercase tracking-[0.25em] py-3 text-center w-full"
                 style="background: var(--accent-color, #00f5ff); color: #000000;">
              MÁS VENDIDO
            </div>

            <div class="pt-8 px-8 pb-10 flex-grow flex flex-col justify-between">
              <!-- Top Content -->
              <div class="flex flex-col">
                <h3 class="text-xl font-bold uppercase tracking-wide text-white mb-3 min-h-[56px] flex items-center">E-commerce + IA + Autopersonalizable</h3>
                <p class="text-xs text-white/55 mb-6 leading-relaxed min-h-[54px]">La máxima potencia para tu negocio: tienda online personalizable integrada con inteligencia artificial (Rotbot IA) para potenciar tus ventas.</p>
                
                <div class="h-px w-full bg-white/10 mb-8"></div>
                
                <ul class="space-y-4 mb-8">
                  <li class="text-[13px] text-white/70 flex items-center gap-3">
                    <svg class="w-4 h-4 flex-shrink-0" style="color: var(--accent-color, #00f5ff);" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Copiloto Rotbot IA 24/7
                  </li>
                  <li class="text-[13px] text-white/70 flex items-center gap-3">
                    <svg class="w-4 h-4 flex-shrink-0" style="color: var(--accent-color, #00f5ff);" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Editor Visual Interactivo
                  </li>
                  <li class="text-[13px] text-white/70 flex items-center gap-3">
                    <svg class="w-4 h-4 flex-shrink-0" style="color: var(--accent-color, #00f5ff);" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Diseño móvil al gusto
                  </li>
                  <li class="text-[13px] text-white/70 flex items-center gap-3">
                    <svg class="w-4 h-4 flex-shrink-0" style="color: var(--accent-color, #00f5ff);" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Chatbots inteligentes
                  </li>
                </ul>
              </div>
              
              <!-- Bottom Action to Gallery -->
              <div class="mt-auto">
                <button (click)="exploreProjects('E-commerce + IA', $event)" 
                        class="plan-btn-filled w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
                        style="background: var(--accent-color, #00f5ff); color: #000000;">
                  <span>Explorar Proyectos →</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Paquete 5: Opciones Personalizadas -->
          <div class="plan-card rounded-3xl flex flex-col justify-between group overflow-hidden relative pt-10 px-8 pb-10 h-full transition-all duration-300">
            <!-- Top Content -->
            <div class="flex flex-col">
              <h3 class="text-2xl font-bold uppercase tracking-wide text-white mb-3 min-h-[56px] flex items-center">Opción Personalizada</h3>
              <p class="text-xs text-white/55 mb-6 leading-relaxed min-h-[54px]">¿Requieres algo único? Otras opciones personalizadas, habla con nuestro asistente, para ajustar cuál es la solución que requieres.</p>
              
              <div class="h-px w-full bg-white/10 mb-6"></div>
              
              <ul class="space-y-4 mb-8">
                <li class="text-[13px] text-white/70 flex items-center gap-3">
                  <svg class="w-4 h-4 flex-shrink-0" style="color: var(--accent-color, #00f5ff);" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Requerimientos a medida
                </li>
                <li class="text-[13px] text-white/70 flex items-center gap-3">
                  <svg class="w-4 h-4 flex-shrink-0" style="color: var(--accent-color, #00f5ff);" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Integraciones especiales (APIs)
                </li>
                <li class="text-[13px] text-white/70 flex items-center gap-3">
                  <svg class="w-4 h-4 flex-shrink-0" style="color: var(--accent-color, #00f5ff);" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Asesoría directa en sistemas
                </li>
                <li class="text-[13px] text-white/70 flex items-center gap-3">
                  <svg class="w-4 h-4 flex-shrink-0" style="color: var(--accent-color, #00f5ff);" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Escalabilidad garantizada
                </li>
              </ul>
            </div>
            
            <!-- Bottom Action to Gallery -->
            <div class="mt-auto">
              <button (click)="exploreProjects('Sistemas', $event)" 
                      class="plan-btn-outlined w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer">
                <span>Explorar Proyectos →</span>
              </button>
            </div>
          </div>

        </div>

        <!-- Sección de Servicios Incluidos -->
        <div class="w-full max-w-7xl px-6 pb-24">
          <div class="border-t border-white/10 pt-16 mb-12">
            <span class="text-[10px] font-bold uppercase tracking-[0.3em] text-[#00f5ff]" style="color: var(--accent-color, #00f5ff);">Estándar de Calidad</span>
            <h2 class="text-3xl md:text-4xl font-headline uppercase tracking-tight text-white mt-2">Servicios Incluidos en todos los Paquetes</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Servicio 1: Hosting & SSL -->
            <div class="service-card p-6 rounded-2xl transition-all border border-white/5 bg-white/[0.02] hover:bg-white/[0.04]">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center" style="color: var(--accent-color, #00f5ff);">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <h4 class="text-sm md:text-[15px] font-bold uppercase tracking-wide text-white">Hosting Veloz & SSL</h4>
              </div>
              <p class="text-xs md:text-[13px] text-white/55 leading-relaxed">
                Tu sitio alojado en servidores cloud de alta velocidad con certificado SSL HTTPS incluido de forma permanente.
              </p>
            </div>

            <!-- Servicio 2: SEO & Google -->
            <div class="service-card p-6 rounded-2xl transition-all border border-white/5 bg-white/[0.02] hover:bg-white/[0.04]">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center" style="color: var(--accent-color, #00f5ff);">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <h4 class="text-sm md:text-[15px] font-bold uppercase tracking-wide text-white">SEO & Google Ready</h4>
              </div>
              <p class="text-xs md:text-[13px] text-white/55 leading-relaxed">
                Estructura y metadatos optimizados para motores de búsqueda para posicionar tu negocio de manera orgánica.
              </p>
            </div>

            <!-- Servicio 3: Autogestionable -->
            <div class="service-card p-6 rounded-2xl transition-all border border-white/5 bg-white/[0.02] hover:bg-white/[0.04]">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center" style="color: var(--accent-color, #00f5ff);">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <line x1="4" y1="21" x2="4" y2="14"></line>
                    <line x1="4" y1="10" x2="4" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12" y2="3"></line>
                    <line x1="20" y1="21" x2="20" y2="16"></line>
                    <line x1="20" y1="12" x2="20" y2="3"></line>
                    <line x1="1" y1="14" x2="7" y2="14"></line>
                    <line x1="9" y1="8" x2="15" y2="8"></line>
                    <line x1="17" y1="16" x2="23" y2="16"></line>
                  </svg>
                </div>
                <h4 class="text-sm md:text-[15px] font-bold uppercase tracking-wide text-white">Autogestión Total</h4>
              </div>
              <p class="text-xs md:text-[13px] text-white/55 leading-relaxed">
                Modifica y actualiza imágenes, productos, descripciones y secciones fácilmente sin depender de programadores.
              </p>
            </div>

            <!-- Servicio 4: Monitoreo Constante -->
            <div class="service-card p-6 rounded-2xl transition-all border border-white/5 bg-white/[0.02] hover:bg-white/[0.04]">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center" style="color: var(--accent-color, #00f5ff);">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </div>
                <h4 class="text-sm md:text-[15px] font-bold uppercase tracking-wide text-white">Monitoreo 24/7</h4>
              </div>
              <p class="text-xs md:text-[13px] text-white/55 leading-relaxed">
                Supervisamos constantemente la disponibilidad y rendimiento del sistema para garantizar estabilidad total.
              </p>
            </div>

            <!-- Servicio 5: Estadísticas de Ventas -->
            <div class="service-card p-6 rounded-2xl transition-all border border-white/5 bg-white/[0.02] hover:bg-white/[0.04]">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center" style="color: var(--accent-color, #00f5ff);">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <h4 class="text-sm md:text-[15px] font-bold uppercase tracking-wide text-white">Reporte de Ventas</h4>
              </div>
              <p class="text-xs md:text-[13px] text-white/55 leading-relaxed">
                Visualiza estadísticas comerciales, pedidos e ingresos acumulados para medir el crecimiento de tu tienda.
              </p>
            </div>

            <!-- Servicio 6: Análisis de vistas -->
            <div class="service-card p-6 rounded-2xl transition-all border border-white/5 bg-white/[0.02] hover:bg-white/[0.04]">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center" style="color: var(--accent-color, #00f5ff);">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </div>
                <h4 class="text-sm md:text-[15px] font-bold uppercase tracking-wide text-white">Análisis de Vistas</h4>
              </div>
              <p class="text-xs md:text-[13px] text-white/55 leading-relaxed">
                Conoce las visitas recibidas, el origen geográfico de tus clientes y cuáles páginas despiertan mayor interés.
              </p>
            </div>

            <!-- Servicio 7: WhatsApp -->
            <div class="service-card p-6 rounded-2xl transition-all border border-white/5 bg-white/[0.02] hover:bg-white/[0.04]">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center" style="color: var(--accent-color, #00f5ff);">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <h4 class="text-sm md:text-[15px] font-bold uppercase tracking-wide text-white">Link a WhatsApp</h4>
              </div>
              <p class="text-xs md:text-[13px] text-white/55 leading-relaxed">
                Botones y llamados a la acción directos para canalizar el contacto directo y rápido de los clientes hacia tu chat.
              </p>
            </div>

            <!-- Servicio 8: Soporte Premium -->
            <div class="service-card p-6 rounded-2xl transition-all border border-white/5 bg-white/[0.02] hover:bg-white/[0.04]">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center" style="color: var(--accent-color, #00f5ff);">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <h4 class="text-sm md:text-[15px] font-bold uppercase tracking-wide text-white">Soporte Continuo</h4>
              </div>
              <p class="text-xs md:text-[13px] text-white/55 leading-relaxed">
                Soporte técnico preferente y actualizaciones periódicas para asegurar el funcionamiento óptimo de tu plataforma.
              </p>
            </div>

            <!-- Servicio 9: Código QR Dinámico -->
            <div class="service-card p-6 rounded-2xl transition-all border border-white/5 bg-white/[0.02] hover:bg-white/[0.04]">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center" style="color: var(--accent-color, #00f5ff);">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM10 10h4v4h-4zM14 17h2v2h-2zM17 14h4v2h-4zM20 20h1v1h-1zM17 17h1v1h-1zM14 20h2v1h-2zM10 17h2v4h-2z" />
                  </svg>
                </div>
                <h4 class="text-sm md:text-[15px] font-bold uppercase tracking-wide text-white">Código QR Dinámico</h4>
              </div>
              <p class="text-xs md:text-[13px] text-white/55 leading-relaxed">
                Código QR único vinculado a tu negocio para compartir de forma física, digital y en tus tarjetas de presentación.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .plan-card {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.05);
    }
    .plan-card:hover {
      background: rgba(255,255,255,0.03);
      border-color: rgba(255,255,255,0.15);
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    }
    .plan-btn-outlined {
      border: 1px solid rgba(255,255,255,0.15);
      color: rgba(255,255,255,0.8);
      transition: all 0.3s ease;
    }
    .plan-card:hover .plan-btn-outlined {
      background: #ffffff !important;
      color: #000000 !important;
      border-color: #ffffff !important;
    }
    .plan-btn-filled {
      transition: all 0.3s ease;
    }
    .plan-btn-filled:hover {
      background: #ffffff !important;
      color: #000000 !important;
    }
    .service-card {
      border: 1px solid var(--card-border);
      background: var(--card-bg);
      transition: all 0.3s ease;
    }
    .service-card:hover {
      border-color: var(--accent-color) !important;
      background: var(--card-border) !important;
      transform: translateY(-4px);
    }
  `]
})
export class PlanesComponent implements OnInit {
  isLoading = true;
  activeFilter = 'Todos';

  constructor(private router: Router) {}

  ngOnInit() {
    setTimeout(() => {
      this.isLoading = false;
    }, 800);
  }

  exploreProjects(category: string, event: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/planes-galeria'], { queryParams: { categoria: category } });
  }

  routerToRotbot(message: string) {
    this.router.navigate(['/rotbot']).then(() => {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('open-ai-chat', { detail: { message } }));
      }, 500);
    });
  }

  routerToPersonalizar() {
    this.router.navigate(['/personalizar']);
  }
}
