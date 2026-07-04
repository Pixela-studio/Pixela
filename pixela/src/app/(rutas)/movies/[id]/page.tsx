import { MediaPage } from '@/features/media/pages/MediaPage';
import { notFound } from 'next/navigation';
import { getMovieData } from '@/features/media/services/movieService';

export { generateMetadata } from '@/features/media/services/movieMetadata';

export default async function MoviePage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const pelicula = await getMovieData(id);
    return <MediaPage media={pelicula} />;
  } catch (error) {
    console.error('Error al obtener los datos de la película:', error);
    notFound();
  }
}
