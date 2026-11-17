/**
 * Tipos compartilhados entre Server Actions e UI.
 *
 * São DTOs: o formato que a interface recebe, não as linhas cruas do banco.
 * Arquivos `'use server'` só podem exportar funções async, por isso os tipos
 * vivem aqui.
 */

/** Resultado padrão das actions de escrita (compatível com `useActionState`). */
export type ActionResult<T = undefined> =
  | { ok: true; data: T; message?: string }
  | {
      ok: false;
      message: string;
      /** Erros por campo, na chave do nome do input do formulário. */
      fieldErrors?: Record<string, string[]>;
      /** Valores enviados, para repopular o formulário (o React o reseta após a action). */
      values?: Record<string, string>;
    };

export type CategoryItem = {
  id: number;
  name: string;
  /** Nome do ícone do lucide-react (ex.: "Utensils"). */
  icon: string;
};

export type ServiceSummary = {
  id: number;
  name: string;
  description: string;
  subcategory: string | null;
  phone: string | null;
  /** Só dígitos com DDI, pronto para `https://wa.me/<whatsapp>`. */
  whatsapp: string | null;
  addressStreet: string | null;
  addressNeighborhood: string | null;
  addressNumber: string | null;
  openTime: string | null;
  closeTime: string | null;
  isOpen24h: boolean;
  coverImage: string | null;
  category: CategoryItem;
  /** Média das notas com 1 casa decimal; `null` se ainda não há avaliações. */
  averageRating: number | null;
  reviewCount: number;
};

export type ReviewItem = {
  id: number;
  /** Nome abreviado ("Maria S."), para não expor o nome completo. */
  authorName: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
};

export type MyReview = {
  rating: number;
  comment: string | null;
};

export type ServiceDetail =ServiceSummary & {
  referencePoint: string | null;
  latitude: number | null;
  longitude: number | null;
};
