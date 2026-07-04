import { MediaPage } from '@/features/media/pages/MediaPage';
import { notFound } from 'next/navigation';
import { getSeriesData } from '@/features/media/services/seriesService';

export { generateMetadata } from '@/features/media/services/seriesMetadata';

export default async function SeriePage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const serie = await getSeriesData(id);
    return <MediaPage media={serie} />;
  } catch (error) {
    console.error('Error al obtener los datos de la serie:', error);
    notFound();
  }
}
