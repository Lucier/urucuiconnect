import { z } from "zod";
import { idSchema, optionalText } from "./common";

/**
 * `userId` não faz parte da entrada: a identidade de quem avalia deve vir da
 * sessão no servidor, nunca do formulário.
 */
export const createReviewSchema = z.object({
  serviceId: idSchema("Serviço inválido"),
  rating: z.coerce
    .number({ error: "Escolha uma nota de 1 a 5" })
    .int("Escolha uma nota de 1 a 5")
    .min(1, "Escolha uma nota de 1 a 5")
    .max(5, "Escolha uma nota de 1 a 5"),
  comment: optionalText(1000),
});

/** Edição: não se troca o serviço avaliado; nota e comentário são opcionais. */
export const updateReviewSchema = createReviewSchema
  .omit({ serviceId: true })
  .partial();

export type CreateReviewInput = z.input<typeof createReviewSchema>;
export type CreateReviewData = z.output<typeof createReviewSchema>;
export type UpdateReviewInput = z.input<typeof updateReviewSchema>;
export type UpdateReviewData = z.output<typeof updateReviewSchema>;
