import { parseParcelGeoJson } from "../geo/normalizeGeometry";
import type { Parcel } from "../types/parcel";

export type AuthorizedTkgmConfig = {
  endpoint: string;
  token?: string;
};

export async function loadAuthorizedTkgmProvider(
  config: AuthorizedTkgmConfig,
): Promise<Parcel> {
  const endpoint = normalizeAuthorizedEndpoint(config.endpoint);
  const response = await fetch(endpoint, {
    headers: config.token
      ? {
          Authorization: `Bearer ${config.token}`,
        }
      : undefined,
  });

  if (!response.ok) {
    throw new Error(`Resmi servis cevap vermedi: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("json")) {
    throw new Error(
      "Servis GeoJSON/JSON döndürmeli. WFS için outputFormat=application/json kullanın.",
    );
  }

  const json = (await response.json()) as unknown;

  return parseParcelGeoJson(json, "authorized_tkgm");
}

function normalizeAuthorizedEndpoint(endpoint: string): string {
  const trimmed = endpoint.trim();

  if (!trimmed) {
    throw new Error("Resmi servis URL'si zorunlu.");
  }

  const url = new URL(trimmed);

  if (
    url.searchParams.get("service")?.toLowerCase() === "wfs" &&
    !url.searchParams.has("outputFormat")
  ) {
    url.searchParams.set("outputFormat", "application/json");
  }

  return url.toString();
}
