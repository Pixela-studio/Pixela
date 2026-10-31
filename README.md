<div align="center">

<img src=".github/assets/banner.webp" alt="Pixela — Cine y series, en un solo lugar" width="100%" />

<br/>
<br/>

<p>
  <b>Pixela</b> es una plataforma para descubrir, organizar y comentar películas y series.<br/>
  Full Stack sobre Next.js, con datos de TMDB y usuarios en PostgreSQL.
</p>

<p>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-111111?style=flat-square&logo=nextdotjs&logoColor=white&labelColor=111111" alt="Next.js 16" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-111111?style=flat-square&logo=react&logoColor=61DAFB&labelColor=111111" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-strict-111111?style=flat-square&logo=typescript&logoColor=3178C6&labelColor=111111" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-3-111111?style=flat-square&logo=tailwindcss&logoColor=38BDF8&labelColor=111111" alt="Tailwind CSS" /></a>
  <a href="https://www.prisma.io/"><img src="https://img.shields.io/badge/Prisma-5-111111?style=flat-square&logo=prisma&logoColor=white&labelColor=111111" alt="Prisma" /></a>
  <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-16-111111?style=flat-square&logo=postgresql&logoColor=4169E1&labelColor=111111" alt="PostgreSQL" /></a>
  <a href="https://authjs.dev/"><img src="https://img.shields.io/badge/Auth.js-v5-111111?style=flat-square&logo=auth0&logoColor=EC1B69&labelColor=111111" alt="Auth.js" /></a>
  <a href="https://bun.sh/"><img src="https://img.shields.io/badge/Bun-1.3-111111?style=flat-square&logo=bun&logoColor=FBF0DF&labelColor=111111" alt="Bun" /></a>
</p>

<p>
  <a href="#sobre-el-proyecto">Sobre el proyecto</a> ·
  <a href="#capturas">Capturas</a> ·
  <a href="#funcionalidades">Funcionalidades</a> ·
  <a href="#arquitectura">Arquitectura</a> ·
  <a href="#puesta-en-marcha">Puesta en marcha</a> ·
  <a href="#api">API</a> ·
  <a href="#autores">Autores</a>
</p>

</div>

<br/>

## Sobre el proyecto

Pixela nació como **Trabajo de Fin de Ciclo de 2º de DAW** y ha crecido hasta convertirse en una aplicación **Full Stack** completa. Frontend, API, autenticación y base de datos viven en un mismo proyecto Next.js, sin servidores externos que mantener.

El catálogo (películas, series, actores, tráilers y plataformas) llega en tiempo real desde **TMDB**. Lo que pertenece al usuario, como favoritos, biblioteca y reseñas, se guarda en **PostgreSQL**.

<table>
  <tr>
    <th width="33%">Descubre</th>
    <th width="33%">Organiza</th>
    <th width="33%">Opina</th>
  </tr>
  <tr>
    <td valign="top">Tendencias del día, cartelera, estrenos del fin de semana y un explorador por géneros con búsqueda.</td>
    <td valign="top">Favoritos y una biblioteca personal con estados: pendiente, viendo, completada o abandonada.</td>
    <td valign="top">Puntúa con estrellas en una escala del 1 al 10, escribe reseñas y lee las del resto de la comunidad.</td>
  </tr>
</table>

## Capturas

<img src=".github/assets/screen-home.webp" alt="Inicio de Pixela" width="100%" />

