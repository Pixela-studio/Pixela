const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL;

if (!TMDB_API_KEY) {
  throw new Error("TMDB_API_KEY is not defined in environment variables");
}

type TmdbParams = Record<string, string | number | boolean | undefined>;

/** Frescura por defecto de la Data Cache: el catálogo no es tiempo real. */
const DEFAULT_REVALIDATE_SECONDS = 3600;

/**
 * Tiempo máximo que se espera a TMDB.
 *
 * Sin él, un TMDB lento dejaba la petición colgada hasta el timeout del
 * socket (minutos): la función ocupada, la conexión abierta y, durante un
 * render de ISR, la página entera esperando. Ocho segundos sobran para una API
 * que responde en decenas de milisegundos.
 */
const TIMEOUT_MS = 8_000;

/**
 * Peticiones a TMDB en vuelo a la vez, por proceso.
 *
 * TMDB corta hacia las ~40 req/s por IP y responde 429. Lo que podía pasar de
 * ahí eran los abanicos sin tope: `enrichWithTmdb` lanza una petición por
 * favorito, así que un perfil con 300 favoritos disparaba 300 a la vez desde
 * la IP del servidor, y en un servidor compartido esa IP es la de todos. Con
 * este tope la ráfaga se encola en vez de chocar contra el límite.
 */
const MAX_CONCURRENT = 8;

/** Un reintento, y solo ante errores que TMDB documenta como transitorios. */
const RETRYABLE_STATUS = new Set([429, 502, 503, 504]);
const MAX_RETRY_WAIT_MS = 2_000;

let inFlight = 0;
const queue: (() => void)[] = [];

async function withSlot<T>(task: () => Promise<T>): Promise<T> {
  if (inFlight >= MAX_CONCURRENT) {
    await new Promise<void>((resolve) => queue.push(resolve));
  }
  inFlight += 1;
  try {
    return await task();
  } finally {
    inFlight -= 1;
    queue.shift()?.();
  }
}

/** Espera de `Retry-After` en ms, acotada para no retener la petición. */
function retryDelay(res: Response): number {
  const seconds = Number(res.headers.get("retry-after"));
  const wanted = Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 500;
  return Math.min(wanted, MAX_RETRY_WAIT_MS);
}

export interface TmdbFetchOptions {
  /**
   * Segundos en la Data Cache de Next, o `false` para no cachear.
   *
   * `false` es para consultas de espacio infinito (la búsqueda): cachearlas no
   * ahorra nada, porque cada término nuevo es un fallo garantizado, y en un
   * despliegue propio cada entrada es un fichero en `.next/cache` que nadie
   * borra. Un bot con términos aleatorios llenaría el disco.
   */
  revalidate?: number | false;
}

export const fetchFromTmdb = async <T = unknown>(
  endpoint: string,
  params: TmdbParams = {},
  { revalidate = DEFAULT_REVALIDATE_SECONDS }: TmdbFetchOptions = {},
): Promise<T> => {
  const baseUrl = TMDB_BASE_URL?.replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');

  const url = new URL(`${baseUrl}/${cleanEndpoint}`);

  url.searchParams.append("api_key", TMDB_API_KEY!);
  url.searchParams.append("language", "es-ES");

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, String(value));
    }
  });

  const cacheOptions: RequestInit =
    revalidate === false ? { cache: "no-store" } : { next: { revalidate } };

  const request = () =>
    withSlot(() =>
      fetch(url.toString(), {
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(TIMEOUT_MS),
        ...cacheOptions,
      }),
    );

  let res = await request();

  if (RETRYABLE_STATUS.has(res.status)) {
    await new Promise((resolve) => setTimeout(resolve, retryDelay(res)));
    res = await request();
  }

  if (!res.ok) {
    throw new Error(`TMDB Error: ${res.status} - ${res.statusText}`);
  }

  return res.json() as Promise<T>;
};
