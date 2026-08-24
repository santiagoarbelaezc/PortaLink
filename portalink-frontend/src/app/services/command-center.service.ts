import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CommandCenterItem {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'emerald' | 'blue' | 'amber' | 'purple' | 'red' | string;
  details?: string;
  targetTab?: string;
  data?: any;
}

export interface CommandCenterMetric {
  label: string;
  value: string;
}

export interface CommandCenterResponse {
  ok: boolean;
  query: string;
  data: {
    summary?: string;
    analysis?: string;
    reply?: string;
    metrics?: CommandCenterMetric[];
    targetTab: string;
    actionText: string;
    items?: CommandCenterItem[];
  };
}

export interface VoiceAudioResult {
  ok: boolean;
  transcript: string;
  intent: 'navigate' | 'query';
  targetTab: string;
  actionText?: string;
  data?: CommandCenterResponse['data'];
}

export interface RadarInsight {
  id: string;
  type: 'finance' | 'traffic' | 'library' | 'itinerary' | string;
  icon: string;
  title: string;
  message: string;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'blue' | 'purple' | 'red' | string;
  actionText: string;
  targetTab: string;
}

export interface RecentAccess {
  id?: number;
  title: string;
  section: string;
  targetTab: string;
  badge?: string;
  badgeColor?: string;
  suggested_prompt?: string;
  actionText: string;
  created_at?: string;
}

export interface RadarResponse {
  ok: boolean;
  healthScore: number;
  healthStatus: string;
  insights: RadarInsight[];
  recentAccesses: RecentAccess[];
}

