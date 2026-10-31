"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FiSearch, FiUser, FiX } from "react-icons/fi";
import {
  describeSearchError,
  searchAll,
  type SearchPerson,
  type SearchResult,
  type SearchTitle,
} from "@/api/search/search";
import { tmdbImageHelpers } from "@/lib/constants/tmdb";
import { formatYear } from "@/lib/date";

const MIN_QUERY = 2;
const DEBOUNCE_MS = 400;

const STYLES = {
  page: "min-h-screen bg-pixela-ink px-4 sm:px-6 md:px-10 lg:px-16 2k:px-24 pt-32 pb-32 md:pt-40",
  title: "title-card text-[clamp(3rem,8vw,6rem)]",
  form: "relative mt-8 max-w-2xl",
  input:
    "h-14 w-full rounded-full border border-white/10 bg-pixela-surface pl-14 pr-14 text-lg text-white placeholder:text-white/40 focus:border-pixela-accent/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-pixela-accent/30",
  inputIcon: "pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60",
  clear: "absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-white/60 hover:text-white",
  status: "meta-text mt-6",
  error: "mt-8 text-red-400",
  sectionTitle: "font-display text-3xl md:text-4xl text-white mb-6",
  people: "flex gap-5 overflow-x-auto pb-2 [scrollbar-width:thin]",
  person: "group flex w-32 shrink-0 flex-col",
  personPhoto: "relative mb-3 aspect-[4/5] overflow-hidden rounded-sm bg-pixela-surface",
  grid: "grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
  poster: "relative mb-3 aspect-[2/3] overflow-hidden rounded-sm bg-pixela-surface",
  cardTitle: "line-clamp-2 text-[15px] font-semibold text-white",
  cardMeta: "mt-0.5 text-sm tabular-nums text-gray-400",
  more: "btn btn-ghost mt-12",
} as const;

/**
 * Buscador global: películas, series y personas en una sola consulta.
 *
 * La consulta vive en `?q=`: volver atrás desde una ficha devuelve la misma
 * búsqueda, y el enlace se puede mandar por WhatsApp. Las tarjetas llevan
 * `rel="nofollow"` porque cualquier resultado puede ser una ficha fuera de la
 * allowlist; la página entera es `noindex` (ver `app/(rutas)/buscar/page.tsx`).
 */