<table>
  <tr>
    <td width="50%"><img src=".github/assets/screen-movie.webp" alt="Ficha de película" width="100%" /></td>
    <td width="50%"><img src=".github/assets/screen-series.webp" alt="Ficha de serie" width="100%" /></td>
  </tr>
  <tr>
    <td align="center"><sub><b>Película</b> · nota, director y plataformas</sub></td>
    <td align="center"><sub><b>Serie</b> · temporadas, episodios y creador</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src=".github/assets/screen-categories.webp" alt="Categorías" width="100%" /></td>
    <td width="50%"><img src=".github/assets/screen-trending.webp" alt="Tendencias" width="100%" /></td>
  </tr>
  <tr>
    <td align="center"><sub><b>Categorías</b> · búsqueda y filtros por tipo</sub></td>
    <td align="center"><sub><b>Tendencias</b> · lo más visto hoy</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src=".github/assets/screen-actor.webp" alt="Ficha de actor" width="100%" /></td>
    <td width="50%"><img src=".github/assets/screen-mobile.webp" alt="Pixela en móvil" width="100%" /></td>
  </tr>
  <tr>
    <td align="center"><sub><b>Actores</b> · biografía y filmografía</sub></td>
    <td align="center"><sub><b>Móvil</b> · adaptado a cualquier pantalla</sub></td>
  </tr>
</table>

## Funcionalidades

| Área | Qué ofrece |
| :--- | :--- |
| **Inicio** | Hero a pantalla completa con animaciones GSAP, tendencias diarias, cartelera, recomendaciones del fin de semana y citas de cine. |
| **Fichas** | Póster, nota media, duración, géneros, tráiler, reparto, galería de imágenes y plataformas donde verla. |
| **Explorar** | Buscador de películas y series, categorías por género con paginación y fichas de actor con su filmografía. |
| **Biblioteca** | Favoritos y lista personal con cuatro estados de visionado, editables desde cualquier ficha. |
| **Reseñas** | Puntuación del 1 al 10, texto de hasta 2000 caracteres y reseñas de la comunidad en cada título. |
| **Perfil** | Avatar y portada personalizables, pestañas con tu actividad y gestión de usuarios para administradores. |
| **Cuenta** | Registro e inicio de sesión con Auth.js v5 y contraseñas cifradas con bcrypt. |
| **Interfaz** | Tema oscuro con acento `#EC1B69`, carruseles táctiles con Embla y diseño adaptado a móvil, tablet y escritorio. |

## Arquitectura

Las páginas son **Server Components** por defecto y leen directamente de TMDB y de PostgreSQL. El navegador habla con una **API interna** (`/api/*`) que hace de proxy seguro hacia TMDB y gestiona los datos del usuario.

```mermaid
flowchart LR
    U([Usuario]) --> P[proxy.ts<br/>CSP · bots · redirecciones]

    subgraph NEXT [Next.js 16 · App Router]
        direction TB
        P --> RSC[Server Components<br/>ISR]
        P --> API[Route Handlers<br/>/api/*]
        API --> G[Guards<br/>requireUser · requireAdmin]
        G --> Z[Validación Zod]
        API --> TP[tmdbProxy<br/>Cache-Control · rate limit]
        RSC --> TD[tmdbDetails<br/>Data Cache compartida]
    end

    Z --> DB[(PostgreSQL<br/>Prisma)]
    RSC --> DB
    TP --> TMDB[(TMDB API)]
    TD --> TMDB
    API -.-> AUTH[Auth.js v5]
    AUTH -.-> DB
```

<details>
<summary><b>Modelo de datos</b></summary>
<br/>

Los títulos no se duplican en la base de datos: cada fila guarda solo `(item_type, tmdb_id)` y los metadatos se resuelven contra TMDB, deduplicando peticiones.

```mermaid
erDiagram
    USER ||--o{ FAVORITE : marca
    USER ||--o{ REVIEW : escribe
    USER ||--o{ LIBRARY_ITEM : guarda

    USER {
        int user_id PK
        string name
        string email UK
        string password "hash bcrypt"
        text photo_url
        text cover_image
        bool is_admin
    }
    FAVORITE {
        int favorite_id PK
        int user_id FK
        enum item_type "movie | series"
        bigint tmdb_id
    }
    REVIEW {
        int review_id PK
        int user_id FK
        enum item_type
        bigint tmdb_id
        decimal rating "1 - 10"
        text review
    }
    LIBRARY_ITEM {
        int library_item_id PK
        int user_id FK
        enum item_type
        bigint tmdb_id
        enum status "PLAN_TO_WATCH | WATCHING | COMPLETED | DROPPED"
    }
```

