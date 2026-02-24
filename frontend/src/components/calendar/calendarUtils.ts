import type { ClassEvent } from '@/types/classEvent';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const HOURS = Array.from({ length: 23 }, (_, i) => i + 1);
export const DAY_NAMES = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

export function getEventPosition(event: ClassEvent) {
  const start = new Date(event.startDatetime);
  const end = new Date(event.endDatetime);

  const startHour = start.getHours();
  const startMinutes = start.getMinutes();
  const endHour = end.getHours();
  const endMinutes = end.getMinutes();

  const startPosition = (startHour - 1) * 80 + (startMinutes / 60) * 80;
  const duration =
    (endHour - startHour) * 80 + ((endMinutes - startMinutes) / 60) * 80;

  return {
    top: startPosition,
    height: Math.max(duration, 40),
  };
}

export function getEventLayout(event: ClassEvent, dayEvents: ClassEvent[]) {
  const overlappingEvents = dayEvents
    .filter((e) => {
      const start1 = new Date(event.startDatetime);
      const end1 = new Date(event.endDatetime);
      const start2 = new Date(e.startDatetime);
      const end2 = new Date(e.endDatetime);
      return start1 < end2 && start2 < end1;
    })
    .sort((a, b) => {
      const startA = new Date(a.startDatetime).getTime();
      const startB = new Date(b.startDatetime).getTime();
      if (startA !== startB) return startA - startB;
      return a.id.localeCompare(b.id);
    });

  const totalColumns = overlappingEvents.length;
  const columnIndex = overlappingEvents.findIndex((e) => e.id === event.id);

  if (totalColumns === 1) {
    return {
      width: 'calc(100% - 16px)',
      left: '0',
    };
  }

  const widthPercent = 100 / totalColumns;
  const leftPercent = widthPercent * columnIndex;

  return {
    width: `calc(${widthPercent}% - ${columnIndex === totalColumns - 1 ? 16 : 4}px)`,
    left: `${leftPercent}%`,
  };
}

export function getCurrentTimePosition(currentTime: Date) {
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  return (hours - 1) * 80 + (minutes / 60) * 80;
}

export function formatTimeRange(start: string, end: string) {
  const startDate = parseISO(start);
  const endDate = parseISO(end);

  const startMinutes = startDate.getMinutes();
  const endMinutes = endDate.getMinutes();

  if (startMinutes === 0 && endMinutes === 0) {
    const startTime = format(startDate, 'h', { locale: es });
    const endTime = format(endDate, 'h a', { locale: es })
      .replace(' ', '')
      .toLowerCase();
    return `${startTime} - ${endTime}`;
  }

  const startTime = format(startDate, startMinutes === 0 ? 'h' : 'h:mm', {
    locale: es,
  });
  const endTime = format(endDate, endMinutes === 0 ? 'h a' : 'h:mm a', {
    locale: es,
  })
    .replace(' ', '')
    .toLowerCase();

  return `${startTime} - ${endTime}`;
}

export function getEventsByDay(events: ClassEvent[], day: Date) {
  if (!events || events.length === 0) return [];

  return events.filter((event) => {
    const eventDate = new Date(event.startDatetime);
    const eventLocal = new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate(),
    );
    const dayLocal = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
    );
    return eventLocal.getTime() === dayLocal.getTime();
  });
}

export function getEventsForDay(events: ClassEvent[], day: Date) {
  if (!events || events.length === 0) return [];

  return events.filter((event) => {
    const eventDate = parseISO(event.startDatetime);
    return (
      eventDate.getDate() === day.getDate() &&
      eventDate.getMonth() === day.getMonth() &&
      eventDate.getFullYear() === day.getFullYear()
    );
  });
}

export function getMonthDays(currentDate: Date) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDay = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const totalDays = startDay + daysInMonth;
  const weeksNeeded = Math.ceil(totalDays / 7);

  const days: Date[] = [];
  const startDate = new Date(year, month, 1 - startDay);

  for (let i = 0; i < weeksNeeded * 7; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    days.push(day);
  }

  return days;
}
