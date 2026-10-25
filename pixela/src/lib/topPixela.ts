/**
 * Regla única de la insignia "Top Pixela".
 *
 * Antes bastaba con una nota ≥ 8.0, y la superaban casi todas las obras
 * populares: la insignia aparecía en media fila y dejaba de significar algo.
 * Ahora pide nota alta **y** votos suficientes, para que una obra con veinte
 * votos entusiastas no se cuele junto a los clásicos.
 *
 * `vote_count` llega de TMDB en todos los listados (tendencias, cartelera,
 * finde, categorías). Si falta, la obra no se marca: aquí el lado seguro es no
 * mostrar la insignia.
 */
export const TOP_PIXELA_MIN_RATING = 8.5;
export const TOP_PIXELA_MIN_VOTES = 500;

interface RatedMedia {
  vote_average?: number | null;
  vote_count?: number | null;
}

export const isTopPixela = ({ vote_average, vote_count }: RatedMedia): boolean =>
  (vote_average ?? 0) >= TOP_PIXELA_MIN_RATING &&
  (vote_count ?? 0) >= TOP_PIXELA_MIN_VOTES;
