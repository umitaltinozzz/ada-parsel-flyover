import { useState } from "react";
import type { FormEvent } from "react";
import { Layers, Trash2, TriangleAlert } from "lucide-react";
import type { WmsOverlay } from "../types/wms";

type WmsLayerFormProps = {
  value: WmsOverlay | null;
  onChange: (overlay: WmsOverlay | null) => void;
};

export function WmsLayerForm({ value, onChange }: WmsLayerFormProps) {
  const [endpoint, setEndpoint] = useState(value?.endpoint ?? "");
  const [layers, setLayers] = useState(value?.layers ?? "");
  const [opacity, setOpacity] = useState(value?.opacity ?? 0.72);
  const [error, setError] = useState<string | null>(null);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      const normalizedEndpoint = new URL(endpoint.trim()).toString();
      const normalizedLayers = layers.trim();

      if (!normalizedLayers) {
        throw new Error("WMS layer adi zorunlu.");
      }

      onChange({
        endpoint: normalizedEndpoint,
        layers: normalizedLayers,
        opacity: clampOpacity(opacity),
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "WMS katmani eklenemedi.");
    }
  };

  return (
    <section className="panel-section">
      <div className="section-title">
        <h2>WMS harita katmani</h2>
        <span>{value ? "Aktif" : "Opsiyonel"}</span>
      </div>

      <form className="endpoint-form" onSubmit={submit}>
        <label>
          <span>
            <Layers size={14} aria-hidden="true" />
            WMS URL
          </span>
          <input
            type="url"
            value={endpoint}
            placeholder="https://.../wms"
            onChange={(event) => setEndpoint(event.target.value)}
            required
          />
        </label>

        <label>
          <span>Layer adi</span>
          <input
            type="text"
            value={layers}
            placeholder="ortofoto veya layer:name"
            onChange={(event) => setLayers(event.target.value)}
            required
          />
        </label>

        <label>
          <span>Opaklik {Math.round(opacity * 100)}%</span>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={opacity}
            onChange={(event) => setOpacity(Number(event.target.value))}
          />
        </label>

        <button className="secondary-button" type="submit">
          <Layers size={17} aria-hidden="true" />
          WMS katmanini uygula
        </button>
      </form>

      {value ? (
        <button className="ghost-button" type="button" onClick={() => onChange(null)}>
          <Trash2 size={16} aria-hidden="true" />
          WMS katmanini kaldir
        </button>
      ) : null}

      <p className="section-note">
        WMS servisi CORS izni vermeli ve EPSG:3857 GetMap isteklerini
        desteklemeli.
      </p>

      {error ? (
        <p className="inline-error" role="alert">
          <TriangleAlert size={16} aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </section>
  );
}

function clampOpacity(value: number): number {
  return Math.min(1, Math.max(0.1, value));
}
