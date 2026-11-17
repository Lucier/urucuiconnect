"use server";

import { asc } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import type { CategoryItem } from "@/types";

/** Lista todas as categorias, em ordem alfabética. */
export async function listCategories(): Promise<CategoryItem[]> {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      icon: categories.icon,
    })
    .from(categories)
    .orderBy(asc(categories.name), asc(categories.id));
}
