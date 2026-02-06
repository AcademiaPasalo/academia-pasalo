import { Metadata } from 'next';
import RoleBasedContent from '@/components/RoleBasedContent';

export const metadata: Metadata = {
  title: 'Inicio | Pásalo a la Primera',
  description: 'Panel de inicio - Dashboard personalizado según tu rol',
};

export default function InicioPage() {
  return <RoleBasedContent />;
}
