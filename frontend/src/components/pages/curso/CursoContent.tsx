'use client';

import { useEffect, useState } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { getCursoDetalle } from '@/services/cursoService';
import { ciclosAnterioresData, bancoEnunciadosData } from '@/data/cursos';
import { CursoDetalle } from '@/types/curso';
import Icon from '@/components/ui/Icon';

interface CursoContentProps {
  cursoId: string;
}

type TabOption = 'vigente' | 'anteriores' | 'banco';

export default function CursoContent({ cursoId }: CursoContentProps) {
  const { setBreadcrumbItems } = useBreadcrumb();
  const [curso, setCurso] = useState<CursoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabOption>('vigente');

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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'calificado': return 'check_circle';
      case 'pendiente': return 'bookmark';
      case 'entregado': return 'schedule';
      case 'vencido': return 'lock';
      default: return 'schedule';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'calificado': return 'Completado';
      case 'pendiente': return 'En curso';
      case 'entregado': return 'Próximamente';
      case 'vencido': return 'Bloqueado';
      default: return 'Próximamente';
    }
  };

  const getEstadoBgColor = (estado: string) => {
    switch (estado) {
      case 'calificado': return 'bg-success-light';
      case 'pendiente': return 'bg-bg-accent-light';
      case 'entregado': return 'bg-bg-tertiary';
      case 'vencido': return 'bg-bg-disabled';
      default: return 'bg-bg-tertiary';
    }
  };

  const getEstadoIconColor = (estado: string) => {
    switch (estado) {
      case 'calificado': return 'text-success-primary';
      case 'pendiente': return 'text-icon-accent-primary';
      case 'entregado': return 'text-icon-tertiary';
      case 'vencido': return 'text-icon-disabled';
      default: return 'text-icon-tertiary';
    }
  };

  const getEstadoTextColor = (estado: string) => {
    switch (estado) {
      case 'calificado': return 'text-text-success-primary';
      case 'pendiente': return 'text-text-accent-primary';
      case 'entregado': return 'text-text-secondary';
      case 'vencido': return 'text-text-disabled';
      default: return 'text-text-secondary';
    }
  };

  const getEstadoCardBg = (estado: string) => {
    return estado === 'vencido' ? 'bg-bg-secondary' : 'bg-bg-primary';
  };

  const isDisabled = (estado: string) => {
    return estado === 'entregado' || estado === 'vencido';
  };

  if (loading) {
    return (
      <div className="w-full py-12 inline-flex flex-col justify-start items-start overflow-hidden">
        <div className="self-stretch px-12 pb-8 border-b border-stroke-primary animate-pulse">
          <div className="h-8 bg-bg-secondary rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-bg-secondary rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !curso) {
    return (
      <div className="bg-white rounded-2xl border border-stroke-primary p-12 text-center">
        <Icon name="error" size={64} className="text-error-solid mb-4 mx-auto" />
        <h1 className="text-2xl font-bold text-primary mb-2">{error || 'Curso no encontrado'}</h1>
        <p className="text-secondary mb-6">El curso solicitado no está disponible.</p>
      </div>
    );
  }

  return (
    <div className="w-full inline-flex flex-col justify-start items-start overflow-hidden">
      {/* Header Section */}
      <div className="self-stretch pb-8 mb-8 border-b border-stroke-primary inline-flex justify-start items-start gap-8 overflow-hidden">
        {/* Left: Course Info */}
        <div className="flex-1 inline-flex flex-col justify-start items-start gap-5">
          {/* Tags */}
          <div className="inline-flex justify-start items-center gap-2">
            <div className="px-2.5 py-1.5 bg-success-light rounded-full flex justify-center items-center gap-1">
              <div className="text-success-primary text-xs font-medium font-['Poppins'] leading-3">CIENCIAS</div>
            </div>
            <div className="px-2.5 py-1.5 bg-gray-200 rounded-full flex justify-center items-center gap-1">
              <div className="text-text-secondary text-xs font-medium font-['Poppins'] leading-3">1° CICLO</div>
            </div>
          </div>

          {/* Title */}
          <div className="self-stretch inline-flex justify-start items-center gap-2">
            <div className="flex-1 text-text-primary text-4xl font-bold font-['Poppins'] leading-[48px]">
              {curso.nombre}
            </div>
          </div>

          {/* Teacher */}
          {curso.profesor && (
            <div className="self-stretch flex flex-col justify-start items-start gap-4">
              <div className="self-stretch inline-flex justify-start items-center gap-2">
                <div className="w-6 h-6 p-1 bg-bg-success-solid rounded-full flex justify-center items-center gap-2">
                  <div className="text-center text-text-white text-[10px] font-medium font-['Poppins'] leading-3">
                    {getInitials(curso.profesor)}
                  </div>
                </div>
                <div className="flex-1 flex justify-start items-start gap-1">
                  <div className="text-text-secondary text-base font-medium font-['Poppins'] leading-4">Docente:</div>
                  <div className="flex-1 text-text-secondary text-base font-normal font-['Poppins'] leading-4 line-clamp-1">
                    {curso.profesor}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Video Player */}
        <div className="flex-1 px-5 py-14 bg-bg-tertiary rounded-lg outline outline-1 outline-offset-[-1px] outline-stroke-primary inline-flex flex-col justify-center items-center gap-6 overflow-hidden">
          <div className="p-3 bg-accent-primary rounded-full inline-flex justify-start items-center gap-2">
            <Icon name="play_arrow" size={32} className="text-white" />

          </div>
          <div className="self-stretch flex flex-col justify-center items-center gap-1">
            <div className="self-stretch inline-flex justify-center items-center gap-1">
              <div className="text-center text-text-secondary text-xs font-medium font-['Poppins'] leading-4">Video:</div>
              <div className="text-center text-text-secondary text-xs font-medium font-['Poppins'] leading-4">Curso</div>
              <div className="text-center text-text-secondary text-xs font-medium font-['Poppins'] leading-4">- Clase introductoria</div>
            </div>
            <div className="self-stretch inline-flex justify-center items-center gap-1">
              <div className="text-center text-text-tertiary text-xs font-normal font-['Poppins'] leading-4">Profesor(a):</div>
              <div className="text-center text-text-tertiary text-xs font-normal font-['Poppins'] leading-4 line-clamp-1">
                {curso.profesor || 'Nombre Apellido'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="self-stretch inline-flex justify-start items-start gap-8">
        {/* Sidebar: Tabs */}
        <div className="w-72 p-4 bg-bg-primary rounded-3xl outline outline-1 outline-offset-[-1px] outline-stroke-primary inline-flex flex-col justify-start items-start gap-2">
          <button
            onClick={() => setActiveTab('vigente')}
            className={`self-stretch p-2 rounded-lg ${activeTab === 'vigente' ? 'bg-bg-accent-light border-r-4 border-accent-primary' : 'bg-bg-primary'} inline-flex justify-start items-center gap-2 transition-colors`}
          >
            <div className="flex-1 flex justify-start items-center gap-2">
              <Icon
                name="event_available"
                size={24}
               
                className={activeTab === 'vigente' ? 'text-icon-accent-primary' : 'text-icon-secondary'}
               
              />
              <div className={`flex-1 text-base font-medium font-['Poppins'] leading-4 ${activeTab === 'vigente' ? 'text-text-accent-primary' : 'text-text-secondary'}`}>
                Ciclo Vigente
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('anteriores')}
            className={`self-stretch p-2 rounded-lg ${activeTab === 'anteriores' ? 'bg-bg-accent-light border-r-4 border-accent-primary' : 'bg-bg-primary'} inline-flex justify-start items-center gap-2 transition-colors`}
          >
            <div className="flex-1 flex justify-start items-center gap-2">
              <Icon
                name="history"
                size={24}
               
                className={activeTab === 'anteriores' ? 'text-icon-accent-primary' : 'text-icon-secondary'}
               
              />
              <div className={`flex-1 text-base font-medium font-['Poppins'] leading-4 ${activeTab === 'anteriores' ? 'text-text-accent-primary' : 'text-text-secondary'}`}>
                Ciclos Anteriores
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('banco')}
            className={`self-stretch p-2 rounded-lg ${activeTab === 'banco' ? 'bg-bg-accent-light border-r-4 border-accent-primary' : 'bg-bg-primary'} inline-flex justify-start items-center gap-2 transition-colors`}
          >
            <div className="flex-1 flex justify-start items-center gap-2">
              <Icon
                name="topic"
                size={24}
               
                className={activeTab === 'banco' ? 'text-icon-accent-primary' : 'text-icon-secondary'}
               
              />
              <div className={`flex-1 text-base font-medium font-['Poppins'] leading-4 ${activeTab === 'banco' ? 'text-text-accent-primary' : 'text-text-secondary'}`}>
                Banco de Enunciados
              </div>
            </div>
          </button>
        </div>

        {/* Main Content: Dynamic content based on active tab */}
        <div className="flex-1 inline-flex flex-col justify-start items-start gap-6 overflow-hidden">
          {/* Tab: Ciclo Vigente */}
          {activeTab === 'vigente' && (
            <>
              <div className="self-stretch h-7 inline-flex justify-start items-center gap-4">
                <div className="text-text-primary text-xl font-semibold font-['Poppins'] leading-6">
                  Ciclo Vigente 2026-0
                </div>
              </div>

              <div className="self-stretch grid grid-cols-3 gap-4">
                {curso.contenido.evaluaciones.map((evaluacion) => {
                  const disabled = isDisabled(evaluacion.estado);

                  return (
                    <div
                      key={evaluacion.id}
                      className={`p-6 ${getEstadoCardBg(evaluacion.estado)} rounded-2xl outline outline-1 outline-offset-[-1px] outline-stroke-primary inline-flex flex-col justify-start items-end gap-4`}
                    >
                      {/* Icon and Status Badge */}
                      <div className="self-stretch inline-flex justify-between items-start">
                        <div className={`p-2 ${getEstadoBgColor(evaluacion.estado)} rounded-full flex justify-start items-center`}>
                          <Icon
                            name={getEstadoIcon(evaluacion.estado)}
                            size={24}
                           
                            className={getEstadoIconColor(evaluacion.estado)}
                           
                          />
                        </div>
                        <div className="flex justify-start items-start">
                          <div className={`px-2.5 py-1.5 ${getEstadoBgColor(evaluacion.estado)} rounded-full flex justify-center items-center gap-1`}>
                            <div className={`text-xs font-medium font-['Poppins'] leading-3 ${getEstadoTextColor(evaluacion.estado)}`}>
                              {getEstadoLabel(evaluacion.estado)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Title and Description */}
                      <div className="self-stretch flex flex-col justify-start items-start gap-1">
                        <div className={`self-stretch text-lg font-semibold font-['Poppins'] leading-5 ${disabled ? 'text-text-secondary' : 'text-text-primary'}`}>
                          {evaluacion.titulo}
                        </div>
                        <div className={`self-stretch text-xs font-normal font-['Poppins'] leading-4 ${disabled ? 'text-text-tertiary' : 'text-text-secondary'}`}>
                          {getEvaluacionSubtitulo(evaluacion)}
                        </div>
                      </div>

                      {/* Link Button */}
                      <button
                        disabled={disabled}
                        className={`p-1 rounded-lg inline-flex justify-center items-center gap-1.5 ${disabled ? 'cursor-not-allowed' : 'hover:bg-bg-accent-light transition-colors'}`}
                      >
                        <div className={`text-sm font-medium font-['Poppins'] leading-4 ${disabled ? 'text-text-disabled' : 'text-text-accent-primary'}`}>
                          Ver Clases
                        </div>
                        <Icon
                          name="arrow_forward"
                          size={16}
                         
                          className={disabled ? 'text-icon-disabled' : 'text-icon-accent-primary'}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Tab: Ciclos Anteriores */}
          {activeTab === 'anteriores' && (
            <>
              <div className="self-stretch h-7 inline-flex justify-start items-center gap-4">
                <div className="text-text-primary text-xl font-semibold font-['Poppins'] leading-6">
                  Ciclos Anteriores
                </div>
              </div>

              {ciclosAnterioresData[cursoId] ? (
                <div className="self-stretch space-y-8">
                  {Object.entries(ciclosAnterioresData[cursoId]).map(([cicloId, ciclo]) => (
                    <div key={cicloId} className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Icon name="calendar_today" size={20} className="text-icon-secondary" />
                        <h3 className="text-lg font-semibold text-text-primary">{ciclo.titulo}</h3>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        {ciclo.evaluaciones.map((evaluacion) => {
                          const disabled = isDisabled(evaluacion.estado);
                          return (
                            <div
                              key={evaluacion.id}
                              className={`p-6 bg-bg-primary rounded-2xl outline outline-1 outline-offset-[-1px] outline-stroke-primary inline-flex flex-col justify-start items-end gap-4`}
                            >
                              {/* Icon and Archivado Badge */}
                              <div className="self-stretch inline-flex justify-between items-start">
                                <div className="p-2 bg-gray-200 rounded-full flex justify-start items-center">
                                  <Icon
                                    name="inventory_2"
                                    size={24}
                                   
                                    className="text-icon-tertiary"
                                   
                                  />
                                </div>
                              </div>

                              {/* Title and Description */}
                              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                                <div className="self-stretch text-lg font-semibold font-['Poppins'] leading-5 text-text-primary">
                                  {evaluacion.titulo}
                                </div>
                                <div className="self-stretch text-xs font-normal font-['Poppins'] leading-4 text-text-secondary">
                                  {evaluacion.tipo === 'examen' ? 'Examen' : 'Práctica Calificada'}
                                </div>
                              </div>

                              {/* Link Button */}
                              <button
                                disabled={disabled}
                                className={`p-1 rounded-lg inline-flex justify-center items-center gap-1.5 ${disabled ? 'cursor-not-allowed' : 'hover:bg-bg-accent-light transition-colors'}`}
                              >
                                <div className={`text-sm font-medium font-['Poppins'] leading-4 ${disabled ? 'text-text-disabled' : 'text-text-accent-primary'}`}>
                                  Ver Material
                                </div>
                                <Icon
                                  name="arrow_forward"
                                  size={16}
                                 
                                  className={disabled ? 'text-icon-disabled' : 'text-icon-accent-primary'}
                                />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="self-stretch p-12 bg-bg-secondary rounded-2xl border border-stroke-primary flex flex-col items-center justify-center gap-4">
                  <Icon name="history" size={64} className="text-icon-tertiary" />
                  <div className="text-center">
                    <p className="text-text-primary font-semibold mb-2">No hay ciclos anteriores</p>
                    <p className="text-text-secondary text-sm">Los ciclos anteriores aparecerán aquí una vez que finalices el ciclo actual</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Tab: Banco de Enunciados */}
          {activeTab === 'banco' && (
            <>
              <div className="self-stretch h-7 inline-flex justify-start items-center gap-4">
                <div className="text-text-primary text-xl font-semibold font-['Poppins'] leading-6">
                  Banco de Enunciados
                </div>
              </div>

              {bancoEnunciadosData[cursoId] ? (
                <div className="self-stretch grid grid-cols-3 gap-4">
                  {bancoEnunciadosData[cursoId].map((enunciado) => {
                    const getDificultadColor = (dificultad: string) => {
                      switch (dificultad) {
                        case 'basico': return 'bg-info-primary-solid/10';
                        case 'intermedio': return 'bg-warning-solid/10';
                        case 'avanzado': return 'bg-error-solid/10';
                        default: return 'bg-bg-tertiary';
                      }
                    };

                    const getDificultadTextColor = (dificultad: string) => {
                      switch (dificultad) {
                        case 'basico': return 'text-info-primary-solid';
                        case 'intermedio': return 'text-warning-solid';
                        case 'avanzado': return 'text-error-solid';
                        default: return 'text-text-secondary';
                      }
                    };

                    const getDificultadLabel = (dificultad: string) => {
                      switch (dificultad) {
                        case 'basico': return 'Básico';
                        case 'intermedio': return 'Intermedio';
                        case 'avanzado': return 'Avanzado';
                        default: return dificultad;
                      }
                    };

                    return (
                      <div
                        key={enunciado.id}
                        className="p-6 bg-bg-primary rounded-2xl outline outline-1 outline-offset-[-1px] outline-stroke-primary inline-flex flex-col justify-start items-end gap-4"
                      >
                        {/* Icon and Difficulty Badge */}
                        <div className="self-stretch inline-flex justify-between items-start">
                          <div className="p-2 bg-bg-accent-light rounded-full flex justify-start items-center">
                            <Icon
                              name="description"
                              size={24}
                             
                              className="text-icon-accent-primary"
                             
                            />
                          </div>
                          <div className="flex justify-start items-start">
                            <div className={`px-2.5 py-1.5 ${getDificultadColor(enunciado.dificultad)} rounded-full flex justify-center items-center gap-1`}>
                              <div className={`text-xs font-medium font-['Poppins'] leading-3 ${getDificultadTextColor(enunciado.dificultad)}`}>
                                {getDificultadLabel(enunciado.dificultad)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Title and Description */}
                        <div className="self-stretch flex flex-col justify-start items-start gap-1">
                          <div className="self-stretch text-lg font-semibold font-['Poppins'] leading-5 text-text-primary">
                            {enunciado.titulo}
                          </div>
                          <div className="self-stretch text-xs font-normal font-['Poppins'] leading-4 text-text-secondary">
                            {enunciado.tipo === 'examen' ? 'Examen' :
                              enunciado.tipo === 'tarea' ? 'Práctica' :
                                enunciado.tipo === 'quiz' ? 'Quiz' :
                                  enunciado.tipo === 'proyecto' ? 'Proyecto' : 'Material'}
                          </div>
                          <div className="self-stretch text-xs font-normal font-['Poppins'] leading-4 text-text-tertiary">
                            Tema: {enunciado.tema}
                          </div>
                        </div>

                        {/* Link Button */}
                        <button className="p-1 rounded-lg inline-flex justify-center items-center gap-1.5 hover:bg-bg-accent-light transition-colors">
                          <div className="text-sm font-medium font-['Poppins'] leading-4 text-text-accent-primary">
                            Descargar
                          </div>
                          <Icon
                            name="download"
                            size={16}
                           
                            className="text-icon-accent-primary"
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="self-stretch p-12 bg-bg-secondary rounded-2xl border border-stroke-primary flex flex-col items-center justify-center gap-4">
                  <Icon name="topic" size={64} className="text-icon-tertiary" />
                  <div className="text-center">
                    <p className="text-text-primary font-semibold mb-2">No hay enunciados disponibles</p>
                    <p className="text-text-secondary text-sm">El banco de enunciados estará disponible próximamente</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Utilidad para obtener el subtítulo correcto de una evaluación
function getEvaluacionSubtitulo(evaluacion: { tipo: string; titulo: string }): string {
  if (evaluacion.tipo === 'examen') {
    if (evaluacion.titulo.startsWith('EX')) {
      return evaluacion.titulo === 'EX1' ? 'Examen Parcial' : 'Examen Final';
    }
    return 'Examen';
  }
  if (evaluacion.tipo === 'tarea') {
    if (evaluacion.titulo.startsWith('PC')) {
      const num = evaluacion.titulo.replace('PC', '');
      return `Práctica Calificada ${num}`;
    }
    return 'Práctica Calificada';
  }
  if (evaluacion.tipo === 'quiz') {
    return 'Quiz';
  }
  if (evaluacion.tipo === 'proyecto') {
    return 'Proyecto';
  }
  return '';
}
