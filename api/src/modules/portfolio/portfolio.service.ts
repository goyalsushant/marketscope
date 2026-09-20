import { eq, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import {
  portfolioStores,
  portfolioUploads
} from "../../db/schema/portfolio.js";
import { categories } from "../../db/schema/categories.js";
import type { PortfolioRow } from "./portfolio.types.js";

export async function createPortfolioUpload(
  fileName: string,
  rows: PortfolioRow[]
) {
  return db.transaction(async (tx) => {
    const categoryRows = await tx
      .select({
        id: categories.id,
        name: categories.name
      })
      .from(categories);

    const categoryMap = new Map(
      categoryRows.map((category) => [
        category.name.trim().toLowerCase(),
        category.id
      ])
    );

    const unknownCategories = [
      ...new Set(
        rows
          .filter(
            (row) =>
              !categoryMap.has(row.category.trim().toLowerCase())
          )
          .map((row) => row.category)
      )
    ];

    if (unknownCategories.length > 0) {
      throw new Error(
        `Unknown categories: ${unknownCategories.join(", ")}`
      );
    }

    const [upload] = await tx
      .insert(portfolioUploads)
      .values({
        fileName,
        rowCount: String(rows.length)
      })
      .returning();

    if (!upload) {
      throw new Error("Unable to create portfolio upload");
    }

    // await tx.insert(portfolioStores).values(
    //   rows.map((row) => ({
    //     uploadId: upload.id,
    //     storeName: row.storeName,
    //     address: row.address,
    //     city: row.city,
    //     state: row.state,
    //     country: row.country,
    //     categoryId: categoryMap.get(
    //       row.category.trim().toLowerCase()
    //     )!,
    //     latitude:
    //       row.latitude === null
    //         ? null
    //         : String(row.latitude),
    //     longitude:
    //       row.longitude === null
    //         ? null
    //         : String(row.longitude)
    //   }))
    // );

    const insertedStores = await tx
      .insert(portfolioStores)
      .values(
        rows.map((row) => ({
          uploadId: upload.id,
          storeName: row.storeName,
          address: row.address,
          city: row.city,
          state: row.state,
          country: row.country,
          categoryId: categoryMap.get(
            row.category.trim().toLowerCase()
          )!,
          latitude:
            row.latitude === null
              ? null
              : String(row.latitude),
          longitude:
            row.longitude === null
              ? null
              : String(row.longitude)
        }))
      )
      .returning({
        id: portfolioStores.id,
        latitude: portfolioStores.latitude,
        longitude: portfolioStores.longitude
      });

    for (const store of insertedStores) {
      if (store.latitude === null || store.longitude === null) {
        continue;
      }

      await tx
        .update(portfolioStores)
        .set({
          location: sql`ST_SetSRID(
        ST_MakePoint(
          ${Number(store.longitude)},
          ${Number(store.latitude)}
        ),
        4326
      )::geography`
        })
        .where(eq(portfolioStores.id, store.id));
    }


    return {
      uploadId: upload.id,
      fileName: upload.fileName,
      rowCount: rows.length
    };
  });
}
