"use client";

import { ReactNode, useEffect, useId, useRef } from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  /** Mientras la acción está en curso: desactiva los botones e impide cerrar. */
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Diálogo de confirmación para acciones destructivas.
 *
 * `role="alertdialog"`, foco atrapado y puesto en "Cancelar" al abrir (la
 * opción segura: un Intro accidental no borra nada), Escape y clic en el fondo
 * cancelan, y el foco vuelve al botón que lo abrió.
 */
export const ConfirmDialog = ({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancelar',
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useFocusTrap(dialogRef, isOpen, {
    initialFocusRef: cancelRef,
    onEscape: busy ? undefined : onCancel,
  });

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-pixela-surface p-6 shadow-2xl shadow-black/60"
      >
        <h2 id={titleId} className="text-xl font-bold text-white">
          {title}
        </h2>
        {description && (
          <div id={descriptionId} className="mt-2 text-sm leading-relaxed text-white/70">
            {description}
          </div>
        )}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="btn btn-ghost btn-sm"
          >
            {cancelLabel}
          </button>
          {/* Rojo y no el primario rosa: es la acción que destruye, no la que se
              recomienda. `red-600` y no `red-500`: el blanco sobre `red-500`
              se queda en 3.8:1 y no pasa AA a 14 px. */}
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="btn btn-sm bg-red-600 text-white hover:bg-red-600/90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
