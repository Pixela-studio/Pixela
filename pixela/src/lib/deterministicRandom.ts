/**
 * Pseudoaleatoriedad determinista para valores decorativos.
 *
 * Varios componentes generaban su decoración con `Math.random()` dentro de
 * `useMemo`. React 19 lo marca como impuro con razón: `useMemo` es una pista de
 * caché, no una garantía, así que en cuanto React descarta el memo la
 * decoración salta de sitio. Además impide renderizar en servidor sin provocar
 * un desajuste de hidratación.
 *
 * Este generador produce siempre la misma secuencia para la misma semilla, de
 * modo que el resultado visual es idéntico (valores repartidos por el rango)
 * pero estable entre renders y entre servidor y cliente.
 */

/** Hash entero de 32 bits (mulberry32 sobre una semilla escalada). */
function hash(seed: number): number {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/**
 * Valor pseudoaleatorio en `[0, 1)` para un par (índice, canal).
 *
 * El `channel` permite sacar varios valores independientes del mismo índice
 * —tamaño, posición, retardo— sin que queden correlacionados.
 */
export function seededRandom(index: number, channel = 0): number {
  return hash(index * 1013 + channel * 7919);
}

/** Valor pseudoaleatorio determinista dentro de `[min, max)`. */
export function seededRange(
  index: number,
  channel: number,
  min: number,
  max: number,
): number {
  return min + seededRandom(index, channel) * (max - min);
}
