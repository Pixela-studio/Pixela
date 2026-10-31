'use client';

import { useId } from 'react';
import { useLiteMode } from '@/hooks/useLiteMode';

/**
 * Interruptor del modo ligero, en el pie: está en todas las páginas y no
 * compite con nada. Se activa solo con «Ahorro de datos» o conexiones lentas;
 * desde aquí se fuerza en un sentido u otro.
 */
export const LiteModeToggle = () => {
  const { lite, setLite } = useLiteMode();
  const hintId = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        role="switch"
        aria-checked={lite}
        aria-describedby={hintId}
        onClick={() => setLite(!lite)}
        className="inline-flex w-fit items-center gap-3 text-sm font-medium text-white/80 hover:text-white"
      >
        <span
          aria-hidden="true"
          className={`relative h-6 w-11 rounded-full border transition-colors duration-200 ${
            lite ? 'border-white bg-white' : 'border-white/30 bg-transparent'
          }`}
        >
          <span
            className={`absolute top-0.5 rounded-full transition-transform duration-200 ${
              lite ? 'translate-x-[22px] bg-pixela-dark' : 'translate-x-0.5 bg-white/70'
            }`}
            style={{ width: 18, height: 18 }}
          />
        </span>
        Modo ligero
      </button>
      <p id={hintId} className="max-w-[28ch] text-xs text-gray-400">
        Menos imágenes y sin animaciones, para conexiones lentas o con datos contados.
      </p>
    </div>
  );
};
