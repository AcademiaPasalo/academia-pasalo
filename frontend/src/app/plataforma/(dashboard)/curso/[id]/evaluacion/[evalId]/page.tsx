import { Metadata } from 'next';
import RoleBasedContent from '@/components/RoleBasedContent';

interface EvaluacionPageProps {
  params: Promise<{
    id: string;
    evalId: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Evaluación | Pásalo a la Primera',
  description: 'Sesiones de clase y materiales de la evaluación',
};

export default async function EvaluacionPage({ params }: EvaluacionPageProps) {
  const { id, evalId } = await params;

  return (
    <RoleBasedContent
      componentProps={{ cursoId: id, evalId }}
    />
  );
}
