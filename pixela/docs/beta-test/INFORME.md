# Informe de beta test de Pixela: síntesis del product manager

> Todas las rutas son relativas a `pixela/src/` salvo que se indique otra cosa. Cada crítica se ha comprobado en el código (solo lectura). Lo marcado como **plausible** tiene el mecanismo confirmado en el código, pero no se ha podido reproducir: la base de datos de Supabase no existe, así que no se pudo probar nada que requiera sesión.

---

## 1. Resumen ejecutivo

**Nota media: 2,58 / 5** (Lucía 2,5 · Marcos 2,5 · Carmen 3 · Iván 3,5 · Sara 2 · Diego 2).

**Cinco conclusiones clave**

1. **Una sola causa explica tres quejas distintas.** Las tarjetas son `div onClick={router.push}` y su información solo aparece con `group-hover` (`features/trending/components/content/TrendingMediaCard.tsx:55`, `:99`; `features/categories/components/core/CategoriesContent.tsx:308`, `:602`). Por eso Marcos no puede guardar nada desde el móvil, Carmen no ve los títulos en la tablet y Sara no puede entrar en ninguna ficha con el teclado. Además, los buscadores no ven enlaces internos. Es el arreglo que más devuelve de toda la beta y lo votaron los 6.
2. **La identidad visual gusta a todos.** Los 6 alaban la estética: oscuro, magenta y un hero a pantalla completa. Nadie pide un rediseño. Lo que falla es la funcionalidad que hay debajo.
3. **La comunidad está escondida.** Las reseñas se cargan en el servidor y luego se ocultan a quien no tiene sesión (`features/media/components/review/ReviewSection.tsx:105`). Una reseña nueva sustituye a la anterior sin avisar (`app/api/reviews/route.ts:104`) y el README promete una "comunidad activa de reseñas" (`README.md:10`).
4. **Hay arreglos de una hora que molestaron a los 6:** el toast "Marcado como WATCHING", el registro que rechaza tildes y espacios, el placeholder "Username" y los formularios sin etiqueta ni foco visible.
5. **Cada perfil quiere algo distinto.** Diego y Marcos piden seguimiento de episodios. Carmen quiere saber qué ver esta noche en sus plataformas. Lucía quiere que su contenido sea público. La apuesta que mejor encaja con lo que Pixela ya tiene (España, plataformas y FINDE EN CASA) es **"Mis plataformas" con "¿Qué veo esta noche?"**. El seguimiento por episodios es la mejor demostración técnica para el portfolio, pero también lo más caro.

---

## 2. Tabla de testers

| Persona | ★ | Titular | ¿Seguiría usándola? |
|---|---|---|---|
| Lucía, 34, diseñadora, usa Letterboxd | 2,5 | "Muy mona por fuera, pero para quien vive de reseñas y listas se queda en escaparate" | No como app principal. Volvería por FINDE EN CASA. Se pasaría si hubiera listas, diario, reseñas públicas e importación. |
| Marcos, 19, estudiante, solo móvil | 2,5 | "Muy bonita, pero para seguir series se queda cortísima" | Solo para curiosear. Vuelve si hay episodios y buscador global. |
| Carmen, 58, jubilada, tablet | 3 | "Para saber dónde ver algo tengo que entrar película por película" | Para decidir qué ver, todavía no. Se quedaría con la plataforma en cada cartel y "mis plataformas". |
| Iván, 38, tech lead que revisa portfolios | 3,5 | "Backend más sólido de lo habitual, pero el front todavía tiene cosas de proyecto de clase" | Como usuario no. Como revisor sí: el candidato pasaría a entrevista, y subiría con tests, CI, `<Link>` y un README honesto. |
| Sara, 27, baja visión, NVDA y solo teclado | 2 | "Bonita a la vista, pero con el teclado me quedo en la puerta" | No. Volvería con tarjetas-enlace, etiquetas en los formularios y foco visible. |
| Diego, 42, usa Trakt y TV Time | 2 | "Muy bonita para descubrir, pero no sirve para seguir series" | No como herramienta principal. Vuelve si hay episodios, calendario e importación. |

---

## 3. Críticas confirmadas por tema

La columna "Testers" indica cuántos lo mencionan.

### 3.1 UX y flujos

