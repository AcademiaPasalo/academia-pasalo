import { Metadata } from 'next';
import CursoContent from '@/components/pages/curso/CursoContent';
import { getCursoNombre } from '@/services/cursoService';

interface CursoPageProps {
  params: {
    id: string;
  };
}

// Generar metadata dinámica usando el servicio de cursos
export async function generateMetadata({ params }: CursoPageProps): Promise<Metadata> {
  const cursoName = getCursoNombre(params.id);

  return {
    title: `${cursoName} | Pásalo a la Primera`,
    description: `Contenido y materiales del curso ${cursoName}`,
  };
}

export default function CursoPage({ params }: CursoPageProps) {
  return <CursoContent cursoId={params.id} />;
}
