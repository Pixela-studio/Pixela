import type { MetadataRoute } from "next";

/**
 * Web App Manifest servido en `/manifest.webmanifest`.
 *
 * `layout.tsx` declaraba `manifest: "/manifest.json"`, pero ese fichero nunca
 * existió en `public/`: el navegador lo pedía en cada carga y se llevaba un 404
 * que en App Router se resuelve renderizando `not-found`, o sea una invocación
 * de función completa por visita. Lo mismo pasaba con `/apple-touch-icon.png`.
 *
 * Declarándolo como ruta de metadatos, Next lo genera en build, lo sirve
 * estático y añade el `<link rel="manifest">` automáticamente.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pixela",
    short_name: "Pixela",
    description:
      "Descubre, colecciona y comparte experiencias audiovisuales en una comunidad de apasionados del cine y las series.",
    start_url: "/",
    display: "standalone",
    background_color: "#0F0F0F",
    theme_color: "#000000",
    lang: "es-ES",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
