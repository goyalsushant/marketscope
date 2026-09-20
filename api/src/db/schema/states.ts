import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  unique
} from "drizzle-orm/pg-core";
import { countries } from "./countries.js";

export const states = pgTable(
  "states",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    countryId: uuid("country_id")
      .notNull()
      .references(() => countries.id),

    name: varchar("name", {
      length: 100
    }).notNull(),

    code: varchar("code", {
      length: 20
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true
    }).defaultNow().notNull()
  },
  (table) => [
    unique("states_country_name_unique").on(
      table.countryId,
      table.name
    )
  ]
);
