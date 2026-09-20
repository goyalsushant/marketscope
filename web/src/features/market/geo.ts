import type { BoundingBox } from "./types";

const EARTH_RADIUS_KM = 6371;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return (
    2 *
    EARTH_RADIUS_KM *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )
  );
}

export function boundingBoxAreaKm2(
  bounds: BoundingBox
) {
  const height = haversineDistanceKm(
    bounds.south,
    bounds.west,
    bounds.north,
    bounds.west
  );

  const width = haversineDistanceKm(
    bounds.south,
    bounds.west,
    bounds.south,
    bounds.east
  );

  return height * width;
}
