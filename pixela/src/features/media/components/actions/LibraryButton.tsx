"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiPlus,
  FiCheck,
  FiChevronDown,
  FiTrash2,
  FiClock,
  FiPlay,
  FiStopCircle,
} from "react-icons/fi";
import { WatchStatus } from "@/api/library/types";
import { useLibraryStatus } from "../../hooks/useLibraryStatus";
import { toast } from "@/lib/toast";
import clsx from "clsx";

interface LibraryButtonProps {
  tmdbId: number;
  itemType: "movie" | "series";
  title: string;
  className?: string;
}

const STATUS_CONFIG = {
  [WatchStatus.PLAN_TO_WATCH]: {
    label: "Planeado",
    icon: FiClock,
    color: "text-blue-400",
  },
  [WatchStatus.WATCHING]: {
    label: "Viendo",
    icon: FiPlay,
    color: "text-green-400",
  },
  [WatchStatus.COMPLETED]: {
    label: "Completado",
    icon: FiCheck,
    color: "text-yellow-400",
  },
  [WatchStatus.DROPPED]: {
    label: "Abandonado",
    icon: FiStopCircle,
    color: "text-red-400",
  },
};

export const LibraryButton = ({
  tmdbId,
  itemType,
  title,
  className,
}: LibraryButtonProps) => {
  const { status, loading, isAuthenticated, updateStatus, removeFromLibrary } =
    useLibraryStatus({
      tmdbId,
      itemType,
    });

  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    // Escape para cerrar: el desplegable solo se podía cerrar con el ratón,
    // así que con teclado quedabas atrapado dentro del menú.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleUpdateStatus = (newStatus: WatchStatus) => {
    setIsOpen(false);
    updateStatus(newStatus);
  };

  const handleRemove = () => {
    setIsOpen(false);
    removeFromLibrary();
  };

  const CurrentIcon = status ? STATUS_CONFIG[status].icon : FiPlus;
  const currentLabel = status ? STATUS_CONFIG[status].label : "Añadir a mi lista";

  // Antes el botón se ocultaba por completo sin sesión (`return null`), así que
  // un visitante nunca descubría que Pixela tiene biblioteca. Los catálogos de
  // referencia muestran siempre "+ Mi lista" y piden identificarse al pulsar.
  const handleTriggerClick = () => {
    if (!isAuthenticated) {
      toast.info("Inicia sesión para guardar títulos en tu biblioteca", {
        title: "Autenticación requerida",
        duration: 3000,
      });
      router.push("/login");
      return;
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleTriggerClick}
        disabled={loading}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={
          status
            ? `«${title}» está marcado como ${STATUS_CONFIG[status].label.toLowerCase()}. Cambiar estado`
            : `Añadir «${title}» a mi biblioteca`
        }
        className={clsx(
          "flex items-center gap-2 whitespace-nowrap rounded-lg px-6 py-3 font-medium transition-all duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F0F0F]",
          "disabled:cursor-not-allowed disabled:opacity-60",
          // Acción principal de la ficha: relleno sólido para que domine la fila.
          status
            ? "bg-white/10 text-white ring-1 ring-inset ring-white/20 hover:bg-white/15"
            : "bg-pixela-accent text-white hover:bg-pixela-accent/90",
          className,
        )}
      >
        <CurrentIcon className="h-5 w-5" aria-hidden="true" />
        <span>{currentLabel}</span>
        <FiChevronDown
          aria-hidden="true"
          className={clsx(
            "h-4 w-4 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          role="menu"
          aria-label="Estado en la biblioteca"
          className="absolute top-full left-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#1A1A1A] p-1 shadow-2xl animate-fade-in"
        >
          <div className="flex flex-col gap-1">
            {Object.entries(STATUS_CONFIG).map(([key, config]) => {
              const statusKey = key as WatchStatus;
              const StatusIcon = config.icon;
              const isActive = status === statusKey;

              return (
                <button
                  key={key}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isActive}
                  onClick={() => handleUpdateStatus(statusKey)}
                  className={clsx(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    "focus-visible:outline-none focus-visible:bg-white/10 focus-visible:text-white",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <StatusIcon className={clsx("w-4 h-4", config.color)} />
                  <span className="flex-1 text-left">{config.label}</span>
                  {isActive && (
                    <FiCheck className="w-4 h-4 text-pixela-accent" />
                  )}
                </button>
              );
            })}

            {status && (
              <>
                <div className="h-px bg-white/10 my-1" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleRemove}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300 focus-visible:outline-none focus-visible:bg-red-500/10"
                >
                  <FiTrash2 className="w-4 h-4" />
                  <span className="flex-1 text-left">Eliminar de lista</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
