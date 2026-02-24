import { Metadata } from 'next';
import PerfilContent from '@/components/pages/shared/PerfilContent';

export const metadata: Metadata = {
  title: 'Mi Perfil | Pásalo a la Primera',
  description: 'Consulta tus datos básicos de cuenta',
};

export default function PerfilPage() {
  return <PerfilContent />;
}