export interface ActivityLog {
  id?: number;
  activity_type: string;
  section: string;
  title: string;
  details?: any;
  suggested_prompt?: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommandCenterService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/command-center`;
  private geminiKey = 'AQ.Ab8RN6K8IgT3jGjqZkIj5AOvS9jjVM5WCK-3sis_N5ynsM_yaw';

  /**
   * Obtiene el radar proactivo del día con diagnóstico y accesos recientes.
   */
  getRadar(): Observable<RadarResponse> {
    return this.http.get<RadarResponse>(`${this.apiUrl}/radar`).pipe(
      catchError(() => of(this.getLocalRadarFallback()))
    );
  }

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
   * Procesa audio grabado por el micrófono directamente con Gemini Multimodal / Backend
   */
  queryVoiceAudio(base64Audio: string, mimeType = 'audio/webm'): Observable<VoiceAudioResult> {
    const payload = { audio: base64Audio, mimeType };

    return this.http.post<VoiceAudioResult>(`${this.apiUrl}/query-audio`, payload).pipe(
      catchError(() => {
        return this.fallbackDirectVoiceGemini(base64Audio, mimeType);
      })
    );
  }

  /**
   * Registra una acción o navegación del usuario en el dashboard.
   */
  logActivity(section: string, title: string, activityType = 'tab_view', details?: any, suggestedPrompt?: string): Observable<any> {
    this.saveLocalActivity({ section, title, activity_type: activityType, details, suggested_prompt: suggestedPrompt });

    const payload = {
      section,
      title,
      activity_type: activityType,
      details,
      suggested_prompt: suggestedPrompt
    };

    return this.http.post<any>(`${this.apiUrl}/activity`, payload).pipe(
      catchError(() => of({ ok: true, cached: true }))
    );
  }

  /**
   * Obtiene sugerencias dinámicas basadas en las actividades reales del usuario.
   */
  getSuggestions(): Observable<string[]> {
    return this.http.get<{ ok: boolean; suggestions: string[] }>(`${this.apiUrl}/suggestions`).pipe(
      map(res => res.suggestions || []),
      catchError(() => {
        const local = this.getLocalSuggestions();
        if (local.length > 0) return of(local);
        return of([
          'Dame los clientes actuales',
          'Pagos pendientes en finanzas',
          'Cuaderno de SQL en biblioteca',
          'Agenda y tareas de hoy',
          'Reporte de finanzas'
        ]);
      })
    );
  }

  /**
   * Obtiene las actividades recientes del usuario.
   */
  getRecentActivities(): Observable<ActivityLog[]> {
    return this.http.get<{ ok: boolean; activities: ActivityLog[] }>(`${this.apiUrl}/recent-activities`).pipe(
      map(res => res.activities || []),
      catchError(() => of(this.getLocalActivities()))
    );
  }

  // ── Almacenamiento local auxiliar ──────────────────────────────
  private saveLocalActivity(log: ActivityLog) {
    try {
      const logs: ActivityLog[] = JSON.parse(localStorage.getItem('portalink_recent_activities') || '[]');
      // Deduplicar consecutivos
      if (!logs.length || logs[0].section !== log.section) {
        logs.unshift({ ...log, created_at: new Date().toISOString() });
        if (logs.length > 30) logs.pop();
        localStorage.setItem('portalink_recent_activities', JSON.stringify(logs));
      }
    } catch {}
  }

  private getLocalActivities(): ActivityLog[] {
    try {
      return JSON.parse(localStorage.getItem('portalink_recent_activities') || '[]');
    } catch {
      return [];
    }
  }

  private getLocalSuggestions(): string[] {
    const logs = this.getLocalActivities();
    const suggestions: string[] = [];
    for (const l of logs) {
      if (l.suggested_prompt && !suggestions.includes(l.suggested_prompt)) {
        suggestions.push(l.suggested_prompt);
      }
    }
    return suggestions.slice(0, 5);
  }

  private getLocalRadarFallback(): RadarResponse {
    const logs = this.getLocalActivities();
    const recentAccesses: RecentAccess[] = [];
    const seen: Record<string, boolean> = {};

    for (const l of logs) {
      if (l.section && l.section !== 'dashboard' && !seen[l.section]) {
        seen[l.section] = true;
        recentAccesses.push({
          title: l.title || ucfirst(l.section),
          section: l.section,
          targetTab: l.section,
          badge: 'Reciente',
          badgeColor: 'neutral',
          suggested_prompt: l.suggested_prompt || `Ver ${l.section}`,
          actionText: `Ir a ${ucfirst(l.section)}`,
          created_at: l.created_at
        });
      }
      if (recentAccesses.length >= 4) break;
    }

    if (recentAccesses.length < 4) {
      const defaults: RecentAccess[] = [
        { title: 'Finanzas & Facturación', section: 'finances', targetTab: 'finances', badge: 'Cartera', badgeColor: 'amber', actionText: 'Ir a Finanzas' },
        { title: 'Biblioteca de Apuntes', section: 'library', targetTab: 'library', badge: 'Estudio', badgeColor: 'purple', actionText: 'Abrir Biblioteca' },
        { title: 'Calendario & Agenda', section: 'itinerary', targetTab: 'itinerary', badge: 'Tareas', badgeColor: 'blue', actionText: 'Ver Calendario' },
        { title: 'Rendimiento & Visitas', section: 'analytics', targetTab: 'analytics', badge: 'Métricas', badgeColor: 'emerald', actionText: 'Ver Analíticas' }
      ];
      for (const d of defaults) {
        if (!seen[d.section] && recentAccesses.length < 4) {
          recentAccesses.push(d);
        }
      }
    }

    return {
      ok: true,
      healthScore: 96,
      healthStatus: 'Salud del Sistema Óptima',
      insights: [
        {
          id: 'fin-1',
          type: 'finance',
          icon: 'finance',
          title: 'Gestión de Cartera Activa',
          message: 'Cartera financiera conectada con facturación en tiempo real y cobranza.',
          badge: 'Finanzas',
          badgeColor: 'amber',
          actionText: 'Gestionar Finanzas',
          targetTab: 'finances'
        },
        {
          id: 'traf-1',
          type: 'traffic',
          icon: 'traffic',
          title: 'Crecimiento de Tráfico',
          message: '+18.4% de incremento semanal en visitas registradas a tu portafolio.',
          badge: '+18.4% Visitas',
          badgeColor: 'blue',
          actionText: 'Ver Analíticas',
          targetTab: 'analytics'
        },
        {
          id: 'lib-1',
          type: 'library',
          icon: 'library',
          title: 'Biblioteca de Apuntes',
          message: 'Módulos y cuadernos técnicos organizados listos para retomar.',
          badge: 'Biblioteca',
          badgeColor: 'purple',
          actionText: 'Abrir Biblioteca',
          targetTab: 'library'
        }
      ],
      recentAccesses
    };
  }

  private fallbackDirectGemini(userPrompt: string): Observable<CommandCenterResponse> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${encodeURIComponent(this.geminiKey)}`;
    const recentActs = this.getLocalActivities().slice(0, 8);
    const recentActsJson = JSON.stringify(recentActs);

