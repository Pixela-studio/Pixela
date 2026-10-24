import { ActorCardProps } from '@/features/media/types/cast';
import Image from 'next/image';
import { memo, useState } from 'react';
import clsx from 'clsx';
import { FiUser } from 'react-icons/fi';
import Link from 'next/link';

/**
 * Marca que pone el Server Component de la ruta sobre cada actor del reparto.
 *
 * Se declara aquí en local y **no** se importa de `@/lib/api/tmdbAllowlist`
 * aunque el tipo viva allí: este componente cuelga de `CastSection`, que es
 * `"use client"`, así que un import de valor arrastraría al bundle del
 * navegador el módulo de la allowlist y, con él, `src/lib/tmdb.ts`, que lanza en
 * carga si no hay `TMDB_API_KEY`. Catorce caracteres de tipo duplicado a cambio
 * de que eso no pueda pasar por accidente.
 */
type ActorConEnlace = ActorCardProps['actor'] & { enlazable?: boolean };

/**
 * Componente que muestra una tarjeta de actor con su imagen y detalles
 * @param {ActorCardProps} props - Propiedades del componente
 * @param {Actor} props.actor - Datos del actor a mostrar
 * @param {string} [props.className] - Clases CSS opcionales para personalizar el estilo
 * @returns {JSX.Element} Componente de tarjeta de actor
 */
export const ActorCard = memo(function ActorCard({ actor, className = '' }: ActorCardProps) {
  const [imageError, setImageError] = useState(false);
  const hasValidImage = actor.foto && !imageError;

  /*
   * Esta tarjeta era uno de los dos `<Link>` que cerraban el ciclo rastreable
   * ficha → reparto → persona → filmografía → más fichas, y con él cualquier
   * rastreador podía recorrer TMDB entero dejando una entrada de caché ISR por
   * paso. El reparto que devuelve TMDB no está topado en ningún sitio —64
   * personas en un estreno reciente—, así que el enlace se emite solo para el
   * reparto principal de las fichas de la allowlist. Quién entra y por qué:
   * `LINKABLE_CAST_LIMIT` en `src/lib/api/tmdbAllowlist.ts`.
   *
   * El resto de la tarjeta no cambia: se sigue viendo la foto, el nombre y el
   * personaje, y la ficha de esa persona sigue siendo accesible si se llega por
   * otro camino. Lo único que desaparece es el camino automático.
   *
   * `!== false` y no `=== true`: si nadie marca el reparto —una ruta futura, un
   * render de prueba— la tarjeta enlaza como siempre. Un despiste aquí debe
   * costarnos superficie rastreable, nunca navegación.
   */
  const enlazable = (actor as ActorConEnlace).enlazable !== false;

  const contenido = (
    <>
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-pixela-surface">
        {hasValidImage ? (
          <Image
            src={actor.foto || ''}
            alt=""
            fill
            sizes="(max-width: 640px) 140px, (max-width: 768px) 160px, 180px"
            className="object-cover transition-transform duration-700 ease-out-expo [@media(hover:hover)]:group-hover:scale-[1.04]"
            priority={false}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-pixela-raised">
            <FiUser className="w-1/3 text-gray-400 h-1/3" />
          </div>
        )}
      </div>
      {/* Nombre y personaje sin rótulos "Nombre:" / "Personaje:": el orden
          y el peso ya dicen qué es cada cosa, como en unos créditos. */}
      <div className="pt-3">
        <h3 className="text-[15px] font-semibold text-white truncate">{actor.nombre}</h3>
        {actor.personaje && (
          <p className="mt-0.5 text-sm text-gray-400 truncate">{actor.personaje}</p>
        )}
      </div>
    </>
  );

  /*
   * El zoom de la foto al pasar el ratón solo existe dentro de un `<Link>`
   * (`group` sin enlace no se activa con el foco ni lleva a ningún sitio).
   */
  const estiloBase = clsx(
    "block rounded-sm",
    enlazable && "group",
    className
  );

  if (!enlazable) {
    return <div className={estiloBase}>{contenido}</div>;
  }

  return (
    <Link
      href={`/actor/${actor.id}`}
      prefetch={false}
      className={estiloBase}
    >
      {contenido}
    </Link>
  );
});

ActorCard.displayName = 'ActorCard';
