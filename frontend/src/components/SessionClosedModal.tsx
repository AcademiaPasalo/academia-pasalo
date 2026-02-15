'use client';

import { useEffect, useState, useCallback } from 'react';
import { clearAuth } from '@/lib/storage';
import Icon from '@/components/ui/Icon';

const COUNTDOWN_SECONDS = 5;

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
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

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

  // Countdown → redirect
  useEffect(() => {
    if (!showModal) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showModal, handleRedirect]);

  if (!showModal) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
      style={{ backdropFilter: 'blur(4px)' }}
    >
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex flex-col items-center text-center">
          {/* Icono */}
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <Icon name="info" size={32} className="text-amber-600" />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Tu sesión ha sido cerrada
          </h3>

          <p className="text-gray-600 mb-4">
            Esto puede ocurrir por una de las siguientes razones:
          </p>

          <ul className="text-left text-sm text-gray-600 mb-6 space-y-2 w-full">
            <li className="flex items-start gap-2">
              <span className="text-amber-600 mt-0.5">•</span>
              <span>Iniciaste sesión en otro dispositivo</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 mt-0.5">•</span>
              <span>Tu sesión expiró por inactividad</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 mt-0.5">•</span>
              <span>Se detectó actividad sospechosa</span>
            </li>
          </ul>

          {/* Countdown */}
          <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              Redirigiendo en {countdown} segundo{countdown !== 1 ? 's' : ''}...
            </p>
          </div>

          <button
            onClick={handleRedirect}
            className="w-full px-6 py-3 bg-deep-blue-700 text-white rounded-lg font-medium hover:bg-deep-blue-800 transition-colors"
          >
            Iniciar sesión nuevamente
          </button>
        </div>
      </div>
    </div>
  );
}
