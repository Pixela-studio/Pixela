import { FiAlertTriangle } from 'react-icons/fi';
import { ProfileErrorProps } from "@/features/profile/types/profileTypes";

/**
 * Estilos constantes para el componente ProfileError
 */
const STYLES = {
  container: 'flex flex-col items-center justify-center p-12 bg-pixela-surface border border-white/10 rounded-2xl',
  icon: 'w-16 h-16 text-red-500 mb-4',
  title: 'text-2xl font-bold text-white mb-2',
  message: 'text-gray-400 text-center mb-6 max-w-md',
  button: 'btn btn-primary'
} as const;

/**
 * Mensaje de error por defecto
 */
const DEFAULT_ERROR_MESSAGE = "No se pudo cargar la información del usuario.";

/**
 * Componente que muestra un mensaje de error con opción de reintentar
 * @param {ProfileErrorProps} props - Props del componente
 * @returns {JSX.Element} Componente ProfileError
 */
export const ProfileError = ({ 
  message = DEFAULT_ERROR_MESSAGE 
}: ProfileErrorProps) => {
  const handleRetry = () => window.location.reload();

  return (
    <div className={STYLES.container}>
      <FiAlertTriangle className={STYLES.icon} />
      <h2 className={STYLES.title}>Ha ocurrido un error</h2>
      <p className={STYLES.message}>{message}</p>
      <button 
        className={STYLES.button} 
        onClick={handleRetry}
        type="button"
        aria-label="Intentar de nuevo"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}; 