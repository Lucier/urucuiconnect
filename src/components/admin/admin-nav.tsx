"use client";

import { LayoutDashboard, Store, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Painel", icon: LayoutDashboard, exact: true },
  { href: "/admin/servicos", label: "Serviços", icon: Store, exact: false },
  { href: "/admin/usuarios", label: "Usuários", icon: Users, exact: false },
] as const;

function NavLinks({ pathname }: { pathname: string | null }) {
  return (
    // Celular: abas fixas na base da tela. md+: coluna dentro do menu lateral.
    <nav
      aria-label="Administração"
      className="fixed inset-x-0 bottom-0 z-30 flex gap-1 border-t border-border bg-card p-1.5 md:static md:order-2 md:flex-col md:border-0 md:bg-transparent md:p-0"
    >
      {ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const active =
          pathname !== null &&
          (exact
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-xs font-medium transition-colors md:h-10 md:min-h-0 md:flex-none md:flex-row md:justify-start md:gap-2 md:px-3 md:text-sm ${
              active
                ? "bg-brand-soft text-brand md:bg-brand md:text-brand-foreground"
                : "text-muted hover:bg-brand-soft md:text-foreground"
            }`}
          >
            <Icon aria-hidden="true" className="size-5 md:size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Menu com a página atual destacada. Lê a URL, então precisa ficar dentro de <Suspense>. */
export function AdminNav() {
  return <NavLinks pathname={usePathname()} />;
}

/** Mesmo menu sem destaque, para o fallback do <Suspense> (renderizado sem ler a URL). */
export function AdminNavFallback() {
  return <NavLinks pathname={null} />;
}
