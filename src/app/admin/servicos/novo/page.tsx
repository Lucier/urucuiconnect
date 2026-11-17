import type { Metadata } from "next";
import { listCategories } from "@/actions/categories";
import { createService } from "@/actions/admin/services";
import { PageHeader } from "@/components/admin/page-header";
import { ServiceForm } from "@/components/service-form";
import { requireAdmin } from "@/lib/auth";
import { Suspense } from "react";
import { AdminPageSkeleton } from "@/components/admin/page-skeleton";

export const metadata: Metadata = { title: "Novo serviço" };

export default function NewServicePage() {
  return (
    <Suspense fallback={<AdminPageSkeleton />}>
      <NewServicePageContent />
    </Suspense>
  );
}

async function NewServicePageContent() {
  await requireAdmin();
  const categories = await listCategories();

  return (
    <main className="mx-auto w-full max-w-2xl space-y-5 px-4 py-5 sm:space-y-6 sm:py-8">
      <PageHeader
        title="Novo serviço"
        description="Só categoria, nome e descrição são obrigatórios; preencha o restante se souber."
      />
      <ServiceForm
        categories={categories}
        action={createService}
        submitLabel="Cadastrar serviço"
        pendingLabel="Cadastrando…"
        cancelHref="/admin/servicos"
        successHref="/admin/servicos"
      />
    </main>
  );
}
