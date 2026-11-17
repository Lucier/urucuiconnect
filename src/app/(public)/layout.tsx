import { SiteHeader } from "@/components/site-header";

/** Área pública: cabeçalho com busca e login, e rodapé. */
export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">{children}</div>
      <footer className="border-t border-border py-6 text-center text-sm text-muted">
        Uruçuí Connect · Guia de serviços de Uruçuí, Piauí
      </footer>
    </>
  );
}
