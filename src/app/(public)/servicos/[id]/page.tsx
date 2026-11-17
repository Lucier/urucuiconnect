import {
  ArrowLeft,
  Clock,
  Heart,
  Map,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { isFavorite } from "@/actions/favorites";
import { getMyReview, listReviews } from "@/actions/reviews";
import { getServiceById } from "@/actions/services";
import { CategoryIcon } from "@/components/category-icon";
import { FavoriteButton } from "@/components/favorite-button";
import { RatingStars } from "@/components/rating-stars";
import { ReviewForm } from "@/components/review-form";
import { ReviewList } from "@/components/review-list";
import { DetailSkeleton } from "@/components/skeletons";
import { secondaryButtonClass } from "@/components/ui";
import { getCurrentUserId } from "@/lib/auth";
import {
  formatAddress,
  formatHours,
  getOpenStatus,
  mapsLink,
  telLink,
  whatsappLink,
} from "@/lib/format";

type Params = PageProps<"/servicos/[id]">["params"];

export default function ServicePage({ params }: PageProps<"/servicos/[id]">) {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-4 sm:py-6">
      <Link
        href="/"
        className="mb-2 inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-brand hover:underline sm:mb-4"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Todos os serviços
      </Link>
      {/* `params` é dado da requisição: é lido dentro do Suspense para o casco ser estático. */}
      <Suspense fallback={<DetailSkeleton />}>
        <ServiceContent params={params} />
      </Suspense>
    </main>
  );
}

async function ServiceContent({ params }: { params: Params }) {
  const { id } = await params;
  const service = await getServiceById(Number(id));
  if (!service) notFound();

  const [reviews, favorite, myReview, userId] = await Promise.all([
    listReviews(service.id),
    isFavorite(service.id),
    getMyReview(service.id),
    getCurrentUserId(),
  ]);
  const now = new Date();
  // Depois do login volta para esta página.
  const loginHref = `/login?next=${encodeURIComponent(`/servicos/${service.id}`)}`;

  const address = formatAddress(service);
  const status = getOpenStatus(service, now);
  const hasLocation =
    address !== "" || (service.latitude !== null && service.longitude !== null);

  return (
    <article className="space-y-6 sm:space-y-8">
      <header className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid aspect-[2/1] place-items-center bg-brand-soft sm:aspect-[21/9]">
          {service.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- URL livre informada no cadastro; next/image exigiria liberar cada domínio.
            <img
              src={service.coverImage}
              alt={`Foto de ${service.name}`}
              referrerPolicy="no-referrer"
              className="size-full object-cover"
            />
          ) : (
            <CategoryIcon
              name={service.category.icon}
              className="size-12 text-brand sm:size-16"
            />
          )}
        </div>

        <div className="space-y-4 p-4 sm:p-6">
          <div className="space-y-2">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-medium">
              <CategoryIcon
                name={service.category.icon}
                className="size-3.5 text-brand"
              />
              {service.category.name}
              {service.subcategory && ` · ${service.subcategory}`}
            </p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {service.name}
            </h1>
            <RatingStars
              value={service.averageRating}
              reviewCount={service.reviewCount}
              className="size-5"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {service.whatsapp && (
              <a
                href={whatsappLink(service.whatsapp, service.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-green-700 px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
              >
                <MessageCircle aria-hidden="true" className="size-4" />
                Chamar no WhatsApp
              </a>
            )}
            {service.phone && (
              <a href={telLink(service.phone)} className={`${secondaryButtonClass} flex-1 sm:flex-none`}>
                <Phone aria-hidden="true" className="size-4" />
                Ligar
              </a>
            )}
            {hasLocation && (
              <a
                href={mapsLink(service)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${secondaryButtonClass} flex-1 sm:flex-none`}
              >
                <Navigation aria-hidden="true" className="size-4" />
                Como chegar
              </a>
            )}
            {userId === null ? (
              <Link href={loginHref} className={`${secondaryButtonClass} w-full sm:w-auto`}>
                <Heart aria-hidden="true" className="size-4" />
                Entre para favoritar
              </Link>
            ) : (
              <FavoriteButton
                serviceId={service.id}
                initialIsFavorite={favorite}
              />
            )}
          </div>
        </div>
      </header>

      <section aria-labelledby="sobre" className="space-y-2">
        <h2 id="sobre" className="text-lg font-semibold">
          Sobre
        </h2>
        <p className="whitespace-pre-line text-muted">{service.description}</p>
      </section>

      <section
        aria-labelledby="informacoes"
        className="grid gap-4 sm:grid-cols-2"
      >
        <h2 id="informacoes" className="sr-only">
          Endereço e horários
        </h2>

        <div className="space-y-2 rounded-2xl border border-border bg-card p-4">
          <h3 className="flex items-center gap-2 font-semibold">
            <MapPin aria-hidden="true" className="size-4 text-brand" />
            Endereço
          </h3>
          {address ? (
            <p>{address}</p>
          ) : (
            <p className="text-muted">Endereço não informado</p>
          )}
          {service.referencePoint && (
            <p className="flex items-start gap-1.5 text-sm text-muted">
              <Map aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              Ponto de referência: {service.referencePoint}
            </p>
          )}
        </div>

        <div className="space-y-2 rounded-2xl border border-border bg-card p-4">
          <h3 className="flex items-center gap-2 font-semibold">
            <Clock aria-hidden="true" className="size-4 text-brand" />
            Horário de funcionamento
          </h3>
          <p>{formatHours(service)}</p>
          {status.state !== "unknown" && (
            <p
              className={`text-sm font-medium ${
                status.state === "open"
                  ? "text-green-700 dark:text-green-400"
                  : "text-red-700 dark:text-red-400"
              }`}
            >
              {status.label}
            </p>
          )}
        </div>
      </section>

      <section aria-labelledby="avaliacoes" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="avaliacoes" className="text-lg font-semibold">
            Avaliações
          </h2>
          <RatingStars
            value={service.averageRating}
            reviewCount={service.reviewCount}
          />
        </div>

        {userId === null ? (
          <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted">
            <Link href={loginHref} className="font-medium text-brand underline">
              Entre na sua conta
            </Link>{" "}
            ou{" "}
            <Link href="/cadastro" className="font-medium text-brand underline">
              crie uma conta
            </Link>{" "}
            para avaliar este serviço.
          </p>
        ) : (
          <ReviewForm serviceId={service.id} initial={myReview} />
        )}

        <ReviewList reviews={reviews} />
      </section>
    </article>
  );
}
