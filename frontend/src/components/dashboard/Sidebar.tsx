'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import RoleSwitcher, { getRoleFriendlyName } from '@/components/dashboard/RoleSwitcher';
import { useAuth } from '@/contexts/AuthContext';

export interface SidebarNavItem {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
  expandable?: boolean;
  subItems?: SidebarNavItem[];
}

export interface SidebarUser {
  name: string;
  initials: string;
  role: string;
  avatarColor?: string;
}

export interface SidebarProps {
  user: SidebarUser;
  navItems: SidebarNavItem[];
  isCollapsed?: boolean;
}

export default function Sidebar({
  user,
  navItems,
  isCollapsed = false
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user: authUser, switchProfile } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Auto-expandir items cuando un subitem está activo (inicialización)
  const getInitialExpandedItems = () => {
    const itemsToExpand: string[] = [];
    navItems.forEach(item => {
      if (item.expandable && item.subItems) {
        const hasActiveSubItem = item.subItems.some(subItem =>
          pathname === subItem.href
        );
        if (hasActiveSubItem) {
          itemsToExpand.push(item.label);
        }
      }
    });
    return itemsToExpand;
  };

  const [expandedItems, setExpandedItems] = useState<string[]>(getInitialExpandedItems);

  // Actualizar items expandidos cuando cambia la ruta
  useEffect(() => {
    const itemsToExpand = getInitialExpandedItems();
    setExpandedItems(prev => {
      // Solo actualizar si hay cambios
      const hasChanges = itemsToExpand.some(item => !prev.includes(item)) ||
        prev.some(item => !itemsToExpand.includes(item));
      return hasChanges ? itemsToExpand : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Cerrar menú de usuario cuando se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isUserMenuOpen]);

  const toggleExpand = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const handleNavigation = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (href !== '#') {
      router.push(href);
    }
  };

  const handleLogout = async () => {
    try {
      setIsUserMenuOpen(false); // Cerrar el menú primero
      await logout();
      // El AuthContext ya maneja la redirección a /plataforma
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Incluso si hay error, intentar redirigir al login
      router.push('/plataforma');
    }
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleRoleChange = async (roleId: string) => {
    try {
      setIsSwitchingRole(true);
      await switchProfile(roleId);
      // La recarga de página se maneja en el contexto
    } catch (error) {
      console.error('Error al cambiar de rol:', error);
      setIsSwitchingRole(false);

      // Mostrar mensaje de error al usuario
      const errorMessage = error instanceof Error ? error.message : 'Error al cambiar de rol';
      alert(errorMessage); // Temporal, puedes reemplazar con un toast/notification component
    }
  };

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    // Usar mousedown para detener la propagación antes de que el document listener la capture
    if (authUser && authUser.roles && authUser.roles.length > 1) {
      e.stopPropagation();
      setIsRoleSwitcherOpen(prev => !prev);
    }
  };

  return (
    <aside
      className={`${isCollapsed ? 'w-[68px]' : 'w-[240px]'} flex flex-col transition-all duration-300 border-r border-stroke-secondary bg-white h-full`}
    >
      {/* Header: Logo + Role */}
      {isCollapsed ? (
        <div className="p-4 flex items-center justify-center">
          <Icon name="school" size={36} className="text-main" />
        </div>
      ) : (
        <div className="p-3 space-y-3">
          <div onMouseDown={handleHeaderMouseDown} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-primary-hover selected:bg-primary-selected cursor-pointer">
            {/* Icon Left */}
            <div className="flex-shrink-0 flex items-center justify-center h-11 w-11 rounded-lg p-1">
              <Icon name="school" size={36} className="text-main" />
            </div>

            {/* Logo + Role Right */}
            <div className="flex-1">
              <Image
                src="/foundations/brand-assets/logotipo.svg"
                alt="PÁSALO ACADEMIA"
                width={72}
                height={22.8}
                className="object-contain mb-1"
              />
              <p className="text-secondary text-xs">
                {authUser && authUser.roles && authUser.roles.length > 0 
                  ? (() => {
                      const activeRoleId = authUser.lastActiveRoleId || authUser.roles[0]?.id || authUser.roles[0]?.code || '';
                      const activeRole = authUser.roles.find(r => (r.id || r.code) === activeRoleId);
                      return activeRole ? getRoleFriendlyName(activeRole.code) : 'Alumno';
                    })()
                  : 'Alumno'
                }
              </p>
            </div>

            {/* Role Switcher */}
            {authUser && authUser.roles && authUser.roles.length > 1 && (
              <RoleSwitcher
                roles={authUser.roles}
                activeRoleId={authUser.lastActiveRoleId || authUser.roles[0]?.id || authUser.roles[0]?.code || ''}
                onRoleChange={handleRoleChange}
                isLoading={isSwitchingRole}
                isOpen={isRoleSwitcherOpen}
                onOpenChange={(open) => setIsRoleSwitcherOpen(open)}
              />
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-3 flex-1 space-y-1">
        {navItems.map((item, index) => {
          // Verificar si algún subitem está activo
          const hasActiveSubItem = item.expandable && item.subItems?.some(subItem => subItem.active);

          return (
            <div key={index}>
              {item.expandable ? (
                <button
                  onClick={() => toggleExpand(item.label)}
                  className={`h-[43px] w-full flex items-center ${isCollapsed ? 'justify-center px-3' : 'justify-between px-2'} py-2 ${
                    // Solo aplicar bg-accent-solid si el item está activo Y NO tiene subitems activos
                    item.active && !hasActiveSubItem
                      ? 'bg-accent-solid text-white'
                      : 'text-secondary hover:bg-secondary-hover'
                    } rounded-xl font-medium transition-colors`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      name={item.icon}
                      size={24}
                    />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                  {!isCollapsed && (
                    <Icon
                      name="expand_more"
                      size={20}
                      className={`transition-transform ${expandedItems.includes(item.label) ? 'rotate-180' : ''}`}
                    />
                  )}
                </button>
              ) : (
                <button
                  onClick={(e) => handleNavigation(item.href, e)}
                  className={`h-[43px] w-full flex items-center ${isCollapsed ? 'justify-center px-3' : 'gap-2 px-2'} py-2 ${item.active
                    ? 'bg-accent-solid text-white'
                    : 'text-secondary hover:bg-secondary-hover'
                    } rounded-xl font-medium transition-colors`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    name={item.icon}
                    size={24}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              )}

              {/* Sub-items */}
              {!isCollapsed && item.expandable && item.subItems && (
                <div
                  className={`ml-[18px] border-l border-stroke-primary pl-2.5 overflow-hidden transition-all duration-300 ease-in-out ${expandedItems.includes(item.label)
                    ? 'max-h-[500px] opacity-100 mt-1'
                    : 'max-h-0 opacity-0'
                    }`}
                >
                  <div className="space-y-1">
                    {item.subItems.map((subItem, subIndex) => {
                      // Verificar si este subitem está activo comparando con pathname
                      const isSubItemActive = pathname === subItem.href;

                      return (
                        <button
                          key={subIndex}
                          onClick={(e) => handleNavigation(subItem.href, e)}
                          className={`w-full font-medium flex items-center justify-start gap-3 px-4 py-2 text-left ${isSubItemActive
                            ? 'text-white bg-accent-solid'
                            : 'text-secondary hover:bg-secondary-hover'
                            } rounded-lg text-sm transition-colors`}
                        >
                          {subItem.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-5 relative" ref={userMenuRef}>
        <button
          onClick={toggleUserMenu}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} rounded-xl transition-colors hover:bg-secondary-hover p-2`}
        >
          {authUser?.profilePhotoUrl ? (
            <img
              src={authUser.profilePhotoUrl}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-9 h-9 bg-info-primary-solid rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user.initials}
            </div>
          )}
          {!isCollapsed && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm text-primary truncate">{user.name}</p>
            </div>
          )}
          {!isCollapsed && (
            <Icon
              name="unfold_more"
              size={20}
              className={`text-tertiary transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
            />
          )}
        </button>

        {/* Menú desplegable */}
        {isUserMenuOpen && !isCollapsed && (
          <div className="absolute bottom-full left-5 right-5 bg-white border border-stroke-primary rounded-xl overflow-hidden">
            <button
              onClick={() => {
                setIsUserMenuOpen(false);
                router.push('/plataforma/perfil');
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-secondary hover:bg-secondary-hover transition-colors"
            >
              <Icon name="person" size={20} />
              <span className="text-sm font-medium">Mi Perfil</span>
            </button>
            <div className="border-t border-stroke-primary" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-error-solid hover:bg-error-hover transition-colors"
            >
              <Icon name="logout" size={20} />
              <span className="text-sm font-medium">Cerrar Sesión</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
