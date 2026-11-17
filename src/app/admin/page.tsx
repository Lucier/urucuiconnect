import { MessageSquareText, Plus, Store, UserPlus, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  PageHeader,
  RoleBadge,
  StatusBadge,
} from "@/components/admin/page-header";
import {
  primaryButtonClass,
  secondaryButtonClass,
  textLinkClass,
} from "@/components/ui";
import { getDashboard } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { Suspense } from "react";
import { AdminPageSkeleton } from "@/components/admin/page-skeleton";

export const metadata: Metadata = { title: "Painel" };

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<AdminPageSkeleton />}>
      <AdminDashboardPageContent />
    </Suspense>
  );
}

async function AdminDashboardPageContent() {
  const admin = await requireAdmin();
  const { services, users, reviews, latestServices, latestUsers } =
    await getDashboard();

  const stats = [
    {
      label: "Serviços",
      value: services.total,
      detail: `${services.active} visíveis no site`,
      icon: Store,
    },
    {
      label: "Usuários",
      value: users.total,
      detail: `${users.admins} administrador${users.admins === 1 ? "" : "es"}`,
      icon: Users,
    },
    {
      label: "Avaliações",
      value: reviews,
      detail: "enviadas pelo público",
      icon: MessageSquareText,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-5 sm:space-y-8 sm:py-8">
      <PageHeader
        title={`Olá, ${admin.name.split(" ")[0]}`}
        description="Resumo do guia de serviços de Uruçuí."
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link href="/admin/servicos/novo" className={`${primaryButtonClass} w-full sm:w-auto`}>
              <Plus aria-hidden="true" className="size-4" />
              Novo serviço
            </Link>
            <Link href="/admin/usuarios/novo" className={`${secondaryButtonClass} w-full sm:w-auto`}>
              <UserPlus aria-hidden="true" className="size-4" />
              Novo usuário
            </Link>
          </div>
        }
      />

      <section aria-label="Totais" className="grid grid-cols-3 gap-2 sm:gap-4">
        {stats.map(({ label, value, detail, icon: Icon }) => (
          <div
            key={label}
            className="min-w-0 space-y-1 rounded-2xl border border-border bg-card p-3 sm:p-4"
          >
            <p className="flex items-center gap-2 text-xs font-medium text-muted sm:text-sm">
              <Icon aria-hidden="true" className="hidden size-4 text-brand sm:block" />
              {label}
            </p>
            <p className="text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
            <p className="text-xs text-muted sm:text-sm">{detail}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="ultimos-servicos" className="min-w-0 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 id="ultimos-servicos" className="text-lg font-semibold">
              Últimos serviços
            </h2>
            <Link href="/admin/servicos" className={textLinkClass}>
              Ver todos
            </Link>
          </div>
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
            {latestServices.length === 0 && (
              <li className="p-4 text-sm text-muted">Nenhum serviço cadastrado.</li>
            )}
            {latestServices.map((service) => (
              <li key={service.id} className="relative flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <Link
                    href={`/admin/servicos/${service.id}/editar`}
                    className="block truncate font-medium after:absolute after:inset-0 hover:underline"
                  >
                    {service.name}
                  </Link>
                  <p className="text-xs text-muted">
                    {service.categoryName} · {formatDate(service.createdAt)}
                  </p>
                </div>
                <StatusBadge active={service.isActive} />
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="ultimos-usuarios" className="min-w-0 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 id="ultimos-usuarios" className="text-lg font-semibold">
              Últimos usuários
            </h2>
            <Link href="/admin/usuarios" className={textLinkClass}>
              Ver todos
            </Link>
          </div>
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
            {latestUsers.length === 0 && (
              <li className="p-4 text-sm text-muted">Nenhum usuário.</li>
            )}
            {latestUsers.map((user) => (
              <li key={user.id} className="relative flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <Link
                    href={`/admin/usuarios/${user.id}/editar`}
                    className="block truncate font-medium after:absolute after:inset-0 hover:underline"
                  >
                    {user.name}
                  </Link>
                  <p className="truncate text-xs text-muted">
                    {user.email} · {formatDate(user.createdAt)}
                  </p>
                </div>
                <RoleBadge role={user.role} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
