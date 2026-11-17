import { ShieldAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Acesso negado",
  // Página de erro de permissão: não faz sentido aparecer em buscadores.
  robots: { index: false },
};

export default function ForbiddenPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <ShieldAlert aria-hidden="true" className="size-10 text-muted" />
      <h1 className="text-xl font-semibold">Acesso negado</h1>
      <p className="text-muted">
        Sua conta não tem permissão para acessar esta área. Ela é exclusiva para
        administradores.
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
