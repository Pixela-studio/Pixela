import { NextResponse } from "next/server";

/**
 * Rate limiter en memoria (ventana fija).
 *
 * Limitación conocida: el estado vive en el proceso, así que en un despliegue
 * serverless con varias instancias el límite efectivo se multiplica por el
 * número de instancias activas. Aun así frena el caso real que nos importa
 * —fuerza bruta y spam de registro desde una misma IP— sin añadir Redis.
 * Si el proyecto crece, sustituir el `Map` por Upstash/Redis manteniendo la firma.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Evita que el Map crezca sin límite si llegan muchas claves distintas. */
const MAX_BUCKETS = 10_000;

function pruneExpired(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitOptions {
  /** Identificador del grupo de límite, p.ej. "register". */
  name: string;
  /** Número máximo de peticiones permitidas en la ventana. */
  limit: number;
  /** Duración de la ventana en milisegundos. */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Extrae la IP del cliente de las cabeceras de proxy habituales.
 * Vercel siempre envía `x-forwarded-for`.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function checkRateLimit(
  identifier: string,
  { name, limit, windowMs }: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const key = `${name}:${identifier}`;

  if (buckets.size > MAX_BUCKETS) pruneExpired(now);

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  existing.count += 1;

  if (existing.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  return {
    allowed: true,
    remaining: limit - existing.count,
    retryAfterSeconds: 0,
  };
}

/**
 * Aplica un límite y, si se supera, devuelve la respuesta 429 lista para usar.
 */
export function enforceRateLimit(
  request: Request,
  options: RateLimitOptions,
  identifier = getClientIp(request),
): NextResponse | null {
  const result = checkRateLimit(identifier, options);

  if (result.allowed) return null;

  return NextResponse.json(
    { success: false, error: "Demasiadas peticiones. Inténtalo más tarde." },
    {
      status: 429,
      headers: { "Retry-After": String(result.retryAfterSeconds) },
    },
  );
}
