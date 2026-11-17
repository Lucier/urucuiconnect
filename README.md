This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Áreas do app e autenticação

- **Área pública** (`/`, `/servicos/[id]`, `/login`, `/cadastro`): qualquer pessoa vê os
  serviços ativos; quem cria uma conta também favorita e avalia. Toda conta nova (pelo
  cadastro público ou pelo admin) nasce como `USUARIO`; só um `ADMIN` muda o nível, em
  Usuários → "Tornar admin"/"Tornar usuário" ou na edição do usuário.
- **Área administrativa** (`/admin/*`): só `ADMIN`. Gerencia serviços (criar, editar,
  ocultar, excluir) e usuários (criar, editar, redefinir senha, excluir e promover/rebaixar o nível
  de acesso).

**Como funciona o login:** senha com bcrypt (`src/lib/password.ts`) → JWT HS256 assinado com
`AUTH_SECRET`, guardado em cookie `httpOnly` (`src/lib/jwt.ts`, `src/lib/session.ts`).
Duas camadas de proteção: `src/proxy.ts` barra quem não tem token válido em `/admin`
(checagem otimista); `requireAdmin()` em `src/lib/auth.ts` confere o usuário e o papel
**atuais no banco** em toda página e Server Action de `/admin`.

### Configuração

```bash
cp .env.example .env.local     # preencha DATABASE_URL e AUTH_SECRET (openssl rand -base64 48)
npm run db:migrate             # aplica as migrações
npm run db:seed                # (opcional) dados fictícios; admin@urucuiconnect.dev / senha1234
```

Primeiro administrador em um banco sem seed (o cadastro público nunca cria `ADMIN`):

```bash
ADMIN_NAME="Seu Nome" ADMIN_EMAIL=voce@exemplo.com ADMIN_PASSWORD='uma-senha-forte' npm run db:create-admin
```

Se o e-mail já existir, a conta é apenas promovida a `ADMIN`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
