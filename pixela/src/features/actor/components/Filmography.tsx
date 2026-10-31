"use client";

import { useId, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import type { ActorCredit, CrewCredit } from "@/features/actor/services/actorService";
import { departmentName, jobName } from "@/lib/departments";
import { tmdbImageHelpers } from "@/lib/constants/tmdb";
import { formatYear } from "@/lib/date";

interface FilmographyProps {
  cast: ActorCredit[];
  crew: CrewCredit[];
  /** `known_for_department` de TMDB: decide la pestaña que se abre primero. */
  knownFor?: string;
  /** Claves `"movies/<id>"` / `"series/<id>"` de la allowlist: sin `nofollow`. */
  linkableKeys: readonly string[];
}

interface Row {
  key: string;
  id: number;
  type: "movies" | "series";
  title: string;
  date: string;
  role: string;
  poster: string | null;
  rating: number;
  votes: number;
}

type Order = "recent" | "rated";

const INITIAL_ROWS = 30;
/** Para ordenar por nota, una media de cinco votos no cuenta. */
const MIN_VOTES_FOR_RATING = 50;

const ACTING = "Acting";

function toRow(credit: ActorCredit | CrewCredit, role: string): Row {
  const type = credit.media_type === "tv" ? "series" : "movies";
  return {
    key: `${type}/${credit.id}`,
    id: credit.id,
    type,
    title: credit.title ?? credit.name ?? "",
    date: credit.release_date ?? credit.first_air_date ?? "",
    role,
    poster: credit.poster_path,
    rating: credit.vote_average ?? 0,
    votes: credit.vote_count ?? 0,
  };
}

/** Une los puestos de una persona en un mismo título: «Dirección, Guion». */
function groupCrew(credits: CrewCredit[]): Row[] {
  const byTitle = new Map<string, { credit: CrewCredit; jobs: string[] }>();
  for (const credit of credits) {
    const key = `${credit.media_type}/${credit.id}`;
    const entry = byTitle.get(key);
    const job = jobName(credit.job);
    if (entry) {
      if (!entry.jobs.includes(job)) entry.jobs.push(job);
    } else {
      byTitle.set(key, { credit, jobs: [job] });
    }
  }
  return [...byTitle.values()].map(({ credit, jobs }) => toRow(credit, jobs.join(", ")));
}

function sortRows(rows: Row[], order: Order): Row[] {
  return [...rows].sort((a, b) => {
    if (order === "rated") {
      const ra = a.votes >= MIN_VOTES_FOR_RATING ? a.rating : -1;
      const rb = b.votes >= MIN_VOTES_FOR_RATING ? b.rating : -1;
      return rb - ra;
    }
    // Lo que aún no tiene fecha (anunciado) va primero.
    if (!a.date) return -1;
    if (!b.date) return 1;
    return b.date.localeCompare(a.date);
  });
}

/**
 * Filmografía completa, por oficio y en orden cronológico.
 *
 * Antes era un carrusel con los veinte trabajos de interpretación mejor
 * valorados: un director aparecía sin las películas que dirigió, sin año ni
 * orden, y casi ningún título era pulsable. Ahora hay una pestaña por oficio
 * (la del oficio por el que se le conoce, primero), el año a la vista, orden
 * por fecha o por nota y todos los títulos enlazan.
 */
export function Filmography({ cast, crew, knownFor, linkableKeys }: FilmographyProps) {
  const linkable = useMemo(() => new Set(linkableKeys), [linkableKeys]);
  const baseId = useId();

  const tabs = useMemo(() => {
    const groups: Array<{ department: string; rows: Row[] }> = [];
    if (cast.length > 0) {
      groups.push({ department: ACTING, rows: cast.map((credit) => toRow(credit, credit.character)) });
    }
    const crewByDepartment = new Map<string, CrewCredit[]>();
    for (const credit of crew) {
      crewByDepartment.set(credit.department, [...(crewByDepartment.get(credit.department) ?? []), credit]);
    }
    for (const [department, credits] of crewByDepartment) {
      groups.push({ department, rows: groupCrew(credits) });
    }
    // El oficio por el que se la conoce, primero; el resto, por volumen.
    return groups.sort((a, b) =>
      a.department === knownFor ? -1 : b.department === knownFor ? 1 : b.rows.length - a.rows.length,
    );
  }, [cast, crew, knownFor]);

  const [active, setActive] = useState(tabs[0]?.department ?? ACTING);
  const [order, setOrder] = useState<Order>("recent");
  const [expanded, setExpanded] = useState(false);

  const current = tabs.find((tab) => tab.department === active) ?? tabs[0];
  const rows = useMemo(() => (current ? sortRows(current.rows, order) : []), [current, order]);

  if (!current) return null;

  const visible = expanded ? rows : rows.slice(0, INITIAL_ROWS);
  const panelId = `${baseId}-panel`;

  return (
    <section aria-labelledby={`${baseId}-title`}>
      <h2 id={`${baseId}-title`} className="title-card text-5xl md:text-6xl mb-8">
        Filmografía
      </h2>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        {tabs.length > 1 && (
          <div role="tablist" aria-label="Oficio" className="flex flex-wrap gap-x-6 gap-y-2">
            {tabs.map((tab) => {
              const selected = tab.department === current.department;
              return (
                <button
                  key={tab.department}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={panelId}
                  onClick={() => {
                    setActive(tab.department);
                    setExpanded(false);
                  }}
                  className={clsx(
                    "meta-text border-b-2 pb-1 transition-colors duration-200",
                    selected ? "border-pixela-accent text-white" : "border-transparent hover:text-white",
                  )}
                >
                  {departmentName(tab.department)} <span className="text-gray-400">{tab.rows.length}</span>
                </button>
              );
            })}
          </div>
        )}

        <label className="meta-text flex items-center gap-2">
          Ordenar
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value as Order)}
            className="rounded-full border border-white/10 bg-pixela-surface px-3 py-1.5 text-white"
          >
            <option value="recent">Más recientes</option>
            <option value="rated">Mejor valoradas</option>
          </select>
        </label>
      </div>

      <ul id={panelId} role="tabpanel" className="divide-y divide-white/10 border-y border-white/10">
        {visible.map((row) => (
          <li key={`${row.key}-${row.role}`}>
            <Link
              href={`/${row.type}/${row.id}`}
              prefetch={false}
              // Fuera de la allowlist, el enlace es para personas, no para
              // rastreadores (decisión 6.3 del beta test, ronda 2).
              rel={linkable.has(row.key) ? undefined : "nofollow"}
              className="group flex items-center gap-4 py-3"
            >
              <span className="w-12 shrink-0 text-[15px] tabular-nums text-gray-400">
                {formatYear(row.date, "—")}
              </span>
              <span className="relative h-[60px] w-10 shrink-0 overflow-hidden rounded-sm bg-pixela-surface">
                {row.poster && (
                  <Image
                    src={tmdbImageHelpers.poster(row.poster, "w92")}
                    alt=""
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-white group-hover:underline underline-offset-4">
                  {row.title}
                </span>
                <span className="block truncate text-sm text-gray-400">
                  {[row.type === "series" ? "Serie" : null, row.role].filter(Boolean).join(" · ")}
                </span>
              </span>
              {row.votes >= MIN_VOTES_FOR_RATING && (
                <span className="shrink-0 text-sm tabular-nums text-gray-400">
                  ★ {row.rating.toFixed(1).replace(".", ",")}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>

      {rows.length > INITIAL_ROWS && (
        <button type="button" className="btn btn-ghost btn-sm mt-6" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Ver menos" : `Ver los ${rows.length - INITIAL_ROWS} restantes`}
        </button>
      )}
    </section>
  );
}
