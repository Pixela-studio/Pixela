import { randomBytes } from "node:crypto";
import type { ListVisibility, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { enrichWithTmdb } from "@/lib/api/mediaEnrichment";
import { avatarUrlFor } from "@/lib/api/reviewsQuery";

/**
 * Listas con nombre: consultas y forma de la respuesta, compartidas por las
 * route handlers (`/api/lists/**`) y la página pública (`/listas/[shareId]`).
 */

/** Tope por lista: una lista es una selección, no otra biblioteca. */
export const MAX_LIST_ITEMS = 200;
/** Tope de listas por persona. */
export const MAX_LISTS_PER_USER = 50;

/** 16 caracteres base64url: 96 bits, imposible de adivinar recorriendo. */
export const newShareId = () => randomBytes(12).toString("base64url");

const listWithItems = {
  include: {
    items: { orderBy: { position: "asc" } },
    user: { select: { id: true, name: true, photoUrl: true, updatedAt: true } },
  },
} satisfies Prisma.ListDefaultArgs;

export type ListWithItems = Prisma.ListGetPayload<typeof listWithItems>;

export interface ListItemDto {
  id: number;
  tmdb_id: number;
  item_type: "movie" | "series";
  position: number;
  note: string | null;
  added_at: string;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
}

export interface ListDto {
  id: number;
  name: string;
  description: string | null;
  visibility: ListVisibility;
  share_id: string;
  created_at: string;
  updated_at: string;
  item_count: number;
  owner: { name: string; photo_url?: string };
  items: ListItemDto[];
}

export function getListById(id: number) {
  return prisma.list.findUnique({ where: { id }, ...listWithItems });
}

export function getListByShareId(shareId: string) {
  return prisma.list.findUnique({ where: { shareId }, ...listWithItems });
}

export function getListsOfUser(userId: number) {
  return prisma.list.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    ...listWithItems,
  });
}

/**
 * Forma pública de una lista. Con `enrich`, cada elemento lleva título, póster
 * y nota de TMDB; sin él (el índice de listas del perfil) solo los cuatro
 * primeros, que es lo que pinta la portada de cada lista.
 */
export async function toListDto(list: ListWithItems, enrich: "all" | "cover" = "all"): Promise<ListDto> {
  const toEnrich = enrich === "all" ? list.items : list.items.slice(0, 4);
  const summaries = await enrichWithTmdb(toEnrich);

  return {
    id: list.id,
    name: list.name,
    description: list.description,
    visibility: list.visibility,
    share_id: list.shareId,
    created_at: list.createdAt.toISOString(),
    updated_at: list.updatedAt.toISOString(),
    item_count: list.items.length,
    owner: {
      name: list.user.name,
      photo_url: avatarUrlFor(list.user.id, list.user.photoUrl, list.user.updatedAt),
    },
    items: toEnrich.map((item) => {
      const summary = summaries.get(`${item.itemType}:${item.tmdbId}`);
      return {
        id: item.id,
        tmdb_id: Number(item.tmdbId),
        item_type: item.itemType,
        position: item.position,
        note: item.note,
        added_at: item.addedAt.toISOString(),
        title: summary?.title ?? "",
        poster_path: summary?.poster_path ?? null,
        release_date: summary?.release_date ?? "",
        vote_average: summary?.vote_average ?? 0,
      };
    }),
  };
}

/** ¿Puede verla quien no es su dueño? */
export const isViewableByOthers = (visibility: ListVisibility) => visibility !== "PRIVATE";
