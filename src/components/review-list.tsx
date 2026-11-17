import { formatDate } from "@/lib/format";
import type { ReviewItem } from "@/types";
import { RatingStars } from "./rating-stars";

export function ReviewList({ reviews }: { reviews: ReviewItem[] }) {
  if (reviews.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-muted">
        Ainda não há avaliações. Seja a primeira pessoa a avaliar!
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {reviews.map((review) => (
        <li
          key={review.id}
          className="rounded-2xl border border-border bg-card p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium">{review.authorName}</span>
            <time
              dateTime={review.createdAt.toISOString()}
              className="text-sm text-muted"
            >
              {formatDate(review.createdAt)}
            </time>
          </div>
          <div className="mt-1">
            <RatingStars value={review.rating} />
          </div>
          {review.comment && (
            <p className="mt-2 whitespace-pre-line text-sm">{review.comment}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
