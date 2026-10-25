---
name: Pixela
description: Una cartelera para decidir qué ver esta noche, con la gramática de los títulos de crédito.
colors:
  accent: "#EC1B69"
  accent-hover: "#F2397F"
  ink: "#070605"
  screen: "#0D0A08"
  surface: "#17130F"
  raised: "#241E19"
  light: "#F4EDE2"
  text-muted: "#A8A29E"
  line: "rgba(244, 237, 226, 0.10)"
  danger: "#F87171"
  success: "#34D399"
  rating: "#FACC15"
typography:
  display:
    fontFamily: "Bodoni Moda, Didot, Georgia, serif"
    fontSize: "clamp(3.25rem, 9vw, 8rem)"
    fontWeight: 400
    lineHeight: 0.88
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Bodoni Moda, Didot, Georgia, serif"
    fontSize: "clamp(3.25rem, 7vw, 6.5rem)"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "-0.035em"
  statement:
    fontFamily: "Bodoni Moda, Didot, Georgia, serif"
    fontSize: "2rem"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
  meta:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 500
    fontVariation: "'wdth' 112"
rounded:
  sm: "2px"
  md: "6px"
  lg: "16px"
  full: "9999px"
spacing:
  gutter-mobile: "16px"
  gutter-desktop: "64px"
  poster-gap: "20px"
  section: "128px"
components:
  button-primary:
    backgroundColor: "{colors.light}"
    textColor: "{colors.screen}"
    rounded: "{rounded.sm}"
    padding: "0 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "rgba(244, 237, 226, 0.85)"
  button-ghost:
    backgroundColor: "transparent"
    borderColor: "rgba(244, 237, 226, 0.20)"
    textColor: "{colors.light}"
    rounded: "{rounded.sm}"
    padding: "0 24px"
    height: "48px"
  toggle-active:
    backgroundColor: "{colors.light}"
    textColor: "{colors.screen}"
    rounded: "{rounded.full}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.light}"
    rounded: "{rounded.full}"
    height: "48px"
  poster:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.sm}"
  badge:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.screen}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: Pixela

## Overview

**Creative North Star: "Fundido a negro"**

Pixela es una plataforma de cine con la gramática de los títulos de crédito. Cada pantalla se abre como un cartón: el nombre de la obra o de la sección en una didona de alto contraste, a escala de cartel, sobre negro de sala. El backdrop es la luz; la interfaz se aparta. Entre una vista y otra no hay deslizamientos: hay un **fundido a negro**, el corte más viejo del cine.

La referencia de producto es una plataforma premium (inmersiva, backdrops a pantalla completa, filas que se recorren con calma); la referencia de lenguaje son los cartones de apertura y cierre de una película (Bodoni, marfil sobre negro, mucho aire, el nombre que vuelve a todo lo ancho al final).

El rosa de Pixela es la luz de "acción": aparece en el enlace activo, en el foco y en la insignia Top Pixela. Nunca en un título ni en un fondo grande.

Se rechaza explícitamente: navbar de vidrio en píldora flotante, degradados decorativos, halos de color, tarjetas con icono como estructura, antetítulos en mayúsculas espaciadas, palabras resaltadas en otro color dentro de un titular, emojis como iconos, grises fríos y el velo que solo aparece con el ratón encima.

**Key Characteristics:**
- Dos familias: Bodoni Moda para los títulos (cartones), Archivo para todo lo demás.
- Negro cálido de sala (`#0D0A08`) y luz marfil de proyector (`#F4EDE2`); `white` y `gray` de Tailwind están sustituidos por esos tonos.
- Grano de película global y backdrops del hero en monocromo cálido.
- Pósters a 2:3 con esquina casi recta y el título, el año y la nota siempre debajo.
- Un margen de página único (16 → 64 → 96 px) que comparten navbar, hero, títulos, filas y footer.
- Movimiento de proyector: fundido entre vistas y entre diapositivas, zoom lento en los pósters, todo con `prefers-reduced-motion`.

## Colors

Negros cálidos de sala, marfil de proyector y un rosa reservado a la acción.

