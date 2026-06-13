import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { addFakeBuildingExtrusion } from "../map/addFakeBuildingExtrusion";
import { addParcelHighlight } from "../map/addParcelHighlight";
import { addParcelLayer } from "../map/addParcelLayer";
import { fitParcel } from "../map/flyToParcel";
import { baseMapStyle, setBasemapMode } from "../map/mapStyle";
import { applyWmsOverlay } from "../map/wmsOverlay";
import type { BasemapMode } from "../types/basemap";
import type { Parcel, ParcelMetrics } from "../types/parcel";
import type { WmsOverlay } from "../types/wms";

type MapSceneProps = {
  basemap: BasemapMode;
  wmsOverlay: WmsOverlay | null;
  isPickingCenter: boolean;
  parcel: Parcel | null;
  metrics: ParcelMetrics | null;
  onMapPick: (center: [number, number]) => void;
  onMapReady: (map: maplibregl.Map) => void;
};

export function MapScene({
  basemap,
  wmsOverlay,
  isPickingCenter,
  parcel,
  metrics,
  onMapPick,
  onMapReady,
}: MapSceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const loadedRef = useRef(false);
  const basemapRef = useRef(basemap);
  const wmsOverlayRef = useRef(wmsOverlay);
  const isPickingCenterRef = useRef(isPickingCenter);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: baseMapStyle,
      center: [29.0169, 41.0107],
      zoom: 10.8,
      pitch: 28,
      bearing: -18,
      attributionControl: false,
      canvasContextAttributes: {
        preserveDrawingBuffer: true,
      },
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    map.on("click", (event) => {
      if (!isPickingCenterRef.current) {
        return;
      }

      onMapPick([event.lngLat.lng, event.lngLat.lat]);
    });
    map.on("load", () => {
      loadedRef.current = true;
      setBasemapMode(map, basemapRef.current);
      applyWmsOverlay(map, wmsOverlayRef.current);
      onMapReady(map);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      loadedRef.current = false;
    };
  }, [onMapReady]);

  useEffect(() => {
    isPickingCenterRef.current = isPickingCenter;

    const map = mapRef.current;

    if (!map) {
      return;
    }

    map.getCanvas().style.cursor = isPickingCenter ? "crosshair" : "";
  }, [isPickingCenter]);

  useEffect(() => {
    const map = mapRef.current;
    basemapRef.current = basemap;

    if (!map || !loadedRef.current) {
      return;
    }

    setBasemapMode(map, basemap);
  }, [basemap]);

  useEffect(() => {
    const map = mapRef.current;
    wmsOverlayRef.current = wmsOverlay;

    if (!map || !loadedRef.current) {
      return;
    }

    applyWmsOverlay(map, wmsOverlay);
  }, [wmsOverlay]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !parcel || !metrics || !loadedRef.current) {
      return;
    }

    addParcelLayer(map, parcel);
    addParcelHighlight(map);
    addFakeBuildingExtrusion(map);
    fitParcel(map, metrics);
  }, [parcel, metrics]);

  return (
    <section className="map-workspace" aria-label="Harita sahnesi">
      <div ref={containerRef} className="map-canvas" />
      {isPickingCenter ? (
        <div className="pick-banner">Haritada parsel merkezine tikla</div>
      ) : null}
      <div className="map-overlay">
        <span>MapLibre GL</span>
        <strong>{parcel ? parcelLabel(parcel) : "GeoJSON bekleniyor"}</strong>
      </div>
    </section>
  );
}

function parcelLabel(parcel: Parcel): string {
  const parts = [
    parcel.city,
    parcel.district,
    parcel.neighborhood,
    parcel.block ? `Ada ${parcel.block}` : undefined,
    parcel.parcel ? `Parsel ${parcel.parcel}` : undefined,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" / ") : parcel.id;
}
