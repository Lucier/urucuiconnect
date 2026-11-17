/**
 * Níveis de acesso do app. Fica fora de `@/db` para poder ser importado por
 * Client Components e pelos schemas Zod sem arrastar o Drizzle para o navegador;
 * `db/schema.ts` usa esta mesma lista para montar o enum do Postgres.
 *
 * - ADMIN:   acessa a área administrativa (gerencia serviços e usuários).
 * - USUARIO: conta pública; favorita e avalia serviços.
 */
export const USER_ROLES = ["ADMIN", "USUARIO"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrador",
  USUARIO: "Usuário",
};

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && (USER_ROLES as readonly string[]).includes(value);
}
