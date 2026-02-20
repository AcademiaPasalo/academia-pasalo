'use client';

import { useState } from 'react';
import type { CalendarView } from '@/hooks/useCalendar';
import {
  MdChevronLeft,
  MdChevronRight,
  MdExpandMore,
  MdCalendarViewWeek,
  MdCalendarViewMonth,
} from 'react-icons/md';

interface CourseOption {
  id: string;
  code: string;
  name: string;
}

interface CalendarHeaderProps {
  title: string;
  currentMonthYear: string;
  view: CalendarView;
  selectedCourseId: string | null;
  courses: CourseOption[];
  loadingCourses: boolean;
  onViewChange: (view: CalendarView) => void;
  onNext: () => void;
  onPrevious: () => void;
  onToday: () => void;
  onCourseChange: (courseCode: string | null) => void;
  actions?: React.ReactNode;
}

export default function CalendarHeader({
  title,
  currentMonthYear,
  view,
  selectedCourseId,
  courses,
  loadingCourses,
  onViewChange,
  onNext,
  onPrevious,
  onToday,
  onCourseChange,
  actions,
}: CalendarHeaderProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const selectedCourseName = selectedCourseId
    ? courses.find((c) => c.code === selectedCourseId)?.name ||
      'Curso seleccionado'
    : 'Filtrar por Curso';

  return (
    <>
      <div className="flex justify-between items-center flex-shrink-0">
        <h1 className="text-3xl font-semibold text-text-primary">{title}</h1>

        <div className="flex items-center gap-3">
          {actions}

          <div className="relative w-64">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full h-12 px-3 py-3.5 bg-bg-primary rounded border border-stroke-primary flex justify-between items-center gap-2 hover:bg-bg-secondary transition-colors"
              disabled={loadingCourses}
            >
              <span
                className={`flex-1 text-left text-base ${selectedCourseId ? 'text-text-primary' : 'text-text-tertiary'}`}
              >
                {selectedCourseName}
              </span>
              <MdExpandMore
                className={`w-5 h-5 text-icon-tertiary transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isFilterOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-bg-primary rounded-lg shadow-2xl border border-stroke-primary z-20 max-h-80 overflow-y-auto">
                <button
                  onClick={() => {
                    onCourseChange(null);
                    setIsFilterOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-bg-secondary transition-colors ${!selectedCourseId ? 'bg-accent-light text-text-accent-primary' : 'text-text-primary'}`}
                >
                  Todos los cursos
                </button>
                {courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => {
                      onCourseChange(course.code);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-bg-secondary transition-colors ${selectedCourseId === course.code ? 'bg-accent-light text-text-accent-primary' : 'text-text-primary'}`}
                  >
                    <div className="font-medium">{course.code}</div>
                    <div className="text-sm text-text-secondary">
                      {course.name}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 bg-bg-primary rounded-xl border border-stroke-primary flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-5">
            <button
              onClick={onToday}
              className="px-4 py-3 bg-bg-primary rounded-lg border border-stroke-accent-primary text-sm font-medium text-text-accent-primary hover:bg-accent-light transition-colors"
            >
              Hoy
            </button>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={onPrevious}
                  className="p-1 rounded-lg hover:bg-bg-secondary transition-colors"
                  aria-label="Anterior"
                >
                  <MdChevronLeft className="w-4 h-4 text-icon-accent-primary" />
                </button>
                <button
                  onClick={onNext}
                  className="p-1 rounded-lg hover:bg-bg-secondary transition-colors"
                  aria-label="Siguiente"
                >
                  <MdChevronRight className="w-4 h-4 text-icon-accent-primary" />
                </button>
              </div>

              <div className="flex items-center gap-1 capitalize">
                <span className="text-xl font-medium text-text-primary">
                  {currentMonthYear}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onViewChange('weekly')}
              className={`px-2.5 py-2 rounded flex items-center gap-1 text-sm font-medium transition-colors ${
                view === 'weekly'
                  ? 'bg-deep-blue-700 text-white'
                  : 'bg-bg-primary text-text-accent-primary border border-stroke-accent-primary hover:bg-accent-light'
              }`}
            >
              <MdCalendarViewWeek className="w-4 h-4" />
              Semanal
            </button>
            <button
              onClick={() => onViewChange('monthly')}
              className={`px-2.5 py-2 rounded flex items-center gap-1 text-sm font-medium transition-colors ${
                view === 'monthly'
                  ? 'bg-deep-blue-700 text-white'
                  : 'bg-bg-primary text-text-accent-primary border border-stroke-accent-primary hover:bg-accent-light'
              }`}
            >
              <MdCalendarViewMonth className="w-4 h-4" />
              Mensual
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
