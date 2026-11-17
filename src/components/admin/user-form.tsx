"use client";

import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { ROLE_LABELS, USER_ROLES } from "@/lib/roles";
import type { ActionResult } from "@/types";
import { Field } from "../field";
import { FormAlert } from "../form-alert";
import { PasswordInput } from "../password-input";
import { inputClass, primaryButtonClass, secondaryButtonClass } from "../ui";

type UserAction = (
  previousState: ActionResult<{ id: number }> | null,
  formData: FormData,
) => Promise<ActionResult<{ id: number }>>;

export function UserForm({
  action: submitAction,
  initial,
  isEdit,
  lockRole,
  submitLabel,
  pendingLabel,
  cancelHref,
  successHref,
}: {
  /** Server Action de criar ou de editar (esta já vem com o id vinculado via `bind`). */
  action: UserAction;
  initial?: Record<string, string>;
  /** Na edição a senha é opcional (em branco = manter a atual). */
  isEdit: boolean;
  /** Impede trocar o papel (admin editando a própria conta). */
  lockRole: boolean;
  submitLabel: string;
  pendingLabel: string;
  cancelHref: string;
  successHref: string;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(submitAction, null);
  const failed = state?.ok === false ? state : null;
  const values = failed?.values ?? initial ?? {};

  useEffect(() => {
    if (state?.ok) router.push(successHref);
  }, [state, router, successHref]);

  const error = (name: string) => failed?.fieldErrors?.[name]?.[0];
  const describedBy = (name: string, hasHint = false) =>
    error(name) ? `${name}-error` : hasHint ? `${name}-hint` : undefined;

  const role = values.role ?? "USUARIO";

  return (
    <form action={action} className="space-y-5" noValidate>
      {failed && <FormAlert message={failed.message} />}

      <fieldset className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
        <legend className="px-1 text-base font-semibold">Dados da conta</legend>

        <Field id="name" label="Nome" error={error("name")}>
          <input
            id="name"
            name="name"
            required
            minLength={2}
            maxLength={120}
            defaultValue={values.name ?? ""}
            aria-invalid={error("name") ? true : undefined}
            aria-describedby={describedBy("name")}
            className={inputClass}
          />
        </Field>

        <Field id="email" label="E-mail" error={error("email")}>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            required
            maxLength={255}
            defaultValue={values.email ?? ""}
            aria-invalid={error("email") ? true : undefined}
            aria-describedby={describedBy("email")}
            className={inputClass}
          />
        </Field>

        <Field
          id="phone"
          label="Telefone"
          optional
          hint="Ex.: (89) 99999-9999"
          error={error("phone")}
        >
          <input
            id="phone"
            name="phone"
            type="tel"
            maxLength={20}
            defaultValue={values.phone ?? ""}
            aria-invalid={error("phone") ? true : undefined}
            aria-describedby={describedBy("phone", true)}
            className={inputClass}
          />
        </Field>
      </fieldset>

      <fieldset className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
        <legend className="px-1 text-base font-semibold">Acesso</legend>

        {isEdit ? (
          <Field
            id="role"
            label="Nível de acesso"
            hint={
              lockRole
                ? "Você não pode alterar o seu próprio nível de acesso."
                : "Administradores acessam este painel; usuários só favoritam e avaliam."
            }
            error={error("role")}
          >
            {/* Select desabilitado não é enviado: o papel vai num campo oculto. */}
            {lockRole && <input type="hidden" name="role" value={role} />}
            <select
              id="role"
              name={lockRole ? undefined : "role"}
              defaultValue={role}
              disabled={lockRole}
              aria-invalid={error("role") ? true : undefined}
              aria-describedby={describedBy("role", true)}
              className={inputClass}
            >
              {USER_ROLES.map((value) => (
                <option key={value} value={value}>
                  {ROLE_LABELS[value]}
                </option>
              ))}
            </select>
          </Field>
        ) : null /* Criação: sem seletor. Toda conta nasce como Usuário; promover a administrador é feito depois, na edição ou na lista de usuários. */}

        <Field
          id="password"
          label={isEdit ? "Nova senha" : "Senha"}
          optional={isEdit}
          hint={
            isEdit
              ? "Deixe em branco para manter a senha atual."
              : "Mínimo de 8 caracteres."
          }
          error={error("password")}
        >
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            required={!isEdit}
            minLength={8}
            aria-invalid={error("password") ? true : undefined}
            aria-describedby={describedBy("password", true)}
          />
        </Field>
      </fieldset>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <button type="submit" disabled={pending} className={`${primaryButtonClass} w-full sm:w-auto`}>
          {pending && (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          )}
          {pending ? pendingLabel : submitLabel}
        </button>
        <Link href={cancelHref} className={`${secondaryButtonClass} w-full sm:w-auto`}>
          Cancelar
        </Link>
        <p aria-live="polite" className="text-sm text-green-700 dark:text-green-400">
          {state?.ok === true && `${state.message} Redirecionando…`}
        </p>
      </div>
    </form>
  );
}
