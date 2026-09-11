import { formatAddonsBlock } from "./addon-packs";
import type { OutreachContext } from "./outreach";
import { SENDER_NAME } from "./outreach";

export type WhatsAppTemplateId = "consulta" | "propuesta" | "directo" | "beneficios";

export type PricingOptionId =
  | "sin_precio"
  | "landing"
  | "sitio"
  | "ecommerce"
  | "sistema_ventas"
  | "sistema_cuentas"
  | "sistema"
  | "todos";

export interface WhatsAppTemplate {
  id: WhatsAppTemplateId;
  label: string;
  description: string;
}

export interface PricingOption {
  id: PricingOptionId;
  label: string;
  shortLabel: string;
  price: string;
  includes: string;
  pitch: string;
  waTitle: string;
  monthly?: string;
}

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: "consulta",
    label: "Consulta inicial",
    description: "Presentación cálida, sin presión. Ideal para el primer contacto.",
  },
  {
    id: "propuesta",
    label: "Propuesta comercial",
    description: "Va directo a la oferta y pide una charla breve.",
  },
  {
    id: "directo",
    label: "Directo y corto",
    description: "Mensaje breve, al grano.",
  },
  {
    id: "beneficios",
    label: "Enfocado en beneficios",
    description: "Habla del problema (Google, ventas o desorden) y después la oferta.",
  },
];

/** Referencia orientativa para comercios chicos en GBA / CABA (2025–2026). */
export const PRICING_OPTIONS: PricingOption[] = [
  {
    id: "sin_precio",
    label: "Sin mencionar precios",
    shortLabel: "Sin precio",
    price: "",
    includes: "",
    pitch: "",
    waTitle: "",
  },
  {
    id: "landing",
    label: "Landing básica — $120.000",
    shortLabel: "Landing $120k",
    price: "$120.000",
    includes: "mapa, horarios, WhatsApp y datos de contacto",
    pitch:
      "Una página clara para que te encuentren, vean qué hacés y te escriban por WhatsApp.",
    waTitle: "Página de presentación — $120.000",
  },
  {
    id: "sitio",
    label: "Sitio profesional — $280.000",
    shortLabel: "Sitio $280k",
    price: "$280.000",
    includes: "hasta 5 secciones, servicios o carta, galería, SEO local y formulario",
    pitch:
      "Un sitio completo: servicios, fotos y contacto, pensado para aparecer en Google.",
    waTitle: "Sitio web profesional — $280.000",
  },
  {
    id: "ecommerce",
    label: "Ecommerce — $520.000",
    shortLabel: "Tienda $520k",
    price: "$520.000",
    includes: "catálogo, carrito, Mercado Pago, stock y envíos en GBA",
    pitch:
      "Tienda online: el cliente elige, paga con Mercado Pago y vos controlás stock y envíos.",
    waTitle: "Tienda online — $520.000",
    monthly: "mantenimiento $25.000/mes",
  },
  {
    id: "sistema_ventas",
    label: "Sistema de ventas — $780.000",
    shortLabel: "Ventas $780k",
    price: "$780.000",
    includes: "clientes, stock, caja del día, reportes y usuarios",
    pitch:
      "Un panel para el local: quién compró, qué stock hay, la caja del día y reportes.",
    waTitle: "Sistema de ventas — $780.000",
    monthly: "soporte $35.000/mes",
  },
  {
    id: "sistema_cuentas",
    label: "Cuentas para pymes — $890.000",
    shortLabel: "Cuentas $890k",
    price: "$890.000",
    includes: "ingresos, gastos, IVA, caja, proveedores y reporte mensual",
    pitch:
      "Para tener las cuentas del negocio en orden: ingresos, gastos, IVA y un reporte por mes.",
    waTitle: "Cuentas para pymes — $890.000",
    monthly: "soporte $40.000/mes",
  },
  {
    id: "sistema",
    label: "Sistema + web — desde $650.000",
    shortLabel: "Sistema $650k+",
    price: "desde $650.000",
    includes: "web más panel: turnos, pedidos o gestión, según el negocio",
    pitch:
      "La web más un panel a medida: turnos, pedidos o la gestión que necesites.",
    waTitle: "Web + sistema — desde $650.000",
  },
  {
    id: "todos",
    label: "Mostrar paquetes principales",
    shortLabel: "Packs",
    price: "",
    includes: "",
    pitch: "",
    waTitle: "",
  },
];