### Primary
- **Rosa acción** (`#EC1B69`, `pixela-accent`; hover `#F2397F`): subrayado del enlace activo y de las pestañas, anillo de foco, insignia Top Pixela, página activa de la paginación y código de la 404. El texto sobre el rosa es **negro de sala**: blanco sobre `#EC1B69` da 4:1 y no llega a AA a 16 px; el negro da 5:1.

### Neutral
- **Tinta** (`#070605`, `pixela-ink`): el plano más hondo. Ficha, actor, login y footer.
- **Sala** (`#0D0A08`, `pixela-dark`): fondo de página.
- **Butaca** (`#17130F`, `pixela-surface`): paneles, inputs, toggles inactivos y fondo del póster mientras carga.
- **Pasillo** (`#241E19`, `pixela-raised`): hover de superficies.
- **Proyector** (`#F4EDE2`, `pixela-light` y `white`): texto e iconos.
- **Ceniza** (`#A8A29E`, `gray-400`): metadatos, descripciones y pies. Es el mínimo para texto: `gray-500` y más oscuros no pasan AA sobre sala.

### Estado
`red-400/500` para errores, `emerald-400` para éxito y el estado "Viendo", `yellow-400` solo para la nota. Sin azules ni morados.

### Named Rules
**La regla del rótulo.** El rosa es la luz de "acción": una pieza encendida por zona. Un título en rosa compite con el botón que hay que pulsar.

**La regla del negro cálido.** Ningún gris frío. `gray-*` ya es la escala cálida (`stone`); `slate`, `zinc`, `neutral` y los hex sueltos no se usan.

## Typography

**Display:** Bodoni Moda (con eje óptico `opsz`, normal y cursiva), `font-display`.
**Interfaz y texto:** Archivo (con eje de anchura `wdth`), `font-sans`, el valor por defecto del `body`.

**Character:** la didona de los cartones de crédito y los carteles clásicos frente a una grotesca sobria que se lee bien a 15 px. El contraste entre las dos crea la jerarquía; no hacen falta pesos extremos ni mayúsculas.

### Hierarchy
- **Display** (Bodoni 400, 56 → 128 px, `leading-[0.88]`, `-0.04em`): el título de la obra en el hero de la home, en la ficha y en la página de actor.
- **Headline** (Bodoni 400, 52 → 104 px, `.title-card`): títulos de sección y de página ("Tendencias", "Categorías", "Quiénes somos", "Reparto").
- **Statement** (Bodoni 400, 24 → 34 px, cursiva en las citas): las citas de cine entre secciones y la frase de Quiénes somos.
- **Title** (Archivo 600, 15-16 px): título del pie de foto de un póster y nombre de un actor.
- **Body** (Archivo 400, 16-20 px, `leading-relaxed`, 65ch como máximo): sinopsis y descripciones.
- **Meta** (Archivo 500, 15 px, `wdth 112`, `.meta-text`): tipo de obra, año, temporadas y navegación.

### Named Rules
**La regla del cartón.** Todo título de sección o de página va en Bodoni, en caja normal y en marfil. Nada de mayúsculas espaciadas ni de una palabra resaltada en otro color.

**La regla de los dos renglones.** Los títulos caben en dos líneas a cualquier ancho; si no caben, se baja el tamaño o se acorta el texto. Los títulos que vienen de TMDB se protegen con `overflow-wrap: anywhere` y `hyphens: auto`.

## Layout

- **Margen de página único:** `px-4 sm:px-6 md:px-10 lg:px-16 2k:px-24`. Es el mismo en la navbar, el hero, los títulos de sección, el primer y el último póster de cada fila, la ficha, Categorías y el footer.
- **Ritmo:** `py-20 md:py-28 lg:py-32` entre secciones de la home y `gap-16 md:gap-24` entre bloques de la ficha. Hay más aire encima de un título que debajo.
- **Filas de pósters:** sin bucle ni autoplay. El primer póster arranca en el margen y el último cierra en el margen opuesto; las flechas se ocultan en los extremos y en táctil.
- **Zigzag de la home:** Tendencias y Finde en casa a la izquierda, Top cartelera a la derecha. Cada título lleva debajo una frase que dice qué hay en la fila.
- **Breakpoints propios:** `ipad`, `2k` y `ls` (móvil en horizontal).

