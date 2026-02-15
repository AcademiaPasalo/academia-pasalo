'use client';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Desactivar cuenta de usuario
        </h3>
        <p className="text-gray-600 mb-6">
          Estás a punto de desactivar la cuenta de <strong>{userName}</strong>.
          Esta acción cerrará todas sus sesiones activas y le impedirá acceder
          a la plataforma hasta que un administrador reactive su cuenta.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Desactivando...' : 'Desactivar cuenta'}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
