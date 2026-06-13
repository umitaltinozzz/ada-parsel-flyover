import { useCallback, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Map } from "maplibre-gl";
import { Film, MapPinned, Ruler, ScanLine } from "lucide-react";
import { AddressParcelForm } from "./components/AddressParcelForm";
import { AuthorizedProviderForm } from "./components/AuthorizedProviderForm";
import { BasemapToggle } from "./components/BasemapToggle";
import { ParcelForm } from "./components/ParcelForm";
import { MapScene } from "./components/MapScene";
import { TimelineControls } from "./components/TimelineControls";
import { VideoExportButton } from "./components/VideoExportButton";
import { WmsLayerForm } from "./components/WmsLayerForm";
import { createCameraPath } from "./geo/createCameraPath";
import { getParcelMetrics } from "./geo/normalizeGeometry";
import { playParcelFlyover } from "./map/flyToParcel";
import type { Parcel } from "./types/parcel";
import type { BasemapMode } from "./types/basemap";
import type { CameraPath } from "./types/camera";
import { defaultVideoSettings } from "./types/video";
import type { VideoSettings } from "./types/video";
import type { WmsOverlay } from "./types/wms";

const sourceLabels: Record<Parcel["source"], string> = {
  authorized_tkgm: "İzinli TKGM",
  geojson: "GeoJSON",
  kml: "KML",
  shapefile: "Shapefile",
  manual: "Manuel",
  wfs: "WFS",
};

export function App() {
  const mapRef = useRef<Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [basemap, setBasemap] = useState<BasemapMode>("satellite");
  const [wmsOverlay, setWmsOverlay] = useState<WmsOverlay | null>(null);
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [pickedCenter, setPickedCenter] = useState<[number, number] | null>(null);
  const [isPickingCenter, setIsPickingCenter] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [cameraOverrides, setCameraOverrides] = useState<Partial<CameraPath>>({});
  const [videoSettings, setVideoSettings] = useState<VideoSettings>(
    defaultVideoSettings,
  );

  const metrics = useMemo(
    () => (parcel ? getParcelMetrics(parcel) : null),
    [parcel],
  );
  const baseCameraPath = useMemo(
    () => (metrics ? createCameraPath(metrics) : null),
    [metrics],
  );
  const cameraPath = useMemo(
    () =>
      baseCameraPath
        ? {
            ...baseCameraPath,
            ...cameraOverrides,
            duration: videoSettings.durationSeconds * 1000,
          }
        : null,
    [baseCameraPath, cameraOverrides, videoSettings.durationSeconds],
  );
  const videoMetadata = useMemo(
    () => ({
      title: parcel ? parcelTitle(parcel) : "Ada Parsel Flyover",
      subtitle: parcel ? parcelSubtitle(parcel) : "Harita tabanli flyover video",
    }),
    [parcel],
  );

  const playPreview = async () => {
    if (!mapRef.current || !metrics || !cameraPath || isAnimating) {
      return;
    }

    setProgress(0);
    setIsAnimating(true);
    const cancel = playParcelFlyover(
      mapRef.current,
      metrics,
      cameraPath,
      setProgress,
    );

    await wait(videoSettings.durationSeconds * 1000);
    cancel();
    setProgress(1);
    setIsAnimating(false);
  };

  const playForExport = async () => {
    if (!mapRef.current || !metrics || !cameraPath) {
      return;
    }

    setProgress(0);
    setIsAnimating(true);
    const cancel = playParcelFlyover(
      mapRef.current,
      metrics,
      cameraPath,
      setProgress,
    );

    await wait(videoSettings.durationSeconds * 1000);
    cancel();
    setProgress(1);
    setIsAnimating(false);
  };

  const handleMapReady = useCallback((map: Map) => {
    mapRef.current = map;
    setIsMapReady(true);
  }, []);

  return (
    <main className="app-shell">
      <aside className="control-panel" aria-label="Parsel video kontrolleri">
        <div className="brand-row">
          <div className="brand-mark">
            <MapPinned size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="eyebrow">Ada Parsel Flyover</p>
            <h1>Parselden harita videosu</h1>
          </div>
        </div>

        <ParcelForm onParcelLoaded={setParcel} />

        <AddressParcelForm
          pickedCenter={pickedCenter}
          isPickingCenter={isPickingCenter}
          onPickingCenterChange={setIsPickingCenter}
          onParcelLoaded={setParcel}
        />

        <AuthorizedProviderForm onParcelLoaded={setParcel} />

        <BasemapToggle value={basemap} onChange={setBasemap} />

        <WmsLayerForm value={wmsOverlay} onChange={setWmsOverlay} />

        <section className="panel-section metrics-grid" aria-label="Parsel">
          <Metric
            icon={<ScanLine size={17} aria-hidden="true" />}
            label="Kaynak"
            value={parcel ? sourceLabels[parcel.source] : "Bekleniyor"}
          />
          <Metric
            icon={<Ruler size={17} aria-hidden="true" />}
            label="Alan"
            value={
              metrics
                ? `${Math.round(metrics.areaSquareMeters).toLocaleString("tr-TR")} m2`
                : "-"
            }
          />
          <Metric
            icon={<Film size={17} aria-hidden="true" />}
            label="Sure"
            value={`${videoSettings.durationSeconds} sn`}
          />
        </section>

        <TimelineControls
          disabled={!parcel || !isMapReady || isAnimating}
          isPlaying={isAnimating}
          progress={progress}
          cameraPath={cameraPath}
          settings={videoSettings}
          onPlay={playPreview}
          onCameraPathChange={(nextPath) => setCameraOverrides(nextPath)}
          onSettingsChange={setVideoSettings}
        />

        <VideoExportButton
          disabled={!parcel || !isMapReady || isAnimating}
          map={mapRef.current}
          settings={videoSettings}
          metadata={videoMetadata}
          onExportPlay={playForExport}
        />
      </aside>

      <MapScene
        basemap={basemap}
        wmsOverlay={wmsOverlay}
        isPickingCenter={isPickingCenter}
        parcel={parcel}
        metrics={metrics}
        onMapPick={(center) => {
          setPickedCenter(center);
          setIsPickingCenter(false);
        }}
        onMapReady={handleMapReady}
      />
    </main>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="metric">
      <span className="metric-icon">{icon}</span>
      <span className="metric-label">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function parcelTitle(parcel: Parcel): string {
  const cadastral = [
    parcel.block ? `Ada ${parcel.block}` : undefined,
    parcel.parcel ? `Parsel ${parcel.parcel}` : undefined,
  ]
    .filter(Boolean)
    .join(" / ");

  return cadastral || parcel.id || "Ada Parsel Flyover";
}

function parcelSubtitle(parcel: Parcel): string {
  const location = [parcel.neighborhood, parcel.district, parcel.city]
    .filter(Boolean)
    .join(" / ");

  return location || sourceLabels[parcel.source];
}
