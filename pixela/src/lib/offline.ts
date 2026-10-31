/**
 * Service worker (`public/sw.js`): registro y limpieza de lo personal.
 *
 * Solo en producción: en desarrollo una caché de páginas y de API haría que
 * los cambios no se vieran.
 */
export function registerServiceWorker(): void {
  if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("/sw.js").catch(() => {
    // Sin service worker la app funciona igual, solo que sin modo sin conexión.
  });
}

/** Al cerrar sesión: que no quede nada de la cuenta guardado en el navegador. */
export function clearOfflineData(): void {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker.controller?.postMessage("clear-private");
}
