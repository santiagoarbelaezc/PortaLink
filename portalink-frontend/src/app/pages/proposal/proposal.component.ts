import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PortfolioConfigService } from '../../services/portfolio-config.service';

@Component({
  selector: 'app-proposal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen lg:h-screen overflow-y-auto lg:overflow-hidden bg-neutral-950 font-sans grid grid-cols-1 lg:grid-cols-12">

      <!-- Left Side (Banner Style - similar to Login) -->
      <div class="relative hidden lg:flex flex-col justify-center overflow-hidden bg-[#050505] border-r border-neutral-800/50 pt-[88px] lg:col-span-8 h-full"
           style="--bg-primary: #050505; --bg-secondary: #0a0a0a; --text-primary: #ffffff; --text-secondary: rgba(255, 255, 255, 0.6); --card-border: rgba(255, 255, 255, 0.1);">
        
        <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(0,180,216,0.15)_0%,transparent_60%)] pointer-events-none translate-x-1/4 -translate-y-1/4"></div>

        <div class="relative z-10 w-full flex items-center justify-between h-full">
          
          <!-- Texts and Actions (Left) -->
          <div class="w-full max-w-[350px] md:max-w-[500px] lg:max-w-[650px] xl:max-w-[850px] 2xl:max-w-[1000px] pl-12 pr-4 flex flex-col justify-center pb-24 mt-8 animate-fade-in">
            <!-- Header small -->
            <div class="flex items-center gap-2 mb-4">
              <span class="text-[11px] md:text-sm font-bold text-neutral-300 uppercase tracking-[0.3em]">Transformación Digital</span>
              <span class="text-[11px] md:text-sm font-bold text-[#00b4d8] uppercase tracking-[0.3em]">IA</span>
            </div>

            <!-- Huge Titles -->
            <h2 class="text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black uppercase leading-[1] tracking-tight mb-2 text-white drop-shadow-xl break-words" style="font-family: 'Bebas Neue', var(--font-headline, sans-serif);">
              Construyamos un sistema
            </h2>
            <h2 class="text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black uppercase leading-[1] tracking-tight mb-8 text-[#00b4d8] drop-shadow-[0_0_20px_rgba(0,180,216,0.4)] break-words" style="font-family: 'Bebas Neue', var(--font-headline, sans-serif);">
              Para tu negocio juntos
            </h2>

            <!-- Left Bordered Subtitle -->
            <div class="border-l-2 border-[#00b4d8] pl-5 mb-10">
              <p class="text-xs xl:text-sm text-neutral-300 uppercase tracking-[0.15em] font-medium leading-relaxed max-w-lg">
                Has visto el potencial. Ahora hagámoslo <span class="text-[#00b4d8] font-bold">realidad</span>. Contáctame por cualquiera de mis enlaces a la derecha.
              </p>
            </div>
            
            <button routerLink="/rotbot" class="group relative flex items-center gap-4 bg-black/80 border border-neutral-700 rounded-2xl px-6 py-4 w-max overflow-hidden hover:border-[#00b4d8] transition-all duration-500 hover:shadow-[0_0_25px_rgba(0,180,216,0.2)] backdrop-blur-sm cursor-pointer">
              <span class="relative z-10 text-white text-[11px] font-bold uppercase tracking-[0.15em] pt-0.5">Volver al Chat</span>
            </button>
          </div>

          <!-- Robot Image (Right Absolute) -->
          <div class="absolute bottom-[-10px] right-[-20px] lg:right-[-30px] xl:right-[-50px] 2xl:right-[-70px] w-[350px] lg:w-[450px] xl:w-[550px] 2xl:w-[650px] pointer-events-none z-10">
            <img src="assets/images/rotbot4.png" class="w-full h-auto object-contain object-bottom drop-shadow-[0_10px_30px_rgba(0,180,216,0.2)] scale-x-[-1]" alt="Rotbot">
          </div>

        </div>
      </div>

      <!-- Right Side (Links) -->
      <div class="flex flex-col justify-start px-6 sm:px-12 relative bg-[#0a0a0a] lg:col-span-4 h-full overflow-y-auto transition-all duration-500 pb-32 lg:pb-12 border-l border-neutral-900/50"
           style="--text-primary: #ffffff; --text-secondary: rgba(255, 255, 255, 0.6); --card-border: rgba(255, 255, 255, 0.1);">
        <div class="w-full max-w-[450px] mx-auto lg:ml-auto lg:mr-0 mt-[100px] lg:mt-[120px] animate-fade-in">

          <!-- Section Title Group -->
          <div class="text-center mb-10 flex flex-col items-center">
            <span class="text-[11px] md:text-[12px] font-bold text-[#00b4d8] uppercase tracking-[0.25em] mb-1.5">
              Conecta Conmigo
            </span>
            <h3 class="text-2xl md:text-[26px] font-black uppercase leading-tight tracking-[-0.04em] text-[var(--text-primary)]" style="font-family: var(--font-headline, sans-serif);">
              Mis Enlaces
            </h3>
            <p class="text-[12px] md:text-[13px] text-[var(--text-secondary)] mt-1.5 font-medium max-w-[340px] leading-relaxed">
              Elige tu canal preferido para empezar tu proyecto.
            </p>
          </div>

          <!-- Links Grid (Fijos) -->
          <div class="flex flex-col gap-4">
            
            <!-- WhatsApp -->
            <a href="https://wa.me/tunumber" target="_blank"
               class="group bg-black/40 hover:bg-[#111] border border-[var(--card-border)] hover:border-[#25D366]/50 rounded-2xl p-4 transition-all duration-300 flex items-center justify-between shadow-sm">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-black border border-[var(--card-border)] flex items-center justify-center text-neutral-500 group-hover:text-[#25D366] group-hover:border-[#25D366]/30 transition-all shadow-inner">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                </div>
                <div>
                  <h4 class="text-[11px] font-bold uppercase tracking-widest text-[var(--text-primary)] group-hover:text-[#25D366] transition-colors">WhatsApp</h4>
                  <p class="text-[10px] text-[var(--text-secondary)] mt-1 font-medium">Atención Inmediata</p>
                </div>
              </div>
              <div class="text-neutral-600 group-hover:text-[#25D366] group-hover:translate-x-1.5 transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </div>
            </a>

            <!-- Gmail -->
            <a href="mailto:correo@gmail.com" target="_blank"
               class="group bg-black/40 hover:bg-[#111] border border-[var(--card-border)] hover:border-[#EA4335]/50 rounded-2xl p-4 transition-all duration-300 flex items-center justify-between shadow-sm">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-black border border-[var(--card-border)] flex items-center justify-center text-neutral-500 group-hover:text-[#EA4335] group-hover:border-[#EA4335]/30 transition-all shadow-inner">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div>
                  <h4 class="text-[11px] font-bold uppercase tracking-widest text-[var(--text-primary)] group-hover:text-[#EA4335] transition-colors">Gmail</h4>
                  <p class="text-[10px] text-[var(--text-secondary)] mt-1 font-medium">Escríbeme por correo</p>
                </div>
              </div>
              <div class="text-neutral-600 group-hover:text-[#EA4335] group-hover:translate-x-1.5 transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </div>
            </a>

            <!-- LinkedIn -->
            <a href="https://linkedin.com/in/tuperfil" target="_blank"
               class="group bg-black/40 hover:bg-[#111] border border-[var(--card-border)] hover:border-[#0A66C2]/50 rounded-2xl p-4 transition-all duration-300 flex items-center justify-between shadow-sm">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-black border border-[var(--card-border)] flex items-center justify-center text-neutral-500 group-hover:text-[#0A66C2] group-hover:border-[#0A66C2]/30 transition-all shadow-inner">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </div>
                <div>
                  <h4 class="text-[11px] font-bold uppercase tracking-widest text-[var(--text-primary)] group-hover:text-[#0A66C2] transition-colors">LinkedIn</h4>
                  <p class="text-[10px] text-[var(--text-secondary)] mt-1 font-medium">Conectemos profesionalmente</p>
                </div>
              </div>
              <div class="text-neutral-600 group-hover:text-[#0A66C2] group-hover:translate-x-1.5 transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </div>
            </a>

            <!-- Instagram -->
            <a href="https://instagram.com/tuperfil" target="_blank"
               class="group bg-black/40 hover:bg-[#111] border border-[var(--card-border)] hover:border-[#E1306C]/50 rounded-2xl p-4 transition-all duration-300 flex items-center justify-between shadow-sm">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-black border border-[var(--card-border)] flex items-center justify-center text-neutral-500 group-hover:text-[#E1306C] group-hover:border-[#E1306C]/30 transition-all shadow-inner">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </div>
                <div>
                  <h4 class="text-[11px] font-bold uppercase tracking-widest text-[var(--text-primary)] group-hover:text-[#E1306C] transition-colors">Instagram</h4>
                  <p class="text-[10px] text-[var(--text-secondary)] mt-1 font-medium">Mira mi trabajo</p>
                </div>
              </div>
              <div class="text-neutral-600 group-hover:text-[#E1306C] group-hover:translate-x-1.5 transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </div>
            </a>

          </div>

        </div>
      </div>
      
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ProposalComponent {
}
