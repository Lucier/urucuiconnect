/**
 * Cria (ou promove) um administrador. É a forma de obter o PRIMEIRO admin, já
 * que o cadastro público só cria usuários comuns.
 *
 *   ADMIN_EMAIL=voce@exemplo.com ADMIN_NAME="Seu Nome" ADMIN_PASSWORD='senha-forte' \
 *     npm run db:create-admin
 *
 * - E-mail novo: cria a conta com papel ADMIN (nome e senha obrigatórios).
 * - E-mail existente: só promove a conta a ADMIN, sem mexer na senha.
 *
 * A senha vem de variável de ambiente (não de argumento) para não ficar no
 * histórico do shell nem na lista de processos.
 */
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { hashPassword } from "../lib/password";
import { adminCreateUserSchema } from "../schemas/user";
import { users } from "./schema";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL não definida (use `npm run db:create-admin`).");
  }

  const input = {
    name: process.env.ADMIN_NAME,
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  };

  const client = postgres(databaseUrl, { max: 1 });
  const db = drizzle(client);

  try {
    const email = input.email?.trim().toLowerCase();
    const [existing] = email
      ? await db
          .select({ id: users.id, role: users.role })
          .from(users)
          .where(eq(users.email, email))
          .limit(1)
      : [];

    if (existing) {
      if (existing.role === "ADMIN") {
        console.log(`${email} já é administrador. Nada foi alterado.`);
        return;
      }
      await db.update(users).set({ role: "ADMIN" }).where(eq(users.id, existing.id));
      console.log(`${email} foi promovido a ADMIN (a senha não foi alterada).`);
      return;
    }

    const parsed = adminCreateUserSchema.safeParse(input);
    if (!parsed.success) {
      console.error("Dados inválidos para criar o administrador:");
      for (const issue of parsed.error.issues) {
        console.error(`  - ${issue.path.join(".") || "(geral)"}: ${issue.message}`);
      }
      console.error("Informe ADMIN_NAME, ADMIN_EMAIL e ADMIN_PASSWORD.");
      process.exitCode = 1;
      return;
    }

    const { password, phone, ...data } = parsed.data;
    await db.insert(users).values({
      ...data,
      // O schema de criação não tem nível (sempre USUARIO); aqui, de propósito, é ADMIN.
      role: "ADMIN",
      phone: phone ?? null,
      passwordHash: await hashPassword(password),
    });
    console.log(`Administrador ${data.email} criado.`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Falha ao criar o administrador:", error);
  process.exit(1);
});
