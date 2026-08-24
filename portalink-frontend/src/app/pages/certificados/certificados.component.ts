import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import * as AOS from 'aos';

export interface CertificateItem {
  id: string;
  name: string;
  shortTitle: string;
  issuer: string;
  verificationUrl: string;
  description: string;
  tags: string[];
  skills: string[];
  image: string;
}

@Component({
  selector: 'app-certificados',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-white text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">

      <!-- STICKY HEADER COMPACTO ULTRALIMPIO -->
      <div class="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-neutral-100/90 shadow-2xs transition-all duration-300">
        <div class="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-10 py-4 flex items-center justify-between gap-4">
          
          <!-- Botón Volver -->
          <button (click)="goBack()" 
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-headline font-medium text-xs tracking-wide transition-all shadow-2xs cursor-pointer border-none">
            <svg class="w-4 h-4 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
            </svg>
            <span>Volver</span>
          </button>

          <!-- Título Central de Cabecera -->
          <div class="text-center">
            <h1 class="text-xl sm:text-2xl font-headline font-semibold tracking-tight leading-snug" style="color: #0a0a0a !important;">
              Certificaciones Acreditadas
            </h1>
            <p class="text-xs font-sans text-neutral-500 hidden sm:block">
              {{ certificates.length }} titulaciones oficiales en Ingeniería de Software · freeCodeCamp.org
            </p>
          </div>

          <div class="w-16"></div>
        </div>
      </div>

      <!-- MAIN CONTENT: LOS 3 CERTIFICADOS AL MISMO NIVEL EN UNA SOLA FILA -->
      <main class="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-10 py-8 md:py-12">
        
        <!-- GRID DE 3 COLUMNAS EN EL MISMO NIVEL -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          
          <div *ngFor="let cert of certificates; let i = index" class="flex flex-col h-full">
            
            <div class="group relative rounded-[24px] sm:rounded-[32px] overflow-hidden border border-neutral-200/80 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.04)] transition-all duration-500 hover:scale-[1.01] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-col justify-between cursor-pointer h-full"
                 (click)="openModal(cert)"
                 data-aos="fade-up"
                 [attr.data-aos-delay]="i * 120"
                 data-aos-duration="900">

              <!-- Contenedor de Imagen de Certificado -->
              <div class="relative w-full aspect-[16/10] overflow-hidden bg-neutral-50 flex-1 min-h-[200px] sm:min-h-[220px]">
                <img [src]="cert.image" 
                     [alt]="cert.name" 
                     (error)="onImageError($event)"
                     class="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105" 
                     loading="lazy" />
                
                <!-- Insignia Flotante Izquierda: freeCodeCamp -->
                <div class="absolute top-3.5 left-3.5 z-10">
                  <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900/85 backdrop-blur-md text-white text-[10.5px] sm:text-[11px] font-headline font-semibold shadow-xs">
                    <span>freeCodeCamp</span>
                  </div>
                </div>

                <!-- Insignia Flotante Derecha: Verificado -->
                <div class="absolute top-3.5 right-3.5 z-10">
                  <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-[10.5px] sm:text-[11px] font-headline font-semibold tracking-wider shadow-xs">
                    <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    <span>Verificado</span>
                  </div>
                </div>
              </div>

              <!-- Barra Inferior de Detalles (Solo Título y Botón Ver Certificado) -->
              <div class="p-4 sm:p-5 flex items-center justify-between gap-3 bg-white border-t border-neutral-100/80">
                
                <h3 class="text-sm sm:text-base font-headline font-semibold tracking-tight leading-snug truncate" style="color: #0a0a0a !important;">
                  {{ cert.shortTitle }}
                </h3>

                <!-- Botón: Ver Certificado -->
                <button (click)="openModal(cert); $event.stopPropagation()"
                        class="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl font-headline font-medium text-xs shadow-2xs hover:scale-[1.02] active:scale-[0.98] transition-all border-none flex-shrink-0 cursor-pointer"
                        style="background-color: #09090b !important; color: #ffffff !important;">
                  <span style="color: #ffffff !important; font-weight: 500;">Ver Certificado</span>
                  <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="color: #ffffff !important;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                  </svg>
                </button>

              </div>

            </div>

          </div>

        </div>

      </main>

      <!-- MODAL APPLE-STYLE DE ALTA RESOLUCIÓN -->
      <div class="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/75 backdrop-blur-2xl transition-all duration-300 animate-fadeIn"
           *ngIf="selectedCert()" (click)="closeModal()">
        
        <div class="relative w-full max-w-[1040px] bg-white rounded-t-[28px] sm:rounded-[32px] overflow-hidden border border-neutral-200/80 shadow-[0_25px_70px_rgba(0,0,0,0.25)] flex flex-col max-h-[92vh] sm:max-h-[95vh] animate-scaleUp"
             (click)="$event.stopPropagation()">
          
          <!-- Modal Header -->
          <div class="px-4 sm:px-7 py-3.5 border-b border-neutral-100 flex items-center justify-between bg-white/95 backdrop-blur-md sticky top-0 z-20">
            
            <div class="flex items-center gap-3">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <div>
                <h2 class="text-base sm:text-xl font-headline font-bold text-neutral-900 tracking-tight leading-tight">
                  {{ selectedCert()?.name }}
                </h2>
                <p class="text-xs text-neutral-500 font-sans mt-0.5">
                  Certificado Oficial Acreditado por freeCodeCamp.org
                </p>
              </div>
            </div>

            <!-- Botón Cerrar -->
            <button (click)="closeModal()" 
                    class="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center border-none cursor-pointer transition-colors">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>

          </div>

          <!-- Modal Body -->
          <div class="p-5 sm:p-8 overflow-y-auto space-y-6">
            
            <!-- Imagen Completa del Certificado -->
            <div class="w-full rounded-2xl overflow-hidden border border-neutral-200/90 bg-neutral-50 p-2 sm:p-4 shadow-2xs flex items-center justify-center">
              <img [src]="selectedCert()?.image" 
                   [alt]="selectedCert()?.name" 
                   class="w-full h-auto max-h-[520px] object-contain rounded-xl" />
            </div>

            <!-- Ficha de Verificación Oficial -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-50 border border-neutral-200/80">
              <div>
                <span class="text-xs font-mono font-bold uppercase text-neutral-400 tracking-wider">Titular de la Credencial</span>
                <h3 class="text-lg font-headline font-bold text-neutral-900">Santiago Arbeláez Contreras</h3>
                <p class="text-xs text-neutral-500 mt-0.5">Acreditación verificable en tiempo real en la plataforma freeCodeCamp</p>
              </div>

              <a [href]="selectedCert()?.verificationUrl" target="_blank" rel="noopener noreferrer"
                 class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-headline font-semibold text-xs shadow-md transition-all no-underline shrink-0">
                <span>Verificar en freeCodeCamp</span>
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/>
                </svg>
              </a>
            </div>

            <!-- Competencias Acreditadas -->
            <div class="space-y-3">
              <h4 class="text-xs font-headline font-bold text-neutral-900 uppercase tracking-wider">
                Competencias Validadas
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div *ngFor="let skill of selectedCert()?.skills" 
                     class="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-50 border border-neutral-200/60 text-xs font-sans font-semibold text-neutral-800">
                  <svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                  </svg>
                  <span>{{ skill }}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  `
})
export class CertificadosComponent implements OnInit {
  private router = inject(Router);

  selectedCert = signal<CertificateItem | null>(null);

  certificates: CertificateItem[] = [
    {
      id: 'js-algorithms-v8',
      name: 'JavaScript Algorithms and Data Structures (v8)',
      shortTitle: 'JavaScript Algorithms (v8)',
      issuer: 'freeCodeCamp',
      verificationUrl: 'https://www.freecodecamp.org/certification/santiagoarbelaezc/javascript-algorithms-and-data-structures-v8',
      description: 'Certificación oficial que acredita dominio en lenguaje JavaScript (ES6+), diseño de algoritmos de alta eficiencia, estructuras de datos fundamentales, Programación Orientada a Objetos (OOP), Programación Funcional pura y Expresiones Regulares avanzadas.',
      tags: ['JavaScript ES6+', 'Algoritmos', 'Estructuras de Datos', 'OOP', 'Funcional'],
      skills: [
        'Algoritmos de Búsqueda y Ordenamiento Complejos',
        'Recursión y Análisis de Complejidad O(n)',
        'Manipulación de Estructuras ES6+ (Map, Set, Destructuring)',
        'Programación Funcional Pura (map, filter, reduce, currying)',
        'Validación y Extracción con Expresiones Regulares (RegEx)'
      ],
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/v1787530609/javascript_semsts.png'
    },
    {
      id: 'python-scientific-v7',
      name: 'Scientific Computing with Python (v7)',
      shortTitle: 'Scientific Computing Python (v7)',
      issuer: 'freeCodeCamp',
      verificationUrl: 'https://www.freecodecamp.org/certification/santiagoarbelaezc/scientific-computing-with-python-v7',
      description: 'Demuestra competencia en Python 3 para computación científica, procesamiento numérico y resolución algorítmica de problemas matemáticos. Incluye el desarrollo de estructuras de datos optimizadas, automatización y patrones orientados a objetos.',
      tags: ['Python 3', 'Computación Científica', 'Estructuras de Datos', 'Automatización', 'POO'],
      skills: [
        'Sintaxis Avanzada y Estructuras en Python 3',
        'Algoritmos de Optimización Matemática y Grafos',
        'Manipulación de Colecciones, Matrimonios y Matrices',
        'Programación Orientada a Objetos en Python',
        'Desarrollo de Scripts Automáticos y Herramientas CLI'
      ],
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/v1787530609/python_qvlktw.png'
    },
    {
      id: 'backend-apis',
      name: 'Back End Development and APIs',
      shortTitle: 'Back End Development & APIs',
      issuer: 'freeCodeCamp',
      verificationUrl: 'https://www.freecodecamp.org/certification/santiagoarbelaezc/back-end-development-and-apis',
      description: 'Certificación profesional en desarrollo Backend y APIs RESTful. Cubre la creación de microservicios robustos con Node.js y Express.js, modelado de bases de datos NoSQL con MongoDB y Mongoose, autenticación y servidores de alta concurrencia.',
      tags: ['Node.js', 'Express.js', 'MongoDB', 'Mongoose', 'REST APIs'],
      skills: [
        'Arquitectura de Servidores Web con Node.js & Express.js',
        'Modelado de Datos NoSQL con MongoDB & Mongoose ORM',
        'Diseño de Endpoints y Microservicios RESTful',
        'Middlewares, Validaciones y Manejo Centralizado de Errores',
        'Operaciones CRUD Avanzadas y Gestión de Parámetros HTTP'
      ],
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/v1787530609/backend_z0lrlo.png'
    }
  ];

  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      setTimeout(() => {
        AOS.init({
          duration: 800,
          once: true,
          easing: 'ease-out-cubic'
        });
      }, 100);
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }

  openModal(cert: CertificateItem) {
    this.selectedCert.set(cert);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal() {
    this.selectedCert.set(null);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'auto';
    }
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/images/proyecto-0.png';
    }
  }
}
