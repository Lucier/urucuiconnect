import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL não está definida. Configure-a em .env.local (ex.: postgres://usuario:senha@localhost:5432/urucuiconnect).",
  );
}

// Em desenvolvimento o hot reload reexecuta este módulo; guardamos o client
// em globalThis para não abrir uma nova pool de conexões a cada recarga.
const globalForDb = globalThis as unknown as {
  pgClient?: ReturnType<typeof postgres>;
};

const client = globalForDb.pgClient ?? postgres(connectionString);

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgClient = client;
}

export const db = drizzle(client, { schema });
