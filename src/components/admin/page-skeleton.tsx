/**
 * Fallback das páginas administrativas. Cada página admin lê a sessão e o banco
 * (dados da requisição) dentro do próprio <Suspense>: assim, ao navegar entre
 * páginas irmãs, o menu fica parado e só o conteúdo mostra este esqueleto. (Um
 * único `loading.tsx` em `admin/` não serve: ele é compartilhado entre as
 * páginas irmãs e já está montado durante a navegação entre elas.)
 */
export function AdminPageSkeleton() {
  const block = "animate-pulse rounded-xl bg-border/60";
  return (
    <main aria-busy="true" className="mx-auto w-full max-w-5xl space-y-6 px-4 py-5 sm:py-8">
      <div className={`${block} h-9 w-64`} />
      <div className={`${block} h-5 w-96 max-w-full`} />
      <div className={`${block} h-80`} />
    </main>
  );
}
