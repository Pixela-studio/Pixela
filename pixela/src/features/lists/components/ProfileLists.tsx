"use client";

import { useCallback, useEffect, useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiArrowDown, FiArrowUp, FiBookmark, FiList, FiPlus, FiTrash2 } from "react-icons/fi";
import {
  VISIBILITY_LABELS,
  listPath,
  listsAPI,
  type ListVisibility,
  type UserList,
} from "@/api/lists/lists";
import { parseApiErrorMessage } from "@/api/shared/apiHelpers";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { EmptyState } from "@/shared/components/EmptyState";
import { ShareButton } from "@/shared/components/ShareButton";
import { tmdbImageHelpers } from "@/lib/constants/tmdb";
import { formatYear } from "@/lib/date";
import { toast } from "@/lib/toast";

const STYLES = {
  input:
    "h-11 w-full rounded-full border border-white/10 bg-pixela-dark px-4 text-white placeholder:text-white/40 focus:border-pixela-accent/60 focus:outline-none",
  label: "mb-1.5 block text-sm font-medium text-white/70",
  card: "group flex flex-col gap-3 rounded-2xl border border-white/10 bg-pixela-surface p-4 text-left hover:border-white/25",
  iconButton:
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/70 hover:border-white/40 hover:text-white disabled:opacity-30",
} as const;

/** Mosaico de cuatro pósters como portada de la lista. */
function Cover({ list }: { list: UserList }) {
  const posters = list.items.slice(0, 4);
  return (
    <div className="grid aspect-[4/3] grid-cols-4 gap-1 overflow-hidden rounded-xl bg-pixela-raised">
      {posters.length === 0 ? (
        <div className="col-span-4 flex items-center justify-center text-white/30">
          <FiList className="h-8 w-8" aria-hidden="true" />
        </div>
      ) : (
        posters.map((item) => (
          <div key={item.id} className="relative h-full">
            {item.poster_path && (
              <Image src={tmdbImageHelpers.poster(item.poster_path, "w185")} alt="" fill sizes="80px" className="object-cover" />
            )}
          </div>
        ))
      )}
    </div>
  );
}

