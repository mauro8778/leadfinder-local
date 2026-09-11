import { DEMO_PAGES } from "./demo-pages";

export interface DemoSite {
  id: string;
  label: string;
  path: string;
  rubroIds: string[];
  description: string;
  previewImage: string;
  accent: string;
}

const RUBRO_MAP: Record<string, string[]> = {
  peluqueria: ["peluqueria", "estetica"],
  barberia: ["barberia"],
  restaurante: ["restaurant", "heladeria", "panaderia", "kiosco"],
  gimnasio: ["gimnasio"],
  ferreteria: ["ferreteria", "pintureria", "cerrajeria"],
  veterinaria: ["veterinaria", "petshop"],
  farmacia: ["farmacia"],
  dentista: ["dentista", "consultorio"],
  abogado: ["abogado"],
  contador: ["contador"],
  colegio: ["colegio"],
  ventas: ["almacen", "ferreteria", "celulares"],
  pymes: ["inmobiliaria", "hotel"],
  ecommerce: ["zapateria", "floreria", "kiosco"],
};

export const DEMO_SITES: DemoSite[] = DEMO_PAGES.map((page) => ({
  id: page.id,
  label: page.name,
  path: `/demo/${page.id}`,
  previewImage: page.heroImage,
  accent: page.accent,
  description: page.tagline.slice(0, 72) + (page.tagline.length > 72 ? "…" : ""),
  rubroIds: RUBRO_MAP[page.id] ?? [],
}));

export function getDemoForRubro(rubroId: string): DemoSite | undefined {
  return DEMO_SITES.find((demo) => demo.rubroIds.includes(rubroId));
}

export function buildDemoUrl(path: string, origin?: string): string {
  if (origin) {
    return `${origin.replace(/\/$/, "")}${path}`;
  }
  if (typeof window !== "undefined") {
    return `${window.location.origin}${path}`;
  }
  return path;
}
