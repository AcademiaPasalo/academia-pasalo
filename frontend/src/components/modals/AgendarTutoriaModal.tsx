// ============================================
// MODAL DE AGENDAR TUTORÍA
// ============================================

'use client';

import { useState } from 'react';
import Icon from '@/components/ui/Icon';
import { FaWhatsapp } from "react-icons/fa";

interface AgendarTutoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (curso: string, tema: string) => void;
}

export default function AgendarTutoriaModal({ isOpen, onClose, onSubmit }: AgendarTutoriaModalProps) {
  const [curso, setCurso] = useState('');
  const [tema, setTema] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (curso.trim() && tema.trim()) {
      onSubmit(curso.trim(), tema.trim());
      // Limpiar campos
      setCurso('');
      setTema('');
      onClose();
    }
  };

  const handleClose = () => {
    setCurso('');
    setTema('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-info-secondary-solid p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Icon name="auto_awesome" size={24} variant="rounded" filled className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Agendar Tutoría</h2>
              <p className="text-sm text-white/80">Completa los datos para continuar</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Icon name="close" size={24} variant="rounded" className="text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Campo Curso */}
          <div className="space-y-2">
            <label htmlFor="curso" className="block text-sm font-medium text-primary">
              Curso <span className="text-error-solid">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Icon name="class" size={20} variant="rounded" className="text-icon-tertiary" />
              </div>
              <input
                id="curso"
                type="text"
                value={curso}
                onChange={(e) => setCurso(e.target.value)}
                placeholder="Ej: Fundamentos de Física"
                required
                className="w-full pl-10 pr-4 py-3 border border-stroke-primary rounded-lg text-sm text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-info-secondary-solid/20 focus:border-info-secondary-solid transition-colors"
              />
            </div>
          </div>

          {/* Campo Tema/Evaluación */}
          <div className="space-y-2">
            <label htmlFor="tema" className="block text-sm font-medium text-primary">
              Evaluación o Tema <span className="text-error-solid">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Icon name="description" size={20} variant="rounded" className="text-icon-tertiary" />
              </div>
              <input
                id="tema"
                type="text"
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                placeholder="Ej: PC1, EX1, Laboratorio 3"
                required
                className="w-full pl-10 pr-4 py-3 border border-stroke-primary rounded-lg text-sm text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-info-secondary-solid/20 focus:border-info-secondary-solid transition-colors"
              />
            </div>
          </div>

          {/* Info adicional */}
          {/*<div className="flex items-start gap-2 p-3 bg-info-secondary-solid/5 rounded-lg border border-info-secondary-solid/10">
            <Icon name="info" size={20} variant="rounded" className="text-info-secondary-solid flex-shrink-0 mt-0.5" />
            <p className="text-xs text-secondary">
              Te redirigiremos a WhatsApp con el mensaje prellenado para que puedas agendar tu tutoría directamente.
            </p>
          </div>*/}

          {/* Botones */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-stroke-primary rounded-lg text-sm font-medium text-secondary hover:bg-secondary-hover transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!curso.trim() || !tema.trim()}
              className="flex-1 px-4 py-3 bg-info-secondary-solid rounded-lg text-sm font-medium text-white hover:bg-info-secondary-solid/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FaWhatsapp className="text-[18px] text-white group-hover:text-accent-secondary transition-colors" />
              Continuar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
