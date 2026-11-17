import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/jwt";

/**
 * Proxy (o antigo "middleware" do Next): checagem OTIMISTA de login na área
 * administrativa, antes de qualquer renderização. Visitantes sem token válido
 * vão para `/login?next=...` sem sequer chegar à página.
 *
 * Só lê o JWT do cookie — sem consultar o banco, já que o proxy roda em toda
 * requisição, inclusive prefetch. Por isso NÃO decide o papel: o `role` do
 * token é uma foto do momento do login e fica velho quando um admin promove
 * alguém (o token só é renovado ao relogar). Quem decide é `requireAdmin()`
 * (src/lib/auth.ts), chamado por toda página, Server Action e Route Handler de
 * `/admin`, que confere o papel ATUAL no banco e leva quem não é admin para
 * `/acesso-negado`.
 *
 * As páginas /login e /cadastro também não são redirecionadas daqui: um token
 * válido de um usuário já excluído prenderia a pessoa fora do login até o token
 * expirar. Essas páginas conferem a sessão no banco por conta própria.
 */
export async function proxy(request: NextRequest) {
  const session = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  );

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    const { pathname, search } = request.nextUrl;
    loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
