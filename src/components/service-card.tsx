import { Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { formatAddress, getOpenStatus } from "@/lib/format";
import type { ServiceSummary } from "@/types";
import { CategoryIcon } from "./category-icon";
import { RatingStars } from "./rating-stars";

const STATUS_COLOR = {
  open: "text-green-700 dark:text-green-400",
  closed: "text-red-700 dark:text-red-400",
  unknown: "text-muted",
} as const;

export function ServiceCard({
  service,
  now,
}: {
  service: ServiceSummary;
  now: Date;
}) {
  const address = formatAddress(service);
  const status = getOpenStatus(service, now);

  return (
    <li>
      <Link
        href={`/servicos/${service.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
      >
        <div className="relative grid aspect-[2/1] place-items-center bg-brand-soft sm:aspect-[16/9]">
          {service.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- URL livre informada no cadastro; next/image exigiria liberar cada domínio.
            <img
              src={service.coverImage}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              className="size-full object-cover"
            />
          ) : (
            <CategoryIcon
              name={service.category.icon}
              className="size-10 text-brand sm:size-12"
            />
          )}
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-card/95 px-2.5 py-1 text-xs font-medium shadow-sm">
            <CategoryIcon
              name={service.category.icon}
              className="size-3.5 text-brand"
            />
            {service.category.name}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-3.5 sm:p-4">
          <div>
            <h3 className="font-semibold leading-snug group-hover:underline">
              {service.name}
            </h3>
            {service.subcategory && (
              <p className="text-sm text-muted">{service.subcategory}</p>
            )}
          </div>

          <RatingStars
            value={service.averageRating}
            reviewCount={service.reviewCount}
          />

          <ul className="mt-auto space-y-1 pt-1 text-sm text-muted">
            {address && (
              <li className="flex items-start gap-1.5">
                <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <span>{address}</span>
              </li>
            )}
            <li
              className={`flex items-start gap-1.5 font-medium ${STATUS_COLOR[status.state]}`}
            >
              <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <span>{status.label}</span>
            </li>
          </ul>
        </div>
      </Link>
    </li>
  );
}
