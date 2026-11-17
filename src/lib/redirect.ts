/**
 * Valida o destino pós-login vindo da query string (`/login?next=...`).
 * Só aceita caminhos internos; qualquer outra coisa cai em `fallback`. Sem isso,
 * `?next=https://site-malicioso.com` viraria um "open redirect" para phishing.
 */
export function safeRedirectPath(
  value: string | null | undefined,
  fallback = "/",
): string {
  if (!value) return fallback;
  // Precisa começar com uma única "/": rejeita "//host" e "/\host" (tratados
  // como URL externa por alguns navegadores) e caracteres de controle.
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  if (/[\u0000-\u001f\u007f]/.test(value)) return fallback;
  return value;
}