| Crítica | Gravedad | Testers | Evidencia | Arreglo propuesto |
|---|---|---|---|---|
| Una reseña nueva sustituye a la anterior sin avisar y el modal no precarga la existente | Alta | 3 (Lucía, Marcos, + foro) | `app/api/reviews/route.ts:104` (`upsert`); `features/media/components/review/ReviewModal.tsx:90-91` y `:105` (reset a `{rating: 6, review: ''}`) | Al abrir el modal, si el usuario ya tiene reseña, precargarla y titular el modal "Editar tu reseña". La API debería distinguir crear (POST, 409 si ya existe) de editar (PUT). |
| El modal arranca con 3 estrellas puestas | Media | 3 (Lucía, Marcos, Carmen) | `ReviewModal.tsx:91` `rating: 6 // Default: 3 estrellas` | Empezar con `rating: null` y desactivar "Guardar" hasta que se elija una nota. |
| Toast "Marcado como WATCHING" | Media (vergüenza visible) | **6/6** | `features/media/hooks/useLibraryStatus.ts:56` | Mapear con las etiquetas que ya usa `LibraryButton` (Planeado, Viendo, etc.). Es una línea. |
| Registro: no admite tildes, ñ, "Mª" ni espacios; el error llega después de enviar; placeholder "Username" | Media | 5 (Lucía, Marcos, Carmen, Sara, Iván) | `app/api/auth/register/route.ts:25`; `app/(auth)/register/page.tsx:93` | Separar el `displayName` (Unicode libre, de 2 a 40 caracteres, `\p{L}`) de un `handle` opcional. Validar en el cliente igual que en la API (compartir el esquema zod). Placeholder "Nombre". |
| Categorías no guarda nada en la URL: Atrás o recargar lo pierde todo | Alta | 5 (Lucía, Marcos, Iván, Sara, Diego) | `features/categories/components/core/CategoriesContainer.tsx:133` fuerza `handleMediaTypeChange("all")` | Usar `useSearchParams` con `?type=&genre=&q=&page=` como fuente de verdad e hidratar el store de zustand desde ahí. |
| Solo se busca dentro de Categorías y no encuentra personas | Media | **6/6** | Navbar sin buscador; la búsqueda solo llama a `/api/{movies,series}/search` | Buscador global en la navbar (⌘K o un icono) contra `search/multi` de TMDB, que ya devuelve personas. |
| Las búsquedas que se escriben durante una carga se descartan | Media (**plausible**: mecanismo confirmado, sin reproducir) | 2 (Marcos, Iván) | `features/categories/hooks/useContentLoader.ts:314`, `:418` (`if (isLoadingRef.current) return`) | Sustituir el booleano por un contador de petición o un `AbortController` y quedarse solo con la última respuesta. Ya existe el patrón en `useAsyncResource`. |
| No se puede gestionar la biblioteca desde el perfil, ni ordenarla, ni ver fechas | Media | 3 (Marcos, Diego, Lucía) | `ProfileLibrary.tsx` ("Cambia el estado de un título desde su ficha"); `prisma/schema.prisma`: `LibraryItem` tiene `createdAt` y `updatedAt` que no se muestran | Menú contextual de estado en cada póster, ordenar por fecha (los datos ya existen) y filtrar película o serie. |
| "Actividad Reciente" siempre vacía | Baja | 2 (Marcos, Diego) | `features/profile/components/ProfileClient.tsx:250` (texto fijo) | Rellenarla con los últimos `updatedAt` de biblioteca, reseñas y favoritos, o quitar el bloque. |
| Explorar catálogo desde Descubre no preselecciona Series | Baja | 0 (lo detectó el mapa) | `features/discover/components/core/DiscoverContent.tsx:88` frente a `CategoriesContainer.tsx:133` | Se resuelve solo con el estado en la URL (`/categories?type=series`). |
| "Mi biblioteca" del footer abre la pestaña General | Baja | 0 (mapa) | `features/footer/constants/links.ts:22` | `/profile?tab=library` y leer esa pestaña desde la URL. |

### 3.2 Móvil y tablet

| Crítica | Gravedad | Testers | Evidencia | Arreglo propuesto |
|---|---|---|---|---|
| Título, nota y marcador solo aparecen con hover, y tocar navega directamente | **Alta** | 3 (Marcos, Carmen, Sara) | `TrendingMediaCard.tsx:55` (`opacity-0 group-hover:opacity-100`), `:99` | En `@media (hover: none)` dejar visibles el título y el marcador. El título se pone siempre bajo el póster como pie de imagen. El marcador queda como botón independiente que no propaga el clic. |

### 3.3 Accesibilidad