export const SERVICE_PACKAGES = [
  {
    id: "landing",
    name: "Landing",
    price: "$120.000",
    audience: "Comercios y profesionales",
    includes: "1 página, WhatsApp, mapa, horarios y contacto",
    delivery: "7–10 días",
  },
  {
    id: "sitio",
    name: "Sitio profesional",
    price: "$280.000",
    audience: "Estudios, colegios, locales",
    includes: "Hasta 5 secciones, galería, SEO local y formulario",
    delivery: "15–20 días",
  },
  {
    id: "ecommerce",
    name: "Ecommerce",
    price: "$520.000",
    audience: "Pymes que venden productos",
    includes: "Catálogo, Mercado Pago, stock y envíos",
    delivery: "20–30 días",
    monthly: "Mantenimiento $25.000/mes",
  },
  {
    id: "sistema_ventas",
    name: "Sistema de ventas",
    price: "$780.000",
    audience: "Locales, depósitos, mayoristas",
    includes: "Ventas, clientes, stock, caja y reportes",
    delivery: "30–45 días",
    monthly: "Soporte $35.000/mes",
  },
  {
    id: "sistema_cuentas",
    name: "Cuentas para pymes",
    price: "$890.000",
    audience: "Comercios y estudios chicos",
    includes: "Caja, IVA, proveedores y reportes",
    delivery: "35–50 días",
    monthly: "Soporte $40.000/mes",
  },
] as const;

function compactZona(zona: string): string {
  return zona.split(",")[0]?.trim() || zona.trim();
}

function rubroCorto(label: string): string {
  return label.split("/")[0]?.trim() || label.trim();
}

function searchTerm(label: string): string {
  return rubroCorto(label).toLowerCase();
}

function isOpsPackage(pricingId: PricingOptionId): boolean {
  return (
    pricingId === "sistema_ventas" ||
    pricingId === "sistema_cuentas" ||
    pricingId === "sistema"
  );
}

function joinMessage(parts: Array<string | null | undefined>): string {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join("\n\n");
}

function addressNote(address?: string | null): string {
  return address?.trim() ? `Anoté la dirección: ${address.trim()}.` : "";
}

function formatPricingBlock(pricingId: PricingOptionId): string {
  if (pricingId === "sin_precio") {
    return "";
  }

  if (pricingId === "todos") {
    const main = ["landing", "sitio", "ecommerce", "sistema_ventas"] as const;
    const lines = main.map((id) => {
      const tier = PRICING_OPTIONS.find((option) => option.id === id);
      if (!tier) return "";
      return `• ${tier.waTitle}\n  ${tier.pitch}`;
    });
    return `Opciones:\n${lines.filter(Boolean).join("\n\n")}`;
  }

  const tier = PRICING_OPTIONS.find((option) => option.id === pricingId);
  if (!tier?.waTitle) {
    return "";
  }

  const monthly = tier.monthly ? ` + ${tier.monthly}` : "";
  return `${tier.waTitle}${monthly}\n${tier.pitch}\nIncluye ${tier.includes}.`;
}

function formatDemoLine(demoUrl?: string | null): string {
  if (!demoUrl?.trim()) {
    return "";
  }
  return `Te dejo un ejemplo para que veas el estilo:\n${demoUrl.trim()}`;
}

function formatClosing(
  templateId: WhatsAppTemplateId,
  pricingId: PricingOptionId,
): string {
  if (templateId === "directo") {
    return "¿Tenés 5 minutos esta semana para verlo?";
  }
  if (pricingId === "sin_precio") {
    return "Si te sirve, charlamos 5 minutos y te paso opciones con presupuesto. Sin compromiso.";
  }
  if (pricingId === "todos") {
    return "Los valores se ajustan a cada negocio. ¿Tenés 5 minutos esta semana para ver qué te conviene?";
  }
  return "Es un valor de referencia; lo afinamos según lo que necesites. ¿Charlamos 5 minutos?";
}

