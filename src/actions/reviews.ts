"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { reviews, services, users } from "@/db/schema";
import { getCurrentUserId } from "@/lib/auth";
import { submittedValues, toFieldErrors } from "@/lib/form-utils";
import { idSchema } from "@/schemas/common";
import { createReviewSchema } from "@/schemas/review";
import type { ActionResult, MyReview, ReviewItem } from "@/types";

/** "Maria da Silva Souza" => "Maria S." */
function shortName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

/** Avaliações de um serviço, mais recentes primeiro. */
export async function listReviews(
  serviceId: number,
  limit = 50,
): Promise<ReviewItem[]> {
  const parsedId = idSchema().safeParse(serviceId);
  if (!parsedId.success) return [];
  const safeLimit = Math.min(Math.max(Math.trunc(limit) || 50, 1), 100);

  const rows = await db
    .select({
      id: reviews.id,
      authorName: users.name,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.serviceId, parsedId.data))
    .orderBy(desc(reviews.createdAt), desc(reviews.id))
    .limit(safeLimit);

  return rows.map((row) => ({ ...row, authorName: shortName(row.authorName) }));
}

/** A avaliação do usuário atual para este serviço (para pré-preencher o formulário). */
export async function getMyReview(serviceId: number): Promise<MyReview | null> {
  const parsedId = idSchema().safeParse(serviceId);
  if (!parsedId.success) return null;

  const userId = await getCurrentUserId();
  if (userId === null) return null;

  const [row] = await db
    .select({ rating: reviews.rating, comment: reviews.comment })
    .from(reviews)
    .where(
      and(eq(reviews.userId, userId), eq(reviews.serviceId, parsedId.data)),
    )
    .limit(1);

  return row ?? null;
}

/**
 * Envia (ou atualiza) a avaliação do usuário atual. Assinatura compatível com
 * `useActionState`. Regras: precisa estar logado; o serviço precisa existir e
 * estar ativo; o proprietário não avalia o próprio serviço; vale uma avaliação
 * por usuário por serviço (reenviar substitui nota e comentário).
 */
export async function submitReview(
  _previousState: ActionResult<{ updated: boolean }> | null,
  formData: FormData,
): Promise<ActionResult<{ updated: boolean }>> {
  const values = submittedValues(formData);

  const parsed = createReviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: "Corrija os campos destacados e tente novamente.",
      fieldErrors: toFieldErrors(parsed.error),
      values,
    };
  }
  const { serviceId, rating, comment } = parsed.data;

  const userId = await getCurrentUserId();
  if (userId === null) {
    return {
      ok: false,
      message: "Entre na sua conta para avaliar este serviço.",
      values,
    };
  }

  try {
    const [service] = await db
      .select({ id: services.id, ownerId: services.ownerId })
      .from(services)
      .where(and(eq(services.id, serviceId), eq(services.isActive, true)))
      .limit(1);

    if (!service) {
      return { ok: false, message: "Serviço não encontrado.", values };
    }
    if (service.ownerId === userId) {
      return {
        ok: false,
        message: "Você não pode avaliar o seu próprio serviço.",
        values,
      };
    }

    const [existing] = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(and(eq(reviews.userId, userId), eq(reviews.serviceId, serviceId)))
      .limit(1);

    await db
      .insert(reviews)
      .values({ userId, serviceId, rating, comment: comment ?? null })
      .onConflictDoUpdate({
        target: [reviews.userId, reviews.serviceId],
        set: { rating, comment: comment ?? null },
      });

    // Atualiza a página do serviço e a home (a nota aparece nos cards).
    revalidatePath(`/servicos/${serviceId}`);
    revalidatePath("/");

    const updated = existing !== undefined;
    return {
      ok: true,
      data: { updated },
      message: updated
        ? "Avaliação atualizada. Obrigado!"
        : "Avaliação enviada. Obrigado!",
    };
  } catch (error) {
    console.error("[submitReview]", error);
    return {
      ok: false,
      message: "Não foi possível enviar sua avaliação agora. Tente novamente.",
      values,
    };
  }
}
