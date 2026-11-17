"use client";

import { LoaderCircle } from "lucide-react";
import { useActionState } from "react";
import { register } from "@/actions/auth";
import { Field } from "./field";
import { FormAlert } from "./form-alert";
import { PasswordInput } from "./password-input";
import { inputClass, primaryButtonClass } from "./ui";

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, null);
  const failed = state?.ok === false ? state : null;
  const error = (name: string) => failed?.fieldErrors?.[name]?.[0];

  const describedBy = (name: string, hasHint = false) =>
    error(name) ? `${name}-error` : hasHint ? `${name}-hint` : undefined;

  return (
    <form action={action} className="space-y-4" noValidate>
      {failed && <FormAlert message={failed.message} />}

      <Field id="name" label="Nome completo" error={error("name")}>
        <input
          id="name"
          name="name"
          autoComplete="name"
          required
          minLength={2}
          maxLength={120}
          defaultValue={failed?.values?.name ?? ""}
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
          autoComplete="email"
          required
          maxLength={255}
          defaultValue={failed?.values?.email ?? ""}
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
          autoComplete="tel"
          maxLength={20}
          defaultValue={failed?.values?.phone ?? ""}
          aria-invalid={error("phone") ? true : undefined}
          aria-describedby={describedBy("phone", true)}
          className={inputClass}
        />
      </Field>

      <Field
        id="password"
        label="Senha"
        hint="Mínimo de 8 caracteres."
        error={error("password")}
      >
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          aria-invalid={error("password") ? true : undefined}
          aria-describedby={describedBy("password", true)}
        />
      </Field>

      <Field
        id="confirmPassword"
        label="Confirme a senha"
        error={error("confirmPassword")}
      >
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          required
          aria-invalid={error("confirmPassword") ? true : undefined}
          aria-describedby={describedBy("confirmPassword")}
        />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className={`${primaryButtonClass} w-full`}
      >
        {pending && (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        )}
        {pending ? "Criando conta…" : "Criar conta"}
      </button>
    </form>
  );
}