## Elevation & Depth

La profundidad viene del tono y de la imagen. Los planos tinta → sala → butaca → pasillo separan superficies, y los velos de los backdrops son la única gradación permitida (de lado en el hero de escritorio, de abajo arriba en móvil y en la ficha). Las sombras existen solo en lo que flota: el póster de la ficha sobre su backdrop (`shadow-2xl shadow-black/60`), los toasts y los diálogos.

### Named Rules
**La regla del proyector.** Nada de halos de color ni de sombras en reposo. La luz viene de la pantalla, no de los objetos.

## Shapes

- **Píldora** (`rounded-full`): inputs, toggles y filtros.
- **Casi recta** (`rounded-sm`, 2 px): botones, pósters, fotos de reparto, miniaturas, tráilers e insignias.
- **Panel** (`rounded-2xl`): diálogos, paneles del perfil, tarjeta de login y toasts.

## Components

### Buttons
`.btn` + `.btn-primary` / `.btn-ghost` (+ `.btn-sm`) en `globals.css`.
- **Primario:** rótulo de crédito. Marfil con texto negro de sala, esquina de 2 px, 48 px, Archivo 600 en `wdth 112`; hover marfil al 85 %; `active:scale-[0.97]`. El rosa relleno se descartó en la reforma: con la didona y el marfil leía como una tienda, no como un cartón.
- **Secundario:** fondo transparente con borde marfil al 20 %; hover borde al 45 %. Un secundario "activo" (favorito marcado) enciende el borde y el icono en rosa, sin relleno.
- **Pestañas** (Galería): texto Meta con subrayado rosa de 2 px, como la navbar.
- Sin flechas "→" añadidas al texto. Un solo primario por vista.

### Pósters
- `<Link prefetch={false}>` que envuelve el póster y el pie de foto; el título es el nombre accesible.
- Póster 2:3, `rounded-sm`, fondo butaca mientras carga y grano encima.
- Pie de foto siempre visible: título (Archivo 600, 2 líneas como máximo) y, debajo, año y nota (`★ 8,7`, con coma decimal).
- Zoom lento (`scale-[1.04]`, 700 ms, `ease-out-expo`) solo con un puntero que pueda hacer hover.
- Marcador de favoritos: `<button>` hermano del enlace, arriba a la derecha, visible en táctil y con foco.
- **Top Pixela:** nota ≥ 8,5 y al menos 500 votos (`src/lib/topPixela.ts`). No se muestra en la ficha, que no tiene el número de votos.

### Toggles y filtros
Contenedor `bg-pixela-surface rounded-full p-1`. La opción activa va en marfil con texto negro y la inactiva en `white/75`. "Sorpréndeme" activo va en rosa.

### Inputs
Etiqueta visible encima (Archivo 14 px, `white/70`) o `sr-only`. Píldora butaca de 48 px con borde `white/10`. Al recibir el foco, borde rosa al 60 % y anillo global. Los errores, en rojo con `role="alert"`.

### Navigation
Barra plana a todo lo ancho: el nombre en Bodoni cursiva a la izquierda, los enlaces en Archivo `wdth 112` a 15 px (`white/70`; el activo, en marfil con subrayado rosa de 2 px) y el acceso a la cuenta a la derecha. Transparente sobre el hero y en negro de sala al 95 % al hacer scroll, sin desenfoque. Respeta `safe-area-inset-top`.

### Hero de la home
Backdrop a pantalla completa en monocromo cálido (`grayscale sepia-[0.12]`) con velo lateral. A la izquierda, el cartón: tipo de obra en Meta, título en Display, sinopsis en Body (3 líneas) y "Ver ficha". Entre diapositivas, la imagen sale en 300 ms y la siguiente entra a los 300 ms en 700 ms: un fundido a negro. Con movimiento reducido, el carrusel arranca en pausa.

### Ficha y actor
Backdrop a sangre con velo, póster a la izquierda (sin zoom en táctil), título en Display, una línea de metadatos sin viñetas, géneros como texto, "Creada por" o "Dirección" con foto, sinopsis en Body y las acciones. Los bloques ("Dónde verla", "Reparto", "Tráilers", "Galería", "Reseñas", "Filmografía") llevan Headline. El reparto se presenta como unos créditos: foto 4:5, nombre y personaje, sin rótulos.

