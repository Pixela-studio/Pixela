import { cache } from "react";

import { getActorDetails } from "@/features/actor/services/actorService";
import { getDiscoveredMovies, getDiscoveredSeries } from "@/features/discover/service/discover";
import { getFeaturedImages } from "@/features/hero/services/heroBackdropService";
import { getTheatricalMovies } from "@/features/theatrical/services/theatricalService";
import {
  getTrendingMovies,
  getTrendingSeries,
} from "@/features/trending/services/trendingService";
import {
  getWeekendMovies,
  getWeekendSeries,
} from "@/features/weekend/services/weekendService";

/**
 * Allowlist del catálogo: qué fichas de TMDB son alcanzables por enlace y
 * pueden aparecer en el índice de los buscadores.
 *
 * ── El problema ──────────────────────────────────────────────────────────────
 * Las tres rutas `[id]` (`/movies`, `/series`, `/actor`) declaraban
 * `generateStaticParams()` devolviendo `[]` con `dynamicParams = true`. Eso las
 * pone en modo "genera a la primera visita y cachea", que es lo que queríamos
 * para las personas, pero convierte en renderizable y cacheable **cualquiera**
 * de los millones de ids de TMDB.
 *
 * Y sí había un camino cerrado para recorrerlos todos. No eran los carruseles:
 * tendencias, cartelera, finde y la cuadrícula de categorías navegan con
 * `onClick` + `router.push` sobre un `<div>`, así que no son enlaces reales y
 * un rastreador no los sigue. El ciclo lo formaban los dos únicos `<Link>`
 * crawleables del grafo de contenido:
 *
 *   `/` → CTA del hero (4 fichas)
 *     → reparto de la ficha (`ActorCard`) → `/actor/[id]`
 *     → filmografía del actor (`ActorPage`, top-20 de `combined_credits`)
 *     → más fichas → sus repartos → ...
 *
 * Sin salida y sin repetición: el reparto de una ficha lleva a decenas de
 * personas, la filmografía de cada persona lleva a veinte fichas nuevas. Un
 * rastreador con paciencia recorre TMDB entero, y cada paso deja una entrada
 * nueva en la caché ISR y una invocación de función.
 *
 * ── La decisión ──────────────────────────────────────────────────────────────
 * Híbrida, no `notFound()`. Un id fuera de la allowlist **se sigue
 * renderizando** entero: lo que pierde es el permiso para indexarse y, sobre
 * todo, el enlace que lo hacía alcanzable. Un `notFound()` estricto rompería
 * tres recorridos reales que no pasan por el catálogo curado —el buscador de
 * `/categories`, la filmografía de un actor, y las fichas guardadas en
 * favoritos, biblioteca y reseñas, que salen de `tmdb_id` en Prisma sin
 * restricción alguna—. El coste no lo genera una persona buscando una película
 * rara; lo genera un rastreador recorriendo un grafo infinito. Cerrando el
 * grafo (ver `markLinkableCast` y `filterLinkableCredits`) la superficie
 * alcanzable e indexable baja de millones a unos cientos, sin quitarle nada a
 * nadie.
 *
 * Lo que **no** se ha podido hacer es negar la escritura en la caché ISR a los
 * ids de fuera: Next 16 sin PPR lo prohíbe de raíz. Está contado en detalle más
 * abajo, en el bloque "NO INTENTES SALTARTE LA ESCRITURA DE ISR".
 *
 * ── Por qué en runtime y no en build ─────────────────────────────────────────
 * Porque sale gratis. La allowlist se deriva de **los mismos servicios que ya
 * alimentan la portada**, no de llamadas nuevas: se invocan las funciones
 * exactas que usa `app/page.tsx`, así que la URL de TMDB es idéntica byte a
 * byte y la Data Cache de Next (`revalidate: 3600` en `src/lib/tmdb.ts`)
 * responde a las dos. Replicar aquí los `fetchFromTmdb` a mano habría sido más
 * limpio en capas, pero el orden de los parámetros forma parte de la clave de
 * caché: un `sort_by` antes de un `watch_region` es otra URL, otra entrada y
 * otra llamada a TMDB que nadie vería en ninguna métrica. Llamar al mismo
 * código elimina esa clase de error.
 *
 * Consecuencia buena y deliberada: **una película que entra en tendencias entra
 * sola en la allowlist en ≤1 h**, cuando expira la Data Cache, sin redeploy.
 * Mientras tanto su ficha ya es accesible, solo que en dinámico y sin indexar.
 *
 * Por qué vive en `src/lib/api/` y no en una feature: se alimenta de cinco
 * (`hero`, `trending`, `theatrical`, `weekend`, `discover`) y la regla del repo
 * es que las features no se importan entre sí. El precedente léxico está al
 * lado, en `ALLOWED_DISCOVER_PARAMS` de `schemas.ts`.
 */

