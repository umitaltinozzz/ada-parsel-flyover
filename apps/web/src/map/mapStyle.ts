import type { Map, StyleSpecification } from "maplibre-gl";
import type { BasemapMode } from "../types/basemap";

export const cartoBaseLayerId = "carto-light-base";
export const satelliteBaseLayerId = "esri-world-imagery-base";

export const baseMapStyle: StyleSpecification = {
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    carto: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors © CARTO",
    },
    satellite: {
      type: "raster",
      tiles: [
        "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution:
        "Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    },
  },
  layers: [
    {
      id: cartoBaseLayerId,
      type: "raster",
      source: "carto",
    },
    {
      id: satelliteBaseLayerId,
      type: "raster",
      source: "satellite",
      layout: {
        visibility: "none",
      },
    },
  ],
};

export function setBasemapMode(map: Map, mode: BasemapMode): void {
  if (!map.getLayer(cartoBaseLayerId) || !map.getLayer(satelliteBaseLayerId)) {
    return;
  }

  map.setLayoutProperty(
    cartoBaseLayerId,
    "visibility",
    mode === "map" ? "visible" : "none",
  );
  map.setLayoutProperty(
    satelliteBaseLayerId,
    "visibility",
    mode === "satellite" ? "visible" : "none",
  );
}
