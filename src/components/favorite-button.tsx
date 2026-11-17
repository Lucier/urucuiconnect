"use client";

import { Heart } from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";
import { toggleFavorite } from "@/actions/favorites";
import { secondaryButtonClass } from "./ui";

export function FavoriteButton({
  serviceId,
  initialIsFavorite,
}: {
  serviceId: number;
  initialIsFavorite: boolean;
}) {
  // Troca na hora; se a action falhar ou terminar, volta ao valor real vindo do servidor.
  const [isFavorite, setOptimistic] = useOptimistic(initialIsFavorite);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      setOptimistic(!isFavorite);
      const result = await toggleFavorite(serviceId);
      if (!result.ok) setError(result.message);
    });
  }

  return (
    <div className="flex w-full flex-col gap-1 sm:w-auto">
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={isFavorite}
        disabled={pending}
        className={`${secondaryButtonClass} w-full sm:w-auto`}
      >
        <Heart
          aria-hidden="true"
          className={`size-4 ${isFavorite ? "fill-red-600 text-red-600" : ""}`}
        />
        {isFavorite ? "Favoritado" : "Favoritar"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
