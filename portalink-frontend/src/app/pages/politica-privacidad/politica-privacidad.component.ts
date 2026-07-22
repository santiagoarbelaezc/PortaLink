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
    
    <main class="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6 sm:px-12 lg:px-24">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-12 border-b border-white/10 pb-8">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--accent-color,rgba(0,245,255,0.1))]/10 border border-[var(--accent-color,#00f5ff)]/30 text-[10px] uppercase tracking-[0.25em] font-mono font-bold text-[var(--accent-color,#00f5ff)] mb-4">
            PROTECCIÓN Y PRIVACIDAD
          </div>
          <h1 class="text-4xl sm:text-5xl font-headline font-black uppercase tracking-tight text-white mb-4">
            Política de Privacidad y Cookies
          </h1>
          <p class="text-sm text-white/50 font-light leading-relaxed">
            Compromiso de protección de datos e información en PortaLink.
          </p>
        </div>

        <!-- Content -->
        <div class="space-y-10 text-white/80 font-light leading-relaxed text-sm sm:text-base">
          
          <section class="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8">
            <h2 class="text-xl font-bold uppercase tracking-wide text-white mb-4 flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-[var(--accent-color,#00f5ff)]"></span>
              1. Información que Recolectamos
            </h2>
            <p class="mb-4">
              En PortaLink nos tomamos muy en serio la privacidad de nuestros visitantes y clientes. La información personal que podemos recolectar incluye:
            </p>
            <ul class="list-disc list-inside space-y-2 text-white/70">
              <li><strong>Datos de Identificación y Contacto:</strong> Nombre, correo electrónico, número de teléfono y nombre de la empresa suministrados voluntariamente en formularios o interacción con el chat.</li>
              <li><strong>Información Técnica:</strong> Dirección IP, tipo de navegador, sistema operativo y métricas de navegación mediante herramientas analíticas.</li>
              <li><strong>Credenciales y Tokens:</strong> Tokens de autenticación segura (JWT) almacenados localmente para mantener la sesión del usuario.</li>
            </ul>
          </section>

          <section class="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8">
            <h2 class="text-xl font-bold uppercase tracking-wide text-white mb-4 flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-[var(--accent-color,#00f5ff)]"></span>
              2. Finalidad del Uso de la Información
            </h2>
            <p class="mb-4">
              La información recopilada se utiliza exclusivamente para:
            </p>
            <ul class="list-disc list-inside space-y-2 text-white/70">
              <li>Responder a solicitudes de información, cotizaciones y proyectos personalizados.</li>
              <li>Prestar, mantener y personalizar la experiencia del usuario dentro de la plataforma.</li>
              <li>Alimentar de forma anónima y segura el flujo de conversación de los asistentes de IA para brindar respuestas precisas.</li>
              <li>Enviar comunicaciones técnicas o comerciales relevantes sobre el estado de sus proyectos o solicitudes.</li>
            </ul>
          </section>

          <section class="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8">
            <h2 class="text-xl font-bold uppercase tracking-wide text-white mb-4 flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-[var(--accent-color,#00f5ff)]"></span>
              3. No Divulgación a Terceros
            </h2>
            <p>
              PortaLink no vende, alquila, comercializa ni cede información personal de los usuarios a terceros bajo ninguna circunstancia. Solo compartiremos datos cuando sea estrictamente necesario para cumplir con obligaciones legales o requerimientos de autoridades judiciales competentes.
            </p>
          </section>

          <section class="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8">
            <h2 class="text-xl font-bold uppercase tracking-wide text-white mb-4 flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-[var(--accent-color,#00f5ff)]"></span>
              4. Cookies y Almacenamiento Local
            </h2>
            <p>
              Utilizamos cookies esenciales y almacenamiento local (localStorage) únicamente para recordar sus preferencias de idioma, estado de sesión y tema visual. El usuario puede configurar su navegador para rechazar o eliminar cookies en cualquier momento.
            </p>
          </section>

          <section class="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8">
            <h2 class="text-xl font-bold uppercase tracking-wide text-white mb-4 flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-[var(--accent-color,#00f5ff)]"></span>
              5. Contacto sobre Privacidad
            </h2>
            <p>
              Si tiene preguntas o dudas referentes a esta Política de Privacidad, puede ponerse en contacto directamente a través de nuestro correo electrónico institucional: <strong>arbelaezz.c11&#64;gmail.com</strong>.
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
export class PoliticaPrivacidadComponent implements OnInit, OnDestroy {

  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }

  ngOnDestroy() {}
}
