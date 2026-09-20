import { eq, inArray, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import {
  searchPlace
} from "../geo/nominatim.client.js";
import {
  boundingBoxAreaKm2,
  constrainBoundingBox,
  MAX_BOUNDARY_AREA_KM2
} from "../geo/geo.geometry.js";
import type {
  BoundingBox,
  BoundaryPreview
} from "../geo/geo.types.js";
import { cities } from "../../db/schema/cities.js";
import { states } from "../../db/schema/states.js";
import { countries } from "../../db/schema/countries.js";
import { marketCategories, markets } from "../../db/schema/markets.js";
import { CreateMarketInput } from "./market.schema.js";
import { categories } from "../../db/schema/categories.js";
import { portfolioUploads } from "../../db/schema/portfolio.js";
import {
  getPortfolioStoresForMarket,
  processPortfolioGeo
} from "../portfolio/portfolio.geo.service.js";

export async function getBoundaryPreview(
  cityId: string
): Promise<BoundaryPreview> {
  const rows = await db
    .select({
      city: cities.name,
      state: states.name,
      country: countries.name
    })
    .from(cities)
    .innerJoin(
      states,
      eq(cities.stateId, states.id)
    )
    .innerJoin(
      countries,
      eq(states.countryId, countries.id)
    )
    .where(eq(cities.id, cityId));

  const location = rows[0];

  if (!location) {
    throw new Error("City not found");
  }

  const place = await searchPlace(
    `${location.city}, ${location.state}, ${location.country}`
  );

  if (!place) {
    throw new Error(
      "Unable to determine boundary for selected city"
    );
  }

  const [
    south,
    north,
    west,
    east
  ] = place.boundingbox.map(Number);

  const cityBounds: BoundingBox = {
    south,
    north,
    west,
    east
  };

  const bounds = constrainBoundingBox(cityBounds);

  return {
    bounds,
    areaKm2: boundingBoxAreaKm2(bounds)
  };
}

export class MarketValidationError
  extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MarketValidationError";
  }
}

export async function createMarket(
  input: CreateMarketInput
) {
  const areaKm2 =
    boundingBoxAreaKm2(input.boundary);

  if (areaKm2 > MAX_BOUNDARY_AREA_KM2) {
    throw new MarketValidationError(
      `Market boundary cannot exceed ${MAX_BOUNDARY_AREA_KM2} km²`
    );
  }

  const city = await db.query.cities.findFirst({
    where: eq(cities.id, input.cityId)
  });

  if (!city) {
    throw new MarketValidationError(
      "Selected city does not exist"
    );
  }

  const upload =
    await db.query.portfolioUploads.findFirst({
      where: eq(
        portfolioUploads.id,
        input.portfolioUploadId
      )
    });

  if (!upload) {
    throw new MarketValidationError(
      "Portfolio upload does not exist"
    );
  }

  const selectedCategories =
    await db.query.categories.findMany({
      where: inArray(
        categories.id,
        input.categoryIds
      )
    });

  if (
    selectedCategories.length !==
    input.categoryIds.length
  ) {
    throw new MarketValidationError(
      "One or more selected categories do not exist"
    );
  }

  const marketName =
    `${city.name} Market`;

  // return db.transaction(async (tx) => {
  //   const [market] = await tx
  //     .insert(markets)
  //     .values({
  //       cityId: input.cityId,
  //       portfolioUploadId:
  //         input.portfolioUploadId,
  //       name: marketName,
  //       boundary: sql`ST_SetSRID(
  //         ST_MakeEnvelope(
  //           ${input.boundary.west},
  //           ${input.boundary.south},
  //           ${input.boundary.east},
  //           ${input.boundary.north}
  //         ),
  //         4326
  //       )::geography`
  //     })
  //     .returning();

  //   await tx.insert(marketCategories)
  //     .values(
  //       input.categoryIds.map(
  //         (categoryId) => ({
  //           marketId: market.id,
  //           categoryId
  //         })
  //       )
  //     );

  //   return {
  //     id: market.id,
  //     name: market.name,
  //     cityId: market.cityId,
  //     portfolioUploadId:
  //       market.portfolioUploadId,
  //     categoryIds: input.categoryIds,
  //     boundary: input.boundary,
  //     areaKm2
  //   };
  // });

  const market = await db.transaction(
    async (tx) => {
      const [createdMarket] =
        await tx
          .insert(markets)
          .values({
            cityId: input.cityId,
            portfolioUploadId:
              input.portfolioUploadId,
            name: marketName,
            boundary: sql`
            ST_SetSRID(
              ST_MakeEnvelope(
                ${input.boundary.west},
                ${input.boundary.south},
                ${input.boundary.east},
                ${input.boundary.north}
              ),
              4326
            )::geography
          `
          })
          .returning();

      if (!createdMarket) {
        throw new Error(
          "Failed to create market"
        );
      }

      await tx
        .insert(marketCategories)
        .values(
          input.categoryIds.map(
            (categoryId) => ({
              marketId:
                createdMarket.id,
              categoryId
            })
          )
        );

      return createdMarket;
    }
  );

  const portfolioGeo =
    await processPortfolioGeo(
      input.portfolioUploadId
    );
  return {
    id: market.id,
    name: market.name,
    cityId: market.cityId,
    portfolioUploadId:
      market.portfolioUploadId,
    categoryIds: input.categoryIds,
    boundary: input.boundary,
    areaKm2,
    portfolioGeo
  };


}

// export async function getMarketPortfolio(
//   marketId: string
// ) {
//   const [market] = await db
//     .select({
//       id: markets.id,
//       portfolioUploadId:
//         markets.portfolioUploadId
//     })
//     .from(markets)
//     .where(
//       eq(markets.id, marketId)
//     )
//     .limit(1);

//   if (!market) {
//     return null;
//   }

//   const stores =
//     await getPortfolioStoresForMarket(
//       market.portfolioUploadId,
//       market.id
//     );

//   return {
//     marketId: market.id,
//     stores
//   };
// }

export async function getMarketPortfolio(
  marketId: string
) {
  const [market] = await db
    .select({
      id: markets.id,

      portfolioUploadId:
        markets.portfolioUploadId,

      south: sql<number>`
        ST_YMin(
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

      north: sql<number>`
        ST_YMax(
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

  if (!market) {
    return null;
  }

  const stores =
    await getPortfolioStoresForMarket(
      market.portfolioUploadId,
      market.id
    );

  return {
    marketId: market.id,

    boundary: {
      south: Number(market.south),
      west: Number(market.west),
      north: Number(market.north),
      east: Number(market.east)
    },

    stores
  };
}
