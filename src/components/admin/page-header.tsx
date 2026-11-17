import type { ReactNode } from "react";

/** Título da página do admin, com descrição e (opcionalmente) a ação principal à direita. */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="max-w-2xl text-muted">{description}</p>}
      </div>
      {action}
    </header>
  );
}

const badgeBase = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";

export function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`${badgeBase} ${
        active
          ? "bg-green-600/15 text-green-800 dark:text-green-300"
          : "bg-border text-muted"
      }`}
    >
      {active ? "Ativo" : "Oculto"}
    </span>
  );
}

export function RoleBadge({ role }: { role: "ADMIN" | "USUARIO" }) {
  return (
    <span
      className={`${badgeBase} ${
        role === "ADMIN" ? "bg-brand-soft text-foreground" : "bg-border text-muted"
      }`}
    >
      {role === "ADMIN" ? "Administrador" : "Usuário"}
    </span>
  );
}

/**
 * Tabela responsiva SEM duplicar marcação: de `lg` (1024px) para cima é uma tabela
 * normal; no celular cada linha vira um cartão (o cabeçalho some, e cada célula
 * mostra seu rótulo à esquerda via `data-label`).
 *
 * Uso: <TableCard><thead className={theadClass}>…</thead><tbody className={tbodyClass}>
 *   <tr className={trClass}><td className={tdTitleClass}>…</td>
 *   <td className={tdClass} data-label="Categoria">…</td>
 *   <td className={tdActionsClass}>…</td></tr></tbody></TableCard>
 */
export function TableCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card lg:overflow-x-auto">
      <table className="block w-full text-left text-sm lg:table lg:min-w-[40rem]">
        {children}
      </table>
    </div>
  );
}

export const theadClass = "hidden border-b border-border lg:table-header-group";
export const tbodyClass = "block divide-y divide-border lg:table-row-group";
export const trClass = "block px-4 py-3 lg:table-row lg:p-0";
export const thClass =
  "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted";

/** Célula de dado: no celular vira "Rótulo ........ valor". */
export const tdClass =
  "flex items-center justify-between gap-4 py-1 before:shrink-0 before:text-xs before:font-medium before:text-muted before:content-[attr(data-label)] lg:table-cell lg:px-4 lg:py-3 lg:align-middle lg:before:content-none";
/** Primeira célula (nome): é o título do cartão no celular. */
export const tdTitleClass = "block pb-1 lg:table-cell lg:px-4 lg:py-3 lg:align-middle";
/** Botões de ação: no celular ficam numa faixa própria no fim do cartão. */
export const tdActionsClass =
  "mt-2 block border-t border-border pt-2 lg:mt-0 lg:table-cell lg:border-0 lg:px-4 lg:py-3 lg:align-middle";
