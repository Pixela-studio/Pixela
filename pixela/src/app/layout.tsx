import { Metadata, Viewport } from "next";
import "./globals.css";
import { outfit, roboto } from "./ui/fonts";
import { Providers } from "./providers";
import ClientLayout from "./ClientLayout";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  /*
   * Base para resolver cualquier URL relativa de los metadatos. Sin ella Next
   * avisa en build y las rutas relativas quedan a medias.
   */
  metadataBase: new URL(SITE_URL),
  title: "Pixela - Descubre y comparte apasionantes historias cinematográficas",
  description:
    "Pixela es una comunidad para los amantes del cine y las series. Descubre historias que te conectan con grandes producciones audiovisuales.",
  keywords: [
    "streaming",
    "películas",
    "series",
    "cine",
    "comunidad",
    "TMDB",
    "Pixela",
  ],
  authors: [{ name: "Pixela" }],
  /*
   * Ni `manifest` ni `icons` se declaran a mano:
   *
   * - El manifiesto lo genera `app/manifest.ts` y Next inyecta el `<link>`.
   * - El icono lo resuelve `app/favicon.ico` por convención.
   *
   * Antes se apuntaba a `/manifest.json` y `/apple-touch-icon.png`, dos ficheros
   * que no existen en `public/`. El navegador los pedía en cada visita y cada
   * 404 acababa renderizando `not-found` en el servidor: dos invocaciones de
   * función regaladas por carga de página.
   */
  openGraph: {
    title: "Pixela - Pasión por el cine y las series",
    description:
      "Descubre, colecciona y comparte experiencias audiovisuales en una comunidad de apasionados del cine y las series.",
    /*
     * Era `https://pixela.io`, un dominio que no pertenece al proyecto: está
     * aparcado y en venta. Ver `@/lib/site` para el detalle.
     */
    url: SITE_URL,
    siteName: "Pixela",
    // Sin `images`: la que se declaraba (`/images/pixela-og-image.jpg`) tampoco
    // existe, y cada validador de enlaces la pedía para encontrarse un 404.
    locale: "es_ES",
    type: "website",
  },
  other: {
    "X-UA-Compatible": "IE=edge",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#000000",
};

const STYLES = {
  html: `${roboto.variable} ${outfit.variable}`,
  body: "antialiased bg-pixela-dark",
} as const;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={STYLES.html}>
      <head>
        {/* Preconectar a dominios importantes - no soportado directamente en metadata o viewport */}
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
      </head>
      <body className={STYLES.body} suppressHydrationWarning={true}>
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
