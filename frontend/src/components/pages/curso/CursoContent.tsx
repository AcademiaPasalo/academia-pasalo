'use client';

import { useEffect, useState } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { getCursoDetalle } from '@/services/cursoService';
import { CursoDetalle } from '@/types/curso';

interface CursoContentProps {
  cursoId: string;
}

export default function CursoContent({ cursoId }: CursoContentProps) {
  const { setBreadcrumbItems } = useBreadcrumb();
  const [curso, setCurso] = useState<CursoDetalle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCurso() {
      setLoading(true);
      try {
        const cursoData = await getCursoDetalle(cursoId);
        setCurso(cursoData);
        
        // Actualizar breadcrumb con el nombre real del curso
        if (cursoData) {
          setBreadcrumbItems([
            { icon: 'home', label: 'Inicio', href: '/plataforma/inicio' },
            { label: cursoData.nombre }
          ]);
        }
      } catch (error) {
        console.error('Error al cargar el curso:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCurso();
  }, [cursoId, setBreadcrumbItems]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent-solid border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary">Cargando curso...</p>
        </div>
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="bg-white rounded-2xl border border-stroke-primary p-8">
        <h1 className="text-3xl font-semibold text-primary mb-4">
          Curso no encontrado
        </h1>
        <p className="text-secondary">
          El curso con ID <code className="bg-bg-secondary px-2 py-1 rounded">{cursoId}</code> no existe.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header del Curso */}
      <div className="bg-white rounded-2xl border border-stroke-primary overflow-hidden">
        {/* Banner con color del curso */}
        <div 
          className="h-32 relative"
          style={{ backgroundColor: curso.color }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40"></div>
        </div>
        
        {/* Información del curso */}
        <div className="p-8 -mt-8 relative">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-stroke-primary">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span 
                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-white font-bold text-sm"
                    style={{ backgroundColor: curso.color }}
                  >
                    {curso.nombreCorto}
                  </span>
                  <div>
                    <h1 className="text-2xl font-semibold text-primary">
                      {curso.nombre}
                    </h1>
                    <p className="text-sm text-secondary">
                      {curso.profesor} • {curso.creditos} créditos
                    </p>
                  </div>
                </div>
                <p className="text-secondary mt-3">
                  {curso.descripcion}
                </p>
              </div>
              
              {/* Progreso */}
              {curso.progreso !== undefined && (
                <div className="text-right ml-6">
                  <p className="text-sm text-tertiary mb-1">Progreso</p>
                  <p className="text-3xl font-bold text-accent-solid">
                    {curso.progreso}%
                  </p>
                </div>
              )}
            </div>

            {/* Información adicional */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-stroke-secondary">
              <div>
                <p className="text-xs text-tertiary mb-1">Horario</p>
                <p className="text-sm text-primary font-medium">{curso.horario}</p>
              </div>
              <div>
                <p className="text-xs text-tertiary mb-1">Aula</p>
                <p className="text-sm text-primary font-medium">{curso.aula}</p>
              </div>
              <div>
                <p className="text-xs text-tertiary mb-1">Calificación</p>
                <p className="text-sm text-primary font-medium">
                  {curso.calificacion !== undefined ? curso.calificacion.toFixed(1) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Unidades */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-primary">Unidades</h2>
          {curso.contenido.unidades.map((unidad) => (
            <div 
              key={unidad.id}
              className="bg-white rounded-xl border border-stroke-primary p-6"
            >
              <h3 className="text-lg font-semibold text-primary mb-2">
                {unidad.titulo}
              </h3>
              <p className="text-sm text-secondary mb-4">
                {unidad.descripcion}
              </p>
              <div className="space-y-2">
                {unidad.temas.map((tema) => (
                  <div
                    key={tema.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-bg-secondary transition-colors cursor-pointer"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      tema.completado 
                        ? 'bg-success-solid text-white' 
                        : 'bg-stroke-secondary text-tertiary'
                    }`}>
                      {tema.completado && (
                        <span className="material-symbols-rounded text-sm">check</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary">
                        {tema.titulo}
                      </p>
                      <p className="text-xs text-tertiary">
                        {tema.tipo.charAt(0).toUpperCase() + tema.tipo.slice(1)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Evaluaciones */}
          <div className="bg-white rounded-xl border border-stroke-primary p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">
              Evaluaciones
            </h3>
            <div className="space-y-3">
              {curso.contenido.evaluaciones.map((evaluacion) => (
                <div
                  key={evaluacion.id}
                  className="p-3 rounded-lg bg-bg-secondary"
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-medium text-primary">
                      {evaluacion.titulo}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      evaluacion.estado === 'calificado' 
                        ? 'bg-success-solid text-white'
                        : evaluacion.estado === 'pendiente'
                        ? 'bg-warning-solid text-white'
                        : evaluacion.estado === 'entregado'
                        ? 'bg-info-primary-solid text-white'
                        : 'bg-error-solid text-white'
                    }`}>
                      {evaluacion.estado}
                    </span>
                  </div>
                  <p className="text-xs text-tertiary">
                    {new Date(evaluacion.fecha).toLocaleDateString('es-ES')}
                  </p>
                  {evaluacion.calificacion !== undefined && (
                    <p className="text-sm font-bold text-accent-solid mt-2">
                      {evaluacion.calificacion.toFixed(1)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Materiales */}
          <div className="bg-white rounded-xl border border-stroke-primary p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">
              Materiales
            </h3>
            <div className="space-y-2">
              {curso.contenido.materiales.map((material) => (
                <a
                  key={material.id}
                  href={material.url}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-bg-secondary transition-colors"
                >
                  <span className="material-symbols-rounded text-accent-solid">
                    {material.tipo === 'pdf' ? 'picture_as_pdf' : 
                     material.tipo === 'video' ? 'play_circle' :
                     'description'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary truncate">
                      {material.titulo}
                    </p>
                    <p className="text-xs text-tertiary">
                      {new Date(material.fechaSubida).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
