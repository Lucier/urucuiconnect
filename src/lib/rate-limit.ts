import "server-only";

/**
 * Limitador de tentativas em memória (janela fixa), usado no login para frear
 * força bruta. Limitações assumidas:
 *  - vale por instância do servidor; com várias instâncias/serverless, troque
 *    por um armazenamento compartilhado (Redis, por exemplo);
 *  - o IP vem de `x-forwarded-for`, confiável apenas atrás de um proxy seu.
 */

type Bucket = { count: number; resetAt: number };

const globalForLimit = globalThis as unknown as {
  rateLimitBuckets?: Map<string, Bucket>;
};
const buckets = (globalForLimit.rateLimitBuckets ??= new Map<string, Bucket>());

function prune(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Conta uma tentativa em `key`. `allowed` é falso quando a tentativa excede
 * `limit` dentro da janela de `windowMs`.
 */
export function hitRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (buckets.size > 5000) prune(now);

  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }
  bucket.count += 1;

  return {
    allowed: bucket.count <= limit,
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}
