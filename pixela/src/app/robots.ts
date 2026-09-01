import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * `robots.txt` generado por Next (`/robots.txt`).
 *
 * El proyecto no tenía ninguno, así que cualquier rastreador entraba por todas
 * partes: las 25 rutas de `/api`, las fichas paginadas de `/categories` y el
 * área privada. Cada página rastreada arrastra además su cascada de peticiones
 * (RSC, JSON, imágenes), y ese tráfico se contabiliza igual que el de una
 * persona.
 *
 * Aquí se hacen tres cosas:
 * 1. Cerrar a todo el mundo lo que no debe indexarse (`/api`, `/profile`, auth).
 * 2. Poner `crawlDelay` a los buscadores legítimos que sí queremos en el índice.
 * 3. Cerrar por completo los rastreadores que no aportan visitas: scrapers de
 *    SEO, agregadores de datos y bots de entrenamiento de IA.
 *
 * `robots.txt` es una convención, no un control de acceso: los bots que la
 * ignoran se bloquean en `src/proxy.ts` por user-agent.
 */

/** Rutas que no aportan nada a un buscador y sí generan tráfico. */
const DISALLOWED_PATHS = [
  "/api/",
  "/profile",
  "/login",
  "/register",
  // Las combinaciones de género × página × tipo son infinitas: un rastreador
  // puede generar miles de URLs distintas a partir de los query params.
  "/categories?",
];

/**
 * Rastreadores bloqueados por completo.
 *
 * Ninguno envía visitas: son scrapers de SEO comercial, agregadores de datos y
 * bots de entrenamiento de modelos. Son también los más agresivos en cadencia.
 */
const BLOCKED_CRAWLERS = [
  // SEO / backlinks
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DotBot",
  "DataForSeoBot",
  "BLEXBot",
  "Barkrowler",
  "serpstatbot",
  "ZoominfoBot",
  "SeekportBot",
  "Screaming Frog SEO Spider",
  // Agregadores y archivadores
  "CCBot",
  "ImagesiftBot",
  "Timpibot",
  "Scrapy",
  "python-requests",
  // Buscadores sin presencia en el mercado objetivo (es-ES)
  "Bytespider",
  "PetalBot",
  "Sogou web spider",
  "YisouSpider",
  "MegaIndex",
  // Entrenamiento de modelos
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "Applebot-Extended",
  "Google-Extended",
  "FacebookBot",
  "meta-externalagent",
  "Amazonbot",
  "Diffbot",
  "cohere-ai",
  "Omgilibot",
  "PerplexityBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Buscadores que sí traen visitas.
        userAgent: ["Googlebot", "Bingbot", "DuckDuckBot", "Applebot"],
        allow: "/",
        disallow: DISALLOWED_PATHS,
        crawlDelay: 5,
      },
      {
        userAgent: BLOCKED_CRAWLERS,
        disallow: "/",
      },
      {
        // Resto de agentes: se permite lo público con una cadencia contenida.
        userAgent: "*",
        allow: "/",
        disallow: DISALLOWED_PATHS,
        crawlDelay: 10,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
