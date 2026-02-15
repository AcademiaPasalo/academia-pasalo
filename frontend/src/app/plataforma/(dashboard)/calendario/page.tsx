import { Metadata } from 'next';
import RoleBasedContent from '@/components/RoleBasedContent';

export const metadata: Metadata = {
  title: 'Calendario | Pásalo a la Primera',
  description: 'Revisa tu calendario',
};

export default function CalendarioPage() {
  return <RoleBasedContent />;
}
