import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  decimal,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { USER_ROLES } from "../lib/roles";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

// A lista de papéis vive em `@/lib/roles` (sem dependência do Drizzle) para que
// o client e os schemas Zod a usem; aqui ela só vira o enum do Postgres.
export const userRoleEnum = pgEnum("user_role", USER_ROLES);

// ---------------------------------------------------------------------------
// users
// ---------------------------------------------------------------------------

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  role: userRoleEnum("role").notNull().default("USUARIO"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// categories
// ---------------------------------------------------------------------------

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  // Nome do ícone do lucide-react (ex.: "Utensils", "Hotel", "Pill").
  icon: varchar("icon", { length: 50 }).notNull(),
});

// ---------------------------------------------------------------------------
// services
// ---------------------------------------------------------------------------

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  // Opcional: serviços podem ser cadastrados sem um proprietário vinculado.
  ownerId: integer("owner_id").references(() => users.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  phone: varchar("phone", { length: 20 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  subcategory: varchar("subcategory", { length: 100 }),
  addressStreet: varchar("address_street", { length: 255 }),
  addressNeighborhood: varchar("address_neighborhood", { length: 120 }),
  addressNumber: varchar("address_number", { length: 20 }),
  referencePoint: text("reference_point"),
  // numeric volta como string no Drizzle (preserva a precisão).
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  // Formato "HH:MM".
  openTime: varchar("open_time", { length: 5 }),
  closeTime: varchar("close_time", { length: 5 }),
  isOpen24h: boolean("is_open_24h").notNull().default(false),
  coverImage: text("cover_image"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// reviews
// ---------------------------------------------------------------------------

export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    serviceId: integer("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    check("reviews_rating_range", sql`${table.rating} BETWEEN 1 AND 5`),
    // Uma avaliação por usuário por serviço; reenviar atualiza a anterior.
    unique("reviews_user_service_unique").on(table.userId, table.serviceId),
  ],
);

// ---------------------------------------------------------------------------
// favorites
// ---------------------------------------------------------------------------

export const favorites = pgTable(
  "favorites",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    serviceId: integer("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    // Um usuário só pode favoritar o mesmo serviço uma vez.
    unique("favorites_user_service_unique").on(table.userId, table.serviceId),
  ],
);

// ---------------------------------------------------------------------------
// Tipos inferidos
// ---------------------------------------------------------------------------

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type { UserRole } from "../lib/roles";

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;
