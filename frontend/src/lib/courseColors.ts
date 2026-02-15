// ============================================
// COURSE COLORS - Utilidad para asignar colores consistentes a cursos
// ============================================

/**
 * Paleta de colores para cursos
 * Usa valores hexadecimales directos del design system
 * - primary: color intenso para bordes, texto y acentos
 * - secondary: color pastel/claro para fondos
 */
const COURSE_COLOR_PALETTE = [
  {
    name: 'deep-blue',
    primary: '#1E40A3',
    secondary: '#F2F4FA',
  },
  {
    name: 'vivid-pink',
    primary: '#F13072',
    secondary: '#FEF3F7',
  },
  {
    name: 'light-green',
    primary: '#10B981',
    secondary: '#F1FBF8',
  },
  {
    name: 'charcoal-blue',
    primary: '#3B82F6',
    secondary: '#F3F8FF',
  },
  {
    name: 'dark-pink',
    primary: '#BE185D',
    secondary: '#FDF6F9',
  },
  {
    name: 'neon-green',
    primary: '#16E361',
    secondary: '#F2FCF6',
  },
  {
    name: 'soft-blue',
    primary: '#60A5FA',
    secondary: '#F3F8FF',
  },
  {
    name: 'lavender',
    primary: '#E692FF',
    secondary: '#FDF7FF',
  },
  {
    name: 'purple',
    primary: '#9333EA',
    secondary: '#F9F3FE',
  },
  {
    name: 'dark-orange',
    primary: '#D97706',
    secondary: '#FDF7F0',
  },
  {
    name: 'pastel-pink',
    primary: '#EC92C1',
    secondary: '#FEF5F9',
  },
  {
    name: 'bright-blue',
    primary: '#4F46E5',
    secondary: '#F5F4FE',
  },
  {
    name: 'dark-yellow',
    primary: '#FBBF24',
    secondary: '#FFFAEE',
  },
  {
    name: 'scarlet-red',
    primary: '#D32F2F',
    secondary: '#FDF3F3',
  },
  {
    name: 'forest-green',
    primary: '#16A34A',
    secondary: '#F1FAF4',
  },
  {
    name: 'ocean-blue',
    primary: '#4071FA',
    secondary: '#F4F7FF',
  },
  {
    name: 'light-pink',
    primary: '#FFC8E3',
    secondary: '#FFF6FA',
  },
  {
    name: 'light-teal',
    primary: '#34D399',
    secondary: '#F3FDF9',
  },
  {
    name: 'orange',
    primary: '#F97316',
    secondary: '#FFF7F1',
  },
  {
    name: 'light-turquoise',
    primary: '#22D3EE',
    secondary: '#EEFCFE',
  },
  {
    name: 'bright-red',
    primary: '#FF5252',
    secondary: '#FFF2F2',
  },
  {
    name: 'dark-fuchsia',
    primary: '#DB4085',
    secondary: '#FCF0F6',
  },
  {
    name: 'soft-light-orange',
    primary: '#FFD59E',
    secondary: '#FFF8EF',
  },
  {
    name: 'lime-green',
    primary: '#A3E635',
    secondary: '#F8FDEF',
  },
  {
    name: 'vivid-purple',
    primary: '#9C27B0',
    secondary: '#F9F2FB',
  },
  {
    name: 'hot-pink',
    primary: '#F779A4',
    secondary: '#FFF5F8',
  },
  {
    name: 'yellow-orange',
    primary: '#F59E0B',
    secondary: '#FFF8EC',
  },
  {
    name: 'light-blue',
    primary: '#6366F1',
    secondary: '#F6F6FE',
  },
  {
    name: 'light-lavender',
    primary: '#E9C2FF',
    secondary: '#FCF7FF',
  },
  {
    name: 'pastel-green',
    primary: '#34D399',
    secondary: '#F3FDF9',
  },
] as const;

export type CourseColor = typeof COURSE_COLOR_PALETTE[number];

/**
 * Genera un hash numérico consistente a partir de un string
 * @param str - String para hashear (courseCode)
 * @returns Número hash
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convertir a entero de 32 bits
  }
  return Math.abs(hash);
}

/**
 * Obtiene el color asignado a un curso basándose en su código
 * Siempre devuelve el mismo color para el mismo courseCode
 * @param courseCode - Código del curso (ej: "MAT101")
 * @returns Objeto con primary (intenso) y secondary (pastel)
 */
export function getCourseColor(courseCode: string): CourseColor {
  const hash = hashString(courseCode);
  const index = hash % COURSE_COLOR_PALETTE.length;
  return COURSE_COLOR_PALETTE[index];
}

/**
 * Obtiene todos los colores disponibles
 */
export function getAllCourseColors(): readonly CourseColor[] {
  return COURSE_COLOR_PALETTE;
}
