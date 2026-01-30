'use client';

import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import type { RoleCode } from '@/types/api';

interface ProfileSectionProps {
  isCollapsed: boolean;
}

const roleLabels: Record<RoleCode, string> = {
  STUDENT: 'Alumno',
  TEACHER: 'Docente',
  ADMIN: 'Administrador',
  SUPER_ADMIN: 'Super Admin',
};

const roleColors: Record<RoleCode, string> = {
  STUDENT: 'bg-blue-100 text-blue-700',
  TEACHER: 'bg-green-100 text-green-700',
  ADMIN: 'bg-purple-100 text-purple-700',
  SUPER_ADMIN: 'bg-red-100 text-red-700',
};

export default function ProfileSection({ isCollapsed }: ProfileSectionProps) {
  const { user } = useAuth();

  if (!user || isCollapsed) return null;

  const fullName = `${user.firstName} ${user.lastName1 || ''} ${user.lastName2 || ''}`.trim();
  const primaryRole = user.roles[0]; // Mostrar el primer rol

  return (
    <div className="px-3 py-4 border-b border-gray-200">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {user.profilePhotoUrl ? (
            <Image
              src={user.profilePhotoUrl}
              alt={fullName}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-deep-blue-100 flex items-center justify-center">
              <span className="text-deep-blue-700 font-semibold text-base">
                {user.firstName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {/* Status indicator */}
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {fullName}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                roleColors[primaryRole.code]
              }`}
            >
              {roleLabels[primaryRole.code]}
            </span>
            {user.roles.length > 1 && (
              <span className="text-xs text-gray-500 font-medium">
                +{user.roles.length - 1}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
