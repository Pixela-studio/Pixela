---
name: Pixela
description: Descubrir cine y series como quien entra en una sala a oscuras.
colors:
  accent: "#EC1B69"
  ink: "#0F0F0F"
  screen: "#181818"
  surface: "#1F1F1F"
  raised: "#2A2A2A"
  light: "#FFFFFF"
  text-muted: "rgba(255, 255, 255, 0.70)"
  text-subtle: "rgba(255, 255, 255, 0.55)"
  line: "rgba(255, 255, 255, 0.10)"
  danger: "#EF4444"
  success: "#34D399"
  rating: "#FACC15"
typography:
  display:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "clamp(4rem, 8vw, 8rem)"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "0.05em"
  headline:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 5vw, 4.5rem)"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.2em"
rounded:
  sm: "6px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  gutter: "16px"
  stack-sm: "8px"
  stack-md: "16px"
  stack-lg: "32px"
  section: "96px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.light}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
    height: "48px"
  button-ghost:
    backgroundColor: "rgba(255, 255, 255, 0.05)"
    textColor: "{colors.light}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
    height: "48px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.light}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
    height: "48px"
  badge:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.light}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "6px 10px"
  card-poster:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: Pixela

## Overview

**Creative North Star: "La sala de proyección"**

Pixela es una sala de cine con las luces apagadas. El fondo es negro cálido, no azul ni gris de dashboard; los pósters y los backdrops son la única fuente de luz de verdad, y el rosa `#EC1B69` es el rótulo de neón de la entrada: aparece poco, señala lo importante y nunca compite con la imagen. La tipografía hace de cartelera: títulos de sección gigantes, en Outfit Black y mayúsculas, que se leen desde el fondo de la sala.

La densidad es de cartelera, no de herramienta: filas de pósters a sangre, mucho aire entre secciones y un único gesto fuerte por pantalla. El grano de película (`.noise-effect`) y las citas de cine entre secciones son parte del carácter; no se quitan para "limpiar".

Se rechaza explícitamente: el look de plantilla SaaS (tarjetas icono + título + texto como estructura, glows rosas por todas partes, degradados de texto), los grises fríos o azulados (`slate`, `gray-800` sobre negro cálido) y los emojis como iconos.

**Key Characteristics:**
- Fondo negro cálido en tres planos: `ink` (detrás de la imagen), `screen` (página) y `surface` (paneles).
- Un solo acento, `accent`, en menos del 10 % de cualquier pantalla.
- Títulos de sección enormes en mayúsculas que alternan alineación (izquierda / derecha) a lo largo de la home.
- Pósters como protagonistas: sin marco en las filas a sangre, con esquina `md` en las rejillas.
- Movimiento de proyector: entradas suaves al hacer scroll, nada en bucle salvo lo que indica carga.

## Colors

Una paleta casi monocroma de negros cálidos, con un rosa neón como única nota de color.

### Primary
- **Rosa rótulo** (`#EC1B69`, Tailwind `pixela-accent`): CTA principal, estado activo de navegación y pestañas, títulos de sección, insignia "Top Pixela" y anillo de foco. Hover: `pixela-accent/90`. Nunca como fondo de un bloque grande ni como texto de cuerpo.

### Neutral
- **Tinta** (`#0F0F0F`, `pixela-ink`): el plano más profundo, detrás de backdrops y en el hero de detalle y perfil.
- **Pantalla** (`#181818`, `pixela-dark`): fondo de página. Los degradados que funden una imagen con la página terminan aquí.
- **Butaca** (`#1F1F1F`, `pixela-surface`): paneles, modales, toasts, inputs y tarjetas sin imagen.
- **Pasillo** (`#2A2A2A`, `pixela-raised`): hover de superficies, campos activos, separadores con cuerpo.
- **Luz** (`#FFFFFF`, `pixela-light`): texto principal.
- **Texto secundario** (`white/70`) y **texto tenue** (`white/55`, o `gray-400`): metadatos, descripciones, pies. Es el mínimo: `gray-500` y `gray-600` no pasan 4.5:1 sobre `screen`.
- **Línea** (`white/10`): bordes y divisores.

### Estado
- **Error** `red-500`, **éxito** `emerald-400`, **puntuación** `yellow-400`. Solo para su significado; nunca decorativos.

### Named Rules
**La regla del rótulo.** El rosa es un neón: una pieza encendida por zona de la pantalla. Si dos elementos rosas compiten en el mismo viewport, uno sobra.

**La regla del negro cálido.** Ningún gris frío. Las superficies oscuras salen de los cuatro tokens neutros; `bg-gray-800`, `slate-*` y hex sueltos (`#1a1a1a`, `#111`, `#252525`…) no se usan.

