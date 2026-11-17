"use client";

import { LoaderCircle } from "lucide-react";
import { useActionState, type ReactNode } from "react";
import type { ActionResult } from "@/types";

/**
 * Botão de ação de uma linha de tabela (ativar/ocultar, excluir). Envia uma
 * Server Action com campos ocultos, pede confirmação quando necessário e mostra
 * o erro da action logo abaixo do botão (ex.: "não pode excluir a própria conta").
 */
export function RowAction({
  action,
  fields,
  label,
  icon,
  confirmMessage,
  tone = "default",
}: {
  action: (
    previousState: ActionResult | null,
    formData: FormData,
  ) => Promise<ActionResult>;
  fields: Record<string, string>;
  label: string;
  icon: ReactNode;
  confirmMessage?: string;
  tone?: "default" | "danger";
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="inline-flex flex-col items-start">
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button
        type="submit"
        disabled={pending}
        onClick={(event) => {
          if (confirmMessage && !window.confirm(confirmMessage)) {
            event.preventDefault();
          }
        }}
        className={`inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium lg:h-8 lg:px-2.5 lg:text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          tone === "danger"
            ? "text-red-700 hover:bg-red-600/10 dark:text-red-400"
            : "hover:bg-brand-soft"
        }`}
      >
        {pending ? (
          <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin" />
        ) : (
          icon
        )}
        {label}
      </button>
      {state?.ok === false && (
        <p role="alert" className="mt-1 max-w-52 text-xs text-red-700 dark:text-red-400">
          {state.message}
        </p>
      )}
    </form>
  );
}
