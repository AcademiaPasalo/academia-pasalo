/**
 * Material Symbols Icon Component
 * 
 * Estilos de Material Symbols (familias de fuentes):
 * - 'outlined': Bordes rectos, estilo limpio (default)
 * - 'rounded': Bordes redondeados, estilo suave
 * - 'sharp': Bordes angulares, estilo técnico
 * 
 * Relleno (se aplica a cualquier estilo):
 * - filled: true  → Ícono relleno/sólido (FILL=1)
 * - filled: false → Ícono con contorno (FILL=0, default)
 * 
 * Puedes combinar estilo + relleno:
 * 
 * Ejemplos de uso:
 * <Icon name="school" size={24} variant="outlined" filled />
 * <Icon name="home" size={20} variant="rounded" filled className="text-blue-500" />
 * <Icon name="star" size={18} variant="sharp" /> // outline por defecto
 * <Icon name="favorite" size={16} variant="rounded" filled /> // rounded + filled
 */

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  variant?: 'outlined' | 'rounded' | 'sharp';
  filled?: boolean;
}

export default function Icon({ 
  name, 
  size = 24, 
  className = '', 
  variant = 'outlined',
  filled = false
}: IconProps) {
  // Mapeo de variantes a las clases CSS de Google Material Symbols
  // Cada variante es una familia de fuente diferente
  const variantClass = {
    outlined: 'material-symbols-outlined',
    rounded: 'material-symbols-rounded',
    sharp: 'material-symbols-sharp',
  }[variant];

  return (
    <span 
      className={`${variantClass} ${className}`}
      style={{ 
        fontSize: `${size}px`,
        // FILL controla el relleno del ícono:
        // - FILL=0: contorno/outline (default)
        // - FILL=1: relleno/solid
        // Esto funciona con cualquiera de las 3 familias de fuentes
        ...(filled && { fontVariationSettings: "'FILL' 1" })
      }}
    >
      {name}
    </span>
  );
}
