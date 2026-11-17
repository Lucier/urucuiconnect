"use client";

import { Send, Star } from "lucide-react";
import { useActionState, useState } from "react";
import { submitReview } from "@/actions/reviews";
import type { MyReview } from "@/types";
import { inputClass, primaryButtonClass } from "./ui";

export function ReviewForm({
  serviceId,
  initial,
}: {
  serviceId: number;
  /** Avaliação já enviada pelo usuário (o formulário a edita). */
  initial: MyReview | null;
}) {
  const [state, action, pending] = useActionState(submitReview, null);
  const failed = state?.ok === false ? state : null;

  const [rating, setRating] = useState(
    Number(failed?.values?.rating) || initial?.rating || 0,
  );

  return (
    <form
      action={action}
      className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-5"
    >
      <h3 className="font-semibold">
        {initial ? "Atualizar sua avaliação" : "Avalie este serviço"}
      </h3>
      <input type="hidden" name="serviceId" value={serviceId} />

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">Sua nota</legend>
        <div role="radiogroup" aria-label="Sua nota" className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} ${n === 1 ? "estrela" : "estrelas"}`}
              onClick={() => setRating(n)}
              className="rounded-md p-1.5"
            >
              <Star
                aria-hidden="true"
                className={`size-8 ${n <= rating ? "fill-amber-500 text-amber-500" : "text-border"}`}
              />
            </button>
          ))}
        </div>
        <input type="hidden" name="rating" value={rating || ""} />
        {failed?.fieldErrors?.rating && (
          <p role="alert" className="mt-1 text-sm text-red-700 dark:text-red-400">
            {failed.fieldErrors.rating[0]}
          </p>
        )}
      </fieldset>

      <div>
        <label htmlFor="comment" className="mb-1.5 block text-sm font-medium">
          Comentário <span className="font-normal text-muted">(opcional)</span>
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={3}
          maxLength={1000}
          defaultValue={failed?.values?.comment ?? initial?.comment ?? ""}
          aria-invalid={failed?.fieldErrors?.comment ? true : undefined}
          placeholder="Conte como foi sua experiência"
          className={inputClass}
        />
        {failed?.fieldErrors?.comment && (
          <p role="alert" className="mt-1 text-sm text-red-700 dark:text-red-400">
            {failed.fieldErrors.comment[0]}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          <Send aria-hidden="true" className="size-4" />
          {pending ? "Enviando…" : initial ? "Atualizar avaliação" : "Enviar avaliação"}
        </button>
        <p aria-live="polite" className="text-sm">
          {state?.ok === true && (
            <span className="text-green-700 dark:text-green-400">{state.message}</span>
          )}
          {failed && !failed.fieldErrors && (
            <span className="text-red-700 dark:text-red-400">{failed.message}</span>
          )}
        </p>
      </div>
    </form>
  );
}
