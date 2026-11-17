import "server-only";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import { users } from "@/db/schema";
import { readSession } from "./session";
import type { UserRole } from "./roles";

/**
 * Camada de acesso (DAL) à identidade do usuário.
 *
 * Este é o ÚNICO ponto do app que decide "quem é o usuário atual". Server
 * Actions e páginas chamam estas funções e nunca recebem `userId`/`role` do
 * cliente (qualquer valor vindo do navegador pode ser forjado).
 *
 * Duas camadas de defesa:
 *  1. `proxy.ts` faz uma checagem OTIMISTA (só o JWT) e redireciona cedo.
 *  2. Aqui fica a checagem SEGURA: além do JWT, o usuário é relido do banco, e o
 *     papel usado é o ATUAL do banco — não o gravado no token. Assim, rebaixar
 *     ou excluir um usuário vale na hora, sem esperar o token expirar.
 */

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

/**
 * Usuário logado ou `null`. `cache` deduplica a consulta dentro de uma mesma
 * requisição (header, página e actions chamam isto várias vezes).
 *
 * Lê cookies, ou seja, dado da requisição: com Cache Components, quem chama
 * precisa estar dentro de um <Suspense>.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await readSession();
  if (!session) return null;

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  // Token válido de um usuário que já não existe => sem sessão.
  return user ?? null;
});

export async function getCurrentUserId(): Promise<number | null> {
  return (await getCurrentUser())?.id ?? null;
}

/** Exige login. Sem sessão, redireciona para `/login` (com `next` se informado). */
export async function requireUser(next?: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  }
  return user;
}

/**
 * Exige papel ADMIN. Sem sessão => `/login`; logado sem permissão =>
 * `/acesso-negado`. Chame no topo de TODA página, Server Action e Route Handler
 * administrativos: ocultar um link na interface não protege nada.
 */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/acesso-negado");
  return user;
}
