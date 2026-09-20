import type { Coordinates, GeocodingResult, NominatimPlaceResult } from "./geo.types.js";

const NOMINATIM_URL =
  "https://nominatim.openstreetmap.org";

const USER_AGENT =
  process.env.NOMINATIM_USER_AGENT ??
  "MarketScope/0.1.0";

const MIN_REQUEST_INTERVAL_MS = 1_100;

let lastRequestAt = 0;

async function waitForRateLimit() {
  const elapsed = Date.now() - lastRequestAt;

  if (elapsed < MIN_REQUEST_INTERVAL_MS) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL_MS - elapsed)
    );
  }

  lastRequestAt = Date.now();
}

async function request<T>(
  path: string,
  params: Record<string, string>
): Promise<T> {
  await waitForRateLimit();

  const url = new URL(
    `${NOMINATIM_URL}${path}`
  );

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(
      `Nominatim request failed with status ${response.status}`
    );
  }

  return response.json() as Promise<T>;
}

interface NominatimSearchResult {
  lat: string;
  lon: string;
  display_name: string;
  osm_type: string;
  osm_id: number;
}

export async function geocodeAddress(
  address: string,
  city: string,
  state: string,
  country: string
): Promise<GeocodingResult | null> {
  const results = await request<NominatimSearchResult[]>(
    "/search",
    {
      q: `${address}, ${city}, ${state}, ${country}`,
      format: "jsonv2",
      limit: "1",
      addressdetails: "1"
    }
  );

  const result = results[0];

  if (!result) {
    return null;
  }

  return {
    latitude: Number(result.lat),
    longitude: Number(result.lon),
    displayName: result.display_name,
    osmType: result.osm_type,
    osmId: result.osm_id
  };
}

export async function searchPlace(
  query: string
): Promise<NominatimPlaceResult | null> {
  const results = await request<NominatimPlaceResult[]>(
    "/search",
    {
      q: query,
      format: "jsonv2",
      limit: "1",
      addressdetails: "1"
    }
  );

  return results[0] ?? null;
}