| Crítica | Gravedad | Testers | Evidencia | Arreglo propuesto |
|---|---|---|---|---|
| Las tarjetas no son enlaces: el teclado no llega, no hay clic central y los buscadores no ven los enlaces | **Bloqueante** | **6/6** | `TrendingMediaCard.tsx:95-99`; `CategoriesContent.tsx:301-316`, `:577-602` | Envolver la tarjeta en `<Link href>` con el título como nombre accesible y dejar el marcador como `<button>` hermano, no anidado. Añadir foco visible. |
| El marcador de cada tarjeta dice "Añadir a favoritos" sin decir de qué título | Alta | 1 (Sara) | `shared/components/ActionButtons.tsx:78`, `:102` | `aria-label={\`Añadir «${title}» a favoritos\`}`. Ya se hace así en el lápiz de la ficha (`hero/actions/ActionButtons.tsx:98`). |
| Login y registro sin `<label>`, solo con placeholder de bajo contraste | Alta | 1 (Sara) | `app/(auth)/login/page.tsx:76`, `:89`; `register/page.tsx:93-133`; `TextInput.tsx:27` (`placeholder-gray-500/50`) | Que `TextInput` acepte una prop `label` (visible o `sr-only`) asociada por `id`. |
| El foco visible está anulado en los campos clave | Alta | 1 (Sara) + foro | `features/auth/components/TextInput.tsx:27` (`outline-none focus:outline-none focus:ring-0`); `CategoriesContent.tsx:43`; `ReviewModal.tsx:35` | Quitar `outline-none` y usar `focus-visible:ring-2 ring-pixela-accent`, que respeta el anillo global. |
| Editar y borrar reseña solo tienen `title`; el borrado es inmediato | Alta | 2 (Sara, Lucía) | `features/media/components/review/ReviewCard.tsx:103`, `:109-111` | Añadir `aria-label` y un diálogo de confirmación accesible, o mejor un toast "Reseña borrada · Deshacer". |
| Ninguna acción destructiva pide confirmación | Media-alta | 3 (Lucía, Sara, Marcos) | Ningún `confirm(` en `src/` (grep vacío) | Un único `ConfirmDialog` compartido, o un patrón de deshacer con sonner. |
| Error del registro sin `role="alert"` | Media | 1 (Sara) | `register/page.tsx:141-143` | Copiar el patrón del login. |
| El modal de reseña no atrapa el foco; las estrellas no anuncian su estado | Media | 1 (Sara) | `ReviewModal.tsx:115-128` (solo Escape y bloqueo de scroll) | Focus trap (con `inert` sobre el resto, como ya se hace en el menú móvil). Estrellas como `role="radiogroup"` con `aria-checked`. |
| No se respeta `prefers-reduced-motion` | Media | 4 (Sara, Lucía, Carmen, Iván) | Grep: solo aparece en `hooks/README.md`; `CategoriesContent.tsx:310-312` (fade escalonado) | Variante `motion-reduce:` en Tailwind más un hook que pause el autoplay del hero, las partículas y las marquesinas. |
| El menú de biblioteca declara `role="menu"` pero no maneja flechas ni mueve el foco | Media | 1 (Sara) | `features/media/components/actions/LibraryButton.tsx:77-80` (solo Escape) | Navegación con ArrowUp, ArrowDown, Home y End, y foco al primer `menuitemradio` al abrir. |
| `PlatformCard` es `role="button"` sin teclado | Media | 3 (Iván, Sara, Carmen) | `features/media/components/platforms/PlatformCard.tsx:28` | Convertirlo en `<a href target="_blank" rel="noopener">`. Ya es un enlace saliente. |
| Pestañas del perfil y tarjetas de estadísticas sin semántica | Media | 1 (Sara) | `ProfileClient.tsx` (sin `role=tab` ni `aria-selected`); `ProfileStatsBar.tsx:47-50` (`div onClick`) | `role="tablist"`, `tab` y `tabpanel` (ya existe en los filtros de la biblioteca); tarjetas como `<button>`. |
| "¿Olvidaste tu contraseña?" con contraste muy bajo y motivo solo en `title` | Baja | 1 (Sara) | `app/(auth)/login/page.tsx:114-115` (`text-gray-600`) | Quitarlo hasta que funcione, o poner un texto visible "(próximamente)" con contraste AA. |
| Iconos sin texto visible (marcador, lápiz) y favorito con corazón en el perfil frente a marcador en el resto | Media | 1 (Carmen) + Sara en el foro | `features/profile/hooks/useProfileStats.ts:2`, `:10`, `:36` (`FiHeart`) | Etiqueta visible en las acciones de la ficha ("Favorito", "Reseñar") y usar `FaBookmark` en todas partes. |
| Texto alternativo "de la película" en series | Baja | 0 (mapa) | `features/media/components/gallery/GalleryGrid.tsx:67` | Usar el tipo de medio en el texto alternativo. |

