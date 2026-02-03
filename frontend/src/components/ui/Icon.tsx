/**
 * Material Icons Component
 * 
 * Componente para usar Material Icons con dos variantes disponibles:
 * - 'rounded': Bordes redondeados (default)
 * - 'outlined': Bordes rectos
 * 
 * Ejemplos de uso:
 * <Icon name="school" size={24} />
 * <Icon name="home" size={20} variant="outlined" className="text-blue-500" />
 * <Icon name="favorite" size={16} variant="rounded" />
 */

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  variant?: 'rounded' | 'outlined';
}

export default function Icon({ 
  name, 
  size = 24, 
  className = '',
  variant = 'rounded'
}: IconProps) {
  const variantClass = variant === 'outlined' 
    ? 'material-icons-outlined' 
    : 'material-icons-round';

  return (
    <span 
      className={`${variantClass} ${className}`}
      style={{ fontSize: `${size}px` }}
    >
      {name}
    </span>
  );
}
