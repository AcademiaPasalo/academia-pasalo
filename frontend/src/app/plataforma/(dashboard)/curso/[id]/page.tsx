import { Metadata } from 'next';
import RoleBasedContent from '@/components/RoleBasedContent';

interface CursoPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Curso | Pásalo a la Primera',
  description: 'Contenido y materiales del curso',
};

export default async function CursoPage({ params }: CursoPageProps) {
  const { id } = await params;

  return (
    <RoleBasedContent
      componentProps={{ cursoId: id }}
    />
  );
}
