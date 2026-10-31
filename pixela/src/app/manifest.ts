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
    // Negro de sala (DESIGN.md): la pantalla de arranque y la barra del
    // sistema no cambian de tono al abrir la app instalada.
    background_color: "#0D0A08",
    theme_color: "#0D0A08",
    lang: "es-ES",
    /*
     * Sin iconos de 192 y 512 px Chrome no ofrece instalarla: solo había el
     * favicon. `maskable` deja la marca dentro de la zona segura para que
     * Android pueda recortarla en círculo o en gota.
     */
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
  };
}
