import { Eye, EyeOff, Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { listCategories } from "@/actions/categories";
import { deleteService, setServiceActive } from "@/actions/admin/services";
import {
  PageHeader,
  StatusBadge,
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
import {
  ADMIN_PAGE_SIZE,
  listAdminServices,
  parsePage,
  parseStatus,
} from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { firstParam } from "@/lib/search-params";
import { Suspense } from "react";
import { AdminPageSkeleton } from "@/components/admin/page-skeleton";

export const metadata: Metadata = { title: "Serviços" };

export default function AdminServicesPage(props: PageProps<"/admin/servicos">) {
  return (
    <Suspense fallback={<AdminPageSkeleton />}>
      <AdminServicesPageContent {...props} />
    </Suspense>
  );
}

async function AdminServicesPageContent({
  searchParams,
}: PageProps<"/admin/servicos">) {
  await requireAdmin();

  const params = await searchParams;
  const q = firstParam(params.q)?.trim().slice(0, 100) || undefined;
  const categoria = Number(firstParam(params.categoria)) || undefined;
  const status = parseStatus(firstParam(params.status));
  const page = parsePage(firstParam(params.pagina));

  const [{ rows, total }, categories] = await Promise.all([
    listAdminServices({ q, categoryId: categoria, status, page }),
    listCategories(),
  ]);

  const hrefFor = (target: number) => {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (categoria) search.set("categoria", String(categoria));
    if (status !== "todos") search.set("status", status);
    if (target > 1) search.set("pagina", String(target));
    const query = search.toString();
    return query ? `/admin/servicos?${query}` : "/admin/servicos";
  };
  const isFiltered = Boolean(q || categoria || status !== "todos");

  return (
    <main className="mx-auto w-full max-w-5xl space-y-5 px-4 py-5 sm:space-y-6 sm:py-8">
      <PageHeader
        title="Serviços"
        description="Cadastre, edite, oculte ou exclua os serviços exibidos no site."
        action={
          <Link href="/admin/servicos/novo" className={`${primaryButtonClass} w-full sm:w-auto`}>
            <Plus aria-hidden="true" className="size-4" />
            Novo serviço
          </Link>
        }
      />

      {/* Filtros em GET: funcionam sem JavaScript e deixam a URL compartilhável. */}
      <form
        action="/admin/servicos"
        method="get"
        className="grid grid-cols-2 items-end gap-3 sm:flex sm:flex-wrap"
      >
        <div className="col-span-2 sm:min-w-48 sm:flex-1">
          <label htmlFor="q" className="mb-1.5 block text-sm font-medium">
            Buscar
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q ?? ""}
            placeholder="Nome, tipo, bairro…"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="categoria" className="mb-1.5 block text-sm font-medium">
            Categoria
          </label>
          <select
            id="categoria"
            name="categoria"
            defaultValue={categoria ?? ""}
            className={inputClass}
          >
            <option value="">Todas</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" className="mb-1.5 block text-sm font-medium">
            Situação
          </label>
          <select id="status" name="status" defaultValue={status} className={inputClass}>
            <option value="todos">Todos</option>
            <option value="ativos">Ativos</option>
            <option value="inativos">Ocultos</option>
          </select>
        </div>
        <button type="submit" className={`${secondaryButtonClass} col-span-2 sm:col-auto`}>
          <Search aria-hidden="true" className="size-4" />
          Filtrar
        </button>
        {isFiltered && (
          <Link href="/admin/servicos" className={`${textLinkClass} col-span-2 justify-center sm:col-auto`}>
            Limpar
          </Link>
        )}
      </form>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-4 py-12 text-center text-muted">
          {isFiltered
            ? "Nenhum serviço encontrado com esses filtros."
            : "Nenhum serviço cadastrado ainda."}
        </p>
      ) : (
        <TableCard>
          <thead className={theadClass}>
            <tr>
              <th scope="col" className={thClass}>Serviço</th>
              <th scope="col" className={thClass}>Categoria</th>
              <th scope="col" className={thClass}>Situação</th>
              <th scope="col" className={`${thClass} lg:max-xl:hidden`}>Cadastro</th>
              <th scope="col" className={`${thClass} text-right`}>Ações</th>
            </tr>
          </thead>
          <tbody className={tbodyClass}>
            {rows.map((service) => (
              <tr key={service.id} className={trClass}>
                <td className={tdTitleClass}>
                  <p className="font-medium">{service.name}</p>
                  {service.neighborhood && (
                    <p className="text-xs text-muted">{service.neighborhood}</p>
                  )}
                </td>
                <td className={tdClass} data-label="Categoria">
                  {service.categoryName}
                </td>
                <td className={tdClass} data-label="Situação">
                  <StatusBadge active={service.isActive} />
                </td>
                <td className={`${tdClass} whitespace-nowrap lg:max-xl:hidden`} data-label="Cadastro">
                  {formatDate(service.createdAt)}
                </td>
                <td className={tdActionsClass}>
                  <div className="flex flex-wrap items-start gap-1 lg:flex-nowrap lg:justify-end">
                    <Link
                      href={`/admin/servicos/${service.id}/editar`}
                      className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors hover:bg-brand-soft lg:h-8 lg:px-2.5 lg:text-xs"
                    >
                      <Pencil aria-hidden="true" className="size-3.5" />
                      Editar
                    </Link>
                    <RowAction
                      action={setServiceActive}
                      fields={{
                        id: String(service.id),
                        active: String(!service.isActive),
                      }}
                      label={service.isActive ? "Ocultar" : "Ativar"}
                      icon={
                        service.isActive ? (
                          <EyeOff aria-hidden="true" className="size-3.5" />
                        ) : (
                          <Eye aria-hidden="true" className="size-3.5" />
                        )
                      }
                    />
                    <RowAction
                      action={deleteService}
                      fields={{ id: String(service.id) }}
                      label="Excluir"
                      tone="danger"
                      icon={<Trash2 aria-hidden="true" className="size-3.5" />}
                      confirmMessage={`Excluir “${service.name}” em definitivo? As avaliações e favoritos dele também serão apagados.`}
                    />
                  </div>
                </td>
              </tr>
            ))}
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
