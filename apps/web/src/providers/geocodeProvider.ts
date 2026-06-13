export type GeocodeResult = {
  id: string;
  label: string;
  center: [number, number];
  city?: string;
  district?: string;
  neighborhood?: string;
};

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: Record<string, string | undefined>;
};

export async function searchAddress(query: string): Promise<GeocodeResult[]> {
  const trimmed = query.trim();

  if (trimmed.length < 3) {
    throw new Error("Adres aramak icin en az 3 karakter girin.");
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", trimmed);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "5");
  url.searchParams.set("countrycodes", "tr");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Adres arama basarisiz: ${response.status}`);
  }

  const results = (await response.json()) as NominatimResult[];

  return results
    .map(toGeocodeResult)
    .filter((result): result is GeocodeResult => result !== null);
}

function toGeocodeResult(result: NominatimResult): GeocodeResult | null {
  const lat = Number(result.lat);
  const lng = Number(result.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  const address = result.address ?? {};

  return {
    id: String(result.place_id),
    label: result.display_name,
    center: [lng, lat],
    city: address.province ?? address.city ?? address.town ?? address.state,
    district: address.county ?? address.district ?? address.city_district,
    neighborhood:
      address.neighbourhood ?? address.suburb ?? address.quarter ?? address.village,
  };
}
