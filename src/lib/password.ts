import bcrypt from "bcryptjs";

/**
 * Hash de senha com bcrypt (via `bcryptjs`, implementação em JS puro: não exige
 * compilar módulo nativo e gera o mesmo formato `$2a$/$2b$` do `bcrypt`).
 *
 * Custo 12 ≈ 250 ms por hash em hardware comum: caro o bastante para dificultar
 * força bruta offline, barato o bastante para o login. O bcrypt só considera os
 * primeiros 72 bytes da senha — o limite é validado em `schemas/user.ts`.
 *
 * Este módulo não importa nada do Next/Drizzle de propósito: o seed e os
 * scripts de CLI (rodados com `tsx`) também o usam.
 */
const COST = 12;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, COST);
}

/** `false` para senha errada OU hash em formato inválido (ex.: hashes legados). */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

let dummyHash: Promise<string> | undefined;

/**
 * Gasta o mesmo tempo de uma verificação real. O login chama isto quando o
 * e-mail não existe, para que a resposta não revele (pelo tempo) quais e-mails
 * têm conta.
 */
export async function burnPasswordCheck(password: string): Promise<void> {
  dummyHash ??= hashPassword("senha-inexistente-só-para-gastar-tempo");
  await bcrypt.compare(password, await dummyHash).catch(() => false);
}
