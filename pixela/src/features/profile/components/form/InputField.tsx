import { useState } from 'react';
import clsx from 'clsx';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { InputFieldProps } from '@/features/profile/types/form';

/**
 * Estilos constantes para el componente InputField
 */
const STYLES = {
  container: 'relative w-full mb-1.5',
  label: 'block text-sm text-gray-400 mb-0.5 font-outfit font-medium',
  iconContainer: 'absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-base pointer-events-none',
  input: (hasError: boolean) => clsx(
    'w-full py-4 px-4 pl-12',
    'bg-black/30 border rounded-xl',
    'text-white text-base',
    'placeholder:text-white/30',
    'transition-all duration-200',
    'focus:outline-none focus:shadow-none',
    hasError 
      ? 'border-pixela-accent/50 focus:border-pixela-accent/50'
      : 'border-white/10 focus:border-pixela-accent/50'
  ),
  errorMessage: 'text-pixela-accent text-xs mt-0.5',
  helperText: 'mt-1.5 mb-1 text-[0.75rem] italic font-light text-gray-400/70 pl-0.5 leading-relaxed',
  passwordContainer: 'relative',
  eyeButton: clsx(
    'absolute right-3 top-1/2 -translate-y-1/2',
    'text-gray-400 hover:text-pixela-accent transition-colors',
    'cursor-pointer z-10 p-1 rounded',
    'hover:bg-white/5'
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={STYLES.container}>
      <label htmlFor={name} className={STYLES.label}>
        {labelText}
      </label>
      <div className={isPasswordField ? STYLES.passwordContainer : 'relative'}>
        <div className={STYLES.iconContainer}>
          {icon}
        </div>
        <input
          id={name}
          type={inputType}
          placeholder={placeholder}
          className={STYLES.input(!!error)}
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
              <FiEyeOff className={STYLES.eyeIcon} />
            ) : (
              <FiEye className={STYLES.eyeIcon} />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className={STYLES.errorMessage}>
          {error.message || "Este campo es requerido"}
        </p>
      )}
      {helperText && !error && (
        <p className={STYLES.helperText}>
          {helperText}
        </p>
      )}
    </div>
  );
}; 