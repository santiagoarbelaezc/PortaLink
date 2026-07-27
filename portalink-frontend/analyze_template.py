import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

with open('src/app/pages/proposal/proposal.component.ts', 'r', encoding='utf-8', errors='replace') as f:
    lines = f.readlines()

# Keep lines 0-228 (before broken section 4) and lines 686 onwards (after broken section)
before = lines[:228]   # up to and including the blank line after section 3
after = lines[685:]    # from </section> at line 686 onwards (index 685)

new_section = '''
        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- 5. SECCIÓN 4: DASHBOARD ORGANIZACIONAL PROFESIONAL          -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <section class="space-y-8">

          <!-- Header -->
          <div class="text-center space-y-4">
            <div class="flex items-center justify-center gap-4 mb-2">
              <div class="h-px w-12 opacity-50" style="background-color: var(--text-primary);"></div>
              <span class="text-xs uppercase tracking-[0.4em] font-mono text-white font-bold" style="color: var(--text-secondary);">04 — ANALYTICS EN TIEMPO REAL</span>
              <div class="h-px w-12 opacity-50" style="background-color: var(--text-primary);"></div>
            </div>

            <h2 class="text-3xl sm:text-4xl md:text-5xl font-headline font-black uppercase leading-[1.05] tracking-tight" style="font-family: var(--font-headline, sans-serif);">
              4. DASHBOARD ORGANIZACIONAL
            </h2>

            <p class="text-base sm:text-lg font-light leading-relaxed max-w-2xl mx-auto" style="color: var(--text-secondary);">
              Panel de control empresarial en tiempo real para monitorear tus finanzas, tráfico web y citas gestionadas por la IA — todo desde un solo lugar.
            </p>

            <!-- Selector de Pestañas -->
            <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button (click)="setTab('finanzas')"
                      [class]="activeTab === 'finanzas'
                        ? 'px-5 py-3 rounded-2xl bg-[#ccff00] text-black font-extrabold uppercase text-[11px] tracking-wider transition-all flex items-center gap-2 cursor-pointer'
                        : 'px-5 py-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/10 text-white font-bold uppercase text-[11px] tracking-wider transition-all flex items-center gap-2 cursor-pointer'">
                <span class="w-2 h-2 rounded-full" [class]="activeTab === 'finanzas' ? 'bg-black' : 'bg-[#ccff00]'"></span>
                <span>Finanzas & Rentabilidad</span>
              </button>
              <button (click)="setTab('trafico')"
                      [class]="activeTab === 'trafico'
                        ? 'px-5 py-3 rounded-2xl bg-[#ccff00] text-black font-extrabold uppercase text-[11px] tracking-wider transition-all flex items-center gap-2 cursor-pointer'
                        : 'px-5 py-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/10 text-white font-bold uppercase text-[11px] tracking-wider transition-all flex items-center gap-2 cursor-pointer'">
                <span class="w-2 h-2 rounded-full" [class]="activeTab === 'trafico' ? 'bg-black' : 'bg-[#ccff00]'"></span>
                <span>Tráfico & Audiencia</span>
              </button>
              <button (click)="setTab('citas')"
                      [class]="activeTab === 'citas'
                        ? 'px-5 py-3 rounded-2xl bg-[#ccff00] text-black font-extrabold uppercase text-[11px] tracking-wider transition-all flex items-center gap-2 cursor-pointer'
                        : 'px-5 py-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/10 text-white font-bold uppercase text-[11px] tracking-wider transition-all flex items-center gap-2 cursor-pointer'">
                <span class="w-2 h-2 rounded-full" [class]="activeTab === 'citas' ? 'bg-black' : 'bg-[#ccff00]'"></span>
                <span>Citas & Leads IA</span>
              </button>
            </div>
          </div>

          <!-- Dashboard Mockup -->
          <div class="relative rounded-3xl border border-white/15 bg-[#050505] p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.9)] overflow-hidden">

            <!-- Barra Superior -->
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 mb-6 border-b border-white/10">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-black text-xs">PL</div>
                <div>
                  <h3 class="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <span>PORTALINK EXECUTIVE CONTROL</span>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30">ONLINE</span>
                  </h3>
                  <p class="text-xs text-neutral-400">Sistema de analítica empresarial en tiempo real</p>
                </div>
              </div>
              <div class="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-neutral-300">
                <span class="w-2.5 h-2.5 rounded-full bg-[#ccff00] animate-ping"></span>
                <span class="text-[#ccff00] font-bold">{{ lastActivityText }}</span>
              </div>
            </div>

            <!-- TAB: FINANZAS -->
            <div *ngIf="activeTab === 'finanzas'" class="space-y-6 animate-fade-in">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 hover:border-[#ccff00]/50 transition-all">
                  <div class="flex items-center justify-between">
                    <span class="text-neutral-400 text-xs font-bold uppercase tracking-wider">Ingresos Brutos</span>
                    <div class="w-9 h-9 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                  </div>
                  <div class="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight flex items-center gap-2">
                    <span>\\${{ formatMoney(revenueMetric) }}</span>
                    <span class="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse"></span>
                  </div>
                  <div class="text-xs text-[#ccff00] font-semibold">↑ +28.4% flujo de caja acumulado</div>
                </div>
                <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 hover:border-white/30 transition-all">
                  <div class="flex items-center justify-between">
                    <span class="text-neutral-400 text-xs font-bold uppercase tracking-wider">Margen Neto</span>
                    <div class="w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-white flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                  </div>
                  <div class="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">\\${{ formatMoney(netBalanceMetric) }}</div>
                  <div class="text-xs text-[#ccff00] font-semibold">↑ 66.7% utilidad limpia</div>
                </div>
                <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 hover:border-white/30 transition-all">
                  <div class="flex items-center justify-between">
                    <span class="text-neutral-400 text-xs font-bold uppercase tracking-wider">Ticket Promedio</span>
                    <div class="w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-white flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                    </div>
                  </div>
                  <div class="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">\\${{ formatMoney(ticketMetric) }}</div>
                  <div class="text-xs text-[#ccff00] font-semibold">↑ Venta promedio optimizada</div>
                </div>
                <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 hover:border-white/30 transition-all">
                  <div class="flex items-center justify-between">
                    <span class="text-neutral-400 text-xs font-bold uppercase tracking-wider">Retorno ROI</span>
                    <div class="w-9 h-9 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                    </div>
                  </div>
                  <div class="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">340%</div>
                  <div class="text-xs text-white font-semibold">Rentabilidad comprobada</div>
                </div>
              </div>

              <!-- Gráfica de barras -->
              <div class="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                <div class="flex items-center justify-between">
                  <h4 class="text-sm font-bold text-white uppercase tracking-wider">Ingresos Mensuales Acumulados</h4>
                  <span class="text-xs font-mono text-[#ccff00] font-bold">Pasa el cursor sobre las barras</span>
                </div>
                <div class="grid grid-cols-6 items-end gap-3 h-48 pt-4 pb-2 border-b border-white/10">
                  <div class="relative group/bar flex flex-col items-center justify-end h-full">
                    <div class="absolute -top-9 opacity-0 group-hover/bar:opacity-100 transition-all pointer-events-none z-30 bg-black text-white border border-[#ccff00]/50 px-2.5 py-1 rounded-xl text-center whitespace-nowrap">
                      <div class="text-[11px] font-bold text-[#ccff00] font-mono">$18.500.000</div>
                      <div class="text-[9px] text-neutral-400">Enero (+12.4%)</div>
                    </div>
                    <div class="w-full bg-[#ccff00]/25 group-hover/bar:bg-[#ccff00] transition-all h-20 rounded-t-lg border-t-2 border-[#ccff00] cursor-pointer"></div>
                    <span class="text-[10px] font-mono text-neutral-400 mt-2">Ene</span>
                  </div>
                  <div class="relative group/bar flex flex-col items-center justify-end h-full">
                    <div class="absolute -top-9 opacity-0 group-hover/bar:opacity-100 transition-all pointer-events-none z-30 bg-black text-white border border-[#ccff00]/50 px-2.5 py-1 rounded-xl text-center whitespace-nowrap">
                      <div class="text-[11px] font-bold text-[#ccff00] font-mono">$24.200.000</div>
                      <div class="text-[9px] text-neutral-400">Febrero (+15.1%)</div>
                    </div>
                    <div class="w-full bg-[#ccff00]/35 group-hover/bar:bg-[#ccff00] transition-all h-28 rounded-t-lg border-t-2 border-[#ccff00] cursor-pointer"></div>
                    <span class="text-[10px] font-mono text-neutral-400 mt-2">Feb</span>
                  </div>
                  <div class="relative group/bar flex flex-col items-center justify-end h-full">
                    <div class="absolute -top-9 opacity-0 group-hover/bar:opacity-100 transition-all pointer-events-none z-30 bg-black text-white border border-[#ccff00]/50 px-2.5 py-1 rounded-xl text-center whitespace-nowrap">
                      <div class="text-[11px] font-bold text-[#ccff00] font-mono">$29.800.000</div>
                      <div class="text-[9px] text-neutral-400">Marzo (+18.3%)</div>
                    </div>
                    <div class="w-full bg-[#ccff00]/45 group-hover/bar:bg-[#ccff00] transition-all h-32 rounded-t-lg border-t-2 border-[#ccff00] cursor-pointer"></div>
                    <span class="text-[10px] font-mono text-neutral-400 mt-2">Mar</span>
                  </div>
                  <div class="relative group/bar flex flex-col items-center justify-end h-full">
                    <div class="absolute -top-9 opacity-0 group-hover/bar:opacity-100 transition-all pointer-events-none z-30 bg-black text-white border border-[#ccff00]/50 px-2.5 py-1 rounded-xl text-center whitespace-nowrap">
                      <div class="text-[11px] font-bold text-[#ccff00] font-mono">$34.500.000</div>
                      <div class="text-[9px] text-neutral-400">Abril (+21.0%)</div>
                    </div>
                    <div class="w-full bg-[#ccff00]/60 group-hover/bar:bg-[#ccff00] transition-all h-36 rounded-t-lg border-t-2 border-[#ccff00] cursor-pointer"></div>
                    <span class="text-[10px] font-mono text-neutral-400 mt-2">Abr</span>
                  </div>
                  <div class="relative group/bar flex flex-col items-center justify-end h-full">
                    <div class="absolute -top-9 opacity-0 group-hover/bar:opacity-100 transition-all pointer-events-none z-30 bg-black text-white border border-[#ccff00]/50 px-2.5 py-1 rounded-xl text-center whitespace-nowrap">
                      <div class="text-[11px] font-bold text-[#ccff00] font-mono">$41.000.000</div>
                      <div class="text-[9px] text-neutral-400">Mayo (+24.5%)</div>
                    </div>
                    <div class="w-full bg-[#ccff00]/80 group-hover/bar:bg-[#ccff00] transition-all h-40 rounded-t-lg border-t-2 border-[#ccff00] cursor-pointer"></div>
                    <span class="text-[10px] font-mono text-neutral-400 mt-2">May</span>
                  </div>
                  <div class="relative group/bar flex flex-col items-center justify-end h-full">
                    <div class="absolute -top-9 opacity-0 group-hover/bar:opacity-100 transition-all pointer-events-none z-30 bg-black text-white border border-[#ccff00] px-2.5 py-1 rounded-xl text-center whitespace-nowrap">
                      <div class="text-[11px] font-bold text-[#ccff00] font-mono">\\${{ formatMoney(revenueMetric) }}</div>
                      <div class="text-[9px] text-white font-bold">Junio (En Vivo +28.4%)</div>
                    </div>
                    <div class="w-full bg-[#ccff00] group-hover/bar:bg-[#d8ff33] transition-all h-48 rounded-t-lg border-t-2 border-white shadow-[0_0_25px_rgba(204,255,0,0.6)] cursor-pointer"></div>
                    <span class="text-[10px] font-mono font-bold text-[#ccff00] mt-2">Jun</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- TAB: TRÁFICO -->
            <div *ngIf="activeTab === 'trafico'" class="space-y-6 animate-fade-in">
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
                  <div class="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">4.8%</div>
                  <div class="text-xs text-white font-semibold">SEO & Carga ultrarrápida</div>
                </div>
                <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 hover:border-white/30 transition-all">
                  <div class="flex items-center justify-between">
                    <span class="text-neutral-400 text-xs font-bold uppercase tracking-wider">Tiempo Medio</span>
                    <div class="w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-white flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                  </div>
                  <div class="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">3m 45s</div>
                  <div class="text-xs text-[#ccff00] font-semibold">Alta retención de clientes</div>
                </div>
                <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 hover:border-white/30 transition-all">
                  <div class="flex items-center justify-between">
                    <span class="text-neutral-400 text-xs font-bold uppercase tracking-wider">Páginas / Sesión</span>
                    <div class="w-9 h-9 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
                    </div>
                  </div>
                  <div class="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">4.2</div>
                  <div class="text-xs text-white font-semibold">Navegación intuitiva</div>
                </div>
              </div>

              <!-- Gráfica de línea de tráfico -->
              <div class="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                <div class="flex items-center justify-between pb-2 border-b border-white/10">
                  <h4 class="text-sm font-bold text-white uppercase tracking-wider">Flujo de Tráfico Mensual</h4>
                  <div class="px-3 py-1.5 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] flex items-center gap-2 text-xs font-mono">
                    <span class="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse"></span>
                    <span>Pico: <strong>{{ trafficMetric.toLocaleString('es-CO') }} / día</strong></span>
                  </div>
                </div>
                <div class="w-full h-40">
                  <svg class="w-full h-full" viewBox="0 0 500 130" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="limeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#ccff00" stop-opacity="0.3"/>
                        <stop offset="100%" stop-color="#ccff00" stop-opacity="0.0"/>
                      </linearGradient>
                    </defs>
                    <line x1="0" y1="20" x2="500" y2="20" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3"/>
                    <line x1="0" y1="55" x2="500" y2="55" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3"/>
                    <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3"/>
                    <path d="M 0,105 L 100,85 L 200,68 L 300,52 L 400,36 L 500,20 L 500,130 L 0,130 Z" fill="url(#limeGrad)"/>
                    <path d="M 0,105 L 100,85 L 200,68 L 300,52 L 400,36 L 500,20" fill="none" stroke="#ccff00" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="grid grid-cols-6 text-center text-[10px] font-mono text-neutral-400 border-t border-white/10 pt-2">
                  <span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span>
                  <span class="font-bold text-[#ccff00]">Jun</span>
                </div>
              </div>
            </div>

            <!-- TAB: CITAS & LEADS IA -->
            <div *ngIf="activeTab === 'citas'" class="space-y-6 animate-fade-in">
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
                  <div class="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">99.8%</div>
                  <div class="text-xs text-white font-semibold">Sin intervención humana</div>
                </div>
                <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 hover:border-white/30 transition-all">
                  <div class="flex items-center justify-between">
                    <span class="text-neutral-400 text-xs font-bold uppercase tracking-wider">Tiempo Respuesta</span>
                    <div class="w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-white flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    </div>
                  </div>
                  <div class="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">&lt; 5 seg</div>
                  <div class="text-xs text-[#ccff00] font-semibold">Respuesta inmediata 24/7</div>
                </div>
                <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 hover:border-white/30 transition-all">
                  <div class="flex items-center justify-between">
                    <span class="text-neutral-400 text-xs font-bold uppercase tracking-wider">Leads Convertidos</span>
                    <div class="w-9 h-9 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                    </div>
                  </div>
                  <div class="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">88%</div>
                  <div class="text-xs text-[#ccff00] font-semibold">Clientes agendados con éxito</div>
                </div>
              </div>
            </div>

          </div>

        </section>

'''

new_lines = before + [new_section] + after

with open('src/app/pages/proposal/proposal.component.ts', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f'Done. New total lines: {len(new_lines)}')
