import { z } from "zod";

/** Campos que NUNCA voltam ao navegador, nem para repopular o formulário. */
const SENSITIVE_FIELDS = new Set(["password", "confirmPassword"]);

/** Copia os campos de texto do FormData, para repopular o formulário em caso de erro. */
export function submittedValues(formData: FormData) {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    // Ignora chaves internas do React ($ACTION_...), arquivos e senhas.
    if (
      typeof value === "string" &&
      !key.startsWith("$") &&
      !SENSITIVE_FIELDS.has(key)
    ) {
      values[key] = value;
    }
  }
  return values;
}

/** Converte um ZodError em `{ campo: [mensagens] }`, sem entradas vazias. */
export function toFieldErrors(error: z.ZodError) {
  const fieldErrors: Record<string, string[]> = {};
  for (const [field, messages] of Object.entries(
    z.flattenError(error).fieldErrors,
  )) {
    if (Array.isArray(messages) && messages.length > 0) {
      fieldErrors[field] = messages as string[];
    }
  }
  return fieldErrors;
}
