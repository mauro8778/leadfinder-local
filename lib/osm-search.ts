import { fetchWithTimeout, isMobileClient } from "./fetch-timeout";
import type { OverpassPlace } from "./types";
import { getRubro } from "./rubros";

export interface Bbox {
  south: number;
  west: number;
  north: number;
  east: number;
}

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.fr/api/interpreter",
];

function overpassTimeoutMs(): number {
  return isMobileClient() ? 22_000 : 45_000;
}

function geocodeTimeoutMs(): number {
  return isMobileClient() ? 10_000 : 15_000;
}

function maxPlaces(): number {
  return isMobileClient() ? 120 : 400;
}

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

  const response = await fetchWithTimeout(url.toString(), {}, geocodeTimeoutMs());
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

  const response = await fetchWithTimeout(url.toString(), {}, geocodeTimeoutMs());
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

function extractWebsiteOrSocial(tags: Record<string, string>): string | null {
  const direct = tags.website ?? tags["contact:website"] ?? tags.url;
  if (direct && direct.trim()) {
    return direct.trim();
  }

  const insta = tags["contact:instagram"] ?? tags.instagram;
  if (insta && insta.trim()) {
    const val = insta.trim();
    if (val.startsWith("http://") || val.startsWith("https://")) return val;
    if (val.includes("instagram.com")) return `https://${val.replace(/^https?:\/\//, "")}`;
    if (val.startsWith("@")) return `https://instagram.com/${val.slice(1)}`;
    return `https://instagram.com/${val}`;
  }

  const fb = tags["contact:facebook"] ?? tags.facebook;
  if (fb && fb.trim()) {
    const val = fb.trim();
    if (val.startsWith("http://") || val.startsWith("https://")) return val;
    if (val.includes("facebook.com") || val.includes("fb.com")) return `https://${val.replace(/^https?:\/\//, "")}`;
    if (fb.startsWith("@")) return `https://facebook.com/${val.slice(1)}`;
    return `https://facebook.com/${val}`;
  }

  const tiktok = tags["contact:tiktok"] ?? tags.tiktok;
  if (tiktok && tiktok.trim()) {
    const val = tiktok.trim();
    if (val.startsWith("http://") || val.startsWith("https://")) return val;
    if (val.includes("tiktok.com")) return `https://${val.replace(/^https?:\/\//, "")}`;
    if (val.startsWith("@")) return `https://tiktok.com/@${val.slice(1)}`;
    return `https://tiktok.com/@${val}`;
  }

  return null;
}

export function elementToPlace(element: OverpassElement): OverpassPlace | null {
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
    website: extractWebsiteOrSocial(tags),
    lat,
    lon,
  };
}

async function queryOverpass(query: string): Promise<OverpassResponse> {
  let lastError = "Overpass no respondió";
  const timeoutMs = overpassTimeoutMs();

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetchWithTimeout(
        endpoint,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `data=${encodeURIComponent(query)}`,
        },
        timeoutMs,
      );

      if (!response.ok) {
        lastError =
          response.status === 403
            ? "Overpass bloqueó la consulta (403)"
            : `Overpass error ${response.status}`;
        continue;
      }

      return (await response.json()) as OverpassResponse;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Overpass no respondió";
      lastError =
        message.toLowerCase().includes("abort")
          ? "La búsqueda tardó demasiado. Probá una zona más chica."
          : message;
    }
  }

  throw new Error(
    `${lastError}. Dejá la pestaña abierta y probá de nuevo en unos segundos.`,
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
  const overpassTimeout = isMobileClient() ? 18 : 40;

  const filters = rubro.overpassFilters
    .map((filter) => `${filter}(${bboxStr});`)
    .join("\n  ");

  const query = `[out:json][timeout:${overpassTimeout}];
(
  ${filters}
);
out center tags;`;

  const data = await queryOverpass(query);
  const seen = new Set<string>();
  const places: OverpassPlace[] = [];
  const limit = maxPlaces();

  for (const element of data.elements) {
    if (places.length >= limit) {
      break;
    }

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
