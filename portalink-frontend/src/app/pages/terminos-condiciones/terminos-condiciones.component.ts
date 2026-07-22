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
    
    <main class="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6 sm:px-12 lg:px-24">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-12 border-b border-white/10 pb-8">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--accent-color,rgba(0,245,255,0.1))]/10 border border-[var(--accent-color,#00f5ff)]/30 text-[10px] uppercase tracking-[0.25em] font-mono font-bold text-[var(--accent-color,#00f5ff)] mb-4">
            MARCO LEGAL Y CONTRACTUAL
          </div>
          <h1 class="text-4xl sm:text-5xl font-headline font-black uppercase tracking-tight text-white mb-4">
            Términos y Condiciones de Uso
          </h1>
          <p class="text-sm text-white/50 font-light leading-relaxed">
            Vigente para todos los servicios y plataformas desarrolladas por PortaLink.
          </p>
        </div>

        <!-- Content -->
        <div class="space-y-10 text-white/80 font-light leading-relaxed text-sm sm:text-base">
          
          <section class="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8">
            <h2 class="text-xl font-bold uppercase tracking-wide text-white mb-4 flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-[var(--accent-color,#00f5ff)]"></span>
              1. Aceptación de los Términos
            </h2>
            <p>
              Al acceder, navegar o utilizar la plataforma **PortaLink** o contratar cualquiera de nuestros servicios de desarrollo de software a medida, e-commerce, sistemas de gestión o soluciones de Inteligencia Artificial, el usuario ("Cliente" o "Usuario") acepta expresamente y sin reservas quedar vinculado por los presentes Términos y Condiciones. Si no está de acuerdo con alguno de estos términos, debe abstenerse de utilizar el sitio y sus servicios.
            </p>
          </section>

          <section class="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8">
            <h2 class="text-xl font-bold uppercase tracking-wide text-white mb-4 flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-[var(--accent-color,#00f5ff)]"></span>
              2. Alcance de los Servicios y Desarrollo a Medida
            </h2>
            <p class="mb-4">
              PortaLink ofrece servicios de arquitectura de software, ingeniería frontend/backend, diseño UI/UX, integración de modelos de lenguaje (IA) e implementación de plataformas web.
            </p>
            <ul class="list-disc list-inside space-y-2 text-white/70">
              <li>Los proyectos desarrollados se ajustarán estrictamente a las especificaciones acordadas en la propuesta comercial o contrato de prestación de servicios.</li>
              <li>Cualquier modificación, adición o alcance posterior no especificado inicialmente requerirá una solicitud formal y podrá generar costos adicionales.</li>
              <li>PortaLink no se hace responsable por interrupciones ocasionadas por proveedores externos de infraestructura (servidores, hosting, dominios, pasarelas de pago o APIs de terceros).</li>
            </ul>
          </section>

          <section class="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8">
            <h2 class="text-xl font-bold uppercase tracking-wide text-white mb-4 flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-[var(--accent-color,#00f5ff)]"></span>
              3. Propiedad Intelectual y Licenciamiento de Código
            </h2>
            <p class="mb-4">
              Todos los derechos de propiedad intelectual preexistentes de PortaLink (librerías propias, arquitecturas base, frameworks internos y diseños originales) son propiedad exclusiva del desarrollador.
            </p>
            <p>
              Una vez cancelado la totalidad del valor acordado por el proyecto, se otorga al Cliente una licencia de uso perpetua y no exclusiva sobre el código fuente final personalizado para la operación de su negocio, quedando prohibida su reventa o redistribución como producto de software genérico sin autorización por escrito.
            </p>
          </section>

          <section class="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8">
            <h2 class="text-xl font-bold uppercase tracking-wide text-white mb-4 flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-[var(--accent-color,#00f5ff)]"></span>
              4. Limitación de Responsabilidad Legal
            </h2>
            <p class="mb-4">
              En la máxima medida permitida por las leyes aplicables, PortaLink, sus propietarios o desarrolladores no serán responsables por:
            </p>
            <ul class="list-disc list-inside space-y-2 text-white/70">
              <li>Pérdidas de ingresos, lucros cesantes, pérdidas de datos o daños indirectos derivados del uso o imposibilidad de uso de la plataforma.</li>
              <li>Uso indebido o ilegal que el Cliente o terceros hagan de las aplicaciones web desarrolladas.</li>
              <li>Ataques cibernéticos, accesos no autorizados o vulnerabilidades causadas por contraseñas débiles o mal manejo por parte del Cliente.</li>
            </ul>
          </section>

          <section class="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8">
            <h2 class="text-xl font-bold uppercase tracking-wide text-white mb-4 flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-[var(--accent-color,#00f5ff)]"></span>
              5. Modificaciones y Ley Aplicable
            </h2>
            <p>
              PortaLink se reserva el derecho de actualizar o modificar estos Términos en cualquier momento sin previo aviso. Estos términos se regirán e interpretarán de acuerdo con la legislación vigente en la República de Colombia y las normas internacionales aplicables al comercio electrónico.
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
export class TerminosCondicionesComponent implements OnInit, OnDestroy {

  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }

  ngOnDestroy() {}
}
