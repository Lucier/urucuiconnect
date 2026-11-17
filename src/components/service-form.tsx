"use client";

import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import type { ActionResult, CategoryItem } from "@/types";
import { Field } from "./field";
import { FormAlert } from "./form-alert";
import { inputClass, primaryButtonClass, secondaryButtonClass } from "./ui";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="min-w-0 space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <legend className="px-1 text-base font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}

type ServiceAction = (
  previousState: ActionResult<{ id: number }> | null,
  formData: FormData,
) => Promise<ActionResult<{ id: number }>>;

export function ServiceForm({
  categories,
  action: submitAction,
  initial,
  submitLabel,
  pendingLabel,
  cancelHref,
  successHref,
}: {
  categories: CategoryItem[];
  /** Server Action de criar ou de editar (esta já vem com o id vinculado via `bind`). */
  action: ServiceAction;
  /** Valores iniciais (edição), no formato de campos de formulário. */
  initial?: Record<string, string>;
  submitLabel: string;
  pendingLabel: string;
  cancelHref: string;
  /** Para onde ir depois de salvar. */
  successHref: string;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(submitAction, null);
  const failed = state?.ok === false ? state : null;

  // Depois de um erro valem os valores enviados; antes, os iniciais da edição.
  const values = failed?.values ?? initial ?? {};

  const [isOpen24h, setIsOpen24h] = useState(values.isOpen24h === "on");
  // Cadastro novo nasce visível; checkbox desmarcado não é enviado, então
  // "sem a chave" só significa "oculto" quando já há valores (erro ou edição).
  const isActiveDefault = failed
    ? failed.values?.isActive === "on"
    : initial
      ? initial.isActive === "on"
      : true;

  // Salvo com sucesso: volta para a lista.
  useEffect(() => {
    if (state?.ok) router.push(successHref);
  }, [state, router, successHref]);

  const error = (name: string) => failed?.fieldErrors?.[name]?.[0];

  // Atributos comuns de cada controle: nome, valor reenviado, acessibilidade do erro.
  const control = (name: string, hasHint = false) => ({
    id: name,
    name,
    defaultValue: values[name] ?? "",
    "aria-invalid": error(name) ? true : undefined,
    "aria-describedby": error(name)
      ? `${name}-error`
      : hasHint
        ? `${name}-hint`
        : undefined,
  });

  return (
    <form action={action} className="space-y-6">
      {failed && <FormAlert message={failed.message} />}

      <Section title="Informações básicas">
        <Field id="categoryId" label="Categoria" error={error("categoryId")}>
          <select
            {...control("categoryId")}
            required
            className={inputClass}
          >
            <option value="">Selecione…</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <Field id="name" label="Nome do estabelecimento" error={error("name")}>
          <input
            {...control("name")}
            required
            minLength={2}
            maxLength={150}
            autoComplete="organization"
            className={inputClass}
          />
        </Field>

        <Field
          id="subcategory"
          label="Tipo de serviço"
          optional
          hint="Ex.: Pizzaria, Clínica médica, Pousada"
          error={error("subcategory")}
        >
          <input
            {...control("subcategory", true)}
            maxLength={100}
            className={inputClass}
          />
        </Field>

        <Field
          id="description"
          label="Descrição"
          hint="Conte o que o local oferece (mínimo 10 caracteres)."
          error={error("description")}
        >
          <textarea
            {...control("description", true)}
            required
            minLength={10}
            maxLength={2000}
            rows={4}
            className={inputClass}
          />
        </Field>
      </Section>

      <Section title="Contato">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="phone"
            label="Telefone"
            optional
            hint="Ex.: (89) 3555-0000"
            error={error("phone")}
          >
            <input
              {...control("phone", true)}
              type="tel"
              autoComplete="tel"
              maxLength={20}
              className={inputClass}
            />
          </Field>

          <Field
            id="whatsapp"
            label="WhatsApp"
            optional
            hint="Com DDD. Ex.: (89) 99999-9999"
            error={error("whatsapp")}
          >
            <input
              {...control("whatsapp", true)}
              type="tel"
              inputMode="tel"
              maxLength={20}
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      <Section title="Endereço">
        <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
          <Field
            id="addressStreet"
            label="Rua / Avenida"
            optional
            error={error("addressStreet")}
          >
            <input
              {...control("addressStreet")}
              maxLength={255}
              autoComplete="street-address"
              className={inputClass}
            />
          </Field>
          <Field
            id="addressNumber"
            label="Número"
            optional
            error={error("addressNumber")}
          >
            <input
              {...control("addressNumber")}
              maxLength={20}
              className={inputClass}
            />
          </Field>
        </div>

        <Field
          id="addressNeighborhood"
          label="Bairro"
          optional
          error={error("addressNeighborhood")}
        >
          <input
            {...control("addressNeighborhood")}
            maxLength={120}
            className={inputClass}
          />
        </Field>

        <Field
          id="referencePoint"
          label="Ponto de referência"
          optional
          hint="Ex.: Em frente à praça da matriz"
          error={error("referencePoint")}
        >
          <input
            {...control("referencePoint", true)}
            maxLength={500}
            className={inputClass}
          />
        </Field>

        <details className="rounded-xl border border-border px-4 py-3">
          <summary className="flex min-h-10 cursor-pointer items-center text-sm font-medium">
            Localização no mapa (opcional)
          </summary>
          <p className="mt-2 text-xs text-muted">
            No Google Maps, toque e segure sobre o local e copie as coordenadas.
            Informe as duas ou nenhuma.
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field id="latitude" label="Latitude" error={error("latitude")}>
              <input
                {...control("latitude")}
                inputMode="decimal"
                placeholder="-7.2284"
                className={inputClass}
              />
            </Field>
            <Field id="longitude" label="Longitude" error={error("longitude")}>
              <input
                {...control("longitude")}
                inputMode="decimal"
                placeholder="-44.5553"
                className={inputClass}
              />
            </Field>
          </div>
        </details>
      </Section>

      <Section title="Horário de funcionamento">
        <label className="flex min-h-10 items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            name="isOpen24h"
            checked={isOpen24h}
            onChange={(event) => setIsOpen24h(event.target.checked)}
            className="size-5 accent-[var(--brand)]"
          />
          Aberto 24 horas
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="openTime" label="Abre às" error={error("openTime")}>
            <input
              {...control("openTime")}
              type="time"
              disabled={isOpen24h}
              className={inputClass}
            />
          </Field>
          <Field id="closeTime" label="Fecha às" error={error("closeTime")}>
            <input
              {...control("closeTime")}
              type="time"
              disabled={isOpen24h}
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      <Section title="Foto de capa">
        <Field
          id="coverImage"
          label="Endereço (URL) da imagem"
          optional
          hint="Link público de uma imagem, começando com https://"
          error={error("coverImage")}
        >
          <input
            {...control("coverImage", true)}
            type="url"
            inputMode="url"
            className={inputClass}
          />
        </Field>
      </Section>

      <Section title="Visibilidade">
        <label className="flex items-start gap-3 py-1 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={isActiveDefault}
            className="mt-0.5 size-5 accent-[var(--brand)]"
          />
          <span>
            <span className="font-medium">Visível no site</span>
            <span className="block text-muted">
              Desmarque para ocultar o serviço do público sem excluí-lo.
            </span>
          </span>
        </label>
      </Section>

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
