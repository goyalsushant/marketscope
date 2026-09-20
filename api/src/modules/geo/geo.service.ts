import { sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import { portfolioStores } from "../../db/schema/portfolio.js";

export async function setPortfolioStoreLocation(
  storeId: string,
  latitude: number,
  longitude: number
) {
  await db
    .update(portfolioStores)
    .set({
      latitude: String(latitude),
      longitude: String(longitude),
      location: sql`ST_SetSRID(
        ST_MakePoint(
          ${longitude},
          ${latitude}
        ),
        4326
      )::geography`
    })
    .where(sql`${portfolioStores.id} = ${storeId}`);
}