### 3.4 Rendimiento

| Crítica | Gravedad | Testers | Evidencia | Arreglo propuesto |
|---|---|---|---|---|
| Ráfaga de `/api/favorites/details`: la caché no deduplica las peticiones en vuelo y cada petición enriquece con TMDB | Media (también es coste de API) | 1 (Iván) | `api/favorites/favorites.ts:10-40` (solo guarda datos resueltos, no hay promesa compartida); `hooks/useFavoriteToggle.ts:49`; `app/api/favorites/details/route.ts:21` (`enrichWithTmdb`) | Guardar una `pendingPromise` en la caché como mínimo. Mejor: un endpoint ligero `/api/favorites/ids`, sin TMDB, cargado una vez en un store o contexto. |
| El marcador aparece tarde en las tarjetas | Baja | 1 (Iván) | `shared/components/ActionButtons.tsx:76` (`return null`) | Se resuelve con lo anterior; mientras tanto, reservar el hueco con un placeholder. |
| La portada carga de golpe y sin skeleton tras el hero | Baja | 0 (mapa) | `app/page.tsx:164` (`fallback={null}`) | Skeletons de carrusel por sección. |

### 3.5 Contenido y datos

| Crítica | Gravedad | Testers | Evidencia | Arreglo propuesto |
|---|---|---|---|---|
| No se ve la plataforma en los carteles de FINDE EN CASA | Alta (para el perfil de Carmen) | 2 (Carmen, Diego) | `features/weekend/services/weekendService.ts:33`, `:69` filtra por monetización pero los tipos no llevan proveedores | Traer los proveedores en la llamada del servidor (ISR de 1 h) y no por tarjeta, que es la condición de Iván. |
| "Disponible en" abre la portada de la plataforma y puede inventarse dominios | Media | 5 (Lucía, Marcos, Carmen, Diego, + Iván por el teclado) | `features/media/components/platforms/platformUtils.ts:54` (`` `https://www.${normalizedName}.com` ``) | Usar el `link` de JustWatch que devuelve `watch/providers` (lleva al título) y eliminar el fallback inventado. |
| Suscripción, alquiler y compra mezclados | Media | 3 (Carmen, Diego, Lucía) | `StreamingProviders.tsx` sin agrupar (no aparece `flatrate`, `rent` ni `buy`) | Tres grupos: "Incluido", "Alquiler" y "Compra". Los datos ya llegan separados de TMDB. |
| Filmografía ordenada por nota sin peso por votos y casi entera sin enlace | Media | 1 (Lucía) | `features/actor/pages/ActorPage.tsx:62`; `lib/api/tmdbAllowlist.ts:114` (`LINKABLE_CAST_LIMIT = 10`) | Ordenar por `popularity` o con un bayesiano `vote_average × f(vote_count)`. Las tarjetas sin enlace deben verse distintas (sin cursor ni hover) o indicar "no disponible". **Ojo:** la allowlist protege el coste (ver la otra sesión); no conviene abrirla sin más. |
| "Similares" se pide a TMDB y no se muestra | Media (es coste sin valor) | 4 (Marcos, Iván, Diego, Carmen) | `lib/api/tmdbDetails.ts:30` (`DETAIL_APPEND` incluye `similar`) | Pintar un carrusel. Si no se va a pintar, quitarlo del `append` para ahorrar carga. |
| Sin estado de emisión ni próximo episodio en las series | Alta (Diego) | 2 (Diego, Marcos) | El mapper no expone `status` ni `next_episode_to_air`, aunque llegan en el detalle | Mostrar "En emisión / Finalizada" y la fecha del próximo episodio. Es solo mapeo, sin peticiones extra. |
| Ficha de película en 404 si `runtime` es null | Media (**plausible**) | 0 (mapa) | `api/peliculas/mapper/mapPelicula.ts:72-75` (`throw` si `isNaN`) | Que `duracion` sea opcional y se oculte en la UI. |
| Primera diapositiva fija ("Marty Supreme") | Baja | 0 (mapa) | `features/hero/services/heroBackdropService.ts:127` | Pasarla a configuración o quitarla. Envejece mal. |
| "Sorpréndeme" promete "seleccionadas especialmente para ti" | Baja | 0 (mapa; Diego lo menciona en el foro) | `CategoriesContent.tsx:720` | Cambiar el texto ahora y personalizarlo después con "Mis plataformas". |
| "Comunidad: Próximamente" | Baja | 0 | `features/about/components/AboutSection.tsx:60` | Quitarlo, o enlazar a las reseñas públicas cuando existan. |

