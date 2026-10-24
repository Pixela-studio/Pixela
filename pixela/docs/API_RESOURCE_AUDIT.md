# Auditoría de APIs externas y recursos

Fecha: 2026-10-24. Rama de partida: `refactor/full-audit-security-uiux` (`4db8d30`).

Objetivo: que Pixela, desplegado con `Dockerfile.prod` en un servidor propio y
probablemente compartido (Coolify), no se coma ni la cuota de TMDB ni la CPU,
la memoria o las conexiones a Postgres del resto de servicios.

El proyecto ya venía de una auditoría de cuota de Vercel (ver `CLAUDE.md`,
"Request budget"), así que buena parte del trabajo de caché estaba hecho. Lo
que cambia con el despliegue propio es que **ya no hay CDN delante**: las
cabeceras `s-maxage` que antes absorbían el tráfico en Vercel aquí no las
honra nadie, y cada petición a `/api/*` llega al proceso de Node. La Data Cache
de Next sigue evitando llamadas repetidas a TMDB, pero la protección de la
función pasa a depender del propio código.

---

## 1. Inventario de APIs externas

Solo hay **un proveedor de API**: TMDB (`api.themoviedb.org/3`), con una única
clave (`TMDB_API_KEY`, solo en servidor). Todas las llamadas pasan por
`fetchFromTmdb` (`src/lib/tmdb.ts`), que añade `api_key` y `language=es-ES`.

Las imágenes vienen de `image.tmdb.org` y las descarga el **navegador**
directamente (loader propio en `src/lib/imageLoader.js`): no cuestan CPU ni
ancho de banda al servidor.

| Origen | Endpoint TMDB | Llamadas | Caché |
|---|---|---|---|
| Portada (`app/page.tsx`, ISR 1 h) | `movie/1317288`, `trending/all/day`, `trending/{movie,tv}/week`, `movie/now_playing`, `discover/{movie,tv}` ×2 (finde y descubrir) | ~9 por regeneración | Data Cache 1 h, compartida con la allowlist |
| Fichas `/movies/[id]`, `/series/[id]` (ISR 1 h) | `{movie,tv}/{id}?append_to_response=credits,videos,images,similar,watch/providers` | 1 por id y hora (`generateMetadata` y render comparten URL) | Data Cache 1 h |
| Actor `/actor/[id]` (ISR 1 h) | `person/{id}?append_to_response=combined_credits` | 1 por id y hora | Data Cache 1 h |
| `/api/{movies,series}/discover`, `/api/[type]/genre/[id]`, `/trending` | `discover/*`, `trending/*/week` | 1 por URL distinta y hora | Data Cache 1 h |
| `/api/{movies,series}/search` | `search/{movie,tv}` | 1 por consulta (×2 si se busca en "todo") | **Ninguna** desde este cambio (ver C3) |
| `/api/tmdb/categories` | `genre/{movie,tv}/list` | 2 por semana | Data Cache 7 días (C4) |
| `/api/favorites/details`, `/api/library/details`, `GET /api/reviews` | `{movie,tv}/{id}` por cada fila del usuario | N por perfil (deduplicado en favoritos/biblioteca) | Data Cache 1 h |
| `/api/banners` (autenticado) | `trending/{movie,tv}/week` | Comparte caché con tendencias | `private, max-age=3600` |
| `/api/{movies,series}/[id]` y `/images` | detalle e imágenes | **Sin consumidores en el código** | Data Cache 1 h |

No hay crons, colas ni procesos en segundo plano. Los únicos `setInterval` son
del carrusel en el navegador.

---

## 2. Límites del proveedor y consumo estimado

