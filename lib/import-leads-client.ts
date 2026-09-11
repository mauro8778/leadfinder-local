import type { OverpassPlace } from "./types";

const BATCH_SIZE = 25;

interface ImportResponse {
  found: number;
  stored: number;
  withPhone: number;
  error?: string;
}

export async function importPlacesInBatches(
  zona: string,
  rubro: string,
  places: OverpassPlace[],
): Promise<ImportResponse> {
  if (places.length === 0) {
    const response = await fetch("/api/leads/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ zona, rubro, places: [] }),
    });
    const data = (await response.json()) as ImportResponse;
    if (!response.ok) {
      throw new Error(data.error ?? "Error al guardar resultados OSM");
    }
    return data;
  }

  let last: ImportResponse = { found: 0, stored: 0, withPhone: 0 };

  for (let index = 0; index < places.length; index += BATCH_SIZE) {
    const chunk = places.slice(index, index + BATCH_SIZE);
    const response = await fetch("/api/leads/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ zona, rubro, places: chunk }),
    });
    const data = (await response.json()) as ImportResponse;
    if (!response.ok) {
      throw new Error(data.error ?? "Error al guardar resultados OSM");
    }
    last = data;
  }

  return last;
}
