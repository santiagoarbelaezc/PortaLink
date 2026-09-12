import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-deslinde-ia',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    
    <main class="min-h-screen bg-white text-neutral-900 pt-24 sm:pt-32 pb-20 px-4 sm:px-12 lg:px-24">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-10 sm:mb-14 border-b border-neutral-100 pb-8 text-center sm:text-left">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 text-white text-[11px] font-headline font-semibold tracking-wider shadow-2xs mb-4" style="color: #ffffff !important;">
            DESLINDE Y AVISO LEGAL DE IA
          </div>
          <h1 class="text-3xl sm:text-5xl font-headline font-bold tracking-tight text-neutral-900 leading-tight mb-3" style="color: #0a0a0a !important;">
            Exención de Responsabilidad sobre IA (RotBot)
          </h1>
          <p class="text-sm sm:text-base font-sans font-normal text-neutral-500 max-w-2xl leading-relaxed">
            Aviso legal regulatorio sobre el uso de Inteligencia Artificial generativa y modelos de lenguaje en PortaLink.
          </p>
        </div>

        <!-- Warning Alert Banner (Apple Style Clean Alert) -->
        <div class="bg-amber-50/80 border border-amber-200/80 rounded-[24px] p-6 mb-8 flex items-start gap-4 shadow-2xs">
          <div class="w-9 h-9 rounded-2xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center font-headline font-bold text-base flex-shrink-0 mt-0.5">
            🤖
          </div>
          <div>
            <h3 class="text-base font-headline font-bold text-amber-950 tracking-tight mb-1">Aviso Importante sobre Inteligencia Artificial</h3>
            <p class="text-xs sm:text-sm text-amber-900/90 leading-relaxed font-sans m-0">
              El asistente virtual <strong>RotBot</strong> utiliza modelos probabilísticos avanzados a través de la infraestructura de alta velocidad de <strong>Groq API</strong> y la arquitectura de razonamiento <strong>openai/gpt-oss-120b</strong> (con esfuerzo de razonamiento adaptativo). Las respuestas son automatizadas y no deben tomarse como asesoría legal, financiera o comercial vinculante.
            </p>
          </div>
        </div>

        <!-- Technical Specification Card (Transparencia Algorítmica) -->
        <div class="bg-neutral-50/80 border border-neutral-200/80 rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 mb-6 shadow-[0_10px_35px_rgba(0,0,0,0.03)]">
          <div class="flex items-center gap-2.5 mb-3">
            <span class="w-2.5 h-2.5 rounded-full bg-neutral-900"></span>
            <h2 class="text-base sm:text-lg font-headline font-bold text-neutral-900 m-0" style="color: #0a0a0a !important;">
              Ficha Técnica del Modelo Activo
            </h2>
          </div>
          <p class="text-xs sm:text-sm text-neutral-500 font-sans mb-5 leading-relaxed">
            En conformidad con las buenas prácticas de transparencia tecnológica y uso ético de IA, se detallan los parámetros de inferencia en producción para RotBot:
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div class="bg-white border border-neutral-200 rounded-2xl p-4 shadow-2xs">
              <span class="block text-[11px] font-headline uppercase font-semibold text-neutral-400 tracking-wider mb-1">Infraestructura</span>
              <span class="font-headline font-bold text-neutral-900 text-xs sm:text-sm flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Groq LPU™ Cloud
              </span>
            </div>
            <div class="bg-white border border-neutral-200 rounded-2xl p-4 shadow-2xs">
              <span class="block text-[11px] font-headline uppercase font-semibold text-neutral-400 tracking-wider mb-1">Modelo Neuronal</span>
              <span class="font-mono font-semibold text-neutral-900 text-xs break-all">
                openai/gpt-oss-120b
              </span>
            </div>
            <div class="bg-white border border-neutral-200 rounded-2xl p-4 shadow-2xs">
              <span class="block text-[11px] font-headline uppercase font-semibold text-neutral-400 tracking-wider mb-1">Nivel de Razonamiento</span>
              <span class="font-headline font-bold text-neutral-900 text-xs sm:text-sm">
                Medium (Medio)
              </span>
            </div>
            <div class="bg-white border border-neutral-200 rounded-2xl p-4 shadow-2xs">
              <span class="block text-[11px] font-headline uppercase font-semibold text-neutral-400 tracking-wider mb-1">Procesamiento</span>
              <span class="font-headline font-bold text-neutral-900 text-xs sm:text-sm">
                Streaming en Tiempo Real
              </span>
            </div>
          </div>
        </div>

        <!-- Content Cards -->
        <div class="space-y-6 text-neutral-600 font-sans text-sm sm:text-base leading-relaxed">
          
          <section class="bg-neutral-50/80 border border-neutral-200/80 rounded-[24px] sm:rounded-[32px] p-6 sm:p-9 shadow-[0_10px_35px_rgba(0,0,0,0.03)] space-y-3">
            <h2 class="text-xl sm:text-2xl font-headline font-bold tracking-tight text-neutral-900 flex items-center gap-3" style="color: #0a0a0a !important;">
              <span class="w-2.5 h-2.5 rounded-full bg-neutral-900 flex-shrink-0"></span>
              1. Naturaleza de las Respuestas Generadas por IA
            </h2>
            <p>
              RotBot es un copropósito automatizado diseñado para orientar, responder dudas generales sobre los servicios de desarrollo web y facilitar interacciones iniciales. Los modelos de lenguaje generativos operan mediante patrones estadísticos y pueden incurrir involuntariamente en imprecisiones o inconsistencias.
            </p>
            <p>
              Ninguna respuesta generada por RotBot constituye una promesa de servicio, garantía explícita o compromiso contractual vinculante por parte de PortaLink o de su desarrollador <strong>Santiago Arbeláez</strong>.
            </p>
          </section>

          <section class="bg-neutral-50/80 border border-neutral-200/80 rounded-[24px] sm:rounded-[32px] p-6 sm:p-9 shadow-[0_10px_35px_rgba(0,0,0,0.03)] space-y-3">
            <h2 class="text-xl sm:text-2xl font-headline font-bold tracking-tight text-neutral-900 flex items-center gap-3" style="color: #0a0a0a !important;">
              <span class="w-2.5 h-2.5 rounded-full bg-neutral-900 flex-shrink-0"></span>
              2. Uso Responsable e Interacción Humana
            </h2>
            <p>
              Recomendamos a todos los usuarios validar los detalles técnicos, alcances y cotizaciones directamente con nuestro equipo técnico antes de tomar decisiones comerciales o de contratación.
            </p>
          </section>

        </div>

        <!-- Action Button -->
        <div class="mt-14 text-center">
          <a routerLink="/" 
             class="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full font-headline font-semibold text-xs transition-all duration-300 shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer no-underline border-none"
             style="background-color: #09090b !important; color: #ffffff !important;">
            <span style="color: #ffffff !important; font-weight: 600;">← Volver al Inicio</span>
          </a>
        </div>
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class DeslindeIaComponent implements OnInit, OnDestroy {
  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  ngOnDestroy() {}
}
