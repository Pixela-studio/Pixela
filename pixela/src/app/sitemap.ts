import type { MetadataRoute } from "next";

/**
 * `sitemap.xml` generado por Next.
 *
 * Se declara solo el puñado de rutas estables. Deliberadamente **no** se listan
 * las fichas de `/movies/[id]` y `/series/[id]`: son cientos de miles de URLs
 * derivadas de TMDB y publicarlas equivale a invitar a los rastreadores a
 * recorrerlas todas, que es justo el tráfico que estamos intentando recortar.
 *
 * `robots.ts` apunta aquí; sin este fichero, cada rastreador que leyese el
 * `robots.txt` pediría un `/sitemap.xml` inexistente, y un 404 en App Router
 * también invoca la función.
 */

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://pixela.io";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/categories`,
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];
}
