'use client';

import Icon from "../ui/Icon";

export interface BreadcrumbItem {
  icon?: string;
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onToggleSidebar?: () => void;
  showToggle?: boolean;
}

export default function Breadcrumb({
  items,
  onToggleSidebar,
  showToggle = true
}: BreadcrumbProps) {
  return (
    <div className="flex items-center">
      {/* Toggle Sidebar Button */}
      {showToggle && (
        <button
          onClick={onToggleSidebar}
          className="flex items-center justify-center w-9 h-9 hover:bg-secondary-hover rounded-lg transition-colors mr-2"
          aria-label="Toggle Sidebar"
        >
          <Icon name="bottom_navigation" size={20} variant="rounded" className="text-tertiary" />
        </button>
      )}

      {/* Breadcrumb Items */}
      <div className="pl-5 border-l border-stroke-secondary flex items-center gap-2 text-sm">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && (
              <Icon name="chevron_right" size={16} className="text-tertiary" />
            )}
            {item.href ? (
              <a
                href={item.href}
                className="flex items-center gap-1 hover:text-accent-solid transition-colors"
              >
                {item.icon && (
                  <Icon name={item.icon} size={18} className="text-accent-solid" />
                )}
                <span className={`font-medium ${index === items.length - 1 ? 'text-accent-solid' : 'text-secondary'}`}>
                  {item.label}
                </span>
              </a>
            ) : (
              <div className="flex items-center gap-1">
                <span className="font-medium text-secondary">{item.label}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
