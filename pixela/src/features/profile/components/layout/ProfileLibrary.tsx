import { useMemo, useState } from "react";
import { WatchStatus, type LibraryItemWithDetails } from "@/api/library/types";
import { libraryAPI } from "@/api/library/library";
import { toast } from "@/lib/toast";
import { useLibraryItems } from "../../hooks/useLibraryItems";
import {
  FiLoader,
  FiAlertCircle,
  FiCheck,
  FiClock,
  FiPlay,
  FiStopCircle,
  FiGrid,
  FiTrash2,
} from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { EmptyState } from "@/shared/components/EmptyState";
import { formatYear } from "@/lib/date";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const STATUS_FILTERS = [
  { id: "ALL", label: "Todo", icon: FiGrid },
  { id: WatchStatus.PLAN_TO_WATCH, label: "Planeado", icon: FiClock },
  { id: WatchStatus.WATCHING, label: "Viendo", icon: FiPlay },
  { id: WatchStatus.COMPLETED, label: "Completado", icon: FiCheck },
  { id: WatchStatus.DROPPED, label: "Abandonado", icon: FiStopCircle },
];

const STATUS_COLORS = {
  [WatchStatus.PLAN_TO_WATCH]:
    "bg-white/10 text-white/85 border-white/20",
  [WatchStatus.WATCHING]: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  [WatchStatus.COMPLETED]:
    "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  [WatchStatus.DROPPED]: "bg-red-500/20 text-red-400 border-red-500/50",
};

/** Los mismos nombres que los filtros de arriba y que la ficha. */
const STATUS_LABEL = Object.fromEntries(
  STATUS_FILTERS.filter((filter) => filter.id !== "ALL").map((filter) => [filter.id, filter.label]),
) as Record<WatchStatus, string>;

const SHORT_DATE = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" });

/** «Completado el 3 oct 2026» / «Desde el 1 sept 2026»: la base de datos ya lo sabía. */
const statusDate = (item: LibraryItemWithDetails) => {
  const date = SHORT_DATE.format(new Date(item.updated_at));
  return item.status === WatchStatus.COMPLETED ? `Completado el ${date}` : `Desde el ${date}`;
};

