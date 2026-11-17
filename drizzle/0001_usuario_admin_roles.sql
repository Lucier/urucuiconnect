-- Papéis passam de ('CLIENTE', 'PROPRIETARIO', 'ADMIN') para ('ADMIN', 'USUARIO').
-- Editado à mão sobre o SQL gerado pelo drizzle-kit: sem o UPDATE, o cast final
-- falharia em bancos que já tenham usuários CLIENTE/PROPRIETARIO.
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
UPDATE "users" SET "role" = 'USUARIO' WHERE "role" IN ('CLIENTE', 'PROPRIETARIO');--> statement-breakpoint
DROP TYPE "public"."user_role";--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'USUARIO');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USUARIO'::"public"."user_role";
