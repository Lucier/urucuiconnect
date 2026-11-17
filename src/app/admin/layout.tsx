import { MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminAccount } from "@/components/admin/admin-account";
import { AdminNav, AdminNavFallback } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  title: { default: "Administração", template: "%s · Admin · Uruçuí Connect" },
  // Área restrita: fora de buscadores.
  robots: { index: false, follow: false },
};

/**
 * Casca da área administrativa. É só apresentação: quem protege os dados é
 * `requireAdmin()` em cada página e Server Action — um layout não re-renderiza
 * a cada navegação e não impede o acesso às rotas filhas.
 *
 * Responsivo, com um único DOM:
 *  - celular: barra superior compacta (marca + "Ver site"/"Sair" só com ícone)
 *    e navegação em abas FIXAS NA BASE da tela, ao alcance do polegar;
 *  - a partir de `md`: menu lateral (marca, navegação, conta embaixo).
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <aside className="sticky top-0 z-30 border-b border-border bg-card md:static md:w-60 md:shrink-0 md:border-r md:border-b-0">
        <div className="flex items-center gap-2 px-3 py-2 md:sticky md:top-0 md:min-h-screen md:flex-col md:items-stretch md:gap-4 md:p-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 font-semibold tracking-tight md:order-1"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-brand text-brand-foreground">
              <MapPin aria-hidden="true" className="size-5" />
            </span>
            <span className="leading-tight">
              Uruçuí Connect
              <span className="block text-xs font-normal text-muted">
                Administração
              </span>
            </span>
          </Link>

          {/* usePathname() é dado da requisição: o fallback mostra os mesmos links, sem destaque. */}
          <Suspense fallback={<AdminNavFallback />}>
            <AdminNav />
          </Suspense>

          <div className="ml-auto md:order-3 md:ml-0 md:mt-auto">
            <Suspense fallback={<div aria-hidden="true" className="h-10 md:h-24" />}>
              <AdminAccount />
            </Suspense>
          </div>
        </div>
      </aside>

      {/* pb-24: no celular, deixa o fim do conteúdo livre da barra de abas fixa. */}
      <div className="min-w-0 flex-1 pb-24 md:pb-0">{children}</div>
    </div>
  );
}
