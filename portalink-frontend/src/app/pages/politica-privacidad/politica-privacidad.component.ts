import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-politica-privacidad',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    
    <main class="min-h-screen bg-white text-neutral-900 pt-24 sm:pt-32 pb-20 px-4 sm:px-12 lg:px-24">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-10 sm:mb-14 border-b border-neutral-100 pb-8 text-center sm:text-left">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 text-white text-[11px] font-headline font-semibold tracking-wider shadow-2xs mb-4" style="color: #ffffff !important;">
            PROTECCIÓN Y PRIVACIDAD
          </div>
          <h1 class="text-3xl sm:text-5xl font-headline font-bold tracking-tight text-neutral-900 leading-tight mb-3" style="color: #0a0a0a !important;">
            Política de Privacidad y Cookies
          </h1>
          <p class="text-sm sm:text-base font-sans font-normal text-neutral-500 max-w-2xl leading-relaxed">
            Compromiso de protección de datos e información en PortaLink.
          </p>
        </div>

        <!-- Content Cards -->
        <div class="space-y-6 text-neutral-600 font-sans text-sm sm:text-base leading-relaxed">
          
          <section class="bg-neutral-50/80 border border-neutral-200/80 rounded-[24px] sm:rounded-[32px] p-6 sm:p-9 shadow-[0_10px_35px_rgba(0,0,0,0.03)] space-y-3">
            <h2 class="text-xl sm:text-2xl font-headline font-bold tracking-tight text-neutral-900 flex items-center gap-3" style="color: #0a0a0a !important;">
              <span class="w-2.5 h-2.5 rounded-full bg-neutral-900 flex-shrink-0"></span>
              1. Información que Recolectamos
            </h2>
            <p>
              En PortaLink nos tomamos muy en serio la privacidad de nuestros visitantes y clientes. La información personal que podemos recolectar incluye:
            </p>
            <ul class="list-disc list-inside space-y-2 text-neutral-600 pl-2">
              <li><strong>Datos de Identificación y Contacto:</strong> Nombre, correo electrónico, número de teléfono y nombre de la empresa suministrados voluntariamente.</li>
              <li><strong>Información Técnica:</strong> Dirección IP, tipo de navegador, sistema operativo y métricas de navegación mediante herramientas analíticas.</li>
              <li><strong>Credenciales y Tokens:</strong> Tokens de autenticación segura (JWT) almacenados localmente para mantener la sesión del usuario.</li>
            </ul>
          </section>

          <section class="bg-neutral-50/80 border border-neutral-200/80 rounded-[24px] sm:rounded-[32px] p-6 sm:p-9 shadow-[0_10px_35px_rgba(0,0,0,0.03)] space-y-3">
            <h2 class="text-xl sm:text-2xl font-headline font-bold tracking-tight text-neutral-900 flex items-center gap-3" style="color: #0a0a0a !important;">
              <span class="w-2.5 h-2.5 rounded-full bg-neutral-900 flex-shrink-0"></span>
              2. Finalidad del Uso de la Información
            </h2>
            <p>
              La información recopilada se utiliza exclusivamente para:
            </p>
            <ul class="list-disc list-inside space-y-2 text-neutral-600 pl-2">
              <li>Responder a solicitudes de información, cotizaciones y proyectos personalizados.</li>
              <li>Prestar, mantener y personalizar la experiencia del usuario dentro de la plataforma.</li>
              <li>Alimentar de forma anónima y segura el flujo de conversación de los asistentes de IA para brindar respuestas precisas.</li>
              <li>Enviar comunicaciones técnicas relevantes sobre el estado de sus proyectos.</li>
            </ul>
          </section>

          <section class="bg-neutral-50/80 border border-neutral-200/80 rounded-[24px] sm:rounded-[32px] p-6 sm:p-9 shadow-[0_10px_35px_rgba(0,0,0,0.03)] space-y-3">
            <h2 class="text-xl sm:text-2xl font-headline font-bold tracking-tight text-neutral-900 flex items-center gap-3" style="color: #0a0a0a !important;">
              <span class="w-2.5 h-2.5 rounded-full bg-neutral-900 flex-shrink-0"></span>
              3. No Divulgación a Terceros
            </h2>
            <p>
              PortaLink no vende, alquila, comercializa ni cede información personal de los usuarios a terceros bajo ninguna circunstancia. Solo compartiremos datos cuando sea estrictamente necesario para cumplir con obligaciones legales.
            </p>
          </section>

          <section class="bg-neutral-50/80 border border-neutral-200/80 rounded-[24px] sm:rounded-[32px] p-6 sm:p-9 shadow-[0_10px_35px_rgba(0,0,0,0.03)] space-y-3">
            <h2 class="text-xl sm:text-2xl font-headline font-bold tracking-tight text-neutral-900 flex items-center gap-3" style="color: #0a0a0a !important;">
              <span class="w-2.5 h-2.5 rounded-full bg-neutral-900 flex-shrink-0"></span>
              4. Cookies y Almacenamiento Local
            </h2>
            <p>
              Utilizamos cookies esenciales y almacenamiento local (localStorage) únicamente para recordar sus preferencias de sesión y tema visual. El usuario puede configurar su navegador para rechazar cookies en cualquier momento.
            </p>
          </section>

          <section class="bg-neutral-50/80 border border-neutral-200/80 rounded-[24px] sm:rounded-[32px] p-6 sm:p-9 shadow-[0_10px_35px_rgba(0,0,0,0.03)] space-y-3">
            <h2 class="text-xl sm:text-2xl font-headline font-bold tracking-tight text-neutral-900 flex items-center gap-3" style="color: #0a0a0a !important;">
              <span class="w-2.5 h-2.5 rounded-full bg-neutral-900 flex-shrink-0"></span>
              5. Contacto sobre Privacidad
            </h2>
            <p>
              Si tiene preguntas o dudas referentes a esta Política de Privacidad, puede ponerse en contacto directamente a través de nuestro correo electrónico institucional: <strong>arbelaezz.c11&#64;gmail.com</strong>.
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
export class PoliticaPrivacidadComponent implements OnInit, OnDestroy {
  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  ngOnDestroy() {}
}
