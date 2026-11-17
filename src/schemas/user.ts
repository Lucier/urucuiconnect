import { z } from "zod";
import { USER_ROLES } from "@/lib/roles";
import { phoneSchema } from "./common";

/**
 * Este arquivo não importa nada de `@/db` (só `@/lib/roles`, que é leve), para
 * poder ser usado também em Client Components.
 */

const nameSchema = z
  .string()
  .trim()
  .min(2, "Informe o nome")
  .max(120, "Use no máximo 120 caracteres");

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(255, "Use no máximo 255 caracteres")
  .pipe(z.email("E-mail inválido"));

/**
 * Política de senha. O bcrypt ignora tudo além dos 72 primeiros BYTES, então o
 * limite é em bytes (um "ç" ou emoji ocupa mais de 1) — sem isso, senhas longas
 * seriam truncadas em silêncio. A senha em texto puro só existe na validação:
 * o que vai ao banco é o hash, gerado na camada de negócio. Nunca persistir
 * este campo.
 */
export const passwordSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres")
  .refine(
    (value) => new TextEncoder().encode(value).length <= 72,
    "A senha deve ter no máximo 72 bytes (cerca de 72 caracteres)",
  );

/** Cadastro público: sempre cria um USUARIO (ADMIN nunca entra por aqui). */
export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

/**
 * Login. Não aplica a política de senha: quem tem conta antiga ou senha "fora
 * do padrão" não deve receber um erro de validação que revele a regra — só
 * "e-mail ou senha incorretos". O teto de tamanho evita payloads absurdos.
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, "Informe sua senha")
    .max(200, "Senha muito longa"),
  next: z.string().max(2048).nullish(),
});

/**
 * Criação de usuário pelo admin. NÃO há campo de nível: toda conta nasce como
 * USUARIO (o padrão). Para promover alguém a ADMIN, o admin usa a edição do
 * usuário ou a ação "Tornar admin" da lista (`setUserRole`) — nunca na criação.
 * O `role` enviado por um cliente malicioso é descartado pelo Zod.
 */
export const adminCreateUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
});

/** Troca de nível de acesso (ação rápida da lista de usuários). */
export const setUserRoleSchema = z.object({
  id: z.coerce.number().int().positive("Usuário inválido"),
  role: z.enum(USER_ROLES, { error: "Nível de acesso inválido" }),
});

/**
 * Edição pelo admin. A senha é opcional: em branco = manter a atual. As regras
 * que dependem do estado do banco (não rebaixar a si mesmo, não remover o
 * último admin) são conferidas na Server Action.
 */
export const adminUpdateUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  role: z.enum(USER_ROLES, { error: "Escolha o nível de acesso" }),
  password: z
    .string()
    .nullish()
    .transform((value) => (value ? value : undefined))
    .pipe(passwordSchema.optional()),
});

export type RegisterInput = z.input<typeof registerSchema>;
export type LoginInput = z.input<typeof loginSchema>;
export type AdminCreateUserData = z.output<typeof adminCreateUserSchema>;
export type AdminUpdateUserData = z.output<typeof adminUpdateUserSchema>;
