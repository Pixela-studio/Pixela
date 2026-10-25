import { GenresListProps } from '@/features/media/types/genres';

/*
 * Los géneros como texto en la línea de metadatos ("Drama, Crimen"). Eran
 * píldoras rojas (red-600), un color fuera de la paleta que competía con el
 * rosa de las acciones.
 */
const STYLES = {
  genres: "text-[15px] [font-stretch:112%] text-gray-400",
} as const;

export const GenresList = ({ genres }: GenresListProps) =>
  genres.length > 0 ? <p className={STYLES.genres}>{genres.join(", ")}</p> : null;
