"use server";

import { eq, and } from "drizzle-orm";
import { services } from "@/db/schema";
import {
  buildListServicesQuery,
  selectServiceDetails,
  toServiceDetail,
  toServiceSummary,
} from "@/lib/service-queries";
import { idSchema } from "@/schemas/common";
import { listServicesSchema, type ListServicesInput } from "@/schemas/service";
import type { ServiceDetail, ServiceSummary } from "@/types";

// ---------------------------------------------------------------------------
// Leitura (dados públicos). Cada export de um arquivo 'use server' é também um
// endpoint POST, então a entrada é validada e só serviços ativos são expostos.
// A escrita (cadastrar, editar, ativar, excluir) é exclusiva do admin e vive em
// `actions/admin/services.ts`.
// ---------------------------------------------------------------------------

/**
 * Lista serviços ativos, com filtro opcional por categoria e busca textual
 * (nome, descrição, subcategoria, bairro e nome da categoria). Ordena pelos
 * mais bem avaliados. Filtros inválidos resultam em lista vazia.
 */
export async function listServices(
  filters: ListServicesInput = {},
): Promise<ServiceSummary[]> {
  const parsed = listServicesSchema.safeParse(filters);
  if (!parsed.success) return [];

  const rows = await buildListServicesQuery(parsed.data);
  return rows.map(toServiceSummary);
}

/** Detalhes de um serviço ativo; `null` se o ID for inválido ou não existir. */
export async function getServiceById(id: number): Promise<ServiceDetail | null> {
  const parsedId = idSchema().safeParse(id);
  if (!parsedId.success) return null;

  const [row] = await selectServiceDetails()
    .where(and(eq(services.id, parsedId.data), eq(services.isActive, true)))
    .limit(1);

  return row ? toServiceDetail(row) : null;
}