/**
 * Cuántos elementos se piden a cada lista curada.
 *
 * La portada muestra 15 en cartelera y finde, y 7 en descubrir, pero una página
 * de TMDB trae 20 y el recorte se hace en memoria **después** del `fetch`.
 * Pedir 20 aquí no cambia la URL —o sea, no cuesta una llamada más— y hace que
 * la allowlist sea un superconjunto de lo que se ve en portada. Así ningún
 * enlace de la portada puede apuntar a una ficha no permitida, ni hoy ni si
 * mañana alguien sube `THEATRICAL_ITEMS_COUNT` de 15 a 20.
 */
const CURATED_PAGE_SIZE = 20;

/**
 * Tope de actores enlazables por ficha, en orden de facturación (`order`).
 *
 * Es el número que decide el tamaño de la allowlist de personas, porque no
 * existe ninguna lista curada de gente: un actor está permitido si aparece en
 * el reparto principal de una ficha permitida. La cuenta es directa —88 títulos
 * curados × N— y el reparto que devuelve TMDB **no está topado en ningún sitio**
 * del código: `mapPelicula` hace `movieData.actores?.map(mapActor)` sobre el
 * `credits.cast` completo, que en un estreno reciente son 64 personas. Sin tope
 * serían ~5.600 fichas de persona enlazadas; con 10, el techo es 880 y en la
 * práctica bastante menos, porque los títulos en tendencias comparten reparto.
 *
 * 10 y no otro número porque es el corte convencional de "reparto principal":
 * `order` 0-9 es lo que TMDB muestra en su propia tira de "Top Billed Cast", y
 * coincide con lo que una persona reconoce como el cartel de la película. Del
 * actor 11 en adelante empiezan los papeles de una escena.
 *
 * Quien queda fuera no desaparece: su tarjeta se sigue viendo con foto, nombre
 * y personaje, solo que sin enlace, y su ficha sigue siendo accesible si se
 * llega por otro camino (en dinámico y sin indexar).
 */
export const LINKABLE_CAST_LIMIT = 10;

interface Allowlist {
  movies: ReadonlySet<number>;
  series: ReadonlySet<number>;
}

/**
 * Normaliza el id que llega por el parámetro de ruta.
 *
 * Next entrega los params como string y sin validar. `Number("12abc")` es
 * `NaN`, `Number("")` es `0` y `Number(" 12 ")` es `12`, así que se exige que
 * la cadena sea un entero positivo antes de compararla con los conjuntos.
 */
const parseId = (id: string | number): number | null => {
  const raw = String(id).trim();
  if (!/^\d+$/.test(raw)) return null;
  const parsed = Number(raw);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
};

/**
 * Construye los dos conjuntos de ids a partir de las cinco listas curadas.
 *
 * `cache()` de React memoiza el resultado dentro de un mismo render, así que
 * `generateMetadata` y el componente de página comparten una sola construcción
 * aunque los dos pregunten. Entre renders distintos el ahorro lo da la Data
 * Cache de Next, que es donde viven de verdad las respuestas de TMDB.
 *
 * Si TMDB falla, los cinco servicios ya capturan el error y devuelven listas
 * vacías, así que la allowlist queda vacía y durante esa hora **nada se indexa
 * y ningún reparto emite enlaces**. Es el lado seguro del fallo: las páginas se
 * siguen viendo y lo único que se pierde es navegación secundaria. El contrario
 * —permitirlo todo cuando no se sabe— reabre exactamente la fuga que este
 * módulo cierra.
 */
