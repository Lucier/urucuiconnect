import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { listCategories } from "@/actions/categories";
import { listServices } from "@/actions/services";
import { CategoryIcon } from "@/components/category-icon";
import { ServiceCard } from "@/components/service-card";
import {
  CategoryGridSkeleton,
  ServiceGridSkeleton,
} from "@/components/skeletons";
import { secondaryButtonClass, textLinkClass } from "@/components/ui";
import { firstParam, homeHref } from "@/lib/search-params";

const PAGE_SIZE = 12;

type SearchParams = PageProps<"/">["searchParams"];

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 space-y-7 px-4 py-5 sm:space-y-10 sm:py-8">
      {/* Casco estático: aparece instantaneamente; o resto chega por streaming. */}
      <section className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
          Tudo o que você precisa em Uruçuí
        </h1>
        <p className="max-w-2xl text-muted">
          Restaurantes, hospedagem, saúde, farmácias e muito mais, com telefone,
          WhatsApp, endereço e horário de funcionamento.
        </p>
      </section>

      <section aria-labelledby="categorias">
        <h2 id="categorias" className="mb-3 text-lg font-semibold sm:mb-4 sm:text-xl">
          Categorias
        </h2>
        <Suspense fallback={<CategoryGridSkeleton />}>
          <Categories searchParams={searchParams} />
        </Suspense>
      </section>

      <Suspense
        fallback={
          <section>
            <h2 className="mb-3 text-lg font-semibold sm:mb-4 sm:text-xl">
              Serviços em Destaque em Uruçuí
            </h2>
            <ServiceGridSkeleton />
          </section>
        }
      >
        <Services searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Categories({ searchParams }: { searchParams: SearchParams }) {
  // Lê searchParams ANTES de consultar o banco: assim a consulta só roda na
  // requisição, nunca durante o pré-render do build.
  const params = await searchParams;
  const categories = await listCategories();
  const selected = Number(firstParam(params.categoria)) || undefined;
  const q = firstParam(params.q);

  if (categories.length === 0) {
    return (
      <p className="text-muted">Nenhuma categoria cadastrada ainda.</p>
    );
  }

  return (
    // Celular: uma linha de "chips" rolável na horizontal (as 10 categorias em
    // grade ocupariam cinco linhas antes de qualquer serviço). `-mx-4 px-4` faz a
    // rolagem sangrar até a borda da tela. A partir de `sm`, volta a ser grade.
    <ul className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-5 [&::-webkit-scrollbar]:hidden">
      {categories.map((category) => {
        const isSelected = category.id === selected;
        return (
          <li key={category.id} className="shrink-0 snap-start sm:shrink">
            <Link
              // Clicar na categoria já selecionada limpa o filtro.
              href={homeHref({ q, categoria: isSelected ? undefined : category.id })}
              aria-current={isSelected ? "true" : undefined}
              className={`flex h-11 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors sm:h-full sm:flex-col sm:whitespace-normal sm:rounded-2xl sm:p-4 sm:text-center ${
                isSelected
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-border bg-card hover:bg-brand-soft"
              }`}
            >
              <CategoryIcon
                name={category.icon}
                className={`size-5 sm:size-7 ${isSelected ? "" : "text-brand"}`}
              />
              {category.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

async function Services({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = firstParam(params.q)?.trim() || undefined;
  const categoria = firstParam(params.categoria);
  const pagina = firstParam(params.pagina);

  const [services, categories] = await Promise.all([
    listServices({ q, categoryId: categoria, page: pagina, limit: PAGE_SIZE }),
    listCategories(),
  ]);
  // Só depois de acessar dados da requisição: o relógio não entra no casco estático.
  const now = new Date();

  const page = Math.max(Number(pagina) || 1, 1);
  const categoryName = categories.find((c) => String(c.id) === categoria)?.name;
  const isFiltered = Boolean(q || categoryName);

  const heading = !isFiltered
    ? "Serviços em Destaque em Uruçuí"
    : q && categoryName
      ? `“${q}” em ${categoryName}`
      : q
        ? `Resultados para “${q}”`
        : categoryName!;

  return (
    <section aria-labelledby="servicos">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 sm:mb-4">
        <h2 id="servicos" className="text-lg font-semibold sm:text-xl">
          {heading}
        </h2>
        {isFiltered && (
          <Link href="/" className={textLinkClass}>
            Limpar filtros
          </Link>
        )}
      </div>

      {services.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-14 text-center">
          <SearchX aria-hidden="true" className="size-9 text-muted" />
          <p className="font-medium">
            {page > 1 ? "Não há mais resultados." : "Nenhum serviço encontrado."}
          </p>
          <p className="text-sm text-muted">
            {isFiltered
              ? "Tente outra busca ou escolha outra categoria."
              : "Os serviços cadastrados aparecerão aqui."}
          </p>
          {isFiltered && (
            <Link href="/" className={secondaryButtonClass}>
              Ver todos os serviços
            </Link>
          )}
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} now={now} />
          ))}
        </ul>
      )}

      {(page > 1 || services.length === PAGE_SIZE) && (
        <nav
          aria-label="Paginação"
          className="mt-6 flex items-center justify-between"
        >
          {page > 1 ? (
            <Link
              href={homeHref({ q, categoria, pagina: page - 1 })}
              className={secondaryButtonClass}
            >
              <ChevronLeft aria-hidden="true" className="size-4" /> Anterior
            </Link>
          ) : (
            <span />
          )}
          {services.length === PAGE_SIZE && (
            <Link
              href={homeHref({ q, categoria, pagina: page + 1 })}
              className={secondaryButtonClass}
            >
              Próxima <ChevronRight aria-hidden="true" className="size-4" />
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}
