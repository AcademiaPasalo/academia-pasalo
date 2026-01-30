import { Metadata } from 'next';
import CursoContent from '@/components/pages/curso/CursoContent';
import { getCursoNombre } from '@/services/cursoService';

interface CursoPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Generar metadata dinámica usando el servicio de cursos
export async function generateMetadata({ params }: CursoPageProps): Promise<Metadata> {
  const { id } = await params;
  const cursoName = getCursoNombre(id);

  return {
    title: `${cursoName} | Pásalo a la Primera`,
    description: `Contenido y materiales del curso ${cursoName}`,
  };
}

export default async function CursoPage({ params }: CursoPageProps) {
  const { id } = await params;
  return <CursoContent cursoId={id} />;
}
