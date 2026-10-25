"use client";

import { RefObject, useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** Elementos tabulables dentro de `container`, en orden de documento y visibles. */
const getFocusable = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    // `tabindex="-1"` fuera: las opciones no activas de un grupo con tabulación
    // itinerante (radios, menús) no cuentan como extremos del ciclo.
    (el) =>
      el.getAttribute('tabindex') !== '-1' &&
      !el.closest('[inert]') &&
      el.getClientRects().length > 0,
  );

interface FocusTrapOptions {
  /** Elemento que recibe el foco al abrir. Por defecto, el primero tabulable. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Se llama al pulsar Escape dentro de la trampa. */
  onEscape?: () => void;
}

/**
 * Atrapa el foco del teclado dentro de `containerRef` mientras `active` sea
 * verdadero: Tab y Shift+Tab ciclan entre sus controles, el foco entra al abrir
 * y vuelve al elemento que lo tenía al cerrar.
 *
 * No marca el resto de la página como `inert`: el overlay del diálogo ya tapa
 * el puntero, y con `aria-modal="true"` los lectores de pantalla limitan la
 * navegación al diálogo.
 */
export const useFocusTrap = (
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
  { initialFocusRef, onEscape }: FocusTrapOptions = {},
) => {
  // En una ref para no reinstalar los listeners cada vez que el padre cree un
  // `onEscape` nuevo en su render.
  const onEscapeRef = useRef(onEscape);
  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusInitial = () => {
      const target = initialFocusRef?.current ?? getFocusable(container)[0] ?? container;
      target.focus({ preventScroll: true });
    };
    // Un frame de margen: el contenido del diálogo puede montarse justo después.
    const frame = requestAnimationFrame(focusInitial);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscapeRef.current) {
        event.stopPropagation();
        onEscapeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = getFocusable(container);
      if (focusable.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;

      if (event.shiftKey && (current === first || !container.contains(current))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (current === last || !container.contains(current))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown);
      // Devolver el foco a quien abrió el diálogo, si sigue en la página.
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [active, containerRef, initialFocusRef]);
};
