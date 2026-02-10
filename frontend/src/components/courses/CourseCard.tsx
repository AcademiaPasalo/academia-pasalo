import Icon from "../ui/Icon";

export interface CourseCardProps {
  /** Color de la banda superior/lateral del curso */
  headerColor: string;
  /** Categoría del curso (ej: "CIENCIAS", "HUMANIDADES") */
  category: string;
  /** Ciclo del curso (ej: "1° CICLO", "2° CICLO") */
  cycle: string;
  /** Título del curso */
  title: string;
  /** Lista de docentes del curso */
  teachers: Array<{
    /** Iniciales del docente */
    initials: string;
    /** Nombre completo del docente */
    name: string;
    /** Color de fondo del avatar */
    avatarColor?: string;
  }>;
  /** Función callback al hacer clic en "Ver Curso" */
  onViewCourse?: () => void;
  /** Variante de visualización: 'grid' (tarjetas) o 'list' (lista horizontal) */
  variant?: 'grid' | 'list';
}

/**
 * Componente de tarjeta de curso reutilizable
 * Muestra información del curso con diseño modular y responsive
 * Soporta dos vistas: grid (tarjetas verticales) y list (tarjetas horizontales)
 */
export default function CourseCard({
  headerColor,
  category,
  cycle,
  title,
  teachers,
  onViewCourse,
  variant = 'grid',
}: CourseCardProps) {
  // Vista de Lista (horizontal)
  if (variant === 'list') {
    return (
      <div className="bg-white rounded-2xl border border-stroke-primary overflow-hidden flex items-center">
        {/* Banda de color lateral */}
        <div className="w-10 self-stretch rounded-tl-2xl rounded-bl-2xl" style={{ backgroundColor: headerColor }}></div>

        {/* Contenido del card */}
        <div className="flex-1 p-4 flex items-center gap-4">
          {/* Información del curso y docentes */}
          <div className="flex-1 flex flex-col gap-2">
            {/* Tags y título */}
            <div className="flex flex-col gap-2">
              {/* Tags: Categoría y Ciclo */}
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-1 bg-success-light rounded-full text-[10px] font-medium text-success-primary leading-3">
                  {category}
                </span>
                <span className="px-2 py-1 bg-bg-tertiary rounded-full text-[10px] font-medium text-secondary leading-3">
                  {cycle}
                </span>
              </div>

              {/* Título del curso */}
              <h3 className="text-lg font-semibold text-primary leading-5 line-clamp-1">
                {title}
              </h3>
            </div>

            {/* Información del/los docente(s) */}
            <div className="flex items-center gap-2">
              {/* Avatar(es) */}
              {teachers.length === 1 ? (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: teachers[0].avatarColor || '#10b981' }}
                >
                  <span className="text-[10px] font-medium text-white leading-3">
                    {teachers[0].initials}
                  </span>
                </div>
              ) : (
                <div className="w-10 h-6 relative">
                  <div
                    className="w-6 h-6 absolute left-0 top-0 rounded-full border-2 border-white flex items-center justify-center z-10"
                    style={{ backgroundColor: teachers[0].avatarColor || '#10b981' }}
                  >
                    <span className="text-[10px] font-medium text-white leading-3">
                      {teachers[0].initials}
                    </span>
                  </div>
                  <div
                    className="w-6 h-6 absolute left-[18px] top-0 rounded-full border border-black flex items-center justify-center"
                    style={{ backgroundColor: teachers[1]?.avatarColor || '#3b82f6' }}
                  >
                    <span className="text-[10px] font-medium text-white leading-3">
                      {teachers[1]?.initials}
                    </span>
                  </div>
                </div>
              )}

              {/* Nombre(s) del/los docente(s) */}
              <div className="flex-1 flex items-start gap-1">
                <span className="text-base font-medium text-secondary leading-4">Docente:</span>
                <span className="flex-1 text-base text-secondary leading-4 line-clamp-1">
                  {teachers.map((t) => t.name).join(' & ')}
                </span>
              </div>
            </div>
          </div>

          {/* Botón Ver Curso */}
          <button
            onClick={onViewCourse}
            className="px-4 py-3 bg-accent-solid rounded-lg text-sm font-medium text-white hover:bg-accent-solid-hover transition-colors flex items-center justify-center gap-1"
          >
            <span>Ver Curso</span>
            <Icon name="arrow_forward" size={14} className="text-white" />
          </button>
        </div>
      </div>
    );
  }

  // Vista de Galería (vertical/tarjetas)
  return (
    <div className="bg-white rounded-2xl border border-stroke-primary overflow-hidden flex flex-col h-full">
      {/* Banda de color superior */}
      <div className="h-16 flex-shrink-0" style={{ backgroundColor: headerColor }}></div>

      {/* Contenido del card - usando flex con justify-between para empujar el footer abajo */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-4">
        {/* Información del curso - pegado arriba */}
        <div className="space-y-2.5">
          {/* Tags: Categoría y Ciclo */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1.5 bg-success-light rounded-full text-xs font-medium text-success-primary">
              {category}
            </span>
            <span className="px-2.5 py-1.5 bg-bg-tertiary rounded-full text-xs font-medium text-secondary">
              {cycle}
            </span>
          </div>

          {/* Título del curso */}
          <h3 className="text-xl font-semibold text-primary line-clamp-2">
            {title}
          </h3>
        </div>

        {/* Footer: Docente(s) y botón - pegado abajo */}
        <div className="space-y-5">
          {/* Información del/los docente(s) */}
          <div className="flex items-center gap-2">
            {/* Avatar(es) */}
            {teachers.length === 1 ? (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: teachers[0].avatarColor || '#10b981' }}
              >
                <span className="text-[10px] font-medium text-white">
                  {teachers[0].initials}
                </span>
              </div>
            ) : (
              <div className="flex items-center -space-x-2 flex-shrink-0">
                {teachers.map((teacher, index) => (
                  <div
                    key={index}
                    className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-white ${index === 0 ? 'z-10' : ''
                      }`}
                    style={{ backgroundColor: teacher.avatarColor || '#10b981' }}
                  >
                    <span className="text-[10px] font-medium text-white">
                      {teacher.initials}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Nombre(s) del/los docente(s) */}
            <div className="flex-1 flex items-start gap-1 min-w-0">
              <span className="text-base font-medium text-secondary flex-shrink-0">Docente:</span>
              <span className="flex-1 text-base text-secondary truncate">
                {teachers.map((t) => t.name).join(' & ')}
              </span>
            </div>
          </div>

          {/* Botón Ver Curso */}
          <button
            onClick={onViewCourse}
            className="w-full px-4 py-3 bg-accent-solid rounded-lg text-sm font-medium text-white hover:bg-accent-solid-hover transition-colors flex items-center justify-center gap-1"
          >
            <span>Ver Curso</span>
            <Icon name="arrow_forward" size={14} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
