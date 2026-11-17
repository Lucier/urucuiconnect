"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { categories, services } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { submittedValues, toFieldErrors } from "@/lib/form-utils";
import { idSchema } from "@/schemas/common";
import { createServiceSchema, type CreateServiceData } from "@/schemas/service";
import type { ActionResult } from "@/types";

// Toda action daqui começa com `requireAdmin()`: um export de arquivo
// 'use server' é um endpoint POST público, e esconder o botão na interface não
// impede ninguém de chamá-lo. A identidade e o papel vêm do servidor (JWT + banco).

/** Páginas que mostram serviços e precisam refletir uma alteração. */
function revalidateServiceViews(serviceId?: number) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/servicos");
  if (serviceId !== undefined) revalidatePath(`/servicos/${serviceId}`);
}

const FIX_FIELDS = "Corrija os campos destacados e tente novamente.";

async function categoryExists(categoryId: number) {
  const [category] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1);
  return category !== undefined;
}

/** Valores validados -> colunas. Campo em branco vira NULL (undefined seria ignorado pelo UPDATE). */
function toColumns(data: CreateServiceData) {
  return {
    categoryId: data.categoryId,
    name: data.name,
    description: data.description,
    phone: data.phone ?? null,
    whatsapp: data.whatsapp ?? null,
    subcategory: data.subcategory ?? null,
    addressStreet: data.addressStreet ?? null,
    addressNeighborhood: data.addressNeighborhood ?? null,
    addressNumber: data.addressNumber ?? null,
    referencePoint: data.referencePoint ?? null,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    openTime: data.openTime ?? null,
    closeTime: data.closeTime ?? null,
    isOpen24h: data.isOpen24h,
    coverImage: data.coverImage ?? null,
  };
}

/**
 * Cadastra um serviço. Assinatura compatível com `useActionState`.
 * O checkbox `isActive` define se já nasce visível no site.
 */
export async function createService(
  _previousState: ActionResult<{ id: number }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: number }>> {
  await requireAdmin();
  const values = submittedValues(formData);

  const parsed = createServiceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: FIX_FIELDS,
      fieldErrors: toFieldErrors(parsed.error),
      values,
    };
  }

  try {
    if (!(await categoryExists(parsed.data.categoryId))) {
      return {
        ok: false,
        message: FIX_FIELDS,
        fieldErrors: { categoryId: ["Categoria não encontrada"] },
        values,
      };
    }

    const [created] = await db
      .insert(services)
      .values({
        ...toColumns(parsed.data),
        isActive: formData.get("isActive") === "on",
        // Serviços cadastrados pelo admin não têm proprietário vinculado.
        ownerId: null,
      })
      .returning({ id: services.id });

    revalidateServiceViews(created.id);
    return {
      ok: true,
      data: { id: created.id },
      message: "Serviço cadastrado com sucesso!",
    };
  } catch (error) {
    console.error("[admin createService]", error);
    return {
      ok: false,
      message: "Não foi possível cadastrar o serviço agora. Tente novamente em instantes.",
      values,
    };
  }
}

/**
 * Edita um serviço. O `serviceId` entra por `updateService.bind(null, id)` na
 * página (o Next protege argumentos vinculados contra adulteração), e é
 * revalidado aqui mesmo assim.
 */
export async function updateService(
  serviceId: number,
  _previousState: ActionResult<{ id: number }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: number }>> {
  await requireAdmin();
  const values = submittedValues(formData);

  const parsedId = idSchema("Serviço inválido").safeParse(serviceId);
  if (!parsedId.success) {
    return { ok: false, message: "Serviço inválido.", values };
  }
  const id = parsedId.data;

  const parsed = createServiceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: FIX_FIELDS,
      fieldErrors: toFieldErrors(parsed.error),
      values,
    };
  }

  try {
    if (!(await categoryExists(parsed.data.categoryId))) {
      return {
        ok: false,
        message: FIX_FIELDS,
        fieldErrors: { categoryId: ["Categoria não encontrada"] },
        values,
      };
    }

    const updated = await db
      .update(services)
      .set({
        ...toColumns(parsed.data),
        isActive: formData.get("isActive") === "on",
      })
      .where(eq(services.id, id))
      .returning({ id: services.id });

    if (updated.length === 0) {
      return { ok: false, message: "Serviço não encontrado.", values };
    }

    revalidateServiceViews(id);
    return { ok: true, data: { id }, message: "Serviço atualizado." };
  } catch (error) {
    console.error("[admin updateService]", error);
    return {
      ok: false,
      message: "Não foi possível salvar as alterações agora. Tente novamente em instantes.",
      values,
    };
  }
}

/** Mostra ou oculta um serviço no site, sem apagá-lo. Campos: `id` e `active` ("true"/"false"). */
export async function setServiceActive(
  _previousState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const parsedId = idSchema("Serviço inválido").safeParse(formData.get("id"));
  if (!parsedId.success) return { ok: false, message: "Serviço inválido." };
  const active = formData.get("active") === "true";

  try {
    const updated = await db
      .update(services)
      .set({ isActive: active })
      .where(eq(services.id, parsedId.data))
      .returning({ id: services.id });

    if (updated.length === 0) {
      return { ok: false, message: "Serviço não encontrado." };
    }

    revalidateServiceViews(parsedId.data);
    return {
      ok: true,
      data: undefined,
      message: active ? "Serviço ativado." : "Serviço ocultado do site.",
    };
  } catch (error) {
    console.error("[admin setServiceActive]", error);
    return { ok: false, message: "Não foi possível alterar o serviço agora." };
  }
}

/** Exclui o serviço em definitivo (avaliações e favoritos vão junto, por cascata). Campo: `id`. */
export async function deleteService(
  _previousState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const parsedId = idSchema("Serviço inválido").safeParse(formData.get("id"));
  if (!parsedId.success) return { ok: false, message: "Serviço inválido." };

  try {
    const deleted = await db
      .delete(services)
      .where(eq(services.id, parsedId.data))
      .returning({ id: services.id });

    if (deleted.length === 0) {
      return { ok: false, message: "Serviço não encontrado." };
    }

    revalidateServiceViews(parsedId.data);
    return { ok: true, data: undefined, message: "Serviço excluído." };
  } catch (error) {
    console.error("[admin deleteService]", error);
    return { ok: false, message: "Não foi possível excluir o serviço agora." };
  }
}
