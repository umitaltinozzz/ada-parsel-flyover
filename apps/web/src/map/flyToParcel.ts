import type { LngLatBoundsLike, Map } from "maplibre-gl";
import type { CameraPath } from "../types/camera";
import type { ParcelMetrics } from "../types/parcel";

export function fitParcel(map: Map, metrics: ParcelMetrics): void {
  const [west, south, east, north] = metrics.bbox;

  map.fitBounds(
    [
      [west, south],
      [east, north],
    ] as LngLatBoundsLike,
    {
      padding: 96,
      duration: 900,
      pitch: 38,
      bearing: -20,
    },
  );
}

export function playParcelFlyover(
  map: Map,
  metrics: ParcelMetrics,
  path: CameraPath,
  onProgress?: (progress: number) => void,
): () => void {
  const start = performance.now();
  const duration = path.duration;
  let frameId = 0;

  const tick = (now: number) => {
    const rawProgress = Math.min((now - start) / duration, 1);
    const progress = easeInOutCubic(rawProgress);
    const orbitProgress = Math.max(0, (rawProgress - 0.38) / 0.62);
    const bearing =
      path.bearingStart +
      (path.bearingEnd - path.bearingStart) * easeOutQuart(orbitProgress);
    const zoom =
      path.startZoom + (path.endZoom - path.startZoom) * easeOutQuad(progress);
    const pitch = 20 + (path.pitch - 20) * easeOutQuad(progress);

    map.jumpTo({
      center: metrics.center,
      zoom,
      pitch,
      bearing,
    });
    onProgress?.(rawProgress);

    if (rawProgress < 1) {
      frameId = requestAnimationFrame(tick);
    }
  };

  frameId = requestAnimationFrame(tick);

  return () => cancelAnimationFrame(frameId);
}

function easeInOutCubic(value: number): number {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function easeOutQuad(value: number): number {
  return 1 - (1 - value) * (1 - value);
}

function easeOutQuart(value: number): number {
  return 1 - Math.pow(1 - value, 4);
}
