"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import { diaryAPI } from "@/api/diary/diary";
import { parseApiErrorMessage } from "@/api/shared/apiHelpers";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { StarRatingInput } from "@/shared/components/StarRatingInput";
import { toast } from "@/lib/toast";

interface LogViewingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tmdbId: number;
  itemType: "movie" | "series";
  title: string;
}

/** Hoy en la zona horaria de quien mira, en `AAAA-MM-DD`. */
const today = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
};

/**
 * «Lo he visto»: apunta un visionado en el diario con fecha, nota y si es un
 * revisionado. A diferencia de la reseña, se puede apuntar varias veces: es
 * lo que Javi echaba de menos de Letterboxd.
 */
export function LogViewingDialog({ isOpen, onClose, tmdbId, itemType, title }: LogViewingDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const ratingLabelId = useId();
  const [watchedOn, setWatchedOn] = useState(today);
  const [rating, setRating] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [rewatch, setRewatch] = useState(false);
  const [previous, setPrevious] = useState<number | null>(null);
  const [markCompleted, setMarkCompleted] = useState(true);
  const [saving, setSaving] = useState(false);

  useFocusTrap(dialogRef, isOpen, { onEscape: onClose });

  // ¿Ya está en el diario? Entonces esto es un revisionado.
  useEffect(() => {
    if (!isOpen) return;
    let alive = true;
    setWatchedOn(today());
    setRating(null);
    setNote("");
    diaryAPI
      .list({ tmdbId, itemType })
      .then((response) => {
        if (!alive) return;
        setPrevious(response.data.length);
        setRewatch(response.data.length > 0);
      })
      .catch(() => alive && setPrevious(null));
    return () => {
      alive = false;
    };
  }, [isOpen, tmdbId, itemType]);

  if (!isOpen) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await diaryAPI.add({
        tmdb_id: tmdbId,
        item_type: itemType,
        watched_on: watchedOn,
        rating,
        note: note.trim() || undefined,
        rewatch,
        mark_completed: markCompleted,
      });
      toast.success(rewatch ? `Revisionado de «${title}» apuntado en tu diario.` : `«${title}» apuntada en tu diario.`);
      onClose();
    } catch (err) {
      toast.error(parseApiErrorMessage(err, "No se pudo guardar en el diario."));
    } finally {
      setSaving(false);
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
        className="w-full max-w-md rounded-2xl border border-white/10 bg-pixela-surface p-6 shadow-2xl shadow-black/60"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-xl font-bold text-white">
            Apuntar «{title}» en tu diario
          </h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-full p-1 text-white/70 hover:text-white">
            <FiX className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={(e) => void submit(e)} className="mt-5 flex flex-col gap-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-white/70">¿Cuándo la viste?</span>
            <input
              type="date"
              required
              value={watchedOn}
              max={today()}
              min="1900-01-01"
              onChange={(e) => setWatchedOn(e.target.value)}
              className="h-11 w-full rounded-full border border-white/10 bg-pixela-dark px-4 text-white [color-scheme:dark] focus:border-pixela-accent/60 focus:outline-none"
            />
          </label>

          <div>
            <span id={ratingLabelId} className="mb-1.5 block text-sm font-medium text-white/70">
              Nota (opcional)
            </span>
            <StarRatingInput value={rating} onChange={setRating} labelledBy={ratingLabelId} />
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-white/70">Nota para ti (opcional)</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="Con quién, dónde, qué te pareció esta vez…"
              className="w-full rounded-2xl border border-white/10 bg-pixela-dark px-4 py-3 text-white placeholder:text-white/40 focus:border-pixela-accent/60 focus:outline-none"
            />
          </label>

          <label className="flex items-start gap-3 text-sm text-white/80">
            <input
              type="checkbox"
              checked={rewatch}
              onChange={(e) => setRewatch(e.target.checked)}
              className="mt-0.5 h-5 w-5 rounded-sm accent-pixela-accent"
            />
            <span>
              Es un revisionado
              {previous ? (
                <span className="block text-white/55">
                  Ya la tienes {previous === 1 ? "una vez" : `${previous} veces`} en el diario.
                </span>
              ) : null}
            </span>
          </label>

          <label className="flex items-start gap-3 text-sm text-white/80">
            <input
              type="checkbox"
              checked={markCompleted}
              onChange={(e) => setMarkCompleted(e.target.checked)}
              className="mt-0.5 h-5 w-5 rounded-sm accent-pixela-accent"
            />
            Marcarla como «Completado» en mi biblioteca
          </label>

          <p className="text-xs text-white/55">El diario es privado: solo lo ves tú.</p>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
              {saving ? "Guardando…" : "Apuntar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
