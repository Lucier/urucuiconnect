/**
 * Violação de UNIQUE do Postgres (SQLSTATE 23505). O Drizzle embrulha o erro do
 * driver em `error.cause`, então percorremos a cadeia.
 */
export function isUniqueViolation(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current; depth++) {
    if (
      typeof current === "object" &&
      (current as { code?: unknown }).code === "23505"
    ) {
      return true;
    }
    current = (current as { cause?: unknown }).cause;
  }
  return false;
}
