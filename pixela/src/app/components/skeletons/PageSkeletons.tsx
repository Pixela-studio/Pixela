/**
 * Skeleton del hero: replica la disposición del HeroSection real (fondo a
 * pantalla completa, flechas laterales y bloque de texto abajo a la izquierda)
 * con bloques neutros.
 *
 * Antes ponía un `<h1>` gigante "CARGANDO EXPERIENCIA CINEMATOGRÁFICA" con
 * tres puntos rebotando: un segundo `h1` en la página para el lector de
 * pantalla y un cartel que competía con el contenido que estaba por llegar.
 */
const STYLES = {
  container:
    "relative w-full min-h-[80vh] sm:min-h-[85vh] md:min-h-screen lg:h-screen 2k:h-[70vh] overflow-hidden bg-pixela-ink",
  backdrop: "absolute inset-0 animate-shimmer",
  vignette: "absolute inset-0 bg-gradient-to-t from-pixela-dark via-transparent to-transparent",
  arrow:
    "absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 rounded-full border border-white/10 bg-white/[0.04] sm:block",
  content:
    "absolute inset-x-0 bottom-0 z-10 px-4 sm:px-6 lg:px-0",
  contentInner:
    "mx-auto w-full max-w-[95%] sm:max-w-xl md:max-w-2xl lg:max-w-[83.333%] 2k:max-w-[60%] pb-20 sm:pb-24 md:pb-28 lg:pb-36 2k:pb-24 space-y-4",
  block: "rounded-lg bg-white/[0.06] animate-pulse",
} as const;

export const HeroSectionSkeleton = () => (
  <div className={STYLES.container} role="status" aria-label="Cargando portada">
    <div className={STYLES.backdrop} aria-hidden="true" />
    <div className={STYLES.vignette} aria-hidden="true" />

    <div className={`${STYLES.arrow} left-4 lg:left-16`} aria-hidden="true" />
    <div className={`${STYLES.arrow} right-4 lg:right-16`} aria-hidden="true" />

    <div className={STYLES.content} aria-hidden="true">
      <div className={STYLES.contentInner}>
        <div className={`${STYLES.block} h-3 w-20`} />
        <div className={`${STYLES.block} h-14 w-3/4 max-w-xl sm:h-20`} />
        <div className={`${STYLES.block} h-4 w-full max-w-lg`} />
        <div className={`${STYLES.block} h-4 w-2/3 max-w-md`} />
        <div className={`${STYLES.block} mt-6 h-12 w-40 rounded-full`} />
      </div>
    </div>
  </div>
);
