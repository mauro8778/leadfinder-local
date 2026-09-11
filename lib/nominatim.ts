import type { OverpassPlace } from "./types";

export interface Bbox {
  south: number;
  west: number;
  north: number;
  east: number;
}

const USER_AGENT = "LeadFinderLocal/1.0 (contact: maurodiaz8778@gmail.com)";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

export async function reverseGeocodeAddress(
  lat: number,
  lon: number,
): Promise<string | null> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");

  const response = await fetch(url.toString(), {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as NominatimReverseResult;
  return formatReverseAddress(data.address) ?? data.display_name ?? null;
}

export async function enrichMissingAddresses(
  places: OverpassPlace[],
  maxLookups = 40,
): Promise<OverpassPlace[]> {
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

interface NominatimResult {
  boundingbox?: [string, string, string, string];
}

export async function geocodeBbox(zona: string): Promise<Bbox> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", zona);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  const response = await fetch(url.toString(), {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error(`Nominatim error: ${response.status}`);
  }

  const data = (await response.json()) as NominatimResult[];
  const first = data[0];

  if (!first?.boundingbox) {
    throw new Error(`No se encontró la zona: ${zona}`);
  }

  const [south, north, west, east] = first.boundingbox.map(Number) as [
    number,
    number,
    number,
    number,
  ];

  return { south, west, north, east };
}
