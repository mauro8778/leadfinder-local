import type { OutreachContext } from "./outreach";
import {
  buildWhatsAppMessageFromTemplate,
  type PricingOptionId,
  type WhatsAppTemplateId,
} from "./outreach-templates";

const DEFAULT_COUNTRY = "54";

export function normalizePhoneForWhatsApp(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) {
    return null;
  }

  if (digits.startsWith(DEFAULT_COUNTRY)) {
    return digits;
  }

  if (digits.startsWith("0")) {
    return `${DEFAULT_COUNTRY}${digits.slice(1)}`;
  }

  if (digits.length === 10 || digits.length === 11) {
    return `${DEFAULT_COUNTRY}${digits}`;
  }

  return digits;
}

export function hasWhatsAppPhone(phone: string | null | undefined): boolean {
  if (!phone?.trim()) {
    return false;
  }
  return normalizePhoneForWhatsApp(phone) !== null;
}

export function buildWhatsAppLink(phone: string, message: string): string | null {
  const normalized = normalizePhoneForWhatsApp(phone);
  if (!normalized) {
    return null;
  }

  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function buildOutreachMessage(
  context: OutreachContext,
  templateId: WhatsAppTemplateId = "consulta",
  pricingId: PricingOptionId = "sin_precio",
  addonIds: string[] = [],
  extraNote = "",
): string {
  return buildWhatsAppMessageFromTemplate(
    context,
    templateId,
    pricingId,
    addonIds,
    extraNote,
  );
}

export { buildWhatsAppMessageFromTemplate };
export type { PricingOptionId, WhatsAppTemplateId };
