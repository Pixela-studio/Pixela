import { fetchFromTmdb } from "@/lib/tmdb";
import { tmdbImageHelpers, TMDB_IMAGE_CONFIG } from "@/lib/constants/tmdb";
import { HeroImage } from "@/features/hero/types/content";

interface TmdbResult {
  id: number;
  backdrop_path: string | null;
  poster_path: string | null;
  title?: string;
  name?: string;
  overview?: string;
  media_type?: "movie" | "tv";
}

interface TmdbResponse {
  results: TmdbResult[];
}

/**
 * Títulos que no queremos destacar en la portada.
 */
const BANNED_TITLE_TERMS = [
  "primal",
  "monster high",
  "barbie",
  "primate",
  "apes",
  "simios",
  "law & order",
  "ley y orden",
  "hermandad",
  "turno de noche",
  "night shift",
  "joven sherlock",
  "young sherlock",
  "hoppers",
  "dinosaur",
  "dinosaurio",
];

/**
 * Comprueba si un título está vetado, comparando **palabras completas**.
 *
 * La versión anterior hacía `title.includes(term)` sobre subcadenas, así que
 * el término "apes" descartaba también «Escapes», «Grapes» o «Landscapes», y
 * "hoppers" se llevaba por delante «Choppers» o «Shoppers»: títulos legítimos
 * desaparecían de la portada sin que nadie lo notara.
 */
const BANNED_TITLE_PATTERNS = BANNED_TITLE_TERMS.map((term) => {
  // Escapar los metacaracteres del término antes de meterlo en una expresión.
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}([^\\p{L}\\p{N}]|$)`, "iu");
});

const isBannedTitle = (title: string): boolean =>
  BANNED_TITLE_PATTERNS.some((pattern) => pattern.test(title));

/**
 * Función helper para obtener y mapear imágenes de una categoría
 * Usa URLs de alta calidad para el backdrop (original) y poster (w780)
 */
async function fetchAndMapImages(
  endpoint: string,
  limit: number,
  fallbackType?: "movie" | "serie",
): Promise<HeroImage[]> {
  try {
    const data = await fetchFromTmdb<TmdbResponse>(endpoint);

    return data.results
      .filter((item) => item.backdrop_path && item.poster_path)
      .filter((item) => {
        const title = (item.title || item.name || "").toLowerCase();
        const overview = item.overview || "";

        // Excluir títulos vacíos o sin sinopsis: el hero muestra ambos.
        if (!title || !overview) return false;

        if (isBannedTitle(title)) {
          if (process.env.NODE_ENV === "development") {
            console.log(`[Hero Filter] Excluded: ${title}`);
          }
          return false;
        }

        return true;
      })
      .slice(0, limit)
      .map((item) => ({
        id: item.id,
        backdrop: tmdbImageHelpers.backdrop(
          item.backdrop_path,
          TMDB_IMAGE_CONFIG.SIZES.BACKDROP.ORIGINAL,
        ),
        poster: tmdbImageHelpers.poster(
          item.poster_path,
          TMDB_IMAGE_CONFIG.SIZES.POSTER.W780,
        ),
        title: item.title || item.name,
        description: item.overview,
        type:
          (item.media_type === "tv" ? "serie" : item.media_type) ||
          fallbackType ||
          "movie",
      }));
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`Error fetching images from ${endpoint}:`, error);
    }
    return [];
  }
}

/**
 * Obtiene las imágenes destacadas para el Hero section combinando:
 * - Tendencias (Trending)
 * - Más populares (Popular)
 * - Mejor valoradas (Top Rated)
 *
 * Prioriza velocidad de carga y calidad de imagen.
 * @returns {Promise<HeroImage[]>} Array de objetos de imágenes
 */
export async function getFeaturedImages(): Promise<HeroImage[]> {
  try {
    // Paralelizar todas las peticiones para minimizar el tiempo de espera (Waterfall elimination)
    const [martySupremeData, trendingDay] = await Promise.all([
      fetchFromTmdb<TmdbResult>("movie/1317288").catch(() => null), // Marty Supreme (Prioridad 1)
      fetchAndMapImages("trending/all/day", 10), // Pedimos hasta 10 para garantizar llenar el cupo tras filtrar la blacklist
    ]);

    // Mapear Marty Supreme si existe
    const martySupreme: HeroImage | null =
      martySupremeData &&
      martySupremeData.backdrop_path &&
      martySupremeData.poster_path
        ? {
            id: martySupremeData.id,
            backdrop: tmdbImageHelpers.backdrop(
              martySupremeData.backdrop_path,
              TMDB_IMAGE_CONFIG.SIZES.BACKDROP.ORIGINAL,
            ),
            poster: tmdbImageHelpers.poster(
              martySupremeData.poster_path,
              TMDB_IMAGE_CONFIG.SIZES.POSTER.W780,
            ),
            title: martySupremeData.title || martySupremeData.name,
            description: martySupremeData.overview,
            type: "movie",
          }
        : null;

    // Combinar resultados:
    // 1. Marty Supreme SIEMPRE PRIMERO
    // 2. El TOP actual va después
    const images = [martySupreme, ...trendingDay].filter(
      (img): img is HeroImage => img !== null,
    ); // Filtrar nulls

    // Deduplicar por si acaso el mismo item aparece en varias categorías (usando backdrop como clave única)
    const uniqueImages = Array.from(
      new Map(images.map((img) => [img.backdrop, img])).values(),
    );

    // Si por alguna razón fallan todas, devolver array vacío para que la UI lo maneje
    // Asegurarnos de que bajo ninguna circunstancia devolveremos más de 4 opciones.
    return uniqueImages.slice(0, 4);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error crítico al obtener imágenes del hero:", error);
    }
    return [];
  }
}
