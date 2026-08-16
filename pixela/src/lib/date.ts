/**
 * Extrae el año de una fecha de la API.
 *
 * TMDB devuelve cadena vacía cuando un título no tiene fecha de estreno
 * confirmada. `new Date('').getFullYear()` da `NaN`, así que varias tarjetas
 * llegaban a pintar literalmente "NaN" en la ficha.
 *
 * @param value - Fecha ISO ("2024-05-17") o cadena vacía.
 * @param fallback - Qué mostrar cuando no hay fecha utilizable.
 */
export function formatYear(
  value: string | null | undefined,
  fallback = "—",
): string {
  if (!value) return fallback;

  const year = new Date(value).getFullYear();
  return Number.isFinite(year) ? String(year) : fallback;
}

/**
 * Formatea una duración en minutos como "2 h 14 min".
 *
 * La ficha mostraba "148 minutos" en crudo; los catálogos de referencia
 * (Prime Video, Disney+) parten horas y minutos porque se lee de un vistazo.
 */
export function formatRuntime(minutes: number | null | undefined): string | null {
  if (!minutes || minutes <= 0) return null;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} h`;
  return `${hours} h ${rest} min`;
}
