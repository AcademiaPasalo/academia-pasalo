'use client';

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
          className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          onClick={onNotificationClick}
        >
          <span className="material-symbols-outlined text-gray-600 text-[22px]">notifications</span>
          {notificationCount > 0 && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
          )}
        </button>
      )}

      {/* User Profile */}
      <button
        onClick={onUserClick}
        className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-1 pr-2 transition-colors"
      >
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500">{user.role}</p>
        </div>
        <div className={`w-10 h-10 ${user.avatarColor || 'bg-purple-600'} rounded-full flex items-center justify-center text-white font-bold text-sm relative`}>
          {user.initials}
          {user.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
      </button>
    </div>
  );
}
