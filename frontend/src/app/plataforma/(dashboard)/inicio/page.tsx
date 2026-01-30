import { Metadata } from 'next';
import InicioContent from '@/components/pages/inicio/InicioContent';

export const metadata: Metadata = {
  title: 'Inicio | Pásalo a la Primera',
  description: 'Panel de inicio - Mis cursos y agenda del día',
};

export default function InicioPage() {
  return <InicioContent />;
}
