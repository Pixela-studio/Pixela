import { useState, useEffect, useCallback } from "react";
import { libraryAPI } from "@/api/library/library";
import { WatchStatus } from "@/api/library/types";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "@/lib/toast";

/**
 * Etiquetas en castellano de cada estado. Las comparten el menú de
 * LibraryButton y los avisos de este hook para no enseñar el enum crudo
 * ("Marcado como WATCHING").
 */
export const WATCH_STATUS_LABELS: Record<WatchStatus, string> = {
  [WatchStatus.PLAN_TO_WATCH]: "Planeado",
  [WatchStatus.WATCHING]: "Viendo",
  [WatchStatus.COMPLETED]: "Completado",
  [WatchStatus.DROPPED]: "Abandonado",
};

interface UseLibraryStatusProps {
  tmdbId: number;
  itemType: "movie" | "series";
}

export const useLibraryStatus = ({
  tmdbId,
  itemType,
}: UseLibraryStatusProps) => {
  const { user } = useAuthStore();
  const [status, setStatus] = useState<WatchStatus | null>(null);
  const [libraryItemId, setLibraryItemId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    let mounted = true;

    libraryAPI
      .checkLibraryStatus(tmdbId, itemType)
      .then((response) => {
        if (mounted && response.inLibrary && response.data) {
          setStatus(response.data.status);
          setLibraryItemId(response.data.id);
        }
      })
      .catch((err) => {
        console.error("Error checking status:", err);
      });

    return () => {
      mounted = false;
    };
  }, [tmdbId, itemType, user]);

  const updateStatus = useCallback(
    async (newStatus: WatchStatus) => {
      if (!user) {
        toast.error("Debes iniciar sesión para añadir a la biblioteca");
        return;
      }

      setLoading(true);

      try {
        if (libraryItemId) {
          await libraryAPI.updateStatus(libraryItemId, newStatus);
          setStatus(newStatus);
          toast.success(`Marcado como ${WATCH_STATUS_LABELS[newStatus].toLowerCase()}`);
        } else {
          const newItem = await libraryAPI.addToLibrary({
            tmdb_id: tmdbId,
            item_type: itemType,
            status: newStatus,
          });
          setLibraryItemId(newItem.id);
          setStatus(newStatus);
          toast.success("Añadido a la biblioteca");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error al actualizar la biblioteca");
      } finally {
        setLoading(false);
      }
    },
    [user, libraryItemId, tmdbId, itemType],
  );

  const removeFromLibrary = useCallback(async () => {
    if (!libraryItemId) return;

    setLoading(true);

    try {
      await libraryAPI.removeItem(libraryItemId);
      setStatus(null);
      setLibraryItemId(null);
      toast.success("Eliminado de la biblioteca");
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar");
    } finally {
      setLoading(false);
    }
  }, [libraryItemId]);

  return {
    status,
    loading,
    isAuthenticated: !!user,
    updateStatus,
    removeFromLibrary,
  };
};
