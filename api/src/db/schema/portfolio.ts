import {
  pgTable,
  uuid,
  varchar,
  numeric,
  timestamp,
  index
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { geographyPoint } from "./geo.js";
import { categories } from "./categories.js";

export const portfolioUploads = pgTable(
  "portfolio_uploads",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    fileName: varchar("file_name", {
      length: 255
    }).notNull(),

    rowCount: numeric("row_count", {
      precision: 10,
      scale: 0
    }).notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true
    }).defaultNow().notNull()
  }
);

export const portfolioStores = pgTable(
  "portfolio_stores",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    uploadId: uuid("upload_id")
      .notNull()
      .references(() => portfolioUploads.id),

    storeName: varchar("store_name", {
      length: 255
    }).notNull(),

    address: varchar("address", {
      length: 500
    }).notNull(),

    city: varchar("city", {
      length: 150
    }).notNull(),

    state: varchar("state", {
      length: 150
    }).notNull(),

    country: varchar("country", {
      length: 150
    }).notNull(),

    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id),

    latitude: numeric("latitude", {
      precision: 10,
      scale: 7
    }),

    longitude: numeric("longitude", {
      precision: 10,
      scale: 7
    }),
    location: geographyPoint("location"),


    createdAt: timestamp("created_at", {
      withTimezone: true
    }).defaultNow().notNull()
  },
  (table) => [
    index("portfolio_stores_upload_idx").on(table.uploadId),
    index("portfolio_stores_category_idx").on(table.categoryId)
  ]
);
