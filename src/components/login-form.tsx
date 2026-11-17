"use client";

import { LoaderCircle } from "lucide-react";
import { useActionState } from "react";
import { login } from "@/actions/auth";
import { Field } from "./field";
import { FormAlert } from "./form-alert";
import { PasswordInput } from "./password-input";
import { inputClass, primaryButtonClass } from "./ui";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(login, null);
  const failed = state?.ok === false ? state : null;
  const error = (name: string) => failed?.fieldErrors?.[name]?.[0];

  return (
    <form action={action} className="space-y-4" noValidate>
      {failed && <FormAlert message={failed.message} />}
      {next && <input type="hidden" name="next" value={next} />}

      <Field id="email" label="E-mail" error={error("email")}>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          defaultValue={failed?.values?.email ?? ""}
          aria-invalid={error("email") ? true : undefined}
          aria-describedby={error("email") ? "email-error" : undefined}
          className={inputClass}
        />
      </Field>

      <Field id="password" label="Senha" error={error("password")}>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          required
          aria-invalid={error("password") ? true : undefined}
          aria-describedby={error("password") ? "password-error" : undefined}
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
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
