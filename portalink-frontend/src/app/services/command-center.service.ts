import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CommandCenterItem {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'emerald' | 'blue' | 'amber' | 'purple' | 'red' | string;
  data?: any;
}

export interface CommandCenterResponse {
  ok: boolean;
  query: string;
  data: {
    reply: string;
    targetTab: string;
    actionText: string;
    items?: CommandCenterItem[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class CommandCenterService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/command-center`;
  private geminiKey = 'AQ.Ab8RN6K8IgT3jGjqZkIj5AOvS9jjVM5WCK-3sis_N5ynsM_yaw';

  /**
   * Envía la consulta en lenguaje natural al backend para ser procesada con Gemini y datos del sistema.
   */
  query(userPrompt: string): Observable<CommandCenterResponse> {
    const payload = { query: userPrompt };

    return this.http.post<CommandCenterResponse>(`${this.apiUrl}/query`, payload).pipe(
      catchError(err => {
        console.warn('[CommandCenter] Backend error, falling back to direct Gemini bridge:', err);
        return this.fallbackDirectGemini(userPrompt);
      })
    );
  }

  /**
   * Respaldo directo con Google Gemini si el backend está en desarrollo o desconectado
   */
  private fallbackDirectGemini(userPrompt: string): Observable<CommandCenterResponse> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${encodeURIComponent(this.geminiKey)}`;

    const systemPrompt = `
Eres el motor de inteligencia central del Centro de Comando de PortaLink.
Responde SIEMPRE en formato JSON estricto con:
{
  "reply": "string en markdown con respuesta ejecutiva y limpia",
  "targetTab": "finances" | "library" | "itinerary" | "messages" | "users" | "analytics" | "stats" | "dashboard",
  "actionText": "string para botón de redirección (ej: Ver Clientes en Finanzas, Abrir Cuaderno SQL, Ver Pagos Pendientes)",
  "items": [
    { "title": "Nombre", "subtitle": "Detalle", "badge": "$ Monto / Estado", "badgeColor": "emerald"|"blue"|"amber"|"purple" }
  ]
}

- Si preguntan por clientes: targetTab = 'finances', actionText = 'Ver Clientes en Finanzas'
- Si preguntan por pagos/facturas/deudas/ingresos: targetTab = 'finances', actionText = 'Gestionar Finanzas'
- Si preguntan por cuadernos/apuntes/sql/python/notas: targetTab = 'library', actionText = 'Abrir Biblioteca de Apuntes'
- Si preguntan por tareas/agenda/itinerario: targetTab = 'itinerary', actionText = 'Ver Calendario'
- Si preguntan por mensajes/contacto: targetTab = 'messages', actionText = 'Ver Mensajes'
- Si preguntan por métricas/tráfico/visitas: targetTab = 'analytics', actionText = 'Ver Analíticas'
`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\n[CONSULTA DEL USUARIO]:\n${userPrompt}\n\nResponde ÚNICAMENTE con el objeto JSON.` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1200,
        responseMimeType: 'application/json'
      }
    };

    return this.http.post<any>(endpoint, body).pipe(
      map(res => {
        const text = res?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        let cleaned = text.trim();
        if (cleaned.startsWith('```json')) cleaned = cleaned.substring(7);
        if (cleaned.startsWith('```')) cleaned = cleaned.substring(3);
        if (cleaned.endsWith('```')) cleaned = cleaned.substring(0, cleaned.length - 3);
        cleaned = cleaned.trim();

        const parsed = JSON.parse(cleaned);
        return {
          ok: true,
          query: userPrompt,
          data: {
            reply: parsed.reply || 'Consulta procesada.',
            targetTab: parsed.targetTab || 'dashboard',
            actionText: parsed.actionText || 'Ver en Dashboard',
            items: parsed.items || []
          }
        };
      }),
      catchError(() => of(this.localRegexFallback(userPrompt)))
    );
  }

  private localRegexFallback(q: string): CommandCenterResponse {
    const lower = q.toLowerCase();

    if (/cliente|contacto|empresa/.test(lower)) {
      return {
        ok: true,
        query: q,
        data: {
          reply: 'Accede a la cartera de clientes y empresas registradas en tu módulo de Finanzas.',
          targetTab: 'finances',
          actionText: 'Ver Cartera de Clientes',
          items: [
            { title: 'Clientes Activos', subtitle: 'Gestiona datos de contacto y facturación', badge: 'Finanzas', badgeColor: 'purple' }
          ]
        }
      };
    }

    if (/pago|factura|cobro|finanza|deuda|ingreso/.test(lower)) {
      return {
        ok: true,
        query: q,
        data: {
          reply: 'Aquí puedes consultar el estado de facturas, cuentas de cobro y pagos pendientes en tiempo real.',
          targetTab: 'finances',
          actionText: 'Gestionar Finanzas & Pagos',
          items: [
            { title: 'Pagos Pendientes', subtitle: 'Revisión de cuentas de cobro', badge: 'Pendiente', badgeColor: 'amber' }
          ]
        }
      };
    }

    if (/biblioteca|cuaderno|apunte|sql|python|nota/.test(lower)) {
      return {
        ok: true,
        query: q,
        data: {
          reply: 'Accede a tus cuadernos de estudio, notas de código y apuntes organizados en tu Biblioteca.',
          targetTab: 'library',
          actionText: 'Abrir Biblioteca de Apuntes',
          items: [
            { title: 'Cuadernos de Estudio', subtitle: 'Apuntes de SQL, desarrollo y más', badge: 'Biblioteca', badgeColor: 'blue' }
          ]
        }
      };
    }

    if (/agenda|tarea|calendario|itinerario/.test(lower)) {
      return {
        ok: true,
        query: q,
        data: {
          reply: 'Revisa las tareas programadas, citas y actividades prioritarias para el día de hoy.',
          targetTab: 'itinerary',
          actionText: 'Abrir Calendario & Agenda',
          items: []
        }
      };
    }

    return {
      ok: true,
      query: q,
      data: {
        reply: 'Consulta procesada. Puedes navegar a la sección correspondiente del sistema.',
        targetTab: 'dashboard',
        actionText: 'Ver Dashboard',
        items: []
      }
    };
  }
}
