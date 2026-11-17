import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import { FormSkeleton } from "@/components/skeletons";
import { getCurrentUser } from "@/lib/auth";
import { safeRedirectPath } from "@/lib/redirect";
import { firstParam } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Entre na sua conta do Uruçuí Connect.",
};

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <section className="space-y-5 rounded-2xl border border-border bg-card p-4 sm:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Entrar</h1>
        <p className="text-sm text-muted">
          Acesse sua conta para favoritar e avaliar serviços.
        </p>
      </header>

      {/* Sessão e searchParams são dados da requisição: dentro do Suspense o casco fica estático. */}
      <Suspense fallback={<FormSkeleton />}>
        <LoginContent searchParams={searchParams} />
      </Suspense>

      <p className="text-center text-sm text-muted">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="inline-block py-2 font-medium text-brand underline">
          Criar conta
        </Link>
      </p>
    </section>
  );
}

async function LoginContent({
  searchParams,
}: {
  searchParams: PageProps<"/login">["searchParams"];
}) {
  // Já logado (confirmado no banco) não precisa ver o formulário.
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/");

  const { next } = await searchParams;
  const destination = safeRedirectPath(firstParam(next), "");

  return <LoginForm next={destination || undefined} />;
}
