"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { FiCheck, FiPlus, FiX } from "react-icons/fi";
import { listsAPI, type UserList } from "@/api/lists/lists";
import { parseApiErrorMessage } from "@/api/shared/apiHelpers";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { toast } from "@/lib/toast";

interface AddToListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tmdbId: number;
  itemType: "movie" | "series";
  title: string;
}

/**
 * «Añadir a una lista»: marca o desmarca el título en cada lista y crea una
 * nueva sin salir de la ficha (Andrea: «Viernes en familia»; Nuria: «Ciclo
 * coming of age»).
 */
export function AddToListDialog({ isOpen, onClose, tmdbId, itemType, title }: AddToListDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const [lists, setLists] = useState<UserList[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useFocusTrap(dialogRef, isOpen, { onEscape: onClose });

  useEffect(() => {
    if (!isOpen) return;
    let alive = true;
    setLists(null);
    setError(null);
    listsAPI
      .mine({ tmdbId, itemType })
      .then((data) => alive && setLists(data))
      .catch((err) => alive && setError(parseApiErrorMessage(err, "No se pudieron cargar tus listas.")));
    return () => {
      alive = false;
    };
  }, [isOpen, tmdbId, itemType]);

  if (!isOpen) return null;

  const toggle = async (list: UserList) => {
    setBusyId(list.id);
    try {
      if (list.contains_item_id) {
        await listsAPI.removeItem(list.id, list.contains_item_id);
        setLists((prev) =>
          prev?.map((l) => (l.id === list.id ? { ...l, contains_item_id: null, item_count: l.item_count - 1 } : l)) ?? null,
        );
      } else {
        const { id } = await listsAPI.addItem(list.id, { tmdb_id: tmdbId, item_type: itemType });
        setLists((prev) =>
          prev?.map((l) => (l.id === list.id ? { ...l, contains_item_id: id, item_count: l.item_count + 1 } : l)) ?? null,
        );
      }
    } catch (err) {
      toast.error(parseApiErrorMessage(err, "No se pudo actualizar la lista."));
    } finally {
      setBusyId(null);
    }
  };

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = newName.trim();
    if (!name) {
      inputRef.current?.focus();
      return;
    }
    setCreating(true);
    try {
      const list = await listsAPI.create({ name });
      const { id } = await listsAPI.addItem(list.id, { tmdb_id: tmdbId, item_type: itemType });
      setLists((prev) => [{ ...list, contains_item_id: id, item_count: 1 }, ...(prev ?? [])]);
      setNewName("");
      toast.success(`«${title}» está en tu nueva lista «${list.name}».`);
    } catch (err) {
      toast.error(parseApiErrorMessage(err, "No se pudo crear la lista."));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="flex max-h-[85vh] w-full max-w-md flex-col rounded-2xl border border-white/10 bg-pixela-surface p-6 shadow-2xl shadow-black/60"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-xl font-bold text-white">
            Añadir «{title}» a una lista
          </h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-full p-1 text-white/70 hover:text-white">
            <FiX className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 min-h-0 flex-1 overflow-y-auto">
          {error ? (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          ) : lists === null ? (
            <p className="text-sm text-gray-400">Cargando tus listas…</p>
          ) : lists.length === 0 ? (
            <p className="text-sm text-gray-400">Aún no tienes listas. Crea la primera aquí abajo.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {lists.map((list) => {
                const checked = Boolean(list.contains_item_id);
                return (
                  <li key={list.id}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={checked}
                      disabled={busyId === list.id}
                      onClick={() => void toggle(list)}
                      className="flex w-full items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-left hover:border-white/30 disabled:opacity-60"
                    >
                      <span
                        aria-hidden="true"
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border ${
                          checked ? "border-white bg-white text-pixela-dark" : "border-white/40"
                        }`}
                      >
                        {checked && <FiCheck className="h-3.5 w-3.5" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-white">{list.name}</span>
                        <span className="block text-xs text-gray-400">
                          {list.item_count} {list.item_count === 1 ? "título" : "títulos"}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <form onSubmit={(e) => void create(e)} className="mt-5 flex gap-2 border-t border-white/10 pt-5">
          <label htmlFor={`${titleId}-new`} className="sr-only">
            Nombre de la nueva lista
          </label>
          <input
            ref={inputRef}
            id={`${titleId}-new`}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={80}
            placeholder="Nueva lista: «Viernes en familia»"
            className="h-11 min-w-0 flex-1 rounded-full border border-white/10 bg-pixela-dark px-4 text-white placeholder:text-white/40 focus:border-pixela-accent/60 focus:outline-none"
          />
          <button type="submit" disabled={creating} className="btn btn-primary btn-sm shrink-0">
            <FiPlus aria-hidden="true" />
            Crear
          </button>
        </form>

        <Link
          href="/profile?tab=lists"
          prefetch={false}
          className="mt-4 text-center text-sm text-white/70 underline underline-offset-4 hover:text-white"
        >
          Gestionar mis listas
        </Link>
      </div>
    </div>
  );
}
