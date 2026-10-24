/**
 * Estilos compartidos por las cabeceras de sección de la home (Tendencias,
 * Top Cartelera, Finde en casa): un solo contenedor y una sola escala del
 * título. `ls:` es el breakpoint de móvil en horizontal de tailwind.config.js.
 */
const HEADER_CONTAINER_BASE =
  "relative w-full bg-pixela-dark flex flex-col py-16 md:py-0 md:pt-20 2k:pt-12 ls:py-8 ls:min-h-0";

export const HEADER_LAYOUT_STYLES = {
  container: `${HEADER_CONTAINER_BASE} min-h-[50vh]`,
  // Tendencias abre la home justo después del hero y ocupa la pantalla entera.
  containerFullScreen: `${HEADER_CONTAINER_BASE} min-h-[100svh] 2k:min-h-[80vh]`,
  content:
    "flex-grow flex flex-col justify-center md:justify-start relative z-10 md:pb-0 2k:pb-8",
  headerWrapper:
    "relative w-full bg-pixela-dark flex flex-col justify-center overflow-hidden items-stretch gap-8 px-4 mb-8 lg:w-[85%] xl:w-[80%] 2k:w-[70%] lg:mx-auto lg:flex-row lg:items-end lg:justify-between lg:gap-0 lg:px-0 lg:mb-12 lg:overflow-visible lg:bg-transparent lg:relative ls:gap-4 ls:mb-4",
  carouselWrapper: "w-full",
  slides: "flex gap-0",
  slide:
    "relative w-[280px] min-w-[280px] max-w-[280px] md:w-[375px] md:min-w-[375px] md:max-w-[375px] flex-none",
} as const;

/** Toggle Series/Películas de las secciones con dos catálogos. */
export const HEADER_TOGGLE_STYLES = {
  toggleContainer: "mb-12 md:mb-10 px-4 md:px-0",
  toggleWrapper:
    "flex bg-white/5 backdrop-blur-sm rounded-full p-1 border border-white/10 relative shadow-lg shadow-black/20 w-full sm:w-auto ipad:w-full",
} as const;

export const HEADER_TYPOGRAPHY_STYLES = {
  titleBase:
    "font-black tracking-wider uppercase leading-none w-full md:w-auto break-words text-pixela-accent",
  titleMobileBase: "block sm:hidden text-[64px] leading-[0.95]",
  titleDesktopBase:
    "hidden sm:block text-[64px] md:text-[80px] lg:text-[80px] xl:text-[96px] 2xl:text-[112px] min-[1920px]:text-[128px] 2k:text-[100px] lg:whitespace-nowrap ls:text-[48px]",
} as const;
