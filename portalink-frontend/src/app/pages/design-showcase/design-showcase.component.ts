import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

interface DesignSlide {
  id: string;
  name: string;
  description: string;
  styleTag: string;
  bgClass: string;
  textClass: string;
  accentClass: string;
  fontClass: string;
}

@Component({
  selector: 'app-design-showcase',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="relative h-screen bg-black text-white font-sans selection:bg-accent-cyan selection:text-black overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth custom-scrollbar">
      
      <!-- Grid Background (Linktree style) -->
      <div class="fixed inset-0 pointer-events-none z-0" 
           style="background-image: linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px); background-size: 40px 40px; background-position: center center; mask-image: radial-gradient(ellipse at 50% 50%, black 10%, transparent 80%); -webkit-mask-image: radial-gradient(ellipse at 50% 50%, black 10%, transparent 80%);">
      </div>
      <!-- Vertical line accent -->
      <div class="fixed top-0 bottom-0 left-1/2 w-[1px] pointer-events-none z-0 hidden md:block -translate-x-1/2" style="background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.05) 15%, rgba(255, 255, 255, 0.05) 85%, transparent);"></div>

      <!-- Subtle Glow (Removed to match linktree pure black) -->

      <!-- Top Navigation -->
      <nav class="fixed top-0 left-0 right-0 z-[100] flex items-start md:items-center justify-between px-8 py-6 md:px-12 md:py-8 pointer-events-auto bg-gradient-to-b from-black/80 to-transparent">
        <a routerLink="/" class="group flex items-center gap-3 text-white/50 transition-colors hover:text-white">
          <div class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all group-hover:scale-110 group-hover:border-white/30">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </div>
          <span class="text-[10px] uppercase tracking-[0.3em] font-bold hidden md:inline-block">Volver</span>
        </a>
      </nav>

      <!-- HERO BANNER SECTION (Top) -->
      <section id="hero-section" class="relative h-screen w-full snap-start flex flex-col md:flex-row bg-transparent overflow-hidden items-stretch p-8 pt-32 md:p-16 md:pt-32 md:px-20 gap-12 md:gap-16 z-10">
        <!-- Text Content Side -->
        <div class="flex-1 flex flex-col justify-center text-left z-10 w-full py-8 md:pl-8">
          <span class="text-cyan-400 font-mono text-[12px] md:text-[14px] tracking-[0.5em] mb-6">ROTBOT.AI // SYSTEMS</span>
          <h2 class="text-6xl md:text-[110px] font-headline uppercase leading-[0.8] tracking-tighter text-white mb-10">
            Sistemas<br><span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-white">Funcionales</span>
          </h2>
          
          <div class="space-y-5 mb-12">
             <p class="text-white/80 text-base md:text-lg font-light flex items-center gap-4">
                <span class="w-2 h-2 bg-cyan-400 rounded-full"></span>
                Sistemas para mi negocio
             </p>
             <p class="text-white/80 text-base md:text-lg font-light flex items-center gap-4">
                <span class="w-2 h-2 bg-cyan-400 rounded-full"></span>
                Gestión de ventas de tu negocio
             </p>
             <p class="text-white/80 text-base md:text-lg font-light flex items-center gap-4">
                <span class="w-2 h-2 bg-cyan-400 rounded-full"></span>
                E-commerce para vender en línea
             </p>
             <p class="text-white/80 text-base md:text-lg font-light flex items-center gap-4">
                <span class="w-2 h-2 bg-cyan-400 rounded-full"></span>
                Personalizar tu propia landing page
             </p>
             <p class="text-white/80 text-base md:text-lg font-light flex items-center gap-4">
                <span class="w-2 h-2 bg-cyan-400 rounded-full"></span>
                Integración de tu propia IA
             </p>
          </div>

          <div class="flex flex-wrap gap-4 items-center">
            <button class="w-fit px-10 py-5 bg-white text-black font-bold uppercase tracking-[0.2em] text-xs rounded-full hover:bg-cyan-400 hover:text-black transition-all duration-500 flex items-center gap-3 group/btn">
              <span>Crear mi proyecto</span>
            </button>
            <button (click)="scrollToProjects()" class="w-fit px-10 py-5 bg-transparent border border-white/20 text-white font-bold uppercase tracking-[0.2em] text-xs rounded-full hover:bg-white/10 transition-all duration-500 flex items-center gap-3 group/btn2">
              <span>Ver Diseños</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="group-hover/btn2:translate-y-1 transition-transform"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
            </button>
          </div>
        </div>

        <!-- Video Side -->
        <div class="flex-[1.2] w-full min-h-[300px] md:min-h-[600px] relative rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(0,245,255,0.15)] border border-white/10 group">
          <video #heroVideo [autoplay]="true" [loop]="true" [muted]="true" playsinline class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000">
            <source src="assets/videos/rotbot-design.mp4" type="video/mp4">
          </video>
          <div class="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent pointer-events-none"></div>
          <div class="absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/10 pointer-events-none"></div>
        </div>
      </section>

      <!-- Carousel Container (Bottom) -->
      <section id="projects-carousel" class="h-screen w-full snap-start relative z-10 flex flex-col">
        <main 
          #carousel
          class="flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth no-scrollbar"
        >
        <section 
          *ngFor="let design of designs; let i = index" 
          [id]="design.id"
          class="relative h-full w-full flex-shrink-0 snap-start flex items-center justify-center p-4 pt-32 md:p-20 md:pt-40"
        >
          <!-- Mockup Browser Frame -->
          <div class="relative w-full max-w-5xl aspect-[16/10] md:aspect-video rounded-[32px] overflow-hidden shadow-[0_80px_150px_-30px_rgba(0,0,0,0.7)] border border-white/10 animate-fade-in-up z-10">
            
            <!-- Browser Header -->
            <div class="h-12 bg-[#0c0c0c] flex items-center px-8 gap-3 border-b border-white/5 relative z-50">
              <div class="flex gap-2">
                <div class="w-3 h-3 rounded-full bg-white/10"></div>
                <div class="w-3 h-3 rounded-full bg-white/10"></div>
                <div class="w-3 h-3 rounded-full bg-white/10"></div>
              </div>
              <div class="flex-1 flex justify-center">
                <div class="bg-white/5 border border-white/5 rounded-full px-6 py-1 text-[9px] text-white/30 font-mono tracking-widest w-1/2 md:w-1/4 text-center">
                  portalink.ai/{{ design.id }}
                </div>
              </div>
            </div>

            <!-- Content Area -->
            <div [class]="'h-full w-full overflow-y-auto no-scrollbar relative ' + design.bgClass + ' ' + design.fontClass">
              
              <!-- Grain Overlay -->
              <div class="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay z-[100] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

              <!-- 1. ELEGANT: THE SILK MESH -->
              <div *ngIf="design.id === 'elegant'" class="min-h-full flex flex-col p-12 md:p-32 relative bg-[#080808]">
                <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_70%_20%,#C5A05915_0%,transparent_50%),radial-gradient(circle_at_20%_80%,#C5A05910_0%,transparent_50%)] animate-pulse"></div>
                <nav class="flex justify-between items-center mb-24 z-10">
                  <span class="text-gold font-serif italic text-2xl tracking-tighter">S.A</span>
                  <div class="h-px w-24 bg-gold/20"></div>
                </nav>
                <div class="flex-1 z-10 flex flex-col justify-center">
                  <h2 class="text-8xl md:text-[180px] leading-[0.7] font-serif mb-12 tracking-tighter animate-reveal">
                    The<br><span class="italic text-gold translate-x-20 inline-block">Silk</span>
                  </h2>
                  <div class="flex items-end gap-12">
                     <p class="max-w-sm text-white/40 text-xs leading-loose uppercase tracking-[0.3em]">Redefining the essence of digital luxury through fluid motion and minimalist structure.</p>
                     <div class="flex-1 h-px bg-white/5 mb-2"></div>
                  </div>
                </div>
              </div>

              <!-- 2. MINIMAL: THE VOID -->
              <div *ngIf="design.id === 'minimal'" class="min-h-full flex flex-col p-12 bg-white text-black items-center justify-center">
                <div class="absolute inset-0 border-[40px] border-black/5 pointer-events-none"></div>
                <span class="absolute top-12 left-12 font-black text-8xl opacity-[0.03]">01</span>
                <div class="text-center z-10">
                  <div class="w-1 h-20 bg-black mx-auto mb-16 animate-bounce"></div>
                  <h2 class="text-9xl md:text-[200px] font-black tracking-tighter leading-none mb-8">VOID.</h2>
                  <p class="text-black/40 text-xs uppercase tracking-[0.8em]">Less is everything.</p>
                </div>
                <div class="absolute bottom-20 flex gap-4">
                  <div class="w-2 h-2 rounded-full bg-black"></div>
                  <div class="w-2 h-2 rounded-full border border-black"></div>
                  <div class="w-2 h-2 rounded-full border border-black"></div>
                </div>
              </div>

              <!-- 3. BRUTALIST: NEO-NOISE -->
              <div *ngIf="design.id === 'brutalist'" class="min-h-full bg-white p-8 flex flex-col">
                <div class="absolute inset-0 bg-yellow-400 -z-10 translate-x-4 translate-y-4"></div>
                <div class="flex-1 border-[10px] border-black p-12 flex flex-col justify-between bg-white relative overflow-hidden">
                  <div class="absolute top-0 right-0 bg-black text-white px-6 py-3 font-black text-4xl -rotate-90 origin-top-right">PORTFOLIO</div>
                  <h2 class="text-[100px] md:text-[180px] font-black leading-[0.75] text-black tracking-tight">RAW<br>ENERGY</h2>
                  <div class="flex flex-wrap gap-4 mt-8">
                     <span class="px-8 py-4 bg-blue-600 text-white font-black text-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">DIRECTOR</span>
                     <span class="px-8 py-4 bg-pink-500 text-white font-black text-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">CREATIVE</span>
                  </div>
                </div>
              </div>

              <!-- 4. RETRO: SYNTHWAVE GRID -->
              <div *ngIf="design.id === 'retro'" class="min-h-full bg-[#0d0221] relative flex flex-col items-center justify-center overflow-hidden">
                <div class="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(236,72,153,0.3)_50%,transparent_100%)] bg-[length:100%_4px] animate-[scanline_4s_linear_infinite]"></div>
                <div class="absolute bottom-0 w-full h-[50%] bg-[linear-gradient(90deg,rgba(0,243,255,0.1)_1px,transparent_0),linear-gradient(rgba(0,243,255,0.1)_1px,transparent_0)] bg-[length:40px_40px] [transform:perspective(500px)_rotateX(60deg)] animate-[grid-move_20s_linear_infinite]"></div>
                <h2 class="text-8xl md:text-[160px] font-black italic text-white z-10 drop-shadow-[0_0_30px_#ec4899] animate-pulse">ARCADE</h2>
                <div class="mt-8 px-12 py-4 bg-pink-500 text-white font-bold skew-x-[-12deg] shadow-[8px_0_0_#00f3ff] z-10">LEVEL 2026</div>
              </div>

              <!-- 5. DARK: MATRIX NEURAL -->
              <div *ngIf="design.id === 'dark'" class="min-h-full bg-black p-12 flex flex-col font-mono relative">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,#00FF4108_0%,transparent_70%)]"></div>
                <div class="flex-1 flex flex-col border border-[#00FF41]/30 p-12 relative overflow-hidden group">
                  <div class="absolute top-0 left-0 w-full h-1 bg-[#00FF41]/40 animate-[loading_3s_infinite]"></div>
                  <div class="text-[#00FF41]/40 text-[10px] mb-20 tracking-[0.5em]">> INITIALIZING_SECURE_VAULT</div>
                  <h2 class="text-7xl md:text-[120px] font-bold text-white leading-none mb-12">GHOST<br><span class="text-[#00FF41]">SHELL</span></h2>
                  <div class="mt-auto flex justify-between items-end">
                    <div class="space-y-2">
                       <div class="w-40 h-1 bg-white/10"></div>
                       <div class="w-24 h-1 bg-[#00FF41]/40"></div>
                    </div>
                    <span class="text-[#00FF41] text-4xl animate-pulse">_</span>
                  </div>
                </div>
              </div>

              <!-- 6. COLORFUL: CLAYMORPISM -->
              <div *ngIf="design.id === 'colorful'" class="min-h-full bg-[#f0f4ff] p-12 flex flex-col justify-center items-center relative overflow-hidden">
                <div class="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-300/30 rounded-full blur-[100px]"></div>
                <div class="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-300/30 rounded-full blur-[100px]"></div>
                <div class="flex gap-8 mb-12 z-10">
                   <div class="w-24 h-24 bg-blue-500 rounded-3xl shadow-[inset_-8px_-8px_15px_rgba(0,0,0,0.2),8px_8px_15px_rgba(255,255,255,0.5)] rotate-12"></div>
                   <div class="w-24 h-24 bg-yellow-400 rounded-full shadow-[inset_-8px_-8px_15px_rgba(0,0,0,0.2),8px_8px_15_rgba(255,255,255,0.5)] -rotate-12"></div>
                </div>
                <h2 class="text-7xl md:text-[140px] font-black text-[#1a1a1a] tracking-tighter leading-[0.8] text-center z-10">Bubbly<br><span class="text-blue-600">Studio</span></h2>
              </div>

              <!-- 7. FUTURISTIC: HUD-X -->
              <div *ngIf="design.id === 'futuristic'" class="min-h-full bg-[#020617] flex items-center justify-center p-12 relative overflow-hidden">
                <div class="absolute w-[800px] h-[800px] border border-cyan-500/10 rounded-full animate-[spin_20s_linear_infinite]"></div>
                <div class="absolute w-[600px] h-[600px] border border-cyan-500/5 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                <div class="z-10 p-16 bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-[48px] text-center relative overflow-hidden group">
                  <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
                  <h2 class="text-6xl md:text-9xl font-black text-white tracking-[0.15em] mb-4">NEON</h2>
                  <p class="text-cyan-400 font-mono text-[10px] tracking-[0.5em] opacity-60">QUANTUM_INTERFACE_ACTIVE</p>
                </div>
              </div>

              <!-- 8. EDITORIAL: VOGUE-GRID -->
              <div *ngIf="design.id === 'editorial'" class="min-h-full bg-white text-black p-12 flex flex-col font-serif">
                <div class="absolute inset-0 bg-[#f9f9f9] -z-10"></div>
                <div class="flex-1 grid grid-cols-12 gap-0 border-x border-black/5">
                   <div class="col-span-1 border-r border-black/5 flex items-center justify-center">
                      <span class="rotate-[-90deg] uppercase text-[9px] tracking-[1em] font-sans font-bold opacity-20">ESTABLISHED_2026</span>
                   </div>
                   <div class="col-span-11 p-12 flex flex-col">
                      <h2 class="text-[120px] md:text-[220px] leading-[0.75] font-serif tracking-tighter mb-20 animate-reveal">THE<br>ARCHIVE</h2>
                      <div class="mt-auto flex justify-between items-end">
                         <p class="max-w-xs text-sm italic leading-relaxed">A visual study of the intersection between high-fashion aesthetics and digital precision.</p>
                         <span class="text-9xl font-sans font-black opacity-5">08</span>
                      </div>
                   </div>
                </div>
              </div>

              <!-- 9. ORGANIC: LIQUID FLOW -->
              <div *ngIf="design.id === 'organic'" class="min-h-full bg-[#fdfaf6] p-12 flex flex-col items-center justify-center relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,#e7d5c0_0%,transparent_40%),radial-gradient(circle_at_70%_70%,#dcc8b1_0%,transparent_40%)] animate-pulse"></div>
                <div class="w-64 h-64 bg-[#4a3728] rounded-[40%_60%_70%_30%/40%_40%_60%_60%] animate-[blob_12s_infinite_alternate] shadow-2xl relative z-10 flex items-center justify-center">
                   <span class="text-white font-serif italic text-4xl">Earth</span>
                </div>
                <h2 class="text-6xl md:text-9xl font-serif text-[#4a3728] mt-12 z-10 tracking-tighter">Human Rhythm</h2>
              </div>

              <!-- 10. LUXURY: MARBLE & GOLD -->
              <div *ngIf="design.id === 'luxury'" class="min-h-full bg-[#050505] p-12 flex flex-col items-center justify-center relative overflow-hidden">
                <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-20"></div>
                <div class="absolute w-full h-full bg-[radial-gradient(circle_at_center,#C5A05910_0%,transparent_60%)]"></div>
                <div class="relative z-10 text-center space-y-8">
                   <div class="w-px h-24 bg-gradient-to-b from-gold to-transparent mx-auto"></div>
                   <h2 class="text-7xl md:text-[140px] font-serif font-light text-gold uppercase tracking-[0.2em] leading-none">MAISON</h2>
                   <div class="flex items-center justify-center gap-6">
                      <div class="h-px w-20 bg-gold/40"></div>
                      <span class="text-white/80 uppercase tracking-[0.6em] text-[10px]">PRESTIGE</span>
                      <div class="h-px w-20 bg-gold/40"></div>
                   </div>
                   <button class="mt-12 px-16 py-5 border border-gold/30 text-gold text-[10px] uppercase tracking-[0.5em] hover:bg-gold hover:text-black transition-all duration-700">Explorar Versión</button>
                </div>
              </div>

            </div>

            <!-- Overlay Controls -->
            <div class="absolute bottom-12 left-12 right-12 flex justify-between items-end pointer-events-none z-[110]">
              <div class="bg-black/80 backdrop-blur-xl p-8 rounded-[32px] border border-white/10 max-w-sm pointer-events-auto shadow-2xl translate-y-4 animate-reveal">
                <div class="flex items-center gap-3 mb-4">
                  <div class="h-2 w-2 rounded-full bg-accent-cyan animate-pulse"></div>
                  <h4 class="text-white font-headline uppercase text-lg tracking-widest">{{ design.name }}</h4>
                </div>
                <p class="text-[11px] text-white/50 leading-relaxed mb-6 font-light">{{ design.description }}</p>
                <button (click)="useDesign()" class="group w-full py-4 bg-white text-black text-[10px] font-black uppercase rounded-2xl hover:bg-accent-cyan transition-all duration-500 flex items-center justify-center gap-3">
                  <span>Implementar este diseño</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="transition-transform group-hover:translate-x-1">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </div>

          </div>
        </section>
        </main>
      </section>

      <!-- Carousel Navigation UI -->
      <div *ngIf="isCarouselVisible" class="fixed bottom-12 left-1/2 -translate-x-1/2 z-[150] flex flex-col items-center gap-6 pointer-events-auto animate-reveal">
        <div class="flex gap-2">
          <button 
            *ngFor="let d of designs; let i = index" 
            (click)="scrollTo(d.id)"
            class="h-1.5 transition-all duration-700 rounded-full"
            [ngClass]="activeId === d.id ? 'w-10 bg-cyan-400 shadow-[0_0_10px_rgba(0,245,255,0.5)]' : 'w-3 bg-white/20 hover:bg-white/40'"
          ></button>
        </div>
        
        <div class="flex items-center gap-10 bg-black/80 backdrop-blur-3xl px-12 py-5 rounded-[2rem] border border-white/10">
          <button (click)="prev()" class="text-white/30 hover:text-white transition-all hover:scale-125 hover:-translate-x-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div class="flex flex-col items-center min-w-[80px]">
            <span class="text-[10px] font-bold tracking-[0.4em] text-cyan-400 mb-1">DESIGN</span>
            <span class="text-xs font-mono text-white/50 tracking-widest">{{ activeIndex + 1 }} / {{ designs.length }}</span>
          </div>
          <button (click)="next()" class="text-white/30 hover:text-white transition-all hover:scale-125 hover:translate-x-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host {
      --accent-cyan: #00F5FF;
      --gold: #C5A059;
    }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
    
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    
    .font-headline { font-family: 'Bebas Neue', sans-serif; }
    .font-serif { font-family: 'DM Serif Display', serif; }
    .text-gold { color: var(--gold); }
    .bg-gold { background-color: var(--gold); }

    @keyframes loading {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(300%); }
    }
    
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(60px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
      animation: fade-in-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes blob {
      0% { border-radius: 40% 60% 70% 30%/40% 40% 60% 60%; transform: scale(1); }
      100% { border-radius: 70% 30% 30% 70%/70% 70% 30% 30%; transform: scale(1.1); }
    }

    @keyframes scanline {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100%); }
    }

    @keyframes grid-move {
      0% { background-position: 0 0; }
      100% { background-position: 0 40px; }
    }

    @keyframes reveal {
      from { opacity: 0; clip-path: inset(0 100% 0 0); }
      to { opacity: 1; clip-path: inset(0 0 0 0); }
    }
    .animate-reveal {
      animation: reveal 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class DesignShowcaseComponent implements OnInit, AfterViewInit {
  @ViewChild('carousel') carousel!: ElementRef;
  @ViewChild('heroVideo') heroVideo!: ElementRef<HTMLVideoElement>;

  designs: DesignSlide[] = [
    { id: 'elegant', name: 'The Silk Portfolio', description: 'Mesh gradients dinámicos, tipografía serif fluida y estética editorial de alta gama.', styleTag: 'elegant', bgClass: 'bg-[#0A0A0A]', textClass: 'text-white', accentClass: 'bg-gold', fontClass: 'font-serif' },
    { id: 'minimal', name: 'Void Architecture', description: 'El poder del vacío absoluto. Tipografía masiva y espaciado matemático perfecto.', styleTag: 'minimal', bgClass: 'bg-white', textClass: 'text-black', accentClass: 'bg-black', fontClass: 'font-sans' },
    { id: 'brutalist', name: 'Raw Energy', description: 'Neo-brutalismo puro. Sombras duras, colores vibrantes y una actitud sin filtros.', styleTag: 'brutalist', bgClass: 'bg-yellow-400', textClass: 'text-black', accentClass: 'bg-black', fontClass: 'font-sans' },
    { id: 'retro', name: 'Synthwave Arcade', description: 'Una oda a los 80s con grids en perspectiva, scanlines y neones pulsantes.', styleTag: 'retro', bgClass: 'bg-black', textClass: 'text-white', accentClass: 'bg-pink-500', fontClass: 'font-sans' },
    { id: 'dark', name: 'Ghost in the Shell', description: 'Cyberpunk técnico. Interfaces neurales, fuentes monoespaciadas y oscuridad absoluta.', styleTag: 'dark', bgClass: 'bg-black', textClass: 'text-[#00FF41]', accentClass: 'bg-[#00FF41]', fontClass: 'font-mono' },
    { id: 'colorful', name: 'Bubbly Studio', description: 'Claymorphism y formas 3D suaves. Una explosión de alegría visual y optimismo.', styleTag: 'colorful', bgClass: 'bg-pink-100', textClass: 'text-blue-600', accentClass: 'bg-yellow-500', fontClass: 'font-sans' },
    { id: 'futuristic', name: 'Quantum HUD', description: 'Interfaces del futuro. Glassmorphism extremo, elementos rotatorios y azul eléctrico.', styleTag: 'futuristic', bgClass: 'bg-[#000510]', textClass: 'text-white', accentClass: 'bg-cyan-400', fontClass: 'font-sans' },
    { id: 'editorial', name: 'The Master Archive', description: 'Inspirado en revistas de moda. Grillas asimétricas y tipografía de gran formato.', styleTag: 'editorial', bgClass: 'bg-white', textClass: 'text-black', accentClass: 'bg-black', fontClass: 'font-serif' },
    { id: 'organic', name: 'Human Rhythm', description: 'Formas líquidas y tonos tierra. El diseño digital volviendo a sus raíces naturales.', styleTag: 'organic', bgClass: 'bg-[#F4F1EA]', textClass: '#4A3728', accentClass: 'bg-[#D2B48C]', fontClass: 'font-serif' },
    { id: 'luxury', name: 'Maison Prestige', description: 'Mármol, lino y oro. La cúspide de la elegancia corporativa y personal.', styleTag: 'luxury', bgClass: 'bg-[#FDFCF8]', textClass: 'text-[#1a1a1a]', accentClass: 'bg-[#C5A059]', fontClass: 'font-serif' }
  ];

  activeId = 'elegant';
  activeIndex = 0;
  isCarouselVisible = false;

  constructor(private route: ActivatedRoute, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.carousel.nativeElement.addEventListener('scroll', () => {
      this.updateActiveIndex();
    });

    // Intersection Observer to pause video when scrolling away and show navigation UI
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.target.id === 'hero-section') {
          if (this.heroVideo && this.heroVideo.nativeElement) {
            if (entry.isIntersecting) {
              this.heroVideo.nativeElement.play();
            } else {
              this.heroVideo.nativeElement.pause();
            }
          }
        }
        if (entry.target.id === 'projects-carousel') {
          this.isCarouselVisible = entry.isIntersecting;
          this.cdr.detectChanges();
        }
      });
    }, { threshold: 0.1 });

    const heroSection = document.getElementById('hero-section');
    if (heroSection) observer.observe(heroSection);
    
    const carouselSection = document.getElementById('projects-carousel');
    if (carouselSection) observer.observe(carouselSection);
  }

  scrollToProjects() {
    const projectsEl = document.getElementById('projects-carousel');
    if (projectsEl) {
      projectsEl.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      this.activeId = id;
      this.activeIndex = this.designs.findIndex(d => d.id === id);
    }
  }

  next() {
    if (this.activeIndex < this.designs.length - 1) {
      this.scrollTo(this.designs[this.activeIndex + 1].id);
    }
  }

  prev() {
    if (this.activeIndex > 0) {
      this.scrollTo(this.designs[this.activeIndex - 1].id);
    }
  }

  updateActiveIndex() {
    const scrollLeft = this.carousel.nativeElement.scrollLeft;
    const width = this.carousel.nativeElement.offsetWidth;
    this.activeIndex = Math.round(scrollLeft / width);
    this.activeId = this.designs[this.activeIndex].id;
  }

  useDesign() {
    alert('¡Diseño seleccionado con éxito! Iniciando despliegue...');
  }
}
