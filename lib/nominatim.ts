import type { OverpassPlace } from "./types";

export interface Bbox {
  south: number;
  west: number;
  north: number;
  east: number;
}

const USER_AGENT = "LeadFinderLocal/1.0 (contact: maurodiaz8778@gmail.com)";
const FETCH_TIMEOUT_MS = 20_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isOfflineError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const cause = (error as Error & { cause?: { code?: string; message?: string } }).cause;
  const blob = `${error.message} ${cause?.code ?? ""} ${cause?.message ?? ""}`.toLowerCase();
  return (
    blob.includes("fetch failed") ||
    blob.includes("econnrefused") ||
    blob.includes("enotfound") ||
    blob.includes("etimedout") ||
    blob.includes("econnreset") ||
    blob.includes("abort")
  );
}

async function osmFetch(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, {
      ...init,
      headers: { "User-Agent": USER_AGENT, ...init?.headers },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch (error) {
    if (isOfflineError(error)) {
      throw new Error(
        "No pudimos consultar OpenStreetMap desde el servidor. Probá de nuevo en unos segundos.",
      );
    }
    throw error;
  }
}

interface NominatimReverseAddress {
  road?: string;
  house_number?: string;
  suburb?: string;
  neighbourhood?: string;
  city?: string;
  town?: string;
  village?: string;
}

interface NominatimReverseResult {
  display_name?: string;
  address?: NominatimReverseAddress;
}

function formatReverseAddress(address?: NominatimReverseAddress): string | null {
  if (!address) {
    return null;
  }

  const street = [address.road, address.house_number].filter(Boolean).join(" ");
  const locality =
    address.city ??
    address.town ??
    address.village ??
    address.suburb ??
    address.neighbourhood;

  const parts = [street, locality].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
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

  const response = await osmFetch(url.toString());
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
  name: string;
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

  const response = await osmFetch(url.toString());
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

interface NominatimResult {
  boundingbox?: [string, string, string, string];
}

async function geocodeBboxNominatim(zona: string): Promise<Bbox | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", zona);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "ar");

  const response = await osmFetch(url.toString());
  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as NominatimResult[];
  const first = data[0];
  if (!first?.boundingbox) {
    return null;
  }

  const [south, north, west, east] = first.boundingbox.map(Number) as [
    number,
    number,
    number,
    number,
  ];

  return { south, west, north, east };
}

export async function geocodeBbox(zona: string): Promise<Bbox> {
  const providers = [
    () => geocodeBboxPhoton(zona),
    () => geocodeBboxOpenMeteo(zona),
    () => geocodeBboxNominatim(zona),
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

export async function reverseGeocodeAddress(
  lat: number,
  lon: number,
): Promise<string | null> {
  if (process.env.RENDER || process.env.VERCEL) {
    return null;
  }

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");

  const response = await osmFetch(url.toString()).catch(() => null);
  if (!response?.ok) {
    return null;
  }

  const data = (await response.json()) as NominatimReverseResult;
  return formatReverseAddress(data.address) ?? data.display_name ?? null;
}

export async function enrichMissingAddresses(
  places: OverpassPlace[],
  maxLookups = 40,
): Promise<OverpassPlace[]> {
  if (process.env.RENDER || process.env.VERCEL) {
    return places;
  }

  const enriched = [...places];
  let lookups = 0;

  for (let index = 0; index < enriched.length; index += 1) {
    const place = enriched[index];
    if (place.address || place.lat == null || place.lon == null) {
      continue;
    }
    if (lookups >= maxLookups) {
      break;
    }

    lookups += 1;
    if (lookups > 1) {
      await sleep(1100);
    }

    const address = await reverseGeocodeAddress(place.lat, place.lon);
    if (address) {
      enriched[index] = { ...place, address };
    }
  }

  return enriched;
}
