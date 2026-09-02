import { Injectable } from '@angular/core';

export interface VoiceIntent {
  type: 'navigate' | 'query';
  tab?: string;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class VoiceIntentService {

  /**
   * Navigation keywords map — if any keyword is found
   * in the transcript, navigate directly without calling Gemini.
   */
  private readonly navigationMap: { keywords: string[]; tab: string }[] = [
    { keywords: ['biblioteca', 'apuntes', 'cuadernos', 'cuaderno', 'notas', 'libros'], tab: 'library' },
    { keywords: ['finanzas', 'factura', 'facturas', 'pagos', 'cobros', 'cartera', 'facturación'], tab: 'finances' },
    { keywords: ['control financiero'], tab: 'finances' },
    { keywords: ['agenda', 'calendario', 'tareas', 'itinerario', 'tarea'], tab: 'itinerary' },
    { keywords: ['analíticas', 'analítica', 'tráfico', 'métricas', 'visitas', 'estadísticas'], tab: 'analytics' },
    { keywords: ['mensajes', 'correos', 'contactos', 'bandeja'], tab: 'messages' },
    { keywords: ['inicio', 'dashboard', 'home', 'principal'], tab: 'dashboard' },
  ];

  /**
   * Analyzes the final voice transcript and determines intent.
   *
   * Short, single-concept phrases → direct navigation
   * Longer or complex phrases → send to Gemini for analysis
   */
  resolveIntent(transcript: string): VoiceIntent {
    const normalized = transcript.toLowerCase().trim();
    const wordCount = normalized.split(/\s+/).length;

    // 1. Check for direct navigation — works best with short phrases (1–4 words)
    if (wordCount <= 5) {
      // Check multi-word keywords first (e.g., "control financiero")
      for (const entry of this.navigationMap) {
        for (const keyword of entry.keywords) {
          if (keyword.includes(' ')) {
            // Multi-word keyword — check if contained
            if (normalized.includes(keyword)) {
              return { type: 'navigate', tab: entry.tab, text: transcript };
            }
          }
        }
      }

      // Then check single-word keywords
      for (const entry of this.navigationMap) {
        for (const keyword of entry.keywords) {
          if (!keyword.includes(' ') && normalized.includes(keyword)) {
            return { type: 'navigate', tab: entry.tab, text: transcript };
          }
        }
      }
    }

    // 2. Longer phrases with navigation keywords + action verbs → still try navigation
    const actionVerbs = ['ir a', 'abrir', 'abre', 'llévame a', 'navegar a', 've a', 'muéstrame', 'mostrar', 'ver'];
    for (const verb of actionVerbs) {
      if (normalized.startsWith(verb) || normalized.includes(verb)) {
        const afterVerb = normalized.split(verb).pop()?.trim() || '';
        for (const entry of this.navigationMap) {
          for (const keyword of entry.keywords) {
            if (afterVerb.includes(keyword)) {
              return { type: 'navigate', tab: entry.tab, text: transcript };
            }
          }
        }
      }
    }

    // 3. Everything else → send to Gemini as a complex query
    return { type: 'query', text: transcript };
  }
}
