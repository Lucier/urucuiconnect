import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { secondaryButtonClass } from "../ui";

/** Paginação das listas do admin. `hrefFor` monta a URL preservando os filtros. */
export function Pagination({
  page,
  total,
  pageSize,
  hrefFor,
}: {
  page: number;
  total: number;
  pageSize: number;
  hrefFor: (page: number) => string;
}) {
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav
      aria-label="Paginação"
      className="mt-4 flex flex-wrap items-center justify-between gap-3"
    >
      <p className="text-sm text-muted">
        {from > total ? "Nenhum resultado nesta página" : `${from}–${to} de ${total}`}
      </p>
      <div className="flex gap-2">
        {page > 1 && (
          <Link href={hrefFor(page - 1)} className={secondaryButtonClass}>
            <ChevronLeft aria-hidden="true" className="size-4" /> Anterior
          </Link>
        )}
        {page < lastPage && (
          <Link href={hrefFor(page + 1)} className={secondaryButtonClass}>
            Próxima <ChevronRight aria-hidden="true" className="size-4" />
          </Link>
        )}
      </div>
    </nav>
  );
}
