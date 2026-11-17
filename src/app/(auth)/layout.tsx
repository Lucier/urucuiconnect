import { MapPin } from "lucide-react";
import Link from "next/link";

/** Telas de login e cadastro: sem busca nem navegação, só a marca e o cartão. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-5 px-4 py-6 sm:gap-6 sm:py-10">
      <Link
        href="/"
        className="flex items-center justify-center gap-2 font-semibold tracking-tight"
      >
        <span className="grid size-10 place-items-center rounded-xl bg-brand text-brand-foreground">
          <MapPin aria-hidden="true" className="size-5" />
        </span>
        <span className="text-xl">Uruçuí Connect</span>
      </Link>
      {children}
    </main>
  );
}
