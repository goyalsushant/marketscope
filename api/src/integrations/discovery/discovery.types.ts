export interface DiscoverySearchArea {
  south: number;
  west: number;
  north: number;
  east: number;
}

export interface DiscoveredStore {
  externalId: string;
  name: string;
  category: string;
  address: string | null;
  latitude: number;
  longitude: number;
}

export interface DiscoveryProvider {
  searchStores(
    category: string,
    area: DiscoverySearchArea
  ): Promise<DiscoveredStore[]>;
}
