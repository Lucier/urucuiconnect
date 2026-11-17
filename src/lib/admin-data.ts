import "server-only";
import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, reviews, services, users } from "@/db/schema";
import type { UserRole } from "./roles";
import { requireAdmin } from "./auth";
import { escapeLike, searchTerms } from "./service-queries";

/**
 * Leituras da área administrativa. Diferente das consultas públicas, enxergam
 * também serviços inativos e dados de usuários. Cada função chama
 * `requireAdmin()` por conta própria (defesa em profundidade): mesmo que alguém
 * a importe numa página pública por engano, nada vaza para quem não é admin.
 */

export const ADMIN_PAGE_SIZE = 15;

export type ServiceStatusFilter = "todos" | "ativos" | "inativos";

export function parseStatus(value: string | undefined): ServiceStatusFilter {
  return value === "ativos" || value === "inativos" ? value : "todos";
}

/** Número de página vindo da URL: inteiro entre 1 e 1000. */
export function parsePage(value: string | undefined) {
  const page = Math.trunc(Number(value));
  return Number.isFinite(page) ? Math.min(Math.max(page, 1), 1000) : 1;
}

/** Cada palavra da busca precisa casar em pelo menos um dos campos. */
function textConditions(q: string | undefined, fields: Parameters<typeof ilike>[0][]) {
  return searchTerms(q).map((term) => {
    const pattern = `%${escapeLike(term)}%`;
    return or(...fields.map((field) => ilike(field, pattern)));
  });
}

// ---------------------------------------------------------------------------
// Serviços
// ---------------------------------------------------------------------------

export type AdminServiceRow = {
  id: number;
  name: string;
  categoryName: string;
  neighborhood: string | null;
  isActive: boolean;
  createdAt: Date;
};

export async function listAdminServices(filters: {
  q?: string;
  categoryId?: number;
  status: ServiceStatusFilter;
  page: number;
}): Promise<{ rows: AdminServiceRow[]; total: number }> {
  await requireAdmin();

  const where = and(
    filters.categoryId === undefined
      ? undefined
      : eq(services.categoryId, filters.categoryId),
    filters.status === "todos"
      ? undefined
      : eq(services.isActive, filters.status === "ativos"),
    ...textConditions(filters.q, [
      services.name,
      services.subcategory,
      services.addressNeighborhood,
      categories.name,
    ]),
  );

  const [{ total }] = await db
    .select({ total: count() })
    .from(services)
    .innerJoin(categories, eq(services.categoryId, categories.id))
    .where(where);

  const rows = await db
    .select({
      id: services.id,
      name: services.name,
      categoryName: categories.name,
      neighborhood: services.addressNeighborhood,
      isActive: services.isActive,
      createdAt: services.createdAt,
    })
    .from(services)
    .innerJoin(categories, eq(services.categoryId, categories.id))
    .where(where)
    .orderBy(desc(services.createdAt), desc(services.id))
    .limit(ADMIN_PAGE_SIZE)
    .offset((filters.page - 1) * ADMIN_PAGE_SIZE);

  return { rows, total };
}

/** Serviço (ativo ou não) para o formulário de edição; `null` se não existir. */
export async function getAdminService(id: number) {
  await requireAdmin();
  if (!Number.isInteger(id) || id <= 0) return null;

  const [row] = await db
    .select()
    .from(services)
    .where(eq(services.id, id))
    .limit(1);
  return row ?? null;
}

// ---------------------------------------------------------------------------
// Usuários
// ---------------------------------------------------------------------------

export type AdminUserRow = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  createdAt: Date;
};

const userColumns = {
  id: users.id,
  name: users.name,
  email: users.email,
  phone: users.phone,
  role: users.role,
  createdAt: users.createdAt,
};

export async function listAdminUsers(filters: {
  q?: string;
  role?: UserRole;
  page: number;
}): Promise<{ rows: AdminUserRow[]; total: number }> {
  await requireAdmin();

  // Nunca seleciona `passwordHash`: o hash não deve sair da camada de acesso.
  const where = and(
    filters.role === undefined ? undefined : eq(users.role, filters.role),
    ...textConditions(filters.q, [users.name, users.email]),
  );

  const [{ total }] = await db.select({ total: count() }).from(users).where(where);

  const rows = await db
    .select(userColumns)
    .from(users)
    .where(where)
    .orderBy(desc(users.createdAt), desc(users.id))
    .limit(ADMIN_PAGE_SIZE)
    .offset((filters.page - 1) * ADMIN_PAGE_SIZE);

  return { rows, total };
}

export async function getAdminUser(id: number): Promise<AdminUserRow | null> {
  await requireAdmin();
  if (!Number.isInteger(id) || id <= 0) return null;

  const [row] = await db
    .select(userColumns)
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return row ?? null;
}

// ---------------------------------------------------------------------------
// Painel
// ---------------------------------------------------------------------------

export async function getDashboard() {
  await requireAdmin();

  const [[serviceStats], [userStats], [reviewStats], latestServices, latestUsers] =
    await Promise.all([
      db
        .select({
          total: count(),
          active: sql<number>`count(*) filter (where ${services.isActive})`.mapWith(Number),
        })
        .from(services),
      db
        .select({
          total: count(),
          admins: sql<number>`count(*) filter (where ${users.role} = 'ADMIN')`.mapWith(Number),
        })
        .from(users),
      db.select({ total: count() }).from(reviews),
      db
        .select({
          id: services.id,
          name: services.name,
          categoryName: categories.name,
          isActive: services.isActive,
          createdAt: services.createdAt,
        })
        .from(services)
        .innerJoin(categories, eq(services.categoryId, categories.id))
        .orderBy(desc(services.createdAt), desc(services.id))
        .limit(5),
      db
        .select(userColumns)
        .from(users)
        .orderBy(desc(users.createdAt), desc(users.id))
        .limit(5),
    ]);

  return {
    services: serviceStats,
    users: userStats,
    reviews: reviewStats.total,
    latestServices,
    latestUsers,
  };
}
