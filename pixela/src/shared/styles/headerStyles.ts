/**
 * Estilos compartidos por las cabeceras de sección de la home (Tendencias,
 * Top Cartelera, Finde en casa): un solo contenedor y una sola escala del
 * título. `ls:` es el breakpoint de móvil en horizontal de tailwind.config.js.
 */
// Ritmo de la home: 96-160 px entre secciones y los mismos márgenes que la
// navbar y el hero, para que todos los títulos arranquen en la misma línea.
const PAGE_GUTTER = "px-4 sm:px-6 md:px-10 lg:px-16 2k:px-24";

const HEADER_CONTAINER_BASE =
  "relative w-full bg-pixela-dark flex flex-col py-20 md:py-28 lg:py-32 2k:py-28 ls:py-10";

export const HEADER_LAYOUT_STYLES = {
  container: HEADER_CONTAINER_BASE,
  containerFullScreen: HEADER_CONTAINER_BASE,
  content: "relative z-10 flex flex-col",
  headerWrapper: `relative w-full flex flex-col gap-6 mb-8 md:mb-12 lg:flex-row lg:items-end lg:justify-between lg:gap-12 ls:gap-4 ls:mb-4 ${PAGE_GUTTER}`,
  // Frase que dice qué hay en la fila, bajo el título.
  subtitle: "mt-4 max-w-md text-base md:text-lg leading-relaxed text-gray-400",
  carouselWrapper: "w-full",
  slides: "flex",
  // El hueco entre pósters va en el padding de cada slide (patrón de Embla);
  // el primero y el último se alinean con el margen de la página.
  slide:
    "relative flex-none pl-3 sm:pl-4 md:pl-5 first:pl-4 sm:first:pl-6 md:first:pl-10 lg:first:pl-16 2k:first:pl-24 last:pr-4 sm:last:pr-6 md:last:pr-10 lg:last:pr-16 2k:last:pr-24",
} as const;

/** Toggle Series/Películas de las secciones con dos catálogos. */
export const HEADER_TOGGLE_STYLES = {
  toggleContainer: "w-full sm:w-auto",
  toggleWrapper: "flex bg-pixela-surface rounded-full p-1 w-full sm:w-auto ipad:w-full",
} as const;

/*
 * Títulos de sección como cartones de crédito: Bodoni en caja normal, marfil.
 * El rosa queda para las acciones (DESIGN.md › La regla del rótulo).
 */
export const HEADER_TYPOGRAPHY_STYLES = {
  title:
    "title-card w-full md:w-auto text-[52px] sm:text-7xl md:text-[88px] xl:text-[104px] 2k:text-[112px] lg:whitespace-nowrap ls:text-5xl",
} as const;
