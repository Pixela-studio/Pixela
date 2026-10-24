import { PrismaClient } from '@prisma/client'

/**
 * Tamaño de la pool de conexiones si `DATABASE_URL` no lo fija.
 *
 * Prisma abre por defecto `núcleos × 2 + 1` conexiones, y dentro de un
 * contenedor cuenta los núcleos del **host**: en un servidor de 16 núcleos son
 * 33 conexiones para una app que rara vez hace más de dos consultas a la vez,
 * contra un Postgres cuyo `max_connections` (100 por defecto) comparten todos
 * los servicios del servidor. Cinco sobran para este tráfico.
 *
 * `pool_timeout` acota cuánto espera una consulta por una conexión libre antes
 * de fallar, en vez de acumular peticiones colgadas.
 *
 * Si la URL ya trae `connection_limit` o `pool_timeout`, mandan los de la URL.
 */
const POOL_DEFAULTS = { connection_limit: '5', pool_timeout: '10' }

function withPoolDefaults(rawUrl: string | undefined): string | undefined {
  if (!rawUrl) return rawUrl
  try {
    const url = new URL(rawUrl)
    for (const [key, value] of Object.entries(POOL_DEFAULTS)) {
      if (!url.searchParams.has(key)) url.searchParams.set(key, value)
    }
    return url.toString()
  } catch {
    // Una URL que `URL` no entiende se deja tal cual: que la valide Prisma.
    return rawUrl
  }
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasourceUrl: withPoolDefaults(process.env.DATABASE_URL),
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
