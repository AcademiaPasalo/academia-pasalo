'use client';

import Icon from '../ui/Icon';

export interface TopBarUser {
  name: string;
  initials: string;
  role: string;
  avatarColor?: string;
  isOnline?: boolean;
}

export interface TopBarProps {
  user: TopBarUser;
  showNotifications?: boolean;
  notificationCount?: number;
  onNotificationClick?: () => void;
  onUserClick?: () => void;
}

export default function TopBar({
  user,
  showNotifications = true,
  notificationCount = 0,
  onNotificationClick,
  onUserClick
}: TopBarProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Notifications */}
      {showNotifications && (
        <button 
          className="relative flex items-center justify-center w-9 h-9 hover:bg-secondary-hover rounded-lg transition-colors"
          onClick={onNotificationClick}
          aria-label="Notificaciones"
        >
          <Icon name="notifications" size={22} className="text-secondary" />
          {notificationCount > 0 && (
            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-error-solid rounded-full"></div>
          )}
        </button>
      )}

      {/* User Profile */}
      <button
        onClick={onUserClick}
        className="flex items-center gap-3 hover:bg-secondary-hover rounded-lg p-1 pr-2 transition-colors"
      >
        <div className="text-right">
          <p className="text-sm font-semibold text-primary">{user.name}</p>
          <p className="text-xs text-secondary">{user.role}</p>
        </div>
        <div className={`w-10 h-10 ${user.avatarColor || 'bg-info-primary-solid'} rounded-full flex items-center justify-center text-white font-bold text-sm relative`}>
          {user.initials}
          {user.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-success-solid border-2 border-white rounded-full"></div>
          )}
        </div>
      </button>
    </div>
  );
}
