import { CreatorAvatar } from './CreatorAvatar';
import { CreatorInfoProps } from '@/features/media/types/creators';
import { Pelicula, Serie } from '@/features/media/types/content';


const STYLES = {
  container: "",
  title: "text-sm text-gray-400 mb-2",
  creatorsWrapper: "flex flex-wrap gap-4"
} as const;

/**
 * Componente que muestra la información de los creadores de una película o serie
 * @param {CreatorInfoProps} props - Propiedades del componente
 * @param {Media} props.media - Media
 * @returns {JSX.Element} Componente de información de creadores
 */
export const CreatorInfo = ({ media }: CreatorInfoProps) => {
  const isSerie = media.tipo === 'serie';

  // Todos los directores, no solo el primero que aparecía en los créditos:
  // las codirecciones (los Coen, los Daniels) perdían a una de las dos personas.
  const people = isSerie
    ? (media as Serie).creadores ?? []
    : (media as Pelicula).directores ??
      (media.creador ? [{ ...media.creador, id: String(media.creador.id) }] : []);

  if (people.length === 0) return null;

  return (
    <div className={STYLES.container}>
      <h3 className={STYLES.title}>{isSerie ? 'Creada por' : 'Dirección'}</h3>
      <div className={STYLES.creatorsWrapper}>
        {people.map((person) => (
          <CreatorAvatar key={person.id} photo={person.foto} name={person.nombre} />
        ))}
      </div>
    </div>
  );
}; 