Cada tabla tiene una restricción única sobre `(user_id, item_type, tmdb_id)`, así que un usuario no puede repetir un favorito ni reseñar dos veces el mismo título.

</details>

<details>
<summary><b>Estructura del proyecto</b></summary>
<br/>

```text
Pixela/
├── docker-compose.db.yml        PostgreSQL 16 para desarrollo
└── pixela/
    ├── prisma/                  schema.prisma y migraciones
    ├── public/
    └── src/
        ├── app/                 App Router
        │   ├── (auth)/          login · register
        │   ├── (rutas)/         movies · series · categories · actor · profile
        │   ├── api/             route handlers
        │   └── manifest.ts · robots.ts · sitemap.ts
        ├── features/            un módulo por funcionalidad
        │   └── <feature>/       components · hooks · store · types
        ├── shared/              Navbar, MediaCarousel, EmptyState
        ├── hooks/               useAsyncResource · useFavoriteToggle
        ├── lib/
        │   ├── api/             guards · responses · schemas · tmdbProxy · rateLimit
        │   └── prisma.ts        cliente singleton
        ├── api/                 clientes HTTP del navegador
        ├── stores/              Zustand
        ├── auth.ts              configuración de Auth.js
        └── proxy.ts             CSP, filtro de bots y redirecciones
```

</details>

### Stack

