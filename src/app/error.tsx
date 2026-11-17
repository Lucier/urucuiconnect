"use client";

import { CircleAlert } from "lucide-react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <CircleAlert aria-hidden="true" className="size-10 text-muted" />
      <h1 className="text-xl font-semibold">Algo deu errado</h1>
      <p className="text-muted">
        Não conseguimos carregar esta página agora. Tente novamente em alguns
        instantes.
      </p>
      <button
        type="button"
        onClick={reset}
        className="h-10 rounded-full bg-brand px-5 text-sm font-medium text-brand-foreground hover:opacity-90"
      >
        Tentar de novo
      </button>
    </main>
  );
}