export function SearchPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = (searchParams.get("q") ?? "").trim();
  const inputId = useId();

  const [value, setValue] = useState(urlQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  // Lo escrito pasa a la URL tras una pausa; la URL es la que dispara la búsqueda.
  useEffect(() => {
    const next = value.trim();
    if (next === urlQuery) return;
    const timer = setTimeout(() => {
      const query = next.length >= MIN_QUERY ? `?q=${encodeURIComponent(next)}` : "";
      router.replace(`${pathname}${query}`, { scroll: false });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value, urlQuery, router, pathname]);

  const runSearch = async (query: string, nextPage: number) => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await searchAll(query, nextPage);
      if (id !== requestId.current) return;
      setResults((prev) => (nextPage === 1 ? result.results : [...prev, ...result.results]));
      setPage(nextPage);
      setTotalPages(result.totalPages);
      setTotalResults(result.totalResults);
    } catch (err) {
      if (id === requestId.current) setError(describeSearchError(err));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  };

  useEffect(() => {
    if (urlQuery.length < MIN_QUERY) {
      requestId.current++;
      setResults([]);
      setTotalPages(0);
      setTotalResults(0);
      setError(null);
      setLoading(false);
      return;
    }
    void runSearch(urlQuery, 1);
    // `runSearch` es estable en lo que importa: solo usa setters y la ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQuery]);

  const people = results.filter((item): item is SearchPerson => item.kind === "person");
  const titles = results.filter((item): item is SearchTitle => item.kind !== "person");

  return (
    <main className={STYLES.page}>
      <h1 className={STYLES.title}>Buscar</h1>

      <form
        role="search"
        className={STYLES.form}
        onSubmit={(e) => {
          e.preventDefault();
          const next = value.trim();
          if (next.length >= MIN_QUERY) router.replace(`${pathname}?q=${encodeURIComponent(next)}`, { scroll: false });
        }}
      >
        <label htmlFor={inputId} className="sr-only">
          Película, serie o persona
        </label>
        <FiSearch className={STYLES.inputIcon} aria-hidden="true" />
        <input
          id={inputId}
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Película, serie, actriz, director…"
          autoFocus={!urlQuery}
          autoComplete="off"
          enterKeyHint="search"
          maxLength={200}
          className={STYLES.input}
        />
        {value && (
          <button type="button" onClick={() => setValue("")} className={STYLES.clear} aria-label="Borrar búsqueda">
            <FiX className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </form>

      <p className={STYLES.status} role="status" aria-live="polite">
        {urlQuery.length < MIN_QUERY
          ? "Escribe al menos dos letras. Busca también por título original o por persona."
          : loading && results.length === 0
            ? "Buscando…"
            : !error
              ? totalResults === 0
                ? `Nada para «${urlQuery}». Prueba con el título original o con menos palabras.`
                : `${totalResults.toLocaleString("es-ES")} resultados para «${urlQuery}»`
              : ""}
      </p>

      {error && (
        <div role="alert" className={STYLES.error}>
          <p>{error}</p>
          <button type="button" className="btn btn-ghost btn-sm mt-4" onClick={() => void runSearch(urlQuery, page)}>
            Reintentar
          </button>
        </div>
      )}

      {people.length > 0 && (
        <section className="mt-12" aria-labelledby="buscar-personas">
          <h2 id="buscar-personas" className={STYLES.sectionTitle}>
            Personas
          </h2>
          <ul className={STYLES.people}>
            {people.map((person) => (
              <li key={person.id}>
                <Link href={`/actor/${person.id}`} prefetch={false} rel="nofollow" className={STYLES.person}>
                  <div className={STYLES.personPhoto}>
                    {person.profile_path ? (
                      <Image
                        src={tmdbImageHelpers.profile(person.profile_path)}
                        alt=""
                        fill
                        sizes="128px"
                        className="object-cover"
                      />
                    ) : (
                      <FiUser className="absolute inset-0 m-auto h-8 w-8 text-white/30" aria-hidden="true" />
                    )}
                  </div>
                  <span className={STYLES.cardTitle}>{person.name}</span>
                  <span className={STYLES.cardMeta}>
                    {[person.department, person.knownFor.join(", ")].filter(Boolean).join(" · ")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {titles.length > 0 && (
        <section className="mt-14" aria-labelledby="buscar-titulos">
          <h2 id="buscar-titulos" className={STYLES.sectionTitle}>
            Películas y series
          </h2>
          <ul className={STYLES.grid}>
            {titles.map((item) => (
              <li key={`${item.kind}-${item.id}`}>
                <Link
                  href={`/${item.kind === "movie" ? "movies" : "series"}/${item.id}`}
                  prefetch={false}
                  rel="nofollow"
                  className="group flex flex-col"
                >
                  <div className={STYLES.poster}>
                    {item.poster_path && (
                      <Image
                        src={tmdbImageHelpers.poster(item.poster_path, "w342")}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 45vw, 200px"
                        className="object-cover transition-transform duration-700 ease-out-expo [@media(hover:hover)]:group-hover:scale-[1.04]"
                      />
                    )}
                  </div>
                  <span className={STYLES.cardTitle}>{item.title}</span>
                  {item.originalTitle && (
                    <span className="text-sm italic text-gray-400 line-clamp-1">{item.originalTitle}</span>
                  )}
                  <span className={STYLES.cardMeta}>
                    {[
                      item.kind === "movie" ? "Película" : "Serie",
                      formatYear(item.date, ""),
                      item.vote_count > 0 ? `★ ${item.vote_average.toFixed(1).replace(".", ",")}` : "",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {page < totalPages && !error && (
        <button type="button" className={STYLES.more} disabled={loading} onClick={() => void runSearch(urlQuery, page + 1)}>
          {loading ? "Cargando…" : "Más resultados"}
        </button>
      )}
    </main>
  );
}
