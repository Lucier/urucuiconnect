import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// O drizzle-kit roda fora do Next.js, então carregamos o .env.local manualmente.
config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não está definida em .env.local");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
