import type { ServiceDetail, ServiceSummary } from "@/types";

/** Piauí está em UTC-3 o ano todo (sem horário de verão). */
const TIME_ZONE = "America/Fortaleza";

const digitsOnly = (value: string) => value.replace(/\D/g, "");

/** Link `wa.me` com mensagem inicial. `whatsapp` já vem com DDI (ex.: 5589999999999). */
export function whatsappLink(whatsapp: string, serviceName: string) {
  const text = `Olá! Encontrei o ${serviceName} no Uruçuí Connect e gostaria de mais informações.`;
  return `https://wa.me/${digitsOnly(whatsapp)}?text=${encodeURIComponent(text)}`;
}

export function telLink(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

type AddressParts = Pick<
  ServiceSummary,
  "addressStreet" | "addressNumber" | "addressNeighborhood"
>;

/** "Rua das Palmeiras, 120 · Centro" (ignora as partes que faltam). */
export function formatAddress(service: AddressParts) {
  const street = [service.addressStreet, service.addressNumber]
    .filter(Boolean)
    .join(", ");
  return [street, service.addressNeighborhood].filter(Boolean).join(" · ");
}

/** Link do Google Maps: usa as coordenadas se houver, senão busca pelo endereço. */
export function mapsLink(service: ServiceDetail) {
  const query =
    service.latitude !== null && service.longitude !== null
      ? `${service.latitude},${service.longitude}`
      : `${formatAddress(service).replace(" · ", ", ")}, Uruçuí, PI`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

type HoursInfo = Pick<ServiceSummary, "isOpen24h" | "openTime" | "closeTime">;

export function formatHours(service: HoursInfo) {
  if (service.isOpen24h) return "Aberto 24 horas";
  if (service.openTime && service.closeTime) {
    return `${service.openTime} às ${service.closeTime}`;
  }
  return "Horário não informado";
}

export type OpenStatus = {
  state: "open" | "closed" | "unknown";
  label: string;
};

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * Está aberto agora? Calculado no fuso de Uruçuí, e não no do servidor.
 * Horários que viram a noite (ex.: 18:00–02:00) são tratados corretamente.
 * `now` é recebido por parâmetro para a função continuar pura.
 */
export function getOpenStatus(service: HoursInfo, now: Date): OpenStatus {
  if (service.isOpen24h) return { state: "open", label: "Aberto 24 horas" };
  if (!service.openTime || !service.closeTime) {
    return { state: "unknown", label: "Horário não informado" };
  }

  const clock = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);
  const current = toMinutes(clock);
  const open = toMinutes(service.openTime);
  const close = toMinutes(service.closeTime);

  const isOpen =
    open === close
      ? false
      : open < close
        ? current >= open && current < close
        : current >= open || current < close;

  return isOpen
    ? { state: "open", label: `Aberto agora · fecha às ${service.closeTime}` }
    : { state: "closed", label: `Fechado · abre às ${service.openTime}` };
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
