import { ExternalLink, LogOut } from "lucide-react";
import Link from "next/link";
import { logout } from "@/actions/auth";
import { getCurrentUser } from "@/lib/auth";

// Celular: só o ícone (40x40). md+: ícone + texto, ocupando a largura do menu lateral.
const action =
  "flex size-10 items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors hover:bg-brand-soft md:h-10 md:w-full md:justify-start md:px-3";
const label = "sr-only md:not-sr-only";

/** Quem está logado + "Ver site" e "Sair". Lê a sessão, então fica dentro de <Suspense>. */
export async function AdminAccount() {
  const user = await getCurrentUser();

  return (
    <div className="flex items-center gap-1 text-sm md:flex-col md:items-stretch md:gap-2">
      {user && (
        <p className="hidden truncate px-3 text-muted md:block" title={user.email}>
          {user.name}
        </p>
      )}
      <Link href="/" className={action}>
        <ExternalLink aria-hidden="true" className="size-4" />
        <span className={label}>Ver site</span>
      </Link>
      <form action={logout} className="md:w-full">
        <button type="submit" className={action}>
          <LogOut aria-hidden="true" className="size-4" />
          <span className={label}>Sair</span>
        </button>
      </form>
    </div>
  );
}
