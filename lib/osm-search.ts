import type { OverpassPlace } from "./types";
import { getRubro } from "./rubros";

export interface Bbox {
  south: number;
  west: number;
  north: number;
  east: number;
}

const OVERPASS_TIMEOUT_MS = 55_000;
const GEOCODE_TIMEOUT_MS = 15_000;
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.fr/api/interpreter",
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

function bboxAroundPoint(lat: number, lon: number, delta = 0.045): Bbox {
  return {
    south: lat - delta,
    north: lat + delta,
    west: lon - delta,
    east: lon + delta,
  };
}

interface PhotonFeature {
  properties?: {
    extent?: [number, number, number, number];
  };
}

async function geocodeBboxPhoton(zona: string): Promise<Bbox | null> {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", zona);
  url.searchParams.set("limit", "1");
  url.searchParams.set("lang", "es");

  const response = await fetch(url.toString(), {
    signal: AbortSignal.timeout(GEOCODE_TIMEOUT_MS),
  });
  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { features?: PhotonFeature[] };
  const extent = data.features?.[0]?.properties?.extent;
  if (!extent || extent.length !== 4) {
    return null;
  }

  const [west, south, east, north] = extent;
  return { south, west, north, east };
}

interface OpenMeteoResult {
  latitude: number;
  longitude: number;
  country_code?: string;
  admin1?: string;
}

function pickOpenMeteoResult(
  results: OpenMeteoResult[],
  zona: string,
): OpenMeteoResult | null {
  if (results.length === 0) {
    return null;
  }

  const zonaLower = zona.toLowerCase();
  const inArgentina = results.filter((item) => item.country_code === "AR");
  const pool = inArgentina.length > 0 ? inArgentina : results;

  const withAdmin = pool.find((item) => {
    const admin = item.admin1?.toLowerCase() ?? "";
    return (
      (zonaLower.includes("buenos aires") && admin.includes("buenos aires")) ||
      (zonaLower.includes("caba") && admin.includes("buenos aires"))
    );
  });
  if (withAdmin) {
    return withAdmin;
  }

  return pool[0] ?? null;
}

async function geocodeBboxOpenMeteo(zona: string): Promise<Bbox | null> {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", zona.split(",")[0]?.trim() || zona);
  url.searchParams.set("count", "10");
  url.searchParams.set("language", "es");
  url.searchParams.set("format", "json");

  const response = await fetch(url.toString(), {
    signal: AbortSignal.timeout(GEOCODE_TIMEOUT_MS),
  });
  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { results?: OpenMeteoResult[] };
  const picked = pickOpenMeteoResult(data.results ?? [], zona);
  if (!picked) {
    return null;
  }

  return bboxAroundPoint(picked.latitude, picked.longitude);
}

export async function geocodeBbox(zona: string): Promise<Bbox> {
  const providers = [
    () => geocodeBboxPhoton(zona),
    () => geocodeBboxOpenMeteo(zona),
  ];

  for (const provider of providers) {
    const bbox = await provider().catch(() => null);
    if (bbox) {
      return bbox;
    }
  }

  throw new Error(
    `No se encontró la zona "${zona}". Probá "Merlo, Buenos Aires, Argentina" o "Palermo, CABA".`,
  );
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
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(OVERPASS_TIMEOUT_MS),
      });

      if (!response.ok) {
        lastError =
          response.status === 403
            ? "Overpass bloqueó la IP del servidor (403)"
            : `Overpass error ${response.status}`;
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

export async function searchPlacesOsm(
  zona: string,
  rubroId: string,
): Promise<OverpassPlace[]> {
  const rubro = getRubro(rubroId);
  if (!rubro) {
    throw new Error(`Rubro desconocido: ${rubroId}`);
  }

  const bbox = await geocodeBbox(zona);
  const bboxStr = `${bbox.south},${bbox.west},${bbox.north},${bbox.east}`;

  const filters = rubro.overpassFilters
    .map((filter) => `${filter}(${bboxStr});`)
    .join("\n  ");

  const query = `[out:json][timeout:50];
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

  return places.sort((a, b) => a.name.localeCompare(b.name, "es"));
}
