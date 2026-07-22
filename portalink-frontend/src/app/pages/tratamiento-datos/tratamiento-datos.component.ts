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
    
    <main class="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6 sm:px-12 lg:px-24">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-12 border-b border-white/10 pb-8">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--accent-color,rgba(0,245,255,0.1))]/10 border border-[var(--accent-color,#00f5ff)]/30 text-[10px] uppercase tracking-[0.25em] font-mono font-bold text-[var(--accent-color,#00f5ff)] mb-4">
            HABEAS DATA Y DERECHOS ARCO
          </div>
          <h1 class="text-4xl sm:text-5xl font-headline font-black uppercase tracking-tight text-white mb-4">
            Tratamiento de Datos Personales
          </h1>
          <p class="text-sm text-white/50 font-light leading-relaxed">
            Política de tratamiento de datos acorde con la Ley 1581 de 2012 y regulación aplicable.
          </p>
        </div>

        <!-- Content -->
        <div class="space-y-10 text-white/80 font-light leading-relaxed text-sm sm:text-base">
          
          <section class="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8">
            <h2 class="text-xl font-bold uppercase tracking-wide text-white mb-4 flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-[var(--accent-color,#00f5ff)]"></span>
              1. Identificación del Responsable del Tratamiento
            </h2>
            <p>
              El responsable del tratamiento de los datos personales recolectados a través de esta plataforma es **Santiago Arbeláez / PortaLink**, con domicilio de operaciones en Colombia y canal oficial de contacto por correo electrónico en **arbelaezz.c11&#64;gmail.com**.
            </p>
          </section>

          <section class="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8">
            <h2 class="text-xl font-bold uppercase tracking-wide text-white mb-4 flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-[var(--accent-color,#00f5ff)]"></span>
              2. Principios Rectores del Tratamiento
            </h2>
            <p class="mb-4">
              En el desarrollo de la recolección y procesamiento de datos personales, PortaLink aplicará estrictamente los siguientes principios:
            </p>
            <ul class="list-disc list-inside space-y-2 text-white/70">
              <li><strong>Principio de Legalidad:</strong> El tratamiento es una actividad reglada que se sujeta a lo establecido en la ley.</li>
              <li><strong>Principio de Finalidad:</strong> Los datos son recolectados con un propósito legítimo e informado al titular.</li>
              <li><strong>Principio de Libertad:</strong> El tratamiento solo puede ejercerse con el consentimiento previo, expreso e informado del Titular.</li>
              <li><strong>Principio de Veracidad o Calidad:</strong> La información sujeta a tratamiento debe ser veraz, completa, exacta y actualizada.</li>
              <li><strong>Principio de Seguridad y Confidencialidad:</strong> Implementación de medidas técnicas para evitar adulteración, pérdida o acceso no autorizado.</li>
            </ul>
          </section>

          <section class="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8">
            <h2 class="text-xl font-bold uppercase tracking-wide text-white mb-4 flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-[var(--accent-color,#00f5ff)]"></span>
              3. Derechos del Titular de la Información (Derechos ARCO)
            </h2>
            <p class="mb-4">
              Como titular de los datos personales, el usuario tiene derecho a ejercer en cualquier momento sus facultades de:
            </p>
            <ul class="list-disc list-inside space-y-2 text-white/70">
              <li><strong>Acceso / Conocer:</strong> Solicitar prueba de la autorización otorgada y consultar sus datos personales almacenados.</li>
              <li><strong>Rectificación / Actualizar:</strong> Solicitar la corrección de datos inexactos, incompletos o fraccionados.</li>
              <li><strong>Cancelación / Supresión:</strong> Solicitar la eliminación de sus datos de nuestras bases cuando considere que no están siendo tratados conforme a la ley.</li>
              <li><strong>Oposición / Revocar:</strong> Revocar la autorización otorgada para el tratamiento de sus datos personales.</li>
            </ul>
          </section>

          <section class="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8">
            <h2 class="text-xl font-bold uppercase tracking-wide text-white mb-4 flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-[var(--accent-color,#00f5ff)]"></span>
              4. Procedimiento para Consultas y Reclamos
            </h2>
            <p class="mb-4">
              Para ejercer cualquiera de sus Derechos ARCO o solicitar la eliminación total de su registro, el titular deberá enviar una solicitud por escrito indicando:
            </p>
            <ol class="list-decimal list-inside space-y-2 text-white/70">
              <li>Nombre completo del titular y número de contacto.</li>
              <li>Descripción clara de la solicitud (consulta, actualización, rectificación o supresión).</li>
              <li>Dirección de correo electrónico para la notificación de respuesta.</li>
            </ol>
            <p class="mt-4">
              Las consultas y reclamos serán atendidas en un plazo máximo de diez (10) a quince (15) días hábiles contados a partir de la fecha de recepción.
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
export class TratamientoDatosComponent implements OnInit, OnDestroy {

  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }

  ngOnDestroy() {}
}
