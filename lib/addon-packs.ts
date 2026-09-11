import type { PricingOptionId } from "./outreach-templates";

export interface AddonPack {
  id: string;
  name: string;
  description: string;
  price: number;
  monthly?: number;
  category: "ia" | "ventas" | "contenido" | "gestion" | "combo";
  forPackages: PricingOptionId[];
  forRubros?: string[];
  recommended?: boolean;
}

const WEB: PricingOptionId[] = ["landing", "sitio", "ecommerce", "sistema"];
const STORE: PricingOptionId[] = ["ecommerce"];
const SALES: PricingOptionId[] = ["sistema_ventas", "ecommerce", "sistema"];
const ACCOUNTS: PricingOptionId[] = ["sistema_cuentas", "sistema"];
const SITE: PricingOptionId[] = ["landing", "sitio", "sistema"];

export const ADDON_PACKS: AddonPack[] = [
  {
    id: "chat_ia",
    name: "Chat IA web + WhatsApp",
    description:
      "Atiende consultas y horarios en la web y WhatsApp. Si hace falta una persona, te avisa.",
    price: 165000,
    monthly: 20000,
    category: "ia",
    forPackages: ["sitio", "ecommerce", "sistema", "sistema_ventas", "sistema_cuentas"],
    recommended: true,
  },
  {
    id: "carga_ia_50",
    name: "Carga 50 productos con IA",
    description:
      "Hasta 50 productos listos para vender: título, texto, categoría y precio, a partir de fotos o una lista.",
    price: 85000,
    category: "ia",
    forPackages: STORE,
    recommended: true,
  },
  {
    id: "carga_ia_200",
    name: "Carga 200 productos con IA",
    description:
      "Hasta 200 productos con ficha completa, variantes y revisión final para que el catálogo quede prolijo.",
    price: 210000,
    category: "ia",
    forPackages: STORE,
  },
  {
    id: "fotos_ia",
    name: "Fotos de producto con IA",
    description:
      "Hasta 40 productos con foto de fondo limpio y 3 variantes para usar en la tienda.",
    price: 70000,
    category: "ia",
    forPackages: STORE,
    recommended: true,
  },
  {
    id: "carritos_ia",
    name: "Recuperar carritos por WhatsApp",
    description:
      "Si alguien deja la compra a medias, le llega un WhatsApp con el link listo para pagar.",
    price: 95000,
    monthly: 10000,
    category: "ventas",
    forPackages: STORE,
    recommended: true,
  },
  {
    id: "upsell_ia",
    name: "Recomendaciones IA",
    description:
      "En cada producto y en el carrito sugiere artículos que suelen llevar juntos.",
    price: 90000,
    category: "ia",
    forPackages: STORE,
  },
  {
    id: "ml_fichas",
    name: "Fichas Mercado Libre con IA",
    description:
      "Hasta 40 publicaciones de Mercado Libre listas: título, viñetas y fotos.",
    price: 110000,
    category: "ia",
    forPackages: STORE,
    forRubros: ["celulares", "zapateria", "ferreteria", "almacen", "floreria"],
  },
  {
    id: "combo_ecom_ia",
    name: "Combo Ecommerce IA",
    description:
      "Chat que atiende, 50 productos cargados y aviso a quien abandonó el carrito. Conviene más que contratarlos por separado.",
    price: 310000,
    monthly: 25000,
    category: "combo",
    forPackages: STORE,
    recommended: true,
  },
  {
    id: "envios_pais",
    name: "Envíos a todo el país",
    description:
      "Al pagar se ve el costo de envío (Andreani/OCA o sucursal) y se puede mandar a todo el país.",
    price: 75000,
    category: "ventas",
    forPackages: STORE,
  },
  {
    id: "turnos_online",
    name: "Turnos online",
    description:
      "Reservan el horario desde el celular, reciben un recordatorio por WhatsApp y pueden cancelar sin llamarte.",
    price: 80000,
    category: "gestion",
    forPackages: SITE,
    forRubros: [
      "peluqueria",
      "barberia",
      "estetica",
      "dentista",
      "consultorio",
      "veterinaria",
      "gimnasio",
    ],
    recommended: true,
  },
  {
    id: "seo_local",
    name: "SEO local + Google Business",
    description:
      "Ficha de Google Maps y textos del barrio para que aparezcas cuando buscan tu rubro cerca.",
    price: 55000,
    category: "contenido",
    forPackages: WEB,
    recommended: true,
  },
  {
    id: "contenido_ia",
    name: "Textos y fotos con IA",
    description:
      "Textos del sitio y 8 fotos de marca a partir de 2 o 3 del local, para no arrancar en blanco.",
    price: 65000,
    category: "ia",
    forPackages: WEB,
  },
  {
    id: "blog_ia",
    name: "Blog SEO con IA",
    description:
      "4 notas para arrancar y 2 por mes sobre tu rubro, pensadas para que Google te encuentre.",
    price: 70000,
    monthly: 12000,
    category: "contenido",
    forPackages: ["sitio", "ecommerce", "sistema"],
  },
  {
    id: "ads_setup",
    name: "Campaña Ads inicial",
    description:
      "Campaña en Google o Instagram: medición, 3 anuncios y 15 días de seguimiento.",
    price: 75000,
    category: "ventas",
    forPackages: [...WEB, "sistema_ventas"],
  },
  {
    id: "dominio_email",
    name: "Dominio + email profesional",
    description:
      "Dirección propia (tunegocio.com.ar) y 2 mails profesionales, tipo info@ o nombre@.",
    price: 35000,
    category: "gestion",
    forPackages: [...WEB, "sistema_ventas", "sistema_cuentas"],
  },
  {
    id: "combo_sitio_ia",
    name: "Combo Sitio IA",
    description:
      "Chat que atiende, aparición en Google del barrio y textos/fotos del sitio. Conviene más que contratarlos por separado.",
    price: 240000,
    monthly: 20000,
    category: "combo",
    forPackages: ["sitio"],
    recommended: true,
  },
  {
    id: "carga_stock_ia",
    name: "Carga de stock con IA",
    description:
      "Pasamos tu lista, Excel o fotos de góndola a productos con stock en el sistema.",
    price: 130000,
    category: "ia",
    forPackages: SALES,
  },
  {
    id: "reportes_wa",
    name: "Reporte diario por WhatsApp",
    description:
      "Cada noche te llega un WhatsApp con ventas, caja y qué se está por agotar.",
    price: 85000,
    category: "gestion",
    forPackages: SALES,
    recommended: true,
  },
  {
    id: "afip_factura",
    name: "Factura electrónica AFIP",
    description:
      "Desde la venta o el pedido se emite la factura A, B o C de AFIP, sin cargarla a mano.",
    price: 145000,
    category: "gestion",
    forPackages: [...SALES, ...ACCOUNTS],
  },
  {
    id: "ocr_gastos",
    name: "Gastos con IA (foto del ticket)",
    description:
      "Sacás foto al ticket y el sistema lo anota y lo clasifica (alquiler, mercadería, etc.).",
    price: 125000,
    category: "ia",
    forPackages: ACCOUNTS,
    recommended: true,
  },
  {
    id: "vencimientos_wa",
    name: "Vencimientos por WhatsApp",
    description:
      "Aviso por WhatsApp 3 días antes de IVA, monotributo o sueldos.",
    price: 80000,
    category: "gestion",
    forPackages: ACCOUNTS,
    forRubros: ["contador"],
    recommended: true,
  },
  {
    id: "portal_cliente",
    name: "Portal para clientes",
    description:
      "Tus clientes entran, bajan constancias, ven vencimientos y suben comprobantes sin llamarte.",
    price: 180000,
    category: "gestion",
    forPackages: ["sitio", "sistema_cuentas", "sistema"],
    forRubros: ["contador", "abogado"],
  },
  {
    id: "form_caso",
    name: "Formulario de caso + documentos",
    description:
      "La persona cuenta el caso y adjunta papeles antes de la reunión, así llegás con todo leído.",
    price: 90000,
    category: "gestion",
    forPackages: SITE,
    forRubros: ["abogado"],
    recommended: true,
  },
  {
    id: "inscripcion_online",
    name: "Inscripción online",
    description:
      "Las familias completan la ficha, ven vacantes y pagan la matrícula desde el celular.",
    price: 115000,
    category: "gestion",
    forPackages: ["sitio", "sistema"],
    forRubros: ["colegio"],
    recommended: true,
  },
  {
    id: "portal_padres",
    name: "Portal de familias",
    description:
      "Las familias ven circulares, inasistencias y el estado de las cuotas en un solo lugar.",
    price: 210000,
    category: "gestion",
    forPackages: ["sitio", "sistema"],
    forRubros: ["colegio"],
  },
];

