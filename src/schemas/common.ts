import { z } from "zod";

/**
 * Helpers compartilhados pelos schemas.
 *
 * Este arquivo (e os demais de `src/schemas`) NÃO importa nada de `@/db`,
 * para poder ser usado também em Client Components (validação no formulário)
 * sem arrastar o Drizzle para o bundle do navegador.
 */

/** Campo de texto opcional: "" e null viram `undefined`. */
const blankToUndefined = (value: string | null | undefined) =>
  value ? value : undefined;

export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Use no máximo ${max} caracteres`)
    .nullish()
    .transform(blankToUndefined);

/** ID numérico vindo de um <input>/<select> (string) ou de código (number). */
export const idSchema = (message = "Identificador inválido") =>
  z.coerce
    .number({ error: message })
    .int(message)
    .positive(message);

/** ID opcional (ex.: filtro de categoria): ausente, null e "" viram `undefined`. */
export const optionalIdSchema = (message = "Identificador inválido") =>
  z
    .union([z.string().trim(), z.number()])
    .nullish()
    .transform((value) =>
      value === null || value === undefined || value === ""
        ? undefined
        : Number(value),
    )
    .pipe(z.number({ error: message }).int(message).positive(message).optional());

/** Checkbox de formulário: "on"/"true"/"1" => true; ausente => false. */
export const checkboxSchema = z
  .union([z.boolean(), z.stringbool()])
  .nullish()
  .transform((value) => value ?? false);

/** Telefone fixo/celular: aceita máscara, ex.: "(89) 99999-9999". */
export const phoneSchema = z
  .string()
  .trim()
  .nullish()
  .transform(blankToUndefined)
  .pipe(
    z
      .string()
      .regex(/^\+?[\d\s().-]{8,20}$/, "Telefone inválido")
      .optional(),
  );

/**
 * WhatsApp guardado só com dígitos e DDI, pronto para `https://wa.me/<número>`.
 * Números brasileiros digitados sem DDI (10 ou 11 dígitos) recebem o prefixo 55.
 */
export const whatsappSchema = z
  .string()
  .trim()
  .nullish()
  .transform((value) => {
    if (!value) return undefined;
    const digits = value.replace(/\D/g, "");
    return digits.length === 10 || digits.length === 11
      ? `55${digits}`
      : digits;
  })
  .pipe(
    z
      .string()
      .regex(
        /^\d{12,15}$/,
        "WhatsApp inválido. Informe DDD + número, ex.: (89) 99999-9999",
      )
      .optional(),
  );

/** Horário no formato 24h "HH:MM". */
export const timeSchema = z
  .string()
  .trim()
  .nullish()
  .transform(blankToUndefined)
  .pipe(
    z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use o formato HH:MM (ex.: 08:30)")
      .optional(),
  );

/** URL http(s) opcional. */
export const optionalUrlSchema = z
  .string()
  .trim()
  .nullish()
  .transform(blankToUndefined)
  .pipe(
    z
      .url({ protocol: /^https?$/, error: "URL inválida (use http ou https)" })
      .max(2048, "URL muito longa")
      .optional(),
  );

/**
 * Coordenada opcional. Aceita número ou texto (inclusive com vírgula decimal)
 * e devolve string com 7 casas, que é o tipo que o Drizzle usa para `decimal`.
 */
export const coordinateSchema = (min: number, max: number, label: string) =>
  z
    .union([z.string().trim(), z.number()])
    .nullish()
    .transform((value) =>
      value === null || value === undefined || value === ""
        ? undefined
        : Number(String(value).replace(",", ".")),
    )
    .pipe(
      z
        .number({ error: `${label} inválida` })
        .min(min, `${label} deve estar entre ${min} e ${max}`)
        .max(max, `${label} deve estar entre ${min} e ${max}`)
        .optional(),
    )
    .transform((value) => (value === undefined ? undefined : value.toFixed(7)));
