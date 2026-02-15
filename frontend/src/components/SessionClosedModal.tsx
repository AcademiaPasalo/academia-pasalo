'use client';

import { useEffect, useState, useCallback } from 'react';
import { clearAuth } from '@/lib/storage';

/**
 * Modal que se muestra cuando la sesión ha sido cerrada remotamente
 * (ej. sesión cerrada en otro dispositivo o token expirado)
 *
 * Este modal bloquea toda interacción y controla el flujo de redirect.
 * clearAuth() se llama aquí (no en apiClient) para evitar que
 * DashboardLayout redirija antes de que el usuario vea el mensaje.
 */
export default function SessionClosedModal() {
  const [showModal, setShowModal] = useState(false);

  const handleRedirect = useCallback(() => {
    clearAuth();
    window.location.href = '/plataforma';
  }, []);

  useEffect(() => {
    const handleSessionClosed = () => {
      setShowModal(true);
    };

    window.addEventListener('session-closed-remotely', handleSessionClosed);

    return () => {
      window.removeEventListener('session-closed-remotely', handleSessionClosed);
    };
  }, []);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Tu sesión ha sido cerrada
        </h3>
        <p className="text-gray-600 mb-6">
          Esto puede ocurrir porque iniciaste sesión en otro dispositivo, tu sesión expiró por inactividad, o se detectó actividad sospechosa.
        </p>
        <button
          onClick={handleRedirect}
          className="w-full px-4 py-2 bg-deep-blue-700 text-white rounded-lg hover:bg-deep-blue-800 transition-colors"
        >
          Iniciar sesión nuevamente
        </button>
      </div>
    </div>
  );
}