### Footer
Un escalón más hondo (tinta), enlaces en ceniza que se encienden en marfil, el enlace al repositorio y el nombre de Pixela a todo lo ancho en Bodoni cursiva al 6 %, cortado por abajo: el cartón de cierre.

### Motion
- **Fundido entre vistas:** `app/template.tsx` monta cada vista con `fade-from-black` (420 ms, solo opacidad). Usa `backwards` para no dejar un contexto de apilamiento al terminar.
- **Curva:** `ease-out-expo` = `cubic-bezier(0.22, 1, 0.36, 1)`. Pulsación, 100-200 ms; hover, 200-300 ms; entradas e imágenes, 500-700 ms.
- **Entradas de sección:** GSAP `useScrollAnimation` (20 px y opacidad, una sola vez). Con `stagger`, el contenedor se muestra y se animan los hijos.
- **Hover:** limitado con `future.hoverOnlyWhenSupported`; en táctil el feedback es `:active`.
- **Sin bucles**, salvo los indicadores de carga (`animate-pulse`, `shimmer`) y la marquesina decorativa de Descubre.
- **`prefers-reduced-motion`:** el CSS acorta animaciones y transiciones a 0,01 ms, GSAP muestra el contenido sin animar y el hero arranca en pausa.

### Superficies del navegador
Selección en rosa al 40 %, `caret-color` rosa, scrollbar pasillo sobre sala, `color-scheme: dark`, `theme-color` igual a sala, sin destello al tocar y `touch-action: manipulation` en los controles.

## Do's and Don'ts

### Do:
- **Do** usar `.title-card` (o `font-display`) en todo título de sección o de página.
- **Do** reservar el rosa a la acción y poner texto negro de sala encima.
- **Do** usar el margen de página único y alinear con él el primer póster de cada fila.
- **Do** poner el pie de foto debajo del póster, no encima.
- **Do** respetar `prefers-reduced-motion` y limitar todo hover a dispositivos con puntero.

### Don't:
- **Don't** usar vidrio (`backdrop-blur`) en barras, tarjetas o paneles; solo en el velo de un diálogo.
- **Don't** escribir mayúsculas espaciadas, antetítulos ni palabras resaltadas en otro color.
- **Don't** usar degradados que no sean el velo sobre una imagen.
- **Don't** poner texto blanco sobre el rosa.
- **Don't** usar azules, morados ni grises fríos.
- **Don't** añadir peticiones por vista para decorar: las imágenes salen de TMDB por el loader y las fuentes las sirve `next/font`.

---

## Historial

### Octubre de 2026: botones en marfil
Primario marfil recto y secundario con borde en lugar de la píldora rosa. También salen el halo rosa del botón de volver arriba, el degradado de los tráilers y el hueco a la derecha cuando solo hay uno, y el esqueleto de la ficha copia el layout real.

### Octubre de 2026: reforma "Fundido a negro"
Sustituye a la dirección "Sala de proyección": Outfit Black en mayúsculas rosas, navbar en píldora de vidrio y pósters a sangre con el título solo al pasar el ratón. Las capturas de antes y después están en `docs/design/reforma/`.

### Octubre de 2026: limpieza a partir del beta test
A partir de `docs/beta-test/INFORME.md`: tarjetas como enlaces, formularios con etiqueta, modal de reseña con edición precargada, borrado con deshacer, ARIA en pestañas, menús y plataformas, microcopy sin promesas falsas, footer sin cuentas ajenas, esqueletos neutros, logo sin dominio, cero `transition-all` y `error.tsx`.

### Pendiente, por prioridad
1. **P1. Estado de Categorías en la URL** (`?type=&genre=&q=&page=`). Toca `useContentLoader`, que es lógica de datos.
2. **P1. Reseñas visibles sin sesión** y nota media Pixela.
3. **P2. Buscador global** (⌘K contra `search/multi`, con personas).
4. **P2. Transición compartida póster → ficha** con la View Transitions API, cuando Next la estabilice.
5. **P3. Tailwind 4:** al migrar, mover estos tokens a `@theme`.
