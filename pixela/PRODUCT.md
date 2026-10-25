# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Cualquier persona que quiere decidir qué ver esta noche o este fin de semana: aficionados al cine y las series que buscan una recomendación con criterio, no un buscador. A la vez, Pixela es pieza de portfolio de su autor, así que también lo abre gente que evalúa su trabajo; el producto tiene que ser usable de verdad para el primer grupo y convencer al segundo sin hacer nada distinto para él.

Idioma: castellano (España).

## Product Purpose

Descubrir películas y series a través de una selección curada: tendencias, la cartelera de cines, lo mejor para el fin de semana en casa y un catálogo explorable por categorías. Con cuenta, cada persona guarda favoritos, organiza su biblioteca por estado (pendiente, viendo, vista) y escribe reseñas. El éxito es que alguien entre sin saber qué ver y salga con un título elegido y sabiendo dónde verlo.

## Positioning

Descubrir con criterio. TMDB es una base de datos, JustWatch un buscador de plataformas y Letterboxd un diario social; Pixela es una cartelera editorial: decide qué enseñar, lo ordena en secciones con intención (tendencias, cartelera, finde en casa) y lo acompaña de citas de cine. Te dice qué ver antes de que tengas que buscar.

## Operating Context

- Se usa en casa, en el sofá o en el móvil, normalmente de noche, justo antes de elegir qué ver.
- El catálogo, las imágenes y los proveedores de streaming vienen de TMDB.
- Los datos de usuario (cuentas, favoritos, biblioteca, reseñas, perfiles con foto y portada) viven en PostgreSQL vía Prisma.

## Capabilities and Constraints

- Rutas: home (hero, Tendencias, Top Cartelera, Finde en casa, Descubre, Quiénes somos), `/categories` (catálogo filtrable con búsqueda, paginación y "Sorpréndeme"), `/movies/[id]` y `/series/[id]` (ficha, reparto, tráilers, galería, plataformas, reseñas), `/actor/[id]`, `/profile` (datos, biblioteca, favoritos, reseñas y administración de usuarios para admin), `/login` y `/register`.
- Next.js 16 App Router, React 19, Tailwind 3, GSAP, Embla Carousel y react-icons; gestor de paquetes Bun.
- Presupuesto de peticiones estricto (ver CLAUDE.md): las imágenes de TMDB no pasan por el optimizador de Next, los grids usan `prefetch={false}` y las páginas de catálogo son ISR. Ningún cambio visual puede añadir peticiones por vista sin justificarlo.
- La base de datos actual ha desaparecido (ver CLAUDE.md). Las funciones de cuenta se van a reconectar y se diseñan como parte plena del producto.
- No hay recuperación de contraseña: el enlace se muestra deshabilitado a propósito.

## Brand Commitments

- Nombre: Pixela.
- Acento rosa `#EC1B69`, presente en todo el producto actual. El usuario ha delegado en el criterio de diseño qué más se conserva del aspecto actual.
- El dominio `pixela.io` no pertenece al proyecto: no puede aparecer en la interfaz ni en assets nuevos (el logo actual de login lo lleva).

## Evidence on Hand

- Todo el contenido visual es real y viene de TMDB: pósters, backdrops, fotos de reparto, logos de plataformas, tráilers de YouTube.
- Citas de cine reales en `src/features/quotes`.
- No hay usuarios, reseñas, cifras ni testimonios reales que mostrar: no se inventan.
- Logo: `public/img/Logo-login.svg` (con el dominio que no es del proyecto).

## Product Principles

1. **Elegir antes que buscar.** Cada pantalla propone algo concreto que ver; el buscador es la salida, no la entrada.
2. **La imagen es el contenido.** Pósters y backdrops cargan con el peso; la interfaz se aparta.
3. **Saber dónde verlo.** Una recomendación sin plataforma está incompleta.
4. **Barato de servir.** Cada imagen, prefetch o fetch cuenta contra el presupuesto de peticiones.

## Accessibility & Inclusion

WCAG 2.2 AA como mínimo: contraste, foco visible, nombre accesible en controles de icono y respeto a `prefers-reduced-motion`.
