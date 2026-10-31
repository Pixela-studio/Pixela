"use client";

import { FiShare2 } from "react-icons/fi";
import { toast } from "@/lib/toast";

interface ShareButtonProps {
  title: string;
  /** Texto que acompaña al enlace en WhatsApp, Telegram… */
  text?: string;
  /** Ruta a compartir; por defecto, la actual. */
  path?: string;
  className?: string;
  label?: string;
}

/**
 * Compartir con el menú del sistema (Web Share API) y, si no lo hay, copiar
 * el enlace. Nuria quería mandar fichas a su cineclub y no había ninguna forma
 * de hacerlo más allá de copiar la URL a mano.
 */
export function ShareButton({ title, text, path, className = "btn btn-ghost", label = "Compartir" }: ShareButtonProps) {
  const share = async () => {
    const url = new URL(path ?? window.location.pathname, window.location.origin).toString();

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        // Cerrar el menú sin elegir nada no es un error que haya que contar.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Enlace copiado. Ya puedes pegarlo donde quieras.");
    } catch {
      toast.error("No se pudo copiar el enlace. Cópialo de la barra de direcciones.");
    }
  };

  return (
    <button type="button" onClick={() => void share()} className={className} aria-label={`${label} «${title}»`}>
      <FiShare2 aria-hidden="true" className="h-5 w-5 shrink-0" />
      <span aria-hidden="true">{label}</span>
    </button>
  );
}
