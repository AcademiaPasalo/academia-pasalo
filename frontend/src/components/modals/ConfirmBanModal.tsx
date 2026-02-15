'use client';

import Icon from '@/components/ui/Icon';

interface ConfirmBanModalProps {
  isOpen: boolean;
  userName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmBanModal({
  isOpen,
  userName,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmBanModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={!loading ? onCancel : undefined}
      />

      {/* Modal */}
      <div className="relative bg-bg-primary rounded-2xl border border-stroke-primary p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-warning-secondary flex items-center justify-center">
            <Icon name="warning" size={28} className="text-warning-solid" />
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-text-primary">
              Desactivar cuenta de usuario
            </h3>
            <p className="text-sm text-text-secondary">
              Estás a punto de desactivar la cuenta de <strong>{userName}</strong>.
              Esta acción cerrará todas sus sesiones activas y le impedirá acceder
              a la plataforma hasta que un administrador reactive su cuenta.
            </p>
          </div>

          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg border border-stroke-primary text-text-primary text-sm font-medium hover:bg-bg-secondary transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-error-solid text-white text-sm font-medium hover:bg-error-solid/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Desactivando...' : 'Desactivar cuenta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
