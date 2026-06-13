import { useState } from "react";
import { FileUp, Map, TriangleAlert } from "lucide-react";
import { loadParcelFromFile, loadParcelFromUrl } from "../providers/geojsonProvider";
import { loadParcelFromKmlFile } from "../providers/kmlProvider";
import { loadParcelFromShapefileZip } from "../providers/shapefileProvider";
import type { Parcel } from "../types/parcel";

type ParcelFormProps = {
  onParcelLoaded: (parcel: Parcel) => void;
};

export function ParcelForm({ onParcelLoaded }: ParcelFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadFile = async (file: File) => {
    setError(null);
    setIsLoading(true);

    try {
      onParcelLoaded(await loadParcelFromSupportedFile(file));
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Parsel dosyasi okunamadi.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadSample = async () => {
    setError(null);
    setIsLoading(true);

    try {
      onParcelLoaded(
        await loadParcelFromUrl("sample-parcels/parcel-istanbul.geojson"),
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Ornek veri yuklenemedi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="panel-section">
      <div className="section-title">
        <h2>Parsel verisi</h2>
        <span>{isLoading ? "Yukleniyor" : "GeoJSON / KML / SHP"}</span>
      </div>

      <label className="upload-zone">
        <FileUp size={22} aria-hidden="true" />
        <span>GeoJSON, KML veya Shapefile ZIP sec</span>
        <input
          type="file"
          accept=".geojson,.json,.kml,.zip,application/geo+json,application/json,application/vnd.google-earth.kml+xml,application/zip"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              void loadFile(file);
            }
          }}
        />
      </label>

      <button className="secondary-button" type="button" onClick={loadSample}>
        <Map size={17} aria-hidden="true" />
        Ornek Istanbul parselini ac
      </button>

      {error ? (
        <p className="inline-error" role="alert">
          <TriangleAlert size={16} aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </section>
  );
}

async function loadParcelFromSupportedFile(file: File): Promise<Parcel> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "kml") {
    return loadParcelFromKmlFile(file);
  }

  if (extension === "zip") {
    return loadParcelFromShapefileZip(file);
  }

  return loadParcelFromFile(file);
}
