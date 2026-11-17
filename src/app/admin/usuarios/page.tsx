import { Pencil, Search, ShieldCheck, ShieldOff, Trash2, UserPlus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { deleteUser, setUserRole } from "@/actions/admin/users";
import {
  PageHeader,
  RoleBadge,
  TableCard,
  tbodyClass,
  tdActionsClass,
  tdClass,
  tdTitleClass,
  theadClass,
  thClass,
  trClass,
} from "@/components/admin/page-header";
import { Pagination } from "@/components/admin/pagination";
import { RowAction } from "@/components/admin/row-action";
import {
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
  textLinkClass,
} from "@/components/ui";
import { ADMIN_PAGE_SIZE, listAdminUsers, parsePage } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { isUserRole, ROLE_LABELS, USER_ROLES } from "@/lib/roles";
import { firstParam } from "@/lib/search-params";
import { Suspense } from "react";
import { AdminPageSkeleton } from "@/components/admin/page-skeleton";

export const metadata: Metadata = { title: "Usuários" };

export default function AdminUsersPage(props: PageProps<"/admin/usuarios">) {
  return (
    <Suspense fallback={<AdminPageSkeleton />}>
      <AdminUsersPageContent {...props} />
    </Suspense>
  );
}

async function AdminUsersPageContent({
  searchParams,
}: PageProps<"/admin/usuarios">) {
  const admin = await requireAdmin();

  const params = await searchParams;
  const q = firstParam(params.q)?.trim().slice(0, 100) || undefined;
  const roleParam = firstParam(params.nivel);
  const role = isUserRole(roleParam) ? roleParam : undefined;
  const page = parsePage(firstParam(params.pagina));

  const { rows, total } = await listAdminUsers({ q, role, page });

  const hrefFor = (target: number) => {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (role) search.set("nivel", role);
    if (target > 1) search.set("pagina", String(target));
    const query = search.toString();
    return query ? `/admin/usuarios?${query}` : "/admin/usuarios";
  };
  const isFiltered = Boolean(q || role);

  return (
    <main className="mx-auto w-full max-w-5xl space-y-5 px-4 py-5 sm:space-y-6 sm:py-8">
      <PageHeader
        title="Usuários"
        description="Gerencie as contas e os níveis de acesso: administradores acessam este painel; usuários favoritam e avaliam."
        action={
          <Link href="/admin/usuarios/novo" className={`${primaryButtonClass} w-full sm:w-auto`}>
            <UserPlus aria-hidden="true" className="size-4" />
            Novo usuário
          </Link>
        }
      />

      <form
        action="/admin/usuarios"
        method="get"
        className="grid grid-cols-1 items-end gap-3 sm:flex sm:flex-wrap"
      >
        <div className="sm:min-w-48 sm:flex-1">
          <label htmlFor="q" className="mb-1.5 block text-sm font-medium">
            Buscar
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q ?? ""}
            placeholder="Nome ou e-mail…"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="nivel" className="mb-1.5 block text-sm font-medium">
            Nível de acesso
          </label>
          <select id="nivel" name="nivel" defaultValue={role ?? ""} className={inputClass}>
            <option value="">Todos</option>
            {USER_ROLES.map((value) => (
              <option key={value} value={value}>
                {ROLE_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className={secondaryButtonClass}>
          <Search aria-hidden="true" className="size-4" />
          Filtrar
        </button>
        {isFiltered && (
          <Link href="/admin/usuarios" className={`${textLinkClass} justify-center`}>
            Limpar
          </Link>
        )}
      </form>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-4 py-12 text-center text-muted">
          Nenhum usuário encontrado.
        </p>
      ) : (
        <TableCard>
          <thead className={theadClass}>
            <tr>
              <th scope="col" className={thClass}>Usuário</th>
              <th scope="col" className={thClass}>Nível</th>
              <th scope="col" className={thClass}>Telefone</th>
              <th scope="col" className={`${thClass} lg:max-xl:hidden`}>Cadastro</th>
              <th scope="col" className={`${thClass} text-right`}>Ações</th>
            </tr>
          </thead>
          <tbody className={tbodyClass}>
            {rows.map((user) => {
              const isSelf = user.id === admin.id;
              return (
                <tr key={user.id} className={trClass}>
                  <td className={tdTitleClass}>
                    <p className="font-medium">
                      {user.name}
                      {isSelf && <span className="ml-2 text-xs font-normal text-muted">(você)</span>}
                    </p>
                    <p className="text-xs text-muted">{user.email}</p>
                  </td>
                  <td className={tdClass} data-label="Nível">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className={`${tdClass} whitespace-nowrap`} data-label="Telefone">
                    {user.phone ?? "—"}
                  </td>
                  <td className={`${tdClass} whitespace-nowrap lg:max-xl:hidden`} data-label="Cadastro">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className={tdActionsClass}>
                    <div className="flex flex-wrap items-start gap-1 lg:flex-nowrap lg:justify-end">
                      <Link
                        href={`/admin/usuarios/${user.id}/editar`}
                        className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors hover:bg-brand-soft lg:h-8 lg:px-2.5 lg:text-xs"
                      >
                        <Pencil aria-hidden="true" className="size-3.5" />
                        Editar
                      </Link>
                      {/* O servidor também recusa alterar/excluir a própria conta; aqui só evitamos oferecer os botões. */}
                      {!isSelf && (
                        <RowAction
                          action={setUserRole}
                          fields={{
                            id: String(user.id),
                            role: user.role === "ADMIN" ? "USUARIO" : "ADMIN",
                          }}
                          label={user.role === "ADMIN" ? "Tornar usuário" : "Tornar admin"}
                          icon={
                            user.role === "ADMIN" ? (
                              <ShieldOff aria-hidden="true" className="size-3.5" />
                            ) : (
                              <ShieldCheck aria-hidden="true" className="size-3.5" />
                            )
                          }
                          confirmMessage={
                            user.role === "ADMIN"
                              ? `Remover o acesso de administrador de ${user.name}? Essa pessoa deixará de acessar este painel.`
                              : `Dar acesso de administrador a ${user.name}? Essa pessoa poderá gerenciar serviços e usuários.`
                          }
                        />
                      )}
                      {!isSelf && (
                        <RowAction
                          action={deleteUser}
                          fields={{ id: String(user.id) }}
                          label="Excluir"
                          tone="danger"
                          icon={<Trash2 aria-hidden="true" className="size-3.5" />}
                          confirmMessage={`Excluir a conta de ${user.name}? As avaliações e favoritos dela também serão apagados.`}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </TableCard>
      )}

      <Pagination
        page={page}
        total={total}
        pageSize={ADMIN_PAGE_SIZE}
        hrefFor={hrefFor}
      />
    </main>
  );
}
