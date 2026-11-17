import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { RegisterForm } from "@/components/register-form";
import { FormSkeleton } from "@/components/skeletons";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Criar conta",
  description: "Crie sua conta no Uruçuí Connect para favoritar e avaliar serviços.",
};

export default function RegisterPage() {
  return (
    <section className="space-y-5 rounded-2xl border border-border bg-card p-4 sm:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Criar conta</h1>
        <p className="text-sm text-muted">
          É grátis. Com a conta você favorita e avalia os serviços de Uruçuí.
        </p>
      </header>

      <Suspense fallback={<FormSkeleton />}>
        <RegisterContent />
      </Suspense>

      <p className="text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link href="/login" className="inline-block py-2 font-medium text-brand underline">
          Entrar
        </Link>
      </p>
    </section>
  );
}

async function RegisterContent() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/");

  return <RegisterForm />;
}
