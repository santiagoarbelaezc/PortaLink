import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-terminos-condiciones',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    
    <main class="min-h-screen bg-white text-neutral-900 pt-24 sm:pt-32 pb-20 px-4 sm:px-12 lg:px-24">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-10 sm:mb-14 border-b border-neutral-100 pb-8 text-center sm:text-left">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 text-white text-[11px] font-headline font-semibold tracking-wider shadow-2xs mb-4" style="color: #ffffff !important;">
            MARCO LEGAL Y CONTRACTUAL
          </div>
          <h1 class="text-3xl sm:text-5xl font-headline font-bold tracking-tight text-neutral-900 leading-tight mb-3" style="color: #0a0a0a !important;">
            Términos y Condiciones de Uso
          </h1>
          <p class="text-sm sm:text-base font-sans font-normal text-neutral-500 max-w-2xl leading-relaxed">
            Vigente para todos los servicios y plataformas desarrolladas por PortaLink.
          </p>
        </div>

        <!-- Content Cards -->
        <div class="space-y-6 text-neutral-600 font-sans text-sm sm:text-base leading-relaxed">
          
          <section class="bg-neutral-50/80 border border-neutral-200/80 rounded-[24px] sm:rounded-[32px] p-6 sm:p-9 shadow-[0_10px_35px_rgba(0,0,0,0.03)] space-y-3">
            <h2 class="text-xl sm:text-2xl font-headline font-bold tracking-tight text-neutral-900 flex items-center gap-3" style="color: #0a0a0a !important;">
              <span class="w-2.5 h-2.5 rounded-full bg-neutral-900 flex-shrink-0"></span>
              1. Aceptación de los Términos
            </h2>
            <p>
              Al acceder, navegar o utilizar la plataforma <strong>PortaLink</strong> o contratar cualquiera de nuestros servicios de desarrollo de software a medida, e-commerce, sistemas de gestión o soluciones de Inteligencia Artificial, el usuario acepta expresamente y sin reservas quedar vinculado por los presentes Términos y Condiciones.
            </p>
          </section>

          <section class="bg-neutral-50/80 border border-neutral-200/80 rounded-[24px] sm:rounded-[32px] p-6 sm:p-9 shadow-[0_10px_35px_rgba(0,0,0,0.03)] space-y-3">
            <h2 class="text-xl sm:text-2xl font-headline font-bold tracking-tight text-neutral-900 flex items-center gap-3" style="color: #0a0a0a !important;">
              <span class="w-2.5 h-2.5 rounded-full bg-neutral-900 flex-shrink-0"></span>
              2. Alcance de los Servicios y Desarrollo a Medida
            </h2>
            <p>
              PortaLink ofrece servicios de arquitectura de software, ingeniería frontend/backend, diseño UI/UX, integración de modelos de lenguaje (IA) e implementación de plataformas web.
            </p>
            <ul class="list-disc list-inside space-y-2 text-neutral-600 pl-2">
              <li>Los proyectos desarrollados se ajustarán estrictamente a las especificaciones acordadas en la propuesta comercial o contrato.</li>
              <li>Cualquier modificación o alcance posterior requerirá una solicitud formal y podrá generar costos adicionales.</li>
              <li>PortaLink no se hace responsable por interrupciones ocasionadas por proveedores externos de infraestructura (servidores, hosting o pasarelas de pago).</li>
            </ul>
          </section>

          <section class="bg-neutral-50/80 border border-neutral-200/80 rounded-[24px] sm:rounded-[32px] p-6 sm:p-9 shadow-[0_10px_35px_rgba(0,0,0,0.03)] space-y-3">
            <h2 class="text-xl sm:text-2xl font-headline font-bold tracking-tight text-neutral-900 flex items-center gap-3" style="color: #0a0a0a !important;">
              <span class="w-2.5 h-2.5 rounded-full bg-neutral-900 flex-shrink-0"></span>
              3. Propiedad Intelectual
            </h2>
            <p>
              Todos los componentes del sistema, marcas, logotipos, elementos de diseño y código fuente son propiedad exclusiva de PortaLink o son licenciados legítimamente para el Cliente tras la entrega final y liquidación contractual correspondiente.
            </p>
          </section>

          <section class="bg-neutral-50/80 border border-neutral-200/80 rounded-[24px] sm:rounded-[32px] p-6 sm:p-9 shadow-[0_10px_35px_rgba(0,0,0,0.03)] space-y-3">
            <h2 class="text-xl sm:text-2xl font-headline font-bold tracking-tight text-neutral-900 flex items-center gap-3" style="color: #0a0a0a !important;">
              <span class="w-2.5 h-2.5 rounded-full bg-neutral-900 flex-shrink-0"></span>
              4. Ley Aplicable y Jurisdicción
            </h2>
            <p>
              Los presentes Términos se rigen por las leyes de la República de Colombia. Para la resolución de cualquier controversia, las partes se someten a la jurisdicción ordinaria de los tribunales competentes.
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
export class TerminosCondicionesComponent implements OnInit, OnDestroy {
  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  ngOnDestroy() {}
}
