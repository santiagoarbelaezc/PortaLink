import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-tratamiento-datos',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    
    <main class="min-h-screen bg-white text-neutral-900 pt-24 sm:pt-32 pb-20 px-4 sm:px-12 lg:px-24">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-10 sm:mb-14 border-b border-neutral-100 pb-8 text-center sm:text-left">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 text-white text-[11px] font-headline font-semibold tracking-wider shadow-2xs mb-4" style="color: #ffffff !important;">
            HABEAS DATA Y DERECHOS ARCO
          </div>
          <h1 class="text-3xl sm:text-5xl font-headline font-bold tracking-tight text-neutral-900 leading-tight mb-3" style="color: #0a0a0a !important;">
            Tratamiento de Datos Personales
          </h1>
          <p class="text-sm sm:text-base font-sans font-normal text-neutral-500 max-w-2xl leading-relaxed">
            Política de tratamiento de datos acorde con la Ley 1581 de 2012 y regulación aplicable.
          </p>
        </div>

        <!-- Content Cards -->
        <div class="space-y-6 text-neutral-600 font-sans text-sm sm:text-base leading-relaxed">
          
          <section class="bg-neutral-50/80 border border-neutral-200/80 rounded-[24px] sm:rounded-[32px] p-6 sm:p-9 shadow-[0_10px_35px_rgba(0,0,0,0.03)] space-y-3">
            <h2 class="text-xl sm:text-2xl font-headline font-bold tracking-tight text-neutral-900 flex items-center gap-3" style="color: #0a0a0a !important;">
              <span class="w-2.5 h-2.5 rounded-full bg-neutral-900 flex-shrink-0"></span>
              1. Identificación del Responsable del Tratamiento
            </h2>
            <p>
              El responsable del tratamiento de los datos personales recolectados a través de esta plataforma es <strong>Santiago Arbeláez / PortaLink</strong>, con domicilio de operaciones en Colombia y canal oficial de contacto en <strong>arbelaezz.c11&#64;gmail.com</strong>.
            </p>
          </section>

          <section class="bg-neutral-50/80 border border-neutral-200/80 rounded-[24px] sm:rounded-[32px] p-6 sm:p-9 shadow-[0_10px_35px_rgba(0,0,0,0.03)] space-y-3">
            <h2 class="text-xl sm:text-2xl font-headline font-bold tracking-tight text-neutral-900 flex items-center gap-3" style="color: #0a0a0a !important;">
              <span class="w-2.5 h-2.5 rounded-full bg-neutral-900 flex-shrink-0"></span>
              2. Principios Rectores del Tratamiento
            </h2>
            <p>
              En el desarrollo de la recolección y procesamiento de datos personales, PortaLink aplicará estrictamente los siguientes principios:
            </p>
            <ul class="list-disc list-inside space-y-2 text-neutral-600 pl-2">
              <li><strong>Principio de Legalidad:</strong> El tratamiento es una actividad reglada sujeta a lo establecido en la ley.</li>
              <li><strong>Principio de Finalidad:</strong> Los datos son recolectados con un propósito legítimo e informado al titular.</li>
              <li><strong>Principio de Libertad:</strong> El tratamiento solo se ejerce con el consentimiento previo, expreso e informado del Titular.</li>
              <li><strong>Principio de Seguridad y Confidencialidad:</strong> Medidas técnicas para evitar adulteración, pérdida o acceso no autorizado.</li>
            </ul>
          </section>

          <section class="bg-neutral-50/80 border border-neutral-200/80 rounded-[24px] sm:rounded-[32px] p-6 sm:p-9 shadow-[0_10px_35px_rgba(0,0,0,0.03)] space-y-3">
            <h2 class="text-xl sm:text-2xl font-headline font-bold tracking-tight text-neutral-900 flex items-center gap-3" style="color: #0a0a0a !important;">
              <span class="w-2.5 h-2.5 rounded-full bg-neutral-900 flex-shrink-0"></span>
              3. Derechos de los Titulares (ARCO)
            </h2>
            <p>
              Como titular de datos personales, usted tiene derecho a conocer, actualizar, rectificar y solicitar la supresión de su información de nuestras bases de datos en cualquier momento enviando su solicitud a <strong>arbelaezz.c11&#64;gmail.com</strong>.
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
export class TratamientoDatosComponent implements OnInit, OnDestroy {
  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  ngOnDestroy() {}
}
