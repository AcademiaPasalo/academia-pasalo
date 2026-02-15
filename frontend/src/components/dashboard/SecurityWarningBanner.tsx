'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';

const STORAGE_KEY = 'pasalo_security_warning';

export default function SecurityWarningBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem(STORAGE_KEY) === 'true') {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const handleDismiss = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setVisible(false);
  };

  return (
    <div className="mx-12 mt-12 mb-0 p-4 rounded-xl bg-warning-secondary border border-warning-solid/20 flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-warning-solid/10 flex items-center justify-center flex-shrink-0">
        <Icon name="shield" size={20} className="text-warning-solid" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary">
          Actividad inusual detectada
        </p>
        <p className="text-sm text-text-secondary mt-0.5">
          Se detectaron inicios de sesión inusuales en tu cuenta. Si no reconoces esta actividad, te recomendamos cambiar tu contraseña de Google.
        </p>
      </div>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium text-warning-solid hover:bg-warning-solid/10 transition-colors"
      >
        Entendido
      </button>
    </div>
  );
}
