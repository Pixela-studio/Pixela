import { Outfit } from "next/font/google";

/*
 * Outfit es la única familia de Pixela (ver DESIGN.md). Se expone como
 * `--font-outfit`, que es lo que leen `font-sans` y `font-outfit` en Tailwind.
 *
 * Roboto se descargaba en cada visita sin que ningún componente la usara.
 */
export const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-outfit",
  fallback: ["system-ui", "Arial", "sans-serif"],
});