const buildAllowlist = cache(async (): Promise<Allowlist> => {
  const [
    heroImages,
    trendingMovies,
    trendingSeries,
    theatricalMovies,
    weekendMovies,
    weekendSeries,
    discoveredMovies,
    discoveredSeries,
  ] = await Promise.all([
    getFeaturedImages(),
    getTrendingMovies(),
    getTrendingSeries(),
    getTheatricalMovies(CURATED_PAGE_SIZE),
    getWeekendMovies(CURATED_PAGE_SIZE),
    getWeekendSeries(CURATED_PAGE_SIZE),
    getDiscoveredMovies(),
    getDiscoveredSeries(),
  ]);

  const movies = new Set<number>();
  const series = new Set<number>();

  const collect = (target: Set<number>, items: readonly { id: number }[]) => {
    for (const item of items) {
      const id = parseId(item.id);
      if (id !== null) target.add(id);
    }
  };

  /*
   * El hero es la única lista mezclada: sale de `trending/all/day`, donde cada
   * resultado trae su propio `media_type`. `heroBackdropService` lo traduce a
   * `"serie"` para la UI y deja `"movie"` tal cual, y el tipo admite además
   * `"tv"`, así que se comprueban los dos nombres.
   */
  for (const image of heroImages) {
    const id = image.id === undefined ? null : parseId(image.id);
    if (id === null) continue;
    if (image.type === "serie" || image.type === "tv") series.add(id);
    else movies.add(id);
  }

  collect(movies, trendingMovies);
  collect(movies, theatricalMovies);
  collect(movies, weekendMovies);
  collect(movies, discoveredMovies);

  collect(series, trendingSeries);
  collect(series, weekendSeries);
  collect(series, discoveredSeries);

  return { movies, series };
});

/**
 * La allowlist, exigiendo que no esté vacía.
 *
 * Los ocho servicios de los que se deriva capturan sus propios errores y
 * devuelven `[]`. En runtime eso es lo correcto: que TMDB falle degrada la
 * portada en lugar de tumbarla. En build el efecto colateral es peligroso, y
 * silencioso: si TMDB está caído o la clave es inválida, `generateStaticParams`
 * devuelve una lista vacía, el build acaba con código 0, y se publica un sitio
 * con cero fichas prerenderizadas y `dynamicParams = true` — es decir, vuelve
 * exactamente la fuga que este módulo existe para cerrar, sin que nada lo diga.
 *
 * Se mira el total y no cada lista por separado a propósito: que falle una de
 * las ocho llamadas recorta la cobertura y es tolerable, pero que fallen todas
 * significa que no se pudo hablar con TMDB, y eso tiene que doler.
 *
 * Solo lo usan los `generateStaticParams`, que corren en build. Los chequeos de
 * runtime (`isAllowedMovie` y compañía) siguen llamando a `buildAllowlist`
 * directamente y no lanzan nunca.
 */
const requireAllowlist = async (): Promise<Allowlist> => {
  const allowlist = await buildAllowlist();

  if (allowlist.movies.size === 0 && allowlist.series.size === 0) {
    throw new Error(
      "La allowlist de TMDB salió vacía. Se aborta el build en vez de publicar " +
        "un sitio sin nada prerenderizado y con la superficie ISR otra vez " +
        "abierta. Comprueba TMDB_API_KEY, TMDB_BASE_URL y la conectividad con " +
        "TMDB.",
    );
  }

  return allowlist;
};

/** Ids de película que la portada enlaza hoy. Ver `buildAllowlist`. */
export const getAllowedMovieIds = async (): Promise<number[]> =>
  [...(await requireAllowlist()).movies];

/** Ids de serie que la portada enlaza hoy. Ver `buildAllowlist`. */
export const getAllowedSeriesIds = async (): Promise<number[]> =>
  [...(await requireAllowlist()).series];

/** ¿Está esta película en el catálogo curado? Decide `noindex` y enlaces. */
export async function isAllowedMovie(id: string | number): Promise<boolean> {
  const parsed = parseId(id);
  return parsed !== null && (await buildAllowlist()).movies.has(parsed);
}

/** ¿Está esta serie en el catálogo curado? Decide `noindex` y enlaces. */
export async function isAllowedSeries(id: string | number): Promise<boolean> {
  const parsed = parseId(id);
  return parsed !== null && (await buildAllowlist()).series.has(parsed);
}

/**
 * Un crédito de `person/{id}?append_to_response=combined_credits`.
 *
 * Se declara aquí en mínimo, y no se importa el tipo de `actorService`, porque
 * `order` **no está** en su interfaz: la respuesta real de TMDB sí lo trae en
 * los créditos de cine y este módulo lo necesita.
 */
interface CombinedCredit {
  id: number;
  media_type: "movie" | "tv";
  /** Orden de facturación. Ver la nota de asimetría en `isAllowedPerson`. */
  order?: number;
}