function offerLine(pricingId: PricingOptionId): string {
  switch (pricingId) {
    case "landing":
      return "Te puedo armar una página de presentación para que te encuentren, vean qué hacés y te escriban por WhatsApp.";
    case "sitio":
      return "Te puedo armar un sitio profesional: servicios, fotos y contacto, pensado para aparecer en Google.";
    case "ecommerce":
      return "Te puedo armar una tienda online con Mercado Pago, stock y envíos.";
    case "sistema_ventas":
      return "Te puedo armar un sistema para controlar ventas, stock y caja en un solo lugar.";
    case "sistema_cuentas":
      return "Te puedo armar un sistema para ordenar ingresos, gastos, IVA y reportes.";
    case "sistema":
      return "Te puedo armar la web más un panel para turnos, pedidos o la gestión que necesites.";
    default:
      return "Armo páginas, tiendas y sistemas simples, según lo que les sirva.";
  }
}

function openingForTemplate(
  templateId: WhatsAppTemplateId,
  pricingId: PricingOptionId,
  name: string,
  rubroLabel: string,
  zona: string,
  address?: string | null,
): string {
  const zonaCorta = compactZona(zona);
  const rubro = rubroCorto(rubroLabel).toLowerCase();
  const busqueda = searchTerm(rubroLabel);
  const direccion = addressNote(address);
  const ops = isOpsPackage(pricingId);

  if (templateId === "consulta") {
    const intro = ops
      ? joinMessage([`Trabajo en ${zonaCorta} con el rubro ${rubro}.`, direccion])
      : joinMessage([
          `Trabajo en ${zonaCorta} con el rubro ${rubro}.`,
          `Vi que ${name} todavía no tiene una web propia. ${direccion}`.trim(),
        ]);
    if (pricingId === "sin_precio" || pricingId === "todos") {
      return joinMessage([intro, offerLine(pricingId)]);
    }
    return intro;
  }

  if (templateId === "propuesta") {
    const foco = ops
      ? `Armo sistemas para el rubro ${rubro} en ${zonaCorta}.`
      : `Armo webs para el rubro ${rubro} en ${zonaCorta}.`;
    return joinMessage([
      foco,
      direccion,
      `Te dejo una propuesta concreta para ${name}.`,
    ]);
  }

  if (templateId === "directo") {
    if (pricingId === "sin_precio" || pricingId === "todos") {
      return joinMessage([offerLine(pricingId), direccion]);
    }
    return joinMessage([`Te dejo una opción concreta para ${name}.`, direccion]);
  }

  if (pricingId === "ecommerce") {
    return joinMessage([
      `Cada vez más gente compra por el celular. Si ${name} no tiene tienda propia, esa venta se la puede llevar otro.`,
      direccion,
    ]);
  }
  if (ops) {
    return joinMessage([
      "Cuando las ventas, el stock o las cuentas están en un cuaderno o en el WhatsApp, se pierde tiempo y se cometen errores.",
      direccion,
    ]);
  }
  return joinMessage([
    `Hoy, antes de elegir, mucha gente busca "${busqueda}" en Google. Si ${name} no aparece, esa consulta se va a otro.`,
    direccion,
  ]);
}

export function buildWhatsAppMessageFromTemplate(
  context: OutreachContext,
  templateId: WhatsAppTemplateId,
  pricingId: PricingOptionId,
  addonIds: string[] = [],
  extraNote = "",
): string {
  const { name, rubroLabel, zona, address, demoUrl } = context;
  const greeting =
    templateId === "directo"
      ? `Hola ${name}, soy ${SENDER_NAME}.`
      : `Hola ${name}, ¿cómo va? Soy ${SENDER_NAME}.`;

  return joinMessage([
    greeting,
    openingForTemplate(templateId, pricingId, name, rubroLabel, zona, address),
    formatPricingBlock(pricingId),
    formatAddonsBlock(addonIds),
    extraNote.trim(),
    formatDemoLine(demoUrl),
    formatClosing(templateId, pricingId),
  ]);
}

export function getTemplateById(id: WhatsAppTemplateId): WhatsAppTemplate {
  return WHATSAPP_TEMPLATES.find((template) => template.id === id) ?? WHATSAPP_TEMPLATES[0];
}

export function getPricingById(id: PricingOptionId): PricingOption {
  return PRICING_OPTIONS.find((option) => option.id === id) ?? PRICING_OPTIONS[0];
}
