import { parseParcelGeoJson } from "../geo/normalizeGeometry";
import type { Parcel } from "../types/parcel";

export async function loadParcelFromFile(file: File): Promise<Parcel> {
  const text = await file.text();
  const json = JSON.parse(text) as unknown;

  return parseParcelGeoJson(json);
}

export async function loadParcelFromUrl(url: string): Promise<Parcel> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`GeoJSON yuklenemedi: ${response.status}`);
  }

  const json = (await response.json()) as unknown;

  return parseParcelGeoJson(json);
}
