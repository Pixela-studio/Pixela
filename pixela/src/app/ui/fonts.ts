import { Archivo, Bodoni_Moda } from "next/font/google";

/*
 * Dos familias (ver DESIGN.md › Typography):
 *
 * - Bodoni Moda, la voz de los títulos: la didona de alto contraste de los
 *   cartones de crédito y los carteles clásicos. Con su eje óptico (`opsz`)
 *   el trazo fino aguanta a 128 px sin romperse.
 * - Archivo, la interfaz y el texto: grotesca sobria con eje de anchura
 *   (`wdth`), que usamos algo expandida en la navegación y los metadatos.
 */
export const display = Bodoni_Moda({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-display",
  fallback: ["Didot", "Georgia", "serif"],
});

export const sans = Archivo({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  variable: "--font-sans",
  fallback: ["system-ui", "Arial", "sans-serif"],
});