### 3.6 Social

| Crítica | Gravedad | Testers | Evidencia | Arreglo propuesto |
|---|---|---|---|---|
| Las reseñas no se ven sin sesión aunque ya se han cargado | Alta | 4 (Lucía, Marcos, Iván, + Carmen en el foro) | `ReviewSection.tsx:105` | Mostrar las reseñas en modo lectura. Solo escribir exige sesión. Además, nota media Pixela con JSON-LD `AggregateRating`. |
| El admin ve "editar" en reseñas ajenas y el PUT devuelve 403 en silencio | Media | 0 (mapa) | `ReviewSection.tsx:136` (`canEditReview = isUserReview \|\| isAdmin`) frente a `app/api/reviews/[id]/route.ts:44-45` (PUT solo para el autor; DELETE sí admite admin en `:121`) | El admin solo debería ver "Eliminar" en reseñas ajenas, y hay que mostrar el error al usuario. |
| Reseñas del perfil cortadas a 3 líneas, sin "leer más" ni saltos de párrafo | Media | 1 (Lucía) | `features/profile/components/layout/ProfileReviews.tsx:321` (`line-clamp-3`, sin `whitespace-pre-line`) | `whitespace-pre-line` más un botón "Leer más" que quite el clamp. |

### 3.7 Confianza y seguridad

| Crítica | Gravedad | Testers | Evidencia | Arreglo propuesto |
|---|---|---|---|---|
| Sin tests ni CI | Alta (para el portfolio) | 2 (Iván, Diego) | No hay `*.test.*` ni `*.spec.*`, no existe `.github/workflows` y no hay script `test` en `package.json` | Vitest para los esquemas zod, los guards y las rutas de reseñas y favoritos; un Playwright de humo; GitHub Actions con lint, typecheck, test y build. |
| El login no tiene rate limit y el limitador vive en memoria | Media | 2 (Iván, Diego) | `auth.ts` sin `enforceRateLimit` (solo lo usan `register`, `reviews` y `tmdbProxy`); `lib/api/rateLimit.ts:7-18` (un `Map` cuyo comentario reconoce el problema) | Llamar a `enforceRateLimit` en `authorize` por IP y email. Más adelante, Upstash. |
| Validación de contraseña incoherente entre capas | Baja | 2 (Iván, + mapa) | `auth.ts:33` `min(6)`; registro `min(8)`; el formulario de perfil exige mayúscula, número y símbolo | Un único `passwordSchema` compartido. |
| CSP con `unsafe-eval` y `unsafe-inline` | Baja | 1 (Iván) | `proxy.ts:108` (el comentario lo justifica) | CSP con nonce mediante el middleware de Next. Quitar `unsafe-eval` en producción. |
| Sin `error.tsx` ni `global-error.tsx` | Media | 1 (Iván) | Ninguno de los dos ficheros existe | Error boundary con reintento y la estética del 404. |
| README incoherente y con promesas que no se cumplen | Media (para el portfolio) | 1 (Iván) | `README.md:10` ("búsqueda avanzada", "comunidad activa de reseñas"), `:12` "Next.js 15" frente a `:20` "Next.js 16" | Reescribirlo con capturas, decisiones de arquitectura y de coste, y limitaciones conocidas. |
| Sin recuperación de contraseña | Media | 2 (Diego, Carmen) | Enlace deshabilitado en `app/(auth)/login/page.tsx:114-115` | Requiere base de datos y un proveedor de correo (Resend). Va al sprint 3. |
| El avatar no se puede quitar | Baja | 0 (mapa) | `features/profile/components/form/UpdateProfileForm.tsx:129` | Botón "Quitar foto" que envíe `null`. |
| El email de contacto `pixel@pixela.io` no llega a nadie | Baja | 0 (mapa) | `features/footer/components/core/FooterContent.tsx:107-108` | Poner el email real del autor o un enlace a GitHub. |

---

## 4. Casos de uso reales

