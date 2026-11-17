import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listCategories } from "@/actions/categories";
import { updateService } from "@/actions/admin/services";
import { PageHeader } from "@/components/admin/page-header";
import { ServiceForm } from "@/components/service-form";
import { getAdminService } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { Suspense } from "react";
import { AdminPageSkeleton } from "@/components/admin/page-skeleton";

export const metadata: Metadata = { title: "Editar serviço" };

export default function EditServicePage(props: PageProps<"/admin/servicos/[id]/editar">) {
  return (
    <Suspense fallback={<AdminPageSkeleton />}>
      <EditServicePageContent {...props} />
    </Suspense>
  );
}

async function EditServicePageContent({
  params,
}: PageProps<"/admin/servicos/[id]/editar">) {
  await requireAdmin();

  const { id } = await params;
  const [service, categories] = await Promise.all([
    getAdminService(Number(id)),
    listCategories(),
  ]);
  if (!service) notFound();

  // Linha do banco -> valores de campos de formulário (tudo texto).
  const initial: Record<string, string> = {
    categoryId: String(service.categoryId),
    name: service.name,
    subcategory: service.subcategory ?? "",
    description: service.description,
    phone: service.phone ?? "",
    // O banco guarda só dígitos com DDI (55 + DDD + número); mostramos sem o 55,
    // como o admin digitaria, e o schema o acrescenta de novo ao salvar.
    whatsapp: (service.whatsapp ?? "").replace(/^55(\d{10,11})$/, "$1"),
    addressStreet: service.addressStreet ?? "",
    addressNumber: service.addressNumber ?? "",
    addressNeighborhood: service.addressNeighborhood ?? "",
    referencePoint: service.referencePoint ?? "",
    latitude: service.latitude ?? "",
    longitude: service.longitude ?? "",
    openTime: service.openTime ?? "",
    closeTime: service.closeTime ?? "",
    coverImage: service.coverImage ?? "",
    ...(service.isOpen24h ? { isOpen24h: "on" } : {}),
    ...(service.isActive ? { isActive: "on" } : {}),
  };

  return (
    <main className="mx-auto w-full max-w-2xl space-y-5 px-4 py-5 sm:space-y-6 sm:py-8">
      <PageHeader
        title="Editar serviço"
        description={service.name}
        action={
          service.isActive ? (
            <Link
              href={`/servicos/${service.id}`}
              target="_blank"
              className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-brand underline"
            >
              <ExternalLink aria-hidden="true" className="size-4" />
              Ver no site
            </Link>
          ) : undefined
        }
      />
      <ServiceForm
        categories={categories}
        action={updateService.bind(null, service.id)}
        initial={initial}
        submitLabel="Salvar alterações"
        pendingLabel="Salvando…"
        cancelHref="/admin/servicos"
        successHref="/admin/servicos"
      />
    </main>
  );
}
