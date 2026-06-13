import { Map, Satellite } from "lucide-react";
import type { BasemapMode } from "../types/basemap";

type BasemapToggleProps = {
  value: BasemapMode;
  onChange: (value: BasemapMode) => void;
};

export function BasemapToggle({ value, onChange }: BasemapToggleProps) {
  return (
    <section className="panel-section">
      <div className="section-title">
        <h2>Harita altligi</h2>
        <span>{value === "satellite" ? "Uydu" : "Harita"}</span>
      </div>

      <div className="segmented-control" role="group" aria-label="Harita altligi">
        <button
          type="button"
          className={value === "map" ? "active" : ""}
          onClick={() => onChange("map")}
        >
          <Map size={17} aria-hidden="true" />
          Harita
        </button>
        <button
          type="button"
          className={value === "satellite" ? "active" : ""}
          onClick={() => onChange("satellite")}
        >
          <Satellite size={17} aria-hidden="true" />
          Uydu
        </button>
      </div>
    </section>
  );
}
