"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { isUniqueViolation } from "@/lib/db-errors";
import { submittedValues, toFieldErrors } from "@/lib/form-utils";
import { burnPasswordCheck, hashPassword, verifyPassword } from "@/lib/password";
import { hitRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { safeRedirectPath } from "@/lib/redirect";
import type { UserRole } from "@/lib/roles";
import { createSession, deleteSession } from "@/lib/session";
import { loginSchema, registerSchema } from "@/schemas/user";
import type { ActionResult } from "@/types";

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

/** IP do cliente (confiável só atrás de um proxy que defina x-forwarded-for). */
async function clientIp() {
  const forwarded = (await headers()).get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "desconhecido";
}

/**
 * Login com e-mail e senha. Assinatura compatível com `useActionState`.
 * Em caso de sucesso grava o cookie com o JWT e redireciona (por isso nunca
 * devolve `ok: true`).
 */
export async function login(
  _previousState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const values = submittedValues(formData);

  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: "Confira os campos e tente novamente.",
      fieldErrors: toFieldErrors(parsed.error),
      values,
    };
  }
  const { email, password, next } = parsed.data;

  // Freio de força bruta: um balde por IP+e-mail (5) e outro só por IP (30).
  // O de IP+e-mail impede que um atacante bloqueie o e-mail de outra pessoa.
  const ip = await clientIp();
  const credentialKey = `login:${ip}:${email}`;
  const attemptsByCredential = hitRateLimit(credentialKey, 5, FIFTEEN_MINUTES);
  const attemptsByIp = hitRateLimit(`login:${ip}`, 30, FIFTEEN_MINUTES);
  if (!attemptsByCredential.allowed || !attemptsByIp.allowed) {
    const seconds = Math.max(
      attemptsByCredential.allowed ? 0 : attemptsByCredential.retryAfterSeconds,
      attemptsByIp.allowed ? 0 : attemptsByIp.retryAfterSeconds,
    );
    return {
      ok: false,
      message: `Muitas tentativas de login. Tente novamente em ${Math.ceil(seconds / 60)} min.`,
      values,
    };
  }

  const invalidCredentials: ActionResult = {
    ok: false,
    // Mesma mensagem para "e-mail inexistente" e "senha errada": não revela quais e-mails têm conta.
    message: "E-mail ou senha incorretos.",
    values,
  };

  let user: { id: number; role: UserRole; passwordHash: string } | undefined;
  try {
    [user] = await db
      .select({
        id: users.id,
        role: users.role,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      await burnPasswordCheck(password);
      return invalidCredentials;
    }
    if (!(await verifyPassword(password, user.passwordHash))) {
      return invalidCredentials;
    }
  } catch (error) {
    console.error("[login]", error);
    return {
      ok: false,
      message: "Não foi possível entrar agora. Tente novamente em instantes.",
      values,
    };
  }

  resetRateLimit(credentialKey);
  await createSession({ id: user.id, role: user.role });

  // redirect() lança uma exceção interna: precisa ficar fora de try/catch.
  redirect(safeRedirectPath(next, user.role === "ADMIN" ? "/admin" : "/"));
}

/**
 * Cadastro público. Sempre cria um USUARIO — o papel nunca vem do formulário.
 * Já entra logado em seguida.
 */
export async function register(
  _previousState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const values = submittedValues(formData);

  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: "Corrija os campos destacados e tente novamente.",
      fieldErrors: toFieldErrors(parsed.error),
      values,
    };
  }
  const { name, email, phone, password } = parsed.data;

  // Limita criação em massa de contas a partir do mesmo IP.
  const signups = hitRateLimit(`register:${await clientIp()}`, 10, ONE_HOUR);
  if (!signups.allowed) {
    return {
      ok: false,
      message: "Muitos cadastros a partir desta conexão. Tente novamente mais tarde.",
      values,
    };
  }

  let created: { id: number; role: UserRole };
  try {
    [created] = await db
      .insert(users)
      .values({
        name,
        email,
        phone: phone ?? null,
        passwordHash: await hashPassword(password),
        role: "USUARIO",
      })
      .returning({ id: users.id, role: users.role });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        ok: false,
        message: "Corrija os campos destacados e tente novamente.",
        fieldErrors: { email: ["Já existe uma conta com este e-mail"] },
        values,
      };
    }
    console.error("[register]", error);
    return {
      ok: false,
      message: "Não foi possível criar sua conta agora. Tente novamente em instantes.",
      values,
    };
  }

  await createSession(created);
  redirect("/");
}

/** Encerra a sessão (apaga o cookie). Use como `<form action={logout}>`: é POST, não link. */
export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/");
}
