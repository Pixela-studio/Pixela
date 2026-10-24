/**
 * `true` cuando el usuario ha pedido menos movimiento en su sistema.
 *
 * `globals.css` ya neutraliza las animaciones CSS, pero GSAP escribe estilos
 * inline desde JS y no se entera: sus hooks deben preguntar aquí y mostrar el
 * contenido en su estado final sin animarlo.
 */
export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