### Funcionan bien
- **Descubrir qué hay en España este finde** (Diego, Carmen, Lucía): FINDE EN CASA y TOP CARTELERA se entienden a la primera.
- **Explorar una ficha en profundidad** (los 6): tráilers con lista lateral, galería con vista ampliada, reparto con personaje y director o creadores con foto.
- **Iniciar sesión con lector de pantalla** (Sara): `role="alert"`, botón para mostrar la contraseña con `aria-label` y aviso de "Cuenta creada".
- **Pausar el carrusel** (Sara): botón de pausa con `aria-label` y puntos "Ir a imagen N".
- **Marcar estado desde la ficha** (Marcos, Diego, Sara): el desplegable con `aria-expanded`, `menuitemradio` y Escape funciona, aunque el aviso sale en inglés.
- **Escribir una reseña con media estrella** (Lucía, Marcos): la ficha respeta los saltos de línea.
- **Estados vacíos** (Lucía, Diego): biblioteca, reseñas y favoritos.
- **Revisión técnica** (Iván): CSP y HSTS, zod, guards, bcrypt 12, P2002, ISR y loader de imágenes pensados para el coste.

### Se rompen
- **Guardar un título desde la portada en el móvil** (Marcos): imposible, porque el hover no existe en táctil.
- **Saber dónde ver cinco películas esta noche** (Carmen): hay que entrar ficha por ficha y luego el enlace va a la portada de Netflix.
- **Entrar en una ficha con el teclado** (Sara): imposible desde la portada y desde Categorías.
- **Registrarse con su nombre real** (Lucía, Marcos, Carmen, Sara): el formulario lo rechaza después de enviar.
- **Volver atrás desde una ficha a la búsqueda** (Marcos, Lucía, Iván, Sara, Diego): se pierde la búsqueda, la página y el filtro.
- **Corregir una reseña** (Lucía, Marcos): el modal sale vacío y la anterior se sobrescribe sin avisar.
- **Borrar sin querer** (Sara): botón sin nombre accesible y sin confirmación.
- **Seguir una serie por episodios o saber cuándo sale el siguiente** (Diego, Marcos): no existe.
- **Buscar por actor o director** (Lucía, Carmen): no existe.
- **Leer reseñas sin cuenta** (Lucía, Iván): ocultas.
- **Gestionar una biblioteca de 200 títulos** (Diego): solo se puede cambiar el estado desde cada ficha.
- **Importar el historial de Letterboxd o Trakt** (Lucía, Diego): no existe.

---

## 5. Features nuevas priorizadas

Impacto (1-5) × esfuerzo (S, M o L). "Encaje" valora la identidad artística (oscura, cinéfila y española) y el valor para el portfolio.

### Quick wins (S, menos de 1 día cada uno)

| Feature | Qué es | Pedida por | Por qué suma al portfolio |
|---|---|---|---|
| **Similares en la ficha** | Carrusel con los datos `similar` que ya llegan (`tmdbDetails.ts:30`) | Marcos, Iván, Diego, Carmen | Sin coste extra de API. Demuestra que se aprovecha lo que ya se paga. |
| **Estado de emisión y próximo episodio** | Insignia "En emisión / Finalizada" y fecha de `next_episode_to_air` | Diego | Solo mapeo. Es la primera pieza del calendario. |
| **Separar Incluido, Alquiler y Compra y enlazar al título** | Agrupar los proveedores y usar el `link` de JustWatch | Carmen, Marcos, Diego, Lucía | Arregla una promesa rota con muy poco código. |
| **Reseñas públicas y nota media Pixela** | Lectura sin sesión, media en la ficha y JSON-LD `AggregateRating` | Lucía, Iván, Marcos, Carmen | SEO real. Hace verdad lo que promete el README. |
| **Error boundaries** | `error.tsx` y `global-error.tsx` con la estética del 404 | Iván | Demuestra que se piensa en cómo falla la app. |

### Apuestas medianas (M, de 2 a 5 días)

| Feature | Qué es | Pedida por | Por qué suma al portfolio |
|---|---|---|---|
| **Buscador global (⌘K)** | Paleta en la navbar contra `search/multi`, que también devuelve personas, con `aria-live` para anunciar los resultados | **6/6** | Es un componente vistoso, accesible y con debounce y cancelación bien hechos. |
| **Mis plataformas y "¿Qué veo esta noche?"** | Guardar las plataformas en el perfil (o en `localStorage` para anónimos), filtrar Categorías y FINDE con `with_watch_providers`, logo en los carteles traído en el servidor, y un "Sorpréndeme" real sobre TMDB | Carmen, Diego, Marcos, Lucía, Iván (con la condición de coste) | **Es la feature diferencial de Pixela** frente a Letterboxd o Trakt y encaja con la identidad España y plataformas. |
| **Biblioteca gestionable** | Cambiar el estado desde la rejilla, ordenar por fecha (los datos ya existen), filtrar película o serie | Diego, Marcos | Modelo de datos ya listo. Es interacción de calidad. |
| **Actividad reciente real** | Timeline a partir de los `updatedAt` | Marcos, Diego | Quita una promesa vacía y prepara el terreno social. |

