import type { GeoJSONSource, Map } from "maplibre-gl";
import type { Parcel } from "../types/parcel";

export const parcelSourceId = "parcel-source";
export const parcelFillLayerId = "parcel-fill";
export const parcelLineLayerId = "parcel-outline";
export const parcelLabelLayerId = "parcel-label";

export function addParcelLayer(map: Map, parcel: Parcel): void {
  const data = createParcelFeature(parcel);
  const source = map.getSource(parcelSourceId) as GeoJSONSource | undefined;

  if (source) {
    source.setData(data);
    return;
  }

  map.addSource(parcelSourceId, {
    type: "geojson",
    data,
  });

  map.addLayer({
    id: parcelFillLayerId,
    type: "fill",
    source: parcelSourceId,
    paint: {
      "fill-color": "#f5c542",
      "fill-opacity": 0.34,
    },
  });

  map.addLayer({
    id: parcelLineLayerId,
    type: "line",
    source: parcelSourceId,
    paint: {
      "line-color": "#111827",
      "line-width": 2.5,
    },
  });

  map.addLayer({
    id: parcelLabelLayerId,
    type: "symbol",
    source: parcelSourceId,
    layout: {
      "text-field": ["get", "label"],
      "text-font": ["Noto Sans Regular"],
      "text-size": 14,
      "text-variable-anchor": ["top", "bottom", "left", "right"],
      "text-radial-offset": 0.5,
      "text-justify": "auto",
      "text-allow-overlap": true,
    },
    paint: {
      "text-color": "#0f172a",
      "text-halo-color": "#ffffff",
      "text-halo-width": 2.2,
      "text-halo-blur": 0.4,
    },
  });
}

function createParcelFeature(parcel: Parcel): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          id: parcel.id,
          block: parcel.block,
          parcel: parcel.parcel,
          label: createParcelLabel(parcel),
        },
        geometry: parcel.geometry,
      },
    ],
  };
}

function createParcelLabel(parcel: Parcel): string {
  const location = [parcel.neighborhood, parcel.district, parcel.city]
    .filter(Boolean)
    .join(" / ");
  const cadastral = [
    parcel.block ? `Ada ${parcel.block}` : undefined,
    parcel.parcel ? `Parsel ${parcel.parcel}` : undefined,
  ]
    .filter(Boolean)
    .join(" / ");

  if (location && cadastral) {
    return `${location}\n${cadastral}`;
  }

  return cadastral || location || parcel.id;
}
