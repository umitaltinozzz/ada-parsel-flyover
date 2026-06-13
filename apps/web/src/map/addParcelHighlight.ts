import type { Map } from "maplibre-gl";
import { parcelLineLayerId, parcelSourceId } from "./addParcelLayer";

export const parcelGlowLayerId = "parcel-glow";

export function addParcelHighlight(map: Map): void {
  if (map.getLayer(parcelGlowLayerId)) {
    return;
  }

  map.addLayer(
    {
      id: parcelGlowLayerId,
      type: "line",
      source: parcelSourceId,
      paint: {
        "line-color": "#ffd166",
        "line-width": 8,
        "line-blur": 5,
        "line-opacity": 0.85,
      },
    },
    parcelLineLayerId,
  );
}
