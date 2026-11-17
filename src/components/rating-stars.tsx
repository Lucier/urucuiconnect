import { Star } from "lucide-react";

/** Estrelas somente leitura. `value` nulo = ainda sem avaliações. */
export function RatingStars({
  value,
  reviewCount,
  className = "size-4",
}: {
  value: number | null;
  reviewCount?: number;
  className?: string;
}) {
  if (value === null) {
    return <span className="text-sm text-muted">Sem avaliações</span>;
  }

  const filled = Math.round(value);
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        role="img"
        aria-label={`Nota ${value.toFixed(1).replace(".", ",")} de 5`}
        className="inline-flex"
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            aria-hidden="true"
            className={`${className} ${n <= filled ? "fill-amber-500 text-amber-500" : "text-border"}`}
          />
        ))}
      </span>
      <span className="text-sm font-medium">
        {value.toFixed(1).replace(".", ",")}
      </span>
      {reviewCount !== undefined && (
        <span className="text-sm text-muted">({reviewCount})</span>
      )}
    </span>
  );
}
