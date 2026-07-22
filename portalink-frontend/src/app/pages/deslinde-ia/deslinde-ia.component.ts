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
    
    <main class="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6 sm:px-12 lg:px-24">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-12 border-b border-white/10 pb-8">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--accent-color,rgba(0,245,255,0.1))]/10 border border-[var(--accent-color,#00f5ff)]/30 text-[10px] uppercase tracking-[0.25em] font-mono font-bold text-[var(--accent-color,#00f5ff)] mb-4">
            DESLINDE Y AVISO LEGAL DE IA
          </div>
          <h1 class="text-4xl sm:text-5xl font-headline font-black uppercase tracking-tight text-white mb-4">
            Exención de Responsabilidad sobre IA (Rotbot / Groq / Llama)
          </h1>
          <p class="text-sm text-white/50 font-light leading-relaxed">
            Aviso legal regulatorio sobre el uso de tecnologías de Inteligencia Artificial generativa y modelos de lenguaje en PortaLink.
          </p>
        </div>

        <!-- Warning Alert Banner -->
        <div class="bg-[var(--accent-color,rgba(0,245,255,0.05))]/10 border border-[var(--accent-color,#00f5ff)]/20 rounded-2xl p-6 mb-10 flex items-start gap-4">
          <div class="w-8 h-8 rounded-full bg-[var(--accent-color,#00f5ff)]/20 text-[var(--accent-color,#00f5ff)] flex items-center justify-center font-bold text-lg flex-shrink-0 mt-1">
            🤖
          </div>
          <div>
            <h3 class="text-base font-bold text-white uppercase tracking-wider mb-1">Aviso Importante sobre Inteligencia Artificial</h3>
            <p class="text-xs sm:text-sm text-white/70 leading-relaxed font-light">
              El asistente virtual <strong>Rotbot</strong> utiliza modelos probabilísticos avanzados a través de la infraestructura de <strong>Groq API</strong> y arquitecturas de lenguaje de código abierto <strong>Llama 3</strong>. Las respuestas son automatizadas y no deben tomarse como asesoría legal, financiera o comercial vinculante.
            </p>
          </div>
        </div>

        <!-- Content -->
        <div class="space-y-10 text-white/80 font-light leading-relaxed text-sm sm:text-base">
          
          <section class="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8">
            <h2 class="text-xl font-bold uppercase tracking-wide text-white mb-4 flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-[var(--accent-color,#00f5ff)]"></span>
              1. Naturaleza de las Respuestas Generadas por IA
            </h2>
            <p class="mb-4">
              Rotbot es un copropósito automatizado diseñado para orientar, responder dudas generales sobre los servicios de desarrollo web y facilitar interacciones iniciales. Los modelos de lenguaje generativos operan mediante patrones estadísticos y pueden incurrir involuntariamente en imprecisiones, inconsistencias o la denominada "alucinación de IA".
            </p>
            <p>
              Por ende, ninguna respuesta, texto o recomendación generada por Rotbot constituye una promesa de servicio, garantía explícita o compromiso contractual vinculante por parte de PortaLink o de su desarrollador **Santiago Arbeláez**.
            </p>
          </section>

          <section class="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8">
            <h2 class="text-xl font-bold uppercase tracking-wide text-white mb-4 flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-[var(--accent-color,#00f5ff)]"></span>
              2. Cotizaciones, Tarifas y Estimaciones de Tiempo
            </h2>
            <ul class="list-disc list-inside space-y-3 text-white/70">
              <li>Cualquier cifra de precios, estimado económico o plazo de entrega mencionado por el chat flotante o la interfaz de Rotbot es puramente **estimativo y orientativo**.</li>
              <li>Las ofertas comerciales formales y los presupuestos oficiales solo serán válidos una vez emitidos por escrito y firmados por el desarrollador a través de canales directos institucionales.</li>
              <li>PortaLink se reserva el derecho de ajustar cualquier cifra sugerida automáticamente por la Inteligencia Artificial.</li>
            </ul>
          </section>

          <section class="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8">
            <h2 class="text-xl font-bold uppercase tracking-wide text-white mb-4 flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-[var(--accent-color,#00f5ff)]"></span>
              3. Deslinde de Responsabilidad Técnica y Legal
            </h2>
            <p class="mb-4">
              En la máxima extensión permitida por la ley:
            </p>
            <ul class="list-disc list-inside space-y-2 text-white/70">
              <li>PortaLink y su creador quedan eximidos de cualquier responsabilidad directa, indirecta, incidental, punitiva o emergente derivada de decisiones de negocio, compras o estrategias adoptadas por los usuarios con base en la información provista por la IA.</li>
              <li>No nos hacemos responsables por fallas, caídas del servicio de la API de Groq, latencias en los servidores de Llama o interrupciones de red de terceros.</li>
              <li>El usuario reconoce que interactúa con un agente artificial y que tiene la facultad de solicitar atención humana directa en cualquier momento.</li>
            </ul>
          </section>

          <section class="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8">
            <h2 class="text-xl font-bold uppercase tracking-wide text-white mb-4 flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-[var(--accent-color,#00f5ff)]"></span>
              4. Propiedad Intelectual de Proveedores de IA
            </h2>
            <p>
              Groq y Llama (Meta Platforms, Inc.) son marcas comerciales registradas de sus respectivos propietarios. PortaLink utiliza sus APIs y modelos de lenguaje de conformidad con sus respectivas licencias de uso comercial y términos de servicio de desarrollador.
            </p>
          </section>

          <section class="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8">
            <h2 class="text-xl font-bold uppercase tracking-wide text-white mb-4 flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-[var(--accent-color,#00f5ff)]"></span>
              5. Atención y Verificación Humana
            </h2>
            <p>
              Para validar formalmente cualquier requerimiento o recibir asesoramiento profesional humano directo sin intervención de IA, puede escribirnos a <strong>arbelaezz.c11&#64;gmail.com</strong> o comunicarse al WhatsApp oficial de soporte.
            </p>
          </section>

        </div>

        <!-- Action Button -->
        <div class="mt-16 text-center">
          <a routerLink="/" class="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all">
            ← Volver al Inicio
          </a>
        </div>
      </div>
    </main>

    <app-footer></app-footer>
  `
})
export class DeslindeIaComponent implements OnInit, OnDestroy {

  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }

  ngOnDestroy() {}
}
