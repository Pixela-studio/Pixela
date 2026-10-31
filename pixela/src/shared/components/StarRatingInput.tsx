"use client";

import { KeyboardEvent, useRef, useState } from 'react';
import { FiStar } from 'react-icons/fi';

/** Escala interna: 1–10, cada punto es media estrella. */
const MAX_VALUE = 10;
const STARS = [1, 2, 3, 4, 5] as const;

/** "0,5 estrellas", "1 estrella", "3,5 estrellas"… con coma decimal. */
export const formatStars = (value: number): string => {
  const stars = value / 2;
  const text = stars.toLocaleString('es-ES', { maximumFractionDigits: 1 });
  return `${text} ${stars === 1 ? 'estrella' : 'estrellas'}`;
};

interface StarRatingInputProps {
  /** Nota en la escala 1–10, o `null` si aún no se ha elegido. */
  value: number | null;
  onChange: (value: number) => void;
  /** Id del elemento que nombra el grupo (el `<span>` o `<p>` de "Puntuación"). */
  labelledBy?: string;
  /** Nombre accesible si no hay un elemento visible que lo dé. */
  label?: string;
  disabled?: boolean;
  /** Id del mensaje de error, si lo hay. */
  errorId?: string;
  size?: 'sm' | 'md';
}

/**
 * Selector de nota con medias estrellas.
 *
 * Es un `radiogroup` de diez opciones (dos por estrella) con tabulación
 * itinerante: solo la opción marcada —o la primera si no hay ninguna— está en
 * el orden de Tab, y las flechas, Inicio y Fin mueven la selección, como un
 * grupo de radios nativo.
 */
export const StarRatingInput = ({
  value,
  onChange,
  labelledBy,
  label,
  disabled = false,
  errorId,
  size = 'md',
}: StarRatingInputProps) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const shown = hovered ?? value ?? 0;
  const tabbable = value ?? 1;
  // Con el dedo, cada media estrella necesita una zona de toque utilizable:
  // a 28 px las mitades medían 14 px y era casi imposible acertar.
  const starSize =
    size === 'sm'
      ? 'h-5 w-5'
      : 'h-7 w-7 [@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:w-11';

  const select = (next: number) => {
    const clamped = Math.min(MAX_VALUE, Math.max(1, next));
    onChange(clamped);
    optionRefs.current[clamped - 1]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, optionValue: number) => {
    if (disabled) return;
    const keys: Record<string, number> = {
      ArrowRight: optionValue + 1,
      ArrowUp: optionValue + 1,
      ArrowLeft: optionValue - 1,
      ArrowDown: optionValue - 1,
      Home: 1,
      End: MAX_VALUE,
    };
    const next = keys[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next);
  };

  return (
    <div className="flex items-center gap-3">
      <div
        role="radiogroup"
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : label}
        aria-required="true"
        aria-invalid={errorId ? true : undefined}
        aria-describedby={errorId}
        aria-disabled={disabled || undefined}
        className="flex items-center gap-1"
        onMouseLeave={() => setHovered(null)}
      >
        {STARS.map((star) => {
          const full = star * 2;
          const half = full - 1;
          const isFull = shown >= full;
          const isHalf = shown === half;

          return (
            <span key={star} className={`relative inline-block ${starSize}`}>
              <FiStar
                aria-hidden="true"
                className={`absolute inset-0 ${starSize} transition-colors duration-150 ${isFull ? 'fill-current text-yellow-400' : 'text-white/55'}`}
              />
              {isHalf && (
                <FiStar
                  aria-hidden="true"
                  className={`absolute inset-0 ${starSize} fill-current text-yellow-400`}
                  style={{ clipPath: 'inset(0 50% 0 0)' }}
                />
              )}
              {[half, full].map((optionValue) => (
                <button
                  key={optionValue}
                  ref={(el) => {
                    optionRefs.current[optionValue - 1] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={value === optionValue}
                  aria-label={formatStars(optionValue)}
                  tabIndex={optionValue === tabbable ? 0 : -1}
                  disabled={disabled}
                  onClick={() => select(optionValue)}
                  onKeyDown={(e) => handleKeyDown(e, optionValue)}
                  onMouseEnter={() => !disabled && setHovered(optionValue)}
                  onFocus={() => setHovered(null)}
                  className={`absolute top-0 z-10 h-full w-1/2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pixela-accent ${optionValue === half ? 'left-0' : 'right-0'} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                />
              ))}
            </span>
          );
        })}
      </div>
      <span className="min-w-[3ch] text-sm tabular-nums text-white/70" aria-hidden="true">
        {value === null ? '–/5' : `${(value / 2).toLocaleString('es-ES', { maximumFractionDigits: 1 })}/5`}
      </span>
    </div>
  );
};
