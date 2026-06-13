import { bbox } from "@turf/turf";
import type { ParcelGeometry } from "../types/parcel";

export function getParcelBounds(
  geometry: ParcelGeometry,
): [number, number, number, number] {
  const [west, south, east, north] = bbox(geometry);

  return [west, south, east, north];
}
