// ============================================
// USE CYCLES HOOK - GESTIÓN DE CICLOS ACADÉMICOS
// ============================================

import { useState, useEffect } from 'react';
import { cyclesService } from '@/services/cycles.service';
import type { AcademicCycle } from '@/types/api';

export function useCycles() {
  const [cycles, setCycles] = useState<AcademicCycle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCycles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cyclesService.findAll();
      setCycles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar ciclos');
      console.error('Error loading cycles:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    cycles,
    loading,
    error,
    loadCycles,
  };
}

export function useActiveCycle() {
  const [cycle, setCycle] = useState<AcademicCycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadActiveCycle() {
      setLoading(true);
      setError(null);
      try {
        const data = await cyclesService.getActiveCycle();
        setCycle(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar ciclo activo');
        console.error('Error loading active cycle:', err);
      } finally {
        setLoading(false);
      }
    }

    loadActiveCycle();
  }, []);

  return { cycle, loading, error };
}
