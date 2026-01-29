'use client';

import { useState } from 'react';
import Image from 'next/image';
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
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  return (
    <aside
      className={`${isCollapsed ? 'w-[68px]' : 'w-[240px]'} flex flex-col transition-all duration-300 border-r border-stroke-secondary`}
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
                className={`flex items-center ${isCollapsed ? 'justify-center px-3' : 'gap-2 px-2'} py-2 ${item.active
                  ? 'bg-[#1E40AF] text-white'
                  : 'text-secondary hover:bg-gray-50'
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
              <a
                href={item.href}
                className={`flex items-center ${isCollapsed ? 'justify-center px-3' : 'gap-2 px-2'} py-2 ${item.active
                  ? 'bg-accent-solid text-white'
                  : 'text-secondary hover:bg-gray-50'
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
              </a>
            )}

            {/* Sub-items */}
            {!isCollapsed && item.expandable && expandedItems.includes(item.label) && item.subItems && (
              <div className="ml-4 mt-1 space-y-1">
                {item.subItems.map((subItem, subIndex) => (
                  <a
                    key={subIndex}
                    href={subItem.href}
                    className="flex items-center gap-3 px-4 py-2 text-[#6B7280] hover:bg-gray-50 rounded-lg text-sm transition-colors"
                  >
                    <Icon 
                      name={subItem.icon} 
                      size={20}
                      variant={subItem.iconVariant}
                      filled={subItem.iconFilled}
                    />
                    {subItem.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-5">
        <button className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} hover:bg-gray-50 rounded-xl transition-colors`}>
          <div
            className={`w-10 h-10 ${user.avatarColor || 'bg-[#7C3AED]'} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
          >
            {user.initials}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[#111827] font-medium truncate">{user.name}</p>
            </div>
          )}
          {!isCollapsed && (
            <Icon name="unfold_more" size={20} className="text-[#6B7280]" />
          )}
        </button>
      </div>
    </aside>
  );
}
