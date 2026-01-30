'use client';

import { useEffect, useState } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { getCursoDetalle } from '@/services/cursoService';
import { CursoDetalle, Unidad } from '@/types/curso';

interface CursoContentProps {
  cursoId: string;
}

export default function CursoContent({ cursoId }: CursoContentProps) {
  const { setBreadcrumbItems } = useBreadcrumb();
  const [curso, setCurso] = useState<CursoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadCurso() {
      setLoading(true);
      setError(null);
      
      try {
        const cursoData = await getCursoDetalle(cursoId);
        
        if (!cursoData) {
          setError('Curso no encontrado');
          return;
        }
        
        setCurso(cursoData);
        
        setBreadcrumbItems([
          { icon: 'home', label: 'Inicio', href: '/plataforma/inicio' },
          { label: cursoData.nombre }
        ]);
      } catch (err) {
        console.error('Error al cargar el curso:', err);
        setError('Error al cargar el curso');
      } finally {
        setLoading(false);
      }
    }

    if (cursoId) {
      loadCurso();
    }
  }, [cursoId, setBreadcrumbItems]);

  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(unitId)) {
        newSet.delete(unitId);
      } else {
        newSet.add(unitId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-white rounded-2xl border border-stroke-primary p-6">
          <div className="h-6 bg-bg-secondary rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-bg-secondary rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-bg-secondary rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (error || !curso) {
    return (
      <div className="bg-white rounded-2xl border border-stroke-primary p-12 text-center">
        <span className="material-symbols-rounded text-6xl text-error-solid mb-4 block">error</span>
        <h1 className="text-2xl font-bold text-primary mb-2">{error || 'Curso no encontrado'}</h1>
        <p className="text-secondary mb-6">El curso solicitado no está disponible.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-stroke-primary p-6">
        <h1 className="text-3xl font-bold text-primary">{curso.nombre}</h1>
        {curso.profesor && (
          <div className="flex items-center gap-2 text-secondary mt-2">
            <span className="material-symbols-rounded">person</span>
            <span>{curso.profesor}</span>
          </div>
        )}
      </div>
    </div>
  );
}
