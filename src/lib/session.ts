import "server-only";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  signSessionToken,
  verifySessionToken,
  type SessionClaims,
} from "./jwt";

/**
 * Sessão sem estado: o JWT vive num cookie httpOnly (o JavaScript do navegador
 * não consegue lê-lo, o que limita o estrago de um XSS). Só pode ser criado e
 * apagado em Server Actions / Route Handlers.
 */

export async function createSession(user: {
  id: number;
  role: SessionClaims["role"];
}): Promise<void> {
  const token = await signSessionToken({ userId: user.id, role: user.role });

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    // Em dev (http://localhost) o cookie Secure não seria enviado por alguns navegadores.
    secure: process.env.NODE_ENV === "production",
    // Lax: o cookie não viaja em POSTs de outros sites (proteção contra CSRF),
    // mas segue em links normais para o app.
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function deleteSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Claims do token do cookie (só assinatura/validade — não consulta o banco). */
export async function readSession(): Promise<SessionClaims | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}