### Grandes (L, una semana o más)

| Feature | Qué es | Pedida por | Por qué suma al portfolio |
|---|---|---|---|
| **Diario de visionado** (tabla `WatchEvent`) | Una entrada "visto el día X" por película o episodio, con revisionados y reseña opcional por visionado | Lucía, Diego, Marcos | Es la propuesta puente del foro: un único modelo sostiene los revisionados, los episodios y las estadísticas. Es un modelo de datos con sustancia. |
| **Seguimiento por episodios, oculto por defecto** | Temporadas desplegables, check por episodio, barra de progreso y "Siguiente episodio" | Diego, Marcos, Carmen (si va escondido) | Lo que más diferencia como portfolio, según Diego. Se construye sobre el diario. |
| **Resumen anual compartible** | "Wrapped" de Pixela: horas vistas, géneros y top 5, con imagen generada por `next/og` | Lucía, Diego, Marcos | **Encaje artístico máximo.** Es una pieza viral, y Lucía la diseñaría pensando en Instagram. |
| **Importar CSV de Letterboxd o Trakt** | Parseo, emparejado con TMDB y vista previa | Lucía, Diego | Encaja después del diario. Exige procesar por lotes respetando el límite de TMDB. |
| **Listas personalizadas y públicas** | Listas con nombre, orden y nota por entrada | Lucía | Valor social, pero solo lo pidió una persona: va detrás. |
| **Recuperar contraseña y login con Google** | Resend y el proveedor de Google en Auth.js | Diego, Carmen, Marcos | Básico de confianza. Depende de tener otra vez una base de datos. |

Lo que queda fuera por ahora: **notificaciones push y calendario con cron** (caro y sin base de datos), **modo claro** (choca con la identidad visual; mejor un modo de alto contraste ligero) y **multi-idioma o multi-país**.

---

## 6. Desacuerdos y decisión

| Desacuerdo | Posturas | Decisión |
|---|---|---|
| **Cimientos frente a features** (Iván frente a Lucía) | Iván quiere primero `<Link>`, URL y tests. Lucía, primero el valor social. | **Las dos cosas, en el orden de Iván, con el quick win de Lucía dentro.** El sprint 1 son los cimientos más las reseñas públicas, que es casi gratis y arregla el README. Las listas quedan para después. |
| **Episodios: ¿sí o no?** (Diego y Marcos frente a Carmen; Iván escéptico) | Carmen teme llenar la app de casillas. Iván lo ve caro. Diego lo ve como la pieza diferencial del portfolio. | **Sí, en el sprint 3, oculto por defecto** ("progressive disclosure") y **después de los tests**, que es la condición que aceptaron Iván y Diego. Se construye sobre el diario, como propuso Lucía. La portada sigue respondiendo a "qué veo hoy y dónde". |
| **Logo de la plataforma en cada cartel** (Carmen frente a Iván, por coste) | Iván advierte de N peticiones por tarjeta. | **Se hace solo en el servidor**: se usa `with_watch_providers` en `discover` o se enriquece una vez por regeneración ISR (1 h) y se cachea. Nunca se piden proveedores desde el cliente por tarjeta. |
| **Login con Google frente a rate limit** (Marcos frente a Iván) | — | **Primero el rate limit** (es una línea en `authorize`). Google llega con la recuperación de contraseña cuando haya base de datos. |
| **Movimiento** (Sara frente a la estética) | Lucía, como diseñadora, se pone del lado de Sara. | Se mantiene el movimiento y **se respeta `prefers-reduced-motion`**. No se quita nada por defecto. |
| **"Iconos sin texto" de Carmen** | Sara aclara que para el lector de pantalla están bien. | Es un problema de **etiqueta visible**, no de ARIA. Se añaden etiquetas de texto en las acciones de la ficha y se unifica el icono de favorito. |

---

## 7. Roadmap en 3 sprints