## Typography

**Fuente única:** Outfit (400, 500, 700, 900) vía `next/font`, expuesta como `--font-outfit` y como `font-sans` por defecto. Fallback `system-ui, sans-serif`.

**Character:** una grotesca geométrica que en Black parece letra de marquesina y en Regular se lee tranquila en descripciones largas. Una sola familia; la jerarquía sale del peso y del tamaño.

### Hierarchy
- **Display** (900, 64 → 128 px, `leading-none`, mayúsculas, `tracking-wider`): títulos de sección de la home ("TENDENCIAS", "TOP CARTELERA", "FINDE EN CASA"). Uno por sección.
- **Headline** (900, 48 → 72 px, `leading-[0.9]`, `tracking-tighter`): títulos de página y de obra ("Categorías", "Breaking Bad", el hero, el bloque Descubre).
- **Title** (700, 24 px): cabeceras de bloque dentro de una página (Reparto, Galería, Disponible en).
- **Body** (400, 16–18 px, `leading-relaxed`, máx. 65ch): sinopsis y textos.
- **Label** (700, 12 px, mayúsculas, `tracking-[0.2em]`): tipo de obra, insignias. Nunca como antetítulo decorativo sobre un título.

### Named Rules
**La regla de la marquesina.** Solo los títulos de sección de la home van en Display mayúsculas. Las páginas interiores usan Headline en caja normal. No se mezclan dentro de una misma pantalla.

**Nada de nombres de fuente literales.** `font-['Outfit']` o `fontFamily: "'Outfit'"` no funcionan con `next/font` (registra un nombre con hash). Usa `font-outfit` o hereda `font-sans`.

## Layout

- **Contenedor de sección:** `w-[90%] md:w-[85%] lg:w-[80%] 2k:w-[70%] mx-auto` en la home y el hero; las páginas interiores usan `max-w-7xl px-4 md:px-8`. No introducir un tercer sistema.
- **Filas a sangre:** los carruseles de pósters ocupan todo el ancho de la ventana; el título de sección sí respeta el contenedor.
- **Ritmo vertical:** entre secciones de la home, `py-16` en móvil y `pt-20` en escritorio; dentro de una página, `mt-16`/`mt-24` entre bloques y `mb-6` bajo cada Title. Más aire encima de un título que debajo.
- **Zigzag:** los títulos de sección alternan izquierda y derecha (Tendencias izquierda, Top Cartelera derecha, Finde en casa izquierda). Es intencionado.
- **Breakpoints propios:** `ipad` (768×1024 exacto), `2k` (≥2048 px) y `ls` (horizontal con alto ≤500 px). Usa la clave `ls:` en vez de repetir la media query a mano.
- **Margen lateral mínimo en móvil:** 16 px.

## Elevation & Depth

La profundidad viene del tono y de la imagen, no de sombras: los planos `ink` → `screen` → `surface` → `raised` y los degradados que funden backdrops con el fondo. Las sombras se reservan para lo que flota de verdad sobre imagen (navbar al hacer scroll, modales, botones del carrusel) y siempre llevan desplazamiento y desenfoque.

### Shadow Vocabulary
- **Flotante** (`shadow-lg shadow-black/40`): navbar compacta, toggles y botones sobre imagen.
- **Modal** (`shadow-2xl shadow-black/60`): diálogos y paneles sobre overlay.
- **CTA** (`shadow-lg shadow-pixela-accent/25`): solo el botón primario, y solo uno por vista.

### Named Rules
**La regla del proyector.** Nada de halos de color sin desplazamiento (`shadow-[0_0_30px_…]`, `drop-shadow` rosa) como decoración. La luz de esta sala viene de la pantalla, no de los objetos.

## Shapes

- **Píldora** (`rounded-full`): botones, inputs, toggles de Series/Películas, navbar, chips.
- **`md` 12 px** (`rounded-xl`): pósters en rejilla, tarjetas de reparto, miniaturas de galería.
- **`lg` 16 px** (`rounded-2xl`): paneles, modales, tarjetas de reseña.
- **`sm` 6 px** (`rounded-md`): insignias.
- **Sin radio:** pósters en filas a sangre y backdrops a pantalla completa.
- Radios arbitrarios (`rounded-[15px]`, `[25px]`, `[49px]`) no: redondea al token más cercano.

## Components

