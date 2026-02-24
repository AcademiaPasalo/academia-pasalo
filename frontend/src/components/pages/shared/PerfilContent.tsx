'use client';

import { useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Icon from '@/components/ui/Icon';
import { useAuth } from '@/contexts/AuthContext';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { getRoleFriendlyName } from '@/components/dashboard/RoleSwitcher';

interface InfoRowProps {
  label: string;
  value: string | undefined | null;
  placeholder?: string;
}

function InfoRow({ label, value, placeholder = 'No registrado' }: InfoRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0 py-3">
      <span className="text-sm font-medium text-secondary w-44 flex-shrink-0">
        {label}
      </span>
      <span className={`text-sm ${value ? 'text-primary' : 'text-tertiary'}`}>
        {value || placeholder}
      </span>
    </div>
  );
}

export default function PerfilContent() {
  const { user } = useAuth();
  const { setBreadcrumbItems } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbItems([
      { icon: 'person', label: 'Mi Perfil' },
    ]);
  }, [setBreadcrumbItems]);

  if (!user) return null;

  const fullName = [user.firstName, user.lastName1, user.lastName2]
    .filter(Boolean)
    .join(' ');

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName1?.[0] ?? ''}`.toUpperCase();

  const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return format(date, "d 'de' MMMM, yyyy", { locale: es });
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-9">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Icon name="person" size={32} className="text-accent-secondary" />
        <h1 className="text-3xl font-semibold text-primary">Mi Perfil</h1>
      </div>

      {/* Grid layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">
        {/* Left: Profile summary card */}
        <div className="bg-white rounded-2xl border border-stroke-primary p-6 flex flex-col items-center gap-4 h-fit">
          {/* Avatar */}
          {user.profilePhotoUrl ? (
            <img
              src={user.profilePhotoUrl}
              alt={fullName}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 bg-info-primary-solid rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-white">{initials}</span>
            </div>
          )}

          {/* Name & email */}
          <div className="text-center space-y-1">
            <h2 className="text-xl font-semibold text-primary">{fullName}</h2>
            <p className="text-sm text-secondary">{user.email}</p>
          </div>

          {/* Role badges */}
          <div className="flex flex-wrap justify-center gap-2">
            {user.roles.map((role) => (
              <span
                key={role.code}
                className="px-3 py-1 bg-accent-light rounded-full text-xs font-medium text-accent-primary"
              >
                {getRoleFriendlyName(role.code)}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Details */}
        <div className="space-y-6">
          {/* Personal info card */}
          <div className="bg-white rounded-2xl border border-stroke-primary p-6">
            <h3 className="text-base font-semibold text-primary mb-1">
              Datos Personales
            </h3>
            <div className="divide-y divide-stroke-secondary">
              <InfoRow label="Nombre" value={user.firstName} />
              <InfoRow label="Apellido Paterno" value={user.lastName1} />
              <InfoRow label="Apellido Materno" value={user.lastName2} />
              <InfoRow label="Correo electrónico" value={user.email} />
              <InfoRow label="Teléfono" value={user.phone} />
              <InfoRow label="Carrera" value={user.career} />
            </div>
          </div>

          {/* Account info card */}
          <div className="bg-white rounded-2xl border border-stroke-primary p-6">
            <h3 className="text-base font-semibold text-primary mb-1">
              Información de Cuenta
            </h3>
            <div className="divide-y divide-stroke-secondary">
              <InfoRow
                label="Miembro desde"
                value={formatDate(user.createdAt)}
                placeholder="No disponible"
              />
              <InfoRow
                label="Última actualización"
                value={formatDate(user.updatedAt)}
                placeholder="Sin actualizaciones"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
