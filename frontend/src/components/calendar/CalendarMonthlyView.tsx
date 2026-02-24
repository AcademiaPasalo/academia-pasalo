'use client';

import type { ClassEvent } from '@/types/classEvent';
import { getCourseColor } from '@/lib/courseColors';
import { DAY_NAMES, getMonthDays, getEventsForDay } from './calendarUtils';

interface CalendarMonthlyViewProps {
  currentDate: Date;
  events: ClassEvent[];
  isToday: (date: Date) => boolean;
  onEventClick: (event: ClassEvent, e: React.MouseEvent) => void;
}

export default function CalendarMonthlyView({
  currentDate,
  events,
  isToday,
  onEventClick,
}: CalendarMonthlyViewProps) {
  const monthDays = getMonthDays(currentDate);
  const weeksCount = monthDays.length / 7;

  return (
    <div className="bg-bg-primary rounded-2xl border border-stroke-primary overflow-hidden flex-1 flex flex-col min-h-0">
      <div className="flex border-b border-stroke-primary flex-shrink-0">
        {DAY_NAMES.map((dayName, index) => (
          <div
            key={dayName}
            className={`flex-1 p-4 flex flex-col items-center ${index === 6 ? 'rounded-tr-2xl' : ''}`}
          >
            <div className="text-sm font-medium text-text-tertiary">
              {dayName}
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex flex-col min-h-0">
          {Array.from({ length: weeksCount }, (_, weekIndex) => {
            const weekDays = monthDays.slice(
              weekIndex * 7,
              (weekIndex + 1) * 7,
            );

            return (
              <div
                key={weekIndex}
                className={`flex min-h-[108px] ${weekIndex < weeksCount - 1 ? 'border-b border-stroke-secondary' : ''}`}
              >
                {weekDays.map((day, dayIndex) => {
                  const dayEvents = getEventsForDay(events, day);
                  const isTodayDay = isToday(day);
                  const isCurrentMonth =
                    day.getMonth() === currentDate.getMonth();

                  return (
                    <div
                      key={`${day.getTime()}-${dayIndex}`}
                      className={`flex-1 self-stretch py-2 flex flex-col items-center gap-2 ${
                        dayIndex < 6
                          ? 'border-r border-stroke-secondary'
                          : ''
                      }`}
                    >
                      <div
                        className={`w-6 h-6 p-0.5 rounded-full flex items-center justify-center ${
                          isTodayDay ? 'bg-info-primary-solid' : ''
                        }`}
                      >
                        <div
                          className={`text-sm font-medium text-center ${
                            isTodayDay
                              ? 'text-text-white'
                              : isCurrentMonth
                                ? 'text-text-primary'
                                : 'text-text-tertiary'
                          }`}
                        >
                          {day.getDate()}
                        </div>
                      </div>

                      <div className="self-stretch flex flex-col items-stretch gap-0.5 flex-1 min-h-0">
                        {dayEvents.slice(0, 2).map((event) => {
                          const colors = getCourseColor(event.courseCode);

                          return (
                            <div
                              key={event.id}
                              className="rounded-lg overflow-hidden border-l-4 px-2 py-1 cursor-pointer hover:opacity-80 transition-opacity"
                              style={{
                                borderLeftColor: colors.primary,
                                backgroundColor: colors.secondary,
                              }}
                              onClick={(e) => onEventClick(event, e)}
                            >
                              <div className="text-xs font-medium text-text-primary line-clamp-1">
                                {event.courseCode}
                              </div>
                            </div>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <div className="self-stretch px-2.5 text-[10px] font-medium text-text-tertiary">
                            +{dayEvents.length - 2} más
                          </div>
                        )}
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
  );
}