### Buttons
Clases en `globals.css` (`@layer components`). Son la única fuente de verdad: no se escriben botones con cadenas de utilidades nuevas.
- **`.btn`**: base común. Píldora, 48 px de alto (40 px con `.btn-sm`), Outfit 600, icono a 8 px del texto, transición de color, sombra y transform de 200 ms con `ease-out-expo`, foco con el anillo global.
- **`.btn-primary`**: fondo `accent`, texto blanco, sombra CTA. Hover `accent/90` y sube 2 px; `active` vuelve a 0. Uno por vista.
- **`.btn-ghost`**: `white/5` con borde `white/10` y desenfoque; hover borde `accent/50`, fondo `accent/10`. Para la acción secundaria.
- **Disabled:** opacidad 50 %, sin hover ni transform.

### Chips y toggles
- Toggle de Series/Películas: contenedor `bg-white/5 border-white/10 rounded-full p-1`; la opción activa es una píldora `accent` y la inactiva texto `white/70`.
- Pestañas (Galería, Perfil): mismo patrón, en pequeño.

### Pósters
- **Fila a sangre:** sin radio ni hueco entre pósters, overlay al hover con degradado desde `screen`.
- **Rejilla:** `rounded-xl`, overflow oculto, hover que acerca la imagen (`scale-105`, 500 ms) sin mover la tarjeta.
- **Insignia "Top Pixela"**: `Badge` primario arriba a la izquierda, solo si la nota ≥ 8.

### Inputs
- Píldora `surface`, 48 px, icono en `accent` a la izquierda, placeholder `white/40`.
- Hover: borde `white/20`. Foco: borde `accent/60` más el anillo global. Error: borde `red-500/60` y mensaje con `role="alert"` debajo.

### Navigation
- Píldora flotante centrada sobre el hero; al hacer scroll se compacta a barra completa con `backdrop-blur`. Enlaces Outfit 14 px `white/65`, hover blanco, activo blanco con subrayado `accent` de 2 px.
- En móvil, menú hamburguesa a pantalla completa.

### Paneles y modales
- `surface`, `rounded-2xl`, borde `white/10`, sombra Modal, padding 24 px. Overlay `black/70` con `backdrop-blur-sm`.

### Motion
- **Easing:** `ease-out-expo` = `cubic-bezier(0.22, 1, 0.36, 1)` para entradas y hovers. Nunca `ease-in` en algo que aparece.
- **Duraciones:** 150 ms para feedback de pulsación, 200–300 ms para hovers y estados, 500–700 ms para entradas de sección y zoom de imagen.
- **Entradas de sección:** GSAP `useScrollAnimation`, 20 px de recorrido y opacidad, una vez.
- **Bucles infinitos:** solo indicadores de carga (`animate-pulse`, `animate-spin`, `shimmer`) y la ambientación del footer.
- **`prefers-reduced-motion`:** obligatorio. `globals.css` neutraliza animaciones y transiciones, y los hooks de GSAP muestran el contenido sin animar.
- No se usa `transition-all`: se nombran las propiedades (`transition-colors`, `transition-transform`, `transition-[color,background-color,box-shadow,transform]`).

### Superficies del navegador
Selección de texto en `accent/40`, `caret-color` en `accent`, scrollbar oscura con el pulgar en `raised`, `color-scheme: dark` y `theme-color` igual a `screen`.

## Do's and Don'ts

### Do:
- **Do** usar los tokens `pixela-ink`, `pixela-dark`, `pixela-surface`, `pixela-raised` y `pixela-accent` para todo color de superficie o acento.
- **Do** usar `.btn-primary` / `.btn-ghost` para cualquier botón o enlace con forma de botón.
- **Do** dar `aria-label` a cada botón que solo tenga icono.
- **Do** dejar el texto secundario en `gray-400` o `white/55` como mínimo.
- **Do** respetar `prefers-reduced-motion` en cualquier animación nueva, incluidas las de GSAP.

### Don't:
- **Don't** escribir hex sueltos en clases (`bg-[#1a1a1a]`, `text-[#ec1b69]`) ni rosas parecidos (`#ff007f`, `#FF2D55`, `pink-400`).
- **Don't** poner emojis en botones o títulos ("🏠 Volver al inicio").
- **Don't** usar grises fríos (`gray-800`, `slate-*`) como fondo de botón o panel.
- **Don't** añadir glows rosas sin desplazamiento ni degradados de texto.
- **Don't** usar `transition-all` ni pulsos infinitos para llamar la atención sobre controles.
- **Don't** pasar SVGs locales por el optimizador de `next/image`: márcalos `unoptimized`.

---

## Auditoría (octubre de 2026) y cambios priorizados

Recorrido en escritorio (1440×900) y móvil (375×812): home, categorías, detalle de serie, login, registro y 404.

### Lo que funciona y se conserva
- El hero en blanco y negro con el título gigante y la barra de progreso.
- Las filas de pósters a sangre con títulos de marquesina en zigzag.
- El bloque Descubre (mosaico de pósters inclinado con el titular en dos colores).
- Las citas de cine entre secciones y el grano de película.

