import { useState } from 'react';
import clsx from 'clsx';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { InputFieldProps } from '@/features/profile/types/form';

/**
 * Estilos constantes para el componente InputField
 */
const STYLES = {
  container: 'relative w-full mb-1.5',
  label: 'block mb-1.5 text-sm font-medium text-white/70',
  iconContainer: 'absolute left-4 top-1/2 -translate-y-1/2 text-pixela-accent text-base pointer-events-none',
  // Mismo patrón que el input de login (DESIGN.md › Inputs): `surface`, borde
  // `white/10`, foco con borde de acento más anillo `focus-visible`.
  input: (hasError: boolean, hasToggle: boolean) => clsx(
    'w-full h-12 rounded-full border bg-pixela-surface pl-12 text-base text-white',
    hasToggle ? 'pr-12' : 'pr-6',
    'placeholder:text-white/40',
    'transition-[border-color,box-shadow] duration-200 ease-out-expo',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-pixela-accent/30',
    hasError
      ? 'border-red-500/60 hover:border-red-500/80 focus:border-red-500'
      : 'border-white/10 hover:border-white/20 focus:border-pixela-accent/60'
  ),
  errorMessage: 'mt-1.5 text-sm text-red-400',
  helperText: 'mt-1.5 text-xs text-white/55 leading-relaxed',
  passwordContainer: 'relative',
  eyeButton: clsx(
    'absolute right-3 top-1/2 -translate-y-1/2',
    'rounded-full p-2 text-white/55 transition-colors duration-200 hover:text-pixela-accent',
    'cursor-pointer z-10'
  ),
  eyeIcon: 'w-4 h-4'
} as const;


/**
 * Componente de campo de entrada con integración de react-hook-form
 * @param {InputFieldProps} props - Props del componente
 * @returns {JSX.Element} Componente InputField
 */
export const InputField = ({
  type,
  name,
  placeholder,
  register,
  icon,
  error,
  helperText,
  labelText = placeholder,
}: InputFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';
  const inputType = isPasswordField && showPassword ? 'text' : type;

  const errorId = `${name}-error`;
  const helperId = `${name}-helper`;
  const describedBy = error ? errorId : helperText ? helperId : undefined;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={STYLES.container}>
      <label htmlFor={name} className={STYLES.label}>
        {labelText}
      </label>
      <div className={isPasswordField ? STYLES.passwordContainer : 'relative'}>
        <div className={STYLES.iconContainer} aria-hidden="true">
          {icon}
        </div>
        <input
          id={name}
          type={inputType}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={STYLES.input(!!error, isPasswordField)}
          {...register}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className={STYLES.eyeButton}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? (
              <FiEyeOff className={STYLES.eyeIcon} aria-hidden="true" />
            ) : (
              <FiEye className={STYLES.eyeIcon} aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} role="alert" className={STYLES.errorMessage}>
          {error.message || "Este campo es requerido"}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className={STYLES.helperText}>
          {helperText}
        </p>
      )}
    </div>
  );
}; 