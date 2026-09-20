export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeocodingResult extends Coordinates {
  displayName: string;
  osmType: string;
  osmId: number;
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

export interface NominatimPlaceResult {
  lat: string;
  lon: string;
  display_name: string;
  osm_type: string;
  osm_id: number;
  boundingbox: [string, string, string, string];
}