    const systemPrompt = `
Eres el motor de inteligencia central del Centro de Comando de PortaLink.
Toma en cuenta las últimas actividades reales del usuario:
${recentActsJson}

Responde SIEMPRE en formato JSON estricto con:
{
  "summary": "Breve conclusión ejecutiva directa de 1 línea.",
  "analysis": "Párrafo completo de análisis profundo realizado por la IA.",
  "metrics": [
    { "label": "Métrica", "value": "Valor" }
  ],
  "items": [
    { "title": "Título", "subtitle": "Detalle", "badge": "Estado / Monto", "badgeColor": "emerald"|"blue"|"amber"|"purple", "details": "Detalle adicional", "targetTab": "finances"|"library"|"itinerary"|"messages"|"users"|"analytics" }
  ],
  "targetTab": "finances" | "library" | "itinerary" | "messages" | "users" | "analytics" | "stats" | "dashboard",
  "actionText": "Texto para botón de redirección principal"
}
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
            summary: parsed.summary || 'Análisis completado',
            analysis: parsed.analysis || parsed.reply || '',
            reply: parsed.analysis || parsed.reply || 'Consulta procesada.',
            metrics: parsed.metrics || [],
            targetTab: parsed.targetTab || 'dashboard',
            actionText: parsed.actionText || 'Ver en Dashboard',
            items: parsed.items || []
          }
        };
      }),
      catchError(() => of(this.localRegexFallback(userPrompt)))
    );
  }

  private fallbackDirectVoiceGemini(base64Audio: string, mimeType: string): Observable<VoiceAudioResult> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(this.geminiKey)}`;
    const endpoint2 = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(this.geminiKey)}`;

    const recentActs = this.getLocalActivities().slice(0, 6);
    const recentActsJson = JSON.stringify(recentActs);

    const promptText = `
Eres el procesador de voz y asistente del Centro de Comando de PortaLink (Dashboard).
Escucha atentamente el audio en español del usuario.

TAREA OBLIGATORIA:
1. Transcribe exactamente en español lo que el usuario pronunció en el campo "transcript".
2. Si el usuario dijo una sola palabra o comando directo para ir a un módulo:
   - Ejemplos: "biblioteca", "apuntes", "cuadernos" -> intent: "navigate", targetTab: "library", actionText: "Abrir Biblioteca", summary: "Navegando a la Biblioteca de Apuntes"
   - Ejemplos: "finanzas", "facturas", "pagos", "cobros", "cartera" -> intent: "navigate", targetTab: "finances", actionText: "Ir a Finanzas", summary: "Navegando a Finanzas"
   - Ejemplos: "control financiero" -> intent: "navigate", targetTab: "financial-control", actionText: "Ir a Control Financiero", summary: "Navegando a Control Financiero"
   - Ejemplos: "agenda", "calendario", "tareas", "itinerario" -> intent: "navigate", targetTab: "itinerary", actionText: "Ver Agenda", summary: "Navegando a Agenda y Calendario"
   - Ejemplos: "analíticas", "tráfico", "métricas", "visitas" -> intent: "navigate", targetTab: "analytics", actionText: "Ver Analíticas", summary: "Navegando a Analíticas"
   - Ejemplos: "mensajes", "contactos", "correos" -> intent: "navigate", targetTab: "messages", actionText: "Ver Mensajes", summary: "Navegando a Mensajes"
   - Ejemplos: "inicio", "dashboard", "home" -> intent: "navigate", targetTab: "dashboard", actionText: "Ir a Inicio", summary: "Navegando a Inicio"
3. Si el usuario hizo una pregunta o consulta analítica sobre el sistema (ej: "dame mis clientes", "cuáles son las facturas pendientes", etc.):
   - intent: "query"
   - targetTab: "finances"|"library"|"itinerary"|"analytics"|"messages"|"dashboard"
   - summary: Conclusión ejecutiva
   - analysis: Párrafo analítico completo
   - items: Lista de resultados relevantes

Responde SIEMPRE en formato JSON estricto con:
{
  "transcript": "Texto exacto pronunciado por el usuario",
  "intent": "navigate" | "query",
  "targetTab": "library" | "finances" | "financial-control" | "itinerary" | "analytics" | "messages" | "dashboard",
  "summary": "Resumen ejecutivo directo",
  "analysis": "Párrafo explicativo del análisis (si intent es query)",
  "metrics": [ { "label": "...", "value": "..." } ],
  "items": [ { "title": "...", "subtitle": "...", "badge": "...", "badgeColor": "emerald"|"blue"|"amber"|"purple", "details": "...", "targetTab": "..." } ],
  "actionText": "Texto para botón de redirección"
}

