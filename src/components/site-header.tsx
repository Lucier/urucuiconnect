import { MapPin } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { SearchBox } from "./search-box";
import { searchInputClass } from "./ui";
import { UserMenu, UserMenuSkeleton } from "./user-menu";

// No celular o cabeçalho (2 linhas) rola com a página, para não roubar altura da
// tela; a partir de `sm` ele fica fixo no topo.
export function SiteHeader() {
  return (
    <header className="z-30 border-b border-border bg-background/90 backdrop-blur sm:sticky sm:top-0">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-3 gap-y-2.5 px-4 py-2.5 sm:gap-x-4 sm:gap-y-3 sm:py-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="grid size-8 place-items-center rounded-xl bg-brand text-brand-foreground sm:size-9">
            <MapPin aria-hidden="true" className="size-5" />
          </span>
          <span className="text-base sm:text-lg">Uruçuí Connect</span>
        </Link>

        <div className="order-2 ml-auto sm:order-3 sm:ml-0">
          {/* Lê a sessão: fica no Suspense para o resto do cabeçalho ser estático. */}
          <Suspense fallback={<UserMenuSkeleton />}>
            <UserMenu />
          </Suspense>
        </div>

        <div className="order-3 w-full sm:order-2 sm:w-auto sm:flex-1 sm:max-w-xl">
          <Suspense
            fallback={
              <input
                aria-label="Buscar serviços"
                disabled
                placeholder="Buscar restaurante, farmácia, pousada…"
                className={searchInputClass}
              />
            }
          >
            <SearchBox />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