| Capa | Tecnología |
| :--- | :--- |
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Route Handlers, ISR) |
| Interfaz | [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [GSAP](https://gsap.com/), [Embla Carousel](https://www.embla-carousel.com/) |
| Lenguaje | [TypeScript](https://www.typescriptlang.org/) en modo estricto |
| Estado y formularios | [Zustand](https://zustand.docs.pmnd.rs/), [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) |
| Autenticación | [Auth.js v5](https://authjs.dev/) y bcrypt |
| Datos | [PostgreSQL](https://www.postgresql.org/) con [Prisma](https://www.prisma.io/), catálogo de [TMDB](https://developer.themoviedb.org/) |
| Herramientas | [Bun 1.3](https://bun.sh/), ESLint, Docker |

## Puesta en marcha

**Requisitos:** [Bun](https://bun.sh/docs/installation) 1.3 o superior, Node.js 20 o superior, una [clave de TMDB](https://www.themoviedb.org/settings/api) y, si no usas Supabase, Docker para la base de datos local.

**1. Clona el repositorio y levanta PostgreSQL**

```bash
git clone https://github.com/Pixela-studio/Pixela.git
cd Pixela
docker compose -f docker-compose.db.yml up -d
```

**2. Crea `pixela/.env.local`**

```env
TMDB_API_KEY=tu_clave_de_tmdb
TMDB_BASE_URL=https://api.themoviedb.org/3
DATABASE_URL=postgresql://pixela_user:pixela_password@localhost:5432/pixela_db
AUTH_SECRET=genera_uno_con_bunx_auth_secret
```

**3. Instala, migra y arranca**

```bash
cd pixela
bun install
bunx prisma migrate dev
bun run dev
```

La aplicación queda en [http://localhost:3000](http://localhost:3000).

> [!IMPORTANT]
> Ejecuta todo **dentro de `pixela/`** y **con Bun**. En la raíz no hay `package.json` y el lockfile es `bun.lock`, así que no reintroduzcas `package-lock.json`.

<details>
<summary><b>Variables de entorno</b></summary>
<br/>

| Variable | Obligatoria | Descripción |
| :--- | :---: | :--- |
| `TMDB_API_KEY` | Sí | Sin ella falla el build, no solo las peticiones. |
| `TMDB_BASE_URL` | Sí | `https://api.themoviedb.org/3` |
| `DATABASE_URL` | Sí | En Supabase, usa el pooler (`:6543`, `pgbouncer=true`). |
| `AUTH_SECRET` | Sí | Secreto de Auth.js. |
| `NEXT_PUBLIC_SITE_URL` | No | URL canónica para metadatos, `robots.txt` y `sitemap.xml`. |
| `NEXT_PUBLIC_API_URL` | No | Solo se usa como respaldo en localhost. |
| `AUTH_URL` / `AUTH_TRUST_HOST` | No | Necesarias para probar `bun run start` en local. |

</details>

<details>
<summary><b>Scripts</b></summary>
<br/>

| Comando | Descripción |
| :--- | :--- |
| `bun run dev` | Servidor de desarrollo |
| `bun run dev:turbo` | Desarrollo con Turbopack |
| `bun run build` | `prisma generate` y build de producción |
| `bun run start` | Sirve el build de producción |
| `bun run lint` | ESLint (`lint:fix` para corregir) |
| `bun run typecheck` | Comprobación de tipos |
| `bun run db:migrate` | Crea y aplica migraciones |
| `bun run db:studio` | Abre Prisma Studio |

</details>

## API

Todas las rutas pasan por la misma capa (`src/lib/api/`): guards de sesión, validación con Zod y errores que nunca exponen detalles internos.

<details>
<summary><b>Catálogo</b> · público, proxy a TMDB y cacheado en CDN</summary>
<br/>

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/movies/trending` · `/api/series/trending` | Tendencias del día |
| `GET` | `/api/movies/discover` · `/api/series/discover` | Descubrir con filtros permitidos |
| `GET` | `/api/movies/search` · `/api/series/search` | Búsqueda por título, con rate limit |
| `GET` | `/api/movies/:id` · `/api/series/:id` | Ficha completa |
| `GET` | `/api/movies/:id/images` · `/api/series/:id/images` | Galería |
| `GET` | `/api/:type/genre/:id` | Títulos por género |
| `GET` | `/api/tmdb/categories` | Lista de géneros |
| `GET` | `/api/banners` | Imágenes del hero |

</details>

<details>
<summary><b>Usuario</b> · requiere sesión</summary>
<br/>

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Registro |
| `GET` | `/api/auth/user` | Usuario de la sesión |
| `POST` | `/api/favorites` | Añadir favorito |
| `DELETE` | `/api/favorites/:id` | Quitar favorito |
| `GET` | `/api/favorites/details` | Favoritos con datos de TMDB |
| `GET` `POST` | `/api/library` | Listar o añadir a la biblioteca |
| `PATCH` `DELETE` | `/api/library/:id` | Cambiar estado o quitar |
| `GET` | `/api/library/details` | Biblioteca con datos de TMDB |
| `GET` `POST` | `/api/reviews` | Reseñas propias o publicar una |
| `PUT` `DELETE` | `/api/reviews/:id` | Editar o borrar una reseña |
| `GET` | `/api/reviews/media/:tmdbId/:itemType` | Reseñas de un título |
| `PUT` `DELETE` | `/api/users/:id` | Editar o borrar la cuenta |
| `GET` `POST` | `/api/users` | Listar o crear usuarios (solo administradores) |

</details>

## Seguridad y rendimiento

<table>
  <tr>
    <th width="50%" align="left">Seguridad</th>
    <th width="50%" align="left">Rendimiento</th>
  </tr>
  <tr>
    <td valign="top">
      <ul>
        <li><b>CSP</b> y cabeceras de seguridad en cada respuesta.</li>
        <li>Bots conocidos rechazados con <code>403</code> antes de llegar a la aplicación.</li>
        <li><b>Zod</b> en cada formulario y cada cuerpo de la API.</li>
        <li>Lista cerrada de parámetros que se reenvían a TMDB, e ids validados antes de construir la URL.</li>
        <li>Los errores se registran en el servidor y el cliente recibe un mensaje genérico.</li>
      </ul>
    </td>
    <td valign="top">
      <ul>
        <li><b>ISR</b> en la portada y las fichas, en lugar de renderizar en cada visita.</li>
        <li><code>Cache-Control</code> en todo el catálogo para que responda la CDN.</li>
        <li>Página y API comparten la misma llamada a TMDB gracias a la Data Cache.</li>
        <li>Las imágenes de TMDB se sirven desde su CDN sin pasar por el optimizador.</li>
        <li>Prefetch solo al pasar el ratón: de unas 85 peticiones por visita a unas 10.</li>
      </ul>
    </td>
  </tr>
</table>

## Roadmap

- [x] Migración de Laravel a Next.js Full Stack
- [x] Migración de npm a Bun
- [x] Biblioteca personal con estados de visionado
- [x] Portada de perfil personalizable
- [x] Auditoría de seguridad, interfaz y rendimiento
- [ ] Recuperación de contraseña por email
- [ ] Fotos de perfil en almacenamiento de objetos
- [ ] Rate limit distribuido con Redis
- [ ] Actualizar a Prisma 7, Tailwind 4 y TypeScript 6

## Historia

| Fecha | Hito |
| :--- | :--- |
| Abril 2025 | Check-In del TFC, con la primera versión sobre un backend en Laravel. [Vídeo](https://vimeo.com/1080303986/9f50bbfb83?share=copy) |
| Junio 2025 | Entrega final de 2º de DAW. [Vídeo](https://vimeo.com/1093512042?share=copy) |
| Enero 2026 | Migración a Next.js Full Stack con Prisma, Supabase y Auth.js. |
| Febrero 2026 | Biblioteca personal y portadas de perfil. |
| Septiembre 2026 | Auditoría de seguridad, interfaz y rendimiento. |

## Recursos

| | |
| :--- | :--- |
| Diseño | [Proyecto en Figma](https://www.figma.com/design/CPQe3LpPHQXKW1AWTYJhOG/PROYECTO-PIXELA.IO?m=auto&t=XRjSeFZfbLBWJ1JM-6) |
| Anteproyecto | [Notion](https://sphenoid-stone-975.notion.site/ANTEPROYECTO-PIXELA-1c2bccfbf6a4800c8945f8c8dfb77095) |
| Documentación técnica | [Google Docs](https://docs.google.com/document/d/1xqrrvgyTaQhrhDkg3hRDdx-euwUsP8KDyauRK608kks/edit?usp=sharing) |
| Código | [Commits](https://github.com/Pixela-studio/Pixela/commits/main/) · [Ramas](https://github.com/Pixela-studio/Pixela/branches/active) |

## Autores

<table>
  <tr>
    <td align="center" width="220">
      <a href="https://github.com/envyx10"><img src="https://github.com/envyx10.png?size=200" width="96" alt="Pablo Gil Díaz" /></a><br/>
      <b>Pablo Gil Díaz</b><br/>
      <sub><a href="https://github.com/envyx10">GitHub</a> · <a href="https://www.linkedin.com/in/envyx10/">LinkedIn</a></sub>
    </td>
    <td align="center" width="220">
      <a href="https://github.com/rxy94"><img src="https://github.com/rxy94.png?size=200" width="96" alt="Ruyi Xia Ye" /></a><br/>
      <b>Ruyi Xia Ye</b><br/>
      <sub><a href="https://github.com/rxy94">GitHub</a> · <a href="https://www.linkedin.com/in/ruyi-xia-ye-b19853189/">LinkedIn</a></sub>
    </td>
  </tr>
</table>

---

<sub>Los datos de películas, series y actores proceden de <a href="https://www.themoviedb.org/">TMDB</a>. Este producto usa la API de TMDB, pero no está avalado ni certificado por TMDB.</sub>

<sub>Copyright © 2026 Pablo Gil Díaz y Ruyi Xia Ye. Todos los derechos reservados.</sub>
