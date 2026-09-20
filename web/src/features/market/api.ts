import type {
  BoundaryPreview,
  Category,
  LocationOption,
  BoundingBox,
  CreateMarketInput,
  CreatedMarket
} from "./types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "http://localhost:3000";

async function request<T>(
  path: string
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${path}`
  );

  if (!response.ok) {
    const body = await response.json().catch(() => null);

    throw new Error(
      body?.message ??
        `Request failed with status ${response.status}`
    );
  }

  return response.json();
}

export function getCountries() {
  return request<LocationOption[]>(
    "/api/locations/countries"
  );
}

export function getStates(countryId: string) {
  return request<LocationOption[]>(
    `/api/locations/countries/${countryId}/states`
  );
}

export function getCities(stateId: string) {
  return request<LocationOption[]>(
    `/api/locations/states/${stateId}/cities`
  );
}

export function getCategories() {
  return request<Category[]>(
    "/api/categories"
  );
}

export function getBoundaryPreview(
  cityId: string
) {
  return request<BoundaryPreview>(
    `/api/markets/boundary-preview?cityId=${encodeURIComponent(cityId)}`
  );
}

export async function createMarket(
  input: CreateMarketInput
): Promise<CreatedMarket> {
  const response = await fetch(
    `${API_BASE_URL}/api/markets`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(input)
    }
  );

  const body = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      body?.message ??
        "Failed to create market"
    );
  }

  return body.market;
}