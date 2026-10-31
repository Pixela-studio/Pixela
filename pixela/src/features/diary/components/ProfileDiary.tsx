"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiCalendar, FiRepeat, FiTrash2 } from "react-icons/fi";
import { diaryAPI, type DiaryEntry } from "@/api/diary/diary";
import { parseApiErrorMessage } from "@/api/shared/apiHelpers";
import { EmptyState } from "@/shared/components/EmptyState";
import { tmdbImageHelpers } from "@/lib/constants/tmdb";
import { toast } from "@/lib/toast";

const MONTH = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric", timeZone: "UTC" });
const DAY = new Intl.DateTimeFormat("es-ES", { day: "numeric", weekday: "short", timeZone: "UTC" });

const asDate = (value: string) => new Date(`${value}T00:00:00Z`);

/** «Octubre de 2026»: mayúscula solo al principio (`capitalize` daba «De»). */
const monthTitle = (month: string) => {
  const text = MONTH.format(asDate(`${month}-01`));
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * El diario: qué viste y cuándo, agrupado por meses, con los revisionados
 * marcados. Privado: solo lo ve su dueño.
 */
export function ProfileDiary() {
  const [entries, setEntries] = useState<DiaryEntry[] | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (before?: number) => {
    try {
      const response = await diaryAPI.list({ before });
      setEntries((prev) => (before ? [...(prev ?? []), ...response.data] : response.data));
      setHasMore(response.has_more);
    } catch (err) {
      setError(parseApiErrorMessage(err, "No se pudo cargar tu diario."));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const months = useMemo(() => {
    const groups = new Map<string, DiaryEntry[]>();
    for (const entry of entries ?? []) {
      const key = entry.watched_on.slice(0, 7);
      groups.set(key, [...(groups.get(key) ?? []), entry]);
    }
    return [...groups.entries()];
  }, [entries]);

  const remove = async (entry: DiaryEntry) => {
    const previous = entries;
    setEntries((prev) => prev?.filter((e) => e.id !== entry.id) ?? null);
    try {
      await diaryAPI.remove(entry.id);
    } catch (err) {
      setEntries(previous);
      toast.error(parseApiErrorMessage(err, "No se pudo borrar la entrada."));
    }
  };

  if (error) return <p role="alert" className="text-red-400">{error}</p>;
  if (entries === null) return <p className="text-gray-400">Cargando tu diario…</p>;

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={<FiCalendar />}
        title="Tu diario está vacío"
        description="Pulsa «Lo he visto» en una ficha para apuntar qué viste y cuándo. Puedes apuntar la misma película varias veces: los revisionados cuentan."
        action={{ label: "Explorar catálogo", href: "/categories" }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <p className="text-sm text-gray-400">
        {entries.length}
        {hasMore ? "+" : ""} {entries.length === 1 ? "visionado" : "visionados"} · Solo lo ves tú.
      </p>
      {months.map(([month, monthEntries]) => (
        <section key={month} aria-labelledby={`diario-${month}`}>
          <h3 id={`diario-${month}`} className="mb-4 font-display text-2xl text-white">
            {monthTitle(month)}
          </h3>
          <ol className="divide-y divide-white/10 border-y border-white/10">
            {monthEntries.map((entry) => (
              <li key={entry.id} className="flex items-center gap-4 py-3">
                <span className="w-16 shrink-0 text-sm capitalize tabular-nums text-gray-400">
                  {DAY.format(asDate(entry.watched_on))}
                </span>
                <span className="relative h-[60px] w-10 shrink-0 overflow-hidden rounded-sm bg-pixela-raised">
                  {entry.poster_path && (
                    <Image src={tmdbImageHelpers.poster(entry.poster_path, "w92")} alt="" fill sizes="40px" className="object-cover" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <Link
                    href={`/${entry.item_type === "movie" ? "movies" : "series"}/${entry.tmdb_id}`}
                    prefetch={false}
                    className="block truncate font-medium text-white hover:underline"
                  >
                    {entry.title}
                  </Link>
                  <span className="flex flex-wrap items-center gap-x-3 text-sm text-gray-400">
                    {entry.rating !== null && <span>★ {(entry.rating / 2).toLocaleString("es-ES")}</span>}
                    {entry.rewatch && (
                      <span className="inline-flex items-center gap-1 text-white/80">
                        <FiRepeat className="h-3.5 w-3.5" aria-hidden="true" />
                        Revisionado
                      </span>
                    )}
                    {entry.note && <span className="truncate italic">«{entry.note}»</span>}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => void remove(entry)}
                  aria-label={`Borrar el visionado de «${entry.title}» del ${entry.watched_on}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/70 hover:border-red-500/50 hover:text-red-400"
                >
                  <FiTrash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ol>
        </section>
      ))}
      {hasMore && (
        <button
          type="button"
          disabled={loadingMore}
          onClick={async () => {
            setLoadingMore(true);
            await load(entries[entries.length - 1]?.id);
            setLoadingMore(false);
          }}
          className="btn btn-ghost btn-sm w-fit"
        >
          {loadingMore ? "Cargando…" : "Ver más"}
        </button>
      )}
    </div>
  );
}
