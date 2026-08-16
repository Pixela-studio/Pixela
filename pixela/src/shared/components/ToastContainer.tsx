'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast as toastManager, Toast, ToastType } from '@/lib/toast';
import { FiX } from 'react-icons/fi';

const TOAST_STYLES = {
  container: 'fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none',
  toast: {
    base: 'pointer-events-auto max-w-md w-full rounded-lg shadow-2xl p-4 backdrop-blur-md border border-white/10 transition-all duration-300 ease-out transform',
    entering: 'animate-slide-in-right',
    exiting: 'animate-slide-out-right opacity-0',
  },
  content: 'flex items-start gap-3',
  icon: 'flex-shrink-0 mt-0.5',
  textContainer: 'flex-1 min-w-0',
  title: 'font-semibold text-sm mb-1',
  message: 'text-sm opacity-90',
  closeButton: 'flex-shrink-0 p-1 rounded-md hover:bg-white/10 transition-colors',
  action: 'mt-3 pt-3 border-t border-current/20',
  actionButton: 'text-sm font-medium underline hover:no-underline transition-all',
} as const;

const TOAST_VARIANTS: Record<ToastType, { bg: string; text: string; border: string }> = {
  success: { 
    bg: 'bg-gradient-to-r from-pixela-dark to-[#1a1a1a]', 
    text: 'text-white', 
    border: 'border-l-4 border-green-500' 
  },
  error: { 
    bg: 'bg-gradient-to-r from-pixela-dark to-[#1a1a1a]', 
    text: 'text-white', 
    border: 'border-l-4 border-pixela-accent' 
  },
  warning: { 
    bg: 'bg-gradient-to-r from-pixela-dark to-[#1a1a1a]', 
    text: 'text-white', 
    border: 'border-l-4 border-yellow-500' 
  },
  info: { 
    bg: 'bg-gradient-to-r from-pixela-dark to-[#1a1a1a]', 
    text: 'text-white', 
    border: 'border-l-4 border-pixela-accent' 
  },
};

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

/** Duración de la animación de salida antes de retirar el aviso del DOM. */
const EXIT_ANIMATION_MS = 300;

const ToastItem = ({ toast: toastData, onDismiss }: ToastItemProps) => {
  const [isExiting, setIsExiting] = useState(false);
  const variant = TOAST_VARIANTS[toastData.type];
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // `handleDismiss` se recreaba en cada render y se usaba dentro del efecto sin
  // declararla como dependencia, de modo que el temporizador de auto-cierre
  // conservaba un `onDismiss` obsoleto.
  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    exitTimer.current = setTimeout(
      () => onDismiss(toastData.id),
      EXIT_ANIMATION_MS,
    );
  }, [onDismiss, toastData.id]);

  // El temporizador de salida no se cancelaba al desmontar.
  useEffect(() => () => {
    if (exitTimer.current) clearTimeout(exitTimer.current);
  }, []);

  useEffect(() => {
    if (toastData.duration > 0 && ['success', 'info'].includes(toastData.type)) {
      const timer = setTimeout(handleDismiss, toastData.duration);
      return () => clearTimeout(timer);
    }
  }, [toastData.duration, toastData.type, handleDismiss]);

  return (
    <div
      className={`
        ${TOAST_STYLES.toast.base}
        ${variant.bg}
        ${variant.text}
        ${variant.border}
        ${isExiting ? TOAST_STYLES.toast.exiting : TOAST_STYLES.toast.entering}
      `}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className={TOAST_STYLES.content}>
        <div className={TOAST_STYLES.textContainer}>
          {toastData.title && (
            <div className={TOAST_STYLES.title}>
              {toastData.title}
            </div>
          )}
          <div className={TOAST_STYLES.message}>
            {toastData.message}
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className={TOAST_STYLES.closeButton}
          aria-label="Cerrar notificación"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {toastData.action && (
        <div className={TOAST_STYLES.action}>
          <button
            onClick={() => {
              toastData.action?.onClick();
              handleDismiss();
            }}
            className={TOAST_STYLES.actionButton}
          >
            {toastData.action.label}
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * ToastContainer - Componente global para mostrar notificaciones toast
 * Debe incluirse una sola vez en el layout raíz
 */
export const ToastContainer = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts);
    return unsubscribe;
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className={TOAST_STYLES.container}>
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={toastManager.dismiss.bind(toastManager)}
        />
      ))}
    </div>
  );
};
