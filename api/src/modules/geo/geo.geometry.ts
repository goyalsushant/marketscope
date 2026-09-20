import type { BoundingBox } from "./geo.types.js";

const EARTH_RADIUS_KM = 6371;
export const MAX_BOUNDARY_AREA_KM2 = 30;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function haversineDistanceKm(
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
  box: BoundingBox
) {
  const height = haversineDistanceKm(
    box.south,
    box.west,
    box.north,
    box.west
  );

  const width = haversineDistanceKm(
    box.south,
    box.west,
    box.south,
    box.east
  );

  return height * width;
}

// export function constrainBoundingBox(
//   box: BoundingBox
// ): BoundingBox {
//   const area = boundingBoxAreaKm2(box);

//   if (area <= MAX_BOUNDARY_AREA_KM2) {
//     return box;
//   }

//   const centerLat = (box.south + box.north) / 2;
//   const centerLon = (box.west + box.east) / 2;

//   const originalHeight = haversineDistanceKm(
//     box.south,
//     centerLon,
//     box.north,
//     centerLon
//   );

//   const originalWidth = haversineDistanceKm(
//     centerLat,
//     box.west,
//     centerLat,
//     box.east
//   );

//   const scale = Math.sqrt(
//     MAX_BOUNDARY_AREA_KM2 /
//       (originalWidth * originalHeight)
//   );

//   const height = originalHeight * scale;
//   const width = originalWidth * scale;

//   const latDelta = height / 111;
//   const lonDelta =
//     width /
//     (111 * Math.cos(toRadians(centerLat)));

//   return {
//     south: centerLat - latDelta / 2,
//     north: centerLat + latDelta / 2,
//     west: centerLon - lonDelta / 2,
//     east: centerLon + lonDelta / 2
//   };
// }

export function constrainBoundingBox(
  box: BoundingBox
): BoundingBox {
  const area = boundingBoxAreaKm2(box);

  if (area <= MAX_BOUNDARY_AREA_KM2) {
    return box;
  }

  const centerLat = (box.south + box.north) / 2;
  const centerLon = (box.west + box.east) / 2;

  let low = 0;
  let high = 1;

  let best: BoundingBox = {
    south: centerLat,
    north: centerLat,
    west: centerLon,
    east: centerLon
  };

  for (let i = 0; i < 40; i++) {
    const scale = (low + high) / 2;

    const candidate: BoundingBox = {
      south:
        centerLat -
        ((box.north - box.south) * scale) / 2,

      north:
        centerLat +
        ((box.north - box.south) * scale) / 2,

      west:
        centerLon -
        ((box.east - box.west) * scale) / 2,

      east:
        centerLon +
        ((box.east - box.west) * scale) / 2
    };

    const candidateArea =
      boundingBoxAreaKm2(candidate);

    if (candidateArea <= MAX_BOUNDARY_AREA_KM2) {
      best = candidate;
      low = scale;
    } else {
      high = scale;
    }
  }

  return best;
}

