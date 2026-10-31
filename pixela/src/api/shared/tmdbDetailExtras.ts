import { buildTmdbImageUrl, TMDB_IMAGE_CONFIG } from '@/lib/constants/tmdb';
import type { CrewCredit, SimilarTitle } from '@/features/media/types/content';
import type { WatchProvider } from '@/features/media/types/supplements';

/**
 * Datos de la ficha que TMDB ya devuelve en la misma petición y que antes se
 * tiraban: edad recomendada, título original, país, idioma, votos, todo el
 * equipo, el tipo de cada plataforma, el idioma de cada vídeo y los títulos
 * similares. Ninguno cuesta una llamada más: llegan con `append_to_response`
 * (ver `DETAIL_APPEND` en `lib/api/tmdbDetails.ts`).
 */

const REGION = 'ES';

/* ── Plataformas ─────────────────────────────────────────────────────────── */

export type ProviderKind = NonNullable<WatchProvider['tipo']>;

interface RawProvider {
  provider_id?: number;
  provider_name?: string;
  logo_path?: string | null;
  display_priority?: number;
}

export interface RawRegionProviders {
  link?: string;
  flatrate?: RawProvider[];
  free?: RawProvider[];
  ads?: RawProvider[];
  rent?: RawProvider[];
  buy?: RawProvider[];
}

/**
 * Plataformas de España con su tipo rellenado.
 *
 * Antes se juntaban suscripción, alquiler y compra en una sola lista (y se
 * deduplicaban por id, así que Apple TV en alquiler y en compra salía una vez,
 * sin decir cuál). `tipo` existía en el modelo y nunca se rellenaba. Lo
 * gratuito con o sin anuncios cuenta como incluido: no hay que pagar aparte.
 */
export function mapRegionProviders(region: RawRegionProviders | undefined): {
  proveedores: WatchProvider[];
  proveedoresUrl?: string;
} {
  if (!region) return { proveedores: [] };

  const groups: Array<[ProviderKind, RawProvider[] | undefined]> = [
    ['flatrate', [...(region.flatrate ?? []), ...(region.free ?? []), ...(region.ads ?? [])]],
    ['rent', region.rent],
    ['buy', region.buy],
  ];

  const proveedores: WatchProvider[] = [];
  for (const [tipo, list] of groups) {
    const seen = new Set<number>();
    for (const provider of [...(list ?? [])].sort(
      (a, b) => (a.display_priority ?? 99) - (b.display_priority ?? 99),
    )) {
      if (!provider.provider_id || seen.has(provider.provider_id)) continue;
      seen.add(provider.provider_id);
      proveedores.push({
        id: String(provider.provider_id),
        nombre: provider.provider_name ?? '',
        logo: provider.logo_path
          ? buildTmdbImageUrl(provider.logo_path, TMDB_IMAGE_CONFIG.SIZES.POSTER.W92)
          : '',
        tipo,
      });
    }
  }

  return { proveedores, proveedoresUrl: region.link };
}

/* ── Edad recomendada ────────────────────────────────────────────────────── */

interface RawReleaseDates {
  results?: Array<{
    iso_3166_1: string;
    release_dates?: Array<{ certification?: string; type?: number }>;
  }>;
}

interface RawContentRatings {
  results?: Array<{ iso_3166_1: string; rating?: string }>;
}

/**
 * Calificación por edades en España («TP», «7», «12», «16», «18»).
 *
 * En películas hay una por tipo de estreno; se prefiere la de cine (3) y si no
 * la primera que tenga valor.
 */
export function movieCertification(releaseDates: RawReleaseDates | undefined): string | undefined {
  const es = releaseDates?.results?.find((r) => r.iso_3166_1 === REGION)?.release_dates ?? [];
  const withValue = es.filter((d) => d.certification?.trim());
  const theatrical = withValue.find((d) => d.type === 3);
  return normalizeCertification((theatrical ?? withValue[0])?.certification);
}

export function tvCertification(ratings: RawContentRatings | undefined): string | undefined {
  return normalizeCertification(
    ratings?.results?.find((r) => r.iso_3166_1 === REGION)?.rating,
  );
}

function normalizeCertification(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  // TMDB mezcla «A» (todos los públicos, sistema antiguo) con «TP».
  if (trimmed === 'A' || trimmed.toUpperCase() === 'APTA') return 'TP';
  return trimmed;
}


/* ── Idioma y país ───────────────────────────────────────────────────────── */

const languageNames = new Intl.DisplayNames(['es'], { type: 'language' });
const regionNames = new Intl.DisplayNames(['es'], { type: 'region' });

/** «ja» → «japonés». TMDB usa «xx» para «sin idioma». */
export function languageName(code: string | undefined): string | undefined {
  if (!code || code === 'xx') return undefined;
  try {
    return languageNames.of(code);
  } catch {
    return undefined;
  }
}

export function countryNames(codes: Array<string | undefined>): string[] {
  const names: string[] = [];
  for (const code of codes) {
    if (!code) continue;
    try {
      const name = regionNames.of(code);
      if (name && !names.includes(name)) names.push(name);
    } catch {
      // Código que Intl no reconoce: se omite antes que pintar «XX».
    }
  }
  return names;
}

