import { NextResponse } from 'next/server';
import { fetchFromTmdb } from '@/lib/tmdb';
import { handleRouteError } from '@/lib/api/responses';

interface RawProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priorities?: Record<string, number>;
  display_priority?: number;
}

/** Cuántas plataformas se ofrecen para elegir: las más usadas en España. */
const MAX_PROVIDERS = 24;

/**
 * Plataformas de streaming de España, para «Mis plataformas».
 *
 * Los ids salen de TMDB y no de una lista escrita a mano: cambian (HBO Max →
 * Max) y uno equivocado haría que el filtro no devolviera nada. Es tan estable
 * como los géneros, así que se cachea igual de largo.
 */
const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800',
} as const;

export async function GET() {
  try {
    const [movie, tv] = await Promise.all([
      fetchFromTmdb<{ results: RawProvider[] }>('/watch/providers/movie', { watch_region: 'ES' }),
      fetchFromTmdb<{ results: RawProvider[] }>('/watch/providers/tv', { watch_region: 'ES' }),
    ]);

    const byId = new Map<number, RawProvider>();
    for (const provider of [...movie.results, ...tv.results]) {
      if (!byId.has(provider.provider_id)) byId.set(provider.provider_id, provider);
    }

    const priority = (p: RawProvider) => p.display_priorities?.ES ?? p.display_priority ?? 999;
    const providers = [...byId.values()]
      .sort((a, b) => priority(a) - priority(b))
      .slice(0, MAX_PROVIDERS)
      .map((p) => ({ id: p.provider_id, name: p.provider_name, logo_path: p.logo_path }));

    return NextResponse.json({ success: true, data: providers }, { headers: CACHE_HEADERS });
  } catch (error) {
    return handleRouteError('Failed to list watch providers', error);
  }
}
