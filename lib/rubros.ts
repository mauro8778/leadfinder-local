export type RubroCategory = "comercio" | "profesional" | "educacion";

export interface RubroConfig {
  id: string;
  label: string;
  category: RubroCategory;
  overpassFilters: string[];
}

function shopFilters(tag: string): string[] {
  return [`node["shop"="${tag}"]`, `way["shop"="${tag}"]`];
}

function amenityFilters(tag: string): string[] {
  return [`node["amenity"="${tag}"]`, `way["amenity"="${tag}"]`];
}

export const RUBRO_CATEGORIES: { id: RubroCategory; label: string }[] = [
  { id: "comercio", label: "Comercios" },
  { id: "profesional", label: "Profesionales" },
  { id: "educacion", label: "Educación" },
];

export const RUBROS: RubroConfig[] = [
  {
    id: "abogado",
    label: "Estudio jurídico",
    category: "profesional",
    overpassFilters: [
      'node["office"="lawyer"]',
      'way["office"="lawyer"]',
      'node["amenity"="lawyer"]',
      'way["amenity"="lawyer"]',
    ],
  },
  {
    id: "almacen",
    label: "Almacén / Despensa",
    category: "comercio",
    overpassFilters: shopFilters("convenience"),
  },
  {
    id: "barberia",
    label: "Barbería",
    category: "comercio",
    overpassFilters: shopFilters("barber"),
  },
  {
    id: "bicicleteria",
    label: "Bicicletería",
    category: "comercio",
    overpassFilters: shopFilters("bicycle"),
  },
  {
    id: "carniceria",
    label: "Carnicería",
    category: "comercio",
    overpassFilters: shopFilters("butcher"),
  },
  {
    id: "celulares",
    label: "Celulares / Accesorios",
    category: "comercio",
    overpassFilters: shopFilters("mobile_phone"),
  },
  {
    id: "cerrajeria",
    label: "Cerrajería",
    category: "comercio",
    overpassFilters: [
      ...shopFilters("locksmith"),
      'node["craft"="locksmith"]',
      'way["craft"="locksmith"]',
    ],
  },
  {
    id: "colegio",
    label: "Colegio / Escuela",
    category: "educacion",
    overpassFilters: [
      ...amenityFilters("school"),
      ...amenityFilters("kindergarten"),
      'node["amenity"="college"]',
      'way["amenity"="college"]',
    ],
  },
  {
    id: "contador",
    label: "Estudio contable",
    category: "profesional",
    overpassFilters: [
      'node["office"="accountant"]',
      'way["office"="accountant"]',
      'node["office"="tax_advisor"]',
      'way["office"="tax_advisor"]',
    ],
  },
  {
    id: "consultorio",
    label: "Consultorio / Clínica",
    category: "profesional",
    overpassFilters: [
      ...amenityFilters("clinic"),
      ...amenityFilters("doctors"),
    ],
  },
  {
    id: "dentista",
    label: "Dentista",
    category: "profesional",
    overpassFilters: amenityFilters("dentist"),
  },
  {
    id: "estetica",
    label: "Estética / Belleza",
    category: "comercio",
    overpassFilters: [
      ...shopFilters("beauty"),
      ...shopFilters("cosmetics"),
      'node["leisure"="spa"]',
      'way["leisure"="spa"]',
    ],
  },
  {
    id: "farmacia",
    label: "Farmacia",
    category: "comercio",
    overpassFilters: amenityFilters("pharmacy"),
  },
  {
    id: "ferreteria",
    label: "Ferretería",
    category: "comercio",
    overpassFilters: shopFilters("hardware"),
  },
  {
    id: "floreria",
    label: "Florería",
    category: "comercio",
    overpassFilters: shopFilters("florist"),
  },
  {
    id: "gimnasio",
    label: "Gimnasio",
    category: "comercio",
    overpassFilters: [
      'node["leisure"="fitness_centre"]',
      'way["leisure"="fitness_centre"]',
      'node["leisure"="sports_centre"]',
      'way["leisure"="sports_centre"]',
    ],
  },
  {
    id: "gomeria",
    label: "Gomería / Taller",
    category: "comercio",
    overpassFilters: [
      ...shopFilters("car_repair"),
      ...shopFilters("tyres"),
      'node["craft"="car_repair"]',
      'way["craft"="car_repair"]',
    ],
  },
  {
    id: "heladeria",
    label: "Heladería",
    category: "comercio",
    overpassFilters: amenityFilters("ice_cream"),
  },
  {
    id: "hotel",
    label: "Hotel / Alojamiento",
    category: "comercio",
    overpassFilters: [
      'node["tourism"="hotel"]',
      'way["tourism"="hotel"]',
      'node["tourism"="guest_house"]',
      'way["tourism"="guest_house"]',
      'node["tourism"="hostel"]',
      'way["tourism"="hostel"]',
    ],
  },
  {
    id: "inmobiliaria",
    label: "Inmobiliaria",
    category: "comercio",
    overpassFilters: shopFilters("estate_agent"),
  },
  {
    id: "kiosco",
    label: "Kiosco",
    category: "comercio",
    overpassFilters: shopFilters("kiosk"),
  },
  {
    id: "lavadero",
    label: "Lavadero de autos",
    category: "comercio",
    overpassFilters: amenityFilters("car_wash"),
  },
  {
    id: "lavanderia",
    label: "Lavandería",
    category: "comercio",
    overpassFilters: [
      ...shopFilters("laundry"),
      ...shopFilters("dry_cleaning"),
    ],
  },
  {
    id: "optica",
    label: "Óptica",
    category: "comercio",
    overpassFilters: shopFilters("optician"),
  },
  {
    id: "panaderia",
    label: "Panadería",
    category: "comercio",
    overpassFilters: shopFilters("bakery"),
  },
  {
    id: "peluqueria",
    label: "Peluquería",
    category: "comercio",
    overpassFilters: [
      ...shopFilters("hairdresser"),
      ...amenityFilters("hairdresser"),
    ],
  },
  {
    id: "petshop",
    label: "Pet shop",
    category: "comercio",
    overpassFilters: shopFilters("pet"),
  },
  {
    id: "pintureria",
    label: "Pinturería",
    category: "comercio",
    overpassFilters: shopFilters("paint"),
  },
  {
    id: "restaurant",
    label: "Restaurante / Café",
    category: "comercio",
    overpassFilters: [
      ...amenityFilters("restaurant"),
      ...amenityFilters("cafe"),
      ...amenityFilters("fast_food"),
    ],
  },
  {
    id: "tintoreria",
    label: "Tintorería",
    category: "comercio",
    overpassFilters: shopFilters("dry_cleaning"),
  },
  {
    id: "veterinaria",
    label: "Veterinaria",
    category: "comercio",
    overpassFilters: amenityFilters("veterinary"),
  },
  {
    id: "verduleria",
    label: "Verdulería",
    category: "comercio",
    overpassFilters: shopFilters("greengrocer"),
  },
  {
    id: "zapateria",
    label: "Zapatería",
    category: "comercio",
    overpassFilters: shopFilters("shoes"),
  },
];

export function getRubro(id: string): RubroConfig | undefined {
  return RUBROS.find((rubro) => rubro.id === id);
}
