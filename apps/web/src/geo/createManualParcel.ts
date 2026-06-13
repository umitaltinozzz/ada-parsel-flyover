import type { Parcel } from "../types/parcel";

export type ManualParcelInput = {
  id?: string;
  center: [number, number];
  widthMeters: number;
  depthMeters: number;
  city?: string;
  district?: string;
  neighborhood?: string;
  block?: string;
  parcel?: string;
};

export function createManualParcel(input: ManualParcelInput): Parcel {
  const [lng, lat] = input.center;
  const width = Math.max(1, input.widthMeters);
  const depth = Math.max(1, input.depthMeters);
  const metersPerDegreeLat = 111_320;
  const metersPerDegreeLng =
    metersPerDegreeLat * Math.max(0.2, Math.cos((lat * Math.PI) / 180));
  const halfLng = width / 2 / metersPerDegreeLng;
  const halfLat = depth / 2 / metersPerDegreeLat;

  return {
    id: input.id ?? `manual-${lng.toFixed(5)}-${lat.toFixed(5)}`,
    city: input.city,
    district: input.district,
    neighborhood: input.neighborhood,
    block: input.block,
    parcel: input.parcel,
    source: "manual",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [lng - halfLng, lat - halfLat],
          [lng + halfLng, lat - halfLat],
          [lng + halfLng, lat + halfLat],
          [lng - halfLng, lat + halfLat],
          [lng - halfLng, lat - halfLat],
        ],
      ],
    },
  };
}