/**
 * ¿Está esta persona en el catálogo curado? Decide su `noindex`.
 *
 * La pregunta se responde **al revés** de como está formulada la regla. La
 * regla es "los N primeros del reparto de una ficha permitida", que leída de
 * frente obligaría a pedir los `credits` de los 88 títulos curados: 88 llamadas
 * a TMDB que ahora mismo nadie hace. Leída desde la persona es la misma
 * relación y sale gratis, porque su `combined_credits` ya viene en la respuesta
 * que la ruta `/actor/[id]` pide de todos modos. `getActorDetails` se llama con
 * el `id` **sin normalizar**, tal cual llega del parámetro, para que la URL sea
 * idéntica a la de la ruta y las dos compartan entrada en la Data Cache.
 *
 * Asimetría comprobada contra la API (2026-09-07, `person/6193`): de sus 126
 * créditos, los 91 de cine traen `order` y los 35 de televisión **ninguno** —en
 * su lugar llevan `episode_count`—. Así que para cine se aplica el tope de
 * facturación y para televisión basta con que la serie esté permitida. La
 * alternativa, exigir `order` también en televisión, dejaría fuera al
 * protagonista de una serie curada mientras su tarjeta de reparto sí se enlaza:
 * dos gates contradiciéndose. Lo permisivo aquí no ensancha la superficie
 * rastreable, que la fijan los enlaces y no este predicado; solo evita sacar
 * del índice a una persona que sí queremos indexar.
 */
export async function isAllowedPerson(id: string | number): Promise<boolean> {
  if (parseId(id) === null) return false;

  let credits: readonly CombinedCredit[];
  try {
    const actor = await getActorDetails(String(id));
    credits = (actor.combined_credits?.cast ?? []) as readonly CombinedCredit[];
  } catch {
    // Id inexistente o TMDB caído: sin datos no se concede índice.
    return false;
  }

  const { movies, series } = await buildAllowlist();

  return credits.some((credit) =>
    credit.media_type === "tv"
      ? series.has(credit.id)
      : movies.has(credit.id) &&
        credit.order !== undefined &&
        credit.order < LINKABLE_CAST_LIMIT,
  );
}

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * NO INTENTES SALTARTE LA ESCRITURA DE ISR CON `connection()`. NO SE PUEDE.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * El plan original de esta allowlist era más ambicioso: una ficha fuera de la
 * lista se renderizaría igual pero **sin escribir en la caché ISR**, forzando
 * un render dinámico con `connection()` de `next/server`. Se implementó y se
 * probó contra `next start`. No funciona en Next 16 sin PPR, y merece la pena
 * dejar escrito el porqué exacto para que nadie vuelva a gastar la tarde.
 *
 * Primer intento, `await connection()` a secas: **HTTP 500**. `connection()` en
 * el pase de generación estática (`prerender-legacy`) pone `revalidate = 0` en
 * el store y lanza un `DynamicServerError` para que Next aborte y reintente en
 * dinámico. Ese reintento vive en el `catch` de la raíz del render, y su propio
 * comentario avisa: *"si un bailout llega hasta aquí, es que no estaba dentro de
 * un suspense boundary"*. Aquí sí lo está, dos veces: `app/layout.tsx` mete la
 * página dentro de `Providers` + `ClientLayout`, que son componentes de cliente,
 * así que la página viaja como fila propia del payload RSC; y `movies/[id]` y
 * `series/[id]` tienen además su `loading.tsx`, que es un `<Suspense>`
 * explícito. El error se queda dentro, React lo sustituye por su versión con
 * digest y lo que llega al navegador es un 500.
 *
 * Segundo intento, capturar el `DynamicServerError` para quedarnos con el
 * efecto (`revalidate = 0`) y descartar la interrupción: **HTTP 500 otra vez**,
 * y con el mensaje que lo explica todo:
 *
 *   Error: Page changed from static to dynamic at runtime /movies/550,
 *   reason: connection
 *
 * Es una comprobación explícita del runtime de Next
 * (`next/dist/build/templates/app-page.js`):
 *
 *   if (isSSG && cacheControl?.revalidate === 0 && !isDev && !isRoutePPREnabled)
 *     throw ...
 *
 * Y `isSSG` sale de `prerenderManifest.dynamicRoutes[srcPage]`, o sea de tener
 * `generateStaticParams` — que es justo lo que estas rutas necesitan para ser
 * ISR y no dinámicas. La conclusión es que las dos cosas son excluyentes: en el
 * modelo de caché clásico, **el carácter estático de una ruta se decide en
 * build y no admite excepciones por parámetro en runtime**. No es un problema
 * de `connection()`: `unstable_noStore()`, `headers()` y `cookies()` acaban
 * todos en `markCurrentScopeAsDynamic`, que pone el mismo `revalidate = 0`.
 *
 * La única salida que deja esa condición es `isRoutePPREnabled`, y PPR se
 * habilita en `next.config.js` (`experimental.ppr: "incremental"` más un
 * `export const experimental_ppr = true` por ruta); sin la bandera de config, el
 * export por ruta se ignora. Queda anotado para quien lleve ese fichero.
 *
 * ── Qué se hace en su lugar ──────────────────────────────────────────────────
 * Lo que sí está en pie, y es lo que de verdad acota el gasto:
 *
 * 1. **El grafo cerrado** (`markLinkableCast` + `filterLinkableCredits`). Una
 *    ficha que nadie enlaza no la visita ningún rastreador, así que no se
 *    renderiza y no llega a escribir entrada de caché. Se ataca la causa —el
 *    recorrido automático— en vez del síntoma.
 * 2. **`noindex` fuera de la allowlist**, en los `generateMetadata`. Corta el
 *    tráfico recurrente de quien ya conozca la URL.
 * 3. **Prerender en build de la allowlist**, en `generateStaticParams`.
 *
 * Con eso, la escritura de ISR queda gobernada por el tráfico humano —el
 * buscador de `/categories`, los favoritos, la biblioteca—, que es exactamente
 * la población que sí queremos en caché. Lo que se ha eliminado no es la
 * escritura, es que un rastreador pueda provocarla un millón de veces.
 */

