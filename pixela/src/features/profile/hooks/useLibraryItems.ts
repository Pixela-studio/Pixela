import { useCallback, useMemo } from "react";
import { libraryAPI } from "@/api/library/library";
import { LibraryItemWithDetails, WatchStatus } from "@/api/library/types";
import { useAsyncResource } from "@/hooks/useAsyncResource";

const EMPTY_ITEMS: LibraryItemWithDetails[] = [];

export const useLibraryItems = () => {
  const fetchItems = useCallback(() => libraryAPI.listWithDetails(), []);
  const { data: items, loading, error } = useAsyncResource(
    fetchItems,
    EMPTY_ITEMS,
    { errorMessage: "No se pudo cargar la biblioteca", label: "library" },
  );

  const getFilteredItems = (filter: string) => {
    if (filter === "ALL") return items;
    return items.filter((item) => item.status === filter);
  };

  const stats = useMemo(() => {
    return {
      total: items.length,
      planToWatch: items.filter((i) => i.status === WatchStatus.PLAN_TO_WATCH)
        .length,
      watching: items.filter((i) => i.status === WatchStatus.WATCHING).length,
      completed: items.filter((i) => i.status === WatchStatus.COMPLETED).length,
      dropped: items.filter((i) => i.status === WatchStatus.DROPPED).length,
    };
  }, [items]);

  return { items, loading, error, getFilteredItems, stats };
};
