'use client';

import { InputHTMLAttributes, useId, useState } from 'react';
import { VscEye, VscEyeClosed } from 'react-icons/vsc';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Nombre visible del campo. El placeholder no sustituye a un `<label>`. */
  label: string;
  /** Oculta la etiqueta visualmente pero la deja para lectores de pantalla. */
  hideLabel?: boolean;
  icon?: React.ReactNode;
  /** Mensaje de error del campo; marca el input como inválido y lo anuncia. */
  error?: string | null;
  /** Ayuda permanente bajo el campo (formato esperado, requisitos). */
  hint?: string;
}

export const TextInput = ({
  label,
  hideLabel = false,
  icon,
  error,
  hint,
  id,
  className = '',
  type = 'text',
  ...props
}: TextInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  // El error sustituye a la ayuda en pantalla, así que también en la descripción.
  const describedBy = error ? errorId : hint ? hintId : undefined;
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const borderState = error
    ? 'border-red-500/60 hover:border-red-500/80 focus:border-red-500'
    : 'border-white/10 hover:border-white/20 focus:border-pixela-accent/60';

  return (
    <div>
      <label
        htmlFor={inputId}
        className={hideLabel ? 'sr-only' : 'mb-1.5 block pl-4 text-sm font-medium text-white/70'}
      >
        {label}
      </label>

      <div className="relative">
        {icon && (
          <div className="absolute top-0 bottom-0 left-0 pl-4 flex items-center pointer-events-none z-10 text-pixela-accent">
            <span className="h-5 w-5 flex items-center justify-center" aria-hidden="true">{icon}</span>
          </div>
        )}

        {/* `focus:outline-none` va con su sustituto: el borde de acento y el
            anillo `focus-visible`. */}
        <input
          id={inputId}
          type={inputType}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`w-full h-12 rounded-full border bg-pixela-surface px-6 text-base text-white placeholder:text-white/40 transition-[border-color,box-shadow] duration-200 ease-out-expo focus:outline-none focus-visible:ring-2 focus-visible:ring-pixela-accent/30 ${borderState} ${icon ? 'pl-11' : ''} ${isPassword ? 'pr-12' : ''} ${className}`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 rounded-full p-2 text-white/55 transition-colors duration-200 hover:text-pixela-accent"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <VscEyeClosed className="h-4 w-4" aria-hidden="true" /> : <VscEye className="h-4 w-4" aria-hidden="true" />}
          </button>
        )}
      </div>

      {hint && !error && (
        <p id={hintId} className="mt-1.5 pl-4 text-xs text-white/55">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="mt-1.5 pl-4 text-sm text-red-400">
          {error}
        </p>
      )}

      <style jsx>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
            -webkit-text-fill-color: rgba(255, 255, 255, 0.9) !important;
            -webkit-box-shadow: 0 0 0px 1000px #1f1f1f inset !important;
            transition: background-color 5000s ease-in-out 0s;
            caret-color: white;
        }
      `}</style>
    </div>
  );
};
