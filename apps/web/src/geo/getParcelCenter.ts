import { centroid } from "@turf/turf";
import type { ParcelGeometry } from "../types/parcel";

export function getParcelCenter(geometry: ParcelGeometry): [number, number] {
  const point = centroid(geometry);
  const [lng, lat] = point.geometry.coordinates;

  return [lng, lat];
}