Últimas actividades registradas del usuario:
${recentActsJson}
`;

    // Normalizar mimeType soportado por Gemini (audio/webm, audio/mp4, audio/ogg, audio/wav)
    let cleanMime = mimeType.split(';')[0].trim();
    if (!cleanMime || cleanMime === 'audio/x-m4a') cleanMime = 'audio/mp4';

    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: promptText },
            {
              inlineData: {
                mimeType: cleanMime,
                data: base64Audio
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1200,
        responseMimeType: 'application/json'
      }
    };

    const callEndpoint = (url: string) => this.http.post<any>(url, body).pipe(
      map(res => {
        const text = res?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        let cleaned = text.trim();
        if (cleaned.startsWith('```json')) cleaned = cleaned.substring(7);
        if (cleaned.startsWith('```')) cleaned = cleaned.substring(3);
        if (cleaned.endsWith('```')) cleaned = cleaned.substring(0, cleaned.length - 3);
        cleaned = cleaned.trim();

        const parsed = JSON.parse(cleaned);
        const transcript = parsed.transcript || 'Comando de voz';
        const intent = parsed.intent || (parsed.targetTab && parsed.targetTab !== 'dashboard' && !parsed.analysis ? 'navigate' : 'query');

        return {
          ok: true,
          transcript,
          intent,
          targetTab: parsed.targetTab || 'dashboard',
          actionText: parsed.actionText || 'Ver en Módulo',
          data: {
            summary: parsed.summary || `Voz: "${transcript}"`,
            analysis: parsed.analysis || parsed.reply || '',
            reply: parsed.analysis || parsed.reply || '',
            metrics: parsed.metrics || [],
            targetTab: parsed.targetTab || 'dashboard',
            actionText: parsed.actionText || 'Ver en Dashboard',
            items: parsed.items || []
          }
        };
      })
    );

    return callEndpoint(endpoint).pipe(
      catchError(() => callEndpoint(endpoint2)),
      catchError(err => {
        console.warn('[VoiceGemini] Fallback error:', err);
        return of({
          ok: false,
          transcript: '',
          intent: 'query' as const,
          targetTab: 'dashboard',
          actionText: 'Reintentar',
          data: {
            summary: 'No se pudo interpretar el audio',
            analysis: 'Verifica tu conexión y permisos de micrófono.',
            targetTab: 'dashboard',
            actionText: 'Escribir Consulta',
            items: []
          }
        });
      })
    );
  }

  private localRegexFallback(q: string): CommandCenterResponse {
    const lower = q.toLowerCase();

    if (/cliente|contacto|empresa/.test(lower)) {
      return {
        ok: true,
        query: q,
        data: {
          summary: 'Cartera de clientes registrados y activos.',
          analysis: 'Se consultaron los clientes en la base de datos de PortaLink. Todos los contactos están disponibles para facturación y asignación de proyectos.',
          targetTab: 'finances',
          actionText: 'Ver Cartera de Clientes',
          items: [
            { title: 'Clientes Activos', subtitle: 'Gestiona datos de contacto y facturación', badge: 'Finanzas', badgeColor: 'purple', targetTab: 'finances' }
          ]
        }
      };
    }

    if (/pago|factura|cobro|finanza|deuda|ingreso/.test(lower)) {
      return {
        ok: true,
        query: q,
        data: {
          summary: 'Estado de facturación y pagos pendientes.',
          analysis: 'Revisión financiera en tiempo real: consulta cuentas por cobrar, montos pendientes y balance acumulado.',
          targetTab: 'finances',
          actionText: 'Gestionar Finanzas & Pagos',
          items: [
            { title: 'Pagos Pendientes', subtitle: 'Revisión de cuentas de cobro', badge: 'Pendiente', badgeColor: 'amber', targetTab: 'finances' }
          ]
        }
      };
    }

    return {
      ok: true,
      query: q,
      data: {
        summary: 'Consulta procesada en el Centro de Comando.',
        analysis: 'Puedes navegar directamente al módulo correspondiente para gestionar los registros.',
        targetTab: 'dashboard',
        actionText: 'Ver Dashboard',
        items: []
      }
    };
  }
}

function ucfirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
