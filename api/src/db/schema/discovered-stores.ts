import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
  numeric
} from "drizzle-orm/pg-core";
import { markets } from "./markets.js";
import { geographyPoint } from "./geo.js";

export const discoveredStores = pgTable(
  "discovered_stores",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    marketId: uuid("market_id")
      .notNull()
      .references(() => markets.id),

    externalId: varchar("external_id", {
      length: 255
    }).notNull(),

    name: varchar("name", {
      length: 255
    }).notNull(),

    category: varchar("category", {
      length: 100
    }).notNull(),

    address: varchar("address", {
      length: 500
    }),

    latitude: numeric("latitude", {
      precision: 10,
      scale: 7
    }).notNull(),

    longitude: numeric("longitude", {
      precision: 10,
      scale: 7
    }).notNull(),


    location: geographyPoint("location"),

    createdAt: timestamp("created_at", {
      withTimezone: true
    }).defaultNow().notNull()
  },
  (table) => [
    index("discovered_stores_market_idx").on(table.marketId)
  ]
);
