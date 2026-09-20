import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  unique
} from "drizzle-orm/pg-core";
import { states } from "./states.js";

export const cities = pgTable("cities", {
  id: uuid("id").defaultRandom().primaryKey(),

  stateId: uuid("state_id")
    .notNull()
    .references(() => states.id),

  name: varchar("name", {
    length: 150
  }).notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true
  }).defaultNow().notNull()
},
  (table) => [
    unique("cities_state_name_unique").on(
      table.stateId,
      table.name
    )
  ]);
