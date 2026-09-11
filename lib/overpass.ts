import { enrichMissingAddresses } from "./nominatim";
import { searchPlacesOsm } from "./osm-search";

export async function searchPlaces(zona: string, rubroId: string) {
  const places = await searchPlacesOsm(zona, rubroId);
  return enrichMissingAddresses(places);
}
