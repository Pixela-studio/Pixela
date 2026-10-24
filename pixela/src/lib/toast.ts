/**
 * Toast Notification System
 * Sistema de notificaciones tipo toast para feedback visual al usuario
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  id?: string;
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  /**
   * Se llama una sola vez cuando el aviso desaparece, por cualquier vía: tiempo
   * agotado, botón de cerrar o tras pulsar la acción. Sirve para el patrón
   * "borrado · Deshacer": la mutación real se hace aquí, y la acción solo marca
   * que se ha deshecho.
   */
  onDismiss?: () => void;
}

export interface Toast extends Required<Omit<ToastOptions, 'action' | 'onDismiss'>> {
  action?: ToastOptions['action'];
  onDismiss?: ToastOptions['onDismiss'];
}

type ToastListener = (toasts: Toast[]) => void;

class ToastManager {
  private toasts: Toast[] = [];
  private listeners: Set<ToastListener> = new Set();
  private nextId = 0;

  private readonly DEFAULT_DURATION = 5000;
  // AUTO_DISMISS_TYPES se usa solo para referencia
  // El auto-dismiss real es manejado por ToastItem component
  private readonly AUTO_DISMISS_TYPES: ToastType[] = ['success', 'info'];

  /**
   * Subscribe a listener para cambios en toasts
   */
  subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notifica a todos los listeners
   */
  private notify(): void {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  /**
   * Genera ID único para toast
   */
  private generateId(): string {
    return `toast-${Date.now()}-${this.nextId++}`;
  }

  /**
   * Muestra un toast
   */
  show(options: ToastOptions): string {
    const id = options.id || this.generateId();
    const type = options.type || 'info';
    
    const toast: Toast = {
      id,
      type,
      title: options.title || this.getDefaultTitle(type),
      message: options.message,
      duration: options.duration ?? this.DEFAULT_DURATION,
      action: options.action,
      onDismiss: options.onDismiss,
    };

    // Evitar duplicados con mismo ID. El aviso sustituido cuenta como cerrado.
    this.toasts.find((t) => t.id === id)?.onDismiss?.();
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.toasts.push(toast);
    this.notify();

    // NOTA: Auto-dismiss es manejado por ToastItem para control de animación
    // No se usa setTimeout aquí para evitar conflicto de timers

    return id;
  }

  /**
   * Cierra un toast específico
   */
  dismiss(id: string): void {
    const dismissed = this.toasts.find((t) => t.id === id);
    if (!dismissed) return;
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
    dismissed.onDismiss?.();
  }

  /**
   * Cierra todos los toasts
   */
  dismissAll(): void {
    const dismissed = this.toasts;
    this.toasts = [];
    this.notify();
    dismissed.forEach((t) => t.onDismiss?.());
  }

  /**
   * Obtiene título por defecto según tipo
   */
  private getDefaultTitle(type: ToastType): string {
    const titles: Record<ToastType, string> = {
      success: '✓ Éxito',
      error: '✕ Error',
      warning: '⚠ Advertencia',
      info: 'ℹ Información',
    };
    
    return titles[type];
  }

  /**
   * Helpers de acceso rápido
   */
  success(message: string, options?: Omit<ToastOptions, 'message' | 'type'>): string {
    return this.show({ ...options, message, type: 'success' });
  }

  error(message: string, options?: Omit<ToastOptions, 'message' | 'type'>): string {
    return this.show({ ...options, message, type: 'error' });
  }

  warning(message: string, options?: Omit<ToastOptions, 'message' | 'type'>): string {
    return this.show({ ...options, message, type: 'warning' });
  }

  info(message: string, options?: Omit<ToastOptions, 'message' | 'type'>): string {
    return this.show({ ...options, message, type: 'info' });
  }

  /**
   * Acción destructiva con margen para deshacer: el llamador oculta el
   * elemento al instante y `onCommit` hace la mutación real cuando el aviso se
   * cierra (por tiempo o con la X). Si se pulsa "Deshacer", solo se llama a
   * `onUndo` y nada llega al servidor.
   *
   * Si se cierra la pestaña antes de que expire, la mutación no se hace: el
   * fallo es por el lado seguro (el elemento sigue ahí).
   */
  undoable({
    title,
    message,
    onCommit,
    onUndo,
    actionLabel = 'Deshacer',
    duration = this.DEFAULT_DURATION,
  }: {
    title: string;
    message: string;
    onCommit: () => void;
    onUndo: () => void;
    actionLabel?: string;
    duration?: number;
  }): string {
    let undone = false;
    return this.show({
      type: 'info',
      title,
      message,
      duration,
      action: {
        label: actionLabel,
        onClick: () => {
          undone = true;
          onUndo();
        },
      },
      onDismiss: () => {
        if (!undone) onCommit();
      },
    });
  }
}

// Singleton instance
export const toast = new ToastManager();
