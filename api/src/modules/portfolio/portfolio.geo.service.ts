import { eq, sql } from "drizzle-orm";

import { db } from "../../db/client.js";
import {
  portfolioStores
} from "../../db/schema/portfolio.js";
import { markets } from "../../db/schema/markets.js";

import {
  searchPlace
} from "../geo/nominatim.client.js";
import { categories } from "../../db/schema/categories.js";

export interface PortfolioGeoResult {
  total: number;
  existingCoordinates: number;
  geocoded: number;
  geocodingFailed: number;
}

function pointFromCoordinates(
  latitude: number,
  longitude: number
) {
  return sql`
    ST_SetSRID(
      ST_MakePoint(
        ${longitude},
        ${latitude}
      ),
      4326
    )::geography
  `;
}

async function setStoreLocation(
  storeId: string,
  latitude: number,
  longitude: number
) {
  await db
    .update(portfolioStores)
    .set({
      latitude,
      longitude,
      location:
        pointFromCoordinates(
          latitude,
          longitude
        )
    })
    .where(
      eq(
        portfolioStores.id,
        storeId
      )
    );
}

async function geocodeStore(
  store: typeof portfolioStores.$inferSelect
) {
  const query = [
    store.address,
    store.city,
    store.state,
    store.country
  ]
    .filter(Boolean)
    .join(", ");

  const place =
    await searchPlace(query);

  if (!place) {
    return null;
  }

  const latitude =
    Number(place.lat);

  const longitude =
    Number(place.lon);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  return {
    latitude,
    longitude
  };
}

export async function processPortfolioGeo(
  uploadId: string
): Promise<PortfolioGeoResult> {
  const stores = await db
    .select()
    .from(portfolioStores)
    .where(
      eq(
        portfolioStores.uploadId,
        uploadId
      )
    );

  const result: PortfolioGeoResult = {
    total: stores.length,
    existingCoordinates: 0,
    geocoded: 0,
    geocodingFailed: 0
  };

  for (const store of stores) {
    if (
      store.latitude !== null &&
      store.longitude !== null
    ) {
      await setStoreLocation(
        store.id,
        Number(store.latitude),
        Number(store.longitude)
      );

      result.existingCoordinates++;

      continue;
    }

    const location =
      await geocodeStore(store);

    if (!location) {
      result.geocodingFailed++;
      continue;
    }

    await setStoreLocation(
      store.id,
      location.latitude,
      location.longitude
    );

    result.geocoded++;
  }

  return result;
}

// export async function getPortfolioStoresForMarket(
//   uploadId: string,
//   marketId: string
// ) {
//   return db
//     .select({
//       id: portfolioStores.id,
//       storeName:
//         portfolioStores.storeName,
//       categoryId:
//         portfolioStores.categoryId,
//       latitude:
//         portfolioStores.latitude,
//       longitude:
//         portfolioStores.longitude,

//       insideBoundary: sql<boolean>`
//         CASE
//           WHEN ${portfolioStores.location} IS NULL
//             THEN false
//           ELSE ST_Covers(
//             (
//               SELECT boundary::geometry
//               FROM markets
//               WHERE id = ${marketId}
//             ),
//             ${portfolioStores.location}::geometry
//           )
//         END
//       `
//     })
//     .from(portfolioStores)
//     .where(
//       eq(
//         portfolioStores.uploadId,
//         uploadId
//       )
//     );
// }

export async function getPortfolioStoresForMarket(
  uploadId: string,
  marketId: string
) {
  return db
    .select({
      id: portfolioStores.id,
      storeName: portfolioStores.storeName,
      address: portfolioStores.address,
      city: portfolioStores.city,
      state: portfolioStores.state,
      country: portfolioStores.country,
      categoryId: portfolioStores.categoryId,
      category: categories.name,
      latitude: portfolioStores.latitude,
      longitude: portfolioStores.longitude,
      insideBoundary: sql<boolean>`
        CASE
          WHEN ${portfolioStores.location} IS NULL
            THEN false
          ELSE ST_Covers(
            (
              SELECT boundary::geometry
              FROM markets
              WHERE id = ${marketId}
            ),
            ${portfolioStores.location}::geometry
          )
        END
      `
    })
    .from(portfolioStores)
    .innerJoin(
      categories,
      eq(
        portfolioStores.categoryId,
        categories.id
      )
    )
    .where(
      eq(
        portfolioStores.uploadId,
        uploadId
      )
    );
}

