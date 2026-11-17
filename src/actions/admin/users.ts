"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { isUniqueViolation } from "@/lib/db-errors";
import { submittedValues, toFieldErrors } from "@/lib/form-utils";
import { hashPassword } from "@/lib/password";
import { idSchema } from "@/schemas/common";
import {
  adminCreateUserSchema,
  adminUpdateUserSchema,
  setUserRoleSchema,
} from "@/schemas/user";
import type { ActionResult } from "@/types";

// Toda action daqui começa com `requireAdmin()` (papel conferido no banco).
//
// Regra de segurança operacional: o admin não pode rebaixar nem excluir a
// PRÓPRIA conta. Como quem executa a ação é sempre um admin vivo (conferido no
// banco a cada chamada), isso garante que sempre reste pelo menos um admin —
// ninguém consegue trancar o sistema para fora.

function revalidateUserViews() {
  revalidatePath("/admin");
  revalidatePath("/admin/usuarios");
}

const FIX_FIELDS = "Corrija os campos destacados e tente novamente.";
const EMAIL_TAKEN = { email: ["Já existe uma conta com este e-mail"] };

/**
 * Cria um usuário. O nível é SEMPRE USUARIO: não existe campo de papel no
 * formulário e o schema descarta qualquer `role` enviado. Para torná-lo admin,
 * use `setUserRole` (ou a edição) depois.
 */
export async function createUser(
  _previousState: ActionResult<{ id: number }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: number }>> {
  await requireAdmin();
  const values = submittedValues(formData);

  const parsed = adminCreateUserSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: FIX_FIELDS,
      fieldErrors: toFieldErrors(parsed.error),
      values,
    };
  }
  const { password, phone, ...data } = parsed.data;

  try {
    const [created] = await db
      .insert(users)
      .values({
        ...data,
        role: "USUARIO",
        phone: phone ?? null,
        passwordHash: await hashPassword(password),
      })
      .returning({ id: users.id });

    revalidateUserViews();
    return { ok: true, data: { id: created.id }, message: "Usuário criado." };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, message: FIX_FIELDS, fieldErrors: EMAIL_TAKEN, values };
    }
    console.error("[admin createUser]", error);
    return {
      ok: false,
      message: "Não foi possível criar o usuário agora. Tente novamente em instantes.",
      values,
    };
  }
}

/**
 * Edita um usuário. `userId` entra por `updateUser.bind(null, id)`. A senha só
 * muda se o campo vier preenchido.
 */
export async function updateUser(
  userId: number,
  _previousState: ActionResult<{ id: number }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: number }>> {
  const admin = await requireAdmin();
  const values = submittedValues(formData);

  const parsedId = idSchema("Usuário inválido").safeParse(userId);
  if (!parsedId.success) {
    return { ok: false, message: "Usuário inválido.", values };
  }
  const id = parsedId.data;

  const parsed = adminUpdateUserSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: FIX_FIELDS,
      fieldErrors: toFieldErrors(parsed.error),
      values,
    };
  }
  const { password, phone, ...data } = parsed.data;

  if (id === admin.id && data.role !== "ADMIN") {
    return {
      ok: false,
      message: FIX_FIELDS,
      fieldErrors: {
        role: ["Você não pode remover o seu próprio acesso de administrador."],
      },
      values,
    };
  }

  try {
    const updated = await db
      .update(users)
      .set({
        ...data,
        phone: phone ?? null,
        ...(password ? { passwordHash: await hashPassword(password) } : {}),
      })
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (updated.length === 0) {
      return { ok: false, message: "Usuário não encontrado.", values };
    }

    revalidateUserViews();
    return { ok: true, data: { id }, message: "Usuário atualizado." };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, message: FIX_FIELDS, fieldErrors: EMAIL_TAKEN, values };
    }
    console.error("[admin updateUser]", error);
    return {
      ok: false,
      message: "Não foi possível salvar as alterações agora. Tente novamente em instantes.",
      values,
    };
  }
}

/**
 * Exclui um usuário (avaliações e favoritos dele vão junto; serviços que ele
 * possuía ficam sem proprietário). Campo: `id`.
 */
export async function deleteUser(
  _previousState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const parsedId = idSchema("Usuário inválido").safeParse(formData.get("id"));
  if (!parsedId.success) return { ok: false, message: "Usuário inválido." };

  if (parsedId.data === admin.id) {
    return { ok: false, message: "Você não pode excluir a sua própria conta." };
  }

  try {
    const deleted = await db
      .delete(users)
      .where(eq(users.id, parsedId.data))
      .returning({ id: users.id });

    if (deleted.length === 0) {
      return { ok: false, message: "Usuário não encontrado." };
    }

    revalidateUserViews();
    // Avaliações do usuário saíram: as notas dos serviços mudam.
    revalidatePath("/");
    return { ok: true, data: undefined, message: "Usuário excluído." };
  } catch (error) {
    console.error("[admin deleteUser]", error);
    return { ok: false, message: "Não foi possível excluir o usuário agora." };
  }
}

/**
 * Promove um usuário a ADMIN ou o rebaixa a USUARIO. Campos: `id` e `role`.
 * Só ADMIN executa (conferido no banco) e ninguém altera o PRÓPRIO nível —
 * como quem executa é sempre um admin vivo, sempre resta pelo menos um admin.
 * O efeito é imediato: `requireAdmin()` relê o papel do banco a cada requisição,
 * então a pessoa promovida já acessa `/admin` e a rebaixada perde o acesso na hora.
 */
export async function setUserRole(
  _previousState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const parsed = setUserRoleSchema.safeParse({
    id: formData.get("id"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Não foi possível alterar o nível de acesso." };
  }
  const { id, role } = parsed.data;

  if (id === admin.id) {
    return {
      ok: false,
      message: "Você não pode alterar o seu próprio nível de acesso.",
    };
  }

  try {
    const updated = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (updated.length === 0) {
      return { ok: false, message: "Usuário não encontrado." };
    }

    revalidateUserViews();
    return {
      ok: true,
      data: undefined,
      message: role === "ADMIN" ? "Agora é administrador." : "Agora é usuário.",
    };
  } catch (error) {
    console.error("[admin setUserRole]", error);
    return { ok: false, message: "Não foi possível alterar o nível de acesso agora." };
  }
}
