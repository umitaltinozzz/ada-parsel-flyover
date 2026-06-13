import type { CameraPath } from "../types/camera";
import type { ParcelMetrics } from "../types/parcel";

export function createCameraPath(metrics: ParcelMetrics): CameraPath {
  const [west, south, east, north] = metrics.bbox;
  const span = Math.max(Math.abs(east - west), Math.abs(north - south));
  const closeZoom = span > 0.02 ? 15 : span > 0.005 ? 16.5 : 17.5;

  return {
    startZoom: Math.max(10, closeZoom - 4),
    endZoom: closeZoom,
    pitch: 58,
    bearingStart: -35,
    bearingEnd: 325,
    duration: 15000,
  };
}
