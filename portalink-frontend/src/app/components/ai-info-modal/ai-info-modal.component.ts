import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ai-info-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 flex items-center justify-center p-4 sm:p-6" style="z-index: 10000; font-family: 'Inter', sans-serif;">
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 backdrop-blur-sm transition-opacity"
        style="background-color: rgba(0, 0, 0, 0.7);"
        (click)="close()"
      ></div>

      <!-- Modal Content -->
      <div class="relative w-full max-w-2xl border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up"
           style="background-color: var(--bg-primary); border-color: var(--card-border);">
        
        <!-- Header -->
        <div class="px-6 py-5 border-b flex justify-between items-center" style="border-color: var(--card-border); background-color: var(--card-bg);">
          <div class="flex items-center gap-4">
            <div class="w-11 h-11 rounded-xl flex items-center justify-center p-2 border shadow-sm"
                 style="background-color: var(--card-bg); border-color: var(--card-border);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-color);"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <div>
              <h3 class="text-lg font-bold tracking-wide" style="color: var(--text-primary);">Acerca de Rotbot IA</h3>
              <p class="text-[10px] uppercase tracking-widest font-bold mt-1" style="color: var(--accent-color); opacity: 0.8;">Especificaciones Técnicas y Legales</p>
            </div>
          </div>
          <button (click)="close()" class="p-2 rounded-lg transition-all border border-transparent hover:opacity-100 opacity-60"
                  style="color: var(--text-primary); border-color: transparent;"
                  onmouseover="this.style.backgroundColor='var(--card-bg)'; this.style.borderColor='var(--card-border)';"
                  onmouseout="this.style.backgroundColor='transparent'; this.style.borderColor='transparent';">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-grow space-y-8">
          
          <!-- Seccion Modelo -->
          <div class="space-y-3">
            <h4 class="text-[10.5px] uppercase tracking-widest font-bold flex items-center gap-2" style="color: var(--text-secondary);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-color);"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Motor de Inteligencia Artificial
            </h4>
            <div class="p-4 rounded-xl border" style="background-color: var(--card-bg); border-color: var(--card-border);">
              <p class="text-[13.5px] leading-relaxed font-light" style="color: var(--text-primary); opacity: 0.85;">
                Rotbot es impulsado por <strong class="font-semibold" style="color: var(--text-primary);">Llama 3.3 70B Versatile</strong>, uno de los modelos de lenguaje de código abierto más avanzados del mundo desarrollados por Meta. Este modelo está altamente optimizado para razonamiento lógico complejo, generación de código estructurado y asesoramiento técnico profesional en diversas áreas del desarrollo de software.
              </p>
            </div>
          </div>

          <!-- Seccion Infraestructura -->
          <div class="space-y-3">
            <h4 class="text-[10.5px] uppercase tracking-widest font-bold flex items-center gap-2" style="color: var(--text-secondary);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-color);"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Infraestructura de Inferencia
            </h4>
            <div class="p-4 rounded-xl border flex flex-col sm:flex-row items-center sm:items-start gap-5" style="background-color: var(--card-bg); border-color: var(--card-border);">
              <div class="w-16 h-16 flex-shrink-0 border rounded-xl flex items-center justify-center shadow-sm"
                   style="background-color: var(--bg-secondary); border-color: var(--card-border);">
                 <span class="font-black text-[17px] tracking-tighter" style="color: var(--text-primary);">GROQ</span>
              </div>
              <div>
                <p class="text-[13px] leading-relaxed font-light mt-1" style="color: var(--text-primary); opacity: 0.85;">
                  Para garantizar tiempos de respuesta en tiempo real y una latencia ultra baja, utilizamos la revolucionaria infraestructura LPU (Language Processing Unit) proporcionada por <strong class="font-semibold" style="color: var(--text-primary);">Groq</strong>. Esta tecnología de hardware especializada permite que Rotbot infiera y genere respuestas complejas a velocidades sin precedentes en la industria.
                </p>
              </div>
            </div>
          </div>

          <!-- Seccion Legal y Privacidad -->
          <div class="space-y-3">
            <h4 class="text-[10.5px] uppercase tracking-widest font-bold flex items-center gap-2" style="color: var(--text-secondary);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-color);"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Aviso Legal y Privacidad
            </h4>
            <div class="text-[12.5px] leading-relaxed space-y-4 font-light p-4 rounded-xl border" style="background-color: var(--card-bg); border-color: var(--card-border); color: var(--text-primary); opacity: 0.85;">
              <p>
                <strong class="font-semibold" style="color: var(--text-primary);">1. Naturaleza de la Asesoría:</strong> Rotbot es un asistente de IA conversacional diseñado para proporcionar orientación general sobre desarrollo web, e-commerce, integración de sistemas y diseño UI/UX. Las respuestas generadas son sugerencias algorítmicas y no constituyen consultoría técnica definitiva. Siempre valida las decisiones críticas de arquitectura con un ingeniero humano.
              </p>
              <p>
                <strong class="font-semibold" style="color: var(--text-primary);">2. Manejo de Datos y Privacidad:</strong> Las interacciones con Rotbot son procesadas a través de APIs externas para generar respuestas en tiempo real. Aunque se guarda un registro de contexto en nuestra base de datos para mantener la coherencia de la conversación (solo si estás logueado), no compartas contraseñas, tokens JWT, claves API de producción, ni información confidencial personal o empresarial en este chat.
              </p>
              <p>
                <strong class="font-semibold" style="color: var(--text-primary);">3. Limitación de Responsabilidad y Alucinaciones:</strong> Como cualquier modelo de lenguaje grande (LLM), la IA puede experimentar "alucinaciones" y generar información inexacta o falsa con tono de seguridad. PortaLink no se hace responsable de posibles imprecisiones, errores de código, vulnerabilidades o pérdidas financieras derivadas de decisiones tomadas basadas exclusivamente en la información proporcionada por Rotbot.
              </p>
            </div>
          </div>

        </div>
        
        <!-- Footer -->
        <div class="px-6 py-4 border-t flex justify-end" style="background-color: var(--bg-secondary); border-color: var(--card-border);">
          <button (click)="close()" class="px-8 py-2.5 rounded-xl text-[13px] font-bold tracking-wide transition-all shadow-md hover:opacity-90"
                  style="background-color: var(--accent-color); color: #fff;">
            Entendido
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in-up {
      animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.97);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: rgba(150, 150, 150, 0.3);
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background-color: rgba(150, 150, 150, 0.5);
    }
  `]
})
export class AiInfoModalComponent {
  @Input() isOpen: boolean = false;
  @Output() closeEvent = new EventEmitter<void>();

  close() {
    this.closeEvent.emit();
  }
}
