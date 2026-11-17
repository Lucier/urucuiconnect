type RawParam = string | string[] | undefined;

/** Primeiro valor de um parâmetro de URL (que pode vir repetido como array). */
export function firstParam(value: RawParam) {
  return Array.isArray(value) ? value[0] : value;
}

/** Monta `/?q=...&categoria=...&pagina=...` omitindo o que estiver vazio. */
export function homeHref(params: {
  q?: string;
  categoria?: string | number;
  pagina?: string | number;
}) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.categoria) search.set("categoria", String(params.categoria));
  if (params.pagina && Number(params.pagina) > 1) {
    search.set("pagina", String(params.pagina));
  }
  const query = search.toString();
  return query ? `/?${query}` : "/";
}
