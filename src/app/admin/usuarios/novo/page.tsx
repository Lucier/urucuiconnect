import type { Metadata } from "next";
import { createUser } from "@/actions/admin/users";
import { PageHeader } from "@/components/admin/page-header";
import { UserForm } from "@/components/admin/user-form";
import { requireAdmin } from "@/lib/auth";
import { Suspense } from "react";
import { AdminPageSkeleton } from "@/components/admin/page-skeleton";

export const metadata: Metadata = { title: "Novo usuário" };

export default function NewUserPage() {
  return (
    <Suspense fallback={<AdminPageSkeleton />}>
      <NewUserPageContent />
    </Suspense>
  );
}

async function NewUserPageContent() {
  await requireAdmin();

  return (
    <main className="mx-auto w-full max-w-2xl space-y-5 px-4 py-5 sm:space-y-6 sm:py-8">
      <PageHeader
        title="Novo usuário"
        description="Crie uma conta para a pessoa. Ela já poderá entrar com o e-mail e a senha definidos aqui."
      />
      <UserForm
        action={createUser}
        isEdit={false}
        lockRole={false}
        submitLabel="Criar usuário"
        pendingLabel="Criando…"
        cancelHref="/admin/usuarios"
        successHref="/admin/usuarios"
      />
    </main>
  );
}
