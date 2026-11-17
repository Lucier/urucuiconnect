import "server-only";
import { jwtVerify, SignJWT } from "jose";
import { isUserRole, type UserRole } from "./roles";

/**
 * Emissão e verificação do token de sessão (JWT assinado com HS256).
 *
 * Fica separado de `session.ts` (cookies) para que o `proxy.ts` possa verificar
 * o token a partir de `request.cookies` sem depender de `next/headers`.
 *
 * O payload leva só o mínimo: `sub` (id do usuário) e `role`. Nada de e-mail,
 * telefone ou outros dados pessoais — o JWT é assinado, NÃO criptografado, então
 * qualquer um com o cookie consegue ler o conteúdo.
 */

export const SESSION_COOKIE = "uc_session";
/** Validade do token e do cookie: 7 dias. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const ISSUER = "urucuiconnect";
const AUDIENCE = "urucuiconnect:web";

export type SessionClaims = {
  userId: number;
  /**
   * Papel gravado no momento do login. Serve para checagens otimistas (proxy);
   * decisões de segurança usam o papel atual do banco (ver `getCurrentUser`).
   */
  role: UserRole;
};

/** Chave HMAC. Falha alto se o segredo faltar: sem ele ninguém deve logar. */
function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET ausente ou curta demais (mínimo 32 caracteres). " +
        "Gere uma com `openssl rand -base64 48` e coloque em .env.local.",
    );
  }
  return new TextEncoder().encode(secret);
}

export function signSessionToken({ userId, role }: SessionClaims): Promise<string> {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

/** Devolve as claims se o token for válido e não expirado; senão, `null`. */
export async function verifySessionToken(
  token: string | undefined,
): Promise<SessionClaims | null> {
  if (!token) return null;

  // Fora do try/catch: segredo mal configurado deve estourar, não deslogar todo mundo em silêncio.
  const key = secretKey();

  try {
    const { payload } = await jwtVerify(token, key, {
      // Fixa o algoritmo: impede ataques de "alg confusion" (ex.: alg=none).
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE,
    });

    const userId = Number(payload.sub);
    if (!Number.isInteger(userId) || userId <= 0) return null;
    if (!isUserRole(payload.role)) return null;

    return { userId, role: payload.role };
  } catch {
    // Assinatura inválida, expirado, malformado...
    return null;
  }
}