/** Edición de una lista: datos, visibilidad, orden, quitar, compartir y borrar. */
function ListEditor({ listId, onBack, onChanged }: { listId: number; onBack: () => void; onChanged: () => void }) {
  const [list, setList] = useState<UserList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const baseId = useId();

  useEffect(() => {
    let alive = true;
    listsAPI
      .get(listId)
      .then((data) => alive && setList(data))
      .catch((err) => alive && setError(parseApiErrorMessage(err, "No se pudo cargar la lista.")));
    return () => {
      alive = false;
    };
  }, [listId]);

  if (error) return <p role="alert" className="text-red-400">{error}</p>;
  if (!list) return <p className="text-gray-400">Cargando la lista…</p>;

  const save = async (patch: Partial<{ name: string; description: string; visibility: ListVisibility }>) => {
    setSaving(true);
    try {
      setList(await listsAPI.update(list.id, patch));
      onChanged();
    } catch (err) {
      toast.error(parseApiErrorMessage(err, "No se pudieron guardar los cambios."));
    } finally {
      setSaving(false);
    }
  };

  const move = async (index: number, delta: -1 | 1) => {
    const items = [...list.items];
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    const previous = list;
    setList({ ...list, items });
    try {
      await listsAPI.reorder(list.id, items.map((item) => item.id));
    } catch (err) {
      setList(previous);
      toast.error(parseApiErrorMessage(err, "No se pudo cambiar el orden."));
    }
  };

  const removeItem = async (itemId: number) => {
    const previous = list;
    setList({ ...list, items: list.items.filter((item) => item.id !== itemId), item_count: list.item_count - 1 });
    try {
      await listsAPI.removeItem(list.id, itemId);
      onChanged();
    } catch (err) {
      setList(previous);
      toast.error(parseApiErrorMessage(err, "No se pudo quitar el título."));
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <button type="button" onClick={onBack} className="w-fit text-sm text-white/70 underline underline-offset-4 hover:text-white">
        ← Todas mis listas
      </button>

      <form
        className="grid grid-cols-1 gap-5 md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          void save({
            name: String(data.get("name") ?? ""),
            description: String(data.get("description") ?? ""),
          });
        }}
      >
        <label className="block">
          <span className={STYLES.label}>Nombre</span>
          <input name="name" defaultValue={list.name} maxLength={80} required className={STYLES.input} />
        </label>
        <label className="block">
          <span className={STYLES.label}>Visibilidad</span>
          <select
            value={list.visibility}
            onChange={(e) => void save({ visibility: e.target.value as ListVisibility })}
            className={STYLES.input}
            aria-describedby={`${baseId}-vis`}
          >
            {(Object.keys(VISIBILITY_LABELS) as ListVisibility[]).map((value) => (
              <option key={value} value={value}>
                {VISIBILITY_LABELS[value].label}
              </option>
            ))}
          </select>
          <span id={`${baseId}-vis`} className="mt-1.5 block text-xs text-white/55">
            {VISIBILITY_LABELS[list.visibility].hint}
          </span>
        </label>
        <label className="block md:col-span-2">
          <span className={STYLES.label}>Descripción (opcional)</span>
          <textarea
            name="description"
            defaultValue={list.description ?? ""}
            maxLength={500}
            rows={2}
            placeholder="Para qué es la lista: «Sesiones del jueves con 4.º de ESO»"
            className="w-full rounded-2xl border border-white/10 bg-pixela-dark px-4 py-3 text-white placeholder:text-white/40 focus:border-pixela-accent/60 focus:outline-none"
          />
        </label>
        <div className="flex flex-wrap gap-3 md:col-span-2">
          <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
            {saving ? "Guardando…" : "Guardar"}
          </button>
          {list.visibility !== "PRIVATE" ? (
            <ShareButton title={list.name} path={listPath(list.share_id)} className="btn btn-ghost btn-sm" />
          ) : (
            <span className="self-center text-sm text-gray-400">Para compartirla, hazla pública o con enlace.</span>
          )}
          {list.visibility !== "PRIVATE" && (
            <Link href={listPath(list.share_id)} prefetch={false} className="btn btn-ghost btn-sm">
              Ver como la verán otros
            </Link>
          )}
        </div>
      </form>

      <section aria-labelledby={`${baseId}-items`}>
        <h3 id={`${baseId}-items`} className="mb-4 font-display text-2xl text-white">
          {list.item_count} {list.item_count === 1 ? "título" : "títulos"}
        </h3>
        {list.items.length === 0 ? (
          <p className="text-gray-400">
            Añade títulos con el botón «Listas» de cada ficha.
          </p>
        ) : (
          <ol className="divide-y divide-white/10 border-y border-white/10">
            {list.items.map((item, index) => (
              <li key={item.id} className="flex items-center gap-3 py-3">
                <span className="w-6 text-right tabular-nums text-gray-400">{index + 1}</span>
                <span className="relative h-[60px] w-10 shrink-0 overflow-hidden rounded-sm bg-pixela-raised">
                  {item.poster_path && (
                    <Image src={tmdbImageHelpers.poster(item.poster_path, "w92")} alt="" fill sizes="40px" className="object-cover" />
                  )}
                </span>
                <Link
                  href={`/${item.item_type === "movie" ? "movies" : "series"}/${item.tmdb_id}`}
                  prefetch={false}
                  className="min-w-0 flex-1 truncate font-medium text-white hover:underline"
                >
                  {item.title}
                  <span className="ml-2 text-sm text-gray-400">{formatYear(item.release_date, "")}</span>
                </Link>
                <button
                  type="button"
                  className={STYLES.iconButton}
                  disabled={index === 0}
                  onClick={() => void move(index, -1)}
                  aria-label={`Subir «${item.title}»`}
                >
                  <FiArrowUp aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={STYLES.iconButton}
                  disabled={index === list.items.length - 1}
                  onClick={() => void move(index, 1)}
                  aria-label={`Bajar «${item.title}»`}
                >
                  <FiArrowDown aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={STYLES.iconButton}
                  onClick={() => void removeItem(item.id)}
                  aria-label={`Quitar «${item.title}» de la lista`}
                >
                  <FiTrash2 aria-hidden="true" />
                </button>
              </li>
            ))}
          </ol>
        )}
      </section>

      <button
        type="button"
        onClick={() => setConfirmDelete(true)}
        className="btn btn-sm w-fit border border-red-500/40 text-red-400 hover:border-red-500/70 hover:bg-red-500/10"
      >
        <FiTrash2 aria-hidden="true" />
        Borrar la lista
      </button>

      <ConfirmDialog
        isOpen={confirmDelete}
        title={`¿Borrar «${list.name}»?`}
        description="Se borra la lista, no los títulos: siguen en tu biblioteca y en tus favoritos."
        confirmLabel="Borrar"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          try {
            await listsAPI.remove(list.id);
            toast.success(`Lista «${list.name}» borrada.`);
            onChanged();
            onBack();
          } catch (err) {
            toast.error(parseApiErrorMessage(err, "No se pudo borrar la lista."));
          }
        }}
      />
    </div>
  );
}

