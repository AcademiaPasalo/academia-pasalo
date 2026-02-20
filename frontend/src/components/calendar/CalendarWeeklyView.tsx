'use client';

import { useEffect, useRef, useState } from 'react';
import type { ClassEvent } from '@/types/classEvent';
import { getCourseColor } from '@/lib/courseColors';
import {
  HOURS,
  DAY_NAMES,
  getEventPosition,
  getEventLayout,
  getCurrentTimePosition,
  formatTimeRange,
  getEventsByDay,
} from './calendarUtils';

interface CalendarWeeklyViewProps {
  weekDays: Date[];
  events: ClassEvent[];
  loading: boolean;
  currentDate: Date;
  isToday: (date: Date) => boolean;
  onEventClick: (event: ClassEvent, e: React.MouseEvent) => void;
}

export default function CalendarWeeklyView({
  weekDays,
  events,
  loading,
  currentDate,
  isToday,
  onEventClick,
}: CalendarWeeklyViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (loading || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const todayInWeek = weekDays.some((day) => isToday(day));

    let targetHour: number;

    if (todayInWeek) {
      targetHour = new Date().getHours();
    } else if (events.length > 0) {
      const earliestHour = Math.min(
        ...events.map((e) => new Date(e.startDatetime).getHours()),
      );
      targetHour = earliestHour;
    } else {
      targetHour = 7;
    }

    const scrollTarget = Math.max(0, (targetHour - 2) * 80);
    container.scrollTo({ top: scrollTarget });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, currentDate]);

  const timePos = getCurrentTimePosition(currentTime);

  return (
    <div className="bg-bg-primary rounded-2xl border border-stroke-primary overflow-hidden flex-1 flex flex-col min-h-0">
      <div className="flex border-b border-stroke-primary flex-shrink-0">
        <div className="w-16" />
        {weekDays.map((day, index) => (
          <div
            key={index}
            className={`flex-1 p-4 flex flex-col items-center gap-px ${index < 6 ? 'border-r border-stroke-primary' : ''} ${isToday(day) ? 'bg-info-secondary-solid/10' : ''}`}
          >
            <div className="text-xs font-medium text-text-tertiary">
              {DAY_NAMES[index]}
            </div>
            <div
              className={`w-9 h-9 flex items-center justify-center rounded-full ${
                isToday(day) ? 'bg-info-primary-solid text-text-white' : ''
              }`}
            >
              <span className="text-xl font-medium">{day.getDate()}</span>
            </div>
          </div>
        ))}
      </div>

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        <div className="flex min-w-full">
          <div className="w-16 flex flex-col flex-shrink-0 bg-bg-primary sticky left-0 z-10">
            {HOURS.map((hour) => {
              const period = hour >= 12 ? 'PM' : 'AM';
              const displayHour =
                hour > 12 ? hour - 12 : hour === 12 ? 12 : hour;
              return (
                <div
                  key={hour}
                  className="h-20 px-4 py-3 border-b border-stroke-primary flex justify-end items-start gap-1 flex-shrink-0"
                >
                  <span className="text-xs font-medium text-text-tertiary">
                    {displayHour}
                  </span>
                  <span className="text-xs font-medium text-text-tertiary">
                    {period}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex-1 flex">
            {weekDays.map((day, dayIndex) => {
              const dayEvents = getEventsByDay(events, day);
              const isTodayColumn = isToday(day);

              return (
                <div
                  key={dayIndex}
                  className={`flex-1 relative ${dayIndex < 6 ? 'border-r border-stroke-secondary' : ''}`}
                  style={{ minWidth: '140px' }}
                >
                  {HOURS.map((hour, hourIndex) => (
                    <div
                      key={hour}
                      className={`h-20 pr-4 ${hourIndex < HOURS.length - 1 ? 'border-b border-stroke-secondary' : ''}`}
                    />
                  ))}

                  {isTodayColumn && timePos > 0 && (
                    <div
                      className="absolute left-0 right-0 flex items-center z-10"
                      style={{ top: `${timePos}px` }}
                    >
                      <div className="w-2 h-2 bg-info-secondary-solid rounded-full" />
                      <div className="flex-1 h-0 border-t border-stroke-info-secondary" />
                    </div>
                  )}

                  {dayEvents.map((event) => {
                    const position = getEventPosition(event);
                    const layout = getEventLayout(event, dayEvents);
                    const colors = getCourseColor(event.courseCode);

                    return (
                      <div
                        key={event.id}
                        className="absolute rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                        style={{
                          top: `${position.top}px`,
                          height: `${position.height}px`,
                          left: layout.left,
                          width: layout.width,
                          backgroundColor: colors.secondary,
                        }}
                        onClick={(e) => onEventClick(event, e)}
                      >
                        <div
                          className="h-full px-2.5 py-1.5 rounded-l-lg border-l-4 flex flex-col gap-1"
                          style={{ borderLeftColor: colors.primary }}
                        >
                          <span className="text-[10px] font-medium text-text-primary line-clamp-1">
                            {event.title}
                          </span>
                          <div className="flex-1 min-h-0">
                            <p className="text-xs font-medium text-text-primary line-clamp-3">
                              {event.courseName}
                            </p>
                          </div>
                          <div className="text-xs text-text-secondary">
                            {formatTimeRange(
                              event.startDatetime,
                              event.endDatetime,
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
