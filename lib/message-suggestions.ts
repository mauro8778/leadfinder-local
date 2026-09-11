import { ADDON_PACKS } from "./addon-packs";
import {
  PRICING_OPTIONS,
  type PricingOptionId,
} from "./outreach-templates";

export type SuggestionKind = "paquete" | "extra" | "frase";

export interface MessageSuggestion {
  id: string;
  kind: SuggestionKind;
  label: string;
  hint: string;
  keywords: string[];
  pricingId?: PricingOptionId;
  addonId?: string;
  note?: string;
}

const PHRASES: MessageSuggestion[] = [
  {
    id: "frase_semana",
    kind: "frase",
    label: "Empezamos esta semana",
    hint: "Suma urgencia sin presión",
    keywords: ["semana", "ya", "rapido", "empezar"],
    note: "Si te cierra, podemos arrancar esta semana.",
  },
  {
    id: "frase_ajuste",
    kind: "frase",
    label: "Lo ajustamos a tu negocio",
    hint: "El precio no es cerrado",
    keywords: ["ajustar", "medida", "precio", "final"],
    note: "El valor es de referencia: lo ajustamos a lo que realmente necesites.",
  },
  {
    id: "frase_mostrar",
    kind: "frase",
    label: "Te muestro cómo se usa",
    hint: "Incluye una mini capacitación",
    keywords: ["mostrar", "usar", "capacitar", "ensenar"],
    note: "Cuando esté listo te muestro cómo usarlo, en 15 minutos.",
  },
  {
    id: "frase_sin_comp",
    kind: "frase",
    label: "Sin compromiso",
    hint: "Baja la defensa",
    keywords: ["compromiso", "sin", "charla", "gratis"],
    note: "Charlamos 5 minutos, sin compromiso.",
  },
];

function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function allMessageSuggestions(): MessageSuggestion[] {
  const packages = PRICING_OPTIONS.filter(
    (item) => item.waTitle && item.id !== "sin_precio" && item.id !== "todos",
  ).map((item) => ({
    id: `pkg_${item.id}`,
    kind: "paquete" as const,
    label: item.waTitle || item.label,
    hint: item.pitch,
    keywords: [item.id, item.label, item.shortLabel, item.pitch, item.includes],
    pricingId: item.id,
  }));

  const extras = ADDON_PACKS.map((pack) => ({
    id: `add_${pack.id}`,
    kind: "extra" as const,
    label: pack.name,
    hint: pack.description,
    keywords: [pack.id, pack.name, pack.description, pack.category],
    addonId: pack.id,
  }));

  return [...packages, ...extras, ...PHRASES];
}

export function filterSuggestions(query: string, limit = 8): MessageSuggestion[] {
  const needle = fold(query.trim());
  if (!needle) {
    return allMessageSuggestions().slice(0, limit);
  }

  return allMessageSuggestions()
    .map((item) => {
      const hay = fold([item.label, item.hint, ...item.keywords].join(" "));
      const score = hay.includes(needle) ? (fold(item.label).startsWith(needle) ? 2 : 1) : 0;
      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}
