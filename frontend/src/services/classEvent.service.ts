// ============================================
// CLASS EVENT SERVICE - Gestión de Eventos del Calendario
// ============================================

import { apiClient } from '@/lib/apiClient';
import type { ClassEvent } from '@/types/classEvent';

export interface MyScheduleParams {
  start: string; // Fecha inicio del rango (ISO-8601, ej: 2026-02-01)
  end: string; // Fecha fin del rango (ISO-8601, ej: 2026-02-07)
}

export interface CreateClassEventPayload {
  evaluationId: string;
  sessionNumber: number;
  title: string;
  topic: string;
  startDatetime: string; // ISO-8601
  endDatetime: string; // ISO-8601
  liveMeetingUrl: string;
}

export interface UpdateClassEventPayload {
  title?: string;
  topic?: string;
  startDatetime?: string;
  endDatetime?: string;
  liveMeetingUrl?: string;
  recordingUrl?: string;
}

export const classEventService = {
  /**
   * Obtener el horario/calendario del usuario actual (Alumno o Profesor)
   * @param params - Objeto con start y end
   * @returns Lista de eventos en el rango especificado
   */
  async getMySchedule(params: MyScheduleParams): Promise<ClassEvent[]> {
    const response = await apiClient.get<ClassEvent[]>(
      `/class-events/my-schedule?start=${params.start}&end=${params.end}`
    );
    return response.data;
  },

  /**
   * Obtener el detalle de un evento específico
   * @param id - ID del evento
   */
  async getEventDetail(id: string): Promise<ClassEvent> {
    const response = await apiClient.get<ClassEvent>(`/class-events/${id}`);
    return response.data;
  },

  /**
   * Obtener todos los eventos de una evaluación específica
   * @param evaluationId - ID de la evaluación
   */
  async getEvaluationEvents(evaluationId: string): Promise<ClassEvent[]> {
    const response = await apiClient.get<ClassEvent[]>(`/class-events/evaluation/${evaluationId}`);
    return response.data;
  },

  /**
   * Unirse a una reunión en vivo (abrir link en nueva ventana)
   * @param event - Evento con el liveMeetingUrl
   */
  joinMeeting(event: ClassEvent): void {
    if (!event.canJoinLive) {
      throw new Error('No tienes acceso a esta reunión en este momento');
    }

    if (event.liveMeetingUrl) {
      window.open(event.liveMeetingUrl, '_blank', 'noopener,noreferrer');
    } else {
      throw new Error('El link de la reunión no está disponible');
    }
  },

  /**
   * Copiar link de reunión en vivo al portapapeles
   * @param event - Evento con el liveMeetingUrl
   */
  async copyMeetingLink(event: ClassEvent): Promise<void> {
    if (!event.canCopyLiveLink) {
      throw new Error('No tienes permiso para copiar el link de esta reunión');
    }

    if (!event.liveMeetingUrl) {
      throw new Error('El link de la reunión no está disponible');
    }

    try {
      await navigator.clipboard.writeText(event.liveMeetingUrl);
    } catch {
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = event.liveMeetingUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand('copy');
        textArea.remove();
      } catch {
        textArea.remove();
        throw new Error('No se pudo copiar el link');
      }
    }
  },

  /**
   * Verificar si un evento está en curso (para mostrar badge "EN VIVO")
   * @param event - Evento a verificar
   */
  isLive(event: ClassEvent): boolean {
    const now = new Date();
    const start = new Date(event.startDatetime);
    const end = new Date(event.endDatetime);

    return now >= start && now <= end && !event.isCancelled;
  },

  /**
   * Verificar si un evento está próximo (dentro de los próximos 30 minutos)
   * @param event - Evento a verificar
   */
  isUpcoming(event: ClassEvent): boolean {
    const now = new Date();
    const start = new Date(event.startDatetime);
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

    return start > now && start <= thirtyMinutesFromNow && !event.isCancelled;
  },

  /**
   * Formatear rango de fechas para la semana actual
   * @param date - Fecha base (por defecto hoy)
   * @returns Objeto con start (domingo) y end (sábado) de la semana
   */
  getWeekRange(date: Date = new Date()): MyScheduleParams {
    const day = date.getDay();
    const diff = date.getDate() - day; // Restar días para llegar al domingo

    const sunday = new Date(date);
    sunday.setDate(diff);
    sunday.setHours(0, 0, 0, 0);

    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    saturday.setHours(23, 59, 59, 999);

    return {
      start: sunday.toISOString().split('T')[0], // YYYY-MM-DD
      end: saturday.toISOString().split('T')[0]
    };
  },

  /**
   * Obtener rango de fechas para un mes completo
   * @param year - Año
   * @param month - Mes (0-11, enero = 0)
   */
  getMonthRange(year: number, month: number): MyScheduleParams {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    return {
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0]
    };
  },

  /**
   * Obtener el día de hoy en formato ISO
   */
  getTodayRange(): MyScheduleParams {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    return {
      start: today.toISOString().split('T')[0],
      end: endOfDay.toISOString().split('T')[0]
    };
  },

  async createEvent(payload: CreateClassEventPayload): Promise<ClassEvent> {
    const response = await apiClient.post<ClassEvent>('/class-events', payload);
    return response.data;
  },

  async updateEvent(id: string, payload: UpdateClassEventPayload): Promise<ClassEvent> {
    const response = await apiClient.patch<ClassEvent>(`/class-events/${id}`, payload);
    return response.data;
  },

  async cancelEvent(id: string): Promise<void> {
    await apiClient.delete(`/class-events/${id}/cancel`);
  },
};