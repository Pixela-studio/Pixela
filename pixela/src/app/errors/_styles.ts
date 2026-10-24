/**
 * Estilos compartidos por las páginas de error.
 *
 * `error-403.tsx` y `not-found.tsx` declaraban el mismo objeto `STYLES` de 28
 * líneas, copiado carácter a carácter. Cualquier retoque en una de las dos
 * dejaba la otra desincronizada sin que nada lo señalara.
 *
 * El código de error es la marquesina de la página: rosa sólido, sin halos ni
 * pulso (ver DESIGN.md › La regla del proyector). Los botones salen de las
 * clases `.btn` de `globals.css`.
 */
export const STYLES = {
  container:
    "relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-pixela-dark px-4 pb-16 pt-28",
  vignette:
    "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(15,15,15,0.9)_100%)]",
  noise: "noise-effect",
  content: {
    wrapper: "relative z-10 mx-auto max-w-2xl text-center",
    errorCode:
      "mb-4 font-outfit text-8xl font-black leading-none tracking-tight text-pixela-accent md:text-9xl",
    // Para una palabra en lugar de un código ("Corten" en error.tsx): más
    // pequeña para que no desborde a 375 px.
    errorWord:
      "mb-4 font-outfit text-6xl font-black leading-none tracking-tight text-pixela-accent md:text-8xl",
    title: "mb-4 font-outfit text-3xl font-bold text-white [text-wrap:balance] md:text-4xl",
    description:
      "mx-auto mb-10 max-w-lg text-lg leading-relaxed text-white/70 [text-wrap:pretty]",
    quote: {
      container: "mx-auto mb-10 max-w-md",
      text: "text-base italic font-light text-white/80 md:text-lg",
      attribution: "mt-2 block text-sm not-italic text-white/55",
    },
  },
  buttons: {
    container: "flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4",
    primary: "btn btn-primary",
    secondary: "btn btn-ghost",
    icon: "h-4 w-4",
  },
} as const;
