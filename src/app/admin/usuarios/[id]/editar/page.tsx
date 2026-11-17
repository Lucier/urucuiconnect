import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { updateUser } from "@/actions/admin/users";
import { PageHeader } from "@/components/admin/page-header";
import { UserForm } from "@/components/admin/user-form";
import { getAdminUser } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { Suspense } from "react";
import { AdminPageSkeleton } from "@/components/admin/page-skeleton";

export const metadata: Metadata = { title: "Editar usuário" };

export default function EditUserPage(props: PageProps<"/admin/usuarios/[id]/editar">) {
  return (
    <Suspense fallback={<AdminPageSkeleton />}>
      <EditUserPageContent {...props} />
    </Suspense>
  );
}

async function EditUserPageContent({
  params,
}: PageProps<"/admin/usuarios/[id]/editar">) {
  const admin = await requireAdmin();

  const { id } = await params;
  const user = await getAdminUser(Number(id));
  if (!user) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl space-y-5 px-4 py-5 sm:space-y-6 sm:py-8">
      <PageHeader title="Editar usuário" description={user.email} />
      <UserForm
        action={updateUser.bind(null, user.id)}
        initial={{
          name: user.name,
          email: user.email,
          phone: user.phone ?? "",
          role: user.role,
        }}
        isEdit
        // O servidor também recusa; aqui o campo só deixa de convidar ao erro.
        lockRole={user.id === admin.id}
        submitLabel="Salvar alterações"
        pendingLabel="Salvando…"
        cancelHref="/admin/usuarios"
        successHref="/admin/usuarios"
      />
    </main>
  );
}
