import { enrichMissingAddresses, geocodeBbox } from "./nominatim";
import type { OverpassPlace } from "./types";
import { getRubro } from "./rubros";

const USER_AGENT = "LeadFinderLocal/1.0 (contact: maurodiaz8778@gmail.com)";
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

function buildAddress(tags: Record<string, string>): string | null {
  const street = [tags["addr:street"], tags["addr:housenumber"]]
    .filter(Boolean)
    .join(" ");
  const locality =
    tags["addr:city"] ??
    tags["addr:town"] ??
    tags["addr:village"] ??
    tags["addr:suburb"] ??
    tags["addr:neighbourhood"];

  const parts = [street, locality].filter(Boolean);
  if (parts.length > 0) {
    return parts.join(", ");
  }

  return tags["addr:full"] ?? null;
}

function elementToPlace(element: OverpassElement): OverpassPlace | null {
  const tags = element.tags ?? {};
  const name = tags.name ?? tags["name:es"];

  if (!name) {
    return null;
  }

  const lat = element.lat ?? element.center?.lat ?? null;
  const lon = element.lon ?? element.center?.lon ?? null;

  return {
    osmId: String(element.id),
    osmType: element.type,
    name,
    address: buildAddress(tags),
    phone: tags.phone ?? tags["contact:phone"] ?? tags["contact:mobile"] ?? null,
    email: tags.email ?? tags["contact:email"] ?? null,
    website: tags.website ?? tags["contact:website"] ?? null,
    lat,
    lon,
  };
}

async function queryOverpass(query: string): Promise<OverpassResponse> {
  let lastError = "Overpass no respondió";

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": USER_AGENT,
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(90_000),
      });

      if (!response.ok) {
        lastError = `Overpass error ${response.status}`;
        continue;
      }

      return (await response.json()) as OverpassResponse;
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Overpass no respondió";
    }
  }

  throw new Error(
    `${lastError}. Probá de nuevo en unos segundos; el servidor de mapas a veces se satura.`,
  );
}

export async function searchPlaces(zona: string, rubroId: string): Promise<OverpassPlace[]> {
  const rubro = getRubro(rubroId);
  if (!rubro) {
    throw new Error(`Rubro desconocido: ${rubroId}`);
  }

  const bbox = await geocodeBbox(zona);
  const bboxStr = `${bbox.south},${bbox.west},${bbox.north},${bbox.east}`;

  const filters = rubro.overpassFilters
    .map((filter) => `${filter}(${bboxStr});`)
    .join("\n  ");

  const query = `[out:json][timeout:60];
(
  ${filters}
);
out center tags;`;

  const data = await queryOverpass(query);
  const seen = new Set<string>();
  const places: OverpassPlace[] = [];

  for (const element of data.elements) {
    const key = `${element.type}-${element.id}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    const place = elementToPlace(element);
    if (place) {
      places.push(place);
    }
  }

  const withAddresses = await enrichMissingAddresses(places);
  return withAddresses.sort((a, b) => a.name.localeCompare(b.name, "es"));
}
