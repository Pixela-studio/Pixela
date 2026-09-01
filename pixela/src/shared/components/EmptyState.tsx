import Link from "next/link";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  /** Qué ha pasado, en una frase corta. */
  title: string;
  /** Por qué está vacío y qué gana el usuario al llenarlo. */
  description?: string;
  action?: {
    label: string;
    href: string;
  };
}

const STYLES = {
  container:
    "flex flex-col items-center justify-center gap-3 px-6 py-16 text-center",
  icon: "text-white/25 [&>svg]:h-10 [&>svg]:w-10",
  title: "font-outfit text-lg font-semibold text-white",
  description: "max-w-sm text-sm leading-relaxed text-gray-400",
  action:
    "mt-3 inline-flex items-center gap-2 rounded-full bg-pixela-accent px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-pixela-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pixela-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F0F0F]",
} as const;

/**
 * Estado vacío consistente para listas de perfil (biblioteca, favoritos, reseñas).
 *
 * Antes cada pestaña resolvía su vacío a su manera: un icono y una frase suelta
 * como "No hay elementos en tus favoritos", sin explicar qué hacer a
 * continuación. Los catálogos de referencia (la watchlist de Disney+, por
 * ejemplo) siempre acompañan el titular con una línea de contexto y una salida.
 */
export const EmptyState = ({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) => (
  <div className={STYLES.container}>
    <div className={STYLES.icon} aria-hidden="true">
      {icon}
    </div>
    <p className={STYLES.title}>{title}</p>
    {description && <p className={STYLES.description}>{description}</p>}
    {action && (
      <Link href={action.href} className={STYLES.action}>
        {action.label}
      </Link>
    )}
  </div>
);
