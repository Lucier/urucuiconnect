"use client";

import Form from "next/form";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { searchInputClass } from "./ui";

/** Busca rápida: envia `?q=` para a home (navegação no cliente, sem recarregar). */
export function SearchBox() {
  const q = useSearchParams().get("q") ?? "";

  return (
    <Form action="/" role="search" className="relative w-full">
      <label htmlFor="busca-rapida" className="sr-only">
        Buscar serviços
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
      />
      {/* key: ao navegar para outra busca, o campo acompanha a URL. */}
      <input
        key={q}
        id="busca-rapida"
        name="q"
        type="search"
        defaultValue={q}
        maxLength={100}
        placeholder="Buscar restaurante, farmácia, pousada…"
        className={searchInputClass}
      />
    </Form>
  );
}
