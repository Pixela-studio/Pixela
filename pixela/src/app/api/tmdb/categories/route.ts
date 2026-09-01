import { NextResponse } from 'next/server';
import { fetchFromTmdb } from '@/lib/tmdb';
import { logger } from '@/lib/logger';

interface Genre {
  id: number;
  name: string;
}

/**
 * Lista de géneros de TMDB: el dato más estable de toda la API (cambia como
 * mucho una vez al año) y aun así se servía sin `Cache-Control`, así que cada
 * visita a `/categories` despertaba la función y hacía dos llamadas a TMDB.
 *
 * - `max-age`: el navegador no vuelve a pedirlo durante la sesión.
 * - `s-maxage`: la CDN de Vercel responde por su cuenta durante una semana.
 */
const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800',
} as const;

export async function GET() {
  try {
    // En paralelo: eran dos `await` secuenciales, el segundo esperando al primero
    // sin necesitarlo.
    const [movieGenres, tvGenres] = await Promise.all([
      fetchFromTmdb<{ genres: Genre[] }>('/genre/movie/list'),
      fetchFromTmdb<{ genres: Genre[] }>('/genre/tv/list'),
    ]);

    const combinedGenres = new Map<number, Genre>();
    
    movieGenres.genres.forEach((g) => combinedGenres.set(g.id, g));
    tvGenres.genres.forEach((g) => combinedGenres.set(g.id, g));

    const genres = Array.from(combinedGenres.values());

    return NextResponse.json(
        {
            success: true,
            data: genres
        },
        { headers: CACHE_HEADERS },
    );
  } catch (error) {
    logger.error('Failed to fetch categories', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' }, 
      { status: 500 }
    );
  }
}
