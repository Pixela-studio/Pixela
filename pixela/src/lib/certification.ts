/**
 * Texto completo de una calificación por edades española, para lectores de
 * pantalla y `title`: «12» → «No recomendada para menores de 12 años».
 *
 * Vive aparte de `api/shared/tmdbDetailExtras` porque la usa la ficha en el
 * cliente y aquel módulo arrastra los mapeos de TMDB.
 */
export function describeCertification(cert: string): string {
  if (cert === "TP") return "Apta para todos los públicos";
  if (/^\d+$/.test(cert)) return `No recomendada para menores de ${cert} años`;
  return `Calificación ${cert}`;
}