/**
 * Pestaña «Listas» del perfil. Los favoritos van primero, como la lista que
 * todo el mundo ya tiene (decisión 6.6 del beta test).
 */
export function ProfileLists({ onOpenFavorites }: { onOpenFavorites: () => void }) {
  const [lists, setLists] = useState<UserList[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const inputId = useId();

  const load = useCallback(() => {
    listsAPI
      .mine()
      .then(setLists)
      .catch((err) => setError(parseApiErrorMessage(err, "No se pudieron cargar tus listas.")));
  }, []);

  useEffect(load, [load]);

  if (editing !== null) {
    return <ListEditor listId={editing} onBack={() => setEditing(null)} onChanged={load} />;
  }

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;
    try {
      const list = await listsAPI.create({ name });
      setNewName("");
      setEditing(list.id);
    } catch (err) {
      toast.error(parseApiErrorMessage(err, "No se pudo crear la lista."));
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={(e) => void create(e)} className="flex max-w-xl gap-2">
        <label htmlFor={inputId} className="sr-only">
          Nombre de la nueva lista
        </label>
        <input
          id={inputId}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          maxLength={80}
          placeholder="Nueva lista: «Ciclo coming of age»"
          className={STYLES.input}
        />
        <button type="submit" className="btn btn-primary btn-sm shrink-0">
          <FiPlus aria-hidden="true" />
          Crear lista
        </button>
      </form>

      {error && <p role="alert" className="text-red-400">{error}</p>}

      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <li>
          <button type="button" onClick={onOpenFavorites} className={STYLES.card}>
            <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-pixela-raised text-pixela-accent">
              <FiBookmark className="h-10 w-10" aria-hidden="true" />
            </div>
            <span className="font-semibold text-white">Favoritos</span>
            <span className="text-sm text-gray-400">Lo que marcas con el marcapáginas · Privada</span>
          </button>
        </li>
        {lists?.map((list) => (
          <li key={list.id}>
            <button type="button" onClick={() => setEditing(list.id)} className={STYLES.card}>
              <Cover list={list} />
              <span className="truncate font-semibold text-white">{list.name}</span>
              <span className="text-sm text-gray-400">
                {list.item_count} {list.item_count === 1 ? "título" : "títulos"} · {VISIBILITY_LABELS[list.visibility].label}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {lists?.length === 0 && (
        <EmptyState
          icon={<FiList />}
          title="Crea tu primera lista"
          description="Agrupa películas y series con un nombre, ordénalas a tu gusto y comparte el enlace por WhatsApp."
        />
      )}
    </div>
  );
}
