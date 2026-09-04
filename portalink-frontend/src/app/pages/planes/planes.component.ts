import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-planes',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent],
  template: `
    <div class="min-h-screen w-full flex flex-col bg-white text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
      
      <!-- SKELETON LOADER FOR PLANES -->
      <ng-container *ngIf="isLoading">
        <div class="flex-grow w-full pt-14 sm:pt-16 md:pt-20 pb-16 px-6 sm:px-12 flex flex-col items-center animate-pulse">
           <!-- Header Skeleton -->
           <div class="w-full max-w-4xl px-6 py-4 text-center flex flex-col items-center space-y-3">
             <div class="h-12 w-3/4 max-w-2xl rounded-2xl bg-neutral-200"></div>
             <div class="h-4 w-2/3 max-w-xl rounded-full bg-neutral-100"></div>
           </div>

           <!-- Grid Skeleton -->
           <div class="w-full max-w-[1500px] mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 items-stretch">
             <div *ngFor="let _ of [1,2,3,4]" class="rounded-[28px] border border-neutral-200 p-8 h-[520px] flex flex-col justify-between bg-neutral-50/50">
               <div class="flex flex-col space-y-4">
                 <div class="h-8 w-3/4 rounded-xl bg-neutral-200"></div>
                 <div class="h-4 w-full rounded-full bg-neutral-100"></div>
                 <div class="h-4 w-5/6 rounded-full bg-neutral-100"></div>
                 <div class="h-px w-full bg-neutral-200 my-4"></div>
                 <div class="space-y-3">
                   <div *ngFor="let _ of [1,2,3,4]" class="flex items-center gap-3">
                     <div class="w-4 h-4 rounded-full bg-neutral-200"></div>
                     <div class="h-4 w-2/3 rounded-full bg-neutral-100"></div>
                   </div>
                 </div>
               </div>
               <div class="h-12 w-full rounded-2xl bg-neutral-200 mt-8"></div>
             </div>
           </div>
        </div>
      </ng-container>

      <!-- Vista de Planes & Servicios -->
      <div *ngIf="!isLoading" class="flex-grow w-full pt-14 sm:pt-16 md:pt-20 flex flex-col items-center">
        
        <!-- Hero/Banner Paquetes -->
        <div class="w-full max-w-5xl px-6 pt-2 pb-6 sm:pt-4 sm:pb-8 text-center">
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-headline font-semibold tracking-tight leading-[1.08] text-[#0a0a0a]" style="color: #0a0a0a !important;">
            Paquetes de Desarrollo & Sistemas
          </h1>
          <p class="text-base sm:text-lg font-sans font-normal text-neutral-600 mt-3 max-w-2xl mx-auto leading-relaxed">
            Elige la solución ideal para tu negocio. Diseños de alto impacto, e-commerce interactivo e integraciones inteligentes a la medida.
          </p>
        </div>        

        <!-- Grid de Paquetes -->
        <div class="w-full max-w-[1500px] mx-auto px-6 sm:px-12 lg:px-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-20 items-stretch">
          
          <!-- Paquete 1: Landing Page Web y Móvil -->
          <div class="plan-card bg-white rounded-[28px] border border-neutral-200/80 flex flex-col justify-between overflow-hidden relative p-8 h-full shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 hover:border-neutral-400 transition-all duration-300">
            <!-- Top Content -->
            <div class="flex flex-col">
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-[11px] font-headline font-semibold w-fit mb-4">
                Web & Móvil
              </div>
              <h3 class="text-xl sm:text-2xl font-headline font-semibold tracking-tight text-[#0a0a0a] mb-3 min-h-[56px] flex items-center" style="color: #0a0a0a !important;">
                Landing Page Web y Móvil
              </h3>
              <p class="text-xs sm:text-sm text-neutral-600 mb-6 leading-relaxed min-h-[54px]">
                Sitio web de una sola página con todas las secciones que requieras, diseñado para captar clientes y presentar tu negocio de forma directa.
              </p>
              
              <div class="h-px w-full bg-neutral-100 mb-6"></div>
              
              <ul class="space-y-3.5 mb-8 p-0 list-none">
                <li class="text-xs sm:text-[13px] text-neutral-700 font-medium flex items-center gap-3">
                  <span class="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 shrink-0">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                  </span>
                  Sitio de una sola página
                </li>
                <li class="text-xs sm:text-[13px] text-neutral-700 font-medium flex items-center gap-3">
                  <span class="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 shrink-0">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                  </span>
                  Diseño móvil al gusto
                </li>
                <li class="text-xs sm:text-[13px] text-neutral-700 font-medium flex items-center gap-3">
                  <span class="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 shrink-0">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                  </span>
                  Formulario de contacto
                </li>
                <li class="text-xs sm:text-[13px] text-neutral-700 font-medium flex items-center gap-3">
                  <span class="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 shrink-0">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                  </span>
                  Hosting y SSL incluidos
                </li>
              </ul>
            </div>
            
            <!-- Bottom Action to WhatsApp -->
            <div class="mt-auto pt-4">
              <a href="https://wa.me/573054078225?text=Hola%2C%20quiero%20cotizar%20el%20servicio%20de%20Landing%20Page%20Web%20y%20M%C3%B3vil" 
                 target="_blank" rel="noopener noreferrer" 
                 class="w-full py-3.5 px-4 rounded-2xl font-headline font-semibold text-xs tracking-wider flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] no-underline shadow-sm hover:shadow-md cursor-pointer"
                 style="background-color: #09090b !important; color: #ffffff !important;">
                <i class="fa-brands fa-whatsapp text-emerald-400 text-sm"></i>
                <span style="color: #ffffff !important; font-weight: 600;">Cotiza tu Servicio Ya</span>
              </a>
            </div>
          </div>

          <!-- Paquete 2: E-commerce Autopersonalizable Web y Móvil -->
          <div class="plan-card bg-white rounded-[28px] border border-neutral-200/80 flex flex-col justify-between overflow-hidden relative p-8 h-full shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 hover:border-neutral-400 transition-all duration-300">
            <!-- Top Content -->
            <div class="flex flex-col">
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-[11px] font-headline font-semibold w-fit mb-4">
                E-Commerce
              </div>
              <h3 class="text-xl sm:text-2xl font-headline font-semibold tracking-tight text-[#0a0a0a] mb-3 min-h-[56px] flex items-center" style="color: #0a0a0a !important;">
                E-commerce Autopersonalizable Web y Móvil
              </h3>
              <p class="text-xs sm:text-sm text-neutral-600 mb-6 leading-relaxed min-h-[54px]">
                Tu tienda online con la libertad de cambiar el diseño, colores, fuentes y secciones en tiempo real con nuestro editor interactivo.
              </p>
              
              <div class="h-px w-full bg-neutral-100 mb-6"></div>
              
              <ul class="space-y-3.5 mb-8 p-0 list-none">
                <li class="text-xs sm:text-[13px] text-neutral-700 font-medium flex items-center gap-3">
                  <span class="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 shrink-0">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                  </span>
                  Editor Visual Interactivo
                </li>
                <li class="text-xs sm:text-[13px] text-neutral-700 font-medium flex items-center gap-3">
                  <span class="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 shrink-0">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                  </span>
                  Diseño móvil al gusto
                </li>
                <li class="text-xs sm:text-[13px] text-neutral-700 font-medium flex items-center gap-3">
                  <span class="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 shrink-0">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                  </span>
                  Secciones premium en vivo
                </li>
                <li class="text-xs sm:text-[13px] text-neutral-700 font-medium flex items-center gap-3">
                  <span class="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 shrink-0">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                  </span>
                  Autogestión de catálogo
                </li>
              </ul>
            </div>
            
            <!-- Bottom Action to WhatsApp -->
            <div class="mt-auto pt-4">
              <a href="https://wa.me/573054078225?text=Hola%2C%20quiero%20cotizar%20el%20servicio%20de%20E-commerce%20Autopersonalizable%20Web%20y%20M%C3%B3vil" 
                 target="_blank" rel="noopener noreferrer" 
                 class="w-full py-3.5 px-4 rounded-2xl font-headline font-semibold text-xs tracking-wider flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] no-underline shadow-sm hover:shadow-md cursor-pointer"
                 style="background-color: #09090b !important; color: #ffffff !important;">
                <i class="fa-brands fa-whatsapp text-emerald-400 text-sm"></i>
                <span style="color: #ffffff !important; font-weight: 600;">Cotiza tu Servicio Ya</span>
              </a>
            </div>
          </div>

          <!-- Paquete 3: E-commerce con IA Integrada Web y Móvil (MÁS VENDIDO) -->
          <div class="plan-card bg-white rounded-[28px] border-2 border-neutral-900 flex flex-col justify-between overflow-hidden relative h-full shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] hover:-translate-y-1.5 transition-all duration-300">
            <!-- Header Popular -->
            <div class="bg-neutral-900 text-white text-[11px] font-headline font-bold uppercase tracking-[0.25em] py-2.5 text-center w-full flex items-center justify-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>MÁS VENDIDO</span>
            </div>

            <div class="p-8 flex-grow flex flex-col justify-between">
              <!-- Top Content -->
              <div class="flex flex-col">
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-900 text-[11px] font-headline font-semibold w-fit mb-4">
                  IA + E-Commerce
                </div>
                <h3 class="text-xl sm:text-2xl font-headline font-semibold tracking-tight text-[#0a0a0a] mb-3 min-h-[56px] flex items-center" style="color: #0a0a0a !important;">
                  E-commerce con Inteligencia Artificial Integrada Web y Móvil
                </h3>
                <p class="text-xs sm:text-sm text-neutral-600 mb-6 leading-relaxed min-h-[54px]">
                  La máxima potencia para tu negocio: tienda online personalizable integrada con inteligencia artificial (Rotbot IA) para potenciar tus ventas.
                </p>
                
                <div class="h-px w-full bg-neutral-100 mb-6"></div>
                
                <ul class="space-y-3.5 mb-8 p-0 list-none">
                  <li class="text-xs sm:text-[13px] text-neutral-900 font-semibold flex items-center gap-3">
                    <span class="w-5 h-5 rounded-full bg-neutral-900 flex items-center justify-center text-white shrink-0">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                    </span>
                    Copiloto Rotbot IA 24/7
                  </li>
                  <li class="text-xs sm:text-[13px] text-neutral-700 font-medium flex items-center gap-3">
                    <span class="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 shrink-0">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                    </span>
                    Editor Visual Interactivo
                  </li>
                  <li class="text-xs sm:text-[13px] text-neutral-700 font-medium flex items-center gap-3">
                    <span class="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 shrink-0">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                    </span>
                    Diseño móvil al gusto
                  </li>
                  <li class="text-xs sm:text-[13px] text-neutral-700 font-medium flex items-center gap-3">
                    <span class="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 shrink-0">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                    </span>
                    Chatbots inteligentes
                  </li>
                </ul>
              </div>
              
              <!-- Bottom Action to WhatsApp -->
              <div class="mt-auto pt-4">
                <a href="https://wa.me/573054078225?text=Hola%2C%20quiero%20cotizar%20el%20servicio%20de%20E-commerce%20con%20Inteligencia%20Artificial%20Integrada%20Web%20y%20M%C3%B3vil" 
                   target="_blank" rel="noopener noreferrer" 
                   class="w-full py-3.5 px-4 rounded-2xl font-headline font-semibold text-xs tracking-wider flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] no-underline shadow-md hover:shadow-lg cursor-pointer"
                   style="background-color: #09090b !important; color: #ffffff !important;">
                  <i class="fa-brands fa-whatsapp text-emerald-400 text-sm"></i>
                  <span style="color: #ffffff !important; font-weight: 600;">Cotiza tu Servicio Ya</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Paquete 4: Sistema a la Medida de tu Negocio Web y Móvil -->
          <div class="plan-card bg-white rounded-[28px] border border-neutral-200/80 flex flex-col justify-between overflow-hidden relative p-8 h-full shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 hover:border-neutral-400 transition-all duration-300">
            <!-- Top Content -->
            <div class="flex flex-col">
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-[11px] font-headline font-semibold w-fit mb-4">
                A la Medida
              </div>
              <h3 class="text-xl sm:text-2xl font-headline font-semibold tracking-tight text-[#0a0a0a] mb-3 min-h-[56px] flex items-center" style="color: #0a0a0a !important;">
                Sistema a la Medida de tu Negocio Web y Móvil
              </h3>
              <p class="text-xs sm:text-sm text-neutral-600 mb-6 leading-relaxed min-h-[54px]">
                ¿Requieres algo único? Soluciones a la medida de tu negocio, habla con nosotros para ajustar cuál es la plataforma que requieres.
              </p>
              
              <div class="h-px w-full bg-neutral-100 mb-6"></div>
              
              <ul class="space-y-3.5 mb-8 p-0 list-none">
                <li class="text-xs sm:text-[13px] text-neutral-700 font-medium flex items-center gap-3">
                  <span class="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 shrink-0">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                  </span>
                  Requerimientos a medida
                </li>
                <li class="text-xs sm:text-[13px] text-neutral-700 font-medium flex items-center gap-3">
                  <span class="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 shrink-0">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                  </span>
                  Integraciones especiales (APIs)
                </li>
                <li class="text-xs sm:text-[13px] text-neutral-700 font-medium flex items-center gap-3">
                  <span class="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 shrink-0">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                  </span>
                  Asesoría directa en sistemas
                </li>
                <li class="text-xs sm:text-[13px] text-neutral-700 font-medium flex items-center gap-3">
                  <span class="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 shrink-0">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                  </span>
                  Escalabilidad garantizada
                </li>
              </ul>
            </div>
            
            <!-- Bottom Action to WhatsApp -->
            <div class="mt-auto pt-4">
              <a href="https://wa.me/573054078225?text=Hola%2C%20quiero%20cotizar%20un%20Sistema%20a%20la%20Medida%20de%20mi%20Negocio%20Web%20y%20M%C3%B3vil" 
                 target="_blank" rel="noopener noreferrer" 
                 class="w-full py-3.5 px-4 rounded-2xl font-headline font-semibold text-xs tracking-wider flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] no-underline shadow-sm hover:shadow-md cursor-pointer"
                 style="background-color: #09090b !important; color: #ffffff !important;">
                <i class="fa-brands fa-whatsapp text-emerald-400 text-sm"></i>
                <span style="color: #ffffff !important; font-weight: 600;">Cotiza tu Servicio Ya</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Sección de Servicios Incluidos -->
        <div class="w-full max-w-[1500px] mx-auto px-6 sm:px-12 lg:px-16 pb-24">
          <div class="border-t border-neutral-200/80 pt-16 mb-12">
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-headline font-semibold tracking-tight text-[#0a0a0a] mt-2" style="color: #0a0a0a !important;">
              Servicios Incluidos en todos los Paquetes
            </h2>
            <p class="text-sm sm:text-base text-neutral-600 mt-2 max-w-xl leading-relaxed">
              Infraestructura robusta, seguridad y herramientas de gestión empresarial sin costos ocultos.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <!-- Servicio 1: Hosting & SSL -->
            <div class="service-card p-6 rounded-[22px] border border-neutral-200/80 bg-white shadow-sm hover:shadow-md hover:border-neutral-300 hover:-translate-y-1 transition-all duration-300">
              <div class="flex items-center gap-3.5 mb-3.5">
                <div class="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-900 flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <h4 class="text-sm sm:text-base font-headline font-semibold tracking-tight text-[#0a0a0a] m-0" style="color: #0a0a0a !important;">Hosting Veloz & SSL</h4>
              </div>
              <p class="text-xs sm:text-sm text-neutral-600 leading-relaxed m-0">
                Tu sitio alojado en servidores cloud de alta velocidad con certificado SSL HTTPS incluido de forma permanente.
              </p>
            </div>

            <!-- Servicio 2: SEO & Google -->
            <div class="service-card p-6 rounded-[22px] border border-neutral-200/80 bg-white shadow-sm hover:shadow-md hover:border-neutral-300 hover:-translate-y-1 transition-all duration-300">
              <div class="flex items-center gap-3.5 mb-3.5">
                <div class="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-900 flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <h4 class="text-sm sm:text-base font-headline font-semibold tracking-tight text-[#0a0a0a] m-0" style="color: #0a0a0a !important;">SEO & Google Ready</h4>
              </div>
              <p class="text-xs sm:text-sm text-neutral-600 leading-relaxed m-0">
                Estructura y metadatos optimizados para motores de búsqueda para posicionar tu negocio de manera orgánica.
              </p>
            </div>

            <!-- Servicio 3: Autogestionable -->
            <div class="service-card p-6 rounded-[22px] border border-neutral-200/80 bg-white shadow-sm hover:shadow-md hover:border-neutral-300 hover:-translate-y-1 transition-all duration-300">
              <div class="flex items-center gap-3.5 mb-3.5">
                <div class="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-900 flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <line x1="4" y1="21" x2="4" y2="14"></line>
                    <line x1="4" y1="10" x2="4" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12" y2="3"></line>
                    <line x1="20" y1="21" x2="20" y2="16"></line>
                    <line x1="20" y1="12" x2="20" y2="3"></line>
                    <line x1="1" y1="14" x2="7" y2="14"></line>
                    <line x1="9" y1="8" x2="15" y2="8"></line>
                    <line x1="17" y1="16" x2="23" y2="16"></line>
                  </svg>
                </div>
                <h4 class="text-sm sm:text-base font-headline font-semibold tracking-tight text-[#0a0a0a] m-0" style="color: #0a0a0a !important;">Autogestión Total</h4>
              </div>
              <p class="text-xs sm:text-sm text-neutral-600 leading-relaxed m-0">
                Modifica y actualiza imágenes, productos, descripciones y secciones fácilmente sin depender de programadores.
              </p>
            </div>

            <!-- Servicio 4: Monitoreo Constante -->
            <div class="service-card p-6 rounded-[22px] border border-neutral-200/80 bg-white shadow-sm hover:shadow-md hover:border-neutral-300 hover:-translate-y-1 transition-all duration-300">
              <div class="flex items-center gap-3.5 mb-3.5">
                <div class="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-900 flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </div>
                <h4 class="text-sm sm:text-base font-headline font-semibold tracking-tight text-[#0a0a0a] m-0" style="color: #0a0a0a !important;">Monitoreo 24/7</h4>
              </div>
              <p class="text-xs sm:text-sm text-neutral-600 leading-relaxed m-0">
                Supervisamos constantemente la disponibilidad y rendimiento del sistema para garantizar estabilidad total.
              </p>
            </div>

            <!-- Servicio 5: Estadísticas de Ventas -->
            <div class="service-card p-6 rounded-[22px] border border-neutral-200/80 bg-white shadow-sm hover:shadow-md hover:border-neutral-300 hover:-translate-y-1 transition-all duration-300">
              <div class="flex items-center gap-3.5 mb-3.5">
                <div class="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-900 flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <h4 class="text-sm sm:text-base font-headline font-semibold tracking-tight text-[#0a0a0a] m-0" style="color: #0a0a0a !important;">Reporte de Ventas</h4>
              </div>
              <p class="text-xs sm:text-sm text-neutral-600 leading-relaxed m-0">
                Visualiza estadísticas comerciales, pedidos e ingresos acumulados para medir el crecimiento de tu tienda.
              </p>
            </div>

            <!-- Servicio 6: Análisis de vistas -->
            <div class="service-card p-6 rounded-[22px] border border-neutral-200/80 bg-white shadow-sm hover:shadow-md hover:border-neutral-300 hover:-translate-y-1 transition-all duration-300">
              <div class="flex items-center gap-3.5 mb-3.5">
                <div class="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-900 flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </div>
                <h4 class="text-sm sm:text-base font-headline font-semibold tracking-tight text-[#0a0a0a] m-0" style="color: #0a0a0a !important;">Análisis de Vistas</h4>
              </div>
              <p class="text-xs sm:text-sm text-neutral-600 leading-relaxed m-0">
                Conoce las visitas recibidas, el origen geográfico de tus clientes y cuáles páginas despiertan mayor interés.
              </p>
            </div>

            <!-- Servicio 7: WhatsApp -->
            <div class="service-card p-6 rounded-[22px] border border-neutral-200/80 bg-white shadow-sm hover:shadow-md hover:border-neutral-300 hover:-translate-y-1 transition-all duration-300">
              <div class="flex items-center gap-3.5 mb-3.5">
                <div class="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-900 flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <h4 class="text-sm sm:text-base font-headline font-semibold tracking-tight text-[#0a0a0a] m-0" style="color: #0a0a0a !important;">Link a WhatsApp</h4>
              </div>
              <p class="text-xs sm:text-sm text-neutral-600 leading-relaxed m-0">
                Botones y llamados a la acción directos para canalizar el contacto directo y rápido de los clientes hacia tu chat.
              </p>
            </div>

            <!-- Servicio 8: Soporte Premium -->
            <div class="service-card p-6 rounded-[22px] border border-neutral-200/80 bg-white shadow-sm hover:shadow-md hover:border-neutral-300 hover:-translate-y-1 transition-all duration-300">
              <div class="flex items-center gap-3.5 mb-3.5">
                <div class="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-900 flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <h4 class="text-sm sm:text-base font-headline font-semibold tracking-tight text-[#0a0a0a] m-0" style="color: #0a0a0a !important;">Soporte Continuo</h4>
              </div>
              <p class="text-xs sm:text-sm text-neutral-600 leading-relaxed m-0">
                Soporte técnico preferente y actualizaciones periódicas para asegurar el funcionamiento óptimo de tu plataforma.
              </p>
            </div>

            <!-- Servicio 9: Código QR Dinámico -->
            <div class="service-card p-6 rounded-[22px] border border-neutral-200/80 bg-white shadow-sm hover:shadow-md hover:border-neutral-300 hover:-translate-y-1 transition-all duration-300">
              <div class="flex items-center gap-3.5 mb-3.5">
                <div class="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-900 flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM10 10h4v4h-4zM14 17h2v2h-2zM17 14h4v2h-4zM20 20h1v1h-1zM17 17h1v1h-1zM14 20h2v1h-2zM10 17h2v4h-2z" />
                  </svg>
                </div>
                <h4 class="text-sm sm:text-base font-headline font-semibold tracking-tight text-[#0a0a0a] m-0" style="color: #0a0a0a !important;">Código QR Dinámico</h4>
              </div>
              <p class="text-xs sm:text-sm text-neutral-600 leading-relaxed m-0">
                Código QR único vinculado a tu negocio para compartir de forma física, digital y en tus tarjetas de presentación.
              </p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <app-footer></app-footer>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class PlanesComponent implements OnInit {
  isLoading = true;
  activeFilter = 'Todos';

  constructor(private router: Router) {}

  ngOnInit() {
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  exploreProjects(category: string, event: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/planes-galeria'], { queryParams: { categoria: category } });
  }

  routerToRotbot(message: string) {
    this.router.navigate(['/rotbot']).then(() => {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('open-ai-chat', { detail: { message } }));
      }, 500);
    });
  }
}
