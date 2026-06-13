import shp from "shpjs";
import { parseParcelGeoJson } from "../geo/normalizeGeometry";
import type { Parcel } from "../types/parcel";

export async function loadParcelFromShapefileZip(file: File): Promise<Parcel> {
  const output = await shp(await file.arrayBuffer());
  const collection = Array.isArray(output) ? output[0] : output;

  if (!collection) {
    throw new Error("Shapefile icinden GeoJSON veri uretilemedi.");
  }

  return parseParcelGeoJson(collection, "shapefile");
}