/** Marca de enlazabilidad que viaja con cada actor hasta `ActorCard`. */
export type Linkable<T> = T & { enlazable: boolean };

/**
 * Decide qué tarjetas de reparto pueden emitir `<Link>`.
 *
 * Es la mitad de la tijera que cierra el ciclo: `ActorCard` es un componente de
 * cliente colgando de `CastSection`, que también lo es, así que no puede
 * preguntar por sí mismo a una allowlist que se resuelve en el servidor. La
 * decisión se toma en el Server Component de la ruta —el único sitio que sabe
 * si la ficha está permitida— y baja pegada al propio actor, que ya viaja por
 * ese árbol.
 *
 * El orden del array es el `order` de facturación de TMDB, que `credits.cast`
 * respeta y ningún mapper reordena, así que el índice sirve de tope sin tener
 * que leer el campo.
 *
 * Lo que NO gobierna esto es si la ficha de origen está en la allowlist, y es
 * deliberado. Una primera versión desactivaba el reparto **entero** en las
 * fichas de fuera, y eso rompía a la persona que llega desde el buscador de
 * `/categories` o desde sus favoritos: se encontraba 60 tarjetas de reparto
 * muertas sin ninguna señal de por qué. El encargo era explícito en no romper
 * la navegación existente.
 *
 * Y no hacía falta para cerrar el ciclo. Una ficha de fuera de la allowlist no
 * es alcanzable por ningún `<Link>` desde `/` (los carruseles navegan con
 * `router.push` sobre un `<div>`), así que sus enlaces de salida no pueden
 * alargar un rastreo que empiece en la portada. Y el ciclo se corta igual un
 * paso después: `/actor/[id]` solo enlaza títulos permitidos, así que desde una
 * persona no se puede volver a salir al espacio abierto de TMDB. El tope de
 * `LINKABLE_CAST_LIMIT` sigue acotando el abanico en cada salto.
 */
export function markLinkableCast<T>(cast: readonly T[]): Linkable<T>[] {
  return cast.map((actor, index) => ({
    ...actor,
    enlazable: index < LINKABLE_CAST_LIMIT,
  }));
}

/**
 * Claves `"<tipo>/<id>"` de la filmografía de un actor que sí pueden enlazarse.
 *
 * La otra mitad de la tijera. `ActorPage` es cliente y elige sus veinte
 * créditos por `vote_average`, así que en lugar de duplicar ese criterio en el
 * servidor se le pasa la intersección de **todos** sus créditos con la
 * allowlist y allí se consulta. La intersección de ~126 créditos con 88 títulos
 * curados son cero o un puñado de entradas, así que lo que se añade al payload
 * RSC es despreciable; enviar la allowlist entera habría costado ~1 KB en cada
 * ficha de actor.
 */
export async function filterLinkableCredits(
  credits: readonly { id: number; media_type: "movie" | "tv" }[],
): Promise<string[]> {
  const { movies, series } = await buildAllowlist();

  const keys = new Set<string>();
  for (const credit of credits) {
    if (credit.media_type === "tv") {
      if (series.has(credit.id)) keys.add(`series/${credit.id}`);
    } else if (movies.has(credit.id)) {
      keys.add(`movies/${credit.id}`);
    }
  }

  return [...keys];
}
