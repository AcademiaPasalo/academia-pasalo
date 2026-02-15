// ============================================
// USE ENROLLMENTS HOOK - Gestión de Matrículas
// ============================================

import { useState, useEffect, useMemo } from 'react';
import { enrollmentsService } from '@/services/enrollments.service';
import type { Enrollment } from '@/types/enrollment';

export function useEnrollments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEnrollments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await enrollmentsService.getMyEnrollments();
      setEnrollments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar matrículas');
      console.error('Error loading enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollments();
  }, []);

  const uniqueCourses = useMemo(() => {
    if (!enrollments || enrollments.length === 0) return [];

    return enrollments.reduce((acc, enrollment) => {
      const course = enrollment.courseCycle.course;
      if (!acc.find((c) => c.id === course.id)) {
        acc.push(course);
      }
      return acc;
    }, [] as Array<{ id: string; code: string; name: string }>);
  }, [enrollments]);

  return {
    enrollments,
    uniqueCourses,
    loading,
    error,
    refetch: loadEnrollments,
  };
}