const BASE_AMOUNTS: Partial<Record<PricingOptionId, number>> = {
  landing: 120000,
  sitio: 280000,
  ecommerce: 520000,
  sistema_ventas: 780000,
  sistema_cuentas: 890000,
  sistema: 650000,
};

export function getBaseAmount(pricingId: PricingOptionId): number {
  return BASE_AMOUNTS[pricingId] ?? 0;
}

export function getAddonById(id: string): AddonPack | undefined {
  return ADDON_PACKS.find((pack) => pack.id === id);
}

export function getAddonsForSelection(
  pricingId: PricingOptionId,
  rubroId?: string,
): AddonPack[] {
  if (pricingId === "sin_precio") {
    return [];
  }

  const packs =
    pricingId === "todos"
      ? ADDON_PACKS.filter(
          (pack) =>
            !pack.forRubros?.length ||
            !rubroId ||
            pack.forRubros.includes(rubroId),
        )
      : ADDON_PACKS.filter((pack) => {
          if (!pack.forPackages.includes(pricingId)) return false;
          if (!pack.forRubros?.length) return true;
          return Boolean(rubroId && pack.forRubros.includes(rubroId));
        });

  return [...packs].sort((a, b) => {
    const aRubro = rubroId && a.forRubros?.includes(rubroId) ? 1 : 0;
    const bRubro = rubroId && b.forRubros?.includes(rubroId) ? 1 : 0;
    if (bRubro !== aRubro) return bRubro - aRubro;
    const aRec = a.recommended ? 1 : 0;
    const bRec = b.recommended ? 1 : 0;
    if (bRec !== aRec) return bRec - aRec;
    return a.price - b.price;
  });
}

