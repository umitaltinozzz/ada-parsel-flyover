import type { Map } from "maplibre-gl";
import { parcelFillLayerId, parcelSourceId } from "./addParcelLayer";

export const parcelExtrusionLayerId = "parcel-extrusion";

export function addFakeBuildingExtrusion(map: Map): void {
  if (map.getLayer(parcelExtrusionLayerId)) {
    return;
  }

  map.addLayer(
    {
      id: parcelExtrusionLayerId,
      type: "fill-extrusion",
      source: parcelSourceId,
      paint: {
        "fill-extrusion-color": "#2f6f73",
        "fill-extrusion-height": 18,
        "fill-extrusion-base": 0,
        "fill-extrusion-opacity": 0.28,
      },
    },
    parcelFillLayerId,
  );
}
