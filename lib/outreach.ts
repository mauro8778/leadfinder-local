export interface OutreachContext {
  name: string;
  rubroLabel: string;
  zona: string;
  address?: string | null;
  demoUrl?: string | null;
}

export const SENDER_NAME = "Mauro";
export const SENDER_EMAIL = "maurodiaz8778@gmail.com";

export {
  buildWhatsAppMessageFromTemplate as buildWhatsAppMessage,
  type PricingOptionId,
  type WhatsAppTemplateId,
} from "./outreach-templates";

export function buildEmailSubject({ name }: OutreachContext): string {
  return `Propuesta web para ${name}`;
}

export function buildEmailBody({
  name,
  rubroLabel,
  zona,
  address,
  demoUrl,
}: OutreachContext): string {
  const locationLine = address
    ? `Vi su comercio en ${address} y `
    : "";
  const demoLine = demoUrl?.trim()
    ? `\n\nEjemplo de mi trabajo: ${demoUrl.trim()}`
    : "";

  return `Hola, buenos días.

Soy ${SENDER_NAME}, desarrollo soluciones web para comercios de ${zona}.

${locationLine}noté que ${name} no tiene página web propia. Trabajo con negocios de ${rubroLabel} en distintos niveles:

- Landing simple: presencia online, horarios, mapa y WhatsApp
- Sitio web completo: carta/menú, galería, reservas, SEO local
- Sistemas a medida: gestión de turnos, pedidos, panel de administración
${demoLine}

Primero charlamos unos minutos para entender qué necesitan, y les envío una propuesta con opciones y presupuesto, sin compromiso.

¿Les pinta coordinar una charla?

Quedo atento.

Saludos,
${SENDER_NAME}
${SENDER_EMAIL}`;
}

export function normalizeEmail(email: string): string | null {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return null;
  }
  return normalized;
}

export function buildMailtoLink(
  email: string,
  subject: string,
  body: string,
): string | null {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return null;
  }

  return `mailto:${normalized}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