**TMDB** ([documentación de rate limiting](https://developer.themoviedb.org/docs/rate-limiting)):
no hay cuota diaria ni mensual. El límite es por IP, "en torno a 40 peticiones
por segundo", puede cambiar sin aviso y se señala con `429`. El antiguo límite
de 40 peticiones cada 10 s se retiró en diciembre de 2019.

Lo relevante para un servidor compartido es que el límite es **por IP**: si
otros servicios del mismo servidor usan TMDB, comparten el cupo.

### Estimación con tráfico moderado

Supuestos: 5.000 visitas/día, ~15.000 páginas vistas, 50 usuarios con sesión
que abren su perfil, ~100 fichas distintas vistas por hora y 1.000 búsquedas al
día.

| Fuente | Llamadas TMDB/día |
|---|---|
| Portada: 9 llamadas × 24 regeneraciones | ~220 |
| Fichas y actores: ~100 ids distintos/h × 24 | ~2.400 |
| `/categories` (descubrir/género): ~150 URLs distintas/h | ~3.600 |
| Búsqueda: 1.000 consultas × 2 tipos, sin caché | ~2.000 |
| Perfiles: 50 × ~30 títulos, caché de 1 h | ~1.500 |
| **Total** | **~10.000/día** |

Media: ~0,12 req/s. Pico razonable (×20 sobre la media): ~2-3 req/s. Es
**menos del 10 % del límite** de TMDB. Con el tráfico real de un proyecto de
portfolio la cifra será un orden de magnitud menor.

Lo que sí podía chocar contra el límite no era el volumen sino **las ráfagas**:
un perfil con 300 favoritos lanzaba 300 peticiones simultáneas, y el build
prerenderiza ~90 fichas con 23 workers en paralelo. Eso es lo que corrigen C1 y
C7.

---

## 3. Hallazgos priorizados

Impacto: lo que se gana o el daño que se evita. Esfuerzo: lo que cuesta
arreglarlo. "Hecho" lleva el commit de esta rama.

### Corregidos en esta rama

| # | Hallazgo | Impacto | Esfuerzo | Estado |
|---|---|---|---|---|
| C1 | `fetchFromTmdb` sin timeout, sin reintento y sin tope de concurrencia. Un TMDB lento colgaba peticiones y renders de ISR hasta el timeout del socket; un perfil con muchos favoritos disparaba cientos de peticiones a la vez | Alto | Bajo | Hecho (`d26109e`): 8 s de timeout, como mucho 8 peticiones en vuelo por proceso, un reintento ante 429/502/503/504 respetando `Retry-After` (máx. 2 s) |
| C2 | Proxy de TMDB sin límite salvo la búsqueda. Sin CDN, cada id o filtro nuevo es una llamada a TMDB con nuestra clave y una entrada en `.next/cache` | Alto | Bajo | Hecho (`8b76d4b`): 120 req/min por IP en descubrir, género, tendencias, detalle e imágenes |
| C3 | La búsqueda se guardaba en la Data Cache. Espacio de consultas infinito: no ahorra nada y cada término es un fichero en disco que nadie borra; un bot con términos aleatorios llenaría el disco | Alto | Bajo | Hecho (`8b76d4b`): `revalidate: false` en la búsqueda |
| C4 | Géneros revalidados cada hora, y sin CDN cada visita a `/categories` despertaba la ruta | Bajo | Bajo | Hecho (`892bb76`): 7 días |
| C5 | Login sin rate limit. Cada intento es un `bcrypt.compare` de coste 12 (~200-300 ms de CPU en bcryptjs): fuerza bruta y consumo de CPU a la vez | Alto | Bajo | Hecho (`a8e3393`): 10/min por IP y 10 cada 15 min por cuenta, antes de tocar la base de datos |
| C6 | Pool de Prisma sin dimensionar: por defecto `núcleos × 2 + 1`, y en un contenedor cuenta los núcleos del host (33 conexiones en una máquina de 16) contra un `max_connections` compartido | Alto | Bajo | Hecho (`dab784a`): `connection_limit=5` y `pool_timeout=10` si `DATABASE_URL` no los trae |
| C7 | `next build` usa `núcleos − 1` workers (23 en esta máquina). Coolify construye en el mismo servidor que sirve el resto | Medio | Bajo | Hecho (`7e3cd43`): `NEXT_BUILD_CPUS` (2 por defecto en `Dockerfile.prod`) |
| C8 | `getMediaReviews` filtra por `(item_type, tmdb_id)` y el único índice empieza por `user_id`: escaneo completo de `reviews` en cada regeneración de ficha | Medio | Bajo | Hecho (`c5be528`): índice `(item_type, tmdb_id, created_at DESC)`, verificado con `EXPLAIN` |

C8 requiere aplicar la migración: `bunx prisma migrate deploy` contra la base
de producción. El contenedor no la ejecuta al arrancar.

### Pendientes, por prioridad

| # | Hallazgo | Impacto | Esfuerzo | Recomendación |
|---|---|---|---|---|
| P1 | **Límites de CPU y memoria del contenedor.** `Dockerfile.prod` no los fija (no puede: se ponen al ejecutar). Sin límite, una fuga o un pico de render puede llevarse la memoria del servidor | Alto | Bajo | En Coolify, *Resource Limits* de la aplicación: memoria 768 MB (con reserva de 384 MB), 1 CPU. Node 22 dimensiona el heap a partir del límite del cgroup, así que no hace falta `--max-old-space-size`. Es configuración de producción: queda para el usuario |
| P2 | **Fichas de cualquier id de TMDB se escriben en la caché ISR.** `dynamicParams = true` hace renderizable y cacheable cualquiera de los millones de ids (documentado en `tmdbAllowlist.ts`). El grafo de enlaces ya está cerrado, pero quien enumere ids a mano llena `.next/cache` (~100-200 KB por ficha) y llama a TMDB por cada uno | Medio | Medio | Rate limit en Traefik para `/movies/*`, `/series/*` y `/actor/*` (middleware `rateLimit` vía etiquetas en Coolify), o un límite en `src/proxy.ts`. Vigilar el tamaño de `.next/cache` |
| P3 | **IP del cliente detrás de otro proxy.** `getClientIp` toma el primer valor de `X-Forwarded-For`. Con Traefik a pelo es correcto (descarta las cabeceras que no vienen de IPs de confianza), pero si se pone **Cloudflare delante** todas las peticiones llegan con IPs de Cloudflare y todos los usuarios comparten el mismo cupo; y si Traefik tiene `forwardedHeaders.insecure`, la IP es falsificable | Medio | Bajo | Si se añade Cloudflare: leer `CF-Connecting-IP` y configurar `trustedIPs` en Traefik con los rangos de Cloudflare |
| P4 | **Sin CDN delante**, todas las cabeceras `s-maxage`/`stale-while-revalidate` son decorativas: cada petición a `/api/*` y cada página despiertan Node | Medio | Bajo | Poner Cloudflare (gratuito) delante del dominio en modo proxy. Recupera la caché en el edge que había en Vercel. Implica P3 |
| P5 | **Perfil: descargas completas para contar.** `useProfileStats` pide `favorites/details` y `reviews` (con enriquecido de TMDB) solo para mostrar dos números, y `ProfileFavorites`/`ProfileReviews` vuelven a pedir lo mismo. Además ninguna de las tres rutas pagina: `findMany` sin `take` | Medio | Medio | Ruta de estadísticas con `prisma.*.count()` y paginación (`take`/cursor) en favoritos, biblioteca y reseñas |
| P6 | **Superficie sin uso.** `/api/{movies,series}/[id]` y `/images` no tienen consumidores (`getMediaImages` de `galleryService.ts` es código muerto y la ficha ya trae `images` en `append_to_response`). Ahora están limitadas, pero no aportan nada | Bajo | Bajo | Borrar las cuatro rutas y `galleryService.ts` |
| P7 | **Healthcheck sobre `/`.** Cada 30 s sirve la portada entera (HTML de ISR, sin llamadas a TMDB). Barato, pero innecesario | Bajo | Bajo | Apuntarlo a `/robots.txt` o a una ruta `/api/health` mínima |
| P8 | **Caché en disco efímera.** `.next/cache` vive en la capa del contenedor: cada redeploy arranca en frío (~90 fichas prerenderizadas en build y el resto a la primera visita). Es correcto, pero si se monta un volumen para conservarlo, hay que acotar su crecimiento (P2) | Bajo | Bajo | No montar volumen salvo que haga falta; si se monta, limpiarlo en cada despliegue |
| P9 | **Fetch del navegador sin timeout** (`fetchFromAPI`). Afecta a la experiencia, no al servidor | Bajo | Bajo | `AbortSignal.timeout` en `fetchFromAPI` |
| P10 | **Bloqueo de cuenta por el límite de login.** C5 limita por email: un atacante puede bloquear el login de una cuenta durante 15 minutos | Bajo | — | Aceptado conscientemente. Si molesta, subir el límite por cuenta o quitarlo y dejar solo el de IP |

### Revisado y sin problemas

- **Llamadas del servidor a su propia API:** ninguna (lo corrigió la auditoría
  anterior). Los clientes de `src/api/**` solo se usan en el navegador.
- **N+1 contra TMDB en la ficha:** no hay. Una sola llamada con
  `append_to_response` trae créditos, vídeos, imágenes, similares y
  plataformas; `generateMetadata` y el render comparten la entrada de la Data
  Cache.
- **`revalidate`:** 1 h en portada, fichas y actor, igual que la Data Cache. Es
  razonable para un catálogo que cambia a diario; ninguna página usa
  `force-dynamic`.
- **Peticiones del cliente que deberían ir en el servidor:** las reseñas de la
  ficha ya se leen en servidor (`getMediaReviewsSafe`). Lo que queda en el
  cliente es interactivo (`/categories`) o privado (perfil), y está bien ahí.
- **Deduplicación:** `enrichWithTmdb` deduplica por `(tipo, id)`; la búsqueda
  tiene 500 ms de debounce en el formulario y 30 req/min en el servidor.
- **Imágenes:** las de TMDB no pasan por el optimizador (0 CPU en servidor). Las
  locales pesan 24 KB en total, así que `sharp` apenas trabaja.
- **Imagen Docker:** standalone sobre `node:22-trixie-slim`, ~480 MB (la última
  construida localmente, `pixela:prod-test`), de los que ~80 MB son la app. Sin
  `node_modules` completo, usuario sin privilegios y secretos por BuildKit.
- **Rate limiter en memoria:** con un solo contenedor el estado es exacto. Si se
  escala a varias réplicas, el límite se multiplica (ver `CLAUDE.md`).

---

## 4. Verificación

- `bun run typecheck`: sin errores.
- `bun run lint`: 1 error y 22 avisos, los mismos que antes de los cambios (el
  error es el `require()` preexistente de `next.config.js`).
- `bun run build`: correcto, 116 páginas. Con `NEXT_BUILD_CPUS=2` el
  prerender usa 2 workers en lugar de 23 (18 s frente a 7 s).
- Migración del índice aplicada contra un Postgres 16 desechable:
  `prisma migrate diff` no detecta diferencias con el schema y el plan de la
  consulta de reseñas pasa a `Index Scan`.
- No hay suite de tests en el proyecto (`package.json` no define `test`).
- Los errores de Prisma que aparecen en el build son los de la base de Supabase
  eliminada (ver `CLAUDE.md`); `getMediaReviewsSafe` los tolera y no son
  nuevos.
