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
        class="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        (click)="close()"
      ></div>

      <!-- Modal Content -->
      <div class="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
        
        <!-- Header -->
        <div class="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
          <div class="flex items-center gap-4">
            <div class="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center p-2 border border-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]">
              <img src="assets/icons/logo-link-light.png" class="w-full h-full object-contain filter drop-shadow-[0_0_5px_rgba(0,245,255,0.3)]" alt="Rotbot">
            </div>
            <div>
              <h3 class="text-lg font-bold text-white tracking-wide">Acerca de Rotbot IA</h3>
              <p class="text-[10px] text-cyan-400/80 uppercase tracking-widest font-bold mt-1">Especificaciones Técnicas y Legales</p>
            </div>
          </div>
          <button (click)="close()" class="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all border border-transparent hover:border-white/10">
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
            <h4 class="text-[10.5px] uppercase tracking-widest text-white/50 font-bold flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-cyan-400"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Motor de Inteligencia Artificial
            </h4>
            <div class="p-4 rounded-xl border border-white/5 bg-white/[0.03]">
              <p class="text-[13.5px] text-white/80 leading-relaxed font-light">
                Rotbot es impulsado por <strong class="text-white font-medium">Llama 3.3 70B Versatile</strong>, uno de los modelos de lenguaje de código abierto más avanzados del mundo desarrollados por Meta. Este modelo está altamente optimizado para razonamiento lógico complejo, generación de código estructurado y asesoramiento técnico profesional en diversas áreas del desarrollo de software.
              </p>
            </div>
          </div>

          <!-- Seccion Infraestructura -->
          <div class="space-y-3">
            <h4 class="text-[10.5px] uppercase tracking-widest text-white/50 font-bold flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-cyan-400"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Infraestructura de Inferencia
            </h4>
            <div class="p-4 rounded-xl border border-white/5 bg-white/[0.03] flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div class="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl flex items-center justify-center shadow-lg">
                 <span class="text-white font-black text-[17px] tracking-tighter">GROQ</span>
              </div>
              <div>
                <p class="text-[13px] text-white/70 leading-relaxed font-light mt-1">
                  Para garantizar tiempos de respuesta en tiempo real y una latencia ultra baja, utilizamos la revolucionaria infraestructura LPU (Language Processing Unit) proporcionada por <strong class="text-white">Groq</strong>. Esta tecnología de hardware especializada permite que Rotbot infiera y genere respuestas complejas a velocidades sin precedentes en la industria.
                </p>
              </div>
            </div>
          </div>

          <!-- Seccion Legal y Privacidad -->
          <div class="space-y-3">
            <h4 class="text-[10.5px] uppercase tracking-widest text-white/50 font-bold flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-cyan-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Aviso Legal y Privacidad
            </h4>
            <div class="text-[12.5px] text-white/60 leading-relaxed space-y-4 font-light p-4 rounded-xl border border-white/5 bg-white/[0.02]">
              <p>
                <strong class="text-white/90">1. Naturaleza de la Asesoría:</strong> Rotbot es un asistente de IA conversacional diseñado para proporcionar orientación general sobre desarrollo web, e-commerce, integración de sistemas y diseño UI/UX. Las respuestas generadas son sugerencias algorítmicas y no constituyen consultoría técnica definitiva. Siempre valida las decisiones críticas de arquitectura con un ingeniero humano.
              </p>
              <p>
                <strong class="text-white/90">2. Manejo de Datos y Privacidad:</strong> Las interacciones con Rotbot son procesadas a través de APIs externas para generar respuestas en tiempo real. Aunque se guarda un registro de contexto en nuestra base de datos para mantener la coherencia de la conversación (solo si estás logueado), no compartas contraseñas, tokens JWT, claves API de producción, ni información confidencial personal o empresarial en este chat.
              </p>
              <p>
                <strong class="text-white/90">3. Limitación de Responsabilidad y Alucinaciones:</strong> Como cualquier modelo de lenguaje grande (LLM), la IA puede experimentar "alucinaciones" y generar información inexacta o falsa con tono de seguridad. PortaLink no se hace responsable de posibles imprecisiones, errores de código, vulnerabilidades o pérdidas financieras derivadas de decisiones tomadas basadas exclusivamente en la información proporcionada por Rotbot.
              </p>
            </div>
          </div>

        </div>
        
        <!-- Footer -->
        <div class="px-6 py-4 border-t border-white/10 bg-[#050505] flex justify-end">
          <button (click)="close()" class="px-8 py-2.5 rounded-xl text-[13px] font-bold tracking-wide text-black bg-cyan-400 hover:bg-cyan-300 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(0,245,255,0.3)]">
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
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background-color: rgba(255, 255, 255, 0.25);
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
