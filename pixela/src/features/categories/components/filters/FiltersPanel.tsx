"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { FiCheck, FiSliders, FiX } from "react-icons/fi";
import { API_ENDPOINTS } from "@/api/shared/apiEndpoints";
import { fetchFromAPI } from "@/api/shared/apiHelpers";
import { useMyPlatforms } from "@/hooks/useMyPlatforms";
import { tmdbImageHelpers } from "@/lib/constants/tmdb";
import {
  AGE_OPTIONS,
  DECADE_OPTIONS,
  DURATION_OPTIONS,
  EMPTY_FILTERS,
  LANGUAGE_OPTIONS,
  VOTES_OPTIONS,
  countActiveFilters,
  type CatalogFilters,
} from "@/features/categories/filters";

interface Provider {
  id: number;
  name: string;
  logo_path: string | null;
}

interface FiltersPanelProps {
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
  mediaType: "all" | "movies" | "series" | "random";
  /** Con búsqueda activa los filtros no aplican: TMDB no los admite al buscar. */
  searching: boolean;
}

const STYLES = {
  toggle: "btn btn-ghost btn-sm",
  panel: "mt-4 rounded-2xl border border-white/10 bg-pixela-surface p-5 md:p-6",
  grid: "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4",
  label: "mb-1.5 block text-sm font-medium text-white/70",
  select:
    "h-11 w-full rounded-full border border-white/10 bg-pixela-dark px-4 text-white focus:border-pixela-accent/60 focus:outline-none",
  switchRow: "flex flex-wrap gap-3",
  chip: (on: boolean) =>
    clsx(
      "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors duration-200",
      on ? "border-white bg-white text-pixela-dark" : "border-white/20 text-white hover:border-white/45",
    ),
  hint: "mt-1.5 text-xs text-white/55",
  providers: "mt-3 flex flex-wrap gap-2",
  provider: (on: boolean) =>
    clsx(
      "inline-flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm transition-colors duration-200",
      on ? "border-white bg-white/10 text-white" : "border-white/15 text-white/75 hover:border-white/40",
    ),
} as const;

let providersCache: Provider[] | null = null;

/**
 * Filtros de Categorías: «Para ver en familia», «Mis plataformas», edad,
 * duración, idioma original, década y votos mínimos.
 *
 * Andrea quería decidir en cinco minutos qué ver con los niños; Javi, filtrar
 * cine coreano de los noventa con suficientes votos; Tomás, ver solo lo que
 * tiene contratado. Todo eso lo admitía ya TMDB en `/discover`.
 */
export function FiltersPanel({ filters, onChange, mediaType, searching }: FiltersPanelProps) {
  const [open, setOpen] = useState(() => countActiveFilters(filters) > 0);
  const [providers, setProviders] = useState<Provider[] | null>(providersCache);
  const { ids: myPlatforms, toggle: togglePlatform } = useMyPlatforms();
  const panelId = useId();
  const active = countActiveFilters(filters);
  const moviesOnlyAge = mediaType === "series";

  // La lista de plataformas se pide al abrir el panel, una vez por sesión.
  useEffect(() => {
    if (!open || providersCache) return;
    let alive = true;
    fetchFromAPI<{ success: boolean; data: Provider[] }>(API_ENDPOINTS.PROVIDERS)
      .then((response) => {
        providersCache = response.data;
        if (alive) setProviders(response.data);
      })
      .catch(() => {
        if (alive) setProviders([]);
      });
    return () => {
      alive = false;
    };
  }, [open]);

  const set = <K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={STYLES.toggle}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(!open)}
        >
          <FiSliders aria-hidden="true" />
          Filtros{active > 0 ? ` (${active})` : ""}
        </button>
        <button
          type="button"
          className={STYLES.chip(filters.familia)}
          aria-pressed={filters.familia}
          onClick={() => set("familia", !filters.familia)}
        >
          {filters.familia && <FiCheck aria-hidden="true" />}
          Para ver en familia
        </button>
        <button
          type="button"
          className={STYLES.chip(filters.misPlataformas)}
          aria-pressed={filters.misPlataformas}
          onClick={() => {
            set("misPlataformas", !filters.misPlataformas);
            if (!filters.misPlataformas && myPlatforms.length === 0) setOpen(true);
          }}
        >
          {filters.misPlataformas && <FiCheck aria-hidden="true" />}
          Solo en mis plataformas
        </button>
        {active > 0 && (
          <button type="button" className="text-sm text-white/70 underline underline-offset-4" onClick={() => onChange(EMPTY_FILTERS)}>
            Quitar filtros
          </button>
        )}
      </div>

      {searching && active > 0 && (
        <p className={STYLES.hint}>Los filtros se aplican al explorar, no a la búsqueda por título.</p>
      )}

      {open && (
        <div id={panelId} className={STYLES.panel}>
          <div className={STYLES.grid}>
            <label>
              <span className={STYLES.label}>Edad recomendada</span>
              <select
                className={STYLES.select}
                value={filters.edad}
                disabled={moviesOnlyAge}
                onChange={(e) => set("edad", e.target.value as CatalogFilters["edad"])}
              >
                {AGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {moviesOnlyAge && <span className={STYLES.hint}>TMDB solo la da para películas.</span>}
            </label>

            <label>
              <span className={STYLES.label}>
                {mediaType === "series" ? "Duración por episodio" : "Duración"}
              </span>
              <select
                className={STYLES.select}
                value={filters.duracion}
                onChange={(e) => set("duracion", Number(e.target.value))}
              >
                {DURATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className={STYLES.label}>Idioma original</span>
              <select className={STYLES.select} value={filters.idioma} onChange={(e) => set("idioma", e.target.value)}>
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className={STYLES.label}>Década</span>
              <select
                className={STYLES.select}
                value={filters.decada}
                onChange={(e) => set("decada", Number(e.target.value))}
              >
                {DECADE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className={STYLES.label}>Votos mínimos</span>
              <select
                className={STYLES.select}
                value={filters.votos}
                onChange={(e) => set("votos", Number(e.target.value))}
              >
                {VOTES_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <fieldset className="mt-6">
            <legend className={STYLES.label}>Mis plataformas</legend>
            <p className={STYLES.hint}>
              Marca las que tienes contratadas. Se guardan en este navegador, sin necesidad de cuenta.
            </p>
            {providers === null ? (
              <p className={STYLES.hint}>Cargando plataformas…</p>
            ) : providers.length === 0 ? (
              <p className={STYLES.hint}>No se pudo cargar la lista de plataformas.</p>
            ) : (
              <div className={STYLES.providers}>
                {providers.map((provider) => {
                  const on = myPlatforms.includes(provider.id);
                  return (
                    <button
                      key={provider.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => togglePlatform(provider.id)}
                      className={STYLES.provider(on)}
                    >
                      {provider.logo_path ? (
                        <Image
                          src={tmdbImageHelpers.poster(provider.logo_path, "w92")}
                          alt=""
                          width={28}
                          height={28}
                          className="rounded-full"
                        />
                      ) : (
                        <span className="h-7 w-7 rounded-full bg-pixela-raised" aria-hidden="true" />
                      )}
                      {provider.name}
                      {on && <FiX className="h-3.5 w-3.5" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            )}
          </fieldset>
        </div>
      )}
    </div>
  );
}
