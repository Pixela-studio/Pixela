import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import clsx from 'clsx';
import { usersAPI } from '@/api/users/users';
import type { User } from '@/api/users/types';
import { CreateUserData, ApiError, UserCreateModalProps, UserForm } from '@/features/profile/types/form';

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Valores iniciales del formulario
 * @type {UserForm} 
 * @property {string} name - Nombre del usuario
 * @property {string} email - Email del usuario
 * @property {string} password - Contraseña del usuario
 * @property {string} password_confirmation - Confirmación de la contraseña
 * @property {string} is_admin - Rol del usuario
 */
const INITIAL_FORM_STATE: UserForm = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  is_admin: 'false',
};

/**
 * Estilos constantes para el componente UserCreateModal
 */
const STYLES = {
  // Layout y contenedor principal
  overlay: 'fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-start justify-center',
  container: 'bg-gradient-to-b from-pixela-dark to-pixela-ink w-full h-30 border border-white/5 shadow-2xl overflow-y-auto',
  
  // Header del modal
  header: 'flex items-center justify-between p-6 border-b border-white/5 sticky top-0 bg-pixela-surface z-10',
  title: 'text-2xl font-bold text-white mb-1',
  subtitle: 'text-sm text-gray-400',
  closeButton: 'text-gray-400 hover:text-white transition-colors',
  closeIcon: 'w-6 h-6 hover:text-pixela-accent',
  
  // Layout del formulario
  form: 'p-8',
  formContainer: 'max-w-4xl mx-auto space-y-6',
  grid: 'grid grid-cols-2 gap-6',
  fieldGroup: 'space-y-2',
  label: 'block text-sm font-medium text-gray-300',
  
  // Inputs y controles
  input: clsx(
    'w-full bg-pixela-raised/50 border border-white/5 rounded-xl p-3',
    'text-white placeholder-gray-500',
    'focus:outline-none focus:border-pixela-accent/50 focus:ring-1 focus:ring-pixela-accent/30',
    'transition-all duration-200'
  ),
  
  select: clsx(
    'w-full bg-pixela-raised/50 border border-white/5 rounded-xl p-3 text-white',
    'focus:outline-none focus:border-pixela-accent/50 focus:ring-1 focus:ring-pixela-accent/30',
    'transition-all duration-200',
    '[&::-ms-expand]:hidden [&::-webkit-inner-spin-button]:hidden [&::-webkit-calendar-picker-indicator]:hidden',
    'appearance-none bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23fff%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E")]',
    'bg-[length:24px_18px] bg-[right_1rem_center] bg-no-repeat pr-12',
    '[&>option]:bg-pixela-surface [&>option]:text-white [&>option]:p-4',
    '[&>option]:hover:bg-pixela-raised [&>option]:focus:bg-pixela-raised [&>option]:active:bg-pixela-raised'
  ),
  
  // Feedback y mensajes
  error: 'p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center',
  
  // Acciones y botones
  actions: 'flex justify-end gap-3 pt-6',
  submitButton: 'btn btn-primary btn-sm',
  cancelButton: 'btn btn-ghost btn-sm',
  
  // Estilos para el botón del ojo en las contraseñas
  passwordContainer: 'relative',
  eyeButton: clsx(
    'absolute right-3 top-1/2 transform -translate-y-1/2',
    'text-gray-400 hover:text-pixela-accent transition-colors',
    'cursor-pointer z-10 p-1 rounded',
    'hover:bg-white/5'
  ),
  eyeIcon: 'w-4 h-4'
} as const;

/**
 * Componente modal para crear un nuevo usuario
 * @param {UserCreateModalProps} props - Props del componente
 * @returns {JSX.Element | null} Componente UserCreateModal
 */
