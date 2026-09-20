import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index
} from "drizzle-orm/pg-core";
import { cities } from "./cities.js";
import { categories } from "./categories.js";
import { geographyPolygon } from "./geo.js";
import { portfolioUploads } from "./portfolio.js";

export const markets = pgTable(
  "markets",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    cityId: uuid("city_id")
      .notNull()
      .references(() => cities.id),

    name: varchar("name", {
      length: 255
    }).notNull(),

    portfolioUploadId: uuid("portfolio_upload_id")
      .notNull()
      .references(() => portfolioUploads.id),


    boundary: geographyPolygon("boundary"),

    createdAt: timestamp("created_at", {
      withTimezone: true
    }).defaultNow().notNull()
  },
  (table) => [
    index("markets_city_idx").on(table.cityId)
  ]
);

export const marketCategories = pgTable(
  "market_categories",
  {
    marketId: uuid("market_id")
      .notNull()
      .references(() => markets.id),

    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id)
  }
);
