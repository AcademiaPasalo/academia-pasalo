// ============================================
// EJEMPLO DE USO DE SERVICIOS
// ============================================
// Este archivo muestra ejemplos de cómo usar los servicios implementados
// Puedes copiar estos ejemplos a tus componentes reales

'use client';

import React, { useEffect } from 'react';
import { useActiveCycle } from '@/hooks/useCycles';
import { useCourses, useCourseTypes, useCourseLevels } from '@/hooks/useCourses';
import { useCurrentUser } from '@/hooks/useUser';
import { useAuth } from '@/contexts/AuthContext';
import { evaluationsService } from '@/services';
import type { Evaluation } from '@/types/api';

/**
 * EJEMPLO 1: Obtener el ciclo académico activo
 * Útil para mostrar "Ciclo Vigente 2026-0" en la UI
 */
export function ActiveCycleExample() {
  const { cycle, loading, error } = useActiveCycle();

  if (loading) return <div>Cargando ciclo...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Ciclo Activo</h2>
      <p>Código: {cycle?.code}</p>
      <p>Inicio: {new Date(cycle?.startDate || '').toLocaleDateString()}</p>
      <p>Fin: {new Date(cycle?.endDate || '').toLocaleDateString()}</p>
    </div>
  );
}

/**
 * EJEMPLO 2: Listar cursos disponibles
 * Útil para páginas de administración o dashboard de alumno
 */
export function CoursesListExample() {
  const { courses, loading, error, loadCourses } = useCourses();

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  if (loading) return <div>Cargando cursos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Cursos Disponibles</h2>
      <ul>
        {courses.map((course) => (
          <li key={course.id}>
            {course.code} - {course.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * EJEMPLO 3: Crear un nuevo curso (ADMIN)
 * Formulario de creación de curso con tipos y niveles
 */
export function CreateCourseExample() {
  const { createCourse } = useCourses();
  const { types, loading: typesLoading } = useCourseTypes();
  const { levels, loading: levelsLoading } = useCourseLevels();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await createCourse({
        code: formData.get('code') as string,
        name: formData.get('name') as string,
        courseTypeId: formData.get('typeId') as string,
        cycleLevelId: formData.get('levelId') as string,
      });
      alert('Curso creado exitosamente');
    } catch {
      alert('Error al crear curso');
    }
  };

  if (typesLoading || levelsLoading) return <div>Cargando formulario...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <h2>Crear Nuevo Curso</h2>
      
      <input name="code" placeholder="Código (ej: FUFIS)" required />
      <input name="name" placeholder="Nombre del curso" required />
      
      <select name="typeId" required>
        <option value="">Selecciona tipo</option>
        {types.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </select>
      
      <select name="levelId" required>
        <option value="">Selecciona nivel</option>
        {levels.map((level) => (
          <option key={level.id} value={level.id}>
            {level.name}
          </option>
        ))}
      </select>
      
      <button type="submit">Crear Curso</button>
    </form>
  );
}

/**
 * EJEMPLO 4: Perfil del usuario actual
 * Mostrar y editar datos del perfil
 */
export function UserProfileExample() {
  const { user, loading, error, updateProfile } = useCurrentUser();

  const handleUpdate = async () => {
    try {
      await updateProfile({
        firstName: 'Juan',
        phone: '+51999999999',
      });
      alert('Perfil actualizado');
    } catch {
      alert('Error al actualizar perfil');
    }
  };

  if (loading) return <div>Cargando perfil...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Mi Perfil</h2>
      <p>Nombre: {user?.firstName} {user?.lastName1}</p>
      <p>Email: {user?.email}</p>
      <p>Teléfono: {user?.phone || 'No registrado'}</p>
      <p>Carrera: {user?.career || 'No registrada'}</p>
      <p>Roles: {user?.roles.map(r => r.name).join(', ')}</p>
      <button onClick={handleUpdate}>Actualizar Perfil</button>
    </div>
  );
}

/**
 * EJEMPLO 5: Verificar roles del usuario
 * Mostrar contenido según el rol del usuario
 */
export function RoleBasedContentExample() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Debes iniciar sesión</div>;
  }

  const isAdmin = user?.roles.some(r => 
    ['ADMIN', 'SUPER_ADMIN'].includes(r.code)
  );

  const isStudent = user?.roles.some(r => r.code === 'STUDENT');

  return (
    <div>
      <h2>Panel de Usuario</h2>
      
      {isStudent && (
        <div>
          <h3>Contenido de Alumno</h3>
          <p>Mis cursos, evaluaciones, etc.</p>
        </div>
      )}
      
      {isAdmin && (
        <div>
          <h3>Panel de Administración</h3>
          <p>Gestionar cursos, usuarios, etc.</p>
        </div>
      )}
    </div>
  );
}

/**
 * EJEMPLO 6: Cargar evaluaciones de un curso
 * Llamada directa a un servicio sin hook
 */
export function CourseEvaluationsExample({ courseCycleId }: { courseCycleId: string }) {
  const [evaluations, setEvaluations] = React.useState<Evaluation[]>([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    async function loadEvaluations() {
      try {
        const data = await evaluationsService.findByCourseCycle(courseCycleId);
        setEvaluations(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    loadEvaluations();
  }, [courseCycleId]);

  if (loading) return <div>Cargando evaluaciones...</div>;

  return (
    <div>
      <h2>Evaluaciones del Curso</h2>
      <ul>
        {evaluations.map((evaluation) => (
          <li key={evaluation.id}>
            Evaluación #{evaluation.number} - 
            {new Date(evaluation.startDate).toLocaleDateString()} a {new Date(evaluation.endDate).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * EJEMPLO 7: Integración completa en una página de curso
 * Combina ciclo activo + evaluaciones
 */
export function CoursePageIntegrationExample({ courseId }: { courseId: string }) {
  const { cycle } = useActiveCycle();
  const [evaluations, setEvaluations] = React.useState<Evaluation[]>([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    async function loadCourseData() {
      if (!cycle) return;

      try {
        // Aquí necesitarías obtener el courseCycleId basado en courseId + cycle.id
        // Por ahora es un ejemplo simplificado
        const courseCycleId = 'some-id'; // Obtener del backend
        const data = await evaluationsService.findByCourseCycle(courseCycleId);
        setEvaluations(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCourseData();
  }, [cycle, courseId]);

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h1>Curso: {courseId}</h1>
      <p>Ciclo: {cycle?.code}</p>
      
      <h2>Evaluaciones</h2>
      <div className="grid grid-cols-3 gap-4">
        {evaluations.map((evaluation: any) => (
          <div key={evaluation.id} className="border p-4 rounded">
            <h3>Evaluación #{evaluation.number}</h3>
            <p>Tipo: {evaluation.evaluationType?.name}</p>
            <p>Inicio: {new Date(evaluation.startDate).toLocaleDateString()}</p>
            <p>Fin: {new Date(evaluation.endDate).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
