import { CircleAlert } from "lucide-react";

/** Faixa de erro no topo de um formulário (erro geral, não de um campo). */
export function FormAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-red-600/40 bg-red-600/10 p-3 text-sm text-red-800 dark:text-red-300"
    >
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      {message}
    </div>
  );
}
