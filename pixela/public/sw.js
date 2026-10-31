/*
 * Service worker de Pixela: lo justo para que la app instalada sirva sin
 * cobertura (Tomás, en un pueblo con 3G).
 *
 * - Estáticos de `/_next/static/`: caché primero (llevan hash en el nombre).
 * - Lo personal que se consulta sin conexión —biblioteca, diario, capítulos,
 *   listas y la sesión—: red primero y, si no hay red, lo último guardado.
 *   Es solo lectura: marcar o editar sin conexión falla y la app lo dice.
 * - Páginas: red primero; sin red, la última copia o `/sin-conexion`.
 *
 * Lo personal se borra al cerrar sesión (mensaje `clear-private` desde la
 * app) y en cuanto la API responde 401: en un ordenador compartido no debe
 * quedar nada de la cuenta.
 *
 * Al cambiar algo aquí, subir VERSION para que el navegador tire las cachés
 * anteriores.
 */
const VERSION = "v1";
const STATIC_CACHE = `pixela-static-${VERSION}`;
const PAGES_CACHE = `pixela-pages-${VERSION}`;
const PRIVATE_CACHE = `pixela-private-${VERSION}`;
const OFFLINE_URL = "/sin-conexion";
const MAX_PAGES = 40;

const PRIVATE_API = [
  "/api/library/details",
  "/api/diary",
  "/api/episodes",
  "/api/lists",
  "/api/auth/user",
  "/api/auth/session",
  "/api/favorites",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES_CACHE)
      .then((cache) => cache.add(new Request(OFFLINE_URL, { cache: "reload" })))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  const current = [STATIC_CACHE, PAGES_CACHE, PRIVATE_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !current.includes(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "clear-private") {
    event.waitUntil(Promise.all([caches.delete(PRIVATE_CACHE), caches.delete(PAGES_CACHE)]));
  }
});

async function trimCache(name, max) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - max)).map((key) => cache.delete(key)));
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.status === 401) {
      await caches.delete(PRIVATE_CACHE);
    } else if (response.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw error;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
    return;
  }

  if (PRIVATE_API.some((prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`))) {
    event.respondWith(networkFirst(request, PRIVATE_CACHE));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      networkFirst(request, PAGES_CACHE)
        .then((response) => {
          trimCache(PAGES_CACHE, MAX_PAGES);
          return response;
        })
        .catch(async () => (await caches.match(OFFLINE_URL)) || Response.error()),
    );
  }
});
