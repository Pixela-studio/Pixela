import { useMemo, useState } from "react";
import { WatchStatus } from "@/api/library/types";
import { useLibraryItems } from "../../hooks/useLibraryItems";
import {
  FiLoader,
  FiAlertCircle,
  FiCheck,
  FiClock,
  FiPlay,
  FiStopCircle,
  FiGrid,
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
    "bg-blue-500/20 text-blue-400 border-blue-500/50",
  [WatchStatus.WATCHING]: "bg-green-500/20 text-green-400 border-green-500/50",
  [WatchStatus.COMPLETED]:
    "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  [WatchStatus.DROPPED]: "bg-red-500/20 text-red-400 border-red-500/50",
};

export const ProfileLibrary = () => {
    const { items, loading, error } = useLibraryItems();
    const [activeFilter, setActiveFilter] = useState<string>("ALL");

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
                  "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-300",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pixela-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F0F0F]",
                  isActive
                    ? "border-pixela-accent bg-pixela-accent text-white"
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
              description="Cambia el estado de un título desde su ficha para verlo aquí."
            />
          )
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-fade-in">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="relative group aspect-[2/3] rounded-xl overflow-hidden bg-[#1A1A1A] border border-white/5 transition-all hover:scale-105 hover:border-white/20 hover:shadow-xl hover:shadow-black/50"
              >
                <Link
                  href={`/${item.item_type === "movie" ? "movies" : "series"}/${item.tmdb_id}`}
                  className="block w-full h-full relative"
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
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500 text-xs text-center p-2">
                      Sin imagen
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2 z-10">
                    <span
                      className={clsx(
                        "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase backdrop-blur-md border shadow-sm",
                        STATUS_COLORS[item.status],
                      )}
                    >
                      {STATUS_FILTERS.find((f) => f.id === item.status)?.label}
                    </span>
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
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
            ))}
          </div>
        )}
      </div>
    );
  };
