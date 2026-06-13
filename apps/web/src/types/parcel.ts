export type ParcelSource =
  | "geojson"
  | "kml"
  | "shapefile"
  | "wfs"
  | "manual"
  | "authorized_tkgm";

export type ParcelGeometry = GeoJSON.Polygon | GeoJSON.MultiPolygon;

export type Parcel = {
  id: string;
  city?: string;
  district?: string;
  neighborhood?: string;
  block?: string;
  parcel?: string;
  geometry: ParcelGeometry;
  source: ParcelSource;
};

export type ParcelMetrics = {
  center: [number, number];
  bbox: [number, number, number, number];
  areaSquareMeters: number;
};