export function isAddonRecommended(pack: AddonPack, rubroId?: string): boolean {
  return Boolean(pack.recommended || (rubroId && pack.forRubros?.includes(rubroId)));
}

export function sumAddons(ids: string[]): { once: number; monthly: number } {
  return ids.reduce(
    (acc, id) => {
      const pack = getAddonById(id);
      if (!pack) return acc;
      return {
        once: acc.once + pack.price,
        monthly: acc.monthly + (pack.monthly ?? 0),
      };
    },
    { once: 0, monthly: 0 },
  );
}

export function formatAddonLine(pack: AddonPack): string {
  const monthly = pack.monthly
    ? ` + ${pack.monthly.toLocaleString("es-AR")}/mes`
    : "";
  return `${pack.name} — $${pack.price.toLocaleString("es-AR")}${monthly}`;
}

const COMBO_INCLUDES: Record<string, string[]> = {
  combo_ecom_ia: ["chat_ia", "carga_ia_50", "carritos_ia"],
  combo_sitio_ia: ["chat_ia", "seo_local", "contenido_ia"],
};

const MUTUAL_EXCLUSIVE: string[][] = [["carga_ia_50", "carga_ia_200"]];

export function toggleAddonSelection(current: string[], id: string): string[] {
  if (current.includes(id)) {
    return current.filter((item) => item !== id);
  }

  let next = [...current, id];

  const comboItems = COMBO_INCLUDES[id];
  if (comboItems) {
    next = next.filter((item) => !comboItems.includes(item));
  }

  for (const [comboId, items] of Object.entries(COMBO_INCLUDES)) {
    if (items.includes(id)) {
      next = next.filter((item) => item !== comboId);
    }
  }

  for (const group of MUTUAL_EXCLUSIVE) {
    if (!group.includes(id)) continue;
    next = next.filter((item) => item === id || !group.includes(item));
  }

  return next;
}

export function formatAddonsBlock(ids: string[]): string {
  if (ids.length === 0) {
    return "";
  }
  const lines = ids
    .map((id) => getAddonById(id))
    .filter((pack): pack is AddonPack => Boolean(pack))
    .map((pack) => `• ${formatAddonLine(pack)}\n  ${pack.description}`);
  if (lines.length === 0) {
    return "";
  }
  return `Opcional, para sumar:\n${lines.join("\n")}`;
}
