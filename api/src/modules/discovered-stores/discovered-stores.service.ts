import {
  eq,
  inArray,
  sql
} from "drizzle-orm";

import { db } from "../../db/client.js";

import {
  discoveredStores
} from "../../db/schema/discovered-stores.js";

import {
  markets,
  marketCategories
} from "../../db/schema/markets.js";

import {
  categories
} from "../../db/schema/categories.js";

import {
  overpassDiscoveryProvider
} from "../../integrations/discovery/overpass.client.js";

export async function getDiscoveredStoresForMarket(
  marketId: string
) {
  return db
    .select({
      id: discoveredStores.id,
      externalId:
        discoveredStores.externalId,
      name: discoveredStores.name,
      category:
        discoveredStores.category,
      address:
        discoveredStores.address,
      latitude:
        discoveredStores.latitude,
      longitude:
        discoveredStores.longitude
    })
    .from(discoveredStores)
    .where(
      eq(
        discoveredStores.marketId,
        marketId
      )
    );
}

export async function discoverStoresForMarket(
  marketId: string
) {
  /*
   * Load the market boundary and make sure
   * the market exists.
   */
  const [market] = await db
    .select({
      id: markets.id,
      boundary: markets.boundary
    })
    .from(markets)
    .where(
      eq(markets.id, marketId)
    )
    .limit(1);

  if (!market) {
    throw new Error(
      "Market not found"
    );
  }

  /*
   * Extract the bounding box from the
   * PostGIS geography polygon.
   *
   * Our market boundary is created with
   * ST_MakeEnvelope(), so these four
   * values represent the editable market
   * boundary exactly.
   */
  const [boundary] = await db
    .select({
      south: sql<number>`
        ST_YMin(
          ST_Envelope(
            ${markets.boundary}::geometry
          )
        )
      `,
      north: sql<number>`
        ST_YMax(
          ST_Envelope(
            ${markets.boundary}::geometry
          )
        )
      `,
      west: sql<number>`
        ST_XMin(
          ST_Envelope(
            ${markets.boundary}::geometry
          )
        )
      `,
      east: sql<number>`
        ST_XMax(
          ST_Envelope(
            ${markets.boundary}::geometry
          )
        )
      `
    })
    .from(markets)
    .where(
      eq(markets.id, marketId)
    )
    .limit(1);

  if (!boundary) {
    throw new Error(
      "Unable to determine market boundary"
    );
  }

  /*
   * Load the categories selected when
   * the market was created.
   */
  const selectedCategories =
    await db
      .select({
        id: categories.id,
        name: categories.name
      })
      .from(marketCategories)
      .innerJoin(
        categories,
        eq(
          marketCategories.categoryId,
          categories.id
        )
      )
      .where(
        eq(
          marketCategories.marketId,
          marketId
        )
      );

  /*
   * Nothing to discover if the market has
   * no selected categories.
   */
  if (
    selectedCategories.length === 0
  ) {
    return [];
  }

  /*
   * Ask the discovery provider for each
   * selected category.
   */
  const discoveredResults =
    await Promise.all(
      selectedCategories.map(
        async (category) => {
          return overpassDiscoveryProvider
            .searchStores(
              category.name,
              boundary
            );
        }
      )
    );

  /*
   * Flatten all category results.
   */
  const discovered =
    discoveredResults.flat();

  /*
   * Remove duplicates returned by
   * multiple Overpass queries.
   *
   * externalId identifies the OSM object.
   */
  const uniqueStores =
    Array.from(
      new Map(
        discovered.map(
          (store) => [
            store.externalId,
            store
          ]
        )
      ).values()
    );

  /*
   * The Overpass query searches the
   * market's bounding box.
   *
   * Our market itself is also a rectangle,
   * so this additional check guarantees
   * that only stores actually inside the
   * market boundary are persisted.
   */
  const storesInsideBoundary =
    uniqueStores.filter(
      (store) =>
        store.latitude >=
        Number(boundary.south) &&
        store.latitude <=
        Number(boundary.north) &&
        store.longitude >=
        Number(boundary.west) &&
        store.longitude <=
        Number(boundary.east)
    );

  /*
   * Re-running discovery should replace
   * the previous discovery results rather
   * than create duplicates.
   */
  await db.transaction(
    async (tx) => {
      await tx
        .delete(discoveredStores)
        .where(
          eq(
            discoveredStores.marketId,
            marketId
          )
        );

      if (
        storesInsideBoundary.length === 0
      ) {
        return;
      }

      await tx
        .insert(discoveredStores)
        .values(
          storesInsideBoundary.map(
            (store) => ({
              marketId,

              externalId:
                store.externalId,

              name: store.name,

              category:
                store.category,

              address:
                store.address,

              latitude:
                String(
                  store.latitude
                ),

              longitude:
                String(
                  store.longitude
                ),

              location: sql`
                ST_SetSRID(
                  ST_MakePoint(
                    ${store.longitude},
                    ${store.latitude}
                  ),
                  4326
                )::geography
              `
            })
          )
        );
    }
  );

  return getDiscoveredStoresForMarket(
    marketId
  );
}
