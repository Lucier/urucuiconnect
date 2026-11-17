import {
  BedDouble,
  Compass,
  GraduationCap,
  Landmark,
  Pill,
  Scissors,
  ShoppingCart,
  Stethoscope,
  Store,
  Utensils,
  Wrench,
  type LucideIcon,
} from "lucide-react";

// Mapa explícito (em vez de importar o pacote inteiro dinamicamente) para o
// bundle levar só os ícones usados. O nome vem da coluna `categories.icon`.
const ICONS: Record<string, LucideIcon> = {
  BedDouble,
  Compass,
  GraduationCap,
  Landmark,
  Pill,
  Scissors,
  ShoppingCart,
  Stethoscope,
  Utensils,
  Wrench,
};

export function CategoryIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name] ?? Store;
  return <Icon className={className} aria-hidden="true" />;
}
