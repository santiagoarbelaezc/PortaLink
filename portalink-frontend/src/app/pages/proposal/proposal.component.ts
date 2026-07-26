import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-proposal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="proposal-page min-h-screen pt-24 sm:pt-28 pb-24 px-4 sm:px-8 lg:px-16 overflow-hidden transition-colors duration-500" style="background-color: var(--bg-primary); color: var(--text-primary);">
      
      <div class="max-w-[1400px] mx-auto space-y-24 sm:space-y-32">

        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- 1. HERO HEADER: ELEVA TU NEGOCIO                            -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <section class="text-center max-w-5xl mx-auto space-y-6 pt-4">

          <h1 class="text-6xl sm:text-7xl md:text-8xl lg:text-[100px] font-headline font-black uppercase leading-[0.95] tracking-tight text-white drop-shadow-2xl" style="font-family: var(--font-headline, sans-serif);">
            ELEVA TU NEGOCIO
          </h1>

          <p class="text-base sm:text-xl md:text-2xl font-light leading-relaxed max-w-3xl mx-auto" style="color: var(--text-secondary);">
            Soluciones de ingeniería a medida: Plataforma Web, App Móvil para tus clientes, Asistente de IA que agenda citas y un Dashboard interactivo para gestionar tus finanzas y tráfico.
          </p>

          <!-- Quick Action Buttons -->
          <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a href="https://wa.me/573054078225" target="_blank"
               class="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold uppercase text-xs sm:text-sm tracking-wider transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
              <img src="assets/icons/whatsapp-icon.png" alt="WhatsApp" class="w-6.5 h-6.5 sm:w-7 sm:h-7 object-contain" />
              <span>Agendar Proyecto en WhatsApp</span>
            </a>

            <a routerLink="/rotbot"
               class="inline-flex items-center gap-3 px-8 py-4 rounded-2xl border border-white/15 bg-white/[0.04] hover:bg-white/10 hover:border-cyan-400/50 text-white font-bold uppercase text-xs sm:text-sm tracking-wider transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
              <span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span>Consultar con RotBot IA</span>
            </a>
          </div>

        </section>


        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- 2. SECCIÓN 1: APLICACIÓN WEB                                -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <section class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          <!-- Content Column -->
          <div class="lg:col-span-6 space-y-6">
            <div class="flex items-center gap-4 mb-2">
              <div class="h-px w-12" style="background-color: var(--text-primary); opacity: 0.5;"></div>
              <span class="text-xs uppercase tracking-[0.4em] font-mono text-white font-bold" style="color: var(--text-secondary);">01 — PLATAFORMA DIGITAL</span>
            </div>

            <h2 class="text-3xl sm:text-4xl md:text-5xl font-headline font-black uppercase leading-[1.05] tracking-tight" style="font-family: var(--font-headline, sans-serif);">
              1. APLICACIÓN WEB A MEDIDA
            </h2>

            <p class="text-base sm:text-lg font-light leading-relaxed" style="color: var(--text-secondary);">
              Desarrollo web a medida con arquitectura moderna, carga instantánea, diseño de vanguardia y optimización SEO orientada a conversiones para posicionar tu empresa en los primeros lugares.
            </p>

            <div class="space-y-4 pt-2">
              <div class="flex items-start gap-3.5 text-base sm:text-lg font-light leading-relaxed" style="color: var(--text-secondary);">
                <svg class="w-5 h-5 text-white shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>Carga ultra rápida optimizada para motores de búsqueda (SEO)</span>
              </div>
              <div class="flex items-start gap-3.5 text-base sm:text-lg font-light leading-relaxed" style="color: var(--text-secondary);">
                <svg class="w-5 h-5 text-white shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>Diseño responsivo adaptable a computadores, tablets y celulares</span>
              </div>
              <div class="flex items-start gap-3.5 text-base sm:text-lg font-light leading-relaxed" style="color: var(--text-secondary);">
                <svg class="w-5 h-5 text-white shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>Seguridad SSL de grado bancario e integración con pasarelas de pago</span>
              </div>
            </div>
          </div>

          <!-- Image Column (Sysmicon Project Image) -->
          <div class="lg:col-span-6 relative flex justify-center">
            <div class="relative z-10 rounded-2xl border border-white/15 overflow-hidden shadow-2xl group">
              <img src="assets/images/proyectos/proyecto-sysmiconarquitectura.png" 
                   alt="Plataforma Web a Medida" 
                   class="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-all duration-700" />
            </div>
          </div>

        </section>


        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- 3. SECCIÓN 2: APP MÓVIL (SIN SOMBRA AZUL DE FONDO)          -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <section class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          <!-- Image Column (Camascotas Movil - Limpia sin sombra azul) -->
          <div class="lg:col-span-6 relative flex justify-center order-2 lg:order-1">
            <div class="relative z-10 max-w-sm sm:max-w-md w-full">
              <img src="assets/images/proyectos/camascotas/camascotas-movil.png" 
                   alt="Experiencia Móvil" 
                   class="w-full h-auto object-contain rounded-3xl transform hover:scale-[1.02] transition-all duration-700" />
            </div>

            <!-- Floating Badge Card -->
            <div class="absolute bottom-6 -right-2 sm:right-4 z-20 px-5 py-3.5 rounded-2xl bg-black/90 backdrop-blur-xl border border-white/15 text-white shadow-2xl flex items-center gap-3">
              <div class="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
              <div>
                <div class="text-xs font-bold uppercase tracking-wider">Experiencia de Usuario como App</div>
                <div class="text-[10px] text-neutral-400">Navegación Móvil Fluida</div>
              </div>
            </div>
          </div>

          <!-- Content Column -->
          <div class="lg:col-span-6 space-y-6 order-1 lg:order-2">
            <div class="flex items-center gap-4 mb-2">
              <div class="h-px w-12" style="background-color: var(--text-primary); opacity: 0.5;"></div>
              <span class="text-xs uppercase tracking-[0.4em] font-mono text-white font-bold" style="color: var(--text-secondary);">02 — EXPERIENCIA MÓVIL</span>
            </div>

            <h2 class="text-3xl sm:text-4xl md:text-5xl font-headline font-black uppercase leading-[1.05] tracking-tight" style="font-family: var(--font-headline, sans-serif);">
              2. TU APP MÓVIL PARA CLIENTES
            </h2>

            <p class="text-base sm:text-lg font-light leading-relaxed" style="color: var(--text-secondary);">
              Brinda a tus clientes una experiencia de usuario fluida e interactiva como una app móvil, permitiendo consultar tu catálogo, realizar compras y navegar velozmente desde cualquier smartphone.
            </p>

            <div class="space-y-4 pt-2">
              <div class="flex items-start gap-3.5 text-base sm:text-lg font-light leading-relaxed" style="color: var(--text-secondary);">
                <svg class="w-5 h-5 text-white shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>Experiencia de usuario fluida e interactiva optimizada para dispositivos móviles como una app nativa</span>
              </div>
              <div class="flex items-start gap-3.5 text-base sm:text-lg font-light leading-relaxed" style="color: var(--text-secondary);">
                <svg class="w-5 h-5 text-white shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>Acceso rápido a productos, servicios y compra inmediata desde el celular</span>
              </div>
              <div class="flex items-start gap-3.5 text-base sm:text-lg font-light leading-relaxed" style="color: var(--text-secondary);">
                <svg class="w-5 h-5 text-white shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>Sincronización en tiempo real con tu catálogo y plataforma web</span>
              </div>
            </div>
          </div>

        </section>


        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- 4. SECCIÓN 3: INTEGRACIÓN CON IA (ROTBOT MÁS GRANDE Y SIN SOMBRA) -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <section class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          <!-- Content Column -->
          <div class="lg:col-span-6 space-y-6">
            <div class="flex items-center gap-4 mb-2">
              <div class="h-px w-12" style="background-color: var(--text-primary); opacity: 0.5;"></div>
              <span class="text-xs uppercase tracking-[0.4em] font-mono text-white font-bold" style="color: var(--text-secondary);">03 — AUTOMATIZACIÓN 24/7</span>
            </div>

            <h2 class="text-3xl sm:text-4xl md:text-5xl font-headline font-black uppercase leading-[1.05] tracking-tight" style="font-family: var(--font-headline, sans-serif);">
              3. INTEGRACIÓN CON INTELIGENCIA ARTIFICIAL
            </h2>

            <p class="text-base sm:text-lg font-light leading-relaxed" style="color: var(--text-secondary);">
              Integramos una IA que responde dudas, atiende a tus clientes y agenda citas automáticamente las 24 horas del día, capacitada específicamente con la información de tus productos o servicios.
            </p>

            <div class="space-y-4 pt-2">
              <div class="flex items-start gap-3.5 text-base sm:text-lg font-light leading-relaxed" style="color: var(--text-secondary);">
                <svg class="w-5 h-5 text-white shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>Agendamiento automático de citas y reuniones directamente en tu agenda</span>
              </div>
              <div class="flex items-start gap-3.5 text-base sm:text-lg font-light leading-relaxed" style="color: var(--text-secondary);">
                <svg class="w-5 h-5 text-white shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>Respuesta en menos de 5 segundos con atención humana simulada</span>
              </div>
              <div class="flex items-start gap-3.5 text-base sm:text-lg font-light leading-relaxed" style="color: var(--text-secondary);">
                <svg class="w-5 h-5 text-white shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>Capacitación personalizada con el catálogo e información de tu negocio</span>
              </div>
            </div>

            <div class="pt-4">
              <a routerLink="/rotbot" 
                 class="group inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold uppercase text-xs sm:text-sm tracking-wider transition-all duration-300 hover:-translate-y-0.5 cursor-pointer shadow-lg">
                <span class="w-2.5 h-2.5 rounded-full bg-black/80 animate-pulse shrink-0"></span>
                <span class="whitespace-nowrap">Probar RotBot IA Ahora</span>
                <svg class="w-5 h-5 transform group-hover:translate-x-1 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </div>
          </div>

          <!-- Image Column (RotBot IA Más Grande y Sin Sombra Azul) -->
          <div class="lg:col-span-6 relative flex justify-center">
            <div class="relative z-10 max-w-md sm:max-w-lg lg:max-w-xl w-full flex flex-col items-center">
              <img src="assets/images/rotbot4.png" 
                   alt="Asistente RotBot IA" 
                   class="w-full h-auto object-contain transform hover:scale-[1.02] transition-all duration-500" />
              

            </div>
          </div>

        </section>


        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- 5. SECCIÓN 4: DASHBOARD ORGANIZACIONAL PROFESIONAL          -->
        <!-- ══════════════════════�            <!-- Selector Interactivo de Pestañas (Finanzas, Tráfico, Citas IA) -->
            <div class="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button (click)="setTab('finanzas')"
                      [class]="activeTab === 'finanzas' 
                        ? 'px-5 py-3 rounded-2xl bg-[#ccff00] text-black font-extrabold uppercase text-[11px] tracking-wider shadow-[0_4px_20px_rgba(204,255,0,0.3)] transition-all flex items-center gap-2 cursor-pointer'
                        : 'px-5 py-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/10 text-white font-bold uppercase text-[11px] tracking-wider transition-all flex items-center gap-2 cursor-pointer'">
                <span class="w-2 h-2 rounded-full" [class]="activeTab === 'finanzas' ? 'bg-black' : 'bg-[#ccff00]'"></span>
                <span>Finanzas & Rentabilidad</span>
              </button>

              <button (click)="setTab('trafico')"
                      [class]="activeTab === 'trafico' 
                        ? 'px-5 py-3 rounded-2xl bg-[#ccff00] text-black font-extrabold uppercase text-[11px] tracking-wider shadow-[0_4px_20px_rgba(204,255,0,0.3)] transition-all flex items-center gap-2 cursor-pointer'
                        : 'px-5 py-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/10 text-white font-bold uppercase text-[11px] tracking-wider transition-all flex items-center gap-2 cursor-pointer'">
                <span class="w-2 h-2 rounded-full" [class]="activeTab === 'trafico' ? 'bg-black' : 'bg-[#ccff00]'"></span>
                <span>Tráfico & Audiencia</span>
              </button>

              <button (click)="setTab('citas')"
                      [class]="activeTab === 'citas' 
                        ? 'px-5 py-3 rounded-2xl bg-[#ccff00] text-black font-extrabold uppercase text-[11px] tracking-wider shadow-[0_4px_20px_rgba(204,255,0,0.3)] transition-all flex items-center gap-2 cursor-pointer'
                        : 'px-5 py-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/10 text-white font-bold uppercase text-[11px] tracking-wider transition-all flex items-center gap-2 cursor-pointer'">
                <span class="w-2 h-2 rounded-full" [class]="activeTab === 'citas' ? 'bg-black' : 'bg-[#ccff00]'"></span>
                <span>Citas & Leads IA</span>
              </button>
            </div>
          </div>

          <!-- MOCKUP DEL DASHBOARD ORGANIZACIONAL PROFESIONAL (MONOCHROME & LIME ACCENT) -->
          <div class="relative rounded-3xl border border-white/15 bg-[#050505] p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.9)] overflow-hidden">
            
            <!-- Barra Superior Corporativa -->
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 mb-6 border-b border-white/10 relative z-10">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-black text-xs tracking-tighter shadow-md">
                  PL
                </div>
                <div>
                  <h3 class="text-lg sm:text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <span>PORTALINK EXECUTIVE CONTROL</span>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30 font-bold">ONLINE</span>
                  </h3>
                  <p class="text-xs text-neutral-400">Sistema de analítica empresarial y flujo de caja en tiempo real</p>
                </div>
              </div>

              <!-- Stream Ticker de Eventos en Vivo -->
              <div class="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-neutral-300">
                <span class="w-2.5 h-2.5 rounded-full bg-[#ccff00] animate-ping"></span>
                <span class="text-[#ccff00] font-bold">{{ lastActivityText }}</span>
              </div>
            </div>

            <!-- TAB 1: FINANZAS & RENTABILIDAD -->
            <div *ngIf="activeTab === 'finanzas'" class="space-y-6 relative z-10 animate-fade-in">
              
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <!-- KPI Card 1: Ingresos Brutos -->
                <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 hover:border-[#ccff00]/50 transition-all relative overflow-hidden group">
                  <div class="flex items-center justify-between">
                    <span class="text-neutral-400 text-xs font-bold uppercase tracking-wider">Ingresos Brutos</span>
                    <div class="w-9 h-9 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                  </div>
                  <div class="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight flex items-center gap-2">
                    <span>\${{ formatMoney(revenueMetric) }}</span>
                    <span class="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse"></span>
                  </div>
                  <div class="text-xs text-[#ccff00] font-semibold flex items-center gap-1">
                    <span>↑ +28.4%</span>
                    <span class="text-neutral-400 font-normal">flujo de caja acumulado</span>
                  </div>
                </div>

                <!-- KPI Card 2: Margen Neto -->
                <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 hover:border-white/30 transition-all">
                  <div class="flex items-center justify-between">
                    <span class="text-neutral-400 text-xs font-bold uppercase tracking-wider">Margen Neto</span>
                    <div class="w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-white flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                  </div>
                  <div class="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                    \${{ formatMoney(netBalanceMetric) }}
                  </div>
                  <div class="text-xs text-[#ccff00] font-semibold flex items-center gap-1">
                    <span>↑ 66.7%</span>
                    <span class="text-neutral-400 font-normal">utilidad limpia</span>
                  </div>
                </div>

                <!-- KPI Card 3: Ticket Promedio -->
                <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 hover:border-white/30 transition-all">
                  <div class="flex items-center justify-between">
                    <span class="text-neutral-400 text-xs font-bold uppercase tracking-wider">Ticket Promedio</span>
                    <div class="w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-white flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                    </div>
                  </div>
                  <div class="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                    \${{ formatMoney(ticketMetric) }}
                  </div>
                  <div class="text-xs text-[#ccff00] font-semibold">↑ Venta promedio optimizada</div>
                </div>

                <!-- KPI Card 4: Retorno ROI -->
                <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 hover:border-white/30 transition-all">
                  <div class="flex items-center justify-between">
                    <span class="text-neutral-400 text-xs font-bold uppercase tracking-wider">Retorno ROI</span>
                    <div class="w-9 h-9 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                    </div>
                  </div>
                  <div class="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                    340%
                  </div>
                  <div class="text-xs text-white font-semibold">Rentabilidad comprobada</div>
                </div>

              </div>

              <!-- Gráfica de Rendimiento Financiero Corporativo en Negro, Blanco y Verde Amarillento -->
              <div class="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                <div class="flex items-center justify-between">
                  <h4 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <svg class="w-4 h-4 text-[#ccff00]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>
                    Proyección e Ingresos Mensuales Acumulados
                  </h4>
                  <span class="text-xs font-mono text-[#ccff00] font-bold">Sumando Transacciones (Pasa el cursor)</span>
                </div>

                <div class="grid grid-cols-6 items-end gap-3.5 h-56 pt-8 pb-2 border-b border-white/10">
                  <!-- Enero -->
                  <div class="relative group/bar flex flex-col items-center justify-end h-full">
                    <div class="absolute -top-9 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 pointer-events-none z-30 bg-black text-white border border-[#ccff00]/50 px-2.5 py-1 rounded-xl shadow-xl text-center whitespace-nowrap">
                      <div class="text-[11px] font-bold text-[#ccff00] font-mono">$18.500.000</div>
                      <div class="text-[9px] text-neutral-400">Enero (+12.4%)</div>
                    </div>
                    <div class="w-full bg-[#ccff00]/25 group-hover/bar:bg-[#ccff00] transition-all duration-300 h-20 rounded-t-lg border-t-2 border-[#ccff00] cursor-pointer"></div>
                    <span class="text-[10px] font-mono text-neutral-400 mt-2">Ene</span>
                  </div>

                  <!-- Febrero -->
                  <div class="relative group/bar flex flex-col items-center justify-end h-full">
                    <div class="absolute -top-9 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 pointer-events-none z-30 bg-black text-white border border-[#ccff00]/50 px-2.5 py-1 rounded-xl shadow-xl text-center whitespace-nowrap">
                      <div class="text-[11px] font-bold text-[#ccff00] font-mono">$24.200.000</div>
                      <div class="text-[9px] text-neutral-400">Febrero (+15.1%)</div>
                    </div>
                    <div class="w-full bg-[#ccff00]/35 group-hover/bar:bg-[#ccff00] transition-all duration-300 h-28 rounded-t-lg border-t-2 border-[#ccff00] cursor-pointer"></div>
                    <span class="text-[10px] font-mono text-neutral-400 mt-2">Feb</span>
                  </div>

                  <!-- Marzo -->
                  <div class="relative group/bar flex flex-col items-center justify-end h-full">
                    <div class="absolute -top-9 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 pointer-events-none z-30 bg-black text-white border border-[#ccff00]/50 px-2.5 py-1 rounded-xl shadow-xl text-center whitespace-nowrap">
                      <div class="text-[11px] font-bold text-[#ccff00] font-mono">$29.800.000</div>
                      <div class="text-[9px] text-neutral-400">Marzo (+18.3%)</div>
                    </div>
                    <div class="w-full bg-[#ccff00]/45 group-hover/bar:bg-[#ccff00] transition-all duration-300 h-32 rounded-t-lg border-t-2 border-[#ccff00] cursor-pointer"></div>
                    <span class="text-[10px] font-mono text-neutral-400 mt-2">Mar</span>
                  </div>

                  <!-- Abril -->
                  <div class="relative group/bar flex flex-col items-center justify-end h-full">
                    <div class="absolute -top-9 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 pointer-events-none z-30 bg-black text-white border border-[#ccff00]/50 px-2.5 py-1 rounded-xl shadow-xl text-center whitespace-nowrap">
                      <div class="text-[11px] font-bold text-[#ccff00] font-mono">$34.500.000</div>
                      <div class="text-[9px] text-neutral-400">Abril (+21.0%)</div>
                    </div>
                    <div class="w-full bg-[#ccff00]/60 group-hover/bar:bg-[#ccff00] transition-all duration-300 h-36 rounded-t-lg border-t-2 border-[#ccff00] cursor-pointer"></div>
                    <span class="text-[10px] font-mono text-neutral-400 mt-2">Abr</span>
                  </div>

                  <!-- Mayo -->
                  <div class="relative group/bar flex flex-col items-center justify-end h-full">
                    <div class="absolute -top-9 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 pointer-events-none z-30 bg-black text-white border border-[#ccff00]/50 px-2.5 py-1 rounded-xl shadow-xl text-center whitespace-nowrap">
                      <div class="text-[11px] font-bold text-[#ccff00] font-mono">$41.000.000</div>
                      <div class="text-[9px] text-neutral-400">Mayo (+24.5%)</div>
                    </div>
                    <div class="w-full bg-[#ccff00]/80 group-hover/bar:bg-[#ccff00] transition-all duration-300 h-40 rounded-t-lg border-t-2 border-[#ccff00] cursor-pointer"></div>
                    <span class="text-[10px] font-mono text-neutral-400 mt-2">May</span>
                  </div>

                  <!-- Junio (En Vivo) -->
                  <div class="relative group/bar flex flex-col items-center justify-end h-full">
                    <div class="absolute -top-9 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 pointer-events-none z-30 bg-black text-white border border-[#ccff00] px-2.5 py-1 rounded-xl shadow-xl text-center whitespace-nowrap">
                      <div class="text-[11px] font-bold text-[#ccff00] font-mono">\${{ formatMoney(revenueMetric) }}</div>
                      <div class="text-[9px] text-white font-bold">Junio (En Vivo ↑ +28.4%)</div>
                    </div>
                    <div class="w-full bg-[#ccff00] group-hover/bar:bg-[#d8ff33] transition-all duration-300 h-48 rounded-t-lg border-t-2 border-white shadow-[0_0_25px_rgba(204,255,0,0.6)] cursor-pointer"></div>
                    <span class="text-[10px] font-mono font-bold text-[#ccff00] mt-2">Jun</span>
                  </div>

                </div>
              </div>
            </div>

            <!-- TAB 2: TRÁFICO & AUDIENCIA (MÉTRICAS FLUCTUANTES EN VIVO) -->
            <div *ngIf="activeTab === 'trafico'" class="space-y-6 relative z-10 animate-fade-in">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 hover:border-white/30 transition-all">
                  <div class="flex items-center justify-between">
                    <span class="text-neutral-400 text-xs font-bold uppercase tracking-wider">Visitas Únicas</span>
                    <div class="w-9 h-9 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    </div>
                  </div>
                  <div class="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight flex items-center gap-2">
                    <span>{{ trafficMetric.toLocaleString('es-CO') }}</span>
                    <span class="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse"></span>
                  </div>
                  <div class="text-xs text-[#ccff00] font-semibold">↑ +35.2% crecimiento constante</div>
                </div>

                <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 hover:border-white/30 transition-all">
                  <div class="flex items-center justify-between">
                    <span class="text-neutral-400 text-xs font-bold uppercase tracking-wider">Tasa Conversión</span>
                    <div class="w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-white flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                    </div>
                  </div>
                  <div class="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                    4.8%
                  </div>
                  <div class="text-xs text-white font-semibold">SEO & Carga ultrarrápida</div>
                </div>

                <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 hover:border-white/30 transition-all">
                  <div class="flex items-center justify-between">
                    <span class="text-neutral-400 text-xs font-bold uppercase tracking-wider">Tiempo Medio</span>
                    <div class="w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-white flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                  </div>
                  <div class="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                    3m 45s
                  </div>
                  <div class="text-xs text-[#ccff00] font-semibold">Alta retención de clientes</div>
                </div>

                <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 hover:border-white/30 transition-all">
                  <div class="flex items-center justify-between">
                    <span class="text-neutral-400 text-xs font-bold uppercase tracking-wider">Páginas / Sesión</span>
                    <div class="w-9 h-9 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
                    </div>
                  </div>
                  <div class="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                    4.2
                  </div>
                  <div class="text-xs text-white font-semibold">Navegación intuitiva</div>
                </div>

              </div>

              <!-- Gráfica de Flujo de Tráfico Interactivo de Alto Nivel -->
              <div class="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-6">
                
                <!-- Top Summary Metrics & Header -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
                  <div class="space-y-1">
                    <h4 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <svg class="w-4 h-4 text-[#ccff00]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                      Flujo de Tráfico y Visitas Diarias
                    </h4>
                    <p class="text-xs text-neutral-400">Monitoreo continuo de tráfico web y comportamiento de audiencia</p>
                  </div>

                  <div class="flex items-center gap-4 text-xs font-mono">
                    <div class="px-3 py-1.5 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse"></span>
                      <span>Pico Máximo: <strong>{{ trafficMetric.toLocaleString('es-CO') }} / día</strong></span>
                    </div>
                    <div class="hidden md:flex px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white items-center gap-2">
                      <span>Crecimiento: <strong>+35.2%</strong></span>
                    </div>
                  </div>
                </div>

                <div class="relative w-full pt-4">
                  <!-- Container del Gráfico con Alineación Exacta -->
                  <div class="w-full h-56 relative">
                    <svg class="w-full h-full overflow-visible" viewBox="0 0 500 130" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="limeTrafficGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stop-color="#ccff00" stop-opacity="0.3"/>
                          <stop offset="100%" stop-color="#ccff00" stop-opacity="0.0"/>
                        </linearGradient>
                      </defs>

                      <!-- Grid Lines Horizontales con Escala Y -->
                      <line x1="0" y1="20" x2="500" y2="20" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3"/>
                      <line x1="0" y1="55" x2="500" y2="55" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3"/>
                      <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3"/>
                      
                      <!-- Area Fill & Exact Curve Line -->
                      <path d="M 0,105 L 100,85 L 200,68 L 300,52 L 400,36 L 500,20 L 500,130 L 0,130 Z" fill="url(#limeTrafficGradient)"/>
                      <path d="M 0,105 L 100,85 L 200,68 L 300,52 L 400,36 L 500,20" fill="none" stroke="#ccff00" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>

                    <!-- Interactive Month Columns Overlaid at Exact Percent Heights -->
                    <div class="absolute inset-0 grid grid-cols-6 z-20">
                      
                      <!-- Ene -->
                      <div class="relative group/traffic flex flex-col items-center justify-start">
                        <div class="absolute inset-y-0 w-px bg-[#ccff00]/20 group-hover/traffic:bg-[#ccff00] border-r border-dashed border-[#ccff00]/50 opacity-0 group-hover/traffic:opacity-100 transition-opacity pointer-events-none"></div>
                        <div class="absolute top-[80.7%] -translate-y-1/2 flex flex-col items-center">
                          <div class="w-4 h-4 rounded-full bg-[#ccff00] group-hover/traffic:scale-150 transition-all shadow-[0_0_12px_#ccff00] ring-4 ring-[#ccff00]/20 cursor-pointer"></div>
                          <div class="absolute -top-12 opacity-0 group-hover/traffic:opacity-100 transition-all duration-300 pointer-events-none z-30 bg-black text-white border border-[#ccff00]/50 px-3 py-1.5 rounded-xl shadow-2xl text-center whitespace-nowrap">
                            <div class="text-[11px] font-black text-[#ccff00] font-mono">8.450 Visitas</div>
                            <div class="text-[9px] text-neutral-300">Enero (+14%)</div>
                          </div>
                        </div>
                      </div>

                      <!-- Feb -->
                      <div class="relative group/traffic flex flex-col items-center justify-start">
                        <div class="absolute inset-y-0 w-px bg-[#ccff00]/20 group-hover/traffic:bg-[#ccff00] border-r border-dashed border-[#ccff00]/50 opacity-0 group-hover/traffic:opacity-100 transition-opacity pointer-events-none"></div>
                        <div class="absolute top-[65.3%] -translate-y-1/2 flex flex-col items-center">
                          <div class="w-4 h-4 rounded-full bg-[#ccff00] group-hover/traffic:scale-150 transition-all shadow-[0_0_12px_#ccff00] ring-4 ring-[#ccff00]/20 cursor-pointer"></div>
                          <div class="absolute -top-12 opacity-0 group-hover/traffic:opacity-100 transition-all duration-300 pointer-events-none z-30 bg-black text-white border border-[#ccff00]/50 px-3 py-1.5 rounded-xl shadow-2xl text-center whitespace-nowrap">
                            <div class="text-[11px] font-black text-[#ccff00] font-mono">11.200 Visitas</div>
                            <div class="text-[9px] text-neutral-300">Febrero (+18%)</div>
                          </div>
                        </div>
                      </div>

                      <!-- Mar -->
                      <div class="relative group/traffic flex flex-col items-center justify-start">
                        <div class="absolute inset-y-0 w-px bg-[#ccff00]/20 group-hover/traffic:bg-[#ccff00] border-r border-dashed border-[#ccff00]/50 opacity-0 group-hover/traffic:opacity-100 transition-opacity pointer-events-none"></div>
                        <div class="absolute top-[52.3%] -translate-y-1/2 flex flex-col items-center">
                          <div class="w-4 h-4 rounded-full bg-[#ccff00] group-hover/traffic:scale-150 transition-all shadow-[0_0_12px_#ccff00] ring-4 ring-[#ccff00]/20 cursor-pointer"></div>
                          <div class="absolute -top-12 opacity-0 group-hover/traffic:opacity-100 transition-all duration-300 pointer-events-none z-30 bg-black text-white border border-[#ccff00]/50 px-3 py-1.5 rounded-xl shadow-2xl text-center whitespace-nowrap">
                            <div class="text-[11px] font-black text-[#ccff00] font-mono">13.900 Visitas</div>
                            <div class="text-[9px] text-neutral-300">Marzo (+22%)</div>
                          </div>
                        </div>
                      </div>

                      <!-- Abr -->
                      <div class="relative group/traffic flex flex-col items-center justify-start">
                        <div class="absolute inset-y-0 w-px bg-[#ccff00]/20 group-hover/traffic:bg-[#ccff00] border-r border-dashed border-[#ccff00]/50 opacity-0 group-hover/traffic:opacity-100 transition-opacity pointer-events-none"></div>
                        <div class="absolute top-[40%] -translate-y-1/2 flex flex-col items-center">
                          <div class="w-4 h-4 rounded-full bg-[#ccff00] group-hover/traffic:scale-150 transition-all shadow-[0_0_12px_#ccff00] ring-4 ring-[#ccff00]/20 cursor-pointer"></div>
                          <div class="absolute -top-12 opacity-0 group-hover/traffic:opacity-100 transition-all duration-300 pointer-events-none z-30 bg-black text-white border border-[#ccff00]/50 px-3 py-1.5 rounded-xl shadow-2xl text-center whitespace-nowrap">
                            <div class="text-[11px] font-black text-[#ccff00] font-mono">15.600 Visitas</div>
                            <div class="text-[9px] text-neutral-300">Abril (+25%)</div>
                          </div>
                        </div>
                      </div>

                      <!-- May -->
                      <div class="relative group/traffic flex flex-col items-center justify-start">
                        <div class="absolute inset-y-0 w-px bg-[#ccff00]/20 group-hover/traffic:bg-[#ccff00] border-r border-dashed border-[#ccff00]/50 opacity-0 group-hover/traffic:opacity-100 transition-opacity pointer-events-none"></div>
                        <div class="absolute top-[27.6%] -translate-y-1/2 flex flex-col items-center">
                          <div class="w-4 h-4 rounded-full bg-[#ccff00] group-hover/traffic:scale-150 transition-all shadow-[0_0_12px_#ccff00] ring-4 ring-[#ccff00]/20 cursor-pointer"></div>
                          <div class="absolute -top-12 opacity-0 group-hover/traffic:opacity-100 transition-all duration-300 pointer-events-none z-30 bg-black text-white border border-[#ccff00]/50 px-3 py-1.5 rounded-xl shadow-2xl text-center whitespace-nowrap">
                            <div class="text-[11px] font-black text-[#ccff00] font-mono">17.100 Visitas</div>
                            <div class="text-[9px] text-neutral-300">Mayo (+30%)</div>
                          </div>
                        </div>
                      </div>

                      <!-- Jun -->
                      <div class="relative group/traffic flex flex-col items-center justify-start">
                        <div class="absolute inset-y-0 w-px bg-[#ccff00]/30 group-hover/traffic:bg-[#ccff00] border-r border-dashed border-[#ccff00]/70 opacity-0 group-hover/traffic:opacity-100 transition-opacity pointer-events-none"></div>
                        <div class="absolute top-[15.3%] -translate-y-1/2 flex flex-col items-center">
                          <div class="w-4.5 h-4.5 rounded-full bg-white group-hover/traffic:scale-150 transition-all shadow-[0_0_20px_#ccff00] ring-4 ring-[#ccff00]/50 animate-pulse cursor-pointer"></div>
                          <div class="absolute -top-12 opacity-0 group-hover/traffic:opacity-100 transition-all duration-300 pointer-events-none z-30 bg-black text-white border border-[#ccff00] px-3 py-1.5 rounded-xl shadow-2xl text-center whitespace-nowrap">
                            <div class="text-[11px] font-black text-[#ccff00] font-mono">{{ trafficMetric.toLocaleString('es-CO') }} Visitas</div>
                            <div class="text-[9px] text-white font-bold">Junio (En Vivo ↑ +35.2%)</div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  <!-- Axis Labels Meses -->
                  <div class="grid grid-cols-6 text-center text-[10px] font-mono text-neutral-400 pt-3 border-t border-white/10">
                    <span class="hover:text-white transition-colors cursor-pointer">Ene</span>
                    <span class="hover:text-white transition-colors cursor-pointer">Feb</span>
                    <span class="hover:text-white transition-colors cursor-pointer">Mar</span>
                    <span class="hover:text-white transition-colors cursor-pointer">Abr</span>
                    <span class="hover:text-white transition-colors cursor-pointer">May</span>
                    <span class="font-bold text-[#ccff00] hover:text-[#ccff00] transition-colors cursor-pointer">Jun</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- TAB 3: CITAS & LEADS IA (MÉTRICAS FLUCTUANTES EN VIVO) -->
            <div *ngIf="activeTab === 'citas'" class="space-y-6 relative z-10 animate-fade-in">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 hover:border-white/30 transition-all">
                  <div class="flex items-center justify-between">
                    <span class="text-neutral-400 text-xs font-bold uppercase tracking-wider">Citas Agendadas</span>
                    <div class="w-9 h-9 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    </div>
                  </div>
                  <div class="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight flex items-center gap-2">
                    <span>{{ appointmentsMetric }} Citas</span>
                    <span class="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse"></span>
                  </div>
                  <div class="text-xs text-[#ccff00] font-semibold">Agendamiento automatizado 24/7</div>
                </div>

                <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 hover:border-white/30 transition-all">
                  <div class="flex items-center justify-between">
                    <span class="text-neutral-400 text-xs font-bold uppercase tracking-wider">Atención IA</span>
                    <div class="w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-white flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                    </div>
                  </div>
                  <div class="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                    99.8%
                  </div>
                  <div class="text-xs text-white font-semibold">Sin intervención humana</div>
                </div>

                <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 hover:border-white/30 transition-all">
                  <div class="flex items-center justify-between">
                    <span class="text-neutral-400 text-xs font-bold uppercase tracking-wider">Tiempo Respuesta</span>
                    <div class="w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-white flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    </div>
                  </div>
                  <div class="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                    &lt; 5 seg
                  </div>
                  <div class="text-xs text-[#ccff00] font-semibold">Respuesta inmediata 24/7</div>
                </div>

                <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 hover:border-white/30 transition-all">
                  <div class="flex items-center justify-between">
                    <span class="text-neutral-400 text-xs font-bold uppercase tracking-wider">Leads Convertidos</span>
                    <div class="w-9 h-9 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                    </div>
                  </div>
                  <div class="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                    88%
                  </div>
                  <div class="text-xs text-[#ccff00] font-semibold">Clientes agendados con éxito</div>
                </div>

              </div>
            </div>              <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 hover:border-white/30 transition-all">
                  <div class="flex items-center justify-between">
                    <span class="text-neutral-400 text-xs font-bold uppercase tracking-wider">Leads Convertidos</span>
                    <div class="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                    </div>
                  </div>
                  <div class="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                    88%
                  </div>
                  <div class="text-xs text-emerald-400 font-semibold">Clientes agendados con éxito</div>
                </div>

              </div>
            </div>

          </div>

        </section>


        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- 6. SECCIÓN 5: SITIO 100% PERSONALIZABLE                      -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <section class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          <!-- Image Column (Catálogo Digital) -->
          <div class="lg:col-span-6 relative flex justify-center order-2 lg:order-1">
            <div class="relative z-10 rounded-2xl border border-white/15 overflow-hidden shadow-2xl group">
              <img src="assets/images/proyectos/proyecto-catalogodigital.png" 
                   alt="Sitio Personalizable y Anuncios" 
                   class="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-all duration-700" />
            </div>
          </div>

          <!-- Content Column -->
          <div class="lg:col-span-6 space-y-6 order-1 lg:order-2">
            <div class="flex items-center gap-4 mb-2">
              <div class="h-px w-12" style="background-color: var(--text-primary); opacity: 0.5;"></div>
              <span class="text-xs uppercase tracking-[0.4em] font-mono text-white font-bold" style="color: var(--text-secondary);">05 — AUTOGESTIÓN & ANUNCIOS</span>
            </div>

            <h2 class="text-3xl sm:text-4xl md:text-5xl font-headline font-black uppercase leading-[1.05] tracking-tight" style="font-family: var(--font-headline, sans-serif);">
              5. SITIO 100% PERSONALIZABLE
            </h2>

            <p class="text-base sm:text-lg font-light leading-relaxed" style="color: var(--text-secondary);">
              El sitio lo puedes personalizar libremente a tu gusto y realizar tus anuncios, lanzar ofertas o actualizar tu catálogo de productos en cualquier momento sin depender de un programador.
            </p>

            <div class="space-y-4 pt-2">
              <div class="flex items-start gap-3.5 text-base sm:text-lg font-light leading-relaxed" style="color: var(--text-secondary);">
                <svg class="w-5 h-5 text-white shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>Edición intuitiva de textos, imágenes, banners y anuncios promocionales</span>
              </div>
              <div class="flex items-start gap-3.5 text-base sm:text-lg font-light leading-relaxed" style="color: var(--text-secondary);">
                <svg class="w-5 h-5 text-white shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>Gestión de catálogo, stock, precios y categorías sin tocar código</span>
              </div>
              <div class="flex items-start gap-3.5 text-base sm:text-lg font-light leading-relaxed" style="color: var(--text-secondary);">
                <svg class="w-5 h-5 text-white shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>Autonomía total para actualizar tu presencia digital cuando lo desees</span>
              </div>
            </div>
          </div>

        </section>


        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- 7. CALL TO ACTION FINAL                                     -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <section class="rounded-3xl border border-white/15 p-8 sm:p-12 md:p-16 text-center space-y-6 relative overflow-hidden bg-gradient-to-b from-white/[0.03] to-white/[0.01]">
          
          <div class="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 class="text-3xl sm:text-4xl md:text-5xl font-headline font-black uppercase tracking-tight text-white" style="font-family: var(--font-headline, sans-serif);">
              ¿LISTO PARA ELEVAR TU NEGOCIO HOY?
            </h2>
            <p class="text-sm sm:text-base font-light" style="color: var(--text-secondary);">
              Desarrollemos tu plataforma web, app móvil y asistente de Inteligencia Artificial a medida.
            </p>
            <div class="pt-4 flex flex-wrap items-center justify-center gap-4">
              <a href="https://wa.me/573054078225" target="_blank"
                 class="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold uppercase text-xs sm:text-sm tracking-wider transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
                <img src="assets/icons/whatsapp-icon.png" alt="WhatsApp" class="w-6.5 h-6.5 sm:w-7 sm:h-7 object-contain" />
                <span>Hablar con Santiago por WhatsApp</span>
                <span>→</span>
              </a>
            </div>
          </div>

        </section>

      </div>

    </div>
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    :host-context(.theme-light) .proposal-page {
      background-color: #ffffff !important;
      color: #111827 !important;
    }
  `]
})
export class ProposalComponent implements OnInit, OnDestroy {
  currentLanguage = 'es';
  activeTab: 'finanzas' | 'trafico' | 'citas' = 'finanzas';

  // Métricas fluctuantes corporativas
  revenueMetric = 48250000;
  netBalanceMetric = 32180000;
  ticketMetric = 89500;
  trafficMetric = 18420;
  appointmentsMetric = 142;

  lastActivityText = '[TRANSACCIÓN] +$150.000 ingresados (Hace 2s)';

  private timerId: any;
  private tickerIndex = 0;
  private activities = [
    '[TRANSACCIÓN] +$150.000 ingresados (Hace 2s)',
    '[NUEVO PEDIDO] Orden #4812 confirmada (Hace 5s)',
    '[AGENDAMIENTO IA] Cita confirmada por RotBot (Hace 9s)',
    '[VISITANTE EN VIVO] Usuario en checkout (Hace 12s)',
    '[TRANSACCIÓN] +$320.000 recibidos por pasarela (Hace 15s)'
  ];

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.currentLanguage = localStorage.getItem('portfolio-language') || 'es';
      window.addEventListener('portfolio-language-change', this.onLanguageChange);

      // Fluctuaciones numéricas suaves y naturales con ticker de actividad corporativa
      this.timerId = setInterval(() => {
        const deltaRevenue = Math.floor(Math.random() * 25000) + 10000;
        this.revenueMetric += deltaRevenue;
        this.netBalanceMetric += Math.floor(deltaRevenue * 0.65);
        this.trafficMetric += Math.floor(Math.random() * 4) + 1;

        if (Math.random() > 0.6) {
          this.appointmentsMetric += 1;
        }

        this.tickerIndex = (this.tickerIndex + 1) % this.activities.length;
        this.lastActivityText = this.activities[this.tickerIndex];
      }, 3000);
    }
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('portfolio-language-change', this.onLanguageChange);
      if (this.timerId) {
        clearInterval(this.timerId);
      }
    }
  }

  onLanguageChange = (event: any) => {
    this.currentLanguage = event.detail.language;
  };

  setTab(tab: 'finanzas' | 'trafico' | 'citas') {
    this.activeTab = tab;
  }

  formatMoney(amount: number): string {
    return amount.toLocaleString('es-CO');
  }
}
