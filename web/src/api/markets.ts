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

export async function getMarketPortfolio(
  marketId: string
): Promise<MarketPortfolioResponse> {
  const response = await fetch(
    `/api/markets/${marketId}/portfolio`
  );

  if (!response.ok) {
    let message =
      "Failed to load market portfolio";

    try {
      const body =
        await response.json();

      if (
        body &&
        typeof body.message ===
        "string"
      ) {
        message = body.message;
      }
    } catch {
      // Keep default error message.
    }

    throw new Error(message);
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
) {
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

  return response.json() as Promise<{
    marketId: string;
    stores: DiscoveredStore[];
  }>;
}

export async function getDiscoveredStores(
  marketId: string
) {
  const response = await fetch(
    `/api/markets/${marketId}/discovered-stores`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load discovered stores"
    );
  }

  return response.json() as Promise<{
    marketId: string;
    stores: DiscoveredStore[];
  }>;
}