export const UserCreateModal = ({ 
  isOpen, 
  onClose, 
  onUserCreated 
}: UserCreateModalProps) => {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<UserForm>({
    defaultValues: INITIAL_FORM_STATE
  });

  const password = watch('password');

  useEffect(() => {
    if (!isOpen) {
      reset(INITIAL_FORM_STATE);
      setApiError(null);
    }
  }, [isOpen, reset]);

  /**
   * Maneja el envío del formulario
   * @param {UserForm} data - Datos del formulario
   */
  const onSubmit = async (data: UserForm) => {
    setLoading(true);
    setApiError(null);

    try {
      const userData: CreateUserData = {
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
        is_admin: data.is_admin === 'true',
        photo_url: '', // Valor por defecto para nuevo usuario
      };
      
      await usersAPI.create(userData as unknown as User);
      onUserCreated();
      onClose(); // Cierra el modal y dispara el useEffect para resetear
    } catch (err) {
      const error = err as ApiError;
      const emailError = error?.response?.data?.errors?.email?.[0] ||
                        error?.data?.errors?.email?.[0] ||
                        error?.message ||
                        '';
      
      setApiError(emailError.toLowerCase().includes('email') 
        ? 'Ya existe un usuario con ese email.'
        : 'No se pudo crear el usuario.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Alterna la visibilidad de la contraseña
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  /**
   * Alterna la visibilidad de la confirmación de contraseña
   */
  const togglePasswordConfirmationVisibility = () => {
    setShowPasswordConfirmation(!showPasswordConfirmation);
  };

  if (!isOpen) return null;

  return (
    <div className={STYLES.overlay}>
      <div className={STYLES.container}>
        <div className={STYLES.header}>
          <div>
            <h2 className={STYLES.title}>Nuevo Usuario</h2>
            <p className={STYLES.subtitle}>
              Complete los datos para registrar un nuevo usuario
            </p>
          </div>
          <button
            onClick={onClose}
            className={STYLES.closeButton}
            title="Cerrar"
          >
            <FiX className={STYLES.closeIcon} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={STYLES.form}>
          <div className={STYLES.formContainer}>
            <div className={STYLES.grid}>
              <div className={STYLES.fieldGroup}>
                <label className={STYLES.label}>Nombre</label>
                <input
                  {...register('name', { 
                    required: 'El nombre es requerido',
                    minLength: { value: 3, message: 'El nombre debe tener al menos 3 caracteres' },
                    maxLength: { value: 50, message: 'El nombre no puede exceder los 50 caracteres' }
                  })}
                  className={STYLES.input}
                  placeholder="Nombre del usuario"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div className={STYLES.fieldGroup}>
                <label className={STYLES.label}>Email</label>
                <input
                  type="email"
                  {...register('email', {
                    required: 'El email es requerido',
                    pattern: {
                      value: EMAIL_REGEX,
                      message: 'Formato de email inválido'
                    }
                  })}
                  className={STYLES.input}
                  placeholder="correo@ejemplo.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>
            </div>

            <div className={STYLES.grid}>
              <div className={STYLES.fieldGroup}>
                <label className={STYLES.label}>Contraseña</label>
                <div className={STYLES.passwordContainer}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'La contraseña es requerida',
                      minLength: {
                        value: 8,
                        message: 'La contraseña debe tener al menos 8 caracteres'
                      },
                      pattern: {
                        value: STRONG_PASSWORD_REGEX,
                        message: 'Debe incluir mayúscula, minúscula, número y símbolo.'
                      }
                    })}
                    className={STYLES.input}
                    placeholder="••••••••"
                  />
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
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>
              <div className={STYLES.fieldGroup}>
                <label className={STYLES.label}>Confirmar contraseña</label>
                <div className={STYLES.passwordContainer}>
                  <input
                    type={showPasswordConfirmation ? 'text' : 'password'}
                    {...register('password_confirmation', {
                      required: 'Debes confirmar la contraseña',
                      validate: value =>
                        value === password || 'Las contraseñas no coinciden'
                    })}
                    className={STYLES.input}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordConfirmationVisibility}
                    className={STYLES.eyeButton}
                    aria-label={showPasswordConfirmation ? 'Ocultar confirmación de contraseña' : 'Mostrar confirmación de contraseña'}
                  >
                    {showPasswordConfirmation ? (
                      <FiEyeOff className={STYLES.eyeIcon} />
                    ) : (
                      <FiEye className={STYLES.eyeIcon} />
                    )}
                  </button>
                </div>
                {errors.password_confirmation && <p className="mt-1 text-xs text-red-500">{errors.password_confirmation.message}</p>}
              </div>
            </div>

            <div className={STYLES.fieldGroup}>
              <label className={STYLES.label}>Rol del usuario</label>
              <select
                {...register('is_admin')}
                className={STYLES.select}
              >
                <option value="false">Usuario</option>
                <option value="true">Administrador</option>
              </select>
            </div>

            {apiError && (
              <div className={STYLES.error}>
                <span className="flex-1">{apiError}</span>
              </div>
            )}

            <div className={STYLES.actions}>
              <button
                type="button"
                onClick={onClose}
                className={STYLES.cancelButton}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={STYLES.submitButton}
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? 'Creando...' : 'Crear Usuario'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}; 