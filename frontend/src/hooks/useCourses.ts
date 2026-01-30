// ============================================
// USE COURSES HOOK - GESTIÓN DE CURSOS
// ============================================

import { useState, useEffect } from 'react';
import { coursesService } from '@/services/courses.service';
import type { Course, CourseType, CycleLevel } from '@/types/api';

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await coursesService.findAll();
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar cursos');
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (data: {
    code: string;
    name: string;
    courseTypeId: string;
    cycleLevelId: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const newCourse = await coursesService.create(data);
      setCourses((prev) => [...prev, newCourse]);
      return newCourse;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear curso');
      console.error('Error creating course:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    courses,
    loading,
    error,
    loadCourses,
    createCourse,
  };
}

export function useCourseTypes() {
  const [types, setTypes] = useState<CourseType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTypes() {
      setLoading(true);
      setError(null);
      try {
        const data = await coursesService.getCourseTypes();
        setTypes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar tipos de curso');
        console.error('Error loading course types:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTypes();
  }, []);

  return { types, loading, error };
}

export function useCourseLevels() {
  const [levels, setLevels] = useState<CycleLevel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLevels() {
      setLoading(true);
      setError(null);
      try {
        const data = await coursesService.getCourseLevels();
        setLevels(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar niveles académicos');
        console.error('Error loading course levels:', err);
      } finally {
        setLoading(false);
      }
    }

    loadLevels();
  }, []);

  return { levels, loading, error };
}
