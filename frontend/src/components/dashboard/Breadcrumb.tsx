'use client';

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
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-2"
          aria-label="Toggle Sidebar"
        >
          <span className="material-symbols-outlined text-gray-600 text-[20px]">menu</span>
        </button>
      )}

      {/* Breadcrumb Items */}
      <div className="pl-2 border-l border-gray-200 flex items-center gap-2 text-sm">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && (
              <span className="material-symbols-outlined text-gray-400 text-[16px]">
                chevron_right
              </span>
            )}
            {item.href ? (
              <a 
                href={item.href}
                className="flex items-center gap-1 hover:text-deep-blue-700 transition-colors"
              >
                {item.icon && (
                  <span className="material-symbols-outlined text-deep-blue-600 text-[18px]">
                    {item.icon}
                  </span>
                )}
                <span className={`font-medium ${index === items.length - 1 ? 'text-deep-blue-600' : 'text-gray-600'}`}>
                  {item.label}
                </span>
              </a>
            ) : (
              <div className="flex items-center gap-1">
                {item.icon && (
                  <span className="material-symbols-outlined text-deep-blue-600 text-[18px]">
                    {item.icon}
                  </span>
                )}
                <span className="font-medium text-deep-blue-600">{item.label}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
