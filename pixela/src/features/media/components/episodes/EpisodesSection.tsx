"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { FiCheck } from "react-icons/fi";
import { episodeKey, episodesAPI, type SeasonDetail } from "@/api/episodes/episodes";
import { parseApiErrorMessage } from "@/api/shared/apiHelpers";
import { useAuthStore } from "@/stores/useAuthStore";
import { loginHref } from "@/lib/authRedirect";
import { formatRuntime } from "@/lib/date";
import { toast } from "@/lib/toast";
import type { Serie } from "@/features/media/types/content";

const AIR_DATE = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** Primer capítulo sin ver, en orden de emisión. */
function findNextEpisode(seasons: NonNullable<Serie["listaTemporadas"]>, watched: Set<string>) {
  for (const season of seasons) {
    for (let episode = 1; episode <= season.episodios; episode++) {
      if (!watched.has(episodeKey(season.numero, episode))) return { season: season.numero, episode };
    }
  }
  return null;
}

interface EpisodesSectionProps {
  serie: Serie;
}

/**
 * Temporadas y capítulos, con lo visto marcado.
 *
 * Tomás, Marcos y Diego seguían series en otra app porque aquí solo se podía
 * decir «Viendo». Cada temporada se pide al abrirla (una petición cacheada en
 * la CDN), lo visto se pide una vez por ficha y solo con sesión, y marcar el
 * primer capítulo pone la serie en «Viendo».
 */
export function EpisodesSection({ serie }: EpisodesSectionProps) {
  const seasons = useMemo(() => serie.listaTemporadas ?? [], [serie.listaTemporadas]);
  const seriesId = Number(serie.id);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const pathname = usePathname();

  const [active, setActive] = useState(seasons[0]?.numero ?? 1);
  const [details, setDetails] = useState<Record<number, SeasonDetail>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [watched, setWatched] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  // Lo visto, una vez por serie y solo con sesión.
  useEffect(() => {
    if (!isAuthenticated || seasons.length === 0) return;
    let alive = true;
    episodesAPI
      .watched(seriesId)
      .then((set) => {
        if (!alive) return;
        setWatched(set);
        // Se abre la temporada por la que se va, no siempre la primera.
        const pending = seasons.find((season) =>
          Array.from({ length: season.episodios }, (_, i) => i + 1).some(
            (episode) => !set.has(episodeKey(season.numero, episode)),
          ),
        );
        if (set.size > 0 && pending) setActive(pending.numero);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
    // `seasons` sale de la ficha y no cambia mientras está montada.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, seriesId]);

  useEffect(() => {
    if (details[active]) return;
    let alive = true;
    setLoadError(null);
    episodesAPI
      .season(seriesId, active)
      .then((detail) => alive && setDetails((prev) => ({ ...prev, [active]: detail })))
      .catch((err) => alive && setLoadError(parseApiErrorMessage(err, "No se pudo cargar la temporada.")));
    return () => {
      alive = false;
    };
  }, [active, seriesId, details]);

  // Cálculos baratos sobre unas decenas de capítulos: sin `useMemo`, que el
  // compilador de React ya memoiza lo que hace falta.
  const totalEpisodes = seasons.reduce((sum, season) => sum + season.episodios, 0);
  const next = findNextEpisode(seasons, watched);

  if (seasons.length === 0) return null;

  const detail = details[active];

  const toggle = async (episodes: number[], value: boolean) => {
    setBusy(true);
    const previous = watched;
    setWatched((prev) => {
      const copy = new Set(prev);
      for (const episode of episodes) {
        if (value) copy.add(episodeKey(active, episode));
        else copy.delete(episodeKey(active, episode));
      }
      return copy;
    });
    try {
      await episodesAPI.toggle(seriesId, active, episodes, value);
    } catch (err) {
      setWatched(previous);
      toast.error(parseApiErrorMessage(err, "No se pudo guardar. Inténtalo de nuevo."));
    } finally {
      setBusy(false);
    }
  };

  const seasonWatched = detail ? detail.episodes.filter((e) => watched.has(episodeKey(active, e.episode))).length : 0;

  return (
    <section aria-labelledby="temporadas-title">
      <h2 id="temporadas-title" className="title-card mb-4 text-5xl md:text-6xl">
        Temporadas
      </h2>

      {isAuthenticated ? (
        <p className="mb-6 text-base text-white" role="status">
          {watched.size === 0
            ? "Marca los capítulos que vayas viendo y te diremos por dónde vas."
            : next
              ? `Has visto ${watched.size} de ${totalEpisodes}. Te toca el T${next.season}·E${next.episode}.`
              : `Has visto los ${totalEpisodes} capítulos.`}
        </p>
      ) : (
        <p className="mb-6 text-sm text-gray-400">
          <Link href={loginHref(pathname)} prefetch={false} className="text-white underline underline-offset-4">
            Inicia sesión
          </Link>{" "}
          para marcar los capítulos que has visto.
        </p>
      )}

      <div role="tablist" aria-label="Temporada" className="mb-6 flex flex-wrap gap-2">
        {seasons.map((season) => (
          <button
            key={season.numero}
            type="button"
            role="tab"
            aria-selected={season.numero === active}
            onClick={() => setActive(season.numero)}
            className={clsx(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-200",
              season.numero === active ? "border-white bg-white text-pixela-dark" : "border-white/15 text-white/75 hover:border-white/40",
            )}
          >
            T{season.numero}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {loadError ? (
          <p role="alert" className="text-red-400">{loadError}</p>
        ) : !detail ? (
          <p className="text-gray-400">Cargando la temporada…</p>
        ) : (
          <>
            {isAuthenticated && detail.episodes.length > 0 && (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void toggle(
                    detail.episodes.map((e) => e.episode),
                    seasonWatched < detail.episodes.length,
                  )
                }
                className="btn btn-ghost btn-sm mb-4"
              >
                {seasonWatched < detail.episodes.length ? "Marcar la temporada entera" : "Desmarcar la temporada"}
              </button>
            )}
            <ol className="divide-y divide-white/10 border-y border-white/10">
              {detail.episodes.map((episode) => {
                const isWatched = watched.has(episodeKey(active, episode.episode));
                const runtime = formatRuntime(episode.runtime);
                const meta = [
                  episode.air_date ? AIR_DATE.format(new Date(`${episode.air_date}T00:00:00Z`)) : "Sin fecha",
                  runtime,
                ]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <li key={episode.episode} className="flex items-center gap-4 py-3">
                    <span className="w-10 shrink-0 text-sm tabular-nums text-gray-400">E{episode.episode}</span>
                    <span className="min-w-0 flex-1">
                      <span className={clsx("block truncate", isWatched ? "text-white/60" : "text-white")}>
                        {episode.name || `Capítulo ${episode.episode}`}
                      </span>
                      <span className="block text-sm text-gray-400">{meta}</span>
                    </span>
                    {isAuthenticated && (
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={isWatched}
                        aria-label={`T${active}·E${episode.episode} visto`}
                        disabled={busy}
                        onClick={() => void toggle([episode.episode], !isWatched)}
                        className={clsx(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors duration-200",
                          isWatched ? "border-white bg-white text-pixela-dark" : "border-white/25 text-transparent hover:border-white/60",
                        )}
                      >
                        <FiCheck className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </div>
    </section>
  );
}
