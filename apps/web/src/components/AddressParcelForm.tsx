import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { LocateFixed, MapPin, MousePointer2, Search, TriangleAlert } from "lucide-react";
import { createManualParcel } from "../geo/createManualParcel";
import { searchAddress } from "../providers/geocodeProvider";
import type { GeocodeResult } from "../providers/geocodeProvider";
import type { Parcel } from "../types/parcel";

type AddressParcelFormProps = {
  pickedCenter: [number, number] | null;
  isPickingCenter: boolean;
  onPickingCenterChange: (isPicking: boolean) => void;
  onParcelLoaded: (parcel: Parcel) => void;
};

export function AddressParcelForm({
  pickedCenter,
  isPickingCenter,
  onPickingCenterChange,
  onParcelLoaded,
}: AddressParcelFormProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [selected, setSelected] = useState<GeocodeResult | null>(null);
  const [widthMeters, setWidthMeters] = useState(55);
  const [depthMeters, setDepthMeters] = useState(40);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [block, setBlock] = useState("");
  const [parcel, setParcel] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const approximateArea = useMemo(
    () => Math.round(widthMeters * depthMeters),
    [widthMeters, depthMeters],
  );

  useEffect(() => {
    if (!pickedCenter) {
      return;
    }

    setLongitude(String(roundCoordinate(pickedCenter[0])));
    setLatitude(String(roundCoordinate(pickedCenter[1])));
    setError(null);
  }, [pickedCenter]);

  const submitSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSearching(true);

    try {
      const matches = await searchAddress(query);
      setResults(matches);
      setSelected(matches[0] ?? null);

      if (matches.length === 0) {
        setError("Adres icin sonuc bulunamadi.");
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Adres aranamadi.");
    } finally {
      setIsSearching(false);
    }
  };

  const createParcel = () => {
    if (!selected) {
      setError("Once bir adres sonucu secin.");
      return;
    }

    onParcelLoaded(
      createManualParcel({
        id: `address-${selected.id}`,
        center: selected.center,
        widthMeters,
        depthMeters,
        city: selected.city,
        district: selected.district,
        neighborhood: selected.neighborhood,
        block: block.trim() || undefined,
        parcel: parcel.trim() || undefined,
      }),
    );
  };

  const createCoordinateParcel = () => {
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setError("Gecerli enlem ve boylam girin.");
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError("Koordinat araligi gecersiz.");
      return;
    }

    setError(null);
    onParcelLoaded(
      createManualParcel({
        id: `coordinate-${lng.toFixed(5)}-${lat.toFixed(5)}`,
        center: [lng, lat],
        widthMeters,
        depthMeters,
        block: block.trim() || undefined,
        parcel: parcel.trim() || undefined,
      }),
    );
  };

  return (
    <section className="panel-section">
      <div className="section-title">
        <h2>Adres ile parsel</h2>
        <span>{isSearching ? "Araniyor" : "Koordinat"}</span>
      </div>

      <form className="endpoint-form" onSubmit={submitSearch}>
        <label>
          <span>
            <Search size={14} aria-hidden="true" />
            Adres
          </span>
          <input
            type="search"
            value={query}
            placeholder="Ilce, mahalle, sokak veya tam adres"
            onChange={(event) => setQuery(event.target.value)}
            required
          />
        </label>

        <button className="secondary-button" type="submit" disabled={isSearching}>
          <LocateFixed size={17} aria-hidden="true" />
          Adres ara
        </button>
      </form>

      {results.length > 0 ? (
        <div className="result-list" role="listbox" aria-label="Adres sonuclari">
          {results.map((result) => (
            <button
              key={result.id}
              type="button"
              className={selected?.id === result.id ? "active" : ""}
              onClick={() => setSelected(result)}
            >
              <MapPin size={15} aria-hidden="true" />
              <span>{result.label}</span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="settings-grid">
        <label>
          <span>Enlem</span>
          <input
            type="number"
            step="any"
            value={latitude}
            placeholder="41.0069"
            onChange={(event) => setLatitude(event.target.value)}
          />
        </label>
        <label>
          <span>Boylam</span>
          <input
            type="number"
            step="any"
            value={longitude}
            placeholder="28.9787"
            onChange={(event) => setLongitude(event.target.value)}
          />
        </label>
        <label>
          <span>Genislik m</span>
          <input
            type="number"
            min={5}
            max={1000}
            value={widthMeters}
            onChange={(event) => setWidthMeters(Number(event.target.value))}
          />
        </label>
        <label>
          <span>Derinlik m</span>
          <input
            type="number"
            min={5}
            max={1000}
            value={depthMeters}
            onChange={(event) => setDepthMeters(Number(event.target.value))}
          />
        </label>
        <label>
          <span>Ada</span>
          <input
            type="text"
            value={block}
            placeholder="Opsiyonel"
            onChange={(event) => setBlock(event.target.value)}
          />
        </label>
        <label>
          <span>Parsel</span>
          <input
            type="text"
            value={parcel}
            placeholder="Opsiyonel"
            onChange={(event) => setParcel(event.target.value)}
          />
        </label>
      </div>

      <div className="area-readout">
        Yaklasik alan: <strong>{approximateArea.toLocaleString("tr-TR")} m2</strong>
      </div>

      <button
        className="primary-button"
        type="button"
        disabled={!selected}
        onClick={createParcel}
      >
        <MapPin size={17} aria-hidden="true" />
        Adresten demo parsel olustur
      </button>

      <button className="secondary-button" type="button" onClick={createCoordinateParcel}>
        <MapPin size={17} aria-hidden="true" />
        Koordinattan demo parsel olustur
      </button>

      <button
        className="secondary-button"
        type="button"
        onClick={() => onPickingCenterChange(!isPickingCenter)}
      >
        <MousePointer2 size={17} aria-hidden="true" />
        {isPickingCenter ? "Harita secimini iptal et" : "Haritadan merkez sec"}
      </button>

      <p className="section-note">
        Bu arac adres koordinatindan yaklasik dikdortgen parsel olusturur; resmi
        kadastro siniri yerine gecmez.
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

function roundCoordinate(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}
