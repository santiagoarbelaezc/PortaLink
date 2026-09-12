import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DailyStreakData {
  streakCount: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  today: string;
  actions: {
    login: boolean;
    robot: boolean;
    library: boolean;
  };
  history: string[]; // List of active dates (YYYY-MM-DD)
}

export interface WeekDayStreak {
  name: string;
  dayNumber: number;
  dateStr: string;
  isToday: boolean;
  isPast: boolean;
  isCompleted: boolean;
}

export interface MonthDayStreak {
  dayNumber: number;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  isCompleted: boolean;
}

export interface MonthStreakData {
  monthName: string;
  year: number;
  month: number;
  days: MonthDayStreak[];
  activeCount: number;
  totalDaysInMonth: number;
}

const STORAGE_KEY = 'portalink_streak_data';
const MODAL_SEEN_KEY = 'portalink_streak_modal_seen';

@Injectable({
  providedIn: 'root'
})
export class StreakService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/streak`;

  private streakSubject = new BehaviorSubject<DailyStreakData>(this.getInitialStreakData());
  public streak$ = this.streakSubject.asObservable();

  private showModalSubject = new BehaviorSubject<boolean>(false);
  public showModal$ = this.showModalSubject.asObservable();

  constructor() {
    this.initStreak();
  }

  get currentData(): DailyStreakData {
    return this.streakSubject.value;
  }

  /**
   * Obtiene la fecha actual local en formato YYYY-MM-DD
   */
  public getLocalDateString(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getInitialStreakData(): DailyStreakData {
    const today = this.getLocalDateString();
    
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            ...parsed,
            today
          };
        }
      } catch (e) {
        console.warn('[StreakService] Error parsing local streak data:', e);
      }
    }

    return {
      streakCount: 1,
      longestStreak: 1,
      lastActiveDate: today,
      today,
      actions: {
        login: true,
        robot: false,
        library: false
      },
      history: [today]
    };
  }

  /**
   * Inicializa la racha al abrir el dashboard
   */
  public initStreak(): void {
    const today = this.getLocalDateString();
    let current = this.getInitialStreakData();

    const lastDateStr = current.lastActiveDate;

    if (lastDateStr !== today) {
      const lastDate = new Date(lastDateStr + 'T00:00:00');
      const nowDate = new Date(today + 'T00:00:00');
      const diffTime = nowDate.getTime() - lastDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Día consecutivo: racha continúa
        const newStreak = current.streakCount + 1;
        current = {
          ...current,
          streakCount: newStreak,
          longestStreak: Math.max(newStreak, current.longestStreak),
          lastActiveDate: today,
          today,
          actions: {
            login: true,
            robot: false,
            library: false
          },
          history: [...new Set([...current.history, today])]
        };
      } else if (diffDays > 1) {
        // Racha perdida: reinicia a 1
        current = {
          ...current,
          streakCount: 1,
          lastActiveDate: today,
          today,
          actions: {
            login: true,
            robot: false,
            library: false
          },
          history: [...new Set([...current.history, today])]
        };
      }
    } else {
      // Mismo día: asegurar que el primer ingreso esté marcado
      current.actions.login = true;
      if (!current.history.includes(today)) {
        current.history.push(today);
      }
    }

    this.saveLocal(current);
    this.streakSubject.next(current);

    // Verificar si se debe mostrar el modal de activación hoy (SOLO PRIMER INGRESO DIARIO)
    this.checkModalVisibility(today);

    // Sincronizar con backend pasando la fecha local del usuario
    this.syncWithBackend(today);
  }

  private checkModalVisibility(today: string): void {
    if (typeof window === 'undefined') return;
    try {
      const seenToday = localStorage.getItem(MODAL_SEEN_KEY);
      if (seenToday !== today) {
        // Marcar de inmediato para evitar aperturas dobles por recarga o múltiples inicializaciones
        localStorage.setItem(MODAL_SEEN_KEY, today);
        setTimeout(() => {
          this.showModalSubject.next(true);
        }, 600);
      }
    } catch (e) {
      console.warn('[StreakService] Modal check error:', e);
    }
  }

  /**
   * Apertura manual del modal (cuando el usuario hace clic en "Ver Racha")
   */
  public openModalManual(): void {
    this.showModalSubject.next(true);
  }

  /**
   * Cierre del modal
   */
  public closeModal(): void {
    const today = this.getLocalDateString();
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(MODAL_SEEN_KEY, today);
      } catch (e) {}
    }
    this.showModalSubject.next(false);
  }

  /**
   * Registra una acción de racha (login, robot o library)
   */
  public completeAction(action: 'login' | 'robot' | 'library'): void {
    const current = { ...this.streakSubject.value };
    const today = this.getLocalDateString();

    if (current.actions[action]) {
      return; // Ya completada hoy
    }

    current.actions[action] = true;
    current.lastActiveDate = today;
    if (!current.history.includes(today)) {
      current.history.push(today);
    }

    this.saveLocal(current);
    this.streakSubject.next(current);

    // Notificar al backend en background con fecha local
    this.http.post<{ ok: boolean; data: any }>(`${this.apiUrl}/action`, { action, today })
      .pipe(
        catchError(err => {
          console.warn('[StreakService] Backend sync error (using local):', err);
          return of(null);
        })
      )
      .subscribe();
  }

  private saveLocal(data: DailyStreakData): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.warn('[StreakService] Error saving to localStorage:', e);
      }
    }
  }

  private syncWithBackend(todayStr?: string): void {
    const today = todayStr || this.getLocalDateString();
    this.http.get<{ ok: boolean; data: any }>(`${this.apiUrl}?today=${today}`)
      .pipe(
        catchError(err => {
          // Backend no disponible o sin conexión: conservar local
          return of(null);
        })
      )
      .subscribe(res => {
        if (res && res.ok && res.data) {
          const backend = res.data;
          const merged: DailyStreakData = {
            streakCount: Math.max(backend.streakCount, this.streakSubject.value.streakCount),
            longestStreak: Math.max(backend.longestStreak, this.streakSubject.value.longestStreak),
            lastActiveDate: backend.lastActiveDate || this.streakSubject.value.lastActiveDate,
            today: backend.today || today,
            actions: {
              login: true,
              robot: backend.actions?.robot || this.streakSubject.value.actions.robot,
              library: backend.actions?.library || this.streakSubject.value.actions.library
            },
            history: [...new Set([...(backend.history || []), ...this.streakSubject.value.history])]
          };
          this.saveLocal(merged);
          this.streakSubject.next(merged);
        }
      });
  }

  /**
   * Genera los 7 días de la semana actual (Lunes a Domingo) para la barra de consistencia
   */
  public getWeekDays(): WeekDayStreak[] {
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 = Domingo, 1 = Lunes, ...
    const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);

    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const todayStr = this.getLocalDateString(now);
    const history = this.streakSubject.value.history || [];

    const week: WeekDayStreak[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = this.getLocalDateString(d);
      const isToday = dateStr === todayStr;
      const isPast = dateStr < todayStr;
      const isCompleted = history.includes(dateStr);

      week.push({
        name: dayNames[i],
        dayNumber: d.getDate(),
        dateStr,
        isToday,
        isPast,
        isCompleted
      });
    }

    return week;
  }

  /**
   * Genera la matriz completa de días para el calendario mensual
   */
  public getMonthData(date: Date = new Date()): MonthStreakData {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0 = Ene, 11 = Dic
    const todayStr = this.getLocalDateString();
    const history = this.streakSubject.value.history || [];

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Dom, 1 = Lun...
    const mondayOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const days: MonthDayStreak[] = [];

    // Días de relleno del mes anterior
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = mondayOffset - 1; i >= 0; i--) {
      const prevDay = prevMonthDays - i;
      const prevDate = new Date(year, month - 1, prevDay);
      const dateStr = this.getLocalDateString(prevDate);
      days.push({
        dayNumber: prevDay,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isPast: dateStr < todayStr,
        isCompleted: history.includes(dateStr)
      });
    }

    // Días del mes en curso
    let activeCount = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const curDate = new Date(year, month, d);
      const dateStr = this.getLocalDateString(curDate);
      const isCompleted = history.includes(dateStr);
      if (isCompleted) activeCount++;

      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isPast: dateStr < todayStr,
        isCompleted
      });
    }

    // Días posteriores para completar la cuadrícula (semanas completas de 7 días)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      const dateStr = this.getLocalDateString(nextDate);
      days.push({
        dayNumber: i,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isPast: dateStr < todayStr,
        isCompleted: history.includes(dateStr)
      });
    }

    return {
      monthName: `${monthNames[month]} ${year}`,
      year,
      month,
      days,
      activeCount,
      totalDaysInMonth: daysInMonth
    };
  }

  /**
   * Total de acciones completadas hoy (de 3)
   */
  public getCompletedActionsCount(): number {
    const actions = this.streakSubject.value.actions;
    let count = 0;
    if (actions.login) count++;
    if (actions.robot) count++;
    if (actions.library) count++;
    return count;
  }
}
