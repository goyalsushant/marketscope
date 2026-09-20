import type { BoundingBox } from "../features/market/types";

export interface PortfolioStore {
  id: string;
  storeName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  categoryId: string;
  category: string;
  latitude: string | null;
  longitude: string | null;
  insideBoundary: boolean;
}

export interface MarketPortfolioResponse {
  marketId: string;
  boundary: BoundingBox;
  stores: PortfolioStore[];
}

export interface DiscoveredStoresResponse {
  marketId: string;
  stores: DiscoveredStore[];
}

async function getErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  try {
    const body = await response.json();

    if (
      body &&
      typeof body.message === "string"
    ) {
      return body.message;
    }
  } catch {
    // Ignore invalid/non-JSON error responses.
  }

  return fallback;
}


export async function getMarketPortfolio(
  marketId: string
): Promise<MarketPortfolioResponse> {
  const response = await fetch(
    `/api/markets/${marketId}/portfolio`
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Failed to discover stores"
      )
    );
  }

  return response.json();
}

export interface DiscoveredStore {
  id: string;
  externalId: string;
  name: string;
  category: string;
  address: string | null;
  latitude: string;
  longitude: string;
}

export async function discoverStores(
  marketId: string
): Promise<DiscoveredStoresResponse> {
  const response = await fetch(
    `/api/markets/${marketId}/discovered-stores/discover`,
    {
      method: "POST"
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to discover stores"
    );
  }

  return response.json()
}

export async function getDiscoveredStores(
  marketId: string
): Promise<DiscoveredStoresResponse> {
  const response = await fetch(
    `/api/markets/${marketId}/discovered-stores`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load discovered stores"
    );
  }

  return response.json()
}
