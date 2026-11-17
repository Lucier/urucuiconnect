import { LayoutDashboard, LogIn, LogOut, UserPlus } from "lucide-react";
import Link from "next/link";
import { logout } from "@/actions/auth";
import { getCurrentUser } from "@/lib/auth";

const ghostButton =
  "inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors hover:bg-brand-soft";
// Sem `px-3` do ghostButton para não depender da ordem do CSS gerado: 40x40 no celular, largura do texto a partir de `sm`.
const logoutButton =
  "inline-flex h-10 w-10 items-center justify-center gap-1.5 rounded-full text-sm font-medium transition-colors hover:bg-brand-soft sm:w-auto sm:px-3";
const solidButton =
  "inline-flex h-10 items-center gap-1.5 rounded-full bg-brand px-4 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90";

/**
 * Área de conta do cabeçalho público. Lê a sessão (dado da requisição), então
 * precisa ficar dentro de um <Suspense>: o resto do cabeçalho continua estático.
 */
export async function UserMenu() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex items-center gap-1">
        <Link href="/login" className={ghostButton}>
          {/* Celular: sem ícones em "Entrar"/"Criar", senão marca + 2 botões não cabem numa linha. */}
          <LogIn aria-hidden="true" className="hidden size-4 sm:block" />
          Entrar
        </Link>
        <Link href="/cadastro" className={solidButton}>
          <UserPlus aria-hidden="true" className="hidden size-4 sm:block" />
          <span>
            Criar<span className="hidden sm:inline"> conta</span>
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span
        className="hidden max-w-36 truncate px-2 text-sm text-muted md:inline"
        title={user.email}
      >
        Olá, {user.name.split(" ")[0]}
      </span>
      {user.role === "ADMIN" && (
        <Link href="/admin" className={solidButton}>
          <LayoutDashboard aria-hidden="true" className="size-4" />
          Painel
        </Link>
      )}
      <form action={logout}>
        {/* Celular: só o ícone (40x40), para marca + Painel + Sair caberem numa linha. */}
        <button type="submit" className={logoutButton}>
          <LogOut aria-hidden="true" className="size-4" />
          <span className="sr-only sm:not-sr-only">Sair</span>
        </button>
      </form>
    </div>
  );
}

export function UserMenuSkeleton() {
  return <div aria-hidden="true" className="h-10 w-36 animate-pulse rounded-full bg-border/60" />;
}
