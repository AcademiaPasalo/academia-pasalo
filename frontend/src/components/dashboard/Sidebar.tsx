'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';

export interface SidebarNavItem {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
  expandable?: boolean;
  subItems?: SidebarNavItem[];
  // Propiedades opcionales para personalizar el ícono
  iconVariant?: 'outlined' | 'rounded' | 'sharp';
  iconFilled?: boolean;
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

  return (
    <aside
      className={`${isCollapsed ? 'w-[68px]' : 'w-[240px]'} flex flex-col transition-all duration-300 border-r border-stroke-secondary bg-white h-full`}
    >
      {/* Header: Logo + Role */}
      {isCollapsed ? (
        <div className="p-4 flex items-center justify-center">
          <Icon name="school" size={36} variant="rounded" filled className="text-main" />
        </div>
      ) : (
        <div className="p-5 flex items-start gap-2.5">
          {/* Icon Left */}
          <div className="flex-shrink-0 flex items-center justify-center h-11 w-11 rounded-lg p-1">
            <Icon name="school" size={36} variant="rounded" filled className="text-main" />
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
            <p className="text-secondary text-xs">Alumno</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-3 flex-1 space-y-1">
        {navItems.map((item, index) => (
          <div key={index}>
            {item.expandable ? (
              <button
                onClick={() => toggleExpand(item.label)}
                className={`h-[43px] w-full flex items-center ${isCollapsed ? 'justify-center px-3' : 'justify-between px-2'} py-2 ${item.active
                  ? 'bg-accent-solid text-white'
                  : 'text-secondary hover:bg-secondary-hover'
                  } rounded-xl font-medium transition-colors`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    name={item.icon}
                    size={24}
                    variant={item.iconVariant}
                    filled={item.iconFilled}
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
                  variant={item.iconVariant}
                  filled={item.iconFilled}
                />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            )}

            {/* Sub-items */}
            {!isCollapsed && item.expandable && item.subItems && (
              <div
                className={`ml-[18px] border-l border-stroke-primary pl-2.5 overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedItems.includes(item.label)
                    ? 'max-h-[500px] opacity-100 mt-1'
                    : 'max-h-0 opacity-0'
                }`}
              >
                <div className="space-y-1">
                  {item.subItems.map((subItem, subIndex) => (
                    <button
                      key={subIndex}
                      onClick={(e) => handleNavigation(subItem.href, e)}
                      className={`w-full font-medium flex items-center justify-start gap-3 px-4 py-2 text-left ${
                      subItem.active 
                        ? 'text-accent-solid bg-accent-hover' 
                        : 'text-secondary hover:bg-secondary-hover'
                      } rounded-lg text-sm transition-colors`}
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-5">
        <button className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} rounded-xl transition-colors`}>
          <div
            className={`w-9 h-9 bg-info-primary-solid rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
          >
            {user.initials}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm text-primary truncate">{user.name}</p>
            </div>
          )}
          {!isCollapsed && (
            <Icon name="unfold_more" size={20} className="text-tertiary" />
          )}
        </button>
      </div>
    </aside>
  );
}
