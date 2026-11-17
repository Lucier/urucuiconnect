"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { favorites, services } from "@/db/schema";
import { getCurrentUserId } from "@/lib/auth";
import { selectServiceSummaries, toServiceSummary } from "@/lib/service-queries";
import { idSchema } from "@/schemas/common";
import type { ActionResult, ServiceSummary } from "@/types";

// A identidade do usuário vem SEMPRE de getCurrentUserId() (servidor). Nenhuma
// action aqui aceita `userId` do cliente.

/**
 * Favorita o serviço se ainda não for favorito; caso contrário, desfavorita.
 * Devolve o estado final, para o botão refletir o resultado.
 */
export async function toggleFavorite(
  serviceId: number,
): Promise<ActionResult<{ isFavorite: boolean }>> {
  const parsedId = idSchema("Serviço inválido").safeParse(serviceId);
  if (!parsedId.success) {
    return { ok: false, message: "Serviço inválido." };
  }
  const id = parsedId.data;

  const userId = await getCurrentUserId();
  if (userId === null) {
    return { ok: false, message: "Entre na sua conta para favoritar serviços." };
  }

  try {
    const removed = await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.serviceId, id)))
      .returning({ id: favorites.id });

    let isFavorite = false;

    if (removed.length === 0) {
      const [service] = await db
        .select({ id: services.id })
        .from(services)
        .where(and(eq(services.id, id), eq(services.isActive, true)))
        .limit(1);

      if (!service) {
        return { ok: false, message: "Serviço não encontrado." };
      }

      // onConflictDoNothing: dois cliques simultâneos não geram erro de duplicidade.
      await db
        .insert(favorites)
        .values({ userId, serviceId: id })
        .onConflictDoNothing();
      isFavorite = true;
    }

    revalidatePath(`/servicos/${id}`);

    return { ok: true, data: { isFavorite } };
  } catch (error) {
    console.error("[toggleFavorite]", error);
    return {
      ok: false,
      message: "Não foi possível atualizar seus favoritos. Tente novamente.",
    };
  }
}

/** O usuário atual favoritou este serviço? Sem sessão, `false`. */
export async function isFavorite(serviceId: number): Promise<boolean> {
  const parsedId = idSchema().safeParse(serviceId);
  if (!parsedId.success) return false;

  const userId = await getCurrentUserId();
  if (userId === null) return false;

  const [row] = await db
    .select({ id: favorites.id })
    .from(favorites)
    .where(
      and(eq(favorites.userId, userId), eq(favorites.serviceId, parsedId.data)),
    )
    .limit(1);

  return row !== undefined;
}

/** Serviços favoritados pelo usuário atual (mais recentes primeiro). Sem sessão, lista vazia. */
export async function listFavorites(): Promise<ServiceSummary[]> {
  const userId = await getCurrentUserId();
  if (userId === null) return [];

  const rows = await selectServiceSummaries()
    .innerJoin(favorites, eq(favorites.serviceId, services.id))
    .where(and(eq(favorites.userId, userId), eq(services.isActive, true)))
    .orderBy(desc(favorites.createdAt), desc(favorites.id));

  return rows.map(toServiceSummary);
}
