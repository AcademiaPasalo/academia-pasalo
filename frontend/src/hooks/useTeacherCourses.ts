import { useState, useEffect, useMemo } from 'react';
import { coursesService } from '@/services/courses.service';
import type { CourseCycle } from '@/types/api';

export function useTeacherCourses() {
  const [courseCycles, setCourseCycles] = useState<CourseCycle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCourseCycles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await coursesService.getMyCourseCycles();
      setCourseCycles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar cursos');
      console.error('Error loading teacher courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourseCycles();
  }, []);

  const uniqueCourses = useMemo(() => {
    if (!courseCycles || courseCycles.length === 0) return [];

    return courseCycles.reduce((acc, cc) => {
      const course = cc.course;
      if (course && !acc.find((c) => c.id === course.id)) {
        acc.push({ id: course.id, code: course.code, name: course.name });
      }
      return acc;
    }, [] as Array<{ id: string; code: string; name: string }>);
  }, [courseCycles]);

  return {
    courseCycles,
    uniqueCourses,
    loading,
    error,
    refetch: loadCourseCycles,
  };
}