### Sprint 1: "Que se pueda usar por todos" (cimientos y quick wins de confianza)
1. Tarjetas como `<Link>` con el título siempre visible en táctil y el marcador como botón hermano con `aria-label` que incluya el título.
2. Estado de Categorías en la URL (`?type`, `?genre`, `?q`, `?page`). Arregla de paso el botón de Descubre y el enlace "Mi biblioteca" del footer (`?tab=`).
3. Arreglos de una hora: toast en español, registro con Unicode y validación compartida, placeholder "Nombre", `<label>` y `role="alert"` en los formularios, quitar `outline-none`.
4. Reseñas: precargar la existente, empezar sin nota, confirmar o deshacer el borrado, `aria-label` en editar y borrar, `whitespace-pre-line` y "leer más" en el perfil, y que el admin no vea "editar" en reseñas ajenas.
5. Reseñas públicas en modo lectura y nota media Pixela.
6. `error.tsx` y `global-error.tsx`, rate limit en el login y un único `passwordSchema`.
7. Deduplicar favoritos (promesa compartida o `/api/favorites/ids` sin TMDB).
8. Tests con Vitest (zod, guards, rutas de reseñas y favoritos) y CI en GitHub Actions. README honesto.

### Sprint 2: "Qué veo esta noche" (identidad de producto)
1. Buscador global ⌘K con personas.
2. Proveedores: agrupar Incluido, Alquiler y Compra y enlazar al título. Quitar el dominio inventado. `PlatformCard` como `<a>`.
3. **Mis plataformas**: perfil o `localStorage`, filtro en Categorías y FINDE, logo en el cartel traído en el servidor, "¿Qué veo esta noche?" real.
4. Similares en la ficha, y estado de emisión y próximo episodio en las series.
5. `prefers-reduced-motion`, focus trap y `radiogroup` en el modal, flechas en el menú de biblioteca, pestañas ARIA en el perfil.
6. Biblioteca gestionable (estado desde la rejilla, ordenar, filtrar) y actividad reciente real.
7. Filmografía ordenada por popularidad y créditos sin enlace diferenciados visualmente. `runtime` opcional.

### Sprint 3: "Pixela recuerda lo que ves" (apuesta de portfolio)
*Requiere base de datos operativa otra vez.*
1. Tabla `WatchEvent` (diario de visionado) con migración cubierta por tests.
2. Seguimiento de episodios sobre el diario, oculto por defecto, con "Siguiente episodio".
3. Estadísticas personales y **resumen anual compartible** (`next/og`).
4. Recuperar contraseña (Resend) y login con Google.
5. Si sobra tiempo: importar CSV de Letterboxd.

---

## 8. Críticas descartadas o matizadas tras verificar

| Afirmación | Fuente | Veredicto |
|---|---|---|
| "No hay mostrar contraseña en el login" | Mapa de producto, sección 2.2 | **Falsa.** `features/auth/components/TextInput.tsx:35-36` tiene el botón con `aria-label` "Mostrar/Ocultar contraseña". Sara lo confirma. |
| "El lápiz de la ficha no se entiende" como fallo de accesibilidad | Carmen | **Matizada.** Tiene `aria-label` "Escribir una reseña de «título»" (`hero/actions/ActionButtons.tsx:98`). Se mantiene como problema de etiqueta visible, no de ARIA. |
| "Iniciar sesión es un muñequito sin etiqueta" | Carmen | **Matizada** por la misma razón: tiene `aria-label`. Falta el texto visible. |
| "Escribí rápido y salieron los resultados de lo que había escrito a medias" | Marcos | **Plausible, no reproducida.** El mecanismo existe (`useContentLoader.ts:314`, `:418`), pero se ha confirmado leyendo código, no en la app. Se mantiene en el roadmap porque el arreglo es barato. |
| "Ráfaga de peticiones vista en la pestaña Network con sesión" | Iván | **Observación no reproducible** (no hay base de datos, así que no hay sesión). El mecanismo sí está confirmado: la caché no guarda la promesa en vuelo (`api/favorites/favorites.ts:10-40`). |
| "Ficha en 404 con `runtime: null`" | Mapa | **Plausible.** El `throw` existe (`mapPelicula.ts:73-75`), pero no se ha probado con un id real de estreno. |
| "No se muestran las fechas de la biblioteca aunque la base de datos las guarda" | Diego | **Confirmada** (`createdAt` y `updatedAt` en `LibraryItem`). Se incluye. |
| "Login con Google" o "modo claro" como crítica | Marcos, Sara | **No son defectos**, son peticiones de feature. Se tratan en la sección 5. El modo claro se descarta por la identidad visual y se propone en su lugar alto contraste y reduced-motion. |
| "Calendario con avisos push" en el corto plazo | Diego, Marcos | **Petición válida, pero se pospone.** Sin base de datos ni infraestructura de cron o push no es viable, y es caro en coste. Solo se adelanta "estado de emisión y próximo episodio", que sale gratis del detalle. |

No hubo críticas de los testers que resultaran falsas en el código. El único error de hecho venía del mapa de producto (el botón de mostrar contraseña).