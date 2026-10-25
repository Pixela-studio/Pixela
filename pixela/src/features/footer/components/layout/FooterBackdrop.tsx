const STYLES = {
  // El nombre vuelve a todo lo ancho como cartón final, cortado por abajo.
  wordmark:
    "pointer-events-none select-none absolute inset-x-0 -bottom-[0.18em] text-center font-display italic font-bold leading-none tracking-[-0.04em] text-white/[0.06] whitespace-nowrap",
} as const;

/**
 * Fondo del footer: el nombre de Pixela a escala de pantalla, como el cartón
 * de cierre de una película, (el grano lo pone la capa global de la app).
 *
 * Sustituye a un fondo con partículas, líneas de flujo, triángulos, burbujas y
 * dos manchas difuminadas (una morada) animadas en bucle: ocho animaciones
 * infinitas al final de cada página, para un bloque que es solo enlaces.
 */
export const FooterBackdrop = () => (
  <>
    <span className={STYLES.wordmark} style={{ fontSize: "clamp(120px, 26vw, 420px)" }} aria-hidden="true">
      Pixela
    </span>
  </>
);
