import type { Map } from "maplibre-gl";
import { parcelFillLayerId } from "./addParcelLayer";
import { parcelExtrusionLayerId } from "./addFakeBuildingExtrusion";
import type { WmsOverlay } from "../types/wms";

export const wmsSourceId = "wms-overlay-source";
export const wmsLayerId = "wms-overlay-layer";

export function applyWmsOverlay(map: Map, overlay: WmsOverlay | null): void {
  removeWmsOverlay(map);

  if (!overlay) {
    return;
  }

  map.addSource(wmsSourceId, {
    type: "raster",
    tiles: [createWmsTileUrl(overlay)],
    tileSize: 256,
  });

  map.addLayer(
    {
      id: wmsLayerId,
      type: "raster",
      source: wmsSourceId,
      paint: {
        "raster-opacity": overlay.opacity,
      },
    },
    map.getLayer(parcelExtrusionLayerId)
      ? parcelExtrusionLayerId
      : map.getLayer(parcelFillLayerId)
        ? parcelFillLayerId
        : undefined,
  );
}

export function removeWmsOverlay(map: Map): void {
  if (map.getLayer(wmsLayerId)) {
    map.removeLayer(wmsLayerId);
  }

  if (map.getSource(wmsSourceId)) {
    map.removeSource(wmsSourceId);
  }
}

function createWmsTileUrl(overlay: WmsOverlay): string {
  const url = new URL(overlay.endpoint.trim());

  url.searchParams.set("service", "WMS");
  url.searchParams.set("request", "GetMap");
  url.searchParams.set("version", "1.1.1");
  url.searchParams.set("layers", overlay.layers.trim());
  url.searchParams.set("styles", url.searchParams.get("styles") ?? "");
  url.searchParams.set("format", url.searchParams.get("format") ?? "image/png");
  url.searchParams.set("transparent", "true");
  url.searchParams.set("width", "256");
  url.searchParams.set("height", "256");
  url.searchParams.set("srs", "EPSG:3857");
  url.searchParams.delete("crs");
  url.searchParams.set("bbox", "{bbox-epsg-3857}");

  return url.toString();
}
