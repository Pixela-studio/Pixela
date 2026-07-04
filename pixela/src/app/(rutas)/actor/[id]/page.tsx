import { notFound } from 'next/navigation';
import { getActorDetails } from '@/features/actor/services/actorService';
import { ActorPage } from '@/features/actor/pages/ActorPage';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const actor = await getActorDetails(id);
    return {
      title: `${actor.name} | Pixela`,
      description: actor.biography?.slice(0, 160) || `Perfil de ${actor.name} en Pixela.`,
    };
  } catch (error) {
    return {
      title: 'Actor | Pixela',
    };
  }
}

export default async function ActorRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  try {
    const actor = await getActorDetails(id);
    
    return (
      <ActorPage actor={actor} />
    );
  } catch (error) {
    console.error('Error al obtener los datos del actor:', error);
    notFound();
  }
}