/* ── Equipo ──────────────────────────────────────────────────────────────── */

export interface RawCrewMember {
  id: number;
  name: string;
  job?: string;
  profile_path?: string | null;
}

/** Oficios que se muestran en la ficha técnica, en este orden. */
const CREW_JOBS: Array<{ oficio: string; jobs: string[] }> = [
  { oficio: 'Guion', jobs: ['Screenplay', 'Writer', 'Novel', 'Story'] },
  { oficio: 'Fotografía', jobs: ['Director of Photography'] },
  { oficio: 'Música', jobs: ['Original Music Composer', 'Music'] },
  { oficio: 'Montaje', jobs: ['Editor'] },
  { oficio: 'Producción', jobs: ['Producer'] },
];

/** Hasta tres personas por oficio: la ficha técnica no es la lista de créditos. */
const MAX_PER_JOB = 3;

export function directorsOf(crew: RawCrewMember[] | undefined) {
  const seen = new Set<number>();
  return (crew ?? [])
    .filter((member) => member.job === 'Director' && !seen.has(member.id) && seen.add(member.id))
    .map((member) => ({
      id: String(member.id),
      nombre: member.name,
      foto: member.profile_path
        ? buildTmdbImageUrl(member.profile_path, TMDB_IMAGE_CONFIG.SIZES.PROFILE.W185)
        : '',
    }));
}

export function crewOf(crew: RawCrewMember[] | undefined): CrewCredit[] {
  const credits: CrewCredit[] = [];
  for (const { oficio, jobs } of CREW_JOBS) {
    const seen = new Set<number>();
    const people = (crew ?? [])
      .filter((member) => member.job && jobs.includes(member.job))
      .filter((member) => !seen.has(member.id) && seen.add(member.id))
      .slice(0, MAX_PER_JOB);
    for (const member of people) {
      credits.push({ id: member.id, nombre: member.name, oficio });
    }
  }
  return credits;
}

/* ── Vídeos ──────────────────────────────────────────────────────────────── */

export interface RawVideo {
  id?: string;
  key?: string;
  name?: string;
  site?: string;
  type?: string;
  iso_639_1?: string;
  official?: boolean;
}

const VIDEO_TYPES: Record<string, string> = {
  Trailer: 'Tráiler',
  Teaser: 'Teaser',
  Clip: 'Escena',
  Featurette: 'Reportaje',
  'Behind the Scenes': 'Detrás de las cámaras',
  Bloopers: 'Tomas falsas',
  'Opening Credits': 'Créditos',
};

/**
 * Vídeos de YouTube, en castellano primero y después en versión original.
 *
 * Antes la petición iba en `es-ES` sin `include_video_language`, así que casi
 * nunca llegaba el tráiler en VO, y el de cine no anglosajón ni en español.
 */
export function mapVideos(videos: RawVideo[] | undefined, originalLanguage: string | undefined) {
  const rank = (video: RawVideo) =>
    (video.iso_639_1 === 'es' ? 0 : 2) + (video.type === 'Trailer' ? 0 : 1);

  return (videos ?? [])
    .filter((video) => video.site?.toLowerCase() === 'youtube' && video.key)
    .sort((a, b) => rank(a) - rank(b))
    .map((video) => ({
      id: video.id ?? video.key ?? '',
      nombre: video.name ?? '',
      key: video.key ?? '',
      site: 'YouTube',
      tipo: VIDEO_TYPES[video.type ?? ''] ?? video.type ?? 'Vídeo',
      idioma: videoLanguageLabel(video.iso_639_1, originalLanguage),
    }));
}

function videoLanguageLabel(code: string | undefined, original: string | undefined): string | undefined {
  if (!code) return undefined;
  if (code === 'es') return 'Castellano';
  if (code === original) return 'VO';
  const name = languageName(code);
  return name ? name.charAt(0).toUpperCase() + name.slice(1) : undefined;
}

/* ── Similares ───────────────────────────────────────────────────────────── */

interface RawSimilar {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
}

/** Ocho como máximo: es una fila, no otro catálogo. Sin póster no se muestra. */
export function mapSimilar(results: RawSimilar[] | undefined, tipo: 'pelicula' | 'serie'): SimilarTitle[] {
  return (results ?? [])
    .filter((item) => item.poster_path)
    .slice(0, 8)
    .map((item) => ({
      id: String(item.id),
      titulo: item.title ?? item.name ?? '',
      poster: buildTmdbImageUrl(item.poster_path as string, TMDB_IMAGE_CONFIG.SIZES.POSTER.W342),
      puntuacion: item.vote_average ?? 0,
      fecha: item.release_date ?? item.first_air_date ?? '',
      tipo,
    }));
}

/* ── Estado de emisión ───────────────────────────────────────────────────── */

const SERIES_STATUS: Record<string, string> = {
  'Returning Series': 'En emisión',
  'In Production': 'En producción',
  Planned: 'Anunciada',
  Ended: 'Finalizada',
  Canceled: 'Cancelada',
  Pilot: 'Piloto',
};

export function seriesStatus(status: string | undefined): string | undefined {
  return status ? SERIES_STATUS[status] : undefined;
}
