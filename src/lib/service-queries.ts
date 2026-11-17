import { and, asc, avg, count, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, reviews, services } from "@/db/schema";
import type { ListServicesFilters } from "@/schemas/service";
import type { ServiceDetail, ServiceSummary } from "@/types";

/**
 * Consultas de serviços reutilizadas por `actions/services.ts` e
 * `actions/favorites.ts`. Fica fora de `src/actions` porque arquivos
 * `'use server'` só exportam funções async (e cada export vira endpoint).
 */

// Média e quantidade de avaliações por serviço, calculadas no banco.
const ratingStats = db
  .select({
    serviceId: reviews.serviceId,
    averageRating: avg(reviews.rating).as("average_rating"),
    reviewCount: count().as("review_count"),
  })
  .from(reviews)
  .groupBy(reviews.serviceId)
  .as("rating_stats");

const summaryFields = {
  id: services.id,
  name: services.name,
  description: services.description,
  subcategory: services.subcategory,
  phone: services.phone,
  whatsapp: services.whatsapp,
  addressStreet: services.addressStreet,
  addressNeighborhood: services.addressNeighborhood,
  addressNumber: services.addressNumber,
  openTime: services.openTime,
  closeTime: services.closeTime,
  isOpen24h: services.isOpen24h,
  coverImage: services.coverImage,
  categoryId: categories.id,
  categoryName: categories.name,
  categoryIcon: categories.icon,
  averageRating: ratingStats.averageRating,
  reviewCount: ratingStats.reviewCount,
};

const detailFields = {
  ...summaryFields,
  referencePoint: services.referencePoint,
  latitude: services.latitude,
  longitude: services.longitude,
};

export function selectServiceSummaries() {
  return db
    .select(summaryFields)
    .from(services)
    .innerJoin(categories, eq(services.categoryId, categories.id))
    .leftJoin(ratingStats, eq(ratingStats.serviceId, services.id));
}

export function selectServiceDetails() {
  return db
    .select(detailFields)
    .from(services)
    .innerJoin(categories, eq(services.categoryId, categories.id))
    .leftJoin(ratingStats, eq(ratingStats.serviceId, services.id));
}

type SummaryRow = Awaited<ReturnType<typeof selectServiceSummaries>>[number];
type DetailRow = Awaited<ReturnType<typeof selectServiceDetails>>[number];

export function toServiceSummary(row: SummaryRow): ServiceSummary {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    subcategory: row.subcategory,
    phone: row.phone,
    whatsapp: row.whatsapp,
    addressStreet: row.addressStreet,
    addressNeighborhood: row.addressNeighborhood,
    addressNumber: row.addressNumber,
    openTime: row.openTime,
    closeTime: row.closeTime,
    isOpen24h: row.isOpen24h,
    coverImage: row.coverImage,
    category: {
      id: row.categoryId,
      name: row.categoryName,
      icon: row.categoryIcon,
    },
    averageRating:
      row.averageRating === null
        ? null
        : Math.round(Number(row.averageRating) * 10) / 10,
    reviewCount: row.reviewCount ?? 0,
  };
}

export function toServiceDetail(row: DetailRow): ServiceDetail {
  return {
    ...toServiceSummary(row),
    referencePoint: row.referencePoint,
    // numeric chega como string do driver; a UI trabalha com número.
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
  };
}

/** Escapa os curingas do LIKE para que o texto digitado seja buscado literalmente. */
export function escapeLike(term: string) {
  return term.replace(/[\\%_]/g, "\\$&");
}

/** Divide a busca em palavras (no máximo 5); todas precisam casar em algum campo. */
export function searchTerms(q: string | undefined) {
  return q ? q.split(/\s+/).filter(Boolean).slice(0, 5) : [];
}

export function buildListServicesQuery(filters: ListServicesFilters) {
  const { categoryId, q, page, limit } = filters;

  const termConditions = searchTerms(q).map((term) => {
    const pattern = `%${escapeLike(term)}%`;
    return or(
      ilike(services.name, pattern),
      ilike(services.description, pattern),
      ilike(services.subcategory, pattern),
      ilike(services.addressNeighborhood, pattern),
      ilike(categories.name, pattern),
    );
  });

  return (
    selectServiceSummaries()
      .where(
        and(
          eq(services.isActive, true),
          categoryId === undefined
            ? undefined
            : eq(services.categoryId, categoryId),
          ...termConditions,
        ),
      )
      // Melhor avaliados primeiro; sem avaliação vão para o fim (em Postgres,
      // DESC põe NULL antes, por isso o NULLS LAST explícito).
      .orderBy(
        sql`${ratingStats.averageRating} DESC NULLS LAST`,
        sql`coalesce(${ratingStats.reviewCount}, 0) DESC`,
        asc(services.name),
        asc(services.id),
      )
      .limit(limit)
      .offset((page - 1) * limit)
  );
}
