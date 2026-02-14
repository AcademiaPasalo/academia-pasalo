'use client';

import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/Icon';
import { Role } from '@/types/api';

interface RoleSwitcherProps {
  roles: Role[];
  activeRoleId: string;
  onRoleChange: (roleId: string) => void;
  isLoading?: boolean;
  isOpen?: boolean; // control opcional desde el padre
  onOpenChange?: (open: boolean) => void;
}

// Mapeo de códigos de rol a nombres amigables
const roleNames: Record<string, string> = {
  STUDENT: 'Alumno',
  PROFESSOR: 'Docente',
  ADMIN: 'Administrador',
  SUPER_ADMIN: 'Superadministrador',
};

// Orden de presentación de roles (por jerarquía)
const roleOrder: Record<string, number> = {
  STUDENT: 1,
  PROFESSOR: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
};

const roleIcons: Record<string, string> = {
  STUDENT: 'school',
  PROFESSOR: 'work',
  ADMIN: 'admin_panel_settings',
  SUPER_ADMIN: 'security',
};

/**
 * Obtiene el nombre amigable de un rol dado su código
 * @param code - Código del rol (STUDENT, PROFESSOR, ADMIN, SUPER_ADMIN)
 * @returns Nombre amigable del rol en español
 */
export function getRoleFriendlyName(code: string): string {
  return roleNames[code] || code;
}

export default function RoleSwitcher({
  roles,
  activeRoleId,
  onRoleChange,
  isLoading = false,
  isOpen: isOpenProp,
  onOpenChange,
}: RoleSwitcherProps) {
  const [isOpenState, setIsOpenState] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isControlled = typeof isOpenProp === 'boolean';
  const open = isControlled ? isOpenProp : isOpenState;

  // Cerrar el dropdown cuando se hace clic fuera
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      // Verificar si el click fue dentro del dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isControlled && typeof onOpenChange === 'function') {
          onOpenChange(false);
        } else {
          setIsOpenState(false);
        }
      }
    }

    // Usar un pequeño delay para evitar que el click inicial cierre inmediatamente el dropdown
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, isControlled, onOpenChange]);

  // Si solo hay un rol, no mostrar el selector
  if (roles.length <= 1) {
    return null;
  }

  // TEMPORAL: Mientras el backend no retorne IDs, usar codes
  // Verificar si los roles tienen IDs válidos
  const hasValidIds = roles.some(role => role.id && role.id.length > 0);
  
  // Si no hay IDs válidos, mostrar advertencia pero permitir usar codes
  if (!hasValidIds) {
    console.warn('⚠️ RoleSwitcher: Los roles no tienen IDs. Usando codes temporalmente. El backend debe incluir "id" en cada rol.');
  }

  // Encontrar el rol activo usando id o code como fallback (no usado internamente aquí)

  const setOpen = (value: boolean) => {
    if (isControlled) {
      onOpenChange?.(value);
    } else {
      setIsOpenState(value);
    }
  };

  const handleRoleClick = (roleId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (roleId !== activeRoleId && !isLoading) {
      onRoleChange(roleId);
      // Cerrar el dropdown después de cambiar el rol
      // Usamos un pequeño delay para permitir que la animación se complete
      setTimeout(() => {
        setOpen(false);
      }, 100);
    }
  };

  const toggleOpen = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setOpen(!open);
  };

  // Ordenar roles por jerarquía
  const sortedRoles = [...roles].sort((a, b) => {
    const orderA = roleOrder[a.code] || 999;
    const orderB = roleOrder[b.code] || 999;
    return orderA - orderB;
  });

  // Obtener el nombre amigable del rol activo para mostrar en el header cuando esté colapsado
  const activeRole = roles.find(r => (r.id || r.code) === activeRoleId);
  const activeRoleName = activeRole ? (roleNames[activeRole.code] || activeRole.name) : '';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleOpen}
        disabled={isLoading}
        className={`flex items-center`}
        title={`Cambiar rol (${activeRoleName})`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Icon 
          name='unfold_more' 
          size={16} 
          className="text-accent-primary" 
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div 
          className="absolute top-full mt-[-28] left-8 w-60 bg-white rounded-xl shadow-xl z-50"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="self-stretch p-3 inline-flex justify-center items-center gap-2.5">
            <div className="flex-1 text-center text-secondary text-sm font-normal leading-4 truncate">
              Roles
            </div>
          </div>

          {/* Roles List */}
          <div className="self-stretch px-2 pb-2 flex flex-col justify-start items-start gap-1">
            {sortedRoles.map((role, index) => {
              // Usar id si existe, sino usar code
              const roleIdentifier = role.id || role.code;
              const isActive = roleIdentifier === activeRoleId || role.code === activeRoleId;
              const friendlyName = roleNames[role.code] || role.name;
              
              return (
                <button
                  key={role.id || `${role.code}-${index}`}
                  onClick={(e) => handleRoleClick(roleIdentifier, e)}
                  disabled={isActive || isLoading}
                  className={`
                    self-stretch p-2 rounded-lg inline-flex justify-start items-center gap-2 
                    transition-all duration-150
                    ${
                      isActive
                        ? 'bg-gray-200 shadow-sm'
                        : 'bg-white hover:bg-secondary-hover active:bg-secondary-pressed'
                    } 
                    ${isLoading && !isActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex-1 flex justify-start items-center gap-2">
                    {/* Icon Container */}
                    <div className={`
                      p-1 rounded-md inline-flex flex-col justify-center items-center 
                      transition-all duration-150 outline-stroke-primary
                      ${
                        isActive 
                          ? 'outline outline-1 outline-offset-[-1px] bg-gray-200' 
                          : 'outline outline-1 outline-offset-[-1px] bg-transparent'
                      }
                    `}>
                      <Icon 
                        name={roleIcons[role.code]} 
                        size={16} 
                        className={isActive ? 'text-tertiary-pressed' : 'text-tertiary'} 
                      />
                    </div>
                    
                    {/* Role Name */}
                    <div className={`
                      flex-1 text-left text-base font-medium leading-4 truncate 
                      transition-colors duration-150
                      ${isActive ? 'text-tertiary-pressed' : 'text-secondary'}
                    `}>
                      {friendlyName}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