export const ProfileLibrary = () => {
    const { items: loadedItems, loading, error } = useLibraryItems();
    const [activeFilter, setActiveFilter] = useState<string>("ALL");
    /*
     * Cambios hechos aquí encima de lo cargado: estado nuevo o quitado (con
     * margen para deshacer). Antes la biblioteca del perfil solo se podía
     * mirar: para cambiar un estado o quitar algo había que ir a cada ficha.
     */
    const [statusEdits, setStatusEdits] = useState<Record<number, WatchStatus>>({});
    const [hidden, setHidden] = useState<ReadonlySet<number>>(new Set());

    const items = useMemo(
      () =>
        loadedItems
          .filter((item) => !hidden.has(item.id))
          .map((item) => (statusEdits[item.id] ? { ...item, status: statusEdits[item.id] } : item))
          // Lo último que se tocó, primero.
          .sort((a, b) => b.updated_at.localeCompare(a.updated_at)),
      [loadedItems, hidden, statusEdits],
    );

    const setItemHidden = (id: number, value: boolean) =>
      setHidden((prev) => {
        const next = new Set(prev);
        if (value) next.add(id);
        else next.delete(id);
        return next;
      });

    const changeStatus = async (item: LibraryItemWithDetails, status: WatchStatus) => {
      const previous = item.status;
      setStatusEdits((prev) => ({ ...prev, [item.id]: status }));
      try {
        await libraryAPI.updateStatus(item.id, status);
        toast.success(`«${item.title}»: ${STATUS_LABEL[status].toLowerCase()}.`);
      } catch {
        setStatusEdits((prev) => ({ ...prev, [item.id]: previous }));
        toast.error("No se pudo cambiar el estado. Inténtalo de nuevo.");
      }
    };

    const removeItem = (item: LibraryItemWithDetails) => {
      setItemHidden(item.id, true);
      toast.undoable({
        title: "Quitado de tu biblioteca",
        message: `«${item.title}» ya no está en tu biblioteca.`,
        onUndo: () => setItemHidden(item.id, false),
        onCommit: async () => {
          try {
            await libraryAPI.removeItem(item.id);
          } catch {
            setItemHidden(item.id, false);
            toast.error("No se pudo quitar. Inténtalo de nuevo.");
          }
        },
      });
    };

    const filteredItems =
      activeFilter === "ALL"
        ? items
        : items.filter((item) => item.status === activeFilter);

    // Un recuento por estado en una sola pasada, en vez de recorrer `items`
    // dentro del map de filtros (5 barridos completos en cada render).
    const counts = useMemo(() => {
      const tally: Record<string, number> = { ALL: items.length };
      for (const item of items) {
        tally[item.status] = (tally[item.status] ?? 0) + 1;
      }
      return tally;
    }, [items]);

    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <FiLoader className="w-8 h-8 text-pixela-accent animate-spin" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center p-8 text-red-500">
          <FiAlertCircle className="w-6 h-6 mr-2" />
          <span>{error}</span>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/*
          Los recuentos se muestran en **todos** los filtros, no solo en el
          activo. Antes sólo aparecía el del filtro seleccionado, que es
          justamente el único que ya se puede contar mirando la rejilla: el
          valor de un contador está en decidir a dónde ir antes de pulsar.
        */}
        <div
          role="tablist"
          aria-label="Filtrar biblioteca por estado"
          className="flex flex-wrap gap-2 pb-4"
        >
          {STATUS_FILTERS.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            const count = counts[filter.id] ?? 0;

            return (
              <button
                key={filter.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveFilter(filter.id)}
                className={clsx(
                  "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition duration-300",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pixela-accent focus-visible:ring-offset-2 focus-visible:ring-offset-pixela-ink",
                  isActive
                    ? "border-white bg-white text-pixela-dark"
                    : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white",
                  count === 0 && !isActive && "opacity-50",
                )}
              >
                <Icon className="h-3 w-3" aria-hidden="true" />
                {filter.label}
                <span
                  className={clsx(
                    "ml-0.5 rounded-full px-1.5 text-[10px] tabular-nums",
                    isActive ? "bg-white/20" : "bg-white/10",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {filteredItems.length === 0 ? (
          items.length === 0 ? (
            <EmptyState
              icon={<FiGrid />}
              title="Tu biblioteca está vacía"
              description="Guarda películas y series para llevar la cuenta de lo que quieres ver, lo que estás viendo y lo que ya terminaste."
              action={{ label: "Explorar catálogo", href: "/categories" }}
            />
          ) : (
            <EmptyState
              icon={<FiGrid />}
              title={`Nada marcado como «${STATUS_FILTERS.find((f) => f.id === activeFilter)?.label}»`}
              description="Cambia el estado de cualquier título desde aquí mismo o desde su ficha."
            />
          )
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-fade-in">
            {filteredItems.map((item) => (
              <div key={item.id} className="flex flex-col gap-2">
              <div
                className="relative group aspect-[2/3] rounded-xl overflow-hidden bg-pixela-surface border border-white/5 transition-[transform,border-color,box-shadow] duration-300 ease-out-expo hover:scale-105 hover:border-white/20 hover:shadow-xl hover:shadow-black/50"
              >
                <Link
                  href={`/${item.item_type === "movie" ? "movies" : "series"}/${item.tmdb_id}`}
                  aria-label={`${item.title} (${STATUS_FILTERS.find((f) => f.id === item.status)?.label ?? item.status})`}
                  // El contenedor recorta (overflow-hidden), así que el anillo
                  // de foco se pinta por dentro en un ::after.
                  className="relative block w-full h-full rounded-[inherit] after:pointer-events-none after:absolute after:inset-0 after:z-30 after:rounded-[inherit] after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-pixela-accent"
                  prefetch={false}
                >
                  {item.poster_path ? (
                    <Image
                      src={`${TMDB_IMAGE_BASE_URL}${item.poster_path}`}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-pixela-raised text-gray-400 text-xs text-center p-2">
                      Sin imagen
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2 z-10">
                    <span
                      className={clsx(
                        "px-2 py-0.5 rounded-md text-[10px] font-bold border shadow-sm",
                        STATUS_COLORS[item.status],
                      )}
                    >
                      {STATUS_FILTERS.find((f) => f.id === item.status)?.label}
                    </span>
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity duration-300 ease-out-expo flex flex-col justify-end p-3">
                    <h3 className="text-white text-sm font-bold line-clamp-2 leading-tight mb-1">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{item.vote_average.toFixed(1)} ★</span>
                      <span>{formatYear(item.release_date)}</span>
                    </div>
                  </div>
                </Link>
              </div>
              {/* Controles fuera del enlace: un control dentro de otro no se
                  puede alcanzar bien con el teclado ni con un lector. */}
              <p className="text-xs text-gray-400">{statusDate(item)}</p>
              <div className="flex items-center gap-2">
                <label className="sr-only" htmlFor={`library-status-${item.id}`}>
                  Estado de «{item.title}»
                </label>
                <select
                  id={`library-status-${item.id}`}
                  value={item.status}
                  onChange={(e) => void changeStatus(item, e.target.value as WatchStatus)}
                  className="h-9 min-w-0 flex-1 rounded-full border border-white/10 bg-pixela-surface px-3 text-sm text-white focus:border-pixela-accent/60 focus:outline-none"
                >
                  {Object.values(WatchStatus).map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABEL[status]}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeItem(item)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/70 hover:border-red-500/50 hover:text-red-400"
                  aria-label={`Quitar «${item.title}» de la biblioteca`}
                >
                  <FiTrash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
