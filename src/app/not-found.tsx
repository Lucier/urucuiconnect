import { SearchX } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <SearchX aria-hidden="true" className="size-10 text-muted" />
      <h1 className="text-xl font-semibold">Página não encontrada</h1>
      <p className="text-muted">
        Esse serviço não existe ou foi removido do guia.
      </p>
      <Link
        href="/"
        className="inline-flex h-10 items-center rounded-full bg-brand px-5 text-sm font-medium text-brand-foreground hover:opacity-90"
      >
        Voltar para o início
      </Link>
    </main>
  );
}
