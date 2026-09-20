export interface LocationOption {
  id: string;
  name: string;
  code?: string;
}

export interface BoundingBox {
  south: number;
  west: number;
  north: number;
  east: number;
}

export interface BoundaryPreview {
  bounds: BoundingBox;
  areaKm2: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface CreateMarketInput {
  cityId: string;
  categoryIds: string[];
  portfolioUploadId: string;
  boundary: BoundingBox;
}

export interface CreatedMarket {
  id: string;
  name: string;
  cityId: string;
  portfolioUploadId: string;
  categoryIds: string[];
  boundary: BoundingBox;
  areaKm2: number;
}