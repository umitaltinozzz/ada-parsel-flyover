import type { Parcel, ParcelGeometry } from "../types/parcel";

type KmlProperties = {
  id?: string;
  city?: string;
  district?: string;
  neighborhood?: string;
  block?: string;
  parcel?: string;
};

export async function loadParcelFromKmlFile(file: File): Promise<Parcel> {
  return parseKmlParcel(await file.text(), file.name);
}

export function parseKmlParcel(text: string, fallbackName = "kml-parcel"): Parcel {
  const xml = new DOMParser().parseFromString(text, "application/xml");
  const parserError = xml.getElementsByTagName("parsererror")[0];

  if (parserError) {
    throw new Error("KML dosyasi okunamadi.");
  }

  const placemarks = Array.from(xml.getElementsByTagName("Placemark"));

  for (const placemark of placemarks) {
    const geometry = readPlacemarkGeometry(placemark);

    if (geometry) {
      const properties = readProperties(placemark);
      const name = readFirstText(placemark, "name");

      return {
        id: properties.id ?? name ?? fallbackName,
        city: properties.city,
        district: properties.district,
        neighborhood: properties.neighborhood,
        block: properties.block,
        parcel: properties.parcel,
        geometry,
        source: "kml",
      };
    }
  }

  throw new Error("KML icinde Polygon veya MultiGeometry Polygon bulunamadi.");
}

function readPlacemarkGeometry(placemark: Element): ParcelGeometry | null {
  const polygons = Array.from(placemark.getElementsByTagName("Polygon"))
    .map(readPolygon)
    .filter((polygon): polygon is GeoJSON.Position[][] => polygon.length > 0);

  if (polygons.length === 0) {
    return null;
  }

  if (polygons.length === 1) {
    return {
      type: "Polygon",
      coordinates: polygons[0],
    };
  }

  return {
    type: "MultiPolygon",
    coordinates: polygons,
  };
}

function readPolygon(polygon: Element): GeoJSON.Position[][] {
  const outer = readBoundary(polygon, "outerBoundaryIs");

  if (outer.length === 0) {
    return [];
  }

  const holes = Array.from(polygon.getElementsByTagName("innerBoundaryIs"))
    .map(readLinearRing)
    .filter((ring) => ring.length > 0);

  return [outer, ...holes];
}

function readBoundary(polygon: Element, boundaryTag: string): GeoJSON.Position[] {
  const boundary = polygon.getElementsByTagName(boundaryTag)[0];

  if (!boundary) {
    return [];
  }

  return readLinearRing(boundary);
}

function readLinearRing(scope: Element): GeoJSON.Position[] {
  const coordinates = readFirstText(scope, "coordinates");

  if (!coordinates) {
    return [];
  }

  const ring = coordinates
    .trim()
    .split(/\s+/)
    .map((tuple) => {
      const [lng, lat, altitude] = tuple.split(",").map(Number);

      if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
        return null;
      }

      return Number.isFinite(altitude) ? [lng, lat, altitude] : [lng, lat];
    })
    .filter((position): position is GeoJSON.Position => position !== null);

  if (ring.length < 3) {
    return [];
  }

  return closeRing(ring);
}

function closeRing(ring: GeoJSON.Position[]): GeoJSON.Position[] {
  const first = ring[0];
  const last = ring[ring.length - 1];

  if (first[0] === last[0] && first[1] === last[1]) {
    return ring;
  }

  return [...ring, first];
}

function readProperties(placemark: Element): KmlProperties {
  const properties: Record<string, string> = {};

  for (const data of Array.from(placemark.getElementsByTagName("Data"))) {
    const key = data.getAttribute("name");
    const value = readFirstText(data, "value");

    if (key && value) {
      properties[normalizeKey(key)] = value;
    }
  }

  return {
    id: properties.id ?? properties.parcel_id,
    city: properties.city ?? properties.il,
    district: properties.district ?? properties.ilce,
    neighborhood: properties.neighborhood ?? properties.mahalle,
    block: properties.block ?? properties.ada,
    parcel: properties.parcel ?? properties.parsel,
  };
}

function readFirstText(scope: Element | Document, tagName: string): string | undefined {
  const value = scope.getElementsByTagName(tagName)[0]?.textContent?.trim();

  return value || undefined;
}

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/\s+/g, "_");
}