### Hallazgos
1. **Login y registro rotos.** El logo (`/img/Logo-login.svg`) pasaba por `/_next/image`, que rechaza SVG: se veía un icono de imagen rota. El botón "Iniciar" era `#181818` sobre `#111`, casi invisible. El título llevaba una barra literal ("Bienvenido a Pixela |") y un subtítulo en gris azulado. En registro, el enlace "¿Ya tienes cuenta?" se partía en dos líneas junto al botón.
2. **Fuentes mal cableadas.** Outfit se registraba como `--font-sans`, pero `font-outfit` apuntaba a `--font-outfit`, que no existía (funcionaba por herencia). `font-['Outfit']` y `fontFamily: "'Outfit'"` no resolvían la fuente de `next/font`. Roboto se descargaba sin usarse en ningún sitio. 18 utilidades `font-pixela-*` y tres escalas `text-pixela-*` estaban muertas.
3. **`globals.css` con restos.** Un bloque `@theme inline` de Tailwind 4 sin efecto en Tailwind 3 y variables `--background`/`--foreground` de modo claro: en un sistema en modo claro el color de texto heredado era `#171717` sobre fondo oscuro.
4. **Diez negros distintos.** `#181818`, `#1a1a1a`, `#0f0f0f`, `#111`, `#141414`, `#252525`, `#2a2a2a`, `#0a0a0a`, `gray-800/900`, `rgba(17,17,17,.47)`. Y tres rosas falsos (`#ff007f`, `#FF2D55`, `pink-400`), además de `#ec1b69` escrito a mano 44 veces.
5. **Once estilos de botón primario** con radios de 4 px a 49 px y hovers distintos. La 404 mezclaba un botón con emoji y otro gris frío (`gray-800`).
6. **Contraste insuficiente.** `text-gray-500`/`600` en metadatos, login y reseñas (≈3.6:1 sobre `#181818`).
7. **Motion sin `prefers-reduced-motion`** en ningún sitio: ni CSS ni GSAP. Los botones del carrusel pulsaban en bucle infinito (`embla-btn-pulse`). Había 86 `transition-all`.
8. **Botones de icono sin nombre accesible** en el modal del hero y en el selector de banner.
9. **Navegador sin tematizar:** selección azul por defecto, scrollbar clara en Windows y `theme-color` `#000` distinto del fondo.

### Cambios aplicados en esta rama
- [ ] Tokens de color, fuente y motion en `tailwind.config.js` y `globals.css`; limpieza de utilidades y bloques muertos; Roboto fuera.
- [ ] Hex sueltos sustituidos por tokens en todo `src/`.
- [ ] `.btn`, `.btn-primary`, `.btn-ghost` y adopción en la 404/403, el estado vacío, los errores de perfil y los formularios de reseña.
- [ ] Login y registro rehechos: logo visible, botón primario real, título sin barra, inputs con foco visible.
- [ ] Contraste: `gray-500/600` subidos a `gray-400` en texto.
- [ ] `prefers-reduced-motion` global y en los hooks de GSAP; fuera el pulso infinito del carrusel.
- [ ] Superficies del navegador tematizadas (selección, caret, scrollbar, `color-scheme`, `theme-color`).
- [ ] `aria-label` en los botones de icono que no lo tenían.

### Pendiente, por prioridad
1. **P1. Insignia "Top Pixela" en casi todas las tarjetas.** El umbral (nota ≥ 8) lo superan casi todas las obras populares, así que la insignia deja de significar algo. Propuesta: subirlo a 8.5 o mostrarla solo en el top 3 de cada fila. Es una decisión de producto.
2. **P1. Quitar `transition-all` en lo que queda** (unas 70 apariciones en componentes de feature) y pasar las duraciones a la escala 150/250/500.
3. **P1. Un solo contenedor.** Unificar `headerStyles.ts` con `TrendingHeader` (duplica las mismas cadenas) y usar la clave `ls:` en vez de la media query a mano.
4. **P2. Footer.** Ocho animaciones infinitas de partículas y líneas con `rgba(255,0,127)`. Ya se paran con reduced-motion y el color pasa a token, pero sobran la mitad.
5. **P2. Inputs del perfil** (`profile/InputField`, inputs inline de `ProfileUsers`) con el patrón de input de login.
6. **P2. Esqueletos de carga** con degradado `accent → pink-400`: pasar a un `shimmer` neutro sobre `surface`.
7. **P3. Título "Quiénes somos"** en caja normal frente a las marquesinas en mayúsculas de la home: decidir si entra en la regla de la marquesina.
8. **P3. Tailwind 4.** Al migrar, mover estos tokens a `@theme`.
