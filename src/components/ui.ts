/**
 * Classes Tailwind compartilhadas. Convenção mobile-first: o `text-base` (16px)
 * dos campos evita o zoom automático do Safari/iOS ao focar um input, e os
 * botões têm 44px de altura (alvo de toque confortável).
 * Fica num módulo sem "use client" para poder
 * ser importado tanto por Server quanto por Client Components (uma constante
 * exportada de um arquivo "use client" chega ao servidor como referência, não
 * como string).
 */

export const searchInputClass =
  "h-11 w-full rounded-full border border-border bg-card pl-10 pr-4 text-base placeholder:text-muted sm:text-sm";

export const inputClass =
  "w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-base placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-red-600 sm:text-sm";

export const primaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-border bg-card px-4 text-sm font-medium transition-colors hover:bg-brand-soft sm:px-5";

/** Link solto (fora de um parágrafo) com área de toque de pelo menos 40px de altura. */
export const textLinkClass =
  "inline-flex min-h-10 items-center text-sm font-medium text-brand underline";
