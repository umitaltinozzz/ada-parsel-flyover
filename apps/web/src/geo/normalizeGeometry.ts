import { area } from "@turf/turf";
import { getParcelBounds } from "./getParcelBounds";
import { getParcelCenter } from "./getParcelCenter";
import type {
  Parcel,
  ParcelGeometry,
  ParcelMetrics,
  ParcelSource,
} from "../types/parcel";

type SupportedFeature = GeoJSON.Feature<ParcelGeometry>;

export function parseParcelGeoJson(
  input: unknown,
  source: ParcelSource = "geojson",
): Parcel {
  const feature = extractParcelFeature(input);
  const props = feature.properties ?? {};

  return {
    id: String(props.id ?? props.parcel_id ?? crypto.randomUUID()),
    city: readString(props.city ?? props.il),
    district: readString(props.district ?? props.ilce),
    neighborhood: readString(props.neighborhood ?? props.mahalle),
    block: readString(props.block ?? props.ada),
    parcel: readString(props.parcel ?? props.parsel),
    geometry: feature.geometry,
    source,
  };
}

export function getParcelMetrics(parcel: Parcel): ParcelMetrics {
  return {
    center: getParcelCenter(parcel.geometry),
    bbox: getParcelBounds(parcel.geometry),
    areaSquareMeters: area(parcel.geometry),
  };
}

function extractParcelFeature(input: unknown): SupportedFeature {
  if (!isRecord(input)) {
    throw new Error("GeoJSON nesnesi okunamadi.");
  }

  if (input.type === "FeatureCollection") {
    const features = Array.isArray(input.features) ? input.features : [];
    const match = features.find(isSupportedFeature);

    if (!match) {
      throw new Error("FeatureCollection icinde Polygon veya MultiPolygon yok.");
    }

    return match;
  }

  if (isSupportedFeature(input)) {
    return input;
  }

  if (isParcelGeometry(input)) {
    return {
      type: "Feature",
      properties: {},
      geometry: input,
    };
  }

  throw new Error("Sadece Polygon veya MultiPolygon GeoJSON destekleniyor.");
}

function isSupportedFeature(value: unknown): value is SupportedFeature {
  if (!isRecord(value) || value.type !== "Feature") {
    return false;
  }

  return isParcelGeometry(value.geometry);
}

function isParcelGeometry(value: unknown): value is ParcelGeometry {
  if (!isRecord(value)) {
    return false;
  }

  return value.type === "Polygon" || value.type === "MultiPolygon";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : undefined;
}
