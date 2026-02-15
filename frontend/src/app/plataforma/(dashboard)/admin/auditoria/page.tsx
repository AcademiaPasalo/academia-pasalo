import { Metadata } from 'next';
import RoleBasedContent from '@/components/RoleBasedContent';

export const metadata: Metadata = {
  title: 'Auditoría de Seguridad | Pásalo a la Primera',
  description: 'Historial de auditoría y eventos de seguridad',
};

export default function AuditoriaPage() {
  return <RoleBasedContent />;
}
