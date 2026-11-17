import { z } from "zod";
import {
  checkboxSchema,
  coordinateSchema,
  idSchema,
  optionalIdSchema,
  optionalText,
  optionalUrlSchema,
  phoneSchema,
  timeSchema,
  whatsappSchema,
} from "./common";

/**
 * Campos editáveis de um serviço. `ownerId` e `isActive` ficam de fora: o dono
 * vem da sessão e a ativação é decisão administrativa, não do formulário.
 */
const serviceFields = z.object({
  categoryId: idSchema("Selecione uma categoria"),
  name: z
    .string()
    .trim()
    .min(2, "Informe o nome do estabelecimento")
    .max(150, "Use no máximo 150 caracteres"),
  description: z
    .string()
    .trim()
    .min(10, "Descreva o serviço em pelo menos 10 caracteres")
    .max(2000, "Use no máximo 2000 caracteres"),
  phone: phoneSchema,
  whatsapp: whatsappSchema,
  subcategory: optionalText(100),
  addressStreet: optionalText(255),
  addressNeighborhood: optionalText(120),
  addressNumber: optionalText(20),
  referencePoint: optionalText(500),
  latitude: coordinateSchema(-90, 90, "Latitude"),
  longitude: coordinateSchema(-180, 180, "Longitude"),
  openTime: timeSchema,
  closeTime: timeSchema,
  isOpen24h: checkboxSchema,
  coverImage: optionalUrlSchema,
});

export const createServiceSchema = serviceFields
  .refine((data) => (data.latitude === undefined) === (data.longitude === undefined), {
    message: "Informe latitude e longitude juntas, ou deixe ambas em branco",
    path: ["longitude"],
  })
  .refine(
    (data) =>
      data.isOpen24h || (data.openTime === undefined) === (data.closeTime === undefined),
    {
      message: "Informe o horário de abertura e o de fechamento",
      path: ["closeTime"],
    },
  )
  // Um local 24h não tem horário de abertura/fechamento: evita dado contraditório.
  .transform((data) =>
    data.isOpen24h
      ? { ...data, openTime: undefined, closeTime: undefined }
      : data,
  );

/**
 * Edição parcial: campos ausentes significam "não alterar". As regras que
 * cruzam campos (par lat/long, par abre/fecha) dependem do registro atual e
 * devem ser conferidas na Server Action, depois de mesclar com o que já existe.
 */
export const updateServiceSchema = serviceFields.partial();

/**
 * Filtros da listagem pública. Vêm de query string/Server Actions, ou seja,
 * são entrada não confiável: o limite máximo protege o banco.
 */
export const listServicesSchema = z.object({
  categoryId: optionalIdSchema("Categoria inválida"),
  q: optionalText(100),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type ListServicesInput = z.input<typeof listServicesSchema>;
export type ListServicesFilters = z.output<typeof listServicesSchema>;

export type CreateServiceInput = z.input<typeof createServiceSchema>;
export type CreateServiceData = z.output<typeof createServiceSchema>;
export type UpdateServiceInput = z.input<typeof updateServiceSchema>;
export type UpdateServiceData = z.output<typeof updateServiceSchema>;
